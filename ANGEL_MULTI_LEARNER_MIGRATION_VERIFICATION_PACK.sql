-- ANGEL 11+ -- MULTI-LEARNER MIGRATION 260: READ-ONLY VERIFICATION PACK
--
-- Run in Supabase Dashboard > SQL Editor, in three steps:
--   STEP 1 (BEFORE migration 260): run this whole file, save the output.
--   STEP 2: apply supabase/migrations/260_multi_learner_household_architecture.sql
--           (single transaction; any invariant failure rolls everything back).
--   STEP 3 (AFTER): run this whole file again and compare with STEP 1 using the
--           "EXPECTED" notes below.
--
-- Every statement is a SELECT. Nothing here writes. It reports COUNTS and
-- opaque ids only -- no names, no learner content -- so the output is safe to
-- share. No service-role key is needed; the SQL Editor runs as the project owner.

-- ------------------------------------------------------------------
-- 1. Account -> learner shape.
--    BEFORE: accounts_with_more_than_one_profile = 0 (the old UNIQUE constraint).
--    AFTER : identical numbers (nobody has a second learner until a parent adds one).
-- ------------------------------------------------------------------
select
  count(*)                                                    as profiles,
  count(*) filter (where auth_user_id is not null)            as owned_profiles,
  count(distinct auth_user_id)                                as distinct_owner_accounts,
  (select count(*) from (
     select auth_user_id from public.profiles
     where auth_user_id is not null
     group by auth_user_id having count(*) > 1) t)            as accounts_with_more_than_one_profile
from public.profiles;

-- ------------------------------------------------------------------
-- 2. Identity/ownership checksum of every existing profile.
--    EXPECTED: BEFORE and AFTER checksums are IDENTICAL.
--    (Covers id, owner, device id, pathway, is_admin -- proves no learner was
--    re-keyed, reassigned or altered.)
-- ------------------------------------------------------------------
select md5(string_agg(
         id::text || '|' || coalesce(auth_user_id::text, '') || '|' || device_id || '|' ||
         coalesce(selected_pathway_id, '') || '|' || is_admin::text, ',' order by id)) as profile_identity_checksum
from public.profiles;

-- ------------------------------------------------------------------
-- 3. Exact row count of EVERY table that references a learner
--    (profile_id / learner_id): attempts, presentations, mastery, competency
--    evidence, Educational Intelligence audit, Mock attempts/answers/reports,
--    Writing, focus selections, XP/streak, lesson progress, ...
--    EXPECTED: every count IDENTICAL BEFORE vs AFTER. (Compare the two outputs
--    line by line; migration 260 also asserts this itself and rolls back on any
--    difference.)
-- ------------------------------------------------------------------
select c.table_name,
       string_agg(distinct c.column_name, ',') as learner_column,
       (xpath('/row/c/text()',
              query_to_xml(format('select count(*) as c from public.%I', c.table_name), false, true, '')))[1]::text::bigint as row_count
from information_schema.columns c
join information_schema.tables t
  on t.table_schema = c.table_schema and t.table_name = c.table_name and t.table_type = 'BASE TABLE'
where c.table_schema = 'public' and c.column_name in ('profile_id', 'learner_id')
group by c.table_name
order by c.table_name;

-- ------------------------------------------------------------------
-- 4. Evidence per account (ids only, counts only). Use this to confirm that a
--    specific known account -- e.g. Family #1's -- still has all of its evidence
--    attached to its single learner. Compare BEFORE vs AFTER.
-- ------------------------------------------------------------------
select p.auth_user_id,
       p.id as learner_id,
       (select count(*) from public.lesson_progress          x where x.profile_id = p.id) as lesson_progress_rows,
       (select count(*) from public.ali_student_question_history x where x.profile_id = p.id) as question_history_rows,
       (select count(*) from public.ali_durable_mastery       x where x.profile_id = p.id) as durable_mastery_rows,
       (select count(*) from public.ali_mock_attempt          x where x.profile_id = p.id) as mock_attempt_rows,
       (select coalesce(sum(total_xp), 0) from public.user_stats x where x.profile_id = p.id) as total_xp
from public.profiles p
where p.auth_user_id is not null
order by p.created_at, p.id;

-- ------------------------------------------------------------------
-- 5. Security gap check (the pre-existing is_admin self-write gap).
--    BEFORE: is_admin_updatable_by_clients = true is EXPECTED to be true IF the gap
--            exists in production (this is what the migration closes).
--    AFTER : both columns MUST be false.
-- ------------------------------------------------------------------
select
  has_column_privilege('authenticated', 'public.profiles', 'is_admin',     'UPDATE') as is_admin_updatable_by_clients,
  has_column_privilege('authenticated', 'public.profiles', 'auth_user_id', 'UPDATE') as owner_updatable_by_clients,
  has_column_privilege('authenticated', 'public.profiles', 'selected_pathway_id', 'UPDATE') as pathway_updatable_by_clients_expected_true;

-- ------------------------------------------------------------------
-- 6. Learner-resolving functions.
--    BEFORE: functions_still_resolving_learner_by_account = 23 (approx.; the exact
--            number is whatever production has).
--    AFTER : MUST be 0, and functions_using_active_learner_resolution should equal
--            the BEFORE number (each was rewritten to current_learner_id()).
-- ------------------------------------------------------------------
select
  (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.prokind = 'f'
      and p.proname not in ('is_current_user_admin', 'current_learner_id', 'current_account_default_learner_id')
      and p.prosrc ~* 'from\s+public\.profiles\s+where\s+auth_user_id\s*=\s*auth\.uid\(\)') as functions_still_resolving_learner_by_account,
  (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public' and p.prokind = 'f'
      and p.proname not in ('current_learner_id', 'current_account_default_learner_id', 'create_learner')
      and (p.prosrc like '%current_learner_id()%' or p.prosrc like '%current_account_default_learner_id()%')) as functions_using_active_learner_resolution;

-- ------------------------------------------------------------------
-- 7. Structural facts.
--    BEFORE: profiles_auth_user_id_key_exists = true ; ownership_guard_trigger = false
--    AFTER : profiles_auth_user_id_key_exists = false; ownership_guard_trigger = true;
--            create_learner / current_learner_id present; new columns present.
-- ------------------------------------------------------------------
select
  exists (select 1 from pg_constraint where conname = 'profiles_auth_user_id_key')                           as profiles_auth_user_id_key_exists,
  exists (select 1 from pg_trigger where tgname = 'profiles_guard_learner_ownership' and not tgisinternal)   as ownership_guard_trigger,
  exists (select 1 from pg_proc where proname = 'create_learner')                                            as create_learner_present,
  exists (select 1 from pg_proc where proname = 'current_learner_id')                                        as current_learner_id_present,
  (select count(*) from information_schema.columns
    where table_schema = 'public' and table_name = 'profiles'
      and column_name in ('learner_name', 'target_exam_date', 'target_exam_date_provenance', 'school_year')) as new_columns_present_expect_4_after;

-- ------------------------------------------------------------------
-- 8. RLS still enabled on the learner-owned tables (must be true BEFORE and AFTER).
-- ------------------------------------------------------------------
select c.relname as table_name, c.relrowsecurity as rls_enabled
from pg_class c join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in ('profiles', 'ali_student_question_history', 'ali_durable_mastery',
                    'ali_student_adaptive_state', 'ali_mock_attempt', 'ali_family_focus_selection',
                    'user_stats', 'lesson_progress')
order by c.relname;
