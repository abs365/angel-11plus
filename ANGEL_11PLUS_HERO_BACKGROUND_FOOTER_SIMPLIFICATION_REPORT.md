# ANGEL 11+ — Hero Background + Footer Simplification

Concise report, per the governing instruction's own "report concisely" framing.

## Hero background treatment
The hero `<section>` moved from an implicit white background (inherited from the page's own
`bg-[var(--angel-paper)]`) to an explicit `bg-[var(--angel-ivory)]` base, with two large, heavily
blurred (`blur-3xl`), low-opacity, `rounded-full` shapes added behind the content in a separate
`aria-hidden`, `pointer-events-none` absolute layer:
- Lower-left: `--angel-gold` at 8% opacity — reads as a soft cream/warm wash, not a saturated gold
  shape.
- Upper-right (behind/around the photograph): `--angel-sky` at 60% opacity — diffuses into the ivory
  base rather than reading as a distinct panel.

Both are pure CSS (no image), clipped by `overflow-hidden` on the section (no horizontal scroll risk
on mobile), and sit at `z-index` below the content, which is explicitly `relative z-10`.

## Colours / tokens used
`--angel-ivory`, `--angel-gold`, `--angel-sky` — all three already exist in the Brand Foundation v1.0
token block (`app/globals.css`). **No new colour was required or introduced.** No gradient, no
purple, no glassmorphism, no icons, no animation.

## Footer change
Removed the "Sign in" link from the public footer's navigation row (was: Privacy / Terms / Contact
and support / Sign in; now: Privacy / Terms / Contact and support). The header's own Sign in link is
untouched. The two-row composition, independence statement and copyright wording are unchanged.

## Desktop behaviour (verified live, ~1568–1920px)
Both decorative shapes visible but clearly secondary — the headline and photograph remain the
dominant visual anchors. Hero height and two-column proportions are unchanged from before this pass.

## Tablet behaviour (verified live, 900px, genuine iframe-confirmed viewport)
Same treatment renders correctly at the narrower two-column width; both shapes visible without
crowding the photograph or text.

## Mobile behaviour (verified live, 390px, genuine iframe-confirmed viewport)
Single-column layout unchanged; the warm tone is present but restrained, no clutter, no overflow,
headline stays dominant, both CTAs remain fully usable, photograph unobstructed.

## Accessibility checks
- Both decorative shapes are `aria-hidden="true"` and `pointer-events-none` — excluded from the
  accessibility tree and never intercept clicks/taps.
- Headline (Academic Navy on Ivory) and body copy (Slate/muted on Ivory) contrast is unchanged from
  the already-verified Brand Foundation ratios (15.05:1 and 7.14:1 respectively against Ivory) — the
  shapes sit behind and around the text block, not underneath the text itself, and were visually
  confirmed not to reduce legibility in any of the three captured widths.
- CTA and secondary-button contrast unchanged (same `Button`/`ButtonLink` components, untouched).
- Focus states unchanged (same global `:focus-visible` rule, unaffected by a background change).
- No motion was introduced, so `prefers-reduced-motion` has nothing new to respect.

## Tests / build
Clean-checkout gate (genuine `git worktree` of the exact commit below): typecheck 0 errors; tests
4,736/4,737 pass, 0 failures, 1 pre-existing skip (matches the established baseline exactly);
migration-sql-guard PASS (257 files); ESLint 114 problems and Copy Quality Guard 51 violations, both
confirmed unchanged from the pre-existing baseline; **genuine `next build` PASS**, no bypass flag, all
72 routes including `/` (still statically prerendered). New-purple and new-gradient scans: zero real
matches in every file this pass touched (the only "purple"/"gradient" hits are this pass's own code
comment stating their absence).

## Commit
`a6a6b75` — `feat(public): hero background warmth + footer sign-in removal`.

## Production deployment
Pushed to `origin/main`, deployed automatically through the existing Vercel production process (no
manual deploy). Deployment `dpl_GJAKRVKTNR6a411hs4wiQMnGq2bz`, status Ready, automatically aliased to
`https://angel-11plus.vercel.app`. `angel11plus.com`, Cloudflare, SMTP and Supabase Auth were not
touched.

## Production evidence captured (real screenshots, not DOM text)
Full desktop hero; desktop hero + beginning of preparation journey; mobile hero (390px); desktop
footer; mobile footer — all captured directly against `https://angel-11plus.vercel.app`, plus a
tablet-width (900px) hero capture for completeness against §8's own verification requirement.

---

**TECHNICAL STATUS: GO.**
**HERO VISUAL FINISH: GO.**
**FOOTER: GO.**
**FINAL HOMEPAGE FOUNDER ACCEPTANCE: PENDING FOUNDER REVIEW.**
