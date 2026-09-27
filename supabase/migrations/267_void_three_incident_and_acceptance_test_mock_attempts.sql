-- 267_void_three_incident_and_acceptance_test_mock_attempts.sql
--
-- GOVERNED VOID OF EXACTLY THREE MOCK ATTEMPTS (Founder-approved targets,
-- 2026-09-27), using ONLY the mechanism Migration 266 created and
-- production-verified:
--
--   9ae70cee-3cde-47da-96e0-c0eecfcddda3  -> platform_defect
--       English full mock created by the statically pre-rendered mock-exam
--       page losing its subject query (fixed e609d95, hardened 63a1c40 and
--       migration 265). 0 answers, report unreleased, not EI-ingested.
--   0f98b4fd-a247-4ffc-a49f-df5581d65f95  -> acceptance_test
--       Founder production acceptance test (Mathematics Mock 1).
--   cb04cc9f-b311-485a-9b3e-1e1ba93077b7  -> acceptance_test
--       Founder production acceptance test (Reading Comprehension Mock 1).
--
-- WHAT THIS DOES
--   - Calls public.mock_void_attempt_core() (owner-only, never granted to an
--     API role) three times, actor 'migration:267', no profile. The core
--     writes the protected audit row and sets status = 'voided'; nothing else.
--   - Preserves every original record and historical relationship: the
--     attempt rows (only status changes), answers, flags, reports, writing
--     assessments and manual-mark audit are not touched, and nothing is
--     deleted (no DELETE, no TRUNCATE).
--   - Each voided attempt stops occupying its cycle subject slot (266's
--     partial unique index), can never be released, ingested into EI,
--     marked, resumed or counted toward a cycle/readiness (266's guards).
--
-- WHAT IT REFUSES TO DO
--   Every target is pinned by full id AND profile, cycle, subject, form,
--   type and status. If any of those differs from the state reviewed on
--   2026-09-27 (for example a target was submitted or expired since), or 266
--   is not in place, or anything is already voided, the whole migration
--   aborts and changes nothing. It voids no other attempt.
--
-- PROOF INSIDE THE TRANSACTION (aborts and rolls back on any mismatch)
--   - digest of EVERY non-target attempt and of every attempt-linked table
--     row (answers, flags, reports, writing assessments, manual-mark audit)
--     of non-targets is identical before and after;
--   - the targets' own attempt rows (excluding status) and all their linked
--     rows are identical before and after;
--   - exactly three attempts are voided and exactly three audit rows exist
--     with the expected reason, prior status and actor;
--   - the question-exposure view and the cycle-slot index are unchanged.
--
-- Does not touch: forms, manifests, questions, scoring, timing, RLS,
-- PIN/learner identity, functions, or migrations 260-266.
--
-- NOT APPLIED. Founder applies via Supabase Dashboard > SQL Editor as one
-- execution, ONCE, after approval. Requires 266 already applied.

begin;

-- Block concurrent writes to the attempt table for the few milliseconds this
-- takes (reads continue), so the before/after proof cannot be disturbed.
lock table public.ali_mock_attempt in share row exclusive mode;

-- Digest helper: session-local, dropped at the end.
--   p_inside = false -> everything belonging to attempts NOT in p_ids
--   p_inside = true  -> the targets' own rows (attempt rows minus `status`)
create function pg_temp.m267_digest(p_ids uuid[], p_inside boolean)
returns text
language plpgsql
as $$
declare
  v_out text := '';
begin
  if p_inside then
    select md5(coalesce(string_agg((to_jsonb(t) - 'status')::text, '|' order by (to_jsonb(t) - 'status')::text), ''))
      into v_out from public.ali_mock_attempt t where t.id = any(p_ids);
  else
    select md5(coalesce(string_agg(to_jsonb(t)::text, '|' order by to_jsonb(t)::text), ''))
      into v_out from public.ali_mock_attempt t where t.id <> all(p_ids);
  end if;
  v_out := v_out
    || (select md5(coalesce(string_agg(to_jsonb(t)::text, '|' order by to_jsonb(t)::text), '')) from public.ali_mock_attempt_answer t where (t.attempt_id = any(p_ids)) = p_inside)
    || (select md5(coalesce(string_agg(to_jsonb(t)::text, '|' order by to_jsonb(t)::text), '')) from public.ali_mock_attempt_flag t where (t.attempt_id = any(p_ids)) = p_inside)
    || (select md5(coalesce(string_agg(to_jsonb(t)::text, '|' order by to_jsonb(t)::text), '')) from public.ali_mock_attempt_report t where (t.attempt_id = any(p_ids)) = p_inside)
    || (select md5(coalesce(string_agg(to_jsonb(t)::text, '|' order by to_jsonb(t)::text), '')) from public.ali_writing_assessment t where (t.attempt_id = any(p_ids)) = p_inside)
    || (select md5(coalesce(string_agg(to_jsonb(t)::text, '|' order by to_jsonb(t)::text), '')) from public.ali_mock_manual_mark_audit t where (t.attempt_id = any(p_ids)) = p_inside);
  return md5(v_out);
end;
$$;

do $m267$
declare
  c_defect  constant uuid := '9ae70cee-3cde-47da-96e0-c0eecfcddda3';
  c_math    constant uuid := '0f98b4fd-a247-4ffc-a49f-df5581d65f95';
  c_reading constant uuid := 'cb04cc9f-b311-485a-9b3e-1e1ba93077b7';
  v_ids     constant uuid[] := array['9ae70cee-3cde-47da-96e0-c0eecfcddda3', '0f98b4fd-a247-4ffc-a49f-df5581d65f95', 'cb04cc9f-b311-485a-9b3e-1e1ba93077b7']::uuid[];
  v_spec    record;
  v_row     public.ali_mock_attempt;
  v_others_before  text;
  v_targets_before text;
  v_exposure_before text;
  v_index_before   text;
  v_n int;
begin
  -- ---------- PRECONDITIONS ----------
  if to_regclass('public.ali_mock_attempt_void_audit') is null
     or to_regprocedure('public.mock_void_attempt_core(uuid,text,text,uuid,text)') is null then
    raise exception '267 precondition failed: Migration 266 is not applied';
  end if;
  v_index_before := (select indexdef from pg_indexes where schemaname = 'public' and indexname = 'ali_mock_attempt_cycle_subject_unique');
  if v_index_before is null or v_index_before not like '%(status <> ''voided''::text)%' then
    raise exception '267 precondition failed: cycle subject index does not exclude voided attempts (266 not in place)';
  end if;
  if exists (select 1 from public.ali_mock_attempt where status = 'voided')
     or exists (select 1 from public.ali_mock_attempt_void_audit) then
    raise exception '267 precondition failed: a voided attempt or audit row already exists -- this migration must run once, on a clean 266 state';
  end if;

  -- Each target: exact identity and state as reviewed 2026-09-27.
  for v_spec in
    select * from (values
      (c_defect,  'submitted',   '86b9841c-edac-4648-b590-f567fdbc09ce'::uuid, '4e6bfadc-399c-4470-91b0-911f39f62fb4'::uuid, 'english',     'english-full-mock-v1',          'full_mock',      'platform_defect'),
      (c_math,    'in_progress', '7e9cd8d1-d4c6-4652-8df1-018d0299e7f1'::uuid, '61520859-c2da-468a-bd9d-f8e9e2472861'::uuid, 'mathematics', 'first-mock-mathematics-v1',    'full_mock',      'acceptance_test'),
      (c_reading, 'in_progress', '7e9cd8d1-d4c6-4652-8df1-018d0299e7f1'::uuid, null::uuid,                                   null::text,    'reading-comprehension-mock-1',  'timed_section',  'acceptance_test')
    ) as t(id, status, profile_id, cycle_id, subject, form_id, attempt_type, reason)
  loop
    select * into v_row from public.ali_mock_attempt where id = v_spec.id;
    if not found then
      raise exception '267 precondition failed: target % does not exist', v_spec.id;
    end if;
    if v_row.status <> v_spec.status
       or v_row.profile_id <> v_spec.profile_id
       or v_row.cycle_id is distinct from v_spec.cycle_id
       or v_row.subject is distinct from v_spec.subject
       or v_row.form_id <> v_spec.form_id
       or v_row.attempt_type <> v_spec.attempt_type then
      raise exception '267 precondition failed: target % is not in the reviewed state (found status=%, form=%, subject=%) -- aborting, nothing changed', v_spec.id, v_row.status, v_row.form_id, v_row.subject;
    end if;
  end loop;

  -- None of the three has a released report or any evidence in EI.
  if exists (select 1 from public.ali_mock_attempt_report where attempt_id = any(v_ids)
             and (report_release_state = 'released' or ei_evidence_ingested_at is not null)) then
    raise exception '267 precondition failed: a target has a released report or standard EI evidence';
  end if;
  if exists (select 1 from public.ali_writing_assessment where attempt_id = any(v_ids) and ei_evidence_ingested_at is not null) then
    raise exception '267 precondition failed: a target has Writing evidence in EI';
  end if;
  -- The defect attempt has exactly its reviewed pending, scored report.
  select count(*) into v_n from public.ali_mock_attempt_report
   where attempt_id = c_defect and report_release_state = 'pending' and ei_evidence_ingested_at is null;
  if v_n <> 1 then
    raise exception '267 precondition failed: the defect attempt does not have its reviewed unreleased report';
  end if;

  -- ---------- SNAPSHOT ----------
  v_others_before   := pg_temp.m267_digest(v_ids, false);
  v_targets_before  := pg_temp.m267_digest(v_ids, true);
  v_exposure_before := md5(pg_get_viewdef('public.ali_mock_exposed_question_ids'::regclass));

  -- ---------- GOVERNED VOIDS (266's core: audit row first, then status) ----------
  perform public.mock_void_attempt_core(
    c_defect, 'platform_defect',
    'Confirmed platform defect: English full mock created because the pre-rendered mock-exam page lost its subject query (fixed e609d95, hardened 63a1c40 and migration 265). Founder-approved void, Migration 267.',
    null, 'migration:267');
  perform public.mock_void_attempt_core(
    c_math, 'acceptance_test',
    'Founder production acceptance test (Mathematics Mock 1, 2026-09-24). Not a genuine learner assessment. Founder-approved void, Migration 267.',
    null, 'migration:267');
  perform public.mock_void_attempt_core(
    c_reading, 'acceptance_test',
    'Founder production acceptance test (Reading Comprehension Mock 1, 2026-09-24). Not a genuine learner assessment. Founder-approved void, Migration 267.',
    null, 'migration:267');

  -- ---------- POSTCONDITIONS ----------
  -- Exactly these three are voided.
  if (select count(*) from public.ali_mock_attempt where status = 'voided') <> 3
     or exists (select 1 from public.ali_mock_attempt where status = 'voided' and id <> all(v_ids)) then
    raise exception '267 postcondition failed: the set of voided attempts is not exactly the three targets';
  end if;
  select count(*) into v_n from public.ali_mock_attempt where id = any(v_ids) and status = 'voided';
  if v_n <> 3 then
    raise exception '267 postcondition failed: not every target is voided';
  end if;

  -- Exactly three audit rows, each as approved.
  if (select count(*) from public.ali_mock_attempt_void_audit) <> 3 then
    raise exception '267 postcondition failed: audit row count is not 3';
  end if;
  for v_spec in
    select * from (values
      (c_defect,  'submitted',   'platform_defect'),
      (c_math,    'in_progress', 'acceptance_test'),
      (c_reading, 'in_progress', 'acceptance_test')
    ) as t(id, status_before, reason)
  loop
    if not exists (select 1 from public.ali_mock_attempt_void_audit
                   where attempt_id = v_spec.id and status_before_void = v_spec.status_before
                     and reason_code = v_spec.reason and voided_by_actor = 'migration:267'
                     and voided_by_profile_id is null and internal_note is not null) then
      raise exception '267 postcondition failed: audit record for % is not as approved', v_spec.id;
    end if;
  end loop;

  -- Nothing else moved: non-target rows identical; target rows identical except status.
  if pg_temp.m267_digest(v_ids, false) <> v_others_before then
    raise exception '267 postcondition failed: a non-target attempt or a row linked to one changed';
  end if;
  if pg_temp.m267_digest(v_ids, true) <> v_targets_before then
    raise exception '267 postcondition failed: a target''s preserved record (beyond its status) changed';
  end if;

  -- Exposure retained; slot index unchanged; the three slots are free.
  if md5(pg_get_viewdef('public.ali_mock_exposed_question_ids'::regclass)) <> v_exposure_before then
    raise exception '267 postcondition failed: question exposure view changed';
  end if;
  if (select indexdef from pg_indexes where schemaname = 'public' and indexname = 'ali_mock_attempt_cycle_subject_unique') is distinct from v_index_before then
    raise exception '267 postcondition failed: cycle subject index changed';
  end if;
  if exists (select 1 from public.ali_mock_attempt a
             where a.status <> 'voided' and a.cycle_id is not null
               and (a.cycle_id, a.subject) in (select cycle_id, subject from public.ali_mock_attempt where id = any(v_ids) and cycle_id is not null)) then
    raise exception '267 postcondition failed: a voided target''s cycle subject slot is still occupied';
  end if;
end;
$m267$;

drop function pg_temp.m267_digest(uuid[], boolean);

commit;

-- ============================================================
-- POST-APPLICATION VERIFICATION (read-only)
-- ============================================================
-- select left(a.id::text, 8), a.status, au.reason_code, au.status_before_void, au.voided_by_actor, au.voided_at
--   from ali_mock_attempt a left join ali_mock_attempt_void_audit au on au.attempt_id = a.id
--   where a.status = 'voided';                                   -- exactly 9ae70cee, 0f98b4fd, cb04cc9f
-- select status, count(*) from ali_mock_attempt group by 1;      -- voided=3; others as before
-- select count(*) from ali_mock_attempt_void_audit;               -- 3
--
-- ROLLBACK: none by design. A void is terminal and append-only. If a target
-- was voided in error, record an 'admin_correction' decision and create a
-- new attempt; do not edit the audit trail.
