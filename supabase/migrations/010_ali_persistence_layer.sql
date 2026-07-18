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
