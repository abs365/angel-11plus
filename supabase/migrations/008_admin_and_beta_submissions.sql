-- Angel Digital 11+ — Migration 008
-- Phase 5A — Enterprise Beta Readiness: real Supabase-Auth-gated admin
-- access (replacing the hardcoded client-side PIN in app/admin-beta) and
-- server-side storage for beta submissions (replacing localStorage-only
-- Feedback/Bug Reports/Feature Requests/Testimonials/Beta Family
-- Applications). Additive-only. Depends on migration 002 (auth_user_id).
-- Run this in: Supabase Dashboard > SQL Editor > New query

-- ============================================================
-- is_admin on profiles
-- Deliberately NOT exposed to normal client updates (see the REVOKE
-- below) — the only way to become an admin is a founder running a
-- manual UPDATE in the Supabase Dashboard SQL Editor. No self-service
-- admin escalation path exists anywhere in this schema or the app.
-- ============================================================
alter table public.profiles
  add column if not exists is_admin boolean not null default false;

-- Column-level privilege lockdown — real, database-enforced protection,
-- not just a hidden UI control. Even if application code (or a bug, or a
-- malicious client) tried `.update({ is_admin: true })`, Postgres itself
-- rejects the column write for these roles, independent of any RLS policy.
revoke update (is_admin) on public.profiles from authenticated, anon;

-- ============================================================
-- is_current_user_admin()
-- SECURITY DEFINER so it can check profiles.is_admin without requiring
-- RLS changes on the profiles table itself (profiles/user_stats/
-- lesson_progress intentionally keep their existing RLS-disabled state
-- from migrations 001-002 — out of scope for this phase, no regression
-- risk introduced to the existing anonymous device-based progress sync).
-- Returns false (never throws) for anonymous/unauthenticated callers.
-- ============================================================
create or replace function public.is_current_user_admin()
returns boolean
language sql
security definer
set search_path = public
stable
as $$
  select exists (
    select 1 from public.profiles
    where auth_user_id = auth.uid()
      and is_admin = true
  );
$$;

revoke execute on function public.is_current_user_admin() from public;
grant execute on function public.is_current_user_admin() to authenticated;

-- ============================================================
-- Beta submission tables
-- Each row is a beta family's submission. `profile_id` is nullable and
-- best-effort (a submitter may be anonymous) — never required for
-- insert. INSERT is open to everyone (matches the existing product
-- behaviour: no login required to submit feedback). SELECT is admin-only,
-- enforced by RLS calling is_current_user_admin() — this is the real
-- access control; the app's UI gating is a convenience, not the security
-- boundary.
-- ============================================================

create table if not exists public.feedback_submissions (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid references public.profiles(id) on delete set null,
  type          text not null check (type in ('suggestion', 'positive', 'general')),
  subject       text not null default '',
  message       text not null,
  submitted_at  timestamptz not null default now()
);

create table if not exists public.bug_reports (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid references public.profiles(id) on delete set null,
  page          text not null,
  issue_type    text not null,
  description   text not null,
  submitted_at  timestamptz not null default now()
);

create table if not exists public.feature_requests (
  id            uuid primary key default gen_random_uuid(),
  profile_id    uuid references public.profiles(id) on delete set null,
  feature       text not null,
  why           text not null,
  submitted_at  timestamptz not null default now()
);

create table if not exists public.beta_family_applications (
  id                  uuid primary key default gen_random_uuid(),
  profile_id          uuid references public.profiles(id) on delete set null,
  parent_name         text not null,
  year_group          text not null,
  pathway             text not null,
  email               text not null,
  contact_permission  boolean not null default false,
  submitted_at        timestamptz not null default now()
);

create table if not exists public.testimonials (
  id                  uuid primary key default gen_random_uuid(),
  profile_id          uuid references public.profiles(id) on delete set null,
  parent_name         text not null,
  year_group          text not null,
  feedback            text not null,
  publish_permission  boolean not null default false,
  submitted_at        timestamptz not null default now()
);

-- ============================================================
-- ROW LEVEL SECURITY — real enforcement, not client-side convenience
-- ============================================================
alter table public.feedback_submissions      enable row level security;
alter table public.bug_reports               enable row level security;
alter table public.feature_requests          enable row level security;
alter table public.beta_family_applications  enable row level security;
alter table public.testimonials              enable row level security;

-- Anyone (anonymous or authenticated) can submit — matches existing
-- no-login-required form behaviour.
-- Postgres has no `CREATE POLICY IF NOT EXISTS` — DROP then CREATE is the
-- standard idempotent pattern for policies specifically.
drop policy if exists feedback_submissions_insert on public.feedback_submissions;
create policy feedback_submissions_insert
  on public.feedback_submissions for insert to public with check (true);
drop policy if exists bug_reports_insert on public.bug_reports;
create policy bug_reports_insert
  on public.bug_reports for insert to public with check (true);
drop policy if exists feature_requests_insert on public.feature_requests;
create policy feature_requests_insert
  on public.feature_requests for insert to public with check (true);
drop policy if exists beta_family_applications_insert on public.beta_family_applications;
create policy beta_family_applications_insert
  on public.beta_family_applications for insert to public with check (true);
drop policy if exists testimonials_insert on public.testimonials;
create policy testimonials_insert
  on public.testimonials for insert to public with check (true);

-- Only confirmed admins can read — the actual security boundary.
drop policy if exists feedback_submissions_select_admin on public.feedback_submissions;
create policy feedback_submissions_select_admin
  on public.feedback_submissions for select to authenticated
  using (public.is_current_user_admin());
drop policy if exists bug_reports_select_admin on public.bug_reports;
create policy bug_reports_select_admin
  on public.bug_reports for select to authenticated
  using (public.is_current_user_admin());
drop policy if exists feature_requests_select_admin on public.feature_requests;
create policy feature_requests_select_admin
  on public.feature_requests for select to authenticated
  using (public.is_current_user_admin());
drop policy if exists beta_family_applications_select_admin on public.beta_family_applications;
create policy beta_family_applications_select_admin
  on public.beta_family_applications for select to authenticated
  using (public.is_current_user_admin());
drop policy if exists testimonials_select_admin on public.testimonials;
create policy testimonials_select_admin
  on public.testimonials for select to authenticated
  using (public.is_current_user_admin());

-- No UPDATE/DELETE policies are created for any of the 5 tables — with
-- RLS enabled and no matching policy, Postgres denies these operations
-- to every role by default. This is intentional: the admin dashboard is
-- read-only for beta submissions in this phase.

-- ============================================================
-- BOOTSTRAP — how the founder becomes the first admin
-- There is no self-service path by design. After signing in at least
-- once via the existing magic-link flow (so profiles.auth_user_id is
-- populated), run this once, substituting the real auth user id
-- (Supabase Dashboard > Authentication > Users):
--
--   update public.profiles set is_admin = true where auth_user_id = '<uuid>';
--
-- ============================================================
