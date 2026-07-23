# Educational Excellence Blueprint — Version 1.0

**Angel 11+, Phase 4, Sprint 4**
**Status:** Founder Approved (kickoff). Strategic design document. No code implemented against this document.
**Authority this document builds on, unmodified:** `ASSESSMENT_BRAIN_V1.md`, `LEARNING_ENGINE_V1.md`, `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` (all frozen), `ADMISSIONS_INTELLIGENCE_V1_DESIGN.md` (draft, Founder-reclassified items already closed per Sprint 3), `EDUCATIONAL_INTELLIGENCE_EXPERIENCE_BLUEPRINT_V1.1`, `PHASE4_SPRINT3_COMPLETION_REPORT.md`. Every claim below is cited to one of these, to real shipped code, or is explicitly marked as a qualitative/structural judgement rather than a sourced fact. Nothing here invents a new educational conclusion, and no code is proposed for implementation now.

---

## 1. Executive Summary

After Sprint 3, Angel has a real, evidence-only educational architecture for CSSE — the only pathway with its own Assessment-Brain-equivalent — and, for the first time, a coherent *experience* wrapped around it: one mock journey (not three), one orientation page narrating the whole loop, and one Historical Context fact placed correctly beside (never blended into) a child's own evidence.

What Angel has built to date is unusually disciplined for this category: every claim traces to a specific competency, Question Type, or exam asset (`ASSESSMENT_BRAIN_V1.md` §9's Cross Reference Matrix); every learner-facing statement carries an explicit evidence-maturity qualifier (Evidence Tier ET-0–4); nothing predicts an outcome, a percentile, or a score (`EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §13); and every recommendation can answer, for three separate audiences, what evidence supports it, why now, and what would change it (§9, Explainability). This is not incremental UI polish over a generic quiz app — it is a different *kind* of platform, built the way a psychometrician would build one, not the way a content marketplace would.

Sprint 3's own closing evidence (`PHASE4_SPRINT3_COMPLETION_REPORT.md`) confirms this architecture held under real pressure: zero files under `lib/` were touched while consolidating three competing CSSE mock surfaces into one and building a new orientation layer — proof the experience layer can evolve without destabilising the engine beneath it.

The honest limitations are equally load-bearing for this Blueprint's recommendations: this rigor exists for **one pathway only** (CSSE); the Recommendation Model still has two, not one, real implementations in the codebase (`lib/learningEngine/recommendations.ts` for CSSE, and the older flat-score `lib/adaptiveEngine.ts` for every other pathway) with no consolidation decision yet made; and several capabilities the Foundation itself unblocked (the Review category, Durable Mastery's Maintenance Review trigger, Cognitive Demand tagging) remain named but unbuilt. Sprint 4's highest-value opportunities live almost entirely in *closing gaps the Foundation already identified*, not in inventing new ones.

## 2. Current Capability Assessment

### Educational capabilities (real, live)
- **13 competencies, 27 Question Types, 4 domains, CSSE-only** — `ASSESSMENT_BRAIN_V1.md`, evidence-rated (HIGH/MEDIUM/LOW/INSUFFICIENT EVIDENCE) and evidence-maturity-rated (EMC-1–4) per competency, built from 17 real exam-paper assets, not invented.
- **Evidence Tier model (ET-0–4)** per competency, live in `lib/learningEngine/rollup.ts`/`diagnostics.ts`/`readiness.ts` — the canonical, single confidence scale (`EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §5 formally reconciled what was previously two competing scales).
- **Diagnostic Intelligence** (Strengths, Mastered Skills, Emerging Skills, Development Areas, Low Confidence Areas) — live, `DiagnosticOverview` component, correctly distinguishes "not yet evidenced" from "struggling" (Principle 6).
- **8-state Educational State model** (Exploring → Building Knowledge → Practising → Reinforcing → Mastered → Durably Mastered → Reviewing → Rebuilding) — internal coordination layer, never surfaced by name to learner/parent, live via `getEducationalIntelligence()`.
- **Durable Mastery** — a competency that survives a genuine post-mastery Maintenance Review, distinct from simply reaching ET-4 — live, surfaced on the Learner Dashboard's Skills Profile (`durableCompetencyIds`), backed by real persistence (`ali_durable_mastery`, migration `010`).
- **Adaptive Mock Intelligence** (Sprint 2) — a pure-function paper builder that weights a shorter sitting toward a learner's own recorded Development Areas/Low Confidence Areas/Not Yet Evidenced competencies, sharing one evidence pipeline with Standard sittings.
- **Recommendation Model** — 5 categories (Practice, Consolidation, Revision, Extension, Review), each with a concrete Educational-State-derived trigger; only Review remains structurally unblocked-but-unbuilt (§6 below).

### Parent capabilities (real, live)
- Parent Dashboard, Weekly Report, Revision Planner, Readiness Timeline, Mock Readiness, and (new, Sprint 3) the Educational Journey Narrative — all reading the same underlying evidence, none computing a second version of it.
- Three-audience Explainability (`generateExplanation()`) — the same underlying conclusion rendered in a learner register, a parent register, and a full-audit register, live and shared across every surface that shows a recommendation.
- Honest empty/gated states (the "Available for the CSSE pathway only" `InfoCard` pattern) used consistently rather than a placeholder or an inferred approximation for non-CSSE pathways.

### Assessment capabilities (real, live)
- Mock Attempt Ledger (Sprint 1) — a real, persisted, per-attempt history distinguishing sitting sub-type (`pathwayName`) within a single pooled `pathway` field.
- Standard/Adaptive Mode Toggle on the CSSE Mock Exam, sharing one grading/evidence/Ledger/readiness code path after selection (Sprint 2).
- Readiness Snapshot integration at mock completion (IG-001, Sprint 2) — closes the loop from a timed sitting back into the same Readiness model practice already feeds.

### Admissions capabilities (real, live; one draft not yet approved)
- The Historical Context panel (Sprint 3) — the one real, sourced admissions fact this platform holds (CSSE's 303 combined-score floor) shown beside, never blended into, a mock's own score, with an explicit non-comparability disclaimer.
- `ADMISSIONS_INTELLIGENCE_V1_DESIGN.md` itself remains **DRAFT**, not fully implemented — its Admissions Readiness composite view (§5: Component Readiness + Assessment Coverage + Durable Mastery count, shown together, never combined into one number) is designed but its dedicated `/learning-intelligence/parent/admissions-readiness` page status should be confirmed as part of Sprint 4 scoping, not assumed complete by this Blueprint.
- School Comparison / Target Score Guidance — explicitly **not buildable** without real per-school data acquisition, a Founder/business decision not made to date (`EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §10).

### Explainability capabilities (real, live)
- One canonical `generateExplanation()` function, three audiences, no duplicate logic per surface.
- A known, disclosed gap: `competencyLabel()` is missing plain-language entries for NVR/Spatial/Mathematical Reasoning competencies (a content-authoring gap, Gap C from `EDUCATIONAL_INTELLIGENCE_EXPERIENCE_BLUEPRINT_V1.1`, still open, not sequenced into Sprint 3's or this Blueprint's code work).
- Full raw-evidence audit register (competency codes, Evidence Tier, `RecommendationEvidence` fields) exists for every conclusion, satisfying the Engine's own Verification Strategy (§12) — a genuine trust/defensibility asset most competitors in this category do not have any equivalent of.

## 3. Market Differentiation

This section is a qualitative, structural comparison grounded in what Angel's own platform demonstrably does (Section 2 above) against well-established, publicly-observable characteristics of each competitor category — it is not sourced competitor research or market-share data, and is disclosed as such rather than presented with false precision.

**Where Angel is already structurally stronger:**
- **Evidence-first, never opinion-first.** A private tutor's assessment of a child's "readiness" is a subjective, unaudited judgement; Angel's Readiness bands trace to specific, named Question Type evidence, always inspectable (§9's audit register). This is a categorical difference, not a matter of degree.
- **Honest absence-of-evidence handling.** Every mock provider and most practice apps default an untested topic to a low score or a warning icon; Angel's Principle 6 (Absence of Evidence Is Not Evidence of Absence) explicitly refuses to conflate "not yet attempted" with "struggling" — verified live, not just specified (Diagnostic Overview correctly separates these).
- **No prediction, stated as a feature not a limitation.** Angel is structurally incapable of promising a score or an offer probability (`EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §13) — most commercial 11+ platforms lead with exactly this kind of confident-sounding prediction. Admissions Intelligence's own Founder acceptance test (§12 of that document) turns this into an explicit trust differentiator: a parent can correctly state what Angel does *not* claim.
- **One evidence pipeline for both practice and exam-condition mock sittings.** Most mock-exam providers are a separate product from practice content, with no shared evidence model; Angel's Adaptive Mock Intelligence deliberately reuses the identical pipeline (Sprint 2), so a mock sitting strengthens the same profile practice does.
- **Real depth, not breadth-first content.** 13 competencies and 27 Question Types built from 17 real CSSE exam-paper assets is deeper domain modelling than a generic learning app's subject-agnostic question bank.

**Where competitors remain stronger, honestly:**
- **Human judgement and adaptivity in the moment.** A skilled tutor reads a child's frustration or confusion in real time and adapts instantly; Angel's Educational Safety Principle (Wellbeing veto) is a real, deliberate constraint but is not a substitute for a human noticing a bad day.
- **Coverage breadth across exam boards.** Angel's rigor is CSSE-only; GL/CEM/ISEB rest on a materially weaker, non-reconciled taxonomy (63 codes, practitioner convention, not real exam papers — `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §4). A family preparing for a GL-only school gets none of this Blueprint's differentiators today.
- **Volume and polish of content.** Established mock-exam providers and tuition chains have produced far more raw practice volume over a longer time; Angel's strength is architecture and explainability, not yet content breadth.
- **Brand trust from track record.** Established providers have years of visible outcomes (real or perceived); Angel's evidence-based trust case is real but new, and has to be *demonstrated* to a parent rather than assumed from reputation.

## 4. Educational Excellence Principles

These govern every future educational feature and are direct extensions of principles the Foundation already established — none is asserted here for the first time without a traceable precedent.

1. **Evidence before confidence, confidence before recommendation.** No feature may skip from "evidence exists" straight to a claim without passing through an explicit Evidence Tier — extends Learning Engine V1 Principle 1 and 3.
2. **Depth before breadth, breadth before duplication.** A new capability should deepen CSSE's existing model (e.g. Cognitive Demand tagging, §6.2) before extending coverage to a new pathway, and must never duplicate a capability already reusable via Section 2's inventory (`EDUCATIONAL_INTELLIGENCE_EXPERIENCE_BLUEPRINT_V1.1`'s Coverage Intelligence convergence pattern).
3. **Explain, never just assert.** Any new learner- or parent-facing conclusion must be able to answer Section 9's three questions (what evidence, why now, what would change it) before it ships — extends the Engine's own Explainability guarantee.
4. **Wellbeing is a veto, not a variable.** Consistent with Principle 8 (Educational Safety), no future feature — including any gamification, streak, or urgency mechanic — may be justified by engagement metrics if it increases anxiety, and this constraint tightens, not loosens, as exam proximity increases.
5. **Reuse the existing pipeline before building a parallel one.** The two-Recommendation-Model situation (§8 below) is the cautionary example this principle exists to prevent recurring — any future capability must be checked against Section 2's inventory before a new code path is written.
6. **Disclose every boundary, never paper over it.** Score-scale non-comparability, GL/CEM/ISEB's weaker evidence base, and every open Assessment Brain limitation (§8, Assessment Brain V1) must remain visible to whoever is deciding what to build next — including in this Blueprint's own recommendations.

## 5. Opportunity Assessment

Ranked qualitatively (High/Medium/Low) across five dimensions. All opportunities below are gap-closing against the Foundation's own already-identified, still-open items — none proposes a new educational construct.

| Opportunity | Educational impact | Parent value | Competitive differentiation | Implementation complexity | Long-term strategic value |
|---|---|---|---|---|---|
| **A. Implement the Review recommendation category** | High | Medium | Medium | Low — mechanism already unblocked (`ali_durable_mastery`, `ali_educational_audit`, migration `010`, per `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §7) | High |
| **B. Cognitive Demand tagging (Bloom's level per question)** | Medium | Low (engineering/content layer, not directly parent-visible yet) | Medium | Medium — schema-only, additive metadata, no engine logic change (§6 of the Engine doc) | High |
| **C. Complete Admissions Readiness composite page** | Medium | High | High (Section 3's clearest, most demonstrable differentiator) | Low–Medium — composition of already-real signals, no new calculation (`ADMISSIONS_INTELLIGENCE_V1_DESIGN.md` §5, §9) | High |
| **D. Close `competencyLabel()` content gap (Gap C)** | Low | Medium | Low | Low — content-authoring only | Low–Medium |
| **E. Resolve the two-Recommendation-Model duplication (architectural decision only, not code)** | Medium | Low (invisible to parent) | Low (internal quality) | Low to *decide*, High to *execute* later | High — blocks future cross-pathway consistency |
| **F. Speed/pace band (faster/comparable/slower than expected)** | Low–Medium | Medium | Medium | Medium — needs new elapsed-time capture on `ali_student_question_history` | Medium |
| **G. GL/CEM/ISEB Assessment-Brain-equivalent (content acquisition)** | High (for those families) | High (for those families) | High (coverage breadth) | Very High — requires real exam-paper asset acquisition per board, a business decision not an engineering one | High |

## 6. Capability Roadmap

Recommended next major educational capabilities, in reuse-first order. Every item below reuses an existing mechanism named in Sections 2 or 5 — none proposes a new table, a new confidence scale, or a parallel engine.

### 6.1 Close the Review category (Opportunity A)
The Educational State model already names **Reviewing** as a real state and the persistence it needs (`ali_durable_mastery`, `ali_educational_audit`) already exists and is already field-matched (`EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §7). This is the single highest-leverage remaining gap: it is named, unblocked, and evidenced, not invented. Recommended as Sprint 4's first increment.

### 6.2 Complete the Admissions Readiness composite view (Opportunity C)
`ADMISSIONS_INTELLIGENCE_V1_DESIGN.md` §5's three-signal composite (Component Readiness + Assessment Coverage + Durable Mastery count, shown together, never combined) is fully designed and reuses only existing reads. Section 3's competitive analysis identifies this as the platform's clearest demonstrable differentiator to a parent. Recommended as Sprint 4's second increment, contingent on first confirming (not assuming) its current build status.

### 6.3 Cognitive Demand tagging (Opportunity B)
Adds a Bloom's-level tag (Remember/Understand/Apply/Analyse/Evaluate/Create) to question metadata, per `EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §6 — a genuinely new, but additive, schema field, not a new engine construct. Deepens future explainability ("this question requires *applying* a rule, not just recalling it") without touching Diagnostic Intelligence, Readiness, or Recommendations.

### 6.4 Content-authoring backlog: `competencyLabel()` gap and GL/CEM/ISEB depth (Opportunities D, G)
Logged, not sequenced as engineering work — the first is a copy-writing task, the second is a business-scale content-acquisition decision, not something this Blueprint can schedule as a Sprint 4 code increment.

### 6.5 Recommendation Model consolidation — decision only (Opportunity E)
Recommend a **Founder decision**, not code: should `lib/adaptiveEngine.ts` (flat-score, all pathways) eventually be retired in favour of extending the Learning Engine V1 competency model to other pathways as each gains its own Assessment-Brain-equivalent? This Blueprint does not resolve it — flagged for explicit Founder scoping before any future pathway-extension work begins, so it is decided once, deliberately, rather than drifting.

## 7. Success Measures

Extends `EDUCATIONAL_INTELLIGENCE_EXPERIENCE_BLUEPRINT_V1.1`'s Section 10 checklist with capability-level measures for Sprint 4 specifically:

1. Every new capability traces every claim to a named competency, Question Type, or Evidence Tier — zero exceptions, checked before ship (extends Success Measure 4).
2. A parent, shown the completed Admissions Readiness page, can correctly restate the Founder acceptance test in `ADMISSIONS_INTELLIGENCE_V1_DESIGN.md` §12 in their own words.
3. The Review category, once built, never fires for a competency without a genuine time-gap Maintenance Review — verified against real data, not assumed from code review alone.
4. Zero new tables, confidence scales, or recommendation pipelines introduced outside what Sections 6.1–6.3 name explicitly.
5. Zero regression in any of Sprint 1–3's existing verified behaviour (Mock Attempt Ledger, Adaptive Mock Intelligence, Experience Consolidation) — checked via the same lint-count/diff-stat discipline used throughout this programme.

## 8. Risks

**Architectural:**
- The two-Recommendation-Model duplication (Opportunity E) is a real, standing architectural debt. Left undecided indefinitely, it risks becoming *harder* to resolve the more pathway-specific work is built on top of either one.
- Cognitive Demand tagging (6.3), if scoped loosely, risks becoming a second classification system rather than the clean, additive metadata layer the Engine doc scopes it as (§6's own warning that Cognitive Type and Cognitive Demand must stay non-overlapping).

**Educational:**
- Building the Review category (6.1) incorrectly — e.g. triggering "review due" too aggressively — would violate the Educational Safety Principle by manufacturing anxiety from a mechanical timer rather than genuine evidence decay. Needs explicit adversarial wellbeing testing before ship (Engine doc §12).
- Admissions Readiness (6.2), if any future copy iteration blurs the "beside, never blended" boundary, directly risks the platform's core trust differentiator (Section 3) — the single most reputationally costly mistake this roadmap could make.

**Product:**
- Pathway scope-creep: commercial pressure to "cover GL/CEM/ISEB properly" risks a shortcut that infers coverage from CSSE's model or the weaker taxonomy — explicitly forbidden (`EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §4) and must be resisted even if requested, unless a real new Assessment-Brain-equivalent is separately commissioned.
- Section 3's honest admission (competitors have more content volume and brand trust) means Sprint 4's differentiators must be *shown*, not merely built — a capability with no visible parent-facing proof point (e.g. 6.3's tagging, invisible without 6.2 to display it) risks shipping real value with no market-facing signal.

## 9. Sprint 4 Programme Proposal

Recommended implementation sequence, each its own gated Founder-approved increment, per this programme's standing discipline — this Blueprint authorises none of them directly:

1. **Increment 1 — Review Category Implementation** (6.1): the single highest-leverage, most fully-unblocked gap.
2. **Increment 2 — Admissions Readiness Composite Verification/Completion** (6.2): confirm current build status first; complete only what is genuinely missing.
3. **Increment 3 — Cognitive Demand Schema Design** (6.3): schema and tagging convention only, no immediate UI surface required.
4. **Increment 4 — Recommendation Model Consolidation Decision** (6.5): a Founder decision point, not a build increment — scheduled explicitly rather than left to drift.
5. **Increment 5 — Sprint 4 Production Verification**: same rigor as Sprint 1–3's own closure gates (live browser + database confirmation).

Content-authoring items (competencyLabel() gap, GL/CEM/ISEB depth) remain a standing backlog, not sequenced into these five increments.

## 10. Founder Recommendations

1. **Approve Increment 1 (Review category) first.** It is named, unblocked, evidenced, and lower-complexity than any other item in Section 5 — the clearest "close what we already built" opportunity in this whole assessment.
2. **Treat Admissions Readiness completion as the flagship differentiator to show, not just build.** Section 3's competitive analysis is unambiguous: "provably not overclaiming" is Angel's sharpest edge over every named competitor category, and this feature is where a parent can see it directly.
3. **Do not approve any GL/CEM/ISEB depth work under Sprint 4** without first making the Recommendation Model consolidation decision (6.5) explicitly — building more pathway-specific features atop an undecided architecture compounds Risk E.
4. **Keep Gap C (competencyLabel() content) and GL/CEM/ISEB acquisition on the visible backlog**, not silently dropped — both are real, disclosed gaps the Foundation's own documents already named.
5. **This Blueprint's own governing constraint should continue to bind Sprint 4 as it did Sprint 3:** every proposed capability closes a gap the Foundation already identified; none invents a new educational construct, competency, or scoring model.

---

## Sprint 4 Readiness Assessment

Angel enters Sprint 4 from a clean, verified state (`PHASE4_SPRINT3_COMPLETION_REPORT.md`): one coherent CSSE experience, zero known defects, zero files under `lib/` touched by the last three increments of work. The Foundation itself (Assessment Brain, Learning Engine, Educational Intelligence Engine) has already named every capability this Blueprint recommends — Sprint 4's job is closure, not invention. The one genuine open architectural question (Recommendation Model consolidation) is well-understood and containable as a single decision point rather than a blocking crisis. **Readiness: GO**, sequenced per Section 9, with Increment 4 treated as a decision gate rather than a build task.

## Prioritised Capability Matrix

| Rank | Capability | Opportunity Ref | Why this rank |
|---|---|---|---|
| 1 | Review recommendation category | A | Fully unblocked, named by the Foundation, lowest complexity of the high-impact items |
| 2 | Admissions Readiness composite completion | C | Highest parent value and competitive differentiation; low-medium complexity |
| 3 | Cognitive Demand tagging | B | High long-term strategic value; safely additive, no engine risk |
| 4 | Recommendation Model consolidation decision | E | Not urgent to execute, but urgent to *decide* before further pathway work compounds it |
| 5 | competencyLabel() content gap | D | Low complexity, real but modest impact — backlog, not blocked on anything |
| 6 | Speed/pace band | F | Medium value, needs new data capture — later sprint |
| 7 | GL/CEM/ISEB Assessment-Brain-equivalent | G | Highest ceiling, but a business-scale content-acquisition decision, not an engineering sprint item |

---

**Version History**

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-07-23 | Created. Assesses current capability across five domains (Educational/Parent/Assessment/Admissions/Explainability), identifies market differentiation grounded in the existing platform, defines six Educational Excellence Principles, ranks seven opportunities, proposes a five-increment Sprint 4 roadmap centred on closing gaps the Foundation itself already named (Review category, Admissions Readiness completion, Cognitive Demand tagging, Recommendation Model consolidation decision). No code. |
