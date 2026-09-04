-- Angel Digital 11+ — Post-Migration Live Verification, Single Summary
-- Table (READ-ONLY). Covers migrations 169-180. Every statement below is
-- a SELECT only -- no INSERT, UPDATE, DELETE, or DDL anywhere.

with
math_ids as (
  select unnest(array[
    'mock-mr11-impossibletotal-01','mock-mr11-impossibletotal-02','mock-mr11-impossibletotal-03',
    'mock-mr05-numberpyramid-01','mock-mr05-numberpyramid-02','mock-mr05-numberpyramid-03',
    'mock-mr13-toppingcombos-01','mock-mr13-toppingcombos-02',
    'mock-mr06-agenarrative-01','mock-mr06-agenarrative-02','mock-mr06-agenarrative-03',
    'mock-mr12-weightedmean-01','mock-mr12-weightedmean-02'
  ]) as id
),
reading_new_ids as (
  select unnest(array[
    'w1-kitemaker-08','w1-kitemaker-09','w1-lastbus-08','w1-lastbus-09',
    'w1-newgirl-08','w1-newgirl-09','w1-atticdoor-08','w1-atticdoor-09',
    'w1-raceday-08','w1-raceday-09','w1-letter-08','w1-letter-09',
    'w3-rc01-emptyclassroom-01','w3-rc08-emptyclassroom-01',
    'w3-rc01-bakersapprentice-01','w3-rc07-bakersapprentice-01',
    'w3-rc01-lettertograndad-01','w3-rc06-lettertograndad-01',
    'w3-rc01-stormharbour-01','w3-rc08-stormharbour-01',
    'w3-rc01-newtrainers-01','w3-rc07-newtrainers-01'
  ]) as id
),
tick_justify_ids as (
  select unnest(array[
    'w1-atticdoor-04','w1-kitemaker-04','w1-lastbus-04','w1-letter-04','w1-newgirl-04',
    'w2-lastslice-05','w2-morningpatrol-07','w2-pianorecital-04','w2-sciencefair-04',
    'w2-twoletters-04','w2-understudy-05'
  ]) as id
),
writing_ids as (
  select unnest(array['eng-inc003-writing-favouriteplace-01','eng-inc003-writing-pocketmoney-01']) as id
),
mocktrack_ids as (
  select unnest(array[
    'mock-eng-boathouse','eng-inc001-understudy','eng-inc001-bee-navigation',
    'eng-inc002-roboticsfinal','eng-inc002-sailandsteam',
    'eng-inc003-peppersbreakfast','eng-inc003-compassrosechallenge','eng-inc003-salmonnavigation'
  ]) as id
),

c1 as (
  select count(*) as total,
         count(*) filter (where q.eligibility_status = 'authentic_assessment_candidate' and q.active = true) as safe
  from math_ids m join public.ali_question_bank q on q.id = m.id
),
c2 as (
  select count(*) as leaks from public.ali_mock_form
  where question_manifest::text like '%mock-mr11-impossibletotal%'
     or question_manifest::text like '%mock-mr05-numberpyramid%'
     or question_manifest::text like '%mock-mr13-toppingcombos%'
     or question_manifest::text like '%mock-mr06-agenarrative%'
     or question_manifest::text like '%mock-mr12-weightedmean%'
),
c3 as (
  select count(*) as total from reading_new_ids r join public.ali_question_bank q on q.id = r.id
),
c4 as (
  select count(*) as total,
         count(*) filter (where q.eligibility_status != 'practice_eligible') as safe
  from tick_justify_ids t join public.ali_question_bank q on q.id = t.id
),
c5 as (
  select count(*) as total,
         count(*) filter (where q.eligibility_status = 'provisional') as provisional_count,
         count(*) filter (where q.eligibility_status = 'practice_eligible') as leaked
  from reading_new_ids r join public.ali_question_bank q on q.id = r.id
),
c6 as (
  select count(*) as total,
         count(*) filter (where q.eligibility_status = 'authentic_assessment_candidate') as safe
  from writing_ids w join public.ali_question_bank q on q.id = w.id
),
c7 as (
  select
    (prompt::text like '%for-and-against debate%') as has_new,
    (prompt::text like '%Support your view with your own experience or something you have genuinely noticed, not a generic list of reasons%') as has_old
  from public.ali_question_bank where id = 'eng-inc003-writing-pocketmoney-01'
),
c8 as (
  select
    count(*) filter (where notes like '%MOCK-STRUCTURAL-CAPACITY-INCREMENT007%') as inc007,
    count(*) filter (where notes like '%MOCK-STRUCTURAL-CAPACITY-INCREMENT008%') as inc008,
    count(*) filter (where notes like '%MOCK-STRUCTURAL-CAPACITY-INCREMENT009%') as inc009,
    count(*) filter (where notes like '%WRITING-DEPTH-EXTENSION-DECISION259%') as writing,
    count(*) filter (where notes like '%READING-REMEDIATION-WAVE1%') as wave1,
    count(*) filter (where notes like '%READING-REMEDIATION-WAVE3%') as wave3
  from public.ali_family_review
  where notes like '%MOCK-STRUCTURAL-CAPACITY-INCREMENT007%'
     or notes like '%MOCK-STRUCTURAL-CAPACITY-INCREMENT008%'
     or notes like '%MOCK-STRUCTURAL-CAPACITY-INCREMENT009%'
     or notes like '%WRITING-DEPTH-EXTENSION-DECISION259%'
     or notes like '%READING-REMEDIATION-WAVE1%'
     or notes like '%READING-REMEDIATION-WAVE3%'
),
c9 as (
  select
    count(*) as total,
    count(*) filter (where p.eligibility_status = 'independently_validated') as validated,
    count(*) filter (where p.eligibility_status = 'authentic_assessment_candidate') as candidate
  from mocktrack_ids m join public.ali_passage_bank p on p.id = m.id
),
c10 as (
  select count(*) as leaked
  from public.ali_question_bank
  where id in (
    select id from math_ids
    union select id from reading_new_ids
    union select id from writing_ids
  )
  and eligibility_status in ('practice_eligible','mock_eligible')
)

select * from (
  select 1 as ord, '1. Mathematics: 13 questions present & safely eligible' as check_name,
    '13 present, 13 safe' as expected,
    concat(c1.total, ' present, ', c1.safe, ' safe') as actual,
    case when c1.total = 13 and c1.safe = 13 then 'PASS' else 'FAIL' end as status
  from c1
  union all
  select 2, '2. Mathematics: zero Mock-form leakage', '0', c2.leaks::text,
    case when c2.leaks = 0 then 'PASS' else 'FAIL' end
  from c2
  union all
  select 3, '3. Reading: 22 remediation questions present', '22', c3.total::text,
    case when c3.total = 22 then 'PASS' else 'FAIL' end
  from c3
  union all
  select 4, '4. Reading: 11 tick-justify rows remain non-Practice', '11 present, 11 safe',
    concat(c4.total, ' present, ', c4.safe, ' safe'),
    case when c4.total = 11 and c4.safe = 11 then 'PASS' else 'FAIL' end
  from c4
  union all
  select 5, '5. Reading: remediation eligibility safe (all provisional)', '22 provisional, 0 leaked',
    concat(c5.provisional_count, ' provisional, ', c5.leaked, ' leaked'),
    case when c5.provisional_count = 22 and c5.leaked = 0 then 'PASS' else 'FAIL' end
  from c5
  union all
  select 6, '6. Writing: 2 candidates present & safely eligible', '2 present, 2 safe',
    concat(c6.total, ' present, ', c6.safe, ' safe'),
    case when c6.total = 2 and c6.safe = 2 then 'PASS' else 'FAIL' end
  from c6
  union all
  select 7, '7. Writing: Pocket Money correction applied', 'has_new=true, has_old=false',
    concat('has_new=', c7.has_new, ', has_old=', c7.has_old),
    case when c7.has_new = true and c7.has_old = false then 'PASS' else 'FAIL' end
  from c7
  union all
  select 8, '8. Review registrations: 19 total, correct per-marker counts',
    'inc007=1,inc008=3,inc009=2,writing=2,wave1=6,wave3=5 (total 19)',
    concat('inc007=', c8.inc007, ',inc008=', c8.inc008, ',inc009=', c8.inc009,
           ',writing=', c8.writing, ',wave1=', c8.wave1, ',wave3=', c8.wave3,
           ' (total ', c8.inc007 + c8.inc008 + c8.inc009 + c8.writing + c8.wave1 + c8.wave3, ')'),
    case when c8.inc007 = 1 and c8.inc008 = 3 and c8.inc009 = 2
              and c8.writing = 2 and c8.wave1 = 6 and c8.wave3 = 5
         then 'PASS' else 'FAIL' end
  from c8
  union all
  select 9, '9. Mock-track: 8 passages retain expected states', '8 total, 5 validated, 3 candidate',
    concat(c9.total, ' total, ', c9.validated, ' validated, ', c9.candidate, ' candidate'),
    case when c9.total = 8 and c9.validated = 5 and c9.candidate = 3 then 'PASS' else 'FAIL' end
  from c9
  union all
  select 10, '10. Zero new rows at practice_eligible/mock_eligible', '0', c10.leaked::text,
    case when c10.leaked = 0 then 'PASS' else 'FAIL' end
  from c10
) results
order by ord;
