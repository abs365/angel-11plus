# ANGEL 11+ — Product Design Standard V1

Derived directly from the approved, frozen public homepage (`app/page.tsx`, `app/globals.css`'s
Brand Foundation token block) — nothing below is invented; every token and pattern is quoted from
code already live in production. This is a formal, product-wide design standard: the homepage
establishes the Angel 11+ product identity, and every Angel 11+ interface should progressively
converge on it (governing instruction, Part 10).

## Status of this document

V1, established this increment. **Scope of enforcement this increment**: only the new learner-PIN
surfaces this increment built (`LearnerPinModal`, the "Enter learner space" / "Manage learner PIN"
additions to `Header.tsx` and `LearnerIdentityBanner.tsx`) were brought into compliance. The rest of
the authenticated application (Today, Learn, Practise, Mock, Progress, Parent Dashboard, the existing
`ParentPinModal`) was **not** touched — that is the explicitly separate, not-yet-started
"ANGEL 11+ AUTHENTICATED EXPERIENCE & DESIGN SYSTEM MIGRATION" increment (Part 14).

## The tokens (already defined, `app/globals.css`)

| Token | Value | Role |
|---|---|---|
| `--angel-navy` | `#14213D` | Headings, primary text on light backgrounds |
| `--angel-blue` | `#2563eb` (= `--color-primary`, Tailwind `blue-600`) | Accents, labels, primary CTA fill |
| `--angel-ivory` | `#FAF8F3` | Warm section backgrounds (never stark white for a whole page) |
| `--angel-paper` | `#ffffff` (= `--surface`) | Card/panel surfaces sitting on ivory |
| `--angel-gold` | `#C58A2A` | **Decorative only** — never text, never a fill a user reads as meaningful (WCAG finding from an earlier increment) |
| `--angel-sky` | `#EAF2FF` | Soft accent panels/illustrative backgrounds |
| `--angel-ink` | `#172033` | Body copy (softer than navy, still warm-dark, never Tailwind `gray-*`) |
| `--angel-muted` | `#475569` (= `--color-secondary`) | Secondary/meta text |
| `--angel-border` | `#E7E2D6` | Warm-neutral borders — distinct from generic cool `gray-100`/`gray-200` |

All nine already exist and already respond correctly to dark mode (see `globals.css`'s own
`prefers-color-scheme`/`[data-theme]` blocks) — nothing new was added this increment.

## Reusable primitives (already exist, already used by the homepage)

- **`components/ui/Button.tsx`** (`Button`/`ButtonLink`) — the homepage's own CTAs
  (`<ButtonLink href="/login" size="lg">`) use this component directly. `variant="primary"` is
  `bg-blue-600` (identical value to `--angel-blue`), `rounded-xl`/`rounded-lg` per size, `shadow-sm`.
  **Authenticated surfaces should prefer this component over a hand-rolled `<button className="bg-sky-700 ...">`** — the fragmentation the Founder identified is substantially this: one-off buttons
  reinventing a slightly-different blue/radius/shadow combination instead of reusing the one that
  already carries the product identity.
- **Radius**: the homepage favours `rounded-lg` for panels and inline elements, `rounded-xl` for
  primary buttons — not the heavier `rounded-2xl`/`rounded-3xl` seen in some authenticated surfaces.
- **Borders**: `border-[var(--angel-border)]`, not `border-gray-100`/`border-gray-200`.
- **Section backgrounds**: `bg-[var(--angel-ivory)]` for a page's warm base, `bg-[var(--angel-paper)]`
  (or plain white) for a card/panel that needs to sit slightly forward of that base — never a flat
  `bg-gray-50` page background throughout.

## Strictly avoid (governing instruction, Part 10 — unchanged, re-affirmed)

Purple, gradients, generic AI/SaaS appearance, glassmorphism, excessive rounded cards, excessive
pills, repeated icon-square components everywhere, robot/AI imagery, glowing brains, futuristic AI
motifs, fake analytics, unnecessary dashboards, visual clutter, generic template appearance.

## Governing principle: no AI-interface visual fingerprint (Practise Hub Final Human-Design Refinement)

This is a governing product rule, not a page-specific preference — it applies to every Angel 11+
surface, present and future, not only Practise:

> Angel 11+ must not acquire the visual fingerprints of an AI-generated interface. Components, icons,
> colour blocks, pills and cards are used only when they improve educational comprehension or
> navigation. Typography, composition, whitespace, real educational content and purposeful imagery
> carry the identity.
>
> Do not solve visual hierarchy by creating another card, coloured tile, pill or icon container. First
> attempt to solve it with typography, spacing, grouping, dividers and composition.

Concretely: a repeated pattern of `icon tile → title → description → button`, applied identically to
every item in a short list, is the specific shape this rule exists to catch — even when every colour
used is already an approved Angel token. A decorative icon that repeats what the title text already
says, a coloured pill used purely for emphasis rather than as a genuine action or status, or a card
border introduced only to separate items that a plain divider would separate just as clearly, are each
signs the AI/SaaS default was reached for before typography and composition were actually tried.

## What "one Angel 11+ experience" means in practice (Part 11)

The transition from the public homepage into the authenticated product should feel continuous in
typography, spacing, colour, controls, navigation, tone and interaction quality — not "premium
marketing website plus legacy application." Concretely, for any authenticated surface built or
touched going forward:

1. Reach for `components/ui/Button.tsx` before writing a new button's classes by hand.
2. Reach for the `--angel-*` tokens before reaching for a plain Tailwind gray/blue/sky shade.
3. Prefer `rounded-lg`/`rounded-xl` over heavier rounding.
4. Prefer `--angel-border` over `border-gray-100`/`border-gray-200`.
5. A page's outermost background should read as warm (ivory/paper), not flat cool gray.

## Child experience standard (Part 12, unchanged, re-affirmed)

The learner environment is not an admin dashboard. A learner should immediately understand who they
are, what they're preparing for, what to do today, and how they're improving. Keep Today / Learn /
Practise / Mock / Progress unless strong evidence demands a change. Calm, clear, encouraging, focused,
premium, educational — not childish, not corporate, not AI-looking.

## Authenticated surfaces remaining to migrate (Part 14, recorded, not started)

Parent Dashboard, Today, Learn, Practise, Mock, Progress, Results, and the existing `ParentPinModal`
(migration 262's own UI, unchanged this increment) all still use pre-Brand-Foundation styling
(generic Tailwind grays/`sky-700`, heavier rounding, cool borders, flat backgrounds) rather than the
tokens above. Bringing them into compliance without breaking the Educational Intelligence Engine,
Question Factory, Mock Engine or any other protected system underneath is the scope of the next,
not-yet-started increment: **ANGEL 11+ AUTHENTICATED EXPERIENCE & DESIGN SYSTEM MIGRATION**.

## Related, separately-tracked finding (Part 13, recorded, not addressed here)

Founder production evidence shows the current Learn page states "Angel's CSSE Learn experience is
being rebuilt one real lesson at a time..." and exposes only three Mathematics lessons before
directing learners to Practice/Report. This is content/educational depth debt, explicitly not to be
fixed by a visual redesign of any kind, and explicitly not part of this increment's scope.
