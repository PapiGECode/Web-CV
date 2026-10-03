import { allowedOrigin, boundedJson, digest, HttpError, json, memoryLimiter } from './http.js';
const TARGET_EMAIL = 'pablopme50@gmail.com';
const EMAIL = /^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/;
const CONTROL = /[\u0000-\u001f\u007f]/;
const BAD_MESSAGE = /[\u0000-\u0008\u000b\u000c\u000e-\u001f\u007f]/;

export function validateContact(body) {
  const errors = {};
  const name = typeof body.name === 'string' ? body.name.trim() : '';
  const email = typeof body.email === 'string' ? body.email.trim() : '';
  const message = typeof body.message === 'string' ? body.message.replace(/\r\n?/g, '\n').trim() : '';
  if (name.length < 2 || name.length > 100 || CONTROL.test(name)) errors.name = 'Escribe un nombre de entre 2 y 100 caracteres.';
  if (!EMAIL.test(email) || email.length > 254 || CONTROL.test(email)) errors.email = 'Escribe una dirección de email válida.';
  if (message.length < 20 || message.length > 4000 || BAD_MESSAGE.test(message)) errors.message = 'Escribe un mensaje de entre 20 y 4.000 caracteres.';
  if (typeof body.website !== 'undefined' && (typeof body.website !== 'string' || body.website.trim())) errors.form = 'No se ha podido validar el formulario.';
  return { errors, value: { name, email, message } };
}

export function createContactHandler({ env = {}, send = fetch, now = Date.now, limiter = memoryLimiter(), log = console.warn } = {}) {
  const configured = () => Boolean(env.RESEND_API_KEY && env.CONTACT_FROM && !/[\r\n]/.test(env.CONTACT_FROM));
  return async function contact(request) {
    if (request.method === 'GET') return json({ available: configured(), provider: configured() ? 'resend' : null });
    if (request.method !== 'POST') return json({ ok: false, error: 'Método no permitido.' }, 405, { Allow: 'GET, POST' });
    if (!allowedOrigin(request, env)) return json({ ok: false, error: 'Origen no permitido.' }, 403);
    try {
      const body = await boundedJson(request, 20000);
      const { errors, value } = validateContact(body);
      if (Object.keys(errors).length) return json({ ok: false, error: 'Revisa los campos indicados.', errors }, 422);
      if (!configured()) return json({ ok: false, mode: 'unavailable', error: 'El envío directo no está disponible. Puedes abrir tu correo o copiar el mensaje.' }, 503);

      const id = typeof body.requestId === 'string' ? body.requestId : '';
      if (!/^[a-z0-9-]{20,80}$/i.test(id)) return json({ ok: false, error: 'Identificador de solicitud inválido.' }, 422);
      const ip = (request.headers.get('x-forwarded-for') || 'unknown').split(',')[0].trim().slice(0, 64);
      // Hash identifiers before use; never log visitor IPs, names, addresses or messages.
      const key = await digest(`${env.CONTACT_RATE_LIMIT_SECRET || env.RESEND_API_KEY}:${ip}`);
      if (!limiter(key, now())) return json({ ok: false, error: 'Demasiados intentos. Espera unos minutos o utiliza tu aplicación de correo.' }, 429, { 'Retry-After': '600' });

      // Optional distributed limit. A configured Redis outage fails closed.
      if (env.UPSTASH_REDIS_REST_URL && env.UPSTASH_REDIS_REST_TOKEN) {
        const url = new URL(env.UPSTASH_REDIS_REST_URL);
        if (url.protocol !== 'https:') throw new Error('invalid rate-limit service');
        const response = await send(url.href, {
          method: 'POST', signal: AbortSignal.timeout(3000),
          headers: { Authorization: `Bearer ${env.UPSTASH_REDIS_REST_TOKEN}`, 'Content-Type': 'application/json' },
          body: JSON.stringify(['EVAL', "local n=redis.call('INCR',KEYS[1]); if n==1 then redis.call('EXPIRE',KEYS[1],600) end; return n", '1', `portfolio:contact:${key}`]),
        });
        if (!response.ok) throw new Error('rate-limit service unavailable');
        const row = await response.json();
        if (!Number.isInteger(row.result)) throw new Error('invalid rate-limit response');
        if (row.result > 5) return json({ ok: false, error: 'Demasiados intentos. Espera unos minutos.' }, 429, { 'Retry-After': '600' });
      }

      const response = await send('https://api.resend.com/emails', {
        method: 'POST', signal: AbortSignal.timeout(8000),
        headers: {
          Authorization: `Bearer ${env.RESEND_API_KEY}`,
          'Content-Type': 'application/json',
          'Idempotency-Key': `portfolio-${await digest(id + JSON.stringify(value))}`,
        },
        body: JSON.stringify({
          from: env.CONTACT_FROM,
          to: [TARGET_EMAIL],
          reply_to: value.email,
          subject: `Contacto desde pabloschefer.com — ${value.name}`,
          text: `Nombre: ${value.name}\nEmail: ${value.email}\n\n${value.message}`,
        }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || typeof data.id !== 'string' || !data.id) {
        log(JSON.stringify({ type: 'contact_provider_error', status: response.status }));
        return json({ ok: false, error: 'El servicio de correo no ha confirmado el envío. Conservamos tu texto para que puedas reintentar.' }, 502);
      }
      return json({ ok: true, mode: 'sent', id: data.id });
    } catch (error) {
      if (error instanceof HttpError) return json({ ok: false, error: error.message }, error.status);
      log(JSON.stringify({ type: 'contact_service_unavailable' }));
      return json({ ok: false, error: 'No se ha podido confirmar el envío. Puedes reintentar sin perder tu mensaje.' }, 503);
    }
  };
}
