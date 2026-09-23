-- 263_learner_pin.sql
--
-- PRIVATE LEARNER SPACE, Part 2 -- a learner-specific PIN that a browser
-- must verify before it may act as a given learner, closing the gap
-- migration 262 (Parent PIN) explicitly left open: the Parent PIN protects
-- Learner Mode -> Parent Mode, but nothing protected family environment ->
-- a SPECIFIC learner's space. Real Founder production testing confirmed
-- the Founder could enter Plantest2's workspace without Plantest2 supplying
-- any credential.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query (this repo's standing
-- Founder-applied-migration convention). Single transaction. Does not touch
-- or rerun migrations 260, 261 or 262.
--
-- WHAT THIS DOES
--   Two new tables (learner_access: one row per learner with a configured
--   PIN, never client-readable; learner_pin_sessions: short-lived opaque
--   session tokens minted only by a correct PIN verification), three
--   SECURITY DEFINER RPCs (set/verify/status, same shape as migration 262's
--   Parent PIN trio), and current_learner_id() is redefined (not replaced
--   with a second resolver -- every one of the ~38 functions migration 260
--   pointed at current_learner_id() automatically gets this protection,
--   with no other function touched).
--
-- THE BINDING (server-side, not merely a client-side modal)
--   current_learner_id() already validates that the x-angel-learner-id
--   header names a learner the signed-in ACCOUNT owns (migration 260). This
--   migration adds one more check, only for a learner who actually has a
--   PIN configured (opt-in, matching the parent-establishes-PIN-first
--   bootstrap flow): the request must ALSO carry a valid x-angel-learner-
--   token header, naming a session token that verify_learner_pin() minted
--   for THAT SPECIFIC learner, for THIS account, not yet expired. A token
--   verified for Plantest1 does not satisfy a request naming Plantest2 --
--   proven directly in this migration's own test suite, not merely
--   asserted. A learner with no PIN configured yet is unaffected.
--
-- HONEST SCOPE OF THIS BINDING (see ANGEL_11PLUS_PRIVATE_LEARNER_SPACE_
-- DECISION_RECORD.md's own "what this does not stop" section, unchanged
-- principle): current_learner_id() is what the product's own client code
-- and the ~38 functions built on it always use. It does not, and cannot
-- without a much larger change to every evidence table's own RLS policy
-- (all ~30 of them, each already scoped only to ACCOUNT ownership, per
-- migration 260's own header note), stop a raw REST query that names a
-- sibling's profile_id directly and never calls current_learner_id() at
-- all. That is a pre-existing characteristic of the account-level
-- architecture, not introduced or hidden by this migration, and closing it
-- fully was judged out of this increment's scope (Part 15's own protected-
-- systems list; touching ~30 tables' RLS is not "the smallest safe
-- extension").
--
-- NO RAW PIN STORED, RETURNED OR LOGGED
--   Only a per-row random salt (gen_random_uuid(), core Postgres) and a
--   sha256() hash (also core Postgres -- this repo's PGlite test harness
--   has no pgcrypto compiled in, confirmed directly rather than assumed,
--   same finding as migration 262) are ever written. verify_learner_pin()
--   returns a session_token (an opaque, unguessable random id, NOT the
--   PIN) only on success. Resetting a PIN (set_learner_pin, on conflict)
--   deletes every existing session token for that learner -- a parent
--   resetting a PIN must not leave an old verified session still valid.
--
-- RATE LIMITING
--   5 wrong attempts locks verification out for 5 minutes, PER LEARNER
--   (keyed by learner_id, not account) -- Plantest1's lockout never
--   affects Plantest2's own attempts, proven in this migration's test
--   suite.

begin;

-- ============================================================
-- 1. learner_access -- one row per learner with a configured PIN. Same
--    RLS-enabled-zero-client-policies-plus-explicit-revoke shape as
--    migration 262's household_access.
-- ============================================================
create table if not exists public.learner_access (
  learner_id      uuid primary key references public.profiles(id) on delete cascade,
  pin_salt        text not null,
  pin_hash        text not null,
  pin_set_at      timestamptz not null default now(),
  failed_attempts int not null default 0,
  locked_until    timestamptz
);

alter table public.learner_access enable row level security;
revoke all on public.learner_access from authenticated, anon;

comment on table public.learner_access is
  'One row per learner (profiles.id) who has a Parent-established learner PIN. Never readable by any client role -- accessed only through set_learner_pin()/verify_learner_pin()/learner_pin_status(). A learner with no row here has no PIN protection yet (opt-in).';

-- ============================================================
-- 2. learner_pin_sessions -- opaque session tokens minted only by a
--    correct verify_learner_pin() call. Safe to return to the client (it
--    is not the PIN, not derived from it in any reversible way, and
--    carries no information beyond "this browser verified this learner").
-- ============================================================
create table if not exists public.learner_pin_sessions (
  token         uuid primary key default gen_random_uuid(),
  learner_id    uuid not null references public.profiles(id) on delete cascade,
  auth_user_id  uuid not null references auth.users(id) on delete cascade,
  created_at    timestamptz not null default now(),
  expires_at    timestamptz not null default (now() + interval '12 hours')
);

alter table public.learner_pin_sessions enable row level security;
revoke all on public.learner_pin_sessions from authenticated, anon;

comment on table public.learner_pin_sessions is
  'Opaque session tokens minted only by a correct verify_learner_pin(). Never readable by any client role directly -- current_learner_id() (SECURITY DEFINER) is the only reader; set_learner_pin() deletes every row for a learner when their PIN is reset.';

create index if not exists learner_pin_sessions_learner_id_idx on public.learner_pin_sessions (learner_id);

-- ============================================================
-- 3. set_learner_pin -- parent-only (must own the learner). Resets any
--    existing lockout and invalidates every existing session for that
--    learner.
-- ============================================================
create or replace function public.set_learner_pin(p_learner_id uuid, p_pin text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid  uuid := auth.uid();
  v_salt text;
begin
  if v_uid is null then
    raise exception 'angel_not_authenticated';
  end if;
  if coalesce((auth.jwt() ->> 'is_anonymous')::boolean, false) then
    raise exception 'angel_household_requires_account';
  end if;
  if not exists (select 1 from public.profiles where id = p_learner_id and auth_user_id = v_uid) then
    raise exception 'angel_learner_not_owned';
  end if;
  if p_pin !~ '^[0-9]{4,6}$' then
    raise exception 'angel_invalid_pin';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('angel_learner_pin:' || p_learner_id::text, 0));

  v_salt := gen_random_uuid()::text;

  insert into public.learner_access (learner_id, pin_salt, pin_hash, pin_set_at, failed_attempts, locked_until)
  values (p_learner_id, v_salt, encode(sha256((v_salt || ':' || p_pin)::bytea), 'hex'), now(), 0, null)
  on conflict (learner_id) do update
    set pin_salt = excluded.pin_salt,
        pin_hash = excluded.pin_hash,
        pin_set_at = now(),
        failed_attempts = 0,
        locked_until = null;

  delete from public.learner_pin_sessions where learner_id = p_learner_id;
end;
$$;

-- ============================================================
-- 4. verify_learner_pin -- rate-limited (per learner_id), mints a fresh
--    session token only on success. See the header note on the retry_at
--    naming pattern (matches migration 262's own verify_household_pin --
--    a RETURNS TABLE column named the same as the underlying table column
--    it reads becomes an ambiguous implicit PL/pgSQL variable).
-- ============================================================
create or replace function public.verify_learner_pin(p_learner_id uuid, p_pin text)
returns table(ok boolean, retry_at timestamptz, session_token uuid)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid   uuid := auth.uid();
  v_row   public.learner_access;
  v_ok    boolean;
  v_token uuid;
begin
  if v_uid is null then
    raise exception 'angel_not_authenticated';
  end if;
  if not exists (select 1 from public.profiles where id = p_learner_id and auth_user_id = v_uid) then
    raise exception 'angel_learner_not_owned';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('angel_learner_pin:' || p_learner_id::text, 0));

  -- Opportunistic cleanup: bounded, no new infrastructure, keeps this
  -- learner's own session rows from growing unboundedly across repeated
  -- verifications. Not a complete cleanup solution (other learners'
  -- expired rows are untouched here) -- disclosed as a minor limitation.
  delete from public.learner_pin_sessions where learner_id = p_learner_id and expires_at <= now();

  select * into v_row from public.learner_access where learner_id = p_learner_id;
  if v_row.learner_id is null then
    return query select false, null::timestamptz, null::uuid;
    return;
  end if;

  if v_row.locked_until is not null and v_row.locked_until > now() then
    return query select false, v_row.locked_until, null::uuid;
    return;
  end if;

  v_ok := (encode(sha256((v_row.pin_salt || ':' || p_pin)::bytea), 'hex') = v_row.pin_hash);

  if v_ok then
    update public.learner_access
    set failed_attempts = 0, locked_until = null
    where learner_id = p_learner_id;

    insert into public.learner_pin_sessions (learner_id, auth_user_id)
    values (p_learner_id, v_uid)
    returning token into v_token;

    return query select true, null::timestamptz, v_token;
  else
    update public.learner_access la
    set failed_attempts = la.failed_attempts + 1,
        locked_until = case when la.failed_attempts + 1 >= 5 then now() + interval '5 minutes' else la.locked_until end
    where la.learner_id = p_learner_id
    returning la.locked_until into v_row.locked_until;
    return query select false, v_row.locked_until, null::uuid;
  end if;
end;
$$;

-- ============================================================
-- 5. learner_pin_status -- parent-only (must own the learner).
-- ============================================================
create or replace function public.learner_pin_status(p_learner_id uuid)
returns table(has_pin boolean, retry_at timestamptz)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null or not exists (select 1 from public.profiles where id = p_learner_id and auth_user_id = v_uid) then
    return query select false, null::timestamptz;
    return;
  end if;
  return query
    select true, la.locked_until from public.learner_access la where la.learner_id = p_learner_id
    union all
    select false, null::timestamptz where not exists (select 1 from public.learner_access where learner_id = p_learner_id);
end;
$$;

revoke execute on function public.set_learner_pin(uuid, text) from public;
grant execute on function public.set_learner_pin(uuid, text) to authenticated;
revoke execute on function public.verify_learner_pin(uuid, text) from public;
grant execute on function public.verify_learner_pin(uuid, text) to authenticated;
revoke execute on function public.learner_pin_status(uuid) from public;
grant execute on function public.learner_pin_status(uuid) to authenticated;

-- ============================================================
-- 6. current_learner_id() -- redefined (not replaced with a second
--    resolver) to add the learner-PIN-session check documented above,
--    after resolving v_id exactly as migration 260 already does. Every
--    function migration 260 pointed at current_learner_id() is protected
--    with no other function touched.
-- ============================================================
create or replace function public.current_learner_id()
returns uuid
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid       uuid := auth.uid();
  v_raw       text;
  v_hdr       uuid;
  v_id        uuid;
  v_count     int;
  v_token_raw text;
  v_token     uuid;
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
  else
    select count(*) into v_count from public.profiles where auth_user_id = v_uid;
    if v_count = 0 then
      return null;
    elsif v_count = 1 then
      select id into v_id from public.profiles where auth_user_id = v_uid;
    else
      raise exception 'angel_learner_required';
    end if;
  end if;

  -- Learner PIN binding (migration 263): opt-in -- only a learner who
  -- actually has a PIN configured requires a matching session token,
  -- however v_id above was reached (explicit header or the single-learner
  -- fallback).
  if exists (select 1 from public.learner_access la where la.learner_id = v_id) then
    begin
      v_token_raw := nullif(btrim(coalesce(
        (nullif(current_setting('request.headers', true), '')::json) ->> 'x-angel-learner-token', '')), '');
    exception when others then
      v_token_raw := null;
    end;
    if v_token_raw is null then
      raise exception 'angel_learner_pin_required';
    end if;
    begin
      v_token := v_token_raw::uuid;
    exception when invalid_text_representation then
      raise exception 'angel_learner_pin_required';
    end;
    if not exists (
      select 1 from public.learner_pin_sessions s
      where s.token = v_token and s.learner_id = v_id and s.auth_user_id = v_uid and s.expires_at > now()
    ) then
      raise exception 'angel_learner_pin_required';
    end if;
  end if;

  return v_id;
end;
$$;

revoke execute on function public.current_learner_id() from public;
grant execute on function public.current_learner_id() to authenticated;

-- ============================================================
-- 7. Post-migration invariants
-- ============================================================
do $$
begin
  if not exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'learner_access') then
    raise exception 'Migration 263 invariant failed: learner_access table missing.';
  end if;
  if not exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'learner_pin_sessions') then
    raise exception 'Migration 263 invariant failed: learner_pin_sessions table missing.';
  end if;
  if not (select relrowsecurity from pg_class where oid = 'public.learner_access'::regclass) then
    raise exception 'Migration 263 invariant failed: RLS not enabled on learner_access.';
  end if;
  if not (select relrowsecurity from pg_class where oid = 'public.learner_pin_sessions'::regclass) then
    raise exception 'Migration 263 invariant failed: RLS not enabled on learner_pin_sessions.';
  end if;
  if has_table_privilege('authenticated', 'public.learner_access', 'SELECT') then
    raise exception 'Migration 263 invariant failed: authenticated can directly SELECT learner_access.';
  end if;
  if has_table_privilege('authenticated', 'public.learner_pin_sessions', 'SELECT') then
    raise exception 'Migration 263 invariant failed: authenticated can directly SELECT learner_pin_sessions.';
  end if;
  if has_table_privilege('anon', 'public.learner_access', 'SELECT') then
    raise exception 'Migration 263 invariant failed: anon can directly SELECT learner_access.';
  end if;
end $$;

commit;

-- ============================================================
-- ROLLBACK (manual only, never executed automatically). Restores
-- migration 260's own current_learner_id() body (no learner-PIN check).
-- ============================================================
-- begin;
-- create or replace function public.current_learner_id()
-- returns uuid
-- language plpgsql
-- stable
-- security definer
-- set search_path = public
-- as $$
-- declare
--   v_uid   uuid := auth.uid();
--   v_raw   text;
--   v_hdr   uuid;
--   v_id    uuid;
--   v_count int;
-- begin
--   if v_uid is null then
--     return null;
--   end if;
--   begin
--     v_raw := nullif(btrim(coalesce(
--       (nullif(current_setting('request.headers', true), '')::json) ->> 'x-angel-learner-id', '')), '');
--   exception when others then
--     v_raw := null;
--   end;
--   if v_raw is not null then
--     begin
--       v_hdr := v_raw::uuid;
--     exception when invalid_text_representation then
--       raise exception 'angel_learner_not_owned';
--     end;
--     select id into v_id from public.profiles where id = v_hdr and auth_user_id = v_uid;
--     if v_id is null then
--       raise exception 'angel_learner_not_owned';
--     end if;
--     return v_id;
--   end if;
--   select count(*) into v_count from public.profiles where auth_user_id = v_uid;
--   if v_count = 0 then
--     return null;
--   elsif v_count = 1 then
--     select id into v_id from public.profiles where auth_user_id = v_uid;
--     return v_id;
--   end if;
--   raise exception 'angel_learner_required';
-- end;
-- $$;
-- drop function if exists public.set_learner_pin(uuid, text);
-- drop function if exists public.verify_learner_pin(uuid, text);
-- drop function if exists public.learner_pin_status(uuid);
-- drop table if exists public.learner_pin_sessions;
-- drop table if exists public.learner_access;
-- commit;
