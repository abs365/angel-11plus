# CSSE Maths Practice candidates: FINAL approval decision pack (2026-10-08)

**380 candidates, 38 blueprints in 6 prepared sets. Nothing has been submitted, approved or published.** You do not need to inspect any variant: each blueprint below carries a recommendation (APPROVE, TRIM, REVISE or REJECT) and its evidence. Regenerate any time with `npx tsx scripts/generate-csse-maths-final-decision-pack.mjs`.

## Verdict

- **Recommended publish set: 374 of 380** (37 blueprints APPROVE, 1 TRIM, 0 REVISE, 0 REJECT). The recommendation is unchanged by this final review: **374**.
- **Every one of the 380 prepared candidates re-verified from its own stored parameters** (not from a sample): question text and answer reproduced by the blueprint, difficulty label reproduced, stimulus reproduced exactly, independent second-route check passed where the blueprint declares one, stimulus accepted by its validator, the marker accepts the stated answer, no placeholder text: **380 of 380 pass, 0 failures**.
- **Duplicates:** 0 identical question-plus-stimulus pairs inside the 380; 0 exact matches against the 710 live Maths bank rows (2026-10-08, read-only).
- **Projected Practice inventory if you approve the recommended set:** 901 live + 374 = **1275** (Maths 587 to 961). If every prepared candidate were approved it would be 1281, which is **not** recommended.

- **Mock and Practice stay sealed from each other.** The first run found ONE exact match: the prepared coordinate-grid reflection stem was word-for-word the stem of the sealed Form B Mock item mock-fb-mr08-reflect-01. The Mock item is already in production (migration 272), so the PRACTICE stem was reworded instead ("The grid shows a point P and a dashed mirror line. Reflect P in the mirror line...") and the 8 grid-reflection candidates regenerated. Re-check of the new stem: 0 matches. A new test now fails if any Practice blueprint ever generates a sealed Form B question text (about 9,500 draws across all 38 blueprints).

## The six candidates NOT recommended, and why

All 6 come from **mr01-bp-change-from-note** (MR-01, mr01-whole-number-computation, Context / structure set): its question space is small (**276 distinct questions in 4,000 draws**, rated HIGHER), so 14 prepared variants would include near-duplicates of one skeleton ("change from a note"). 8 are recommended, balanced across difficulty and chosen to differ in context and answer; these 6 are held back (kept as prepared, not deleted, not submitted):

| Candidate | Difficulty | Question (abridged) | Answer |
|---|---|---|---|
| csse-ctx-mr01-bp-change-from-note-02 | medium | Leo buys 7 model kits that cost £2 each. They pay with a £20 note. How many pounds change do they get? | 6 |
| csse-ctx-mr01-bp-change-from-note-08 | medium | Sam buys 4 notebooks that cost £7 each. They pay with a £50 note. How many pounds change do they get? | 22 |
| csse-ctx-mr01-bp-change-from-note-09 | medium | Priya buys 4 packs of stickers that cost £6 each. They pay with a £50 note. How many pounds change do they get | 26 |
| csse-ctx-mr01-bp-change-from-note-11 | medium | Leo buys 8 model kits that cost £3 each. They pay with a £50 note. How many pounds change do they get? | 26 |
| csse-ctx-mr01-bp-change-from-note-13 | medium | Aisha buys 5 rulers that cost £2 each. They pay with a £20 note. How many pounds change do they get? | 10 |
| csse-ctx-mr01-bp-change-from-note-14 | medium | Leo buys 3 model kits that cost £6 each. They pay with a £20 note. How many pounds change do they get? | 2 |

## Disclosed diversity risk (never averaged across unrelated families)

Risk is the Question Factory's own scaled-memorisation rating (blueprint depth and dominant-blueprint share). It is shown **per family across everything prepared for it**, and for each prepared batch on its own, because a batch can look worse in isolation.

| Family | Prepared batch | Batch risk | Family risk (all prepared) | Blueprints | Note |
|---|---|---|---|---|---|
| mr05-factors-primes | Context / structure set | MEDIUM | MEDIUM | 4 |  |
| mr02-nth-term | Context / structure set | MEDIUM | MEDIUM | 3 |  |
| mr01-whole-number-computation | Context / structure set | MEDIUM | MEDIUM | 3 |  |
| mr01-data-table | Data-handling set | MEDIUM | MEDIUM | 4 |  |
| mr01-missing-operand | Breadth set | HIGH | HIGH | 2 |  |
| precision-dec | Breadth set | HIGH | MEDIUM | 3 |  |
| precision-dec | Number-line set | CRITICAL | MEDIUM | 3 | isolated rounding batch: CRITICAL on its own; judged with the other two rounding blueprints |
| mr01-measurement-conversion | Breadth set | HIGH | HIGH | 2 |  |
| mr04-elapsed-time | Breadth set | HIGH | HIGH | 2 |  |
| mr02-sequence-rule | Breadth set | HIGH | HIGH | 2 |  |
| mr01-average-mean | Breadth set | HIGH | HIGH | 2 |  |
| mr03-coordinate | Coordinate-grid set | LOW | LOW | 5 | grid set: LOW |
| mr03-angle-sum | Angle-figure set | MEDIUM | MEDIUM | 4 | angle figures: MEDIUM (4 blueprints) |
| mr01-scale-reading | Number-line set | HIGH | HIGH | 2 | number-line scale reading: HIGH, carried |

Required disclosures, unchanged: **coordinate grid LOW; angle figures MEDIUM; number-line scale-reading HIGH; the isolated rounding batch CRITICAL** unless considered with the broader rounding structures, which is how it is decided below. Other families keep the ratings in the table, including the HIGH ratings of the earlier context, data-handling and breadth batches that were already disclosed.

## Decision per blueprint

| Blueprint | Comp | Rep | Prepared | Publish | Re-verified | Representation | Distinct (4,000) | Batch risk | Decision | Evidence and conditions |
|---|---|---|---|---|---|---|---|---|---|---|
| mr05-bp-hcf-equal-groups | MR-05 | prose | 14 | 14 | 14/14 | text only | 1101 | MEDIUM | **APPROVE** | No concerns. |
| mr05-bp-lcm-repeating-events | MR-05 | prose | 14 | 14 | 14/14 | text only | 735 | MEDIUM | **APPROVE** | No concerns. |
| mr05-bp-smallest-common-multiple-above | MR-05 | prose | 14 | 14 | 14/14 | text only | 3370 | MEDIUM | **APPROVE** | No concerns. |
| mr05-bp-identify-the-prime | MR-05 | prose | 14 | 14 | 14/14 | text only | 3977 | MEDIUM | **APPROVE** | No concerns. |
| mr02-bp-pattern-in-context | MR-02 | prose | 14 | 14 | 14/14 | text only | 3171 | MEDIUM | **APPROVE** | No concerns. |
| mr02-bp-first-term-exceeding | MR-02 | prose | 14 | 14 | 14/14 | text only | 3576 | MEDIUM | **APPROVE** | No concerns. |
| mr02-bp-whole-periods-to-target | MR-02 | prose | 14 | 14 | 14/14 | text only | 3939 | MEDIUM | **APPROVE** | No concerns. |
| mr01-bp-containers-needed | MR-01 | prose | 14 | 14 | 14/14 | text only | 3611 | MEDIUM | **APPROVE** | No concerns. |
| mr01-bp-change-from-note | MR-01 | prose | 14 | 8 | 14/14 | text only | 276 | MEDIUM | **TRIM** | publish 8 of 14: only 276 distinct questions in 4,000 draws, so extra variants would be near-duplicates |
| mr01-bp-spend-then-share | MR-01 | prose | 14 | 14 | 14/14 | text only | 3974 | MEDIUM | **APPROVE** | No concerns. |
| mr01-bp-table-read-and-combine | MR-01 | table | 12 | 12 | 12/12 | 12/12 valid | 4000 | MEDIUM | **APPROVE** | No concerns. |
| mr01-bp-table-compare-column-totals | MR-01 | table | 12 | 12 | 12/12 | 12/12 valid | 4000 | MEDIUM | **APPROVE** | No concerns. |
| mr01-bp-bar-chart-read-difference | MR-01 | bar_chart | 12 | 12 | 12/12 | 12/12 valid | 4000 | MEDIUM | **APPROVE** | No concerns. |
| mr01-bp-bar-chart-mean | MR-01 | bar_chart | 12 | 12 | 12/12 | 12/12 valid | 3998 | MEDIUM | **APPROVE** | No concerns. |
| mr01-bp-think-of-a-number-two-step | MR-01 | prose | 8 | 8 | 8/8 | text only | 3845 | HIGH | **APPROVE** | No concerns. |
| mr01-bp-consecutive-numbers-from-sum | MR-01 | prose | 8 | 8 | 8/8 | text only | 1001 | HIGH | **APPROVE** | No concerns. |
| mr06-bp-round-decimal-places | MR-06 | prose | 8 | 8 | 8/8 | text only | 3945 | HIGH | **APPROVE** | No concerns. |
| mr06-bp-round-nearest-in-context | MR-06 | prose | 8 | 8 | 8/8 | text only | 3821 | HIGH | **APPROVE** | No concerns. |
| mr01-bp-compare-different-units | MR-01 | prose | 8 | 8 | 8/8 | text only | 3704 | HIGH | **APPROVE** | No concerns. |
| mr01-bp-convert-then-divide | MR-01 | prose | 8 | 8 | 8/8 | text only | 1660 | HIGH | **APPROVE** | No concerns. |
| mr04-bp-timetable-journey-time | MR-04 | table | 8 | 8 | 8/8 | 8/8 valid | 4000 | HIGH | **APPROVE** | No concerns. |
| mr04-bp-timetable-wait-for-next | MR-04 | table | 8 | 8 | 8/8 | 8/8 valid | 4000 | HIGH | **APPROVE** | No concerns. |
| mr02-bp-function-table-rule | MR-02 | table | 8 | 8 | 8/8 | 8/8 valid | 2463 | HIGH | **APPROVE** | No concerns. |
| mr02-bp-function-table-reverse | MR-02 | table | 8 | 8 | 8/8 | 8/8 valid | 2463 | HIGH | **APPROVE** | No concerns. |
| mr01-bp-mean-from-table | MR-01 | table | 8 | 8 | 8/8 | 8/8 valid | 4000 | HIGH | **APPROVE** | No concerns. |
| mr01-bp-mean-missing-value-table | MR-01 | table | 8 | 8 | 8/8 | 8/8 valid | 4000 | HIGH | **APPROVE** | No concerns. |
| mr03-bp-grid-read-point | MR-03 | coordinate_grid | 8 | 8 | 8/8 + independent route | 8/8 valid | 4000 | LOW | **APPROVE** | No concerns. |
| mr03-bp-grid-reflect-in-mirror-line | MR-03 | coordinate_grid | 8 | 8 | 8/8 + independent route | 8/8 valid | 1218 | LOW | **APPROVE** | No concerns. |
| mr03-bp-grid-translate-point | MR-03 | coordinate_grid | 8 | 8 | 8/8 + independent route | 8/8 valid | 3847 | LOW | **APPROVE** | No concerns. |
| mr03-bp-grid-fourth-vertex | MR-03 | coordinate_grid | 8 | 8 | 8/8 + independent route | 8/8 valid | 3916 | LOW | **APPROVE** | No concerns. |
| mr03-bp-grid-midpoint-of-segment | MR-03 | coordinate_grid | 8 | 8 | 8/8 + independent route | 8/8 valid | 3666 | LOW | **APPROVE** | No concerns. |
| mr03-bp-fig-triangle-find-x | MR-03 | angle_figure | 8 | 8 | 8/8 + independent route | 8/8 valid | 3687 | MEDIUM | **APPROVE** | No concerns. |
| mr03-bp-fig-straight-line-find-x | MR-03 | angle_figure | 8 | 8 | 8/8 + independent route | 8/8 valid | 2132 | MEDIUM | **APPROVE** | No concerns. |
| mr03-bp-fig-around-point-find-x | MR-03 | angle_figure | 8 | 8 | 8/8 + independent route | 8/8 valid | 3978 | MEDIUM | **APPROVE** | No concerns. |
| mr03-bp-fig-isosceles-find-base | MR-03 | angle_figure | 8 | 8 | 8/8 + independent route | 8/8 valid | 180 | MEDIUM | **APPROVE** | at its cap: only 180 distinct questions in 4,000 draws, so no more can honestly be prepared |
| mr01-bp-numberline-read-value | MR-01 | number_line | 8 | 8 | 8/8 + independent route | 8/8 valid | 3706 | HIGH | **APPROVE** | Family risk HIGH (2 blueprints). No broader structure exists to dilute it, so the risk is carried, not averaged away; do not add more scale-reading volume until a third structure exists. |
| mr01-bp-numberline-difference | MR-01 | number_line | 8 | 8 | 8/8 + independent route | 8/8 valid | 3878 | HIGH | **APPROVE** | Family risk HIGH (2 blueprints). No broader structure exists to dilute it, so the risk is carried, not averaged away; do not add more scale-reading volume until a third structure exists. |
| mr06-bp-numberline-read-then-round | MR-06 | number_line | 8 | 8 | 8/8 + independent route | 8/8 valid | 3456 | CRITICAL | **APPROVE** | The isolated number-line rounding batch is rated CRITICAL (one blueprint). Judged with the family's three prepared rounding structures it is MEDIUM (3 blueprints, largest share 33%). APPROVE only together with the two breadth rounding blueprints (mr06-bp-round-decimal-places, mr06-bp-round-nearest-in-context). |

**Decision words.** APPROVE: publish the prepared volume. TRIM: publish only the stated number. REVISE: amend the blueprint and regenerate (none is recommended). REJECT: do not publish (none is recommended).

## Edge and failure review (what could go wrong, and what was checked)

- **Answers:** every stored answer is regenerated from its parameters by the blueprint and, for 14 blueprints (all grid, angle-figure and number-line blueprints, and the earlier independent-check families), also by a second, differently written route. Zero mismatches.
- **Representations:** every table, bar chart, grid, angle figure and number line is regenerated from its parameters and compared exactly, then accepted by its fail-closed validator; the question text carries none of the values the child must read; semantic wording is audited by `csseStimulusSemanticAudit.test.ts`.
- **Marking:** each stated answer is accepted by the real Practice marker. Coordinate answers are marked by the governed coordinate normaliser (spacing irrelevant, brackets and both numbers required).
- **Smallest and largest answers and the three difficulty bands** appear in the representative samples of `ANGEL_CSSE_MATHS_BLUEPRINT_APPROVAL_PACK.md` (and its HTML, with the real renderings).
- **Known limits (disclosed, not hidden):** the grid and number-line tasks need sight (their text description names what is drawn, not the answer); isolated families carry the risks above; an unusually rare parameter combination can still be generated later, which is why volume stays capped where the space is small.

## What publication would do (not done)

The publication package is in `scripts/output/csse-practice-publication-package/` with the runbook `ANGEL_CSSE_MATHS_PRACTICE_PUBLICATION_RUNBOOK.md`. It contains only the 374 recommended candidates. **Nothing is published without your authorisation.**
