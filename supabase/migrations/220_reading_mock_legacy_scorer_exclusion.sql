-- Angel Digital 11+ — Migration 220
-- Programme Completion Increment 016 — Legacy Scorer Exclusion for
-- Reading Comprehension Mock 1 (Defect B correction).
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS
-- ============================================================
-- A controlled production Reading sitting (attempt
-- f7ac5c70-75fd-4f16-9b09-768365ac0abe) found all six genuinely-answered
-- questions resolved to requires_manual_marking. Root cause, confirmed
-- against source: mock_attempt_report_init() (migration 072, redefined by
-- migration 075) unconditionally calls mock_score_attempt(new.id) for
-- EVERY attempt on submission, with no attempt_type/form_id guard.
-- mock_score_attempt() (migrations 074/075) only understands the legacy/
-- Mathematics answer contract -- a plain scalar stored at
-- ali_question_bank.prompt->>'answer'. No Reading question has ever set
-- that field (Reading's real, tiered contract lives in modelAnswer/
-- acceptedAnswers/quotationRequired/orderedAnswer/correctOptions/
-- validationTier instead, per migration 219's own header), so
-- mock_score_attempt()'s v_stored_answer is null for every Reading
-- question regardless of its true validationTier, which its own logic
-- (`v_stored_answer is null` -> requires_manual_marking) forces to
-- requires_manual_marking for every genuinely-answered Reading question --
-- not only the one question in that sitting (eng-inc001-bee-q03) that is
-- genuinely TIER3_QUOTATION_PLUS_EXPLANATION and requires manual marking.
--
-- Migration 219 already built the correct, dedicated authority for this
-- content (mock_claim_reading_scoring_work / mock_persist_reading_scoring,
-- invoked from the application layer via
-- lib/server/mockScoringAuthority.ts's scoreReadingAttempt(), already
-- wired to fire on every timed_section submission -- see
-- app/learning-intelligence/mock-exam/page.tsx's requestReadingScoring()).
-- That authority's own claim function already tolerates running after the
-- legacy scorer (it only refuses an attempt whose scoring_state is already
-- 'scored', and the legacy scorer only ever leaves Reading attempts at
-- 'scoring', never 'scored', because every Reading question currently
-- resolves to requires_manual_marking under it) -- but two independent
-- scoring authorities silently acting on the same submission, one of them
-- systematically wrong for this content, is not an acceptable steady
-- state. This migration is the other half of the fix: stop the legacy,
-- Mathematics-only scorer from ever touching a Reading Comprehension
-- Mock 1 attempt at all, so migration 219's own authority is the only
-- thing that ever writes a scoring result for this content.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES
-- ============================================================
-- Redefines ONLY public.mock_attempt_report_init() (the same function
-- migration 075 last redefined). CREATE OR REPLACE FUNCTION preserves the
-- function's identity, so the existing trigger
-- (mock_attempt_report_init_trigger, migration 072, unmodified) picks up
-- this new body with no trigger DDL of any kind. The report-row insert on
-- the submitted transition is byte-identical to today. The ONLY change:
-- immediately before the existing perform public.mock_score_attempt(...)
-- call, one exact, narrow guard is added --
-- attempt_type = 'timed_section' and form_id = 'reading-comprehension-mock-1'
-- -- naming this ONE existing, already-activated Reading form by its own
-- literal id, nothing broader. When that guard matches, the legacy call
-- is skipped entirely and the report row is left at its migration-072
-- default (scoring_state = 'not_started'), so migration 219's own claim
-- function (which treats anything other than 'scored' as eligible work)
-- picks it up cleanly the first time, not as a correction of a wrong
-- 'scoring' state. Every other attempt -- Mathematics full_mock included,
-- and any other attempt_type/form_id combination that may exist or be
-- added later -- falls through to the exact same
-- perform public.mock_score_attempt(new.id) call, inside the exact same
-- nested exception-safe block, that migration 075 already established.
-- This migration does not claim Reading is generally or permanently
-- handled for any future Reading form -- only this one, named,
-- already-activated form_id is excluded.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does not touch mock_score_attempt() itself -- its body, signature,
-- grants, and every one of migration 074/075's corrections are
-- byte-identical and untouched. Does not touch migration 219's two
-- functions, the mock_scoring_writer role, or any of its grants -- no new
-- table grant, no service_role dependency, no expanded authority of any
-- kind. Does not create or drop any table, policy, or trigger. Does not
-- add any column. Does not change Mathematics scoring or content in any
-- way. Does not rescore, release, or otherwise mutate any existing
-- attempt or report row -- this migration changes future-submission
-- behaviour only; it contains no UPDATE/INSERT/DELETE against any
-- existing row. Does not implement recovery automation for the two
-- prior, already-affected Reading attempts (f7ac5c70-75fd-4f16-9b09-
-- 768365ac0abe, 5f08cb6e-5359-4971-800c-af53f196d621) -- both remain
-- untouched, unscored-by-this-fix, and unreleased, preserved as
-- historical/diagnostic evidence per Founder instruction.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query.

begin;

-- === Function: mock_attempt_report_init (redefined) ==================
--
-- Same trigger (mock_attempt_report_init_trigger, migration 072,
-- unmodified) -- only the function body it calls changes, via CREATE OR
-- REPLACE FUNCTION, no trigger DDL needed.
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
      -- Reading Comprehension Mock 1 is scored exclusively by the
      -- Increment 016 authority (migration 219: mock_claim_reading_
      -- scoring_work / mock_persist_reading_scoring), invoked from the
      -- application layer once submission completes -- never by this
      -- legacy scorer, which only understands the legacy/Mathematics
      -- plain-scalar answer contract and cannot evaluate Reading's real,
      -- tiered contract. Skipping the legacy call here (rather than
      -- letting both authorities act on the same submission) is what
      -- prevents two competing scoring authorities from writing
      -- inconsistent results to the same report row. The report row
      -- stays at its migration-072 default (scoring_state =
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
    end if;
  end if;
  return new;
end;
$$;

commit;
