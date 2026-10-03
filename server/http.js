/** Small, bounded HTTP primitives shared by the public endpoints. */
export class HttpError extends Error {
  constructor(status, message) { super(message); this.status = status; }
}
export function json(data, status = 200, headers = {}) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json; charset=utf-8',
      'Cache-Control': 'no-store',
      'X-Robots-Tag': 'noindex',
      ...headers,
    },
  });
}
export function allowedOrigin(request, env = {}) {
  const origin = request.headers.get('origin');
  if (!origin) return false;
  const allowed = new Set(['https://www.pabloschefer.com', 'https://pabloschefer.com']);
  // Only this deployment's exact preview hosts, never a wildcard *.vercel.app.
  for (const name of ['VERCEL_URL', 'VERCEL_BRANCH_URL']) {
    const host = env[name];
    if (host && /^[a-z0-9.-]+\.vercel\.app$/i.test(host)) allowed.add(`https://${host}`);
  }
  if (env.NODE_ENV === 'development') {
    allowed.add('http://localhost:3000');
    allowed.add('http://127.0.0.1:3000');
  }
  return allowed.has(origin);
}
export async function boundedJson(request, maxBytes = 16384) {
  if (!/^application\/json(?:\s*;|$)/i.test(request.headers.get('content-type') || '')) {
    throw new HttpError(415, 'Formato de solicitud no admitido.');
  }
  const declared = Number(request.headers.get('content-length'));
  if (Number.isFinite(declared) && declared > maxBytes) throw new HttpError(413, 'El mensaje es demasiado largo.');
  if (!request.body) throw new HttpError(400, 'La solicitud está vacía.');
  const reader = request.body.getReader();
  const chunks = [];
  let size = 0;
  try {
    for (;;) {
      const { value, done } = await reader.read();
      if (done) break;
      size += value.byteLength;
      if (size > maxBytes) {
        await reader.cancel();
        throw new HttpError(413, 'El mensaje es demasiado largo.');
      }
      chunks.push(value);
    }
  } finally { reader.releaseLock(); }
  const bytes = new Uint8Array(size);
  let offset = 0;
  for (const chunk of chunks) { bytes.set(chunk, offset); offset += chunk.byteLength; }
  try {
    const value = JSON.parse(new TextDecoder('utf-8', { fatal: true }).decode(bytes));
    if (!value || typeof value !== 'object' || Array.isArray(value)) throw new Error('object required');
    return value;
  } catch { throw new HttpError(400, 'No se ha podido leer la solicitud.'); }
}
/** Best-effort per-instance limit. Not a distributed/global abuse guarantee. */
export function memoryLimiter({ limit = 5, windowMs = 600000, capacity = 5000 } = {}) {
  const entries = new Map();
  return (key, now = Date.now()) => {
    for (const [id, row] of entries) if (row.expires <= now) entries.delete(id);
    let row = entries.get(key);
    if (!row) {
      // Fail closed when full rather than evicting active rate limits.
      if (entries.size >= capacity) return false;
      row = { count: 0, expires: now + windowMs };
      entries.set(key, row);
    }
    row.count += 1;
    return row.count <= limit;
  };
}
export async function digest(value) {
  const result = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(result), n => n.toString(16).padStart(2, '0')).join('');
}
