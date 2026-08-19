-- Angel Digital 11+ — Migration 079
-- Stage 3, Increment 004, Post-Increment Review-Readiness Correction —
-- registers the 11 new provisional MR-04 questions from migration 078
-- (Stage 3, Increment 003 / Decision 116) as awaiting an independent
-- reviewer, exactly the same placeholder-seeding pattern migration 067
-- established for Educational Increment 007X. Without this migration,
-- fetchPendingReviewTargets() (lib/adminReview.ts) has nothing to return
-- for these three families -- they are database-driven, not merely
-- unlabelled: a family with no 'pending_independent_review' row is
-- invisible to /admin-beta/review, not just poorly named in it.
--
-- Mirrors migration 067's proven minimal executable form (comment-free
-- between begin/commit) after that migration's own documented SQL Editor
-- parsing incident with prose-heavy comments inside a transaction.
--
-- reviewer is explicitly 'UNASSIGNED'. No row's eligibility_status
-- changes; all 11 questions remain 'provisional'. This migration inserts
-- ONLY placeholder rows recording that review is awaited -- it does not
-- itself constitute, preselect, or imply any review decision. review_type
-- is set explicitly to 'content_review' (the same value migration 067
-- used for its own new-content placeholders; no new review_type or schema
-- change is required). The idempotency guard checks family_id + decision
-- + review_type + notes together, so it can never be satisfied by an
-- unrelated historical row for the same family.
--
-- Full review evidence for every target named below lives in
-- ALI_DECISION_LOG.md Decision 116 (authoring) and Decision 117
-- (educational review findings, disclosed to the reviewer verbatim via
-- the app's own MR04_DEPTH_FAMILIES disclosure banner, lib/adminReview.ts).
--
-- NOT APPLIED. Founder must apply via the Supabase Dashboard SQL Editor.

begin;

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select
'question_family',
'mr04-reverse-percentage',
'UNASSIGNED',
'pending_independent_review'::public.family_review_decision,
'STAGE3-INC004-MR04-DEPTH new content review: mr04-revpct-01..04',
'content_review'
where not exists (
    select 1
    from public.ali_family_review
    where family_id = 'mr04-reverse-percentage'
      and decision = 'pending_independent_review'
      and review_type = 'content_review'
      and notes = 'STAGE3-INC004-MR04-DEPTH new content review: mr04-revpct-01..04'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select
'question_family',
'mr04-time-reverse',
'UNASSIGNED',
'pending_independent_review'::public.family_review_decision,
'STAGE3-INC004-MR04-DEPTH new content review: mr04-timerev-01..04',
'content_review'
where not exists (
    select 1
    from public.ali_family_review
    where family_id = 'mr04-time-reverse'
      and decision = 'pending_independent_review'
      and review_type = 'content_review'
      and notes = 'STAGE3-INC004-MR04-DEPTH new content review: mr04-timerev-01..04'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select
'question_family',
'mr04-bv-convert',
'UNASSIGNED',
'pending_independent_review'::public.family_review_decision,
'STAGE3-INC004-MR04-DEPTH new content review: mr04-bvconv-01..03',
'content_review'
where not exists (
    select 1
    from public.ali_family_review
    where family_id = 'mr04-bv-convert'
      and decision = 'pending_independent_review'
      and review_type = 'content_review'
      and notes = 'STAGE3-INC004-MR04-DEPTH new content review: mr04-bvconv-01..03'
);

commit;
