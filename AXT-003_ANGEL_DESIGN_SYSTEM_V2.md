# AXT-003: Angel Design System — Version 2.0

**Document ID:** AXT-003
**Role:** Chief Experience Architect, Angel Experience Transformation Programme
**Status:** Constitutional — governs every learner, parent, and administrator screen, workflow, and interaction. Not a mock-up, not a Figma spec, not implementation code.
**Supersession lineage, stated explicitly:** `DESIGN_SYSTEM.md` (v2D-A, 2026-06-15) → `ANGEL_DESIGN_LANGUAGE.md` (V3, current canonical, supersedes v2D-A while keeping it as historical record) → **this document (Version 2.0), which extends V3, not replaces it.** Every value from V3 that is not explicitly revised below remains binding exactly as written there — this document adds the governing layer V3 didn't need to have yet (Competency Presentation, Parent Experience, Voice Interaction, and consistency-enforcement patterns), it does not re-litigate typography, spacing, or the subject identity table, which V3 already got right.
**Extends and is bound by:** `AEP-001` through `AEP-005` (Educational Constitution / Learning Science Constitution), `docs/strategy/ANGEL_EXPERIENCE_MANIFESTO.md` and its companions (Experience Constitution), `AXT-002_ANGEL_EXPERIENCE_BLUEPRINT.md` (Experience Blueprint), and the Competency Intelligence Platform (`lib/ali/*`).

**How to use this document:** a new component is a last resort. Before proposing one, check §9's Component Catalogue for something to extend. Every pattern below states what it reuses before it states what it adds.

---

## 1. Design Philosophy

Angel's design system exists to make an invisible, evidence-based engine feel like a single, considered, trustworthy product — never to showcase the engine, and never to invent visual novelty the underlying education doesn't need. Four commitments, each inherited directly rather than newly asserted:

- **Invisible engine, visible education** (Manifesto; `AXT-002` §1.1) — every visual decision below is checked against this before anything else.
- **Reuse before invention** (`AXT-002` §1.2) — this document's default answer to "do we need a new component" is no until proven otherwise.
- **One experience per subject** (`AXT-002` §1.4/§9.8) — the design system must never make it easier to spin up a second, parallel visual treatment of a subject that already has one.
- **Honesty about gaps as a design feature, not a defect** (Manifesto; `AXT-002` §1.6) — synthetic content, pending connections, and unrated capabilities (§14, §23) are always disclosed in the visual language itself, never hidden behind polish.

## 2. Design Principles

Unchanged, restated as still-binding: the Manifesto's six Design Principles (Typography, Spacing, Motion, Colour, Accessibility, Consistency) and `ANGEL_DESIGN_LANGUAGE.md` §5's colour-intentionality rule ("a colour that doesn't map to subject identity, semantic state, or neutral shouldn't be on the page"). This document adds one enforcement principle: **every principle in this section must be mechanically checkable**, not just aspirational — §24 defines how.

## 3. Visual Language

**The canonical subject identity table is `ANGEL_DESIGN_LANGUAGE.md` §2, unchanged, and is not reproduced twice in this codebase's documentation to avoid drift.** Reference it directly; do not copy its values into a new file. The one addition this document makes: **any future subject or competency family (e.g., a real `maths.probability` competency, per `WP-15`, once approved) must be assigned an icon and colour in that same table before it appears in any UI** — never assigned ad hoc by whichever screen introduces it first.

## 4. Typography System

Unchanged from `DESIGN_SYSTEM.md` §1, reconfirmed correct by `ANGEL_DESIGN_LANGUAGE.md` §1's audit: the `display`/`h1`/`h2`/`h3`/`body`/`small`/`micro` scale, the system-font stack, and the mobile sizing rules (never below `text-xs`, 44×44px touch targets). No revision.

## 5. Colour System

Unchanged base tokens from `DESIGN_SYSTEM.md` §2 (purple primary, indigo secondary, the support palette, neutrals, dark-mode CSS variables), with `ANGEL_DESIGN_LANGUAGE.md` §2's two corrections (Maths = Blue, not emerald; Vocabulary = Emerald, not teal) as the current, binding state. **Governing rule for Version 2.0:** every new colour usage must be traceable to one of the three reasons `ANGEL_DESIGN_LANGUAGE.md` §5 already names (subject identity, semantic state, neutral) — this document adds no fourth reason.

## 6. Spacing and Layout System

Unchanged from `DESIGN_SYSTEM.md` §6/§8/§11: the `gap`/`p`/`max-w` scale, the `rounded-lg/xl/2xl/full` radius convention, and the `PageLayout`-wraps-every-student-page rule. **Extension for Version 2.0:** any future consolidated surface (e.g., the merged mock-exam experience, `AXT-002` §1.4) must select its `max-w` band from the existing three (2xl/3xl/4xl) by genre — session flows narrow, subject hubs medium, dashboards wide — never introduce a fourth width band without a documented reason.

## 7. Responsive Behaviour

Unchanged: iPad-first framing (`ANGEL_DESIGN_LANGUAGE.md` §6, "most of this product's real usage"), the mobile 44×44px touch-target floor, the 5-slot mobile bottom nav (`Navigation.tsx`, confirmed live — Home/English/Maths/Practice/Progress, with Parent/Login as a sixth always-present slot). **No new breakpoint or responsive pattern is introduced by Version 2.0** — every existing page already resolves correctly at mobile/tablet/desktop widths per the Foundation Audit's own confirmation.

## 8. Accessibility Standards

Unchanged baseline (`ANGEL_DESIGN_LANGUAGE.md` §9): `dark:` pairing on every element, 44×44px touch targets, colour never used alone to convey status. Three real, verified extensions for Version 2.0:

- **Reduced motion is already respected automatically** (`DESIGN_SYSTEM.md` §7 — "All animations respect the user's `prefers-reduced-motion` setting... via browser behaviour"). No component-level override should ever disable this.
- **Feature-detection-safe degradation is an existing, real pattern worth generalising**: `PassagePlayer.tsx` checks `"speechSynthesis" in window` and `"SpeechRecognition" in window || "webkitSpeechRecognition" in window` before offering voice features, and degrades gracefully (not silently broken) when unsupported. Every future voice-interaction surface (§14) must follow this exact pattern — feature-detect, then degrade, never assume.
- **An honest gap, not papered over:** no document in this system currently specifies a keyboard-only navigation or visible-focus-ring standard. Given the product's genuine iPad-first usage profile this is a lower-severity gap than it would be for a desktop-first product, but it is a real one — any future Version 2.0 implementation work should confirm visible focus states exist on every interactive element before claiming full accessibility compliance, rather than assuming touch-target sizing alone is sufficient.

## 9. Component Catalogue

Every component below is real and already shipping — this section catalogues, it does not propose. Full six-field treatment for the load-bearing ones; a lighter entry for supporting components.

### PageLayout / SupportLayout
- **Educational purpose:** consistent framing so cognitive effort goes to the content, not re-learning the chrome (AEP-001 §2.4, cognitive load).
- **Learner benefit:** predictable structure across every subject page.
- **Parent benefit:** `SupportLayout` gives every legal/support/feedback page (`AXT-001` §24–31) identical back-navigation and typography — a parent never has to relearn how to get back.
- **Behaviour:** wraps page content, provides consistent max-width/padding per §6.
- **Accessibility:** consistent landmark structure across pages.
- **Reuse guidance:** every new student page uses `PageLayout`; every new support/legal/feedback page uses `SupportLayout`. Neither should ever be forked into a third layout wrapper.

### SubjectCard
- **Educational purpose:** makes a subject instantly identifiable, reducing the decision-friction AEP-001 §2.8 warns against for this age group.
- **Learner benefit:** one glance tells a child which subject this is and roughly what it involves.
- **Parent benefit:** consistent visual identity builds the "this is a considered product" impression the Manifesto names directly.
- **Behaviour:** colour-tinted background, identity strip, icon chip, hover-lift, press-scale (`ANGEL_DESIGN_LANGUAGE.md` §6 motion rules, confirmed present in the component's own class list).
- **Accessibility:** colour is always paired with the icon and title text, never the sole signal.
- **Reuse guidance:** the single card type for any "go do this subject/pathway" entry point — `PathwayCard` follows the identical pattern for pathways specifically and should not diverge from it without reason.

### ReasoningSession
- **Educational purpose:** implements AEP-001 §2.1 (retrieval practice) identically across four subjects from one component.
- **Learner benefit:** once a child learns how one reasoning subject works, all four work the same way — reduces relearning cost the Manifesto's Consistency principle exists to prevent.
- **Parent benefit:** indirect — consistent subjects are easier for a parent to understand as "the reasoning subjects," collectively.
- **Behaviour:** configured per subject via props (`subjectKey`, `themeColor`, `icon`, `questions`, `skills`, `examBoards`) — no subject-specific forked logic.
- **Accessibility:** inherits whatever the shared component implements once, rather than four independent (and potentially inconsistent) implementations.
- **Reuse guidance:** the platform's best existing proof of the "one component, N configurations" principle (`AXT-002` §1.2) — the template any future subject-family consolidation (English/Maths/Vocabulary/Writing, per `AXT-001`'s consolidation opportunity) should converge toward, not a one-off.

### PremiumLoader
- **Educational purpose:** protects AEP-001 §2.9's anxiety ceiling during a genuine wait — an unexplained stall reads as failure to a child.
- **Learner benefit:** a wait feels like anticipation, not a stall (Manifesto's Learning Journey, "waiting moments... are part of the story").
- **Parent benefit:** N/A directly (learner-only moment).
- **Behaviour:** one message immediately, rotating reassurance messages every 3 seconds if loading runs long — "no loading state should last forever" paired with "if it takes a while, say so."
- **Accessibility:** purely visual/textual; no motion that would violate reduced-motion preference (inherits browser-level respect, §8).
- **Reuse guidance:** the single loading component for the whole product (§17) — no future feature introduces a second loading convention, per `ANGEL_LOADING_EXPERIENCE.md`'s own explicit rule.

### PassagePlayer
- **Educational purpose:** operationalises oral reading fluency measurement (`lib/readingUtils.ts`'s word-level accuracy/WPM comparison) — a real, distinct skill from silent comprehension, genuinely evidenced as part of reading development.
- **Learner benefit:** hearing a passage read aloud (TTS) and having their own reading measured (Speech Recognition + transcript comparison) gives a genuinely different, complementary retrieval-practice mode.
- **Parent benefit:** a concrete, nameable fluency signal (accuracy %, words-per-minute) could feed the Parent Journey (`AXT-002` §4) once connected — not yet surfaced there today.
- **Behaviour:** feature-detects `speechSynthesis` and `SpeechRecognition`/`webkitSpeechRecognition` before offering either mode; degrades gracefully, not silently, when unsupported.
- **Accessibility:** the feature-detection pattern itself is the accessibility contribution — see §8.
- **Reuse guidance, corrected finding from `AXT-001`/`AXT-002`: this component already implements real speech-to-text with transcript comparison, not merely text-to-speech playback.** Any future voice-interaction work (§14) should extend this existing mechanism, not build a second, separate speech-recognition pathway.

### WritingFeedback
- **Educational purpose:** the only AI-generated feedback surface in the product, supporting AEP-001 §2.5's feedback-specificity requirement for the one subject (Writing) with no ALI competency model.
- **Learner benefit:** specific, actionable feedback on a real piece of writing, not a bare score.
- **Parent benefit:** N/A directly today.
- **Behaviour:** dynamically loaded (`next/dynamic`) with a skeleton loading state, calls `/api/writing-feedback`.
- **Accessibility:** loading skeleton uses `aria-hidden` correctly (confirmed in the component's own import site).
- **Reuse guidance:** the only existing generative-AI integration pattern — any future AI-feedback surface elsewhere in the product should reuse this call pattern, not build a parallel one.

### Supporting components (lighter entries)
- **`InsightCard`** — single-purpose analytics-insight display; reuse for any new derived-insight surface rather than a bespoke card.
- **`BadgeCard` / `NewBadgeBanner`** — achievement display and first-seen celebration; see §19.
- **`DifficultyBadge`** — a single, consistent difficulty-tier chip; reuse everywhere a difficulty needs display, never a bespoke label.
- **`SubjectBreakdown` (`SubjectBar`/`SkillBar`)** — the shared per-subject/per-skill bar used by both Progress (learner) and, in spirit, Parent Hub's own equivalent — see §13 for the consolidation opportunity this implies.

---

## 10. Navigation Components

`Navigation.tsx`'s sidebar (sectioned: Learning / Reasoning / Assessment / Family / Support) and mobile bottom bar (5 fixed slots + Parent/Login) are unchanged and governed by `AXT-002` §2's Navigation Philosophy. `SidebarLink`'s active-state pattern (background tint, icon colour shift, trailing dot) is the one link-row pattern; no second nav-row style should be introduced. Any future consolidation of the Assessment section (per `AXT-002`'s mock-exam merge direction) changes the nav's *targets*, never its *pattern*.

## 11. Learning Components

Covered by `ReasoningSession` (§9) for the four reasoning subjects. **The real, current gap this document names rather than resolves:** English, Maths, Vocabulary, and Writing each still have their own bespoke page-level state machine (`useState<Mode>`-style, per `AXT-001` §2–5) rather than a shared learning-session component. This is not a defect — each subject's mechanic is genuinely somewhat different (passage+questions vs. arithmetic+reasoning modes vs. flashcard+quiz vs. timed writing+AI feedback) — but it is the platform's clearest remaining opportunity to extend the `ReasoningSession` "one component, N configurations" pattern, once Experience Transformation reaches these four surfaces (`AXT-001`'s UPGRADE decision for all four).

## 12. Competency Presentation Patterns

**Governing rule, inherited directly from `AXT-002` §6:** any UI element presenting a competency-derived signal must trace to a real layer in the Derived State Hierarchy, and must render through exactly one of the three Explainability audiences. This section describes how existing components must behave once real ALI signals reach them — no new component is proposed.

- **`DifficultyBadge` and `SubjectBreakdown`** must never render a raw confidence tier, competency code, or mastery-state string — only the learner- or parent-audience *text* WP-10's `generateExplanation()` already produces, once connected.
- **A progress bar or percentage must never move for encouragement alone** — every fill value must be traceable to a real evidence layer (§AXT-002 §6, Evidence Dominance). Where no real signal exists yet (e.g., Wellbeing not yet connected, `AXT-002` §4), the corresponding UI element is either omitted or explicitly marked as pending — never faked with a plausible-looking placeholder value.
- **A "recommended for you" label anywhere in the product must correspond to a real `RecommendationCandidate` and `triggerReason`** (WP-09/19) once Recommendation Orchestration is connected — not a hand-authored "suggested" label with no underlying evidence.

## 13. Parent Experience Patterns

Reuses `DESIGN_SYSTEM.md` §3's Parent Card (`rounded-2xl`, white/surface, readiness-bar `bg-gray-100 rounded-full h-2`) unchanged. Governed by `AXT-002` §4's Parent Journey. **One real consolidation opportunity, named not resolved:** Progress (`SubjectBreakdown`) and Parent Hub compute conceptually overlapping subject/skill breakdowns from two separately-maintained functions (`computeAnalytics`/`computeGamification` vs. `computeParentReport`) for two genuinely different audiences (learner vs. parent language, per the Manifesto's own requirement that these must differ). **The design system's job here is to ensure both eventually render from one shared underlying computation with two audience-specific presentation layers** — not to merge the two audiences' language, which the Manifesto explicitly forbids.

## 14. Voice Interaction Patterns

**Reuses `PassagePlayer.tsx` entirely — this is not a new pattern, it is the existing one, catalogued.** Two real, already-built modes: **Listen** (`speechSynthesis`, TTS playback of a passage) and **Read Aloud** (`SpeechRecognition`, live transcript capture, word-level accuracy/WPM scoring via `compareTranscript()`). Governing rules, per `AXT-002` §7:

- Voice is additive — every voice-enabled surface must remain fully usable with voice absent or unsupported (already true today, via feature detection).
- Voice UI language follows the same Invisible Intelligence rule as everything else — "Listen" and "Read Aloud," never "TTS" or "Speech Recognition," anywhere a learner sees it (already true in the existing component's icon/label choices — `Volume2`, `Mic`, plain-language, no technical labelling).
- **Extending this pattern to a new subject or skill is a configuration exercise, not a new build** — the same component/mechanism that reads a passage aloud and scores a spoken response is architecturally reusable for any future read-aloud or say-the-answer interaction, not exclusive to English Comprehension.
- No Evidence Strength rating exists yet for voice-based instruction generally (`AXT-002` §7) — this remains true and unresolved by this document; oral reading fluency specifically (words correct per minute) *is* a well-established, separately-evidenced literacy measure in its own right, distinct from the general "voice-first learning" claim, and the design system should not conflate the two when this gets addressed.

## 15. Feedback Patterns

**Governing rule (AEP-001 §2.5, restated as a design rule):** no feedback surface anywhere in the product may show a bare score without a named, specific skill or competency alongside it. Reuses:
- **`WritingFeedback`** (§9) for the one AI-generated feedback surface.
- **The Daily Mission's `aliReasonText()`/`reasonText()` pattern** (`lib/adaptiveEngine.ts`) — already names specific weak competencies/skills rather than a percentage alone; this is the existing template for any future feedback copy, not a new pattern to invent.
- **The 3-audience Explainability model** (§12) governs any future feedback surface that touches ALI-derived reasoning specifically.

## 16. Empty States

Unchanged from `ANGEL_DESIGN_LANGUAGE.md` §8: name the encouraging next action, never the absence of data as a technical fact. Parent Hub's existing copy ("Your child hasn't completed any sessions yet — once they start practising, this fills with real progress") remains the canonical template for any new empty state.

## 17. Loading States

Unchanged: `PremiumLoader` (§9) is the single loading component for the entire product. No future feature introduces a second loading convention, a bare spinner, or developer-placeholder text.

## 18. Error States

**A real, honest gap this document names rather than invents a fiction to fill:** no existing document specifies a unified error-state pattern, though real, working inline-validation patterns already exist independently across `/login` (rate-limit/domain validation), `/beta-family`, `/feedback`, and other forms (field-level error messages, submit-disabled states). **Governing principle for Version 2.0, extending the engine's own established discipline** (`lib/ali/*`'s console.warn-and-safe-fallback convention, never a thrown error a user sees): a learner or parent should never see a technical error message, a stack trace, or a raw API failure string. Every error state should either (a) explain in plain language what went wrong and what to do next (mirroring an empty state's own "name the next action" rule), or (b) fail silently into a safe fallback exactly as the engine already does, with the failure logged internally, not displayed. **Recommended next step, not undertaken here:** consolidate the existing per-form inline-validation patterns into one named component, the same way `PremiumLoader` consolidated four separate loading strings.

## 19. Success and Celebration Patterns

Reuses `BadgeCard`/`NewBadgeBanner` and the XP-bar 700ms fill transition (`DESIGN_SYSTEM.md` §7) unchanged. Governed by the Manifesto's Success beat ("proud of something specific... a real, nameable thing") — confirmed genuinely operating in production per `ALI_OPERATIONAL_VALIDATION.md`'s direct evidence ("a 'Perfect Session' badge appeared exactly when a 100% score was achieved"). **No new celebration mechanic is proposed** — the existing badge/XP system already satisfies this Manifesto beat; Experience Transformation's job here is extending its reach (e.g., to a merged mock-exam experience), not reinventing it.

## 20. Motion Principles

Unchanged, consolidated from `DESIGN_SYSTEM.md` §7 and `ANGEL_DESIGN_LANGUAGE.md` §6: press-scale (`active:scale-[0.98]`) on every tappable primary element, hover-lift on navigable cards, `duration-150`–`200` for interactive transitions, `duration-700` for progress-bar fills, and the explicit prohibition on parallax, scroll-triggered reveals, and decorative easing. Motion confirms; it never performs.

## 21. Interaction Behaviour

Every tappable element gives immediate visual confirmation (§20). Every card that navigates somewhere is a `<Link>`-wrapped block, never a `<div>` with an onClick handler standing in for navigation (confirmed as the consistent pattern across `SubjectCard`, `PathwayCard`). **Honest gap, restated from §8:** keyboard-only interaction behaviour (tab order, visible focus, Enter/Space activation on custom controls) has not been independently verified across the product in producing this document — flagged, not resolved.

## 22. Content and Copy Principles

Unchanged: `ANGEL_UX_V3_STRATEGY.md` §3's internal-name → user-facing-copy substitution table is binding on every future string. The Manifesto's Respect Familiar Educational Language principle governs equally — trusted terms (Mock Exam, Assessment, Practice, Exam Readiness) are never replaced for the sake of a fresher-sounding brand voice. Every empty state, error state (§18), and loading message (§17) is copy, and is therefore bound by this section too, not exempt from it.

## 23. Trust and Safety Indicators

- **The synthetic-content banner is the existing, real, load-bearing trust mechanism** for every adaptive route still running on fixture data — the Manifesto's own words: "these build more trust over time than a polished façade over an unfinished capability ever will." No future feature should remove or soften this banner before real content genuinely replaces the fixture behind it (a specific, standing caution `ANGEL_PROJECT_CLOSURE_REPORT.md` already raised and this document reaffirms).
- **Tier 0 Wellbeing is an invisible trust mechanism by design** (`AXT-002` §6) — a parent is meant to trust that no recommendation crossed a safety line, without ever seeing the mechanism that guarantees it. This is the one place in the whole system where "invisible" is itself the trust signal, not a withheld feature.
- **Real authentication is the actual security boundary, not UI gating** — confirmed for `/admin-beta` (Supabase Auth + RLS + `is_current_user_admin()`, migration 008) and this remains the one pattern any future access-gated surface must reuse (`AXT-002` §5).
- **Confidence-calibrated language is itself a trust indicator** (`lib/ali/explainability.ts`'s `parentText()`, WP-10) — a claim's phrasing already scales with the evidence behind it ("has consistently answered... correctly" vs. "is just starting to explore") rather than presenting every claim with uniform, potentially overstated confidence.

## 24. Experience Consistency Rules

The enforcement layer for everything above:

1. **One subject identity table** (`ANGEL_DESIGN_LANGUAGE.md` §2) — every subject/colour/icon reference in the whole product traces to it; no page defines its own.
2. **One loading component, one card taxonomy, one button system** — §9/§17, no second implementation of any of these three is ever introduced.
3. **Mechanically checkable rules are preferred over aspirational ones**, per §2 — Invisible Intelligence compliance and subject-identity-table compliance are both directly grep-verifiable, the same audit method `AXT-001` and `AXT-002` §11 already used; this document recommends that check become a standing, repeatable practice (not necessarily automated CI, but a real, repeatable review step) before any Experience Transformation release, not a one-time inventory exercise.
4. **A duplication finding is resolved by consolidation, never by leaving both versions live** — directly operationalising `AXT-002`'s Experience Rule #8 at the design-system level: if two components/pages present the same subject or concept differently, that is treated as a defect in this design system's own application, to be corrected the next time either surface is touched, not a permanent parallel state.

---

No mock-up, wireframe, or implementation code was produced to create this Design System. It governs, alongside `AXT-002_ANGEL_EXPERIENCE_BLUEPRINT.md` and the Educational and Experience Constitutions, every future screen, workflow, and interaction built for Angel Version 2.0.
