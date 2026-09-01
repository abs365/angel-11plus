-- Angel Digital 11+ — Post-Migration Verification for Migration 186
-- (READ-ONLY, single result table). Run this AFTER applying migration
-- 186 via Supabase Dashboard > SQL Editor. Every statement below is a
-- SELECT only -- no INSERT, UPDATE, DELETE, or DDL.

with
expected (id, expected) as (
  values
  ('w1-raceday-09', '["treats running as casual, not stressful","treats running as relaxing, not stressful","unbothered, low-effort attitude","doesn''t take it seriously the way Ade does","calm, almost effortless approach"]'::jsonb),
  ('w1-letter-09', '["a small kindness meant a lot to Dara on a difficult day, more than the woman would have known","the woman probably didn''t realise how much her small act of kindness helped Dara feel less embarrassed","simple kindness to a stranger can matter more to the receiver than the giver realises","Dara was already upset, so the kindness meant more than usual","Dara was already embarrassed, so the kindness meant more than usual"]'::jsonb)
),
row_check as (
  select
    e.id,
    e.expected,
    q.id is not null as row_present,
    q.prompt->'acceptedAnswers' as actual,
    q.eligibility_status,
    (q.prompt->'acceptedAnswers' = e.expected) as exact_match,
    exists (
      select 1 from jsonb_array_elements_text(q.prompt->'acceptedAnswers') el
      where el like '%/%'
    ) as has_slash
  from expected e
  left join public.ali_question_bank q on q.id = e.id
)

select
  1 as ord, '1. Both rows present' as check_name, '2' as expected,
  count(*) filter (where row_present)::text as actual,
  case when count(*) filter (where row_present) = 2 then 'PASS' else 'FAIL' end as status
from row_check

union all
select 2, '2. Both rows exact post-state match (order-sensitive)', '2',
  count(*) filter (where row_present and exact_match)::text,
  case when count(*) filter (where row_present and exact_match) = 2 then 'PASS' else 'FAIL' end
from row_check

union all
select 3, '3. Neither row contains slash shorthand', '0',
  count(*) filter (where has_slash)::text,
  case when count(*) filter (where has_slash) = 0 then 'PASS' else 'FAIL' end
from row_check

union all
select 4, '4. Eligibility unchanged (neither is practice_eligible/mock_eligible)', '0',
  count(*) filter (where eligibility_status in ('practice_eligible','mock_eligible'))::text,
  case when count(*) filter (where eligibility_status in ('practice_eligible','mock_eligible')) = 0 then 'PASS' else 'FAIL' end
from row_check

order by ord;

-- Per-row detail, so any failure is immediately identifiable.
select
  id, row_present, exact_match, has_slash, eligibility_status, actual, expected
from row_check
order by id;
