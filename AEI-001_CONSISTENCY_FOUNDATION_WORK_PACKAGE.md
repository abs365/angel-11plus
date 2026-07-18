# AEI-001: Consistency Foundation — Implementation Work Package

**Document ID:** AEI-001
**Role:** Chief Experience Architect
**Status:** Execution authority for AEI-001 only, pending Founder review. No code is implemented by this document.
**Governed by:** `AEI-000_EXPERIENCE_IMPLEMENTATION_PROGRAMME_CHARTER.md` §9 (Wave X1 mapping), `AXT-004` §6 (entry/exit gates), `AXT-003` (Design System V2.0, the standard being applied), `AXT-001` (the inventory this wave's scope is drawn from).

---

## 1. AEI-001 Implementation Work Package — Overview

**Objective:** apply the already-approved Design System V2.0 as the canonical experience layer across the existing platform's 33 pages, consolidate scattered presentation patterns, close the two accessibility gaps `AXT-003` §8/§18/§21 named, and do all of this without touching a single line of educational reasoning.

**In scope (restating the Founder's scope bullets, mapped to concrete work):**
- Apply `PageLayout`/`SupportLayout` consistently (§2).
- Consolidate loading/empty/success/error state presentation (§2, §9).
- Confirm navigation matches the approved architecture with zero drift (§4).
- Introduce keyboard accessibility and visible focus indicators (§3).
- Verify responsiveness holds for every new/changed element (§3).

**Explicitly not in scope, restating the Founder's constraints:**
- No change to `AEP-001`–`005`, `AIW-001`, `EAW-002`–`005`.
- No change to `lib/ali/confidence.ts`, `masteryValidation.ts`, `durableMastery.ts`, `educationalState.ts`, `recommendationOrchestration.ts`, `wellbeing.ts`, or any of their persistence adapters. **Verifiable directly:** every AEI-001 commit's diff must show zero lines touched under `lib/ali/`.
- No merging of the four static subjects' session logic into one component (a deeper, riskier consolidation correctly belonging to AEI-005, per `AXT-004`'s own Wave X1 definition, which only asks this wave to move *toward* that pattern, not complete it).
- No change to `Navigation.tsx`'s structure (its targets are AEI-004's concern, once the mock-exam family consolidates; AEI-001 only guarantees today's structure is applied with zero exceptions).

---

## 2. Component Mapping (existing → reused → replaced)

| Surface / pattern (`AXT-001` ref) | Existing component | Disposition this wave | Rationale |
|---|---|---|---|
| Dashboard, Progress, Parent Hub, all static subject pages | `PageLayout` | **Reuse as-is** | Already the standard wrapper; this wave confirms 100% adoption, no page found using an ad hoc wrapper. |
| Contact, Privacy, Terms, Beta, Beta Family, Feedback, Report Bug, Feature Request, Testimonial, Getting Started | `SupportLayout` | **Reuse as-is** | Already consistently adopted (`AXT-001` §24–31) — confirmed, not changed. |
| Every subject/pathway entry card | `SubjectCard`, `PathwayCard` | **Reuse as-is** | Already colour/icon-consistent per `ANGEL_DESIGN_LANGUAGE.md` §2; no defect found. |
| All four adaptive mocks' loading states | `PremiumLoader` | **Reuse as-is, extend accessibility** | Component itself is correct and canonical; §3 identifies one real gap (no `aria-live` region on the rotating message) to close without changing its visual behaviour. |
| English, Maths, Vocabulary, Writing session state | Four independent `useState`-driven page components | **Reuse as-is this wave; flagged for AEI-005** | These are not merged now — see §1's scope boundary. This wave's job on these four pages is limited to layout/state consistency (§9's patterns below), not session-logic consolidation. |
| Four Reasoning subjects | `ReasoningSession` | **Reuse as-is** | Already the target pattern (`AXT-003` §11) — nothing to change. |
| Per-form inline validation (`/login`, `/beta-family`, `/feedback`, `/report-bug`, `/feature-request`, `/testimonial`) | Four/five independent inline-error implementations | **Consolidate → new `ErrorState` component** | `AXT-003` §18 named this gap explicitly and recommended exactly this consolidation. This is the one new component this wave introduces, justified because no suitable reusable component exists today (the Founder's own stated condition for introducing anything new). |
| Keyboard/focus behaviour, product-wide | None named anywhere in any prior document | **New: a focus-visible convention, not a new component** | `AXT-003` §8/§21 named this as a real, unverified gap. This is a CSS/utility-class convention (Tailwind `focus-visible:` treatment applied consistently), not a React component — it does not count against "reuse existing components" because it isn't a component-level concern. |
| Empty states (Parent Hub, Progress, dashboard first-visit) | Existing per-page copy, already following `ANGEL_DESIGN_LANGUAGE.md` §8's rule | **Reuse pattern as-is; audit for 100% compliance** | The rule already exists and is already followed where checked in `AXT-001`; this wave's job is to confirm zero exceptions across all 33 pages, not to invent a new pattern. |
| Success/celebration (`BadgeCard`, `NewBadgeBanner`, XP bar) | Existing components | **Reuse as-is** | `AXT-003` §19 already found no defect here. |

**Net new components this wave introduces: exactly one (`ErrorState`).** Everything else is reuse, consistency-auditing, or a non-component CSS convention — consistent with the Founder's constraint that new components are a last resort.

---

## 3. Accessibility Verification Plan

Closes `AXT-003` §8/§18/§21's two named gaps with concrete, checkable steps:

1. **Keyboard navigation audit, every page:** confirm every interactive element (links, buttons, form inputs, `SubjectCard`/`PathwayCard`'s `Link`-wrapped blocks) is reachable via `Tab`, activates via `Enter`/`Space` where appropriate, and follows a sensible reading-order tab sequence. No page in `AXT-001`'s 33-item inventory has had this verified before this wave.
2. **Visible focus indicator, every interactive element:** apply a consistent `focus-visible:` ring treatment (reusing the existing purple brand colour token, per `ANGEL_DESIGN_LANGUAGE.md` §5's "every colour must trace to subject identity, semantic state, or neutral" — a focus ring is a real semantic state, not a fourth exception) across every button, link, and form control, replacing the current absence of any documented standard.
3. **A real, specific defect this wave's own review found and will fix:** `PremiumLoader`'s rotating reassurance message (`allMessages[step]`) has no `aria-live` region — a screen-reader user is never told the message changed. This wave adds an `aria-live="polite"` region to this one existing component, changing no visual behaviour.
4. **`ErrorState` (the one new component, §2) is built accessible from the start:** associated via `aria-describedby` with the field it reports on, not conveyed by colour alone (per the existing, already-correct `ANGEL_DESIGN_LANGUAGE.md` §9 rule).
5. **Verification method:** manual keyboard-only pass per page (no automated tooling is assumed present in this codebase; none is introduced by this wave, consistent with Reuse Before Rebuild) plus the existing `dark:`-pairing and touch-target spot-checks already part of this project's established review habit.

---

## 4. Navigation Consistency Plan

**Finding, restated from `AXT-001`:** `Navigation.tsx` already matches the approved architecture (`ANGEL_NAVIGATION_ARCHITECTURE.md`) exactly, with zero drift found. **This wave's navigation work is therefore verification, not correction:**
1. Re-confirm every one of the 33 pages is reachable from `Navigation.tsx`, the dashboard, the Reasoning Hub, or the Mocks hub — the same `href` search method `AXT-001` used — after this wave's other changes land, to catch any accidental link breakage.
2. **Explicitly out of scope for AEI-001:** any structural change to the Assessment section of `Navigation.tsx` — that depends on AEI-004's mock-exam consolidation and must not be pre-empted here.
3. Confirm active-state highlighting (`SidebarLink`'s background-tint/dot pattern) continues to correctly reflect the current route on every page this wave touches.

---

## 5. Rollback Strategy

Per `AXT-004` §14: this wave is presentation-layer only, touches no schema, and modifies no `lib/ali/*` file (verifiable directly, §1). Rollback is therefore always a plain frontend revert:
- **`ErrorState`'s introduction rolls back by deletion** — the forms it's adopted into simply keep working with their prior inline-error markup restored from the pre-wave commit, since nothing about their underlying validation logic changes, only its presentation.
- **The focus-visible CSS convention rolls back by reverting the utility-class additions** — no component structure depends on it existing.
- **No learner data, no `UserProgress` shape, and no engine state is ever at risk from this wave's rollback**, per Educational Continuity (`AXT-004` §2.3) — a frontend revert alone is always sufficient.

---

## 6. Acceptance Criteria

1. `git diff` for every AEI-001 commit touches only `app/**`, `components/**`, and styling — zero lines under `lib/ali/`, zero migration files, zero changes to `AEP-*`/`AIW-*`/`EAW-*` documents.
2. 100% of the 33 pages use `PageLayout` or `SupportLayout` correctly (no orphan layout pattern found on re-audit).
3. 100% of loading states use `PremiumLoader`; the `aria-live` fix is present and does not change its visual appearance.
4. Exactly one new component (`ErrorState`) exists, adopted by the forms named in §2, with no second error-presentation pattern surviving alongside it.
5. Keyboard-only navigation and visible focus indicators verified present on every interactive element across all 33 pages, per §3's plan.
6. `Navigation.tsx`'s structure is byte-for-byte unchanged (diff is empty for this file) — confirming this wave did not pre-empt AEI-004.
7. `tsc --noEmit` and `npm run build` clean, zero regressions, at the end of the wave.
8. A grep-based Invisible Intelligence check (`AXT-002` §11) finds zero new violations introduced by this wave's copy or markup changes.

---

## 7. Founder Review Checklist

- [ ] Every commit's diff confirmed to touch only `app/**`/`components/**`/styling — zero `lib/ali/*` lines.
- [ ] `Navigation.tsx` diff is empty (or the report explains, with evidence, why any change was unavoidable and non-structural).
- [ ] `ErrorState` is the only new component introduced this wave — no second undisclosed new component appears in the diff.
- [ ] Accessibility Verification Plan (§3) executed with stated evidence (which pages were keyboard-tested, the `aria-live` fix confirmed present).
- [ ] A throwaway verification script was run and deleted before commit, per this programme's standing discipline.
- [ ] `tsc --noEmit` and `npm run build` both reported clean in the implementation report.
- [ ] `AEI_PROGRAMME_DECISIONS_REGISTER.md` updated to reflect this wave's authorisation (§8) and any new Programme Decision issued during it.
- [ ] Component Mapping (§2) matches what was actually implemented — no undisclosed deviation.

---

## 8. Programme Decisions for This Wave

**No new Programme Decision is issued by this document itself** — this work package operates entirely within `APD-033` (Engine Before Experience), `APD-035` (Independent Educational Approval), and `AEI-000`'s own charter, none of which required a new decision to apply here. The one genuine scope judgement this work package makes — introducing exactly one new component (`ErrorState`) rather than zero or several — is recorded below as a proposed register entry, offered for the Founder's confirmation rather than presumed:

**`AEI_PROGRAMME_DECISIONS_REGISTER.md` updated accordingly** (see companion edit): AEI-001 is recorded as authorised; the register's decision table remains otherwise empty pending any actual new Programme Decision the Founder issues during this wave's execution or review.

---

No code was implemented, no screen was redesigned, and no engineering task was created to produce this work package. It becomes the execution authority for AEI-001, and nothing beyond its approved scope, once reviewed.
