-- Angel Digital 11+ — Migration 124
-- First Mathematics Mock — Bounded Reserve Admission (Decision 183/184).
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS
-- ============================================================
-- Decision 183's own composition-ceiling analysis found a bounded
-- 3-family admission (mock-mr10-fairprep, mock-mr09-runningclub,
-- mock-mr06-linkedvalues) achieves the IDENTICAL 20/21-question
-- First Mock composition ceiling (44/46 marks) as admitting the full
-- 4-family reserve — mock-mr03mr07-perimeterarea's marginal 2
-- experiences are never needed to fill a 20-21-question form once
-- enough richer experiences already exist, so admitting it purchases
-- zero additional capacity while fully depleting the certified
-- reserve. This migration promotes exactly the bounded 3-family, 7-row
-- set to mock_eligible; mock-mr03mr07-perimeterarea is deliberately
-- and explicitly excluded, remaining independently_validated reserve
-- (Decision 183's own recommendation, Founder-authorised).
--
-- ============================================================
-- EXACT ADMISSION SCOPE (7 rows, 3 families, 3 numbered experiences,
-- 7 marks) — derived directly from migrations 113 and 119, not assumed
-- ============================================================
--   mock-mr10-fairprep-01, mock-mr10-fairprep-02 (QT-MR-10, 1 experience, 2 marks)
--   mock-mr09-runningclub-01, mock-mr09-runningclub-02 (QT-MR-09, 1 experience, 2 marks)
--   mock-mr06-linkedvalues-01, mock-mr06-linkedvalues-02, mock-mr06-linkedvalues-03
--     (QT-MR-06, 1 experience, 3 marks)
-- mock-mr03mr07-perimeterarea-01a/01b/02a/02b is NEVER named in this
-- migration's own v_target_ids array — structurally, not merely by
-- intent, excluded from every executable UPDATE this migration can
-- ever perform.
--
-- ============================================================
-- MOCK-ELIGIBILITY CONTRACT, RE-READ FROM SOURCE, NOT ASSUMED
-- ============================================================
-- Confirmed directly this session against migrations 069/084 (RLS) and
-- 070 (table creation): `mock_eligible` is a candidate-pool flag only.
-- The only two SELECT policies mentioning mock_eligible (069, 084) both
-- read `using (eligibility_status is distinct from 'mock_eligible' or
-- is_current_user_admin())` — a row's promotion SEALS it from ordinary
-- anon/authenticated SELECT (previously independently_validated rows
-- ARE directly readable; mock_eligible rows become admin-only-direct-
-- read, reachable to a learner only through the SECURITY DEFINER
-- mock_get_question() RPC, which independently enforces attempt
-- ownership, in-progress status, expiry, and assigned-manifest
-- membership (migrations 070/106/115/122, unchanged by this
-- migration). No migration anywhere in this repository ever
-- auto-inserts into ali_mock_form (confirmed: migration 070 only
-- CREATEs that table; grep across every migration finds no INSERT into
-- it) — this migration therefore cannot activate a form, create an
-- attempt, or expose any content, by construction. Practice reads via
-- the wholly distinct `practice_eligible` status (never touched here);
-- none of these 7 rows has ever carried that status. Mastery/EI/scoring
-- read raw component IDs and marks, both entirely unchanged here.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does NOT promote mock-mr03mr07-perimeterarea (explicitly excluded,
-- structurally absent from the target array) -- it remains
-- independently_validated reserve, exactly as Decision 183
-- recommended. Does NOT change question, answer, marks, sharedStem,
-- stimulus, skill, content_difficulty, family_id, provenance,
-- content_version, question_group_id, group_order, subpart_label,
-- marking_mode, or active on any row -- proven, not merely asserted,
-- via a full pre-write prompt snapshot compared byte-for-byte
-- post-write. Does NOT touch ali_family_review (no INSERT/UPDATE/
-- DELETE anywhere in this file). Does NOT touch ali_mock_form, any
-- RPC, RLS policy, or grant. Does NOT author new content. Does NOT
-- compose the First Mock or activate Mock Centre.
--
-- ============================================================
-- REVIEW-EVIDENCE PREDICATE — CORRECTED CONVENTION (Decision 182
-- lesson applied directly, not merely referenced)
-- ============================================================
-- Every real, UI-submitted ali_family_review notes value is built as
-- "Reviewer qualification: {basis}.\n\n{MARKER} new content
-- review: ...\n\n{reviewer's own free text}" -- the marker is NEVER the
-- first character of a genuine approval's notes. This migration's own
-- review-evidence preconditions therefore use `notes like '%MARKER%'`
-- (substring-anywhere), never `notes like 'MARKER%'` (anchored), for
-- both families' own batch markers, and accept ANY count >= 1 matching
-- approved record per family -- multiple legitimate approvals must
-- never invalidate certification (the exact Decision 182 lesson).
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations 116
-- (fairprep/runningclub independent validation) and 123 (linkedvalues
-- independent validation, corrected, per Decision 182) have already
-- been applied.

begin;

do $$
declare
  v_target_ids constant text[] := array[
    'mock-mr10-fairprep-01', 'mock-mr10-fairprep-02',
    'mock-mr09-runningclub-01', 'mock-mr09-runningclub-02',
    'mock-mr06-linkedvalues-01', 'mock-mr06-linkedvalues-02', 'mock-mr06-linkedvalues-03'
  ];
  v_excluded_ids constant text[] := array[
    'mock-mr03mr07-perimeterarea-01a', 'mock-mr03mr07-perimeterarea-01b',
    'mock-mr03mr07-perimeterarea-02a', 'mock-mr03mr07-perimeterarea-02b'
  ];
  v_linkedvalues_stem constant text := 'A collector has three bags of marbles: red, blue and green. The blue bag has 6 more marbles than the red bag. The green bag has 3 times as many marbles as the blue bag. Altogether, the three bags contain 64 marbles.';
  v_pending_count int;
  v_already_mock_eligible_count int;
  v_active_count int;
  v_marks_count int;
  v_subject_count int;
  v_marking_mode_count int;
  v_non_empty_question_count int;
  v_fairprep_grouping_count int;
  v_runningclub_grouping_count int;
  v_linkedvalues_grouping_count int;
  v_runningclub_stimulus_count int;
  v_linkedvalues_sharedstem_count int;
  v_fairprep_approved_count int;
  v_runningclub_approved_count int;
  v_linkedvalues_approved_count int;
  v_excluded_still_validated_count int;
  v_post_write_count int;
  v_post_write_preserved_count int;
  v_post_write_excluded_count int;
begin
  -- Structural exclusion proof, evaluated before anything else:
  -- perimeterarea must never appear in the target array, by
  -- construction, not merely by omission.
  if exists (select 1 from unnest(v_excluded_ids) e where e = any(v_target_ids)) then
    raise exception 'Migration 124 refused: mock-mr03mr07-perimeterarea must never appear in the target admission array -- it is Decision 183''s own explicit reserve exclusion.';
  end if;

  select count(*) into v_pending_count
  from public.ali_question_bank
  where id = any(v_target_ids)
    and eligibility_status = 'independently_validated'
    and active = true
    and subject = 'maths'
    and family_id in ('mock-mr10-fairprep', 'mock-mr09-runningclub', 'mock-mr06-linkedvalues');

  select count(*) into v_already_mock_eligible_count
  from public.ali_question_bank
  where id = any(v_target_ids)
    and eligibility_status = 'mock_eligible';

  -- Structural precondition audit -- evaluated regardless of which
  -- branch below runs, so drift is caught even in the already-applied
  -- case.
  select count(*) into v_active_count
    from public.ali_question_bank where id = any(v_target_ids) and active = true;
  if v_active_count <> 7 then
    raise exception 'Migration 124 refused: expected 7 active=true rows (found %).', v_active_count;
  end if;

  select count(*) into v_subject_count
    from public.ali_question_bank where id = any(v_target_ids) and subject = 'maths';
  if v_subject_count <> 7 then
    raise exception 'Migration 124 refused: expected 7 subject=maths rows (found %).', v_subject_count;
  end if;

  select count(*) into v_marking_mode_count
    from public.ali_question_bank where id = any(v_target_ids) and marking_mode = 'deterministic';
  if v_marking_mode_count <> 7 then
    raise exception 'Migration 124 refused: expected 7 marking_mode=deterministic rows (found %).', v_marking_mode_count;
  end if;

  select count(*) into v_marks_count
    from public.ali_question_bank where id = any(v_target_ids) and (prompt->>'marks')::numeric = 1;
  if v_marks_count <> 7 then
    raise exception 'Migration 124 refused: expected 7 rows with marks=1 each (found %). Marking Integrity Gate must never be assumed satisfied.', v_marks_count;
  end if;

  select count(*) into v_non_empty_question_count
    from public.ali_question_bank where id = any(v_target_ids) and coalesce(length(prompt->>'question'), 0) > 0;
  if v_non_empty_question_count <> 7 then
    raise exception 'Migration 124 refused: every target row must have non-empty question text (found % of 7).', v_non_empty_question_count;
  end if;

  -- Exact grouping shape per family, via explicit VALUES joins (never a
  -- broken multi-row aggregate -- migration 123's own drafting lesson
  -- applied directly).
  select count(*) into v_fairprep_grouping_count
    from public.ali_question_bank b
    join (values ('mock-mr10-fairprep-01', 1, '(a)'), ('mock-mr10-fairprep-02', 2, '(b)'))
      as expected(id, expected_group_order, expected_subpart_label) on b.id = expected.id
    where b.question_group_id = 'mock-mr10-fairprep'
      and b.group_order = expected.expected_group_order
      and b.subpart_label = expected.expected_subpart_label;
  if v_fairprep_grouping_count <> 2 then
    raise exception 'Migration 124 refused: mock-mr10-fairprep grouping shape mismatch (found % of 2 matching).', v_fairprep_grouping_count;
  end if;

  select count(*) into v_runningclub_grouping_count
    from public.ali_question_bank b
    join (values ('mock-mr09-runningclub-01', 1, '(a)'), ('mock-mr09-runningclub-02', 2, '(b)'))
      as expected(id, expected_group_order, expected_subpart_label) on b.id = expected.id
    where b.question_group_id = 'mock-mr09-runningclub'
      and b.group_order = expected.expected_group_order
      and b.subpart_label = expected.expected_subpart_label;
  if v_runningclub_grouping_count <> 2 then
    raise exception 'Migration 124 refused: mock-mr09-runningclub grouping shape mismatch (found % of 2 matching).', v_runningclub_grouping_count;
  end if;

  select count(*) into v_linkedvalues_grouping_count
    from public.ali_question_bank b
    join (values ('mock-mr06-linkedvalues-01', 1, '(a)'), ('mock-mr06-linkedvalues-02', 2, '(b)'), ('mock-mr06-linkedvalues-03', 3, '(c)'))
      as expected(id, expected_group_order, expected_subpart_label) on b.id = expected.id
    where b.question_group_id = 'mock-mr06-linkedvalues'
      and b.group_order = expected.expected_group_order
      and b.subpart_label = expected.expected_subpart_label;
  if v_linkedvalues_grouping_count <> 3 then
    raise exception 'Migration 124 refused: mock-mr06-linkedvalues grouping shape mismatch (found % of 3 matching).', v_linkedvalues_grouping_count;
  end if;

  -- Family-specific presentation metadata: runningclub's structured
  -- table stimulus, linkedvalues' explicit sharedStem. Not required on
  -- fairprep, which has never used either mechanism.
  select count(*) into v_runningclub_stimulus_count
    from public.ali_question_bank
    where id in ('mock-mr09-runningclub-01', 'mock-mr09-runningclub-02')
      and jsonb_typeof(prompt->'stimulus') = 'object'
      and prompt->'stimulus'->>'type' = 'table';
  if v_runningclub_stimulus_count <> 2 then
    raise exception 'Migration 124 refused: mock-mr09-runningclub must carry a valid table stimulus on both rows (found %).', v_runningclub_stimulus_count;
  end if;

  select count(*) into v_linkedvalues_sharedstem_count
    from public.ali_question_bank
    where id in ('mock-mr06-linkedvalues-01', 'mock-mr06-linkedvalues-02', 'mock-mr06-linkedvalues-03')
      and (prompt->>'sharedStem') = v_linkedvalues_stem;
  if v_linkedvalues_sharedstem_count <> 3 then
    raise exception 'Migration 124 refused: mock-mr06-linkedvalues must carry the identical, exact sharedStem on all 3 rows (found %).', v_linkedvalues_sharedstem_count;
  end if;

  -- Live review-evidence preconditions, one per family, using the
  -- CORRECTED unanchored marker predicate (Decision 182). Accepts any
  -- count >= 1 -- multiple legitimate approvals never invalidate
  -- certification.
  select count(*) into v_fairprep_approved_count
    from public.ali_family_review
    where family_id = 'mock-mr10-fairprep'
      and decision = 'approved'
      and review_type = 'mock_maths_independent_review'
      and reviewer = 'Ayobami Lawal'
      and notes like '%MOCK-SHARED-SCENARIO-COMPLETION-BATCH%';
  if v_fairprep_approved_count < 1 then
    raise exception 'Migration 124 refused: no matching approved ali_family_review record found for mock-mr10-fairprep.';
  end if;

  select count(*) into v_runningclub_approved_count
    from public.ali_family_review
    where family_id = 'mock-mr09-runningclub'
      and decision = 'approved'
      and review_type = 'mock_maths_independent_review'
      and reviewer = 'Ayobami Lawal'
      and notes like '%MOCK-SHARED-SCENARIO-COMPLETION-BATCH%';
  if v_runningclub_approved_count < 1 then
    raise exception 'Migration 124 refused: no matching approved ali_family_review record found for mock-mr09-runningclub.';
  end if;

  select count(*) into v_linkedvalues_approved_count
    from public.ali_family_review
    where family_id = 'mock-mr06-linkedvalues'
      and decision = 'approved'
      and review_type = 'mock_maths_independent_review'
      and reviewer = 'Ayobami Lawal'
      and notes like '%MOCK-STRUCTURAL-CAPACITY-INC001%';
  if v_linkedvalues_approved_count < 1 then
    raise exception 'Migration 124 refused: no matching approved ali_family_review record found for mock-mr06-linkedvalues.';
  end if;

  -- Reserve-preservation guard: perimeterarea must still be exactly
  -- independently_validated before this migration writes anything.
  select count(*) into v_excluded_still_validated_count
    from public.ali_question_bank
    where id = any(v_excluded_ids) and eligibility_status = 'independently_validated';
  if v_excluded_still_validated_count <> 4 then
    raise exception 'Migration 124 refused: expected mock-mr03mr07-perimeterarea''s 4 rows to remain independently_validated (found %). Reserve state has drifted -- re-verify before proceeding.', v_excluded_still_validated_count;
  end if;

  if v_pending_count = 7 then
    create temporary table tmp_bounded_admission_prompt_snapshot (id text primary key, prompt_snapshot jsonb not null) on commit drop;
    insert into tmp_bounded_admission_prompt_snapshot (id, prompt_snapshot)
      select id, prompt from public.ali_question_bank where id = any(v_target_ids);

    update public.ali_question_bank
    set eligibility_status = 'mock_eligible'
    where id = any(v_target_ids)
      and eligibility_status = 'independently_validated';

    select count(*) into v_post_write_count
      from public.ali_question_bank where id = any(v_target_ids) and eligibility_status = 'mock_eligible';
    if v_post_write_count <> 7 then
      raise exception 'Migration 124 post-write verification failed: expected 7 rows now mock_eligible, found %. Rolling back.', v_post_write_count;
    end if;

    select count(*) into v_post_write_preserved_count
      from public.ali_question_bank b
      join tmp_bounded_admission_prompt_snapshot s on b.id = s.id
      where b.prompt = s.prompt_snapshot;
    if v_post_write_preserved_count <> 7 then
      raise exception 'Migration 124 post-write preservation check failed: % of 7 rows have their prompt byte-for-byte unchanged (expected 7). Rolling back.', v_post_write_preserved_count;
    end if;

    select count(*) into v_post_write_excluded_count
      from public.ali_question_bank
      where id = any(v_excluded_ids) and eligibility_status = 'independently_validated';
    if v_post_write_excluded_count <> 4 then
      raise exception 'Migration 124 post-write reserve-preservation check failed: mock-mr03mr07-perimeterarea no longer shows 4 independently_validated rows (found %). Rolling back.', v_post_write_excluded_count;
    end if;

    raise notice 'Migration 124: promoted 7 rows across 3 families (mock-mr10-fairprep, mock-mr09-runningclub, mock-mr06-linkedvalues; 3 numbered experiences, 7 marks) from independently_validated to mock_eligible. mock-mr03mr07-perimeterarea remains independently_validated reserve (Decision 183). Every prompt key proven byte-for-byte unchanged.';

  elsif v_already_mock_eligible_count = 7 then
    raise notice 'Migration 124: all 7 target questions are already mock_eligible -- already applied. No changes made.';

    select count(*) into v_post_write_excluded_count
      from public.ali_question_bank
      where id = any(v_excluded_ids) and eligibility_status = 'independently_validated';
    if v_post_write_excluded_count <> 4 then
      raise exception 'Migration 124 refused: mock-mr03mr07-perimeterarea no longer shows 4 independently_validated rows in the already-applied branch (found %). Manual investigation required.', v_post_write_excluded_count;
    end if;

  else
    raise exception
      'Migration 124 refused: expected 7 independently_validated rows across the 3 named families (found %), or 7 already mock_eligible (found %). Re-verify production state before proceeding.',
      v_pending_count, v_already_mock_eligible_count;
  end if;
end $$;

commit;
