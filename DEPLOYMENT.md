# Angel 11+ — Deployment Guide

> Platform: Vercel  
> Database: Supabase  
> AI: OpenAI

---

## 1. Environment Variables

Set all of these in Vercel → Project → Settings → Environment Variables.

### Required

| Variable | Where to find it | Notes |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | supabase.com → Project → Settings → API → Project URL | Must start with `https://` |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | supabase.com → Project → Settings → API → anon public key | Safe to expose client-side |
| `OPENAI_API_KEY` | platform.openai.com → API keys | Server-only. Never prefix with `NEXT_PUBLIC_`. |

### Optional

| Variable | Default | Notes |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://angel11plus.com` | Used for Open Graph `metadataBase` and canonical URLs. Set to your Vercel production URL or custom domain. |

### Environments

Apply `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` to **Production**, **Preview**, and **Development**.

Apply `OPENAI_API_KEY` to **Production** and **Preview** only. Writing AI feedback is not needed for local development unless actively testing that feature.

`NEXT_PUBLIC_APP_URL` should differ per environment:
- Production: `https://your-custom-domain.com` or `https://your-app.vercel.app`
- Preview: Vercel sets `VERCEL_URL` automatically — you can set `NEXT_PUBLIC_APP_URL` to `https://${VERCEL_URL}` via a Vercel system env var

---

## 2. Supabase Setup

### Database Tables

Run these SQL statements in the Supabase SQL editor (supabase.com → Project → SQL editor):

```sql
-- Profiles: one row per anonymous device or authenticated user
create table if not exists profiles (
  id uuid primary key default gen_random_uuid(),
  device_id text unique,
  auth_user_id uuid unique references auth.users(id),
  name text default 'Angel',
  created_at timestamptz default now()
);

-- Lesson completions
create table if not exists lesson_progress (
  id uuid primary key default gen_random_uuid(),
  profile_id uuid references profiles(id) on delete cascade,
  lesson_id text not null,
  subject text not null,
  score integer not null,
  xp_gained integer not null,
  completed_at timestamptz default now()
);

-- Rolled-up stats (upserted after each session)
create table if not exists user_stats (
  profile_id uuid primary key references profiles(id) on delete cascade,
  total_xp integer default 0,
  streak integer default 0,
  last_activity date,
  updated_at timestamptz default now()
);
```

### Row-Level Security

Enable RLS and add policies so users can only read/write their own data:

```sql
alter table profiles enable row level security;
alter table lesson_progress enable row level security;
alter table user_stats enable row level security;

-- Profiles: device-based access (anon key, no auth required)
create policy "profiles_open" on profiles for all using (true) with check (true);

-- Lesson progress: open insert/read (scoped by profile_id in app code)
create policy "lesson_progress_open" on lesson_progress for all using (true) with check (true);

-- User stats: open upsert/read
create policy "user_stats_open" on user_stats for all using (true) with check (true);
```

> **Note:** These policies are permissive for the MVP. Before adding sensitive parent/payment data, tighten policies to `auth.uid()` checks.

### Authentication: Redirect URLs

In Supabase → Authentication → URL Configuration:

**Site URL** (production):
```
https://your-custom-domain.com
```

**Redirect URLs** — add all of these:

```
https://your-custom-domain.com/dashboard
https://your-custom-domain.com/**
https://your-app.vercel.app/dashboard
https://your-app.vercel.app/**
http://localhost:3000/dashboard
http://localhost:3000/**
```

Magic links send the user to `/dashboard` after sign-in (configured in `components/providers/AuthProvider.tsx`).

**IMPORTANT:** If you add preview deployments, Supabase does not support wildcard subdomains like `https://*.vercel.app`. Add each preview URL individually, or use a redirect proxy pattern.

### Auth Callback Example (Production)

When a user clicks the magic link:
```
https://your-custom-domain.com/dashboard#access_token=...&refresh_token=...&type=magiclink
```

Supabase JS automatically detects this token in the URL (`detectSessionInUrl: true` in `lib/supabase.ts`) and establishes the session.

---

## 3. Vercel Deployment Steps

### First Deploy

1. Push code to GitHub (or connect directly)
2. Import project in vercel.com → New Project
3. Framework preset: **Next.js** (auto-detected)
4. Add all environment variables from Section 1
5. Deploy

### Subsequent Deploys

Push to `main` → Vercel builds automatically.

### Build Command
```
npm run build
```

### Output Directory
`.next` (auto-detected)

### Node.js Version
18.x or 20.x (set in Vercel → Settings → General → Node.js Version)

---

## 4. Vercel Environment Variable Quick Reference

Copy-paste into Vercel dashboard:

```
Name:  NEXT_PUBLIC_SUPABASE_URL
Value: https://xxxxxxxxxxxx.supabase.co
Env:   Production, Preview, Development

Name:  NEXT_PUBLIC_SUPABASE_ANON_KEY
Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
Env:   Production, Preview, Development

Name:  OPENAI_API_KEY
Value: sk-proj-...
Env:   Production, Preview

Name:  NEXT_PUBLIC_APP_URL
Value: https://your-custom-domain.com
Env:   Production only
```

---

## 5. OpenAI Setup

1. Go to platform.openai.com → API keys → Create new secret key
2. Name it: `Angel 11+ Production`
3. Add to Vercel as `OPENAI_API_KEY`
4. Recommended: set a monthly spend limit under Billing → Usage limits

The app uses **gpt-4o-mini** at `temperature: 0.3`, `max_tokens: 900` per request.  
Estimated cost: ~$0.001 per writing feedback request.

If `OPENAI_API_KEY` is missing or invalid, the writing feedback endpoint returns a 503 with the message: `"AI feedback is not configured on this server."` — the rest of the app is unaffected.

---

## 6. iPad / PWA Notes

### Installing on iPad (Safari)
1. Open the app in Safari
2. Tap the Share button (box with arrow)
3. Tap **Add to Home Screen**
4. Name it "Angel 11+" → tap **Add**

The app will launch in standalone mode (no browser chrome) using the config in `public/manifest.json`.

### PWA Requirements Checklist
- [x] `manifest.json` present at `/manifest.json`
- [x] `icon-192.png` — 192×192 PNG in `/public/`
- [x] `icon-512.png` — 512×512 PNG in `/public/`
- [x] `theme_color` matches brand purple (`#7c3aed`)
- [x] `display: standalone` in manifest
- [x] `<meta name="theme-color">` via Next.js `viewport` export
- [ ] Service Worker (Phase 9 — offline support)
- [ ] `og-image.png` (1200×630) — add once brand assets are ready

### Safari iOS Quirks
- Safari does not support `userScalable: false` in all cases — acceptable
- Magic link auth: after tapping the email link, Safari opens the app URL and the Supabase session is established via `detectSessionInUrl`
- Keyboard: `autoFocus` on the login input may not trigger the keyboard automatically on iOS — expected iOS behaviour

---

## 7. Troubleshooting

### Build Fails: "Module not found"
- Check all imports use `@/` alias (maps to project root)
- Run `npm install` to ensure `node_modules` is up to date

### Supabase: "Invalid URL" or client returns null
- Confirm `NEXT_PUBLIC_SUPABASE_URL` starts with `https://` and ends in `.supabase.co`
- The client has a fallback: it attempts to derive the URL from the JWT if the URL field contains a publishable key (`sb_publishable_...`) — this handles copy-paste errors

### Magic Link Not Arriving
- Check Supabase → Authentication → Logs for send errors
- Verify the user's email is not on Supabase's bounce list
- Check spam folder
- Supabase free tier: 2 emails per hour per address, 3 per hour across the project

### Magic Link Redirects to Wrong URL
- Confirm the redirect URL is in Supabase → Auth → URL Configuration → Redirect URLs
- The `emailRedirectTo` is set to `window.location.origin + "/dashboard"` in `AuthProvider.tsx` — verify the origin is correct for your environment

### Writing Feedback Returns 503
- `OPENAI_API_KEY` is missing or not set for this environment
- Add it in Vercel → Settings → Environment Variables

### Progress Not Syncing to Supabase
- Check browser console for `[Supabase]` warnings
- Verify the `profiles`, `lesson_progress`, `user_stats` tables exist and have RLS policies applied
- Progress is synced fire-and-forget — the UI never waits for Supabase writes

### Hydration Mismatch Warning
- All content pages are `"use client"` to avoid server/client state divergence from localStorage reads
- If a new server component reads localStorage-derived state, move it to a client component

### Icons Not Showing on Home Screen
- Verify `/icon-192.png` and `/icon-512.png` are in the `public/` directory
- Hard-refresh Safari after adding to Home Screen
- Run the icon generator if needed: `node scripts/generate-icons.js`

---

## 8. Local Development

```bash
# Install
npm install

# Copy env template
cp .env.local.example .env.local
# Fill in NEXT_PUBLIC_SUPABASE_URL and NEXT_PUBLIC_SUPABASE_ANON_KEY

# Start dev server
npm run dev
# → http://localhost:3000

# Production build check
npm run build && npm run start

# Regenerate PWA icons
node scripts/generate-icons.js
```

The app works fully without Supabase configured. Progress is stored in localStorage only.  
Writing AI feedback requires a valid `OPENAI_API_KEY` in `.env.local`.
