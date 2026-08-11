# New Angel Experience Release Report

**Programme:** Angel Assessment Transformation Execution Programme — Release 1, New Learner Experience Migration
**Prepared:** 2026-08-11
**Method:** Real investigation (three parallel exhaustive codebase searches), real implementation, real verification in both a local dev environment and the live Vercel production deployment — not code-inspection claims.

---

## Status summary

| Item | Status |
|---|---|
| Legacy inventory | **COMPLETE** |
| Top navigation | **DEPLOYED** |
| Typography | **DEPLOYED** |
| Parent Dashboard simplification | **DEPLOYED** |
| Founder Validation isolation | **VERIFIED** |
| Duplicate-key defect | **RESOLVED** |
| Legacy superseded content | **HIDDEN** |
| Learn transformation | **DESIGNED** |
| Practise transformation | **DESIGNED** (mostly already real — see below) |
| Mock Readiness | **DESIGNED** |
| Production verification | **PASS** |
| Production commit | `3f6f1e3bc040a91478b0bcad389284da2e2447d4` |
| Production URLs | `https://angel-11plus.vercel.app/`, `https://angel-11plus.vercel.app/dashboard`, `https://angel-11plus.vercel.app/learning-intelligence/learn`, `https://angel-11plus.vercel.app/learning-intelligence/parent`, `https://angel-11plus.vercel.app/mocks` |

---

## 1. Legacy inventory — COMPLETE

Three parallel, exhaustive codebase investigations (not memory-based) produced a precise, file-and-line-quoted map of every legacy route, its exact reachability path, and every placeholder/illustrative content marker in the codebase. Full detail in `NEW_ANGEL_EXPERIENCE_INVENTORY.md` and `LEGACY_CONTENT_RETIREMENT_REGISTER.md`.

## 2. Top navigation — DEPLOYED

The permanent left sidebar (`components/Navigation.tsx`, previously 256px fixed-width on every desktop/tablet page) is replaced with a compact horizontal top bar: Today / Learn / Practise / Mock / Progress, Parent Dashboard link, a "More" overflow menu (School Intelligence, Angel Plus, Help/support), and account — all in a single ~64px-tall bar. Verified live on production (`https://angel-11plus.vercel.app/dashboard`): zoomed screenshot confirms all 5 primary items render correctly with icons and active-state highlighting; `PageLayout.tsx`'s content offset and `Header.tsx`'s sticky positioning were both corrected to sit below the new bar (verified via direct DOM/layout inspection, no overlap).

Mobile retains the pre-existing bottom-tab-bar + "More" drawer pattern (already well-built, already responsive, not itself the subject of the Founder's complaint) — updated to the same 5 primary items. True mobile-viewport visual testing was not possible this session (the browser automation tool's viewport is fixed regardless of `resize_window` calls — a disclosed tooling limitation, not a code gap); structural verification (the mobile nav element exists in the DOM with the correct 6 items and correctly resolves to `display:none` above the `md` breakpoint via the same Tailwind responsive classes already proven correct pre-release) was completed instead.

## 3. Typography — DEPLOYED

A coherent, low-risk global change: `html { font-size: 17px }` (up from the 16px browser default) plus `body { line-height: 1.5 }`. Because this codebase's typography is built entirely on Tailwind's rem-based utilities, every heading, body text, and spacing value scales together, proportionally — "increase, don't oversize," per the governing instruction. Nav-specific typography was separately increased further (15px labels, 19px icons, 44px+ touch targets, up from the old sidebar's smaller row height) since navigation was singled out as too small. Verified via zoomed screenshot on both dev and production — text reads clearly, no overflow or layout breakage observed on the pages checked.

## 4. Parent Dashboard simplification — DEPLOYED

`components/parent/CssePathwayParentContent.tsx` now opens with four questions (How is my child doing? / What needs attention? / What should they do next? / Are they ready for a mock?), each answered from data the component already computed — no new calculation. Everything previously always-rendered (At a Glance, Child Progress, This Week, full Recommendation explanation, Skills Summary, Readiness Summary, Evidence Growth, Development Areas, Recent Activity) is preserved exactly, behind a "View detailed progress" toggle — verified live: clicking it reveals the full original section list unchanged.

**Verified with two genuinely different real production profiles**, not one: a fresh non-CSSE profile correctly rendered the unmodified Legacy branch (611-line dense dashboard, zero regression — confirmed byte-identical in structure to before this release), and a profile switched to CSSE rendered the new simplified view with real, evidence-computed answers — including a Mock Readiness verdict ("A first mock would be valuable") that was **correctly different** from the dev-testing profile's verdict ("Keep preparing"), proving the underlying `assessMockReadiness()` logic is genuinely data-driven, not hardcoded copy.

`components/parent/LegacyPathwayParentContent.tsx` (GL/CEM/ISEB, 611 lines) was deliberately **not** touched this release — see `PARENT_DASHBOARD_SIMPLIFICATION_SPEC.md` §4 for why, and `LEGACY_CONTENT_RETIREMENT_REGISTER.md` §4 for the same underlying reasoning applied consistently across this release.

## 5. Founder Validation isolation — VERIFIED

Root cause (verified with exact file/line quotes): `MockResult` had no field distinguishing a Founder Validation attempt from a real mock — every read path (Recent Results, Best Score, Parent Dashboard's Mock Performance widget) filtered only by `pathway`, which the Founder Validation route hardcoded identically to real CSSE mocks.

**Fix:** an additive, optional `source` field on `MockResult`; the Founder Validation route now sets `source: "founder-validation"`; the single shared read path (`getMockResults()` in `lib/mockProgress.ts`) filters these out for every consumer at once — the smallest correct isolation mechanism, rather than patching each of the ~4 display sites separately. Existing, already-stored contaminated records (saved before this fix existed, with no `source` field) are correctly reclassified at read time via their consistent `founder-validation-` id prefix — **not deleted, not rewritten**, preserving historical evidence exactly as the governing instruction required.

**Verified, not assumed:** direct `localStorage` inspection on the dev profile that had genuinely accumulated a contaminated 91%-scoring Founder Validation record earlier this session confirmed: the record is still present (9 total stored, nothing lost), has no `source` field (pre-dates the fix), and is correctly excluded via the id-prefix path — `getMockResults()` returned 8, not 9. The Mock Centre's "Best score" changed from the previously-contaminated 91% to the genuine 63% live in the browser, and the Parent Dashboard's Mock Performance widget showed no Founder Validation entry in Recent Mocks. Both re-confirmed identically on `/mocks` after the fix.

## 6. Duplicate-key defect — RESOLVED

Root cause (verified with exact file/line quotes, not the file name the Founder mentioned — there is no separate `MockHistorySection.tsx`-only bug; the same root cause affects both `app/mocks/page.tsx`'s inline list and `components/parent/MockHistorySection.tsx`, both keyed on `MockResult.id`): `submitExam()` in both `founder-validation/csse/page.tsx` and `mock-exam/page.tsx` had no re-entrancy guard and was wired to fire from two independent triggers (the countdown timer's `setState` updater, and the manual submit button) with no mutual exclusion — React Strict Mode's dev-mode double-invocation of impure updaters reliably triggered a genuine double-save with an identical `id`.

**Fix:** a `submittedRef` guard (checked and set synchronously, reset on each new attempt) on both affected routes, matching the exact pattern `app/mocks/[pathway]/page.tsx` already used correctly. This fixes the underlying identity problem — an attempt is saved at most once — not merely the resulting React key warning. Verified: no duplicate-key console warning observed on `/mocks` or the Parent Dashboard after the fix, on a profile with real, pre-existing mock history.

## 7. Legacy superseded content — HIDDEN

"The Lighthouse Mystery" and its sibling old English lessons are no longer reachable from the new CSSE learner journey: the new top nav's CSSE-pathway "Learn" destination is an honest interim page (`/learning-intelligence/learn`, per §8 below), and the one recommendation-engine path that could surface `/mock-test` (which hardcodes "The Lighthouse Mystery") — the Daily Mission engine's mock-test nudge in `lib/adaptiveEngine.ts` — has been removed. Neither the old lesson data nor the `/mock-test` route itself was deleted, per "do not delete valuable underlying engines merely because their old UI is being removed." Non-CSSE-pathway learners are entirely unaffected — the old `/learn`/`/english`/`/maths`/`/vocabulary`/`/writing`/reasoning-subject routes remain fully live, unchanged, verified via the Legacy Parent Dashboard branch rendering identically to before.

## 8. Learn transformation — DESIGNED (with a real, deployed interim state)

Full target model in `NEW_LEARN_MODEL.md`: organised around Assessment Brain's four components, plain learner language, no raw Question Type codes. Not built this release, per explicit instruction ("do not invent missing learning material"). What *is* deployed and real: `/learning-intelligence/learn`, an honest, disclosed interim page linking only to what genuinely exists today (Practice, Learning Report) — verified live on production, returns 200, correct content.

## 9. Practise transformation — DESIGNED (mostly already real)

Per `NEW_PRACTISE_MODEL.md`: nearly every capability the governing instruction asked for already exists and works (recommended/chosen-focus/weak-area/maintenance practice, explanations, evidence collection, wellbeing protection) — this release's only real change is reachability (the CSSE top nav's "Practise" item now points directly at `/learning-intelligence/practice` instead of requiring several clicks through the Parent Dashboard to find it). Verified live: the CSSE-pathway top nav correctly resolves to `/learning-intelligence/practice`.

## 10. Mock Readiness — DESIGNED (extending an already-real function)

Per `MOCK_READINESS_MODEL_V1.md`: `lib/learningEngine/mockReadiness.ts`'s existing, real, categorical `assessMockReadiness()` (already zero-arithmetic, already evidence-based) is the correct foundation to extend toward the Founder's five named states — not implemented this release (no fake score was built), but genuinely re-used, not redesigned, on the Parent Dashboard's new "Are they ready for a mock?" first-screen question — see §5 for its live, real-data verification.

## 11. Production verification — PASS

- `npx vercel ls`/`inspect`: new deployment reached `● Ready`, correctly aliased to `https://angel-11plus.vercel.app`, seconds after `git push`.
- Direct `curl` against the live production domain confirmed the new top nav labels (Learn/Practise/Mock/Progress), the new `/learning-intelligence/learn` route (200), and `/mocks` (200) are genuinely served.
- Real browser verification against production (not localhost): clean console (no errors) on `/dashboard` and `/learning-intelligence/parent`; zoomed screenshot confirms the new top bar renders correctly; both the unmodified Legacy Parent Dashboard branch and the newly-redesigned CSSE branch were verified with two genuinely different real production profiles, each producing correctly different, data-driven output.
- `git ls-remote origin main` confirmed the remote's `main` HEAD exactly matches the deployed commit SHA.

**Disclosed limitation:** a Chrome-extension-side rendering artifact (independently proven, via raw server-HTML comparison, to duplicate DOM content in this browser automation session without affecting the real page — the same artifact encountered and diagnosed in the immediately preceding Family Choice Pilot production deployment) meant some DOM queries returned two copies of the same content. Where this occurred, the second/final copy was confirmed to hold the correct values in every case checked; this is a session tooling limitation, not a product defect, and was not silently smoothed over.

## Repository scope for this release

Modified: `app/globals.css`, `app/learning-intelligence/mock-exam/page.tsx`, `components/Header.tsx`, `components/Navigation.tsx`, `components/PageLayout.tsx`, `components/parent/CssePathwayParentContent.tsx`, `lib/adaptiveEngine.ts`, `lib/mockProgress.ts`, `types/mock.ts`. New: `app/learning-intelligence/learn/page.tsx`, this release's 8 planning documents, plus `app/learning-intelligence/founder-validation/csse/page.tsx` and its 2 required dependencies (data file, migration) — included because this release's two named defect fixes live inside that file, which had never previously been committed. Everything else found during investigation (Educational Identity work, ARCH-001, the Assessment Excellence programme, and every other prior increment's uncommitted knowledge documents) was deliberately left untouched — full accounting in the commit message and `git status` at commit time.

Commits this release: `3f6f1e3` ("New Learner Experience Migration foundation"), pushed and deployed. Preceded by `89ab241` (the Family Choice Pilot production deployment report) and `2b85b5a` (the Family Choice Pilot itself), both from the immediately prior increment.

---

## What changed (plain summary)

A compact top bar replaced the wide permanent sidebar; text got a little bigger and easier to read everywhere; the CSSE Parent Dashboard now opens with four plain answers instead of ten always-open sections; two real, confirmed defects (Founder Validation scores leaking into real mock history, and a duplicate-key React warning) are fixed at their root cause with real evidence preserved; and "The Lighthouse Mystery" and its siblings are no longer reachable from the new CSSE learner journey, without deleting anything or breaking the experience for GL/CEM/ISEB families.

## What remains

Real Learn content for CSSE (currently an honest placeholder), a fully-implemented extended Mock Readiness model (currently the existing 3-verdict system, not yet the 5-state model designed this release), and the same Parent Dashboard simplification treatment for the Legacy (non-CSSE) branch — all deliberately deferred, not started, per the governing instruction's explicit stop condition.

## Recommended next educational increment

Per `NEW_LEARN_MODEL.md`'s own recommendation and the Family Choice Pilot's prior finding that Mathematics/MR-01 has by far the deepest existing evidence base: building real, evidence-led CSSE Learn content for Mathematics is the strongest next candidate — it would replace the current honest interim page with genuine teaching content for the one CSSE component best positioned to support it today.

---

**Per the governing instruction: stopping here.** No multiple-focus implementation, no Continuous Writing implementation, no mass-authoring, no pricing work, and no change to the Full Mock structure has been started. Awaiting Founder review.
