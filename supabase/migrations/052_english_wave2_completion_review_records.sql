-- Angel Digital 11+ — Migration 052
-- Educational Increment 007C completion, Part 10 — records the 1 new
-- Wave 2 passage added on completion (wave2-eng-surprise) as awaiting an
-- independent reviewer, using the same review_target_type extension
-- (migration 047) migration 050 already used for the original 8 Wave 2
-- passages and the new wave2-fam-multiselect family.
--
-- Does NOT duplicate migration 050's 9 existing targets: the 12
-- completion questions all reuse families that were already registered
-- (8 from Wave 1, plus wave2-fam-multiselect from migration 050) — no
-- new family was introduced on completion, only a new passage.
--
-- reviewer is explicitly 'UNASSIGNED'. No row's eligibility_status
-- changes; wave2-eng-surprise and all 12 completion questions remain
-- 'provisional'.
--
-- Idempotent by construction (WHERE NOT EXISTS per target), matching the
-- established pattern from migrations 042/048/050.
--
-- Run this in: Supabase Dashboard > SQL Editor > New query, as its own
-- standalone execution, after migrations 047 and 051.

begin;

insert into public.ali_family_review (review_target_type, family_id, reviewer, decision, notes)
select v.review_target_type, v.family_id, 'UNASSIGNED', 'pending_independent_review'::public.family_review_decision, v.notes
from (
  values
    ('passage', 'wave2-eng-surprise', 'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Added on 007C completion (Part 4 — existing passages assessed first, this one written only where genuine capacity was lacking). Review evidence pack: ENGLISH_WAVE2_REVIEW_PACKS_V1.md#wave2-eng-surprise.')
) as v(review_target_type, family_id, notes)
where not exists (
  select 1 from public.ali_family_review existing
  where existing.review_target_type = v.review_target_type
    and existing.family_id = v.family_id
    and existing.decision = 'pending_independent_review'
);

commit;
