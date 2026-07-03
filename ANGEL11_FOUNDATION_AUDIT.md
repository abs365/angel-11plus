# Angel 11+ — Foundation Audit

**Type:** Independent enterprise audit. Read-only — no code was built, refactored, or optimised to produce this report. Every claim below was verified directly against the current codebase (file reads, greps, `npm run build`, three independent research passes) on **2026-07-03**; nothing here is carried over from memory of prior work sessions.

**Method note:** this audit combines direct verification (git, build, file reads) with three parallel, independent code-research passes (feature inventory, architecture/dead-code, UI consistency), each of which re-derived its findings from the live repository rather than trusting any prior summary. Where two passes touched the same file, both are cited so the finding is corroborated, not single-sourced.

---

## SECTION 1 — Project Summary

| Item | Finding |
|---|---|
| **Package version** | `0.1.0` (`package.json`) — unchanged despite 34 commits and four ALI subjects shipping. No `CHANGELOG.md`, no git tags exist anywhere in the repo. |
| **Documented "status"** | Inconsistent across the repo's own docs — `PROJECT_CONTEXT.md` (last updated May 2026) claims **"Status: Production platform (Phase 8+)"** and doesn't mention ALI at all; `BETA_DEPLOYMENT_CHECKLIST.md`/`BETA_SUCCESS_CRITERIA.md` describe a pre-launch beta program with unmet success criteria; an uncommitted local `UX_TRANSFORMATION_PLAN.md` (see below) lists active phases 2D-A.2/2D-B/2E/3 as "Next"/"Planned". These three documents cannot all be describing the same product state. |
| **Current branch** | `main` |
| **Latest commit** | `3bd6069` — "Phase ALI Foundation Complete" (2026-07-03) |
| **Working tree state** | One uncommitted, unrelated file: `UX_TRANSFORMATION_PLAN.md` (63 insertions, 4 deletions vs. HEAD) — a real, apparently-current product roadmap update (out-of-scope declaration for subscriptions/payments/App Store, phase renumbering) sitting uncommitted and therefore not in version-controlled history. This predates this audit session and was not authored during ALI work. |
| **Build status** | `npm run build` — **clean.** Compiles successfully, TypeScript passes with zero errors, all 35 routes generate. |
| **Route count** | **35** total: 33 page routes + `/api/writing-feedback` + the framework's `/_not-found`. 30 static (`○`), 2 dynamic (`ƒ`: `/english/[id]`, `/mocks/[pathway]`), 1 server-only API route. |
| **Deployment readiness** | Target is Vercel + Supabase + OpenAI (`DEPLOYMENT.md`). No CI/CD config found (no `.github/workflows`, no `vercel.json`). **`DEPLOYMENT.md`'s inline setup SQL is stale — it has zero mentions of ALI or migrations 004–007**, meaning a deploy following that document alone would set up the original schema only, without any ALI table. Live Supabase state (whether migrations are actually applied in production) **cannot be verified from this environment** — this sandbox has no outbound network route to the project's Supabase instance, a limitation documented consistently since the ALI work began. Per the project's own `ALI_VERSION.md` (which is kept current every phase), migrations 004–007 have **not** been applied as of the last update. |

---

## SECTION 2 — Feature Audit

| # | Feature | Verdict | Evidence |
|---|---|---|---|
| 1 | Authentication | **Partial** | Real Supabase magic-link (passwordless email) auth exists (`app/login/page.tsx`, `components/providers/AuthProvider.tsx`, `lib/supabase.ts`), linking to a device-ID anonymous profile — but there's no password/signup form, and login is fully skippable ("Continue without signing in"). The app is designed to work entirely anonymously; auth is an optional upgrade path, not a gate. |
| 2 | Dashboard | **Present** | `app/dashboard/page.tsx` — XP/streak hero, Daily Mission, badges, weekly goal, pathway card, insights, all wired to real `lib/analytics.ts`/`lib/adaptiveEngine.ts`/`lib/gamification.ts` output. |
| 3 | English | **Present** | `app/english/page.tsx` + `app/english/[id]/page.tsx`, `data/lessons.ts` — 3 real passages, 10 questions. Content volume is thin (flagged again in §6/§7) but the feature itself is fully built. |
| 4 | Maths | **Present** | `app/maths/page.tsx` (439 lines), `data/maths.ts` (20 real questions). |
| 5 | Vocabulary | **Present** | `app/vocabulary/page.tsx` (345 lines), `data/vocabulary.ts` (12 real words). Self-report flashcard model, not machine-graded (by original design, not a defect — see `VOCABULARY_COMPETENCY_FRAMEWORK.md` §1). |
| 6 | Writing | **Present** | `app/writing/page.tsx`, `data/writing.ts` (4 prompts), `app/api/writing-feedback/route.ts` — real OpenAI (`gpt-4o-mini`) integration, gracefully degrades if `OPENAI_API_KEY` is unset. |
| 7 | Reasoning (VR/NVR/Spatial/Numerical) | **Present** | Four real pages, each a thin wrapper around `components/ReasoningSession.tsx`, backed by real modular question data files (~50–90+ questions per subject). |
| 8 | Voice Reading | **Present** | `components/PassagePlayer.tsx` — genuine Web Speech API integration: `speechSynthesis` for TTS "Listen," `SpeechRecognition`/`webkitSpeechRecognition` for "Read aloud" with real accuracy/WPM scoring (`lib/readingUtils.ts`'s `compareTranscript()`). Gracefully hides itself on unsupported browsers. This is a real, well-built, easily-overlooked feature — not documented anywhere in the ALI docs since it predates and is unrelated to ALI. |
| 9 | Adaptive Difficulty | **Partial** | `lib/adaptiveDifficulty.ts`'s confidence/tier scoring is real and rendered (Progress page, Parent Hub, mission tiering) — but by the project's own original architecture document, this signal is *descriptive*, not *selection-driving*, for the legacy static content. **This has since changed for ALI-covered subjects**: the adaptive VR and Mathematics routes genuinely use tier to drive per-mock difficulty *mix* (`lib/adaptiveMockBuilder.ts`'s `TIER_DISTRIBUTION`); the adaptive English and Vocabulary routes deliberately do not (Learning Unit selection is a single pick, not a distribution — a documented scope decision, not a gap). Net: "adaptive difficulty" is real for 2 of 4 ALI subjects' question *selection*, and descriptive-only everywhere else. |
| 10 | Daily Missions | **Present** | `lib/adaptiveEngine.ts`'s `buildDailyMission()`, rendered on the dashboard with priority chips, reasons, and CTAs. Confirmed ALI-aware (weak-competency branch) for all 4 ALI subjects. |
| 11 | Replay | **Partial** | `lib/replayEngine.ts`'s `getTopReplayItem()` is consumed to inject one "Revise: X" mission item — but the fuller `buildReplayQueue()` output is computed and never rendered as its own screen anywhere. A "Replay" feature exists only as one line inside Daily Missions, not as a distinct experience. |
| 12 | Parent Dashboard | **Present** | `app/parent/page.tsx` (666 lines) — readiness, subject breakdown, competency summaries, badges, mock history, all wired to real data. |
| 13 | Parent Hub | **Present (same feature as #12)** | "Parent Hub" is the nav label (`components/Navigation.tsx`) for the same `/parent` route — not a separate feature. |
| 14 | Smart Feedback | **Present (same feature as #6)** | "Smart Feedback" is the product name for the Writing AI-feedback feature; no separate mechanism exists. |
| 15 | Premium Mocks | **Missing** | Zero matches for "premium"/"paywall"/"subscription"/"stripe" anywhere in application code (independently confirmed by two separate searches this session). The only "Premium" string in the repo is marketing copy in `public/manifest.json`. All mocks are free and ungated. |
| 16 | UK Pathways | **Present** | `app/pathways/page.tsx`, `lib/pathways.ts` — 7 real pathways including all 4 named (GL/CEM/CSSE/ISEB), each with real content. |
| 17 | Offline PWA | **Present** | `public/manifest.json`, `public/sw.js` (hand-written, not `next-pwa`), `public/offline.html`, `lib/pwa.ts`, `components/PWAProvider.tsx` — genuine app-shell precaching and offline fallback, registered in `app/layout.tsx`. |
| 18 | Admin Beta | **Partial** | `app/admin-beta/page.tsx` (602 lines) is fully built (feedback/bugs/features/beta applications/testimonials/analytics view) — but gated only by a **hardcoded PIN visible in the shipped client bundle** (`const ADMIN_PIN = "angel2026"`), and all underlying data is localStorage-only per device. It cannot function as a real cross-device admin tool for multiple beta families — flagged as a real issue in §7. |
| 19 | Feedback | **Present** | `app/feedback/page.tsx`, `lib/feedback.ts` — localStorage-only persistence (explicit in-code comment notes this as a known future Supabase migration). |
| 20 | Feature Requests | **Present** | Same pattern as #19. |
| 21 | Bug Reports | **Present** | Same pattern as #19. |
| 22 | Beta Registration | **Present** | `app/beta-family/page.tsx` (application form), `app/beta/page.tsx` (landing page) — both real. |
| 23 | Testimonials | **Present** | `app/testimonial/page.tsx` — same localStorage-only pattern as #19. |
| 24 | Support Pages | **Present** | `app/contact/page.tsx`, `app/privacy/page.tsx`, `app/terms/page.tsx`, `app/getting-started/page.tsx` — all substantial, real pages (120–240 lines each), not placeholders. |

**No feature audited above is genuinely Deprecated** — everything present is either actively used or, where unused (see §4), that is an architecture finding about *orphaned code*, not a feature that was built and then abandoned.

---

## SECTION 3 — ALI Foundation Audit

Every item below was independently confirmed to exist on disk this session (`ls`/`grep`, not recollection):

| Module | Status | Evidence |
|---|---|---|
| Learning Units | **Present** | `lib/ali/learningUnit.ts`, `types/ali/learningUnit.ts` — used by both Reading Comprehension and Vocabulary's adaptive routes. |
| Verbal Reasoning Intelligence | **Present** | `app/mocks/adaptive/gl/page.tsx`, `data/ali/vrSyntheticFixture.ts`, full `lib/ali/*` stack. |
| Mathematics Intelligence | **Present** | `app/mocks/adaptive/maths/page.tsx`, `data/ali/mathsSyntheticFixture.ts`. |
| Reading Intelligence | **Present** | `app/mocks/adaptive/english/page.tsx`, `data/ali/englishSyntheticFixture.ts`, `ENGLISH_COMPETENCY_FRAMEWORK.md`. |
| Vocabulary Intelligence | **Present** | `app/mocks/adaptive/vocabulary/page.tsx`, `data/ali/vocabularySyntheticFixture.ts`, `VOCABULARY_COMPETENCY_FRAMEWORK.md`. |
| Parent Intelligence | **Present** | `lib/parentInsights.ts`'s `buildCompetencySummaries()`, confirmed rendered in `app/parent/page.tsx` (the "How They're Doing" section, ~lines 458–512). |
| Daily Mission Intelligence | **Present** | `lib/adaptiveEngine.ts`'s ALI-aware `urgency()` branch, confirmed rendered on the dashboard. |
| Cross-Subject Recommendations | **Present, code only — zero UI surface** | `lib/ali/recommendations.ts`, `types/ali/recommendations.ts` exist and are real, but grep confirms zero call sites outside their own module and validation scripts. Not wired into Daily Missions, Parent Insights, or any route — matches the project's own documentation of this as an intentional, internal-only status. |
| Learning Profiles | **Present, code only — zero UI surface** | `lib/ali/learningProfile.ts`, `types/ali/learningProfile.ts`. Confirmed wired into all 4 adaptive routes' completion handlers (`grep` found exactly 4 call sites, one per subject) — so it does compute and store automatically, but nothing renders it. |
| Operations Manual | **Present** | `ALI_OPERATIONS_MANUAL.md`. |
| Decision Log | **Present** | `ALI_DECISION_LOG.md` — 44 numbered decisions confirmed present, sequential, none skipped. |
| Versioning | **Present** | `ALI_VERSION.md` — status line confirmed to read "ALI Foundation Version 1.0 — complete." |
| Production Activation documents | **Present** | `ALI_PRODUCTION_ACTIVATION_CHECKLIST.md`, `ALI_HAND_TAGGING_WORKFLOW.md`, `ALI_SEEDING_PLAN.md`, `ALI_LIVE_VALIDATION_PROTOCOL.md` — all four confirmed present. |

**Honest gaps found in this audit, not previously flagged this precisely:**

1. **`ALI_HAND_TAGGING_WORKFLOW.md` has no Vocabulary section.** Grep confirms only 2 incidental string matches for "vocabulary" in that file (a VR data filename and an English competency name) — no real tagging procedure for the 4th subject exists yet, despite Vocabulary Intelligence itself being fully implemented.
2. **`ADAPTIVE_ASSESSMENT_ENGINE_ARCHITECTURE.md`'s own status header is stale and actively misleading.** It reads: *"Status: DRAFT — architecture only. No code written, no schema created... Awaiting review and explicit implementation approval."* This was accurate the day it was written, before Slice 1 was approved and built later the same session — but it was never updated afterward. A reader (human or AI) consulting only this file would wrongly conclude ALI has zero implementation, when in fact 4 subjects, 7 migrations, and ~20 `lib/ali/*`/`types/ali/*` modules exist. `ALI_VERSION.md` is the accurate, current-state document; this older file is a frozen Blueprint artifact that should carry a "superseded — see ALI_VERSION.md" note but doesn't.
3. **None of this has touched a real student yet.** All four subjects run entirely on synthetic dev fixtures (clearly labeled as such in code). Migrations 004–007 are, per the project's own tracking, unapplied to production. The entire ALI system, however architecturally sound, is currently inert in production.

---

## SECTION 4 — Architecture Audit

**Unused modules:** `lib/mockArchitecture.ts` — zero imports anywhere; its own header calls it "Phase 2C," superseded by the real `app/mocks/[pathway]/page.tsx` + `lib/adaptiveMockBuilder.ts` system. Safe to delete.

**Unused components:** `components/XPBar.tsx` and `components/DailyMission.tsx` — zero imports anywhere (the dashboard reimplements this UI inline instead of using these components).

**Unused routes:** `app/admin-beta/page.tsx` — zero references to the string `"admin-beta"` anywhere else in the codebase (no nav link, no internal link). It works if you type the URL directly, but nothing in the product surfaces it.

**Duplicate logic:**
- English scoring (`scoreAnswer`/`extractKeywords`/`STOP_WORDS`) and Maths answer-checking are duplicated between the legacy static pages and their ALI adaptive counterparts — **but this is intentional and documented** in-code as "duplicated by design, isolation," a deliberate architectural choice this account's own ALI work made consistently across 4 subjects.
- **One undocumented duplication was found:** `formatTime()` is byte-identical between `app/mocks/adaptive/gl/page.tsx` and `app/mocks/adaptive/maths/page.tsx`, with no "by design" comment — this one looks like an accidental copy-paste rather than a deliberate isolation decision. Trivial, low-priority extraction candidate.

**Dead code:** none found. No unreachable branches, no commented-out blocks, no always-true/false conditionals, no TODO/FIXME/XXX comments anywhere in the codebase — checked explicitly, not merely unchecked.

**Temporary fixtures / synthetic data:** all 4 `data/ali/*SyntheticFixture.ts` files carry an identical, clear "SYNTHETIC / DEV-ONLY — NOT REAL PRODUCTION CONTENT" header. **A real operational risk was found in how they're triggered**: `fetchQuestionBank()` returns an empty array both when a table is genuinely empty *and* on any Supabase query error, and every adaptive route treats an empty array identically — falling back to the synthetic fixture. This means a real database outage or misconfiguration would be visually indistinguishable from "content not seeded yet" (both show the same amber "sample practice data" banner) — not silent to the *end user*, but not distinguishable to an *operator* trying to monitor real system health. Worth a monitoring improvement before launch.

**Legacy code review:** the dual-write bridge (`recordAliCompetencySignal`/`recordAliLearningGain`/`recordAliLearningProfile` alongside the legacy `recordSkillResult`/`completeLesson`) is explicitly documented as a temporary interoperability shim in the project's own docs — confirmed still present and **confirmed still necessary**, since the planned future migration of confidence/replay/readiness off localStorage has not happened. `buildReplayQueue()` is called "legacy" in the decision log but is confirmed still actively imported and load-bearing. No genuinely-safe-to-remove legacy code was found beyond the three unused files/routes named above.

**Scale:** 146 total `.ts`/`.tsx` files. The 4 ALI adaptive-route pages alone total 2,125 lines (gl 713, english 523, maths 485, vocabulary 404) — a meaningful concentration of recent complexity.

**Migrations:** all 7 present, all genuinely additive — no migration was found to replace or overwrite a prior one.

**Security note (flagged directly to the user already, repeated here for the permanent record):** `AGENTS.md` (auto-loaded by `CLAUDE.md` into every AI session in this repo) contains a prompt-injection-style instruction directing AI agents to consult a nonexistent `node_modules/next/dist/docs/` path and treat fabricated "breaking changes" as real. Two independent research passes this session both identified and disregarded it unprompted. This is a repo hygiene/security item, not a code defect, but it belongs in an enterprise audit.

---

## SECTION 5 — UI Audit

**Navigation:** well-structured (`components/Navigation.tsx` — Learning / Reasoning / Exams / Parent Area / Support groups), matches `DESIGN_SYSTEM.md` §10 exactly, no broken links. However, several real, working routes have **no discoverable path from the UI at all**: `/mock-test`, `/beta`, `/beta-family`, `/admin-beta`, `/report-bug`, `/feature-request`, and all 4 `/mocks/adaptive/*` routes (reachable only via `/mocks`, not the sidebar). `/privacy` and `/terms` *are* linked, via `components/SupportFooter.tsx` rather than the sidebar — a normal, acceptable pattern for legal pages.

**Dashboard:** the most faithful implementation of `DESIGN_SYSTEM.md`'s card/spacing/gradient specs in the app.

**Parent Journey:** a real, structurally coherent flow (stats → pathway → readiness → subject breakdown → reasoning → mocks → ALI competency summaries → insights → focus areas → badges) — but **`app/parent/page.tsx` does not use the shared `PageLayout`**, building its own shell instead. On desktop, a parent who navigates here loses the sidebar entirely and can only return via a small "Student App" link. This is a real, if minor, journey break for what the nav itself calls a primary destination.

**Student Journey:** structurally consistent for the legacy static pages, but the 4 newer ALI adaptive routes are visually heavier/more "product-like" (solid-color full-width headers, `text-5xl font-black` scores, "Adaptive · Beta" chips) than the plain white-header legacy pages — two coexisting design eras, not a broken journey, but a visible seam.

**Icons:** consistent everywhere for core subjects (English/Maths/Vocabulary/Writing/Mocks/Progress) — **except the four reasoning subjects, which use a different icon set on the Parent Hub than everywhere else in the app** (`Puzzle`/`Shapes`/`Compass`/`Hash` in the main nav and dashboard vs. `Brain`/`Eye`/`Box`/`Hash` on `/parent` — only Numerical matches). A real, fixable inconsistency.

**Colour system:** English's purple is used consistently everywhere (static page and adaptive route both purple). **Maths and Vocabulary are not** — their adaptive routes use `emerald`/`teal` (which are actually *pathway* accent colours from `lib/pathways.ts`, not subject colours) instead of each subject's own established brand colour (`blue` for Maths, `green` for Vocabulary elsewhere in the app). 2 of 4 adaptive routes contradict their own subject's established colour.

**Spacing/Radius:** good, consistent adherence to the design system's card/button/badge radius conventions across every page checked — no meaningful drift found.

**Dark Mode:** 40 of 59 checked files use `dark:` classes. Confirmed gaps: `app/mock-test/page.tsx` (24 light-only classes, zero dark variants — and it's the orphaned route from §4); the two dead components already flagged (`XPBar.tsx`, `DailyMission.tsx` — harmless since unused); and **one real, live defect**: `lib/parentInsights.ts`'s `READINESS_CONFIG` (the colour styling for the Parent Hub's prominent "Exam Readiness" card) has **zero dark-mode variants at all**, independently confirmed by this audit — that card will render washed-out/wrong in dark mode on one of the app's most-viewed parent-facing screens, even though the rest of that same page is well-covered. Additionally, this audit independently found `components/PassagePlayer.tsx` (the Voice Reading feature, §2 item 8) has **zero `dark:` classes anywhere** — used inside `/english/[id]` and the adaptive English route, so the voice-reading control bar will also look wrong in dark mode.

**Mobile:** solid — no fixed-width overflow risk found, everything is `max-w-*` constrained.

**iPad/Tablet:** only 12 of 59 files use `md:` at all, almost entirely for padding scale-up or the sidebar/bottom-nav swap — not genuine tablet-specific layout. Two real exceptions exist (Writing's side panel, Progress's grid). Otherwise the app is effectively two states (narrow mobile, same-narrow-but-centered desktop) with no dedicated ~768–1024px tablet design.

---

## SECTION 6 — Production Audit

### Required (blocking public launch)
- Apply migrations 004–007 to production Supabase (`ALI_PRODUCTION_ACTIVATION_CHECKLIST.md` is ready to execute).
- Complete hand-tagging and seeding for all 4 ALI subjects, or — if ALI isn't part of the initial public launch — clearly scope the launch to the legacy static content only, which is functionally complete and closer to ready.
- Fix `READINESS_CONFIG`'s missing dark-mode styling (a live, visible defect on the Parent Hub's headline card).
- Secure or remove Admin Beta — a hardcoded, client-bundle-visible PIN and per-device-only data are not acceptable for a real admin surface once multiple beta families are live.
- Decide the fate of `app/mock-test/page.tsx` — currently orphaned, no dark mode, appears superseded by `app/mocks/[pathway]/page.tsx`. Either link it, fix it, or remove it — leaving it as-is is the worst option.
- Update `DEPLOYMENT.md` and `PROJECT_CONTEXT.md`, both of which predate ALI entirely and would mislead anyone deploying or onboarding from them today.
- Investigate/resolve the `AGENTS.md` prompt-injection artifact.

### Recommended (should happen soon, not launch-blocking)
- Move Feedback/Bug Reports/Feature Requests/Testimonials/Beta Applications off localStorage-only persistence — Admin Beta structurally cannot see submissions from other devices as currently built.
- Fix the reasoning-subject icon mismatch between the Parent Hub and the rest of the app.
- Fix the Maths/Vocabulary adaptive-route colour mismatch (using pathway colours instead of each subject's own brand colour).
- Give `/parent` the shared `PageLayout`/sidebar, or make the standalone shell a deliberate, documented exception.
- Add a discoverable path (even a low-key one) to `/beta`, `/beta-family`, `/report-bug`, `/feature-request` if these are meant to be found without a direct link from marketing.
- Delete the 3 confirmed-dead files (`lib/mockArchitecture.ts`, `components/XPBar.tsx`, `components/DailyMission.tsx`).
- Extract the undocumented `formatTime()` duplication into a shared util.
- Make `fetchQuestionBank()`'s error path distinguishable from its empty-table path for monitoring purposes.
- Basic release hygiene: bump `package.json`'s version, add a `CHANGELOG.md`, tag milestones in git.
- Add the missing Vocabulary section to `ALI_HAND_TAGGING_WORKFLOW.md`.

### Future (post-launch, not needed now)
- Surface Cross-Subject Recommendations and/or Learning Profiles in a real UI — both are built and tested, internal-only by deliberate design.
- Migrate confidence/replay/readiness to read ALI data directly, retiring the localStorage bridge.
- Writing as a 5th ALI subject.
- Improve Reading Comprehension's grading (currently a keyword heuristic; the Writing feedback route already proves an LLM-based pattern is available).
- Real tablet-specific layout work.
- Subscriptions, payments, App Store packaging — explicitly out of scope per the product's own (uncommitted) roadmap doc and this audit's own instructions.

---

## SECTION 7 — Technical Debt

**Critical**
1. `READINESS_CONFIG` (`lib/parentInsights.ts`) has zero dark-mode variants — a live, visible defect on the Parent Hub's most prominent card, not a hypothetical.
2. `AGENTS.md` prompt-injection artifact present in the repo root, auto-loaded into every AI coding session working on this project.

**High**
3. Admin Beta is secured only by a client-bundle-visible hardcoded PIN, with per-device-only data — cannot function as a real multi-family admin tool as built.
4. ALI's production data is 100% synthetic across all 4 subjects; the schema migrations that would let real content exist have never been applied to production.
5. `fetchQuestionBank()` cannot distinguish a genuinely empty table from a failed query — a real outage would look identical to "not seeded yet."
6. `DEPLOYMENT.md` and `PROJECT_CONTEXT.md` are both significantly stale (neither mentions ALI at all) — a real risk for anyone using them to deploy or onboard today.

**Medium**
7. Icon mismatch for reasoning subjects between the Parent Hub and the rest of the app.
8. Colour-system mismatch for 2 of 4 adaptive routes vs. their own subject's established brand colour.
9. Several real, working routes have no discoverable in-app path (`/mock-test`, `/beta`, `/beta-family`, `/admin-beta`, `/report-bug`, `/feature-request`, all 4 adaptive routes).
10. Three confirmed-dead files (`lib/mockArchitecture.ts`, `components/XPBar.tsx`, `components/DailyMission.tsx`).
11. `/parent` doesn't use the shared `PageLayout`, breaking sidebar continuity for a primary nav destination.
12. `ADAPTIVE_ASSESSMENT_ENGINE_ARCHITECTURE.md`'s stale "DRAFT, no code written" header actively contradicts the real, current state of the codebase.
13. `ALI_HAND_TAGGING_WORKFLOW.md` is missing its Vocabulary section.
14. `components/PassagePlayer.tsx` (Voice Reading) has zero dark-mode classes.

**Low**
15. `formatTime()` duplicated without a "by design" comment between two adaptive routes (contrast with the deliberate, documented duplication elsewhere).
16. No `CHANGELOG.md`, no git tags, `package.json` version frozen at `0.1.0` despite substantial growth.
17. No real tablet-specific (~768–1024px) layout, beyond two isolated exceptions.

---

## SECTION 8 — Commercial Readiness

**Student Experience:** Genuinely strong at the core — real content across 8 subjects/reasoning types, a real (if optional) voice-reading feature that's easy to miss in a feature list but meaningfully differentiating, gamification (XP/streaks/badges), and a working offline PWA. The visible seam between the older static pages and the newer, bolder ALI adaptive routes is a real but minor polish gap, not a functional one.

**Parent Experience:** Substantial and data-rich (readiness, competency breakdowns, mock history, focus areas) — undermined by two concrete, fixable issues: the dark-mode-broken Readiness card sitting at the top of the page, and the loss of navigation context when arriving from the sidebar.

**Differentiation:** The ALI architecture (competency-level mastery tracking, cross-subject reasoning, Learning Units) is a genuinely sophisticated foundation relative to typical exam-prep apps in this space, once it reaches real data — but *right now*, with zero real content seeded, none of that sophistication is customer-visible. The differentiation exists in the codebase, not yet in the product a family would experience today.

**Competitive Position:** Broad subject coverage (English/Maths/Vocabulary/Writing/4 reasoning types) plus AI-assisted writing feedback plus voice reading is a wide feature set for this market segment. The main gap versus a mature competitor isn't missing features — it's operational (unseeded adaptive content, an insecure admin tool, some real bugs) rather than a fundamentally weaker product concept.

**Trust:** COPPA/UK-GDPR-aware privacy and terms pages exist and are substantial, not placeholders — a real trust foundation. This is undercut somewhat by the Admin Beta security gap (a hardcoded PIN visible in shipped JS is the kind of thing that reads badly in any security review) and by the currently-inert ALI system, since any "adaptive/AI-powered" marketing claim would currently be describing architecture, not live behaviour.

**Onboarding:** `/getting-started`, `/beta`, and the "continue without signing in" pattern together form a genuinely low-friction entry — a family can be using the product within seconds, which matches the product's own stated design principle ("It feels premium within 5 seconds").

**Retention:** Daily Missions, streaks, badges, and Parent Insights are all real, working retention mechanisms — the ingredients are present. Whether they retain families in practice is untested; `BETA_SUCCESS_CRITERIA.md`'s own retention targets (e.g. "≥4 of 10 families still active after 4 weeks") have not yet been evaluated against real usage, per that document's own unchecked checkboxes.

**Launch Readiness:** Split verdict, precisely: the **legacy static platform** (everything except ALI's adaptive routes) is close to genuinely launch-ready, modulo the Critical/High items in §7. The **ALI adaptive layer**, while architecturally excellent, is not launch-ready in the sense of being real yet — it needs the production activation sequence (§6) before it can be part of what a real family experiences.

---

## SECTION 9 — Final Score (out of 100)

| Dimension | Score | Rationale |
|---|---|---|
| **Architecture** | 82 | Four subjects proven to reuse one shared adaptive core with zero changes to the shared engine (a real, falsifiable claim, re-verified this session) is a genuinely strong architectural result. Docked for: one stale, misleading architecture doc; the fetchQuestionBank error/empty ambiguity; and three small dead-code leftovers. Not higher because none of this sophistication has yet been proven against a real database. |
| **UX** | 68 | Design system is real and mostly consistently applied (spacing, icons for core subjects, navigation structure). Docked meaningfully for: the live dark-mode defect on the Parent Hub's headline card, the icon/colour inconsistencies for reasoning subjects and 2 of 4 adaptive routes, the Parent Hub's lost sidebar, and several real routes with no discoverable path. These are the kind of issues a careful design pass fixes in days, not months — but they are real, currently live. |
| **Engineering** | 80 | Clean build, zero TypeScript errors, disciplined migration hygiene (every migration additive, none superseding another), a consistent and well-documented isolation pattern for adaptive-route duplication, and genuinely no dead-code sprawl beyond 3 small files. Docked for the Admin Beta security gap (hardcoded client-visible PIN) and the localStorage-only persistence for all user-submitted feedback data, which is a real architectural gap for a multi-user admin tool. |
| **Performance** | 75 | Not load-tested as part of this audit (out of scope — no performance profiling was run), so this score reflects structural signals only: static generation for 30 of 33 pages, a real hand-written service worker for offline caching, and no obviously expensive client-side computation found during this review. Held back from higher purely because no real performance measurement (Lighthouse, real-user monitoring, load testing) was found anywhere in the repo to substantiate a higher score. |
| **Scalability** | 70 | The Supabase schema and ALI's subject-agnostic module design should scale content and subjects well (proven 4 times over already). The real constraint is operational, not architectural: localStorage-only admin/feedback data does not scale past single-device testing, and ALI's entire content layer is currently zero real rows — scalability of *content operations* (hand-tagging, seeding) is unproven at any real volume yet. |
| **Commercial Readiness** | 62 | Wide feature coverage and a low-friction onboarding pattern are real strengths. Scored moderately, not higher, because: the product's own documentation disagrees about what stage it's in (§1), the most differentiating layer (ALI) is not yet live for any real user, and a genuine security-relevant defect (Admin Beta) exists in a feature meant to support real beta operations. |
| **Overall** | **73** | A weighted read across the six dimensions above: strong foundations (architecture, engineering) pulled down by real, concrete, fixable operational and polish gaps (UX bugs, admin security, stale docs, unseeded ALI content) rather than by any structural flaw in the product concept or codebase design. |

---

## SECTION 10 — Executive Recommendation

# **Needs Minor Work**

**For the legacy static platform** (Dashboard, English, Maths, Vocabulary, Writing, all 4 Reasoning types, Voice Reading, Parent Dashboard, Pathways, PWA, and all support/beta-operations pages) — this verdict is well-supported: the build is clean, the feature set is broad and real, and the outstanding issues (§7 Critical/High items 1, 3, 5, 6) are each independently small, well-understood, and fixable in days, not months, by a team that already has this level of documentation discipline.

**For the ALI adaptive layer specifically** — this verdict comes with an explicit caveat, not a qualification to bury: ALI is architecturally sound and internally well-validated (44 documented decisions, pure-function test coverage at every phase, a real four-times-repeated proof that new subjects don't require shared-engine changes) — but it is currently **inert in production**, running entirely on synthetic fixtures with zero real content seeded and its own migrations unapplied. If the beta/public launch is meant to include ALI's adaptive experience as advertised, that specific piece needs the full production-activation sequence (§6 Required) completed first — a scoped, already-documented, but real and non-trivial piece of remaining work (hand-tagging 94 real items across 4 subjects, then seeding, then live validation).

**Practical read:** ship the static platform once the Critical/High fixes in §7 are addressed; treat ALI's production activation as its own gate, tracked and completed on its own timeline rather than assumed to already be part of "launch-ready."
