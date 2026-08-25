-- Angel Digital 11+ — Migration 129
-- Mathematics Structural Capacity, Wave 002 — Bus Timetable Independent
-- Validation (Decision 186/187/188).
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS
-- ============================================================
-- Promotes exactly the 4 rows of mock-mr10-bustimetable from
-- eligibility_status 'authentic_assessment_candidate' to
-- 'independently_validated' -- RELEASE_1_ASSESSMENT_ELIGIBILITY_MODEL.md
-- 's own next transition, mirroring migration 123's own established
-- independent-validation-promotion pattern exactly (live content-shape
-- preconditions plus a live ali_family_review evidence check, never
-- trusted from a screenshot or prior turn's own prose alone).
--
-- ============================================================
-- REVIEW EVIDENCE (Founder-supplied, live-verified below, not merely
-- trusted from this header's own prose)
-- ============================================================
-- Founder production evidence: mock-mr10-bustimetable's own correction
-- re-review (migration 128's own pending placeholder, marker
-- MOCK-BUSTIMETABLE-CORRECTION001) has since been approved: reviewer
-- Ayobami Lawal, decision approved, review_type
-- mock_maths_independent_review, review basis explicitly covering
-- direct inspection of the complete corrected grouped question, the
-- shared timetable, all 4 subparts, answer accuracy, 1-mark-per-subpart
-- structure, reasoning progression, difficulty, clarity, age
-- appropriateness, originality, anti-memorisation quality, CSSE
-- structural alignment, and production visual presentation --
-- including an explicit re-check that reducing the 35-minute afternoon
-- Hillview-to-Milltown journey time by 20% gives 28 minutes,
-- independently re-verified this session by direct computation
-- (35 x 0.20 = 7; 35 - 7 = 28) and confirmed unambiguous against the
-- corrected wording. The original MOCK-STRUCTURAL-CAPACITY-WAVE002
-- approval (covering the UNCORRECTED wording) remains separate,
-- untouched, historical evidence and is never treated as approval of
-- this corrected content -- this migration's own precondition requires
-- the CORRECTION001 marker specifically, never the original WAVE002
-- marker.
--
-- This migration's own precondition block queries ali_family_review
-- LIVE and requires at least one matching approved row (family_id,
-- decision='approved', review_type='mock_maths_independent_review',
-- reviewer='Ayobami Lawal', notes carrying the
-- MOCK-BUSTIMETABLE-CORRECTION001 marker) to exist before writing
-- anything. Decision 182's own lesson is applied directly: the marker
-- predicate uses `notes LIKE '%MARKER%'` (unanchored, substring-
-- anywhere), never `notes LIKE 'MARKER%'` (anchored to the start) --
-- every real, UI-submitted review's stored notes value is prefixed with
-- "Reviewer qualification: {basis}.\n\n" before the marker ever
-- appears, so an anchored predicate would incorrectly reject genuine
-- approval evidence exactly as it did for migration 123's own first
-- production attempt. The precondition accepts ANY count >= 1 matching
-- approved record, never exactly 1 -- multiple legitimate approvals
-- must never invalidate certification.
--
-- ============================================================
-- INDEPENDENT-VALIDATION BOUNDARY, NOT MOCK-ELIGIBILITY
-- ============================================================
-- This migration moves these 4 rows to 'independently_validated' ONLY.
-- It does NOT set eligibility_status = 'mock_eligible' anywhere, does
-- NOT insert, update, or delete any ali_family_review row, does NOT
-- touch any ali_mock_form row, does NOT touch any RPC, RLS policy, or
-- grant, and does NOT touch mock-mr13-craftstall or
-- mock-mr03mr07-perimeterarea in any way. The later decision about
-- whether mock-mr10-bustimetable enters the mock_eligible pool remains
-- a separate, future, Founder-authorised composition/governance step --
-- not begun, not implied, by this migration.
--
-- ============================================================
-- CONTENT IMMUTABILITY
-- ============================================================
-- No prompt key (question, answer, marks, sharedStem, stimulus,
-- workingSteps, skill, or any other), content_difficulty, family_id,
-- provenance, content_version, question_group_id, group_order,
-- subpart_label, marking_mode, or active state is changed. Only
-- eligibility_status moves. Proven, not merely asserted: this migration
-- snapshots each target row's own COMPLETE `prompt` value before any
-- write, then re-reads and compares it byte-for-byte after -- since
-- eligibility_status is the ONLY column this migration's own UPDATE
-- statement ever names, a full-prompt snapshot is the correct, complete
-- preservation proof here (matching migration 123's own established
-- pattern exactly).
--
-- ============================================================
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does not touch mock_eligible, ali_mock_form, ali_family_review, any
-- RPC, RLS policy, or grant. Does not touch mock-mr13-craftstall or
-- mock-mr03mr07-perimeterarea. Does not touch English or Writing
-- content, Practice, or any other Mathematics family. Does not author
-- new content. Does not begin First Mock composition.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations 125,
-- 126, 127, and 128 (all confirmed applied per this session's own
-- production evidence) have already been applied.

begin;

do $$
declare
  v_target_ids constant text[] := array[
    'mock-mr10-bustimetable-01', 'mock-mr10-bustimetable-02', 'mock-mr10-bustimetable-03', 'mock-mr10-bustimetable-04'
  ];
  v_expected_stem constant text := 'A bus company runs a route from Hillview to Oakford, stopping at Milltown and Riverside. The timetable below shows the morning and afternoon journey times.';
  v_pending_count int;
  v_already_validated_count int;
  v_active_count int;
  v_subject_skill_count int;
  v_marking_mode_count int;
  v_grouping_count int;
  v_difficulty_count int;
  v_marks_count int;
  v_answers_count int;
  v_shared_stem_count int;
  v_stimulus_count int;
  v_non_empty_question_count int;
  v_approved_review_count int;
  v_excluded_still_untouched_count int;
  v_post_write_count int;
  v_post_write_preserved_count int;
begin
  select count(*) into v_pending_count
  from public.ali_question_bank
  where id = any(v_target_ids)
    and eligibility_status = 'authentic_assessment_candidate'
    and active = true
    and family_id = 'mock-mr10-bustimetable';

  select count(*) into v_already_validated_count
  from public.ali_question_bank
  where id = any(v_target_ids)
    and eligibility_status = 'independently_validated';

  -- Structural precondition audit -- every check below is evaluated
  -- regardless of which branch below actually runs, so a drift is
  -- caught even in the "already applied" case.
  select count(*) into v_subject_skill_count
    from public.ali_question_bank
    where id = any(v_target_ids) and subject = 'maths' and skill = 'QT-MR-10';
  if v_subject_skill_count <> 4 then
    raise exception 'Migration 129 refused: expected 4 rows with subject=maths, skill=QT-MR-10 (found %).', v_subject_skill_count;
  end if;

  select count(*) into v_marking_mode_count
    from public.ali_question_bank
    where id = any(v_target_ids) and marking_mode = 'deterministic';
  if v_marking_mode_count <> 4 then
    raise exception 'Migration 129 refused: expected 4 rows with marking_mode=deterministic (found %).', v_marking_mode_count;
  end if;

  select count(*) into v_grouping_count
    from public.ali_question_bank b
    join (values
      ('mock-mr10-bustimetable-01', 1, '(a)'),
      ('mock-mr10-bustimetable-02', 2, '(b)'),
      ('mock-mr10-bustimetable-03', 3, '(c)'),
      ('mock-mr10-bustimetable-04', 4, '(d)')
    ) as expected(id, expected_group_order, expected_subpart_label)
      on b.id = expected.id
    where b.question_group_id = 'mock-mr10-bustimetable'
      and b.group_order = expected.expected_group_order
      and b.subpart_label = expected.expected_subpart_label;
  if v_grouping_count <> 4 then
    raise exception 'Migration 129 refused: exact grouping (question_group_id/group_order/subpart_label) does not match the expected 01=1/(a), 02=2/(b), 03=3/(c), 04=4/(d) shape (found % of 4 matching).', v_grouping_count;
  end if;

  select count(*) into v_difficulty_count
    from public.ali_question_bank b
    join (values
      ('mock-mr10-bustimetable-01', 'medium'),
      ('mock-mr10-bustimetable-02', 'medium'),
      ('mock-mr10-bustimetable-03', 'hard'),
      ('mock-mr10-bustimetable-04', 'hard')
    ) as expected(id, expected_difficulty)
      on b.id = expected.id
    where b.content_difficulty::text = expected.expected_difficulty;
  if v_difficulty_count <> 4 then
    raise exception 'Migration 129 refused: expected difficulty medium/medium/hard/hard across the 4 rows in order (found % of 4 matching).', v_difficulty_count;
  end if;

  select count(*) into v_marks_count
    from public.ali_question_bank
    where id = any(v_target_ids) and (prompt->>'marks')::numeric = 1;
  if v_marks_count <> 4 then
    raise exception 'Migration 129 refused: expected 4 rows with marks=1 each (found %). Marking Integrity Gate must never be assumed satisfied.', v_marks_count;
  end if;

  select count(*) into v_answers_count
    from public.ali_question_bank b
    join (values
      ('mock-mr10-bustimetable-01', '95'),
      ('mock-mr10-bustimetable-02', '7'),
      ('mock-mr10-bustimetable-03', '370'),
      ('mock-mr10-bustimetable-04', '28')
    ) as expected(id, expected_answer)
      on b.id = expected.id
    where (b.prompt->>'answer') = expected.expected_answer;
  if v_answers_count <> 4 then
    raise exception 'Migration 129 refused: expected answers 95/7/370/28 across the 4 rows in order (found % of 4 matching). Subpart (d)''s corrected answer must still be 28.', v_answers_count;
  end if;

  select count(*) into v_shared_stem_count
    from public.ali_question_bank
    where id = any(v_target_ids) and (prompt->>'sharedStem') = v_expected_stem;
  if v_shared_stem_count <> 4 then
    raise exception 'Migration 129 refused: expected all 4 rows to carry the identical, exact sharedStem value (found %). Migration 127''s own wording correction must not have disturbed it.', v_shared_stem_count;
  end if;

  select count(*) into v_stimulus_count
    from public.ali_question_bank
    where id = any(v_target_ids)
      and jsonb_typeof(prompt->'stimulus') = 'object'
      and prompt->'stimulus'->>'type' = 'table';
  if v_stimulus_count <> 4 then
    raise exception 'Migration 129 refused: expected all 4 rows to carry a valid table stimulus (found %).', v_stimulus_count;
  end if;

  select count(*) into v_non_empty_question_count
    from public.ali_question_bank
    where id = any(v_target_ids) and coalesce(length(prompt->>'question'), 0) > 0;
  if v_non_empty_question_count <> 4 then
    raise exception 'Migration 129 refused: every target row must have non-empty question text (found % of 4).', v_non_empty_question_count;
  end if;

  -- Live review-evidence precondition: at least one genuine approved
  -- record must exist for this exact family, this exact review_type,
  -- this exact reviewer, carrying the CORRECTION001 marker specifically
  -- (never the original WAVE002 marker) -- unanchored LIKE, per the
  -- Decision 182 lesson, and accepting any count >= 1.
  select count(*) into v_approved_review_count
    from public.ali_family_review
    where family_id = 'mock-mr10-bustimetable'
      and decision = 'approved'
      and review_type = 'mock_maths_independent_review'
      and reviewer = 'Ayobami Lawal'
      and notes like '%MOCK-BUSTIMETABLE-CORRECTION001%';
  if v_approved_review_count < 1 then
    raise exception 'Migration 129 refused: no matching approved ali_family_review record found for mock-mr10-bustimetable under the MOCK-BUSTIMETABLE-CORRECTION001 marker. The original WAVE002 approval (uncorrected wording) does not count. Certification requires real, live re-review evidence, not merely a header claim.';
  end if;

  select count(*) into v_active_count
    from public.ali_question_bank
    where id = any(v_target_ids) and active = true;
  if v_active_count <> 4 then
    raise exception 'Migration 129 refused: expected 4 active=true rows (found %).', v_active_count;
  end if;

  -- Exclusion guard: mock-mr13-craftstall and mock-mr03mr07-perimeterarea
  -- must never appear in the target array, by construction.
  if exists (
    select 1 from unnest(v_target_ids) t
    where t like 'mock-mr13-craftstall%' or t like 'mock-mr03mr07-perimeterarea%'
  ) then
    raise exception 'Migration 129 refused: mock-mr13-craftstall and mock-mr03mr07-perimeterarea must never appear in the target array.';
  end if;

  select count(*) into v_excluded_still_untouched_count
    from public.ali_question_bank
    where id like 'mock-mr13-craftstall%' and eligibility_status = 'authentic_assessment_candidate';
  if v_excluded_still_untouched_count <> 3 then
    raise exception 'Migration 129 refused: expected mock-mr13-craftstall''s 3 rows to remain authentic_assessment_candidate, untouched by this migration (found %). Re-verify production state before proceeding.', v_excluded_still_untouched_count;
  end if;

  if v_pending_count = 4 then
    create temporary table tmp_bustimetable_prompt_snapshot (id text primary key, prompt_snapshot jsonb not null) on commit drop;
    insert into tmp_bustimetable_prompt_snapshot (id, prompt_snapshot)
      select id, prompt from public.ali_question_bank where id = any(v_target_ids);

    update public.ali_question_bank
    set eligibility_status = 'independently_validated'
    where id = any(v_target_ids)
      and eligibility_status = 'authentic_assessment_candidate';

    select count(*) into v_post_write_count
      from public.ali_question_bank
      where id = any(v_target_ids) and eligibility_status = 'independently_validated';
    if v_post_write_count <> 4 then
      raise exception 'Migration 129 post-write verification failed: expected 4 rows now independently_validated, found %. Rolling back.', v_post_write_count;
    end if;

    select count(*) into v_post_write_preserved_count
      from public.ali_question_bank b
      join tmp_bustimetable_prompt_snapshot s on b.id = s.id
      where b.prompt = s.prompt_snapshot;
    if v_post_write_preserved_count <> 4 then
      raise exception 'Migration 129 post-write preservation check failed: % of 4 rows have their prompt byte-for-byte unchanged (expected 4). Rolling back.', v_post_write_preserved_count;
    end if;

    select count(*) into v_post_write_count
      from public.ali_question_bank
      where id = any(v_target_ids) and eligibility_status = 'mock_eligible';
    if v_post_write_count <> 0 then
      raise exception 'Migration 129 refused: mock_eligible must never be set by this migration (found % rows). Rolling back.', v_post_write_count;
    end if;

    select count(*) into v_post_write_count
      from public.ali_question_bank
      where id like 'mock-mr13-craftstall%' and eligibility_status <> 'authentic_assessment_candidate';
    if v_post_write_count <> 0 then
      raise exception 'Migration 129 refused: mock-mr13-craftstall must remain untouched (found % rows with a changed eligibility_status). Rolling back.', v_post_write_count;
    end if;

    raise notice 'Migration 129: promoted 4 rows of mock-mr10-bustimetable (1 numbered experience, 4 marks) from authentic_assessment_candidate to independently_validated. NOT mock_eligible. Every prompt key proven byte-for-byte unchanged. mock-mr13-craftstall and mock-mr03mr07-perimeterarea untouched.';

  elsif v_already_validated_count = 4 then
    raise notice 'Migration 129: all 4 target questions are already independently_validated -- already applied. No changes made.';

    select count(*) into v_post_write_count
      from public.ali_question_bank
      where id = any(v_target_ids) and eligibility_status = 'mock_eligible';
    if v_post_write_count <> 0 then
      raise exception 'Migration 129 refused: mock_eligible found set on % rows in the already-applied branch -- something else changed this family''s eligibility. Manual investigation required.', v_post_write_count;
    end if;

  else
    raise exception
      'Migration 129 refused: expected 4 authentic_assessment_candidate rows for mock-mr10-bustimetable (found %), or 4 already independently_validated (found %). Re-verify production state before proceeding.',
      v_pending_count, v_already_validated_count;
  end if;
end $$;

commit;
