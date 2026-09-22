# ANGEL 11+ — Increment 1B: Final Public Homepage Visual Finish

**Scope:** narrow visual finishing on top of Increment 1A's now-accepted structure, content
direction and Brand Foundation v1.0. No section was added, removed or reordered. No card/icon
system was reintroduced. No educational sequence changed. No learner architecture, authenticated
surface, database, or migration was touched.

---

## Exact visual changes

### Hero
- Headline scaled up (`text-4xl md:text-6xl` → `text-5xl md:text-7xl`), sub-copy to `text-xl`, more
  generous spacing before the CTAs.
- The image slot's `max-w-sm` cap (384px) was removed — it now fills its full `md:col-span-5`
  grid column instead of floating small inside a large empty area, which was the Founder's core
  "hero feels unfinished" observation. Corner radius softened `rounded-xl` → `rounded-lg`.

### Preparation journey (Learn/Practise/Check/Review/Mock/Improve)
- Layout: 6 narrow single-row columns (`md:grid-cols-6`) → 3-wide, 2-row grid (`md:grid-cols-3`).
  Each step's column roughly doubles in width, which is what actually fixed the legibility problem
  — not a font-size change alone.
- Typography: step numerals `text-xs` → `text-2xl` in Angel Blue; step titles gained `text-xl`;
  body copy shortened (see below) and reads at the base size instead of `text-sm`.
- Connector: the shared top/left border rule changed from the neutral `--angel-border` to
  **`--angel-gold`** — a deliberate, restrained "journey connector" use of Warm Gold, exactly as
  the governing instruction's §5 and §12 anticipated. It remains purely decorative: the real
  sequence is carried by the `<ol>` element and the visible 01–06 numerals, never by the line
  alone, so no screen-reader or keyboard-only path depends on it.
- Copy shortened per the governing instruction's own directional wording, while keeping this
  codebase's voice (e.g. "Understand the method, with a clear example first." instead of
  "Understand something properly, with a clear example before trying it alone.").
- Mobile: unchanged mechanism (a left-border vertical timeline), retokenised onto gold for
  consistency with the desktop connector.

### Subjects ("What children practise")
- Added a stronger lead statement above the existing intro paragraph: "Five subjects. One
  connected plan." (`text-3xl md:text-4xl`).
- Row typography increased: subject names `font-bold` → `text-xl font-bold`; descriptions →
  `text-lg`; row padding `py-6` → `py-8`; name column widened `10rem` → `12rem`. No icons, no
  per-subject colour, no card reintroduced — purely a typographic/spacing change, per the
  governing instruction's explicit "do NOT restore subject cards" direction.

### "A clear plan for today" (Today's Plan)
- Heading `text-2xl md:text-3xl` → `text-3xl md:text-4xl`; intro copy → `text-lg`.
- Panel: padding `p-6 md:p-10` → `p-8 md:p-12`; item titles → `text-lg font-semibold`; corner
  radius softened `rounded-2xl` → `rounded-lg` (per the governing instruction's "you may reduce
  conventional card styling if it feels more editorial" allowance) — this is the one deliberate
  exception to "no cards," since the panel's job is specifically to read as a distinct,
  self-contained worked example, not real navigation.

### Personalisation ("Preparation that responds to your child")
- Heading and body scaled up in step with the rest of the page (`text-3xl md:text-4xl` /
  `text-lg`); "Angel recommends. Family chooses." bumped to `text-xl` to read as the section's
  real pull-quote. Copy itself unchanged (already Founder-accepted).

### For parents
- **The main whitespace fix.** The illustrative "Going well / Needs attention / Coming next"
  example and the real four-item benefit list were previously stacked vertically (example, then a
  narrower list beneath it), leaving most of the desktop canvas empty below the example — exactly
  the Founder's "For parents…particularly demonstrates this" observation.
- Now laid out side by side in a 12-column grid (`md:col-span-7` example panel / `md:col-span-5`
  benefit list), both at larger type (`text-lg`), so the two pieces of evidence read as one
  argument rather than a sequence. The example panel gained a distinct `--angel-ivory` tint
  (matching the "self-contained illustrative unit" language already established for Today's Plan)
  so it stays visually distinguishable from the real list beside it.
- No fabricated data, no new percentages, no chart — the same three labels and four bullets as
  before, just recomposed.

### Mock Tests / Our approach
- Mock section body copy bumped to `text-lg`. "Our approach" heading and body scaled up
  (`text-3xl md:text-4xl`, `dt` → `text-lg`) for hierarchy consistency with the rest of the page.
  Neither section's structure changed.

---

## Hero photography-ready final specification

Documented directly in `components/public/StudyIllustration.tsx`'s own header comment (excerpted):

| Property | Specification |
|---|---|
| Aspect ratio | 4:5 portrait on tablet/desktop; 4:3 landscape on mobile (`aspect-[4/5] max-sm:aspect-[4/3]`, implemented, not just documented) |
| Desktop container | Fills `md:col-span-5` of the hero's `max-w-7xl` grid — roughly 480–620px wide at 1280–1920px viewports, height following the 4:5 ratio (~600–780px); scales with the column, not a fixed pixel box |
| Tablet (≈768–1023px) | Same 4:5 ratio, narrower column (~300–380px) |
| Mobile (<768px) | Full-width, 4:3 landscape crop — shorter, so it doesn't push the CTAs far down the page |
| Recommended source resolution | At least 2400×3000px, so one file covers both crops without upscaling |
| Safe subject area | Child and their work kept within the centre 80% of the frame on all sides |
| object-fit / object-position | `cover` / `center 30%` — biases the crop toward the upper third (face/hands), not a dead-centre crop |
| Format/loading | WebP/AVIF via `next/image`, `priority`, a real `sizes` attribute, `placeholder="blur"` once the asset exists; target weight under ~150KB optimised |

The temporary SVG was **not** enlarged to imitate photography — only the container grew, so the
layout is ready to accept the real photograph as a one-line swap, per the governing instruction's
explicit requirement.

## Typography/scale and whitespace changes

Summarised across sections above; the net effect is a consistent three-tier heading scale
(`text-3xl md:text-4xl` for standard section headings, `text-3xl md:text-5xl` reserved for the two
"closing statement" sections — Mock and the final CTA, both already at that size and left
unchanged — and `text-5xl md:text-7xl` for the hero alone), `text-lg` promoted as the new default
body-copy size across every major section (was a mix of default/`text-sm`), and the parent
section's two-column recomposition as the primary whitespace fix. Subjects and Mock retain more
generous right-side whitespace at very wide desktop widths by design — both are intentionally
plain, confident statement sections (matching the final CTA's own established treatment), not
flagged by the governing instruction as specifically as the parent section was.

---

## Responsive verification

**Genuine, not simulated.** `resize_window` was retried and again did not change the actual
rendering viewport in this environment (confirmed via `window.innerWidth` staying at the outer
window's size regardless of the resize call — the same tooling limitation disclosed in Increments
1 and 1A). Rather than substitute DOM text or assumption for visual judgement, a **legitimate
alternative method** was used: a same-origin `<iframe>` sized to the exact target CSS width. An
iframe's content genuinely lays out at its own element width, independent of the outer browser
window — confirmed directly (`iframe.contentWindow.innerWidth` matched the requested width to
within 2px in every case) before relying on it for evidence.

Verified this way, **against the actual deployed production URL** (`https://angel-11plus.vercel.app`,
this increment's own deployment), not just a local server:

- **Desktop (~1568–1920px):** hero, preparation journey, Today's Plan, personalisation, subjects,
  parent section, Mock/approach, and final CTA/footer — all captured via ordinary full-window
  screenshots, real viewport, no simulation needed.
- **Tablet (998px, comfortably above this app's effective `md` breakpoint):** hero renders as the
  two-column layout with full navigation; preparation journey renders as the 3-column grid — both
  confirmed via the iframe method against production.
- **Mobile (390px / 388px effective):** hero renders as a single column with the header correctly
  collapsed to wordmark + one CTA; the illustration switches to its 4:3 mobile crop as designed;
  the preparation journey renders as the vertical, gold-left-border timeline exactly as specified
  in the governing instruction's §6 example; the parent section's example panel and benefit list
  stack correctly. All confirmed via the iframe method against production.
- **A genuine narrower tablet width (766px, just below this app's effective `md` breakpoint of
  ~816px — see note below)** was also captured and shows the single-column mobile-style layout,
  which is the correct, intentional behaviour at that width.

**Worth disclosing, not a defect:** this codebase sets `html { font-size: 17px }` (an existing,
pre-Increment-1 choice, unrelated to this pass) rather than the browser default 16px. Because
Tailwind's breakpoints are `rem`-based, every breakpoint in the whole application — not just this
homepage — is therefore ~6.25% larger in real CSS pixels than Tailwind's nominal values (`md` is
effectively ~816px, not 768px). A device reporting exactly 768px CSS width will render the
single-column mobile layout, not the two-column tablet layout. This was true before this increment
and is not something this pass changed; noted here because it's directly relevant to interpreting
the tablet screenshots above.

---

## Accessibility

- **Contrast:** unchanged from Increment 1A's verified Brand Foundation values (every pairing used
  clears WCAG AA; Warm Gold remains decorative-only, now including its new use as the journey
  connector line, which is non-text and never the sole carrier of the sequence).
- **Heading hierarchy:** re-verified after this pass's edits — `h1` (hero) → `h2` (every major
  section, now including the new "Five subjects. One connected plan." lead) → `h3` (the six journey
  step titles, still correctly nested). No skipped levels.
- **Keyboard/focus:** unchanged — every interactive element remains a real `<a>`/`<button>` via the
  existing `Button`/`ButtonLink`/`next/link` components; no new custom interactive element was
  introduced.
- **Screen-reader journey order:** the journey's gold connector line is `aria-hidden` and
  decorative-only (verified by code review); the `<ol>` announces "list, item 1 of 6" etc.
  correctly regardless of the line's presence, matching the governing instruction's §18 requirement
  that the decorative connector be excluded from the accessibility tree's meaning.
- **Touch targets:** unchanged — CTA buttons still use the existing `Button` component's 44px
  minimum, untouched by this pass.

---

## Technical

- **Commit:** `c2e88b0` — `feat(public): Increment 1B -- final visual finish`.
- **Clean-checkout gate** (genuine `git worktree` of this exact commit, not the local working
  directory): typecheck 0 errors; tests 4,736/4,737 pass, 0 failures, 1 pre-existing skip
  (matches the established baseline exactly); migration-sql-guard PASS (257 files); ESLint 114
  problems and Copy Quality Guard 51 violations, both confirmed unchanged from the pre-Increment-1B
  baseline (zero new issues); **genuine `next build` PASS**, no bypass flag, all 72 routes
  including `/`, `/robots.txt`, `/sitemap.xml`.
- **New-purple/new-AI-terminology scan:** zero matches in every file this increment touched
  (`app/page.tsx`, `components/public/StudyIllustration.tsx`), verified by direct grep.
- **Deployment:** pushed to `origin/main`, deployed automatically through the existing Vercel
  production process (no manual deploy). Deployment `dpl_5yvhhCmWnLpNq1gxjTbwMincALD6`, status
  Ready, automatically aliased to `https://angel-11plus.vercel.app` (confirmed via
  `vercel inspect`).
- **Production URL:** `https://angel-11plus.vercel.app`.
- **No authenticated-app regression:** the new `--angel-gold` connector and every scale/spacing
  change are scoped to `app/page.tsx` and `components/public/StudyIllustration.tsx` only — no
  shared token used by any authenticated surface was touched (`app/globals.css`'s `--angel-*`
  block, introduced in Increment 1A, was not modified in this pass at all).

---

## Remaining photography requirement

Unchanged from Increment 1A: no licensed photograph exists yet. The hero slot is now genuinely
ready to accept one without a structural change — see the specification table above. This remains
a separate Founder/programme-lead asset decision, not part of this increment's scope, per the
governing instruction's explicit §23.

---

## Acceptance Classification

**TECHNICAL STATUS: GO.**
Clean-checkout typecheck, full test suite, migration guard, and a genuine production build all
pass; lint/copy-guard baselines are unchanged; the deployment succeeded and was directly verified
live at desktop, tablet and mobile widths against the actual production URL, with zero new purple
and zero AI/development-terminology leakage.

**EDITORIAL VISUAL FINISH: GO.**
All four weaknesses named in the governing instruction's assessment were addressed directly: the
hero is photography-ready and no longer feels like a small placeholder floating in empty space;
the preparation journey is legible at a glance at real desktop scale; the subjects section gained
stronger typographic hierarchy without reintroducing cards; the parent section's canvas is used
intentionally rather than leaving undersized content in a large empty area.

**PHOTOGRAPHY: PENDING FOUNDER ASSET APPROVAL.**

**FINAL VISUAL FOUNDER ACCEPTANCE: PENDING.**
This report does not self-certify the visual result. The Founder should view
`https://angel-11plus.vercel.app` directly before any further decision.
