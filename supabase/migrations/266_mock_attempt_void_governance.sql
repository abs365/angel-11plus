-- 266_mock_attempt_void_governance.sql
--
-- INVALID MOCK ATTEMPT GOVERNANCE -- a terminal, auditable `voided` state
-- for a Mock attempt that must not count as a genuine assessment (a
-- confirmed platform defect, a Founder acceptance test, or an admin
-- correction). Founder-approved design (2026-09-24).
--
-- WHAT A VOIDED ATTEMPT IS
--   - Preserved: the attempt row, answers, flags, report row, cycle_id,
--     manual-mark audit and writing assessments. Nothing is deleted or
--     rewritten except the attempt's own status.
--   - Terminal: once voided, the row can never be updated again (trigger).
--   - Private governance record: WHY/WHO/WHEN lives only in
--     ali_mock_attempt_void_audit (append-only, RLS on, no policies,
--     no API-role privileges). ali_mock_attempt -- which learners and
--     parents can read for their own attempts -- gains nothing but the
--     terminal 'voided' status. A trigger makes a void without its audit
--     row impossible, even for the database owner.
--   - Excluded from: cycle subject-slot occupancy, cycle completion, resume,
--     report release, standard EI evidence ingestion, Writing EI evidence
--     ingestion and manual marking.
--   - Still counts as QUESTION EXPOSURE: ali_mock_exposed_question_ids
--     counts any attempt on a form. The learner genuinely saw the
--     questions, so that view is deliberately NOT changed.
--
-- WHY THE FUNCTION CHANGES ARE LIVE-BODY PATCHES, NOT RESTATEMENTS
--   Migration 260 rewrote these function bodies dynamically at apply time
--   (auth-based profile lookups -> current_learner_id() /
--   current_account_default_learner_id()). The repository's last explicit
--   definitions (migrations 145, 244, 247, 252) are therefore NOT the live
--   source of truth; restating them would silently undo learner isolation.
--   Each function below is patched in place from its LIVE definition:
--     1. precondition: md5(prosrc) equals the fingerprint read live on
--        2026-09-24 via read-only MCP -- any drift aborts the migration;
--     2. the anchor text must occur exactly once;
--     3. one guard is inserted (or, for mock_create_cycle_attempt, one
--        clause extended) and the function is re-executed via
--        CREATE OR REPLACE, which keeps its owner and ACL;
--     4. postcondition: removing the inserted text reproduces the original
--        body exactly (same md5), and the ACL is unchanged.
--
-- LIVE FINGERPRINTS (md5 of pg_proc.prosrc, 2026-09-24):
--   mock_release_report                   505771fd51ab3b622b42350857f9a44c
--   mock_claim_evidence_ingestion         771c152496f8a9ff45024a353dd181f7
--   mock_claim_writing_evidence_ingestion ad316557ee01a4775bd9a6bcd58ed000
--   mock_apply_manual_mark                05a5816c5bcda0bff17813263e949ea7
--   mock_create_cycle_attempt             6df9c89ed9f183ccc5136d57d82623f7
--
-- NO learner/parent write path is added. ali_mock_attempt keeps RLS with
-- SELECT-only policies, so no client can UPDATE a status. Voiding is only
-- possible through mock_void_attempt() (admin-only) or the owner-only
-- internal helper (for a future governed migration such as 267).
--
-- Does not touch: forms, manifests, questions, answers, scoring, timing,
-- RLS policies, PIN/learner identity functions, migrations 260-265.
--
-- NOT APPLIED. Founder applies via Supabase Dashboard > SQL Editor as one
-- execution, after review.

begin;

-- ============================================================
-- 0. PRECONDITIONS -- live table state is exactly what was reviewed
-- ============================================================
do $pre$
begin
  if (select pg_get_constraintdef(oid) from pg_constraint
      where conrelid = 'public.ali_mock_attempt'::regclass and conname = 'ali_mock_attempt_status_check')
     is distinct from 'CHECK ((status = ANY (ARRAY[''assigned''::text, ''ready''::text, ''in_progress''::text, ''submitted''::text, ''expired''::text])))' then
    raise exception '266 precondition failed: ali_mock_attempt_status_check differs from the reviewed live definition';
  end if;
  if (select indexdef from pg_indexes where schemaname = 'public' and indexname = 'ali_mock_attempt_cycle_subject_unique')
     is distinct from 'CREATE UNIQUE INDEX ali_mock_attempt_cycle_subject_unique ON public.ali_mock_attempt USING btree (cycle_id, subject) WHERE (cycle_id IS NOT NULL)' then
    raise exception '266 precondition failed: ali_mock_attempt_cycle_subject_unique differs from the reviewed live definition';
  end if;
  if to_regclass('public.ali_mock_attempt_void_audit') is not null then
    raise exception '266 precondition failed: ali_mock_attempt_void_audit already exists';
  end if;
end;
$pre$;

-- ============================================================
-- 1. STATUS + PROTECTED AUDIT TABLE
-- ============================================================
alter table public.ali_mock_attempt drop constraint ali_mock_attempt_status_check;
alter table public.ali_mock_attempt add constraint ali_mock_attempt_status_check
  check (status = any (array['assigned', 'ready', 'in_progress', 'submitted', 'expired', 'voided']));

-- One row per voided attempt, never updated or deleted. Not part of the
-- learner assessment record: no learner/parent read or write path exists.
create table public.ali_mock_attempt_void_audit (
  attempt_id           uuid primary key references public.ali_mock_attempt(id),
  status_before_void   text not null check (status_before_void = any (array['assigned', 'ready', 'in_progress', 'submitted', 'expired'])),
  reason_code          text not null check (reason_code = any (array['platform_defect', 'acceptance_test', 'admin_correction'])),
  internal_note        text,
  voided_at            timestamptz not null default now(),
  voided_by_profile_id uuid references public.profiles(id),
  voided_by_actor      text not null check (btrim(voided_by_actor) <> '')
);

alter table public.ali_mock_attempt_void_audit enable row level security;
-- Deliberately NO policies and no privileges for any API role: RLS alone
-- would already refuse every row; revoking privileges refuses the table.
-- RLS is not FORCEd: the owner-run governed void path must be able to write.
revoke all on table public.ali_mock_attempt_void_audit from public, anon, authenticated, service_role;

create function public.mock_attempt_void_audit_append_only()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  raise exception 'ali_mock_attempt_void_audit is append-only -- % is refused', tg_op;
end;
$$;

revoke all on function public.mock_attempt_void_audit_append_only() from public, anon, authenticated, service_role;

create trigger mock_attempt_void_audit_append_only_trigger
  before update or delete on public.ali_mock_attempt_void_audit
  for each row execute function public.mock_attempt_void_audit_append_only();

-- ============================================================
-- 2. SLOT RELEASE -- a voided attempt never occupies its cycle subject slot
-- ============================================================
drop index public.ali_mock_attempt_cycle_subject_unique;
create unique index ali_mock_attempt_cycle_subject_unique
  on public.ali_mock_attempt (cycle_id, subject)
  where cycle_id is not null and status <> 'voided';

-- ============================================================
-- 3. TERMINAL STATE + AUDIT PAIRING
-- ============================================================
-- A voided row can never change again, no row can be created voided, and
-- no row can become voided unless its audit record already exists.
create function public.mock_attempt_void_is_terminal()
returns trigger
language plpgsql
set search_path = public
as $$
begin
  if tg_op = 'INSERT' then
    if new.status = 'voided' then
      raise exception 'An attempt cannot be created voided';
    end if;
    return new;
  end if;
  if old.status = 'voided' then
    raise exception 'Attempt % is voided -- a voided attempt is terminal and cannot be changed', old.id;
  end if;
  if new.status = 'voided' and not exists (select 1 from public.ali_mock_attempt_void_audit where attempt_id = new.id) then
    raise exception 'Attempt % cannot be voided without its governance audit record', new.id;
  end if;
  return new;
end;
$$;

revoke all on function public.mock_attempt_void_is_terminal() from public, anon, authenticated, service_role;

create trigger mock_attempt_void_is_terminal_trigger
  before insert or update on public.ali_mock_attempt
  for each row execute function public.mock_attempt_void_is_terminal();

-- ============================================================
-- 4. LIVE-BODY PATCHES (fingerprint-pinned, anchored, postcondition-checked)
-- ============================================================
do $patch$
declare
  v_spec    record;
  v_oid     oid;
  v_src     text;
  v_def     text;
  v_new_def text;
  v_new_src text;
  v_acl     text;
  v_hits    int;
begin
  for v_spec in
    select * from (values
      -- (function signature, pinned md5 of prosrc, anchor, replacement = guard + anchor)
      ('public.mock_release_report(uuid)',
       '505771fd51ab3b622b42350857f9a44c',
       'update public.ali_mock_attempt_report',
       'if exists (select 1 from public.ali_mock_attempt where id = p_attempt_id and status = ''voided'') then' || E'\r\n' ||
       '    raise exception ''Report for attempt % cannot be released: the attempt is voided'', p_attempt_id;' || E'\r\n' ||
       '  end if;' || E'\r\n\r\n  ' ||
       'update public.ali_mock_attempt_report'),
      ('public.mock_claim_evidence_ingestion(uuid)',
       '771c152496f8a9ff45024a353dd181f7',
       'select * into v_report from public.ali_mock_attempt_report',
       'if v_attempt.status = ''voided'' then' || E'\r\n' ||
       '    raise exception ''Attempt % is voided -- refusing to derive evidence from a voided attempt'', p_attempt_id;' || E'\r\n' ||
       '  end if;' || E'\r\n\r\n  ' ||
       'select * into v_report from public.ali_mock_attempt_report'),
      ('public.mock_claim_writing_evidence_ingestion(uuid, text)',
       'ad316557ee01a4775bd9a6bcd58ed000',
       'update public.ali_writing_assessment',
       'if exists (select 1 from public.ali_mock_attempt where id = p_attempt_id and status = ''voided'') then' || E'\r\n' ||
       '    raise exception ''Attempt % is voided -- refusing to derive Writing evidence from a voided attempt'', p_attempt_id;' || E'\r\n' ||
       '  end if;' || E'\r\n\r\n  ' ||
       'update public.ali_writing_assessment'),
      ('public.mock_apply_manual_mark(uuid, text, numeric)',
       '05a5816c5bcda0bff17813263e949ea7',
       'if v_attempt.status <> ''submitted'' then',
       'if v_attempt.status = ''voided'' then' || E'\r\n' ||
       '    raise exception ''Attempt % is voided -- a voided attempt is never marked'', p_attempt_id;' || E'\r\n' ||
       '  end if;' || E'\r\n  ' ||
       'if v_attempt.status <> ''submitted'' then'),
      ('public.mock_create_cycle_attempt(text, uuid)',
       '6df9c89ed9f183ccc5136d57d82623f7',
       'where cycle_id = p_cycle_id and subject = v_form.subject',
       'where cycle_id = p_cycle_id and subject = v_form.subject and status <> ''voided''')
    ) as t(sig, pinned_md5, anchor, replacement)
  loop
    v_oid := v_spec.sig::regprocedure;
    select prosrc, proacl::text into v_src, v_acl from pg_proc where oid = v_oid;

    if md5(v_src) <> v_spec.pinned_md5 then
      raise exception '266: live body of % has drifted from the reviewed fingerprint (expected %, found %)', v_spec.sig, v_spec.pinned_md5, md5(v_src);
    end if;

    v_hits := (length(v_src) - length(replace(v_src, v_spec.anchor, ''))) / length(v_spec.anchor);
    if v_hits <> 1 then
      raise exception '266: anchor for % found % times, expected exactly 1', v_spec.sig, v_hits;
    end if;

    v_def := pg_get_functiondef(v_oid);
    v_new_def := replace(v_def, v_spec.anchor, v_spec.replacement);
    execute v_new_def;

    select prosrc into v_new_src from pg_proc where oid = v_oid;
    if md5(replace(v_new_src, v_spec.replacement, v_spec.anchor)) <> v_spec.pinned_md5 then
      raise exception '266: postcondition failed for % -- the patched body differs from the original by more than the one guard', v_spec.sig;
    end if;
    if position(v_spec.replacement in v_new_src) = 0 then
      raise exception '266: postcondition failed for % -- guard not present after patch', v_spec.sig;
    end if;
    if (select proacl::text from pg_proc where oid = v_oid) is distinct from v_acl then
      raise exception '266: postcondition failed for % -- ACL changed', v_spec.sig;
    end if;
  end loop;
end;
$patch$;

-- ============================================================
-- 5. VOIDING -- owner-only core + admin-only public entry point
-- ============================================================
-- Core: every safeguard lives here, so the admin RPC and any future
-- governed migration (e.g. 267, run as the database owner with an explicit
-- 'migration:NNN' actor) enforce exactly the same rules. Never granted to
-- any API role.
create function public.mock_void_attempt_core(
  p_attempt_id       uuid,
  p_reason_code      text,
  p_note             text,
  p_actor_profile_id uuid,
  p_actor            text
)
returns public.ali_mock_attempt
language plpgsql
set search_path = public
as $$
declare
  v_attempt public.ali_mock_attempt;
  v_report  public.ali_mock_attempt_report;
begin
  if p_reason_code is null or p_reason_code <> all (array['platform_defect', 'acceptance_test', 'admin_correction']) then
    raise exception 'Invalid void reason code %', p_reason_code;
  end if;
  if p_actor is null or btrim(p_actor) = '' then
    raise exception 'A void must name its actor';
  end if;

  select * into v_attempt from public.ali_mock_attempt where id = p_attempt_id for update;
  if not found then
    raise exception 'Attempt % not found', p_attempt_id;
  end if;
  if v_attempt.status = 'voided' then
    raise exception 'Attempt % is already voided', p_attempt_id;
  end if;

  select * into v_report from public.ali_mock_attempt_report where attempt_id = p_attempt_id for update;
  if found then
    if v_report.report_release_state = 'released' then
      raise exception 'Attempt % has a released report -- a released result cannot be voided', p_attempt_id;
    end if;
    if v_report.ei_evidence_ingested_at is not null then
      raise exception 'Attempt % has already entered Educational Intelligence evidence -- it cannot be voided', p_attempt_id;
    end if;
  end if;
  if exists (select 1 from public.ali_writing_assessment
             where attempt_id = p_attempt_id and ei_evidence_ingested_at is not null) then
    raise exception 'Attempt % has Writing evidence already in Educational Intelligence -- it cannot be voided', p_attempt_id;
  end if;

  insert into public.ali_mock_attempt_void_audit
    (attempt_id, status_before_void, reason_code, internal_note, voided_by_profile_id, voided_by_actor)
  values
    (p_attempt_id, v_attempt.status, p_reason_code, p_note, p_actor_profile_id, p_actor);

  update public.ali_mock_attempt
  set status = 'voided'
  where id = p_attempt_id
  returning * into v_attempt;

  return v_attempt;
end;
$$;

revoke all on function public.mock_void_attempt_core(uuid, text, text, uuid, text) from public, anon, authenticated, service_role;

-- Admin entry point. The actor is always derived from the session, never a
-- parameter. Learners and parents can never void (not admin).
create function public.mock_void_attempt(p_attempt_id uuid, p_reason_code text, p_note text default null)
returns table (attempt_id uuid, status text, voided_at timestamptz)
language plpgsql
security definer
set search_path = public
as $$
declare
  v_actor_profile_id uuid;
  v_row public.ali_mock_attempt;
begin
  if not public.is_current_user_admin() then
    raise exception 'Only an admin may void a Mock attempt';
  end if;

  v_actor_profile_id := public.current_account_default_learner_id();
  if v_actor_profile_id is null then
    raise exception 'Admin profile could not be resolved for the current session';
  end if;

  v_row := public.mock_void_attempt_core(p_attempt_id, p_reason_code, p_note, v_actor_profile_id, 'admin:' || v_actor_profile_id::text);
  return query select v_row.id, v_row.status, au.voided_at from public.ali_mock_attempt_void_audit au where au.attempt_id = v_row.id;
end;
$$;

revoke all on function public.mock_void_attempt(uuid, text, text) from public, anon;
grant execute on function public.mock_void_attempt(uuid, text, text) to authenticated;

-- ============================================================
-- 6. POSTCONDITIONS
-- ============================================================
do $post$
begin
  if exists (select 1 from public.ali_mock_attempt where status = 'voided')
     or exists (select 1 from public.ali_mock_attempt_void_audit) then
    raise exception '266 postcondition failed: this migration must not void any attempt';
  end if;
  if exists (select 1 from information_schema.role_table_grants
             where table_schema = 'public' and table_name = 'ali_mock_attempt_void_audit'
               and grantee in ('anon', 'authenticated', 'service_role', 'PUBLIC')) then
    raise exception '266 postcondition failed: void audit table is reachable by an API role';
  end if;
  if exists (select 1 from pg_policies where schemaname = 'public' and tablename = 'ali_mock_attempt_void_audit') then
    raise exception '266 postcondition failed: void audit table must have no policies';
  end if;
  if (select indexdef from pg_indexes where schemaname = 'public' and indexname = 'ali_mock_attempt_cycle_subject_unique')
     not like '%WHERE ((cycle_id IS NOT NULL) AND (status <> ''voided''::text))' then
    raise exception '266 postcondition failed: cycle subject index predicate';
  end if;
  if pg_get_viewdef('public.ali_mock_exposed_question_ids'::regclass) not like '%EXISTS ( SELECT 1%FROM ali_mock_attempt attempt%WHERE (attempt.form_id = form.id)%' then
    raise exception '266 postcondition failed: question exposure view changed';
  end if;
end;
$post$;

commit;

-- ============================================================
-- POST-APPLICATION VERIFICATION (read-only)
-- ============================================================
-- select count(*) filter (where status = 'voided') from public.ali_mock_attempt;          -- 0
-- select count(*) from public.ali_mock_attempt_void_audit;                                  -- 0
-- select grantee, privilege_type from information_schema.role_table_grants
--   where table_name = 'ali_mock_attempt_void_audit';                                      -- postgres only
-- select indexdef from pg_indexes where indexname = 'ali_mock_attempt_cycle_subject_unique'; -- ... AND (status <> 'voided')
-- select proname, md5(prosrc) from pg_proc where proname in ('mock_release_report', 'mock_claim_evidence_ingestion',
--   'mock_claim_writing_evidence_ingestion', 'mock_apply_manual_mark', 'mock_create_cycle_attempt');  -- all changed, guards present
-- select proname, proacl from pg_proc where proname in ('mock_void_attempt', 'mock_void_attempt_core', 'mock_attempt_void_is_terminal');
--   -- mock_void_attempt: authenticated (+owner); core and trigger fn: owner only

-- ============================================================
-- ROLLBACK (only while no attempt has status 'voided' and the audit table is empty)
-- ============================================================
-- begin;
-- drop function public.mock_void_attempt(uuid, text, text);
-- drop function public.mock_void_attempt_core(uuid, text, text, uuid, text);
-- drop trigger mock_attempt_void_is_terminal_trigger on public.ali_mock_attempt;
-- drop function public.mock_attempt_void_is_terminal();
-- drop table public.ali_mock_attempt_void_audit;
-- drop function public.mock_attempt_void_audit_append_only();
-- -- For each patched function: re-execute pg_get_functiondef() with the
-- -- inserted guard text removed (the exact inverse of section 4's replace),
-- -- then assert md5(prosrc) equals the pinned fingerprint above.
-- drop index public.ali_mock_attempt_cycle_subject_unique;
-- create unique index ali_mock_attempt_cycle_subject_unique on public.ali_mock_attempt (cycle_id, subject) where cycle_id is not null;
-- alter table public.ali_mock_attempt drop constraint ali_mock_attempt_status_check;
-- alter table public.ali_mock_attempt add constraint ali_mock_attempt_status_check
--   check (status = any (array['assigned', 'ready', 'in_progress', 'submitted', 'expired']));
-- commit;
