# Angel 11+ — Educational Increment 007I — Mathematics Review Readiness and Controlled Review Batch 3 Selection

**Prepared:** 007I, 2026-08-14. Reconciles the full remaining provisional Mathematics corpus fresh from production, independently re-verifies every registered family's mathematics from first principles, audits family coherence, and selects a bounded Batch 3 from families that pass both.

---

## Part 1 — Remaining Mathematics corpus, reconciled fresh

Production re-queried this session (`scripts/007i-maths-answer-verification.mjs` and companion queries), not reused from 007H's report.

**Provisional Mathematics total: 72 questions**, split:

- **A. 16 registered families, 67 questions.** Every family already has an `ali_family_review` target registered (migration 053) but no review pack until this increment. All 67 rows: `active = true`, `provenance = angel_original`, `content_version = 1` — no anomaly on any of these fields.
- **B. 5 ungrouped questions, no `family_id`** (`mth-003`, `mth-004`, `mth-005`, `mth-006`, `mth-007b`). A genuine, distinct anomaly found this session: all 5 have `provenance = null` (not `angel_original`) and no `addresses_misconception` value — legacy rows that predate both columns. Migration 053 explicitly declined to invent a placeholder family for these, and this session confirms why that caution was correct: they aren't just family-less, they're missing two other governance fields a family-level review would expect to see. Not touched this increment; still need a genuine content-classification decision before they can enter any review queue.
- **C. Anomalies:** the provenance/misconception gap above (bucket B) is the only one found. No inactive rows, no `content_version` drift, no duplicate IDs among the 67.

---

## Part 2 — `wave1-fam-tick-justify` discrepancy: resolved

**Root cause: documentation defect, not missing content.** `scripts/generate-english-wave1.mjs` shows `wave1-fam-tick-justify` was only ever authored for 5 of Wave 1's 6 passages (`kitemaker`, `lastbus`, `newgirl`, `atticdoor`, `letter`) — `w1-raceday-04` exists in production but belongs to `wave1-fam-two-character`, not `tick-justify`. This was a deliberate, already-disclosed 007B/007C authoring decision: Race Day was "the one passage purpose-built with two contrasting characters" (`ENGLISH_WAVE1_REVIEW_PACKS_V1.md`), so its 4th slot went to `two-character` instead. `ENGLISH_WAVE2_REVIEW_PACKS_V1.md`'s own "Family coverage" table already shows `two-character`'s Wave 1 count as 1 (not 2), correctly reflecting this trade-off — `tick-justify`'s Wave 1 count simply wasn't updated to match at the time, staying at the generic 6 every other Wave 1 family has.

**Correction applied:** `ENGLISH_WAVE2_REVIEW_PACKS_V1.md` and `ANGEL_007D_REVIEW_BACKLOG_V1.md` corrected to record 5 (not 6) Wave 1 instances, 11 (not 12) total. **No production correction needed or made** — the live 11 was always correct.

---

## Part 3 — Independent mathematical answer verification: 67/67 PASS, 0 defects

Every one of the 67 registered-family questions was independently recomputed from first principles (`scripts/007i-maths-answer-verification.mjs`) — not merely compared to the stored answer field, but re-derived from the question's own stated numbers using a from-scratch implementation of each family's arithmetic (means, table lookups, unit conversion, equation-solving, ratio splits, arithmetic-sequence formulas, angle-sum reasoning, coordinate transforms, area/perimeter, unit-price comparison, compound percentage change, time addition, proportional scaling, LCM-bounded search, factor counting, primality testing).

**Result: 72/72 checks pass across all 16 families.** (72, not 67, because `mr02-nth-term` gets an additional structural check per question confirming the sequence is genuinely arithmetic — a constant difference — before its nth-term formula is trusted.)

72 checks did not pass cleanly on the first run — but every one of the 9 initial failures was traced to a bug in this session's own verification script (a day-name/table-key mismatch, an inclusive-range-vs-named-pair confusion, a regex that couldn't capture a two-word multiplier like "four times", and a `Number()` vs `parseFloat()` truncation on a trailing-period artefact from greedy regex capture), not a defect in the questions themselves. Each was fixed and the affected checks re-run individually before being counted as PASS, disclosed here rather than silently corrected.

**No mathematical defect, unit error, rounding error, or answer ambiguity was found anywhere in the 67-question registered-family corpus.** No question in `mr04-best-value` produces a tie between options A and B (checked explicitly). `mr05-constrained-multiple`'s uniqueness (exactly one qualifying multiple per question) was confirmed by the same exhaustive-search style already established for `mr04-mixed-divisibility` in Batch 2.

---

## Part 4 — Family coherence audit: 16/16 PASS

All 16 registered families pass. For each: a single, consistent competency/skill code; a documented structural signature and real CSSE evidence citation in `explanation`; 100% populated, question-specific `addresses_misconception` (not a shared template); an answer method independently confirmed consistent across every sibling (Part 3); siblings that vary meaningfully (changed quantities require genuine recalculation, not memorised recall); and several families with real *structural* sub-variety beyond changed numbers alone — `mr01-missing-operand` varies all four arithmetic operations across its 4 siblings, `mr03-angle-ratio` mixes "on a straight line" (180°) and "around a point" (360°) reasoning, `mr03-coordinate` mixes reflection-in-x, reflection-in-y, and translation, `mr05-constrained-multiple` mixes "smallest greater than" and "largest less than", and `mr05-factors-primes` mixes factor-counting and primality-testing.

**No family is a cosmetic variant.** No family is flagged for exclusion on coherence grounds.

**One uniform weakness found across all 16, disclosed in full in Part 6/7 below:** every one of the 67 questions is `content_difficulty = medium` — there is no `easy` or `hard`/`challenge` variant anywhere in the remaining Mathematics corpus. This is a real, project-wide gap in this batch of content, not specific to any one family, and is not a reason to defer any family (007H's own `mr04-far-percent`/`mr04-mixed-divisibility` already had, and were reviewed and approved with, the same disclosed gap).

---

## Part 6 — Teaching evidence audit (content correctness vs. teaching-support maturity, kept distinct)

| Family | Content correctness | Review pack | Teaching support | Guided Practice |
|---|---|---|---|---|
| All 16 families | **READY** (Part 3) | **READY** (this document) | **MINIMAL** — post-answer `workingSteps` explanation only, no live MODEL walkthrough, no exam-strategy tip | **NOT IMPLEMENTED** — confirmed project-wide in 007H, unchanged |

Per your explicit instruction: Guided Practice is **not** a requirement for entering human content review — 007H's precedent (Decision 53) already established that Mathematics content approval and Mathematics teaching-support maturity are recorded as two separate facts, and that principle carries forward unchanged here. Mathematics teaching maturity is **not** described as complete anywhere in this document.

---

## Part 7 — Difficulty and variation audit

- **All 16 families: medium-only difficulty.** No easy entry point and no hard/transfer-stretch variant exists anywhere in the remaining corpus. This is the single largest content-maturity gap in Mathematics right now — worth naming as a future authoring priority, **not** filled by writing new questions in this increment.
- **4 families have only 3 siblings** (the minimum family size established elsewhere in this project): `mr02-far-ratio-context`, `mr03-coordinate`, `mr03-mixed-perimeter`, `mr05-constrained-multiple`. All 4 still pass coherence (Part 4) — 3 well-varied siblings is a real, if thin, family — but they are the families most likely to feel repetitive first under sustained weekly practice.
- **No family has genuine far-transfer stretch beyond its assigned `transfer_class`.** Transfer classification is consistent and honestly assigned per family, but (as in Batch 2) does not vary *within* a family — every sibling in a given family carries the same transfer label.

No new questions were authored to address any of the above, per your explicit instruction.

---

## Part 8 — Anti-memorisation readiness

Assessed per family against whether repeated practice requires genuine reasoning/recalculation vs. pattern-memorisation:

**All 16 families require genuine recalculation** — every sibling changes the underlying numbers, and a learner who simply remembers a previous answer cannot succeed on a different sibling. Beyond that baseline, 5 families additionally vary the *structure* a learner must recognise, not just the numbers (see Part 4's list: `missing-operand`, `angle-ratio`, `coordinate`, `constrained-multiple`, `factors-primes`) — these are the strongest anti-memorisation performers in the remaining corpus. `mr04-best-value`'s 5 siblings split 3×"A wins"/2×"B wins", confirmed not biased toward a single guessable letter.

**No family is flagged as unsuitable for activation at its current depth on anti-memorisation grounds.**

---

## Part 9 — Controlled Review Batch 3 candidate selection

Current Practice Eligible Mathematics skill breadth was queried fresh (not assumed) to prioritise by real supply gap, exactly as Batch 2's selection did for English:

**Two skills have zero Practice Eligible supply at all:** `QT-MR-02` (missing operand/reverse reasoning) and `QT-MR-08` (coordinate/transformation reasoning).
**Four skills have exactly one Practice Eligible question, a legacy singleton with no real family behind it:** `QT-MR-03` (measurement conversion), `QT-MR-09` (data-table interpretation), `QT-MR-10` (elapsed time), `QT-MR-12` (mean/average) — the same "technically covered, actually one repeated item" problem Batch 2 found and fixed for English `QT-RC-01`/`QT-RC-08`.
**One skill (`QT-MR-05`, sequences) has 10 Practice Eligible questions but from a single family** (`mr02-sequence-rule`) — a one-family monopoly of exactly the kind Batch 2 broke for `QT-MR-07` with `mr03-classify`.

**Selected: 7 families, 30 questions.**

| # | Family ID | Human-readable name | Competency | QT | Questions | Current PE supply for this skill | Difficulty | Transfer | Teaching support | Reason for inclusion |
|---|---|---|---|---|---|---|---|---|---|---|
| 1 | `mr01-missing-operand` | Missing Operand (Reverse Reasoning) | MR-01 | QT-MR-02 | 4 | **0** | medium | ROUTINE | MINIMAL, no Guided Practice | Closes a complete zero-supply skill; genuinely varies all 4 arithmetic operations |
| 2 | `mr03-coordinate` | Coordinate Transformations | MR-03 | QT-MR-08 | 3 | **0** | medium | ROUTINE | MINIMAL, no Guided Practice | Closes a complete zero-supply skill; mixes reflection (both axes) and translation |
| 3 | `mr01-measurement-conversion` | Measurement Conversion | MR-01 | QT-MR-03 | 4 | 1 (legacy singleton) | medium | ROUTINE | MINIMAL, no Guided Practice | Takes a near-zero skill from 1 repeated question to 5 real questions |
| 4 | `mr01-data-table` | Reading and Interpreting Data Tables | MR-01/MR-04 | QT-MR-09 | 5 | 1 (legacy singleton) | medium | NEAR_TRANSFER | MINIMAL, no Guided Practice | Takes a near-zero skill from 1 to 6; genuinely varies the operation asked (sum, difference, range) per sibling |
| 5 | `mr04-elapsed-time` | Multi-Step Elapsed Time | MR-04/MR-01 | QT-MR-10 | 5 | 1 (legacy singleton) | medium | MIXED_TRANSFER | MINIMAL, no Guided Practice | Takes a near-zero skill from 1 to 6 |
| 6 | `mr01-average-mean` | Calculating the Mean | MR-01 | QT-MR-12 | 4 | 1 (legacy singleton) | medium | ROUTINE | MINIMAL, no Guided Practice | Takes a near-zero skill from 1 to 5 |
| 7 | `mr02-nth-term` | Pattern Inference and the nth Term | MR-02 | QT-MR-05 | 5 | 10 (single-family monopoly) | medium | FAR_TRANSFER | MINIMAL, no Guided Practice | Breaks a one-family monopoly (`mr02-sequence-rule`); includes a genuinely descending sequence, not just ascending ones |

**Totals: 7 families, 30 questions, all Mathematics.**

### Explicitly deferred families and why

| Family | Deferred because |
|---|---|
| `mr02-far-ratio-context` (3q, MR-06) | `QT-MR-06` already has 9 Practice Eligible questions across 3 sources after Batch 2 — real but lower marginal benefit than the zero/near-zero skills above |
| `mr02-sum-difference` (5q, MR-06) | Same reason — `QT-MR-06` not a supply-gap skill |
| `mr03-angle-ratio` (5q, MR-07) | `QT-MR-07` already has 12 Practice Eligible questions across 2 real families (`mr03-classify` from Batch 2, `mr03-angle-sum`) — healthiest skill in the remaining corpus |
| `mr03-mixed-perimeter` (3q, MR-07) | Same reason |
| `mr04-best-value` (5q, MR-13) | `QT-MR-13` was already closed from zero by Batch 2's `mr04-mixed-divisibility` — this would add depth, not close a gap |
| `mr04-compound-percentage` (5q, MR-04) | `QT-MR-04` already has 8 Practice Eligible questions across 2 families after Batch 2 |
| `mr04-far-recipe` (3q, MR-04) | Same reason |
| `mr05-constrained-multiple` (3q, MR-11) | `QT-MR-11` already has 8 Practice Eligible questions across 3 sources |
| `mr05-factors-primes` (5q, MR-11) | Same reason |

None of the 9 deferred families failed Parts 3 or 4 — every one is mathematically verified correct and structurally coherent, and every one remains a strong candidate for a future Batch 4. They are deferred purely on supply-gap priority, per your explicit "do not select all remaining families" instruction.

---

## Part 5 (review-pack content) — per selected family

All 6 required fields (A–F) below; representative/easiest/hardest/boundary examples are drawn from live production data pulled this session.

### 1. Missing Operand (Reverse Reasoning) — `mr01-missing-operand`
**A. What this teaches:** Finding an unknown number in a simple equation by using the inverse operation, when the unknown can appear in any position (not just "solve for x at the end").
**B. Why it belongs in Angel 11+:** **DIRECTLY EVIDENCED** — CSSE-006 Q2(b)(c)(d) (2023) and CSSE-016 Q2(c)(d)/Q3(a)(b) (2021), both read directly.
**C. How Angel teaches it:** MINIMAL — no MODEL walkthrough or exam-strategy tip exists for Mathematics; the `workingSteps` array is shown as a step-by-step explanation after the learner answers. **Dedicated Guided Practice is not yet implemented for this Mathematics family.**
**D. Questions:** Representative: `mr01-mop-01` (▢ × 7 = 84). All 4 siblings are `medium`; no easy or hard variant exists (disclosed). Structural variety: multiplication, division, subtraction, and addition are each represented once (`mop-01`–`mop-04`).
**E. Automated validation:** All 4 rows independently re-solved from the stated equation and matched exactly (Part 3). `active`/`provenance`/`content_version` all clean (Part 1).
**F. Reviewer judgement:** standard canonical criteria, `/admin-beta/review`.

### 2. Coordinate Transformations — `mr03-coordinate`
**A. What this teaches:** Applying a single geometric transformation (reflection in the x-axis, reflection in the y-axis, or translation) to a coordinate pair.
**B. Why it belongs in Angel 11+:** **DIRECTLY EVIDENCED** — AEP-004 QT-MR-08 (Coordinate/Transformation Reasoning), CSSE Multi-Year Pattern Analysis.
**C. How Angel teaches it:** MINIMAL, as above. **Dedicated Guided Practice is not yet implemented for this Mathematics family.**
**D. Questions:** Representative: `mr03-coord-01` (reflect (3,5) in the x-axis → (3,-5)). All 3 `medium`; no easy/hard variant (disclosed, and this family has only 3 siblings total — the thinnest of the 7 selected). Boundary/unusual: `mr03-coord-03` is the only translation (not a reflection), genuinely different from the other two.
**E. Automated validation:** all 3 independently re-transformed and matched exactly.
**F. Reviewer judgement:** standard canonical criteria.

### 3. Measurement Conversion — `mr01-measurement-conversion`
**A. What this teaches:** Converting two measurements to a common unit before combining them (m/cm, kg/g, l/ml).
**B. Why it belongs in Angel 11+:** **DIRECTLY EVIDENCED** — CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-03 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.
**C. How Angel teaches it:** MINIMAL, as above.
**D. Questions:** Representative: `mr01-conv-01` (3.4m + 85cm = 4.25m). All 4 `medium`; no easy/hard variant (disclosed). Genuinely varies which unit pair is used (m/cm, kg/g, l/ml) across siblings.
**E. Automated validation:** all 4 independently re-converted and summed, matched exactly.
**F. Reviewer judgement:** standard canonical criteria.

### 4. Reading and Interpreting Data Tables — `mr01-data-table`
**A. What this teaches:** Reading values from a small labelled table and applying the specific operation the question actually asks for (a targeted sum, a difference, or the range) — not just reading off one number.
**B. Why it belongs in Angel 11+:** **DIRECTLY EVIDENCED** — CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-09 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.
**C. How Angel teaches it:** MINIMAL, as above.
**D. Questions:** Representative: `mr01-data-03` (books read, sum of two named children). All 5 `medium`; no easy/hard variant (disclosed). Genuine structural variety: 2 questions ask for a sum, 2 ask for a difference, 1 asks for the range — not the same operation repeated on different tables.
**E. Automated validation:** all 5 independently re-derived from the stated table and operation, matched exactly.
**F. Reviewer judgement:** standard canonical criteria.

### 5. Multi-Step Elapsed Time — `mr04-elapsed-time`
**A. What this teaches:** Adding several sequential durations (activity, break, activity...) onto a start time, carrying minutes into hours correctly.
**B. Why it belongs in Angel 11+:** **DIRECTLY EVIDENCED** — CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-10 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.
**C. How Angel teaches it:** MINIMAL, as above.
**D. Questions:** Representative: `mr04-time-01` (football match, 3 stages). All 5 `medium`; no easy/hard variant (disclosed). Hardest/most unusual: `mr04-time-03`, the only sibling whose durations include an "hour(s) + minutes" combined format ("1 hour 35 minutes") rather than pure-minutes durations.
**E. Automated validation:** all 5 independently re-summed onto the stated start time, matched exactly.
**F. Reviewer judgement:** standard canonical criteria.

### 6. Calculating the Mean — `mr01-average-mean`
**A. What this teaches:** Computing the mean (average) of a small set of values and dividing by the correct count.
**B. Why it belongs in Angel 11+:** **DIRECTLY EVIDENCED** — CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-12 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.
**C. How Angel teaches it:** MINIMAL, as above.
**D. Questions:** Representative: `mr01-mean-01` (4 game scores). All 4 `medium`; no easy/hard variant (disclosed). Set sizes vary (4 or 5 values) across siblings, a small but genuine structural difference.
**E. Automated validation:** all 4 independently re-averaged, matched exactly.
**F. Reviewer judgement:** standard canonical criteria.

### 7. Pattern Inference and the nth Term — `mr02-nth-term`
**A. What this teaches:** Inferring the rule behind a number sequence and using it to find a term far beyond what's shown, without listing every term up to it.
**B. Why it belongs in Angel 11+:** **DIRECTLY EVIDENCED** — CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-05 (Obs. 11): CSSE-006, CSSE-011, CSSE-016.
**C. How Angel teaches it:** MINIMAL, as above.
**D. Questions:** Representative: `mr02-nth-01` (4, 9, 14, ... 10th term). All 5 `medium`; no easy/hard variant (disclosed). Genuinely unusual/boundary sibling: `mr02-nth-04` is the only descending sequence (100, 93, 86, ...), which cannot be solved by a learner who only knows how to handle "add each time" patterns.
**E. Automated validation:** all 5 independently re-derived (first confirming each sequence is genuinely arithmetic — a constant difference — then applying the nth-term formula), matched exactly.
**F. Reviewer judgement:** standard canonical criteria.

**Conclusion: review-pack readiness MET for all 7 selected targets.**
