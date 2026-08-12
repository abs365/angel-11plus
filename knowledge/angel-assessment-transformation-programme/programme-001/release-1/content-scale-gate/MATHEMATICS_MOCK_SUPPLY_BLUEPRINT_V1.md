# Mathematics Mock Supply Blueprint V1

**Prepared:** 2026-08-12, Educational Increment 004, Wave 1.
**Status:** design only. No Mock content authored or promoted under this blueprint in this increment.
**Builds on:** `CSSE_FULL_MOCK_STRUCTURE_DECISION_V1.md` (the real, evidence-counted target paper structure) and `RELEASE_1_ASSESSMENT_ELIGIBILITY_MODEL.md` (the Mock Eligible gate).

## 1. Why this exists now, without any Mock content

The directive explicitly separates "build the blueprint" from "author the sealed pool" — this increment does the former only. Wave 1's Practice items are all `practice_eligible`; none is promoted to `mock_eligible` here, and none should be, since Mock Eligible requires independent review plus a pool-balance check neither of which has happened.

## 2. Competency weighting

Per `CSSE_FULL_MOCK_STRUCTURE_DECISION_V1.md`'s counted target (20-21 Maths questions, 120 marks across the paper as a whole, Mathematics itself un-split by competency in the primary evidence). This blueprint adds the competency split, derived from Question Type frequency in the Multi-Year Pattern Analysis, not invented:

| Competency | Share of Mathematics questions | Rationale |
|---|---|---|
| MR-01 (Arithmetic) | ~30% | Opening-question convention, present every year, multiple QTs (01/02/03/09/12) |
| MR-04 (Multi-step word problems) | ~20% | QT-MR-04/10/13, all EMC-4, genuinely multi-step |
| MR-02 (Algebraic/Symbolic) | ~15% | QT-MR-05/06, EMC-4, structurally distinct from arithmetic |
| MR-03 (Geometric/Spatial) | ~15% | QT-MR-07/08, EMC-4 |
| MR-05 (Number Properties) | ~10% | QT-MR-11, mixed EMC-3, smaller but real share |
| MR-06 (Precision, cross-cutting) | applies across all of the above | Not a separate slice — every item in the pool should already satisfy exact-match precision, per its own evidenced nature |
| Unallocated/reserve | ~10% | Buffer for compound questions spanning two QTs, matching the Multi-Year Pattern Analysis's finding that CSSE Mathematics questions are frequently compound rather than single-skill |

## 3. Archetype weighting

Within each competency, the pool should eventually cover every archetype the Specification/Framework documents for that competency's Question Types, not just the single archetype Wave 1 happened to build first (e.g. MR-02's pool should eventually include both `mr02-sequence-rule` and `mr02-substitution`, which it already does after this wave, but also whatever future MR-02 archetypes get added).

## 4. Difficulty distribution

Mirror the real, structural difficulty signal this programme already uses (reasoning steps, reverse reasoning, information density), not a flat curve. A defensible starting split, pending real usage data: 30% easy, 45% medium, 20% hard, 5% challenge — biased toward medium/hard relative to Practice, since a mock's purpose is closer to the genuine exam demand than a first-exposure practice set.

## 5. Sequencing

Per the Multi-Year Pattern Analysis's stable structural finding: Mathematics questions should progress from easier to harder across the paper, matching the real papers' own internal ordering convention (early direct-computation items, later compound/reverse-reasoning items).

## 6. Timing

Section-level only, per the evidence's own honest limitation (no per-question CSSE timing exists): Mathematics = 60 minutes total (evidenced), individual item `estimated_time_seconds` remains an Angel-authored estimate, never represented as CSSE-evidenced.

## 7. Marking structure

1 mark per item by default (matching the observed CSSE-007/012/017 "1 mark for each correct answer" convention underlying QT-MR-14 itself), with multi-part items (e.g. the substitution family's "find A and C") explicitly scoped as 1 mark for the full, correct pair, not partial credit per sub-value, consistent with the exact-match, no-partial-credit evidence.

## 8. Representation balance

At least one archetype per competency should use a non-bare-numeric representation (a table, a described diagram, a real-world context) once the pool is large enough — Wave 1's items are deliberately representation-light (bare arithmetic/algebra/geometry-by-description); this is recorded as a known future requirement, not retrofitted here.

## 9. Multi-step demand

At least the MR-04 and MR-02-substitution-style items should remain in the pool specifically because they are genuinely multi-step (2-3 reasoning steps), not reduced to one-step versions to make generation easier.

## 10. Exact-match requirements

Every Mock item, regardless of competency, is implicitly a QT-MR-14 item (the cross-cutting condition) — the pool-level check for Mock Eligible should verify no item's mark scheme implies partial credit, not just that MR-06-tagged items satisfy it.

## 11. Unseen-family requirement

A learner who has exhausted a Practice family should not see the identical family in a Mock as their "first real test" of it — the Mock pool should draw from families with, at minimum, a distinct id-space from the Practice-only families (already true here, since no Wave 1 id is shared with any Mock-designated content, because none exists yet).

## 12. Practice/Mock structural-similarity policy

A family may exist in both Practice and Mock pools in *concept* (e.g. an angle-sum archetype) but a specific *item* must never be shared between the two — enforced today at the item level (Mock only reads `eligibility_status = 'mock_eligible'`, Practice's pool and Mock's pool are already structurally disjoint by construction, verified in Educational Increment 003). This blueprint does not change that mechanism, only documents the policy it already implements.

## What this blueprint deliberately does not do

- Does not author a single Mock item.
- Does not promote any Wave 1 item to `mock_eligible`.
- Does not invent a numeric "balanced coverage" threshold beyond the percentages above, which are themselves disclosed as derived-not-measured, pending the Timing Strategy (Gate 5) and further Founder decision per the Eligibility Model's own stated limitation.
