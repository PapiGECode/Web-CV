(function () {
  'use strict';
  var root = document.documentElement;
  // Applied before first paint. Actual iframe elements remain inside inert templates.
  if (window.self !== window.top || new URL(location.href).searchParams.get('phone-preview') === '1') root.classList.add('phone-preview');
  try {
    var saved = localStorage.getItem('ps-theme');
    root.classList.toggle('light', saved === 'light' || (!saved && matchMedia('(prefers-color-scheme: light)').matches));
  } catch (_) { root.classList.toggle('light', matchMedia('(prefers-color-scheme: light)').matches); }
  // Recovery only when the enhancement controller never finished.
  setTimeout(function () {
    if (window.__portfolioReady || !document.getElementById('hero')) return;
    root.classList.remove('fx','fine','menu-locked','modal-locked','lenis-stopped');
    var loader=document.getElementById('loader');
    if(loader) loader.remove();
    document.querySelectorAll('#main, footer, #nav').forEach(function(el){el.inert=false;});
    document.querySelectorAll('.anim').forEach(function(el){el.style.opacity='1';});
  },5000);
})();
