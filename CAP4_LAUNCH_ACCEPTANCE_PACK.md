# Capability 3 — Learning Platform, Wave 4: Product Experience & Launch Readiness

**Launch Acceptance Pack**

**Angel Version 1.0 — Final capability before production launch**
**Status:** Substantial real progress across all six mission areas. **Recommend NOT launching yet** — see Section 8. This is not a rubber stamp: several items below are genuinely, honestly incomplete or blocked, not glossed over.

---

## 1. Implementation Summary

**Product Experience Standard V1** (`PRODUCT_EXPERIENCE_STANDARD_V1.md`) — written as a consolidation of the three existing, mutually-agreeing design documents already governing this product (`DESIGN_SYSTEM.md`, `ANGEL_DESIGN_LANGUAGE.md`, `AXT-003_ANGEL_DESIGN_SYSTEM_V2.md`), mirroring how Assessment Brain V1 consolidated AEP-002/003/004. Two explicit, logged corrections were required by this Wave's own mission text, both of which reverse a previously-approved, documented direction — disclosed as corrections, not silent rewrites:
- **Gradients removed entirely**, including the previously-mandated Hero/Premium card gradient (3 declarations total in the whole codebase — genuinely small).
- **XP/Level/Streak UI removed** from every learner- and parent-facing screen this audit found (~10 screens, ~15 distinct instances) — reversing a prior "reposition, never remove" direction. Underlying data/computation is deliberately kept (Daily Mission urgency scoring, weekly-goal logic still depend on it) — only the visible number/badge is gone.

**CSSE Mock Exam** (`app/learning-intelligence/mock-exam/page.tsx`, new route) — a genuine, timed, exam-condition experience covering every currently-tagged CSSE activity (Reading Comprehension + Mathematics + Continuous Writing) in one sitting, with no per-question feedback until final submission — a real behavioural difference from Wave 2's Practice Experience, not a re-skin. Reuses Wave 2's real graders and Wave 1's real evidence-recording/profile-refresh pipeline unchanged.

**Platform Recovery** (`supabase/migrations/014_platform_recovery_user_stats_lesson_progress_rls.sql`) — extends PR-001's exact reasoning to the two tables `RESTORE_PRODUCTION_VALIDATION.md` (2026-07-03) already flagged as needing the identical correction.

**Founder Operations** — one real, scoped addition to the already-substantial `/admin-beta` surface: a "Learning Engine Coverage" panel showing real, cross-device Question Type authoring progress, gracefully reporting the honest "table doesn't exist yet" state rather than erroring.

**Launch Readiness** — full regression pass (below), an 18-route live smoke test, and this Pack's honest checklist (Section 8).

## 2. Verification Results

- **TypeScript:** clean throughout, checked after every change.
- **Build:** `npm run build` — clean, all routes generate correctly (43 → 44 with the new mock-exam route).
- **Lint:** repo-wide `npx eslint .` — **60 problems (49 errors, 11 warnings), down from Wave 3's 61** — a net improvement, not a regression. The reduction comes from real dead-code removal (unused XP-tracking state/imports); no new defect classes were introduced.
- **Regression smoke test:** all 18 key routes (Dashboard, Progress, Parent Hub, Vocabulary, Maths, English, Writing, the full Learning Intelligence family including the new Mock Exam, Mocks, Mock Test, Reasoning, Pathways, Learn) loaded with **zero console errors** under a fresh, realistic mocked session.
- **Mock Exam live verification:** full run (English → Maths → Writing → Submit) completed live via Playwright with a stateful mocked backend — timer counts down correctly, no premature feedback, all three answers graded correctly on submission (3/3 correct), Competency Profile/Readiness/Recommendations all updated correctly and matched hand-checked expected output.
- **Keyboard/focus spot-check:** tabbed through 25 elements on `/learning-intelligence/practice` — every interactive element (nav, search, practice cards, footer links) received a visible focus outline in a logical order. This is a **spot-check on one page, not an exhaustive audit** — `AXT-003` §8/§21 already self-identifies visible-focus/keyboard-nav as a product-wide gap never independently verified; this session's one positive spot-check does not close that gap, it just didn't find a problem where it looked.

## 3. Educational Verification

**No new educational model, competency, Question Type, or recommendation logic was introduced anywhere in this Wave**, per its own explicit rule. The Mock Exam reuses Wave 2's real graders (`checkMathsAnswer`, `scoreEnglishAnswer`, the `WRITING_CORRECTNESS_THRESHOLD` reused from the existing LLM grader's own band language) and Wave 1's real evidence pipeline (`recordOutcome`, `fetchLearnerIntelligenceProfile`) completely unchanged — the only genuinely new logic is the timer/submission-sequencing UX itself, which is presentation, not education. All findings from Waves 1-3 (AR-01's collapsed EMC split, WC-02's permanent ET-0 lock, single-Question-Type tier-skip ambiguity, Vocabulary's formal block) are unchanged and still apply identically inside the Mock Exam, since it draws on the same underlying model.

## 4. Product Experience Verification

Full detail and reasoning for every judgement call in `PRODUCT_EXPERIENCE_STANDARD_V1.md` §4 (Corrections Log). Summary of what was actually verified, not just written:

- **Gradients**: confirmed via repo-wide grep, zero `bg-gradient-to-*` declarations remain outside this document's own changelog text.
- **XP/Level/Streak UI**: confirmed removed from Dashboard's Hero card, Progress's Level card + XP Milestone bar + Day Streak tile, Parent Hub's Current Streak/XP stat tiles + This Week summary + Rank line, Getting Started's promotional copy, and all 9 "+X XP earned" results-screen pills across the legacy and adaptive mock/practice pages — verified by re-grepping after the edits (zero remaining matches) and by a full regression smoke test (Section 2) confirming no page broke as a result.
- **One primary CTA per page**: fixed a genuine dual-CTA violation found live on Dashboard (both "Start Today's Mission" and "Continue" were solid-purple) — "Continue" demoted to secondary styling. This was found by *looking at a real screenshot*, not by inspecting code — a reminder that some Product Experience violations are only visible once rendered.
- **Sentence case**: refined mid-Wave against a real, pre-existing pattern this audit found — the live nav already Title-Cases named features/pages ("Parent Hub", "Mock Centre", "Learning Intelligence"), so that convention was kept rather than overridden; the new rule was applied to body copy and button/CTA text instead, where the app's existing copy was genuinely inconsistent (fixed on the pages this Wave directly touched: "Start Practice" → "Start practice", "Try Again" → "Try again", "Submit for Feedback" → "Submit for feedback", "See Updated Profile" → "See updated profile", "Practice Complete" → "Practice complete").
- **NOT independently re-verified on every one of the app's ~40 routes** — this is an honest scope limitation (Section 6), not a claim of blanket completion.
- **Achievement/Badge system deliberately left untouched**, flagged not fixed: `lib/gamification.ts`'s `BADGE_DEFINITIONS` includes 3 streak-named badges ("3-Day Streak", "Week Warrior", "Fortnight Focus") and 3 badges whose description text literally states an XP threshold ("Earned 100/500/1,000 XP"). This is a separate, distinct gamification mechanic from the raw number/label displays this Wave's mission named — reworking the badge taxonomy itself is a larger design decision than removing a number, so it was left for a Founder decision (Section 7) rather than acted on unilaterally.

## 5. Platform Recovery Verification

Fresh live tests against production, run at the time of writing this Pack:

| Table | Anonymous INSERT result |
|---|---|
| `profiles` | `401` — RLS violation (unchanged since PR-001; migration 012 not yet applied) |
| `user_stats` | `401` — RLS violation (new finding, Wave 2; confirmed still true) |
| `lesson_progress` | `401` — RLS violation (new finding, Wave 2; confirmed still true) |
| `ali_question_bank` | Table does not exist (migrations 004-013 not yet applied) |

Migration `014` is written to extend PR-001's exact policy shape to `user_stats`/`lesson_progress`, for the same reasons documented there (a device-scoped policy would be inoperable without a session-variable pass-through this codebase doesn't implement; both tables' data is no more sensitive than `profiles`, already effectively open wherever RLS permits any access). **Not applied** — same access constraint as every migration since 004 (this account's Supabase tooling cannot reach this project's database). A separate, earlier fix attempt for `profiles` alone (`RESTORE_PRODUCTION_VALIDATION.md`, 2026-07-03: disable RLS outright) was validated working end-to-end and has since silently reverted — this migration deliberately takes the policy-based approach instead, on the reasoning that it may be more resistant to whatever keeps re-enabling RLS, though this is flagged as a Founder decision (Section 7), not asserted as certain.

## 6. Known Limitations

1. **Every table this platform depends on is currently unreachable for anonymous writes in production** — `profiles`, `user_stats`, `lesson_progress` (RLS-blocked) and `ali_question_bank`/`ali_student_question_history` (don't exist). This is the same category of blocker carried forward from every prior Wave, now fully catalogued in one place (Section 5) rather than discovered piecemeal.
2. **Product Experience Standard V1 was applied thoroughly to the pages this Wave touched, and to the two most mechanical, most completely-auditable corrections (gradients, XP/Level/Streak) across the whole app — but was not independently re-verified page-by-page against every remaining requirement (approved colour tokens, one-CTA, premium card styling, calm tone) on all ~40 routes.** This would be a genuinely large, separate audit; doing it superficially would be worse than disclosing it honestly as not yet done.
3. **The Achievement/Badge system's 3 streak-named and 3 XP-valued badges were not reworked** (Section 4) — a real, bounded, disclosed gap, not an oversight.
4. **The Mock Exam's per-question time budget is the sum of each activity's `estimated_time_seconds`** (from migration 013's real metadata) rather than a fixed real CSSE exam duration — since only 18 illustrative questions exist today (not a full paper), a real 70+60-minute timer would be misleading; this is disclosed in the exam's own intro copy rather than silently scaled.
5. **Keyboard/focus verification is a spot-check on one page**, not the product-wide audit `AXT-003` itself says has never been done (Section 2).
6. **Full interactive verification with a real signed-in account and real persisted production data was not possible** — same constraint as every prior Wave.

## 7. Founder Actions

1. **Apply migrations 004→014 in order**, via the Supabase Dashboard SQL Editor.
2. **Resolve the RLS approach as one decision covering all three tables** (`profiles`/`user_stats`/`lesson_progress`) — policy-based (migrations 012 + 014) vs. disable-RLS (already tried once for `profiles` alone, already reverted once) — carried forward from Wave 2/3, now fully consolidated here.
3. **Decide whether the Achievement/Badge system's streak/XP-named badges should also be reworked** under Product Experience Standard V1, or are acceptable as a distinct mechanic.
4. **Decide whether the remaining ~40-route Product Experience audit should happen before launch or after**, given the two most impactful, most mechanical corrections (gradients, XP/Level/Streak) are already complete.
5. **Commission a real, product-wide accessibility audit** (keyboard navigation, screen reader behaviour) before launch if that bar matters for V1 — this session's spot-check is encouraging but not sufficient evidence either way.
6. **Decide the Mock Exam's real-vs-illustrative timing question** once real hand-tagged CSSE content exists at full-paper scale (Section 6, item 4).

## 8. Launch Recommendation

**Recommend NOT deploying Version 1 yet.** The reason is unchanged from every prior Wave and is now fully consolidated: this platform's entire Supabase-backed persistence layer — anonymous profile creation, XP/streak sync, lesson history, and the entire Learning Engine evidence/content layer — is currently non-functional in production, for infrastructure reasons entirely outside this session's ability to fix (no database write access from this account). Shipping today would mean shipping a visually-calmer, better-organised product that still cannot record a single real learner's progress.

**What genuinely is ready:** the Product Experience corrections (gradients, XP/Level/Streak removal) are complete, verified, and regression-tested clean across 18 routes. The CSSE Mock Exam is a real, working, verified feature. The Platform Recovery migration is written and reasoned soundly, awaiting application. The Founder Operations addition gives real, honest visibility into deployment state. None of this needs further engineering work to be launch-ready *once the infrastructure blockers are resolved* — the two are genuinely separable, and the Founder should read this Pack as "the code is ready; the database is not," not as a blanket "not ready."

**Recommended launch sequence:** (1) Founder resolves Section 7's RLS decision and applies migrations 004-014; (2) this account re-verifies all Section 5 checks pass against live production; (3) Founder decides on Section 7's remaining open product decisions (badges, full audit timing); (4) launch.

Per the mission: committed locally, pushed to GitHub, **not deployed** — awaiting independent programme review.
