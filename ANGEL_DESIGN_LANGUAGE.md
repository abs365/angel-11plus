# Angel Design Language — V3

**Status:** Supersedes `DESIGN_SYSTEM.md` (v2D-A, 2026-06-15) as the current design reference. Everything that already worked in v2D-A is carried forward unchanged (typography scale, neutrals, the `rounded-2xl`/`rounded-xl`/`rounded-full` card/button/badge radius convention, mobile touch-target rules — **except** the primary brand colour itself, purple at the time, retired 2026-08-31 per §0a) — this document adds what v2D-A didn't have: a single canonical subject-identity table, a formal card taxonomy, motion rules, and the ALI-invisible language rule. `DESIGN_SYSTEM.md` is kept as a historical record; new work should reference this document.

**Relationship to newer documents (added 2026-08-31, Premium Frontend programme):** `PRODUCT_EXPERIENCE_STANDARD_V1.md` is FROZEN and authoritative over this document on exactly two points it explicitly corrects — gradients (removed entirely, including from `PremiumCard`) and visible XP/Level/Streak UI (hidden; underlying data unchanged). Everything else below remains authoritative. This document is also Angel's **art-direction instantiation** of the portable `PREMIUM_FRONTEND_STANDARD.md` — §0 below answers that standard's §12 ("what does *this* product's own personality, palette, and token values actually look like"). See `PREMIUM_FRONTEND_STANDARD.md` for the underlying reusable principles; nothing in §0 should be copied into another product's brief as if it were a general rule.

---

## 0. Angel Art Direction

**Audience:** parents evaluating and overseeing 11+ preparation for their child (primary decision-maker and daily viewer of evidence), and the child themself using the product directly for practice (primary daily user of the interaction surfaces).

**Intended emotional response:** calm confidence. A parent should feel the product is being honest with them about where their child actually stands, not selling them a feeling. A child should feel capable and unhurried, never anxious or scored like a game.

**Visual personality:** intelligent, reassuring, academically credible, modern, calm, purposeful, child-aware, parent-trustworthy. Explicitly not: childish, clinical, corporate, gimmicky, futuristic-for-its-own-sake, AI-themed, or template-driven. The product should read as a serious, considered educational tool a parent would trust with something that genuinely matters to their family, not as a startup demo.

**Typography direction:** one self-hosted family (Lexend — chosen for its evidence-based reading-proficiency design brief, matching the product's own evidence-based brand promise, not a taste pick), weight range 300–700 carrying the full hierarchy alone. No second display family; see §1.

**Colour direction:** blue as the single primary/brand colour (CTAs, active nav, brand moments only — see §0a; purple/violet/indigo are retired Angel-wide, not just here); a fixed subject-identity table (§2) for anything representing a specific subject; warm stone/ivory backgrounds rather than cool or saturated surfaces, per the Founder's explicit "move away from saturated purple, toward a calmer educational aesthetic" direction; gradients removed entirely per the FROZEN correction above.

**Imagery direction:** the real product (real dashboard states, real recommendations with real reasons, real evidence surfaces) is the primary visual material — not stock photography, not generic illustration. No fabricated children, parents, schools, testimonials, or outcome statistics, ever (see §6/§10 below and `PREMIUM_FRONTEND_STANDARD.md` §6/§10).

**Icon direction:** lucide-react only; an icon earns its place per the cover-test in §4 of `ANGEL_EXPERIENCE_SYSTEM_V1.md` — no decorative/"AI-magic" iconography (sparkle-style icons beside already-clear headings are explicitly rejected, see the Gap Register's H1 finding).

**Density and radius philosophy:** moderate density — enough information to be useful to a parent in one glance, never a wall of numbers. `rounded-2xl` for structural cards/heroes, `rounded-xl` for utility rows, `rounded-full` for pills/badges — carried forward unchanged from v2D-A.

**Elevation philosophy:** mostly flat (`elevation="flat"`, no shadow) — reserve a raised/shadow treatment for the one or two things on a screen that are genuinely more important than their neighbours (Today's Mission on the dashboard is the canonical example), never as a default card treatment.

**Interaction character:** quiet and immediate. Press feedback (`active:scale-[0.98]`) and hover lift on navigable cards, nothing celebratory or game-like on correctness feedback — matching the "not babyish, not game-like" standard already established for Mock and Practice.

**Content tone:** natural, professional British English; ALI-invisible (never "Adaptive," "Learning Unit," "Competency," "Intelligence," "Recommendation Engine," "Beta" to the user); empty states name the next encouraging action; no em/en dash stylistic punctuation (enforced by `scripts/copy-quality-guard.mjs`); never claim more certainty than the evidence supports.

### 0a. Zero-Purple Decision (2026-08-31, Founder directive) — supersedes the primary-colour value above

**Purple, violet and indigo no longer form part of Angel's visual language, anywhere.** This is an Angel-wide, systematic design-system decision, not a homepage-only fix — see §2/§5 below for the resulting colour system and `PREMIUM_FRONTEND_STANDARD.md`'s own colour discipline (§5) for the portable principle this instantiates.

**Documented history, not silently erased (Angel Evidence Hierarchy):** this token's value has changed three times. AN-108 moved primary from purple to forest-green; that was reverted because the much larger number of components that never adopted the green token kept their own hardcoded purple, producing visually isolated green surfaces against an otherwise-still-purple product. The Founder then explicitly restored purple as primary ("PRIMARY BRAND: Angel purple"). This session's Founder directive explicitly reverses that restoration: purple is retired, this time systematically (token layer, every component, every state), specifically to prevent the same "half-migrated" failure mode that sank the earlier green attempt.

**Why this attempt is structured differently from the AN-108 attempt:** AN-108 changed the token but left ~90 files of hardcoded `purple-*`/`violet-*`/`indigo-*` Tailwind utility classes untouched, so the token and the actual rendered product silently diverged. This pass edits both — the token layer (`app/globals.css`) *and* the call sites — specifically to close that gap.

**New primary/interactive colour: deep blue** (`--color-primary`, blue-600/blue-700 hover, light mode; blue-400/blue-500, dark mode). Chosen over the alternatives actually considered:
- **Green/teal family** — rejected outright; this is the exact family AN-108 already tried and the Founder reverted, and it collides with the existing success-semantic colour (emerald), risking "is this a success state or the brand button?" confusion.
- **A different hue entirely (burgundy, olive, near-black ink)** — considered and rejected: every unclaimed hue either reads as inconsistent with the calm/academic personality (bright yellow), requires custom hex values the codebase doesn't otherwise use (breaking the existing Tailwind-named-scale convention that makes the mechanical token-to-class mapping tractable at this scale), or (near-black ink) has no clean same-hue dark-mode counterpart, unlike every other token in this file.
- **Blue** was chosen because it satisfies all three: distinct from every existing semantic colour (success/warning/error/info), distinct from seven of the eight subject-identity colours below, expressible as a standard Tailwind scale with a working light/dark pair, and it fits the "intelligent, calm, academically credible, British, trustworthy" personality (§0) at least as well as purple did, arguably better given purple/violet's strong association with generic AI-product branding (`PREMIUM_FRONTEND_STANDARD.md` §13).

**The one accepted overlap:** Maths' subject-identity colour is also blue (§2). Evaluated, not overlooked: Maths' blue appears as a small icon/tint inside one subject card among several differently-coloured subject cards; primary blue appears as a large filled CTA button. The two are never adjacent in the same context and are disambiguated by size, form and position, not hue alone — the same kind of proximate-but-distinguishable pairing the table already tolerates elsewhere (Cyan/Non-Verbal Reasoning sits close to Sky/info on the wheel too).

**Secondary is retired as a saturated brand hue.** Indigo (the former secondary token) is exactly as purple-family as purple itself — keeping it as "the other brand colour" would just relocate the original problem under a different name. Per `PREMIUM_FRONTEND_STANDARD.md` §3, secondary emphasis is expressed as a neutral (slate) outline/ghost treatment, not a second competing solid fill.

**Preventing recurrence:** the token layer (`app/globals.css`) is the enforced source of truth for primary/secondary; no new component should hardcode `bg-purple-*`, `bg-violet-*`, or `bg-indigo-*` going forward — read `--color-primary`/`--color-secondary` (or their Tailwind-class equivalents, blue/slate) instead. This rule is Angel-specific and does not apply to `PREMIUM_FRONTEND_STANDARD.md`, which remains brand-agnostic — a future product may legitimately choose purple.

---

## 1. Typography, Spacing, Neutrals

Unchanged from `DESIGN_SYSTEM.md` §1 and §2's neutrals table — the existing scale (`display`/`h1`/`h2`/`h3`/`body`/`small`/`micro`) and the `--background`/`--surface`/`--surface-raised`/`--border` tokens are correct and already consistently applied (confirmed during the Foundation Audit: no meaningful spacing/radius drift found across dashboard, parent, maths, english, or the adaptive routes). Nothing to change here — the gap was never spacing, it was consistency of *colour* and *icon* identity, and the absence of a *systematic* loading/motion/icon language. Those are what follow.

## 2. Subject Identity — the canonical table

**This is the single source of truth.** Every place a subject's colour or icon appears anywhere in the product must match this table exactly. Two real inconsistencies were found and are corrected by this table (not by inventing new colours/icons, but by enforcing the ones `DESIGN_SYSTEM.md` and `components/Navigation.tsx`/`app/dashboard/page.tsx` already established as canonical):

| Subject | Icon (`lucide-react`) | Colour token | Where it was wrong before |
|---|---|---|---|
| English | `BookOpen` | **Yellow/Gold** (was Purple — retired 2026-08-31, Zero-Purple decision, §0a; Orange was tried first and rejected — it rendered identically to Writing's existing orange/amber in at least one component, a real collision found during implementation) | — (already consistent) |
| Maths | `Calculator` | Blue | The adaptive Maths route used emerald (a pathway colour, not a subject colour) |
| Vocabulary | `BookMarked` | **Emerald/Green** | The adaptive Vocabulary route used teal — which is Spatial Reasoning's colour, a genuine identity clash |
| Writing | `Pencil` | Amber/Orange-adjacent but distinct from English's Orange in practice (existing pairing, unaffected by this pass) | — |
| Verbal Reasoning | `Puzzle` | **Lime** (was Violet — retired 2026-08-31, Zero-Purple decision, §0a) | Parent Hub used `Brain` instead of `Puzzle` |
| Non-Verbal Reasoning | `Shapes` | Cyan | Parent Hub used `Eye` instead of `Shapes` |
| Spatial Reasoning | `Compass` | Teal | Parent Hub used `Box` instead of `Compass` |
| Numerical Reasoning | `Hash` | Rose | — (already consistent, the one reasoning subject Parent Hub got right) |
| Mocks / Practice | `Target` | Pink (as an accent; Practice itself is framed as premium neutral, see §5) | — |
| Progress | `BarChart2` | **Slate** (was Indigo — retired 2026-08-31, Zero-Purple decision, §0a) | — |

**Zero-Purple replacements, why these three:** English's colour was tried as Orange first and rejected once implementation reached `components/parent/LegacyPathwayParentContent.tsx`'s `SUBJECT_COLORS` table, where Writing already renders literal `orange-500` — English and Writing would have been indistinguishable in that (and likely other) subject-breakdown surfaces. Moved to Yellow/Gold instead (deliberately the deeper yellow-700/800 range, not bright yellow-400/500 — reads as a muted gold/mustard, fitting "classic literature" and avoiding a childish/gaming tone), which is genuinely distinct from Writing's orange/amber. Verbal Reasoning's Lime is deliberately dark-shaded (lime-700/800, not the brighter lime-400/500 range) so it reads as calm/academic rather than the neon-adjacent tone lime can carry at lighter shades. Progress's Slate is desaturated by design — Progress is an analytical/measurement surface, not a subject with its own energetic identity, so a calm neutral fits better than another saturated hue competing for attention. English and Verbal Reasoning implementation note: `components/SubjectCard.tsx`, `components/ReasoningSession.tsx` and other subject-lookup components keep their internal variant keys named `"purple"`/`"violet"`/`"indigo"` (TypeScript union literals / object property names, invisible to users) mapped to the new class values — renaming the keys themselves was judged unnecessary churn across every call site for a purely internal identifier; what changed is what colour actually renders, which is the part users see.

**Rule going forward:** a subject's icon and colour are decided once, here, and every surface (navigation, dashboard, Parent Hub, adaptive routes, mocks hub) references this table. No page is allowed to pick its own icon or colour for an existing subject — that's exactly the drift this table exists to prevent from recurring.

## 3. Card Taxonomy

Every card in the product is one of these five types. A new card should never invent a sixth shape without a real reason — reuse first.

| Card type | Used for | Base shape |
|---|---|---|
| **Hero card** | Dashboard welcome, session-summary screens | Solid primary-blue fill (**not** a gradient — the gradient fill this row previously specified violated the FROZEN no-gradients rule in `PRODUCT_EXPERIENCE_STANDARD_V1.md`; corrected 2026-08-31, also removes a second-order purple reference), `rounded-2xl`, generous internal padding (`px-6 py-5`+), white text |
| **Subject card** | Any "go do this subject" entry point | `rounded-2xl`, colour-tinted background per §2's table, 1.5px identity strip at top, icon in a rounded-2xl chip, `group-hover:-translate-y-1` lift |
| **Session/Mission card** | "Here's what to do right now" (Today's Mission, a passage/word presented for practice) | White/surface background, `rounded-2xl`, left-border priority accent where ranking matters, one unambiguous primary CTA at the bottom |
| **Stat/Achievement card** | A single number with a label (XP, streak, sessions, accuracy) | `rounded-2xl`, colour-tinted background, icon + large number + small label, no CTA |
| **Utility card** | Settings-like rows, list items, support links | `rounded-xl` (one step down from the above), white/surface background, often a `ChevronRight` affordance if it navigates |

Every card type gets the same treatment in dark mode (paired `dark:` classes, never omitted — the Foundation Audit's dark-mode gaps were always cards or components that skipped this pairing, not a systemic dark-mode failure).

## 4. Icon System

Lucide React remains the icon library (no new dependency). The correction in §2 *is* the icon system work this phase — the previous icons were "functional but not memorable" specifically because the same subject wore different icons on different screens, which is the opposite of memorable. Fixing that consistency **is** what makes icons feel premium; this phase does not introduce a custom icon set, because a custom illustrated icon set is a larger, separate investment not justified by the actual defect found.

## 5. Colour — used intentionally, not decoratively

**Blue is the single primary/brand colour** (CTAs, active nav state, brand wordmark, hero fills) — see §0a for the full Zero-Purple decision record and why this replaces purple. Hero fills are solid, never gradients (FROZEN, `PRODUCT_EXPERIENCE_STANDARD_V1.md`). Every other colour in the product must be traceable to one of:

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
