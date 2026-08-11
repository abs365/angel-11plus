# Founder Validation Assessment (CSSE) — Content Register

**Programme:** Angel Assessment Transformation Execution Programme — Release 1
**Prepared:** 2026-08-10
**Every item below is defined in `supabase/migrations/021_founder_validation_csse_assessment.sql` and its evidence metadata in `data/founderValidation/csseFounderValidationEvidence.ts` — this register is the human-readable index of both, not a third copy of the content.**

---

## English Reading Comprehension — passage "The Orchard" (original, ~290 words)

| Item ID | QT | Competency | Marks | Difficulty | Evidence source(s) | Originality |
|---|---|---|---|---|---|---|
| `fv-eng-001-q1` | QT-RC-01 (Literal Retrieval) | RC-01 | 1 | easy | CSSE-008 Q2-Q4/Q12 (2022); CSSE-003 Q1/Q5a/Q9/Q11 (2023); CSSE-013 Q2 (2021) | New passage, new fact, no CSSE wording |
| `fv-eng-001-q2` | QT-RC-02 (Judgement+Justification) | RC-02 | 3 | easy | CSSE-008 Q1 (2022); CSSE-003 Q2 (2023); CSSE-013 Q1 (2021) | New judgement + reasons |
| `fv-eng-001-q3` | QT-RC-05 (Quotation+Explanation) | RC-02 | 3 | medium | CSSE-003 Q6b/Q12 (2023); CSSE-008 Q7 (2022) | New quotation + explanation |
| `fv-eng-001-q4` | QT-RC-10 (Effect-of-Language) | RC-02 | 2 | medium | CSSE-013 Q4/Q9 (2021); CSSE-008 Q8/Q9/Q11/Q14/Q16 (2022) | New phrase + interpretation |
| `fv-eng-001-q5` | QT-RC-07 (Comparative Extraction) | RC-01 | 4 | medium | CSSE-003 Q8 (2023); CSSE-008 Q15 (2022) | New two-character comparison |

**Passage total:** 13 marks, 455 estimated seconds (~7.6 min).

## Mathematics — 6 atomic items

| Item ID | QT | Competency | Marks | Difficulty | Evidence source(s) | Originality |
|---|---|---|---|---|---|---|
| `fv-mth-001` | QT-MR-01 (Direct Arithmetic) | MR-01 | 1 | easy | CSSE-006/011/016 Q1-Q3 (2021-2023) | New numbers |
| `fv-mth-002` | QT-MR-03 (Unit Conversion) | MR-01 | 1 | easy | CSSE-011 Q4a (2022) | New values (4.7m, not 3.12m) |
| `fv-mth-003` | QT-MR-06 (Algebra, unknown-value system) | MR-02 | 2 | hard | CSSE-011 Q6 (2022) | Independently reworked letters/values |
| `fv-mth-004` | QT-MR-07 (Geometric Angle Reasoning) | MR-03 | 1 | medium | CSSE-011 Q12 (2022) | New angle value (65°) |
| `fv-mth-005` | QT-MR-09 (Data Reading) | MR-01 | 1 | easy | CSSE-011 Q15 (2022); CSSE-016 Q10 (2021) | New data set (cafe tea sales) |
| `fv-mth-006` | QT-MR-12 (Mean, forward+forward) | MR-01 | 2 | medium | CSSE-011 Q11 (2022) | Independently reworked scenario |

**Mathematics total:** 8 marks, 375 estimated seconds (~6.25 min).

**Assessment total:** 11 items, 21 marks, ≈13.8 minutes estimated (scaled, not exam-equivalent — see Blueprint §6).

## Evidence Traceability, Per Item

Full per-item fields (Measurement Purpose, evidence note, difficulty basis, originality declaration, "why it belongs") are recorded in `data/founderValidation/csseFounderValidationEvidence.ts` and rendered live on the assessment's own results screen (the Founder Evidence View) — not duplicated a third time here. This register exists to let a reader confirm coverage and evidence linkage at a glance without opening the code.

## Known, Disclosed Limitations of This Content Set

- **`fv-mth-006`'s compound answer** ("70; new average 15") is graded by the existing semicolon-split checker (`checkMathsAnswer`, `lib/learningEngine/practiceContent.ts`), which accepts either the full string or just the value before the semicolon — meaning a learner who answers only part (a) correctly and skips part (b) can still be marked fully correct. This is an inherited limitation of the existing, already-production grader (the same one `mth-006` in migration 013 already has), not a new defect introduced here — disclosed, not hidden.
- **No item in this set has been through independent educational review** (the same status every one of the 29 existing production items and the QT-RC-01 pilot item are also in — see `RELEASE_1_ASSESSMENT_ELIGIBILITY_MODEL.md`). All 11 items are **Authentic Assessment Candidate** status (author-certified traceability, not yet reviewer-confirmed), not Independently Validated, not Mock Eligible.
- **English marking** uses the existing keyword-overlap heuristic (`scoreEnglishAnswer`) — "correct" means full marks only, the same first-pass simplification already documented and accepted for every other English item in this codebase (ALI Decision 37).
