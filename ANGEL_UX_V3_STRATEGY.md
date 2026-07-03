# Angel UX V3 — Premium Product Experience Strategy

**Status:** Approved, in implementation. Supersedes `UX_TRANSFORMATION_PLAN.md`'s phase numbering (2D-A/2D-B/2E/3) as the current design direction — that document's engagement/retention goals stand, but its phase framing is retired in favour of the model below.

**What triggered this phase:** the product has grown from a single-subject exam-prep app into a 4-subject adaptive learning platform (ALI Foundation, `ALI_VERSION.md`) plus a hardened beta operations layer (`ENTERPRISE_BETA_READINESS_REPORT.md`). The UI has not caught up to that growth — it still reads, in places, as a list of features added over time rather than one designed product. This phase closes that gap.

---

## 1. Core Principle

A parent's first reaction should be **"this feels premium."** A child's first reaction should be **"this app knows exactly what I should do next."** Neither should ever think **"this feels like features stitched together."**

Everything in this phase is judged against those three sentences, not against a checklist of pages touched.

## 2. What does NOT change

Per explicit instruction, this is a presentation-layer transformation, not a platform change:

- **No new educational features, no new ALI subjects, no changes to the ALI engine.** `lib/ali/*`, `types/ali/*`, the 4 adaptive routes' selection/mastery/scoring logic, and every migration are untouched. This phase only changes how that intelligence is *named* and *presented*, never how it *works*.
- **Parent Hub and its data are preserved exactly** — same routes, same Supabase-backed data (feedback/bugs/features/testimonials/beta applications), same admin security model from Phase 5A. Only its position in the navigation and its visual language change.
- **No route is removed.** Every existing URL keeps working — this is about *how users arrive at and experience* those routes, not about deleting them.

## 3. ALI Becomes Invisible

The single biggest conceptual shift this phase makes: **internal architecture names never reach the user.** "Adaptive Mock," "Learning Unit," "Competency," "Intelligence Layer," "Recommendation Engine" are `lib/ali/*` and documentation vocabulary — real, permanent, and unchanged internally (`ALI_OPERATIONS_MANUAL.md` still uses them, because that's the correct audience for that language). They must **never** appear in a route's rendered UI.

| Internal name (stays internal) | What the user sees instead |
|---|---|
| Adaptive Mock / "Adaptive · Beta" chip | Practice, Recommended Practice |
| Learning Unit | (invisible — a passage/word is just "your passage" / "your word") |
| Competency | (invisible — surfaces only as "what to practise next," never a labelled concept) |
| Intelligence Layer / ALI | (invisible entirely) |
| Recommendation Engine | "Recommended for you" |
| "Choosing your passage…" / "Choosing your word…" / "Building your adaptive practice session…" | See `ANGEL_LOADING_EXPERIENCE.md` — premium, encouraging copy |

The test for every string of user-facing copy written or reviewed this phase: **would a parent who has never heard of "ALI" understand it immediately, and would it sound like a product decision rather than an engineering status update?**

## 4. Scope of implementation (this phase, concretely)

Given "redesign the entire product experience" is the ambition but a single phase cannot re-litigate all ~35 routes to the same depth without sacrificing quality, this phase applies the transformation in two tiers, both real and both shipped:

**Tier 1 — systemic changes, which by construction touch every page:**
- Navigation architecture (`ANGEL_NAVIGATION_ARCHITECTURE.md`) — every page inherits the new nav.
- Design language tokens (`ANGEL_DESIGN_LANGUAGE.md`) — colour/icon/card corrections applied where they were previously inconsistent (Navigation vs. Parent Hub reasoning icons; adaptive Maths/Vocabulary routes' colours).
- ALI-invisible language — every user-facing string across all 4 adaptive routes and the Mocks hub.
- Loading experience (`ANGEL_LOADING_EXPERIENCE.md`) — one shared, premium loading component replacing every developer-placeholder loading string in the app.

**Tier 2 — deep redesign of the highest-leverage surfaces**, where a parent or child actually forms their "is this premium?" impression in the first 30 seconds:
- Dashboard (the product's centre, per the brief).
- The Reasoning navigation experience (collapsed into one coherent hub rather than four peer entries).
- The Mocks / Practice hub (where ALI's four subjects are actually chosen from).
- The four adaptive practice routes themselves.

Every other route (support pages, static subject pages, Parent Hub's internal sections) receives the Tier 1 systemic corrections but is not rebuilt page-by-page in this phase. This is a scope decision made explicitly, not a silent shortfall — `ANGEL_DESIGN_LANGUAGE.md` is written so that extending Tier 2's treatment to any remaining page later is a mechanical application of an already-defined system, not a fresh design exercise.

## 5. Benchmark

Every Tier 2 surface is reviewed against the question: **"Would Apple ship this? Would Duolingo be proud of this? Would Brilliant accept this interaction?"** — not against other 11+ exam-prep products. Concretely, this means: generous white space over dense information, one clear next action over a menu of options, motion that confirms an action rather than decorates it, and copy that speaks to the student's goal ("what should I do next") rather than the system's mechanism ("here is a list of the six things you could do").

## 6. Success criteria

- A parent seeing the dashboard for the first time understands, without reading a paragraph, what today's plan is.
- A child never encounters the word "adaptive," "competency," or "learning unit" anywhere in the product.
- The navigation fits comfortably without needing to scroll on a standard laptop screen, and Reasoning's four subjects no longer read as four independent, equally-weighted top-level destinations.
- Every loading state a user can encounter reads as a considered product moment, not a console.log left in by mistake.
- `npm run build` is clean, zero routes regress, ALI and Parent Hub are functionally identical to before this phase — only their presentation changed.
