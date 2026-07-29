// Vercel serverless function: fetches full details for one game (synopsis,
// genres, release date) once the user picks it from search results. The id
// is prefixed by provider (rawg-123, igdb-456, steam-789) so we know which
// upstream API to call.

function stripHtml(html) {
  return (html || "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\s+/g, " ")
    .trim();
}

async function rawgDetails(id, apiKey) {
  const res = await fetch(`https://api.rawg.io/api/games/${id}?key=${apiKey}`);
  if (!res.ok) throw new Error(`RAWG responded with ${res.status}`);
  const g = await res.json();
  return {
    description: stripHtml(g.description_raw || g.description),
    genres: (g.genres || []).map((x) => x.name),
    released: g.released || null,
    platforms: (g.platforms || []).map((p) => p.platform.name),
    coverImage: g.background_image || null,
  };
}

let igdbTokenCache = { token: null, expires: 0 };
async function getIgdbToken(clientId, clientSecret) {
  if (igdbTokenCache.token && igdbTokenCache.expires > Date.now()) {
    return igdbTokenCache.token;
  }
  const res = await fetch(
    `https://id.twitch.tv/oauth2/token?client_id=${clientId}&client_secret=${clientSecret}&grant_type=client_credentials`,
    { method: "POST" }
  );
  if (!res.ok) throw new Error("Failed to get IGDB access token");
  const data = await res.json();
  igdbTokenCache = {
    token: data.access_token,
    expires: Date.now() + (data.expires_in - 60) * 1000,
  };
  return igdbTokenCache.token;
}

async function igdbDetails(id, clientId, clientSecret) {
  const token = await getIgdbToken(clientId, clientSecret);
  const res = await fetch("https://api.igdb.com/v4/games", {
    method: "POST",
    headers: {
      "Client-ID": clientId,
      Authorization: `Bearer ${token}`,
      "Content-Type": "text/plain",
    },
    body: `fields name,summary,storyline,genres.name,platforms.name,first_release_date,cover.url; where id = ${id};`,
  });
  if (!res.ok) throw new Error(`IGDB responded with ${res.status}`);
  const [g] = await res.json();
  if (!g) throw new Error("Game not found");
  return {
    description: g.storyline || g.summary || "",
    genres: (g.genres || []).map((x) => x.name),
    released: g.first_release_date
      ? new Date(g.first_release_date * 1000).toISOString().slice(0, 10)
      : null,
    platforms: (g.platforms || []).map((x) => x.name),
    coverImage: g.cover?.url
      ? `https:${g.cover.url.replace("t_thumb", "t_cover_big")}`
      : null,
  };
}

async function steamDetails(appid) {
  const res = await fetch(
    `https://store.steampowered.com/api/appdetails?appids=${appid}&l=english&cc=us`,
    {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36",
        Accept: "application/json",
      },
    }
  );
  if (!res.ok) throw new Error(`Steam responded with ${res.status}`);
  const data = await res.json();
  const entry = data[appid];
  if (!entry || !entry.success) throw new Error("Game not found");
  const g = entry.data;
  return {
    description: stripHtml(g.short_description),
    genres: (g.genres || []).map((x) => x.description),
    released: g.release_date?.date || null,
    platforms: ["PC"],
    coverImage: g.header_image || null,
  };
}

export default async function handler(req, res) {
  const id = (req.query.id || "").toString();
  const [provider, rawId] = id.split(/-(.+)/); // split on first hyphen only

  if (!provider || !rawId) {
    res.status(400).json({ error: "Missing or malformed id" });
    return;
  }

  const { IGDB_CLIENT_ID, IGDB_CLIENT_SECRET, RAWG_API_KEY } = process.env;

  try {
    let details;
    if (provider === "rawg" && RAWG_API_KEY) {
      details = await rawgDetails(rawId, RAWG_API_KEY);
    } else if (provider === "igdb" && IGDB_CLIENT_ID && IGDB_CLIENT_SECRET) {
      details = await igdbDetails(rawId, IGDB_CLIENT_ID, IGDB_CLIENT_SECRET);
    } else if (provider === "steam") {
      details = await steamDetails(rawId);
    } else {
      throw new Error("No provider available for this result");
    }

    res.setHeader("Cache-Control", "s-maxage=86400, stale-while-revalidate");
    res.status(200).json(details);
  } catch (err) {
    res.status(502).json({ error: "Failed to fetch game details", detail: String(err) });
  }
}
