-- ANGEL 11+ MIGRATION 274: POST-APPLICATION READ-ONLY VERIFICATION (supersedes 03-migration-274-verification.sql)
-- Every statement is a SELECT. Nothing here writes, calls the scorer, or creates an attempt.
-- Baselines were captured read-only from production on 2026-10-10, BEFORE 274 was applied.
-- Run each block separately in the Supabase SQL editor. Every block ends with a PASS/FAIL column named `pass` (or `verdict`).
-- Fixes vs the earlier script: block C's FILTER is attached to string_agg (the earlier form was a syntax error);
-- block F is now an emulation of the whole three-way comparison chain with BEFORE and AFTER columns, plus non-coordinate regressions.

-- ============================================================ A. function definition / hash
-- EXPECT normalised_md5 = 2315004514e2d5a20897d826b8c96519 (BEFORE was 28840b5d4a9b9e0300b040f458123676, raw length 6556)
select md5(btrim(regexp_replace(regexp_replace(regexp_replace(prosrc, E'\\r', '', 'g'), E'(^|\\n)[ \\t]*--[^\\n]*', '', 'g'), E'\\s+', ' ', 'g'))) as normalised_md5,
       length(prosrc) as raw_length,
       md5(btrim(regexp_replace(regexp_replace(regexp_replace(prosrc, E'\\r', '', 'g'), E'(^|\\n)[ \\t]*--[^\\n]*', '', 'g'), E'\\s+', ' ', 'g'))) = '2315004514e2d5a20897d826b8c96519' as pass
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public' and p.proname = 'mock_score_attempt';

-- ============================================================ B. permissions / attributes unchanged
-- EXPECT prosecdef true, provolatile v, cfg {search_path=public}, owner postgres, acl {postgres=X/postgres,service_role=X/postgres}, args p_attempt_id uuid, returns void
select p.prosecdef, p.provolatile, p.proconfig::text as cfg, pg_get_userbyid(p.proowner) as owner, p.proacl::text as acl,
       pg_get_function_identity_arguments(p.oid) as args, p.prorettype::regtype::text as returns,
       (p.prosecdef and p.provolatile = 'v' and p.proconfig::text = '{search_path=public}' and pg_get_userbyid(p.proowner) = 'postgres'
        and p.proacl::text = '{postgres=X/postgres,service_role=X/postgres}' and pg_get_function_identity_arguments(p.oid) = 'p_attempt_id uuid'
        and p.prorettype::regtype::text = 'void') as pass,
       (select count(*) from pg_proc q join pg_namespace m on m.oid = q.pronamespace where m.nspname = 'public' and q.proname = 'mock_score_attempt') = 1 as exactly_one_overload
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace
 where n.nspname = 'public' and p.proname = 'mock_score_attempt';

-- ============================================================ C. no other function changed
-- EXPECT function_count 56, others_hash fc1a600394751a47e5f95cfe788a284b
select count(*) as function_count,
       md5(string_agg(p.proname || '|' || md5(p.prosrc), E'\n' order by p.proname, p.oid) filter (where p.proname <> 'mock_score_attempt')) as others_hash,
       (count(*) = 56 and md5(string_agg(p.proname || '|' || md5(p.prosrc), E'\n' order by p.proname, p.oid) filter (where p.proname <> 'mock_score_attempt')) = 'fc1a600394751a47e5f95cfe788a284b') as pass
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public';

-- ============================================================ D. structure: new branch present, old branches preserved
-- EXPECT every column true, elsif_count 2 (BEFORE had 1)
select position('elsif v_coord_stored is not null then' in prosrc) > 0 as has_coord_branch,
       position('elsif lower(trim(coalesce(v_response_value, ''''))) = lower(trim(v_stored_answer)) then' in prosrc) > 0 as has_exact_text_branch,
       position('abs(v_numeric_response - v_numeric_answer) < 0.0001' in prosrc) > 0 as has_numeric_branch,
       position('v_stored_answer like ''%;%''' in prosrc) > 0 as has_semicolon_manual_guard,
       position('v_bank_row.marking_mode <> ''deterministic''' in prosrc) > 0 as has_marking_mode_guard,
       position('scoring_state = ''scored''' in prosrc) > 0 and position('v_current_marking_version' in prosrc) > 0 as has_idempotency,
       (length(prosrc) - length(replace(prosrc, 'elsif ', ''))) / 6 as elsif_count,
       ((length(prosrc) - length(replace(prosrc, 'elsif ', ''))) / 6 = 2
         and position('elsif v_coord_stored is not null then' in prosrc) > 0
         and position('v_stored_answer like ''%;%''' in prosrc) > 0
         and position('v_bank_row.marking_mode <> ''deterministic''' in prosrc) > 0) as pass
  from pg_proc p join pg_namespace n on n.oid = p.pronamespace where n.nspname = 'public' and p.proname = 'mock_score_attempt';

-- ============================================================ E. the only Mock rows the new branch can ever touch
-- EXPECT exactly 4 rows: mock-fb-mr08-reflect-01 (7, -4), mock-mr05-numberpyramid-02 (9, 5), mock-mr08-rotation-01 (5, -3), mock-mr08-rotation-02 (2, -6)
select id, eligibility_status, marking_mode, prompt->>'answer' as stored_answer,
       count(*) over () = 4 as pass
  from ali_question_bank
 where subject = 'maths' and id like 'mock-%'
   and trim(prompt->>'answer') ~ '^\(\s*[+-]?[0-9]+(\.[0-9]+)?\s*,\s*[+-]?[0-9]+(\.[0-9]+)?\s*\)$'
 order by id;

-- ============================================================ F. decision-chain matrix (coordinate accept / reject / non-coordinate regression)
-- Emulates the scorer's exact chain: numeric path -> coordinate branch (AFTER only) -> exact text. BEFORE column = pre-274 behaviour.
-- EXPECT: every row pass = true; summary at the bottom of this block's output is the same query grouped (see F2).
with t(n, stored, resp, exp_before, exp_after, grp) as (values
 (1,'(9, 5)','(9, 5)','correct','correct','accept'),
 (2,'(9, 5)','(9,5)','incorrect','correct','accept'),
 (3,'(9, 5)','( 9 , 5 )','incorrect','correct','accept'),
 (4,'(9, 5)','(9 ,5)','incorrect','correct','accept'),
 (5,'(9, 5)',' (9,5) ','incorrect','correct','accept'),
 (6,'(9, 5)','(9.0, 5)','incorrect','correct','accept'),
 (7,'(9, 5)','(9.00,5.0)','incorrect','correct','accept'),
 (8,'(7, -4)','(7,-4)','incorrect','correct','accept'),
 (9,'(7, -4)','(7,' || chr(8722) || '4)','incorrect','correct','accept'),
 (11,'(-3, 6)','(-3,6)','incorrect','correct','accept'),
 (12,'(-3, 6)','(' || chr(8722) || '3,6)','incorrect','correct','accept'),
 (13,'(0, 0)','(0,0)','incorrect','correct','accept'),
 (14,'(2.5, 4)','(2.50,4)','incorrect','correct','accept'),
 (15,'(5, -3)','(5,-3)','incorrect','correct','accept'),
 (16,'(2, -6)','(2,-6)','incorrect','correct','accept'),
 (17,'(7, -4)','(7, -4)','correct','correct','accept'),
 (10,'(7, -4)','(7, - 4)','incorrect','incorrect','reject'),
 (20,'(9, 5)','9, 5','incorrect','incorrect','reject'),
 (21,'(9, 5)','9,5','incorrect','incorrect','reject'),
 (22,'(9, 5)','(5, 9)','incorrect','incorrect','reject'),
 (23,'(9, 5)','(9, 6)','incorrect','incorrect','reject'),
 (24,'(9, 5)','(8, 5)','incorrect','incorrect','reject'),
 (25,'(-3, 6)','(3, 6)','incorrect','incorrect','reject'),
 (26,'(7, -4)','(7, 4)','incorrect','incorrect','reject'),
 (27,'(9, 5)','(9, 5, 1)','incorrect','incorrect','reject'),
 (28,'(9, 5)','(9;5)','incorrect','incorrect','reject'),
 (29,'(9, 5)','(9 5)','incorrect','incorrect','reject'),
 (30,'(9, 5)','(9,,5)','incorrect','incorrect','reject'),
 (31,'(9, 5)','(nine, 5)','incorrect','incorrect','reject'),
 (32,'(9, 5)','(9, 5','incorrect','incorrect','reject'),
 (33,'(9, 5)','9, 5)','incorrect','incorrect','reject'),
 (34,'(9, 5)','(9., 5)','incorrect','incorrect','reject'),
 (35,'(9, 5)','(9, 5) maybe','incorrect','incorrect','reject'),
 (36,'(9, 5)','x = 9, y = 5','incorrect','incorrect','reject'),
 (37,'(9, 5)','nine, five','incorrect','incorrect','reject'),
 (38,'(9, 5)','9','incorrect','incorrect','reject'),
 (39,'(9, 5)','((9, 5))','incorrect','incorrect','reject'),
 (40,'(9, 5)','[9, 5]','incorrect','incorrect','reject'),
 (41,'(9, 5)','(9, 5)(9, 5)','incorrect','incorrect','reject'),
 (42,'(9, 5)','(1e1, 5)','incorrect','incorrect','reject'),
 (50,'15:50','15:50','correct','correct','regression'),
 (51,'15:50','1550','incorrect','incorrect','regression'),
 (52,'15:50','3:50pm','incorrect','incorrect','regression'),
 (53,'true','TRUE','correct','correct','regression'),
 (54,'true','yes','incorrect','incorrect','regression'),
 (55,'B','b','correct','correct','regression'),
 (56,'B','(B)','incorrect','incorrect','regression'),
 (57,'2.10','2.1','correct','correct','regression'),
 (58,'2.10','£2.10','incorrect','incorrect','regression'),
 (59,'(9)','(9)','correct','correct','regression'),
 (60,'(9)','9','incorrect','incorrect','regression'),
 (61,'12','12','correct','correct','regression'),
 (62,'12','(12, 1)','incorrect','incorrect','regression'),
 (63,'12','(12,12)','incorrect','incorrect','regression'),
 (64,'8, 5','8, 5','correct','correct','regression'),
 (65,'8, 5','8,5','incorrect','incorrect','regression'),
 (66,'8, 5','(8, 5)','incorrect','incorrect','regression'),
 (67,'cat','CAT','correct','correct','regression'),
 (68,'cat','(cat)','incorrect','incorrect','regression'),
 (69,'(a, b)','(a,b)','incorrect','incorrect','regression'),
 (70,'(3, 4, 5)','(3,4,5)','incorrect','incorrect','regression'),
 (71,'(3, 4, 5)','(3, 4, 5)','correct','correct','regression'),
 (72,'3 4','3,4','incorrect','incorrect','regression'),
 (73,'-5',chr(8722) || '5','incorrect','incorrect','regression')
), p(pat) as (select '^\(\s*([+-]?[0-9]+(?:\.[0-9]+)?)\s*,\s*([+-]?[0-9]+(?:\.[0-9]+)?)\s*\)$'),
c as (select t.*, pat,
        pg_input_is_valid(t.resp, 'numeric') and pg_input_is_valid(t.stored, 'numeric') as both_numeric,
        regexp_match(trim(stored), pat) as cs,
        regexp_match(replace(trim(resp), chr(8722), '-'), pat) as cr
        from t, p),
r as (select *,
        case when both_numeric then (case when abs(resp::numeric - stored::numeric) < 0.0001 then 'correct' else 'incorrect' end)
             when lower(trim(resp)) = lower(trim(stored)) then 'correct' else 'incorrect' end as before_status,
        case when both_numeric then (case when abs(resp::numeric - stored::numeric) < 0.0001 then 'correct' else 'incorrect' end)
             when cs is not null then (case when cr is not null and abs(cr[1]::numeric - cs[1]::numeric) < 0.0001 and abs(cr[2]::numeric - cs[2]::numeric) < 0.0001 then 'correct' else 'incorrect' end)
             when lower(trim(resp)) = lower(trim(stored)) then 'correct' else 'incorrect' end as after_status
        from c)
select n, grp, stored, '[' || resp || ']' as resp, before_status, after_status, exp_before, exp_after,
       (before_status = exp_before and after_status = exp_after) as pass
  from r order by grp, n;
-- F2. Summary: re-run block F with the final select replaced by:
--   select grp, count(*) as cases, count(*) filter (where before_status = exp_before and after_status = exp_after) as passing,
--          count(*) filter (where grp = 'regression' and before_status <> after_status) as regression_changes_must_be_0 from r group by grp;
-- Expected counts: accept 16, reject 24, regression 24; all passing; regression_changes_must_be_0 = 0.

-- ============================================================ G. Mock inventory unchanged
-- EXPECT these exact (n, h) pairs (baseline 2026-10-10, before 274)
select 'bank_mock_ids' as k, count(*) as n, md5(string_agg(x::text, E'\n' order by x.id)) as h,
       (count(*) = 137 and md5(string_agg(x::text, E'\n' order by x.id)) = 'f4ca129d325dda8835993a1a3e4b4e13') as pass
  from ali_question_bank x where id like 'mock-%'
union all
select 'bank_mock_maths_rows', count(*), md5(string_agg(x::text, E'\n' order by x.id)),
       (count(*) = 118 and md5(string_agg(x::text, E'\n' order by x.id)) = '91b23aa982fd96b3d15fa116d2c500ca')
  from ali_question_bank x where subject = 'maths' and eligibility_status in ('mock_eligible','independently_validated','authentic_assessment_candidate')
union all
select 'bank_all', count(*), md5(string_agg(x::text, E'\n' order by x.id)),
       (count(*) = 1528 and md5(string_agg(x::text, E'\n' order by x.id)) = '72799f7107ea592552829e665f3843fc')
  from ali_question_bank x
union all
select 'candidates', count(*), md5(string_agg(x::text, E'\n' order by x::text)),
       (count(*) = 953 and md5(string_agg(x::text, E'\n' order by x::text)) = '1b936ef9315c6434733be0f85017fdbb')
  from ali_question_candidate x;

-- ============================================================ H. Practice inventory unchanged
-- EXPECT 1,275 practice_eligible (english 306, maths 961, writing 8), hash a1b0c03eb1ff95591fed5b91075a9904
select 'practice_eligible' as k, count(*) as n, md5(string_agg(x::text, E'\n' order by x.id)) as h,
       (count(*) = 1275 and md5(string_agg(x::text, E'\n' order by x.id)) = 'a1b0c03eb1ff95591fed5b91075a9904') as pass
  from ali_question_bank x where eligibility_status = 'practice_eligible';

-- ============================================================ I. learner evidence unchanged
-- EXPECT identical to baseline. CAVEAT: if a real learner submitted or was marked between the baseline and this run, a mismatch here is
-- legitimate new activity, not a 274 effect (274 itself writes nothing). Check max(created_at)/count before concluding anything.
select 'mock_attempt' as k, count(*) as n, md5(string_agg(x::text, E'\n' order by x::text)) as h,
       (count(*) = 14 and md5(string_agg(x::text, E'\n' order by x::text)) = 'f1428f9bc89737b375f8db00ed279c69') as pass
  from ali_mock_attempt x
union all
select 'mock_attempt_answer', count(*), md5(string_agg(x::text, E'\n' order by x::text)),
       (count(*) = 106 and md5(string_agg(x::text, E'\n' order by x::text)) = 'cbd7a37f0ac3c64474a29a2d268105c9')
  from ali_mock_attempt_answer x
union all
select 'mock_attempt_report', count(*), md5(string_agg(x::text, E'\n' order by x::text)),
       (count(*) = 9 and md5(string_agg(x::text, E'\n' order by x::text)) = '59951cd36b15ac6dc5f2184c3d2c771b')
  from ali_mock_attempt_report x
union all
select 'mock_manual_mark_audit', count(*), md5(string_agg(x::text, E'\n' order by x::text)),
       (count(*) = 11 and md5(string_agg(x::text, E'\n' order by x::text)) = 'b60f8d13b44507d659cc243eab2e6a5c')
  from ali_mock_manual_mark_audit x;

-- ============================================================ J. no Form B activation / no Mock form change
-- EXPECT exactly 3 forms, all pre-existing and active: english-full-mock-v1 (24), reading-comprehension-mock-1 (28), first-mock-mathematics-v1 (56);
-- no form id containing 'form-b' / 'formb' / 'form_b'; hash d84ef3b45ab443a364cc3c99bd711ef6
select count(*) as forms, count(*) filter (where active) as active_forms,
       count(*) filter (where lower(id) ~ 'form[-_ ]?b') as form_b_forms,
       md5(string_agg(x::text, E'\n' order by x.id)) as h,
       (count(*) = 3 and count(*) filter (where active) = 3 and count(*) filter (where lower(id) ~ 'form[-_ ]?b') = 0
        and md5(string_agg(x::text, E'\n' order by x.id)) = 'd84ef3b45ab443a364cc3c99bd711ef6') as pass
  from ali_mock_form x;
-- Sealed English Form B passage rows remain inactive (EXPECT inactive english authentic_assessment_candidate = 11):
select count(*) as inactive_english_candidates, count(*) = 11 as pass
  from ali_question_bank where subject = 'english' and eligibility_status = 'authentic_assessment_candidate' and not active;
