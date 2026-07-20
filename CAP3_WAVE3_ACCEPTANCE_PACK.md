# Capability 3 — Learning Platform, Wave 3: Learner & Parent Intelligence

**Acceptance Pack**

**Angel 11+, Version 3.0 Academic Excellence Programme**
**Capability:** 3 — Learning Platform, Wave 3 (Learner & Parent Intelligence)
**Status:** Implemented and verified as far as this session's environment allows. Zero new educational models introduced — every displayed value traces to Wave 1's already-computed `LearnerIntelligenceProfile` or to raw, already-stored timestamps.

---

## 1. Implementation Summary

Wave 3 is explicitly a **consumption wave** ("Do not create new educational models. Consume only existing educational intelligence.") — every feature below either reuses Wave 1's existing computed profile directly, or reads raw already-stored facts (timestamps, last-attempt outcomes) with zero new interpretation layered on top.

**1. Enhanced Learner Dashboard** (`app/learning-intelligence/page.tsx`, extended) — 5 of 6 required sections already existed from Wave 1 (Competency Profile, Evidence Profile, Diagnostic Overview, Readiness, Recommendations); "Coverage gaps" is served by Diagnostic Overview's existing "Not Yet Evidenced" list (its section header renamed to make this explicit, not duplicated into a new component). The one genuinely new section is **Recent Learning Activity**, added via a new `lib/learningEngine/activity.ts` + `components/learningEngine/RecentActivity.tsx`.

**2. Parent Dashboard** (`app/learning-intelligence/parent/page.tsx`, new route) — a separate, Assessment-Brain-driven view, distinct from the existing legacy ALI-era `/parent` hub (different taxonomy). Built per `LEARNING_ENGINE_V1.md` §8's explicit parent-facing-language rule: two new components (`CompetencySummary`, `EvidenceComposition`) present the identical underlying data as the learner dashboard but grouped by Assessment Component with competency **names only** — never a raw Competency ID, Question Type ID, or Evidence Tier code. `ReadinessSummary` (Wave 1's own component) is reused unchanged since it was already parent-safe. A one-line link was added from the existing legacy `/parent` page to this new dashboard — no other change to that page.

**3. Recommendation Centre** (`app/learning-intelligence/recommendations/page.tsx`, new route) — pure display of `profile.recommendations` via Wave 1's own `RecommendationSummary` component, unchanged. Zero new recommendation logic, per the mission's explicit rule.

**4. Progress Timeline** (`app/learning-intelligence/timeline/page.tsx`, new route) — a real, chronological activity log (every recorded attempt, newest first, up to 50), reusing `activity.ts`/`RecentActivity` with no new calculation. **Deliberately not a tier-over-time trend graph** — see Section 3 for why.

**New data-layer module — `lib/learningEngine/activity.ts`:** `fetchRecentActivity()` reads `ali_student_question_history`'s already-existing `updated_at`/`last_attempt_correct`/`times_seen` columns (written by Wave 2's `recordOutcome()`, unmodified), joined against `ali_question_bank` for the Question Type → Competency name, sorted newest-first. No scoring, no tier computation — purely descriptive.

**Why "Evidence Growth" is not a trend line:** `LEARNING_ENGINE_V1.md` §3.6 (Historical Progress) explicitly requires point-in-time snapshots of computed Evidence Tier/Signal to show real change over time — no persistence mechanism for this exists (flagged in Wave 1 §10(1), reaffirmed by Wave 2's Recommendation Model comment on why "Review" is never emitted). Building a growth/trend claim without real historical snapshots would be exactly the "unsupported educational claim" this Wave's mission forbids. Instead, `EvidenceComposition` shows the honest current-moment distribution of competencies across evidence tiers, with an explicit in-UI disclosure that this is a snapshot, not a trend.

## 2. Verification Results

- **TypeScript:** `npx tsc --noEmit` — clean after every file added.
- **Build:** `npm run build` — clean, 43/43 routes generated (up from 40 after Wave 2), all four new/extended routes registered correctly (`/learning-intelligence`, `/learning-intelligence/parent`, `/learning-intelligence/recommendations`, `/learning-intelligence/timeline`, all static).
- **Lint:** repo-wide `npx eslint .` — 61 problems (50 errors, 11 warnings), up from Wave 1's baseline of 59. The delta is **exactly one new instance of an already-established pre-existing pattern** (`react-hooks/set-state-in-effect` on the new `timeline/page.tsx`, identical to the same rule already flagged on `/learning-intelligence`, `/dashboard`, `/parent`, and Wave 2's `[area]/page.tsx` — confirmed by direct comparison, not assumed) — not a new defect class.
- **Incidental finding, disclosed not fixed** (out of Wave 3's scope): while building a realistic browser test, found that `lib/progress.ts`'s `getProgress()` does not defensively merge partial/malformed `localStorage` data with `defaultProgress` — it only falls back to defaults when the key is **entirely absent**, not when present-but-incomplete. This surfaced as a real crash in the **legacy, pre-existing** `/parent` page's `buildSubjectAnalytics()` (`lib/analytics.ts`, unrelated to this Wave) when tested against a deliberately minimal `localStorage` object. Confirmed this state is **not reachable through normal app usage** — every real code path that writes to this key (including this Wave's own reads) always does so by spreading a previously-complete object, so `localStorage` in practice is always either absent or complete. Test harness corrected to seed a realistic object; the underlying fragility itself is real but low-risk, and is a `lib/progress.ts`/`lib/analytics.ts` concern, not a Learning Engine one — noted for the Founder (Section 5), not fixed here.
- **Runtime — live browser verification:** Claude-in-Chrome unavailable again; same Playwright/Chromium fallback as Waves 1-2, with a stateful mocked backend seeded with 6 realistic history rows spanning different competencies, tiers, and timestamps (1h to 50h old). All four pages (`/learning-intelligence`, `/learning-intelligence/parent`, `/learning-intelligence/recommendations`, `/learning-intelligence/timeline`) plus the legacy `/parent` page (to confirm no regression from its one-line edit) loaded with **zero console errors or warnings**. Recent Activity/Progress Timeline correctly sorted newest-first across all six seeded items on every page that shows it. Parent Dashboard confirmed to show **zero raw codes anywhere** (no "RC-01", "QT-RC-03", "ET-3" visible) — spot-checked against the learner dashboard's own screenshot, which correctly still shows them.
- **Mobile responsive:** confirmed at 390px on the Parent Dashboard. One apparent bottom-nav/content overlap in the first full-page screenshot was investigated rather than assumed real — a second, targeted non-full-page screenshot scrolled to the same section showed clean layout with no overlap, confirming the first was a Playwright `fullPage: true` compositing artifact with `position: fixed` elements (a known tool limitation), not a real rendering defect.

## 3. Educational Verification

**Zero new competencies, Question Types, or scoring rules were introduced.** Every value on every Wave 3 page traces to one of exactly two sources:

1. **Wave 1's `LearnerIntelligenceProfile`** (`competencies`, `diagnostics`, `readiness`, `recommendations`) — read-only, unchanged, same `fetchLearnerIntelligenceProfile()` call as Wave 1/2.
2. **Raw stored facts already written by Wave 2's `recordOutcome()`/`recordPresentation()`** (`times_seen`, `last_attempt_correct`, `updated_at`) — read via the new `fetchRecentActivity()`, which performs no scoring or tier computation of its own; it only joins and sorts.

**Explicit boundary respected — "Evidence Growth" vs. "Recent Activity"/"Progress Timeline":** these are NOT the same claim, and Wave 3 deliberately does not conflate them. A raw activity log (what was attempted, when) is fully supported by real stored timestamps. A genuine trend claim (how a competency's standing changed over time) is not, absent Historical Progress persistence (`LEARNING_ENGINE_V1.md` §3.6) — this gap was already known from Wave 1 and is unchanged by this Wave; Wave 3 works within it rather than papering over it with an invented approximation.

**Parent-facing language rule (`LEARNING_ENGINE_V1.md` §8) applied deliberately, not by accident:** the Parent Dashboard's `CompetencySummary` and `RecentActivity`'s `plainLanguage` mode were purpose-built to omit raw Competency/Question-Type/Tier codes, which the learner-facing dashboard (by Wave 1's own original design) does show. This is the first Wave where that §8 rule is actually enforced in code, not just documented as a future requirement.

**Platform Recovery:** checked for a "Platform Recovery" work stream this session (per the mission's own instruction) — none found (no matching document, no change in production RLS/table state versus the last check). Proceeded with the existing fallback verification approach (mocked-network Playwright), per the mission's explicit instruction not to let this block Wave 3.

## 4. Known Limitations

1. **Nothing in this Wave can be verified against real production data — same category of blocker as every prior Wave, unchanged.** Fresh live tests this session confirm `ali_question_bank`/`ali_student_question_history` still don't exist as tables, and `profiles` INSERT is still RLS-blocked, exactly as found in Wave 1/2 and PR-001. No new infrastructure work was attempted this Wave (out of scope — Wave 3's mission is display-only).
2. **"Evidence Growth" is a snapshot, not a trend** (Section 1/3) — by design, disclosed in-UI, not a placeholder for a future feature silently mislabelled as done.
3. **The `getProgress()` partial-data fragility** (Section 2) is real but not reachable through normal usage — flagged for the Founder as a low-priority defensive-coding item, not fixed in this Wave (out of Learning Engine scope).
4. **Recent Activity/Progress Timeline currently show only Question Types with real content** (i.e., only what Wave 2's migration 013 tagged) — competencies with zero mapped content (RC-04, WC-02, MR-06, per Wave 1/2's own disclosed coverage gaps) will never appear here, which is correct/honest behaviour, not a bug.
5. **Full interactive verification with a real signed-in account and real persisted history was not possible** — same constraint as every prior Wave, for the same reason (no production database access from this account).

## 5. Founder Actions

1. **Same as Wave 2's Founder Actions 1-2** — apply migrations 004→013, and resolve the `profiles`/`user_stats`/`lesson_progress` RLS question — unchanged, not re-litigated here.
2. **Decide whether the `getProgress()` partial-data fragility (Section 2) is worth a defensive fix** — low priority given it's unreachable through normal usage, but a real gap if `localStorage` is ever manipulated directly (devtools, corruption, or a future direct write elsewhere).
3. **Review the Parent Dashboard's plain-language framing** (Section 3) against real parent expectations once real learner data exists — this was built directly from `LEARNING_ENGINE_V1.md` §8's own rules, but has not been seen by an actual parent yet.
4. **Confirm "Evidence Composition" is an acceptable interim answer to the mission's "Evidence growth" requirement** — it is the honest, currently-supportable version of that feature, not the originally-imagined one; a real trend view remains a future Historical Progress work package.

## 6. Acceptance Recommendation

**The code is ready and genuinely verified working end-to-end; the production environment remains the unchanged blocker from every prior Wave.** All four required features (Enhanced Learner Dashboard, Parent Dashboard, Recommendation Centre, Progress Timeline) were built and demonstrated live with zero console errors, using only Wave 1's existing computed intelligence and raw, already-stored data — no new educational model, competency, Question Type, or scoring rule was introduced anywhere. The one deliberate reinterpretation (Evidence Growth → Evidence Composition) is disclosed prominently, not silently substituted. TypeScript, build, and lint are clean modulo one new instance of an already-established pre-existing pattern; the one incidental legacy-code finding (Section 2) is real but low-risk and out of this Wave's scope.

Recommend the same NOT-deploy posture as Waves 1-2, for the same unchanged infrastructure reason. Recommend Section 5's Founder Actions go forward alongside Wave 2's still-open ones as one combined decision list.

Per the mission: committed locally, pushed to GitHub, **not deployed** — awaiting independent programme review.
