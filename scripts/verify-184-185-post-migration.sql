-- Angel Digital 11+ — Dedicated Post-Migration Verification for
-- Migrations 184 and 185 (Founder Priority 4, Bounded Assessment
-- Integrity Correction Wave). Read-only, single result table. Run this
-- AFTER applying migrations 184 and 185 via Supabase Dashboard >
-- SQL Editor. Every statement below is a SELECT only -- no INSERT,
-- UPDATE, DELETE, or DDL.
--
-- Supersedes reliance on the earlier consolidated 183/184/185 query's
-- omitted-failure implication: this produces an explicit PASS/FAIL row
-- for each migration individually, plus a per-row detail dump.

with
expected_184 (id, expected_accepted_answers) as (
  values
  ('w3-rc10-am-06', '["there is a hidden or unspoken worry among everyone present","people are anxious but trying not to show it openly","the tension is felt but not directly discussed","avoiding voicing their fear directly"]'::jsonb)
),
expected_185 (id, expected_question, expected_misconception) as (
  values
  ('w2-morningpatrol-08',
   'Tick 4 boxes that accurately describe things Priya did in the passage. A. She checked the greenhouse first, as usual. B. She found the gate already open. C. She counted the ducks as usual. D. She went straight to the rose beds. E. She woke the boy immediately. F. She found a tent at the old oak. G. She found the rose beds disturbed. H. She returned to the greenhouse before dealing with the boy.',
   'Selecting A or C, which describe her USUAL routine rather than what actually happened this disrupted Tuesday; selecting E, which the passage explicitly says she did not do; or selecting G, since the passage states the rose beds were untouched.')
),
check_184 as (
  select
    e.id,
    q.id is not null as row_present,
    q.prompt->'acceptedAnswers' = e.expected_accepted_answers as exact_match,
    q.eligibility_status,
    q.prompt->'acceptedAnswers' as actual_accepted_answers
  from expected_184 e
  left join public.ali_question_bank q on q.id = e.id
),
check_185 as (
  select
    e.id,
    q.id is not null as row_present,
    q.prompt->>'question' = e.expected_question as question_exact_match,
    q.addresses_misconception = e.expected_misconception as misconception_exact_match,
    q.prompt->'correctOptions' = '["B","D","F","H"]'::jsonb as correct_options_unchanged,
    q.eligibility_status,
    q.prompt->>'question' as actual_question,
    q.addresses_misconception as actual_misconception
  from expected_185 e
  left join public.ali_question_bank q on q.id = e.id
)

select 1 as ord, '184.1: w3-rc10-am-06 present' as check_name, 'true' as expected,
  bool_and(row_present)::text as actual,
  case when bool_and(row_present) then 'PASS' else 'FAIL' end as status
from check_184

union all
select 2, '184.2: acceptedAnswers exact post-state match (4 entries, order-sensitive)', 'true',
  bool_and(exact_match)::text,
  case when bool_and(exact_match) then 'PASS' else 'FAIL' end
from check_184

union all
select 3, '184.3: eligibility unchanged (still practice_eligible -- promoted by migration 065, untouched by 184)', 'true',
  bool_and(eligibility_status = 'practice_eligible')::text,
  case when bool_and(eligibility_status = 'practice_eligible') then 'PASS' else 'FAIL' end
from check_184

union all
select 4, '185.1: w2-morningpatrol-08 present', 'true',
  bool_and(row_present)::text,
  case when bool_and(row_present) then 'PASS' else 'FAIL' end
from check_185

union all
select 5, '185.2: question text exact post-state match (option G corrected)', 'true',
  bool_and(question_exact_match)::text,
  case when bool_and(question_exact_match) then 'PASS' else 'FAIL' end
from check_185

union all
select 6, '185.3: addresses_misconception exact post-state match', 'true',
  bool_and(misconception_exact_match)::text,
  case when bool_and(misconception_exact_match) then 'PASS' else 'FAIL' end
from check_185

union all
select 7, '185.4: correctOptions untouched (still B, D, F, H)', 'true',
  bool_and(correct_options_unchanged)::text,
  case when bool_and(correct_options_unchanged) then 'PASS' else 'FAIL' end
from check_185

union all
select 8, '185.5: eligibility unchanged (still practice_eligible -- promoted by migration 055, untouched by 185)', 'true',
  bool_and(eligibility_status = 'practice_eligible')::text,
  case when bool_and(eligibility_status = 'practice_eligible') then 'PASS' else 'FAIL' end
from check_185

order by ord;

-- Per-row detail, so any failure is immediately identifiable. Two
-- separate result sets (184's and 185's actual values have different
-- shapes -- a JSON array vs question/misconception text -- so they are
-- not unioned into one grid).
select id, row_present, exact_match, eligibility_status, actual_accepted_answers
from check_184;

select id, row_present, question_exact_match, misconception_exact_match,
  correct_options_unchanged, eligibility_status, actual_question, actual_misconception
from check_185;
