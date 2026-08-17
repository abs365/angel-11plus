# Angel 11+ — 007S: Content Foundation and Exposure Architecture V1

**Educational Increment 007S.** Prepared 2026-08-17. Continues from Educational Increment 007R (Founder/Product APPROVED as the strategic baseline).
**Scope:** resolve the two structural prerequisites 007R identified before any 472-estate authoring begins — (A) English passage-level exposure architecture, (B) structural coverage design for QT-MR-01 and QT-RC-10. Implementation is authorised and performed for (A) only, per the directive's own Part 4 gate ("if the investigation confirms the gap and the correction is safely bounded"). Family architecture for (B) is design only, not authored.

---

## Part 1 — Baseline reconciliation (fresh, live)

Re-queried production directly (not trusted from 007R):

| Metric | 007R baseline | This increment (before work) | Match |
|---|---|---|---|
| TOTAL | 264 | 264 | ✓ |
| Practice Eligible | 247 | 247 | ✓ |
| Mathematics PE | 141 | 141 | ✓ |
| English PE | 106 | 106 | ✓ |
| Writing PE | 0 | 0 | ✓ |
| Provisional | 17 | 17 | ✓ |
| Mock Eligible | 0 | 0 | ✓ |
| Mathematics named families | 27 | 27 | ✓ |
| English named families | 9 | 9 | ✓ |
| English distinct passages | 19 | 19 | ✓ |
| QT-MR-01 dedicated families | 0 | 0 | ✓ |
| QT-RC-10 dedicated families | 0 | 0 | ✓ |
| QT-MR-01 PE / provisional | 14 / — | 14 / 1 | ✓ (007R cited PE only) |
| QT-RC-10 PE | 3 | 3 | ✓ |

**Zero material discrepancy against 007R. No STOP triggered.**

---

## Part 2 — Passage exposure root cause (re-derived from the live implementation, not merely re-asserted from 007R)

**Traced directly, this increment, reading the actual production code:**

1. **`groupingKeyOf(q)`** (`lib/ali/exposureIntelligence.ts`) returns `q.familyId ?? q.learningUnitId`. This is the ONE key used by every diversification/exposure mechanism English Practice has.
2. **Family exposure** (`computeFamilyExposure`) aggregates a learner's real per-question history (`fetchStudentHistory`) into per-group exposure records, keyed by `groupingKeyOf()`.
3. **Question-level exposure**: real, persistent, and entirely unaffected by anything in this increment — `lib/ali/selection.ts`'s cooldown mechanism (Decision 4) operates purely on each question's own `id`, has zero family/passage awareness, and is not touched here.
4. **Passage identity DOES participate in selection today** — but only via the `learningUnitId` **fallback branch** of `groupingKeyOf()`, which fires **only when `familyId` is absent.** Confirmed live: every one of the 9 named English families (`wave1-fam-*`, `wave2-fam-*`) carries a populated `family_id` on every row. The fallback is therefore **dead code for every named-family row** — it only still functions for the 13-row legacy ungrouped pool (`family_id: null`), where `groupingKeyOf()` already resolves to the passage id correctly.
5. **Repeated passage exposure across different families IS confirmed possible**, with hard live evidence, not inference: querying `family_id`/`learning_unit_id` pairs live shows **15 of 19 passages each feed 5-7 different named families** (e.g. `wave1-eng-kitemaker` feeds `wave1-fam-synonym-battery`, `wave1-fam-tick-justify`, `wave1-fam-quote-explain`, `wave1-fam-sequencing`, `wave1-fam-emotion-cause`, `wave1-fam-vocab-explain`, `wave1-fam-direct-retrieval` — 7 families, one text). Since `reduceFamilyClustering()` and `applyRetrievalPriority()` (`lib/learningEngine/sessionGenerator.ts`) both key exclusively off `groupingKeyOf()`, neither mechanism could ever see that two selected questions from two *different* families shared one passage.
6. **A learner CAN encounter the same passage repeatedly through different Question Types** — both within one session (the family-clustering pass only prevents 2 questions from the *same* family; it never checked passage identity for named rows) and across sessions (the spaced-retrieval/deprioritisation pass only tracks "family last seen," with no passage-level memory at all for named rows).
7. **Persistent exposure evidence that exists:** per-question history only (`ali_student_question_history`-backed `StudentQuestionHistoryRow`: `timesSeen`, `lastPresentedAt`, `masteryState`, keyed by `questionId`). No family-level or passage-level exposure is stored — both are computed in-memory, at session-generation time, from that same per-question history. This means the fix (Part 4) requires no new table and no new persistent store — only a second in-memory aggregation, keyed differently.

**A live regression test proving the pre-fix gap was real** (not hypothetical) is included in Part 4's new test suite (test 3b: "the family-level pass alone would NOT have caught the cross-family passage repeat").

**007R's own conclusion is confirmed, not merely repeated — re-derived independently from the live code and live data this increment.**

---

## Part 3 — Passage exposure standard

**Exposure hierarchy, four distinguished levels:**

| Level | Key | Mechanism | Status before 007S | Status after 007S |
|---|---|---|---|---|
| QUESTION EXPOSURE | `question.id` | `lib/ali/selection.ts` cooldown (Decision 4) | Real, persistent, subject-agnostic | Unchanged |
| FAMILY EXPOSURE | `familyId` (structural QT-shape family) | `groupingKeyOf()` → `reduceFamilyClustering`/`applyRetrievalPriority` | Real, for every named family | Unchanged |
| **PASSAGE EXPOSURE** | `learningUnitId` (shared text, English only) | **New: `passageGroupingKeyOf()`, same two functions run a second time** | **Absent for every named family** | **Live, both within-session and cross-session** |
| QUESTION-TYPE EXPOSURE | `skill` (QT code) | `weakSkills` targeting (priority-based, not diversity-based) | Indirectly diversified via family variety (most families map 1:1 or narrowly to a QT) | **Design only — not implemented this increment (see below)** |

**Design for each requirement:**

- **Within-session protection:** `reduceFamilyClustering()`, called a second time keyed by `passageGroupingKeyOf()` — caps each session at one question per passage, in addition to the existing one-per-family cap, whenever a distinct alternative exists.
- **Recent-session cooldown / longer-term familiarity:** `computeFamilyExposure()` + `classifyRetrievalStage()`, called a second time keyed by `passageGroupingKeyOf()` — a passage confirmed secure recently is deprioritised (not suppressed) via `applyRetrievalPriority()`'s existing NEW/IMMEDIATE_REMEDIATION/SHORT_TERM/SPACED/MASTERY_MAINTENANCE stage model, applied to passages exactly as it already applies to families.
- **Fallback when supply is shallow:** unchanged, reused exactly — both passes only ever swap when a genuinely distinct, not-yet-selected alternative exists in the candidate pool; if none exists, the repeat is left in place, never dropped. This was already the correct, tested behaviour for the family-level pass and is inherited unmodified.
- **Deterministic testability:** both functions remain pure (no randomness, no wall-clock dependency beyond the existing `now` parameter), confirmed by a dedicated determinism-preserving regression (Part 4).
- **QUESTION-TYPE EXPOSURE (design only, not implemented):** a QT-level anti-clustering pass (e.g. "no more than half a session from one QT") is a legitimate future refinement, but is **not** required to close 007R's own finding — family-level variety already provides partial QT diversification today, since most families map to one or two QTs — and the directive's Part 4 authorisation is specifically scoped to "passage-aware exposure protection," not a third dimension. Recommended as a candidate for a future, separately-scoped increment, not built here.

**The system degrades gracefully by construction:** every swap in both new passes is conditional on a real, not-yet-selected, distinct-key alternative existing in the pool — proven directly by Part 4's shallow-pool and no-deadlock regression tests, not merely asserted.

---

## Part 4 — Implementation: passage-aware selection

**Implemented**, since the investigation (Part 2) confirmed the 007R gap with direct live evidence and the correction is safely bounded (a second pass through an already-proven mechanism, not a new engine).

### Change 1 — `lib/ali/exposureIntelligence.ts`
- Added `passageGroupingKeyOf(q)`: returns `q.learningUnitId` when `q.subject === "english"`, `undefined` otherwise. Explicitly subject-scoped (not merely relying on Maths/VR's `learningUnitId === id` convention being permanent) so Mathematics/VR selection can never be affected by this dimension even if that convention changes in future.
- Generalised `computeFamilyExposure(candidatePool, history, keyFn = groupingKeyOf)` — existing callers unaffected (default preserves prior behaviour byte-for-byte); the new caller passes `passageGroupingKeyOf`.

### Change 2 — `lib/learningEngine/sessionGenerator.ts`
- Generalised `reduceFamilyClustering(selected, candidatePool, keyFn = groupingKeyOf)` and `applyRetrievalPriority(selected, candidatePool, exposureByFamily, now, keyFn = groupingKeyOf)` — same default-preserving pattern.
- `generatePersonalisedSession()` now runs each pass **twice**: once as before (family-keyed, unchanged), then again keyed by `passageGroupingKeyOf` — for both the within-session diversification pass and the cross-session spaced-retrieval pass.
- **No parallel selector was created.** `lib/ali/selection.ts` (the cooldown engine) is untouched. Mastery logic (`lib/ali/mastery.ts`) is untouched. Eligibility is untouched. Mock is untouched (Mock does not call `generatePersonalisedSession` — it uses a wholly separate `fetchQuestionBank()` code path, per 007R's own finding, re-confirmed by the grep in Part 13 below).

### Regression tests added — `tests/lib/learningEngine/passageAwareSelection.test.ts` (9 new tests), proving all 7 required points:

1. **Duplicate avoidance intact** — no duplicate id can be introduced by either pass (both only select from `!selectedIds.has`).
2. **Family diversification intact** — same-family repeats still reduced to one, unchanged.
3. **Passage diversification across different families works** — modelled on the exact real production pattern (one passage, two different named families); a companion test proves the pre-fix single-pass mechanism genuinely could NOT catch this (the gap was real, not hypothetical).
4. **Mathematics unaffected** — both the clustering pass and the retrieval-priority pass produce byte-identical output with and without the second (passage) pass, for Mathematics questions.
5. **Shallow pools degrade gracefully** — a 2-question pool with no alternative passage leaves the repeat in place, never drops a question.
6. **No deadlock** — every candidate already mastery-maintained on its passage: both functions return cleanly, all questions retained, no exception.
7. **No internal ID leakage** — every returned item is a reference-identical member of the original candidate pool; neither pass constructs new objects that could carry a stray internal field.

### Verification

- Full suite: **389/389** (380 baseline + 9 new), zero regressions.
- TypeScript: clean.
- Copy Quality Guard: PASS, 0 violations across 233 files.
- Production build: succeeds, no errors.
- Mathematics bank-wide answer regression (`007k-bankwide-answer-regression.mjs`, live production data): **168/168 PASS**, unaffected.
- Mastery protection suite (`mathsMasteryProtection.test.ts`, `writingMasterySafety.test.ts`): 24/24, unaffected.
- Mock Content Firewall suite (`mockContentFirewall.test.ts`): unaffected (included in the 389).
- Production counts re-queried live, after all code changes: **TOTAL 264, PE 247, Maths PE 141, English PE 106, Writing PE 0, Provisional 17, Mock Eligible 0 — byte-identical to before this increment's work.** No migration was run; no `ali_question_bank` row was written.

---

## Part 5 — QT-MR-01 (Direct Arithmetic) evidence review

**From `docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md` (existing, Founder-Accepted evidence, re-read this increment, not re-derived from raw papers):**

> **Measurement Purpose:** Requires the candidate to carry out a stated arithmetic operation (addition, subtraction, multiplication, division, fraction or decimal arithmetic) and produce a single numeric answer, **with no embedded word problem or missing operand.**
> **Confidence Rating: HIGH. Evidence Maturity: EMC-4** — present as the paper's opening question(s), identical format, **all three years** (CSSE-006 Q1/Q13 2023; CSSE-011 Q1-3 2022; CSSE-016 Q1-2 2021). **Known Limitations: None material.**

This is the single strongest-evidenced Question Type in the entire Mathematics framework (only QT-MR-01 and the general-paper facts carry EMC-4 with no limitation). Corroborating context (Assessment Brain, unchanged): Mathematics is exact-match only, calculators prohibited, no partial/method credit — meaning QT-MR-01 items must have one unambiguous correct final value.

**Structural dimensions the evidence directly supports** (from the definition's own wording, not invented): **operation type** (add/subtract/multiply/divide), **number domain** (whole number / decimal / fraction, explicitly named), and the explicit **exclusion** of word-problem framing and missing-operand structure (those are QT-MR-04/-13 and QT-MR-02 respectively — already-separate Question Types, confirming CSSE itself treats these as structurally distinct). **Multi-operation/order-of-operations** is not separately named in the QT-MR-01 definition, but is a natural reading of "carry out a stated arithmetic operation" when more than one operation appears in a single expression, and QT-MR-01's own "Supporting Competencies: MR-06" (algebraic/symbolic) signals a legitimate far-transfer direction into combined-operation expressions. **Money, measures, and speed-demand are NOT evidenced as QT-MR-01-specific dimensions** — money/measures word-framing belongs to QT-MR-03/-04/-09/-10, and no timing sub-requirement is stated anywhere in the QT-MR-01 evidence — so this document does **not** invent them as MR-01 family dimensions.

**Why Angel currently has no dedicated family despite this being the highest-evidence QT:** the 14 currently-Practice-Eligible QT-MR-01 rows all predate migration 030 (the Content Scale Gate that introduced `family_id`) — they are exactly the legacy ungrouped pool (Part 1B of 007R), never re-classified into named families because no content-governance pass has yet targeted QT-MR-01 specifically. This is a **process gap, not an evidence gap** — the evidence to build real families has been sitting in the repository, Founder-Accepted, since before Phase B even began.

---

## Part 6 — QT-MR-01 family architecture (design only — no questions authored)

**Minimum genuinely different family set: 4**, not one — each separated because it changes diagnosis (a learner weak on fraction arithmetic is not weak on whole-number arithmetic), teaching (each needs its own worked-example algorithm), and misconception profile.

### Family 1 — `mr01-whole-number-computation`
| Field | Value |
|---|---|
| Child-facing name | Number Crunching |
| Skill | QT-MR-01 |
| Structural rule | A single stated whole-number operation (+, -, ×, ÷), 2-4 digit operands, no word framing, no missing operand, one exact numeric answer |
| Variation dimensions | operation type; operand digit-count; division with/without remainder (remainder-handling rule stated in the question) |
| Misconceptions | carrying/borrowing errors; multiplication-table gaps; division-algorithm order errors; remainder mishandling |
| MODEL requirement | Yes — one worked example per operation type |
| GUIDED requirement | Yes — partial-working scaffold per operation type |
| Remediation | Standard-algorithm walkthrough, targeted to the specific misconception surfaced |
| EASY profile | 2-digit ± 2-digit, or single-digit ×/÷; 1 reasoning step, no distractor strength beyond careless error |
| EXAM-STANDARD profile | 3-4 digit operands, standard algorithm required |
| HARD/CHALLENGE profile | Division with a remainder requiring interpretation, or operand magnitude chosen to make mental shortcuts unreliable |
| Near transfer | Different operation, same digit-count band |
| Far transfer | None within this family (QT-MR-01's own definition excludes word-problem/multi-step framing — far transfer belongs to Family 4) |
| Proposed sibling depth | 8-10 |

### Family 2 — `mr01-decimal-computation`
| Field | Value |
|---|---|
| Child-facing name | Decimal Precision |
| Structural rule | A single stated decimal operation (+, -, ×, ÷), up to 2 decimal places, no word framing |
| Variation dimensions | operation type; decimal-place count; whether operands have matching or differing decimal places |
| Misconceptions | decimal-point misalignment on ±; place-value errors on ×/÷ by a decimal; treating decimals as whole numbers |
| MODEL/GUIDED | Yes/Yes |
| Remediation | Place-value/alignment-focused walkthrough |
| EASY | Matching decimal places, ± only |
| EXAM-STANDARD | Differing decimal places, all 4 operations |
| HARD/CHALLENGE | Multiplication/division by a decimal less than 1 (a genuine, evidenced misconception trigger — result larger/smaller than intuition suggests) |
| Near transfer | Different operation, same place-value band |
| Far transfer | None within family |
| Proposed sibling depth | 8-10 |

### Family 3 — `mr01-fraction-computation`
| Field | Value |
|---|---|
| Child-facing name | Fraction Focus |
| Structural rule | A single stated fraction operation (+, -, ×, ÷), including mixed numbers, no word framing |
| Variation dimensions | operation type; like/unlike denominators; proper/mixed-number operands |
| Misconceptions | adding denominators directly; incorrect mixed-number-to-improper conversion; not simplifying the final answer (relevant given exact-match marking) |
| MODEL/GUIDED | Yes/Yes |
| Remediation | Common-denominator / conversion-focused walkthrough |
| EASY | Like denominators, proper fractions only |
| EXAM-STANDARD | Unlike denominators, requires finding a common denominator |
| HARD/CHALLENGE | Mixed numbers, unlike denominators, multiplication/division of fractions |
| Near transfer | Different operation, same denominator structure |
| Far transfer | None within family |
| Proposed sibling depth | 8-10 |

### Family 4 — `mr01-multistep-order-of-operations`
| Field | Value |
|---|---|
| Child-facing name | Multi-Step Calculations |
| Structural rule | Two or more operations combined in one stated expression, requiring correct order of operations, no word framing |
| Variation dimensions | number of operations combined (2 vs 3); presence of brackets; whole-number/decimal/fraction mix |
| Misconceptions | left-to-right evaluation ignoring precedence; bracket-scope errors |
| MODEL/GUIDED | Yes/Yes |
| Remediation | Order-of-operations rule walkthrough (BODMAS-style) |
| EASY | 2 operations, brackets present and unambiguous |
| EXAM-STANDARD | 2-3 operations, no brackets, precedence must be inferred |
| HARD/CHALLENGE | 3 operations mixing whole-number/decimal/fraction terms |
| Near transfer | Different operation combination |
| **Far transfer** | Genuine — this is QT-MR-01's own stated "Supporting Competency MR-06" direction: combining with algebraic substitution (a stated unknown standing in for one term) |
| Proposed sibling depth | 8-10 |

**Total proposed QT-MR-01 depth: 4 families × 8-10 siblings = 32-40**, revising 007R's own single-family estimate of ~24 upward (see Part 10).

---

## Part 7 — QT-RC-10 (Effect-of-Language) evidence review

**From `docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md`:**

> **Measurement Purpose:** Requires the candidate to explain what a specific word choice, phrase, or narrative device suggests or implies, **beyond stating its literal meaning** — e.g. what a quiet-house description suggests about the coming event, or what "the wooden slab of cheese" suggests about the food.
> **Confidence Rating: MEDIUM. Evidence Maturity: EMC-3** — directly evidenced, open "what does this suggest/communicate" phrasing, in **two of three years** (CSSE-013 Q4/Q9 2021; CSSE-008 Q8/Q9/Q11/Q14/Q16 2022). **Known Limitations:** boundary with QT-RC-02 and QT-RC-05 is a matter of which structural feature (tick-box, quotation field) is present alongside the same underlying inferential demand — a disclosed judgement call, not a clean-edged category.

**Distinguished precisely from adjacent Question Types, using the evidence base's own boundary rules:** QT-RC-03 (word/phrase **meaning**) asks what a word literally/contextually means; QT-RC-10 asks what a word choice **implies** beyond that meaning. QT-RC-02/QT-RC-05 (quotation-retrieval/justification) test the same inferential demand but are classified separately purely because they carry an explicit tick-box or labelled-quotation-field structure — QT-RC-10 is reserved for open "what does this suggest" prose-answer format. QT-RC-08 (emotion/cause) asks what a character feels and why (plot-level causation); QT-RC-10 asks what the **author's specific language choice** communicates (a device-level, not plot-level, demand). General explanation (a catch-all) is explicitly not a Question Type in this framework at all.

**The two real worked examples in the evidence base define two genuinely distinct reasoning patterns**, both grounded in the actual CSSE instances cited, not invented: (1) a specific **descriptive word/phrase implying a quality** about an object/person ("wooden slab of cheese" → food quality), and (2) a **scene-level description implying mood/an impending event** (a quiet-house description → what is about to happen). No CSSE instance in the current evidence base clearly demonstrates variation across imagery, tone-as-a-separate-category, characterisation, or contrast as their own tested dimensions — Part 8 does not invent families for those.

---

## Part 8 — QT-RC-10 family architecture (design only — no questions authored)

**Minimum genuinely different family set: 2**, matching the two evidenced reasoning patterns above — not further subdivided, since the evidence base (EMC-3, 7 total instances across 2 years) does not support finer distinctions without inventing unevidenced categories.

**Passage dependency, disclosed plainly:** unlike most Mathematics families, every QT-RC-10 sibling is inherently tied to one specific evocative moment in one specific passage — a generic "any passage" template cannot produce a genuine QT-RC-10 item the way a numeric template can produce a Mathematics one. This means QT-RC-10's content growth is **passage-expansion-bound**, not template-bound — directly feeding Part 11's passage plan.

### Family 1 — `rc10-word-choice-implication`
| Field | Value |
|---|---|
| Child-facing name | What Does That Word Really Say? |
| Skill | QT-RC-10 |
| Structural rule | Passage contains one specific descriptive word/phrase; question asks what that word choice implies about a person, object, or situation, beyond its literal meaning |
| Variation dimensions | implied-quality type (character trait / object quality / physical state); passage genre |
| Misconceptions | restating the literal meaning instead of inferring; unevidenced speculation beyond what the text supports; answering about the general scene instead of the specific word |
| MODEL requirement | Yes — new content, none exists |
| GUIDED requirement | Yes — scaffold distinguishing "what it says" from "what it suggests" |
| Remediation | Literal-vs-implied distinction walkthrough, anchored to the specific word |
| EASY profile | Single clearly evocative word/phrase, one plausible implication |
| EXAM-STANDARD profile | Implication requires connecting the word to one nearby supporting detail |
| HARD/CHALLENGE profile | Subtle word choice, multiple superficially-plausible implications, correct answer requires specific textual justification |
| Near transfer | Different passage, same word-implication structure |
| Far transfer | Combined with QT-RC-03 (literal meaning) — genuinely two competencies required together |
| Proposed sibling depth | 8-10 (passage-bound — see Part 11) |

### Family 2 — `rc10-atmosphere-mood-interpretation`
| Field | Value |
|---|---|
| Child-facing name | Reading Between the Lines |
| Skill | QT-RC-10 |
| Structural rule | Passage describes a scene/setting; question asks what the description suggests about mood, atmosphere, or an approaching event, beyond the literal description |
| Variation dimensions | type of implied signal (mood shift / foreshadowed event); cue density (single cue vs. distributed cues) |
| Misconceptions | describing the scene literally instead of inferring the implied feeling/event; missing a tonal cue word; over-generalising from one detail |
| MODEL/GUIDED | Yes/Yes |
| Remediation | Tonal-cue identification walkthrough |
| EASY profile | Single clear tonal cue |
| EXAM-STANDARD profile | Cue distributed across two sentences |
| HARD/CHALLENGE profile | Contrasting/undercutting cues (a calm description with one unsettling detail) |
| Near transfer | Different scene, same structure |
| Far transfer | Combined with QT-RC-08 (emotion/cause) — distinctly requires justifying via the author's language choice, not plot-level causation alone |
| Proposed sibling depth | 8-10 (passage-bound) |

**Total proposed QT-RC-10 depth: 2 families × 8-10 siblings = 16-20**, close to 007R's own single-family estimate of 18 (see Part 10).

---

## Part 9 — Difficulty authoring contract (operational, not manual labelling)

### Mathematics (007R's 9-dimension framework, made into a decision procedure)

A question is classified by **counting how many of the 9 dimensions score at each tier**, not by an author's overall impression:

- **EASY**: scores EASY on ≥6 of 9 dimensions, and no dimension scores above EXAM-STANDARD.
- **HARD/CHALLENGE**: scores HARD on ≥4 of 9 dimensions.
- **EXAM-STANDARD**: everything else.

This is directly applicable to every family in Part 6: e.g. `mr01-whole-number-computation`'s EASY profile (2-digit ± 2-digit) scores EASY on reasoning-steps, hidden-operation, representation-change, transfer-distance, irrelevant-information, and combined-concepts (6 of 9) — qualifying as EASY by the rule, not by a label.

### English — new, evidence-appropriate 8-dimension composite, built for this increment (no equivalent existed before)

| Dimension | EASY | EXAM-STANDARD | HARD/CHALLENGE |
|---|---|---|---|
| Passage complexity | Simple sentence structure, familiar vocabulary | Some subordinate clauses, mixed register | Dense description, literary register |
| Vocabulary load | No unfamiliar words needed | 1-2 context-inferable words | Multiple words requiring inference from context |
| Inference distance | Answer stated near-verbatim nearby | Answer requires connecting 2 nearby details | Answer requires connecting details from separated parts of the passage |
| Evidence dispersion | Single sentence contains the evidence | Evidence spans 2 sentences | Evidence spans a full paragraph or is implicit throughout |
| Distractor plausibility | Distractors are clearly wrong on a re-read | Distractors are superficially plausible | Distractors reflect a real, named misconception (e.g. literal-for-implied confusion) |
| Reasoning steps | 1 inferential step | 2 steps | 3+ steps, or a step requiring rejecting an initially-plausible reading |
| Response precision | Any reasonable paraphrase accepted | Must reference the specific textual detail | Must both identify AND justify via the language choice itself |
| Language abstraction | Concrete, literal description | One figurative/implied element | Sustained figurative or implied meaning throughout the relevant passage section |

**Composite rule, mirroring Mathematics':** EASY = EASY on ≥5 of 8 dimensions with none above EXAM-STANDARD; HARD/CHALLENGE = HARD on ≥3 of 8 dimensions; EXAM-STANDARD otherwise.

**Neither contract is implemented in code this increment** — both are the operational standard a future authoring/generation pipeline (Part 12) must validate against, replacing manual `content_difficulty` assignment.

---

## Part 10 — 472 estate allocation model (refined, not authored)

### Mathematics

| QT | Current PE | 007R Target | Revised Target (007S) | Basis for revision |
|---|---|---|---|---|
| MR-01 Direct Arithmetic | 14 | 24 | **32-40** | 4 genuinely distinct families now designed (Part 6), each needing its own 8-10-sibling depth for real diagnosis/remediation — a single generic family underestimated true structural need |
| MR-02 Missing-Operand | 4 | 12 | 12 | Unchanged |
| MR-03 Unit Conversion | 5 | 12 | 12 | Unchanged |
| MR-04 Percentage/Proportional | 16 | 26 | 26 | Unchanged |
| MR-05 Sequence/Function-Rule | 15 | 24 | 24 | Unchanged |
| MR-06 Algebraic Symbol | 17 | 28 | 28 | Unchanged |
| MR-07 Geometric Angle/Shape | 20 | 28 | 28 | Unchanged |
| MR-08 Coordinate/Transformation | 3 | 14 | 14 | Unchanged |
| MR-09 Data Reading | 6 | 15 | 15 | Unchanged |
| MR-10 Elapsed-Time | 6 | 15 | 15 | Unchanged |
| MR-11 Number-Property | 16 | 26 | 26 | Unchanged |
| MR-12 Average | 5 | 12 | 12 | Unchanged |
| MR-13 Best-Value | 8 | 20 | 20 | Unchanged |
| MR-14 Precision | 6 | 16 | 16 | Unchanged |
| **Mathematics total** | **141** | **272** | **≈280-288** | +8-16 from MR-01's revised depth |

### English

| QT | Current PE | 007R Target | Revised Target (007S) | Basis for revision |
|---|---|---|---|---|
| RC-01 through RC-09 | 103 | 182 | 182 | Unchanged (Part 4's own table, 007R) |
| RC-10 Effect-of-Language | 3 | 18 | **16-20** | 2 evidenced families designed (Part 8), matching 007R's estimate closely — no material change |
| **English total** | **106** | **200** | **≈198-202** | Materially unchanged |

### Combined

| | 007R Target | Revised Target (007S) |
|---|---|---|
| Mathematics | ≈272 | **≈280-288** |
| English | ≈200 | **≈198-202** |
| **Combined objective total** | **≈472** | **≈480-490** |

**Does 472 remain valid?** **Yes.** The more granular structural analysis this increment performed shifts the precise central estimate to **≈483** (midpoint of 480-490) — a ~2-3% upward revision, driven almost entirely by QT-MR-01's family-count discovery. This is **not a material change**: 472 remains the correct order-of-magnitude planning figure; **≈483 is offered as the refined figure**, not a replacement that invalidates 472 as a target. Per the directive's own instruction, this number is reported honestly rather than forced back to 472.

---

## Part 11 — Passage expansion plan (route from 19 to ~45-55, design only)

| Requirement | Specification |
|---|---|
| New passages needed | 26-36 (to reach the 007R-approved 45-55 target) |
| Genre mix | Narrative fiction and personal-letter/account registers only — the two genres directly evidenced in the 17 Founder-Accepted primary assets (unchanged conclusion from 007R Part 5; no new genre evidence was found or sought this increment) |
| Length bands | Modelled on the existing 19 passages' own range (not independently re-measured this increment) — short (150-250 words, supports 2-3 questions), medium (250-400 words, supports 3-4 questions), matching the approved 3-4-questions-per-passage target |
| Difficulty distribution | Roughly a third each EASY/EXAM-STANDARD/HARD by Part 9's English composite, so passage difficulty is a real, checkable property, not assumed from genre |
| Intended Question Types per passage | 3-4 QTs per passage, chosen so the reuse ceiling (≤2-3 families) is met by construction — **QT-RC-10 passages specifically need at least one genuinely evocative word-choice or atmosphere moment**, a real authoring constraint most passages will not automatically satisfy, so RC-10 passage suitability should be flagged at commissioning time, not discovered after the fact |
| Reuse ceiling | ≤2-3 families per passage (007R, unchanged), enforced going forward by the same content-governance review that already exists for family activation |
| Passage originality standard | Original composition or lawfully-licensed original text, matching the existing 19 passages' own provenance (`angel_original`) — never derived from or resembling any real CSSE passage, consistent with the copyright discipline this whole programme has followed |
| Human review requirement | Same `content_review` pipeline already in place for every other content type — no new review mechanism needed |

**Not authored in this increment.**

---

## Part 12 — Content generation pipeline (design only)

```
EVIDENCE (this programme's own L1-L5 discipline, 007R Part 2)
  → FAMILY SPECIFICATION (Parts 6/8 above, or their Mathematics/English
       counterparts — a proposed family's structural rule, misconception
       set, and difficulty profile, agreed BEFORE any item is drafted)
  → PASSAGE/CONTEXT SPECIFICATION (English only — Part 11's commissioning
       brief: genre, length, difficulty, intended QTs, reuse budget)
  → CONTROLLED AUTHORING OR GENERATION (human-authored, or AI-assisted
       drafting against the family/passage spec — AI drafts, never
       finalises)
  → ANSWER RECOMPUTATION (Mathematics: `checkMathsAnswer`-equivalent
       independent recomputation, mirroring `007l-model-verification.mjs`'s
       proven discipline; English: independent re-derivation of the
       accepted answer/justification from the passage text alone)
  → STRUCTURAL VARIATION CHECK (is this item a genuine template variant or
       a disguised clone of an existing sibling? — the same judgement
       Decision 62's "disguised clone set" finding already applies
       manually, made into an explicit gate)
  → DIFFICULTY VALIDATION (Part 9's composite rule, applied mechanically —
       does the item's dimension scores actually match its claimed tier?)
  → DUPLICATE/SIMILARITY CHECK (structural/textual similarity against
       every existing sibling in the family, and — for English — against
       every passage already in the estate)
  → EDUCATIONAL REVIEW (does this item genuinely test what the family
       claims to test? Is the misconception it targets real and
       CSSE-relevant?)
  → FOUNDER/HUMAN REVIEW (the same `ali_family_review` append-only pattern
       already proven across Mathematics/English/Writing teaching reviews
       — this is a content-quality review, not a new mechanism)
  → PRACTICE ACTIVATION (`eligibility_status: provisional → practice_eligible`,
       the same idempotent activation-migration pattern already used for
       every prior batch)
```

**AI-assisted authoring is permitted at the "controlled authoring or generation" stage only** — it may draft candidate items against a human-specified family/passage spec, but every downstream gate (recomputation, structural-variation, difficulty-validation, duplicate-check, educational review, Founder review) is deterministic-or-human, never delegated to the same AI that drafted the item. **This mirrors 007R's own Mock-firewall gate list (Part 8) almost exactly** — deliberately, since both are instances of the same underlying principle: generated content is never self-certifying.

**No content was generated, drafted, or activated by this pipeline in 007S** — it is a design specification only, per the directive's explicit STOP condition.

---

## Part 13 — Mock separation check

Re-confirmed live, this increment: **`Mock Eligible: 0`** (Part 1). No `ali_question_bank` row was written by any part of this increment — confirmed by the fact that no migration, `INSERT`, or `UPDATE` script was run against `ali_question_bank` at any point (the only production interaction this increment performed was `SELECT` queries).

**Confirmed the code changes cannot affect Mock:** grepped every caller of `reduceFamilyClustering`, `applyRetrievalPriority`, and `computeFamilyExposure` across the repository — the only production caller is `lib/learningEngine/sessionGenerator.ts`'s `generatePersonalisedSession()`, which serves Practice only. Mock routes (confirmed via 007R's own finding, re-checked: the legacy Mock route still calls `fetchQuestionBank()` directly) do not call `generatePersonalisedSession()` and are structurally unreachable by this increment's change. The Mock Content Firewall test suite (`mockContentFirewall.test.ts`, Decision 59) ran unmodified within the 389-test suite and remains 100% passing.

**The ≈480-490 Practice objective estate (Part 10) and the future Mock-reserved estate (007R Part 8, Option A, sealed) remain conceptually and structurally separate — nothing in 007S narrows or blurs that boundary.**

---

## Part 14 — Visual/product implications (documented, not built)

No UI was added or changed this increment — the correction is entirely selection-logic level, invisible to the learner except through its actual effect (less repeated-passage exposure). Findings for the future dedicated Product Experience Audit (007R Part 17, step 15):

- **Passage-aware Practice:** once the passage estate (Part 11) grows meaningfully, a light "new to you" / "you've read this before" signal on a passage-based question *could* be a genuine product enhancement — not recommended now; flagged for the Audit.
- **Difficulty progression:** once Part 9's composite difficulty contract is actually authored against (not yet — no content exists at EASY/HARD tiers beyond the handful of legacy rows noted in 007R), a future surface might show a child's progression across difficulty tiers explicitly — flagged, not built.
- **Larger content supply:** at ≈480-490 objective questions plus an expanded passage estate, browsing/filtering pressure on any content-selection UI (if one exists) may increase — flagged for the Audit to assess against the real UI, not assumed here.
- **Future Mock separation:** the eventual Mock UI (007R Parts 8-12) will need to be a genuinely distinct, sealed, timed section from Practice — by far the largest future product-surface change in this whole program, still entirely unbuilt. Flagged, not started.

**No decorative UI was added.**

---

## Part 15 — Verification (full record)

| Check | Result |
|---|---|
| Full automated test suite | **389/389 PASS** (380 baseline + 9 new) |
| TypeScript (`tsc --noEmit`) | Clean, 0 errors |
| Copy Quality Guard | PASS — 0 violations across 233 files |
| Production build (`next build`) | Succeeds, 0 errors |
| Mathematics answer regression (`007k-bankwide-answer-regression.mjs`, live) | 168/168 PASS |
| Mastery protection (`mathsMasteryProtection.test.ts`, `writingMasterySafety.test.ts`) | 24/24 PASS |
| English Practice selection/exposure (new + existing) | 9 new + 7 existing (`englishPassageExposure.test.ts`) + 7 (`englishWave2ExposureExpansion.test.ts`), all PASS |
| Mock Content Firewall (`mockContentFirewall.test.ts`) | PASS, unaffected |
| Production counts, before vs. after | Byte-identical: TOTAL 264, PE 247, Maths PE 141, English PE 106, Writing PE 0, Provisional 17, Mock Eligible 0 |

**No eligibility count changed.**

---

## Governance

**Recorded as Decision 68 in `ALI_DECISION_LOG.md`** (see that document) — this is a genuine architectural decision (the passage-aware selection generalisation is live production code, platform-wide for English Practice), distinct from 007R's own governance-free strategy status.
