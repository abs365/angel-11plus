# EAW-ERR-HOTFIX-001: Engineering Readiness Defect Correction Report

**Document ID:** EAW-ERR-HOTFIX-001
**Programme:** Angel Excellence Programme — targeted defect correction, per APD-013
**Status:** DRAFT — awaiting programme review. **No implementation may begin until this report is reviewed and approved**, per APD-013's explicit instruction.
**Project:** Angel 11+
**Owner:** ELBOLD
**Last Updated:** 2026-07-18
**Corrects:** `EAW-002_LEARNING_INTELLIGENCE_ENGINE_ARCHITECTURE.md`, `EAW-004_RECOMMENDATION_ENGINE_ARCHITECTURE.md`, `EAW-003_ASSESSMENT_ENGINE_ARCHITECTURE.md`, `EAW-005_IMPLEMENTATION_READINESS_ARCHITECTURE.md` — all corrections below are additive, targeted, and do not reopen or redesign any approved architecture, per APD-013's instruction.

**Scope discipline stated up front:** this report corrects exactly the two verified defects `ERR-001` identified (EAW-D001, EAW-D002) and completes the three engineering actions APD-013 assigned alongside them (calibration ownership, Operational Event retention, extended verification). Nothing else in the frozen Educational Architecture or the approved Engineering Architecture Wave was touched, reopened, or reconsidered.

---

## Defect EAW-D001 — Exam-Proximity Data Source

**Defect description:** `EAW-004` §2 claimed the target-exam-date input Recommendation Orchestration's Tier 3 depends on was "implied by Pathway Selection (AEP-004 §3)." `ERR-001` §1/§2 verified, by direct search of AEP-004 §3, that this is false — Pathway Selection captures which exam board a learner is preparing for, never a date. Tier 3 therefore had no defined data source and was not implementable as specified.

**Root cause:** when `EAW-004` was written, an input was assumed to exist because it seemed like a natural extension of Pathway Selection, and the citation was never checked against what AEP-004 §3 actually specifies. This is exactly the class of error an independent review exists to catch, and did.

**Correction:** `EAW-004` §2 and a new §2.1 now define `target_exam_date` as its own explicit, optional, parent/guardian-supplied data point, captured as a distinct step immediately following Pathway Selection — never implied by it. §2.1 documents:
- **Ownership** — parent/guardian-supplied, never the child, consistent with AEP-004 §2's Parent Journey framing for administrative/scheduling data.
- **Lifecycle** — optional at first capture, single current value, editable at any time, a routine Automatic-tier update.
- **Validation rules** — must not be in the past or implausibly distant; may be checked, advisory-only, against AEP-002 §6's public-record typical exam windows, but a family's own stated date is direct evidence and is never silently overridden by that fallback.
- **Behaviour when absent** — Tier 3 simply does not activate; Tiers 0–2 continue exactly as before. Absence is never a blocker or a degradation of anything else.

**Impact analysis:** this correction is purely additive to `EAW-004` — no other tier's logic, no other document's content, and no previously-approved mechanism changed. The correction closes the gap `ERR-001` identified without requiring any redesign of Recommendation Orchestration's tier structure itself (§4–§5 of `EAW-004`), which remains exactly as approved.

---

## Defect EAW-D002 — Pathway Eligibility Filtering Not Sequenced

**Defect description:** Pathway/domain-eligibility gating (AEP-002 §13, AEP-004 §3's hard filter, closing AEP-002 Real Gap #5) was listed as a Recommendation Input in `EAW-004` §2 but was never explicitly sequenced into either the Recommendation Pipeline (`EAW-002` §4) or Recommendation Prioritisation (`EAW-004` §5). `ERR-001` §2/§6 identified this as the single most consequential gap in the wave — an implementation could technically satisfy every other contract while still allowing a CSSE-pathway learner to receive Verbal/Non-Verbal Reasoning recommendations, exactly the failure mode `EAW-005` §8 itself named as the thing to guard against.

**Root cause:** the input was correctly identified in `EAW-004` §2 but its enforcement point was never explicitly placed in either document's ordered stage list — an omission, not a contradiction, but one with real consequence given what it was meant to guard.

**Correction:** `EAW-002` §4 now begins with a mandatory **Stage 0 — Pathway Eligibility Filter**, running before every other stage (including Direct-evidence candidate generation): a candidate from a domain the learner's pathway does not test is excluded structurally, before it is ever generated, scored, or ranked — never merely de-prioritised later. `EAW-004` §5 is corrected to state explicitly that Tiers 0–3 operate **only** on the pathway-eligible candidate set this upstream stage produces, with a restated Stage 0 reference at the top of that section for clarity.

**Impact analysis:** this correction adds one new stage ahead of the existing five in `EAW-002` §4 (renumbered as Stage 0, leaving Stages 1–5 unchanged in content and order) and adds a clarifying cross-reference in `EAW-004` §5 — no existing stage's logic, ordering relative to each other, or content was altered. This directly, concretely closes the gap `EAW-005` §8 had already predicted as the highest-cost failure mode to leave open.

---

## Engineering Action 1 — Calibration Parameter Ownership

Added as new §4.1 in `EAW-005`: ownership, review milestone, and rationale assigned for the three parameters `ERR-001` §11 found deferred without an owner — Maintenance Review interval (Founder, milestone: before Durable Mastery Processing implementation), Confidence tier numeric boundaries (Founder + first implementation engineer jointly, milestone: before Confidence Processing ships), and the Examination-proximity weighting curve (Founder, milestone: gated on EAW-D001's `target_exam_date` field having accumulated real usage data first — a deliberate sequencing decision, since calibrating a curve against no real data would repeat the same class of error EAW-D001 itself was).

**Impact analysis:** purely additive to `EAW-005`; no existing section renumbered or altered in meaning.

---

## Engineering Action 2 — Operational Event Retention Strategy

Added to `EAW-003` §10: raw Operational Events retained for a bounded rolling window (diagnostics timescale, not indefinite), after which they roll up into aggregated, `learner_id`-free counts for longer-term analytics. This closes the gap `ERR-001` §8 identified (zero mentions of retention or volume anywhere in the wave) without altering the Operational Event shape itself or its distinction from a full Educational Audit Record, both of which remain exactly as approved.

**Impact analysis:** additive; introduces no new personal-data retention concern, since the aggregated form this strategy retains long-term carries no learner identifier.

---

## Engineering Action 3 — Extended Engineering Verification

Added as item 6 to `EAW-005` §3's Educational Verification Strategy: **Existing ALI Regression Validation** — a direct functional/browser confirmation that already-shipped ALI behaviour (weak-skill override, current mastery mechanism, Daily Mission, Parent Insights) remains unchanged, verified the same way every real prior ALI implementation phase in this project's history has verified it. `EAW-005` §3's closing statement is updated from five dimensions to six accordingly.

**Impact analysis:** additive; restores a discipline this project has applied consistently since its earliest ALI implementation phases, which `ERR-001` §10 found missing specifically from this wave's formal verification strategy despite being cited elsewhere in the same document.

---

## Readiness Reassessment

With both verified defects (EAW-D001, EAW-D002) corrected and all three engineering actions completed, the specific blocking condition `ERR-001`/APD-013 attached to Recommendation Engine implementation is resolved:

- `EAW-004`'s Tier 3 now has a defined, honestly-scoped data source with explicit absent-value behaviour (EAW-D001, resolved).
- Pathway eligibility filtering is now an explicit, mandatory, first-executed stage in the Recommendation Pipeline, closing the gap between what AEP-004 §3 requires and what the engineering architecture actually specified (EAW-D002, resolved).
- Calibration ownership, Operational Event retention, and existing-behaviour regression validation are now all explicitly assigned or defined, closing the three risk items `ERR-001` flagged as should-resolve-before-production (not blocking, but now closed regardless).

**Recommendation: Go.** The Conditional Go issued in `ARR-001`/`ERR-001` is upgraded to an unconditional Go for the Engineering Architecture Wave as a whole — both verified defects are corrected, targeted, and traceable to their exact originating gap, no approved architecture was reopened or redesigned beyond what correcting those defects required, and the three engineering actions close every remaining risk `ERR-001` identified as needing resolution before production.

---

Awaiting programme review. No implementation begins until this report is approved, per APD-013.
