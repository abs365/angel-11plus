-- Angel Digital 11+ — Migration 104
-- Mathematics First Mock Foundation — Grouped-Question Scoring +
-- Marking-Mode Safety Correction (Decision 160).
--
-- FORWARD-ONLY, following migration 075's own convention exactly:
-- CREATE OR REPLACE FUNCTION with the complete new body, not a partial
-- patch, since Postgres does not support patching a function definition.
--
-- ROOT FINDING, confirmed by direct source reading before writing a
-- single line: mock_score_attempt() (migration 075, the current live
-- version) already sums marks correctly across every id in an attempt's
-- assigned_question_ids array, REGARDLESS of grouping — a grouped
-- family's 4 rows already contribute their own marks to the paper total
-- exactly like 4 standalone rows would, since the loop never treated
-- grouping specially in the first place. There is therefore NO marks-
-- total bug to fix. The two genuine gaps this migration closes are:
--
-- 1. GROUPING METADATA IS DISCARDED. question_outcomes (the per-question
--    result array a report/diagnostic surface reads) carries
--    questionId/status/marksAwarded/marksAvailable/questionTypeId per
--    row today, but nothing identifying that e.g. mock-mr01mr10-
--    costumeschedule-01a and -01b are two subparts of ONE displayed
--    numbered question. Without this, a report consumer cannot honestly
--    roll subparts up into "Question 1: X of Y marks" — it would have
--    to guess from id-string pattern-matching, which this migration
--    does not accept as a defensible foundation for a real learner's
--    result. Fixed by adding questionGroupId/groupOrder/subpartLabel to
--    each outcome entry, read directly from ali_question_bank (the same
--    columns migration 093 already added and Decision 155 already
--    proved correct for the review surface's own grouping display,
--    reused here rather than duplicated). The actual rollup computation
--    (grouping by questionGroupId, summing marksAwarded/marksAvailable
--    within each group) is left to the report/diagnostic consumer, which
--    can now do so correctly and completely from this data — mirroring
--    exactly how groupQuestionsForReview() (lib/adminReview.ts, Decision
--    155) already performs the equivalent grouping client-side from
--    real data, not inventing a second in-database rollup representation
--    for a security-sensitive SECURITY DEFINER function to maintain.
--
-- 2. NO MARKING-MODE SAFETY CHECK. The function's existing manual-
--    marking trigger (subject = 'writing' OR stored_answer is null OR
--    stored_answer contains a semicolon) has no awareness of
--    marking_mode at all. Every row in the current Mathematics-only
--    certified pool uses marking_mode = 'deterministic' or NULL
--    (pre-093 standalone convention) — confirmed by direct migration
--    text search this session, so this check changes nothing for any
--    row that exists today. It exists as an explicit FAIL-CLOSED safety
--    property for the future: a row carrying any OTHER marking_mode
--    (e.g. 'structured_acceptable_response', the mode Decision 151's own
--    English Q12b uses, or any future value) is routed to
--    requires_manual_marking automatically, never silently scored by the
--    simple numeric/exact-string matcher that 'deterministic' content
--    alone is validated against. This is the Founder's own explicit Part
--    5 instruction ("fail closed for unsupported modes... do not weaken
--    scoring accuracy to increase pool size") implemented directly, not
--    merely documented.
--
-- SCOPE: Mathematics-only, matching Decision 159/160's own explicit
-- boundary. This migration does not generalise to any other subject's
-- marking modes, does not implement structured_acceptable_response
-- scoring (English's own future gap, not this increment's), and does
-- not touch AI Writing scoring in any way.
--
-- WHAT THIS MIGRATION DOES NOT DO: does not add or alter any table
-- column; does not touch mock_release_report, mock_attempt_report_init,
-- or any other of the proven Mock RPCs; does not create any new table,
-- policy, trigger, or grant (the existing REVOKE from migration 075
-- already stands, untouched); does not touch
-- ali_question_bank.eligibility_status, ali_student_question_history,
-- ali_durable_mastery, or ali_educational_audit; does not mutate any
-- existing row's data (no UPDATE/INSERT/DELETE against any table);
-- does not set mock_eligible or touch ali_mock_form (that is migration
-- 105's own, separate, later scope); does not assemble any Mock form;
-- does not implement English or Writing scoring; does not weaken the
-- existing 0.0001 numeric tolerance, the submitted-only guard, the
-- ownership check, or the idempotency check — every one of those is
-- carried forward from migration 075 completely unchanged.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations 070-075
-- (the proven Mock attempt/scoring engine) have already been applied.

begin;

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
      v_outcomes := v_outcomes || jsonb_build_object(
        'questionId', v_question_id, 'status', v_status, 'marksAwarded', v_marks_awarded,
        'marksAvailable', v_marks, 'questionTypeId', null,
        'questionGroupId', null, 'groupOrder', null, 'subpartLabel', null
      );
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

    if v_response is null or v_response_value is null or trim(v_response_value) = '' then
      v_status := 'unanswered';
      v_marks_awarded := 0;
      v_unanswered_count := v_unanswered_count + 1;
    else
      v_answered_count := v_answered_count + 1;
      v_stored_answer := v_bank_row.prompt->>'answer';

      -- MARKING-MODE SAFETY (this migration's own correction): fail
      -- closed to requires_manual_marking for any marking_mode other
      -- than NULL (pre-093 standalone convention) or 'deterministic'.
      -- No row in today's certified Mathematics pool triggers this
      -- branch -- it exists to protect any future, differently-marked
      -- content from ever being silently auto-scored by logic never
      -- validated against it.
      if v_bank_row.subject = 'writing' or v_stored_answer is null or v_stored_answer like '%;%'
         or (v_bank_row.marking_mode is not null and v_bank_row.marking_mode <> 'deterministic') then
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

    -- GROUPING METADATA (this migration's own correction): carried
    -- through from ali_question_bank so a report/diagnostic consumer can
    -- correctly roll subparts up into their own numbered question. NULL
    -- on every standalone row, exactly as migration 093 left them.
    v_outcomes := v_outcomes || jsonb_build_object(
      'questionId', v_question_id,
      'status', v_status,
      'marksAwarded', v_marks_awarded,
      'marksAvailable', v_marks,
      'questionTypeId', v_bank_row.skill,
      'questionGroupId', v_bank_row.question_group_id,
      'groupOrder', v_bank_row.group_order,
      'subpartLabel', v_bank_row.subpart_label
    );
  end loop;

  if v_manual_count > 0 or v_raw_available = 0 then
    v_percentage := null;
  else
    v_percentage := round((v_raw_achieved / v_raw_available) * 100, 1);
  end if;

  update public.ali_mock_attempt_report
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

commit;
