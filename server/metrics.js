import { allowedOrigin, boundedJson, digest, HttpError, json, memoryLimiter } from './http.js';
const PATHS = new Set(['/', '/projects/kicord', '/projects/papigegamer', '/projects/kernelos', '/privacidad']);
const EVENTS = new Set(['page_view', 'download_cv', 'contact_sent', 'project_open']);
const BOUNDS = { LCP: 120000, INP: 60000, CLS: 100, TTFB: 60000 };
export function createMetricsHandler({ env = {}, log = console.info, limiter = memoryLimiter({ limit: 40, windowMs: 60000 }), salt = crypto.randomUUID() } = {}) {
  return async function (request) {
    if (request.method !== 'POST') return json({ ok: false }, 405, { Allow: 'POST' });
    if (!allowedOrigin(request, env)) return json({ ok: false }, 403);
    try {
      const data = await boundedJson(request, 1500);
      // Never accept arbitrary properties, URLs, user identifiers or form values.
      if (Object.keys(data).some(key => !['kind', 'name', 'path', 'value'].includes(key)) || !PATHS.has(data.path)) return json({ ok: false }, 422);
      if (data.kind === 'vital') {
        if (!Object.hasOwn(BOUNDS, data.name) || typeof data.value !== 'number' || !Number.isFinite(data.value) || data.value < 0 || data.value > BOUNDS[data.name]) return json({ ok: false }, 422);
      } else if (data.kind !== 'event' || !EVENTS.has(data.name) || data.value !== undefined) return json({ ok: false }, 422);
      const ip = (request.headers.get('x-forwarded-for') || 'unknown').slice(0, 100);
      if (!limiter(await digest(salt + ip))) return json({ ok: false }, 429);
      const row = { type: 'portfolio_metric', kind: data.kind, name: data.name, path: data.path };
      if (data.kind === 'vital') row.value = Number(data.value.toFixed(3));
      log(JSON.stringify(row));
      return new Response(null, { status: 204, headers: { 'Cache-Control': 'no-store', 'X-Robots-Tag': 'noindex' } });
    } catch (e) { return json({ ok: false }, e instanceof HttpError ? e.status : 400); }
  };
}
