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

## REF-002 — `RecommendationCandidate` extended with `confidenceTier`, `sourceCompetencyCode`, `triggerReason`

| Field | Value |
|---|---|
| **Work package originally implemented in** | WP-09 (Recommendation Orchestration), commit `beb377d` |
| **New principle prompting refinement** | Programme Decision APD-027's Engineering Note: "prepare for WP-10 by ensuring recommendation outputs expose sufficient structured information to support explanation generation... reasoning should be reusable rather than reconstructed" |
| **Work package refinement made in** | WP-10 (Explainability Integration), before building the explanation generator itself |
| **Why WP-09's original code was correct, not defective, when written** | `RecommendationCandidate` fully satisfied WP-09's own scope (Tier 0-3 ordering) at the time it was written — the gap was in what a *different, not-yet-started* work package (WP-10) would need from it, not in WP-09's own requirements. |
| **What changed** | Three fields added: `confidenceTier` (WP-05 output, answers "what evidence"), `sourceCompetencyCode` (which competency transfer-based evidence came from), `triggerReason` (a fixed vocabulary answering "why now," per `EAW-002` §5). All three are additive to the type; `orchestrateRecommendations()`'s own tier logic required zero changes, since it already treated candidates as opaque records it orders, never inspects field-by-field. |
| **Regression verification** | `tsc --noEmit` confirmed no existing caller breaks from the now-required fields (none exist yet — no live producer of `RecommendationCandidate` exists in the app). WP-09's own 12 verification scenarios were not re-run since the tier-ordering logic itself was untouched — only the type gained fields no existing test exercised. |
| **Governance documentation updated** | This entry; no calibration constant was affected. |

---

*(Future architectural refinements found via the Architectural Self-Consistency Review process should be appended below as REF-003, etc., following the same structure.)*
