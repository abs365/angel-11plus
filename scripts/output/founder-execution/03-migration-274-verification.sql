-- READ-ONLY verification for migration 274 (Mock Maths coordinate-answer normaliser). Nothing here writes.
-- BEFORE values were captured read-only on 2026-10-09.

-- A. The function now equals the BEFORE function plus ONLY the declared additions.
--    EXPECT after apply: normalised_md5 2315004514e2d5a20897d826b8c96519   (BEFORE: 28840b5d4a9b9e0300b040f458123676; raw length before 6556).
--    (The normalisation removes comment lines and collapses whitespace, so it compares code, not formatting.)
select md5(btrim(regexp_replace(regexp_replace(regexp_replace(prosrc, E'\\r', '', 'g'), E'(^|\\n)[ \\t]*--[^\\n]*', '', 'g'), E'\\s+', ' ', 'g'))) as normalised_md5,
       length(prosrc) as raw_length
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = 'mock_score_attempt';

-- B. Contract attributes unchanged (CREATE OR REPLACE keeps owner and grants).
--    EXPECT identical to BEFORE: prosecdef true, provolatile v, proconfig {search_path=public}, owner postgres, proacl {postgres=X/postgres,service_role=X/postgres}.
select p.prosecdef, p.provolatile, p.proconfig::text, pg_get_userbyid(p.proowner) as owner, p.proacl::text, pg_get_function_identity_arguments(p.oid) as args, p.prorettype::regtype::text as returns
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = 'mock_score_attempt';

-- C. No OTHER function changed. EXPECT: functions_excluding_mock_score_attempt_hash fc1a600394751a47e5f95cfe788a284b (identical to BEFORE), function_count 56.
select count(*) as function_count,
       md5(string_agg(p.proname||'|'||md5(p.prosrc), E'\n' order by p.proname, p.oid)) filter (where p.proname <> 'mock_score_attempt') as functions_excluding_mock_score_attempt_hash
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public';

-- D. The new branch really is in the live function, and only the coordinate branch was added to the comparison chain.
--    EXPECT: has_coord_branch true, has_exact_text_branch true (preserved), has_numeric_branch true (preserved), has_manual_safety true (preserved), elsif_count 2.
select position('elsif v_coord_stored is not null then' in prosrc) > 0 as has_coord_branch,
       position('elsif lower(trim(coalesce(v_response_value, ''''))) = lower(trim(v_stored_answer)) then' in prosrc) > 0 as has_exact_text_branch,
       position('abs(v_numeric_response - v_numeric_answer) < 0.0001' in prosrc) > 0 as has_numeric_branch,
       position('v_stored_answer like ''%;%''' in prosrc) > 0 as has_manual_safety,
       (length(prosrc) - length(replace(prosrc, 'elsif ', ''))) / 6 as elsif_count
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = 'mock_score_attempt';

-- E. Which stored answers the new branch can ever apply to (the rows whose STORED answer is a coordinate pair). EXPECT these four Mock rows (plus 42 Practice rows that the Mock scorer never sees):
--    mock-fb-mr08-reflect-01 (candidate), mock-mr05-numberpyramid-02 (candidate), mock-mr08-rotation-01 (mock_eligible), mock-mr08-rotation-02 (mock_eligible).
select id, eligibility_status, prompt->>'answer' as stored_answer from ali_question_bank
 where subject = 'maths' and id like 'mock-%' and trim(prompt->>'answer') ~ '^\(\s*[+-]?[0-9]+(\.[0-9]+)?\s*,\s*[+-]?[0-9]+(\.[0-9]+)?\s*\)$' order by id;

-- F. Behaviour of the new rule (the exact expression, on literals; the scorer itself needs a submitted attempt, so it is exercised by the Founder acceptance sitting below).
--    EXPECT accepted = true for the first eleven rows and false for the rest.
with t(stored, resp) as (values ('(9, 5)','(9, 5)'),('(9, 5)','(9,5)'),('(9, 5)','( 9 , 5 )'),('(9, 5)','(9.0, 5)'),('(9, 5)',' (9,5) '),('(9, 5)','(9 ,5)'),('(7, -4)','(7,-4)'),('(7, -4)','(7,−4)'),('(-3, 6)','(-3,6)'),('(0, 0)','(0,0)'),('(2.5, 4)','(2.50,4)'),
  ('(9, 5)','9, 5'),('(9, 5)','(5, 9)'),('(9, 5)','(9, 6)'),('(9, 5)','(9, 5, 1)'),('(9, 5)','(9;5)'),('(9, 5)','(9 5)'),('(9, 5)','(9,,5)'),('(9, 5)','(nine, 5)'),('(9, 5)','(9, 5'),('(-3, 6)','(3, 6)')),
 p(pat) as (select '^\(\s*([+-]?[0-9]+(?:\.[0-9]+)?)\s*,\s*([+-]?[0-9]+(?:\.[0-9]+)?)\s*\)$')
select stored, resp, (regexp_match(trim(stored), pat) is not null and regexp_match(replace(trim(resp), chr(8722), '-'), pat) is not null
  and abs((regexp_match(replace(trim(resp), chr(8722), '-'), pat))[1]::numeric - (regexp_match(trim(stored), pat))[1]::numeric) < 0.0001
  and abs((regexp_match(replace(trim(resp), chr(8722), '-'), pat))[2]::numeric - (regexp_match(trim(stored), pat))[2]::numeric) < 0.0001) as accepted
from t, p;

-- G. Acceptance sitting (not SQL): on a Founder-created TEST learner, a test attempt containing a coordinate item answered "(9,5)" style
--    is scored correct; an answer "(5, 9)" is scored incorrect; a time answer "1550" for a stored "15:50" is still incorrect.
