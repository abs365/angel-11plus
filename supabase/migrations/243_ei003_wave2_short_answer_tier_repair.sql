-- Angel Digital 11+ — Migration 243
-- Educational Increment 003, Wave 2 — short-answer marking-tier repair
-- (NOT applied), bounded to 4 of the 40 already-published Wave 2
-- English questions.
--
-- ROOT CAUSE, found via deterministic verification of Migration 242's
-- own fix, run against the actual, imported production scoring
-- functions (scoreEnglishComprehensionAnswer,
-- lib/learningEngine/englishAnswerValidation.ts; scoreEnglishAnswer,
-- lib/learningEngine/practiceContent.ts) immediately before writing
-- this migration: Migration 242 correctly added modelAnswer/marks to
-- all 40 published rows, routing them through LEGACY_HEURISTIC. For 36
-- of those 40 this is correct and sufficient (confirmed: typing each
-- candidate's own exact accepted answer now scores full marks, and a
-- genuinely unrelated answer -- built per-candidate to share zero real
-- keywords with that candidate's own modelAnswer, confirmed
-- programmatically -- correctly scores zero, for all 40). For exactly
-- 4 candidates, though, the candidate's own genuinely correct answer is
-- too short for scoreEnglishAnswer()'s own pre-existing anti-gaming
-- floors to ever score it correct, regardless of Migration 242:
--   - qf-ei003-w2-seq-explicit-01      (correct answer "b, a, c", 7 chars)
--   - qf-ei003-w2-seq-dispersed-02     (correct answer "c, a, b", 7 chars)
--   - qf-ei003-w2-seq-narrative-order-02 (correct answer "b, d, c, a" --
--       clears the 8-character floor, but extractKeywords() only keeps
--       words longer than 3 characters, so a letter-code answer yields
--       zero extractable keywords and a 0/0 ratio)
--   - qf-ei003-w2-emotion-action-01    (correct answer "nervous", 7 chars)
-- scoreEnglishAnswer()'s own `if (!trimmed || trimmed.length < 8) return
-- 0` guard (practiceContent.ts) rejects the first, second, and fourth
-- outright; the third clears that floor but its correct answer contains
-- no keyword scoreEnglishAnswer's own extractKeywords() can see. This
-- is a pre-existing, deliberate anti-gaming floor in that function
-- (disclosed in its own comment history as a defence against trivial
-- answers like "aaaaaaaa") -- not a defect Migration 242 introduced,
-- and not one this migration second-guesses or redesigns.
--
-- FIX, the smallest available and scoped to exactly these 4 rows: set
-- `validationTier = 'TIER2_ACCEPTED_SET'` in each row's existing
-- `prompt` jsonb via the same non-destructive `||` merge Migration 242
-- used. This routes exactly these 4 candidates to
-- scoreEnglishComprehensionAnswer's TIER2 dispatch case, which calls
-- checkAcceptedAnswerSet() against the row's own, already-correct,
-- already-approved `acceptedAnswers` array (untouched by this
-- migration) -- a matcher with no minimum-length floor of any kind
-- (confirmed by reading its source: it only rejects an empty
-- normalised answer). Confirmed deterministically, against the real
-- imported functions, immediately before writing this migration: all 4
-- candidates' own correct answer now scores full marks, and a
-- genuinely unrelated wrong answer for each still scores zero.
--
-- The other 36 published rows are NOT touched -- they already score
-- correctly via LEGACY_HEURISTIC (Migration 242), and adding a
-- validationTier to them would be an unrequested, out-of-scope change
-- to something already working.
--
-- Scope, explicitly bounded: this migration touches ONLY the `prompt`
-- column, ONLY for these 4 named ids, ONLY adding `validationTier`. It
-- does not touch `acceptedAnswers`, `modelAnswer`, or `marks` (already
-- correct from Migration 242), any other `ali_question_bank` row, any
-- RPC, or any RLS policy. It does not alter LEGACY_HEURISTIC, TIER1,
-- TIER2, the validationTier architecture, the Practice page, or the
-- Teaching Engine -- it only opts 4 specific rows into an existing,
-- already-live dispatch case.
--
-- Fail-closed preconditions: for each of the 4 ids, if `prompt` already
-- contains a `validationTier` key, this migration raises an exception
-- and rolls back entirely (confirmed live, immediately before writing
-- this migration, that 0/4 currently have one).
--
-- Postconditions: re-asserts, per id, that `prompt->>'validationTier'`
-- equals `'TIER2_ACCEPTED_SET'` and that `acceptedAnswers`,
-- `modelAnswer`, and `marks` (all set by Migration 242) are still
-- present and unchanged.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, immediately after
-- Migration 242, following the same governed-migration discipline as
-- every other production data change in this arc.

begin;

do $$
begin
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-seq-explicit-01'
      and prompt ? 'validationTier'
  ) then
    raise exception 'Migration 243 precondition failed: qf-ei003-w2-seq-explicit-01 already has a validationTier field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-seq-dispersed-02'
      and prompt ? 'validationTier'
  ) then
    raise exception 'Migration 243 precondition failed: qf-ei003-w2-seq-dispersed-02 already has a validationTier field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-seq-narrative-order-02'
      and prompt ? 'validationTier'
  ) then
    raise exception 'Migration 243 precondition failed: qf-ei003-w2-seq-narrative-order-02 already has a validationTier field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-emotion-action-01'
      and prompt ? 'validationTier'
  ) then
    raise exception 'Migration 243 precondition failed: qf-ei003-w2-emotion-action-01 already has a validationTier field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
end$$;

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('validationTier', 'TIER2_ACCEPTED_SET')
where id = 'qf-ei003-w2-seq-explicit-01';

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('validationTier', 'TIER2_ACCEPTED_SET')
where id = 'qf-ei003-w2-seq-dispersed-02';

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('validationTier', 'TIER2_ACCEPTED_SET')
where id = 'qf-ei003-w2-seq-narrative-order-02';

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('validationTier', 'TIER2_ACCEPTED_SET')
where id = 'qf-ei003-w2-emotion-action-01';

do $$
begin
  if (
    select count(*) from public.ali_question_bank
    where id in ('qf-ei003-w2-seq-explicit-01', 'qf-ei003-w2-seq-dispersed-02', 'qf-ei003-w2-seq-narrative-order-02', 'qf-ei003-w2-emotion-action-01')
      and prompt->>'validationTier' = 'TIER2_ACCEPTED_SET'
  ) <> 4 then
    raise exception 'Migration 243 postcondition failed: expected all 4 targeted rows to have validationTier = TIER2_ACCEPTED_SET, found a different count.';
  end if;

  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-seq-explicit-01'
      and prompt->>'validationTier' = 'TIER2_ACCEPTED_SET'
      and prompt ? 'acceptedAnswers'
      and prompt ? 'modelAnswer'
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 243 postcondition failed: qf-ei003-w2-seq-explicit-01 does not have the expected validationTier after update, or lost a pre-existing field.';
  end if;
  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-seq-dispersed-02'
      and prompt->>'validationTier' = 'TIER2_ACCEPTED_SET'
      and prompt ? 'acceptedAnswers'
      and prompt ? 'modelAnswer'
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 243 postcondition failed: qf-ei003-w2-seq-dispersed-02 does not have the expected validationTier after update, or lost a pre-existing field.';
  end if;
  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-seq-narrative-order-02'
      and prompt->>'validationTier' = 'TIER2_ACCEPTED_SET'
      and prompt ? 'acceptedAnswers'
      and prompt ? 'modelAnswer'
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 243 postcondition failed: qf-ei003-w2-seq-narrative-order-02 does not have the expected validationTier after update, or lost a pre-existing field.';
  end if;
  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-emotion-action-01'
      and prompt->>'validationTier' = 'TIER2_ACCEPTED_SET'
      and prompt ? 'acceptedAnswers'
      and prompt ? 'modelAnswer'
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 243 postcondition failed: qf-ei003-w2-emotion-action-01 does not have the expected validationTier after update, or lost a pre-existing field.';
  end if;
end$$;

commit;
