# Mathematics Progression and Mastery Model

**Programme:** Angel Assessment Transformation Execution Programme — Release 1, Mathematics Learn → Practise Reference Vertical
**Prepared:** 2026-08-11

---

## 1. The core distinction (governing instruction §12)

**Lesson completed** (a real, local fact: the child has viewed the Concept/Method/Worked Examples and attempted the Guided Attempt) is never conflated with **skill mastered** (a real, evidence-based fact: `validateCompetencyMastery()`'s threshold-met-with-moderate-confidence gate, unmodified). This vertical introduces no shortcut between the two.

## 2. State mapping — every state traced to a real signal, nothing invented

| Parent/child-facing label | Real underlying signal | Source (unmodified) |
|---|---|---|
| Not yet started | No lesson interaction recorded | Local UI state only |
| **Learning** | Lesson opened; Worked Examples viewed; Guided Attempt not yet completed | Local UI state only — **not** an evidence claim, not written to any evidence table |
| **Ready to practise** | Lesson completed (Guided Attempt done) but Independent Check not yet attempted, OR Independent Check attempted but Educational State is still `exploring` | Local UI state (lesson progress) + `computeRealEducationalState()`, unmodified |
| **Not yet understood** | Independent Check attempted and incorrect; Educational State `rebuilding` | `computeRealEducationalState()`, unmodified |
| **Developing** | Real evidence exists; Educational State `building-knowledge` or `practising`; not yet validated | `computeRealEducationalState()` + `validateCompetencyMastery()`, unmodified |
| **Consistent** | Educational State `mastered` — threshold met, confidence ≥ moderate | `validateCompetencyMastery()`, unmodified |
| **Maintenance needed** | Educational State `reviewing` — a genuine calendar gap since last mastered evidence | `isMaintenanceReviewDue()` / `evaluateDurableMastery()`, unmodified |

Only two labels ("Learning," and the lesson-completed half of "Ready to practise") are not backed by the Educational Intelligence Engine at all — they are pure lesson-navigation state, tracked in the Learn page's own component state, never persisted as evidence, and never allowed to influence `computeRealEducationalState()`'s real computation. This is the explicit line the governing instruction draws: finishing a lesson is a real, honest fact, but it is a *navigation* fact, not an *evidence* fact.

## 3. The Guided Attempt is tagged distinctly from the Independent Check

Per governing instruction §12's spirit (progression decisions must use evidence, not lesson-completion alone), the Guided Attempt's outcome is recorded with `source: "learning_guided"` (vs. the Independent Check's `source: "learning_independent"`) when written via `recordOutcome()` — both real, both written to the same `ali_student_question_history` table via the same unmodified function (the `source` column is already a plain, open string by design, per its own migration 006 documentation), but distinguishable for any future analysis that needs to know whether help was given. Both still count toward the Educational Intelligence Engine's evidence for MR-01, since both are genuine attempts — no evidence is suppressed or hidden, only tagged.

## 4. No second evidence system

Every write in this vertical goes through the exact same functions every other CSSE surface already uses: `recordPresentation`, `recordOutcome`, `processEvidenceForCompetency` (`lib/ali/history.ts`, `lib/learningEngine/educationalIntelligenceService.ts`). Nothing new is written anywhere else.

## 5. Wellbeing and durable mastery compatibility

Neither is touched. The wellbeing veto (`computeWellbeingSignal()`) and durable mastery/maintenance review (`evaluateDurableMastery()`, `isMaintenanceReviewDue()`) operate on the same `ali_student_question_history`/`ali_durable_mastery` data this vertical writes into, completely unmodified — a learner who focuses heavily on this lesson is still subject to the same wellbeing veto and the same maintenance-review-due detection for every other competency, exactly as the Family Choice Pilot already proved for its own choice-injection mechanism.

## 6. Family Choice compatibility (governing instruction §10)

MR-01 already is the Family Choice Pilot's one pilot competency. This vertical's Learn content is reachable regardless of *why* a learner is focusing on MR-01 — whether Angel recommended it (a real `RecommendationCandidate`, unmodified) or the family chose it (`ali_family_focus_selection`, unmodified) — the teaching content itself does not change based on provenance, only the framing text on the page that led the learner there. No new provenance state is introduced.
