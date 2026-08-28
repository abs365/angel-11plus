-- Angel Digital 11+ — Migration 160
-- English Content Foundation Increment 001, Decision 236 — Independent
-- Validation Promotion (Post-Amendment-Verification Certification Gate).
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS, AND ITS OWN EVIDENCE BASIS
-- ============================================================
-- Founder-supplied evidence (Level 1, this decision): all 5 Increment 001
-- review targets show a complete, closed educational-review chain on the
-- production Educational Review interface -- 2 passages and 2 Writing
-- prompts recorded independent review `approved_with_amendment`,
-- amendment remediation completed (migrations 157/158/159, Founder-
-- confirmed applied), and amendment verification `resolved` via the
-- dedicated Amendment Verification section (Decision 235, review_type =
-- 'amendment_verification'); the fifth ("A Mistake You Learned From")
-- recorded plain `approved`, requiring no amendment or verification
-- step. This migration promotes exactly these 18 rows (2 passages + 15
-- attached comprehension questions + 3 Writing prompts) from
-- eligibility_status 'authentic_assessment_candidate' to
-- 'independently_validated' -- the SAME transition, and the SAME
-- precondition/pristine/already-done/refuse pattern, migrations 102 and
-- 103 already established for this codebase's only prior precedent of
-- promoting English content this way.
--
-- ============================================================
-- WHY THIS MIGRATION DOES NOT QUERY ali_family_review
-- ============================================================
-- Deliberate, matching migration 102/103's own established, documented
-- precedent exactly (both migrations' own headers state "does NOT touch
-- ali_family_review in any way" as a positive safety property, not an
-- omission): `ali_family_review` is an append-only, multi-row-per-
-- family_id evidence log with no unique-per-target invariant a runtime
-- query could safely rely on -- baking a live read of it into a
-- promotion migration's own precondition would be a fragile, novel
-- mechanism this codebase has never used for this transition, and could
-- itself misfire (e.g. against a stray or duplicate row) in exactly the
-- way Decision 230 once found the review-target identifier defect. The
-- review/amendment-verification evidence itself is instead verified by
-- THIS SESSION, from the Founder's own direct report, and documented
-- here and in Decision 236's own log entry -- the same evidentiary
-- standard migration 102/103's own header comments already used for
-- their own "Founder-supplied evidence" sections. This migration's own
-- SQL precondition is scoped purely to `eligibility_status`/`active` on
-- the content tables, exactly like its two precedents.
--
-- ============================================================
-- INDEPENDENT-VALIDATION BOUNDARY, NOT MOCK-ELIGIBILITY, NOT PRACTICE
-- ============================================================
-- This migration moves these 18 rows to 'independently_validated' ONLY.
-- It does NOT set eligibility_status = 'mock_eligible' anywhere (a
-- separate, later, pool-level-balance-checked, Founder-authorised step,
-- per RELEASE_1_ASSESSMENT_ELIGIBILITY_MODEL.md, unchanged by this
-- decision). It does NOT set eligibility_status = 'practice_eligible'
-- anywhere: every one of these 18 rows was authored, from its very
-- first migration (152/153), directly as `authentic_assessment_
-- candidate` -- the Mock track -- never as `provisional`/`practice_
-- eligible` (the separate Practice track). The review surface's own
-- disclosure to every reviewer of this content states explicitly: "These
-- are Mock candidates, not Practice content: neither has ever been, or
-- will be, automatically promoted from Practice" (both
-- EnglishInc001PassageSection and EnglishInc001WritingSection,
-- app/admin-beta/review/page.tsx). Promoting the SAME passage or prompt
-- into both Practice and a future Mock would break passage-level anti-
-- memorisation isolation -- a learner who has practised on "The
-- Understudy" could not then sit it, unseen, in a future Mock. This
-- migration does not create that risk. It does NOT insert or modify any
-- ali_mock_form row -- no English Mock is created or activated. It does
-- NOT touch ali_family_review in any way (see above). It does NOT touch
-- provenance, content_version, active, family_id, or prompt/checklist/
-- passage-text content on any row -- only eligibility_status moves.
--
-- ============================================================
-- ATOMICITY
-- ============================================================
-- Each passage and its complete attached question set is promoted
-- together, by two do $$ blocks sharing the same exact-id array pattern
-- migration 102 established (questions first, then the passage), so a
-- reviewer's approval of "the passage as a whole" can never result in a
-- partially-promoted family. The 3 Writing prompts (each its own
-- independent family, no shared passage) are promoted together in one
-- block, mirroring migration 103 exactly.
--
-- ============================================================
-- SAFETY
-- ============================================================
-- Fails safely, mirroring migration 102/103's own assertion-and-refuse
-- pattern: if the live count of matching rows for any block is not
-- exactly the expected number of `authentic_assessment_candidate` rows
-- across that block's own exact IDs, and is not already exactly that
-- same number already `independently_validated`, that block refuses to
-- guess and raises an exception naming the actual counts observed,
-- touching nothing. Each of the 5 blocks below is independent -- a
-- refusal in one does not prevent the others from being evaluated
-- (though a raised exception aborts the whole transaction per this
-- migration's own single begin/commit wrapper, matching every other
-- migration in this project).
--
-- NOT APPLIED. Generated for Founder application via Supabase Dashboard
-- > SQL Editor > New query, after migrations 157/158/159 (Founder-
-- confirmed already applied).

begin;

-- ─── The Understudy: 7 questions, then the passage ─────────────────────
do $$
declare
  v_pending_count int;
  v_already_validated_count int;
  v_target_ids constant text[] := array[
    'eng-inc001-understudy-q01', 'eng-inc001-understudy-q02', 'eng-inc001-understudy-q03',
    'eng-inc001-understudy-q04', 'eng-inc001-understudy-q05', 'eng-inc001-understudy-q06',
    'eng-inc001-understudy-q07'
  ];
begin
  select count(*) into v_pending_count
  from public.ali_question_bank
  where id = any(v_target_ids)
    and eligibility_status = 'authentic_assessment_candidate'
    and active = true
    and learning_unit_id = 'eng-inc001-understudy';

  select count(*) into v_already_validated_count
  from public.ali_question_bank
  where id = any(v_target_ids)
    and eligibility_status = 'independently_validated';

  if v_pending_count = 7 then
    update public.ali_question_bank
    set eligibility_status = 'independently_validated'
    where id = any(v_target_ids)
      and eligibility_status = 'authentic_assessment_candidate';

    raise notice 'Migration 160: promoted 7 The Understudy question rows from authentic_assessment_candidate to independently_validated.';

  elsif v_already_validated_count = 7 then
    raise notice 'Migration 160: all 7 The Understudy question rows are already independently_validated -- already applied. No changes made.';

  else
    raise exception
      'Migration 160 refused (Understudy questions): expected 7 authentic_assessment_candidate rows attached to eng-inc001-understudy (found %), or 7 already independently_validated (found %). Re-verify production state before proceeding.',
      v_pending_count, v_already_validated_count;
  end if;
end $$;

do $$
declare
  v_pending_count int;
  v_already_validated_count int;
begin
  select count(*) into v_pending_count
  from public.ali_passage_bank
  where id = 'eng-inc001-understudy'
    and eligibility_status = 'authentic_assessment_candidate'
    and active = true;

  select count(*) into v_already_validated_count
  from public.ali_passage_bank
  where id = 'eng-inc001-understudy'
    and eligibility_status = 'independently_validated';

  if v_pending_count = 1 then
    update public.ali_passage_bank
    set eligibility_status = 'independently_validated'
    where id = 'eng-inc001-understudy'
      and eligibility_status = 'authentic_assessment_candidate';

    raise notice 'Migration 160: promoted the eng-inc001-understudy passage row, alongside its 7 question rows.';

  elsif v_already_validated_count = 1 then
    raise notice 'Migration 160: the eng-inc001-understudy passage row is already independently_validated -- already applied. No changes made.';

  else
    raise exception
      'Migration 160 refused (Understudy passage): expected 1 authentic_assessment_candidate row at eng-inc001-understudy (found %), or already independently_validated (found %). Re-verify production state before proceeding.',
      v_pending_count, v_already_validated_count;
  end if;
end $$;

-- ─── How Bees Find Their Way Home: 8 questions, then the passage ───────
do $$
declare
  v_pending_count int;
  v_already_validated_count int;
  v_target_ids constant text[] := array[
    'eng-inc001-bee-q01', 'eng-inc001-bee-q02', 'eng-inc001-bee-q03', 'eng-inc001-bee-q04',
    'eng-inc001-bee-q05', 'eng-inc001-bee-q06', 'eng-inc001-bee-q07', 'eng-inc001-bee-q08'
  ];
begin
  select count(*) into v_pending_count
  from public.ali_question_bank
  where id = any(v_target_ids)
    and eligibility_status = 'authentic_assessment_candidate'
    and active = true
    and learning_unit_id = 'eng-inc001-bee-navigation';

  select count(*) into v_already_validated_count
  from public.ali_question_bank
  where id = any(v_target_ids)
    and eligibility_status = 'independently_validated';

  if v_pending_count = 8 then
    update public.ali_question_bank
    set eligibility_status = 'independently_validated'
    where id = any(v_target_ids)
      and eligibility_status = 'authentic_assessment_candidate';

    raise notice 'Migration 160: promoted 8 How Bees Find Their Way Home question rows from authentic_assessment_candidate to independently_validated.';

  elsif v_already_validated_count = 8 then
    raise notice 'Migration 160: all 8 Bee Navigation question rows are already independently_validated -- already applied. No changes made.';

  else
    raise exception
      'Migration 160 refused (Bee questions): expected 8 authentic_assessment_candidate rows attached to eng-inc001-bee-navigation (found %), or 8 already independently_validated (found %). Re-verify production state before proceeding.',
      v_pending_count, v_already_validated_count;
  end if;
end $$;

do $$
declare
  v_pending_count int;
  v_already_validated_count int;
begin
  select count(*) into v_pending_count
  from public.ali_passage_bank
  where id = 'eng-inc001-bee-navigation'
    and eligibility_status = 'authentic_assessment_candidate'
    and active = true;

  select count(*) into v_already_validated_count
  from public.ali_passage_bank
  where id = 'eng-inc001-bee-navigation'
    and eligibility_status = 'independently_validated';

  if v_pending_count = 1 then
    update public.ali_passage_bank
    set eligibility_status = 'independently_validated'
    where id = 'eng-inc001-bee-navigation'
      and eligibility_status = 'authentic_assessment_candidate';

    raise notice 'Migration 160: promoted the eng-inc001-bee-navigation passage row, alongside its 8 question rows.';

  elsif v_already_validated_count = 1 then
    raise notice 'Migration 160: the eng-inc001-bee-navigation passage row is already independently_validated -- already applied. No changes made.';

  else
    raise exception
      'Migration 160 refused (Bee passage): expected 1 authentic_assessment_candidate row at eng-inc001-bee-navigation (found %), or already independently_validated (found %). Re-verify production state before proceeding.',
      v_pending_count, v_already_validated_count;
  end if;
end $$;

-- ─── Somewhere New / A Mistake You Learned From / Screen Time ──────────
do $$
declare
  v_pending_count int;
  v_already_validated_count int;
  v_target_ids constant text[] := array[
    'mock-writing-newplace-01', 'mock-writing-mistakelearned-01', 'mock-writing-screentime-01'
  ];
begin
  select count(*) into v_pending_count
  from public.ali_question_bank
  where id = any(v_target_ids)
    and eligibility_status = 'authentic_assessment_candidate'
    and active = true
    and subject = 'writing';

  select count(*) into v_already_validated_count
  from public.ali_question_bank
  where id = any(v_target_ids)
    and eligibility_status = 'independently_validated';

  if v_pending_count = 3 then
    update public.ali_question_bank
    set eligibility_status = 'independently_validated'
    where id = any(v_target_ids)
      and eligibility_status = 'authentic_assessment_candidate';

    raise notice 'Migration 160: promoted 3 Increment 001 Continuous Writing prompts from authentic_assessment_candidate to independently_validated.';

  elsif v_already_validated_count = 3 then
    raise notice 'Migration 160: all 3 target prompts are already independently_validated -- already applied. No changes made.';

  else
    raise exception
      'Migration 160 refused (Writing prompts): expected 3 authentic_assessment_candidate writing rows across the 3 named IDs (found %), or 3 already independently_validated (found %). Re-verify production state before proceeding.',
      v_pending_count, v_already_validated_count;
  end if;
end $$;

commit;

-- Read-only verification (run before and after applying):
--
-- select id, eligibility_status from public.ali_passage_bank
--   where id in ('eng-inc001-understudy', 'eng-inc001-bee-navigation') order by id;
--
-- select id, learning_unit_id, eligibility_status from public.ali_question_bank
--   where learning_unit_id in ('eng-inc001-understudy', 'eng-inc001-bee-navigation')
--      or id in ('mock-writing-newplace-01', 'mock-writing-mistakelearned-01', 'mock-writing-screentime-01')
--   order by learning_unit_id, id;
