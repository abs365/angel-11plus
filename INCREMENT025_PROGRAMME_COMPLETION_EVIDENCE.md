# Increment 025 — Programme Completion Evidence & Reselection

## Original selection (superseded, preserved for history)

**Original Increment 025 selection:** wire the Preparation Horizon's `revision_retrieval` recommendation into real Practice session weighting (`buildPreparationWeightBias()`).

**Founder decision: CANCELLED AS NOT REQUIRED.** Implementation pre-flight traced the complete real execution path (as required before writing any code) and found the original defect claim did not hold as stated. A separate, real, already-operational mechanism exists in `generatePersonalisedSession()` itself (`lib/learningEngine/sessionGenerator.ts`, "Review Scheduling, Deliverable 3"): when `getRecommendations()` returns a `triggerReason: "review-due"` candidate, the function directly reserves the most calendar-overdue previously-mastered question for that competency into the real session — unconditionally, on every call, independent of whether a `PreparationSessionContext` is even supplied. This predates Increment 021's own weight-bias wiring. `revision_retrieval` as a dashboard *label* has no `buildPreparationWeightBias()` case, but the underlying real signal it derives from already, genuinely, changes session selection today.

**Reusable engineering lesson, recorded per Founder instruction:** a Preparation Horizon activity type does not necessarily need a `buildPreparationWeightBias()` case to have operational effect — a recommendation can be consumed by a different part of the same session-generation function. Future programme audits must trace the *complete* execution path before classifying any recommendation as unwired, not stop at the first function checked.

**Two real, smaller characteristics of the existing mechanism, disclosed as observations, not authorised defects, per explicit Founder instruction:**
1. `REVIEW_SLOT_CAP = 1` — a documented, deliberate calibration choice ("so a genuine review doesn't crowd out every other priority"), not evidence of a defect.
2. The reserved review question is always a previously-mastered, previously-seen item (never fresh material) — arguably correct for genuine decay-checking, not a defect.

Neither was modified. No code was changed for the original Increment 025 scope. `HEAD` at cancellation: `85479e3` (unchanged).

---

## Reselection — corrected programme assessment

### Preparation Horizon destinations (corrected)

Of the 7 real `ActivityType` values: `teaching_lesson`, `guided_practice`, `unseen_transfer_check` are consumed by `buildPreparationWeightBias()`; `placement_check` is handled via a separate page redirect; **`revision_retrieval` is now confirmed consumed by the separate Review Scheduling mechanism** (corrected from the prior audit's "zero effect" claim); `independent_practice` and `timed_assessment` remain "no special session-generation effect" by design (the former is simply the absence of a stronger recommendation; the latter routes to Mock, a wholly separate flow). No remaining Preparation Horizon destination is confirmed genuinely unwired.

### Reading Mock scoring — investigated fresh this turn, not assumed

Real architecture exists and is deployed: migration 219 (`mock_claim_reading_scoring_work` / `mock_persist_reading_scoring`, a dedicated least-privilege `mock_scoring_writer` Postgres role), `lib/server/mockScoringAuthority.ts` (the one file holding `MOCK_SCORING_DATABASE_URL`), `lib/mockAttempt/readingScoringOrchestration.ts` (pure, tested scoring computation reusing the exact same engine Practice already uses), and `app/api/mock-reading-scoring/route.ts` (the real, deployed, learner-facing API route, commit `3c905c1`, "reliable Reading scoring invocation + bounded recovery").

**`READING MOCK SCORING = OPEN TECHNICAL BLOCKER.`** The route's own exception handler (line 125, `logScoringEvent(attemptId, "scorer", "failure", \`exception:${err.name}\`)`) is exactly where a real, previously-reported `"exception:r2"` log line would originate — consistent with the Founder's own account of a positive-control attempt that reached the privileged scoring call and failed. No commit since `3c905c1` (the tip of this feature's entire history, unchanged through this whole session's Increments 019–025) touches this code, so whatever state produced that failure is the current state. Static code review of `mockScoringAuthority.ts` found no obvious logic defect in the connection/query code itself — the failure most likely originates in the `MOCK_SCORING_DATABASE_URL` credential/connection layer (missing, misconfigured, or a network/pooler restriction), which cannot be diagnosed or fixed from source code alone. **Confirming genuine closure requires production execution**: either a fresh real (or intentionally test) Reading Mock submission with the resulting Vercel log line shared back, or Founder confirmation that the `mock_scoring_writer` role and `MOCK_SCORING_DATABASE_URL` were ever actually configured. This was not attempted this turn (explicitly out of scope: "do not fix Reading Mock scoring yet," "do not mutate production merely to answer this selection question").

### Mathematics / Reading / Writing bottlenecks (reassessed, largely unchanged from the prior audit)

- **Mathematics:** 202 rows/37 families, 3/6 full teaching, family-depth thinness (unchanged) remains the real capacity constraint; no untaught competency's intervention-loop gap outranks Reading Mock scoring's severity.
- **Reading:** 142 rows/24 passages, 2/4 full teaching; the 24-passage ceiling remains real but is a *content-freshness* constraint, not a *loop-breaking* one the way Mock scoring failure is.
- **Writing:** 7 live prompts (Increment 023's 3 held, correctly excluded from usable capacity), 0 full teaching, thinnest capacity in the system — a capacity + teaching problem, but not currently loop-breaking (Writing has no Mock at all, so there is no scoring-closure risk analogous to Reading's).

### Frequent-user / late-entrant / strong-learner bottlenecks (corrected)

With maintenance review now confirmed operational, the *revision* dimension is no longer the dominant frequent-user risk. The corrected dominant risk across all three learner profiles is: **any learner who reaches the Reading Mock — the core timed-assessment/readiness stage of the whole preparation loop — currently risks the scoring pipeline failing silently from their perspective**, based on the last known real evidence. This affects a late-entrant relying on Mock readiness most acutely (least runway to recover from a broken assessment cycle), but is a real risk for every learner who takes the Reading Mock.

### Ranked candidates (this turn)

1. **Reading Mock scoring closure** — highest severity (a live, learner-reachable, core-loop-breaking failure risk), but lowest immediate executability (requires a Founder-supplied fresh diagnostic step before any code fix, if one is even needed, can be written).
2. Another full teaching lesson (RC-03/RC-04/MR-02/MR-05/Writing WC-01) — fully executable, moderate impact, no new evidence elevates one specific competency over the others named in the prior audit.
3. Reading/Mathematics content-capacity deepening — moderate impact, blocked by the same independent-reviewer governance constraint as any new content.
4. Migration 221 (passage-eligibility architecture) — real but narrower, no fresh evidence elevates it this round.

### Selected outcome

**Increment 025 (reselected): Diagnose and close Reading Mock scoring**, beginning with a Founder-collaborative diagnostic step (a fresh test/real Reading Mock submission with the resulting server log shared back), before any code change is proposed — mirroring the same Founder-collaborative verification pattern already proven throughout this program (e.g., Increment 020/023's own migration-application verification cycles). This is not implemented this turn (selection only).

**Status: SELECTED / NOT IMPLEMENTED (superseded by closure below).**

---

## Closure — technical Reading Mock scoring blocker (2026-09-05)

**Status: PRODUCTION COMPLETE — TECHNICAL READING MOCK SCORING VERIFIED.**

The full diagnostic-to-closure chain, preserved accurately (no historical record rewritten):

1. **Client-side recovery investigation** (production attempt `e2f26f8d-25b6-452d-bd1c-3d5ad2436a0f`) found two real code-quality/observability findings — an unguarded `getSession().then(...)` in `components/providers/AuthProvider.tsx`, and a silent-skip branch in the mock-report recovery effect — neither of which was proven to be, or was, the blocker. **Not fixed as part of this closure**; recorded as open, disclosed findings for a future increment.
2. Production evidence proved client recovery reliably reaches `/api/mock-reading-scoring` and the request is not the failure point.
3. A bounded, Founder-approved observability commit (`4cbcf6e`) replaced the route's `exception:${err.name}` diagnostic (uninformative under production minification) with the real Postgres `code`/`severity`/`routine` fields plus a claim/compute/persist stage tag.
4. Fresh production evidence then showed `exception:P0001;severity:ERROR;routine:exec_stmt_raise;stage:persist` — a genuine `mock_persist_reading_scoring()` (migration 219) RAISE EXCEPTION, not a connection/auth/schema failure. Two hypotheses were formed and **disproved by Founder-run, read-only production queries**: a missing `ali_question_bank` row for one of the 28 assigned questions, and a `marks = 0` legacy-heuristic overflow. Live function signature drift was also checked and disproved.
5. A second bounded, Founder-approved observability commit (`7e6bb74`) added `lib/mockAttempt/persistGuardClassifier.ts`, matching the caught error's message against migration 219's own 10 fixed RAISE EXCEPTION templates and logging only a safe allow-listed identifier — never the raw message. Fresh production evidence then named the exact guard: `persist_guard:outcomes_not_array`.
6. Static and local reproduction against the actual installed `postgres` 3.4.9 package's own Bind-message code proved the existing manual `JSON.stringify(outcomes)::jsonb` boundary did **not** double-encode the array — this was verified, not assumed, and is recorded accurately: **JSON.stringify was never proven to be the root cause.**
7. A bounded, Founder-approved correction (commit `9420faa`) replaced that manual boundary with postgres.js's own explicit JSONB parameter mechanism (`sql.json()`) and added a fail-closed `Array.isArray(outcomes)` invariant immediately before persistence — changing nothing about `outcomes` itself, `computeReadingScoringOutcomes()`, the English scoring engine, or migration 219.

**Production verification, same previously-stalled attempt, same evidence hierarchy this whole increment used (fresh production evidence over static inference):**

> The explicit postgres.js JSONB binding correction resolved the production persistence failure. The same previously stalled production attempt subsequently scored successfully, with all 28 assigned questions persisted and integrity checks passing.

Fresh production scorer event: `outcome: success, reason: scored` (deployment `9420faa`). Founder-run, read-only production verification confirmed: `scoring_state = scoring`, `marking_version = 1`, `question_outcomes` is a genuine JSON array of exactly 28 entries reconciling to the attempt's 28 assigned questions, zero duplicate outcome IDs, zero outcomes outside the assigned manifest, zero automatic-mark bound violations, and 6 questions correctly resolved to `requires_manual_marking`. `overall.percentage = null`, `analysis_state = not_started`, and `report_release_state = pending` are the **expected**, correct state while 6 questions still require manual marking — not a defect, and not evidence the closure is incomplete. The report was not manually released; `scoring_state`/`analysis_state`/`report_release_state` were not altered by this increment.

**Explicitly not touched by this closure**, remaining open for a future increment if selected: the AuthProvider/report-silent-skip client findings (item 1 above); manual marking of the 6 `requires_manual_marking` questions for this attempt; the resulting analysis/report-release stage once marking completes; migrations 221 and 182 (still HOLD / NOT APPLIED); Increment 023 (still HOLD AT INDEPENDENT HUMAN REVIEW).

## Section 14 Evidence Package — 17 Unanswered Classification Legitimacy Trace (2026-09-05)

**Founder-supplied production state for this now-released attempt** (`e2f26f8d-25b6-452d-bd1c-3d5ad2436a0f`): `scoring_state=scored`, `analysis_state=complete`, `report_release_state=released`, `released_at=2026-09-05 18:56:38.91171+00`, `marking_version=1`, `analysis_version=1`, `question_outcomes_count=28`, `assigned_manifest_count=28`, `manual_audit_rows=6`, `distinct_manual_questions=6`, `negative_marks_count=0`, `over_awarded_count=0`. `overall`: `percentage=6.2`, `correctCount=2`, `answeredCount=11`, `incorrectCount=7`, `unansweredCount=17`, `rawMarksAchieved=4`, `rawMarksAvailable=65`, `partiallyCorrectCount=2`, `requiresManualMarkingCount=0`.

**Scope discipline**: this section traces the *mechanism* by which the 17 unanswered classifications were produced, from source code and migration text actually read this turn. It does **not** and cannot confirm the per-question ground truth for the 17 specific questions on this specific attempt — that requires reading `ali_mock_attempt_answer` rows this environment has no credentialed access to (only a public anon key is available locally; RLS correctly scopes that table to the owning learner only, and rightly refuses this environment). The exact query the Founder needs to run to close that final gap is given at the end of this section.

### 1. Arithmetic reconciliation (11 / 7 / 2 / 17 / 28) — clean, no anomaly

`answeredCount` is not a sibling of `correctCount`/`incorrectCount`/`partiallyCorrectCount` — it is their parent bucket. In `mock_persist_reading_scoring()` (migration 219, lines 285–303), `v_answered_count` is incremented exactly once, in the same branch that then sub-classifies the same question into `correct`/`incorrect`/`partially_correct`:

```sql
else
  v_answered_count := v_answered_count + 1;
  v_marks_awarded := (v_outcome->>'marksAwarded')::numeric;
  ...
  if v_marks_awarded = v_canonical_marks then
    v_status := 'correct'; v_correct_count := v_correct_count + 1;
  elsif v_marks_awarded = 0 then
    v_status := 'incorrect'; v_incorrect_count := v_incorrect_count + 1;
  else
    v_status := 'partially_correct'; v_partial_count := v_partial_count + 1;
  end if;
end if;
```

So `answeredCount = correctCount + incorrectCount + partiallyCorrectCount` must hold exactly: `2 + 7 + 2 = 11` ✓. The real partition is `answeredCount(11) + unansweredCount(17) + requiresManualMarkingCount(0) = 28`, which matches `assigned_manifest_count = 28` and `question_outcomes_count = 28` exactly. **There is no arithmetic anomaly.** The earlier framing of this as "11+7+2+17=37 ≠ 28" double-counted `answeredCount`'s own already-included subtotal.

### 2. End-to-end mechanism trace, assigned manifest → released report

1. **Manifest assignment** — `ali_mock_attempt.assigned_question_ids` (a `text[]` column, set at attempt creation/start — migration 070) is the sole source of truth for which questions belong to the attempt. `mock_persist_reading_scoring()` requires `jsonb_array_length(p_outcomes) = array_length(assigned_question_ids, 1)` (migration 219, line 244) and rejects any outcome for a question not in that array (line 252–254) — so the 28 assigned and 28 scored questions are structurally guaranteed to be the same 28, never a subset/superset drift.

2. **Learner response capture** — `app/learning-intelligence/mock-exam/page.tsx`'s `MockQuestionRenderer` (lines 904–987) renders **every** Reading question — regardless of `validationTier` (TIER1–TIER6, including the quotation/named-component/multi-option tiers that carry `orderedAnswer`/`correctOptions`/`requiredSelectionCount` fields on the authoring side) — as a single plain `<textarea>`. There is no separate checkbox/multi-select/ordering UI state anywhere in this component. Every answer, of every question type, becomes one plain string held in `answerDrafts[index]`, submitted as `{ value: draft.trim() }` via `submitMockAnswer()` (`lib/mockAttempt/client.ts:79-88` → RPC `mock_submit_answer`). **This rules out a whole defect class**: a genuine answer being stored under some other JSON key (e.g. `selectedOptions`) that a status-classifier keyed on `value` would miss. No such alternate key is ever written for this form.

3. **Persistence of "no response"** — both call sites that submit answers (`handleAnswerAndAdvance`, line 570–602, used for Back/Next/palette navigation and the final "Review & submit" transition; and `handleSubmit`, line 252–267, the final "Submit my Mock" action) contain the identical guard `if (!draft.trim()) return Promise.resolve(...)` — a blank/whitespace-only draft is **never sent to the server at all**. So "no row exists in `ali_mock_attempt_answer` for this question" is the expected, designed storage shape for "the learner left this blank," not a sign of data loss.

4. **Scoring's "unanswered" condition** (`mock_persist_reading_scoring()`, migration 219, line 270): `v_has_response := v_response is not null and coalesce(trim(v_response->>'value'), '') <> '';` and (line 279–284) `elsif not v_has_response then v_status := 'unanswered'; v_marks_awarded := 0;`. This is evaluated **inside the database**, independent of whatever the calling TypeScript scoring orchestration claims — it re-reads `ali_mock_attempt_answer` itself and re-derives `v_has_response` from the raw row, so a caller cannot mis-mark a genuinely-answered question as unanswered (or vice versa) by supplying a wrong claim; the two legitimate paths to `unanswered` are exactly the Founder's own categories **A** (no `ali_mock_attempt_answer` row exists for that question) and **B** (a row exists but its `value`, trimmed, is empty) — both collapse to the identical, correct `unanswered` status by design.

5. **No path exists for lost/deleted responses (Category C via the server)** — grepped every migration in `supabase/migrations/`: there is no `DELETE FROM ali_mock_attempt_answer` anywhere in this codebase's history. The only mutation is the `on conflict (attempt_id, question_id) do update` upsert in `mock_submit_answer()` (migration 070, line 326–328), which only ever *overwrites* a response for the same question (legitimate "learner changed their answer" behaviour) — never removes one. A row that once existed cannot silently disappear server-side.

6. **Manual marking and analysis never re-derive `unanswered`** — `mock_apply_manual_mark()` (migration 227, lines 324–350) recomputes `unansweredCount` on every call by re-scanning the **already-persisted** `question_outcomes` array's own `status` field (`elsif v_current_status = 'unanswered' then v_unanswered_count := v_unanswered_count + 1`) — it never touches response data again, and only ever replaces the one specific manually-marked question's own outcome. `mock_analyse_attempt()` (migration 227, lines 409+) explicitly `continue`s past any outcome whose `status = 'requires_manual_marking'`... but for the released `overall` summary itself, reads the report's own already-computed `v_report.overall` fields verbatim (confirmed at lines 635–637 for the marks/percentage fields; the same object, unedited, carries `unansweredCount` through to the released report). **No independent recomputation exists at any later stage that could diverge from step 4's original, response-grounded determination.**

### 3. One disclosed, genuine code-quality concern — not proven to have affected this attempt

`handleSubmit()` (`app/learning-intelligence/mock-exam/page.tsx`, line 264) re-saves the final unit's draft(s) at Mock-submission time with `.catch(() => {})` — **silently swallowing** any `submitMockAnswer` failure at that exact moment, then proceeding to lock the attempt regardless. Contrast this with `handleAnswerAndAdvance()` (used for every ordinary navigation-time save, and also fired — fire-and-forget, via `void` — when entering the "Review & submit" screen), which surfaces any RPC failure by setting `phase: "error"` (line 583) and halting, never silently continuing. If the very last draft's resave at final submission genuinely failed (a transient network/RPC error at that exact moment — no evidence this occurred, and no DELETE path or race exists to cause it under normal operation), that one question's real, learner-typed answer could be lost without the learner or the record ever being told — a legitimate, narrow Category C mechanism, distinct from anything that would misclassify a *successfully persisted* response. This is a **robustness recommendation for a future increment** (surface/report this failure rather than swallowing it), not a confirmed defect on this attempt — confirming or ruling it out for these specific 17 questions requires the query below.

### 4. Exact SQL for the Founder to run to close the remaining gap

This returns, per assigned question, whether a response row exists, its raw trimmed value, and its final outcome status — sufficient to assign each of the 17 unanswered questions to bucket A or B conclusively, and to flag immediately (as a genuine integrity defect requiring investigation before treating the release as final) if any diverges from A/B into C/D/E:

```sql
with manifest as (
  select id as attempt_id,
         unnest(assigned_question_ids) as question_id,
         generate_subscripts(assigned_question_ids, 1) as question_order
  from ali_mock_attempt
  where id = 'e2f26f8d-25b6-452d-bd1c-3d5ad2436a0f'
),
outcomes as (
  select attempt_id,
         elem->>'questionId' as question_id,
         elem->>'status' as status,
         (elem->>'marksAwarded')::numeric as marks_awarded,
         (elem->>'marksAvailable')::numeric as marks_available,
         elem->>'questionTypeId' as question_type_id
  from ali_mock_attempt_report, jsonb_array_elements(question_outcomes) as elem
  where attempt_id = 'e2f26f8d-25b6-452d-bd1c-3d5ad2436a0f'
)
select
  m.question_order,
  m.question_id,
  (a.response is not null) as answer_row_exists,
  a.response ->> 'value' as raw_response_value,
  length(coalesce(trim(a.response ->> 'value'), '')) as trimmed_length,
  a.answered_at,
  o.status,
  o.marks_awarded,
  o.marks_available,
  o.question_type_id
from manifest m
left join ali_mock_attempt_answer a
  on a.attempt_id = m.attempt_id and a.question_id = m.question_id
left join outcomes o
  on o.question_id = m.question_id
order by m.question_order;
```

A quick summary-only variant, if the Founder only wants counts first:

```sql
select
  count(*) filter (where o.status = 'unanswered' and a.response is null) as unanswered_no_row_category_a,
  count(*) filter (where o.status = 'unanswered' and a.response is not null and coalesce(trim(a.response->>'value'), '') = '') as unanswered_blank_row_category_b,
  count(*) filter (where o.status = 'unanswered' and a.response is not null and coalesce(trim(a.response->>'value'), '') <> '') as unanswered_with_nonblank_value_ANOMALY
from ali_mock_attempt m2
join lateral unnest(m2.assigned_question_ids) as question_id on true
left join ali_mock_attempt_answer a on a.attempt_id = m2.id and a.question_id = question_id
left join lateral (
  select elem->>'status' as status
  from ali_mock_attempt_report r, jsonb_array_elements(r.question_outcomes) as elem
  where r.attempt_id = m2.id and elem->>'questionId' = question_id
) o on true
where m2.id = 'e2f26f8d-25b6-452d-bd1c-3d5ad2436a0f';
```

If `unanswered_with_nonblank_value_ANOMALY` is anything other than `0`, that is Category D or E and must be investigated before the release is treated as final, per the Founder's own instruction. If it is `0`, every one of the 17 unanswered classifications is proven legitimate (Category A or B), and this evidence package is the record of that proof.

### 5. Conclusion

The scoring pipeline's classification mechanism for "unanswered" is **structurally sound**: it is derived once, inside the database, directly from the presence/blankness of the learner's own persisted response, is never re-derived or overridden at any later stage (manual marking, analysis, or release), and no code path exists (UI key-shape mismatch, server-side deletion) that could produce a false-unanswered classification for a genuinely-answered question on this form. The 11/7/2/17/28 arithmetic is exact, not anomalous. One narrow, disclosed robustness gap exists in the client's final-submission error handling (silently swallowed save failure) that a future increment should fix, but it is not proven — or disproven — to have affected any of these specific 17 questions without the Founder-run query above.
