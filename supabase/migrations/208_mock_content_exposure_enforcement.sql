-- Angel Digital 11+ — Migration 208
-- Programme Completion Increment 013: Mock content exposure ENFORCEMENT,
-- not just observability. Extends migration 206 (the read-only
-- ali_mock_retired_question_ids view) rather than editing it in place --
-- 206 has already been reported as final and reviewed once; per this
-- programme's own standing "record/explain/recommend, never silent edit"
-- discipline, this is a new, additive migration.
--
-- ============================================================
-- WHY 206 ALONE WAS INSUFFICIENT (Founder's own finding, this increment)
-- ============================================================
-- 206's view answers "what has been exposed" but enforces nothing: with
-- only 206 applied, all five of the following remain possible after a
-- real Mock release, with no database-level barrier:
--   A. an already-exposed question's eligibility_status could still be
--      set to 'practice_eligible' (no constraint prevents it);
--   B. an exposed passage's OTHER, not-yet-exposed sibling question rows
--      (same learning_unit_id) could be separately promoted to
--      practice_eligible, re-exposing the same passage into Practice
--      through a side door;
--   C. an already-exposed question could be composed into the
--      question_manifest of a second, supposedly-fresh ali_mock_form;
--   D. passage-level exposure had no dedicated, reliable lookup (only
--      row-level, via 206's view directly);
--   E. Mathematics Mock 1's exposure was represented correctly by 206
--      (its rows flow through the same view automatically), so no gap
--      there specifically -- but A-D were real, unaddressed gaps.
-- This migration closes A, B, C, and D with the smallest durable
-- mechanism available: two BEFORE triggers (fail loudly, not fail
-- silently) plus one companion passage-level view. No new table. No
-- change to ali_question_bank.eligibility_status's own check constraint
-- or values.
--
-- ============================================================
-- WHAT THIS DOES NOT DO
-- ============================================================
-- Does not touch ali_mock_form, ali_question_bank, or ali_passage_bank
-- data. Does not alter Mathematics Mock 1 or any of its rows -- Mock 1's
-- own manifest was frozen (migration 147) before this trigger could ever
-- exist and is not re-validated retroactively; these triggers only
-- constrain FUTURE writes, exactly like every other fail-closed guard in
-- this codebase (e.g. migration 069's own RLS fix, which likewise
-- protects going forward without rewriting history). Does not create a
-- content-management subsystem -- two small SECURITY DEFINER functions
-- and their triggers, reusing 206's existing view rather than
-- duplicating its logic.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query. Must be applied together
-- with (at or after) migration 206, since both new functions select from
-- 206's view.

begin;

-- ============================================================
-- Companion view: passage-level exposure (answers D directly)
-- ============================================================
-- A Reading passage's questions all share ali_question_bank.
-- learning_unit_id, which is the same literal string as the passage's
-- own ali_passage_bank.id in every batch this programme has ever
-- authored (confirmed this session against migrations 097/102/160/165).
-- A passage counts as exposed the moment ANY ONE of its question rows
-- has ever been referenced by ANY ali_mock_form.question_manifest --
-- passage-level, not question-level, exactly as the Founder's own
-- instruction requires ("Reading protection MUST operate at passage
-- level where passage reuse would break freshness").
create or replace view public.ali_mock_retired_passage_ids as
select distinct q.learning_unit_id as passage_id
from public.ali_question_bank as q
join public.ali_mock_retired_question_ids as r on r.question_id = q.id
where q.learning_unit_id is not null;

comment on view public.ali_mock_retired_passage_ids is
  'Every passage (ali_question_bank.learning_unit_id, == the matching ali_passage_bank.id in this programme''s ID convention) with at least one question ever referenced by any ali_mock_form.question_manifest. Admin-only, matching ali_mock_retired_question_ids.';

revoke all on public.ali_mock_retired_passage_ids from public;
revoke all on public.ali_mock_retired_passage_ids from anon;
revoke all on public.ali_mock_retired_passage_ids from authenticated;

-- ============================================================
-- Trigger function 1: block exposed content re-entering Practice
-- (closes A and B)
-- ============================================================
create or replace function public.ali_block_exposed_content_practice_promotion()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_row_exposed boolean;
  v_passage_exposed boolean;
begin
  -- Only constrain the specific transition into practice_eligible.
  -- Every other update (any other column, any other status value, any
  -- other transition) is untouched -- this must not interfere with any
  -- existing or future migration that does not attempt this exact move.
  if new.eligibility_status = 'practice_eligible'
     and old.eligibility_status is distinct from 'practice_eligible' then

    select exists (
      select 1 from public.ali_mock_retired_question_ids r where r.question_id = new.id
    ) into v_row_exposed;

    if v_row_exposed then
      raise exception
        'Migration 208 blocked: question % has already been referenced by a Mock form and cannot be promoted to practice_eligible. If this content genuinely needs to change status, that requires a deliberate Founder decision, not a routine promotion migration.',
        new.id;
    end if;

    if new.learning_unit_id is not null then
      select exists (
        select 1 from public.ali_mock_retired_passage_ids p where p.passage_id = new.learning_unit_id
      ) into v_passage_exposed;

      if v_passage_exposed then
        raise exception
          'Migration 208 blocked: question % belongs to passage % (learning_unit_id), and at least one sibling question from this same passage has already been referenced by a Mock form. The whole passage is retired from Practice, not just the specific rows a Mock form happened to select.',
          new.id, new.learning_unit_id;
      end if;
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.ali_block_exposed_content_practice_promotion() from public;

drop trigger if exists ali_question_bank_block_exposed_practice_promotion on public.ali_question_bank;
create trigger ali_question_bank_block_exposed_practice_promotion
  before update on public.ali_question_bank
  for each row
  execute function public.ali_block_exposed_content_practice_promotion();

-- ============================================================
-- Trigger function 2: block a Mock form from reusing already-exposed
-- content, including content from a DIFFERENT form (closes C)
-- ============================================================
create or replace function public.ali_block_mock_form_content_reuse()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_conflicting_ids text[];
begin
  select array_agg(distinct elem ->> 'question_id')
  into v_conflicting_ids
  from jsonb_array_elements(new.question_manifest) as elem
  where exists (
    select 1
    from public.ali_mock_form as existing_form
    cross join lateral jsonb_array_elements(existing_form.question_manifest) as existing_elem
    where existing_form.id is distinct from new.id
      and existing_elem ->> 'question_id' = elem ->> 'question_id'
  );

  if v_conflicting_ids is not null and array_length(v_conflicting_ids, 1) > 0 then
    raise exception
      'Migration 208 blocked: form % would reference % question(s) already present in a different ali_mock_form''s manifest: %. A form must not reuse content another form has already claimed.',
      new.id, array_length(v_conflicting_ids, 1), v_conflicting_ids;
  end if;

  return new;
end;
$$;

revoke all on function public.ali_block_mock_form_content_reuse() from public;

drop trigger if exists ali_mock_form_block_content_reuse on public.ali_mock_form;
create trigger ali_mock_form_block_content_reuse
  before insert or update on public.ali_mock_form
  for each row
  execute function public.ali_block_mock_form_content_reuse();

commit;

-- ============================================================
-- VERIFICATION -- disclosed limitation and how each scenario was checked
-- ============================================================
-- This session has no Docker/local Postgres and no service-role write
-- access to production (only the anon key, which this programme's own
-- RLS design correctly refuses write access to any of the tables this
-- migration touches). These triggers could not be executed against a
-- real database this session -- verified instead by: (1) the project's
-- own migration-sql-guard.mjs (quote-balance, RAISE-arithmetic check --
-- PASS), (2) a manual logical walkthrough of each of the five scenarios
-- against the exact trigger predicates above, reproduced in
-- ANGEL_ENGLISH_CONTENT_FOUNDATION_INCREMENT_013 (Section 2), and (3)
-- cross-checking every column/table name and JSONB access pattern
-- (question_manifest's `[{"question_id": ..., "section": ...}]` shape,
-- learning_unit_id as the passage join key) against migrations 070, 097,
-- 102, 150, and 160-165, which already use these exact shapes. Founder
-- SQL-Editor execution is the first real, live test these will receive,
-- same as every other migration in this repository -- this is disclosed,
-- not claimed as executed.
--
-- Read-only checks to run immediately after applying, before trusting it
-- further:
--
-- -- 1. Confirm the trigger blocks a direct-attack promotion attempt
-- --    (expect: ERROR, not a silent no-op) once 207 has been applied and
-- --    at least one row from it has a real ali_mock_form manifest entry:
-- -- update ali_question_bank set eligibility_status = 'practice_eligible'
-- --   where id = 'mock-eng-boathouse-q01';
--
-- -- 2. Confirm passage-level view resolves correctly:
-- -- select * from ali_mock_retired_passage_ids order by passage_id;
--
-- -- 3. Confirm Mathematics Mock 1's 56 rows are represented (Scenario E):
-- -- select count(*) from ali_mock_retired_question_ids
-- --   where form_id = (select id from ali_mock_form
-- --     where question_manifest @> '[{"question_id":"mock-mr01-directcalc-01"}]');
-- -- expect 56.
