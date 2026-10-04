/* Navigation and project dialogs. No animation dependency is required to use the site. */
(function () {
  'use strict';
  var root = document.documentElement;
  var nav = document.getElementById('nav');
  var main = document.getElementById('main');
  var footer = document.querySelector('.site-footer');
  var burger = document.getElementById('nav-burger');
  var overlay = document.getElementById('nav-overlay');
  var progress = document.getElementById('progress');
  var open = false;
  var modal = document.getElementById('case-study-modal');
  var content = document.getElementById('cs-content');
  var scroller = document.getElementById('cs-scroller');
  var closeButton = document.getElementById('cs-btn-close');
  var returnFocus = null;
  var currentCase = null;
  var frame = 0;
  var sections = Array.from(document.querySelectorAll('main > section[id]'));
  var links = Array.from(document.querySelectorAll('.nav-link'));
  function reduce() { return root.dataset.motion === 'off' || matchMedia('(prefers-reduced-motion: reduce)').matches; }
  function visible(el) { return el.getClientRects().length > 0 && getComputedStyle(el).visibility !== 'hidden'; }
  function focusable(parent) {
    return Array.from(parent.querySelectorAll('a[href],button:not([disabled]),input:not([disabled]),summary,[tabindex]:not([tabindex="-1"])')).filter(visible);
  }
  function trap(e, items) {
    if (e.key !== 'Tab' || !items.length) return;
    var i = items.indexOf(document.activeElement);
    if (i < 0 || (e.shiftKey && i === 0) || (!e.shiftKey && i === items.length - 1)) {
      e.preventDefault(); items[e.shiftKey ? items.length - 1 : 0].focus();
    }
  }
  function setMenu(next, restore) {
    if (!overlay || !burger) return;
    open = next;
    overlay.classList.toggle('open', open);
    overlay.setAttribute('aria-hidden', String(!open));
    overlay.inert = !open;
    nav.classList.toggle('menu-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Cerrar menú' : 'Abrir menú');
    root.classList.toggle('menu-locked', open);
    if (main) main.inert = open;
    if (footer) footer.inert = open;
    if (open) overlay.querySelector('a').focus({ preventScroll: true });
    else if (restore !== false) burger.focus({ preventScroll: true });
  }
  if (burger) burger.addEventListener('click', function () { setMenu(!open); });
  window.goTo = function (hash) {
    if (!/^#[a-z][a-z0-9_-]*$/i.test(hash)) return;
    var target = document.getElementById(hash.slice(1));
    if (!target) return;
    if (hash === '#main') { target.focus({ preventScroll: true }); target.scrollIntoView(); return; }
    target.scrollIntoView({ behavior: reduce() ? 'instant' : 'smooth' });
  };
  document.addEventListener('click', function (e) {
    if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    var anchor = e.target.closest('a[href^="#"]');
    if (!anchor || anchor.hasAttribute('data-open-case')) return;
    var href = anchor.getAttribute('href');
    if (!/^#[a-z][a-z0-9_-]*$/i.test(href) || !document.getElementById(href.slice(1))) return;
    e.preventDefault();
    if (open) setMenu(false, false);
    window.goTo(href);
  });
  function onScroll() {
    frame = 0;
    if (nav) nav.classList.toggle('float', scrollY > 24);
    if (progress) progress.style.transform = 'scaleX(' + Math.min(1, Math.max(0, scrollY / Math.max(1, root.scrollHeight - innerHeight))) + ')';
    var active = '';
    sections.forEach(function (section) { if (section.getBoundingClientRect().top < 220) active = section.id; });
    links.forEach(function (link) {
      var selected = link.getAttribute('href') === '#' + active;
      link.classList.toggle('active', selected);
      if (selected) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current');
    });
  }
  addEventListener('scroll', function () { if (!frame) frame = requestAnimationFrame(onScroll); }, { passive: true });
  addEventListener('resize', function () { if (open && innerWidth > 880) setMenu(false, false); onScroll(); }, { passive: true });
  onScroll();
  function setBackground(locked) {
    [main, nav, overlay, footer].forEach(function (el) { if (el) el.inert = locked; });
    if (!locked && overlay) overlay.inert = true;
    root.classList.toggle('modal-locked', locked);
  }
  function showCase(id, push) {
    var template = document.getElementById('case-template-' + id);
    if (!modal || !template || !template.content) return false;
    var wasOpen = modal.classList.contains('cs-open');
    if (!wasOpen && !returnFocus) returnFocus = document.activeElement;
    var body = template.content.firstElementChild.cloneNode(true);
    // The standalone page uses h1; the dialog is labelled by its persistent top bar.
    var heading = body.querySelector('h1');
    if (heading) {
      var h2 = document.createElement('h2'); h2.className = heading.className;
      while (heading.firstChild) h2.appendChild(heading.firstChild);
      heading.replaceWith(h2);
    }
    document.getElementById('cs-top-name').textContent = body.dataset.caseName;
    document.getElementById('cs-top-num').textContent = body.dataset.caseNumber;
    content.replaceChildren(body);
    scroller.scrollTop = 0;
    modal.inert = false;
    modal.classList.add('cs-open');
    modal.setAttribute('aria-hidden', 'false');
    currentCase = id;
    setBackground(true);
    closeButton.focus({ preventScroll: true });
    if (push !== false) history[wasOpen ? 'replaceState' : 'pushState']({ portfolioModal: true, caseStudy: id }, '', '#case-study-' + id);
    dispatchEvent(new CustomEvent('portfolio:case-open', { detail: id }));
    return true;
  }
  function closeCase(navigate) {
    if (!modal || !modal.classList.contains('cs-open')) return;
    if (navigate !== false && history.state && history.state.portfolioModal) { history.back(); return; }
    modal.classList.remove('cs-open');
    modal.setAttribute('aria-hidden', 'true');
    setBackground(false);
    if (returnFocus && returnFocus.isConnected) returnFocus.focus({ preventScroll: true });
    modal.inert = true; currentCase = null;
    dispatchEvent(new Event('portfolio:case-close'));
    if (navigate !== false) history.replaceState(null, '', location.pathname + location.search + '#work');
  }
  document.addEventListener('click', function (e) {
    if (e.button !== 0 || e.ctrlKey || e.metaKey || e.shiftKey || e.altKey) return;
    var trigger = e.target.closest('[data-open-case]');
    if (!trigger) return;
    var id = trigger.dataset.openCase;
    if (!document.getElementById('case-template-' + id)) return;
    e.preventDefault(); returnFocus = trigger; showCase(id);
  });
  [document.getElementById('cs-btn-back'), closeButton].forEach(function (button) {
    if (button) button.addEventListener('click', function () { closeCase(); });
  });
  document.addEventListener('keydown', function (e) {
    if (currentCase) {
      if (e.key === 'Escape') { e.preventDefault(); closeCase(); } else trap(e, focusable(modal));
    } else if (open) {
      if (e.key === 'Escape') { e.preventDefault(); setMenu(false); }
      else trap(e, focusable(nav.querySelector('.nav-actions')).concat(focusable(overlay)));
    }
  });
  function syncHash() {
    var match = location.hash.match(/^#case-study-([a-z0-9_-]+)$/i);
    if (match && showCase(match[1], false)) return;
    closeCase(false);
  }
  addEventListener('popstate', syncHash);
  syncHash();
  document.querySelectorAll('[data-year]').forEach(function (el) { el.textContent = String(new Date().getFullYear()); });
  window.__portfolioReady = true;
})();
