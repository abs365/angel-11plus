-- Angel Digital 11+ — Migration 082
-- Stage 3, Increment 006 — Mathematics Structural Depth Expansion.
--
-- Registers the 8 new questions from migration 081 (mr01-reverse-mean,
-- mr03-coord-combined) as awaiting an independent reviewer, exactly the
-- same placeholder-seeding pattern migrations 067 and 079 established.
-- Included proactively in this same increment (per explicit instruction)
-- rather than waiting for the two new families to be found invisible to
-- /admin-beta/review the way the Stage 3 Increment 004 batch was
-- (Decision 118's own root-cause correction).
--
-- reviewer is explicitly 'UNASSIGNED'. No row's eligibility_status
-- changes; all 8 questions remain 'provisional'. This migration inserts
-- ONLY placeholder rows recording that review is awaited -- it does not
-- itself constitute, preselect, or imply any review decision. No
-- reviewer identity is fabricated; no approval is pre-populated.
-- review_type is set explicitly to 'content_review' (no new review_type
-- or schema change required). The idempotency guard checks family_id +
-- decision + review_type + notes together, so it can never be satisfied
-- by an unrelated historical row for the same family.
--
-- Full review evidence for every target named below lives in
-- ALI_DECISION_LOG.md Decision 121 (discovery) and this increment's own
-- decision entry (authoring).
--
-- NOT APPLIED. Founder must apply via the Supabase Dashboard SQL Editor,
-- after (or together with) migration 081.

begin;

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select
'question_family',
'mr01-reverse-mean',
'UNASSIGNED',
'pending_independent_review'::public.family_review_decision,
'STAGE3-INC006-DEPTH new content review: mr01-revmean-01..04',
'content_review'
where not exists (
    select 1
    from public.ali_family_review
    where family_id = 'mr01-reverse-mean'
      and decision = 'pending_independent_review'
      and review_type = 'content_review'
      and notes = 'STAGE3-INC006-DEPTH new content review: mr01-revmean-01..04'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select
'question_family',
'mr03-coord-combined',
'UNASSIGNED',
'pending_independent_review'::public.family_review_decision,
'STAGE3-INC006-DEPTH new content review: mr03-combo-01..04',
'content_review'
where not exists (
    select 1
    from public.ali_family_review
    where family_id = 'mr03-coord-combined'
      and decision = 'pending_independent_review'
      and review_type = 'content_review'
      and notes = 'STAGE3-INC006-DEPTH new content review: mr03-combo-01..04'
);

commit;
