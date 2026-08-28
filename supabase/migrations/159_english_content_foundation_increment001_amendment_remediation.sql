-- Angel Digital 11+ — Migration 159
-- English Content Foundation Increment 001, Decision 235 — Amendment
-- Remediation (Understudy Q1 marking policy; Somewhere New and Screen
-- Time Writing prompts). Additive corrective UPDATEs against LIVE
-- content (migrations 152/153 are already applied) -- neither 152 nor
-- 153 is edited by this migration.
--
-- ============================================================
-- SCOPE, AND WHY BEE NAVIGATION IS NOT TOUCHED HERE
-- ============================================================
-- Four targets were recorded approved_with_amendment. Independent re-
-- audit this session (Decision 235, amendment register --
-- ENGLISH_INC001_AMENDMENT_REGISTER, lib/adminReview.ts) found the
-- "How Bees Find Their Way Home" amendment ALREADY SATISFIED: Decision
-- 229's own prior correction (still live, byte-confirmed this session
-- by direct re-read of migration 152's own real SQL and a full re-grep
-- for stale 'established'/'three navigation systems' wording, none
-- found) already states the magnetic-sensing paragraph's required
-- cautious framing verbatim, and Q7 already reads "the three things the
-- passage describes bees using or sensing". No UPDATE is issued against
-- eng-inc001-bee-navigation or any of its 8 questions by this migration
-- -- there is nothing to correct. This is disclosed as a real finding,
-- not a silent skip: see the amendment register and Decision 235's own
-- log entry for the full audit trail.
--
-- A Mistake You Learned From (approved, no amendment) is not touched,
-- consistent with every other migration in this increment.
--
-- ============================================================
-- 1. UNDERSTUDY Q1 -- MARKING POLICY
-- ============================================================
-- Canonical answer remains 'laryngitis' (unchanged). acceptedAnswers
-- extended to explicitly credit reasonable paraphrases of the note's own
-- diagnosis ('she had lost her voice' / 'she lost her voice'), scored by
-- the REAL TIER2_ACCEPTED_SET engine (checkAcceptedAnswerSet,
-- lib/learningEngine/englishAnswerValidation.ts, unmodified, token-
-- sequence matching -- confirmed this session, not a cosmetic addition).
-- modelAnswer is deliberately left untouched: it is rendered directly to
-- learners (app/learning-intelligence/practice/[area]/page.tsx,
-- app/english/[id]/page.tsx) and is also read by the legacy
-- extractKeywords() heuristic (app/english/[id]/page.tsx) -- adding
-- marking-policy prose to it would leak reviewer-facing meta-commentary
-- into a 10-11-year-old's own feedback screen and could perturb that
-- heuristic. The marking policy itself is instead appended to
-- `explanation` (never learner-facing; author/reviewer documentation
-- only), now selected and rendered by the review surface for the first
-- time this session (QUESTION_SELECT_COLUMNS, QuestionOrWritingTaskBody,
-- lib/adminReview.ts / app/admin-beta/review/page.tsx) -- the same class
-- of "field exists but was invisible to a reviewer" gap Decision 232
-- found and fixed for provenance/notes.
--
-- ============================================================
-- 2. SOMEWHERE NEW -- PROMPT + CHECKLIST + MISCONCEPTION
-- ============================================================
-- Implements the Founder's own clarification (migration 158) exactly:
-- allows a genuine personal experience OR a plausible imagined
-- situation (never testing autobiographical truth), and replaces the
-- forced "feelings changed" formula with a broader requirement for
-- development of thoughts/impressions/feelings. QT-WC-01a shape, place-
-- arrival concept, sensory-specificity requirement, coherent-sequencing
-- requirement, timeMinutes, difficulty, and the no-deterministic-model-
-- answer contract are all unchanged.
--
-- ============================================================
-- 3. SCREEN TIME -- CHECKLIST + MISCONCEPTION (prompt.prompt unchanged)
-- ============================================================
-- Checklist's genre-guidance line now explicitly permits a rhetorical
-- question or moment of emphasis within a personal-opinion voice, while
-- still distinguishing that from a formal persuasive-speech register.
-- The 'genuinely experienced/noticed' authenticity gate is replaced with
-- a requirement for specific, convincing examples or reasoning --
-- dropping the authenticity test, not the requirement for real support.
--
-- ============================================================
-- SAFETY
-- ============================================================
-- Each of the 3 corrections below is its own independent, fail-closed,
-- idempotent do $$ block: a live precondition confirms the EXACT current
-- (pristine) stored value before writing anything, an already-corrected
-- state is a verified no-op, and any other state raises an exception and
-- writes nothing. jsonb_set is used to replace only the specific key(s)
-- named above -- no other key in any prompt jsonb (id, title, type,
-- difficulty, timeMinutes for the Writing rows; marks, skill,
-- passageTitle, passageText, validationTier for Understudy Q1) is read
-- or written. No eligibility_status, active, content_version, decision,
-- or review-history row is touched anywhere in this migration. No
-- English Mock is created. No new question or passage row is inserted.
--
-- NOT APPLIED. Generated for Founder application via Supabase Dashboard
-- > SQL Editor > New query, after migrations 152/153 (already live).

begin;

-- ─── 1. Understudy Q1 ────────────────────────────────────────────────
do $$
declare
  v_pristine int;
  v_already int;
begin
  select count(*) into v_already
  from public.ali_question_bank
  where id = 'eng-inc001-understudy-q01'
    and prompt -> 'acceptedAnswers' ? 'she had lost her voice';

  if v_already = 1 then
    raise notice 'Migration 159 (Understudy Q1): already corrected -- acceptedAnswers already includes the lost-her-voice paraphrase. No changes made.';
  else
    select count(*) into v_pristine
    from public.ali_question_bank
    where id = 'eng-inc001-understudy-q01'
      and learning_unit_id = 'eng-inc001-understudy'
      and prompt ->> 'modelAnswer' = 'The note confirmed that she had laryngitis.'
      and prompt -> 'acceptedAnswers' = '["laryngitis","she had laryngitis","the note said she had laryngitis"]'::jsonb
      and eligibility_status = 'authentic_assessment_candidate'
      and active = true;

    if v_pristine != 1 then
      raise exception 'Migration 159 (Understudy Q1) refused: expected exactly 1 pristine row matching the known post-Decision-229 modelAnswer/acceptedAnswers (found %), or the amendment already applied (found %). Re-verify production state before proceeding.',
        v_pristine, v_already;
    end if;

    update public.ali_question_bank
    set
      prompt = jsonb_set(
        prompt,
        '{acceptedAnswers}',
        '["laryngitis","she had laryngitis","the note said she had laryngitis","she had lost her voice","she lost her voice"]'::jsonb
      ),
      explanation = explanation || ' AMENDMENT (Decision 235, reviewer Ayobami Lawal): explicit marking policy -- the mark is for identifying the medical condition the note itself states (laryngitis) or a reasonable paraphrase of it (e.g. ''she had lost her voice''), matched via acceptedAnswers. A quotation of only ''a hoarse whisper'', with no reference to illness or voice loss, does not receive the mark on its own: that is the narrator''s own later description of Isla''s voice, not what the note itself stated, and the two must not be conflated.'
    where id = 'eng-inc001-understudy-q01';

    raise notice 'Migration 159 (Understudy Q1): acceptedAnswers extended with the lost-her-voice paraphrase; explanation extended with the explicit marking policy.';
  end if;
end $$;

-- ─── 2. Somewhere New ────────────────────────────────────────────────
do $$
declare
  v_pristine int;
  v_already int;
  v_new_prompt_text text := 'Write about arriving somewhere completely new -- it could be a real place you have visited or moved to, or a plausible situation you imagine happening to you (a new school, a new country, a new home). Describe what you noticed first, how the place felt different from what you were used to, and how your thoughts, impressions or feelings developed the more time you spent there.';
  v_new_checklist jsonb := '["Write at least six sentences","Describe a specific place with real, convincing detail -- whether drawn from genuine experience or a plausible imagined situation, not a vague or generic one","Include at least one concrete sensory detail (something you saw, heard, or noticed specifically)","Show how your thoughts, impressions or feelings developed the more time you spent there","Organise your writing so the order makes sense -- first impressions before later reflections","Check paragraphing, spelling and punctuation carefully"]'::jsonb;
  v_new_misconception text := 'Describing the place in general, guidebook-style terms (''it was big and busy'') rather than specific, convincing detail, or simply stating that impressions developed without showing the actual moments or details that shaped them. Note: the response does not need to describe a real personal experience -- a plausible imagined situation is equally valid, since the task assesses writing quality, not autobiographical truth.';
begin
  select count(*) into v_already
  from public.ali_question_bank
  where id = 'mock-writing-newplace-01'
    and prompt ->> 'prompt' = v_new_prompt_text;

  if v_already = 1 then
    raise notice 'Migration 159 (Somewhere New): already corrected. No changes made.';
  else
    select count(*) into v_pristine
    from public.ali_question_bank
    where id = 'mock-writing-newplace-01'
      and family_id = 'mock-writing-wc01a-newplace'
      and prompt ->> 'prompt' = 'Write about a time you visited somewhere completely new to you -- it could be a place you moved to, a place you visited on holiday, or even a new school or club. Describe what you noticed first, how the place felt different from what you were used to, and how your feelings about it changed the more time you spent there.'
      and prompt -> 'checklist' = '["Write at least six sentences","Describe a specific, real place, not a vague or invented one","Include at least one concrete sensory detail (something you saw, heard, or noticed specifically)","Show HOW your feelings changed over time, not only that they did","Organise your writing so the order makes sense -- first impressions before later feelings","Check paragraphing, spelling and punctuation carefully"]'::jsonb
      and eligibility_status = 'authentic_assessment_candidate'
      and active = true;

    if v_pristine != 1 then
      raise exception 'Migration 159 (Somewhere New) refused: expected exactly 1 pristine row matching the known migration-153 prompt/checklist (found %), or the amendment already applied (found %). Re-verify production state before proceeding.',
        v_pristine, v_already;
    end if;

    update public.ali_question_bank
    set
      prompt = jsonb_set(jsonb_set(prompt, '{prompt}', to_jsonb(v_new_prompt_text)), '{checklist}', v_new_checklist),
      addresses_misconception = v_new_misconception
    where id = 'mock-writing-newplace-01';

    raise notice 'Migration 159 (Somewhere New): prompt/checklist/misconception updated per the Founder''s own clarification (migration 158).';
  end if;
end $$;

-- ─── 3. Screen Time ──────────────────────────────────────────────────
do $$
declare
  v_pristine int;
  v_already int;
  v_new_checklist jsonb := '["Write at least six sentences","State your own opinion clearly, near the start","Support your opinion with specific, convincing examples or reasoning, not just a generic list of reasons","Consider, briefly, why someone might disagree with you","Keep a genuine personal voice throughout -- this is a personal opinion piece, not a formal debate speech, though a rhetorical question or a moment of deliberate emphasis is fine if it suits your own voice","Organise your writing into clear paragraphs","Check spelling and punctuation carefully"]'::jsonb;
  v_new_misconception text := 'Turning the response into a formal persuasive-speech register (for example addressing ''Ladies and gentlemen'', or structuring it as a speech to an audience) rather than the reflective, first-person opinion piece this format requires -- using a rhetorical question or a moment of deliberate emphasis within a personal-opinion voice is not itself a problem; only shifting into a different genre is.';
begin
  select count(*) into v_already
  from public.ali_question_bank
  where id = 'mock-writing-screentime-01'
    and prompt -> 'checklist' = v_new_checklist;

  if v_already = 1 then
    raise notice 'Migration 159 (Screen Time): already corrected. No changes made.';
  else
    select count(*) into v_pristine
    from public.ali_question_bank
    where id = 'mock-writing-screentime-01'
      and family_id = 'mock-writing-wc01a-screentime'
      and prompt -> 'checklist' = '["Write at least six sentences","State your own opinion clearly, near the start","Support your opinion with your own experience or something you have genuinely noticed, not a generic list of reasons","Consider, briefly, why someone might disagree with you","Keep a consistent personal voice throughout, since this is your own opinion, not a formal debate speech","Organise your writing into clear paragraphs","Check spelling and punctuation carefully"]'::jsonb
      and eligibility_status = 'authentic_assessment_candidate'
      and active = true;

    if v_pristine != 1 then
      raise exception 'Migration 159 (Screen Time) refused: expected exactly 1 pristine row matching the known migration-153 checklist (found %), or the amendment already applied (found %). Re-verify production state before proceeding.',
        v_pristine, v_already;
    end if;

    update public.ali_question_bank
    set
      prompt = jsonb_set(prompt, '{checklist}', v_new_checklist),
      addresses_misconception = v_new_misconception
    where id = 'mock-writing-screentime-01';

    raise notice 'Migration 159 (Screen Time): checklist/misconception updated -- genre guidance no longer categorically prohibits rhetorical technique; authenticity gate removed.';
  end if;
end $$;

commit;

-- Read-only verification (run before and after applying):
--
-- select id, prompt -> 'acceptedAnswers' as accepted_answers, explanation
-- from public.ali_question_bank where id = 'eng-inc001-understudy-q01';
--
-- select id, prompt ->> 'prompt' as task_text, prompt -> 'checklist' as checklist, addresses_misconception
-- from public.ali_question_bank where id in ('mock-writing-newplace-01', 'mock-writing-screentime-01');
