-- Angel Digital 11+ — Migration 060
-- CSSE Completion Programme, Phase C, Part 13 — Founder Educational Review
-- readiness for English. Extends `review_type` (migration 059) with a
-- third value, `english_teaching_review`, distinct from both
-- `content_review` (the original meaning: judges the underlying question
-- wording/answer/CSSE-fit) and `maths_teaching_review` (Phase B).
--
-- Unlike Phase B's Mathematics Teaching Review, this does NOT need any
-- new criteria columns: the 18 boolean columns migration 047 already
-- added (educational_validity ... copyright_risk_clear) were explicitly
-- designed with English's fuller review needs in mind (that migration's
-- own docstring: "English's review needs are a genuine superset of
-- Mathematics' original 10 quality-check columns") and already cover
-- MODEL/teaching quality, exam-strategy quality, and misconception
-- quality. What's new here is only the ability to say WHICH KIND of
-- review a row is, so a family's earlier `content_review` decision (many
-- of these 8 families were reviewed in the Pilot or Controlled Review
-- Batch 1/2, before Educational Increment 007O's remediation-rendering
-- change existed) is never read as covering that later change.
--
-- Only `teaching_content_version` (added generically, not Maths-specific,
-- by migration 059) is reused as-is — no new columns at all.
--
-- Run this in: Supabase Dashboard > SQL Editor > New query, after
-- migration 059 (Mathematics Teaching Review).

begin;

alter table public.ali_family_review
  drop constraint if exists ali_family_review_review_type_check;

alter table public.ali_family_review
  add constraint ali_family_review_review_type_check
  check (review_type in ('content_review', 'maths_teaching_review', 'english_teaching_review'));

comment on column public.ali_family_review.review_type is
  'Distinguishes WHAT KIND of review this row records, independent of review_target_type (which says what family_id refers to: a passage or a question family). ''content_review'' (default — the original, unchanged meaning of every row that existed before migration 059) judges the underlying question content itself: wording, answer correctness, authenticity, CSSE evidence fit. ''maths_teaching_review'' (CSSE Completion Programme Phase B, Educational Increment 007M/Decision 62-63) judges the MODEL/Guided-practice/Remediation teaching layer added on top of an already-existing Mathematics family. ''english_teaching_review'' (CSSE Completion Programme Phase C, Educational Increment 007O) judges English''s teaching layer — most materially, the addresses_misconception remediation text now rendered live in ReadingActivity for the first time — using the SAME 18 review criteria content_review already uses (English''s were designed broad enough to cover this), but as a genuinely distinct evidence trail, timestamped after the change it reviews. A content_review row for a family must never be read as approval of teaching-layer behaviour that did not exist when it was recorded.';

commit;
