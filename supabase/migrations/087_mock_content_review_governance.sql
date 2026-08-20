-- Angel Digital 11+ — Migration 087
-- Mock Programme Increment 003 — Mock Content Governance and Review
-- Foundation (Decision 139).
--
-- Extends the existing, proven `ali_family_review` review-type/target-type
-- architecture (migrations 034/047/059/060/061) rather than building a
-- second review system, per explicit Founder instruction. No new table,
-- no new column beyond the constraint extensions below, no RLS/grant
-- change — `ali_family_review` has been RLS-enabled, admin-only for both
-- SELECT and INSERT, since migration 054 (confirmed by direct reading
-- this session); this migration touches neither.
--
-- WHAT THIS ADDS, and why it is the correct, minimal extension:
--
-- (1) Three new `review_type` values, one per Mock content category the
-- Founder named as needing independent (non-author) review before an item
-- may progress from `authentic_assessment_candidate` to
-- `independently_validated` (RELEASE_1_ASSESSMENT_ELIGIBILITY_MODEL.md,
-- 2026-08-10, §3's own transition table — this migration does not alter
-- that model, only gives its already-approved "external reviewer"
-- transition a recorded `review_type` to file under, exactly as migrations
-- 059/060/061 already did for the unrelated teaching-content-review axis):
--   - `mock_maths_independent_review` — Mathematics question families/items
--   - `mock_english_passage_independent_review` — English passages and
--     their complete attached question set, reviewed together as one unit
--   - `mock_writing_prompt_independent_review` — Continuous Writing prompts
-- These are deliberately three distinct values, not one shared value plus
-- a subject column, mirroring the exact structural precedent
-- `maths_teaching_review`/`english_teaching_review`/`writing_teaching_
-- review` already established — different subjects' content genuinely
-- need different review evidence (the Founder's own instruction), and
-- this project's own convention already expresses that as distinct
-- `review_type` values, not a shared type with a discriminator.
--
-- (2) One new `review_target_type` value, `writing_prompt`, extending the
-- existing `question_family`/`passage` vocabulary (migration 047) so a
-- Continuous Writing prompt has its own reviewable unit, distinct from a
-- Mathematics question family and an English passage — exactly the "each
-- needs its own review unit" requirement, using the identical mechanism
-- migration 047 already built for English rather than inventing a new
-- column. Mathematics Mock review uses the EXISTING `question_family`
-- target type unchanged (a family_id, e.g. "mr01-reverse-mean", already
-- identifies the correct unit). English Mock passage review uses the
-- EXISTING `passage` target type unchanged (a passage's own id, e.g. an
-- `ali_passage_bank.id`/`learning_unit_id`, already identifies the
-- correct unit and already carries its complete attached question set by
-- construction — migration 047's own design, not extended here).
--
-- WHAT THIS DELIBERATELY DOES NOT ADD, per explicit Founder scope:
-- no `review_target_type` value for an assembled Mock form (Part 9 of the
-- directive asks only to establish that governance boundary conceptually
-- — recorded in Decision 139 — not to reserve schema for it ahead of the
-- form-assembler increment that will actually need it, matching this
-- project's own pattern of extending exactly what a given increment
-- concretely uses); no automated eligibility_status write path (the
-- existing, structurally-proven discipline stands unchanged — see
-- lib/adminReview.ts's own module docstring, confirmed this session:
-- every review-submission function "never touches
-- ali_question_bank.eligibility_status" — a status transition remains a
-- separate, human-authorised activation migration, exactly as Decisions
-- 80/119/123 already established, never a live function this migration
-- or any other introduces).
--
-- SECURITY: no new SQL function is introduced by this migration (per the
-- directive's own Part 10 instruction to treat every new function
-- carefully, given the anon-execute defect class already hit three times
-- — migrations 071/073/086 — the safest response here is not to
-- introduce a new privilege surface at all where a schema-only extension
-- fully suffices). `ali_family_review`'s existing RLS policies
-- (`ali_family_review_select_admin`, `ali_family_review_insert_admin`,
-- migration 054, both `is_current_user_admin()`-gated) are untouched and
-- apply identically to rows using these new values.
--
-- Idempotent: CHECK constraints are dropped and re-added with IF EXISTS,
-- matching migrations 059/060/061's own established convention exactly.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migration 061 (the
-- most recent prior extension of this same constraint) has already been
-- applied.

begin;

alter table public.ali_family_review
  drop constraint if exists ali_family_review_review_type_check;

alter table public.ali_family_review
  add constraint ali_family_review_review_type_check
  check (review_type in (
    'content_review',
    'maths_teaching_review',
    'english_teaching_review',
    'writing_teaching_review',
    'mock_maths_independent_review',
    'mock_english_passage_independent_review',
    'mock_writing_prompt_independent_review'
  ));

alter table public.ali_family_review
  drop constraint if exists ali_family_review_target_type_check;

alter table public.ali_family_review
  add constraint ali_family_review_target_type_check
  check (review_target_type in ('question_family', 'passage', 'writing_prompt'));

comment on column public.ali_family_review.review_type is
  'Distinguishes WHAT KIND of review this row records, independent of review_target_type. ''content_review'' (default) judges underlying question content. ''maths_teaching_review''/''english_teaching_review''/''writing_teaching_review'' (migrations 059-061) judge those subjects'' teaching layers -- a wholly separate axis from Mock. ''mock_maths_independent_review''/''mock_english_passage_independent_review''/''mock_writing_prompt_independent_review'' (Mock Programme Increment 003, Decision 139) record the external-reviewer confirmation RELEASE_1_ASSESSMENT_ELIGIBILITY_MODEL.md''s own Authentic-Assessment-Candidate-to-Independently-Validated transition requires -- these rows judge fitness for eventual Mock use specifically, and must never be read as equivalent to, or a substitute for, a content_review or teaching_review row for the same family/passage/prompt.';

comment on column public.ali_family_review.review_target_type is
  'Subject-agnostic identifier under review. ''question_family'' (default) -- a Mathematics family_id or an English question-family id. ''passage'' (migration 047) -- an English passage id; the review covers the passage and its complete attached question set together as one unit, never approved by reviewing individual questions in isolation. ''writing_prompt'' (Mock Programme Increment 003, Decision 139) -- a Continuous Writing prompt''s own id, its own distinct reviewable unit, neither a question family nor a passage.';

commit;
