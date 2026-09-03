-- Angel Digital 11+ — Migration 211
-- Programme Completion Increment 014: Writing-only mock_eligible
-- promotion, standalone. Supersedes migration 207's Writing portion.
--
-- ============================================================
-- WHY THIS IS SEPARATE FROM MIGRATION 210 (Reading)
-- ============================================================
-- Per the Founder's own instruction this increment: "Prefer explicit
-- allocation over bundled convenience." mock-writing-screentime-01 is
-- NOT part of Reading Comprehension Mock 1 and is not being composed
-- into any form this increment. Its strategic timing is a genuinely
-- separate question from Reading's: Reading's five passages have a
-- clear, bounded next use (Mock 1 now, Mock 2 later); Writing's only
-- ready asset has no confirmed next use until the full English Mock
-- architecture question (post-2024 marks split; whether picture-
-- stimulus is still current) is resolved -- a separate, still-open
-- research question (Increment 013, Section 14), deliberately not
-- reopened by this migration.
--
-- Promoting it to mock_eligible now is still judged safe and worth
-- doing: mock_eligible content is not servable to any learner until it
-- is referenced by an active ali_mock_form with a real attempt (Decision
-- 59's firewall, migration 208/209's enforcement) -- promotion removes a
-- future blocker without committing this content to any specific Mock,
-- exactly like the Reading passages held in reserve in migration 210.
--
-- Content, evidence, and safety pattern otherwise unchanged from 207 --
-- full review provenance (independently_validated since migration 160,
-- approved_with_amendment by Ayobami Lawal, content-corrected in
-- migration 159) and freshness proof (confirmed never Practice-eligible,
-- confirmed never Mock-exposed) are in Increment 013/014's own reports.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query.

begin;

do $$
declare
  v_pending_count int;
  v_already_promoted_count int;
begin
  select count(*) into v_pending_count from public.ali_question_bank
  where id = 'mock-writing-screentime-01' and eligibility_status = 'independently_validated' and active = true;
  select count(*) into v_already_promoted_count from public.ali_question_bank
  where id = 'mock-writing-screentime-01' and eligibility_status = 'mock_eligible';

  if v_pending_count = 1 then
    update public.ali_question_bank set eligibility_status = 'mock_eligible'
    where id = 'mock-writing-screentime-01' and eligibility_status = 'independently_validated';
    raise notice 'Migration 211: promoted mock-writing-screentime-01 (Screen Time) to mock_eligible. Not included in any Mock form this increment.';
  elsif v_already_promoted_count = 1 then
    raise notice 'Migration 211: mock-writing-screentime-01 already mock_eligible -- already applied. No changes made.';
  else
    raise exception 'Migration 211 refused (Screen Time Writing prompt): expected 1 independently_validated row (found %), or already mock_eligible (found %). Re-verify production state before proceeding.', v_pending_count, v_already_promoted_count;
  end if;
end $$;

commit;

-- Read-only verification:
-- select id, eligibility_status from public.ali_question_bank where id = 'mock-writing-screentime-01';
