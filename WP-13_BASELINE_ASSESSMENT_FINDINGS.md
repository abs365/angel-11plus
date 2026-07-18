# WP-13: Baseline Assessment — Findings and Design

**Status:** Confirmation + design complete. Full build explicitly scoped out and recommended as its own future work package — see §4.

---

## 1. Confirmed absence (code-level evidence, not assumed)

`AEP-004_LEARNING_JOURNEY_FRAMEWORK.md` §4 flagged this as an "apparent gap... would require checking `app/dashboard/page.tsx` and the onboarding flow directly, which is implementation verification... out of scope for this Discovery Wave document." That verification has now been performed:

- **`app/page.tsx`** (the actual root URL) does nothing but `redirect("/dashboard")` — no first-run branch, no diagnostic step.
- **`app/getting-started/page.tsx`** is a static, passive parent-facing explainer (5 read-only steps: choose pathway, daily practice, track progress, mock exams, reading practice) — not an interactive assessment of any kind, diagnostic or otherwise.
- A repository-wide search for "diagnostic" or "baseline" (case-insensitive) across `app/`, `lib/`, `components/` returns **zero matches** outside this Implementation Programme's own new WP-05 doc comments.

**Confirmed: no baseline/diagnostic assessment exists anywhere in the codebase.** A new learner proceeds directly from pathway selection (`/pathways`, confirmed to exist and store `selectedPathwayId` — see WP-04) into the dashboard with no captured starting signal beyond that pathway choice.

---

## 2. Why this matters (restating AEP-004 §4/AEP-005 §2, now grounded in confirmed fact rather than a flagged possibility)

Every competency confidence band (AEP-002 §7, WP-05's Confidence Processing) starts at "insufficient" for a brand-new learner, and every Educational State (`EAW-004` §3) starts at "Exploring" by default — this is correct and honest, not a defect. But it means Angel's very first recommendations to a new learner are necessarily generic rather than informed by anything specific to that child, for as long as it takes organic practice to accumulate evidence. A short, low-stakes baseline would seed that evidence sooner, without ever producing a "scored verdict."

---

## 3. Design (grounded in AEP-004 §4 and AEP-005 §2, made concrete)

- **Format:** a short (8–12 question) session sampling lightly across the domains the learner's *selected pathway* actually tests (reusing WP-04's `getEligibleSubjectKeys()` — a baseline for a CSSE-pathway learner should sample English/Maths/Vocabulary/Writing only, never Verbal/Non-Verbal Reasoning, for exactly the same reason Daily Mission must not recommend them).
- **Framing:** never called a "test" or "assessment" to the child — consistent with `ANGEL_EXPERIENCE_MANIFESTO.md`'s dread-avoidance principle and AEP-001 §2.9/§2.10. Working title: "Getting to know you" or similar, explicitly low-stakes copy, no visible scoring.
- **Placement in the journey:** after Pathway Selection, before the first real Daily Mission is generated — filling the gap between "chose a pathway" and "dashboard shows a mission built on zero evidence."
- **What it writes:** ordinary `ali_student_question_history` rows via the existing, unmodified attempt-recording path (`applyAttemptOutcome()`, WP-05's `computeCompetencyConfidence()` reads it exactly like any other evidence) — no new schema, no new mastery mechanism. Its distinguishing property is *when* it runs and *how few* questions it asks, not a different underlying data model.
- **Expected resulting state:** Insufficient or Low confidence tiers immediately after completion for most touched competencies — correct behaviour per AEP-005 §2's own framing ("a single short baseline session never treated as sufficient evidence of mastery in anything"), not a shortfall of the design.
- **Route (illustrative, not committed):** a new step inserted between `/pathways` and `/dashboard`, e.g. `/pathways/baseline` or a dashboard-embedded first-run banner — the exact placement is a UX decision for whoever builds this, not fixed here.

---

## 4. Explicit scope decision: full build is a separate future work package

Building this — a new route, a question-selection flow across up to 8 domains respecting pathway eligibility, a completion/results screen, and the onboarding-sequence change to insert it between pathway selection and the dashboard — is a materially larger, more product-surface-visible undertaking than WP-01 through WP-05 (all of which were additive backend/schema/pure-function work with no new user-facing flow). Consistent with how `APD-021` handled the GAP-002 mock-system finding (record clearly, defer explicitly, treat as its own future work package rather than folding into the current one), this document stops at confirmation + design. **Recommend this be scoped as its own future work package** (not yet numbered in `IWP-001`, since that document's catalogue would need a formal update to add it) once the Founder decides to prioritise it.

---

## 5. Recorded in the Curriculum Gap Register

Added as GAP-003 (`CURRICULUM_GAP_REGISTER.md`) for consistency with GAP-001/GAP-002's pattern — a real gap, confirmed not assumed, with a design ready for whoever picks up the eventual build.
