# Angel 11+ — Question Factory Wave 2: Human Educational Calibration Gate

**Prepared:** 2026-09-06. Audits the exact 30 candidates currently `pending_review`/`unpublished` in production `ali_question_candidate` (loaded from `scripts/output/question-factory-wave2-first-batch.json`, confirmed byte-identical to the submitted batch — not regenerated for this audit). No candidate's database status was changed to produce this report.

---

## A. 30-Candidate Calibration Table

All 30 are **mathematically and factually correct** — every arithmetic fact and fraction simplification was independently re-verified by hand for this report, in addition to the automated recomputation already performed at generation time. No answer-correctness defect was found anywhere in the batch. Verdicts below therefore turn entirely on educational/wording/difficulty-accuracy judgement, not mathematical error.

| # | Candidate ID (suffix) | Family | Verdict | Primary reason |
|---|---|---|---|---|
| 1 | `...decimal-computation-1` | mr01-decimal-computation | PASS | Correct, clear, legitimate fluency item |
| 2 | `...decimal-computation-2` | mr01-decimal-computation | PASS | Correct, clear, legitimate fluency item |
| 3 | `...decimal-computation-3` | mr01-decimal-computation | PASS | Correct, clear, legitimate fluency item |
| 4–10 | `...decimal-computation-4..10` | mr01-decimal-computation | REVISE | Correct but structurally redundant — identical skeleton to #1-3 (see §B); publishing all 10 as if they add 10 units of depth would misrepresent the batch |
| 11–20 | `...precision-frac-11..20` | precision-frac | REVISE (all 10) | Real wording/answer-format defect affects every member (see §C) — must be fixed before any is approved, independent of the redundancy issue |
| 21–23 | `...angle-sum-21..23` | mr03-angle-sum | REVISE | Correct and clear, but carries an incorrect difficulty label (see §C) — needs re-labelling before approval |
| 24–30 | `...angle-sum-24..30` | mr03-angle-sum | REVISE | Same difficulty-label defect as #21-23, plus structural redundancy (see §B) |

**0 REJECT** (no factually wrong or unusable item found). **3 PASS** (unconditionally usable as-is). **27 REVISE** (usable only after a named, specific fix — redundancy, wording, or difficulty-label correction).

---

## B. Family Audit

Every number below is the real output of `scripts/question-factory-calibration-audit.mjs`, run against the actual 30 production candidates — reproducible by re-running that script.

### mr01-decimal-computation (10 raw candidates)
- **Genuine structural count: 1.** Every candidate is `"Calculate: [1dp] × [2dp]"` — same construction, same context (bare arithmetic, no real-world framing), same unknown position (the product), same reasoning route (direct computation). Only the two numeric values vary.
- **Structural diversity ratio: 0.10** (1 structure ÷ 10 candidates).
- **Memorisation risk: CRITICAL.**
- **Principal weaknesses:** zero context variation, zero reasoning-route variation, zero unknown-position variation. Difficulty distribution across this real batch was `{medium: 9, easy: 1}` — the "hard" tier, though defined in the spec, was never reached in this sample (a real, if partly coincidental, difficulty-spread weakness).

### precision-frac (10 raw candidates)
- **Genuine structural count: 1.** Every candidate is the identical "ribbon cut into equal pieces, exact fraction" construction — confirmed, this is essentially one template instantiated ten times, exactly as the Founder suspected.
- **Structural diversity ratio: 0.10.**
- **Memorisation risk: CRITICAL.**
- **Principal weaknesses:** same context every time (ribbon-cutting, never a different real-world framing — money, time, or other measurable quantity would all fit the same mathematical structure); **and** a genuine, systemic wording/answer-format defect present in **all 10**, detailed in §C.

### mr03-angle-sum (10 raw candidates)
- **Genuine structural count: 1.** Every candidate is "two known angles → find the third" — same context (a bare triangle, no real-world framing), same unknown position (the third angle), same reasoning route (sum two knowns, subtract from 180°). Candidates #1 and #2 additionally produce the *identical numeric answer* (84°) from different input pairs — a surface-level coincidence, not a duplicate, but a further sign of how narrow the variation space is.
- **Structural diversity ratio: 0.10.**
- **Memorisation risk: CRITICAL.**
- **Principal weaknesses:** zero context/reasoning/unknown-position variation, **and** a confirmed, real difficulty-labelling defect affecting all 10 (detailed in §C) — the original generation logic assigned difficulty based on an arithmetic coincidence of the *answer*, not the complexity of the calculation.

**Effective educational depth across all 30 candidates: 3** (one distinct educational structure per family — never more, since every candidate within a family shares identical skeleton, context, reasoning route, and unknown position). **30 database rows currently represent 3 genuinely distinct educational demands, not 30.**

---

## C. Content Defects Found

1. **[Confirmed, all 10 `precision-frac` candidates] Prompt/answer-format mismatch.** The prompt says *"Give your answer as an exact fraction of a metre, in its simplest form."* Because the generation constraint requires `lengthMetres > pieces`, the derived answer's whole-number part is always ≥ 1 — **every single one of the 10 real answers is a mixed number** (e.g. `1 4/5`, `4 1/3`, `3 2/9`), never a value under 1. "An exact fraction... in its simplest form" most naturally reads as a value under 1 to a child (and to many adults); a learner who instead writes the mathematically-equivalent improper fraction (e.g. `9/5` instead of `1 4/5`) — a genuinely valid alternative answer — has no evidence this would be accepted, since `p_claimed_answer` is a plain string with no fraction-equivalence checking found anywhere in this pipeline. **This is a real "alternative valid answers not handled" risk, not a hypothetical one**, and affects the entire family, not isolated candidates.

2. **[Confirmed, all 10 `mr03-angle-sum` candidates] Difficulty label derived from the wrong thing.** The original rule, `(180 - angleA - angleB) % 5 === 0 ? "easy" : "medium"`, classifies difficulty by whether the *answer* happens to be a multiple of 5 — a property invisible to the learner before solving and unrelated to genuine complexity. Directly confirmed against real production data: 29°/106° → 45° was labelled "easy"; 43°/53° → 84° was labelled "medium" — both are an identical single-step sum-then-subtract with no meaningful difficulty difference. **A second, independent defect in the same rule**: it can never produce "hard" for any input, despite "hard" being a defined, intended difficulty tier for this family — confirmed by exhaustive reasoning about the rule's own two-branch structure. **Fixed in the generation spec this pass** (see §D) — the 10 *already-generated* candidates still carry the old, incorrect labels and must be re-labelled (or regenerated) before approval.

3. **[Batch-level, `mr01-decimal-computation`] Difficulty tier under-exercised.** The spec defines a genuine "hard" tier (`aTenths ≥ 7.0 AND bHundredths ≥ 7.00`), but this real 10-candidate batch never sampled a pair satisfying it (max value used was 6.6) — 0/10 hard, despite the tier being real and reachable in principle. Not a code defect; a batch-composition observation worth flagging since it means claimed difficulty variety is thinner than the spec alone would suggest.

4. **No defects found**: mathematical correctness (all 30, independently re-verified), fraction simplification correctness (all 10 `precision-frac` GCD reductions checked by hand), wording clarity and single-answer unambiguity (all 30), age-appropriateness (all 30 sit squarely within Y5/6 CSSE curriculum content — decimal multiplication, division-with-remainder, triangle angle sum), distractor quality (N/A — all 30 are open short-answer with no distractors, correctly, since none of the three specs declare a multiple-choice format).

---

## D. Question Factory Architecture — What Changed

The calibration audit's core finding — technical validity does not imply educational depth — is now **structurally instrumented**, not merely stated in prose:

1. **`FamilyGenerationSpec` (Task 4) gained three new required fields**: `reasoningRoute(params)`, `contextTag(params)`, `unknownPosition(params)`. Every family spec must now *declare* which cognitive route, presentation setting, and unknown quantity it uses — honestly, not inferred from text. All three of Wave 1's real specs were backfilled with their true, current values, which are **constant regardless of parameters** — an honest disclosure that these dimensions are not yet varied at all, not a claim that they are.
2. **`mr03-angle-sum`'s difficulty rule was corrected** (a genuine defect fix, not new content generation): difficulty is now derived from `angleA + angleB` — a real property of the required computation — never from a coincidental property of the answer. Verified to now reach all three tiers (easy/medium/hard) and to produce a materially different, defensible distribution against the real 10-candidate dataset.
3. **A new module, `lib/ali/questionFactory/diversityGates.ts`**, implements every deterministic check the Founder named (Task 6): exact-duplicate/near-duplicate detection was already real (`antiMemorisationChecks.ts`, Wave 1); this adds same-template saturation, repeated-context/unknown-position/reasoning-route detection, a family structural-diversity minimum, and difficulty-distribution integrity — all explainable (every result names the exact dominant skeleton/value, never a black-box score) and all proven against the real 30-candidate dataset to reproduce this report's own findings exactly.
4. **No AI-model judgement is used anywhere in these gates.** Every check is a deterministic function over declared or textually-derived data.

**What was deliberately NOT done this pass, per the Founder's explicit stop conditions**: no new candidate was generated; no existing spec was redesigned to *add* genuine context/reasoning/unknown-position variation (that is real generation-architecture work belonging to a future, separately-approved wave); the 30 real candidates' stored difficulty labels were not altered in the database.

---

## E. Family Depth Standard

| Tier | Definition | This batch's counts |
|---|---|---|
| **RAW VARIANTS** | Total candidate/row count | 30 (10 per family) |
| **STRUCTURAL VARIANTS** | Distinct normalised-text skeletons (numeric-substitution-invariant) | 3 (1 per family) |
| **CONTEXTUAL VARIANTS** | Distinct declared `contextTag` values | 3 (1 per family) |
| **REASONING VARIANTS** | Distinct declared `reasoningRoute` values | 3 (1 per family) |
| **EFFECTIVE EDUCATIONAL DEPTH** | Distinct (skeleton, context, reasoning route, unknown position) combinations — the metric that answers "how many genuinely different educational demands does this content set actually make" | **3** (never more than the structural-variant count) |

**Structural diversity ratio** = distinct structural variants ÷ raw variant count. This batch: **0.10 for all three families** — the single number that most directly answers the Founder's framing question. A ratio this low, sustained, means a regular learner will exhaust the family's genuine novelty within their first 2-3 exposures to it, then receive nine more numeric reps of a pattern they have already recognised.

**Memorisation risk thresholds** (disclosed, provisional — same calibration-ownership discipline as this codebase's other confidence constants): ratio ≥0.7 → LOW; ≥0.4 → MEDIUM; ≥0.2 → HIGH; below 0.2 → **CRITICAL**. All three Wave 1 families measure 0.10 → **CRITICAL**, matching the Founder's own instinct precisely.

**This metric directly answers the readiness question it was designed for**: *"If a child works on Angel regularly for months, how quickly will the experience begin to feel repetitive?"* — for these three families specifically, at their current depth, the honest answer is **within the first session**, not months.

---

## F. Test Evidence

| Command | Result |
|---|---|
| `npx tsx --test tests/lib/ali/questionFactory/diversityGates.test.ts` | 12/12 pass |
| `npx tsx --test tests/lib/ali/questionFactory/angleDifficultyCorrection.test.ts` | 4/4 pass |
| `npx tsx --test tests/lib/ali/questionFactory/candidateGeneration.test.ts tests/lib/ali/questionFactory/reviewGateEnforcement.test.ts` | 22/22 pass (unchanged by the architecture additions) |
| `npx tsx --test tests/lib/questionFactory/publicationGateSelectionExclusion.test.ts tests/supabase/questionFactoryCandidateLifecycle.test.ts` | 25/25 pass (publication-without-approval remains structurally impossible; governance unchanged) |
| `npm test` (full suite) | **3916/3916 pass** |
| `npx tsc --noEmit` | clean |
| `npm run build` | clean |
| `npx eslint lib/ali/questionFactory/ scripts/question-factory-calibration-audit.mjs tests/lib/ali/questionFactory/` | clean, 0 errors/warnings |
| `npm run copy-guard` | PASS, 0 violations (298 files) |
| `npm run migration-sql-guard` | PASS, 231 migration files (no migration touched this pass) |

Tests specifically prove, per the Founder's own required list: number-only substitutions collapse to one structural variant (not falsely counted as ten); identical reasoning skeletons are detected via an explainable dominant-skeleton result; varied wording alone does not create false structural diversity; a genuinely diversified synthetic batch **can** pass every gate (the gates measure real variety, they do not reject on principle); difficulty-distribution integrity is validated both for failing and passing cases; duplicate/near-duplicate detection remains deterministic (identical input → identical output, twice); existing Question Factory governance (22 pre-existing tests) is unaffected; candidate publication remains structurally impossible without explicit prior approval (25 tests, including the table-level `CHECK` constraints).

---

## G. Production State (confirmed)

- **30 candidates remain `pending_review` / `unpublished`** — none were touched by this audit.
- **0 approved. 0 published.**
- **Existing `ali_question_bank` is unchanged** — this entire audit read only the locally-stored candidate payloads (confirmed byte-identical to the submitted batch) and the pure `diversityGates.ts`/`familySpecs.ts` code; no database write of any kind was made.

---

## H. Decision

# QUESTION FACTORY CALIBRATION PARTIAL

Not PASS: three concrete defects were found (the fraction wording/answer-format issue affecting 10/10 `precision-frac` candidates; the difficulty-label defect affecting 10/10 `mr03-angle-sum` candidates; and a structural-diversity ratio of 0.10 — CRITICAL memorisation risk — across all three families, meaning 30 database rows represent only 3 genuinely distinct educational demands). Technical validity was never in question; educational readiness, as the Founder's own standard requires, is not yet met for approval as submitted.

Not FAIL: no candidate is mathematically wrong, unusable, or age-inappropriate; the defects found are each specific, named, and fixable (a wording change, a difficulty-relabel, and — for the deeper diversity problem — a real but scoped future generation-architecture investment, not a wasted batch); 3 of the 30 (the first decimal-computation candidates) are usable exactly as they stand; and this pass delivered genuine, tested, working infrastructure (the diversity gates and depth standard) that did not exist before today and would have caught these exact issues automatically had it existed before generation.

**Recommended disposition of the 30 (a recommendation, not an action taken)**: approve #1-3 (`mr01-decimal-computation`) as-is; hold `precision-frac` (all 10) pending a wording/answer-format fix; hold `mr03-angle-sum` (all 10) pending difficulty re-labelling; treat all three families as needing genuine context/reasoning-route/unknown-position variation before any further generation from the same specs.

No candidate was approved or published. No Wave 3 work has begun.
