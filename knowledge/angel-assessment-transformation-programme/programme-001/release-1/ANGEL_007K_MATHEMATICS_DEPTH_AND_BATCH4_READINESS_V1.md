# Angel 11+ — Educational Increment 007K — Mathematics Educational Depth and Controlled Review Batch 4 Readiness

**Prepared:** 007K, 2026-08-14. Covers the 9 remaining registered Mathematics families (37 questions) after the unit-answer validation defect (Decision 55) was found, fixed, deployed, and live-verified. The 5 ungrouped legacy questions are excluded, untouched, per explicit instruction.

---

## Part 1 — Remaining Mathematics corpus reconciliation

Starting provisional Mathematics count after Batch 3's 30 questions/7 families were activated (migration 057): **42 provisional Mathematics questions.** Reconciled directly against production, not assumed:

- **37 questions across 9 registered families** (`mr02-far-ratio-context` ×3, `mr02-sum-difference` ×5, `mr03-angle-ratio` ×5, `mr03-mixed-perimeter` ×3, `mr04-best-value` ×5, `mr04-compound-percentage` ×5, `mr04-far-recipe` ×3, `mr05-constrained-multiple` ×3, `mr05-factors-primes` ×5) — the full remaining registered-family Mathematics backlog.
- **5 ungrouped legacy questions** with no `family_id` — explicitly excluded, unclassified, out of scope per instruction.

37 + 5 = 42. Reconciled exactly; no discrepancy found (unlike 007I's tick-justify count, which required a documentation correction — no equivalent issue exists here).

---

## Part 2 — Mathematical and educational validation (correctness vs. review-readiness)

**Mathematical correctness** — independent first-principles re-verification (`scripts/007i-maths-answer-verification.mjs`, reused unmodified since these are the same 9 family types already verified in 007I): every stored answer re-derived from the question's own stated numbers, not merely compared to the stored value. **Result: 37/37 PASS, 0 defects** (re-confirmed again in Part 10 below, after the unit-answer defect fix, with an identical 37/37 PASS result — the defect fix did not change any answer *value*, only how learner input is *parsed*).

**Educational review-readiness** is a distinct, stricter bar than mathematical correctness — a question can be correctly computed and still not be review-ready (ambiguous wording, unverifiable evidence basis, a misconception that isn't real, insufficient sibling variation to call it a genuine "family" rather than a single templated item). Checked for all 9 families:

- **Evidence basis**: all 9 trace to a specific, named CSSE source or the CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md observation log (Part 8's review packs cite each one directly — no family relies on an unsupported claim).
- **Misconception plausibility**: all 9 `addresses_misconception` entries name a specific, real error pattern (e.g. "compares totals instead of unit price," "reapplies the second percentage to the original value"), not a generic placeholder.
- **Ambiguity**: no family has more than one mathematically defensible answer for any sibling (confirmed during the Part 2 re-derivation — every re-derived value matched the stored answer exactly, with no alternate valid interpretation surfacing).
- **Sibling sufficiency**: 7 of 9 families have ≥5 siblings; 2 (`mr03-mixed-perimeter`, `mr04-far-recipe`) have only 3 — thin but not templated (Part 3 confirms genuine, if numbers-only, variation in both).

**Conclusion: all 37 questions/9 families are both mathematically correct AND educationally review-ready.** No family is excluded at this stage; the two "thin" families are flagged (Part 3) as a depth observation for future authoring priority, not a review-readiness failure.

---

## Part 3 — Family depth audit (A–K per family)

All 9 families: single competency per family, structural signature and real CSSE/Assessment-Brain evidence citation present in `explanation`, 100% populated question-specific `addresses_misconception`, 100% populated `workingSteps`, answer method independently confirmed consistent across every sibling (Part 2). All 37 questions are `content_difficulty = medium` — no easy or hard/challenge variant anywhere in this batch (see Part 6).

| Family | A. Skill | D. Variation | I/J. Repeat-practice & anti-memorisation | K. Reasoning vs. substitution |
|---|---|---|---|---|
| `mr02-far-ratio-context` (3) | Ratio-share word problem, then a follow-on subtraction | **Structural**: multiplier varies (2×/3×/4×) and context varies (money/stickers/rope-length) | Strong — different multiplier changes the actual method, not just the numbers | Genuine ratio-reasoning; the follow-on step (spend/give away/cut) tests whether the learner re-reads what's actually being asked, not just the first number they compute |
| `mr02-sum-difference` (5) | Simultaneous sum-and-difference reasoning | **Numbers-only**: same "(total−diff)/2" structure every time, changed amounts/names | Moderate — genuine recalculation required each time, but the same single misconception (splitting evenly) is what's tested throughout | Real algebraic reasoning (implicit simultaneous equations), not pattern-matching — a learner cannot succeed by remembering a previous answer |
| `mr03-angle-ratio` (5) | Ratio-based angle reasoning | **Structural**: mixes "on a straight line" (180°) and "around a point" (360°), including one 3-part ratio | Strong — the two bases (180 vs. 360) and the 2-part vs. 3-part ratio are genuinely different sub-skills | Real geometric reasoning; the "treat the ratio numbers as the answer" misconception is a plausible, specific error this design catches |
| `mr03-mixed-perimeter` (3) | Two-step: derive the missing side from area, then compute perimeter | **Numbers-only**, only 3 siblings — the thinnest family in this batch alongside `mr04-far-recipe` | Adequate but thin — changed numbers require recalculation, but only 3 instances means a learner exhausts real novelty quickly | Real two-step reasoning (division then perimeter formula); the unit-answer defect (now fixed) previously undermined this family's trustworthiness independent of its mathematical design |
| `mr04-best-value` (5) | Unit-price comparison | **Numbers-only**, but outcome is genuinely mixed (3× "A wins", 2× "B wins" — confirmed not a guessable pattern) | Moderate — same method every time, but the balanced A/B outcome prevents a "always guess the same letter" shortcut | Real proportional reasoning; the misconception (comparing totals instead of unit price) is exactly the CSSE-evidenced error this targets |
| `mr04-compound-percentage` (5) | Successive (not combined) percentage change | **Numbers-only**, same two-step structure every time | Moderate — genuine recalculation, but the same single misconception (applying both % to the original) is tested every time | Real sequential reasoning — the defining test is whether the learner reapplies the second change to the *already-changed* value, a genuine, well-evidenced error pattern |
| `mr04-far-recipe` (3) | Proportional scaling (unit rate, then scale) | **Numbers-only**, only 3 siblings — thin | Adequate but thin, same limitation as `mr03-mixed-perimeter` | Real proportional reasoning; same defect-affected family, now resolved |
| `mr05-constrained-multiple` (3) | LCM-bounded search | **Structural**: mixes "smallest multiple greater than" and "largest multiple less than" — genuinely different search direction | Strong relative to its size — the direction change is a real different demand, not just changed numbers, though only 3 siblings total | Real number-property reasoning; the misconception (finding a multiple of only one number) is specific and plausible |
| `mr05-factors-primes` (5) | Factor counting and primality testing | **Structural**: mixes "how many factors" (3 instances) and "is X prime" (2 instances) — two genuinely different question types in one family | Strong — a learner must recognise which sub-skill is being asked, not just repeat one procedure | Real number-property reasoning across two related but distinct skills |

**Families with genuine structural sub-variety (strongest repeat-practice performers):** `mr02-far-ratio-context`, `mr03-angle-ratio`, `mr05-constrained-multiple`, `mr05-factors-primes`.
**Families that are numbers-only variation of one consistent structure (weaker, but still genuinely test transferable reasoning, not superficial substitution):** `mr02-sum-difference`, `mr03-mixed-perimeter`, `mr04-best-value`, `mr04-compound-percentage`, `mr04-far-recipe`.
**No family is a cosmetic variant.** None fails Part 3 outright; the finding is a *depth gradient*, not a pass/fail split.

---

## Part 4 — Mathematics teaching-system gap analysis

Traced directly from the real code path (`app/learning-intelligence/practice/[area]/page.tsx`, `lib/learningEngine/practiceContent.ts`, `lib/ali/mastery.ts`), not assumed, and cross-checked against 3 live production Practice sessions played this session.

**The real pathway today, for any Mathematics question:**

```
QUESTION rendered (question text only — no MODEL, no worked example, no exam-strategy hint;
  these UI sections exist in the Practice page but are gated to render only when a subject === "english"
  helper returns a value, confirmed in 007H/007I/007J)
→ learner types a free-text answer, single attempt, no scaffold shown at any point
→ Submit
→ checkMathsAnswer(userAnswer, correctAnswer) — single binary correct/incorrect check,
  no partial credit, no step-level feedback
→ "Correct" / "Not quite" shown, PLUS the question's own workingSteps array shown as a
  static, non-interactive step-by-step explanation, identical whether the learner was right or wrong
→ recordSkillResult (or equivalent) updates masteryState via lib/ali/mastery.ts,
  using supportTier: "independent" always — Mathematics never sets supportTier: "supported",
  because nothing in the Mathematics pathway ever offers a "supported" attempt in the first place
→ Next question
```

**What happens when a learner struggles, specifically:**

- **Does not know how to start:** nothing. No MODEL, no first-step prompt. The only support available is reading the question again.
- **Makes the first step incorrectly:** nothing is caught mid-attempt. The learner submits a complete answer and only then sees `workingSteps` — after the fact, not as a diagnostic.
- **Uses the wrong operation:** same as above — no operation-selection guidance exists; the misconception field is real and specific but is never surfaced to the learner at all (it's the *reviewer's* evidence, not learner-facing content — confirmed by reading the Practice page's render logic, which never reads `addresses_misconception`).
- **Misunderstands the underlying concept:** the post-answer `workingSteps` is the only remediation, and it's identical every time regardless of *which* wrong answer was given — it cannot diagnose *why* the learner was wrong, only show the correct method once.
- **Repeatedly fails the same family:** `masteryState` correctly tracks this (the underlying mastery engine is subject-agnostic and works identically for Mathematics and English), but nothing in the *content delivery* changes in response — no scaffold fades in, no easier variant is offered, no targeted remediation triggers.
- **Gets the right answer using weak reasoning:** `checkMathsAnswer` cannot tell — it only sees the final typed value, never any working. A learner who guesses correctly and a learner who reasoned correctly are recorded identically.
- **Needs progressively reduced support:** there is no support to reduce — Mathematics is currently a single, undifferentiated "independent" mode throughout, with no guided tier existing to fade *from*.

**Contrast with English:** English's `supportTier` distinction is real and functioning (`guided` attempts never count toward mastery, confirmed by existing tests) *because* English has actual guided scaffolds (`selection-count-check`, `sequence-anchor`, `staged-quotation`, `locate-instruction`) that produce a genuinely different, lower-stakes learner experience. Mathematics has the same underlying mastery machinery available but nothing feeding it a "supported" attempt — the gap is entirely in content/UI, not in the mastery engine itself.

---

## Part 5 — Minimum Mathematics teaching architecture (proposal only, not built)

**Do not mechanically copy English.** English's scaffolds are built around *reading comprehension* (locating evidence in continuous prose). Mathematics' failure modes are different — operation selection, procedural sequencing, and self-checking a numeric result — so the scaffold *kinds* must be different even though the *delivery mechanism* can be reused.

**Recommended minimum set, derived from the Part 4 gap trace, not from a generic checklist:**

1. **MODEL (worked example)** — genuinely needed. Every family already has a real `workingSteps` array; a MODEL is the same content, shown *before* the first attempt on a fresh family rather than only after submission. This closes the "does not know how to start" gap directly and requires no new content authoring — only a UI change to surface existing `workingSteps` data at a different moment.
2. **GUIDED PRACTICE, specifically as *step reveal with self-check between steps*, not next-step prompting or full operation selection.** Mathematics' `workingSteps` are already discrete, ordered strings (2–3 per question). The evidenced Mathematics failure mode is "wrong operation" and "wrong first step," not "doesn't know where in the passage to look" (English's problem) — so the right mechanism is: show step 1 of `workingSteps` as a prompt, let the learner attempt just that step, confirm before revealing step 2, and so on, ending with the learner supplying the final numeric answer themselves. This is close to English's `sequence-anchor` pattern (show one real piece, ask the learner to complete the rest) but adapted to arithmetic steps instead of ordered list items — a genuine but *bounded* new scaffold kind, not a parallel engine.
3. **INDEPENDENT PRACTICE** — already exists; unchanged.
4. **WRONG-ANSWER REMEDIATION** — the `addresses_misconception` field already exists and is 100% populated for every family in this batch, but is never shown to the learner. The minimum change is to surface it *after* an incorrect attempt, the same place `workingSteps` already appears — no new content, only a new render branch.
5. **EXAM STRATEGY** — lower priority. No family in this batch has an authored exam-strategy hint, and unlike English (where a "tip" library already exists per family), Mathematics has no precedent to extend. Recommend deferring this specifically until after MODEL/Guided/Remediation are built and real usage data exists to justify what a Mathematics exam-strategy tip should even say.

**Existing Angel capabilities this can reuse directly, with no new engine:**
- `lib/ali/mastery.ts`'s `masteryState`/`supportTier` machinery — already subject-agnostic, already proven correct for English's guided/independent distinction, needs zero modification.
- The Practice page's existing conditional-render pattern for MODEL/Guided/Remediation sections — already built, currently gated to English only by a `subject === "english"` check (the exact gate found and used correctly in 007H's `wave1-fam-emotion-cause` fix) — Mathematics needs its *own* populated lookup tables (a Mathematics equivalent of `FAMILY_SCAFFOLD`/`ENGLISH_FAMILY_WORKED_EXAMPLE`), not a new gating mechanism.
- `workingSteps` and `addresses_misconception` — already exist, already 100% populated for every family in this batch, currently under-used rather than absent.

**Genuinely new capability required (small, bounded):**
- One new Mathematics-specific Guided Practice scaffold kind ("step reveal with self-check"), analogous to but distinct from English's four kinds.
- A render branch that shows `addresses_misconception` after an incorrect attempt.
- A render branch that shows `workingSteps` as a MODEL before the first attempt on a family the learner hasn't seen before (not after every question, which would remove the retrieval-practice value of attempting cold).

None of this is built in 007K, per instruction.

---

## Part 6 — Difficulty architecture for Mathematics (framework only, not authored)

007J/007K both confirm: every remaining and every already-activated Mathematics question in this project is `content_difficulty = medium`. This is not a data-entry accident — it reflects that difficulty has never been operationalised as anything other than a single default label. A reusable framework, derived from what actually varies across the 9 families audited in Part 3:

| Dimension | EASY | MEDIUM (today's default) | HARD / CHALLENGE |
|---|---|---|---|
| Reasoning steps | 1 step | 2 steps (today's actual ceiling — every family in this batch is exactly 2 steps) | 3+ steps, or 2 steps where the second step's *setup* isn't obvious from the first |
| Hidden operation | Operation named or obvious from context | Operation implied but standard (e.g. "the total" implies addition) | Operation must be inferred from a relationship, not a keyword (e.g. `mr02-far-ratio-context`'s ratio-share, already the hardest reasoning in this batch despite being labelled "medium") |
| Representation change | Single representation throughout | One conversion (e.g. area→perimeter) | Multiple representations combined (e.g. a ratio *and* a unit conversion in one question) |
| Distractor strength | Wrong answer requires a careless error | Wrong answer requires a specific, named misconception (true of every family here) | Wrong answer requires a *plausible partial success* — the learner did real reasoning but stopped one step early |
| Transfer distance | ROUTINE (procedure directly cued) | NEAR/MIXED_TRANSFER (procedure must be selected, not just applied) | FAR_TRANSFER stacked with a second competency (this batch's `mr04-mixed-divisibility`-style combination, already proven elsewhere in the bank, not present in this batch) |
| Irrelevant information | None | None (true of every family here — every given number is used) | At least one number in the question is a genuine distractor, never used in the correct method |
| Reverse reasoning | Forward only (given → find) | Occasional (already true of `mr01-missing-operand`, not in this batch) | Systematic — working backward from a stated outcome to an unstated input is the *primary* demand, not an occasional variant |
| Combined concepts | One competency | One primary + one clearly-labelled supporting competency (already true of `mr03-mixed-perimeter`, `mr04-far-recipe`, `mr04-compound-percentage` in this batch — their `supporting_competencies` field is populated) | Two competencies where success requires genuinely integrating both, not applying them in sequence |
| Time pressure suitability | Suitable for rapid-fire drilling | Suitable for standard timed practice | Suitable only for exam-condition practice, not repeated drilling (a HARD item should feel effortful even on a second encounter) |

**The core finding:** this batch's "medium" label is doing real work (every family here is genuinely 2-step, has a named misconception, and uses every given number) — it is not a meaningless default. What's missing is the *other two labels*, not a redefinition of the existing one. No easy on-ramp exists for a learner new to a competency, and no genuine stretch exists for a learner who has mastered the medium tier. This is a real authoring gap, not filled in 007K per instruction.

---

## Part 7 — Controlled Review Batch 4 selection

Current Practice Eligible Mathematics skill breadth queried fresh (not assumed):

| Skill | PE count | Families | Remaining 007K candidate(s) |
|---|---|---|---|
| QT-MR-13 | **3** | **1** | `mr04-best-value` (5q) — **thinnest remaining candidate skill** |
| QT-MR-06 | 9 | 3 | `mr02-far-ratio-context` (3q), `mr02-sum-difference` (5q) |
| QT-MR-04 | 8 | 2 | `mr04-compound-percentage` (5q), `mr04-far-recipe` (3q) |
| QT-MR-11 | 8 | 3 | `mr05-constrained-multiple` (3q), `mr05-factors-primes` (5q) |
| QT-MR-07 | 12 | 3 | `mr03-angle-ratio` (5q), `mr03-mixed-perimeter` (3q) |

**Decision: all 9 families are selected for Batch 4 — 37 questions.** This is not a default assumption; every family individually earns inclusion on the evidence gathered in Parts 2–3:

- All 9 are mathematically verified correct with zero defects or ambiguities (Part 2).
- All 9 pass the coherence audit — no cosmetic variant exists in this batch (Part 3).
- The one family with the strongest supply-weakness case, `mr04-best-value` (the only remaining candidate for `QT-MR-13`, currently the thinnest skill in the whole Mathematics bank at 3 questions/1 family), is an unambiguous priority.
- The two thinnest, numbers-only-variation families (`mr03-mixed-perimeter`, `mr04-far-recipe`, both 3 siblings) were the ones affected by the now-fixed unit-answer defect. Per your explicit instruction, the resolved defect is not treated as a reason to exclude them — and independently, their underlying mathematical reasoning (Part 3) is real and adequate, just thin, which is a depth observation for a future increment's authoring priorities, not a review-readiness failure today.
- This closes the entire remaining registered-family Mathematics backlog — after Batch 4, only the 5 ungrouped legacy questions (explicitly out of scope, unclassified) remain provisional in Mathematics at all.

No family is deferred. Reasoning is recorded per family, not assumed:

| Family ID | Human-readable name | Questions | Competency | Current PE supply | Evidence | Math verification | Teaching support | Difficulty | Reason selected |
|---|---|---|---|---|---|---|---|---|---|
| `mr04-best-value` | Best Value Comparison | 5 | MR-04/QT-MR-13 | 3 (thinnest remaining) | CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-13 (Obs. 11) | PASS | MINIMAL | medium only | Closes the single thinnest remaining Mathematics skill; doubles its supply and adds a 2nd family |
| `mr02-far-ratio-context` | Ratio Share with Follow-On | 3 | MR-02/QT-MR-06 | 9 across 3 sources | CSSE-006 Q8/Q18, CSSE-011 Q6/Q18, CSSE-016 Q6 | PASS | MINIMAL | medium only | Strongest structural variety in the batch (multiplier + context both vary); real supply add to MR-06 |
| `mr05-factors-primes` | Factors and Primes | 5 | MR-05/QT-MR-11 | 8 across 3 sources | CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-11 (Obs. 11) | PASS | MINIMAL | medium only | Genuine two-sub-skill structural variety (factor-count + primality) |
| `mr05-constrained-multiple` | Constrained Multiples | 3 | MR-05/QT-MR-11 | 8 across 3 sources | CSSE-006 Q10, CSSE-011 Q13, CSSE-016 | PASS | MINIMAL | medium only | Genuine direction-reversal structural variety (smallest-above vs. largest-below) |
| `mr03-angle-ratio` | Angle Ratios | 5 | MR-03/QT-MR-07 | 12 across 3 sources | CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-07 (Obs. 11) | PASS | MINIMAL | medium only | Genuine base-reversal structural variety (180° line vs. 360° point, incl. a 3-part ratio) |
| `mr02-sum-difference` | Sum and Difference | 5 | MR-02/QT-MR-06 | 9 across 3 sources | CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-06 (Obs. 11) | PASS | MINIMAL | medium only | Real algebraic reasoning depth for MR-06, even though numbers-only variation |
| `mr04-compound-percentage` | Successive Percentage Change | 5 | MR-04/QT-MR-04 | 8 across 2 sources | CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-04 (Obs. 11) | PASS | MINIMAL | medium only | Real sequential-reasoning depth, well-evidenced misconception |
| `mr03-mixed-perimeter` | Area to Perimeter | 3 | MR-03/QT-MR-07 | 12 across 3 sources | CSSE-006 Q7/Q12, CSSE-011 Q12/Q17, CSSE-016 Q11 | PASS (defect resolved, Decision 55) | MINIMAL | medium only | Real two-step reasoning; thin (3) but genuine; defect-affected, now fixed |
| `mr04-far-recipe` | Recipe Scaling | 3 | MR-04/QT-MR-04 | 8 across 2 sources | CSSE-006 Q1/Q13, CSSE-011 Q1/Q2/Q3, CSSE-016 Q1/Q2 | PASS (defect resolved, Decision 55) | MINIMAL | medium only | Real proportional reasoning; thin (3) but genuine; defect-affected, now fixed |

**Totals: 9 families, 37 questions, all Mathematics.**

---

## Part 8 — Review packs (per selected family)

All 6 canonical fields (A–F). Representative/easiest/hardest examples drawn from live production data.

### 1. Best Value Comparison — `mr04-best-value`
**A.** Comparing unit prices to determine which of two options is genuinely cheaper per item, not just which total is smaller.
**B/C.** **DIRECTLY EVIDENCED** — CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-13 (Obs. 11): CSSE-006, CSSE-016.
**D.** Representative: `mr04-bv-01` (3 for £1.20 vs. 5 for £2.25 → A). Hardest/most unusual: none harder than any other — all 5 are `medium`, no boundary case exists (disclosed). Outcome confirmed balanced (3×A, 2×B), not a guessable pattern.
**E.** MINIMAL teaching support — post-answer `workingSteps` only. **Dedicated Guided Practice is not yet implemented for this Mathematics family.**
**F.** Standard canonical review criteria, `/admin-beta/review`.

### 2. Ratio Share with Follow-On — `mr02-far-ratio-context`
**A.** Splitting a total by a stated ratio, then applying a second, separate operation to one share.
**B/C.** **DIRECTLY EVIDENCED** — CSSE-006 Q8/Q18, CSSE-011 Q6/Q18, CSSE-016 Q6.
**D.** Representative: `mr02-far-01` (twice-as-much, £36 total, spend £4 → £8). Hardest: `mr02-far-03`, the only sibling with a compound "four times" ratio phrase and a physical (rope-cutting) rather than monetary context.
**E.** MINIMAL. **Dedicated Guided Practice is not yet implemented for this Mathematics family.**
**F.** Standard canonical criteria.

### 3. Factors and Primes — `mr05-factors-primes`
**A.** Counting all factors of a number, or determining whether a number is prime.
**B/C.** **DIRECTLY EVIDENCED** — CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-11 (Obs. 11).
**D.** Representative: `mr05-fp-01` (factors of 24 → 8). Easiest/hardest not meaningfully distinguishable (all `medium`); genuine sub-type variety instead: `mr05-fp-03`/`-04` are the primality-testing pair (29 True, 51 False — 51 = 3×17 is the specific "looks prime but isn't" boundary case).
**E.** MINIMAL. **Dedicated Guided Practice is not yet implemented for this Mathematics family.**
**F.** Standard canonical criteria.

### 4. Constrained Multiples — `mr05-constrained-multiple`
**A.** Finding the smallest (or largest) common multiple of two numbers that also satisfies a stated bound.
**B/C.** **DIRECTLY EVIDENCED** — CSSE-006 Q10, CSSE-011 Q13, CSSE-016.
**D.** Representative: `mr05-mult-01` (smallest multiple of 4 and 9 above 30 → 36). Boundary/unusual: `mr05-mult-03` is the only "largest... less than" (direction-reversed) sibling.
**E.** MINIMAL. **Dedicated Guided Practice is not yet implemented for this Mathematics family.**
**F.** Standard canonical criteria.

### 5. Angle Ratios — `mr03-angle-ratio`
**A.** Splitting a known angle total (180° on a line, 360° around a point) by a stated ratio to find the largest share.
**B/C.** **DIRECTLY EVIDENCED** — CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-07 (Obs. 11).
**D.** Representative: `mr03-angratio-01` (2:3 on a line → 108°). Hardest/unusual: `mr03-angratio-03`, the only 3-part ratio (1:2:3 around a point).
**E.** MINIMAL. **Dedicated Guided Practice is not yet implemented for this Mathematics family.**
**F.** Standard canonical criteria.

### 6. Sum and Difference — `mr02-sum-difference`
**A.** Recovering two unknown amounts from their sum and their stated difference.
**B/C.** **DIRECTLY EVIDENCED** — CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-06 (Obs. 11).
**D.** Representative: `mr02-sumdiff-01` (£8 more, £36 total → £14). All 5 share the identical structure with changed names/amounts (disclosed — the weakest-variety family alongside compound-percentage/best-value/far-recipe, per Part 3).
**E.** MINIMAL. **Dedicated Guided Practice is not yet implemented for this Mathematics family.**
**F.** Standard canonical criteria.

### 7. Successive Percentage Change — `mr04-compound-percentage`
**A.** Applying two percentage changes in sequence, each to the *result* of the previous one, not both to the original value.
**B/C.** **DIRECTLY EVIDENCED** — CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md QT-MR-04 (Obs. 11).
**D.** Representative: `mr04-cpct-01` (£80, +25% then −15% → £85). Hardest: `mr04-cpct-05`, the only sibling requiring a non-whole-pound final answer (£202.50).
**E.** MINIMAL. **Dedicated Guided Practice is not yet implemented for this Mathematics family.**
**F.** Standard canonical criteria.

### 8. Area to Perimeter — `mr03-mixed-perimeter`
**A.** Using a rectangle's area and one side to find the other side, then computing the perimeter.
**B/C.** **DIRECTLY EVIDENCED** — CSSE-006 Q7/Q12, CSSE-011 Q12/Q17, CSSE-016 Q11.
**D.** Representative: `mr03-mix-01` (area 48m², side 6m → perimeter 28m). Only 3 siblings, no easy/hard variant (disclosed).
**E.** MINIMAL. **Dedicated Guided Practice is not yet implemented for this Mathematics family.** **Known limitation, now resolved:** this family's answers carry a unit suffix (`28m`) — a bare-number learner answer was previously marked wrong (Decision 55); the fix is live and verified (Part 2 of this document; 21 direct tests plus full-bank regression).
**F.** Standard canonical criteria.

### 9. Recipe Scaling — `mr04-far-recipe`
**A.** Finding a unit rate (amount per person) and scaling it to a different number of people.
**B/C.** **DIRECTLY EVIDENCED** — CSSE-006 Q1/Q13, CSSE-011 Q1/Q2/Q3, CSSE-016 Q1/Q2.
**D.** Representative: `mr04-far-04` (200g for 8 people → 300g for 12). Only 3 siblings, no easy/hard variant (disclosed).
**E.** MINIMAL. **Dedicated Guided Practice is not yet implemented for this Mathematics family.** **Known limitation, now resolved:** same unit-answer defect as above (`300g` etc.), fixed and verified (Decision 55).
**F.** Standard canonical criteria.

**Conclusion: review-pack readiness MET for all 9 selected targets.**

---

## Part 9 — Review interface extension

`/admin-beta/review` extended with a new **"Controlled Review Batch 4"** section (`app/admin-beta/review/page.tsx`, `Batch4Section`, emerald styling to visually distinguish it from Pilot/Batch 2 (sky)/Batch 3 (amber)), showing "0 of 9 reviewed" and listing all 9 selected families using the standard `TargetCard` component (plain-language name, subject, question count, difficulty range).

- `BATCH4_TARGET_IDS` added (9 IDs), inserted between `BATCH3_TARGET_IDS` and the display-name/context lookups.
- `FAMILY_DISPLAY_NAME` extended with all 9 plain-language names.
- `FAMILY_EDUCATIONAL_CONTEXT` (`lib/adminReview.ts`) extended with all 9 review-pack objective/evidence entries from Part 8, including the disclosed known-limitation note (now resolved) for `mr03-mixed-perimeter` and `mr04-far-recipe`.
- `FullBacklogSection`'s exclusion filter extended to also exclude `BATCH4_TARGET_IDS`, so these 9 do not double-count in the full backlog beneath.
- Pilot, Batch 2, and Batch 3 sections are **unchanged** — same target lists, same reviewed counts, same styling.
- **No review records created.** No target opened, no decision submitted, no `ali_family_review` row inserted by this work.
- **Nothing activated.** `eligibility_status` untouched for all 9 families — still `provisional`.

---

## Part 10 — Verification

- **Automated tests**: `npx tsx --test` across all 12 test files — **231/231 PASS, 0 fail** (includes the 21-test unit-answer suite from the defect fix, all pre-existing suites unaffected).
- **First-principles Mathematics verification** (`scripts/007i-maths-answer-verification.mjs`, re-run fresh against live production): **37/37 PASS, 0 defects** across all 9 Batch 4 families.
- **Bank-wide answer-validation regression** (`scripts/007k-bankwide-answer-regression.mjs`, re-run fresh): **166/166 checks PASS** across all 146 live Mathematics rows.
- **TypeScript** (`npx tsc --noEmit`): clean, 0 errors.
- **Copy Quality Guard** (`scripts/copy-quality-guard.mjs`): PASS, 0 violations across 229 files.
- **Production build** (`npm run build`): succeeds; `/admin-beta/review` compiles and is listed in the route output.
- **Content-count regression**, queried fresh from live production:

| Metric | Expected | Actual | Match |
|---|---|---|---|
| Total questions | — | 264 | — |
| Practice Eligible (all) | 210 | 210 | ✓ |
| Practice Eligible (Mathematics) | 104 | 104 | ✓ |
| Practice Eligible (English) | 106 | 106 | ✓ |
| Provisional (all) | 54 | 54 | ✓ |
| Mock Eligible | 0 | 0 | ✓ |

**No eligibility migration was applied in 007K.** All counts match the pre-007K baseline exactly, confirming the defect fix (code-only) and the Batch 4 review-readiness work (review-interface/data-layer only) made zero changes to any `eligibility_status` value.

---

## Part 11 — Final Report: ANGEL 11+ EDUCATIONAL INCREMENT 007K MATHEMATICS EDUCATIONAL DEPTH AND BATCH 4 READINESS REPORT

1. **Starting Mathematics provisional count**: 42 (37 registered-family + 5 ungrouped legacy, reconciled exactly — Part 1).
2. **Remaining registered families**: 9 (`mr02-far-ratio-context`, `mr02-sum-difference`, `mr03-angle-ratio`, `mr03-mixed-perimeter`, `mr04-best-value`, `mr04-compound-percentage`, `mr04-far-recipe`, `mr05-constrained-multiple`, `mr05-factors-primes`).
3. **Question count**: 37 across the 9 families; 5 ungrouped legacy questions excluded, untouched, unclassified.
4. **Mathematical/educational defects found**: **1 — the unit-answer validation defect** (`checkMathsAnswer()` rejected mathematically correct bare-number answers to questions whose stored answer carried a letter unit suffix). Discovered during Part 4's teaching-pathway trace, reported before correction per standing instruction, fixed under a separate Founder-authorised directive (commit `d2df4d8`, deployed, live-verified — Decision 55), and independently confirmed resolved for both Batch-4-affected families (`mr03-mixed-perimeter`, `mr04-far-recipe`) via 21 direct tests plus a 166-check bank-wide regression. Zero other mathematical or educational defects found across all 37 questions.
5. **Family-depth findings**: no family fails outright. 4 families (`mr02-far-ratio-context`, `mr03-angle-ratio`, `mr05-constrained-multiple`, `mr05-factors-primes`) show genuine *structural* sibling variation (strongest anti-memorisation performers); 5 (`mr02-sum-difference`, `mr03-mixed-perimeter`, `mr04-best-value`, `mr04-compound-percentage`, `mr04-far-recipe`) are *numbers-only* variation of one fixed structure — real transferable reasoning, but weaker repeat-practice resilience. 2 families (`mr03-mixed-perimeter`, `mr04-far-recipe`) are additionally thin (only 3 siblings each).
6. **Difficulty findings**: 100% of the batch is labelled `medium`; this is not a meaningless default (every family is genuinely 2-step, has a named misconception, uses every given number — Part 6), but no EASY on-ramp and no HARD/stretch tier exists anywhere in Mathematics. A 9-dimension difficulty framework is defined (Part 6) but deliberately not authored against.
7. **Teaching-loop assessment**: Mathematics currently has no MODEL, no Guided Practice, no wrong-answer remediation, and no exam-strategy support — a single undifferentiated "independent" attempt loop, in contrast to English's real, functioning 4-scaffold-kind Guided Practice system (Part 4).
8. **Learner-struggle weaknesses identified**: nothing is caught mid-attempt; `addresses_misconception` (100% populated) is never learner-facing; post-answer `workingSteps` is identical regardless of correct/incorrect; no scaffold exists to fade from; a correct-by-guessing attempt and a correctly-reasoned attempt are recorded identically (Part 4, 7 named scenarios traced individually).
9. **Proposed minimum teaching architecture** (proposal only, not built): MODEL (resurface existing `workingSteps` before first attempt), a new bounded Guided Practice kind — "step reveal with self-check," Independent (unchanged), Wrong-Answer Remediation (surface existing `addresses_misconception` after an incorrect attempt), Exam Strategy (recommended deferred) — Part 5.
10. **Reusable vs. new capabilities**: `lib/ali/mastery.ts`'s `supportTier` machinery and the Practice page's existing English-gated conditional-render pattern are reusable with zero engine modification; only new Mathematics-specific lookup tables and 2 new render branches are genuinely new, bounded capability (Part 5).
11. **Batch 4 families selected**: all 9 remaining registered families (not a default assumption — each individually justified in Part 7's table on evidence, correctness, coherence, and supply-weakness grounds; `mr04-best-value` is the standout priority as the single thinnest live Mathematics skill, QT-MR-13 at 3 questions/1 family).
12. **Batch 4 question count**: 37.
13. **Families deferred**: none. Reasoning: all 9 passed both mathematical correctness (Part 2, 37/37) and coherence audit (Part 3, no cosmetic variant); this closes the entire remaining registered-family Mathematics backlog; the two defect-affected families are independently re-verified resolved and are not excluded on that basis per explicit instruction.
14. **Review packs completed**: 9 of 9, all 6 canonical fields (A–F) per family (Part 8).
15. **Review-interface status**: `/admin-beta/review` extended with a "Controlled Review Batch 4 — 0 of 9 reviewed" section; Pilot/Batch 2/Batch 3 unchanged; no review records created; nothing activated (Part 9).
16. **Production Practice Eligible count**: 210 (unchanged from pre-007K baseline).
17. **Production Practice Eligible, Mathematics**: 104 (unchanged).
18. **Production Practice Eligible, English**: 106 (unchanged).
19. **Production Provisional count**: 54 (unchanged).
20. **Mock Eligible count**: 0 (unchanged; no Mock work performed).
21. **Test results**: 231/231 automated tests PASS; 37/37 first-principles Mathematics verification PASS; 166/166 bank-wide answer-validation regression PASS.
22. **Build/TypeScript/Copy Quality Guard results**: all clean — 0 TypeScript errors, 0 Copy Quality Guard violations (229 files), production build succeeds.
23. **Remaining educational risks**: (a) Mathematics has no teaching-support tier beyond "independent" anywhere in the bank — a structural gap, not specific to this batch; (b) 2 of the 9 Batch 4 families are thin (3 siblings) and would benefit from additional authored variety in a future increment; (c) the difficulty framework (Part 6) is defined but not yet authored against — no EASY or HARD Mathematics content exists anywhere in the platform; (d) the 5 ungrouped legacy questions remain unclassified and outside any review pathway.
24. **Overall verdict**: **PASS WITH FINDINGS.** The defect found and fixed under separate Founder authorisation is fully resolved and independently re-verified; the Batch 4 selection, review packs, and interface extension are complete and correct; the findings in item 23 are genuine open items, not defects in the work performed in 007K.
25. **Readiness for Founder Batch 4 review**: **READY.** All 9 families have complete review packs, real representative/easiest/hardest examples, honest evidence citations, and honestly disclosed teaching-support and difficulty limitations. No review decision has been preselected anywhere.
26. **Recommendation for after Batch 4 review**: once the Founder completes the 9 Batch 4 reviews, the next controlled step should be reconciliation and (if approved) activation, following the exact same pattern as 007H/007J — evidence-based decision reconciliation via authenticated Table Editor evidence (per Decision 48's standing RLS-opacity discipline), fresh manifest recomputation, a scoped and idempotent activation migration generated but not applied, full regression, and a STOP before database application pending Founder confirmation.
27. **This report does not authorise activation of Batch 4, does not implement Mathematics Guided Practice, does not author new Mathematics content, does not classify the 5 legacy questions, and does not begin any further increment.** 007K is complete and STOPS here for Founder review.

