-- Angel Digital 11+ — Migration 163
-- English Content Foundation, Increment 002 (Decision 239) — The Loose
-- Connection Q2 Grouped-Scoring Correction (LIVE database correction;
-- migrations 161/162 are Founder-confirmed already applied).
--
-- ============================================================
-- ROOT CAUSE
-- ============================================================
-- Decision 238's own remediation applied the SAME architectural fix
-- (splitting a pooled-answer synonym-list row into independently-scored
-- grouped subpart rows, migration 093's own established mechanism) to
-- Sail and Steam's own Q5, but Loose Connection's own Q2 -- itself a
-- Decision 238 replacement, authored in the SAME remediation session --
-- was never given the identical treatment. Both are structurally the
-- same defect Decision 238's own migration 161 header already
-- documented in detail for Q5 (a single pooled acceptedAnswers array
-- checked via one TIER2_ACCEPTED_SET call against one combined user
-- answer, meaning a learner who typed just one correct synonym for ANY
-- one of the four scored words could match the pooled array and receive
-- ALL 4 marks without ever addressing the other three). This was a
-- genuine oversight in Decision 238's own scope, not a new discovery of
-- a different defect -- the Founder's live review of the newly-applied
-- content is what surfaced it, before either passage's own independent
-- review was recorded.
--
-- ============================================================
-- WHY A NEW, ADDITIVE MIGRATION (NOT AN IN-PLACE EDIT OF 161)
-- ============================================================
-- Migrations 161 and 162 are Founder-confirmed already applied. This
-- project's own standing "migrations are immutable once applied;
-- corrections are always new, additive migrations" convention (Decision
-- 218, re-affirmed at every subsequent live-correction decision) applies
-- here without exception -- unlike Decision 238's own in-place amendment
-- of migration 161 (permitted then because 161 had never been applied).
-- This migration corrects the LIVE row directly, in `public.
-- ali_question_bank`, leaving migration 161's own file byte-unchanged.
--
-- ============================================================
-- WHY THIS MIGRATION DELETES THE OLD Q2 ROW (A NARROW, JUSTIFIED,
-- PRECONDITION-GATED DEPARTURE FROM PURE-ADDITIVE CONVENTION)
-- ============================================================
-- Independently verified this session, from source, not assumed:
-- `fetchQuestionsForPassage()` (lib/adminReview.ts, the exact function
-- the Educational Review surface uses to render a passage's own
-- question set) filters ONLY by `learning_unit_id = passageId` -- no
-- `active` filter, no `eligibility_status` filter exists in that query.
-- This means marking the old row `active = false` (a soft-retirement
-- that has worked for other purposes elsewhere in this codebase) would
-- NOT remove it from the review surface -- a reviewer would still see
-- BOTH the old pooled Question 2 AND the new grouped Question 2
-- simultaneously, which is exactly the "duplicate learner-visible
-- Question 2 content" this task's own directive explicitly prohibits.
-- The only mechanism that genuinely and unambiguously prevents this is
-- removing the old row's own `learning_unit_id` match -- either by
-- deleting it, or by relabelling it to a fake `learning_unit_id` and
-- leaving an orphaned, permanently-mislabelled row in the database
-- forever. Deletion is judged the SAFER of the two real options: no
-- independent review decision has ever been recorded against this row
-- (`ali_family_review` only ever references the PASSAGE's own id, never
-- an individual question id -- independently re-confirmed this session),
-- no Practice or Mock pathway has ever read it (`eligibility_status`
-- has remained `authentic_assessment_candidate` throughout, and neither
-- pathway serves that status), and it has existed, in this exact
-- defective pooled shape, for less than the lifetime of two decisions.
-- Deleting it does not erase any decision, evidence, or history this
-- project's own standing rules protect; leaving a permanently-orphaned,
-- relabelled row would be a worse long-term outcome than a single,
-- narrowly-scoped, precondition-gated, idempotent DELETE of a row that
-- was never once acted upon by a human reviewer. This reasoning is
-- scoped EXCLUSIVELY to this one row, identified by its own exact `id`
-- and content signature below -- it does not establish a general
-- precedent for deleting applied content, and no other migration in
-- this codebase has ever done so, or should, without the same specific
-- justification independently re-established.
--
-- ============================================================
-- THE CORRECTION
-- ============================================================
-- DELETEs `eng-inc002-roboticsfinal-q02` (the single pooled row) and
-- INSERTs 4 new, independently-scored grouped rows --
-- `eng-inc002-roboticsfinal-q02b/c/d/e` -- mirroring migration 093's
-- own established grouped-question mechanism and Decision 238's own
-- Sail-and-Steam-Q5 pattern exactly: 1 mark each, each with its OWN,
-- non-overlapping `acceptedAnswers` set (an answer valid for one word
-- structurally cannot earn the mark for another), `question_group_id =
-- 'eng-inc002-roboticsfinal-q02'`, `group_order` 1-4, `subpart_label`
-- '(b)'-'(e)', `marking_mode = 'deterministic'`. Item (a) 'reassuring'
-- remains the unscored worked example, referenced in each subpart's own
-- question text for context, never given its own row -- exactly as (a)
-- 'enormously' was handled for Sail and Steam Q5. Total marks for
-- Question 2 remain 4, unchanged.
--
-- ============================================================
-- SAFETY
-- ============================================================
-- Fail-closed: the precondition requires the OLD row to exist with its
-- exact known signature (id, learning_unit_id, skill = 'QT-RC-04',
-- question_type = 'short-answer', 4 marks, the specific question text
-- naming all 5 words, the specific 16-item accepted-answer count,
-- eligibility_status, active) before anything is touched; if it does not
-- match exactly, this migration refuses and writes nothing, reporting
-- every live field value by name (never a misleading NULL). Idempotent: if
-- all 4 new rows already exist, this migration is a verified no-op
-- (and does not attempt to re-delete a row that is already gone).
-- Targets ONLY this one question -- no other Increment 002 row (either
-- passage), no passage row, no `ali_family_review` row, is read or
-- written. Does not change `eligibility_status` anywhere (every new row
-- is `authentic_assessment_candidate`, matching the row it replaces
-- exactly). Does not certify anything, does not touch
-- `practice_eligible` or `mock_eligible`, does not touch `ali_mock_form`.
--
-- NOT APPLIED. Generated for Founder application via Supabase Dashboard
-- > SQL Editor > New query, after migrations 161/162 (already applied).
--
-- ============================================================
-- CORRECTION HISTORY (this migration has never successfully applied,
-- so it is corrected in place, per Decision 218/229's own convention)
-- ============================================================
-- First Founder application attempt FAILED CLOSED in production with:
-- "expected exactly 1 pristine old Q2 row ... found 0 matching rows
-- with <NULL>s accepted answers." Founder-run read-only diagnostic
-- confirmed live root cause: the precondition tested
-- `question_type = 'QT-RC-04'`, but the canonical schema (verified from
-- migration 005's own base ali_question_bank definition) stores the
-- QT-RC competency code in `skill`, with `question_type` holding the
-- separate generic label 'short-answer'. Every other inspected live
-- field on the old row matched the expected Decision 238 signature
-- exactly, and no partial application (no q02b/c/d/e) was found.
-- Corrected below to check `skill = 'QT-RC-04' and question_type =
-- 'short-answer'` independently, and the refusal diagnostics were
-- rewritten to report every live field value by name instead of
-- producing a misleading NULL when the combined predicate matches zero
-- rows. No other part of this migration's logic, new-row content, or
-- grouping columns changed.
--
-- Second Founder application attempt FAILED CLOSED in production with:
-- "ERROR: 42804: column \"subject\" is of type subject_type but
-- expression is of type text" at the replacement-row INSERT. Root cause:
-- the INSERT was written as `insert into ... select * from (values
-- (...)) as new_rows where not exists (...)`, an extra idempotency guard
-- layered on top of the DO block's own idempotency check above. Wrapping
-- the VALUES list inside a subquery breaks PostgreSQL's normal
-- INSERT-target-list type inference -- string literals resolve to plain
-- `text` instead of being coerced against the destination columns, which
-- fails for `subject` (`public.subject_type`, an enum -- see migration
-- 001) and `content_difficulty` (`public.content_difficulty`, also an
-- enum -- see migration 005). Every other content migration in this
-- codebase (161 included) uses a plain `insert into ... values (...)
-- on conflict (id) do nothing`, never this subquery form, and has never
-- hit this class of error. Corrected by switching to that exact proven
-- form (the DO block's own idempotency check above already makes the
-- extra `where not exists` guard redundant) and additionally casting
-- `subject` and `content_difficulty` explicitly (`::public.subject_type`,
-- `::public.content_difficulty`) in all 4 new-row tuples as defense in
-- depth. No other column required a cast: `pathway` is a literal
-- `array[...]` (already `text[]`), `prompt` is passed via the same
-- dollar-quoted-string-in-VALUES form migration 161 already uses
-- successfully for the same jsonb column, and every integer/smallint/
-- boolean/text column accepts its literal via ordinary implicit
-- assignment casting, exactly as it always has in every other content
-- migration.

begin;

do $$
declare
  v_new_rows_count int;
  v_live_skill text;
  v_live_question_type text;
  v_live_marks int;
  v_live_accepted_type text;
  v_live_accepted_len int;
  v_live_eligibility_status text;
  v_live_active boolean;
  v_live_question_text text;
begin
  -- Idempotency check first: if all 4 new rows already exist, this
  -- migration has already been applied -- verified no-op, and the old
  -- row is not re-checked or re-deleted (it may already be gone).
  select count(*) into v_new_rows_count
  from public.ali_question_bank
  where id in (
    'eng-inc002-roboticsfinal-q02b', 'eng-inc002-roboticsfinal-q02c',
    'eng-inc002-roboticsfinal-q02d', 'eng-inc002-roboticsfinal-q02e'
  );

  if v_new_rows_count = 4 then
    raise notice 'Migration 163: all 4 grouped Q2 subpart rows already exist -- already applied. No changes made.';
    return;
  end if;

  if v_new_rows_count != 0 then
    raise exception 'Migration 163 refused: expected 0 or 4 of the new grouped Q2 subpart rows to exist, found %. Production is in a mixed, unexpected state -- re-verify before proceeding.', v_new_rows_count;
  end if;

  -- Pristine-state precondition: the OLD pooled row must exist with its
  -- exact known signature before it is deleted. This is deliberately
  -- split into two stages so a refusal ALWAYS reports the row's ACTUAL
  -- live field values -- never NULLs standing in for "zero rows matched
  -- the combined predicate", which is exactly the misleading diagnostic
  -- this migration produced when it first failed in production. Stage 1
  -- locates the row by identity alone (id + learning_unit_id); stage 2
  -- checks every other field independently and reports each one by name.
  --
  -- The QT-RC competency code lives in the `skill` column (confirmed via
  -- migration 005's own base ali_question_bank definition and the known-
  -- good row shape in migration 161); `question_type` holds the separate
  -- generic label 'short-answer'. The migration's first production
  -- attempt incorrectly tested `question_type = 'QT-RC-04'`, which no
  -- live row can ever satisfy -- confirmed root cause, live Founder
  -- diagnostic evidence, Decision 239 follow-up.
  select
    skill, question_type, (prompt ->> 'marks')::int,
    jsonb_typeof(prompt -> 'acceptedAnswers'),
    case when jsonb_typeof(prompt -> 'acceptedAnswers') = 'array'
      then jsonb_array_length(prompt -> 'acceptedAnswers') else null end,
    eligibility_status, active, prompt ->> 'question'
    into v_live_skill, v_live_question_type, v_live_marks,
         v_live_accepted_type, v_live_accepted_len,
         v_live_eligibility_status, v_live_active, v_live_question_text
  from public.ali_question_bank
  where id = 'eng-inc002-roboticsfinal-q02'
    and learning_unit_id = 'eng-inc002-roboticsfinal';

  if not found then
    raise exception 'Migration 163 refused: no row found with id = eng-inc002-roboticsfinal-q02 and learning_unit_id = eng-inc002-roboticsfinal. Re-verify production state before proceeding; this migration will not guess.';
  end if;

  if v_live_skill is distinct from 'QT-RC-04'
    or v_live_question_type is distinct from 'short-answer'
    or v_live_marks is distinct from 4
    or v_live_accepted_type is distinct from 'array'
    or v_live_accepted_len is distinct from 16
    or v_live_eligibility_status is distinct from 'authentic_assessment_candidate'
    or v_live_active is distinct from true
    or v_live_question_text not like '%frustrating%'
    or v_live_question_text not like '%disbelieving%'
    or v_live_question_text not like '%triumphant%'
    or v_live_question_text not like '%uselessly%'
  then
    raise exception 'Migration 163 refused: old Q2 row (eng-inc002-roboticsfinal-q02) exists but does not match the known Decision 238 pristine signature. Live values -- skill: % (expected QT-RC-04), question_type: % (expected short-answer), marks: % (expected 4), acceptedAnswers type: % (expected array), acceptedAnswers count: % (expected 16), eligibility_status: % (expected authentic_assessment_candidate), active: % (expected true), question text contains all 4 target words: %. Re-verify production state before proceeding; this migration will not guess.',
      v_live_skill, v_live_question_type, v_live_marks, v_live_accepted_type, v_live_accepted_len,
      v_live_eligibility_status, v_live_active,
      (v_live_question_text like '%frustrating%' and v_live_question_text like '%disbelieving%'
        and v_live_question_text like '%triumphant%' and v_live_question_text like '%uselessly%');
  end if;

  -- The old row is confirmed pristine and matches exactly -- safe to
  -- delete (see this migration's own header for the full justification;
  -- no ali_family_review row, Practice pathway, or Mock pathway has
  -- ever referenced this specific row).
  delete from public.ali_question_bank
  where id = 'eng-inc002-roboticsfinal-q02';

  raise notice 'Migration 163: deleted the old pooled-answer Q2 row (eng-inc002-roboticsfinal-q02).';
end $$;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('eng-inc002-roboticsfinal-q02b', 'english'::public.subject_type, 'QT-RC-04', array['csse'], 'medium'::public.content_difficulty, 'short-answer', 60,
 $json${"id":"eng-inc002-roboticsfinal-q02b","marks":1,"skill":"vocabulary","question":"Question 2(b). Using the passage, write a synonym (a word or short phrase with the same meaning) for 'frustrating', as used in 'reassuring rather than frustrating'. (The worked example for this question family is (a) 'reassuring' -- comforting/puts your mind at ease, not scored.)","modelAnswer":"Annoying/irritating.","passageTitle":"The Loose Connection","passageText":"\"Ninety minutes,\" Mr Adeyemi said, not looking up from his watch. \"Ninety minutes until the judges call your team number, and right now your robot won't move.\"\n\nHe didn't need to tell us that. I could see it for myself: Nisha crouched over the control box with a screwdriver, Ade sitting cross-legged beside the wheels doing nothing that looked, to me, like actual work, and our robot sitting exactly where it had stalled twenty minutes earlier, one wheel twitching uselessly whenever Nisha pressed the forward button.\n\n\"It's the motor,\" Nisha said, for the third time. \"Has to be. I'm going to swap it for the spare.\"\n\nI thought she was probably right. Nisha had built more of the drivetrain than either of us, and when something electrical went wrong, it was usually the thing she guessed first. I told her to go ahead.\n\nAde didn't say anything. He picked up the whole robot, tilted it gently onto its side, and started running one finger slowly along every wire between the battery and the wheels, the way you'd check a seam for a loose thread.\n\n\"We don't have time for that,\" I said. \"Nisha's already got the spare motor out.\"\n\n\"I know,\" Ade said, not stopping. \"I'm just checking first.\"\n\nI felt a flash of irritation I wasn't proud of. Ade was careful almost to a fault, the kind of person who read every instruction twice before starting, and usually I found that reassuring rather than frustrating. Today it felt like watching someone rearrange furniture while the house was on fire.\n\nNisha had the new motor half-fitted when Ade finally spoke again. \"Found it,\" he said, quietly, holding up a single wire near the battery terminal. The connector on the end had come half loose, not fully disconnected, just loose enough that it would carry power sometimes and not others, depending on how the robot was sitting.\n\nNisha stopped, the spare motor still in her hand. \"That's not the motor at all.\"\n\n\"No,\" Ade said. He didn't sound triumphant about it, which somehow made it worse. He just reconnected the wire properly, pressed it down until it clicked, and set the robot back on its wheels.\n\nNisha pressed the forward button. The robot rolled smoothly across the workshop floor and stopped exactly where it was supposed to.\n\nNobody said anything for a moment. Then Nisha laughed, short and disbelieving. \"I was about to take the whole drivetrain apart for nothing.\"\n\n\"You weren't wrong to check the motor,\" Ade said. \"It's usually the motor. This time it wasn't.\"\n\nI looked at the clock. Sixty-eight minutes left, plenty of time now, and I found myself thinking less about the competition and more about how close we'd come to spending all of it chasing the wrong problem, because the two loudest voices in the room, mine included, had been so certain they already knew the answer.\n\n\"Next time,\" I said, \"we let Ade check the wires first.\"\n\nAde almost smiled. \"Next time,\" he said, \"check the wires first anyway.\"","acceptedAnswers":["annoying","irritating","exasperating","aggravating"],"validationTier":"TIER2_ACCEPTED_SET"}$json$,
 'Angel English Content Foundation, Increment 002 (Decision 239). GROUPED numbered question, subpart (b). QT-RC-04, competency RC-03, family eng-inc002-qt-rc-04-roboticsfinal. LIVE CORRECTION: this row, together with q02c/q02d/q02e, replaces the single pooled-answer eng-inc002-roboticsfinal-q02 row (deleted by this same migration), applying the identical architectural fix Decision 238 already applied to Sail and Steam Q5 -- see migration 163''s own header for the full root-cause and safety rationale.', 2, 'eng-inc002-roboticsfinal',
 'eng-inc002-qt-rc-04-roboticsfinal', 'angel_original', 'authentic_assessment_candidate', 1, true, 'Guessing a synonym from a word''s sound or a loosely related idea rather than the meaning the word actually carries in its specific sentence context.',
 'NEAR_TRANSFER'),

('eng-inc002-roboticsfinal-q02c', 'english'::public.subject_type, 'QT-RC-04', array['csse'], 'medium'::public.content_difficulty, 'short-answer', 60,
 $json${"id":"eng-inc002-roboticsfinal-q02c","marks":1,"skill":"vocabulary","question":"Question 2(c). Using the passage, write a synonym for 'disbelieving', as used to describe how Nisha laughed.","modelAnswer":"Doubtful/not believing.","passageTitle":"The Loose Connection","passageText":"\"Ninety minutes,\" Mr Adeyemi said, not looking up from his watch. \"Ninety minutes until the judges call your team number, and right now your robot won't move.\"\n\nHe didn't need to tell us that. I could see it for myself: Nisha crouched over the control box with a screwdriver, Ade sitting cross-legged beside the wheels doing nothing that looked, to me, like actual work, and our robot sitting exactly where it had stalled twenty minutes earlier, one wheel twitching uselessly whenever Nisha pressed the forward button.\n\n\"It's the motor,\" Nisha said, for the third time. \"Has to be. I'm going to swap it for the spare.\"\n\nI thought she was probably right. Nisha had built more of the drivetrain than either of us, and when something electrical went wrong, it was usually the thing she guessed first. I told her to go ahead.\n\nAde didn't say anything. He picked up the whole robot, tilted it gently onto its side, and started running one finger slowly along every wire between the battery and the wheels, the way you'd check a seam for a loose thread.\n\n\"We don't have time for that,\" I said. \"Nisha's already got the spare motor out.\"\n\n\"I know,\" Ade said, not stopping. \"I'm just checking first.\"\n\nI felt a flash of irritation I wasn't proud of. Ade was careful almost to a fault, the kind of person who read every instruction twice before starting, and usually I found that reassuring rather than frustrating. Today it felt like watching someone rearrange furniture while the house was on fire.\n\nNisha had the new motor half-fitted when Ade finally spoke again. \"Found it,\" he said, quietly, holding up a single wire near the battery terminal. The connector on the end had come half loose, not fully disconnected, just loose enough that it would carry power sometimes and not others, depending on how the robot was sitting.\n\nNisha stopped, the spare motor still in her hand. \"That's not the motor at all.\"\n\n\"No,\" Ade said. He didn't sound triumphant about it, which somehow made it worse. He just reconnected the wire properly, pressed it down until it clicked, and set the robot back on its wheels.\n\nNisha pressed the forward button. The robot rolled smoothly across the workshop floor and stopped exactly where it was supposed to.\n\nNobody said anything for a moment. Then Nisha laughed, short and disbelieving. \"I was about to take the whole drivetrain apart for nothing.\"\n\n\"You weren't wrong to check the motor,\" Ade said. \"It's usually the motor. This time it wasn't.\"\n\nI looked at the clock. Sixty-eight minutes left, plenty of time now, and I found myself thinking less about the competition and more about how close we'd come to spending all of it chasing the wrong problem, because the two loudest voices in the room, mine included, had been so certain they already knew the answer.\n\n\"Next time,\" I said, \"we let Ade check the wires first.\"\n\nAde almost smiled. \"Next time,\" he said, \"check the wires first anyway.\"","acceptedAnswers":["not believing","doubtful","incredulous","skeptical"],"validationTier":"TIER2_ACCEPTED_SET"}$json$,
 'Angel English Content Foundation, Increment 002 (Decision 239). GROUPED numbered question, subpart (c). QT-RC-04, competency RC-03, family eng-inc002-qt-rc-04-roboticsfinal. See q02b''s own explanation for the shared root-cause and safety rationale.', 2, 'eng-inc002-roboticsfinal',
 'eng-inc002-qt-rc-04-roboticsfinal', 'angel_original', 'authentic_assessment_candidate', 1, true, 'Guessing a synonym from a word''s sound or a loosely related idea rather than the meaning the word actually carries in its specific sentence context.',
 'NEAR_TRANSFER'),

('eng-inc002-roboticsfinal-q02d', 'english'::public.subject_type, 'QT-RC-04', array['csse'], 'medium'::public.content_difficulty, 'short-answer', 60,
 $json${"id":"eng-inc002-roboticsfinal-q02d","marks":1,"skill":"vocabulary","question":"Question 2(d). Using the passage, write a synonym for 'triumphant', as used in 'didn't sound triumphant about it'.","modelAnswer":"Victorious/celebratory.","passageTitle":"The Loose Connection","passageText":"\"Ninety minutes,\" Mr Adeyemi said, not looking up from his watch. \"Ninety minutes until the judges call your team number, and right now your robot won't move.\"\n\nHe didn't need to tell us that. I could see it for myself: Nisha crouched over the control box with a screwdriver, Ade sitting cross-legged beside the wheels doing nothing that looked, to me, like actual work, and our robot sitting exactly where it had stalled twenty minutes earlier, one wheel twitching uselessly whenever Nisha pressed the forward button.\n\n\"It's the motor,\" Nisha said, for the third time. \"Has to be. I'm going to swap it for the spare.\"\n\nI thought she was probably right. Nisha had built more of the drivetrain than either of us, and when something electrical went wrong, it was usually the thing she guessed first. I told her to go ahead.\n\nAde didn't say anything. He picked up the whole robot, tilted it gently onto its side, and started running one finger slowly along every wire between the battery and the wheels, the way you'd check a seam for a loose thread.\n\n\"We don't have time for that,\" I said. \"Nisha's already got the spare motor out.\"\n\n\"I know,\" Ade said, not stopping. \"I'm just checking first.\"\n\nI felt a flash of irritation I wasn't proud of. Ade was careful almost to a fault, the kind of person who read every instruction twice before starting, and usually I found that reassuring rather than frustrating. Today it felt like watching someone rearrange furniture while the house was on fire.\n\nNisha had the new motor half-fitted when Ade finally spoke again. \"Found it,\" he said, quietly, holding up a single wire near the battery terminal. The connector on the end had come half loose, not fully disconnected, just loose enough that it would carry power sometimes and not others, depending on how the robot was sitting.\n\nNisha stopped, the spare motor still in her hand. \"That's not the motor at all.\"\n\n\"No,\" Ade said. He didn't sound triumphant about it, which somehow made it worse. He just reconnected the wire properly, pressed it down until it clicked, and set the robot back on its wheels.\n\nNisha pressed the forward button. The robot rolled smoothly across the workshop floor and stopped exactly where it was supposed to.\n\nNobody said anything for a moment. Then Nisha laughed, short and disbelieving. \"I was about to take the whole drivetrain apart for nothing.\"\n\n\"You weren't wrong to check the motor,\" Ade said. \"It's usually the motor. This time it wasn't.\"\n\nI looked at the clock. Sixty-eight minutes left, plenty of time now, and I found myself thinking less about the competition and more about how close we'd come to spending all of it chasing the wrong problem, because the two loudest voices in the room, mine included, had been so certain they already knew the answer.\n\n\"Next time,\" I said, \"we let Ade check the wires first.\"\n\nAde almost smiled. \"Next time,\" he said, \"check the wires first anyway.\"","acceptedAnswers":["victorious","celebratory","proud of winning","gloating"],"validationTier":"TIER2_ACCEPTED_SET"}$json$,
 'Angel English Content Foundation, Increment 002 (Decision 239). GROUPED numbered question, subpart (d). QT-RC-04, competency RC-03, family eng-inc002-qt-rc-04-roboticsfinal. See q02b''s own explanation for the shared root-cause and safety rationale.', 2, 'eng-inc002-roboticsfinal',
 'eng-inc002-qt-rc-04-roboticsfinal', 'angel_original', 'authentic_assessment_candidate', 1, true, 'Guessing a synonym from a word''s sound or a loosely related idea rather than the meaning the word actually carries in its specific sentence context.',
 'NEAR_TRANSFER'),

('eng-inc002-roboticsfinal-q02e', 'english'::public.subject_type, 'QT-RC-04', array['csse'], 'medium'::public.content_difficulty, 'short-answer', 60,
 $json${"id":"eng-inc002-roboticsfinal-q02e","marks":1,"skill":"vocabulary","question":"Question 2(e). Using the passage, write a synonym for 'uselessly', as used to describe the robot's wheel twitching.","modelAnswer":"Pointlessly/ineffectively.","passageTitle":"The Loose Connection","passageText":"\"Ninety minutes,\" Mr Adeyemi said, not looking up from his watch. \"Ninety minutes until the judges call your team number, and right now your robot won't move.\"\n\nHe didn't need to tell us that. I could see it for myself: Nisha crouched over the control box with a screwdriver, Ade sitting cross-legged beside the wheels doing nothing that looked, to me, like actual work, and our robot sitting exactly where it had stalled twenty minutes earlier, one wheel twitching uselessly whenever Nisha pressed the forward button.\n\n\"It's the motor,\" Nisha said, for the third time. \"Has to be. I'm going to swap it for the spare.\"\n\nI thought she was probably right. Nisha had built more of the drivetrain than either of us, and when something electrical went wrong, it was usually the thing she guessed first. I told her to go ahead.\n\nAde didn't say anything. He picked up the whole robot, tilted it gently onto its side, and started running one finger slowly along every wire between the battery and the wheels, the way you'd check a seam for a loose thread.\n\n\"We don't have time for that,\" I said. \"Nisha's already got the spare motor out.\"\n\n\"I know,\" Ade said, not stopping. \"I'm just checking first.\"\n\nI felt a flash of irritation I wasn't proud of. Ade was careful almost to a fault, the kind of person who read every instruction twice before starting, and usually I found that reassuring rather than frustrating. Today it felt like watching someone rearrange furniture while the house was on fire.\n\nNisha had the new motor half-fitted when Ade finally spoke again. \"Found it,\" he said, quietly, holding up a single wire near the battery terminal. The connector on the end had come half loose, not fully disconnected, just loose enough that it would carry power sometimes and not others, depending on how the robot was sitting.\n\nNisha stopped, the spare motor still in her hand. \"That's not the motor at all.\"\n\n\"No,\" Ade said. He didn't sound triumphant about it, which somehow made it worse. He just reconnected the wire properly, pressed it down until it clicked, and set the robot back on its wheels.\n\nNisha pressed the forward button. The robot rolled smoothly across the workshop floor and stopped exactly where it was supposed to.\n\nNobody said anything for a moment. Then Nisha laughed, short and disbelieving. \"I was about to take the whole drivetrain apart for nothing.\"\n\n\"You weren't wrong to check the motor,\" Ade said. \"It's usually the motor. This time it wasn't.\"\n\nI looked at the clock. Sixty-eight minutes left, plenty of time now, and I found myself thinking less about the competition and more about how close we'd come to spending all of it chasing the wrong problem, because the two loudest voices in the room, mine included, had been so certain they already knew the answer.\n\n\"Next time,\" I said, \"we let Ade check the wires first.\"\n\nAde almost smiled. \"Next time,\" he said, \"check the wires first anyway.\"","acceptedAnswers":["pointlessly","ineffectively","to no purpose","in vain"],"validationTier":"TIER2_ACCEPTED_SET"}$json$,
 'Angel English Content Foundation, Increment 002 (Decision 239). GROUPED numbered question, subpart (e). QT-RC-04, competency RC-03, family eng-inc002-qt-rc-04-roboticsfinal. See q02b''s own explanation for the shared root-cause and safety rationale.', 2, 'eng-inc002-roboticsfinal',
 'eng-inc002-qt-rc-04-roboticsfinal', 'angel_original', 'authentic_assessment_candidate', 1, true, 'Guessing a synonym from a word''s sound or a loosely related idea rather than the meaning the word actually carries in its specific sentence context.',
 'NEAR_TRANSFER')
on conflict (id) do nothing;

do $$
begin
  if exists (select 1 from public.ali_question_bank where id = 'eng-inc002-roboticsfinal-q02b' and question_group_id is null) then
    update public.ali_question_bank
    set question_group_id = 'eng-inc002-roboticsfinal-q02',
        group_order = 1,
        subpart_label = '(b)',
        marking_mode = 'deterministic'
    where id = 'eng-inc002-roboticsfinal-q02b';

    update public.ali_question_bank
    set question_group_id = 'eng-inc002-roboticsfinal-q02',
        group_order = 2,
        subpart_label = '(c)',
        marking_mode = 'deterministic'
    where id = 'eng-inc002-roboticsfinal-q02c';

    update public.ali_question_bank
    set question_group_id = 'eng-inc002-roboticsfinal-q02',
        group_order = 3,
        subpart_label = '(d)',
        marking_mode = 'deterministic'
    where id = 'eng-inc002-roboticsfinal-q02d';

    update public.ali_question_bank
    set question_group_id = 'eng-inc002-roboticsfinal-q02',
        group_order = 4,
        subpart_label = '(e)',
        marking_mode = 'deterministic'
    where id = 'eng-inc002-roboticsfinal-q02e';

    raise notice 'Migration 163: grouped-question columns populated for q02b/c/d/e.';
  else
    raise notice 'Migration 163: grouped-question columns already populated -- already applied. No changes made.';
  end if;
end $$;

-- Post-write verification (also usable as a standalone read-only check):
-- confirms the old row is gone, all 4 new rows exist with correct
-- grouping, and total marks for Question 2 remain exactly 4.
do $$
declare
  v_old_exists boolean;
  v_new_count int;
  v_total_marks int;
begin
  select exists(select 1 from public.ali_question_bank where id = 'eng-inc002-roboticsfinal-q02') into v_old_exists;
  select count(*) into v_new_count
  from public.ali_question_bank
  where id in ('eng-inc002-roboticsfinal-q02b', 'eng-inc002-roboticsfinal-q02c', 'eng-inc002-roboticsfinal-q02d', 'eng-inc002-roboticsfinal-q02e');
  select coalesce(sum((prompt ->> 'marks')::int), 0) into v_total_marks
  from public.ali_question_bank
  where id in ('eng-inc002-roboticsfinal-q02b', 'eng-inc002-roboticsfinal-q02c', 'eng-inc002-roboticsfinal-q02d', 'eng-inc002-roboticsfinal-q02e');

  if v_old_exists then
    raise exception 'Migration 163 post-write check failed: the old eng-inc002-roboticsfinal-q02 row still exists. This should be structurally impossible.';
  end if;
  if v_new_count != 4 then
    raise exception 'Migration 163 post-write check failed: expected 4 new grouped Q2 subpart rows, found %.', v_new_count;
  end if;
  if v_total_marks != 4 then
    raise exception 'Migration 163 post-write check failed: expected total marks across the 4 new subparts to be exactly 4, found %.', v_total_marks;
  end if;

  raise notice 'Migration 163: post-write verification passed -- old row gone, 4 new rows present, total marks = 4.';
end $$;

commit;

-- Read-only verification (run before and after applying):
--
-- select id, question_group_id, group_order, subpart_label, marking_mode,
--   prompt ->> 'question' as question_text, prompt -> 'acceptedAnswers' as accepted_answers,
--   (prompt ->> 'marks')::int as marks, eligibility_status, active
-- from public.ali_question_bank
-- where learning_unit_id = 'eng-inc002-roboticsfinal'
-- order by id;
