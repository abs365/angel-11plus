-- Angel Digital 11+ — Migration 207
-- Programme Completion Increment 012: English Mock 1 readiness
-- infrastructure, Part 2 -- promote the already-independently_validated,
-- never-Practice-exposed Reading Mock-track passages and the one ready
-- Continuous Writing prompt from `independently_validated` to
-- `mock_eligible`.
--
-- ============================================================
-- SCOPE AND WHY THESE ROWS SPECIFICALLY
-- ============================================================
-- This migration does NOT compose or release any Mock. It only performs
-- the eligibility promotion `fetchMockEligibleQuestionBank()` (the Mock
-- Content Firewall, Decision 59) requires before any future Mock
-- composition can reference this content at all -- confirmed this
-- session, via a full grep of every migration that has ever set
-- eligibility_status = 'mock_eligible' anywhere in this repository's
-- history, that ZERO English (Reading or Writing) rows have ever
-- received mock_eligible status; every prior mock_eligible promotion in
-- this codebase (migrations 105/123/124/129/130/133/136/139/142/144) is
-- Mathematics-only.
--
-- Selected rows, and only these:
--   1. Five Reading Mock-track passages already at `independently_
--      validated` (per ANGEL_11PLUS_COMPLETION_READINESS_REGISTER.md
--      Section D, itself sourced from Decisions 236/242's own Founder-
--      confirmed closure of migrations 160/165): The Boat in the
--      Boathouse, The Understudy (Mock-track: eng-inc001-understudy, NOT
--      the separate Practice-track wave2-eng-understudy), How Bees Find
--      Their Way Home, The Loose Connection, Crossing the Atlantic: Sail
--      and Steam. Confirmed this session, independently, that none of
--      these five passage titles appear anywhere in the live
--      practice_eligible content set (343/343 rows checked) -- genuinely
--      unexposed to any real learner via Practice.
--   2. One Continuous Writing prompt already at `independently_
--      validated`: `mock-writing-screentime-01` ("Should Children Have
--      Limits on Screen Time?"), reviewed and `approved_with_amendment`
--      (Ayobami Lawal), content-corrected in migration 159, promoted to
--      independently_validated alongside newplace/mistakelearned in
--      migration 160 -- but, unlike those two, never included in any
--      later promotion migration (200/203/204 target only 7 other IDs;
--      confirmed by direct inspection of all three). Confirmed this
--      session not to be among the 7 live practice_eligible Writing
--      prompts -- genuinely unexposed.
--
-- Explicitly and deliberately NOT included (do not add these without a
-- separate, later Founder decision):
--   - Pepper's Breakfast, The Compass Rose Challenge, How Salmon Find
--     Their Way Home -- still `authentic_assessment_candidate`, pending
--     independent review. Promoting review-pending content to
--     mock_eligible would violate this programme's own standing rule:
--     no eligibility promotion without a completed independent review.
--   - `eng-pc003-writing-difficulttask` / `eng-pc003-writing-
--     meaningfulplace` -- no matching review/promotion decision was
--     located this session; their status is UNRESOLVED, not confirmed
--     ready. Left untouched pending that reconciliation.
--   - Any Applied Reasoning content of any kind (removed from the
--     current CSSE pathway September 2024, Decision 58) and any picture-
--     stimulus Writing content (none exists -- no image-asset pipeline
--     in this codebase).
--
-- ============================================================
-- SAFETY PATTERN
-- ============================================================
-- Mirrors migration 160/165's own fail-closed, idempotent, per-unit DO
-- block structure exactly: each block checks for the expected pre-state
-- (independently_validated) or the expected post-state (mock_eligible,
-- meaning already applied) and refuses with a raised exception on any
-- other count -- it will not silently promote content in an unexpected
-- state. Passage rows (`ali_passage_bank`) and question rows
-- (`ali_question_bank`) are promoted in matching, separately-verified
-- pairs, exactly as migration 160 did for the same five/eight/seven/
-- twelve/ten-question shapes.
--
-- This migration does NOT touch `ali_mock_form`, does not create a Mock,
-- does not change any `active` flag, and does not alter Mathematics Mock
-- 1 or any of its content in any way.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query.

begin;

-- ─── The Boat in the Boathouse: 13 questions, then the passage ─────────
do $$
declare
  v_pending_count int;
  v_already_promoted_count int;
  v_target_ids constant text[] := array[
    'mock-eng-boathouse-q01', 'mock-eng-boathouse-q02', 'mock-eng-boathouse-q03',
    'mock-eng-boathouse-q04', 'mock-eng-boathouse-q05', 'mock-eng-boathouse-q06',
    'mock-eng-boathouse-q07', 'mock-eng-boathouse-q08', 'mock-eng-boathouse-q09',
    'mock-eng-boathouse-q10', 'mock-eng-boathouse-q11', 'mock-eng-boathouse-q12a',
    'mock-eng-boathouse-q12b'
  ];
begin
  select count(*) into v_pending_count
  from public.ali_question_bank
  where id = any(v_target_ids) and eligibility_status = 'independently_validated' and active = true;

  select count(*) into v_already_promoted_count
  from public.ali_question_bank
  where id = any(v_target_ids) and eligibility_status = 'mock_eligible';

  if v_pending_count = 13 then
    update public.ali_question_bank set eligibility_status = 'mock_eligible'
    where id = any(v_target_ids) and eligibility_status = 'independently_validated';
    raise notice 'Migration 207: promoted 13 Boat in the Boathouse question rows to mock_eligible.';
  elsif v_already_promoted_count = 13 then
    raise notice 'Migration 207: all 13 Boathouse question rows already mock_eligible -- already applied. No changes made.';
  else
    raise exception 'Migration 207 refused (Boathouse questions): expected 13 independently_validated rows (found %), or 13 already mock_eligible (found %). Re-verify production state before proceeding.', v_pending_count, v_already_promoted_count;
  end if;
end $$;

do $$
declare
  v_pending_count int;
  v_already_promoted_count int;
begin
  select count(*) into v_pending_count from public.ali_passage_bank
  where id = 'mock-eng-boathouse' and eligibility_status = 'independently_validated' and active = true;
  select count(*) into v_already_promoted_count from public.ali_passage_bank
  where id = 'mock-eng-boathouse' and eligibility_status = 'mock_eligible';

  if v_pending_count = 1 then
    update public.ali_passage_bank set eligibility_status = 'mock_eligible'
    where id = 'mock-eng-boathouse' and eligibility_status = 'independently_validated';
    raise notice 'Migration 207: promoted the mock-eng-boathouse passage row.';
  elsif v_already_promoted_count = 1 then
    raise notice 'Migration 207: mock-eng-boathouse passage row already mock_eligible -- already applied. No changes made.';
  else
    raise exception 'Migration 207 refused (Boathouse passage): expected 1 independently_validated row (found %), or already mock_eligible (found %). Re-verify production state before proceeding.', v_pending_count, v_already_promoted_count;
  end if;
end $$;

-- ─── The Understudy (Mock-track, eng-inc001-understudy): 7 questions, then the passage ───
do $$
declare
  v_pending_count int;
  v_already_promoted_count int;
  v_target_ids constant text[] := array[
    'eng-inc001-understudy-q01', 'eng-inc001-understudy-q02', 'eng-inc001-understudy-q03',
    'eng-inc001-understudy-q04', 'eng-inc001-understudy-q05', 'eng-inc001-understudy-q06',
    'eng-inc001-understudy-q07'
  ];
begin
  select count(*) into v_pending_count from public.ali_question_bank
  where id = any(v_target_ids) and eligibility_status = 'independently_validated' and active = true
    and learning_unit_id = 'eng-inc001-understudy';
  select count(*) into v_already_promoted_count from public.ali_question_bank
  where id = any(v_target_ids) and eligibility_status = 'mock_eligible';

  if v_pending_count = 7 then
    update public.ali_question_bank set eligibility_status = 'mock_eligible'
    where id = any(v_target_ids) and eligibility_status = 'independently_validated';
    raise notice 'Migration 207: promoted 7 Mock-track Understudy question rows to mock_eligible.';
  elsif v_already_promoted_count = 7 then
    raise notice 'Migration 207: all 7 Mock-track Understudy question rows already mock_eligible -- already applied. No changes made.';
  else
    raise exception 'Migration 207 refused (Understudy questions): expected 7 independently_validated rows attached to eng-inc001-understudy (found %), or 7 already mock_eligible (found %). Re-verify production state before proceeding.', v_pending_count, v_already_promoted_count;
  end if;
end $$;

do $$
declare
  v_pending_count int;
  v_already_promoted_count int;
begin
  select count(*) into v_pending_count from public.ali_passage_bank
  where id = 'eng-inc001-understudy' and eligibility_status = 'independently_validated' and active = true;
  select count(*) into v_already_promoted_count from public.ali_passage_bank
  where id = 'eng-inc001-understudy' and eligibility_status = 'mock_eligible';

  if v_pending_count = 1 then
    update public.ali_passage_bank set eligibility_status = 'mock_eligible'
    where id = 'eng-inc001-understudy' and eligibility_status = 'independently_validated';
    raise notice 'Migration 207: promoted the eng-inc001-understudy passage row.';
  elsif v_already_promoted_count = 1 then
    raise notice 'Migration 207: eng-inc001-understudy passage row already mock_eligible -- already applied. No changes made.';
  else
    raise exception 'Migration 207 refused (Understudy passage): expected 1 independently_validated row (found %), or already mock_eligible (found %). Re-verify production state before proceeding.', v_pending_count, v_already_promoted_count;
  end if;
end $$;

-- ─── How Bees Find Their Way Home: 8 questions, then the passage ───────
do $$
declare
  v_pending_count int;
  v_already_promoted_count int;
  v_target_ids constant text[] := array[
    'eng-inc001-bee-q01', 'eng-inc001-bee-q02', 'eng-inc001-bee-q03', 'eng-inc001-bee-q04',
    'eng-inc001-bee-q05', 'eng-inc001-bee-q06', 'eng-inc001-bee-q07', 'eng-inc001-bee-q08'
  ];
begin
  select count(*) into v_pending_count from public.ali_question_bank
  where id = any(v_target_ids) and eligibility_status = 'independently_validated' and active = true
    and learning_unit_id = 'eng-inc001-bee-navigation';
  select count(*) into v_already_promoted_count from public.ali_question_bank
  where id = any(v_target_ids) and eligibility_status = 'mock_eligible';

  if v_pending_count = 8 then
    update public.ali_question_bank set eligibility_status = 'mock_eligible'
    where id = any(v_target_ids) and eligibility_status = 'independently_validated';
    raise notice 'Migration 207: promoted 8 How Bees Find Their Way Home question rows to mock_eligible.';
  elsif v_already_promoted_count = 8 then
    raise notice 'Migration 207: all 8 Bee-navigation question rows already mock_eligible -- already applied. No changes made.';
  else
    raise exception 'Migration 207 refused (Bee-navigation questions): expected 8 independently_validated rows (found %), or 8 already mock_eligible (found %). Re-verify production state before proceeding.', v_pending_count, v_already_promoted_count;
  end if;
end $$;

do $$
declare
  v_pending_count int;
  v_already_promoted_count int;
begin
  select count(*) into v_pending_count from public.ali_passage_bank
  where id = 'eng-inc001-bee-navigation' and eligibility_status = 'independently_validated' and active = true;
  select count(*) into v_already_promoted_count from public.ali_passage_bank
  where id = 'eng-inc001-bee-navigation' and eligibility_status = 'mock_eligible';

  if v_pending_count = 1 then
    update public.ali_passage_bank set eligibility_status = 'mock_eligible'
    where id = 'eng-inc001-bee-navigation' and eligibility_status = 'independently_validated';
    raise notice 'Migration 207: promoted the eng-inc001-bee-navigation passage row.';
  elsif v_already_promoted_count = 1 then
    raise notice 'Migration 207: eng-inc001-bee-navigation passage row already mock_eligible -- already applied. No changes made.';
  else
    raise exception 'Migration 207 refused (Bee-navigation passage): expected 1 independently_validated row (found %), or already mock_eligible (found %). Re-verify production state before proceeding.', v_pending_count, v_already_promoted_count;
  end if;
end $$;

-- ─── The Loose Connection (eng-inc002-roboticsfinal): 12 questions, then the passage ───
do $$
declare
  v_pending_count int;
  v_already_promoted_count int;
  v_target_ids constant text[] := array[
    'eng-inc002-roboticsfinal-q01', 'eng-inc002-roboticsfinal-q02b', 'eng-inc002-roboticsfinal-q02c',
    'eng-inc002-roboticsfinal-q02d', 'eng-inc002-roboticsfinal-q02e', 'eng-inc002-roboticsfinal-q03',
    'eng-inc002-roboticsfinal-q04', 'eng-inc002-roboticsfinal-q05', 'eng-inc002-roboticsfinal-q06',
    'eng-inc002-roboticsfinal-q07a', 'eng-inc002-roboticsfinal-q07b', 'eng-inc002-roboticsfinal-q08'
  ];
begin
  select count(*) into v_pending_count from public.ali_question_bank
  where id = any(v_target_ids) and eligibility_status = 'independently_validated' and active = true;
  select count(*) into v_already_promoted_count from public.ali_question_bank
  where id = any(v_target_ids) and eligibility_status = 'mock_eligible';

  if v_pending_count = 12 then
    update public.ali_question_bank set eligibility_status = 'mock_eligible'
    where id = any(v_target_ids) and eligibility_status = 'independently_validated';
    raise notice 'Migration 207: promoted 12 The Loose Connection question rows to mock_eligible.';
  elsif v_already_promoted_count = 12 then
    raise notice 'Migration 207: all 12 Loose Connection question rows already mock_eligible -- already applied. No changes made.';
  else
    raise exception 'Migration 207 refused (Loose Connection questions): expected 12 independently_validated rows (found %), or 12 already mock_eligible (found %). Re-verify production state before proceeding.', v_pending_count, v_already_promoted_count;
  end if;
end $$;

do $$
declare
  v_pending_count int;
  v_already_promoted_count int;
begin
  select count(*) into v_pending_count from public.ali_passage_bank
  where id = 'eng-inc002-roboticsfinal' and eligibility_status = 'independently_validated' and active = true;
  select count(*) into v_already_promoted_count from public.ali_passage_bank
  where id = 'eng-inc002-roboticsfinal' and eligibility_status = 'mock_eligible';

  if v_pending_count = 1 then
    update public.ali_passage_bank set eligibility_status = 'mock_eligible'
    where id = 'eng-inc002-roboticsfinal' and eligibility_status = 'independently_validated';
    raise notice 'Migration 207: promoted the eng-inc002-roboticsfinal (The Loose Connection) passage row.';
  elsif v_already_promoted_count = 1 then
    raise notice 'Migration 207: eng-inc002-roboticsfinal passage row already mock_eligible -- already applied. No changes made.';
  else
    raise exception 'Migration 207 refused (Loose Connection passage): expected 1 independently_validated row (found %), or already mock_eligible (found %). Re-verify production state before proceeding.', v_pending_count, v_already_promoted_count;
  end if;
end $$;

-- ─── Crossing the Atlantic: Sail and Steam (eng-inc002-sailandsteam): 10 questions, then the passage ───
do $$
declare
  v_pending_count int;
  v_already_promoted_count int;
  v_target_ids constant text[] := array[
    'eng-inc002-sailandsteam-q01', 'eng-inc002-sailandsteam-q02', 'eng-inc002-sailandsteam-q03',
    'eng-inc002-sailandsteam-q04', 'eng-inc002-sailandsteam-q05b', 'eng-inc002-sailandsteam-q05c',
    'eng-inc002-sailandsteam-q05d', 'eng-inc002-sailandsteam-q05e', 'eng-inc002-sailandsteam-q06',
    'eng-inc002-sailandsteam-q07'
  ];
begin
  select count(*) into v_pending_count from public.ali_question_bank
  where id = any(v_target_ids) and eligibility_status = 'independently_validated' and active = true;
  select count(*) into v_already_promoted_count from public.ali_question_bank
  where id = any(v_target_ids) and eligibility_status = 'mock_eligible';

  if v_pending_count = 10 then
    update public.ali_question_bank set eligibility_status = 'mock_eligible'
    where id = any(v_target_ids) and eligibility_status = 'independently_validated';
    raise notice 'Migration 207: promoted 10 Sail and Steam question rows to mock_eligible.';
  elsif v_already_promoted_count = 10 then
    raise notice 'Migration 207: all 10 Sail and Steam question rows already mock_eligible -- already applied. No changes made.';
  else
    raise exception 'Migration 207 refused (Sail and Steam questions): expected 10 independently_validated rows (found %), or 10 already mock_eligible (found %). Re-verify production state before proceeding.', v_pending_count, v_already_promoted_count;
  end if;
end $$;

do $$
declare
  v_pending_count int;
  v_already_promoted_count int;
begin
  select count(*) into v_pending_count from public.ali_passage_bank
  where id = 'eng-inc002-sailandsteam' and eligibility_status = 'independently_validated' and active = true;
  select count(*) into v_already_promoted_count from public.ali_passage_bank
  where id = 'eng-inc002-sailandsteam' and eligibility_status = 'mock_eligible';

  if v_pending_count = 1 then
    update public.ali_passage_bank set eligibility_status = 'mock_eligible'
    where id = 'eng-inc002-sailandsteam' and eligibility_status = 'independently_validated';
    raise notice 'Migration 207: promoted the eng-inc002-sailandsteam (Sail and Steam) passage row.';
  elsif v_already_promoted_count = 1 then
    raise notice 'Migration 207: eng-inc002-sailandsteam passage row already mock_eligible -- already applied. No changes made.';
  else
    raise exception 'Migration 207 refused (Sail and Steam passage): expected 1 independently_validated row (found %), or already mock_eligible (found %). Re-verify production state before proceeding.', v_pending_count, v_already_promoted_count;
  end if;
end $$;

-- ─── Continuous Writing: mock-writing-screentime-01 ─────────────────────
do $$
declare
  v_pending_count int;
  v_already_promoted_count int;
begin
  select count(*) into v_pending_count from public.ali_question_bank
  where id = 'mock-writing-screentime-01' and eligibility_status = 'independently_validated' and active = true;
  select count(*) into v_already_promoted_count from public.ali_question_bank
  where id = 'mock-writing-screentime-01' and eligibility_status = 'mock_eligible';

  if v_pending_count = 1 then
    update public.ali_question_bank set eligibility_status = 'mock_eligible'
    where id = 'mock-writing-screentime-01' and eligibility_status = 'independently_validated';
    raise notice 'Migration 207: promoted mock-writing-screentime-01 (Screen Time) to mock_eligible.';
  elsif v_already_promoted_count = 1 then
    raise notice 'Migration 207: mock-writing-screentime-01 already mock_eligible -- already applied. No changes made.';
  else
    raise exception 'Migration 207 refused (Screen Time Writing prompt): expected 1 independently_validated row (found %), or already mock_eligible (found %). Re-verify production state before proceeding.', v_pending_count, v_already_promoted_count;
  end if;
end $$;

commit;

-- Read-only verification (run before and after applying):
--
-- select id, eligibility_status from public.ali_passage_bank
--   where id in ('mock-eng-boathouse', 'eng-inc001-understudy', 'eng-inc001-bee-navigation',
--                'eng-inc002-roboticsfinal', 'eng-inc002-sailandsteam') order by id;
--
-- select id, eligibility_status from public.ali_question_bank
--   where id like 'mock-eng-boathouse-%' or id like 'eng-inc001-understudy-%'
--      or id like 'eng-inc001-bee-%' or id like 'eng-inc002-roboticsfinal-%'
--      or id like 'eng-inc002-sailandsteam-%' or id = 'mock-writing-screentime-01'
--   order by id;
