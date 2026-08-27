-- Angel Digital 11+ — Migration 144
-- Mathematics First Mock — Useful Certified Reserve Promotion to
-- Mock Eligible (Decision 210, commit 2140475, Founder-directed Option C).
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS
-- ============================================================
-- Decision 210's own Part 6/Part 10/Part 12 findings: with the First Mock
-- composition ceiling now at 54/56 marks (20/21 questions) against an
-- authentic ~58-60-mark target -- the narrowest deficit recorded in this
-- arc -- composition, not further authoring, is the binding next step,
-- and composition cannot legitimately draw on `independently_validated`
-- reserve content without first promoting it: `eligibility_status =
-- 'mock_eligible'` is this codebase's own intended authorization boundary
-- for Mock content (migration 070's own header), and relying on the
-- manifest alone (mock_create_attempt()'s disclosed, unenforced
-- boundary, Decision 210 Part 7) instead of the intended eligibility gate
-- would repeat exactly the "convention, not structure" defect class
-- Decision 59 closed elsewhere in this programme.
--
-- Promotes exactly the SIX Decision-210-authorised Mathematics reserve
-- families -- 22 rows, 22 marks, 6 numbered-question experiences -- from
-- eligibility_status 'independently_validated' to 'mock_eligible':
--   1. mock-mr10-bustimetable   (4 rows, migration 129)
--   2. mock-mr13-craftstall     (3 rows, migration 130)
--   3. mock-mr09-funrun         (4 rows, migration 133)
--   4. mock-mr04-campingsale    (4 rows, migration 136)
--   5. mock-mr06-numberpuzzle   (3 rows, migration 139)
--   6. mock-mr11-roundingbounds (4 rows, migration 142)
-- 4+3+4+4+3+4 = 22, matching Decision 210's own re-derived reserve table
-- exactly (not merely the aggregate this task's own instruction states --
-- independently reconstructed from each family's own source migration
-- this session, see the per-family structural preconditions below).
--
-- ============================================================
-- CERTIFICATION PREREQUISITE, NOT SUBSTITUTED
-- ============================================================
-- Each of the six families already passed its own live, Founder-reviewed
-- independent-validation certification (migrations 129/130/133/136/139/
-- 142 respectively) -- each of those migrations' own fail-closed
-- precondition required a real, live, matching APPROVED ali_family_review
-- row (reviewer Ayobami Lawal, review_type mock_maths_independent_review,
-- family-specific marker) before it would write anything, and each is
-- Founder-confirmed applied in production. This migration's own
-- precondition below (eligibility_status = 'independently_validated')
-- is the structural proof that certification already happened -- exactly
-- the same convention migration 105 (the original pool-eligible
-- promotion) established: a promotion migration re-verifies
-- eligibility_status and full row-level structural shape, but does not
-- re-query ali_family_review a second time, because independent
-- validation is not this migration's own gate to re-run, only to trust
-- as an already-proven precondition. Promotion is a separate lifecycle
-- transition AFTER independent validation, never a substitute for it.
--
-- ============================================================
-- EXPLICIT EXCLUSION: mock-mr03mr07-perimeterarea
-- ============================================================
-- Decision 210 Part 3/Part 6 reconfirmed a fifth consecutive time that
-- Perimeter Area contributes zero marginal composition value under the
-- current First Mock constraints (2 experiences of 2 marks each,
-- displacing 2 displaced 2-mark fillers 1-for-1 under the established
-- swap mechanic) and recommended HOLD-IN-RESERVE, not promotion. This
-- migration's own target array never includes it, and a live guard
-- below both refuses to proceed if it is ever found anywhere in the
-- target array (defence-in-depth against a future copy/paste error) and
-- positively re-verifies, pre-write and post-write, that all 4 of its
-- rows remain 'independently_validated', untouched. Its `explanation`
-- field (corrected by migration 143) is never referenced here.
--
-- ============================================================
-- CONTENT IMMUTABILITY
-- ============================================================
-- No prompt key (question, answer, marks, sharedStem, stimulus,
-- workingSteps, skill, or any other), content_difficulty, family_id,
-- provenance, content_version, question_group_id, group_order,
-- subpart_label, marking_mode, or active state is changed on any of the
-- 22 target rows. Only eligibility_status moves. Proven, not merely
-- asserted: this migration snapshots each target row's own COMPLETE
-- `prompt` value before any write, then re-reads and compares it
-- byte-for-byte after, across all 22 rows at once.
--
-- ============================================================
-- ATOMIC FAMILY PRESERVATION
-- ============================================================
-- A single UPDATE statement, inside a single transaction, targets all 22
-- rows at once -- Postgres transactional atomicity makes a partial
-- promotion (some rows of a family moved, others left behind)
-- structurally impossible: either the whole statement commits (all 22
-- rows promoted) or the whole migration raises an exception and nothing
-- is written. This is additionally, positively proven post-write below:
-- for each of the six families, the count of its own rows now
-- mock_eligible is re-checked against that family's own full row count
-- (4, 3, 4, 4, 3, 4) -- never a partial number.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does not touch mock-mr03mr07-perimeterarea, mock-mr06-linkedvalues, or
-- any other Mathematics family. Does not touch English or Writing
-- content, or Practice. Does not insert, update, or delete any
-- ali_family_review row. Does not create, modify, or reference
-- ali_mock_form in any way. Does not call or reference
-- mock_create_attempt() or any other RPC. Does not create, alter, or
-- drop any RLS policy or grant. Does not author, modify, or reclassify
-- any question content. Does not begin First Mock composition. Does not
-- start Increment 007.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations 129,
-- 130, 133, 136, 139, and 142 (all Founder-confirmed applied) have
-- already been applied.

begin;

do $$
declare
  v_target_ids constant text[] := array[
    -- Bus Timetable (4)
    'mock-mr10-bustimetable-01', 'mock-mr10-bustimetable-02', 'mock-mr10-bustimetable-03', 'mock-mr10-bustimetable-04',
    -- Craft Stall (3)
    'mock-mr13-craftstall-01', 'mock-mr13-craftstall-02', 'mock-mr13-craftstall-03',
    -- Fun Run (4)
    'mock-mr09-funrun-01', 'mock-mr09-funrun-02', 'mock-mr09-funrun-03', 'mock-mr09-funrun-04',
    -- Camping Sale (4)
    'mock-mr04-campingsale-01', 'mock-mr04-campingsale-02', 'mock-mr04-campingsale-03', 'mock-mr04-campingsale-04',
    -- Number Puzzle (3)
    'mock-mr06-numberpuzzle-01', 'mock-mr06-numberpuzzle-02', 'mock-mr06-numberpuzzle-03',
    -- Rounding Bounds (4)
    'mock-mr11-roundingbounds-01', 'mock-mr11-roundingbounds-02', 'mock-mr11-roundingbounds-03', 'mock-mr11-roundingbounds-04'
  ];
  v_bustimetable_stem constant text := 'A bus company runs a route from Hillview to Oakford, stopping at Milltown and Riverside. The timetable below shows the morning and afternoon journey times.';
  v_craftstall_stem constant text := 'A craft fair stall sells keyrings, bracelets and stickers. Keyrings are sold in packs of 5 for £2.00 each pack. Bracelets are sold individually for £1.20 each. Stickers are sold in packs of 8 for £1.60 each pack.';
  v_funrun_stem constant text := 'Riverside Primary School held a sponsored fun run. The table below shows how many laps each runner completed.';
  v_campingsale_stem constant text := 'A camping shop sells tents.';
  v_numberpuzzle_stem constant text := 'A number puzzle uses a hidden positive whole number, n. Three other values are defined by these rules: P = n + 9, Q = 9 x n, and R = n x n.';
  v_roundingbounds_stem constant text := 'At the Oakwood Athletics Meet, the number of adult spectators rounds to 380 to the nearest 10. The number of child spectators rounds to 240 to the nearest 10.';
  v_pending_count int;
  v_already_mock_eligible_count int;
  v_array_length int;
  v_distinct_family_count int;
  v_active_count int;
  v_marking_mode_count int;
  v_marks_count int;
  v_pre_mock_eligible_total int;
  v_post_mock_eligible_total int;
  v_perimeterarea_count int;
  v_family_count int;
  v_post_write_count int;
  v_post_write_preserved_count int;
begin
  -- === Array shape guards: exactly 22, no duplicates, exactly 6 families ===
  v_array_length := array_length(v_target_ids, 1);
  if v_array_length <> 22 then
    raise exception 'Migration 144 refused: expected exactly 22 target IDs, found %.', v_array_length;
  end if;
  if (select count(distinct t) from unnest(v_target_ids) t) <> 22 then
    raise exception 'Migration 144 refused: target ID array contains a duplicate.';
  end if;

  select count(*) into v_distinct_family_count
    from public.ali_question_bank
    where id = any(v_target_ids);
  if v_distinct_family_count <> 22 then
    raise exception 'Migration 144 refused: expected exactly 22 real ali_question_bank rows matching the target IDs, found %.', v_distinct_family_count;
  end if;

  -- Exclusion guard: Perimeter Area and every other unauthorised family
  -- must never appear in the target array, by construction. Explicit
  -- parentheses group each disjunct unambiguously (AND binds tighter than
  -- OR in SQL, so the "not any of the six authorised families" clause is
  -- parenthesised as one unit rather than relying on default precedence).
  if exists (
    select 1 from unnest(v_target_ids) t
    where t like 'mock-mr03mr07-perimeterarea%'
       or t like 'mock-mr06-linkedvalues%'
       or (
            t not like 'mock-mr10-bustimetable-%'
        and t not like 'mock-mr13-craftstall-%'
        and t not like 'mock-mr09-funrun-%'
        and t not like 'mock-mr04-campingsale-%'
        and t not like 'mock-mr06-numberpuzzle-%'
        and t not like 'mock-mr11-roundingbounds-%'
          )
  ) then
    raise exception 'Migration 144 refused: target array must contain only the six Decision-210-authorised families and nothing else.';
  end if;

  -- === Per-family structural preconditions (all six) ===

  -- Bus Timetable
  if (select count(*) from public.ali_question_bank where id = any(v_target_ids) and id like 'mock-mr10-bustimetable-%' and subject = 'maths' and skill = 'QT-MR-10') <> 4 then
    raise exception 'Migration 144 refused: expected 4 mock-mr10-bustimetable rows with subject=maths, skill=QT-MR-10.';
  end if;
  if (select count(*) from public.ali_question_bank b join (values
      ('mock-mr10-bustimetable-01', 1, '(a)'), ('mock-mr10-bustimetable-02', 2, '(b)'),
      ('mock-mr10-bustimetable-03', 3, '(c)'), ('mock-mr10-bustimetable-04', 4, '(d)')
    ) as e(id, go, sl) on b.id = e.id
    where b.question_group_id = 'mock-mr10-bustimetable' and b.group_order = e.go and b.subpart_label = e.sl) <> 4 then
    raise exception 'Migration 144 refused: mock-mr10-bustimetable grouping shape mismatch.';
  end if;
  if (select count(*) from public.ali_question_bank b join (values
      ('mock-mr10-bustimetable-01', 'medium'), ('mock-mr10-bustimetable-02', 'medium'),
      ('mock-mr10-bustimetable-03', 'hard'), ('mock-mr10-bustimetable-04', 'hard')
    ) as e(id, diff) on b.id = e.id where b.content_difficulty::text = e.diff) <> 4 then
    raise exception 'Migration 144 refused: mock-mr10-bustimetable difficulty mismatch (expected medium/medium/hard/hard).';
  end if;
  if (select count(*) from public.ali_question_bank b join (values
      ('mock-mr10-bustimetable-01', '95'), ('mock-mr10-bustimetable-02', '7'),
      ('mock-mr10-bustimetable-03', '370'), ('mock-mr10-bustimetable-04', '28')
    ) as e(id, ans) on b.id = e.id where (b.prompt->>'answer') = e.ans) <> 4 then
    raise exception 'Migration 144 refused: mock-mr10-bustimetable answer mismatch (expected 95/7/370/28).';
  end if;
  if (select count(*) from public.ali_question_bank where id like 'mock-mr10-bustimetable-%' and (prompt->>'sharedStem') = v_bustimetable_stem) <> 4 then
    raise exception 'Migration 144 refused: mock-mr10-bustimetable sharedStem mismatch.';
  end if;
  if (select count(*) from public.ali_question_bank where id like 'mock-mr10-bustimetable-%' and jsonb_typeof(prompt->'stimulus') = 'object' and prompt->'stimulus'->>'type' = 'table') <> 4 then
    raise exception 'Migration 144 refused: mock-mr10-bustimetable must carry a valid table stimulus on all 4 rows.';
  end if;

  -- Craft Stall
  if (select count(*) from public.ali_question_bank where id = any(v_target_ids) and id like 'mock-mr13-craftstall-%' and subject = 'maths' and skill = 'QT-MR-13') <> 3 then
    raise exception 'Migration 144 refused: expected 3 mock-mr13-craftstall rows with subject=maths, skill=QT-MR-13.';
  end if;
  if (select count(*) from public.ali_question_bank b join (values
      ('mock-mr13-craftstall-01', 1, '(a)'), ('mock-mr13-craftstall-02', 2, '(b)'), ('mock-mr13-craftstall-03', 3, '(c)')
    ) as e(id, go, sl) on b.id = e.id
    where b.question_group_id = 'mock-mr13-craftstall' and b.group_order = e.go and b.subpart_label = e.sl) <> 3 then
    raise exception 'Migration 144 refused: mock-mr13-craftstall grouping shape mismatch.';
  end if;
  if (select count(*) from public.ali_question_bank b join (values
      ('mock-mr13-craftstall-01', 'medium'), ('mock-mr13-craftstall-02', 'medium'), ('mock-mr13-craftstall-03', 'hard')
    ) as e(id, diff) on b.id = e.id where b.content_difficulty::text = e.diff) <> 3 then
    raise exception 'Migration 144 refused: mock-mr13-craftstall difficulty mismatch (expected medium/medium/hard).';
  end if;
  if (select count(*) from public.ali_question_bank b join (values
      ('mock-mr13-craftstall-01', '18.00'), ('mock-mr13-craftstall-02', 'Stickers'), ('mock-mr13-craftstall-03', '3')
    ) as e(id, ans) on b.id = e.id where (b.prompt->>'answer') = e.ans) <> 3 then
    raise exception 'Migration 144 refused: mock-mr13-craftstall answer mismatch (expected 18.00/Stickers/3).';
  end if;
  if (select count(*) from public.ali_question_bank where id like 'mock-mr13-craftstall-%' and (prompt->>'sharedStem') = v_craftstall_stem) <> 3 then
    raise exception 'Migration 144 refused: mock-mr13-craftstall sharedStem mismatch.';
  end if;
  if (select count(*) from public.ali_question_bank where id like 'mock-mr13-craftstall-%' and jsonb_typeof(prompt->'stimulus') = 'object' and prompt->'stimulus'->>'type' = 'table') <> 3 then
    raise exception 'Migration 144 refused: mock-mr13-craftstall must carry a valid table stimulus on all 3 rows.';
  end if;

  -- Fun Run
  if (select count(*) from public.ali_question_bank where id = any(v_target_ids) and id like 'mock-mr09-funrun-%' and subject = 'maths' and skill = 'QT-MR-09') <> 4 then
    raise exception 'Migration 144 refused: expected 4 mock-mr09-funrun rows with subject=maths, skill=QT-MR-09.';
  end if;
  if (select count(*) from public.ali_question_bank b join (values
      ('mock-mr09-funrun-01', 1, '(a)'), ('mock-mr09-funrun-02', 2, '(b)'),
      ('mock-mr09-funrun-03', 3, '(c)'), ('mock-mr09-funrun-04', 4, '(d)')
    ) as e(id, go, sl) on b.id = e.id
    where b.question_group_id = 'mock-mr09-funrun' and b.group_order = e.go and b.subpart_label = e.sl) <> 4 then
    raise exception 'Migration 144 refused: mock-mr09-funrun grouping shape mismatch.';
  end if;
  if (select count(*) from public.ali_question_bank b join (values
      ('mock-mr09-funrun-01', 'medium'), ('mock-mr09-funrun-02', 'medium'),
      ('mock-mr09-funrun-03', 'hard'), ('mock-mr09-funrun-04', 'hard')
    ) as e(id, diff) on b.id = e.id where b.content_difficulty::text = e.diff) <> 4 then
    raise exception 'Migration 144 refused: mock-mr09-funrun difficulty mismatch (expected medium/medium/hard/hard).';
  end if;
  if (select count(*) from public.ali_question_bank b join (values
      ('mock-mr09-funrun-01', '30'), ('mock-mr09-funrun-02', '74'),
      ('mock-mr09-funrun-03', '2.5'), ('mock-mr09-funrun-04', '14')
    ) as e(id, ans) on b.id = e.id where (b.prompt->>'answer') = e.ans) <> 4 then
    raise exception 'Migration 144 refused: mock-mr09-funrun answer mismatch (expected 30/74/2.5/14).';
  end if;
  if (select count(*) from public.ali_question_bank where id like 'mock-mr09-funrun-%' and (prompt->>'sharedStem') = v_funrun_stem) <> 4 then
    raise exception 'Migration 144 refused: mock-mr09-funrun sharedStem mismatch.';
  end if;
  if (select count(*) from public.ali_question_bank where id like 'mock-mr09-funrun-%' and jsonb_typeof(prompt->'stimulus') = 'object' and prompt->'stimulus'->>'type' = 'table') <> 4 then
    raise exception 'Migration 144 refused: mock-mr09-funrun must carry a valid table stimulus on all 4 rows.';
  end if;

  -- Camping Sale
  if (select count(*) from public.ali_question_bank where id = any(v_target_ids) and id like 'mock-mr04-campingsale-%' and subject = 'maths' and skill = 'QT-MR-04') <> 4 then
    raise exception 'Migration 144 refused: expected 4 mock-mr04-campingsale rows with subject=maths, skill=QT-MR-04.';
  end if;
  if (select count(*) from public.ali_question_bank b join (values
      ('mock-mr04-campingsale-01', 1, '(a)'), ('mock-mr04-campingsale-02', 2, '(b)'),
      ('mock-mr04-campingsale-03', 3, '(c)'), ('mock-mr04-campingsale-04', 4, '(d)')
    ) as e(id, go, sl) on b.id = e.id
    where b.question_group_id = 'mock-mr04-campingsale' and b.group_order = e.go and b.subpart_label = e.sl) <> 4 then
    raise exception 'Migration 144 refused: mock-mr04-campingsale grouping shape mismatch.';
  end if;
  if (select count(*) from public.ali_question_bank b join (values
      ('mock-mr04-campingsale-01', 'easy'), ('mock-mr04-campingsale-02', 'medium'),
      ('mock-mr04-campingsale-03', 'hard'), ('mock-mr04-campingsale-04', 'hard')
    ) as e(id, diff) on b.id = e.id where b.content_difficulty::text = e.diff) <> 4 then
    raise exception 'Migration 144 refused: mock-mr04-campingsale difficulty mismatch (expected easy/medium/hard/hard).';
  end if;
  if (select count(*) from public.ali_question_bank b join (values
      ('mock-mr04-campingsale-01', '£102'), ('mock-mr04-campingsale-02', '£91.80'),
      ('mock-mr04-campingsale-03', '£1.80'), ('mock-mr04-campingsale-04', '£170')
    ) as e(id, ans) on b.id = e.id where (b.prompt->>'answer') = e.ans) <> 4 then
    raise exception 'Migration 144 refused: mock-mr04-campingsale answer mismatch (expected £102/£91.80/£1.80/£170).';
  end if;
  if (select count(*) from public.ali_question_bank where id like 'mock-mr04-campingsale-%' and (prompt->>'sharedStem') = v_campingsale_stem) <> 4 then
    raise exception 'Migration 144 refused: mock-mr04-campingsale sharedStem mismatch.';
  end if;
  if (select count(*) from public.ali_question_bank where id like 'mock-mr04-campingsale-%' and prompt ? 'stimulus') <> 0 then
    raise exception 'Migration 144 refused: mock-mr04-campingsale is text-only narrative content and must never carry a stimulus key.';
  end if;

  -- Number Puzzle
  if (select count(*) from public.ali_question_bank where id = any(v_target_ids) and id like 'mock-mr06-numberpuzzle-%' and subject = 'maths' and skill = 'QT-MR-06') <> 3 then
    raise exception 'Migration 144 refused: expected 3 mock-mr06-numberpuzzle rows with subject=maths, skill=QT-MR-06.';
  end if;
  if (select count(*) from public.ali_question_bank b join (values
      ('mock-mr06-numberpuzzle-01', 1, '(a)'), ('mock-mr06-numberpuzzle-02', 2, '(b)'), ('mock-mr06-numberpuzzle-03', 3, '(c)')
    ) as e(id, go, sl) on b.id = e.id
    where b.question_group_id = 'mock-mr06-numberpuzzle' and b.group_order = e.go and b.subpart_label = e.sl) <> 3 then
    raise exception 'Migration 144 refused: mock-mr06-numberpuzzle grouping shape mismatch.';
  end if;
  if (select count(*) from public.ali_question_bank b join (values
      ('mock-mr06-numberpuzzle-01', 'medium'), ('mock-mr06-numberpuzzle-02', 'medium'), ('mock-mr06-numberpuzzle-03', 'hard')
    ) as e(id, diff) on b.id = e.id where b.content_difficulty::text = e.diff) <> 3 then
    raise exception 'Migration 144 refused: mock-mr06-numberpuzzle difficulty mismatch (expected medium/medium/hard).';
  end if;
  if (select count(*) from public.ali_question_bank b join (values
      ('mock-mr06-numberpuzzle-01', '81'), ('mock-mr06-numberpuzzle-02', '9'), ('mock-mr06-numberpuzzle-03', '0')
    ) as e(id, ans) on b.id = e.id where (b.prompt->>'answer') = e.ans) <> 3 then
    raise exception 'Migration 144 refused: mock-mr06-numberpuzzle answer mismatch (expected 81/9/0).';
  end if;
  if (select count(*) from public.ali_question_bank where id like 'mock-mr06-numberpuzzle-%' and (prompt->>'sharedStem') = v_numberpuzzle_stem) <> 3 then
    raise exception 'Migration 144 refused: mock-mr06-numberpuzzle sharedStem mismatch.';
  end if;
  if (select count(*) from public.ali_question_bank where id like 'mock-mr06-numberpuzzle-%' and prompt ? 'stimulus') <> 0 then
    raise exception 'Migration 144 refused: mock-mr06-numberpuzzle is text-only abstract content and must never carry a stimulus key.';
  end if;

  -- Rounding Bounds
  if (select count(*) from public.ali_question_bank where id = any(v_target_ids) and id like 'mock-mr11-roundingbounds-%' and subject = 'maths' and skill = 'QT-MR-11') <> 4 then
    raise exception 'Migration 144 refused: expected 4 mock-mr11-roundingbounds rows with subject=maths, skill=QT-MR-11.';
  end if;
  if (select count(*) from public.ali_question_bank b join (values
      ('mock-mr11-roundingbounds-01', 1, '(a)'), ('mock-mr11-roundingbounds-02', 2, '(b)'),
      ('mock-mr11-roundingbounds-03', 3, '(c)'), ('mock-mr11-roundingbounds-04', 4, '(d)')
    ) as e(id, go, sl) on b.id = e.id
    where b.question_group_id = 'mock-mr11-roundingbounds' and b.group_order = e.go and b.subpart_label = e.sl) <> 4 then
    raise exception 'Migration 144 refused: mock-mr11-roundingbounds grouping shape mismatch.';
  end if;
  if (select count(*) from public.ali_question_bank b join (values
      ('mock-mr11-roundingbounds-01', 'easy'), ('mock-mr11-roundingbounds-02', 'easy'),
      ('mock-mr11-roundingbounds-03', 'medium'), ('mock-mr11-roundingbounds-04', 'hard')
    ) as e(id, diff) on b.id = e.id where b.content_difficulty::text = e.diff) <> 4 then
    raise exception 'Migration 144 refused: mock-mr11-roundingbounds difficulty mismatch (expected easy/easy/medium/hard).';
  end if;
  if (select count(*) from public.ali_question_bank b join (values
      ('mock-mr11-roundingbounds-01', '384'), ('mock-mr11-roundingbounds-02', '235'),
      ('mock-mr11-roundingbounds-03', '628'), ('mock-mr11-roundingbounds-04', '131')
    ) as e(id, ans) on b.id = e.id where (b.prompt->>'answer') = e.ans) <> 4 then
    raise exception 'Migration 144 refused: mock-mr11-roundingbounds answer mismatch (expected 384/235/628/131).';
  end if;
  if (select count(*) from public.ali_question_bank where id like 'mock-mr11-roundingbounds-%' and (prompt->>'sharedStem') = v_roundingbounds_stem) <> 4 then
    raise exception 'Migration 144 refused: mock-mr11-roundingbounds sharedStem mismatch.';
  end if;
  if (select count(*) from public.ali_question_bank where id like 'mock-mr11-roundingbounds-%' and prompt ? 'stimulus') <> 0 then
    raise exception 'Migration 144 refused: mock-mr11-roundingbounds is text-only narrative content and must never carry a stimulus key.';
  end if;

  -- === Cross-family invariants ===
  select count(*) into v_marks_count from public.ali_question_bank where id = any(v_target_ids) and (prompt->>'marks')::numeric = 1;
  if v_marks_count <> 22 then
    raise exception 'Migration 144 refused: expected all 22 rows with marks=1 each (found %). Marking Integrity Gate must never be assumed satisfied.', v_marks_count;
  end if;

  select count(*) into v_marking_mode_count from public.ali_question_bank where id = any(v_target_ids) and marking_mode = 'deterministic';
  if v_marking_mode_count <> 22 then
    raise exception 'Migration 144 refused: expected all 22 rows with marking_mode=deterministic (found %).', v_marking_mode_count;
  end if;

  select count(*) into v_active_count from public.ali_question_bank where id = any(v_target_ids) and active = true;
  if v_active_count <> 22 then
    raise exception 'Migration 144 refused: expected 22 active=true rows (found %).', v_active_count;
  end if;

  -- === Perimeter Area safety guard (pre-write) ===
  select count(*) into v_perimeterarea_count
    from public.ali_question_bank
    where id like 'mock-mr03mr07-perimeterarea%' and eligibility_status = 'independently_validated';
  if v_perimeterarea_count <> 4 then
    raise exception 'Migration 144 refused: expected mock-mr03mr07-perimeterarea''s 4 rows to remain independently_validated, untouched (found %). Re-verify production state before proceeding -- an unsafe production state (Perimeter Area not where expected) must never be silently promoted around.', v_perimeterarea_count;
  end if;

  -- === Pool-baseline guard: mock_eligible Mathematics total must be
  -- either the Decision-189-through-210 pre-promotion baseline of 55
  -- (pristine case) or the post-promotion total of 77 (already-applied
  -- case, 55+22) before this migration writes anything -- any other
  -- figure indicates an unexpected drift in the wider mock_eligible pool
  -- unrelated to this migration's own 22-row scope, and this migration
  -- refuses to guess around that rather than promoting on top of it. ===
  select count(*) into v_pre_mock_eligible_total
    from public.ali_question_bank
    where subject = 'maths' and eligibility_status = 'mock_eligible';
  if v_pre_mock_eligible_total not in (55, 77) then
    raise exception 'Migration 144 refused: expected the pre-existing Mathematics mock_eligible pool to be exactly 55 rows (pristine, Decision 189-210 baseline) or exactly 77 rows (already applied, 55+22), found %. Re-verify production state before proceeding.', v_pre_mock_eligible_total;
  end if;

  select count(*) into v_pending_count
  from public.ali_question_bank
  where id = any(v_target_ids)
    and eligibility_status = 'independently_validated'
    and active = true
    and subject = 'maths';

  select count(*) into v_already_mock_eligible_count
  from public.ali_question_bank
  where id = any(v_target_ids)
    and eligibility_status = 'mock_eligible';

  if v_pending_count = 22 then
    create temporary table tmp_reserve_promotion_prompt_snapshot (id text primary key, prompt_snapshot jsonb not null) on commit drop;
    insert into tmp_reserve_promotion_prompt_snapshot (id, prompt_snapshot)
      select id, prompt from public.ali_question_bank where id = any(v_target_ids);

    update public.ali_question_bank
    set eligibility_status = 'mock_eligible'
    where id = any(v_target_ids)
      and eligibility_status = 'independently_validated';

    select count(*) into v_post_write_count
      from public.ali_question_bank
      where id = any(v_target_ids) and eligibility_status = 'mock_eligible';
    if v_post_write_count <> 22 then
      raise exception 'Migration 144 post-write verification failed: expected 22 rows now mock_eligible, found %. Rolling back.', v_post_write_count;
    end if;

    select count(*) into v_post_write_preserved_count
      from public.ali_question_bank b
      join tmp_reserve_promotion_prompt_snapshot s on b.id = s.id
      where b.prompt = s.prompt_snapshot;
    if v_post_write_preserved_count <> 22 then
      raise exception 'Migration 144 post-write preservation check failed: % of 22 rows have their prompt byte-for-byte unchanged (expected 22). Rolling back.', v_post_write_preserved_count;
    end if;

    -- Atomic per-family completeness: each family's own full row count
    -- must now be mock_eligible -- never a partial number.
    select count(*) into v_family_count from public.ali_question_bank where id like 'mock-mr10-bustimetable-%' and eligibility_status = 'mock_eligible';
    if v_family_count <> 4 then
      raise exception 'Migration 144 refused: mock-mr10-bustimetable partially promoted (% of 4 rows mock_eligible). Rolling back.', v_family_count;
    end if;

    select count(*) into v_family_count from public.ali_question_bank where id like 'mock-mr13-craftstall-%' and eligibility_status = 'mock_eligible';
    if v_family_count <> 3 then
      raise exception 'Migration 144 refused: mock-mr13-craftstall partially promoted (% of 3 rows mock_eligible). Rolling back.', v_family_count;
    end if;

    select count(*) into v_family_count from public.ali_question_bank where id like 'mock-mr09-funrun-%' and eligibility_status = 'mock_eligible';
    if v_family_count <> 4 then
      raise exception 'Migration 144 refused: mock-mr09-funrun partially promoted (% of 4 rows mock_eligible). Rolling back.', v_family_count;
    end if;

    select count(*) into v_family_count from public.ali_question_bank where id like 'mock-mr04-campingsale-%' and eligibility_status = 'mock_eligible';
    if v_family_count <> 4 then
      raise exception 'Migration 144 refused: mock-mr04-campingsale partially promoted (% of 4 rows mock_eligible). Rolling back.', v_family_count;
    end if;

    select count(*) into v_family_count from public.ali_question_bank where id like 'mock-mr06-numberpuzzle-%' and eligibility_status = 'mock_eligible';
    if v_family_count <> 3 then
      raise exception 'Migration 144 refused: mock-mr06-numberpuzzle partially promoted (% of 3 rows mock_eligible). Rolling back.', v_family_count;
    end if;

    select count(*) into v_family_count from public.ali_question_bank where id like 'mock-mr11-roundingbounds-%' and eligibility_status = 'mock_eligible';
    if v_family_count <> 4 then
      raise exception 'Migration 144 refused: mock-mr11-roundingbounds partially promoted (% of 4 rows mock_eligible). Rolling back.', v_family_count;
    end if;

    -- Perimeter Area safety guard (post-write): must remain exactly as before.
    select count(*) into v_perimeterarea_count
      from public.ali_question_bank
      where id like 'mock-mr03mr07-perimeterarea%' and eligibility_status = 'independently_validated';
    if v_perimeterarea_count <> 4 then
      raise exception 'Migration 144 refused: mock-mr03mr07-perimeterarea must remain independently_validated (found % of 4 rows). Rolling back.', v_perimeterarea_count;
    end if;

    select count(*) into v_post_write_count
      from public.ali_question_bank
      where id like 'mock-mr03mr07-perimeterarea%' and eligibility_status = 'mock_eligible';
    if v_post_write_count <> 0 then
      raise exception 'Migration 144 refused: mock-mr03mr07-perimeterarea must never become mock_eligible via this migration (found % rows). Rolling back.', v_post_write_count;
    end if;

    select count(*) into v_post_mock_eligible_total
      from public.ali_question_bank
      where subject = 'maths' and eligibility_status = 'mock_eligible';
    if v_post_mock_eligible_total <> 77 then
      raise exception 'Migration 144 post-write verification failed: expected Mathematics mock_eligible total to be exactly 77 (55 pre-existing + 22 newly promoted), found %. Rolling back.', v_post_mock_eligible_total;
    end if;

    raise notice 'Migration 144: promoted 22 rows across 6 families (Bus Timetable 4, Craft Stall 3, Fun Run 4, Camping Sale 4, Number Puzzle 3, Rounding Bounds 4 -- 22 marks, 6 numbered-question experiences) from independently_validated to mock_eligible. mock-mr03mr07-perimeterarea remains independently_validated (4 rows), untouched. Mathematics mock_eligible total now 77 (55+22). Every prompt key proven byte-for-byte unchanged. No review-table, form-table, RPC, RLS, or content mutation. First Mock is NOT composed by this migration -- Decision 210''s own governing composition ceiling (54/56 marks at 20/21 questions) remains the baseline until recomputed by a future composition step.';

  elsif v_already_mock_eligible_count = 22 then
    raise notice 'Migration 144: all 22 target rows are already mock_eligible -- already applied. No changes made.';

    select count(*) into v_perimeterarea_count
      from public.ali_question_bank
      where id like 'mock-mr03mr07-perimeterarea%' and eligibility_status = 'independently_validated';
    if v_perimeterarea_count <> 4 then
      raise exception 'Migration 144 refused: mock-mr03mr07-perimeterarea must remain independently_validated (found % of 4 rows) even in the already-applied branch. Manual investigation required.', v_perimeterarea_count;
    end if;

    select count(*) into v_post_mock_eligible_total
      from public.ali_question_bank
      where subject = 'maths' and eligibility_status = 'mock_eligible';
    if v_post_mock_eligible_total <> 77 then
      raise exception 'Migration 144 refused: expected Mathematics mock_eligible total to already be 77 in the already-applied branch, found %. Manual investigation required.', v_post_mock_eligible_total;
    end if;

  else
    raise exception
      'Migration 144 refused: expected 22 independently_validated rows across the six named families (found %), or 22 already mock_eligible (found %). Re-verify production state before proceeding.',
      v_pending_count, v_already_mock_eligible_count;
  end if;
end $$;

commit;
