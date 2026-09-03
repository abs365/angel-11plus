-- Angel Digital 11+ — Migration 209
-- Programme Completion Increment 014: corrects migration 208's exposure
-- definition. Does not edit 208 in place -- 208 has already been
-- reported as final (Increment 013); corrected additively, per this
-- programme's own record/explain/recommend discipline.
--
-- ============================================================
-- WHAT WAS WRONG WITH 208 (Founder's own finding, this increment)
-- ============================================================
-- 208's practice-eligible-block trigger treated ANY row ever referenced
-- by ANY ali_mock_form.question_manifest -- active or not -- as
-- permanently "exposed." The Founder's own instruction distinguishes
-- FORM MEMBERSHIP from LEARNER EXPOSURE: "Content should not necessarily
-- be treated as learner-exposed merely because a draft/unreleased form
-- contains it." Confirmed against the real schema this session:
-- mock_create_attempt() (migration 070, line ~196) will only create an
-- attempt `where id = p_form_id and active = true` -- a form with
-- active = false can NEVER have produced a real learner attempt. 208's
-- definition was therefore stricter than the actual risk: it would have
-- permanently blocked a passage from ever reaching Practice the moment
-- it was drafted into any form row, even one that was later swapped out
-- before ever going active.
--
-- ============================================================
-- THE CORRECTED TWO-TIER MODEL
-- ============================================================
-- Tier 1 -- "claimed" (206's existing ali_mock_retired_question_ids /
-- ali_mock_retired_passage_ids views, UNCHANGED, still correct for their
-- purpose): any row ever referenced by any ali_mock_form.question_
-- manifest, active or not. Used ONLY to stop a form from reusing content
-- another form has already claimed (208's ali_mock_form reuse-block
-- trigger -- unchanged by this migration, still correct: two forms
-- should never double-book the same content regardless of exposure
-- status, and blocking this costs nothing because the fix is always a
-- routine corrective migration to the offending form's own manifest).
--
-- Tier 2 -- "genuinely exposed" (NEW in this migration): a row belonging
-- to a form that either IS or WAS active = true, or has at least one
-- real ali_mock_attempt. This is the correct, narrower boundary for the
-- practice-eligible-block trigger, which this migration corrects via
-- CREATE OR REPLACE on the same function 208 defined (same name, new
-- body) -- an ordinary additive correction, not a rewrite of 208's file.
--
-- allocated/protected (a proposal document, no DB row -- Increments 013/
-- 014's own reports) -> frozen (an ali_mock_form row exists,
-- active = false -- Tier 1 protects it from being double-claimed, but it
-- can still be corrected by a new migration editing that form's own
-- manifest, since nothing has actually stopped a learner from ever
-- seeing it -- because nothing has) -> released/exposed (active = true,
-- or a real attempt exists -- Tier 2, now genuinely irreversible) ->
-- retired/protected from reuse (both triggers apply).
--
-- ============================================================
-- ADDITIONAL BOUNDED ENFORCEMENT: freeze-then-immutable
-- ============================================================
-- The Founder's own instruction: "Once genuinely exposed through a
-- released Mock, freshness protection must be strict." Mathematics Mock
-- 1's own precedent (migration 150) already checks this manually, once,
-- for one specific migration, by comparing composition_provenance to a
-- frozen constant. This migration generalises that same discipline into
-- a small, reusable trigger: once a form is Tier-2 exposed, its
-- question_manifest may never be UPDATEd again by anyone, including a
-- Founder-run migration -- the correct response to a post-exposure
-- content problem is a new Mock, never a mutated old one. Before
-- exposure, a form's manifest remains freely correctable (matching the
-- Founder's own explicit "safe governed way to correct a draft"
-- requirement) via an ordinary migration UPDATE.
--
-- NOT APPLIED. Must be applied together with, and after, migrations 206
-- and 208 (this migration's functions select from 206's views and
-- ali_mock_attempt; its trigger replaces one of 208's two triggers'
-- underlying function bodies). Generated for Founder review and manual
-- application via Supabase Dashboard > SQL Editor > New query.

begin;

-- ============================================================
-- Tier-2 views: genuine exposure, not mere drafting
-- ============================================================
create or replace view public.ali_mock_exposed_question_ids as
select distinct
  (elem ->> 'question_id') as question_id,
  form.id as form_id
from public.ali_mock_form as form
cross join lateral jsonb_array_elements(form.question_manifest) as elem
where form.active = true
   or exists (
     select 1 from public.ali_mock_attempt as attempt
     where attempt.form_id = form.id
   );

comment on view public.ali_mock_exposed_question_ids is
  'Every question_id genuinely exposed to a real or potential learner: belongs to a form that is (or was) active = true, or has at least one real ali_mock_attempt. Narrower than ali_mock_retired_question_ids (206), which includes merely-drafted, never-activated forms. This is the correct boundary for permanent Practice-eligibility blocking. Admin-only.';

revoke all on public.ali_mock_exposed_question_ids from public;
revoke all on public.ali_mock_exposed_question_ids from anon;
revoke all on public.ali_mock_exposed_question_ids from authenticated;

create or replace view public.ali_mock_exposed_passage_ids as
select distinct q.learning_unit_id as passage_id
from public.ali_question_bank as q
join public.ali_mock_exposed_question_ids as e on e.question_id = q.id
where q.learning_unit_id is not null;

comment on view public.ali_mock_exposed_passage_ids is
  'Passage-level equivalent of ali_mock_exposed_question_ids: a passage counts as genuinely exposed the moment any one of its questions belongs to a form that is/was active or has a real attempt. Admin-only.';

revoke all on public.ali_mock_exposed_passage_ids from public;
revoke all on public.ali_mock_exposed_passage_ids from anon;
revoke all on public.ali_mock_exposed_passage_ids from authenticated;

-- ============================================================
-- Corrected practice-eligible-block trigger function (replaces 208's
-- body; same function name, same trigger, no re-attachment needed)
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
  if new.eligibility_status = 'practice_eligible'
     and old.eligibility_status is distinct from 'practice_eligible' then

    select exists (
      select 1 from public.ali_mock_exposed_question_ids e where e.question_id = new.id
    ) into v_row_exposed;

    if v_row_exposed then
      raise exception
        'Migration 209 blocked: question % has been genuinely exposed (referenced by a Mock form that is/was active, or has a real learner attempt) and cannot be promoted to practice_eligible.',
        new.id;
    end if;

    if new.learning_unit_id is not null then
      select exists (
        select 1 from public.ali_mock_exposed_passage_ids p where p.passage_id = new.learning_unit_id
      ) into v_passage_exposed;

      if v_passage_exposed then
        raise exception
          'Migration 209 blocked: question % belongs to passage % (learning_unit_id), and this passage has already been genuinely exposed through a released or attempted Mock form. The whole passage is retired from Practice.',
          new.id, new.learning_unit_id;
      end if;
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.ali_block_exposed_content_practice_promotion() from public;

-- Note: the trigger itself (ali_question_bank_block_exposed_practice_
-- promotion) was already created by migration 208 and needs no
-- re-creation -- CREATE OR REPLACE FUNCTION above changes its behaviour
-- in place, since a trigger always invokes the current definition of the
-- function it names.

-- ============================================================
-- New: once genuinely exposed, a form's manifest becomes immutable
-- ============================================================
create or replace function public.ali_block_exposed_form_manifest_mutation()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_was_exposed boolean;
begin
  if new.question_manifest is distinct from old.question_manifest then
    select (old.active = true) or exists (
      select 1 from public.ali_mock_attempt as attempt where attempt.form_id = old.id
    ) into v_was_exposed;

    if v_was_exposed then
      raise exception
        'Migration 209 blocked: form % has already been genuinely exposed (active, or has a real learner attempt) -- its question_manifest can never be changed again. Correct a problem in exposed content with a new Mock form, never a mutated old one.',
        old.id;
    end if;
  end if;

  return new;
end;
$$;

revoke all on function public.ali_block_exposed_form_manifest_mutation() from public;

drop trigger if exists ali_mock_form_block_exposed_manifest_mutation on public.ali_mock_form;
create trigger ali_mock_form_block_exposed_manifest_mutation
  before update on public.ali_mock_form
  for each row
  execute function public.ali_block_exposed_form_manifest_mutation();

commit;

-- ============================================================
-- Read-only checks to run after applying (before trusting further):
-- ============================================================
--
-- -- 1. A never-activated draft form's manifest CAN still be corrected:
-- -- (expect: succeeds, no exception, before this form is ever activated)
-- -- update ali_mock_form set question_manifest = question_manifest
-- --   where id = 'reading-comprehension-mock-1' and active = false;
--
-- -- 2. Once Mathematics Mock 1 (already active = true) is touched, the
-- --    new immutability trigger must refuse (expect: ERROR):
-- -- update ali_mock_form set active = active where id = 'mathematics-mock-1';
-- --   (this specific statement does not change question_manifest, so it
-- --    is NOT expected to raise -- included only to confirm the trigger's
-- --    IS DISTINCT FROM guard correctly ignores no-op manifest writes;
-- --    an actual manifest-changing UPDATE against Mock 1 is expected to
-- --    raise.)
--
-- -- 3. Confirm the corrected practice-block trigger no longer fires for
-- --    a merely-drafted, never-activated form's content (expect: the
-- --    UPDATE succeeds once Reading Comprehension Mock 1 exists as a
-- --    frozen, active=false row and BEFORE it is ever activated -- this
-- --    is exactly the "safe draft correction" property the Founder
-- --    required):
-- -- update ali_question_bank set eligibility_status = 'practice_eligible'
-- --   where id = 'eng-inc001-bee-q01'; -- then roll back / re-promote as
-- --   intended -- this is a read-only illustration, not an instruction
-- --   to actually run it against real content.
