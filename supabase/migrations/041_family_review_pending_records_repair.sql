-- Angel Digital 11+ — Migration 041
-- Educational Increment 006B, Production Integrity Closure, Part C.
--
-- Repairs migration 038, which the Founder reports having executed but
-- which independent, repeated, count=exact production verification shows
-- did not persist (public.ali_family_review is genuinely empty).
--
-- Strongest evidence-based explanation (not certain — no SQL Editor
-- execution log was available to confirm directly): migration 038's own
-- header names the exact failure mode that matches the observed symptom
-- precisely — "Postgres requires a new enum value to be committed before
-- it can be used ... this is why the enum addition [038] and this insert
-- [037] are two separate migrations, not one." If 037 and 038 were run
-- together in one Supabase SQL Editor execution/session rather than as
-- two genuinely separate, sequentially-committed operations, Postgres
-- would reject any use of the brand-new enum value within that same
-- transaction, aborting the INSERT — while 037's own effect (the enum
-- value itself) can still land, since ALTER TYPE ... ADD VALUE commits
-- independently. That is exactly what production shows: 037's enum value
-- is live; 038's insert is not.
--
-- This repair does not depend on that diagnosis being correct. The enum
-- value has now been committed and in active use for some time (confirmed
-- by this same verification work), so the specific same-transaction
-- restriction cannot recur regardless of cause.
--
-- Idempotent by construction: inserts a row only for a family that does
-- not already carry a 'pending_independent_review' record, so this is
-- safe to run more than once and safe even if some (but not all) of the
-- four rows turn out to already exist. No blanket unique constraint is
-- added on family_id — a family may legitimately be reviewed more than
-- once over time (e.g. re-review after amendment), so uniqueness is
-- enforced only for this specific pending-insert operation, not at the
-- schema level.
--
-- Unchanged from the original 038: reviewer is explicitly 'UNASSIGNED' —
-- no fabricated reviewer identity. No row's eligibility_status changes;
-- ali_question_bank is not touched. No existing ali_family_review row is
-- modified or removed.
--
-- Run this in: Supabase Dashboard > SQL Editor > New query, as its own
-- standalone execution (do not paste alongside any other migration).

begin;

insert into public.ali_family_review (family_id, reviewer, decision, notes, evidence_reference)
select v.family_id, v.reviewer, v.decision, v.notes, v.evidence_reference
from (
  values
    ('mr02-compare', 'UNASSIGNED', 'pending_independent_review'::public.family_review_decision,
     'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review evidence pack: MATHEMATICS_WAVE2_REVIEW_PACKS.md.',
     'MATHEMATICS_WAVE2_REVIEW_PACKS.md#mr02-compare'),
    ('mr03-classify', 'UNASSIGNED', 'pending_independent_review'::public.family_review_decision,
     'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review evidence pack: MATHEMATICS_WAVE2_REVIEW_PACKS.md.',
     'MATHEMATICS_WAVE2_REVIEW_PACKS.md#mr03-classify'),
    ('mr04-far-percent', 'UNASSIGNED', 'pending_independent_review'::public.family_review_decision,
     'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review evidence pack: MATHEMATICS_WAVE2_REVIEW_PACKS.md.',
     'MATHEMATICS_WAVE2_REVIEW_PACKS.md#mr04-far-percent'),
    ('mr04-mixed-divisibility', 'UNASSIGNED', 'pending_independent_review'::public.family_review_decision,
     'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review evidence pack: MATHEMATICS_WAVE2_REVIEW_PACKS.md.',
     'MATHEMATICS_WAVE2_REVIEW_PACKS.md#mr04-mixed-divisibility')
) as v(family_id, reviewer, decision, notes, evidence_reference)
where not exists (
  select 1 from public.ali_family_review r
  where r.family_id = v.family_id and r.decision = 'pending_independent_review'
);

commit;
