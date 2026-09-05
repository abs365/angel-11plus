-- Angel Digital 11+ — Migration 231
-- ali_question_family Pathway Backfill Repair (Question Factory Wave 2,
-- post-application defect fix). Additive-only forward repair — migration
-- 228 is NOT edited, per instruction; it is already applied to
-- production.
--
-- ============================================================
-- ROOT CAUSE (full analysis: ANGEL_QUESTION_FACTORY_WAVE2_MIGRATION_
-- SAFETY_GATE.md, "POST-APPLICATION DEFECT FOUND")
-- ============================================================
-- Migration 228's backfill computed pathways as:
--   coalesce(to_jsonb((array_agg(distinct pathway))[1]), '[]'::jsonb)
-- `ali_question_bank.pathway` is `text[]`. PostgreSQL's `array_agg`
-- aggregate has a dedicated overload for array-typed inputs
-- (`array_agg(anyarray) -> anyarray`) that builds a genuine
-- TWO-DIMENSIONAL array when aggregating several `text[]` values. A
-- single, non-slice subscript (`[1]`) applied to a multi-dimensional
-- array is documented PostgreSQL behaviour to return `NULL` (fewer
-- subscripts than dimensions -> NULL, never a sub-array, unlike most
-- general-purpose languages). `to_jsonb(NULL)` is `NULL`, and the
-- `coalesce` then silently substituted the empty-array default — masking
-- the failure completely, for every family, regardless of its real
-- pathway value. Confirmed against real production data: `mr01-decimal-
-- computation`'s 7 real source rows all carry `pathway = ["csse"]`, yet
-- its `ali_question_family` row showed `pathways = []`.
--
-- ============================================================
-- THE FIX
-- ============================================================
-- Flatten every family's member rows' pathway arrays via `unnest()`
-- BEFORE aggregating, so `array_agg()` operates over scalar `text`
-- values (never a nested array), producing a genuine one-dimensional
-- array that `to_jsonb()` converts correctly into a real JSON array of
-- strings. `distinct ... order by ...` deduplicates and gives a stable,
-- deterministic element order (a real, disclosed design choice — not
-- required for correctness, but makes the result reproducible and
-- trivially diffable on re-run). `coalesce(b.pathway, '{}'::text[])`
-- defends against a hypothetical NULL pathway value even though the
-- column is `NOT NULL` today (fail-safe, not a claim that NULLs occur).
--
-- ============================================================
-- PRODUCTION SAFETY
-- ============================================================
-- - Touches ONLY `ali_question_family.pathways` (and its own
--   `updated_at` timestamp) — no other column on this table, and no
--   other table anywhere, is written by this migration. Confirmed by
--   this migration's own single UPDATE statement, structurally tested.
-- - Read-only against `ali_question_bank` (the same authoritative source
--   migration 228 itself already used) — no learner response, attempt,
--   report, question text, mark, or family_id value is read for any
--   destructive purpose or written to at all.
-- - No RLS/grant/policy change of any kind — `ali_question_family`'s
--   admin-only SELECT policy from migration 228 is completely untouched.
-- - Idempotent: re-running this migration recomputes and re-applies the
--   same correct value every time; running it twice in a row produces
--   byte-identical results.
-- - A family with no source rows at all after this migration's own
--   `recomputed` CTE (i.e. no matching `ali_question_bank.family_id`) is
--   simply not touched — its `pathways` value is left exactly as
--   migration 228 last set it, never forced to a guessed value.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations 070-230
-- (per this arc's own standing record) have already been applied.

begin;

with recomputed as (
  select b.family_id, array_agg(distinct p order by p) as flat_pathways
  from public.ali_question_bank b
  cross join lateral unnest(coalesce(b.pathway, '{}'::text[])) as p
  where b.family_id is not null
  group by b.family_id
)
update public.ali_question_family f
set pathways = coalesce(to_jsonb(r.flat_pathways), '[]'::jsonb),
    updated_at = now()
from recomputed r
where f.family_id = r.family_id;

do $$
declare
  v_still_empty_but_should_not_be integer;
  v_updated_rows integer;
begin
  get diagnostics v_updated_rows = row_count;

  select count(*) into v_still_empty_but_should_not_be
  from public.ali_question_family f
  where f.pathways = '[]'::jsonb
    and exists (
      select 1 from public.ali_question_bank b
      where b.family_id = f.family_id and array_length(b.pathway, 1) > 0
    );

  if v_still_empty_but_should_not_be > 0 then
    raise exception 'Migration 231: % family record(s) still show an empty pathways array despite having a real, non-empty source pathway -- repair did not fully succeed', v_still_empty_but_should_not_be;
  end if;

  raise notice 'Migration 231: % family record(s) updated. 0 families remain incorrectly empty. Repair verified.', v_updated_rows;
end $$;

commit;
