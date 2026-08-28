-- Angel Digital 11+ — Migration 156
-- English Content Foundation, Increment 001 — Bee Passage Factual-
-- Evidence Pointer, CORRECTED (Decision 232, remediating the original
-- migration 156's live FAILURE reported by the Founder).
--
-- ============================================================
-- FOUNDER LIVE FAILURE EVIDENCE, AND WHY THIS VERSION IS DIFFERENT
-- ============================================================
-- The Founder applied migration 155 successfully, then attempted this
-- migration's original version and received:
--   ERROR: 23514 new row for relation "ali_passage_bank" violates check
--   constraint "ali_passage_bank_provenance_check"
-- Root cause, independently re-confirmed this session directly from
-- migration 043's own source: `ali_passage_bank.provenance` is NOT free
-- text. It carries a closed CHECK constraint
-- (`ali_passage_bank_provenance_check`) restricting it to exactly one
-- of six coarse CLASSIFICATION values: 'angel_original',
-- 'generated_original', 'licensed', 'public_domain',
-- 'authorised_import', 'evidence_only'. Migration 043's own inline
-- comment on the neighbouring `copyright_status` column already
-- distinguishes this explicitly: "distinct from provenance's coarse
-- category." The original migration 156 incorrectly treated this
-- closed classification field as if it were free-text narrative
-- evidence — a genuine design error, not a database defect.
-- PostgreSQL correctly rejected the write; the constraint is correct
-- and is NOT weakened, broadened, or dropped by this correction.
--
-- Because the UPDATE statement's own CHECK-constraint violation raised
-- a genuine PostgreSQL error inside this migration's own explicit
-- `begin;...commit;` transaction, before `commit;` was ever reached,
-- the entire transaction was aborted and rolled back by PostgreSQL's
-- own standard atomicity semantics — no partial write, no mutation of
-- any kind was left behind. (This is a reasoned proof from well-
-- established PostgreSQL transaction semantics, not a live-queried
-- confirmation, since this environment has no live database access;
-- the read-only verification query in this migration's own Founder-
-- facing decision record independently re-confirms it directly.)
-- Migration 156 has therefore never successfully applied, and is
-- corrected IN PLACE here — no migration 157 is created to repair it,
-- per this project's own "migrations are immutable once applied"
-- convention (Decision 218/229), which does not apply to a migration
-- that has never once successfully applied.
--
-- ============================================================
-- THE CORRECTED FIX
-- ============================================================
-- The Bee factual-verification evidence is REVIEW SUPPORT EVIDENCE,
-- not a change to the passage's own originality/rights classification
-- — it must never be confused with, or concatenated into, `provenance`.
-- `ali_passage_bank.provenance` is UNCHANGED by this corrected
-- migration and remains its original, semantically valid value
-- ('angel_original') throughout.
--
-- The correct home, traced directly from this project's own existing
-- review architecture: `ali_family_review.notes` — a genuinely
-- unconstrained `text` column (migration 034; the only check on this
-- table requires notes to be present for a REJECTED decision, entirely
-- unrelated to this migration), already used throughout this codebase
-- to carry free-text review context. This migration extends ONLY the
-- Bee passage's own PENDING independent-review placeholder row's
-- `notes` (the same row migration 155 already corrected to
-- `family_id = 'eng-inc001-bee-navigation'`), appending the factual-
-- verification evidence after its own original placeholder text —
-- never replacing it.
--
-- `ali_family_review.notes` was independently re-confirmed, this
-- session, to be fetched into `PendingReviewTarget.notes`
-- (`fetchPendingReviewTargets()`) but NEVER rendered anywhere in
-- `ReviewForm`'s own UI (zero matches for `target.notes` in any JSX
-- across `app/admin-beta/review/page.tsx`) — a real, separate gap from
-- the original migration 156's own genuine root cause. This migration
-- is paired with a small, additive application-code change (not a
-- database migration) rendering `target.notes` directly beneath a
-- passage's title/text/provenance line in `ReviewForm`, so the
-- evidence this migration writes is actually visible to a reviewer,
-- not merely present in the database. No new column or table was
-- created — the existing `notes` mechanism was sufficient once
-- rendered.
--
-- ============================================================
-- SAFETY GUARDS
-- ============================================================
-- Verifies, before writing: exactly 1 `ali_family_review` row with
-- `family_id = 'eng-inc001-bee-navigation'` (the POST-migration-155
-- value — this migration explicitly requires migration 155 to have
-- already applied, and refuses otherwise), `review_target_type =
-- 'passage'`, `reviewer = 'UNASSIGNED'`, `decision =
-- 'pending_independent_review'`, `review_type =
-- 'mock_english_passage_independent_review'`, and `notes` equal to
-- EITHER the exact original migration-154 placeholder text (pristine)
-- or the exact already-extended text (already corrected) — refuses on
-- any other state, including if no row carries the new family_id at
-- all (meaning migration 155 has not yet been applied here). Also
-- re-verifies, as a live precondition, that the Bee passage genuinely
-- exists with its own complete 8-question membership via
-- `learning_unit_id`, and that no OTHER, non-pending decision already
-- exists for this family_id + review_type (an already-approved review
-- must never be silently touched). After writing, re-verifies
-- `ali_passage_bank.provenance` for the Bee passage is STILL exactly
-- its original, untouched value, and that `decision`/`reviewer`/
-- `review_type`/`review_target_type` on the corrected row are all
-- unchanged — only `notes` was ever set.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does not touch `ali_passage_bank` in any way (no UPDATE against that
-- table anywhere in this file). Does not change `decision`, `reviewer`,
-- `review_type`, or `review_target_type` on any row. Does not touch
-- "The Understudy" or any question row. Does not touch `ali_mock_form`.
-- Does not certify, approve, or independently validate any factual
-- claim, or the passage itself — it makes Decision 229's own evidence
-- visible to a genuine independent reviewer; the reviewer's own
-- judgement of that evidence, and their own separate decision, remain
-- entirely theirs.
--
-- ============================================================
-- READ-ONLY FOUNDER VERIFICATION (run before AND after applying this
-- migration; mutates nothing)
-- ============================================================
-- select family_id, review_target_type, reviewer, decision, review_type, notes
-- from public.ali_family_review
-- where family_id in ('eng-inc001-understudy', 'eng-inc001-bee-navigation')
-- order by family_id;
-- -- Expect (both before and after this migration): family_id =
-- -- 'eng-inc001-understudy' and 'eng-inc001-bee-navigation' (proving
-- -- migration 155 already applied); reviewer = 'UNASSIGNED' on both;
-- -- decision = 'pending_independent_review' on both; review_type =
-- -- 'mock_english_passage_independent_review' on both. Only the Bee
-- -- row's own `notes` should differ before vs. after this migration.
--
-- select id, provenance from public.ali_passage_bank where id = 'eng-inc001-bee-navigation';
-- -- Expect, both before AND after this migration: provenance =
-- -- 'angel_original', unchanged.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query. REQUIRES migration 155
-- to have already been applied (Founder-confirmed) — this migration's
-- own precondition explicitly checks for, and refuses without, that.

begin;

do $$
declare
  v_family_id constant text := 'eng-inc001-bee-navigation';
  v_passage_id constant text := 'eng-inc001-bee-navigation';
  v_old_notes constant text := 'ENGLISH-CONTENT-FOUNDATION-INC001 new content review: passage "How Bees Find Their Way Home" + its complete 8-numbered-question comprehension set (eng-inc001-bee-q01..q08)';
  v_evidence_suffix constant text := E'\n\nFACTUAL VERIFICATION EVIDENCE (Decision 229/232), for the independent reviewer''s own assessment -- not a certification of these claims: two real-world claims in this passage were independently verified against multiple authoritative sources before correction. (1) Karl von Frisch published his full account of the waggle dance''s meaning in 1946, later earning a Nobel Prize. SOURCE-CONTAINS: Springer/Insectes Sociaux "The dance legacy of Karl von Frisch"; Bee Craft "How Karl von Frisch deciphered the waggle dance"; EBSCO Research Starters. ANGEL-SIMPLIFICATION: the passage names von Frisch and 1946 as one clean retrieval fact, mentioning the Nobel Prize briefly without a specific year. FACTUAL-CONFIDENCE: HIGH. UNRESOLVED-CONTESTED-CLAIMS: none identified. (2) Honeybees show real evidence of magnetic-field sensitivity via iron-rich abdominal particles, but their precise navigational role remains genuinely under investigation. SOURCE-CONTAINS: Springer/Animal Cognition and PMC "Magnetoreception in Hymenoptera"; Nature Scientific Reports "Magnetic Sensing through the Abdomen of the Honey Bee". ANGEL-SIMPLIFICATION: the passage states the real evidence (iron-rich particles, interference experiments) while explicitly flagging that its navigational role is still being investigated, not presented as an equally-established third system. FACTUAL-CONFIDENCE: MEDIUM. UNRESOLVED-CONTESTED-CLAIMS: whether abdominal iron granules are the true magnetoreceptor organ, versus an alternative location or a non-sensory function, is explicitly unresolved in the cited literature. Full citation list: migration 152''s own header and ANGEL_ENGLISH_CONTENT_FOUNDATION_INCREMENT_001_REVIEW.md.';
  v_new_notes constant text := v_old_notes || v_evidence_suffix;
  v_expected_question_count constant int := 8;
  v_non_pending_decisions int;
  v_passage_exists int;
  v_question_count int;
  v_pristine_count int;
  v_already_corrected_count int;
  v_post_write_count int;
begin
  select count(*) into v_non_pending_decisions
    from public.ali_family_review
    where family_id = v_family_id and review_type = 'mock_english_passage_independent_review'
      and decision <> 'pending_independent_review';
  if v_non_pending_decisions <> 0 then
    raise exception 'Migration 156 refused: found % row(s) with a genuine, non-pending decision already recorded for family_id = % -- a real review may already exist. This migration must never silently touch a row a reviewer has already acted on.', v_non_pending_decisions, v_family_id;
  end if;

  select count(*) into v_passage_exists
    from public.ali_passage_bank
    where id = v_passage_id and provenance = 'angel_original' and eligibility_status = 'authentic_assessment_candidate' and active = true;
  if v_passage_exists <> 1 then
    raise exception 'Migration 156 refused: expected exactly 1 authentic_assessment_candidate, active passage row with id = % and its original, untouched provenance (found %). This migration never modifies provenance -- if this check fails, provenance may already have been changed by something else and must be investigated before proceeding.', v_passage_id, v_passage_exists;
  end if;

  select count(*) into v_question_count
    from public.ali_question_bank
    where learning_unit_id = v_passage_id and eligibility_status = 'authentic_assessment_candidate' and active = true;
  if v_question_count <> v_expected_question_count then
    raise exception 'Migration 156 refused: expected exactly % authentic_assessment_candidate, active questions with learning_unit_id = % (found %).', v_expected_question_count, v_passage_id, v_question_count;
  end if;

  select count(*) into v_pristine_count
    from public.ali_family_review
    where family_id = v_family_id and review_target_type = 'passage' and reviewer = 'UNASSIGNED'
      and decision = 'pending_independent_review' and review_type = 'mock_english_passage_independent_review'
      and notes = v_old_notes;

  select count(*) into v_already_corrected_count
    from public.ali_family_review
    where family_id = v_family_id and review_target_type = 'passage' and reviewer = 'UNASSIGNED'
      and decision = 'pending_independent_review' and review_type = 'mock_english_passage_independent_review'
      and notes = v_new_notes;

  if v_pristine_count = 1 and v_already_corrected_count = 0 then
    update public.ali_family_review
    set notes = v_new_notes
    where family_id = v_family_id and review_target_type = 'passage' and reviewer = 'UNASSIGNED'
      and decision = 'pending_independent_review' and review_type = 'mock_english_passage_independent_review'
      and notes = v_old_notes;

    select count(*) into v_post_write_count
      from public.ali_family_review
      where family_id = v_family_id and notes = v_new_notes and review_target_type = 'passage'
        and reviewer = 'UNASSIGNED' and decision = 'pending_independent_review'
        and review_type = 'mock_english_passage_independent_review';
    if v_post_write_count <> 1 then
      raise exception 'Migration 156 post-write verification failed: expected 1 row with the extended notes and every other field unchanged, found %. Rolling back.', v_post_write_count;
    end if;

    select count(*) into v_post_write_count
      from public.ali_passage_bank where id = v_passage_id and provenance = 'angel_original';
    if v_post_write_count <> 1 then
      raise exception 'Migration 156 post-write verification failed: the Bee passage''s own provenance must remain exactly angel_original, unchanged by this migration -- found %. Rolling back.', v_post_write_count;
    end if;

    raise notice 'Migration 156 (corrected): appended a factual-verification evidence pointer (Decision 229/232) to the Bee passage''s own pending independent-review row notes, never touching ali_passage_bank.provenance. Passage provenance and 8-question membership both re-verified unchanged.';

  elsif v_already_corrected_count = 1 and v_pristine_count = 0 then
    raise notice 'Migration 156 (corrected): the Bee passage review row already carries the extended notes -- already applied. No changes made.';

  else
    raise exception 'Migration 156 refused: expected exactly 1 pristine row (original notes, found %) XOR exactly 1 already-corrected row (found %) for family_id = %. If both counts are 0, migration 155 may not yet be applied here -- re-verify production state before proceeding.', v_pristine_count, v_already_corrected_count, v_family_id;
  end if;
end $$;

commit;
