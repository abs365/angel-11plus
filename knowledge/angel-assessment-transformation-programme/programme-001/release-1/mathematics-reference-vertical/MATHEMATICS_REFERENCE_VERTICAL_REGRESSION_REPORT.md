# Mathematics Reference Vertical Regression Report

**Programme:** Angel Assessment Transformation Execution Programme — Release 1, Mathematics Reference Vertical Remediation Gate §8
**Prepared:** 2026-08-11
**Deployed as:** commit `96e25dc223fbe323b1f6226c5e6a9be4f9960119`, production `https://angel-11plus.vercel.app`

## Method

Code-level call-site audit of every function changed (`recordOutcome`, `recordPresentation`, `applyAttemptOutcome`), `tsc`/`eslint`/`npm run build` clean, live production route checks, and a real production Practice attempt with direct database verification — deliberately run **before** migration 024 was applied, to prove the defensive design holds under exactly that condition.

## Areas checked

| Area | Result | Evidence |
|---|---|---|
| Educational Intelligence | PASS | `applyAttemptOutcome()`'s new `supportTier` parameter defaults to `"independent"` for every caller except this vertical's guided ladder; `computeCompetencyConfidence`/`validateCompetencyMastery`/`computeEducationalState` are unmodified. Directly confirmed live: a genuine independent correct answer still advanced `distinct_correct_sessions` and reached `mastered`/`validated: true` exactly as before (see struggling-learner re-test). |
| Family Choice | PASS | `app/learning-intelligence/founder-validation/family-choice/page.tsx` unmodified; route returns 200 on production. |
| Durable mastery | PASS | `ali_durable_mastery` for MR-01 correctly showed `validated: false` after a session containing only a supported success, and correctly progressed to `validated: true` only after a genuine independent correct answer in a distinct session — confirmed by direct query, not inferred. |
| Maintenance review | PASS (untouched) | `evaluateDurableMastery()`/`isMaintenanceReviewDue()` unmodified; not exercised this session (no review was due), consistent with no code path change. |
| Wellbeing veto | PASS (untouched) | `computeWellbeingSignal()` not modified by this remediation; no override mechanism was added anywhere in this vertical's changes. |
| Mock Attempt Ledger | PASS (untouched) | No file under `app/mocks/` or the Ledger's own module was modified beyond the required 2-line additive fallback-object fix (see Regression detail below); routes return 200. |
| Founder Validation isolation | PASS | `app/learning-intelligence/founder-validation/csse/page.tsx` unmodified; `/learning-intelligence/founder-validation/csse` and `/learning-intelligence/founder-validation/family-choice` both return 200. |
| GL/CEM/ISEB separation | PASS | `/mocks/adaptive/gl` returns 200; the only change to this file (and to `maths`/`english`/`vocabulary`) is a 2-field addition to a local, client-side-only fallback object required by the `StudentQuestionHistoryRow` type extension — no logic changed. |
| Production Practice | PASS | A real Practice attempt was submitted on production before migration 024 was applied. Console showed no errors. Direct DB query confirmed `times_seen`/`times_correct`/`last_attempt_correct`/`updated_at` all updated correctly and truthfully, proving the core evidence write path is completely unaffected by the new migration-dependent columns not yet existing. |
| Parent Dashboard | PASS | `/learning-intelligence/parent` returns 200; no code in this vertical touches Parent Dashboard rendering directly — it inherits the corrected mastery accounting automatically through the unmodified `getEducationalIntelligence()` read path. |

## Regression detail: the four other mock pages

`app/mocks/adaptive/{gl,maths,english,vocabulary}/page.tsx` and `scripts/test-adaptive-mock-paper-builder.ts` each required a 2-field addition (`firstSource: null, lastAttemptSupportTier: null`) to a local fallback object, purely to satisfy the `StudentQuestionHistoryRow` TypeScript type after its extension — required for `npx tsc --noEmit -p .` to pass, confirmed clean. No behavioural line in any of these five files was touched. Pre-existing, unrelated lint findings in these same files (impure `Date.now()` in a `useRef` initializer, `setState` inside an effect) were confirmed via `git diff` to be on lines this change never touched, and are out of scope for this remediation.

## Migration 024 dependency — confirmed non-blocking

Both new writes (`first_source`, `last_attempt_support_tier`) are separate, best-effort `.update()` calls, isolated from the core evidence write. Verified live: with migration 024 **not yet applied** to production, a real Practice submission still succeeded completely, with the core evidence row updating correctly — the new calls failed silently (server-side, logged) exactly as designed. No existing surface regressed.

## Status

**No regressions found.** The guided-ladder UX and the mastery-semantics fix itself (supported success excluded from `distinct_correct_sessions`/`mastery_state`) were both fully exercised live on production this session and confirmed correct by direct database query — that fix lives entirely in `applyAttemptOutcome()`'s use of existing columns and does not depend on migration 024. Only the two new columns' own literal values (`first_source`, `last_attempt_support_tier`, added purely for direct auditability) remain unverified at the column level until migration 024 is applied — see `UPDATED_FOUNDER_TEST_INSTRUCTIONS.md`.
