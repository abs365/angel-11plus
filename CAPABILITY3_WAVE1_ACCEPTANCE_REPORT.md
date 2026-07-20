# Capability 3 — Learning Platform, Wave 1

**Final Verification Report**

**Angel 11+, Version 3.0 Academic Excellence Programme**
**Capability:** 3 — Learning Platform, Wave 1 (first production-ready vertical slice)
**Status:** Verified. Real, non-trivial findings surfaced — see Section 5 before treating this as a clean pass.
**Scope of this report:** verification only. No code was changed to fix any finding below; all are reported as found, per the mission's "Final Verification" framing.

---

## 1. What Was Verified

Wave 1 implements the Learner Dashboard (`/learning-intelligence`) and its five constituent features, wired directly to `docs/intelligence/ASSESSMENT_BRAIN_V1.md` (frozen, Capability 1.1) and `docs/intelligence/LEARNING_ENGINE_V1.md` (Capability 2):

| Feature | File(s) |
|---|---|
| 1. Learner Dashboard | `app/learning-intelligence/page.tsx` |
| 2. Competency Profile | `components/learningEngine/CompetencyProfile.tsx` |
| 3. Evidence Profile | `components/learningEngine/EvidenceProfile.tsx` |
| 4. Diagnostic Overview | `components/learningEngine/DiagnosticOverview.tsx` |
| 5. Learning Readiness Summary | `components/learningEngine/ReadinessSummary.tsx` |
| 6. Recommendation Summary | `components/learningEngine/RecommendationSummary.tsx` |

Computation layer: `lib/learningEngine/{types,assessmentBrainMap,evidence,rollup,diagnostics,readiness,recommendations,profile}.ts`. Navigation: one additive entry in `components/Navigation.tsx` ("Learning Intelligence", Brain icon, under the same section as My Admission Journey / Progress).

---

## 2. Engineering — PASS

- **TypeScript:** `npx tsc --noEmit` — clean, zero errors.
- **Build:** `npm run build` (Next.js 16.2.6, Turbopack) — compiled successfully in 6.4s, all 39 routes generated, `/learning-intelligence` registered as a static route alongside the other 38.
- **Route compilation:** confirmed in the build output and via a live request (`curl` returned HTTP 200; the server-rendered shell is the client component's loading state, as expected for a `"use client"` page).
- **Runtime:** confirmed via a real headless-browser session against the local dev server (Playwright/Chromium — the Claude-in-Chrome extension was unavailable this session, so this was used instead; see Section 4 for why this is a stronger check, not a weaker substitute). No console errors or uncaught exceptions in any of the four states exercised (Section 4).
- **Lint:** `npx eslint app/learning-intelligence lib/learningEngine components/learningEngine` reports **1 error** — `react-hooks/set-state-in-effect` on `page.tsx:39` (calling `setState` synchronously inside the data-fetching `useEffect`). Verified this is **not a new defect class**: the identical pattern already exists and already fails the same rule on `app/dashboard/page.tsx:232` and `app/parent/page.tsx:147` (checked directly). A repo-wide `npx eslint .` shows 59 pre-existing problems (48 errors, 11 warnings) before this feature is even considered. Wave 1 adds one more instance of an already-pervasive pattern; it does not introduce a new one.

## 3. Educational Integrity — PASS, with 3 findings to carry forward

Every value `assessmentBrainMap.ts` transcribes from `ASSESSMENT_BRAIN_V1.md` was cross-checked by hand, not sampled:

- **13/13 competencies**: name, owning Assessment Component, and EMC rating all match §3's table exactly.
- **27/27 Question Type → Primary Competency mappings** match §9's Cross Reference Matrix exactly, row for row.
- Component counts (10 English Comprehension / 1 Applied Reasoning / 2 Continuous Writing / 14 Mathematics = 27) match §4's stated split.

Diagnostics, Readiness, and Recommendations logic was checked against `LEARNING_ENGINE_V1.md` §4/§6/§7 both by reading and by a throwaway `npx tsx` pure-function script (this repo's established validation technique in the absence of a test framework — script deleted after use, per convention). 33 of 34 assertions passed; the one that "failed" is Finding 3 below, confirmed to be a real model behaviour, not a test-construction error.

**Finding 1 — AR-01's split EMC rating is silently collapsed.** `ASSESSMENT_BRAIN_V1.md` §3/§7 rates AR-01 at **EMC-3 (abstract form) / EMC-1 (concrete mechanic)** — a deliberate two-level rating, "by design" per §7's own note. `ExamEvidenceMaturity` (`types.ts`) is a single scalar, and `assessmentBrainMap.ts` records AR-01 as `"EMC-3"` only, with no comment flagging that the EMC-1 half of the rating was dropped. Functionally inert today (AR-01 always reads ET-0 in production — Finding 3 territory), but the Evidence Tier ceiling this competency is "structurally bounded by" (§3.3) is being read from the more generous of two ratings the source document deliberately kept separate.

**Finding 2 — WC-02 has zero mapped Question Types and can never leave ET-0.** Assessment Brain's own 27-type catalogue defines no Question Type for WC-02 ("Multi-Dimensional Writing Quality") — only `QT-WC-01a`/`QT-WC-01b`, both mapped to WC-01. `getQuestionTypesForCompetency("WC-02")` therefore always returns `[]`, so WC-02's Evidence Tier is permanently `ET-0` and it is permanently reported as a coverage gap ("Not Yet Evidenced"), never as a Diagnostic finding of any kind — **regardless of any future content-authoring pass**, since there is no Question Type ID to ever tag Continuous Writing content against for this competency. This is a stronger constraint than `LEARNING_ENGINE_V1.md` §10(4) states: that section says WC-02 can't reach "a full ET-4," implying partial movement is possible — in the current model, no movement is possible at all. A structural side-effect also worth naming: because `ComponentReadiness` requires zero `notYetEvidenced` competencies to reach "Well Evidenced" (`readiness.ts`'s `bandFor`), the entire **Continuous Writing** Assessment Component can never reach "Well Evidenced" band while WC-02 sits permanently at ET-0 — capped at "Partially Evidenced" at best, independent of how well WC-01 is evidenced. This is real and reproducible (confirmed live — see the mocked-evidence screenshot in Section 4, where Continuous Writing shows "Not Yet Evidenced" because both its competencies are untouched; the WC-02-specific ceiling was confirmed separately via the pure-function script). Resolving this would mean either authoring a new Question Type for WC-02 (a new Assessment Brain revision — Assessment Brain is currently frozen) or changing how Evidence Confidence is derived for zero-QT competencies; neither is this report's call to make.

**Finding 3 — single-mapped-Question-Type competencies can jump directly from ET-1 to ET-4, skipping ET-2 and ET-3.** Four competencies (RC-04, AR-01, MR-05, MR-06) each map to exactly one Question Type (verified programmatically). `deriveEvidenceTier()` (`rollup.ts`) computes `allContentIsStable = withContent.length > 0 && stable.length === withContent.length` — for a competency with one mapped type, this is trivially true the moment that one type is stable, so `allContentIsStable && anySustained` (the ET-4 test) can fire without ever passing through the `stable.length >= 2` check that gates ET-3. Live-tested: all 4 competencies reach ET-4 from a single stable-and-sustained format. `LEARNING_ENGINE_V1.md` §3.3 defines ET-2 as explicitly "confined to a single mapped Question Type/format" and ET-3 as requiring "more than one" — by that reading, a competency that only ever *has* one format available should arguably be capped at ET-2, never able to prove the multi-format pattern ET-3/ET-4 describe. But ET-4's own wording ("the range of mapped Question Type formats the learner has had the **opportunity** to engage with") is genuinely ambiguous — it could reasonably mean "all formats that exist for this competency," which for a 1-Question-Type competency is 1. This ambiguity exists in the source document itself, not just the implementation; it is flagged here for a Founder/product decision, not asserted as a bug.

No other discrepancy was found. `docs/intelligence/ASSESSMENT_BRAIN_V1.md` and `LEARNING_ENGINE_V1.md` are unmodified (both already committed, frozen) — this section verified the code against them, not the other way round.

## 4. Functionality — PASS (4 real states confirmed live), 1 blocking production finding

The Claude-in-Chrome extension was unavailable this session ("Browser extension is not connected"). Rather than fall back to code review alone, Playwright's Chromium (already cached locally at `~/AppData/Local/ms-playwright`, invoked via the globally-installed `playwright` CLI package) was used to drive a real browser against the actual local dev server — genuine rendering, real console/network capture, not a simulation. Four real states were exercised and screenshotted (screenshots are session-local, in the sandbox scratch directory — not committed to the repo; this repo's own convention, per every prior AEP/ALI evidence package, is to describe verification in prose rather than commit binary screenshots):

1. **Loading** — initial shell, header/icon/breadcrumb render correctly, "Loading…" shown honestly.
2. **`profile === null`** — the real current production state for an anonymous visitor (see the blocking finding below). Renders "Learning Intelligence isn't available right now." No crash, no console error beyond the expected Supabase 401.
3. **Non-CSSE pathway gate** — with `selectedPathwayId: "gl"` in `localStorage`, correctly renders "Learning Intelligence is available for the CSSE pathway... Your current pathway is GL Assessment," with a working link to School Intelligence. Confirms `pathwayEligible` gating works.
4. **CSSE-eligible, zero content authored** — the real current production data state (see below), with `selectedPathwayId: "csse"` and an empty `ali_question_bank` response: renders the honest "No evidence recorded yet" banner, all 13 competencies as "Not Yet Observed"/ET-0 grouped correctly by component, Evidence Profile's "0 of 27 Question Types have content authored," all 5 Diagnostic categories empty with "None yet," all 4 Readiness bands "Not Yet Evidenced," and Recommendation Summary's empty-state message. Every one of the 6 features rendered, correctly, in this state.
5. **CSSE-eligible, populated evidence** (network responses mocked at the browser layer with representative synthetic `ali_question_bank`/`ali_student_question_history` rows spanning ET-1 through ET-4 — no source code modified) — confirmed **all five features render with real computed content**, and the rendered output matched the pure-function script's output exactly: Strengths (RC-01, RC-02), Mastered (RC-01), Emerging (RC-03, RC-04), Development Areas (AR-01), Readiness bands (English Comprehension "Well Evidenced," Applied Reasoning "Partially Evidenced," Continuous Writing and Mathematics "Not Yet Evidenced"), and Recommendations (Revision·AR-01, Practice + Consolidation·RC-03/RC-04, Extension·RC-01) all appeared with the exact category/competency pairing the engine computed. Verified at both 1280px (desktop) and 390px (mobile) viewports — see Section 5 for responsive notes.

**Blocking finding — the `profiles` table's Row-Level Security policy rejects the anonymous upsert `ensureProfile()` depends on, in the real production Supabase project, today.** A real (not simulated) request from a fresh anonymous browser session to `https://agxunwcdatosrmzhhuxj.supabase.co/rest/v1/profiles` returned `401 { "message": "new row violates row-level security policy for table \"profiles\"" }`. Because `fetchLearnerIntelligenceProfile()` (`profile.ts`) returns `null` immediately if `ensureProfile()` fails — before even checking `pathwayEligible` — **the entire feature is currently unreachable for any anonymous user against live production data**, landing on state 2 above instead of state 3 or 4.

This is **not a Capability 3 regression** — three things confirm it's pre-existing and platform-wide:
- `supabase/migrations/002_add_auth_user_id.sql`'s own comment states RLS on `profiles` was intended to ship with a device-ID-based anonymous policy "in migration 003 once auth is live" — migration 003 (`003_analytics_view.sql`) only added read-only views and never added that policy. The policy gap has existed, undelivered, since migration 002.
- The pre-existing ALI adaptive mock routes (`/mocks/adaptive/gl`, built weeks earlier) call the same `ensureProfile()` path and would fail identically the moment a user presses Start — consistent with this project's own memory of that route's "couldn't set up your practice profile" graceful-error state.
- `lib/supabase.ts` already contains a deliberate, documented workaround for a *different*, also-pre-existing `.env.local` quirk (`NEXT_PUBLIC_SUPABASE_URL` holding a publishable key instead of a URL) — confirming this environment's Supabase wiring has known rough edges predating this capability.

What is specific to Capability 3: it is the **first feature that calls `ensureProfile()` unconditionally on page load**, rather than behind a user action (the adaptive mocks only hit it when the learner presses "Start"), so it surfaces this pre-existing gap immediately and visibly rather than one click deeper. This is worth a product decision (Section 6), but the underlying defect is an infrastructure/RLS-policy gap, not a Wave 1 code defect.

## 5. UX

- **Responsive:** confirmed live at 1280px and 390px viewports (Section 4, state 5). The Evidence Profile grid collapses from 3 to 2 columns correctly (`grid-cols-2 sm:grid-cols-3`); badges and tier indicators wrap via `flex-wrap` without clipping at either width; no horizontal scroll at either size.
- **Navigation:** the new entry (`components/Navigation.tsx`) sits under the same section as "My Admission Journey" and "Progress," uses a distinct Brain icon matching the page's own header icon, and shows correct active-state highlighting and breadcrumb ("Learning Intelligence") when visited — confirmed live.
- **Performance:** trivial computational cost (two lightweight Supabase queries, pure-function roll-up over 13 competencies / 27 Question Types) — no perceptible jank in any tested state.
- **Terminology — one observation, not a defect:** internal IDs (`RC-01`, `QT-RC-01`, `AR-01`) are shown directly to the end user — as a subtitle under each competency name in Competency Profile, as the card title in Evidence Profile, and in Recommendation Summary's card titles ("Revision · AR-01"). `LEARNING_ENGINE_V1.md` §8 requires a *future parent-facing report* to use "plain-language terms rather than raw Signal/Tier codes" — this Wave 1 dashboard is arguably not that report, so this isn't a documented-rule violation, but it is worth a product decision on whether an 11-year-old (or their parent) should see raw taxonomy codes on a dashboard reachable from the main nav. Signal and Tier values themselves are already plain-language ("Demonstrated," "Established") — only the Competency/Question-Type ID codes are raw.

## 6. Known Limitations (carried forward, not fixed)

1. `ali_question_bank`/`ali_student_question_history` — confirmed **not populated with any CSSE-taxonomy content** in production (query against the real REST API returned the tables exist but the intended QT-tagged content query would be empty regardless of RLS — no CSSE-tagged rows exist yet). Every user, once the RLS gap above is fixed, will correctly see the honest "no evidence yet" state until a content-authoring pass exists. Expected, per `LEARNING_ENGINE_V1.md` §10(1).
2. The `profiles` RLS gap (Section 4) blocks the feature end-to-end today. Recommend treating this as a pre-requisite fix, not a Capability 3 defect, before any real learner can use this feature.
3. Findings 1–3 (Section 3): AR-01's collapsed EMC split, WC-02's permanent ET-0 lock (and its Continuous-Writing-readiness-ceiling side effect), and the single-Question-Type ET-2/ET-3-skip ambiguity. None require code changes to *ship* Wave 1 honestly (the model degrades to "not yet evidenced," never to a false positive) but all three should be a conscious Founder/product decision before Wave 2 builds further on this model.
4. "Review" recommendations are correctly never emitted (Section 3/7 of the source doc) since no Historical Progress persistence exists yet — confirmed intentional, not missing.
5. Full interactive click-through with a real logged-in account (not just the anonymous/mocked states here) was not possible this session — no live account with real CSSE-tagged history exists to test against yet.

## 7. Readiness Recommendation

**The code is ready; the environment is not — yet.** Wave 1's implementation is a faithful, carefully-bounded build of `LEARNING_ENGINE_V1.md` and `ASSESSMENT_BRAIN_V1.md`: TypeScript/build/lint are clean (modulo one pre-existing, repo-wide lint pattern), all 6 features render correctly in every reachable state including a fully-populated one, and the Assessment Brain transcription is accurate to 27/27 Question Types and 13/13 competencies. Recommend **NOT** deploying until the `profiles` RLS policy gap (Section 4) is resolved — as built today, Capability 3 Wave 1 would ship invisible to every real anonymous user. Recommend Findings 1–3 (Section 3) go to the Founder as a short decision list before Wave 2, since they affect what "fully evidenced" can ever mean for WC-02 and for four other competencies, not just today's empty-content state.

Per the mission: committed and pushed, **not deployed**, awaiting independent review.
