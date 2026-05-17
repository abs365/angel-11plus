-- Angel Digital 11+ System — Initial Schema
-- Run this in: Supabase Dashboard > SQL Editor > New query

-- ============================================================
-- PROFILES
-- One row per device (anonymous, no auth required yet).
-- device_id is generated client-side (UUID stored in localStorage).
-- When auth is added later, auth_user_id will be linked here.
-- ============================================================
create table if not exists public.profiles (
  id         uuid primary key default gen_random_uuid(),
  device_id  text unique not null,
  name       text not null default 'Angel',
  created_at timestamptz not null default now()
);

-- ============================================================
-- USER_STATS
-- Aggregate totals per profile: XP, streak, last activity.
-- One row per profile (upserted on every lesson completion).
-- ============================================================
create table if not exists public.user_stats (
  id             uuid primary key default gen_random_uuid(),
  profile_id     uuid not null references public.profiles(id) on delete cascade,
  total_xp       integer not null default 0 check (total_xp >= 0),
  streak         integer not null default 1 check (streak >= 0),
  last_activity  timestamptz not null default now(),
  updated_at     timestamptz not null default now(),
  constraint user_stats_profile_id_unique unique (profile_id)
);

-- ============================================================
-- LESSON_PROGRESS
-- One row per lesson completion event (history preserved).
-- lesson_id matches the id field in the local JSON data files.
-- subject is the module the lesson belongs to.
-- time_spent integer default 0
-- ============================================================
do $$
begin
  if not exists (
    select 1 from pg_type where typname = 'subject_type'
  ) then
    create type public.subject_type as enum (
      'english',
      'maths',
      'vocabulary',
      'writing',
      'mock-test'
    );
  end if;
end$$;

create table if not exists public.lesson_progress (
  id           uuid primary key default gen_random_uuid(),
  profile_id   uuid not null references public.profiles(id) on delete cascade,
  lesson_id    text not null,
  subject      public.subject_type not null,
  score        integer not null default 0 check (score >= 0 and score <= 100),
  xp_gained    integer not null default 0 check (xp_gained >= 0),
  completed_at timestamptz not null default now()
);

create index if not exists lesson_progress_profile_id_idx
  on public.lesson_progress(profile_id);

create index if not exists lesson_progress_profile_lesson_idx
  on public.lesson_progress(profile_id, lesson_id);

-- ============================================================
-- ROW LEVEL SECURITY
-- Disabled for now (no auth). Enable when authentication lands.
-- Each policy will filter by: profiles.device_id = requesting device.
-- ============================================================
alter table public.profiles       disable row level security;
alter table public.user_stats     disable row level security;
alter table public.lesson_progress disable row level security;

-- ============================================================
-- updated_at trigger for user_stats
-- ============================================================
create or replace function public.set_updated_at()
returns trigger language plpgsql as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists user_stats_updated_at on public.user_stats;
create trigger user_stats_updated_at
  before update on public.user_stats
  for each row execute function public.set_updated_at();
