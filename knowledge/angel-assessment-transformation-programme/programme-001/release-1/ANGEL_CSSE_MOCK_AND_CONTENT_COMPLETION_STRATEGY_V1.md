# Angel 11+ — CSSE Mock and Content Completion Strategy V1

**Educational Increment 007R.** Prepared 2026-08-17. Founder authorisation: strategy/evidence/architecture only — no bulk authoring, no Mock implementation, no eligibility change.
**Status:** design and evidence document. Nothing in this document has been implemented in code, and no `ali_question_bank` row has been added, edited, or reclassified as a result of it.
**Continues from:** Phase A (closed), Phase B Mathematics Teaching (closed, Decisions 62-63), Phase C English Teaching (closed, Decisions 64-65), Phase D Continuous Writing (closed, Decisions 66-67).

---

## Evidence level key (used throughout this document)

| Level | Meaning |
|---|---|
| **L1** | Current official CSSE evidence (the live `csse.org.uk` site or its currently-linked documents) |
| **L2** | Official historical CSSE papers/material (past papers, older familiarisation packs, the sample mark scheme) |
| **L3** | Reliable corroborating educational/public sources (tuition providers, secondary commentary) — never overrides L1/L2 |
| **L4** | Observed pattern/inference from L1-L3 evidence, or from Angel's own live production data |
| **L5** | Hypothesis requiring validation — Angel's own educational judgement, explicitly not evidence-backed |

No copyrighted CSSE examination content (passage text, question wording, answer text) is reproduced anywhere in this document. Where past-paper or familiarisation-paper material was consulted, only structural/statistical facts are recorded, consistent with the discipline every prior evidence document in this programme has followed.

---

## Part 1 — Reconciled real estate (fresh production query, 2026-08-17)

**Top-line (re-queried live, not trusted from the prior report):**

| Metric | Count |
|---|---|
| TOTAL | 264 |
| Practice Eligible | 247 |
| Provisional | 17 |
| Mock Eligible | 0 |
| Mathematics (n / PE / prov) | 146 / 141 / 5 |
| English (n / PE / prov) | 117 / 106 / 11 |
| Writing (n / PE / prov) | 1 / 0 / 1 |
| Provenance `angel_original` | 218 |
| Provenance `null` (pre-migration-030 legacy rows) | 46 (32 Maths legacy + 13 English legacy + 1 Writing) |

Byte-identical to every prior phase's own baseline. No discrepancy — no STOP triggered.

### A. Reviewed, family-based content

**Mathematics — 27 named families, 141 PE**, by Question Type (fresh query, family count per QT computed directly, not estimated):

| QT | Competency | PE | Families | Family names |
|---|---|---|---|---|
| QT-MR-01 Direct Arithmetic | MR-01 | 14 | **0 dedicated** | all in legacy pool |
| QT-MR-02 Missing-Operand | MR-01 | 4 | 1 | `mr01-missing-operand` |
| QT-MR-03 Unit Conversion | MR-01 | 5 | 1 (+legacy) | `mr01-measurement-conversion` |
| QT-MR-04 Percentage/Proportional | MR-04 | 16 | 3 (+legacy) | `mr04-compound-percentage`, `mr04-far-recipe`, `mr04-far-percent` |
| QT-MR-05 Sequence/Function-Rule | MR-02 | 15 | 2 | `mr02-sequence-rule`, `mr02-nth-term` |
| QT-MR-06 Algebraic Symbol/Unknown | MR-02 | 17 | 4 (+legacy) | `mr02-substitution`, `mr02-sum-difference`, `mr02-far-ratio-context`, `mr02-compare` |
| QT-MR-07 Geometric Angle/Shape | MR-03 | 20 | 4 (+legacy) | `mr03-classify`, `mr03-angle-sum`, `mr03-mixed-perimeter`, `mr03-angle-ratio` |
| QT-MR-08 Coordinate/Transformation | MR-03 | 3 | 1 | `mr03-coordinate` |
| QT-MR-09 Data Reading | MR-01 | 6 | 1 (+legacy) | `mr01-data-table` |
| QT-MR-10 Elapsed-Time | MR-04 | 6 | 1 (+legacy) | `mr04-elapsed-time` |
| QT-MR-11 Number-Property | MR-05 | 16 | 4 (+legacy) | `mr05-factors-primes`, `mr05-constrained-multiple`, `mr05-number-property`, `mr05-number-property-search` (TRANSFER-UNSAFE) |
| QT-MR-12 Average (Mean) | MR-01 | 5 | 1 (+legacy) | `mr01-average-mean` |
| QT-MR-13 Best-Value/Combinatorial | MR-04 | 8 | 2 | `mr04-mixed-divisibility`, `mr04-best-value` |
| QT-MR-14 Precision (cross-cutting) | MR-06 | 6 | 2 | `precision-dec`, `precision-frac` |
| **Total (sum of QT rows, cross-checked)** | | **141** | | matches production exactly |

Teaching maturity: 26 of 27 named families have MODEL/Guided/Remediation (Decision 62-63); only `mr05-number-property-search` (2 PE, TRANSFER-UNSAFE) does not.

**English — 9 named families + 1 legacy pool, 106 PE**, by Question Type:

| QT | Competency | PE | Families |
|---|---|---|---|
| QT-RC-01 Literal Short-Answer | RC-01 | 15 | `wave1-fam-direct-retrieval` (+legacy) |
| QT-RC-02 Yes/No + Justification | RC-02 | 14 | `wave1-fam-quote-explain` (+legacy); `wave1-fam-tick-justify` (11 more, **provisional**, not counted here) |
| QT-RC-03 Word/Phrase Meaning | RC-03 | 15 | `wave1-fam-vocab-explain` (shared with RC-05) (+legacy) |
| QT-RC-04 Synonym Substitution | RC-03 | 11 | `wave1-fam-synonym-battery` |
| QT-RC-05 Quotation-and-Explanation | RC-02 | 8 | `wave1-fam-vocab-explain` (shared) (+legacy) |
| QT-RC-06 Sequential Ordering | RC-04 | 15 | `wave1-fam-sequencing` |
| QT-RC-07 Multi-Entity Comparative | RC-01 | 7 | `wave1-fam-two-character` (+legacy) |
| QT-RC-08 List-N-Items | RC-01/02 | 12 | `wave1-fam-emotion-cause` (+legacy) |
| QT-RC-09 Multi-Select Tick-Box | RC-01 | 6 | `wave2-fam-multiselect` |
| QT-RC-10 Effect-of-Language | RC-02 | 3 | **0 dedicated** — all legacy |
| **Total** | | **106** | matches production exactly |

Teaching maturity: 8 of 9 reachable named families Founder-approved (Decision 64-65) for the remediation layer; `wave1-fam-tick-justify` blocked (provisional).

### B. Legacy ungrouped content

Mathematics: 32 rows (27 PE + 5 provisional), spanning 11 different QT codes, 0% `addresses_misconception`, `family_id: null`, `provenance: null`. English: 13 rows, all PE, spanning 7 QT codes, same characteristics. **Not force-classified into families in this document** — per the governing directive's own instruction, and consistent with every prior phase's treatment of this pool.

### C. Writing

1 row (`wrt-003`), provisional, genre-mismatched against real CSSE evidence (persuasive speech, not reflective/discursive or picture-narrative — Decision 66's own finding). Bounded teaching architecture exists for `writing-reflective-discursive` (Founder-approved, Decision 67); no content exists to attach it to.

### D/E. Practice vs. Mock

All 247 PE rows are Practice-only by construction (`eligibility_status` has never been promoted to `mock_eligible` for any row — confirmed live, 0 Mock Eligible). The Mock Content Firewall (Decision 59) structurally enforces `practice_eligible != mock_eligible` at every real Mock route.

### F. Historical evidence assets

17 Founder-Accepted primary knowledge assets remain the evidence base (2021/2022/2023 Entry English + Continuous Writing papers, marking schemes, the Information Guide) — unchanged, not re-acquired, still the foundation this document builds on (Part 2 below adds to it, does not replace it).

### English passage/exposure inventory (re-derived live, cross-checked against Decision 64's own finding)

19 distinct passages across all English rows (PE + provisional). **15 of 19 are shared across more than one family** (typically 6-7 families per passage), average 6.16 questions per passage. No passage-level exposure tracking exists for any named family (`groupingKeyOf()` falls back to passage id only when `family_id` is absent) — re-confirmed unchanged since Decision 64.

---

## Part 2 — CSSE evidence refresh

### What the repository already established (2026-08-11 to 2026-08-17, L1/L2, re-verified not re-derived)

Task structure (STABLE PATTERN, 3/3 years read: CSSE-004/009/014, 2021-2023 Entry): English 60 min + 10 min reading; 2 Continuous Writing prompts (Q1 reflective/discursive, Q2 picture-narrative), ≥6 sentences each, ~20 min suggested; Mathematics 60 min, no reading time; combined 120 marks, 50/50 age-standardised weighting, no offer below 303, no re-mark. Continuous Writing rubric: 4-band × 5-criterion (Ideas, Vocabulary+spelling, Grammar, Structure, Punctuation), Grammar populated Band 4 only. Double-marking + moderation, all 3 years.

### Current official evidence, freshly fetched this increment (2026-08-17)

| Finding | Source | Level | Confidence |
|---|---|---|---|
| English 60+10 min, Maths 60 min, 50/50 age-standardised weighting, no offer below 303, no re-mark, two separate written papers | `csse.org.uk`, live homepage + the currently-linked **CSSE Information Guide, 2027 Entry** (`csse.org.uk/storage/2026/03/CSSE-Information-Guide-2027-Entry.pdf`), test date 19 September 2026 | **L1** | HIGH — matches L2 evidence exactly, no conflict |
| "With effect from September 2024 (2025 Entry) the English paper does not contain Applied Reasoning questions" — direct quote | `csse.org.uk` homepage | **L1** | HIGH — directly, currently, officially stated. **Decision 58's classification is not merely unchanged but now more strongly evidenced than when it was made.** |
| The official Continuous Writing sample mark scheme (`csse.org.uk/examination/`, "Updated: 07.04.2020") is the **same document** the repository already holds as `CSSE-002`, and remains the live, current, officially-linked rubric | `csse.org.uk/examination/` | **L1/L2** | HIGH — resolves the Evidence Review's own flagged "undated, currency unconfirmed" gap |
| CSSE offers free, official "English/Maths Familiarisation Practice Paper" downloads (lawful, intended for public study) | `csse.org.uk/examination/`, linked PDFs | **L2** | The specific paper inspected is explicitly labelled "FOR FIRST USE FOR 2015 ENTRY" — **historical, not current** |
| That 2015-entry English familiarisation paper's structural skeleton: Section One Comprehension (~30 min, 40 marks across 14 questions, mixed tick-one/tick-multiple/short-written/word-selection-by-line-range formats), **Section Two Applied Reasoning (~10 min, 5 marks, letter-insertion and anagram-style puzzles)**, Section Three Continuous Writing (~20 min, separate booklet) | Direct structural inspection, no content reproduced | **L2, historical** | Confirms Applied Reasoning's real historical shape (letter/word puzzles, consistent with the repository's own AR-01 "Letter-Code Pattern Inference" competency) and the pre-2025 three-section structure — **superseded by the L1 finding above for current planning; retained only as historical corroboration of the QT taxonomy** |
| Age-standardisation: results analysed by date of birth; "in recent years, no such adjustment has been applied"; a modified approach was adopted from October 2018 following an Office of the Schools Adjudicator ruling | `csse.org.uk`, age-standardisation statement | **L1/L2** | Directly relevant to Part 13's readiness model: Angel must not assume a birth-month penalty/bonus exists in most years |
| 2026 key dates: registration 12 May–19 June 2026, test 19 September 2026, results 12 October 2026 | `csse.org.uk` | **L1** | Operationally relevant to any future "delayed report" timing design (Part 12), not to content |

**Secondary (L3) sources consulted, given no override authority:** several tuition-provider pages (Examberry, Atom Learning, elevenace.com, progress-academy.org.uk) broadly corroborate the 20-min/2-question Continuous Writing structure; one stated "15 marks" without the 2023 paper's own 20-mark update — an explicit example of why L3 is never trusted over L1/L2 evidence already held.

**No leaked, paywalled, or unlawfully-distributed material was sought or used.** No recent (2024/2025/2026 Entry) real past paper was found publicly available — CSSE does not appear to publish live past papers after the year they are sat, consistent with its own "no re-mark, joint policy not to release" posture. **This is recorded as a genuine limitation, not glossed over:** Angel's most recent real primary-source Continuous-Writing/English/Maths papers remain 2021-2023 Entry; nothing more recent could be lawfully obtained this session.

**Applied Reasoning, restated once more for absolute clarity given this document's own scope:** **HISTORICAL CSSE EVIDENCE, NOT CURRENT CSSE EXAMINATION CONTENT** (Decision 58, now with direct L1 corroboration). No Mock blueprint, no content authoring plan, and no Question Type target anywhere in this document includes Applied Reasoning as current.

---

## Part 3 — Historical exam pattern model

| Feature | Classification | Evidence |
|---|---|---|
| Two written papers, English + Mathematics, no Verbal/Non-Verbal Reasoning | STABLE | L1 (current), L2 (2021-2023) |
| English 60 min + 10 min reading; Mathematics 60 min | STABLE | L1, L2 |
| 50/50 standardised weighting; no offer below 303; no re-mark | STABLE | L1, L2 |
| Continuous Writing: 2 prompts, Q1 reflective/discursive, Q2 picture-narrative, ≥6 sentences, ~20 min | STABLE | L2 (3/3 years) |
| Continuous Writing double-marking + moderation | STABLE | L2 (3/3 years) |
| Continuous Writing total marks | VARIABLE (15 → 15 → 20 across 2021/2022/2023) | L2 |
| Content/SPAG numeric split | VARIABLE — only stated in the 2023 paper | L2 |
| English comprehension question format mix (tick-one, tick-multiple, short-written, word-selection-by-line-range, metaphor-identify-and-explain) | STABLE (present in both the 2021-2023 real papers already modelled by the repository's QT taxonomy, and the 2015 familiarisation paper) | L2 |
| Applied Reasoning (letter-insertion/anagram puzzles) | **DISCONTINUED** from September 2024 (2025 Entry) | L1 (current), L2 (historical presence confirmed) |
| Mathematics: no-calculator, ~20-21 exact-match questions, 60 marks | STABLE (repository's own prior finding, unchanged) | L2 |
| Prompt/passage topics | VARIABLE — no recurring theme across any year read | L2 |
| Age-standardisation adjustment | RARE — "in recent years, no such adjustment has been applied" | L1 |
| Grammar criterion below Band 4 (Continuous Writing rubric) | UNKNOWN — genuine, undisclosed-by-CSSE-itself gap | L2 |
| Mapping of the 5-criterion rubric onto the numeric mark split | UNKNOWN | L2 |
| Whether double-marking/moderation changes outcomes in practice | UNKNOWN | L2 |
| Future exam structure beyond 2027 Entry | **UNKNOWN FUTURE FEATURE** — CSSE states dates/arrangements are "correct at the time of publication" only | L1 |

**Do not pretend a stable pattern exists where evidence shows variation:** marks totals, the content/SPAG split, and topic selection are explicitly VARIABLE, not STABLE — any Mock blueprint (Part 9) must model these as ranges/distributions, never as fixed constants.

---

## Part 4 — Content depth model (objective questions only; Writing modelled separately, Part 7)

**Methodology, stated explicitly (this entire Part is L4/L5 — Angel's own educational-design reasoning, not CSSE-evidenced):** for each Question Type, current supply is assessed against three thresholds: **Minimum Safe** (enough distinct structural variation across ≥2 genuinely different families, with at least a partial EASY/HARD spread, that a learner cannot memorise the pool within a few sessions); **Target Sustained** (enough for weeks/months of use without noticeable repetition, given the existing question-level cooldown mechanism); **Stretch** (a fuller difficulty ladder and far-transfer coverage). Families that are "numbers-only variants of one template" (already named in Decision 62-63: `mr03-mixed-perimeter`, `mr02-sum-difference`, `precision-frac`, etc.) do not count toward genuine structural variety even where their raw sibling count looks adequate — this is explicitly factored into the Minimum Safe figures below, which are higher for QTs whose only depth is numeric.

### Mathematics (14 QTs)

| QT | Current PE | Current Fams | Min Safe | Target | Rationale |
|---|---|---|---|---|---|
| MR-01 Direct Arithmetic | 14 (all legacy) | 0 dedicated | 18 | 24 | Highest-evidence QT (Assessment Brain HIGH/EMC-3-4) with **zero family structure** — the single highest-priority gap in the whole Mathematics estate |
| MR-02 Missing-Operand | 4 | 1 | 8 | 12 | Single family, thin |
| MR-03 Unit Conversion | 5 | 1 (+legacy) | 8 | 12 | Single family, thin |
| MR-04 Percentage/Proportional | 16 | 3 (+legacy) | 18 | 26 | Reasonable family count; needs EASY tier |
| MR-05 Sequence/Function-Rule | 15 | 2 | 18 | 24 | Reasonably developed; needs HARD/far-transfer tier |
| MR-06 Algebraic Symbol/Unknown | 17 | 4 (+legacy) | 20 | 28 | Broadest MR-02 QT; needs EASY tier |
| MR-07 Geometric Angle/Shape | 20 | 4 (+legacy) | 20 | 28 | Good family count; `mr03-mixed-perimeter` thin/templated |
| MR-08 Coordinate/Transformation | 3 | 1 | 8 | 14 | Thinnest single-family QT; real depth risk (already flagged) |
| MR-09 Data Reading | 6 | 1 (+legacy) | 10 | 15 | Thin |
| MR-10 Elapsed-Time | 6 | 1 (+legacy) | 10 | 15 | Thin, uniform template |
| MR-11 Number-Property | 16 | 4 (+legacy) | 18 | 26 | `-search` sub-family needs +3-4 siblings to exit TRANSFER-UNSAFE |
| MR-12 Average (Mean) | 5 | 1 (+legacy) | 8 | 12 | Thin |
| MR-13 Best-Value/Combinatorial | 8 | 2 | 14 | 20 | Moderate |
| MR-14 Precision (cross-cutting) | 6 | 2 | 10 | 16 | Thin, no round-down/non-improper-fraction variants |
| **Mathematics total** | **141** | **27** | **≈188** | **≈272** | |

**Difficulty spread finding, precise:** of 27 named families, only `mr02-sequence-rule` (5 easy/5 medium), `mr03-angle-sum` (4 easy/3 medium), and `mr05-number-property` (5 easy, 100%) contain any `easy` rows; only `mr02-substitution` (5 hard, 100%) contains any `hard` rows. **Every other named family is 100% `medium`.** No family anywhere has 3+ genuine difficulty tiers. This is the single most severe, most quantifiable gap in the entire Mathematics estate.

### English (10 QTs)

| QT | Current PE | Min Safe | Target | Rationale |
|---|---|---|---|---|
| RC-01 Literal Short-Answer | 15 | 18 | 24 | Largest family already; passage-diversity-limited more than count-limited |
| RC-02 Yes/No + Justification | 14 (+11 provisional) | 20 | 30 | Activating `tick-justify` (governance action, not authoring) adds 11 for near-free |
| RC-03 Word/Phrase Meaning | 15 | 16 | 22 | Shared family with RC-05 |
| RC-04 Synonym Substitution | 11 | 14 | 18 | Single family |
| RC-05 Quotation-and-Explanation | 8 | 12 | 16 | Shares supply with RC-03's family |
| RC-06 Sequential Ordering | 15 | 16 | 22 | Reasonably developed |
| RC-07 Multi-Entity Comparative | 7 | 12 | 16 | Thin (already flagged GAP) |
| RC-08 List-N-Items | 12 | 14 | 20 | Moderate |
| RC-09 Multi-Select | 6 | 10 | 14 | Thin (already flagged GAP) |
| RC-10 Effect-of-Language | 3 (all legacy) | 12 | 18 | **Zero family structure** — mirrors Mathematics MR-01's exact gap shape |
| **English total** | **106** | **≈144** | **≈200** | |

**English's dominant constraint is passage supply, not raw question count** (Part 5) — the Target figures above assume the passage estate expansion in Part 5 happens in step, not independently.

### Combined objective-question estate

| | Current | Minimum Safe | Target Sustained | Stretch |
|---|---|---|---|---|
| Mathematics | 141 | ≈188 | ≈272 | ≈300-320 (full difficulty ladder + far-transfer on every QT) |
| English | 106 | ≈144 | ≈200 | ≈230-250 (full passage-diversity target reached) |
| **Combined objective total** | **247** | **≈332** | **≈472** | **≈530-570** |

**Does the previously-discussed 400-500 range survive this analysis? Yes, with a specific correction, stated honestly:** the evidence-grounded Target Sustained figure lands at **≈470-480 objective questions**, near the top of the previously-discussed range, not its midpoint — driven primarily by Mathematics' MR-01 structural gap and the near-total absence of any difficulty tier anywhere in the bank, not by a need for more raw volume in already-developed QTs. **This is Angel's own analytical judgement (L4/L5), not a CSSE-evidenced number** — no official CSSE source states how many questions a preparation platform needs. If Founder/Product leadership wants a tighter number for planning purposes, **472 is the defensible central estimate this document produces**; 332 is the floor below which real anti-memorisation risk re-emerges (per Decision 62-64's own findings), and 550 is a ceiling beyond which returns diminish relative to authoring cost.

---

## Part 5 — English passage estate

**Current: 19 passages, all narrative fiction or personal-letter register, 15 shared across multiple families, 6.16 questions/passage average.** This is confirmed, not assumed (Decision 64, re-verified fresh Part 1 above).

**Genre inclusion, CSSE-evidenced only:** the repository's own primary-source reading (17 Founder-Accepted assets) found narrative fiction and personal-letter forms directly evidenced; **no non-fiction/informational-text genre has been found in any real CSSE paper read for this programme.** This document does **not** recommend adding non-fiction/informational passages on the strength of "other 11+ platforms do it" — that is explicitly the wrong basis (Part 5's own governing instruction). **Recommendation: retain narrative fiction and letter/personal-account registers as the primary genres; do not add a genre CSSE evidence does not support**, pending any future primary-source finding that changes this.

**Target passage estate:**

| Metric | Current | Target | Rationale |
|---|---|---|---|
| Distinct passages | 19 | **45-55** | Roughly 2.5-3x current, driven by the anti-memorisation finding below, not a round number |
| Questions per passage | 6.16 avg | **3-4** | Reduces per-passage "mining" — a learner who has read a passage once should not encounter it from 6-7 different angles |
| Passage reuse ceiling (families drawing on one passage) | up to 7 | **≤2-3** | Directly closes the "15 of 19 shared across many families" finding |
| Cross-family reuse policy | none (implicit, high) | **Explicit cap**: a passage may support at most 2 families sharing genuinely distinct skill demands (e.g. one retrieval-type QT + one inference-type QT), never the current pattern of 6-7 unrelated QTs drawing on one text | New content-governance rule, not a code change |

**Resolving the passage-level exposure gap (Decision 64's own finding), design only, not implemented in 007R:** `groupingKeyOf()` (`lib/ali/exposureIntelligence.ts`) currently falls back to `learningUnitId` only when `familyId` is absent — every named English family has a `familyId`, so passage identity is invisible to both the within-session diversity mechanism and the cross-session cooldown. **Recommended design (for a future implementation increment):** extend `computeFamilyExposure`/`classifyRetrievalStage` to track a **second, independent exposure dimension keyed by `learning_unit_id`**, alongside (not replacing) the existing family-keyed dimension — a session generator would then need both dimensions to be genuinely fresh, not just one. This is a change to shared, subject-agnostic selection code (also touched by Mathematics and every other pathway), so it must be scoped, tested, and reviewed as its own bounded increment, not folded into a content-authoring phase.

---

## Part 6 — Mathematics depth

**Transfer-limited/thin families, restated from Decision 62-63 (14 of 22 Phase B families TRANSFER-LIMITED):** `mr01-data-table`, `mr02-compare`, `mr02-far-ratio-context`, `mr02-sum-difference`, `mr03-classify`, `mr03-coordinate`, `mr03-mixed-perimeter`, `mr04-far-percent`, `mr04-far-recipe`, `mr04-mixed-divisibility`, `mr05-constrained-multiple`, `mr05-factors-primes`, `precision-dec`, `precision-frac`. Plus the pre-Phase-B QT-MR-01/MR-08 structural gaps (Part 4).

**What additional content should provide, per family, drawing directly on each family's own disclosed limitation (Decision 62's Part 7):**

| Limitation type | Families affected | What closes it |
|---|---|---|
| Disguised clone set (identical template, numbers only) | `mr03-mixed-perimeter`, `mr02-sum-difference`, `precision-frac` | A genuinely different problem structure within the same competency (e.g. `mr03-mixed-perimeter`: perimeter→area the *other* direction, non-integer division) |
| Too few siblings to demonstrate transfer (3) | `mr02-compare`, `mr02-far-ratio-context`, `mr03-classify`, `mr03-mixed-perimeter`, `mr04-far-percent`, `mr04-far-recipe`, `mr04-mixed-divisibility`, `mr05-constrained-multiple` | More siblings, but structurally varied, not just re-numbered |
| Bimodal family diluting transfer signal | `mr05-factors-primes` | Consider splitting into two families (factor-count vs. primality), already flagged in Decision 62 |
| No round-down/non-improper-fraction case | `precision-dec`, `precision-frac` | Targeted variant authoring |
| Zero family structure | QT-MR-01 (Direct Arithmetic), QT-MR-08's own thinness | Classify the legacy pool into real families (a content-governance step) before further teaching-architecture work |

**Reverse reasoning / missing-information / unfamiliar-context / mixed-competency / constraint reasoning, mapped to the existing 9-dimension difficulty framework (`ANGEL_007K_MATHEMATICS_DEPTH_AND_BATCH4_READINESS_V1.md` Part 6, adopted here, not reinvented):**

| Dimension | EASY | EXAM-STANDARD | HARD/CHALLENGE |
|---|---|---|---|
| Reasoning steps | 1 step | 2 steps (today's actual ceiling for every named family) | 3+ steps, or a 2-step problem where the second step's setup isn't obvious |
| Hidden operation | Operation named/obvious | Operation implied but standard | Operation inferred from a relationship, not a keyword |
| Representation change | Single representation | One conversion | Multiple representations combined |
| Distractor strength | Careless-error trap | Named misconception (true of every family today) | Plausible partial success — real reasoning, stopped one step early |
| Transfer distance | ROUTINE | NEAR/MIXED | FAR, stacked with a second competency |
| Irrelevant information | None | None (true of every family today) | At least one genuine distractor number |
| Reverse reasoning | Forward only | Occasional | Systematic — working backward is the primary demand |
| Combined concepts | One competency | One primary + one supporting | Two competencies requiring genuine integration |
| Time-pressure suitability | Rapid-fire drilling | Standard timed practice | Exam-condition practice only |

**This becomes the practical authoring standard, replacing the single `content_difficulty` label, by composite rule:** a question is `EASY` if it scores EASY on at least 6 of 9 dimensions and no dimension above EXAM-STANDARD; `HARD/CHALLENGE` if it scores HARD on at least 4 of 9 dimensions; `EXAM-STANDARD` otherwise. **Not implemented in 007R** — this is the design a future authoring/labelling increment should apply, replacing ad hoc manual labelling.

---

## Part 7 — Continuous Writing completion (counted separately from the objective-question estate)

**Two evidenced task structures only** (Part 2): reflective/discursive (built, Founder-approved, Decision 67) and picture-narrative (deferred — needs an original, non-copyrighted image asset, a genuinely separate content-sourcing step).

| Requirement | Reflective/Discursive | Picture-Narrative |
|---|---|---|
| Prompts required | 8-12 | 8-12 (once image sourcing resolved) |
| Variation dimensions | topic, viewpoint (for/against, personal/observed), constraint (sentence-count target varying around the evidenced 6-sentence minimum) | topic (image subject), tone, viewpoint (character focus), stimulus |
| MODEL supply | 1 exists (Founder-approved); 2-3 total recommended for variety | 0 — needs first authoring once family exists |
| Guided planning supply | 1 scaffold exists; family-specific, not per-prompt | 0 — needs its own scaffold (different genre, different planning questions) |
| Independent task supply | Same pool as above | Same |
| Timed task supply | 0 — design exists (Part 9 of the Phase D standard), not built | 0 |
| Remediation | Category taxonomy exists (Angel-designed, not CSSE-evidenced beyond the 5 dimensions) | Needs its own misconception evidence base |
| Rubric | CSSE-evidenced 5-dimension rubric, built and Founder-approved | Same rubric applies (not genre-specific) |
| Calibration requirement | Re-run live calibration (`scripts/writing-rubric-calibration.mjs`) against each new prompt before any Practice exposure | Same, plus a first calibration pass once the family exists |

**`wrt-003` (the genre-mismatched persuasive-speech row): recommendation, not actioned in 007R.** Two legitimate options for a future content-governance decision: (a) **retire** it from the CSSE Writing pipeline (it does not represent either evidenced genre, and keeping it risks a future session mistaking it for real CSSE-shaped content) while optionally preserving persuasive writing as a clearly-labelled *non-CSSE* general writing-skill exercise elsewhere (e.g. the legacy `/writing` route, which already has no CSSE-fidelity claim); or (b) **leave it as-is, provisional, unreferenced** until a future increment makes an explicit decision. This document does not decide between them — that is a Founder/Product call, and `wrt-003` is **not activated, reclassified, or rewritten by this document**.

---

## Part 8 — Mock content firewall (architecture recommendation)

**Recommended architecture: (A) exclusively Mock-reserved, not (B) generated from protected Practice families, not (C) purely dynamic, not (D) hybrid** — with justification:

- **(B) is rejected outright**: generating Mock items from families a learner may have already drilled in Practice is precisely the "Practice leaking into Mock" failure Decision 49 and the Mock Content Firewall (Decision 59) already exist to prevent. Even a parameterised regeneration from the same underlying family risks a learner recognising the structure.
- **(C) pure dynamic generation is rejected as the sole mechanism**: real-time generation with no human review queue would violate Part 8's own instruction that generated content must pass deterministic, educational, provenance, and human-review gates *before* learner exposure — a live Mock sitting cannot wait for that pipeline.
- **(D) hybrid is rejected as the primary architecture, but its idea is folded into (A):** a genuinely sealed reserve does not preclude *controlled, offline* generation feeding that reserve — the distinction that matters is not "human-authored vs. AI-assisted" but **"reviewed and sealed before exposure" vs. "exposed on the fly."**

**Recommended: (A) — a sealed, exclusively Mock-reserved content pool**, populated on a slower cadence than Practice (by human authoring, AI-assisted authoring, or structural transformation of *retired* Practice content that has been withdrawn from Practice first), every item passing the full gate list below before `eligibility_status` (or a successor field, see below) may ever be set to `mock_eligible`:

| Gate | What it checks |
|---|---|
| Blueprint fit | Item maps to a real cell in the evidence-based blueprint (Part 9) — competency, QT, difficulty band |
| Originality | Not derived from, or overlapping with, any live Practice item |
| Correctness | Independently re-derived answer, matching Mathematics' own `checkMathsAnswer` discipline |
| Ambiguity | No reasonable alternative correct answer the key doesn't accept |
| Difficulty calibration | Matches its claimed band on the 9-dimension framework (Part 6) |
| Exposure history | Never shown to any learner in any context before its first Mock use |
| Content freshness | Version-tracked; a "used" Mock item is retired from the active reserve, not silently reused indefinitely |
| Teaching leakage | Not mirrored by any MODEL/worked-example content a learner could have memorised |
| Family duplication | Not a near-duplicate of another reserved item (structural similarity check) |
| Passage exposure (English) | Passage not shared with any Practice passage the learner pool has seen |
| Human review | Same append-only, Founder-reviewable pattern already proven for `content_review`/teaching reviews |
| Provenance | `angel_original` or `evidence_only`-derived, never `null` |
| Versioning | Content-version tracked exactly as `ali_question_bank.content_version` already does |

**On the existing `eligibility_status` field:** it is **sufficient as the mechanism** (it already has a `mock_eligible` value, migration 030, and the firewall already checks it structurally) — what is missing is not a new field but the **governed pipeline that populates it**, which does not yet exist. No new database field is recommended by this document; the gap is process, not schema.

---

## Part 9 — Mock Intelligence Engine (design)

**Inputs:** current official CSSE blueprint (Part 3's STABLE/VARIABLE model, kept current via Part 10's cycle); historical examination evidence (L2); competency weights (from the Assessment Brain's own EMC ratings); Question Type weights (derived from observed frequency where evidenced, otherwise an even distribution disclosed as such); difficulty distribution (the 9-dimension framework, Part 6); timing (Part 2's L1 figures); passage requirements (Part 5); Writing task structure (Part 7); learner exposure history (existing `ali_student_question_history`); content freshness (Part 8's versioning); Mock history (which forms a learner has already sat); security/reservation rules (Part 11).

**Outputs:** a **Mock specification** (the blueprint instance for this sitting — how many items per QT, difficulty distribution, timing); a **selected/generated item manifest** (the actual reserved items drawn, versioned); a **blueprint coverage report** (does the manifest actually match the specification, computed not asserted); a **difficulty profile** (the realised difficulty mix vs. the target); a **timing profile**; a **uniqueness/freshness report** (has any item in this manifest been used in a prior sitting for this learner, or recently for any learner); a **validation status** (PASS/FAIL against every Part 8 gate, before the sitting is permitted to start).

**AI's role, precisely bounded:** AI may assist in (a) interpreting the blueprint into a candidate specification, (b) generating candidate items or structural transformations for the human-review queue, (c) drafting difficulty/calibration estimates for human confirmation. **AI may never**: select the final manifest for a live sitting without the deterministic validation status passing; mark anything `mock_eligible` directly; or be exposed as a concept to the learner or parent (Founder AI Principle, restated — no "AI-generated Mock," "AI prediction," or "AI scoring" language anywhere in the child/parent-facing product).

---

## Part 10 — Recent-exam intelligence (annual evidence cycle, design)

```
NEW OFFICIAL INFORMATION (each September, post-sitting)
  → EVIDENCE CAPTURE (the current Information Guide, any updated familiarisation
       material, any new official mark-scheme publication — csse.org.uk checked
       annually, not continuously)
  → CHANGE DETECTION (diff against the last captured version — e.g. the exact
       change this document's Part 2 found: AR removed from September 2024)
  → BLUEPRINT COMPARISON (does the change affect Part 3's STABLE/VARIABLE model?)
  → EDUCATIONAL REVIEW (Founder confirmation the change is real and should be
       adopted — mirrors Decision 58's own precedent exactly: repository evidence
       flagged a possible change, the Founder's own current knowledge confirmed it)
  → MOCK MODEL UPDATE (the blueprint used by Part 9's engine is versioned and
       updated, never silently)
  → VALIDATION (a bounded re-verification that existing Mock content still fits
       the updated blueprint)
  → VERSION FREEZE (the new blueprint version is dated and recorded, exactly
       like `MATHS_TEACHING_CONTENT_VERSION`'s own precedent)
```

**Secondary post-exam intelligence (pupil recollections, tutor commentary, online discussion):** may be captured as a **flagged, unverified signal** for a human reviewer to investigate — **never** treated as fact, never silently changing any Mock model. This mirrors the exact discipline this whole programme has applied to L3 sources throughout: informative, never authoritative, never able to override L1/L2 evidence on its own.

---

## Part 11 — Mock generation and security (design)

**Recommended approach:** parameterised structural templates (a proven family's *shape*, re-authored with genuinely new numbers/context, verified by independent recomputation — exactly Mathematics' own `007l-model-verification.mjs` discipline, extended) plus controlled generative assistance for first-draft variation, both feeding the Part 8 review queue, never bypassing it. **Duplicate/semantic-similarity detection** (a Jaccard-style check, the same bounded technique already proven in `writingRubric.ts`'s `looksLikeTemplateOrCopied`, extended to objective items) runs before any item enters the reserve. **Answer recomputation and distractor validation** mirror Mathematics' existing `checkMathsAnswer`/`parseNumberWithUnit` discipline exactly — no new validation philosophy needed, the existing one extended to Mock-reserved content.

**Mock forms:** recommend **FORM A / FORM B / FORM C** (a small, named set of distinct blueprint-conformant manifests) rather than a fully unique-per-sitting generation model initially — this is more auditable, easier to validate against Part 8's gates exhaustively, and matches how real exam boards manage question-paper variants. **How many fresh full Mock experiences should Angel support:** a defensible starting target is **6 non-repeating full sittings per pathway year** (roughly one every 6-8 weeks across a typical preparation year), requiring a reserve sized at approximately 6× one sitting's blueprint requirement with a safety margin for retirement — this is a planning estimate (L5), not a fixed requirement.

---

## Part 12 — Mock assessment reporting lifecycle (design)

```
1. MOCK STARTED           — automatic
2. MOCK IN PROGRESS       — automatic (autosave, no hints, matches Decision 49)
3. MOCK SUBMITTED         — automatic (or time-expiry auto-submit, unanswered
                              items marked not silently dropped)
4. ANSWERS LOCKED         — automatic, immutable from this point
5. DETERMINISTIC MARKING  — automatic (objective items only — Mathematics'
                              existing checkMathsAnswer-equivalent discipline)
6. WRITING ASSESSMENT /
   VALIDATION             — AI-assisted, REQUIRES validation (Part 4/5 of the
                              Phase D standard's own confidence-gate discipline,
                              extended) — never auto-released
7. QUALITY CHECK          — REQUIRES human/automated-gate validation (does the
                              realised result look internally consistent? e.g. a
                              98% objective score with a 12% Writing score
                              should flag for review, not auto-release)
8. DIAGNOSTIC PROCESSING  — automatic, once stage 7 passes
9. READINESS CALCULATION  — automatic, once stage 8 completes (Part 13's model)
10. REPORT READY           — a governed state, not learner-visible yet
11. REPORT RELEASED        — the only stage that makes results visible
```

**The child may receive a neutral completion confirmation immediately after stage 3/4** ("Your Mock has been submitted — your results will be ready soon"), matching the Founder's explicit instruction. **Nothing else** (answers, diagnostic weaknesses, readiness prediction, parent report, Writing judgement, revision plan) is exposed before stage 11.

**Child vs. parent reporting surfaces, distinct by design:** the child's surface emphasises what to practise next (encouraging, action-oriented, no raw percentile/prediction language); the parent's surface carries the fuller diagnostic and readiness picture (Part 13), including the explicit uncertainty boundaries — mirroring the existing `ReadinessSummary`/`DiagnosticOverview` pattern that already serves both audiences differently elsewhere in the product.

---

## Part 13 — Readiness and prediction standard

**Explicitly separated, never collapsed into one percentage:**

| Concept | What it measures | Evidence basis |
|---|---|---|
| **Mastery** | Per-competency, from `lib/ali/mastery.ts`'s existing, unmodified evidence rules (independent-only, `distinctCorrectSessions`) | Angel's own evidence pipeline, already proven |
| **Exam Readiness** | Coverage completeness × mastery breadth × recency — "has this child been taught and evidenced across the real blueprint" | Angel-derived, evidence-quality-labelled |
| **Mock Performance** | A specific sitting's realised score/profile against that sitting's blueprint | Deterministic (objective) + validated (Writing) |
| **Projected Performance** | A trend across repeated Mock sittings — direction and confidence interval, not a point estimate | Requires ≥2-3 genuine Mock sittings before this has any statistical basis at all — **not available from a single sitting** |
| **Admissions Outcome** | Whether a specific child will be offered a place | **Angel cannot and must not predict this.** It depends on the cohort's own performance that year (303 is a *historical* floor, not a guaranteed one, per `csse.org.uk`'s own "no guarantee of a place based on historical information" statement, L1) |

**"Predicted score" must not be introduced until calibration evidence justifies it** — per the Founder's own explicit instruction, restated here as a hard gate: no numeric admissions-outcome prediction may ship until (a) enough real Mock sittings exist to compute genuine calibration (not currently possible — Mock Eligible is 0), and (b) a separate, explicit Founder decision authorises it, given the stakes of a wrong signal to a real family.

---

## Part 14 — Exam simulation standard

| Term | Definition | Timing fidelity | No-hints | Formal record |
|---|---|---|---|---|
| **Practice Test** | A short, untimed or lightly-timed set of objective items | None required | No (MODEL/Guided available) | No |
| **Timed Assessment** | A practice set under a suggested time, still Practice | Approximate | No | No |
| **Mini Mock** | A single-subject, shortened, blueprint-conformant set | Proportional | Yes | Optional |
| **Full Mock** | Both subjects, full blueprint, full timing (60+10 / 60), Continuous Writing included | Exact (L1-evidenced) | Yes | Yes, governed lifecycle (Part 12) |
| **Diagnostic Mock** | A Full Mock explicitly framed as a baseline, not a graded sitting | Exact | Yes | Yes, but framed differently to the family |

**Not all timed question sets may be labelled "Mock"** — only Full Mock and Diagnostic Mock carry the real exam-fidelity claim (timing, no-hints, sealed content, governed reporting). Mini Mock and Timed Assessment are legitimate product surfaces but must never borrow the word "Mock" loosely.

---

## Part 15 — Commercial differentiation (evidence-supportable only)

Legitimately defensible, given what this document establishes: **evidence-based blueprinting** (Part 9, genuinely CSSE-evidenced, not a generic 11+ template); **content freshness** (Part 11's reserve-and-retire model, a real technical property competitors researched in Phase C's own competitive review were not found to offer); **delayed, governed reporting** (Part 12, a genuine product decision most consumer-facing tools skip for engagement metrics — defensible as *more honest*, not merely different); **teaching linked directly to Mock findings** (the DIAGNOSE→TARGETED TEACHING loop, Part 3 of the Phase D standard, extended to Mock's own diagnostic output); **annual CSSE evidence refresh** (Part 10, a genuine operational commitment, not a one-time claim). **Not recommended as a claim:** predictive accuracy of any kind (Part 13 explicitly forecloses this until real calibration exists) or "AI-powered" framing (the Founder's own AI Principle explicitly prohibits surfacing this to families).

---

## Part 16 — Other selective pathways (reconfirmed, not expanded)

| Pathway | Status | What would be required later |
|---|---|---|
| GL | Pathway-selector plumbing only; a legacy 743-line Mock route uses the unfirewalled `fetchQuestionBank()` (Decision 64's own re-confirmation: not currently exploitable, no `"gl"`-tagged content exists) | The same 4-work-package evidence process CSSE went through (Assessment Structure → Competency Framework → Question Intelligence → consolidated Brain), independently sourced |
| CEM | Pathway-selector plumbing only | Same |
| ISEB | Pathway-selector plumbing only | Same |
| Independent | Pathway-selector plumbing only | Same |

**CSSE remains the first deep pathway.** No pathway work is authorised or begun by this document.

---

## Part 17 — Completion programme (recommended sequence)

**This sequence intentionally reorders the old Phase E-onward plan** where this strategy's own evidence supports a better order — specifically, it interleaves Mock-firewall and passage-exposure work *before* bulk content authoring, since authoring against an unfixed firewall or an unfixed exposure model would need partial rework later.

| # | Objective | Why now | Input | Output | Human review gate | Production change | Acceptance evidence | Dependencies | STOP condition |
|---|---|---|---|---|---|---|---|---|---|
| 1 | Passage-level exposure tracking (Part 5) | Cheapest structural fix with the highest anti-memorisation payoff; must exist before mass passage authoring so new passages inherit real protection | `lib/ali/exposureIntelligence.ts` | Extended dual-dimension exposure model | Founder review of the design before implementation | Code change, no content | Regression suite + a live multi-session walkthrough | None | Ship, verify, stop before content work |
| 2 | Mathematics QT-MR-01/QT-MR-08 family classification | Closes the two structural (zero-family) gaps before further depth authoring | Legacy pool | 2-3 new real families (classification, not new content) | Founder | Content-governance | Existing review pipeline | None | Stop before authoring new questions into them |
| 3 | Difficulty-tier authoring pass, Mathematics (Part 6 standard) | The single most quantifiable gap; the framework already exists, unused | 9-dimension framework | EASY/HARD variants for the thinnest, most evidence-worthy QTs first | Founder, per-batch (mirrors Batches 1-4) | Content | Existing review pipeline + `007l-model-verification.mjs`-style collision checks | #2 for MR-01 specifically | Stop after each batch |
| 4 | English passage expansion (Part 5 target) | Directly closes the highest-severity English finding | Genre-constrained sourcing | 25-35 new passages, capped reuse | Founder, per-batch | Content | Existing review pipeline | #1 (exposure tracking should exist first) | Stop after each batch |
| 5 | Mathematics/English transfer-depth authoring to Target figures (Part 4) | Completes the objective estate toward ≈472 | Parts 4/6 models | Remaining question volume | Founder, per-batch | Content | Existing pipeline | #2, #3, #4 | Stop after each batch; do not rush to a round number |
| 6 | Continuous Writing supply (Part 7) | Second evidenced genre + prompt variety, now that the architecture is proven | Phase D architecture | 8-12 reflective/discursive prompts; picture-narrative once image sourcing resolved | Founder, mirrors Writing Teaching Review | Content, provisional only until reviewed | Live calibration re-run per new prompt | Phase D (closed) | Stop before Mock reservation |
| 7 | `wrt-003` disposition | Small, bounded governance decision | Part 7's own two options | Retire or leave provisional | Founder decision | Governance only | N/A | None | N/A |
| 8 | Mock Content Firewall governed pipeline (Part 8) | Must exist before any Mock content is authored | Part 8 | The gate pipeline itself (process + review UI, not content) | Founder | Code/process | New review-pack pattern, mirroring Teaching Review precedent | #1-7 substantially complete | Stop before populating the reserve |
| 9 | Mock Intelligence Engine (Part 9) | The assembly logic, built against a real (if initially small) reserve | Part 9 | Specification/manifest/coverage-report engine | Founder | Code | Bounded proof against a small reserve | #8 | Stop before a live sitting |
| 10 | Mock reserve population | Bulk, but sealed, authoring | Parts 8/9/11 | The actual Mock item pool | Founder, batch-by-batch | Content, `mock_eligible` only after full gate pass | Per-batch review | #8, #9 | Stop after each batch |
| 11 | Mock lifecycle + delayed reporting (Part 12) | Needed before any real sitting can be offered | Part 12 | The stage-gated flow | Founder | Code | End-to-end walkthrough with a real profile | #9, #10 | Stop before opening broadly |
| 12 | Readiness intelligence (Part 13) | Needs real Mock data to have any basis | Part 13 | Mastery/Readiness/Mock-Performance surfaces, no prediction yet | Founder | Code | Verified against real (not synthetic) data | #11, several real sittings | Stop before any "projected performance" claim |
| 13 | Exam simulation fidelity audit (Part 14) | Confirms Full Mock genuinely matches L1 timing/structure | Part 14 | Verified sitting | Founder | Verification only | Direct comparison against Part 2's L1 findings | #11 | N/A |
| 14 | End-to-end verification (mirrors old Phase I) | The programme's own natural closing gate | All of the above | A full, real-learner, real-timing simulation | Founder, final sign-off | None (verification) | Full loop walkthrough | Everything above | Programme's natural end |
| 15 | Parent/child UX and visual/product experience audit | Deliberately last — redesigning before the underlying features are real risks designing for the wrong shape | Everything above | Visual/product findings | Product leadership | Separate track | Set by that audit | Functional completeness | Set by that audit |

---

## Part 18 — Readiness regrading (post-investigation, pre-implementation)

| Area | Grade | Evidence |
|---|---|---|
| Mathematics Teaching | **A-** | 26/27 families Founder-approved (Decision 62-63); architecture proven; only 1 family excluded (TRANSFER-UNSAFE, correctly) |
| Mathematics Practice | **C+** | 141 PE, real QT breadth, but MR-01 has zero family structure and 100% of families are single-difficulty-labelled |
| English Teaching | **A-** | 9/9 reachable families Founder-approved (Decision 64-65); remediation now live for all |
| English Practice | **C** | 106 PE, broad QT coverage, but passage supply (19, 15 shared) is the most severe single content gap in the whole estate |
| Continuous Writing | **D+** | Architecture proven and Founder-approved (a real jump from Phase A/C's "NOT READY"), but 0 Practice Eligible content, one genre built of two, no timed stage |
| Mock | **F** (unchanged) | 0 Mock Eligible; no governed pipeline exists yet; this document is the first real architecture for it |
| Readiness Intelligence | **D** | Substantial existing parent/child infrastructure (7 routes), but no genuine Mock-based readiness signal can exist while Mock Eligible is 0 |
| Parent Experience | **B-** (unconfirmed depth) | Real, non-trivial implementation exists; not independently re-audited this session |
| Child Experience | **B-** (unconfirmed depth) | Same basis |
| CSSE Evidence Fidelity | **A** | Strongest area of the whole programme — every major claim now traces to L1/L2 evidence, cross-verified twice this year (Phase D, this document) |
| Anti-Memorisation | **C-** | Question-level cooldown genuinely proven; family-level diversity proven; passage-level exposure genuinely absent (a real, quantified gap, not a suspicion) |
| Sustained Practice Depth | **C** | 247 PE is real content, not padding, but Part 4's own modelling shows the honest target is ≈472, meaning today's estate is at roughly 52% of a defensible sustained-practice target |
| **Overall CSSE Preparation Readiness** | **C+** | Genuinely strong teaching architecture and evidence discipline (rare among 11+ platforms per Phase C's own competitive review), materially incomplete content depth and a wholly unbuilt Mock system — an honest, not inflated, mid-programme grade |

**Grades are not inflated because architecture exists without learner supply** — Continuous Writing's D+ (not higher) and Mock's unchanged F are the clearest examples: real, Founder-approved design work exists for both, but neither has meaningful learner-facing supply yet, and the grade reflects that honestly.

---

## Governance

No new `ali_family_review` row, migration, or `ali_question_bank` change was made by this document. No decision requiring database-state freezing was established — this is a strategy/architecture document, not an implementation. `ALI_DECISION_LOG.md` is not updated by this increment; the next governance decision belongs to whichever future increment begins implementing this strategy's programme (Part 17).
