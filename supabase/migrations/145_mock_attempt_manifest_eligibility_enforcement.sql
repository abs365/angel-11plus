-- Angel Digital 11+ — Migration 145
-- Mathematics First Mock — Attempt-Creation Eligibility Enforcement
-- (Decision 210 Part 3/7, Decision 212).
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS
-- ============================================================
-- Decision 210 Part 7 disclosed, from direct source reading, that
-- `mock_create_attempt()` (migration 070, amended by migration 085) and
-- `mock_create_cycle_attempt()` (migration 085) do NOT themselves
-- require every question id in a form's `question_manifest` to carry
-- `eligibility_status = 'mock_eligible'`. Both functions trust the
-- manifest itself as the authorization boundary at attempt-creation
-- time -- migration 070's own header discloses this explicitly as "a
-- named residual hardening item for a future increment, not
-- overlooked." `mock_get_question()` (migration 070/106) then serves
-- whatever id is in `assigned_question_ids`, also without re-checking
-- `eligibility_status`.
--
-- INVESTIGATED DIRECTLY THIS SESSION (not re-asserted from Decision
-- 210's own prose): re-read migrations 070, 085, and 106 in full. The
-- practical exploitability of this gap today is bounded -- `ali_mock_form`
-- has an admin-only write RLS policy (`is_current_user_admin()`,
-- migration 070), so no anon/authenticated caller can insert an
-- arbitrary manifest directly. But the gap is still real: (1) it is a
-- genuine "convention, not structure" pattern -- exactly the defect
-- class Decision 59 (Mock Content Firewall) closed elsewhere in this
-- programme, where relying on an upstream actor's own care rather than a
-- database-enforced gate was treated as unacceptable once a real,
-- reachable path existed; (2) the First Mock composition/freeze
-- capability this migration accompanies (Decision 212) is the first
-- capability in this repository that could plausibly propose a real
-- `ali_mock_form` row for Founder approval -- closing this gap NOW, before
-- any such row is ever inserted, is materially cheaper and safer than
-- discovering it after a mistaken or malicious manifest has already
-- reached a learner. Answer to the governing directive's own question:
-- YES, a learner attempt could currently be created using question ids
-- that are not mock_eligible, if any actor with `ali_mock_form` write
-- access (today: an admin only) ever inserted such a manifest -- closed
-- here at the smallest safe database boundary.
--
-- ============================================================
-- THE FIX: one new internal helper, called from both attempt-creation
-- entry points, never granted directly
-- ============================================================
-- `mock_validate_manifest_eligibility(text[])` is a SECURITY DEFINER
-- function, never exposed to anon/authenticated (mirrors
-- `mock_cycle_is_open()`'s own established "internal helper, never
-- granted" pattern from migration 085 exactly) that rejects, closing
-- every case the governing directive named:
--   - a question id whose `eligibility_status` is anything other than
--     'mock_eligible' (this rejects `authentic_assessment_candidate`,
--     `independently_validated`, `provisional`, and `practice_eligible`
--     alike -- the same single-status contract `isMockEligibleCandidate()`
--     (lib/ali/mockEligibility.ts) already enforces in application code,
--     now also enforced in the database);
--   - an inactive question (`active <> true`);
--   - an unknown question id (no matching row in `ali_question_bank` at
--     all);
--   - a partially-selected grouped family (some, but not all, of a
--     `question_group_id` group's own mock_eligible/active siblings
--     present in the manifest) -- generic over `question_group_id`,
--     never a hardcoded family list, matching migration 106/112's own
--     established discipline that grouping logic must never be
--     family-name-coupled;
--   - a malformed manifest (empty, or containing a duplicate question
--     id).
-- Called from both `mock_create_attempt()` and
-- `mock_create_cycle_attempt()` before either ever inserts an attempt --
-- both remain the sole two attempt-creation entry points (migration 085
-- already restricted `full_mock` exclusively to the cycle-aware
-- function). `mock_get_question()`/`mock_submit_answer()` are correctly
-- left unchanged: once an attempt legitimately exists, its own
-- `assigned_question_ids` is by then already known-eligible (proven at
-- creation time by this migration), so re-checking `eligibility_status`
-- on every subsequent question fetch would be redundant, not
-- additional, safety.
--
-- ============================================================
-- COMPATIBILITY, SAFETY OF CREATE OR REPLACE
-- ============================================================
-- Both amended functions keep their exact existing signature
-- (`mock_create_attempt(text, text)` / `mock_create_cycle_attempt(text,
-- uuid)`) and existing grants (authenticated only, never anon) --
-- `CREATE OR REPLACE FUNCTION` on an unchanged signature preserves the
-- function's existing ACL (the same Postgres behaviour migration 108's
-- own header already relied on), re-stated explicitly below only for
-- clarity, matching this repository's own established convention. This
-- migration is additive-only in effect: it can only ever turn a
-- previously-succeeding `mock_create_attempt`/`mock_create_cycle_attempt`
-- call into a rejection when the manifest was genuinely invalid by the
-- criteria above -- and since `ali_mock_form` is confirmed, Founder-
-- reported, empty (0 rows) as of this migration, there is zero existing
-- production data any such rejection could ever apply to. No currently-
-- passing call path is narrowed.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does not create, modify, or reference `ali_mock_form` (no row
-- inserted, no column added -- see migration 146 for the separate,
-- additive `composition_provenance` column). Does not create a Mock
-- attempt. Does not change `mock_get_question()`, `mock_submit_answer()`,
-- `mock_start_attempt()`, `mock_score_attempt()`, or any RLS policy. Does
-- not touch `ali_question_bank` content or `eligibility_status`. Does not
-- author new content. Does not begin First Mock composition.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migration 085
-- (Founder-confirmed applied) has already been applied.

begin;

-- === Internal helper (never granted) ===================================

create or replace function public.mock_validate_manifest_eligibility(p_question_ids text[])
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_duplicate_count int;
  v_invalid_count int;
  v_bad_group_count int;
begin
  if p_question_ids is null or array_length(p_question_ids, 1) is null then
    raise exception 'Manifest contains no questions -- attempt creation refused';
  end if;

  select array_length(p_question_ids, 1) - count(distinct x) into v_duplicate_count from unnest(p_question_ids) x;
  if v_duplicate_count <> 0 then
    raise exception 'Manifest contains % duplicate question id(s) -- attempt creation refused', v_duplicate_count;
  end if;

  select count(*) into v_invalid_count
    from unnest(p_question_ids) qid
    where not exists (
      select 1 from public.ali_question_bank q
      where q.id = qid and q.eligibility_status = 'mock_eligible' and q.active = true
    );
  if v_invalid_count <> 0 then
    raise exception 'Manifest contains % question id(s) that are not mock_eligible and active -- attempt creation refused', v_invalid_count;
  end if;

  -- Grouped-family completeness: for every question_group_id represented
  -- in the manifest, every mock_eligible/active sibling of that group
  -- (anywhere in ali_question_bank) must also be present in the
  -- manifest -- generic over question_group_id, never a hardcoded family
  -- list.
  select count(*) into v_bad_group_count
  from (
    select b.question_group_id,
           count(*) filter (where b.id = any(p_question_ids)) as included,
           count(*) as total
    from public.ali_question_bank b
    where b.question_group_id in (
      select distinct q.question_group_id from public.ali_question_bank q
      where q.id = any(p_question_ids) and q.question_group_id is not null
    )
    and b.eligibility_status = 'mock_eligible' and b.active = true
    group by b.question_group_id
  ) g
  where g.included <> g.total;
  if v_bad_group_count <> 0 then
    raise exception 'Manifest includes % partially-selected grouped-question famil(y/ies) -- attempt creation refused', v_bad_group_count;
  end if;
end;
$$;
revoke all on function public.mock_validate_manifest_eligibility(text[]) from public;
-- Never granted to anon/authenticated -- internal helper only, called
-- from within this migration's own SECURITY DEFINER siblings, the same
-- mechanism mock_cycle_is_open() (migration 085) already established.

-- === mock_create_attempt: full body reproduced, one new guard added ===

create or replace function public.mock_create_attempt(p_form_id text, p_attempt_type text)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_question_ids text[];
  v_attempt_id uuid;
begin
  if p_attempt_type = 'full_mock' then
    raise exception 'full_mock attempts must be created via mock_create_cycle_attempt(form_id, cycle_id) as part of a Mock cycle -- see migration 085';
  end if;

  select id into v_profile_id from public.profiles where auth_user_id = auth.uid();
  if v_profile_id is null then
    raise exception 'No profile found for the calling user';
  end if;

  select array(select jsonb_array_elements(question_manifest)->>'question_id')
    into v_question_ids
    from public.ali_mock_form
    where id = p_form_id and active = true;
  if v_question_ids is null then
    raise exception 'Form % not found or inactive', p_form_id;
  end if;

  -- NEW (migration 145): every manifest question must be mock_eligible,
  -- active, and (for a grouped family) fully represented before an
  -- attempt is ever created from it.
  perform public.mock_validate_manifest_eligibility(v_question_ids);

  insert into public.ali_mock_attempt (profile_id, form_id, attempt_type, status, assigned_question_ids)
  values (v_profile_id, p_form_id, p_attempt_type, 'assigned', v_question_ids)
  returning id into v_attempt_id;

  return v_attempt_id;
end;
$$;
revoke all on function public.mock_create_attempt(text, text) from public;
grant execute on function public.mock_create_attempt(text, text) to authenticated;

-- === mock_create_cycle_attempt: full body reproduced, one new guard added ===

create or replace function public.mock_create_cycle_attempt(p_form_id text, p_cycle_id uuid)
returns uuid
language plpgsql
security definer
set search_path = public
as $$
declare
  v_profile_id uuid;
  v_cycle public.ali_mock_cycle;
  v_form public.ali_mock_form;
  v_question_ids text[];
  v_attempt_id uuid;
begin
  select id into v_profile_id from public.profiles where auth_user_id = auth.uid();
  if v_profile_id is null then
    raise exception 'No profile found for the calling user';
  end if;

  select * into v_cycle from public.ali_mock_cycle
    where id = p_cycle_id and profile_id = v_profile_id;
  if not found then
    raise exception 'Cycle % not found for caller', p_cycle_id;
  end if;
  if not public.mock_cycle_is_open(p_cycle_id) then
    raise exception 'Cycle % is already complete -- both papers already submitted', p_cycle_id;
  end if;

  select * into v_form from public.ali_mock_form where id = p_form_id and active = true;
  if not found then
    raise exception 'Form % not found or inactive', p_form_id;
  end if;
  if v_form.subject is null then
    raise exception 'Form % is not a subject-pure Mathematics/English paper -- a combined/legacy form cannot join a Mock cycle', p_form_id;
  end if;

  if exists (
    select 1 from public.ali_mock_attempt
    where cycle_id = p_cycle_id and subject = v_form.subject
  ) then
    raise exception 'Cycle % already has a % attempt -- one attempt per subject per cycle', p_cycle_id, v_form.subject;
  end if;

  select array(select jsonb_array_elements(question_manifest)->>'question_id')
    into v_question_ids
    from public.ali_mock_form
    where id = p_form_id;

  -- NEW (migration 145): every manifest question must be mock_eligible,
  -- active, and (for a grouped family) fully represented before an
  -- attempt is ever created from it.
  perform public.mock_validate_manifest_eligibility(v_question_ids);

  insert into public.ali_mock_attempt (profile_id, form_id, attempt_type, status, assigned_question_ids, cycle_id, subject)
  values (v_profile_id, p_form_id, 'full_mock', 'assigned', v_question_ids, p_cycle_id, v_form.subject)
  returning id into v_attempt_id;

  return v_attempt_id;
end;
$$;
revoke all on function public.mock_create_cycle_attempt(text, uuid) from public;
grant execute on function public.mock_create_cycle_attempt(text, uuid) to authenticated;

commit;
