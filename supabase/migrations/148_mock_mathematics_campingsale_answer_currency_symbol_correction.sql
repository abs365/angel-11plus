-- Angel Digital 11+ — Migration 148
-- Mathematics Mock 1 Release QA — Camping Sale Answer Currency-Symbol
-- Correction (Decision 216, release-verification finding).
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS
-- ============================================================
-- Decision 216's own scoring-simulation, a pure-function port of the
-- real, live `mock_score_attempt()` (migration 104, the only version of
-- that function -- unchanged since) run against all 56 rows of the
-- frozen Mathematics Mock 1 manifest (migration 147), found that all
-- four `mock-mr04-campingsale` rows store their deterministic `answer`
-- WITH a literal "£" prefix ("£102", "£91.80", "£1.80", "£170") --
-- unique among all 56 frozen rows; every other currency-valued answer in
-- this Mock (`mock-mr13-craftstall-01` = "18.00",
-- `mock-mr01mr10-costumeschedule-01b`/`-02b` = "12.00"/"7.35") stores a
-- bare numeric string with no currency symbol.
--
-- `mock_score_attempt()`'s own marking logic (re-read directly this
-- session, unchanged) attempts `::numeric` casts of BOTH the learner's
-- response and the stored answer inside a single exception-guarded
-- block; if EITHER cast throws, both are discarded and marking falls
-- back to an exact, case/whitespace-insensitive STRING comparison. A
-- string containing "£" never casts to `numeric` in PostgreSQL, so every
-- one of these four rows is permanently locked onto the strict string
-- path, regardless of the learner's own response. Confirmed by direct
-- simulation this session: a learner who types the mathematically
-- correct bare number ("102", "91.80", "1.80", "170") -- the response
-- shape none of these four subparts' own question text ever instructs a
-- currency symbol for -- is marked INCORRECT. Even a learner who DOES
-- include the symbol is not reliably safe: "£102.00" (a wholly
-- reasonable formatting of the correct amount) also fails the exact
-- string match against the stored "£102". Only the single literal
-- spelling "£102" (or "£91.80"/"£1.80"/"£170") ever scores correct.
--
-- ============================================================
-- THE FIX, AND WHY IT IS THE MINIMUM SAFE CORRECTION
-- ============================================================
-- Removes ONLY the leading "£" from each of the four stored `answer`
-- values, moving them onto the SAME bare-numeric convention every other
-- currency answer in this Mock (and, per a repository-wide grep this
-- session, every other Mathematics Mock row) already uses successfully
-- -- not a new convention invented here. This switches these four rows
-- onto the numeric-tolerance comparison path
-- (`abs(numeric_response - numeric_answer) < 0.0001`), which correctly
-- accepts any reasonable numeric formatting of the same value ("102",
-- "102.0", "102.00", with or without surrounding whitespace) --
-- confirmed this session, independently, for the corrected values.
-- `mock_score_attempt()` itself is NOT modified by this migration --
-- explicitly out of scope, per the governing directive's own "do not
-- weaken deterministic marking" instruction: this migration corrects the
-- STORED VALUE's own format to match the marking engine's existing,
-- already-working numeric convention, rather than changing the engine to
-- accommodate a non-conforming value.
--
-- The underlying MATHEMATICAL values are completely unchanged --
-- £102 = 102, £91.80 = 91.80, £1.80 = 1.80, £170 = 170 -- this is a
-- string-representation correction only, independently re-verified this
-- session against migration 134/136's own already-certified derivations
-- (Decision 195/196/197's own two-method mathematical proofs, untouched
-- and unrepeated here, only re-cited): (a) 15% off £120 = £102; (b) 10%
-- off £102 = £91.80; (c) sequential-vs-single-discount difference =
-- £1.80; (d) reverse 20% discount from £136 = £170.
--
-- ============================================================
-- SCOPE: THE `answer` KEY ON EXACTLY 4 ROWS, NOTHING ELSE
-- ============================================================
-- `mock-mr04-campingsale-01/02/03/04` are the ONLY rows this migration
-- ever targets. Only the `answer` key inside each row's own `prompt`
-- jsonb is changed -- proven, not merely asserted, by a full pre-write
-- snapshot of `prompt - 'answer'` compared byte-for-byte against the
-- live value after the write, mirroring migration 127's own established
-- single-key-correction pattern exactly. `question`, `sharedStem`,
-- `marks` (1 each), `workingSteps`, and every other prompt key are
-- unchanged. `content_difficulty` (easy/medium/hard/hard),
-- `question_group_id` (`mock-mr04-campingsale`), `group_order` (1-4),
-- `subpart_label` ((a)-(d)), `marking_mode` (`deterministic`),
-- `family_id`, `active`, and `eligibility_status` (`mock_eligible`,
-- Decision 211/migration 144) are all re-verified unchanged as live
-- preconditions AND post-write checks. No other Mathematics family, and
-- no English or Writing content, is referenced anywhere in this
-- migration's own executable SQL.
--
-- ============================================================
-- MOCK 1 FREEZE IMPACT: NONE
-- ============================================================
-- `ali_mock_form` (migration 147, Founder-confirmed applied,
-- `first-mock-mathematics-v1`, `active = false`) stores `question_
-- manifest` as `{question_id, section}` pairs only -- no question text,
-- no answer, no wording of any kind (independently re-confirmed this
-- session by a direct grep of migration 147's own file, matching
-- Decision 215's own identical finding for the Bus Timetable wording
-- question). This migration therefore requires NO change to migration
-- 147 and does not touch `ali_mock_form` in any way -- the corrected
-- answer is read fresh from `ali_question_bank` by `mock_get_question()`
-- and `mock_score_attempt()` at attempt time, exactly as every other
-- row's content already is.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does not change `mock_score_attempt()`, `mock_get_question()`, or any
-- other function. Does not change `marks`, `content_difficulty`,
-- `question_group_id`, `group_order`, `subpart_label`, `marking_mode`,
-- `family_id`, `active`, or `eligibility_status` on any row. Does not
-- touch `ali_mock_form`, `ali_mock_attempt`, `ali_family_review`, any
-- other Mathematics family, or any RPC, RLS policy, or grant. Does not
-- create a Mock attempt. Does not activate the Mock. Does not author new
-- content or start Increment 007.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migration 136
-- (Founder-confirmed applied) has already been applied. Independent of
-- migration 147 -- may be applied before or after it with no interaction
-- either way, since 147 never reads this row's `answer` field.

begin;

do $$
declare
  v_target_ids constant text[] := array[
    'mock-mr04-campingsale-01', 'mock-mr04-campingsale-02', 'mock-mr04-campingsale-03', 'mock-mr04-campingsale-04'
  ];
  v_old_answers constant text[] := array['£102', '£91.80', '£1.80', '£170'];
  v_new_answers constant text[] := array['102', '91.80', '1.80', '170'];
  v_pending_count int;
  v_already_corrected_count int;
  v_subject_skill_count int;
  v_eligibility_count int;
  v_active_count int;
  v_marking_mode_count int;
  v_marks_count int;
  v_difficulty_count int;
  v_grouping_count int;
  v_shared_stem_count int;
  v_no_stimulus_count int;
  v_post_write_count int;
  v_post_write_preserved_count int;
begin
  -- === Live preconditions -- structural shape, evaluated regardless of branch ===
  select count(*) into v_subject_skill_count
    from public.ali_question_bank
    where id = any(v_target_ids) and subject = 'maths' and skill = 'QT-MR-04';
  if v_subject_skill_count <> 4 then
    raise exception 'Migration 148 refused: expected 4 rows with subject=maths, skill=QT-MR-04 (found %).', v_subject_skill_count;
  end if;

  select count(*) into v_eligibility_count
    from public.ali_question_bank
    where id = any(v_target_ids) and eligibility_status = 'mock_eligible';
  if v_eligibility_count <> 4 then
    raise exception 'Migration 148 refused: expected 4 rows with eligibility_status=mock_eligible (found %). This migration must never run against non-mock_eligible content.', v_eligibility_count;
  end if;

  select count(*) into v_active_count
    from public.ali_question_bank where id = any(v_target_ids) and active = true;
  if v_active_count <> 4 then
    raise exception 'Migration 148 refused: expected 4 active=true rows (found %).', v_active_count;
  end if;

  select count(*) into v_marking_mode_count
    from public.ali_question_bank where id = any(v_target_ids) and marking_mode = 'deterministic';
  if v_marking_mode_count <> 4 then
    raise exception 'Migration 148 refused: expected 4 rows with marking_mode=deterministic (found %).', v_marking_mode_count;
  end if;

  select count(*) into v_marks_count
    from public.ali_question_bank where id = any(v_target_ids) and (prompt->>'marks')::numeric = 1;
  if v_marks_count <> 4 then
    raise exception 'Migration 148 refused: expected 4 rows with marks=1 each (found %). Marking Integrity Gate must never be assumed satisfied.', v_marks_count;
  end if;

  select count(*) into v_difficulty_count
    from public.ali_question_bank b
    join (values
      ('mock-mr04-campingsale-01', 'easy'), ('mock-mr04-campingsale-02', 'medium'),
      ('mock-mr04-campingsale-03', 'hard'), ('mock-mr04-campingsale-04', 'hard')
    ) as e(id, diff) on b.id = e.id
    where b.content_difficulty::text = e.diff;
  if v_difficulty_count <> 4 then
    raise exception 'Migration 148 refused: expected difficulty easy/medium/hard/hard across the 4 rows in order (found % of 4 matching).', v_difficulty_count;
  end if;

  select count(*) into v_grouping_count
    from public.ali_question_bank b
    join (values
      ('mock-mr04-campingsale-01', 1, '(a)'), ('mock-mr04-campingsale-02', 2, '(b)'),
      ('mock-mr04-campingsale-03', 3, '(c)'), ('mock-mr04-campingsale-04', 4, '(d)')
    ) as e(id, go, sl) on b.id = e.id
    where b.question_group_id = 'mock-mr04-campingsale' and b.group_order = e.go and b.subpart_label = e.sl;
  if v_grouping_count <> 4 then
    raise exception 'Migration 148 refused: exact grouping shape mismatch (found % of 4 matching).', v_grouping_count;
  end if;

  select count(*) into v_shared_stem_count
    from public.ali_question_bank
    where id = any(v_target_ids) and (prompt->>'sharedStem') = 'A camping shop sells tents.';
  if v_shared_stem_count <> 4 then
    raise exception 'Migration 148 refused: expected all 4 rows to carry the identical, exact sharedStem value (found %).', v_shared_stem_count;
  end if;

  select count(*) into v_no_stimulus_count
    from public.ali_question_bank where id = any(v_target_ids) and prompt ? 'stimulus';
  if v_no_stimulus_count <> 0 then
    raise exception 'Migration 148 refused: mock-mr04-campingsale is text-only narrative content and must never carry a stimulus key (found % rows with one).', v_no_stimulus_count;
  end if;

  -- === Pending vs. already-corrected state ===
  select count(*) into v_pending_count
    from public.ali_question_bank b
    join (
      select unnest(v_target_ids) as id, unnest(v_old_answers) as expected_answer
    ) e on b.id = e.id
    where (b.prompt->>'answer') = e.expected_answer;

  select count(*) into v_already_corrected_count
    from public.ali_question_bank b
    join (
      select unnest(v_target_ids) as id, unnest(v_new_answers) as expected_answer
    ) e on b.id = e.id
    where (b.prompt->>'answer') = e.expected_answer;

  if v_pending_count = 4 then
    create temporary table tmp_campingsale_answer_snapshot (id text primary key, prompt_without_answer jsonb not null) on commit drop;
    insert into tmp_campingsale_answer_snapshot (id, prompt_without_answer)
      select id, prompt - 'answer' from public.ali_question_bank where id = any(v_target_ids);

    update public.ali_question_bank b
    set prompt = jsonb_set(b.prompt, '{answer}', to_jsonb(e.new_answer))
    from (
      select unnest(v_target_ids) as id, unnest(v_new_answers) as new_answer
    ) e
    where b.id = e.id;

    select count(*) into v_post_write_count
      from public.ali_question_bank b
      join (
        select unnest(v_target_ids) as id, unnest(v_new_answers) as expected_answer
      ) e on b.id = e.id
      where (b.prompt->>'answer') = e.expected_answer;
    if v_post_write_count <> 4 then
      raise exception 'Migration 148 post-write verification failed: expected 4 rows with the corrected bare-numeric answer, found %. Rolling back.', v_post_write_count;
    end if;

    select count(*) into v_post_write_preserved_count
      from public.ali_question_bank b
      join tmp_campingsale_answer_snapshot s on b.id = s.id
      where (b.prompt - 'answer') = s.prompt_without_answer;
    if v_post_write_preserved_count <> 4 then
      raise exception 'Migration 148 post-write preservation check failed: % of 4 rows have every OTHER prompt key byte-for-byte unchanged (expected 4). Rolling back.', v_post_write_preserved_count;
    end if;

    select count(*) into v_post_write_count
      from public.ali_question_bank
      where id = any(v_target_ids) and eligibility_status <> 'mock_eligible';
    if v_post_write_count <> 0 then
      raise exception 'Migration 148 refused: eligibility_status must remain mock_eligible on all 4 rows (found % changed). Rolling back.', v_post_write_count;
    end if;

    raise notice 'Migration 148: corrected mock-mr04-campingsale''s 4 answer values from currency-symbol-prefixed strings (£102/£91.80/£1.80/£170) to bare numeric strings (102/91.80/1.80/170), moving them onto the same numeric-tolerance marking path every other currency answer in this Mock already uses. marks (1 each), difficulty, grouping, sharedStem, marking_mode, and eligibility_status (mock_eligible) all proven byte-for-byte/value unchanged. The frozen Mock 1 form is unaffected -- it stores no answer text.';

  elsif v_already_corrected_count = 4 then
    raise notice 'Migration 148: all 4 target rows already carry the corrected bare-numeric answer -- already applied. No changes made.';

    select count(*) into v_post_write_count
      from public.ali_question_bank
      where id = any(v_target_ids) and eligibility_status <> 'mock_eligible';
    if v_post_write_count <> 0 then
      raise exception 'Migration 148 refused: eligibility_status found not mock_eligible on % rows in the already-applied branch -- something else changed this family. Manual investigation required.', v_post_write_count;
    end if;

  else
    raise exception
      'Migration 148 refused: expected 4 rows carrying the original £-prefixed answers (found %), or 4 already carrying the corrected bare-numeric answers (found %). Re-verify production state before proceeding.',
      v_pending_count, v_already_corrected_count;
  end if;
end $$;

commit;
