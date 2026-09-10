-- Angel Digital 11+ — Migration 251
-- CSSE Two-Paper Mock P1 Repair (P1-B) — the smallest legitimate
-- scoring-completion path for the English Full Mock, plus the one
-- narrowly-scoped recovery action the Mathematics acceptance attempt
-- needs now that migration 250 has restored analysis invocation for
-- every FUTURE attempt.
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS -- TWO GAPS, TRACED, NOT ASSUMED
-- ============================================================
-- GAP 1 (named in the Founder's own repair brief): english-full-mock-v1
-- contains two criterion_rubric Writing questions (migration 245's own
-- design: mock_score_attempt() correctly, permanently leaves a Writing
-- question's question_outcomes entry at requires_manual_marking -- "no
-- CSSE-legitimate numeric mark exists for this component" -- so
-- scoring_state can never reach 'scored' through mock_score_attempt()
-- alone for this form, by design). ali_writing_assessment (migration
-- 245) is the sole authoritative qualitative record. No function
-- anywhere, before this migration, ever re-examines question_outcomes
-- after a Writing assessment is persisted to decide "is this attempt's
-- scoring now genuinely complete" -- mock_persist_writing_assessment()
-- writes the assessment row and returns, nothing more.
--
-- GAP 2 (found this session while tracing GAP 1, NOT named in the
-- original root-cause report -- disclosed here precisely, not silently
-- folded in): english-full-mock-v1's own question_manifest (migration
-- 245) copies reading-comprehension-mock-1's entire manifest verbatim --
-- ~15 real Reading Comprehension questions. Migration 220's own legacy-
-- scorer exclusion guard is a NAMED LITERAL
-- (form_id = 'reading-comprehension-mock-1') -- it does not match
-- english-full-mock-v1, so those ~15 Reading questions fall through to
-- mock_score_attempt() (the legacy, Mathematics-only scorer), whose
-- v_stored_answer is null for every Reading question (confirmed by
-- migration 220's own header and by mock_claim_reading_scoring_work()'s
-- own field list, migration 219) -- forcing every one of them to
-- requires_manual_marking too, exactly the defect migration 220 already
-- diagnosed and fixed for the OLD form, but not for this NEW one.
-- Neither the Increment 016 Reading authority (migration 219, hard-
-- locked to form_id = 'reading-comprehension-mock-1') nor
-- mock_apply_manual_mark() (migration 227, hard-locked to the same
-- literal) can touch these ~15 items today. Left unaddressed, English
-- could never reach scoring_state='scored' no matter how Writing
-- assessment is resolved, because 15 Reading items would remain
-- permanently, structurally unscorable -- the Founder's own explicit
-- requirement (repair brief, Section 7: "a NEW English full_mock attempt
-- can: submitted -> deterministic components scored -> Writing
-- assessment completed -> scored -> analysis complete -- without manual
-- database intervention") is unreachable without also closing this gap.
--
-- GAP 3, DISCLOSED, NOT CLOSED HERE (client-side deadlock): app/
-- learning-intelligence/mock-report/[attemptId]/page.tsx currently fires
-- requestMockWritingAssessment() only INSIDE the branch where
-- reportReleaseState === "released" -- but release requires
-- scoring_state='scored', which (after this migration) requires Writing
-- assessment to have already run. This is a real, separate, application-
-- layer circularity this migration's own SQL cannot fix -- closed by a
-- bounded change to that page in this same repair pass (see the
-- accompanying P1 REPAIR REPORT, Section C) that moves the Writing-
-- assessment request into the SAME "not yet released" branch the
-- existing Reading-scoring recovery request already uses, unchanged in
-- every other respect.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES (four additive changes, one narrow recovery
-- function)
-- ============================================================
-- 1. mock_claim_reading_scoring_work() / mock_persist_reading_scoring()
--    (migration 219's own two functions) -- CREATE OR REPLACE, ONE
--    targeted widening only: the existing single-literal eligibility
--    guard (form_id = 'reading-comprehension-mock-1') becomes a
--    two-literal guard also accepting
--    (attempt_type='full_mock' and form_id='english-full-mock-v1') --
--    named, bounded, additive, not a general "any full_mock form" rule.
--    Every other line of migration 219's own logic is byte-for-byte
--    unchanged.
-- 2. mock_persist_reading_scoring() gets ONE additional hard-enforced
--    invariant, mirroring the existing TIER3/TIER5 override exactly:
--    a question whose ali_question_bank.subject = 'writing' is forced to
--    requires_manual_marking regardless of any caller-supplied
--    marksAwarded -- Writing content is never scored as a Reading-style
--    scalar mark by this or any function. (mock_claim_reading_scoring_
--    work() already, harmlessly, returns a claim entry for a Writing
--    question today -- its validationTier/modelAnswer/etc. fields are
--    simply null, which the existing TS orchestration
--    (lib/mockAttempt/readingScoringOrchestration.ts,
--    scoreEnglishComprehensionAnswer()'s own `if (!tier)` branch) already
--    handles without throwing; that computed value is now always
--    discarded by this new database-side override, exactly the same
--    "Postgres enforces it regardless of caller intent" discipline this
--    function already uses for TIER3/TIER5.)
-- 3. mock_persist_writing_assessment() (migration 245) -- CREATE OR
--    REPLACE, full existing body preserved verbatim, ONE additive call
--    inserted immediately before its own final return: perform public.
--    mock_check_and_complete_scoring(p_attempt_id).
-- 4. mock_check_and_complete_scoring(p_attempt_id uuid) -- ONE new,
--    internal-only function (no grant to any role, callable solely via
--    perform from inside another SECURITY DEFINER function's own owner
--    context -- the same mock_question_type_competency()/mock_analyse_
--    attempt() precedent, migrations 151/227). Implements the Founder's
--    own explicit contract for what scoring_state='scored' must mean for
--    ANY attempt whose scoring_state is currently 'scoring': every
--    question_outcomes entry still at requires_manual_marking must
--    either (a) belong to a question whose ali_question_bank.subject =
--    'writing' AND already have a corresponding ali_writing_assessment
--    row (the "Writing assessment completion" contract -- 'complete' or
--    'review_required' both count: this function does not require the
--    approved qualitative result to be conclusive, only for the
--    assessment CONTRACT itself to have run, exactly as the Founder's
--    own brief specifies -- "scored" never means "every Writing response
--    received an official CSSE numeric mark"), or (b) not exist at all.
--    If every remaining manual item is resolved this way, transitions
--    scoring_state to 'scored' and invokes the existing, unmodified
--    mock_analyse_attempt() -- the SAME function every other invocation
--    site in this codebase already calls, never a second analysis
--    engine. If any remaining manual item is a non-Writing question
--    (e.g. a genuine TIER3/TIER5 Reading item with no marking authority
--    scoped to this form -- see GAP 2's own disclosure above and the
--    accompanying report's own named residual limitation), this function
--    correctly, safely does nothing and leaves scoring_state at
--    'scoring' -- fails closed, never guesses, never silently drops a
--    genuinely-unresolved item.
-- 5. mock_backfill_named_mathematics_acceptance_analysis() -- the ONE
--    narrowly-scoped recovery action named by the Founder's own repair
--    brief (Section 6): admin-gated (is_current_user_admin(), the same
--    gate mock_release_report()/mock_apply_manual_mark() already use),
--    takes NO parameter at all -- the exact attempt id
--    (ed253ddf-ba91-4a49-b256-e83083780f3a) is a hardcoded literal
--    inside the function body, not a caller-supplied argument, so this
--    is not a reusable/general backfill capability of any kind. Calls
--    the REAL, unmodified mock_analyse_attempt() for that one attempt --
--    never reimplements or approximates its logic, never writes
--    analysis_state/skill_evidence/strengths/weaknesses directly. Exists
--    only because that attempt's scoring_state already, genuinely
--    reached 'scored' (confirmed by the Founder's own read-only
--    production query, 2026-09-10) before migration 250 restored
--    automatic analysis invocation -- migration 250's trigger fix cannot
--    retroactively re-fire for an attempt whose status transition to
--    'submitted' already happened and committed. English needs no
--    equivalent function: once this migration and the accompanying
--    page.tsx change are applied, the existing, already-approved,
--    already-idempotent Reading-scoring-recovery and Writing-assessment-
--    request mechanisms (both already fire automatically when the
--    learner's own report page is visited) are sufficient to carry the
--    English acceptance attempt through the real pipeline with no new
--    backfill function of any kind -- see the accompanying P1 REPAIR
--    REPORT, Section F.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does not touch mock_score_attempt(), mock_analyse_attempt(),
-- mock_release_report(), mock_apply_manual_mark(), mock_attempt_report_
-- init() (migration 250's own file), or any Mathematics/Reading Mock 1
-- content or scoring rule -- reading-comprehension-mock-1's own
-- eligibility branch through mock_claim_reading_scoring_work()/mock_
-- persist_reading_scoring() is completely unaffected by the widened
-- guard (it is a strict OR-additional-literal, never a removal or
-- loosening of the original condition). Does not force any Writing
-- response into a binary correct/incorrect outcome, does not invent an
-- official CSSE Writing raw-mark formula, does not change the approved
-- five-dimension Writing assessment model, does not remove human-review
-- safety, does not change RLS, does not create a service-role bypass,
-- does not redesign the Mock engine. Does not extend mock_apply_manual_
-- mark() to this form -- GAP 2's own disclosure above and the
-- accompanying report name this as a deliberate, disclosed residual
-- limitation (a genuine TIER3/TIER5 Reading item inside english-full-
-- mock-v1's manifest, if one exists, has no resolution path after this
-- migration either) rather than a speculative extension of an already-
-- approved, historically-precedented function without confirmed need.
-- Does not release, rescore, or directly mutate the English acceptance
-- attempt's report row -- its recovery is entirely a consequence of the
-- real, governed pipeline running normally (see report Section F), never
-- a direct write.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migration 250 (this
-- same repair pass) has already been applied.

begin;

-- ============================================================
-- 1 + 2. mock_claim_reading_scoring_work() -- widened eligibility guard
-- only, every other line byte-for-byte identical to migration 219.
-- ============================================================
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
  -- Migration 251's own one widening: named, bounded, additive -- a
  -- second exact (attempt_type, form_id) pair, not a general rule.
  if not (
    (v_attempt.attempt_type = 'timed_section' and v_attempt.form_id = 'reading-comprehension-mock-1')
    or (v_attempt.attempt_type = 'full_mock' and v_attempt.form_id = 'english-full-mock-v1')
  ) then
    return jsonb_build_object('eligible', false, 'reason', 'not_reading_authority_eligible_form');
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

-- Grants unchanged from migration 219 -- CREATE OR REPLACE with the
-- identical signature preserves existing grants; not restated.

-- ============================================================
-- mock_persist_reading_scoring() -- widened eligibility guard (identical
-- pattern to above) + ONE new hard-enforced Writing override + ONE
-- additive completion-check call at the end. Every other line byte-for-
-- byte identical to migration 219.
-- ============================================================
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
  -- Migration 251's own one widening -- see mock_claim_reading_scoring_
  -- work() above for the identical rationale.
  if not (
    (v_attempt.attempt_type = 'timed_section' and v_attempt.form_id = 'reading-comprehension-mock-1')
    or (v_attempt.attempt_type = 'full_mock' and v_attempt.form_id = 'english-full-mock-v1')
  ) then
    raise exception 'Attempt % is not eligible for the Reading scoring authority (attempt_type=%, form_id=%)', p_attempt_id, v_attempt.attempt_type, v_attempt.form_id;
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

    if v_bank_row.subject = 'writing' then
      -- Migration 251's own hard-enforced override -- see this
      -- migration's own header. Never scored here as a Reading-style
      -- scalar mark, regardless of what the caller supplies; the sole
      -- authoritative qualitative record is ali_writing_assessment
      -- (migration 245), written exclusively by mock_persist_writing_
      -- assessment().
      v_status := 'requires_manual_marking';
      v_marks_awarded := null;
      v_manual_count := v_manual_count + 1;
    elsif (v_bank_row.prompt->>'validationTier') in ('TIER3_QUOTATION_PLUS_EXPLANATION', 'TIER5_NAMED_COMPONENT_PLUS_EXPLANATION') then
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

  -- Migration 251's own one additive call: safe, idempotent no-op for
  -- reading-comprehension-mock-1 (scoring_state is already 'scored'
  -- immediately above whenever v_manual_count = 0, so this function finds
  -- nothing to do and returns -- no behaviour change for that form).
  -- Meaningful only for english-full-mock-v1, and only in the edge case
  -- where Writing assessment already completed before this Reading pass
  -- ran -- the ordinary case (Reading first) is completed from inside
  -- mock_persist_writing_assessment() instead, once the last Writing item
  -- is assessed.
  perform public.mock_check_and_complete_scoring(p_attempt_id);

  -- report_release_state is never referenced or written by this function
  -- -- report release stays exclusively behind mock_release_report()'s
  -- own, separate, admin-gated check (migration 074/227). analysis_state
  -- is never assigned directly by this function either -- only
  -- mock_check_and_complete_scoring() -> mock_analyse_attempt() ever
  -- writes it, exactly the same separation migration 219 originally
  -- established.
  return jsonb_build_object('status', 'scored', 'scoringState', v_final_scoring_state);
end;
$$;

-- Grants unchanged from migration 219 -- CREATE OR REPLACE with the
-- identical signature preserves existing grants (mock_scoring_writer
-- only); not restated.

-- ============================================================
-- 3. mock_persist_writing_assessment() (migration 245) -- CREATE OR
-- REPLACE, full existing body preserved verbatim, ONE additive call
-- inserted immediately before the final return.
-- ============================================================
create or replace function public.mock_persist_writing_assessment(
  p_attempt_id uuid,
  p_question_id text,
  p_task_type text,
  p_rubric_version integer,
  p_assessment_version integer,
  p_dimensions jsonb,
  p_overall_indicator numeric,
  p_assessment_status text,
  p_review_required_reasons text[],
  p_automated_model text
)
returns boolean
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_profile_id     uuid;
  v_attempt        public.ali_mock_attempt;
  v_bank_row       public.ali_question_bank;
  v_report         public.ali_mock_attempt_report;
  v_outcomes       jsonb;
  v_idx            int;
  v_found          boolean := false;
  v_outcome_status text;
  v_response_text  text;
  v_row_count      int;
begin
  select id into v_profile_id from public.profiles where auth_user_id = auth.uid();
  if v_profile_id is null then
    raise exception 'No profile found for the current caller';
  end if;

  select * into v_attempt from public.ali_mock_attempt where id = p_attempt_id;
  if not found then
    raise exception 'Attempt % not found', p_attempt_id;
  end if;
  if not (v_attempt.profile_id = v_profile_id or public.is_current_user_admin()) then
    raise exception 'Attempt % does not belong to the current caller', p_attempt_id;
  end if;
  if v_attempt.status <> 'submitted' then
    raise exception 'Attempt % is not submitted (status=%) -- refusing to assess an in-progress or unstarted attempt', p_attempt_id, v_attempt.status;
  end if;

  select * into v_bank_row from public.ali_question_bank where id = p_question_id;
  if not found then
    raise exception 'Question % not found', p_question_id;
  end if;
  if v_bank_row.subject <> 'writing' then
    raise exception 'Question % is not a Writing question (subject=%)', p_question_id, v_bank_row.subject;
  end if;
  if not (p_question_id = any(v_attempt.assigned_question_ids)) then
    raise exception 'Question % is not part of attempt %''s assigned manifest', p_question_id, p_attempt_id;
  end if;

  if p_task_type not in ('Q1', 'Q2') then
    raise exception 'Invalid task_type % -- must be Q1 or Q2', p_task_type;
  end if;
  if p_assessment_status not in ('complete', 'review_required') then
    raise exception 'Invalid assessment_status %', p_assessment_status;
  end if;
  if p_assessment_status = 'review_required' and (p_review_required_reasons is null or array_length(p_review_required_reasons, 1) is null) then
    raise exception 'review_required assessment_status requires at least one reason';
  end if;

  select * into v_report from public.ali_mock_attempt_report where attempt_id = p_attempt_id for update;
  if not found then
    raise exception 'No report row exists for attempt %', p_attempt_id;
  end if;

  v_outcomes := coalesce(v_report.question_outcomes, '[]'::jsonb);
  for v_idx in 0 .. jsonb_array_length(v_outcomes) - 1 loop
    if (v_outcomes -> v_idx ->> 'questionId') = p_question_id then
      v_found := true;
      v_outcome_status := v_outcomes -> v_idx ->> 'status';
    end if;
  end loop;
  if not v_found then
    raise exception 'Question % is not part of attempt %''s persisted outcomes', p_question_id, p_attempt_id;
  end if;
  if v_outcome_status <> 'requires_manual_marking' then
    raise exception 'Question % is not awaiting assessment (status=%)', p_question_id, v_outcome_status;
  end if;

  -- The original response, read server-side — never a caller-supplied
  -- parameter — so this record can never diverge from what the learner
  -- actually submitted during the sealed attempt.
  select response ->> 'value' into v_response_text
    from public.ali_mock_attempt_answer
    where attempt_id = p_attempt_id and question_id = p_question_id;
  if v_response_text is null or trim(v_response_text) = '' then
    raise exception 'No submitted response found for question % in attempt %', p_question_id, p_attempt_id;
  end if;

  insert into public.ali_writing_assessment (
    attempt_id, question_id, task_type, rubric_version, assessment_version,
    response_text, dimensions, overall_indicator, assessment_status,
    review_required_reasons, automated_model
  ) values (
    p_attempt_id, p_question_id, p_task_type, p_rubric_version, p_assessment_version,
    v_response_text, p_dimensions, p_overall_indicator, p_assessment_status,
    p_review_required_reasons, p_automated_model
  )
  on conflict (attempt_id, question_id) do nothing;

  get diagnostics v_row_count = row_count;

  -- Migration 251's own one additive call: re-checks, every time this
  -- runs (including a safe idempotent no-op re-run), whether every
  -- outstanding manual item for this attempt is now resolved -- and if
  -- so, and only so, transitions scoring_state to 'scored' and invokes
  -- the real, unmodified mock_analyse_attempt(). See this migration's
  -- own header for the full completion contract.
  perform public.mock_check_and_complete_scoring(p_attempt_id);

  return v_row_count > 0;
end;
$$;

-- Grants unchanged from migration 245 -- CREATE OR REPLACE with the
-- identical signature preserves existing grants (authenticated); not
-- restated.

-- ============================================================
-- 4. mock_check_and_complete_scoring() -- new, internal-only helper.
-- ============================================================
create or replace function public.mock_check_and_complete_scoring(p_attempt_id uuid)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_report public.ali_mock_attempt_report;
  v_outcome jsonb;
  v_status text;
  v_question_id text;
  v_bank_row public.ali_question_bank;
  v_all_resolved boolean := true;
begin
  select * into v_report from public.ali_mock_attempt_report where attempt_id = p_attempt_id for update;
  if not found then
    return;
  end if;
  -- Only ever acts on an attempt genuinely mid-manual-marking. A no-op
  -- for 'not_started' (nothing scored yet), 'scored' (already complete
  -- -- including via this same function on an earlier call), and
  -- 'failed' (a genuine scoring exception -- never silently overridden).
  if v_report.scoring_state <> 'scoring' then
    return;
  end if;

  for v_outcome in select * from jsonb_array_elements(coalesce(v_report.question_outcomes, '[]'::jsonb))
  loop
    v_status := v_outcome->>'status';
    if v_status <> 'requires_manual_marking' then
      continue;
    end if;

    v_question_id := v_outcome->>'questionId';
    select * into v_bank_row from public.ali_question_bank where id = v_question_id;

    -- The Founder's own explicit contract (repair brief, Section 4):
    -- scoring_state='scored' means every deterministic component is
    -- deterministically scored AND every criterion_rubric Writing
    -- component has reached the approved Writing assessment completion
    -- state -- it never means "every Writing response received an
    -- official CSSE numeric mark." A Writing question's own
    -- question_outcomes entry stays requires_manual_marking permanently
    -- by design (migration 245) -- the presence of an
    -- ali_writing_assessment row (assessment_status 'complete' OR
    -- 'review_required' -- both are a completed assessment CONTRACT, the
    -- qualitative result itself may still need human review) is what
    -- "resolved" means for a Writing item here, never the outcome
    -- status.
    if found and v_bank_row.subject = 'writing' then
      if not exists (
        select 1 from public.ali_writing_assessment
        where attempt_id = p_attempt_id and question_id = v_question_id
      ) then
        v_all_resolved := false;
        exit;
      end if;
    else
      -- Any other still-manual item (a genuine TIER3/TIER5 Reading
      -- question with no marking authority scoped to this form, or a
      -- question whose bank row no longer resolves) is NOT silently
      -- treated as resolved -- fails closed, exactly like every other
      -- invariant in this codebase's own Mock scoring functions.
      v_all_resolved := false;
      exit;
    end if;
  end loop;

  if v_all_resolved then
    update public.ali_mock_attempt_report
    set scoring_state = 'scored', updated_at = now()
    where attempt_id = p_attempt_id;

    perform public.mock_analyse_attempt(p_attempt_id);
  end if;
end;
$$;

revoke all on function public.mock_check_and_complete_scoring(uuid) from public;

-- ============================================================
-- 5. mock_backfill_named_mathematics_acceptance_analysis() -- the one
-- narrowly-scoped recovery action, named-attempt-only, no parameter.
-- ============================================================
create or replace function public.mock_backfill_named_mathematics_acceptance_analysis()
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_attempt_id constant uuid := 'ed253ddf-ba91-4a49-b256-e83083780f3a';
begin
  if not public.is_current_user_admin() then
    raise exception 'Only an admin may run this named backfill';
  end if;

  -- Calls the REAL, unmodified mock_analyse_attempt() for exactly this
  -- one attempt -- never reimplements or approximates its logic, never
  -- writes analysis_state/skill_evidence/strengths/weaknesses directly.
  -- mock_analyse_attempt()'s own idempotency guard (analysis_state =
  -- 'complete' and analysis_version = current -> no-op) makes a repeat
  -- call here always safe.
  perform public.mock_analyse_attempt(v_attempt_id);
end;
$$;

revoke all on function public.mock_backfill_named_mathematics_acceptance_analysis() from public;
grant execute on function public.mock_backfill_named_mathematics_acceptance_analysis() to authenticated;

commit;

-- Read-only verification (run before and after applying):
--
-- select attempt_id, scoring_state, analysis_state, report_release_state, analysis_version
-- from ali_mock_attempt_report
-- where attempt_id in ('d15dd181-4a4e-4a02-bd71-32a3a4cf2a91', 'ed253ddf-ba91-4a49-b256-e83083780f3a');
