-- Angel Digital 11+ — Migration 219
-- Programme Completion Increment 016 — Authoritative Reading Comprehension
-- Scoring: the least-privilege database boundary.
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS
-- ============================================================
-- Investigation this increment found mock_score_attempt() (migrations
-- 074/075) only ever reads prompt->>'answer' -- a plain scalar Mathematics
-- content uses, but no Reading question has ever set. Every Reading
-- question instead carries a real, already-approved, tiered answer
-- contract (modelAnswer/acceptedAnswers/quotationRequired/orderedAnswer/
-- correctOptions/validationTier), matched by
-- lib/learningEngine/englishAnswerValidation.ts's
-- scoreEnglishComprehensionAnswer() -- already live, already used by
-- Practice. That function is TypeScript; it cannot run inside Postgres,
-- and the Founder's own directive explicitly forbids re-implementing it in
-- PL/pgSQL (drift risk in educationally-sensitive logic) and forbids a
-- learner-callable RPC gated by a secret parameter (still reachable by any
-- authenticated learner's own browser, so a leaked secret would let a
-- learner fabricate their own English Mock marks).
--
-- The chosen boundary instead: a dedicated, least-privilege Postgres LOGIN
-- role (mock_scoring_writer), reached ONLY via a direct/pooled Postgres
-- connection -- structurally invisible to PostgREST/supabase-js regardless
-- of what JWT a caller presents, not merely gated by a value inside a
-- function body. This migration creates the two narrow SECURITY DEFINER
-- functions that role may call, and revokes execution from every other
-- role explicitly (public/anon/authenticated). It does NOT create the role
-- itself or set its password -- see "FOUNDER-ONLY SETUP" below; no
-- production secret may ever appear in this repository.
--
-- ============================================================
-- THREAT MODEL, DISCLOSED PRECISELY (not minimised)
-- ============================================================
-- mock_persist_reading_scoring() necessarily accepts a caller-supplied
-- marksAwarded per question -- Postgres cannot independently verify
-- whether a TIER1/TIER2/TIER4/TIER6 answer is genuinely correct without
-- reimplementing scoreEnglishComprehensionAnswer() itself, which this
-- migration deliberately does not do. A compromised mock_scoring_writer
-- credential is therefore a genuine, narrow SCORING-AUTHORITY credential,
-- not a merely-inert one: it could fabricate correctness for a genuinely-
-- attempted deterministic-tier Reading question, for any submitted Reading
-- attempt (this role carries no learner-identity scoping the way
-- auth.uid() does). Every other invariant below IS independently,
-- structurally enforced regardless of caller intent:
--   - bounded to that exact question's own canonical marks (never
--     invented, never exceeding the real ceiling);
--   - never awarded for a question with no genuine stored response
--     (forced 'unanswered' regardless of caller input);
--   - never awarded for a TIER3/TIER5 question (forced
--     'requires_manual_marking' regardless of caller input -- this one
--     invariant needs no re-implementation of the English engine, only
--     reading the already-authored validationTier field);
--   - cannot touch Mathematics (attempt_type/form_id checked);
--   - cannot release any report (mock_release_report's own, separate,
--     admin-gated function is untouched, no grant exists here);
--   - cannot read or write any other table (no direct table grant to the
--     role at all -- only EXECUTE on these two functions).
--
-- ============================================================
-- FOUNDER-ONLY SETUP (do NOT run this section's SQL from this file --
-- it is illustrative only, and the real password must never be committed)
-- ============================================================
-- After applying this migration, separately and manually:
--   1. create role mock_scoring_writer with login password '<a password
--      you generate yourself, never shared with or typed to Claude>';
--   2. Set the SAME value as MOCK_SCORING_DATABASE_URL in Vercel's
--      Production environment variables (server-only, never
--      NEXT_PUBLIC_-prefixed), using Supabase's pooled connection string
--      shape with mock_scoring_writer as the user:
--      postgresql://mock_scoring_writer.<project_ref>:<password>@<pooler-host>:6543/postgres
--      (exact project_ref/pooler-host copied from Project Settings >
--      Database > Connection string -- do not assume the hostname
--      pattern).
--
-- ============================================================
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does not create the mock_scoring_writer role or set any password (see
-- above). Does not touch mock_score_attempt(), mock_analyse_attempt(),
-- mock_release_report(), or any existing Mock RPC. Does not touch
-- Mathematics content or Mathematics scoring in any way. Does not change
-- ali_mock_form, ali_question_bank content, or manifest/eligibility. Does
-- not add pg_net, pg_cron, or any extension. Does not grant anything to
-- anon or authenticated. Does not release or alter either existing
-- production Reading attempt.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query.

begin;

-- ============================================================
-- Function: mock_claim_reading_scoring_work
-- ============================================================
-- Read-only from the caller's perspective (returns data, writes nothing).
-- Returns everything the server-only TypeScript orchestration needs to
-- compute a genuine result for one Reading attempt: canonical
-- answer-contract fields per assigned question (from ali_question_bank,
-- never exposed to any learner payload -- mock_get_question()'s own
-- allow-list, migration 218, is untouched by this function and remains
-- the only thing a browser can ever reach) and the learner's own already-
-- submitted response text. Returns {eligible: false, reason: ...} rather
-- than raising, for every "nothing to do" case -- this is a discovery
-- function (mirrors mock_get_resumable_attempt's own "return an empty/
-- negative result, never an exception, for an ordinary not-yet-true
-- condition" convention, migration 149), not a mutation.
create or replace function public.mock_claim_reading_scoring_work(p_attempt_id uuid)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_attempt public.ali_mock_attempt;
  v_report public.ali_mock_attempt_report;
  v_questions jsonb := '[]'::jsonb;
  v_question_id text;
  v_bank_row public.ali_question_bank;
  v_response jsonb;
begin
  select * into v_attempt from public.ali_mock_attempt where id = p_attempt_id;
  if not found then
    return jsonb_build_object('eligible', false, 'reason', 'attempt_not_found');
  end if;
  if v_attempt.status <> 'submitted' then
    return jsonb_build_object('eligible', false, 'reason', 'not_submitted');
  end if;
  if v_attempt.attempt_type <> 'timed_section' or v_attempt.form_id <> 'reading-comprehension-mock-1' then
    return jsonb_build_object('eligible', false, 'reason', 'not_reading_comprehension_mock_1');
  end if;

  select * into v_report from public.ali_mock_attempt_report where attempt_id = p_attempt_id;
  if not found then
    return jsonb_build_object('eligible', false, 'reason', 'no_report_row');
  end if;
  if v_report.scoring_state = 'scored' then
    return jsonb_build_object('eligible', false, 'reason', 'already_scored');
  end if;

  foreach v_question_id in array v_attempt.assigned_question_ids loop
    select * into v_bank_row from public.ali_question_bank where id = v_question_id;
    if not found then
      continue;
    end if;

    select response into v_response from public.ali_mock_attempt_answer
      where attempt_id = p_attempt_id and question_id = v_question_id;

    v_questions := v_questions || jsonb_build_object(
      'questionId', v_question_id,
      'marks', coalesce((v_bank_row.prompt->>'marks')::numeric, 1),
      'validationTier', v_bank_row.prompt->>'validationTier',
      'modelAnswer', v_bank_row.prompt->>'modelAnswer',
      'acceptedAnswers', v_bank_row.prompt->'acceptedAnswers',
      'quotationRequired', v_bank_row.prompt->'quotationRequired',
      'orderedAnswer', v_bank_row.prompt->'orderedAnswer',
      'correctOptions', v_bank_row.prompt->'correctOptions',
      'requiredSelectionCount', v_bank_row.prompt->'requiredSelectionCount',
      'userAnswer', coalesce(v_response->>'value', '')
    );
  end loop;

  return jsonb_build_object('eligible', true, 'attemptId', p_attempt_id, 'questions', v_questions);
end;
$$;

revoke all on function public.mock_claim_reading_scoring_work(uuid) from public;
revoke execute on function public.mock_claim_reading_scoring_work(uuid) from anon;
revoke execute on function public.mock_claim_reading_scoring_work(uuid) from authenticated;

-- ============================================================
-- Function: mock_persist_reading_scoring
-- ============================================================
-- The one, narrow write boundary. Every invariant below is checked by
-- Postgres itself, independent of caller intent -- see the threat-model
-- header above for exactly what is, and is not, independently verifiable
-- without duplicating the English engine.
create or replace function public.mock_persist_reading_scoring(p_attempt_id uuid, p_outcomes jsonb)
returns jsonb
language plpgsql
security definer
set search_path = public
as $$
declare
  v_attempt public.ali_mock_attempt;
  v_current_marking_version constant integer := 1;
  v_outcome jsonb;
  v_question_id text;
  v_status text;
  v_marks_awarded numeric;
  v_bank_row public.ali_question_bank;
  v_canonical_marks numeric;
  v_has_response boolean;
  v_response jsonb;
  v_final_outcomes jsonb := '[]'::jsonb;
  v_seen_ids text[] := array[]::text[];
  v_manual_count integer := 0;
  v_correct_count integer := 0;
  v_incorrect_count integer := 0;
  v_partial_count integer := 0;
  v_unanswered_count integer := 0;
  v_answered_count integer := 0;
  v_raw_achieved numeric := 0;
  v_raw_available numeric := 0;
  v_percentage numeric;
  v_final_scoring_state text;
begin
  select * into v_attempt from public.ali_mock_attempt where id = p_attempt_id;
  if not found then
    raise exception 'Attempt % not found', p_attempt_id;
  end if;
  if v_attempt.status <> 'submitted' then
    raise exception 'Attempt % is not submitted (status=%) -- only a locked, submitted attempt may be scored', p_attempt_id, v_attempt.status;
  end if;
  if v_attempt.attempt_type <> 'timed_section' or v_attempt.form_id <> 'reading-comprehension-mock-1' then
    raise exception 'Attempt % is not a Reading Comprehension Mock 1 attempt (attempt_type=%, form_id=%)', p_attempt_id, v_attempt.attempt_type, v_attempt.form_id;
  end if;

  -- Idempotent, matching mock_score_attempt()'s own established convention.
  if exists (
    select 1 from public.ali_mock_attempt_report
    where attempt_id = p_attempt_id and scoring_state = 'scored' and marking_version = v_current_marking_version
  ) then
    return jsonb_build_object('status', 'already_scored');
  end if;

  if p_outcomes is null or jsonb_typeof(p_outcomes) <> 'array' then
    raise exception 'p_outcomes must be a JSON array';
  end if;
  if jsonb_array_length(p_outcomes) <> coalesce(array_length(v_attempt.assigned_question_ids, 1), 0) then
    raise exception 'Outcome count (%) does not match assigned question count (%)', jsonb_array_length(p_outcomes), array_length(v_attempt.assigned_question_ids, 1);
  end if;

  for v_outcome in select * from jsonb_array_elements(p_outcomes)
  loop
    v_question_id := v_outcome->>'questionId';

    if v_question_id is null or not (v_question_id = any(v_attempt.assigned_question_ids)) then
      raise exception 'Question % is not part of attempt %''s assigned manifest', v_question_id, p_attempt_id;
    end if;
    if v_question_id = any(v_seen_ids) then
      raise exception 'Duplicate outcome supplied for question %', v_question_id;
    end if;
    v_seen_ids := v_seen_ids || v_question_id;

    select * into v_bank_row from public.ali_question_bank where id = v_question_id;
    if not found then
      raise exception 'Question % no longer resolves to a bank row', v_question_id;
    end if;

    v_canonical_marks := coalesce((v_bank_row.prompt->>'marks')::numeric, 1);
    v_raw_available := v_raw_available + v_canonical_marks;

    select response into v_response from public.ali_mock_attempt_answer
      where attempt_id = p_attempt_id and question_id = v_question_id;
    v_has_response := v_response is not null and coalesce(trim(v_response->>'value'), '') <> '';

    if (v_bank_row.prompt->>'validationTier') in ('TIER3_QUOTATION_PLUS_EXPLANATION', 'TIER5_NAMED_COMPONENT_PLUS_EXPLANATION') then
      -- Hard-enforced regardless of caller input. Postgres does not need
      -- to know HOW to grade these -- only THAT they may never resolve to
      -- an automatic mark.
      v_status := 'requires_manual_marking';
      v_marks_awarded := null;
      v_manual_count := v_manual_count + 1;
    elsif not v_has_response then
      -- No genuine stored response -- the caller's claim is never trusted
      -- for this case.
      v_status := 'unanswered';
      v_marks_awarded := 0;
      v_unanswered_count := v_unanswered_count + 1;
    else
      v_answered_count := v_answered_count + 1;
      v_marks_awarded := (v_outcome->>'marksAwarded')::numeric;
      if v_marks_awarded is null or v_marks_awarded > v_canonical_marks or v_marks_awarded < 0 then
        raise exception 'Question % supplied marksAwarded % outside canonical bound [0,%]', v_question_id, v_marks_awarded, v_canonical_marks;
      end if;
      -- status is DERIVED from the (canonically-bounded) marks value, never
      -- trusted as a separate caller claim -- closes any possibility of a
      -- caller asserting a status inconsistent with the marks it supplied.
      if v_marks_awarded = v_canonical_marks then
        v_status := 'correct';
        v_correct_count := v_correct_count + 1;
      elsif v_marks_awarded = 0 then
        v_status := 'incorrect';
        v_incorrect_count := v_incorrect_count + 1;
      else
        v_status := 'partially_correct';
        v_partial_count := v_partial_count + 1;
      end if;
    end if;

    if v_marks_awarded is not null then
      v_raw_achieved := v_raw_achieved + v_marks_awarded;
    end if;

    v_final_outcomes := v_final_outcomes || jsonb_build_object(
      'questionId', v_question_id,
      'status', v_status,
      'marksAwarded', v_marks_awarded,
      'marksAvailable', v_canonical_marks,
      'questionTypeId', v_bank_row.skill
    );
  end loop;

  if v_manual_count > 0 or v_raw_available = 0 then
    v_percentage := null;
  else
    v_percentage := round((v_raw_achieved / v_raw_available) * 100, 1);
  end if;

  v_final_scoring_state := case when v_manual_count > 0 then 'scoring' else 'scored' end;

  update public.ali_mock_attempt_report
  set scoring_state = v_final_scoring_state,
      marking_version = v_current_marking_version,
      question_outcomes = v_final_outcomes,
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

  if not found then
    raise exception 'No report row exists for attempt % -- the migration 072 report-init trigger should have created one on submission', p_attempt_id;
  end if;

  -- report_release_state and analysis_state are never referenced or
  -- written by this function -- report release stays exclusively behind
  -- mock_release_report()'s own, separate, admin-gated check (migration
  -- 074), and analysis stays exclusively behind the existing, unmodified
  -- trigger (migration 151/075), which itself only ever fires when
  -- scoring_state genuinely reaches 'scored'.
  return jsonb_build_object('status', 'scored', 'scoringState', v_final_scoring_state);
end;
$$;

revoke all on function public.mock_persist_reading_scoring(uuid, jsonb) from public;
revoke execute on function public.mock_persist_reading_scoring(uuid, jsonb) from anon;
revoke execute on function public.mock_persist_reading_scoring(uuid, jsonb) from authenticated;

-- ============================================================
-- The dedicated role's ONLY grants, anywhere in the database.
-- ============================================================
-- No direct table grant of any kind. If mock_scoring_writer does not yet
-- exist (this migration is applied before the Founder-only role-creation
-- step above), these GRANTs are simply deferred -- re-run them after the
-- role exists if applied in that order; a GRANT to a non-existent role
-- fails safely (an error, not a silent no-op), so this section is written
-- defensively as its own statement, safe to re-run.
do $$
begin
  if exists (select 1 from pg_roles where rolname = 'mock_scoring_writer') then
    grant execute on function public.mock_claim_reading_scoring_work(uuid) to mock_scoring_writer;
    grant execute on function public.mock_persist_reading_scoring(uuid, jsonb) to mock_scoring_writer;
  else
    raise notice 'mock_scoring_writer role does not exist yet -- grants deferred. Re-run the two GRANT statements above (or this migration) after creating the role per this file''s own FOUNDER-ONLY SETUP section.';
  end if;
end;
$$;

commit;
