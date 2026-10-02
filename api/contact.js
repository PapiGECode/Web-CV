const TARGET_EMAIL = "pablopme50@gmail.com";

function clean(value, max) {
  return String(value || "")
    .replace(/[\u0000-\u001F\u007F]/g, " ")
    .trim()
    .slice(0, max);
}

function validEmail(value) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);
}

export default async function handler(req, res) {
  res.setHeader("Cache-Control", "no-store");
  res.setHeader("X-Robots-Tag", "noindex");

  if (req.method !== "POST") {
    res.setHeader("Allow", "POST");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const contentLength = Number(req.headers["content-length"] || 0);
  if (contentLength > 12000) {
    return res.status(413).json({ ok: false, error: "Payload too large" });
  }

  const origin = req.headers.origin;
  const host = req.headers.host;
  if (origin && host) {
    try {
      if (new URL(origin).host !== host) {
        return res.status(403).json({ ok: false, error: "Invalid origin" });
      }
    } catch {
      return res.status(403).json({ ok: false, error: "Invalid origin" });
    }
  }

  const body = req.body || {};
  if (clean(body.website, 200)) {
    return res.status(200).json({ ok: true, mode: "ignored" });
  }

  const name = clean(body.name, 100);
  const email = clean(body.email, 200);
  const message = clean(body.message, 4000);

  if (!name || !validEmail(email) || message.length < 5) {
    return res.status(400).json({
      ok: false,
      error: "Revisa el nombre, email y mensaje.",
    });
  }

  const subject = encodeURIComponent(
    `Contacto desde pabloschefer.com — ${name}`,
  );
  const mailBody = encodeURIComponent(
    `Nombre: ${name}\nEmail: ${email}\n\n${message}`,
  );

  // If a transactional email provider is connected in the future, this
  // endpoint can deliver server-side without changing the frontend.
  return res.status(200).json({
    ok: true,
    mode: "mailto",
    mailto: `mailto:${TARGET_EMAIL}?subject=${subject}&body=${mailBody}`,
  });
}
