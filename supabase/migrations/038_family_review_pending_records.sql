-- Angel Digital 11+ — Migration 038
-- Educational Increment 006, Part 3 (continued). Depends on migration
-- 037 landing first and being committed (Postgres requires a new enum
-- value to be committed before it can be used — this is why the enum
-- addition and this insert are two separate migrations, not one).
--
-- Records all 4 Educational Increment 005B families as awaiting an
-- independent reviewer. reviewer is explicitly "UNASSIGNED" — no
-- appropriately authorised independent educational reviewer exists in
-- the current programme workflow, and this record must never be mistaken
-- for one having occurred. No row's eligibility_status changes.
--
-- ali_family_review has no browser-writable RLS/grant path — apply via
-- Supabase Dashboard > SQL Editor.

begin;

insert into public.ali_family_review
  (family_id, reviewer, decision, notes, evidence_reference)
values
  ('mr02-compare', 'UNASSIGNED', 'pending_independent_review',
   'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review evidence pack: MATHEMATICS_WAVE2_REVIEW_PACKS.md.',
   'MATHEMATICS_WAVE2_REVIEW_PACKS.md#mr02-compare'),
  ('mr03-classify', 'UNASSIGNED', 'pending_independent_review',
   'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review evidence pack: MATHEMATICS_WAVE2_REVIEW_PACKS.md.',
   'MATHEMATICS_WAVE2_REVIEW_PACKS.md#mr03-classify'),
  ('mr04-far-percent', 'UNASSIGNED', 'pending_independent_review',
   'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review evidence pack: MATHEMATICS_WAVE2_REVIEW_PACKS.md.',
   'MATHEMATICS_WAVE2_REVIEW_PACKS.md#mr04-far-percent'),
  ('mr04-mixed-divisibility', 'UNASSIGNED', 'pending_independent_review',
   'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review evidence pack: MATHEMATICS_WAVE2_REVIEW_PACKS.md.',
   'MATHEMATICS_WAVE2_REVIEW_PACKS.md#mr04-mixed-divisibility');

commit;
