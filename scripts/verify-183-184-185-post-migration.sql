-- Angel Digital 11+ — Post-Migration Verification for 183/184/185
-- (READ-ONLY, single result table). Run this AFTER applying all three
-- migrations, in order, via Supabase Dashboard > SQL Editor. Every
-- statement below is a SELECT only -- no INSERT, UPDATE, DELETE, or DDL.
--
-- Founder pre-application review strengthening: the previous version of
-- this script only checked that no "/" remained in the 26 Migration 183
-- rows -- necessary but not sufficient, since it could not detect a row
-- left in an unexpected intermediate state, a wrong array, an extra
-- phrase, or a missing phrase. This version adds an EXACT post-state
-- check per row: each row's live acceptedAnswers array is compared, with
-- strict jsonb equality (order-sensitive, exact match), against the
-- precise literal array Migration 183 itself sets. The check fails if
-- the row is absent, the array differs in any way (missing an intended
-- phrase, containing an unexpected phrase, or in a different order),
-- covering every failure mode named in the Founder's review. The
-- structural slash-free check is kept as an additional, independent
-- check, not a replacement.

with
m183_expected (id, expected) as (
  values
  ('w1-lastbus-07', '["from scared to relieved","fear to relief","anxious to happy","anxious to laughing"]'::jsonb),
  ('w1-newgirl-01', '["a sentence about moving from leicester","an opening line about leicester","an opening line about disinfectant"]'::jsonb),
  ('w1-atticdoor-02', '["it had been forgotten for a long time","personification of the padlock waiting","suggests it has been neglected","suggests it has been abandoned"]'::jsonb),
  ('w1-raceday-01', '["jogged up and checked his spikes","warmed up and checked his spikes","practised the handover","practised his handover","warmed up thoroughly"]'::jsonb),
  ('w1-raceday-02', '["she is very relaxed about winning","she is very unbothered about winning","she doesn''t worry about the result","casual, confident attitude"]'::jsonb),
  ('w2-understudy-02', '["he felt sick","he felt nervous","a wave of nausea","a wave of nerves","an uncomfortable, nervous feeling"]'::jsonb),
  ('w2-longwalk-01', '["the bus didn''t come","bus was late","bus never arrived"]'::jsonb),
  ('w2-longwalk-04', '["it looked like serious rain was coming","it looked like heavy rain was coming","threatening weather","a storm was clearly about to happen"]'::jsonb),
  ('w2-sciencefair-03', '["not very impressed","not very excited","competent but not memorable","mild, courteous interest"]'::jsonb),
  ('w3-rc10-am-02', '["it creates suspense before the reveal","it creates tension before the reveal","it shows her hesitating, delaying the moment of finding out","it emphasises the anticipation building throughout the passage"]'::jsonb),
  ('w3-rc10-wc-01', '["someone arranged the room deliberately, which is unusual","someone arranged the room carefully, which is unusual","planned or prepared the room carefully","it hints that something out of the ordinary has occurred","it shows the tidiness is not accidental","the arrangement was deliberate and planned, not accidental tidying"]'::jsonb),
  ('w3-rc10-wc-02', '["she is not fully sure whose handwriting it is, only partly familiar","it creates uncertainty about the sender","it creates mystery about the sender","she has some recognition but cannot place it exactly"]'::jsonb),
  ('eng-inc001-understudy-q04', '["she didn''t hide how she felt","she was open about it","she showed her feelings openly, without trying to conceal them","everyone could tell","she made it obvious"]'::jsonb),
  ('eng-inc001-bee-q07', '["the sun","sun-compass","polarised light","memory of landmarks","landmark memory","sensing the earth''s magnetic field","magnetic sense","magnetic field detection"]'::jsonb),
  ('w1-kitemaker-09', '["so Femi learns to notice and solve problems himself","wants Femi to reason it out rather than be told","believes working it out yourself is real learning","testing Femi''s own understanding","encouraging Femi''s own understanding"]'::jsonb),
  ('w1-lastbus-08', '["desperately out of breath","gasping for air","physically exhausted from running so hard","urgent, extreme need to breathe","emphasises how hard she had been running"]'::jsonb),
  ('w1-lastbus-09', '["from anxious to relieved and laughing","from panicked to relieved and laughing","fear turns to relief and amusement","goes from frightened to happy once safe","goes from frightened to laughing once safe","panic at the start, relief and laughter by the end"]'::jsonb),
  ('w1-newgirl-08', '["rehearsed line never used; asks about the pasta instead","planned a witty introduction but said something ordinary","planned a witty introduction but said something unplanned","actual words are completely different from the rehearsed sentence","she meant to say something clever but blurted out a random question"]'::jsonb),
  ('w1-newgirl-09', '["felt accepted as ordinary rather than singled out as the new girl","felt accepted as ordinary rather than singled out as the different girl","did not have to explain or perform being new","being included casually mattered more than being noticed","let her belong without having to justify herself"]'::jsonb),
  ('w1-atticdoor-08', '["makes the door feel alive or eerie","makes the attic feel alive or eerie","creates a tense, unsettling atmosphere","suggests something might be about to happen","suggests something might be about to respond","builds suspense before Marcus enters"]'::jsonb),
  ('w1-atticdoor-09', '["wants to prolong the excitement before finding out","wants to prolong the anticipation before finding out","enjoys the suspense of not knowing yet","the mystery will end once he looks, so he delays it briefly","savouring the moment of anticipation after waiting so long"]'::jsonb),
  ('w1-raceday-08', '["Ade prepares intensely, Cass prepares casually","Ade prepares methodically, Cass prepares casually","Ade is anxious and thorough, Cass is relaxed and minimal","Ade arrives early and checks everything, Cass arrives late and relaxes","one is highly organised, the other seems unbothered"]'::jsonb),
  ('w1-raceday-09', '["treats running as casual, not stressful","treats running as relaxing, not stressful","unbothered, low-effort attitude","doesn''t take it seriously the way Ade does","calm, almost effortless approach"]'::jsonb),
  ('w1-letter-09', '["a small kindness meant a lot to Dara on a difficult day, more than the woman would have known","the woman probably didn''t realise how much her small act of kindness helped Dara feel less embarrassed","simple kindness to a stranger can matter more to the receiver than the giver realises","Dara was already upset, so the kindness meant more than usual","Dara was already embarrassed, so the kindness meant more than usual"]'::jsonb),
  ('w3-rc07-bakersapprentice-01', '["he carries his easily, she struggles and has to drag hers","he carries his effortlessly, she struggles and has to drag hers","his experience makes it look easy, her lack of experience makes it hard","he is far ahead of her because the task is effortless for him but not for her"]'::jsonb),
  ('w3-rc07-newtrainers-01', '["goes from wanting to be seen to wanting to hide","goes from wanting to be seen to wanting to avoid attention","started proud and eager to show off, ended embarrassed and avoiding notice","the longest route to be seen becomes the shortest route to avoid being seen"]'::jsonb)
),
tick_justify_excluded_ids as (
  select unnest(array[
    'w1-atticdoor-04','w1-kitemaker-04','w1-lastbus-04','w1-letter-04','w1-newgirl-04',
    'w2-lastslice-05','w2-morningpatrol-07','w2-pianorecital-04','w2-sciencefair-04',
    'w2-twoletters-04','w2-understudy-05'
  ]) as id
),
row_check as (
  -- LEFT JOIN so a MISSING row (id not found in ali_question_bank at
  -- all) is detected explicitly, not silently skipped.
  select
    e.id,
    e.expected,
    q.id is not null as row_present,
    q.prompt->'acceptedAnswers' as actual,
    (q.prompt->'acceptedAnswers' = e.expected) as exact_match
  from m183_expected e
  left join public.ali_question_bank q on q.id = e.id
),
c1_exact as (
  -- Migration 183: EXACT post-state match, all 26 rows, order-sensitive.
  -- Fails on: missing row, wrong array, extra phrase, missing phrase, or
  -- reordered array.
  select count(*) as total,
         count(*) filter (where row_present) as present,
         count(*) filter (where row_present and exact_match) as exact_matches
  from row_check
),
c1_structural as (
  -- Kept as an additional, independent structural check (not a
  -- replacement for c1_exact): no "/" anywhere in the live array.
  select count(*) as total,
         count(*) filter (
           where exists (
             select 1 from jsonb_array_elements_text(q.prompt->'acceptedAnswers') e
             where e like '%/%'
           )
         ) as still_has_slash
  from m183_expected m join public.ali_question_bank q on q.id = m.id
),
c2 as (
  -- 184: w3-rc10-am-06 now has exactly 4 accepted answers, including the
  -- new one, in exact expected form.
  select
    (q.prompt->'acceptedAnswers' = '["there is a hidden or unspoken worry among everyone present","people are anxious but trying not to show it openly","the tension is felt but not directly discussed","avoiding voicing their fear directly"]'::jsonb) as exact_match
  from public.ali_question_bank q where q.id = 'w3-rc10-am-06'
),
c3 as (
  -- 185: Morning Patrol's question text and addresses_misconception match
  -- the exact expected post-state.
  select
    (q.prompt->>'question' = 'Tick 4 boxes that accurately describe things Priya did in the passage. A. She checked the greenhouse first, as usual. B. She found the gate already open. C. She counted the ducks as usual. D. She went straight to the rose beds. E. She woke the boy immediately. F. She found a tent at the old oak. G. She found the rose beds disturbed. H. She returned to the greenhouse before dealing with the boy.') as question_exact_match,
    (q.addresses_misconception = 'Selecting A or C, which describe her USUAL routine rather than what actually happened this disrupted Tuesday; selecting E, which the passage explicitly says she did not do; or selecting G, since the passage states the rose beds were untouched.') as misconception_exact_match
  from public.ali_question_bank q where q.id = 'w2-morningpatrol-08'
),
c4 as (
  -- Tick-justify exclusion (Founder standing rule, migration 181's own
  -- precondition) remains completely untouched by 183/184/185: still 11
  -- rows, still all non-practice_eligible.
  select count(*) as total,
         count(*) filter (where q.eligibility_status <> 'practice_eligible') as still_excluded
  from tick_justify_excluded_ids t join public.ali_question_bank q on q.id = t.id
),
c5 as (
  -- None of the 28 rows touched by 183/184/185 had their eligibility
  -- silently changed -- 183/184/185 never SET eligibility_status, so this
  -- must show 0 rows at practice_eligible/mock_eligible among the
  -- currently-provisional (Wave1/Wave3 remediation) ones.
  select count(*) as leaked
  from public.ali_question_bank
  where id in (
    'w1-kitemaker-09','w1-lastbus-08','w1-lastbus-09','w1-newgirl-08','w1-newgirl-09',
    'w1-atticdoor-08','w1-atticdoor-09','w1-raceday-08','w1-raceday-09','w1-letter-09',
    'w3-rc07-bakersapprentice-01','w3-rc07-newtrainers-01'
  )
  and eligibility_status in ('practice_eligible','mock_eligible')
),
c6 as (
  -- No Mock-track content was touched: none of the 28 ids begin with
  -- 'mock-'.
  select count(*) as mock_ids_touched
  from (select unnest(array[
    'w1-lastbus-07','w1-newgirl-01','w1-atticdoor-02','w1-raceday-01','w1-raceday-02',
    'w2-understudy-02','w2-longwalk-01','w2-longwalk-04','w2-sciencefair-03',
    'w3-rc10-am-02','w3-rc10-wc-01','w3-rc10-wc-02',
    'eng-inc001-understudy-q04','eng-inc001-bee-q07',
    'w1-kitemaker-09','w1-lastbus-08','w1-lastbus-09','w1-newgirl-08','w1-newgirl-09',
    'w1-atticdoor-08','w1-atticdoor-09','w1-raceday-08','w1-raceday-09','w1-letter-09',
    'w3-rc07-bakersapprentice-01','w3-rc07-newtrainers-01',
    'w3-rc10-am-06','w2-morningpatrol-08'
  ]) as id) t
  where t.id like 'mock-%'
)

select * from (
  select 1 as ord, '1a. Migration 183: EXACT post-state match, all 26 rows (order-sensitive, strict)' as check_name,
    '26 present, 26 exact matches' as expected,
    concat(c1_exact.present, ' present, ', c1_exact.exact_matches, ' exact matches') as actual,
    case when c1_exact.total = 26 and c1_exact.present = 26 and c1_exact.exact_matches = 26 then 'PASS' else 'FAIL' end as status
  from c1_exact

  union all
  select 2, '1b. Migration 183: structural check, no slash remains in any of the 26 arrays',
    '26 present, 0 with slash' as expected,
    concat(c1_structural.total, ' present, ', c1_structural.still_has_slash, ' with slash') as actual,
    case when c1_structural.total = 26 and c1_structural.still_has_slash = 0 then 'PASS' else 'FAIL' end
  from c1_structural

  union all
  select 3, '2. Migration 184: w3-rc10-am-06 exact post-state match',
    'exact_match=true',
    concat('exact_match=', c2.exact_match),
    case when c2.exact_match = true then 'PASS' else 'FAIL' end
  from c2

  union all
  select 4, '3. Migration 185: Morning Patrol question + misconception exact post-state match',
    'question_exact_match=true, misconception_exact_match=true',
    concat('question_exact_match=', c3.question_exact_match, ', misconception_exact_match=', c3.misconception_exact_match),
    case when c3.question_exact_match = true and c3.misconception_exact_match = true then 'PASS' else 'FAIL' end
  from c3

  union all
  select 5, '4. Tick-justify exclusion (11 rows) untouched by 183/184/185', '11 present, 11 still excluded',
    concat(c4.total, ' present, ', c4.still_excluded, ' still excluded'),
    case when c4.total = 11 and c4.still_excluded = 11 then 'PASS' else 'FAIL' end
  from c4

  union all
  select 6, '5. No eligibility_status silently changed on the still-provisional rows', '0',
    c5.leaked::text,
    case when c5.leaked = 0 then 'PASS' else 'FAIL' end
  from c5

  union all
  select 7, '6. No Mock-track content touched by 183/184/185', '0',
    c6.mock_ids_touched::text,
    case when c6.mock_ids_touched = 0 then 'PASS' else 'FAIL' end
  from c6
) results
order by ord;

-- Second result set: per-row detail for check 1a, so any single-row
-- failure is immediately identifiable rather than only visible as an
-- aggregate count.
select
  e.id,
  (q.id is not null) as row_present,
  (q.prompt->'acceptedAnswers' = e.expected) as exact_match,
  q.prompt->'acceptedAnswers' as actual_array,
  e.expected as expected_array
from (
  values
  ('w1-lastbus-07', '["from scared to relieved","fear to relief","anxious to happy","anxious to laughing"]'::jsonb),
  ('w1-newgirl-01', '["a sentence about moving from leicester","an opening line about leicester","an opening line about disinfectant"]'::jsonb),
  ('w1-atticdoor-02', '["it had been forgotten for a long time","personification of the padlock waiting","suggests it has been neglected","suggests it has been abandoned"]'::jsonb),
  ('w1-raceday-01', '["jogged up and checked his spikes","warmed up and checked his spikes","practised the handover","practised his handover","warmed up thoroughly"]'::jsonb),
  ('w1-raceday-02', '["she is very relaxed about winning","she is very unbothered about winning","she doesn''t worry about the result","casual, confident attitude"]'::jsonb),
  ('w2-understudy-02', '["he felt sick","he felt nervous","a wave of nausea","a wave of nerves","an uncomfortable, nervous feeling"]'::jsonb),
  ('w2-longwalk-01', '["the bus didn''t come","bus was late","bus never arrived"]'::jsonb),
  ('w2-longwalk-04', '["it looked like serious rain was coming","it looked like heavy rain was coming","threatening weather","a storm was clearly about to happen"]'::jsonb),
  ('w2-sciencefair-03', '["not very impressed","not very excited","competent but not memorable","mild, courteous interest"]'::jsonb),
  ('w3-rc10-am-02', '["it creates suspense before the reveal","it creates tension before the reveal","it shows her hesitating, delaying the moment of finding out","it emphasises the anticipation building throughout the passage"]'::jsonb),
  ('w3-rc10-wc-01', '["someone arranged the room deliberately, which is unusual","someone arranged the room carefully, which is unusual","planned or prepared the room carefully","it hints that something out of the ordinary has occurred","it shows the tidiness is not accidental","the arrangement was deliberate and planned, not accidental tidying"]'::jsonb),
  ('w3-rc10-wc-02', '["she is not fully sure whose handwriting it is, only partly familiar","it creates uncertainty about the sender","it creates mystery about the sender","she has some recognition but cannot place it exactly"]'::jsonb),
  ('eng-inc001-understudy-q04', '["she didn''t hide how she felt","she was open about it","she showed her feelings openly, without trying to conceal them","everyone could tell","she made it obvious"]'::jsonb),
  ('eng-inc001-bee-q07', '["the sun","sun-compass","polarised light","memory of landmarks","landmark memory","sensing the earth''s magnetic field","magnetic sense","magnetic field detection"]'::jsonb),
  ('w1-kitemaker-09', '["so Femi learns to notice and solve problems himself","wants Femi to reason it out rather than be told","believes working it out yourself is real learning","testing Femi''s own understanding","encouraging Femi''s own understanding"]'::jsonb),
  ('w1-lastbus-08', '["desperately out of breath","gasping for air","physically exhausted from running so hard","urgent, extreme need to breathe","emphasises how hard she had been running"]'::jsonb),
  ('w1-lastbus-09', '["from anxious to relieved and laughing","from panicked to relieved and laughing","fear turns to relief and amusement","goes from frightened to happy once safe","goes from frightened to laughing once safe","panic at the start, relief and laughter by the end"]'::jsonb),
  ('w1-newgirl-08', '["rehearsed line never used; asks about the pasta instead","planned a witty introduction but said something ordinary","planned a witty introduction but said something unplanned","actual words are completely different from the rehearsed sentence","she meant to say something clever but blurted out a random question"]'::jsonb),
  ('w1-newgirl-09', '["felt accepted as ordinary rather than singled out as the new girl","felt accepted as ordinary rather than singled out as the different girl","did not have to explain or perform being new","being included casually mattered more than being noticed","let her belong without having to justify herself"]'::jsonb),
  ('w1-atticdoor-08', '["makes the door feel alive or eerie","makes the attic feel alive or eerie","creates a tense, unsettling atmosphere","suggests something might be about to happen","suggests something might be about to respond","builds suspense before Marcus enters"]'::jsonb),
  ('w1-atticdoor-09', '["wants to prolong the excitement before finding out","wants to prolong the anticipation before finding out","enjoys the suspense of not knowing yet","the mystery will end once he looks, so he delays it briefly","savouring the moment of anticipation after waiting so long"]'::jsonb),
  ('w1-raceday-08', '["Ade prepares intensely, Cass prepares casually","Ade prepares methodically, Cass prepares casually","Ade is anxious and thorough, Cass is relaxed and minimal","Ade arrives early and checks everything, Cass arrives late and relaxes","one is highly organised, the other seems unbothered"]'::jsonb),
  ('w1-raceday-09', '["treats running as casual, not stressful","treats running as relaxing, not stressful","unbothered, low-effort attitude","doesn''t take it seriously the way Ade does","calm, almost effortless approach"]'::jsonb),
  ('w1-letter-09', '["a small kindness meant a lot to Dara on a difficult day, more than the woman would have known","the woman probably didn''t realise how much her small act of kindness helped Dara feel less embarrassed","simple kindness to a stranger can matter more to the receiver than the giver realises","Dara was already upset, so the kindness meant more than usual","Dara was already embarrassed, so the kindness meant more than usual"]'::jsonb),
  ('w3-rc07-bakersapprentice-01', '["he carries his easily, she struggles and has to drag hers","he carries his effortlessly, she struggles and has to drag hers","his experience makes it look easy, her lack of experience makes it hard","he is far ahead of her because the task is effortless for him but not for her"]'::jsonb),
  ('w3-rc07-newtrainers-01', '["goes from wanting to be seen to wanting to hide","goes from wanting to be seen to wanting to avoid attention","started proud and eager to show off, ended embarrassed and avoiding notice","the longest route to be seen becomes the shortest route to avoid being seen"]'::jsonb)
) as e(id, expected)
left join public.ali_question_bank q on q.id = e.id
order by e.id;
