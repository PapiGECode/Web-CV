import test from 'node:test';
import assert from 'node:assert/strict';
import { allowedOrigin, boundedJson, memoryLimiter } from '../server/http.js';
import { createContactHandler, validateContact } from '../server/contact.js';
import { createMetricsHandler } from '../server/metrics.js';
const origin = 'https://www.pabloschefer.com';
const payload = { name: 'Prueba Técnica', email: 'test@example.com', message: 'Primera línea del mensaje.\n\nSegunda línea de prueba.', website: '', requestId: '12345678-1234-1234-1234-123456789012' };
const env = { RESEND_API_KEY: 'test-only', CONTACT_FROM: 'Portfolio <contacto@example.com>' };
function req(body = payload, method = 'POST', headers = {}) { return new Request(origin + '/api/contact', { method, headers: { origin, 'content-type': 'application/json', ...headers }, ...(method === 'POST' ? { body: JSON.stringify(body) } : {}) }); }
const quiet = () => {};
test('origin checks are exact; arbitrary Vercel hosts are rejected', () => {
  assert.equal(allowedOrigin(req()), true);
  assert.equal(allowedOrigin(req(payload, 'POST', { origin: 'https://www.pabloschefer.com.attacker.test' })), false);
  assert.equal(allowedOrigin(req(payload, 'POST', { origin: 'https://other.vercel.app' })), false);
  assert.equal(allowedOrigin(req(payload, 'POST', { origin: 'https://preview.vercel.app' }), { VERCEL_URL: 'preview.vercel.app' }), true);
});
test('validator preserves newlines and rejects field injection, lengths and honeypot', () => {
  assert.equal(validateContact(payload).value.message, payload.message);
  assert.ok(validateContact({ ...payload, email: 'a@b.com\r\nBcc: no@example.com' }).errors.email);
  assert.ok(validateContact({ ...payload, name: 'x\nInjected' }).errors.name);
  assert.ok(validateContact({ ...payload, message: 'a'.repeat(4001) }).errors.message);
  assert.ok(validateContact({ ...payload, website: 'bot.test' }).errors.form);
});
test('bounded JSON checks actual bytes, format and object type', async () => {
  await assert.rejects(() => boundedJson(req({ message: 'x'.repeat(2000) }), 30), e => e.status === 413);
  await assert.rejects(() => boundedJson(req([], 'POST')), e => e.status === 400);
  await assert.rejects(() => boundedJson(req({}, 'POST', { 'content-type': 'text/plain' })), e => e.status === 415);
});
test('contact exposes capability and never fakes delivery without credentials', async () => {
  const handler = createContactHandler();
  assert.equal((await (await handler(req(null, 'GET'))).json()).available, false);
  const res = await handler(req()); assert.equal(res.status, 503);
  assert.equal((await res.json()).mode, 'unavailable');
});
test('contact rejects wrong origin, unsupported method and malformed body', async () => {
  const handler = createContactHandler();
  assert.equal((await handler(req(payload, 'POST', { origin: 'https://bad.test' }))).status, 403);
  assert.equal((await handler(req(null, 'PUT'))).status, 405);
  assert.equal((await handler(req({}))).status, 422);
});
test('real provider path uses fixed destination, reply-to and stable idempotency', async () => {
  const calls = [];
  const send = async (url, options) => { calls.push({ url, ...options }); return Response.json({ id: 'test-message' }); };
  const handler = createContactHandler({ env, send });
  const first = await handler(req({ ...payload, to: 'not-allowed@example.com' }));
  assert.equal(first.status, 200); assert.equal((await first.json()).mode, 'sent');
  await handler(req());
  const body = JSON.parse(calls[0].body);
  assert.deepEqual(body.to, ['pablopme50@gmail.com']);
  assert.equal(body.reply_to, payload.email);
  assert.ok(body.text.includes('\n\nSegunda'));
  assert.equal(calls[0].headers['Idempotency-Key'], calls[1].headers['Idempotency-Key']);
  assert.ok(calls[0].signal instanceof AbortSignal);
});
test('provider non-success and missing IDs are not treated as sent', async () => {
  for (const response of [Response.json({ id: 'x' }, { status: 500 }), Response.json({})]) {
    const handler = createContactHandler({ env, send: async () => response, log: quiet });
    assert.equal((await handler(req())).status, 502);
  }
});
test('provider timeout returns retryable error without logging contents', async () => {
  const logs = [];
  const handler = createContactHandler({ env, send: async () => { throw new DOMException('Timed out', 'TimeoutError'); }, log: m => logs.push(m) });
  assert.equal((await handler(req())).status, 503);
  assert.ok(!logs.join().includes(payload.email));
});
test('contact limit blocks sixth attempt and expiry resets it', async () => {
  let now = 0;
  const handler = createContactHandler({ env, now: () => now, send: async () => Response.json({ id: 'x' }) });
  for (let i = 0; i < 5; i++) assert.equal((await handler(req())).status, 200);
  assert.equal((await handler(req())).status, 429);
  now = 600001;
  assert.equal((await handler(req())).status, 200);
});
test('configured distributed limiter fails closed', async () => {
  const handler = createContactHandler({ env: { ...env, UPSTASH_REDIS_REST_URL: 'https://redis.example', UPSTASH_REDIS_REST_TOKEN: 'test' }, send: async () => Response.json({}, { status: 503 }), log: quiet });
  assert.equal((await handler(req())).status, 503);
});
test('memory capacity does not evict active limits', () => {
  const limit = memoryLimiter({ capacity: 1, limit: 1, windowMs: 10 });
  assert.equal(limit('a', 0), true); assert.equal(limit('b', 0), false); assert.equal(limit('b', 11), true);
});
test('metrics allowlists sanitized data and rejects arbitrary properties', async () => {
  const logs = []; const handler = createMetricsHandler({ log: line => logs.push(JSON.parse(line)) });
  const event = { kind: 'event', name: 'page_view', path: '/' };
  assert.equal((await handler(req(event))).status, 204);
  for (const invalid of [{ ...event, email: 'test@example.com' }, { ...event, path: '/?email=secret' }, { kind: 'vital', name: 'LCP', path: '/', value: -1 }, { ...event, name: 'arbitrary' }]) assert.equal((await handler(req(invalid))).status, 422);
  assert.equal(logs.length, 1); assert.deepEqual(Object.keys(logs[0]), ['type', 'kind', 'name', 'path']);
});
