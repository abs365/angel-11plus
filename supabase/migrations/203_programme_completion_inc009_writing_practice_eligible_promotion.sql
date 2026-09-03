-- Angel Digital 11+ — Migration 203
-- Programme Completion Increment 009 — Writing Practice Eligibility
-- Promotion, CORRECTED, SUPERSEDES MIGRATION 200.
--
-- ============================================================
-- DO NOT APPLY MIGRATION 200. APPLY THIS MIGRATION INSTEAD.
-- ============================================================
-- Migration 200 (Increment 007) targeted the same 5 ids below, but its
-- only precondition was eligibility_status = 'authentic_assessment_candidate'
-- -- it never queried ali_family_review at all, so it could not
-- distinguish "genuinely review-closed" from "merely still a candidate."
-- That gap matters specifically for eng-pc005-writing-somethingnew: its
-- Founder decision is approved_with_amendment, not plain approved, and
-- the Founder's own instruction is explicit that this must not be
-- silently treated as closed until a separate amendment_verification
-- record exists (migration 202). Migration 200's own precondition would
-- have promoted it regardless of whether that verification had actually
-- happened. Per the Founder's own Increment 009 instruction ("supersede
-- 200 with a corrected promotion migration rather than mutating
-- historical migration intent ambiguously"), migration 200's file is left
-- untouched as an inert historical artifact; this migration is the
-- corrected, authoritative replacement.
--
-- ============================================================
-- SCOPE: EXACTLY 5 ROWS, SAME IDS AS MIGRATION 200
-- ============================================================
-- eng-inc003-writing-imaginedplace-01, eng-inc003-writing-favouriteplace-01,
-- eng-inc003-writing-pocketmoney-01, eng-pc005-writing-personinfluence,
-- eng-pc005-writing-somethingnew. Deliberately excludes
-- eng-pc003-writing-difficulttask and eng-pc003-writing-meaningfulplace
-- (Founder destination: Protected Reserve, not Practice, despite being
-- review-approved) and every one of the 6 pre-existing
-- independently_validated rows (see migration 204 for the 2 of those 6
-- the Founder separately authorised for Practice; that is a structurally
-- different transition, kept in its own migration).
--
-- ============================================================
-- REAL PRECONDITION: REVIEW CLOSURE, NOT MERELY STATUS
-- ============================================================
-- For each of the 5 ids, requires BOTH:
--   (a) eligibility_status = 'authentic_assessment_candidate', active = true,
--       subject = 'writing' (unchanged from migration 200's own check), AND
--   (b) a genuinely closed review record in ali_family_review, keyed by the
--       row's own family_id: either decision = 'approved', OR
--       (decision = 'approved_with_amendment' AND a separate
--       review_type = 'amendment_verification' row also exists for the
--       same family_id) -- exactly eng-pc005-writing-somethingnew's case.
-- Refuses (RAISE EXCEPTION, naming which of the 5 ids fails which check)
-- if either condition is not met for every id -- this migration does not
-- promote a partial set.
--
-- ============================================================
-- SAFETY
-- ============================================================
-- Content-immutable: only eligibility_status is ever SET, promoted
-- directly from authentic_assessment_candidate to practice_eligible
-- (Mock-track statuses skipped entirely, matching migration 181's own
-- precedent -- unchanged reasoning from migration 200's own header). No
-- ali_family_review row is written, updated, or deleted by this
-- migration -- it only reads that table to verify closure. Wrapped in a
-- single begin/commit transaction.
--
-- NOT APPLIED. Must not be applied until migrations 169/173/172/198/199/
-- 201/202 have all been applied (the review evidence this migration reads
-- must already exist).

begin;

do $$
declare
  v_target_ids constant text[] := array[
    'eng-inc003-writing-imaginedplace-01',
    'eng-inc003-writing-favouriteplace-01',
    'eng-inc003-writing-pocketmoney-01',
    'eng-pc005-writing-personinfluence',
    'eng-pc005-writing-somethingnew'
  ];
  v_family_ids constant text[] := array[
    'eng-inc003-writing-wc01a-imaginedplace',
    'eng-inc003-writing-wc01a-favouriteplace',
    'eng-inc003-writing-wc01a-pocketmoney',
    'mock-writing-wc01a-personinfluence',
    'mock-writing-wc01a-somethingnew'
  ];
  v_pending_count int;
  v_already_promoted_count int;
  v_closed_count int;
  v_id text;
  v_family text;
  i int;
begin
  select count(*) into v_pending_count
  from public.ali_question_bank
  where id = any(v_target_ids)
    and eligibility_status = 'authentic_assessment_candidate'
    and active = true
    and subject = 'writing';

  select count(*) into v_already_promoted_count
  from public.ali_question_bank
  where id = any(v_target_ids) and eligibility_status = 'practice_eligible';

  if v_already_promoted_count = 5 then
    raise notice 'Migration 203: all 5 target prompts are already practice_eligible -- already applied. No changes made.';
    return;
  end if;

  if v_pending_count <> 5 then
    raise exception 'Migration 203 refused: expected 5 authentic_assessment_candidate writing rows across the 5 named IDs (found %). Apply migrations 169/173/172/198/199 first, or re-verify production state.', v_pending_count;
  end if;

  -- Review-closure check, per id, naming the exact failure if one exists.
  for i in 1..5 loop
    v_id := v_target_ids[i];
    v_family := v_family_ids[i];

    select count(*) into v_closed_count
    from public.ali_family_review
    where family_id = v_family
      and reviewer = 'FOUNDER'
      and (
        decision = 'approved'
        or (
          decision = 'approved_with_amendment'
          and exists (
            select 1 from public.ali_family_review r2
            where r2.family_id = v_family and r2.reviewer = 'FOUNDER' and r2.review_type = 'amendment_verification'
          )
        )
      );

    if v_closed_count < 1 then
      raise exception 'Migration 203 refused: % (family_id %) has no closed Founder review decision (approved, or approved_with_amendment + amendment_verification) in ali_family_review. Apply migrations 201/202 first.', v_id, v_family;
    end if;
  end loop;

  update public.ali_question_bank
  set eligibility_status = 'practice_eligible'
  where id = any(v_target_ids)
    and eligibility_status = 'authentic_assessment_candidate';

  raise notice 'Migration 203: promoted 5 Continuous Writing prompts from authentic_assessment_candidate to practice_eligible, each with a verified closed review decision.';
end $$;

commit;
