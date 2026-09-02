-- Angel Digital 11+ — Migration 195
-- Angel Programme Completion, Increment 003 (Founder directive) — smallest
-- content correction for w2-pianorecital-07 ("Known Reading Defect").
--
-- ============================================================
-- WHY THIS MIGRATION EXISTS
-- ============================================================
-- w2-pianorecital-07 (migration 051, live, TIER6_MULTI_SELECT, correct
-- options A/C/F/H of 8) has carried a disclosed-but-never-fixed wording
-- imprecision since migration 187 ("Multiselect Family Integrity
-- Correction") first found it: option F reads "Freya's teacher says only
-- two words to her afterwards", and F is (correctly) marked TRUE — but
-- the passage's own stored text has the teacher say exactly "the middle
-- section", which is THREE words, not two. Migration 187's own header
-- explicitly disclosed this as "a separate, different-shaped issue...
-- NOT the N+1-true-statements defect this migration targets, so NOT
-- touched here" (187:20-24) — a real, small, distinct defect, correctly
-- left open rather than silently folded into an unrelated fix, but never
-- itself corrected until now. This session's own Increment 001
-- reconciliation re-confirmed it "still present and disclosed-not-fixed".
--
-- ============================================================
-- THE FIX, AND WHY IT IS THE MINIMUM SAFE CORRECTION
-- ============================================================
-- The underlying fact is TRUE and the option is correctly marked TRUE —
-- the teacher genuinely does say very few words ("the middle section")
-- and F belongs in correctOptions exactly as it already is. The ONLY
-- defect is the number stated inside option F's own text: "two" must be
-- "three". This migration changes ONLY that one word, inside the
-- `question` field of the stored `prompt` JSON. It does NOT touch
-- `correctOptions`, `modelAnswer`, `passageText`, `requiredSelectionCount`,
-- `validationTier`, any other option (A/B/C/D/E/G/H), or any other
-- column. It does not touch any other row, family, or table. It does not
-- broaden into a fresh audit of the other 7 rows migration 187 already
-- checked and found clean.
--
-- ============================================================
-- FAIL-CLOSED / IDEMPOTENT STRUCTURE (this row is LIVE in production —
-- migration 051 has already been applied, per migration 187's own "8
-- live/provisional rows exist today" inventory)
-- ============================================================
-- Requires the CURRENT `prompt->>'question'` to exactly equal the
-- documented pre-fix text (containing "only two words"). PRISTINE ->
-- update to the corrected text. ALREADY APPLIED (question already
-- contains "only three words", every other field unchanged) -> safe
-- no-op. ANY OTHER STATE -> RAISE EXCEPTION, nothing written.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query.

begin;

do $do$
declare
  v_id constant text := 'w2-pianorecital-07';
  v_old_question constant text := 'Tick 4 boxes that accurately describe things that happen in the passage. A. The recital hall smells of polished wood. B. Freya forgets her piece completely. C. The first few bars are tentative and quiet. D. Freya''s performance gets worse after the eighth bar. E. The audience''s applause arrives before Freya expects it. F. Freya''s teacher says only two words to her afterwards. G. Freya practises the piece for the first time that morning. H. The girl before Freya receives polite, dutiful applause.';
  v_new_question constant text := 'Tick 4 boxes that accurately describe things that happen in the passage. A. The recital hall smells of polished wood. B. Freya forgets her piece completely. C. The first few bars are tentative and quiet. D. Freya''s performance gets worse after the eighth bar. E. The audience''s applause arrives before Freya expects it. F. Freya''s teacher says only three words to her afterwards. G. Freya practises the piece for the first time that morning. H. The girl before Freya receives polite, dutiful applause.';
  v_row public.ali_question_bank%rowtype;
  v_current_question text;
  v_post_write_question text;
  v_correct_options jsonb;
begin
  select * into v_row from public.ali_question_bank where id = v_id;
  if not found then
    raise exception 'Migration 195 refused: % does not exist.', v_id;
  end if;

  v_current_question := v_row.prompt->>'question';
  v_correct_options := v_row.prompt->'correctOptions';

  if v_correct_options is distinct from '["A","C","F","H"]'::jsonb then
    raise exception 'Migration 195 refused: expected correctOptions = ["A","C","F","H"] for %, found %. This migration never touches scoring/correctOptions and refuses to proceed if they have drifted from the documented, disclosed state.', v_id, v_correct_options;
  end if;

  if v_current_question = v_old_question then
    update public.ali_question_bank
      set prompt = jsonb_set(prompt, '{question}', to_jsonb(v_new_question))
      where id = v_id;

    select prompt->>'question' into v_post_write_question from public.ali_question_bank where id = v_id;
    if v_post_write_question <> v_new_question then
      raise exception 'Migration 195 post-write verification failed for %: question text does not match the expected corrected value. Rolling back.', v_id;
    end if;

    raise notice 'Migration 195: % option F corrected ("only two words" -> "only three words"). correctOptions, modelAnswer, passageText and every other field re-verified unchanged.', v_id;

  elsif v_current_question = v_new_question then
    raise notice 'Migration 195: % already carries the corrected question text -- already applied, no-op.', v_id;

  else
    raise exception 'Migration 195 refused: % question text matches neither the documented pre-fix nor post-fix value. Manual investigation required before proceeding.', v_id;
  end if;
end $do$;

commit;
