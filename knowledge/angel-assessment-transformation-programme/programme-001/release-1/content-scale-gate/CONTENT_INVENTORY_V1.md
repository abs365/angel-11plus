# Content Inventory V1

**Prepared:** 2026-08-12, Angel 11+ Completion Programme, Continuation Directive 002.
**Method:** direct authenticated query against the live production `ali_question_bank` table (Supabase project `agxunwcdatosrmzhhuxj`), not a historical report, not a document count. Every number below is reproducible by re-running the same query.

## 1. Authoritative production baseline

**TOTAL ROWS: 46** (as of 2026-08-12T19:56 UTC, immediately after this directive's own query).

This resolves the 18/29/40 discrepancy: all three are genuine historical snapshots, not errors.

| Snapshot | Count | What it corresponds to |
|---|---|---|
| 2026-07-20 | 18 | Original baseline content (`mth-*`, `eng-*`, `wrt-003`) |
| 2026-07-23 | 29 | + 11 rows, migration 016 (`qa-*`, `eng-001-q1`, `eng-001-q4`, `eng-003-q1`) — independently confirmed applied by cross-checking migration 016's own source SQL against live row IDs and `created_at` timestamps |
| 2026-08-10 | 40 | + 11 rows, migration 021 (`fv-*`, the Founder Validation Assessment batch) |
| 2026-08-11 to 2026-08-12 | 46 | + 6 rows, migrations 023/025/029 (Mathematics Reference Vertical Lesson 1 + Lesson 2, `learn-mth-*`) |

**No eligibility/status column exists in the schema.** `ali_question_bank`'s 20 real columns are: `id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, hint, confidence_weight, learning_objective, revision_priority, mastery_threshold, usage_count, avg_success_rate, created_at, learning_unit_id, addresses_misconception, transfer_links`. The five-status model (`RELEASE_1_ASSESSMENT_ELIGIBILITY_MODEL.md`) is a governance/documentation construct only, exactly as that document itself discloses ("Design only. No database field created"). **By that model's own definition, every one of the 46 live rows is currently Provisional Content** — no row has ever been formally progressed through the chain, because the mechanism to record progression doesn't exist in the schema yet. This is stated as a finding, not a defect: the model was never meant to self-implement.

One caveat worth separating out: the 11 `fv-*` rows (Founder Validation Assessment) have their own, different, already-completed verification — a full interactive, real-browser pass reported "21/21 gates PASS" in `FOUNDER_VALIDATION_ASSESSMENT_ACTIVATION_REPORT.md`. That is real, strong evidence, but it is a different process from — and was never mapped onto — the five-status model above. Treat these 11 rows as *strongly evidenced* Provisional Content, not as formally Practice Eligible or higher.

## 2. Counts by subject

| Subject | Rows |
|---|---|
| maths | 32 |
| english | 13 |
| writing | 1 |
| **Total** | **46** |

No `vocabulary` rows exist in `ali_question_bank` (consistent with `EDUCATIONAL_IDENTITY_PHASE2C_FINAL_REPORT.md`'s finding that vocabulary has no defensible Question Type mapping yet — migrations 017/018 correctly registered nothing for it).

## 3. Counts by Question Type (19 of 27 catalogue types have at least one item)

| Question Type | Rows | Question Type | Rows |
|---|---|---|---|
| QT-MR-01 | 15 | QT-RC-05 | 5 |
| QT-MR-04 | 6 | QT-RC-10 | 3 |
| QT-MR-07 | 3 | QT-RC-01 | 1 |
| QT-MR-03 | 1 | QT-RC-02 | 1 |
| QT-MR-05 | 1 | QT-RC-03 | 1 |
| QT-MR-06 | 1 | QT-RC-07 | 1 |
| QT-MR-09 | 1 | QT-RC-08 | 1 |
| QT-MR-10 | 1 | QT-WC-01a | 1 |
| QT-MR-11 | 1 | | |
| QT-MR-12 | 1 | | |
| QT-MR-13 | 1 | | |

**Zero-content Question Types (8 of 27):** QT-MR-02, QT-MR-08, QT-MR-14, QT-RC-04, QT-RC-06, QT-RC-09, QT-AR-01, QT-WC-01b.

**QT-MR-01 concentration:** 15 of 46 rows (33%) sit on a single Question Type, independently reconfirming the concentration finding `RELEASE_1_LIVE_QUESTION_BANK_RECONCILIATION_REPORT.md` raised at the 29-row snapshot — the imbalance has not been corrected since, it has grown in absolute terms (9 QT-MR-01 rows at the 29-row snapshot vs. 15 now, largely from the Mathematics Reference Vertical's own arithmetic lesson content, which is legitimately concentrated by design since it teaches one skill deeply).

## 4. Counts by competency (9 of 13 catalogue competencies have at least one item)

| Competency | Rows | Competency | Rows |
|---|---|---|---|
| MR-01 (Arithmetic Calculation) | 18 | RC-01 (Literal Retrieval) | 3 |
| MR-04 (Multi-Step Word-Problem) | 8 | RC-02 (Inference/Justified Interp.) | 9 |
| MR-03 (Geometric/Spatial) | 3 | RC-03 (Word/Phrase Meaning) | 1 |
| MR-02 (Algebraic/Symbolic) | 2 | WC-01 (Sustained Composition) | 1 |
| MR-05 (Number Properties) | 1 | | |

**Zero-content competencies (4 of 13):** RC-04 (Sequential Ordering), AR-01 (Letter-Code Pattern Inference), MR-06 (Precision Under Exact-Match Conditions), WC-02 (Multi-Dimensional Writing Quality).

Notably, **MR-06 and MR-02 are both EMC-4 (Established) — the highest evidence-maturity tier — yet MR-06 has zero items and MR-02 has only 2.** This reconfirms `RELEASE_1_GAP_ANALYSIS.md`'s original finding: existing coverage tracks historical convenience, not evidence priority. The two highest-value gaps by this measure are **MR-06** (zero coverage, EMC-4) and completing **MR-02** (thin coverage, EMC-4) — ahead of, for example, further MR-01 content, which is already the best-covered competency in the bank.

## 5. Competency classification

Per the directive's required classification (PRODUCTION READY / PARTIALLY BUILT / REFERENCE QUALITY ONLY / LEGACY ONLY / MISSING / INSUFFICIENT QUESTION DEPTH / INSUFFICIENT EVIDENCE):

| Competency | Question bank rows | Learning Sequence lesson | Classification |
|---|---|---|---|
| MR-01 | 18 | Lesson 1 (arithmetic), live, evidence-verified | **PARTIALLY BUILT** — strong raw depth, but per Content Sufficiency Standard §2 below, depth ≠ variation; no confirmed archetype-family diversity within these 18 |
| MR-04 | 8 | Lesson 2 (percentages), live, evidence-verified | **PARTIALLY BUILT** — same caveat |
| MR-02 | 2 | none | **INSUFFICIENT QUESTION DEPTH** — highest-priority gap given EMC-4 |
| MR-03 | 3 | none | **INSUFFICIENT QUESTION DEPTH** |
| MR-05 | 1 | none | **INSUFFICIENT QUESTION DEPTH** |
| MR-06 | 0 | none | **MISSING** — highest-priority gap (EMC-4, zero coverage) |
| RC-01 | 3 | none | **INSUFFICIENT QUESTION DEPTH** |
| RC-02 | 9 | none | **PARTIALLY BUILT** |
| RC-03 | 1 | none | **INSUFFICIENT QUESTION DEPTH** |
| RC-04 | 0 | none | **MISSING** |
| AR-01 | 0 | none | **MISSING — genuinely blocked** (Gate 3, no post-2024 CSSE English paper acquired to confirm AR-01 still examinable; do not author speculatively) |
| WC-01 | 1 | none (Continuous Writing has a separate practice area, `lib/learningEngine/practiceContent.ts`, not backed by this table for prompts) | **REFERENCE QUALITY ONLY** relative to this table; real writing prompts live elsewhere — see `data/*.ts` per `EDUCATIONAL_IDENTITY_PHASE2C_FINAL_REPORT.md`'s 218-item scan |
| WC-02 | 0 | none | **MISSING** from this table for the same reason as WC-01 |

No competency in this inventory qualifies as **PRODUCTION READY** under a strict reading (multi-archetype, misconception-mapped, transfer-capable, independently reviewed) — MR-01 and MR-04 are the closest, by virtue of the Mathematics Reference Vertical's deliberate single-skill depth, but neither has independent educational review, and MR-01's 18 items have not been re-audited for archetype diversity vs. simple operand variation (that audit is `RELEASE_1_EXISTING_CONTENT_AUTHENTICITY_REVIEW_PLAN.md`'s explicitly-deferred scope, not performed here).
