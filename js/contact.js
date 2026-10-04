/* Contact controller: real delivery when configured; explicit draft fallback otherwise. */
(() => {
  const form = document.getElementById('contact-form');
  if (!form) return;
  const fields = ['name', 'email', 'message'];
  const submit = form.querySelector('[type="submit"]');
  const label = submit.querySelector('.fs-t');
  const status = document.getElementById('form-ok');
  const mode = document.getElementById('contact-mode');
  const draft = document.getElementById('mail-draft');
  const count = document.getElementById('message-count');
  let available = false;
  let pending = false;
  let previousPayload = '';
  let requestId = '';
  form.hidden = false;

  const value = () => ({
    name: form.elements.name.value.trim(),
    email: form.elements.email.value.trim(),
    message: form.elements.message.value.trim(),
    website: form.elements.website.value.trim(),
  });
  const text = p => `Nombre: ${p.name}\nEmail: ${p.email}\n\n${p.message}`;
  function updateDraft(p = value()) {
    draft.href = `mailto:pablopme50@gmail.com?subject=${encodeURIComponent(`Contacto desde pabloschefer.com — ${p.name}`)}&body=${encodeURIComponent(text(p))}`;
  }
  function show(title, detail, error = false) {
    status.querySelector('.ok-t').textContent = title;
    status.querySelector('.ok-s').textContent = detail;
    status.classList.add('show');
    status.toggleAttribute('data-error', error);
    status.setAttribute('role', error ? 'alert' : 'status');
  }
  function setLabel() {
    label.textContent = pending ? 'Enviando…' : available ? 'Enviar mensaje ↗' : 'Preparar correo ↗';
    if (mode) mode.textContent = available ? 'Envío directo desde la web.' : 'Envío desde tu aplicación de correo. No se envía nada sin tu confirmación.';
  }
  function clearError(field) {
    form.elements[field].removeAttribute('aria-invalid');
    const el = document.getElementById(`${field}-error`);
    if (el) el.textContent = '';
  }
  function errorsFor(p) {
    const errors = {};
    if (p.name.length < 2) errors.name = 'Indica tu nombre (al menos 2 caracteres).';
    if (!form.elements.email.validity.valid || !p.email) errors.email = 'Indica una dirección de email válida.';
    if (p.message.length < 20) errors.message = 'Cuéntame algo más: escribe al menos 20 caracteres.';
    return errors;
  }
  function markErrors(errors) {
    for (const field of fields) {
      const el = document.getElementById(`${field}-error`);
      if (errors[field]) {
        form.elements[field].setAttribute('aria-invalid', 'true');
        if (el) el.textContent = errors[field];
      }
    }
    const first = fields.find(name => errors[name]);
    if (first) form.elements[first].focus();
  }
  form.addEventListener('input', e => {
    if (fields.includes(e.target.name)) clearError(e.target.name);
    if (count) count.textContent = `${form.elements.message.value.length.toLocaleString('es-ES')} / 4.000`;
    updateDraft();
  });
  form.addEventListener('submit', async e => {
    e.preventDefault();
    if (pending) return;
    fields.forEach(clearError);
    const p = value();
    const errors = errorsFor(p);
    if (Object.keys(errors).length) { markErrors(errors); return; }
    updateDraft(p);
    if (!available) {
      draft.hidden = false;
      show('Borrador listo', 'Abre tu aplicación de correo para revisar y enviar el mensaje.');
      draft.focus();
      return;
    }
    const signature = JSON.stringify(p);
    if (signature !== previousPayload) {
      previousPayload = signature;
      requestId = crypto.randomUUID();
    }
    pending = true;
    submit.disabled = true;
    form.setAttribute('aria-busy', 'true');
    setLabel();
    try {
      const response = await fetch('/api/contact', {
        method: 'POST', signal: AbortSignal.timeout(12000),
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ ...p, requestId }),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok || data.mode !== 'sent' || !data.ok || !data.id) {
        if (data.errors) markErrors(data.errors);
        if (data.mode === 'unavailable') available = false;
        throw new Error(data.error || 'No se ha podido confirmar el envío. Tu mensaje sigue en el formulario.');
      }
      show('Mensaje enviado', 'El servicio de correo ha aceptado tu mensaje. Te responderé al email indicado.');
      form.reset();
      previousPayload = '';
      requestId = '';
      draft.hidden = true;
      if (count) count.textContent = '0 / 4.000';
      window.dispatchEvent(new CustomEvent('portfolio:event', { detail: 'contact_sent' }));
    } catch (error) {
      updateDraft(p);
      draft.hidden = false;
      show('Tu mensaje no se ha perdido', error.name === 'TimeoutError' || error.name === 'AbortError'
        ? 'El servicio está tardando más de lo previsto. Puedes reintentar o enviarlo desde tu correo.'
        : error.message, true);
    } finally {
      pending = false;
      submit.disabled = false;
      form.removeAttribute('aria-busy');
      setLabel();
    }
  });
  setLabel();
  updateDraft();
  fetch('/api/contact', { signal: AbortSignal.timeout(4000), cache: 'no-store' })
    .then(r => r.ok ? r.json() : null)
    .then(data => { available = data?.available === true; setLabel(); })
    .catch(() => { available = false; setLabel(); });
})();
