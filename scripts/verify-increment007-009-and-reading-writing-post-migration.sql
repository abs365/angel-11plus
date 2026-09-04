-- Angel Digital 11+ — Post-Migration Live Verification (READ-ONLY)
-- Covers migrations 169-180 (Mathematics Increments 007-009, Reading
-- Wave 1/3 Remediation, Writing Depth Extension). Run in Supabase
-- Dashboard > SQL Editor. Every statement below is a SELECT only --
-- no INSERT, UPDATE, DELETE, or DDL anywhere in this file.

-- ============================================================
-- 1. MATHEMATICS — 6 families, 13 questions, eligibility/exposure state
-- ============================================================
select
  '1. MATHEMATICS' as section,
  id, family_id, eligibility_status, active, content_version,
  (prompt->>'marks') as marks
from public.ali_question_bank
where id in (
  'mock-mr11-impossibletotal-01','mock-mr11-impossibletotal-02','mock-mr11-impossibletotal-03',
  'mock-mr05-numberpyramid-01','mock-mr05-numberpyramid-02','mock-mr05-numberpyramid-03',
  'mock-mr13-toppingcombos-01','mock-mr13-toppingcombos-02',
  'mock-mr06-agenarrative-01','mock-mr06-agenarrative-02','mock-mr06-agenarrative-03',
  'mock-mr12-weightedmean-01','mock-mr12-weightedmean-02'
)
order by id;
-- EXPECT: exactly 13 rows. eligibility_status = 'authentic_assessment_candidate'
-- for every row (NOT 'practice_eligible', NOT 'mock_eligible'). active = true.

select
  '1b. MATHEMATICS -- count and eligibility-state summary' as section,
  eligibility_status, count(*) as row_count
from public.ali_question_bank
where family_id in (
  'mock-mr11-impossibletotal','mock-mr05-numberpyramid','mock-mr13-toppingcombos',
  'mock-mr06-agenarrative','mock-mr12-weightedmeancombine','mock-mr12-weightedmeanreverse'
)
group by eligibility_status;
-- EXPECT: one row, eligibility_status='authentic_assessment_candidate', row_count=13.
-- Any row here with eligibility_status IN ('practice_eligible','mock_eligible') is a defect.

select
  '1c. MATHEMATICS -- confirm zero Mock-form leakage' as section,
  count(*) as mock_form_rows_referencing_these_ids
from public.ali_mock_form
where question_manifest::text like '%mock-mr11-impossibletotal%'
   or question_manifest::text like '%mock-mr05-numberpyramid%'
   or question_manifest::text like '%mock-mr13-toppingcombos%'
   or question_manifest::text like '%mock-mr06-agenarrative%'
   or question_manifest::text like '%mock-mr12-weightedmean%';
-- EXPECT: 0.

-- ============================================================
-- 2. READING REMEDIATION — 22 companion questions, correct attachment,
--    tick-justify still excluded, nothing became Practice-visible
-- ============================================================
select
  '2. READING -- new companion questions' as section,
  id, learning_unit_id, family_id, eligibility_status, active
from public.ali_question_bank
where id in (
  'w1-kitemaker-08','w1-kitemaker-09','w1-lastbus-08','w1-lastbus-09',
  'w1-newgirl-08','w1-newgirl-09','w1-atticdoor-08','w1-atticdoor-09',
  'w1-raceday-08','w1-raceday-09','w1-letter-08','w1-letter-09',
  'w3-rc01-emptyclassroom-01','w3-rc08-emptyclassroom-01',
  'w3-rc01-bakersapprentice-01','w3-rc07-bakersapprentice-01',
  'w3-rc01-lettertograndad-01','w3-rc06-lettertograndad-01',
  'w3-rc01-stormharbour-01','w3-rc08-stormharbour-01',
  'w3-rc01-newtrainers-01','w3-rc07-newtrainers-01'
)
order by id;
-- EXPECT: exactly 22 rows. eligibility_status = 'provisional' for every row
-- (matching each wave's own original convention -- NOT 'practice_eligible').
-- learning_unit_id must match the intended passage id for each
-- (e.g. w1-kitemaker-08/09 -> learning_unit_id = 'wave1-eng-kitemaker').

select
  '2b. READING -- tick-justify rows remain excluded (must stay non-practice_eligible)' as section,
  id, eligibility_status, active
from public.ali_question_bank
where id in (
  'w1-atticdoor-04','w1-kitemaker-04','w1-lastbus-04','w1-letter-04','w1-newgirl-04',
  'w2-lastslice-05','w2-morningpatrol-07','w2-pianorecital-04','w2-sciencefair-04',
  'w2-twoletters-04','w2-understudy-05'
)
order by id;
-- EXPECT: exactly 11 rows, NONE with eligibility_status = 'practice_eligible'.
-- These must be unchanged by this migration batch -- flag any row here that
-- shows practice_eligible as a serious, unrelated pre-existing or new defect.

select
  '2c. READING -- new-question eligibility summary (must show zero practice_eligible)' as section,
  eligibility_status, count(*) as row_count
from public.ali_question_bank
where id like 'w1-%-08' or id like 'w1-%-09' or id like 'w3-rc0%-01'
group by eligibility_status;
-- EXPECT: only 'provisional' appears here. If 'practice_eligible' appears,
-- something outside this migration batch promoted these rows -- report exactly.

-- ============================================================
-- 3. WRITING — both candidates, corrected checklist, registration, eligibility
-- ============================================================
select
  '3. WRITING -- both candidates' as section,
  id, family_id, eligibility_status, active,
  (prompt->>'title') as title
from public.ali_question_bank
where id in ('eng-inc003-writing-favouriteplace-01','eng-inc003-writing-pocketmoney-01')
order by id;
-- EXPECT: 2 rows, eligibility_status = 'authentic_assessment_candidate' for both
-- (NOT 'practice_eligible').

select
  '3b. WRITING -- Pocket Money checklist correction confirmation' as section,
  id,
  (prompt->'checklist') as full_checklist,
  (prompt::text like '%for-and-against debate%') as has_corrected_text,
  (prompt::text like '%Support your view with your own experience or something you have genuinely noticed, not a generic list of reasons%') as still_has_old_text
from public.ali_question_bank
where id = 'eng-inc003-writing-pocketmoney-01';
-- EXPECT: has_corrected_text = true, still_has_old_text = false.
-- If still_has_old_text = true, migration 173 did not actually apply to this row.

-- ============================================================
-- 4. REVIEW REGISTRATIONS — prove live existence of all 6 new markers
-- ============================================================
select
  '4. REVIEW REGISTRATIONS' as section,
  family_id, review_target_type, review_type, decision, reviewer, created_at,
  case
    when notes like '%MOCK-STRUCTURAL-CAPACITY-INCREMENT007%' then 'INCREMENT007'
    when notes like '%MOCK-STRUCTURAL-CAPACITY-INCREMENT008%' then 'INCREMENT008'
    when notes like '%MOCK-STRUCTURAL-CAPACITY-INCREMENT009%' then 'INCREMENT009'
    when notes like '%WRITING-DEPTH-EXTENSION-DECISION259%' then 'WRITING-DEPTH-EXTENSION'
    when notes like '%READING-REMEDIATION-WAVE1%' then 'READING-REMEDIATION-WAVE1'
    when notes like '%READING-REMEDIATION-WAVE3%' then 'READING-REMEDIATION-WAVE3'
    else 'OTHER'
  end as marker_matched
from public.ali_family_review
where notes like '%MOCK-STRUCTURAL-CAPACITY-INCREMENT007%'
   or notes like '%MOCK-STRUCTURAL-CAPACITY-INCREMENT008%'
   or notes like '%MOCK-STRUCTURAL-CAPACITY-INCREMENT009%'
   or notes like '%WRITING-DEPTH-EXTENSION-DECISION259%'
   or notes like '%READING-REMEDIATION-WAVE1%'
   or notes like '%READING-REMEDIATION-WAVE3%'
order by marker_matched, family_id;
-- EXPECT: 6 (Math families) + 2 (Writing prompts) + 11 (Reading passages) = 19 rows.
-- Every row: decision = 'pending_independent_review', reviewer = 'UNASSIGNED'.

select
  '4b. REVIEW REGISTRATIONS -- count per marker (must all be present)' as section,
  case
    when notes like '%MOCK-STRUCTURAL-CAPACITY-INCREMENT007%' then 'INCREMENT007 (expect 1)'
    when notes like '%MOCK-STRUCTURAL-CAPACITY-INCREMENT008%' then 'INCREMENT008 (expect 3)'
    when notes like '%MOCK-STRUCTURAL-CAPACITY-INCREMENT009%' then 'INCREMENT009 (expect 2)'
    when notes like '%WRITING-DEPTH-EXTENSION-DECISION259%' then 'WRITING-DEPTH-EXTENSION (expect 2)'
    when notes like '%READING-REMEDIATION-WAVE1%' then 'READING-REMEDIATION-WAVE1 (expect 6)'
    when notes like '%READING-REMEDIATION-WAVE3%' then 'READING-REMEDIATION-WAVE3 (expect 5)'
  end as marker,
  count(*) as actual_count
from public.ali_family_review
where notes like '%MOCK-STRUCTURAL-CAPACITY-INCREMENT007%'
   or notes like '%MOCK-STRUCTURAL-CAPACITY-INCREMENT008%'
   or notes like '%MOCK-STRUCTURAL-CAPACITY-INCREMENT009%'
   or notes like '%WRITING-DEPTH-EXTENSION-DECISION259%'
   or notes like '%READING-REMEDIATION-WAVE1%'
   or notes like '%READING-REMEDIATION-WAVE3%'
group by marker
order by marker;

-- ============================================================
-- 5. ASSESSMENT ISOLATION — Mock-track and Increment 003 unchanged
-- ============================================================
select
  '5. ASSESSMENT ISOLATION -- Mock-track passage eligibility (must be unchanged)' as section,
  id, title, eligibility_status
from public.ali_passage_bank
where id in (
  'mock-eng-boathouse','eng-inc001-understudy','eng-inc001-bee-navigation',
  'eng-inc002-roboticsfinal','eng-inc002-sailandsteam',
  'eng-inc003-peppersbreakfast','eng-inc003-compassrosechallenge','eng-inc003-salmonnavigation'
)
order by id;
-- EXPECT: 8 rows. The 5 eng-inc001/002/mock-eng-boathouse rows =
-- 'independently_validated'. The 3 eng-inc003 rows = 'authentic_assessment_candidate'.
-- None should show 'practice_eligible' or 'mock_eligible' -- any that do is a
-- serious defect unrelated to what this migration batch was authorised to touch.

select
  '5b. ASSESSMENT ISOLATION -- no unexpected eligibility_status change on any table this session touched' as section,
  count(*) as unexpected_practice_or_mock_eligible_rows
from public.ali_question_bank
where id in (
  'mock-mr11-impossibletotal-01','mock-mr11-impossibletotal-02','mock-mr11-impossibletotal-03',
  'mock-mr05-numberpyramid-01','mock-mr05-numberpyramid-02','mock-mr05-numberpyramid-03',
  'mock-mr13-toppingcombos-01','mock-mr13-toppingcombos-02',
  'mock-mr06-agenarrative-01','mock-mr06-agenarrative-02','mock-mr06-agenarrative-03',
  'mock-mr12-weightedmean-01','mock-mr12-weightedmean-02',
  'w1-kitemaker-08','w1-kitemaker-09','w1-lastbus-08','w1-lastbus-09',
  'w1-newgirl-08','w1-newgirl-09','w1-atticdoor-08','w1-atticdoor-09',
  'w1-raceday-08','w1-raceday-09','w1-letter-08','w1-letter-09',
  'w3-rc01-emptyclassroom-01','w3-rc08-emptyclassroom-01',
  'w3-rc01-bakersapprentice-01','w3-rc07-bakersapprentice-01',
  'w3-rc01-lettertograndad-01','w3-rc06-lettertograndad-01',
  'w3-rc01-stormharbour-01','w3-rc08-stormharbour-01',
  'w3-rc01-newtrainers-01','w3-rc07-newtrainers-01',
  'eng-inc003-writing-favouriteplace-01','eng-inc003-writing-pocketmoney-01'
)
and eligibility_status in ('practice_eligible','mock_eligible');
-- EXPECT: 0. This is the single most important number in the whole script --
-- if it is anything other than 0, STOP and report exactly which id(s).
