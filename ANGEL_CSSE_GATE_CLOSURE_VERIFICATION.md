# ANGEL 11+ — CSSE GATE CLOSURE: POST-MIGRATION PRODUCTION VERIFICATION (2026-10-08)

Method: **read-only** queries against production (Supabase project `agxunwcdatosrmzhhuxj`), comparing the actual AFTER state with the intended migration
(`supabase/migrations/271_…_APPLIED_DO_NOT_RERUN.sql`, `272_…_APPLIED_DO_NOT_RERUN.sql`) and with the original source JSON of every untouched row
(row-by-row hash comparison of the stored `prompt`). Nothing was written, repaired, rerun or applied.

## MIGRATION 271: PRODUCTION VERIFICATION: PASS

**MIGRATION 271 APPLIED: DO NOT RERUN.**

| Check | Result |
|---|---|
| Anning Q3-Q6 on the manual-marking path | `validationTier` is `TIER5_NAMED_COMPONENT_PLUS_EXPLANATION`, `markerNote` present, marks unchanged (1, 1, 2, 3) |
| Group Project Q3-Q6 on the manual-marking path | same, marks unchanged (2, 2, 2, 3) |
| Production routes TIER5 to a human | `mock_persist_reading_scoring` is live and forces `requires_manual_marking` for TIER3/TIER5 (function source read) |
| No longer accepted-answer sets | confirmed; the old lists remain only as marker prompts (10, 12, 13, 12 and 12, 9, 10, 9 entries). Retrieval items Q1-Q2 of both passages stay TIER2 |
| The failure the repair fixes | a correct explanation in other words scored 0 under the old contract and is now sent to a marker |
| Compass Rose Q5 | question now reads "…the order the passage describes what each of them did on their own."; no "first investigating"; ordered answer unchanged |
| Compass Rose Q2(a)/(b) | accepted sets are exactly the original entries plus the intended additions (5 and 7), nothing else; "the weathervane" and "the church tower" score full marks through the real marker |
| Six top-up items present | `eng-fb-compassrosechallenge-q08..q12`, `eng-fb-salmonnavigation-q08`: `authentic_assessment_candidate`, `csse`, correct passage text, tiers and marks as designed |
| Only the intended keys changed | for all 11 modified rows, the stored `prompt` equals the original except exactly the intended keys; 8 rows carry `markerNote`, no other row in the bank does |
| No unrelated English content changed | 29 other Compass, Salmon, Pepper, Anning and Group Project rows: stored `prompt` identical to source (hash match, 29 of 29) |
| No Practice content affected | active counts unchanged: English practice_eligible 306, Maths 587, Writing 8 |
| Nothing activated | mock_eligible unchanged (English 50, Maths 77, Writing 2); English candidates 40 to 46 (+6, the new items); no Mock form, exposure list or attempt references any new id |
| Permissions and governance | RLS enabled on `ali_question_bank`, its single policy present, no `anon` or `authenticated` table grants; the migration touched no policy, function or grant |

### Observations on the marking of Compass Rose (existing behaviour, not migration discrepancies; nothing repaired)

1. **A wrong answer is accepted at Q2(b).** "the sundial" and "the stone sundial" score full marks, and did **before** the migration too: the marker accepts a run of two or more whole words taken from
   inside an accepted answer, and the original list already contained "the sundial's bell-shaped weathervane" and "…above the stone sundial". Casey read the clue's **stone** as the sundial and the **bell**
   as the weathervane, so "the sundial" is wrong. 271 neither caused nor fixed this.
2. **271 adds one new leniency.** A hedged answer such as "the weathervane or the sundial" was rejected before and is accepted now, because "the weathervane" is now a listed answer and an answer that merely
   contains a listed answer is accepted. This is how the tier behaves for every item.
3. **A correction to my earlier review.** I reported that "the weathervane" was being rejected before 271. That was wrong: it was already accepted by the shortening rule. The additions were not needed for it,
   but they are harmless. A single word on its own ("weathervane") is still rejected, before and after.
4. **Ordered-list items need one item per line.** "Elif, Casey, Wei, Grace" typed on one line scores 1 of 4; the same order on four lines scores 4 of 4. The question text does not say to use separate lines.
   This is existing behaviour for every ordered-list item (Compass Q5, Salmon Q5, the bee passage).

These four points are in the English validator pack so the human validator can judge them. Decision for the Founder: leave as is and have the validator decide, or authorise a governed amendment later.

## MIGRATION 272: PRODUCTION VERIFICATION: PASS

**MIGRATION 272 APPLIED: DO NOT RERUN.**

| Check | Result |
|---|---|
| `mock-mr05-numberpyramid-02` | stored answer is now `(9, 5)`; every other key of the item identical to source |
| Intended learner format accepted | "(9, 5)" is an exact match in the Mock scorer (`mock_score_attempt`: numeric compare, otherwise exact text with capitals and outer spaces ignored) and in the Practice marker |
| Does not require the malformed stored form | the old `9, 5` is no longer the stored value |
| Answer semantics preserved | smallest bottom-row value 9 and 5 rows (144 = 9 × 2⁴), re-derived independently |
| No unrelated Maths protected item changed | of the other 31 existing items, 21 are byte-identical to source; the remaining 10 differ **only in `marks`** (value 1), which is the effect of the earlier marking-integrity remediation (migrations 117/118), not of 272 (all 10 are in those migrations, the hash matches once `marks` is ignored, and 272's only UPDATE is guarded by the one id) |
| 24 new items present | `mock-fb-…`, `authentic_assessment_candidate`, `csse`, answers, tiers, families and the three figure URLs as designed; Maths candidates 13 to 37 (+24) |
| No Practice content affected | Maths practice_eligible 587 unchanged |
| Nothing activated | mock_eligible unchanged (Maths 77); no Mock form, exposure list or attempt references a new id |
| Permissions and governance | as for 271 |

### Observation on the Mock scorer (existing platform behaviour, not a migration discrepancy; nothing repaired)

"Legitimate formatting is accepted" holds for the **Practice** marker, which tolerates spacing, a pound sign and trailing zeros. The **Mock** scorer is stricter: it reads a numeric answer as a number
(so 2.10 equals 2.1) and otherwise compares exact text. So in a Mock a bracketed answer must be typed exactly `(9, 5)` with one space (`(9,5)` is marked wrong), a time exactly `hh:mm`, and a pound sign or
unit makes a numeric answer wrong. This applies equally to the live rotation items and to the new coordinate item. Neither the question text nor the client normalises it (the client only trims). Each
Maths item's validator card states the exact form the child must type, so the human validator can judge it. Options for a later governed decision: accept the current contract and make question wording
explicit, or normalise in the scorer. Not changed.

## Corrections made to the repository as a result

- Both migration files renamed `…_APPLIED_DO_NOT_RERUN.sql` with an applied banner; the two generators now write comparison copies under `scripts/output/form-b-applied-sources/` and can no longer overwrite them.
- `ANGEL_CSSE_MATHS_FORM_B_COMPLETION.md` corrected where it implied the Mock scorer tolerates spacing and pound signs.
- Writing calibration: the proposed thresholds are withdrawn (none are set before evidence exists), every reader disagreement is queued for adjudication, and individual judgements are preserved.
