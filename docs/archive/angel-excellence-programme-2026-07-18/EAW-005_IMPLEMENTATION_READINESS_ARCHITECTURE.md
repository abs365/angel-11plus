# EAW-005: Implementation Readiness Architecture

**Document ID:** EAW-005
**Programme:** Angel Excellence Programme — Engineering Architecture Wave (Document 5)
**Status:** DRAFT — awaiting programme review
**Project:** Angel 11+
**Owner:** ELBOLD
**Last Updated:** 2026-07-18
**Governing documents (Version 1.0 Educational Architecture, frozen APD-007, plus the approved Engineering Architecture Wave):** `AEP-001` through `AEP-005`, `ARR-001`, `AIW-001_EDUCATIONAL_DATA_MODEL.md`, `EAW-002`, `EAW-003`, `EAW-004` (all approved).

**Purpose:** Prepare the Engineering Architecture Wave for transition into implementation — the capstone document defining what every engineering component is contractually bound to, and how implementation will be verified before it is considered complete. This document authorises nothing to be built by itself; it defines what "done correctly" means for whatever is built next.

---

## 1. Engineering Contracts

**Per Programme Decision APD-011 item 1 — every engineering component shall declare five things.** This section defines the pattern once; §2 instantiates it against every real component this wave has specified:

| Contract element | What it captures |
|---|---|
| **Required evidence** | What data must already exist before this component may act at all |
| **Permitted educational decisions** | Which conclusions this component may produce, and at which Decision Boundary tier (`EAW-002` §2) |
| **Expected outputs** | The concrete data shape produced, citing `AIW-001` where one is already defined |
| **Explicit constraints** | Standing rules from the frozen educational architecture this component must always honour |
| **Behaviour it must never perform** | The specific failure mode this contract exists to prevent |

**Why contracts, and why now:** five documents of educational architecture and three of engineering architecture have each, correctly, cited and preserved what came before rather than redesigning it (`ARR-001` §5's finding: zero lines of any prior document altered). Contracts are how that discipline is made checkable against an actual implementation, rather than remaining something only demonstrable by re-reading every prior document each time.

---

## 2. Educational Contracts

Each component instantiated against §1's pattern:

| Component | Required evidence | Permitted decisions | Expected outputs | Explicit constraints | Must never |
|---|---|---|---|---|---|
| **Confidence Processing** (`EAW-002` §6) | ≥1 recorded Attempt for the competency | Compute (not assert) an Evidence Confidence tier | A recomputable tier value, never independently stored (§3's invariant) | Must recompute from Attempt evidence only | Store a tier as ground truth independent of the evidence beneath it |
| **Mastery Processing** (`EAW-002` §7) | Distinct-session correct attempts meeting `mastery_threshold` | Automatic evidence tracking; the mastery conclusion itself is Higher Evidence Required | `mastery_state` transition, unchanged mechanism | Never award mastery from fewer than the configured distinct sessions | Award mastery from a single correct answer (AEP-001 §1, restated as a hard contract term) |
| **Durable Mastery Processing** (`EAW-002` §8) | `mastery_state = mastered` + a completed Maintenance Review | Higher Evidence Required | `durable: boolean`, `AIW-001` §7 shape | Must never run on the real-time session path | Mark durable without a genuine post-gap retrieval check |
| **Educational State Coordination** (`EAW-004` §3) | Confidence tier + mastery/durability signals | Internal coordination only — never itself a user-facing conclusion | A derived state label | Must remain fully derived, never independently stored | Surface a state name to a learner or parent |
| **Recommendation Pipeline** (`EAW-002` §4) | Direct evidence computed before any supplementary candidate | Automatic and (where confidence qualifies) Higher-Evidence-Required recommendations | `RecommendationEvidence` records, `AIW-001` §8 | Direct evidence always claims slots first | Let a supplementary (transfer/cross-subject) candidate bump a direct-evidence remediation |
| **Recommendation Orchestration** (`EAW-004` §4–§5) | Wellbeing signal + Tier 1/2 candidate set | Reweight within Tiers 1–2 only | A prioritised candidate ordering | Wellbeing is an absolute veto, exam-proximity may never override it | Increase recommendation intensity because an exam is approaching, at the cost of the Wellbeing ceiling |
| **Explainability Model** (`EAW-002` §5, `EAW-003` §8) | A generated recommendation or conclusion | Produce three audience-appropriate answers | Learner / Parent / Engineering-Audit tiered text | Learner tier never exposes mechanism; Parent tier never exposes raw fields | Show a confidence tier, competency code, or "algorithm" language to a learner |
| **Educational Audit Integration** (`EAW-002` §9) | Any Higher-Evidence-Required conclusion | Write, never silently overwrite | `EducationalAuditRecord`, `AIW-001` §10 | Superseding a record requires a stated reason | Delete or mutate a prior audit record instead of superseding it |
| **Operational Events** (`EAW-003` §10) | Any Automatic-tier decision resulting in an observable action | Lightweight logging only | `OperationalEvent`, no evidence payload | Must never substitute for a required Audit Record | Use an Operational Event to record a Higher-Evidence-Required conclusion |

---

## 3. Educational Verification Strategy

**Per Programme Decision APD-011 item 2 — implementation is not complete until all five dimensions are verified. Mapping each to how it is actually checked, using this project's own established, real (not merely typed) verification precedent:**

1. **Technical correctness** — does the code do what its contract (§2) specifies. Verified the way this project has consistently verified prior ALI work: real functional checks against actual logic (this project's established `npx tsx` pure-function-script technique, run and discarded, not merely `tsc --noEmit`), not type-checking alone.
2. **Educational correctness** — do the system's actual conclusions match the evidence rules AEP-001–005 specify (mastery never from one answer, interleaving applied per AEP-001 §2.3's subject-dependency, Durable Mastery requiring a genuine post-gap check). Verified via scenario-based simulation against realistic student histories — the same technique already proven in this project's own Phase 1.1 validation (multiple personas driven through real logic end-to-end), extended here to cover Educational State transitions (`EAW-004` §3) and Orchestration tiering (`EAW-004` §5).
3. **Explainability** — can every surfaced recommendation answer the three required questions (`EAW-002` §5) at the correct audience tier (`EAW-003` §8), with no leakage between tiers. Verified by generating all three audience outputs for a representative sample of real decisions and checking the Learner and Parent tiers never contain a competency code, a confidence tier name, or mechanism language.
4. **Trust** — does confidence-calibrated language (AEP-005 §11/§12) actually match its underlying evidence tier, never overclaiming. Verified by an explicit language audit: every parent- or learner-facing copy template is checked against the Evidence Confidence tier(s) it is permitted to render under, and any template capable of rendering under a tier stronger than its wording implies is a defect.
5. **Wellbeing protection** — does no code path allow Recommendation Orchestration's Tier 0 (`EAW-004` §5) to be bypassed, including under exam-proximity pressure. Verified by adversarial scenario testing deliberately constructed to maximise pressure toward violating it (a learner with several weak competencies and an imminent exam date) and confirming the ceiling still holds — the same "does the guarantee survive a hard case" discipline this project used to validate Decision 17's guaranteed weak-skill slot.

**Added by Engineering Action 3 (APD-013, `EAW-ERR-HOTFIX-001`):**

6. **Existing ALI regression validation** — does this implementation leave every already-shipped ALI behaviour (the weak-skill override, the current mastery mechanism, Daily Mission, Parent Insights) genuinely unchanged. Verified the same way every prior real ALI implementation phase in this project's history has verified it: a direct functional/browser check confirming existing behaviour before and after, not assumed from passing new-code tests alone. This restores a discipline this project has applied consistently since Slice 1, which ERR-001 §10 found missing from this strategy's original five-dimension framing.

**A mapping worth stating explicitly, since this document's own 10-section structure does not give Explainability and Wellbeing protection a separate numbered section later:** Explainability verification is exercised concretely within §2's Explainability Model contract and this section's item 3; Wellbeing protection is exercised within §2's Orchestration contract and this section's item 5. §6–§8 below deep-dive Security, Performance, and Educational Fidelity specifically, because those three carry the most implementation-specific validation detail — this is a scoping choice, not an omission of the other two dimensions from the overall strategy.

**Implementation is not considered complete until all six dimensions pass** (five original plus Existing ALI Regression Validation, added per Engineering Action 3) **— not five of six, and not a technically-correct implementation that is educationally wrong, or vice versa.**

---

## 4. Implementation Principles

Consolidating the standing principles a future implementation must follow, all already established, none newly invented here:

- **Additive-only migrations** — nullable → backfilled → `NOT NULL`, matching this project's own migration 007 precedent (`AIW-001` §11).
- **Derived, never a new source of truth** — every computed signal (Confidence tier, Educational State, Durable Mastery flag) is recomputed from underlying evidence, never independently persisted as ground truth (`ALI_CROSS_SUBJECT_INTELLIGENCE.md` §2.3's standing invariant, restated throughout this wave).
- **Do not automate metadata generation** — misconception mapping (AEP-003 §4) and transfer-link tagging (AEP-003 §7) remain human-authored, following this project's standing precedent since Decision 3.
- **One component at a time** — mirroring ALI's own proven "one subject at a time" rollout discipline, applied here to component-by-component implementation (e.g. Confidence Processing validated and stable before Durable Mastery Processing is built on top of it), rather than a single large simultaneous build.
- **Real functional verification over type-checking alone** — restated from §3 item 1 as a general implementation principle, not only a verification-strategy detail.

### 4.1 Calibration Parameter Ownership (Engineering Action 1, APD-013)

ERR-001 §11 found three load-bearing numeric parameters deferred across the wave with no owner or resolution process ever assigned. Assigned here, as a targeted addition, not a reopening of any prior document's design:

| Parameter | Owner | Review milestone | Rationale |
|---|---|---|---|
| Maintenance Review interval (AEP-004 §9.2, `EAW-002` §8) | Founder (product/pedagogical calibration decision) | Before Durable Mastery Processing (`EAW-002` §8) is implemented | Requires either real usage-volume data or a reasoned interim default — recommend an explicit interim placeholder (e.g. on the order of 2–3 weeks, loosely consistent with spaced-retrieval literature ranges cited in AEP-001 §2.2) stated openly as provisional, not presented as a calibrated finding, until real data justifies adjustment |
| Confidence tier numeric boundaries (AEP-005 §6) | Founder + first implementation engineer, jointly | Before Confidence Processing (`EAW-002` §6) ships to production | Should be derived from the existing, already-calibrated `mastery_threshold`/`ali_mastery_defaults` values (`QUESTION_AUTHORING_STANDARD.md` §8) as a starting point rather than invented independently, then adjusted once real attempt-volume distributions exist |
| Examination-proximity weighting curve (`EAW-004` §4–§5) | Founder | Once `target_exam_date` (§2.1 of `EAW-004`, added by EAW-D001's correction) has real usage data — i.e., once families have actually begun entering dates | Premature specification risks calibrating against no real behavioural data at all; this parameter is explicitly gated on EAW-D001's fix having shipped and accumulated real input first |

---

## 5. Data Migration Strategy

Restating `AIW-001` §11's Migration Impact as a sequenced plan, not a new design: (1) additive nullable columns on `ali_question_bank` (`addresses_misconception`, `transfer_links`) and NVR/Spatial/Mathematical Reasoning bank population — lowest risk, no dependency on anything else in this wave; (2) Durable Mastery and Educational Audit tables — depend only on existing `ali_student_question_history`; (3) Recommendation Evidence and Operational Event structures — depend on the Knowledge Graph (`AIW-001` §2) being populated at the scale AEP-002 established (63 competencies). **Every migration step must include an explicit schema-cache-reload verification**, per the real, documented precedent in `ALI_OPERATIONAL_VALIDATION.md` (Phase 5B.8) — this is restated as a required runbook step, not an optional precaution, given it has already caused a real (if low-impact) issue once in this project's history.

---

## 6. Security and Privacy Validation

Operationalising `EAW-002` §11 / `EAW-003` §11 / `EAW-004` §9 into a checklist: (1) a per-new-table RLS policy decision stated explicitly in the same migration that creates it — never left to a default, given this project's own real, documented RLS-drift incident (`PROFILES_RLS_INVESTIGATION.md`); (2) a no-new-PII confirmation for every new entity, re-verified at implementation time against the design-time claim already made in `AIW-001`/`EAW-002`–`004`; (3) a per-learner query-isolation check confirming no new component can read or aggregate across learners inadvertently; (4) explicit confirmation that this remains an architecture-level checklist, not a substitute for a formal legal/regulatory data-protection review, which stays out of scope here as stated in `EAW-002` §11.

---

## 7. Performance Validation

Operationalising `EAW-002` §10 / `EAW-004`'s real-time-vs-batch split into concrete checks: (1) confirm Mastery Processing and Automatic-tier recommendation generation remain synchronous and within the existing session-latency budget — no new component may be inserted onto this path without being shown not to regress it; (2) confirm Confidence Processing, Durable Mastery Processing, and Educational Audit writes genuinely execute asynchronously and never block an active session; (3) confirm the 63-competency Knowledge Graph traversal (`EAW-002` §10's flagged concern) is bounded or cached in the actual implementation, not recomputed from scratch per request — this is the one performance item this wave flagged as a real, scale-driven risk rather than a restated precaution.

---

## 8. Educational Fidelity Validation

The specific acceptance check that a built system's actual conclusions match what AEP-001–005 specify — the concrete implementation-time execution of §3 item 2, and where genuinely open handoffs from prior documents (per-pathway domain gating, AEP-004 §3; the still-open format-fluency gap, AEP-002 Real Gap #6) must be checked against their originating requirement, not against a re-derived approximation of it. A build that technically implements Confidence Processing correctly but silently allows a CSSE-pathway learner to receive Verbal Reasoning recommendations has failed Educational Fidelity Validation regardless of passing every other check — this is named explicitly because it is precisely the kind of defect that is invisible to purely technical testing.

---

## 9. Release Readiness Criteria

Implementation is release-ready only when, together: every component's Educational Contract (§2) is satisfied by the built code; all five Verification dimensions (§3) pass; the Data Migration Strategy (§5) has executed with schema-cache-reload explicitly confirmed; Security and Privacy Validation (§6) is clear; Performance Validation (§7) is clear; and Educational Fidelity Validation (§8) is clear. **Any deviation discovered during implementation from the frozen Version 1.0 Educational Architecture (APD-007) must return to a formal programme decision — it is never an engineer's call to silently resolve a conflict between what the architecture specifies and what proved convenient to build.** This restates, at the release gate specifically, the same discipline the freeze itself already established.

---

## 10. Engineering Outcome

**Understanding:** this document turns four documents' worth of architecture (`EAW-002`–`004`, `AIW-001`) into a checkable set of contracts and a defined verification bar — an implementer now has a specific "done" to build toward, not an open-ended interpretation of prior prose.

**Confidence:** the five-dimension Verification Strategy (§3), especially Trust and Wellbeing protection sitting alongside Technical correctness as equally mandatory, is the direct mechanism ensuring a future implementation cannot be considered complete while quietly failing the families this whole programme exists to serve — however clean its code is.

**Examination performance:** Educational Fidelity Validation's explicit named check against pathway-gating and format-fluency (§8) protects the two handoffs most directly tied to real exam outcomes from being silently lost in translation between architecture and code.

**Long-term learning:** the Release Readiness gate's requirement that any architectural deviation return to a formal programme decision (§9) is what keeps this entire five-plus-six-document body of evidence-based reasoning binding on the actual product over time, rather than becoming documentation that implementation quietly drifts away from.

---

No production code, migration, or implementation is created by this document. It is delivered for programme review.
