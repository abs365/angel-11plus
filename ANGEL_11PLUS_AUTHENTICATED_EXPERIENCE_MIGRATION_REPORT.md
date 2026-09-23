# ANGEL 11+ — Authenticated Experience & Design System Migration: Increment 1

Scope: authenticated design foundation + Today + Learn only, per the governing instruction's own
explicit stop condition. Practise, Mock, Progress, Results and Parent Dashboard internals were not
touched. Private Learner Space (CLOSED, GO) was not reopened or modified in any way.

## 1. Baseline findings (inspected before writing any code)

- `PageLayout.tsx`'s outer background (`--background: #faf8f4`) is already almost identical to
  `--angel-ivory` (`#FAF8F3`) — the page-level warmth the Founder associated with the homepage was
  already present. The fragmentation is at a finer grain: card surfaces, borders, headings and body
  text throughout the authenticated app use generic Tailwind grays (`gray-900`/`gray-500`/
  `gray-100`/`sky-700`) rather than the Brand Foundation's own `--angel-navy`/`-ink`/`-border`/`-blue`
  tokens, and radii/pill density lean heavier (`rounded-2xl`/`rounded-3xl`) than the homepage's own
  `rounded-lg`/`rounded-xl`.
- `components/ui/Button.tsx`'s `variant="primary"` is already `bg-blue-600` — byte-identical to
  `--angel-blue`, and it's the exact component the homepage's own CTAs already use
  (`app/page.tsx`'s `<ButtonLink href="/login" size="lg">`). This is a genuinely reusable, already-
  compliant primitive — reused directly in Today and Learn, not duplicated.
- `components/ui/Card.tsx` (`Card`, `MissionCard`, `ProgressCard`, `RecommendationCard`, etc.) is a
  real, shared primitive library — but it is consumed by Progress, Parent Dashboard and other
  out-of-scope surfaces. Restyling it in place would have rippled into pages this increment is
  explicitly forbidden from touching, so it was left untouched; Today and Learn use inline
  Angel-token classes directly instead (see Part 2).
- **A real, concrete content gap was found, not just stale copy**: `lib/learningEngine/
  fullLessonRegistry.ts` (the single canonical registry every real caller, including the
  preparation-decision engine, already reads) lists **5** real lessons — 3 Mathematics (already shown
  on the old Learn hub) plus **2 English Reading lessons** (`RC-01` "Finding the Answer in the Text",
  `RC-02` "What the Text Doesn't Quite Say") that the old Learn hub never listed at all, despite both
  being real, already-shipped, already-registered pages
  (`app/learning-intelligence/learn/english/reading-{retrieval,inference}/page.tsx`, confirmed present
  on disk). This was found by reading the registry directly, not assumed from the Founder's own
  (now-stale) screenshot description.
- `app/dashboard/page.tsx`'s entire data pipeline (`getProgress`, `computeAnalytics`,
  `computeAdaptiveState`, `computeGamification`, `computeParentReport`, the CSSE
  `preparationDecision` block, `getMockResults`) was read in full and confirmed to already be real,
  evidence-driven, and exactly what the governing instruction's own "intelligence must become
  visible" section asks for — the presentation just split it across two stacked cards ("Angel
  recommends next" directly above a separate mission list) instead of one connected story.
- `lib/learningEngine/progressionLabel.ts`'s `hubProgressionLabel()` already produces plain,
  evidence-based, human labels ("Not yet started", "Developing", "Consistent"...) — reused directly
  in the new Learn hub for all 5 lessons, not reinvented.

## 2. Exact reusable design foundation created

Per the governing instruction's own "do not create a giant design-system project — build only what
Today + Learn require," no new component library was built. What was established, demonstrated
consistently across both pages, and documented for reuse in the next increment:

- **Card surface**: `bg-[var(--angel-paper)] rounded-lg border border-[var(--angel-border)]`
  (optionally `shadow-sm` for the one primary/hero surface per page), replacing
  `bg-white dark:bg-gray-900 rounded-2xl border border-gray-100 dark:border-gray-800`.
- **Headings**: `text-[var(--angel-navy)] font-bold`.
- **Body/supporting text**: `text-[var(--angel-ink)]` (primary reading text) or
  `text-[var(--angel-muted)]` (secondary/meta text) — both already contrast-verified against
  ivory/paper in the earlier Brand Foundation work (15.05:1 / 7.14:1), reused, not re-tested from
  scratch.
- **Accent panels/pills**: `bg-[var(--angel-sky)]` with `text-[var(--angel-ink)]` or
  `text-[var(--angel-blue)]`, replacing `bg-gray-50`/`bg-sky-50`.
- **Buttons**: `components/ui/Button.tsx`'s `Button`/`ButtonLink` directly, not hand-rolled classes.
- **Educational-section eyebrow labels**: `text-[10px] font-bold uppercase tracking-wide
  text-[var(--angel-blue)]` for a primary section, `text-[var(--angel-muted)]` for a secondary one.
- **Subject identity**: a small `bg-[var(--angel-sky)]` icon tile with a `text-[var(--angel-blue)]`
  icon — one visual language now used identically for every Mission/lesson/subject row on both pages.
- **Empty/early-learning state**: centred icon tile, one bold headline, one short honest sentence, one
  clear action — demonstrated in Today's zero-evidence "Let's find your starting point" state.
- **Responsive behaviour**: unchanged from the prior implementation's own already-correct
  `lg:grid lg:grid-cols-3` (Today) and single-column `max-w-2xl` (Learn) breakpoints — no responsive
  structure was altered, only colour/spacing within it.

These tokens already branch light/dark via CSS (`app/globals.css`'s own `prefers-color-scheme`/
`[data-theme]` blocks), confirmed directly by reading the homepage's own identical usage — most
elements below need no separate `dark:` class at all, simplifying the code versus the prior
double-class pattern.

## 3. Today changes

- Replaced the two-stacked-cards layout (a standalone "Angel recommends next" card directly above a
  separate Mission-list card) with one connected hero: **Today's Plan → primary recommended activity
  → "Why this today?" → duration → a single Start action → a de-emphasised "Then" list for the
  remaining real mission items**. The "why" text prefers `preparationDecision.stagePrincipleText`
  (the canonical decision contract's own real output, CSSE, once resolved) and falls back to the
  primary mission item's own real `reason` otherwise — both already-real values, nothing invented, no
  new field introduced.
- The LR-01 "Why does Angel suggest this?" privacy popover is preserved verbatim (same copy, same
  link to the full Privacy Notice), just recoloured and repositioned inside the merged hero.
- Zero-evidence ("placement") state: copy changed from "Start your first session" / "Complete any
  practice to unlock your personalised admission mission" to **"Let's find your starting point"** /
  **"A short check helps Angel choose the right level and what to practise first."** — the governing
  instruction's own suggested wording, verbatim.
- Heading renamed from "Today's Admission Mission" to **"Today's Plan"**, matching the governing
  instruction's own suggested hierarchy label.
- Progress/Mock secondary rail: same real data (`parentReport.examReadiness`, `weeklyGoal`,
  `mockResults`/`bestScoreForPathway`/`countForPathway`), recoloured only. `ReadinessIndicator`
  (shared with the out-of-scope Progress page) was not reused directly — a small local
  `ReadinessBar` was added inside this file instead, reading the exact same
  `READINESS_CONFIG[readiness].pct` value, so Progress's own shared component stays untouched.
- Private Learner Space's own "Your preparation: X" plain-text treatment in Learner Mode (previous
  increment) is preserved exactly, unchanged.

## 4. Learn changes

- All **5** real lessons now shown, grouped by subject ("Mathematics", "English: Reading"), instead
  of only the 3 Mathematics ones.
- The internal-development-process copy — *"Angel's CSSE Learn experience is being rebuilt one real
  lesson at a time..."* — is removed entirely, per the governing instruction's own explicit rule.
  Replaced with an honest, professional description of what's genuinely available: *"Real, step-by-
  step lessons for CSSE preparation. Each one teaches a method, then lets you try it with support
  before trying it alone."*
- A one-line distinction is added, per the governing instruction's Subject Language / navigation
  section: *"Learn teaches a skill. Practise applies and strengthens it. Mock measures it under real
  exam conditions."*
- Each lesson row shows its own real, unmodified `educationalState`-derived label
  (`hubProgressionLabel`), fetched via the same `getEducationalIntelligence()` call every lesson page
  itself already makes — extended from 3 calls to 5, nothing new computed.
- No fake locked lessons, no manufactured "coming soon" placeholders, no implied curriculum
  completeness — exactly the governing instruction's own explicit prohibition.

## 5. Learner-facing copy removed/changed

- "Today's Admission Mission" → "Today's Plan".
- "Start Today's Mission" → "Start today's plan".
- "Start your first session" / "Complete any practice to unlock your personalised admission mission"
  → "Let's find your starting point" / "A short check helps Angel choose the right level and what to
  practise first."
- "Angel's CSSE Learn experience is being rebuilt one real lesson at a time..." → removed entirely.
- "Start Learning" → "Start" (placement-state button, Today).

## 6. Real data reused (nothing invented)

`preparationDecision` (canonical decision contract), `mission.items[]` (adaptive engine's own daily
mission, including each item's real `reason`/`estimatedMinutes`/`href`), `parentReport.examReadiness`,
`weeklyGoal`, `mockResults`/`bestScoreForPathway`/`countForPathway`, `pathway`, `childName`,
`hubProgressionLabel(educationalState)` per lesson (via `getEducationalIntelligence`). No new
calculation, ranking, or educational logic was written anywhere in this increment.

## 7. Educational logic preserved

`app/dashboard/page.tsx`'s entire data-fetching `useEffect` — every real engine call
(`computeAnalytics`, `computeAdaptiveState`, `computeGamification`, `computeParentReport`, the CSSE
`computeSubjectPreparationSummary`/`applyCanonicalWritingEvidence`/`toAliCompetencySignal`/
`derivePreparationStage`/`buildPreparationDecision`/`getRecommendations` block) — is byte-identical to
the prior implementation, confirmed directly by diffing the removed lines (only comments and one
relocated JSX reference, no function call removed or altered). The Learn hub's lesson list is
additive (2 more `getEducationalIntelligence()` calls, same function, same shape) and changes no
selection, ranking or eligibility logic anywhere.

## 8. Privacy / isolation preserved

`components/Header.tsx`, `components/Navigation.tsx`, `components/RegisteredAccountGate.tsx`,
`lib/useHouseholdMode.ts`, `lib/learnerPin.ts`, `lib/householdPin.ts` and every other Private Learner
Space file from the prior two increments were **not touched** by this commit (confirmed by `git diff
--stat`: only `app/dashboard/page.tsx` and `app/learning-intelligence/learn/page.tsx` changed). The
one Private-Learner-Space-aware line already in Today (`isLearnerMode` → "Your preparation: X" plain
text instead of a pathway-configuration link) is preserved verbatim, not modified.

## 9. Accessibility checks

- Today's real `<h1 className="sr-only">Today</h1>` is preserved; `<h2>Today&apos;s Plan</h2>`
  remains the next real heading level — no skipped levels introduced.
- Primary actions use `ButtonLink` (a real anchor via `next/link`, not a styled `<div>`).
- The "Then" secondary mission items are real `<Link>` elements with visible label + reason text, not
  icon-only.
- The LR-01 privacy Popover's trigger retains its `sr-only` accessible name, unchanged.
- Colour pairs used (`--angel-navy`/`--angel-ink`/`--angel-muted` on `--angel-ivory`/`--angel-paper`)
  reuse the exact tokens already contrast-verified in the Brand Foundation work — no new colour
  combination was introduced that would need fresh contrast checking.
- Not independently re-verified this session with a screen reader or automated axe-style scan against
  a live authenticated session (see Section 16 — no authenticated session available).

## 10. Responsive checks

No responsive breakpoint structure was changed in either file — Today's `lg:grid lg:grid-cols-3` main/
secondary split and Learn's single-column `max-w-2xl` layout are identical to the prior
implementation; only colours, radii and internal composition changed within those unchanged
breakpoints. Not independently re-verified at real tablet/mobile widths against a live authenticated
session this session (see Section 16).

## 11. Files changed

`app/dashboard/page.tsx`, `app/learning-intelligence/learn/page.tsx`. No other file. No new shared
component file was created (per Section 2's own "do not create a giant design-system project"
reasoning) and no migration was created or touched.

## 12. Tests

Structural tests that read `app/dashboard/page.tsx`'s source directly
(`tests/lib/crossAccountDeviceState.test.ts`'s "EXISTING single-child families are not forced through
setup" test, which asserts the exact `ParentSetupCard` gating condition) were checked and confirmed
still passing — that exact line was preserved verbatim. No test anywhere in the repository asserted
the old Today/Learn copy this increment changed (checked directly, confirmed absent), so no test
needed updating. Full clean-checkout gate: **4,783 / 4,784 pass, 0 failures, 1 pre-existing skip**
(unchanged count from before this increment — this was a presentation-only change, not new logic to
test).

## 13. Build

Clean-checkout gate (genuine `git worktree` of the deployed commit): typecheck 0 errors;
`migration-sql-guard` PASS, 259 files (unchanged); `copy-guard` 51 violations, identical to the
established baseline (the file/line that appears under `app/dashboard/page.tsx` is the pre-existing
LR-01 privacy-notice em dash, preserved verbatim from the original, not newly introduced — confirmed
by the unchanged total count); `eslint` 114 problems (83 errors / 31 warnings), identical to the
established baseline; genuine `next build` PASS, no bypass flag — `/dashboard` and
`/learning-intelligence/learn` (plus its 4 real lesson sub-routes) all built and statically
prerendered successfully.

## 14. Commits

`bbac365` — `feat(experience): Increment 1 -- authenticated design foundation, Today, Learn`.

## 15. Deployment

Pushed to `origin/main`. Vercel deployed automatically
(`angel-11plus-9249asfoa-abs365s-projects.vercel.app`, status Ready), confirmed aliased to
`https://www.angel11plus.com` and the other production domains.

## 16. Production verification

Fetched the live JS bundles referenced by `/dashboard` and `/learning-intelligence/learn` directly
(not through a browser) and confirmed genuinely deployed: Today's new "Let's find your starting
point" copy and "Today's recommended activity" hero label; Learn's new "Finding the Answer in the
Text" (RC-01) and "What the Text Doesn't Quite Say" (RC-02) entries; confirmed the old "being
rebuilt" copy is genuinely **absent** from the live bundle. Both routes return HTTP 200. Loaded
`/learning-intelligence/learn` in a real browser: renders correctly, no regression to the existing
controlled-beta access gate for an unauthenticated visitor (confirmed by screenshot).

**Explicitly not verifiable this session, and why**: the governing instruction's own Real Content Test
and Acceptance Evidence sections require real production-shaped authenticated states (zero-evidence
learner, some practice evidence, an active recommendation, lesson entry, desktop/tablet/mobile
screenshots of the actual rendered Today and Learn pages, and reconfirming Learner Mode's privacy
controls against a live session). I have no authenticated production session this session, and per
this project's standing rule I did not create one. This is the same disclosed limitation every prior
increment touching an authenticated surface in this engagement has carried, and it is squarely the
Founder's next step, per the governing instruction's own "Founder will perform final visual/experience
acceptance" line.

## 17. Remaining educational-content limitations (unchanged by this increment, recorded not fixed)

Exactly 5 real Learn lessons exist (3 Mathematics, 2 English Reading) — now honestly and fully shown,
but still genuinely thin relative to a full CSSE curriculum. This increment did not, and was
explicitly instructed not to, manufacture additional lessons or claim broader curriculum coverage.
Educational depth remains a separate, substantive, not-yet-scoped requirement.

## 18. Remaining authenticated surfaces to migrate

Practise internals, Mock internals, Progress internals, Results internals, Parent Dashboard internals,
and the pre-existing `ParentPinModal` all still use the pre-Brand-Foundation styling this increment's
own foundation (Section 2) is ready to extend to. Recorded as the continuation of **ANGEL 11+
AUTHENTICATED EXPERIENCE & DESIGN SYSTEM MIGRATION**, not started automatically, per the governing
instruction's own explicit stop condition.

---

**ANGEL 11+ AUTHENTICATED EXPERIENCE & DESIGN SYSTEM MIGRATION — INCREMENT 1 (Foundation + Today +
Learn): IMPLEMENTED, TESTED, DEPLOYED, PRODUCTION-VERIFIED AS FAR AS AVAILABLE ACCESS PERMITS.**

Founder visual/experience acceptance required before this increment is considered complete — see
Section 16's explicit disclosure of what could not be verified without an authenticated session.

Per the governing instruction: STOP here. Practise, Mock, Progress, Results and Parent Dashboard were
not started. The full authenticated experience migration is not marked complete.

---

## Increment 1B — Founder visual correction (2026-09-23, same day)

Founder production visual review found Increment 1's content/data corrections sound (preserved
exactly, unchanged) but the composition still too plain and application-like — not yet carrying the
homepage's own identity. This is a presentation-only correction on top of Increment 1; no data source,
calculation, lesson, route or educational logic changed in either file.

**1. What visually changed on Today**: the primary recommendation moved from a bordered white
application card into one large `bg-[var(--angel-sky)] rounded-lg p-6 md:p-10` panel — the exact same
treatment the homepage's own "A clear plan for today" example section already uses. Typography scaled
up throughout to match the homepage's own editorial scale: the greeting message
(`text-xl` → `text-2xl md:text-3xl`), "Today's Plan" heading (`text-2xl` → `text-3xl md:text-4xl`,
now preceded by the homepage's own `GoldRule` accent), "why this today" (now a flowing
`text-base md:text-lg` paragraph instead of a cramped `text-sm` sub-box). The "Then" list moved out of
a nested card into a plain `divide-y divide-[var(--angel-border)]` list at larger type, matching the
homepage's own list rhythm exactly. The Progress/Mock panel gained more padding and larger type so it
reads as a real secondary section, not a detached dashboard widget. The zero-evidence placement state
now gets the identical confident sky-tinted treatment as a real recommendation, not a smaller/lesser
placeholder box.

**2. What visually changed on Learn**: subject (Mathematics, English: Reading) is now the real
organising principle — a genuine heading (icon roundel + `text-2xl md:text-3xl` subject name +
one-line intro), matching the homepage's own "Five subjects. One connected plan." treatment, with
that subject's lessons shown as one flowing divided list inside a single sky-tinted panel (same
`bg-[var(--angel-sky)]` + `divide-y divide-[var(--angel-border)]` pattern as Today's own hero and the
homepage's own example panel) — replacing the previous narrow list of individually bordered rows.

**3. How the homepage identity was carried through**: every new treatment in both files is a direct,
named reuse of a pattern already visible in `app/page.tsx` — the sky-tinted panel (`bg-[var(--angel-
sky)] rounded-lg p-8 md:p-12` → "Today's Plan" example section), the divided list inside it
(`divide-y divide-[var(--angel-border)]`), the `GoldRule` accent before a primary heading, the
`text-3xl md:text-4xl` section-heading scale, and the `dt/dd`-style subject identity (icon + large
name + one-line intro) from "Five subjects. One connected plan." No new visual treatment was invented;
each one is traceable to a specific homepage section, checked directly before use.

**4. All five genuine lessons remain**: confirmed unchanged — 3 Mathematics (`MR-01`/`MR-04`/`MR-03`)
+ 2 English Reading (`RC-01`/`RC-02`), same routes, same `fullLessonRegistry.ts` source, same
`getEducationalIntelligence()` calls.

**5. No fake/new lessons or progress introduced**: confirmed by diff — no new lesson entry, no new
competency id, no new mock data, no new calculation anywhere in either file. The one real, valid piece
of data dropped from the visible layout (the aggregate `mission.totalMinutes` pill that previously sat
beside the old heading) was a deliberate decluttering choice, not data suppression — the per-item
duration for the primary recommendation is still shown, and the aggregate figure is still real and
computed, simply no longer surfaced as its own pill now that the primary item's own duration is more
prominent.

**6. Private Learner Space and PIN architecture untouched**: confirmed by `git diff --stat` on both
commits (`bbac365`, `469f97d`) — only `app/dashboard/page.tsx` and
`app/learning-intelligence/learn/page.tsx` changed; `Header.tsx`, `Navigation.tsx`,
`RegisteredAccountGate.tsx`, `useHouseholdMode.ts`, `learnerPin.ts`, `householdPin.ts` and every
migration are untouched. Migrations 260–263 were not reopened or rerun.

**7. Desktop/tablet/mobile implementation status**: no responsive breakpoint structure was changed —
Today's `lg:grid lg:grid-cols-3` split and Learn's single-column layout are structurally identical to
Increment 1; only colour, type scale and internal spacing changed within those unchanged breakpoints.
Not independently re-verified at real tablet/mobile widths against a live authenticated session this
session — same disclosed limitation as Increment 1 (Section 16 above): no authenticated production
session is available, and none was created, per this project's standing rule.

**8. Commit and deployment status**: commit `469f97d` —
`feat(experience): Increment 1B -- visual correction for Today + Learn`. Clean-checkout gate: typecheck
0 errors, tests 4,783/4,784 (unchanged), migration-sql-guard PASS, copy-guard/eslint unchanged from
baseline, genuine `next build` PASS. Pushed, deployed
(`angel-11plus-mnjlkrhab-abs365s-projects.vercel.app`, Ready), confirmed aliased to
`https://www.angel11plus.com`. Fetched the live JS bundles for both routes directly and confirmed the
new copy ("Recommended for you today", "Core skills and methods for CSSE Mathematics") is genuinely
deployed; both routes return HTTP 200.

**Not declaring visual GO.** Per the governing instruction's own explicit instruction, tests/build/
deployment passing is not sufficient grounds for that verdict — the Founder will perform final
production visual acceptance from real screenshots. Stopping here: Practise, Mock, Progress, Results,
Parent Dashboard and the RLS-hardening item were not started.

---

## Increment 1C — Founder final visual acceptance corrections (2026-09-23, same day)

Founder reviewed real production Today and Learn screens after commit `469f97d` and confirmed the
visual direction from Increment 1B is materially improved and must be preserved. This is a bounded
finishing pass fixing specific defects/weaknesses, not a further redesign.

**1. Root cause of the Today clipping defect**: no horizontal overflow was reproducible at any tested
width (verified 390px–1920px via a static, unauthenticated reproduction built from the real
`app/globals.css` Angel tokens and the exact className strings in the real JSX, with deliberately
long worst-case text). The genuine cause was structural, not an overflow bug: the grid's `lg:`
(1024px) breakpoint meant any browser window narrower than 1024px — a very common non-maximised
"desktop" width — fell back to single-column, stacking Progress/Mock Exams below a now-tall primary
recommendation panel, pushing it far enough down the page that a first screenful, or a screenshot,
would genuinely not show it. That reads as "clipped beyond the viewport" even though nothing was
technically clipped.

**2. Exact responsive correction**: Today's grid split now activates at `md:` (768px) instead of
`lg:` (1024px) — `app/dashboard/page.tsx`'s three grid-related class strings changed from
`lg:grid lg:grid-cols-3 lg:gap-10 lg:items-start` / `lg:col-span-2` / `lg:mt-0 lg:col-span-1` to
`md:grid md:grid-cols-3 md:gap-8 lg:gap-10 md:items-start` / `md:col-span-2` / `md:mt-0
md:col-span-1`. Progress/Mock now sits genuinely beside the plan across nearly all realistic desktop/
laptop widths; single-column stacking now only happens below 768px (true tablet-portrait/mobile),
matching the governing instruction's own explicit allowance ("At narrower widths: allow the secondary
progress area to move below the main plan when necessary"). Added defensive `min-w-0` to both grid
columns and to the recommended-activity headline's flex row (standard CSS Grid/Flexbox hardening
against long real-world text overflowing a flex item). Trimmed a small amount of vertical spacing
above "Today's Plan" (`mt-10 md:mt-14` → `mt-8 md:mt-10`) — proportionate, not a reversal of
Increment 1B's larger type/spacing direction.

**3. Learn content-width correction**: outer container widened from `max-w-3xl` (768px) to
`max-w-4xl lg:max-w-6xl`, matching Today's own container convention exactly — closing the "almost the
entire canvas is empty" gap the Founder observed at typical zoom levels. Lesson text itself (title +
blurb + status) is capped at `max-w-2xl` inside the now-wider sky panel, and each subject's one-line
intro is capped at `max-w-xl`, so line lengths stay comfortable even though the panel itself now uses
materially more of the available canvas.

**4. Lesson Start/Continue affordance correction**: the previous single small `ArrowRight` icon (the
only visual cue a row was clickable) is replaced with an explicit rounded pill — `bg-blue-600
text-white` — reading "Start lesson" or "Continue" plus a small arrow, genuine-state only. State is
derived directly from the same real `educationalState` already fetched via
`getEducationalIntelligence()`: "Continue" only once the fetch has resolved (`loaded`) and the state is
neither `undefined` nor `"exploring"` — the exact same not-started condition `hubProgressionLabel`
itself already uses. Before the fetch resolves, the pill defaults to "Start lesson" — a safe,
non-claiming default — never "Continue" ahead of real evidence. The entire row remains one `<Link>`
(whole-row-clickable); the pill is a styled `<span>`, not a nested interactive element, so no invalid
nested-link/button markup was introduced.

**5. Secondary navigation separated from lessons**: "Practise instead" and "See your Learning Report"
no longer use `LessonRow`'s treatment (icon roundel, title/body pair, arrow) inside any sky panel.
They now render as two small plain-text links (`text-sm font-medium text-[var(--angel-blue)]`) under a
"More ways to work" label, positioned after and visually lighter than the real lesson catalogue —
matching the instruction's own target: Learn = lessons, Practise = questions, Learning Report =
progress, visually distinct at a glance.

**6. All five genuine lessons confirmed unchanged**: 3 Mathematics (`MR-01`/`MR-04`/`MR-03`) + 2
English Reading (`RC-01`/`RC-02`), same routes, same `fullLessonRegistry.ts` source, same
`getEducationalIntelligence()` calls — confirmed by diff, no lesson entry added, removed or reworded
beyond the two subject-level intro sentences (Part 4 below).

**Subject copy** (governing instruction Part 4): Mathematics intro changed from "Core skills and
methods for CSSE Mathematics." to "Build the mathematical skills and methods you need for
selective-school preparation." English: Reading intro changed from "Working with real passages, not
isolated trick questions." to "Find evidence, understand meaning, and make inferences from what you
read." Both drop internal/pathway jargon in favour of the instruction's own given language.

**7. Desktop/tablet/mobile verification actually performed**: no authenticated production session was
created or used, per the project's standing rule — the same disclosed limitation every prior increment
touching an authenticated surface in this engagement has carried. What was genuinely done instead: a
standalone static HTML reproduction, built from the real `--angel-*` custom properties in
`app/globals.css` and the exact className strings copied verbatim from the real, currently-committed
JSX in both files, served locally and inspected via injected `<iframe>` elements at specific pixel
widths with `getComputedStyle` used to confirm the grid genuinely activates/deactivates at the intended
breakpoint (not just that no error occurred). Tested widths: 390px and 430px (mobile), 768px, 900px and
1024px (tablet / common non-maximised laptop), 1280px, 1366px, 1440px and 1920px (desktop), at heights
down to 700px. Result: zero horizontal overflow at every width tested, including with deliberately
long worst-case text in the primary recommendation headline, the "why this today" paragraph and lesson
titles/blurbs; the grid correctly falls back to single-column only below 768px. This is a structural,
class-level verification against the real rendering rules (Tailwind v4's own grid/flex behaviour), not
a claim of having seen the real authenticated production page — that step remains the Founder's, per
the governing instruction's own explicit requirement to state this honestly rather than claim visual
verification that did not occur.

**8. Commit and deployment status**: commit `d56d3b3` — `feat(experience): Increment 1C -- Today/Learn
final visual acceptance corrections`. Clean-checkout gate in an isolated worktree at this exact commit:
typecheck 0 errors, tests 4,783/4,784 pass (1 pre-existing skip, unchanged), migration-sql-guard PASS
259 files, copy-guard 51 pre-existing violations (unchanged, no new violation), eslint 114 problems
(83 errors/31 warnings, unchanged baseline), genuine `next build` PASS. Pushed to `origin/main`,
Vercel auto-deployed (`angel-11plus-h9ejm1qu1-abs365s-projects.vercel.app`, Ready), confirmed aliased
to `https://www.angel11plus.com`. Fetched the live, deployed JS chunks for both routes directly
(`0mcdwneml2g1s.js` for Learn, `0ha47zd5yfs2r.js` for Today) and confirmed byte-for-byte: the new
subject copy, the "Start lesson"/"Continue" pill text, "More ways to work", and the `md:grid
md:grid-cols-3` breakpoint class are all genuinely present in production; the corresponding old strings
and the old `lg:grid lg:grid-cols-3` class are confirmed absent.

**Not declaring visual GO.** The Founder performs final visual acceptance from real production
screens, per the governing instruction's own explicit stop condition. Stopping here: Practise, Mock,
Progress, Results, Parent Dashboard, RLS hardening and educational content expansion were not started;
migrations 260–263, Parent PIN, Learner PIN, Private Learner Space, authentication, learner isolation,
Educational Intelligence and recommendation logic were not touched.

---

## Increment 2 — Practise + Mock Angel Foundation visual pass (2026-09-23)

Founder milestone: **Today + Learn — GO**, frozen except for genuine production defects. This
increment brings the real CSSE Practise and Mock learner journeys into the same Angel 11+ identity,
following full-journey inspection rather than a landing-page-only restyle.

**1. Practise baseline problems found**: the CSSE Practice runner (`app/learning-intelligence/
practice/[area]/page.tsx`, the single shared engine for Reading Comprehension, Mathematics and
Continuous Writing — confirmed via import/route trace, not filename) and its area-selector hub used
**zero** Angel Foundation tokens — 100% generic Tailwind gray/white/blue, the shared `InfoCard`
component's own default styling throughout. The Reading passage was `text-xs`, height-capped at 224px
and force-scrollable — the opposite of "a comfortable reading measure." The only per-lesson affordance
was a small `ArrowRight` icon (the same weakness already corrected on Learn in Increment 1C, never
carried to Practise). Writing feedback was labelled "Angel progress indicator: X/100" — internal-
sounding phrasing. Two genuinely separate systems exist (legacy pathway Practice at `/reasoning` +
`/english`/`/maths`/`/vocabulary`, vs. the CSSE engine); the CSSE nav "Practise" tab and every real
CSSE entry point (Today's mission items, Learn's lesson "ready to practise" links) reach the CSSE
engine exclusively, confirmed by trace — that is what this increment restyled.

**2. Mock baseline problems found**: `/mocks` (Mock Centre) is the literal, unconditional front door
for **every** pathway including CSSE — Today's own "Mock Exams" panel and the global nav "Mock" tab
both link there with no pathway branching, confirmed by reading `app/dashboard/page.tsx` and
`components/Navigation.tsx` directly. From there, a CSSE learner reaches the real, canonical engine
(`app/learning-intelligence/mock-exam/**`); zero Angel tokens anywhere in either the hub or the engine.
The hub's exam-board cards used full bright coloured backgrounds (blue-50/slate-50/emerald-50) —
readable as a gamified pathway picker, not calm assessment. The engine's own *behaviour* was already
correct and is explicitly preserved: no hints, no mid-sitting feedback, no gamification, a flat
non-celebratory "Your Mock has been submitted" hand-off — confirmed unchanged by diff (no state,
handler, RPC call, or phase-transition logic touched anywhere in this increment).

**3. Exact learner surfaces changed** (12 files, visual/copy only): `app/learning-intelligence/
practice/page.tsx`, `app/learning-intelligence/practice/[area]/page.tsx`, `app/mocks/page.tsx`,
`app/learning-intelligence/mock-exam/page.tsx`, `app/learning-intelligence/mock-exam/sitting/page.tsx`,
`app/learning-intelligence/mock-exam/sitting/results/page.tsx`, `components/mockAttempt/{ExamTimer,
QuestionPalette,DataTableStimulus,ImageStimulus,ReadingPassage}.tsx`. One further file received a
copy-only defect fix, not a visual pass: `app/learning-intelligence/parent/mock-report/[attemptId]/
page.tsx`.

**4. Visual/UX changes made**:
- **Practise**: `InfoCard`/generic-gray replaced with Angel-paper (`bg-[var(--angel-paper)] border
  border-[var(--angel-border)]`) cards throughout the runner, hub and results screen — the same
  established pattern Today/Learn already use for out-of-scope-shared-component avoidance. The
  question stem is now the dominant object (`text-base md:text-lg font-semibold`, up from `text-sm`).
  The Reading passage is now `text-sm md:text-base`, capped at 288–384px (was 224px) — genuinely more
  readable, not just technically "not tiny". Feedback/model-answer/misconception boxes now use
  `bg-[var(--angel-sky)]` (Today's own established "supportive content" tint), matching Phase 3's "can
  feel supportive and instructional" for Practice specifically. The area-selector hub adopts Learn's
  own sky-panel/divided-list/pill-affordance pattern from Increment 1C, for family consistency between
  the two adjacent "what do I do" screens.
- **Mock**: deliberately calmer than Practise, per Phase 3's explicit instruction not to reuse the same
  treatment everywhere. Exam-board identity on Mock Centre's cards moved from a full bright coloured
  card background to a thin left accent stripe on an otherwise neutral Angel-paper card — distinguishable
  at a glance, without reading as gamified. The live sitting engine, its question renderer, and all
  five shared `mockAttempt/*` components got the same neutral Angel-paper/border treatment, bigger
  question typography, and a readable (no longer height-capped) passage — with the sitting's own
  already-correct restraint (no colour celebration, no confetti, a flat submission screen) fully
  preserved.

**5. Educational behaviour preserved** (confirmed by diff, not assertion): every state variable, event
handler, evidence-recording call (`recordPresentation`/`recordOutcome`/`processEvidenceForCompetency`),
guided-practice scaffold, self-assessment flow, `computePreparationDecision`/placement-redirect logic,
and every Mock RPC call (`createMockAttempt`/`startMockAttempt`/`submitMockAnswer`/`submitMockAttempt`/
`setMockFlag`/`requestReadingScoring`) is byte-for-byte unchanged. Only `className` strings and the
handful of copy strings named in Section 4/6 below changed. `git diff --stat` confirms no other file
outside the 13 listed was touched — migrations 260–263, Parent PIN, Learner PIN, Private Learner Space,
authentication, learner isolation, Educational Intelligence and recommendation logic untouched.

**6. Question-working surfaces verified**: readable typography confirmed for question stems, Reading
passages and Mock question/passage rendering (all bumped from `text-xs`/`text-sm` to `text-sm`/
`text-base` with a genuinely larger passage viewport); Mathematics diagrams (`CompoundShapeDiagramGroup`)
and the data-table/image Mock stimuli (`DataTableStimulus`/`ImageStimulus`) untouched in logic, restyled
to Angel tokens only; answer controls (textareas/inputs) gained visible focus rings
(`focus-visible:outline-2 outline-[var(--angel-blue)]`) they previously lacked; selected/answered states
in the Mock `QuestionPalette` remain colour-plus-shape distinct (never colour-only), unchanged in logic;
Next/Previous/Submit and the Mock flag control unchanged in behaviour, restyled only. Confirmed **no**
hint/teaching/answer-revealing feedback exists anywhere in the live Mock sitting (unchanged from
baseline — this was already correct). Two copy fixes made in passing, both directly on this
increment's own "no internal engineering terminology visible to a learner" rule: "Angel progress
indicator: X/100" → "Your writing score: X/100" (Practice Writing feedback); raw `competencyId` codes
(e.g. "RC-01", "MR-03") rendered as visible strength/weakness text on the two-paper Mock results screen
→ passed through the same `childFriendlySkillLabel()` translation the sibling mock-report page already
established for exactly this purpose; internal directive section-numbering ("1. Result", "2. Diagnostic
interpretation" … "6. Exam context") leaking into the parent Mock report → numeric prefixes removed.

**7. Responsive verification**: no authenticated production session was created, per the project's
standing rule — the same disclosed limitation every increment touching an authenticated surface in this
engagement has carried. Verified instead: a full clean-checkout `next build` succeeded for every touched
route (`/learning-intelligence/practice`, `/learning-intelligence/practice/[area]`, `/mocks`,
`/learning-intelligence/mock-exam`, `/learning-intelligence/mock-exam/sitting`, `/learning-intelligence/
mock-exam/sitting/results`), confirming no compile-time responsive-class error; every className change
follows the identical, already-verified Tailwind v4 breakpoint discipline established and iframe-tested
in Increments 1/1B/1C (standard `md:`/`lg:` breakpoints, `min-w-0` hardening on flex/grid items where
introduced). A genuine, real-viewport screenshot walkthrough at 390/430/768/900/1024/1280/1366/1440/1920
was not performed this session and is not claimed — the Founder's own production screens remain the
required final responsive/visual evidence, exactly as the governing instruction itself requires.

**8. Tests/build result**: clean-checkout gate in an isolated worktree — typecheck 0 errors; tests
4,783/4,784 pass (1 pre-existing skip, unchanged); migration-sql-guard PASS 259 files; copy-guard 51
pre-existing violations (unchanged, no new violation); eslint 114 problems (83 errors/31 warnings,
unchanged baseline); genuine `next build` PASS. Three pre-existing structural source-text tests (this
project's established no-jsdom convention for these pages) had selectors anchored on exact strings this
increment deliberately changed (`</InfoCard>` → `</div>`; a literal `dark:` assertion superseded by
Angel tokens, which already branch dark/light via CSS; the removed `"2. "` section-number prefix) —
updated to match the new, correct source rather than reverting the underlying change; their real
assertions (message content, conditional ordering, dark-mode support) are unaffected.

**9. Commit**: `c3bd15e` (feature) + `3b4cc28` (test-selector updates for the above). Pushed to
`origin/main`.

**10. Deployment status**: Vercel auto-deployed (`angel-11plus-h08ac0z30-abs365s-projects.vercel.app`,
Ready), confirmed aliased to `https://www.angel11plus.com`. Fetched the live deployed JS chunks for
Practice hub, Mock hub and the Mock sitting engine directly and confirmed the new copy/markup is
genuinely present (e.g. "Choose a Practice Area", "A quiet, formal check of your progress", "Before you
begin") and the old generic-Tailwind card/background classes are genuinely absent.

**11. Requires Founder production verification**: (a) the full visual/UX result on real devices —
desktop, tablet and mobile, exactly as Increment 1/1B/1C's own screens were; (b) a separate, larger
decision on `app/mocks/[pathway]/page.tsx` (the live GL/CEM/ISEB legacy Mock) — during Phase 1
inspection this was found to show correct/incorrect **plus a worked explanation** immediately after
each answer, **during the timed section itself**, which is a genuine violation of "Mock is quiet
assessment... no answer-revealing feedback" for the three pathways that have no other Mock experience
at all. This is a real product defect, not a visual one, and is reported here rather than fixed —
correcting it means changing live scoring-timing behaviour for a separate pathway system, which is a
materially larger and separate decision than this increment's visual scope, per the governing
instruction's own "smallest safe correction" discipline for an in-passing finding.

**Not declaring visual GO or Increment 2 GO.** Per the governing instruction's own explicit stop
condition, the Founder performs final visual/UX acceptance from the real production learner experience.
Stopping here: Progress, Results and Parent Dashboard were not started.
