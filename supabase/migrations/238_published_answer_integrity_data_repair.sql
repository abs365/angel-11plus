-- Angel Digital 11+ — Migration 238
-- Published Answer Integrity Incident — Bounded Data Repair.
-- Additive-only, no historical migration edited in place.
--
-- ============================================================
-- WHY THIS EXISTS
-- ============================================================
-- Migration 237 fixed the FORWARD publication contract in
-- `publish_question_candidate()` so it can never reproduce the Maths
-- defect again. The English manufacturing fix (both defects, see below)
-- was made directly in `lib/ali/questionFactory/englishSynonymFamily.ts`
-- and `lib/ali/questionFactory/candidateStoreMapping.ts`. Neither of
-- those fixes touches any row already published before they were
-- applied. This migration repairs exactly those already-published rows,
-- and only those rows, using the same genuine, already-correct source
-- data those fixes now persist going forward -- no answer is invented,
-- none is derived from `worked_explanation`/`workingSteps` text, and
-- marking is not weakened anywhere.
--
-- Full incident, root cause, and blast-radius audit:
-- ANGEL_PUBLISHED_ANSWER_INTEGRITY_INCIDENT_REPORT.md.
--
-- Three independent defects, exactly 333 rows total:
--
--   A. 313 Maths rows (100% of published Maths content from the
--      Controlled Scale Activation, every one of 9 families) are
--      missing `prompt.answer` -- `publish_question_candidate()` never
--      merged `ali_question_candidate.claimed_answer` into the
--      published row (fixed prospectively by migration 237). The
--      genuine answer for every one of these 313 rows already exists,
--      unchanged, in its own candidate row's `claimed_answer` column
--      (schema-enforced `not null` since migration 230).
--
--   B. 20 English rows (100% of the `wave1-fam-synonym-battery` family)
--      carry `validationTier: "TIER1_EXACT_MATCH"` in their published
--      `prompt`, despite genuinely being single-select MCQ evidence that
--      only `TIER6_MULTI_SELECT`'s marking-dispatcher branch reads
--      (lib/learningEngine/englishAnswerValidation.ts). A
--      manufacturing-time mistagging in
--      lib/ali/questionFactory/englishSynonymFamily.ts (separately fixed
--      prospectively in that file).
--
--   C. The SAME 20 rows ALSO carry `correctOptions` set to the FULL
--      4-option list (every option, right and wrong alike), not just the
--      genuinely correct option. This was found only while writing this
--      repair's own regression tests -- proving TIER6_MULTI_SELECT's
--      real dispatcher (`checkMultiSelect()`) against the actual data
--      revealed that, left uncorrected alongside fix B alone, EVERY
--      possible learner selection would be marked correct (since
--      `checkMultiSelect` scores any selection found in `correctOptions`
--      as correct, and every option is currently listed there) --
--      silently WEAKENING marking rather than repairing it, the exact
--      outcome the Founder's decision explicitly prohibited. Root cause:
--      `candidateStoreMapping.ts`'s `mapEnglishCandidateToStoreRow`
--      mapped `correctOptions: candidate.options` (the full list) rather
--      than `[candidate.options[candidate.correctOptionIndex]]` (just
--      the correct one) -- separately fixed prospectively in that file.
--      The genuinely correct option for each of these 20 rows already
--      exists, unchanged, in its own candidate row's `distractors`
--      column (`{options, correctOptionIndex, distractorRationale}`,
--      schema-populated at submission time) -- `correctOptionIndex`
--      there was always correct; it was simply never consulted when
--      building the published `correctOptions` field.
--
-- Founder decision: repair all three, and ONLY these exact 333 rows. Do
-- not touch: the 72 other newly-published English rows from this
-- activation (confirmed structurally clean), the 5 canary rows, any of
-- the 351 pre-existing Practice rows (confirmed 202/202 Maths already
-- correct), Mock inventory, Writing inventory, or any of the 30
-- historical calibration candidates (never published, no bank row
-- exists for them). Do not roll back the 400-candidate activation. Do
-- not regenerate any question. Do not change any educational answer.
--
-- ============================================================
-- FIX -- FAIL-CLOSED, PRECONDITION-GATED, ALL-OR-NOTHING
-- ============================================================
-- The entire repair runs inside one transaction with explicit,
-- exact-count preflight assertions BEFORE either UPDATE, and exact-count
-- assertions AFTER each UPDATE via `get diagnostics ... row_count`. Any
-- mismatch anywhere -- before touching a single row, or after -- raises
-- an exception, which aborts the whole transaction; a partial repair
-- (some rows fixed, some not, or the wrong rows touched) is not
-- possible. If this migration's own preflight counts do not read
-- exactly 313 / 20 / 333 against the live database at the moment it is
-- run, IT DOES NOTHING AND ROLLS BACK ENTIRELY -- it does not adapt,
-- widen, or narrow its own scope; a changed blast radius requires a new,
-- separately-authorised migration, never a silent scope change inside
-- this one.
--
-- Maths repair (A): joined to each row's own candidate via
-- `ali_question_candidate.published_question_id` (the real, existing
-- publish-time linkage `publish_question_candidate()` itself writes --
-- not a re-derived string match), requiring `publication_status =
-- 'published'` and a genuine non-null/non-empty `claimed_answer` on the
-- candidate side, and `prompt->>'answer' is null` on the bank side (so a
-- row already correctly repaired, or never broken, is never touched
-- twice or touched at all). Applies `prompt := prompt ||
-- jsonb_build_object('answer', claimed_answer)` -- additive, preserves
-- every other prompt key untouched.
--
-- English repair (B + C, one UPDATE): requires, on the bank row itself,
-- `family_id = 'wave1-fam-synonym-battery'`, `prompt->>'validationTier'
-- = 'TIER1_EXACT_MATCH'` (the exact wrong tier), and
-- `jsonb_array_length(prompt->'correctOptions') <> 1` (the exact wrong
-- "full list" shape) -- joined to the row's own candidate, requiring
-- `distractors->'options'` to be a genuine JSON array and
-- `distractors->>'correctOptionIndex'` to be a valid, in-range index
-- into it (fail closed: a row whose candidate lacks this genuine
-- evidence is excluded, never "repaired" with a guessed value). Applies
-- BOTH corrections in one merge: `validationTier` set to
-- `'TIER6_MULTI_SELECT'`, and `correctOptions` replaced with a
-- single-element array containing exactly the option at
-- `distractors->>'correctOptionIndex'` -- the same genuine value
-- `candidateStoreMapping.ts`'s own fix now derives prospectively.
-- `requiredSelectionCount` and every other prompt key are untouched.
--
-- Neither UPDATE can ever match a pre-existing (non-`qf-`-prefixed) row,
-- a Mock row, a Writing row, or any of the 30 historical calibration
-- candidates (which were never published and have no bank row at all) --
-- every predicate above is scoped to the exact defect signature itself,
-- not to a broad family-name or table-wide sweep.
--
-- ============================================================
-- MIGRATION SAFETY REVIEW
-- ============================================================
-- - Touches only `public.ali_question_bank` rows already matching one of
--   the two exact, already-diagnosed defect signatures above -- no
--   table is created, altered, or dropped, no function is redefined
--   (that was migration 237's job), no RLS policy is created, dropped,
--   or altered.
-- - Preflight counts are asserted with `raise exception` BEFORE either
--   UPDATE runs; post-UPDATE row counts are asserted with `get
--   diagnostics` immediately after each UPDATE. A count mismatch at any
--   point raises, which aborts the entire enclosing transaction --
--   Postgres will not COMMIT a transaction that raised an unhandled
--   exception, so partial application is not possible.
-- - Both UPDATEs are `jsonb ||` merges targeting specific keys only --
--   neither can remove or alter any other prompt field, and neither
--   touches `review_method`, `approval_basis`, `reviewer_id`,
--   `review_timestamp`, `candidate_id`, `published_question_id`,
--   `family_id`, `difficulty`, `provenance`, `eligibility_status`, or any
--   learner-history table.
-- - Not idempotent by design: re-running this migration after a
--   successful application will find 0 rows matching the preflight
--   predicates (every affected row will already carry `prompt.answer`/
--   `TIER6_MULTI_SELECT`/a single-element `correctOptions`), so the
--   preflight count check will correctly fail (0 <> 313 / 0 <> 20) and
--   the whole migration will abort, changing nothing -- this is the
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
-- boundary. Every value written is read from data that was already
-- genuinely stored (candidate `claimed_answer`, or the candidate's own
-- `distractors->options`/`distractors->correctOptionIndex`) -- no
-- externally-supplied input of any kind is accepted by this migration;
-- it is a fixed, self-contained SQL script with no parameters.
--
-- ============================================================
-- BACKWARD COMPATIBILITY
-- ============================================================
-- Purely additive/corrective to the exact 333 rows' own `prompt` JSONB.
-- No caller, RPC signature, or table schema changes. Every other column
-- on every touched row (audit/review/approval/publication identity,
-- `family_id`, `difficulty`, `provenance`, `eligibility_status`) is
-- completely unchanged -- this is a deterministic publication-contract
-- repair, not a new educational review, and does not alter any
-- candidate's approval history.
--
-- ============================================================
-- ROLLBACK
-- ============================================================
-- Neither repair can be blindly reversed from a fixed literal (the
-- pre-repair state for Maths was "no `answer` key at all", not any
-- particular value; for English it was two specific, already-known wrong
-- values -- `TIER1_EXACT_MATCH` and the full options list -- so
-- re-applying them is possible but was deliberately not scripted here,
-- since a rollback of a correctness fix should require its own explicit,
-- separately-authorised decision, not a one-line undo bundled into the
-- fix itself). If ever required: the Maths repair can be reversed
-- per-row via `prompt := prompt - 'answer'`; the English repair by
-- restoring `validationTier` to `'TIER1_EXACT_MATCH'` and
-- `correctOptions` to the candidate's own full `distractors->'options'`
-- array, both scoped by the same `id like 'qf-%'` predicates above.
-- Neither touches any other table, so no other rollback step is
-- required.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migration 237 (this
-- arc's own standing record) has already been applied.

begin;

do $$
declare
  v_maths_preflight_count integer;
  v_english_preflight_count integer;
  v_maths_updated integer;
  v_english_updated integer;
begin
  -- ----------------------------------------------------------
  -- Preflight A -- Maths: exactly 313 rows expected.
  -- ----------------------------------------------------------
  select count(*) into v_maths_preflight_count
  from public.ali_question_bank b
  join public.ali_question_candidate c on c.published_question_id = b.id
  where b.id like 'qf-%'
    and b.subject = 'maths'
    and c.publication_status = 'published'
    and (b.prompt->>'answer') is null
    and c.claimed_answer is not null
    and trim(c.claimed_answer) <> '';

  if v_maths_preflight_count <> 313 then
    raise exception 'Answer-Integrity repair ABORTED before any change: Maths preflight expected exactly 313 affected rows, found %. Blast radius has changed since the incident report -- re-diagnose before re-running.', v_maths_preflight_count;
  end if;

  -- ----------------------------------------------------------
  -- Preflight B -- English wave1-fam-synonym-battery: exactly 20 rows
  -- expected, each genuinely mistagged (wrong validationTier) AND
  -- genuinely mis-shaped (correctOptions holds every option, not just
  -- the correct one), with valid replacement evidence already present
  -- on its own candidate row.
  -- ----------------------------------------------------------
  select count(*) into v_english_preflight_count
  from public.ali_question_bank b
  join public.ali_question_candidate c on c.published_question_id = b.id
  where b.id like 'qf-%'
    and b.subject = 'english'
    and b.family_id = 'wave1-fam-synonym-battery'
    and (b.prompt->>'validationTier') = 'TIER1_EXACT_MATCH'
    and jsonb_typeof(b.prompt->'correctOptions') = 'array'
    and jsonb_array_length(b.prompt->'correctOptions') <> 1
    and (b.prompt->>'requiredSelectionCount') is not null
    and jsonb_typeof(c.distractors->'options') = 'array'
    and (c.distractors->>'correctOptionIndex') is not null
    and (c.distractors->>'correctOptionIndex')::int >= 0
    and (c.distractors->>'correctOptionIndex')::int < jsonb_array_length(c.distractors->'options');

  if v_english_preflight_count <> 20 then
    raise exception 'Answer-Integrity repair ABORTED before any change: English synonym-battery preflight expected exactly 20 affected rows, found %. Blast radius has changed since the incident report -- re-diagnose before re-running.', v_english_preflight_count;
  end if;

  if v_maths_preflight_count + v_english_preflight_count <> 333 then
    raise exception 'Answer-Integrity repair ABORTED before any change: combined preflight expected exactly 333 total affected rows (313 + 20), found %.', v_maths_preflight_count + v_english_preflight_count;
  end if;

  -- ----------------------------------------------------------
  -- Repair A -- Maths: merge the candidate's own genuine claimed_answer
  -- into prompt.answer. Additive jsonb merge; every other prompt key
  -- (question/workingSteps/params/diagram/diagrams/contextTag/
  -- reasoningRoute/unknownPosition/representationType) is preserved.
  -- ----------------------------------------------------------
  update public.ali_question_bank b
  set prompt = b.prompt || jsonb_build_object('answer', c.claimed_answer)
  from public.ali_question_candidate c
  where c.published_question_id = b.id
    and b.id like 'qf-%'
    and b.subject = 'maths'
    and c.publication_status = 'published'
    and (b.prompt->>'answer') is null
    and c.claimed_answer is not null
    and trim(c.claimed_answer) <> '';

  get diagnostics v_maths_updated = row_count;
  if v_maths_updated <> 313 then
    raise exception 'Answer-Integrity repair ABORTED: Maths UPDATE affected % rows, expected exactly 313 -- rolling back the entire migration, nothing is committed.', v_maths_updated;
  end if;

  -- ----------------------------------------------------------
  -- Repair B+C -- English wave1-fam-synonym-battery: correct BOTH the
  -- mistagged validationTier AND the over-broad correctOptions in one
  -- merge, from the candidate's own genuine distractors evidence.
  -- requiredSelectionCount and every other prompt key are untouched.
  -- ----------------------------------------------------------
  update public.ali_question_bank b
  set prompt = b.prompt
    || jsonb_build_object('validationTier', 'TIER6_MULTI_SELECT')
    || jsonb_build_object('correctOptions', jsonb_build_array(c.distractors->'options'->(c.distractors->>'correctOptionIndex')::int))
  from public.ali_question_candidate c
  where c.published_question_id = b.id
    and b.id like 'qf-%'
    and b.subject = 'english'
    and b.family_id = 'wave1-fam-synonym-battery'
    and (b.prompt->>'validationTier') = 'TIER1_EXACT_MATCH'
    and jsonb_typeof(b.prompt->'correctOptions') = 'array'
    and jsonb_array_length(b.prompt->'correctOptions') <> 1
    and (b.prompt->>'requiredSelectionCount') is not null
    and jsonb_typeof(c.distractors->'options') = 'array'
    and (c.distractors->>'correctOptionIndex') is not null
    and (c.distractors->>'correctOptionIndex')::int >= 0
    and (c.distractors->>'correctOptionIndex')::int < jsonb_array_length(c.distractors->'options');

  get diagnostics v_english_updated = row_count;
  if v_english_updated <> 20 then
    raise exception 'Answer-Integrity repair ABORTED: English synonym-battery UPDATE affected % rows, expected exactly 20 -- rolling back the entire migration, nothing is committed.', v_english_updated;
  end if;

  raise notice 'Answer-Integrity repair applied: % Maths rows + % English rows = % total (expected 313 + 20 = 333). Nothing else touched.', v_maths_updated, v_english_updated, v_maths_updated + v_english_updated;
end $$;

commit;
