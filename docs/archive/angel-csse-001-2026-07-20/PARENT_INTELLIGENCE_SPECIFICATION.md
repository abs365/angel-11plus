# Parent Intelligence Specification

**Work Package:** ANGEL-CSSE-001 — Deliverable 6
**Status:** Documentation only. Learning Engine V1 §8 already specifies exactly what is and is not suitable for parent-facing reporting. This document applies that existing specification to what is actually built today, and does not re-specify it from scratch.

---

## 1. The governing rule already exists

`docs/intelligence/LEARNING_ENGINE_V1.md` §8 ("Parent Intelligence Inputs") is short, explicit, and already answers most of what this deliverable asks for. Reproduced in full, since it is the actual governing content, not summarised:

**Suitable for parent-facing use:**
- Competency Status and Evidence Confidence, "described per Assessment Component, in plain-language terms rather than raw Signal/Tier codes."
- Assessment Coverage — "an honest statement of which competencies there is not yet enough evidence to say anything about."
- Diagnostic Intelligence findings — Strengths, Development Areas, Emerging Skills, Mastered Skills, Low Confidence Areas.
- Historical Progress — "change in evidence over time, where it exists."
- Readiness distribution, "in the same qualitative-banding terms" used internally (never a single number).

**Explicitly not suitable, under any future report design:**
- Any predicted exam score, mark, or pass/fail likelihood.
- Any percentile, ranking, or comparison against other learners.
- Any behavioural, motivational, or psychological characterisation.
- Any claim about a competency at ET-0 beyond "not yet evidenced."

This list is directly load-bearing for Deliverable 7 (`ADMISSIONS_INTELLIGENCE_SPECIFICATION.md`): two of its four requested capabilities — historical thresholds and target score guidance — fall squarely inside the "explicitly not suitable" list above. That conflict is addressed fully in Deliverable 7, not smoothed over here.

## 2. What's actually built today, checked against the rule

Two real, separate parent-facing dashboards exist. This document audits both against §8's rule rather than assuming compliance.

**`/learning-intelligence/parent`** (`app/learning-intelligence/parent/page.tsx`, `components/learningEngine/parent/CompetencySummary.tsx`) — **compliant with §8 by original design.** Its own code comment states the discipline directly: *"component-level grouping, competency names only, no raw Competency/Question-Type/Tier codes"* — this is §8's "plain-language terms rather than raw Signal/Tier codes" rule, implemented correctly and independently confirmed in this session's own product audit (`ANGEL_V1_PRODUCT_EXPERIENCE_IMPLEMENTATION_AUDIT.md`). Shows Skills Summary (Strengths/Improving/Focus Next/Recently Mastered — §8's Diagnostic Intelligence categories), Readiness Summary (§8's Readiness distribution), and Recent Activity — a direct, faithful implementation of §8's "suitable" list, and nothing from the "not suitable" list appears anywhere on it. **Gap:** CSSE-only, per Learning Engine V1's own scope; a GL/CEM/ISEB parent gets nothing from this page.

**`/parent`** (legacy, `app/parent/page.tsx`) — **partially compliant, and pre-dates Learning Engine V1.** Its Readiness band, Subject Breakdown, and Weekly Guidance sections are consistent with §8's spirit (plain-language, banded, not raw scores). But it was built against the older, flat `computeParentReport()`/`getExamReadiness()` model (see `ANGEL_V1_PRODUCT_EXPERIENCE_IMPLEMENTATION_AUDIT.md` Section D, item 21 for the full duplication finding, and Section F, item 1 for the readiness-calibration finding — both already documented and not repeated in full here), not the competency-evidence model §8 was written to describe. It does not violate the "not suitable" list, but it also cannot deliver §8's competency-level Diagnostic Intelligence, because the model it's built on doesn't have that granularity.

## 3. Human-readable reporting — already-established plain-language conventions, applied

Two real, already-enforced conventions govern how evidence becomes parent-readable text in this product, both confirmed in this session's own audit work:

1. **No internal terminology.** `PRODUCT_EXPERIENCE_STANDARD_V1.md` §7 (calm-tone rule) forbids showing "Adaptive/Learning Unit/Competency/Intelligence/Recommendation Engine/Beta" to any user, parent included — enforced product-wide as of `ANGEL_V1_PRODUCT_EXPERIENCE_COMPLETION_REPORT.md`. A parent report built from this specification must name competencies by their plain-language label (e.g. "Inference and Justified Interpretation"), never by ID (`RC-02`) or raw code.
2. **No raw Signal/Tier codes**, per §8 above and `LEARNING_ENGINE_V1.md`'s own parent-facing-language rule — a parent sees "Strengths" and "Focus Next," never "ET-3" or "Not Yet Demonstrated."

## 4. What this specification recommends, not performs

1. **Consolidate the two parent dashboards into one**, per the audit's existing Redesign recommendation (`ANGEL_V1_PRODUCT_EXPERIENCE_IMPLEMENTATION_AUDIT.md` Section D, item 21) — this document does not repeat that design work, only confirms §8 supports a single, unified report once System A (Learning Engine V1) covers every pathway, not just CSSE.
2. **Extend Learning Engine V1's competency model to GL/CEM/ISEB**, so every parent, not only CSSE parents, can receive a §8-compliant report — currently a structural gap, not a reporting-design gap.
3. **Do not build any "not suitable" field** (predicted score, percentile, target-school threshold) into any parent report without the explicit, formal reversal process described in Deliverable 7.
