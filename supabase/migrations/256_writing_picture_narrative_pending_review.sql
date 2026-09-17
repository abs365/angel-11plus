-- Angel Digital 11+ — Migration 256
-- Educational Depth Phase 1, Wave 2 — Writing Picture-Led Narrative,
-- Pending Independent Review Registration.
--
-- ============================================================
-- WHY THIS EXISTS
-- ============================================================
-- Registers the one new Practice-track picture-narrative Writing prompt
-- from migration 255 ("The Riverboat at Dawn",
-- eng-practice-writing-picturenarrative-riverboat-01) as awaiting an
-- independent reviewer — the same proactive placeholder-seeding pattern
-- migrations 099/154/162/168/172/226 already established, applied here
-- to the first image-stimulus row Practice has ever carried.
--
-- ONE row, keyed by the prompt's own ali_question_bank.family_id column
-- value ('eng-practice-writing-wc01b-riverboat'), never by the row's own
-- id — matching migration 226's own exact convention.
--
-- review_target_type = 'writing_prompt', review_type =
-- 'mock_writing_prompt_independent_review' — the SAME real, currently
-- valid values migration 226 already used (confirmed live in the
-- ali_family_review_target_type_check / ali_family_review_review_type_check
-- constraints, migrations 087/157), and the same review_type migrations
-- 200/203 already relied on to promote Practice-track Writing rows
-- directly from 'authentic_assessment_candidate' to 'practice_eligible'
-- (skipping the independently_validated/Mock-governance track entirely,
-- per migration 200's own explicit precedent) — not a new review
-- category invented for this row. reviewer is explicitly 'UNASSIGNED'.
--
-- No row's eligibility_status changes anywhere in this migration — the
-- prompt remains 'authentic_assessment_candidate' exactly as migration
-- 255 left it. This migration inserts ONLY a placeholder row recording
-- that review is awaited; it does not itself constitute, preselect, or
-- imply any review decision, and no reviewer identity is fabricated.
--
-- ============================================================
-- WHAT THE FOUNDER WILL NOW SEE ON REVIEW (a real gap this migration's
-- own companion commit closes, not merely discloses)
-- ============================================================
-- Before this commit, `/admin-beta/review`'s writing-task renderer
-- (`lib/adminReview.ts`'s `promptWritingTask()`, rendered by
-- `app/admin-beta/review/page.tsx`'s `QuestionOrWritingTaskBody`) read
-- only `title`/`prompt`/`checklist`/`timeMinutes`/`type` from a writing
-- row's stored prompt jsonb — it never read `stimulus`, because no prior
-- Writing row had ever carried one. Reviewing this row through the
-- pre-existing, unmodified surface would have let the Founder approve
-- picture-led narrative content without ever seeing the picture itself,
-- undermining the "original stimulus" evidence this exact review exists
-- to confirm. The companion code change in this same commit extends
-- `promptWritingTask()`/`QuestionOrWritingTaskBody` to also read and
-- render `prompt.stimulus` when present (mirroring the learner-facing
-- renderer's own `stimulus.type === "image"` check in
-- `app/learning-intelligence/practice/[area]/page.tsx`) — reusing the
-- existing review surface, not inventing a new one, and additive-only:
-- every prior writing row has no `stimulus` key and renders exactly as
-- before (proven in
-- tests/lib/adminReview.writingReviewContentContract.test.ts).
--
-- ============================================================
-- SAFETY
-- ============================================================
-- The idempotency guard checks family_id + decision + review_type +
-- notes together, matching migration 226's own exact convention.
--
-- FAIL-CLOSED / NARROWLY SCOPED: touches public.ali_family_review only,
-- inserts exactly 1 row, never touches ali_question_bank, cannot change
-- eligibility_status, cannot activate Practice or Mock (no such column
-- or table is referenced anywhere below), and cannot manufacture an
-- Approved review (the only decision value inserted is
-- 'pending_independent_review', never any other value in the
-- family_review_decision enum).
--
-- NOT APPLIED. Founder must apply via the Supabase Dashboard SQL Editor
-- (migration 255 must already be applied). This migration is the
-- registration step only — it does not, by itself, make this row
-- learner-reachable. A separate practice_eligible promotion migration
-- (matching migrations 200/203/224's own established pattern) can only
-- be prepared once a genuine Founder decision for this family_id exists
-- in ali_family_review, recorded through the live /admin-beta/review
-- interface — never inferred, never fabricated, and never combined into
-- this migration.

begin;

insert into public.ali_family_review
(review_target_type, family_id, reviewer, decision, notes, review_type)
select 'writing_prompt', 'eng-practice-writing-wc01b-riverboat', 'UNASSIGNED',
  'pending_independent_review'::public.family_review_decision,
  'EDUCATIONAL-DEPTH-PHASE1-WAVE2 new content review: the first Practice-track picture-led narrative Writing prompt ("The Riverboat at Dawn", eng-practice-writing-picturenarrative-riverboat-01, QT-WC-01b, image-stimulus observe -> interpret -> commit -> structure narrative task) -- see migration 255''s own header for the full evidence basis, the original-SVG-stimulus rationale, and the deliberate distinction from Mock''s own Q2 picture (migration 246''s old-shed-v1.svg). This is the first row of this response shape Practice has ever carried; review its picture stimulus directly on this surface (rendered as of this same commit), not merely its checklist.', 'mock_writing_prompt_independent_review'
where not exists (
  select 1 from public.ali_family_review
  where family_id = 'eng-practice-writing-wc01b-riverboat' and decision = 'pending_independent_review'
    and review_type = 'mock_writing_prompt_independent_review'
    and notes = 'EDUCATIONAL-DEPTH-PHASE1-WAVE2 new content review: the first Practice-track picture-led narrative Writing prompt ("The Riverboat at Dawn", eng-practice-writing-picturenarrative-riverboat-01, QT-WC-01b, image-stimulus observe -> interpret -> commit -> structure narrative task) -- see migration 255''s own header for the full evidence basis, the original-SVG-stimulus rationale, and the deliberate distinction from Mock''s own Q2 picture (migration 246''s old-shed-v1.svg). This is the first row of this response shape Practice has ever carried; review its picture stimulus directly on this surface (rendered as of this same commit), not merely its checklist.'
);

commit;

-- Read-only verification (run after applying):
--
-- select review_target_type, family_id, reviewer, decision, review_type
-- from public.ali_family_review
-- where family_id = 'eng-practice-writing-wc01b-riverboat'
-- order by created_at;
--
-- Expected: 1 row, decision = 'pending_independent_review',
-- reviewer = 'UNASSIGNED', review_type = 'mock_writing_prompt_independent_review'.
