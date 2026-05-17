-- Angel Digital 11+ — Migration 002
-- Adds auth_user_id to profiles, enabling link between
-- anonymous device sessions and authenticated Supabase Auth users.
-- Run this in: Supabase Dashboard > SQL Editor > New query

-- Add nullable auth_user_id column (uuid, unique — one auth user per profile)
alter table public.profiles
  add column if not exists auth_user_id uuid unique;

-- Index for fast lookups by auth user
create index if not exists profiles_auth_user_id_idx
  on public.profiles(auth_user_id)
  where auth_user_id is not null;

-- ============================================================
-- NOTE ON ROW LEVEL SECURITY
-- RLS is still disabled. When authentication is fully wired:
--   1. Enable RLS on all three tables
--   2. Add policies:
--      - profiles: WHERE device_id = current_setting('app.device_id')
--                  OR auth_user_id = auth.uid()
--      - user_stats / lesson_progress: via profile_id join
-- This will be done in migration 003 once auth is live.
-- ============================================================
