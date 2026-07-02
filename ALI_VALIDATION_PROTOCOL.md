# ALI Validation Protocol

**Phase:** ALI 1.1 — Validation & Observability. No subject expansion, no new adaptive features, no new question banks in this phase — the sole goal is proving Angel Learning Intelligence behaves as designed before any Slice 2 work begins.

**Status:** Protocol defined; Scenarios 1–4 and 7 executed via pure-function simulation this session (§Findings). Scenarios 5–6 partially executed (the localStorage/pure-function half is real; the Supabase-write half is blocked by this sandbox's lack of network access — see §Environment Note).

---

## How to read this document

Each scenario below has: what it proves, preconditions, exact steps, and what a pass looks like. Scenarios are written to be re-run by a human tester in the real app, or reproduced programmatically the way this session's findings were (§Findings) — a throwaway `npx tsx` script driving the real `lib/ali/*` and `lib/*` pure functions directly, since this repo has no test framework (established precedent, see ADAPTIVE_ASSESSMENT_ENGINE_IMPLEMENTATION_PLAN.md §7).

## Environment note (read before re-running any Supabase-dependent scenario)

This project's Supabase instance is not reachable from the sandbox this phase was built in — confirmed via a raw `fetch()` to the correctly-JWT-derived project URL (genuine network block, not a code or `.env.local` bug). Scenarios that require real `ali_question_bank`/`ali_student_question_history` rows (5 and 6, partially) could only be exercised via pure-function simulation with in-memory Maps standing in for those two tables, using the exact same `lib/ali/*` functions the real Supabase-backed code calls internally. Anyone with real network access should re-run those two scenarios against the live database to close this gap — the SQL to check is included per-scenario below.

---

## Scenario 1 — Weak competency improvement

**Proves:** A competency correctly transitions `new → learning → weak` when answered incorrectly, and `weak → learning → mastered` when subsequently answered correctly across distinct sessions.

**Steps:**
1. As a test profile, complete an adaptive mock answering all questions of one competency (e.g. `vr.analogies`) incorrectly.
2. Confirm (`ali_student_question_history` or trace log) those questions show `mastery_state = 'weak'` after 2 consecutive incorrect attempts.
3. Complete 2+ more mocks answering that competency correctly.
4. Confirm `mastery_state` progresses to `mastered` once `distinct_correct_sessions >= mastery_threshold` and the most recent attempt was correct.

**SQL (once migrations are live):**
```sql
select question_id, times_seen, times_correct, distinct_correct_sessions, mastery_state
from ali_student_question_history
where profile_id = '<test profile>' and question_id like 'vr-%'
order by updated_at desc;
```

**Pass:** mastery_state genuinely reflects the sequence of outcomes, not just the most recent one.

---

## Scenario 2 — Question cooldown

**Proves:** A question does not reappear before its difficulty-tiered cooldown threshold, and never reappears in the mock immediately following its presentation, regardless of difficulty or weak-skill status.

**Steps:**
1. Complete mock N, note the exact question set.
2. Complete mock N+1 immediately after. Confirm zero overlap with mock N's set (Decision 11 — absolute, unconditional).
3. Continue for several more mocks. Confirm a question only reappears once `currentSequence - last_presented_at_sequence >= COOLDOWN_QUESTIONS[difficulty]` (5/10/15/20 for easy/medium/hard/challenge).

**Pass:** Zero repeats across any two consecutive mocks; reappearance timing matches the cooldown table exactly.

---

## Scenario 3 — Mastery progression

**Proves:** Mastery requires evidence across distinct sessions, not a single lucky answer, and is revocable.

**Steps:**
1. Answer one question correctly once. Confirm `mastery_state` is NOT `mastered` (only 1 distinct correct session, threshold is 2–3).
2. Answer it correctly again in a different mock (different `session_id`). Confirm `mastery_state = 'mastered'` once the threshold is met.
3. Answer the same question incorrectly in a later mock. Confirm it demotes back to `learning` (or `weak` if the prior attempt was also incorrect).

**Pass:** Mastery is never granted from a single attempt, and a wrong answer after mastery is achieved genuinely revokes it.

---

## Scenario 4 — Difficulty progression

**Proves:** Higher subject confidence produces a harder question mix, and the shift is visible mock-over-mock as a student's performance changes.

**Steps:**
1. Simulate/observe a `foundation`-tier student's mock — confirm zero `challenge`-difficulty questions (per the tier distribution table, 0% allocation).
2. Simulate/observe a `challenge`-tier student's mock — confirm zero `easy`-difficulty questions.
3. Confirm a single student's tier climbs (foundation → developing → advanced → challenge) as `computeSubjectConfidence()`'s inputs (accuracy, consistency) improve across mocks, and the next mock's difficulty mix visibly shifts harder.

**Pass:** Distribution matches ADAPTIVE_ASSESSMENT_ENGINE_IMPLEMENTATION_PLAN.md §4.2's table; tier changes are reflected in the very next mock generated (between-mock adaptivity, Decision 2).

---

## Scenario 5 — Parent Insights updates

**Proves:** Completing an adaptive mock changes what a parent sees (readiness, insights, focus areas) — not just what the student sees.

**Steps:**
1. Snapshot `computeParentReport()`'s output before a mock.
2. Complete an adaptive mock.
3. Snapshot `computeParentReport()`'s output after. Confirm at minimum: `subjectConfidence` for verbal-reasoning changed, and `overallScore`/`weakSubjects`/`strongSubjects` reflect the new result.

**Pass:** The bridge write (ADAPTIVE_ASSESSMENT_ENGINE_IMPLEMENTATION_PLAN.md §0.5.3 — `completeLesson`/`recordSkillResult` into `UserProgress`) is confirmed to actually change Parent Insights output, not just theoretically wired.

**Real finding from this session (§Findings, Finding 1) — read before treating this scenario as fully proven:** `examReadiness` in this session's simulation never moved off `"not-ready"` for any persona, including one scoring 100% on every mock. This is a pre-existing characteristic of `getExamReadiness()`'s `sessions < 3` gate combined with how `totalSessions` is counted (`completedLessons.length` — distinct lesson/subject IDs tried, not attempt count), not an ALI defect. See Finding 1 for the full explanation and why it matters for a repeated-single-subject engine like adaptive mocks.

---

## Scenario 6 — Replay behaviour

**Proves:** A weak competency drives both ALI's own remediation (the weak-skill override, Decision 11/17) and the legacy replay queue (`buildReplayQueue()`, subject-level).

**Steps:**
1. Make one competency weak (Scenario 1, step 1–2).
2. Confirm the next mock's selection trace shows a `weak-skill-override-*` selection reason for that competency (§Observability below).
3. Confirm `buildReplayQueue()`'s output includes the parent subject (e.g. "Verbal Reasoning") with elevated urgency.

**Pass:** Both signals fire. Note per Decision 19: the legacy replay queue can only ever say "Verbal Reasoning is weak," never "Analogies specifically" — only ALI's own trace has competency-level precision. This is expected, not a bug — see Finding 3.

---

## Scenario 7 — Different students receive different mocks

**Proves:** Two students with different histories/confidence get genuinely different question selections, not the same fixed set.

**Steps:**
1. Run two (or more) student profiles with different confidence tiers and answer histories through the same section size against the same bank.
2. Confirm their selected question sets differ, and their difficulty-tier mixes differ according to §Scenario 4.

**Pass:** No two students' mocks are identical (barring coincidence at very small bank sizes — see Finding 2 on sample-size noise).

---

## Observability — what gets logged, and why it's internal-only

Per this phase's build (`lib/ali/observability.ts`, `types/ali/observability.ts`), every adaptive mock section generated logs a `MockGenerationTrace` to the browser console (`console.groupCollapsed`, prefixed `[ALI][trace]`) containing, per selected question: competency, difficulty tier, selection reason (`unseen` / `eligible-seen` / `weak-skill-override-reserved` / `weak-skill-override-pool` / `mastered-resurface` / `fallback-shortfall`), cooldown status (distance/threshold/eligible), whether a weak-skill override applied, and a human-readable replay reason when it did. The section-level trace also records which confidence tier drove the target difficulty distribution.

This is console-only. It is never persisted to a new table and never rendered in any UI a student or parent sees — used for developer debugging and manually verifying the scenarios above (e.g. confirming a `weak-skill-override-reserved` entry actually appears when Scenario 6 expects one).

---

## Findings from this session's simulation run (2026-07-02)

Executed via a throwaway `npx tsx` script (`scripts/_ali_e2e_simulation.ts`, deleted before commit per this repo's established practice) that drives the **real** production pure functions — `lib/adaptiveMockBuilder.ts`, `lib/ali/selection.ts`, `lib/ali/mastery.ts`, `lib/analytics.ts`, `lib/adaptiveDifficulty.ts`, `lib/replayEngine.ts`, `lib/adaptiveEngine.ts`, `lib/parentInsights.ts`, `lib/gamification.ts` — end-to-end for 3 personas (weak/average/high performer), 5–6 adaptive mocks each, against the Slice 1 synthetic fixture (16 questions, 4 competencies × 4 difficulties). Only two I/O boundaries were simulated rather than hit for real: Supabase (replaced with an in-memory `Map`, updated via the same `applyAttemptOutcome()` the real code calls) and `localStorage` (replaced with a plain object, updated via hand-verified equivalents of `recordSkillResult()`/`completeLesson()` — those two are "use client"-gated and no-op outside a browser, so they couldn't be called directly in Node). Everything else is the real code responding to real inputs.

### What worked exactly as designed

- **Weak-skill override fired precisely on the intended competency, every time.** Student A: `vr.analogies` scripted to fail in mocks 1–2, override never fired for it (too early/no history yet) then wasn't needed once it started passing from mock 3; separately, `vr.letter-codes`/`vr.hidden-words`/`vr.sequences` organically went weak from realistic ~65% accuracy and the override fired for exactly those competencies (mock 5: "weak-skill overrides fired=2 [vr.letter-codes, vr.letter-codes]"; mock 6: "fired=5 [vr.hidden-words, vr.letter-codes, vr.hidden-words, vr.letter-codes, vr.sequences]"). Student B: `vr.sequences` went weak at mock 3, override fired specifically for it at mock 4 ("fired=3 [vr.sequences, vr.sequences, vr.sequences]") and the competency recovered (no longer weak by mock 5).
- **No question ever repeated across consecutive mocks**, confirmed by construction (Decision 11's exclusion ran on every mock transition) — consistent with the unit-level proof already established in the Slice 1 build.
- **Tier progression tracked performance correctly and immediately (between-mock, per Decision 2):** Student A climbed foundation → developing → advanced across mocks 1–3 and held; Student B climbed advanced → challenge by mock 2 and held; Student C (95% accuracy) jumped straight to `challenge` after mock 1 and stayed there for all 5 mocks — all matching §Scenario 4's expectations exactly.
- **Mastery was genuinely evidence-based, not single-attempt.** Final per-question states show a realistic mix (`mastered`/`learning`/`weak`/`new`) that tracks each persona's actual scripted accuracy per competency, not a uniform "everything mastered" or "nothing mastered" outcome.
- **Different students received genuinely different mocks (Scenario 7 confirmed):** the three personas' final mastery-state tables are all different from each other, and no two mocks within a single persona's run repeated a question set.

### Real findings — issues worth product attention before Slice 2, not ALI defects

**Finding 1 — `examReadiness` may never leave "not-ready" for a student who only does adaptive mocks, even at 100% accuracy.** All 3 personas stayed at `readiness = "not-ready"` for their entire run, including Student C who scored 100% on all 5 mocks. Root cause: `getExamReadiness()` (`lib/parentInsights.ts`) gates on `report.totalSessions >= 3`, and `totalSessions` is `p.completedLessons.length` — a count of **distinct lesson/subject IDs ever completed**, not attempt count. Every adaptive mock in this simulation calls `completeLesson("verbal-reasoning", ...)` and `completeLesson("mock-test", ...)`, both of which dedupe against `completedLessons` (matching the existing app-wide convention — the same thing happens for a student repeating any single lesson type today, ALI or not). So `completedLessons.length` caps at 2 no matter how many adaptive mocks run, and readiness can never clear its `sessions >= 3` floor from adaptive-mock activity alone. **This is a pre-existing characteristic of the readiness/session-counting model, not something ALI introduced** — but ALI's whole premise (repeated attempts at the same adaptive mock type) is exactly the usage pattern this counter was never designed to distinguish from "tried it once." Worth a product decision before Slice 2: either `totalSessions` needs a real attempt-count source, or readiness needs an ALI-aware signal (e.g. distinct `ali_student_question_history` rows, or `ali_student_adaptive_state.questions_presented_count`) folded in.

**Finding 2 — Small-sample score volatility is real and visible at the section sizes used here.** Student A's mock 2 scored 17% (1/6 correct) purely from a run of bad luck at a 6-question section size, despite a genuine ~65% underlying accuracy — a single-mock score at N=6 is a noisy signal. The production Slice 1 route uses N=10 for the VR section (less noisy, but not immune). Not a bug — a reminder that any future "did this student improve" judgment should look at trend across several mocks (or use `distinct_correct_sessions`-style evidence, which ALI's own mastery model already does correctly) rather than a single mock's score in isolation.

**Finding 3 — The Daily Mission's *primary* slot rarely reflects VR-specific remediation, even when a competency is actively weak.** The replay queue (`buildReplayQueue()`) correctly surfaced "Verbal Reasoning" with high urgency when the subject went weak (Student A, mock 2: "replay queue top item: Verbal Reasoning (urgency 86)") — confirming Scenario 6's subject-level half works. But the Daily Mission's primary item stayed "English Comprehension" for every single mock across all 3 personas, all 16 mock-completions in this run. Root cause: `buildDailyMission()`'s urgency function (`lib/adaptiveEngine.ts`) scores any **not-started** subject at a flat urgency of 80, which beats a VR subject that's merely `developing`/`strong` (urgency 0–50) and sometimes even beats a `weak` one depending on exact score. Since this simulation never touches English/Maths/Vocabulary/Writing, those never-started subjects permanently outrank VR in the mission ranking. This is arguably correct behavior in isolation (breadth matters, and a completely untouched core subject probably should outrank a single weak skill within a subject you've already started) — but it means the requested "Weak Analogies → Replay → **Mission**" chain is only fully visible when a student has already broadly explored other subjects; for a student using *only* the adaptive mock (a very plausible real usage pattern), the Mission surface won't reflect their ALI-driven remediation need at all. Also a legitimate pre-Slice-2 product question, not an ALI code defect — ALI's own signals (weak-skill override, replay queue) are working; the Mission's cross-subject prioritization logic simply wasn't designed with a VR-only user in mind.

### What this simulation does NOT prove (the environment gap, restated)

It does not confirm the real `ali_student_question_history`/`ali_question_bank` Supabase writes behave identically under real network/DB conditions (transaction timing, concurrent writes, RLS being disabled as expected) — only that the pure logic those writes are built on is correct. Re-run Scenarios 5 and 6's SQL checks against the live database once reachable.
