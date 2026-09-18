-- Angel Digital 11+ — Migration 259
-- Educational Depth Phase 1, Wave 2 — Writing Picture-Led Narrative,
-- "The Treehouse Lantern" Practice Eligibility Promotion.
--
-- ============================================================
-- WHY THIS EXISTS
-- ============================================================
-- Migration 257 authored the replacement candidate
-- (eng-practice-writing-picturenarrative-treehouselantern-01, family_id
-- eng-practice-writing-wc01b-treehouselantern) after the Founder REJECTED
-- migration 255's riverboat candidate (real Year 5 target-learner
-- evidence: "there is nothing to write with the picture"). Migration 258
-- registered the replacement for independent review. Since then, real,
-- live, additive ali_family_review rows exist for this exact family_id
-- (independently confirmed this session via a read-only production query
-- through the authenticated admin review surface, never asserted from
-- memory or from a chat claim alone):
--   1. review_type='mock_writing_prompt_independent_review',
--      reviewer='UNASSIGNED', decision='pending_independent_review'
--      (migration 258's own placeholder).
--   2. review_type='mock_writing_prompt_independent_review',
--      reviewer='Ayobami Lawal', decision='approved' -- the Founder's own
--      real, genuine educational decision, submitted through the live
--      /admin-beta/review interface.
-- This migration promotes exactly the 1 row migration 257 created, from
-- 'authentic_assessment_candidate' to 'practice_eligible', gated on live
-- re-verification of the above -- mirroring this repo's own established
-- precedent (migrations 200/203, generalised the way migration 224
-- generalised 203's own hardcoded reviewer literal) exactly: review
-- closure is read live, never assumed from a historical claim, a chat
-- instruction, or this file's own header.
--
-- ============================================================
-- SCOPE: EXACTLY 1 ROW
-- ============================================================
-- eng-practice-writing-picturenarrative-treehouselantern-01, family_id
-- eng-practice-writing-wc01b-treehouselantern. Does NOT touch, and
-- cannot be satisfied by evidence about, migration 255's own REJECTED
-- picture-narrative candidate row (a wholly different id and family_id,
-- deliberately not named here -- see migration 255/257's own headers)
-- -- that row's own family_id is never referenced by this migration's
-- own checks, and its 'rejected' decision is structurally incapable of
-- satisfying this migration's precondition even if it were. Does not
-- touch migration 246 (Mock's own eng-q2-picturenarrative-oldshed row)
-- or any other Writing row.
--
-- ============================================================
-- REAL PRECONDITION: REVIEW CLOSURE, NOT MERELY STATUS
-- ============================================================
-- Requires ALL of:
--   (a) id = 'eng-practice-writing-picturenarrative-treehouselantern-01',
--       family_id = 'eng-practice-writing-wc01b-treehouselantern',
--       subject = 'writing', skill = 'QT-WC-01b', provenance =
--       'angel_original', eligibility_status =
--       'authentic_assessment_candidate', active = true (live-checked,
--       never assumed).
--   (b) exactly 1 row total carries this family_id (a partial/
--       contaminated family refuses the whole migration).
--   (c) never already mock_eligible, and never Mock-exposed (checked
--       against ali_mock_exposed_question_ids, the same real, canonical
--       Mock-exposure signal this programme already uses everywhere else
--       for this exact purpose) -- the stricter Mock protection always
--       wins, matching migration 224's own precedent.
--   (d) a genuinely closed review decision exists for family_id
--       'eng-practice-writing-wc01b-treehouselantern': a real (reviewer
--       <> 'UNASSIGNED') row with review_type =
--       'mock_writing_prompt_independent_review' and decision =
--       'approved', OR decision = 'approved_with_amendment' AND a
--       SEPARATE real (reviewer <> 'UNASSIGNED') row with review_type =
--       'amendment_verification' for the same family_id -- mirroring
--       migration 224's own generalised gate (any real, non-placeholder
--       reviewer identity, not a hardcoded 'FOUNDER' literal, since this
--       family's own real reviewer is 'Ayobami Lawal') rather than
--       migration 203's older hardcoded-literal form. A lone historical
--       'pending_independent_review'/'UNASSIGNED' row (migration 258's
--       own placeholder) is explicitly never sufficient on its own.
-- Refuses (RAISE EXCEPTION, naming the exact failing check) if any
-- condition is not met -- never a partial or forced promotion.
--
-- ============================================================
-- SAFETY
-- ============================================================
-- Content-immutable: only eligibility_status is ever SET. No prompt,
-- checklist, family_id, provenance, content_version, transfer_class, or
-- active column is touched. No ali_family_review row is written,
-- updated, or deleted -- read-only against that table. No Mock table,
-- Mock form, or Mock composition is touched. Migration 255's rejected
-- riverboat row and migration 246's Mock row are never read or written.
-- Post-write re-verification confirms: the row is now practice_eligible,
-- is not mock_eligible, is not Mock-exposed, and the family still
-- carries exactly 1 row. Idempotent three-state structure (PRISTINE /
-- ALREADY-APPLIED / MIXED-refuse), matching this codebase's own
-- established promotion-migration convention (migrations 105, 142, 182,
-- 203, 224) exactly. Wrapped in a single begin/commit transaction.
--
-- NOT APPLIED. Founder must apply via Supabase Dashboard SQL Editor,
-- after migrations 257/258 (already applied) and only once satisfied
-- with the live review evidence this migration itself re-verifies.

begin;

do $$
declare
  v_id constant text := 'eng-practice-writing-picturenarrative-treehouselantern-01';
  v_family constant text := 'eng-practice-writing-wc01b-treehouselantern';
  v_total_family_count int;
  v_pending_count int;
  v_already_promoted_count int;
  v_mock_eligible_count int;
  v_mock_exposed_count int;
  v_closed_review_count int;
  v_post_promoted boolean;
  v_post_mock_eligible_count int;
  v_post_mock_exposed_count int;
  v_post_family_count int;
begin
  -- (b) Exactly 1 row in this family, no unexpected extra row.
  select count(*) into v_total_family_count
  from public.ali_question_bank where family_id = v_family;
  if v_total_family_count <> 1 then
    raise exception 'Migration 259 refused: expected exactly 1 row for family %, found %. A partial or contaminated family must never be promoted.', v_family, v_total_family_count;
  end if;

  -- (a) The named id exists with the exact expected shape, still a candidate.
  select count(*) into v_pending_count
  from public.ali_question_bank
  where id = v_id
    and family_id = v_family
    and subject = 'writing'
    and skill = 'QT-WC-01b'
    and provenance = 'angel_original'
    and eligibility_status = 'authentic_assessment_candidate'
    and active = true;

  select count(*) into v_already_promoted_count
  from public.ali_question_bank
  where id = v_id and eligibility_status = 'practice_eligible';

  if v_already_promoted_count = 1 then
    raise notice 'Migration 259: % is already practice_eligible -- already applied. No changes made.', v_id;
    return;
  end if;

  if v_pending_count <> 1 then
    raise exception 'Migration 259 refused: expected 1 row matching id=%, family_id=%, subject=writing, skill=QT-WC-01b, provenance=angel_original, eligibility_status=authentic_assessment_candidate, active=true -- found %. Re-verify production state before proceeding.', v_id, v_family, v_pending_count;
  end if;

  -- (c) Never mock_eligible, never Mock-exposed -- stricter protection always wins.
  select count(*) into v_mock_eligible_count
  from public.ali_question_bank where id = v_id and eligibility_status = 'mock_eligible';
  if v_mock_eligible_count <> 0 then
    raise exception 'Migration 259 refused: % is already mock_eligible -- this must never happen for a Practice-track row. Investigate before proceeding.', v_id;
  end if;

  select count(*) into v_mock_exposed_count
  from public.ali_question_bank q
  join public.ali_mock_exposed_question_ids ex on ex.question_id = q.id
  where q.id = v_id;
  if v_mock_exposed_count <> 0 then
    raise exception 'Migration 259 refused: % has been Mock-exposed -- this Practice-track row must never have touched Mock. Investigate before proceeding.', v_id;
  end if;

  -- (d) A genuinely closed review decision exists for this family -- never
  -- inferred merely from the pending/UNASSIGNED placeholder's own existence.
  select count(*) into v_closed_review_count
  from public.ali_family_review
  where review_target_type = 'writing_prompt'
    and family_id = v_family
    and reviewer <> 'UNASSIGNED'
    and review_type = 'mock_writing_prompt_independent_review'
    and (
      decision = 'approved'
      or (
        decision = 'approved_with_amendment'
        and exists (
          select 1 from public.ali_family_review r2
          where r2.review_target_type = 'writing_prompt'
            and r2.family_id = v_family
            and r2.reviewer <> 'UNASSIGNED'
            and r2.review_type = 'amendment_verification'
            and r2.decision = 'approved'
        )
      )
    );
  if v_closed_review_count < 1 then
    raise exception 'Migration 259 refused: family % has no closed, real (non-UNASSIGNED) mock_writing_prompt_independent_review decision in ali_family_review (approved, or approved_with_amendment + a real amendment_verification/approved row). A lone pending_independent_review/UNASSIGNED row is never sufficient.', v_family;
  end if;

  -- === All preconditions satisfied: promote exactly this 1 row ===
  update public.ali_question_bank
  set eligibility_status = 'practice_eligible'
  where id = v_id and eligibility_status = 'authentic_assessment_candidate';

  -- === Post-write re-verification ===
  select (eligibility_status = 'practice_eligible') into v_post_promoted
  from public.ali_question_bank where id = v_id;
  if not v_post_promoted then
    raise exception 'Migration 259 post-write verification failed: % is not practice_eligible after the update. Rolling back.', v_id;
  end if;

  select count(*) into v_post_mock_eligible_count
  from public.ali_question_bank where id = v_id and eligibility_status = 'mock_eligible';
  if v_post_mock_eligible_count <> 0 then
    raise exception 'Migration 259 post-write verification failed: % is mock_eligible after this write -- must never happen. Rolling back.', v_id;
  end if;

  select count(*) into v_post_mock_exposed_count
  from public.ali_question_bank q
  join public.ali_mock_exposed_question_ids ex on ex.question_id = q.id
  where q.id = v_id;
  if v_post_mock_exposed_count <> 0 then
    raise exception 'Migration 259 post-write verification failed: % is Mock-exposed after this write -- must never happen. Rolling back.', v_id;
  end if;

  select count(*) into v_post_family_count
  from public.ali_question_bank where family_id = v_family;
  if v_post_family_count <> 1 then
    raise exception 'Migration 259 post-write verification failed: family % no longer has exactly 1 row (found %). Rolling back.', v_family, v_post_family_count;
  end if;

  raise notice 'Migration 259: promoted % (family %) from authentic_assessment_candidate to practice_eligible. Review closure verified live (real, non-UNASSIGNED reviewer, mock_writing_prompt_independent_review, approved). Zero mock_eligible, zero Mock-exposed, family remains exactly 1 row.', v_id, v_family;
end $$;

commit;

-- ============================================================
-- ROLLBACK
-- ============================================================
-- `update public.ali_question_bank set eligibility_status = 'authentic_assessment_candidate' where id = 'eng-practice-writing-picturenarrative-treehouselantern-01';`
-- Safe at any time before real learner exposure -- no other object depends
-- on this row's eligibility_status.
