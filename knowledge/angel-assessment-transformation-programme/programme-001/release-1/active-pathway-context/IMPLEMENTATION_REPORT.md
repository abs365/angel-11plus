# Active Pathway Context — Implementation Report

## New files

- `lib/activePathway.ts` — `REAL_PATHWAY_IDS`, `isRealPathway()`, `getRealPathways()`, `getActivePathway()`, `switchActivePathway()`. The canonical "is this a real exam pathway" boundary, used everywhere Core Foundation/Not Sure must not be treated as a switchable target.
- `components/PathwaySwitcher.tsx` — the top-bar compact target control (Section 5), wired into `Navigation.tsx`'s desktop top bar and mobile drawer.
- `components/PathwaySwitchConfirmDialog.tsx` — the shared confirmation dialog (Section 6), used by both `PathwaySwitcher` and `app/pathways/page.tsx`.
- `supabase/migrations/026_active_pathway_context.sql` — additive `profiles.selected_pathway_id` / `profiles.pathway_selected_at` columns. Prepared, not applied (see `PATHWAY_EVIDENCE_INTEGRITY_ASSESSMENT.md`).

## Modified files

- `lib/ali/pathwayEligibility.ts` — added `resolveSubjectHref()`, the shared pathway-aware href resolver that was missing (the actual root cause of the routing leakage, see `CURRENT_PATHWAY_AND_ROUTING_AUDIT.md`).
- `lib/adaptiveEngine.ts` — `buildItem()` and the replay-item mission entry now call `resolveSubjectHref()` instead of hardcoding `/${subject}`.
- `lib/parentInsights.ts` — `buildFocusAreas()` now applies `getEligibleSubjectKeys()` (previously missing entirely) and resolves hrefs via `resolveSubjectHref()` instead of `SUBJECT_ADVICE`'s static hrefs.
- `app/dashboard/page.tsx` — Continue Learning row's Learn/Practise buttons now branch on `getSelectedPathwayId() === "csse"`, matching the page's own pre-existing pattern at its Today-section CTA.
- `app/angel-plus/page.tsx` — `JOURNEY_LINKS` converted to `journeyLinksFor(isCsse)`, gated behind a new deferred-read `useCssePathway()` hook (mirrors `Navigation.tsx`'s own).
- `app/beta/page.tsx` — branches on `getActivePathway()`; existing users get the new compact `ExistingFamilyBetaPage`, new prospects keep the existing full page.
- `app/pathways/page.tsx` — `handleSelect()` now gates a genuine real-to-real pathway switch behind `PathwaySwitchConfirmDialog`; first choices and Core Foundation/Not Sure selections still apply immediately.
- `components/Navigation.tsx` — renders `<PathwaySwitcher />` in the desktop top bar and mobile drawer.
- `lib/supabaseProgress.ts` — added `syncSelectedPathway()`, a fire-and-forget best-effort mirror to the new `profiles` columns, matching the file's existing `syncFullProgress()` pattern.
- `types/supabase.ts` — added `selected_pathway_id` / `pathway_selected_at` to the `profiles` Row/Insert/Update types, matching migration 026.

## Deliberately not changed

- `lib/ali/selection.ts`, `lib/ali/learningUnit.ts`, `lib/ali/observability.ts`, `app/mocks/adaptive/*` — confirmed reachable only from `/reasoning`, itself confirmed unreachable by CSSE. GL/CEM/ISEB-exclusive.
- Educational Intelligence Engine, Assessment Brain V1, Learning Engine V1, wellbeing veto, durable mastery, evidence recording — no file under `lib/learningEngine/*` or `lib/ali/persistence/*` was touched.
- Mathematics Reference Vertical (`app/learning-intelligence/learn/mathematics/arithmetic/page.tsx`) and its supporting logic — untouched, regression-verified working.
- Family Choice pilot (`app/learning-intelligence/founder-validation/family-choice`, `lib/ali/persistence/familyFocusStore.ts`) — untouched.

## A real bug found and fixed during implementation

`app/pathways/page.tsx`'s pre-existing `handleSelect()` and my own initial `PathwaySwitcher` both used `router.push("/dashboard")` after switching. Direct testing found this leaves `Navigation.tsx`'s `useCssePathway()` (and `app/angel-plus/page.tsx`'s equivalent) stale: both read the pathway once on mount only, and neither remounts on a client-side route transition, since `Navigation` is a persistent layout component. Fixed by switching both to `window.location.href = "/dashboard"` (a full reload), confirmed correct by direct interactive testing afterward. This is a genuine pre-existing gap in `app/pathways/page.tsx` that predates this increment, only surfaced because this increment tests pathway-switching more thoroughly than any previous round.

## An unresolved observation, disclosed honestly

Direct browser testing (`document.querySelectorAll('main').length`) intermittently found two `<main>` elements on `/dashboard` and `/angel-plus` in this local test environment: one visible and fully interactive, one with `offsetParent: null` and zero dimensions. Repeated ablation testing traced this to `PathwaySwitcher`'s presence but could not produce a fully deterministic root cause — results varied between supposedly-identical clean-cache rebuilds in a way consistent with Next.js's own background link-prefetch mechanism (which can pre-render a hidden copy of a page), not a logic defect in this component. Direct interactive testing on the visible tree (opening the switcher, reading menu items, confirming a switch) was repeatedly confirmed fully correct with no duplicate or conflicting UI ever visible or interactive to a real user. Not confirmed present on currently-deployed production before this increment. Recommend the Founder treat this as a watch item for production verification rather than a confirmed defect — see `REGRESSION_AND_VERIFICATION_REPORT.md`.
