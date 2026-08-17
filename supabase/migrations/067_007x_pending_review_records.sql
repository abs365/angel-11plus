-- Angel Digital 11+ — Migration 067
-- Educational Increment 007X, Part 16 — registers the 14 new provisional
-- Mathematics questions from migration 066 as awaiting an independent
-- reviewer, using the exact same review_target_type/pending placeholder
-- pattern established by migrations 048/050/052/064. Anon-key evidence for
-- ali_family_review is RLS-opaque (200/[]) for these 4 families -- per this
-- project's own standing principle, that is NEVER read as "no prior review
-- exists." This migration does not assume or contradict any Founder-
-- authenticated review history; it registers ONLY the NEW siblings added
-- this increment as awaiting review, distinct from whatever review history
-- the family may already carry from Phase B.
--
-- reviewer is explicitly 'UNASSIGNED'. No row's eligibility_status
-- changes; all 14 new questions remain 'provisional'. This migration
-- inserts ONLY placeholder rows recording that review is awaited -- it
-- does not itself constitute, preselect, or imply any review decision.
--
-- Full review evidence for every target named below lives in
-- ANGEL_007X_MATHEMATICS_CONTENT_DEPTH_EXPANSION_V1.md.
--
-- Idempotent (WHERE NOT EXISTS per target), matching the established
-- pattern.
--
-- NOT APPLIED by this increment. Generated for Founder review and manual
-- application via Supabase Dashboard > SQL Editor > New query, gated on
-- Founder/Product approval of this increment's report, and only after
-- migration 066 has itself been applied.

begin;

insert into public.ali_family_review (review_target_type, family_id, reviewer, decision, notes)
select v.review_target_type, v.family_id, 'UNASSIGNED', 'pending_independent_review'::public.family_review_decision, v.notes
from (
  values
    ('question_family', 'mr05-number-property-search', 'Educational Increment 007X, Part 8. 5 new provisional questions (mr05-search-03..07) added to this pre-existing, Phase-B-deferred TRANSFER-UNSAFE family (2 pre-existing siblings, mr05-search-01/02, unaffected). Genuinely varies the searched property (squares, proper factors, multiples, a two-constraint LCM search, a compute-then-search item) per Phase B''s own explicit recommendation. Review evidence pack: ANGEL_007X_MATHEMATICS_CONTENT_DEPTH_EXPANSION_V1.md.'),
    ('question_family', 'mr03-mixed-perimeter', 'Educational Increment 007X, Part 4/11. 3 new provisional questions (mr03-mix-04..06) plus 1 pre-existing legacy row (mth-003) reclassified by the same migration into this family (metadata only, unchanged content/eligibility). 3 pre-existing siblings (mr03-mix-01..03) unaffected. Adds reverse-direction, decimal, and square-root structural variants per Phase B''s #1-ranked LIMITED-family finding. Review evidence pack: ANGEL_007X_MATHEMATICS_CONTENT_DEPTH_EXPANSION_V1.md.'),
    ('question_family', 'precision-frac', 'Educational Increment 007X, Part 4/11. 3 new provisional questions (precision-frac-04..06) added to this pre-existing family (3 pre-existing siblings unaffected). Adds a proper-fraction result and a simplification-required case per Phase B''s explicit fix. Review evidence pack: ANGEL_007X_MATHEMATICS_CONTENT_DEPTH_EXPANSION_V1.md.'),
    ('question_family', 'precision-dec', 'Educational Increment 007X, Part 4/11. 3 new provisional questions (precision-dec-04..06) added to this pre-existing family (3 pre-existing siblings unaffected). Adds 2 round-down cases and a 3-decimal-place target per Phase B''s explicit fix. Review evidence pack: ANGEL_007X_MATHEMATICS_CONTENT_DEPTH_EXPANSION_V1.md.')
) as v(review_target_type, family_id, notes)
where not exists (
  select 1 from public.ali_family_review r
  where r.family_id = v.family_id
    and r.decision = 'pending_independent_review'
    and r.notes = v.notes
);

commit;
