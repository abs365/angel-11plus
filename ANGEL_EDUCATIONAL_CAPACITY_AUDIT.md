# Angel 11+ — Educational Capacity, Preparation Horizon & Content Scale Audit

Programme Increment 017. Research/architecture-evidence only — no content generated, no migrations created, no production mutated. Repo: `angel-11plus` @ `3c905c10b7a88c29a777d949ed7d6c359bcfa5bf` (220 migration files). Reading-scoring attempts (`e2f26f8d…`, `f7ac5c70…`, `5f08cb6e…`, `a7dbd06a…`) untouched throughout this audit.

---

## 1. Executive Verdict

**NOT READY** for high-frequency, long-duration usage without further content and architecture investment — but the reason is not "too few questions" in isolation. Three findings compound into one core risk:

1. **Fresh content exhausts fast.** Under every modelled usage pattern (Part 7), a learner exhausts first-time-fresh Mathematics practice content within roughly 2–5 weeks, and English faster still. This is a mathematical consequence of pool size, not a subjective impression.
2. **The mechanisms that should compensate for a finite pool are either not built or not wired.** Retention/spaced-resurfacing genuinely works (a real strength — Part 8). Preparation-horizon adaptivity, speed/accuracy intelligence, and most of teaching depth do **not** currently change what a learner is served — they exist as engines but are cosmetic or absent at the decision point that matters.
3. **The true live production content volume is not reliably known from the repository.** 151 of 220 migration files are marked "NOT APPLIED. Generated for Founder review and manual application" — including, on the evidence gathered, almost the entire English content base beyond one early wave. Any capacity target set today must be understood as provisional until this is reconciled.

The Practice/Mock firewall (migrations 208/209) is a genuine, well-engineered, test-proven strength and should be preserved unmodified, exactly as instructed.

---

## 2. Current Educational Inventory (headline numbers)

All figures are **[REPO]** (defined in migration files) unless marked **[LIVE, confirmed]**. See Sections 3–4 for full detail and citations.

| | Mathematics | English (Reading) | English (Writing) |
|---|---|---|---|
| Competency codes | 6 (MR-01…06) + 14 QT-MR sub-codes | free-text `skill`, 9 values in use | 1 code (QT-WC-01a) |
| Question rows [REPO] | 293 | 246 | 14 (+4 legacy static, non-DB) |
| Question rows [LIVE, best-confirmed anchor] | ~194 practice-eligible (Decision ~172-174) | ~42 (Wave 1 only; everything after is unconfirmed) | unconfirmed |
| Passages | n/a | 30 [REPO] | n/a |
| Distinct question families | 73 (of 293 rows, 261 tagged) | not tracked as a concept | n/a |
| Mock-eligible pool [LIVE] | 48 rows / 24 numbered / 48 marks | 28 raw / 27 numbered / 65 marks (`reading-comprehension-mock-1`) — application status of this migration (217) itself unconfirmed | 1 reserved item named, no assembled Mock form |
| Deterministic vs judgement-required | n/a (all short-answer, arithmetic-scored) | 174–187 deterministic : 59 judgement-required (≈3:1) | 100% judgement-required |
| Diagrams/images/video | 0 (13 rows carry a data-table stimulus only) | 0 (text-only) | 0 |

---

## 3. Mathematics Capacity

- **Competency taxonomy**: 6 canonical MR-0x codes (`docs/intelligence/CSSE_COMPETENCY_FRAMEWORK.md` §5), refined into 14 QT-MR-xx sub-codes (of 27 total codes across all subjects, `docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md:20,30`). `CSSE_COMPETENCY_TOPIC_MAPPING.md:41-54` self-documents real granularity gaps — no dedicated Fractions/Decimals/Ratio/Measurement/chart-reading competency code exists.
- **Practice question count**: 293 rows defined across 29 migration files (013→176), zero duplicate IDs, zero deletions. By QT code, ranges from 39 (QT-MR-01) down to 9 (QT-MR-08) — an uneven spread across the 14 sub-codes.
- **Live anchor**: the most recent independently-confirmed live figures found in `ALI_DECISION_LOG.md` are Practice Eligible = 194, mock_eligible = 48 (24 numbered/48 marks), independently_validated = 8, dated after Decision ~172-174. No later Mathematics-specific live snapshot exists in the log; it continues for thousands more lines but subsequent entries are English-only.
- **Remediation**: no dedicated pool or content-type column exists. Remediation is a *rendering* decision (`shouldRenderMisconceptionNote()`, gated off an `addresses_misconception` text field) reusing the **same** practice pool a learner already saw — not fresh content.
- **Teaching-stage categorization**: no formal `tier`/`purpose` taxonomy. Real proxies: `content_difficulty` (easy/medium/hard/challenge), `transfer_class` on 226/293 rows (FAR_TRANSFER 102, ROUTINE 49, NEAR_TRANSFER 36, MIXED_TRANSFER 33), and `learning_unit_id` (202 distinct free-text groupings, with `-guided`/`-independent`/`-independent-retry` suffixes embedded in the string, not an enum).
- **Difficulty distribution** [REPO, 293 rows]: medium 172, hard 84, easy 36, challenge 1 — heavily medium-weighted, almost no true "challenge" tier.
- **Marks distribution** [REPO]: 1 mark = 224, 2 marks = 66, 3 marks = 3 (Decision 172/174 later corrects 21 of the 2-mark rows to 1 mark as a marking-integrity fix).
- **Question type**: 100% `short-answer`. Zero multiple-choice rows despite the schema defaulting to it.
- **Question families**: `family_id` populates 261/293 rows into **73 distinct families**, averaging ~3.6 rows/family, hand-authored ("seed + variants"), confirmed **no procedural/template generation exists anywhere** (`ALI_DECISION_LOG.md` line ~2011 states this explicitly).
- **Mock reserve reconciliation problem**: migration 147 targets 56 rows/21 questions into "First Mock 1," which *exceeds* the 48-row mock_eligible figure last confirmed live — and migration 147/150 are themselves flagged NOT APPLIED. This cannot be cleanly resolved without a live query; flagged, not fabricated.
- **Visual**: 13/293 rows carry a data-table stimulus; zero diagrams, images, or charts anywhere in Mathematics content — confirmed directly against `lib/mockAttempt/types.ts:44-50`'s own statement that "table" is the only stimulus type this codebase has ever built.

---

## 4. English Capacity

- **Reading skill taxonomy**: no dedicated table — a free-text `skill` column. Values in use: evidence (73), vocabulary (55), inference (37), structure (23), effect-of-language (14), atmosphere (13), comparison (6), character (6), language (4). No "retrieval" or "sequencing" skill label exists as such; sequencing instead appears as a validation-tier shape (`TIER4_ORDERED_LIST`).
- **Passages**: 30 distinct passages defined across 11 migrations (044, 049, 051, 063, 097, 152, 161, 166, 191, 193 — migration 045 is a repair re-insert of Wave 1's existing 6, not new content).
- **Question count**: 246 rows tagged `subject='english'`. By validation tier: TIER2_ACCEPTED_SET 142, TIER3_QUOTATION_PLUS_EXPLANATION 50, TIER4_ORDERED_LIST 23, TIER5_NAMED_COMPONENT_PLUS_EXPLANATION 9, TIER6_MULTI_SELECT 8, TIER1_EXACT_MATCH 1, plus 13 legacy untiered rows scored by an older keyword-overlap heuristic.
- **Deterministic vs judgement-required**: 174 deterministic (TIER1+2+4+6) vs 59 forced to `requires_manual_marking` (TIER3+5) — ≈2.95:1, or ≈3.17:1 including the 13 legacy rows as automatic.
- **Writing**: 14 database rows, all one competency code (QT-WC-01a, reflective/discursive, open-response, `hard` difficulty), spanning narrative/descriptive/discursive/opinion genres. A second writing competency (e.g. a picture-stimulus prompt) was explicitly not attempted — no image pipeline exists (migration `098:65-70`). A separate, legacy, non-database static pool (`data/writing.ts`, 4 prompts) also exists and is not part of the governed content system.
- **Mock (`reading-comprehension-mock-1`)**: exact composition asserted in migration 217 — 28 raw rows / 27 numbered / 65 marks, 3 passages (20/30/15 marks), difficulty easy 5/medium 21/hard 2/challenge 0, skill evidence 14/inference 6/vocabulary 6/structure 2. Reserve pool: 2 passages + 1 writing prompt, explicitly *not yet included* in any active manifest.
- **No dedicated remediation/teaching/transfer/revision pools exist for English either** — the same generic `revision_priority`, `mastery_threshold`, and `addresses_misconception` fields used for Mathematics are the only proxies; no equivalent to Mathematics's `family_id`/`transfer_class` concept was found for English content.
- **Visual**: zero — text-only across every English/passage migration examined.

### The single most consequential finding in this audit

**Migrations 062 through 220 — essentially every English content-foundation migration (152-220), all Mock-Reading/Writing foundation work (097-220), the Reading Mock 1 activation itself (217), and its scoring authority (219-220) — carry an explicit "NOT APPLIED" header.** Only Wave 1 (migration 044: 6 passages / 42 questions) has independent evidence of being live (with a documented passage-row repair in migration 045). This means the 246-question, 30-passage figure above is a **repository ceiling, not a production fact** — the true live English content base may be closer to 42 questions and 6 passages. Every English capacity conclusion in this document must be read with that range in mind. This is not a new defect this audit introduces — it is the same "generated, not yet Founder-applied" pattern this program's own Increment 016 already surfaced for migrations 219/220 specifically; this audit found it is the *dominant* state for nearly all English content, not an isolated case.

---

## 5. Question-Family Diversity

A "question family" concept **does exist** for Mathematics (`family_id` column, migration 030) but is informal — hand-grouped by the content author, not validated against any conceptual-diversity metric, and averages only ~3.6 rows per family (73 families / 261 tagged rows). **No equivalent concept exists for English at all.**

Per the Founder's requested metrics:

| Metric | Mathematics | English |
|---|---|---|
| Raw question count | 293 [REPO] / ~194 [LIVE] | 246 [REPO] / ~42 [LIVE, likely] |
| Distinct conceptual family count | 73 (self-declared groupings) | **not tracked — schema gap** |
| Difficulty distribution | measurable (Section 3) | measurable (validation tier only; a `content_difficulty`-equivalent per-skill breakdown was not extracted this pass) |
| Representation diversity (MCQ vs short-answer vs other) | 0 — 100% short-answer | not extracted; English uses free-text/selection response types per tier, not separately tallied |
| Context diversity (real-world scenario variety) | not measured — no scenario-tagging field exists | not measured |
| Answer-type diversity | 1 type (short-answer) | 6 tiers, genuinely diverse |
| Reasoning depth | proxy only (`transfer_class`) | proxy only (`validationTier`) |
| Known misconception coverage | `addresses_misconception` present on a subset, count not separately extracted | same field, same gap |
| Transfer capacity | 102/293 rows tagged FAR_TRANSFER | no transfer-class equivalent found |

**Explicit schema/evidence gaps**: there is no conceptual-similarity metric, no representation/context-diversity field, and no per-family coverage-of-misconceptions count anywhere in the schema for either subject. These would need to be built, not queried.

---

## 6. Anti-Memorisation Risk

Classified from repository evidence, not generic claims:

| Risk factor | Evidence | Classification |
|---|---|---|
| Narrow family pool relative to raw count (Mathematics) | 73 families / 293 rows ≈ 4 rows/family; no procedural generation exists at all | **HIGH** |
| No question-family concept for English at all | schema gap — cannot even measure this risk for English | **HIGH** (unmeasurable ≠ safe — treat as unproven-safe) |
| Remediation reuses the same small pool a struggling learner just failed | no separate remediation content anywhere (Section 3) | **HIGH**, specifically for weaker/repeat learners |
| Retention resurfacing draws from the same small family pool | `lib/ali/selection.ts` resurfacing mechanism is real and well-built (Section 8) but has no larger reservoir to draw from than the same 73 families | **CRITICAL** for the specific persona the Founder named — a capable child using Angel frequently over 6–24 months will cycle the same ~73 Mathematics families repeatedly, this being architecturally by design, not a bug in the resurfacing logic itself |
| Practice-content contaminating sealed Mock content | migrations 208/209 + `mockContentFirewall.test.ts` — DB-enforced, test-proven, bidirectional (Practice↛Mock and Mock↛Practice) | **LOW** — this specific risk is genuinely well-controlled |
| Predictable distractor construction, repeated wording, repeated answer positions | not independently content-audited at the individual-question level this pass (293+246 items, out of scope to read exhaustively) | **UNPROVEN** — flagging as a real gap in this audit, not claiming safety |

**Net verdict: HIGH, rising to CRITICAL for the Founder's named "capable, frequent user" persona specifically**, driven structurally by family-pool size and the absence of any generation/variation mechanism — not by a flaw in the (otherwise good) retention engine.

---

## 7. Sustainable Usage Modelling

**Do not assume 1 interaction = 1 unique question** — the retention/resurfacing engine (Section 8) legitimately reuses content. The categories below map to what actually exists in the codebase today, not an idealised model:

- **REUSABLE TEACHING** — the 2 full lesson pages + 26 Mathematics "worked-example" family entries (`lib/learningEngine/mathsTeachingContent.ts`). Revisitable at near-zero freshness cost.
- **RENEWABLE FLUENCY/PRACTICE** — the `mastered-resurface` mechanism in `lib/ali/selection.ts`, gated by a distance-since-last-seen threshold. Architecturally sound, but draws from the *same* small family pool as fresh practice (Section 6).
- **FRESH INDEPENDENT PRACTICE** — first-time-seen questions from the live practice-eligible pool. This is the scarce resource; see below.
- **TRANSFER/MEASUREMENT** — the 102 FAR_TRANSFER-tagged Mathematics rows; no English equivalent found.
- **SEALED ASSESSMENT / MOCK RESERVE** — the mock-eligible pools (Section 2 table).

### Interaction-volume grid (total interactions, not unique questions)

Weekly Interaction Volume (WIV) = days/week × interactions/day:

| WIV (days×rate) | Weekly | 12 wk | 6 mo (~26wk) | 12 mo (52wk) | 18 mo (78wk) | 24 mo (104wk) |
|---|---|---|---|---|---|---|
| 3×15 = 45 | 45 | 540 | 1,170 | 2,340 | 3,510 | 4,680 |
| 3×30 = 90 | 90 | 1,080 | 2,340 | 4,680 | 7,020 | 9,360 |
| 3×50 = 150 | 150 | 1,800 | 3,900 | 7,800 | 11,700 | 15,600 |
| 5×15 = 75 | 75 | 900 | 1,950 | 3,900 | 5,850 | 7,800 |
| 5×30 = 150 | 150 | 1,800 | 3,900 | 7,800 | 11,700 | 15,600 |
| 5×50 = 250 | 250 | 3,000 | 6,500 | 13,000 | 19,500 | 26,000 |
| 7×15 = 105 | 105 | 1,260 | 2,730 | 5,460 | 8,190 | 10,920 |
| 7×30 = 210 | 210 | 2,520 | 5,460 | 10,920 | 16,380 | 21,840 |
| 7×50 = 350 | 350 | 4,200 | 9,100 | 18,200 | 27,300 | 36,400 |

### Where exhaustion begins (RAW capacity)

Using the best-confirmed **live** Mathematics pool (194 practice-eligible questions): even the *lowest* modelled intensity (3×15 = 45/week) exhausts first-time exposure to the **entire** live pool in **≈4.3 weeks** (194÷45). The highest intensity (7×50 = 350/week) exhausts it in under 4 days. Using the repository-ceiling figure (293) instead of the live anchor changes this only to ≈6.5 weeks at the lowest intensity — the conclusion is the same order of magnitude either way.

### Effective Fresh Capacity

**Cannot be precisely computed — returned as a range, with the missing metadata named, per instruction:**

- **Upper bound**: raw live-question count (~194 Mathematics; English likely far smaller — Section 4).
- **Lower, more honest bound**: distinct **family** count, since a family's variants are not conceptually fresh to a learner who has seen a sibling variant — **73 for Mathematics** (no equivalent figure computable for English at all, since no family concept exists there). At 73, even the lowest-intensity cohort (45/week) exhausts distinct-concept freshness in **under 2 weeks**.
- **What's missing to calculate this reliably**: (a) confirmed live-vs-repo content counts (Section 4's core finding), (b) a validated conceptual-family/diversity metric for English, (c) the `usage_count`/`avg_success_rate` columns that already exist on `ali_question_bank` but are never read back into any decision (Part 13/16) — without consumption tracking, "effective fresh" for an *individual* learner's actual history cannot be computed at all today, only a population-level ceiling.

**Range to carry forward: Effective Fresh Capacity today is somewhere between ~73 and ~194 for Mathematics, and materially less than that (unmeasurable precisely) for English** — both far below what any of the modelled usage patterns consume in even a single 12-week block.

---

## 8. Year 4 → Year 6 Preparation-Horizon Findings

A genuinely well-built clock/stage engine exists (`lib/learningEngine/preparationClock.ts`, `preparationStage.ts` — computes a 7-value stage from time-remaining + evidence + school year, with an explicit Year-4-vs-Year-6 safeguard at `preparationStage.ts:87`) — **but its own code comment states it is "deliberately kept to messaging/emphasis only this increment, not wired into which questions get selected"** (`preparationStage.ts:104-106`), confirmed at both real call sites (`app/dashboard/page.tsx:439-460`, `app/pathways/page.tsx:97-102`): it only changes a dashboard tagline string.

**Concretely proven**: a Year 4 learner and a Year 6 learner with identical practice history are served the **identical** Practice question set and sequence by `generatePersonalisedSession()` → `lib/ali/selection.ts`, which takes no school-year or clock parameter at all. Nothing gates Mock-attempt creation by preparation stage either — a Year 4 learner with 20 months remaining can start a full Mock exactly as freely as a Year 6 learner with 3 weeks remaining.

**Verdict: the architecture to solve this exists and is well-designed; it is simply not connected to the one place it would matter.** This is the highest-leverage, lowest-new-build-cost gap in this entire audit (see Part 22).

---

## 9. Entry/Placement Findings

Distinguishing **DATA CAPTURED** from **DATA ACTUALLY USED FOR EDUCATIONAL DECISIONS** (mandatory distinction, confirmed field-by-field):

| Field | Captured? | Used for a real decision? |
|---|---|---|
| Target pathway/exam | Yes | **Yes** — gates CSSE-only content and question selection (`lib/learningEngine/profile.ts:26`, `lib/learningEngine/sessionGenerator.ts`) |
| School year | Yes | No — feeds only the cosmetic stage tagline (Section 8) |
| Target exam date | Yes | No — same, cosmetic only |
| Competency strengths/weaknesses | No, at onboarding | **Yes, but computed later** from live practice evidence (`weakSkills`, `lib/ali/selection.ts:72,218-228`) — a real decision input, just not an onboarding fact |
| Target schools | **No** | — |
| Previous preparation | **No** | — |
| Baseline attainment | **No** — no diagnostic-on-entry exists anywhere | — |
| Working speed | **No** | — |
| Accuracy (self-reported/confidence) | **No** | — |
| Recent retention | **No** at capture; computed reactively (Section 8) via resurfacing distance | Yes, reactively |

There is no onboarding wizard anywhere in the codebase — profile creation (`ensureProfile()`, `lib/supabaseProgress.ts:108-189`) sets only `auth_user_id`/`device_id`/`name`. Pathway and exam-date are set later, only from `app/pathways/page.tsx`, not a dedicated intake flow.

---

## 10. Teaching-Depth Findings

Full EXPLAIN→MODEL→GUIDED→INDEPENDENT lesson sequences exist for **2 of 13 CSSE competencies (~15%)**: Arithmetic (MR-01) and Percentages (MR-04). The Learn hub itself discloses this honestly to the learner: *"Two Mathematics lessons are ready today. The rest of the curriculum isn't yet, and we'd rather show you that plainly."*

For every other competency, and for every non-CSSE pathway learner entirely, the path is explanation-then-questions with no dedicated guided/worked-example page — mitigated only by a **reactive** (wrong-answer-triggered) inline worked example, which exists for 26 Mathematics question-families and a smaller equivalent for English (`lib/learningEngine/englishExamStrategies.ts`). No explicit TRANSFER or RETRIEVAL stage is named in either lesson page.

**Verdict: PARTIAL, concentrated almost entirely in Mathematics, and shallow (2/13) even there.**

---

## 11. Speed/Accuracy Findings

Only coarse, whole-attempt timing is captured (`started_at`/`submitted_at`/`expires_at` on a full Mock attempt). Per-question timing is **not computable even in principle from the current schema** — there is an `answered_at` timestamp but no matching "question shown at" marker, so duration-per-question cannot be derived even retroactively. `answered_at` itself has **zero read references anywhere in `lib/`** (full-repo grep). The Mock analysis engine (`lib/ali/mockAnalysisEngine.ts`) contains zero timing/duration/speed-related code at all.

**Verdict: CAPTURED-ONLY, and even the capture is too coarse to answer the Founder's own four-way question** (accurate+fast / accurate+slow / fast+inaccurate / slow+inaccurate) **without a schema change first.** Nothing downstream — mastery, difficulty, Practice selection, remediation, revision, Mock analysis, parent intelligence — reads any timing signal today.

---

## 12. Retention/Retrieval Findings

**This is the one clear, genuine PASS in the entire audit.** Mastery is explicitly revocable, not permanent: `applyAttemptOutcome()` (`lib/ali/mastery.ts:44-89`) demotes a mastered competency back to "learning" on a single subsequent wrong answer (by design, documented in the code's own comment). Separately, a real spaced-resurfacing mechanism (`selectQuestions()`, `lib/ali/selection.ts:155-268`) reintroduces mastered content once a distance-since-last-seen threshold is crossed, weighted into the live selection pool with an explicit `"mastered-resurface"` reason — and this is genuinely called from the real learner-facing practice flow (`app/learning-intelligence/practice/[area]/page.tsx:228`), not merely present in a library. A separate calendar-based "Maintenance Review" concept is fed by real pre-attempt-snapshotted `last_presented_at` data specifically engineered to detect genuine gaps.

**The only qualification**: this strong mechanism draws from the same small family pool identified as the anti-memorisation risk in Section 6 — the engine is sound, the reservoir it draws from is not yet large enough to let it do its job safely at scale.

---

## 13. Visual/Multimedia Findings

Zero diagrams, illustrations, charts, animations, interactive demonstrations, or video exist anywhere in the content base for either subject. The only non-text stimulus type ever built is a plain data table (13/293 Mathematics rows) — confirmed directly against the type definition's own comment (`lib/mockAttempt/types.ts:44-50`): *"only member today ('table')... no diagrams, images, or charts."*

Per the Founder's own instruction not to recommend visuals merely because competitors have them: this audit did **not** find direct evidence of a specific competency where the *absence* of a diagram is currently blocking correct answering or teaching (e.g. no geometry content requiring a figure was flagged as broken by any test or content-review artifact examined) — but that absence-of-evidence is itself a gap: no content-quality review artifact in this codebase currently asks "does this question need a visual to be answerable/teachable," so a real instance could exist undetected. Recommend this become an explicit check in the human-review criteria (Part 14/17) rather than a blanket "add visuals" mandate.

---

## 14. Practice Capacity

Combined repo-defined raw pool: 293 (Mathematics) + 246 (English Reading) + 14 (Writing) = 553 items. Best-confirmed live combined floor: ~194 (Mathematics) + ~42 (English, likely) + unconfirmed (Writing) ≈ **~236 or fewer** live practice items today, against the exhaustion timelines in Section 7. See Section 7 for the full sustainability analysis — this is the central quantitative finding of the audit.

---

## 15. Mock Capacity / Reserve

| | Mathematics | Reading | Writing |
|---|---|---|---|
| Active Mock-eligible pool [LIVE] | 48 rows / 24 numbered / 48 marks | 28 raw / 27 numbered / 65 marks [migration 217, application unconfirmed] | none assembled |
| Consumed into an active form | 56 rows targeted by migration 147 (exceeds the 48 checkpoint — unreconciled, flagged not fabricated) | all 27 numbered questions consumed into `reading-comprehension-mock-1` | n/a |
| Protected/reserved-not-included | not separately quantified in evidence gathered | 2 passages + 1 writing prompt, explicitly named as reserved | 1 writing prompt named, no dedicated Mock form exists at all |
| Distinct named Mock forms found anywhere in the repo | `mathematics-mock-1` (+ a superseded legacy id) | `reading-comprehension-mock-1` | **none** |

**Explicit number the Founder asked for — genuinely fresh Mock sittings currently supportable without reuse, borrowing Practice, or violating the firewall**: **not computable from repository evidence alone.** The denominator (pool size above) is known; the numerator requires a live count of `ali_mock_attempt` rows already consuming that pool, cross-referenced against the exposure-tracking view migration 209 already built for exactly this purpose (`ali_mock_exposed_question_ids`). The read-only query needed is named in Section 21 (Evidence Limitations). Qualitatively: with only 2 Reading passages and 1 Writing prompt held in reserve, and Mathematics's reserve figure unresolved, **the reserve is thin relative to any repeated-sitting product ambition** — a second or third genuinely fresh sitting per subject is not currently evidenced as available.

---

## 16. Bulk-Production Readiness

Assessed against the Founder's 17-stage pipeline:

| Stage | Status | Evidence |
|---|---|---|
| Specification | PARTIAL | programme blueprint docs exist, not code |
| Competency | EXISTS | `lib/ali/assessmentHierarchy.ts`, QT codes throughout |
| Subskill | EXISTS | `skill`/`family_id` columns |
| Misconception | PARTIAL | tagging/labelling exists (`mathsTeachingContent.ts`), no generative taxonomy |
| Question Family | EXISTS | `family_id` real column, 73 Mathematics families |
| Difficulty | EXISTS (field) / MISSING (calibrated) | field exists; no calibration pipeline reads outcomes back into it |
| Context | PARTIAL | manually authored per batch, no structured context taxonomy |
| Variation Rules | **MISSING** | no generative variation code found anywhere |
| Candidate Generation | **MISSING** | authoring scripts produce hand-written SQL from hand-authored data, not generated candidates |
| Validation | PARTIAL | arithmetic-correctness scripts only |
| Duplicate/Similarity Check | PARTIAL | `lib/ali/structuralSignature.ts` — deterministic, explicitly non-semantic |
| Predictability Check | **MISSING** | no evidence found |
| Originality/Copyright Check | **MISSING** | a `provenance` field exists but no automated scan |
| Educational Review | EXISTS | `app/admin-beta/review/page.tsx` + `lib/adminReview.ts`, per-family human workflow |
| Inventory Classification | EXISTS | `eligibility_status` enum + promotion migrations |
| Release | EXISTS | freeze→activate pattern (migrations 147→150, 212→217) |
| Performance Calibration | **MISSING** | `usage_count`/`avg_success_rate` columns exist but nothing reads them back into any decision |
| Revalidation/Retirement | PARTIAL | the firewall (208/209) is retirement-adjacent (blocks reuse) but is not a general quality-triggered retirement workflow |

**Verdict: NOT READY for controlled high-volume production.** The governance/classification/review scaffolding at the *back* of the pipeline (Educational Review, Inventory Classification, Release) is genuinely solid and should be reused, not rebuilt. The generative *front* of the pipeline (Variation Rules, Candidate Generation, Predictability, Originality) does not exist at all — which is architecturally consistent with the fact that all 553 repo-defined items today are individually hand-authored.

---

## 17. Human-Review Requirements

**Currently machine-validated** (with citation): SQL migration integrity (`scripts/migration-sql-guard.mjs`), forbidden punctuation in learner copy (`scripts/copy-quality-guard.mjs`), Mathematics arithmetic/answer correctness (`scripts/007i-maths-answer-verification.mjs` and successors), the Practice/Mock firewall itself (migration 208/209 triggers + `mockContentFirewall.test.ts`), manifest eligibility/grouping-completeness/duplicate-ID checks at attempt creation (migration 145), and a non-semantic structural-duplication hint (`lib/ali/structuralSignature.ts`).

**Not automated, and per the Founder's own list, should not be claimed as automatable**: natural language quality, age appropriateness, difficulty calibration, ambiguity, distractor quality, reasoning depth, writing quality, passage quality, cultural/context appropriateness, and — critically for Section 6's core risk — whether two questions are conceptually too similar despite surface differences. All nine currently route to the existing per-family human review criteria in `app/admin-beta/review/page.tsx` (`REVIEW_CRITERIA`, `WRITING_REVIEW_CRITERIA`, `MATHS_TEACHING_REVIEW_CRITERIA`). This surface is a real, reusable foundation for scaling review — it is the generative front-end feeding it that's missing, not the review gate itself.

---

## 18. Competitive Capability Matrix

Classified against the competitor set the Founder supplied as context (Think Academy, Exam Papers Plus, Quest for Exams, Pretest Plus, Eleven Plus Exams, Examberry). **Important limitation, stated plainly rather than glossed over**: this session does not have detailed, feature-level competitor data in context — only the Founder's own framing that mature 11+ products market "very substantial inventories, topic structures, videos, explanations, Mocks, progress tracking and long preparation programmes." Where a comparison requires a specific competitor feature count I do not have, it is marked NOT ENOUGH EVIDENCE rather than guessed. Where Angel's own internal evidence (Sections 3-17) makes the comparison self-evident regardless of exact competitor numbers, it is classified with confidence.

| Category | Classification | Basis |
|---|---|---|
| Content depth/teaching sequences | BEHIND | only 2/13 competencies have a full lesson (Section 10); Angel's own Learn hub self-discloses this |
| Practice volume/breadth | MATERIALLY BEHIND | ~194–293 Mathematics, ~42–246 English vs an industry norm of "very substantial inventories" per Founder's own framing |
| Question depth (families/diversity) | MATERIALLY BEHIND | 73 families total, no generation mechanism (Section 5/6) |
| Mocks | BEHIND | 2 named forms total, thin/unresolved reserve (Section 15), no Writing Mock form at all |
| Exam specificity | NOT ENOUGH EVIDENCE | Angel's CSSE-specific framework is real (Section 3) but comparison requires competitor exam-coverage specifics not in context |
| Worked explanations | BEHIND | reactive-only for 26/many families, no proactive worked-example library beyond that |
| Video/media | MATERIALLY BEHIND | literally zero video/diagram/animation content exists (Section 13) |
| Progress tracking | NOT ENOUGH EVIDENCE | real progress/mastery infrastructure exists (Section 12) but competitor-parity comparison not evidenced in this session |
| Speed/accuracy intelligence | MATERIALLY BEHIND | captured-only and too coarse even for Angel's own use (Section 11) |
| Parent reporting | NOT ENOUGH EVIDENCE | parent-facing surfaces exist in the app (`app/learning-intelligence/parent/*`) but not audited in this increment's scope |
| Personalisation | BEHIND | the one genuinely adaptive mechanism (retention resurfacing) is real; preparation-horizon and pathway-level personalisation are cosmetic-only (Section 8) |
| Motivation/gamification | NOT ENOUGH EVIDENCE | out of this audit's scope |
| Long-term learner capacity | MATERIALLY BEHIND | Section 7's exhaustion timelines are the direct evidence |
| Visual quality | MATERIALLY BEHIND | zero visual assets |
| Trust (governance, protection, review discipline) | **LEADING or COMPETITIVE** | the Practice/Mock firewall, evidence-discipline conventions ("NOT APPLIED" self-disclosure), and structured review workflow are unusually rigorous engineering for this product category — a genuine, evidenced strength |

---

## 19. P0/P1/P2/REJECT Gaps

**P0 — required before Angel can credibly fulfil its core promise:**
1. **Live-inventory reconciliation.** Nearly every capacity number in this document is qualified by "repo-defined, application unconfirmed." No further capacity planning is trustworthy until this is resolved with real, read-only production queries.
2. **Wire the Preparation Horizon stage into actual content/Mock-gating decisions.** The engine already exists (Section 8) — this is a connection problem, not a build problem, and directly answers the Founder's named "don't force a late entrant through a long foundation sequence / don't let a Year 4 learner drill Mocks prematurely" requirement, currently unmet.
3. **Expand fresh/family content depth for the highest-usage, highest-risk competencies.** Section 7's exhaustion timelines and Section 6's memorisation risk are the same underlying problem.
4. **Build a rapid baseline/placement diagnostic for new/late entrants.** Currently entirely absent (Section 9) — without it, "adaptive entry" has no data to adapt to.

**P1 — important competitive capability:**
- Wire speed/accuracy capture (after a schema fix to make it even measurable) into remediation/difficulty decisions.
- Expand teaching-depth lesson sequences beyond 2/13 competencies.
- Build a genuine Continuous Writing Mock form/capacity — currently does not exist as an assembled product.
- Build the missing bulk-pipeline stages (Variation Rules, Candidate Generation, Performance Calibration, Predictability/Originality checks) — needed before any high-volume content programme, not before this audit's P0s.

**P2 — useful enhancement:**
- Purposeful visual/diagram content, targeted at specific competencies where a concrete teaching/assessment gap is demonstrated (not blanket-added) — see Section 13's caveat.
- Onboarding capture of previous-preparation/self-reported-confidence, once there is a decision point that would actually use it.

**REJECT — competitor capability Angel should deliberately not copy:**
- Matching a competitor's advertised raw inventory number (e.g. "20,000+") without family-diversity backing — this would directly reproduce the memorisation risk this audit identifies as CRITICAL, at larger scale.
- Adding video/media purely for competitive parity without a demonstrated teaching gap it fills, per the Founder's own instruction.

---

## 20. Quantified Capacity Recommendations

Derived mathematically, not chosen to match a competitor's marketing number, per instruction — shown as ranges where evidence is genuinely insufficient for a point estimate:

- **Minimum sustainable Practice capacity**: enough distinct conceptual families that even the *peak* modelled cohort (7 days × 50/day = 350/week) does not exhaust first-pass freshness inside a defensible initial-exposure window. Using an 8–12 week initial-exposure design target (a standard instructional-design assumption — extended, spaced consolidation should dominate afterwards, which the existing retention engine already supports): 350/week × 8–12 weeks ≈ **2,800–4,200 fresh items needed per subject at full maturity** to cover the highest-intensity cohort without early exhaustion. This is a target for the *content programme's eventual scale*, not something to build immediately — see Section 21 sequencing.
- **Target effective fresh inventory**: given current family-averaging (~4 rows/family), reaching the 2,800–4,200 range via the *same* authoring density would still leave thin per-family diversity. Target **≥15–25 variants per family**, meaning the family count itself should grow to roughly **150–280 distinct families per subject** (vs. today's 73 for Mathematics, ~0 formalised for English) — this is the number that actually reduces memorisation risk from HIGH/CRITICAL to LOW/MODERATE, not the raw item count alone.
- **Target conceptual-family coverage**: 3–5× current Mathematics family count (73 → 220–365); English needs a family concept built before a target is even meaningful.
- **Target remediation depth**: currently zero dedicated remediation content exists (100% practice-pool reuse). Target a genuinely separate remediation-tagged subset ≥20% of each competency's family count, so a struggling learner is never re-shown the exact item they just got wrong.
- **Target transfer capacity**: scale proportionally with the family-count target — currently 102/293 (~35%) of Mathematics content is FAR_TRANSFER-tagged; maintain that ratio as the base grows, and build an equivalent tag for English.
- **Target revision capacity**: ≥3–4 distinct resurfacing-eligible items per family, so spaced resurfacing does not degrade into repeatedly showing the identical item.
- **Target Mock reserve**: maintain at least 2–3 full additional reserved forms per subject at all times (i.e. reserve ≥2× the size of the currently active manifest) — current reserve (2 passages + 1 writing prompt for Reading; unresolved for Mathematics) is well under this.

**Where evidence is insufficient for a number at all** (explicitly, per instruction): English family-diversity targets, and the true live-vs-repo baseline every one of these ranges should be recalculated from once Section 21's reconciliation is done.

---

## 21. Preparation Horizon Architecture Proposal (proposal only — not implemented)

The engine to build this **already exists** (`preparationClock.ts` + `preparationStage.ts`, Section 8) — the proposal is to *wire* it, not rebuild it, into four states:

- **FOUNDATION** (long runway, weak/sparse evidence): prioritise the competencies with a full teaching sequence first; **gate Mock-attempt creation entirely**; allow broad, low-stakes exploration across all competencies without urgency-driven narrowing.
- **DEVELOPMENT**: broaden family exposure per competency; begin structured remediation loops (once Section 19 P1's remediation-depth gap is closed); Mock access limited to diagnostic-only use, if any.
- **EXAM PREPARATION** (the stage the existing clock already computes from time-remaining + evidence): combine the stage signal with the *already-working* `weakSkills` override in `lib/ali/selection.ts` — currently these are two separate, unconnected mechanisms; fusing them lets the system skip already-secure material and prioritise genuine gaps, which is exactly the capability the Founder asked to prove exists and this audit found does not (Section 8). Increase Mock cadence within reserve constraints (Section 15/20).
- **FINAL READINESS**: dense high-stakes Mock cadence drawn from reserve; confidence-building review of already-secure content via the existing retention-resurfacing mechanism (Section 12); stop introducing brand-new competencies.

**Late Year 6 entrant**: the state must not default to "Foundation" merely because Angel has no prior evidence for this learner — that would force exactly the unnecessary foundation sequence the Founder wants avoided. The missing piece is the **rapid baseline/placement diagnostic** named as P0 #4 (Section 19): a deliberate, fast, upfront assessment pass that populates the same `weakSkills` evidence structure the app already knows how to use *reactively* — so a late entrant's genuine gaps surface in hours, not weeks of organic practice, and the EXAM PREPARATION stage (correctly, given their true time remaining) engages immediately with real gap data rather than a default foundation path.

**Year 4 long-runway learner**: avoided by the FOUNDATION-stage Mock gate above — currently nothing prevents this learner from starting a full Mock immediately; this is a concrete, closeable gap.

---

## 22. Recommended Implementation Sequence (bounded, ordered — not a plan to execute without further approval)

1. **Live-inventory reconciliation** — read-only queries only, zero content/code risk, prerequisite to every number in Sections 14/15/20 being trustworthy.
2. **Wire the existing Preparation Horizon stage** into (a) Mock-attempt-creation gating and (b) combination with the existing `weakSkills` selection mechanism — reuses two engines that already exist; no new intelligence engine required.
3. **Build the rapid baseline/placement diagnostic** for new/late entrants — new, bounded scope, feeds directly into step 2's existing consumption point.
4. **Timing-capture repair** (add the missing per-question start marker) and wire the result into the existing selection/remediation signal — a small schema addition, not a new engine.
5. **Content-family expansion**, sequenced *last* and data-driven from steps 1–3's findings (which competencies are highest-usage and highest-risk) rather than blind volume growth — this is where the Bulk Content Factory (Section 16/17) work belongs, once there is a validated pipeline to do it safely.

---

## 23. Evidence Limitations / Unknowns

Stated plainly rather than smoothed over:

- **Live production content state is the largest unknown in this entire audit.** 151/220 migrations self-declare "NOT APPLIED"; this marker is a generation-time snapshot never edited out after real application (consistent with this codebase's own "never silent edit" discipline, confirmed by the fact that a clearly-superseded old migration still carries the same header text). No canonical "confirmed-live-as-of-today" document exists in the repository. The read-only queries that would resolve this: `SELECT eligibility_status, subject, count(*) FROM ali_question_bank GROUP BY 1,2`; `SELECT id, jsonb_array_length(question_manifest) FROM ali_mock_form`; `SELECT form_id, count(*) FROM ali_mock_attempt WHERE status='submitted' GROUP BY 1`.
- Mock reserve/consumption numerators (Section 15) require the same live queries plus a join against migration 209's `ali_mock_exposed_question_ids` view.
- No conceptual-family concept exists for English at all — every English family-diversity conclusion in this document is qualitative, not quantified.
- Individual-question-level content review (predictable distractors, repeated wording patterns, repeated contexts) was not performed against all 553 items — out of this audit's scope; flagged as unproven-safe, not claimed safe.
- Competitive comparison (Section 18) is limited by not having detailed competitor feature data in this session's context; several rows are honestly marked NOT ENOUGH EVIDENCE rather than estimated.
- Sections 3/4's counts for `eligibility_status` by subject in a few places reflect cross-subject totals not yet separated per-subject (noted inline where this applies) — a mechanical extraction task, not a conceptual gap.

---

## 24. AUTHORITATIVE PRODUCTION RECONCILIATION (Programme Increment 018)

Sections 1–23 above are **preserved unmodified** as the repository audit — the estimates below are recorded, not deleted, per instruction. This section supersedes specific repository-derived numbers with Founder-executed, read-only production query results (evidence hierarchy: production database > historical Founder evidence > deployed code > repository definitions > migration comments — a migration's own "NOT APPLIED" header does not override this).

### 24.1 Mathematics

| | REPOSITORY ESTIMATE (§3, Increment 017) | PRODUCTION RESULT (Increment 018) | RECONCILED VERDICT |
|---|---|---|---|
| Total/live rows | 293 defined; live status uncertain pending reconciliation | **293 active** | Repository row count was accurate; the live-status uncertainty is resolved — all 293 are active in production. |
| Practice-eligible / "live" framing | Full-stack simulation gave 174; a separate historical Decision Log anchor gave 194 | **194 learner-reachable Practice rows** | The Decision Log anchor (194) was correct; the full-migration-stack simulation (174) was not. **194 is the learner-reachable Practice pool, not total live inventory — 293 is total live inventory.** This distinction must be maintained going forward. |
| Mock-eligible | Decision Log anchor: 48 | **77** | Superseded. 48 was stale; 77 is current. |
| Distinct families | 73 (of 261/293 tagged rows) | **73 distinct family IDs** (276/293 tagged, 17 untagged) | Family count matches exactly; the tagged-row count differs slightly (261 vs 276) — immaterial to the 73-family conclusion. |
| Question type | 100% short-answer, 0% MCQ | **293/293 short-answer, 0 multiple-choice** | Confirmed exactly. Recorded as a **diversity finding, not automatically a defect** — CSSE/pathway requirements should determine whether answer-type expansion is appropriate, per Founder instruction. |
| Difficulty distribution | medium 172 / hard 84 / easy 36 / challenge 1 | **medium 172 / hard 84 / easy 36 / challenge 1** | Confirmed exactly. |
| Remediation | "No dedicated remediation pool — reuses same practice pool via UI rendering" (still architecturally true) | **259/293 rows (≈88%) carry a populated `addresses_misconception` tag** | Structural finding stands (no separate pool), but misconception-tag *coverage* is broader than Increment 017 implied — recorded as a positive correction to that specific number. |

**New family-depth distribution (not previously queried)**: 2 families have 1 row; 51 have 2–4 rows; 18 have 5–9 rows; 2 have 10+ rows. This is now the authoritative basis for the anti-memorisation finding (§6) — the overwhelming majority of families (51/73, ≈70%) sit in the thinnest safely-usable band (2–4 variants).

### 24.2 English Reading

| | REPOSITORY ESTIMATE (§4, Increment 017) | PRODUCTION RESULT (Increment 018) | RECONCILED VERDICT |
|---|---|---|---|
| Total/live rows | 246 defined; "likely closer to 42 live" (Wave-1-only inference from "NOT APPLIED" migration headers) | **243 active** | **MATERIAL POSITIVE CORRECTION.** The ~42-live inference was wrong. Nearly the entire repository-defined pool (243 of 246) is live. The "NOT APPLIED" header is confirmed — for the second time in this programme's history, after the identical finding in Increment 016 for migrations 219/220 — to be an unreliable live/not-live signal on its own; it must never again be treated as evidence of non-application without a corroborating production read. |
| Practice-eligible/reachable | Not separately computed (flagged as a gap) | **142 learner-reachable Practice rows** | New authoritative figure. |
| Mock-eligible | Not separately computed | **50** (28 exposed/consumed, 22 unexposed reserve) | Internally consistent: 28 + 22 = 50. |
| Passages | 30 distinct passages defined in repository | **30 active passages** | Confirmed exactly — unlike the question-row "NOT APPLIED" confusion, the passage-defining migrations were correctly inferred as live. |
| Deterministic:judgement ratio | 174:59 (≈2.95:1), tiers TIER2 142/TIER3 50/TIER4 23/TIER5 9/TIER6 8/TIER1 1 | TIER1 1 / TIER2 139 / TIER3 44 / TIER4 23 / TIER5 15 / TIER6 8, legacy 13 → deterministic (1+139+23+8=171) : judgement-required (44+15=59) | Broadly confirmed (≈2.9:1); minor tier-count shifts (TIER2 -3, TIER3 -6, TIER5 +6) reflect real content changes since the repository migration set was authored, not a measurement error. |

**New finding, not previously identified**: passage-level `eligibility_status` lags well behind question-level eligibility — only 1 of 30 passages is `practice_eligible` and 5 are `mock_eligible`, despite 142 *questions* being practice-eligible. This means passage eligibility, not question eligibility, may be the binding constraint on reachable Reading content, and was not visible in the Increment 017 repository audit (which did not query passage eligibility distribution). Flagged for investigation in Workstream B, not resolved here.

**Consumed/reserved passages confirmed exactly** against the Founder's named anchors: 3 exposed (Bees, Boathouse, Understudy — matching the `reading-comprehension-mock-1` composition), 2 unexposed mock-eligible reserve (Loose Connection, Sail and Steam).

### 24.3 Continuous Writing

| | REPOSITORY ESTIMATE | PRODUCTION RESULT | RECONCILED VERDICT |
|---|---|---|---|
| Total rows | 14 (repository count, confirmed as the DB row count in Increment 017) | **14 active** | Confirmed exactly. |
| Learner-reachable Practice | Not previously computed | **7** | New finding. Recorded, per Founder instruction, as **a genuine scale constraint** — half of the already-small live pool is not reachable through ordinary Practice. |

### 24.4 Mathematics Mock 1

| | REPOSITORY ESTIMATE (§15) | PRODUCTION RESULT | RECONCILED VERDICT |
|---|---|---|---|
| Active form + identity | Uncertain — Increment 017 treated `first-mock-mathematics-v1` as a "superseded legacy id" and could not confirm which form was truly live; cited a 48-row/48-mark figure | `first-mock-mathematics-v1`, active=true, 56 manifest rows, 56 distinct questions, **56 marks**, displayName "Mathematics Mock 1", 2 total attempts / 1 submitted | **Superseded, with a correction to my own prior characterisation**: `first-mock-mathematics-v1` is not legacy — it is the live active Mathematics Mock 1 form, exactly matching the Founder's supplied anchor. The 48-row/48-mark figure is retired. |

### 24.5 Reading Comprehension Mock 1

| | REPOSITORY ESTIMATE (§15) | PRODUCTION RESULT | RECONCILED VERDICT |
|---|---|---|---|
| Manifest/marks | 28 raw rows / 27 learner-facing display units / 65 marks (from migration 217's own asserted composition) | `reading-comprehension-mock-1`, active=true, 28 manifest rows, 28 distinct questions, **65 marks**, 5 total attempts / 4 submitted | Confirmed exactly. The 27-vs-28 figure is not a discrepancy: 28 is the database manifest row count, 27 is a frontend/display grouping fact (paired sub-questions rendered as one unit) — both are simultaneously true, at different layers. |

### 24.6 Mathematics Future Mock Reserve — the central "do not silently replace history" case

- **HISTORICAL PLANNING POSITION** (prior programme planning, preserved unmodified): approximately **34 marks** protected future-Mock reserve, with ~22 further marks judged necessary to reach another full 56-mark Mock floor.
- **CURRENT LIVE STRICT POSITION** (production query: `eligibility_status='mock_eligible' AND not yet exposed to any Mock form`): **21 rows / 21 marks**.
- **RECONCILED VERDICT**: 21 marks is the current authoritative *strictly mock-eligible-and-unexposed* reserve under the live classification/exposure query. This does not overwrite the 34-mark historical planning figure — the two numbers likely describe different populations (the historical figure may have included content under a different eligibility/review state, or was a pre-exposure planning assumption made before some of that content was actually consumed into `first-mock-mathematics-v1`'s 56-row manifest). **No inference is made about which specific cause applies — that would require evidence this reconciliation does not have.** What is certain: under today's live, strict classification, **a fresh 56-mark Mathematics Mock cannot currently be assembled from the 21-mark reserve alone** — this is now a verified, not estimated, capacity constraint.

### 24.7 English Future Mock Reserve

Strict live reserve: **22 unexposed mock-eligible question rows, 39 marks, 2 unexposed mock-eligible passages** (Loose Connection, Sail and Steam). The three Reading Mock 1 passages (Bees, Boathouse, Understudy) are confirmed already exposed/consumed and remain protected under the firewall — **not** returned to Practice, consistent with the cross-Mock reuse prohibition this audit already found well-engineered (§6, §11).

### 24.8 Teaching, Preparation Horizon, Late Entrant — preserved, independently re-verified, unchanged by production data

These three findings are architectural/code facts, not database facts, and were already independently re-verified against current deployed source in the prior turn of this increment (not merely carried over from Increment 017's sub-agent report):

- **Teaching coverage**: Mathematics 2/12 currently-iterated competencies (`ALL_COMPETENCY_IDS`, `lib/learningEngine/assessmentBrainMap.ts:111` — 13 raw competency keys minus the AR-01 exclusion — ≈17%); English 0/9 (of the 9 distinct Reading skill values catalogued in §4.1). This remains a major educational-scale gap, now confirmed against a much larger live content base than Increment 017 believed existed — i.e. the gap is a *teaching-sequencing* gap, not primarily a *raw-content-existence* gap.
- **Preparation Horizon**: confirmed display-only — `stagePrinciple()`'s own code comment (`lib/learningEngine/preparationStage.ts:104-106`) states it is "not wired into which questions get selected." It does not control question selection, Mock access, placement, difficulty, or programme sequencing.
- **Late entrant**: confirmed absent — no baseline/placement diagnostic exists; Mock-attempt creation (`app/learning-intelligence/mock-exam/page.tsx`) has exactly one gate (`isMockFormAvailable`, an existence check), with zero reference to preparation stage or readiness anywhere in that path.

### 24.9 Founder Strategic Interpretation (recorded verbatim as programme position)

Production evidence changes the *conclusion* about content existence, not the conclusion about content *sufficiency*. Angel has a meaningful live educational foundation: 293 live Mathematics questions, 243 live English Reading questions, 14 live Writing prompts, 194/142/7 learner-reachable respectively, two active production Mock forms, real retention/retrieval architecture (§12, unaffected by this reconciliation — remains a genuine strength), and strong Practice/Mock governance (§6, §11, unaffected — the firewall's numbers were confirmed, not contradicted, by this reconciliation). It does **not** yet have the content depth, family diversity, teaching coverage, placement architecture, or long-runway capacity required to sustain a highly engaged learner from Year 4 through selective-school examination. Both statements are true simultaneously; neither supersedes the other.

### 24.10 Updated Capacity Verdict

**PARTIALLY READY** — revised from Increment 017's "NOT READY," reflecting that raw content existence is now confirmed substantial rather than uncertain. The binding constraints are no longer "does the content exist" but: (a) family-depth thinness (51/73 Mathematics families sit at only 2–4 variants — the exhaustion mathematics in §7 is essentially unchanged by this reconciliation, since it was already built on family counts, not raw row counts), (b) teaching-sequence coverage (2/12, 0/9), and (c) preparation-horizon/placement architecture being entirely non-operational. A final raw-question capacity target is **deliberately not set here** — per Founder instruction, it must be derived from preparation horizon, weekly usage, competency breadth, conceptual families, safe reuse, retrieval, freshness, transfer, and assessment protection together, not chosen in isolation now that a raw count is known.

### 24.11 Biggest Verified Educational Gap

**Preparation Horizon is entirely non-operational (0% wired), and no late-entrant placement exists at all.** This is judged the single biggest verified gap over the family-depth/teaching gaps (§24.1, §24.8) because it is a complete architectural absence rather than a thin-but-present capability — the clock/stage engine exists and computes a real answer, but nothing downstream reads it, and no diagnostic exists to feed it quickly for a new learner. It is also the gap most directly contradicted by the Founder's own stated core requirements (must not force a late entrant through unnecessary foundation work; must not let a long-runway learner drill Mocks prematurely) — requirements that, per §24.4–24.5's confirmed Mock-access findings, are currently unmet in production exactly as in the repository audit.

### 24.12 Recommended Next Programme

Per Founder instruction, **not** Increment 017's "content-family-expansion-last" sequencing. Two coordinated workstreams, run in parallel, neither implemented in this increment:

**Workstream A — Preparation & Placement**: entry/placement, late-entrant diagnostic, time-to-exam, existing competency evidence, weakness prioritisation, Mock appropriateness, acceleration, revision, readiness.

**Workstream B — Educational Content Scale**: Question Family Registry, conceptual diversity, anti-memorisation, content inventory classes, controlled variant production, teaching expansion, Practice expansion, transfer, retrieval, Mock reserve (§24.6/24.7's now-verified 21-mark/39-mark strict reserves are the starting denominators), Writing expansion, visual educational assets.

Implementation architecture for either workstream awaits a separate Founder instruction.
