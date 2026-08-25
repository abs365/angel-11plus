-- Angel Digital 11+ — Migration 127
-- Mathematics Structural Capacity, Wave 002 — Bus Timetable Subpart (d)
-- Wording Correction (Decision 185/186, Founder production visual
-- review finding).
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS
-- ============================================================
-- Founder production review of mock-mr10-bustimetable found subpart
-- (d)'s stored question text -- "The bus company plans to speed up the
-- afternoon Hillview-to-Milltown leg by 20%..." -- permits a second,
-- mathematically valid reading ("increase speed by 20%") that does NOT
-- match the stored deterministic answer (28). Independently verified
-- this session, not merely trusted from the Founder's own report:
--   - reducing the 35-minute journey time by 20%: 35 x 0.8 = 28
--     (matches the stored answer exactly);
--   - increasing speed by 20% over the same fixed distance (time =
--     distance / speed): 35 / 1.2 = 29.1(6) minutes -- a DIFFERENT
--     value, confirmed by direct computation, not assumed.
-- The word "speed up ... by 20%" is colloquially read as "reduce the
-- time by 20%" (the intended operation) but is also a literal,
-- defensible reading of "increase the speed by 20%" (a different
-- operation, a different answer) -- a genuine ambiguity-free-wording
-- defect, corrected here to state the intended operation explicitly:
-- "reduce the afternoon Hillview-to-Milltown journey time by 20%."
--
-- ============================================================
-- SCOPE: SUBPART (d)'S QUESTION TEXT ONLY, NOTHING ELSE
-- ============================================================
-- mock-mr10-bustimetable-04 is the ONLY row this migration ever
-- targets. Only the `question` key inside its `prompt` jsonb is
-- changed -- proven, not merely asserted, by a full pre-write snapshot
-- of `prompt - 'question'` compared byte-for-byte against the live
-- value after the write. `sharedStem`, `answer` ("28"), `marks` (1),
-- `stimulus`, `workingSteps`, `skill` and every other prompt key are
-- unchanged. `content_difficulty` ('hard'), `question_group_id`
-- ('mock-mr10-bustimetable'), `group_order` (4), `subpart_label`
-- ('(d)'), `marking_mode` ('deterministic'), `family_id`, `active`, and
-- `eligibility_status` ('authentic_assessment_candidate') are all
-- re-verified unchanged as live preconditions AND post-write checks.
-- Subparts (a), (b), (c) and the entire mock-mr13-craftstall family are
-- never referenced by this migration's own executable SQL.
--
-- The corrected question text is verified, before writing, to remain
-- an exact, literal continuation of the family's own existing
-- sharedStem (unchanged) -- the same prefix relationship
-- resolveGroupSharedStem() enforces at render time -- with a non-empty
-- tail, so the Decision 180 presentation contract continues to hold
-- for this row exactly as it already does for (a)-(c).
--
-- ============================================================
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does not change answer, marks, content_difficulty, sharedStem,
-- stimulus, skill, family_id, provenance, content_version,
-- question_group_id, group_order, subpart_label, marking_mode, active,
-- or eligibility_status on any row. Does not touch subparts (a), (b),
-- or (c) of mock-mr10-bustimetable, or any row of mock-mr13-craftstall.
-- Does not touch ali_family_review (migration 128 handles the
-- correction re-review placeholder separately, under a new, distinct
-- marker -- see that migration's own header for why the SAME marker
-- cannot be reused here without misrepresenting the family as already
-- reviewed). Does not touch ali_mock_form, any RPC, RLS policy, or
-- grant. Does not promote mock-mr10-bustimetable to independently_
-- validated or mock_eligible. Does not author Wave 003.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations 125/126
-- (both confirmed applied per this session's own production evidence)
-- have already been applied.

begin;

do $$
declare
  v_old_question constant text := 'A bus company runs a route from Hillview to Oakford, stopping at Milltown and Riverside. The timetable below shows the morning and afternoon journey times. The bus company plans to speed up the afternoon Hillview-to-Milltown leg by 20%. How many minutes should the new afternoon Hillview-to-Milltown leg take?';
  v_new_question constant text := 'A bus company runs a route from Hillview to Oakford, stopping at Milltown and Riverside. The timetable below shows the morning and afternoon journey times. The bus company plans to reduce the afternoon Hillview-to-Milltown journey time by 20%. How many minutes should the new journey take?';
  v_shared_stem constant text := 'A bus company runs a route from Hillview to Oakford, stopping at Milltown and Riverside. The timetable below shows the morning and afternoon journey times.';
  v_pending_old_count int;
  v_already_corrected_count int;
  v_precondition_count int;
  v_post_write_count int;
  v_post_write_preserved_count int;
  v_post_write_structural_count int;
begin
  -- Structural exclusion proof: only this one row is ever referenced.
  if not (v_new_question like (v_shared_stem || '%')) then
    raise exception 'Migration 127 refused: the corrected question text does not begin with the family''s own sharedStem -- refusing to write text that would fail resolveGroupSharedStem()''s own prefix check.';
  end if;

  select count(*) into v_pending_old_count
    from public.ali_question_bank
    where id = 'mock-mr10-bustimetable-04'
      and (prompt->>'question') = v_old_question;

  select count(*) into v_already_corrected_count
    from public.ali_question_bank
    where id = 'mock-mr10-bustimetable-04'
      and (prompt->>'question') = v_new_question;

  -- Live preconditions, checked regardless of branch, so drift in any
  -- other field is caught before this migration ever writes anything.
  select count(*) into v_precondition_count
    from public.ali_question_bank
    where id = 'mock-mr10-bustimetable-04'
      and family_id = 'mock-mr10-bustimetable'
      and subject = 'maths'
      and skill = 'QT-MR-10'
      and active = true
      and eligibility_status = 'authentic_assessment_candidate'
      and marking_mode = 'deterministic'
      and content_difficulty = 'hard'
      and question_group_id = 'mock-mr10-bustimetable'
      and group_order = 4
      and subpart_label = '(d)'
      and (prompt->>'answer') = '28'
      and (prompt->>'marks')::numeric = 1
      and (prompt->>'sharedStem') = v_shared_stem;
  if v_precondition_count <> 1 then
    raise exception 'Migration 127 refused: mock-mr10-bustimetable-04 does not match the expected family/grouping/marks/answer/difficulty/sharedStem preconditions (found %). Re-verify production state before proceeding.', v_precondition_count;
  end if;

  if v_pending_old_count = 1 then
    create temporary table tmp_bustimetable_04_snapshot (id text primary key, prompt_without_question jsonb not null) on commit drop;
    insert into tmp_bustimetable_04_snapshot (id, prompt_without_question)
      select id, prompt - 'question' from public.ali_question_bank where id = 'mock-mr10-bustimetable-04';

    update public.ali_question_bank
    set prompt = jsonb_set(prompt, '{question}', to_jsonb(v_new_question))
    where id = 'mock-mr10-bustimetable-04'
      and (prompt->>'question') = v_old_question;

    select count(*) into v_post_write_count
      from public.ali_question_bank
      where id = 'mock-mr10-bustimetable-04' and (prompt->>'question') = v_new_question;
    if v_post_write_count <> 1 then
      raise exception 'Migration 127 post-write verification failed: expected mock-mr10-bustimetable-04 to now carry the corrected question text. Rolling back.';
    end if;

    select count(*) into v_post_write_preserved_count
      from public.ali_question_bank b
      join tmp_bustimetable_04_snapshot s on b.id = s.id
      where (b.prompt - 'question') = s.prompt_without_question;
    if v_post_write_preserved_count <> 1 then
      raise exception 'Migration 127 post-write preservation check failed: every other prompt key (answer, marks, sharedStem, stimulus, workingSteps, skill, id) must remain byte-for-byte unchanged. Rolling back.';
    end if;

    select count(*) into v_post_write_structural_count
      from public.ali_question_bank
      where id = 'mock-mr10-bustimetable-04'
        and family_id = 'mock-mr10-bustimetable'
        and active = true
        and eligibility_status = 'authentic_assessment_candidate'
        and marking_mode = 'deterministic'
        and content_difficulty = 'hard'
        and question_group_id = 'mock-mr10-bustimetable'
        and group_order = 4
        and subpart_label = '(d)';
    if v_post_write_structural_count <> 1 then
      raise exception 'Migration 127 post-write structural verification failed: family_id/active/eligibility_status/marking_mode/content_difficulty/grouping drifted unexpectedly. Rolling back.';
    end if;

    raise notice 'Migration 127: corrected mock-mr10-bustimetable-04''s question wording from an ambiguous "speed up...by 20%" phrasing to an unambiguous "reduce...journey time by 20%" phrasing. Answer (28), marks (1), difficulty (hard), sharedStem, stimulus, and every grouping field proven byte-for-byte unchanged. No other row touched.';

  elsif v_already_corrected_count = 1 then
    raise notice 'Migration 127: mock-mr10-bustimetable-04 already carries the corrected question text -- already applied. No changes made.';

  else
    raise exception
      'Migration 127 refused: mock-mr10-bustimetable-04''s stored question text matches neither the expected pre-correction wording (found %) nor the expected post-correction wording (found %). Re-verify production state before proceeding.',
      v_pending_old_count, v_already_corrected_count;
  end if;
end $$;

commit;
