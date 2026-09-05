-- Angel Digital 11+ — Migration 228
-- Cross-Subject Question Family Model (Question Factory Wave 1, Phase 2).
-- Additive-only, no historical migration edited in place.
--
-- ============================================================
-- CORRECTION HISTORY (unapplied migration corrected in place, per this
-- repository's own established convention)
-- ============================================================
-- Wave 2's own Migration Safety Gate (Section 1) found a real type bug in
-- the backfill: `ali_question_bank.pathway` is `text[]` (migration 005's
-- own original definition, never altered by any later migration --
-- confirmed by direct search), not `jsonb`. The original backfill assigned
-- `(array_agg(distinct pathway))[1]` (a `text[]` value) directly into this
-- table's `pathways jsonb` column, wrapped in `coalesce(..., '[]'::jsonb)`
-- -- `coalesce` requires all arguments to share a compatible type, so this
-- would have raised a type-mismatch error the moment a Founder tried to
-- apply this migration, before this migration's own sanity-check DO block
-- ever ran. Fixed by wrapping the aggregate in `to_jsonb(...)` before the
-- `coalesce`. This is the only change from the original version; every
-- other design decision below is unchanged.
--
-- ============================================================
-- WHY THIS EXISTS
-- ============================================================
-- Mathematics already has a real, live `family_id` column (migration 030)
-- grouping 301 rows into 74 families. Question Factory Wave 1 Phase 1 work
-- (same day) found English ALSO has a real, populated `family_id` on
-- 129/142 practice-eligible rows (17 families) -- a fact that had been
-- incorrectly reported as "no family concept exists for English" in prior
-- documentation, never re-verified against live data before being
-- repeated. Both subjects therefore already have the SAME real grouping
-- key; what is missing is a canonical, cross-subject FAMILY record --
-- today a family is only ever an informal grouping recovered at read time
-- by `lib/ali/questionFamilyRegistry.ts`'s `buildFamilyRegistry()`
-- (application code, no persisted family-level row of its own).
--
-- ============================================================
-- DESIGN, PER THE FOUNDER'S OWN "AVOID UNNECESSARY SCHEMA DUPLICATION"
-- INSTRUCTION
-- ============================================================
-- One new table, `ali_question_family`, ONE ROW PER FAMILY (not per
-- question) -- never duplicating per-question fields already correctly
-- living on `ali_question_bank`. `ali_question_bank.family_id` is left
-- completely unchanged (still a plain text column, no new NOT NULL
-- constraint, no foreign key added in this migration -- a hard FK would
-- reject the 13/142 English rows and any Mathematics rows with a legacy
-- family_id not yet backfilled into this table, which is a live-data
-- reconciliation question, not something this migration should risk
-- production correctness on by guessing). The relationship is a soft,
-- intentional reference (`ali_question_family.family_id` matches the same
-- text values already in `ali_question_bank.family_id`), the same
-- discipline `lib/ali/questionFamilyRegistry.ts` already uses in
-- application code.
--
-- Columns map directly onto the Founder's own ten required fields:
-- family ID, subject, competency, skill, question type, pathway,
-- preparation stage, difficulty range, reasoning structure, misconceptions
-- tested, permitted variation, generation strategy, validation strategy,
-- review status, production eligibility. Every column that cannot be
-- honestly derived from real existing data is left NULL, never fabricated
-- -- matching `questionFamilyRegistry.ts`'s own "unclassified" discipline
-- (Increment 019 Part 7's explicit instruction: "Do not populate
-- fabricated metadata merely to make fields non-null").
--
-- ============================================================
-- BACKFILL
-- ============================================================
-- One row inserted per distinct, non-null `family_id` currently in
-- `ali_question_bank`, across ALL subjects and ALL eligibility statuses
-- (not just practice_eligible -- the family model itself is not a
-- Practice/Mock-track distinction; `production_eligible` below records
-- that separately, per family, as "does at least one member row currently
-- carry practice_eligible or mock_eligible status"). Aggregated fields
-- (subject, skill, question_type, pathway, difficulty_range) are derived
-- directly from the real member rows via array_agg/DISTINCT -- read-only
-- aggregation, no invented values. A family spanning more than one
-- distinct `skill`/`question_type` value keeps the full distinct set
-- (array), rather than arbitrarily picking one, matching
-- `deriveFamilyRecordFromQuestions()`'s own "detects rather than silently
-- picks one" behaviour for a family spanning more than one competency.
--
-- ============================================================
-- PRODUCTION SAFETY
-- ============================================================
-- - Purely additive: one new table, zero changes to any existing table,
--   column, policy, trigger, or function.
-- - RLS enabled with an admin-only SELECT policy (`is_current_user_admin()`,
--   the same function every other admin-gated table in this schema already
--   uses) -- no anon/authenticated policy, since no live application code
--   consumes this table yet (Question Factory Wave 1 Phase 2 is schema-
--   first, per the Founder's own explicit instruction; the first real
--   consumer is tracked as follow-on work in ANGEL_CONTENT_READINESS_GAP_
--   REGISTER.md, not fabricated as already wired here).
-- - No write path from application code exists yet either -- this
--   migration only backfills from a read-only SELECT against existing
--   data. A future increment's Question Factory approval step (Stage 10 in
--   ANGEL_QUESTION_FACTORY_SPECIFICATION.md) is the intended writer,
--   itself gated by the existing, unmodified human educational review
--   surface -- not built in this migration.
-- - Idempotent backfill (`insert ... on conflict (family_id) do nothing`),
--   safe to re-run.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations 070-227
-- (per this arc's own standing record) have already been applied.

begin;

-- ============================================================
-- 1. The family table itself
-- ============================================================
create table if not exists public.ali_question_family (
  family_id text primary key,
  subject text not null check (subject in ('maths', 'english', 'writing')),
  -- Arrays, not scalars: a family is not guaranteed to map to exactly one
  -- competency/skill/question_type/difficulty tier (deriveFamilyRecordFromQuestions()'s
  -- own documented "spans more than one" case) -- recorded honestly, not collapsed.
  competency_ids text[] not null default '{}',
  skills text[] not null default '{}',
  question_types text[] not null default '{}',
  pathways jsonb not null default '[]'::jsonb,
  difficulty_range text[] not null default '{}',
  -- Genuinely unclassified today for every real family (Increment 019
  -- Part 7's own confirmed finding) -- nullable, never defaulted to a
  -- fabricated value.
  preparation_stage text,
  reasoning_structure text,
  misconceptions_tested text[] not null default '{}',
  permitted_variation text,
  generation_strategy text not null default 'hand_authored'
    check (generation_strategy in ('hand_authored', 'parametric_generated', 'unclassified')),
  validation_strategy text,
  review_status text,
  -- Real, computable fact: does at least one member row currently carry
  -- practice_eligible or mock_eligible status. Recomputed by the backfill
  -- below from real data, not asserted.
  production_eligible boolean not null default false,
  row_count integer not null default 0,
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now()
);

comment on table public.ali_question_family is
  'Question Factory Wave 1, Phase 2 -- one row per family (soft reference to ali_question_bank.family_id, no FK -- see migration 228 header for why). Backfilled read-only from existing data; not yet written to by any live application code.';

-- ============================================================
-- 2. RLS -- admin-only, no anon/authenticated policy (see header)
-- ============================================================
alter table public.ali_question_family enable row level security;

drop policy if exists ali_question_family_admin_select on public.ali_question_family;
create policy ali_question_family_admin_select
  on public.ali_question_family
  for select
  to authenticated
  using (is_current_user_admin());

-- ============================================================
-- 3. Backfill from real, existing ali_question_bank rows
-- ============================================================
insert into public.ali_question_family (
  family_id, subject, competency_ids, skills, question_types, pathways,
  difficulty_range, generation_strategy, production_eligible, row_count
)
select
  family_id,
  (array_agg(distinct subject))[1] as subject, -- a family is always single-subject in practice; recorded as the first (and expected-only) value
  '{}'::text[] as competency_ids, -- competency derivation requires QUESTION_TYPE_PRIMARY_COMPETENCY, an application-code mapping this migration does not duplicate -- left for the application-layer backfill lib/ali/questionFamilyRegistry.ts already knows how to compute
  array_agg(distinct skill) as skills,
  array_agg(distinct question_type) as question_types,
  coalesce(to_jsonb((array_agg(distinct pathway))[1]), '[]'::jsonb) as pathways,
  array_agg(distinct content_difficulty::text) as difficulty_range,
  'hand_authored' as generation_strategy, -- confirmed, repo-wide: no procedural/template generation mechanism exists anywhere in this codebase's history (lib/ali/questionFamilyRegistry.ts's own documented finding)
  bool_or(eligibility_status in ('practice_eligible', 'mock_eligible')) as production_eligible,
  count(*) as row_count
from public.ali_question_bank
where family_id is not null
group by family_id
on conflict (family_id) do nothing;

-- ============================================================
-- 4. Sanity checks -- fail closed, never silently proceed on a mismatch
-- ============================================================
do $$
declare
  v_distinct_family_ids integer;
  v_backfilled_rows integer;
  v_multi_subject_families integer;
begin
  select count(distinct family_id) into v_distinct_family_ids
  from public.ali_question_bank
  where family_id is not null;

  select count(*) into v_backfilled_rows from public.ali_question_family;

  if v_backfilled_rows <> v_distinct_family_ids then
    raise exception 'Migration 228 backfill mismatch: % distinct family_id values in ali_question_bank, % rows in ali_question_family', v_distinct_family_ids, v_backfilled_rows;
  end if;

  -- Genuinely possible in principle (a family_id reused across subjects would be a real data-quality
  -- finding, not a migration bug) -- reported via NOTICE, not treated as a fatal error, since this
  -- migration must not block on a pre-existing data question it did not create.
  select count(*) into v_multi_subject_families
  from (
    select family_id from public.ali_question_bank
    where family_id is not null
    group by family_id
    having count(distinct subject) > 1
  ) as multi;

  if v_multi_subject_families > 0 then
    raise notice 'Migration 228: % family_id value(s) span more than one subject in ali_question_bank -- recorded as the first subject value only; investigate before treating this table as fully authoritative for those families.', v_multi_subject_families;
  end if;

  raise notice 'Migration 228: backfilled % family rows from % distinct family_id values. Sanity checks passed.', v_backfilled_rows, v_distinct_family_ids;
end $$;

commit;
