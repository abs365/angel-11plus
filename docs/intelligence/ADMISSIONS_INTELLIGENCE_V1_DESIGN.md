# Admissions Intelligence — Sprint 5 Design Package (Draft)

**Work Package:** Sprint 5, Angel 11+ Version 1
**Status:** DRAFT — Design Phase. Not frozen. Awaiting Founder review and approval. **No code has been written against this document.**
**Authority this document builds on, unmodified:** `ASSESSMENT_BRAIN_V1.md` (frozen), `LEARNING_ENGINE_V1.md` (frozen), `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` (frozen). Every claim below is cited to one of these three or to real, already-shipped code from Sprints 1–4. Nothing here invents a new educational conclusion.

---

## 1. Vision and Objectives

**Vision:** Give a CSSE parent a calm, evidence-based picture of how their child's *real, recorded evidence* relates to CSSE's *actual, published admissions process* — never a prediction of the outcome, always traceable to something the child has actually done.

**Objectives:**
- Present the Educational Intelligence Engine's existing Readiness and Evidence Coverage output in an admissions-specific frame, without computing anything new.
- Surface the one real, sourced admissions fact this platform holds — CSSE's Consortium-wide 303 combined-score floor (`ASSESSMENT_BRAIN_V1.md` Observation 1, HIGH confidence) — honestly, beside the evidence picture, never blended into it (`EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §10, verbatim rule).
- Give Mock Exams the same evidence-first treatment: a mock is not a separate "readiness score," it's another source of real evidence already feeding the same Engine (Sprint 2 already wired Mock Exam into `processEvidenceForCompetency`) — this design surfaces that fact, it doesn't build a new pipeline.
- Establish the architecture so a *future* pathway (GL/CEM/ISEB/Independent) can plug into the identical mechanism the day it has its own real Assessment-Brain-equivalent — without building anything pathway-specific into the engine itself.
- Competitive position: be the one platform in this category that is *provably* not overclaiming — the explicit "here's what we don't tell you, and why" framing is itself the differentiator.

## 2. Parent Questions This Feature Will Answer

Answered, honestly, from real evidence:
- "How does my child's recorded evidence compare to what CSSE actually assesses?" (coverage across the real 13 competencies / 27 Question Types)
- "What does today's mock result mean, in the context of CSSE's own published threshold?" (303 fact shown beside, not blended)
- "Is there anything CSSE tests that we haven't evidenced at all yet?" (Assessment Coverage, already real)
- "What would strengthen our case fastest?" (existing Recommendation Engine / Revision Planner, unchanged, reused)

**Explicitly NOT answered, by design, and stated as such to the parent:**
- "Will my child get in?" / "What are our chances?" — forbidden, `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §13: no prediction of outcome.
- "How does my child compare to other applicants?" — forbidden, §13: no percentile or peer comparison.
- "Which specific school should we choose?" — forbidden, §10: School Comparison "not buildable without real data acquisition," a separate Founder/business decision, not made here.

## 3. Educational Evidence Already Available (Assessment Brain V1 / Learning Engine V1)

All real, all already computed by shipped code — nothing below is proposed, it exists today:

| Evidence | Source | Real today? |
|---|---|---|
| Per-competency Evidence Signal/Tier (13 competencies) | `lib/learningEngine/rollup.ts`, `diagnostics.ts` | Yes |
| Per-component Readiness band (Well/Partially/Not Yet Evidenced, 4 components) | `computeComponentReadiness()`, `ReadinessSummary` | Yes |
| Assessment Coverage (Question Types with content vs. attempted) | `EvidenceProfile`, `hasAnyContent` | Yes |
| Durable Mastery (survived a genuine review gap) | `ali_durable_mastery`, Sprint 1/2 | Yes |
| Ranked, explainable recommendations | `getRecommendations()`, `generateExplanation()` | Yes |
| Mock Exam raw score (overall + per-section) | `app/learning-intelligence/mock-exam/page.tsx` | Yes, single-sitting only (no history yet in this system — see §4) |
| The one real, sourced admissions fact: CSSE combined-score floor = 303 | `ASSESSMENT_BRAIN_V1.md` Observation 1, HIGH confidence, Asset CSSE-001 | Yes, as static cited prose — not yet surfaced in product |

## 4. Additional Evidence Required

Three genuine gaps, none requiring new educational calculation:

1. **Mock history, in the CSSE system.** Confirmed during Sprint 4 (WP4B): the CSSE Mock Exam page shows only the just-completed sitting; a persisted list of past attempts exists only in the legacy, pathway-agnostic `getMockResults()`/`MockHistorySection` (already shared across both Parent Dashboard branches). **No new table needed** — reuse this exact existing mechanism (§9, §10) rather than building CSSE-specific mock persistence.
2. **Score-scale non-comparability, disclosed not solved.** Angel's own mock score (correct/total, Angel's content) is not the same scale as CSSE's real, age-standardised combined score that the 303 floor applies to. This is not a data gap Angel can close — it requires CSSE's actual standardisation formula, which this platform does not hold and has no plan to acquire. **The design's job is to disclose this plainly**, not imply equivalence.
3. **Pathway extension, out of scope for this design.** GL/CEM/ISEB/Independent have no Assessment-Brain-equivalent — only a weaker, non-reconciled, practitioner-convention taxonomy (`EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §4). Building Admissions Intelligence for them requires each pathway getting its own real, exam-paper-sourced competency model first — a content-acquisition decision, not something this design proposes to do now.

## 5. Admissions Readiness Model (Observable Evidence Only)

**Not a new score.** A composition of three already-real signals, shown together, never combined into one number:

1. **Component Readiness** — the existing 4-band `ReadinessSummary` output, unchanged.
2. **Assessment Coverage** — the existing `EvidenceProfile` coverage counts (how much of the 27 real Question Types has any recorded evidence), unchanged.
3. **Durable Mastery count** — how many competencies have survived a genuine Maintenance Review, unchanged.

**Plus, in its own clearly separate panel, never arithmetically combined with the above:** CSSE's real 303 combined-score floor, cited to `ASSESSMENT_BRAIN_V1.md` Observation 1, framed as historical fact about the exam, not a claim about this child.

**What this explicitly is not, stated on the page itself:** not a single readiness percentage; not a probability of offer; not a peer comparison. This restates `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §13 in parent-facing language, not merely in this design doc.

## 6. Mock Examination Readiness Model

- Every mock's answers already flow through the same real evidence pipeline as practice (Sprint 2) — the design's job is to say so, explicitly, on the results screen ("this updated your child's Readiness and Recommendations above") — not to build a second pipeline.
- Add one "Historical Context" panel to the Mock Exam results screen: the mock's own real score, next to CSSE's published 303 floor, with an explicit one-line disclaimer that the two are not the same scale and this is not a prediction.
- Mock History (trend across attempts) reuses `MockHistorySection`/`getMockResults()` unchanged (§4, §9) — surfaced from the Admissions Readiness view, not duplicated.

## 7. School Pathway Architecture — CSSE First, Extensible

Reuses the existing 7-pathway model (`lib/pathways.ts`) and the existing eligibility-gating pattern (`getEligibleSubjectKeys()`, `assertSubjectAuthorisedForPathway()`, `lib/ali/pathwayEligibility.ts`) verbatim — both already real, already correct, not touched by this design.

**The governing rule, already frozen (`EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §4), restated as this feature's architecture:** a pathway gets Admissions Intelligence the moment, and only the moment, it has its own real Assessment-Brain-equivalent. **No pathway's coverage may be inferred from another's.**

- **CSSE**: real Assessment Brain V1 exists → full Admissions Readiness model (§5, §6) is buildable.
- **GL / CEM / ISEB / Independent / core-foundation / not-sure**: no real Assessment-Brain-equivalent exists today → Admissions Intelligence honestly shows "Not yet evidenced for this pathway," using the *exact* honest-gating InfoCard pattern already shipped site-wide ("Available for the CSSE pathway only"), never a placeholder or an inferred approximation.

**Concrete extensibility mechanism:** reuse the pathway-branching pattern Sprint 4 (WP4B) already established for the Parent Dashboard (`CssePathwayParentContent` / `LegacyPathwayParentContent`, selected by `getSelectedPathwayId()`). Admissions Intelligence becomes a third such branch. The day a future work package produces a real "GL Assessment Brain V1" (built the same rigorous way, from real exam papers, evidence-rated, frozen), that pathway's Admissions Readiness becomes buildable using this *same, unmodified* architecture — zero new engine code, only new evidence content.

## 8. User Journey and Screen Flow

- New page: `/learning-intelligence/parent/admissions-readiness`, reusing the exact page-shell/breadcrumb/empty-state conventions already established for Weekly Report and Revision Planner.
- Linked from the Parent Dashboard's nav row as a **secondary** link, alongside Weekly Report — per WP4D's "one obvious primary action" principle (already Revision Planner), this must not compete with it.
- Mock Exam results screen gains the Historical Context panel (§6) plus a secondary link to this page — the existing primary CTA there ("See Parent Dashboard →", WP4D) is unchanged.
- Extends, rather than re-routes, the established sequence: **Practice/Mock → Results → Parent Insight → *(optional: Admissions Readiness)* → Revision → Practice.**
- Non-CSSE pathways see the same honest gating message used everywhere else in the app today.

## 9. Data Model Impact

**Zero new tables required.** `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §11 already lists `school`, `school_admission_threshold`, `consortium_threshold_fact` as **PROPOSED, empty schema only — do not populate without real data acquisition.** This design does not populate them: the single 303 figure is a static, cited constant in code (the same pattern already used for `WRITING_CORRECTNESS_THRESHOLD`, `COMPONENT_REVISION_MINUTES` — a disclosed, sourced first-pass value, not a database row), because it is one fact, not per-school variable data.

Everything else this design reads is an existing read path: `fetchLearnerIntelligenceProfile()`, `getRecommendations()`, `getMockResults()`. No migration, no new persistence.

**If** the Founder later wants real per-school data or a genuinely comparable mock-to-CSSE score scale, that is the trigger to populate the already-proposed `school`/`school_admission_threshold` schema — a separate, future, explicitly-authorised data-acquisition decision, not something this design does or assumes.

## 10. Reuse of Existing Services and Components

| Need | Reused, unchanged |
|---|---|
| Readiness | `computeComponentReadiness()`, `ReadinessSummary` |
| Coverage | `EvidenceProfile` |
| Recommendations + explanations | `getRecommendations()`, `generateExplanation()` |
| Profile fetch | `fetchLearnerIntelligenceProfile()` |
| Mock history | `MockHistorySection`, `getMockResults()` |
| Pathway gating | `getEligibleSubjectKeys()`, the CSSE/legacy branch pattern (WP4B) |
| Honest empty/gated states | The site-wide "Available for the CSSE pathway only" `InfoCard` pattern |
| Navigation discipline | WP4D's one-primary-action rule |
| Explanatory tone/panel structure | WP4C's `AtAGlancePanel` pattern (reusable template if an "Admissions at a Glance" panel is wanted) |

No new engine, no new scoring logic, no new confidence model. This is a composition and presentation layer only.

## 11. Risks, Assumptions, Non-Goals

**Risks:**
- Overclaiming: any copy that lets the 303 fact read as a prediction violates §10/§13 — mitigated by mandatory "beside, never blended" placement and explicit disclaimers, checked under §12's "trust" dimension before ship.
- Score-scale confusion: Angel's mock % and CSSE's real standardised score are different scales — must be disclosed on-screen, not merely in this document.
- Pathway scope-creep: temptation to approximate GL/CEM/ISEB coverage from the weaker archived taxonomy — explicitly forbidden by §4 and must be resisted even under commercial pressure to "cover all pathways."

**Assumptions:**
- The Founder wants CSSE delivered for real now; other pathways get a *proven-extensible architecture*, not built content, matching the mission's "CSSE first."
- No new content-acquisition budget is being requested by this design.

**Non-goals (restating `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §13 as this feature's explicit boundary):**
- No prediction of outcome or offer likelihood.
- No percentile or peer comparison.
- No School Comparison or Target Score guidance.
- No "Expected Improvement" forecasting.
- No new educational calculation engine of any kind.

## 12. Acceptance Criteria

Reuses `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §12's six verification dimensions, made concrete for this feature:

1. **Technical correctness** — every figure on the page traces to an existing, unmodified real value or the one cited 303 fact. Zero new calculation anywhere.
2. **Educational correctness** — matches §5–§8 of the frozen Engine doc exactly; no new Evidence Tier, State, or Decision Boundary logic introduced.
3. **Explainability** — every conclusion shown can answer "what evidence supports this," reusing `generateExplanation()` unmodified.
4. **Trust** — direct copy review confirms the 303 fact is never blended into Readiness and never phrased as a prediction, before this ships.
5. **Wellbeing protection** — reviewed against Principle 8 (Educational Safety) with extra scrutiny, since admissions framing is closer to exam-outcome anxiety territory than any prior feature; no countdown-style urgency, no anxiety-inducing language.
6. **Regression** — no existing Readiness/Recommendation/Mock Exam calculation changes.

**Founder acceptance test:** a parent reading this page can correctly state, in their own words, that Angel has **not** told them whether their child will get in — only what real evidence exists so far, and what CSSE's own published threshold is, shown separately.

---

**This document is a design proposal only. No implementation should begin until the Founder approves it, potentially with amendments, as a new numbered Founder Decision.**
