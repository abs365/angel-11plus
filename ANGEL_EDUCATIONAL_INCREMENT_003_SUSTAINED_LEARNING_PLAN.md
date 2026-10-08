# ANGEL 11+ — SUSTAINED LEARNING & PRACTICE EXPANSION PLAN
## Educational Increment 003 — Decision Document

**Date:** 2026-09-08
**Status:** PLANNING ONLY. No content manufactured, no migration written, no code changed. This document is the deliverable.
**Method:** Direct, read-only inspection of the live production database (anon key, no writes) and the real, current source of `lib/ali/selection.ts`, `lib/learningEngine/sessionGenerator.ts`, `lib/ali/exposureIntelligence.ts`, `lib/ali/mastery.ts`, `lib/learningEngine/preparationStage.ts`, `lib/learningEngine/mathsTeachingContent.ts`, `lib/learningEngine/englishExamStrategies.ts`, and `lib/learningEngine/practiceContent.ts`. Every number below is either read directly from production today or traced to the exact line of code that produces it — nothing in this document is assumed from an earlier report.

---

## A. Current verified educational inventory

Reconciled directly against production (anon-key read, matching the RLS-filtered `practice_eligible` view a real learner sees):

| | Total (all eligibility statuses) | Practice-eligible (what a learner can actually draw) |
|---|---|---|
| Maths | 614 (stated baseline) | **515** |
| English | 335 (stated baseline) | **234** |
| Writing | 17 (stated baseline) | **7** |
| **Total** | **966** | **756** |

756 matches the accepted baseline exactly. The gap between "total" and "practice-eligible" per subject (614→515, 335→234, 17→7) is real and expected — it is Mock-reserved, provisional, and calibration content on other eligibility tiers, not a data error (confirmed structurally: `fetchQuestionBank()`'s own RLS-backed filter, and Writing's 10 non-practice rows are literally `mock-writing-*`-prefixed).

This reconciliation is itself informative: **Writing has only 7 practice-eligible prompts**, not 17 — the other 10 are deliberately Mock-reserved. This bounds what "sustained Writing practice" can mean without touching Mock inventory (Section 9).

## B. Practice-family depth map

Full family-by-family counts (from the live 756-row practice-eligible set), sorted by size. This is real, current, complete — not a sample.

**Maths — 36 named families + 14 legacy rows with no `family_id`:**

| Family | n | Difficulty spread |
|---|---|---|
| mr01-whole-number-computation | 53 | easy 6 / medium 23 / hard 24 |
| mr03-compound-area-perimeter | 47 | easy 19 / medium 16 / hard 11 / challenge 1 |
| mr02-nth-term | 45 | easy 16 / medium 22 / hard 7 |
| mr05-factors-primes | 45 | easy 15 / medium 17 / hard 13 |
| mr04-compound-percentage | 45 | easy 7 / medium 28 / hard 10 |
| mr03-coordinate | 38 | easy 21 / medium 14 / hard 3 |
| mr01-average-mean | 34 | easy 7 / medium 20 / hard 7 |
| mr02-substitution | 34 | easy 16 / medium 10 / hard 8 |
| mr03-angle-sum | 27 | easy 10 / medium 11 / hard 6 |
| mr02-sequence-rule | 10 | easy 5 / medium 5 |
| mr05-number-property-search, mr01-decimal-computation, mr01-multistep-order-of-operations | 7 each | thin, all difficulties present |
| precision-dec, precision-frac, mr03-mixed-perimeter, mr01-fraction-computation | 6 each | thin |
| mr05-number-property, mr02-sum-difference, mr01-data-table, mr04-elapsed-time, mr03-angle-ratio, mr04-best-value | 5 each | **single difficulty tier only** (all medium, except mr04-best-value which is all medium too) |
| mr01-missing-operand, mr01-measurement-conversion, mr04-reverse-percentage, mr04-time-reverse, mr03-coord-combined, mr01-reverse-mean | 4 each | **single difficulty tier only** |
| mr05-constrained-multiple, mr04-bv-convert, mr02-far-ratio-context, mr04-far-recipe, mr02-compare, mr03-classify, mr04-far-percent, mr04-mixed-divisibility | 3 each | **single difficulty tier only** |
| (no `family_id`, legacy) | 14 | mixed |

**English — 17 named families + 13 legacy rows:**

| Family | n | Blueprint diversity |
|---|---|---|
| wave1-fam-direct-retrieval | 34 | 5 distinct blueprints |
| wave1-fam-vocab-explain | 33 | 4 distinct blueprints |
| wave1-fam-synonym-battery | 31 | 5 distinct blueprints |
| wave1-fam-sequencing | 31 | 4 distinct blueprints |
| wave1-fam-quote-explain | 29 | 4 distinct blueprints |
| wave3-fam-rc10-word-choice | 12 | 1 distinct blueprint |
| wave1-fam-emotion-cause | 11 | 0 tagged (legacy shape) |
| wave1-fam-two-character, wave2-fam-multiselect, wave3-fam-rc10-atmosphere-mood | 6 each | thin |
| wave3-fam-rc01-retrieval | 5 | thin |
| wave1-fam-effect-of-language, wave1-fam-motive-inference, wave1-fam-comparative-extraction | 4 each | thin |
| wave3-fam-rc07-comparative, wave3-fam-rc08-emotion | 2 each | thin |
| wave3-fam-rc06-sequencing | 1 | thin |
| (no `family_id`, legacy) | 13 | mixed |

**Reading of this table:** the top 9 Maths families and top 5 English families (14 families total) hold **518 of 756 questions (69%)**. The remaining ~38 families share the other 238 questions, most at 3-6 items each, frequently confined to a single difficulty tier. This is the real shape of the "8-question pattern" concern — not the session-length constant itself, but the fact that a large minority of the curriculum's actual competency surface is *thin*.

## C. Structural diversity assessment

**A genuine measurement gap, disclosed rather than glossed over:** Mathematics content carries **no `blueprintId` field at all** in its published `prompt` — every one of the 313 Question-Factory-manufactured Maths rows and all pre-existing Maths rows alike. Structural diversity for Maths can only be inferred indirectly, via `reasoningRoute` (typically 4-5 distinct values per larger family) and `contextTag` (usually just 1). This means **I cannot today distinguish "50 questions from 2 real generation templates" from "50 questions from 10" for Mathematics** — the concern in the brief's own §2 example is not falsifiable from current telemetry. This is a real, actionable gap: `blueprintId` (or equivalent) should be a required field on every future Maths candidate, mirroring what English already does.

English, by contrast, **does** carry `blueprintId`, and the picture is genuinely uneven: the top 5 families (157 of 234 English questions) each have 4-5 distinct blueprints — real structural variety. But `wave3-fam-rc10-word-choice` (12 questions) has exactly **1** blueprint, and 8 of the 17 named families have **0** tagged blueprints (pre-blueprint-era legacy manufacturing). A family with 12 questions from 1 blueprint is precisely the brief's own "not educationally deeper" example, live in production today.

**Verdict:** structural diversity is real and good for a genuine core (top Maths + top English families), but not yet *measurable* for Maths at all, and confirmed *thin* for a real minority of English families.

## D. 8-question session/pattern analysis

Traced directly from `lib/learningEngine/practiceContent.ts` and the real selection engine:

- **`sessionSize` is a fixed constant per area** — Reading Comprehension 8, Mathematics 8, Continuous Writing 2 (`PRACTICE_AREAS` config). It is not adaptive to anything and was never claimed to be; 8 is purely a UI/pacing choice, not itself an exposure-risk signal.
- **What actually governs repetition is `lib/ali/selection.ts`'s cooldown**: measured in *questions presented* (not calendar time) — easy 5, medium 10, hard 15, challenge 20. A **mastered** question additionally needs 3× that distance (15/30/45/60) before it can resurface at all, and even then only into a low-weight (1×) "mastered-resurface" pool, versus unseen (3×) and eligible-seen (2×) pools.
- **Weak-skill override** (Decision 17): a competency flagged weak by the real Educational Intelligence Engine can pull a *cooling-down* question back into the pool early, with a guaranteed minimum ~20% of the session reserved for it. This is a real, working remediation mechanism, not a placeholder.
- **Two independent de-clustering passes** (`reduceFamilyClustering`, called once by `family_id` and once by `passageGroupingKeyOf` for English) keep at most one item per family *and* per passage within a single 8-question session, swapping in an alternative when one exists.
- **Two independent spaced-retrieval passes** (`applyRetrievalPriority`, same family/passage split) actively swap a `MASTERY_MAINTENANCE` item for a `NEW`/`IMMEDIATE_REMEDIATION`/`SPACED_RETRIEVAL` one when available.

**Could a learner predict the next problem shape?** For the 14 large families (§B), no — cooldown + de-clustering + a genuine pool of 27-53 items makes short-term prediction impractical. For the ~24 small families (3-6 items, single difficulty tier), **yes, structurally** — once a small family is weak-flagged, its own 3-6 items *are* the entire selectable pool for that competency; a learner will see the same handful of numbers repeat within the cooldown window.

## E. 4/12/24-week sustained-use simulation

Model: 20 questions/day × 5 days/week = **100 questions/week** → 4 weeks = 400, 12 weeks = 1,200, 24 weeks = 2,400 total question-slots (across both Maths and English combined, since a real learner splits across areas — figures below are per-subject-equivalent scale for illustration).

This is **not** spread evenly across all ~53 families — selection is weighted toward `unseen` (3×) and weak/priority competencies, so large families absorb a disproportionate share early (good: real coverage before repetition) and small families are touched lightly *unless* they become weak-flagged (in which case they're touched heavily, by design, for remediation).

**Two structurally distinct exposure regimes emerge:**

1. **Large families (27-53 items) under normal rotation:** even under sustained heavy use, 24 weeks of practice will not exhaust a 45-item family's *novel* content — `unseen` items are drawn preferentially until none remain, and the resulting *seen* pool is large enough (cooldown-eligible after only 5-15 intervening questions) that genuine repetition is infrequent and well-spaced. **Low exhaustion risk.**

2. **Small families (3-6 items) when weak-flagged:** cooldown is measured in *questions presented globally*, not per-family. A 3-item `hard`-only family (cooldown 15) that becomes weak-flagged can cycle through all 3 items and have the *first* become eligible again within roughly a single day's 20-question session once the family is being actively remediated (the weak-skill override plus the 20%-reserved-slot mechanism both push toward exactly this family). **This is a real, quantifiable, structural exposure-risk finding**, not a hypothetical: 9 Maths families and several English families have exactly this 3-6-item, single-difficulty-tier shape (§B), and remediation — the very case where sustained, correct behaviour matters most — is precisely when this risk is highest, because weak-flagging is what pulls a thin family into heavy rotation. A learner genuinely struggling with, say, `mr04-far-percent` (3 items, all `hard`) will very plausibly see all 3 of its exact numbers memorised within one or two weeks of focused remediation, at the exact moment remediation is meant to build genuine, transferable understanding instead.

**12/24-week horizon:** for the 14 large families this remains fine — genuine long-run coverage exists. For the ~24 thin families, the risk in week 1 (if weak-flagged) is effectively the same as the risk in week 24 (if never revisited, no risk registers at all; if revisited, the same 3-6-item ceiling applies every time) — thinness is a standing structural ceiling, not something sustained use gradually solves or gradually worsens.

## F. Maths educational coverage gaps

- **Structural-diversity telemetry gap** (§C): no `blueprintId` on any Maths row — cannot verify true template variety, only infer it from `reasoningRoute`/`contextTag`.
- **9 families exist with only a single `content_difficulty` tier present** (mr01-data-table, mr02-sum-difference, mr03-angle-ratio, mr04-best-value, mr01-missing-operand, mr01-measurement-conversion, mr04-reverse-percentage, mr04-time-reverse, mr03-coord-combined, mr01-reverse-mean, mr02-far-ratio-context, mr04-bv-convert, mr04-far-recipe, mr02-compare, mr03-classify, mr04-far-percent, mr04-mixed-divisibility — 17 families, mostly at n=3-5). A learner cannot progress through difficulty *within* these competencies at all; they get one shot at one level, repeatedly.
- **Diagram/representation coverage is narrow**: only `mr03-compound-area-perimeter` (47 rows) and, structurally, `mr03-coordinate` (38 rows, though 0/38 currently carry any `diagram`/`diagrams` key — text-coordinate only, confirmed in the prior increment's own live testing) use non-prose representation. Every other Maths family — including angle work outside `mr03-angle-sum`, ratio, and most arithmetic — is prose-only. Real KS2/11+ papers use tables, bar charts, and pictograms alongside prose; none of that representation exists in this bank today.
- **Teaching-content coverage is genuinely strong but not complete**: `MATHS_FAMILY_TEACHING_CONTENT` covers **27 of 36 named families**. The 9 uncovered (`mr05-number-property-search`, `mr01-decimal-computation`, `mr01-multistep-order-of-operations`, `mr01-fraction-computation`, `mr04-reverse-percentage`, `mr04-time-reverse`, `mr03-coord-combined`, `mr01-reverse-mean`, `mr04-bv-convert`) are disproportionately the small, `FAR_TRANSFER`-heavy families — exactly where a learner is least likely to already know the method and most needs a worked model, and exactly where they get none (assessment-only fallback).

## G. English educational coverage gaps

- **Original passage count**: distinct `learning_unit_id` values across the 234 practice-eligible English rows top out around 15-19 per large family (direct-retrieval draws on 18 distinct passages, vocab-explain on 19, synonym-battery on 15) with heavy reuse *within* a family — e.g. quote-explain's 29 questions span only 16 passages. Genre/topic diversity was not separately tagged in the schema (no `genre` column populated at the row level) so cannot be quantified from data alone; this is itself a gap (§M addresses it).
- **Worked-example/teaching coverage is thin**: `ENGLISH_FAMILY_WORKED_EXAMPLE` covers only **5 of 17** named families (`wave2-fam-multiselect`, `wave1-fam-two-character`, `wave1-fam-sequencing`, `wave1-fam-quote-explain`, `wave1-fam-vocab-explain`). **The single largest English family, `wave1-fam-direct-retrieval` (34 questions), has zero worked-example coverage** — the biggest, most-practised English competency has no explicit "how to do this" content at all, only assessment. `wave1-fam-synonym-battery` (31 questions, the family the prior increment just repaired the marking contract for) is likewise uncovered.
- **Evidence-location diversity**: not separately measurable from current schema without per-row text parsing; flagged as a measurement gap, not asserted either way.
- **Multi-evidence/two-part reasoning** exists (`wave1-fam-quote-explain`'s two-part-quotation blueprint) but only within one family; no equivalent for retrieval or inference.

## H. Teaching/remediation gaps

Traced through `lib/ali/mastery.ts` and the family-teaching-content lookups:

- **The SUPPORTED-SUCCESS vs INDEPENDENT-MASTERY distinction genuinely exists and is real, not cosmetic.** `applyAttemptOutcome()`'s `supportTier` gate is structural: a `supported` correct answer updates `timesSeen`/`timesCorrect` (real, honest evidence an attempt happened) but **cannot** advance `distinctCorrectSessions` or newly reach `mastered` — only an `independent` correct answer counts toward mastery. A supported *wrong* answer still counts toward the `weak` (two-consecutive-incorrect) signal. This directly answers §5's core question: Angel does not conflate help with mastery.
- **Regression is real and forces re-teaching, not silent demotion**: `derivePreparationStage()` treats any competency in `educationalState === "rebuilding"` (mastery just revoked by a fresh wrong answer) as an unconditional override forcing the `"teaching"` stage, regardless of how strong the rest of the learner's profile is.
- **The gap is coverage, not architecture**: the teaching engine (misconception categories, worked models, guided scaffolds) is real and well-built where it exists, but exists for 27/36 Maths families and only 5/17 English families (§F, §G). A learner who gets a question wrong in one of the ~20 uncovered families receives Practice's plain "Not quite" + explanation text, with no worked model, no misconception classification, and no guided-attempt ladder — falling back to repeated cold attempts rather than genuine re-teaching.

## I. Mastery and spaced-retrieval assessment

- **Mastery threshold is evidence-based across distinct sessions** (`distinctCorrectSessions >= masteryThreshold`, sourced from `ali_mastery_defaults` keyed by `content_difficulty`), not a single lucky answer or a same-session streak — confirmed structural, not merely documented.
- **Spaced retrieval is real and calendar-based** (`RETRIEVAL_INTERVAL_DAYS.maintenanceWindow = 14` days): a securely-mastered family is deprioritised (weight 0.5×, never 0×) until 14 days have elapsed, at which point it becomes `SPACED_RETRIEVAL` and is actively swapped back in preferentially. This is a genuine forgetting-curve mechanism, not a one-time check.
- **The `REVIEW_SLOT_CAP = 1`** (at most one calendar-overdue review resolved into an actual mastered question per session) is a disclosed, deliberate judgement call to avoid one review crowding out the rest of a small 8-question session. At scale (24 weeks, many competencies eventually due for review simultaneously), this cap means the review *queue* could grow faster than it drains — worth monitoring, not yet a proven defect (no usage volume exists yet to observe it).

## J. Year 4/5/6 preparation-horizon assessment

Traced through `lib/learningEngine/preparationStage.ts`. This is the strongest-designed part of the system relative to the brief's own explicit anti-pattern warning:

- **School year is genuinely a cap on late-stage *label/emphasis*, never a base-stage selector.** `derivePreparationStage()` computes the evidence-derived stage (`foundation`/`developing`/`transfer`/`teaching`) from real competency-state proportions *first*, with no reference to school year at all. Only *after* that is `schoolYear` consulted, and only to gate whether a `"transfer"`-level learner can additionally be labelled `exam_preparation`/`final_preparation` — restricted to `Year 6` (or unset). A **strong Year 4 learner reaches and stays at `"transfer"` stage on real evidence alone** — they are not held back from harder content or independent-practice framing, only from "the exam is approaching" language that would be developmentally false for them.
- **An older learner with a genuine foundation gap is not fast-tracked**: `earlyStage / total >= 0.6` (60% of competencies still exploring/building-knowledge) forces `"foundation"` regardless of Year 6 status — there is no "must be exam_preparation because Year 6" shortcut anywhere in this function.
- **Regression always wins**: even a Year 6, `transfer`-stage learner is pulled back to `"teaching"` the moment any single competency shows a real `rebuilding` signal.
- **Gap, disclosed by the code's own comment**: `stagePrinciple()` (the learner-facing text) is "deliberately kept to messaging/emphasis only... not wired into which questions get selected" — the preparation *stage* itself doesn't yet directly bias question selection; that job is done by the separate, narrower `recommendedDifficultyLean`/`recommendedActivityType` contract (`computePreparationDecision()`, Increment 021, only wired into Mathematics Practice's session generation as of the last verified increment). English/Writing preparation-horizon-driven selection bias was not confirmed present in this pass.

**Verdict: the horizon model already matches the brief's own stated correct design almost exactly.** The one real, disclosed gap is that its live selection-bias effect is proven wired for Mathematics but not confirmed for English/Writing.

## K. Anti-memorisation assessment

- **Two real, working de-duplication mechanisms exist and were traced directly**: family-level and passage-level clustering suppression (`reduceFamilyClustering`, run twice) and family-level and passage-level spaced-retrieval swapping (`applyRetrievalPriority`, run twice). Neither is cosmetic — both actively search the candidate pool for a genuine alternative and swap.
- **Neither mechanism can protect a family that has no alternative to swap to.** Both explicitly document "if no such candidate exists... the repeat is left in place rather than forced." For the ~24 thin (3-6 item) families identified in §B/E, this is exactly the scenario: there is no alternative, so the safeguard's own honest fallback is to accept the repeat.
- **Cooldown answer-normalisation** (spot-checked in the marking layer during the prior increment, e.g. `checkMultiSelect`'s letter/word normalisation) prevents trivial format-gaming but says nothing about a learner simply recalling the correct numeric answer to a specific, previously-seen small-family question — that is a content-depth problem, not a marking problem, and cannot be fixed by tightening marking.

**Verdict: the anti-memorisation architecture is real and correctly designed; its remaining exposure is entirely a function of family thinness (§B), not a missing mechanism.**

## L. Prioritised families for expansion

Ranked using the brief's own 8 criteria (exam importance, current depth, exhaustion risk, difficulty gaps, representation gaps, transfer gaps, English passage dependence, teaching/remediation need), evidence-weighted:

**Tier 1 — highest-benefit expansion (thin, single-difficulty-tier or teaching-uncovered families with clear exam relevance):**
1. **`mr04-reverse-percentage` / `mr04-time-reverse` / `mr01-reverse-mean`** (4 each, single-difficulty, no teaching content, all `FAR_TRANSFER`) — reverse-reasoning is a classic 11+ discriminator and currently has the thinnest, least-supported coverage in the whole bank.
2. **`wave1-fam-direct-retrieval`** (English) — already the largest English family (34) but **zero** worked-example coverage despite being the foundational comprehension skill every other family builds on. Depth exists; teaching support does not.
3. **English `wave3-fam-rc0*`/`rc1*` families** (2-12 items each: comparative, emotion, atmosphere-mood, sequencing, word-choice) — these are the *inference/interpretation* competencies (as opposed to retrieval), the ones 11+ papers weight heavily, and every one of them is currently thin.
4. **Maths representation gap**: tables/charts outside `mr03-angle-sum`'s incidental table use — currently near-zero non-prose Maths content outside the two established diagram/coordinate families.

**Tier 2 — real but lower-urgency (small, single-tier, but narrower exam weight or already-adjacent large-family coverage):**
`mr02-far-ratio-context`, `mr04-far-recipe`, `mr04-far-percent`, `mr04-mixed-divisibility`, `mr03-classify`, `mr02-compare`, `mr05-constrained-multiple`, `mr04-bv-convert` — genuine gaps, but each sits adjacent to a well-covered sibling family (percentage, ratio, classification) so the *skill* has some coverage even if the specific *variant* is thin.

**Not prioritised for this increment:** the 9 large families (§B top table) are already deep; further raw volume there has the lowest marginal educational value per the brief's own explicit "1,200 is a capacity milestone, not the objective" instruction.

## M. English original-passage expansion plan

Do not scale by attaching more questions to the existing ~15-19-passage pool per family — that increases the exact "memorised passage" risk the brief warns against, and evidence-location diversity is already constrained by a shared, reused passage set.

**Proposed sustainable strategy:**
- **Target a genuinely new, original passage every time a new question is manufactured against Tier 1/Tier 2 families above**, rather than reusing the existing lighthouse/recycling/kite-festival/penguin passage set (already reused across at minimum 4 different families each, per §G). A rough 1:3 to 1:4 passage-to-question ratio (vs. today's implicit ~1:2 for the largest families) would materially reduce passage-recognition risk.
- **Genre coverage, explicitly targeted per the brief's own list**: the current bank (spot-checked via titles surfaced live this session and the prior increment) already has narrative fiction (Kite Maker, New Girl, Baker's Apprentice), a mystery/suspense piece (Lighthouse Mystery), informational/process non-fiction (recycled paper), nature/science (Emperor Penguins), and epistolary historical-style narrative (Letters from the Trenches). **Missing genres**: biography, travel/exploration, and pure descriptive prose (no strong narrative arc) — these should be the first new-passage targets.
- **Passage reuse must be measured going forward**: add a `genre`/`passage_reuse_count` signal (even a simple per-passage question-count column) so future audits like this one don't have to infer it from `learning_unit_id` joins. This is a small, additive schema gap worth closing alongside the content work, not a new engine.
- **Author new passages only; no past-paper or commercial-text reproduction** — matches the codebase's own existing, consistently-followed convention throughout every passage inspected this session.

## N. Route from 756 toward approximately 1,200 practice-eligible questions

**756 → ~1,200 is a genuine ~59% increase.** Applying the brief's own instruction to treat 1,200 as a capacity milestone, not the objective, the honest routing is:

| Allocation | Rows | Rationale |
|---|---|---|
| Tier 1 Maths families (reverse-reasoning trio + representation expansion) | ~60 | Closes the sharpest, most exam-relevant gaps identified in §F/§L |
| Tier 1 English families (direct-retrieval teaching content is a *code* change, not new rows; new inference-family passages+questions) | ~120 | New original passages feeding the currently-thin `wave3-fam-rc*` inference families |
| Tier 2 Maths families (bring each to at least 2 difficulty tiers, 8-10 items) | ~100 | Removes the single-difficulty-tier ceiling from the highest-value Tier 2 families |
| Tier 2 English (comparative/word-choice/atmosphere depth) | ~80 | Same "at least a real pool, not a token 2-6 items" bar |
| Genuine difficulty/representation depth added to *already-large* families where a real coverage gap exists (e.g. Maths tables/charts) | ~85 | Representation diversity, not raw volume |
| **Total new practice-eligible rows** | **~445** | **756 + 445 ≈ 1,201** |

**This is NOT recommended as an equal, mechanical +445 split.** If the manufacturing capacity in this increment cannot cover all five allocations with genuine structural diversity (real blueprints, not near-duplicate templates), **the honest position is to under-shoot 1,200 rather than pad thin families further** — a 1,050-question bank with every family reaching a real 2-tier, multi-blueprint depth is a stronger product than a 1,200-question bank with the same 24 families still stuck at 3-6 items.

## O. What should NOT be built or expanded yet

- **No new selection/adaptive engine.** `lib/ali/selection.ts` + `sessionGenerator.ts` + `exposureIntelligence.ts` are real, working, and correctly designed for their stated purpose (§D, §I, §K). The gap is content depth feeding them, not the engine itself.
- **No Mock expansion.** Per explicit instruction (§9) and confirmed structurally: Mock/Practice/Calibration remain genuinely separate pools (`eligibility_status` gating, RLS-enforced, confirmed in the Writing 17-vs-7 reconciliation in §A). Out of scope for this increment.
- **No large-scale rebuild of `mathsTeachingContent.ts`/`englishExamStrategies.ts` architecture** — extend the existing per-family record pattern to the uncovered families (§F, §H); do not design a new teaching-content system.
- **No new `blueprintId`-equivalent engine for Maths** — reuse English's existing convention (a plain string tag on `question_content`), close the measurement gap (§C) with the same pattern already proven, not a new taxonomy.
- **No change to session length (8) or cooldown constants** — no evidence gathered this session suggests these specific numbers are wrong; the exposure risk found (§E) is a content-depth problem, not a pacing-constant problem, and changing pacing constants without volume to back them would not fix it.
- **No English preparation-horizon selection-bias work this increment** unless Tier 1 content work is complete first — sequencing matters; biasing selection toward "harder" content in still-thin families would worsen §E's exposure risk, not improve it.

## P. Exact Educational Increment 003 implementation scope

1. Add `blueprintId` tagging to the Maths Question Factory candidate/publication pipeline (closes §C's measurement gap; no data repair needed for existing rows, forward-only).
2. Manufacture the Tier 1 + Tier 2 content allocation in §L/§N, with **mandatory per-family minimum**: every touched family reaches at least 2 distinct `content_difficulty` tiers and at least 3 distinct `blueprintId`/`reasoningRoute` values before being considered "expanded" — a family that doesn't clear this bar with real manufactured content is left at its current size rather than padded.
3. Author the missing genre passages (§M) — biography, travel/exploration, descriptive prose — feeding the Tier 1 English inference families specifically, not the already-deep retrieval/vocabulary families.
4. Extend `MATHS_FAMILY_TEACHING_CONTENT` to the 9 uncovered families (§F), prioritising the Tier 1 reverse-reasoning trio.
5. Extend `ENGLISH_FAMILY_WORKED_EXAMPLE` to at minimum `wave1-fam-direct-retrieval` and `wave1-fam-synonym-battery` (§G) — the two largest uncovered families.
6. Add a lightweight `genre`/passage-reuse telemetry field (§M) — additive schema only, no engine change.
7. **Explicitly deferred to a later increment, not this one**: English preparation-horizon selection wiring (§J gap), Mock expansion, any new engine.

## Q. Acceptance criteria proving the increment improves sustained learning, not just row count

An acceptance pass for this increment must show, by direct post-manufacture audit (same method as this document, not a claim):

1. Every family touched by Item 2 above has ≥2 distinct `content_difficulty` values and ≥3 distinct structural tags (`blueprintId` for English, `blueprintId`+`reasoningRoute` for Maths) — re-run §B/§C's exact query and confirm.
2. Zero newly-manufactured rows duplicate an existing row's numeric parameter set or English `question` text within the same family (structural anti-duplication check, same discipline as the existing `content-duplicate-guard.mjs`).
3. `mathsTeachingContent.ts`/`englishExamStrategies.ts` coverage counts increase by exactly the families named in Items 4-5 — re-run the exact grep-count used in §F/§H.
4. New English passages are genuinely new `learning_unit_id`s, not new questions against the existing 15-19-passage pool — re-run §M's passage-count-per-family check.
5. Re-run the §E simulation logic against the *post*-expansion family sizes: every Tier 1/Tier 2 family must clear a minimum-pool-size threshold (proposed: ≥8 items) such that, even fully weak-flagged under the real cooldown maths, the same item cannot recur within fewer than ~2 real practice sessions at 8 questions/session. This is the actual, falsifiable "sustained use" proof the brief asks for — not a row-count target.
6. No Mock-eligible or calibration-track row is touched (RLS/eligibility_status check, matching the existing governance pattern from every prior increment in this arc).

## R. GO / REVISE / NO-GO recommendation

**REVISE.**

The underlying engine — adaptive selection, cooldown, mastery, spaced retrieval, anti-memorisation clustering, and the preparation-horizon model — is **genuinely well-built and, on the evidence gathered this session, already does most of what the brief asks of a "strong evidence-based one-to-one tutor."** This is not a case of "architecture exists, so it passes" — every mechanism in §D, §I, §J, §K was traced to real, working code, not a promise.

The honest gap is **content depth, unevenly distributed**: 14 families (69% of the bank) are genuinely deep and low-risk; roughly 24 families (the long tail) are thin enough (3-6 items, frequently single-difficulty-tier, frequently teaching-uncovered) that a learner who needs them most — because they're struggling, which is exactly when the weak-skill override pulls a thin family into heavy rotation — is the learner most exposed to real memorisation risk (§E). This is squarely the brief's own "could a child genuinely prepare with this product for months" test, and the honest answer today is: **yes, for the two-thirds of the curriculum that is deep — not yet, for the third that is thin**, and the thin third is disproportionately the harder, `FAR_TRANSFER`, exam-discriminating content (§F, §L).

**REVISE, not GO, specifically because:** the proposed 1,200-question target in the brief's own framing should not be pursued as a flat volume goal (§N) — it must be gated on real per-family structural minimums (§P Item 2, §Q). **REVISE, not NO-GO, because:** no architectural rebuild is required, the gap is precisely bounded and rankable (§L), and the existing engine will correctly exploit deeper content the moment it exists — this is a content-manufacturing increment with clear, evidence-derived priorities, not a redesign.

**Recommended immediate next step:** Founder review of §L's Tier 1 priority list and §P's implementation scope; if approved, proceed to bounded content manufacturing exactly as scoped, with the §Q acceptance criteria run as a genuine gate before any GO declaration on the resulting content.
