-- Angel Digital 11+ — Migration 206
-- Programme Completion Increment 012: minimum durable Mock content
-- retirement/exposure tracking mechanism.
--
-- ============================================================
-- ROOT CAUSE
-- ============================================================
-- ANGEL_MATHEMATICS_ROLLING_PROGRAMME_CAPACITY_V1.md (Decision 222 Part 8's
-- own finding, re-confirmed unchanged through this session's programme
-- completion register): no `retired`/`exposed_in_released_mock`
-- eligibility_status value or equivalent mechanism exists anywhere in
-- this schema. Mathematics Mock 1's 56 rows must not be reused in a
-- future Mock "by policy, not by any schema enforcement" -- a real,
-- standing gap this migration closes with the smallest durable addition,
-- not a new subsystem.
--
-- ============================================================
-- WHY A VIEW, NOT A NEW TABLE OR A NEW eligibility_status VALUE
-- ============================================================
-- `ali_mock_form.question_manifest` (migration 070) is already the
-- authoritative, per-form membership record -- every question a form has
-- ever referenced, including Mathematics Mock 1's frozen 56-row manifest
-- (migrations 147/150, byte-verified against each other at activation
-- time). Duplicating that into a second table would create a second
-- source of truth that could drift. This migration adds a read-only,
-- purely additive VIEW that aggregates `question_manifest` across every
-- row `ali_mock_form` has ever held -- Mathematics Mock 1's rows are
-- covered automatically, with no backfill needed, and any future form
-- (Mathematics Mock 2, a future English Mock) is covered the moment its
-- row is inserted, with no further migration required.
--
-- Not an ALTER on `ali_question_bank.eligibility_status` (a `check`-
-- constrained enum-like column read by pervasive existing serving code):
-- adding a new value there risks changing behaviour of code paths this
-- migration has no way to audit exhaustively. A separate, additive view
-- has zero blast radius on existing serving.
--
-- ============================================================
-- ACCESS CONTROL
-- ============================================================
-- `ali_mock_form` itself has been admin-only-read since migration 071
-- (no anon/authenticated SELECT policy -- RLS denies by default). This
-- view must not reopen that: it is created with no grant to anon or
-- authenticated. It is reachable only via a direct database connection
-- (Supabase Dashboard > SQL Editor, the same manual-application path
-- every migration in this programme already uses) -- consistent with
-- this migration itself being NOT APPLIED / Founder-only, like every
-- other migration in this repository.
--
-- ============================================================
-- USAGE (for the next Mock composition increment, English or Mathematics)
-- ============================================================
-- select question_id from public.ali_mock_retired_question_ids
-- where question_id = any(array[...candidate ids...]);
--
-- A future Mock composer (run by the Founder via Dashboard, or a
-- service-role script) should exclude any id returned by this view from
-- a fresh composition. This migration does not wire the view into any
-- application code path -- no composition increment currently exists to
-- wire it into; wiring happens when a real Mock composition is built.
--
-- Fail-closed / idempotent: `create or replace view` is safe to re-run.
-- No existing table, column, row, or RLS policy is altered.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query.

begin;

create or replace view public.ali_mock_retired_question_ids as
select distinct
  (elem ->> 'question_id') as question_id,
  form.id as form_id,
  form.attempt_type,
  form.active,
  form.created_at as form_created_at
from public.ali_mock_form as form
cross join lateral jsonb_array_elements(form.question_manifest) as elem;

comment on view public.ali_mock_retired_question_ids is
  'Every question_id ever referenced by any ali_mock_form.question_manifest, across every form this programme has ever created (active or not). A future Mock composition (English or a later Mathematics Mock) must exclude these ids from a fresh form. Admin-only: no SELECT grant to anon/authenticated, matching ali_mock_form''s own RLS posture since migration 071.';

revoke all on public.ali_mock_retired_question_ids from public;
revoke all on public.ali_mock_retired_question_ids from anon;
revoke all on public.ali_mock_retired_question_ids from authenticated;

commit;
