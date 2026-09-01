-- Angel Digital 11+ — Migration 172
-- English Content Foundation, Writing Depth Extension (Decision 259) —
-- Pending Independent Review Registration.
--
-- Registers the 2 new Continuous Writing prompts from migration 169
-- ("Your Favourite Place to Be", "Pocket Money or Helping Anyway?") as
-- awaiting an independent reviewer — the same proactive placeholder-
-- seeding pattern migrations 099/154/162/168 already established.
-- Progressed under the Founder's Completion and Readiness Programme
-- directive (2026-09-01), which explicitly authorised moving migration
-- 169's existing candidates through this review pipeline.
--
-- TWO rows, one per Writing prompt, each keyed by its own
-- `ali_question_bank.family_id` column value, per Decision 251's
-- explicit instruction and migration 168's own established convention —
-- never by the prompt's own row id.
--
-- review_type = 'mock_writing_prompt_independent_review' — the SAME
-- value migration 168 already used for "An Invented Place", not a new
-- one. reviewer is explicitly 'UNASSIGNED'. No row's eligibility_status
-- changes — both prompts remain 'authentic_assessment_candidate' exactly
-- as migration 169 left them. This migration inserts ONLY placeholder
-- rows recording that review is awaited; it does not itself constitute,
-- preselect, or imply any review decision, and no reviewer identity is
-- fabricated (Decision 48/51 precedent).
--
-- The idempotency guard checks family_id + decision + review_type +
-- notes together, matching migration 168's own exact convention.
--
-- Full review evidence for both targets named below lives in migration
-- 169's own header and Decision 258/259 in ALI_DECISION_LOG.md.
--
-- FAIL-CLOSED / NARROWLY SCOPED: touches public.ali_family_review only,
-- inserts exactly 2 rows, never touches ali_question_bank, cannot change
-- eligibility_status, cannot activate Practice or Mock (no such column
-- or table is referenced anywhere below), and cannot manufacture an
-- Approved review (every decision value inserted is
-- 'pending_independent_review', never any other value in the
-- family_review_decision enum).
--
-- Does not touch "An Invented Place" (eng-inc003-writing-wc01a-
-- imaginedplace) — that prompt's amendment-verification lifecycle
-- (migration 168, Decision 260/261A) is closed and explicitly not
-- reopened by this migration, per the Founder's directive.
--
-- NOT APPLIED. Founder must apply via the Supabase Dashboard SQL Editor,
-- after (or together with) migration 169.

begin;

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'writing_prompt', 'eng-inc003-writing-wc01a-favouriteplace', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'WRITING-DEPTH-EXTENSION-DECISION259 new content review: Continuous Writing prompt "Your Favourite Place to Be" (eng-inc003-writing-favouriteplace-01, QT-WC-01a, descriptive-justificatory reflection on an existing favourite place — see migration 169''s own header for the CSSE-004/014 evidence basis and the structural distinction from mock-writing-newplace-01)', 'mock_writing_prompt_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'eng-inc003-writing-wc01a-favouriteplace' and decision = 'pending_independent_review'
    and review_type = 'mock_writing_prompt_independent_review'
    and notes = 'WRITING-DEPTH-EXTENSION-DECISION259 new content review: Continuous Writing prompt "Your Favourite Place to Be" (eng-inc003-writing-favouriteplace-01, QT-WC-01a, descriptive-justificatory reflection on an existing favourite place — see migration 169''s own header for the CSSE-004/014 evidence basis and the structural distinction from mock-writing-newplace-01)'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'writing_prompt', 'eng-inc003-writing-wc01a-pocketmoney', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'WRITING-DEPTH-EXTENSION-DECISION259 new content review: Continuous Writing prompt "Pocket Money or Helping Anyway?" (eng-inc003-writing-pocketmoney-01, QT-WC-01a, two-position dilemma engagement — see migration 169''s own header for the CSSE-009 evidence basis and the structural distinction from mock-writing-cookopinion-01/mock-writing-screentime-01)', 'mock_writing_prompt_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'eng-inc003-writing-wc01a-pocketmoney' and decision = 'pending_independent_review'
    and review_type = 'mock_writing_prompt_independent_review'
    and notes = 'WRITING-DEPTH-EXTENSION-DECISION259 new content review: Continuous Writing prompt "Pocket Money or Helping Anyway?" (eng-inc003-writing-pocketmoney-01, QT-WC-01a, two-position dilemma engagement — see migration 169''s own header for the CSSE-009 evidence basis and the structural distinction from mock-writing-cookopinion-01/mock-writing-screentime-01)'
);

commit;
