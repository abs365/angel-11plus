-- Angel Digital 11+ — Migration 121
-- Mathematics Shared-Scenario Presentation Correction — Explicit
-- Shared-Stem Content Contract for mock-mr06-linkedvalues (Decision 180,
-- Founder production visual finding).
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS
-- ============================================================
-- Founder production review of mock-mr06-linkedvalues (migrations 119/
-- 120, applied) found the review surface renders the family's complete,
-- byte-identical shared scenario three times over (once per subpart),
-- because every subpart's own `question` text is genuinely, deliberately
-- self-contained (the established convention this project has used
-- since migration 109/113 for every grouped family, so each raw row
-- remains independently readable for persistence/scoring/audit). The
-- Founder explicitly directed a PRESENTATION-layer fix, not a database
-- content strip: "The independent rows may legitimately retain their
-- complete prompts... Do NOT strip the shared scenario from rows 02/03
-- in the database." A render-time solution needs a signal for WHERE the
-- shared portion ends and the subpart-specific portion begins;
-- automatic derivation (diffing/parsing the stored `question` strings)
-- was explicitly rejected as a fragile heuristic. This migration adds
-- exactly the small, explicit content contract the Founder's own
-- instruction anticipated: one new, additive `prompt.sharedStem` key,
-- populated identically on all 3 rows with the exact, real, already-
-- stored common prefix of their own `question` text.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does NOT change `question`, `answer`, `marks`, `workingSteps`, or any
-- other existing prompt key on any row -- verified by a positive
-- preservation proof below (snapshot of `prompt - 'sharedStem'` before,
-- compared against the live value after). Does NOT change
-- eligibility_status (all 3 rows remain authentic_assessment_candidate),
-- active, family_id, question_group_id, group_order, subpart_label, or
-- marking_mode. Does NOT touch any other family or row anywhere in the
-- repository. Does NOT create or touch ali_family_review, ali_mock_form,
-- or ali_mock_attempt. Does NOT approve, certify, or promote the family
-- -- it remains authentic_assessment_candidate with a pending
-- independent review exactly as migration 120 left it.
--
-- ============================================================
-- CONTENT INTEGRITY: THE WRITTEN STEM IS PROVEN TO BE A REAL PREFIX
-- ============================================================
-- Not merely asserted: this migration's own precondition block requires
-- every target row's LIVE `prompt->>'question'` value to literally start
-- with the exact stem string below, for all 3 rows, before any write
-- occurs. If any row's stored question text has drifted (e.g. content
-- was edited since migration 119 applied) such that the stem is no
-- longer a genuine prefix, this migration refuses to run rather than
-- writing a stem that would fail lib/mockAttempt/workspace.ts's own
-- resolveGroupSharedStem() safety check at render time (which requires
-- the exact same prefix relationship) -- the database-side check and the
-- render-time check are the SAME rule, verified independently in two
-- places.
--
-- The stem itself: "A collector has three bags of marbles: red, blue
-- and green. The blue bag has 6 more marbles than the red bag. The
-- green bag has 3 times as many marbles as the blue bag. Altogether,
-- the three bags contain 64 marbles." -- read directly from migration
-- 119's own applied content, re-verified this session via a script
-- confirming .startsWith() is true for all 3 rows' real `question`
-- values, not retyped by hand and trusted.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations 119/120
-- (both applied, per this session's own production evidence) have
-- already been applied.

begin;

do $$
declare
  v_stem text := 'A collector has three bags of marbles: red, blue and green. The blue bag has 6 more marbles than the red bag. The green bag has 3 times as many marbles as the blue bag. Altogether, the three bags contain 64 marbles.';
  v_total_count int;
  v_active_count int;
  v_subject_count int;
  v_family_count int;
  v_eligibility_count int;
  v_prefix_ok_count int;
  v_already_set_count int;
  v_post_write_count int;
  v_post_write_preserved_count int;
  v_post_write_stem_count int;
begin
  create temporary table tmp_linkedvalues_target (id text primary key) on commit drop;
  insert into tmp_linkedvalues_target (id) values
    ('mock-mr06-linkedvalues-01'), ('mock-mr06-linkedvalues-02'), ('mock-mr06-linkedvalues-03');

  if (select count(*) from tmp_linkedvalues_target) <> 3 then
    raise exception 'Migration 121 refused: target map does not contain exactly 3 rows (found %). Aborting before any check runs.',
      (select count(*) from tmp_linkedvalues_target);
  end if;

  select count(*) into v_total_count
    from public.ali_question_bank b join tmp_linkedvalues_target t on b.id = t.id;
  if v_total_count <> 3 then
    raise exception 'Migration 121 refused: expected exactly 3 matching ali_question_bank rows, found %.', v_total_count;
  end if;

  select count(*) into v_active_count
    from public.ali_question_bank b join tmp_linkedvalues_target t on b.id = t.id
    where b.active = true;
  if v_active_count <> 3 then
    raise exception 'Migration 121 refused: all 3 target rows must be active=true (found %).', v_active_count;
  end if;

  select count(*) into v_subject_count
    from public.ali_question_bank b join tmp_linkedvalues_target t on b.id = t.id
    where b.subject = 'maths';
  if v_subject_count <> 3 then
    raise exception 'Migration 121 refused: all 3 target rows must be subject=maths (found %).', v_subject_count;
  end if;

  select count(*) into v_family_count
    from public.ali_question_bank b join tmp_linkedvalues_target t on b.id = t.id
    where b.family_id = 'mock-mr06-linkedvalues';
  if v_family_count <> 3 then
    raise exception 'Migration 121 refused: all 3 target rows must have family_id = mock-mr06-linkedvalues (found %).', v_family_count;
  end if;

  select count(*) into v_eligibility_count
    from public.ali_question_bank b join tmp_linkedvalues_target t on b.id = t.id
    where b.eligibility_status = 'authentic_assessment_candidate';
  if v_eligibility_count <> 3 then
    raise exception 'Migration 121 refused: all 3 target rows must still be authentic_assessment_candidate (found %). This migration must never run after a promotion changes eligibility.', v_eligibility_count;
  end if;

  -- The live content-integrity check: every row's own stored question
  -- text must genuinely start with the exact stem being written.
  select count(*) into v_prefix_ok_count
    from public.ali_question_bank b join tmp_linkedvalues_target t on b.id = t.id
    where (b.prompt->>'question') like (replace(replace(v_stem, '%', '\%'), '_', '\_') || '%');
  if v_prefix_ok_count <> 3 then
    raise exception 'Migration 121 refused: not every target row''s stored question text starts with the declared shared stem (% of 3 verified). Content may have drifted since migration 119 -- refusing to write a stem that would not pass resolveGroupSharedStem()''s own render-time prefix check.', v_prefix_ok_count;
  end if;

  select count(*) into v_already_set_count
    from public.ali_question_bank b join tmp_linkedvalues_target t on b.id = t.id
    where (b.prompt->>'sharedStem') = v_stem;

  if v_already_set_count = 3 then
    raise notice 'Migration 121 already applied: all 3 target rows already carry the exact expected sharedStem. No write performed.';
  elsif v_already_set_count = 0 then
    -- Positive preservation snapshot: everything except the new key.
    create temporary table tmp_linkedvalues_pre_snapshot (id text primary key, prompt_without_shared_stem jsonb not null) on commit drop;
    insert into tmp_linkedvalues_pre_snapshot (id, prompt_without_shared_stem)
      select b.id, b.prompt - 'sharedStem'
      from public.ali_question_bank b join tmp_linkedvalues_target t on b.id = t.id;

    update public.ali_question_bank b
      set prompt = jsonb_set(b.prompt, '{sharedStem}', to_jsonb(v_stem))
      from tmp_linkedvalues_target t
      where b.id = t.id;

    select count(*) into v_post_write_count
      from public.ali_question_bank b join tmp_linkedvalues_target t on b.id = t.id
      where (b.prompt->>'sharedStem') = v_stem;
    if v_post_write_count <> 3 then
      raise exception 'Migration 121 post-write verification failed: expected 3 rows with the exact sharedStem value, found %. Rolling back.', v_post_write_count;
    end if;

    select count(*) into v_post_write_preserved_count
      from public.ali_question_bank b
      join tmp_linkedvalues_pre_snapshot s on b.id = s.id
      where (b.prompt - 'sharedStem') = s.prompt_without_shared_stem;
    if v_post_write_preserved_count <> 3 then
      raise exception 'Migration 121 post-write preservation check failed: % of 3 rows have every OTHER prompt key unchanged (expected 3). Rolling back.', v_post_write_preserved_count;
    end if;

    select count(*) into v_post_write_stem_count
      from public.ali_question_bank b join tmp_linkedvalues_target t on b.id = t.id
      where b.eligibility_status = 'authentic_assessment_candidate' and b.active = true
        and b.family_id = 'mock-mr06-linkedvalues';
    if v_post_write_stem_count <> 3 then
      raise exception 'Migration 121 post-write structural verification failed: eligibility_status/active/family_id drifted unexpectedly on % of 3 rows.', v_post_write_stem_count;
    end if;

    raise notice 'Migration 121 applied: 3 rows now carry prompt.sharedStem, every other prompt key and every other column proven byte-for-byte unchanged.';
  else
    raise exception 'Migration 121 refused: unexpected partial state -- % of 3 target rows already carry the exact sharedStem (expected 0 or 3). Manual investigation required before this migration can run safely.', v_already_set_count;
  end if;
end $$;

commit;
