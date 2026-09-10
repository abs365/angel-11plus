-- Angel Digital 11+ — Migration 250
-- CSSE Two-Paper Mock P1 Repair (P1-A) — restore the migration-151
-- analysis-invocation behaviour that migration 220 unintentionally
-- dropped, while preserving migration 220's own Reading Comprehension
-- Mock 1 exclusion exactly as it is today.
--
-- ============================================================
-- ROOT CAUSE (proven by direct source inspection this session, not
-- inferred -- see ANGEL 11+ MOCK SCORING / ANALYSIS PIPELINE P1
-- ROOT-CAUSE REPORT, 2026-09-10)
-- ============================================================
-- public.mock_attempt_report_init() -- the function
-- mock_attempt_report_init_trigger (migration 072, never dropped or
-- re-created) executes -- has been redefined four times: 072 -> 075 ->
-- 151 -> 220. Migration 151 added a second, independent
-- begin...exception...end block: after a successful score, re-read
-- scoring_state fresh, and if it reached 'scored', perform
-- mock_analyse_attempt(new.id). Migration 220's own CREATE OR REPLACE
-- FUNCTION (whose real, narrow, correctly-scoped intent was only to skip
-- the legacy Mathematics-only scorer for
-- attempt_type='timed_section' and form_id='reading-comprehension-mock-1')
-- was written against migration 075's body, not migration 151's --
-- because CREATE OR REPLACE FUNCTION replaces the ENTIRE function body,
-- this silently reverted migration 151's analysis-invocation block for
-- EVERY attempt that takes the legacy-scorer branch, from migration 220's
-- application onward. Confirmed: grepping every
-- "function public.mock_attempt_report_init" definition in this
-- repository (072, 075, 151, 220) shows 220 is the current live version,
-- and it has no mock_analyse_attempt call anywhere in it.
--
-- Two real, live acceptance attempts exercised this defect for the first
-- time in production (Mathematics Mock 1 was not activated until
-- migration 150, well after 220 was already live, and this is the first
-- English full_mock attempt to ever exist) -- this is a latent defect
-- being exercised for the first time, not a regression against
-- previously-working live behaviour. No historical released report
-- exists anywhere in this system to compare against.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES
-- ============================================================
-- Redefines ONLY public.mock_attempt_report_init() (CREATE OR REPLACE
-- FUNCTION, same signature, same trigger object migration 072 already
-- created -- no trigger DDL of any kind). The new body is the exact
-- MERGE of migration 220's own Reading Comprehension Mock 1 skip-guard
-- (byte-identical: same attempt_type/form_id literal check, same `null`
-- no-op branch, same comment) with migration 151's own analysis-
-- invocation block (byte-identical: same re-read-fresh-then-perform
-- pattern, same isolated exception handling that can only ever touch
-- analysis_state, never scoring_state/question_outcomes/overall). Neither
-- historical migration (151 or 220) is edited -- both remain on disk,
-- unmodified, exactly as already applied.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does not touch mock_score_attempt(), mock_analyse_attempt(),
-- mock_release_report(), mock_apply_manual_mark(), or any Reading/
-- Mathematics/Writing content or scoring rule. Does not change RLS, does
-- not change any grant, does not create any new table or role. Does not
-- release, rescore, or otherwise mutate the two existing acceptance
-- attempts -- that is a separate, narrowly-scoped recovery action (see
-- migration 251, which also completes the English-specific scoring
-- pipeline this migration alone cannot finish -- English's Writing
-- content correctly keeps scoring_state at 'scoring' regardless of this
-- fix, by design; this migration alone fully resolves the Mathematics
-- side of the defect for every FUTURE Mathematics attempt, and restores
-- analysis-invocation generally for every future non-Reading-Mock-1
-- attempt). Behaviourally identical to migration 220 for
-- reading-comprehension-mock-1 attempts (that branch is untouched,
-- character-for-character).
--
-- ============================================================
-- SAFETY FOR EVERY EXISTING FORM
-- ============================================================
-- reading-comprehension-mock-1 (timed_section): unchanged -- the `if`
-- branch that skips the legacy scorer entirely is byte-identical to
-- migration 220's own, so this migration is a complete no-op for that
-- form's future submissions, exactly as it is today.
-- Mathematics full_mock: unchanged scoring behaviour (mock_score_
-- attempt() is not modified), but a NEW future submission now correctly
-- reaches scoring_state='scored' -> analysis_state='complete'
-- automatically, in the same trigger invocation, exactly as it did for
-- every attempt scored under migration 151 before 220 silently reverted
-- it.
-- Any other future attempt_type/form_id combination: falls through to
-- the same `else` branch every non-Reading-Mock-1 attempt already used
-- under migration 220 -- this migration only adds back the analysis call
-- immediately after it, changing nothing about the scoring call itself.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations 070-249
-- (per this arc's own standing record) have already been applied. Apply
-- BEFORE migration 251 (numeric order is sufficient -- 251 does not
-- structurally depend on this one having been applied first, since its
-- own new completion path invokes mock_analyse_attempt() directly rather
-- than through this trigger, but applying in order keeps the repair
-- easy to reason about as a single pass).

begin;

create or replace function public.mock_attempt_report_init()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  if new.status = 'submitted' and (old.status is distinct from 'submitted') then
    insert into public.ali_mock_attempt_report (attempt_id)
    values (new.id)
    on conflict (attempt_id) do nothing;

    if new.attempt_type = 'timed_section' and new.form_id = 'reading-comprehension-mock-1' then
      -- Migration 220's own, unmodified guard: Reading Comprehension
      -- Mock 1 is scored exclusively by the Increment 016 authority
      -- (migration 219: mock_claim_reading_scoring_work /
      -- mock_persist_reading_scoring), invoked from the application layer
      -- once submission completes -- never by this legacy scorer, which
      -- only understands the legacy/Mathematics plain-scalar answer
      -- contract and cannot evaluate Reading's real, tiered contract. The
      -- report row stays at its migration-072 default (scoring_state =
      -- 'not_started') so migration 219's own claim function picks up
      -- clean, unscored work.
      null;
    else
      begin
        perform public.mock_score_attempt(new.id);
      exception when others then
        update public.ali_mock_attempt_report
        set scoring_state = 'failed', updated_at = now()
        where attempt_id = new.id;
      end;

      -- Migration 151's own analysis-invocation block, restored here
      -- byte-identical after migration 220 silently dropped it. Entirely
      -- independent nested block: only proceeds once scoring genuinely,
      -- freshly succeeded (re-read from the row, never assumed); an
      -- analysis failure here touches analysis_state only, never
      -- scoring_state/question_outcomes/overall, and can never affect the
      -- learner's own already-committed submission.
      begin
        if (select scoring_state from public.ali_mock_attempt_report where attempt_id = new.id) = 'scored' then
          perform public.mock_analyse_attempt(new.id);
        end if;
      exception when others then
        update public.ali_mock_attempt_report
        set analysis_state = 'failed', updated_at = now()
        where attempt_id = new.id;
      end;
    end if;
  end if;
  return new;
end;
$$;

commit;

-- Read-only verification (run before and after applying):
--
-- select pg_get_functiondef('public.mock_attempt_report_init()'::regprocedure);
--
-- Expected AFTER applying: the function body contains BOTH the
-- "new.attempt_type = 'timed_section' and new.form_id =
-- 'reading-comprehension-mock-1'" guard AND a
-- "perform public.mock_analyse_attempt(new.id)" call inside the else
-- branch.
