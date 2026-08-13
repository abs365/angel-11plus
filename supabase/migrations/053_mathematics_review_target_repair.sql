-- Angel Digital 11+ — Migration 053
-- Educational Increment 007E, Part 6 — Mathematics review-target repair.
--
-- 007D's review backlog cataloguing found that only 4 of 21 provisional
-- Mathematics families had a registered ali_family_review target
-- (mr02-compare, mr03-classify, mr04-far-percent, mr04-mixed-divisibility
-- — migrations 038/041). The remaining 17 provisional families below have
-- real, provisional content in ali_question_bank but have never had a
-- review target registered at all — a real governance gap that pre-dates
-- this table's use for English, not a new defect introduced here.
--
-- This migration ONLY registers review targets. It does not touch
-- ali_question_bank, does not promote anything, and does not itself
-- constitute review — reviewer is explicitly 'UNASSIGNED'.
--
-- Deliberately excludes the 5 provisional rows that carry no family_id at
-- all (spanning 11 distinct QT codes) — ali_family_review.family_id is
-- NOT NULL by schema (migration 034), and inventing a placeholder
-- family_id to register a target would misrepresent those rows as a
-- coherent family when they are not one. Those 5 rows need a genuine
-- content-classification fix (assigning them to a real family, or
-- confirming they are legitimately un-grouped singletons) before a
-- review target can honestly be created for them — recorded as a
-- separate, disclosed gap in ANGEL_007D_REVIEW_BACKLOG_V1.md, not
-- silently worked around here.
--
-- Idempotent by construction (WHERE NOT EXISTS per family_id), matching
-- the established pattern from migrations 038/041/048/050/052.
--
-- Run this in: Supabase Dashboard > SQL Editor > New query, as its own
-- standalone execution.

begin;

insert into public.ali_family_review (review_target_type, family_id, reviewer, decision, notes)
select v.review_target_type, v.family_id, 'UNASSIGNED', 'pending_independent_review'::public.family_review_decision, v.notes
from (
  values
    ('question_family', 'mr02-sum-difference', 'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review-target gap found and repaired in Educational Increment 007E (originally authored without a registered review target).'),
    ('question_family', 'mr01-missing-operand', 'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review-target gap found and repaired in Educational Increment 007E.'),
    ('question_family', 'mr03-coordinate', 'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review-target gap found and repaired in Educational Increment 007E.'),
    ('question_family', 'mr05-constrained-multiple', 'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review-target gap found and repaired in Educational Increment 007E.'),
    ('question_family', 'mr02-far-ratio-context', 'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review-target gap found and repaired in Educational Increment 007E.'),
    ('question_family', 'mr03-mixed-perimeter', 'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review-target gap found and repaired in Educational Increment 007E.'),
    ('question_family', 'mr04-far-recipe', 'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review-target gap found and repaired in Educational Increment 007E.'),
    ('question_family', 'mr03-angle-ratio', 'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review-target gap found and repaired in Educational Increment 007E.'),
    ('question_family', 'mr05-factors-primes', 'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review-target gap found and repaired in Educational Increment 007E.'),
    ('question_family', 'mr01-measurement-conversion', 'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review-target gap found and repaired in Educational Increment 007E.'),
    ('question_family', 'mr01-data-table', 'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review-target gap found and repaired in Educational Increment 007E.'),
    ('question_family', 'mr04-elapsed-time', 'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review-target gap found and repaired in Educational Increment 007E.'),
    ('question_family', 'mr01-average-mean', 'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review-target gap found and repaired in Educational Increment 007E.'),
    ('question_family', 'mr02-nth-term', 'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review-target gap found and repaired in Educational Increment 007E.'),
    ('question_family', 'mr04-compound-percentage', 'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review-target gap found and repaired in Educational Increment 007E.'),
    ('question_family', 'mr04-best-value', 'Awaiting an appropriately authorised independent educational reviewer, per the Founder''s explicit instruction not to impersonate one. Review-target gap found and repaired in Educational Increment 007E.')
) as v(review_target_type, family_id, notes)
where not exists (
  select 1 from public.ali_family_review existing
  where existing.review_target_type = v.review_target_type
    and existing.family_id = v.family_id
    and existing.decision = 'pending_independent_review'
);

commit;
