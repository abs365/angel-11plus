-- Angel Digital 11+ — Migration 249
-- CSSE English Full Paper — guarded, fail-closed activation of
-- english-full-mock-v1. Mirrors migration 217's own established
-- "live re-verification, not just a flag flip" discipline (Reading
-- Comprehension Mock 1's own activation migration) applied to the
-- corrected English form.
--
-- ============================================================
-- WHY A GUARDED MIGRATION, NOT A LOOSE MANUAL UPDATE
-- ============================================================
-- Activation is the one remaining irreversible-in-effect step before a
-- real learner can reach this form: every prerequisite this arc has
-- built (migrations 245's schema, 248's corrected content, 247's
-- evidence-adapter claim) converges here. A bare `update ... set active
-- = true` trusts that everything is still exactly as last verified,
-- with no re-check and no defined failure mode if something has quietly
-- drifted. This migration instead verifies every prerequisite that can
-- responsibly be checked in SQL, in one transaction, and refuses
-- (RAISE EXCEPTION, no partial activation) if any of them do not hold —
-- then re-verifies the result before committing.
--
-- Scope: activates ONLY english-full-mock-v1. Touches no other row in
-- any table. Does not re-run any eligibility promotion (248 already did
-- that) and does not modify ali_question_bank at all.
--
-- Migration 208's ali_block_mock_form_content_reuse() trigger fires on
-- every INSERT OR UPDATE to ali_mock_form, including this one -- it is
-- not bypassed or special-cased. It will re-evaluate this row's own
-- unchanged manifest against every other form, exactly as it did when
-- 248 first inserted this row; its own predicate explicitly excludes a
-- row from conflicting with itself (`existing_form.id is distinct from
-- new.id`), so a same-row UPDATE that does not alter question_manifest
-- cannot self-trigger it. This is disclosed reasoning, not an
-- assumption this migration silently depends on without stating it.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor, after migrations 248 and 247
-- (both confirmed applied).

begin;

-- ── Precondition 1: the form exists exactly once, is currently
-- inactive, and has the expected subject/attempt_type ─────────────────
do $$
declare
  v_row public.ali_mock_form;
  v_count int;
begin
  select count(*) into v_count from public.ali_mock_form where id = 'english-full-mock-v1';
  if v_count <> 1 then
    raise exception 'Migration 249 refused: expected exactly 1 english-full-mock-v1 row, found %.', v_count;
  end if;

  select * into v_row from public.ali_mock_form where id = 'english-full-mock-v1';
  if v_row.active is distinct from false then
    raise exception 'Migration 249 refused: english-full-mock-v1.active is not false (found %) -- refusing to activate a form not in the expected pre-activation state.', v_row.active;
  end if;
  if v_row.subject is distinct from 'english' or v_row.attempt_type is distinct from 'full_mock' then
    raise exception 'Migration 249 refused: english-full-mock-v1 has unexpected subject=% / attempt_type=% (expected english / full_mock).', v_row.subject, v_row.attempt_type;
  end if;
end $$;

-- ── Precondition 2: manifest shape -- exactly 24 entries, no
-- duplicates, exactly 22 reading_comprehension + 1 Q1 + 1 Q2, and every
-- reading id is one of the 22 intended fresh questions (never one of
-- the 28 retired reading-comprehension-mock-1 ids) ─────────────────────
do $$
declare
  v_manifest jsonb;
  v_total_count int;
  v_distinct_count int;
  v_reading_count int;
  v_q1_count int;
  v_q2_count int;
  v_wrong_reading_count int;
  v_target_reading_ids constant text[] := array[
    'eng-inc002-sailandsteam-q01', 'eng-inc002-sailandsteam-q02', 'eng-inc002-sailandsteam-q03',
    'eng-inc002-sailandsteam-q04', 'eng-inc002-sailandsteam-q05b', 'eng-inc002-sailandsteam-q05c',
    'eng-inc002-sailandsteam-q05d', 'eng-inc002-sailandsteam-q05e', 'eng-inc002-sailandsteam-q06',
    'eng-inc002-sailandsteam-q07',
    'eng-inc002-roboticsfinal-q01', 'eng-inc002-roboticsfinal-q02b', 'eng-inc002-roboticsfinal-q02c',
    'eng-inc002-roboticsfinal-q02d', 'eng-inc002-roboticsfinal-q02e', 'eng-inc002-roboticsfinal-q03',
    'eng-inc002-roboticsfinal-q04', 'eng-inc002-roboticsfinal-q05', 'eng-inc002-roboticsfinal-q06',
    'eng-inc002-roboticsfinal-q07a', 'eng-inc002-roboticsfinal-q07b', 'eng-inc002-roboticsfinal-q08'
  ];
begin
  select question_manifest into v_manifest from public.ali_mock_form where id = 'english-full-mock-v1';

  select count(*) into v_total_count from jsonb_array_elements(v_manifest);
  select count(distinct elem ->> 'question_id') into v_distinct_count from jsonb_array_elements(v_manifest) as elem;
  if v_total_count <> 24 or v_distinct_count <> 24 then
    raise exception 'Migration 249 refused: expected 24 manifest entries with no duplicates, found % total / % distinct.', v_total_count, v_distinct_count;
  end if;

  select count(*) into v_reading_count from jsonb_array_elements(v_manifest) as elem where elem ->> 'section' = 'reading_comprehension';
  select count(*) into v_q1_count from jsonb_array_elements(v_manifest) as elem where elem ->> 'section' = 'continuous_writing_q1' and elem ->> 'question_id' = 'mock-writing-mindchange-01';
  select count(*) into v_q2_count from jsonb_array_elements(v_manifest) as elem where elem ->> 'section' = 'continuous_writing_q2' and elem ->> 'question_id' = 'eng-q2-picturenarrative-oldshed';
  if v_reading_count <> 22 or v_q1_count <> 1 or v_q2_count <> 1 then
    raise exception 'Migration 249 refused: expected 22 reading_comprehension + 1 Q1 (mock-writing-mindchange-01) + 1 Q2 (eng-q2-picturenarrative-oldshed), found % / % / %.', v_reading_count, v_q1_count, v_q2_count;
  end if;

  select count(*) into v_wrong_reading_count
  from jsonb_array_elements(v_manifest) as elem
  where elem ->> 'section' = 'reading_comprehension'
    and not (elem ->> 'question_id' = any(v_target_reading_ids));
  if v_wrong_reading_count <> 0 then
    raise exception 'Migration 249 refused: % reading_comprehension manifest entries are not among the 22 intended fresh questions -- refusing to activate a form that may reference retired content.', v_wrong_reading_count;
  end if;
end $$;

-- ── Precondition 3: none of the 22 fresh reading ids overlaps
-- reading-comprehension-mock-1's own current manifest (the exact
-- collision migration 208 blocked once already) ─────────────────────────
do $$
declare
  v_overlap_count int;
begin
  select count(*) into v_overlap_count
  from jsonb_array_elements((select question_manifest from public.ali_mock_form where id = 'english-full-mock-v1')) as new_elem
  where new_elem ->> 'section' = 'reading_comprehension'
    and exists (
      select 1
      from jsonb_array_elements((select question_manifest from public.ali_mock_form where id = 'reading-comprehension-mock-1')) as old_elem
      where old_elem ->> 'question_id' = new_elem ->> 'question_id'
    );
  if v_overlap_count <> 0 then
    raise exception 'Migration 249 refused: % of english-full-mock-v1''s reading questions overlap reading-comprehension-mock-1''s own manifest -- the exact condition migration 208 exists to prevent.', v_overlap_count;
  end if;
end $$;

-- ── Precondition 4: comprehension component totals 39 marks, all 22
-- reading questions plus Q1 plus Q2 are genuinely mock_eligible and
-- active right now ───────────────────────────────────────────────────────
do $$
declare
  v_marks_total numeric;
  v_eligible_count int;
  v_target_ids constant text[] := array[
    'eng-inc002-sailandsteam-q01', 'eng-inc002-sailandsteam-q02', 'eng-inc002-sailandsteam-q03',
    'eng-inc002-sailandsteam-q04', 'eng-inc002-sailandsteam-q05b', 'eng-inc002-sailandsteam-q05c',
    'eng-inc002-sailandsteam-q05d', 'eng-inc002-sailandsteam-q05e', 'eng-inc002-sailandsteam-q06',
    'eng-inc002-sailandsteam-q07',
    'eng-inc002-roboticsfinal-q01', 'eng-inc002-roboticsfinal-q02b', 'eng-inc002-roboticsfinal-q02c',
    'eng-inc002-roboticsfinal-q02d', 'eng-inc002-roboticsfinal-q02e', 'eng-inc002-roboticsfinal-q03',
    'eng-inc002-roboticsfinal-q04', 'eng-inc002-roboticsfinal-q05', 'eng-inc002-roboticsfinal-q06',
    'eng-inc002-roboticsfinal-q07a', 'eng-inc002-roboticsfinal-q07b', 'eng-inc002-roboticsfinal-q08'
  ];
begin
  select coalesce(sum((prompt ->> 'marks')::numeric), 0) into v_marks_total
  from public.ali_question_bank where id = any(v_target_ids);
  if v_marks_total <> 39 then
    raise exception 'Migration 249 refused: comprehension component totals % marks, expected exactly 39.', v_marks_total;
  end if;

  select count(*) into v_eligible_count
  from public.ali_question_bank
  where id = any(v_target_ids || array['mock-writing-mindchange-01', 'eng-q2-picturenarrative-oldshed'])
    and eligibility_status = 'mock_eligible' and active = true;
  if v_eligible_count <> 24 then
    raise exception 'Migration 249 refused: expected all 24 manifest questions (22 reading + Q1 + Q2) to be mock_eligible and active, found %.', v_eligible_count;
  end if;
end $$;

-- ── Precondition 5: Q2's image stimulus relationship is intact (a real,
-- non-null asset path, not merely present) ──────────────────────────────
do $$
declare
  v_image_url text;
begin
  select prompt -> 'stimulus' ->> 'imageAssetUrl' into v_image_url
  from public.ali_question_bank where id = 'eng-q2-picturenarrative-oldshed';
  if v_image_url is null or v_image_url = '' then
    raise exception 'Migration 249 refused: eng-q2-picturenarrative-oldshed has no imageAssetUrl -- refusing to activate a form whose Q2 stimulus is not real.';
  end if;
end $$;

-- ── Precondition 6: the Writing assessment and Writing->EI ingestion
-- structures this form's own Writing tasks depend on actually exist
-- (migrations 245/247) ───────────────────────────────────────────────────
do $$
begin
  if to_regclass('public.ali_writing_assessment') is null then
    raise exception 'Migration 249 refused: ali_writing_assessment table does not exist -- migration 245''s schema is not applied.';
  end if;
  if to_regprocedure('public.mock_persist_writing_assessment(uuid, text, text, integer, integer, jsonb, numeric, text, text[], text)') is null then
    raise exception 'Migration 249 refused: mock_persist_writing_assessment() does not exist.';
  end if;
  if to_regprocedure('public.mock_claim_writing_evidence_ingestion(uuid, text)') is null then
    raise exception 'Migration 249 refused: mock_claim_writing_evidence_ingestion() does not exist -- migration 247 is not applied.';
  end if;
end $$;

-- ── Activation: exactly one row affected, nothing else touched ─────────
do $$
declare
  v_row_count int;
begin
  update public.ali_mock_form set active = true where id = 'english-full-mock-v1';
  get diagnostics v_row_count = row_count;
  if v_row_count <> 1 then
    raise exception 'Migration 249 refused: activation UPDATE affected % rows, expected exactly 1. Transaction will roll back.', v_row_count;
  end if;
end $$;

-- ── Postconditions: re-verify within the same transaction before
-- committing ───────────────────────────────────────────────────────────
do $$
declare
  v_new_row public.ali_mock_form;
  v_reading_row public.ali_mock_form;
  v_maths_row public.ali_mock_form;
  v_manifest_count int;
  v_ineligible_count int;
  v_target_ids constant text[] := array[
    'eng-inc002-sailandsteam-q01', 'eng-inc002-sailandsteam-q02', 'eng-inc002-sailandsteam-q03',
    'eng-inc002-sailandsteam-q04', 'eng-inc002-sailandsteam-q05b', 'eng-inc002-sailandsteam-q05c',
    'eng-inc002-sailandsteam-q05d', 'eng-inc002-sailandsteam-q05e', 'eng-inc002-sailandsteam-q06',
    'eng-inc002-sailandsteam-q07',
    'eng-inc002-roboticsfinal-q01', 'eng-inc002-roboticsfinal-q02b', 'eng-inc002-roboticsfinal-q02c',
    'eng-inc002-roboticsfinal-q02d', 'eng-inc002-roboticsfinal-q02e', 'eng-inc002-roboticsfinal-q03',
    'eng-inc002-roboticsfinal-q04', 'eng-inc002-roboticsfinal-q05', 'eng-inc002-roboticsfinal-q06',
    'eng-inc002-roboticsfinal-q07a', 'eng-inc002-roboticsfinal-q07b', 'eng-inc002-roboticsfinal-q08',
    'mock-writing-mindchange-01', 'eng-q2-picturenarrative-oldshed'
  ];
begin
  select * into v_new_row from public.ali_mock_form where id = 'english-full-mock-v1';
  if v_new_row.active is distinct from true then
    raise exception 'Migration 249 postcondition failed: english-full-mock-v1.active is not true after activation.';
  end if;

  select count(*) into v_manifest_count from jsonb_array_elements(v_new_row.question_manifest);
  if v_manifest_count <> 24 then
    raise exception 'Migration 249 postcondition failed: english-full-mock-v1''s manifest changed during activation (now % entries, expected 24) -- this migration must only ever change active.', v_manifest_count;
  end if;

  select * into v_reading_row from public.ali_mock_form where id = 'reading-comprehension-mock-1';
  if v_reading_row.active is distinct from true or jsonb_array_length(v_reading_row.question_manifest) <> 28 then
    raise exception 'Migration 249 postcondition failed: reading-comprehension-mock-1 no longer matches its own expected state (active=%, manifest length=%) -- refusing to commit.', v_reading_row.active, jsonb_array_length(v_reading_row.question_manifest);
  end if;

  select * into v_maths_row from public.ali_mock_form where id = 'first-mock-mathematics-v1';
  if v_maths_row.active is distinct from true or jsonb_array_length(v_maths_row.question_manifest) <> 56 then
    raise exception 'Migration 249 postcondition failed: first-mock-mathematics-v1 no longer matches its own expected state (active=%, manifest length=%) -- refusing to commit.', v_maths_row.active, jsonb_array_length(v_maths_row.question_manifest);
  end if;

  select count(*) into v_ineligible_count
  from public.ali_question_bank
  where id = any(v_target_ids) and (eligibility_status <> 'mock_eligible' or active <> true);
  if v_ineligible_count <> 0 then
    raise exception 'Migration 249 postcondition failed: % of the 24 manifest questions are no longer mock_eligible/active -- refusing to commit.', v_ineligible_count;
  end if;
end $$;

commit;

-- ============================================================
-- MIGRATION SAFETY REVIEW
-- ============================================================
-- - Six named, fail-loud precondition checks, an exactly-one-row-guarded
--   activation UPDATE, and four named postcondition checks, all inside
--   ONE transaction -- any single failure anywhere rolls back the entire
--   migration, including the activation itself. No partial activation
--   is possible.
-- - Touches exactly one row in exactly one table
--   (ali_mock_form.active for english-full-mock-v1). No other row in
--   any table is written by this migration.
-- - reading-comprehension-mock-1 and first-mock-mathematics-v1 are read
--   only, for postcondition comparison -- never written.
-- - ali_block_mock_form_content_reuse() (migration 208) is not
--   bypassed, not special-cased, not disabled -- it fires on this
--   UPDATE exactly as it would on any other, and passes because this
--   UPDATE does not change question_manifest and the trigger's own
--   predicate already excludes a row from conflicting with itself.
--
-- ============================================================
-- RLS REVIEW
-- ============================================================
-- No RLS policy created, altered, or referenced.
--
-- ============================================================
-- BACKWARD COMPATIBILITY
-- ============================================================
-- Strictly scoped. Mathematics Mock 1 and Reading Comprehension Mock 1
-- are read-only referenced for postcondition verification and are
-- otherwise completely untouched.
--
-- ============================================================
-- ROLLBACK
-- ============================================================
-- `update public.ali_mock_form set active = false where id = 'english-full-mock-v1';`
-- Safe at any time -- reverses the one effect this migration has.
