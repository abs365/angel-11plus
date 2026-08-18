-- Angel Digital 11+ — Migration 074
-- Programme Increment 008F — Mock Scoring, Analysis and Educational
-- Intelligence Integration: secure marking + governed report release.
--
-- ARCHITECTURE DECISION, disclosed: reconnaissance for this increment
-- (see ALI_DECISION_LOG.md) found that `ali_student_question_history` —
-- the table `recordOutcome()`/`processEvidenceForCompetency()` (Practice's
-- own evidence pipeline) read and write — has NO evidence-provenance
-- column at all. If a Mock attempt's outcomes were written into that same
-- table via the same path, Mock evidence would become silently
-- indistinguishable from Practice evidence — exactly the contamination
-- 008F's own Core Principle forbids ("a high Mock score must not
-- automatically make a competency mastered"). This migration therefore
-- does NOT touch `ali_student_question_history`, `ali_durable_mastery`,
-- `ali_educational_audit`, or call into the Educational Intelligence
-- Engine at all. Mock evidence is computed and stored ONLY inside
-- `ali_mock_attempt_report.competency_evidence` — a real, provenance-
-- tagged ("source": "mock") record, available for reporting, but not
-- consumed by mastery/readiness until a future, separately-scoped
-- increment adds a genuine provenance dimension to the shared evidence
-- pipeline and can safely merge it. This is the "build the correct
-- boundary/adapter rather than bypassing it" fallback the 008F directive
-- itself names for exactly this situation.
--
-- Also disclosed: this migration applies the anon-execute-revoke pattern
-- CORRECTLY, from the start, for both new functions — the exact lesson
-- migration 072's own omission (Decisions 94/95) established. No
-- follow-up hardening migration should be needed for these two functions.
--
-- Extends the existing ali_mock_attempt_report table (migration 072,
-- applied) rather than creating a parallel report system, per this
-- increment's own explicit instruction. Does NOT touch any of the 8
-- proven Mock RPCs from migrations 070/072, their grants, or any RLS
-- policy other than this migration's own two new functions' internal
-- checks (no policy is created, dropped, or altered).
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations 069-073
-- have already been applied (confirmed, Decisions 87/89/91/96).

begin;

-- === Extend ali_mock_attempt_report (072) with marking provenance =====

alter table public.ali_mock_attempt_report
  add column if not exists marking_version integer;

alter table public.ali_mock_attempt_report
  add column if not exists released_at timestamptz;

-- === Function: mock_score_attempt ====================================
--
-- Server-side, deterministic, reproducible marking for a SUBMITTED
-- (locked, immutable) attempt only — never in_progress. Idempotent per
-- marking_version: a second call with the same CURRENT_MARKING_VERSION
-- is a no-op once already scored at that version, so re-running scoring
-- for the same immutable attempt always produces the same result, per
-- this increment's own explicit requirement.
--
-- Deliberately conservative auto-marking scope, disclosed precisely
-- (not silently narrowed): a question is auto-marked "correct"/
-- "incorrect" ONLY when its stored answer is a single scalar (no
-- semicolon-delimited alternate forms — checkMathsAnswer's own
-- alternate-answer handling is NOT replicated here) and the comparison
-- is either numeric (both sides cast cleanly to numeric, compared within
-- the SAME 0.0001 tolerance lib/learningEngine/practiceContent.ts's own
-- checkMathsAnswer() uses, kept in sync by convention, not by shared
-- code — SQL and TypeScript cannot literally share a constant) or exact
-- case/whitespace-insensitive string equality. Every other case —
-- multi-form answers, English comprehension without a clean scalar
-- match, and Continuous Writing always — is marked
-- 'requires_manual_marking', never silently guessed. This is a narrower
-- scope than checkMathsAnswer's own unit-parsing/currency-stripping/
-- alternate-answer logic (Practice's grader) — a deliberate, disclosed
-- choice: replicating that fuller logic inside untested PL/pgSQL, with
-- no real Mock content yet to validate against, was judged a real
-- correctness risk not worth taking in this increment. Named as a
-- follow-up for a future increment, not silently narrowed.
--
-- Status model, disclosed as a deliberate simplification of the 008F
-- directive's own five-category list (correct/incorrect/unanswered/
-- invalid-unmarkable/future-manually-marked): this function collapses
-- "invalid/unmarkable" into 'requires_manual_marking' rather than
-- tracking it as a sixth-distinct state — both mean "a human, not this
-- auto-marker, must resolve this," and no real content exists yet to
-- demonstrate a genuine need for the distinction. A future increment can
-- split them if real Mock content surfaces a real reason to.
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
    -- A manifest question that no longer resolves to a real bank row is
    -- treated the same as unmarkable, never silently skipped from the
    -- outcome list.
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

    if v_response is null then
      v_status := 'unanswered';
      v_marks_awarded := 0;
      v_unanswered_count := v_unanswered_count + 1;
    else
      v_answered_count := v_answered_count + 1;
      v_response_value := v_response->>'value';
      v_stored_answer := v_bank_row.prompt->>'answer';

      -- Writing/essay content, or an answer this migration's own
      -- disclosed scope excludes (multi-form / semicolon-delimited), or
      -- a stored answer this migration cannot cleanly compare: manual.
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
      -- v_bank_row.skill is already delivered to the client via
      -- mock_get_question()'s own redacted payload (migration 070) --
      -- not a protected field, safe to include here. Lets the TS-side
      -- evidence adapter classify outcomes by competency using the
      -- REAL, single QUESTION_TYPE_PRIMARY_COMPETENCY mapping
      -- (lib/learningEngine/assessmentBrainMap.ts) rather than this
      -- migration duplicating that mapping into SQL.
      'questionTypeId', v_bank_row.skill
    );
  end loop;

  -- A fair percentage cannot be stated while any question still awaits
  -- manual marking -- never silently computed against a partial total.
  if v_manual_count > 0 or v_raw_available = 0 then
    v_percentage := null;
  else
    v_percentage := round((v_raw_achieved / v_raw_available) * 100, 1);
  end if;

  update public.ali_mock_attempt_report
  set scoring_state = 'scored',
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

-- === Function: mock_release_report ===================================
--
-- Report release cannot be self-authorised by the learner (008F's own
-- explicit security requirement): the EXECUTE grant is authenticated
-- (matching every other function's own grant model), but the function
-- BODY itself requires is_current_user_admin() — the same admin-gating
-- pattern ali_mock_form_admin_write's own RLS policy already uses,
-- applied here inside a SECURITY DEFINER function body since a function
-- (unlike a policy) is not itself subject to RLS. An ordinary
-- authenticated learner calling this on their own attempt is rejected
-- exactly as if they had no execute grant at all.
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
    and scoring_state = 'scored';

  if not found then
    raise exception 'Report for attempt % cannot be released (not found, or scoring_state <> ''scored'')', p_attempt_id;
  end if;
end;
$$;

-- Execute grants: authenticated only, never anon or public -- applied
-- correctly and completely in this same migration, for both functions,
-- from the start.
revoke all on function public.mock_score_attempt(uuid) from public;
grant execute on function public.mock_score_attempt(uuid) to authenticated;
revoke execute on function public.mock_score_attempt(uuid) from anon;

revoke all on function public.mock_release_report(uuid) from public;
grant execute on function public.mock_release_report(uuid) to authenticated;
revoke execute on function public.mock_release_report(uuid) from anon;

commit;
