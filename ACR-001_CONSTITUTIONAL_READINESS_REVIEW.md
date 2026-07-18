# ACR-001: Angel Constitutional Readiness Review

**Document ID:** ACR-001
**Role:** Independent Constitutional Reviewer — this document reviews existing documentation only. No code was changed, no document was redesigned, and no new implementation work was performed to produce it.
**Project:** Angel 11+
**Date:** 2026-07-18
**Question answered:** Does Angel have sufficient constitutional and architectural documentation to safely begin the Experience Transformation Programme?

**Method, stated honestly, per this account's established review discipline:** every document cited below was opened and read this session (not recalled from memory of prior summaries). Where a document's status, freeze state, or verdict is quoted, it is quoted from the file as it exists on disk right now. Two things were independently verified rather than assumed: (1) the actual git status/history of this repository (untracked files, unpushed commits), and (2) the actual scattering of Programme Decisions across individual work-package artefacts, checked by direct search, not inferred from having participated in issuing them.

---

## Overall Readiness Assessment

**CONDITIONAL GO.** The educational and experience constitutional layers are genuinely strong — evidence-grounded, internally cross-checked by two independent readiness reviews of their own (ARR-001, ERR-001), defect-corrected where defects were found, and frozen against casual drift. **The gap is not in what was written — it is in custody and consolidation.** Two real, fixable, non-content issues stand between "the documentation is good" and "the documentation is safely ready to build on": (1) a significant portion of the constitutional and architectural record exists only on this local machine, uncommitted or unpushed, and (2) 23 Programme Decisions issued across the most recent engineering wave (APD-033 through APD-055) have no consolidated register, and roughly half of them exist in no file at all. Neither issue is a defect in the *thinking* behind Angel's constitution — both are solvable in under a day of clerical work, and neither should be mistaken for a reason the platform's design is unsound.

---

## 1. Educational Constitution

**Assessment: Sufficient. Fully satisfied by existing approved documentation.**

**Evidence:** `AEP-001_LEARNING_SCIENCE_CONSTITUTION.md` — Status: APPROVED, amended once (APD-002, additive: §2.10 Educational Safety Principle, §2.11 Intellectual Curiosity Principle, §2.12 Learning Transfer Principle, §8 Documentation Governance), **Frozen** (APD-007). Nine evidence-rated learning-science principles (retrieval practice, spacing, interleaving, cognitive load, feedback specificity, growth mindset treated as *contested* and explicitly not relied upon, self-determination theory, metacognition, exam anxiety as a hard constraint), each with an honest Evidence Strength rating (Strong/Moderate/Contested) and an explicit "why this improves a child's chance of success" derivation — not asserted, argued. §4 states ten explicit prohibitions (no growth-mindset slogans, no loss-aversion mechanics, no bare-score feedback, no unscaffolded self-regulation for 8–11-year-olds, no anxiety-crossing difficulty). §8's Documentation Governance rule (every future educational document requires an "Educational Outcome" section) is itself a real, exercised governance mechanism, not a stated-but-idle rule — confirmed by ARR-001 §2's direct verification that every one of AEP-002 through 005 actually carries this section.

**Independent verification already performed:** `ARR-001_ARCHITECTURE_READINESS_REVIEW.md` reviewed the full Discovery Wave (AEP-001–005) with a stated posture of not assuming correctness, found one wording defect (corrected same-day, in AEP-004, before freeze), and issued **Overall Readiness Decision: CONDITIONAL GO** — itself now APPROVED and frozen (APD-007).

**No new document is needed here.**

---

## 2. Educational Architecture

**Assessment: Sufficient. Fully satisfied by existing approved documentation, with one minor documentation-hygiene item noted below.**

**Evidence:** `AEP-002_KNOWLEDGE_FRAMEWORK.md` (8 domains, 63 named competencies, transfer map, cross-subject relationship graph, examination application map, six-dimension Grammar School Readiness definition), `AEP-003_QUESTION_INTELLIGENCE_FRAMEWORK.md`, `AEP-004_LEARNING_JOURNEY_FRAMEWORK.md`, `AEP-005_ASSESSMENT_FRAMEWORK.md` — all APPROVED, all frozen alongside AEP-001. `AIW-001_EDUCATIONAL_DATA_MODEL.md`, `EAW-002_LEARNING_INTELLIGENCE_ENGINE_ARCHITECTURE.md`, `EAW-003_ASSESSMENT_ENGINE_ARCHITECTURE.md`, `EAW-004_RECOMMENDATION_ENGINE_ARCHITECTURE.md`, `EAW-005_IMPLEMENTATION_READINESS_ARCHITECTURE.md` translate that education architecture into an implementable engineering architecture.

**Independent verification already performed, and real defects actually found and fixed:** `ERR-001_ENGINEERING_READINESS_REVIEW.md`, reviewing the Engineering Architecture Wave with an explicit instruction not to assume correctness, found two genuine defects by direct search (not inference): EAW-D001 (`EAW-004` §2 cited a target-exam-date data source in AEP-004 §3 that does not actually exist there) and EAW-D002 (a related, lower-severity ambiguity about the "Reinforcing" Educational State's dependency on a `null`-typed Learning Profile dimension). Both were corrected via `EAW-ERR-HOTFIX-001_ENGINEERING_READINESS_DEFECT_CORRECTION_REPORT.md`, scope-disciplined to exactly these two defects — this is a real, working self-correction cycle, not a review that found nothing because it wasn't looking hard.

**Documentation-hygiene item (not a content gap):** both `ERR-001` and `EAW-ERR-HOTFIX-001`'s own file headers still read **"Status: DRAFT — awaiting programme review"**, even though the programme demonstrably proceeded past them — every subsequent work package (IWP-001 in full, IWP-002 through WP-23) was built on the corrected architecture these two documents produced. The approval clearly happened; the file headers were never updated to say so. This is a one-line edit per file, not a re-review.

**No new document is needed here.** Recommend updating the two status headers before Experience Transformation begins, so a future reader doesn't have to reconstruct "was this actually approved?" from context.

---

## 3. Programme Decisions Register

**Assessment: Partially sufficient. This is the review's most significant finding.**

**Evidence — what exists:** `IWP-001_IMPLEMENTATION_COMPLETION_REPORT.md` §4 consolidates APD-017 through APD-032 (the Implementation Programme's own decisions) in one table. Earlier decisions (APD-001 through roughly APD-016, the Discovery and Engineering Architecture waves) are individually traceable through each originating document's own amendment records (e.g., AEP-001's header cites APD-002 and APD-007 directly).

**Evidence — the gap:** the entire IWP-002 Engine Integration Programme (WP-16 through WP-23) issued Programme Decisions APD-033 through APD-055 — 23 decisions. **No consolidated register exists for this range.** A direct search of every markdown file in this repository for each of these APD numbers found: APD-033, 034, 036, 039, 040, 041, 042, 043, 044, 051, 052, 053 appear — each cited once, inside the single work-package artefact that happened to reference it (e.g., APD-039/040 only in `PERSISTENCE_ADAPTER_CONTRACTS.md`, APD-051/052 only in the WP-22 documents). **APD-035, 037, 038, 045, 046, 047, 048, 049, 050, 054, and 055 — eleven of the twenty-three — appear in no file anywhere in this repository.** They were issued and acted on in this programme's working conversation, but were never transcribed into a durable, git-tracked document. Several of these are genuinely load-bearing for anything that touches this engine going forward (APD-045 Semantic Field Integrity, APD-046 Decision and Audit Consistency, APD-047 Safety Evidence Fidelity, APD-048–050's Educational Asset Lifecycle, APD-054/055's Evidence Before Deployment / Production Reality Overrides Documentation) — a future engineer or reviewer with access only to this repository, not this conversation, could not currently reconstruct why these constraints exist or what they require.

**This is a genuine constitutional gap, not satisfied by existing documentation**, and is this review's primary recommendation for a new artefact (§ Missing Constitutional Artefacts, below).

---

## 4. Educational Governance

**Assessment: Sufficient. Fully satisfied by existing, and actually exercised, documentation.**

**Evidence:** this is not a single document but a working system, and the review specifically checked whether it is *exercised*, not merely declared. It is: `DEFECT_LINEAGE_REGISTER.md` records DEF-001 with root cause and correction; `ARCHITECTURAL_REFINEMENT_REGISTER.md` records REF-001 and REF-002, each explicitly distinguished from a defect per APD-024/026's own process test (was the earlier work correct against its own governing document when written?); `CALIBRATION_TRACEABILITY_REGISTER.md` tracks every provisional constant with owner, rationale, validation status, and review trigger, extended most recently with real Wellbeing and Recommendation Trigger rules under APD-041's format; `CURRICULUM_GAP_REGISTER.md` and `CONTENT_HEALTH_REGISTER.md` track real, named content gaps rather than silently working around them. The principle that content approval cannot be self-approved (APD-035, itself one of the un-registered decisions — see §3, but the *practice* is real) was concretely exercised in `WP-22_CONTENT_DISPOSITION.md`, which prepared 120 questions for review without approving its own prior tagging output.

**No new document is needed here** — the governance *mechanism* is real and working. The gap is the same one named in §3: some of the decisions that establish this governance are not yet written down anywhere durable.

---

## 5. Experience Constitution

**Assessment: Sufficient. Fully satisfied by existing approved documentation.**

**Evidence:** `docs/strategy/ANGEL_EXPERIENCE_MANIFESTO.md` — Status: Approved, explicitly **permanent** ("This is not a phase document... This is the philosophy those documents, and every document after them, must answer to"). It defines Student First / Parent Confidence journey expectations at three time horizons, the **Invisible Intelligence doctrine** (ALI's mechanism must never be user-visible) paired explicitly with **Respect Familiar Educational Language** (trusted vocabulary — Mock Exam, Assessment, Practice — must never be replaced in the name of that same invisibility), five Product Principles, six Design Principles, and a stated Long-Term Vision. `docs/strategy/ANGEL_MOMENTUM_FRAMEWORK.md` (permanent, alongside the Manifesto) and `docs/strategy/ANGEL_PRODUCT_PHILOSOPHY_UPDATE.md` (permanent strategic refinement, explicitly correcting a scope error from the UX V3 pass without reversing its core goal) sit alongside it as the complete Experience Constitution.

**Cross-checked against the Educational Constitution, not merely juxtaposed:** AEP-001 §5 explicitly reconciles itself against the Manifesto section by section (§2.5/§2.6/§2.8/§2.9 confirming the Manifesto's UX instincts with cognitive-science evidence) and states plainly: "No existing Angel document is found to conflict with the evidence in this constitution." This is a real cross-check performed by the Educational Constitution itself, not an assumption of harmony.

**No new document is needed here.**

---

## 6. Design System Readiness

**Assessment: Sufficient for the surfaces already transformed; the untransformed surfaces are honestly scoped, not silently gapped.**

**Evidence:** `ANGEL_DESIGN_LANGUAGE.md` (V3, current canonical — explicitly supersedes `DESIGN_SYSTEM.md`, which is retained as a historical record, not deleted) defines a single canonical subject-identity table (icon + colour per subject, with two real prior inconsistencies named and corrected), a five-type card taxonomy, an icon system, colour-usage rules (every colour must trace to subject identity, semantic state, or neutral — nothing decorative), motion rules, and the ALI-invisible language rule restated as a design constraint. `ANGEL_NAVIGATION_ARCHITECTURE.md` and `ANGEL_LOADING_EXPERIENCE.md` are both Approved and confirmed **implemented** (`components/Navigation.tsx`, `components/PremiumLoader.tsx` respectively) — not aspirational.

**Honest, pre-existing scope boundary, not a gap this review discovered:** `ANGEL_UX_V3_STRATEGY.md` §4 explicitly states its own two-tier scope — Tier 1 (systemic: navigation, design tokens, ALI-invisible language, loading) touches every page; Tier 2 (deep redesign) was deliberately limited to Dashboard, the Reasoning hub, the Mocks/Practice hub, and the four adaptive routes. Every other route "receives the Tier 1 systemic corrections but is not rebuilt page-by-page." This is stated as "a scope decision made explicitly, not a silent shortfall," and the same document notes the system is written so extending Tier 2 treatment to any remaining page is "a mechanical application of an already-defined system, not a fresh design exercise." This is, in effect, an accurate, already-written map of exactly which surfaces Experience Transformation would be extending versus starting fresh on.

**No new document is needed here.**

---

## 7. Experience Transformation Readiness

**Assessment: Conditional readiness — the constitutional foundation is sound; two operational preconditions should close first.**

**In favour of proceeding:**
- The Educational Constitution and Architecture (§1–2) are frozen, cross-reviewed, and defect-corrected — a stable foundation that will not shift under an experience redesign built on top of it.
- The Experience Constitution (§5) was written specifically to be the permanent yardstick a redesign is tested against, not a document a redesign would need to revise — it is designed to outlive exactly this kind of programme.
- The current Design System (§6) gives Experience Transformation a real, live, documented starting point, plus an honest map of which surfaces are already deeply redesigned and which are only systemically corrected.
- Critically, **the entire Engine Integration Programme (WP-16 through WP-23) has deliberately not touched any learner-facing surface** — confirmed explicitly in every one of those work packages' own reports (WP-19: "not yet wired into any learner-facing surface"; WP-20: proposed relationships never added to the live array; WP-22: SQL not executed; WP-23: zero learner-facing behaviour change from the migration batch). This is not accidental — it is `IWP-002`'s own governing principle, APD-033 ("Engine Before Experience"). The practical consequence for this review: **the live product surface Experience Transformation would actually be redesigning is unaffected by, and independent of, everything built in this programme so far.** There is no in-flight engine change Experience Transformation would need to "catch up to" or coordinate around.

**Against proceeding without first closing two items:**
- **Custody risk (verified this session, not assumed):** `git status` shows 11 files untracked — including `AEP-001_LEARNING_SCIENCE_CONSTITUTION.md` itself, every other AEP/AIW/EAW document, `ARR-001`, `ERR-001`, and the IWP-001 strategy document — plus `git rev-list --count origin/main..HEAD` returns **35** — thirty-five commits, comprising this repository's entire IWP-002 implementation history (WP-16 through WP-23), that exist only on this local machine and have never reached `origin/main`. This is precisely the same risk category `ANGEL_PROJECT_CLOSURE_REPORT.md` (2026-07-03) named for an earlier batch of seven strategy documents — that risk was resolved (those seven are now committed) — but a larger version of the same risk has since accumulated across the entire constitutional/architectural/engineering record produced since. Beginning a major new programme against a foundation this exposed is the single most avoidable risk in this whole review.
- **The Programme Decisions gap (§3):** Experience Transformation will need to operate within constraints this programme established (Educational Scope Protection, Semantic Field Integrity, Evidence Before Deployment, and others) — inheriting them from a consolidated register is safer than inheriting them from institutional memory of this conversation.

**Recommendation: proceed once §"Recommended Sequence," below, is complete — not before.** Nothing found in this review suggests the underlying constitution or architecture is unsound; the finding is entirely about whether that soundness is currently *safe*, not whether it is *real*.

---

## 8. Outstanding Constitutional Gaps

Consolidated from the findings above, ranked by how directly each bears on Experience Transformation:

1. **Custody risk** — 11 uncommitted files (including AEP-001 itself) and 35 unpushed commits. *Not a documentation gap — a persistence gap.* (§7)
2. **Programme Decisions Register incomplete** — APD-033 through APD-055 have no consolidated register; 11 of 23 exist in no file at all. (§3)
3. **Two stale status headers** — `ERR-001` and `EAW-ERR-HOTFIX-001` still read "DRAFT — awaiting programme review" despite de facto approval and everything built on top of them since. (§2)
4. **Production state unconfirmed** — `WP-23_PRODUCTION_MIGRATION_READINESS_REVIEW.md` found that this repository's own documents disagree about which migrations (004 onward) have ever been applied to production, and this cannot be resolved from this sandbox. Not itself a constitutional-content gap, but relevant context: Experience Transformation will eventually touch live surfaces, and what is actually live today is not yet confirmed. Awaiting the Founder's own diagnostic (§8 of that review).
5. **An unaddressed pause, worth one reconciling sentence, not a blocker** — `docs/strategy/ANGEL_FOUNDATION_COMPLETE.md` (2026-07-03) states "Feature development paused by explicit founder decision." No later document explicitly states this pause was lifted before the Angel Excellence Programme (Discovery Wave onward) began. In substance this is very likely not a real conflict — everything built since has been internal engine architecture, not the kind of learner-facing "feature development" that document was pausing, and `APD-033`'s own "Engine Before Experience" sequencing is consistent with, not contrary to, that earlier pause. But no document says this explicitly, and it costs one sentence to say so.

---

## Missing Constitutional Artefacts

Per this review's instruction to recommend a new document only where no existing approved documentation satisfies the requirement:

- **A consolidated Programme Decisions Register covering APD-033 through APD-055** (extending `IWP-001_IMPLEMENTATION_COMPLETION_REPORT.md` §4's existing, working pattern, which already does exactly this for APD-017–032). This is the one genuine content gap this review found that cannot be satisfied by anything already written — the eleven un-transcribed decisions exist nowhere else to point to.

Everything else identified in §8 is a fix to existing material (commit/push, update two status lines, add one reconciling sentence) — not a new constitutional document.

---

## Recommended Sequence Before Experience Transformation Begins

1. **Commit and push everything currently local-only** — the 11 untracked files and the 35 unpushed commits. This is the highest-value, lowest-effort item in this entire review: it converts "this documentation exists" into "this documentation is safe," with zero content risk, since nothing about any of these files is meant to be private or still-draft.
2. **Author the consolidated Programme Decisions Register for APD-033–055**, in the same format `IWP-001_IMPLEMENTATION_COMPLETION_REPORT.md` §4 already established — reconstructing the eleven currently-unwritten decisions (APD-035, 037, 038, 045–050, 054, 055) from this programme's own record while it is still fresh, before that record ages further.
3. **Update `ERR-001` and `EAW-ERR-HOTFIX-001`'s status headers** from "DRAFT — awaiting programme review" to reflect their actual, already-exercised approval.
4. **Add one reconciling sentence to either `ANGEL_FOUNDATION_COMPLETE.md` or the Programme Decisions Register** noting that the 2026-07-03 feature-development pause was understood to exclude internal engine architecture work, consistent with APD-033.
5. **Resolve WP-23's production-state diagnostic** (already prepared, awaiting the Founder's execution) — not because Experience Transformation needs a migration to run first, but because knowing the platform's actual current live state is a reasonable precondition for any programme about to redesign what users see on it.

Once these five items are closed, this review finds no constitutional or architectural reason Experience Transformation should not begin.
