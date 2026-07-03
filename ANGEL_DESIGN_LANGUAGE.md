# Angel Design Language — V3

**Status:** Supersedes `DESIGN_SYSTEM.md` (v2D-A, 2026-06-15) as the current design reference. Everything that already worked in v2D-A is carried forward unchanged (typography scale, purple primary, neutrals, the `rounded-2xl`/`rounded-xl`/`rounded-full` card/button/badge radius convention, mobile touch-target rules) — this document adds what v2D-A didn't have: a single canonical subject-identity table, a formal card taxonomy, motion rules, and the ALI-invisible language rule. `DESIGN_SYSTEM.md` is kept as a historical record; new work should reference this document.

---

## 1. Typography, Spacing, Neutrals

Unchanged from `DESIGN_SYSTEM.md` §1 and §2's neutrals table — the existing scale (`display`/`h1`/`h2`/`h3`/`body`/`small`/`micro`) and the `--background`/`--surface`/`--surface-raised`/`--border` tokens are correct and already consistently applied (confirmed during the Foundation Audit: no meaningful spacing/radius drift found across dashboard, parent, maths, english, or the adaptive routes). Nothing to change here — the gap was never spacing, it was consistency of *colour* and *icon* identity, and the absence of a *systematic* loading/motion/icon language. Those are what follow.

## 2. Subject Identity — the canonical table

**This is the single source of truth.** Every place a subject's colour or icon appears anywhere in the product must match this table exactly. Two real inconsistencies were found and are corrected by this table (not by inventing new colours/icons, but by enforcing the ones `DESIGN_SYSTEM.md` and `components/Navigation.tsx`/`app/dashboard/page.tsx` already established as canonical):

| Subject | Icon (`lucide-react`) | Colour token | Where it was wrong before |
|---|---|---|---|
| English | `BookOpen` | Purple | — (already consistent) |
| Maths | `Calculator` | **Blue** | The adaptive Maths route used emerald (a pathway colour, not a subject colour) |
| Vocabulary | `BookMarked` | **Emerald/Green** | The adaptive Vocabulary route used teal — which is Spatial Reasoning's colour, a genuine identity clash |
| Writing | `Pencil` | Amber/Orange | — |
| Verbal Reasoning | `Puzzle` | Violet | Parent Hub used `Brain` instead of `Puzzle` |
| Non-Verbal Reasoning | `Shapes` | Cyan | Parent Hub used `Eye` instead of `Shapes` |
| Spatial Reasoning | `Compass` | Teal | Parent Hub used `Box` instead of `Compass` |
| Numerical Reasoning | `Hash` | Rose | — (already consistent, the one reasoning subject Parent Hub got right) |
| Mocks / Practice | `Target` | Pink (as an accent; Practice itself is framed as premium neutral, see §5) | — |
| Progress | `BarChart2` | Indigo | — |

**Rule going forward:** a subject's icon and colour are decided once, here, and every surface (navigation, dashboard, Parent Hub, adaptive routes, mocks hub) references this table. No page is allowed to pick its own icon or colour for an existing subject — that's exactly the drift this table exists to prevent from recurring.

## 3. Card Taxonomy

Every card in the product is one of these five types. A new card should never invent a sixth shape without a real reason — reuse first.

| Card type | Used for | Base shape |
|---|---|---|
| **Hero card** | Dashboard welcome, session-summary screens | Gradient fill (purple→indigo), `rounded-2xl`, generous internal padding (`px-6 py-5`+), white text |
| **Subject card** | Any "go do this subject" entry point | `rounded-2xl`, colour-tinted background per §2's table, 1.5px identity strip at top, icon in a rounded-2xl chip, `group-hover:-translate-y-1` lift |
| **Session/Mission card** | "Here's what to do right now" (Today's Mission, a passage/word presented for practice) | White/surface background, `rounded-2xl`, left-border priority accent where ranking matters, one unambiguous primary CTA at the bottom |
| **Stat/Achievement card** | A single number with a label (XP, streak, sessions, accuracy) | `rounded-2xl`, colour-tinted background, icon + large number + small label, no CTA |
| **Utility card** | Settings-like rows, list items, support links | `rounded-xl` (one step down from the above), white/surface background, often a `ChevronRight` affordance if it navigates |

Every card type gets the same treatment in dark mode (paired `dark:` classes, never omitted — the Foundation Audit's dark-mode gaps were always cards or components that skipped this pairing, not a systemic dark-mode failure).

## 4. Icon System

Lucide React remains the icon library (no new dependency). The correction in §2 *is* the icon system work this phase — the previous icons were "functional but not memorable" specifically because the same subject wore different icons on different screens, which is the opposite of memorable. Fixing that consistency **is** what makes icons feel premium; this phase does not introduce a custom icon set, because a custom illustrated icon set is a larger, separate investment not justified by the actual defect found.

## 5. Colour — used intentionally, not decoratively

Purple stays the single primary/brand colour (CTAs, active nav state, brand wordmark, hero gradients). Every other colour in the product must be traceable to one of:

1. A subject's identity colour (§2's table) — used only when representing that subject.
2. A semantic state — emerald for success/complete, amber for attention/in-progress, rose for urgent/focus (already the Daily Mission priority convention — kept unchanged).
3. Neutral gray scale for everything else.

**A colour that doesn't map to one of these three reasons shouldn't be on the page.** This is the rule that catches drift like the adaptive routes' mismatched colours before it happens again, not just the rule that fixed the two instances already found.

## 6. Motion

Formalising what was already partially present (`active:scale-[0.98]` on buttons, `group-hover:-translate-y-1` on subject cards) into an explicit, small set of rules:

- **Press feedback**: every tappable primary element scales to `0.98` on press (`active:scale-[0.98]`). No exceptions — a button that doesn't visibly respond to a tap reads as unresponsive on a touch device, which is most of this product's real usage (iPad-first).
- **Hover lift**: cards that navigate somewhere lift slightly on hover (`hover:-translate-y-1`, paired with a shadow increase) — desktop/trackpad only, irrelevant but harmless on touch.
- **Transitions**: `transition-all duration-150` to `duration-200` for interactive elements; `duration-700` for progress bars filling (already the convention for XP/readiness bars — kept).
- **Loading**: see `ANGEL_LOADING_EXPERIENCE.md` in full — loading is treated as its own motion category, not an afterthought.
- **What NOT to add**: no parallax, no scroll-triggered reveals, no bouncing/elastic easing, nothing that delays the user from reaching their next action. Motion confirms; it never performs.

## 7. Language Rules (ALI-Invisible)

Covered in full in `ANGEL_UX_V3_STRATEGY.md` §3 — restated here as a design-language rule because it constrains what copy is allowed to ship, the same way colour/icon rules constrain what visuals are allowed to ship:

- Never show: "Adaptive," "Learning Unit," "Competency," "Intelligence," "Recommendation Engine," "Beta" as an ALI-status badge.
- Always prefer: "Practice," "Recommended Practice," "Today's Session," "Your Next Goal," "Keep Learning."
- A loading message is a product moment, not a status log — see `ANGEL_LOADING_EXPERIENCE.md`.

## 8. Empty States

Every empty state names the encouraging next action, never the absence of data as a technical fact:

- Bad: "No data yet." / "0 badges earned."
- Good: "Your child hasn't completed any sessions yet — once they start practising, this fills with real progress." (already the Parent Hub's actual copy — kept as the template for any new empty state written this phase)

## 9. Accessibility

Carried forward from the Foundation Audit's findings, unchanged: maintain the existing `dark:` pairing discipline on every new/touched element, keep touch targets at the established 44×44px minimum, and continue the practice (already followed correctly on every page reviewed) of never using colour alone to convey status — always pair colour with an icon or label.
