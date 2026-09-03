-- Angel Digital 11+ — Migration 201
-- Programme Completion Increment 009 — Founder Review Decision Persistence
-- for the 7-row Writing independent-review batch.
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS, AND WHY IT IS NOT SELF-CERTIFICATION
-- ============================================================
-- RELEASE_1_VALIDATION_STRATEGY.md's own rule: "No stage above may be
-- self-certified by whoever authored the content" -- naming the party
-- that authored the migration's own content/tagging judgement calls, not
-- the Founder. Every prior successfully-promoted Writing row in this
-- codebase (migrations 103, 160, 181) was authored by an AI agent under
-- Founder direction and reviewed by the Founder via the live
-- /admin-beta/review surface -- the Founder is not, and has never been
-- treated as, "the family's own author" for this rule's purpose
-- (ali_family_review's own header comment, migration 034).
--
-- The 7 decisions below were made by the Founder directly, in writing,
-- as explicit "AUTHORITATIVE FOUNDER DECISIONS" (Programme Completion
-- Increment 009, session dated 2026-09-03), reviewing the complete,
-- verbatim, unabridged learner-facing content and the full evidence
-- reconciliation prepared in Increments 007/008 -- not a fabricated
-- /admin-beta/review click, and each row's own `notes` says so plainly,
-- so this provenance is never confused with a live-UI-submitted review.
-- This is a genuine deviation from this codebase's own established
-- convention (every prior real decision was entered live, never via
-- migration file) -- made only because the Founder explicitly directed,
-- this session, that the persistence mechanism be prepared this way,
-- after this session confirmed (per RELEASE_1_VALIDATION_STRATEGY.md and
-- migration 034's own header) that Founder-as-reviewer is the
-- established, sufficient role, and no separate third-party human
-- identity has ever been used or required in this codebase's history.
--
-- ============================================================
-- SCOPE
-- ============================================================
-- 6 rows recorded 'approved'. 1 row (eng-pc005-writing-somethingnew)
-- recorded 'approved_with_amendment' -- its own notes carry the exact
-- disclosure the Founder specified verbatim, formatted to satisfy
-- migration 157's own database-level constraint (a real "Reviewer
-- qualification: ...\n\n<content>" structure, not a restatement of the
-- qualification line alone). Migration 202 records the SEPARATE,
-- additive amendment_verification row this decision still requires
-- before eng-pc005-writing-somethingnew is considered lifecycle-closed
-- (Founder's own explicit instruction: "do NOT silently convert it to
-- APPROVED... requires additive AMENDMENT VERIFICATION").
--
-- eng-inc003-writing-pocketmoney-01's decision is conditional (Founder's
-- own wording): this migration verifies, at apply-time, that the live
-- row's checklist already carries migration 173's own correction before
-- inserting the approved decision -- refuses otherwise, naming what it
-- found, rather than recording an approval for content that turns out
-- not to be the corrected version.
--
-- eng-pc003-writing-difficulttask and eng-pc003-writing-meaningfulplace
-- are recorded 'approved' here (content approval) exactly as the Founder
-- decided -- their PROTECTED RESERVE destination is a separate,
-- non-eligibility fact, not represented by this migration at all (no
-- ali_question_bank row is touched anywhere in this file).
--
-- ============================================================
-- SAFETY
-- ============================================================
-- Insert-only against ali_family_review; touches no other table; sets no
-- eligibility_status anywhere. Idempotent per row (guarded by the same
-- "where not exists" pattern migration 172/197/199 already established).
-- Fails closed for pocketmoney specifically if its live checklist does
-- not yet carry the migration-173 text. Every other row's precondition is
-- simply that the row exists in ali_question_bank (subject='writing') --
-- this migration does not re-litigate content quality, which is the
-- Founder's own decision, already made.
--
-- NOT APPLIED. Founder must apply via Supabase Dashboard SQL Editor,
-- after migrations 169/173/172/198/199 (the rows this migration
-- references must exist first).

begin;

do $$
declare
  v_pocketmoney_corrected boolean;
begin
  select (prompt->'checklist' @> '["Say specifically what is genuinely appealing about EACH view, even the one you lean away from, before explaining which way you lean (or a genuine middle position)"]'::jsonb)
    into v_pocketmoney_corrected
  from public.ali_question_bank
  where id = 'eng-inc003-writing-pocketmoney-01';

  if v_pocketmoney_corrected is null then
    raise exception 'Migration 201 refused: eng-inc003-writing-pocketmoney-01 does not exist yet. Apply migrations 169/173/172 first.';
  elsif v_pocketmoney_corrected = false then
    raise exception 'Migration 201 refused: eng-inc003-writing-pocketmoney-01 exists but does not carry migration 173''s own checklist correction. The Founder''s approval was explicitly conditional on this. Apply migration 173 before this migration.';
  end if;
end $$;

-- 1. An Invented Place — APPROVED, destination PRACTICE.
insert into public.ali_family_review
  (review_target_type, family_id, reviewer, decision, notes, review_type)
select 'writing_prompt', 'eng-inc003-writing-wc01a-imaginedplace', 'FOUNDER',
  'approved'::public.family_review_decision,
  'Reviewer qualification: Founder, Angel 11+ programme owner, direct review of full learner-facing content (Programme Completion Increment 007/008/009, session 2026-09-03).' || E'\n\n' ||
  'APPROVED. Prior genre-fit concern (imagination vs. grounded reflective/discursive demand) explicitly retracted -- QT-WC-01a''s canonical Measurement Purpose (docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md) names experience, opinion, and imagination as three co-equal bases; this prompt fits the imagination basis directly. Intended destination: Practice. Not represented as a live /admin-beta/review submission -- recorded from a written Founder governance directive.',
  'mock_writing_prompt_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'eng-inc003-writing-wc01a-imaginedplace' and reviewer = 'FOUNDER' and decision = 'approved'
);

-- 2. Your Favourite Place to Be — APPROVED, destination PRACTICE.
insert into public.ali_family_review
  (review_target_type, family_id, reviewer, decision, notes, review_type)
select 'writing_prompt', 'eng-inc003-writing-wc01a-favouriteplace', 'FOUNDER',
  'approved'::public.family_review_decision,
  'Reviewer qualification: Founder, Angel 11+ programme owner, direct review of full learner-facing content (Programme Completion Increment 007/008/009, session 2026-09-03).' || E'\n\n' ||
  'APPROVED. Directly evidenced (CSSE-004/014). Intended destination: Practice. Not represented as a live /admin-beta/review submission -- recorded from a written Founder governance directive.',
  'mock_writing_prompt_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'eng-inc003-writing-wc01a-favouriteplace' and reviewer = 'FOUNDER' and decision = 'approved'
);

-- 3. Pocket Money or Helping Anyway? — APPROVED (conditional on migration
--    173's correction, verified above), destination PRACTICE.
insert into public.ali_family_review
  (review_target_type, family_id, reviewer, decision, notes, review_type)
select 'writing_prompt', 'eng-inc003-writing-wc01a-pocketmoney', 'FOUNDER',
  'approved'::public.family_review_decision,
  'Reviewer qualification: Founder, Angel 11+ programme owner, direct review of full learner-facing content (Programme Completion Increment 007/008/009, session 2026-09-03).' || E'\n\n' ||
  'APPROVED, conditional on migration 173''s checklist correction being present -- verified at this migration''s own apply-time (see the DO block above). Intended destination: Practice. Not represented as a live /admin-beta/review submission -- recorded from a written Founder governance directive.',
  'mock_writing_prompt_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'eng-inc003-writing-wc01a-pocketmoney' and reviewer = 'FOUNDER' and decision = 'approved'
);

-- 4. Something You Found Difficult — APPROVED (content), destination
--    PROTECTED RESERVE (not represented in ali_question_bank by this row).
insert into public.ali_family_review
  (review_target_type, family_id, reviewer, decision, notes, review_type)
select 'writing_prompt', 'mock-writing-wc01a-difficulttask', 'FOUNDER',
  'approved'::public.family_review_decision,
  'Reviewer qualification: Founder, Angel 11+ programme owner, direct review of full learner-facing content (Programme Completion Increment 007/008/009, session 2026-09-03).' || E'\n\n' ||
  'APPROVED (content). Intended destination: Protected Reserve, not Practice -- reduces "Write about a time..." event-recount over-representation in the live Practice pool. Not represented as a live /admin-beta/review submission -- recorded from a written Founder governance directive.',
  'mock_writing_prompt_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-writing-wc01a-difficulttask' and reviewer = 'FOUNDER' and decision = 'approved'
);

-- 5. A Place That Means Something to You — APPROVED (content),
--    destination PROTECTED RESERVE.
insert into public.ali_family_review
  (review_target_type, family_id, reviewer, decision, notes, review_type)
select 'writing_prompt', 'mock-writing-wc01a-meaningfulplace', 'FOUNDER',
  'approved'::public.family_review_decision,
  'Reviewer qualification: Founder, Angel 11+ programme owner, direct review of full learner-facing content (Programme Completion Increment 007/008/009, session 2026-09-03).' || E'\n\n' ||
  'APPROVED (content). Intended destination: Protected Reserve, not Practice -- near-duplicate shape to eng-inc003-writing-favouriteplace-01. Not represented as a live /admin-beta/review submission -- recorded from a written Founder governance directive.',
  'mock_writing_prompt_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-writing-wc01a-meaningfulplace' and reviewer = 'FOUNDER' and decision = 'approved'
);

-- 6. Someone Who Has Made a Difference to You — APPROVED, destination
--    PRACTICE.
insert into public.ali_family_review
  (review_target_type, family_id, reviewer, decision, notes, review_type)
select 'writing_prompt', 'mock-writing-wc01a-personinfluence', 'FOUNDER',
  'approved'::public.family_review_decision,
  'Reviewer qualification: Founder, Angel 11+ programme owner, direct review of full learner-facing content (Programme Completion Increment 007/008/009, session 2026-09-03).' || E'\n\n' ||
  'APPROVED, content exactly as presented. Intended destination: Practice. Not represented as a live /admin-beta/review submission -- recorded from a written Founder governance directive.',
  'mock_writing_prompt_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-writing-wc01a-personinfluence' and reviewer = 'FOUNDER' and decision = 'approved'
);

-- 7. Something You Would Like to Learn — APPROVED WITH AMENDMENT
--    (evidence/classification disclosure only, content not rewritten),
--    destination PRACTICE after amendment verification (migration 202).
insert into public.ali_family_review
  (review_target_type, family_id, reviewer, decision, notes, review_type)
select 'writing_prompt', 'mock-writing-wc01a-somethingnew', 'FOUNDER',
  'approved_with_amendment'::public.family_review_decision,
  'Reviewer qualification: Founder, Angel 11+ programme owner, direct review of full learner-facing content and QT-WC-01a evidence reconciliation (Programme Completion Increment 007/008/009, session 2026-09-03).' || E'\n\n' ||
  'APPROVED WITH AMENDMENT. Learner-facing content is NOT rewritten. The amendment is an evidence/classification disclosure, recorded verbatim as the Founder specified: "Prospective self-projection is an Angel-original extrapolation within QT-WC-01a''s broader imagination/opinion boundary, not a directly evidenced CSSE topic pattern." Intended destination: Practice, after amendment verification (see the separate, additive amendment_verification record, migration 202) -- not silently converted to plain approved. Not represented as a live /admin-beta/review submission -- recorded from a written Founder governance directive.',
  'mock_writing_prompt_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'mock-writing-wc01a-somethingnew' and reviewer = 'FOUNDER' and decision = 'approved_with_amendment'
);

commit;
