# ANGEL 11+ — Increment 1A: Public Homepage Visual Refinement + Brand Foundation v1.0

**Scope:** the public homepage (`/`) and its own isolated design components
(`components/public/*`, `app/globals.css`'s new `--angel-*` token block)
only. No learner architecture, Today, Practice engine, lessons, Question
Factory, Mock engine, Writing assessment, Parent Dashboard application
architecture, multi-learner, RLS, Supabase, database, migrations, or
authentication architecture was touched.

---

## A. Brand Foundation v1.0

Final token values (`app/globals.css`, new block at the end of the file,
scoped to `components/public/*` only):

| Role | Token | Value | Reuses |
|---|---|---|---|
| Academic Navy | `--angel-navy` | `#14213D` | new |
| Angel Blue | `--angel-blue` | `#2563EB` | `var(--color-primary)` — identical existing value, not a duplicate |
| Warm Ivory | `--angel-ivory` | `#FAF8F3` | new |
| Paper White | `--angel-paper` | `#FFFFFF` | `var(--surface)` — identical existing value |
| Warm Gold | `--angel-gold` | `#C58A2A` | new, decorative-only (see below) |
| Soft Sky | `--angel-sky` | `#EAF2FF` | new |
| Ink | `--angel-ink` | `#172033` | new |
| Slate/muted | `--angel-muted` | `#475569` | `var(--color-secondary)` — identical existing value |
| Border | `--angel-border` | `#E7E2D6` | new, warm-neutral, distinct from the app's cooler `--border` |

**Contrast results** — computed directly by the WCAG 2.x relative-luminance
formula (script run, not eyeballed), every pairing this page actually uses:

| Pair | Ratio | AA (4.5:1) normal text |
|---|---|---|
| Ink vs Ivory | 15.33:1 | Pass |
| Ink vs Paper | 16.27:1 | Pass |
| Navy vs Ivory | 15.05:1 | Pass |
| Navy vs Paper | 15.97:1 | Pass |
| Slate vs Ivory | 7.14:1 | Pass |
| Slate vs Paper | 7.58:1 | Pass |
| Angel Blue vs Ivory | 4.87:1 | Pass |
| Angel Blue vs Paper | 5.17:1 | Pass |
| Ink/Navy/Blue vs Soft Sky | 14.44:1 / 14.18:1 / 4.59:1 | Pass |
| **Warm Gold vs Ivory** | **2.81:1** | **Fail** |
| **Warm Gold vs Paper** | **2.98:1** | **Fail (also fails the 3:1 large-text/non-text threshold)** |

**Accessibility adjustment:** Warm Gold fails AA at the Founder-proposed exact
hex against both backgrounds it would plausibly sit on. Rather than alter the
Founder's specified colour (the governing instruction's own preference —
"do not weaken the overall palette direction"), the fix applied is scope
restriction: `--angel-gold` is used only as a purely decorative, non-text
accent (a 2px rule beneath two section eyebrows, and the pencil body inside
the hero SVG) — never as text, never as a button fill, never behind text.
Both current uses are confirmed decorative-only by direct code review. This
matches the governing instruction's own framing of gold as "very
restrained... occasional milestone detail... NOT a primary UI colour"
exactly.

**Usage rules enforced in the token block's own comment** (`app/globals.css`):
navy for headings/wordmark/authority; blue reserved for CTAs, links and
active/selected controls; gold never for headings, buttons, or gradients;
functional colours (error/success/warning) untouched, still their existing
semantic values.

**Colour proportion** (visual estimate against the shipped page, not a CSS
measurement): alternating ivory/paper section backgrounds carry roughly
60–65% of the page; navy headings and body ink read as the dominant
typographic colour at ~20–25%; Angel Blue is confined to CTAs, links, step
numerals and small eyebrow labels, reading as roughly 8–10%; gold appears in
exactly two decorative rules plus the illustration's pencil, comfortably
under 3%.

## B. Cards

**Removed:**
- The six independent Learn/Practise/Check/Review/Mock/Improve cards
  (rounded border + icon-in-circle + heading + paragraph, repeated six
  times) — replaced by one connected, numbered `<ol>` sharing a single
  border-rule across all six items (a real timeline, not six boxes).
- The five-subject icon-card grid ("What children practise") — replaced by
  a plain `<dl>` definition list with a thin divider between entries.
- The four-item "Our approach" icon-card grid — replaced by a plain `<dl>`
  grid, typography only.
- The hero illustration's own heavy rounded/bordered/padded panel — the
  illustration now sits in a quiet, borderless, fixed-aspect image slot.

**Remain (with reason each genuinely behaves as a self-contained unit):**
- The "A clear plan for today" example panel (rounded, Soft Sky background).
  This is the one deliberate exception: it must read as visually distinct
  from real navigation/content, because it is explicitly illustrative, not
  live data — the card boundary itself is part of communicating "this is a
  worked example, not your child's real plan," not decoration.
- Primary/secondary CTA buttons (`Button`/`ButtonLink`) — these are real
  interactive controls with their own existing, reused component, not new
  card surfaces.

## C. Icons

**Removed:** every decorative icon that previously sat above a heading or
explanatory paragraph purely as visual filler — the six journey-step icons,
the five subject icons, the four trust-section icons, the Mock section's
trophy-in-circle. None of these carried comprehension that the adjacent
heading/text didn't already carry on its own.

**Remain, each for a stated reason:**
- `CheckCircle2` beside each "For parents" bullet — a real semantic
  affirmation marker for a benefits list a parent scans quickly; kept
  deliberately small and monochrome (Angel Blue), not part of an icon-square
  grid.
- Nothing else. The header/footer carry no decorative icons at all (only
  text links and the two CTA buttons).

## D. Homepage

- **Hero:** new headline ("11+ preparation shaped around your child.") and
  sub-copy per the approved direction; asymmetric 7/5 desktop column split
  (was an even 50/50) so the composition reads as intentional rather than a
  centred template; the illustration is smaller and no longer boxed.
- **Preparation journey:** one connected `<ol>` (numbers 01–06 in Angel
  Blue, navy step titles, one line of body copy each), a shared border rule
  creating the "connected" visual on desktop and a left-rule timeline on
  mobile — verified in a genuine production build and the live deployment
  (§I; a `next dev` Turbopack HMR artifact briefly made this look
  single-column during local iteration, traced and confirmed not to affect
  `next build` or the deployed site — see §I).
- **Product story ("A clear plan for today"):** new section, explicitly
  labelled "Example," three illustrative plan items with time estimates,
  and an explicit "This is an example plan, not a real child's data"
  disclosure — never implies real learner data.
- **Personalisation:** kept the concept, dropped the icon-in-circle
  treatment, added the required "Angel recommends. Family chooses." line
  verbatim, with one supporting sentence making clear a recommendation is
  never the only path.
- **Subjects:** editorial `<dl>` list (English/Mathematics/Vocabulary/
  Writing/Mock Tests), no icons, no per-subject colour (per the governing
  instruction's explicit "Angel should not become a rainbow learning app"
  rule — every subject entry uses identical navy/ink typography).
- **Parent story:** new "Going well / Needs attention / Coming next"
  illustrative three-column section, explicitly labelled "Illustrative
  example. Not a real child's data," followed by the original, now
  icon-free, four-item "what you'll actually see" bullet list.
- **Mock Tests:** "Practice teaches. Mock Tests measure." set as a large,
  confident heading (no icon), with the original honest disclaimer about
  CSSE/GL/CEM/ISEB non-affiliation preserved verbatim.
- **CTA/footer:** unchanged in substance from Increment 1, retokenised onto
  the Brand Foundation for visual consistency with the rest of the page.

## E. Wordmark

Academic Navy (`--angel-navy`) is now the header's default wordmark colour,
replacing the interactive blue used in Increment 1 — the brand mark now
reads as identity/authority, distinct from the blue reserved for clickable
CTAs and links. No mark, monogram, crown, halo, graduation cap, brain, or
symbol of any kind was added; the name alone carries the brand, per the
governing instruction's explicit direction. Weight/size increased slightly
(`text-xl md:text-2xl font-bold tracking-tight`) for a more confident,
academic presence.

## F. Photography

**Temporary asset**, disclosed as such in the component's own file header
(`components/public/StudyIllustration.tsx`): an original, hand-authored SVG
of a book and pencil. No photograph of any kind — real, stock, or
generated — was introduced; no commercially-licensed photography exists yet.

**Documented requirements for the real photograph, so it can replace this
component with no structural change:**
- Aspect ratio: 4:5 portrait (the current slot's exact ratio).
- Recommended source resolution: at least 2400×3000px, to allow re-cropping
  for other placements later without upscaling.
- Desktop crop: the full 4:5 frame, `object-fit: cover`.
- Mobile crop: the same source at a wider ~4:3 frame, subject
  centred/upper-third so one photograph supports both crops.
- Safe subject area: the main subject kept within the centre 80% of the
  frame on all sides.
- Format/loading: WebP/AVIF via `next/image`, `priority` (above the fold), a
  real `sizes` attribute, `placeholder="blur"` once the asset exists, target
  weight under ~150KB optimised.

**Exact prepared location:** the hero's right-hand column
(`components/public/StudyIllustration.tsx`) — this is currently the only
position built out; the Learning/Parent-section photography positions the
governing instruction mentions as optional were deliberately not built this
increment, since one excellent photograph beats several generic ones and no
licensed asset exists for any of them yet.

## G. Responsive

- **Desktop (≈1440px+):** verified directly against the live deployment at
  a genuine ~1905–1920px viewport (real `getBoundingClientRect`
  measurement, not assumed) — hero, journey, product story, subjects,
  parent story, Mock, CTA and footer all confirmed rendering correctly via
  live screenshots (§I).
- **Tablet:** not independently screenshotted this pass; the same
  `md:`-gated Tailwind classes used throughout (already proven correct in
  the genuine production build, §I) apply identically between the `md`
  (768px) and `lg` breakpoints — no tablet-specific override exists that
  could diverge from the verified desktop/mobile behaviour.
- **Mobile (≈390px):** **could not be captured live this pass** —
  `resize_window` reported success but the tab's actual rendering viewport
  did not change (confirmed directly via `window.innerWidth` and
  `getBoundingClientRect`), the same tooling limitation disclosed in the
  Increment 1 release-readiness report. Mitigated, not solved, by two
  independent lines of evidence: (1) a genuine production build/server run
  locally directly proved every `md:`-gated utility this page uses
  (`grid-cols-6`, `grid-cols-3`, `border-t-2`, `p-8`, `hidden`/`flex`)
  compiles and applies correctly once past `next dev`'s HMR quirk, and (2)
  the same header collapse pattern (wordmark + single CTA below `md`,
  full nav at `md`+) is structurally unchanged from Increment 1, which
  **was** captured at a genuine ~500px viewport in this same environment
  and confirmed working. A real phone-width screenshot of this exact build
  is recommended before or shortly after Founder review and was not
  possible with this session's tooling.

## H. Accessibility

- **Colour contrast:** see §A — every pairing actually used passes AA;
  Warm Gold is restricted to decorative-only use specifically because it
  does not.
- **Keyboard:** every interactive element is a real `<a>`/`<button>` via
  `next/link`/`Button`/`ButtonLink` (already-existing, already-keyboard-
  operable components, not reinvented) — no `<div onClick>` anywhere in
  the new content.
- **Semantic structure:** `h1` (hero) → `h2` (every major section) → `h3`
  (the six journey-step titles only, correctly nested under the "How Angel
  11+ works" `h2`) — verified directly by grep, no skipped levels. The
  preparation journey is a real `<ol>` (ordered list), and subjects/
  approach are real `<dl>` definition lists — screen-reader-meaningful
  markup, not generic `<div>`s styled to look like a list.
- **Screen-reader considerations:** the journey's "connected" visual (a
  shared border rule) carries no meaning of its own that isn't already in
  the ordered, numbered list structure underneath it — a screen reader
  announces "list, item 1 of 6, Learn..." correctly with no dependency on
  the visual line. The hero illustration is wrapped in `role="img"` with a
  real `aria-label`; its inner SVG is `aria-hidden`. The decorative gold
  rules are `aria-hidden="true"` and never the sole carrier of a section's
  meaning (a real heading always sits beside one).
- **Colour-only meaning:** none — every status/step is conveyed by text
  (numerals, headings, labels) with colour as reinforcement only, not the
  sole channel.
- **Reduced motion:** no new animation was introduced; the page uses only
  the existing sitewide `transition-colors`, already gated by this
  codebase's `motion-reduce:transition-none` convention on the reused
  `Button`/`ButtonLink` components.

## I. Technical

- **Commit:** `e2a64cb` — `feat(public): Increment 1A -- brand foundation v1.0 + homepage visual refinement`.
- **Tests:** 4,736/4,737 pass, 0 failures, 1 pre-existing skip — identical
  to the established baseline, verified in a genuinely clean `git worktree`
  checkout of this exact commit (not the local working directory, which
  still carries the separately-documented, pre-existing, untracked
  Question Factory files).
- **Lint/copy-guard baselines:** ESLint 114 problems, Copy Quality Guard 51
  violations — both confirmed **byte-identical** to the pre-Increment-1A
  baseline (checked against the immediately preceding commit). Zero new
  issues introduced by this increment.
- **Build:** genuine `next build` PASS in the clean worktree — full
  TypeScript check ran and passed, no bypass flag, all 72 routes built
  including `/`, `/robots.txt`, `/sitemap.xml`.
- **A real, transient local `next dev` (Turbopack) CSS/HMR issue was found
  and root-caused during this increment**, disclosed for the record: newly
  introduced Tailwind utility classes (`md:grid-cols-6`, `md:p-8`,
  `md:border-t-2`) intermittently failed to apply live in `next dev` after
  incremental hot-reloads, while pre-existing utilities from before the
  session kept working. Proven to be dev-only by directly building and
  serving a genuine production bundle (`next build && next start`) locally,
  where every one of the same utilities applied correctly on first load —
  confirmed again independently on the actual Vercel deployment. No code
  change was needed; this was a local tooling artifact, not a defect in
  the shipped page.
- **Deployment:** pushed to `origin/main` and deployed automatically
  through the existing Vercel production process (no manual deploy). New
  deployment `dpl_63nhvZrpE5oRqvXyQzsDaRxB24uJ`, status Ready, aliased
  automatically to `https://angel-11plus.vercel.app` (confirmed via
  `vercel inspect`).
- **Production URL:** `https://angel-11plus.vercel.app`.
- **Regression results:**
  - Public homepage: confirmed live via real screenshots for hero,
    preparation journey, product story, personalisation, subjects, parent
    story, Mock section, and CTA/footer, plus a full `get_page_text`
    capture matching the authored copy exactly, with zero console errors.
  - Access control: not independently re-signed-out-tested against this
    exact deployment (this session's browser carries a real, already-
    authenticated Founder session) — `lib/registeredAccess.ts` and
    `components/RegisteredAccountGate.tsx` were not modified by this
    increment at all, and were already verified signed-out on identical
    code in the Increment 1 pass.
  - Authenticated application: confirmed live — the signed-in session's
    header correctly showed "Go to my dashboard" instead of Sign in/Create
    account, and following it reached the real, live, signed-in dashboard
    ("Viewing: Child 1," "My Admission Journey," a real onboarding/
    achievements state) — the existing application is fully unaffected.
  - No AI/development terminology (AI, OpenAI, GPT, Claude, LLM, Supabase,
    Vercel, "Educational Intelligence Engine," raw IDs/enums, debug
    terminology) appears anywhere in the rendered homepage — verified both
    by source grep and by reading the live page's full rendered text.
  - No purple anywhere in the new homepage — verified by source grep and
    by direct visual inspection of every section's live screenshot. The
    six previously-identified legacy purple violations elsewhere in the
    application (Mock/Reasoning pages) remain untouched and separately
    governed, exactly as instructed.

## J. Remaining work

- **Final licensed photography** — not sourced this increment, per the
  governing instruction's explicit "photography is a separate asset
  decision" rule; the hero slot is built and documented (§F) to accept it
  without a structural change once available.
- **The six legacy Zero-Purple violations** outside this homepage (Mock/
  Reasoning surfaces) remain explicitly deferred, unchanged, separately
  governed — not part of this increment.
- **A genuine mobile-width (≈390px) screenshot** of this exact build,
  which this session's tooling could not capture — recommended as a quick
  follow-up check, not a blocker (§G).
- **Tablet-width spot check** — not independently screenshotted; no
  tablet-specific styling exists that could plausibly diverge from the
  verified desktop/mobile behaviour, but a direct look is still worth five
  minutes before or shortly after Founder review.
- Nothing else is deferred to Increment 2 beyond what Increment 1's own
  report already carried forward (the CSSE/non-CSSE split, the two
  unreachable English lessons).

---

## Acceptance Classification

**TECHNICAL STATUS: GO.**
Clean-checkout typecheck, full test suite, migration SQL guard, and a
genuine production build all pass; ESLint/copy-guard baselines are
unchanged; the deployment succeeded and was directly verified live,
including a real authenticated-session regression check.

**BRAND FOUNDATION IMPLEMENTATION: GO.**
Every token specified in the governing instruction is implemented, scoped
correctly to the public surface only, and contrast-verified by calculation
rather than assumption; the one value that fails contrast (Warm Gold) is
disclosed and scope-restricted rather than silently used or silently
changed.

**VISUAL FOUNDER ACCEPTANCE: PENDING.**
This report does not self-certify the visual result. The Founder should
view `https://angel-11plus.vercel.app` directly before any further
decision.
