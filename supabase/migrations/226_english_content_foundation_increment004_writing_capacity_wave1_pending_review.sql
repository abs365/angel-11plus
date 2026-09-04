-- Angel Digital 11+ — Migration 226
-- English Content Foundation, Increment 004 — Continuous Writing
-- Sustainable Capacity Wave 1, Pending Independent Review Registration.
--
-- Registers the 3 new Continuous Writing prompts from migration 225
-- ("A Skill You're Proud Of", "Something That Didn't Go to Plan",
-- "Advice for Someone Younger") as awaiting an independent reviewer —
-- the same proactive placeholder-seeding pattern migrations 099/154/162/
-- 168/172 already established, applied here to a genuinely new batch.
--
-- THREE rows, one per new Writing prompt, each keyed by its own
-- ali_question_bank.family_id column value (never by the prompt's own
-- row id), matching migration 172's own exact convention.
--
-- review_target_type = 'writing_prompt', review_type =
-- 'mock_writing_prompt_independent_review' — the SAME real, currently
-- valid values migration 172 already used (confirmed live in the
-- ali_family_review_target_type_check / ali_family_review_review_type_check
-- constraints, migrations 087/157) — not a new review category invented
-- for this increment. reviewer is explicitly 'UNASSIGNED'. No row's
-- eligibility_status changes anywhere in this migration — all three
-- prompts remain 'authentic_assessment_candidate' exactly as migration
-- 225 left them. This migration inserts ONLY placeholder rows recording
-- that review is awaited; it does not itself constitute, preselect, or
-- imply any review decision, and no reviewer identity is fabricated.
--
-- The idempotency guard checks family_id + decision + review_type +
-- notes together, matching migration 172's own exact convention.
--
-- FAIL-CLOSED / NARROWLY SCOPED: touches public.ali_family_review only,
-- inserts exactly 3 rows, never touches ali_question_bank, cannot change
-- eligibility_status, cannot activate Practice or Mock (no such column
-- or table is referenced anywhere below), and cannot manufacture an
-- Approved review (every decision value inserted is
-- 'pending_independent_review', never any other value in the
-- family_review_decision enum).
--
-- NOT APPLIED. Founder must apply via the Supabase Dashboard SQL Editor,
-- after (or together with) migration 225.

begin;

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'writing_prompt', 'eng-inc004-writing-wc01a-skillproud', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'WRITING-CAPACITY-WAVE1-PROGRAMME-INCREMENT-023 new content review: Continuous Writing prompt "A Skill You''re Proud Of" (eng-inc004-writing-skillproud-01, QT-WC-01a, ACCESSIBLE-tier steady-state personal-capability description) -- see migration 225''s own header for the full evidence basis and the structural distinction from every existing prompt.', 'mock_writing_prompt_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'eng-inc004-writing-wc01a-skillproud' and decision = 'pending_independent_review'
    and review_type = 'mock_writing_prompt_independent_review'
    and notes = 'WRITING-CAPACITY-WAVE1-PROGRAMME-INCREMENT-023 new content review: Continuous Writing prompt "A Skill You''re Proud Of" (eng-inc004-writing-skillproud-01, QT-WC-01a, ACCESSIBLE-tier steady-state personal-capability description) -- see migration 225''s own header for the full evidence basis and the structural distinction from every existing prompt.'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'writing_prompt', 'eng-inc004-writing-wc01a-notgotoplan', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'WRITING-CAPACITY-WAVE1-PROGRAMME-INCREMENT-023 new content review: Continuous Writing prompt "Something That Didn''t Go to Plan" (eng-inc004-writing-notgotoplan-01, QT-WC-01a, STANDARD-tier externally-caused-disruption-plus-adaptive-response narrative) -- see migration 225''s own header for the full evidence basis and the structural distinction from mistakelearned-01/newplace-01.', 'mock_writing_prompt_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'eng-inc004-writing-wc01a-notgotoplan' and decision = 'pending_independent_review'
    and review_type = 'mock_writing_prompt_independent_review'
    and notes = 'WRITING-CAPACITY-WAVE1-PROGRAMME-INCREMENT-023 new content review: Continuous Writing prompt "Something That Didn''t Go to Plan" (eng-inc004-writing-notgotoplan-01, QT-WC-01a, STANDARD-tier externally-caused-disruption-plus-adaptive-response narrative) -- see migration 225''s own header for the full evidence basis and the structural distinction from mistakelearned-01/newplace-01.'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'writing_prompt', 'eng-inc004-writing-wc01a-advice', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'WRITING-CAPACITY-WAVE1-PROGRAMME-INCREMENT-023 new content review: Continuous Writing prompt "Advice for Someone Younger" (eng-inc004-writing-advice-01, QT-WC-01a, DEMANDING-tier synthesis-across-multiple-experiences-for-an-implied-audience) -- see migration 225''s own header for the full evidence basis and the structural distinction from imaginedplace-01/pocketmoney-01.', 'mock_writing_prompt_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'eng-inc004-writing-wc01a-advice' and decision = 'pending_independent_review'
    and review_type = 'mock_writing_prompt_independent_review'
    and notes = 'WRITING-CAPACITY-WAVE1-PROGRAMME-INCREMENT-023 new content review: Continuous Writing prompt "Advice for Someone Younger" (eng-inc004-writing-advice-01, QT-WC-01a, DEMANDING-tier synthesis-across-multiple-experiences-for-an-implied-audience) -- see migration 225''s own header for the full evidence basis and the structural distinction from imaginedplace-01/pocketmoney-01.'
);

commit;

-- Read-only verification (run after applying):
--
-- select review_target_type, family_id, reviewer, decision, review_type
-- from public.ali_family_review
-- where family_id in ('eng-inc004-writing-wc01a-skillproud', 'eng-inc004-writing-wc01a-notgotoplan', 'eng-inc004-writing-wc01a-advice')
-- order by family_id;
--
-- Expected: 3 rows, all decision = 'pending_independent_review', all
-- reviewer = 'UNASSIGNED', all review_type = 'mock_writing_prompt_independent_review'.
