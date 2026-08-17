-- Angel Digital 11+ — Migration 061
-- CSSE Completion Programme, Phase D, Part 12 — Founder Educational
-- Review readiness for Continuous Writing. Extends `review_type`
-- (migrations 059, 060) with a fourth value, `writing_teaching_review`,
-- for the one bounded-proof task family this phase built
-- (`writing-reflective-discursive`) — MODEL, planning scaffold, the
-- CSSE-evidenced 5-dimension rubric, and the confidence-gate design.
--
-- Reuses the existing 18 review criteria columns unchanged, exactly the
-- same reasoning migration 060 already established for English: these
-- columns (teaching_quality, examStrategyQuality-equivalent, wording
-- quality, age-appropriateness, misconception quality, etc.) were
-- already designed broad enough to cover a teaching-content review, not
-- narrowly Mathematics- or English-specific.
--
-- No new columns. Run this in: Supabase Dashboard > SQL Editor > New
-- query, after migration 060 (English Teaching Review).

begin;

alter table public.ali_family_review
  drop constraint if exists ali_family_review_review_type_check;

alter table public.ali_family_review
  add constraint ali_family_review_review_type_check
  check (review_type in ('content_review', 'maths_teaching_review', 'english_teaching_review', 'writing_teaching_review'));

comment on column public.ali_family_review.review_type is
  'Distinguishes WHAT KIND of review this row records, independent of review_target_type. ''content_review'' (default) judges underlying question content. ''maths_teaching_review'' (Phase B, Decision 62-63) and ''english_teaching_review'' (Phase C, Decision 64-65) judge those subjects'' teaching layers. ''writing_teaching_review'' (CSSE Completion Programme Phase D, Educational Increment 007Q) judges the Continuous Writing bounded proof: the MODEL, planning scaffold, and CSSE-evidenced 5-dimension rubric built for the writing-reflective-discursive task family. A content_review row must never be read as approval of teaching-layer content that did not exist when it was recorded.';

commit;
