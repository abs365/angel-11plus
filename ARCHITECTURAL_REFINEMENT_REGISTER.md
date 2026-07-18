# Architectural Refinement Register

**Status:** Living implementation documentation. Created 2026-07-18 per Programme Decision APD-026 (Architectural Self-Consistency Review).
**Purpose:** Distinct from `DEFECT_LINEAGE_REGISTER.md`. A Defect is something that was incorrect against its own governing document *at the time it was implemented*. An Architectural Refinement is a change made to an already-approved, already-shipped work package because a **later** programme decision established a new principle that work package now needs to comply with — the earlier work was correct when written, and the refinement is proactive, not corrective. APD-026 formalises the process (review upstream work packages when implementing a new one; if refinement is needed, implement immediately, regression-test, update governance docs, and classify here rather than in the Defect Lineage Register).

---

## REF-001 — `evaluateDurableMastery()` consumes `validated`, not raw `mastery_state`

| Field | Value |
|---|---|
| **Work package originally implemented in** | WP-07 (Durable Mastery Processing), commit `8aecb2c` |
| **New principle prompting refinement** | Programme Decision APD-025 (Derived State Hierarchy) — each derived state should consume the validated output of the preceding layer wherever practical |
| **Work package refinement made in** | WP-08 (Educational State Coordination), commit `da9fd2e` — reviewed as the immediately upstream work package before building Educational State Coordination on top of it |
| **Why WP-07's original code was correct, not defective, when written** | AEP-005 §10's literal text at the time specified condition 1 as "currently holds `mastered` state under the existing, unmodified mechanism" — exactly what WP-07 implemented. APD-025 did not exist yet. |
| **What changed** | `evaluateDurableMastery()`'s first parameter changed from the raw `masteryState: string` to WP-06's `validated: boolean` output. Durable Mastery — the strongest claim in the architecture — now requires the most-validated upstream signal available, not a signal one layer short of it. |
| **Regression verification** | All 6 of WP-07's original scenarios re-run under the new contract (substituting `validated` for the equivalent `masteryState === "mastered"` reading in each case) — identical pass/fail outcomes confirmed before commit. |
| **Governance documentation updated** | `CALIBRATION_TRACEABILITY_REGISTER.md` (unaffected — no calibration constant involved) confirmed not to need a change; the refinement itself was documented in the WP-08 commit message per APD-024's same-work-package sync requirement, and is now additionally recorded here per APD-026. |

---

*(Future architectural refinements found via the Architectural Self-Consistency Review process should be appended below as REF-002, etc., following the same structure.)*
