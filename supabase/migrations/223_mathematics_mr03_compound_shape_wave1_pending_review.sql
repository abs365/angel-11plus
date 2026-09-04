-- Angel Digital 11+ — Migration 223
-- Programme Increment 020, Part 15 — review-target registration for the
-- new mr03-compound-area-perimeter family (migration 222).
--
-- This migration ONLY registers a review target. It does not touch
-- ali_question_bank, does not promote anything toward practice_eligible,
-- and does not itself constitute review -- reviewer is explicitly
-- 'UNASSIGNED', matching the established, Founder-instructed convention
-- (migration 053) of never impersonating an independent reviewer.
--
-- Idempotent (WHERE NOT EXISTS per family_id + decision), matching
-- migration 053's own established pattern exactly.
--
-- NOT APPLIED. Generated for Founder/reviewer application via Supabase
-- Dashboard > SQL Editor > New query, after migration 222 has been
-- applied.

begin;

insert into public.ali_family_review (review_target_type, family_id, reviewer, decision, notes)
select 'question_family', 'mr03-compound-area-perimeter', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'Programme Increment 020, Wave 1. 8 new rows (mr03-compound-01 through mr03-compound-08), a genuinely new Practice-track family covering compound rectilinear (L-shape/staircase) shapes -- confirmed zero prior Practice-track coverage of this sub-topic. Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Grouped as a single family for review rather than 8 separate targets, per Part 15''s "smallest useful review pack" instruction.'
where not exists (
  select 1 from public.ali_family_review existing
  where existing.review_target_type = 'question_family'
    and existing.family_id = 'mr03-compound-area-perimeter'
    and existing.decision = 'pending_independent_review'
);

commit;
