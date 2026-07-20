# Recommendation Engine Specification

**Work Package:** ANGEL-CSSE-001 — Deliverable 5
**Status:** Documentation only. Grounds the requested specification in two real, already-implemented systems rather than designing a third. Identifies one requested field that directly conflicts with an explicit frozen boundary.

---

## 1. What already exists — two systems, not reconciled with each other

This is the same architectural finding already raised in `ANGEL_V1_PRODUCT_EXPERIENCE_IMPLEMENTATION_AUDIT.md` (Section C, item 5: "one recommendation surface, not three"), now specified precisely at the code level:

**System A — Learning Engine V1's Recommendation Model** (`docs/intelligence/LEARNING_ENGINE_V1.md` §7, implemented in `lib/learningEngine/recommendations.ts`). Defines five categories only — **Practice, Consolidation, Revision, Extension, Review** — each triggered by a specific Diagnostic Intelligence finding (Emerging Skills, ET-2-confined Demonstrated, Development Areas, Mastered Skills, stale Historical Progress respectively). Explicitly, by design: *"No category is prioritised over another, no selection logic decides which fires when, and no algorithm is defined"* (§7) — this is a real, deliberate boundary, not an unfinished feature. `computeRecommendations()` (`lib/learningEngine/recommendations.ts`) implements exactly this — it returns every triggered recommendation, unordered, and its own code comment states callers "must not sort this list as if it were ranked." **Scope: CSSE only, and only the competencies Learning Engine V1 covers (Reading Comprehension, Continuous Writing, Mathematics via the 13 competencies) — this system has never been extended to GL/CEM/ISEB pathways or to Vocabulary.**

**System B — the Daily Mission engine** (`lib/adaptiveEngine.ts`, powers the Dashboard's "Today's Admission Mission"). A separate, older, flat-score-based system: it assigns each subject a tier (`foundation`/`developing`/`advanced`/`challenge`) from `SubjectAnalytics.avgScore`, picks specific lesson/mode recommendations per subject via hand-written rules (e.g. `pickEnglishLesson()`, `pickMathsMode()`), and **does** produce a real priority ordering (`primary`/`secondary`/`review` mission items, weighted by weak-subject targeting) — the opposite of System A's deliberate refusal to rank. System B covers every subject and pathway in the app, not just CSSE.

**A third surface** (`app/learn/page.tsx`, `app/reasoning/page.tsx`'s "Recommended" tags) reads System B's own output a second time, filtered per-hub — not an independent third system, but a third *place* the same System-B recommendation is shown.

**This document does not merge Systems A and B.** Doing so would be new design work belonging to `ENTERPRISE_DATA_MODEL.md` (Deliverable 8) and a future implementation work package, not this documentation pass. What follows specifies each of the work package's four requested fields against **both** systems, honestly, rather than presenting a single blended answer that doesn't exist in the running product.

## 2. "Why each activity is recommended"

**System A:** already real and specific — `computeRecommendations()` generates a distinct, competency-named reason string per category, e.g. *"[Competency] shows a positive but thin pattern of evidence — more practice would help establish it more broadly"* (Practice), *"...is demonstrated within one question format only — broadening... would strengthen it"* (Consolidation), *"...evidence indicates this competency's demands are not yet being met — revisiting it directly is indicated"* (Revision), *"...has reached this model's evidence ceiling — attention could reasonably move elsewhere"* (Extension). Every reason traces directly to a named Competency ID and its Diagnostic category — fully explainable, per Learning Engine V1 Principle 5.

**System B:** already real — `EXPECTED_OUTCOME` (`app/dashboard/page.tsx`) provides one fixed sentence per priority tier (*"Directly strengthens your current focus area"* / *"Builds on today's momentum"* / *"Keeps a mastered skill sharp"*), not per-subject-specific — coarser than System A's per-competency reasoning.

## 3. "Expected improvement" — direct conflict with an explicit frozen boundary, not built

**Neither system currently states an expected improvement, and System A is explicitly forbidden from doing so.** Learning Engine V1 §9 states without qualification: *"Predict. No future exam question, future performance, or trajectory is forecast from Historical Progress or any other element."* An "expected improvement" field is, definitionally, a performance forecast. Adding it to System A would be a direct reversal of one of that document's explicit, named boundaries — not an extension, a contradiction.

**This document does not build this field.** If a Founder decision is made to allow bounded, evidence-qualified statements like "learners who move from ET-2 to ET-3 on this competency have historically also seen X" — that would require (a) real historical-progress data to exist at scale, which Learning Engine V1 §3.6 itself notes has no persistence mechanism yet, and (b) a formal, logged reversal of the §9 no-prediction boundary, exactly like the Speed/Confidence findings in `LEARNING_INTELLIGENCE_FRAMEWORK.md`. Flagged, not performed.

## 4. "Linked competencies"

**System A:** already real and exact — every `Recommendation` object carries a single `competencyId` (`lib/learningEngine/types.ts`), traceable through `CSSE_COMPETENCY_TOPIC_MAPPING.md`'s reconciliation table to a real exam-evidenced competency.

**System B:** linked by subject (`english`/`maths`/etc.), not by competency — coarser, since System B predates Learning Engine V1 and was never re-platformed onto the competency model.

## 5. "Evidence supporting recommendation"

**System A:** already real — every recommendation is one of exactly five deterministic outputs of a `CompetencyStatus`'s Evidence Signal × Evidence Tier (Learning Engine V1 §3.2/§3.3), which is itself traceable to real `ali_student_question_history` rows (migration `006`) and, through the Question Type each row is tagged with, back to Assessment Brain V1's own asset-cited exam evidence. This is a complete, real evidence chain from recommendation to source exam paper.

**System B:** evidence is `SubjectAnalytics.avgScore` and `completedLessons` membership — real, live data, but a flat aggregate score, not a competency-level evidence chain.

## 6. Recommended next step, not performed here

A future, separately-authorised work package should decide whether System B (Daily Mission) is retired in favour of extending System A's competency-based model to every subject/pathway System B currently covers alone — this is the same consolidation this programme's Product Experience audit already recommended (`ANGEL_V1_PRODUCT_EXPERIENCE_IMPLEMENTATION_AUDIT.md`, backlog item 4) for the adjacent legacy-ALI-vs-Learning-Engine-V1 duplication. This specification does not perform that consolidation; it documents precisely what each system currently does, so that decision can be made with full information.
