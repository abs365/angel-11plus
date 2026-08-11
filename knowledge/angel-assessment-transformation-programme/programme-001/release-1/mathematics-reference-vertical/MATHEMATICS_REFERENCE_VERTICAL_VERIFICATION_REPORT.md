# Mathematics Reference Vertical Verification Report

**Programme:** Angel Assessment Transformation Execution Programme — Release 1, Mathematics Learn → Practise Reference Vertical
**Prepared:** 2026-08-11
**Method:** Real code execution, real browser testing, real live-database queries — not code-inspection claims.

---

## 1. TypeScript, lint, build

- `npx tsc --noEmit -p .` — clean, exit 0, run after every implementation step.
- `npx eslint` on every new/changed file — clean, no errors.
- `npm run build` — succeeds; `/learning-intelligence/learn/mathematics/arithmetic` present in the route manifest as a static route.

## 2. Mathematical correctness

Every numeric answer in the lesson was independently hand-checked before being written into content or migration:
- 847 + 356 = 1203 ✓
- 1000 − 473 = 527 ✓
- 652 + 279 = 931 ✓ (Guided Attempt)
- 903 − 468 = 435 ✓ (Independent Check)

## 3. Live database re-verification of the area selection

A direct query against the live production Supabase project (`agxunwcdatosrmzhhuxj`, not a cached or remembered count) confirmed MR-01 has 15 real content rows — more than all four English competencies combined (13) and far ahead of any other single Mathematics competency (5 or fewer each). Full detail in `MATHEMATICS_REFERENCE_VERTICAL_BLUEPRINT.md` §2.

## 4. Real browser testing (dev)

- The lesson's intro screen loads and renders correctly (title, description, Start button).
- Clicking Start correctly triggers the real loading sequence: `ensureProfile()`, `fetchQuestionBank(supabase, "maths", "csse")`, `getEducationalIntelligence()`.
- Migration 023 has **not yet been applied** to the live database (confirmed via a direct REST query returning zero rows for `learn-mth-arith-guided`/`learn-mth-arith-independent`) — the page's error-handling path was exercised for real (not merely inspected) and produced the correct, honest error message naming the exact missing migration, matching the same graceful-degradation discipline already established for migrations 021 and 022.
- The Parent Dashboard's new "Start this lesson →" link was verified to correctly **not** render when MR-01 is not the top recommendation (the real state of the dev test profile, whose top recommendation is a different, real competency) — confirming the conditional does not fire spuriously.
- No console errors on `/learning-intelligence/learn/mathematics/arithmetic`, `/learning-intelligence/learn`, `/learning-intelligence/parent`, or `/dashboard`.

## 5. What could not be tested this session

The full interactive Guided Attempt / Independent Check / evidence-write / progression-state-update flow requires migration 023 to be live — the same external dependency pattern as every prior migration this programme, requiring elevated database privileges this environment's anon key does not have. `FOUNDER_TEST_INSTRUCTIONS.md` gives the exact steps to complete this once applied. The underlying `recordPresentation`/`recordOutcome`/`processEvidenceForCompetency` calls this page makes are the exact same, unmodified functions already proven correct end-to-end in the Family Choice Pilot and Founder Validation Assessment's own real, verified testing earlier this programme — not new, untested mechanisms.

## 6. Evidence-system integrity check (code inspection, confirmed by direct reading of the final implementation)

- No new evidence table, column, or write path exists anywhere in this vertical.
- The "lesson completed" / "Learning" / pre-check "Ready to practise" states are local `useState` only — never passed to `recordOutcome()`, `processEvidenceForCompetency()`, or any Supabase call. Confirmed by direct reading of the final `page.tsx`.
- Guided and Independent attempts are both written via the real pipeline, distinguished only by the `source` parameter passed to `recordPresentation()` (`"learning_guided"` vs `"learning_independent"`) — the same open-string convention `ali_student_question_history.source` was designed for.

## 7. Mock Readiness non-contamination check

Direct reading of the final implementation confirms no call from this vertical reaches `assessMockReadiness()`, `getMockResults()`, or any mock-result write path — per `MATHEMATICS_MOCK_READINESS_EVIDENCE_MAPPING.md`'s explicit guarantee.

---

## 8. Production deployment and verification

Committed (`f3eb049cd7f10c688bb8652319a153581d409996`), pushed, and deployed to Vercel — reached `● Ready`, correctly aliased to `https://angel-11plus.vercel.app`. Verified directly against the live production domain, not inferred from the deployment status alone:

- `curl` confirms `/learning-intelligence/learn/mathematics/arithmetic` (200) and `/learning-intelligence/learn` (200, containing the exact string "Adding and Subtracting Big Numbers") are genuinely served.
- Real browser testing against production: clean console (no errors) on both routes; clicking "Start the lesson" correctly reproduces the same honest, graceful migration-023-missing error message seen in dev — the deployed code behaves identically to the verified dev build, not a different artifact.
- Regression check: `/mocks`, `/dashboard`, `/learning-intelligence/practice/mathematics`, and `/mocks/adaptive/gl` (a GL-pathway route, confirming non-CSSE pathways are unaffected) all return 200 on production.

## Summary

| Check | Result |
|---|---|
| TypeScript | PASS |
| Lint | PASS |
| Build | PASS |
| Mathematical correctness | PASS (hand-verified) |
| Area selection re-verified with fresh evidence | PASS |
| Real browser testing, dev (intro, error state, Parent Dashboard conditional) | PASS |
| Real browser testing, production | PASS |
| Full interactive evidence flow | NOT YET VERIFIED — blocked on migration 023 (external dependency, disclosed) |
| No second evidence system | PASS (code-inspection confirmed) |
| No Mock Readiness contamination | PASS (code-inspection confirmed) |
| Production deployment | PASS — commit `f3eb049cd7f10c688bb8652319a153581d409996`, `https://angel-11plus.vercel.app/` |
