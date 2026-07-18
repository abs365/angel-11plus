# Wellbeing Signal Contract

**Status:** Implementation-ready reference, per Programme Decision APD-043. **Defines the contract only — does not implement or redefine the Wellbeing model** established in `WP-21_WELLBEING_DESIGN.md`, which remains the sole authority on what the model *is* and *why*. This document exists so Recommendation Orchestration (WP-19) can be built against a stable interface, and so a future, separately-authorised Wellbeing implementation has a fixed target to satisfy.
**Types:** `types/ali/wellbeing.ts` (`WellbeingSignalInput`, `WellbeingSignalResult`, `WellbeingVetoReason`, `ComputeWellbeingSignal`).
**Governing constraint, restated once, not re-argued:** per `APD-042` (Educational Scope Protection), everything below supports learning-behaviour adjustment only — no diagnosis, no medical/psychological inference, no safeguarding assessment, no third-party escalation. The maximum intervention this contract permits is educational guidance within the learning experience.

---

## 1. Inputs

`WellbeingSignalInput` (`types/ali/wellbeing.ts`):

| Field | Source | Notes |
|---|---|---|
| `learnerId`, `competencyCode` | Caller-supplied, identifying which candidate is being evaluated | |
| `recentAttempts` | Real, already-captured per-question history | Bounded window, size not fixed by this contract — an implementation detail for whoever builds the real function |
| `currentEducationalState` | WP-08's `computeEducationalState()`, consumed not recomputed | Detects e.g. `"rebuilding"` |
| `learningGainTrend` | `aliLearningGain` (Phase 1.4), consumed not recomputed | `null` when not yet computed for the subject — never defaulted to a sign |
| `sessionAbandonmentCount` | **Does not exist in this codebase yet** (`WP-21` §3's named capture gap) | `undefined`, not `0` — a real implementation must distinguish "no capture exists" from "captured, and the count is zero" |

**Contract rule:** every field this signal ever consumes must be one of the above, or a formally-added extension to this same interface, reviewed with the same rigour — never an ad hoc value introduced inside the (not-yet-built) computation function itself.

---

## 2. Outputs

`WellbeingSignalResult`:

| Field | Meaning |
|---|---|
| `veto: boolean` | Whether Tier 0 (`EAW-004` §5, `WP-09`) suppresses this candidate |
| `reason: WellbeingVetoReason` | One of `"compounding-failure"`, `"mastery-reversal-low-engagement"`, `"session-abandonment-pattern"`, or `null` — a fixed vocabulary matching `WP-21` §6's three named conditions exactly, never free text |
| `parentFacingSignal` | `"steady"` \| `"may benefit from a lighter week"` \| `null` — matches `AIW-001` §9's already-shipped `ParentReport.wellbeingSignal` field type (`types/parent.ts`, WP-12) exactly; this is the function that would eventually compute that field's real value |

**No numeric field exists anywhere in this output, by design** — restating `WP-21` §2's absolute constraint at the contract level, not only the design level.

---

## 3. Evidence thresholds

Restating `WP-21` §6's three candidate conditions as the concrete thresholds a real implementation must check — **all three remain unvalidated against real learner data, exactly as `WP-21` and the Calibration Traceability Register already state; this contract does not upgrade their calibration status by formalising them.**

| Reason | Threshold | Required inputs |
|---|---|---|
| `"compounding-failure"` | ≥3 consecutive incorrect attempts on the same competency within `recentAttempts`, where `currentEducationalState` was `"learning"`-or-better before this run of failures began | `recentAttempts`, `currentEducationalState` |
| `"mastery-reversal-low-engagement"` | `currentEducationalState === "rebuilding"` **and** `learningGainTrend === "negative"` | Both fields present and non-null |
| `"session-abandonment-pattern"` | `sessionAbandonmentCount !== undefined && sessionAbandonmentCount >= 2` | `sessionAbandonmentCount` — **inactive entirely until the underlying capture gap (`WP-21` §3) is closed** |

---

## 4. Missing-data behaviour

Fails open, per `WP-21` §5, restated as a precise contract rule: **a condition may only ever fire when every one of its required inputs (§3's rightmost column) is genuinely present.** A `null`/`undefined` required input means that specific condition does not evaluate — it is skipped, not treated as satisfied or as a signal in itself. If no condition fires, `veto: false`, `reason: null`, `parentFacingSignal: null`. Absence of data is never itself evidence of a wellbeing concern.

---

## 5. Tier 0 interaction

`WP-09`'s `WellbeingVeto` type (`types/ali/recommendationOrchestration.ts`) is `(candidate: RecommendationCandidate) => boolean`. A real Wellbeing implementation satisfying `ComputeWellbeingSignal` plugs into that predicate as:

```
wellbeingVeto = (candidate) => computeWellbeingSignal(buildInputFor(candidate)).veto
```

*(Illustrative only — no such wiring exists yet; `buildInputFor()` is a placeholder name for whatever function eventually assembles `WellbeingSignalInput` from a candidate and real data, itself a future implementation task.)*

**Contract rule for WP-19:** Recommendation Orchestration's Tier 0 must call this signal **before** any candidate reaches Tier 1 evaluation, per `EAW-004` §5's existing, unmodified ordering — this contract does not change where Tier 0 sits in the pipeline, only what a real implementation behind it must return.

---

## 6. Audit expectations

Every `veto: true` result should write an `EducationalAuditRecord` (`WP-11`/`WP-16`). **A genuine, unresolved schema gap, named here rather than assumed away:** the current `conclusion_type` enum (migration 010: `"mastery" | "durable-mastery" | "recommendation" | "readiness-dimension"`) has **no value fitting a wellbeing veto.** A future additive migration (a new enum value, e.g. `"wellbeing-veto"`) is required before this audit expectation can be technically satisfied — not added speculatively in this contract, consistent with this programme's standing "additive only, when actually needed" discipline. Until that migration exists, a real Wellbeing implementation cannot fully close this contract's audit requirement, and that gap should be treated as a blocking prerequisite for the implementation, not a detail to work around silently.

---

## 7. What this contract does not do

It does not implement `WP-21` §6's three conditions. It does not decide the size of the `recentAttempts` window, the real data source for `sessionAbandonmentCount`, or resolve any of `WP-21` §11's five unresolved questions. It exists solely so WP-19 can be built against a stable shape, and so the eventual real implementation — whenever separately authorised — has one unambiguous target rather than needing to re-derive an interface from `WP-21`'s prose each time.

---

Awaiting review before WP-19 (Recommendation Orchestration Runtime Integration) commences.
