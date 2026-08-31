# Premium Frontend Standard — V1

**Status:** Reusable, brand-agnostic quality standard. Established during the Angel 11+ Premium Frontend programme (2026-08-31) as the first reference implementation, per Founder authorisation. **This document defines quality, not visual identity** — it must never be copied into another product and produce a homepage that looks like Angel. Applying it correctly to two different products should produce two visually distinct, product-appropriate results that both pass the same acceptance tests.

**Scope:** Any authenticated or public-facing screen a real user judges the product by — home/landing surfaces, dashboards, core workflows. Internal admin tooling is out of scope unless a project explicitly extends this standard to it.

**Portability rule:** every principle below must survive being asked "does this assume a specific brand, palette, industry or audience?" If a rule only makes sense for one product, it belongs in that product's own art-direction document (see §12), not here. Where Angel is cited, it is cited as *one worked example*, not as the rule itself.

---

## 1. Design Philosophy

A premium interface is not a decorated interface. Premium quality is the visible result of every design decision being traceable to a real reason — informational, functional, or brand-intentional — rather than to convention, convenience, or "that's what these kinds of pages look like."

Two products correctly following this standard will look different from each other, because the standard asks "what does *this* product's content, audience and purpose actually require?" and never "what do premium products typically include?" Restraint is not a style choice here; it is the mechanism by which distinctiveness and trust are produced. Every element on a screen must be able to answer "why am I here?" with something more specific than "because pages like this usually have one."

## 2. What "Premium" Means (and Does Not Mean)

Premium does **not** mean: more gradients, more animation, more cards, more shadows, more glass effects, more colours, more illustrations, more icons, more badges, more sections, more decorative backgrounds, larger hero text, or more marketing adjectives.

Premium **does** mean: deliberate hierarchy, controlled typography, purposeful colour, a coherent and minimal component system, motion that confirms rather than performs, content that demonstrates rather than claims, and an experience that survives close inspection at every viewport and by every kind of reviewer (see §14).

When uncertain whether a decorative element improves the experience, remove it and compare. If nothing is lost, it was never premium — it was noise wearing premium's clothes.

## 3. Hierarchy and Composition

- Every screen must answer, in a fixed order the user can always reconstruct: **Where am I? What matters most right now? What is the one action?** Everything else is secondary and should be reachable, not always-rendered (progressive disclosure by default, not by exception).
- Composition should have rhythm. Not every section is the same size, weight, or visual treatment — some moments are quiet, one or two are dominant. A page where every section looks structurally identical to its neighbours reads as assembled, not composed.
- Alignment and a consistent grid are non-negotiable; asymmetry is a legitimate tool when it serves comprehension, not a default.
- **Card-necessity test:** a bounded container (card, panel, box) is justified only when it visually separates one genuinely distinct, self-contained unit of information or action from its neighbours. It is never a default wrapper for a heading-plus-paragraph that typography and spacing alone would already separate correctly. Before adding a card, ask whether removing its border and background changes anything real.
- **One dominant action per screen.** Exactly one visually-loudest interactive element (the strongest button/card treatment in the system) per screen. Secondary actions use text links or outline/ghost treatments — never a second element competing at the same visual weight.

## 4. Typography

- One typeface family for the whole product (a second family only for a genuinely distinct role — e.g. code/data — never for decoration). Never the bare OS system-font stack in a product asking to be judged as premium; an unreplaced system font is one of the single most concrete, checkable signals of an unfinished or generic product.
- Define a small, named type scale (display / h1 / h2 / h3 / body / small / micro or equivalent) and use nothing outside it. Every size in the product should be traceable to a token, not a one-off `text-[13px]`.
- Control weight, line-height, letter-spacing and measure (comfortable reading line length) deliberately at each scale step — hierarchy should survive with colour removed, from type alone.
- Do not rely on oversized display text as the primary device for signalling "modern." Avoid unnecessarily tiny secondary text that fails accessible contrast/size minimums.
- Establish one deliberate capitalisation convention (e.g. named features/proper nouns keep Title Case, everything else — body copy, buttons, CTAs — uses sentence case) and apply it everywhere; inconsistent capitalisation reads as assembled from different sources.

## 5. Colour

- One primary/brand colour, used for calls-to-action, active/selected state, and brand moments — nowhere else. A colour that appears without a semantic reason should not be on the screen.
- Every other colour in the system must be traceable to one of: (a) a defined semantic role (success/warning/error/info, or a domain-specific identity category, defined once in a canonical table), (b) a neutral scale for everything else. No component invents its own one-off shade.
- Gradients, if used at all, require a specific, named justification tied to one or two genuinely premium/hero moments — never as a default fill, never as a system-wide aesthetic, and never to disguise a lack of real hierarchy. A product may legitimately decide to ban gradients entirely; that decision, once made, is binding until explicitly revisited (see §15 on frozen constraints).
- Never use colour alone to convey status, correctness, or priority — always pair it with an icon, label, or text.
- Both light and dark presentations (where the product supports both) must be defined for every colour token, not layered on as an afterthought per-component.
- **A colour audit is not complete when it covers only framework utility classes and application components.** A colour decision (adopting, retiring, or replacing a brand colour) must also be checked against every other place a colour can render or be declared, which a class-name-only search will not find: arbitrary hex/RGB/HSL values (e.g. Tailwind's `[#value]` syntax or inline styles), CSS custom properties and global stylesheets, layout/page metadata (browser theme-colour tags), PWA manifests and splash-screen configuration, generated application icons and the scripts that generate them, service workers and their offline/fallback pages, SVG or raster image assets with baked-in colour, third-party embed/theme overrides, and every interactive state (hover/focus/active/selected) specifically — these are the surfaces a component-scoped sweep is most likely to miss, and on a real product some of them (the installed app icon, the browser chrome colour) are more visible to a user than any single in-app screen.

## 6. Imagery and Visual Language

- Do not fill a page with generic stock photography or generic AI-illustration aesthetics merely because "premium sites have images." Prioritise showing the real product over illustrating a metaphor for it.
- Never fabricate: testimonials, review counts, user/customer counts, success statistics, endorsements, partnerships, or awards. If credible evidence does not exist yet, design without it — a premium product does not need manufactured social proof (**no-fake-evidence test**).
- If bespoke illustration is used, define one consistent art direction for it and apply it everywhere; a single one-off illustration style used nowhere else is a tell, not a flourish.
- Screenshots, mockups or demonstrations of the actual product are almost always stronger evidence than a generic marketing graphic.

## 7. Component System

- Consolidate toward one governed base primitive per component family (card, button, input, etc.) with variant props (elevation, accent, padding, size) rather than N independently-invented implementations that each redecide radius, shadow, and colour mapping from scratch. A product with seven near-identical card components and no shared base has an architecture problem that will keep producing visual drift.
- Standardise radius, border, elevation, and spacing as tokens every variant reads from — never a literal value duplicated per component.
- Define hover, focus, active, and disabled states once, systemically, not per-component.
- A new component is justified only when no existing primitive-plus-variant can express it. Reuse is the default; invention is the exception.

## 8. Iconography

- An icon earns its place only when it materially improves recognition, navigation, comprehension, status understanding, interaction, or accessibility. **Icon-necessity test:** cover the icon — if the adjacent text loses no real information, remove the icon. This specifically catches decorative "AI-feature" iconography (sparkle/magic-wand style icons beside already-clear headings are a common, checkable tell) and redundant restatement icons beside self-explanatory labels.
- One icon library, used consistently. Standardise stroke weight and sizing into a small number of named roles (navigation icon, status icon, action icon) rather than ad hoc per-use sizing.
- No purely decorative icon role should exist in a mature system.

## 9. Motion and Micro-interaction

- Motion communicates state change — it confirms an action happened, reveals a relationship, or eases a transition. It never performs, celebrates, or manufactures urgency.
- Define a small, named set of durations/easings (e.g. fast/base/slow) and reuse them; do not invent a new timing per component.
- Avoid: parallax, unprompted floating/bouncing elements, scroll-triggered reveal choreography on every section, animation that delays the user from reaching their next action, or any animation whose only purpose is to make the page "feel designed."
- Respect `prefers-reduced-motion` universally, not as a per-component opt-in.
- The best interaction is sometimes nearly invisible — a state change that reads as instant and correct, not as a performance.

## 10. Trust and Content Principles

- Copy must be precise, not aspirational. Avoid generic marketing register — "revolutionary," "supercharge," "unlock your potential," "cutting-edge," "next-generation," "AI-powered" (unless factually load-bearing and true), vague promises with no evidence behind them.
- Never expose internal implementation vocabulary (system/engine/model names, internal IDs, internal status labels) to the audience the product serves — translate mechanism into plain language appropriate to that audience.
- State what a feature actually does. Show the mechanism where possible rather than asserting a benefit — a screenshot of a real recommendation with a real reason beats a sentence claiming "personalised insights."
- Every claim of certainty (a score, a percentage, a readiness signal) must not imply more precision than the underlying evidence supports. Prefer a categorical/tiered signal over a fabricated-precision percentage when the underlying data is genuinely categorical.
- Empty states name the encouraging next action, never state absence as a flat technical fact ("No data yet" is a failure of this principle; "Nothing recorded yet — once you [do the thing], this fills in" is the standard).

## 11. Responsive, Accessibility, and Performance

**Responsive**
- Every important section is reviewed independently at large desktop, standard desktop/laptop, tablet, and common/narrow mobile widths — not just checked for "does it not break."
- Tablet is a first-class target, not a scaled-down desktop or an oversized phone — content-heavy interactive surfaces (forms, question/task shells, comparison views) need a deliberate tablet arrangement.
- **Mobile-intentionality test:** for each major section, can you point to a decision that was made *for* this viewport, not merely inherited from desktop via reflow?

**Accessibility** (part of every component from day one, not a final pass)
- Semantic HTML — real interactive elements (`<button>`, `<a>`), not styled non-interactive elements with a click handler.
- Full keyboard operability for every interactive path a mouse/touch user has, with a visible focus indicator at all times.
- Colour-independent status communication (pair colour with icon/label/text).
- Minimum accessible touch target size (44×44px or the platform-equivalent minimum).
- `aria-live` or equivalent for async/loading state changes; correct heading hierarchy; alt text on meaningful imagery; reduced-motion support.

**Performance**
- Visual sophistication must not cost load time or runtime smoothness. Audit image optimisation, font loading strategy (self-hosted/subsetted where possible, zero avoidable layout shift), unnecessary client-side JavaScript, and animation cost.
- Do not add a heavy dependency to achieve an effect that a few lines of CSS can achieve.

## 12. Global Standard vs. Project-Specific Art Direction

This document defines the **quality bar** — the tests every product must pass. It intentionally does not define:

- a specific typeface, colour palette, or icon set,
- a specific emotional tone or brand personality,
- a specific information architecture or section order,
- a specific component visual style (radius size, shadow depth, border treatment).

Those decisions belong in a project's own **art-direction document** — a short, separate artefact that states the intended audience, emotional response, visual personality, and the project's specific instantiation of §4–§9's tokens (its actual type scale values, its actual colour tokens, its actual radius/elevation philosophy, its actual icon rules). See `ANGEL_DESIGN_LANGUAGE.md` §0 for Angel's own art-direction section as a worked example of this split — read it as "here is how one product answered these questions," not as a template to copy verbatim into a different product.

## 13. AI-Slop Anti-Pattern Catalogue

Actively check for, and be able to explain in writing why each one is absent or justified:

- Enormous generic hero headings with no specific claim
- Gradient text or gradient fills used as a default aesthetic rather than a justified exception
- Glowing blobs, floating orbs, or abstract decorative backgrounds with no informational role
- Excessive glassmorphism
- Every section wrapped in a rounded card regardless of whether it separates distinct content
- Repeated generic three/four-card feature grids (icon + heading + one-line paragraph, repeated identically)
- A badge above every heading
- Generic "Everything you need to..." / "Built for..." copy blocks
- Fake dashboards or product mockups that don't represent the real product
- Fabricated testimonials, review counts, or statistics
- Excessive pill-shaped controls used decoratively rather than functionally
- Decorative sparkle/magic icons beside already-clear text
- Random unexplained animation (floating, bouncing, gratuitous parallax)
- Every section using an identical composition/spacing rhythm regardless of content
- Generic stock photography or generic AI-illustration style
- Filler marketing adjectives with no evidenced claim behind them

A page can fail this standard by exhibiting any of the above even if each individual instance looks "fine" in isolation — the pattern, not the individual element, is the tell.

## 14. Review Process — Multi-Perspective and Final Tests

Before declaring a screen complete, review it from each of these perspectives explicitly (a single "looks good to me" engineering pass is not sufficient):

- **The intended user** — do they understand why this deserves their trust/attention within a few seconds, without domain knowledge of how the product works internally?
- **Product designer** — does the hierarchy feel deliberate, not assembled?
- **Brand/visual designer** — does this have a recognisable identity distinct from generic templates?
- **Conversion/action designer** — is the next action clear without being aggressive or duplicated?
- **Accessibility reviewer** — can people with different needs use this comfortably?
- **Frontend engineer** — is the implementation robust, responsive, and performant?
- **Sceptical reviewer** — which parts still look generated rather than designed? This perspective must be taken seriously, not waved off.

**Final acceptance tests, all must pass:**

1. **"Could this belong to anyone?"** — if the product's name and identity were removed, could this screen plausibly belong to fifty unrelated products in the same broad category? If yes, it has failed; refine until the answer is no *because of the content and structure*, not because of applied branding alone.
2. **Removal test** — for every significant visual element, does removing it make comprehension, hierarchy, trust, interaction, or brand expression measurably worse? If not, remove it.
3. **Product-specificity test** — does the experience visually and structurally make sense specifically for *this* product's audience and purpose, not just "for products in general"?
4. **No-fake-evidence test** — is every claim, statistic, testimonial, or proof point either real or absent?

## 15. Visual QA Process (Mandatory, Not Optional)

Compilation and type-checking are not visual acceptance. A screen is not "done" until:

1. It has been run in an actual browser/runtime, not just compiled.
2. It has been inspected at large desktop, standard desktop, tablet, and mobile widths.
3. Interactive states (hover, focus, active, disabled, error, loading, empty) have been triggered and inspected, not just described in code.
4. At least one deliberate refinement pass has happened *after* seeing the rendered result — the first visually-passable result is not the acceptance bar.
5. The multi-perspective review (§14) and both final tests have been applied to the actual rendered result, not to the source code or a mental model of it.

**If rendered/browser verification tooling is unavailable when this standard is applied:** say so explicitly. Complete every check that can be performed truthfully through other means (source review, automated tests, build output, accessibility linting), and record visual QA as **BLOCKED** or **PENDING**, not passed. Do not claim visual acceptance, and do not certify a screen as a reference implementation, on the basis of source review alone. This is a hard rule, not a preference — a design system's credibility depends on never quietly substituting one form of evidence for another.

## 16. Acceptance Criteria Summary

A screen meets this standard when, and only when, all of the following are true and each is backed by real evidence (not asserted):

- No item from the AI-slop catalogue (§13) is present unjustified.
- Hierarchy, typography, colour, and spacing are each traceable to a token/rule, not ad hoc.
- Cards, icons, and animation each pass their respective necessity tests.
- No fabricated evidence anywhere.
- Accessibility and performance requirements are met.
- Mobile and tablet were reviewed as first-class targets, not inherited-via-reflow.
- The multi-perspective review and both final tests (§14) were genuinely applied to a rendered result.
- Visual QA (§15) is either genuinely complete, or explicitly and honestly recorded as BLOCKED/PENDING with the exact remaining evidence named.

---

*Document version: V1. Origin: Angel 11+ Premium Frontend programme, 2026-08-31. This document is the reusable output of that programme — Angel's own specific tokens, palette, and art direction live in Angel's own documents (see `ANGEL_DESIGN_LANGUAGE.md`), not here. Portfolio-wide propagation is deliberately deferred until Angel itself has passed §14–§15 with genuine rendered evidence (Founder direction, 2026-08-31).*
