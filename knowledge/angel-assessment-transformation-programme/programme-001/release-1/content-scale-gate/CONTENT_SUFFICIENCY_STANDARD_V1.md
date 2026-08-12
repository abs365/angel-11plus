# Content Sufficiency Standard V1

**Prepared:** 2026-08-12, Angel 11+ Completion Programme, Continuation Directive 002.
**Extends, does not replace:** `RELEASE_1_ASSESSMENT_ELIGIBILITY_MODEL.md` (item-level eligibility) and `competitive-excellence-benchmark/REPEATED_FRESH_MOCK_READINESS_MODEL_V1.md` (the ~150-250 Independently Validated item directional floor for mock readiness specifically). This document addresses **practice depth**, a distinct question from mock readiness: "can a motivated child practise for weeks without meaningfully repeating himself," not "is the pool big enough for a fresh full mock."

## 1. What sufficiency is not

Not: "N rows exist in `ali_question_bank`." A raw row count says nothing about whether a child will notice repetition, because it conflates three different things that must be counted separately (§3, Effective Practice Capacity).

## 2. What sufficiency actually requires, per competency

Drawing directly from a real sample of the current MR-01 content (the best-populated competency, 18 items): the existing items already show genuine **operation-type variation** — addition with carrying, subtraction with borrowing, division, decimal multiplication, fraction of a quantity, fraction addition to a mixed number, powers, square roots — not merely the same expression with different numbers. This is a real, positive finding, not assumed.

What is *not* yet evidenced for any competency in the current bank:

- **Representation diversity** — every sampled item is a bare numeric/symbolic expression; none use a table, diagram, or embedded-in-context format (contrast with the Specification's QT-MR-09 Data Reading archetype, which is entirely representation-driven and currently has exactly 1 item).
- **Reasoning-mode diversity** — every sampled item is direct computation. None are reverse/inverse (find the missing operand), none require justification/explanation, none are "always/sometimes/never true" judgement items (a pattern the CSSE evidence base explicitly documents as present in the primary papers, per the Founder's own evidence note).
- **Deliberate misconception-derived distractors** — none of the current items are multiple-choice, so there is no distractor design to evaluate at all; `addresses_misconception` is populated on 0 of 46 live rows.
- **Documented transfer relationships** — `transfer_links` is populated on 0 of 46 live rows, despite the Mathematics Reference Vertical's own lesson pages (Lesson 1, Lesson 2) implementing real fresh-transfer items in application code. The transfer relationship exists in the learning-sequence code, not yet in the content-bank schema — a genuine, disclosed gap.

## 3. Effective Practice Capacity — methodology

Distinguish five layers, per the directive's own A-E breakdown:

| Layer | Definition | Current evidence |
|---|---|---|
| A. Authored validated items | Real rows in `ali_question_bank`, hand-written, hand-checked | **46** (§ Content Inventory) |
| B. Validated archetype/family count | Distinct task-structure patterns actually observed in the bank (not the Specification's aspirational 27 Question Types — how many are *realised*, with more than one instantiation, so a family genuinely exists) | Only **QT-MR-01** (15 items) and **QT-MR-04** (6 items) currently have enough instances to call a "family" in any meaningful sense; every other populated Question Type has 1-5 items, too few to establish a repeatable pattern distinguishable from "this is just the one item we have" |
| C. Validated controlled variants | Items generated from a validated template with parameter constraints and a deterministic answer check | **0.** No template/generation system exists yet — every one of the 46 rows was individually hand-authored. This is the layer the wider Completion Programme's Content Factory (Phase D) would build. |
| D. Theoretical parameter combinations | The permutation space if every numeric parameter in every existing item were freely varied | **Not computed, and deliberately not reported as a capacity number** — per the directive's explicit instruction not to invent false scale. A theoretical count here would be meaningless without controlled variation (layer C) actually constraining it to valid, non-trivial, non-repetitive instances. |
| E. Educationally distinct practice capacity | The number of practice attempts a child could complete before a reasonably attentive learner would notice they were seeing "the same question again," accounting for structural similarity, not just unique database IDs | **Cannot yet be honestly estimated.** With only hand-authored, ungenerated content, E ≈ A minus near-duplicates. A rough, disclosed estimate: of the 46 items, the 15 QT-MR-01 and 6 QT-MR-04 items are each individually distinct in operation/structure (per the sample check in §2), so a capable, motivated child working exclusively in Mathematics could plausibly exhaust genuinely-fresh content in **a single sustained session or two**, not weeks. This is the honest current answer to the Founder's stated concern, not a comfortable one. |

## 4. Sufficiency levels

| Level | Definition | Current status by competency |
|---|---|---|
| **INSUFFICIENT** | Fewer than ~5 items, or fewer than 2 distinct reasoning modes | MR-02, MR-03, MR-05, RC-01, RC-03, and all zero-content competencies (RC-04, AR-01, MR-06, WC-02) |
| **MINIMUM PRACTICE SUPPLY** | Enough items (≥10-15) that a single practice session doesn't repeat, but a sustained multi-week learner would exhaust it quickly; single reasoning mode | MR-01, RC-02 |
| **SUSTAINED PRACTICE READY** | Multiple archetype families per competency, controlled variation (layer C) actually implemented, misconception-aware distractors where the format supports them, near- and far-transfer items distinguishable | **No competency currently meets this bar.** |
| **MOCK SUPPORT READY** | Sustained Practice Ready, plus Independently Validated status (per the Eligibility Model) and pool-level Question-Type balance | **No competency currently meets this bar.** |

These thresholds are **provisional planning thresholds**, not empirically derived — Angel does not yet hold real learner exposure/repetition-tolerance data, exactly as the directive anticipates in §8. They should be revisited once real usage data exists (e.g. via `usage_count`/`avg_success_rate`, both present in the schema but at 0/null for every current row, since none of these items have been served through a system that increments them yet outside the Mathematics Reference Vertical's own lessons).

## 5. What this means for the Founder's stated concern

The Founder's concern — a child should not exhaust a competency's genuine content in a handful of sessions — is **currently a real, live risk, honestly**, for every competency except possibly MR-01 and MR-04, and even those two are closer to MINIMUM PRACTICE SUPPLY than SUSTAINED PRACTICE READY. This is not a reason to mass-generate immediately (the Content Scale Gate, next document, sets the preconditions first); it is the evidence that justifies why the Gate matters and where the first controlled increment should aim.
