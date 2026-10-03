export const config = { runtime: "edge" };

const USERNAME = "PapiGECode";

function json(data, status = 200, cacheControl = "public, s-maxage=300, stale-while-revalidate=1800") {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "content-type": "application/json; charset=utf-8",
      "cache-control": cacheControl,
      "x-robots-tag": "noindex",
    },
  });
}

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

export default async function handler(request) {
  if (request.method !== "GET") {
    return json(
      { ok: false, error: "Method not allowed" },
      405,
      "no-store",
    );
  }

  try {
    const response = await fetch(
      `https://api.github.com/users/${encodeURIComponent(USERNAME)}/events/public?per_page=30`,
      {
        signal: AbortSignal.timeout(4500),
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
      return json({
        ok: true,
        repo: "PapiGECode/Web-CV",
        message: "Actividad pública disponible en GitHub",
        time: "GitHub",
        url: "https://github.com/PapiGECode",
        source: "fallback",
      });
    }

    const repoName = relevant.repo?.name || USERNAME;
    let message = `Actividad reciente en ${repoName}`;

    if (relevant.payload?.commits?.length) {
      message = String(
        relevant.payload.commits[relevant.payload.commits.length - 1]?.message ||
          message,
      )
        .split("\n")[0]
        .slice(0, 180);
    } else if (relevant.type === "ReleaseEvent" && relevant.payload?.release) {
      message = `Release ${
        relevant.payload.release.name ||
        relevant.payload.release.tag_name ||
        ""
      }`.trim();
    } else if (relevant.type === "CreateEvent") {
      const kind = relevant.payload?.ref_type || "recurso";
      const ref = relevant.payload?.ref ? ` ${relevant.payload.ref}` : "";
      message = `Creado ${kind}${ref}`;
    }

    return json({
      ok: true,
      repo: repoName,
      message,
      time: relativeTime(relevant.created_at),
      createdAt: relevant.created_at,
      url: repoName.includes("/")
        ? `https://github.com/${repoName}`
        : `https://github.com/${USERNAME}`,
      source: "github",
    });
  } catch {
    return json(
      {
        ok: true,
        repo: "PapiGECode/Web-CV",
        message: "Actividad pública disponible en GitHub",
        time: "GitHub",
        url: "https://github.com/PapiGECode",
        source: "fallback",
      },
      200,
      "public, s-maxage=60, stale-while-revalidate=300",
    );
  }
}
