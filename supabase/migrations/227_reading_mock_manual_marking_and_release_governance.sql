-- Angel Digital 11+ — Migration 227
-- Reading Mock Manual Marking → Analysis → Report Release (Increment 026
-- selection). Additive-only, no historical migration edited in place.
--
-- ============================================================
-- ROOT CAUSE / WHY THIS EXISTS
-- ============================================================
-- Increment 025 proved the Reading Comprehension Mock 1 scorer works in
-- production (migration 219): a real attempt reached `scoring_state =
-- 'scoring'` with 6 questions at `requires_manual_marking`. Repository
-- trace this increment found NO existing mechanism anywhere -- not in
-- `/admin-beta/review` (`lib/adminReview.ts`, confirmed by direct read to
-- operate exclusively on `ali_family_review`/content rows, zero
-- references to `ali_mock_attempt`/`question_outcomes`), not in any SQL
-- function -- for a human to award marks to a `requires_manual_marking`
-- outcome, and no function anywhere transitions a report's
-- `scoring_state` from `'scoring'` to `'scored'` once manual items
-- resolve. `ALI_DECISION_LOG.md` itself already named this exact gap as
-- UNKNOWN. This migration is the first, minimal, additive answer.
--
-- ============================================================
-- WHAT THIS MIGRATION ADDS (three things, all additive)
-- ============================================================
-- 1. `ali_mock_manual_mark_audit` -- a small, append-only audit table.
--    Every accepted manual-marking decision is recorded here permanently,
--    independent of later `question_outcomes` mutations. RLS enabled, no
--    policies, no grants to anon/authenticated -- reachable only from
--    inside this migration's own SECURITY DEFINER function (owner
--    privilege, the same mechanism every other Mock function in this
--    schema already relies on) or a Founder's own direct database
--    connection. Not a general assessment-event platform -- one row per
--    accepted mark, nothing else.
--
-- 2. `mock_apply_manual_mark(p_attempt_id uuid, p_question_id text,
--    p_marks_awarded numeric)` -- the one new write path. SECURITY
--    DEFINER, admin-gated via the SAME `is_current_user_admin()` check
--    `mock_release_report()` (migration 074) already uses -- no new
--    authorisation mechanism invented. Marker identity is derived from
--    `auth.uid()` via the caller's own `profiles` row, exactly like every
--    other identity-deriving function in this schema (`mock_analyse_
--    attempt`, migrations 151/215) -- never accepted as a caller-supplied
--    value. Locks the report row (`for update`) for the duration of the
--    transaction, so two concurrent calls for the same attempt cannot
--    race; a second call for a question already resolved is rejected
--    (`status <> 'requires_manual_marking'`), not silently re-applied.
--    Recomputes every aggregate (`overall.*`) from the complete,
--    authoritative `question_outcomes` array on every call -- never
--    incremented -- so call order/retries cannot corrupt totals. Only
--    when the LAST manual item resolves does `scoring_state` become
--    `'scored'`, and only then does this function invoke the EXISTING
--    `mock_analyse_attempt()` (see point 3) -- never before.
--
-- 3. `mock_analyse_attempt(p_attempt_id uuid)` — CREATE OR REPLACE, one
--    targeted widening only. The live function (migrations 151/215)
--    derives the caller's own `profiles.id` from `auth.uid()` and
--    requires `ali_mock_attempt.profile_id = v_profile_id` — correct and
--    unchanged for its one existing caller, the submission trigger
--    (`mock_attempt_report_init`), which always runs inside the
--    LEARNER's own request, so `auth.uid()` already IS the learner. That
--    same check would incorrectly reject `mock_apply_manual_mark()`'s own
--    call, since an admin's `auth.uid()` never matches the learner's
--    `profile_id`. The ONLY change here is widening that one predicate to
--    `(profile_id = v_profile_id or public.is_current_user_admin())` —
--    every other line of migration 215's own analysis logic (skill
--    accumulation, competency rollup, evidence classification, priority
--    ranking, the english/mathematics subject-breakdown correction) is
--    byte-for-byte unchanged. For the existing learner-initiated call
--    path this predicate evaluates identically to before (the admin
--    branch is simply never needed there); for the new admin-initiated
--    call path it is what makes analysis reachable at all. The shared
--    submission trigger (`mock_attempt_report_init`, migrations
--    072/075/151/220) is NOT touched by this migration — Reading's
--    manual-marking-driven analysis call happens exclusively from
--    `mock_apply_manual_mark()` above, an entirely separate, isolated
--    invocation site. Mathematics/Writing's own trigger-driven call is
--    completely unaffected.
--
-- ============================================================
-- GOVERNANCE DEFECT FOUND AND CLOSED IN THE SAME MIGRATION
-- ============================================================
-- `mock_release_report()` (migration 074) was found, on direct re-read,
-- to gate release on `scoring_state = 'scored'` ONLY — it does not check
-- `analysis_state` at all. This means a report could theoretically be
-- released while its own analysis had failed or never run — the learner
-- report page's own `analysisState !== 'complete'` fallback
-- (`ANALYSIS_PENDING_NOTE`) is a UI courtesy, not a database invariant,
-- and this task's own directive is explicit that a UI fallback is not an
-- acceptable substitute for a release-time guard. This is a REAL,
-- pre-existing governance gap, not introduced by Reading — closed here
-- for every Mock subject, not just Reading. Verified safe for the
-- existing Mathematics/Writing path: that path's own trigger
-- (unmodified) already calls `mock_analyse_attempt()` synchronously,
-- inside the SAME transaction, immediately after a successful score —
-- by the time `scoring_state` reaches `'scored'`, `analysis_state` has
-- already reached `'complete'` in every case that previously worked; the
-- only behaviour this changes is correctly REFUSING release for an
-- attempt whose analysis genuinely failed (`analysis_state = 'failed'`)
-- — which was already a latent gap, not a newly-introduced regression.
-- `mock_release_report()`'s function signature, its `is_current_user_
-- admin()` gate, and its existing grants (`authenticated`, not `anon`)
-- are otherwise completely unchanged — CREATE OR REPLACE, identical
-- signature, no grant re-issue needed.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does not touch `mock_attempt_report_init` (the shared submission
-- trigger), `mock_score_attempt()`, `mock_persist_reading_scoring()`,
-- `mock_claim_reading_scoring_work()`, or any Mathematics/Writing content
-- or scoring rule. Does not build an admin marking UI — per explicit
-- Founder instruction, this increment proves the lifecycle via direct,
-- governed database calls first (the same operational pattern every
-- other admin action in this programme already uses, e.g. `mock_release_
-- report()` itself, migration application itself). Does not build a
-- remark/correction workflow — an outcome already resolved out of
-- `requires_manual_marking` cannot be re-marked through this function;
-- a formal correction capability, if ever needed, is a separate, later,
-- separately-governed decision. Does not wire Mock evidence into
-- `ali_student_question_history`, `processEvidenceForCompetency()`, or
-- any recommendation/preparation engine — migration 074's own
-- provenance-isolation wall stands, untouched, exactly as `lib/
-- mockAttempt/evidenceAdapter.ts`'s own docstring already discloses.
--
-- ============================================================
-- CORRECTION HISTORY (this migration has never successfully applied,
-- so it is corrected in place, per Decision 218/229's own convention --
-- see migration 163's own identical precedent)
-- ============================================================
-- Founder pre-production review caught a real authority-order defect in
-- `mock_apply_manual_mark()` before this migration was ever applied:
-- `v_canonical_marks` was originally ASSIGNED from the persisted
-- outcome's own `marksAvailable` JSON field, with the live `ali_
-- question_bank` row used only as a cross-check -- backwards from the
-- required authority hierarchy (the canonical bank row must be the
-- ultimate authority; the persisted outcome value may only ever be an
-- integrity cross-check against it). Corrected: the bank row is now
-- resolved and `v_canonical_marks` derived FROM IT first (via the exact
-- same `coalesce((prompt->>'marks')::numeric, 1)` rule mock_persist_
-- reading_scoring() itself already uses), and the persisted outcome's
-- own marksAvailable is compared against that already-derived value
-- afterward, purely as a drift check -- a mismatch still fails closed,
-- exactly as before, but the mark itself is now always validated
-- against the canonical bank value, never the JSON copy. No other logic
-- in this migration changed.

-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations 070-226
-- (per this arc's own standing record) have already been applied.

begin;

-- ============================================================
-- 1. Append-only manual-marking audit table
-- ============================================================

create table if not exists public.ali_mock_manual_mark_audit (
  id                  bigint generated always as identity primary key,
  attempt_id          uuid not null references public.ali_mock_attempt(id),
  question_id         text not null,
  marks_awarded       numeric not null,
  marks_available     numeric not null,
  marked_by_profile_id uuid not null references public.profiles(id),
  marking_version     integer not null,
  marked_at           timestamptz not null default now()
);

comment on table public.ali_mock_manual_mark_audit is
  'Migration 227 -- one immutable, append-only row per accepted manual-marking decision. Never updated or deleted by application code. Retained regardless of later question_outcomes mutations. No SELECT/INSERT/UPDATE/DELETE grant to anon or authenticated -- reachable only from inside mock_apply_manual_mark()''s own SECURITY DEFINER context, or a Founder''s own direct database connection.';

create index if not exists ali_mock_manual_mark_audit_attempt_idx
  on public.ali_mock_manual_mark_audit (attempt_id);

alter table public.ali_mock_manual_mark_audit enable row level security;

revoke all on table public.ali_mock_manual_mark_audit from public, anon, authenticated;

-- ============================================================
-- 2. mock_apply_manual_mark -- the one new write path
-- ============================================================

create or replace function public.mock_apply_manual_mark(
  p_attempt_id uuid,
  p_question_id text,
  p_marks_awarded numeric
)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_marker_profile_id       uuid;
  v_attempt                 public.ali_mock_attempt;
  v_report                  public.ali_mock_attempt_report;
  v_outcomes                jsonb;
  v_outcome                 jsonb;
  v_found_index             int;
  v_idx                     int;
  v_current_status          text;
  v_bank_row                public.ali_question_bank;
  v_canonical_marks         numeric;
  v_new_status              text;
  v_new_outcomes            jsonb;
  v_manual_count            int := 0;
  v_correct_count           int := 0;
  v_incorrect_count         int := 0;
  v_partial_count           int := 0;
  v_unanswered_count        int := 0;
  v_answered_count          int := 0;
  v_raw_achieved            numeric := 0;
  v_raw_available           numeric := 0;
  v_percentage              numeric;
  v_final_scoring_state     text;
  v_current_marking_version constant integer := 1;
begin
  -- AUTHORITY: admin only. No caller-supplied marker identity anywhere in
  -- this function -- always derived from the current session's own
  -- auth.uid(), never a parameter.
  if not public.is_current_user_admin() then
    raise exception 'Only an admin may apply a manual Mock mark';
  end if;

  select id into v_marker_profile_id from public.profiles where auth_user_id = auth.uid();
  if v_marker_profile_id is null then
    raise exception 'Marker profile could not be resolved for the current session';
  end if;

  -- ATTEMPT: exists, submitted, the exact Reading Mock 1 form.
  select * into v_attempt from public.ali_mock_attempt where id = p_attempt_id;
  if not found then
    raise exception 'Attempt % not found', p_attempt_id;
  end if;
  if v_attempt.status <> 'submitted' then
    raise exception 'Attempt % is not submitted (status=%)', p_attempt_id, v_attempt.status;
  end if;
  if v_attempt.attempt_type <> 'timed_section' or v_attempt.form_id <> 'reading-comprehension-mock-1' then
    raise exception 'Attempt % is not a Reading Comprehension Mock 1 attempt (attempt_type=%, form_id=%)', p_attempt_id, v_attempt.attempt_type, v_attempt.form_id;
  end if;

  -- Row-locked for the rest of this transaction -- a concurrent call for
  -- the same attempt blocks here until this one commits, then re-reads
  -- the now-updated row and is evaluated against it, never a stale copy.
  select * into v_report from public.ali_mock_attempt_report where attempt_id = p_attempt_id for update;
  if not found then
    raise exception 'No report row exists for attempt %', p_attempt_id;
  end if;
  if v_report.scoring_state <> 'scoring' then
    raise exception 'Attempt % report is not in the manual-marking phase (scoring_state=%)', p_attempt_id, v_report.scoring_state;
  end if;
  if v_report.marking_version is distinct from v_current_marking_version then
    raise exception 'Attempt % report is at marking_version % -- this function only understands version %', p_attempt_id, v_report.marking_version, v_current_marking_version;
  end if;

  v_outcomes := coalesce(v_report.question_outcomes, '[]'::jsonb);

  -- QUESTION: appears exactly once, currently pending manual marking,
  -- still part of the immutable assigned manifest.
  v_found_index := null;
  for v_idx in 0 .. jsonb_array_length(v_outcomes) - 1 loop
    if (v_outcomes -> v_idx ->> 'questionId') = p_question_id then
      if v_found_index is not null then
        raise exception 'Question % appears more than once in attempt %''s outcomes -- refusing to guess', p_question_id, p_attempt_id;
      end if;
      v_found_index := v_idx;
    end if;
  end loop;
  if v_found_index is null then
    raise exception 'Question % is not part of attempt %''s persisted outcomes', p_question_id, p_attempt_id;
  end if;

  v_outcome := v_outcomes -> v_found_index;
  v_current_status := v_outcome ->> 'status';
  if v_current_status <> 'requires_manual_marking' then
    raise exception 'Question % is not awaiting manual marking (status=%) -- this function never re-marks an already-resolved outcome', p_question_id, v_current_status;
  end if;

  if not (p_question_id = any(v_attempt.assigned_question_ids)) then
    raise exception 'Question % is not part of attempt %''s assigned manifest', p_question_id, p_attempt_id;
  end if;

  -- MARK: canonical bound comes from the report's own already-persisted
  -- ali_question_bank -- the SAME source, and the SAME derivation rule
  -- (`coalesce((prompt->>'marks')::numeric, 1)`), mock_persist_reading_
  -- scoring() itself already uses (migration 219). The report's own
  -- already-persisted marksAvailable is used ONLY as an integrity
  -- cross-check, never as the value actually validated against -- if it
  -- has drifted from the canonical bank value for any reason, this
  -- fails closed rather than silently trusting either side.
  select * into v_bank_row from public.ali_question_bank where id = p_question_id;
  if not found then
    raise exception 'Question % no longer resolves to a bank row', p_question_id;
  end if;
  v_canonical_marks := coalesce((v_bank_row.prompt->>'marks')::numeric, 1);
  if (v_outcome ->> 'marksAvailable')::numeric is distinct from v_canonical_marks then
    raise exception 'Question %''s persisted marksAvailable (%) no longer matches the canonical bank value (%) -- refusing to guess', p_question_id, (v_outcome ->> 'marksAvailable')::numeric, v_canonical_marks;
  end if;

  if p_marks_awarded is null or p_marks_awarded < 0 or p_marks_awarded > v_canonical_marks then
    raise exception 'Marks awarded (%) outside canonical bound [0,%] for question %', p_marks_awarded, v_canonical_marks, p_question_id;
  end if;

  -- Status is DERIVED from the bounded mark, never a separate caller claim.
  if p_marks_awarded = 0 then
    v_new_status := 'incorrect';
  elsif p_marks_awarded = v_canonical_marks then
    v_new_status := 'correct';
  else
    v_new_status := 'partially_correct';
  end if;

  -- Replace exactly this one outcome by array index -- every other
  -- outcome, including every other manual-marking one, is untouched.
  v_new_outcomes := jsonb_set(
    v_outcomes, array[v_found_index::text],
    jsonb_build_object(
      'questionId', p_question_id,
      'status', v_new_status,
      'marksAwarded', p_marks_awarded,
      'marksAvailable', v_canonical_marks,
      'questionTypeId', v_outcome ->> 'questionTypeId'
    )
  );

  -- Recompute every aggregate from the COMPLETE, authoritative outcomes
  -- array on every call -- never incremented -- so call order/retries
  -- structurally cannot corrupt totals.
  for v_idx in 0 .. jsonb_array_length(v_new_outcomes) - 1 loop
    v_outcome := v_new_outcomes -> v_idx;
    v_current_status := v_outcome ->> 'status';

    if v_current_status = 'requires_manual_marking' then
      v_manual_count := v_manual_count + 1;
    elsif v_current_status = 'unanswered' then
      v_unanswered_count := v_unanswered_count + 1;
    else
      v_answered_count := v_answered_count + 1;
      if v_current_status = 'correct' then
        v_correct_count := v_correct_count + 1;
      elsif v_current_status = 'incorrect' then
        v_incorrect_count := v_incorrect_count + 1;
      elsif v_current_status = 'partially_correct' then
        v_partial_count := v_partial_count + 1;
      end if;
    end if;

    v_raw_available := v_raw_available + coalesce((v_outcome ->> 'marksAvailable')::numeric, 0);
    if (v_outcome ->> 'marksAwarded') is not null then
      v_raw_achieved := v_raw_achieved + (v_outcome ->> 'marksAwarded')::numeric;
    end if;
  end loop;

  if v_manual_count > 0 then
    v_percentage := null;
    v_final_scoring_state := 'scoring';
  else
    v_percentage := round((v_raw_achieved / nullif(v_raw_available, 0)) * 100, 1);
    v_final_scoring_state := 'scored';
  end if;

  update public.ali_mock_attempt_report
  set scoring_state = v_final_scoring_state,
      question_outcomes = v_new_outcomes,
      overall = jsonb_build_object(
        'rawMarksAchieved', v_raw_achieved,
        'rawMarksAvailable', v_raw_available,
        'percentage', v_percentage,
        'answeredCount', v_answered_count,
        'unansweredCount', v_unanswered_count,
        'correctCount', v_correct_count,
        'incorrectCount', v_incorrect_count,
        'partiallyCorrectCount', v_partial_count,
        'requiresManualMarkingCount', v_manual_count
      ),
      updated_at = now()
  where attempt_id = p_attempt_id;

  -- Append-only audit row -- retained regardless of any later
  -- question_outcomes mutation. Never updated, never deleted here.
  insert into public.ali_mock_manual_mark_audit (
    attempt_id, question_id, marks_awarded, marks_available,
    marked_by_profile_id, marking_version
  ) values (
    p_attempt_id, p_question_id, p_marks_awarded, v_canonical_marks,
    v_marker_profile_id, v_current_marking_version
  );

  -- Analysis is invoked ONLY when this mark resolved the LAST remaining
  -- manual item, through the existing mock_analyse_attempt() (widened
  -- below) -- never before, never a second analysis engine.
  if v_final_scoring_state = 'scored' then
    perform public.mock_analyse_attempt(p_attempt_id);
  end if;

  return jsonb_build_object('status', v_final_scoring_state, 'requiresManualMarkingCount', v_manual_count);
end;
$$;

revoke all on function public.mock_apply_manual_mark(uuid, text, numeric) from public;
grant execute on function public.mock_apply_manual_mark(uuid, text, numeric) to authenticated;
revoke execute on function public.mock_apply_manual_mark(uuid, text, numeric) from anon;

-- ============================================================
-- 3. mock_analyse_attempt -- ownership check widened for the admin path
--    (see this migration's own header for the full rationale). Every
--    other line is byte-for-byte identical to migration 215's own live
--    definition.
-- ============================================================

create or replace function public.mock_analyse_attempt(p_attempt_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_attempt public.ali_mock_attempt;
  v_report public.ali_mock_attempt_report;
  v_current_analysis_version constant integer := 1;
  v_outcome jsonb;
  v_question_id text;
  v_status text;
  v_marks_awarded numeric;
  v_marks_available numeric;
  v_question_type_id text;
  v_bank_row public.ali_question_bank;
  v_skill_keys text[] := array[]::text[];
  v_skill_key text;
  v_marks_achieved jsonb := '{}'::jsonb;
  v_marks_available_map jsonb := '{}'::jsonb;
  v_subpart_count jsonb := '{}'::jsonb;
  v_correct_count jsonb := '{}'::jsonb;
  v_difficulty_counts jsonb := '{}'::jsonb;
  v_misconceptions jsonb := '{}'::jsonb;
  v_by_skill jsonb := '[]'::jsonb;
  v_strengths jsonb := '[]'::jsonb;
  v_weaknesses jsonb := '[]'::jsonb;
  v_priorities jsonb := '[]'::jsonb;
  v_competency_evidence jsonb := '[]'::jsonb;
  v_evidence_level text;
  v_percentage numeric;
  v_skill_subparts integer;
  v_skill_correct integer;
  v_skill_achieved numeric;
  v_skill_available numeric;
  v_skill_difficulty jsonb;
  v_skill_misconceptions jsonb;
  v_is_english_attempt boolean;
begin
  select id into v_profile_id from public.profiles where auth_user_id = auth.uid();

  -- Migration 227's own one targeted widening: an admin (e.g. via
  -- mock_apply_manual_mark(), the ONLY other caller of this function
  -- besides the unmodified submission trigger) may also pass this check
  -- for any attempt, since analysis here never returns or stores a
  -- learner response, only bounded, already-computed evidence. The
  -- existing learner-initiated path (profile_id = v_profile_id) is
  -- completely unchanged.
  select * into v_attempt from public.ali_mock_attempt
    where id = p_attempt_id
      and (profile_id = v_profile_id or public.is_current_user_admin());
  if not found then
    raise exception 'Attempt % not found for caller', p_attempt_id;
  end if;

  select * into v_report from public.ali_mock_attempt_report where attempt_id = p_attempt_id;
  if not found then
    raise exception 'No report row exists for attempt % -- the migration 072 report-init trigger should have created one on submission', p_attempt_id;
  end if;
  if v_report.scoring_state <> 'scored' then
    raise exception 'Attempt % report is not fully scored (scoring_state=%) -- analysis requires a fully-resolved score, never a manual-marking-pending one', p_attempt_id, v_report.scoring_state;
  end if;

  -- Idempotent: already analysed at the current analysis version -- no-op.
  if v_report.analysis_state = 'complete' and v_report.analysis_version = v_current_analysis_version then
    return;
  end if;

  for v_outcome in select * from jsonb_array_elements(coalesce(v_report.question_outcomes, '[]'::jsonb))
  loop
    v_question_id := v_outcome->>'questionId';
    v_status := v_outcome->>'status';
    v_question_type_id := v_outcome->>'questionTypeId';

    if v_question_type_id is null or v_status = 'requires_manual_marking' then
      continue;
    end if;

    v_marks_available := coalesce((v_outcome->>'marksAvailable')::numeric, 0);
    v_marks_awarded := coalesce((v_outcome->>'marksAwarded')::numeric, 0);

    select * into v_bank_row from public.ali_question_bank where id = v_question_id;

    if not (v_skill_keys @> array[v_question_type_id]) then
      v_skill_keys := v_skill_keys || v_question_type_id;
      v_marks_achieved := v_marks_achieved || jsonb_build_object(v_question_type_id, 0::numeric);
      v_marks_available_map := v_marks_available_map || jsonb_build_object(v_question_type_id, 0::numeric);
      v_subpart_count := v_subpart_count || jsonb_build_object(v_question_type_id, 0);
      v_correct_count := v_correct_count || jsonb_build_object(v_question_type_id, 0);
      v_difficulty_counts := v_difficulty_counts || jsonb_build_object(v_question_type_id, jsonb_build_object('easy', 0, 'medium', 0, 'hard', 0, 'challenge', 0));
      v_misconceptions := v_misconceptions || jsonb_build_object(v_question_type_id, '[]'::jsonb);
    end if;

    v_marks_achieved := jsonb_set(v_marks_achieved, array[v_question_type_id], to_jsonb((v_marks_achieved->>v_question_type_id)::numeric + v_marks_awarded));
    v_marks_available_map := jsonb_set(v_marks_available_map, array[v_question_type_id], to_jsonb((v_marks_available_map->>v_question_type_id)::numeric + v_marks_available));
    v_subpart_count := jsonb_set(v_subpart_count, array[v_question_type_id], to_jsonb((v_subpart_count->>v_question_type_id)::integer + 1));
    if v_status = 'correct' then
      v_correct_count := jsonb_set(v_correct_count, array[v_question_type_id], to_jsonb((v_correct_count->>v_question_type_id)::integer + 1));
    end if;

    if found and v_bank_row.content_difficulty is not null then
      v_difficulty_counts := jsonb_set(
        v_difficulty_counts, array[v_question_type_id, v_bank_row.content_difficulty::text],
        to_jsonb(((v_difficulty_counts->v_question_type_id)->>(v_bank_row.content_difficulty::text))::integer + 1)
      );
    end if;

    if found and v_status <> 'correct' and v_bank_row.addresses_misconception is not null then
      v_misconceptions := jsonb_set(
        v_misconceptions, array[v_question_type_id],
        (v_misconceptions->v_question_type_id) || to_jsonb(v_bank_row.addresses_misconception)
      );
    end if;

    v_competency_evidence := v_competency_evidence || jsonb_build_object(
      'competencyId', public.mock_question_type_competency(v_question_type_id),
      'questionTypeId', v_question_type_id,
      'source', 'mock',
      'correct', (v_status = 'correct'),
      'attemptId', p_attempt_id,
      'formId', v_attempt.form_id,
      'scoredAt', now()
    );
  end loop;

  foreach v_skill_key in array v_skill_keys loop
    v_skill_subparts := (v_subpart_count->>v_skill_key)::integer;
    v_skill_correct := (v_correct_count->>v_skill_key)::integer;
    v_skill_achieved := (v_marks_achieved->>v_skill_key)::numeric;
    v_skill_available := (v_marks_available_map->>v_skill_key)::numeric;
    v_skill_difficulty := v_difficulty_counts->v_skill_key;
    v_skill_misconceptions := v_misconceptions->v_skill_key;

    if v_skill_available > 0 then
      v_percentage := round((v_skill_achieved / v_skill_available) * 100, 1);
    else
      v_percentage := null;
    end if;

    if v_skill_subparts < 2 then
      v_evidence_level := 'insufficient_evidence';
    elsif v_skill_correct = v_skill_subparts then
      v_evidence_level := 'demonstrated_securely';
    elsif v_skill_correct = 0 then
      v_evidence_level := 'not_yet_demonstrated';
    else
      v_evidence_level := 'developing';
    end if;

    v_by_skill := v_by_skill || jsonb_build_object(
      'questionTypeId', v_skill_key,
      'competencyId', public.mock_question_type_competency(v_skill_key),
      'marksAchieved', v_skill_achieved,
      'marksAvailable', v_skill_available,
      'percentage', v_percentage,
      'subpartCount', v_skill_subparts,
      'correctCount', v_skill_correct,
      'evidenceLevel', v_evidence_level,
      'difficultyDistribution', v_skill_difficulty,
      'misconceptionNotes', (select coalesce(jsonb_agg(m), '[]'::jsonb) from (select m from jsonb_array_elements_text(v_skill_misconceptions) m limit 2) sub)
    );

  end loop;

  with competency_rollup as (
    select
      public.mock_question_type_competency(e->>'questionTypeId') as competency_id,
      sum((e->>'subpartCount')::integer) as subpart_count,
      sum((e->>'correctCount')::integer) as correct_count
    from jsonb_array_elements(v_by_skill) e
    group by public.mock_question_type_competency(e->>'questionTypeId')
  ),
  classified as (
    select
      competency_id, subpart_count, correct_count,
      case
        when subpart_count < 2 then 'insufficient_evidence'
        when correct_count = subpart_count then 'demonstrated_securely'
        when correct_count = 0 then 'not_yet_demonstrated'
        else 'developing'
      end as evidence_level
    from competency_rollup
    where competency_id is not null
  )
  select
    coalesce(jsonb_agg(jsonb_build_object('competencyId', competency_id, 'questionCount', subpart_count, 'correctCount', correct_count) order by competency_id) filter (where evidence_level = 'demonstrated_securely'), '[]'::jsonb),
    coalesce(jsonb_agg(jsonb_build_object('competencyId', competency_id, 'questionCount', subpart_count, 'correctCount', correct_count) order by competency_id) filter (where evidence_level in ('not_yet_demonstrated', 'developing')), '[]'::jsonb)
  into v_strengths, v_weaknesses
  from classified;

  select coalesce(
    jsonb_agg(
      jsonb_build_object('competencyId', public.mock_question_type_competency(s.qt), 'questionTypeId', s.qt)
      order by s.rank_key, s.marks_lost desc, s.qt asc
    ),
    '[]'::jsonb
  )
  into v_priorities
  from (
    select
      (e->>'questionTypeId') as qt,
      case when (e->>'evidenceLevel') = 'not_yet_demonstrated' then 0 else 1 end as rank_key,
      ((e->>'marksAvailable')::numeric - (e->>'marksAchieved')::numeric) as marks_lost
    from jsonb_array_elements(v_by_skill) e
    where (e->>'evidenceLevel') in ('not_yet_demonstrated', 'developing')
    order by rank_key, marks_lost desc, qt asc
    limit 3
  ) s;

  v_is_english_attempt := exists (
    select 1 from unnest(v_skill_keys) k where k like 'QT-RC-%' or k like 'QT-WC-%'
  );

  update public.ali_mock_attempt_report
  set analysis_state = 'complete',
      analysis_version = v_current_analysis_version,
      analysed_at = now(),
      skill_evidence = jsonb_build_object('bySkill', v_by_skill, 'nextPracticePriorities', v_priorities),
      strengths = v_strengths,
      weaknesses = v_weaknesses,
      competency_evidence = v_competency_evidence,
      subject_breakdown = case when v_report.overall is not null then
        jsonb_build_array(jsonb_build_object(
          'subject', case when v_is_english_attempt then 'english' else 'mathematics' end,
          'marksAchieved', (v_report.overall->>'rawMarksAchieved')::numeric,
          'marksAvailable', (v_report.overall->>'rawMarksAvailable')::numeric,
          'percentage', v_report.overall->'percentage'
        ))
      else subject_breakdown end,
      updated_at = now()
  where attempt_id = p_attempt_id;

  if not found then
    raise exception 'No report row exists for attempt % -- unexpected concurrent deletion', p_attempt_id;
  end if;
end;
$$;

-- Execute grants unchanged from migration 151/215 -- granted to NO role
-- at all. Callable only from inside another SECURITY DEFINER function's
-- own owner-privilege context (the unmodified submission trigger, or the
-- new mock_apply_manual_mark() above).
revoke all on function public.mock_analyse_attempt(uuid) from public;

-- ============================================================
-- 4. mock_release_report -- hardened to also require analysis_state =
--    'complete' (real governance defect found this increment, closed for
--    every Mock subject, not just Reading -- see this migration's own
--    header for the full safety argument re: Mathematics/Writing).
-- ============================================================

create or replace function public.mock_release_report(p_attempt_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
begin
  if not public.is_current_user_admin() then
    raise exception 'Only an admin may release a Mock report';
  end if;

  update public.ali_mock_attempt_report
  set report_release_state = 'released',
      released_at = now(),
      updated_at = now()
  where attempt_id = p_attempt_id
    and scoring_state = 'scored'
    and analysis_state = 'complete';

  if not found then
    raise exception 'Report for attempt % cannot be released (not found, scoring_state <> ''scored'', or analysis_state <> ''complete'')', p_attempt_id;
  end if;
end;
$$;

-- Execute grants unchanged from migration 074 -- authenticated only,
-- never anon, function body still admin-gated.

commit;

-- Read-only verification (run before and after applying):
--
-- select proname, pg_get_function_identity_arguments(oid)
-- from pg_proc where proname in ('mock_apply_manual_mark', 'mock_analyse_attempt', 'mock_release_report')
-- and pronamespace = 'public'::regnamespace;
--
-- select count(*) from public.ali_mock_manual_mark_audit;
