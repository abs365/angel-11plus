# Angel 11+ — CSSE Completion Programme V1
## Educational Completion Baseline and Execution Roadmap

**Status:** Baseline reconciliation and roadmap only. No implementation performed. Prepared for Founder and Product leadership review per the Angel 11+ Completion Programme directive.
**Date:** 2026-08-16
**Scope:** CSSE Essex only, matching `docs/intelligence/ASSESSMENT_BRAIN_V1.md`'s own scope boundary. GL/CEM/ISEB/Independent are audited (Part 6) but not brought into scope by this document.
**This is the one canonical completion document.** It does not replace `ALI_DECISION_LOG.md` (decision history), `ASSESSMENT_BRAIN_V1.md` (frozen exam-evidence brain), or any existing increment report — it sits above them as the roadmap that reconciles what they already established.

---

## 0. How this document was produced

Every count in this document was queried fresh from the live production database (`ali_question_bank` via the anon-key REST path, the same method every prior increment in this project has used) or read directly from the cited source file, on 2026-08-16. Where the database is RLS-opaque to the anon key (`ali_family_review`), this is stated as a limitation, not inferred past. Nothing here is carried forward from memory of a prior session without being re-checked.

---

## 1. Repository and production baseline

**Git:** `main`, commit `63ee07d`, clean working tree, in sync with `origin/main`.

**Production question bank counts (queried fresh):**

| Metric | Count |
|---|---|
| TOTAL | 264 |
| Practice Eligible | 247 |
| Mathematics Practice Eligible | 141 |
| English Practice Eligible | 106 |
| Provisional | 17 |
| Mock Eligible | 0 |
| Independently Validated | 0 |
| Writing (any status) | 1 (provisional, 0 practice-eligible) |

Byte-identical to the baseline stated in the directive. No drift.

**Tests / build:** `npm test` 254/254 PASS. `tsc --noEmit` 0 errors.

**RLS limitation, reported not inferred:** `ali_family_review` (the human-review decision table) returns `200` + `[]` for every anon-key query, per this project's own established Decision 48 discipline — this is not evidence the table is empty, only that the anon key cannot see it. Every review-completion fact used in this document is drawn from `ALI_DECISION_LOG.md`'s own recorded Decisions (50, 51, 53, 54, 56), which is this project's standing substitute evidence source for that gap, not from a fresh Table Editor inspection (not available to this execution).

---

## 2. CSSE ground truth (Assessment Brain V1, frozen 2026-07-20)

Angel's own evidence base, not re-derived here: **17 Accepted Knowledge Assets** (real 2021/2022/2023 CSSE English, Continuous Writing, and Mathematics papers plus marking schemes and the Information Guide) → **13 Assessment Observations** → **13 Competencies** across 4 domains → **27 Question Types**.

| Domain | Competencies | Confidence / EMC |
|---|---|---|
| Reading (English) | RC-01 Literal Retrieval, RC-02 Inference & Justified Interpretation, RC-03 Word/Phrase Meaning, RC-04 Sequential Ordering | RC-01 HIGH/EMC-3, RC-02 MEDIUM/EMC-3, RC-03 LOW/EMC-2 (single instance), RC-04 LOW/EMC-2 (single instance) |
| Applied Reasoning (English) | AR-01 Letter-Code Pattern Inference | HIGH(structural)/INSUFFICIENT EVIDENCE(mechanic) |
| Writing (English) | WC-01 Sustained Original Composition, WC-02 Multi-Dimensional Writing Quality | WC-01 HIGH/EMC-3, WC-02 LOW/EMC-1 (lowest of all 13) |
| Mathematics | MR-01 Arithmetic, MR-02 Algebraic/Symbolic, MR-03 Geometric/Spatial, MR-04 Multi-Step Word Problems, MR-05 Number Properties, MR-06 Precision Under Exact-Match | MR-02/03/04/06 HIGH/EMC-4; MR-01 HIGH(no-calc)/MEDIUM(depth)/EMC-3; MR-05 LOW/EMC-2 |

**Critical, load-bearing finding for this whole programme — and a genuine evidence conflict, not a settled fact:** two repository documents make different claims about Applied Reasoning's current status, and they carry different evidentiary weight:

- `CSSE_EXAMINATION_BLUEPRINT.md` §5 claims Applied Reasoning was removed from the CSSE English paper from September 2024 (2025 Entry) onward — sourced from a **single, uncorroborated secondary source**, and the document itself states this has not yet been formally applied to the frozen Assessment Brain.
- `CSSE_FULL_MOCK_STRUCTURE_DECISION_V1.md` (2026-08-11), by contrast, is built from **17 Founder-Accepted primary knowledge assets** — real CSSE papers spanning 2021, 2022, and 2023 entry — and explicitly classifies Applied Reasoning as **"STABLE ACROSS YEARS,"** present in all three evidenced years (5 questions/5 marks/10 minutes), and includes it in its own recommended target Mock structure, describing the content itself as merely "blocked, Gate 3, pending authoring" — not obsolete.

Per this project's own established evidence discipline (Decision 48's standing principle that a claim's evidentiary basis must be stated honestly, not glossed over), primary-source evidence covering three real exam years outweighs a single uncorroborated secondary claim. **This document does not resolve the conflict** — it is not this document's place to decide CSSE's current exam structure — but it is factually inaccurate to present the "AR removed in 2024" claim as more settled than it is. Both documents' claims are reported here; only the Founder can confirm which reflects the actual current exam (this may be information the Founder holds outside the repository).

**RESOLVED, 2026-08-16 (CSSE Completion Programme Phase A, Decision 58):** the Founder has confirmed, from current official CSSE information, that Applied Reasoning was removed from the CSSE English paper from September 2024 (2025 Entry) onward. **Applied Reasoning (AR-01/QT-AR-01) is reclassified HISTORICAL CSSE EVIDENCE, NOT CURRENT CSSE EXAMINATION CONTENT.** Current CSSE preparation is **English (Comprehension + Continuous Writing) and Mathematics only.** Decision 58 also closed two live, current, learner/parent-facing code defects this reclassification exposed (`lib/learningEngine/assessmentBrainMap.ts`'s `ALL_COMPETENCY_IDS`/`ALL_ASSESSMENT_COMPONENTS` were including AR-01/"Applied Reasoning" in the arrays every readiness/diagnostics consumer iterates, producing a permanent, structurally-unfixable "Applied Reasoning: Not Yet Evidenced" card and "coverage gap" chip on real parent/child-facing screens) — see Decision 58 for the full trace and fix. The production question bank's zero Applied Reasoning content is therefore now understood as **correct**, not an unexplained gap. This document's coverage matrix below reflects the current, post-Decision-58 scope (English + Mathematics); Applied Reasoning does not appear in it, consistent with the reclassification, and the evidence-conflict this document originally flagged unresolved (§2 above, left as a historical record of that flagging) is closed.

**Exam timing/structure ground truth Mock must be measured against:** English 70 min total (60+10 reading), internally 30 min Comprehension + 20 min Continuous Writing (Applied Reasoning's 10 min removed from the current paper, per Decision 58) = 60 marks; Mathematics 60 min, 60 marks, 20-21 no-calculator exact-match questions. Combined 120 marks, 50/50 weighted, age-standardised, no re-mark, no offer below 303 (all HIGH confidence).

---

## 3. CSSE Coverage Matrix

Content coverage counts are queried fresh from production (2026-08-16, re-verified 2026-08-16 during Phase A). "Teaching support" reflects actual rendered UI behaviour, confirmed by reading `app/learning-intelligence/practice/[area]/page.tsx` directly. READY/PARTIAL/GAP is a judgement made from that evidence, not a restatement of a prior increment's own self-assessment. **Applied Reasoning is out of scope for this matrix** (Decision 58: HISTORICAL ONLY, not current CSSE examination content) — it is not listed below, by design, not omission.

**Reproducibility (Phase A, Part 4):** every supply/count number in §3A-3D below (family row counts, Practice Eligible/Provisional splits, misconception-text population, and which families have real teaching-support code) can be regenerated on demand, rather than trusted as static documentation, by running `scripts/coverage-matrix.mjs` (`npx tsx scripts/coverage-matrix.mjs`) against live production. The READY/PARTIAL/GAP judgement calls, evidence-source citations, and exam-preparation-maturity assessments remain human judgement, deliberately not automated. The two new columns Phase A's directive requested — **Scoring maturity** and **Exam-technique maturity** — are added as subject-level notes below each table (Phase A's own trace found both are uniform within a subject today, not family-specific, so a per-family column would repeat the same value 27/10/1 times); **Parent visibility** is covered in §3E, applying identically across all three subjects (the same `ReadinessSummary`/`DiagnosticOverview` components render every competency's evidence, English/Maths/Writing alike).

### 3A. Mathematics (14 Question Types under MR-01–MR-06)

| QT | Skill | Angel family/families | Authored (PE) | Teaching maturity | Depth | Anti-memorisation | Classification | Evidence |
|---|---|---|---|---|---|---|---|---|
| QT-MR-01 Direct Arithmetic | MR-01 | **none dedicated** — only scattered across the 27-row ungrouped legacy pool alongside 10 other QT codes | ~27 (mixed, undifferentiated) | ASSESSMENT ONLY | Thin per-QT, no family structure | Weak — legacy pool not family-diversified | **GAP** (structural, not content) | Direct DB query: `family_id=null` group carries 11 distinct QT codes across 27 PE + 5 provisional rows |
| QT-MR-02 Missing-Operand | MR-01 | `mr01-missing-operand` | 4 | **007L: MODEL+Guided+Remediation** | Thin (4) | Single-step only, disclosed limitation | PARTIAL | 007L design doc Part 5 |
| QT-MR-03 Unit Conversion | MR-01 (documented imperfect fit — no dedicated competency) | `mr01-measurement-conversion` | 4 | **007L: MODEL+Guided+Remediation** | Thin (4) | OK | PARTIAL | Decision 55, 007L |
| QT-MR-04 Percentage/Proportional | MR-04 | `mr04-compound-percentage` (5), `mr04-far-percent` (3) | 8 | ASSESSMENT ONLY | Moderate | OK | PARTIAL | DB query |
| QT-MR-05 Sequence/Function-Rule | MR-02 | `mr02-nth-term` (5), `mr02-sequence-rule` (10) | 15 | ASSESSMENT ONLY | Good | OK | PARTIAL | DB query |
| QT-MR-06 Algebraic Symbol/Unknown | MR-02 | `mr02-compare` (3), `mr02-far-ratio-context` (3), `mr02-substitution` (5), `mr02-sum-difference` (5) | 16 | ASSESSMENT ONLY | Good, split across 4 families | OK | PARTIAL | DB query |
| QT-MR-07 Geometric Angle/Shape | MR-03 | `mr03-angle-ratio` (5, **007L**), `mr03-angle-sum` (7), `mr03-classify` (3), `mr03-mixed-perimeter` (3) | 18 | Mixed (1 of 4 families has 007L teaching) | Good | OK | PARTIAL | DB query |
| QT-MR-08 Coordinate/Transformation | MR-03 | `mr03-coordinate` | 3 | ASSESSMENT ONLY | **Thin** | Weak (only 3 siblings) | GAP (depth) | DB query |
| QT-MR-09 Data Reading | MR-01 (documented imperfect fit) | `mr01-data-table` (5) + legacy pool | 5+ | ASSESSMENT ONLY | Moderate | OK | PARTIAL | DB query |
| QT-MR-10 Elapsed-Time | MR-04 | `mr04-elapsed-time` | 5 | ASSESSMENT ONLY | Moderate | OK | PARTIAL | DB query |
| QT-MR-11 Number-Property | MR-05 | `mr05-constrained-multiple` (3), `mr05-factors-primes` (5), `mr05-number-property` (5), `mr05-number-property-search` (2, **0/2 misconception populated — data-quality gap**) | 15 | ASSESSMENT ONLY | Good, but one thin/incomplete sub-family | OK | PARTIAL | DB query |
| QT-MR-12 Average (Mean) | MR-01 | `mr01-average-mean` (4) + legacy | 4+ | ASSESSMENT ONLY | Thin | OK | PARTIAL | DB query |
| QT-MR-13 Best-Value/Combinatorial | MR-04 | `mr04-best-value` (5, **007L**), `mr04-mixed-divisibility` (3) | 8 | Mixed (1 of 2 has 007L teaching) | Moderate | OK | PARTIAL | DB query |
| QT-MR-14 Precision (cross-cutting) | MR-06 | `precision-dec` (3), `precision-frac` (3) | 6 | ASSESSMENT ONLY | Thin | OK | PARTIAL | DB query |

**Mathematics totals:** 141 Practice Eligible across 27 named families + 1 ungrouped legacy pool (27 PE rows, no family structure). All 14 Question Types have *some* authored content — the earlier finding that "Applied Reasoning is unbuilt" does not apply to Maths; every MR-domain QT is represented. **4 of ~28 families (14%) have 007L teaching depth (MODEL/Guided/Remediation); the rest are ASSESSMENT ONLY** (real check, real but static post-hoc explanation only). `content_difficulty` values actually present: `easy`, `medium`, `hard`, `challenge` — no clean EASY/STANDARD/HARD/STRETCH progression ladder exists; distribution is almost always a single uniform value per family (e.g. `mr02-substitution` is 100% "hard", `mr05-number-property` is 100% "easy"); only 2 of 27 families (`mr02-sequence-rule`, `mr03-angle-sum`) mix two difficulty labels internally, and none has a 3+ tier progression. 11 of 27 families are "thin" (exactly 3 siblings): `mr02-compare`, `mr02-far-ratio-context`, `mr03-classify`, `mr03-coordinate`, `mr03-mixed-perimeter`, `mr04-far-percent`, `mr04-far-recipe`, `mr04-mixed-divisibility`, `mr05-constrained-multiple`, `precision-dec`, `precision-frac`.

**Answer-format risk sweep (flagged, not fixed — same category as the recently-closed cubic-unit defect):** two families rely on brittle exact-text matching in `checkMathsAnswer` that could reject legitimately-equivalent reformattings, distinct from anything Decision 55/the cubic-unit fix covers:
- `mr03-coordinate` (3 rows, e.g. `"(3, -5)"`) — parenthesised coordinate pairs; a mathematically-identical unparenthesised `"3,-5"` would not match.
- `mr02-substitution` (5 rows, e.g. `"A=4, C=2"`) — compound labelled-variable answers; a reordered `"C=2, A=4"` would not match, though spacing variants do (already whitespace-stripped).
No live evidence yet that a real learner has hit either case — flagged for the Phase B evidence pack to address per-family, not treated as a confirmed production defect.

**Scoring maturity (subject-level, Part 4):** READY — `checkMathsAnswer`/`parseNumberWithUnit` (Decision 55, the cubic-unit fix) is deterministic, unit-aware, bank-wide regression-tested (166/168 checks) and independently re-verified live in production. Not family-specific; applies uniformly.
**Exam-technique maturity (subject-level, Part 4):** GAP — confirmed by direct code search this session: no timing, timer UI, pacing feature, or exam-technique content exists anywhere in the Mathematics Practice pathway. `estimated_time_seconds` is stored on every row but only ever mapped into a type (`lib/ali/questionBank.ts`), never read or rendered anywhere. Uniform across all families — this is a pathway-level absence, not a per-family gap.

### 3B. English Reading (10 Question Types under RC-01–RC-04)

| QT | Skill | Angel family | Authored (PE/Prov) | Teaching maturity | Depth | Classification | Evidence |
|---|---|---|---|---|---|---|---|
| QT-RC-01 Literal Short-Answer | RC-01 | `wave1-fam-direct-retrieval` | 14 PE | Guided (`locate-instruction` scaffold) | Good | PARTIAL | DB + `guidedPractice.ts` |
| QT-RC-02 Yes/No Judgement+Justification | RC-02 | `wave1-fam-quote-explain` (13 PE), `wave1-fam-tick-justify` (**11, ALL provisional — zero live**) | 13 PE / 11 Prov | Guided (`staged-quotation` / `locate-instruction`) | Good, but half the authored supply is not live | **PARTIAL/GAP** — real authored content blocked from Practice | DB query |
| QT-RC-03 Word/Phrase Meaning | RC-03 (LOW/EMC-2, single-instance in exam evidence itself) | `wave1-fam-vocab-explain` (shares with QT-RC-05) | 17 PE (shared) | Guided (`locate-instruction`) | Moderate | PARTIAL | DB query |
| QT-RC-04 Synonym Substitution | RC-03 | `wave1-fam-synonym-battery` | 11 PE | Guided (`locate-instruction`) | Moderate | PARTIAL | DB query |
| QT-RC-05 Quotation-and-Explanation | RC-02 | `wave1-fam-vocab-explain` (shared, above) | (shared) | Guided | Moderate | PARTIAL | DB query |
| QT-RC-06 Sequential Ordering | RC-04 (LOW/EMC-2, single-instance) | `wave1-fam-sequencing` | 15 PE | Guided (`sequence-anchor`) — **this scaffold had a real scoring defect found and fixed live in 007G** | Good | PARTIAL | DB query, Decision 52 |
| QT-RC-07 Multi-Entity Comparative | RC-01 | `wave1-fam-two-character` | 6 PE | Guided (`locate-instruction`) | **Thin (6)** | GAP (depth) | DB query |
| QT-RC-08 List-N-Items | RC-01 | `wave1-fam-emotion-cause` | 11 PE | Guided (`locate-instruction`) | Good | PARTIAL | DB query |
| QT-RC-09 Multi-Select Tick-Box | RC-01 | `wave2-fam-multiselect` | 6 PE | Guided (`selection-count-check`) | **Thin (6)** | GAP (depth) | DB query |
| QT-RC-10 Effect-of-Language | RC-02 | **none dedicated** — only in the 13-row ungrouped legacy pool | 13 (mixed) | ASSESSMENT ONLY | No family structure | GAP (structural) | DB query |

**English totals:** 106 Practice Eligible across 9 named families + 1 legacy pool; 11 further rows (`wave1-fam-tick-justify`) authored, reviewed-pipeline-shaped, but stuck in `provisional` — and this is also the one named family with **zero** `FAMILY_EDUCATIONAL_CONTEXT`/MODEL entry in `lib/adminReview.ts` (8 of 9 named families have one; `tick-justify` has none, consistent with never having been activated). **Every named English family already has a Guided Practice scaffold** (structurally broader teaching coverage than Maths's 4-of-28) — but every scaffold is one of only 4 generic kinds (`lib/learningEngine/guidedPractice.ts`'s `FAMILY_SCAFFOLD`: `locate-instruction`, `staged-quotation`, `sequence-anchor`, `selection-count-check`), and `locate-instruction` (the plainest) is reused for 6 of 9 families. Targeted self-reflection prompts (`SELF_REFLECTION_CATEGORIES`, a deeper remediation layer) exist for only 3 of 9 families (`wave1-fam-two-character`, `wave1-fam-quote-explain`, `wave1-fam-emotion-cause`) — the other 6 get only the generic classifier. **Critical parallel-gap finding:** `addresses_misconception` is 100% populated for every named English family (14/14, 11/11, 13/13, 15/15, 11/11, 6/6, 17/17, 6/6) exactly like Maths was before 007L — but unlike Maths, **it is never rendered**. `ReadingActivity` (the component English actually uses) has no `addressesMisconception` prop at all; only `MathsActivity` does (`app/learning-intelligence/practice/[area]/page.tsx` lines 508, 871, 969-973). This is real, reviewed, human-evidenced remediation content sitting completely unused on the larger of the two subjects — the same class of dead-data finding 007L's own Part 1 made for pre-007L Maths, not yet applied to English.

**Genre variation / anti-memorisation (requested matrix columns, not otherwise addressed above):** every English reading question in the bank is tied to one of only **19 fixed passages** (grouped by `learning_unit_id`, no larger unseen pool, no passage-rotation mechanism found). Most wave1/wave2 passages carry 7-8 questions each — a learner practising repeatedly cycles through the same 19 named narratives indefinitely, mitigated only by `sessionGenerator.ts`'s question-level anti-clustering, not by passage-level supply depth. All 19 passages are 125-430 words of narrative fiction or personal-letter register — **no non-fiction/informational-text genre exists anywhere in the bank.** This is a real, separate gap from the family/QT structure above and directly relevant to "variation/anti-memorisation depth" and "genre variation" as requested matrix columns — a learner's exposure is broad in question *type* but narrow in passage *source*.

**Scoring maturity (subject-level, Part 4):** PARTIAL — `scoreEnglishAnswer`/the 007A Answer Validation Architecture is real, tiered, and tested (25 tests, `englishAnswerValidation.test.ts`), but this is a different, generally lower-precision problem than Mathematics's exact-match checking (free-text/multi-select scoring inherently has more judgement calls). No known live defect, unlike Writing's confirmed one (Decision 60).
**Exam-technique maturity (subject-level, Part 4):** GAP — same finding as Mathematics: no timed-reading or exam-condition practice mode exists in English Practice. "Unseen" appears only in planning documents, never as an implemented feature.

### 3C. Continuous Writing (2 Question Types under WC-01/WC-02)

| QT | Angel content | Status |
|---|---|---|
| QT-WC-01a Reflective/Discursive Prompt | 1 row (`wrt-003`, "Should Schools Ban Smartphones?", persuasive, `content_difficulty: hard`, `family_id: null`), `provisional`, **0 Practice Eligible** | GAP |
| QT-WC-01b Picture-Stimulus Narrative | 0 rows | GAP |
| WC-02 (Grammar/Spelling/Punctuation, the lowest-evidence competency in the whole 13-competency model, EMC-1) | 0 dedicated content; addressed only incidentally by AI feedback prose | GAP |

**Correction to this document's own earlier account, verified by direct trace in Phase A (Part 3):** the live Practice pathway's `WritingActivity` (`app/learning-intelligence/practice/[area]/page.tsx`) DOES correctly use `ali_question_bank` via `generatePersonalisedSession`/`fetchQuestionBank` — the same real pipeline Maths/English use. Since zero Writing rows are `practice_eligible`, `generatePersonalisedSession` returns an empty session, and `loadAndStart()` throws (`if (tagged.length === 0) throw new Error(session.summary)`) before `WritingActivity` ever renders — this area is currently an error/empty state for a real learner, not silently fed by fallback content. `data/writing.ts` (4 static prompts, `wrt-001..004`) is used **only** by the separate, legacy standalone `/writing` route (`app/writing/page.tsx`), reachable via the bottom-nav "Learn" item for any non-CSSE-pathway learner — a different route from the CSSE Practice pathway entirely.
**Two distinct graders exist in the codebase:** a legacy keyword-overlap heuristic (`app/english/[id]/page.tsx`'s `scoreAnswer()`, unrelated standalone route) and the one both `WritingActivity` and `/writing` actually call, `app/api/writing-feedback/route.ts`, which sends the submission to OpenAI `gpt-4o-mini` and returns an AI-generated `overallScore (0–100)` — **the route's own system prompt already states, in its own words, "it is not calibrated against any exam board's mark scheme and must not be described as one."**
**Confirmed live safety defect, now fixed (Decision 60, Phase A Part 3):** `data/writing.ts`'s `wrt-003` prompt shares its `id` with the one real `ali_question_bank` Writing row — `recordLegacyPracticeEvidence` (used by `/writing`) looks up a submitted answer's evidence eligibility by ID only, with no `eligibility_status` check, so selecting that one specific prompt on the reachable `/writing` route and requesting AI feedback was a live, exploitable path to real `WC-01` mastery evidence gated solely by the uncalibrated `overallScore`. Fixed by recording both `/writing`'s and `WritingActivity`'s Writing evidence with `supportTier: "supported"` instead of the default `"independent"` — reusing `mastery.ts`'s existing, already-proven gate so this evidence can never independently reach `"mastered"`, while still preserving the formative feedback and attempt-tracking signal. Historical impact on any real learner could not be confirmed or ruled out (`ali_student_question_history` is RLS-opaque to the anon key, same as `ali_family_review`) — reported as a limitation, not asserted either way.
**GAP, still the most severe of the three subjects** — the mastery-safety defect is closed, but the underlying content/scoring-model gap this document's Phase D describes remains fully open: 0 Practice Eligible content, no calibrated scoring model, no MODEL/Guided/Independent/Redraft architecture.

### 3D. Mock

`mock_eligible = 0`. Decision 49 (2026-08-13) is the authoritative, Founder-recorded target architecture (2-week cadence, parent override, sealed reserve, no Practice leakage) — **design only, confirmed still not implemented**, consistent with the directive's own framing. Full route inventory and firewall analysis in Part 5 below.
**Update (Phase A, Decision 59):** the Mock Content Firewall rule (`practice_eligible != mock_eligible`) is now structurally enforced at every real Mock route, not merely intended. All 4 `/mocks/adaptive/*` routes were found calling the general `fetchQuestionBank()` instead of the firewalled `fetchMockEligibleQuestionBank()` despite persisting real `MockResult`s — a confirmed, reachable (via bottom-nav "Practise" for non-CSSE pathways), currently-dormant-only-by-accident (no `"gl"`-tagged content exists yet) defect. Fixed; 9 regression tests added (`tests/lib/ali/mockContentFirewall.test.ts`). This does not change Mock's overall readiness classification (still GAP — no `mock_eligible` content, no sitting mechanics, no cadence/parent-override system) but removes a real risk that future content growth could have silently violated the firewall.

### 3E. Parent visibility

7 parent-facing routes exist (`/learning-intelligence/parent`, `/admissions-readiness`, `/journey`, `/mock-readiness`, `/readiness-timeline`, `/revision-planner`, `/weekly-report`) backed by non-trivial implementations (`lib/parentInsights.ts`, 445 lines; `lib/learningEngine/mockReadiness.ts`, 131 lines) with no stub/placeholder markers found by inspection. Not independently re-verified against live data this session (out of this execution's audit-only scope for UI content) — flagged as a real but unconfirmed-depth asset, not assumed complete.

---

## 4. Mathematics completion — bounded next-step sequence (not implemented)

Per 007L (frozen, Decision 57): MODEL / Guided step-reveal / Independent / Remediation is proven, safe, and the **reference architecture** — reuse only, no second teaching engine.

**Exact bounded sequence to reach launch-ready Mathematics teaching depth**, one certified family group at a time against 007L's own Part 4 Evidence Standard (13 items) — never a mass retrofit:

1. **Close the QT-MR-01 structural gap first** — it is the single highest-evidence Question Type (HIGH/EMC-4) and currently has zero family structure. Requires classifying the 27-row legacy pool into real families before any teaching content can attach to it — a content-governance step, not a teaching-architecture step.
2. **Depth pass on the 3 thin families** (`mr03-coordinate` 3, and re-confirm `mr01-average-mean`/precision families before committing) before teaching content, not after — 007L's own Part 5 named "thin families risk under-proving the architecture" as a real risk category.
3. **Extend `MATHS_FAMILY_TEACHING_CONTENT`** one family at a time, prioritised by Question Type evidence grade (MR-02/03/04/06 HIGH/EMC-4 families first), each requiring its own MODEL authoring, Guided step-reveal verification against real `workingSteps`, remediation-category mapping, and full Part 4 evidence pack.
4. **Design, do not yet build, a difficulty ladder.** `easy`/`medium`/`hard`/`challenge` exist as raw values today with no designed progression logic — this is new design work, not a 007L extension.
5. **Exam-technique/timing:** no timed-practice or pacing feature exists in Mathematics practice today (confirmed by code search — no "timer"/"pacing" implementation found). Out of 007L's frozen scope entirely; a genuinely new capability for a later phase.

---

## 5. English Reading completion — bounded next-step sequence (not implemented)

1. **Render `addressesMisconception` in `ReadingActivity`** — the highest-leverage, lowest-risk single change available anywhere in this audit: the data already exists, 100% populated, human-reviewed, for every named family; only the UI wiring is missing (structurally identical to what 007L just proved safe for Maths).
2. **Unblock `wave1-fam-tick-justify`** (11 authored, reviewed-shaped rows sitting in `provisional`) — a governance/activation action, not new content work, pending the same Founder-authorised activation pattern already used for every prior Batch.
3. **Depth pass on the 2 thin families** (`wave1-fam-two-character` 6, `wave2-fam-multiselect` 6) before any Wave 3 authoring.
4. **Close the QT-RC-10 (Effect-of-Language) structural gap** — same shape of gap as Maths's QT-MR-01: a real, MEDIUM-confidence Question Type with no dedicated family, only scattered in the legacy pool.
5. **Only after 1-4:** consider whether any English family should receive 007L-pattern teaching depth beyond the existing 4-scaffold-kind Guided Practice it already has — English's gap is *breadth-already-present-but-shallow*, not *breadth-absent*, so this is a different kind of completion work than Maths's.

No Wave 3 authored in this execution, per the stop condition.

---

## 6. Continuous Writing — required architecture (design only, not implemented)

Per the directive: do not preserve the invented 0–100 score merely because it exists.

**Required architecture**, reusing the proven ALI evidence/mastery pipeline (`recordOutcome`/`applyAttemptOutcome`/`supportTier`) the same way 007L reused it for Maths, not a new evidence system:

```
MODEL (structure/technique for WC-01a reflective and WC-01b picture-stimulus, as two
       genuinely distinct prompt types per Assessment Brain V1, not blended)
  → PLANNING (a bounded scaffold, not free-form — structure guidance only)
  → GUIDED WRITING (first attempt, supportTier "supported")
  → INDEPENDENT WRITING (supportTier "independent")
  → FEEDBACK (evidence-aligned, see below — replacing the current AI 0-100)
  → REVISION/REDRAFT (bounded, not infinite)
  → EVIDENCE CAPTURE (recordOutcome against WC-01/WC-02, real ali_question_bank rows,
       not data/writing.ts)
  → PROGRESS (surfaced through the existing parent/child readiness routes)
  → EXAM-CONDITION WRITING (only after the above is proven, mirrors Mock's own
       no-hints/timed contract)
```

**Assessment model, evidence-aligned, not claiming false precision:** WC-01 is HIGH/EMC-3 (composition can be assessed with real confidence). WC-02 is LOW/EMC-1 — **the lowest-evidence competency in the entire 13-competency model**, with an explicitly open, unresolved rubric-vs-marks gap (Assessment Brain V1 Observation 10). Any future scoring model must reflect this asymmetry: WC-01 (composition/structure/sustained writing) can be scored with a defensible rubric; WC-02 (grammar/spelling/punctuation as a *combined mark*) cannot currently be scored with CSSE-calibrated precision, and a future feedback model should say so explicitly per-dimension rather than collapsing both into one number, as today's `overallScore` does. This mirrors 007L's own "author the honest minimum, never overclaim" discipline.

**Not implemented in this execution**, per the stop condition.

---

## 7. Mock Weekend — product definition (design only, not implemented)

Decision 49 remains authoritative and is not restated in full here (see §5 of that decision). This section adds the operational detail Decision 49 left for a dedicated implementation increment, plus a critical finding Decision 49's own text did not anticipate.

**Critical finding: substantial legacy Mock-shaped code already exists, outside Decision 49's governance.**

| Route | Lines | Content source | Respects `mock_eligible` firewall? |
|---|---|---|---|
| `app/learning-intelligence/mock-exam/page.tsx` | 693 | `fetchMockEligibleQuestionBank` — **real `ali_question_bank`/ALI pipeline** | **Yes** — the only one that does |
| `app/mocks/[pathway]/page.tsx` | 845 | `data/verbal-reasoning.ts`, `data/non-verbal-reasoning.ts`, `data/spatial-reasoning.ts`, `data/numerical-reasoning.ts`, `data/maths.ts` | No — static, ungoverned pools |
| `app/mocks/adaptive/{gl,english,maths,vocabulary}/page.tsx` | 743+547+506+422 = 2,218 | `ali_question_bank` (via `fetchQuestionBank`, corrected in this row — **not** static pools as this document originally stated), falling back to synthetic fixtures only when the bank returns empty | **Was No — fixed, Decision 59 (Phase A)**: now calls `fetchMockEligibleQuestionBank`. Zero production behaviour change (still 0 `mock_eligible` rows for this pathway, still synthetic fallback), but the structural gap is closed. |
| `app/mocks/page.tsx` | 338 | `lib/mockProgress.ts`, `lib/learningEngine/mockReadiness.ts` | Indirect (hub page) |
| `app/mock-test/page.tsx` | 396 | `data/lessons.ts`, `data/maths.ts` | No — but confirmed orphaned (zero real inbound navigation links anywhere in `app/`/`components/`), not a live risk |

Roughly **4,490 lines** of pre-existing Mock-shaped UI, only 693 of which were wired to the governed architecture Decision 49 requires (now 693+2,218 = 2,911 following Decision 59's fix — the 4 adaptive routes are firewall-correct, though still architecturally duplicated from `mock-exam`). This is squarely a Part 7 "duplicate/legacy routes" finding, and it materially changes what a Mock Weekend implementation increment actually needs to do first: **reconcile/retire the ungoverned routes before or alongside building the governed one out**, not build a sixth Mock route alongside five existing ones.

**More precise firewall finding, code-level:** `lib/ali/questionBank.ts` defines two functions — the general-purpose `fetchQuestionBank()` (any non-provisional row, i.e. includes `practice_eligible`) and the properly-firewalled `fetchMockEligibleQuestionBank()` (filters strictly to `eligibility_status = "mock_eligible"`, with its own code comment explaining zero rows currently qualify by design). All four `/mocks/adaptive/{maths,english,gl,vocabulary}` routes call `fetchQuestionBank(supabase, subject, "gl")` — **not** the firewalled function — confirmed by direct grep (zero references to `fetchMockEligibleQuestionBank` in any of the four). This means these routes would currently serve genuine Practice-pool content (141 Maths / 106 English practice_eligible rows) as "mock" content if exercised for a subject with real data. It is **not exploitable in production today** only because every row in `ali_question_bank.pathway` is tagged `["csse"]` or `["csse-founder-validation"]` — zero rows are tagged `"gl"`, the pathway these routes hardcode — so they currently render only synthetic fallback fixtures, not real leaked content. This is a live architectural gap, not merely a theoretical one: the moment any real `"gl"`-tagged content is added to the bank by any future work, these four routes would leak it as Mock content with no code change required on their part. Flagged for Phase F to close (retire or firewall-correct these routes) before any GL content work begins — not fixed in this execution, per the stop conditions.

**Operational detail for the eventual implementation increment (not performed here):**

- **Eligibility to sit:** parent-visible countdown to the next scheduled ~2-week Mock Weekend; child cannot self-initiate outside a parent override (Decision 49, unchanged).
- **Content firewall:** Mock content must come from a *sealed reserve*, structurally separate from `practice_eligible` — Decision 49 already states this; this document adds that "separate" must mean a genuinely distinct family/item pool with its own eligibility promotion path, never a query-time filter over the same rows a learner may have drilled in Practice.
- **Copyright firewall:** Angel-original only; past papers are structural/skill evidence (already governed by Assessment Brain V1's own sourcing discipline), never lightly-rewritten source material. This should be a named, checked gate in whatever review pipeline eventually promotes content to `mock_eligible`, mirroring the existing `ali_family_review` gate for `practice_eligible`.
- **Sitting mechanics:** exam-authentic timing per §2 above (English 70 min/3-or-2 sections depending on the AR-01 resolution, Maths 60 min/60 marks); no MODEL/Guided/hint surfaces during a sitting (explicit in Decision 49); controlled submission; autosave; time-expiry auto-submit with unanswered items marked, not silently dropped.
- **Result/diagnosis loop:** competency-level diagnosis (reusing the same RC/MR/WC evidence model, not a new one), time-management analysis (new — no existing code does this for any pathway), comparison against previous Mocks, and a next-two-week Practice recommendation closing the loop back into the existing recommendation engine.
- **Parent report vs. child report:** distinct presentations of the same underlying result, per the directive's Part 5/7 requirements — not built here.

**Not implemented, not populated, per the stop condition.** `mock_eligible` remains 0.

---

## 8. Other selective pathways

| Pathway | Architecture | Content | Evidence | Teaching | Assessment | Mock | Parent Intelligence |
|---|---|---|---|---|---|---|---|
| **GL Assessment** | PARTIAL — pathway selector (`lib/activePathway.ts`) + a 743-line legacy mock route (`app/mocks/adaptive/gl/page.tsx`) exist | FOUNDATION ONLY — static VR/NVR/numerical-reasoning pools, not GL-specific, not reviewed; zero `ali_question_bank` rows tagged `pathway="gl"` | NOT VALIDATED | NOT VALIDATED | NOT VALIDATED | NOT VALIDATED — ungoverned route, calls the general `fetchQuestionBank()` not the firewalled `fetchMockEligibleQuestionBank()` (§7); not currently exploitable only because no `"gl"`-tagged content exists yet | NOT VALIDATED |
| **CEM** | PARTIAL — pathway-selector plumbing only (`REAL_PATHWAY_IDS`) | NOT VALIDATED — no CEM-specific content found | NOT VALIDATED | NOT VALIDATED | NOT VALIDATED | NOT VALIDATED | NOT VALIDATED |
| **ISEB Pre-Test** | PARTIAL — pathway-selector plumbing only | NOT VALIDATED | NOT VALIDATED | NOT VALIDATED | NOT VALIDATED | NOT VALIDATED | NOT VALIDATED |
| **Independent/bespoke** | PARTIAL — pathway-selector plumbing only | NOT VALIDATED | NOT VALIDATED | NOT VALIDATED | NOT VALIDATED | NOT VALIDATED | NOT VALIDATED |

`docs/intelligence/ASSESSMENT_BRAIN_V1.md` itself states its scope boundary explicitly: *"CSSE only. GL, CEM, and ISEB are out of scope for this Brain, matching the scope of all four underlying work packages."* No Assessment-Brain-equivalent evidence work exists for any of the four other pathways — this is a scope boundary the project set for itself deliberately, not an oversight. **Pathway-specific evidence work required, once CSSE reaches launch readiness:** the exact same 4-work-package pattern already proven for CSSE (Assessment Structure → Competency Framework → Question Intelligence → consolidated Brain), independently sourced per pathway, before any GL/CEM/ISEB content, teaching, or Mock work begins — reusing the *process*, not assuming any of CSSE's specific findings transfer.

---

## 9. Product Experience handoff (for the separate Visual Audit — not performed here)

**This session builds on, rather than duplicates, existing route-governance work already in the repository:** `knowledge/.../active-pathway-context/CURRENT_PATHWAY_AND_ROUTING_AUDIT.md` and `LEGACY_REACHABILITY_AUDIT.md`, plus `knowledge/.../mock-centre-experience-transformation/NEW_ANGEL_LEGACY_EXPERIENCE_REGISTER.md` (2026-08-11), already exhaustively catalogue the legacy/duplicate-route landscape and were spot-verified as still accurate this session (e.g. their claim that `/mocks/adaptive/*` was relocated off the shared Mock Centre to be linked only from `/reasoning` was independently re-confirmed by grep).

**Legacy/duplicate routes** (per the above documents, re-confirmed, plus this session's own additional findings):
- `/english`, `/maths`, `/reasoning` (+4 subject pages), `/vocabulary`, `/writing`, `/learn` — legacy, static `data/*.ts` pools, no Educational Intelligence integration. **Not dead code** — they remain the only real implementation for non-CSSE pathways (§8) — but a CSSE learner cannot reach any of them via in-app links (confirmed).
- `app/writing/page.tsx` ("Creative Writing," checklist/word-count XP) vs. the Practice pathway's own `WritingActivity` — two different Writing experiences, neither connected to the reviewed `ali_question_bank` Writing content.
- `app/maths/page.tsx` vs. `app/learning-intelligence/practice/mathematics` — already disclosed in Decision 55's implications, re-confirmed here.
- `app/mock-test/page.tsx` (confirmed orphaned — zero inbound links anywhere in the app) vs. `app/mocks/[pathway]/page.tsx` (its own `/mocks/csse` entry is explicitly marked deprecated in-code and unlinked) vs. `app/mocks/adaptive/*` vs. `app/learning-intelligence/mock-exam/page.tsx` — four structurally distinct Mock-shaped surfaces (§7's table covers five including the hub).
- **No Settings route exists anywhere in `app/`** — confirmed by direct search, not merely unaudited. This is an absence, not a duplicate, but belongs in the same inventory: the directive's required experience-state list includes Settings and nothing currently backs it.

**Raw internal IDs / developer terminology:** re-investigated directly this session (grep of every `app/**/*.tsx` for `family_id`, `supportTier`, `MR-0*`, `wave1-fam-*` rendered as literal JSX text, not props/keys). **Correcting an earlier, less rigorous impression from this session's own preliminary pass: none were found in any learner-facing route.** All matches were either `app/admin-beta/review/page.tsx` (an explicit reviewer tool, where this is appropriate) or non-visible internal usage (a competency code passed as an API parameter, or as a React `key` prop). This is a genuinely clean result, not a gap — recorded accurately rather than assumed. One honest, well-handled empty state is worth noting positively in the same spirit: the Vocabulary practice card states plainly that "Vocabulary isn't part of this skills structure yet... still available from the main Learn hub" rather than silently hiding or faking availability. No TODO/FIXME/"coming soon" markers were found anywhere in the `learning-intelligence/**` tree.

**Weak/cosmetic issues carried over from 007L's own live verification, still unresolved:** "Signed in as . Sign out" (stray period, missing display name) in the top bar.

**Required experience states the Visual Audit must preserve** (per the directive's list: Home, Learning, Practice, Guided Practice, Independent Practice, Progress, Revision, Mock preparation, Mock Weekend, Results, Readiness, Parent Dashboard, Admissions preparation, Settings) — each of these already has *some* real, working implementation behind it per this audit (Parts 3E, 7), except **Mock Weekend, Results, and Settings**, none of which exist in governed/any form (§7; Settings has no route at all) and so have no current experience state to preserve — the Visual Audit's work on these three will be greenfield design, not a redesign.

No visual, navigation, icon, or layout change made in this execution.

---

## 10. Completion Roadmap

Nine phases, sequenced by genuine dependency (confirmed against the evidence above, not merely following the directive's suggested order verbatim — the order held up).

### Phase A — Educational Coverage Reconciliation
- **Objective:** Turn this document's matrix into a living, re-run-able artefact; close the two named governance gaps (AR-01 deliberate-exclusion Decision; `mr05-number-property-search` misconception data-quality gap).
- **Baseline:** This document, 2026-08-16.
- **Gaps:** No automated "coverage matrix" script exists — every count in §3 was hand-queried this session. A `scripts/coverage-matrix.mjs` reusing the `007k`-style anon-key REST pattern would make this re-runnable, not one-off.
- **Boundary:** Documentation and one small script. No content, no code behaviour change.
- **Acceptance criteria:** Coverage matrix reproducible by a fresh session in under 5 minutes; both named governance gaps have a recorded Decision.
- **Evidence required:** Script output matches this document's manually-derived numbers.
- **Human review:** Founder confirms the AR-01 exclusion rationale before it's recorded as a Decision (this document does not decide it, per the directive's own instruction not to restore obsolete content unilaterally, nor to invent Decisions unilaterally).
- **Production verification:** Script run against live production.
- **Dependencies:** None — can start immediately.
- **STOP condition:** Once the matrix is reproducible and the two gaps are recorded, stop — do not proceed to content authoring under Phase A.

### Phase B — Mathematics Teaching Completion
- **Objective:** Extend 007L's proven architecture to further certified Mathematics families, per §4's bounded sequence.
- **Baseline:** 4 of ~28 families have teaching depth (§3A).
- **Gaps:** QT-MR-01's structural gap; 3+ thin families; no difficulty ladder.
- **Boundary:** Reuse `mathsTeachingContent.ts`'s exact pattern; one certified family at a time against 007L's Part 4 Evidence Standard; no second teaching engine; no difficulty-ladder implementation until it's designed (a separate, smaller sub-phase).
- **Acceptance criteria:** Each newly-added family passes all 13 of 007L's Part 4 evidence items, including live production verification.
- **Evidence required:** Automated tests + live-pathway walkthrough per family (Decision 52's standing requirement).
- **Human review:** Founder/reviewer approval per family, same pattern as Controlled Review Batches 1-4.
- **Production verification:** Required, per Decision 52 — automated tests alone are insufficient.
- **Dependencies:** Phase A's QT-MR-01 family-structure work, for that specific Question Type only; otherwise independent.
- **STOP condition:** After each certified family (or small batch), stop for review before the next — never a mass retrofit (007L's own explicit closing instruction, carried forward).

### Phase C — English Reading Completion
- **Objective:** Close the two English-specific gaps §5 identifies (dead remediation data; blocked `tick-justify` family) before any new authoring.
- **Baseline:** 9 named families, all with some Guided Practice; remediation data present but unrendered.
- **Gaps:** §5, items 1-4.
- **Boundary:** UI wiring for `addressesMisconception` in `ReadingActivity` (structurally the smallest, safest change in this entire roadmap — proven pattern, existing data, no new authoring); activation of the 11 blocked rows (governance action); depth-pass on 2 thin families; QT-RC-10 structural gap.
- **Acceptance criteria:** Remediation renders live for every English family with populated `addresses_misconception`; `wave1-fam-tick-justify` reaches `practice_eligible`.
- **Evidence required:** Same evidence-standard discipline as 007L (automated + live-pathway).
- **Human review:** Founder sign-off on remediation-category framing (mirrors 007L Part 3D), since this is learner-facing wording, not merely a technical change.
- **Production verification:** Required.
- **Dependencies:** None — can run in parallel with Phase B.
- **STOP condition:** After the remediation-rendering fix and the `tick-justify` activation, stop before any new English family authoring (that's Wave 3, explicitly out of scope for this roadmap phase).

### Phase D — Continuous Writing Completion
- **Objective:** Build the architecture defined in §6, replacing `data/writing.ts`/the uncalibrated AI score with the `ali_question_bank`/ALI-evidence-pipeline pattern.
- **Baseline:** 1 provisional row, 0 practice-eligible; live pathway runs on an entirely separate, unreviewed pool.
- **Gaps:** All of §3C.
- **Boundary:** The full MODEL→...→EXAM-CONDITION sequence in §6, but WC-01/WC-02 scored with evidence-honest separation (§6), not one blended 0-100 number.
- **Acceptance criteria:** Continuous Writing runs on real `ali_question_bank` WC-01/WC-02 content with real `recordOutcome` evidence; no `overallScore/100` claim survives without an explicit "not exam-board-calibrated" framing at minimum, ideally replaced entirely by rubric-dimension feedback.
- **Evidence required:** New — this is the one subject with no prior 007-series precedent to reuse directly (007L's architecture pattern transfers structurally, per §6, but Writing's evidence grading, WC-02 in particular, is new work).
- **Human review:** Founder review of the MODEL/rubric design before implementation, given WC-02's EMC-1 status — the same "don't claim precision unsupported by evidence" discipline this whole document has followed.
- **Production verification:** Required.
- **Dependencies:** None structurally, but realistically sequenced after B/C given Writing's larger scope (a full content-authoring effort from near-zero, not an extension).
- **STOP condition:** Design approved and a first bounded proof (mirroring 007L's own "4 families, not full retrofit" discipline) built and verified — then stop for review before wider Writing authoring.

### Phase E — Difficulty and Variation Expansion
- **Objective:** Design and implement a genuine EASY/STANDARD/HARD/STRETCH progression ladder across Mathematics and English, replacing today's ad hoc `content_difficulty` values.
- **Baseline:** Ad hoc `easy`/`medium`/`hard`/`challenge` values, no designed ladder, no per-family progression logic.
- **Gaps:** No ladder design exists anywhere in the repository today (confirmed by this audit — not found in any knowledge doc).
- **Boundary:** Design first (a new knowledge doc), then a bounded proof on a small family set (mirroring every prior increment's discipline), before any wide rollout.
- **Acceptance criteria:** A documented ladder design, Founder-approved, proven on a bounded set.
- **Evidence required:** New design work — no existing evidence to reuse.
- **Human review:** Required — this is new educational-design territory, not a reconciliation.
- **Production verification:** Required for the bounded proof.
- **Dependencies:** Meaningfully depends on B and C having matured the family set this would apply to.
- **STOP condition:** Bounded proof complete and verified; stop before wide rollout.

### Phase F — Mock Weekend and Mock Assessment System
- **Objective:** Build Decision 49's architecture, reconciling the ~4,490 lines of legacy Mock-shaped code identified in §7 rather than adding a sixth parallel route.
- **Baseline:** §7 in full — `mock_eligible = 0`, one governed-but-empty route, four ungoverned legacy routes.
- **Gaps:** Everything in §7's operational-detail list.
- **Boundary:** Route reconciliation/retirement decision first (a Founder/Product decision, not a unilateral deletion — these are pre-existing, possibly still-linked-from-navigation surfaces); then the governed sealed-reserve content pipeline; then the sitting mechanics; then the result/diagnosis loop.
- **Acceptance criteria:** A single governed Mock pathway, `mock_eligible` content genuinely sealed and separate, copyright-firewall-checked, live-verified end-to-end for at least one full sitting.
- **Evidence required:** New — no prior increment has built any part of the governed sitting mechanics.
- **Human review:** Founder review of the reconciliation decision (which legacy routes retire vs. persist) before implementation; separate review of the first sealed-reserve content batch (mirrors every Controlled Review Batch).
- **Production verification:** Required, extensively — this is the highest-stakes single feature in the whole roadmap (an ungoverned firewall break here directly compromises exam-preparation integrity).
- **Dependencies:** Meaningfully depends on B, C, D having matured the content this would draw its sealed reserve from.
- **STOP condition:** First real Mock Weekend sitting completes end-to-end for a real learner, results/diagnosis verified — stop before opening it broadly.

### Phase G — Parent/Child Readiness Experience Completion
- **Objective:** Independently verify and, where genuinely needed, extend the 7 existing parent routes (§3E) against real data, once B-F have given them something real to report on.
- **Baseline:** Substantial existing implementation, not independently re-verified this session.
- **Gaps:** Unknown until independently verified — this phase starts with an audit, not an assumption of completeness.
- **Boundary:** Verification first; extension only for genuine, evidenced gaps.
- **Acceptance criteria:** Every parent route confirmed to show real, current data for a real learner.
- **Evidence required:** Live-pathway verification, parent-facing.
- **Human review:** Founder review of what parents actually see, given this is the primary trust-building surface of the whole product.
- **Production verification:** Required.
- **Dependencies:** Depends on B-F for there to be real readiness/Mock data to display meaningfully.
- **STOP condition:** All 7 routes verified against real data; stop before any new parent feature.

### Phase H — Product Experience and Visual Transformation
- **Objective:** The separate, Product-leadership-led Visual Audit, using §9 as its educational-requirements input.
- **Baseline:** §9.
- **Gaps:** §9's route/terminology/empty-state findings.
- **Boundary:** Not this programme's to define further — explicitly a separate activity.
- **Acceptance criteria / evidence / human review / production verification:** Set by that audit, not here.
- **Dependencies:** Benefits from B-G being functionally complete first (redesigning a screen before its underlying feature is real risks designing for the wrong shape), but is administratively independent.
- **STOP condition:** Set by that audit.

### Phase I — End-to-End CSSE Simulation and Release Assurance
- **Objective:** A full, real-learner, real-timing, real-Mock-Weekend simulation of the entire LEARN→PRACTISE→MASTER→REVISE→MOCK→DIAGNOSE→NEXT-PLAN→READINESS loop, before any 95%+ launch-readiness claim is made.
- **Baseline:** No such simulation has ever been run (confirmed — no evidence of one in `ALI_DECISION_LOG.md` or any increment report).
- **Gaps:** All of it — this phase cannot start until F is real.
- **Boundary:** Verification and assurance only, no new features.
- **Acceptance criteria:** A named test learner completes the full loop; every claim this document's own §11 scorecard makes is independently re-confirmed against that real run, not re-asserted from earlier phases' own sign-off.
- **Evidence required:** Full live-pathway walkthrough, Decision-52-standard, for every stage.
- **Human review:** Founder final sign-off — this is the launch-readiness gate itself.
- **Production verification:** The entire point of the phase.
- **Dependencies:** All of B-G.
- **STOP condition:** Founder declares launch readiness or names the specific remaining gap — this phase is the programme's own natural end.

---

## 11. Readiness Scorecard

Grades reflect evidence found in this audit, not aspiration. "What blocks the next grade" is the concrete, named gap from the sections above — not a vague "needs more work."

| Area | Grade | What prevents the next grade |
|---|---|---|
| **Mathematics content coverage** | B+ | All 14 QTs represented, 141 PE rows, but QT-MR-01 has no family structure and 3+ families are thin. |
| **Mathematics teaching depth** | C | Only 4 of ~28 families (14%) have MODEL/Guided/Remediation; architecture is proven and frozen (007L), just not extended. |
| **Reading comprehension content coverage** | B | 9 of 10 QTs have a dedicated family; QT-RC-10 does not; 11 authored rows blocked in `provisional`. |
| **Reading comprehension teaching depth** | B- | Every named family has Guided Practice (broader than Maths), but remediation data is 100% dead/unrendered and 2 families are thin. |
| **Continuous Writing** | **NOT READY** | 1 provisional row, 0 practice-eligible; live pathway runs on an unreviewed static pool scored by a self-disclosed uncalibrated AI number. |
| **Teaching system (architecture, not coverage)** | B+ | 007L's pattern is proven, safe, frozen, and reusable — but proven for exactly 4 Mathematics families; not yet proven for English or Writing. |
| **Adaptive Practice (session generation, anti-clustering)** | A- | Mature, reused unmodified across every increment since its own build; no defect found in this or prior audits. |
| **Mastery/Evidence pipeline** | A- | `supportTier`/`applyAttemptOutcome` gate proven safe repeatedly (007G, 007L); subject-agnostic; no defect found. |
| **Difficulty progression** | D | Raw values exist; no designed ladder exists anywhere in the repository. |
| **Anti-memorisation** | B- | `sessionGenerator.ts`'s question-level anti-clustering is real and unmodified/unregressed across every increment — but English's supply-side depth is narrower than the mechanism protecting it: all 106 PE reading questions draw from only 19 fixed passages (7-8 questions each), all narrative fiction, no informational/non-fiction genre at all. Mathematics is not similarly constrained (no equivalent "passage" concept). |
| **Exam technique / timing (in Practice)** | D | No timed-practice or pacing feature found anywhere in Mathematics or Reading Practice. |
| **Mock** | **NOT READY** | `mock_eligible = 0`; one governed-but-empty route; four ungoverned legacy routes covering ~4,490 lines needing reconciliation before real Mock work can even start cleanly. |
| **Parent Intelligence** | B (unconfirmed) | Substantial real implementation exists; not independently re-verified against live data this session — the grade reflects code-presence evidence, not a live-data audit. |
| **Admissions Intelligence** | B- (unconfirmed) | Same basis as above; one dedicated route exists (`admissions-readiness`), depth not independently verified. |
| **Child UX** | Not separately gradable from this audit | Requires the Visual Audit (§9/Phase H); this document supplies its educational-requirements input only. |
| **Parent UX** | Not separately gradable from this audit | Same as above. |
| **Overall CSSE Product Readiness** | **C+** | See below. |

### What must be true before 95%+ launch readiness can be declared

1. Continuous Writing moves from NOT READY to at least PARTIAL (Phase D) — it is currently the single lowest-scoring subject and cannot be waved through.
2. Mock moves from NOT READY to a real, governed, single-pathway system with at least one verified end-to-end sitting (Phase F) — "Practice with a timer bolted on" is explicitly not sufficient per Decision 49, and today there is no timer either.
3. Mathematics teaching depth extends meaningfully beyond 4 families (Phase B) — 14% coverage of the proven architecture is not launch-representative of "a child can learn, not just be assessed."
4. English's dead-remediation-data gap closes (Phase C, item 1) — this is the cheapest fix in the entire roadmap and there is no good reason for 95%+ readiness to be claimed while it remains open.
5. A real Phase I end-to-end simulation runs and passes — no prior phase's own sign-off should be trusted as a substitute for this.

**Current overall CSSE readiness is a solid content/architecture foundation (much of it genuinely proven, not merely built) with three specific, named, non-trivial completion gaps — Writing, Mock, and Mathematics teaching-depth breadth — standing between today and 95%.** This is consistent with the directive's own framing that the remaining percentage should represent normal continuous improvement, not missing core capability — three of the "normal improvement" items (Phases B, C, E) are genuinely incremental, but two (D, F) are closer to first-build-from-near-zero than completion, and should be sized and communicated to the Founder as such, not understated.

---

## 12. Documents created/changed

**At original baseline reconciliation:**
- **Created:** `ANGEL_CSSE_COMPLETION_PROGRAMME_V1.md` (this document).
- **Changed:** None. No existing decision/governance document was edited. No historical evidence deleted.

**Added during Phase A (Baseline Freeze and Critical Architecture Protection), 2026-08-16 — see Decisions 58-61 in `ALI_DECISION_LOG.md` for full detail:**
- **Governance:** `ALI_DECISION_LOG.md` — Decisions 58 (Applied Reasoning current-exclusion), 59 (Mock Content Firewall), 60 (Continuous Writing mastery safety), 61 (canonical coverage-matrix authority, if numbered separately — see the log for the exact number used).
- **Code (bounded corrections only, reviewed diff, no unrelated changes):** `lib/learningEngine/assessmentBrainMap.ts`, `app/learning-intelligence/founder-validation/csse/page.tsx`, `app/mocks/adaptive/{gl,english,maths,vocabulary}/page.tsx`, `lib/learningEngine/legacyPracticeEvidence.ts`, `app/writing/page.tsx`, `app/learning-intelligence/practice/[area]/page.tsx`.
- **Tests added:** `tests/lib/learningEngine/assessmentBrainMap.test.ts` (5), `tests/lib/ali/mockContentFirewall.test.ts` (9), `tests/lib/learningEngine/writingMasterySafety.test.ts` (7).
- **Reproducibility artefact:** `scripts/coverage-matrix.mjs`.
- **Historical documents corrected with an explicit, dated notice (not silently edited; underlying historical figures left unedited)**, per the instruction not to delete or rewrite historical evidence: `CSSE_EXAMINATION_BLUEPRINT.md` §5 (confidence upgraded to Founder-confirmed), `knowledge/.../CSSE_FULL_MOCK_STRUCTURE_DECISION_V1.md` (correction notice added).
- **This document:** §2, §3A-3D, §7, and this section updated to reflect the above; §10-11 not restructured (Phase A's findings did not surface a dependency requiring the Phase B-I sequence to change).
