(function () {
  'use strict';
  var root = document.documentElement;
  var theme = document.getElementById('theme-toggle');
  function syncTheme() {
    var light = root.classList.contains('light');
    if (theme) { theme.setAttribute('aria-pressed', String(light)); theme.setAttribute('aria-label', light ? 'Cambiar a modo oscuro' : 'Cambiar a modo claro'); }
    var favicon = document.getElementById('favicon');
    if (favicon) favicon.href = '/assets/favicon-' + (light ? 'light' : 'dark') + '-32.png';
  }
  syncTheme();
  if (theme) theme.addEventListener('click', function () {
    var light = root.classList.toggle('light');
    try { localStorage.setItem('ps-theme', light ? 'light' : 'dark'); } catch (_) {}
    syncTheme();
  });
  var systemTheme = matchMedia('(prefers-color-scheme: light)');
  systemTheme.addEventListener('change', function (e) {
    try { if (localStorage.getItem('ps-theme')) return; } catch (_) {}
    root.classList.toggle('light', e.matches); syncTheme();
  });
  var toast = document.getElementById('ui-toast'), timer;
  function notify(text) {
    if (!toast) return;
    clearTimeout(timer); toast.textContent = text; toast.classList.add('show');
    timer = setTimeout(function () { toast.classList.remove('show'); }, 3500);
  }
  document.querySelectorAll('[data-copy-email], [data-copy-url]').forEach(function (button) {
    button.addEventListener('click', async function () {
      var email = button.hasAttribute('data-copy-email');
      try {
        await navigator.clipboard.writeText(email ? 'pablopme50@gmail.com' : location.origin + location.pathname);
        notify(email ? 'Dirección de email copiada.' : 'Enlace copiado.');
      } catch (_) { notify(email ? 'Email: pablopme50@gmail.com' : 'Copia la dirección de la barra del navegador.'); }
    });
  });
  var dialog = document.getElementById('preferences-dialog');
  var checkbox = document.getElementById('allow-measurement');
  var blocked = navigator.globalPrivacyControl === true || navigator.doNotTrack === '1';
  function allowed() {
    if (blocked) return false;
    try { return localStorage.getItem('ps-measurement') === 'yes'; } catch (_) { return false; }
  }
  window.portfolioMeasurementAllowed = allowed;
  document.querySelectorAll('[data-open-preferences]').forEach(function (button) {
    button.addEventListener('click', function () {
      if (!dialog) return;
      checkbox.checked = allowed(); checkbox.disabled = blocked;
      document.getElementById('measurement-note').textContent = blocked
        ? 'Tu navegador solicita no ser medido. Respetamos esa preferencia.'
        : 'Solo se guardará esta elección en este navegador. Puedes revocarla en cualquier momento.';
      dialog.showModal();
    });
  });
  var save = document.getElementById('save-preferences');
  if (save) save.addEventListener('click', function () {
    try { localStorage.setItem('ps-measurement', checkbox.checked && !blocked ? 'yes' : 'no'); } catch (_) {}
    window.dispatchEvent(new Event('portfolio:consent'));
    dialog.close(); notify('Preferencia guardada.');
  });
  if (dialog) dialog.addEventListener('click', function (e) {
    if (e.target !== dialog) return;
    var r = dialog.getBoundingClientRect();
    if (e.clientX < r.left || e.clientX > r.right || e.clientY < r.top || e.clientY > r.bottom) dialog.close();
  });
})();
