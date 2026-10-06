/* Whole-surface feedback with native activation and disposable modal listeners. */
(() => {
  'use strict';
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const fine = matchMedia('(hover:hover) and (pointer:fine)');
  const controllers = new Map();
  function mount(scope = document) {
    if (typeof gsap === 'undefined') return;
    scope.querySelectorAll('.btn, .f-submit').forEach(el => {
      if (controllers.has(el)) return;
      const abort = new AbortController();
      const on = (target, type, handler, options = {}) => target.addEventListener(type, handler, {
        ...(typeof options === 'boolean' ? { capture: options } : options), signal: abort.signal,
      });
      var pressed = null, releaseTimer;
      function reset() {
        if (pressed !== null) return;
        gsap.killTweensOf(el, 'x,y');
        gsap.set(el, { x: 0, y: 0 });
      }
      on(el, 'pointermove', function (e) {
        if (pressed !== null) return;
        if (e.pointerType !== 'mouse' || e.buttons || el.disabled ||
            document.activeElement === el || motionPreference.matches || !fine.matches) {
          reset(); return;
        }
        // Subtract our transform: the attraction never feeds back into its baseline.
        var r = el.getBoundingClientRect();
        var x = Number(gsap.getProperty(el, 'x')), y = Number(gsap.getProperty(el, 'y'));
        gsap.to(el, {
          x: Math.max(-5, Math.min(5, (e.clientX - r.left + x - r.width / 2) * .12)),
          y: Math.max(-3, Math.min(3, (e.clientY - r.top + y - r.height / 2) * .12)),
          duration: .25, ease: 'power3.out', overwrite: 'auto',
        });
      }, { passive: true });
      on(el, 'pointerdown', function (e) {
        clearTimeout(releaseTimer);
        pressed = e.pointerId;
        gsap.killTweensOf(el, 'x,y');
      });
      function release(e) {
        if (e.pointerId !== pressed) return;
        // Native click follows pointerup in the same task. Do not move its target first.
        releaseTimer = setTimeout(function () { pressed = null; reset(); }, 0);
      }
      on(window, 'pointerup', release, true);
      on(window, 'pointercancel', release, true);
      on(window, 'blur', function () { pressed = null; reset(); });
      ['pointerleave', 'focus', 'keydown'].forEach(function (event) {
        on(el, event, reset);
      });
      on(motionPreference, 'change', reset);
      controllers.set(el, () => { clearTimeout(releaseTimer); abort.abort(); gsap.killTweensOf(el, 'x,y'); controllers.delete(el); });
    });
  }
  function destroy(scope) {
    for (const [el, dispose] of controllers) if (scope.contains(el)) dispose();
  }
  window.ButtonMotion = Object.freeze({ mount, destroy });
  mount();
})();
