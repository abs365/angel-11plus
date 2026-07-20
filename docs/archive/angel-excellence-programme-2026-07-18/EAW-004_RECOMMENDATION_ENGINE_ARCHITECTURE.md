# EAW-004: Recommendation Engine Architecture

**Document ID:** EAW-004
**Programme:** Angel Excellence Programme — Engineering Architecture Wave (Document 4)
**Status:** DRAFT — awaiting Founder review and approval
**Project:** Angel 11+
**Owner:** ELBOLD
**Last Updated:** 2026-07-18
**Governing documents (Version 1.0 Educational Architecture, frozen APD-007, plus the approved Engineering Architecture Wave):** `AEP-001` through `AEP-005`, `ARR-001`, `AIW-001_EDUCATIONAL_DATA_MODEL.md`, `EAW-002_LEARNING_INTELLIGENCE_ENGINE_ARCHITECTURE.md`, `EAW-003_ASSESSMENT_ENGINE_ARCHITECTURE.md` (all approved).

**Purpose:** Define the engineering architecture responsible for selecting, prioritising, and delivering educational recommendations — a second specialisation of the Learning Intelligence Engine (`EAW-002`), sibling to the Assessment Engine (`EAW-003`), both sitting on the same Evidence Flow (`EAW-002` §3) and Decision Boundaries (`EAW-002` §2). Every mechanism cited below from prior documents is restated, not redesigned, per the standing freeze (APD-007).

---

## 1. Recommendation Responsibilities

The subset of the Learning Intelligence Engine's responsibilities (`EAW-002` §1) concerned specifically with deciding *what a learner should be offered next*, whenever more than one educationally valid option exists — the Recommendation Pipeline (`EAW-002` §4) already defines how a single candidate is evidenced and filtered; this document defines how **multiple simultaneously-valid candidates are coordinated and prioritised** before one (or a small ranked set) reaches Recommendation Delivery (`EAW-003` §4). Not this engine's responsibility: generating the underlying evidence (Assessment Engine, `EAW-003`), or rendering any UI.

---

## 2. Recommendation Inputs

Every input this architecture draws on already exists in a prior document — no new evidence capture is introduced:

| Input | Source |
|---|---|
| Confidence tier per competency | `EAW-002` §6 |
| Mastery / Durable Mastery state | `EAW-002` §7/§8 |
| Knowledge Graph edges (transfer, cross-subject) | `AIW-001` §2 |
| Pathway (gates domain eligibility) | AEP-002 §13 |
| Wellbeing signal (qualitative, never a score) | AEP-005 §13, `AIW-001` §9 |
| Target exam date / proximity to it | **Corrected by Defect Correction EAW-D001 (APD-013) — see §2.1 below for the authoritative source. Not implied by Pathway Selection; captured as its own explicit, optional data point.** |

### 2.1 Target Exam Date — Authoritative Source (Defect Correction EAW-D001)

**Root defect, corrected here:** this document previously claimed the target exam date was "implied by Pathway Selection (AEP-004 §3)." It is not — Pathway Selection captures which exam board a learner is preparing for, never a specific date, and no other document in the frozen architecture defined a source for one either. Tier 3 (§5 below) therefore had no data to operate on. This section defines that source, as a targeted correction, not a redesign of Pathway Selection or of Tier 3's own logic.

- **Ownership:** `target_exam_date` is parent/guardian-supplied, captured as an explicit, optional step immediately following Pathway Selection (AEP-004 §3) — never asked of the child, consistent with AEP-004 §2's framing that administrative/scheduling details belong to the Parent Journey, not the Learner Journey.
- **Lifecycle:** optional at initial capture (a family may not yet know a specific date, particularly before a school's registration window opens); a single current value per learner, editable at any time; a change to this value is a routine, Automatic-tier update and need not itself trigger a full Educational Audit Record, though it is a reasonable candidate for a lightweight Operational Event (`EAW-003` §10) for diagnostic purposes.
- **Validation rules:** must not be in the past; must fall within a plausible window for an 11+ entry-year exam (rejected if implausibly distant, e.g. more than ~24 months out); may be checked, advisory-only, against AEP-002 §6's public-record typical exam windows for the learner's selected pathway — but a family's own stated date is direct evidence and is never silently overridden by the public-record fallback, consistent with this programme's standing Direct Evidence principle applied here to administrative data, not only educational evidence.
- **Behaviour when absent:** Tier 3 (§5) simply does not activate — Recommendation Prioritisation falls back to Tiers 0–2 exactly as they operate today, unchanged. Absence of this field must never degrade, block, or alter any other tier's behaviour; it is a purely additive enhancement, never a prerequisite.

---

## 3. Educational State Coordination

**Per Programme Decision APD-010 item 1 — an internal Educational State Model, used by the engine to coordinate recommendation behaviour. It is not a user-facing feature, and no learner or parent ever sees a state name.** Eight states, forming a cycle rather than a strict line, each derived from existing evidence signals — never an independently-stored value that could drift from the mastery/confidence/durability data beneath it:

| State | Derived from | What it coordinates |
|---|---|---|
| **Exploring** | Insufficient Evidence tier (AEP-005 §6), first or near-first contact with a competency | Favours low-stakes, Automatic-tier introduction (`EAW-002` §2), consistent with Baseline Assessment's low-stakes design (AEP-005 §2) |
| **Building Knowledge** | Low Confidence, below `mastery_threshold` | Favours continued Formative practice (AEP-005 §3) |
| **Practising** | Low-to-Moderate Confidence, approaching threshold | Favours retrieval-practice recommendations, unchanged ALI selection logic |
| **Reinforcing** | Threshold met inconsistently, or Moderate Confidence not yet stable | Favours spaced retrieval (AEP-001 §2.2) over new content |
| **Mastered** | `mastery_state = "mastered"` (`EAW-002` §7, unchanged mechanism) | Eligible for Confidence-Building and Transfer recommendations (§4 below) |
| **Durably Mastered** | `durable = true` (`EAW-002` §8, `AIW-001` §7) | Eligible to feed Grammar School Readiness evidence (AEP-005 §13); lowest recommendation priority for further practice of this specific competency |
| **Reviewing** | A Maintenance Review has become due (AEP-004 §9.2) for a Mastered/Durably Mastered competency | Favours a targeted retrieval check, per `EAW-003` §7's "a Maintenance Review is itself a form of assessment" |
| **Rebuilding** | A Maintenance Review (or any post-mastery attempt) failed — `mastery_state` was revoked (Decision 20/21, unchanged) | Returns the competency to Practising/Reinforcing-style recommendation behaviour — the concrete engineering instance of AEP-004 §1's "mastery is not permanent" |

**Educational State must always remain evidence-driven and revisable, by construction:** every state above is a label computed from the evidence already flowing through Evidence Evaluation (`EAW-003` §4) — recomputed whenever that evidence changes, never set independently. A state transition into Mastered, Durably Mastered, or Rebuilding is exactly the kind of conclusion the Educational Decision Lifecycle's "Decision Confirmation or Revision" stage (`EAW-003` §4) governs, and — per the Decision Boundaries (`EAW-002` §2) — a transition into Mastered or Durably Mastered specifically remains Higher Evidence Required, unchanged from every prior document's treatment of those two conclusions.

---

## 4. Recommendation Orchestration

**Per Programme Decision APD-010 item 2 — balancing curriculum progression, confidence building, retrieval practice, learning transfer, wellbeing, and examination readiness whenever multiple valid recommendations compete for the same slot.** These six factors are not weighted equally against one another; they sit in an explicit tier structure, consistent with every priority rule this programme has already established:

- **Wellbeing is not one factor among six — it is a non-negotiable ceiling**, exactly as AEP-001 §2.9/§2.10 already establish. No combination of curriculum-progression urgency, transfer opportunity, or examination-readiness pressure may ever cause a recommendation that the Wellbeing signal (§2 above) flags as inappropriate to be surfaced. This applies with **greater**, not lesser, force as an exam date approaches — the single most likely real-world pressure to tempt a violation of this ceiling is exam proximity, and this document states explicitly that proximity may never be used to justify overriding it.
- **Curriculum progression, retrieval practice, and confidence building** are substantially already handled by ALI's existing, unmodified selection mechanism (weak-skill override with guaranteed slot, cooldown-driven spacing) — the Direct Evidence tier (`EAW-002` §4, stage 1) that always claims slots first.
- **Learning transfer** is the existing Supplementary candidate tier (`EAW-002` §4, stage 2) — fills only slots direct evidence hasn't already claimed.
- **Examination readiness** is formalised here as a **weighting modifier**, not a new candidate source: as a learner's target exam date (§2) approaches, candidates more closely resembling Summative/format-fluency practice (AEP-005 §4, the still-open per-board format work) should be weighted more favourably relative to purely exploratory or curiosity-driven content (AEP-001 §2.11) — but this reweighting operates **only within** Tier 1/2's existing evidence-ranked ordering, and never bypasses the Wellbeing ceiling above it.

---

## 5. Recommendation Prioritisation

**Corrected by Defect Correction EAW-D002 (APD-013) — Tiers 0–3 below operate exclusively on the pathway-eligible candidate set produced by `EAW-002` §4's Stage 0 (Pathway Eligibility Filter), which runs before any tier in this section and is mandatory, not optional.** The concrete ordering this architecture produces, layering Educational State (§3) and Orchestration (§4) onto the existing Recommendation Pipeline (`EAW-002` §4) without altering that pipeline's own mechanism:

**Stage 0 (upstream, `EAW-002` §4, restated here for clarity, not redefined):** Pathway Eligibility Filter — every candidate is confirmed valid for the learner's selected pathway (AEP-002 §6/§13) before Tier 0 ever sees it. A domain the pathway doesn't test never reaches this section at all.

**Tier 0 — Wellbeing filter (absolute veto, always applied first among Tiers 0–3):** any candidate inconsistent with the current Wellbeing signal is removed before any other tier is considered.

**Tier 1 — Direct evidence (unchanged mechanism, always claims slots first):** weak-skill remediation, cooldown-eligible retrieval scheduling — driven by Educational State's Practising/Reinforcing/Rebuilding labels.

**Tier 2 — Supplementary, evidence-ranked (fills only unclaimed slots):** transfer opportunities, confidence-building resurfacing of Mastered/Durably Mastered competencies — driven by Educational State's Mastered/Durably Mastered labels and the Knowledge Graph (`AIW-001` §2).

**Tier 3 — Examination-readiness reweighting (a modifier applied within Tiers 1–2, never a bypass of Tier 0):** as exam proximity increases, Tier 1/2 candidates resembling the target board's actual format (per AEP-002 §6) are weighted upward relative to purely exploratory ones.

---

## 6. Explainability Integration

Applying `EAW-003` §8's three-audience model to an orchestrated recommendation specifically: the "why now" answer (`EAW-002` §5) for a recommendation boosted by Tier 3's examination-readiness weighting is now partly a function of exam proximity, not only of the underlying competency evidence — e.g., the Engineering/Audit tier would show `orchestration_factor: "exam-proximity-weighted"` alongside the existing evidence fields; the Learner tier still shows nothing beyond encouraging, age-appropriate framing; the Parent tier may reasonably say "with the exam approaching, we're focusing a little more on practice that matches the real test format" — plain-language orchestration reasoning, still never exposing Educational State labels or tier mechanics by name.

---

## 7. Parent Recommendation Support

Extending `AIW-001` §9/§12's Parent tier: a parent should be able to understand not only *why this recommendation*, but, where genuinely relevant, *why this one rather than another valid option* — the concrete instance of `EAW-002` §5's "what would change it" question applied to competing candidates. This is answerable directly from Recommendation Orchestration's own tier structure (§5) without exposing it: "your child is showing strength in several areas right now — we picked Percentages because it connects to their recent progress in Fractions" is a legitimate Parent-tier explanation grounded in real Tier 2 transfer evidence, phrased entirely in plain educational language.

---

## 8. Operational Events

Extending `EAW-003` §10's model: Educational State transitions (§3) that stay within the Automatic decision boundary (Exploring → Building Knowledge → Practising → Reinforcing, and Reviewing when it does not result in revocation) emit a lightweight Operational Event only, consistent with their Automatic classification (`EAW-002` §2/§9). **Transitions into or out of Mastered, Durably Mastered, or Rebuilding remain Higher Evidence Required and continue to write a full `EducationalAuditRecord`** (`EAW-002` §9, unchanged) — Educational State's new vocabulary does not alter which conclusions require the heavier record, it only names the states more precisely.

---

## 9. Security and Privacy

Cited unchanged from `EAW-002` §11 / `EAW-003` §11. Educational State (§3) introduces no new personal data — it is a derived label, never independently stored as a fact separate from the evidence it summarises, consistent with the "derived, not a new source of truth" invariant this programme has held since `ALI_CROSS_SUBJECT_INTELLIGENCE.md` §2.3. The new exam-proximity input (§2) requires only a target exam date already implied by Pathway Selection (AEP-004 §3) — no new personal data category is introduced by Recommendation Orchestration.

---

## 10. Engineering Outcome

**Understanding:** this document gives the engine a coherent way to decide *among* multiple valid recommendations, not only how to evidence a single one — closing a gap the Recommendation Pipeline (`EAW-002` §4) always implied but never formalised.

**Confidence:** Wellbeing's explicit, non-negotiable ceiling status (§4) — stated to apply with *greater* force as exam pressure rises, not less — is the direct mechanism protecting families from exactly the failure mode real exam pressure most often produces elsewhere: optimising for score at the cost of a child's wellbeing.

**Examination performance:** Tier 3's exam-proximity reweighting (§5) ensures recommendation priority genuinely shifts toward format-relevant practice as the real exam approaches, without ever compromising the evidence-first ordering (Tiers 0–2) that ensures the content being prioritised is actually warranted.

**Long-term learning:** Educational State's Reviewing/Rebuilding pair (§3) gives the engine explicit, named coordination for exactly the case AEP-004 §1 identifies as most important not to silently miss — a competency that was once mastered and has since decayed — ensuring it re-enters active practice rather than being assumed permanently settled.

---

No production code, migration, or implementation is created by this document. It is delivered for Founder review and approval before further Engineering Architecture Wave documents proceed.
