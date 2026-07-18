# AXT-001: Angel Platform Inventory

**Document ID:** AXT-001
**Role:** Chief Experience Architect, Angel Experience Transformation Programme
**Purpose:** The authoritative, evidence-based catalogue of every learner-, parent-, and administrator-facing experience in the current Angel 11+ platform, before any redesign begins.
**Method:** every route below was opened and read directly this session (`app/**/page.tsx`, `app/**/route.ts`, `components/Navigation.tsx`) — 33 pages, 1 API route. Nothing here is carried over from a prior summary. No screen was redesigned and no implementation code was written to produce this document.
**Competency Intelligence Platform, defined once:** every reference below to "ALI" means the internal Angel Learning Intelligence engine (`lib/ali/*`, `types/ali/*`) — the Competency Intelligence Platform this inventory's own heading refers to. Per the Experience Manifesto's Invisible Intelligence doctrine, this name and every internal term inside it must never reach a learner or parent surface; it is used here only for engineering traceability.

---

## Summary Table

| # | Name | Route(s) | Primary users | Current status | Decision |
|---|---|---|---|---|---|
| 1 | Dashboard | `/` → `/dashboard` | Learner | Implemented, live, Tier 2 redesigned (UX V3) | UPGRADE |
| 2 | English Comprehension | `/english`, `/english/[id]` | Learner | Implemented, live, Tier 1 only | UPGRADE |
| 3 | Maths Reasoning | `/maths` | Learner | Implemented, live, Tier 1 only | UPGRADE |
| 4 | Vocabulary Builder | `/vocabulary` | Learner | Implemented, live, Tier 1 only | UPGRADE |
| 5 | Creative Writing | `/writing` | Learner | Implemented, live, Tier 1 only | UPGRADE |
| 6 | Reasoning Hub | `/reasoning` | Learner | Implemented, live, Tier 2 (new front door) | KEEP |
| 7 | Verbal Reasoning | `/verbal-reasoning` | Learner | Implemented, live, Tier 1 only | UPGRADE |
| 8 | Non-Verbal Reasoning | `/non-verbal-reasoning` | Learner | Implemented, live, Tier 1 only | UPGRADE |
| 9 | Spatial Reasoning | `/spatial-reasoning` | Learner | Implemented, live, Tier 1 only | UPGRADE |
| 10 | Numerical Reasoning | `/numerical-reasoning` | Learner | Implemented, live, Tier 1 only | UPGRADE |
| 11 | Legacy Full Mock Test | `/mock-test` | Learner | Implemented, live, **unreachable from any navigation path** | RETIRE |
| 12 | Practice & Mock Exams Hub | `/mocks` | Learner | Implemented, live, Tier 2 target | UPGRADE |
| 13 | Pathway Mock (static) | `/mocks/[pathway]` | Learner | Implemented, live | MERGE (with #14) |
| 14 | Adaptive Mock — GL/VR | `/mocks/adaptive/gl` | Learner | Implemented, live, synthetic-content fallback | UPGRADE |
| 15 | Adaptive Mock — Maths | `/mocks/adaptive/maths` | Learner | Implemented, live, synthetic-content fallback | UPGRADE |
| 16 | Adaptive Mock — English | `/mocks/adaptive/english` | Learner | Implemented, live, synthetic-content fallback | UPGRADE |
| 17 | Adaptive Mock — Vocabulary | `/mocks/adaptive/vocabulary` | Learner | Implemented, live, synthetic-content fallback | UPGRADE |
| 18 | Exam Pathways | `/pathways` | Learner (parent-assisted) | Implemented, live | KEEP |
| 19 | Progress | `/progress` | Learner | Implemented, live, Tier 1 only | UPGRADE |
| 20 | Parent Hub | `/parent` | Parent | Implemented, live, Tier 1 only, real Supabase data | UPGRADE |
| 21 | Admin Beta Dashboard | `/admin-beta` | Administrator (founder) | Implemented, live, real auth-gated | KEEP |
| 22 | Login | `/login` | Learner/Parent | Implemented, live | KEEP |
| 23 | Getting Started | `/getting-started` | Parent (new) | Implemented, live | KEEP |
| 24 | Contact & Support | `/contact` | Parent | Implemented, live | KEEP |
| 25 | Privacy Policy | `/privacy` | Parent | Implemented, live | KEEP |
| 26 | Terms of Use | `/terms` | Parent | Implemented, live | KEEP |
| 27 | Beta Welcome | `/beta` | Parent (prospective) | Implemented, live | KEEP |
| 28 | Beta Family Application | `/beta-family` | Parent (prospective) | Implemented, live | MERGE (with #29–32) |
| 29 | Send Feedback | `/feedback` | Parent | Implemented, live | MERGE |
| 30 | Report a Bug | `/report-bug` | Parent | Implemented, live | MERGE |
| 31 | Feature Request | `/feature-request` | Parent | Implemented, live | MERGE |
| 32 | Share Testimonial | `/testimonial` | Parent | Implemented, live | MERGE |
| 33 | Writing Feedback API | `/api/writing-feedback` | (backend only) | Implemented, live, OpenAI-backed | KEEP |

---

## Detailed Catalogue

### 1. Dashboard (`/dashboard`, root `/` redirects here)
- **Purpose:** The single entry point — Daily Mission, subject grid, streak/XP, pathway status.
- **Educational value:** High — this is where AEP-005's Feedback Specificity principle (§2.5) and the Momentum Framework's "informs, doesn't create, momentum" rule are operationalised via the Daily Mission.
- **Educational Constitution relationship:** Direct implementation surface for AEP-001 §2.5 (named-competency feedback) and §2.7 (autonomy-supportive, non-loss-aversion motivation, per `ANGEL_MOMENTUM_FRAMEWORK.md`).
- **Competency Intelligence Platform relationship:** Consumes `computeAdaptiveState()` (`lib/adaptiveEngine.ts`), which since WP-04 applies the Pathway Eligibility Filter and reads `aliCompetencySignal` where available — the one static-experience surface that already reflects real ALI evidence today, not just legacy scores.
- **Technical reuse potential:** High — `SubjectCard`, `InsightCard`, `NewBadgeBanner` are already shared, reusable components.
- **Experience quality:** Good — the one surface already given full Tier 2 treatment under UX V3.

### 2. English Comprehension (`/english`, `/english/[id]`)
- **Purpose:** Reading-comprehension lessons with passages, inference questions, and Voice Reading (`PassagePlayer`).
- **Educational value:** High — directly implements AEP-001 §2.1 (retrieval practice) and §2.4 (worked-example scaffolding before independent answer).
- **Constitution relationship:** Grounds AEP-002's Reading Comprehension domain (`english.inference`, `english.vocabulary-in-context` — the only two populated competencies of ten named).
- **ALI relationship:** Legacy `completeLesson()` scoring only — not yet ALI-competency-tagged for this static route (the adaptive English experience is a separate route, #16).
- **Technical reuse potential:** `PassagePlayer.tsx` (Voice Reading) is a strong, reusable, already-dark-mode-complete component — the clearest existing foundation for any future voice-first expansion.
- **Experience quality:** Functional, Tier 1 only — colour/icon/card corrections applied, no deep redesign.

### 3. Maths Reasoning (`/maths`)
- **Purpose:** Reasoning + speed-arithmetic practice modes, drawn from `data/maths.ts`.
- **Educational value:** High — AEP-001 §2.3's interleaving evidence is specifically strongest for Maths; this route's two-mode split is a real, if informal, precedent for it.
- **Constitution relationship:** Grounds AEP-002's Mathematics domain (16 named competencies, largest single domain).
- **ALI relationship:** Legacy scoring only for this static route (the adaptive Maths experience, #15, is separate and real-ALI-backed).
- **Technical reuse potential:** Moderate — bespoke numeric-answer normalisation logic (`normalizeNumeric`) is a real, reusable pattern any future numeric-input surface should reuse rather than reinvent.
- **Experience quality:** Functional, Tier 1 only.

### 4. Vocabulary Builder (`/vocabulary`)
- **Purpose:** Daily-word flashcard + quiz flow.
- **Educational value:** Moderate-High — flashcard "front/revealed" is a real retrieval-practice pattern (§2.1), though the daily-word rotation is calendar-based, not evidence-adaptive.
- **Constitution relationship:** Grounds AEP-002's Vocabulary domain (3 of 10 named competencies populated).
- **ALI relationship:** Legacy scoring only for this static route (adaptive Vocabulary, #17, is separate).
- **Technical reuse potential:** The flashcard front/revealed pattern is a candidate for reuse in any future spaced-review surface.
- **Experience quality:** Functional, Tier 1 only; the one subject whose adaptive route previously had a colour clash with Spatial Reasoning (corrected in `ANGEL_DESIGN_LANGUAGE.md` §2).

### 5. Creative Writing (`/writing`)
- **Purpose:** Timed writing prompts with an AI-generated feedback pass (`components/WritingFeedback.tsx` → `/api/writing-feedback`).
- **Educational value:** Moderate — genuinely the only assessed-writing surface, but AI feedback quality/consistency has not been independently reviewed in this inventory.
- **Constitution relationship:** The one domain with no dedicated AEP-002/003 competency taxonomy of its own (writing is treated as a single, holistic skill, not decomposed into named competencies like every other domain).
- **ALI relationship:** None — entirely outside the ALI competency model; the only subject not represented anywhere in `lib/ali/*`.
- **Technical reuse potential:** The `/api/writing-feedback` route (#33) is a real, working OpenAI integration pattern — the only such pattern in the codebase, and worth reusing rather than duplicating if a future surface needs AI-generated feedback elsewhere.
- **Experience quality:** Functional, Tier 1 only.

### 6. Reasoning Hub (`/reasoning`)
- **Purpose:** A single front door collapsing four peer-weighted reasoning subjects into one entry point.
- **Educational value:** N/A directly (navigation surface); indirectly supports AEP-001 §2.8 (reduces the decision-load an 8–11-year-old faces, consistent with the developmental-scaffolding principle).
- **Constitution relationship:** Implements `ANGEL_NAVIGATION_ARCHITECTURE.md` §1's finding that four equally-weighted entries "aren't peers in the student's mental model."
- **ALI relationship:** None directly (pure navigation) — the four routes it links to are described individually below.
- **Technical reuse potential:** `SubjectCard` reused directly; this pattern (collapse N peer items into one hub) is a reusable template for any future subject-family grouping.
- **Experience quality:** Good — genuinely new, purpose-built UX V3 pattern, not a retrofit.

### 7–10. Verbal / Non-Verbal / Spatial / Numerical Reasoning (`/verbal-reasoning`, `/non-verbal-reasoning`, `/spatial-reasoning`, `/numerical-reasoning`)
- **Purpose:** Four parallel practice sessions, all built on one shared `ReasoningSession` component, differing only by question bank, colour, icon, and skill list.
- **Educational value:** High-consistency — the shared component guarantees identical retrieval-practice mechanics across all four; genuinely well-reused, not duplicated.
- **Constitution relationship:** Ground AEP-002's NVR/SR/Mathematical-Reasoning domains — the three domains WP-01/WP-02 first taxonomised, still pending human tagging-review disposition (WP-22).
- **ALI relationship:** These four routes' *static* practice sessions are legacy-scored only. Their underlying question data (`data/non-verbal-reasoning/*`, `data/spatial-reasoning/*`, `data/numerical-reasoning/*`) is the exact real content WP-22 prepared for `ali_question_bank` import (112 of 120 questions approved) — meaning these four subjects are the closest to a real ALI upgrade of any static surface, pending that import's production authorisation.
- **Technical reuse potential:** Very high — `ReasoningSession.tsx` is the single best existing example of the "one component, four configured instances" pattern this whole platform should extend further.
- **Experience quality:** Functional, Tier 1 only, fully colour/icon-consistent per `ANGEL_DESIGN_LANGUAGE.md` §2 (two of the four previously had identity clashes with Parent Hub icons — since corrected).

### 11. Legacy Full Mock Test (`/mock-test`)
- **Purpose:** A standalone, fixed-content English + Maths timed mock.
- **Current status, verified directly:** real, working code — but a direct search of the entire codebase for `href="/mock-test"` returns **zero results**. It is not linked from `Navigation.tsx`, the dashboard, the `/mocks` hub, or anywhere else. It is reachable only by typing the URL directly.
- **Educational value:** Low today, purely because it's unreachable — the mock-exam concept itself (AEP-005) is sound, just already better served elsewhere (#12–17).
- **Constitution relationship:** Predates the Pathway architecture (AEP-002 §13) entirely — it has no pathway awareness at all, unlike every other mock surface.
- **ALI relationship:** None.
- **Technical reuse potential:** Low — its English/Maths-only, non-pathway-aware design is superseded in every respect by `/mocks/[pathway]` and the four adaptive mocks.
- **Experience quality:** Untested by any real user in practice, since nothing routes to it.
- **Decision: RETIRE.** This is the clearest, best-evidenced duplication finding in this inventory — restating and now confirming with direct evidence what `CURRICULUM_GAP_REGISTER.md`'s GAP-002 already flagged as a naming/mapping misalignment across the mock-exam surfaces.

### 12. Practice & Mock Exams Hub (`/mocks`)
- **Purpose:** Lists pathway-based mocks (GL/CEM/CSSE/ISEB), the entry point both "Practice" and "Mock Exams" nav items point to (via anchors).
- **Educational value:** High — the correct, current front door for AEP-005's Assessment Framework.
- **Constitution relationship:** Direct implementation of AEP-002 §13's Pathway-First Architecture.
- **ALI relationship:** Indirect — links onward to both the static (#13) and adaptive (#14) mock experiences.
- **Technical reuse potential:** `PathwayCard` reused; the split "Practice" vs "Mock Exams" section pattern is reusable for any future two-mode hub.
- **Experience quality:** Good, named as a Tier 2 target in `ANGEL_UX_V3_STRATEGY.md` §4.

### 13. Pathway Mock, static (`/mocks/[pathway]`)
- **Purpose:** A fixed, multi-section pathway mock (VR/NVR/SR/NR sections drawn from the same static question banks as items #7–10).
- **Duplication finding, verified directly in code:** `app/mocks/adaptive/gl/page.tsx`'s own header comment states its `MOCK_CONFIGS`-equivalent section configuration is **"Deliberately duplicated (not imported) from `app/mocks/[pathway]/page.tsx`'s `MOCK_CONFIGS`... to keep the two routes [independent]."** This is a real, in-code-acknowledged duplication, not an inferred one.
- **Educational value:** Moderate — functionally sound mock experience, but structurally the "static half" of a concept (#14) already has an ALI-adaptive counterpart for GL.
- **Constitution relationship:** Same as #12.
- **ALI relationship:** None directly — static content only.
- **Technical reuse potential:** The section-timing/scoring engine here is the direct template the adaptive mocks copied — meaning a future consolidation should extract this once, not maintain two parallel copies.
- **Experience quality:** Functional, Tier 1 only.
- **Decision: MERGE** — with the adaptive GL mock (#14) once real ALI content exists for the other three pathways (CEM/CSSE/ISEB), so there is one mock-runtime per pathway, adaptive where ALI content exists and static where it doesn't yet, rather than two parallel implementations of the same section-timing logic.

### 14–17. Adaptive Mocks — GL/VR, Maths, English, Vocabulary (`/mocks/adaptive/{gl,maths,english,vocabulary}`)
- **Purpose:** Real-time ALI-adaptive practice sessions — the actual Competency Intelligence Platform surfaced to a learner, today, in its only four live forms.
- **Educational value:** Highest in the platform — these are the only four surfaces implementing genuine evidence-adaptive selection (AEP-005's Evidence Confidence Model, mastery thresholds, spacing/cooldown).
- **Constitution relationship:** The direct, load-bearing implementation of AEP-001 §2.1/§2.2 (retrieval + spacing) and AEP-005 in full.
- **ALI relationship:** These four routes *are* the Competency Intelligence Platform's only current user-facing form. Each reuses `lib/ali/questionBank.ts`, `history.ts`, `mastery.ts`, `weakness.ts`, `learningGain.ts`, `learningProfile.ts`, and `adaptiveMockBuilder.ts` — real, tested, shared engine code, not per-subject reimplementation.
- **Technical reuse potential:** Very high already realised — per the Maths route's own comment, it was built by reusing "every `lib/ali/*` module... exactly as built for Verbal Reasoning," the strongest existing proof this platform can extend ALI to a new subject with almost no new engine code.
- **Experience quality:** Good mechanically, but every one of these four still runs on synthetic-fixture content in practice — the real, human-reviewed question content prepared in WP-22 (112 questions) has not yet been imported to production (WP-23), so what a real learner sees today is placeholder content behind a genuine adaptive engine.
- **Decision: UPGRADE** — the engine underneath is sound; the experience layer and the underlying content both have real, already-identified next steps (WP-22/23) independent of any UI redesign.

### 18. Exam Pathways (`/pathways`)
- **Purpose:** Select exam board (GL/CEM/CSSE/ISEB/Independent) and optionally set a target exam date.
- **Educational value:** High — the single input that unlocks AEP-002 §13's entire Pathway-First filtering (WP-04's Stage 0 Pathway Eligibility Filter reads this value directly).
- **Constitution relationship:** Direct implementation surface for AEP-002 §13.
- **ALI relationship:** `getTargetExamDate()`/`setTargetExamDate()` feed Recommendation Orchestration's Tier 3 exam-proximity reweighting (WP-09) — one of only two places in the whole platform (`lib/progress.ts`) where this value is ever set.
- **Technical reuse potential:** `PathwayCard` shared with #12.
- **Experience quality:** Functional, simple, does its one job well.

### 19. Progress (`/progress`)
- **Purpose:** Subject/skill breakdown, badges, gamification state.
- **Educational value:** Moderate-High — a real implementation of AEP-001 §2.5 (named-skill feedback via `SkillBar`), but reports legacy scores, not ALI competency-level state.
- **Constitution relationship:** Supports AEP-001 §2.5; does not yet reflect AEP-005's Evidence Confidence tiers anywhere.
- **ALI relationship:** None directly today — a real content gap relative to the Parent Hub (#20), which does already surface some ALI-derived language.
- **Technical reuse potential:** `SubjectBreakdown`, `BadgeCard`, `DifficultyBadge` all shared/reusable.
- **Experience quality:** Functional, Tier 1 only — explicitly **not** one of UX V3's Tier 2 targets despite being a core, frequently-visited surface. This is a real, documented scope gap (stated honestly in `ANGEL_UX_V3_STRATEGY.md` itself, not discovered here) worth prioritising in Experience Transformation.

### 20. Parent Hub (`/parent`)
- **Purpose:** The Parent Confidence pillar of the Experience Manifesto made real — subject breakdown, readiness signal, mock history, pathway status.
- **Educational value:** High — implements `computeParentReport()` (`lib/parentInsights.ts`), which already carries `durablyMastered`/`recommendationExplanation`/`wellbeingSignal` fields (WP-12) — the most ALI-aware learner/parent-facing surface in the platform, even though `wellbeingSignal` is not yet wired to WP-21A's real evaluator.
- **Constitution relationship:** The direct implementation target of the Manifesto's three Parent Confidence time horizons (one day / one week / one month).
- **ALI relationship:** Closest of any UI surface to real ALI integration — reads real, structured competency-level fields, even though the wellbeing field specifically is still a placeholder `null` pending future wiring.
- **Technical reuse potential:** High — `DifficultyBadge`, subject icon mapping shared with dashboard.
- **Experience quality:** Functional, Tier 1 only — per UX V3's own scope note, "only its position in the navigation and its visual language change," not a deep redesign, despite being arguably the single highest-trust-stakes surface in the whole product per the Manifesto's own framing.

### 21. Admin Beta Dashboard (`/admin-beta`)
- **Purpose:** Founder-only view of feedback/bugs/feature-requests/testimonials/beta applications and beta-tracking events.
- **Primary users:** Administrator only.
- **Educational value:** N/A (operational tooling).
- **Constitution relationship:** N/A.
- **ALI relationship:** None.
- **Technical reuse potential:** Real Supabase Auth + RLS + `is_current_user_admin()` pattern (migration 008) is the one genuine authenticated-access-control precedent in this codebase — reusable if any future surface needs real role-gating.
- **Experience quality:** Functional, utilitarian by design (internal tool, not a family-facing surface) — appropriately out of scope for a learner/parent Experience Transformation.
- **Decision: KEEP**, unchanged, outside this programme's scope.

### 22. Login (`/login`)
- **Purpose:** Magic-link email sign-in.
- **Educational value:** N/A (auth surface).
- **Constitution relationship:** N/A directly, though its existence enables the Parent Confidence pillar's cross-device promise.
- **ALI relationship:** None.
- **Technical reuse potential:** Real rate-limit/disposable-domain validation logic, reusable for any future account-creation surface.
- **Experience quality:** Functional, simple.

### 23. Getting Started (`/getting-started`)
- **Purpose:** A four-step onboarding explainer (choose pathway, etc.).
- **Educational value:** Moderate — reduces the exact "menu of six choices" friction AEP-001 §2.8/Manifesto's Product Principles warn against, by sequencing first-time setup.
- **Constitution relationship:** Supports the Manifesto's "one clear next action" principle for first-time use.
- **ALI relationship:** None directly (points to `/pathways`).
- **Technical reuse potential:** `SupportLayout` shared.
- **Experience quality:** Functional.

### 24–27, 32. Contact, Privacy, Terms, Beta Welcome, Share Testimonial (`/contact`, `/privacy`, `/terms`, `/beta`, `/testimonial`)
- **Purpose:** Legal/support/marketing utility pages.
- **Educational value:** N/A.
- **Constitution relationship:** N/A, except that all consistently avoid the ALI-visible-technology violation (no "adaptive," "algorithm," etc. anywhere in this batch).
- **ALI relationship:** None.
- **Technical reuse potential:** All five share `SupportLayout` — **this is a real reuse success worth naming explicitly**, not a gap: one shared layout component, consistent back-navigation, consistent typography, across every utility page in the product.
- **Experience quality:** Functional, appropriately lightweight for their purpose.

### 28–31. Beta Family Application, Send Feedback, Report a Bug, Feature Request (`/beta-family`, `/feedback`, `/report-bug`, `/feature-request`)
- **Purpose:** Four separate single-purpose forms, all writing to `lib/feedback.ts`'s five Supabase tables (migration 008).
- **Educational value:** N/A directly; indirectly supports product improvement via real user signal.
- **Constitution relationship:** N/A.
- **ALI relationship:** None.
- **Technical reuse potential:** All four share `SupportLayout` and an identical validate/submit/success-state pattern — genuinely well-reused at the component level.
- **Experience quality:** Functional, consistent with each other.
- **Consolidation opportunity:** `/feedback` already internally distinguishes three feedback *types* (positive/suggestion/general) via a type-selector UI. `/report-bug`, `/feature-request`, and `/feedback` are, in substance, three flavours of "tell us something" differing only in their target table and a few fields — a strong candidate to consolidate into one "Send Feedback" surface with a four-way type selector (Positive / Suggestion / Bug / Feature Idea) rather than three separate routes and three separate nav-adjacent entry points. `/beta-family` (a structured application form, not free-text feedback) is different in kind and is a weaker consolidation candidate — noted separately, MERGE only with the feedback-type family, not with beta-family.

### 33. Writing Feedback API (`/api/writing-feedback`)
- **Purpose:** Server-side OpenAI call generating structured feedback on a submitted writing sample.
- **Primary users:** Backend only, called by `/writing` (#5).
- **Educational value:** Supports AEP-001 §2.5 (specific, actionable feedback) for the one domain (Writing) with no ALI competency model at all.
- **ALI relationship:** None — entirely separate from the Competency Intelligence Platform.
- **Technical reuse potential:** The only real external-AI-API integration pattern in the codebase — worth reusing (not duplicating) if any future surface needs generative feedback.
- **Experience quality:** N/A (no UI of its own).

---

## Duplicate Functionality

1. **The mock-exam family is four-deep for what is conceptually one experience:** `/mock-test` (orphaned, #11), `/mocks/[pathway]` (static, #13), `/mocks/adaptive/{gl,maths,english,vocabulary}` (adaptive, #14–17). Two of these four (`/mock-test` and `/mocks/[pathway]`'s GL section) cover overlapping ground the adaptive GL mock already supersedes for Verbal Reasoning specifically. This is the platform's single most consequential duplication and directly corroborates `CURRICULUM_GAP_REGISTER.md` GAP-002.
2. **Static vs. adaptive parallel implementations for the same four subjects** (English, Maths, Vocabulary, and VR-within-GL): each subject has a legacy-scored static practice route (#2–4, #7) and a separate ALI-adaptive route (#14–17) with no shared UI, only shared engine code underneath. This is architecturally correct today (deliberate, documented, per `ANGEL_UX_V3_STRATEGY.md`'s "no ALI engine change" scope boundary) but is a real experience-layer duplication a learner encounters as two different ways to "practise Maths."
3. **Four single-purpose feedback forms** (#29–31 plus part of #24's Contact page) — see the consolidation opportunity under items 28–31 above.

## Legacy Navigation

- **`/mock-test` is genuinely orphaned** — real code, zero inbound links anywhere in the codebase (verified by direct search, not assumed).
- **No other route was found unreachable from navigation** — every other page is linked from `Navigation.tsx`, the dashboard, the Reasoning Hub, or the Mocks hub.
- **`Navigation.tsx` itself is current, not legacy** — it already matches `ANGEL_NAVIGATION_ARCHITECTURE.md`'s approved V3 structure exactly (Learning / Reasoning / Assessment / Family / Support sections, mobile 5-slot bottom bar). No drift found between the navigation architecture document and the live component.

## Inconsistent Components

No new inconsistencies were found beyond what `ANGEL_DESIGN_LANGUAGE.md` §2 already identified and corrected (the Maths/Vocabulary adaptive routes' colour clashes, Parent Hub's reasoning-subject icon mismatches). Direct re-check this session found the corrected identity table (`ANGEL_DESIGN_LANGUAGE.md` §2) consistently reflected across the pages read. One genuine, real inconsistency this inventory did find: **`/mock-test` predates the Pathway architecture and has no pathway awareness at all** — every other mock/assessment surface is pathway-scoped; this one is not, which is structurally consistent with it being the platform's oldest, most orphaned surface.

## Opportunities to Simplify

- **Retire `/mock-test`** outright (§11) — zero navigational cost, since nothing links to it.
- **Consolidate the four single-purpose feedback forms** (§28–31) into one typed form.
- **`/progress` and `/parent` cover meaningfully overlapping ground** (subject breakdown, readiness signal, badges) for two different audiences from two separately-maintained data-shaping functions (`computeAnalytics`/`computeGamification` vs. `computeParentReport`) — not a duplication to merge (the audiences are genuinely different, and the Manifesto explicitly wants parent-facing language to differ from learner-facing language), but a real opportunity to derive both from one shared underlying computation rather than two independently-evolving ones.

## Opportunities to Consolidate

- **The mock-exam family (§ Duplicate Functionality, item 1)** is this platform's single highest-value consolidation target: one mock-runtime per pathway, adaptive where real ALI content exists, static where it doesn't yet — rather than maintaining `MOCK_CONFIGS` twice, as the code itself already admits it does.
- **The four reasoning subjects already demonstrate the target pattern** (`ReasoningSession`, one component/four configurations) — the same pattern should be extended to the static English/Maths/Vocabulary/Writing routes, which currently have no equivalent shared session component.

## Candidate Areas for Voice-First Learning

- **`components/PassagePlayer.tsx` (English Comprehension, #2) is a real, already-built, dark-mode-complete Voice Reading capability today** — the strongest existing foundation for any voice-first expansion, not a green-field build.
- **Vocabulary (#4)'s flashcard front/revealed pattern** is a natural, low-risk candidate for a voice-first "hear the word, say the definition" mode, given it already separates presentation from recall the way retrieval practice (AEP-001 §2.1) requires.
- **The four Reasoning subjects' shared `ReasoningSession` component** (#7–10) is architecturally the single best candidate for a platform-wide voice-first pilot: one component change would apply to four subjects simultaneously, rather than four separate implementations.
- **Writing (#5)** is the weakest near-term candidate — its feedback loop already depends on typed input for the AI-feedback pipeline (#33); voice-first there would require a genuinely new capability (speech-to-text transcription), not a reuse of anything that exists today.

---

## Note on Method and Scope

This inventory deliberately did not re-derive facts already established and cited elsewhere in this programme's own documentation (e.g., WP-22's exact question-approval counts, WP-23's migration-status findings) — those are referenced, not repeated, to avoid two documents drifting out of sync with each other. Where this inventory's own direct code search produced a new finding not previously documented anywhere (the `/mock-test` orphan-route finding, and the `mocks/adaptive/gl` duplication comment), that finding is marked as newly verified here, not attributed to a prior document.

No screen was redesigned and no implementation code was written or modified to produce this inventory.
