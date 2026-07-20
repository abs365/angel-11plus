# EAW-003: Assessment Engine Architecture

**Document ID:** EAW-003
**Programme:** Angel Excellence Programme — Engineering Architecture Wave (Document 3)
**Status:** DRAFT — awaiting Founder review and approval
**Project:** Angel 11+
**Owner:** ELBOLD
**Last Updated:** 2026-07-18
**Identifier note (per APD-009):** `AIW-001_EDUCATIONAL_DATA_MODEL.md` remains the official document identifier for that deliverable and is not renamed retrospectively; "EAW" is the official wave name for all documents from `EAW-002` onward.
**Governing documents (Version 1.0 Educational Architecture, frozen APD-007):** `AEP-001` through `AEP-005`, `ARR-001`, `AIW-001_EDUCATIONAL_DATA_MODEL.md`, `EAW-002_LEARNING_INTELLIGENCE_ENGINE_ARCHITECTURE.md` (all approved).

**Purpose:** Define the engineering architecture supporting educational assessment specifically — the Assessment Engine is a specialisation of the Learning Intelligence Engine (`EAW-002`), not a separate engine, scoped to AEP-005's assessment concerns (Baseline/Formative/Summative/Adaptive assessment, Mastery and Durable Mastery validation, Grammar School Readiness evidence). Every mechanism cited from EAW-002/AIW-001 below is restated, not redesigned, per the standing freeze (APD-007).

---

## 1. Assessment Engine Responsibilities

The subset of the Learning Intelligence Engine's responsibilities (`EAW-002` §1) specific to assessment: administering the four assessment forms (§2 below), computing Assessment Confidence (`EAW-002` §6), validating mastery claims before they may enter Decision Generation (§6 below), processing Durable Mastery (§7), and producing the evidence Grammar School Readiness Assessment (AEP-005 §13) depends on. **Not** the engine's responsibility: authoring assessment content, defining per-board mock formats (the still-open AEP-002 Real Gap #6), or rendering any UI — identical scoping discipline to `EAW-002` §1, applied here to the assessment domain specifically.

---

## 2. Assessment Lifecycle

The four assessment forms AEP-005 §2–§5 already define, restated as the lifecycle a learner moves through over time (distinct from the Educational Decision Lifecycle in §4, which governs each individual conclusion, not the learner's overall assessment journey):

**Baseline** (once, at onboarding, low-stakes by design — AEP-005 §2) → **Formative** (continuous, day-to-day Practice, AEP-005 §3) → **Adaptive** (between-mock personalisation drawing on Formative evidence, AEP-005 §5) → **Summative** (periodic, full mock exams, AEP-005 §4) → feeding back into Formative for the next cycle. This is not a one-way progression — a learner returns to Formative assessment after every Summative event, consistent with AEP-004 §1's Continuous Learning Architecture (mastery is not permanent, the outer loop never terminates).

---

## 3. Evidence Collection Pipeline

Restating `AIW-001` §5 (Assessment Evidence Model) as an engineering pipeline stage: every graded, machine-checked Attempt enters this pipeline; nothing else does. **A concrete validation rule this document makes explicit, extending AEP-005 §8's distinction into pipeline behaviour:** a self-reported activity (Vocabulary's flashcard "I knew it" click) must be structurally prevented from entering this pipeline as mastery-relevant evidence — not merely documented as lesser evidence, but excluded at the collection stage itself, so no downstream component can accidentally treat it as equivalent to a graded answer.

---

## 4. Educational Decision Lifecycle

**Per Programme Decision APD-009 item 1 — the formal, general-purpose lifecycle every educational decision moves through, instantiated here in the Assessment Engine's context.** Each stage maps onto a component `EAW-002` already defined, formalised into one named cycle rather than left as an implied sequence:

| Stage | What happens | Maps to |
|---|---|---|
| **Evidence Collection** | A graded Attempt is recorded | §3 above, `AIW-001` §5 |
| **Evidence Evaluation** | Mastery state and Confidence tier are (re)computed from accumulated evidence | `EAW-002` §6/§7 |
| **Decision Generation** | A conclusion (mastery, a recommendation, a readiness dimension) is proposed, filtered through the Decision Boundaries (`EAW-002` §2) | `EAW-002` §4 |
| **Explainability Generation** | The three required answers (what evidence, why now, what would change it) are produced | `EAW-002` §5 |
| **Recommendation Delivery** | The decision reaches its audience, rendered per the audience-specific rules (§8 below) | New, formalised in this document |
| **Learner Response** | The learner acts — attempts the recommended content, engages with a mock, or does not | New — the point this lifecycle closes the loop rather than terminating |
| **Evidence Update** | The learner's response becomes new evidence, re-entering Evidence Collection | Loops back to the top of this table |
| **Decision Confirmation or Revision** | The original conclusion is checked against the new evidence — confirmed if consistent, revised if not, written to the Educational Audit trail either way (`AIW-001` §10) | Ties directly to AEP-003 §14's "Flagged for Review" concept and `EducationalAuditRecord.superseded_by` |

**Educational decisions must always remain revisable — this is the lifecycle's defining property, not an edge case.** No stage in this table is a terminal state; every decision that reaches Confirmation or Revision has, by construction, already re-entered the cycle rather than exiting it. This is the formal statement of what AEP-004 §1 established informally ("mastery is not permanent") and what `AIW-001` §10's `superseded_by` field was built to record.

---

## 5. Confidence Processing

Cited unchanged from `EAW-002` §6. One assessment-specific note: Baseline Assessment (AEP-005 §2) will characteristically produce Insufficient or Low Confidence tiers on its very first pass through this component, by design — this is correct behaviour, not a defect in Confidence Processing, and no future tuning of this component should treat a Baseline session's low tier as something to be corrected upward artificially.

---

## 6. Mastery Validation

The gate a mastery conclusion must clear before it may proceed to Decision Generation (§4's second stage): the existing `mastery_threshold` mechanism (`EAW-002` §7, unchanged) **and** a Confidence tier of at least Moderate (AEP-005 §9's Mastery Decision rule). A threshold-meeting result at Low Confidence (e.g. from a highly guessable question format) does not clear this gate for downstream purposes such as Parent Reporting or Readiness Assessment — restated here as a formal validation step in the pipeline, not merely a documented distinction.

---

## 7. Durable Mastery Processing

Cited unchanged from `EAW-002` §8 / `AIW-001` §7. One clarification worth making explicit in this assessment-specific document: **a Maintenance Review is itself a form of assessment** — genuine retrieval evidence gathered after a deliberate gap (AEP-004 §9.2) — which is why Durable Mastery Processing belongs conceptually inside the Assessment Engine rather than being a purely separate maintenance mechanism; it is the Assessment Lifecycle (§2) reaching back into previously-mastered content, not a different kind of activity.

---

## 8. Explainability Integration

**Per Programme Decision APD-009 item 2 — three distinct explainability audiences, refining (not contradicting) `EAW-002` §5's engine-vs-UI distinction into three explicit tiers:**

| Audience | Content rules | Concrete example, same underlying conclusion |
|---|---|---|
| **Learner** | Age-appropriate, encouraging, educational — governed entirely by `ANGEL_EXPERIENCE_MANIFESTO.md`'s Invisible Intelligence doctrine | "You've been getting these right again and again — nice work!" |
| **Parent** | Plain English, educational reasoning, clear recommendation rationale — the `recommendationExplanation` field (`AIW-001` §9), confidence-calibrated per AEP-005 §12 | "Your child has answered Percentages questions correctly across several separate sessions, including one after a two-week break — a strong, well-evidenced sign of real understanding." |
| **Engineering / Audit** | Full evidence, confidence level, decision traceability — the raw `RecommendationEvidence` and `EducationalAuditRecord` fields (`AIW-001` §8/§10) | `{ basis: "direct-evidence", confidence_tier: "high", competency: "maths.percentages", supporting_attempts: [...], last_maintenance_review: {...} }` |

**Reconciling this with `EAW-002` §5:** that document's binary (engine-internal vs. UI-facing) maps directly onto this three-tier model — "engine-internal" is exactly the Engineering/Audit tier here, and "UI-facing" was always implicitly two different things (a child never sees what a parent may see) that this document now names explicitly rather than leaving as an implicit distinction. No prior guidance is superseded; this is the same rule, formalised.

---

## 9. Parent Reporting Integration

Cited unchanged from `AIW-001` §9 (the `ParentReport` shape, `durablyMastered`, `recommendationExplanation`, `wellbeingSignal` fields). This document's contribution is confirming that every field surfaced to a parent is rendered through the Parent audience tier (§8) specifically — never the raw Engineering/Audit tier's fields, and never a downgraded version of the Learner tier's language (a parent is not a child, and plain-English educational reasoning, per APD-009, is a distinct register from either).

---

## 10. Operational Events

**Per Programme Decision APD-009 item 3 — new in this document.** Automatic-tier educational decisions (`EAW-002` §2/§9) do not require a full `EducationalAuditRecord` on every occurrence, but they must not go entirely unrecorded either: they emit a lightweight **Operational Event** for monitoring, diagnostics, and analytics purposes.

```
OperationalEvent {
  event_type: string        // e.g. "cooldown-recommendation-generated", "transfer-nudge-shown"
  learner_id, competency_code
  timestamp
}
```
*(Illustrative shape only — no table is created by this document.)*

**Retention strategy (Engineering Action 2, APD-013, added by `EAW-ERR-HOTFIX-001`):** ERR-001 §8 found this component had no defined retention or volume-management approach despite being explicitly high-frequency by design. Corrected here, additively: raw Operational Events are retained for a bounded rolling window sufficient for near-term diagnostics (on the order of weeks, not indefinitely), after which they are rolled up into aggregated counts per `event_type`/competency/time-bucket for longer-term analytics trend purposes — the per-event, per-learner granularity is not retained indefinitely, only the aggregate. This keeps the component's own "lightweight" design intent honest at scale, and introduces no new personal-data retention concern beyond what was already reviewed in §11, since aggregated counts carry no `learner_id`.

**The distinction from an Educational Audit Record, stated precisely so the two are never confused:** an Operational Event answers "did this happen, when, and how often" for monitoring purposes — it carries no evidence trail, no confidence tier, no explainability payload, and is not the record §4's Decision Confirmation/Revision stage writes to. An Educational Audit Record answers "was this conclusion justified, and by what" — it is heavier by design, and reserved for Higher Evidence Required decisions specifically (`EAW-002` §9, unchanged). Not every internal computation needs even an Operational Event — only those that result in a learner- or parent-facing action are worth recording at this lighter tier at all; a Confidence tier recompute that changes nothing observable needs neither an Operational Event nor an Audit Record.

---

## 11. Security Architecture

Cited unchanged from `EAW-002` §11 — no new personal data, explicit per-table RLS decisions required, per-learner query isolation, no formal legal/regulatory compliance claim made here. One addition specific to this document's new entity: **Operational Events (§10) must be checked against the same no-new-PII discipline** — the illustrative shape above carries only `learner_id`, a competency code, an event type string, and a timestamp, none of which introduce new personal data beyond what `ali_student_question_history` already implies. Baseline Assessment (§2, AEP-005 §2) deserves one explicit mention here as the single most data-sparse, most uncertain point in a learner's whole journey — any future engineering of it should collect the minimum needed to seed Confidence Processing (§5) and nothing more, consistent with AEP-005 §2's own low-stakes-by-design framing.

---

## 12. Engineering Outcome

**Understanding:** this document gives assessment specifically — the part of the whole engine most directly tied to exam outcomes — its own formal lifecycle and audience model, so a future implementer building assessment features has one coherent reference rather than needing to assemble it from AEP-005 and EAW-002 independently.

**Confidence:** the three-audience Explainability model (§8) makes concrete exactly what a parent is and isn't told at every stage of the Educational Decision Lifecycle (§4) — confidence in the system comes from this being a designed, consistent boundary, not an incidental one.

**Examination performance:** Mastery Validation's explicit gate (§6) and Durable Mastery Processing's recognition of Maintenance Reviews as genuine assessment (§7) together ensure that a claim feeding into Grammar School Readiness Assessment (AEP-005 §13) reflects evidence that has actually been validated through this pipeline, not evidence that merely exists somewhere in the system.

**Long-term learning:** the Educational Decision Lifecycle's insistence that every decision remains revisable (§4) is the assessment engine's own structural guarantee against exactly the failure mode AEP-001 §2.2 warns of — a conclusion reached once and never re-checked would silently assume durability that was never actually verified.

---

No production code, migration, or implementation is created by this document. It is delivered for Founder review and approval before further Engineering Architecture Wave documents proceed.
