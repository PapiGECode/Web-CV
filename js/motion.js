/* Motion direction: short reveals, native scrolling and a bounded generative sculpture.
   Every movement can be paused; the system's reduced-motion setting always wins. */
(function () {
  'use strict';
  var root = document.documentElement;
  var system = matchMedia('(prefers-reduced-motion: reduce)');
  var button = document.getElementById('motion-toggle');
  var context = null, modalTween = null;
  var gs = window.gsap, st = window.ScrollTrigger;
  var canvas = document.getElementById('orbit-canvas');
  var scene = null;
  function enabled() {
    if (system.matches) return false;
    try { return localStorage.getItem('ps-motion') !== 'off'; } catch (_) { return true; }
  }
  function setupReveals() {
    if (context) { context.revert(); context = null; }
    if (modalTween) { modalTween.kill(); modalTween = null; }
    if (!enabled() || !gs || !st) return;
    gs.registerPlugin(st);
    context = gs.matchMedia();
    context.add('(prefers-reduced-motion: no-preference)', function () {
      // Do not gate content or wait behind a loading screen.
      if (scrollY < 100) {
        gs.fromTo('.hero-line > span', { yPercent: 95 }, { yPercent: 0, duration: .85, stagger: .09, ease: 'power3.out', clearProps: 'transform' });
        gs.fromTo('.hero-art', { y: 15 }, { y: 0, duration: 1, ease: 'power3.out', clearProps: 'transform' });
      }
      document.querySelectorAll('.reveal').forEach(function (el) {
        if (el.closest('#hero')) return;
        // A link must not move between pointer-down and pointer-up when scrolling reveals it.
        var interactive = el.matches('a,button,summary') || el.querySelector('a,button,input,textarea,summary');
        var distance = interactive ? 0 : 24;
        gs.fromTo(el, { y: distance, opacity: .35 }, { y: 0, opacity: 1, duration: .65, ease: 'power2.out', clearProps: 'transform,opacity', scrollTrigger: { trigger: el, start: 'top 94%', once: true } });
      });
      if (matchMedia('(min-width: 961px) and (pointer: fine)').matches) {
        document.querySelectorAll('.project-device').forEach(function (el) {
          gs.fromTo(el, { y: 20 }, { y: -18, ease: 'none', scrollTrigger: { trigger: el.closest('.project-visual'), start: 'top bottom', end: 'bottom top', scrub: .8 } });
        });
      }
      var asterisk = document.querySelector('.contact-asterisk');
      if (asterisk) gs.to(asterisk, { rotation: 360, duration: 45, repeat: -1, ease: 'none', scrollTrigger: { trigger: asterisk, toggleActions: 'play pause resume pause' } });
    });
  }
  function sync() {
    var play = enabled();
    root.dataset.motion = play ? 'on' : 'off';
    if (button) {
      button.disabled = system.matches;
      button.setAttribute('aria-pressed', String(!play));
      var label = system.matches ? 'Animaciones reducidas por el sistema' : (play ? 'Pausar animaciones' : 'Reanudar animaciones');
      button.setAttribute('aria-label', label); button.title = label;
    }
    setupReveals();
    if (scene) scene.update();
  }
  if (button) button.addEventListener('click', function () {
    try { localStorage.setItem('ps-motion', enabled() ? 'off' : 'on'); } catch (_) { return; }
    sync();
  });
  system.addEventListener('change', sync);
  document.querySelectorAll('details').forEach(function (detail) {
    detail.addEventListener('toggle', function () { if (st) st.refresh(); });
  });
  document.addEventListener('focusin', function (e) {
    var el = e.target.closest('.reveal');
    if (el && gs) gs.getTweensOf(el).forEach(function (tween) { tween.progress(1); });
  });
  addEventListener('portfolio:case-open', function () {
    if (!enabled() || !gs) return;
    if (modalTween) modalTween.kill();
    modalTween = gs.fromTo('#cs-content .case-hero', { y: 16, opacity: .65 }, { y: 0, opacity: 1, duration: .38, ease: 'power2.out', clearProps: 'transform,opacity' });
  });
  addEventListener('portfolio:case-close', function () { if (modalTween) modalTween.kill(); });
  // The artwork uses 2D canvas, no WebGL dependencies or continuous off-screen work.
  if (canvas && canvas.getContext) {
    var ctx = canvas.getContext('2d');
    if (ctx) {
      var host = canvas.parentElement, art = canvas.closest('.hero-art');
      var w = 0, h = 0, dpr = 1, raf = 0, visible = true, last = 0, time = 0;
      var px = 0, py = 0, tx = 0, ty = 0;
      var color = '#d2f78a', ink = '#eeefe6';
      var small = false;
      function colors() { var css = getComputedStyle(root); color = css.getPropertyValue('--accent').trim(); ink = css.getPropertyValue('--text').trim(); }
      function point(u, v, turn) {
        var radius = 1 + .39 * Math.cos(v), x = radius * Math.cos(u), y = radius * Math.sin(u), z = .39 * Math.sin(v);
        var ax = .92 + py * .24, ay = .2 + turn + px * .28, az = -.42;
        var a = y * Math.cos(ax) - z * Math.sin(ax); z = y * Math.sin(ax) + z * Math.cos(ax); y = a;
        a = x * Math.cos(ay) + z * Math.sin(ay); z = -x * Math.sin(ay) + z * Math.cos(ay); x = a;
        a = x * Math.cos(az) - y * Math.sin(az); y = x * Math.sin(az) + y * Math.cos(az); x = a;
        var scale = Math.min(w, h) * .30 / (1 + z * .15);
        return [w / 2 + x * scale, h / 2 + y * scale, z];
      }
      function line(fixed, around, turn, accent) {
        var steps = small ? 48 : 72, depth = 0;
        ctx.beginPath();
        for (var i = 0; i <= steps; i++) {
          var t = i / steps * Math.PI * 2;
          var p = point(around ? t : fixed, around ? fixed : t, turn);
          if (i === 0) ctx.moveTo(p[0], p[1]); else ctx.lineTo(p[0], p[1]);
          depth += p[2];
        }
        ctx.globalAlpha = accent ? .8 : Math.max(.15, Math.min(.5, .30 + depth / (steps + 1) * .14));
        ctx.strokeStyle = accent ? color : ink;
        ctx.lineWidth = accent ? 1.15 : .65;
        ctx.stroke();
      }
      function draw() {
        if (!w || !h) return;
        ctx.clearRect(0, 0, w, h);
        var count = small ? 15 : 22, turn = .3 + time * .000065;
        for (var i = 0; i < count; i++) line(i / count * Math.PI * 2, false, turn, i === 4);
        for (var j = 0; j < 16; j++) line(j / 16 * Math.PI * 2, true, turn, j === 9);
        ctx.globalAlpha = 1;
      }
      function tick(stamp) {
        raf = 0;
        if (!visible || document.hidden || !enabled()) { last = 0; return; }
        if (!last || stamp - last >= 32) {
          if (last) time += Math.min(64, stamp - last);
          last = stamp;
          px += (tx - px) * .055; py += (ty - py) * .055;
          draw();
        }
        raf = requestAnimationFrame(tick);
      }
      function update() {
        if (raf) cancelAnimationFrame(raf);
        raf = 0; last = 0;
        draw();
        if (visible && !document.hidden && enabled()) raf = requestAnimationFrame(tick);
      }
      function resize() {
        var box = host.getBoundingClientRect(); w = box.width; h = box.height;
        small = w < 450; dpr = Math.min(devicePixelRatio || 1, 1.5);
        canvas.width = Math.round(w * dpr); canvas.height = Math.round(h * dpr);
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0); draw();
      }
      colors(); resize(); host.classList.add('canvas-ready');
      new ResizeObserver(resize).observe(host);
      new IntersectionObserver(function (entries) { visible = entries[0].isIntersecting; update(); }, { threshold: .03 }).observe(art);
      new MutationObserver(function () { colors(); draw(); }).observe(root, { attributes: true, attributeFilter: ['class'] });
      art.addEventListener('pointermove', function (e) {
        if (!enabled() || e.pointerType !== 'mouse') return;
        var box = art.getBoundingClientRect(); tx = (e.clientX - box.left) / box.width * 2 - 1; ty = (e.clientY - box.top) / box.height * 2 - 1;
      }, { passive: true });
      art.addEventListener('pointerleave', function () { tx = ty = 0; });
      document.addEventListener('visibilitychange', update);
      scene = { update: update };
    }
  }
  sync();
  if (document.fonts) document.fonts.ready.then(function () { if (st) st.refresh(); });
})();
