-- Angel Digital 11+ — Migration 102
-- Mock Programme Increment 006 — English Comprehension Batch 001
-- Independent Validation Promotion (Decision 158, Phase A).
--
-- Promotes the complete "The Boat in the Boathouse" assessment unit from
-- eligibility_status 'authentic_assessment_candidate' to
-- 'independently_validated' — the 13 attached ali_question_bank rows
-- (12 numbered questions: 11 standalone + Q12a/Q12b grouped) AND the
-- passage's own ali_passage_bank row.
--
-- DELIBERATE SCOPE DECISION, DISCLOSED EXPLICITLY: the Founder's own
-- directive for this migration named "13 response-component rows" and a
-- "Total: 26 rows" figure (10 Mathematics + 13 English + 3 Writing) as
-- the expected certification scope, without separately naming
-- ali_passage_bank. This migration promotes 14 English rows, not 13 --
-- the same 13 question rows PLUS the passage's own row -- because the
-- SAME directive also states, in its own words: "Do not treat '26 rows'
-- as the educational unit of the Mock programme... The relevant units
-- remain: ... English passage + complete attached question set", and
-- migration 099's own design comment (Decision 151) already established
-- that the Founder's independent review of this passage judges "the
-- passage and its complete attached question set... together as ONE
-- unit". Leaving the passage's own row at authentic_assessment_candidate
-- while promoting only its 13 questions would create exactly the
-- orphaned, unit-inconsistent state that framing warns against -- one
-- reviewed, approved educational unit, split across two different
-- governance stages depending on which table happens to hold which part
-- of it. This is a considered interpretation of an explicit directive
-- gap, not a silent deviation from an explicit instruction; it is named
-- here precisely so the Founder can correct it if this reading is wrong.
-- The true row-level total this migration promotes is 14 (13 + 1), not
-- 13 -- the grand total across all three certification migrations
-- (101/102/103) is therefore 27, not 26.
--
-- Founder-supplied evidence, Level 1, the strongest evidence class this
-- session holds for any of the three certification migrations: a direct
-- read-only production query (run by the Founder, reported verbatim in
-- this session's own conversation) returned exactly 3 ali_family_review
-- rows for family_id = 'mock-eng-boathouse' -- the original migration 099
-- placeholder (reviewer UNASSIGNED, decision pending_independent_review),
-- and TWO genuine rows with reviewer 'Ayobami Lawal', review_target_type
-- = 'passage', review_type = 'mock_english_passage_independent_review',
-- decision = 'approved', at 2026-08-24 15:45:22 and 2026-08-24 16:40:36.
-- Decision 157 already root-caused and corrected why the production
-- review page did not display this correctly (a status-reader defect,
-- not a write-path or data defect) -- both genuine rows were always
-- correctly written; this migration promotes on the strength of those
-- rows directly, not on the corrected UI display.
--
-- Selected by exact question ID (ali_question_bank) and exact passage ID
-- (ali_passage_bank), never inferred: matches migration 090/094/101's
-- own established discipline.
--
-- INDEPENDENT-VALIDATION BOUNDARY, not mock-eligibility: this migration
-- moves these 14 rows to 'independently_validated' ONLY. It does NOT set
-- eligibility_status = 'mock_eligible' anywhere, does NOT insert or
-- modify any ali_mock_form row, and does NOT touch ali_family_review in
-- any way.
--
-- CONTENT IMMUTABILITY: no prompt, answer, explanation, marks, skill,
-- family_id, learning_unit_id (passage association), provenance,
-- content_version, question_group_id, group_order, subpart_label,
-- marking_mode, active state, passage title, original_text, word_count,
-- reading_complexity, genre, or review_state is changed. Only
-- eligibility_status moves on both tables.
--
-- Fails safely, mirroring migration 090/094/101's own assertion-and-
-- refuse pattern, checked independently for each table: if either the
-- 13 question rows or the 1 passage row does not match its expected
-- pre-promotion state exactly (and is not already in the clean
-- post-application state), this migration refuses to guess and raises an
-- exception, touching nothing. Both checks share this migration's single
-- transaction, so the question set and its passage are promoted together
-- or not at all -- the unit is never left split between the two
-- eligibility stages.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations 097/098
-- (Decision 151, applied) have already been applied. Independent of
-- migration 101 (Mathematics Batch 003) -- no ordering dependency
-- between them beyond both following migrations 095-100.

begin;

do $$
declare
  v_pending_count int;
  v_already_validated_count int;
  v_target_ids constant text[] := array[
    'mock-eng-boathouse-q01', 'mock-eng-boathouse-q02', 'mock-eng-boathouse-q03',
    'mock-eng-boathouse-q04', 'mock-eng-boathouse-q05', 'mock-eng-boathouse-q06',
    'mock-eng-boathouse-q07', 'mock-eng-boathouse-q08', 'mock-eng-boathouse-q09',
    'mock-eng-boathouse-q10', 'mock-eng-boathouse-q11',
    'mock-eng-boathouse-q12a', 'mock-eng-boathouse-q12b'
  ];
begin
  select count(*) into v_pending_count
  from public.ali_question_bank
  where id = any(v_target_ids)
    and eligibility_status = 'authentic_assessment_candidate'
    and active = true
    and learning_unit_id = 'mock-eng-boathouse';

  select count(*) into v_already_validated_count
  from public.ali_question_bank
  where id = any(v_target_ids)
    and eligibility_status = 'independently_validated';

  if v_pending_count = 13 then
    update public.ali_question_bank
    set eligibility_status = 'independently_validated'
    where id = any(v_target_ids)
      and eligibility_status = 'authentic_assessment_candidate';

    raise notice 'Migration 102: promoted 13 English Comprehension Batch 001 question rows (12 numbered questions) attached to mock-eng-boathouse from authentic_assessment_candidate to independently_validated.';

  elsif v_already_validated_count = 13 then
    raise notice 'Migration 102: all 13 target question rows are already independently_validated -- already applied. No changes made.';

  else
    raise exception
      'Migration 102 refused (question rows): expected 13 authentic_assessment_candidate rows attached to mock-eng-boathouse (found %), or 13 already independently_validated (found %). Re-verify production state before proceeding.',
      v_pending_count, v_already_validated_count;
  end if;
end $$;

do $$
declare
  v_pending_count int;
  v_already_validated_count int;
begin
  select count(*) into v_pending_count
  from public.ali_passage_bank
  where id = 'mock-eng-boathouse'
    and eligibility_status = 'authentic_assessment_candidate'
    and active = true;

  select count(*) into v_already_validated_count
  from public.ali_passage_bank
  where id = 'mock-eng-boathouse'
    and eligibility_status = 'independently_validated';

  if v_pending_count = 1 then
    update public.ali_passage_bank
    set eligibility_status = 'independently_validated'
    where id = 'mock-eng-boathouse'
      and eligibility_status = 'authentic_assessment_candidate';

    raise notice 'Migration 102: promoted the mock-eng-boathouse passage row from authentic_assessment_candidate to independently_validated, alongside its 13 question rows.';

  elsif v_already_validated_count = 1 then
    raise notice 'Migration 102: the mock-eng-boathouse passage row is already independently_validated -- already applied. No changes made.';

  else
    raise exception
      'Migration 102 refused (passage row): expected exactly 1 authentic_assessment_candidate row for id = mock-eng-boathouse (found %), or already independently_validated (found %). Re-verify production state before proceeding.',
      v_pending_count, v_already_validated_count;
  end if;
end $$;

commit;
