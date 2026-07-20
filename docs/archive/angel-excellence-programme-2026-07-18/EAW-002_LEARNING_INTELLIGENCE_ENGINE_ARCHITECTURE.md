# EAW-002: Learning Intelligence Engine Architecture

**Document ID:** EAW-002
**Programme:** Angel Excellence Programme — Engineering Architecture Wave (Document 2)
**Status:** DRAFT — awaiting Founder review and approval
**Project:** Angel 11+
**Owner:** ELBOLD
**Last Updated:** 2026-07-18
**Naming note:** this Programme Decision refers to the prior deliverable as "EAW-001" — that document was produced and filed as `AIW-001_EDUCATIONAL_DATA_MODEL.md` under the Implementation Wave name in force at the time it was written. It is the same, unmodified, approved document; this note simply reconciles the two labels rather than leaving a silent discrepancy.
**Governing documents (Version 1.0 Educational Architecture, frozen APD-007, plus AIW-001/"EAW-001," approved APD-008):** `AEP-001` through `AEP-005`, `ARR-001`, `AIW-001_EDUCATIONAL_DATA_MODEL.md`.

**Purpose:** Translate the approved educational and data architecture into the engineering architecture for Angel's Learning Intelligence Engine — the formal name this document gives to what has, throughout this project's history, been called ALI (Angel Learning Intelligence). This is an architecture document: it defines responsibilities, boundaries, and data flow. **It does not write production code, and it preserves the frozen educational architecture without exception** — every mechanism cited from AEP-001–005/AIW-001 below is restated, not redesigned.

---

## 1. Engine Responsibilities

The Learning Intelligence Engine is responsible for exactly four things, each corresponding to an existing or AIW-001-specified data flow:

1. **Ingesting evidence** — every graded Attempt (AIW-001 §5), unchanged from ALI's existing `ali_student_question_history` write path.
2. **Computing derived educational state** — Mastery (AIW-001 §6, unchanged), Assessment Confidence tiers (AEP-005 §6), and Durable Mastery (AIW-001 §7) — all computed from evidence, never independently asserted.
3. **Generating recommendations with evidence and explanation attached** — the Recommendation Pipeline (§4 below), producing `RecommendationEvidence` records (AIW-001 §8).
4. **Feeding Parent Reporting and the Educational Audit trail** — writing to the shapes AIW-001 §9/§10 already define.

**Explicitly not the engine's responsibility:** rendering any UI, authoring content, defining exam-board-specific mock formats (the still-open format-fluency gap, AEP-002 Real Gap #6), or making any claim not traceable to evidence it holds. These are named here so a future implementer does not accidentally expand the engine's scope beyond what this architecture defines.

---

## 2. Decision Boundaries

**Per Programme Decision APD-008 item 2, formalising which educational decisions the engine may make automatically and which require stronger evidence — directly mapped onto AEP-005 §6's four-tier Evidence Confidence Model:**

| Decision category | Examples | Minimum evidence tier required | Rationale |
|---|---|---|---|
| **Automatic** | Revision recommendations, retrieval scheduling (cooldown/spacing timing), transfer opportunities (nudges toward a linked competency), confidence-building activity selection | Low Confidence or above | Low-stakes, reversible, and consistent with AEP-001 §2.10's Educational Safety Principle — a wrong or premature nudge here costs little and self-corrects with the next attempt; withholding these until High Confidence would starve the Formative Assessment loop (AEP-005 §3) of the very activity that produces more evidence |
| **Higher Evidence Required** | Mastery declaration, Durable Mastery, Grammar School Ready (any dimension), any significant parent-facing conclusion phrased with definite language | High Confidence (Mastery declaration: the existing `mastery_threshold` mechanism, already a high bar per AEP-001 §1's "never from a single correct answer"); Durable Mastery and Grammar School Ready additionally require the specific standards AEP-005 §10/§13 already define, not merely "High Confidence" in isolation | High-stakes and hard to reverse *in trust terms* even when technically revocable in data terms — a parent told "mastered" or "ready" who later learns that was premature suffers a real trust cost (AEP-005 §12) that a quietly-corrected recommendation does not |

**The general rule underlying this table, stated once so it governs every future addition to either list:** the harder a wrong conclusion would be to walk back without damaging trust, the higher the evidence bar the engine must clear before asserting it — and per ALI's unmodified Direct Evidence principle, **no amount of cross-subject, transfer, or inferred evidence may, on its own, satisfy a Higher Evidence Required decision.** Transfer/cross-subject evidence may supplement a Higher Evidence Required conclusion already resting on direct evidence (exactly as `ALI_CROSS_SUBJECT_INTELLIGENCE.md` §4.1 already established), but can never be the sole basis for one.

---

## 3. Evidence Flow

A single, one-directional pipeline, with no step permitted to write "upstream" of the one before it:

**Attempt (raw evidence, `ali_student_question_history`) → Mastery Model update (AIW-001 §6, unchanged) → Confidence tier computation (AEP-005 §6, AIW-001 §5) → Durable Mastery evaluation (AIW-001 §7, only for competencies already `mastered`) → available as input to the Recommendation Pipeline (§4) and Parent Reporting (AIW-001 §9).**

**The Attempt record is the only true source of truth in this entire flow.** Every later stage is a derived, recomputable value — consistent with `ALI_CROSS_SUBJECT_INTELLIGENCE.md` §2.3's "derived, never a new source of truth" principle, now stated as a pipeline-wide invariant rather than a property of one component (the Learner Profile) alone. A future engineer must never introduce a shortcut that writes a Confidence tier or Durable Mastery flag independent of recomputing it from the Attempt evidence beneath it.

---

## 4. Recommendation Pipeline

**Corrected by Defect Correction EAW-D002 (APD-013, 2026-07-18) — see `EAW-ERR-HOTFIX-001_ENGINEERING_READINESS_DEFECT_CORRECTION_REPORT.md` for full defect history.** Formalising the existing, unmodified ALI selection logic as an explicit, ordered pipeline, with three new stages (0, 4, and 5) added by this architecture:

0. **Pathway Eligibility Filter (mandatory, runs before every other stage) — every candidate is checked against AEP-002 §6's Examination Application Map for the learner's selected pathway (AEP-002 §13) before candidate generation proceeds.** A domain the learner's pathway does not test (e.g. Verbal/Non-Verbal/Spatial Reasoning for a CSSE-only learner) is excluded here, structurally, not de-prioritised later — no candidate from an ineligible domain is ever generated, let alone scored, ranked, or filtered by any later stage. This closes AEP-002 Real Gap #5 and AEP-004 §3's hard-filter requirement as an explicit pipeline stage, not merely an asserted input (the gap ERR-001 §2/§6 identified). Recommendation ordering — every stage below, and `EAW-004` §5's Tier 0–3 orchestration — operates **only** on the pathway-eligible candidate set this stage produces.
1. **Direct-evidence candidates computed first and given first claim on every slot** — the existing weak-skill override with guaranteed minimum slot (Decision 17) and cooldown-eligible sampling, entirely unchanged.
2. **Supplementary candidates computed second** — cross-subject/transfer-linked and misconception-linked suggestions (AEP-003 §12, AEP-002 §10), only for slots direct evidence has not already claimed (`ALI_CROSS_SUBJECT_INTELLIGENCE.md` §4.2's unmodified rule).
3. **Every surviving candidate is attached to a `RecommendationEvidence` record** (AIW-001 §8) — `basis`, `source_competency_code`, `relationship_strength`, and `confidence_tier` are populated for every candidate, not only the ones ultimately shown.
4. **Decision Boundaries (§2) are applied as a filter** — any candidate whose action-type is Higher Evidence Required is suppressed unless its confidence tier (and, where applicable, Durable Mastery/Readiness status) qualifies. Automatic-tier candidates pass through at any tier of Low or above.
5. **Explainability outputs are generated for whatever survives** (§5 below) — every surfaced recommendation, without exception, must leave the pipeline able to answer all three of APD-008's required questions.

---

## 5. Explainability Model

**Per Programme Decision APD-008 item 1: every educational recommendation must be able to answer three questions — what evidence supports it, why it is being shown now, and what evidence would change it.** This document defines Explainability as an **engine-level property**, not a UI mandate — the distinction matters enough to state before the mechanism itself:

- **What evidence supports this recommendation** — directly readable from `RecommendationEvidence` (AIW-001 §8): `basis`, `source_competency_code`, `relationship_strength`, `confidence_tier`.
- **Why is this recommendation being shown now** — derived from Evidence Flow (§3) timing: a cooldown window just elapsed, a mastery event on a linked competency just occurred (triggering a transfer opportunity), or a Maintenance Review became due (AEP-004 §9.2). This is new: the engine must record *the triggering event*, not only the resulting recommendation, for this question to be answerable at all.
- **What evidence would change this recommendation** — a genuinely new requirement this document introduces: the engine must be able to state its own update condition (e.g. "two more correct attempts at this competency would raise it from Moderate to High Confidence, which would unlock a stronger parent-facing claim"). This is the falsifiability the Assessment Confidence Model (AEP-005 §6) already implies but no prior document required the engine to articulate explicitly.

**The critical reconciliation this document must state plainly, because it is the single highest Invisible-Intelligence-leakage risk named in `ARR-001` §9:** Explainability by Design means the engine must always be *able* to produce all three answers, and must always log them to the Educational Audit trail (§9 below) — it does **not** mean every answer is shown verbatim to a learner, or even to a parent by default. Learner-facing surfaces remain governed entirely by `ANGEL_EXPERIENCE_MANIFESTO.md`'s Invisible Intelligence doctrine, unchanged — a child never sees "confidence_tier: moderate." Parent-facing surfaces may show a plain-language `recommendationExplanation` (AIW-001 §9), itself generated *from* these three answers but never exposing their raw field names or mechanism. Explainability is a property of what the engine can prove about itself, checked via the Educational Audit trail when needed — not a licence to narrate mechanism to families.

---

## 6. Confidence Processing

The component computing AEP-005 §6's four-tier Evidence Confidence Model from raw Attempt data (attempt count, distinct-session spread, time-gap between attempts, the question's `confidence_weight`, and any cross-context/transfer corroboration per AEP-005 §7's "evidence across contexts" principle). Restated here as a formal engine component, not a new design: it is a **pure function of existing evidence**, recomputed on read or cached, never independently stored as ground truth (§3's invariant applies directly here).

---

## 7. Mastery Processing

The engine's oldest, most battle-tested component (`ali_student_question_history.mastery_state`, `ali_mastery_defaults`) — cited as correct and entirely unmodified by this architecture. Restated formally as: one state per `(learner, question)`, aggregated to competency level for reporting, revocable (one wrong answer after mastery demotes it, Decision 20/21), and threshold-driven (`mastery_threshold`, sourced from `ali_mastery_defaults` by `content_difficulty` unless a per-question override exists). No engineering change is proposed to this component anywhere in this document.

---

## 8. Durable Mastery Processing

The engine component implementing AIW-001 §7's model: for any competency already `mastered`, this component is responsible for recognising when a Maintenance Review becomes due (the *interval* is a calibration decision left open by AEP-004 §9.2 and not specified here), evaluating the review's outcome as genuine retrieval evidence (AEP-001 §2.1, AEP-005 §7), checking transfer corroboration where a strong linked competency exists (AEP-002 §10), and updating the `durable` boolean accordingly. **This is a batch/lower-frequency component by design** — it must never sit on the real-time critical path of an active practice or mock session, consistent with this project's standing "no live server round-trips inside an exam runner" architectural decision and AIW-001 §12's performance guidance.

---

## 9. Educational Audit Integration

Every output of Mastery Processing (§7) and Durable Mastery Processing (§8), and every decision gated by the Higher Evidence Required boundary (§2), must write an `EducationalAuditRecord` (AIW-001 §10) — this is what makes Explainability (§5) and Decision Boundaries (§2) verifiable after the fact, not merely true at the moment of generation.

**A deliberate scoping decision, stated explicitly to avoid an over-engineering trap:** Automatic-tier decisions (revision recommendations, retrieval scheduling, transfer nudges, confidence-building activity selection) are **not** required to write a full audit record on every occurrence — these are high-frequency, low-stakes, and self-correcting by construction (§2), and blanket-auditing every one would produce audit volume disproportionate to the risk it manages. Audit rigor scales with decision stakes, mirroring the Decision Boundaries split itself: the higher the evidence bar a decision had to clear, the more important it is to record exactly what evidence it cleared it with.

---

## 10. Performance Considerations

- **Real-time path:** Mastery Processing (§7) and Automatic-tier recommendation generation (§2, §4) must remain synchronous and fast within an active practice/mock session — unchanged from the existing architecture's standing constraint.
- **Batch/async path:** Confidence Processing (§6), Durable Mastery Processing (§8), and Educational Audit writes (§9) are all naturally async — none require blocking a learner's active session.
- **A new consideration this document surfaces:** the Knowledge Graph (AIW-001 §2) now spans 63 competency codes across 8 domains (AEP-002 §2.6) — the Recommendation Pipeline's supplementary-candidate step (§4, stage 2) traverses this graph and should be bounded or cached rather than recomputed from scratch per request, an implementation-facing performance note flagged here because the graph's real scale was only established once AEP-002 completed, not something the original `ALI_CROSS_SUBJECT_INTELLIGENCE.md` design (written against a 2-subject graph) had reason to anticipate.

---

## 11. Security and Data Protection

- **No new personal data is introduced by any entity in this architecture.** Every new record proposed in AIW-001 (`DurableMasteryRecord`, `RecommendationEvidence`, `EducationalAuditRecord`) keys on the existing `learner_id`/`profile_id` and competency codes only — none adds a new PII field. This is stated as a checked property of the design, not an assumption: every field listed in AIW-001 §7–§10 was reviewed against this requirement while writing this document.
- **RLS posture must be decided explicitly for every new table this architecture implies, not left ambiguous** — restating AIW-001 §12's finding as a hard engineering requirement here, given this project's own real, documented history of RLS state silently drifting from what migration files claimed (`PROFILES_RLS_INVESTIGATION.md`, Phase 5B.6–5B.8). No new table under this architecture should ship without its RLS decision stated in the same migration that creates it.
- **Per-learner data isolation is a query-layer requirement for every new component** (§6, §8, §9) — the engine must never compute or expose one learner's evidence, confidence tier, or audit trail in the course of serving another's recommendation or report, consistent with the existing, unmodified access pattern for `ali_student_question_history`.
- **Recommendation explanation text (AIW-001 §9) must never leak cross-learner data** by construction, since it is generated solely from the requesting learner's own `RecommendationEvidence` — a property this document confirms by design, not one requiring a new safeguard.
- **This document does not perform or claim a formal legal/regulatory data-protection review** (e.g. UK GDPR/children's-data-specific compliance assessment) — that is a distinct exercise outside this architecture document's scope, named here so its absence is not mistaken for having been covered.

---

## 12. Engineering Outcome

*(Titled per this document's own required section list; also satisfies the Educational Outcome discipline AEP-001 §8 established, applied here to an engineering-translation document — the same four dimensions, stated in engineering terms.)*

**Understanding:** this document gives a future implementer one formal architecture for "the engine" — responsibilities, boundaries, and data flow all in one place — rather than requiring the engineering intent to be re-inferred from five educational documents and one data model independently.

**Confidence:** the Decision Boundaries table (§2) and the Explainability Model's engine-vs-UI distinction (§5) together are the direct mechanism by which families can trust Angel's stronger claims specifically *because* its weaker ones are visibly (to an auditor, if not to a parent) held to a lower, honestly-labelled bar — confidence in the system comes from the boundary being real, not from every claim sounding equally certain.

**Examination performance:** the Recommendation Pipeline's strict evidence-first ordering (§4) and the unmodified Direct Evidence principle ensure that whatever ultimately reaches a learner — Automatic or Higher-Evidence-Required — was selected because real evidence supported it, not because a plausible-sounding inference filled a gap.

**Long-term learning:** Durable Mastery Processing (§8) and the Educational Audit trail (§9) together make this engine's central promise — that a mastery claim reflects durable, evidence-checked learning, not a moment's correct answer — something the system can demonstrate on request, not merely assert once and never revisit.

---

No production code, migration, or implementation is created by this document. It is delivered for Founder review and approval before further Engineering Architecture Wave documents proceed.
