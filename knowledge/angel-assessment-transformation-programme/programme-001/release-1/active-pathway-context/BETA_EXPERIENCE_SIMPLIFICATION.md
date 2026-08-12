# Beta Experience Simplification

## What /beta actually is

Reconnaissance found `/beta` combining four responsibilities in one page, reachable from every authenticated page's footer ("About Angel 11+" link, `components/SupportFooter.tsx`):

1. Public marketing pitch (hero, features list, "who is Angel 11+ for")
2. A second, duplicate pathway comparison catalogue (six colour-coded cards, overlapping with `/pathways`)
3. Beta-programme status and signup funnel (`/beta-family`)
4. Generic "how to get started" onboarding steps

No auth-gating exists; every visitor sees the same content regardless of whether they already use the product.

## Decision

Smallest safe change: branch on whether a real pathway is already selected (`getActivePathway()`, deferred client-only read, same SSR-safe pattern as `Navigation.tsx`'s `useCssePathway()`).

- **No real pathway selected** (genuine new prospect): unchanged — the full hero/features/pathway-catalogue/beta-status/how-to-start content, since this is real, still-needed onboarding information for someone who has not chosen yet (Section 18's own requirement).
- **Real pathway already selected** (existing user): a new, compact `ExistingFamilyBetaPage` component — one neutral "Preparing for: {pathway}" card, a link to `/pathways` for comparison, one small Beta Programme note, and two CTAs (Dashboard, Parent Dashboard). No six-card catalogue. No repeated "choose a pathway" primary action. No dominant Beta section.

This was not an "unnecessary marketing-site redesign" (Section 13's explicit non-goal) — the unauthenticated/no-pathway path is untouched. Only the returning-user path changed.

## Colour system

The compact existing-family view uses only the app's existing neutral/restrained palette (gray surfaces, one purple accent for the primary CTA) — no per-pathway accent colours, matching Section 12's "pathway identity should come from name/context, not a rainbow of card colours." The full catalogue view (shown only to undecided new prospects) keeps its existing per-pathway colours, since a first-time comparison is the one legitimate "strong usability reason" Section 12 itself allows, and it is not the everyday, repeated experience Section 11 is concerned with.

## Core Foundation

`/beta`'s own local `PATHWAYS` array (used only in the full, new-prospect view) still lists "Core Foundation" as a starting option, matching `lib/pathways.ts`'s own existing framing ("the best starting point... before a pathway is chosen"). It is never presented as a switchable target in the compact existing-family view or the top-bar switcher — see `ACTIVE_PATHWAY_CONTEXT_ARCHITECTURE.md` §2 for the full reasoning.
