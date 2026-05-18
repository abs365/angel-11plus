# Angel 11+ — Project Context

> Last updated: May 2026  
> Status: Production platform (Phase 8+)

---

## 1. What This Is

Angel 11+ is a private, iPad-first web application that prepares children (aged 9–11) for the Essex CSSE selective school entrance examination. It delivers adaptive practice across all four examined disciplines: English comprehension, Maths reasoning, Vocabulary, and Creative Writing.

The platform operates without mandatory accounts. Every child gets a persistent anonymous profile tied to their device from the first session. Signing in with a magic link links that anonymous profile to an email address so progress survives device changes.

---

## 2. Technology Stack

| Layer | Choice | Notes |
|---|---|---|
| Framework | Next.js 16 (App Router) | React 19, TypeScript strict |
| Styling | Tailwind CSS v4 | No config file — uses CSS `@theme` |
| Auth + DB | Supabase | Magic-link only, anonymous profiles |
| AI | OpenAI gpt-4o-mini | Writing feedback only |
| Charts | Recharts | Progress page only |
| Icons | Lucide React | |
| Hosting target | Vercel | |

---

## 3. Architecture Overview

```
app/
  layout.tsx            — Root layout, AuthProvider, metadata
  page.tsx              — Server redirect → /dashboard
  loading.tsx           — Global route-transition skeleton
  error.tsx             — Global error boundary (child-friendly)
  dashboard/            — Main hub: XP, daily mission, subject cards
  login/                — Magic-link auth form
  english/              — Lesson list + [id] lesson player
  maths/                — Reasoning + Arithmetic modes
  vocabulary/           — Flashcard sessions
  writing/              — Prompted writing + AI feedback
  mock-test/            — 45-minute full timed exam
  progress/             — Analytics, badges, skill breakdown
  api/writing-feedback/ — Server-only OpenAI proxy

components/
  providers/AuthProvider.tsx  — Session state, signInWithMagicLink
  Navigation.tsx              — Tab bar (mobile-first)
  PageLayout.tsx              — Consistent page wrapper
  SubjectCard.tsx / XPBar.tsx / InsightCard.tsx / ...

lib/
  supabase.ts           — Singleton client, URL resolution
  supabaseProgress.ts   — Device identity, lesson sync, stats upsert
  migrateProgress.ts    — localStorage → Supabase migration on auth
  analytics.ts          — computeAnalytics() — pure function
  adaptiveEngine.ts     — computeAdaptiveState() — pure function
  gamification.ts       — computeGamification() — pure function

data/
  lessons.ts / maths.ts / vocabulary.ts / writing.ts  — Static JSON content

types/
  index.ts / analytics.ts / adaptive.ts / gamification.ts / supabase.ts
```

---

## 4. Progress Persistence Model

Progress is stored in two layers that sync automatically:

**Layer 1 — localStorage** (`angel11plus_progress`)  
All XP, scores, streaks, completed lessons, and skill breakdowns. Instant reads, zero latency. Works fully offline.

**Layer 2 — Supabase** (background sync)  
- `profiles` table: one row per device (`device_id`) or authenticated user (`auth_user_id`)
- `lesson_progress` table: one row per completed lesson (score, XP gained, timestamp)
- `user_stats` table: denormalised totals (total_xp, streak, last_activity)

Writes to Supabase happen fire-and-forget after every lesson completion. They never block the UI. If Supabase is unconfigured the app runs fully from localStorage.

When a child signs in with a magic link, their anonymous device profile is linked to their auth user ID. All existing progress is preserved.

---

## 5. Analytics Engine (`lib/analytics.ts`)

`computeAnalytics(progress)` is a pure function — no side effects, no API calls.

Outputs:
- `SubjectAnalytics[]` — per-subject average score, attempt count, status (`not-started | weak | developing | strong`)
- `SkillAnalytics[]` — per-skill breakdown (inference, fractions, reasoning, etc.) estimated from lesson scores
- `LearningInsight[]` — prioritised, text-based coaching insights
- `AnalyticsReport` — rolled-up summary used by dashboard and adaptive engine

Skill scores for English are estimated by distributing each lesson's percentage score across its question skills, weighted by marks. Maths skill scores are recorded exactly per question via `recordSkillResult`.

---

## 6. Adaptive Engine (`lib/adaptiveEngine.ts`)

`computeAdaptiveState(progress, report)` is a pure function.

Outputs:
- `englishTier / mathsTier` — one of `foundation | developing | advanced | challenge`
- `recommendedEnglishLesson` — specific lesson ID to attempt next
- `recommendedMathsMode` — `reasoning | arithmetic`
- `dailyMission` — 2–3 ranked subject tasks with timing estimates and coaching reasons

Tier determination:
- `foundation` — < 55% average or no attempts
- `developing` — 55–74%
- `advanced` — 75–89%
- `challenge` — 90%+

New users get a fixed starter mission (English + Maths). After 5+ sessions, mock test nudge appears.

---

## 7. Gamification System (`lib/gamification.ts`)

`computeGamification(progress)` is a pure function.

Tracks:
- **Badges** — 15 defined badges across categories: streak, skill, subject, milestone
- **XP milestones** — Beginner → Practitioner → Scholar → Contender → Aspirant → Champion (0 / 100 / 250 / 500 / 1000 / 2500 XP)
- **Weekly goal** — 5 sessions per week, resets each Monday
- **Streaks** — days with at least one completed lesson

XP awards per session (stored in `data/`):
- English lesson: 50 XP
- Maths session: 50 XP
- Vocabulary: 30 XP
- Writing: 40 XP
- Mock test: 80 XP
- Bonus XP for high scores (80%+ adds +20, 100% adds +30)

---

## 8. AI Writing Coach (`app/api/writing-feedback/route.ts`)

POST `/api/writing-feedback`

- Server-only route — OpenAI key never reaches the client
- Model: `gpt-4o-mini`, `temperature: 0.3`, `max_tokens: 900`
- System prompt is tuned to Essex CSSE marking criteria
- Response format: `{ strengths, areasToImprove, suggestedUpgrade, tutorTip, overallScore }`
- Input capped at 1500 words to control token cost
- Graceful fallback: if `OPENAI_API_KEY` is not set, returns 503 with user-friendly message

---

## 9. Route Overview

| Route | Purpose | Auth required |
|---|---|---|
| `/` | Redirect to `/dashboard` | No |
| `/dashboard` | Main hub, daily mission, XP | No (shows limited state) |
| `/login` | Magic-link sign-in form | No |
| `/english` | Lesson list with difficulty filter | No |
| `/english/[id]` | Full lesson player (passage + questions) | No |
| `/maths` | Mode selector + full session | No |
| `/vocabulary` | Flashcard session + word browser | No |
| `/writing` | Prompt picker + writing pad + AI feedback | No |
| `/mock-test` | 45-minute timed exam (20 min English + 25 min Maths) | No |
| `/progress` | Analytics, badges, skill radar | No |

All routes work without sign-in. Auth unlocks cross-device progress sync.

---

## 10. Content Library

| Subject | Content | IDs |
|---|---|---|
| English | 3 graded comprehension passages | `eng-001`, `eng-002`, `eng-003` |
| Maths Reasoning | ~24 multi-step word problems | `maths-reasoning` |
| Maths Arithmetic | ~30 quick-fire arithmetic questions | `maths-arithmetic` |
| Vocabulary | 50+ word flashcard set | `vocab-session` |
| Writing | 4 prompts (narrative, descriptive, etc.) | `writing-wrt-001` through `writing-wrt-004` |
| Mock Test | Combined 45-minute exam | `mock-test` |

Content is static TypeScript files in `data/`. No CMS.

---

## 11. Future Roadmap

| Phase | Feature |
|---|---|
| Phase 9 | PWA + installable app (Service Worker, offline shell) |
| Phase 10 | Parent dashboard (weekly reports, AI insights) |
| Phase 11 | AI adaptive difficulty (automatic tier promotion) |
| Phase 12 | Voice reading practice (ElevenLabs / Web Speech API) |
| Phase 13 | Leaderboard + class system (child-safe usernames) |
| Phase 14 | Subscription architecture (free / premium / family / school) |

---

## 12. Key Design Decisions

- **No server components for content pages** — all pages are `"use client"` because progress state is read from localStorage on mount. This avoids hydration mismatches between server-rendered HTML and client state.
- **Anonymous-first** — removing the sign-in requirement maximises engagement. Auth is an upgrade, not a gate.
- **Pure analytics functions** — `computeAnalytics`, `computeAdaptiveState`, and `computeGamification` have no side effects and are easily unit-testable.
- **Supabase optional** — the entire app functions without Supabase configured. This enables local development without any backend.
- **iPad-first layout** — `max-w-2xl` containers, `py-4+` touch targets, no hover-only interactions, no fixed-height viewports that break on Safari.
