-- Angel Digital 11+ — Final Review Closure Summary (READ-ONLY, single
-- result table). SELECT only. No migration, no UPDATE, no correction.

with target_markers as (
  select id, marker, review_type from (values
    ('mock-mr11-impossibletotal', 'MOCK-STRUCTURAL-CAPACITY-INCREMENT007', 'mock_maths_independent_review'),
    ('mock-mr05-numberpyramid', 'MOCK-STRUCTURAL-CAPACITY-INCREMENT008', 'mock_maths_independent_review'),
    ('mock-mr13-toppingcombos', 'MOCK-STRUCTURAL-CAPACITY-INCREMENT008', 'mock_maths_independent_review'),
    ('mock-mr06-agenarrative', 'MOCK-STRUCTURAL-CAPACITY-INCREMENT008', 'mock_maths_independent_review'),
    ('mock-mr12-weightedmeancombine', 'MOCK-STRUCTURAL-CAPACITY-INCREMENT009', 'mock_maths_independent_review'),
    ('mock-mr12-weightedmeanreverse', 'MOCK-STRUCTURAL-CAPACITY-INCREMENT009', 'mock_maths_independent_review'),
    ('eng-inc003-writing-wc01a-favouriteplace', 'WRITING-DEPTH-EXTENSION-DECISION259', 'mock_writing_prompt_independent_review'),
    ('eng-inc003-writing-wc01a-pocketmoney', 'WRITING-DEPTH-EXTENSION-DECISION259', 'mock_writing_prompt_independent_review'),
    ('wave1-eng-kitemaker', 'READING-REMEDIATION-WAVE1', 'mock_english_passage_independent_review'),
    ('wave1-eng-lastbus', 'READING-REMEDIATION-WAVE1', 'mock_english_passage_independent_review'),
    ('wave1-eng-newgirl', 'READING-REMEDIATION-WAVE1', 'mock_english_passage_independent_review'),
    ('wave1-eng-atticdoor', 'READING-REMEDIATION-WAVE1', 'mock_english_passage_independent_review'),
    ('wave1-eng-raceday', 'READING-REMEDIATION-WAVE1', 'mock_english_passage_independent_review'),
    ('wave1-eng-lettertonana', 'READING-REMEDIATION-WAVE1', 'mock_english_passage_independent_review'),
    ('wave3-eng-emptyclassroom', 'READING-REMEDIATION-WAVE3', 'mock_english_passage_independent_review'),
    ('wave3-eng-bakersapprentice', 'READING-REMEDIATION-WAVE3', 'mock_english_passage_independent_review'),
    ('wave3-eng-lettertograndad', 'READING-REMEDIATION-WAVE3', 'mock_english_passage_independent_review'),
    ('wave3-eng-stormharbour', 'READING-REMEDIATION-WAVE3', 'mock_english_passage_independent_review'),
    ('wave3-eng-newtrainers', 'READING-REMEDIATION-WAVE3', 'mock_english_passage_independent_review')
  ) as t(id, marker, review_type)
),
latest_per_target as (
  select tm.id, tm.marker, tm.review_type,
    latest.decision, latest.reviewer, latest.created_at
  from target_markers tm
  cross join lateral (
    select decision, reviewer, created_at
    from public.ali_family_review r
    where r.family_id = tm.id and r.decision <> 'pending_independent_review'
    order by created_at desc
    limit 1
  ) latest
),
pending_check as (
  select tm.id,
    exists (select 1 from public.ali_family_review p
            where p.family_id = tm.id and p.decision = 'pending_independent_review') as has_pending_history
  from target_markers tm
)

select * from (

  select 1 as ord, '1. Targets with a real (non-pending) decision' as check_name,
    '19' as expected, count(*)::text as actual,
    case when count(*) = 19 then 'PASS' else 'FAIL' end as status
  from latest_per_target

  union all
  select 2, '2. Decision totals: Approved',
    '19', count(*) filter (where decision = 'approved')::text,
    case when count(*) filter (where decision = 'approved') = 19 then 'PASS' else 'FAIL' end
  from latest_per_target

  union all
  select 3, '3. Decision totals: Approved with amendment',
    '0', count(*) filter (where decision = 'approved_with_amendment')::text,
    case when count(*) filter (where decision = 'approved_with_amendment') = 0 then 'PASS' else 'FAIL' end
  from latest_per_target

  union all
  select 4, '4. Decision totals: Requires revalidation',
    '0', count(*) filter (where decision = 'requires_revalidation')::text,
    case when count(*) filter (where decision = 'requires_revalidation') = 0 then 'PASS' else 'FAIL' end
  from latest_per_target

  union all
  select 5, '5. Decision totals: Rejected',
    '0', count(*) filter (where decision = 'rejected')::text,
    case when count(*) filter (where decision = 'rejected') = 0 then 'PASS' else 'FAIL' end
  from latest_per_target

  union all
  select 6, '6. Outstanding (no real decision at all)',
    '0', (19 - count(*))::text,
    case when (19 - count(*)) = 0 then 'PASS' else 'FAIL' end
  from latest_per_target

  union all
  select 7, '7. Pending-registration history preserved for all 19',
    '19', count(*) filter (where has_pending_history)::text,
    case when count(*) filter (where has_pending_history) = 19 then 'PASS' else 'FAIL' end
  from pending_check

  union all
  select 8, '8. Review-type distribution: Mathematics',
    '6', count(*)::text,
    case when count(*) = 6 then 'PASS' else 'FAIL' end
  from latest_per_target where review_type = 'mock_maths_independent_review'

  union all
  select 9, '9. Review-type distribution: Reading remediation',
    '11', count(*)::text,
    case when count(*) = 11 then 'PASS' else 'FAIL' end
  from latest_per_target where review_type = 'mock_english_passage_independent_review'

  union all
  select 10, '10. Review-type distribution: Writing',
    '2', count(*)::text,
    case when count(*) = 2 then 'PASS' else 'FAIL' end
  from latest_per_target where review_type = 'mock_writing_prompt_independent_review'

  union all
  select 11, '11. Reviewer-name consistency (INFO only, not a pass/fail gate)',
    'all match one canonical reviewer name',
    string_agg(distinct reviewer, ' | ' order by reviewer),
    case when count(distinct reviewer) = 1 then 'PASS'
         else 'INFO: ' || count(distinct reviewer)::text || ' distinct spellings, not auto-corrected' end
  from latest_per_target

) results
order by ord;
