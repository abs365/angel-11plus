-- ANGEL 11+ -- MULTI-LEARNER MIGRATION 260: READ-ONLY PREFLIGHT / VERIFICATION (ONE RESULT)
--
-- HOW TO USE (Supabase Dashboard > SQL Editor > New query, production project)
--   1. Paste this WHOLE file, click Run. It returns ONE cell named  preflight_result  (JSON).
--   2. Copy that single cell and send it back. That is all. (Nothing to replace, no placeholders.)
--   3. Run it once BEFORE migration 260 (phase = BEFORE) and once AFTER (phase = AFTER).
--
-- READ-ONLY: this is a single SELECT. It writes nothing, deletes nothing, creates no learner evidence,
-- and cannot apply migration 260 or touch Family #1. Output contains counts, table/function NAMES and
-- PASS/WARN/FAIL only: no emails, names, tokens, secrets or learner content.
--
-- overall = FAIL       -> do NOT authorise/continue; report the failing checks.
-- overall = PASS_WITH_WARNINGS -> read the WARN details; a WARN BEFORE is often expected (see each detail).
-- overall = PASS       -> nothing to flag.

with
learner_tables as (
  select distinct c.table_name
  from information_schema.columns c
  join information_schema.tables t
    on t.table_schema = c.table_schema and t.table_name = c.table_name and t.table_type = 'BASE TABLE'
  where c.table_schema = 'public' and c.column_name in ('profile_id', 'learner_id')
),
counts as (
  select table_name,
         (xpath('/row/c/text()', query_to_xml(format('select count(*) as c from public.%I', table_name), false, true, '')))[1]::text::bigint as n
  from learner_tables
),
rls as (
  select c.relname as table_name, c.relrowsecurity as rls_enabled
  from pg_class c join pg_namespace n on n.oid = c.relnamespace
  where n.nspname = 'public'
    and c.relkind = 'r'
    and (c.relname = 'profiles' or c.relname in (select table_name from learner_tables))
),
resolvers as (
  select p.proname
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.prokind = 'f'
    and p.proname not in ('is_current_user_admin', 'current_learner_id', 'current_account_default_learner_id')
    and p.prosrc ~* 'from\s+public\.profiles\s+where\s+auth_user_id\s*=\s*auth\.uid\(\)'
),
rewritten as (
  select p.proname
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
  where n.nspname = 'public' and p.prokind = 'f'
    and p.proname not in ('current_learner_id', 'current_account_default_learner_id', 'create_learner')
    and (p.prosrc like '%current_learner_id()%' or p.prosrc like '%current_account_default_learner_id()%')
),
required_tables as (
  select t.name, (to_regclass('public.' || t.name) is not null) as present
  from (values ('profiles'), ('user_stats'), ('lesson_progress'), ('ali_student_adaptive_state'),
               ('ali_student_question_history'), ('ali_durable_mastery'), ('ali_educational_audit'),
               ('ali_mock_attempt'), ('ali_family_focus_selection')) as t(name)
),
f as (
  select
    exists (select 1 from pg_trigger where tgname = 'profiles_guard_learner_ownership' and not tgisinternal) as guard_trigger,
    exists (select 1 from pg_constraint where conname = 'profiles_auth_user_id_key')                          as unique_constraint,
    exists (select 1 from pg_proc where proname = 'create_learner')                                           as create_learner_fn,
    exists (select 1 from pg_proc where proname = 'current_learner_id')                                       as current_learner_fn,
    (select count(*) from public.profiles)                                                                    as profiles,
    (select count(*) from public.profiles where auth_user_id is not null)                                     as owned_profiles,
    (select count(distinct auth_user_id) from public.profiles)                                                as owner_accounts,
    (select count(*) from (select auth_user_id from public.profiles where auth_user_id is not null
                           group by auth_user_id having count(*) > 1) x)                                      as accounts_with_multiple_learners,
    (select count(*) from public.profiles p join auth.users u on u.id = p.auth_user_id where u.is_anonymous)  as anonymous_owned_profiles,
    (select count(*) from public.profiles p join auth.users u on u.id = p.auth_user_id where not u.is_anonymous) as permanent_owned_profiles,
    (select count(*) from public.profiles where auth_user_id is null)                                         as unowned_profiles,
    (select count(*) from public.profiles where is_admin)                                                     as admin_profiles,
    (select md5(coalesce(string_agg(id::text || '|' || coalesce(auth_user_id::text, '') || '|' || device_id || '|' ||
                                    coalesce(selected_pathway_id, '') || '|' || is_admin::text, ',' order by id), 'empty'))
       from public.profiles)                                                                                  as profile_identity_checksum,
    (select coalesce(sum(n), 0) from counts)                                                                  as evidence_rows_total,
    (select md5(coalesce(string_agg(table_name || ':' || n, ',' order by table_name), 'empty')) from counts)  as evidence_fingerprint,
    (select count(*) from counts)                                                                             as evidence_tables,
    (select count(*) from resolvers)                                                                          as old_resolver_functions,
    (select count(*) from rewritten)                                                                          as rewritten_functions,
    has_column_privilege('authenticated', 'public.profiles', 'is_admin', 'UPDATE')                            as authenticated_can_update_is_admin,
    has_column_privilege('authenticated', 'public.profiles', 'auth_user_id', 'UPDATE')                        as authenticated_can_update_auth_user_id,
    has_column_privilege('authenticated', 'public.profiles', 'selected_pathway_id', 'UPDATE')                 as authenticated_can_update_pathway,
    (select count(*) from information_schema.columns where table_schema = 'public' and table_name = 'profiles'
        and column_name in ('learner_name', 'target_exam_date', 'target_exam_date_provenance', 'school_year')) as new_profile_columns,
    (select count(*) from rls where not rls_enabled)                                                          as learner_tables_without_rls,
    (select coalesce(jsonb_agg(table_name order by table_name), '[]'::jsonb) from rls where not rls_enabled)  as learner_tables_without_rls_names,
    (select count(*) from required_tables where not present)                                                  as missing_required_tables,
    (select coalesce(jsonb_agg(name order by name), '[]'::jsonb) from required_tables where not present)      as missing_required_table_names,
    (select coalesce(jsonb_agg(proname order by proname), '[]'::jsonb) from resolvers)                        as old_resolver_names,
    (select count(*) from pg_proc where proname = 'claim_legacy_profile'
        and prosrc like '%ali_educational_audit%')                                                            as claim_fn_has_evidence_guards,
    (select count(*) from pg_proc where proname = 'is_current_user_admin')                                    as admin_fn_present,
    (select count(*) from pg_proc p join pg_namespace n on n.oid = p.pronamespace
       where n.nspname = 'auth' and p.proname = 'uid')                                                        as auth_uid_present,
    (select count(*) from pg_roles where rolname in ('authenticated', 'anon', 'service_role'))                as supabase_roles_present,
    (select count(*) from information_schema.columns where table_schema = 'public' and table_name = 'profiles'
        and column_name in ('selected_pathway_id', 'pathway_selected_at', 'is_admin', 'auth_user_id', 'device_id')) as required_profile_columns
),
checks as (
  select jsonb_build_array(
    jsonb_build_object('check', 'phase', 'status', 'INFO',
      'detail', case when guard_trigger and not unique_constraint then 'AFTER: migration 260 appears applied'
                     when unique_constraint and not guard_trigger then 'BEFORE: migration 260 not applied'
                     else 'MIXED: unexpected partially-applied state' end),
    jsonb_build_object('check', 'not_partially_applied', 'status',
      case when (guard_trigger and not unique_constraint) or (unique_constraint and not guard_trigger) then 'PASS' else 'FAIL' end,
      'detail', 'unique_constraint=' || unique_constraint || ', guard_trigger=' || guard_trigger),
    jsonb_build_object('check', 'required_tables_present', 'status', case when missing_required_tables = 0 then 'PASS' else 'FAIL' end,
      'detail', case when missing_required_tables = 0 then 'all present' else missing_required_table_names::text end),
    jsonb_build_object('check', 'required_profile_columns_present', 'status', case when required_profile_columns = 5 then 'PASS' else 'FAIL' end,
      'detail', required_profile_columns || ' of 5'),
    jsonb_build_object('check', 'supabase_auth_prerequisites', 'status',
      case when auth_uid_present >= 1 and supabase_roles_present = 3 and admin_fn_present >= 1 then 'PASS' else 'FAIL' end,
      'detail', 'auth.uid=' || auth_uid_present || ', roles=' || supabase_roles_present || '/3, is_current_user_admin=' || admin_fn_present),
    jsonb_build_object('check', 'one_learner_per_account_before', 'status',
      case when guard_trigger then 'PASS' when accounts_with_multiple_learners = 0 then 'PASS' else 'FAIL' end,
      'detail', 'accounts_with_multiple_learners=' || accounts_with_multiple_learners || ' (must be 0 BEFORE the migration)'),
    jsonb_build_object('check', 'claim_function_has_migration_188_guards', 'status', case when claim_fn_has_evidence_guards >= 1 then 'PASS' else 'WARN' end,
      'detail', case when claim_fn_has_evidence_guards >= 1 then 'evidence-safety guards present' else 'migration 188 guards not found; 260 restates them, so review before proceeding' end),
    jsonb_build_object('check', 'legacy_learner_resolvers', 'status',
      case when guard_trigger then case when old_resolver_functions = 0 then 'PASS' else 'FAIL' end
           else case when old_resolver_functions > 0 then 'PASS' else 'WARN' end end,
      'detail', case when guard_trigger then old_resolver_functions || ' functions still pick a learner by account (must be 0 AFTER); rewritten=' || rewritten_functions
                     else old_resolver_functions || ' functions will be rewritten by 260' || case when old_resolver_functions = 0 then ' (WARN: expected some; review)' else '' end end),
    jsonb_build_object('check', 'is_admin_and_owner_not_client_writable', 'status',
      case when guard_trigger then case when authenticated_can_update_is_admin or authenticated_can_update_auth_user_id then 'FAIL' else 'PASS' end
           else case when authenticated_can_update_is_admin then 'WARN' else 'PASS' end end,
      'detail', 'authenticated can UPDATE is_admin=' || authenticated_can_update_is_admin || ', auth_user_id=' || authenticated_can_update_auth_user_id ||
                case when not guard_trigger and authenticated_can_update_is_admin then ' (BEFORE: the known gap that 260 closes; must be false AFTER)' else '' end),
    jsonb_build_object('check', 'legitimate_client_update_kept', 'status', case when authenticated_can_update_pathway then 'PASS' else 'FAIL' end,
      'detail', 'authenticated can UPDATE selected_pathway_id=' || authenticated_can_update_pathway),
    jsonb_build_object('check', 'learner_tables_have_rls', 'status', case when learner_tables_without_rls = 0 then 'PASS' else 'WARN' end,
      'detail', case when learner_tables_without_rls = 0 then 'RLS enabled on profiles and every learner-keyed table' else 'RLS DISABLED on: ' || learner_tables_without_rls_names::text end),
    jsonb_build_object('check', 'new_columns_and_functions', 'status',
      case when guard_trigger then case when new_profile_columns = 4 and create_learner_fn and current_learner_fn then 'PASS' else 'FAIL' end else 'PASS' end,
      'detail', 'new_columns=' || new_profile_columns || '/4, create_learner=' || create_learner_fn || ', current_learner_id=' || current_learner_fn)
  ) as arr
  from f
)
select jsonb_pretty(jsonb_build_object(
  'overall',
    case when exists (select 1 from checks, jsonb_array_elements(arr) e where e->>'status' = 'FAIL') then 'FAIL'
         when exists (select 1 from checks, jsonb_array_elements(arr) e where e->>'status' = 'WARN') then 'PASS_WITH_WARNINGS'
         else 'PASS' end,
  'phase', case when f.guard_trigger and not f.unique_constraint then 'AFTER' else 'BEFORE' end,
  'checks', (select arr from checks),
  'account_counts', jsonb_build_object(
    'profiles_learners',           f.profiles,
    'owned',                       f.owned_profiles,
    'unowned',                     f.unowned_profiles,
    'owner_accounts',              f.owner_accounts,
    'accounts_with_multiple_learners', f.accounts_with_multiple_learners,
    'anonymous_owned',             f.anonymous_owned_profiles,
    'permanent_owned',             f.permanent_owned_profiles,
    'admin_profiles',              f.admin_profiles),
  'invariants_compare_BEFORE_vs_AFTER', jsonb_build_object(
    'profile_identity_checksum',   f.profile_identity_checksum,
    'evidence_tables',             f.evidence_tables,
    'evidence_rows_total',         f.evidence_rows_total,
    'evidence_fingerprint',        f.evidence_fingerprint,
    'how_to_read', 'profile_identity_checksum MUST be identical BEFORE vs AFTER. Evidence counts can only stay equal or INCREASE if learners used the app in between (never decrease); the migration also asserts exact equality itself inside its transaction.'),
  'evidence_rows_per_table', (select coalesce(jsonb_object_agg(table_name, n order by table_name), '{}'::jsonb) from counts),
  'rls_by_table', (select coalesce(jsonb_object_agg(table_name, rls_enabled order by table_name), '{}'::jsonb) from rls),
  'legacy_resolver_functions', f.old_resolver_names,
  'column_privileges_for_authenticated', jsonb_build_object(
    'is_admin_update',             f.authenticated_can_update_is_admin,
    'auth_user_id_update',         f.authenticated_can_update_auth_user_id,
    'selected_pathway_id_update',  f.authenticated_can_update_pathway)
)) as preflight_result
from f;
