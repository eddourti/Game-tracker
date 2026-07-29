# Game Tracker

Track every game you've started: status, % progress, rating, and notes on
where you left off. Built for story-heavy backlogs but works for anything.

## Run locally

```bash
npm install
npm run dev
```

## Deploy to Vercel (free)

1. Push this folder to a new GitHub repo.
2. Go to vercel.com → **Add New Project** → import that repo.
3. Vercel auto-detects Vite. Leave settings as default and click **Deploy**.
4. Done — you get a free `your-project.vercel.app` URL.

No environment variables, database, or backend needed.

## How your data is saved

Your games are saved in your **browser's localStorage**, tied to the device
and browser you're using. That means:

- Refreshing the page is 100% safe — nothing is lost.
- Data does **not** sync across devices or browsers (a phone and a laptop
  each have their own separate list).
- Clearing your browser's site data / cache will wipe it.

Use the **Backup** button in the app to export a `.json` file any time, and
**Restore from file** to load it back in (or move it to another browser).
Do this occasionally, especially before clearing browser data.

If you later want real cross-device sync, see the **Supabase** section
below — it's a free, ~5 minute setup.

## Syncing your data across devices (Supabase — free)

By default this app saves to your browser's localStorage (works
immediately, no setup, but doesn't sync across devices). To get real
cross-device sync:

1. Go to [supabase.com](https://supabase.com), sign up free, create a new
   project (takes ~2 min to provision).
2. In your project: **SQL Editor → New query**, paste the contents of
   `supabase-schema.sql` (included in this project), click **Run**. This
   creates the `games` table.
3. In your project: **Settings → API**, copy the **Project URL** and the
   **anon public** key.
4. In Vercel → your project → **Settings → Environment Variables**, add:
   - `VITE_SUPABASE_URL` = the Project URL
   - `VITE_SUPABASE_ANON_KEY` = the anon public key
5. Redeploy.

Once that's live, the app auto-generates an 8-character **sync code** the
first time it loads (visible in **Backup & bulk add**). Enter that same
code on another device (phone, another browser) to see the same library
there — no login required.

**Worth knowing:** this is a shared-code system, not real authentication.
Anyone who has both your sync code *and* access to your Supabase anon key
(which is unavoidably public in a client-only app's code) could technically
read or write that data. Fine for a personal backlog list — just don't
treat the sync code like a password, and don't put sensitive info in notes.

If you don't set up Supabase, the app keeps working exactly as before on
localStorage — nothing breaks.

## Adding games — multi-platform search

Click **+ Add game**, pick the **Platform** (PC, PS5, PS4, Xbox Series X|S,
Xbox One, Switch, Mobile, Other), then use the **Search game database** box
— type a title like "Elden Ring" and it searches for real cover art,
release year, and a best-guess category (Story vs Other). Click a result,
adjust anything, save.

**The search works out of the box with zero setup** — it defaults to
Steam's public search, which covers PC titles with no API key needed.

**Optional upgrades**, tried in this order if configured:

1. **IGDB** (best — covers every platform, Twitch-backed, very reliable).
   Free setup: create an app at
   [dev.twitch.tv/console/apps](https://dev.twitch.tv/console/apps), then in
   Vercel → **Settings → Environment Variables** add `IGDB_CLIENT_ID` and
   `IGDB_CLIENT_SECRET`.
2. **RAWG** (also multi-platform, but their site has had recurring
   outages/signup issues). If you have a key, add it as `RAWG_API_KEY` in
   the same place.
3. Falls back to **Steam** automatically if the above aren't set or fail.

Redeploy after adding any environment variable for it to take effect.

This works via a serverless function (`/api/games-search.js`) — it **will
not work** with plain `npm run dev` (Vite doesn't run serverless functions
locally). To test it before deploying, use `npx vercel dev`, or just deploy
and test live.

Prefer typing things in yourself, or want to bulk-add from screenshots?
The **Backup → Bulk add** box still works: paste `Title, Category` lines
(one per game) and hit **Add all**. Send me screenshots of your library in
chat and I'll sort them into categories for you to paste in.
