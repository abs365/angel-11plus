# Evidence Provenance Root Cause Report

**Programme:** Angel Assessment Transformation Execution Programme — Release 1, Mathematics Reference Vertical Remediation Gate §5
**Prepared:** 2026-08-11

## The reported symptom

The Founder Activation Report disclosed that `learn-mth-arith-guided`'s `ali_student_question_history.source` was found as `"practice_experience"` instead of `"learning_guided"` — overwritten when a later, real Practice session happened to select the same shared-pool question.

## What `source` actually means, established by reading the code and its history first

`source` was added in migration 006 (`ali_student_question_history`, Decision 8), documented at the time as: *"an open string, not a closed enum — new ALI consumers can write here later without a migration."* Its only real downstream use, confirmed by a repo-wide search for every place a `.source` value is read after being written, is: **nowhere**. No mastery, confidence, educational-state, or recommendation computation reads it. It exists purely for human/display purposes (and drives `last_presented_at`/`last_presented_at_sequence`, the cooldown-timing fields written alongside it in the same call).

Every call site of `recordPresentation()` passes a `source` describing **the context of that specific call** — `"adaptive_mock"`, `"practice_experience"`, `"mock_exam"`, `"founder_validation_assessment"`, `"family_choice_pilot"`, `"learning_guided"`, `"learning_independent"`. The function's own doc comment, written when Practice's `"practice_experience"` value was added, states plainly: *"every existing caller's exact prior behaviour is unchanged"* — i.e. the field was always designed to reflect the **most recent** presentation, upsert-overwritten every time, by intention.

## The actual root cause

There are two genuinely different questions that this vertical's design conflated:

1. **"Where did this content come from?"** (content authorship / provenance) — already fully and permanently answered by `ali_question_bank.id` and the migration that created it (`023_mathematics_learn_arithmetic_content.sql`). This was never at risk. It is immutable, has nothing to do with `ali_student_question_history`, and nothing in this vertical or in Practice ever touches `ali_question_bank` rows.
2. **"What was the most recent context in which this learner encountered this specific question?"** — this is what `source` actually and correctly represents, exactly as designed. When `learn-mth-arith-guided` was later drawn into an ordinary Practice session (because it deliberately lives in the same shared, real `pathway: ['csse']` pool, so its evidence feeds the same pipeline as everything else), `source` updating to `"practice_experience"` was not a malfunction — it was the field doing exactly the job it was built for.

**The defect was not in `recordPresentation()`.** It was the absence of any field answering a third, genuinely new question this vertical introduced and needed: **"what was the *first* context this learner ever encountered this question in?"** — a write-once fact no existing field was ever designed to hold, because no prior ALI consumer needed it (every earlier caller's questions lived in single-context pools — a mock question was only ever encountered via that mock).

## Why this was not patched as a quick symptom fix

Changing `recordPresentation()`'s overwrite behaviour (e.g. "first write wins" for `source` itself) would have broken its real, working, currently-correct purpose — every mock/practice caller's cooldown and display logic depends on `source` reflecting the *latest* encounter. That would have been a regression across every mock and Practice surface in the app to fix a problem that was never actually there. Investigating first, rather than patching the symptom, is what surfaced that the real gap was an absent field, not a broken one.

## Status

Root cause fully identified: not a defect in `source`'s existing behaviour, but a missing write-once field for a genuinely new need. Remediation in `EVIDENCE_PROVENANCE_REMEDIATION_REPORT.md`.
