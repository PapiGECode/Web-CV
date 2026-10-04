(function () {
  'use strict';
  var root = document.documentElement;
  try {
    var saved = localStorage.getItem('ps-theme');
    root.classList.toggle('light', saved === 'light' || (!saved && matchMedia('(prefers-color-scheme: light)').matches));
  } catch (_) { root.classList.toggle('light', matchMedia('(prefers-color-scheme: light)').matches); }
  try { root.dataset.motion = matchMedia('(prefers-reduced-motion: reduce)').matches || localStorage.getItem('ps-motion') === 'off' ? 'off' : 'on'; } catch (_) {}
  // Recovery only if the enhancement controller never finished. No forced visibility on healthy pages.
  setTimeout(function () {
    if (window.__portfolioReady || !document.getElementById('hero')) return;
    root.classList.remove('fx', 'fine', 'menu-locked', 'modal-locked', 'lenis-stopped');
    var loader = document.getElementById('loader');
    if (loader) loader.remove();
    document.querySelectorAll('#main, footer, #nav').forEach(function (el) { el.inert = false; });
    document.querySelectorAll('.anim').forEach(function (el) { el.style.opacity = '1'; });
  }, 5000);
})();
