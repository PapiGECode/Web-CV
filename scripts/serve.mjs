// Minimal same-origin production preview for local development and CI. No email credentials needed.
import http from 'node:http';
import fs from 'node:fs/promises';
import path from 'node:path';
import { createContactHandler } from '../server/contact.js';
import { createMetricsHandler } from '../server/metrics.js';
const root = path.resolve('dist');
const port = Number(process.env.PORT || 3000);
if (!Number.isInteger(port) || port < 1 || port > 65535) throw new Error('Invalid preview port');
const env = { ...process.env, NODE_ENV: 'development' };
const contact = createContactHandler({ env });
const metrics = createMetricsHandler({ env });
const types = { '.html': 'text/html; charset=utf-8', '.js': 'text/javascript', '.css': 'text/css', '.woff2': 'font/woff2', '.png': 'image/png', '.webp': 'image/webp', '.svg': 'image/svg+xml', '.jpg': 'image/jpeg', '.pdf': 'application/pdf', '.xml': 'application/xml', '.json': 'application/json', '.webmanifest': 'application/manifest+json', '.ico': 'image/x-icon' };
const config = JSON.parse(await fs.readFile('vercel.json', 'utf8'));
http.createServer(async (req, res) => {
  try {
    const url = new URL(req.url, `http://localhost:${port}`);
    for (const h of config.headers[0].headers) res.setHeader(h.key, h.value.replace('; upgrade-insecure-requests', ''));
    if (url.pathname.startsWith('/api/')) {
      if (url.pathname === '/api/github-activity') { res.setHeader('Content-Type', 'application/json'); res.end(JSON.stringify({ ok: true, source: 'fallback' })); return; }
      const handler = { '/api/contact': contact, '/api/metrics': metrics }[url.pathname];
      if (!handler) { res.writeHead(404); res.end(); return; }
      const parts = []; for await (const chunk of req) { parts.push(chunk); if (parts.reduce((n, c) => n + c.length, 0) > 25000) { res.writeHead(413); res.end(); return; } }
      const body = Buffer.concat(parts);
      const request = new Request(url, { method: req.method, headers: req.headers, ...(body.length ? { body } : {}) });
      const result = await handler(request);
      res.writeHead(result.status, Object.fromEntries(result.headers)); res.end(Buffer.from(await result.arrayBuffer())); return;
    }
    const redirect = (config.redirects || []).find(rule => rule.source === url.pathname);
    if (redirect) { res.writeHead(redirect.permanent ? 308 : 307, { Location: redirect.destination }); res.end(); return; }
    let relative = decodeURIComponent(url.pathname).replace(/^\//, '') || 'index.html';
    if (!path.extname(relative)) relative += '.html';
    let file = path.resolve(root, relative), status = 200;
    if (!file.startsWith(root + path.sep)) { res.writeHead(403); res.end(); return; }
    try { await fs.access(file); } catch { file = path.join(root, '404.html'); status = 404; }
    const bytes = await fs.readFile(file);
    res.writeHead(status, { 'Content-Type': types[path.extname(file)] || 'application/octet-stream' }); res.end(bytes);
  } catch (e) { console.error(e.message); res.writeHead(500); res.end('Preview error'); }
}).listen(port, '0.0.0.0', () => console.log(`Portfolio preview: http://localhost:${port}`));
