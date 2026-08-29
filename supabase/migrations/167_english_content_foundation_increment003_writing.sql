-- Angel Digital 11+ — Migration 167
-- English Content Foundation, Increment 003 (Decision 244) — Writing,
-- Candidate Content Only.
--
-- ================================================================
-- SECTION 5 — WRITING TAXONOMY RECONCILIATION (Decision 244 §5)
-- ================================================================
-- Before authoring anything, this migration answers the four questions
-- Decision 244 §5 requires, from real evidence (docs/intelligence/
-- CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md §5, read directly this
-- session, not recalled):
--
-- (1) What Writing task types actually exist canonically? Exactly TWO:
--     QT-WC-01a (Reflective/Discursive Response Prompt, always Question
--     1, no stimulus image) and QT-WC-01b (Picture-Stimulus Narrative
--     Prompt, always Question 2, requires an accompanying photograph).
--     No third canonical type exists anywhere in the Question
--     Intelligence Framework's Evidence Traceability Matrix (§7).
--
-- (2) Is narrative/descriptive variation legitimately representable
--     within QT-WC-01a? YES, directly from QT-WC-01a's own Measurement
--     Purpose as defined in the Framework (§5): "Requires the candidate
--     to produce extended original writing (minimum six sentences)
--     responding to a question or statement about their own experience,
--     opinion, OR IMAGINATION" [emphasis added]. Imagination is already
--     one of QT-WC-01a's three named response bases -- co-equal with
--     experience and opinion -- not a fourth type waiting to be
--     invented. All 6 of Angel's existing QT-WC-01a prompts (migrations
--     098/153) draw on real personal experience or stated opinion only;
--     none draws on invented/imaginative content. This is a genuine,
--     evidenced task-shape gap WITHIN the existing canonical type, not
--     a reason to create a new one.
--
-- (3) Is there another already-approved text-based QT-WC type? No —
--     only QT-WC-01a and QT-WC-01b exist, and QT-WC-01b requires
--     picture-stimulus infrastructure that does not exist and remains
--     explicitly deferred (unchanged by this migration).
--
-- (4) Would creating a new task type require architecture/evidence
--     approval? Yes, and this migration does not attempt it — no new
--     `skill` value is introduced anywhere below; every row uses
--     'QT-WC-01a', identical to all 6 existing Writing rows.
--
-- CONCLUSION: canonical architecture supports one genuinely different
-- text-based Writing shape (an imagination-based QT-WC-01a prompt) —
-- per Decision 244 §5's own instruction, exactly ONE new prompt is
-- authored below. QT-WC-01c is NOT created. QT-WC-01b (picture-
-- stimulus) is NOT begun — no image pipeline, storage, rights, or
-- accessibility work of any kind is touched by this migration.
--
-- ================================================================
-- THE PROMPT
-- ================================================================
-- "An Invented Place" (eng-inc003-writing-imaginedplace-01) — the first
-- Angel Writing prompt to draw on invented/imaginative content rather
-- than real personal experience or stated opinion. Genuinely distinct
-- task shape from all 6 existing prompts (opinion-shift, relationship-
-- emotion, direct-opinion, place-arrival, mistake/consequence, screen-
-- time-opinion — all real-experience or real-opinion based); this one
-- requires sustained original invention within a bounded, low-risk
-- prompt shape (an imagined place, not an imagined event/character/
-- plot, which keeps the scope tight and gradeable against the same
-- WC-01/WC-02 competencies as every other QT-WC-01a prompt). Text-only
-- -- no image, stimulus, or external asset of any kind.
--
-- REPRESENTATION STANDARD: this prompt names no human character at all
-- (the invented "place" is the sole subject), so QUESTION_AUTHORING_
-- STANDARD.md §16 has no named-character surface to check against here
-- -- consistent with how several existing Writing prompts (e.g.
-- "Somewhere New") are similarly unpeopled.
--
-- eligibility_status = 'authentic_assessment_candidate' -- NOT
-- 'practice_eligible', NOT 'independently_validated', NOT
-- 'mock_eligible'. No existing ali_question_bank row is read,
-- referenced, or modified.
--
-- Idempotent: the INSERT uses "on conflict (id) do nothing".
--
-- NOT APPLIED. Generated for independent-reviewer and Founder inspection
-- via Supabase Dashboard > SQL Editor > New query, after migration 166
-- (no functional ordering dependency -- distinct rows, distinct table
-- region -- but numbered to follow it since both are Decision 244
-- output).

begin;

insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class)
values
('eng-inc003-writing-imaginedplace-01', 'writing', 'QT-WC-01a', array['csse'], 'hard', 'open-response', 1500,
 $json${"id":"eng-inc003-writing-imaginedplace-01","title":"An Invented Place","prompt":"Write about a place that exists only in your imagination -- it might be somewhere from a story you have thought up, an imagined land, or an imagined version of somewhere real. Describe what makes this place unusual, what it would feel like to actually be there, and one thing that might happen if someone visited it for the first time.","type":"narrative","difficulty":"year6-exam","timeMinutes":25,"checklist":["Write at least six sentences","Invent a specific place with real, particular details -- not a vague or generic setting like 'a magical forest' with no distinguishing features","Describe what it would FEEL like to be there, using at least one sensory or emotional detail, not only what it looks like","Include one specific thing that happens when someone visits, giving the writing a clear moment or event rather than only description","Keep the invented place internally consistent -- do not contradict a detail you have already given","Check paragraphing, spelling and punctuation carefully"]}$json$,
 'Angel English Content Foundation, Increment 003 (Decision 244). QT-WC-01a (Reflective/Discursive Response Prompt), competency WC-01. Prompt shape: imagination-based invention (an imagined place), genuinely distinct from all 6 existing QT-WC-01a prompts (migrations 098/153), which are each grounded in real personal experience or stated opinion. Legitimately representable within QT-WC-01a per that type''s own canonical Measurement Purpose, which names "imagination" alongside experience and opinion (docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md §5) -- no new Writing task type is introduced.', 3, 'eng-inc003-writing-imaginedplace-01',
 'eng-inc003-writing-wc01a-imaginedplace', 'angel_original', 'authentic_assessment_candidate', 1, true,
 'Describing an invented place only in generic, storybook terms ("a magical forest with talking animals") without any specific, particular detail that makes it feel genuinely imagined rather than borrowed from a familiar trope, or omitting the required visiting-event and leaving the response as description alone.',
 'FAR_TRANSFER')
on conflict (id) do nothing;

commit;
