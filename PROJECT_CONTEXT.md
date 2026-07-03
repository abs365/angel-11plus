# Angel 11+ — Project Context

> Last updated: 2026-07-03 (Phase 5A — Enterprise Beta Readiness)  
> Status: Pre-launch beta preparation. Core static platform (English/Maths/Vocabulary/Writing/Reasoning/Voice Reading/Parent Dashboard/PWA) is feature-complete and near launch-ready — see `ENTERPRISE_BETA_READINESS_REPORT.md` for the current independent readiness score. A separate adaptive-learning subsystem, Angel Learning Intelligence (ALI — §13 below), is architecturally complete across 4 subjects but runs entirely on synthetic dev fixtures pending production activation (`ALI_VERSION.md`).
>
> This document (and this status line specifically) should be kept current at the end of every phase that materially changes the platform — it was last found significantly stale (dated May 2026, no ALI mention at all) during the independent Foundation Audit that preceded this phase.

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

## 9. Route Overview (35 routes total, all confirmed present as of Phase 5A)

**Core learning:** `/dashboard` (main hub, daily mission, XP), `/english` + `/english/[id]` (lesson player with `PassagePlayer` voice reading — TTS listen + speech-recognition read-aloud scoring), `/maths`, `/vocabulary` (flashcard self-report), `/writing` (+ AI feedback via `/api/writing-feedback`), `/verbal-reasoning`, `/non-verbal-reasoning`, `/spatial-reasoning`, `/numerical-reasoning`, `/mock-test` (legacy combined timed exam), `/progress`.

**ALI adaptive practice** (§13): `/mocks` (hub + all static pathway mocks), `/mocks/[pathway]`, `/mocks/adaptive/gl`, `/mocks/adaptive/maths`, `/mocks/adaptive/english`, `/mocks/adaptive/vocabulary`.

**Parent:** `/parent` ("Parent Hub" in navigation — same route, not a separate feature).

**Account & pathways:** `/login` (magic-link), `/pathways`.

**Beta operations:** `/beta`, `/beta-family`, `/feedback`, `/report-bug`, `/feature-request`, `/testimonial` — all five now persist to Supabase (migration 008, Phase 5A), not localStorage-only. `/admin-beta` — founder-only dashboard, gated by real Supabase Authentication + a server-enforced admin flag (`is_current_user_admin()`), **not** the hardcoded PIN this route used before Phase 5A.

**Support/legal:** `/contact`, `/privacy`, `/terms`, `/getting-started`.

All routes work without sign-in except `/admin-beta`. Auth unlocks cross-device progress sync for everything else.

---

## 10. Content Library

| Subject | Content | Notes |
|---|---|---|
| English | 3 graded comprehension passages, 10 questions | `eng-001`–`eng-003`; also the ALI adaptive route's synthetic fixture (5 passages) pending real hand-tagging |
| Maths | 20 real questions (reasoning + quick arithmetic) | Plus a 16-question ALI synthetic fixture |
| Vocabulary | 12 real words (flashcard) | Plus a 12-item ALI synthetic fixture (5 fabricated words) for the separate adaptive MCQ mode |
| Writing | 4 prompts (narrative, descriptive, persuasive) | AI feedback via OpenAI `gpt-4o-mini` |
| Reasoning | ~50–90+ questions per discipline across Verbal/Non-Verbal/Spatial/Numerical | Modular `data/*-reasoning/` files |
| Mock Test | Combined legacy 45-minute exam | `mock-test` |

Content is static TypeScript files in `data/`. No CMS. **ALI's adaptive question banks (`ali_question_bank`) are a separate, currently-empty layer** — every adaptive route falls back to a synthetic fixture until real hand-tagged content is seeded (`ALI_SEEDING_PLAN.md`).

---

## 11. Current Roadmap

The items below are the ones actually remaining, per `ALI_VERSION.md` and `ENTERPRISE_BETA_READINESS_REPORT.md` — not a numbered phase list, since this document's prior phase numbering (9–14) was inaccurate (it listed PWA, Parent Dashboard, Adaptive Difficulty, and Voice Reading as unbuilt future work; all four are already shipped, see §9).

1. **ALI production activation** — apply migrations, hand-tag real content for all 4 ALI subjects, seed it, run live validation (`ALI_OPERATIONS_MANUAL.md`).
2. **Controlled beta with real families** — the actual next milestone once Phase 5A's remediation is verified (`ENTERPRISE_BETA_READINESS_REPORT.md`).
3. **Longer-term, unscoped:** Writing as a 5th ALI subject, surfacing ALI's Cross-Subject Recommendations/Learning Profiles in a real UI, subscriptions/payments/App Store packaging (explicitly deferred, not part of any near-term plan).

---

## 12. Key Design Decisions

- **No server components for content pages** — all pages are `"use client"` because progress state is read from localStorage on mount. This avoids hydration mismatches between server-rendered HTML and client state.
- **Anonymous-first** — removing the sign-in requirement maximises engagement. Auth is an upgrade, not a gate.
- **Pure analytics functions** — `computeAnalytics`, `computeAdaptiveState`, and `computeGamification` have no side effects and are easily unit-testable.
- **Supabase optional** — the entire app functions without Supabase configured. This enables local development without any backend.
- **iPad-first layout** — `max-w-2xl` containers, `py-4+` touch targets, no hover-only interactions, no fixed-height viewports that break on Safari.

---

## 13. Angel Learning Intelligence (ALI)

A separate, subject-agnostic adaptive-learning subsystem (`lib/ali/*`, `types/ali/*`, `supabase/migrations/004`–`007`) — not part of this document's original architecture description above, and intentionally not duplicated here. **`ALI_VERSION.md` is the authoritative, currently-accurate description of what ALI does today** — read that file, not this section, for real detail. In short: 4 subjects (Verbal Reasoning, Mathematics, Reading Comprehension, Vocabulary) each get an adaptive practice mode under `/mocks/adaptive/*`, built on a shared, subject-agnostic selection/mastery/weak-competency engine proven not to require redesign for each new subject. Cross-Subject Recommendations and Learner Profiles exist as real, tested, internal-only code (not yet surfaced in any UI). As of this document's last update, ALI's production database migrations are unapplied and every subject runs on synthetic dev fixtures — `ALI_OPERATIONS_MANUAL.md` is the operational handbook for closing that gap.

## 14. Beta Operations Data (Phase 5A)

Feedback, Bug Reports, Feature Requests, Testimonials, and Beta Family Applications are persisted to Supabase (migration 008: `feedback_submissions`, `bug_reports`, `feature_requests`, `testimonials`, `beta_family_applications`), readable only by an authenticated admin (`is_current_user_admin()`, enforced by Postgres Row Level Security — not client-side gating). `/admin-beta` requires real Supabase Authentication sign-in; there is no self-service path to becoming an admin. See `ENTERPRISE_BETA_READINESS_REPORT.md` for the full security rationale.
