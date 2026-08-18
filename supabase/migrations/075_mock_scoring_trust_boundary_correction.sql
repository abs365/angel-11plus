-- Angel Digital 11+ — Migration 075
-- Programme Increment 008F — Mock Scoring Trust Boundary Correction.
--
-- FORWARD-ONLY. Migration 074 (this repository's own record of what was
-- actually applied to production — Decision 99) is NOT rewritten here.
-- This migration transforms the already-installed, already-applied 074
-- state into the corrected architecture a Founder pre-application
-- architecture review identified (Decision 98) — conducted under the
-- mistaken belief that 074 had not yet been applied (corrected in
-- Decision 99), but the three findings themselves were genuine and
-- remain exactly as valid against the already-installed state.
--
-- THREE CORRECTIONS, all real, all investigated before being assumed:
--
-- 1. TRUST BOUNDARY. The installed mock_score_attempt() (074) is
--    directly executable by any ordinary authenticated learner —
--    authorised only by an ownership check, never by anything stronger.
--    Investigation traced its real, only caller: browser client code
--    (app/learning-intelligence/mock-exam/page.tsx's own submission
--    handler — already removed from this repository's own app code,
--    ahead of this migration, since a client-side call now always fails
--    once this migration is applied). There is no technical reason a
--    learner needs this — the function returns void, and this codebase
--    already has a genuine trusted-server boundary for exactly this
--    purpose: migration 072's own report-init trigger, which already
--    fires automatically, entirely server-side, the instant
--    mock_submit_attempt() locks an attempt. This migration redefines
--    both mock_score_attempt() and that trigger's own function (mock_
--    attempt_report_init(), migration 072, already applied) so that
--    scoring is triggered automatically and exclusively by the trigger,
--    and revokes mock_score_attempt's EXECUTE from authenticated (anon
--    was already correctly revoked by 074 itself). No service-role
--    credential is introduced — the trigger's own SECURITY DEFINER
--    context, owned by the same role that owns mock_score_attempt,
--    already has full implicit rights over its own objects; that
--    ownership, not a new secret, is what makes the internal call work.
--
-- 2. MANUAL-MARKING SEMANTICS. The installed mock_score_attempt() (074)
--    sets scoring_state = 'scored' unconditionally, even when one or
--    more questions are requires_manual_marking and percentage is null
--    — meaning mock_release_report's own gate (`scoring_state =
--    'scored'`) cannot distinguish a genuinely complete report from one
--    with unresolved Continuous Writing, a real premature-release risk.
--    Corrected WITHOUT altering ali_mock_attempt_report's own
--    scoring_state CHECK constraint (migration 072, already applied) —
--    the smallest change compatible with the existing schema: reuses
--    the existing, previously-unused 'scoring' state whenever any
--    question still requires manual marking, reserving 'scored'
--    exclusively for a fully-resolved report. mock_release_report
--    itself is NOT touched by this migration — its own gate becomes
--    correct automatically once 'scored' genuinely means "nothing left
--    unresolved."
--
-- 3. NULL/EMPTY RESPONSE HANDLING. The installed mock_score_attempt()
--    (074) reads a response row's own 'value' key without checking
--    whether it is null or empty, which could fall through to
--    'incorrect' rather than 'unanswered'. mock_submit_answer (migration
--    070, unmodified) only requires p_response to be a JSON object —
--    nothing about its internal shape — so a direct RPC call bypassing
--    this repository's own client-side `if (answerDraft.trim())` guard
--    could send {value: ""} or {value: null}. Corrected: a response row
--    with a null, missing, or whitespace-only 'value' is now treated
--    exactly like no response at all — 'unanswered', never 'incorrect'
--    or 'requires_manual_marking'.
--
-- WHAT THIS MIGRATION DOES NOT DO: does not add or alter any table
-- column (marking_version/released_at already exist from 074); does not
-- touch mock_release_report at all (already correct, no change needed);
-- does not touch any of the 8 proven Mock RPCs from migrations 070/072,
-- their grants, or any RLS policy; does not create any new table,
-- policy, or trigger object (mock_attempt_report_init_trigger, migration
-- 072, is unchanged — only the function it calls is redefined); does not
-- touch ali_question_bank.eligibility_status, ali_student_question_
-- history, ali_durable_mastery, or ali_educational_audit; does not
-- mutate any existing row's data (no UPDATE/INSERT/DELETE statement
-- against any table — Mock Eligible has been 0 throughout this entire
-- migration chain and no real Mock content or form has ever existed, so
-- no ali_mock_attempt_report row was ever created by a genuine learner
-- attempt for the corrected logic to need reconciling); does not
-- introduce a service-role credential; does not begin any provenance-
-- architecture or Educational Intelligence integration work (Decision
-- 97's own open questions, untouched here).
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations 069-074
-- have already been applied (074 confirmed applied per Founder
-- clarification, Decision 99).

begin;

-- === Function: mock_score_attempt (redefined) ========================
--
-- Full corrected body — CREATE OR REPLACE FUNCTION requires the complete
-- new definition, not a partial patch. Identical to migration 074's own
-- original body except for the two marked corrections (null/empty
-- response handling; conditional scoring_state). Every other line —
-- signature, ownership check, submitted-only guard, idempotency check,
-- the deliberately conservative auto-marking scope (single-scalar
-- numeric/string match only; Writing/multi-form/unmarkable answers route
-- to requires_manual_marking), the 0.0001 tolerance, the questionTypeId
-- inclusion — is unchanged from migration 074's own design.
create or replace function public.mock_score_attempt(p_attempt_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_attempt public.ali_mock_attempt;
  v_current_marking_version constant integer := 1;
  v_question_id text;
  v_bank_row public.ali_question_bank;
  v_response jsonb;
  v_response_value text;
  v_stored_answer text;
  v_marks numeric;
  v_status text;
  v_marks_awarded numeric;
  v_numeric_response numeric;
  v_numeric_answer numeric;
  v_outcomes jsonb := '[]'::jsonb;
  v_raw_achieved numeric := 0;
  v_raw_available numeric := 0;
  v_answered_count integer := 0;
  v_unanswered_count integer := 0;
  v_correct_count integer := 0;
  v_incorrect_count integer := 0;
  v_manual_count integer := 0;
  v_percentage numeric;
begin
  select id into v_profile_id from public.profiles where auth_user_id = auth.uid();

  select * into v_attempt from public.ali_mock_attempt
    where id = p_attempt_id and profile_id = v_profile_id;
  if not found then
    raise exception 'Attempt % not found for caller', p_attempt_id;
  end if;
  if v_attempt.status <> 'submitted' then
    raise exception 'Attempt % is not submitted (status=%) -- only a locked, submitted attempt may be scored', p_attempt_id, v_attempt.status;
  end if;

  -- Idempotent: already scored at the current marking version -- no-op.
  if exists (
    select 1 from public.ali_mock_attempt_report
    where attempt_id = p_attempt_id
      and scoring_state = 'scored'
      and marking_version = v_current_marking_version
  ) then
    return;
  end if;

  foreach v_question_id in array v_attempt.assigned_question_ids loop
    select * into v_bank_row from public.ali_question_bank where id = v_question_id;
    if not found then
      v_status := 'requires_manual_marking';
      v_marks := 0;
      v_marks_awarded := null;
      v_outcomes := v_outcomes || jsonb_build_object('questionId', v_question_id, 'status', v_status, 'marksAwarded', v_marks_awarded, 'marksAvailable', v_marks, 'questionTypeId', null);
      v_manual_count := v_manual_count + 1;
      continue;
    end if;

    v_marks := coalesce((v_bank_row.prompt->>'marks')::numeric, 1);
    v_raw_available := v_raw_available + v_marks;

    select response into v_response from public.ali_mock_attempt_answer
      where attempt_id = p_attempt_id and question_id = v_question_id;

    v_response_value := null;
    if v_response is not null then
      v_response_value := v_response->>'value';
    end if;

    -- CORRECTION 3: a response row that exists but carries no genuine
    -- content (a null, missing, or whitespace-only 'value') is treated
    -- exactly like no response at all.
    if v_response is null or v_response_value is null or trim(v_response_value) = '' then
      v_status := 'unanswered';
      v_marks_awarded := 0;
      v_unanswered_count := v_unanswered_count + 1;
    else
      v_answered_count := v_answered_count + 1;
      v_stored_answer := v_bank_row.prompt->>'answer';

      if v_bank_row.subject = 'writing' or v_stored_answer is null or v_stored_answer like '%;%' then
        v_status := 'requires_manual_marking';
        v_marks_awarded := null;
        v_manual_count := v_manual_count + 1;
      else
        v_numeric_response := null;
        v_numeric_answer := null;
        begin
          v_numeric_response := v_response_value::numeric;
          v_numeric_answer := v_stored_answer::numeric;
        exception when others then
          v_numeric_response := null;
          v_numeric_answer := null;
        end;

        if v_numeric_response is not null and v_numeric_answer is not null then
          if abs(v_numeric_response - v_numeric_answer) < 0.0001 then
            v_status := 'correct';
          else
            v_status := 'incorrect';
          end if;
        elsif lower(trim(coalesce(v_response_value, ''))) = lower(trim(v_stored_answer)) then
          v_status := 'correct';
        else
          v_status := 'incorrect';
        end if;

        if v_status = 'correct' then
          v_marks_awarded := v_marks;
          v_correct_count := v_correct_count + 1;
        else
          v_marks_awarded := 0;
          v_incorrect_count := v_incorrect_count + 1;
        end if;
      end if;
    end if;

    if v_marks_awarded is not null then
      v_raw_achieved := v_raw_achieved + v_marks_awarded;
    end if;

    v_outcomes := v_outcomes || jsonb_build_object(
      'questionId', v_question_id,
      'status', v_status,
      'marksAwarded', v_marks_awarded,
      'marksAvailable', v_marks,
      'questionTypeId', v_bank_row.skill
    );
  end loop;

  if v_manual_count > 0 or v_raw_available = 0 then
    v_percentage := null;
  else
    v_percentage := round((v_raw_achieved / v_raw_available) * 100, 1);
  end if;

  update public.ali_mock_attempt_report
  -- CORRECTION 2: 'scored' reserved exclusively for a fully-resolved
  -- report; reuses the existing, previously-unused 'scoring' state
  -- otherwise -- no constraint change, no new enum value.
  set scoring_state = case when v_manual_count > 0 then 'scoring' else 'scored' end,
      marking_version = v_current_marking_version,
      question_outcomes = v_outcomes,
      overall = jsonb_build_object(
        'rawMarksAchieved', v_raw_achieved,
        'rawMarksAvailable', v_raw_available,
        'percentage', v_percentage,
        'answeredCount', v_answered_count,
        'unansweredCount', v_unanswered_count,
        'correctCount', v_correct_count,
        'incorrectCount', v_incorrect_count,
        'requiresManualMarkingCount', v_manual_count
      ),
      updated_at = now()
  where attempt_id = p_attempt_id;

  if not found then
    raise exception 'No report row exists for attempt % -- the migration 072 report-init trigger should have created one on submission', p_attempt_id;
  end if;
end;
$$;

-- === Function: mock_attempt_report_init (redefined) ==================
--
-- CORRECTION 1. Redefines migration 072's own already-applied report-
-- init trigger function so authoritative scoring is triggered
-- automatically, entirely server-side, the instant an attempt locks —
-- never by a learner or browser. This is the SAME trigger
-- (mock_attempt_report_init_trigger, migration 072, unmodified — only
-- the function body it calls changes; CREATE OR REPLACE FUNCTION
-- preserves the function's identity, so the existing trigger picks up
-- this new body with no trigger DDL needed). Scoring is wrapped in its
-- own nested exception block so a scoring failure can never roll back
-- the learner's own genuine submission -- mock_submit_attempt()'s own
-- status update (migration 070, unmodified) must always succeed once
-- truly submitted. On a caught exception, the report row is marked
-- scoring_state = 'failed' (an existing, valid state, migration 072).
create or replace function public.mock_attempt_report_init()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'submitted' and (old.status is distinct from 'submitted') then
    insert into public.ali_mock_attempt_report (attempt_id)
    values (new.id)
    on conflict (attempt_id) do nothing;

    begin
      perform public.mock_score_attempt(new.id);
    exception when others then
      update public.ali_mock_attempt_report
      set scoring_state = 'failed', updated_at = now()
      where attempt_id = new.id;
    end;
  end if;
  return new;
end;
$$;

-- === Grant correction ================================================
--
-- CORRECTION 1's own enforcement: the actual privilege change. anon was
-- already correctly revoked by migration 074 itself -- only the
-- authenticated grant needs removing.
revoke execute on function public.mock_score_attempt(uuid) from authenticated;

commit;
