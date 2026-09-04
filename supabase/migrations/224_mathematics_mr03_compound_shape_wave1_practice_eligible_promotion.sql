-- Angel Digital 11+ — Migration 224
-- Programme Increment 020, Wave 1 — mr03-compound-area-perimeter Practice
-- Eligibility Promotion.
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS
-- ============================================================
-- Migrations 222 (content, 8 rows, 'provisional') and 223 (review-target
-- registration) are Founder-confirmed applied and live-verified. Since
-- then, three real, live, additive `ali_family_review` rows exist for
-- this family (all independently confirmed via read-only production
-- queries this programme, never asserted from memory):
--   1. review_type='content_review', reviewer='UNASSIGNED',
--      decision='pending_independent_review' (from migration 223 itself).
--   2. review_type='content_review', reviewer='Ayobami Lawal',
--      decision='approved_with_amendment' -- the Founder's own real,
--      genuine educational decision, submitted through /admin-beta/review.
--   3. review_type='amendment_verification', reviewer='Ayobami Lawal',
--      decision='approved' -- confirming the required diagram amendment
--      (mr03-compound-06's schematic/notToScale redraw) was implemented
--      and checked against decision 2, without rewriting it.
-- This migration promotes exactly the 8 rows migration 222 created, from
-- 'provisional' to 'practice_eligible', gated on live re-verification of
-- ALL of the above -- mirroring the established, real precedent
-- (migrations 105, 201->202->203) exactly: review closure is read live,
-- never assumed from a historical claim or from this file's own header.
--
-- ============================================================
-- SCOPE: EXACTLY 8 ROWS, SAME IDS AS MIGRATION 222
-- ============================================================
-- mr03-compound-01 through mr03-compound-08, family_id
-- 'mr03-compound-area-perimeter'. mr03-compound-06 receives the SAME
-- eligibility_status transition as every other row in this migration --
-- no distinct eligibility_status exists for "measurement" content (the
-- real `ali_question_bank_eligibility_status_check` constraint,
-- migration 030, permits exactly 5 values: provisional, practice_eligible,
-- authentic_assessment_candidate, independently_validated, mock_eligible
-- -- there is no sixth value this migration could target even if it
-- wanted to). mr03-compound-06's own `transfer_class = 'FAR_TRANSFER'`
-- (set at authoring, migration 222, unchanged by the diagram amendment)
-- is what causes `lib/ali/inventoryClass.ts`'s own real classification
-- function to read it as MEASUREMENT once promoted -- a downstream,
-- read-only interpretation of practice_eligible + FAR_TRANSFER together,
-- never a different promotion action.
--
-- ============================================================
-- REAL PRECONDITION: REVIEW CLOSURE, NOT MERELY STATUS
-- ============================================================
-- For every one of the 8 ids, requires ALL of:
--   (a) subject = 'maths', skill = 'QT-MR-07', family_id =
--       'mr03-compound-area-perimeter', provenance = 'angel_original',
--       eligibility_status = 'provisional', active = true (live-checked,
--       never assumed).
--   (b) exactly 8 rows total carry this family_id, with no unexpected
--       extra row (a partial/contaminated family refuses the whole
--       migration).
--   (c) none is already mock_eligible, and none has ever appeared in
--       ali_mock_exposed_question_ids (the same real, canonical Mock-
--       exposure signal this programme already uses everywhere else for
--       this exact purpose) -- the stricter Mock protection always wins,
--       matching lib/ali/inventoryClass.ts's own established precedence.
--   (d) a genuinely closed review decision exists for family_id
--       'mr03-compound-area-perimeter': either a real (reviewer <>
--       'UNASSIGNED') row with decision = 'approved', OR a real row with
--       decision = 'approved_with_amendment' AND a SEPARATE real
--       (reviewer <> 'UNASSIGNED') row with review_type =
--       'amendment_verification' AND decision = 'approved' -- mirroring
--       migration 203's own exact gate, generalised from a hardcoded
--       'FOUNDER' literal to "any real, non-placeholder reviewer
--       identity," since this family's own real reviewer is
--       'Ayobami Lawal', not the literal string 'FOUNDER'. A lone
--       historical 'pending_independent_review'/'UNASSIGNED' row is
--       explicitly NEVER sufficient on its own (Part 13 of this
--       increment's own instruction) -- checked by requiring a distinct,
--       real closing decision, not merely "some row exists."
--   (e) mr03-compound-06 specifically still carries answer = '12m',
--       prompt.diagram.notToScale = true, and transfer_class =
--       'FAR_TRANSFER' -- re-verified live immediately before promoting,
--       refusing if the amendment has silently regressed since it was
--       verified.
-- Refuses (RAISE EXCEPTION, naming the exact failing check) if any
-- condition is not met for any of the 8 -- never a partial promotion.
--
-- ============================================================
-- SAFETY
-- ============================================================
-- Content-immutable: only eligibility_status is ever SET. No other
-- column (subject/skill/family_id/provenance/transfer_class/prompt/
-- active/content_version) is ever touched. No ali_family_review row is
-- written, updated, or deleted -- read-only against that table. No Mock
-- table, Mock form, or Mock composition is touched. No Reading/passage
-- table is touched. Post-write re-verification confirms: exactly 8 rows
-- now practice_eligible, zero remain provisional, zero are
-- mock_eligible, zero are Mock-exposed, the family is still exactly 8
-- rows, and mr03-compound-06's answer/notToScale/transfer_class are
-- unchanged. Idempotent three-state structure (PRISTINE / ALREADY-
-- APPLIED / MIXED-refuse), matching this codebase's own established
-- promotion-migration convention (migrations 105, 142, 182, 203) exactly.
-- Wrapped in a single begin/commit transaction.
--
-- ============================================================
-- PRACTICE REACHABILITY (verified this session, not assumed)
-- ============================================================
-- lib/ali/questionBank.ts's own real fetchQuestionBank() gate is a
-- positive allow-list of EXACTLY `eligibility_status = 'practice_eligible'`
-- (Decision 152's own correction, replacing an earlier, wrong "status OR
-- HIGHER" IN-list model) -- 'provisional' is excluded by this same allow-
-- list today (confirmed directly in that file this session), which is
-- exactly why these 8 rows are genuinely unreachable right now. Reinforced,
-- not merely duplicated, at the database layer: migration 100 narrows
-- `ali_question_bank`'s own RLS SELECT policy to this identical single
-- allowed value. Once promoted, these 8 rows become genuinely reachable
-- through the SAME, single, canonical retrieval path every other
-- Mathematics family already uses (lib/learningEngine/sessionGenerator.ts
-- -> lib/ali/selection.ts), gated only by pathway='csse' (already set on
-- all 8) and active=true (already true) -- no second retrieval mechanism
-- exists or is created here. Family/competency/difficulty/transfer-class/
-- retrieval selection all key off family_id/skill/content_difficulty/
-- transfer_class, all already correctly set since authoring and
-- unchanged by this migration. Preparation Horizon's own
-- hasFullLessonAvailable (lib/learningEngine/fullLessonRegistry.ts)
-- already lists MR-03, independent of this promotion.
--
-- NOT APPLIED. Founder must apply via Supabase Dashboard SQL Editor,
-- after migrations 222/223 (already applied) and only once satisfied
-- with the live review evidence this migration itself re-verifies.

begin;

do $$
declare
  v_target_ids constant text[] := array[
    'mr03-compound-01', 'mr03-compound-02', 'mr03-compound-03', 'mr03-compound-04',
    'mr03-compound-05', 'mr03-compound-06', 'mr03-compound-07', 'mr03-compound-08'
  ];
  v_family constant text := 'mr03-compound-area-perimeter';
  v_total_family_count int;
  v_pending_count int;
  v_already_promoted_count int;
  v_wrong_shape_count int;
  v_mock_eligible_count int;
  v_mock_exposed_count int;
  v_closed_review_count int;
  v_q06_ok boolean;
  v_post_promoted_count int;
  v_post_provisional_count int;
  v_post_mock_eligible_count int;
  v_post_mock_exposed_count int;
  v_post_family_count int;
begin
  -- (b) Exactly 8 rows in this family, no unexpected extra row.
  select count(*) into v_total_family_count
  from public.ali_question_bank where family_id = v_family;
  if v_total_family_count <> 8 then
    raise exception 'Migration 224 refused: expected exactly 8 rows for family %, found %. A partial or contaminated family must never be promoted.', v_family, v_total_family_count;
  end if;

  -- (a) All 8 named ids exist with the exact expected shape, still provisional.
  select count(*) into v_pending_count
  from public.ali_question_bank
  where id = any(v_target_ids)
    and subject = 'maths'
    and skill = 'QT-MR-07'
    and family_id = v_family
    and provenance = 'angel_original'
    and eligibility_status = 'provisional'
    and active = true;

  select count(*) into v_already_promoted_count
  from public.ali_question_bank
  where id = any(v_target_ids) and eligibility_status = 'practice_eligible';

  if v_already_promoted_count = 8 then
    raise notice 'Migration 224: all 8 target rows are already practice_eligible -- already applied. No changes made.';
    return;
  end if;

  if v_pending_count <> 8 then
    select count(*) into v_wrong_shape_count
    from public.ali_question_bank
    where id = any(v_target_ids)
      and not (subject = 'maths' and skill = 'QT-MR-07' and family_id = v_family and provenance = 'angel_original' and eligibility_status = 'provisional' and active = true);
    raise exception 'Migration 224 refused: expected 8 rows matching subject=maths, skill=QT-MR-07, family_id=%, provenance=angel_original, eligibility_status=provisional, active=true -- found % matching, % not matching. Re-verify production state before proceeding.', v_family, v_pending_count, v_wrong_shape_count;
  end if;

  -- (c) Never mock_eligible, never Mock-exposed -- stricter protection always wins.
  select count(*) into v_mock_eligible_count
  from public.ali_question_bank where id = any(v_target_ids) and eligibility_status = 'mock_eligible';
  if v_mock_eligible_count <> 0 then
    raise exception 'Migration 224 refused: % of the 8 target rows are already mock_eligible -- this must never happen for a Practice-track family. Investigate before proceeding.', v_mock_eligible_count;
  end if;

  select count(*) into v_mock_exposed_count
  from public.ali_question_bank q
  join public.ali_mock_exposed_question_ids ex on ex.question_id = q.id
  where q.id = any(v_target_ids);
  if v_mock_exposed_count <> 0 then
    raise exception 'Migration 224 refused: % of the 8 target rows have been Mock-exposed -- this Practice-track family must never have touched Mock. Investigate before proceeding.', v_mock_exposed_count;
  end if;

  -- (d) A genuinely closed review decision exists for this family -- never
  -- inferred merely from the pending/UNASSIGNED row's own existence.
  select count(*) into v_closed_review_count
  from public.ali_family_review
  where review_target_type = 'question_family'
    and family_id = v_family
    and reviewer <> 'UNASSIGNED'
    and (
      decision = 'approved'
      or (
        decision = 'approved_with_amendment'
        and exists (
          select 1 from public.ali_family_review r2
          where r2.review_target_type = 'question_family'
            and r2.family_id = v_family
            and r2.reviewer <> 'UNASSIGNED'
            and r2.review_type = 'amendment_verification'
            and r2.decision = 'approved'
        )
      )
    );
  if v_closed_review_count < 1 then
    raise exception 'Migration 224 refused: family % has no closed, real (non-UNASSIGNED) review decision in ali_family_review (approved, or approved_with_amendment + a real amendment_verification/approved row). A lone pending_independent_review/UNASSIGNED row is never sufficient.', v_family;
  end if;

  -- (e) mr03-compound-06's amendment must not have silently regressed.
  select (
    (select prompt->>'answer' from public.ali_question_bank where id = 'mr03-compound-06') = '12m'
    and (select (prompt->'diagram'->>'notToScale')::boolean from public.ali_question_bank where id = 'mr03-compound-06') is true
    and (select transfer_class from public.ali_question_bank where id = 'mr03-compound-06') = 'FAR_TRANSFER'
  ) into v_q06_ok;
  if not v_q06_ok then
    raise exception 'Migration 224 refused: mr03-compound-06 no longer has answer=12m, diagram.notToScale=true, and transfer_class=FAR_TRANSFER all together -- the Founder-verified amendment appears to have regressed. Refusing to promote.';
  end if;

  -- === All preconditions satisfied: promote exactly these 8 rows ===
  update public.ali_question_bank
  set eligibility_status = 'practice_eligible'
  where id = any(v_target_ids) and eligibility_status = 'provisional';

  -- === Post-write re-verification ===
  select count(*) into v_post_promoted_count
  from public.ali_question_bank where id = any(v_target_ids) and eligibility_status = 'practice_eligible';
  if v_post_promoted_count <> 8 then
    raise exception 'Migration 224 post-write verification failed: expected 8 rows now practice_eligible, found %. Rolling back.', v_post_promoted_count;
  end if;

  select count(*) into v_post_provisional_count
  from public.ali_question_bank where id = any(v_target_ids) and eligibility_status = 'provisional';
  if v_post_provisional_count <> 0 then
    raise exception 'Migration 224 post-write verification failed: % of the 8 rows remain provisional. Rolling back.', v_post_provisional_count;
  end if;

  select count(*) into v_post_mock_eligible_count
  from public.ali_question_bank where id = any(v_target_ids) and eligibility_status = 'mock_eligible';
  if v_post_mock_eligible_count <> 0 then
    raise exception 'Migration 224 post-write verification failed: % of the 8 rows are mock_eligible after this write -- must never happen. Rolling back.', v_post_mock_eligible_count;
  end if;

  select count(*) into v_post_mock_exposed_count
  from public.ali_question_bank q
  join public.ali_mock_exposed_question_ids ex on ex.question_id = q.id
  where q.id = any(v_target_ids);
  if v_post_mock_exposed_count <> 0 then
    raise exception 'Migration 224 post-write verification failed: % of the 8 rows are Mock-exposed after this write -- must never happen. Rolling back.', v_post_mock_exposed_count;
  end if;

  select count(*) into v_post_family_count
  from public.ali_question_bank where family_id = v_family;
  if v_post_family_count <> 8 then
    raise exception 'Migration 224 post-write verification failed: family % no longer has exactly 8 rows (found %). Rolling back.', v_family, v_post_family_count;
  end if;

  select (
    (select prompt->>'answer' from public.ali_question_bank where id = 'mr03-compound-06') = '12m'
    and (select (prompt->'diagram'->>'notToScale')::boolean from public.ali_question_bank where id = 'mr03-compound-06') is true
    and (select transfer_class from public.ali_question_bank where id = 'mr03-compound-06') = 'FAR_TRANSFER'
  ) into v_q06_ok;
  if not v_q06_ok then
    raise exception 'Migration 224 post-write verification failed: mr03-compound-06 no longer has answer=12m, diagram.notToScale=true, and transfer_class=FAR_TRANSFER all together. Rolling back.';
  end if;

  raise notice 'Migration 224: promoted 8 mr03-compound-area-perimeter rows from provisional to practice_eligible. Review closure verified live (real, non-UNASSIGNED reviewer, approved_with_amendment + amendment_verification/approved). Zero mock_eligible, zero Mock-exposed, family remains exactly 8 rows, mr03-compound-06''s amendment confirmed intact.';
end $$;

commit;
