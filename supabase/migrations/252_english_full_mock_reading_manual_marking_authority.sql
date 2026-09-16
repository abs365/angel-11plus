-- Angel Digital 11+ — Migration 252
-- CSSE Two-Paper Mock P1 Repair, final piece — extend the EXISTING
-- governed Reading manual-marking authority (mock_apply_manual_mark(),
-- migration 227) to english-full-mock-v1, so its 5 genuine TIER3/TIER5
-- Reading Comprehension questions (eng-inc002-roboticsfinal-q03/q05/q08,
-- eng-inc002-sailandsteam-q03/q07 — confirmed against production by the
-- Founder's own read-only query, cross-checked against this repository's
-- own migration 161 source and matching exactly) have a real resolution
-- path. Migration 251's own header explicitly disclosed this as a named,
-- deliberate residual limitation ("a genuine TIER3/TIER5 Reading item
-- inside english-full-mock-v1's manifest, if one exists, has no
-- resolution path after this migration either") — this migration closes
-- exactly that gap, no more.
--
-- ============================================================
-- WHY THIS IS THE RIGHT MECHANISM (not a new one)
-- ============================================================
-- reading-comprehension-mock-1 already contains TIER3/TIER5 questions
-- today (ANGEL_EDUCATIONAL_CAPACITY_AUDIT.md: 50 TIER3 + 9 TIER5 rows
-- tagged subject='english', a meaningful share of them mock_eligible),
-- and migration 227's mock_apply_manual_mark() is the SOLE existing,
-- governed, admin-only, audited path by which any of them is ever
-- resolved to a real mark once mock_score_attempt()/mock_persist_
-- reading_scoring() force them to requires_manual_marking. Nothing about
-- that mechanism is Reading-Mock-1-specific except its own eligibility
-- guard (line-for-line the same shape migration 251 already widened
-- twice, for mock_claim_reading_scoring_work() and mock_persist_reading_
-- scoring()) and its own downstream completion decision (which never
-- had to account for a co-existing Writing-assessment contract before,
-- because Reading Comprehension Mock 1 contains no Writing questions).
-- This migration widens exactly those two things and nothing else —
-- the marking semantics themselves (bounded numeric mark, admin-only,
-- auth.uid()-derived marker identity, append-only audit row, status
-- DERIVED from the bounded mark never trusted as a separate caller
-- claim) are completely untouched, preserving TIER3/TIER5's own
-- evidence/quotation + explanation and named-component + explanation
-- educational intent exactly as already governed for Reading Mock 1.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES (one function, two changes, both additive)
-- ============================================================
-- 1. mock_apply_manual_mark() — CREATE OR REPLACE, full existing body
--    preserved verbatim except:
--    (a) the eligibility guard becomes the SAME two-literal OR guard
--        already used by mock_claim_reading_scoring_work()/mock_persist_
--        reading_scoring() (migration 251): reading-comprehension-mock-1
--        (unchanged) OR (full_mock, english-full-mock-v1) (new).
--    (b) ONE new hard-enforced invariant, mirroring migration 251's own
--        Writing override exactly: immediately after the question's bank
--        row is resolved, if its subject = 'writing', this function
--        refuses outright (RAISE EXCEPTION) rather than ever accepting a
--        scalar mark for it. Before this migration, Reading Comprehension
--        Mock 1 contained no Writing questions, so this case could never
--        occur; widening eligibility to english-full-mock-v1 makes it
--        newly reachable, and this guard closes it the same way it is
--        already closed everywhere else in this codebase — Writing is
--        marked exclusively through mock_persist_writing_assessment()
--        (migration 245) and ali_writing_assessment, never as a binary
--        correct/incorrect scalar.
--    (c) ONE additive completion path: where this function's own local
--        v_final_scoring_state computation is not already 'scored' (the
--        ordinary case for Reading Comprehension Mock 1, whose only
--        manual-marking source is Reading TIER3/TIER5 — that branch is
--        completely unchanged), it now calls the EXISTING, unmodified
--        mock_check_and_complete_scoring() (migration 251) as its own
--        final step — the SAME completion contract mock_persist_reading_
--        scoring() and mock_persist_writing_assessment() already call.
--        This is required because english-full-mock-v1's own two Writing
--        questions remain permanently at requires_manual_marking by
--        design (migration 245/251) even once genuinely assessed — this
--        function's own naive "requires_manual_marking count reaches
--        zero" rule can therefore never fire for that form no matter how
--        many Reading TIER3/TIER5 items are marked, and would otherwise
--        leave a fully-resolved English attempt permanently stuck at
--        scoring_state='scoring'. mock_check_and_complete_scoring() is
--        the one function that already knows a Writing item counts as
--        resolved once its ali_writing_assessment row exists — reusing
--        it here means this migration reimplements no completion logic
--        of its own.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does not touch mock_score_attempt(), mock_analyse_attempt(),
-- mock_release_report(), mock_check_and_complete_scoring(), mock_claim_
-- reading_scoring_work(), mock_persist_reading_scoring(), mock_persist_
-- writing_assessment(), mock_attempt_report_init(), or any content/RLS/
-- grant. Does not edit migrations 250 or 251 — both remain on disk,
-- unmodified, exactly as already generated. Does not change the
-- canonical-mark-bound derivation, the admin-only gate, the auth.uid()-
-- derived marker identity, or the append-only ali_mock_manual_mark_audit
-- table. Does not extend eligibility to any other form (no general
-- "any full_mock" rule) and does not permit Writing content to be marked
-- through this function under any input. Does not directly mutate the
-- existing English acceptance attempt (d15dd181-4a4e-4a02-bd71-
-- 32a3a4cf2a91) — its own five TIER3/TIER5 outcomes remain exactly
-- whatever the real, governed pipeline (widened by migration 251) has
-- already computed for it; an admin resolves them by calling this
-- widened function, through the existing /api/mock-manual-mark route,
-- exactly as already required for any Reading Mock 1 TIER3/TIER5 item —
-- no new transport, no new UI, no bypass of any kind.
--
-- ============================================================
-- SAFETY FOR EVERY EXISTING FORM
-- ============================================================
-- reading-comprehension-mock-1: byte-identical eligibility branch,
-- byte-identical marking logic, byte-identical completion path (its own
-- v_final_scoring_state reaches 'scored' exactly as before whenever the
-- last manual item is marked, since it has no Writing questions — the
-- new completion-check call sits in the untouched `else` branch and is
-- therefore never reached for this form in that case). A no-op change.
-- english-full-mock-v1: an admin may now resolve any of its 5 genuine
-- TIER3/TIER5 Reading items exactly as already governed for Reading
-- Mock 1; a Writing question on this form is refused outright by the new
-- guard; overall completion (scoring_state='scored' -> analysis_state=
-- 'complete') is now reachable through the real pipeline once every
-- Reading item is resolved (deterministically or by admin manual mark)
-- and both Writing assessments are complete, matching migration 251's
-- own completion contract exactly.
-- Any other form: entirely unaffected — the eligibility guard remains a
-- named, bounded, two-literal check, never a general rule.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations 250 and
-- 251 (this same repair pass) have already been applied — this migration
-- depends on mock_check_and_complete_scoring() (migration 251) existing.

begin;

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

  -- ATTEMPT: exists, submitted, and one of the two named forms whose
  -- Reading content this function is authorised to manually mark.
  -- Migration 252's own one widening -- the identical named, bounded,
  -- additive OR guard migration 251 already uses for mock_claim_reading_
  -- scoring_work()/mock_persist_reading_scoring(). Reading Comprehension
  -- Mock 1's own original condition is preserved exactly, never replaced.
  select * into v_attempt from public.ali_mock_attempt where id = p_attempt_id;
  if not found then
    raise exception 'Attempt % not found', p_attempt_id;
  end if;
  if v_attempt.status <> 'submitted' then
    raise exception 'Attempt % is not submitted (status=%)', p_attempt_id, v_attempt.status;
  end if;
  if not (
    (v_attempt.attempt_type = 'timed_section' and v_attempt.form_id = 'reading-comprehension-mock-1')
    or (v_attempt.attempt_type = 'full_mock' and v_attempt.form_id = 'english-full-mock-v1')
  ) then
    raise exception 'Attempt % is not eligible for manual Reading marking (attempt_type=%, form_id=%)', p_attempt_id, v_attempt.attempt_type, v_attempt.form_id;
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

  -- Migration 252's own one new hard-enforced invariant, mirroring
  -- migration 251's identical Writing override in mock_persist_reading_
  -- scoring() -- newly reachable now that eligibility includes a form
  -- (english-full-mock-v1) that contains Writing questions. Writing is
  -- marked exclusively through mock_persist_writing_assessment() and
  -- ali_writing_assessment -- never a binary correct/incorrect scalar
  -- mark, regardless of what any caller supplies.
  if v_bank_row.subject = 'writing' then
    raise exception 'Question % is a Writing question -- Writing content may never be marked through mock_apply_manual_mark(); use mock_persist_writing_assessment() instead', p_question_id;
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
  -- manual item, through the existing mock_analyse_attempt() -- never
  -- before, never a second analysis engine. Unchanged from migration 227
  -- for any form (reading-comprehension-mock-1 included) whose own
  -- manual-marking population is exhausted entirely by this local count.
  if v_final_scoring_state = 'scored' then
    perform public.mock_analyse_attempt(p_attempt_id);
  else
    -- Migration 252's own one additive call: reached only when this
    -- function's own local "manual count reached zero" rule did NOT
    -- already resolve completion -- meaningful only for english-full-
    -- mock-v1, whose Writing questions remain permanently at requires_
    -- manual_marking even once genuinely assessed (migration 245/251).
    -- mock_check_and_complete_scoring() is the one function that already
    -- knows a Writing item counts as resolved once its ali_writing_
    -- assessment row exists; reusing it here (the SAME call mock_persist_
    -- reading_scoring() and mock_persist_writing_assessment() already
    -- make) means this attempt correctly reaches scoring_state='scored'
    -- -> mock_analyse_attempt() the moment every genuinely outstanding
    -- item -- Reading and Writing alike -- is truly resolved, however
    -- many further calls that takes. A safe, idempotent no-op for
    -- reading-comprehension-mock-1 (that form's v_final_scoring_state
    -- above already reaches 'scored' in the same call that exhausts its
    -- manual-marking population, so this branch is never reached with a
    -- genuinely-still-unresolved Reading item for that form).
    perform public.mock_check_and_complete_scoring(p_attempt_id);
  end if;

  return jsonb_build_object('status', v_final_scoring_state, 'requiresManualMarkingCount', v_manual_count);
end;
$$;

-- Grants unchanged from migration 227 -- CREATE OR REPLACE with the
-- identical signature preserves existing grants (authenticated only,
-- anon explicitly revoked); not restated.

commit;

-- Read-only verification (run before and after applying):
--
-- select pg_get_functiondef('public.mock_apply_manual_mark(uuid, text, numeric)'::regprocedure);
--
-- Expected AFTER applying: the function body contains BOTH the
-- "attempt_type = 'timed_section' and v_attempt.form_id =
-- 'reading-comprehension-mock-1'" guard AND a
-- "attempt_type = 'full_mock' and v_attempt.form_id =
-- 'english-full-mock-v1'" guard, a
-- "if v_bank_row.subject = 'writing' then raise exception" guard, and a
-- "perform public.mock_check_and_complete_scoring(p_attempt_id)" call in
-- the else branch of the final scoring-state check.
--
-- To resolve the 5 named TIER3/TIER5 items on the existing English
-- acceptance attempt (d15dd181-4a4e-4a02-bd71-32a3a4cf2a91) once this
-- migration is applied, an admin calls the existing, unmodified
-- /api/mock-manual-mark route (or the RPC directly, under a genuine
-- admin session) once per question:
--   eng-inc002-roboticsfinal-q03, eng-inc002-roboticsfinal-q05,
--   eng-inc002-roboticsfinal-q08, eng-inc002-sailandsteam-q03,
--   eng-inc002-sailandsteam-q07
-- -- exactly the same governed action already required for any Reading
-- Mock 1 TIER3/TIER5 item, based on the learner's real submitted
-- response and each question's own model answer / accepted answers
-- already present in ali_question_bank.prompt. This migration performs
-- no such marking itself and mutates no existing attempt.
