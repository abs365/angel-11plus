# Mathematics Evidence Traceability Register

**Programme:** Angel Assessment Transformation Execution Programme — Release 1, Mathematics Learn → Practise Reference Vertical
**Prepared:** 2026-08-11

---

## Purpose

Every substantive educational asset in this vertical (the lesson content and every practice item used) carries: official evidence source, Question Type, competency, educational objective, originality status, review status — per governing instruction §4.

## 1. The taught topic's evidence

| Field | Value |
|---|---|
| Official evidence source | CSSE-006, CSSE-011, CSSE-016 (2021/2022/2023 Entry Maths papers), Q1–Q3 |
| Question Type | QT-MR-01 — Direct Arithmetic Computation |
| Competency | MR-01 — Arithmetic Calculation |
| Evidence Maturity | EMC-4 / HIGH — "the paper's opening question format in an identical shape across all three years" (previously confirmed in `data/founderValidation/csseFounderValidationEvidence.ts`, `fv-mth-001`) |
| Educational objective | Whole-number column addition and subtraction, including regrouping (carrying/borrowing) — the specific skill CSSE's own opening questions test |
| Originality status | All new teaching prose, worked examples, and guided/independent items authored for this vertical are original — no CSSE wording, numbers, or scenario reused |
| Review status | Engineering-verified this increment; independent educational review not yet performed (see `MATHEMATICS_EDUCATIONAL_VALIDATION_PACK.md`) |

## 2. Lesson content assets (new, authored this increment)

| Asset | Type | Educational objective | Evidence basis | Originality | Review status |
|---|---|---|---|---|---|
| Concept explanation | Teaching prose | Place value and what carrying/borrowing represent | CSSE-006/011/016 Q1–Q3 (topic scope) | Original | Engineering-verified |
| Method steps | Teaching prose | Step-by-step column addition/subtraction procedure | Same | Original | Engineering-verified |
| Worked example 1 (addition) | Worked example | Demonstrate carrying with two columns | Modelled on the real shape of `qa-001` (847+356) — new numbers, not reused | Original | Engineering-verified |
| Worked example 2 (subtraction) | Worked example | Demonstrate borrowing across a zero, CSSE's hardest real regrouping case | Modelled on the real shape of `qa-002` (1000−473) — new numbers, not reused | Original | Engineering-verified |
| Guided attempt item | Practice item, scaffolded | Apply the method with support | Same topic/format as above | Original | Engineering-verified |
| Independent check item | Practice item, unscaffolded | Apply the method unaided; generates real evidence | Same topic/format as above | Original | Engineering-verified |
| Common mistakes list | Teaching prose | Name and pre-empt the two most predictable errors (forgetting to carry; borrowing incorrectly across a zero) | Pedagogical knowledge, not CSSE-specific | Original | Engineering-verified |
| Exam application note | Teaching prose | Show how this appears as CSSE's own opening-question format | CSSE-006/011/016 Q1–Q3 (format only, no wording reproduced) | Original | Engineering-verified |

## 3. Existing question bank assets used in Practise

See `EXISTING_MATHEMATICS_CONTENT_AUTHENTICITY_REVIEW.md` for the full per-item classification. Summary:

| Item | Question Type | Evidence citation | Eligibility Model status |
|---|---|---|---|
| `fv-mth-001` | QT-MR-01 | CSSE-006/011/016 Q1–Q3 | Authentic Assessment Candidate |
| `fv-mth-002` | QT-MR-03 | CSSE-011 Q4a | Authentic Assessment Candidate |
| `fv-mth-005` | QT-MR-09 | CSSE-011 Q15, CSSE-016 Q10 | Authentic Assessment Candidate |
| `fv-mth-006` | QT-MR-12 | CSSE-011 Q11 | Authentic Assessment Candidate |
| `qa-001`, `qa-002`, `qa-003`, `qa-004`, `qa-005`, `qa-008`, `qa-009` | QT-MR-01 | None recorded per-item (`RELEASE_1_LIVE_QUESTION_BANK_RECONCILIATION_REPORT.md` §8: "No row's registration reasoning cites KA-001 or any other real CSSE exam paper") — format matches the evidenced QT-MR-01 shape (bare computation, no word wrapper) | Practice Eligible |
| `qa-006`, `mth-004` | QT-MR-01 (internally tagged `skill: "fractions"`) | None recorded per-item | Practice Eligible, forced-fit noted |
| `mth-002`, `mth-008` | QT-MR-01 | None recorded per-item | Practice Eligible |

## 4. What this register does not claim

No item above is claimed "Independently Validated" or "Mock Eligible" — per the Eligibility Model (`RELEASE_1_ASSESSMENT_ELIGIBILITY_MODEL.md`), both statuses require a reviewer who did not author the item, which has not occurred for any asset in this vertical. This register closes the retrospective-assessment gap that document's §6 explicitly deferred, scoped to the items this vertical actually uses.
