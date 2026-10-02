const DEFAULT_USER = "PapiGECode";

function relativeTime(iso) {
  const ts = Date.parse(iso || "");
  if (!Number.isFinite(ts)) return "Reciente";
  const diff = Math.max(0, Math.floor((Date.now() - ts) / 1000));
  if (diff < 60) return "Hace un momento";
  if (diff < 3600) return `Hace ${Math.floor(diff / 60)} min`;
  if (diff < 86400) return `Hace ${Math.floor(diff / 3600)} h`;
  if (diff < 2592000) return `Hace ${Math.floor(diff / 86400)} d`;
  return new Date(ts).toLocaleDateString("es-ES");
}

export default async function handler(req, res) {
  if (req.method !== "GET") {
    res.setHeader("Allow", "GET");
    return res.status(405).json({ ok: false, error: "Method not allowed" });
  }

  const requested = String(req.query?.username || DEFAULT_USER);
  const username = requested.toLowerCase() === DEFAULT_USER.toLowerCase()
    ? DEFAULT_USER
    : DEFAULT_USER;

  try {
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(username)}/events/public?per_page=30`,
      {
        headers: {
          Accept: "application/vnd.github+json",
          "User-Agent": "pabloschefer.com",
          "X-GitHub-Api-Version": "2022-11-28",
        },
      },
    );

    if (!response.ok) {
      throw new Error(`GitHub API status ${response.status}`);
    }

    const events = await response.json();
    const relevant =
      (Array.isArray(events) &&
        events.find((event) =>
          ["PushEvent", "ReleaseEvent", "CreateEvent"].includes(event?.type),
        )) ||
      (Array.isArray(events) ? events[0] : null);

    if (!relevant) {
      return res.status(200).json({
        ok: true,
        repo: "PapiGECode/Web-CV",
        message: "Actividad pública disponible en GitHub",
        time: "Reciente",
        url: "https://github.com/PapiGECode",
        source: "fallback",
      });
    }

    const repoName = relevant.repo?.name || username;
    let message = `Actividad reciente en ${repoName}`;

    if (relevant.payload?.commits?.length) {
      message = String(relevant.payload.commits.at(-1)?.message || message)
        .split("\n")[0]
        .slice(0, 180);
    } else if (relevant.type === "ReleaseEvent" && relevant.payload?.release) {
      message = `Release ${relevant.payload.release.name || relevant.payload.release.tag_name || ""}`.trim();
    } else if (relevant.type === "CreateEvent") {
      const kind = relevant.payload?.ref_type || "recurso";
      const ref = relevant.payload?.ref ? ` ${relevant.payload.ref}` : "";
      message = `Creado ${kind}${ref}`;
    }

    res.setHeader(
      "Cache-Control",
      "public, s-maxage=300, stale-while-revalidate=1800",
    );
    return res.status(200).json({
      ok: true,
      repo: repoName,
      message,
      time: relativeTime(relevant.created_at),
      url: repoName.includes("/")
        ? `https://github.com/${repoName}`
        : `https://github.com/${username}`,
      source: "github",
    });
  } catch (error) {
    res.setHeader(
      "Cache-Control",
      "public, s-maxage=60, stale-while-revalidate=300",
    );
    return res.status(200).json({
      ok: true,
      repo: "PapiGECode/Web-CV",
      message: "Actividad pública disponible en GitHub",
      time: "Reciente",
      url: "https://github.com/PapiGECode",
      source: "fallback",
    });
  }
}
