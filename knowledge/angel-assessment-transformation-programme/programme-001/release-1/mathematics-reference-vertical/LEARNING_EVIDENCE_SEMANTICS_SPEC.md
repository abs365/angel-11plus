# Learning Evidence Semantics Spec

**Programme:** Angel Assessment Transformation Execution Programme — Release 1, Mathematics Reference Vertical Remediation Gate §4
**Prepared:** 2026-08-11

## The four evidence kinds this vertical produces

| Kind | Where it happens | `source` (recordPresentation) | `supportTier` (recordOutcome) |
|---|---|---|---|
| Guided Attempt | Attempt 1 of the guided ladder | `"learning_guided"` | `"independent"` (unaided first try) |
| Supported Retry | Attempts 2–3 of the guided ladder | `"learning_guided"` (same presentation, retried) | `"supported"` |
| Independent Check | The lesson's standalone check | `"learning_independent"` | `"independent"` (never gated/hinted) |
| Practice | The ordinary Mathematics Practice runner | `"practice_experience"` | `"independent"` (Practice has no support mechanism) |

## First inspecting the existing architecture (per the Gate's explicit instruction)

`ali_student_question_history` is a one-row-per-(profile, question) rolling-state table (migration 006, Decision 7) — not an event log. It already had exactly one mechanism relevant to "was this evidence independently earned": `distinctCorrectSessions` and `mastery_state`, computed by `lib/ali/mastery.ts`'s `applyAttemptOutcome()`, which is what `computeRealEducationalState()`/`fetchCompetencyEvidence()` read (confirmed by direct reading of `lib/ali/persistence/competencyEvidence.ts` and `educationalStateRuntime.ts` — both read `distinct_correct_sessions` and per-question `mastery_state` directly, with no other field in the loop). This meant the existing architecture already had the right *lever*; it was just never told about support tier, because no caller had ever needed the distinction before this vertical.

## The additive extension actually needed

Confirmed the existing architecture could **not** represent "was this specific attempt supported" at all — `applyAttemptOutcome()` had no parameter for it, and no column recorded it. This is a genuine gap, not a design already covered elsewhere. The smallest additive extension (migration 024, exactly following the Evidence Capture Layer precedent of migration 015):

1. `recordOutcome()` gains an optional `supportTier: "independent" | "supported"` parameter, threaded into `applyAttemptOutcome()`. Every existing caller omits it (defaults to `"independent"`) — zero behaviour change for mocks, ordinary Practice, Founder Validation, Family Choice.
2. `applyAttemptOutcome()`: a `"supported"` correct answer still updates `timesSeen`/`timesCorrect`/`lastAttemptCorrect` (truthful attempt record — nothing is hidden), but does not increment `distinctCorrectSessions` and cannot newly reach `"mastered"`. It also cannot revoke an already-`"mastered"` state (a supported attempt is orthogonal evidence, not counter-evidence). A `"supported"` wrong answer still contributes to the `"weak"` signal exactly as before — genuine difficulty is genuine difficulty regardless of how it was reached.
3. A new nullable column, `last_attempt_support_tier`, records the fact directly on the row (not just in the computation) so it is independently queryable/auditable — satisfying the Gate's §10 requirement that "supported retry is distinguishable where required," not merely inferred from mastery math.

## Why this does not create a parallel mastery engine

Nothing new computes mastery. `computeCompetencyConfidence()`, `validateCompetencyMastery()`, `computeEducationalState()`, `evaluateDurableMastery()` are all unmodified. The single change is one input fact (`supportTier`) feeding the one existing function (`applyAttemptOutcome()`) that already decided `distinctCorrectSessions`/`mastery_state` — the same function every mock, Practice, and Founder Validation attempt already goes through.

## Downstream consumers checked for equivalence-conflation risk

- `fetchCompetencyEvidence()` / `computeCompetencyConfidence()` / `validateCompetencyMastery()` — read `distinctCorrectSessions`, which now correctly excludes supported-only correct answers. **Safe.**
- `computeRealEducationalState()` / `deriveCompetencyMasteryState()` — reads per-question `mastery_state`, which a supported attempt can no longer newly set to `"mastered"`. **Safe.**
- `evaluateDurableMastery()` — depends on `validated` (from the above) and Maintenance Review records; unaffected directly, correctly inherits the upstream fix. **Safe.**
- Parent Dashboard / `realEvidenceLabel()` — reads `educationalState`, inherits the same correction with no separate change needed. **Safe.**
- Mock Readiness (`assessMockReadiness()`) — does not read `ali_student_question_history` at all (confirmed by repo search); entirely unaffected. **Safe, untouched.**

## Status

**EVIDENCE SEMANTICS: SAFE** — the existing architecture, extended by one additive fact and one additive column, now correctly prevents a supported success from being interpreted as equivalent to independent evidence, everywhere that distinction matters.
