-- ============================================================
-- Angel 11+ — Increment 016 Read-Only Production Verification Pack
-- ============================================================
-- Purpose: verify the post-state of migrations 206/208/209/210/213/214/
-- 215/212 without altering anything. Every statement below is a plain
-- SELECT or a read-only catalog/definition lookup (pg_get_functiondef,
-- pg_get_viewdef, pg_get_triggerdef) -- none of these execute or mutate
-- the objects they inspect. There is no INSERT, UPDATE, DELETE, or DDL
-- anywhere in this script.
--
-- Run this whole script in Supabase Dashboard > SQL Editor as one
-- execution. Each section is labelled with a `section` column in its
-- own result so the results are self-identifying even if your SQL
-- Editor concatenates them. Paste the full output back.
-- ============================================================


-- ============================================================
-- A. READING ELIGIBILITY — the five intended passages' rows, plus a
--    negative check that nothing else was promoted.
-- ============================================================
select
  'A1_reading_question_rows' as section,
  id, learning_unit_id, eligibility_status
from public.ali_question_bank
where id like 'mock-eng-boathouse-q%'
   or id like 'eng-inc001-understudy-q%'
   or id like 'eng-inc001-bee-q%'
   or id like 'eng-inc002-roboticsfinal-q%'
   or id like 'eng-inc002-sailandsteam-q%'
order by id;

select
  'A2_reading_passage_rows' as section,
  id, eligibility_status
from public.ali_passage_bank
where id in (
  'mock-eng-boathouse', 'eng-inc001-understudy', 'eng-inc001-bee-navigation',
  'eng-inc002-roboticsfinal', 'eng-inc002-sailandsteam'
)
order by id;

-- Negative check: any OTHER English/Reading/Writing row that changed to
-- mock_eligible outside the five approved passages + confirms no stray
-- promotion. Empty result is the expected, correct outcome.
select
  'A3_unexpected_mock_eligible_english_rows' as section,
  id, subject, learning_unit_id, eligibility_status
from public.ali_question_bank
where subject = 'english'
  and eligibility_status = 'mock_eligible'
  and id not like 'mock-eng-boathouse-q%'
  and id not like 'eng-inc001-understudy-q%'
  and id not like 'eng-inc001-bee-q%'
  and id not like 'eng-inc002-roboticsfinal-q%'
  and id not like 'eng-inc002-sailandsteam-q%';


-- ============================================================
-- B. READING COMPREHENSION MOCK 1 FORM
-- ============================================================
select
  'B1_reading_mock_1_form' as section,
  id, subject, attempt_type, active, specification_version,
  jsonb_array_length(question_manifest) as question_count,
  composition_provenance ->> 'displayName' as display_name,
  composition_provenance ->> 'totalMarks' as total_marks,
  composition_provenance -> 'passageOrder' as passage_order,
  composition_provenance -> 'reservedNotIncluded' as reserved_not_included,
  composition_provenance -> 'difficultyDistribution' as difficulty_distribution,
  composition_provenance -> 'skillDistribution' as skill_distribution
from public.ali_mock_form
where id = 'reading-comprehension-mock-1';

-- Full manifest, so you can visually confirm exactly 28 rows and exactly
-- the 3 intended passage prefixes, nothing else.
select
  'B2_reading_mock_1_manifest' as section,
  elem ->> 'question_id' as question_id
from public.ali_mock_form, jsonb_array_elements(question_manifest) as elem
where id = 'reading-comprehension-mock-1'
order by 2;

-- Marks total, computed live from the actual question rows the manifest
-- references (not just trusted from composition_provenance).
select
  'B3_reading_mock_1_live_marks_total' as section,
  sum((q.prompt ->> 'marks')::int) as live_computed_total_marks,
  count(*) as rows_found
from public.ali_mock_form f
join lateral jsonb_array_elements(f.question_manifest) elem on true
join public.ali_question_bank q on q.id = elem ->> 'question_id'
where f.id = 'reading-comprehension-mock-1';


-- ============================================================
-- C. RESERVE — Loose Connection and Sail and Steam
-- ============================================================
select
  'C1_reserve_passage_rows' as section,
  id, eligibility_status
from public.ali_passage_bank
where id in ('eng-inc002-roboticsfinal', 'eng-inc002-sailandsteam');

select
  'C2_reserve_question_rows' as section,
  id, eligibility_status
from public.ali_question_bank
where id like 'eng-inc002-roboticsfinal-q%'
   or id like 'eng-inc002-sailandsteam-q%'
order by id;

-- Confirm neither reserve passage appears in ANY ali_mock_form manifest
-- anywhere (not just Reading Comprehension Mock 1). Empty is correct.
select
  'C3_reserve_in_any_form_manifest' as section,
  f.id as form_id, elem ->> 'question_id' as question_id
from public.ali_mock_form f, jsonb_array_elements(f.question_manifest) elem
where elem ->> 'question_id' like 'eng-inc002-roboticsfinal-q%'
   or elem ->> 'question_id' like 'eng-inc002-sailandsteam-q%';


-- ============================================================
-- D. WRITING — mock-writing-screentime-01
-- ============================================================
select
  'D1_screentime_status' as section,
  id, eligibility_status
from public.ali_question_bank
where id = 'mock-writing-screentime-01';

-- Confirm it appears in no form manifest anywhere.
select
  'D2_screentime_in_any_form_manifest' as section,
  f.id as form_id, elem ->> 'question_id' as question_id
from public.ali_mock_form f, jsonb_array_elements(f.question_manifest) elem
where elem ->> 'question_id' = 'mock-writing-screentime-01';


-- ============================================================
-- E. MATHEMATICS MOCK 1 — unchanged, no Reading content
-- ============================================================
select
  'E1_mathematics_mock_1_form' as section,
  id, subject, attempt_type, active, specification_version,
  jsonb_array_length(question_manifest) as question_count,
  composition_provenance ->> 'displayName' as display_name,
  composition_provenance ->> 'totalMarks' as total_marks
from public.ali_mock_form
where id = 'mathematics-mock-1';

-- Confirm no manifest entry is a Reading/English id.
select
  'E2_mathematics_mock_1_non_math_manifest_entries' as section,
  elem ->> 'question_id' as question_id
from public.ali_mock_form, jsonb_array_elements(question_manifest) as elem
where id = 'mathematics-mock-1'
  and (elem ->> 'question_id') not like 'mock-mr%';


-- ============================================================
-- F. FIREWALL OBJECTS — existence + actual live definitions, so you can
--    see the corrected 209 logic is what is really installed, not the
--    original, superseded 208 practice-block body.
-- ============================================================
select
  'F1_views_exist' as section,
  table_name as object_name
from information_schema.views
where table_schema = 'public'
  and table_name in (
    'ali_mock_retired_question_ids', 'ali_mock_retired_passage_ids',
    'ali_mock_exposed_question_ids', 'ali_mock_exposed_passage_ids'
  )
order by 2;

select
  'F2_functions_exist' as section,
  proname as object_name
from pg_proc
where pronamespace = 'public'::regnamespace
  and proname in (
    'ali_block_exposed_content_practice_promotion',
    'ali_block_mock_form_content_reuse',
    'ali_block_exposed_form_manifest_mutation'
  )
order by 2;

select
  'F3_triggers_exist' as section,
  tgname as trigger_name, relname as table_name
from pg_trigger t
join pg_class c on c.oid = t.tgrelid
where not t.tgisinternal
  and tgname in (
    'ali_question_bank_block_exposed_practice_promotion',
    'ali_mock_form_block_content_reuse',
    'ali_mock_form_block_exposed_manifest_mutation'
  )
order by 2;

-- The actual, live definition of the practice-block function -- must
-- reference ali_mock_exposed_question_ids/ali_mock_exposed_passage_ids
-- (the corrected, narrower 209 logic), NOT ali_mock_retired_* (208's
-- original, superseded, over-broad logic).
select
  'F4_practice_block_function_live_definition' as section,
  pg_get_functiondef('public.ali_block_exposed_content_practice_promotion()'::regprocedure) as definition;

select
  'F5_form_manifest_immutability_function_live_definition' as section,
  pg_get_functiondef('public.ali_block_exposed_form_manifest_mutation()'::regprocedure) as definition;

select
  'F6_exposed_question_view_live_definition' as section,
  pg_get_viewdef('public.ali_mock_exposed_question_ids'::regclass, true) as definition;


-- ============================================================
-- G. ANALYSIS FUNCTION — subject-aware, not hardcoded 'mathematics'
-- ============================================================
select
  'G1_mock_analyse_attempt_live_definition' as section,
  pg_get_functiondef('public.mock_analyse_attempt(uuid)'::regprocedure) as definition;

-- Quick pass/fail signal you can read without scanning the whole body:
-- expect TRUE for both.
select
  'G2_mock_analyse_attempt_quick_check' as section,
  pg_get_functiondef('public.mock_analyse_attempt(uuid)'::regprocedure) like '%v_is_english_attempt%' as contains_subject_aware_logic,
  pg_get_functiondef('public.mock_analyse_attempt(uuid)'::regprocedure) like '%QT-RC-%' as contains_reading_prefix_check;


-- ============================================================
-- H. ACTIVE-FORM RPC — displayName support, WITHOUT activating Reading
-- ============================================================
select
  'H1_mock_get_active_form_live_definition' as section,
  pg_get_functiondef('public.mock_get_active_form(text)'::regprocedure) as definition;

-- Quick pass/fail: expect TRUE.
select
  'H2_mock_get_active_form_quick_check' as section,
  pg_get_functiondef('public.mock_get_active_form(text)'::regprocedure) like '%displayName%' as returns_display_name;

-- Confirms Reading Comprehension Mock 1 is NOT returned by the active-
-- form lookup (because active=false) -- proves the RPC cannot currently
-- expose it to any learner, without activating anything.
select
  'H3_active_form_lookup_for_timed_section' as section,
  *
from public.mock_get_active_form('timed_section');
