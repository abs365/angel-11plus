-- Angel Digital 11+ — Migration 232
-- ali_question_family Live Sync (Educational Foundation Completion
-- increment) — repairs the proven root cause of the Writing row_count
-- discrepancy the Founder found via Q3/Q4, and closes it permanently
-- with a trigger, not just a one-time patch.
--
-- ============================================================
-- ROOT CAUSE (proven from migration source, no live admin query needed)
-- ============================================================
-- Founder's Q3/Q4 evidence: 17 live `ali_question_bank` rows for
-- subject='writing' across 16 distinct family_id values, yet Q4's own
-- `ali_question_family.row_count` read back exactly 1 for EVERY one of
-- those 16 family records. Sixteen families each genuinely showing
-- row_count=1 while the bank holds 17 rows means at least one family_id
-- now has 2 live bank rows whose second row's existence is invisible to
-- `ali_question_family` entirely.
--
-- This is fully explained by migration 228's own backfill, unedited
-- since it was written:
--   insert into public.ali_question_family (...)
--   select ... from public.ali_question_bank ... group by family_id
--   on conflict (family_id) do nothing;
-- `on conflict (family_id) do nothing` means the backfill runs EXACTLY
-- ONCE per family_id, ever. Any `ali_question_bank` row inserted for an
-- EXISTING family_id afterwards — including every row added by every
-- content migration since 228 was applied — is silently invisible to
-- `ali_question_family`: its `row_count`, `skills`, `question_types`,
-- and `difficulty_range` stay frozen at their backfill-time values
-- forever, with no mechanism to ever refresh them. Migration 231
-- (still unapplied) already had to perform exactly this kind of one-off
-- repair for the `pathways` column alone, for an unrelated bug in the
-- SAME backfill statement — this migration generalises that lesson: a
-- one-time backfill with no ongoing sync is not a live table, it is a
-- snapshot that goes stale the moment content changes, and every
-- aggregate column on it is equally exposed, not just the one column
-- each prior repair happened to target.
--
-- ============================================================
-- THE FIX
-- ============================================================
-- 1. `ali_sync_question_family(p_family_id)` — recomputes ONE family's
--    row_count/subject/skills/question_types/pathways/difficulty_range/
--    production_eligible fresh from live `ali_question_bank` data, using
--    the SAME correct (post-231) unnest-based pathway logic, and upserts
--    it. A family_id with zero live member rows is left untouched and
--    reported via RAISE NOTICE — this migration never deletes a family
--    record; that is a content-governance decision, not a bookkeeping
--    sync.
-- 2. A trigger on `ali_question_bank` (AFTER INSERT OR UPDATE OR DELETE)
--    calls it for the affected family_id(s) on every future change, so
--    this specific class of staleness cannot recur.
-- 3. A one-time corrective pass applies it to every family_id currently
--    in `ali_question_bank`, fixing the Writing discrepancy (and any
--    other subject's equivalent, unreported staleness) as of today.
--
-- Deliberately independent of migration 231: this migration's own
-- pathway computation is already correct (the same unnest-before-
-- aggregate fix), so applying 232 alone also fixes the pathways bug as
-- a side effect, regardless of whether 231 has been applied yet.
-- Applying both, in either order, is safe and idempotent.
--
-- ============================================================
-- PRODUCTION SAFETY
-- ============================================================
-- - Touches ONLY `ali_question_family` (updated_at included) and adds
--   exactly one new trigger + two new functions. Zero writes to
--   `ali_question_bank` or any other table.
-- - No RLS/grant/policy change — `ali_question_family`'s existing
--   admin-only SELECT policy (migration 228) is untouched; the new
--   functions are SECURITY DEFINER with a safe search_path (matching
--   this codebase's own established convention for functions that must
--   run regardless of the invoking role's own RLS visibility), and are
--   never granted EXECUTE to anon/authenticated — only the trigger and
--   this migration's own one-time DO block ever call them.
-- - Idempotent throughout: re-running this migration recomputes and
--   re-applies the same correct values every time.
-- - A family with zero live member rows is left exactly as it was
--   (never deleted, never zeroed), and is reported by name.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations 070-231
-- (per this arc's own standing record) have already been applied.

begin;

create or replace function public.ali_sync_question_family(p_family_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_subject text;
  v_skills text[];
  v_question_types text[];
  v_difficulty_range text[];
  v_production_eligible boolean;
  v_row_count integer;
  v_pathways jsonb;
begin
  if p_family_id is null then
    return;
  end if;

  select
    (array_agg(distinct subject))[1],
    array_agg(distinct skill),
    array_agg(distinct question_type),
    array_agg(distinct content_difficulty::text),
    bool_or(eligibility_status in ('practice_eligible', 'mock_eligible')),
    count(*)
  into v_subject, v_skills, v_question_types, v_difficulty_range, v_production_eligible, v_row_count
  from public.ali_question_bank
  where family_id = p_family_id;

  if v_row_count is null or v_row_count = 0 then
    raise notice 'ali_sync_question_family: family_id % has zero live ali_question_bank rows -- family record (if any) left untouched, not deleted.', p_family_id;
    return;
  end if;

  select coalesce(to_jsonb(array_agg(distinct p order by p)), '[]'::jsonb)
  into v_pathways
  from public.ali_question_bank b
  cross join lateral unnest(coalesce(b.pathway, '{}'::text[])) as p
  where b.family_id = p_family_id;

  insert into public.ali_question_family (
    family_id, subject, skills, question_types, pathways,
    difficulty_range, generation_strategy, production_eligible, row_count, updated_at
  )
  values (
    p_family_id, v_subject, v_skills, v_question_types, v_pathways,
    v_difficulty_range, 'hand_authored', v_production_eligible, v_row_count, now()
  )
  on conflict (family_id) do update set
    subject = excluded.subject,
    skills = excluded.skills,
    question_types = excluded.question_types,
    pathways = excluded.pathways,
    difficulty_range = excluded.difficulty_range,
    production_eligible = excluded.production_eligible,
    row_count = excluded.row_count,
    updated_at = now();
end;
$$;

comment on function public.ali_sync_question_family(text) is
  'Migration 232 -- recomputes one ali_question_family row fresh from live ali_question_bank data. Called by the trigger below and by this migration''s own one-time corrective pass. Never granted to anon/authenticated.';

create or replace function public.ali_question_bank_family_sync_trigger()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if tg_op = 'DELETE' then
    perform public.ali_sync_question_family(old.family_id);
    return old;
  end if;

  perform public.ali_sync_question_family(new.family_id);
  if tg_op = 'UPDATE' and old.family_id is distinct from new.family_id then
    perform public.ali_sync_question_family(old.family_id);
  end if;
  return new;
end;
$$;

drop trigger if exists ali_question_bank_family_sync on public.ali_question_bank;
create trigger ali_question_bank_family_sync
  after insert or update or delete on public.ali_question_bank
  for each row
  execute function public.ali_question_bank_family_sync_trigger();

-- One-time corrective pass -- fixes the Writing discrepancy (and any
-- other subject's equivalent, currently-unreported staleness) as of
-- today, using the exact same function the trigger now runs on every
-- future change.
do $$
declare
  v_family_id text;
  v_refreshed_count integer := 0;
begin
  for v_family_id in
    select distinct family_id from public.ali_question_bank where family_id is not null
  loop
    perform public.ali_sync_question_family(v_family_id);
    v_refreshed_count := v_refreshed_count + 1;
  end loop;

  raise notice 'Migration 232: refreshed % family record(s) from live ali_question_bank data. Trigger installed for ongoing sync.', v_refreshed_count;
end $$;

-- Fail-closed verification: every family_id's stored row_count must now
-- exactly match a live recount, for every subject, not just Writing.
do $$
declare
  v_mismatch_count integer;
begin
  select count(*) into v_mismatch_count
  from public.ali_question_family f
  join (
    select family_id, count(*) as live_row_count
    from public.ali_question_bank
    where family_id is not null
    group by family_id
  ) live on live.family_id = f.family_id
  where f.row_count <> live.live_row_count;

  if v_mismatch_count > 0 then
    raise exception 'Migration 232: % family record(s) still show a stale row_count after the corrective pass -- repair did not fully succeed.', v_mismatch_count;
  end if;

  raise notice 'Migration 232: verified -- 0 family records have a stale row_count. Repair confirmed.';
end $$;

commit;
