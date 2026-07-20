-- Angel Digital 11+ — Migration 012
-- PR-001 — Anonymous Profile RLS Correction (Platform Readiness)
--
-- ROOT CAUSE (confirmed via live behavioural testing against production,
-- 2026-07-20, documented in full in PR001_PLATFORM_READINESS_REPORT.md):
--   - Row Level Security is enabled on public.profiles in production.
--   - SELECT already succeeds unrestricted for the anon role (verified:
--     `GET /rest/v1/profiles?select=id&limit=1` -> 200).
--   - UPDATE against a non-matching filter also returns 200 (inconclusive
--     on its own, but consistent with an already-permissive policy).
--   - INSERT is blocked for the anon role (verified: `POST /rest/v1/profiles`
--     -> 401 `42501 "new row violates row-level security policy for table
--     \"profiles\""`).
--   - No migration in this repo ever added an INSERT policy. Migration 002's
--     own comment promised a device_id/auth_user_id policy "in migration 003
--     once auth is live" — migration 003 only ever added read-only views;
--     the policy was never delivered. Whatever INSERT-blocking state exists
--     in production today was therefore never defined by this repo's
--     migration history — most likely RLS was enabled directly against the
--     table (e.g. via the Supabase Dashboard's own default suggestion) with
--     no INSERT policy ever added, which correctly defaults to deny.
--
-- CORRECTION — minimum safe change:
--   Add exactly one new INSERT policy and one new UPDATE policy, both
--   permissive (`WITH CHECK (true)` / `USING (true)`), matching the
--   permissiveness the SELECT/UPDATE paths already have today. This table
--   holds only `device_id`, `name`, `auth_user_id`, `created_at` — no
--   sensitive data — and its SELECT policy already allows any anon caller
--   to read every row unrestricted, so a device-scoped INSERT check
--   (`device_id = current_setting('app.device_id')`, migration 002's
--   original sketch) would be inconsistent with that reality and, more
--   importantly, inoperable: no client code in this repo ever sets that
--   session variable, so a restrictive check would silently continue to
--   block every anonymous write. Implementing real per-device write
--   isolation would require wiring a session-variable pass-through in
--   `lib/supabase.ts`'s connection layer — out of this work package's
--   "minimum infrastructure correction, do not modify educational logic"
--   scope, and a materially bigger change than the verified defect needs.
--
--   Deliberately NOT touching the existing SELECT policy (or whatever
--   policy already makes SELECT/UPDATE-against-a-filter behave as
--   observed) — it already works, and redefining it risks unintentionally
--   narrowing behaviour that could not be fully introspected (this
--   account's Supabase CLI login does not have access to this project;
--   no service_role key is available in this repo; policies were
--   diagnosed purely by observing REST responses to real requests, not
--   by reading pg_policies directly).
--
-- Run this in: Supabase Dashboard > SQL Editor > New query

alter table public.profiles enable row level security;

drop policy if exists profiles_allow_anonymous_insert on public.profiles;
create policy profiles_allow_anonymous_insert
  on public.profiles
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists profiles_allow_anonymous_update on public.profiles;
create policy profiles_allow_anonymous_update
  on public.profiles
  for update
  to anon, authenticated
  using (true)
  with check (true);
