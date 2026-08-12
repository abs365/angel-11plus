# Mathematics Lesson 002 — Question Authenticity Gate and Evidence Map

**Programme:** Angel Assessment Transformation Execution Programme — Release 1, Mathematics Learning Sequence Expansion (Educational Increment 002)
**Prepared:** 2026-08-12
**Competency:** MR-04 (Multi-Step Word-Problem Interpretation) · **Question Type:** QT-MR-04 (Percentage / Proportional Change)

Every question type below carries its **live, current** `explanation`, `content_difficulty` and `mastery_threshold` values as queried directly from `ali_question_bank` on 2026-08-12 (post the Copy Quality Gate migrations 027/028), not from any earlier or cached snapshot.

---

## 1. Individually inspected candidates

### `mth-010` — pathway `csse`

- **Question:** "What percentage of 340 is 85?" → **Answer: 25%**
- **Explanation (live):** "Direct percentage calculation. Assessment Brain QT-MR-04, competency MR-04."
- **Difficulty:** medium · **Mastery threshold:** 2
- **Classification: Authentic Assessment Candidate.** This is the reverse direction of the target skill (find-the-percentage, not find-the-part). Genuinely authentic, correctly tagged, hand-checkable (85 ÷ 340 × 100 = 25), but **not the bounded skill this lesson teaches** (§ Learning Design, Section 4's "compare two fractions" precedent for a narrow objective). Not used as a Guided/Independent/Transfer item. Cited honestly in the lesson's "Where this shows up in the exam" section as evidence that percentage reasoning appears in more than one direction on real papers, without requiring the learner to solve this harder reverse-direction type in this lesson.

### `qa-007` — pathway `csse`

- **Question:** "15% of 60 = ?" → **Answer: 9**
- **Explanation (live):** "Percentage-of-a-number calculation (15% of 60). Unlike fractions, Assessment Brain has a dedicated Question Type for this (QT-MR-04, Percentage/Proportional Change). Matches mth-010's precedent exactly, not QT-MR-01."
- **Difficulty:** medium · **Mastery threshold:** 2
- **Classification: Teaching Evidence.** Exactly the target skill (percentage of a quantity), correctly tagged, hand-verified (10% of 60 = 6, 5% = 3, 15% = 9). Reused directly as **Worked Example 1** in the lesson (the same precedent Lesson 001 followed, citing `fv-mth-001`/`qa-002` as real evidence while authoring fresh numbers for the interactive teaching items — here the numbers themselves are reusable as a worked example without any interactive submission attached, so direct reuse carries no evidence-duplication risk).

### `mth-007b` — pathway `csse`

- **Question:** "In a class, the ratio of boys to girls is 3:4. There are 28 girls. How many students are there altogether?" → **Answer: 49**
- **Explanation (live):** "Ratio is a form of proportional-change reasoning. Assessment Brain QT-MR-04, competency MR-04."
- **Difficulty:** medium · **Mastery threshold:** 2
- **Classification: Not Suitable (for this lesson).** Genuinely authentic and correctly evidenced, but the *concrete* skill is ratio-sharing (parts-and-total reasoning), not percentage-of-a-quantity, despite sharing the QT-MR-04 tag. Its own `explanation` field frames it as "a form of proportional-change reasoning," an honest acknowledgement that the tag is a genre-level grouping, not a claim that every QT-MR-04 item teaches the identical technique. Including it in a lesson whose learning objective is bounded to percentage-of-a-quantity would blur the objective (governing instruction §4: "avoid broad objectives"). **Disclosed and excluded**, not silently repaired or reused. A candidate for a possible future "Ratio Sharing" lesson, not this one.

### `mth-001` — pathway `csse`

- **Question:** "A train travels at 60 miles per hour. How long does it take to travel 225 miles?" → **Answer: 3 hours 45 minutes** (Question Type QT-MR-10, Elapsed-Time / Scheduling)
- **Classification: Not Suitable (for this lesson).** Real, EMC-4, correctly tagged — but a different Question Type (QT-MR-10, not QT-MR-04) and a different concrete skill (time-division word problems, with a non-numeric compound answer format). Out of scope for a percentage-bounded lesson.

### `mth-005` — pathway `csse`

- **Question:** "A shopkeeper bought 40 books for £3.50 each and sold them for £5.20 each. How much profit did he make in total?" → **Answer: £68** (Question Type QT-MR-13, Best-Value/Combinatorial)
- **Classification: Not Suitable (for this lesson).** QT-MR-13 is EMC-3/MEDIUM (not EMC-4 — the competency-level MR-04 upgrade does not uniformly lift every Question Type beneath it, per `ASSESSMENT_BRAIN_V1.md` §4's per-QT table), a different concrete skill (multi-step money profit calculation), and a weaker evidence tier than the selected QT-MR-04 items. Out of scope for this lesson.

## 2. New teaching items (to be authored, not reused verbatim as interactive items)

Following the exact precedent set by migrations 023/025 (Lesson 001's own `learn-mth-arith-guided/independent/independent-retry`): the interactive Guided Attempt, Independent Check and fresh-transfer items are **newly authored, hand-checked numbers**, not the verbatim existing bank rows above, so that `qa-007`/`mth-010`/`mth-007b` remain intact and undiminished in the general Mathematics Practice pool. Each new item's difficulty, mastery threshold and Question Type tag match the real evidence above exactly (medium, threshold 2, QT-MR-04, competency MR-04).

| Item | Role | Content | Classification |
|---|---|---|---|
| `learn-mth-pct-guided` | Guided Attempt Eligible | "15% of 80 = ?" → 12 | New, authored, same QT/skill as `qa-007`, hand-checked |
| `learn-mth-pct-independent` | Independent Check Eligible | "20% of 90 = ?" → 18 | New, authored, hand-checked |
| `learn-mth-pct-independent-retry` | Transfer Eligible | "30% of 70 = ?" → 21 | New, authored, hand-checked, genuinely different numbers from the Independent Check item |

Full working for each is hand-verified in `MATHEMATICS_LESSON_002_LEARNING_DESIGN.md` §3–5 before being written into the migration.

## 3. Summary

| Question | Classification | Used as |
|---|---|---|
| `qa-007` | Teaching Evidence | Worked Example 1 (direct reuse) |
| `mth-010` | Authentic Assessment Candidate | Cited in Exam Application, not an interactive item |
| `mth-007b` | Not Suitable (skill mismatch, disclosed) | Excluded |
| `mth-001` | Not Suitable (different Question Type) | Excluded |
| `mth-005` | Not Suitable (weaker evidence tier, different skill) | Excluded |
| `learn-mth-pct-guided` (new) | Guided Practice Eligible | Guided Attempt |
| `learn-mth-pct-independent` (new) | Independent Check Eligible | Independent Check |
| `learn-mth-pct-independent-retry` (new) | Transfer Eligible | Fresh transfer opportunity |

No question's wording, answer, or tagging was silently repaired. No ambiguous or incorrect source data was found in the items actually used.
