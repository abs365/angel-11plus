# WP-15: Proposed Probability Questions

**Status: PROPOSED — PENDING HUMAN REVIEW, throughout this entire document.** Nothing below has been imported into `ali_question_bank`, added to `data/maths.ts`, or treated as production curriculum in any way. No application code or data file was modified to produce this document. Closes `CURRICULUM_GAP_REGISTER.md` GAP-001 only once approved and actually authored into the real content banks — this document is the proposal, not the resolution.

**Competency (proposed, not yet formally adopted):** `maths.probability` — a 17th Mathematics competency, extending `QUESTION_AUTHORING_STANDARD.md` §11.2's existing 16-competency table. Tests: expressing probability as a fraction/percentage from equally-likely outcomes, probability vocabulary (impossible/unlikely/even chance/likely/certain), the complement rule (P(not A) = 1 − P(A)), and reverse reasoning from a partial probability + a known count. This is itself a proposed taxonomy addition, not a confirmed one — flagged the same way NVR/Spatial/Mathematical Reasoning's new taxonomies were flagged in WP-01.

**Grounding:** all six questions are original content, written fresh for this proposal (no reproduction or paraphrase of any published source, per `QUESTION_AUTHORING_STANDARD.md` §6/§7), scoped to UK KS2 (Year 5/6) probability as commonly examined across GL/CEM/ISEB Mathematics content — reverse-percentage-style Hard/Challenge probability items were specifically prioritised, since `QUESTION_AUTHORING_STANDARD.md` §14.2 already flagged an equivalent gap (no reverse-percentage question) in `numreason.percentages`, and this proposal aims not to repeat that gap for Probability.

---

## PQ-001

**Question:** A bag contains 3 red counters and 2 blue counters. One counter is picked at random. What is the probability that it is red? Give your answer as a fraction.

| Field | Value |
|---|---|
| Competency | `maths.probability` |
| Difficulty | Easy |
| Correct answer | 3/5 |
| Worked explanation | Total counters = 3 + 2 = 5. Red counters = 3. Probability = favourable outcomes ÷ total outcomes = 3/5. |
| Common misconception | Writing the count of red counters (3) as the answer on its own, without expressing it as a fraction of the total — confusing "how many" with "what probability." |
| Author confidence | High |

---

## PQ-002

**Question:** A spinner is divided into 4 equal sections, numbered 1, 2, 3 and 4. Which word best describes the probability of spinning an even number: impossible, unlikely, even chance, likely, or certain?

| Field | Value |
|---|---|
| Competency | `maths.probability` |
| Difficulty | Easy |
| Correct answer | even chance |
| Worked explanation | Even numbers on the spinner are 2 and 4 — 2 out of 4 sections. 2/4 = 1/2, exactly half, which is the definition of "even chance." |
| Common misconception | Assuming "even chance" only describes literal coin-flip contexts, not recognising that any outcome with probability exactly 1/2 qualifies — or miscounting which of 1–4 are even. |
| Author confidence | High |

---

## PQ-003

**Question:** The probability that it rains tomorrow is 3/10. What is the probability that it does NOT rain?

| Field | Value |
|---|---|
| Competency | `maths.probability` |
| Difficulty | Medium |
| Correct answer | 7/10 |
| Worked explanation | An event and its opposite always have probabilities that add up to 1. P(not rain) = 1 − 3/10 = 10/10 − 3/10 = 7/10. |
| Common misconception | Treating "probability of not raining" as a separate, unrelated estimate rather than applying the complement rule — or computing 1 − 3 instead of 1 − 3/10 (subtracting the numerator from 1 as a whole number). |
| Author confidence | High |

---

## PQ-004

**Question:** A fair six-sided dice is rolled once. What is the probability of rolling a number greater than 4? Give your answer as a fraction in its simplest form.

| Field | Value |
|---|---|
| Competency | `maths.probability` |
| Difficulty | Medium |
| Correct answer | 1/3 |
| Worked explanation | Numbers greater than 4 on a dice: 5 and 6 — 2 outcomes. Total possible outcomes = 6. Probability = 2/6, which simplifies to 1/3. |
| Common misconception | Including 4 itself as "greater than 4" (a boundary/language misreading — "greater than" is strict, not "4 or more"), or leaving the answer as 2/6 unsimplified. |
| Author confidence | High |

---

## PQ-005

**Question:** A box contains 8 milk chocolates, 5 dark chocolates and 7 white chocolates. One chocolate is chosen at random. What is the probability that it is NOT dark? Give your answer as a percentage.

| Field | Value |
|---|---|
| Competency | `maths.probability` |
| Difficulty | Hard |
| Correct answer | 75% |
| Worked explanation | Total chocolates = 8 + 5 + 7 = 20. Not dark = milk + white = 8 + 7 = 15. Probability = 15/20 = 3/4. As a percentage, 3/4 = 75%. |
| Common misconception | Misreading "NOT dark" and computing P(dark) = 5/20 = 25% instead — or correctly finding 3/4 but forgetting to convert it to the percentage the question asked for. |
| Author confidence | High |

---

## PQ-006

**Question:** A bag contains only red and blue counters. The probability of picking a red counter is 2/5. There are 15 blue counters in the bag. How many red counters are there?

| Field | Value |
|---|---|
| Competency | `maths.probability` |
| Difficulty | Challenge |
| Correct answer | 10 |
| Worked explanation | If P(red) = 2/5, then P(blue) = 1 − 2/5 = 3/5 (complement rule). 3/5 of the bag = 15 blue counters, so 1/5 of the bag = 15 ÷ 3 = 5. Total counters = 5 × 5 = 25. Red counters = 25 − 15 = 10. |
| Common misconception | Assuming the 15 blue counters directly correspond to "3" as a raw part-count without first converting the *given* probability (red = 2/5) into blue's own probability (3/5) — a two-step reverse-reasoning chain that's easy to shortcut incorrectly, the same class of error `QUESTION_AUTHORING_STANDARD.md` §11.4 already names for multi-step algebra items. |
| Author confidence | Medium — the mathematics and wording are sound, but this is the first Challenge-tier item for a brand-new competency with no existing calibrated content to compare its difficulty against (the same honest calibration caveat WP-02 raised for `nvr.3d-shapes`, a single-question, uncompared competency). |

---

## Summary

6 questions, spanning Easy (2) → Medium (2) → Hard (1) → Challenge (1), all testing genuinely distinct facets of the proposed `maths.probability` competency (direct probability, vocabulary, complement rule, simplification, percentage conversion, reverse reasoning) rather than six variations on the same skill. Prioritised educational quality over quantity, per the explicit requirement — this is a deliberately small, carefully-calibrated starting set, not an attempt to fully populate the competency in one pass.

**Recommended next step, not taken here:** once reviewed and approved, these become the first real content for `maths.probability` — closing `CURRICULUM_GAP_REGISTER.md` GAP-001 — via the same human-owned authoring/import process every other domain in this project has used (add to `data/maths.ts`, extend `QUESTION_AUTHORING_STANDARD.md` §11.2's competency table, then the separate hand-tagging/import step into `ali_question_bank`).
