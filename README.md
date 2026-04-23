# IAF VIP Itineraries

Internal-only web app for the India Art Fair team to track VIPs, events, invitations, and RSVPs for IAF 2027.

- **Stack:** Next.js 16 · TypeScript · Tailwind 4 · Supabase (Postgres + Auth + RLS) · @react-pdf/renderer
- **Auth:** Google Workspace sign-in via Supabase
- **Roles:** `admin` (full CRUD) / `viewer` (read-only)

---

## One-time setup

You need **three free accounts**: GitHub, Supabase, Vercel. Then an OAuth client in Google Cloud. Follow in order.

### 1. GitHub

1. Sign up at <https://github.com/signup> using your IAF Workspace email.
2. Create a new repository: **New → private → name it `iaf-vip-itineraries`**. Don't add a README/gitignore — this folder already has them.
3. Push this folder:
   ```bash
   cd "D:/IAF 2027/IT APP"
   git init
   git add .
   git commit -m "Initial commit"
   git branch -M main
   git remote add origin https://github.com/<your-username>/iaf-vip-itineraries.git
   git push -u origin main
   ```

### 2. Supabase

1. Go to <https://supabase.com>, sign in with GitHub.
2. **New project** → pick any name (e.g. `iaf-vip-itineraries`). Choose the closest region (Singapore or Mumbai). Set a strong database password and save it.
3. Wait ~2 minutes for the project to provision.
4. **SQL Editor → New query** → paste the contents of [`supabase/schema.sql`](supabase/schema.sql) → **Run**.
5. (Optional, for sample data) **New query** → paste [`supabase/seed.sql`](supabase/seed.sql) → **Run**.
6. **Project Settings → API** → copy two values:
   - `Project URL` → this is `NEXT_PUBLIC_SUPABASE_URL`
   - `anon` public key → this is `NEXT_PUBLIC_SUPABASE_ANON_KEY`

### 3. Google OAuth (for sign-in)

1. Go to <https://console.cloud.google.com/> and create a new project (or reuse an existing IAF one).
2. **APIs & Services → OAuth consent screen** → **Internal** (restricts to your IAF Workspace). Fill app name = "IAF VIP Itineraries". Save.
3. **Credentials → Create credentials → OAuth client ID → Web application**.
4. Under **Authorized redirect URIs**, add:
   ```
   https://<your-supabase-project>.supabase.co/auth/v1/callback
   ```
   (You'll find the exact URL in Supabase → Authentication → Providers → Google.)
5. Save. Copy the **Client ID** and **Client Secret**.
6. In Supabase: **Authentication → Providers → Google** → enable → paste Client ID and Client Secret → save.

### 4. Local run

1. Copy `.env.local.example` to `.env.local` and fill in the two Supabase values.
2. ```bash
   npm install   # already done during setup
   npm run dev
   ```
3. Open <http://localhost:3000>. Sign in with your Google Workspace email.
4. **First-time admin:** after you sign in, everyone (including you) is a `viewer` by default. Go to **Supabase → Table Editor → profiles** and change your own `role` to `admin`. From then on, you can promote/demote others inside the app (`/admin/users`).

### 5. Deploy to Vercel (free)

1. Go to <https://vercel.com>, sign in with GitHub, **Add New Project → import `iaf-vip-itineraries`**.
2. Framework: Next.js (auto-detected). Root directory: project root.
3. **Environment variables** — add:
   - `NEXT_PUBLIC_SUPABASE_URL`
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY`
4. **Deploy**. Wait ~2 minutes.
5. Copy the deployed URL (e.g. `https://iaf-vip-itineraries.vercel.app`).
6. Back in Supabase: **Authentication → URL Configuration** → set:
   - **Site URL** = your Vercel URL
   - **Redirect URLs** → add your Vercel URL + `/**`

You're live.

---

## Day-to-day use

- **Add a teammate:** ask them to sign in once with their IAF Workspace email. They land as a Viewer. Promote them at `/admin/users`.
- **Add a VIP:** `/vips/new` (admin only).
- **Add an event:** `/events/new` (admin only).
- **Invite VIPs to an event:** open the VIP → _All Invitations_ → pick event. Or open the event → _Guest List_ → pick VIP.
- **Track RSVP:** change the status dropdown on any invitation row.
- **Confirmed-heads count** on each event page adds confirmed VIPs + their attending companions. Use this to size catering.
- **Export a PDF itinerary:** open a VIP → _Download PDF_. Sends a clean single-page itinerary for that guest.
- **Export a CSV guest list:** open an event → _Export CSV_.

---

## What's in the box

```
app/
  (app)/             # authenticated routes: dashboard, VIPs, events, admin
  login/             # Google sign-in
  auth/              # OAuth callback + sign-out
components/          # Button, NavLink, StatusBadge, PageHeader
lib/
  auth.ts            # session / role helpers
  supabase/          # browser + server + proxy clients
  types.ts           # shared types
  utils.ts           # formatters + role/status labels
public/
  logo-stacked.png   # you must add this (see below)
  logo-horizontal.png
supabase/
  schema.sql         # tables, enums, RLS, triggers
  seed.sql           # sample VIPs, events, invitations
proxy.ts             # Next 16 proxy (formerly middleware) — auth gate
```

### Brand assets

Put the two logo files into `public/`:
- `public/logo-stacked.png` — the square stacked "INDIA / ART / FAIR"
- `public/logo-horizontal.png` — the horizontal one-line version

Used on the login screen and in the header.

---

## Things intentionally left out (v2 ideas)

- Sending invitation emails from the app — for now the team communicates externally.
- Google Calendar / Outlook sync.
- Per-VIP conflict warnings (overlapping accepted events).
- Audit log.
- Bulk CSV import of VIPs from Google Sheets.

---

## Troubleshooting

- **"Infinite redirect to /login"** → your Supabase env vars are wrong or `auth/v1/callback` URL wasn't added to Google OAuth.
- **"No Admin controls visible"** → your profile is `viewer`. Edit `profiles` in Supabase → set `role = 'admin'` for your row.
- **PDF download fails** → PDF is rendered on Node.js runtime. Make sure Vercel project settings keep functions on Node, not Edge.
