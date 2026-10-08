-- Angel Digital 11+ — Migration 274 (TEMPLATE, NOT APPLIED; Founder decision required)
-- Governed coordinate-answer normaliser for the Mock Mathematics scorer.
--
-- WHY: the live scorer compares a non-numeric answer as exact text, so a mathematically correct coordinate typed without the
-- space, "(9,5)" instead of "(9, 5)", is marked wrong. The Founder ruled that harmless spacing must not fail a correct
-- coordinate, and that nothing wider may be loosened.
--
-- WHAT THIS CHANGES (and nothing else): ONE new branch in public.mock_score_attempt, reached only when the STORED answer is
-- itself a coordinate pair "(x, y)" (two plain decimal numbers in brackets). In that case the learner's response is accepted
-- if it is also a bracketed coordinate pair, ignoring spaces and the Unicode minus sign, and BOTH numbers are equal to the
-- stored ones (tolerance 0.0001). Everything else is untouched: numeric answers, exact-text answers (times, words, letters),
-- the manual-marking and marking-mode safety, grouping metadata, idempotency and permissions (CREATE OR REPLACE keeps grants).
--   accepted:  "(9, 5)"  "(9,5)"  "( 9 , 5 )"  "(9.0, 5)"
--   rejected:  "9, 5" (no brackets)  "(5, 9)" (different)  "(9, 5, 1)" (three numbers)  "(9;5)"  "(nine, 5)"  "(9, 5" (malformed)
-- There is no fuzzy matching. Verified read-only against production literals before this file was written; see
-- ANGEL_CSSE_MARKING_ROBUSTNESS.md.

create or replace function public.mock_score_attempt(p_attempt_id uuid)
returns void
language plpgsql
security definer
set search_path to 'public'
as $function$
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
  -- coordinate-type answers only: "(x, y)" with two plain decimal numbers
  v_coord_pattern constant text := '^\(\s*([+-]?[0-9]+(?:\.[0-9]+)?)\s*,\s*([+-]?[0-9]+(?:\.[0-9]+)?)\s*\)$';
  v_coord_stored text[];
  v_coord_response text[];
begin
  v_profile_id := public.current_learner_id();

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

      -- MARKING-MODE SAFETY (unchanged): fail closed to requires_manual_marking for any marking_mode other
      -- than NULL (pre-093 standalone convention) or 'deterministic'.
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

        -- Coordinate-type answers only (this migration's single change): decided from the STORED answer.
        v_coord_stored := regexp_match(trim(v_stored_answer), v_coord_pattern);
        v_coord_response := regexp_match(replace(trim(v_response_value), chr(8722), '-'), v_coord_pattern);

        if v_numeric_response is not null and v_numeric_answer is not null then
          if abs(v_numeric_response - v_numeric_answer) < 0.0001 then
            v_status := 'correct';
          else
            v_status := 'incorrect';
          end if;
        elsif v_coord_stored is not null then
          if v_coord_response is not null
             and abs(v_coord_response[1]::numeric - v_coord_stored[1]::numeric) < 0.0001
             and abs(v_coord_response[2]::numeric - v_coord_stored[2]::numeric) < 0.0001 then
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

    -- GROUPING METADATA (unchanged): carried through from ali_question_bank so a report/diagnostic consumer can
    -- correctly roll subparts up into their own numbered question. NULL on every standalone row.
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
$function$;
