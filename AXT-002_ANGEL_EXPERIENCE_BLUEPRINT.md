# AXT-002: Angel Experience Blueprint

**Document ID:** AXT-002
**Role:** Chief Experience Architect, Angel Experience Transformation Programme
**Status:** Constitutional — governs all future UX, UI, and implementation work, alongside the documents it draws from. Not a wireframe, not a mock-up, not implementation code. No screen is redesigned by this document.
**Builds on:** `AXT-001_ANGEL_PLATFORM_INVENTORY.md` (what exists today), `AEP-001_LEARNING_SCIENCE_CONSTITUTION.md` through `AEP-005` (why it should work), `docs/strategy/ANGEL_EXPERIENCE_MANIFESTO.md`, `ANGEL_MOMENTUM_FRAMEWORK.md`, `ANGEL_PRODUCT_PHILOSOPHY_UPDATE.md` (how it should feel), and the Competency Intelligence Platform's own real, engine-verified architecture (`lib/ali/*`, `types/ali/*`, `IWP-002_ENGINE_INTEGRATION_PROGRAMME.md`'s WP-16 through WP-23).

**How to use this document:** every future UX, UI, or implementation decision must be able to answer *"which principle in this Blueprint does this satisfy, and which existing capability does it reuse rather than reinvent?"* If a future decision conflicts with this Blueprint, the Blueprint wins — the same standing this project already grants the Manifesto and AEP-001. If this Blueprint appears to conflict with either of those two documents, that is a defect in this Blueprint, not a licence to override them; AEP-001 and the Manifesto are constitutional, this document is their operating model.

---

## 1. Experience Principles

1. **The engine stays invisible; the education stays visible.** Restates the Manifesto's Invisible Intelligence doctrine and its permanent companion, Respect Familiar Educational Language, as the first governing principle of this Blueprint — not a UI rule alone, an *architectural* one: every future experience decision must be checkable against `ANGEL_UX_V3_STRATEGY.md` §3's own name-substitution table before it ships.
2. **Reuse before invention.** `AXT-001`'s inventory found real, working, reusable components at every layer this platform needs — `ReasoningSession` (one component, four subjects), `SubjectCard`/`PathwayCard`/`SupportLayout` (shared across a dozen+ routes), `PremiumLoader` (one loading language for the whole product), `PassagePlayer` (a real, shipped Voice Reading capability). A new bespoke component is a last resort, not a default.
3. **Engine Before Experience remains true going forward, not only during IWP-002.** The Competency Intelligence Platform's real reasoning (Confidence, Mastery, Durable Mastery, Educational State, Recommendation Orchestration, Explainability, Wellbeing) is built, tested, and verified — but deliberately not yet wired into any learner-facing surface (`AXT-001` §14–17). This Blueprint's job is to define how that engine *should* surface once connected, not to connect it. Every journey section below is written against the real engine that exists, not a hypothetical future one.
4. **One experience per subject, not a static one and an adaptive one running in parallel.** `AXT-001`'s duplication findings (the mock-exam family, the static/adaptive subject split) are treated here as a standing architectural principle, not a one-time cleanup: once real ALI content exists for a subject, that subject has exactly one practice experience, adaptive by default, never two parallel, separately-branded implementations of the same retrieval-practice mechanic.
5. **Nothing ships that cannot cite an Evidence Strength rating.** AEP-001 §4's own prohibition ("no claim... without an Evidence Strength rating") is extended here to experience decisions, not only pedagogical ones: a design choice justified by "this is how premium apps feel" is a legitimate Manifesto-level judgement; a design choice claimed to *improve learning* must trace to an AEP-001 principle or be honestly flagged as untested (see §7).
6. **Honesty about gaps is a feature, not a delay tactic.** Where the engine is real but not yet connected (Recommendation Orchestration, Wellbeing), or where content is real but not yet approved for production (WP-22's 112 questions), the experience must say so plainly rather than simulate completeness — directly extending the Manifesto's own "a synthetic-content banner... builds more trust... than a polished façade" principle.

---

## 2. Navigation Philosophy

**Governing rule, generalised from `ANGEL_NAVIGATION_ARCHITECTURE.md` §1's own finding:** navigation groups by the learner's or parent's *mental model of an activity*, never by the count of underlying features or routes. Four reasoning disciplines became one Reasoning Hub because a child thinks "I want to do some reasoning," not "I want `non-verbal-reasoning`" — this is the test every future navigation decision must pass, not a one-time fix already applied.

**Applying this rule forward, not just describing it:** `AXT-001`'s mock-exam duplication finding is, under this same rule, a navigation-philosophy violation waiting to be corrected — a learner or parent currently has no single mental model of "practice/assessment" mapped onto exactly one entry point the way Reasoning already has one. The Blueprint's instruction to the eventual implementation phase: collapse the mock-exam family into the same single-hub pattern Reasoning already proves works, once `/mocks/[pathway]` and the adaptive mocks are consolidated (`AXT-001` §13, MERGE).

**Three permanent structural rules, extending what `Navigation.tsx` already does correctly:**
- **Parent/Family navigation is always visually separated from student learning items**, never interleaved — already true, keep true.
- **Support/utility items are always last, always de-emphasised** — already true, keep true.
- **Administrator surfaces never share navigation or branding with learner/parent surfaces** — already true (`/admin-beta` has no nav entry at all); this is correct and should remain a hard rule, not an oversight to fix (see §5).

---

## 3. Learner Journey

**The Manifesto's five-beat Learning Journey (Beginning → Journey → Success → Reflection → Tomorrow) is the structural contract, not a suggestion.** This Blueprint promotes it from stated philosophy to a checkable requirement: **any future learner-facing surface must be able to name its own Beginning, Journey, Success, Reflection, and Tomorrow beats before it ships**, exactly as the Manifesto already states — "a feature that skips any one of these five beats... is an incomplete experience, even if every individual screen inside it is well designed."

**What "Journey" (the middle beat) means once the Competency Intelligence Platform is connected:** today, "one question, one passage, one word... deliberately chosen" (Manifesto) is true only inside the four adaptive mocks (`AXT-001` §14–17); every static subject route still selects content from a fixed local bank, not real evidence. The Learner Journey's *future* state — not a redesign, a connection — is that "deliberately chosen" becomes true everywhere a subject has real ALI content, via the same `orchestrateRecommendations()`/`recommendationRuntime.ts` pipeline WP-19 already built and verified (`AXT-001` §14–17's ALI relationship notes). Until then, a static route must not *claim* adaptivity it doesn't have — honesty about gaps (§1.6) applies here directly.

**Reuse:** `ReasoningSession`'s single-component-four-subjects pattern is the template every other subject's Journey beat should eventually converge toward, per §1.4 and §2's consolidation direction.

---

## 4. Parent Journey

**The Manifesto's three time-horizons (one day / one week / one month) remain the governing structure.** This Blueprint's contribution is naming what already exists to satisfy them, so the Experience Transformation Programme builds *connections*, not new backend capability:

- **`computeParentReport()` (`lib/parentInsights.ts`) already carries `durablyMastered`, `recommendationExplanation`, and `wellbeingSignal` fields (WP-12)** — the exact structured data the one-week and one-month horizons need. `recommendationExplanation` is designed to be populated by WP-10's Explainability layer's **parent audience** output specifically (never the learner or engineering-audit phrasing — see §6) once Recommendation Orchestration is connected (WP-19, `AXT-001` §20).
- **`wellbeingSignal` is real in type, not yet real in value** — WP-21A's actual evaluator (`computeWellbeingSignal()`) exists, is tested, and is audited, but is not yet called from anything the Parent Hub reads. The Parent Journey's honest, near-term promise to a parent is therefore: a real Exam Readiness and subject-breakdown signal today, with a wellbeing signal specifically flagged as pending connection — never simulated in the meantime.
- **The Parent Journey must never show what §6 (Competency Journey) forbids** — no competency code, confidence tier, or mechanism name, ever, regardless of how much clarity a founder might feel it would add. Clarity is achieved through the *plain-language* translation WP-10 already builds, not through additional technical transparency.

---

## 5. Administrator Journey

Administrator experience is deliberately **not** subject to the premium/emotional-design treatment the learner and parent journeys receive — this is a principle, not a gap. `/admin-beta` (`AXT-001` §21) is real, correctly auth-gated (Supabase Auth + `is_current_user_admin()`, migration 008), and appropriately utilitarian.

**Governing rules for any future administrator surface** (e.g., a real UI for WP-22-style content disposition, or a founder-facing operational dashboard):
1. **Reuse the migration-008 real-auth pattern exactly** — Supabase Auth, server-enforced role check, RLS as the actual security boundary, never a client-side gate. No second admin-access pattern should ever be invented alongside it.
2. **Never share navigation, branding, or the Invisible Intelligence rule with learner/parent surfaces.** An administrator is the one audience allowed to see ALI's real internal vocabulary (competency codes, confidence tiers, mechanism names) — this is the mirror image of §6's learner/parent restriction, not an inconsistency.
3. **Administrator surfaces exist to make a real, human governance decision** (content approval, disposition, override) **— never to automate one.** This directly extends this programme's own standing principle (Programme Decision APD-035, Independent Educational Approval) that content approval cannot be self-approved: any future admin UI for this purpose must present evidence for a human to judge, not a pre-computed verdict to rubber-stamp.

---

## 6. Competency Journey

This section describes how the Competency Intelligence Platform's real reasoning is allowed to reach a human being — the one place in this Blueprint where "Competency Intelligence Platform" (ALI) is named directly, for engineering traceability only, never for anything a learner or parent sees.

**The three-audience model (WP-10, `lib/ali/explainability.ts`) is the permanent, exhaustive boundary.** Every piece of competency-level reasoning this platform ever produces reaches a human through exactly one of three channels — **learner** (plain, encouraging, state-driven only, never a tier or code), **parent** (plain-language, confidence-calibrated, never a mechanism name), or **engineering-audit** (full structured data, for internal/administrator use only, per §5). **No fourth audience may ever be invented** by a future feature under time pressure — a "slightly more technical parent view" or a "curious kid's advanced mode" would both violate this boundary, regardless of how well-intentioned.

**The Derived State Hierarchy (APD-025) is the Competency Journey's spine:** Question Attempts → Confidence → Mastery → Validated Mastery → Durable Mastery → Educational State → Recommendation. Every experience surface that shows *any* competency-derived signal must be able to trace it to a real layer in this chain — never a value invented for a smoother-feeling UI (e.g., a progress bar that moves for encouragement alone, unconnected to real evidence, would violate Evidence Dominance, APD-027, at the experience layer, not just the engine layer).

**Tier 0 (Wellbeing) is a hard ceiling on the Competency Journey, not a feature inside it.** Per WP-21A/APD-042/044, no recommendation may ever reach a learner or parent if Tier 0 has vetoed it — this is not a design choice the Experience Transformation Programme can trade off for a punchier Daily Mission; it is inherited, unmodified, from the engine's own constitution.

**What is real today vs. pending connection (honesty, §1.6):** Confidence, Mastery, Durable Mastery, Educational State, and Recommendation Orchestration (including Wellbeing) are all real, tested, verified components (`IWP-002` WP-16–21A). None is yet called from a learner- or parent-facing route except partially inside the four adaptive mocks. The Competency Journey's implementation mandate is connection, per §1.3 — not new engine design.

---

## 7. Voice Learning Journey

**Voice is a modality, not a new pedagogy.** Every voice-first capability this Blueprint recommends must implement an *existing* AEP-001 principle (retrieval practice, feedback specificity, worked examples) through a different input/output channel — never a new, separately-justified learning theory. A voice feature that cannot name which AEP-001 principle it implements has not yet earned a place in this journey.

**Honesty required by this Blueprint's own §1.5, stated plainly:** no document in this programme — not AEP-001, not any AEP-002–005 document — carries an Evidence Strength rating for voice-based instruction specifically. This is a real, named gap, not a discovered defect: voice-first work should proceed as a genuine product/accessibility improvement (reducing reading-load friction, matching how younger children in the 8–11 band often prefer to engage), but must not be marketed or internally justified as "evidence-based learning science" until a future AEP-001 amendment explicitly rates it, per §0's own standing test ("what evidence says this improves this child's chance of success").

**Reuse, per `AXT-001`'s own findings:**
- **`components/PassagePlayer.tsx`** is real, shipped, dark-mode-complete Voice Reading for English Comprehension today — the foundation, not a green-field build.
- **`ReasoningSession`'s single-component/four-subject pattern** is architecturally the best next candidate: one voice capability added once would reach Verbal, Non-Verbal, Spatial, and Numerical Reasoning simultaneously.
- **Vocabulary's flashcard front/revealed pattern** is a natural, low-risk "hear it, recall it" candidate, since it already separates presentation from recall.

**Invisible Intelligence applies to voice exactly as it applies to everything else:** a voice interface must never expose its own mechanism ("Listening...", "Processing your answer...") — it should read as a natural extension of the same guidance-not-monitoring feeling the Manifesto already demands, following `ANGEL_LOADING_EXPERIENCE.md`'s existing precedent that a waiting moment is a product moment, not a status log.

**Voice is additive, never a forced replacement.** A learner or parent must always be able to opt out of voice entirely and use the platform exactly as it works today — this is not a transitional caveat, it is permanent, per the Manifesto's "nothing ships that a child can't fully enjoy."

---

## 8. Emotional Journey

**The Manifesto's Emotional Design section is the governing standard, restated as three permanent targets, unchanged:** children feel **capable**; parents feel **reassured**; founders feel **proud without needing to explain**. This Blueprint adds one enforcement mechanism: **AEP-001 §2.9/§2.10's anxiety ceiling is the hard limit every emotional-design decision must be checked against**, exactly as AEP-001 itself already states — no feature justified by "this will make the product feel more exciting/urgent/competitive" may ship without confirming it does not cross from productive challenge into measurable anxiety.

**Effort-specific feedback (AEP-001 §2.5), not growth-mindset messaging (§2.6), is the correct mechanism for the "capable" feeling** — the Manifesto's "celebrate effort, not only achievement" principle is retained, but any future emotional-design work must ground new copy or moments in feedback-specificity evidence, never in generic mindset-change slogans AEP-001 explicitly found unsupported.

---

## 9. Experience Rules

A consolidated, checkable rule set — every future feature or screen must pass all of these, the same way AEP-001 §4's prohibitions and `ANGEL_UX_V3_STRATEGY.md` §3's language table already work:

1. No ALI internal vocabulary (adaptive, competency, learning unit, intelligence, recommendation engine, mastery, confidence tier) ever reaches a learner or parent surface (§6).
2. Every screen answers "what should I do next?" (Manifesto, restated as a build gate, not an aspiration).
3. Every learner-facing feature satisfies all five Learning Journey beats (§3) before shipping.
4. No loss-aversion or streak-shaming mechanic, ever (Manifesto/`ANGEL_MOMENTUM_FRAMEWORK.md`, AEP-001 §2.7).
5. No bare score without a named, specific competency or skill (AEP-001 §2.5).
6. Explanatory content only ever uses one of the three defined audiences — never a fourth (§6).
7. No competency-derived signal is shown unless it traces to a real layer in the Derived State Hierarchy (§6, APD-025/027).
8. A subject with real, approved ALI content has exactly one practice experience, not a static and an adaptive one running in parallel (§1.4, §3).
9. One navigation entry point per activity family, grouped by mental model, not feature count (§2).
10. Voice features are additive and optional, never a forced replacement (§7).
11. Administrator surfaces never share navigation, branding, or the Invisible Intelligence restriction with learner/parent surfaces (§5).
12. Nothing ships claiming an educational benefit without an Evidence Strength rating or an honest "not yet rated" flag (§1.5, §7).

---

## 10. Screen Behaviour Principles

These describe how *any* screen must behave — not a specific screen's layout:

- **Loading is always a product moment, never a status log** — every loading state reuses `PremiumLoader`'s existing pattern (`ANGEL_LOADING_EXPERIENCE.md`); no future feature introduces a second loading-copy convention.
- **Every tappable action gives immediate, honest visual confirmation** — the existing motion rules (`ANGEL_DESIGN_LANGUAGE.md` §6: press-scale, hover-lift, transition timing) are binding on all future screens, not just the ones already built with them.
- **Empty states always name the encouraging next action, never the absence of data as a fact** (`ANGEL_DESIGN_LANGUAGE.md` §8) — this is a permanent rule, not a one-time copy pass.
- **Error and failure states never expose technical detail to a learner or parent** — this mirrors the engine's own established discipline (every `lib/ali/*` persistence adapter fails by `console.warn` + a safe fallback, never a thrown error a user could see); the experience layer must apply the identical discipline outward-facing.
- **No screen requires a tutorial to be understood** (Manifesto: "a feature that requires a tutorial has already lost") — if a future screen cannot be summarised in one sentence of what it does, it is not ready to ship, regardless of how complete its underlying capability is.
- **A synthetic-content or not-yet-connected state is always disclosed, never disguised** (§1.6) — extending the existing synthetic-fixture banner precedent to every future partially-connected feature, not only the four adaptive mocks that use it today.

---

## 11. Experience Success Measures

Per `IWP-001_IMPLEMENTATION_COMPLETION_REPORT.md` §9's own standing rejection of volume-based vanity metrics, and the Manifesto's "judged by the worst moment, not the best": success is measured by fidelity to this Blueprint, not by raw engagement volume.

1. **Five-beat completion rate** — proportion of learner sessions that genuinely complete all five Learning Journey beats (§3), not just "session started."
2. **Invisible Intelligence compliance, mechanically auditable** — zero instances of ALI internal vocabulary in any learner/parent-facing string, checkable by the same kind of direct grep this programme has already used repeatedly (`AXT-001`'s own method) — a real, cheap, automatable regression check, not a subjective review.
3. **Anxiety-safe proxy: mid-session abandonment, not just completion rate.** A rising abandonment rate is a more honest signal of a crossed anxiety ceiling (AEP-001 §2.9) than a falling completion rate alone.
4. **Consolidation trend** — the number of parallel static/adaptive implementations per subject (§1.4) should trend toward one, not stay flat; this is a directly countable, falsifiable measure of whether §1.4/§9.8 are actually being honoured over time.
5. **Time-to-first-action** — how quickly a learner or parent reaches their next real action on any screen, operationalising the Manifesto's "one clear next action" principle as something measurable, not just felt.
6. **Parent-comprehension proxy** — whether a parent-facing explanation ever needs a follow-up support contact (`/feedback`, `/contact`) asking "what does this mean" — a rising rate here is a signal the three-audience boundary (§6) is leaking complexity, even if no internal vocabulary literally appears.
7. **Voice Learning adoption is measured only after §7's evidence-rating gap is closed** — measuring adoption of an unrated capability risks mistaking novelty appeal for genuine educational benefit, exactly the mistake AEP-001 §0 exists to prevent.

---

No screen was redesigned, no wireframe or mock-up was produced, and no implementation code was written to produce this Blueprint. It is delivered as the governing operating model for all future UX, UI, and implementation work in the Angel Experience Transformation Programme.
