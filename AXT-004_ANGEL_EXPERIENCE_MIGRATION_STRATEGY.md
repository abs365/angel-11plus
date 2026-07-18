# AXT-004: Angel Experience Migration Strategy

**Document ID:** AXT-004
**Role:** Chief Experience Architect, Angel Experience Transformation Programme
**Status:** Constitutional migration strategy — governs the sequencing of all future engineering work toward Angel Version 2.0. Not an implementation plan, not a screen redesign, not code, not a mock-up.
**Bound by:** `AEP-001`–`005` (Educational Constitution / Learning Science Constitution), `AIW-001`/`EAW-002`–`005` (Educational Architecture), the Competency Intelligence Platform (`lib/ali/*`), `docs/strategy/ANGEL_EXPERIENCE_MANIFESTO.md` and companions (Experience Constitution), `AXT-001` (Platform Inventory), `AXT-002` (Experience Blueprint), `AXT-003` (Design System V2.0), and two named governing principles:

- **AXT Principle 001 — Every learner interaction must contribute to learning, confidence, or motivation.** A direct operationalisation of the Manifesto's Mission statement and AEP-001's own evidence-first test (§0): if a migration step cannot name which of these three it serves, it does not belong in this strategy.
- **AXT Principle 002 — Reuse Before Rebuild.** The same commitment already named in `AXT-002` §1.2 and `AXT-003` §1, now formally numbered and binding on every decision below.

**Continuity note:** these two principles are not new inventions — they consolidate and formally number what `AXT-002` §1 already established as unnumbered Experience Principles 1–2. This document adopts the numbered form as the canonical citation going forward.

---

## 1. Migration Philosophy

**This is a migration, not a rebuild.** The Competency Intelligence Platform (`lib/ali/*`, all of WP-16 through WP-23), every content bank, and every piece of educational reasoning are frozen and untouched by this strategy — exactly as `APD-033` (Engine Before Experience) already requires. What changes is presentation, connection, and consolidation, never the engine underneath it.

**The governing parallel is this project's own database migration discipline, applied to the experience layer.** Every schema migration in this codebase (001–011) is additive-only, individually reversible or explicitly flagged when not, and never leaves the product in a broken intermediate state. This strategy holds the experience layer to the identical standard: every wave (§6) must leave Angel fully working end-to-end, never a half-migrated state a learner or parent could land in.

**Migration, not replacement, is also true of documentation.** `DESIGN_SYSTEM.md` was not deleted when `ANGEL_DESIGN_LANGUAGE.md` superseded it — it was kept as a historical record. This strategy extends the same discipline to code: retirement means an old surface stops being reachable and stops being maintained, not that its history disappears without a trace (§4).

---

## 2. Transformation Principles

1. **AXT Principle 001 (learning/confidence/motivation)** governs every wave's inclusion test.
2. **AXT Principle 002 (Reuse Before Rebuild)** governs every wave's implementation choice — §3 names exactly what is reused.
3. **Educational Continuity** — a learner's progress, history, XP, streak, and mastery evidence must remain fully readable and correct across every migration step. No wave may require a data reset.
4. **Evidence Before Presentation** (`AXT-003` §12) — no wave may ship a competency-derived visual signal that does not trace to a real Derived State Hierarchy layer (`APD-025`).
5. **One Experience Per Subject** (`AXT-002` Experience Rule #8) is this migration's structural end state, not merely a design preference — every wave that touches a subject with a static/adaptive split moves it measurably closer to this end state, never further from it.
6. **Consolidate, never duplicate further** — no wave may introduce a new parallel implementation of something `AXT-001` already found duplicated.

---

## 3. Reuse Strategy

Per AXT Principle 002, stated concretely — what this migration reuses, unmodified, from `AXT-001`'s inventory and `AXT-003`'s catalogue:

- **The entire Competency Intelligence Platform** (`lib/ali/*`, `types/ali/*`, all WP-16–21A engine components) — reused in full, modified by nothing in this strategy.
- **`ReasoningSession`'s one-component/four-subject pattern** — the direct template for consolidating English/Maths/Vocabulary/Writing's currently-bespoke session logic (`AXT-003` §11).
- **`PageLayout`, `SupportLayout`, `SubjectCard`, `PathwayCard`, `PremiumLoader`** — reused as-is for every new or consolidated surface; no wave introduces a second version of any of these.
- **`PassagePlayer`'s real speech-synthesis + speech-recognition + transcript-comparison mechanism** — reused and extended, never rebuilt, for any Voice Journey expansion (`AXT-003` §14).
- **WP-10's three-audience Explainability model and `computeParentReport()`'s already-built fields** (`durablyMastered`, `recommendationExplanation`, `wellbeingSignal`) — reused as the exact data contract Wave X3 (§6) connects, not a new contract this strategy invents.
- **The existing synthetic-fixture fallback pattern** (every adaptive route already prefers real Supabase rows over its fixture automatically) — reused as the de facto feature-flag mechanism (§7), rather than introducing a new flagging dependency.
- **The migration/rollback discipline already proven for schema changes** (001–011) — reused as the template for §14's experience-layer rollback strategy.

---

## 4. Legacy Retirement Strategy

| Item (`AXT-001` ref) | Retirement action | Continuity protection |
|---|---|---|
| `/mock-test` (§11) | Redirect to `/mocks`, then remove the route. | Zero navigational risk confirmed (no inbound links anywhere), but a redirect — not a hard 404 — protects the rare visitor with a bookmarked or typed-in URL. |
| `/mocks/[pathway]` static sections (§13) | Retired **per pathway, only once** that pathway has equivalent-or-better real ALI-adaptive coverage — not all at once. GL's Verbal Reasoning section is the only one with an adaptive counterpart today; CEM/CSSE/ISEB sections remain live until each has one. | No pathway ever loses its only mock experience — the static version stays live until a genuine replacement exists, per AXT Principle 001. |
| `/mocks/adaptive/gl`'s duplicated `MOCK_CONFIGS` (§13) | Extracted into one shared configuration once both the static and adaptive routes for a pathway are confirmed equivalent, then the static duplicate is deleted. | No behaviour change for any in-progress mock session during the extraction — this is an internal refactor, not a route change. |
| Four single-purpose feedback forms (§28–31) | `/report-bug`, `/feature-request` redirect to `/feedback`'s existing type-selector, extended with two more types. `/beta-family` is **not** retired (different in kind — a structured application, not free-text feedback, per `AXT-001`'s own finding). | Existing bookmarks/support-email links to any of the three redirect correctly; no submitted historical feedback data is altered (same five Supabase tables, migration 008, untouched). |
| `DESIGN_SYSTEM.md` (v2D-A) / `ANGEL_UX_V3_STRATEGY.md` (once fully superseded) | Kept as historical record, never deleted — same precedent already set for the design-language lineage. | N/A — documentation only. |

**No other item in `AXT-001`'s inventory is retired by this strategy.** Every KEEP/UPGRADE item continues operating throughout every wave.

---

## 5. Experience Replacement Order

Sequenced by risk and dependency, not by visual ambition — the lowest-risk, most foundational work first, the least reversible work last:

1. **Consistency foundation** — extend the `ReasoningSession` pattern toward English/Maths/Vocabulary/Writing (`AXT-003` §11), close the two named accessibility gaps (keyboard/focus-ring, unified error states — `AXT-003` §8/§18/§21). *Why first:* every later wave benefits from this consolidation existing, and none of it depends on anything else being done first — it is pure internal risk reduction.
2. **Legacy retirement** — execute §4's table. *Why second:* clears clutter and dead navigation before deeper work touches the surfaces around it, and several items (the feedback-form consolidation) are genuinely independent of everything else.
3. **Competency Intelligence connection** — wire WP-19's recommendation runtime and WP-21A's Wellbeing evaluator into Parent Hub and Progress via `computeParentReport()`'s already-built fields. *Why third, not first:* this is the highest *educational* value step in the entire strategy, but it depends on WP-22's content disposition and WP-23's production migration being resolved first (`ACR-001`'s own outstanding items) — sequencing it before those would mean connecting real reasoning to unapproved or unconfirmed content.
4. **Assessment consolidation** — merge the mock-exam family per §4's phased, per-pathway rule. *Why fourth:* depends on knowing exactly which pathways have real ALI content (an output of step 3), and is the single largest structural change in this strategy — safer once the foundation (1) and the data connection (3) are both stable.
5. **Deep redesign of remaining Tier-1-only surfaces** (English, Maths, Vocabulary, Writing, the four Reasoning subjects, Progress, Parent Hub) using the full Design System V2.0 component catalogue. *Why fifth:* the least reversible, highest-cost-per-mistake work in the whole strategy — it should happen once the data it presents (step 3) and the structure it's built on (steps 1–2) are both settled, not before.
6. **Voice Journey expansion** — extend `PassagePlayer`'s real mechanism to Vocabulary and the Reasoning subjects. *Why last:* genuinely new capability extension, not consolidation or connection — and per `AXT-002` §7, the broader "voice-first learning" claim still lacks an Evidence Strength rating, so this is deliberately sequenced after the higher-confidence work, not blocking it.

---

## 6. Release Waves

| Wave | Contains | Entry gate | Exit gate |
|---|---|---|---|
| **X1 — Consistency Foundation** | Replacement Order item 1 | None — can start immediately | `tsc`/build clean; keyboard/focus-ring standard defined and verified; one unified error-state pattern in place |
| **X2 — Legacy Retirement** | Replacement Order item 2 | Independent of X1 | §4's table fully executed; zero orphaned routes remain (re-verified by the same `href` search method `AXT-001` used) |
| **X3 — Competency Connection** | Replacement Order item 3 | WP-22 content disposition approved for production; WP-23's production-state diagnostic resolved (`ACR-001` outstanding item 5) | Parent Hub and Progress render real `recommendationExplanation`/`wellbeingSignal` values, or an honest "not yet available" state — never a placeholder presented as real (§9) |
| **X4 — Assessment Consolidation** | Replacement Order item 4 | X3 complete (need to know real content coverage per pathway) | One mock-exam entry point per pathway; §4's per-pathway retirement rule satisfied for every pathway with adaptive coverage |
| **X5 — Deep Redesign** | Replacement Order item 5 | X1, X2, X3 complete | Every `AXT-001` UPGRADE item has received full Design System V2.0 treatment; Founder Acceptance Gate passed per surface (§10) |
| **X6 — Voice Expansion** | Replacement Order item 6 | X5 complete for the subjects being extended | Feature-detection-safe degradation verified on the new surface, exactly as `PassagePlayer` already does |

Waves are sequential in dependency but need not be sequential in calendar time where no dependency exists (e.g., X2 can run alongside X1).

---

## 7. Feature Flag Strategy

**No new feature-flag library or service is introduced — none exists in this codebase today, and Reuse Before Rebuild (AXT Principle 002) applies to tooling, not only components.** This strategy reuses the existing, already-proven pattern: every adaptive route already prefers real Supabase content over its synthetic fixture automatically, with no code branch a deploy needs to flip — content presence *is* the flag.

**Where flagging is appropriate, extending this same pattern:**
- **Wave X4's consolidated mock experience** — the old and new pathway mock routes may coexist during consolidation, gated by whether that pathway's real content coverage meets the retirement bar (§4's table), not by a user-facing toggle.
- **Wave X3's Parent Hub/Progress connection** — `recommendationExplanation`/`wellbeingSignal` render once real data exists for a given learner, and show an honest pending state otherwise (§9) — again, data-presence-gated, not user-preference-gated.

**Where flagging is not appropriate:** Wave X2's retirements (§4) have no ambiguous state to gate — a redirect either exists or it doesn't.

---

## 8. Backward Compatibility Rules

1. **Every existing URL keeps working or receives a permanent redirect** — restating `ANGEL_UX_V3_STRATEGY.md`'s own rule ("No route is removed... only how users arrive at and experience those routes... changes") as binding for Version 2.0 as well, with §4's retirement table as the only named exceptions, all handled via redirect.
2. **`UserProgress` (localStorage-backed) must remain readable across every wave.** No wave introduces a breaking shape change to this type without an additive migration path, mirroring the same nullable-then-backfilled discipline this project's own SQL migrations already use (e.g., migration 007's `learning_unit_id` pattern).
3. **A learner mid-session during any deploy must never lose in-progress work.** This is already true of the current architecture (client-side session state, periodic persistence) and is a binding constraint on every future wave, not merely a current property to preserve accidentally.
4. **A parent-facing metric's meaning must never change silently.** If a future wave changes how "Exam Readiness %" or any other Parent Hub figure is computed, that change must be classified as a Defect or a Refinement per the existing `APD-024`/`APD-026` process (`ARCHITECTURAL_REFINEMENT_REGISTER.md`) — the same discipline already governing engine-side changes, now extended to experience-facing computed values.

---

## 9. Educational Verification Gates

Before any wave ships, verify, in this order:
1. **Evidence Dominance / Explainability Purity held** (`AXT-003` §12) — no new UI element invents a competency signal not traceable to a real Derived State Hierarchy layer.
2. **AEP-001 §4's prohibitions not violated** by any new copy or mechanic (no growth-mindset slogans, no loss-aversion, no bare scores, no unscaffolded self-regulation, no anxiety-crossing difficulty).
3. **Invisible Intelligence compliance, grep-verified** — zero instances of ALI internal vocabulary in any new or changed learner/parent-facing string (`AXT-002` §11's own auditable method).
4. **The three-audience Explainability boundary held** — no fourth audience invented anywhere in the wave's output.
5. **The existing `npx tsx` scenario-script / `tsc --noEmit` / `npm run build` discipline** applies to every wave exactly as it has to every engine work package in this programme — extended, for experience work specifically, with the grep-based constitutional checks in items 2–4 above as a mandatory additional step, not a replacement for the existing technical checks.

---

## 10. Founder Acceptance Gates

**Every wave in §6 requires explicit Founder sign-off before the next wave begins** — this is not a new mechanism; it is the exact governance pattern this entire programme has used from AEP-001 through WP-23 (a Programme Decision, a report, "stop for independent assurance"), formally extended to the Experience Transformation Programme's waves. No wave's exit gate (§6) is self-certified by whoever implements it.

---

## 11. Accessibility Verification

Mandatory per-wave checklist, reusing `AXT-003` §8/§21 directly:
- `dark:` pairing present on every new or touched element.
- 44×44px touch targets maintained.
- Colour never the sole signal of status.
- `prefers-reduced-motion` respected (already automatic; verify no wave overrides it).
- Any new voice-interaction surface (Wave X6) follows `PassagePlayer`'s exact feature-detection-then-degrade pattern.
- **Wave X1 specifically must close the two gaps `AXT-003` named rather than resolved** — a keyboard-only navigation/focus-ring standard, and one unified error-state pattern. These are not deferred indefinitely; they are this migration's first wave's exit criteria.

---

## 12. Performance Verification

- `npm run build` clean, zero regressions, at the end of every wave — the same standing bar this programme has held since `IWP-001`.
- Route count and bundle size tracked wave-over-wave; a consolidation wave (X2, X4) should measurably *reduce* route count, not merely hold it flat — a directly falsifiable check that consolidation is real, not nominal.
- The existing PWA/offline shell (`public/manifest.json`, `public/sw.js`, `public/offline.html`) must remain fully functional through every wave — confirmed working today (`ANGEL_PROJECT_CLOSURE_REPORT.md` Part 2) and not a capability this migration is permitted to regress.

---

## 13. Risk Register

| Risk | Likelihood/Impact | Mitigation |
|---|---|---|
| **Custody risk carries into this migration too** — `ACR-001` found 35 unpushed commits and 11 uncommitted constitutional documents. If unresolved, this migration would be built on a foundation that could vanish. | Medium likelihood, high impact | Resolve `ACR-001`'s recommended sequence (commit/push everything) before Wave X1 begins, not concurrently with it. |
| **Production migration state is genuinely unknown** (`WP-23`) | Medium likelihood, high impact on Wave X3/X4 specifically | Wave X3's entry gate explicitly requires this resolved first (§6) — not assumed, not worked around. |
| **Premature removal of the synthetic-content banner** on a route whose real content isn't actually live yet, mistaking "looks finished" for "is finished" (a risk this project's own closure report already named) | Low likelihood if §9's gates are followed, high impact if not | The banner is treated as a Trust and Safety Indicator (`AXT-003` §23) that only comes down when real content is confirmed live, verified per §9, never on a visual-polish timeline alone. |
| **Static/adaptive parallel experience causing learner confusion if a consolidation wave stalls partway** | Medium likelihood, medium impact | §4's per-pathway retirement rule is explicit about staying in the "both live" state being acceptable and stable indefinitely if needed — never a half-migrated single experience. |
| **Voice feature degrading silently (not gracefully) on an unsupported browser** if a future surface doesn't follow `PassagePlayer`'s exact feature-detection pattern | Low likelihood if §11 is followed | Wave X6's exit gate explicitly re-verifies the feature-detection pattern per new surface, not assumed inherited. |
| **Founder-approval bottleneck** — this programme's own gate-heavy governance style (§10) is deliberately protective but could stall a wave awaiting review | Medium likelihood, low-medium impact | Waves are kept intentionally small and independently shippable (§6) specifically to reduce the cost of any single gate taking time. |

---

## 14. Rollback Strategy

**Because this migration is presentation-layer only (Migration Philosophy, §1), rollback is simple by construction: revert the deployed frontend to its prior commit.** No wave in this strategy requires its own database schema change — if a future wave ever appeared to need one, that would be a scope violation of Engine Before Experience requiring it be split into a separate, engine-side work package first, not folded into an experience wave.

- **Feature-flagged waves (§7) roll back by the data/content condition reverting**, not by a deploy — e.g., if Wave X4's consolidated mock experience needs to roll back for a given pathway, that pathway's static route simply continues being the one users see, since it was never removed until the retirement bar was met (§4).
- **Wave X2's redirects roll back trivially** — removing a redirect and restoring the original route, since nothing about the original route's code is deleted until well after the redirect has proven safe.
- **No wave's rollback ever requires restoring learner data** — Educational Continuity (§2.3) guarantees no wave alters `UserProgress`'s meaning without an additive migration path, so a frontend revert alone is always sufficient.

---

## 15. Success Criteria

Reuses `AXT-002` §11's Experience Success Measures directly as this migration's actual exit bar, not a separate metric set:
1. Five-beat Learning Journey completion rate.
2. Invisible Intelligence compliance (zero ALI vocabulary in user-facing strings, grep-verified).
3. Mid-session abandonment as the anxiety-ceiling proxy.
4. **Consolidation trend, directly measurable via this strategy's own waves:** number of parallel implementations per subject/assessment-family trending to one, confirmed by the route-count check in §12.
5. Time-to-first-action per screen.
6. Parent-comprehension proxy (support-contact rate referencing "what does this mean").

---

## 16. Definition of Completion for Version 2.0

Version 2.0 is complete when **all** of the following hold, verified, not asserted:

1. Every `AXT-001` UPGRADE item has received Design System V2.0 treatment (Wave X5 exit gate).
2. Every `AXT-001` MERGE item is consolidated to one experience (Waves X2/X4 exit gates) — the mock-exam family is one pathway-aware entry point per pathway, and the feedback-form family is one typed surface.
3. Every `AXT-001` RETIRE item is gone or permanently redirected (Wave X2 exit gate).
4. The Competency Intelligence Platform's real reasoning (Recommendation Orchestration, Wellbeing) is genuinely connected to Parent Hub and Progress — not merely typed and ready (Wave X3 exit gate).
5. A final Invisible Intelligence and three-audience-boundary audit finds zero exceptions across the entire product, not just the surfaces this migration directly touched.
6. `ACR-001`'s five outstanding constitutional-custody items are confirmed closed (a prerequisite this strategy depends on, not a Version 2.0 deliverable in itself, but a condition that must hold by completion).
7. Every Founder Acceptance Gate (§10) across all six waves has been passed, on the record.

Only once every item above is independently verified — not scheduled, not "mostly done" — is Angel Version 2.0 complete.

---

No screen was redesigned, no mock-up was produced, and no implementation code was written to produce this migration strategy. It governs the sequencing of all engineering work leading to Angel Version 2.0.
