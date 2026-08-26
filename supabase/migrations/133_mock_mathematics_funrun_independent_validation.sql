-- Angel Digital 11+ — Migration 133
-- Mathematics Structural Capacity, Authoring Increment 003 — Fun Run
-- Independent Validation (Decision 192/193/194).
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS
-- ============================================================
-- Migrations 131 (content) and 132 (pending-review placeholder) are
-- Founder-confirmed applied to production. The Founder has since
-- completed a direct production visual/educational review of
-- mock-mr09-funrun (shared scenario, frequency-table stimulus, all four
-- subparts, answers, one-mark-per-subpart structure, difficulty
-- progression, wording/11+ suitability, originality, anti-memorisation,
-- structural alignment, learner-facing presentation) and approved it.
-- This migration promotes exactly the 4 rows of mock-mr09-funrun from
-- eligibility_status 'authentic_assessment_candidate' to
-- 'independently_validated' -- mirroring migrations 123/129/130's own
-- established independent-validation-promotion pattern exactly.
--
-- ============================================================
-- CONTENT RE-AUDIT (re-read directly from migration 131's own source
-- this session, not merely trusted from prior Decision prose)
-- ============================================================
-- subject=maths, skill=QT-MR-09, family_id=mock-mr09-funrun, active=true,
-- marking_mode=deterministic, marks=1 each, question_group_id=
-- mock-mr09-funrun, group_order 1/2/3/4, subpart_label (a)/(b)/(c)/(d),
-- content_difficulty medium/medium/hard/hard, identical sharedStem
-- ("Riverside Primary School held a sponsored fun run. The table below
-- shows how many laps each runner completed.") and identical table
-- stimulus (headers ["Laps completed","Number of runners"], 6 rows,
-- 0-5 laps) across all 4 rows.
--
-- All four answers independently re-derived again this session from the
-- real stored frequency table (frequencies 3,5,8,6,5,3 for 0-5 laps):
-- (a) 3+5+8+6+5+3 = 30 (two methods: forward sum; paired-ends sum
-- (3+3)+(5+5)+(8+6)=6+10+14=30); (b) 0x3+1x5+2x8+3x6+4x5+5x3 =
-- 0+5+16+18+20+15 = 74 (two methods: forward sum; reverse sum); (c) mean
-- = 74/30 = 2.4666... (two methods: long division; fraction
-- simplification 74/30=37/15=2.4666...), and the row's own question text
-- explicitly instructs "Give your answer to 1 decimal place", so the
-- stored answer 2.5 is the correctly rounded value, not an unrounded
-- approximation (Decision 193's own finding, reconfirmed here); (d)
-- runners strictly above the mean completed 3, 4 or 5 laps: 6+5+3 = 14
-- (two methods: direct sum of qualifying frequencies; complement check
-- 30-(3+5+8)=30-16=14). Using either the exact mean (2.4666...) or the
-- rounded mean (2.5) places the threshold identically between 2 and 3
-- laps, so (d)'s answer of 14 does not depend on which value is used,
-- and (d)'s own workingSteps re-derive the mean from the raw table
-- rather than depending on the learner's own stored answer to (c) --
-- each subpart remains independently credit-bearing.
--
-- ============================================================
-- REVIEW EVIDENCE
-- ============================================================
-- This migration's own precondition block queries ali_family_review LIVE
-- and requires at least one matching approved row (family_id=
-- 'mock-mr09-funrun', decision='approved',
-- review_type='mock_maths_independent_review', reviewer='Ayobami Lawal',
-- notes carrying the MOCK-STRUCTURAL-CAPACITY-INCREMENT003 marker -- the
-- same marker migration 132 registered the pending-review placeholder
-- under) to exist before writing anything. Decision 182's own lesson is
-- applied directly: the marker predicate uses `notes LIKE '%MARKER%'`
-- (unanchored, substring-anywhere), never `notes LIKE 'MARKER%'`
-- (anchored to the start) -- every real, UI-submitted review's stored
-- notes value is prefixed with reviewer-qualification text before the
-- marker ever appears. The precondition accepts ANY count >= 1 matching
-- approved record, never exactly 1. 'Ayobami Lawal' is the same reviewer
-- identity every prior Mock Mathematics independent-validation
-- certification in this repository has required (migrations 123, 124,
-- 129, 130) -- not invented for this migration.
--
-- DISCLOSED LIMITATION: this session had no live database read access
-- (no service-role key present in this repository, no MCP/DB tool
-- connected). This migration's readiness rests on the Founder's own
-- direct assertion of production review approval (this session's own
-- directive) plus the migration's own fail-closed live precondition
-- below, which will safely refuse to write anything if that live
-- evidence does not in fact exist at apply time -- the same standing
-- pattern migrations 129 and 130 were each drafted under.
--
-- ============================================================
-- INDEPENDENT-VALIDATION BOUNDARY, NOT MOCK-ELIGIBILITY
-- ============================================================
-- This migration moves these 4 rows to 'independently_validated' ONLY.
-- It does NOT set eligibility_status = 'mock_eligible' anywhere, does
-- NOT insert, update, or delete any ali_family_review row, does NOT
-- touch any ali_mock_form row, does NOT touch any RPC, RLS policy, or
-- grant, and does NOT touch mock-mr13-craftstall, mock-mr10-bustimetable,
-- or mock-mr03mr07-perimeterarea in any way. The later decision about
-- whether mock-mr09-funrun enters the mock_eligible pool remains a
-- separate, future, Founder-authorised composition/governance step --
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
-- write, then re-reads and compares it byte-for-byte after.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does not touch mock_eligible, ali_mock_form, ali_family_review, any
-- RPC, RLS policy, or grant. Does not touch mock-mr13-craftstall,
-- mock-mr10-bustimetable, or mock-mr03mr07-perimeterarea. Does not touch
-- English or Writing content, Practice, or any other Mathematics family.
-- Does not author new content. Does not begin First Mock composition.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations 131 and
-- 132 (both Founder-confirmed applied) have already been applied.

begin;

do $$
declare
  v_target_ids constant text[] := array[
    'mock-mr09-funrun-01', 'mock-mr09-funrun-02', 'mock-mr09-funrun-03', 'mock-mr09-funrun-04'
  ];
  v_expected_stem constant text := 'Riverside Primary School held a sponsored fun run. The table below shows how many laps each runner completed.';
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
    and family_id = 'mock-mr09-funrun';

  select count(*) into v_already_validated_count
  from public.ali_question_bank
  where id = any(v_target_ids) and eligibility_status = 'independently_validated';

  -- Structural precondition audit -- every check below is evaluated
  -- regardless of which branch below actually runs, so a drift is
  -- caught even in the "already applied" case.
  select count(*) into v_subject_skill_count
    from public.ali_question_bank
    where id = any(v_target_ids) and subject = 'maths' and skill = 'QT-MR-09';
  if v_subject_skill_count <> 4 then
    raise exception 'Migration 133 refused: expected 4 rows with subject=maths, skill=QT-MR-09 (found %).', v_subject_skill_count;
  end if;

  select count(*) into v_marking_mode_count
    from public.ali_question_bank
    where id = any(v_target_ids) and marking_mode = 'deterministic';
  if v_marking_mode_count <> 4 then
    raise exception 'Migration 133 refused: expected 4 rows with marking_mode=deterministic (found %).', v_marking_mode_count;
  end if;

  select count(*) into v_grouping_count
    from public.ali_question_bank b
    join (values
      ('mock-mr09-funrun-01', 1, '(a)'),
      ('mock-mr09-funrun-02', 2, '(b)'),
      ('mock-mr09-funrun-03', 3, '(c)'),
      ('mock-mr09-funrun-04', 4, '(d)')
    ) as expected(id, expected_group_order, expected_subpart_label)
      on b.id = expected.id
    where b.question_group_id = 'mock-mr09-funrun'
      and b.group_order = expected.expected_group_order
      and b.subpart_label = expected.expected_subpart_label;
  if v_grouping_count <> 4 then
    raise exception 'Migration 133 refused: exact grouping (question_group_id/group_order/subpart_label) does not match the expected 01=1/(a), 02=2/(b), 03=3/(c), 04=4/(d) shape (found % of 4 matching).', v_grouping_count;
  end if;

  select count(*) into v_difficulty_count
    from public.ali_question_bank b
    join (values
      ('mock-mr09-funrun-01', 'medium'),
      ('mock-mr09-funrun-02', 'medium'),
      ('mock-mr09-funrun-03', 'hard'),
      ('mock-mr09-funrun-04', 'hard')
    ) as expected(id, expected_difficulty)
      on b.id = expected.id
    where b.content_difficulty::text = expected.expected_difficulty;
  if v_difficulty_count <> 4 then
    raise exception 'Migration 133 refused: expected difficulty medium/medium/hard/hard across the 4 rows in order (found % of 4 matching).', v_difficulty_count;
  end if;

  select count(*) into v_marks_count
    from public.ali_question_bank
    where id = any(v_target_ids) and (prompt->>'marks')::numeric = 1;
  if v_marks_count <> 4 then
    raise exception 'Migration 133 refused: expected 4 rows with marks=1 each (found %). Marking Integrity Gate must never be assumed satisfied.', v_marks_count;
  end if;

  select count(*) into v_answers_count
    from public.ali_question_bank b
    join (values
      ('mock-mr09-funrun-01', '30'),
      ('mock-mr09-funrun-02', '74'),
      ('mock-mr09-funrun-03', '2.5'),
      ('mock-mr09-funrun-04', '14')
    ) as expected(id, expected_answer)
      on b.id = expected.id
    where (b.prompt->>'answer') = expected.expected_answer;
  if v_answers_count <> 4 then
    raise exception 'Migration 133 refused: expected answers 30/74/2.5/14 across the 4 rows in order (found % of 4 matching).', v_answers_count;
  end if;

  select count(*) into v_shared_stem_count
    from public.ali_question_bank
    where id = any(v_target_ids) and (prompt->>'sharedStem') = v_expected_stem;
  if v_shared_stem_count <> 4 then
    raise exception 'Migration 133 refused: expected all 4 rows to carry the identical, exact sharedStem value (found %).', v_shared_stem_count;
  end if;

  select count(*) into v_stimulus_count
    from public.ali_question_bank
    where id = any(v_target_ids)
      and jsonb_typeof(prompt->'stimulus') = 'object'
      and prompt->'stimulus'->>'type' = 'table';
  if v_stimulus_count <> 4 then
    raise exception 'Migration 133 refused: expected all 4 rows to carry a valid table stimulus (found %).', v_stimulus_count;
  end if;

  select count(*) into v_non_empty_question_count
    from public.ali_question_bank
    where id = any(v_target_ids) and coalesce(length(prompt->>'question'), 0) > 0;
  if v_non_empty_question_count <> 4 then
    raise exception 'Migration 133 refused: every target row must have non-empty question text (found % of 4).', v_non_empty_question_count;
  end if;

  -- Live review-evidence precondition: at least one genuine approved
  -- record must exist for this exact family, this exact review_type,
  -- this exact reviewer, carrying the INCREMENT003 marker. Unanchored
  -- LIKE, per the Decision 182 lesson, accepting any count >= 1.
  select count(*) into v_approved_review_count
    from public.ali_family_review
    where family_id = 'mock-mr09-funrun'
      and decision = 'approved'
      and review_type = 'mock_maths_independent_review'
      and reviewer = 'Ayobami Lawal'
      and notes like '%MOCK-STRUCTURAL-CAPACITY-INCREMENT003%';
  if v_approved_review_count < 1 then
    raise exception 'Migration 133 refused: no matching approved ali_family_review record found for mock-mr09-funrun under the MOCK-STRUCTURAL-CAPACITY-INCREMENT003 marker. Certification requires real, live review evidence, not merely a header or Decision-log claim.';
  end if;

  select count(*) into v_active_count
    from public.ali_question_bank
    where id = any(v_target_ids) and active = true;
  if v_active_count <> 4 then
    raise exception 'Migration 133 refused: expected 4 active=true rows (found %).', v_active_count;
  end if;

  -- Exclusion guard: mock-mr13-craftstall, mock-mr10-bustimetable and
  -- mock-mr03mr07-perimeterarea must never appear in the target array,
  -- by construction.
  if exists (
    select 1 from unnest(v_target_ids) t
    where t like 'mock-mr13-craftstall%' or t like 'mock-mr10-bustimetable%' or t like 'mock-mr03mr07-perimeterarea%'
  ) then
    raise exception 'Migration 133 refused: mock-mr13-craftstall, mock-mr10-bustimetable and mock-mr03mr07-perimeterarea must never appear in the target array.';
  end if;

  select count(*) into v_excluded_still_untouched_count
    from public.ali_question_bank
    where id like 'mock-mr13-craftstall%' and eligibility_status = 'independently_validated';
  if v_excluded_still_untouched_count <> 3 then
    raise exception 'Migration 133 refused: expected mock-mr13-craftstall''s 3 rows to remain independently_validated (their migration 130 state), untouched by this migration (found %). Re-verify production state before proceeding.', v_excluded_still_untouched_count;
  end if;

  if v_pending_count = 4 then
    create temporary table tmp_funrun_prompt_snapshot (id text primary key, prompt_snapshot jsonb not null) on commit drop;
    insert into tmp_funrun_prompt_snapshot (id, prompt_snapshot)
      select id, prompt from public.ali_question_bank where id = any(v_target_ids);

    update public.ali_question_bank
    set eligibility_status = 'independently_validated'
    where id = any(v_target_ids)
      and eligibility_status = 'authentic_assessment_candidate';

    select count(*) into v_post_write_count
      from public.ali_question_bank
      where id = any(v_target_ids) and eligibility_status = 'independently_validated';
    if v_post_write_count <> 4 then
      raise exception 'Migration 133 post-write verification failed: expected 4 rows now independently_validated, found %. Rolling back.', v_post_write_count;
    end if;

    select count(*) into v_post_write_preserved_count
      from public.ali_question_bank b
      join tmp_funrun_prompt_snapshot s on b.id = s.id
      where b.prompt = s.prompt_snapshot;
    if v_post_write_preserved_count <> 4 then
      raise exception 'Migration 133 post-write preservation check failed: % of 4 rows have their prompt byte-for-byte unchanged (expected 4). Rolling back.', v_post_write_preserved_count;
    end if;

    select count(*) into v_post_write_count
      from public.ali_question_bank
      where id = any(v_target_ids) and eligibility_status = 'mock_eligible';
    if v_post_write_count <> 0 then
      raise exception 'Migration 133 refused: mock_eligible must never be set by this migration (found % rows). Rolling back.', v_post_write_count;
    end if;

    select count(*) into v_post_write_count
      from public.ali_question_bank
      where id like 'mock-mr13-craftstall%' and eligibility_status <> 'independently_validated';
    if v_post_write_count <> 0 then
      raise exception 'Migration 133 refused: mock-mr13-craftstall must remain untouched (found % rows with a changed eligibility_status). Rolling back.', v_post_write_count;
    end if;

    raise notice 'Migration 133: promoted 4 rows of mock-mr09-funrun (1 numbered experience, 4 marks) from authentic_assessment_candidate to independently_validated. NOT mock_eligible. Every prompt key proven byte-for-byte unchanged. mock-mr13-craftstall, mock-mr10-bustimetable and mock-mr03mr07-perimeterarea untouched.';

  elsif v_already_validated_count = 4 then
    raise notice 'Migration 133: all 4 target questions are already independently_validated -- already applied. No changes made.';

    select count(*) into v_post_write_count
      from public.ali_question_bank
      where id = any(v_target_ids) and eligibility_status = 'mock_eligible';
    if v_post_write_count <> 0 then
      raise exception 'Migration 133 refused: mock_eligible found set on % rows in the already-applied branch -- something else changed this family''s eligibility. Manual investigation required.', v_post_write_count;
    end if;

  else
    raise exception
      'Migration 133 refused: expected 4 authentic_assessment_candidate rows for mock-mr09-funrun (found %), or 4 already independently_validated (found %). Re-verify production state before proceeding.',
      v_pending_count, v_already_validated_count;
  end if;
end $$;

commit;
