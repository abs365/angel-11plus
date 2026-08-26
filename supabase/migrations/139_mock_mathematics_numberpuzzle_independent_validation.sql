-- Angel Digital 11+ — Migration 139
-- Mathematics Structural Capacity, Authoring Increment 005 — Number Puzzle
-- Independent Validation (Decision 198/199/200/201/202).
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS
-- ============================================================
-- Migrations 137 (content) and 138 (pending-review placeholder) are
-- Founder-confirmed applied to production. Migration 137 itself is the
-- REMEDIATED three-row family (Decision 200/201): the originally-authored
-- fourth row, mock-mr06-numberpuzzle-04, required forming and solving a
-- quadratic equation by factorisation and rejecting a negative root, and
-- Decision 200's educational evidence audit found this had NO
-- primary-source support whatsoever. It was removed before either
-- migration was ever applied — there is no data-integrity concern, only a
-- content-authoring correction made prior to production application. The
-- Founder has since completed a direct production visual/educational
-- review of the REMEDIATED three-row family (shared abstract number-puzzle
-- scenario, all three subparts, answers, one-mark-per-subpart structure,
-- difficulty progression, wording/11+ suitability, originality,
-- anti-memorisation, structural alignment, learner-facing presentation)
-- and approved it. This migration promotes exactly the 3 surviving rows of
-- mock-mr06-numberpuzzle from eligibility_status
-- 'authentic_assessment_candidate' to 'independently_validated' --
-- mirroring migrations 123/129/130/133/136's own established
-- independent-validation-promotion pattern exactly.
--
-- ============================================================
-- CONTENT RE-AUDIT (re-read directly from migration 137's own source this
-- session, not merely trusted from prior conversational reports)
-- ============================================================
-- subject=maths, skill=QT-MR-06, family_id=mock-mr06-numberpuzzle,
-- active=true, marking_mode=deterministic, marks=1 each, question_group_id
-- =mock-mr06-numberpuzzle, group_order 1/2/3, subpart_label (a)/(b)/(c),
-- content_difficulty medium/medium/hard, identical sharedStem ("A number
-- puzzle uses a hidden positive whole number, n. Three other values are
-- defined by these rules: P = n + 9, Q = 9 x n, and R = n x n.") across
-- all 3 rows. EXACTLY THREE ROWS -- migration 137's own header and body
-- confirmed directly this session: no fourth row (mock-mr06-numberpuzzle-04)
-- exists anywhere in the migration, no quadratic-equation content, no
-- multiple-root or negative-root-rejection reasoning survives anywhere in
-- the stored family.
--
-- All three answers independently re-derived again this session, by two
-- methods each, from the real stored question text and rules P=n+9,
-- Q=9xn, R=nxn: (a) 9P-Q -- symbolic: 9(n+9)-9n = 9n+81-9n = 81; numeric
-- check n=4: P=13,Q=36, 9x13-36=117-36=81; numeric check n=10: P=19,Q=90,
-- 9x19-90=171-90=81 -- both agree 81. (b) Q/(P-9) -- symbolic:
-- 9n/((n+9)-9) = 9n/n = 9; numeric check n=4: 36/(13-9)=36/4=9; numeric
-- check n=10: 90/(19-9)=90/10=9 -- both agree 9. (c) (Pxn)-Q-R -- symbolic:
-- (n+9)xn - 9n - nxn = n^2+9n-9n-n^2 = 0; numeric check n=4:
-- (13x4)-36-16=52-36-16=0; numeric check n=10: (19x10)-90-100=190-90-100=0
-- -- both agree 0. Every subpart is fully self-contained (P, Q and, where
-- needed, R's defining rules are restated via the shared stem in every
-- row) -- no subpart's marking depends on a learner's own answer to a
-- prior subpart, and n's own numeric value is never required at all for
-- any of the three subparts (it always cancels algebraically).
--
-- ============================================================
-- REVIEW EVIDENCE
-- ============================================================
-- This migration's own precondition block queries ali_family_review LIVE
-- and requires at least one matching approved row (family_id=
-- 'mock-mr06-numberpuzzle', decision='approved',
-- review_type='mock_maths_independent_review', reviewer='Ayobami Lawal',
-- notes carrying the MOCK-STRUCTURAL-CAPACITY-INCREMENT005 marker -- the
-- same marker migration 138 registered the pending-review placeholder
-- under) to exist before writing anything. Decision 182's own lesson is
-- applied directly: the marker predicate uses `notes LIKE '%MARKER%'`
-- (unanchored, substring-anywhere), never `notes LIKE 'MARKER%'`
-- (anchored to the start) -- every real, UI-submitted review's stored
-- notes value is prefixed with reviewer-qualification text before the
-- marker ever appears. The precondition accepts ANY count >= 1 matching
-- approved record, never exactly 1. 'Ayobami Lawal' is the same reviewer
-- identity every prior Mock Mathematics independent-validation
-- certification in this repository has required (migrations 123, 124,
-- 129, 130, 133, 136) -- not invented for this migration. The precondition
-- is distinct from, and does not accept, the UNASSIGNED
-- pending_independent_review placeholder row migration 138 inserted --
-- that row's own decision value ('pending_independent_review') and
-- reviewer value ('UNASSIGNED') never satisfy this migration's decision=
-- 'approved'/reviewer='Ayobami Lawal' predicate.
--
-- DISCLOSED LIMITATION: this session had no live database read access (no
-- service-role key present in this repository, no MCP/DB tool connected).
-- This migration's readiness rests on the Founder's own direct assertion
-- of production review approval (this session's own directive) plus the
-- migration's own fail-closed live precondition below, which will safely
-- refuse to write anything if that live evidence does not in fact exist
-- at apply time -- the same standing pattern migrations 129, 130, 133 and
-- 136 were each drafted under.
--
-- ============================================================
-- INDEPENDENT-VALIDATION BOUNDARY, NOT MOCK-ELIGIBILITY
-- ============================================================
-- This migration moves these 3 rows to 'independently_validated' ONLY. It
-- does NOT set eligibility_status = 'mock_eligible' anywhere, does NOT
-- insert, update, or delete any ali_family_review row, does NOT touch any
-- ali_mock_form row, does NOT touch any RPC, RLS policy, or grant, and
-- does NOT touch mock-mr06-linkedvalues, mock-mr04-campingsale,
-- mock-mr09-funrun, mock-mr13-craftstall, mock-mr10-bustimetable, or
-- mock-mr03mr07-perimeterarea in any way. The later decision about whether
-- mock-mr06-numberpuzzle enters the mock_eligible pool remains a separate,
-- future, Founder-authorised composition/governance step -- not begun, not
-- implied, by this migration.
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
-- RPC, RLS policy, or grant. Does not touch mock-mr06-linkedvalues,
-- mock-mr04-campingsale, mock-mr09-funrun, mock-mr13-craftstall,
-- mock-mr10-bustimetable, or mock-mr03mr07-perimeterarea. Does not touch
-- English or Writing content, Practice, or any other Mathematics family.
-- Does not author new content. Does not begin First Mock composition. Does
-- not target, reference, or reintroduce the removed fourth row
-- (mock-mr06-numberpuzzle-04) anywhere.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations 137 and
-- 138 (both Founder-confirmed applied) have already been applied.

begin;

do $$
declare
  v_target_ids constant text[] := array[
    'mock-mr06-numberpuzzle-01', 'mock-mr06-numberpuzzle-02', 'mock-mr06-numberpuzzle-03'
  ];
  v_expected_stem constant text := 'A number puzzle uses a hidden positive whole number, n. Three other values are defined by these rules: P = n + 9, Q = 9 x n, and R = n x n.';
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
  v_fourth_row_absent_count int;
  v_post_write_count int;
  v_post_write_preserved_count int;
begin
  select count(*) into v_pending_count
  from public.ali_question_bank
  where id = any(v_target_ids)
    and eligibility_status = 'authentic_assessment_candidate'
    and active = true
    and family_id = 'mock-mr06-numberpuzzle';

  select count(*) into v_already_validated_count
  from public.ali_question_bank
  where id = any(v_target_ids) and eligibility_status = 'independently_validated';

  -- Remediation-boundary guard: the removed fourth row must never exist in
  -- production under this family, in any eligibility state.
  select count(*) into v_fourth_row_absent_count
    from public.ali_question_bank
    where id = 'mock-mr06-numberpuzzle-04';
  if v_fourth_row_absent_count <> 0 then
    raise exception 'Migration 139 refused: mock-mr06-numberpuzzle-04 was removed per Decision 200/201''s educational evidence audit and must not exist in production (found %).', v_fourth_row_absent_count;
  end if;

  -- Structural precondition audit -- every check below is evaluated
  -- regardless of which branch below actually runs, so a drift is caught
  -- even in the "already applied" case.
  select count(*) into v_subject_skill_count
    from public.ali_question_bank
    where id = any(v_target_ids) and subject = 'maths' and skill = 'QT-MR-06';
  if v_subject_skill_count <> 3 then
    raise exception 'Migration 139 refused: expected 3 rows with subject=maths, skill=QT-MR-06 (found %).', v_subject_skill_count;
  end if;

  select count(*) into v_marking_mode_count
    from public.ali_question_bank
    where id = any(v_target_ids) and marking_mode = 'deterministic';
  if v_marking_mode_count <> 3 then
    raise exception 'Migration 139 refused: expected 3 rows with marking_mode=deterministic (found %).', v_marking_mode_count;
  end if;

  select count(*) into v_grouping_count
    from public.ali_question_bank b
    join (values
      ('mock-mr06-numberpuzzle-01', 1, '(a)'),
      ('mock-mr06-numberpuzzle-02', 2, '(b)'),
      ('mock-mr06-numberpuzzle-03', 3, '(c)')
    ) as expected(id, expected_group_order, expected_subpart_label)
      on b.id = expected.id
    where b.question_group_id = 'mock-mr06-numberpuzzle'
      and b.group_order = expected.expected_group_order
      and b.subpart_label = expected.expected_subpart_label;
  if v_grouping_count <> 3 then
    raise exception 'Migration 139 refused: exact grouping (question_group_id/group_order/subpart_label) does not match the expected 01=1/(a), 02=2/(b), 03=3/(c) shape (found % of 3 matching).', v_grouping_count;
  end if;

  select count(*) into v_difficulty_count
    from public.ali_question_bank b
    join (values
      ('mock-mr06-numberpuzzle-01', 'medium'),
      ('mock-mr06-numberpuzzle-02', 'medium'),
      ('mock-mr06-numberpuzzle-03', 'hard')
    ) as expected(id, expected_difficulty)
      on b.id = expected.id
    where b.content_difficulty::text = expected.expected_difficulty;
  if v_difficulty_count <> 3 then
    raise exception 'Migration 139 refused: expected difficulty medium/medium/hard across the 3 rows in order (found % of 3 matching).', v_difficulty_count;
  end if;

  select count(*) into v_marks_count
    from public.ali_question_bank
    where id = any(v_target_ids) and (prompt->>'marks')::numeric = 1;
  if v_marks_count <> 3 then
    raise exception 'Migration 139 refused: expected 3 rows with marks=1 each (found %). Marking Integrity Gate must never be assumed satisfied.', v_marks_count;
  end if;

  select count(*) into v_answers_count
    from public.ali_question_bank b
    join (values
      ('mock-mr06-numberpuzzle-01', '81'),
      ('mock-mr06-numberpuzzle-02', '9'),
      ('mock-mr06-numberpuzzle-03', '0')
    ) as expected(id, expected_answer)
      on b.id = expected.id
    where (b.prompt->>'answer') = expected.expected_answer;
  if v_answers_count <> 3 then
    raise exception 'Migration 139 refused: expected answers 81/9/0 across the 3 rows in order (found % of 3 matching).', v_answers_count;
  end if;

  select count(*) into v_shared_stem_count
    from public.ali_question_bank
    where id = any(v_target_ids) and (prompt->>'sharedStem') = v_expected_stem;
  if v_shared_stem_count <> 3 then
    raise exception 'Migration 139 refused: expected all 3 rows to carry the identical, exact sharedStem value (found %).', v_shared_stem_count;
  end if;

  -- This family is deliberately text-only abstract number-puzzle content
  -- (no table/stimulus) -- confirm no row carries a stimulus key, rather
  -- than merely skipping any check.
  select count(*) into v_no_stimulus_count
    from public.ali_question_bank
    where id = any(v_target_ids) and prompt ? 'stimulus';
  if v_no_stimulus_count <> 0 then
    raise exception 'Migration 139 refused: mock-mr06-numberpuzzle is text-only abstract content and must never carry a stimulus key (found % rows with one).', v_no_stimulus_count;
  end if;

  select count(*) into v_non_empty_question_count
    from public.ali_question_bank
    where id = any(v_target_ids) and coalesce(length(prompt->>'question'), 0) > 0;
  if v_non_empty_question_count <> 3 then
    raise exception 'Migration 139 refused: every target row must have non-empty question text (found % of 3).', v_non_empty_question_count;
  end if;

  -- Live review-evidence precondition: at least one genuine approved
  -- record must exist for this exact family, this exact review_type, this
  -- exact reviewer, carrying the INCREMENT005 marker. Unanchored LIKE, per
  -- the Decision 182 lesson, accepting any count >= 1. This is distinct
  -- from, and does not accept, migration 138's own UNASSIGNED
  -- pending_independent_review placeholder row.
  select count(*) into v_approved_review_count
    from public.ali_family_review
    where family_id = 'mock-mr06-numberpuzzle'
      and decision = 'approved'
      and review_type = 'mock_maths_independent_review'
      and reviewer = 'Ayobami Lawal'
      and notes like '%MOCK-STRUCTURAL-CAPACITY-INCREMENT005%';
  if v_approved_review_count < 1 then
    raise exception 'Migration 139 refused: no matching approved ali_family_review record found for mock-mr06-numberpuzzle under the MOCK-STRUCTURAL-CAPACITY-INCREMENT005 marker. Certification requires real, live review evidence, not merely a header or Decision-log claim.';
  end if;

  select count(*) into v_active_count
    from public.ali_question_bank
    where id = any(v_target_ids) and active = true;
  if v_active_count <> 3 then
    raise exception 'Migration 139 refused: expected 3 active=true rows (found %).', v_active_count;
  end if;

  -- Exclusion guard: mock-mr06-linkedvalues, mock-mr04-campingsale,
  -- mock-mr09-funrun, mock-mr13-craftstall, mock-mr10-bustimetable and
  -- mock-mr03mr07-perimeterarea must never appear in the target array, by
  -- construction.
  if exists (
    select 1 from unnest(v_target_ids) t
    where t like 'mock-mr06-linkedvalues%' or t like 'mock-mr04-campingsale%'
       or t like 'mock-mr09-funrun%' or t like 'mock-mr13-craftstall%'
       or t like 'mock-mr10-bustimetable%' or t like 'mock-mr03mr07-perimeterarea%'
  ) then
    raise exception 'Migration 139 refused: mock-mr06-linkedvalues, mock-mr04-campingsale, mock-mr09-funrun, mock-mr13-craftstall, mock-mr10-bustimetable and mock-mr03mr07-perimeterarea must never appear in the target array.';
  end if;

  select count(*) into v_excluded_still_untouched_count
    from public.ali_question_bank
    where id like 'mock-mr04-campingsale%' and eligibility_status = 'independently_validated';
  if v_excluded_still_untouched_count <> 4 then
    raise exception 'Migration 139 refused: expected mock-mr04-campingsale''s 4 rows to remain independently_validated (their migration 136 state), untouched by this migration (found %). Re-verify production state before proceeding.', v_excluded_still_untouched_count;
  end if;

  select count(*) into v_excluded_still_untouched_count
    from public.ali_question_bank
    where id like 'mock-mr09-funrun%' and eligibility_status = 'independently_validated';
  if v_excluded_still_untouched_count <> 4 then
    raise exception 'Migration 139 refused: expected mock-mr09-funrun''s 4 rows to remain independently_validated (their migration 133 state), untouched by this migration (found %). Re-verify production state before proceeding.', v_excluded_still_untouched_count;
  end if;

  select count(*) into v_excluded_still_untouched_count
    from public.ali_question_bank
    where id like 'mock-mr13-craftstall%' and eligibility_status = 'independently_validated';
  if v_excluded_still_untouched_count <> 3 then
    raise exception 'Migration 139 refused: expected mock-mr13-craftstall''s 3 rows to remain independently_validated (their migration 130 state), untouched by this migration (found %). Re-verify production state before proceeding.', v_excluded_still_untouched_count;
  end if;

  if v_pending_count = 3 then
    create temporary table tmp_numberpuzzle_prompt_snapshot (id text primary key, prompt_snapshot jsonb not null) on commit drop;
    insert into tmp_numberpuzzle_prompt_snapshot (id, prompt_snapshot)
      select id, prompt from public.ali_question_bank where id = any(v_target_ids);

    update public.ali_question_bank
    set eligibility_status = 'independently_validated'
    where id = any(v_target_ids)
      and eligibility_status = 'authentic_assessment_candidate';

    select count(*) into v_post_write_count
      from public.ali_question_bank
      where id = any(v_target_ids) and eligibility_status = 'independently_validated';
    if v_post_write_count <> 3 then
      raise exception 'Migration 139 post-write verification failed: expected 3 rows now independently_validated, found %. Rolling back.', v_post_write_count;
    end if;

    select count(*) into v_post_write_preserved_count
      from public.ali_question_bank b
      join tmp_numberpuzzle_prompt_snapshot s on b.id = s.id
      where b.prompt = s.prompt_snapshot;
    if v_post_write_preserved_count <> 3 then
      raise exception 'Migration 139 post-write preservation check failed: % of 3 rows have their prompt byte-for-byte unchanged (expected 3). Rolling back.', v_post_write_preserved_count;
    end if;

    select count(*) into v_post_write_count
      from public.ali_question_bank
      where id = any(v_target_ids) and eligibility_status = 'mock_eligible';
    if v_post_write_count <> 0 then
      raise exception 'Migration 139 refused: mock_eligible must never be set by this migration (found % rows). Rolling back.', v_post_write_count;
    end if;

    select count(*) into v_post_write_count
      from public.ali_question_bank
      where id like 'mock-mr04-campingsale%' and eligibility_status <> 'independently_validated';
    if v_post_write_count <> 0 then
      raise exception 'Migration 139 refused: mock-mr04-campingsale must remain untouched (found % rows with a changed eligibility_status). Rolling back.', v_post_write_count;
    end if;

    select count(*) into v_post_write_count
      from public.ali_question_bank
      where id like 'mock-mr09-funrun%' and eligibility_status <> 'independently_validated';
    if v_post_write_count <> 0 then
      raise exception 'Migration 139 refused: mock-mr09-funrun must remain untouched (found % rows with a changed eligibility_status). Rolling back.', v_post_write_count;
    end if;

    select count(*) into v_post_write_count
      from public.ali_question_bank
      where id like 'mock-mr13-craftstall%' and eligibility_status <> 'independently_validated';
    if v_post_write_count <> 0 then
      raise exception 'Migration 139 refused: mock-mr13-craftstall must remain untouched (found % rows with a changed eligibility_status). Rolling back.', v_post_write_count;
    end if;

    raise notice 'Migration 139: promoted 3 rows of mock-mr06-numberpuzzle (1 numbered experience, 3 marks) from authentic_assessment_candidate to independently_validated. NOT mock_eligible. Every prompt key proven byte-for-byte unchanged. mock-mr06-linkedvalues, mock-mr04-campingsale, mock-mr09-funrun, mock-mr13-craftstall, mock-mr10-bustimetable and mock-mr03mr07-perimeterarea untouched.';

  elsif v_already_validated_count = 3 then
    raise notice 'Migration 139: all 3 target questions are already independently_validated -- already applied. No changes made.';

    select count(*) into v_post_write_count
      from public.ali_question_bank
      where id = any(v_target_ids) and eligibility_status = 'mock_eligible';
    if v_post_write_count <> 0 then
      raise exception 'Migration 139 refused: mock_eligible found set on % rows in the already-applied branch -- something else changed this family''s eligibility. Manual investigation required.', v_post_write_count;
    end if;

  else
    raise exception
      'Migration 139 refused: expected 3 authentic_assessment_candidate rows for mock-mr06-numberpuzzle (found %), or 3 already independently_validated (found %). Re-verify production state before proceeding.',
      v_pending_count, v_already_validated_count;
  end if;
end $$;

commit;
