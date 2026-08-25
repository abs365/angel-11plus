-- Angel Digital 11+ — Migration 123
-- Mathematics First Mock Structural Capacity, Authoring Increment 001 —
-- Interdependent Algebraic System, Independent Validation (Decision
-- 178/180/181).
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS
-- ============================================================
-- Promotes exactly the 3 rows of the 1 approved family
-- (mock-mr06-linkedvalues) from eligibility_status
-- 'authentic_assessment_candidate' to 'independently_validated' —
-- RELEASE_1_ASSESSMENT_ELIGIBILITY_MODEL.md's own next transition,
-- mirroring migration 090/094/101/111/116's own established pattern
-- exactly. Selected by exact question ID, never by family_id alone —
-- no future sibling added later to this family could ever be silently
-- swept into this promotion.
--
-- ============================================================
-- REVIEW EVIDENCE (Founder-supplied, live-verified below, not merely
-- trusted from this header's own prose)
-- ============================================================
-- Production ali_family_review carries THREE records for this family,
-- all preserved by this migration (it never writes to, updates, or
-- deletes from ali_family_review):
--   1. reviewer=UNASSIGNED, decision=pending_independent_review,
--      review_type=mock_maths_independent_review,
--      marker=MOCK-STRUCTURAL-CAPACITY-INC001,
--      created_at=2026-08-25 18:18:57.221214+00 (migration 120's own
--      placeholder row).
--   2. reviewer=Ayobami Lawal, decision=approved,
--      review_type=mock_maths_independent_review,
--      marker=MOCK-STRUCTURAL-CAPACITY-INC001,
--      created_at=2026-08-25 18:21:54.469327+00.
--   3. reviewer=Ayobami Lawal, decision=approved,
--      review_type=mock_maths_independent_review,
--      created_at=2026-08-25 18:55:14.658601+00 -- the authoritative,
--      most recent approval, whose own review basis explicitly records
--      direct inspection of the complete grouped three-part question,
--      production presentation, the shared scenario presented once
--      (post migration 121/122), coherent interdependent subparts,
--      answer accuracy, one-mark-per-subpart integrity, medium-to-hard
--      reasoning progression, clarity, age appropriateness,
--      originality, primary-source CSSE structural alignment, and
--      suitability for independent learner assessment.
-- This migration's own precondition block queries ali_family_review
-- LIVE and requires at least one matching approved row (family_id,
-- decision='approved', review_type='mock_maths_independent_review',
-- reviewer='Ayobami Lawal', notes carrying the MOCK-STRUCTURAL-CAPACITY-
-- INC001 marker) to exist before writing anything -- not merely
-- asserted in this comment.
--
-- ============================================================
-- INDEPENDENT-VALIDATION BOUNDARY, NOT MOCK-ELIGIBILITY
-- ============================================================
-- This migration moves these 3 rows to 'independently_validated' ONLY.
-- It does NOT set eligibility_status = 'mock_eligible' anywhere, does
-- NOT insert, update, or delete any ali_family_review row, does NOT
-- touch any ali_mock_form row, does NOT touch any RPC, RLS policy, or
-- grant, and does NOT touch any of the 48 already-mock_eligible rows or
-- the other 8 independently_validated reserve rows (perimeterarea x4,
-- fairprep x2, runningclub x2). The later decision about which
-- independently_validated Classification-A families enter the
-- mock_eligible pool remains a separate, future, Founder-authorised
-- composition/governance step -- not begun, not implied, by this
-- migration.
--
-- ============================================================
-- CONTENT IMMUTABILITY (Part 10 of this session's own directive)
-- ============================================================
-- No prompt key (question, answer, marks, sharedStem, stimulus, or any
-- other), skill, content_difficulty, family_id, provenance,
-- content_version, question_group_id, group_order, subpart_label,
-- marking_mode, or active state is changed. Only eligibility_status
-- moves. Proven, not merely asserted: this migration snapshots each
-- target row's own COMPLETE `prompt` value before any write, then
-- re-reads and compares it byte-for-byte after -- since eligibility_
-- status is the ONLY column this migration's own UPDATE statement ever
-- names, a full-prompt snapshot (not merely `prompt - 'eligibility_
-- status'`, which is not even a prompt key) is the correct, complete
-- preservation proof here.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does not touch mock_eligible, ali_mock_form, ali_family_review, any
-- RPC, RLS policy, or grant. Does not touch English or Writing content,
-- Practice, or any other Mathematics family. Does not author new
-- content. Does not implement or alter shared-timetable or any other
-- structural-capacity increment.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations 119,
-- 120, 121, and 122 (all confirmed applied per this session's own
-- production evidence) have already been applied.

begin;

do $$
declare
  v_target_ids constant text[] := array[
    'mock-mr06-linkedvalues-01', 'mock-mr06-linkedvalues-02', 'mock-mr06-linkedvalues-03'
  ];
  v_expected_stem constant text := 'A collector has three bags of marbles: red, blue and green. The blue bag has 6 more marbles than the red bag. The green bag has 3 times as many marbles as the blue bag. Altogether, the three bags contain 64 marbles.';
  v_pending_count int;
  v_already_validated_count int;
  v_active_count int;
  v_subject_skill_count int;
  v_marking_mode_count int;
  v_grouping_count int;
  v_marks_count int;
  v_shared_stem_count int;
  v_non_empty_question_count int;
  v_approved_review_count int;
  v_post_write_count int;
  v_post_write_preserved_count int;
begin
  select count(*) into v_pending_count
  from public.ali_question_bank
  where id = any(v_target_ids)
    and eligibility_status = 'authentic_assessment_candidate'
    and active = true
    and family_id = 'mock-mr06-linkedvalues';

  select count(*) into v_already_validated_count
  from public.ali_question_bank
  where id = any(v_target_ids)
    and eligibility_status = 'independently_validated';

  -- Structural precondition audit -- every check below is evaluated
  -- regardless of which branch below actually runs, so a drift is
  -- caught even in the "already applied" case.
  select count(*) into v_subject_skill_count
    from public.ali_question_bank
    where id = any(v_target_ids) and subject = 'maths' and skill = 'QT-MR-06';
  if v_subject_skill_count <> 3 then
    raise exception 'Migration 123 refused: expected 3 rows with subject=maths, skill=QT-MR-06 (found %).', v_subject_skill_count;
  end if;

  select count(*) into v_marking_mode_count
    from public.ali_question_bank
    where id = any(v_target_ids) and marking_mode = 'deterministic';
  if v_marking_mode_count <> 3 then
    raise exception 'Migration 123 refused: expected 3 rows with marking_mode=deterministic (found %).', v_marking_mode_count;
  end if;

  select count(*) into v_grouping_count
    from public.ali_question_bank b
    join (values
      ('mock-mr06-linkedvalues-01', 1, '(a)'),
      ('mock-mr06-linkedvalues-02', 2, '(b)'),
      ('mock-mr06-linkedvalues-03', 3, '(c)')
    ) as expected(id, expected_group_order, expected_subpart_label)
      on b.id = expected.id
    where b.question_group_id = 'mock-mr06-linkedvalues'
      and b.group_order = expected.expected_group_order
      and b.subpart_label = expected.expected_subpart_label;
  if v_grouping_count <> 3 then
    raise exception 'Migration 123 refused: exact grouping (question_group_id/group_order/subpart_label) does not match the expected 01=1/(a), 02=2/(b), 03=3/(c) shape (found % of 3 matching).', v_grouping_count;
  end if;

  select count(*) into v_marks_count
    from public.ali_question_bank
    where id = any(v_target_ids) and (prompt->>'marks')::numeric = 1;
  if v_marks_count <> 3 then
    raise exception 'Migration 123 refused: expected 3 rows with marks=1 each (found %). Marking Integrity Gate must never be assumed satisfied.', v_marks_count;
  end if;

  select count(*) into v_shared_stem_count
    from public.ali_question_bank
    where id = any(v_target_ids) and (prompt->>'sharedStem') = v_expected_stem;
  if v_shared_stem_count <> 3 then
    raise exception 'Migration 123 refused: expected all 3 rows to carry the identical, exact sharedStem value (found % of 3 matching). Migration 121 may not have applied correctly.', v_shared_stem_count;
  end if;

  select count(*) into v_non_empty_question_count
    from public.ali_question_bank
    where id = any(v_target_ids) and coalesce(length(prompt->>'question'), 0) > 0;
  if v_non_empty_question_count <> 3 then
    raise exception 'Migration 123 refused: every target row must have non-empty question text (found % of 3).', v_non_empty_question_count;
  end if;

  -- Live review-evidence precondition: at least one genuine approved
  -- record must exist for this exact family, this exact review_type,
  -- this exact reviewer, carrying the exact batch marker -- never
  -- trusted from this file's own header prose alone.
  select count(*) into v_approved_review_count
    from public.ali_family_review
    where family_id = 'mock-mr06-linkedvalues'
      and decision = 'approved'
      and review_type = 'mock_maths_independent_review'
      and reviewer = 'Ayobami Lawal'
      and notes like 'MOCK-STRUCTURAL-CAPACITY-INC001%';
  if v_approved_review_count < 1 then
    raise exception 'Migration 123 refused: no matching approved ali_family_review record found for mock-mr06-linkedvalues (review_type=mock_maths_independent_review, reviewer=Ayobami Lawal, MOCK-STRUCTURAL-CAPACITY-INC001 marker). Certification requires real, live review evidence, not merely a header claim.';
  end if;

  select count(*) into v_active_count
    from public.ali_question_bank
    where id = any(v_target_ids) and active = true;
  if v_active_count <> 3 then
    raise exception 'Migration 123 refused: expected 3 active=true rows (found %).', v_active_count;
  end if;

  if v_pending_count = 3 then
    -- Exactly the expected pre-certification state. Apply, with a full
    -- pre-write prompt snapshot and post-write byte-for-byte proof.
    create temporary table tmp_linkedvalues_prompt_snapshot (id text primary key, prompt_snapshot jsonb not null) on commit drop;
    insert into tmp_linkedvalues_prompt_snapshot (id, prompt_snapshot)
      select id, prompt from public.ali_question_bank where id = any(v_target_ids);

    update public.ali_question_bank
    set eligibility_status = 'independently_validated'
    where id = any(v_target_ids)
      and eligibility_status = 'authentic_assessment_candidate';

    select count(*) into v_post_write_count
      from public.ali_question_bank
      where id = any(v_target_ids) and eligibility_status = 'independently_validated';
    if v_post_write_count <> 3 then
      raise exception 'Migration 123 post-write verification failed: expected 3 rows now independently_validated, found %. Rolling back.', v_post_write_count;
    end if;

    select count(*) into v_post_write_preserved_count
      from public.ali_question_bank b
      join tmp_linkedvalues_prompt_snapshot s on b.id = s.id
      where b.prompt = s.prompt_snapshot;
    if v_post_write_preserved_count <> 3 then
      raise exception 'Migration 123 post-write preservation check failed: % of 3 rows have their prompt byte-for-byte unchanged (expected 3). Rolling back.', v_post_write_preserved_count;
    end if;

    select count(*) into v_post_write_count
      from public.ali_question_bank
      where id = any(v_target_ids) and eligibility_status = 'mock_eligible';
    if v_post_write_count <> 0 then
      raise exception 'Migration 123 refused: mock_eligible must never be set by this migration (found % rows). Rolling back.', v_post_write_count;
    end if;

    raise notice 'Migration 123: promoted 3 rows of mock-mr06-linkedvalues (1 numbered experience, 3 marks) from authentic_assessment_candidate to independently_validated. NOT mock_eligible. Every prompt key proven byte-for-byte unchanged.';

  elsif v_already_validated_count = 3 then
    -- Already applied -- safe no-op, not an error.
    raise notice 'Migration 123: all 3 target questions are already independently_validated -- already applied. No changes made.';

    select count(*) into v_post_write_count
      from public.ali_question_bank
      where id = any(v_target_ids) and eligibility_status = 'mock_eligible';
    if v_post_write_count <> 0 then
      raise exception 'Migration 123 refused: mock_eligible found set on % rows in the already-applied branch -- something else changed this family''s eligibility. Manual investigation required.', v_post_write_count;
    end if;

  else
    -- Neither the clean pre-certification state (3 candidate rows) nor
    -- the clean post-certification state (3 already validated) --
    -- refuse to guess, touch nothing.
    raise exception
      'Migration 123 refused: expected 3 authentic_assessment_candidate rows for mock-mr06-linkedvalues (found %), or 3 already independently_validated (found %). Re-verify production state before proceeding.',
      v_pending_count, v_already_validated_count;
  end if;
end $$;

commit;
