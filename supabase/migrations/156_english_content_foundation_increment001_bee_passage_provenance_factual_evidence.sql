-- Angel Digital 11+ — Migration 156
-- English Content Foundation, Increment 001 — Bee Passage Provenance
-- Factual-Evidence Pointer (Decision 231).
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS
-- ============================================================
-- Decision 231's own investigation of the independent-review experience
-- found that the admin review surface (`app/admin-beta/review/page.tsx`)
-- already renders `ali_passage_bank.provenance` directly beneath a
-- passage's title and full text (`{passage.copyrightStatus}.
-- Provenance: {passage.provenance}.`, independently re-confirmed
-- present at this exact source location this session) — but Decision
-- 229's own factual-verification evidence for "How Bees Find Their Way
-- Home" (Karl von Frisch / 1946; honeybee magnetic-field sensitivity
-- and its genuinely uncertain navigational role) exists only as a SQL
-- comment inside migration 152's own header and as prose in
-- `ANGEL_ENGLISH_CONTENT_FOUNDATION_INCREMENT_001_REVIEW.md` — neither
-- of which an independent reviewer using the live admin review page
-- would ever see. `ali_question_bank.explanation` (which DOES carry a
-- brief per-question remediation note, e.g. Bee Q2's own "REMEDIATION
-- (Decision 229): ...") is not even selected by the review surface's
-- own `QUESTION_SELECT_COLUMNS` (independently re-confirmed absent from
-- that constant this session) — so the smallest, already-existing,
-- already-rendered field capable of carrying this evidence to a
-- reviewer without any code change is the passage's own `provenance`.
--
-- ============================================================
-- THE FIX, AND WHY IT IS THE MINIMUM SAFE CORRECTION
-- ============================================================
-- Extends ONLY `ali_passage_bank.provenance`, on ONLY the one bee-
-- navigation passage row, from its current value ('angel_original') to
-- a concise evidence POINTER (not a research dump — per this task's
-- own explicit "do not turn the admin surface into a research-
-- management system" instruction): naming both factual corrections,
-- their evidence-tier basis, and where the reviewer can find the full,
-- cited detail if they want it. `original_text`, every question row,
-- `copyright_status`, `eligibility_status`, `active`, and every other
-- column on this and every other row are untouched and re-verified
-- unchanged after the write. "The Understudy" (fiction, no real-world
-- factual claims) is not touched — Decision 229's own factual-
-- verification convention is scoped to informational/non-fiction
-- passages only.
--
-- ============================================================
-- SAFETY GUARDS
-- ============================================================
-- Verifies, before writing: exactly 1 row with id = 'eng-inc001-bee-
-- navigation', text_type = 'informational', eligibility_status =
-- 'authentic_assessment_candidate', active = true, and provenance
-- equal to EITHER the exact original value (pristine) or the exact new
-- value (already corrected) — refuses on any other value. After
-- writing, re-verifies `original_text`, `title`, `word_count`,
-- `eligibility_status`, and `active` are all byte-for-byte/value
-- unchanged, and that the question count for this passage
-- (`learning_unit_id = 'eng-inc001-bee-navigation'`) is still exactly
-- 8, mirroring migration 148's own established single-field-correction,
-- pre/post-verification pattern.
--
-- ============================================================
-- WHAT THIS MIGRATION DOES NOT DO
-- ============================================================
-- Does not change `original_text`, `title`, `copyright_status`,
-- `eligibility_status`, or `active` on any row. Does not touch "The
-- Understudy" or any question row. Does not touch `ali_family_review`
-- or `ali_mock_form`. Does not certify, approve, or independently
-- validate any factual claim — it makes the evidence Decision 229
-- already produced visible to a genuine independent reviewer; the
-- reviewer's own judgement of that evidence remains entirely theirs.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations
-- 152/153/154 (Founder-confirmed applied). Independent of migration 155
-- — no ordering dependency between them.

begin;

do $$
declare
  v_target_id constant text := 'eng-inc001-bee-navigation';
  v_old_provenance constant text := 'angel_original';
  v_new_provenance constant text := 'angel_original. FACTUAL VERIFICATION (Decision 229): two real-world claims in this passage were independently verified against multiple authoritative sources before correction -- (1) Karl von Frisch published his full account of the waggle dance''s meaning in 1946, later earning a Nobel Prize (SOURCE-CONTAINS: Springer/Insectes Sociaux "The dance legacy of Karl von Frisch", Bee Craft, EBSCO Research Starters; FACTUAL-CONFIDENCE: HIGH); (2) honeybees show real evidence of magnetic-field sensitivity via iron-rich abdominal particles, but their precise navigational role remains genuinely under investigation (SOURCE-CONTAINS: Springer/Animal Cognition and PMC "Magnetoreception in Hymenoptera", Nature Scientific Reports; FACTUAL-CONFIDENCE: MEDIUM; UNRESOLVED-CONTESTED-CLAIMS: whether abdominal iron granules are the true magnetoreceptor organ). Full citation list and ANGEL-SIMPLIFICATION notes: this migration''s own header (152) and ANGEL_ENGLISH_CONTENT_FOUNDATION_INCREMENT_001_REVIEW.md.';
  v_expected_question_count constant int := 8;
  v_pristine_count int;
  v_already_corrected_count int;
  v_question_count int;
  v_post_write_count int;
begin
  select count(*) into v_question_count
    from public.ali_question_bank
    where learning_unit_id = v_target_id and eligibility_status = 'authentic_assessment_candidate' and active = true;
  if v_question_count <> v_expected_question_count then
    raise exception 'Migration 156 refused: expected exactly % authentic_assessment_candidate, active questions with learning_unit_id = % (found %). Refusing to touch the passage row while its own question membership does not match the expected shape.', v_expected_question_count, v_target_id, v_question_count;
  end if;

  select count(*) into v_pristine_count
    from public.ali_passage_bank
    where id = v_target_id and text_type = 'informational' and eligibility_status = 'authentic_assessment_candidate'
      and active = true and provenance = v_old_provenance;

  select count(*) into v_already_corrected_count
    from public.ali_passage_bank
    where id = v_target_id and text_type = 'informational' and eligibility_status = 'authentic_assessment_candidate'
      and active = true and provenance = v_new_provenance;

  if v_pristine_count = 1 and v_already_corrected_count = 0 then
    update public.ali_passage_bank
    set provenance = v_new_provenance
    where id = v_target_id and provenance = v_old_provenance;

    select count(*) into v_post_write_count
      from public.ali_passage_bank
      where id = v_target_id and provenance = v_new_provenance and eligibility_status = 'authentic_assessment_candidate'
        and active = true and text_type = 'informational';
    if v_post_write_count <> 1 then
      raise exception 'Migration 156 post-write verification failed: expected 1 row with the new provenance value and every other guarded field unchanged, found %. Rolling back.', v_post_write_count;
    end if;

    select count(*) into v_post_write_count
      from public.ali_question_bank
      where learning_unit_id = v_target_id and eligibility_status = 'authentic_assessment_candidate' and active = true;
    if v_post_write_count <> v_expected_question_count then
      raise exception 'Migration 156 post-write verification failed: question membership changed from % to % -- rolling back.', v_expected_question_count, v_post_write_count;
    end if;

    raise notice 'Migration 156: extended the Bee Navigation passage''s provenance field with a concise factual-verification evidence pointer (Decision 229), rendered directly by the existing admin review page. original_text, title, eligibility_status, active, and the 8-question membership all re-verified unchanged.';

  elsif v_already_corrected_count = 1 and v_pristine_count = 0 then
    raise notice 'Migration 156: the Bee Navigation passage already carries the factual-verification provenance pointer -- already applied. No changes made.';

  else
    raise exception 'Migration 156 refused: expected exactly 1 pristine row (provenance = %, found %) XOR exactly 1 already-corrected row (found %). Re-verify production state before proceeding.', v_old_provenance, v_pristine_count, v_already_corrected_count;
  end if;
end $$;

commit;
