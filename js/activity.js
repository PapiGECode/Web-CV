(function () {
  'use strict';
  var panel = document.getElementById('now');
  if (!panel) return;
  var loaded = false;
  async function load() {
    if (loaded) return; loaded = true;
    try {
      var res = await fetch('/api/github-activity', { signal: AbortSignal.timeout(5000) });
      if (!res.ok) return;
      var data = await res.json();
      if (!data.ok || data.source !== 'github' || !/^https:\/\/github\.com\/[\w.-]+(?:\/[\w.-]+)?$/.test(data.url)) return;
      document.getElementById('now-github-repo').textContent = data.repo;
      document.getElementById('now-github-msg').textContent = data.message;
      var age = Date.parse(data.createdAt);
      document.getElementById('now-github-time').textContent = Number.isFinite(age) ? new Date(age).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }) : 'GitHub';
      var link = document.getElementById('now-github-link');
      link.href = data.url;
      link.querySelector('span').textContent = data.url.replace('https://', '');
      document.getElementById('now-updated-text').textContent = 'Actividad consultada en GitHub';
    } catch (_) { /* Static, honest fallback stays readable without an API response. */ }
  }
  if ('IntersectionObserver' in window) {
    var observer = new IntersectionObserver(function (entries) {
      if (entries.some(function (e) { return e.isIntersecting; })) { observer.disconnect(); load(); }
    }, { rootMargin: '200px' });
    observer.observe(panel);
  } else load();
})();
