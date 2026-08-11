# Guided Learning Remediation Report

**Programme:** Angel Assessment Transformation Execution Programme — Release 1, Mathematics Reference Vertical Remediation Gate §1
**Prepared:** 2026-08-11

## The defect

The Founder Activation Report found that a learner who answered the Guided Attempt incorrectly — even after using all three voluntary hints — was told "Ready to practise" and moved straight into the unscaffolded Independent Check. No second attempt, no scaffolding, no acknowledgement that the first try, with help, still didn't succeed.

## The remediation: a bounded 3-attempt support ladder

`app/learning-intelligence/learn/mathematics/arithmetic/page.tsx`, `GuidedLadderStage`:

| Attempt | Trigger | If wrong | If correct |
|---|---|---|---|
| 1 | Learner's first, unaided try (voluntary generic hints remain available, unchanged from before) | Targeted feedback shown (see below), no answer revealed, real retry offered | Ladder resolves — evidence tier **independent** |
| 2 | Retry after attempt 1's targeted feedback | Full worked resolution shown (every column, explicitly, reusing the Worked Examples' style), then one bounded supported retry offered | Ladder resolves — evidence tier **supported** |
| 3 | Supported retry, only reachable after the full worked resolution was shown | Ladder resolves anyway — no infinite loop | Ladder resolves — evidence tier **supported** |

Attempt 3 always resolves regardless of outcome, matching the explicit "do not implement an infinite retry loop" instruction. Independent Check is untouched — it remains one unaided attempt, no hints, no retry ladder, per the prior activation report's own finding that no defect existed there.

## Targeted feedback vs a fabricated diagnosis

Per §3 of the Remediation Gate ("if the evidence only proves the answer is incorrect, do not pretend Angel knows why"), and consistent with `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md §11`'s existing, explicit deferral of a persisted mistake-category taxonomy: `classifyWrongAnswer()` is **not** a general misconception classifier and writes nothing to the database. It is two fixed, hand-verified, deterministic wrong answers for these two specific fixed problems:

- Guided item (652 + 279 = 931): if the wrong answer is exactly **821** (each column summed independently with no carry propagated — `2+9→1`, `5+7→2`, `6+2→8`), the feedback names that specific pattern.
- Independent item (903 − 468 = 435): if the wrong answer is exactly **565** (the classic across-zero misconception — subtracting the smaller digit from the larger one in each column regardless of position), the feedback names that specific pattern.

Any other wrong answer gets an honest, generic nudge ("go back to the ones column and work through each column one at a time") — never a fabricated "I can see you did X." This is ephemeral UI feedback text only; no new evidence column stores a mistake category, so the frozen governance boundary in `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md §11` is not touched.

## Evidence semantics: supported success is not independent evidence

Every real attempt in the ladder is recorded truthfully via `recordOutcome()` (times_seen, times_correct, last_attempt_correct all update on every attempt — nothing is discarded). But `recordOutcome()` now takes an optional `supportTier: "independent" | "supported"` (migration 024, default `"independent"`, zero behaviour change for every other caller in the app). Attempt 1's outcome is tagged `"independent"`; attempts 2 and 3 are tagged `"supported"`, since they only happen after real remediation was shown.

`lib/ali/mastery.ts`'s `applyAttemptOutcome()` uses this tag: a `"supported"` correct answer still updates `timesSeen`/`timesCorrect`/`lastAttemptCorrect` truthfully, but does **not** increment `distinctCorrectSessions` and cannot, by itself, newly reach `masteryState: "mastered"`. It also cannot revoke an already-earned `"mastered"` state — a supported attempt is orthogonal to mastery, not evidence against it. Full design and impact assessment in `LEARNING_EVIDENCE_SEMANTICS_SPEC.md`.

## What was deliberately not built

- No infinite retry loop.
- No persisted misconception/mistake-category taxonomy (stays deferred per existing governance).
- No change to the Independent Check's evidence status — it remains the vertical's one genuinely unaided, ungated measurement.
- No parallel mastery engine — `applyAttemptOutcome()` was extended with one new parameter and one new branch, not replaced.

## Status

**GUIDED LEARNING: READY** for Founder re-test (see `UPDATED_FOUNDER_TEST_INSTRUCTIONS.md`) — engineering-verified only; not a claim of pedagogical validation.
