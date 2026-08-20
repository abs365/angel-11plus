-- Angel Digital 11+ — Migration 084
-- Launch and Operational Readiness, Execution 001, LR-2 — ali_question_bank
-- RLS Assurance (Gate 001 P1 finding #2, Decision 130).
--
-- Run this in: Supabase Dashboard > SQL Editor > New query
--
-- FINDING: migration 005 explicitly disabled RLS on ali_question_bank
-- ("alter table public.ali_question_bank disable row level security;")
-- and no later migration in the full 83-file history (004-083) ever
-- re-enables it — confirmed by grepping every "enable row level
-- security" statement in supabase/migrations/*.sql. Migration 020 and
-- migration 069 each create a SELECT policy on this table
-- (ali_question_bank_select_all), but a POLICY ON A TABLE WITH RLS
-- DISABLED IS INERT — Postgres does not evaluate policies unless RLS
-- is enabled, so migration 069's own stated purpose ("Closes the exact
-- gap... a sealed content firewall" excluding eligibility_status =
-- 'mock_eligible' from anon/authenticated reads) does not actually take
-- effect regardless of whether 069 itself was applied. With RLS off,
-- Supabase's default schema-level GRANTs govern access instead of any
-- policy — meaning anon/authenticated may also be able to INSERT/
-- UPDATE/DELETE rows directly, since no migration in this repository's
-- history ever REVOKEs those table-level privileges from those roles
-- on ali_question_bank (grepped: zero matches).
--
-- Before applying, verify the current state directly:
--   select relrowsecurity from pg_class where relname = 'ali_question_bank';
-- (false confirms this finding; true would mean RLS was already
-- enabled outside migration history — this migration is safe to run
-- either way, see below.)
--
-- FIX: enable RLS, and (idempotently, regardless of whether migration
-- 069 was previously applied) recreate exactly migration 069's intended
-- SELECT policy — anon/authenticated may read every row except
-- eligibility_status = 'mock_eligible', which remains readable only to
-- is_current_user_admin() (migration 008). No INSERT/UPDATE/DELETE
-- policy is created for anon/authenticated: once RLS is enabled, the
-- absence of such a policy means Postgres denies those operations to
-- both roles by default — closing the unauthorised-write path without
-- a separate explicit deny rule.
--
-- Preserves the live Practice/provisional/review read path exactly:
-- 0 mock_eligible rows exist in production today (confirmed live via
-- the anon key this session — every visible row today is
-- practice_eligible or provisional), so no current read is newly
-- restricted by this migration. It only takes effect the moment any
-- row is ever promoted to mock_eligible, which is exactly migration
-- 069's own original, never-actually-enforced intent.
--
-- Does NOT touch: question content, eligibility_status values, any
-- other table, any other policy, ali_mastery_defaults (out of this
-- migration's bounded scope — no evidence found that it holds
-- sensitive/sealed content; left exactly as-is).

begin;

alter table public.ali_question_bank enable row level security;

drop policy if exists ali_question_bank_select_all on public.ali_question_bank;
create policy ali_question_bank_select_all on public.ali_question_bank for select to anon, authenticated
  using (eligibility_status is distinct from 'mock_eligible' or public.is_current_user_admin());

commit;

-- Verify after applying:
--   select relrowsecurity from pg_class where relname = 'ali_question_bank';
--   -- expect: true
--   select polname, polcmd, roles::regrole[] from pg_policies where tablename = 'ali_question_bank';
--   -- expect: exactly one row, ali_question_bank_select_all, cmd 'r', roles {anon,authenticated}
