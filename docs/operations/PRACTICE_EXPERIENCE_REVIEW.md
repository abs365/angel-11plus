# Practice Experience Review — Phase 5B.2

**Title:** Practice Experience Review
**Version:** 1.0
**Status:** Investigation complete, implementation follows in this same phase
**Project:** Angel 11+
**Phase:** 5B.2 — Practice Experience Stabilisation
**Owner:** ELBOLD
**Last Updated:** July 2026
**Purpose:** Documents the exact, code-level cause of indefinite loading on the four Personalised Practice routes, and the reasoning behind the fix implemented in this phase.

---

## Issue 1 — Why Loading Never Completes

**Investigated directly in code**, not inferred: `app/mocks/adaptive/{gl,maths,english,vocabulary}/page.tsx`'s `loadAndStart()` function, `lib/supabase.ts`'s client construction, and every ALI data-access function it calls (`lib/ali/questionBank.ts`, `lib/ali/history.ts`, `lib/supabaseProgress.ts`).

**Root cause, confirmed identically in all four routes: `loadAndStart()` contains zero `try`/`catch` blocks, and no Supabase network call anywhere in the codebase has a timeout.**

Two distinct, compounding failure modes follow directly from this:

1. **A genuine network hang is never detected.** `lib/supabase.ts`'s `createClient()` is called with no custom `fetch` override and no `AbortController`-based timeout. Every downstream call — `fetchQuestionBank`, `fetchStudentHistory`, `ensureAdaptiveState`, `recordPresentation`, `ensureProfile` — is a bare `await supabase.from(...).select()/upsert()/insert()`. If the underlying network request stalls (a slow connection, a dropped packet, a DNS delay, a server that accepts the connection but never responds) rather than cleanly failing, the returned promise never resolves *and never rejects*. `await` simply waits forever. There is nothing racing against it.
2. **Any thrown exception is silently swallowed.** Because `loadAndStart()` has no `try`/`catch`, any exception anywhere in its body — a genuine JS runtime error, an unexpected shape in a response, anything not already caught internally by the individual ALI functions — becomes an unhandled promise rejection. React never learns about it. `setMode("error")` is never called. The only trace is a message in the browser's own console, which no user or parent will ever see. The screen is left exactly where it was: `mode === "loading"`, forever.

**Answering each specific question posed:**

- **Does ALI wait indefinitely?** Yes — every ALI data call (`fetchQuestionBank`, `fetchStudentHistory`, `ensureAdaptiveState`, `recordPresentation`) will wait forever on a stalled network request, because none of them, nor their caller, race against a timeout.
- **Is fallback data reached?** The synthetic-fixture fallback (`if (bank.length === 0) { bank = ...SyntheticFixture }`) works correctly **only when `fetchQuestionBank` actually returns** — either with real rows, an empty array, or a handled Supabase error. It provides no protection at all if the underlying request never settles in the first place, since the function that would trigger the fallback never returns to let the fallback logic run.
- **Is an exception swallowed?** Yes, confirmed — zero `try`/`catch` in any of the four `loadAndStart()` functions means any unhandled exception is invisible to the user, by construction, not by accident.
- **Are Supabase timeouts handled?** No — confirmed via direct inspection of `lib/supabase.ts`. No timeout, no `AbortController`, no fetch override exists anywhere in this project's Supabase client configuration.

**This is a single root cause with two symptoms, not four separate bugs** (one per route) — the four routes share one copy-pasted pattern, so the fix belongs in one place: wrap the shared shape of `loadAndStart()` with a timeout-racing, exception-catching guard, applied identically across all four.

## Issue 2 — Progressive Loading and Recovery

**Implemented this phase:**

- A new shared timeout utility (`lib/withTimeout.ts`) races any promise against a fixed timeout and rejects with a clear, catchable error if it's exceeded — this is what makes "no loading state should last forever" actually true, rather than aspirational.
- Every adaptive route's `loadAndStart()` is now wrapped in a single `try`/`catch`. Any failure — a timeout, a genuine exception, an unexpected Supabase error — is caught in one place and always results in a friendly recovery screen. Nothing is left uncaught.
- `PremiumLoader` (already shared across all four routes since UX V3) gains a progressive-message capability: after 3 seconds on the same loading screen, the message advances once (e.g. "Choosing questions…" → "Almost ready…"), so a real but slow load never reads as frozen.
- The existing `mode === "error"` screens gain a second button. Previously: a single "Back to Mocks" link. Now: **"Try Again"** (re-runs `loadAndStart()` directly, no navigation needed) alongside **"Back to Practice."**

## Issue 3 — Assessment Navigation

Covered in full in `PRACTICE_NAVIGATION_RECOMMENDATION.md`. Summary: the current single "Assessment" nav grouping (containing only "Practice," itself a page that further buries Mock Exams two levels deep) was found to genuinely hide a term parents actively recognise and search for. The recommendation — and the change implemented this phase — splits this into two nav items, **Practice** and **Mock Exams**, each visible and independently named, matching the founder's own final recommendation in this phase's brief.

## Issue 4 — Practice Landing Page Hierarchy

The current `/mocks` page mixes "Recommended Practice" (personalised, 5–15 minutes) and "Choose a Mock" (full timed exams, 35–90 minutes) on one scroll under one page, with no explanation of the difference and no signal for which a parent or child should try first. This phase redesigns the page's information hierarchy into two clearly headed, clearly explained sections — **Personalised Practice** and **Mock Exams** — each with a one-line explanation of what it is and when to use it, addressing all three questions posed: what to click first, the Practice/Mock distinction, and parent comprehension of the options.
