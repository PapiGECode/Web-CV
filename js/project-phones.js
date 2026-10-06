/* Real embedded websites. No proxy, copied pages, or cross-origin load-success claims. */
(() => {
  'use strict';
  const sites = Object.freeze({kicord:'https://www.kicord.es/es', portfolio:'/?phone-preview=1', kernelos:'https://kernelos.org/', thiagoiutu:'https://thiagoiutu.com/', 'papigegamer-web':'https://papigegamer.com/'});
  const controllers = new Map();
  const isPreview = () => window.self !== window.top || new URL(location.href).searchParams.get('phone-preview') === '1';
  const roots = scope => [...(scope.matches?.('[data-live-phone], [data-live-landscape]') ? [scope] : []), ...scope.querySelectorAll('[data-live-phone], [data-live-landscape]')];
  function init(root) {
    if (controllers.has(root) || isPreview()) return;
    const landscape = Boolean(root.dataset.liveLandscape);
    const key = root.dataset.livePhone || root.dataset.liveLandscape;
    // KernelOS uses a wider mobile layout; keep its hero controls inside the viewport.
    const canvasWidth = landscape ? 1100 : key === 'kernelos' ? 430 : 390;
    const template = root.querySelector('[data-live-template]');
    const viewport = root.querySelector('.pf-viewport, .landscape-viewport');
    const cover = root.querySelector('.phone-preview-cover, .landscape-cover');
    const reload = root.closest('.live-phone-presentation')?.querySelector('[data-phone-reload]');
    if (!Object.hasOwn(sites,key) || !template || !viewport || !cover || (!landscape && !reload)) return;
    const abort = new AbortController();
    let frame = viewport.querySelector('iframe.pf-live-frame');
    const on = (el,type,handler,options={}) => el.addEventListener(type,handler,{...options,signal:abort.signal});
    function fit() {
      if (!frame) return;
      const styles = getComputedStyle(viewport);
      const width = parseFloat(styles.width), height = parseFloat(styles.height);
      if (!(width > 0 && height > 0)) return;
      const scale = width / canvasWidth;
      frame.style.width = `${canvasWidth}px`;
      frame.style.height = `${height / scale}px`;
      frame.style.transform = `scale(${scale})`;
      root.style.setProperty('--pf-scale',String(scale));
    }
    function attach() {
      if (frame || !root.isConnected || root.closest('[inert]') || document.hidden) return;
      const bounds = root.getBoundingClientRect();
      if (!bounds.width || !bounds.height) return; // Closed disclosures are deliberately inert.
      frame = template.content.querySelector('iframe').cloneNode(true);
      // Relative self URL also works on a same-origin Vercel preview. Its own
      // controller refuses further frames, including after internal navigation.
      frame.src = sites[key];
      frame.removeAttribute('data-frame-src');
      viewport.append(frame); cover.hidden = true; fit();
    }
    if (reload) on(reload,'click',() => { if (!frame) attach(); else frame.src = sites[key]; });
    const resize = typeof ResizeObserver === 'function' ? new ResizeObserver(fit) : null;
    resize?.observe(viewport);
    if (!resize) on(window,'resize',fit,{passive:true});
    const observer = typeof IntersectionObserver === 'function' ? new IntersectionObserver(entries => {
      if (entries.some(entry=>entry.isIntersecting)) attach();
    },{rootMargin:'180px 0px'}) : null;
    observer?.observe(root);
    if (!observer) attach();
    function reconsider() {
      const rect=root.getBoundingClientRect();
      if (rect.bottom > -180 && rect.top < innerHeight+180) attach();
    }
    on(document,'visibilitychange',reconsider);
    on(document,'project-phone:visibility',reconsider);
    on(window,'pageshow',() => {fit();reconsider();});
    if (reload) reload.hidden=false; root.dataset.phoneEnhanced='true'; fit(); reconsider();
    controllers.set(root,() => {
      abort.abort(); resize?.disconnect(); observer?.disconnect();
      // Detach closing modal contexts; navigating to about:blank erases forward history.
      // Keep main-page contexts intact for browser back/forward-cache restoration.
      if (root.closest('#case-study-modal')) {frame?.remove();cover.hidden=false;}
      if (reload) reload.hidden=true; delete root.dataset.phoneEnhanced; controllers.delete(root);
    });
  }
  function mount(scope=document) {
    if (isPreview()) {document.documentElement.classList.add('phone-preview');return;}
    roots(scope).forEach(init);
  }
  function destroy(scope) {roots(scope).forEach(root=>controllers.get(root)?.());}
  window.ProjectPhones=Object.freeze({mount,destroy});
  mount();
  window.addEventListener('pagehide',() => [...controllers.values()].forEach(dispose=>dispose()));
  window.addEventListener('pageshow',() => mount());
})();
