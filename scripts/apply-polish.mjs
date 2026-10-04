// One-time, source-verified refinement. Never rewrites the page or the base design.
import fs from 'node:fs/promises';
import crypto from 'node:crypto';
const expected = {
  'css/quality.css': '906a6da0970e4f65bf77a869cff8d5477363d1acd2304f34258a5a6aa2f0a9d2',
  'js/app.js': 'ca7887838f77cb405b6b633b12d9fb2936802f76e12c537e658abe2a381232d4',
  'index.html': '98bfde8a8d0c5e55251eb72bdd1b3020964d3f6f6c46114aa36530ac9e84e37b',
  'css/styles.css': '6bc3bcf61ad8e6bd20b106be3c8ef83146a610358d68633ee7a5fae363e3d1fe',
};
const source = {};
for (const [file, sha] of Object.entries(expected)) {
  const bytes = await fs.readFile(file);
  if (crypto.createHash('sha256').update(bytes).digest('hex') !== sha) throw Error('Source changed: ' + file);
  source[file] = bytes.toString('utf8');
}
let app = source['js/app.js'];
function replace(before, after) {
  if (!app.includes(before) || app.split(before).length !== 2) throw Error('Ambiguous replacement: ' + before.slice(0, 70));
  app = app.replace(before, after);
}
const start = app.indexOf('        /* ============ MAGNETIC BUTTONS / LINKS ============ */');
const end = app.indexOf('        /* ============ SPOTLIGHT ============ */', start);
if (start < 0 || end < 0) throw Error('Magnetic block not found');
app = app.slice(0, start) + `        /* Magnetic feedback stays inside the button: the hit area never moves. */
        if (FINE && !REDUCE && hasGSAP) {
          document.querySelectorAll('.btn, .f-submit, .social').forEach(function (el) {
            var target = el.querySelector('.btn-t, .fs-t, .arr');
            if (!target) return;
            function reset() {
              gsap.to(target, { x: 0, y: 0, duration: .3, ease: 'power3.out', overwrite: 'auto' });
            }
            el.addEventListener('pointermove', function (e) {
              if (e.pointerType === 'touch' || e.buttons || el.disabled ||
                  document.activeElement === el || matchMedia('(prefers-reduced-motion: reduce)').matches) {
                reset(); return;
              }
              var r = el.getBoundingClientRect();
              gsap.to(target, {
                x: Math.max(-5, Math.min(5, (e.clientX - r.left - r.width / 2) * .12)),
                y: Math.max(-3, Math.min(3, (e.clientY - r.top - r.height / 2) * .12)),
                duration: .25, ease: 'power3.out', overwrite: 'auto',
              });
            }, { passive: true });
            ['pointerleave', 'pointerdown', 'pointercancel', 'focus'].forEach(function (event) {
              el.addEventListener(event, reset);
            });
          });
        }

` + app.slice(end);
replace('        var sections = document.querySelectorAll("section[id]");', `        var sections = Array.from(document.querySelectorAll('section[id]')).filter(function (section) {
          return Array.from(navlinks).some(function (link) { return link.hash === '#' + section.id; });
        });`);
replace('            l.classList.toggle("active", l.getAttribute("href") === "#" + cur);', `            var active = l.getAttribute('href') === '#' + cur;
            l.classList.toggle('active', active);
            if (active) l.setAttribute('aria-current', 'location');
            else l.removeAttribute('aria-current');`);
replace(`              e.preventDefault();
              if (e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              goTo(a.getAttribute("href"));`, `              if (e.defaultPrevented || e.button !== 0 || e.metaKey || e.ctrlKey || e.shiftKey || e.altKey) return;
              if (open && a.closest('#nav')) return; // The menu handler closes before scrolling.
              e.preventDefault();
              goTo(a.getAttribute("href"));`);
replace(`                      yPercent: 40,
                      duration: 0.7,`, `                      duration: 0.7,`);
replace(`                    info.querySelectorAll(".panel-links .btn"),
                    {
                      opacity: 0,
                      y: 12,`, `                    info.querySelectorAll(".panel-links .btn"),
                    {
                      opacity: 0,`);
const css = source['css/quality.css'] + `

/* 2026-10-04: precise polish, preserving the hero/footer identity and base styling. */
/* Give the floating capsule space around its existing content without moving the layout. */
#nav .nav-bg { inset:.35rem max(.5rem,calc(var(--pad) - .8rem)); pointer-events:none; }
.nav-link { display:inline-flex; align-items:center; min-height:44px; }
.nav-link:focus-visible { border-radius:6px; }

/* Match the actual form markup: draft actions previously missed their component styles. */
.form-eyebrow { margin-bottom:1.25rem; color:var(--ash); }
.draft-actions { display:flex; flex-wrap:wrap; align-items:center; gap:.65rem; margin-top:1rem; }
.draft-actions a, .draft-actions button {
  display:inline-flex; align-items:center; justify-content:center;
  min-height:44px; max-width:100%; padding:.7rem 1rem;
  border:1px solid var(--line-2); border-radius:999px; background:transparent;
  color:var(--bone); font:500 .76rem/1.5 var(--font-mono); text-align:center;
  overflow-wrap:anywhere; cursor:pointer;
  transition:color .2s,border-color .2s,background-color .2s;
}
.draft-actions a:focus-visible, .draft-actions button:focus-visible { outline-offset:3px; }
.contact-privacy { margin-top:1rem; color:var(--ash); font-size:.8rem; line-height:1.75; max-width:62ch; }
.contact-privacy a { color:inherit; text-decoration:underline; text-underline-offset:.25em; }
.f-field:focus-within .f-label { color:var(--bone); }
.f-label { transition:color .2s; }
.f-input, .f-textarea { scroll-margin-top:1.5rem; }
.f-textarea { line-height:1.65; }
#message-count { font-variant-numeric:tabular-nums; }
.f-submit:disabled { opacity:.6; cursor:wait; }
.preferences-dialog { overscroll-behavior:contain; }

/* Quiet feedback; keep the footer signature, columns and animation untouched. */
.foot-col a, .site-tools a, .site-tools button {
  text-underline-offset:.3em; text-decoration-thickness:1px;
}
.foot-col a:focus-visible, .site-tools a:focus-visible, .site-tools button:focus-visible {
  color:var(--bone); border-radius:3px;
}
@media (hover:hover) {
  .draft-actions a:hover, .draft-actions button:hover { border-color:var(--bone); background:var(--ink-2); }
  .foot-col a:hover, .site-tools a:hover, .site-tools button:hover { text-decoration:underline; }
}
@media (max-width:680px) {
  .foot-col a { display:flex; align-items:center; min-height:44px; margin-bottom:.1rem; }
  .foot-col a[href^='mailto:'] { overflow-wrap:anywhere; }
  .field-hints { flex-wrap:wrap; gap:.3rem .8rem; }
  .draft-actions { gap:.6rem; }
  .draft-actions a, .draft-actions button { padding-inline:.85rem; }
}
@media (prefers-reduced-motion:reduce) {
  .draft-actions a, .draft-actions button, .f-label { transition:none; }
}
`;
// All checks above finish before any tracked source is changed.
await fs.writeFile('js/app.js', app);
await fs.writeFile('css/quality.css', css);
console.log('Applied focused polish. index.html and css/styles.css are unchanged.');
