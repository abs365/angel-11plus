# Mathematics Mock 1 — Deterministic Mock Analysis Engine (Decision 223)

Companion artifact to `ALI_DECISION_LOG.md` Decision 223. Prepared migration
NOT applied — Founder applies manually. No code in this artifact was released
to a learner without the Founder's own separate application step.

## 1. Why this exists

Decision 222 established: no Mock analysis processor exists anywhere in this
codebase to wire up (`analysis_state` has never left `not_started`); the
closest existing engine (`lib/learningEngine/rollup.ts`) is architecturally
the wrong tool, deliberately walled off from Mock evidence by migration 074's
own design (a high Mock score must never silently make a competency
"mastered"); and `ali_question_bank` already carries real, human-authored
`addresses_misconception`/`prompt.workingSteps` content for the Mock 1 pool.
This engine turns a scored attempt's own `question_outcomes` plus a live
join to `ali_question_bank` into trustworthy, evidence-bounded feedback.

## 2. Evidence contract

| Tier | Source | Example |
|---|---|---|
| OBSERVED | `question_outcomes[].status/marksAwarded/marksAvailable/questionTypeId` — already stored by `mock_score_attempt()`, untouched by this engine | "this question was marked correct" |
| DERIVED | Pure arithmetic over OBSERVED rows, computed by this engine | per-skill marks achieved/available, percentage, subpart count |
| AUTHORED EDUCATIONAL EVIDENCE | `ali_question_bank.addresses_misconception`/`content_difficulty` — pre-existing, previously-reviewed content, read live, never generated | "this question type often tests decimal place value" |
| UNSUPPORTED INFERENCE | Never produced by this engine | "the learner doesn't understand percentages" |

The engine never turns absence of evidence into evidence of inability — a
skill with fewer than 2 observed subparts is always `insufficient_evidence`,
regardless of correctness.

## 3. Deterministic rules and thresholds

**Evidence-strength classification** (per `questionTypeId`, then rolled up to
competency for strengths/weaknesses — see §4):

```
if subpartCount < 2:            insufficient_evidence
elif correctCount == subpartCount: demonstrated_securely
elif correctCount == 0:         not_yet_demonstrated
else:                            developing
```

This minimum-2-observations threshold is a Decision-223 convention,
disclosed as such — not sourced from any existing specification. A single
one-mark question can never alone produce a strength or a development-area
claim.

**Competency rollup**: several question types share one competency (e.g.
QT-MR-01/02/03/09 → MR-01). `strengths`/`weaknesses` are built from a
competency-level aggregation (sum of subpart/correct counts across all
question types under that competency, re-classified with the identical
rule) — never the raw per-question-type list, which would otherwise repeat
the same competency label more than once in one sentence.

**Next-practice priorities**: development-area skills ranked
`not_yet_demonstrated` before `developing`, then by marks lost (descending),
then `questionTypeId` (ascending) for full determinism — top 3.

## 4. Output model

Written into `ali_mock_attempt_report` (three new additive columns; every
other field reuses schema migration 072 already reserved):

- `skill_evidence` (new) — `{ bySkill: [...], nextPracticePriorities: [...] }`, QT-level detail for the "Skill performance" section.
- `strengths` / `weaknesses` (pre-existing, previously always empty) — competency-level, one entry per competency, `{competencyId, questionCount, correctCount}`.
- `competency_evidence` (pre-existing, previously always empty) — one provenance-tagged record per graded question, `source: "mock"`, **never** fed into `ali_student_question_history` (migration 074's own isolation wall, preserved).
- `subject_breakdown` (pre-existing, previously always empty) — one row echoing the attempt's own real `overall` totals.
- `analysis_state`, `analysis_version` (new), `analysed_at` (new) — mirror `scoring_state`/`marking_version`/`released_at`'s own established pattern.

**Never written anywhere**: a stored correct answer, `prompt.workingSteps`,
or the learner's own response text (§6).

## 5. Low-score behaviour

Verified against a representative reconstruction of the Founder-confirmed
live 6/56 result (not the literal real per-question data, never disclosed
to this session — see `scripts/mock-mathematics-analysis-engine-simulation.mjs`):
zero strengths manufactured, development areas grounded in real evidence,
next-practice priorities bounded to 3. Language distinguishes "not yet
demonstrated in this Mock" (0% of 2+ observed) from "still developing"
(mixed), never "cannot"/"doesn't understand"/"is weak at" from one sitting.
An empty strengths list renders an honest note about the paper's own
evidence coverage, never a fabricated compliment.

## 6. Anti-memorisation / question review boundary

This engine **never** exposes a full correct answer, `workingSteps`, or
mark-scheme detail to any learner — confirmed structurally by
`tests/supabase/mockDeterministicAnalysisEngine.test.ts`'s own "QUESTION
REVIEW BOUNDARY" test. `addresses_misconception` is surfaced only in SAFE
framing ("this question type often involves...") from an incorrect row,
never as a claim about what the learner actually did — no deterministic
matching between a learner's response and a specific misconception exists,
and none is invented. No question-retirement/reuse-tracking mechanism
exists yet; because this engine never reveals a full answer, none is
required for this increment. Building full-answer question review in a
future increment would require that prerequisite first.

## 7. Tests

- `tests/lib/ali/mockAnalysisEngine.test.ts` (20) — pure-function engine: all-correct, all-wrong, representative low-score, mixed-performance, one-question non-overclaim, competency-rollup deduplication, misconception safety, priority bounding/ordering, determinism.
- `tests/lib/mockAttempt/reportCopy.test.ts` (+14 new, 24 total) — language safety for every new sentence.
- `tests/supabase/mockDeterministicAnalysisEngine.test.ts` (23) — migration structure, security grants, evidence contract, trigger isolation, no-answer-leakage.
- `tests/lib/mockAttempt/mockReportAnalysisRendering.test.ts` (10) — report page gating, honest empty states, no internal codes in learner-facing text.
- `scripts/mock-mathematics-analysis-engine-simulation.mjs` — end-to-end simulation against the real, frozen 56-row manifest.

All 2485/2485 tests pass (2418 baseline + 67 new).

## 8. Limitations, disclosed

- Full-answer question review is not built (§6).
- Next-practice priorities are persisted but not yet routed to any live practice page — `/learning-intelligence/practice/[area]` is subject-level only, not competency-specific.
- `competency_evidence` is written but not consumed anywhere yet (deliberately isolated from `ali_student_question_history`).
- A second call to `mock_release_report()` after release re-stamps `released_at` (pre-existing, unrelated observation, not this engine's own concern).
- The parent-facing report page (`app/learning-intelligence/parent/mock-report/[attemptId]/page.tsx`) is unchanged this decision — same scope boundary as Decision 221.

## 9. Future integration points (mapped, not implemented)

Source of truth for all future integration: `ali_mock_attempt_report` itself
(never `ali_student_question_history`, never `lib/mockProgress.ts`'s legacy
localStorage system). Learning Report, Parent Dashboard, Progress Timeline,
Admissions Readiness, and Weekly Report would each read
`getMockAttemptReport()` (already exists, already RLS-safe) — none of that
is built or authorised by this decision.
