# Cloud Workspace Guide — Angel 11+

This repository is configured for **GitHub Codespaces** and the **VS Code browser editor**.  
No local installation required.

---

## Quick Start

1. Click **Code → Codespaces → Create codespace on main** on GitHub
2. Wait for container setup (~2 minutes on first launch; instant on resume)
3. When the terminal shows `Setup complete`, run:
   ```bash
   npm run dev
   ```
4. Click **Open in Browser** when the port 3000 notification appears

The app loads immediately. Progress is stored in `localStorage` — no secrets needed.

---

## Environment Variables (Secrets)

Secrets are **never stored in files** inside a Codespace.  
They are set once in GitHub and injected automatically on every Codespace startup.

**Where to set them:**

```
GitHub → Repository (angel-11plus) → Settings
  → Secrets and variables → Codespaces
  → New repository secret
```

**Required variables (for cloud sync and AI features):**

| Variable | Required for | Where to find it |
|---|---|---|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase cloud sync | app.supabase.com → Project → Settings → API → Project URL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase cloud sync | app.supabase.com → Project → Settings → API → anon public key |
| `OPENAI_API_KEY` | AI writing feedback | platform.openai.com → API keys |

**Optional variables:**

| Variable | Default | Notes |
|---|---|---|
| `NEXT_PUBLIC_APP_URL` | `https://angel11plus.com` | Only affects OG metadata. Leave unset in Codespaces. |

**Verifying secrets are injected** (run in Codespace terminal):

```bash
echo "Supabase URL: ${NEXT_PUBLIC_SUPABASE_URL:-(not set)}"
echo "Supabase Key: ${NEXT_PUBLIC_SUPABASE_ANON_KEY:-(not set)}"
echo "OpenAI Key:   ${OPENAI_API_KEY:-(not set)}"
```

---

## What Works Without Secrets

| Feature | Without secrets | With Supabase | With OpenAI |
|---|---|---|---|
| All lesson content | ✅ Full access | ✅ | ✅ |
| Progress tracking | ✅ localStorage only | ✅ Synced to cloud | ✅ |
| Adaptive difficulty | ✅ | ✅ | ✅ |
| Mock test engine | ✅ | ✅ | ✅ |
| AI writing feedback | ❌ Returns 503 | ❌ | ✅ |
| Cross-device progress | ❌ | ✅ | ✅ |
| Magic link login | ❌ | ✅ | ✅ |

---

## Dev Commands

| Command | Purpose |
|---|---|
| `npm run dev` | Start dev server on port 3000 |
| `npm run build` | Production build check (catches type errors) |
| `npm run lint` | ESLint |
| `npx tsc --noEmit` | TypeScript type check without building |

---

## Codespace Workflow

```
Start work:
  Resume Codespace (or create new) → npm run dev → open port 3000

Make changes:
  Edit files in VS Code browser → hot reload at port 3000

Commit and push:
  git add <files>
  git commit -m "your message"
  git push origin main

Stop work:
  Close the browser tab — Codespace auto-suspends after inactivity
  (or: Codespaces menu → Stop codespace to suspend immediately)
```

**Do not delete your Codespace** between sessions — resuming is instant and preserves your editor state.  
Stopping (suspending) is free; only running time is billed.

---

## Codespace Resource Notes

- **Machine type:** 2-core, 4GB RAM (default) — sufficient for `npm run dev`
- **Free tier:** 60 core-hours/month on personal accounts = 30 hours on 2-core
- **Storage:** 32GB (default) — more than enough for this repo (320KB source)
- **Port forwarding:** Port 3000 is automatically detected and forwarded to a public HTTPS URL

---

## Troubleshooting

**Dev server doesn't start:**
```bash
# Confirm dependencies installed
ls node_modules/.package-lock.json && echo "OK" || npm install
npm run dev
```

**Supabase not connecting:**
```bash
echo $NEXT_PUBLIC_SUPABASE_URL   # must return a value
# If empty → set in GitHub → Settings → Secrets and variables → Codespaces
```

**TypeScript errors on save:**
```bash
npx tsc --noEmit   # see full error list
```

**Port 3000 not appearing:**
- Click the **Ports** tab at the bottom of VS Code
- Look for port 3000 with status "Running"
- Click the globe icon to open in browser

---

## Local Development (reference)

```bash
# 1. Clone
git clone https://github.com/abs365/angel-11plus.git
cd angel-11plus

# 2. Install
npm install

# 3. Configure secrets
cp .env.example .env.local
# Edit .env.local and fill in your values

# 4. Start
npm run dev
# → http://localhost:3000
```
