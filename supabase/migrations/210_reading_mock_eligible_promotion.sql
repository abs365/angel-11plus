-- Angel Digital 11+ — Migration 210
-- Programme Completion Increment 014: Reading-only mock_eligible
-- promotion. Supersedes migration 207's Reading portion.
--
-- ============================================================
-- WHY THIS REPLACES PART OF 207
-- ============================================================
-- Migration 207 bundled 5 Reading passages and 1 Continuous Writing
-- prompt into a SINGLE transaction (one begin/commit). The Founder's own
-- instruction this increment: "Prefer explicit allocation over bundled
-- convenience" -- Reading firewall activation and Writing protection/
-- allocation are separate Founder decisions (the Writing asset's
-- strategic timing depends on the still-unresolved full English Mock
-- architecture question; Reading's does not). A single atomic
-- transaction made it impossible to apply one without the other. This
-- migration is Reading-only; migration 211 is Writing-only.
--
-- migration 207 itself is not edited (already reported as final,
-- Increment 012) -- superseded in full by 210 (this file) + 211,
-- documented, not silently rewritten. **207 should not be applied.**
--
-- Content, evidence, and safety pattern otherwise unchanged from 207 --
-- see that file's own header for the full evidence trail (all five
-- passages independently_validated, confirmed never Practice-exposed,
-- confirmed never Mock-exposed via the complete ali_mock_form insert
-- history).
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
    raise notice 'Migration 210: promoted 13 Boat in the Boathouse question rows to mock_eligible.';
  elsif v_already_promoted_count = 13 then
    raise notice 'Migration 210: all 13 Boathouse question rows already mock_eligible -- already applied. No changes made.';
  else
    raise exception 'Migration 210 refused (Boathouse questions): expected 13 independently_validated rows (found %), or 13 already mock_eligible (found %). Re-verify production state before proceeding.', v_pending_count, v_already_promoted_count;
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
    raise notice 'Migration 210: promoted the mock-eng-boathouse passage row.';
  elsif v_already_promoted_count = 1 then
    raise notice 'Migration 210: mock-eng-boathouse passage row already mock_eligible -- already applied. No changes made.';
  else
    raise exception 'Migration 210 refused (Boathouse passage): expected 1 independently_validated row (found %), or already mock_eligible (found %). Re-verify production state before proceeding.', v_pending_count, v_already_promoted_count;
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
    raise notice 'Migration 210: promoted 7 Mock-track Understudy question rows to mock_eligible.';
  elsif v_already_promoted_count = 7 then
    raise notice 'Migration 210: all 7 Mock-track Understudy question rows already mock_eligible -- already applied. No changes made.';
  else
    raise exception 'Migration 210 refused (Understudy questions): expected 7 independently_validated rows attached to eng-inc001-understudy (found %), or 7 already mock_eligible (found %). Re-verify production state before proceeding.', v_pending_count, v_already_promoted_count;
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
    raise notice 'Migration 210: promoted the eng-inc001-understudy passage row.';
  elsif v_already_promoted_count = 1 then
    raise notice 'Migration 210: eng-inc001-understudy passage row already mock_eligible -- already applied. No changes made.';
  else
    raise exception 'Migration 210 refused (Understudy passage): expected 1 independently_validated row (found %), or already mock_eligible (found %). Re-verify production state before proceeding.', v_pending_count, v_already_promoted_count;
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
    raise notice 'Migration 210: promoted 8 How Bees Find Their Way Home question rows to mock_eligible.';
  elsif v_already_promoted_count = 8 then
    raise notice 'Migration 210: all 8 Bee-navigation question rows already mock_eligible -- already applied. No changes made.';
  else
    raise exception 'Migration 210 refused (Bee-navigation questions): expected 8 independently_validated rows (found %), or 8 already mock_eligible (found %). Re-verify production state before proceeding.', v_pending_count, v_already_promoted_count;
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
    raise notice 'Migration 210: promoted the eng-inc001-bee-navigation passage row.';
  elsif v_already_promoted_count = 1 then
    raise notice 'Migration 210: eng-inc001-bee-navigation passage row already mock_eligible -- already applied. No changes made.';
  else
    raise exception 'Migration 210 refused (Bee-navigation passage): expected 1 independently_validated row (found %), or already mock_eligible (found %). Re-verify production state before proceeding.', v_pending_count, v_already_promoted_count;
  end if;
end $$;

-- ─── The Loose Connection (eng-inc002-roboticsfinal): 12 questions, then the passage ───
-- Reserved for Reading Comprehension Mock 2 (Founder decision, Increment
-- 014, Section 2) -- promoted to mock_eligible now (safe: mock_eligible
-- content is not servable to anyone until composed into an active form
-- with a real learner attempt) but deliberately NOT included in Mock 1's
-- question_manifest.
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
    raise notice 'Migration 210: promoted 12 The Loose Connection question rows to mock_eligible (reserved for a future Mock, not this one).';
  elsif v_already_promoted_count = 12 then
    raise notice 'Migration 210: all 12 Loose Connection question rows already mock_eligible -- already applied. No changes made.';
  else
    raise exception 'Migration 210 refused (Loose Connection questions): expected 12 independently_validated rows (found %), or 12 already mock_eligible (found %). Re-verify production state before proceeding.', v_pending_count, v_already_promoted_count;
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
    raise notice 'Migration 210: promoted the eng-inc002-roboticsfinal (The Loose Connection) passage row.';
  elsif v_already_promoted_count = 1 then
    raise notice 'Migration 210: eng-inc002-roboticsfinal passage row already mock_eligible -- already applied. No changes made.';
  else
    raise exception 'Migration 210 refused (Loose Connection passage): expected 1 independently_validated row (found %), or already mock_eligible (found %). Re-verify production state before proceeding.', v_pending_count, v_already_promoted_count;
  end if;
end $$;

-- ─── Crossing the Atlantic: Sail and Steam (eng-inc002-sailandsteam): 10 questions, then the passage ───
-- Also reserved for Reading Comprehension Mock 2, same rationale as
-- Loose Connection above.
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
    raise notice 'Migration 210: promoted 10 Sail and Steam question rows to mock_eligible (reserved for a future Mock, not this one).';
  elsif v_already_promoted_count = 10 then
    raise notice 'Migration 210: all 10 Sail and Steam question rows already mock_eligible -- already applied. No changes made.';
  else
    raise exception 'Migration 210 refused (Sail and Steam questions): expected 10 independently_validated rows (found %), or 10 already mock_eligible (found %). Re-verify production state before proceeding.', v_pending_count, v_already_promoted_count;
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
    raise notice 'Migration 210: promoted the eng-inc002-sailandsteam (Sail and Steam) passage row.';
  elsif v_already_promoted_count = 1 then
    raise notice 'Migration 210: eng-inc002-sailandsteam passage row already mock_eligible -- already applied. No changes made.';
  else
    raise exception 'Migration 210 refused (Sail and Steam passage): expected 1 independently_validated row (found %), or already mock_eligible (found %). Re-verify production state before proceeding.', v_pending_count, v_already_promoted_count;
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
--      or id like 'eng-inc002-sailandsteam-%'
--   order by id;
