-- 262_household_parent_pin.sql
--
-- PRIVATE LEARNER SPACE, Part 1 -- the Parent PIN that gates the ONE
-- controlled route back from Learner Mode to Parent Mode.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query (this repo's standing
-- Founder-applied-migration convention). Single transaction.
--
-- WHAT THIS DOES
--   A new, small table holding one PIN per household (per parent account,
--   auth_user_id), never readable by any client role -- only three narrow
--   SECURITY DEFINER functions touch it (set / verify / status). This is a
--   real, rate-limited, server-enforced gate for "is the person holding the
--   device right now allowed back into Parent Mode", the specific control
--   ANGEL_11PLUS_PRIVATE_LEARNER_SPACE_DECISION_RECORD.md's Section 4
--   requires. It is NOT a claim of cryptographic sibling-to-sibling data
--   isolation -- see that record for the honest boundary.
--
-- WHY sha256() INSTEAD OF pgcrypto/bcrypt
--   This repo's real-Postgres migration test harness (PGlite,
--   tests/supabase/support/pgliteHarness.ts) does not have the pgcrypto
--   extension compiled in, so a pgcrypto-based design could not be run
--   against a real Postgres engine before asking the Founder to apply it.
--   sha256() is a CORE PostgreSQL function (available on every Postgres,
--   including Supabase, with no extension to enable), confirmed directly
--   against the real test harness. A per-row random salt
--   (gen_random_uuid(), also core) defeats precomputed-hash lookup. The PIN
--   itself is 4-6 digits (10,000-1,000,000 possibilities); the real
--   protection against guessing is the rate limit in verify_household_pin()
--   below, not the hash algorithm's own cost -- the hash is never exposed
--   to any client role at all, so offline brute force of a leaked hash is
--   not the threat model this defends against.
--
-- WHO CAN USE THIS
--   Only a real (non-anonymous) authenticated account -- the same
--   "angel_add_learner_requires_account" guard create_learner() already
--   uses (migration 260). An anonymous technical session never has a
--   household to protect.
--
-- BOOTSTRAP SAFETY (enforced by the CLIENT, not this migration)
--   The Private Learner Space client requires a PIN to already exist
--   before Learner Mode can be entered for the first time (household_pin_status()
--   below tells it whether one exists yet) -- so Learner Mode can never
--   exist without a working return gate already in place. This migration
--   only provides the mechanism; it does not and cannot enforce that
--   ordering itself, since "Learner Mode" is a client-side concept with no
--   database row of its own.

begin;

-- ============================================================
-- 1. household_access -- one row per parent account. RLS enabled with
--    ZERO client policies: authenticated/anon get no rows at all via
--    direct PostgREST access, by construction. Only the SECURITY DEFINER
--    functions below (which run as the defining role, not the caller) can
--    read or write it. The explicit revoke is defence in depth beyond RLS,
--    matching migration 260 Section 2b's own explicit-grant style.
-- ============================================================
create table if not exists public.household_access (
  auth_user_id    uuid primary key references auth.users(id) on delete cascade,
  pin_salt        text not null,
  pin_hash        text not null,
  pin_set_at      timestamptz not null default now(),
  failed_attempts int not null default 0,
  locked_until    timestamptz
);

alter table public.household_access enable row level security;
revoke all on public.household_access from authenticated, anon;

comment on table public.household_access is
  'One row per parent account (auth_user_id). Holds a salted, hashed Parent PIN used only to gate returning from Learner Mode to Parent Mode in the client. Never readable by any client role -- accessed only through set_household_pin()/verify_household_pin()/household_pin_status(). Not a substitute for account authentication.';

-- ============================================================
-- 2. set_household_pin -- create or replace the household's PIN. Resets
--    any existing lockout (a parent who can already reach this call is, by
--    definition, currently in Parent Mode).
-- ============================================================
create or replace function public.set_household_pin(p_pin text)
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
  if p_pin !~ '^[0-9]{4,6}$' then
    raise exception 'angel_invalid_pin';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('angel_household_pin:' || v_uid::text, 0));

  v_salt := gen_random_uuid()::text;

  insert into public.household_access (auth_user_id, pin_salt, pin_hash, pin_set_at, failed_attempts, locked_until)
  values (v_uid, v_salt, encode(sha256((v_salt || ':' || p_pin)::bytea), 'hex'), now(), 0, null)
  on conflict (auth_user_id) do update
    set pin_salt = excluded.pin_salt,
        pin_hash = excluded.pin_hash,
        pin_set_at = now(),
        failed_attempts = 0,
        locked_until = null;
end;
$$;

-- ============================================================
-- 3. verify_household_pin -- rate-limited check. 5 wrong attempts locks
--    verification out for 5 minutes for this account, enforced here (the
--    database), not the client. Returns which happened so the client can
--    show an honest message ("wrong PIN" vs "try again in N minutes")
--    without ever seeing the stored hash or salt.
-- ============================================================
-- NOTE: the returned column is named retry_at, deliberately NOT
-- locked_until -- a RETURNS TABLE column becomes an implicit PL/pgSQL
-- variable inside the function body, and naming it locked_until (the same
-- name as household_access's own column) made every bare reference to the
-- table column inside the function ambiguous (confirmed directly: PGlite
-- raised "column reference \"locked_until\" is ambiguous", 42702, until
-- renamed). Distinct names avoid the shadow entirely rather than requiring
-- every reference to be alias-qualified.
create or replace function public.verify_household_pin(p_pin text)
returns table(ok boolean, retry_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_row public.household_access;
  v_ok  boolean;
begin
  if v_uid is null then
    raise exception 'angel_not_authenticated';
  end if;

  perform pg_advisory_xact_lock(hashtextextended('angel_household_pin:' || v_uid::text, 0));

  select * into v_row from public.household_access where auth_user_id = v_uid;
  if v_row.auth_user_id is null then
    return query select false, null::timestamptz;
    return;
  end if;

  if v_row.locked_until is not null and v_row.locked_until > now() then
    return query select false, v_row.locked_until;
    return;
  end if;

  v_ok := (encode(sha256((v_row.pin_salt || ':' || p_pin)::bytea), 'hex') = v_row.pin_hash);

  if v_ok then
    update public.household_access
    set failed_attempts = 0, locked_until = null
    where auth_user_id = v_uid;
    return query select true, null::timestamptz;
  else
    update public.household_access ha
    set failed_attempts = ha.failed_attempts + 1,
        locked_until = case when ha.failed_attempts + 1 >= 5 then now() + interval '5 minutes' else ha.locked_until end
    where ha.auth_user_id = v_uid
    returning ha.locked_until into v_row.locked_until;
    return query select false, v_row.locked_until;
  end if;
end;
$$;

-- ============================================================
-- 4. household_pin_status -- lets the client know whether a PIN already
--    exists (so it can offer "set a PIN" vs "enter your PIN") and whether
--    verification is currently locked out, without ever exposing the hash.
--    Same retry_at naming note as verify_household_pin() above.
-- ============================================================
create or replace function public.household_pin_status()
returns table(has_pin boolean, retry_at timestamptz)
language plpgsql
stable
security definer
set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
begin
  if v_uid is null then
    return query select false, null::timestamptz;
    return;
  end if;
  return query
    select true, ha.locked_until from public.household_access ha where ha.auth_user_id = v_uid
    union all
    select false, null::timestamptz where not exists (select 1 from public.household_access where auth_user_id = v_uid);
end;
$$;

revoke execute on function public.set_household_pin(text) from public;
grant execute on function public.set_household_pin(text) to authenticated;
revoke execute on function public.verify_household_pin(text) from public;
grant execute on function public.verify_household_pin(text) to authenticated;
revoke execute on function public.household_pin_status() from public;
grant execute on function public.household_pin_status() to authenticated;

-- ============================================================
-- 5. Post-migration invariants
-- ============================================================
do $$
begin
  if not exists (select 1 from pg_tables where schemaname = 'public' and tablename = 'household_access') then
    raise exception 'Migration 262 invariant failed: household_access table missing.';
  end if;
  if not (select relrowsecurity from pg_class where oid = 'public.household_access'::regclass) then
    raise exception 'Migration 262 invariant failed: RLS not enabled on household_access.';
  end if;
  if has_table_privilege('authenticated', 'public.household_access', 'SELECT') then
    raise exception 'Migration 262 invariant failed: authenticated can directly SELECT household_access.';
  end if;
  if has_table_privilege('anon', 'public.household_access', 'SELECT') then
    raise exception 'Migration 262 invariant failed: anon can directly SELECT household_access.';
  end if;
end $$;

commit;

-- ============================================================
-- ROLLBACK (manual only, never executed automatically).
-- ============================================================
-- begin;
-- drop function if exists public.set_household_pin(text);
-- drop function if exists public.verify_household_pin(text);
-- drop function if exists public.household_pin_status();
-- drop table if exists public.household_access;
-- commit;
