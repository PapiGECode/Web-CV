/* Decorative input feedback; values, validation and delivery stay in contact.js. */
(() => {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const timers = new Map();
  function stop(field) {
    clearTimeout(timers.get(field));
    timers.delete(field);
    field.classList.remove('is-typing');
  }
  form.addEventListener('input', event => {
    if (!event.target.matches('.f-input, .f-textarea')) return;
    const field = event.target.closest('.f-field');
    stop(field);
    if (!event.target.value) return;
    field.classList.add('is-typing');
    timers.set(field, setTimeout(() => stop(field), 650));
  });
  form.addEventListener('focusout', event => {
    const field = event.target.closest('.f-field');
    if (field) stop(field);
  });
  form.addEventListener('reset', () => {
    // Filled styling is derived from native :placeholder-shown after reset completes.
    for (const field of timers.keys()) stop(field);
  });
})();
