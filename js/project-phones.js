/* Progressive enhancement of prerendered project phones; no APIs, secrets or embeds. */
(() => {
  'use strict';
  const controllers = new Map();
  const shades = { violet:['#b3a5ff','#b3a5ff17'], mint:['#8cdbb3','#8cdbb317'], amber:['#eec78e','#eec78e17'] };
  function init(root) {
    if (controllers.has(root)) return;
    const screen = root.querySelector('.pf-screen');
    const app = root.querySelector('.pf-app');
    const scroll = root.querySelector('.pf-scroll');
    const tabs = [...root.querySelectorAll('[data-phone-tab]')];
    const panels = [...root.querySelectorAll('.pf-tabpanel')];
    if (!screen || !app || !scroll || tabs.length !== panels.length) return;
    const signal = new AbortController();
    const listen = (el,type,handler,options={}) => el.addEventListener(type,handler,{...options,signal:signal.signal});
    let timer;
    let observed = false;
    const fit = () => {
      const width = screen.clientWidth;
      if (!width) return;
      const scale = width / 390;
      root.style.setProperty('--pf-scale',String(scale));
      // Actual visible hit targets stay >=44px even when the 390px canvas shrinks.
      const target = Math.max(62,Math.ceil(45 / scale));
      root.style.setProperty('--pf-hit',`${target}px`);
      const bottom = Math.max(96,target + 42);
      root.style.setProperty('--pf-bottom-height',`${bottom}px`);
      root.querySelector('.pf-bottom').style.height = `${bottom}px`;
      scroll.style.bottom = `${bottom}px`;
      app.style.height = `${screen.clientHeight / scale}px`;
      // Every pane can reach the same sticky-tab position, even when its copy is short.
      const tabbar = root.querySelector('.pf-tabs');
      root.style.setProperty('--pf-viewport-height',`${Math.max(0,screen.clientHeight / scale - 102 - bottom)}px`);
      root.style.setProperty('--pf-tabbar-height',`${tabbar.offsetHeight}px`);
      app.style.transform = `scale(${scale})`;
    };
    const clock = () => {
      const now = new Date();
      root.querySelector('.pf-time').textContent = `${now.getHours()}:${String(now.getMinutes()).padStart(2,'0')}`;
    };
    const syncClock = () => {
      clearTimeout(timer);
      if (!root.isConnected || document.hidden || !observed || root.closest('[inert]')) return;
      clock();
      timer = setTimeout(syncClock,60000 - Date.now()%60000 + 20);
    };
    const activate = (index,focus=false) => {
      tabs.forEach((tab,i) => { tab.setAttribute('aria-selected',String(i===index)); tab.tabIndex = i===index ? 0 : -1; panels[i].hidden = i!==index; });
      // Keep the chosen panel visible without moving the page or stealing focus.
      scroll.scrollTo({top:Math.max(0,root.querySelector('.pf-tabs').offsetTop - 8),behavior:'instant'});
      if (focus) tabs[index].focus({preventScroll:true});
    };
    tabs.forEach((tab,index) => {
      listen(tab,'click',() => activate(index));
      listen(tab,'keydown',event => {
        let next;
        if (event.key === 'ArrowRight') next=(index+1)%tabs.length;
        if (event.key === 'ArrowLeft') next=(index+tabs.length-1)%tabs.length;
        if (event.key === 'Home') next=0;
        if (event.key === 'End') next=tabs.length-1;
        if (next===undefined) return;
        event.preventDefault(); event.stopPropagation(); activate(next,true);
      });
    });
    root.querySelectorAll('[data-phone-accent]').forEach(button => {
      listen(button,'click',() => {
        const value=shades[button.dataset.phoneAccent]; if (!value) return;
        root.style.setProperty('--pf-accent',value[0]); root.style.setProperty('--pf-soft',value[1]);
        root.querySelectorAll('[data-phone-accent]').forEach(el => el.setAttribute('aria-pressed',String(el===button)));
      });
    });
    // Read/scale only when the component's dimensions change; no render loop.
    const resize = typeof ResizeObserver==='function' ? new ResizeObserver(fit) : null;
    resize?.observe(screen);
    if (!resize) listen(window,'resize',fit,{passive:true});
    const visible = typeof IntersectionObserver==='function' ? new IntersectionObserver(entries => { observed=entries[0].isIntersecting; syncClock(); }) : null;
    visible?.observe(root);
    if (!visible) observed=true;
    listen(document,'visibilitychange',syncClock);
    listen(document,'project-phone:visibility',syncClock);
    listen(window,'pageshow',() => { fit(); syncClock(); });
    root.dataset.phoneEnhanced='true';
    fit(); clock(); syncClock();
    controllers.set(root,() => { signal.abort(); resize?.disconnect(); visible?.disconnect(); clearTimeout(timer); controllers.delete(root); });
  }
  const roots = scope => [...(scope.matches?.('[data-project-phone]')?[scope]:[]),...scope.querySelectorAll('[data-project-phone]')];
  function mount(scope=document) { roots(scope).forEach(init); window.KiCordLivePhone?.mount(scope); }
  function destroy(scope) { roots(scope).forEach(root => controllers.get(root)?.()); window.KiCordLivePhone?.destroy(scope); }
  window.ProjectPhones=Object.freeze({mount,destroy});
  mount();
  window.addEventListener('pagehide',() => [...controllers.values()].forEach(dispose => dispose()));
  window.addEventListener('pageshow',() => mount());
})();
