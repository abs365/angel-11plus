-- Angel Digital 11+ — Migration 050
-- Educational Increment 007C, Part 13 — records all 8 Wave 2 passages and
-- the 1 new Wave 2 family (wave2-fam-multiselect; Wave 2's other content
-- reuses Wave 1's 8 already-registered families, not re-registered here)
-- as awaiting an independent reviewer, using the review_target_type
-- extension from migration 047. Depends on migration 047 (and 049, for
-- the content itself to exist) landing first.
--
-- reviewer is explicitly 'UNASSIGNED'. No row's eligibility_status
-- changes; all 50 Wave 2 questions and all 8 Wave 2 passages remain
-- 'provisional'.
--
-- Idempotent by construction (WHERE NOT EXISTS per target), matching the
-- established pattern from migrations 042/048.
--
-- Run this in: Supabase Dashboard > SQL Editor > New query, as its own
-- standalone execution, after migrations 047 and 049.

begin;

insert into public.ali_family_review (review_target_type, family_id, reviewer, decision, notes)
select v.review_target_type, v.family_id, 'UNASSIGNED', 'pending_independent_review'::public.family_review_decision, v.notes
from (
  values
    ('passage', 'wave2-eng-lastslice', 'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review evidence pack: ENGLISH_WAVE2_REVIEW_PACKS_V1.md#wave2-eng-lastslice.'),
    ('passage', 'wave2-eng-morningpatrol', 'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review evidence pack: ENGLISH_WAVE2_REVIEW_PACKS_V1.md#wave2-eng-morningpatrol.'),
    ('passage', 'wave2-eng-understudy', 'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review evidence pack: ENGLISH_WAVE2_REVIEW_PACKS_V1.md#wave2-eng-understudy.'),
    ('passage', 'wave2-eng-twoletters', 'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review evidence pack: ENGLISH_WAVE2_REVIEW_PACKS_V1.md#wave2-eng-twoletters.'),
    ('passage', 'wave2-eng-longwalk', 'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review evidence pack: ENGLISH_WAVE2_REVIEW_PACKS_V1.md#wave2-eng-longwalk.'),
    ('passage', 'wave2-eng-sciencefair', 'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review evidence pack: ENGLISH_WAVE2_REVIEW_PACKS_V1.md#wave2-eng-sciencefair.'),
    ('passage', 'wave2-eng-stormwarning', 'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review evidence pack: ENGLISH_WAVE2_REVIEW_PACKS_V1.md#wave2-eng-stormwarning.'),
    ('passage', 'wave2-eng-pianorecital', 'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review evidence pack: ENGLISH_WAVE2_REVIEW_PACKS_V1.md#wave2-eng-pianorecital.'),
    ('question_family', 'wave2-fam-multiselect', 'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. New family this wave — evidence is thinner than the other 8 (CSSE-013/2021 only). Review evidence pack: ENGLISH_WAVE2_REVIEW_PACKS_V1.md.')
) as v(review_target_type, family_id, notes)
where not exists (
  select 1 from public.ali_family_review existing
  where existing.review_target_type = v.review_target_type
    and existing.family_id = v.family_id
    and existing.decision = 'pending_independent_review'
);

commit;
