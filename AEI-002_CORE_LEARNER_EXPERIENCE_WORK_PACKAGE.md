# AEI-002: Core Learner Experience — Implementation Work Package

**Document ID:** AEI-002
**Role:** Chief Experience Architect
**Status:** Governing implementation authority for AEI-002 only, pending Founder review. No code is implemented by this document.
**Governed by:** `AEI-000_EXPERIENCE_IMPLEMENTATION_PROGRAMME_CHARTER.md`, `AXT-002` (Experience Blueprint), `AXT-003` (Design System V2.0), `AXT-004` (Migration Strategy).

---

## 0. Reconciliation with `AEI-000`'s Wave Table

**Stated plainly, per the Charter's own governance discipline (§5, "record deviations, don't absorb them silently"):** `AEI-000` §9 originally mapped `AEI-002` to Wave X2 (Legacy Retirement). This authorisation instead defines `AEI-002` as Core Learner Experience — content that corresponds most closely to `AXT-004`'s Wave X3 (Competency Connection), scoped down to its learner-facing half only (Parent Hub's connection is explicitly out of scope here, per this wave's own "learner experience only" instruction). Legacy Retirement's content (`/mock-test`, the feedback-form consolidation) is not abandoned — it remains real, low-risk, fully-specified work, now simply reordered to a later wave rather than this one. This document proceeds under the Founder's re-sequencing as authorised; `AEI_PROGRAMME_DECISIONS_REGISTER.md` is updated accordingly (§7).

---

## 1. AEI-002 Work Package — Overview

**Objective:** bring the learner's primary daily experience — Dashboard, Today's Mission, the daily learning flow, competency-centred presentation, progress presentation, motivation, and cross-session continuity — to the Version 2.0 model, by connecting real Competency Intelligence Platform output where it exists and preserving honest fallback where it doesn't, without inventing a second learner journey alongside the existing one.

**In scope:** the dashboard (`app/dashboard/page.tsx`), Today's Mission (`buildDailyMission()`, `lib/adaptiveEngine.ts`), the presentation of competency/confidence/mastery/wellbeing signals wherever they reach a learner, Progress's learner-facing presentation, and the existing reusable components these surfaces already share.

**Explicitly out of scope:** Parent Hub (a separate audience and a separate future wave), the four adaptive mocks' own internal mechanics (untouched engine surfaces), English/Maths/Vocabulary/Writing/Reasoning subjects' own session logic (AEI-005 territory), any navigation restructuring (AEI-004 territory, once Assessment consolidates), and Legacy Retirement (§0).

---

## 2. Learner Journey Mapping

Mapping the Manifesto's five-beat Learning Journey (`AXT-002` §3) onto where each beat actually lives today — the concrete basis for everything else in this work package:

| Beat | Where it lives today | Assessment |
|---|---|---|
| **Beginning** | Dashboard's `WelcomeHero` + Today's Mission card, driven by `getEncouragingMessage()` and `buildDailyMission()` | Real, working, already good — states one clear next action per the Manifesto's own test. |
| **Journey** | Each subject page's own session (static state machines for English/Maths/Vocabulary/Writing; `ReasoningSession` for the four Reasoning subjects; real ALI-adaptive selection inside the four adaptive mocks only) | Real, but of uneven evidence-quality — only the adaptive mocks currently select "one deliberately chosen" item from real evidence; every static route selects from a fixed local bank. |
| **Success** | Each subject page's own "done" state (independently built per subject) | Real, but inconsistent in depth and never consolidated (`AXT-003` §11's own named gap) — not this wave's job to unify (AEI-005), but its *presentation* of what was achieved is this wave's concern where it touches competency signals (§6). |
| **Reflection** | **The real gap this mapping found:** the Manifesto's "brief, honest look back" beat has no home immediately after a session — it exists only on the separate `/progress` page, which a learner may or may not visit next. | This is the single most actionable finding of this Learner Journey Mapping: Reflection is real in content (`SubjectBreakdown`, `computeAnalytics()`) but structurally detached from the moment it's meant to follow. |
| **Tomorrow** | Dashboard's Daily Mission re-ranking on return, confirmed genuinely live and re-ranking correctly across real sessions (`ALI_OPERATIONAL_VALIDATION.md` §6) | Real, working, already good. |

---

## 3. Component Reuse Map

Per AXT Principle 002 (Reuse Before Rebuild), every one of the following is reused unmodified — no new component is introduced by this planning document; any genuine new need discovered during implementation must be raised as its own scoped decision, not assumed here:

- `PageLayout`, `SubjectCard`, `InsightCard`, `NewBadgeBanner`, `BadgeCard`, `DifficultyBadge`, `SubjectBreakdown` — all reused as-is.
- `computeAdaptiveState()` / `buildDailyMission()` (`lib/adaptiveEngine.ts`) — reused entirely unmodified; this wave changes what is *shown* about their output, never their logic.
- `computeAnalytics()`, `computeGamification()` — reused unmodified.
- **The one real gap this map surfaces, not resolved here:** no existing component currently implements a post-session Reflection moment (§2). This wave's Dashboard/Daily-Mission work does not require inventing one — the gap sits at the *subject-page* boundary, which is AEI-005's territory. This wave's job is limited to ensuring the Dashboard and Progress surfaces present Reflection-relevant data honestly and consistently in the meantime, not to relocate it.

---

## 4. Dashboard Transformation Plan

1. **Preserve `WelcomeHero`, the subject grid, and the Reasoning Hub card exactly** — all already Tier 2-redesigned and functioning correctly; no changes proposed.
2. **Today's Mission's reasoning text becomes Explainability-sourced where real data exists.** Today, `buildDailyMission()`'s `reasonText()`/`aliReasonText()` already reflects real `aliCompetencySignal` evidence for weak-competency detection (`AXT-001` §1's own finding) — this is genuine, not a placeholder. This wave's job is connecting the *next* layer: once WP-19's recommendation runtime and WP-21A's Wellbeing evaluator are live (dependency, §8), the learner-audience explanation (`generateExplanation(candidate, "learner")`, WP-10) becomes the source of this text instead of the current `reasonText()` templates — never blending the two, and never showing WP-10 output before it is genuinely backed by connected data.
3. **No second Daily Mission is introduced.** The existing card remains the single Beginning-beat surface — this wave changes its data source over time, not its structure or its count.
4. **Encouragement (`getEncouragingMessage()`) is preserved exactly** — already evidence-aligned with AEP-001 §2.7 (autonomy/competence-based, not loss-aversion) and requires no change.

---

## 5. Daily Mission Transformation Plan

1. **The engine (`buildDailyMission()`'s urgency ranking, Pathway Eligibility Filter) is untouched** — restating the Founder's constraint directly: no competency calculation, no recommendation logic, no ranking formula changes.
2. **Presentation connects to Tier 0's real veto, once wired.** Per `APD-042`/`044`, a recommendation Tier 0 has vetoed must never reach this surface — this wave's job is ensuring the Daily Mission's rendering path correctly omits a vetoed item once WP-19 is connected, not merely trusting the engine silently does so; a rendering-level check is added here as defence in depth for a rule the engine already enforces upstream.
3. **Triggers map to the same three phrasing rules WP-10 already defines** (never-attempted / review-due / weak-competency-remediation) — this wave applies these to the *learner* audience only, exactly as `AXT-002` §6 requires; the Daily Mission never renders a competency code, tier, or trigger-name string.

---

## 6. Competency Presentation Strategy

Adopts `AXT-003` §12 in full, applied specifically to the Dashboard and learner-facing Progress surfaces:
1. Every competency-derived visual element (mission priority chips, `DifficultyBadge`, `SubjectBreakdown` bars) must trace to a real Derived State Hierarchy layer (`APD-025`) — no fill value, chip colour, or badge state may move for encouragement alone.
2. Where real data does not yet exist for a given signal (e.g., Wellbeing, before WP-21A is connected), the corresponding element is omitted or marked honestly pending — never rendered with a plausible-looking placeholder.
3. Only the **learner** audience's Explainability phrasing (WP-10) may ever appear here — never the parent or engineering-audit phrasing, and never a fourth, ad hoc phrasing invented for this surface specifically.

---

## 7. Founder Acceptance Checklist

- [ ] `AEI_PROGRAMME_DECISIONS_REGISTER.md` records this wave's re-sequencing relative to `AEI-000` §9 (§0).
- [ ] No change to any `lib/ali/*` calculation — diff confirms presentation-layer only.
- [ ] No second Daily Mission, dashboard, or learner journey introduced alongside the existing one.
- [ ] Every new competency-derived visual element traces to a real Derived State Hierarchy layer, or is honestly marked pending.
- [ ] Learner-audience Explainability phrasing only — zero parent/engineering-audit/fourth-audience text on this surface.
- [ ] Design System V2.0 component reuse confirmed (§3) — no undisclosed new component.
- [ ] `tsc --noEmit` and `npm run build` clean at implementation time.

---

## 8. Risk Assessment

| Risk | Mitigation |
|---|---|
| **WP-19/WP-21A connection depends on WP-22's content disposition and WP-23's production-migration state being resolved first** (carried forward from `AXT-004` §13's Wave X3 risk) | This wave's Explainability-connection work (§4 item 2) does not begin until both are independently confirmed closed — the existing `reasonText()` fallback remains the honest, shipped behaviour until then. |
| **Premature display of a plausible-but-unconnected signal**, mistaking "looks real" for "is real" | §6's rule — omit or mark pending, never fabricate — is the direct mitigation, re-verified at Founder Acceptance. |
| **Reflection-beat work creeping into subject-page territory reserved for AEI-005** | §3's explicit scope boundary — this wave touches Dashboard/Progress presentation only, never a subject page's own session/completion logic. |
| **Re-sequencing (§0) causing confusion about what "AEI-002" means across documents** | This work package's §0 states the reconciliation explicitly and updates the register (§ below) rather than leaving two conflicting definitions on record. |

---

## 9. Rollback Strategy

Unchanged from the Migration Strategy's standing rule (`AXT-004` §14): this wave is presentation-layer only, touches no schema and no engine file, so rollback is always a plain frontend revert. Where Explainability-sourced text (§4) is introduced behind a data-presence check rather than a deploy-time flag (per `AXT-004` §7's established pattern), rolling back is simply the data condition no longer being met — the prior `reasonText()` behaviour resumes automatically, not manually.

---

## 10. Production Readiness Criteria

1. Every item in §7's Founder Acceptance Checklist independently verified, not asserted.
2. Zero regression to existing Daily Mission ranking/urgency behaviour, confirmed by the same kind of scenario verification this programme has used since WP-04.
3. Explainability-sourced text (§4/§5) only ships live once WP-19/WP-21A's connection prerequisites are independently confirmed — this wave's own exit gate is therefore conditional on that confirmation, not on this work package's approval alone.
4. Reflection-beat presentation on Dashboard/Progress is honestly consistent (§2's finding) even if the deeper subject-page relocation remains AEI-005's job.

---

## Programme Decisions Register Update

`AEI_PROGRAMME_DECISIONS_REGISTER.md` is updated to record: **`AEI-002` is re-scoped from `AEI-000` §9's original "Legacy Retirement" mapping to "Core Learner Experience," per this authorisation — Legacy Retirement's content remains outstanding for a future wave, not abandoned.** No new `APD-NNN` is issued by this document itself; the re-sequencing is recorded as a factual wave-definition change, not a constitutional decision requiring new numbering.

---

No code was implemented, no screen was redesigned, and no unrelated area was touched to produce this work package. It becomes the governing implementation authority for `AEI-002`, and nothing beyond its approved scope, once reviewed.
