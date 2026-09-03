-- Angel Digital 11+ — Migration 215
-- Programme Completion Increment 015: corrects the one real Mathematics-
-- specific assumption found in the live, already-applied Mock analysis
-- engine (migration 151, mock_analyse_attempt()) when tracing the full
-- attempt -> scoring -> analysis -> report pipeline for Reading
-- Comprehension Mock 1 readiness.
--
-- ============================================================
-- ROOT CAUSE
-- ============================================================
-- mock_analyse_attempt() (migration 151) writes `subject_breakdown` with
-- a hardcoded literal `'subject', 'mathematics'`, regardless of what the
-- attempt actually contains. This is the exact SQL counterpart of the
-- identical hardcode found and fixed this session in
-- lib/ali/mockAnalysisEngine.ts's analyseMockAttempt() (the TS mirror
-- migration 151's own comment requires stay byte-for-byte equivalent in
-- logic) -- see tests/lib/ali/mockAnalysisEngine.test.ts's own new tests
-- for the TS-side proof. Confirmed this session that no current UI
-- surface renders `subject_breakdown` at all (grepped every app/ and
-- lib/ caller) -- so this has zero current learner/parent-visible
-- impact -- but it is a real, wrong value in a genuine API/evidence
-- payload field, and would misreport the moment Reading Comprehension
-- Mock 1's first real attempt is ever ANALYSED (a later step than this
-- increment's own scope -- nothing is being activated or attempted this
-- increment).
--
-- ============================================================
-- WHAT CHANGED, EXACTLY -- mechanically verified, not just reviewed
-- ============================================================
-- Extracted the complete, unmodified `mock_analyse_attempt()` function
-- body from migration 151 (lines 210-467) programmatically this session,
-- applied exactly three changes with `sed`, then ran `diff` against the
-- original extraction to CONFIRM only these three changes exist, before
-- writing this migration:
--   1. One new declared variable: `v_is_english_attempt boolean;`
--   2. One new computation, immediately before the final UPDATE:
--      `v_is_english_attempt := exists (select 1 from unnest(v_skill_keys)
--      k where k like 'QT-RC-%' or k like 'QT-WC-%');` -- `v_skill_keys`
--      is the function's own existing accumulator of every distinct
--      questionTypeId this attempt actually contains (fully populated by
--      Pass 1, well before this point) -- no new data source, no new
--      query against any table.
--   3. The one targeted literal: `'subject', 'mathematics'` ->
--      `'subject', case when v_is_english_attempt then 'english' else
--      'mathematics' end`.
-- Every other line -- all 258 lines of real analysis logic (skill
-- accumulation, competency rollup, evidence classification, priority
-- ranking, misconception-note capping, the entire Pass 1/2/2b/3
-- structure) -- is byte-for-byte identical to the live migration 151
-- definition. This migration does not re-derive, re-interpret, or
-- "clean up" any of that logic -- it is a full CREATE OR REPLACE only
-- because Postgres requires the complete function body, not because
-- anything beyond the three changes above was touched.
--
-- ============================================================
-- WHY THIS IS SAFE FOR THE LIVE MATHEMATICS MOCK 1 PIPELINE
-- ============================================================
-- For any attempt whose skill_keys are entirely QT-MR-*/QT-AR-* (every
-- attempt this codebase has ever actually produced), `v_is_english_
-- attempt` evaluates to false and `subject` remains the literal string
-- 'mathematics' -- byte-identical output to the current live behaviour.
-- Confirmed by the TS mirror's own new regression tests (`tests/lib/ali/
-- mockAnalysisEngine.test.ts`): a QT-MR-*-only attempt still resolves to
-- "mathematics", and an attempt with every questionTypeId null (e.g. all
-- requires_manual_marking) also preserves the pre-existing default.
-- Function signature, grants, and the calling trigger
-- (mock_attempt_report_init) are completely unchanged -- CREATE OR
-- REPLACE with the identical signature (p_attempt_id uuid) returns void,
-- so no dependent object needs to be dropped or reattached.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query. Genuinely optional before
-- Reading Comprehension Mock 1's construction/freeze (this increment
-- does not activate it or create any attempt) -- but required before its
-- first real attempt is ever scored and analysed, so it is provided now
-- rather than deferred to a future increment that might forget it.

begin;

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
  -- Per-skill accumulator maps, keyed by questionTypeId, parallel arrays
  -- (PL/pgSQL has no native map type; this mirrors the same accumulation
  -- style mock_score_attempt() already uses for its own scalar totals).
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

  select * into v_attempt from public.ali_mock_attempt
    where id = p_attempt_id and profile_id = v_profile_id;
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

  -- === Pass 1: accumulate per-skill (questionTypeId) evidence from
  -- OBSERVED question_outcomes, joined live to ali_question_bank for
  -- AUTHORED EDUCATIONAL EVIDENCE (addresses_misconception, content_difficulty). ===
  for v_outcome in select * from jsonb_array_elements(coalesce(v_report.question_outcomes, '[]'::jsonb))
  loop
    v_question_id := v_outcome->>'questionId';
    v_status := v_outcome->>'status';
    v_question_type_id := v_outcome->>'questionTypeId';

    -- A row with no resolvable skill (manifest question no longer
    -- resolves to a bank row, or requires_manual_marking with no skill
    -- context) contributes no skill evidence -- never guessed.
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

    -- AUTHORED EDUCATIONAL EVIDENCE, safe framing only: only ever
    -- attached from an INCORRECT/unanswered row, never claims the
    -- learner exhibited it -- see this migration's own header.
    if found and v_status <> 'correct' and v_bank_row.addresses_misconception is not null then
      v_misconceptions := jsonb_set(
        v_misconceptions, array[v_question_type_id],
        (v_misconceptions->v_question_type_id) || to_jsonb(v_bank_row.addresses_misconception)
      );
    end if;

    -- competency_evidence: one provenance-tagged record per graded
    -- question, migration 074's own original design, source='mock',
    -- never fed into ali_student_question_history by this or any
    -- function.
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

  -- === Pass 2: classify each skill's evidence, build bySkill/strengths/weaknesses ===
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

    -- Decision 223's own disclosed, symmetric, minimum-2-observations
    -- threshold -- see this migration's own header for the full rationale.
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
      -- Capped at 2, never a wall of text -- see header.
      'misconceptionNotes', (select coalesce(jsonb_agg(m), '[]'::jsonb) from (select m from jsonb_array_elements_text(v_skill_misconceptions) m limit 2) sub)
    );

  end loop;

  -- === Pass 2b: roll up QT-level evidence to COMPETENCY level for
  -- strengths/weaknesses only (bySkill above stays QT-level, per
  -- Section 3's own explicit "skill/QT evidence" requirement). Several
  -- QT codes share one competency (e.g. QT-MR-01/02/03/09 all -> MR-01)
  -- -- without this rollup, a competency could appear more than once in
  -- the same strengths/weaknesses list, producing a sentence like "a
  -- real strength in: Number and Calculation, Number and Calculation."
  -- One entry per competency, re-classified at the competency's own
  -- aggregate subpart/correct count using the identical Decision-223
  -- threshold rule -- never a second, different rule. ===
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

  -- === Pass 3: deterministic next-practice priorities (top 3, not_yet_demonstrated
  -- ranked before developing, then by marks lost desc, then questionTypeId asc) ===
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

  -- Programme Completion Increment 015: derive the real subject from
  -- this attempt's own observed questionTypeId prefixes (QT-RC-*/QT-WC-*
  -- -> english), rather than a hardcoded 'mathematics' literal that would
  -- misreport a Reading Comprehension Mock 1 attempt. Mirrors the
  -- identical fix in lib/ali/mockAnalysisEngine.ts (analyseMockAttempt),
  -- keeping the two implementations byte-for-byte equivalent in logic,
  -- per this migration's own file header requirement.
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

-- Execute grants: unchanged from migration 151 -- granted to NO role at
-- all. This function's only real caller is the trigger
-- mock_attempt_report_init (migration 151, untouched by this migration),
-- inside its own SECURITY DEFINER context. No learner can ever call this
-- directly, for their own attempt or anyone else's.
revoke all on function public.mock_analyse_attempt(uuid) from public;

commit;

-- Read-only verification (run before and after applying):
-- select pg_get_functiondef('public.mock_analyse_attempt(uuid)'::regprocedure);
