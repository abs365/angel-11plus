# Admissions Intelligence Specification

**Work Package:** ANGEL-CSSE-001 — Deliverable 7
**Status:** Documentation only. **This is the highest-risk deliverable in this work package.** Two of its four requested capabilities (School comparison, Target score guidance as commonly understood) cannot be built responsibly today — not because the specification is hard to write, but because the real data they require does not exist anywhere in this codebase, and fabricating it would put false information directly in front of parents making real decisions about a child's education. This document says so plainly rather than producing a plausible-looking spec that quietly assumes data nobody has.

---

## 1. Why this deliverable is different from the other seven

Every other document in this work package specifies a capability that is either already built, or buildable from data Angel already has (its own real learner activity) or evidence it already legitimately holds (Assessment Brain V1's 17 real exam-paper assets). **Admissions Intelligence is different: three of its four requested capabilities require real-world facts about specific schools — facts that exist only outside this codebase, are not currently held by this project in any form, and were not gathered as part of this research pass.** Specifying a data model for them is safe and useful (Section 4). Presenting invented numbers as if they were real school data would not be documentation — it would be misinformation a parent could act on.

## 2. What real, sourced evidence currently exists — one fact, precisely stated

`docs/intelligence/ASSESSMENT_BRAIN_V1.md` Observation 1 (HIGH confidence, sourced to Asset CSSE-001, the CSSE Information Guide): candidates are raw-scored, age-standardised, and weighted 50/50 into a combined score, and **"no offer [is made] below 303."**

This is real, and it is the only quantitative admissions threshold anywhere in this codebase's evidence base. It is also narrower than it may first appear, and this document states its limits precisely rather than extrapolating past them:

- **303 is a Consortium-wide floor, not a per-school figure.** CSSE is a shared exam sat for entry to multiple named grammar schools administered by one consortium (`CSSE_EXAMINATION_BLUEPRINT.md` §3: "bespoke — written and set by the Consortium itself"). Assessment Brain V1's Observation 1 does not state, and this research did not find, whether individual schools within the consortium apply any further school-specific bar above 303 (e.g. via catchment area or sibling priority interacting with score) — a real, common pattern at other grammar-school consortia, but not confirmed here for CSSE specifically.
- **The full scale is not documented in this codebase.** Assessment Brain V1 states the floor (303) but not the maximum possible standardised combined score, so "how close to the ceiling is 303" cannot currently be calculated or shown as a percentage — doing so would require inventing a scale maximum that isn't evidenced anywhere in the 17 Knowledge Assets. Flagged as an open gap, not filled here.
- **This is a historical fact about a past cutoff, not a prediction.** Stating "the historical minimum combined score has been 303" is safe under Learning Engine V1 §9's no-forecasting boundary — it asserts nothing about any individual child's future outcome. This distinction (real historical fact vs. predictive claim) is the load-bearing design principle for everything else in this document.

## 3. The four requested capabilities, assessed individually

| Requested capability | Status | Why |
|---|---|---|
| **Historical thresholds** | **Partially available** — the single Consortium-wide 303 floor above. Per-school, per-year threshold history does not exist in this codebase. | Real fact, narrowly scoped; not fabricated further. |
| **Preparation readiness** | **Already exists**, under Learning Engine V1's own governance, not this document's. | This is exactly what Learning Engine V1 §6 (Readiness Model) and `PARENT_INTELLIGENCE_SPECIFICATION.md` already define and specify — a qualitative, per-Assessment-Component evidence distribution, explicitly never a percentage or pass/fail claim. This document does not re-specify it; see Section 5 for how it may be safely placed alongside the 303 fact. |
| **School comparison** | **Cannot be built today.** | Requires real, individual data about specific named schools (catchment rules, sibling/priority policies, any school-specific score bar above the Consortium floor, historical intake numbers) — none of which exists in this codebase or was gathered in this research pass. `lib/pathways.ts` (the real, live data model) only distinguishes exam *boards* (GL/CEM/CSSE/ISEB), not individual schools — confirmed directly in `ANGEL_V1_PRODUCT_EXPERIENCE_IMPLEMENTATION_AUDIT.md` Section F, item 2, which this document corroborates rather than repeats. |
| **Target score guidance** | **Cannot be built responsibly today**, beyond restating the one real 303 fact. | "Target score guidance" implies a recommendation — "aim for X" — which requires either (a) real per-school data this project doesn't have, or (b) a predictive claim about how current practice evidence translates to exam score, which Learning Engine V1 §9 explicitly forbids and which no validated model in this codebase supports. Building this now would mean presenting a guess as guidance. |

## 4. Data model for the two capabilities that cannot be built today — specified, not populated

Specifying the shape this data would need to take is safe and useful, and does not require having the data yet. Proposed entities (cross-referenced in full in `ENTERPRISE_DATA_MODEL.md`, Deliverable 8):

- **`school`** — a real, named institution, distinct from `pathway` (exam board/format) in the existing schema. Fields: name, consortium/board affiliation, catchment description, published admissions policy URL, last-verified date. **Every field would need a real, cited source before being shown to a parent** — this document proposes the schema, not placeholder content for it.
- **`school_admission_threshold`** — one row per school per intake year, if and when real, sourced data is acquired: minimum score, score scale/maximum, source citation, confidence rating (reusing Assessment Brain V1's own HIGH/MEDIUM/LOW/INSUFFICIENT EVIDENCE scale, so an unverified figure is never presented with the same confidence as a verified one).

**This document explicitly recommends these tables be built empty, or not built at all, until a real data-sourcing decision is made** — see Section 6.

## 5. What can be shown safely today, without new data or a boundary reversal

One safe, real, non-predictive combination is available now, and is the concrete recommendation of this document:

> *"The historical minimum combined score for a CSSE offer has been 303 (source: CSSE Information Guide). Your child's current Readiness distribution across English Comprehension, Continuous Writing, and Mathematics is [Learning Engine V1 §6's existing qualitative banding]."*

This states two real, separately-sourced facts side by side — one historical/administrative, one evidence-based/pedagogical — and asserts no relationship between them. **It must not be presented as "you need to reach 303" or "you are on track for 303,"** either of which would silently convert two independent facts into an implied prediction Learning Engine V1 §9 forbids and this evidence base cannot support. Any future implementation of this pairing must preserve that separation explicitly in its wording, not just its data model.

## 6. Recommended next steps, not performed here

1. **Founder decision on real data acquisition** for per-school thresholds and comparison data — likely requiring either direct outreach to individual schools/the CSSE Consortium, or a licensed third-party admissions-data source. This is a business/research decision outside a documentation work package's scope.
2. **Founder decision on whether "Target score guidance" as a predictive feature is ever wanted**, given it would require formally reversing Learning Engine V1 §9's no-forecasting boundary — the same class of decision already flagged in `LEARNING_INTELLIGENCE_FRAMEWORK.md` (Confidence) and `RECOMMENDATION_ENGINE_SPECIFICATION.md` (Expected improvement). All three should be decided together, since they share the same underlying boundary.
3. **Until either decision is made, this document recommends Section 5's safe pairing as the full extent of "Admissions Intelligence" Angel 11+ should present** — real facts, clearly separated, no inference drawn for the parent.
