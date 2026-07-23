# Educational Intelligence Experience Blueprint — Version 1.0

**Work Package:** Phase 4, Sprint 3 (2026-07-23). Governs the learner- and parent-facing *experience* built on top of the frozen Educational Intelligence Foundation — `ASSESSMENT_BRAIN_V1.md`, `LEARNING_ENGINE_V1.md`, `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` (all three cited throughout, none restated or reopened), plus `MOCK_INTELLIGENCE_BLUEPRINT_V1.md` and `ADAPTIVE_MOCK_INTELLIGENCE_SPECIFICATION_V1.md`.

**Status:** Blueprint only. No code. Every claim below is either a citation to a frozen document or a citation to real, already-shipped code — this document was written by reading that code, not by proposing new behaviour.

---

## 0. What this document found before writing a word of vision

The Foundation is not waiting for an experience layer to be built — it already has one, real and shipping, across roughly a dozen pages and eight components:

| Surface | Route | Reuses |
|---|---|---|
| Learner Dashboard | `/learning-intelligence` | `CompetencyProfile`, `EvidenceProfile`, `DiagnosticOverview`, `ReadinessSummary`, `RecommendationSummary`, `RecentActivity` |
| Recommendation Centre | `/learning-intelligence/recommendations` | `RecommendationSummary` — "pure display... zero new recommendation logic" (the page's own header) |
| Practice | `/learning-intelligence/practice`, `/practice/[area]` | `recordPresentation`/`recordOutcome`/`processEvidenceForCompetency` |
| Mock Exam (Standard + Adaptive) | `/learning-intelligence/mock-exam` | The full evidence pipeline, `recordReadinessSnapshot()` (Sprint 2) |
| Parent Dashboard | `/learning-intelligence/parent` | `CssePathwayParentContent`/`LegacyPathwayParentContent`, `MockHistorySection` |
| Mock Readiness | `/learning-intelligence/parent/mock-readiness` | `assessMockReadiness()`, `getRecommendations()` |
| Admissions Readiness | `/learning-intelligence/parent/admissions-readiness` | `ReadinessSummary`, `EvidenceProfile`, `RecommendationExplanation`, `HistoricalContextPanel` |
| Revision Planner | `/learning-intelligence/parent/revision-planner` | `generateRevisionPlan()`, `generateExplanation()` |
| Weekly Report | `/learning-intelligence/parent/weekly-report` | `fetchEducationalMilestones()`, `EducationalTimeline`, `RecommendationExplanation` |
| Readiness Timeline | `/learning-intelligence/parent/readiness-timeline` | `ReadinessEvidenceTimeline`, same milestone data, unfiltered |

And the three-audience Explainability model (`EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §9) is not aspirational — it is one real function, `generateExplanation()` (`lib/ali/explainability.ts`), already producing learner/parent/engineering-audit text for every recommendation, already rendered by `RecommendationExplanation.tsx` on three separate pages.

**This changes what this Blueprint's job is.** It is not a design-from-scratch exercise. It is: (1) name the principles that already, implicitly, govern this real body of work, so future increments can be checked against them explicitly instead of by tribal memory; (2) identify the genuine, disclosed gaps between what exists and what the Foundation's own frozen rules imply should exist; (3) sequence closing those gaps. Sections 1–10 do the first; Section 11 does the second and third.

## 1. Vision

Every real conclusion the Educational Intelligence Foundation computes should reach the right audience, in the right register, at the right moment in their journey, and point to exactly one clear next action — never more, never less, and never anything the evidence doesn't actually support.

The Foundation's own Principles (Evidence First, Confidence Is Never Binary, Traceability, Explainability, Absence of Evidence Is Not Evidence of Absence, No Invented Constructs, and the Educational Safety Principle — `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §3) are not abstractions to this Blueprint; they are the literal acceptance test for every screen. A screen that shows a number the engine didn't compute, or hides a caveat the engine attached, has failed regardless of how polished it looks.

## 2. Educational Experience Principles

Restated at the experience layer, each traceable to a frozen source — no new principle is invented here:

1. **Show real evidence, or honestly show its absence — never a placeholder.** Already the Learner Dashboard's own stated discipline: "no value on this page is hardcoded, randomised, or a placeholder... reads as 'no evidence yet' everywhere, honestly" (`app/learning-intelligence/page.tsx`'s own header). Extended, not introduced, by this Blueprint.
2. **Calm before alarming, always.** Educational Safety Principle 8 — no screen may increase anxiety for a score or coverage gain, and this binds *harder*, not softer, near an exam date.
3. **One primary action per screen.** Already shipped ("WP4D discipline") on the Mock Exam results screen, Admissions Readiness, and the Parent Dashboard — generalised here as a standing rule for every future screen, not three independent local decisions.
4. **Mechanism is never named to a learner or parent.** Educational State (`EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §7) is explicit that its eight states are "never surfaced... by name — an internal coordination label only." The same discipline extends to Evidence Tier codes, confidence-tier labels, and competency codes: `generateExplanation()`'s learner/parent branches already never emit them; the engineering-audit branch is the only one that does.
5. **Confidence-calibrated language, always.** A claim is only ever as strong as its evidence tier — `parentText()` (`lib/ali/explainability.ts`) already encodes this exactly: "hasn't tried X yet" / "just starting to explore" / "showing early strength" / "consistently answered... across several sessions" / "shown lasting understanding... even after a break," one phrase per tier, never inflated.
6. **Absence of evidence is disclosed as a coverage fact, never as a weakness.** Learning Engine V1 §4's own rule; `DiagnosticOverview.tsx` already keeps "Not Yet Evidenced" visually and structurally separate from "Development Areas" for exactly this reason.
7. **Transfer-based suggestions are named as connections, never certainties.** Already real: `parentText()`'s basis-aware framing ("we're suggesting this because it connects to their progress in X") only fires when `basis !== "direct-evidence"".
8. **Every historical/comparative fact stands beside the evidence picture, never blended into it.** The one rule `ADMISSIONS_INTELLIGENCE_V1_DESIGN.md` exists to enforce for the CSSE 303 combined-score fact — generalised here as the standing rule for any future comparative fact (a school threshold, a national benchmark) this platform ever holds.
9. **No prediction, no percentile, no peer comparison, ever.** `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §13, restated as a hard experience-layer boundary, not merely an engine one — a beautifully-designed screen that implies an outcome prediction is still a violation.

## 3. Learner Journey

The real, already-built sequence: **Learn/Practice hub → `/practice/[area]` (immediate per-question feedback) → Mock Exam (Standard or Adaptive, Sprint 2) → Results (skills profile, readiness, recommendations) → Recommendation Centre → back to Practice.**

Every touchpoint uses the **learner register** of Explainability (`generateExplanation(candidate, "learner")`): age-appropriate, encouraging, driven only by Educational State, never by a confidence tier or competency code — `learnerText()`'s switch statement is the complete, real inventory of every phrase a learner ever sees. Retrieval practice — answer, then find out — is the only activity shape used anywhere in this journey (Engine §3's standing constraint); no passive-review screen exists or should be added.

The journey is honest about content gaps at every step: Practice pages that hit untagged content show the same "not yet" state the Dashboard does, never a silently-empty screen.

## 4. Parent Journey

The real, already-built sequence, named explicitly for the first time by `ADMISSIONS_INTELLIGENCE_V1_DESIGN.md` §8 and adopted here as the canonical map: **Practice/Mock → Results → Parent Insight (Parent Dashboard) → *(optional)* Admissions Readiness → Revision Planner → Practice.** Weekly Report and Readiness Timeline sit alongside this loop as on-demand depth, reached from the Parent Dashboard's secondary nav, never competing with the one primary action on any given screen (WP4D).

Every touchpoint uses the **parent register**: plain-language, confidence-calibrated, evidence-cited — the same `generateExplanation(candidate, "parent")` output, never a second copy of it. `MockHistorySection` is genuinely shared, not duplicated, across both the CSSE and legacy Parent Dashboard branches, and is the single source Admissions Readiness's Mock History reference reuses too.

Non-CSSE pathways see the identical, honest "Available for the CSSE pathway only" gating pattern everywhere in this journey — never a degraded or approximated version of the CSSE experience.

## 5. Educational Explainability Standards

The standard is not proposed here; it is the real contract `generateExplanation()` already implements, restated so future work can be checked against it directly:

- **Three audiences, one function, one source of truth.** No page may write its own parent- or learner-facing recommendation copy; every such surface calls `generateExplanation()` (directly or via `RecommendationExplanation`) — verified today at three real call sites (`RevisionPlannerPage`, `WeeklyLearningReportPage`, `AdmissionsReadinessPage`), never three independent copies.
- **Every claim is traceable.** The engineering-audit branch's raw `{basis, tier, state, trigger}` output must remain reconstructable from any learner/parent sentence shown — this is what "Traceability" (Engine §3) means operationally.
- **A known, disclosed limitation stands, not silently patched:** `competencyLabel()` (`lib/ali/labels.ts`) has no entries yet for the archived AEP-002 NVR/Spatial/Mathematical Reasoning codes, so a raw code can currently leak through the safe fallback for those three domains — flagged in `explainability.ts`'s own header as a content-authoring gap, not an explainability-logic one. This Blueprint does not close it (Section 11 lists it as a real, scoped future item); it stands here as a documented exception to Principle 4 above, not evidence the principle is unenforced elsewhere.

## 6. Recommendation Principles

Unchanged from `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §8/§8.3, restated as the experience contract:

- Five categories only — Practice, Consolidation, Revision, Extension, Review — no sixth invented at the presentation layer.
- **Automatic** decisions (the five categories themselves) require only Low (ET-1) evidence; any **Higher Evidence Required** claim (mastery, durable mastery, any readiness claim, any definite-language parent statement) requires High (ET-4) evidence, full stop, regardless of how confident the copy *reads*.
- The **Wellbeing veto** runs before every other rule, silently — a vetoed competency simply does not appear (`RecommendationExplanation.tsx` already filters `vetoedCompetencyCodes` before rendering, not after).
- **"Expected improvement" stays out of scope.** No screen may show a forecasted score or a "you'll likely improve by X" claim — `RECOMMENDATION_ENGINE_SPECIFICATION.md` §3's boundary, unreversed.
- One primary recommendation-driven action per screen (Section 2, Principle 3) — Revision Planner is the standing example, not one of several competing CTAs.

## 7. Admissions Guidance Principles

Cited in full from `ADMISSIONS_INTELLIGENCE_V1_DESIGN.md`, not restated as new: the single real, sourced fact (CSSE's Consortium-wide 303 combined-score floor, `ASSESSMENT_BRAIN_V1.md` Observation 1) may be shown beside the evidence picture, never blended into it; no prediction of offer outcome; no peer comparison; no per-school comparison without a separate, explicit Founder data-acquisition decision (School Comparison and Target Score Guidance remain **not buildable** today, per that document's own §4/§11 conclusion, unchanged). A future pathway earns Admissions Guidance the day it has its own real Assessment-Brain-equivalent — never before, never by inference from CSSE's.

## 8. Plain-English Communication Standards

The register table (`EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §9) is the standard, not a target to aspire to:

| Audience | Register | Real example (`lib/ali/explainability.ts`) |
|---|---|---|
| Learner | Age-appropriate, encouraging, zero mechanism | *"You've got this one down — nice work!"* |
| Parent | Plain-language, confidence-calibrated, evidence-cited | *"Your child has consistently answered Percentages questions correctly across several sessions."* |
| Engineering/Audit | Full raw evidence | `basis=direct-evidence tier=high state=mastered trigger=...` |

Additional standing rules, already established elsewhere this session and adopted here as permanent communication standards rather than one-off fixes: no growth-mindset messaging, streak-shaming, or loss-aversion mechanic, ever (Engine §3's pedagogical finding — independently corroborated by this Product's own prior removal of XP/Streak UI); WCAG AA contrast on every learner/parent-facing surface (the same discipline already applied, and fixed where found, across the AN-101–108 visual-identity work this session); calm, muted tone over "obsolete dominant bright" chrome (the same standing correction already applied site-wide).

## 9. Coverage Intelligence

Already real, in one place, read from one place: `EvidenceProfile.tsx`'s "Assessment Coverage" panel (`withContent`/`totalQuestionTypes`) and `LearnerIntelligenceProfile.hasAnyContent` (`lib/learningEngine/profile.ts`). The governing rule is Learning Engine V1 §4's Principle 6 — **absence of evidence is not evidence of absence** — operationalised as: a Question Type with zero authored content renders "No content yet," never folded into a competency's Development Area count, never silently hidden.

**Coverage Intelligence is now cross-cutting, not single-purpose**, following Sprint 2: the identical `contentExists` signal gates three independent surfaces without three independent implementations —
1. the Learner/Admissions Coverage panel (`EvidenceProfile`),
2. Adaptive Mock Intelligence's selection rule ("never select an untagged Question Type," `ADAPTIVE_MOCK_INTELLIGENCE_SPECIFICATION_V1.md` §6.1),
3. the honest-degradation banner pattern (GL's `usingSyntheticFixture`, the CSSE Mock Exam's "no mock exam content is available yet" error) —

all three read the same real fact, none compute their own. This Blueprint names that convergence explicitly so a future feature reaches for the existing signal rather than inventing a fourth.

## 10. Success Measures

Not a new scoring model — that is explicitly out of scope (Constraints). These are qualitative, audit-style checks, directly derived from the frozen Verification Strategy's own "explainability" and "trust" dimensions (`EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §12), reusable as a literal checklist for every future screen:

1. Can a parent state, in their own words, *why* a recommendation appeared, without needing to ask? (Explainability, audience-checked.)
2. Does every screen a learner sees, regardless of how poorly they're doing, read as calm and encouraging? (Educational Safety Principle, adversarially tested near a mock/exam date.)
3. Is "not yet evidenced" ever visually or linguistically indistinguishable from "struggling"? (Should always fail this check — Principle 6.)
4. Does any learner- or parent-facing string contain a raw competency code, an Evidence Tier label, or an Educational State name? (Should always be zero, Section 5's known exception aside.)
5. Does any screen imply a percentile, a probability of offer, or a forecasted score? (Should always be zero, §13.)
6. Is every comparative or historical fact (the 303 floor, or any future equivalent) visually and structurally separate from the evidence picture beside it? (Section 2, Principle 8.)

## 11. Incremental Sprint 3 Delivery Roadmap

Four genuine, disclosed gaps were found while grounding this Blueprint — none require new engine code, all require only composition of what already exists:

- **Gap A — Mock Exam Historical Context panel not built.** `ADMISSIONS_INTELLIGENCE_V1_DESIGN.md` §6 scoped it; the Founder reclassified it as V1 Backlog during WP5G (`admissions-readiness/page.tsx`'s own header records this); it remains unbuilt. Cheapest real gap to close — one static cited constant (303) plus the mock's own already-computed score, no new calculation.
- **Gap B — Adaptive Mock Intelligence has no admissions/experience tie-in yet.** Mechanically, an Adaptive sitting's evidence reaches Admissions Readiness identically to a Standard sitting's (same pipeline, Sprint 2). Not yet verified is whether the *experience* (Mock History display, Historical Context copy) reads correctly when the two sitting types are mixed in one learner's history.
- **Gap C — `competencyLabel()` coverage gap** (Section 5) — a real, disclosed, content-authoring task, not a logic fix.
- **Gap D — No single "how this fits together" moment exists.** Each surface is individually excellent and honest; a parent must discover the Practice→Mock→Insight→Admissions→Revision sequence themselves via secondary nav. `ADMISSIONS_INTELLIGENCE_V1_DESIGN.md` §8 is the first document to *name* the sequence in writing — nothing on-screen narrates it yet.

**Proposed increments** (each its own gated Founder approval, per this programme's standing discipline — none authorised by this document):

1. **Experience Audit** — live browser walkthrough of the real learner and parent journeys end to end, checked against Section 10's six measures; produces a factual pass/fail catalogue, not assumptions.
2. **Close Gap A** — the Mock Exam Historical Context panel, using only already-existing data.
3. **Close Gap B** — verify (not build) that Adaptive and Standard sittings compose correctly in every surface that reads Mock History.
4. **Close Gap D** — a single orientation surface (copy/diagram, not new logic) stating the real sequence `ADMISSIONS_INTELLIGENCE_V1_DESIGN.md` §8 already names.
5. **Production verification** — live browser + database confirmation, same rigor as Sprint 1/2's own closure gates.

Gap C is logged as a standing content-authoring backlog item, not sequenced into Sprint 3's code increments.

---

## Repository Impact Assessment

**Zero code impact from this document.** It creates one file: `docs/intelligence/EDUCATIONAL_INTELLIGENCE_EXPERIENCE_BLUEPRINT_V1.md`. Every increment in Section 11, if and when separately approved, is scoped to reuse existing components (`RecommendationExplanation`, `EvidenceProfile`, `ReadinessSummary`, `MockHistorySection`) and existing data reads (`fetchLearnerIntelligenceProfile`, `getRecommendations`, `getMockResults`) — no new table, no new engine function, no new scoring model, matching this sprint's constraints exactly.

## Founder Recommendation

Approve this Blueprint as the governing experience document for Sprint 3, joining the `docs/intelligence/` family as the fourth reference point (alongside the three frozen Foundation documents and the two Mock Intelligence documents). Recommend sequencing Section 11's five increments as proposed, with Gap A given priority since it is the smallest, most concretely pre-scoped item already carrying an explicit (if deferred) Founder decision behind it.

---

**Version History**

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-07-23 | Created. Catalogues the real, already-shipped learner/parent experience layer (~12 pages, 8 components, one real 3-audience Explainability function); names nine experience principles, all traced to frozen sources; identifies four genuine, disclosed gaps (Mock Exam Historical Context, Adaptive/Standard mock-history composition, a competency-label content gap, and a missing journey-orientation surface); proposes a five-increment Sprint 3 roadmap. No code. |
| 1.1 | 2026-07-23 | Sprint 3 complete, Founder Certified — see `PHASE4_SPRINT3_COMPLETION_REPORT.md` for the full record. Section 11's roadmap closed: Gap A (Historical Context panel) and Gap D (Educational Journey Narrative) built; Gap B verified, and in verifying it, a fifth, unplanned finding (EI-001 — a third, legacy CSSE mock surface pooling into the same Mock History stats) was investigated and resolved via navigation consolidation, not architectural change. Gap C remains logged as a standing content-authoring backlog item, unchanged. Zero files under `lib/` were touched across all five increments — the Educational Intelligence Foundation, Assessment Brain, evidence pipeline, readiness model, and recommendation model are each still singular and unmodified. |
