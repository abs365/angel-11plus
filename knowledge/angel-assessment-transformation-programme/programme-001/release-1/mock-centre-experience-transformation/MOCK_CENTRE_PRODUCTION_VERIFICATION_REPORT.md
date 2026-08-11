# Mock Centre Production Verification Report

**Programme:** Angel Assessment Transformation Execution Programme — Mock Centre Experience Transformation
**Prepared:** 2026-08-11
**Method:** Real browser testing against `https://angel-11plus.vercel.app`, direct localStorage inspection/seeding for edge cases, `npx tsc`/`npx eslint`/`npm run build`.

---

## Engineering checks

- `npx tsc --noEmit -p .` — clean.
- `npx eslint` on every changed file — clean, except one pre-existing `react-hooks/set-state-in-effect` finding on `app/mocks/page.tsx`'s data-loading effect. This pattern (a plain `useEffect` calling `setState` directly on load) is the established convention throughout this codebase — confirmed present, unfixed, on `app/dashboard/page.tsx`, `app/learning-intelligence/timeline/page.tsx`, `app/progress/page.tsx`, `app/learning-intelligence/parent/weekly-report/page.tsx`, `app/learning-intelligence/practice/[area]/page.tsx`, `components/OfflineBanner.tsx`, and `app/reasoning/page.tsx`'s own pre-existing effect. Disclosed rather than silently left unmentioned; fixing it would mean restructuring a pattern used identically across the whole app, outside this mandate's scope.
- `npm run build` — succeeds, all routes present in the route manifest.

## CSSE pathway — PASS

Live on production: readiness card correctly shows "Ready for a mock" with the real explanation ("has real practice evidence but hasn't sat a mock yet") and a working `Start a mock exam →` link to `/learning-intelligence/mock-exam`. "Full CSSE Mock" card correctly primary, real structure stats shown, "Not attempted yet" (real, honest — this profile has no real CSSE Educational Intelligence Mock completion). "Coming later" list present, non-clickable. "Explore another pathway" reveals GL/CEM/ISEB. No console errors.

## GL pathway — PASS

Selected pathway switched to `gl` via the real `selectedPathwayId` mechanism. Confirmed live: top nav correctly re-routes to `/learn`/`/reasoning` (unrelated to this change, confirms `Navigation.tsx`'s own branching is undisturbed); Mock Centre's "Your Exam" correctly shows only the GL Assessment card as primary, routing to the unchanged `/mocks/gl`; no readiness card (correct — no evidence model exists for GL); "Explore another pathway" reveals CEM/CSSE/ISEB.

## CEM pathway — PASS

Same verification, CEM card correctly primary, routes to unchanged `/mocks/cem`.

## ISEB pathway — PASS

Same verification, ISEB Pre-Test card correctly primary, routes to unchanged `/mocks/iseb`.

## No pathway selected — PASS

`selectedPathwayId` cleared entirely. Confirmed live: all four pathways (CSSE, GL, CEM, ISEB) render with equal weight, no "Explore another pathway" disclosure (correctly absent — nothing to de-prioritise when nothing is prioritised). This is the specific gap found and fixed during this verification pass (`MOCK_CENTRE_IMPLEMENTATION_REPORT.md`).

## Personalised Practice relocation — PASS

`/reasoning` confirmed live to now show a "Personalised Practice" section with all four original cards (GL Verbal Reasoning, Maths Practice, Reading Practice, Vocabulary Practice), same routes, same copy. `/mocks` confirmed to no longer contain this section for any pathway. No console errors on `/reasoning`.

## Mobile — PASS

390×844 (iPhone-class viewport), screenshot-verified: readiness card, disclaimer, and exam card all render cleanly, single column, no horizontal scroll, bottom mobile nav unobstructed, typography unchanged from the approved Product Experience Standard tokens.

## Tablet — PASS

834×1112, screenshot-verified: same clean single-column layout, top nav bar visible, no layout breakage.

## Desktop — PASS

1440×900, screenshot-verified: consistent with the rest of the app's existing narrow-centred-column pattern (`max-w-2xl`) — not widened for this page specifically, matching every other page in the app, not a regression.

## Mock History — PASS

Verified live with real seeded data: a GL result displays correctly (name, date, score, links to `/mocks/gl`). A result tagged `source: "legacy-csse-mock"` was seeded directly into the same profile's storage and confirmed **excluded** from both the Mock History list and the CSSE card's best-score display ("Not attempted yet" remained correct despite the seeded 80% legacy score being present in storage) — the isolation fix verified end-to-end on production, not just by source read.

## Founder Validation isolation — PASS

`isFounderValidationResult()` unchanged; `getMockResults()`'s exclusion logic (now also excluding legacy-CSSE-mock results, confirmed above) is the same single shared function every consumer already goes through.

## Evidence integrity — PASS

No competency evidence, mastery, durable mastery, maintenance review, or recommendation computation was touched. The readiness card reads real, existing values only (`hasAnyEvidence`, `mockAttemptCount`, `topTriggerReason`) via the new `computeCsseMockReadiness()` wrapper, which performs no calculation of its own.

## Family Choice compatibility — PASS (unaffected)

No code in `app/mocks/page.tsx` or `app/reasoning/page.tsx` reads or writes `ali_family_focus_selection`. The relocated Personalised Practice cards are the same, unmodified routes Family Choice has never touched.

## Wellbeing — PASS (unaffected, honestly scoped)

No new wellbeing logic was added (`MOCK_READINESS_CAPABILITY_ASSESSMENT.md`'s explicit decision). Where wellbeing is relevant, it remains the same real signal already used elsewhere in the app — nothing new was introduced on this page.

---

## Production delivery

**Production commit:** `0c5f760c73b776286de5c7952c28aefed5b90291`
**Production URL:** `https://angel-11plus.vercel.app/mocks`
