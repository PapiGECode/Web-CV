/* Image-only depth inside a stationary portrait; overlays never move. */
(() => {
  const portrait = document.getElementById('portrait');
  if (!portrait || !window.gsap || !window.ScrollTrigger) return;
  const images = portrait.querySelectorAll('.portrait-img');
  const media = gsap.matchMedia();
  media.add('(prefers-reduced-motion: no-preference)', () => {
    gsap.fromTo(images, {yPercent:-3, scale:1.08}, {
      yPercent:3, ease:'none',
      scrollTrigger:{trigger:portrait, start:'top bottom', end:'bottom top', scrub:.7},
    });
    const fine = matchMedia('(hover: hover) and (pointer: fine)');
    const move = event => {
      if (!fine.matches || event.pointerType !== 'mouse') return;
      const rect = portrait.getBoundingClientRect();
      const x = Math.max(0, Math.min(1, (event.clientX-rect.left)/rect.width));
      gsap.to(images, {x:(x-.5)*12, duration:.8, ease:'power3.out', overwrite:'auto'});
      gsap.to(portrait, {'--portrait-light-x':`${x*100}%`, '--portrait-light-opacity':1, duration:.8, overwrite:'auto'});
    };
    const reset = () => {
      gsap.to(images, {x:0, duration:.8, ease:'power3.out', overwrite:'auto'});
      gsap.to(portrait, {'--portrait-light-opacity':0, duration:.6, overwrite:'auto'});
    };
    portrait.addEventListener('pointermove', move);
    portrait.addEventListener('pointerleave', reset);
    return () => {
      portrait.removeEventListener('pointermove', move);
      portrait.removeEventListener('pointerleave', reset);
      gsap.killTweensOf(images);
      gsap.killTweensOf(portrait);
      gsap.set(images, {clearProps:'transform'});
      portrait.style.removeProperty('--portrait-light-x');
      portrait.style.removeProperty('--portrait-light-opacity');
    };
  });
})();
