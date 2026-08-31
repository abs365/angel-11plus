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

### Database Tables and Migrations

**Do not hand-copy schema SQL from this document** — a prior version of this section had drifted from the real schema (it described permissive `for all using (true)` RLS policies that don't match migration 001's actual `disable row level security` statements, and predated ALI/beta-submission tables entirely). **The `supabase/migrations/*.sql` files are the single source of truth.**

Run every file in `supabase/migrations/`, **in numeric order, each as its own separate SQL Editor execution** (not batched together — migration 004 uses `ALTER TYPE ... ADD VALUE`, which Postgres cannot use in the same transaction that adds it):

| Migration | Adds |
|---|---|
| `001_initial_schema.sql` | `profiles`, `user_stats`, `lesson_progress` (RLS disabled — anonymous, device-based access) |
| `002_add_auth_user_id.sql` | Links anonymous device profiles to Supabase Auth users |
| `003_analytics_view.sql` | Read-only analytics views |
| `004_ali_subject_enum.sql` – `007_ali_learning_unit.sql` | Angel Learning Intelligence (ALI) schema — see `ALI_PRODUCTION_ACTIVATION_CHECKLIST.md` for the detailed run order, confirmation queries, and rollback notes |
| `008_admin_and_beta_submissions.sql` | Real Supabase-Auth-gated admin access (`is_admin`, `is_current_user_admin()`) + `feedback_submissions`/`bug_reports`/`feature_requests`/`beta_family_applications`/`testimonials` tables with RLS (public insert, admin-only select) |

**Bootstrapping the first admin (required for `/admin-beta` to work at all):** sign in once via the app's normal magic-link flow, then run one statement in the Supabase Dashboard SQL Editor — exact SQL is in `008_admin_and_beta_submissions.sql`'s closing comment. There is no self-service admin path by design.

**As of this document's last update, migrations 004–008 have not been applied to any production Supabase project** — confirm current status against `ALI_VERSION.md`'s "Known gaps" section before assuming otherwise.

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
- [x] `theme_color` matches brand blue (`#2563eb` — updated from purple `#7c3aed`, Zero-Purple pass 2026-08-31)
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
