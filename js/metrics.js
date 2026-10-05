import { onCLS, onINP, onLCP, onTTFB } from 'web-vitals';
const paths = new Set(['/', '/projects/kicord', '/projects/papigegamer', '/projects/kernelos', '/privacidad']);
const path = location.pathname.replace(/\/$/, '') || '/';
let started = false;
// An embedded view is not another portfolio visit and must not duplicate telemetry.
function allowed() { return window.self === window.top && new URL(location.href).searchParams.get('phone-preview') !== '1' && paths.has(path) && window.portfolioMeasurementAllowed?.() === true; }
function send(kind, name, value) {
  if (!allowed()) return;
  const payload = { kind, name, path };
  if (kind === 'vital') payload.value = value;
  const body = JSON.stringify(payload);
  const queued = navigator.sendBeacon?.('/api/metrics', new Blob([body], { type: 'application/json' }));
  if (!queued) fetch('/api/metrics', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body, keepalive: true }).catch(() => {});
}
function activate() {
  if (!allowed() || started) return;
  started = true;
  send('event', 'page_view');
  const record = metric => send('vital', metric.name, metric.value);
  onLCP(record); onINP(record); onCLS(record); onTTFB(record);
}
window.addEventListener('portfolio:consent', activate);
window.addEventListener('portfolio:event', e => {
  if (e.detail === 'contact_sent') send('event', 'contact_sent');
});
document.addEventListener('click', e => {
  const target = e.target.closest('a');
  if (target?.hasAttribute('download')) send('event', 'download_cv');
  else if (target?.pathname?.startsWith('/projects/') && target.origin === location.origin) send('event', 'project_open');
});
activate();
