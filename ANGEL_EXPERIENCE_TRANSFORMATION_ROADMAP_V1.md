# ANGEL 11+ — Experience Transformation Roadmap, V1

**Status:** Active. Stage 1 (design-system foundation: Lexend typeface, `Card` base primitive) and Stage 2 (keyboard interaction standard) are **landed** — see commits `647f639`/`25b404c` (2026-08-18) and `bd70f8a` (2026-08-19). Stages 3–9 are being continued (from 2026-08-31) under the Premium Frontend programme, which additionally requires every remaining stage to pass `PREMIUM_FRONTEND_STANDARD.md` §14's quality gates, not just close its named Gap Register item. Derived from the Gap Register's own dependency analysis, not a default template order.

---

## Document Authority Map (added 2026-08-31, Premium Frontend programme)

Angel's design/experience documentation has accumulated across several programme iterations. This table is the explicit reconciliation `PREMIUM_FRONTEND_STANDARD.md` (§9 of the instruction that produced it) required — it states which document governs what, so a future session does not have to re-derive the chain from scratch.

| Document | Role | Authority today |
|---|---|---|
| `PREMIUM_FRONTEND_STANDARD.md` | **New.** Portable, brand-agnostic quality standard (hierarchy/typography/colour/component/motion/trust/AI-slop/visual-QA rules and acceptance tests) | Reusable standard — governs *how to judge* quality on any product, deliberately holds no Angel-specific values |
| `PRODUCT_EXPERIENCE_STANDARD_V1.md` | Consolidation of `DESIGN_SYSTEM.md` + `ANGEL_DESIGN_LANGUAGE.md` + `AXT-003`, plus two logged corrections | **FROZEN for Version 1**, authoritative on: no gradients, no visible XP/Level/Streak UI, typography/colour tokens, one-CTA-per-page, calm tone, copy-punctuation rules. Overrides everything else only on the two logged corrections |
| `ANGEL_DESIGN_LANGUAGE.md` (V3) | Angel's own art-direction instantiation of the portable standard | Authoritative for Angel's actual tokens: subject-identity colour/icon table, card taxonomy, motion values, ALI-invisible language, empty-state pattern, accessibility baseline. Superseded only where `PRODUCT_EXPERIENCE_STANDARD_V1.md` explicitly corrects it |
| `ANGEL_EXPERIENCE_SYSTEM_V1.md` | Canonical current design specification (research + spec only), grounded in the Commercial Benchmark | Authoritative day-to-day reference for section-by-section rules (cards, icons, keyboard behaviour, responsive, accessibility, copy) — consistent with, not contradicting, the FROZEN standard |
| `ANGEL_EXPERIENCE_GAP_REGISTER_V1.md` | Prioritised findings (C1–C3/H1–H4/M1–M3/L1–L2), each traced to a Benchmark citation | Evidence record — defines *what* is wrong, not a standard in its own right |
| `ANGEL_EXPERIENCE_TRANSFORMATION_ROADMAP_V1.md` (this document) | Implementation sequencing | **Active execution authority** — the order work happens in |
| `ANGEL_PRODUCT_EXPERIENCE_COMMERCIAL_BENCHMARK_V1.md` | Original audit/competitor research | Historical evidence — cite, do not re-derive |
| `ANGEL_008V_MOCK_VISUAL_PRODUCT_EXPERIENCE_STANDARD_V1.md` | Scoped standard for the Mock workspace visual/timer treatment | Still authoritative for that one surface; referenced by `ANGEL_EXPERIENCE_SYSTEM_V1.md` §N/O |
| `ANGEL_LOADING_EXPERIENCE.md` | Scoped standard for loading-state motion/copy | Still authoritative; implemented as `components/PremiumLoader.tsx` |
| `DESIGN_SYSTEM.md` (v2D-A) | Earlier design system | **Historical.** Superseded by `ANGEL_DESIGN_LANGUAGE.md`; kept for record only |
| `AXT-003_ANGEL_DESIGN_SYSTEM_V2.md` | Earlier "Constitutional" design system | **Superseded in practice** — its content was explicitly merged into `PRODUCT_EXPERIENCE_STANDARD_V1.md`. Its own "Constitutional" self-declaration predates that merge and should be read as historical, not current |
| `AXT-002_ANGEL_EXPERIENCE_BLUEPRINT.md`, `AXT-004_ANGEL_EXPERIENCE_MIGRATION_STRATEGY.md` | Broader journey-mapping and Version-2.0 migration-process strategy (navigation philosophy, release waves, rollback strategy) | **Adjacent, not reconciled.** These sit one layer up from visual/frontend design (product/process strategy, not visual standard) and were never explicitly folded into or retired by the newer Experience Programme docs. Not contradicted by anything in this reconciliation, but also not verified consistent with it — flagged for a future session to either formally supersede or re-confirm, not silently assumed current |
| `UX_TRANSFORMATION_PLAN.md` | Earlier navigation/journey planning doc | **Historical/superseded** — its navigation model (Learn/Practice/Mock/Progress) was re-confirmed unchanged by `ANGEL_EXPERIENCE_SYSTEM_V1.md` §E, so its conclusion stands even though the document itself is no longer the reference to cite |
| `ANGEL_V1_PRODUCT_EXPERIENCE_COMPLETION_REPORT.md`, `ANGEL_V1_PRODUCT_EXPERIENCE_IMPLEMENTATION_AUDIT.md` | Closure evidence for the Wave that produced the FROZEN standard | Historical record of what shipped then, not a forward-looking standard |

**Retirement recommendation (not executed without Founder sign-off):** `DESIGN_SYSTEM.md` and `AXT-003` could be moved to an `/archive` or clearly marked deprecated at the top, since their live content is fully carried forward elsewhere and their presence at repo root next to active docs is itself a small instance of the "which one do I trust" problem this map exists to solve. Left untouched this session — a deletion/move of Founder-authored historical record is not this increment's call to make unilaterally.

---

## Visual QA Log (per `PREMIUM_FRONTEND_STANDARD.md` §15 — evidence, not assertion)

**2026-08-31, first session (interrupted by a Chrome connection failure):** icon-box removal beside the "Today's Admission Mission" heading (`app/dashboard/page.tsx`) and the `bg-[#f8f7ff]` → `bg-[var(--background)]` token fix were each visually confirmed rendering correctly in-browser before the connection dropped. Recorded as **PASSED** and not repeated below.

**2026-08-31, resumed session:** dev server started (`npm run dev`, Turbopack, no compile errors); `resize_window` did not change the actual rendered viewport in this session (confirmed via `window.innerWidth` staying fixed regardless of requested size) so an iframe-harness (page content replaced with a same-origin `<iframe>` set to an explicit CSS width, which Tailwind's `min-width` media queries correctly respond to) was used instead to get genuine width-accurate rendered screenshots:

- `/dashboard` at 375px (mobile), 768px (tablet, single-column as expected below the `lg:` breakpoint), and 1024px (desktop, confirms the `lg:grid-cols-3` mission+secondary-rail split renders correctly, no truncation, no gradients, one dominant CTA) — **PASSED**, both the icon-box removal and background-token fix reconfirmed at all three widths, plus the rest of the page (Your Progress, Mock Exams, About, footer) inspected for the first time this arc.
- `/not-found` at 375px — **PASSED** (background token, icon, single CTA, centred, no gradient).
- `/learning-intelligence/parent` (`CssePathwayParentContent`) at 375px — **PASSED** for 2 of the 3 removed decorative icons (Sparkles on "What needs attention?", Target on "Are they ready for a mock?" — both cards confirmed clean text-only). The third (HelpCircle on "How Angel decides what to recommend") did not render in this account's current data state within the scrolled range inspected — **INCONCLUSIVE**, not confirmed either way this session.
- `/login` — could not be visually inspected: the account used for this session is already authenticated, so the page redirects to `/dashboard` before the styled content is visible. The background-token line change there is the same one-line pattern already confirmed passing on four other surfaces, but is **PENDING** genuine rendered confirmation of that specific file.
- `app/dashboard/loading.tsx`, `app/mock-test/loading.tsx`, `app/english/[id]/loading.tsx`, `app/error.tsx` — **PENDING**. These are transient/conditional states (loading skeletons, error boundary) not straightforward to force into a stable render within this session; not rendered-inspected. The dashboard skeleton's reshape was checked structurally against the real page (see the comment left in the file itself) but that is source comparison, not the rendered evidence §15 requires — do not treat it as visually passed.
- A pre-existing, unrelated defect was found incidentally: `app/login/page.tsx:64` calls `router.replace()` during render (React "Cannot update a component while rendering a different component" warning), present since commit `078f32b` (2026-07-18) — predates this programme and is out of scope for this increment; flagged for a separate fix, not actioned here.

**Overall visual QA status (as of the previous entry): PARTIALLY VERIFIED**, materially more complete than at handover but not exhaustive — the four PENDING/INCONCLUSIVE items above were the named remaining evidence gaps.

**2026-08-31, third session — Zero-Purple Angel-wide colour removal (Founder directive):** purple/violet/indigo systematically removed from every Tailwind class, CSS token, and component colour-lookup table across the codebase (~90 files). Full account in `ANGEL_DESIGN_LANGUAGE.md` §0a. Engineering verification: `tsc --noEmit` clean, `npm test` 3017/3017 passing, `npm run build` succeeds for every route, `copy-quality-guard` 0 violations. Two real defects were found and fixed during the pass itself (not left for a later session): a component prop/key mismatch that would have broken `themeColor="violet"` at the type level (`components/ReasoningSession.tsx`), and two same-file colour collisions where a mechanical purple→blue or purple→orange substitution would have made two genuinely distinct categories render identically (`components/BadgeCard.tsx`, and English vs Writing in `components/parent/LegacyPathwayParentContent.tsx`'s `SUBJECT_COLORS`, resolved by moving English to yellow/gold instead of orange).

Dedicated rendered visual QA (§14 of `PREMIUM_FRONTEND_STANDARD.md`) confirmed no visible purple remains on: `/dashboard` (desktop/tablet/mobile), `/not-found`, `/learning-intelligence/parent`, `/english`, `/verbal-reasoning`, `/mocks`. This QA pass surfaced and resolved a real methodological hazard: this app registers a PWA service worker, which served a stale JS bundle (old purple classes) after the dev server was restarted and even after a plain reload — only a hard reload (cache-bypassing) produced trustworthy evidence. Every screenshot cited above was taken after a hard reload; earlier screenshots in this same session that appeared to show unfixed purple were re-verified and were this caching artefact, not real defects — recorded here so a future session doesn't have to rediscover this.

Remaining PENDING items from the prior entry (loading skeletons, error boundary, login page's own form, the third parent CSSE icon case) are still PENDING — this session's browser time went to the Zero-Purple verification instead of closing those specific items further. The third parent-icon case was checked again this session under the same account/data state and the card still does not render — now confirmed absent across two independent sessions, most likely a data-state precondition rather than a rendering defect, but not proven either way.

**Overall visual QA status (as of the Zero-Purple entry): PARTIALLY VERIFIED.**

**2026-08-31, fourth session — Stages 3–9 continuation.** Founder directive: continue substantive roadmap work, not just colour. Real, verified changes:
- **Stage 3 (shared question shell):** extended `components/ui/Progress.tsx`'s `ProgressBar` to the full subject-identity palette, closing a documented gap (AN-107's own comment recorded `ReasoningSession.tsx` couldn't use the shared component because its palette was too narrow). Migrated `ReasoningSession.tsx` and the Practice session runner (`app/learning-intelligence/practice/[area]/page.tsx`, which previously had no visual progress indicator at all) onto this one shared component — genuine cross-surface consolidation, not a new one-off. The underlying educational logic (guided practice, self-assessment, scaffolding, evidence recording) was read in full and deliberately left untouched — it is sophisticated, carefully-reasoned, and out of scope for a presentation pass.
- **Stage 4 (dashboard):** read the full current implementation, not just the diff. Found it already carries a deep, well-reasoned "Stage 1A" hierarchy pass (Orientation → Primary Work → Secondary rail, Card Reduction Test applied throughout, real semantic `<h1>`, no marketing hero, one CTA) that predates this session and satisfies the roadmap's own stated goal. Applied the removal test fresh in-browser; found nothing further to justify changing. Recorded as substantially complete rather than manufacturing changes.
- **Stage 5 (icon/copy sweep):** removed `Sparkles`/`Brain` from `Navigation.tsx` (the single highest-traffic component) — `Brain` replaced with `FileText` for "Learning Report", `Sparkles` replaced with `Star` (matching the icon `/testimonial` already uses for the same feature, fixing an inconsistency too). Removed decorative `Sparkles` from all four adaptive mock pages' "Personalised" badges and bare header sparkles (8+ instances), while deliberately keeping the two genuinely conditional `{section.adaptive && <Sparkles/>}` status icons in `gl/page.tsx` — those pass the icon-necessity test, the removed ones didn't. Removed the same pattern from English/Maths/Reasoning/Writing subject hubs. Fixed a real ALI-invisible violation on `/progress` ("Competency Progress" heading → "Skills Progress") and three more in visible copy ("Adaptive" appearing directly in `/mocks`, the parent journey timeline, and `app/layout.tsx`'s meta descriptions → "Personalised", matching the term this app already uses elsewhere for the same idea). Fixed an aria-label accessibility gap in `EvidenceTierBadge.tsx` that exposed "tier" to screen-reader users only.
- **Stage 6 (parent) / Stage 7 (mock):** reviewed in full via real interaction (Parent Dashboard, Mock Centre, mock-exam instructions screen, a live timed question). Both already meet the roadmap's stated bar — calm, evidence-first, honest about limitations, genuinely exam-appropriate (flag-for-review, question palette, sealed timing, no gamification). No structural changes made; none were justified by what was found.
- **Stage 8 (responsive):** genuine rendered evidence via the iframe-width harness at 375px for the two Stage 3 surfaces (Practice, Verbal Reasoning) — both render cleanly, no overflow, touch targets intact.
- **Stage 9:** the removal-test pass folded into Stages 4–7's own review above rather than run as a separate late pass, per this session's own "test/inspect during implementation, not only at the end" instruction.

**A real, reproducible methodology hazard found and resolved:** this app's PWA service worker does not reliably clear on a dev-server restart or even a hard reload in every case — it required an explicit `navigator.serviceWorker.getRegistrations()` unregister + `caches.delete()` to get trustworthy rendered evidence after a `Navigation.tsx` icon change (the stale worker was re-serving a broken module reference to the now-removed `Sparkles` import, producing a real client-side crash, not a visual artefact — confirmed via `tsc`/tests/build all passing throughout, isolating it as a browser-cache issue, not a code defect). Recorded here so a future session doesn't lose time rediscovering it.

**Overall visual QA status (as of the fourth-session entry): PARTIALLY VERIFIED.**

**2026-08-31, fifth session — closure increment.** Founder directive: close the evidence-based gaps in Stages 3, 5, 8, 9 before commit. Real findings and fixes:

- **Stage 3 audit:** compared answer-control/feedback/explanation treatment across Reading/Maths/Writing (Practice runner) and the 4 Reasoning subjects. Found the Practice runner already shares one real component (`SubmitOrNext`) between Reading and Maths, and Writing's separately-implemented submit button matches its exact visual treatment deliberately (a legitimate difference — async AI-graded feedback vs instant check, category A). Found one genuine, real, accidental inconsistency (category B): `ReasoningSession.tsx` and all four `mocks/adaptive/*` pages used literal red/green for wrong/right-answer feedback, while the Practice runner deliberately uses amber/emerald and reserves red for genuine error states. Fixed across 5 files, carefully preserving two legitimately different existing uses of red (timer-running-low urgency, and the already-established 3-tier score-band convention) — verified per-file before touching anything.
- **Stage 5 sweep:** found and removed 9 more decorative page-header icon-boxes (the same cover-test failure as the dashboard's earlier fix) across every "Learning Report" utility/report page (`/progress`, `/learning-intelligence` and 7 of its sub-pages) — deliberately not touched on subject-hub pages (English/Maths/Writing/Vocabulary), where the icon does real subject-identity wayfinding work. Found and fixed a real internal-codename leak into visible parent-facing copy: "(Assessment Brain V1)" in `/learning-intelligence`'s pathway-availability note, removed outright (the sentence loses nothing without it). Replaced two more `Brain` icon instances (Navigation's "Learning Report" nav item, the journey timeline's "Educational Insights" stage) with `FileText`, consistent with the earlier Zero-Purple-adjacent fix.
- **Stage 8:** found and fixed a real, reproducible responsive defect: `components/JourneyTimeline.tsx`'s 5-step stepper (used on `/progress` and the parent's Progress Story) genuinely overflowed at narrow widths with no scroll affordance, silently clipping "Admission Ready" — confirmed via direct DOM/CSS inspection (`scrollWidth` vs `clientWidth`) after an initial min-width reduction alone proved insufficient; root cause was `last:flex-none` starving the last (longest-label) step of its share of flex space. Fixed with a genuine root-cause change (`last:flex-none` removed) plus a robust `overflow-x-auto` wrapper so any width too narrow to show all 5 steps scrolls instead of clipping.
- **A second, more severe caching failure mode found and documented:** partway through this session, the dev server began serving stale JS chunks that survived server restarts, fresh tabs, and even hard-reloads of pages loaded via `document.documentElement.innerHTML` iframe injection — only a hard-reload (`Ctrl+Shift+R`) of a **genuinely top-level browser navigation** reliably picked up new code; the iframe-harness technique used throughout this program for width-emulation does **not** reliably receive fresh JS chunks even after the parent frame was hard-reloaded. Verified via direct `element.contentDocument` class inspection, not assumed. This materially limited how much true narrow-viewport (375px) re-verification was possible late in this session — where iframe-based mobile screenshots could not be trusted, DOM/CSS inspection with an element's own width constrained via inline style (proven reliable, used to verify the JourneyTimeline fix) was used instead.

**Overall visual QA status: PARTIALLY VERIFIED**, materially advanced again. See the Founder-facing report for the full PASS/PENDING/BLOCKED breakdown.

**2026-08-31, sixth session — final evidence closure. Stage 3 interaction contract**, derived from the audit across Reading/Maths/Writing/four Reasoning subjects/four adaptive mocks/the standalone English lesson, now that the one real accidental inconsistency found (feedback tone) is fixed:

| Principle | Shared rule | Applies to |
|---|---|---|
| Progress communication | A visible bar (`ProgressBar`, shared component) plus an `N of M` text label, never text alone | Practice, Reasoning. Adaptive mocks use their own equivalent bar+count — same principle, pre-existing separate implementation, not consolidated this session |
| Correct feedback | Emerald icon + text, never colour alone | Universal |
| Incorrect feedback | Amber icon + text (never red — red is reserved for genuine error/danger states app-wide) | Universal, fixed this closure to be actually universal |
| Submission/action hierarchy | One primary blue button; feedback state replaces it with an icon+label plus a Next/Continue action | Reading, Maths share the literal `SubmitOrNext` component; Writing and the adaptive mocks match its visual weight/colour without sharing the component (justified — different underlying async/immediate mechanics) |
| Explanation hierarchy | Shown only after submission, never before; model/worked-example content is opt-in and never the live question's own data | Universal |
| Keyboard/focus | Enter submits where a single-line control allows it; focus moves to the feedback region (not straight to Next) so a screen-reader user reaches the explanation first | Reading, Maths (explicit `feedbackRegionRef` pattern) |
| Mobile | No horizontal overflow on any question surface at 375px (verified this closure) | Universal |

**Justified exceptions, not gaps:** Writing's submission is async and AI-graded (loading state, multi-dimension rubric) — correctly does not share `SubmitOrNext`. The adaptive mock renderers are a separate, pre-existing implementation family (not built by this programme) with their own submission mechanics; this closure aligned their feedback *tone* to the same contract without merging their code with the Practice runner's, which was not asked for and was not safe to attempt at this stage.

**Stage 3 verdict: the interaction contract above is now genuinely met, with exceptions that are documented and justified, not accidental.**

**Zero-Purple final regression — a real, more severe gap found and closed.** All prior sessions' sweeps searched for named Tailwind classes (`purple-600` etc.) and were genuinely thorough for that surface, but missed **arbitrary hex values and non-Tailwind files entirely**, where several live, high-visibility purple references remained:
- `app/mocks/[pathway]/page.tsx` — a manual focus ring using the retired plum hex directly (`focus:ring-[#8b5a7c]`), not a named class.
- `app/layout.tsx`'s `themeColor` metadata and `public/manifest.json`'s `theme_color`/`background_color` — the actual colour of the mobile browser chrome and the PWA splash screen. Both were still purple/the pre-Zero-Purple background.
- `public/offline.html` — the service worker's offline fallback page, a fully standalone static HTML file with its own hardcoded purple CSS, outside every `app/`/`components/` sweep.
- `scripts/generate-icons.js` — generates `icon-192.png`/`icon-512.png`, the actual app icon shown on a user's home screen when installed as a PWA. The purple was baked directly into PNG pixel data. Regenerated with the corrected colour, not just recoloured in source.
- Two operational docs (`DEPLOYMENT.md`, `BETA_DEPLOYMENT_CHECKLIST.md`) and one active reference doc (`ANGEL_EXPERIENCE_SYSTEM_V1.md`) updated to match. `DESIGN_SYSTEM.md` and `ANGEL_NEXT_RELEASE_1_ACCEPTANCE_CERTIFICATE.md` left untouched — both are explicitly historical record, not forward-looking reference.

This is arguably the single highest-value finding of this whole closure increment: the app's own icon and PWA splash screen were still purple even after every in-app surface had been fixed.

---

## Sequence, derived from the evidence

**Stage 1 — Design-system foundation** (closes C2, C3; unblocks everything else)
Typeface selection and adoption; consolidate the seven card primitives into one governed system with resolved colour-key naming; formalise the existing spacing rhythm into named tokens. This is the correct first stage specifically because H2 (header pattern), H4 (loading polish), and the eventual card-level work inside every IMPROVE-classified page in the Benchmark document all become cheaper once this lands — doing page-by-page work first would mean redoing it once the foundation changes.

**Stage 2 — Keyboard interaction standard** (closes C1)
Named as a candidate "early high-value improvement" per the directive's own suggestion, and the Gap Register agrees: C1 has the highest learner-friction score of any single item and the lowest implementation dependency (it does not require Stage 1 to be useful, though applying the eventual visual focus-ring styling consistently benefits from Stage 1 existing first). **Recommendation: sequence this second, immediately after the type/card foundation, not deferred to "polish."**

**Stage 3 — Question/practice interaction shell** (closes H3)
Build the one shared question-rendering shell once Stage 1's primitives exist to build it from and Stage 2's keyboard patterns are proven on a real surface (Practice) before being propagated to Learn and Mock.

**Stage 4 — Learner dashboard re-hierarchy** (closes M1)
Re-centre around one primary action, using Stage 1's card/type system and Stage 3's shell for any embedded question preview.

**Stage 5 — Icon and copy sweep** (closes H1)
A policy-driven pass (Section K/R of the Experience System) across every existing surface — mechanically bounded once the policy exists, deliberately sequenced after the structural stages so it isn't redone when a page's layout changes underneath it.

**Stage 6 — Parent experience extension**
Extend the already-strong CSSE progressive-disclosure pattern (Benchmark Part 3) to every pathway, using the Stage 1-3 foundation.

**Stage 7 — Mock visual experience**
Apply the finished system to the Mock workspace (already semantically sound per 008E/008F) and the Mock report pages — a lighter lift than most stages, since the underlying structure is already correct.

**Stage 8 — Responsive/accessibility hardening**
A dedicated pass once every surface exists in its new form — auditing tablet-specific layouts (M2) and confirming universal `motion-reduce`/focus/ARIA coverage (M3), rather than re-checking each stage individually.

**Stage 9 — Commercial/public surface polish**
Landing/entry, onboarding — lowest priority per the evidence, since this session's own audit found no public marketing surface in the current scope with the same severity of findings as the authenticated product itself.

---

## Quick wins (separable from the structural sequence, safe to schedule opportunistically)

- Typeface adoption (Stage 1's own core action) is itself close to a quick win in isolation — one file, low risk, highest commercial-trust payoff identified in the entire benchmark.
- Icon sweep on the specific, already-named instances (`CssePathwayParentContent.tsx`'s three decorative icons) — small, bounded, no dependency on anything else.
- Loading-state skeleton treatment (H4/L1) — cosmetic, low-risk, can land any time after Stage 1.

## Structural changes (genuinely require sequencing, not shortcuts)

- Card system consolidation (C3) — touches every page that currently imports `components/ui/Card.tsx`; must be planned as a real migration, not a drive-by edit.
- Shared question shell (H3) — the largest single piece of structural work in this roadmap; deliberately placed after both the design foundation and the keyboard standard so it's built once, correctly, not iterated on live.
- Keyboard interaction (C1) — structurally larger than it first appears, since it touches every answer-input type (numeric/short-text/multiple-choice/multi-select/passage) individually, per the Experience System's own Section O.

---

*Document version: V1. Date: 2026-08-18. Sequence proposed only; no stage has been started. Each stage references the specific Gap Register item(s) it closes, not an assumed default order.*
