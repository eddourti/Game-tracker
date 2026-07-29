// Vercel serverless function: multi-platform game search.
//
// Default (no setup needed): searches Steam's public store — covers PC,
// works immediately with zero configuration.
//
// Optional upgrade: if IGDB_CLIENT_ID and IGDB_CLIENT_SECRET are set (free,
// from a Twitch developer app), searches IGDB instead — covers PlayStation,
// Xbox, Switch, Mobile, everything. IGDB is Twitch-backed and far more
// reliable than RAWG, which has had recurring signup/outage problems.
//
// To enable IGDB:
//   1. Create a free app at https://dev.twitch.tv/console/apps
//   2. Get its Client ID and Client Secret
//   3. Add IGDB_CLIENT_ID and IGDB_CLIENT_SECRET as env vars in Vercel

const STEAM_UA =
  "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0 Safari/537.36";

async function searchSteam(term) {
  const url = `https://store.steampowered.com/api/storesearch/?term=${encodeURIComponent(
    term
  )}&l=english&cc=us`;
  const response = await fetch(url, {
    headers: { "User-Agent": STEAM_UA, Accept: "application/json" },
  });
  if (!response.ok) throw new Error(`Steam responded with ${response.status}`);
  const data = await response.json();

  return (data.items || [])
    .filter((item) => item.type === "game")
    .slice(0, 8)
    .map((item) => ({
      id: `steam-${item.id}`,
      name: item.name,
      image: item.tiny_image,
      released: null,
      genres: [],
      platforms: ["PC"],
      source: "steam",
    }));
}

async function searchRawg(term, apiKey) {
  const url = `https://api.rawg.io/api/games?key=${apiKey}&search=${encodeURIComponent(
    term
  )}&page_size=8`;
  const response = await fetch(url);
  if (!response.ok) throw new Error(`RAWG responded with ${response.status}`);
  const data = await response.json();

  return (data.results || []).map((g) => {
    const genres = (g.genres || []).map((x) => x.name);
    const platforms = (g.platforms || []).map((p) => p.platform.name);
    return {
      id: `rawg-${g.id}`,
      name: g.name,
      image: g.background_image,
      released: g.released || null,
      genres,
      platforms,
      source: "rawg",
    };
  });
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

async function searchIgdb(term, clientId, clientSecret) {
  const token = await getIgdbToken(clientId, clientSecret);
  const res = await fetch("https://api.igdb.com/v4/games", {
    method: "POST",
    headers: {
      "Client-ID": clientId,
      Authorization: `Bearer ${token}`,
      "Content-Type": "text/plain",
    },
    body: `search "${term.replace(/"/g, "")}"; fields name,cover.url,genres.name,platforms.name,first_release_date; limit 8;`,
  });
  if (!res.ok) throw new Error(`IGDB responded with ${res.status}`);
  const data = await res.json();

  return data.map((g) => {
    const genres = (g.genres || []).map((x) => x.name);
    const platforms = (g.platforms || []).map((x) => x.name);
    return {
      id: `igdb-${g.id}`,
      name: g.name,
      image: g.cover?.url
        ? `https:${g.cover.url.replace("t_thumb", "t_cover_big")}`
        : null,
      released: g.first_release_date
        ? new Date(g.first_release_date * 1000).toISOString().slice(0, 10)
        : null,
      genres,
      platforms,
      source: "igdb",
    };
  });
}

export default async function handler(req, res) {
  const term = (req.query.q || "").toString().trim();
  if (!term) {
    res.status(400).json({ error: "Missing query param: q" });
    return;
  }

  const { IGDB_CLIENT_ID, IGDB_CLIENT_SECRET, RAWG_API_KEY } = process.env;
  const useIgdb = IGDB_CLIENT_ID && IGDB_CLIENT_SECRET;
  const useRawg = !useIgdb && RAWG_API_KEY;

  const attempts = [];
  if (useIgdb) {
    attempts.push({
      name: "igdb",
      run: () => searchIgdb(term, IGDB_CLIENT_ID, IGDB_CLIENT_SECRET),
    });
  } else if (useRawg) {
    attempts.push({ name: "rawg", run: () => searchRawg(term, RAWG_API_KEY) });
  }
  attempts.push({ name: "steam", run: () => searchSteam(term) });

  let lastError = null;
  for (const attempt of attempts) {
    try {
      const results = await attempt.run();
      res.setHeader("Cache-Control", "s-maxage=3600, stale-while-revalidate");
      res.status(200).json({ results, provider: attempt.name });
      return;
    } catch (err) {
      lastError = err;
      // try the next provider in the chain (e.g. RAWG down -> fall back to Steam)
    }
  }

  res.status(502).json({
    error: "Game search is temporarily unavailable",
    detail: String(lastError),
  });
}
