-- Angel Digital 11+ — Migration 182
-- Mathematics Structural Capacity, Increments 007-009 — Independent
-- Validation (Protected Future Mock Reserve, NOT Practice, NOT
-- Mock-eligible).
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS
-- ============================================================
-- Migrations 170/174/176 (content) and 171/175/177 (pending-review
-- placeholders) are Founder-confirmed applied to production. The Founder
-- has since completed a direct production Educational Review of all 6
-- families through `/admin-beta/review`'s MathIncrement007to009Section
-- and recorded `approved` for every one (Review Closure Report, this
-- session — cross-checked directly against persisted `ali_family_review`
-- rows via a dedicated read-only verification query, not accepted from
-- the UI summary alone: 19/19 targets confirmed Approved, 6 of them
-- Mathematics). This migration promotes exactly these 13 rows across 6
-- families from `authentic_assessment_candidate` to
-- `independently_validated` — mirroring migrations 123/129/130/133/136/
-- 139/142's own established independent-validation-promotion pattern
-- exactly, including its live fail-closed review-evidence precondition.
--
-- Founder destination decision (this session, explicit): PROTECTED
-- FUTURE MOCK RESERVE. Not Practice under any circumstance. Not
-- `mock_eligible` — that remains a separate, later, Mock-2-composition
-- decision, not begun here. With this migration (if applied), the
-- Mathematics Mock-track reserve becomes 21 (Decision 226's existing
-- reserve) + 13 (these rows) = 34 marks, still 22 marks short of
-- Decision 226's own 56-mark Mock-2 floor — disclosed here, not
-- resolved.
--
-- ============================================================
-- REVIEWER-NAME DISCLOSURE (Founder-instructed, not a defect fix)
-- ============================================================
-- The Founder's own live-database cross-check found one reviewer-name
-- spelling variance: `mock-mr05-numberpyramid`'s approved row carries
-- reviewer "Ayobami Lawa" (missing the final "l"), where the other 5
-- families' approved rows carry "Ayobami Lawal". The Founder's explicit
-- instruction: do not modify historical review rows; treat this as a
-- minor administrative inconsistency, not a different or invalid
-- reviewer — the exact precedent Decision 73 already established for an
-- earlier "Ayobami Lawl" variant. This migration's own live precondition
-- below therefore accepts BOTH spellings, exclusively for
-- mock-mr05-numberpyramid, and ONLY the canonical "Ayobami Lawal" for
-- the other 5 families (i.e. this accommodation is not a blanket
-- reviewer-name relaxation).
--
-- ============================================================
-- SCOPE: EXACTLY 13 ROWS ACROSS 6 FAMILIES, ONE COLUMN
-- ============================================================
--   mock-mr11-impossibletotal-01/02/03 (marker INCREMENT007)
--   mock-mr05-numberpyramid-01/02/03 (marker INCREMENT008)
--   mock-mr13-toppingcombos-01/02 (marker INCREMENT008)
--   mock-mr06-agenarrative-01/02/03 (marker INCREMENT008)
--   mock-mr12-weightedmean-01 (family mock-mr12-weightedmeancombine, marker INCREMENT009)
--   mock-mr12-weightedmean-02 (family mock-mr12-weightedmeanreverse, marker INCREMENT009)
-- Only `eligibility_status` is ever SET. `prompt`, `family_id`, `active`,
-- `content_version`, `question_group_id`/`group_order`/`subpart_label`
-- where present, and `marking_mode` are all re-verified UNCHANGED via a
-- full pre-write snapshot compared byte-for-byte post-write.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does NOT set eligibility_status to 'mock_eligible' anywhere. Does NOT
-- insert, update, or delete any ali_family_review row. Does NOT touch
-- any ali_mock_form row — no Mock 2 form is created or implied. Does NOT
-- touch any of the 77 existing mock_eligible rows or the 4 pre-existing
-- independently_validated rows (Mock 1's own frozen manifest and
-- reserve, Decision 226). Does NOT touch English or Writing content in
-- any way. Does NOT compose Mock 2. Does NOT claim Mock 2 readiness —
-- the 22-mark shortfall against the 56-mark floor, the zero challenge-
-- tier gap, and the still-unbuilt retirement-tracking mechanism
-- (Decision 222 Part 8) all remain open, disclosed, unresolved by this
-- migration.
--
-- ============================================================
-- FAIL-CLOSED THREE-STATE STRUCTURE (mirroring migration 142)
-- ============================================================
-- PRISTINE (all 13 rows `authentic_assessment_candidate`, `active=true`,
-- correct family_id per row) -> requires >=1 matching APPROVED
-- ali_family_review row per family (live evidence, not a header or
-- Decision-log claim) before writing anything -> promotes all 13
-- atomically -> positively re-verifies: 13 now `independently_validated`;
-- byte-for-byte `prompt` preservation across all 13; zero rows at
-- `mock_eligible`; Mock 1's own 77 mock_eligible rows and 4 pre-existing
-- independently_validated rows (Perimeter Area) independently
-- re-confirmed untouched.
-- ALREADY-APPLIED (all 13 already `independently_validated`) -> safe
-- no-op, re-verifies Mock 1's own rows remain untouched and zero of the
-- 13 are `mock_eligible`.
-- MIXED/UNEXPECTED -> `RAISE EXCEPTION` naming the actual state
-- observed, nothing written.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations 170/171,
-- 174/175, 176/177 (all Founder-confirmed applied) have already been
-- applied.

begin;

do $$
declare
  v_target_ids constant text[] := array[
    'mock-mr11-impossibletotal-01','mock-mr11-impossibletotal-02','mock-mr11-impossibletotal-03',
    'mock-mr05-numberpyramid-01','mock-mr05-numberpyramid-02','mock-mr05-numberpyramid-03',
    'mock-mr13-toppingcombos-01','mock-mr13-toppingcombos-02',
    'mock-mr06-agenarrative-01','mock-mr06-agenarrative-02','mock-mr06-agenarrative-03',
    'mock-mr12-weightedmean-01','mock-mr12-weightedmean-02'
  ];
  v_total_count int;
  v_active_count int;
  v_pending_count int;
  v_already_validated_count int;
  v_approved_family_count int;
  v_pre_existing_mock_eligible_count int;
  v_pre_existing_reserve_count int;
  v_post_validated_count int;
  v_post_preserved_count int;
  v_post_mock_eligible_count int;
begin
  -- === Live preconditions -- structural shape ===
  select count(*) into v_total_count from public.ali_question_bank where id = any(v_target_ids);
  if v_total_count <> 13 then
    raise exception 'Migration 182 refused: expected exactly 13 target rows to exist, found %.', v_total_count;
  end if;

  select count(*) into v_active_count from public.ali_question_bank where id = any(v_target_ids) and active = true;
  if v_active_count <> 13 then
    raise exception 'Migration 182 refused: expected 13 active=true rows, found %.', v_active_count;
  end if;

  -- Correct family_id per row, by construction.
  if (select count(*) from public.ali_question_bank b join (values
        ('mock-mr11-impossibletotal-01','mock-mr11-impossibletotal'),('mock-mr11-impossibletotal-02','mock-mr11-impossibletotal'),('mock-mr11-impossibletotal-03','mock-mr11-impossibletotal'),
        ('mock-mr05-numberpyramid-01','mock-mr05-numberpyramid'),('mock-mr05-numberpyramid-02','mock-mr05-numberpyramid'),('mock-mr05-numberpyramid-03','mock-mr05-numberpyramid'),
        ('mock-mr13-toppingcombos-01','mock-mr13-toppingcombos'),('mock-mr13-toppingcombos-02','mock-mr13-toppingcombos'),
        ('mock-mr06-agenarrative-01','mock-mr06-agenarrative'),('mock-mr06-agenarrative-02','mock-mr06-agenarrative'),('mock-mr06-agenarrative-03','mock-mr06-agenarrative'),
        ('mock-mr12-weightedmean-01','mock-mr12-weightedmeancombine'),('mock-mr12-weightedmean-02','mock-mr12-weightedmeanreverse')
      ) as expected(id, expected_family_id) on b.id = expected.id
      where b.family_id = expected.expected_family_id) <> 13 then
    raise exception 'Migration 182 refused: one or more rows do not carry their expected family_id.';
  end if;

  -- Live review-evidence precondition, per family, unanchored LIKE
  -- (matching the Decision 182-era lesson applied in migration 142):
  -- at least one APPROVED row per family under its own marker. The
  -- reviewer-name accommodation applies ONLY to mock-mr05-numberpyramid.
  select count(*) into v_approved_family_count from (
    select 1 where exists (select 1 from public.ali_family_review
      where family_id = 'mock-mr11-impossibletotal' and decision = 'approved'
        and review_type = 'mock_maths_independent_review' and reviewer = 'Ayobami Lawal'
        and notes like '%MOCK-STRUCTURAL-CAPACITY-INCREMENT007%')
    union all
    select 1 where exists (select 1 from public.ali_family_review
      where family_id = 'mock-mr05-numberpyramid' and decision = 'approved'
        and review_type = 'mock_maths_independent_review' and reviewer in ('Ayobami Lawal','Ayobami Lawa')
        and notes like '%MOCK-STRUCTURAL-CAPACITY-INCREMENT008%')
    union all
    select 1 where exists (select 1 from public.ali_family_review
      where family_id = 'mock-mr13-toppingcombos' and decision = 'approved'
        and review_type = 'mock_maths_independent_review' and reviewer = 'Ayobami Lawal'
        and notes like '%MOCK-STRUCTURAL-CAPACITY-INCREMENT008%')
    union all
    select 1 where exists (select 1 from public.ali_family_review
      where family_id = 'mock-mr06-agenarrative' and decision = 'approved'
        and review_type = 'mock_maths_independent_review' and reviewer = 'Ayobami Lawal'
        and notes like '%MOCK-STRUCTURAL-CAPACITY-INCREMENT008%')
    union all
    select 1 where exists (select 1 from public.ali_family_review
      where family_id = 'mock-mr12-weightedmeancombine' and decision = 'approved'
        and review_type = 'mock_maths_independent_review' and reviewer = 'Ayobami Lawal'
        and notes like '%MOCK-STRUCTURAL-CAPACITY-INCREMENT009%')
    union all
    select 1 where exists (select 1 from public.ali_family_review
      where family_id = 'mock-mr12-weightedmeanreverse' and decision = 'approved'
        and review_type = 'mock_maths_independent_review' and reviewer = 'Ayobami Lawal'
        and notes like '%MOCK-STRUCTURAL-CAPACITY-INCREMENT009%')
  ) approved_checks;
  if v_approved_family_count <> 6 then
    raise exception 'Migration 182 refused: expected a matching APPROVED ali_family_review record for all 6 families, found evidence for only %. Certification requires real, live review evidence for every family, not merely a header or Decision-log claim.', v_approved_family_count;
  end if;

  -- Mock 1's own frozen manifest (77 mock_eligible) and pre-existing
  -- reserve (4 independently_validated, Perimeter Area) must be
  -- untouched, both before and after this migration.
  select count(*) into v_pre_existing_mock_eligible_count
    from public.ali_question_bank where subject = 'maths' and eligibility_status = 'mock_eligible';
  if v_pre_existing_mock_eligible_count <> 77 then
    raise exception 'Migration 182 refused: expected Mathematics mock_eligible total to be exactly 77 (Mock 1''s own frozen manifest) before this migration runs, found %. Re-verify production state before proceeding.', v_pre_existing_mock_eligible_count;
  end if;

  select count(*) into v_pre_existing_reserve_count
    from public.ali_question_bank where family_id = 'mock-mr03mr07-perimeterarea' and eligibility_status = 'independently_validated';
  if v_pre_existing_reserve_count <> 4 then
    raise exception 'Migration 182 refused: expected mock-mr03mr07-perimeterarea''s 4 rows to remain independently_validated (the pre-existing reserve), found %. Re-verify production state before proceeding.', v_pre_existing_reserve_count;
  end if;

  -- === Pending vs. already-applied state ===
  select count(*) into v_pending_count
    from public.ali_question_bank where id = any(v_target_ids) and eligibility_status = 'authentic_assessment_candidate';
  select count(*) into v_already_validated_count
    from public.ali_question_bank where id = any(v_target_ids) and eligibility_status = 'independently_validated';

  if v_pending_count = 13 then
    create temporary table tmp_inc007_009_prompt_snapshot (id text primary key, prompt_snapshot jsonb not null) on commit drop;
    insert into tmp_inc007_009_prompt_snapshot (id, prompt_snapshot)
      select id, prompt from public.ali_question_bank where id = any(v_target_ids);

    update public.ali_question_bank
    set eligibility_status = 'independently_validated'
    where id = any(v_target_ids) and eligibility_status = 'authentic_assessment_candidate';

    select count(*) into v_post_validated_count
      from public.ali_question_bank where id = any(v_target_ids) and eligibility_status = 'independently_validated';
    if v_post_validated_count <> 13 then
      raise exception 'Migration 182 post-write verification failed: expected 13 rows now independently_validated, found %. Rolling back.', v_post_validated_count;
    end if;

    select count(*) into v_post_preserved_count
      from public.ali_question_bank b join tmp_inc007_009_prompt_snapshot s on b.id = s.id
      where b.prompt = s.prompt_snapshot;
    if v_post_preserved_count <> 13 then
      raise exception 'Migration 182 post-write preservation check failed: % of 13 rows have prompt byte-for-byte unchanged (expected 13). Rolling back.', v_post_preserved_count;
    end if;

    select count(*) into v_post_mock_eligible_count
      from public.ali_question_bank where id = any(v_target_ids) and eligibility_status = 'mock_eligible';
    if v_post_mock_eligible_count <> 0 then
      raise exception 'Migration 182 refused: mock_eligible must never be set by this migration (found % rows). Rolling back.', v_post_mock_eligible_count;
    end if;

    select count(*) into v_post_mock_eligible_count
      from public.ali_question_bank where subject = 'maths' and eligibility_status = 'mock_eligible';
    if v_post_mock_eligible_count <> 77 then
      raise exception 'Migration 182 refused: Mathematics mock_eligible total changed from 77 to % -- Mock 1''s frozen manifest must remain untouched. Rolling back.', v_post_mock_eligible_count;
    end if;

    raise notice 'Migration 182: promoted 13 rows across 6 families (mock-mr11-impossibletotal, mock-mr05-numberpyramid, mock-mr13-toppingcombos, mock-mr06-agenarrative, mock-mr12-weightedmeancombine, mock-mr12-weightedmeanreverse) from authentic_assessment_candidate to independently_validated. NOT mock_eligible. Every prompt byte-for-byte unchanged. Mock 1''s 77-row frozen manifest and the pre-existing 4-row Perimeter Area reserve both confirmed untouched. Mathematics Mock-track reserve is now 21 + 13 = 34 marks, still 22 marks short of the 56-mark Mock 2 floor.';

  elsif v_already_validated_count = 13 then
    select count(*) into v_post_mock_eligible_count
      from public.ali_question_bank where id = any(v_target_ids) and eligibility_status = 'mock_eligible';
    if v_post_mock_eligible_count <> 0 then
      raise exception 'Migration 182 refused: mock_eligible found set on % rows in the already-applied branch -- something else changed this content''s eligibility. Manual investigation required.', v_post_mock_eligible_count;
    end if;
    raise notice 'Migration 182: all 13 target rows already independently_validated -- safe no-op.';

  else
    raise exception 'Migration 182 refused: target rows match neither PRISTINE (13 authentic_assessment_candidate) nor ALREADY-APPLIED (13 independently_validated) state (pending=%, already_validated=%, total=13). Investigate before re-running.',
      v_pending_count, v_already_validated_count;
  end if;
end $$;

commit;
