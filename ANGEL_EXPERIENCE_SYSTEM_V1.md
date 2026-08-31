# ANGEL 11+ — Experience System, V1

**Status:** Canonical design standard. Research and specification only — no component was built, no page was redesigned, no CSS was changed to produce this document. Grounded in the findings of `ANGEL_PRODUCT_EXPERIENCE_COMMERCIAL_BENCHMARK_V1.md`.

**Governing principle, restated:** Powerful intelligence behind the scenes. Simple, fast and confidence-building experience for the child. Clear evidence and decision support for the parent.

---

## A. Design Principles

1. **Own the typography.** No system font stack. A single, deliberately chosen typeface family (or two — one display, one text) is the highest-leverage, most concrete fix identified in the benchmark and the first foundation decision.
2. **One card system, used sparingly.** A card is a structural tool, not a default container. See Section I.
3. **Icons earn their place.** Never decorative beside already-clear text. See Section K.
4. **Progressive disclosure by default, not by exception.** The Parent Dashboard's CSSE branch already proves this works (benchmark Part 3) — extend it everywhere, don't invent a new pattern.
5. **Never claim more certainty than the evidence supports.** Directly extends the frozen Educational Intelligence documents' own no-forecasting rule into every visual decision — no bar, gauge, or number may imply precision Angel doesn't have.
6. **Calm is the brand.** Restraint, not decoration, is the differentiator identified against every competitor researched.
7. **The child never sees the machinery.** Competency IDs, tier codes, and evidence mechanics stay in Engineering/Audit or Parent-detail views only.

---

## B. Information Hierarchy

Every screen answers, in order: **Where am I? What matters most right now? What's the one action?** Secondary information is always reachable, never always-rendered — the existing progressive-disclosure pattern (benchmark Part 3, finding 3) becomes the mandatory default, not a CSSE-specific exception.

---

## C. Learner Surfaces

The dashboard centres on **one** primary next action (Today's Mission or Continue Learning), not many equally-weighted modules — see Part 10 of the roadmap-facing Gap Register for the exact re-hierarchy. Practice, Learn, and Mock share one question-rendering shell (Section N) instead of each maintaining its own. Progress and achievements move off the dashboard into their own surface, reachable, not competing for the first screen.

## D. Parent Surfaces

The existing "How is my child doing? / What needs attention? / What should they do next? / Are they ready for a mock?" four-question model (already real, `CssePathwayParentContent.tsx`) is the canonical parent-dashboard pattern — extended to every pathway, not just CSSE. Detailed evidence (Competency Summary, Evidence Composition, Readiness Summary) stays exactly where it is today: real, correct, opt-in.

## E. Navigation

Learn / Practice / Mock / Progress remains the right top-level mental model — nothing in this research found a reason to change it. What changes is *density within* each destination, not the destination map itself. Legacy/duplicate routes (`mocks/adaptive/*`, `mock-test` — 008E's own named debt) stay named as technical debt, not silently removed.

---

## F. Typography

**Adopt one real typeface**, replacing the system-font stack (`app/globals.css:233`). Google Fonts is the lowest-friction, zero-licensing-cost path (also the one option this session's own Artifact tooling elsewhere in this environment already treats as safe/available, a useful precedent). A confident, slightly rounded, highly legible sans-serif for a child-facing education product — the exact family is a Founder-taste decision, not one this research document makes unilaterally, but the requirement is unambiguous: **not the OS default.** Keep the existing `html { font-size: 17px }` base (already deliberate, already disclosed, already reasonable) and the existing rem-based scaling discipline — only the family changes, not the scale mechanics.

## G. Spacing / Layout

Formalise the existing but undocumented spacing rhythm (4/8/12/16/24/32px, already what the codebase uses ad-hoc via Tailwind's default scale) into named tokens the way colour already is (`app/globals.css`'s own `--color-*` pattern). Page max-width stays consistent with current practice (`max-w-2xl`/`max-w-3xl`, already reasonable for reading-width content) — not widened for its own sake.

## H. Colour

**No change to the underlying palette** — the benchmark found this system genuinely sound (WCAG-verified, semantically named, well-documented history). The work here is **discipline, not invention**: eliminate the `StatCard`/`RecommendationCard` colliding "purple" key-name problem (Section I), and audit that every new component reuses `--color-*` tokens rather than a fresh hardcoded Tailwind shade.

## I. Cards

**Card governance rule, canonical:** a card is justified when it visually separates one genuinely distinct, self-contained unit of information or action from its neighbours — never as a default wrapper for a heading-plus-paragraph that typography and spacing alone would already separate correctly. **Consolidate the seven existing primitives** (`InfoCard`, `StatCard`, `MissionCard`, `ProgressCard`, `SchoolCard`, `RecommendationCard`, `PremiumCard`) toward one base primitive with variant props (elevation, accent-border, icon-slot) rather than seven independent components each re-deciding radius/shadow/colour-mapping — this directly closes the "assembled from components" signal named in the benchmark. Radius, border, and shadow become single tokens every card variant reads from, not per-component literals.

## J. Buttons / Controls

Primary/secondary/tertiary hierarchy already exists (`components/ui/Button.tsx`, a real, reasonably mature system per 008E/008F's own reuse of it) — extend, don't replace. The one required addition: every interactive control must have a real keyboard-focus and activation path (Section O) — a requirement on top of the existing visual system, not a redesign of it.

## K. Iconography

**Icon governance rule, canonical**, directly answering the Founder's decision: an icon is justified only when it materially improves recognition, navigation, comprehension, status understanding, interaction, or accessibility — never as decoration beside text that is already clear on its own. Practical test before adding any icon: *cover the icon — does the sentence next to it lose any real information?* If not, remove it. Keep the single existing icon library (lucide-react, already consistent across 86 files, confirmed by the benchmark) — the fix is a placement policy, not a library swap, exactly per the Founder's own explicit instruction not to recommend a library change as the solution. Standardise stroke-weight and sizing into named roles: **navigation icon** (one fixed size), **status icon** (paired with a `StatusIndicator`-style text label, never alone — matching the accessibility rule this codebase already applies elsewhere), **action icon** (inside a button, reinforcing not replacing the label). No purely decorative role exists in the canonical system.

## L. Progress Visualisation

**Never a percentage where the underlying evidence is categorical.** `EvidenceTierBadge.tsx`'s own discrete 5-step, always-labelled treatment (benchmark Part 3, finding 1) is the canonical pattern for any Tier/Signal display — extend this exact pattern, don't invent a second one. Raw counts (questions answered, mocks attempted) may use a plain number. A true percentage (e.g. a Mock's own raw-marks percentage, already explicitly labelled "not an official score" per 008F) may use a simple bar, always with the number shown alongside, never colour/fill alone.

## M. Feedback

Correctness feedback for Practice: clear, immediate, calm — no celebratory animation for a correct answer, no punitive styling for an incorrect one, consistent with the "not babyish, not game-like" standard 008V already established for Mock and now extended to Practice. Error/validation feedback: text-based, colour-independent, matching the existing accessibility discipline already found across the Mock workspace.

## N. Question Interactions

**One shared question-rendering shell** for Practice, Learn, and Mock, rather than each maintaining its own (the benchmark found at least three independent implementations historically, and 008E already established this exact "build once" principle for the Mock workspace specifically — extend it product-wide). The shell owns: prompt rendering, answer-input rendering (numeric/short-text/multiple-choice/multi-select/passage), submit affordance, and feedback rendering — subject-specific logic (grading, content) stays separate, only the interaction shell is shared.

## O. Keyboard Behaviour

**This is the single highest-priority interaction fix identified in the entire benchmark.** Canonical pattern, for every appropriate question type:

- **Numeric/short-text answer:** type → **Enter** submits/advances. No mouse required for the core loop.
- **Multiple choice:** number or letter keys (1/2/3/4 or A/B/C/D) select an option; arrow keys move focus between options; Enter/Space activates the focused option. Visible focus ring at all times (already a real, working pattern: `:focus-visible { outline: 2px solid #1d4ed8 }`, `app/globals.css` — reuse it, don't reinvent; updated from the retired plum `#8b5a7c` by the Zero-Purple pass, 2026-08-31).
- **Multi-select:** Space toggles a focused option; Enter submits the set — Enter must never fire on a single toggle within a multi-select group.
- **Passage/comprehension questions:** Tab moves between passage and question panes predictably; Enter inside a single-line answer submits; **Enter must never submit inside a multiline field** (Continuous Writing, extended answers) — Shift+Enter or a dedicated Submit button only, exactly the distinction 008F's own directive already named as a requirement.
- **Mock workspace:** already has the right foundation (real `<button>` elements, `aria-pressed`/`aria-current`) — extend with the same Enter/number-key patterns above once real Mock content exists.
- **Navigation (Previous/Next):** left/right arrow keys as a secondary path, never the only path.
- Every touch target remains ≥44px (already an existing, correct rule: `app/globals.css:242`) — keyboard-first does not mean touch-hostile.

## P. Responsive Behaviour

**Desktop:** the reference implementation for every surface. **Tablet:** fully first-class, not a scaled-down desktop — question/passage layouts get their own tablet-specific arrangement, not a naive reflow. **Mobile:** Practice/Learn/Progress/parent surfaces fully supported; a **formal, timed Mock is not offered on a phone-sized viewport** (008V's own already-established, still-correct decision — restated here as the canonical cross-product rule, not re-litigated).

## Q. Accessibility

Not a later pass — part of every component from Section I onward. Minimum bar, already partially real and to be made universal: visible focus (existing `:focus-visible` rule, extend to every interactive element, including the currently-unhandled Practice question controls); colour-independent status (existing `StatusIndicator`/`EvidenceTierBadge` pattern, extend everywhere); `aria-live` regions for loading/async state changes (already the majority pattern, make it universal); real semantic elements (`<button>`, not a styled `<div onClick>` — the Mock workspace already does this correctly; Practice does not, per the benchmark's own keyboard finding).

## R. Copy

**Child copy:** short, concrete, present-tense, never hedging ("This fills in once there's evidence" is a real, good existing example — keep this register). **Parent copy:** plain English translating real mechanism, never raw internal vocabulary — already mostly true (benchmark Part 3), extend the discipline to any surface not yet audited. **Never flatten a genuine educational explanation to save space** — the existing "How Angel decides what to recommend" explainer is a good example of detailed reasoning placed exactly where a parent is already asking the question, not deleted for brevity.

## S. Motion / Animation

Existing tokens (`--motion-fast: 150ms`, `--motion-base: 200ms`, `--motion-slow: 700ms`) are reasonable and stay. Motion communicates state change (a value updating, a panel expanding) — never celebration, never urgency-manufacturing (matching 008V's own already-established timer standard, extended product-wide). `motion-reduce:` variants already appear in at least one component (`SchoolCard`) — make this universal, not spot-applied.

## T. Empty / Loading / Error States

Loading: keep the existing, accessible `aria-live="polite"` text pattern (benchmark: already consistent across 17+ files) — add a subtle skeleton treatment for content-heavy surfaces only (Dashboard, Parent Dashboard), not a blanket redesign of a pattern that already works. Empty states: state plainly what's missing and the one action that fills it (existing examples like "No practice evidence recorded yet... See practice areas →" are already the right register — formalise, don't reinvent). Error states: calm, specific, always offer a retry or an escape route (existing Mock workspace error handling is a good reference implementation).

---

*Document version: V1. Date: 2026-08-18. Specification only — every principle above is grounded in a specific, cited finding from the Benchmark document, not asserted independently.*
