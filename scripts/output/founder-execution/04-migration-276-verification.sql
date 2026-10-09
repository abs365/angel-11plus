-- READ-ONLY verification for migration 276 (Great Stink passage line endings). Nothing here writes. Run once, after you apply 276.

-- A. The passage row. EXPECT: len 3000, carriage_returns 0, newlines 10, md5 ea793ad48685208cc0a1ecd65722283c, word_count 530,
--    eligibility authentic_assessment_candidate, active true, pathway {csse}, review_state null.  (BEFORE: len 3010, carriage_returns 10, md5 8d9571b5fd8f5c4bb7ca57c5a2801f29.)
select id, length(original_text) as len,
       length(original_text) - length(replace(original_text, chr(13), '')) as carriage_returns,
       length(original_text) - length(replace(original_text, chr(10), '')) as newlines,
       md5(original_text) as text_md5, word_count, eligibility_status, active, pathway, review_state, title
  from ali_passage_bank where id = 'eng-fb-greatstink';

-- B. The row now equals every question copy byte for byte. EXPECT: question_copies 11, all_equal_row true.
select count(*) as question_copies, bool_and(prompt->>'passageText' = (select original_text from ali_passage_bank where id = 'eng-fb-greatstink')) as all_equal_row
  from ali_question_bank where id like 'eng-fb-greatstink-q%';

-- C. Only that one passage row changed. EXPECT: passage_other_hash 01db9646d743f6104bb3936c027226d3 (the same as after 273), passages_total 41.
select (select md5(string_agg(id||'|'||eligibility_status||'|'||active::text||'|'||original_text, E'\n' order by id)) from ali_passage_bank where id not in ('eng-inc003-salmonnavigation','eng-fb-greatstink')) as passage_other_hash,
       (select count(*) from ali_passage_bank) as passages_total,
       (select md5(string_agg(id||'|'||eligibility_status||'|'||original_text||'|'||title, E'\n' order by id)) from ali_passage_bank where id = 'eng-inc003-salmonnavigation') as salmon_passage_hash_should_be_806a3f8f85466ac80a5bd8ec2862c3ef;

-- D. No question, review, Salmon or other row changed. EXPECT: question_bank_other_hash af55ba0d0255505159e5a3b8ff1b4f93 (1132 rows), great_stink_questions_content_md5 76d94f0897731a00d4d8a9b84c1ee353,
--    bank_total 1528, family_review_total 317, family_review_other_hash fda9bb9f76641d4e2c78a59e9a60318d, salmon_questions_hash 086890d4f297f55b18bd7b83d55d985b.
select (select md5(string_agg(id||'|'||subject::text||'|'||skill||'|'||coalesce(learning_unit_id,'')||'|'||eligibility_status||'|'||active::text||'|'||content_version::text||'|'||prompt::text||'|'||coalesce(marking_mode,''), E'\n' order by id)) from ali_question_bank where not (learning_unit_id = 'eng-inc003-salmonnavigation' or id like 'eng-fb-greatstink-%' or learning_unit_id = 'eng-fb-greatstink' or id like 'qf-csse-%')) as question_bank_other_hash,
       (select md5(string_agg(id||'|'||(prompt - 'passageText')::text, E'\n' order by id)) from ali_question_bank where id like 'eng-fb-greatstink-q%') as great_stink_questions_content_md5,
       (select count(*) from ali_question_bank) as bank_total,
       (select count(*) from ali_family_review) as family_review_total,
       (select md5(string_agg(id::text||'|'||family_id||'|'||decision::text||'|'||coalesce(notes,''), E'\n' order by id::text)) from ali_family_review where family_id not in ('eng-inc003-salmonnavigation','eng-fb-greatstink')) as family_review_other_hash,
       (select md5(string_agg(id||'|'||prompt::text||'|'||eligibility_status||'|'||coalesce(learning_unit_id,'')||'|'||family_id, E'\n' order by id)) from ali_question_bank where learning_unit_id = 'eng-inc003-salmonnavigation') as salmon_questions_hash;

-- E. Sealed state, inventory and exposure unchanged. EXPECT: wrong_status 0, in_forms 0, exposed 0, attempts 0 ; practice maths 961 / english 306 / writing 8 ; mock_eligible maths 77 / english 50 / writing 2 ;
--    forms_total 3 and forms_naming_form_b_or_these_passages 0.
select (select count(*) from ali_question_bank where (id like 'eng-fb-greatstink-%' or learning_unit_id = 'eng-fb-greatstink') and eligibility_status <> 'authentic_assessment_candidate') as wrong_status,
       (select count(*) from ali_mock_form f where to_jsonb(f)::text ~* 'greatstink') as in_forms,
       (select count(*) from ali_mock_exposed_question_ids e where to_jsonb(e)::text ~* 'greatstink') as exposed,
       (select count(*) from ali_mock_attempt a where to_jsonb(a)::text ~* 'greatstink') as attempts,
       (select count(*) from ali_mock_form) as forms_total,
       (select count(*) from ali_mock_form f where to_jsonb(f)::text ~* 'compass|salmon|greatstink|form-b|formb|form_b') as forms_naming_form_b_or_these_passages;
select subject::text, eligibility_status, count(*) from ali_question_bank where active and eligibility_status in ('practice_eligible','mock_eligible') group by 1, 2 order by 1, 2;
