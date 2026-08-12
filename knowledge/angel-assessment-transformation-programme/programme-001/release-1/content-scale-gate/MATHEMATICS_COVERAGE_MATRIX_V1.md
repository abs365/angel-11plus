# Mathematics Coverage Matrix V1

**Prepared:** 2026-08-12, Educational Increment 004, Wave 1.
**Baseline:** 52 live `ali_question_bank` rows (post-Increment 003), 32 of which are Mathematics.

**Evidence note (Section 3):** the directive references additional 2016/2017/2018/2020 CSSE papers as supplied to the programme. I checked the repository and all locally accessible storage again before writing this matrix (as I did for Increment 003's 2020 check) — none of the four exist anywhere I have access to. This is recorded as a **pending evidence transfer**, not treated as absent-therefore-ignorable and not fabricated as integrated. Nothing below assumes access to them; everything is grounded in the 17 already-Accepted assets (2021/2022/2023).

## Matrix

| Competency | Name | EMC | QTs mapped | Existing items | Existing families | Sufficiency (per Content Sufficiency Standard V1) | Wave 1 target | Priority |
|---|---|---|---|---|---|---|---|---|
| MR-01 | Arithmetic Calculation | EMC-3 | QT-MR-01/02/03/09/12 | 18 | ~1 real (broad operand variety, single structure: direct computation) | Minimum Practice Supply | **0 new** | Deprioritised — already the most-supplied competency; directive explicitly warns against adding unnecessary volume here |
| MR-02 | Algebraic / Symbolic Problem-Solving | **EMC-4** | QT-MR-05/06 | 2 | 0 | Insufficient | **~12** | **HIGH** — highest-evidence tier, most under-supplied of the EMC-4 competencies |
| MR-03 | Geometric and Spatial Reasoning | **EMC-4** | QT-MR-07/08 | 3 | 0 | Insufficient | **~10** | **HIGH** — EMC-4, thin coverage, only single-structure existing items |
| MR-04 | Multi-Step Word-Problem Interpretation | EMC-4 | QT-MR-04/10/13 | 8 | 2 (Lesson 1/2 teaching families) | Minimum Practice Supply | 0 new this wave | Already has real lesson-backed depth; revisit in a later wave for near/far transfer specifically |
| MR-05 | Number Properties and Number Theory | EMC-2 | QT-MR-11 | 1 | 0 | Insufficient | **~10** | **MEDIUM-HIGH** — real evidenced archetype (QT-MR-11), severely under-supplied, and a genuine prerequisite for several MR-01/MR-04 compound questions per the Multi-Year Pattern Analysis |
| MR-06 | Precision Under Exact-Match Conditions | EMC-4 | QT-MR-14 (cross-cutting) | 6 | 2 (Increment 003) | Minimum Practice Supply | 0 new this wave | Not a standalone topic — already addressed structurally; revisit only by adding the condition to new families in other competencies, not as its own family |
| RC-01 | Literal Retrieval from Narrative Text | EMC-3 | QT-RC-01/07/08/09 | 3 | — | Insufficient | 0 new this wave | English, out of this Mathematics-scoped wave |
| RC-02 | Inference and Justified Interpretation | EMC-3 | QT-RC-02/05/10 | 9 | — | Minimum Practice Supply | 0 new this wave | English, out of scope |
| RC-03 | Word/Phrase Meaning-in-Context | EMC-2 | QT-RC-03/04 | 1 | — | Insufficient | 0 new this wave | English, out of scope |
| RC-04 | Sequential Ordering of Textual Information | EMC-2 | QT-RC-06 | 0 | — | Missing | 0 new this wave | English, out of scope |
| AR-01 | Letter-Code Pattern Inference | EMC-3 | QT-AR-01 | 0 | — | Missing, genuinely blocked | 0 | **Do not touch** — Gate 3 deferred, no post-2024 evidence |
| WC-01 | Sustained Original Composition | EMC-3 | QT-WC-01a | 1 | — | Reference quality only | 0 | Writing, out of scope |
| WC-02 | Multi-Dimensional Writing Quality | EMC-1 | QT-WC-01b | 0 | — | Missing | 0 | Writing, out of scope |

**Wave 1 total target: ~32 new Mathematics items across MR-02, MR-03, MR-05** — chosen because all three are either EMC-4 (Established) or a real, evidenced QT-MR-11 archetype, all three are currently at or near zero families, and none of the three is MR-01 (already dominant) or MR-04/MR-06 (already recently addressed). This is below the directive's 100-150 planning range; the reasons are stated in the Wave 1 report itself, not hidden here.

## Prerequisite relationships (disclosed limitation, unchanged from Increment 002/003)

No canonical cross-competency prerequisite model exists in this codebase (`lib/ali/recommendations.ts`'s `COMPETENCY_RELATIONSHIPS` graph uses an incompatible legacy vocabulary, confirmed in Educational Increment 002). Wave 1 does not invent one. Where the Multi-Year Pattern Analysis observes a compound question combining two Question Types (e.g. CSSE-006 Q14 combining QT-MR-03 and QT-MR-07), that is recorded as a structural co-occurrence fact only, never asserted as a teaching prerequisite.
