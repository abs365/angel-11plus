# AEI-003: Competency Connection — Implementation Work Package

**Document ID:** AEI-003
**Role:** Chief Experience Architect
**Status:** Governing implementation authority for AEI-003 — **conditional**. No code is implemented by this document. Per this wave's own Requirement ("use runtime-backed explainability only where WP-19 and WP-21A have been independently verified"), this work package's own Runtime Dependency Matrix (§2) finds that condition **not currently met** — read that section before anything else.
**Governed by:** `AEI-000` (Charter), `AXT-002` (Blueprint §6, Competency Journey), `AXT-003` (Design System §12, Competency Presentation Patterns), `AXT-004` §6 (Wave X3's own entry gate).

---

## 1. AEI-003 Work Package — Overview

**Purpose:** connect the learner experience (Dashboard's Today's Mission, per `AEI-002`) to the real Competency Intelligence Platform runtime — WP-19's Recommendation Orchestration and WP-21A's Wellbeing evaluator — **once, and only once**, both are independently verified as production-ready. This document defines the integration plan so it is ready to execute the instant that verification lands; it does not itself perform the connection.

**In scope (planning only):** Explainability presentation, Wellbeing presentation, competency guidance, recommendation explanation, on the existing learner-facing components `AEI-002` already established.

**Out of scope:** any new educational calculation, any change to `lib/ali/*`, any redesign of a learner journey not already touched by `AEI-002`, and — per this work package's own finding — any actual runtime-backed rendering until §2's gate clears.

---

## 2. Runtime Dependency Matrix

**This is the governing section of this work package.** Every dependency below was checked against this programme's own most recent, real record — not assumed current.

| Dependency | Status | Blocking? | Evidence |
|---|---|---|---|
| **WP-19 (Recommendation Orchestration Runtime)** | Approved for **internal integration only**. Explicit finding on record: **"LEARNER-FACING RELEASE: NOT AUTHORISED."** | **BLOCKING** | Four named release blockers, none confirmed closed: (1) wellbeing-veto audit persistence must be made observable and recoverable; (2) the reconstructed second-most-recent attempt ordering must be replaced with genuine attempt-level evidence or explicitly validated as safe; (3) the `APD-036` Operational Readiness Gate must be completed against representative production-like data; (4) caller-supplied `learningGainTrend`/`daysUntilExam` provenance and freshness must be documented, not silently trusted. |
| **WP-21A (Wellbeing Evaluator)** | Implemented and verified in sandbox; **live database write (audit persistence) has never been confirmed** — the same sandbox network limitation that has applied to every migration in this project. | **BLOCKING** (shares WP-19 blocker 1 directly — a wellbeing veto with unconfirmed audit persistence is exactly the "not observable/recoverable" condition WP-19's own gate names) | No document in this programme confirms `ali_educational_audit` has ever received a real write. |
| **WP-22 (Content Disposition)** | Educational disposition recorded; **SQL execution not authorised**, per `APD-052` (Import Authorisation Separation). | **BLOCKING** | `WP-22_CONTENT_DISPOSITION.md` §7 — production authorisation and deployment verification both still outstanding. |
| **WP-23 (Production Migration State)** | **Genuinely unknown.** A consolidated, read-only diagnostic was prepared and handed to the Founder for execution; no result has been reported back into this programme's record since. | **BLOCKING** | `WP-23_PRODUCTION_MIGRATION_READINESS_REVIEW.md` §8; the Founder's own follow-up (`APD-054`/`055`) explicitly paused deployment planning pending this exact diagnostic. |
| **`ACR-001` git custody finding** | At time of that review: 11 uncommitted constitutional documents, 35 unpushed commits. Not reconfirmed resolved since. | Risk, not directly blocking the connection *logic* — but relevant to whether any of this wave's eventual work would itself be safely persisted. | `ACR-001_CONSTITUTIONAL_READINESS_REVIEW.md` §7/§8. |

**Conclusion, stated plainly: `AXT-004` §6's own Wave X3 entry gate ("WP-22 content disposition approved for production; WP-23's production-state diagnostic resolved") is not met today.** Per this wave's own Requirements, runtime-backed Explainability and Wellbeing presentation therefore **remain unauthorised for implementation** until this matrix is re-run and shows all four blocking rows cleared.

---

## 3. Component Reuse Map

Every element this integration would eventually use already exists — no new component is proposed:
- **`lib/ali/persistence/recommendationRuntime.ts`'s `computeRealRecommendationOrchestration()`** (WP-19) — the real orchestration output, once its own release blockers clear.
- **`lib/ali/wellbeing.ts`'s `computeWellbeingSignal()` and `lib/ali/persistence/wellbeingAudit.ts`'s `recordWellbeingVetoAudit()`** (WP-21A).
- **`lib/ali/explainability.ts`'s `generateExplanation()`** (WP-10) — **learner audience only**, per `AXT-002` §6's three-audience boundary; never parent or engineering-audit phrasing on this surface.
- **The Dashboard's Today's Mission list** (`app/dashboard/page.tsx`, the `<ol>/<li>` structure `AEI-002` established) — the rendering target; no new list, card, or surface is introduced.
- **`DifficultyBadge`, `InsightCard`** — available for reuse if the eventual connection needs to surface an additional confidence-tier-derived element, per `AXT-003` §12's rule that any such element must trace to a real Derived State Hierarchy layer.

---

## 4. Explainability Integration Plan (ready to execute once §2 clears)

1. **Hybrid, never a flag-day cutover.** For a given mission item, if `computeRealRecommendationOrchestration()` produces a real candidate with a real `triggerReason` for that competency, its learner-audience `generateExplanation()` text replaces `item.reason` for that item only. Every other item keeps the existing `reasonText()`/`aliReasonText()` fallback (`AEI-002`'s own preserved behaviour) — exactly the data-presence-gated pattern `AXT-004` §7 already established, not a new mechanism.
2. **No second Daily Mission, no new card.** The connection changes what populates `item.reason`; it does not change the Dashboard's structure `AEI-001`/`AEI-002` already established.
3. **A vetoed candidate must never appear as a mission item at all** — not shown with a softened reason, not omitted silently without the audit trail firing. Per `AXT-002` §6, Tier 0 is a ceiling, not a rendering choice.

---

## 5. Wellbeing Integration Plan (ready to execute once §2 clears)

1. **Wellbeing is never rendered as its own learner-facing element.** Per `APD-042` (Educational Scope Protection) and `AXT-002` §6, its only visible effect is the *absence* of a vetoed candidate from Today's Mission — there is no "wellbeing badge," score, or status indicator anywhere in this plan, now or later.
2. **A rendering-level defence-in-depth check is added**, not because the engine is expected to fail, but because a learner-facing surface should never trust a single layer for a safety-critical omission: before rendering, confirm no mission item corresponds to a competency `computeWellbeingSignal()` vetoed for that learner in the same evaluation pass.
3. **Every fired veto must have a corresponding audit record confirmed persisted** before this plan executes in production — restating §2's blocking dependency, not a new condition invented here.

---

## 6. Risk Assessment

| Risk | Mitigation |
|---|---|
| **Shipping before verification** — mistaking "the plan is ready" for "the runtime is ready" | §2's matrix is the hard gate; this work package's own Founder Acceptance Checklist (§7) makes gate-clearance the first, non-negotiable item. |
| **WP-19's attempt-ordering approximation producing a false wellbeing veto** if connected before its own blocker 2 is resolved | Explicitly named as a blocking dependency in §2, not merely noted — this plan does not execute until it is either replaced with genuine attempt-level evidence or independently validated as safe for this specific use. |
| **A parent or learner seeing a plausible-looking recommendation that isn't actually backed by connected data** | The hybrid, item-by-item gating in §4.1 — never a wholesale switch-over — bounds this risk to exactly the items with confirmed real data. |
| **Re-attempting this connection work without re-checking §2**, since time will have passed since this document was written | The Runtime Dependency Matrix must be re-run fresh immediately before implementation begins, not read as a historical snapshot. |

---

## 7. Founder Acceptance Checklist

- [ ] **§2's Runtime Dependency Matrix re-run fresh and confirms all four blocking rows cleared** — this item gates every other item below.
- [ ] WP-22's production authorisation and deployment verification both independently confirmed (not merely "recorded").
- [ ] WP-23's production diagnostic executed and its results reviewed.
- [ ] WP-19's four release blockers each independently confirmed closed.
- [ ] WP-21A's audit persistence confirmed with a real database write, not sandbox-only verification.
- [ ] No new component introduced beyond §3's reuse map.
- [ ] Every rendered explanation traced to a real Derived State Hierarchy layer and the correct (learner-only) audience.
- [ ] `tsc --noEmit` and `npm run build` clean at implementation time.

---

## 8. Rollback Strategy

Unchanged in kind from `AXT-004` §14: presentation-layer only, so rollback is a plain revert. Because the integration is data-presence-gated (§4.1), the more likely "rollback" in practice is simply the gate condition reverting — if a production issue is found with the real orchestration output for a given learner, that learner's mission items fall back to `reasonText()`/`aliReasonText()` automatically, the same way any other adaptive route already falls back to its synthetic fixture when real data is unavailable.

---

## 9. Production Readiness Criteria

**Conditional, stated honestly:** this wave has no production readiness criteria to meet yet, because it has no authorisation to implement yet. Production readiness for *this work package*, today, means exactly one thing: the plan in §4/§5 is complete, reviewed, and executable the moment §2's matrix is re-run and shows every blocking row cleared. Re-running that matrix — not approving this document — is the actual next step.

---

No code was implemented, and no learner journey beyond the Dashboard connection `AEI-002` already scoped was touched or redesigned, to produce this work package.
