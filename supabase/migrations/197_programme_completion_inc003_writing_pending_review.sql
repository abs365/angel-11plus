-- Angel Digital 11+ — Migration 197
-- Angel Programme Completion, Increment 003 — Pending Independent Review
-- Registration for migration 196's two new Writing prompts.
--
-- Mirrors migration 099/154's own established writing_prompt registration
-- pattern exactly: family_id = the row's own `family_id` column value
-- (the correct key for Writing prompts, per fetchRepresentativeQuestions()
-- — distinct from the passage case migration 155 had to fix, which never
-- applied to Writing rows). reviewer 'UNASSIGNED', review_type
-- 'mock_writing_prompt_independent_review' (the same value every existing
-- Writing review row already uses, regardless of eventual Practice/Mock
-- destination). No eligibility_status changes anywhere in this migration.
--
-- NOT APPLIED. Founder must apply via the Supabase Dashboard SQL Editor,
-- after (or together with) migration 196.

begin;

insert into public.ali_family_review
  (review_target_type, family_id, reviewer, decision, notes, review_type)
select 'writing_prompt', 'mock-writing-wc01a-difficulttask', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'ANGEL-PROGRAMME-COMPLETION-INC003 new content review: Continuous Writing prompt "Something You Found Difficult" (QT-WC-01a).',
  'mock_writing_prompt_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-writing-wc01a-difficulttask' and decision = 'pending_independent_review'
    and review_type = 'mock_writing_prompt_independent_review'
);

insert into public.ali_family_review
  (review_target_type, family_id, reviewer, decision, notes, review_type)
select 'writing_prompt', 'mock-writing-wc01a-meaningfulplace', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'ANGEL-PROGRAMME-COMPLETION-INC003 new content review: Continuous Writing prompt "A Place That Means Something to You" (QT-WC-01a).',
  'mock_writing_prompt_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-writing-wc01a-meaningfulplace' and decision = 'pending_independent_review'
    and review_type = 'mock_writing_prompt_independent_review'
);

commit;
