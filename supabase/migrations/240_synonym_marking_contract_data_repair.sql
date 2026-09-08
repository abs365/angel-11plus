-- Angel Digital 11+ — Migration 240
-- Synonym Multi-Select Marking Contract Incident — Bounded Data Repair.
-- Additive-only, no historical migration edited in place.
--
-- ============================================================
-- WHY THIS EXISTS
-- ============================================================
-- Migration 239 fixed the FORWARD publication contract in
-- `publish_question_candidate()` so it can never reproduce this defect
-- again. That fix does not touch any row already published before it is
-- applied. This migration repairs exactly those already-published rows,
-- and only those rows, using the same genuine, already-published,
-- already-consistent source value (`prompt.requiredSelectionCount`)
-- migration 239 now merges going forward — no value is invented, none
-- is derived from anything outside this exact row's own already-correct
-- `prompt` JSONB, and marking is not weakened anywhere.
--
-- Full incident, root cause, and blast-radius: see migration 239's own
-- header, and `ANGEL_POST_REPAIR_LEARNER_SMOKE_TEST_ADDENDUM.md`.
--
-- Exactly 20 rows: 100% of the `wave1-fam-synonym-battery` family
-- published by the Controlled Scale Activation (`qf-eng-syn-01`
-- through `qf-eng-syn-20`) carry `validationTier: "TIER6_MULTI_SELECT"`
-- and genuine, single-element `correctOptions` (both already corrected
-- by migration 238) but no `marks` key at all in their published
-- `prompt` — so `checkMultiSelect()`'s real, correctly-computed
-- selection count can never equal `q.marks` (`undefined`), and no
-- learner selection, however genuinely correct, can ever be marked
-- correct for any of these 20 questions.
--
-- Founder decision: repair exactly these 20 rows and no others. Do not
-- touch: the 72 other newly-published English rows from this
-- activation, the 5 canary rows, the 313 Maths rows (already repaired
-- by migration 238, unaffected by this defect — Maths never reads
-- `prompt.marks` in its own `isCorrect` derivation the same way), any
-- of the 351 pre-existing Practice rows (including the 6 pre-existing
-- TIER6_MULTI_SELECT rows, already correct), Mock inventory, Writing
-- inventory, or any of the 30 historical calibration candidates (never
-- published, no bank row exists for them). Do not regenerate any
-- question. Do not change any educational answer, option, or tier.
--
-- ============================================================
-- FIX -- FAIL-CLOSED, PRECONDITION-GATED, ALL-OR-NOTHING
-- ============================================================
-- Runs inside one transaction with an explicit, exact-count preflight
-- assertion BEFORE the UPDATE, and an exact-count assertion AFTER it via
-- `get diagnostics ... row_count`. Any mismatch — before touching a
-- single row, or after — raises an exception, which aborts the whole
-- transaction; a partial repair (some rows fixed, some not, or the
-- wrong rows touched) is not possible. If this migration's own
-- preflight count does not read exactly 20 against the live database at
-- the moment it is run, IT DOES NOTHING AND ROLLS BACK ENTIRELY.
--
-- Preflight/repair predicate, all required together: `id like 'qf-%'`,
-- `subject = 'english'`, `family_id = 'wave1-fam-synonym-battery'`,
-- `(prompt->>'validationTier') = 'TIER6_MULTI_SELECT'` (already
-- corrected by migration 238 -- a row still carrying the old
-- `TIER1_EXACT_MATCH` tag would not match, and is not this migration's
-- concern), `(prompt->>'marks') is null` (the exact defect signature --
-- a row already carrying any `marks` value, correct or not, is never
-- touched, so this migration cannot silently overwrite a value some
-- other process may have already set), `prompt->'requiredSelectionCount'
-- is not null`, and `jsonb_array_length(prompt->'correctOptions') =
-- (prompt->>'requiredSelectionCount')::int` (the same internal-
-- consistency check migration 239 now enforces at publish time -- a row
-- that somehow failed this check would be excluded, never "repaired"
-- with a value derived from inconsistent evidence).
--
-- Applies `prompt := prompt || jsonb_build_object('marks',
-- (prompt->>'requiredSelectionCount')::int)` -- additive, preserves
-- every other prompt key (`question`, `passageText`, `passageTitle`,
-- `validationTier`, `correctOptions`, `requiredSelectionCount`,
-- `evidenceLocation`, `teachingUses`, `blueprintId`) untouched. No join
-- to `ali_question_candidate` is needed -- unlike migrations 237/238,
-- the one genuine source value this repair needs
-- (`requiredSelectionCount`) is already present and already correct on
-- the published row itself.
--
-- This predicate cannot ever match a pre-existing (non-`qf-`-prefixed)
-- row, a Mock row, a Writing row, a Maths row, any of the 30 historical
-- calibration candidates (never published, no bank row exists), or any
-- of the 72 other English rows from this activation (different
-- `family_id`) — it is scoped to the exact defect signature itself, not
-- to a broad family-name or table-wide sweep.
--
-- ============================================================
-- MIGRATION SAFETY REVIEW
-- ============================================================
-- - Touches only `public.ali_question_bank` rows already matching the
--   exact, already-diagnosed defect signature above -- no table is
--   created, altered, or dropped, no function is redefined (that was
--   migration 239's job), no RLS policy is created, dropped, or altered.
-- - Preflight count is asserted with `raise exception` BEFORE the UPDATE
--   runs; the post-UPDATE row count is asserted with `get diagnostics`
--   immediately after. A count mismatch at either point raises, which
--   aborts the entire enclosing transaction -- Postgres will not COMMIT
--   a transaction that raised an unhandled exception, so partial
--   application is not possible.
-- - The UPDATE is a single `jsonb ||` merge targeting one key
--   (`marks`) only -- it cannot remove or alter any other prompt field,
--   and does not touch `review_method`, `approval_basis`, `reviewer_id`,
--   `review_timestamp`, `candidate_id`, `published_question_id`,
--   `family_id`, `difficulty`, `provenance`, `eligibility_status`, or any
--   learner-history table.
-- - Not idempotent by design: re-running this migration after a
--   successful application will find 0 rows matching the preflight
--   predicate (every affected row will already carry `prompt.marks`),
--   so the preflight count check will correctly fail (0 <> 20) and the
--   whole migration will abort, changing nothing -- this is the
--   intended, safe behaviour for a one-time bounded repair, not a
--   defect.
--
-- ============================================================
-- RLS REVIEW
-- ============================================================
-- No RLS policy is created, dropped, or altered on any table. This
-- migration is applied directly (via Supabase Dashboard > SQL Editor as
-- the Founder's own admin database session), the same way every prior
-- migration in this arc has been -- it does not run through, and is not
-- gated by, any RPC or RLS policy itself.
--
-- ============================================================
-- SECURITY REVIEW
-- ============================================================
-- Pure data repair, no new function, no new grant, no new trust
-- boundary. The only value written (`requiredSelectionCount`, recast as
-- `marks`) is read from data already genuinely stored on the exact same
-- row being updated -- no externally-supplied input of any kind is
-- accepted by this migration; it is a fixed, self-contained SQL script
-- with no parameters.
--
-- ============================================================
-- BACKWARD COMPATIBILITY
-- ============================================================
-- Purely additive/corrective to the exact 20 rows' own `prompt` JSONB.
-- No caller, RPC signature, or table schema changes. Every other column
-- on every touched row (audit/review/approval/publication identity,
-- `family_id`, `difficulty`, `provenance`, `eligibility_status`) is
-- completely unchanged.
--
-- ============================================================
-- ROLLBACK
-- ============================================================
-- The pre-repair state was "no `marks` key at all", not any particular
-- value, so a blind revert-to-literal is not meaningful; if ever
-- required, the added key can be removed per-row via
-- `prompt := prompt - 'marks'`, scoped by the same predicates above.
-- This touches no other table, so no other rollback step is required.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor, after migration 239 (this arc's own
-- standing record) has already been applied.

begin;

do $$
declare
  v_preflight_count integer;
  v_updated integer;
begin
  -- ----------------------------------------------------------
  -- Preflight -- exactly 20 rows expected: the full
  -- wave1-fam-synonym-battery family from this activation, already
  -- correctly TIER6_MULTI_SELECT with a single genuine correctOptions
  -- entry (migration 238), internally consistent
  -- (correctOptions length = requiredSelectionCount), and genuinely
  -- missing `marks`.
  -- ----------------------------------------------------------
  select count(*) into v_preflight_count
  from public.ali_question_bank
  where id like 'qf-%'
    and subject = 'english'
    and family_id = 'wave1-fam-synonym-battery'
    and (prompt->>'validationTier') = 'TIER6_MULTI_SELECT'
    and (prompt->>'marks') is null
    and prompt->'requiredSelectionCount' is not null
    and jsonb_typeof(prompt->'correctOptions') = 'array'
    and jsonb_array_length(prompt->'correctOptions') = (prompt->>'requiredSelectionCount')::int;

  if v_preflight_count <> 20 then
    raise exception 'Synonym Marking Contract repair ABORTED before any change: preflight expected exactly 20 affected rows, found %. Blast radius has changed since the incident report -- re-diagnose before re-running.', v_preflight_count;
  end if;

  -- ----------------------------------------------------------
  -- Repair -- merge the row's own genuine requiredSelectionCount into
  -- prompt.marks. Additive jsonb merge; every other prompt key is
  -- preserved.
  -- ----------------------------------------------------------
  update public.ali_question_bank
  set prompt = prompt || jsonb_build_object('marks', (prompt->>'requiredSelectionCount')::int)
  where id like 'qf-%'
    and subject = 'english'
    and family_id = 'wave1-fam-synonym-battery'
    and (prompt->>'validationTier') = 'TIER6_MULTI_SELECT'
    and (prompt->>'marks') is null
    and prompt->'requiredSelectionCount' is not null
    and jsonb_typeof(prompt->'correctOptions') = 'array'
    and jsonb_array_length(prompt->'correctOptions') = (prompt->>'requiredSelectionCount')::int;

  get diagnostics v_updated = row_count;
  if v_updated <> 20 then
    raise exception 'Synonym Marking Contract repair ABORTED: UPDATE affected % rows, expected exactly 20 -- rolling back the entire migration, nothing is committed.', v_updated;
  end if;

  raise notice 'Synonym Marking Contract repair applied: % rows (expected 20). Nothing else touched.', v_updated;
end $$;

commit;
