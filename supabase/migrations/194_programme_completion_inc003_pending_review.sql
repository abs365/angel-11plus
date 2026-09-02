-- Angel Digital 11+ — Migration 194
-- Angel Programme Completion, Increment 003 — Pending Independent Review
-- Registration for migration 193's new Comprehension content.
--
-- Registers "Two Different Projects" (passage + its complete 6-question
-- set) as awaiting an independent reviewer, following the SAME pattern
-- established by migrations 099/154 and corrected by migration 155/192 —
-- ONE row, keyed by the passage's own `id` column
-- ('eng-pc003-groupproject'), never by a separate `passage_family_id` value.
--
-- review_type = 'mock_english_passage_independent_review' — the same
-- value every Comprehension passage review target already uses. reviewer
-- is explicitly 'UNASSIGNED'. No row's eligibility_status changes
-- anywhere in this migration.
--
-- REQUIRES migration 193 to have already been applied — this migration's
-- own precondition explicitly checks for, and refuses without, the
-- passage existing with exactly its expected 6-question membership.
--
-- NOT APPLIED. Founder must apply via the Supabase Dashboard SQL Editor,
-- after (or together with) migration 193.

begin;

do $do$
declare
  v_passage_exists int;
  v_question_count int;
begin
  select count(*) into v_passage_exists
    from public.ali_passage_bank
    where id = 'eng-pc003-groupproject' and eligibility_status = 'authentic_assessment_candidate' and active = true;
  if v_passage_exists <> 1 then
    raise exception 'Migration 194 refused: expected exactly 1 authentic_assessment_candidate, active passage row with id = eng-pc003-groupproject (found %). Migration 193 must be applied first.', v_passage_exists;
  end if;

  select count(*) into v_question_count
    from public.ali_question_bank
    where learning_unit_id = 'eng-pc003-groupproject' and eligibility_status = 'authentic_assessment_candidate' and active = true;
  if v_question_count <> 6 then
    raise exception 'Migration 194 refused: expected exactly 6 authentic_assessment_candidate, active questions with learning_unit_id = eng-pc003-groupproject (found %).', v_question_count;
  end if;

  insert into public.ali_family_review
    (review_target_type, family_id, reviewer, decision, notes, review_type)
  select 'passage', 'eng-pc003-groupproject', 'UNASSIGNED',
    'pending_independent_review'::public.family_review_decision,
    'ANGEL-PROGRAMME-COMPLETION-INC003 new content review: passage "Two Different Projects" + its complete 6-numbered-question comprehension set (eng-pc003-groupproject-q01..q06). Dialogue-driven structural diversity target.',
    'mock_english_passage_independent_review'
  where not exists (
    select 1 from public.ali_family_review
    where family_id = 'eng-pc003-groupproject' and decision = 'pending_independent_review'
      and review_type = 'mock_english_passage_independent_review'
  );

  raise notice 'Migration 194: pending-independent-review placeholder registered (or already present) for eng-pc003-groupproject.';
end $do$;

commit;
