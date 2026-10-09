-- READ-ONLY verification for migration 273 (Great Stink sealed + Salmon rejected/replaced). Nothing here writes.
-- Run the BEFORE column expectations first if you wish (they were captured read-only on 2026-10-09), then apply 273 ONCE, then run these.

-- A. Great Stink passage. EXPECT 1 row: authentic_assessment_candidate, active true, {csse}, word_count 530, review_state null,
--    text_md5 ea793ad48685208cc0a1ecd65722283c  (BEFORE: no row).
select id, eligibility_status, active, pathway, word_count, review_state, md5(original_text) as text_md5 from ali_passage_bank where id = 'eng-fb-greatstink';

-- B. Great Stink questions. EXPECT: n 11, all_candidates true, all_active true, all_csse true, all_unit_ok true, marks_total 18, passage_text_ok 11.
--    BEFORE: n 0.
select count(*) as n,
       bool_and(eligibility_status = 'authentic_assessment_candidate') as all_candidates,
       bool_and(active) as all_active,
       bool_and(pathway = array['csse']) as all_csse,
       bool_and(learning_unit_id = 'eng-fb-greatstink') as all_unit_ok,
       sum((prompt->>'marks')::int) as marks_total,
       count(*) filter (where md5(prompt->>'passageText') = 'ea793ad48685208cc0a1ecd65722283c') as passage_text_ok
  from ali_question_bank where id like 'eng-fb-greatstink-q%';

-- C. Tiers. EXPECT: TIER2_ACCEPTED_SET 7, TIER3_QUOTATION_PLUS_EXPLANATION 1, TIER4_ORDERED_LIST 1, TIER5_NAMED_COMPONENT_PLUS_EXPLANATION 2.
select prompt->>'validationTier' as tier, count(*) from ali_question_bank where id like 'eng-fb-greatstink-q%' group by 1 order by 1;

-- D. Great Stink is SEALED: not Practice, not Mock-eligible, not in any form, exposure list or attempt. EXPECT: every number 0.
select (select count(*) from ali_question_bank where (id like 'eng-fb-greatstink-%' or learning_unit_id = 'eng-fb-greatstink') and eligibility_status <> 'authentic_assessment_candidate') as wrong_status,
       (select count(*) from ali_passage_bank where id = 'eng-fb-greatstink' and eligibility_status <> 'authentic_assessment_candidate') as passage_wrong_status,
       (select count(*) from ali_mock_form f where to_jsonb(f)::text like '%greatstink%') as in_mock_forms,
       (select count(*) from ali_mock_exposed_question_ids e where to_jsonb(e)::text like '%greatstink%') as in_exposed_question_ids,
       (select count(*) from ali_mock_exposed_passage_ids e where to_jsonb(e)::text like '%greatstink%') as in_exposed_passage_ids,
       (select count(*) from ali_mock_attempt a where to_jsonb(a)::text like '%greatstink%') as in_attempts;

-- E. Review registration. EXPECT: Great Stink 1 row pending_independent_review (never approved); Salmon 3 rows: approved, pending_independent_review, rejected.
--    BEFORE: Great Stink 0; Salmon 2 (approved, pending_independent_review).
select family_id, decision::text, reviewer, review_type, left(notes, 90) as notes from ali_family_review where family_id in ('eng-fb-greatstink', 'eng-inc003-salmonnavigation') order by family_id, decision::text;

-- F. Salmon is PRESERVED (not deleted), only deactivated. EXPECT: passage 1 row authentic_assessment_candidate active FALSE; questions n 11 all authentic_assessment_candidate active FALSE.
--    BEFORE: both active TRUE.
select 'passage' as what, count(*) as n, bool_or(active) as any_active, bool_and(eligibility_status = 'authentic_assessment_candidate') as unchanged_status from ali_passage_bank where id = 'eng-inc003-salmonnavigation'
union all
select 'questions', count(*), bool_or(active), bool_and(eligibility_status = 'authentic_assessment_candidate') from ali_question_bank where learning_unit_id = 'eng-inc003-salmonnavigation';

-- G. Salmon CONTENT is byte-identical (only `active` changed). EXPECT all three to equal their BEFORE values:
--    questions_content_hash 086890d4f297f55b18bd7b83d55d985b | passage_text_md5 d9664bcb23421f804554931dc5a723a4 | passage_hash 806a3f8f85466ac80a5bd8ec2862c3ef
select (select md5(string_agg(id||'|'||prompt::text||'|'||eligibility_status||'|'||coalesce(learning_unit_id,'')||'|'||family_id, E'\n' order by id)) from ali_question_bank where learning_unit_id = 'eng-inc003-salmonnavigation') as questions_content_hash,
       (select md5(original_text) from ali_passage_bank where id = 'eng-inc003-salmonnavigation') as passage_text_md5,
       (select md5(string_agg(id||'|'||eligibility_status||'|'||original_text||'|'||title, E'\n' order by id)) from ali_passage_bank where id = 'eng-inc003-salmonnavigation') as passage_hash;

-- H. NOTHING ELSE changed. EXPECT each value to equal BEFORE:
--    (BEFORE values re-captured read-only on 2026-10-09 after the 374 publication and migration 275; they supersede any earlier figures.)
--    question_bank_other_rows 1132 / af55ba0d0255505159e5a3b8ff1b4f93 ; passage_other_hash 01db9646d743f6104bb3936c027226d3 (passages_total 41 after, 40 before) ;
--    family_review_other_hash fda9bb9f76641d4e2c78a59e9a60318d (family_review_total 317 after, 315 before) ; bank_total 1528 after (1517 before) ; qf_csse rows 374 before and after.
select (select count(*) from ali_question_bank where not (learning_unit_id = 'eng-inc003-salmonnavigation' or id like 'eng-fb-greatstink-%' or learning_unit_id = 'eng-fb-greatstink' or id like 'qf-csse-%')) as question_bank_other_rows,
       (select md5(string_agg(id||'|'||subject::text||'|'||skill||'|'||coalesce(learning_unit_id,'')||'|'||eligibility_status||'|'||active::text||'|'||content_version::text||'|'||prompt::text||'|'||coalesce(marking_mode,''), E'\n' order by id)) from ali_question_bank where not (learning_unit_id = 'eng-inc003-salmonnavigation' or id like 'eng-fb-greatstink-%' or learning_unit_id = 'eng-fb-greatstink' or id like 'qf-csse-%')) as question_bank_other_hash,
       (select md5(string_agg(id||'|'||eligibility_status||'|'||active::text||'|'||original_text, E'\n' order by id)) from ali_passage_bank where id not in ('eng-inc003-salmonnavigation','eng-fb-greatstink')) as passage_other_hash,
       (select count(*) from ali_passage_bank) as passages_total,
       (select md5(string_agg(id::text||'|'||family_id||'|'||decision::text||'|'||coalesce(notes,''), E'\n' order by id::text)) from ali_family_review where family_id not in ('eng-inc003-salmonnavigation','eng-fb-greatstink')) as family_review_other_hash,
       (select count(*) from ali_family_review) as family_review_total,
       (select count(*) from ali_question_bank) as bank_total;

-- I. Inventory and permissions unchanged. EXPECT (identical before and after): practice maths 961 / english 306 / writing 8 (total 1,275) ; mock_eligible maths 77 / english 50 / writing 2 ;
--    RLS on for all four tables with policy counts 1, 1, 1, 2 ; function hash d757a642c8bcb273e78924a6ddd7357c over 56 functions (migration 273 changes no function).
select subject::text, eligibility_status, count(*) from ali_question_bank where active and eligibility_status in ('practice_eligible','mock_eligible') group by 1, 2 order by 1, 2;
select c.relname, c.relrowsecurity, (select count(*) from pg_policies p where p.tablename = c.relname) as policies from pg_class c where c.oid in ('public.ali_question_bank'::regclass, 'public.ali_passage_bank'::regclass, 'public.ali_family_review'::regclass, 'public.ali_question_candidate'::regclass) order by 1;
select count(*) as function_count, md5(string_agg(p.proname||'|'||md5(p.prosrc), E'\n' order by p.proname, p.oid)) as all_functions_hash from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public';

-- K. The 11 Great Stink questions are EXACTLY the reviewed text (everything except the repeated passageText, which block B already checks by md5).
--    EXPECT: n 11 and questions_content_md5 76d94f0897731a00d4d8a9b84c1ee353  (BEFORE: n 0). This value was computed read-only from the migration's own JSON bodies.
select count(*) as n, md5(string_agg(id||'|'||(prompt - 'passageText')::text, E'
' order by id)) as questions_content_md5 from ali_question_bank where id like 'eng-fb-greatstink-q%';

-- L. No Form B exists and nothing references the new or the old passage. EXPECT: forms_total 3 (first-mock-mathematics-v1, reading-comprehension-mock-1, english-full-mock-v1), every other number 0.
select (select count(*) from ali_mock_form) as forms_total,
       (select count(*) from ali_mock_form f where to_jsonb(f)::text ~* 'compass|salmon|greatstink|form-b|formb|form_b') as forms_naming_form_b_or_these_passages,
       (select count(*) from ali_mock_exposed_question_ids e where to_jsonb(e)::text ~* 'salmon|greatstink|compass') as exposed_question_hits,
       (select count(*) from ali_mock_attempt a where to_jsonb(a)::text ~* 'salmon|greatstink') as attempt_hits;

-- J. The Mock composer guard is in code (lib/ali/rejectedMockContent.ts), not in the database: confirm the deployed build contains commit bfea0e5 or later.
