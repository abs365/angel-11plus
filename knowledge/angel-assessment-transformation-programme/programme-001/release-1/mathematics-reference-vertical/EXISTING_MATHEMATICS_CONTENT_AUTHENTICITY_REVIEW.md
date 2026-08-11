# Existing Mathematics Content Authenticity Review

**Programme:** Angel Assessment Transformation Execution Programme — Release 1, Mathematics Learn → Practise Reference Vertical
**Prepared:** 2026-08-11
**Method:** Every item below was fetched directly from the live production `ali_question_bank` table (not read from a migration file, which may have drifted from live state) and checked by hand against the criteria in governing instruction §7.

---

## Classification key

AUTHENTICALLY SUITABLE / SUITABLE WITH CORRECTION / PRACTICE-ONLY / HIDE / RETIRE CANDIDATE

## Founder Validation pool (pathway `csse-founder-validation`)

| Item | Prompt | Check | Classification |
|---|---|---|---|
| `fv-mth-001` | Direct subtraction with borrowing | Correct, cited evidence (CSSE-006/011/016 Q1-Q3), matches QT-MR-01 format exactly, age-appropriate, exam-relevant | **AUTHENTICALLY SUITABLE** |
| `fv-mth-002` | Unit conversion | Correct, cited evidence (CSSE-011 Q4a), matches QT-MR-03 format | **AUTHENTICALLY SUITABLE** (not used in this vertical's core teaching topic, but valid for the broader MR-01 practice pool) |
| `fv-mth-005` | Data table reading | Correct, cited evidence (CSSE-011 Q15, CSSE-016 Q10), matches QT-MR-09 format | **AUTHENTICALLY SUITABLE** (same note) |
| `fv-mth-006` | Mean reconstruction | Correct, cited evidence (CSSE-011 Q11), matches QT-MR-12 format | **AUTHENTICALLY SUITABLE** (same note) |

## Production pool (pathway `csse`), QT-MR-01

| Item | Prompt (exact) | Mathematical correctness | Question Type fit | Evidence citation | Classification |
|---|---|---|---|---|---|
| `qa-001` | 847 + 356 = ? (answer 1203) | Verified correct | Exact match — bare computation, no wrapper | None recorded per-item | **PRACTICE-ONLY** |
| `qa-002` | 1000 − 473 = ? (answer 527) | Verified correct | Exact match — the real CSSE borrowing-across-zeros pattern | None recorded per-item | **PRACTICE-ONLY** |
| `qa-003` | 24 × 35 = ? (answer 840) | Verified correct | Exact match | None recorded per-item | **PRACTICE-ONLY** |
| `qa-004` | 756 ÷ 9 = ? (answer 84) | Verified correct | Exact match | None recorded per-item | **PRACTICE-ONLY** |
| `qa-005` | 12.5 × 8 = ? (answer 100) | Verified correct | Exact match | None recorded per-item | **PRACTICE-ONLY** |
| `qa-008` | √225 = ? (answer 15) | Verified correct | Match (bare computation) | None recorded per-item | **PRACTICE-ONLY** |
| `qa-009` | 2³ × 5 = ? (answer 40) | Verified correct | Match (order of operations) | None recorded per-item | **PRACTICE-ONLY** |
| `qa-006` | 3/4 of 240 = ? (answer 180) | Verified correct | Internally tagged `skill: "fractions"`, classified QT-MR-01 — a legitimate direct computation, but the internal tag mismatch is a minor forced-fit signal, disclosed not corrected | None recorded per-item | **PRACTICE-ONLY**, forced-fit noted |
| `mth-002` | 4³ + √144 = ? (answer 76, 2 marks) | Verified correct (64 + 12 = 76) | Match — multi-operation direct computation | None recorded per-item | **PRACTICE-ONLY** |
| `mth-004` | 3/8 + 5/6 as a mixed number (answer 1 5/24, 2 marks) | Verified correct (9/24 + 20/24 = 29/24) | Internally tagged `skill: "fractions"`, same forced-fit note as `qa-006` | None recorded per-item | **PRACTICE-ONLY**, forced-fit noted |
| `mth-008` | 2.4 × 0.35 = ? (answer 0.84) | Verified correct, real working steps included | Match | None recorded per-item | **PRACTICE-ONLY** |

## Why "PRACTICE-ONLY" rather than "AUTHENTICALLY SUITABLE" for the 11 production items

Every item above is mathematically correct, well-formed, age-appropriate, and format-consistent with QT-MR-01's real evidenced shape (a bare computation, no word-problem wrapper — exactly what CSSE's opening questions look like across all three held years). None required correction. But per the governing instruction's explicit "do not assume existing content is acceptable merely because it is live," and per `RELEASE_1_LIVE_QUESTION_BANK_RECONCILIATION_REPORT.md`'s own finding (confirmed again here, not merely cited from memory): **none of these 11 items carries a per-item citation to a specific CSSE Asset ID** in its stored metadata. Format-matching is real, positive evidence of authenticity, but it is not the same as an individually traceable citation — the Eligibility Model's own "Practice Eligible" tier exists for exactly this combination (disclosed QT/competency mapping, correct and well-formed, not yet checked against the fuller authenticity specification or independently reviewed). None is classified HIDE or RETIRE CANDIDATE — there is no mathematical, age-appropriateness, or exam-relevance defect in any of them.

## Two items flagged, not corrected

`qa-006` and `mth-004` carry an internal `skill: "fractions"` tag despite being classified under `QT-MR-01`. This is recorded as a disclosed observation (a "forced-fit concern" per governing instruction §7), not silently repaired — the questions themselves remain mathematically valid, correctly-scored, and format-consistent with direct computation; only the internal skill label is arguably imprecise. No correction was made to the live database as part of this review; a future content-governance pass may wish to either add a fractions-specific Question Type or re-tag these two items — a decision outside this vertical's scope.

## What this review does not do

Does not silently repair any item. Does not retire any item — no item earned that classification. Does not promote any item beyond Practice Eligible / Authentic Assessment Candidate — that requires independent review (see `MATHEMATICS_EDUCATIONAL_VALIDATION_PACK.md`).
