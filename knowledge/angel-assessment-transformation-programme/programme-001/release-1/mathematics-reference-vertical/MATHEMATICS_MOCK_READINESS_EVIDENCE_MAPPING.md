# Mathematics Mock Readiness Evidence Mapping

**Programme:** Angel Assessment Transformation Execution Programme — Release 1, Mathematics Learn → Practise Reference Vertical
**Prepared:** 2026-08-11
**Status:** Mapping only — the full Mock Readiness engine is explicitly not implemented this increment (governing instruction §13).

---

## 1. What evidence this vertical produces

Real rows in `ali_student_question_history` (Guided Attempt and Independent Check outcomes, tagged `source: "learning_guided"`/`"learning_independent"`), feeding the same `computeRealEducationalState()`/`validateCompetencyMastery()`/`evaluateDurableMastery()` pipeline every other MR-01 evidence source already feeds.

## 2. Which of it is useful for future Mock Readiness

Per `MOCK_READINESS_MODEL_V1.md`'s already-designed extension (New Learner Experience Migration), genuinely useful inputs this vertical contributes to:
- **Competency coverage** — one more real data point toward "has MR-01 been attempted at all."
- **Accuracy** — the Independent Check's real correct/incorrect outcome.
- **Mastery/maintenance status** — if enough evidence accumulates, this vertical's attempts can contribute to a genuine `mastered`/`durably-mastered` conclusion the same as any other MR-01 attempt.

## 3. Which of it is insufficient on its own

- **A single lesson's two items (one guided, one independent) cannot alone justify a mastery claim** — `validateCompetencyMastery()`'s existing threshold already requires more evidence than two attempts before concluding `mastered`; this vertical does not lower that bar.
- **Breadth** — this vertical only teaches one sub-skill (column addition/subtraction) within MR-01's five real Question Types; readiness for the *whole* competency needs evidence across all of them, most of which this vertical does not touch.
- **The Guided Attempt is scaffolded evidence** — genuinely real, but weaker than an unaided attempt; any future Mock Readiness calculation that wants to weight evidence by independence would need to treat `learning_guided`-sourced rows differently from `learning_independent`-sourced ones (the `source` tag this vertical adds makes that possible, but does not implement it).

## 4. What additional evidence would still be required

Per `MOCK_READINESS_MODEL_V1.md` §3's already-identified gaps: real time-since-last-mock, breadth across all five MR-01 Question Types (not just this one lesson's topic), and — for the wider Mock Readiness model, not specific to this vertical — learning-gain trend, which remains a genuine, disclosed, unresolved gap elsewhere in this codebase (`recommendationRuntime.ts`'s own documented judgement call).

## 5. Explicit guarantee

**A completed lesson never automatically increases Mock Readiness.** No code in this vertical writes to any readiness-adjacent signal on lesson completion alone — only the Independent Check's real, evidence-pipeline outcome does, and only in the same way any other real attempt would. This was verified by direct code inspection of the implementation (see `MATHEMATICS_REFERENCE_VERTICAL_VERIFICATION_REPORT.md`): the "lesson completed" UI state is local component state only, never passed to `recordOutcome()`, `processEvidenceForCompetency()`, or `assessMockReadiness()`.
