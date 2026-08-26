-- Angel Digital 11+ — Migration 130
-- Mathematics Structural Capacity, Wave 002 — Craft Stall Independent
-- Validation (Decision 189/190).
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS
-- ============================================================
-- Decision 189's own recomputed evidence found mock-mr13-craftstall
-- (Founder-reviewed and approved during Wave 002, never corrected,
-- never defective) sitting at authentic_assessment_candidate with no
-- certification migration ever drafted for it -- the cheapest,
-- zero-authoring, zero-engineering lever available, and the sole
-- remaining precondition before a combined Bus-Timetable-plus-
-- Craft-Stall mock-eligibility composition decision (Decision 188's own
-- named next step) can even be considered. This migration promotes
-- exactly the 3 rows of mock-mr13-craftstall from
-- eligibility_status 'authentic_assessment_candidate' to
-- 'independently_validated' -- mirroring migration 129's own
-- (and, before it, 123's own) established independent-validation-
-- promotion pattern exactly.
--
-- ============================================================
-- REVIEW EVIDENCE (re-derived from source this session, not merely
-- trusted from prior Decision prose)
-- ============================================================
-- Unlike mock-mr10-bustimetable, mock-mr13-craftstall's content was
-- never corrected after Wave 002 authoring -- Decision 186 Part 6
-- recorded a split verdict: "mock-mr13-craftstall: PASS/APPROVED,
-- untouched. No corrective action, no re-review required." No new
-- marker was ever registered for this family (migration 128 registers
-- a re-review ONLY for mock-mr10-bustimetable, under
-- MOCK-BUSTIMETABLE-CORRECTION001, and explicitly states
-- mock-mr13-craftstall "requires no corrective re-review from this
-- finding" and "is never referenced anywhere in this file's own
-- executable SQL"). The ORIGINAL Wave 002 pending-review placeholder
-- (migration 126) was therefore filed, and remains, under the original
-- MOCK-STRUCTURAL-CAPACITY-WAVE002 marker -- and it is that same,
-- original marker this migration's own precondition requires, because
-- it is the marker under which the real approval was recorded. This is
-- the deliberate mirror image of migration 129's own choice to require
-- the NEW marker for mock-mr10-bustimetable specifically because that
-- family's content had changed since its original approval; here, no
-- content changed, so the original approval remains the live,
-- unsuperseded evidence.
--
-- This migration's own precondition block queries ali_family_review
-- LIVE and requires at least one matching approved row (family_id,
-- decision='approved', review_type='mock_maths_independent_review',
-- reviewer='Ayobami Lawal', notes carrying the
-- MOCK-STRUCTURAL-CAPACITY-WAVE002 marker) to exist before writing
-- anything. Decision 182's own lesson is applied directly: the marker
-- predicate uses `notes LIKE '%MARKER%'` (unanchored, substring-
-- anywhere), never `notes LIKE 'MARKER%'` (anchored to the start) --
-- every real, UI-submitted review's stored notes value is prefixed with
-- "Reviewer qualification: {basis}.\n\n" before the marker ever
-- appears. The precondition accepts ANY count >= 1 matching approved
-- record, never exactly 1.
--
-- DISCLOSED LIMITATION: this session had no live database read access
-- (no service-role key present in this repository, no MCP/DB tool
-- connected; the anon key's own view of ali_family_review returns 0
-- rows under RLS, which this project's own established evidence
-- discipline treats as "not visible", never as "proof of absence" --
-- see scripts/check-family-review-raw.mjs's own header). This
-- migration's readiness rests on three independent, prior Decision-log
-- entries (186, 188, 189) all consistently describing the same
-- reviewer/decision/review_type/marker combination for this exact
-- family, plus the migration's own fail-closed live precondition below,
-- which will safely refuse to write anything if that evidence does not
-- in fact exist at apply time. This is the same standing pattern
-- migration 129 itself was drafted under.
--
-- ============================================================
-- INDEPENDENT-VALIDATION BOUNDARY, NOT MOCK-ELIGIBILITY
-- ============================================================
-- This migration moves these 3 rows to 'independently_validated' ONLY.
-- It does NOT set eligibility_status = 'mock_eligible' anywhere, does
-- NOT insert, update, or delete any ali_family_review row, does NOT
-- touch any ali_mock_form row, does NOT touch any RPC, RLS policy, or
-- grant, and does NOT touch mock-mr10-bustimetable or
-- mock-mr03mr07-perimeterarea in any way. The later decision about
-- whether mock-mr13-craftstall enters the mock_eligible pool remains a
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
-- write, then re-reads and compares it byte-for-byte after -- since
-- eligibility_status is the ONLY column this migration's own UPDATE
-- statement ever names, a full-prompt snapshot is the correct, complete
-- preservation proof here (matching migrations 123 and 129's own
-- established pattern exactly).
--
-- ============================================================
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does not touch mock_eligible, ali_mock_form, ali_family_review, any
-- RPC, RLS policy, or grant. Does not touch mock-mr10-bustimetable or
-- mock-mr03mr07-perimeterarea. Does not touch English or Writing
-- content, Practice, or any other Mathematics family. Does not author
-- new content. Does not begin First Mock composition.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations 125 and
-- 126 (both confirmed applied per Decision 189's own reconciliation)
-- have already been applied.

begin;

do $$
declare
  v_target_ids constant text[] := array[
    'mock-mr13-craftstall-01', 'mock-mr13-craftstall-02', 'mock-mr13-craftstall-03'
  ];
  v_expected_stem constant text := 'A craft fair stall sells keyrings, bracelets and stickers. Keyrings are sold in packs of 5 for £2.00 each pack. Bracelets are sold individually for £1.20 each. Stickers are sold in packs of 8 for £1.60 each pack.';
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
    and family_id = 'mock-mr13-craftstall';

  select count(*) into v_already_validated_count
  from public.ali_question_bank
  where id = any(v_target_ids)
    and eligibility_status = 'independently_validated';

  -- Structural precondition audit -- every check below is evaluated
  -- regardless of which branch below actually runs, so a drift is
  -- caught even in the "already applied" case.
  select count(*) into v_subject_skill_count
    from public.ali_question_bank
    where id = any(v_target_ids) and subject = 'maths' and skill = 'QT-MR-13';
  if v_subject_skill_count <> 3 then
    raise exception 'Migration 130 refused: expected 3 rows with subject=maths, skill=QT-MR-13 (found %).', v_subject_skill_count;
  end if;

  select count(*) into v_marking_mode_count
    from public.ali_question_bank
    where id = any(v_target_ids) and marking_mode = 'deterministic';
  if v_marking_mode_count <> 3 then
    raise exception 'Migration 130 refused: expected 3 rows with marking_mode=deterministic (found %).', v_marking_mode_count;
  end if;

  select count(*) into v_grouping_count
    from public.ali_question_bank b
    join (values
      ('mock-mr13-craftstall-01', 1, '(a)'),
      ('mock-mr13-craftstall-02', 2, '(b)'),
      ('mock-mr13-craftstall-03', 3, '(c)')
    ) as expected(id, expected_group_order, expected_subpart_label)
      on b.id = expected.id
    where b.question_group_id = 'mock-mr13-craftstall'
      and b.group_order = expected.expected_group_order
      and b.subpart_label = expected.expected_subpart_label;
  if v_grouping_count <> 3 then
    raise exception 'Migration 130 refused: exact grouping (question_group_id/group_order/subpart_label) does not match the expected 01=1/(a), 02=2/(b), 03=3/(c) shape (found % of 3 matching).', v_grouping_count;
  end if;

  select count(*) into v_difficulty_count
    from public.ali_question_bank b
    join (values
      ('mock-mr13-craftstall-01', 'medium'),
      ('mock-mr13-craftstall-02', 'medium'),
      ('mock-mr13-craftstall-03', 'hard')
    ) as expected(id, expected_difficulty)
      on b.id = expected.id
    where b.content_difficulty::text = expected.expected_difficulty;
  if v_difficulty_count <> 3 then
    raise exception 'Migration 130 refused: expected difficulty medium/medium/hard across the 3 rows in order (found % of 3 matching).', v_difficulty_count;
  end if;

  select count(*) into v_marks_count
    from public.ali_question_bank
    where id = any(v_target_ids) and (prompt->>'marks')::numeric = 1;
  if v_marks_count <> 3 then
    raise exception 'Migration 130 refused: expected 3 rows with marks=1 each (found %). Marking Integrity Gate must never be assumed satisfied.', v_marks_count;
  end if;

  select count(*) into v_answers_count
    from public.ali_question_bank b
    join (values
      ('mock-mr13-craftstall-01', '18.00'),
      ('mock-mr13-craftstall-02', 'Stickers'),
      ('mock-mr13-craftstall-03', '3')
    ) as expected(id, expected_answer)
      on b.id = expected.id
    where (b.prompt->>'answer') = expected.expected_answer;
  if v_answers_count <> 3 then
    raise exception 'Migration 130 refused: expected answers 18.00/Stickers/3 across the 3 rows in order (found % of 3 matching).', v_answers_count;
  end if;

  select count(*) into v_shared_stem_count
    from public.ali_question_bank
    where id = any(v_target_ids) and (prompt->>'sharedStem') = v_expected_stem;
  if v_shared_stem_count <> 3 then
    raise exception 'Migration 130 refused: expected all 3 rows to carry the identical, exact sharedStem value (found %).', v_shared_stem_count;
  end if;

  select count(*) into v_stimulus_count
    from public.ali_question_bank
    where id = any(v_target_ids)
      and jsonb_typeof(prompt->'stimulus') = 'object'
      and prompt->'stimulus'->>'type' = 'table';
  if v_stimulus_count <> 3 then
    raise exception 'Migration 130 refused: expected all 3 rows to carry a valid table stimulus (found %).', v_stimulus_count;
  end if;

  select count(*) into v_non_empty_question_count
    from public.ali_question_bank
    where id = any(v_target_ids) and coalesce(length(prompt->>'question'), 0) > 0;
  if v_non_empty_question_count <> 3 then
    raise exception 'Migration 130 refused: every target row must have non-empty question text (found % of 3).', v_non_empty_question_count;
  end if;

  -- Live review-evidence precondition: at least one genuine approved
  -- record must exist for this exact family, this exact review_type,
  -- this exact reviewer, carrying the ORIGINAL WAVE002 marker -- the
  -- one under which this family's real, unsuperseded approval was
  -- recorded (this family's content was never corrected, so no new
  -- marker was ever registered for it, unlike mock-mr10-bustimetable).
  -- Unanchored LIKE, per the Decision 182 lesson, accepting any
  -- count >= 1.
  select count(*) into v_approved_review_count
    from public.ali_family_review
    where family_id = 'mock-mr13-craftstall'
      and decision = 'approved'
      and review_type = 'mock_maths_independent_review'
      and reviewer = 'Ayobami Lawal'
      and notes like '%MOCK-STRUCTURAL-CAPACITY-WAVE002%';
  if v_approved_review_count < 1 then
    raise exception 'Migration 130 refused: no matching approved ali_family_review record found for mock-mr13-craftstall under the MOCK-STRUCTURAL-CAPACITY-WAVE002 marker. Certification requires real, live review evidence, not merely a header or Decision-log claim.';
  end if;

  select count(*) into v_active_count
    from public.ali_question_bank
    where id = any(v_target_ids) and active = true;
  if v_active_count <> 3 then
    raise exception 'Migration 130 refused: expected 3 active=true rows (found %).', v_active_count;
  end if;

  -- Exclusion guard: mock-mr10-bustimetable and mock-mr03mr07-perimeterarea
  -- must never appear in the target array, by construction.
  if exists (
    select 1 from unnest(v_target_ids) t
    where t like 'mock-mr10-bustimetable%' or t like 'mock-mr03mr07-perimeterarea%'
  ) then
    raise exception 'Migration 130 refused: mock-mr10-bustimetable and mock-mr03mr07-perimeterarea must never appear in the target array.';
  end if;

  select count(*) into v_excluded_still_untouched_count
    from public.ali_question_bank
    where id like 'mock-mr10-bustimetable%' and eligibility_status = 'independently_validated';
  if v_excluded_still_untouched_count <> 4 then
    raise exception 'Migration 130 refused: expected mock-mr10-bustimetable''s 4 rows to remain independently_validated (their migration 129 state), untouched by this migration (found %). Re-verify production state before proceeding.', v_excluded_still_untouched_count;
  end if;

  if v_pending_count = 3 then
    create temporary table tmp_craftstall_prompt_snapshot (id text primary key, prompt_snapshot jsonb not null) on commit drop;
    insert into tmp_craftstall_prompt_snapshot (id, prompt_snapshot)
      select id, prompt from public.ali_question_bank where id = any(v_target_ids);

    update public.ali_question_bank
    set eligibility_status = 'independently_validated'
    where id = any(v_target_ids)
      and eligibility_status = 'authentic_assessment_candidate';

    select count(*) into v_post_write_count
      from public.ali_question_bank
      where id = any(v_target_ids) and eligibility_status = 'independently_validated';
    if v_post_write_count <> 3 then
      raise exception 'Migration 130 post-write verification failed: expected 3 rows now independently_validated, found %. Rolling back.', v_post_write_count;
    end if;

    select count(*) into v_post_write_preserved_count
      from public.ali_question_bank b
      join tmp_craftstall_prompt_snapshot s on b.id = s.id
      where b.prompt = s.prompt_snapshot;
    if v_post_write_preserved_count <> 3 then
      raise exception 'Migration 130 post-write preservation check failed: % of 3 rows have their prompt byte-for-byte unchanged (expected 3). Rolling back.', v_post_write_preserved_count;
    end if;

    select count(*) into v_post_write_count
      from public.ali_question_bank
      where id = any(v_target_ids) and eligibility_status = 'mock_eligible';
    if v_post_write_count <> 0 then
      raise exception 'Migration 130 refused: mock_eligible must never be set by this migration (found % rows). Rolling back.', v_post_write_count;
    end if;

    select count(*) into v_post_write_count
      from public.ali_question_bank
      where id like 'mock-mr10-bustimetable%' and eligibility_status <> 'independently_validated';
    if v_post_write_count <> 0 then
      raise exception 'Migration 130 refused: mock-mr10-bustimetable must remain untouched (found % rows with a changed eligibility_status). Rolling back.', v_post_write_count;
    end if;

    raise notice 'Migration 130: promoted 3 rows of mock-mr13-craftstall (1 numbered experience, 3 marks) from authentic_assessment_candidate to independently_validated. NOT mock_eligible. Every prompt key proven byte-for-byte unchanged. mock-mr10-bustimetable and mock-mr03mr07-perimeterarea untouched.';

  elsif v_already_validated_count = 3 then
    raise notice 'Migration 130: all 3 target questions are already independently_validated -- already applied. No changes made.';

    select count(*) into v_post_write_count
      from public.ali_question_bank
      where id = any(v_target_ids) and eligibility_status = 'mock_eligible';
    if v_post_write_count <> 0 then
      raise exception 'Migration 130 refused: mock_eligible found set on % rows in the already-applied branch -- something else changed this family''s eligibility. Manual investigation required.', v_post_write_count;
    end if;

  else
    raise exception
      'Migration 130 refused: expected 3 authentic_assessment_candidate rows for mock-mr13-craftstall (found %), or 3 already independently_validated (found %). Re-verify production state before proceeding.',
      v_pending_count, v_already_validated_count;
  end if;
end $$;

commit;
