-- Angel Digital 11+ — Migration 157
-- English Content Foundation Increment 001, Decision 235 — Review-
-- Governance Gap Closed: `approved_with_amendment` now requires real
-- notes; two new review_type values added for additive amendment
-- evidence.
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS
-- ============================================================
-- Decision 235's own investigation (Section 2) found the live
-- `ali_family_review_decision_requires_notes` check (migration 034) only
-- ever required notes for `decision = 'rejected'`. `approved_with_
-- amendment` required nothing beyond the decision value itself, at
-- either the database layer OR the application layer
-- (validateReviewSubmission, lib/adminReview.ts, checked the same
-- session, unchanged since migration 034). This is not a hypothetical
-- gap: the live "Somewhere New" `mock-writing-wc01a-newplace` review row
-- was recorded `approved_with_amendment` with notes reading only
-- "Founder review with caution." -- non-blank, so it satisfied every
-- rule that existed, but it recorded no actual amendment. The Founder
-- had to be asked directly, after the fact, what the amendment was
-- (Decision 234's own handoff, resolved by this session's own directive
-- and migration 158 below).
--
-- ============================================================
-- THE FIX
-- ============================================================
-- Extends the SAME constraint (never a new, parallel one) so
-- `approved_with_amendment` requires notes to contain real content
-- beyond the mandatory reviewer-qualification line
-- (buildNotesWithQualification, lib/adminReview.ts, unchanged by this
-- migration): that function always produces
-- "Reviewer qualification: <basis>." alone when the reviewer's own free-
-- text notes field was left blank, and
-- "Reviewer qualification: <basis>.\n\n<the reviewer's own notes>" when
-- it was not -- the blank-line separator therefore only ever appears
-- when the reviewer typed something into the notes field themselves.
-- Checking for that separator (rather than merely `notes is not null`,
-- which the qualification line alone would already satisfy) is what
-- makes this constraint a REAL gate, not a restatement of a rule that
-- was already trivially satisfied. Mirrored, unchanged in spirit, at the
-- application layer in lib/adminReview.ts's own validateReviewSubmission
-- (same session, committed alongside this migration) — this migration is
-- the database-level backstop for that same rule, per this table's own
-- header comment: "no application code writes here as part of
-- authoring/generation" is not literally true of the review-submission
-- path itself, but the DATABASE constraint remains the authoritative,
-- unbypassable gate, exactly as migration 034's own `rejected` rule
-- already established.
--
-- NOT imposed on plain `approved` (Section 2's own explicit instruction,
-- and this task's own governing directive). The `rejected` rule is
-- carried forward completely unchanged (still only `notes is not null`,
-- not the stricter structural check) -- this migration extends the
-- constraint, it does not tighten the existing `rejected` case.
--
-- ============================================================
-- WHY `NOT VALID`, AND WHY THIS DOES NOT REWRITE HISTORY
-- ============================================================
-- The live "Somewhere New" row described above already violates the new
-- rule (single-line notes, no blank-line separator) -- a plain `ALTER
-- TABLE ... ADD CONSTRAINT` validates every existing row by default and
-- would refuse to apply while that row exists. `NOT VALID` is the
-- standard, well-understood PostgreSQL mechanism for exactly this case:
-- it is enforced on every INSERT and UPDATE from the moment this
-- migration applies, but existing rows are not walked or judged against
-- it retroactively. This grandfathers every historical row (this one
-- included) without rewriting, deleting, or judging any of them --
-- consistent with Section 9's own "review history must remain immutable"
-- requirement and this project's own standing "never silently alter a
-- recorded decision" rule. No existing row's own `decision` or `notes`
-- is read, written, or validated by this migration.
--
-- ============================================================
-- SAFETY
-- ============================================================
-- Idempotent: `drop constraint if exists` before each `add constraint`,
-- safe to run more than once. Fail-closed going forward: any future
-- `approved_with_amendment` INSERT/UPDATE with blank or qualification-
-- only notes is rejected by the database itself, independent of the
-- application layer. Does not touch `decision`, `eligibility_status`,
-- `review_target_type`, or any other column, on any table, on any row.
-- No English Mock is created or touched. No content is authored here.
--
-- NOT APPLIED. Generated for Founder application via Supabase Dashboard
-- > SQL Editor > New query.

begin;

-- Two new review_type values for additive, non-independent-review
-- evidence: 'founder_amendment_clarification' (migration 158, a
-- supplementary clarification linked to an existing review whose own
-- recorded notes did not state the required amendment) and
-- 'amendment_verification' (Section 11, submitted later via the review
-- surface's own new Amendment Verification section, confirming whether
-- a recorded amendment was satisfactorily resolved). Neither is, or is
-- ever treated as, a new independent review of a family.
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
    'mock_writing_prompt_independent_review',
    'founder_amendment_clarification',
    'amendment_verification'
  ));

-- The notes-requirement extension itself. NOT VALID: see header above.
alter table public.ali_family_review
  drop constraint if exists ali_family_review_decision_requires_notes;

alter table public.ali_family_review
  add constraint ali_family_review_decision_requires_notes
  check (
    (decision != 'rejected' or notes is not null)
    and (
      decision != 'approved_with_amendment'
      or (notes is not null and position(E'\n\n' in notes) > 0)
    )
  )
  not valid;

commit;

-- Read-only verification (run before and after applying): confirms the
-- live "Somewhere New" row is untouched (still recorded exactly as the
-- original reviewer left it) and that the new constraint text is live.
--
-- select family_id, decision, notes from public.ali_family_review
--   where family_id = 'mock-writing-wc01a-newplace' and review_type = 'mock_writing_prompt_independent_review';
--
-- select conname, pg_get_constraintdef(oid) from pg_constraint
--   where conrelid = 'public.ali_family_review'::regclass
--     and conname in ('ali_family_review_review_type_check', 'ali_family_review_decision_requires_notes');
