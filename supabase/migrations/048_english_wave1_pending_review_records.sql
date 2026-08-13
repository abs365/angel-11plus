-- Angel Digital 11+ — Migration 048
-- Educational Increment 007B, Part D (continued) — records all 6 Wave 1
-- passages and 8 Wave 1 question families as awaiting an independent
-- reviewer, using the extension from migration 047. Depends on migration
-- 047 landing first (the review_target_type column and its check
-- constraint must exist before this insert can set it).
--
-- reviewer is explicitly 'UNASSIGNED' — no appropriately authorised
-- independent educational reviewer exists in the current programme
-- workflow, and this record must never be mistaken for one having
-- occurred. No row's eligibility_status changes; all 42 Wave 1 questions
-- and all 6 Wave 1 passages remain 'provisional'.
--
-- Idempotent by construction (WHERE NOT EXISTS per target), matching the
-- established repair pattern from migration 042 — safe to run once even
-- if some rows already exist.
--
-- Run this in: Supabase Dashboard > SQL Editor > New query, as its own
-- standalone execution, after migration 047.

begin;

insert into public.ali_family_review (review_target_type, family_id, reviewer, decision, notes)
select v.review_target_type, v.family_id, 'UNASSIGNED', 'pending_independent_review'::public.family_review_decision, v.notes
from (
  values
    ('passage', 'wave1-eng-kitemaker', 'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review evidence pack: ENGLISH_WAVE1_REVIEW_PACKS_V1.md#wave1-eng-kitemaker.'),
    ('passage', 'wave1-eng-lastbus', 'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review evidence pack: ENGLISH_WAVE1_REVIEW_PACKS_V1.md#wave1-eng-lastbus.'),
    ('passage', 'wave1-eng-newgirl', 'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review evidence pack: ENGLISH_WAVE1_REVIEW_PACKS_V1.md#wave1-eng-newgirl.'),
    ('passage', 'wave1-eng-atticdoor', 'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review evidence pack: ENGLISH_WAVE1_REVIEW_PACKS_V1.md#wave1-eng-atticdoor.'),
    ('passage', 'wave1-eng-raceday', 'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review evidence pack: ENGLISH_WAVE1_REVIEW_PACKS_V1.md#wave1-eng-raceday.'),
    ('passage', 'wave1-eng-lettertonana', 'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review evidence pack: ENGLISH_WAVE1_REVIEW_PACKS_V1.md#wave1-eng-lettertonana.'),
    ('question_family', 'wave1-fam-direct-retrieval', 'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review evidence pack: ENGLISH_WAVE1_REVIEW_PACKS_V1.md.'),
    ('question_family', 'wave1-fam-vocab-explain', 'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review evidence pack: ENGLISH_WAVE1_REVIEW_PACKS_V1.md.'),
    ('question_family', 'wave1-fam-synonym-battery', 'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review evidence pack: ENGLISH_WAVE1_REVIEW_PACKS_V1.md.'),
    ('question_family', 'wave1-fam-tick-justify', 'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review evidence pack: ENGLISH_WAVE1_REVIEW_PACKS_V1.md.'),
    ('question_family', 'wave1-fam-quote-explain', 'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review evidence pack: ENGLISH_WAVE1_REVIEW_PACKS_V1.md.'),
    ('question_family', 'wave1-fam-sequencing', 'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review evidence pack: ENGLISH_WAVE1_REVIEW_PACKS_V1.md.'),
    ('question_family', 'wave1-fam-two-character', 'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review evidence pack: ENGLISH_WAVE1_REVIEW_PACKS_V1.md.'),
    ('question_family', 'wave1-fam-emotion-cause', 'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review evidence pack: ENGLISH_WAVE1_REVIEW_PACKS_V1.md.')
) as v(review_target_type, family_id, notes)
where not exists (
  select 1 from public.ali_family_review existing
  where existing.review_target_type = v.review_target_type
    and existing.family_id = v.family_id
    and existing.decision = 'pending_independent_review'
);

commit;
