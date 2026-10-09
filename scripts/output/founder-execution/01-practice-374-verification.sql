-- READ-ONLY verification for the 374 Maths Practice candidates. Run each block in the Supabase SQL editor. Nothing here writes.
-- BEFORE values were captured read-only on 2026-10-09 and are stated beside each block.

-- ============ STEP 2: after the six submit scripts (candidates must be PENDING, nothing published) ============
-- 2a. EXPECT: csse_total 374, csse_pending_unpublished 374, all_candidates 953, all_pending 404, all_published 549.
--     BEFORE: csse_total 0, all_candidates 579, all_pending 30, all_published 549.
select count(*) filter (where candidate_id like 'csse-%') as csse_total,
       count(*) filter (where candidate_id like 'csse-%' and review_status = 'pending_review' and publication_status = 'unpublished') as csse_pending_unpublished,
       count(*) as all_candidates,
       count(*) filter (where review_status = 'pending_review') as all_pending,
       count(*) filter (where publication_status = 'published') as all_published
  from ali_question_candidate;

-- 2b. EXPECT: af 32, br 96, ctx 134, dh 48, gr 40, nl 24 (total 374).
select split_part(candidate_id, '-', 2) as set_prefix, count(*) from ali_question_candidate where candidate_id like 'csse-%' group by 1 order by 1;

-- 2c. The six trimmed candidates must NOT exist. EXPECT: 0.
select count(*) as excluded_present from ali_question_candidate
 where candidate_id in ('csse-ctx-mr01-bp-change-from-note-02','csse-ctx-mr01-bp-change-from-note-08','csse-ctx-mr01-bp-change-from-note-09',
                        'csse-ctx-mr01-bp-change-from-note-11','csse-ctx-mr01-bp-change-from-note-13','csse-ctx-mr01-bp-change-from-note-14');

-- 2d. Practice is untouched at this stage. EXPECT: maths 587, english 306, writing 8, total 901; bank_total 1143.
select count(*) filter (where eligibility_status = 'practice_eligible' and subject = 'maths') as practice_maths,
       count(*) filter (where eligibility_status = 'practice_eligible' and subject = 'english') as practice_english,
       count(*) filter (where eligibility_status = 'practice_eligible' and subject = 'writing') as practice_writing,
       count(*) filter (where eligibility_status = 'practice_eligible') as practice_total,
       count(*) as bank_total
  from ali_question_bank;

-- ============ STEP 4: AFTER governed approval and publication ============
-- 4a. EXPECT one row: approved / published / controlled_batch_sampling / 374.
select review_status, publication_status, review_method, count(*) from ali_question_candidate where candidate_id like 'csse-%' group by 1, 2, 3;

-- 4b. Published rows. EXPECT: published_rows 374; missing_answer 0; wrong_status 0 (all practice_eligible, active, subject maths, pathway csse).
select count(*) as published_rows,
       count(*) filter (where (prompt->>'answer') is null or trim(prompt->>'answer') = '') as missing_answer,
       count(*) filter (where eligibility_status <> 'practice_eligible' or not active or subject::text <> 'maths' or pathway <> array['csse']) as wrong_status
  from ali_question_bank where id like 'qf-csse-%';

-- 4c. Every published row maps to its candidate. EXPECT: unmapped 0.
select count(*) as unmapped from ali_question_candidate c
 where c.candidate_id like 'csse-%' and (c.published_question_id is distinct from 'qf-' || c.candidate_id or not exists (select 1 from ali_question_bank b where b.id = c.published_question_id));

-- 4d. Difficulty and representation of the published set.
--     EXPECT difficulty: easy 46, medium 152, hard 176. EXPECT stimulus types: none 182, table 72, bar-chart 24, coordinate-grid 40, angle-figure 32, number-line 24.
select content_difficulty::text as k, count(*) from ali_question_bank where id like 'qf-csse-%' group by 1
union all
select 'stimulus:' || coalesce(prompt->'stimulus'->>'type', 'none'), count(*) from ali_question_bank where id like 'qf-csse-%' group by 1 order by 1;

-- 4e. Inventory. EXPECT: practice_maths 961, practice_english 306, practice_writing 8, practice_total 1275, bank_total 1517.
select count(*) filter (where eligibility_status = 'practice_eligible' and subject = 'maths') as practice_maths,
       count(*) filter (where eligibility_status = 'practice_eligible' and subject = 'english') as practice_english,
       count(*) filter (where eligibility_status = 'practice_eligible' and subject = 'writing') as practice_writing,
       count(*) filter (where eligibility_status = 'practice_eligible') as practice_total,
       count(*) as bank_total
  from ali_question_bank;

-- 4f. Nothing else in the bank changed (every row except the new ones and the two Form B passages' rows that migration 273 owns).
--     EXPECT: count 1132 and hash 1ec47ab8efc9ffee02822989e523c84f (identical to BEFORE).
select count(*) as other_rows,
       md5(string_agg(id||'|'||subject::text||'|'||skill||'|'||coalesce(learning_unit_id,'')||'|'||eligibility_status||'|'||active::text||'|'||content_version::text||'|'||prompt::text||'|'||coalesce(marking_mode,''), E'\n' order by id)) as other_rows_hash
  from ali_question_bank
 where not (learning_unit_id = 'eng-inc003-salmonnavigation' or id like 'eng-fb-greatstink-%' or learning_unit_id = 'eng-fb-greatstink' or id like 'qf-csse-%');

-- 4g. No Mock exposure and no leak to sealed content. EXPECT: all four 0.
select (select count(*) from ali_mock_form f where to_jsonb(f)::text ~ 'qf-csse-') as in_mock_forms,
       (select count(*) from ali_mock_exposed_question_ids e where to_jsonb(e)::text ~ 'qf-csse-') as in_exposed_ids,
       (select count(*) from ali_mock_attempt a where to_jsonb(a)::text ~ 'qf-csse-') as in_attempts,
       (select count(*) from ali_question_bank where id like 'qf-csse-%' and (id like '%mock-%' or eligibility_status in ('mock_eligible','independently_validated'))) as mock_status_rows;

-- 4h. Practice marking contract and representation integrity (run outside SQL, with the repository checkout):
--     export the 374 prompts (select id, prompt from ali_question_bank where id like 'qf-csse-%') and run the real
--     checkMathsAnswer over each stated answer (must accept it) and the fail-closed isValid*Stimulus validators over every stimulus (must all pass).
--     Then a real-browser pass: one question per representation (table, bar chart, coordinate grid, angle figure, number line) on a test learner.
