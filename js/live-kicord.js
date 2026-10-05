/* Live cross-origin website. A load event is NOT proof that framing succeeded. */
(() => {
  'use strict';
  const URL = 'https://www.kicord.es/es';
  const controllers = new Map();
  const roots = scope => [...(scope.matches?.('[data-kicord-live]') ? [scope] : []), ...scope.querySelectorAll('[data-kicord-live]')];
  function init(root) {
    if (controllers.has(root)) return;
    const screen = root.querySelector('.pf-screen');
    const app = root.querySelector('.pf-app');
    const frame = root.querySelector('.pf-live-frame');
    const reload = root.querySelector('.pf-live-reload');
    const footer = root.querySelector('.pf-bottom');
    const time = root.querySelector('.pf-time');
    if (!screen || !app || !frame || !reload || !footer || !time) return;
    const abort = new AbortController();
    const listen = (el, event, callback, options = {}) => el.addEventListener(event, callback, {...options, signal: abort.signal});
    let timer, inView = false;
    function fit() {
      if (!screen.clientWidth) return;
      const scale = screen.clientWidth / 390;
      const hit = Math.max(56, Math.ceil(45 / scale));
      const bottom = Math.max(96, hit + 42);
      root.style.setProperty('--pf-scale', String(scale));
      root.style.setProperty('--pf-hit', `${hit}px`);
      root.style.setProperty('--pf-live-top', `${54 + hit}px`);
      root.style.setProperty('--pf-live-bottom', `${bottom}px`);
      root.style.setProperty('--pf-live-toolbar', `${hit}px`);
      app.style.height = `${screen.clientHeight / scale}px`;
      app.style.transform = `scale(${scale})`;
      footer.style.height = `${bottom}px`;
    }
    function clock() {
      clearTimeout(timer);
      if (document.hidden || !inView || root.closest('[inert]')) return;
      const now = new Date();
      time.textContent = `${now.getHours()}:${String(now.getMinutes()).padStart(2, '0')}`;
      timer = setTimeout(clock, 60020 - Date.now() % 60000);
    }
    // Never inspect cross-origin contents, strip protections, or claim success on load.
    // The external link remains available for challenges, blocked frames, or login.
    listen(reload, 'click', () => { frame.setAttribute('src', URL); });
    const resize = typeof ResizeObserver === 'function' ? new ResizeObserver(fit) : null;
    resize?.observe(screen);
    if (!resize) listen(window, 'resize', fit, {passive: true});
    const visible = typeof IntersectionObserver === 'function' ? new IntersectionObserver(entries => {
      inView = entries[0].isIntersecting; clock();
    }) : null;
    visible?.observe(root);
    if (!visible) inView = true;
    listen(document, 'visibilitychange', clock);
    listen(document, 'project-phone:visibility', clock);
    listen(window, 'pageshow', () => { fit(); clock(); });
    if (!frame.hasAttribute('src')) frame.setAttribute('src', URL);
    root.dataset.phoneEnhanced = 'true';
    reload.hidden = false;
    fit(); clock();
    controllers.set(root, () => {
      abort.abort(); resize?.disconnect(); visible?.disconnect(); clearTimeout(timer);
      // Stop the remote page when a case study closes (including videos/3D work).
      frame.removeAttribute('src');
      reload.hidden = true;
      delete root.dataset.phoneEnhanced;
      controllers.delete(root);
    });
  }
  function mount(scope = document) { roots(scope).forEach(init); }
  function destroy(scope) { roots(scope).forEach(root => controllers.get(root)?.()); }
  window.KiCordLivePhone = Object.freeze({mount, destroy});
  mount();
  window.addEventListener('pagehide', () => [...controllers.values()].forEach(dispose => dispose()));
  window.addEventListener('pageshow', () => mount());
})();
