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
