-- Angel Digital 11+ — Migration 248
-- CSSE English Full Paper — CORRECTED content section, replacing the
-- content half of migration 245 that failed in production.
--
-- ============================================================
-- WHY THIS EXISTS, AND WHY IT IS A NEW FILE, NOT AN EDIT TO 245 OR 246
-- ============================================================
-- Migration 245's schema block (ali_writing_assessment, its two RPCs,
-- ali_mock_form's two new columns, the subject-aware mock_get_active_
-- form()) IS applied in production — confirmed live this session.
-- Migration 245's own SEPARATE content block (promote mock-writing-
-- mindchange-01, insert english-full-mock-v1) FAILED and rolled back in
-- full: it copied reading-comprehension-mock-1's entire 28-question
-- manifest into a second form, and ali_block_mock_form_content_reuse()
-- (migration 208) correctly refused it — a form must never reuse
-- content another form has already claimed, independent of exposure
-- history. Confirmed by direct Founder query: mock-writing-mindchange-01
-- is still independently_validated; english-full-mock-v1 has 0 rows.
-- See ANGEL_MIGRATION_245_ENGLISH_MOCK_CONTENT_COLLISION_REPORT.md for
-- the full investigation.
--
-- Per this project's own standing, repeatedly-applied discipline
-- (e.g. migration 210's own header: "migration 207 itself is not
-- edited... superseded in full, documented, not silently rewritten"),
-- an already-committed migration file is never edited after the fact,
-- applied or not — this preserves git history as a truthful record of
-- what was actually reviewed and decided at the time. This migration
-- therefore does NOT edit 245's file. It also does NOT edit 246's file
-- (also already committed): 246 assumed english-full-mock-v1 already
-- existed (which it doesn't) and would have been a silent no-op for its
-- own manifest-append step if applied as-is. Migration 246 is hereby
-- SUPERSEDED, not deleted, not edited, not to be applied — this
-- migration absorbs and corrects everything 246 was going to do
-- (the Q1 question/marks key fix, the Q2 content row) alongside the
-- corrected Reading manifest, in one place, so the Founder has exactly
-- one file to apply for the corrected content, not two with an
-- easy-to-miss ordering dependency.
--
-- ============================================================
-- THE CORRECTED READING COMPREHENSION MANIFEST
-- ============================================================
-- Replaces the 28 retired/exposed questions with 22 genuinely fresh,
-- never-exposed, never-manifested questions across two whole passages,
-- both already promoted to mock_eligible by migration 210 (a separate,
-- standalone, already-applied migration — confirmed live by direct
-- Founder query):
--   - "Crossing the Atlantic: Sail and Steam" (eng-inc002-sailandsteam):
--     10 questions, 17 marks.
--   - "The Loose Connection" (eng-inc002-roboticsfinal): 12 questions,
--     22 marks.
-- 22 questions, 39 marks total. Zero-collision confirmed by exhaustive
-- check: only THREE ali_mock_form rows have ever been inserted anywhere
-- in this repository's history (migrations 147, 212, and the failed
-- 245) — Mathematics Mock 1's own 56-question manifest and Reading
-- Comprehension Mock 1's own 28-question manifest were both directly
-- grepped for every one of these 22 IDs: zero matches. Neither of these
-- two passages' questions has ever been set to practice_eligible at any
-- point in this repository's migration history (grepped, zero matches)
-- and neither has ever appeared in any question_manifest before now —
-- the strongest evidence available without a live database connection
-- that they carry zero prior learner exposure.
--
-- Smaller than the retired 3-passage/28-question/65-mark set by design,
-- not oversight: this is the entire fresh, unexposed inventory this
-- codebase currently has. If the Founder judges 2 passages
-- insufficient for full structural parity with the retired form, the
-- smallest next step is authoring one further passage of comparable
-- size — not something this migration attempts.
--
-- ============================================================
-- Q1: mock-writing-mindchange-01 (unchanged selection)
-- ============================================================
-- Compared against the three other independently_validated Q1-capable
-- candidates now confirmed live (mock-writing-cookopinion-01, mock-
-- writing-kindness-01, mock-writing-screentime-01): mindchange-01 keeps
-- its own genuinely distinct prompt shape (a personal-change narrative,
-- before/turning-point/after) among a candidate pool where cookopinion-
-- 01 and screentime-01 share an almost identical "do you think...?"
-- opinion-question shape and checklist — selecting mindchange-01 avoids
-- picking a prompt with a ready structural duplicate still sitting in
-- reserve. Genuinely reflective/personal (closest fit to Q1's own
-- evidenced "own experience" positioning), age-appropriate, no known
-- content defect (unlike wrt-003, not in this candidate pool at all).
-- The other three remain independently_validated, untouched, preserved
-- for a future assessment — not promoted merely to increase inventory.
--
-- Carries forward migration 246's own disclosed, genuine defect fix:
-- mock_get_question() reads the learner-facing question/marks from
-- prompt.question/prompt.marks, which mindchange-01 (authored only for
-- Practice's own separate prompt.prompt/prompt.title/prompt.checklist
-- contract) never set. Fixed here, additively, in the same statement
-- that promotes it, so it is never introduced into the Mock manifest in
-- its broken state at any point.
--
-- ============================================================
-- Q2: eng-q2-picturenarrative-oldshed (unchanged, preserved)
-- ============================================================
-- The already-completed, already independently educationally reviewed
-- (Q2 EDUCATIONAL GATE = PASS) task and its original SVG stimulus
-- (public/mock-assets/q2-picture-narrative/old-shed-v1.svg) — not
-- redesigned, not regenerated. Identical content to what migration 246
-- would have inserted, relocated here so the whole corrected form is
-- created in one migration with its full, final manifest from the start
-- (no separate later "append Q2" step needed).
--
-- ============================================================
-- SAFETY: static preflight guards before the insert, not just the
-- trigger
-- ============================================================
-- ali_block_mock_form_content_reuse() (migration 208) remains the real,
-- live, database-enforced defence and is untouched. The DO blocks below
-- are additive, named, fail-loud preflight checks (mirroring migrations
-- 210/217's own established "verify live state, refuse with a named
-- reason rather than a generic trigger error" pattern) so a Founder
-- running this after some unexpected intervening change gets a clear
-- diagnosis, not a bare constraint violation.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor, after migration 245's schema block
-- (confirmed already applied). Must be applied BEFORE migration 247
-- (247 has no dependency on this migration's own content, but applying
-- it after keeps the conceptual "schema, then content, then evidence-
-- adapter claim column" ordering intact). Migration 246 must NOT be
-- applied — superseded in full by this migration.

begin;

-- ── Preflight: the 22 target Reading questions must genuinely be
-- mock_eligible and active right now (mirrors migration 217's own live
-- re-verification discipline) ─────────────────────────────────────────
do $$
declare
  v_eligible_count int;
  v_target_ids constant text[] := array[
    'eng-inc002-sailandsteam-q01', 'eng-inc002-sailandsteam-q02', 'eng-inc002-sailandsteam-q03',
    'eng-inc002-sailandsteam-q04', 'eng-inc002-sailandsteam-q05b', 'eng-inc002-sailandsteam-q05c',
    'eng-inc002-sailandsteam-q05d', 'eng-inc002-sailandsteam-q05e', 'eng-inc002-sailandsteam-q06',
    'eng-inc002-sailandsteam-q07',
    'eng-inc002-roboticsfinal-q01', 'eng-inc002-roboticsfinal-q02b', 'eng-inc002-roboticsfinal-q02c',
    'eng-inc002-roboticsfinal-q02d', 'eng-inc002-roboticsfinal-q02e', 'eng-inc002-roboticsfinal-q03',
    'eng-inc002-roboticsfinal-q04', 'eng-inc002-roboticsfinal-q05', 'eng-inc002-roboticsfinal-q06',
    'eng-inc002-roboticsfinal-q07a', 'eng-inc002-roboticsfinal-q07b', 'eng-inc002-roboticsfinal-q08'
  ];
begin
  select count(*) into v_eligible_count
  from public.ali_question_bank
  where id = any(v_target_ids) and eligibility_status = 'mock_eligible' and active = true;

  if v_eligible_count <> 22 then
    raise exception 'Migration 248 refused: expected all 22 target Reading questions to be mock_eligible and active (found %). Re-verify production state before proceeding; this migration will not guess.', v_eligible_count;
  end if;
end $$;

-- ── Preflight: english-full-mock-v1 must not already exist ─────────────
do $$
begin
  if exists (select 1 from public.ali_mock_form where id = 'english-full-mock-v1') then
    raise exception 'Migration 248 refused: english-full-mock-v1 already exists. Re-verify production state before proceeding; this migration will not overwrite an existing form.';
  end if;
end $$;

-- ── Q1: promote mock-writing-mindchange-01, additively fixing the
-- question/marks keys in the same statement ─────────────────────────────
do $$
declare
  v_pending_count int;
  v_already_promoted_count int;
begin
  select count(*) into v_pending_count from public.ali_question_bank
  where id = 'mock-writing-mindchange-01' and eligibility_status = 'independently_validated' and active = true;
  select count(*) into v_already_promoted_count from public.ali_question_bank
  where id = 'mock-writing-mindchange-01' and eligibility_status = 'mock_eligible';

  if v_pending_count = 1 then
    update public.ali_question_bank
    set eligibility_status = 'mock_eligible',
        marking_mode = 'criterion_rubric',
        prompt = prompt || jsonb_build_object('question', prompt->'prompt', 'marks', 1)
    where id = 'mock-writing-mindchange-01' and eligibility_status = 'independently_validated';
    raise notice 'Migration 248: promoted mock-writing-mindchange-01 to mock_eligible and added question/marks keys.';
  elsif v_already_promoted_count = 1 then
    -- Idempotent re-run safety: still apply the additive question/marks
    -- fix if it hasn't landed yet, never destructive either way.
    update public.ali_question_bank
    set prompt = prompt || jsonb_build_object('question', prompt->'prompt', 'marks', 1)
    where id = 'mock-writing-mindchange-01' and prompt->'question' is null;
    raise notice 'Migration 248: mock-writing-mindchange-01 already mock_eligible -- re-verified question/marks keys present.';
  else
    raise exception 'Migration 248 refused (Q1): expected mock-writing-mindchange-01 to be independently_validated (found %) or already mock_eligible (found %). Re-verify production state before proceeding.', v_pending_count, v_already_promoted_count;
  end if;
end $$;

-- ── Q2: the real content row (identical to migration 246's own design,
-- relocated here) ────────────────────────────────────────────────────────
insert into public.ali_question_bank
  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,
   prompt, explanation, mastery_threshold, learning_unit_id,
   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,
   transfer_class, marking_mode)
values
('eng-q2-picturenarrative-oldshed', 'writing', 'QT-WC-01b', array['csse'], 'hard', 'open-response', 1500,
 $json${"id":"eng-q2-picturenarrative-oldshed","title":"The Old Shed","question":"Write a story based on the picture below.","prompt":"Write a story based on the picture below.","type":"narrative","difficulty":"year6-exam","timeMinutes":25,"marks":1,"checklist":["Write at least six sentences","Base your story genuinely on what the picture shows, not an unrelated idea","Include a clear turning point or moment of change, not just a description of the scene","Use precise, well-chosen vocabulary","Organise your writing into clear paragraphs","Check spelling and punctuation carefully"],"planningScaffold":["Who is in the picture, or who might arrive next?","What has just happened, just before this exact moment?","What might happen next -- and does your story need a clear turning point?","How does your story end -- does it need to resolve everything the picture suggests, or can it end on a single striking moment?"],"stimulus":{"type":"image","imageAssetUrl":"/mock-assets/q2-picture-narrative/old-shed-v1.svg","altText":"An old, weathered wooden shed stands at the edge of an overgrown garden in the late afternoon. Its door is slightly open, long grass and a climbing plant have grown up around its base, and a large tree stands beside it under a warm, softening sky."}}$json$,
 'CSSE Two-Paper Mock, pre-activation completion pass. QT-WC-01b (Picture-Stimulus Narrative Prompt), competency WC-01, family eng-q2-picturenarrative-oldshed. Evidence: CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md, HIGH/EMC-4, format position (always Question 2) and "write a story based on the picture below" phrasing consistent 3/3 real years read. An original, hand-authored SVG image asset, not AI-generated, not sourced from any CSSE paper. Independently educationally reviewed (Q2 educational gate: PASS) — age-appropriate, no embedded text, genuinely open to multiple narratives, no rendering defects. Prompt shape: picture-narrative, genuinely distinct from every QT-WC-01a (reflective/discursive) row in this bank.', 3, 'eng-q2-picturenarrative-oldshed',
 'eng-q2-picturenarrative-oldshed', 'angel_original', 'mock_eligible', 1, true,
 'Describing the picture itself (a static scene description) rather than writing a story that uses it as a starting point -- the marker cannot credit narrative writing that never actually narrates a sequence of events.',
 'FAR_TRANSFER', 'criterion_rubric')
on conflict (id) do nothing;

-- ── The corrected English full-paper form: 22 fresh Reading questions +
-- Q1 + Q2, active = false (a separate, later, explicit Founder action
-- is still required to publish this) ────────────────────────────────────
insert into public.ali_mock_form (id, specification_version, attempt_type, subject, question_manifest, reading_phase_minutes, default_duration_minutes, active)
select
  'english-full-mock-v1',
  1,
  'full_mock',
  'english',
  '[{"question_id":"eng-inc002-sailandsteam-q01","section":"reading_comprehension"},{"question_id":"eng-inc002-sailandsteam-q02","section":"reading_comprehension"},{"question_id":"eng-inc002-sailandsteam-q03","section":"reading_comprehension"},{"question_id":"eng-inc002-sailandsteam-q04","section":"reading_comprehension"},{"question_id":"eng-inc002-sailandsteam-q05b","section":"reading_comprehension"},{"question_id":"eng-inc002-sailandsteam-q05c","section":"reading_comprehension"},{"question_id":"eng-inc002-sailandsteam-q05d","section":"reading_comprehension"},{"question_id":"eng-inc002-sailandsteam-q05e","section":"reading_comprehension"},{"question_id":"eng-inc002-sailandsteam-q06","section":"reading_comprehension"},{"question_id":"eng-inc002-sailandsteam-q07","section":"reading_comprehension"},{"question_id":"eng-inc002-roboticsfinal-q01","section":"reading_comprehension"},{"question_id":"eng-inc002-roboticsfinal-q02b","section":"reading_comprehension"},{"question_id":"eng-inc002-roboticsfinal-q02c","section":"reading_comprehension"},{"question_id":"eng-inc002-roboticsfinal-q02d","section":"reading_comprehension"},{"question_id":"eng-inc002-roboticsfinal-q02e","section":"reading_comprehension"},{"question_id":"eng-inc002-roboticsfinal-q03","section":"reading_comprehension"},{"question_id":"eng-inc002-roboticsfinal-q04","section":"reading_comprehension"},{"question_id":"eng-inc002-roboticsfinal-q05","section":"reading_comprehension"},{"question_id":"eng-inc002-roboticsfinal-q06","section":"reading_comprehension"},{"question_id":"eng-inc002-roboticsfinal-q07a","section":"reading_comprehension"},{"question_id":"eng-inc002-roboticsfinal-q07b","section":"reading_comprehension"},{"question_id":"eng-inc002-roboticsfinal-q08","section":"reading_comprehension"},{"question_id":"mock-writing-mindchange-01","section":"continuous_writing_q1"},{"question_id":"eng-q2-picturenarrative-oldshed","section":"continuous_writing_q2"}]'::jsonb,
  10,
  70,
  false
where not exists (select 1 from public.ali_mock_form where id = 'english-full-mock-v1');

commit;

-- ============================================================
-- MIGRATION SAFETY REVIEW
-- ============================================================
-- - Two guarded, named preflight checks (RAISE EXCEPTION with a
--   specific reason) before any write, refusing rather than guessing if
--   production state has drifted from what this migration expects.
-- - One additive, guarded UPDATE (Q1 promotion + question/marks fix),
--   idempotent, touches exactly one pre-identified row.
-- - One guarded, idempotent content INSERT (Q2, on conflict do
--   nothing), inserts exactly one new row.
-- - One guarded INSERT (the corrected form), only proceeds if
--   english-full-mock-v1 does not already exist -- and, critically,
--   its manifest will be independently re-validated by migration 208's
--   own live, unmodified trigger at INSERT time regardless of this
--   migration's own static preflight checks above.
-- - Does not touch reading-comprehension-mock-1, Mathematics Mock 1, or
--   any of their historical attempts/results.
-- - Does not touch migration 208's trigger, migration 245's schema
--   block, or migrations 246/247's own files.
-- - english-full-mock-v1 is inserted active=false -- unaffected by this
--   migration, still requires a separate, later, explicit UPDATE to
--   become discoverable at all.
--
-- ============================================================
-- MIGRATION 208 PROTECTION CONFIRMATION
-- ============================================================
-- ali_block_mock_form_content_reuse() is not modified, not bypassed, not
-- weakened by this migration in any way. It remains the live,
-- authoritative check at INSERT time. This migration's own static
-- preflight (grepping every ali_mock_form insert across this
-- repository's history: migrations 147, 212, and the failed 245) is a
-- defence-in-depth cross-check, not a replacement for the trigger.
--
-- ============================================================
-- RLS REVIEW
-- ============================================================
-- No RLS policy created, altered, or referenced. Existing policies
-- (migrations 084/100 on ali_question_bank, migration 071 on
-- ali_mock_form) already cover every row this migration touches or
-- inserts, unchanged.
--
-- ============================================================
-- BACKWARD COMPATIBILITY
-- ============================================================
-- Strictly additive. Mathematics Mock 1 and Reading Comprehension
-- Mock 1 are untouched, confirmed by construction (this migration
-- never references either form's id). Migration 246 is superseded, not
-- applied, not edited -- its own file remains in the repository as a
-- documented, dead record of the design this migration corrects.
--
-- ============================================================
-- ROLLBACK
-- ============================================================
-- `delete from public.ali_mock_form where id = 'english-full-mock-v1';`
-- `delete from public.ali_question_bank where id = 'eng-q2-picturenarrative-oldshed';`
-- `update public.ali_question_bank set eligibility_status = 'independently_validated', marking_mode = null, prompt = prompt - 'question' - 'marks' where id = 'mock-writing-mindchange-01';`
-- Safe at any time -- no other object depends on any of these.
