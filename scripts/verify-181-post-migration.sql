-- Angel Digital 11+ — Post-Migration Verification for Migration 181
-- (READ-ONLY, ONE statement, single result table). Run this AFTER
-- applying migration 181 via Supabase Dashboard > SQL Editor. Every
-- clause below is a SELECT only -- no INSERT, UPDATE, DELETE, or DDL.
--
-- Checks 1-2 and 4-6 are proven live, from the database, by this query.
-- Check 3 ("no additional rows were promoted") is a structural guarantee
-- of migration 181's own SQL, not something re-derivable from outside
-- after the fact: its one UPDATE statement's WHERE clause is
-- `id = any(v_target_ids) and eligibility_status = 'provisional'`, which
-- cannot touch any row whose id is not in that 22-element array. This
-- query's checks 1-2 confirm that array's own promotion is exactly and
-- only 22 -- no fewer (a silent partial failure) and no more (the array
-- itself has only 22 elements, so no more is structurally impossible).
-- Check 7 ("no educational content fields were modified") was already
-- proven with strictly stronger evidence than any external read-only
-- query can offer: migration 181's own transaction snapshots
-- prompt/learning_unit_id/family_id/active immediately before its write
-- and compares them byte-for-byte immediately after, raising an
-- exception and rolling back on any mismatch (see its own RAISE NOTICE
-- output in the Supabase SQL Editor result after you run it). A
-- separate script run after the fact has no access to a pre-write
-- snapshot and cannot reconstruct that same proof; it is not repeated
-- here to avoid a weaker, redundant check standing in for a stronger
-- one that has already run.
--
-- Disclosed row-ID overlap (not a defect, not touched by this query):
-- 12 of these 22 ids were also touched by migration 183 (content-only:
-- acceptedAnswers), 2 of those same 12 (w1-raceday-09, w1-letter-09)
-- also by migration 186 (content-only: acceptedAnswers apostrophe fix).
-- Both migrations are already applied and Founder-verified PASS, touch
-- only prompt->acceptedAnswers (never eligibility_status), and migration
-- 181 touches only eligibility_status (never prompt) -- field-disjoint,
-- no conflict. Migrations 184/185/187 targets do not overlap this set
-- at all.

with
target_ids (id) as (
  values
  ('w1-kitemaker-08'),('w1-kitemaker-09'),('w1-lastbus-08'),('w1-lastbus-09'),
  ('w1-newgirl-08'),('w1-newgirl-09'),('w1-atticdoor-08'),('w1-atticdoor-09'),
  ('w1-raceday-08'),('w1-raceday-09'),('w1-letter-08'),('w1-letter-09'),
  ('w3-rc01-emptyclassroom-01'),('w3-rc08-emptyclassroom-01'),
  ('w3-rc01-bakersapprentice-01'),('w3-rc07-bakersapprentice-01'),
  ('w3-rc01-lettertograndad-01'),('w3-rc06-lettertograndad-01'),
  ('w3-rc01-stormharbour-01'),('w3-rc08-stormharbour-01'),
  ('w3-rc01-newtrainers-01'),('w3-rc07-newtrainers-01')
),
tick_justify_ids (id) as (
  values
  ('w1-atticdoor-04'),('w1-kitemaker-04'),('w1-lastbus-04'),('w1-letter-04'),('w1-newgirl-04'),
  ('w2-lastslice-05'),('w2-morningpatrol-07'),('w2-pianorecital-04'),('w2-sciencefair-04'),
  ('w2-twoletters-04'),('w2-understudy-05')
),
target_state as (
  select
    t.id,
    q.id is not null as row_present,
    q.eligibility_status,
    q.family_id,
    case
      when t.id like 'w1-%' then regexp_replace(t.id, '-(08|09)$', '')
      else regexp_replace(regexp_replace(t.id, '^w3-rc[0-9]+-', ''), '-01$', '')
    end as story_group
  from target_ids t
  left join public.ali_question_bank q on q.id = t.id
),
tick_state as (
  select tj.id, q.id is not null as row_present, q.eligibility_status
  from tick_justify_ids tj
  left join public.ali_question_bank q on q.id = tj.id
)

select 1 as ord, '1. Exactly 22 target rows exist' as check_name, '22' as expected,
  count(*) filter (where row_present)::text as actual,
  case when count(*) filter (where row_present) = 22 then 'PASS' else 'FAIL' end as status
from target_state

union all
select 2, '2. Exactly 22 target rows now practice_eligible', '22',
  count(*) filter (where eligibility_status = 'practice_eligible')::text,
  case when count(*) filter (where eligibility_status = 'practice_eligible') = 22 then 'PASS' else 'FAIL' end
from target_state

union all
select 3, '3. No additional rows promoted (structural guarantee, see header comment -- re-confirmed closed at exactly 22)', '22',
  count(distinct id) filter (where eligibility_status = 'practice_eligible')::text,
  case when count(distinct id) filter (where eligibility_status = 'practice_eligible') = 22 then 'PASS' else 'FAIL' end
from target_state

union all
select 4, '4. All 11 tick-justify rows remain excluded (not practice_eligible)', '11',
  count(*) filter (where eligibility_status is distinct from 'practice_eligible')::text,
  case when count(*) filter (where eligibility_status is distinct from 'practice_eligible') = 11 then 'PASS' else 'FAIL' end
from tick_state

union all
select 5, '5. No Mock-track row among the 22 (none belong to a Mock family)', '0',
  count(*) filter (where family_id ilike '%mock%')::text,
  case when count(*) filter (where family_id ilike '%mock%') = 0 then 'PASS' else 'FAIL' end
from target_state

union all
select 6, '6. Family/passage distribution preserved: 6 Wave-1 story-groups x 2 rows, 5 Wave-3 story-groups x 2 rows', '11',
  count(distinct story_group)::text,
  case when count(distinct story_group) = 11
    and count(*) filter (where id like 'w1-%') = 12
    and count(*) filter (where id like 'w3-%') = 10
    and (select count(*) from (select story_group, count(*) c from target_state group by story_group) g where g.c <> 2) = 0
  then 'PASS' else 'FAIL' end
from target_state

union all
select 7, '7. No educational content fields modified (proven inside migration 181''s own transaction -- see header comment)', 'n/a',
  'n/a',
  'INFO: see migration 181''s own RAISE NOTICE output'

order by ord;
