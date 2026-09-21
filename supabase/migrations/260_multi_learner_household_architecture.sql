-- 260_multi_learner_household_architecture.sql
--
-- WAVE 0 FAMILY ARCHITECTURE CORRECTION -- one parent account, many learners.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query (this repo's standing
-- Founder-applied-migration convention). Single transaction: any invariant
-- failure below RAISEs and the whole migration rolls back, leaving
-- production exactly as it was.
--
-- WHAT THIS DOES
--   Before: one auth user -> exactly one `profiles` row (UNIQUE auth_user_id),
--   and `profiles.id` meant BOTH "the account" and "the learner".
--   After:  one auth user (the parent/family account) -> N `profiles` rows,
--   where each row IS a learner. `profiles.id` remains the stable learner id
--   that every one of the ~30 evidence tables already keys on
--   (profile_id / learner_id), so NO evidence row moves, is copied, rewritten
--   or re-keyed. The existing profile of every current account simply becomes
--   that account's first learner, automatically.
--
-- WHY THIS SHAPE (smallest robust change)
--   * Every evidence table's RLS already reads
--       exists (select 1 from profiles p where p.id = profile_id
--                and p.auth_user_id = auth.uid())
--     which is a correct ACCOUNT-ownership test for N learners as-is.
--     Parent A can never read Parent B's learners or their evidence.
--   * The one thing that breaks with N learners is the 38 SECURITY DEFINER
--     functions that resolve "the current learner" with
--       select id into v_profile_id from public.profiles
--        where auth_user_id = auth.uid();
--     With two rows that silently picks an arbitrary learner -- exactly the
--     cross-child contamination this work must prevent. Step 5 rewrites them
--     to public.current_learner_id(), which fails CLOSED.
--
-- ACTIVE LEARNER (never trusted from the browser without validation)
--   The client names its active learner in the request header
--   `x-angel-learner-id`. current_learner_id() reads it via PostgREST's
--   request.headers setting and VALIDATES ownership
--   (profiles.id = header AND profiles.auth_user_id = auth.uid()):
--     * header present + owned      -> that learner
--     * header present + not owned  -> RAISE angel_learner_not_owned (never
--                                      falls back to another learner)
--     * header absent + 1 learner   -> that learner (old clients keep working)
--     * header absent + >1 learners -> RAISE angel_learner_required
--     * no learners                 -> NULL (identical to the old no-row case)
--   Per-request (not a server-side "current child" flag), so two devices or
--   two tabs on different children can never flip each other's context.
--
-- BACKWARD COMPATIBILITY / SAFE ORDER
--   Apply this migration BEFORE deploying the new client. Until an account
--   actually adds a second learner (only possible through the new client's
--   create_learner RPC), every account has exactly one learner and the
--   currently deployed client behaves identically.
--
-- ADDITIONAL LEARNERS ONLY VIA GOVERNED RPC
--   The UNIQUE(auth_user_id) constraint is replaced by a trigger with the
--   same effect for direct INSERT/UPDATE (same constraint name and 23505
--   code, so the deployed client's race handling still converges), and a
--   second learner can only be created by public.create_learner(), which
--   validates the caller, refuses anonymous sessions, caps the count, and
--   validates the name/pathway.
--
-- PRE-EXISTING GAPS CLOSED WHILE HERE (found by test, not assumed)
--   1. profiles_insert_own let any authenticated user INSERT their own row
--      with is_admin = true. The trigger now forces is_admin = false on
--      client-role inserts.
--   2. Migration 008's column-level `revoke update (is_admin)` was
--      ineffective under Supabase's table-level default grants, so a user
--      could UPDATE their own is_admin. Section 2b replaces the table-level
--      UPDATE grant with explicit safe column grants.
--   Both are exercised by tests/supabase/migration260MultiLearner.test.ts.
--   Production status of gap 2 is confirmed by the read-only check in the
--   verification pack (has_column_privilege).
--
-- PRIVACY (Founder decision, this Wave): learner_name holds a parent-entered
--   FIRST NAME OR NICKNAME only, so a parent can tell their children apart.
--   Nothing else identifying is collected. See ANGEL_LR01_DPIA... amendment.

begin;

-- ============================================================
-- 0. Pre-migration invariant snapshot (dropped at commit)
-- ============================================================
create temp table _ml_snapshot (k text primary key, v text not null) on commit drop;

insert into _ml_snapshot
select 'profiles.identity_checksum',
       coalesce(md5(string_agg(
         id::text || '|' || coalesce(auth_user_id::text,'') || '|' || device_id || '|' ||
         coalesce(selected_pathway_id,'') || '|' || is_admin::text, ',' order by id)), 'empty')
from public.profiles;

do $$
declare
  r record;
  n bigint;
begin
  -- Every public table that carries a learner reference, counted exactly.
  for r in
    select distinct c.table_name, c.column_name
    from information_schema.columns c
    join information_schema.tables t
      on t.table_schema = c.table_schema and t.table_name = c.table_name and t.table_type = 'BASE TABLE'
    where c.table_schema = 'public'
      and c.column_name in ('profile_id', 'learner_id')
  loop
    execute format('select count(*) from public.%I', r.table_name) into n;
    insert into _ml_snapshot values ('rows:' || r.table_name || '.' || r.column_name, n::text);
  end loop;
  select count(*) into n from public.profiles;
  insert into _ml_snapshot values ('rows:profiles', n::text);
  select count(distinct auth_user_id) into n from public.profiles;
  insert into _ml_snapshot values ('distinct_owner_accounts', n::text);
end $$;

-- ============================================================
-- 1. Learner columns (all nullable; existing rows unchanged)
-- ============================================================
alter table public.profiles
  add column if not exists learner_name text,
  add column if not exists target_exam_date date,
  add column if not exists target_exam_date_provenance text,
  add column if not exists school_year text;

alter table public.profiles drop constraint if exists profiles_learner_name_check;
alter table public.profiles add constraint profiles_learner_name_check
  check (learner_name is null
         or (char_length(btrim(learner_name)) between 1 and 40 and learner_name !~ '[[:cntrl:]]'));

alter table public.profiles drop constraint if exists profiles_target_exam_date_provenance_check;
alter table public.profiles add constraint profiles_target_exam_date_provenance_check
  check (target_exam_date_provenance is null
         or target_exam_date_provenance in ('official', 'parent_supplied', 'estimated', 'unknown'));

alter table public.profiles drop constraint if exists profiles_school_year_check;
alter table public.profiles add constraint profiles_school_year_check
  check (school_year is null or school_year in ('Year 4', 'Year 5', 'Year 6'));

comment on column public.profiles.learner_name is
  'Parent-entered FIRST NAME OR NICKNAME only (max 40 chars). Purpose: let a parent tell their children apart and switch between them. Never a surname, DOB, school, address or contact detail. Nullable.';
comment on column public.profiles.target_exam_date is
  'Parent-supplied target exam date for THIS learner (previously device-wide localStorage). Nullable.';
comment on column public.profiles.school_year is
  'Parent-supplied school year for THIS learner (Year 4 | Year 5 | Year 6). Nullable.';

-- ============================================================
-- 2. UNIQUE(auth_user_id) -> governed learner-creation path
-- ============================================================
alter table public.profiles drop constraint if exists profiles_auth_user_id_key;

create or replace function public.profiles_guard_learner_ownership()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  -- Client roles can never mint an admin row (see header note).
  if tg_op = 'INSERT' and coalesce(auth.role(), '') in ('authenticated', 'anon') then
    new.is_admin := false;
  end if;

  if new.auth_user_id is not null
     and (tg_op = 'INSERT' or new.auth_user_id is distinct from old.auth_user_id) then
    -- Serialise per account so two concurrent first-inserts cannot both pass.
    perform pg_advisory_xact_lock(hashtextextended('angel_learner_owner:' || new.auth_user_id::text, 0));
    if coalesce(current_setting('angel.learner_creation_via_rpc', true), '') <> 'on'
       and exists (
         select 1 from public.profiles o
         where o.auth_user_id = new.auth_user_id and o.id is distinct from new.id
       ) then
      -- Same name/code as the dropped constraint, so the deployed client's
      -- profiles_auth_user_id_key race handling keeps converging.
      raise exception using
        errcode = '23505',
        message = 'duplicate key value violates unique constraint "profiles_auth_user_id_key"',
        detail  = 'Additional learners can only be created with create_learner().',
        constraint = 'profiles_auth_user_id_key';
    end if;
  end if;
  return new;
end;
$$;

drop trigger if exists profiles_guard_learner_ownership on public.profiles;
create trigger profiles_guard_learner_ownership
  before insert or update of auth_user_id on public.profiles
  for each row execute function public.profiles_guard_learner_ownership();

-- ============================================================
-- 2b. Close the is_admin / ownership self-write gap.
--     Migration 008's `revoke update (is_admin)` is a COLUMN-level revoke;
--     it has no effect while a TABLE-level UPDATE grant exists, and
--     Supabase's default privileges grant ALL on public tables to
--     authenticated. Reproduced in test: an authenticated user could
--     `update profiles set is_admin = true` on their own row. Replace the
--     table-level grant with explicit column grants covering only what
--     clients legitimately write. is_admin, auth_user_id, device_id, id and
--     created_at are no longer client-writable (claim_legacy_profile() and
--     the triggers are SECURITY DEFINER and are unaffected).
-- ============================================================
revoke update on public.profiles from authenticated, anon;
grant update (name, selected_pathway_id, pathway_selected_at,
              learner_name, target_exam_date, target_exam_date_provenance, school_year)
  on public.profiles to authenticated;

-- ============================================================
-- 3. Active-learner resolution (ownership validated in the database)
-- ============================================================
create or replace function public.current_account_default_learner_id()
returns uuid
language sql
stable
security definer
set search_path = public
as $$
  select id from public.profiles
  where auth_user_id = auth.uid()
  order by created_at asc, id asc
  limit 1
$$;

create or replace function public.current_learner_id()
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_raw   text;
  v_hdr   uuid;
  v_id    uuid;
  v_count int;
begin
  if v_uid is null then
    return null;
  end if;

  begin
    v_raw := nullif(btrim(coalesce(
      (nullif(current_setting('request.headers', true), '')::json) ->> 'x-angel-learner-id', '')), '');
  exception when others then
    v_raw := null;
  end;

  if v_raw is not null then
    begin
      v_hdr := v_raw::uuid;
    exception when invalid_text_representation then
      raise exception 'angel_learner_not_owned';
    end;
    select id into v_id from public.profiles where id = v_hdr and auth_user_id = v_uid;
    if v_id is null then
      raise exception 'angel_learner_not_owned';
    end if;
    return v_id;
  end if;

  select count(*) into v_count from public.profiles where auth_user_id = v_uid;
  if v_count = 0 then
    return null;
  elsif v_count = 1 then
    select id into v_id from public.profiles where auth_user_id = v_uid;
    return v_id;
  end if;
  raise exception 'angel_learner_required';
end;
$$;

revoke execute on function public.current_learner_id() from public;
grant execute on function public.current_learner_id() to authenticated;
revoke execute on function public.current_account_default_learner_id() from public;
grant execute on function public.current_account_default_learner_id() to authenticated;

-- ============================================================
-- 4. Governed add-learner RPC
-- ============================================================
create or replace function public.create_learner(
  p_learner_name text,
  p_pathway_id   text default null
)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_name  text := btrim(coalesce(p_learner_name, ''));
  v_count int;
  v_id    uuid;
begin
  if v_uid is null then
    raise exception 'angel_not_authenticated';
  end if;
  if coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) then
    raise exception 'angel_add_learner_requires_account';
  end if;
  if char_length(v_name) not between 1 and 40 or v_name ~ '[[:cntrl:]]' then
    raise exception 'angel_invalid_learner_name';
  end if;
  if p_pathway_id is not null
     and p_pathway_id not in ('gl', 'cem', 'csse', 'iseb', 'independent', 'core-foundation', 'not-sure') then
    raise exception 'angel_invalid_pathway';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('angel_learner_owner:' || v_uid::text, 0));
  select count(*) into v_count from public.profiles where auth_user_id = v_uid;
  if v_count >= 8 then
    raise exception 'angel_learner_limit';
  end if;

  perform set_config('angel.learner_creation_via_rpc', 'on', true);
  insert into public.profiles (auth_user_id, device_id, learner_name, selected_pathway_id, pathway_selected_at)
  values (v_uid, gen_random_uuid()::text, v_name, p_pathway_id,
          case when p_pathway_id is null then null else now() end)
  returning id into v_id;
  perform set_config('angel.learner_creation_via_rpc', 'off', true);

  return v_id;
end;
$$;

revoke execute on function public.create_learner(text, text) from public;
grant execute on function public.create_learner(text, text) to authenticated;

-- ============================================================
-- 5. Rewrite every function that resolved "the" learner by account
--    (rewrites the LIVE definitions, so it is correct regardless of which
--    earlier migration last defined each function). Fails closed: if any
--    function still contains the single-row pattern afterwards, RAISE.
-- ============================================================
do $$
declare
  r         record;
  v_new     text;
  v_count   int := 0;
  v_pattern constant text := 'from\s+public\.profiles\s+where\s+auth_user_id\s*=\s*auth\.uid\(\)';
begin
  for r in
    select p.oid, p.proname, pg_get_functiondef(p.oid) as def
    from pg_proc p
    join pg_namespace n on n.oid = p.pronamespace
    where n.nspname = 'public'
      and p.prokind = 'f'
      and p.proname not in ('is_current_user_admin', 'current_learner_id', 'current_account_default_learner_id')
      and p.prosrc ~* v_pattern
    order by p.proname
  loop
    v_new := regexp_replace(
      r.def,
      'select\s+id\s+into\s+(v_profile_id)\s+' || v_pattern || '\s*;',
      E'\\1 := public.current_learner_id();', 'gi');
    v_new := regexp_replace(
      v_new,
      'select\s+id\s+into\s+(v_marker_profile_id|v_reviewer_profile_id|v_reviewer_id)\s+' || v_pattern || '\s*;',
      E'\\1 := public.current_account_default_learner_id();', 'gi');

    if v_new ~* v_pattern then
      raise exception 'Migration 260 refused: function public.% still resolves a learner by account after rewrite; unhandled pattern.', r.proname;
    end if;
    if v_new = r.def then
      raise exception 'Migration 260 refused: function public.% matched but was not rewritten.', r.proname;
    end if;

    execute v_new;
    v_count := v_count + 1;
    raise notice 'migration 260: rewrote public.%', r.proname;
  end loop;
  raise notice 'migration 260: % function(s) rewritten', v_count;
end $$;

-- ============================================================
-- 6. Anonymous-upgrade safety: claim_legacy_profile() must never attach a
--    second (device) learner to an account that already owns one.
--    Body otherwise identical to migration 188.
-- ============================================================
create or replace function public.claim_legacy_profile(p_device_id text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_profile_id uuid;
begin
  if v_uid is null then
    return null;
  end if;

  perform pg_advisory_xact_lock(hashtextextended('angel_learner_owner:' || v_uid::text, 0));

  -- New in 260: an account that already has a learner never claims another.
  if exists (select 1 from public.profiles o where o.auth_user_id = v_uid) then
    return null;
  end if;

  update public.profiles
  set auth_user_id = v_uid
  where device_id = p_device_id
    and auth_user_id is null
    and not exists (
      select 1 from public.user_stats us
      where us.profile_id = profiles.id and us.total_xp > 0
    )
    and not exists (
      select 1 from public.lesson_progress lp
      where lp.profile_id = profiles.id
    )
    and not exists (
      select 1 from public.ali_student_adaptive_state s
      where s.profile_id = profiles.id and s.questions_presented_count > 0
    )
    and not exists (
      select 1 from public.ali_student_question_history h
      where h.profile_id = profiles.id
    )
    and not exists (
      select 1 from public.ali_durable_mastery m
      where m.profile_id = profiles.id
    )
    and not exists (
      select 1 from public.ali_educational_audit a
      where a.learner_id = profiles.id
    )
  returning id into v_profile_id;

  return v_profile_id;
end;
$$;

revoke execute on function public.claim_legacy_profile(text) from public;
grant execute on function public.claim_legacy_profile(text) to authenticated;

-- ============================================================
-- 7. Post-migration invariants (any mismatch aborts + rolls back)
-- ============================================================
do $$
declare
  r record;
  n bigint;
  v_before text;
  v_after  text;
  v_leftover int;
begin
  -- Identity + ownership of every existing profile is byte-for-byte unchanged.
  select v into v_before from _ml_snapshot where k = 'profiles.identity_checksum';
  select coalesce(md5(string_agg(
           id::text || '|' || coalesce(auth_user_id::text,'') || '|' || device_id || '|' ||
           coalesce(selected_pathway_id,'') || '|' || is_admin::text, ',' order by id)), 'empty')
    into v_after from public.profiles;
  if v_before is distinct from v_after then
    raise exception 'Migration 260 invariant failed: profile identity/ownership checksum changed.';
  end if;

  -- Every learner-keyed table has exactly the same row count as before.
  for r in select k, v from _ml_snapshot where k like 'rows:%' and k <> 'rows:profiles' loop
    execute format('select count(*) from public.%I',
                   split_part(substr(r.k, 6), '.', 1)) into n;
    if n::text <> r.v then
      raise exception 'Migration 260 invariant failed: % changed from % to %.', r.k, r.v, n;
    end if;
  end loop;

  select count(*) into n from public.profiles;
  if n::text <> (select v from _ml_snapshot where k = 'rows:profiles') then
    raise exception 'Migration 260 invariant failed: profiles row count changed.';
  end if;
  select count(distinct auth_user_id) into n from public.profiles;
  if n::text <> (select v from _ml_snapshot where k = 'distinct_owner_accounts') then
    raise exception 'Migration 260 invariant failed: distinct owner account count changed.';
  end if;

  -- No function may still resolve a learner by account (except the admin check).
  select count(*) into v_leftover
  from pg_proc p join pg_namespace ns on ns.oid = p.pronamespace
  where ns.nspname = 'public' and p.prokind = 'f'
    and p.proname not in ('is_current_user_admin', 'current_learner_id', 'current_account_default_learner_id')
    and p.prosrc ~* 'from\s+public\.profiles\s+where\s+auth_user_id\s*=\s*auth\.uid\(\)';
  if v_leftover <> 0 then
    raise exception 'Migration 260 invariant failed: % function(s) still resolve a learner by account.', v_leftover;
  end if;

  -- Uniqueness really is gone, and the guard really is installed.
  if exists (select 1 from pg_constraint where conname = 'profiles_auth_user_id_key') then
    raise exception 'Migration 260 invariant failed: profiles_auth_user_id_key still present.';
  end if;
  if not exists (select 1 from pg_trigger where tgname = 'profiles_guard_learner_ownership' and not tgisinternal) then
    raise exception 'Migration 260 invariant failed: ownership guard trigger missing.';
  end if;

  -- Clients can no longer write privileged/ownership columns.
  if has_column_privilege('authenticated', 'public.profiles', 'is_admin', 'UPDATE')
     or has_column_privilege('authenticated', 'public.profiles', 'auth_user_id', 'UPDATE') then
    raise exception 'Migration 260 invariant failed: authenticated can still UPDATE is_admin/auth_user_id.';
  end if;
  if not has_column_privilege('authenticated', 'public.profiles', 'selected_pathway_id', 'UPDATE') then
    raise exception 'Migration 260 invariant failed: authenticated lost UPDATE on selected_pathway_id.';
  end if;
end $$;

commit;

-- ============================================================
-- ROLLBACK (manual only, never executed automatically).
-- Safe ONLY while no account owns more than one learner; the first block
-- refuses otherwise so a rollback can never merge or drop a real learner.
-- ============================================================
-- begin;
-- do $$ begin
--   if exists (select 1 from public.profiles where auth_user_id is not null
--              group by auth_user_id having count(*) > 1) then
--     raise exception 'Rollback refused: at least one account owns multiple learners.';
--   end if;
-- end $$;
-- -- Inverse function rewrite:
-- do $$
-- declare r record; v_new text;
-- begin
--   for r in select p.oid, pg_get_functiondef(p.oid) as def from pg_proc p
--            join pg_namespace n on n.oid = p.pronamespace
--            where n.nspname = 'public' and p.prokind = 'f'
--              and (p.prosrc ~ 'public\.current_learner_id\(\)' or p.prosrc ~ 'public\.current_account_default_learner_id\(\)')
--              and p.proname not in ('current_learner_id','current_account_default_learner_id','create_learner')
--   loop
--     v_new := regexp_replace(r.def, '(v_profile_id) := public\.current_learner_id\(\);',
--       E'select id into \\1 from public.profiles where auth_user_id = auth.uid();', 'g');
--     v_new := regexp_replace(v_new, '(v_marker_profile_id|v_reviewer_profile_id|v_reviewer_id) := public\.current_account_default_learner_id\(\);',
--       E'select id into \\1 from public.profiles where auth_user_id = auth.uid();', 'g');
--     execute v_new;
--   end loop;
-- end $$;
-- drop trigger if exists profiles_guard_learner_ownership on public.profiles;
-- drop function if exists public.profiles_guard_learner_ownership();
-- alter table public.profiles add constraint profiles_auth_user_id_key unique (auth_user_id);
-- grant update on public.profiles to authenticated;  -- restores the pre-260 (over-broad) table grant
-- drop function if exists public.create_learner(text, text);
-- drop function if exists public.current_learner_id();
-- drop function if exists public.current_account_default_learner_id();
-- -- Restore migration 188's claim_legacy_profile() body from that file.
-- -- New columns are additive and harmless; drop only if desired:
-- -- alter table public.profiles drop column learner_name, drop column target_exam_date,
-- --   drop column target_exam_date_provenance, drop column school_year;
-- commit;
