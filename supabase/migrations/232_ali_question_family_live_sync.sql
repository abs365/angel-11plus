-- Angel Digital 11+ — Migration 232
-- ali_question_family Live Sync (Educational Foundation Completion
-- increment). ALREADY APPLIED TO PRODUCTION by the Founder, in a
-- hardened form beyond this file's original draft — this file has been
-- corrected in place to match exactly what is live, per this
-- repository's own established convention for reconciling source
-- control to an already-applied migration (matching migrations 163/227's
-- own precedent).
--
-- ============================================================
-- CORRECTION HISTORY (production reconciliation, 2026-09-06)
-- ============================================================
-- The original draft of this migration inferred, from Q3/Q4 evidence
-- alone (17 Writing bank rows, 16 distinct family_id values, every
-- family showing row_count=1), that some existing Writing family must
-- hold 2 live bank rows invisible to `ali_question_family`. **That
-- inference is now disproven by direct post-application production
-- evidence**: writing_total_rows=17, writing_rows_with_family=16,
-- writing_rows_without_family=1, writing_distinct_families=16. The
-- 17-vs-16 discrepancy was caused by ONE UNFAMILIED WRITING ROW
-- (`family_id is null`), not by a stale row_count hiding a second row
-- inside an existing family. This file's root-cause narrative below is
-- corrected to state this precisely — see
-- `ANGEL_EDUCATIONAL_FOUNDATION_COMPLETION_REPORT.md` Section B for the
-- full correction record.
--
-- This does NOT mean the migration itself was unnecessary. The
-- SEPARATE, still entirely real architectural weakness this migration
-- exists to close — `ali_question_family` was a one-time backfill
-- snapshot (migration 228's `on conflict (family_id) do nothing`) with
-- no ongoing synchronisation mechanism — is independently proven and
-- independently fixed, confirmed by the post-application verification
-- query returning `stale_family_row_counts = 0`. The Writing
-- discrepancy simply turned out to have a different, simpler cause than
-- originally hypothesised; the underlying snapshot-not-a-live-table
-- problem this migration fixes was real regardless, and remains fixed.
--
-- The originally-drafted version of this migration is ALSO hardened
-- beyond its own first draft, in the form actually applied to
-- production:
--   A. Explicit `revoke all ... from public, anon, authenticated` on
--      both functions (defence in depth beyond relying on no grant
--      ever having been issued).
--   B. Zero-member families are NORMALISED, not left untouched: their
--      historical identity (family_id, subject) is preserved, but
--      row_count is set to 0, production_eligible to false, and every
--      derived field (skills/question_types/pathways/difficulty_range)
--      is cleared — a family with no live members cannot honestly claim
--      any of those as current.
--   C. The one-time corrective pass ALSO walks every existing
--      `ali_question_family` record with zero live bank members (a
--      family whose last row was deleted or re-familied away since
--      migration 228's backfill), not only family_id values currently
--      present in the bank.
--   D. The fail-closed verification uses a LEFT JOIN/COALESCE against
--      live bank data so EVERY family record — including a genuinely
--      zero-member one — is checked, and additionally verifies no
--      zero-member family remains `production_eligible = true`.
--   E. `ali_sync_question_family` fails closed (`RAISE EXCEPTION`) if a
--      single `family_id` spans more than one `subject` in live data,
--      rather than arbitrarily picking `(array_agg(distinct subject))[1]`
--      the way migration 228's own original backfill did.
--
-- Migration 231 (pathway backfill repair) has ALREADY been Founder-
-- applied and production-verified by the time this migration was
-- written and applied — this file no longer describes 231 as pending.
--
-- ============================================================
-- WHY THIS EXISTS (the real, still-valid architectural reason)
-- ============================================================
-- Migration 228's backfill, unedited since it was written:
--   insert into public.ali_question_family (...)
--   select ... from public.ali_question_bank ... group by family_id
--   on conflict (family_id) do nothing;
-- `on conflict (family_id) do nothing` means the backfill runs EXACTLY
-- ONCE per family_id, ever. Any `ali_question_bank` row inserted,
-- updated, or deleted for an EXISTING family_id afterwards is silently
-- invisible to `ali_question_family`: its `row_count`, `skills`,
-- `question_types`, `pathways`, and `difficulty_range` stay frozen at
-- their backfill-time values forever, with no mechanism to ever refresh
-- them. Migration 231 already had to perform exactly this kind of
-- one-off repair for the `pathways` column alone, for an unrelated bug
-- in the SAME backfill statement. This migration generalises that
-- lesson: a one-time backfill with no ongoing sync is not a live table,
-- it is a snapshot that goes stale the moment content changes.
--
-- ============================================================
-- THE FIX
-- ============================================================
-- 1. `ali_sync_question_family(p_family_id)` — recomputes ONE family's
--    row_count/subject/skills/question_types/pathways/difficulty_range/
--    production_eligible fresh from live `ali_question_bank` data and
--    upserts it. Fails closed on a cross-subject family_id. Normalises
--    (never deletes) a zero-member family, per (B) above.
-- 2. A trigger on `ali_question_bank` (AFTER INSERT OR UPDATE OR DELETE)
--    calls it for the affected family_id(s) on every future change, so
--    this class of staleness cannot recur.
-- 3. A one-time corrective pass applies it to every family_id currently
--    in `ali_question_bank`, AND to every existing zero-member
--    `ali_question_family` record, per (C) above.
--
-- ============================================================
-- PRODUCTION SAFETY
-- ============================================================
-- - Touches ONLY `ali_question_family`. Zero writes to
--   `ali_question_bank`, `ali_question_candidate`, or any learner/
--   mock/result table.
-- - No RLS/policy change — `ali_question_family`'s existing admin-only
--   SELECT policy (migration 228) is untouched. Both functions are
--   SECURITY DEFINER with a safe search_path, and are now explicitly
--   revoked from PUBLIC/anon/authenticated (A above) — only the trigger
--   and this migration's own one-time DO block ever invoke them.
-- - No family record is ever deleted.
-- - Idempotent throughout: re-running this migration recomputes and
--   re-applies the same correct values every time.
--
-- ALREADY APPLIED TO PRODUCTION (in this exact, hardened form). This
-- file is retained as the accurate historical record and for CI/test
-- purposes — it must NOT be re-applied, and no migration 233 exists or
-- is needed to layer further changes on top of it.

begin;

create or replace function public.ali_sync_question_family(p_family_id text)
returns void
language plpgsql
security definer
set search_path = public
as $$
declare
  v_subject text;
  v_distinct_subject_count integer;
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

  select count(distinct subject) into v_distinct_subject_count
  from public.ali_question_bank
  where family_id = p_family_id;

  if v_distinct_subject_count > 1 then
    raise exception 'ali_sync_question_family: family_id % spans % distinct subjects -- refusing to arbitrarily choose one. Investigate before this family can be synced.', p_family_id, v_distinct_subject_count;
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
    -- Zero-member family: preserve the historical record's identity
    -- (family_id, subject untouched) rather than deleting it, but
    -- normalise every derived field honestly -- a family with no live
    -- members cannot claim a current skill, question type, pathway,
    -- difficulty range, or production eligibility.
    update public.ali_question_family
    set row_count = 0,
        production_eligible = false,
        skills = '{}',
        question_types = '{}',
        pathways = '[]'::jsonb,
        difficulty_range = '{}',
        updated_at = now()
    where family_id = p_family_id;

    raise notice 'ali_sync_question_family: family_id % has zero live ali_question_bank rows -- record preserved, normalised to row_count=0/production_eligible=false, derived fields cleared.', p_family_id;
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
  'Migration 232 -- recomputes one ali_question_family row fresh from live ali_question_bank data. Fails closed on a cross-subject family_id. Normalises (never deletes) a zero-member family. Called by the trigger below and by this migration''s own one-time corrective pass. Revoked from anon/authenticated -- see the explicit REVOKE below.';

revoke all on function public.ali_sync_question_family(text) from public, anon, authenticated;

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

revoke all on function public.ali_question_bank_family_sync_trigger() from public, anon, authenticated;

drop trigger if exists ali_question_bank_family_sync on public.ali_question_bank;
create trigger ali_question_bank_family_sync
  after insert or update or delete on public.ali_question_bank
  for each row
  execute function public.ali_question_bank_family_sync_trigger();

-- One-time corrective pass -- fixes any subject's real staleness as of
-- today (Writing's own actual cause turned out to be one unfamilied
-- row, not staleness -- see CORRECTION HISTORY above; other subjects'
-- families may still have genuinely stale aggregates this pass
-- corrects), using the exact same function the trigger now runs on
-- every future change. Also normalises every EXISTING zero-member
-- family record, per (C) above -- these are invisible to the first
-- loop (which only iterates family_id values currently present in the
-- bank).
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

  for v_family_id in
    select f.family_id
    from public.ali_question_family f
    left join public.ali_question_bank b on b.family_id = f.family_id
    where b.family_id is null
  loop
    perform public.ali_sync_question_family(v_family_id);
    v_refreshed_count := v_refreshed_count + 1;
  end loop;

  raise notice 'Migration 232: refreshed % family record(s) (including zero-member normalisation) from live ali_question_bank data. Trigger installed for ongoing sync.', v_refreshed_count;
end $$;

-- Fail-closed verification, via LEFT JOIN/COALESCE so a genuinely
-- zero-member family is checked too (a plain INNER JOIN would silently
-- skip it): every family_id's stored row_count must now exactly match
-- a live recount (0 for a zero-member family), for every subject, and
-- no zero-member family may remain production_eligible.
do $$
declare
  v_mismatch_count integer;
  v_zero_member_still_eligible integer;
begin
  select count(*) into v_mismatch_count
  from public.ali_question_family f
  left join (
    select family_id, count(*) as live_row_count
    from public.ali_question_bank
    where family_id is not null
    group by family_id
  ) live on live.family_id = f.family_id
  where f.row_count <> coalesce(live.live_row_count, 0);

  if v_mismatch_count > 0 then
    raise exception 'Migration 232: % family record(s) still show a stale row_count after the corrective pass -- repair did not fully succeed.', v_mismatch_count;
  end if;

  select count(*) into v_zero_member_still_eligible
  from public.ali_question_family f
  left join public.ali_question_bank b on b.family_id = f.family_id
  where b.family_id is null and f.production_eligible = true;

  if v_zero_member_still_eligible > 0 then
    raise exception 'Migration 232: % zero-member family record(s) still show production_eligible=true after the corrective pass -- repair did not fully succeed.', v_zero_member_still_eligible;
  end if;

  raise notice 'Migration 232: verified -- 0 family records have a stale row_count, 0 zero-member families remain production_eligible. Repair confirmed.';
end $$;

commit;
