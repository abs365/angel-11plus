-- Angel Digital 11+ — Migration 067
-- Educational Increment 007X, Part 16 — registers the 14 new provisional
-- Mathematics questions from migration 066 as awaiting an independent
-- reviewer. Registers ONLY the NEW siblings added this increment as
-- awaiting review (see each row's own `notes`), distinct from whatever
-- review history each family may already carry from Phase B / Controlled
-- Review Batches 2-4.
--
-- APPLIED. This is the minimal executable-only form that was actually run
-- against production, reconstructed from the applied statements after a
-- Supabase SQL Editor incident (see the 007X Post-Migration Reconciliation
-- record in ANGEL_007X_MATHEMATICS_CONTENT_DEPTH_EXPANSION_V1.md and
-- Decision 79 for the full account): the original, fully-commented,
-- values()-table form of this migration produced
-- `ERROR 42P01: relation "this" does not exist` in the SQL Editor.
-- Independent investigation confirmed public.ali_family_review's columns,
-- enums, RLS policies, and INSERT permission function were all healthy (a
-- controlled INSERT inside BEGIN/ROLLBACK succeeded), and the SQL Editor
-- subsequently displayed its "creates a table without enabling RLS" safety
-- warning even though this migration creates no table — strong evidence of
-- SQL Editor parsing/safety-analysis behaviour on the original file's
-- prose-heavy comments/values()-table construct, not a database-schema
-- defect. This four-statement, comment-free, explicit INSERT...SELECT...
-- WHERE NOT EXISTS form ran successfully ("Success. No rows returned").
--
-- reviewer is explicitly 'UNASSIGNED'. No row's eligibility_status
-- changes; all 14 new questions remain 'provisional'. This migration
-- inserts ONLY placeholder rows recording that review is awaited -- it
-- does not itself constitute, preselect, or imply any review decision.
-- review_type is set explicitly to 'content_review' on every row (rather
-- than relying on the column's own default), and the idempotency guard
-- checks family_id + decision + review_type + notes together, so it can
-- never be satisfied by an unrelated historical row for the same family.
--
-- Full review evidence for every target named below lives in
-- ANGEL_007X_MATHEMATICS_CONTENT_DEPTH_EXPANSION_V1.md.

begin;

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select
'question_family',
'mr05-number-property-search',
'UNASSIGNED',
'pending_independent_review'::public.family_review_decision,
'007X new content review: mr05-search-03..07',
'content_review'
where not exists (
    select 1
    from public.ali_family_review
    where family_id = 'mr05-number-property-search'
      and decision = 'pending_independent_review'
      and review_type = 'content_review'
      and notes = '007X new content review: mr05-search-03..07'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select
'question_family',
'mr03-mixed-perimeter',
'UNASSIGNED',
'pending_independent_review'::public.family_review_decision,
'007X new content review: mr03-mix-04..06',
'content_review'
where not exists (
    select 1
    from public.ali_family_review
    where family_id = 'mr03-mixed-perimeter'
      and decision = 'pending_independent_review'
      and review_type = 'content_review'
      and notes = '007X new content review: mr03-mix-04..06'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select
'question_family',
'precision-frac',
'UNASSIGNED',
'pending_independent_review'::public.family_review_decision,
'007X new content review: precision-frac-04..06',
'content_review'
where not exists (
    select 1
    from public.ali_family_review
    where family_id = 'precision-frac'
      and decision = 'pending_independent_review'
      and review_type = 'content_review'
      and notes = '007X new content review: precision-frac-04..06'
);

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select
'question_family',
'precision-dec',
'UNASSIGNED',
'pending_independent_review'::public.family_review_decision,
'007X new content review: precision-dec-04..06',
'content_review'
where not exists (
    select 1
    from public.ali_family_review
    where family_id = 'precision-dec'
      and decision = 'pending_independent_review'
      and review_type = 'content_review'
      and notes = '007X new content review: precision-dec-04..06'
);

commit;