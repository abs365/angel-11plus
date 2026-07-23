-- Angel Digital 11+ — Migration 019
-- ED-001 permanent correction / ARCH-001 minimum identity foundation
-- (2026-07-23). Replaces device-id-only profile ownership with real
-- Supabase Auth identity (auth.uid()), reusing the auth_user_id column
-- migration 002 already added (nullable, unique) rather than introducing
-- a second, parallel ownership column.
--
-- WHY THIS EXISTS: ED-001 found that the previous permissive
-- device-id-based INSERT/UPDATE policies (migration 012) could not
-- reliably create new anonymous profiles in production, for reasons that
-- could not be isolated even via a direct `SET LOCAL ROLE anon` SQL
-- reproduction (see ED-001_NEW_LEARNER_PROFILE_RLS_DISCOVERY_REPORT.md).
-- Rather than continue chasing that specific anomaly, the Founder decided
-- to replace the underlying ownership model entirely: device_id can never
-- be verified by Postgres (it is ordinary client-supplied data), so no
-- policy built on it can ever provide real row ownership — only
-- auth.uid(), derived from a signed JWT, can. This migration makes that
-- the permanent mechanism, additive-only, with device_id retained as
-- continuity metadata (not deleted, not required to become NOT NULL yet).
--
-- REQUIRES, before this is meaningful in production: "Allow anonymous
-- sign-ins" enabled for this project (Authentication > Sign In /
-- Providers — confirmed OFF as of this migration being written) and the
-- application code calling supabase.auth.signInAnonymously() deployed
-- (lib/learnerIdentity.ts, lib/supabaseProgress.ts's rewritten
-- ensureProfile(), components/providers/AuthProvider.tsx). Applying this
-- migration alone, before those two things are true, does not break
-- anything further (the previous INSERT path for genuinely new anonymous
-- profiles was already non-functional per ED-001) but also does not fix
-- anything until they are.
--
-- Run this in: Supabase Dashboard > SQL Editor > New query

-- ============================================================
-- 1. auth_user_id: add the missing foreign key constraint
-- Migration 002 added this column (uuid, unique) but never a formal FK to
-- auth.users(id) — confirmed safe to add now: 5 total profile rows exist
-- in production as of this migration, 1 already has a real, non-orphaned
-- auth_user_id value, 0 would violate this constraint.
-- ============================================================
do $$
begin
  if not exists (
    select 1 from pg_constraint
    where conname = 'profiles_auth_user_id_fkey'
  ) then
    alter table public.profiles
      add constraint profiles_auth_user_id_fkey
      foreign key (auth_user_id) references auth.users(id) on delete cascade;
  end if;
end$$;

-- ============================================================
-- 2. claim_legacy_profile(p_device_id) — SECURITY DEFINER
--
-- Security reasoning (ARCH-001 Work Package 4): under the new ownership
-- policies below, a normal `auth.uid() = auth_user_id` policy can never
-- authorise "claiming" an unowned row, because an unowned row has
-- auth_user_id IS NULL, and `<any real uuid> = NULL` is never true in SQL
-- — this is not a gap in the policy, it is the correct behaviour for an
-- ownership check. Claiming therefore needs its own, separate, narrowly
-- scoped mechanism, not a weaker general policy. A SECURITY DEFINER
-- function is the right tool here specifically because its scope is
-- exactly one, auditable operation — unlike putting the service_role key
-- in browser code (explicitly forbidden), this function runs with the
-- definer's privileges only for this one query, and its own WHERE clause
-- is the complete security boundary:
--   - `auth_user_id is null` — only ever touches genuinely unowned rows;
--     an already-owned row (by this caller or anyone else) never matches,
--     so a row can be claimed at most once, ever.
--   - `auth.uid()` is read from the caller's own verified JWT inside the
--     function body — a caller can only ever claim a row for themselves,
--     never on behalf of another user id, because auth.uid() cannot be
--     supplied or spoofed as a parameter.
--   - EXECUTE is granted to `authenticated` only (includes real anonymous
--     Supabase Auth sessions, which carry role=authenticated) — never to
--     `anon`, which has no auth.uid() at all and would always get NULL
--     back, achieving nothing, but is blocked outright for clarity.
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

  update public.profiles
  set auth_user_id = v_uid
  where device_id = p_device_id
    and auth_user_id is null
  returning id into v_profile_id;

  return v_profile_id;
end;
$$;

revoke execute on function public.claim_legacy_profile(text) from public;
grant execute on function public.claim_legacy_profile(text) to authenticated;

-- ============================================================
-- 3. Replace device-based profiles RLS with authenticated ownership
-- Drops migration 012's permissive, device-based policies (the ones
-- ED-001 investigated) and replaces them with real auth.uid()-based
-- ownership. Deliberately NOT WITH CHECK (true) anywhere — every policy
-- below ties the row to the calling user's own verified identity.
-- ============================================================
drop policy if exists profiles_allow_anonymous_insert on public.profiles;
drop policy if exists profiles_allow_anonymous_update on public.profiles;

drop policy if exists profiles_select_own on public.profiles;
create policy profiles_select_own
  on public.profiles
  for select
  to authenticated
  using (auth.uid() = auth_user_id);

drop policy if exists profiles_insert_own on public.profiles;
create policy profiles_insert_own
  on public.profiles
  for insert
  to authenticated
  with check (auth.uid() = auth_user_id);

drop policy if exists profiles_update_own on public.profiles;
create policy profiles_update_own
  on public.profiles
  for update
  to authenticated
  using (auth.uid() = auth_user_id)
  with check (auth.uid() = auth_user_id);

-- Note: is_admin remains protected independently of these policies —
-- migration 008's `revoke update (is_admin) on public.profiles from
-- authenticated, anon` is a column-level grant, orthogonal to row-level
-- policies, and is untouched by this migration. is_current_user_admin()
-- (also migration 008) is SECURITY DEFINER and reads profiles internally,
-- bypassing RLS exactly as it already did — unaffected by this change.

-- ============================================================
-- ROLLBACK (run manually if this migration needs to be reverted; not
-- executed automatically). Restores migration 012's exact prior state.
-- Does NOT drop the auth_user_id foreign key or the claim function by
-- default, since removing those has no negative effect on the older
-- device-based flow and doing so is a separate decision — uncomment the
-- final two statements only if a full revert to migration 012's model is
-- genuinely intended.
-- ============================================================
-- drop policy if exists profiles_select_own on public.profiles;
-- drop policy if exists profiles_insert_own on public.profiles;
-- drop policy if exists profiles_update_own on public.profiles;
--
-- create policy profiles_allow_anonymous_insert
--   on public.profiles for insert to anon, authenticated with check (true);
-- create policy profiles_allow_anonymous_update
--   on public.profiles for update to anon, authenticated using (true) with check (true);
--
-- -- Only if a full revert is intended:
-- -- revoke execute on function public.claim_legacy_profile(text) from authenticated;
-- -- drop function if exists public.claim_legacy_profile(text);
-- -- alter table public.profiles drop constraint if exists profiles_auth_user_id_fkey;
