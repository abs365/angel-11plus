-- Angel Digital 11+ — Migration 059
-- CSSE Completion Programme, Phase B — Founder Educational Review
-- readiness. Extends ali_family_review (migration 034, extended 047) with
-- a distinct review_type so Mathematics Teaching Review evidence (the
-- MODEL/Guided/Remediation teaching content Educational Increment 007M
-- added, per Decision 62) is recorded separately from, and never confused
-- with, the earlier question-content review evidence (Controlled Review
-- Batches 1-4) that predates this teaching content and reviewed a
-- genuinely different thing (the underlying question wording/answer, not
-- the MODEL/Guided teaching layer built on top of it later).
--
-- Same table, same append-only convention (migration 034's own
-- docstring: reviewer decisions are never overwritten or deleted) — a new
-- review_type value alongside the existing review_target_type column,
-- not a new table, exactly the pattern migration 047 already established
-- for disambiguating what a row is about. No RLS change needed: migration
-- 054's existing admin SELECT/INSERT policies are row-level, not
-- column-scoped, so they already cover every column added here.
--
-- Run this in: Supabase Dashboard > SQL Editor > New query, after
-- migration 058 (Batch 4 activation).

begin;

alter table public.ali_family_review
  add column if not exists review_type text not null default 'content_review';

do $$
begin
  if not exists (
    select 1 from information_schema.table_constraints
    where constraint_name = 'ali_family_review_review_type_check'
  ) then
    alter table public.ali_family_review
      add constraint ali_family_review_review_type_check
      check (review_type in ('content_review', 'maths_teaching_review'));
  end if;
end$$;

alter table public.ali_family_review
  add column if not exists teaching_content_version text,
  add column if not exists teaching_mathematically_correct boolean,
  add column if not exists teaching_model_understandable boolean,
  add column if not exists teaching_model_teaches_method boolean,
  add column if not exists teaching_guided_practice_balanced boolean,
  add column if not exists teaching_support_reduced_appropriately boolean,
  add column if not exists teaching_remediation_useful boolean,
  add column if not exists teaching_language_age_appropriate boolean,
  add column if not exists teaching_relevant_to_skill boolean,
  add column if not exists teaching_example_avoids_answer_leakage boolean,
  add column if not exists teaching_conceptual_explanation_sufficient boolean,
  add column if not exists teaching_independent_expectation_appropriate boolean,
  add column if not exists teaching_clear_and_unambiguous boolean;

create index if not exists ali_family_review_review_type_idx
  on public.ali_family_review (review_type, family_id);

comment on column public.ali_family_review.review_type is
  'Distinguishes WHAT KIND of review this row records, independent of review_target_type (which says what family_id refers to: a passage or a question family). ''content_review'' (default — the original, unchanged meaning of every row that existed before this migration) judges the underlying question content itself: wording, answer correctness, authenticity, CSSE evidence fit. ''maths_teaching_review'' (added CSSE Completion Programme Phase B, Educational Increment 007M/Decision 62) judges the separate MODEL/Guided-practice/Remediation teaching layer added on top of an already-existing, possibly already content_review-approved, Mathematics family. A content_review row must never be read as approval of teaching material that did not exist when it was recorded — this column exists specifically so that mistake cannot happen silently.';

comment on column public.ali_family_review.teaching_content_version is
  'Free-text identifier of which version of the teaching content (lib/learningEngine/mathsTeachingContent.ts) this review judged, e.g. an Educational Increment name and commit hash. Populated only for review_type = ''maths_teaching_review'' — the teaching content is a static code file, not a versioned database row, so this is the closest honest equivalent to a reviewed content_version for this specific kind of review.';

commit;
