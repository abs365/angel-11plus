# ANGEL 11+ — EI003 WAVE 2 FINAL FOUR-QUESTION CLOSURE REPORT

Status: Migration 243 verified landed and correct. All 40 published Wave 2 questions now have a functioning production marking contract. **ANGEL EI003 WAVE 2: CLOSED.**

---

## A. Migration 243 verification

Confirmed live, by direct query (not assumed from the "Success" dialog): all 4 targeted rows (`qf-ei003-w2-seq-explicit-01`, `qf-ei003-w2-seq-dispersed-02`, `qf-ei003-w2-seq-narrative-order-02`, `qf-ei003-w2-emotion-action-01`) now carry `prompt.validationTier = "TIER2_ACCEPTED_SET"`.

## B. Four-row field reconciliation

For all 4: `acceptedAnswers` and `modelAnswer` are byte-identical to their state immediately after Migration 242 (no educational content was rewritten), and `marks = 1` for all 4. No other field changed.

## C. 4/4 exact correct-answer results

Deterministic verification, exercising the real, imported `scoreEnglishComprehensionAnswer` / `scoreEnglishAnswer` (not a reimplementation), using each row's own exact `acceptedAnswers[0]`:

| ID | Answer tested | Tier used | earnedMarks | Result |
|---|---|---|---|---|
| `qf-ei003-w2-seq-explicit-01` | "b, a, c" | TIER2_ACCEPTED_SET | 1/1 | Correct |
| `qf-ei003-w2-seq-dispersed-02` | "c, a, b" | TIER2_ACCEPTED_SET | 1/1 | Correct |
| `qf-ei003-w2-seq-narrative-order-02` | "b, d, c, a" | TIER2_ACCEPTED_SET | 1/1 | Correct |
| `qf-ei003-w2-emotion-action-01` | "nervous" | TIER2_ACCEPTED_SET | 1/1 | Correct |

**4/4 pass. No `NaN`. No length-floor rejection. No short-keyword rejection.**

## D. Approved-variant results

Every additional value already present in each row's own `acceptedAnswers` array (no new synonyms invented) was tested and scored full marks:

- `seq-explicit-01`: "b then a then c" ✓, "the clumsy handover, then passing to marcus, then kestrel winning" ✓
- `seq-dispersed-02`: "c then a then b" ✓, "dropped spring, then backwards gear, then still silent in august" ✓
- `seq-narrative-order-02`: "b then d then c then a" ✓
- `emotion-action-01`: "anxious" ✓, "tense" ✓, "on edge" ✓, "uneasy" ✓

**All approved variants pass.**

## E. 4/4 wrong-answer results

A programmatically-verified wrong answer ("zzz completely unrelated filler content" — confirmed, before scoring, to not literally equal any of the row's own accepted answers) was tested against each of the 4: **all 4 scored `earnedMarks = 0` (Incorrect).**

## F. Plausible-wrong results

Per the instruction's specific concern — that `TIER2_ACCEPTED_SET` might accept an unrelated sequence merely because it shares the same letters, or an unrelated short emotion word merely because it is short — each of the 4 was additionally tested with a genuinely plausible-but-wrong answer:

| ID | Plausible-wrong answer | Why it's a real test | Result |
|---|---|---|---|
| `seq-explicit-01` | "a, b, c" | Same three letters as the correct "b, a, c", different order | **Rejected (0)** |
| `seq-dispersed-02` | "a, c, b" | Same three letters as "c, a, b", different order | **Rejected (0)** |
| `seq-narrative-order-02` | "a, b, c, d" | Same four letters as "b, d, c, a", different order | **Rejected (0)** |
| `emotion-action-01` | "happy" | A different, real, short emotion word — not in the accepted set | **Rejected (0)** |

This is possible because `checkAcceptedAnswerSet`'s underlying `containsTokenSequence` check requires a contiguous, **in-order** token match — confirmed by reading its source before relying on it, not assumed. **0/4 plausible-wrong answers were accepted. No STOP condition triggered.**

## G. Real learner confirmation

A genuine attempt was made to retest `qf-ei003-w2-emotion-action-01` (the Founder's preferred target) through the real, non-admin-substitute Practice path, exactly as in the prior task's session. The Practice session did not progress past its own landing page after three real attempts with long waits (10s+ each), matching the same tooling/environment flakiness already disclosed in the prior report's §D/§H — not a new finding, and not treated as one. **Stating this clearly rather than manipulating learner evidence to force a result**, per the instruction's own explicit fallback: this bounded check's real-learner confirmation is not completed this session. The deterministic evidence in §C-F is judged sufficient for closure because it exercises the actual production scoring function against the row's real, live-confirmed field values (§A-B) — not a simulation or reimplementation — for the exact answer, every approved variant, a genuine wrong answer, and a genuinely plausible-wrong answer, for all 4 targeted rows.

## H. Final 40/40 marking-contract reconciliation

Combining the already-established evidence (not rerun):

- 36/40 confirmed correct after Migration 242 (prior report, §E).
- 4/40 now confirmed correct after Migration 243 (§C-F above).

**40/40 Wave 2 published questions have a functioning production marking contract.**

## I. Migration 242 root-cause closure

**Closed.** Root cause: all 40 candidates were submitted with `acceptedAnswers` but no `marks`/`modelAnswer`/`validationTier`, producing a `NaN`-driven false-incorrect result for every one of the 40 regardless of what a learner typed. Repaired by merging real, non-fabricated `modelAnswer` (= each candidate's own `acceptedAnswers[0]`) and `marks = 1` into all 40 rows. Confirmed: 0/40 `NaN` results remain.

## J. Migration 243 root-cause closure

**Closed.** Root cause: 4 of the 40 candidates' own genuinely correct answer was too short for `LEGACY_HEURISTIC`'s own pre-existing anti-gaming floors (an 8-character minimum on the learner's answer; a keyword extractor that discards words of length ≤ 3) to ever score correct — a real, distinct failure mode from Migration 242's, producing a correctly-computed `0` rather than a `NaN`. Repaired by routing exactly these 4 rows to `TIER2_ACCEPTED_SET`, a length-floor-free matcher against their own untouched `acceptedAnswers`. Confirmed: 4/4 now score correctly for their own answer and every approved variant, and correctly reject both a genuinely wrong answer and a genuinely plausible-wrong one.

## K. Material defects

None remaining. Both defects found during this Wave's post-publication verification are closed. No regression was found in the 36 rows Migration 243 did not touch (confirmed unchanged: `qf-ei003-w2-seq-explicit-02` and `qf-ei003-w2-emotion-action-02`, sibling rows in the same two families, both still show `validationTier: null`, `LEGACY_HEURISTIC`, unaffected). No change was made to `LEGACY_HEURISTIC`, `TIER1`, `TIER2`, the `validationTier` architecture, the Practice page, or the Teaching Engine — both migrations are additive `prompt` field merges only.

## L. FINAL STATUS

# **ANGEL EI003 WAVE 2: CLOSED**

All conditions established across this Wave's full acceptance programme are met: 40/40 governed review and publication; 8/8/8/8/8 family reconciliation; 20/20 blueprint reconciliation; 6/6 passage reconciliation; Mock isolation; passage rendering (including the CRLF finding, confirmed learner-invisible); teaching verification; structural diversity; passage diversity; and now, 40/40 functioning marking contract, with 0 material defects remaining. There is no additional Wave 2 gate after this.

## M. Future factory marking-contract requirement

**Documented, not implemented, per explicit instruction.** Both defects in this Wave, though distinct in mechanism, share one root: the Question Factory's `submit_question_candidate()` path currently allows an English candidate to be submitted, reviewed, and published with a `question_content` shape that is *structurally incomplete or incompatible* for the real Practice marking contract, with no check at any governance stage.

The four-question incident specifically proves that **checking only for field presence is insufficient** — all 4 of those rows already had a real, well-formed `acceptedAnswers` array (the same shape 36 other rows used successfully), yet were still unmarkable once routed to `LEGACY_HEURISTIC` by the mere absence of a `validationTier`. The defect was a **scorer/answer-form mismatch**, not a missing field.

Future prevention work should, at minimum, consider enforcing — at candidate-submission or pre-publication time, never at learner-delivery time — a valid **and internally consistent** combination of: `marks` (present, positive integer); `modelAnswer` and/or `acceptedAnswers` (at least one present, matching whichever scoring path will actually be used); `validationTier` set explicitly wherever the candidate's own answer form (e.g., a short, enumerable, or letter-coded answer) is incompatible with `LEGACY_HEURISTIC`'s own length/keyword floors; and a genuine compatibility check between the chosen scorer and the answer's own shape — not merely a presence check on the fields that scorer happens to read. No such mechanism was implemented as part of this verification, per instruction.

## N. Wave 3 Founder Decision candidates

Drawn from the existing EI003 planning analysis (`ANGEL_EDUCATIONAL_INCREMENT_003_SUSTAINED_LEARNING_PLAN.md` §B/§F/§L, the same document that identified Wave 2's own five target families), re-verified against **real, current, live production data** — not the plan's original pre-Wave-2 numbers, and not a fresh ranking invented for this report.

| Family ID | Real production depth | Blueprint depth | Teaching coverage | Priority reasoning |
|---|---|---|---|---|
| `wave3-fam-rc01-retrieval` | 5 rows | 0 distinct blueprints (single shape) | **None** — 0 entries in `ENGLISH_FAMILY_EXAM_STRATEGY`/`WORKED_EXAMPLE` | The most literal, foundational CSSE comprehension skill (direct retrieval), currently confined to a single difficulty tier (`easy` only) with no scaffolding for a learner ready to progress. Thinnest true retrieval coverage in the bank. |
| `wave1-fam-comparative-extraction` | 4 rows | 0 distinct blueprints, single difficulty (`medium` only) | **None** | The pre-existing "sibling" database family to Wave 2's own newly-deepened `wave3-fam-rc07-comparative` — already flagged in `familyTaxonomy.ts`'s own consolidation table as the *same* educational demand under two separate `family_id`s. Because Angel's real selection/de-clustering logic operates on the raw `family_id`, a learner weak-flagged specifically against this id still draws from only 4 thin, single-difficulty rows regardless of Wave 2's work on its sibling — a real, current overexposure risk Wave 2 did not close. |
| `wave1-fam-motive-inference` | 4 rows | 0 distinct blueprints | **None** | "Why did the character act this way" is a distinct, genuinely exam-relevant inferential demand not covered by any of Wave 2's five families (emotion-from-action/dialogue asks how a character *feels*, not why they *acted*) — a real, disclosed gap, not a duplicate of anything already deepened. |
| `wave1-fam-effect-of-language` | 4 rows | 0 distinct blueprints, `medium`/`hard` only (no `easy` foundation) | **None** | The same "same demand, two `family_id`s" situation as comparative-extraction, this time paired with Wave 2's own newly-deepened `wave3-fam-rc10-word-choice`. No `easy`-tier row exists at all, so a learner encountering this specific `family_id` has no on-ramp. |

**Deliberately not included, and why:** `wave2-fam-multiselect` (6 rows) and `wave1-fam-two-character` (6 rows) were both considered — both are thinner than the bank's large families, but both **already have real teaching coverage** (confirmed present in `ENGLISH_FAMILY_EXAM_STRATEGY`/`WORKED_EXAMPLE` before Wave 2 began, per this session's own regression test evidence), materially lowering their risk relative to the four zero-teaching, zero-blueprint families above. `wave1-fam-emotion-cause` (11 rows) is not thin. `wave1-fam-tick-justify` (11 rows) is not `practice_eligible` — it is `provisional`, meaning it does not currently reach real learners at all, a different class of gap (a governance/promotion decision, not a content-depth one) outside this ranking's scope.

**A specific, real architectural question worth Founder attention before Wave 3 scoping** (observation only, not a recommendation to act on now): whether `wave1-fam-comparative-extraction`/`wave3-fam-rc07-comparative` and `wave1-fam-effect-of-language`/`wave3-fam-rc10-word-choice` should eventually be consolidated under one `family_id` each (so Wave 2's new depth is actually reachable by a learner weak-flagged on the old id), rather than each pair receiving independently-deepened content under two permanently separate selection pools.

No Wave 3 content was manufactured or implemented. No new technical programme was started.

STOP. Do not begin Wave 3.
