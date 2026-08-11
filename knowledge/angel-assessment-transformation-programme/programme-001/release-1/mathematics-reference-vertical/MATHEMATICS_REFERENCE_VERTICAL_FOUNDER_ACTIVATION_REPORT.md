# Mathematics Reference Vertical — Founder Activation Report

**Programme:** Angel Assessment Transformation Execution Programme — Release 1, Mathematics Learn → Practise Reference Vertical
**Prepared:** 2026-08-11
**Method:** Real production testing — deliberate wrong answers, real database queries against the live Supabase project, real Vercel deployment inspection. Every finding below, including the two real defects found and fixed, is reported honestly rather than smoothed over.

---

## Results

| Check | Result |
|---|---|
| Migration 023 | **PASS** |
| Production journey | **PASS** |
| Incorrect-answer recovery | **PASS** |
| Guided learning | **NEEDS IMPROVEMENT** |
| Independent check | **PASS** |
| Borrowing-across-zero teaching | **NEEDS IMPROVEMENT** (engineering-verified only — see §9) |
| Evidence integrity | **NEEDS IMPROVEMENT** |
| Educational Intelligence integration | **PASS** |
| Family Choice compatibility | **PASS** |
| Mastery protection | **PASS** |
| Wellbeing protection | **PASS** |
| Parent translation | **PASS** |
| Regression | **PASS** |

---

## 1. Migration 023 — PASS

Verified independently, not taken on the Founder's word: a direct authenticated REST query against the live production Supabase project (`agxunwcdatosrmzhhuxj`) confirmed both `learn-mth-arith-guided` and `learn-mth-arith-independent` exist with the exact metadata the implementation expects (`skill: "QT-MR-01"`, `subject: "maths"`, `pathway: ["csse"]`, correct `prompt`/`answer`/`workingSteps`, `mastery_threshold: 2`). Anon-role write access to `ali_question_bank` remains correctly rejected (`401`, `42501`) — unauthorised access is still protected.

## 2. Production journey — PASS

The full Concept → Method → Worked Example → Guided Attempt → Feedback → Independent Check → Feedback → Practise → Evidence → Next Action journey was run live against `https://angel-11plus.vercel.app/`, not localhost. Every stage rendered and functioned correctly; the "You're ready to practise this properly" link correctly carried the learner into the real `/learning-intelligence/practice/mathematics` runner, which correctly started a real session referencing the same evidence just generated.

## 3. Incorrect-answer recovery — PASS

Deliberately wrong answers were submitted at both the Guided Attempt (`921` instead of `931`) and Independent Check (`565` instead of `435`, the classic "subtract the smaller digit from the larger regardless of position" misconception) stages. Both were correctly marked incorrect with the right answer shown; the "Let's go through this again" retry path was exercised and correctly reset the lesson to a clean state, re-presenting the same two items for a fresh attempt.

## 4. Guided learning — NEEDS IMPROVEMENT

The mechanism works correctly (hints reveal progressively, one at a time; submission and correctness detection are both real). The genuine gap, found by testing as a struggling learner rather than assuming success: **a learner who gets the Guided Attempt wrong — even after using all three hints — is immediately told "Ready to practise" and moved straight to the unscaffolded Independent Check.** No second guided attempt is offered, and no acknowledgment is given that the first attempt, with help, still didn't succeed. This is a real pedagogical gap, not a code defect, and per the governing instruction's explicit "do not expand educational scope" this session, it has not been redesigned — it is reported honestly for the Founder's judgement on whether the pattern needs a second guided item or a different flow before this pattern is used as the template for future lessons.

## 5. Independent check — PASS

Functions correctly: no hints available, real evidence recorded on submission, correct/incorrect detection accurate, feeds directly into the real Next Action routing (§2).

## 6. Borrowing-across-zero teaching — NEEDS IMPROVEMENT (engineering-verified only)

The worked example (1000 − 473) and the Independent Check item (903 − 468, also a zero-adjacent borrow) are both mathematically correct and were rendered correctly in production, word for word as designed. **Whether the teaching is genuinely *understandable* to a struggling child — why borrowing is necessary, where the borrowed value comes from, what happens when the adjacent digit is zero, how place value changes, how to check the answer — is a pedagogical judgement this session cannot make on its own authority**, per the governing instruction's explicit prohibition on self-approving educational quality. This is marked NEEDS IMPROVEMENT not because a defect was found, but because the only honest answer to "is this understandable" is that it has not yet been judged by anyone but its own author. See `MATHEMATICS_EDUCATIONAL_VALIDATION_PACK.md`.

## 7. Evidence integrity — NEEDS IMPROVEMENT

Real, honest finding from direct database inspection after the full test journey:

**What is correct:** `mastery_state` for both lesson items remained `"learning"` throughout — lesson completion was never recorded as mastery. `ali_durable_mastery` for MR-01 correctly showed `validated: false` after only two real attempts — no premature mastery claim. `times_seen`/`times_correct`/`last_attempt_correct`/`second_last_attempt_correct` all accurately reflected the real wrong-then-right sequence for both items — incorrect attempts remain part of the evidence, nothing was discarded.

**What is not correct:** the Guided Attempt's `source` column, which should read `"learning_guided"` per this vertical's own design (`MATHEMATICS_PROGRESSION_AND_MASTERY_MODEL.md` §3), was found reading `"practice_experience"` instead. Root cause: because `learn-mth-arith-guided` lives in the same real `pathway: ["csse"]` pool as every other Mathematics practice item (a deliberate, correct design choice so it feeds the same evidence pipeline), it was legitimately selected by `generatePersonalisedSession()` when the real Practice session was started immediately afterward as part of this test journey (§2) — and `recordPresentation()`'s upsert unconditionally overwrites `source` on every call, with no guard preserving an earlier value. This is a real, structural characteristic of a shared, heavily-used function (`recordPresentation`, called by every mock/practice/founder-validation/family-choice surface in this codebase), not a defect isolated to this vertical.

**Why this was not silently patched:** changing `recordPresentation()`'s overwrite behaviour is not a narrow fix — it is a change to shared infrastructure with callers across the entire application, and "should a later presentation ever overwrite an earlier source tag" is a real design question (e.g. should a "first true source" vs "last touched by" distinction exist at all) that deserves deliberate, separate consideration rather than an in-session patch under this instruction's explicit "do not expand scope" constraint. Per this account's own standing evidence-hierarchy discipline: recorded and explained here, not silently edited.

**Practical impact:** the underlying evidence (attempt counts, correctness, mastery state, durable mastery) is completely unaffected and accurate — only the provenance *tag* distinguishing "helped" from "independent" evidence can be overwritten by ordinary subsequent practice activity in the same competency. This does not corrupt anything Educational Intelligence itself relies on to compute state; it only weakens a secondary, disclosed distinction this vertical introduced.

## 8. Educational Intelligence integration — PASS

`computeRealEducationalState()`'s real output correctly drove the progression label throughout the test: "Developing" appeared after the first genuine independent attempt (correctly, not inflated to "Consistent" — `mastery_threshold: 2` was correctly not yet satisfied with confidence). The real Practice session started afterward correctly reflected the same real evidence ("Your child is just starting to explore Arithmetic Calculation").

## 9. Family Choice compatibility — PASS

Not exercised directly this session (the test profile had no active Family Choice selection), but confirmed by direct code reading: nothing in this vertical reads or writes `ali_family_focus_selection`, and MR-01 remains the Family Choice Pilot's one real pilot competency, unmodified.

## 10. Mastery protection — PASS

Confirmed directly (§7): lesson completion is never recorded as mastery; `validated: false` correctly persisted after two real attempts; `mastery_threshold: 2` was not artificially satisfied.

## 11. Wellbeing protection — PASS

`computeWellbeingSignal()` was not modified by this vertical and was not triggered during this test (the deliberate wrong answers — 2 total across both items — did not reach the 3-consecutive-incorrect Compounding Failure threshold). No override mechanism exists in this vertical's code, consistent with the same guarantee already proven for the Family Choice Pilot.

## 12. Parent translation — PASS

Inspected live on production after the test journey. "What needs attention?" showed a real, plain-language competency label with no engine terminology; Mock Readiness showed a real, evidence-computed verdict ("A first mock would be valuable") appropriate to that profile's actual state. No dashboard complexity was added to expose this vertical's data — it uses the same four-question first screen unchanged.

## 13. Regression — PASS

`/mocks`, `/dashboard`, `/learning-intelligence/practice/mathematics`, and `/mocks/adaptive/gl` (confirming GL-pathway/non-CSSE families are unaffected) all returned 200 on production after both the initial vertical deployment and the narrow-fix redeployment.

---

## What was fixed this session (narrow, verified, redeployed)

1. **Return-visit progression display** — a returning learner with real prior evidence saw a hardcoded "Learning" label instead of their actual state. Now reflects real evidence immediately. Re-verified live on production with the same real test profile: correctly showed "Developing" on a fresh page load, not "Learning."
2. **A missing space** after "borrow" in the Concept paragraph (a genuine rendering quirk, not a source typo). Re-verified live on production: renders correctly now.

Both fixes are UI-layer only. No evidence-pipeline function, teaching content, or item data was touched.

## What was found but not fixed (by design, per this instruction's own scope boundary)

- §4 (Guided learning's no-retry-on-failure gap) — a pedagogical design question, not a code defect.
- §7 (the `source` tag overwrite) — a shared-infrastructure question requiring deliberate design attention, not a same-session patch.

---

## Status distinction (governing instruction §9)

**ENGINEERING VERIFIED:** Yes. The system behaves as implemented — calculations are correct, pages render, evidence persists accurately (with the one disclosed provenance-tag caveat above), the full journey works end to end on production.

**FOUNDER EXPERIENCE ACCEPTED:** Not yet — this report exists so the Founder can personally judge the teaching, not so this session can declare it acceptable on the Founder's behalf.

**INDEPENDENT EDUCATIONAL REVIEWED:** No — unchanged from `MATHEMATICS_EDUCATIONAL_VALIDATION_PACK.md`'s existing status.

## Founder experience route

`https://angel-11plus.vercel.app/learning-intelligence/learn/mathematics/arithmetic` — no internal routes, database records, or developer terminology are required. Click "Start the lesson."

## Production commit

`868f1c17110b595bd3709b28e39785716d7db6f5` (narrow fixes, on top of `f28029fa18eaeeec428bdff1b3f8bef7792dc236` and `f3eb049cd7f10c688bb8652319a153581d409996`, the original vertical).

---

Per the governing instruction: stopping here. No further Mathematics lesson, no English, no Continuous Writing, no Applied Reasoning, no mass question authoring, and no Mock Readiness implementation has been started. Awaiting Founder personal testing before any decision on independent review or scaling this pattern.
