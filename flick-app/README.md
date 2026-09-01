# Flick

"Better Snapchat." Login with a username/password, build a custom **FlickMoji**
avatar, add friends by username, chat (text + hand-drawn/sticker "flicks"),
post 24‑hour stories, and toggle chat autosave — all running on Cloudflare's
free tier (Pages + Functions + D1).

## What's inside

- **Frontend**: React + Vite (`src/`) — split into small components under
  `src/components/`.
- **Backend**: a single Cloudflare Pages Function (`functions/api/[[path]].js`)
  that handles auth, friends, messages, stories and settings.
- **Database**: Cloudflare D1 (SQLite at the edge) — schema in `schema.sql`.
- Passwords are hashed with salted PBKDF2 (Web Crypto), never stored in
  plain text. Sessions are signed, HttpOnly cookies (not readable by JS).

## 1. Install

```bash
npm install
```

## 2. Add your logo

Drop your logo at `public/assets/flick.png` (square PNG works best — it's
used as the splash icon and favicon). The app still works fine without it.

## 3. Create the D1 database

```bash
npx wrangler login
npx wrangler d1 create flick-db
```

Copy the `database_id` it prints into `wrangler.toml` (replace
`REPLACE_WITH_YOUR_D1_DATABASE_ID`).

Then create the tables:

```bash
npm run db:init:remote      # production database
npm run db:init:local       # (optional) local dev database
```

## 4. Set the session secret

```bash
npx wrangler pages secret put SESSION_SECRET
```

Paste any long random string when prompted — it's used to sign login
sessions. Never commit this value.

## 5. Local development

Two ways:

- **Frontend only, fastest iteration** (API calls will fail until deployed
  or run alongside Functions):
  ```bash
  npm run dev
  ```
- **Full stack locally** (Vite + Functions + local D1), in two terminals:
  ```bash
  npm run dev            # terminal 1: Vite on :5173
  npx wrangler pages dev --d1=DB=flick-db --port 8788 -- npm run dev
  ```
  Vite is configured to proxy `/api/*` to `http://127.0.0.1:8788`.

## 6. Deploy to Cloudflare Pages

**Option A — CLI:**
```bash
npm run build
npx wrangler pages deploy dist --project-name=flick
```

**Option B — Git integration (recommended for ongoing deploys):**
1. Push this folder to a GitHub repo.
2. In the Cloudflare dashboard: Workers & Pages → Create → Pages →
   Connect to Git → pick the repo.
3. Build command: `npm run build` · Build output directory: `dist`.
4. Under Settings → Functions → D1 database bindings, bind `DB` to
   `flick-db`.
5. Under Settings → Environment variables → add the `SESSION_SECRET`
   secret (same value as step 4 above, or a new one — either works, they're
   independent of your CLI login).
6. Deploy. Every push to your main branch redeploys automatically.

That's it — Flick is now live on your `*.pages.dev` URL (or a custom domain
you attach in the Pages dashboard).

## Notes / things worth knowing

- **Autosave** (Settings → Chats): when off, a sent message is still shown
  to the sender for that session but is never written to D1 — mirroring
  "disappearing" chats. Turn it on to persist history across logins.
- **Stories** auto-expire after 24 hours (filtered by timestamp on read);
  old rows aren't purged automatically. If you want a cleanup job, add a
  [Cron Trigger](https://developers.cloudflare.com/workers/configuration/cron-triggers/)
  that deletes `stories` rows older than a day.
- **Images** (snaps/stories) are stored as base64 data URLs directly in D1.
  That's simple and free, but for heavier use you'd swap this for
  [Cloudflare R2](https://developers.cloudflare.com/r2/) object storage and
  store just the URL in D1.
- Everything here uses only Cloudflare's free tier (Pages, Functions, D1).
