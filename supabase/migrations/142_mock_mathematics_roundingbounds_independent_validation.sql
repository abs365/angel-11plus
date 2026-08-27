-- Angel Digital 11+ — Migration 142
-- Mathematics Structural Capacity, Authoring Increment 006 — Rounding-
-- Bounds Independent Validation (Decision 205/206/207).
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS
-- ============================================================
-- Migrations 140 (content) and 141 (pending-review placeholder) are
-- Founder-confirmed applied to production. The Founder has since
-- completed a direct production Educational Review of the complete
-- mock-mr11-roundingbounds family (all 4 rows, shared Oakwood Athletics
-- Meet scenario, all 4 subparts, answers, one-mark-per-subpart
-- structure, difficulty progression, wording/11+ suitability,
-- originality, anti-memorisation, structural alignment, learner-facing
-- presentation) and approved it via the review surface
-- (app/admin-beta/review/page.tsx's MockStructuralCapacityIncrement006Section,
-- which this session confirmed renders "1 of 1 families reviewed. 4 new
-- questions total across 1 family." and "reviewed (approved)" once a
-- genuine approval exists -- the exact text the Founder's production
-- evidence shows). This migration promotes exactly the 4 rows of
-- mock-mr11-roundingbounds from eligibility_status
-- 'authentic_assessment_candidate' to 'independently_validated' --
-- mirroring migrations 123/129/130/133/136/139's own established
-- independent-validation-promotion pattern exactly. Per this task's own
-- explicit instruction, the screenshot is treated as corroboration only:
-- this migration's own live precondition below independently requires a
-- real, matching, approved ali_family_review row and will fail closed if
-- that evidence does not in fact exist at apply time.
--
-- ============================================================
-- CONTENT RE-AUDIT (re-read directly from migration 140's own source this
-- session, not merely trusted from prior conversational reports)
-- ============================================================
-- subject=maths, skill=QT-MR-11, family_id=mock-mr11-roundingbounds,
-- active=true, marking_mode=deterministic, marks=1 each, question_group_id
-- =mock-mr11-roundingbounds, group_order 1/2/3/4, subpart_label
-- (a)/(b)/(c)/(d), content_difficulty easy/easy/medium/hard, identical
-- sharedStem ("At the Oakwood Athletics Meet, the number of adult
-- spectators rounds to 380 to the nearest 10. The number of child
-- spectators rounds to 240 to the nearest 10.") across all 4 rows. EXACTLY
-- FOUR ROWS -- migration 140's own header and body confirmed directly this
-- session: no fifth row, no formal interval-notation or error-bound
-- terminology, no secondary-school technique required anywhere in the
-- stored family.
--
-- All four answers independently re-derived again this session, by two
-- methods each, from the real stored question text and the round-half-up
-- convention migration 140 itself documents:
--  (a) adults round to 380 (nearest 10) => true value in [375,384].
--      Method 1 (boundary rule): N-5 to N+4 for N=380 => 375 to 384.
--      Method 2 (direct check): 384 rounds to 380 (385 would round to
--      390). Largest = 384. MATCHES stored answer 384.
--  (b) children round to 240 (nearest 10) => true value in [235,244].
--      Method 1: N-5 to N+4 for N=240 => 235 to 244.
--      Method 2 (direct check): 235 rounds to 240 (234 would round to
--      230). Smallest = 235. MATCHES stored answer 235.
--  (c) largest total = largest adults + largest children.
--      Method 1 (direct sum): 384+244=628.
--      Method 2 (bound-adjustment): 380+240=620, plus upper adjustments
--      (+4 and +4) = 628. MATCHES stored answer 628.
--  (d) smallest difference = smallest adults - largest children.
--      Method 1 (direct difference): 375-244=131.
--      Method 2 (bound-adjustment): 380-240=140, minus the adults'
--      downward adjustment (-5) minus the children's upward adjustment
--      (-4) = 131. MATCHES stored answer 131.
-- Boundary logic re-checked: spectator counts are whole numbers by
-- construction (a count of people); each lower bound (375, 235) is
-- correctly INCLUDED in its range; the next rounding threshold (385
-- rounds to 390; 234 rounds to 230) is correctly EXCLUDED; every answer is
-- a single deterministic whole number, not a range or multiple-valid-
-- answer format; wording uses the same plain "largest possible"/"smallest
-- possible" phrasing as the real source, unambiguous; no formal interval
-- notation or error-bound technique is required anywhere. Every subpart is
-- fully self-contained (both rounding facts are restated via the shared
-- stem in every row) -- no subpart's marking depends on a learner's own
-- answer to a prior subpart.
--
-- ============================================================
-- REVIEW EVIDENCE
-- ============================================================
-- This migration's own precondition block queries ali_family_review LIVE
-- and requires at least one matching approved row (family_id=
-- 'mock-mr11-roundingbounds', decision='approved',
-- review_type='mock_maths_independent_review', reviewer='Ayobami Lawal',
-- notes carrying the MOCK-STRUCTURAL-CAPACITY-INCREMENT006 marker -- the
-- same marker migration 141 registered the pending-review placeholder
-- under) to exist before writing anything. Decision 182's own lesson is
-- applied directly: the marker predicate uses `notes LIKE '%MARKER%'`
-- (unanchored, substring-anywhere), never `notes LIKE 'MARKER%'`
-- (anchored to the start) -- every real, UI-submitted review's stored
-- notes value is prefixed with reviewer-qualification text before the
-- marker ever appears (confirmed directly this session against
-- app/admin-beta/review/page.tsx's own notesPrefix concatenation and
-- lib/adminReview.ts's buildNotesWithQualification()). The precondition
-- accepts ANY count >= 1 matching approved record, never exactly 1.
-- 'Ayobami Lawal' is the same reviewer identity every prior Mock
-- Mathematics independent-validation certification in this repository has
-- required (migrations 123, 124, 129, 130, 133, 136, 139) -- not invented
-- for this migration. The precondition is distinct from, and does not
-- accept, the UNASSIGNED pending_independent_review placeholder row
-- migration 141 inserted -- that row's own decision value
-- ('pending_independent_review') and reviewer value ('UNASSIGNED') never
-- satisfy this migration's decision='approved'/reviewer='Ayobami Lawal'
-- predicate.
--
-- DISCLOSED LIMITATION: this session had no live database read access (no
-- service-role key present in this repository, no MCP/DB tool connected).
-- This migration's readiness rests on the Founder's own direct production
-- evidence (the review-surface screenshot, per this session's own
-- directive treated as corroboration, not as substitute proof) plus the
-- migration's own fail-closed live precondition below, which will safely
-- refuse to write anything if that live evidence does not in fact exist
-- at apply time -- the same standing pattern migrations 129, 130, 133, 136
-- and 139 were each drafted under.
--
-- ============================================================
-- INDEPENDENT-VALIDATION BOUNDARY, NOT MOCK-ELIGIBILITY
-- ============================================================
-- This migration moves these 4 rows to 'independently_validated' ONLY. It
-- does NOT set eligibility_status = 'mock_eligible' anywhere, does NOT
-- insert, update, or delete any ali_family_review row, does NOT touch any
-- ali_mock_form row, does NOT touch any RPC, RLS policy, or grant, and
-- does NOT touch mock-mr06-linkedvalues, mock-mr10-bustimetable,
-- mock-mr13-craftstall, mock-mr09-funrun, mock-mr04-campingsale,
-- mock-mr06-numberpuzzle, or mock-mr03mr07-perimeterarea in any way. The
-- later decision about whether mock-mr11-roundingbounds enters the
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
-- ACCUMULATING RESERVE-EXCLUSION GUARD (disclosed design choice)
-- ============================================================
-- Migrations 130/133/136/139 each re-verify, both pre-write and
-- post-write, that the immediately preceding certification-chain
-- families remain untouched and independently_validated, accumulating one
-- further family with every new certification (130 checked bustimetable
-- only; 133 checked craftstall only; 136 checked funrun+craftstall; 139
-- checked campingsale+funrun+craftstall). This migration continues that
-- exact accumulating pattern one generation further: it fully
-- status-rechecks craftstall, funrun, campingsale, AND numberpuzzle (the
-- four most recent certification-chain members, migrations 130/133/136/
-- 139), while linkedvalues, bustimetable, and perimeterarea remain
-- pattern-only excluded from the target array (the same treatment they
-- have received in every migration since their own certification) --
-- never status-rechecked in this chain, a pre-existing convention this
-- migration does not alter or attempt to retrofit.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does not touch any existing row, family, or migration (088-141) other
-- than reading ali_question_bank/ali_family_review. Does not touch
-- mock_eligible, ali_mock_form, ali_family_review (write), any RPC, RLS
-- policy, or grant. Does not touch mock-mr06-linkedvalues,
-- mock-mr10-bustimetable, mock-mr13-craftstall, mock-mr09-funrun,
-- mock-mr04-campingsale, mock-mr06-numberpuzzle, or
-- mock-mr03mr07-perimeterarea. Does not touch English or Writing content,
-- Practice, or any other Mathematics family. Does not author new content.
-- Does not begin First Mock composition.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations 140 and
-- 141 (both Founder-confirmed applied) have already been applied.

begin;

do $$
declare
  v_target_ids constant text[] := array[
    'mock-mr11-roundingbounds-01', 'mock-mr11-roundingbounds-02', 'mock-mr11-roundingbounds-03', 'mock-mr11-roundingbounds-04'
  ];
  v_expected_stem constant text := 'At the Oakwood Athletics Meet, the number of adult spectators rounds to 380 to the nearest 10. The number of child spectators rounds to 240 to the nearest 10.';
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
    and family_id = 'mock-mr11-roundingbounds';

  select count(*) into v_already_validated_count
  from public.ali_question_bank
  where id = any(v_target_ids) and eligibility_status = 'independently_validated';

  -- Structural precondition audit -- every check below is evaluated
  -- regardless of which branch below actually runs, so a drift is caught
  -- even in the "already applied" case.
  select count(*) into v_subject_skill_count
    from public.ali_question_bank
    where id = any(v_target_ids) and subject = 'maths' and skill = 'QT-MR-11';
  if v_subject_skill_count <> 4 then
    raise exception 'Migration 142 refused: expected 4 rows with subject=maths, skill=QT-MR-11 (found %).', v_subject_skill_count;
  end if;

  select count(*) into v_marking_mode_count
    from public.ali_question_bank
    where id = any(v_target_ids) and marking_mode = 'deterministic';
  if v_marking_mode_count <> 4 then
    raise exception 'Migration 142 refused: expected 4 rows with marking_mode=deterministic (found %).', v_marking_mode_count;
  end if;

  select count(*) into v_grouping_count
    from public.ali_question_bank b
    join (values
      ('mock-mr11-roundingbounds-01', 1, '(a)'),
      ('mock-mr11-roundingbounds-02', 2, '(b)'),
      ('mock-mr11-roundingbounds-03', 3, '(c)'),
      ('mock-mr11-roundingbounds-04', 4, '(d)')
    ) as expected(id, expected_group_order, expected_subpart_label)
      on b.id = expected.id
    where b.question_group_id = 'mock-mr11-roundingbounds'
      and b.group_order = expected.expected_group_order
      and b.subpart_label = expected.expected_subpart_label;
  if v_grouping_count <> 4 then
    raise exception 'Migration 142 refused: exact grouping (question_group_id/group_order/subpart_label) does not match the expected 01=1/(a), 02=2/(b), 03=3/(c), 04=4/(d) shape (found % of 4 matching).', v_grouping_count;
  end if;

  select count(*) into v_difficulty_count
    from public.ali_question_bank b
    join (values
      ('mock-mr11-roundingbounds-01', 'easy'),
      ('mock-mr11-roundingbounds-02', 'easy'),
      ('mock-mr11-roundingbounds-03', 'medium'),
      ('mock-mr11-roundingbounds-04', 'hard')
    ) as expected(id, expected_difficulty)
      on b.id = expected.id
    where b.content_difficulty::text = expected.expected_difficulty;
  if v_difficulty_count <> 4 then
    raise exception 'Migration 142 refused: expected difficulty easy/easy/medium/hard across the 4 rows in order (found % of 4 matching).', v_difficulty_count;
  end if;

  select count(*) into v_marks_count
    from public.ali_question_bank
    where id = any(v_target_ids) and (prompt->>'marks')::numeric = 1;
  if v_marks_count <> 4 then
    raise exception 'Migration 142 refused: expected 4 rows with marks=1 each (found %). Marking Integrity Gate must never be assumed satisfied.', v_marks_count;
  end if;

  select count(*) into v_answers_count
    from public.ali_question_bank b
    join (values
      ('mock-mr11-roundingbounds-01', '384'),
      ('mock-mr11-roundingbounds-02', '235'),
      ('mock-mr11-roundingbounds-03', '628'),
      ('mock-mr11-roundingbounds-04', '131')
    ) as expected(id, expected_answer)
      on b.id = expected.id
    where (b.prompt->>'answer') = expected.expected_answer;
  if v_answers_count <> 4 then
    raise exception 'Migration 142 refused: expected answers 384/235/628/131 across the 4 rows in order (found % of 4 matching).', v_answers_count;
  end if;

  select count(*) into v_shared_stem_count
    from public.ali_question_bank
    where id = any(v_target_ids) and (prompt->>'sharedStem') = v_expected_stem;
  if v_shared_stem_count <> 4 then
    raise exception 'Migration 142 refused: expected all 4 rows to carry the identical, exact sharedStem value (found %).', v_shared_stem_count;
  end if;

  -- This family is deliberately text-only narrative content (no
  -- table/stimulus) -- confirm no row carries a stimulus key, rather than
  -- merely skipping any check.
  select count(*) into v_no_stimulus_count
    from public.ali_question_bank
    where id = any(v_target_ids) and prompt ? 'stimulus';
  if v_no_stimulus_count <> 0 then
    raise exception 'Migration 142 refused: mock-mr11-roundingbounds is text-only narrative content and must never carry a stimulus key (found % rows with one).', v_no_stimulus_count;
  end if;

  select count(*) into v_non_empty_question_count
    from public.ali_question_bank
    where id = any(v_target_ids) and coalesce(length(prompt->>'question'), 0) > 0;
  if v_non_empty_question_count <> 4 then
    raise exception 'Migration 142 refused: every target row must have non-empty question text (found % of 4).', v_non_empty_question_count;
  end if;

  -- Live review-evidence precondition: at least one genuine approved
  -- record must exist for this exact family, this exact review_type, this
  -- exact reviewer, carrying the INCREMENT006 marker. Unanchored LIKE, per
  -- the Decision 182 lesson, accepting any count >= 1. This is distinct
  -- from, and does not accept, migration 141's own UNASSIGNED
  -- pending_independent_review placeholder row.
  select count(*) into v_approved_review_count
    from public.ali_family_review
    where family_id = 'mock-mr11-roundingbounds'
      and decision = 'approved'
      and review_type = 'mock_maths_independent_review'
      and reviewer = 'Ayobami Lawal'
      and notes like '%MOCK-STRUCTURAL-CAPACITY-INCREMENT006%';
  if v_approved_review_count < 1 then
    raise exception 'Migration 142 refused: no matching approved ali_family_review record found for mock-mr11-roundingbounds under the MOCK-STRUCTURAL-CAPACITY-INCREMENT006 marker. Certification requires real, live review evidence, not merely a header, screenshot, or Decision-log claim.';
  end if;

  select count(*) into v_active_count
    from public.ali_question_bank
    where id = any(v_target_ids) and active = true;
  if v_active_count <> 4 then
    raise exception 'Migration 142 refused: expected 4 active=true rows (found %).', v_active_count;
  end if;

  -- Exclusion guard: mock-mr06-linkedvalues, mock-mr10-bustimetable,
  -- mock-mr13-craftstall, mock-mr09-funrun, mock-mr04-campingsale,
  -- mock-mr06-numberpuzzle and mock-mr03mr07-perimeterarea must never
  -- appear in the target array, by construction.
  if exists (
    select 1 from unnest(v_target_ids) t
    where t like 'mock-mr06-linkedvalues%' or t like 'mock-mr10-bustimetable%'
       or t like 'mock-mr13-craftstall%' or t like 'mock-mr09-funrun%'
       or t like 'mock-mr04-campingsale%' or t like 'mock-mr06-numberpuzzle%'
       or t like 'mock-mr03mr07-perimeterarea%'
  ) then
    raise exception 'Migration 142 refused: mock-mr06-linkedvalues, mock-mr10-bustimetable, mock-mr13-craftstall, mock-mr09-funrun, mock-mr04-campingsale, mock-mr06-numberpuzzle and mock-mr03mr07-perimeterarea must never appear in the target array.';
  end if;

  select count(*) into v_excluded_still_untouched_count
    from public.ali_question_bank
    where id like 'mock-mr13-craftstall%' and eligibility_status = 'independently_validated';
  if v_excluded_still_untouched_count <> 3 then
    raise exception 'Migration 142 refused: expected mock-mr13-craftstall''s 3 rows to remain independently_validated (their migration 130 state), untouched by this migration (found %). Re-verify production state before proceeding.', v_excluded_still_untouched_count;
  end if;

  select count(*) into v_excluded_still_untouched_count
    from public.ali_question_bank
    where id like 'mock-mr09-funrun%' and eligibility_status = 'independently_validated';
  if v_excluded_still_untouched_count <> 4 then
    raise exception 'Migration 142 refused: expected mock-mr09-funrun''s 4 rows to remain independently_validated (their migration 133 state), untouched by this migration (found %). Re-verify production state before proceeding.', v_excluded_still_untouched_count;
  end if;

  select count(*) into v_excluded_still_untouched_count
    from public.ali_question_bank
    where id like 'mock-mr04-campingsale%' and eligibility_status = 'independently_validated';
  if v_excluded_still_untouched_count <> 4 then
    raise exception 'Migration 142 refused: expected mock-mr04-campingsale''s 4 rows to remain independently_validated (their migration 136 state), untouched by this migration (found %). Re-verify production state before proceeding.', v_excluded_still_untouched_count;
  end if;

  select count(*) into v_excluded_still_untouched_count
    from public.ali_question_bank
    where id like 'mock-mr06-numberpuzzle%' and eligibility_status = 'independently_validated';
  if v_excluded_still_untouched_count <> 3 then
    raise exception 'Migration 142 refused: expected mock-mr06-numberpuzzle''s 3 rows to remain independently_validated (their migration 139 state), untouched by this migration (found %). Re-verify production state before proceeding.', v_excluded_still_untouched_count;
  end if;

  if v_pending_count = 4 then
    create temporary table tmp_roundingbounds_prompt_snapshot (id text primary key, prompt_snapshot jsonb not null) on commit drop;
    insert into tmp_roundingbounds_prompt_snapshot (id, prompt_snapshot)
      select id, prompt from public.ali_question_bank where id = any(v_target_ids);

    update public.ali_question_bank
    set eligibility_status = 'independently_validated'
    where id = any(v_target_ids)
      and eligibility_status = 'authentic_assessment_candidate';

    select count(*) into v_post_write_count
      from public.ali_question_bank
      where id = any(v_target_ids) and eligibility_status = 'independently_validated';
    if v_post_write_count <> 4 then
      raise exception 'Migration 142 post-write verification failed: expected 4 rows now independently_validated, found %. Rolling back.', v_post_write_count;
    end if;

    select count(*) into v_post_write_preserved_count
      from public.ali_question_bank b
      join tmp_roundingbounds_prompt_snapshot s on b.id = s.id
      where b.prompt = s.prompt_snapshot;
    if v_post_write_preserved_count <> 4 then
      raise exception 'Migration 142 post-write preservation check failed: % of 4 rows have their prompt byte-for-byte unchanged (expected 4). Rolling back.', v_post_write_preserved_count;
    end if;

    select count(*) into v_post_write_count
      from public.ali_question_bank
      where id = any(v_target_ids) and eligibility_status = 'mock_eligible';
    if v_post_write_count <> 0 then
      raise exception 'Migration 142 refused: mock_eligible must never be set by this migration (found % rows). Rolling back.', v_post_write_count;
    end if;

    select count(*) into v_post_write_count
      from public.ali_question_bank
      where id like 'mock-mr13-craftstall%' and eligibility_status <> 'independently_validated';
    if v_post_write_count <> 0 then
      raise exception 'Migration 142 refused: mock-mr13-craftstall must remain untouched (found % rows with a changed eligibility_status). Rolling back.', v_post_write_count;
    end if;

    select count(*) into v_post_write_count
      from public.ali_question_bank
      where id like 'mock-mr09-funrun%' and eligibility_status <> 'independently_validated';
    if v_post_write_count <> 0 then
      raise exception 'Migration 142 refused: mock-mr09-funrun must remain untouched (found % rows with a changed eligibility_status). Rolling back.', v_post_write_count;
    end if;

    select count(*) into v_post_write_count
      from public.ali_question_bank
      where id like 'mock-mr04-campingsale%' and eligibility_status <> 'independently_validated';
    if v_post_write_count <> 0 then
      raise exception 'Migration 142 refused: mock-mr04-campingsale must remain untouched (found % rows with a changed eligibility_status). Rolling back.', v_post_write_count;
    end if;

    select count(*) into v_post_write_count
      from public.ali_question_bank
      where id like 'mock-mr06-numberpuzzle%' and eligibility_status <> 'independently_validated';
    if v_post_write_count <> 0 then
      raise exception 'Migration 142 refused: mock-mr06-numberpuzzle must remain untouched (found % rows with a changed eligibility_status). Rolling back.', v_post_write_count;
    end if;

    raise notice 'Migration 142: promoted 4 rows of mock-mr11-roundingbounds (1 numbered experience, 4 marks) from authentic_assessment_candidate to independently_validated. NOT mock_eligible. Every prompt key proven byte-for-byte unchanged. mock-mr06-linkedvalues, mock-mr10-bustimetable, mock-mr13-craftstall, mock-mr09-funrun, mock-mr04-campingsale, mock-mr06-numberpuzzle and mock-mr03mr07-perimeterarea untouched.';

  elsif v_already_validated_count = 4 then
    raise notice 'Migration 142: all 4 target questions are already independently_validated -- already applied. No changes made.';

    select count(*) into v_post_write_count
      from public.ali_question_bank
      where id = any(v_target_ids) and eligibility_status = 'mock_eligible';
    if v_post_write_count <> 0 then
      raise exception 'Migration 142 refused: mock_eligible found set on % rows in the already-applied branch -- something else changed this family''s eligibility. Manual investigation required.', v_post_write_count;
    end if;

  else
    raise exception
      'Migration 142 refused: expected 4 authentic_assessment_candidate rows for mock-mr11-roundingbounds (found %), or 4 already independently_validated (found %). Re-verify production state before proceeding.',
      v_pending_count, v_already_validated_count;
  end if;
end $$;

commit;
