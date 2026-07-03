# ALI Live Validation Protocol

**Purpose:** The re-validation `ALI_VALIDATION_PROTOCOL.md` (Phase 1.1) has flagged as outstanding since 2026-07-02 — every prior ALI phase's validation was a pure-function simulation in this sandbox (`npx tsx` scripts, in-memory Maps standing in for Supabase), because this sandbox has never had outbound network access to this project's Supabase instance. This document is what to actually run, by hand, in the real app, once migrations 004–007 are applied (`ALI_PRODUCTION_ACTIVATION_CHECKLIST.md`) and real content is seeded (`ALI_SEEDING_PLAN.md`) — for all three ALI-covered subjects, not just the one Phase 1.1 originally covered.

**How to read this document:** each scenario states what it proves, exact steps, the SQL to confirm it, and what a pass looks like — same format as `ALI_VALIDATION_PROTOCOL.md`, extended to three subjects and to the two structural additions since Phase 1.1 (Learning Units, and the checks explicitly requested for this activation phase: history rows written, adaptive state rows updated).

**Precondition:** at least one subject has real seeded content (`ali_question_bank` has rows, per `ALI_SEEDING_PLAN.md` §4.1) — running these scenarios against an all-synthetic-fixture state would just re-prove what the pure-function scripts already proved, not close the real gap.

---

## Scenario A — Adaptive GL Verbal Reasoning, live

**Proves:** `app/mocks/adaptive/gl/page.tsx` correctly reads real `ali_question_bank` rows (not the synthetic fixture) and writes real `ali_student_question_history` / `ali_student_adaptive_state` rows.

**Steps:**
1. As a test profile, complete one adaptive VR mock.
2. Confirm no "sample practice data" banner appeared (`ALI_SEEDING_PLAN.md` §4.4).
3. Complete a second mock immediately after.

**SQL:**
```sql
select question_id, times_seen, times_correct, mastery_state, last_presented_at_sequence
from public.ali_student_question_history
where profile_id = '<test profile id>'
order by last_presented_at_sequence desc;

select questions_presented_count from public.ali_student_adaptive_state
where profile_id = '<test profile id>';
```

**Pass:** history rows exist for every question presented in both mocks; `questions_presented_count` increased by exactly each mock's question count; zero question-id overlap between mock 1 and mock 2's presented sets (Decision 11 — absolute exclusion).

---

## Scenario B — Adaptive Mathematics, live

**Proves:** the same as Scenario A, for `app/mocks/adaptive/maths/page.tsx` — confirms the "zero shared-code changes" claim (Decision 32/35) holds against real data, not just simulation.

**Steps and SQL:** identical to Scenario A, substituting the Maths route and filtering `ali_student_question_history`/`ali_question_bank` joins by `subject = 'maths'`.

**Pass:** same criteria as Scenario A.

---

## Scenario C — Adaptive Reading Comprehension, live (the new one this phase closes)

**Proves:** `app/mocks/adaptive/english/page.tsx`'s Learning Unit selection (Decision 36) behaves correctly against real seeded passages — a passage is chosen and served whole, never split, and its questions correctly share one `learning_unit_id` in the real bank.

**Steps:**
1. As a test profile, complete one adaptive Reading Comprehension mock. Note the passage title shown and every question answered.
2. Confirm every question answered belongs to the same passage (no mixing across passages within one mock — this is the one behaviour with no VR/Maths equivalent to compare against).
3. Complete a second mock immediately after. Confirm a different passage is served (or, if the bank has too few passages relative to real usage, confirm the correct fallback/cooldown behaviour rather than an outright repeat of the *same* passage from mock 1 — see Known Gap 5 in `ALI_VERSION.md`, which already flags this as a real, expected limitation until more passages exist).

**SQL:**
```sql
-- Confirm the presented questions all share one learning_unit_id
select b.learning_unit_id, h.question_id, h.last_presented_at_sequence
from public.ali_student_question_history h
join public.ali_question_bank b on b.id = h.question_id
where h.profile_id = '<test profile id>' and b.subject = 'english'
order by h.last_presented_at_sequence desc;
```

**Pass:** every row from the most recent mock shares the identical `learning_unit_id`; the previous mock's `learning_unit_id` differs (or, if the seeded bank only has one eligible passage remaining given cooldown state, this is a content-volume limitation, not a failure — cross-check against §4.3's Learning Unit integrity query from `ALI_SEEDING_PLAN.md` first before treating it as a bug).

---

## Scenario D — No repeated questions (all three subjects)

**Proves:** Decision 11's absolute previous-mock exclusion and Decision 4's question-count cooldown both hold with real data and real timing, across all three subjects, not just in simulation.

**Steps:**
1. For each subject, complete 3 consecutive mocks as the same test profile, noting each mock's exact question (or, for English, Learning Unit) set.
2. Compare every pair of consecutive mocks.

**SQL:**
```sql
select question_id, last_presented_at_sequence
from public.ali_student_question_history
where profile_id = '<test profile id>'
order by last_presented_at_sequence desc
limit 40;
```

**Pass:** zero question-id overlap between any two *consecutive* mocks, for every subject tested. Reappearance across non-consecutive mocks should respect each question's difficulty-tiered cooldown (5/10/15/20 for easy/medium/hard/challenge, in intervening-question count, not calendar time).

---

## Scenario E — Parent Insights update, live

**Proves:** `computeParentReport()`'s `competencySummaries` (Phase 1.4) genuinely reflects real Supabase-backed history, not just the localStorage bridge simulated in every prior phase's pure-function scripts.

**Steps:**
1. As a test profile with real history from Scenarios A–C, load `/parent`.
2. Confirm the "How They're Doing" section shows real, named competencies (e.g. "Word Analogies", "Fractions", "Inference") for every subject with attempted real questions — not raw competency codes, not percentages-only.

**SQL (cross-check against what the UI should be showing):**
```sql
select b.subject, b.skill, h.mastery_state, count(*)
from public.ali_student_question_history h
join public.ali_question_bank b on b.id = h.question_id
where h.profile_id = '<test profile id>'
group by b.subject, b.skill, h.mastery_state
order by b.subject, b.skill;
```

**Pass:** every `mastery_state = 'mastered'` competency-with-all-attempted-questions-mastered shown in this query appears in the UI's Strengths/Recently Mastered; every competency with any `mastery_state = 'weak'` row appears in Focus Next; the UI never shows a raw code like `english.inference` (label-lookup gap already checked and fixed pre-emptively in Phase 2.1, Decision 38 — this scenario is the live re-confirmation, not the first check).

---

## Scenario F — Daily Missions update, live

**Proves:** `computeAdaptiveState()`'s mission urgency (Phase 1.3) correctly prioritises a real weak competency over an untouched subject, using real Supabase-backed data.

**Steps:**
1. As a test profile with at least one real `mastery_state = 'weak'` competency from Scenarios A–C, load `/dashboard`.
2. Confirm the primary Daily Mission item names the subject with the weak competency, and its reason text names the specific competency by its human label (not a raw code).

**Pass:** matches the query from Scenario E — the subject/competency combination with a real weak `mastery_state` row is the one surfaced as primary, exactly as the pure-function script already proved in simulation (`ALI_DECISION_LOG.md` Decision 39) — this scenario exists to confirm the same behaviour holds when the data really came from Supabase, not an in-memory Map standing in for it.

---

## Scenario G — History rows written correctly (structural check, all subjects)

**Proves:** `recordPresentation()` and `recordOutcome()` (`lib/ali/history.ts`) write exactly the rows they're supposed to, with correct field values, against the real schema — not just that the app "seems to work."

**Steps:** after any mock from Scenarios A–C, inspect the raw rows directly (not through any UI).

**SQL:**
```sql
select * from public.ali_student_question_history
where profile_id = '<test profile id>'
order by updated_at desc
limit 20;
```

**Pass, checked field by field:**
- `times_seen` increments by exactly 1 per attempt.
- `times_correct` increments only on a correct attempt (and, for English, only on a **full-marks** attempt — Decision 37; a partial-credit English answer must leave `times_correct` unchanged even though the student received partial-credit feedback in the UI).
- `distinct_correct_sessions` increments only when `last_correct_session_id` differs from the current session — not on every correct answer within the same sitting.
- `last_presented_at_sequence` matches the `ali_student_adaptive_state.questions_presented_count` value at the time that mock was generated (Scenario H confirms the state-table side of this).
- `mastery_state` matches the exact evidence on the row (`lib/ali/mastery.ts`'s rules) — not "probably mastered," but literally: `distinct_correct_sessions >= mastery_threshold` AND `last_attempt_correct = true` for `mastered`; last 2 attempts both `false` for `weak`.

---

## Scenario H — Adaptive state rows updated correctly (structural check, all subjects)

**Proves:** `ali_student_adaptive_state.questions_presented_count` is a real, monotonically increasing, per-profile counter that correctly drives cooldown math — not just present, but numerically correct.

**Steps:** complete 2–3 mocks of any subject as a test profile, noting each mock's question count.

**SQL:**
```sql
select profile_id, questions_presented_count, updated_at
from public.ali_student_adaptive_state
where profile_id = '<test profile id>';
```

**Pass:** the counter's final value equals the sum of every mock's question count so far (e.g. two 10-question mocks → `questions_presented_count = 20`, not 2). Cross-check against Scenario G's `last_presented_at_sequence` values — every question from a given mock should share the exact stamp the counter held immediately after that mock's `recordPresentation()` call.

---

## What this protocol does not re-test

Everything already proven correct by pure-function simulation (mastery evidence logic, weak-skill override firing on the right competency, difficulty-tier distribution, cross-subject signal isolation, Learning Unit grouping/selection logic itself) is **not** re-derived here — those are properties of the pure functions (`lib/ali/*`), which do not change based on whether their inputs came from a real database or a simulated Map. This protocol exists specifically to catch the class of bug that pure-function simulation *cannot* catch: real I/O wiring mistakes (wrong column names, a forgotten field in a Supabase `update` call, a real foreign-key constraint behaving unexpectedly under real concurrent access) — exactly the gap every prior phase's validation report has flagged as open, now finally closeable once real network access and real seeded content both exist.
