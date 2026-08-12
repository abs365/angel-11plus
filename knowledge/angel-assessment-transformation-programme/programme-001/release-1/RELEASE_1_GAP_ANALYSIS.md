# Release 1 — Gap Analysis

**Programme:** Angel Assessment Transformation Execution Programme — Release 1 (Question Bank and Assessment Authenticity), Implementation Blueprint phase
**Status:** Analysis only. No question was rewritten or created in producing this document. No content volume is estimated.
**Prepared:** 2026-08-05
**Method:** Direct read of the entire current CSSE question pool — `supabase/migrations/013_wave2_illustrative_practice_content.sql`, all 18 rows, in full, cross-referenced against `docs/intelligence/ASSESSMENT_BRAIN_V1.md` §9's Cross Reference Matrix (all 27 Question Types, their Primary Competency, and their own Confidence/EMC rating). This is the entire real content base for the CSSE mock/practice pool — confirmed in Phase 4 grounding that no other migration or source contributes CSSE-tagged content.

---

## 1. Authenticated Coverage

Question Types with a **clean, well-justified** mapping to real content — the migration's own inline comment states a direct, non-forced rationale:

| QT ID | Name | Competency | Items | Content ID(s) |
|---|---|---|---|---|
| QT-RC-03 | Word/Phrase Meaning Explanation | RC-03 | 1 | eng-001-q2 |
| QT-RC-05 | Quotation-and-Explanation | RC-02 | 2 | eng-002-q1, eng-002-q3 |
| QT-RC-08 | List-N-Items Extraction | RC-01 | 1 | eng-003-q3 |
| QT-RC-10 | Effect-of-Language Interpretation | RC-02 | 1 | eng-001-q3 |
| QT-MR-01 | Direct Arithmetic Computation | MR-01 | 3 of 4 | mth-002, mth-008, qa-008 (mth-004 is a forced fit — see §4) |
| QT-MR-04 | Percentage/Proportional Change | MR-04 | 1 of 2 | mth-010 (mth-007b is a milder judgement call — ratio treated as proportional change — see §4) |
| QT-MR-07 | Geometric Angle/Shape Reasoning | MR-03 | 1 of 2 | mth-009 (mth-003 is a dominant-construct judgement call — see §4) |
| QT-MR-10 | Elapsed-Time/Scheduling Word Problem | MR-04 | 1 | mth-001 |
| QT-MR-11 | Number-Property Reasoning | MR-05 | 1 | qa-010 |

**9 Question Types have at least one cleanly-authenticated item.** This is a meaningfully smaller number than the "12 of 27 have any content" headline already established — 3 of those 12 (QT-MR-05, QT-MR-13, QT-WC-01a) have **no** clean item at all, only a self-disclosed judgement-call fit (see §4).

## 2. Missing Coverage

**15 of 27 Question Types have zero content.** Split by whether the gap is already explained or simply unattempted:

**Explicitly disclosed as structurally difficult to fill (4):**

| QT ID | Name | Competency | Why it's hard, per the migration's own disclosure |
|---|---|---|---|
| QT-RC-06 | Sequential Ordering | RC-04 | No existing Reading Comprehension question asks for chronological/sequential reordering |
| QT-WC-01b | Picture-Stimulus Narrative | WC-01 | None of Angel's 4 existing writing prompts use a picture stimulus; force-tagging one would misrepresent it |
| QT-MR-14 | Precision Under Exact-Match | MR-06 | Assessment Brain itself labels this "cross-cutting" (§4), not a standalone item format — no single question is a clean fit |
| *(WC-02 has no mapped Question Type at all in Assessment Brain's 27-type catalogue — a structural gap in the competency model itself, not a content gap. Carried forward unchanged, not this Release's problem to solve.)* | | | |

**Not yet attempted, no stated reason (11):**

| QT ID | Name | Competency | Confidence (Assessment Brain V1 §9) |
|---|---|---|---|
| QT-RC-01 | Literal Short-Answer Retrieval | RC-01 | HIGH / EMC-4 |
| QT-RC-02 | Yes/No Judgement + Justification | RC-02 | HIGH / EMC-4 |
| QT-RC-04 | Synonym Substitution List | RC-03 | MEDIUM / EMC-3 |
| QT-RC-07 | Multi-Entity Comparative Extraction | RC-01 | MEDIUM / EMC-3 |
| QT-RC-09 | Multi-Select Tick-Box | RC-01 | LOW / EMC-2 |
| QT-AR-01 | Letter/Word-Code Rule Application | AR-01 | HIGH (abstract) / INSUFFICIENT EVIDENCE (mechanic) |
| QT-MR-02 | Missing-Operand Arithmetic | MR-01 | MEDIUM / EMC-3 |
| QT-MR-03 | Unit Conversion/Measurement | MR-01 | HIGH / EMC-4 |
| QT-MR-06 | Algebraic Symbol/Unknown-Value | MR-02 | HIGH / EMC-4 |
| QT-MR-08 | Coordinate/Transformation Reasoning | MR-03 | MEDIUM / EMC-3 |
| QT-MR-09 | Data Reading (Table/Chart/Graph) | MR-01 | HIGH / EMC-4 |
| QT-MR-12 | Average (Mean) Calculation | MR-01 | HIGH / EMC-4 |

**This is the single most consequential finding of this analysis: 6 of the 11 unattempted, no-stated-reason gaps carry HIGH confidence / EMC-4 in Assessment Brain V1 — i.e., they are among the *best*-evidenced parts of the entire exam model, and Angel currently has zero content for them.** Authoring priority (§9 of the Blueprint) should weight toward closing these first, not toward the already-partially-covered types.

## 3. Duplicated Coverage

**None found.** All 18 rows were read in full; no two items share identical or near-identical question text, passage, or answer. This is a clean negative finding, not an omission in this analysis — duplication is not the current pool's problem.

**A related but distinct issue exists and is reported separately, not conflated with duplication:** coverage is **unevenly concentrated** within the 12 covered types — QT-MR-01 alone holds 4 of the pool's 18 items (22%), while 8 of the 12 covered types hold exactly 1 item each. This is a distribution-skew finding, not duplicate content.

## 4. Weak Coverage

Items with real content, tagged to a real Question Type, but where the migration's **own inline comment discloses a forced fit, a judgement call, or a scoring-mechanism irregularity** — these should not be counted toward genuine authenticated coverage without remediation:

| Item | QT | Disclosed weakness |
|---|---|---|
| mth-004 | QT-MR-01 | "fractions fold into Assessment Brain's Arithmetic Calculation domain, no dedicated fractions Question Type" — a forced fit, not a natural one |
| mth-003 | QT-MR-07 | "Multi-topic question (algebraic setup + geometric area); dominant tested construct is the perimeter/area relationship, so tagged QT-MR-07... a judgement call" |
| mth-005 | QT-MR-13 | "closest fit is Assessment Brain QT-MR-13" — the only item for this type, and an approximate one |
| mth-007b | QT-MR-04 | "Ratio is a form of proportional-change reasoning" — a milder but still explicit generalisation of the Question Type's actual definition |
| mth-006 | QT-MR-05 | Content itself is a clean fit, but the answer format ("45; 26th term (101)") is compound and requires the practice UI's existing semicolon-split checker rather than the standard single-value checker — a scoring-mechanism fragility, not a content fit issue |
| wrt-003 | QT-WC-01a | "closest real match" — the actual prompt (a persuasive speech to a headteacher) is not clearly "Reflective/Discursive" per Assessment Brain's own definition; this is the **only** item for this Question Type, meaning WC-01's evidence base for Angel currently rests entirely on an approximate fit |

**6 of the 18 items (33%) carry a self-disclosed fit or format weakness** (mth-004, mth-003, mth-005, mth-007b, mth-006, wrt-003) **— the remaining 12 of 18 items (67%) are cleanly tagged with no disclosed weakness.**

## 5. Unsupported Coverage

**All 18 items, without exception.** The migration's own header states this plainly: *"the Question Type assigned to each question below is this work package's own reasoned judgement, not a subject-matter reviewer's sign-off."* This is not a per-item finding — it applies uniformly to the entire current pool. Every item, including the 9 "authenticated" ones in §1, has never been reviewed by a qualified educational reviewer against Assessment Brain V1's Measurement Purpose definitions. "Authenticated" in §1 means *internally, procedurally well-justified*, not *externally validated* — these are different claims, and Release 1's Educational Validation strategy (§14 of the Implementation Blueprint) must close this gap for the existing 18 items as well as for anything newly authored, not assume the existing items are already sound because they predate this Release.

## 6. Confidence Level by Question Type (Full 27)

Cross-referencing Assessment Brain V1's own evidentiary confidence (not Angel's content status) against Angel's current coverage status:

| QT ID | AB V1 Confidence/EMC | Angel Coverage Status |
|---|---|---|
| QT-RC-01 | HIGH / EMC-4 | Missing, unattempted |
| QT-RC-02 | HIGH / EMC-4 | Missing, unattempted |
| QT-RC-03 | LOW / EMC-2 | Authenticated (1 item) |
| QT-RC-04 | MEDIUM / EMC-3 | Missing, unattempted |
| QT-RC-05 | MEDIUM / EMC-3 | Authenticated (2 items) |
| QT-RC-06 | LOW / EMC-2 | Missing, disclosed hard |
| QT-RC-07 | MEDIUM / EMC-3 | Missing, unattempted |
| QT-RC-08 | MEDIUM / EMC-3 | Authenticated (1 item) |
| QT-RC-09 | LOW / EMC-2 | Missing, unattempted |
| QT-RC-10 | MEDIUM / EMC-3 | Authenticated (1 item) |
| QT-AR-01 | HIGH(abstract)/INSUFFICIENT(mechanic), EMC-3/EMC-1 | Missing, unattempted — also gated by the still-open Applied Reasoning currency question (AEP4-C04) |
| QT-WC-01a | HIGH / EMC-3 | Weak (1 item, approximate fit) |
| QT-WC-01b | HIGH / EMC-4 | Missing, disclosed hard |
| QT-MR-01 | HIGH / EMC-4 | Authenticated (3 items) + Weak (1 item) |
| QT-MR-02 | MEDIUM / EMC-3 | Missing, unattempted |
| QT-MR-03 | HIGH / EMC-4 | Missing, unattempted |
| QT-MR-04 | HIGH / EMC-4 | Authenticated (1 item) + Weak (1 item) |
| QT-MR-05 | HIGH / EMC-4 | Weak (1 item, format fragility) |
| QT-MR-06 | HIGH / EMC-4 | Missing, unattempted |
| QT-MR-07 | HIGH / EMC-4 | Authenticated (1 item) + Weak (1 item) |
| QT-MR-08 | MEDIUM / EMC-3 | Missing, unattempted |
| QT-MR-09 | HIGH / EMC-4 | Missing, unattempted |
| QT-MR-10 | HIGH / EMC-4 | Authenticated (1 item) |
| QT-MR-11 | HIGH(struct)/LOW, EMC-3 | Authenticated (1 item) |
| QT-MR-12 | HIGH / EMC-4 | Missing, unattempted |
| QT-MR-13 | MEDIUM / EMC-3 | Weak (1 item, "closest fit") |
| QT-MR-14 | HIGH / EMC-4 | Missing, disclosed hard (cross-cutting, not standalone) |

**Pattern worth naming explicitly:** the highest-confidence Question Types (HIGH/EMC-4) are **not** systematically better-covered than lower-confidence ones — QT-RC-01 and QT-RC-02 (both HIGH/EMC-4) have zero content, while QT-RC-03 (LOW/EMC-2) has content. Coverage to date tracked what existing Angel content happened to fit, not what Assessment Brain V1's own evidence prioritises. This is the direct basis for the Question Taxonomy and Competency Coverage strategies in the Implementation Blueprint (§9, §10): future authoring should invert this — sequence by Assessment Brain's own confidence, not by convenience.

---

## Summary Table

| Metric | Count | Share of 27 |
|---|---|---|
| Question Types with clean, authenticated content | 9 | 33% |
| Question Types with weak/judgement-call content only | 3 | 11% |
| Question Types missing, explicitly disclosed as hard | 4 (incl. WC-02's structural gap) | 15% |
| Question Types missing, unattempted, no stated reason | 11 | 41% |
| **Total items in current pool** | **18** | — |
| Items with a clean fit, no disclosed weakness | 12 | 67% of pool |
| Items with a disclosed fit/format weakness | 6 | 33% of pool |
| Items with subject-matter reviewer sign-off | **0** | **0% of pool** |

*No content volume is estimated anywhere in this document — every count above is a direct tally of what currently exists, not a projection of what should exist.*
