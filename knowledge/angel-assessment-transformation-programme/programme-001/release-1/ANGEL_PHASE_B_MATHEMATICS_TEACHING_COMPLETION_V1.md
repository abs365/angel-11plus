# Angel 11+ — CSSE Completion Programme, Phase B — Mathematics Teaching Completion

**Prepared:** 2026-08-16. Founder approval: PROCEED (Phase A closed PASS).
**Scope:** Mathematics teaching completion only. Reuses the frozen 007L architecture (Decision 57) unmodified as the reference pattern. Does not touch English, Writing, Mock, difficulty-ladder implementation, or the 5 legacy ungrouped provisional Mathematics questions.
**Status:** Design + bounded implementation. Following 007L's own precedent, no maturity above TEACHING PARTIAL/REVIEW READY is self-declared — Founder educational review of the authored content remains outstanding (Part 10).

---

## Part 1 — The real Mathematics estate (reconciled fresh, not trusted from any prior report)

Queried live production directly (`ali_question_bank`, `subject=eq.maths`, all statuses) on 2026-08-16, cross-checked against `lib/learningEngine/mathsTeachingContent.ts` and `app/learning-intelligence/practice/[area]/page.tsx` directly. **146 live Mathematics rows, 141 Practice Eligible, unchanged from Phase A's baseline — zero drift.**

### 1A. 27 named families (114 PE questions)

| Family | QT | PE siblings | Teaching maturity (before Phase B) |
|---|---|---|---|
| `mr01-average-mean` | QT-MR-12 | 4 | ASSESSMENT ONLY |
| `mr01-data-table` | QT-MR-09 | 5 | ASSESSMENT ONLY |
| `mr01-measurement-conversion` | QT-MR-03 | 4 | **FULL (007L)** |
| `mr01-missing-operand` | QT-MR-02 | 4 | **FULL (007L)** |
| `mr02-compare` | QT-MR-06 | 3 | ASSESSMENT ONLY |
| `mr02-far-ratio-context` | QT-MR-06 | 3 | ASSESSMENT ONLY |
| `mr02-nth-term` | QT-MR-05 | 5 | ASSESSMENT ONLY |
| `mr02-sequence-rule` | QT-MR-05 | 10 | ASSESSMENT ONLY |
| `mr02-substitution` | QT-MR-06 | 5 | ASSESSMENT ONLY |
| `mr02-sum-difference` | QT-MR-06 | 5 | ASSESSMENT ONLY |
| `mr03-angle-ratio` | QT-MR-07 | 5 | **FULL (007L)** |
| `mr03-angle-sum` | QT-MR-07 | 7 | ASSESSMENT ONLY |
| `mr03-classify` | QT-MR-07 | 3 | ASSESSMENT ONLY |
| `mr03-coordinate` | QT-MR-08 | 3 | ASSESSMENT ONLY |
| `mr03-mixed-perimeter` | QT-MR-07 | 3 | ASSESSMENT ONLY |
| `mr04-best-value` | QT-MR-13 | 5 | **FULL (007L)** |
| `mr04-compound-percentage` | QT-MR-04 | 5 | ASSESSMENT ONLY |
| `mr04-elapsed-time` | QT-MR-10 | 5 | ASSESSMENT ONLY |
| `mr04-far-percent` | QT-MR-04 | 3 | ASSESSMENT ONLY |
| `mr04-far-recipe` | QT-MR-04 | 3 | ASSESSMENT ONLY |
| `mr04-mixed-divisibility` | QT-MR-13 | 3 | ASSESSMENT ONLY |
| `mr05-constrained-multiple` | QT-MR-11 | 3 | ASSESSMENT ONLY |
| `mr05-factors-primes` | QT-MR-11 | 5 | ASSESSMENT ONLY |
| `mr05-number-property` | QT-MR-11 | 5 | ASSESSMENT ONLY |
| `mr05-number-property-search` | QT-MR-11 | 2 | ASSESSMENT ONLY |
| `precision-dec` | QT-MR-14 | 3 | ASSESSMENT ONLY |
| `precision-frac` | QT-MR-14 | 3 | ASSESSMENT ONLY |

**4 of 27 families (15%) had FULL teaching support before Phase B; 23 (85%) were ASSESSMENT ONLY.**

### 1B. Legacy ungrouped pool (out of Phase B scope)

32 rows, `family_id: null`, `skill` spans 11 different QT codes, 0% `addresses_misconception` population. **27 are `practice_eligible`, 5 are `provisional`** — the "five legacy" Part 11 refers to. Per this document's own earlier finding (Coverage Matrix, Phase A), attaching teaching content here requires a content-governance step (classifying this pool into real families) before any teaching-architecture step is even possible — explicitly out of Phase B's scope, not force-classified, not promoted, not touched. Reported separately (Part 11 of the Phase B report).

### 1C. 007L proof-family reconciliation

All 4 re-verified against fresh live data before any other work began:

| Family | Live answers checked | MODEL answer | Collision? |
|---|---|---|---|
| `mr01-missing-operand` | 12, 7, 38, 23 | 9 | None |
| `mr01-measurement-conversion` | 4.25m, 2.55m, 1.55kg, 2.15l | 2.1m | None |
| `mr03-angle-ratio` | 108°, 100°, 180°, 160°, 105° | 144° | None |
| `mr04-best-value` | A, B, B, A, A | B | None (binary answer space, per 007L's own established skip-rule) |

No drift found. All 4 remain safe and accurate. **Bonus finding:** fresh data confirms `mr03-angle-ratio` genuinely contains 2 of 5 live questions on the 360°-around-a-point base (`mr03-angratio-03`, `-04`) — independently closes a verification gap the 007L closure report had flagged as unconfirmed ("I did not personally observe a 360°-base live instance").

---

## Part 2 — The Mathematics teaching contract (frozen, 007L architecture reused unmodified)

**MODEL → GUIDED → INDEPENDENT → REMEDIATION → RETRIEVAL/TRANSFER → MASTERY EVIDENCE.** No second teaching engine. Same family-keyed `Record<familyId, …>` lookup (`MATHS_FAMILY_TEACHING_CONTENT`), same generic-rendering `MathsActivity` component, same `supportTier` mastery gate (`lib/ali/mastery.ts`, unmodified).

**MODEL:** a fixed, hand-authored, non-live worked scenario per family — never the live question's own numbers. Verified by independent recomputation that its answer never collides with any live sibling's answer. Teaches the method (what to notice, the relationship in words, ordered reasoning, a verification/check step), never merely restates a rule.

**GUIDED PRACTICE:** progressive reveal of the family's own real `workingSteps`, one step at a time, exactly 007L's mechanism — no second, separately-authored, potentially-drifting copy, and no fake per-step correctness checking (the system cannot genuinely validate an intermediate value, so it doesn't pretend to). **New safety rule, found necessary by this phase's own design research (Part 3, `mr01-data-table`):** a family's step reveal must never expose a step whose text contains the literal final answer value before the learner's own submission. Where a family's own final `workingSteps` entry is answer-revealing (a generic template ending in "Compute the answer: `<answer>`", not real intermediate working), that family's implementation caps reveal at `workingSteps.length − 1`, or omits step-reveal entirely if fewer than 2 genuine non-answer-revealing steps remain. This is a generic, automatically-checkable rule (implemented as a real safety check, not a per-family judgement call) — see Part 4.

**INDEPENDENT PRACTICE:** unchanged. No MODEL/Guided UI renders. `supportTier: "independent"`.

**WRONG-ANSWER REMEDIATION:** the family's own real, human-reviewed `addresses_misconception` text, mapped to a category label for consistent framing — never a fabricated per-answer diagnosis. Existing taxonomy (`OPERATION_SELECTION`, `PROCEDURAL_SEQUENCE_ERROR`, `UNIT_OR_CONVERSION_ERROR`, `MISREAD_QUANTITY`, `STRUCTURAL_MISAPPLICATION`) reused wherever it genuinely fits; extended only where the real evidence supports a new category (see Part 3 per-family designs and Part 5).

**RETRIEVAL / TRANSFER:** governed entirely by the existing, unmodified `sessionGenerator.ts` anti-clustering and the family's own real sibling variation — not a new mechanism. Where a family's real siblings are too few or too similar to demonstrate genuine transfer, it is classified TRANSFER-LIMITED/UNSAFE (Part 7) rather than silently treated as equivalent to a deep family.

**MASTERY:** unchanged, reused exactly. `recordOutcome(..., supportTier)`, `applyAttemptOutcome`'s existing gate (`lib/ali/mastery.ts`) — supported success can never independently reach "mastered" or advance `distinctCorrectSessions`; a wrong-then-correct-supported attempt stays supported; only a later genuine independent attempt can establish stronger evidence. No modification to this file authorised or required — Part 6 proves these properties hold, it does not change them.

---

## Part 3 — Family-by-family teaching design (22 implemented + 4 pre-existing 007L + 1 deferred)

Every design below is grounded in real live production data (question/answer/`workingSteps`/`addresses_misconception`), independently queried fresh, cross-checked against `lib/learningEngine/mathsTeachingContent.ts`, and machine-verified for zero MODEL/live-answer collision by `scripts/007l-model-verification.mjs` (26/26 families, 112/112 live rows, ALL CHECKS PASS) and 35 unit tests (`tests/lib/learningEngine/mathsTeachingContent.test.ts`). Two collisions found by hand during design were caught and corrected before implementation (`mr02-nth-term`, `mr02-sum-difference`); one further near-collision was caught and corrected during the design pass itself (`mr03-coordinate`) — exactly the process 007L's own Part 8 established, working as intended.

| Family | What it teaches | Misconception category | Guided reveal | Transfer |
|---|---|---|---|---|
| `mr01-average-mean` | Mean = total ÷ count | MISREAD_QUANTITY | Full (real 3-step) | **SUFFICIENT** — 4 genuinely distinct contexts |
| `mr01-data-table` | Use only the named subset of a table | MISREAD_QUANTITY | **Capped at 1 of 2 steps** — final step is a generic "Compute the answer: `<answer>`" template, not real working | **LIMITED** — only 3 distinct underlying datasets across 5 questions |
| `mr02-compare` | Substitute both expressions separately, then compare | PROCEDURAL_SEQUENCE_ERROR | Full (real 3-step) | **LIMITED** — 3 siblings |
| `mr02-far-ratio-context` | Ratio split + follow-on step | OPERATION_SELECTION | Full (real 3-step) | **LIMITED** — 3 siblings |
| `mr02-nth-term` | nth term = first + (n−1)×diff | PROCEDURAL_SEQUENCE_ERROR | Full (real 3-step) | **SUFFICIENT** — 5 siblings, varied start/diff/position, includes negative-difference case |
| `mr02-sequence-rule` | Two-step rule, forward + inverse | PROCEDURAL_SEQUENCE_ERROR | Full (real steps) | **SUFFICIENT** — 10 siblings (5 rule-pairs), genuinely distinct rules |
| `mr02-substitution` | Substitute two relationships into one total | INCOMPLETE_REASONING (new) | Full (real 3-step) | **SUFFICIENT** (borderline) — 5 siblings, every coefficient pair differs |
| `mr02-sum-difference` | x + (x+diff) = total | OPERATION_SELECTION | Full (real 3-step) | **LIMITED** — despite 5 siblings, identical sentence template throughout |
| `mr03-angle-sum` | Shape total − known angles | STRUCTURAL_MISAPPLICATION | Full (real 3-step) | **SUFFICIENT** — 7 siblings across triangle + quadrilateral sub-cases |
| `mr03-classify` | Equal angles ⇒ equal sides | INCOMPLETE_REASONING (new) | Full (real 2-step) | **LIMITED** — only 3 siblings, one per answer category (memorisation risk) |
| `mr03-coordinate` | Axis-specific reflection/translation rule | STRUCTURAL_MISAPPLICATION | Full (real 2-step) | **LIMITED** (thinnest of the geometry families) — 3 siblings, 3 *different* sub-skills, no repetition of any one transformation type |
| `mr03-mixed-perimeter` | Area÷side ⇒ missing side ⇒ perimeter | MISREAD_QUANTITY | Full (real 2-step) | **LIMITED**, closest to a disguised clone set — same word-problem template ×3, numbers only |
| `mr04-compound-percentage` | Second % applies to the new value | PROCEDURAL_SEQUENCE_ERROR | Full (real 2-step) | **SUFFICIENT** — 5 genuinely different price/%-pair combinations |
| `mr04-elapsed-time` | Carry minutes at the 60-boundary | UNIT_OR_CONVERSION_ERROR | Full (real steps) | **SUFFICIENT, with caveat** — real numeric variation but identical 3-stage template throughout |
| `mr04-far-percent` | Before/after price ⇒ proportional fraction, applied elsewhere | STRUCTURAL_MISAPPLICATION | Full (real 3-step) | **LIMITED** — 3 siblings, distinct fractions |
| `mr04-far-recipe` | Unit-rate scaling (multiplicative, not additive) | STRUCTURAL_MISAPPLICATION | Full (real 2-step) | **LIMITED** — 3 siblings |
| `mr04-mixed-divisibility` | Two conditions must both hold | PROCEDURAL_SEQUENCE_ERROR | Full (real 2-step) | **LIMITED** — 3 siblings, genuinely different divisor/remainder pairs |
| `mr05-constrained-multiple` | LCM, then boundary check | PROCEDURAL_SEQUENCE_ERROR | Full (real 2-step) | **LIMITED** — 3 siblings |
| `mr05-factors-primes` | Factor pairs / primality test (bimodal family) | STRUCTURAL_MISAPPLICATION (imperfect umbrella, disclosed) | Full (real 2-step) | **LIMITED** — nominally 5 but only 2-3 per actual sub-skill; flagged for Phase E as a possible family split |
| `mr05-number-property` | Apply the exact property definition, not a related rule of thumb | STRUCTURAL_MISAPPLICATION | **None — architecturally impossible**, not a design choice: all 5 live rows have `workingSteps: null` | **SUFFICIENT** (borderline) — 5 siblings, genuine conceptual variety |
| `precision-dec` | Round on the extra digit, never truncate | PROCEDURAL_SEQUENCE_ERROR | Full (real 3-step) | **LIMITED** — all 3 siblings round *up*; no round-down example exists |
| `precision-frac` | Exact fraction required, not a rounded decimal | PRECISION_INSTRUCTION_IGNORED (new) | Full (real 3-step) | **LIMITED** — all 3 siblings structurally identical |

**Deferred, not implemented:** `mr05-number-property-search` (2 PE siblings, structurally near-identical "prime search near a bound" — 2 data points cannot demonstrate independent transfer vs. memorisation; also has zero `addresses_misconception` population, a real data-quality gap). Recommend Phase E add 3-4 more siblings varying the searched property before this family is considered for teaching content.

**Two new misconception categories added**, both from convergent independent evidence (two separate families each, researched independently, needing the same real gap — not invented speculatively):
- `INCOMPLETE_REASONING` — "This looks like part of the reasoning or a checking step was left out." (`mr02-substitution`, `mr03-classify`)
- `PRECISION_INSTRUCTION_IGNORED` — "This looks like the working was right, but the question's instruction about how to give the answer wasn't followed." (`precision-frac` only — `precision-dec`'s real error is rounding *technique*, a genuinely different fit, kept as `PROCEDURAL_SEQUENCE_ERROR`)

**Pre-existing answer-format risks reconfirmed, not fixed (out of Phase B's answer-validation scope, unrelated to teaching content):** `mr02-substitution`'s compound `"A=6, C=3"` format (a reordered submission would fail); `mr03-coordinate`'s parenthesised-pair format (an unparenthesised submission would fail). Both already flagged in the CSSE Completion Programme's own coverage matrix; not new findings, not addressed here — a future bounded Decision-55-style fix, not a Phase B teaching-completion concern.

---

## Part 7 — Anti-memorisation and transfer classification

Per family, above (Part 3's Transfer column). Summary: **7 SUFFICIENT, 14 LIMITED, 1 UNSAFE (deferred)** among the 22 implemented + deferred families; all 4 original 007L families were already independently verified SUFFICIENT/adequate at 007L time. No family was implemented while honestly assessed as UNSAFE — `mr05-number-property-search` was excluded rather than disguised.

**For Phase E, the following LIMITED families most need genuine structural variation (not just more numbers) to reach SUFFICIENT**, ranked by how close each is to a "disguised clone set":
1. `mr03-mixed-perimeter` — identical word-problem template ×3; needs a structural variant (e.g. perimeter+side→area, non-integer division).
2. `mr02-sum-difference` — identical sentence template despite numeric variation.
3. `precision-frac` / `precision-dec` — `precision-dec` needs a round-down example; `precision-frac` needs a non-improper-fraction or already-simplified case.
4. `mr03-classify` — needs siblings that don't map 1:1 onto the 3-value answer space.
5. `mr05-factors-primes` — consider splitting into two families (factor-count vs. primality) rather than adding more of the same bimodal mix.

---

## Part 8 — Difficulty observations (feeds Phase E, not implemented here)

The 007K nine-dimension framework remains architecture only. Phase B's own family-by-family research surfaced concrete, family-specific scaffolding-relevant observations, recorded here rather than acted on:

- **Number of operations**: `mr02-substitution` (2 relationships + 1 total equation) and `mr04-mixed-divisibility` (2 simultaneous conditions) carry genuinely higher operation-count load than single-step families like `mr01-missing-operand`, despite both being tagged `content_difficulty: medium` in the bank — the raw difficulty label does not currently distinguish this.
- **Representation load**: `mr03-coordinate` (parenthesised pairs) and `mr02-substitution` (compound labelled-variable strings) both require the learner to parse and produce a structured text format, not just a number — a distinct cognitive/representational demand from every other family, and also the two families' own confirmed answer-format brittleness (Part 3).
- **Reasoning depth / transfer distance**: `mr02-sequence-rule`'s inverse-direction items (reversing two chained operations, in reverse order) are meaningfully harder than its forward-direction items, despite sharing one family and one `content_difficulty` value.
- **Language load**: `mr04-elapsed-time` and `mr04-far-recipe`/`mr04-far-percent` embed the mathematics inside a multi-sentence real-world scenario, a heavier reading load than a bare numeric/algebraic prompt like `mr02-nth-term`.
- **Distractor strength**: not assessable from the current data — no family stores wrong-answer options (all are free-text/short-answer, not multiple-choice), so this dimension has no current evidence base in Mathematics.
- **Time pressure**: no family has any timing data or feature (confirmed absent in the Phase A/completion-programme audit) — entirely unaddressed, a Phase E/exam-technique concern, not Phase B's.

No `content_difficulty` value was changed. No family was relabelled. This section is observational input for Phase E's design, not a Phase B action.

---

## Part 11 — Legacy Mathematics questions (out of scope, reported not touched)

**32 rows, `family_id: null`, spanning 11 different Question Types** (per Part 1B). **27 are `practice_eligible`** (already live, undifferentiated, `ASSESSMENT ONLY`); **5 are `provisional`** — these 5 are the ones Part 11 of the Phase B directive names. Neither group was classified into families, promoted, demoted, or had provenance invented. Attaching teaching content to any of them would require a content-governance step (classification into real families) that is explicitly a different kind of work from teaching-architecture extension — out of Phase B's scope by the directive's own instruction, not overlooked.
