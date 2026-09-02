-- Angel Digital 11+ — Post-Migration Verification for Migration 187
-- (READ-ONLY, single result table plus per-row detail). Run this AFTER
-- applying migration 187 via Supabase Dashboard > SQL Editor. Every
-- statement below is a SELECT only -- no INSERT, UPDATE, DELETE, or DDL.
--
-- Note on checks 9-10 ("textually defensible"): SQL cannot itself judge
-- semantic truth against prose. These checks instead confirm, by direct
-- substring containment against this row's own prompt->>'passageText'
-- (which the content format stores inline, so no join is needed), that
-- each of the four correctOptions has a literal supporting phrase in the
-- passage, and that each of the two newly-corrected options has a
-- literal contradicting phrase in the passage -- the same mechanical
-- technique already used in migration 187's own header derivation and
-- in the committed regression tests (tests/content/englishWave2.test.ts).
-- This is strong, direct evidence, not a substitute for the human
-- re-reading already documented in the migration header.

with
expected (id, expected_question, expected_model_answer, expected_misconception,
          expected_correct_options, true_evidence_phrase_1, true_evidence_phrase_2,
          true_evidence_phrase_3, true_evidence_phrase_4, corrected_option_contradiction_phrase) as (
  values
  ('w2-longwalk-02',
   'Tick 4 boxes that accurately describe things the narrator did on the way home. A. Walked down Kestrel Road first. B. Waited at the bus stop the whole time. C. Went straight past the park without stopping. D. Bought a bike from the corner shop. E. Cut through the alley behind the launderette. F. Stopped at the corner shop for crisps. G. Took a taxi for part of the way. H. Crossed the main road at the pelican crossing.',
   'A, E, F, H: she walked down Kestrel Road first, cut through the alley behind the launderette, stopped at the corner shop for crisps, and crossed the main road at the pelican crossing.',
   'Selecting B, D or G, which the passage explicitly contradicts (the bus never came, no bike was bought, no taxi is mentioned), or C, since she did stop at the park to shelter from the rain.',
   '["A","E","F","H"]'::jsonb,
   'I set off down Kestrel Road first',
   'I cut through the alley behind the launderette',
   'I stopped at the corner shop to buy a bag of crisps',
   'I crossed the main road at the pelican crossing',
   'I ducked under the bus shelter there instead'),
  ('w2-stormwarning-02',
   'Tick 4 boxes that accurately describe things that happened in the passage. A. Dad flattened the trampoline. B. Theo helped carry the bins. C. Mum closed and checked the windows. D. The narrator secured the wheelie bins. E. Mum trusted the window to stay shut on its own. F. Theo was frightened by the storm. G. Dad made a final trip to check the trampoline. H. They ate dinner in a restaurant.',
   'A, C, D, G: Dad flattened the trampoline, Mum closed and checked the windows, the narrator secured the wheelie bins, and Dad made a final trip to check the trampoline.',
   'Selecting B or H, which the passage does not support (Theo gave commentary, not help with bins; dinner was eaten at home by torchlight), F, since Theo is shown to be excited rather than frightened, or E, since Mum is shown watching the window as though she did not trust it to stay shut.',
   '["A","C","D","G"]'::jsonb,
   'hauling the trampoline flat',
   'closing every window and checking each latch twice',
   'I dragged both wheelie bins into the side passage',
   'made one final trip to check the trampoline',
   'didn''t quite trust it to stay shut on its own')
),
row_check as (
  select
    e.id,
    q.id is not null as row_present,
    q.prompt->>'question' = e.expected_question as question_exact_match,
    q.prompt->>'modelAnswer' = e.expected_model_answer as model_answer_exact_match,
    q.addresses_misconception = e.expected_misconception as misconception_exact_match,
    q.prompt->'correctOptions' = e.expected_correct_options as correct_options_unchanged,
    (q.prompt->>'requiredSelectionCount')::int = 4 as required_selection_count_is_4,
    q.prompt->>'validationTier' = 'TIER6_MULTI_SELECT' as validation_tier_unchanged,
    q.prompt->>'passageText' ilike '%' || e.true_evidence_phrase_1 || '%' as evidence_1_present,
    q.prompt->>'passageText' ilike '%' || e.true_evidence_phrase_2 || '%' as evidence_2_present,
    q.prompt->>'passageText' ilike '%' || e.true_evidence_phrase_3 || '%' as evidence_3_present,
    q.prompt->>'passageText' ilike '%' || e.true_evidence_phrase_4 || '%' as evidence_4_present,
    q.prompt->>'passageText' ilike '%' || e.corrected_option_contradiction_phrase || '%' as corrected_option_contradiction_present,
    q.eligibility_status,
    q.family_id
  from expected e
  left join public.ali_question_bank q on q.id = e.id
)

select 1 as ord, '1. Both rows present' as check_name, 'true' as expected,
  bool_and(row_present)::text as actual,
  case when bool_and(row_present) then 'PASS' else 'FAIL' end as status
from row_check

union all
select 2, '2. question text exact post-state match (both rows)', 'true',
  bool_and(question_exact_match)::text,
  case when bool_and(question_exact_match) then 'PASS' else 'FAIL' end
from row_check

union all
select 3, '3. modelAnswer exact post-state match, hedging language removed (both rows)', 'true',
  bool_and(model_answer_exact_match)::text,
  case when bool_and(model_answer_exact_match) then 'PASS' else 'FAIL' end
from row_check

union all
select 4, '4. addresses_misconception exact post-state match (both rows)', 'true',
  bool_and(misconception_exact_match)::text,
  case when bool_and(misconception_exact_match) then 'PASS' else 'FAIL' end
from row_check

union all
select 5, '5. correctOptions unchanged (both rows)', 'true',
  bool_and(correct_options_unchanged)::text,
  case when bool_and(correct_options_unchanged) then 'PASS' else 'FAIL' end
from row_check

union all
select 6, '6. requiredSelectionCount = 4 (both rows)', 'true',
  bool_and(required_selection_count_is_4)::text,
  case when bool_and(required_selection_count_is_4) then 'PASS' else 'FAIL' end
from row_check

union all
select 7, '7. validationTier unchanged (TIER6_MULTI_SELECT, both rows)', 'true',
  bool_and(validation_tier_unchanged)::text,
  case when bool_and(validation_tier_unchanged) then 'PASS' else 'FAIL' end
from row_check

union all
select 8, '8. all 4 correctOptions have a literal supporting phrase in the passage (both rows)', 'true',
  bool_and(evidence_1_present and evidence_2_present and evidence_3_present and evidence_4_present)::text,
  case when bool_and(evidence_1_present and evidence_2_present and evidence_3_present and evidence_4_present) then 'PASS' else 'FAIL' end
from row_check

union all
select 9, '9. the newly-corrected option''s contradicting phrase is present in the passage (both rows)', 'true',
  bool_and(corrected_option_contradiction_present)::text,
  case when bool_and(corrected_option_contradiction_present) then 'PASS' else 'FAIL' end
from row_check

union all
select 10, '10. neither row belongs to a Mock family_id', 'true',
  bool_and(family_id not ilike '%mock%')::text,
  case when bool_and(family_id not ilike '%mock%') then 'PASS' else 'FAIL' end
from row_check

order by ord;

-- Per-row detail, so any failure is immediately identifiable, plus the
-- current eligibility_status for the record (migration 187 does not
-- touch this column, so any value here reflects pre-existing state).
select id, row_present, question_exact_match, model_answer_exact_match,
  misconception_exact_match, correct_options_unchanged, required_selection_count_is_4,
  validation_tier_unchanged, eligibility_status, family_id
from row_check
order by id;
