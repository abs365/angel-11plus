-- ROLLBACK for migration 273 (use ONLY if the Founder asks, and only BEFORE any validator has worked on Great Stink). NOT part of the migration sequence; not applied.
-- Removes exactly what 273 added and re-activates exactly what 273 deactivated. Every statement is scoped to explicit ids; nothing else is touched.
-- Expected rows: family_review 2 deleted, question_bank 11 deleted, passage_bank 1 deleted, then 1 passage and 11 questions re-activated.
begin;
delete from public.ali_family_review where family_id = 'eng-fb-greatstink';
delete from public.ali_family_review where family_id = 'eng-inc003-salmonnavigation' and decision = 'rejected'::public.family_review_decision and notes like 'REJECTED AND REPLACED for English Form B (Founder, 2026-10-08)%';
delete from public.ali_question_bank where id like 'eng-fb-greatstink-q%' and eligibility_status = 'authentic_assessment_candidate';
delete from public.ali_passage_bank where id = 'eng-fb-greatstink' and eligibility_status = 'authentic_assessment_candidate';
update public.ali_passage_bank set active = true where id = 'eng-inc003-salmonnavigation' and eligibility_status = 'authentic_assessment_candidate';
update public.ali_question_bank set active = true where learning_unit_id = 'eng-inc003-salmonnavigation' and eligibility_status = 'authentic_assessment_candidate';
commit;
