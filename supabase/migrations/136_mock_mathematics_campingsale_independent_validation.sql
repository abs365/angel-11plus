-- Angel Digital 11+ — Migration 136
-- Mathematics Structural Capacity, Authoring Increment 004 — Camping Sale
-- Independent Validation (Decision 195/196/197).
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS
-- ============================================================
-- Migrations 134 (content) and 135 (pending-review placeholder) are
-- Founder-confirmed applied to production. The Founder has since
-- completed a direct production visual/educational review of
-- mock-mr04-campingsale (shared text-only narrative, all four subparts,
-- answers, one-mark-per-subpart structure, difficulty progression,
-- wording/11+ suitability, originality, anti-memorisation, structural
-- alignment, learner-facing presentation) and approved it. This migration
-- promotes exactly the 4 rows of mock-mr04-campingsale from
-- eligibility_status 'authentic_assessment_candidate' to
-- 'independently_validated' -- mirroring migrations 123/129/130/133's own
-- established independent-validation-promotion pattern exactly.
--
-- ============================================================
-- CONTENT RE-AUDIT (re-read directly from migration 134's own source
-- this session, not merely trusted from prior conversational reports)
-- ============================================================
-- subject=maths, skill=QT-MR-04, family_id=mock-mr04-campingsale,
-- active=true, marking_mode=deterministic, marks=1 each, question_group_id
-- =mock-mr04-campingsale, group_order 1/2/3/4, subpart_label
-- (a)/(b)/(c)/(d), content_difficulty easy/medium/hard/hard, identical
-- sharedStem ("A camping shop sells tents.") across all 4 rows, and NO
-- stimulus (this family is deliberately text-only narrative, unlike
-- mock-mr09-funrun's table stimulus -- confirmed absent from every row's
-- prompt, not merely unchecked).
--
-- All four answers independently re-derived again this session from the
-- real stored question text: (a) 15% off £120 -- two methods
-- (discount-then-subtract: £120-£18=£102; direct retained-fraction:
-- £120×0.85=£102) -- both agree £102; (b) 10% off the already-reduced
-- £102 -- two methods (discount-then-subtract: £102-£10.20=£91.80; direct
-- retained-fraction: £102×0.9=£91.80) -- both agree £91.80; (c) actual
-- sequential price £91.80 vs a single 25% discount off £120 -- two
-- methods (direct: £120×0.75=£90, £91.80-£90=£1.80; combined-multiplier:
-- 0.85×0.9=0.765 vs 0.75, difference 0.015×£120=£1.80) -- both agree
-- £1.80 MORE (sequential discounts are strictly less generous than the
-- equivalent single discount, so the direction is unambiguous); (d) £136
-- is the sale price after a single 20% discount -- two methods (division:
-- £136÷0.8=£170; forward check: £170×0.8=£136) -- both agree £170. All
-- four answers are exact to the penny; no rounding ambiguity exists
-- anywhere in this family. Subpart (d) is a wholly independent second
-- tent with its own complete given facts -- no dependency on (a)-(c) of
-- any kind, and no subpart's marking depends on a learner's own answer to
-- a prior subpart (each restates the necessary intermediate fact directly
-- as a given).
--
-- ============================================================
-- REVIEW EVIDENCE
-- ============================================================
-- This migration's own precondition block queries ali_family_review LIVE
-- and requires at least one matching approved row (family_id=
-- 'mock-mr04-campingsale', decision='approved',
-- review_type='mock_maths_independent_review', reviewer='Ayobami Lawal',
-- notes carrying the MOCK-STRUCTURAL-CAPACITY-INCREMENT004 marker -- the
-- same marker migration 135 registered the pending-review placeholder
-- under) to exist before writing anything. Decision 182's own lesson is
-- applied directly: the marker predicate uses `notes LIKE '%MARKER%'`
-- (unanchored, substring-anywhere), never `notes LIKE 'MARKER%'`
-- (anchored to the start) -- every real, UI-submitted review's stored
-- notes value is prefixed with reviewer-qualification text before the
-- marker ever appears. The precondition accepts ANY count >= 1 matching
-- approved record, never exactly 1. 'Ayobami Lawal' is the same reviewer
-- identity every prior Mock Mathematics independent-validation
-- certification in this repository has required (migrations 123, 124,
-- 129, 130, 133) -- not invented for this migration.
--
-- DISCLOSED LIMITATION: this session had no live database read access
-- (no service-role key present in this repository, no MCP/DB tool
-- connected). This migration's readiness rests on the Founder's own
-- direct assertion of production review approval (this session's own
-- directive) plus the migration's own fail-closed live precondition
-- below, which will safely refuse to write anything if that live
-- evidence does not in fact exist at apply time -- the same standing
-- pattern migrations 129, 130 and 133 were each drafted under.
--
-- ============================================================
-- INDEPENDENT-VALIDATION BOUNDARY, NOT MOCK-ELIGIBILITY
-- ============================================================
-- This migration moves these 4 rows to 'independently_validated' ONLY. It
-- does NOT set eligibility_status = 'mock_eligible' anywhere, does NOT
-- insert, update, or delete any ali_family_review row, does NOT touch any
-- ali_mock_form row, does NOT touch any RPC, RLS policy, or grant, and
-- does NOT touch mock-mr09-funrun, mock-mr13-craftstall,
-- mock-mr10-bustimetable, or mock-mr03mr07-perimeterarea in any way. The
-- later decision about whether mock-mr04-campingsale enters the
-- mock_eligible pool remains a separate, future, Founder-authorised
-- composition/governance step -- not begun, not implied, by this
-- migration.
--
-- ============================================================
-- CONTENT IMMUTABILITY
-- ============================================================
-- No prompt key (question, answer, marks, sharedStem, workingSteps,
-- skill, or any other), content_difficulty, family_id, provenance,
-- content_version, question_group_id, group_order, subpart_label,
-- marking_mode, or active state is changed. Only eligibility_status
-- moves. Proven, not merely asserted: this migration snapshots each
-- target row's own COMPLETE `prompt` value before any write, then
-- re-reads and compares it byte-for-byte after.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does not touch mock_eligible, ali_mock_form, ali_family_review, any
-- RPC, RLS policy, or grant. Does not touch mock-mr09-funrun,
-- mock-mr13-craftstall, mock-mr10-bustimetable, or
-- mock-mr03mr07-perimeterarea. Does not touch English or Writing content,
-- Practice, or any other Mathematics family. Does not author new content.
-- Does not begin First Mock composition.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations 134 and
-- 135 (both Founder-confirmed applied) have already been applied.

begin;

do $$
declare
  v_target_ids constant text[] := array[
    'mock-mr04-campingsale-01', 'mock-mr04-campingsale-02', 'mock-mr04-campingsale-03', 'mock-mr04-campingsale-04'
  ];
  v_expected_stem constant text := 'A camping shop sells tents.';
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
  v_no_stimulus_count int;
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
    and family_id = 'mock-mr04-campingsale';

  select count(*) into v_already_validated_count
  from public.ali_question_bank
  where id = any(v_target_ids) and eligibility_status = 'independently_validated';

  -- Structural precondition audit -- every check below is evaluated
  -- regardless of which branch below actually runs, so a drift is
  -- caught even in the "already applied" case.
  select count(*) into v_subject_skill_count
    from public.ali_question_bank
    where id = any(v_target_ids) and subject = 'maths' and skill = 'QT-MR-04';
  if v_subject_skill_count <> 4 then
    raise exception 'Migration 136 refused: expected 4 rows with subject=maths, skill=QT-MR-04 (found %).', v_subject_skill_count;
  end if;

  select count(*) into v_marking_mode_count
    from public.ali_question_bank
    where id = any(v_target_ids) and marking_mode = 'deterministic';
  if v_marking_mode_count <> 4 then
    raise exception 'Migration 136 refused: expected 4 rows with marking_mode=deterministic (found %).', v_marking_mode_count;
  end if;

  select count(*) into v_grouping_count
    from public.ali_question_bank b
    join (values
      ('mock-mr04-campingsale-01', 1, '(a)'),
      ('mock-mr04-campingsale-02', 2, '(b)'),
      ('mock-mr04-campingsale-03', 3, '(c)'),
      ('mock-mr04-campingsale-04', 4, '(d)')
    ) as expected(id, expected_group_order, expected_subpart_label)
      on b.id = expected.id
    where b.question_group_id = 'mock-mr04-campingsale'
      and b.group_order = expected.expected_group_order
      and b.subpart_label = expected.expected_subpart_label;
  if v_grouping_count <> 4 then
    raise exception 'Migration 136 refused: exact grouping (question_group_id/group_order/subpart_label) does not match the expected 01=1/(a), 02=2/(b), 03=3/(c), 04=4/(d) shape (found % of 4 matching).', v_grouping_count;
  end if;

  select count(*) into v_difficulty_count
    from public.ali_question_bank b
    join (values
      ('mock-mr04-campingsale-01', 'easy'),
      ('mock-mr04-campingsale-02', 'medium'),
      ('mock-mr04-campingsale-03', 'hard'),
      ('mock-mr04-campingsale-04', 'hard')
    ) as expected(id, expected_difficulty)
      on b.id = expected.id
    where b.content_difficulty::text = expected.expected_difficulty;
  if v_difficulty_count <> 4 then
    raise exception 'Migration 136 refused: expected difficulty easy/medium/hard/hard across the 4 rows in order (found % of 4 matching).', v_difficulty_count;
  end if;

  select count(*) into v_marks_count
    from public.ali_question_bank
    where id = any(v_target_ids) and (prompt->>'marks')::numeric = 1;
  if v_marks_count <> 4 then
    raise exception 'Migration 136 refused: expected 4 rows with marks=1 each (found %). Marking Integrity Gate must never be assumed satisfied.', v_marks_count;
  end if;

  select count(*) into v_answers_count
    from public.ali_question_bank b
    join (values
      ('mock-mr04-campingsale-01', '£102'),
      ('mock-mr04-campingsale-02', '£91.80'),
      ('mock-mr04-campingsale-03', '£1.80'),
      ('mock-mr04-campingsale-04', '£170')
    ) as expected(id, expected_answer)
      on b.id = expected.id
    where (b.prompt->>'answer') = expected.expected_answer;
  if v_answers_count <> 4 then
    raise exception 'Migration 136 refused: expected answers £102/£91.80/£1.80/£170 across the 4 rows in order (found % of 4 matching).', v_answers_count;
  end if;

  select count(*) into v_shared_stem_count
    from public.ali_question_bank
    where id = any(v_target_ids) and (prompt->>'sharedStem') = v_expected_stem;
  if v_shared_stem_count <> 4 then
    raise exception 'Migration 136 refused: expected all 4 rows to carry the identical, exact sharedStem value (found %).', v_shared_stem_count;
  end if;

  -- This family is deliberately text-only narrative content (Decision
  -- 195 Part 9's preference, distinguishing it from mock-mr09-funrun's
  -- table stimulus) -- confirm no row carries a stimulus key, rather than
  -- merely skipping any check.
  select count(*) into v_no_stimulus_count
    from public.ali_question_bank
    where id = any(v_target_ids) and prompt ? 'stimulus';
  if v_no_stimulus_count <> 0 then
    raise exception 'Migration 136 refused: mock-mr04-campingsale is text-only narrative content and must never carry a stimulus key (found % rows with one).', v_no_stimulus_count;
  end if;

  select count(*) into v_non_empty_question_count
    from public.ali_question_bank
    where id = any(v_target_ids) and coalesce(length(prompt->>'question'), 0) > 0;
  if v_non_empty_question_count <> 4 then
    raise exception 'Migration 136 refused: every target row must have non-empty question text (found % of 4).', v_non_empty_question_count;
  end if;

  -- Live review-evidence precondition: at least one genuine approved
  -- record must exist for this exact family, this exact review_type,
  -- this exact reviewer, carrying the INCREMENT004 marker. Unanchored
  -- LIKE, per the Decision 182 lesson, accepting any count >= 1.
  select count(*) into v_approved_review_count
    from public.ali_family_review
    where family_id = 'mock-mr04-campingsale'
      and decision = 'approved'
      and review_type = 'mock_maths_independent_review'
      and reviewer = 'Ayobami Lawal'
      and notes like '%MOCK-STRUCTURAL-CAPACITY-INCREMENT004%';
  if v_approved_review_count < 1 then
    raise exception 'Migration 136 refused: no matching approved ali_family_review record found for mock-mr04-campingsale under the MOCK-STRUCTURAL-CAPACITY-INCREMENT004 marker. Certification requires real, live review evidence, not merely a header or Decision-log claim.';
  end if;

  select count(*) into v_active_count
    from public.ali_question_bank
    where id = any(v_target_ids) and active = true;
  if v_active_count <> 4 then
    raise exception 'Migration 136 refused: expected 4 active=true rows (found %).', v_active_count;
  end if;

  -- Exclusion guard: mock-mr09-funrun, mock-mr13-craftstall,
  -- mock-mr10-bustimetable and mock-mr03mr07-perimeterarea must never
  -- appear in the target array, by construction.
  if exists (
    select 1 from unnest(v_target_ids) t
    where t like 'mock-mr09-funrun%' or t like 'mock-mr13-craftstall%'
       or t like 'mock-mr10-bustimetable%' or t like 'mock-mr03mr07-perimeterarea%'
  ) then
    raise exception 'Migration 136 refused: mock-mr09-funrun, mock-mr13-craftstall, mock-mr10-bustimetable and mock-mr03mr07-perimeterarea must never appear in the target array.';
  end if;

  select count(*) into v_excluded_still_untouched_count
    from public.ali_question_bank
    where id like 'mock-mr09-funrun%' and eligibility_status = 'independently_validated';
  if v_excluded_still_untouched_count <> 4 then
    raise exception 'Migration 136 refused: expected mock-mr09-funrun''s 4 rows to remain independently_validated (their migration 133 state), untouched by this migration (found %). Re-verify production state before proceeding.', v_excluded_still_untouched_count;
  end if;

  select count(*) into v_excluded_still_untouched_count
    from public.ali_question_bank
    where id like 'mock-mr13-craftstall%' and eligibility_status = 'independently_validated';
  if v_excluded_still_untouched_count <> 3 then
    raise exception 'Migration 136 refused: expected mock-mr13-craftstall''s 3 rows to remain independently_validated (their migration 130 state), untouched by this migration (found %). Re-verify production state before proceeding.', v_excluded_still_untouched_count;
  end if;

  if v_pending_count = 4 then
    create temporary table tmp_campingsale_prompt_snapshot (id text primary key, prompt_snapshot jsonb not null) on commit drop;
    insert into tmp_campingsale_prompt_snapshot (id, prompt_snapshot)
      select id, prompt from public.ali_question_bank where id = any(v_target_ids);

    update public.ali_question_bank
    set eligibility_status = 'independently_validated'
    where id = any(v_target_ids)
      and eligibility_status = 'authentic_assessment_candidate';

    select count(*) into v_post_write_count
      from public.ali_question_bank
      where id = any(v_target_ids) and eligibility_status = 'independently_validated';
    if v_post_write_count <> 4 then
      raise exception 'Migration 136 post-write verification failed: expected 4 rows now independently_validated, found %. Rolling back.', v_post_write_count;
    end if;

    select count(*) into v_post_write_preserved_count
      from public.ali_question_bank b
      join tmp_campingsale_prompt_snapshot s on b.id = s.id
      where b.prompt = s.prompt_snapshot;
    if v_post_write_preserved_count <> 4 then
      raise exception 'Migration 136 post-write preservation check failed: % of 4 rows have their prompt byte-for-byte unchanged (expected 4). Rolling back.', v_post_write_preserved_count;
    end if;

    select count(*) into v_post_write_count
      from public.ali_question_bank
      where id = any(v_target_ids) and eligibility_status = 'mock_eligible';
    if v_post_write_count <> 0 then
      raise exception 'Migration 136 refused: mock_eligible must never be set by this migration (found % rows). Rolling back.', v_post_write_count;
    end if;

    select count(*) into v_post_write_count
      from public.ali_question_bank
      where id like 'mock-mr09-funrun%' and eligibility_status <> 'independently_validated';
    if v_post_write_count <> 0 then
      raise exception 'Migration 136 refused: mock-mr09-funrun must remain untouched (found % rows with a changed eligibility_status). Rolling back.', v_post_write_count;
    end if;

    select count(*) into v_post_write_count
      from public.ali_question_bank
      where id like 'mock-mr13-craftstall%' and eligibility_status <> 'independently_validated';
    if v_post_write_count <> 0 then
      raise exception 'Migration 136 refused: mock-mr13-craftstall must remain untouched (found % rows with a changed eligibility_status). Rolling back.', v_post_write_count;
    end if;

    raise notice 'Migration 136: promoted 4 rows of mock-mr04-campingsale (1 numbered experience, 4 marks) from authentic_assessment_candidate to independently_validated. NOT mock_eligible. Every prompt key proven byte-for-byte unchanged. mock-mr09-funrun, mock-mr13-craftstall, mock-mr10-bustimetable and mock-mr03mr07-perimeterarea untouched.';

  elsif v_already_validated_count = 4 then
    raise notice 'Migration 136: all 4 target questions are already independently_validated -- already applied. No changes made.';

    select count(*) into v_post_write_count
      from public.ali_question_bank
      where id = any(v_target_ids) and eligibility_status = 'mock_eligible';
    if v_post_write_count <> 0 then
      raise exception 'Migration 136 refused: mock_eligible found set on % rows in the already-applied branch -- something else changed this family''s eligibility. Manual investigation required.', v_post_write_count;
    end if;

  else
    raise exception
      'Migration 136 refused: expected 4 authentic_assessment_candidate rows for mock-mr04-campingsale (found %), or 4 already independently_validated (found %). Re-verify production state before proceeding.',
      v_pending_count, v_already_validated_count;
  end if;
end $$;

commit;
