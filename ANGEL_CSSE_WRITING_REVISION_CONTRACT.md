# ANGEL 11+ — CONTINUOUS WRITING: REVISION EDUCATIONAL AND TECHNICAL CONTRACT (V1, 2026-10-08)

Status: **design contract only. Nothing is built, no table is created, no migration exists.** It defines the smallest safe design and the first bounded increment.

## 1. What is true today (grounding)

- Practice Writing is a **single submission**. The text goes to `/api/writing-feedback` (authenticated, stateless), the feedback returns to the browser, and Angel records one outcome as **supported tier** (`recordAndAdvance(..., "supported")`). **The learner's text is not stored anywhere in Practice.**
- The AI read is uncalibrated and is excluded from mastery (Decision 60). Mock Writing is stored (`ali_writing_assessment`), immutable, with additive human-review columns.
- Therefore a revision feature would, for the first time, either keep or store a child's free-text writing. That is a **data-protection decision**, not only an educational one (`angel-privacy-launch-readiness`: the formal Children's Code / DPIA work is not independently verified).

## 2. Educational behaviour (Practice only)

```
FIRST ATTEMPT -> FEEDBACK -> LEARNER REFLECTION -> OPTIONAL REVISION -> COMPARISON
```

| Stage | What the learner does | What Angel does |
|---|---|---|
| First attempt | Writes and submits, exactly as today | Records the original outcome exactly as today (supported tier, excluded from mastery) |
| Feedback | Reads strengths, areas to improve, one suggested upgrade, the dimension reads | Unchanged |
| Reflection | Picks **one** area from the feedback and says in a sentence what they will change (and, optionally, why it matters) | Stores nothing that is not already in the feedback, apart from the pick |
| Optional revision | Edits **their own text** toward that one area; the first draft stays visible beside it | Offers it as optional ("Want to try improving one thing?"); never required, never scored as a task |
| Comparison | Sees draft and revision side by side, the area they chose, and the dimension reads for both | Presents the change as **what changed**, not as a mark or a gain |

Principles: revising is a learning behaviour, not a second chance at a score; one focused change beats a rewrite; the learner owns the choice; Angel recommends, the family chooses.

## 3. Hard rules

1. **The original is immutable.** Its evidence record (and, if stored, its text) is never updated or overwritten by a revision.
2. **A revision is a separate, linked record**, never a replacement: `kind = revision`, pointing to its original.
3. **A revision never improves the original.** Original-attempt analytics, readiness and recommendations read only original attempts.
4. **No mastery from Writing, ever** (unchanged). A revised attempt carries its own evidence source (`writing_revision`), is **supported tier**, and is excluded from mastery, readiness and "durable" evidence. Revised success is not independent success.
5. **No improvement number.** Angel shows the dimension reads for both versions, but never a score delta or "you improved by N points". The AI read is uncalibrated and unstable on repeats (to be measured by the calibration protocol), so a delta could be noise.
6. **Caps:** at most **one revision per original** in the first version (a second round is a later decision made on evidence of use).
7. **Formative only.** Everything here is *formative writing feedback*, not validated assessment or exam-readiness evidence (clearly labelled in the UI and in parent reporting).
8. **Mock Writing is out of scope and stays immutable.** No revision during, or after, a scored Mock attempt in any way that touches the original assessment. The revision code path must not be reachable from any Mock surface (enforced by a test, as for the remediation module).

## 4. Smallest safe design, in two tiers

**Tier 1 (recommended first increment): revise without storing the child's text.**
- The first draft is held in the browser session only; the revision is a second call to the same feedback endpoint on the revised text, **independent of the first read** (same prompt, no hint about the earlier feedback, so the second read is not steered toward the earlier criticism).
- The comparison view is rendered locally from the two feedback results and the two texts held in memory.
- What is **stored**: one small, text-free evidence event linked to the original outcome: `{ original_outcome_id, learner_id, chosen_area, dimension_levels_original, dimension_levels_revision, confident_flags, revised_word_count_change_band, created_at }`, kind `writing_revision`, supported tier, not counted towards mastery.
- Privacy impact: **no new personal text is stored**, so no new retention question arises; the dimension levels are the same kind of data as the existing outcome.

**Tier 2 (later, only with a recorded privacy decision): a writing portfolio.**
- Stores the original and the revision text as insert-only versions: `ali_writing_practice_attempt(id, learner_id, question_id, kind original|revision, original_attempt_id, version_no, response_text, feedback_snapshot, reflection_text, created_at)`; no UPDATE or DELETE grant to any client role; reads through the existing learner-ownership checks (`current_learner_id()`); a parent-visible view; a stated retention period; deletion on learner deletion.
- Needs: parent consent wording, retention period, and a DPIA update. Not started, and not needed for the educational loop to work.

## 5. Analytics definitions (so reports cannot mix the two)

| Measure | Population | Notes |
|---|---|---|
| Original independent attempt | original attempts only | the only thing readiness, recommendations and the learner profile use |
| Post-feedback revised attempt | revision events only | reported separately and always labelled "revised" |
| Revision uptake | revisions / originals offered | an engagement measure |
| Area addressed | learner pick vs the revised read of that dimension | self-selected; reported as "moved / did not move", never as a gain; low-confidence reads excluded |
| Dimension movement | original vs revised read, per dimension | descriptive only; shown to the Founder and, in plain words, to the parent |

Any report that shows a revised attempt must say so. No metric sums original and revised attempts.

## 6. Interaction with calibration

The human-calibration protocol already measures AI repeatability. Until that has been run, revised-versus-original movement is described to learners and parents as **"what changed in the writing"**, never as improvement. If calibration shows the AI read is stable enough, wording can become more confident through a separate decision.

## 7. Tests to write before any UI (deterministic, no learner needed)

- A revision record never references anything but an original of the same learner and question; a second revision of the same original is rejected.
- Original-attempt queries (readiness, mastery, recommendations) return identical results with and without revision events present.
- A revision event is supported tier and has no path into `applyAttemptOutcome` mastery counting.
- No Mock page, Mock API route or Mock RPC imports the revision module.
- The feedback request for a revision is byte-identical in shape to the first request and carries no reference to the earlier feedback.
- The comparison view never renders a numeric difference or the words "improved by".

## 8. First bounded increment (when approved)

Tier 1 only: a small state machine on the existing Practice Writing screen (reflect, optionally revise, compare), the text-free evidence event, and the tests above. No new table of text, no parent-visible portfolio, no change to Mock. It reuses the existing feedback endpoint and evidence path.

## 9. Decisions this contract settles, and the one it leaves

Settled by this design: what a revision is, that the original is immutable, that revised work is formative and never mastery, that there is no improvement score, one revision per original, Mock excluded.
**Left for the Founder (a single, specific decision):** whether to ever store the child's writing (Tier 2). It is a privacy and retention choice and is **not** needed for Tier 1 or for the educational loop.
