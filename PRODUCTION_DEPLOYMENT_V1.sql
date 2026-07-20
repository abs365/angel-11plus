-- ============================================================================
-- Angel Digital 11+ — PRODUCTION_DEPLOYMENT_V1.sql
--
-- RR-002. A single, consolidated deployment script for the Supabase project
-- `agxunwcdatosrmzhhuxj`, produced by reading and concatenating the existing
-- migration files 004 through 014 from `supabase/migrations/`, in their
-- existing numeric (dependency) order, with no SQL invented and no
-- migration's own content modified.
--
-- SCOPE: migrations 001-003 are not included here. Every check this
-- programme has run (Wave 1 onward, PR-001, RP-001, RR-001) confirms
-- `profiles`, `user_stats`, and `lesson_progress` already exist and are
-- already readable in production — meaning 001-003 are already applied.
-- Migrations 004 through 014 are the confirmed gap (RR-001's Task 4/Section
-- 2), and are the only files this script assembles.
--
-- WHY THIS IS ONE FILE BUT MUST STILL BE RUN WITH ONE CARE POINT:
-- This project's own pre-existing operational guidance
-- (ALI_PRODUCTION_ACTIVATION_CHECKLIST.md) states migrations must run "each
-- as its own separate SQL Editor execution — not pasted together as one
-- script," specifically because migration 004 uses
-- `alter type ... add value`, and Postgres cannot use a newly-added enum
-- value inside the same transaction that added it. Migration 005 (the very
-- next file) creates `ali_question_bank` with a `subject` column typed
-- against that same enum — the one real place in this whole sequence where
-- pasting-and-running-as-one-script could fail.
--
-- This script resolves that without inventing any migration SQL: an
-- explicit `commit;` is inserted between migration 004's section and
-- migration 005's section (clearly marked below, and nowhere else in this
-- file) so the new enum values are committed before anything references
-- them, even if this entire script is sent to Postgres as one multi-statement
-- batch. This is a standard, minimal PostgreSQL transaction-control
-- statement, not new application/schema logic — every other line in this
-- file is copied verbatim from its source migration.
--
-- No other section boundary in this file requires this treatment: migration
-- 011 also uses `alter type ... add value`, but nothing later in this
-- sequence references that specific new value, so no second `commit;` is
-- needed there.
--
-- Run this entire file in: Supabase Dashboard > SQL Editor > New query,
-- against the `agxunwcdatosrmzhhuxj` project.
-- ============================================================================


-- ============================================================================
-- SOURCE: supabase/migrations/004_ali_subject_enum.sql
-- ============================================================================

-- Angel Digital 11+ — Migration 004
-- Angel Learning Intelligence (ALI) — Slice 1
-- Additive-only: extends the existing subject_type enum with the 4 reasoning
-- subjects, which are already first-class throughout the app's SkillType/
-- MockConfig logic but were never added to the DB-level enum in migration 001.
-- Existing 5 values (english, maths, vocabulary, writing, mock-test) are
-- never modified. See ALI_DECISION_LOG.md Decision 5.
-- Run this in: Supabase Dashboard > SQL Editor > New query

alter type public.subject_type add value if not exists 'verbal-reasoning';
alter type public.subject_type add value if not exists 'non-verbal-reasoning';
alter type public.subject_type add value if not exists 'spatial-reasoning';
alter type public.subject_type add value if not exists 'numerical-reasoning';

-- ============================================================
-- NOTE
-- Postgres cannot run ALTER TYPE ... ADD VALUE inside the same transaction
-- as a later statement that uses the new value, so this migration only
-- adds the enum values. Tables that use these new values (ali_question_bank,
-- migration 005) are created in a separate migration file/transaction.
-- ============================================================


-- ============================================================================
-- ADDED BY RR-002 (not part of any original migration file) — commits the
-- enum values above before migration 005 (next section) creates a column
-- typed against them. See this file's own header comment for why.
-- ============================================================================
commit;


-- ============================================================================
-- SOURCE: supabase/migrations/005_ali_question_bank.sql
-- ============================================================================

-- Angel Digital 11+ — Migration 005
-- Angel Learning Intelligence (ALI) — Slice 1
-- Additive-only. Depends on migration 004 (subject_type enum values).
-- Creates the ALI content layer: ali_question_bank + the configurable
-- mastery-threshold defaults table (ALI_DECISION_LOG.md Decision 10).
-- Does not touch profiles / user_stats / lesson_progress.
-- Run this in: Supabase Dashboard > SQL Editor > New query

-- ============================================================
-- content_difficulty
-- Proficiency-facing difficulty label. NOT the same concept as the app's
-- existing year-group `Difficulty` type (types/index.ts) used by lessons/
-- vocab/writing/maths — deliberately a separate name to avoid collision.
-- See QUESTION_AUTHORING_STANDARD.md §1 / §4.
-- ============================================================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'content_difficulty') then
    create type public.content_difficulty as enum ('easy', 'medium', 'hard', 'challenge');
  end if;
end$$;

-- ============================================================
-- ali_mastery_defaults
-- Configurable mastery-threshold defaults by difficulty (Decision 10).
-- Read at question-import time, not hard-coded in application logic.
-- Changing a row here affects future imports/re-syncs only, not
-- already-imported questions.
-- ============================================================
create table if not exists public.ali_mastery_defaults (
  content_difficulty public.content_difficulty primary key,
  default_threshold  smallint not null check (default_threshold >= 1)
);

insert into public.ali_mastery_defaults (content_difficulty, default_threshold) values
  ('easy', 2),
  ('medium', 2),
  ('hard', 3),
  ('challenge', 3)
on conflict (content_difficulty) do nothing;

-- ============================================================
-- ali_question_bank
-- The shared question bank. `skill` is a fine-grained competency code
-- (e.g. 'vr.analogies', 'vr.letter-codes' — QUESTION_AUTHORING_STANDARD.md
-- §3), NOT the app's existing coarse SkillType value (which is uniformly
-- 'verbal-reasoning' for every VR question — see Decision 13). `prompt` is
-- jsonb because question shape genuinely varies by subject.
-- ============================================================
create table if not exists public.ali_question_bank (
  id                      text primary key,
  subject                 public.subject_type not null,
  skill                   text not null,
  pathway                 text[] not null,
  content_difficulty      public.content_difficulty not null,
  question_type           text not null default 'multiple-choice',
  estimated_time_seconds  integer not null default 45 check (estimated_time_seconds > 0),
  prompt                  jsonb not null,
  explanation             text not null,
  hint                    text,

  confidence_weight       numeric(3,2) not null default 1.00,
  learning_objective      text,
  revision_priority       smallint not null default 3 check (revision_priority between 1 and 5),
  mastery_threshold       smallint not null check (mastery_threshold >= 1),

  usage_count             integer not null default 0 check (usage_count >= 0),
  avg_success_rate        numeric(5,2),
  created_at              timestamptz not null default now()
);

create index if not exists ali_question_bank_lookup_idx
  on public.ali_question_bank (subject, skill, content_difficulty);

-- ============================================================
-- ROW LEVEL SECURITY
-- Disabled, matching the account-wide convention set in migration 001
-- (no auth yet). ali_question_bank is content, not user data, so RLS
-- matters less here than on the per-student tables in migration 006 —
-- disabled for consistency with the rest of the schema, not by oversight.
-- ============================================================
alter table public.ali_mastery_defaults disable row level security;
alter table public.ali_question_bank    disable row level security;


-- ============================================================================
-- SOURCE: supabase/migrations/006_ali_student_state.sql
-- ============================================================================

-- Angel Digital 11+ — Migration 006
-- Angel Learning Intelligence (ALI) — Slice 1
-- Additive-only. Depends on migration 001 (profiles) and 005
-- (ali_question_bank). Creates the per-student adaptive-state layer:
-- ali_student_adaptive_state (one row per profile, presentation-sequence
-- counter) and ali_student_question_history (one row per (profile,
-- question), real evidence — times_seen/times_correct/distinct_correct_
-- sessions/mastery_state).
-- Run this in: Supabase Dashboard > SQL Editor > New query

create table if not exists public.ali_student_adaptive_state (
  profile_id                uuid primary key references public.profiles(id) on delete cascade,
  questions_presented_count integer not null default 0 check (questions_presented_count >= 0)
);

create table if not exists public.ali_student_question_history (
  id                            uuid primary key default gen_random_uuid(),
  profile_id                    uuid not null references public.profiles(id) on delete cascade,
  question_id                   text not null references public.ali_question_bank(id) on delete cascade,
  source                        text not null default 'adaptive_mock',
  times_seen                    integer not null default 0 check (times_seen >= 0),
  times_correct                 integer not null default 0 check (times_correct >= 0),
  distinct_correct_sessions     integer not null default 0 check (distinct_correct_sessions >= 0),
  last_correct_session_id       text,
  last_presented_at             timestamptz not null default now(),
  last_presented_at_sequence    integer not null,
  last_attempt_correct          boolean,
  second_last_attempt_correct   boolean,
  mastery_state                 text not null default 'new',
  updated_at                    timestamptz not null default now(),
  constraint ali_student_question_history_unique unique (profile_id, question_id)
);

create index if not exists ali_student_question_history_profile_seq_idx
  on public.ali_student_question_history (profile_id, last_presented_at_sequence desc);

-- ============================================================
-- ROW LEVEL SECURITY
-- Disabled — same account-wide convention as profiles/user_stats/
-- lesson_progress (migration 001), not yet re-enabled with a real policy.
-- ============================================================
alter table public.ali_student_adaptive_state    disable row level security;
alter table public.ali_student_question_history  disable row level security;

-- ============================================================
-- updated_at trigger, reusing the existing set_updated_at() function
-- (migration 001) rather than redefining it.
-- ============================================================
drop trigger if exists ali_student_question_history_updated_at on public.ali_student_question_history;
create trigger ali_student_question_history_updated_at
  before update on public.ali_student_question_history
  for each row execute function public.set_updated_at();


-- ============================================================================
-- SOURCE: supabase/migrations/007_ali_learning_unit.sql
-- ============================================================================

-- Angel Digital 11+ — Migration 007
-- Angel Learning Intelligence (ALI) — Phase 2.1 (English/Reading Comprehension)
-- Additive-only. Depends on migration 005 (ali_question_bank).
-- Introduces the Learning Unit as a permanent architectural concept
-- (ALI_DECISION_LOG.md Decision 36): the schedulable, never-split unit of
-- adaptive selection. For atomic subjects (Verbal Reasoning, Mathematics)
-- a Learning Unit is exactly one question. For Reading Comprehension a
-- Learning Unit is one passage and every question linked to it.
-- Run this in: Supabase Dashboard > SQL Editor > New query

-- ============================================================
-- learning_unit_id
-- Added nullable first, backfilled, then constrained NOT NULL — the
-- standard safe pattern for an additive column, and works identically
-- whether the table is empty (no production rows yet, per migrations
-- 004-006's still-unapplied status) or already has real rows.
--
-- Backfill convention for atomic subjects: learning_unit_id = id (a
-- question is its own, single-member Learning Unit). Reading Comprehension
-- rows set learning_unit_id to the shared passage id at import time instead,
-- so multiple questions resolve to one Learning Unit.
-- ============================================================
alter table public.ali_question_bank
  add column if not exists learning_unit_id text;

update public.ali_question_bank
  set learning_unit_id = id
  where learning_unit_id is null;

alter table public.ali_question_bank
  alter column learning_unit_id set not null;

create index if not exists ali_question_bank_learning_unit_id_idx
  on public.ali_question_bank (learning_unit_id);


-- ============================================================================
-- SOURCE: supabase/migrations/008_admin_and_beta_submissions.sql
-- ============================================================================

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


-- ============================================================================
-- SOURCE: supabase/migrations/009_ali_question_metadata_extension.sql
-- ============================================================================

-- Angel Digital 11+ — Migration 009
-- Work Package WP-02 (Implementation Programme) — Question Intelligence
-- metadata extension, per AEP-003_QUESTION_INTELLIGENCE_FRAMEWORK.md §4/§7
-- and AIW-001_EDUCATIONAL_DATA_MODEL.md §4/§11.
-- Additive-only. Depends on migration 005 (ali_question_bank).
-- Does not touch profiles / user_stats / lesson_progress / any other table.
-- Run this in: Supabase Dashboard > SQL Editor > New query

-- ============================================================
-- addresses_misconception
-- Optional link to a named misconception (AEP-002_KNOWLEDGE_FRAMEWORK.md §4)
-- this question is deliberately designed to surface or correct. A short
-- text label, not a foreign key — no misconceptions table exists yet
-- (misconceptions are catalogued narratively in AEP-002 §4, not as a coded
-- list), and inventing one here would be scope creep beyond this migration.
-- Permanently optional: not every question targets a named misconception,
-- so this column is never intended to become NOT NULL.
--
-- transfer_links
-- Optional array of related competency codes (AIW-001 §2's Knowledge
-- Graph, AEP-002 §10's Cross-Subject Relationships) this question is
-- known to support transfer reinforcement for (AEP-004 §9.5, AEP-001
-- §2.12's Learning Transfer Principle). Same "text[]" shape as the
-- existing `pathway` column, since `skill` itself is already a plain
-- text competency code, not an enum. Also permanently optional.
-- ============================================================
alter table public.ali_question_bank
  add column if not exists addresses_misconception text,
  add column if not exists transfer_links text[];

-- No backfill, no NOT NULL step: unlike the nullable-then-NOT-NULL pattern
-- used for learning_unit_id (migration 007), these two fields are designed
-- to stay optional indefinitely (QUESTION_AUTHORING_STANDARD.md §12-§14's
-- worked examples never populate them), so there is no follow-up migration
-- planned to tighten this constraint.

-- ============================================================
-- ROW LEVEL SECURITY
-- Unchanged. ali_question_bank's RLS posture (disabled, migration 005) is
-- not affected by adding nullable columns to an existing table.
-- ============================================================


-- ============================================================================
-- SOURCE: supabase/migrations/010_ali_persistence_layer.sql
-- ============================================================================

-- Angel Digital 11+ — Migration 010
-- Work Package WP-16 (IWP-002, Engine Integration Programme)
-- Persistence Layer for Durable Mastery, Educational Audit, and
-- Operational Events. Matches the existing, already-approved TypeScript
-- shapes exactly (types/ali/durableMastery.ts, types/ali/audit.ts,
-- types/ali/operationalEvent.ts) — no new design in this migration, per
-- IWP-002 §1's explicit scope.
-- Additive-only. Depends on migration 005 (profiles FK target already
-- exists via migration 001; ali_question_bank exists via migration 005).
-- Does not touch profiles / user_stats / lesson_progress / ali_question_bank
-- / ali_student_question_history / ali_student_adaptive_state.
-- Run this in: Supabase Dashboard > SQL Editor > New query

-- ============================================================
-- evidence_confidence_tier / conclusion_type / supersede_reason
-- New enums backing EducationalAuditRecord (types/ali/audit.ts) and the
-- Evidence Confidence Model (types/ali/confidence.ts, AEP-005 §6) — the
-- tier has never been given a DB representation before this migration,
-- since it was, until now, always a computed, in-memory-only value
-- (lib/ali/confidence.ts), never independently stored.
-- ============================================================
do $$
begin
  if not exists (select 1 from pg_type where typname = 'evidence_confidence_tier') then
    create type public.evidence_confidence_tier as enum ('high', 'moderate', 'low', 'insufficient');
  end if;
  if not exists (select 1 from pg_type where typname = 'conclusion_type') then
    create type public.conclusion_type as enum ('mastery', 'durable-mastery', 'recommendation', 'readiness-dimension');
  end if;
  if not exists (select 1 from pg_type where typname = 'supersede_reason') then
    create type public.supersede_reason as enum ('new-evidence', 'defect-correction', 'programme-decision');
  end if;
end$$;

-- ============================================================
-- ali_durable_mastery
-- One row per (profile, competency) — the persisted form of
-- DurableMasteryRecord (types/ali/durableMastery.ts). `validated` mirrors
-- WP-06's Mastery Validation gate output at last evaluation;
-- `maintenance_reviews`/`transfer_corroboration` are stored as jsonb since
-- their shape (an array of review records; a nullable-field object) does
-- not benefit from being split into further tables at this scale, matching
-- ali_question_bank's own `prompt jsonb` precedent for genuinely
-- variable-shape data. This table is written by lib/ali/durableMastery.ts's
-- evaluateDurableMastery() output (WP-07, unmodified) — the pure function
-- itself is not changed by this migration, only given somewhere real to
-- write to.
-- ============================================================
create table if not exists public.ali_durable_mastery (
  profile_id              uuid not null references public.profiles(id) on delete cascade,
  competency_code         text not null,
  validated               boolean not null default false,
  maintenance_reviews     jsonb not null default '[]'::jsonb,
  transfer_corroboration  jsonb not null default '{"linkedCompetencyCode": null, "corroborated": null}'::jsonb,
  durable                 boolean not null default false,
  updated_at              timestamptz not null default now(),
  constraint ali_durable_mastery_unique unique (profile_id, competency_code)
);

create index if not exists ali_durable_mastery_profile_idx
  on public.ali_durable_mastery (profile_id);

-- ============================================================
-- ali_educational_audit
-- The persisted form of EducationalAuditRecord (types/ali/audit.ts).
-- Append-only by convention (lib/ali/audit.ts's supersedeAuditRecord()
-- returns a new object rather than mutating in place, per Programme
-- Decision APD-029, Immutable Educational Evidence) — this migration does
-- not add a trigger preventing UPDATE, since the existing application
-- discipline (never call anything but an insert against this table,
-- update supersededBy/supersede_reason on the OLD row only as an explicit,
-- intentional second write) already enforces this; a hard DB-level
-- immutability constraint is a reasonable future hardening step, not
-- something this migration invents without a specific instruction to do so.
-- ============================================================
create table if not exists public.ali_educational_audit (
  id                        uuid primary key default gen_random_uuid(),
  conclusion_type           public.conclusion_type not null,
  learner_id                uuid not null references public.profiles(id) on delete cascade,
  competency_or_dimension   text not null,
  confidence_tier_at_time   public.evidence_confidence_tier not null,
  concluded_at              timestamptz not null default now(),
  superseded_by             uuid references public.ali_educational_audit(id),
  supersede_reason          public.supersede_reason
);

create index if not exists ali_educational_audit_learner_idx
  on public.ali_educational_audit (learner_id, competency_or_dimension);

-- ============================================================
-- ali_operational_events / ali_operational_event_aggregates
-- The persisted form of OperationalEvent and AggregatedEventCount
-- (types/ali/operationalEvent.ts). Two tables, matching WP-11's own
-- two-shape retention/aggregation design (lib/ali/operationalEvent.ts's
-- partitionOperationalEvents()) — raw events carry learner_id and are
-- expected to be pruned by application logic once they age past
-- RETENTION_WINDOW_DAYS (60, CALIBRATION_TRACEABILITY_REGISTER.md);
-- aggregates carry no learner identifier at all, by design.
-- ============================================================
create table if not exists public.ali_operational_events (
  id                uuid primary key default gen_random_uuid(),
  event_type        text not null,
  learner_id        uuid not null references public.profiles(id) on delete cascade,
  competency_code   text not null,
  occurred_at       timestamptz not null default now()
);

create index if not exists ali_operational_events_occurred_idx
  on public.ali_operational_events (occurred_at);

create table if not exists public.ali_operational_event_aggregates (
  event_type        text not null,
  competency_code   text not null,
  time_bucket       text not null, -- "YYYY-MM"
  event_count       integer not null default 0 check (event_count >= 0),
  constraint ali_operational_event_aggregates_unique unique (event_type, competency_code, time_bucket)
);

-- ============================================================
-- ROW LEVEL SECURITY
-- Explicit decision, not a default (per WP-16's own Verification Gate,
-- IWP-002 §7): ali_durable_mastery, ali_educational_audit, and
-- ali_operational_events all carry per-student data, exactly like
-- ali_student_question_history and ali_student_adaptive_state (migration
-- 006) — disabled here for the same reason those two tables are disabled:
-- no auth-based RLS policy layer exists anywhere in this schema yet
-- (migration 001's account-wide state, reaffirmed as recently as migration
-- 008). Enabling RLS on only these four new tables while every other
-- per-student ALI table remains disabled would create a new, inconsistent
-- policy surface, not a safer one — this is a deliberate consistency
-- decision, not an oversight. ali_operational_event_aggregates carries no
-- learner identifier at all, so its RLS posture is even more clearly
-- content-like than user-like — disabled, matching ali_question_bank's
-- own precedent for non-personal data.
-- ============================================================
alter table public.ali_durable_mastery              disable row level security;
alter table public.ali_educational_audit             disable row level security;
alter table public.ali_operational_events             disable row level security;
alter table public.ali_operational_event_aggregates   disable row level security;

-- ============================================================
-- updated_at trigger for ali_durable_mastery, reusing the existing
-- set_updated_at() function (migration 001) rather than redefining it.
-- ============================================================
drop trigger if exists ali_durable_mastery_updated_at on public.ali_durable_mastery;
create trigger ali_durable_mastery_updated_at
  before update on public.ali_durable_mastery
  for each row execute function public.set_updated_at();


-- ============================================================================
-- SOURCE: supabase/migrations/011_ali_wellbeing_conclusion_type.sql
-- ============================================================================

-- Angel Digital 11+ — Migration 011
-- Work Package WP-21A (IWP-002, Wellbeing Signal Operationalisation)
-- Adds 'wellbeing-veto' to the conclusion_type enum (migration 010), so a
-- Tier 0 pacing veto (WP-21_WELLBEING_DESIGN.md, WELLBEING_SIGNAL_CONTRACT.md)
-- has a real, correctly-typed home in ali_educational_audit — the gap
-- WELLBEING_SIGNAL_CONTRACT.md §6 explicitly named as a blocking
-- prerequisite for this exact implementation.
-- Additive-only. Depends on migration 010.
-- Note: per Postgres's own limitation (already documented in this
-- project's migration history, ALI_PRODUCTION_ACTIVATION_CHECKLIST.md),
-- ALTER TYPE ... ADD VALUE cannot run in the same transaction as a
-- statement that uses the new value — this migration only adds the value,
-- it does not insert or reference any row using it.
-- Run this in: Supabase Dashboard > SQL Editor > New query

alter type public.conclusion_type add value if not exists 'wellbeing-veto';


-- ============================================================================
-- SOURCE: supabase/migrations/012_anonymous_profile_rls_correction.sql
-- ============================================================================

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


-- ============================================================================
-- SOURCE: supabase/migrations/013_wave2_illustrative_practice_content.sql
-- ============================================================================

-- Angel Digital 11+ — Migration 013
-- Capability 3, Wave 2 — Practice Experience: illustrative content mapping
--
-- WHAT THIS IS: 18 rows referencing Angel's own real, already-live content
-- (data/lessons.ts, data/maths.ts, data/writing.ts — the exact same text
-- shown today on /english, /maths, /writing), tagged against Assessment
-- Brain V1's frozen Question Type IDs (docs/intelligence/
-- ASSESSMENT_BRAIN_V1.md §9) so Learning Engine V1's evidence model has
-- something real to compute against for Wave 2.
--
-- WHAT THIS IS NOT: a production hand-tagging pass. Per this project's
-- own standing rule ("do not automate metadata generation" —
-- QUESTION_AUTHORING_STANDARD.md, applied identically to VR/Maths/English's
-- still-outstanding hand-tagging passes), the Question Type assigned to
-- each question below is this work package's own reasoned judgement, not a
-- subject-matter reviewer's sign-off. Every mapping is disclosed, with its
-- reasoning, in CAP3_WAVE2_ACCEPTANCE_PACK.md Section 3 — treat that
-- document as the audit trail for every `skill` value below, not this
-- comment. `learning_unit_id` for Reading Comprehension reuses the source
-- lesson's own id so sibling questions from one passage resolve to one
-- Learning Unit (ALI_DECISION_LOG.md Decision 36); Maths/Writing are atomic
-- (learning_unit_id = id).
--
-- HONEST COVERAGE GAPS (not force-fitted — see Acceptance Pack §3 for why):
--   - RC-04 (Sequential Ordering) has zero real content: no existing
--     Reading Comprehension question asks for chronological/sequential
--     reordering.
--   - QT-WC-01b (Picture-Stimulus Narrative) has zero real content: none
--     of Angel's 4 existing writing prompts use a picture stimulus — they
--     are text-only narrative/descriptive/persuasive prompts. Tagging one
--     of them QT-WC-01b would misrepresent a non-picture prompt as
--     picture-based, so it was not done.
--   - MR-06 / QT-MR-14 (Precision Under Exact-Match) has zero dedicated
--     content: Assessment Brain itself labels this Question Type
--     "cross-cutting" (§4) rather than a standalone item format, so no
--     single existing question is a clean, non-arbitrary fit.
--   - WC-02 has zero mapped Question Types at all in Assessment Brain's
--     own 27-type catalogue (Capability 3 Wave 1 Finding 2) — structurally
--     unfillable by content authoring, carried forward unchanged.
--
-- Depends on migrations 001 (subject_type already has english/maths/
-- writing), 005 (ali_question_bank, content_difficulty enum), 007
-- (learning_unit_id column). No new enum values needed.
-- Run this in: Supabase Dashboard > SQL Editor > New query

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds, prompt, explanation, mastery_threshold, learning_unit_id)
values

-- ── Reading Comprehension (QT-RC-*) ─────────────────────────────────────
('eng-001-q2', 'english', 'QT-RC-03', array['csse'], 'medium', 'short-answer', 80,
 $json${
   "id": "eng-001-q2",
   "question": "What does the word 'frantic' tell us about the lighthouse keeper's state of mind as he wrote his journal?",
   "skill": "vocabulary",
   "marks": 2,
   "hint": "What does frantic mean? What does it suggest about feelings?",
   "modelAnswer": "'Frantic' suggests the keeper was increasingly panicked, desperate and out of control. The word implies that his fear was growing over time — moving beyond calm worry into something far more urgent and uncontrolled.",
   "passageTitle": "The Lighthouse Mystery",
   "passageText": "The wind whipped across the harbour as Mira pressed herself against the cold stone wall of the lighthouse. Three weeks had passed since the keeper had vanished, and still no explanation had emerged. The light continued to sweep the dark water in its steady, mechanical arc, indifferent to the mystery it illuminated.\n\nShe had found the notebook wedged behind a loose brick on the second landing — its pages dense with cramped handwriting, each entry growing more frantic than the last. The final entry simply read: \"It knows I'm here.\"\n\nAbove her, the great lens hummed and revolved. Somewhere below, the sea answered with its patient, ancient rhythm. Mira turned the notebook over in her hands. Whatever had happened here, the lighthouse held its secrets close."
 }$json$,
 'Word-meaning-in-context question — Assessment Brain QT-RC-03, competency RC-03.', 2, 'eng-001'),

('eng-001-q3', 'english', 'QT-RC-10', array['csse'], 'medium', 'short-answer', 90,
 $json${
   "id": "eng-001-q3",
   "question": "\"The sea answered with its patient, ancient rhythm.\" What effect does this image create? What technique has the writer used?",
   "skill": "inference",
   "marks": 3,
   "hint": "Look at the personification — the sea 'answering'. What contrast does this create with the human drama?",
   "modelAnswer": "The writer uses personification by giving the sea a human quality — the ability to 'answer', as if it is in conversation with the lighthouse. The words 'patient' and 'ancient' suggest that the sea has witnessed events like this before and is unmoved by them. This creates a sense of insignificance — the human mystery is small against the enormous, indifferent power of nature.",
   "passageTitle": "The Lighthouse Mystery",
   "passageText": "The wind whipped across the harbour as Mira pressed herself against the cold stone wall of the lighthouse. Three weeks had passed since the keeper had vanished, and still no explanation had emerged. The light continued to sweep the dark water in its steady, mechanical arc, indifferent to the mystery it illuminated.\n\nShe had found the notebook wedged behind a loose brick on the second landing — its pages dense with cramped handwriting, each entry growing more frantic than the last. The final entry simply read: \"It knows I'm here.\"\n\nAbove her, the great lens hummed and revolved. Somewhere below, the sea answered with its patient, ancient rhythm. Mira turned the notebook over in her hands. Whatever had happened here, the lighthouse held its secrets close."
 }$json$,
 'Effect-of-language interpretation — Assessment Brain QT-RC-10, competency RC-02.', 2, 'eng-001'),

('eng-002-q1', 'english', 'QT-RC-05', array['csse'], 'medium', 'short-answer', 120,
 $json${
   "id": "eng-002-q1",
   "question": "What impression do you get of Leo's character from this passage? Use at least two pieces of evidence.",
   "skill": "character",
   "marks": 4,
   "hint": "Look at what he collects, what he says, and how the narrator describes him.",
   "modelAnswer": "Leo comes across as thoughtful, observant and unusual. The fact that he collects 'silences' rather than physical objects shows he is sensitive to emotions and atmosphere — he notices things others overlook. His response to Priya — 'Everything worth understanding is strange' — shows he is confident and philosophical for his age, suggesting intelligence and self-assurance despite being different.",
   "passageTitle": "The Boy Who Collected Silence",
   "passageText": "Everyone in Ashford knew that Leo collected things. Bottle caps, pressed leaves, stamps from countries he'd never visited. But what nobody knew — because he had never told anyone — was that his most prized collection could not be kept in boxes or catalogued on shelves.\n\nLeo collected silences.\n\nNot the absence of sound, exactly. There was the silence after a question nobody wanted to answer. The silence in the kitchen after his parents argued. The silence of a library on the first morning of the summer holidays, when it smelled of old paper and possibility. He kept these the way other people kept photographs: carefully, in order, for safekeeping.\n\n\"You're strange,\" his classmate Priya had once told him, though she meant it almost kindly.\n\n\"Everything worth understanding is strange,\" Leo replied, which she thought was probably true."
 }$json$,
 'Requires citing evidence and explaining significance — Assessment Brain QT-RC-05, competency RC-02.', 2, 'eng-002'),

('eng-002-q3', 'english', 'QT-RC-05', array['csse'], 'medium', 'short-answer', 60,
 $json${
   "id": "eng-002-q3",
   "question": "\"He kept these the way other people kept photographs: carefully, in order, for safekeeping.\" What does this simile tell us about Leo?",
   "skill": "evidence",
   "marks": 2,
   "modelAnswer": "The simile comparing his silences to photographs suggests Leo values his emotional memories as much as others value physical mementos. Photographs are kept to preserve moments — by comparing his silences to them, the writer shows that Leo's emotional experiences are real and precious to him, even if invisible to others.",
   "passageTitle": "The Boy Who Collected Silence",
   "passageText": "Everyone in Ashford knew that Leo collected things. Bottle caps, pressed leaves, stamps from countries he'd never visited. But what nobody knew — because he had never told anyone — was that his most prized collection could not be kept in boxes or catalogued on shelves.\n\nLeo collected silences.\n\nNot the absence of sound, exactly. There was the silence after a question nobody wanted to answer. The silence in the kitchen after his parents argued. The silence of a library on the first morning of the summer holidays, when it smelled of old paper and possibility. He kept these the way other people kept photographs: carefully, in order, for safekeeping.\n\n\"You're strange,\" his classmate Priya had once told him, though she meant it almost kindly.\n\n\"Everything worth understanding is strange,\" Leo replied, which she thought was probably true."
 }$json$,
 'A quotation is given and explained — Assessment Brain QT-RC-05, competency RC-02.', 2, 'eng-002'),

('eng-003-q3', 'english', 'QT-RC-08', array['csse'], 'hard', 'short-answer', 90,
 $json${
   "id": "eng-003-q3",
   "question": "How does Thomas try to reassure his mother throughout the letter? Find three specific examples.",
   "skill": "evidence",
   "marks": 3,
   "modelAnswer": "1. He says 'I do not say this to worry you' — directly acknowledging her concern and trying to pre-empt it. 2. He tells her to 'tell Father I am well' — giving a clear, simple reassurance. 3. He ends with the image of shared stars — 'I take comfort in knowing we share them' — creating a sense of connection across the distance to ease loneliness on both sides.",
   "passageTitle": "Letters from the Trenches",
   "passageText": "My dear mother,\n\nI am writing this in what passes for a quiet hour, though I use the word 'quiet' loosely. The guns are never entirely still, and one learns, in time, to hear them as a kind of weather — threatening but distant, like a storm that may or may not arrive.\n\nWe have been here three weeks now and I confess I no longer recognise the young man who left Coventry in September. I do not say this to worry you. I have found here a kind of resolve I did not know I possessed. The men beside me are extraordinary — ordinary men made extraordinary by circumstance.\n\nTell Father I am well. Tell him also that I have been thinking much about the workshop, and that when this business is finished, I intend to return to it with a greater appreciation for the smell of sawdust and the sound of wood being worked than I ever had before.\n\nThe stars here are remarkable, mother. I suspect they are the same stars you see above Coventry, but they look different from here — older and further away. I take comfort in knowing we share them.\n\nYour loving son,\nThomas"
 }$json$,
 'Explicit "find three examples" instruction — Assessment Brain QT-RC-08, competency RC-01.', 3, 'eng-003'),

-- ── Mathematics (QT-MR-*) ────────────────────────────────────────────────
('mth-002', 'maths', 'QT-MR-01', array['csse'], 'hard', 'short-answer', 60,
 $json${"id":"mth-002","question":"What is the value of 4³ + √144?","answer":"76","skill":"arithmetic","difficulty":"year5-advanced","marks":2,"workingSteps":["4³ = 4 × 4 × 4 = 64","√144 = 12","64 + 12 = 76"]}$json$,
 'Direct arithmetic computation — Assessment Brain QT-MR-01, competency MR-01.', 3, 'mth-002'),

('mth-004', 'maths', 'QT-MR-01', array['csse'], 'hard', 'short-answer', 60,
 $json${"id":"mth-004","question":"What is 3/8 + 5/6? Give your answer as a mixed number in its simplest form.","answer":"1 5/24","skill":"fractions","difficulty":"year5-advanced","marks":2,"workingSteps":["LCM of 8 and 6 = 24","3/8 = 9/24","5/6 = 20/24","9/24 + 20/24 = 29/24","29/24 = 1 5/24"]}$json$,
 'Direct arithmetic computation (fractions fold into Assessment Brain''s Arithmetic Calculation domain, no dedicated fractions Question Type) — QT-MR-01, competency MR-01.', 3, 'mth-004'),

('mth-008', 'maths', 'QT-MR-01', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mth-008","question":"Calculate: 2.4 × 0.35","answer":"0.84","skill":"arithmetic","difficulty":"year5-core","marks":1,"workingSteps":["2.4 has 1 decimal place, 0.35 has 2 decimal places → answer has 3 dp","Multiply as integers: 24 × 35 = 840","Divide by 1000 → 0.840 = 0.84"]}$json$,
 'Direct arithmetic computation — Assessment Brain QT-MR-01, competency MR-01.', 2, 'mth-008'),

('qa-008', 'maths', 'QT-MR-01', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"qa-008","question":"√225 = ?","answer":"15","skill":"arithmetic","difficulty":"year5-core","marks":1}$json$,
 'Direct arithmetic computation — Assessment Brain QT-MR-01, competency MR-01.', 2, 'qa-008'),

('mth-006', 'maths', 'QT-MR-05', array['csse'], 'hard', 'short-answer', 90,
 $json${"id":"mth-006","question":"The nth term of a sequence is 4n - 3. What is the 12th term? What is the first term greater than 100?","answer":"45; 26th term (101)","skill":"pattern","difficulty":"year5-advanced","marks":3,"workingSteps":["12th term: 4(12) - 3 = 48 - 3 = 45","For first term > 100: 4n - 3 > 100","4n > 103, n > 25.75","So n = 26: 4(26) - 3 = 104 - 3 = 101","The 26th term is 101 — the first term greater than 100"]}$json$,
 'Sequence/function-rule application — Assessment Brain QT-MR-05, competency MR-02. Compound answer ("45; 26th term (101)") — practice UI must reuse the app''s existing semicolon-split checker (app/maths/page.tsx), not a new one.', 3, 'mth-006'),

('mth-003', 'maths', 'QT-MR-07', array['csse'], 'medium', 'short-answer', 90,
 $json${"id":"mth-003","question":"A rectangle has a perimeter of 48 cm. Its length is three times its width. What is the area of the rectangle?","answer":"108","skill":"reasoning","difficulty":"year5-core","marks":3,"workingSteps":["Let width = w, then length = 3w","Perimeter: 2(w + 3w) = 48","2 × 4w = 48, so 8w = 48, w = 6 cm","Length = 18 cm","Area = 6 × 18 = 108 cm²"]}$json$,
 'Multi-topic question (algebraic setup + geometric area); dominant tested construct is the perimeter/area relationship, so tagged QT-MR-07, competency MR-03, per this project''s existing "one primary competency by dominant skill" convention (ALI Decision 34) — a judgement call, disclosed in the Acceptance Pack.', 2, 'mth-003'),

('mth-009', 'maths', 'QT-MR-07', array['csse'], 'challenge', 'short-answer', 90,
 $json${"id":"mth-009","question":"A cylinder has a radius of 5 cm and a height of 12 cm. What is its volume? (Use π = 3.14)","answer":"942 cm³","skill":"reasoning","difficulty":"year6-exam","marks":3,"workingSteps":["V = π × r² × h","V = 3.14 × 5² × 12","V = 3.14 × 25 × 12","V = 3.14 × 300","V = 942 cm³"]}$json$,
 'Geometric reasoning via formula application — Assessment Brain QT-MR-07, competency MR-03.', 3, 'mth-009'),

('mth-010', 'maths', 'QT-MR-04', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mth-010","question":"What percentage of 340 is 85?","answer":"25%","skill":"arithmetic","difficulty":"year5-core","marks":2,"workingSteps":["85 ÷ 340 × 100","= 0.25 × 100","= 25%"]}$json$,
 'Direct percentage calculation — Assessment Brain QT-MR-04, competency MR-04.', 2, 'mth-010'),

('mth-007b', 'maths', 'QT-MR-04', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mth-007b","question":"In a class, the ratio of boys to girls is 3:4. There are 28 girls. How many students are there altogether?","answer":"49","skill":"reasoning","difficulty":"year5-core","marks":2,"workingSteps":["4 parts = 28 girls, so 1 part = 7","Boys = 3 × 7 = 21","Total = 21 + 28 = 49"]}$json$,
 'Ratio is a form of proportional-change reasoning — Assessment Brain QT-MR-04, competency MR-04.', 2, 'mth-007b'),

('mth-005', 'maths', 'QT-MR-13', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mth-005","question":"A shopkeeper bought 40 books for £3.50 each and sold them for £5.20 each. How much profit did he make in total?","answer":"£68","skill":"word-problem","difficulty":"year5-core","marks":2,"workingSteps":["Profit per book = £5.20 - £3.50 = £1.70","Total profit = 40 × £1.70 = £68"]}$json$,
 'Per-unit-value scaled by quantity — closest fit is Assessment Brain QT-MR-13 (Best-Value/Combinatorial Word Problem), competency MR-04.', 2, 'mth-005'),

('mth-001', 'maths', 'QT-MR-10', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"mth-001","question":"A train travels at 60 miles per hour. How long does it take to travel 225 miles? Give your answer in hours and minutes.","answer":"3 hours 45 minutes","skill":"word-problem","difficulty":"year5-core","marks":2,"workingSteps":["225 ÷ 60 = 3.75 hours","0.75 hours × 60 = 45 minutes","Answer: 3 hours 45 minutes"]}$json$,
 'Elapsed-time word problem — Assessment Brain QT-MR-10, competency MR-04.', 2, 'mth-001'),

('qa-010', 'maths', 'QT-MR-11', array['csse'], 'medium', 'short-answer', 60,
 $json${"id":"qa-010","question":"LCM of 6 and 9 = ?","answer":"18","skill":"pattern","difficulty":"year5-core","marks":1}$json$,
 'Number-property reasoning — Assessment Brain QT-MR-11, competency MR-05.', 2, 'qa-010'),

-- ── Continuous Writing (QT-WC-01a only — see header for QT-WC-01b gap) ──
('wrt-003', 'writing', 'QT-WC-01a', array['csse'], 'hard', 'open-response', 1500,
 $json${
   "id": "wrt-003",
   "title": "Should Schools Ban Smartphones?",
   "prompt": "Write a persuasive speech to be delivered to your school's headteacher, arguing either FOR or AGAINST a total ban on smartphones in school.\n\nYour speech must be confident, well-reasoned, and persuasive. Use at least three strong arguments.",
   "type": "persuasive",
   "difficulty": "year5-advanced",
   "timeMinutes": 25,
   "checklist": [
     "Open with a strong, attention-grabbing statement or rhetorical question",
     "State your position clearly in the first paragraph",
     "Use three separate, distinct arguments (one per paragraph)",
     "Support each argument with evidence, example, or logic",
     "Use rhetorical techniques: rule of three, rhetorical question, repetition, direct address",
     "Acknowledge the opposing view and refute it (this shows confidence)",
     "Conclude with a powerful, memorable final sentence",
     "Formal register throughout — no slang, no contractions",
     "Check paragraphing and punctuation carefully"
   ]
 }$json$,
 'Discursive/persuasive argument prompt — closest real match to Assessment Brain QT-WC-01a (Reflective/Discursive Prompt), competency WC-01.', 3, 'wrt-003')

on conflict (id) do nothing;


-- ============================================================================
-- SOURCE: supabase/migrations/014_platform_recovery_user_stats_lesson_progress_rls.sql
-- ============================================================================

-- Angel Digital 11+ — Migration 014
-- Capability 3, Wave 4 — Platform Recovery
--
-- ROOT CAUSE, confirmed by live testing 2026-07-20 (same method as PR-001 /
-- migration 012): anonymous POST to /rest/v1/user_stats and
-- /rest/v1/lesson_progress both return the identical RLS violation already
-- found on `profiles` — `42501 "new row violates row-level security
-- policy"`. No migration in this repo ever added an INSERT policy for
-- either table (migration 001 created both with RLS disabled by design;
-- nothing since has touched their RLS state) — exactly the same
-- undocumented, out-of-band drift PR-001 found and corrected on `profiles`.
--
-- CORRECTION — same minimum-safe shape as migration 012, for consistency
-- and for the same reasons (Section 3 of that migration's own comment
-- applies identically here: a device-scoped check would require a
-- session-variable pass-through this codebase does not implement, and
-- both tables' data — XP/streak counters, per-lesson scores — carries the
-- same low sensitivity as `profiles`, already effectively unrestricted on
-- the SELECT/UPDATE side wherever RLS allows any access at all today).
--
-- Also documented in project history: a separate, earlier investigation
-- (docs/operations/PROFILES_RLS_INVESTIGATION.md /
-- RESTORE_PRODUCTION_VALIDATION.md, 2026-07-03) reached the same root
-- cause for `profiles` alone and recommended disabling RLS outright
-- instead of adding policies; that fix was applied, validated working,
-- and has since silently reverted (confirmed by this Wave's own fresh
-- test). This migration takes the same approach as migration 012 (add
-- explicit policies, leave RLS enabled) rather than disabling RLS again,
-- since a disable-only fix has already been shown to not persist —
-- flagged as a Founder decision in CAP4_LAUNCH_ACCEPTANCE_PACK.md, not
-- resolved unilaterally here.
--
-- Run this in: Supabase Dashboard > SQL Editor > New query

alter table public.user_stats enable row level security;

drop policy if exists user_stats_allow_anonymous_insert on public.user_stats;
create policy user_stats_allow_anonymous_insert
  on public.user_stats
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists user_stats_allow_anonymous_update on public.user_stats;
create policy user_stats_allow_anonymous_update
  on public.user_stats
  for update
  to anon, authenticated
  using (true)
  with check (true);

alter table public.lesson_progress enable row level security;

drop policy if exists lesson_progress_allow_anonymous_insert on public.lesson_progress;
create policy lesson_progress_allow_anonymous_insert
  on public.lesson_progress
  for insert
  to anon, authenticated
  with check (true);

drop policy if exists lesson_progress_allow_anonymous_update on public.lesson_progress;
create policy lesson_progress_allow_anonymous_update
  on public.lesson_progress
  for update
  to anon, authenticated
  using (true)
  with check (true);


-- ============================================================================
-- END OF PRODUCTION_DEPLOYMENT_V1.sql — 11 source migrations (004-014)
-- concatenated verbatim, one added `commit;` (see header), nothing else
-- changed or invented.
-- ============================================================================
