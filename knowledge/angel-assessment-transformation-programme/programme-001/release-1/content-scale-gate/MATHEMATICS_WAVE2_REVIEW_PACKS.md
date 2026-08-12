# Mathematics Wave 2 — Review-Ready Family Packs

**Prepared:** 2026-08-12, Educational Increment 005B, Part 16.
**Purpose:** let an independent reviewer evaluate each family via `ali_family_review` (migration 034) without inspecting every deterministic rendering individually. All 4 families are currently `eligibility_status = 'provisional'` — none is self-promoted.

---

## Family: `mr02-compare`

- **Definition:** evaluate two linear expressions (`an + b` form) at a stated integer `n`, judge Greater/Less/Equal.
- **Evidence basis:** QT-MR-06 (Algebraic Symbol/Unknown-Value Problem-Solving), CSSE-006 Q8/Q18, CSSE-011 Q6/Q18, CSSE-016 Q6.
- **Structural signature:** `QT-MR-06|comparative|steps=3`
- **Representative item (`mr02-cmp-02`):** "When n = 3, is 2n + 9 greater than, less than, or equal to 4n + 1?" → Greater (15 > 13)
- **Easy boundary:** none authored yet — every variant currently evaluates two 2-term linear expressions; a genuinely easier variant would use single-operation expressions (e.g. `n+5` vs `2n`).
- **Hard boundary (`mr02-cmp-01`):** the Equal case — a learner who evaluates only one side or stops early cannot guess "Equal" by elimination the way they might guess between Greater/Less.
- **Far-transfer example:** none in this family (ROUTINE) — the comparison operation is explicitly named.
- **Mixed-transfer example:** none in this family.
- **Misconception:** evaluating only one expression, or evaluating both but comparing them in the wrong direction.
- **Answer logic:** deterministic, computed in code (`generate-mathematics-wave2.mjs`'s `mr02Compare()`), not hand-typed.
- **Explanation:** each item's `explanation` field cites QT-MR-06, MR-02, structure, transfer class, and the real Asset IDs.

## Family: `mr03-classify`

- **Definition:** given a triangle's three angles, classify it as equilateral/isosceles/scalene using the equal-angles-imply-equal-opposite-sides property.
- **Evidence basis:** QT-MR-07 (Geometric Angle/Shape Reasoning), CSSE-006 Q7/Q12, CSSE-011 Q12/Q17, CSSE-016 Q11.
- **Structural signature:** `QT-MR-07|classification|steps=2`
- **Representative item (`mr03-cls-02`):** "A triangle has angles of 90°, 45°, 45°. Is it isosceles, equilateral or scalene?" → Isosceles
- **Easy boundary (`mr03-cls-01`):** 60/60/60 — all-equal is the most immediately recognisable case.
- **Hard boundary (`mr03-cls-03`):** 80/60/40 — all different, requiring the learner to actively rule out both other categories rather than spot an obvious repeated value.
- **Far-transfer example:** none in this family (ROUTINE).
- **Mixed-transfer example:** none in this family.
- **Misconception:** assuming a triangle with a right angle or one notably large angle must be scalene, without actually checking whether two angles are equal.
- **Answer logic:** deterministic (`mr03Classify()`); the migration itself asserts the three angles sum to 180 before authoring, catching a malformed triangle at generation time.
- **Explanation:** as above, cites QT-MR-07, MR-03, structure, transfer class, Asset IDs.

## Family: `mr04-far-percent`

- **Definition:** two paired before/after prices establish a proportional relationship; the learner must apply the same relationship to a new value. No mention of "percentage," "fraction," or "ratio" anywhere in the prompt.
- **Evidence basis:** QT-MR-04 (Percentage/Proportional Change Word Problem), CSSE-006 Q1/Q13, CSSE-011 Q1/Q2/Q3, CSSE-016 Q1/Q2.
- **Structural signature:** `QT-MR-04|currency|steps=3`
- **Representative item (`mr04-far-01`):** "A book that cost £20 now costs £15... what is the new price of a jacket that originally cost £60?" → £45
- **Easy boundary:** all three variants use a "nice" ratio (3/4, 4/5, 5/8) — no variant yet uses a ratio that doesn't simplify cleanly; disclosed as a current limitation, not hidden.
- **Hard boundary (`mr04-far-03`):** ratio 5/8 — less immediately recognisable than 3/4 or 4/5.
- **Far-transfer justification:** the prompt never names the operation. A learner must recognise that "£15 out of £20" defines a proportional relationship and that the SAME relationship (not the same absolute reduction) applies to the second price. This is the directive's own stated far-transfer test: "the learner must recognise the relevant mathematical relationship" rather than being told which procedure to apply. Disclosed limitation: all three variants share the identical narrative frame (a shop, a book, a jacket) — genuine far transfer would eventually vary the context/representation too, not just the numbers; this is recorded as future work, not claimed as done.
- **Mixed-transfer example:** none in this family (it is FAR_TRANSFER, not MIXED_TRANSFER — the two classifications are kept distinct, not conflated).
- **Misconception:** subtracting the same fixed amount instead of applying the same proportional reduction — genuinely diagnostic, since a learner who does this produces a specific, predictable wrong answer, disclosed per item.
- **Answer logic:** deterministic (`mr04FarPercent()`); the generator asserts the computed second price is a whole number before authoring, so no variant risks an awkward non-integer answer.

## Family: `mr04-mixed-divisibility`

- **Definition:** a population fits two simultaneous grouping conditions (a stated range plus two modular/divisibility conditions); the learner must find the one number satisfying both.
- **Evidence basis:** QT-MR-13 (Best-Value/Combinatorial Word Problem), CSSE-006, CSSE-016.
- **Structural signature:** `QT-MR-13|numeric|steps=2`
- **Representative item (`mr04-mix-01`):** "A school has more than 90 but fewer than 100 students... groups of 6, 5 left over... groups of 5, none left over" → 95
- **Easy boundary:** none authored yet — all three variants use a similarly-sized search range (~10-20 candidates); a genuinely easier variant would narrow the range further.
- **Hard boundary (`mr04-mix-03`):** a wider range (145-160) with less obviously "round" group sizes (6 and 8).
- **Mixed-transfer justification:** Primary competency MR-04 (the learner must correctly interpret and set up two separate conditions from continuous prose — a genuine multi-step interpretation demand). Supporting competency MR-05 (once set up, resolving the two conditions requires real number-property/divisibility reasoning, not just arithmetic). The two demands are both load-bearing: a learner who can do one but not the other cannot complete the item. This is the directive's own bar ("the secondary skill must be educationally meaningful," not incidental arithmetic).
- **Far-transfer example:** none in this family (it is MIXED_TRANSFER, not FAR_TRANSFER — kept distinct).
- **Misconception:** finding a number that satisfies only one condition and stopping, rather than checking both together.
- **Answer logic:** deterministic and uniqueness-verified — `mr04MixedDivisibility()` exhaustively checks every integer in the stated range and asserts exactly one candidate exists before authoring the item; a parameter set that produced zero or multiple candidates would have thrown and blocked the migration from being written.
- **Evidence semantics note (directive Part 9):** if a learner answers this item incorrectly, Angel does not yet attribute that failure to MR-04 or MR-05 specifically — no differential-attribution logic was built this increment (see report, "Remaining infrastructure gaps"). The item records a single outcome against its Question Type (QT-MR-13, primary competency MR-04) exactly as every other item does; MR-05 is recorded as a supporting competency in metadata only, not as a second, independent evidence write. This avoids the false-diagnostic-precision failure mode the directive warned against, at the honest cost of not yet isolating which component actually failed.
