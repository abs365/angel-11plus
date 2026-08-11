# New Angel Information Architecture

**Programme:** Angel Assessment Transformation Execution Programme — Release 1, New Learner Experience Migration
**Prepared:** 2026-08-11

---

## 1. Top navigation structure

Replaces `components/Navigation.tsx`'s permanent desktop sidebar (13 links across 4 groups, confirmed via investigation) with a top bar. Primary items, deliberately small in number, per the governing instruction:

| Position | Label | Destination (CSSE pathway) | Destination (non-CSSE pathway) |
|---|---|---|---|
| 1 | Today | `/dashboard` | `/dashboard` |
| 2 | Learn | New honest-interim CSSE Learn destination | `/learn` (unchanged) |
| 3 | Practise | `/learning-intelligence/practice` | `/reasoning` (unchanged) |
| 4 | Mock | `/mocks` | `/mocks` |
| 5 | Progress | `/progress` | `/progress` |

**Why pathway-branching, not a single destination:** established, existing pattern throughout this codebase (`getSelectedPathwayId() === "csse"` already gates the Parent Dashboard, the Practice session runner, and all six Parent sub-pages). Reusing it here means zero new architecture, and it is the only way to satisfy the Founder's explicit instruction to keep legacy CSSE-inauthentic content out of the new journey without breaking the real, currently-functioning experience for GL/CEM/ISEB families (see `LEGACY_CONTENT_RETIREMENT_REGISTER.md` §4 for the full reasoning).

**Right side of the bar:** account/profile/settings (existing `UserMenu`/sign-out, unchanged in function, relocated).

**Parent access:** given clearly-available placement in the top bar (not buried in a mobile "More" drawer, as it currently is) — a direct top-bar link or icon, not nested under a secondary group.

**School/admissions information (`/pathways`):** remains reachable but intentionally not one of the 5 primary items — accessible via a secondary/overflow location (e.g. from Today or Progress), matching the instruction's "should not compete visually with the child's daily preparation journey."

## 2. Pathway branching rule (the one new piece of logic)

A single new helper, e.g. `getCsseLearnHref()` / `getCssePractiseHref()` (or equivalent inline checks reusing the existing `getSelectedPathwayId()` read), applied only at the navigation layer:

```
if (getSelectedPathwayId() === "csse") {
  Learn    -> new interim CSSE Learn route
  Practise -> /learning-intelligence/practice
} else {
  Learn    -> /learn
  Practise -> /reasoning
}
```

No existing route, component, or data file is modified by this rule — it only changes which href the top nav's Learn/Practise items point to. `/learn` and `/reasoning` remain fully functional, unlinked-from-top-nav-for-CSSE-only, exactly as scoped in the Legacy Content Retirement Register.

## 3. Responsive behaviour

- **Desktop (≥1024px):** horizontal top bar, all 5 primary items visible as labelled tabs/links, account menu at the far right, Parent Dashboard link adjacent.
- **Tablet (768–1023px):** top bar retained; labels may collapse to icon+short-label or icon-only with a visible active-state label, matching the existing mobile bottom-bar's icon+label pattern already coded in `Navigation.tsx`'s `primaryItems`.
- **Mobile (<768px):** top bar for branding/account; primary 5 items as a bottom tab bar (reusing the existing bottom-bar pattern `Navigation.tsx` already implements for its 4 `primaryItems` — this is not a new pattern, just re-labelled/re-ordered to 5 items). Secondary items (Parent Dashboard, School Intelligence, Help) remain in an overflow/"More" affordance, as today.

This is not "the existing sidebar rotated horizontally" — the desktop experience changes from a permanent 200+px-wide vertical rail present on every page to a compact horizontal bar, reclaiming that width for content, per the explicit instruction not to merely rotate the sidebar.

## 4. What is explicitly NOT changing in this release

- The underlying `Navigation.tsx` groupings for secondary items (Help/support, Angel Plus) are preserved in substance, only relocated out of a permanent sidebar into an overflow/secondary location.
- No route is deleted. `/learn`, `/reasoning`, and their 8 subject pages remain fully live for non-CSSE-pathway learners.
- No content is rebuilt. The new CSSE "Learn" destination is an honest interim state (see `NEW_LEARN_MODEL.md`), not new educational material.
