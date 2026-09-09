-- Angel Digital 11+ — Migration 242
-- Educational Increment 003, Wave 2 — marking-contract data repair (NOT
-- applied), bounded to the 40 already-published Wave 2 English questions.
--
-- ROOT CAUSE, found via real learner-facing verification (not admin-side
-- inspection): every one of the 40 candidates submitted via
-- submit_question_candidate() during this wave's candidate-store
-- submission step had a `question_content` shaped with
-- `acceptedAnswers` (an array, matching the TIER1/TIER2 English
-- validation contract's expected field), but never included the
-- `marks` or `validationTier` fields that contract also requires, and
-- never included the separate `modelAnswer` field the LEGACY_HEURISTIC
-- fallback path (lib/learningEngine/englishAnswerValidation.ts's
-- scoreEnglishComprehensionAnswer, used whenever prompt.validationTier is
-- absent) reads instead. The result, confirmed by a real Practice
-- session testing candidate ei003-w2-wc-meaning-01 with its own,
-- verbatim, already-approved accepted answer ("experienced, aged or
-- toughened by years outdoors"): scoreEnglishAnswer() receives
-- modelAnswer = undefined, so it returns
-- Math.max(1, Math.round(maxMarks / 2)) with maxMarks itself undefined
-- (prompt.marks was never set either) -- producing NaN, which can never
-- equal q.marks (also undefined) in the real Practice page's own
-- `isCorrect = result.earnedMarks === q.marks` check
-- (app/learning-intelligence/practice/[area]/page.tsx). The learner was
-- shown "Not quite" despite typing the exact stored answer. This affects
-- ALL 40 published Wave 2 questions identically -- confirmed live: 0/40
-- currently have a `modelAnswer`, `marks`, or `validationTier` key in
-- their stored prompt.
--
-- FIX, deliberately the smallest one available: add exactly two fields,
-- `modelAnswer` and `marks`, to each of the 40 published rows' existing
-- `prompt` jsonb via a non-destructive `||` merge (same convention
-- publish_question_candidate() itself already uses to add
-- passageText/passageTitle at publish time -- never rebuilding or
-- dropping existing keys). This routes every one of the 40 through the
-- SAME LEGACY_HEURISTIC keyword-overlap scorer that a majority of this
-- codebase's existing English content already depends on successfully
-- (confirmed by inspecting a real, live, comparable row --
-- w3-rc06-lettertograndad-01 -- which also has no validationTier and is
-- marked via modelAnswer + marks=1 through this exact path). No
-- `validationTier` is added: TIER1/TIER2's own doc comment restricts
-- their intended use to "retrieval and vocabulary-in-context answers",
-- and several of these 40 candidates (comparative similarity-difference,
-- emotion-arc, conflicting-evidence, atmosphere-accumulated) are longer,
-- genuinely inferential explanations for which the LEGACY_HEURISTIC's
-- tolerant, length-and-keyword-ratio scoring (>= 18% keyword overlap,
-- for a sufficiently long answer) is a materially better real-world fit
-- than TIER1/2's strict exact/token-subsequence match against a short
-- accepted-answer set -- selecting a tier per candidate would be a
-- second, separate design decision this bounded repair does not make.
--
-- `modelAnswer` is set to each candidate's own `acceptedAnswers[0]` --
-- the exact same value already used as `p_claimed_answer` at submission
-- time (never fabricated, never a new answer). `marks` is set to 1 for
-- all 40, matching this wave's own single-response question design (no
-- multi-part/multi-mark candidate exists among the 40) and the
-- comparable existing production row cited above.
--
-- Traced and confirmed: `Math.round(1 / 2)` in JavaScript rounds to 1,
-- so scoreEnglishAnswer's own `Math.max(1, Math.round(maxMarks / 2))`
-- fallback (taken whenever keyword ratio > 0 but the length gate isn't
-- met -- the realistic case for short single-word/short-phrase answers
-- such as this family's emotion-from-action "nervous"-style responses)
-- already evaluates to exactly 1 for a 1-mark question, so short correct
-- answers are not disadvantaged by the length gate once `marks = 1` is
-- set; a genuinely irrelevant answer (0 keyword overlap) still correctly
-- scores 0. Manually traced against ei003-w2-wc-meaning-01's own real
-- modelAnswer/userAnswer pair before writing this migration.
--
-- Scope, explicitly bounded: this migration touches ONLY the `prompt`
-- column, ONLY for the 40 named `qf-ei003-w2-...` ids, ONLY adding
-- `modelAnswer` and `marks`. It does not touch `ali_question_candidate`,
-- `ali_passage_bank`, any RPC, any RLS policy, or any other
-- `ali_question_bank` row (existing or future).
--
-- Fail-closed preconditions: for each of the 40 ids, if `prompt` already
-- contains a `modelAnswer` or `marks` key, this migration raises an
-- exception and rolls back entirely rather than silently overwriting a
-- value it did not originate (relevant only if a partial repair was
-- already attempted by some other means -- confirmed live, immediately
-- before writing this migration, that 0/40 currently have either key).
--
-- Postconditions: re-asserts, per id, that `prompt->>'modelAnswer'`
-- exactly equals the intended value and `(prompt->>'marks')::int = 1`.
--
-- NOT APPLIED. A direct, non-RPC UPDATE against `ali_question_bank` WAS
-- confirmed technically possible for the authenticated admin session
-- during this task's investigation (unlike `ali_passage_bank`, which
-- structurally blocks all writes via RLS) -- a single genuinely
-- no-op UPDATE (re-setting an existing column to its own current value)
-- was used ONLY to confirm this, immediately verified to have changed
-- nothing. This migration is deliberately NOT applied directly despite
-- that technical possibility, to preserve the same Founder-reviewed,
-- governed-migration discipline this whole arc has followed for every
-- other production data change. Generated for Founder review and manual
-- application via Supabase Dashboard > SQL Editor > New query.

begin;

do $$
begin
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-seq-explicit-01'
      and (prompt ? 'modelAnswer' or prompt ? 'marks')
  ) then
    raise exception 'Migration 242 precondition failed: qf-ei003-w2-seq-explicit-01 already has a modelAnswer or marks field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-seq-explicit-02'
      and (prompt ? 'modelAnswer' or prompt ? 'marks')
  ) then
    raise exception 'Migration 242 precondition failed: qf-ei003-w2-seq-explicit-02 already has a modelAnswer or marks field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-seq-dispersed-01'
      and (prompt ? 'modelAnswer' or prompt ? 'marks')
  ) then
    raise exception 'Migration 242 precondition failed: qf-ei003-w2-seq-dispersed-01 already has a modelAnswer or marks field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-seq-dispersed-02'
      and (prompt ? 'modelAnswer' or prompt ? 'marks')
  ) then
    raise exception 'Migration 242 precondition failed: qf-ei003-w2-seq-dispersed-02 already has a modelAnswer or marks field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-seq-causal-01'
      and (prompt ? 'modelAnswer' or prompt ? 'marks')
  ) then
    raise exception 'Migration 242 precondition failed: qf-ei003-w2-seq-causal-01 already has a modelAnswer or marks field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-seq-causal-02'
      and (prompt ? 'modelAnswer' or prompt ? 'marks')
  ) then
    raise exception 'Migration 242 precondition failed: qf-ei003-w2-seq-causal-02 already has a modelAnswer or marks field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-seq-narrative-order-01'
      and (prompt ? 'modelAnswer' or prompt ? 'marks')
  ) then
    raise exception 'Migration 242 precondition failed: qf-ei003-w2-seq-narrative-order-01 already has a modelAnswer or marks field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-seq-narrative-order-02'
      and (prompt ? 'modelAnswer' or prompt ? 'marks')
  ) then
    raise exception 'Migration 242 precondition failed: qf-ei003-w2-seq-narrative-order-02 already has a modelAnswer or marks field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-comp-reactions-01'
      and (prompt ? 'modelAnswer' or prompt ? 'marks')
  ) then
    raise exception 'Migration 242 precondition failed: qf-ei003-w2-comp-reactions-01 already has a modelAnswer or marks field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-comp-reactions-02'
      and (prompt ? 'modelAnswer' or prompt ? 'marks')
  ) then
    raise exception 'Migration 242 precondition failed: qf-ei003-w2-comp-reactions-02 already has a modelAnswer or marks field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-comp-time-01'
      and (prompt ? 'modelAnswer' or prompt ? 'marks')
  ) then
    raise exception 'Migration 242 precondition failed: qf-ei003-w2-comp-time-01 already has a modelAnswer or marks field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-comp-time-02'
      and (prompt ? 'modelAnswer' or prompt ? 'marks')
  ) then
    raise exception 'Migration 242 precondition failed: qf-ei003-w2-comp-time-02 already has a modelAnswer or marks field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-comp-settings-01'
      and (prompt ? 'modelAnswer' or prompt ? 'marks')
  ) then
    raise exception 'Migration 242 precondition failed: qf-ei003-w2-comp-settings-01 already has a modelAnswer or marks field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-comp-settings-02'
      and (prompt ? 'modelAnswer' or prompt ? 'marks')
  ) then
    raise exception 'Migration 242 precondition failed: qf-ei003-w2-comp-settings-02 already has a modelAnswer or marks field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-comp-simdiff-01'
      and (prompt ? 'modelAnswer' or prompt ? 'marks')
  ) then
    raise exception 'Migration 242 precondition failed: qf-ei003-w2-comp-simdiff-01 already has a modelAnswer or marks field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-comp-simdiff-02'
      and (prompt ? 'modelAnswer' or prompt ? 'marks')
  ) then
    raise exception 'Migration 242 precondition failed: qf-ei003-w2-comp-simdiff-02 already has a modelAnswer or marks field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-emotion-action-01'
      and (prompt ? 'modelAnswer' or prompt ? 'marks')
  ) then
    raise exception 'Migration 242 precondition failed: qf-ei003-w2-emotion-action-01 already has a modelAnswer or marks field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-emotion-action-02'
      and (prompt ? 'modelAnswer' or prompt ? 'marks')
  ) then
    raise exception 'Migration 242 precondition failed: qf-ei003-w2-emotion-action-02 already has a modelAnswer or marks field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-emotion-dialogue-01'
      and (prompt ? 'modelAnswer' or prompt ? 'marks')
  ) then
    raise exception 'Migration 242 precondition failed: qf-ei003-w2-emotion-dialogue-01 already has a modelAnswer or marks field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-emotion-dialogue-02'
      and (prompt ? 'modelAnswer' or prompt ? 'marks')
  ) then
    raise exception 'Migration 242 precondition failed: qf-ei003-w2-emotion-dialogue-02 already has a modelAnswer or marks field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-emotion-arc-01'
      and (prompt ? 'modelAnswer' or prompt ? 'marks')
  ) then
    raise exception 'Migration 242 precondition failed: qf-ei003-w2-emotion-arc-01 already has a modelAnswer or marks field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-emotion-arc-02'
      and (prompt ? 'modelAnswer' or prompt ? 'marks')
  ) then
    raise exception 'Migration 242 precondition failed: qf-ei003-w2-emotion-arc-02 already has a modelAnswer or marks field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-emotion-conflict-01'
      and (prompt ? 'modelAnswer' or prompt ? 'marks')
  ) then
    raise exception 'Migration 242 precondition failed: qf-ei003-w2-emotion-conflict-01 already has a modelAnswer or marks field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-emotion-conflict-02'
      and (prompt ? 'modelAnswer' or prompt ? 'marks')
  ) then
    raise exception 'Migration 242 precondition failed: qf-ei003-w2-emotion-conflict-02 already has a modelAnswer or marks field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-atm-single-01'
      and (prompt ? 'modelAnswer' or prompt ? 'marks')
  ) then
    raise exception 'Migration 242 precondition failed: qf-ei003-w2-atm-single-01 already has a modelAnswer or marks field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-atm-single-02'
      and (prompt ? 'modelAnswer' or prompt ? 'marks')
  ) then
    raise exception 'Migration 242 precondition failed: qf-ei003-w2-atm-single-02 already has a modelAnswer or marks field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-atm-accum-01'
      and (prompt ? 'modelAnswer' or prompt ? 'marks')
  ) then
    raise exception 'Migration 242 precondition failed: qf-ei003-w2-atm-accum-01 already has a modelAnswer or marks field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-atm-accum-02'
      and (prompt ? 'modelAnswer' or prompt ? 'marks')
  ) then
    raise exception 'Migration 242 precondition failed: qf-ei003-w2-atm-accum-02 already has a modelAnswer or marks field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-atm-change-01'
      and (prompt ? 'modelAnswer' or prompt ? 'marks')
  ) then
    raise exception 'Migration 242 precondition failed: qf-ei003-w2-atm-change-01 already has a modelAnswer or marks field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-atm-change-02'
      and (prompt ? 'modelAnswer' or prompt ? 'marks')
  ) then
    raise exception 'Migration 242 precondition failed: qf-ei003-w2-atm-change-02 already has a modelAnswer or marks field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-atm-contrast-01'
      and (prompt ? 'modelAnswer' or prompt ? 'marks')
  ) then
    raise exception 'Migration 242 precondition failed: qf-ei003-w2-atm-contrast-01 already has a modelAnswer or marks field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-atm-contrast-02'
      and (prompt ? 'modelAnswer' or prompt ? 'marks')
  ) then
    raise exception 'Migration 242 precondition failed: qf-ei003-w2-atm-contrast-02 already has a modelAnswer or marks field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-wc-meaning-01'
      and (prompt ? 'modelAnswer' or prompt ? 'marks')
  ) then
    raise exception 'Migration 242 precondition failed: qf-ei003-w2-wc-meaning-01 already has a modelAnswer or marks field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-wc-meaning-02'
      and (prompt ? 'modelAnswer' or prompt ? 'marks')
  ) then
    raise exception 'Migration 242 precondition failed: qf-ei003-w2-wc-meaning-02 already has a modelAnswer or marks field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-wc-subst-01'
      and (prompt ? 'modelAnswer' or prompt ? 'marks')
  ) then
    raise exception 'Migration 242 precondition failed: qf-ei003-w2-wc-subst-01 already has a modelAnswer or marks field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-wc-subst-02'
      and (prompt ? 'modelAnswer' or prompt ? 'marks')
  ) then
    raise exception 'Migration 242 precondition failed: qf-ei003-w2-wc-subst-02 already has a modelAnswer or marks field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-wc-conn-01'
      and (prompt ? 'modelAnswer' or prompt ? 'marks')
  ) then
    raise exception 'Migration 242 precondition failed: qf-ei003-w2-wc-conn-01 already has a modelAnswer or marks field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-wc-conn-02'
      and (prompt ? 'modelAnswer' or prompt ? 'marks')
  ) then
    raise exception 'Migration 242 precondition failed: qf-ei003-w2-wc-conn-02 already has a modelAnswer or marks field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-wc-toatmosphere-01'
      and (prompt ? 'modelAnswer' or prompt ? 'marks')
  ) then
    raise exception 'Migration 242 precondition failed: qf-ei003-w2-wc-toatmosphere-01 already has a modelAnswer or marks field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
  if exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-wc-toatmosphere-02'
      and (prompt ? 'modelAnswer' or prompt ? 'marks')
  ) then
    raise exception 'Migration 242 precondition failed: qf-ei003-w2-wc-toatmosphere-02 already has a modelAnswer or marks field in prompt -- refusing to proceed to avoid overwriting a value this migration did not originate. Investigate before re-running.';
  end if;
end$$;

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('modelAnswer', 'b, a, c', 'marks', 1)
where id = 'qf-ei003-w2-seq-explicit-01';

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('modelAnswer', 'pulling its red blood cells into its liver happens first', 'marks', 1)
where id = 'qf-ei003-w2-seq-explicit-02';

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('modelAnswer', 'the sixth house', 'marks', 1)
where id = 'qf-ei003-w2-seq-dispersed-01';

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('modelAnswer', 'c, a, b', 'marks', 1)
where id = 'qf-ei003-w2-seq-dispersed-02';

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('modelAnswer', 'nadia lost time/had to make up the lost half-second', 'marks', 1)
where id = 'qf-ei003-w2-seq-causal-01';

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('modelAnswer', 'she sank almost to her knee', 'marks', 1)
where id = 'qf-ei003-w2-seq-causal-02';

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('modelAnswer', 'looking back as an adult remembering childhood -- phrases like ''i still remember'' and ''i think about that clock now'' show this is being told from much later', 'marks', 1)
where id = 'qf-ei003-w2-seq-narrative-order-01';

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('modelAnswer', 'b, d, c, a', 'marks', 1)
where id = 'qf-ei003-w2-seq-narrative-order-02';

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('modelAnswer', 'nadia reflects and reaches out to talk to marcus, while marcus withdraws and avoids talking', 'marks', 1)
where id = 'qf-ei003-w2-comp-reactions-01';

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('modelAnswer', 'mrs aldridge treats it as an ordinary delivery (just leaves a note about the milk), while mr whitfield treats it as significant, waiting at the gate and reflecting on the thirty-one years', 'marks', 1)
where id = 'qf-ei003-w2-comp-reactions-02';

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('modelAnswer', 'at the start he is calm and businesslike, but at the final house he pauses and seems affected, sitting quietly before starting the engine', 'marks', 1)
where id = 'qf-ei003-w2-comp-time-01';

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('modelAnswer', 'at the start the narrator expected it to be quick and easy, but by august the narrator felt they had failed', 'marks', 1)
where id = 'qf-ei003-w2-comp-time-02';

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('modelAnswer', 'at the start it is misty and the path looks safe, but by midday the mist has cleared and the true difficulty of the ground is revealed', 'marks', 1)
where id = 'qf-ei003-w2-comp-settings-01';

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('modelAnswer', 'one runs fresh from an underground spring, the other is brackish enough to kill any plant that roots there', 'marks', 1)
where id = 'qf-ei003-w2-comp-settings-02';

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('modelAnswer', 'similarity: both take some responsibility for the mistake; difference: priya says it was fully her fault, while nadia says it wasn''t just priya''s fault', 'marks', 1)
where id = 'qf-ei003-w2-comp-simdiff-01';

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('modelAnswer', 'similarity: both keep working on the clock steadily every sunday morning all summer; difference: by august the narrator feels they have failed, while the grandmother shows no sign of sharing that discouragement', 'marks', 1)
where id = 'qf-ei003-w2-comp-simdiff-02';

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('modelAnswer', 'nervous', 'marks', 1)
where id = 'qf-ei003-w2-emotion-action-01';

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('modelAnswer', 'moved/emotional', 'marks', 1)
where id = 'qf-ei003-w2-emotion-action-02';

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('modelAnswer', 'he feels the ending marks the loss of something that spanned generations, a sense of sentimental attachment', 'marks', 1)
where id = 'qf-ei003-w2-emotion-dialogue-01';

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('modelAnswer', 'he doesn''t want to talk about it, suggesting he feels disappointed or upset', 'marks', 1)
where id = 'qf-ei003-w2-emotion-dialogue-02';

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('modelAnswer', 'starts confident it will be quick, becomes discouraged and feels it has failed by august, then feels sudden excitement when it finally starts', 'marks', 1)
where id = 'qf-ei003-w2-emotion-arc-01';

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('modelAnswer', 'starts wary because of the guide''s warning, becomes more alert and cautious after priti sinks into the mud, and ends relieved to reach solid ground just before the tide returns', 'marks', 1)
where id = 'qf-ei003-w2-emotion-arc-02';

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('modelAnswer', 'no -- her later careful, testing steps show she was actually more shaken/cautious than the laugh suggested', 'marks', 1)
where id = 'qf-ei003-w2-emotion-conflict-01';

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('modelAnswer', 'no -- the narrator says he was never sure she really felt that certain, showing her calm outward manner doesn''t necessarily match how she truly felt', 'marks', 1)
where id = 'qf-ei003-w2-emotion-conflict-02';

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('modelAnswer', 'a faded, quiet, gentle mood', 'marks', 1)
where id = 'qf-ei003-w2-atm-single-01';

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('modelAnswer', 'a dull, muted, quiet morning atmosphere', 'marks', 1)
where id = 'qf-ei003-w2-atm-single-02';

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('modelAnswer', 'a sense of long abandonment -- a space frozen in time, untouched for years', 'marks', 1)
where id = 'qf-ei003-w2-atm-accum-01';

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('modelAnswer', 'a patient, careful, unhurried atmosphere of shared, old-fashioned attention', 'marks', 1)
where id = 'qf-ei003-w2-atm-accum-02';

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('modelAnswer', 'it goes from misty, uncertain and hidden to fully open, revealed and clear', 'marks', 1)
where id = 'qf-ei003-w2-atm-change-01';

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('modelAnswer', 'it moves from routine and unremarkable to quiet and significant', 'marks', 1)
where id = 'qf-ei003-w2-atm-change-02';

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('modelAnswer', 'despite the real danger, onyema remains calm and confident, reading the ground without needing a map or compass', 'marks', 1)
where id = 'qf-ei003-w2-atm-contrast-01';

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('modelAnswer', 'the loud, public excitement of the race contrasts with her quiet, private unease at home later that evening', 'marks', 1)
where id = 'qf-ei003-w2-atm-contrast-02';

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('modelAnswer', 'experienced, aged or toughened by years outdoors', 'marks', 1)
where id = 'qf-ei003-w2-wc-meaning-01';

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('modelAnswer', 'that the mannequin''s human-like appearance is unsettling or unexpected', 'marks', 1)
where id = 'qf-ei003-w2-wc-meaning-02';

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('modelAnswer', '''pressed'' suggests firm, deliberate, close contact, more focused and intense than the plain word ''put''', 'marks', 1)
where id = 'qf-ei003-w2-wc-subst-01';

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('modelAnswer', '''waiting'' suggests he was there on purpose, anticipating something, unlike the neutral word ''standing''', 'marks', 1)
where id = 'qf-ei003-w2-wc-subst-02';

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('modelAnswer', 'it suggests the work was interrupted suddenly and never finished or resumed', 'marks', 1)
where id = 'qf-ei003-w2-wc-conn-01';

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('modelAnswer', 'it suggests the mud seems to be acting on purpose, almost like it has its own intention, emphasising how difficult it is', 'marks', 1)
where id = 'qf-ei003-w2-wc-conn-02';

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('modelAnswer', 'the repeated words of wear and decay build a consistent, cumulative atmosphere of age and neglect across the whole room, not just one object', 'marks', 1)
where id = 'qf-ei003-w2-wc-toatmosphere-01';

update public.ali_question_bank
set prompt = prompt || jsonb_build_object('modelAnswer', 'the repeated stillness/quietness in these word choices builds a reflective, subdued impression of him at the end, contrasting with his earlier brisk manner', 'marks', 1)
where id = 'qf-ei003-w2-wc-toatmosphere-02';

do $$
begin
  if (
    select count(*) from public.ali_question_bank
    where id in ('qf-ei003-w2-seq-explicit-01', 'qf-ei003-w2-seq-explicit-02', 'qf-ei003-w2-seq-dispersed-01', 'qf-ei003-w2-seq-dispersed-02', 'qf-ei003-w2-seq-causal-01', 'qf-ei003-w2-seq-causal-02', 'qf-ei003-w2-seq-narrative-order-01', 'qf-ei003-w2-seq-narrative-order-02', 'qf-ei003-w2-comp-reactions-01', 'qf-ei003-w2-comp-reactions-02', 'qf-ei003-w2-comp-time-01', 'qf-ei003-w2-comp-time-02', 'qf-ei003-w2-comp-settings-01', 'qf-ei003-w2-comp-settings-02', 'qf-ei003-w2-comp-simdiff-01', 'qf-ei003-w2-comp-simdiff-02', 'qf-ei003-w2-emotion-action-01', 'qf-ei003-w2-emotion-action-02', 'qf-ei003-w2-emotion-dialogue-01', 'qf-ei003-w2-emotion-dialogue-02', 'qf-ei003-w2-emotion-arc-01', 'qf-ei003-w2-emotion-arc-02', 'qf-ei003-w2-emotion-conflict-01', 'qf-ei003-w2-emotion-conflict-02', 'qf-ei003-w2-atm-single-01', 'qf-ei003-w2-atm-single-02', 'qf-ei003-w2-atm-accum-01', 'qf-ei003-w2-atm-accum-02', 'qf-ei003-w2-atm-change-01', 'qf-ei003-w2-atm-change-02', 'qf-ei003-w2-atm-contrast-01', 'qf-ei003-w2-atm-contrast-02', 'qf-ei003-w2-wc-meaning-01', 'qf-ei003-w2-wc-meaning-02', 'qf-ei003-w2-wc-subst-01', 'qf-ei003-w2-wc-subst-02', 'qf-ei003-w2-wc-conn-01', 'qf-ei003-w2-wc-conn-02', 'qf-ei003-w2-wc-toatmosphere-01', 'qf-ei003-w2-wc-toatmosphere-02')
      and prompt ? 'modelAnswer'
      and prompt ? 'marks'
  ) <> 40 then
    raise exception 'Migration 242 postcondition failed: expected all 40 Wave 2 published questions to have modelAnswer and marks set, found a different count.';
  end if;

  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-seq-explicit-01'
      and prompt->>'modelAnswer' = 'b, a, c'
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 242 postcondition failed: qf-ei003-w2-seq-explicit-01 does not have the expected modelAnswer/marks after update.';
  end if;
  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-seq-explicit-02'
      and prompt->>'modelAnswer' = 'pulling its red blood cells into its liver happens first'
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 242 postcondition failed: qf-ei003-w2-seq-explicit-02 does not have the expected modelAnswer/marks after update.';
  end if;
  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-seq-dispersed-01'
      and prompt->>'modelAnswer' = 'the sixth house'
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 242 postcondition failed: qf-ei003-w2-seq-dispersed-01 does not have the expected modelAnswer/marks after update.';
  end if;
  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-seq-dispersed-02'
      and prompt->>'modelAnswer' = 'c, a, b'
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 242 postcondition failed: qf-ei003-w2-seq-dispersed-02 does not have the expected modelAnswer/marks after update.';
  end if;
  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-seq-causal-01'
      and prompt->>'modelAnswer' = 'nadia lost time/had to make up the lost half-second'
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 242 postcondition failed: qf-ei003-w2-seq-causal-01 does not have the expected modelAnswer/marks after update.';
  end if;
  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-seq-causal-02'
      and prompt->>'modelAnswer' = 'she sank almost to her knee'
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 242 postcondition failed: qf-ei003-w2-seq-causal-02 does not have the expected modelAnswer/marks after update.';
  end if;
  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-seq-narrative-order-01'
      and prompt->>'modelAnswer' = 'looking back as an adult remembering childhood -- phrases like ''i still remember'' and ''i think about that clock now'' show this is being told from much later'
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 242 postcondition failed: qf-ei003-w2-seq-narrative-order-01 does not have the expected modelAnswer/marks after update.';
  end if;
  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-seq-narrative-order-02'
      and prompt->>'modelAnswer' = 'b, d, c, a'
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 242 postcondition failed: qf-ei003-w2-seq-narrative-order-02 does not have the expected modelAnswer/marks after update.';
  end if;
  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-comp-reactions-01'
      and prompt->>'modelAnswer' = 'nadia reflects and reaches out to talk to marcus, while marcus withdraws and avoids talking'
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 242 postcondition failed: qf-ei003-w2-comp-reactions-01 does not have the expected modelAnswer/marks after update.';
  end if;
  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-comp-reactions-02'
      and prompt->>'modelAnswer' = 'mrs aldridge treats it as an ordinary delivery (just leaves a note about the milk), while mr whitfield treats it as significant, waiting at the gate and reflecting on the thirty-one years'
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 242 postcondition failed: qf-ei003-w2-comp-reactions-02 does not have the expected modelAnswer/marks after update.';
  end if;
  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-comp-time-01'
      and prompt->>'modelAnswer' = 'at the start he is calm and businesslike, but at the final house he pauses and seems affected, sitting quietly before starting the engine'
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 242 postcondition failed: qf-ei003-w2-comp-time-01 does not have the expected modelAnswer/marks after update.';
  end if;
  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-comp-time-02'
      and prompt->>'modelAnswer' = 'at the start the narrator expected it to be quick and easy, but by august the narrator felt they had failed'
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 242 postcondition failed: qf-ei003-w2-comp-time-02 does not have the expected modelAnswer/marks after update.';
  end if;
  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-comp-settings-01'
      and prompt->>'modelAnswer' = 'at the start it is misty and the path looks safe, but by midday the mist has cleared and the true difficulty of the ground is revealed'
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 242 postcondition failed: qf-ei003-w2-comp-settings-01 does not have the expected modelAnswer/marks after update.';
  end if;
  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-comp-settings-02'
      and prompt->>'modelAnswer' = 'one runs fresh from an underground spring, the other is brackish enough to kill any plant that roots there'
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 242 postcondition failed: qf-ei003-w2-comp-settings-02 does not have the expected modelAnswer/marks after update.';
  end if;
  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-comp-simdiff-01'
      and prompt->>'modelAnswer' = 'similarity: both take some responsibility for the mistake; difference: priya says it was fully her fault, while nadia says it wasn''t just priya''s fault'
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 242 postcondition failed: qf-ei003-w2-comp-simdiff-01 does not have the expected modelAnswer/marks after update.';
  end if;
  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-comp-simdiff-02'
      and prompt->>'modelAnswer' = 'similarity: both keep working on the clock steadily every sunday morning all summer; difference: by august the narrator feels they have failed, while the grandmother shows no sign of sharing that discouragement'
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 242 postcondition failed: qf-ei003-w2-comp-simdiff-02 does not have the expected modelAnswer/marks after update.';
  end if;
  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-emotion-action-01'
      and prompt->>'modelAnswer' = 'nervous'
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 242 postcondition failed: qf-ei003-w2-emotion-action-01 does not have the expected modelAnswer/marks after update.';
  end if;
  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-emotion-action-02'
      and prompt->>'modelAnswer' = 'moved/emotional'
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 242 postcondition failed: qf-ei003-w2-emotion-action-02 does not have the expected modelAnswer/marks after update.';
  end if;
  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-emotion-dialogue-01'
      and prompt->>'modelAnswer' = 'he feels the ending marks the loss of something that spanned generations, a sense of sentimental attachment'
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 242 postcondition failed: qf-ei003-w2-emotion-dialogue-01 does not have the expected modelAnswer/marks after update.';
  end if;
  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-emotion-dialogue-02'
      and prompt->>'modelAnswer' = 'he doesn''t want to talk about it, suggesting he feels disappointed or upset'
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 242 postcondition failed: qf-ei003-w2-emotion-dialogue-02 does not have the expected modelAnswer/marks after update.';
  end if;
  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-emotion-arc-01'
      and prompt->>'modelAnswer' = 'starts confident it will be quick, becomes discouraged and feels it has failed by august, then feels sudden excitement when it finally starts'
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 242 postcondition failed: qf-ei003-w2-emotion-arc-01 does not have the expected modelAnswer/marks after update.';
  end if;
  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-emotion-arc-02'
      and prompt->>'modelAnswer' = 'starts wary because of the guide''s warning, becomes more alert and cautious after priti sinks into the mud, and ends relieved to reach solid ground just before the tide returns'
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 242 postcondition failed: qf-ei003-w2-emotion-arc-02 does not have the expected modelAnswer/marks after update.';
  end if;
  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-emotion-conflict-01'
      and prompt->>'modelAnswer' = 'no -- her later careful, testing steps show she was actually more shaken/cautious than the laugh suggested'
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 242 postcondition failed: qf-ei003-w2-emotion-conflict-01 does not have the expected modelAnswer/marks after update.';
  end if;
  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-emotion-conflict-02'
      and prompt->>'modelAnswer' = 'no -- the narrator says he was never sure she really felt that certain, showing her calm outward manner doesn''t necessarily match how she truly felt'
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 242 postcondition failed: qf-ei003-w2-emotion-conflict-02 does not have the expected modelAnswer/marks after update.';
  end if;
  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-atm-single-01'
      and prompt->>'modelAnswer' = 'a faded, quiet, gentle mood'
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 242 postcondition failed: qf-ei003-w2-atm-single-01 does not have the expected modelAnswer/marks after update.';
  end if;
  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-atm-single-02'
      and prompt->>'modelAnswer' = 'a dull, muted, quiet morning atmosphere'
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 242 postcondition failed: qf-ei003-w2-atm-single-02 does not have the expected modelAnswer/marks after update.';
  end if;
  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-atm-accum-01'
      and prompt->>'modelAnswer' = 'a sense of long abandonment -- a space frozen in time, untouched for years'
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 242 postcondition failed: qf-ei003-w2-atm-accum-01 does not have the expected modelAnswer/marks after update.';
  end if;
  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-atm-accum-02'
      and prompt->>'modelAnswer' = 'a patient, careful, unhurried atmosphere of shared, old-fashioned attention'
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 242 postcondition failed: qf-ei003-w2-atm-accum-02 does not have the expected modelAnswer/marks after update.';
  end if;
  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-atm-change-01'
      and prompt->>'modelAnswer' = 'it goes from misty, uncertain and hidden to fully open, revealed and clear'
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 242 postcondition failed: qf-ei003-w2-atm-change-01 does not have the expected modelAnswer/marks after update.';
  end if;
  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-atm-change-02'
      and prompt->>'modelAnswer' = 'it moves from routine and unremarkable to quiet and significant'
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 242 postcondition failed: qf-ei003-w2-atm-change-02 does not have the expected modelAnswer/marks after update.';
  end if;
  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-atm-contrast-01'
      and prompt->>'modelAnswer' = 'despite the real danger, onyema remains calm and confident, reading the ground without needing a map or compass'
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 242 postcondition failed: qf-ei003-w2-atm-contrast-01 does not have the expected modelAnswer/marks after update.';
  end if;
  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-atm-contrast-02'
      and prompt->>'modelAnswer' = 'the loud, public excitement of the race contrasts with her quiet, private unease at home later that evening'
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 242 postcondition failed: qf-ei003-w2-atm-contrast-02 does not have the expected modelAnswer/marks after update.';
  end if;
  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-wc-meaning-01'
      and prompt->>'modelAnswer' = 'experienced, aged or toughened by years outdoors'
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 242 postcondition failed: qf-ei003-w2-wc-meaning-01 does not have the expected modelAnswer/marks after update.';
  end if;
  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-wc-meaning-02'
      and prompt->>'modelAnswer' = 'that the mannequin''s human-like appearance is unsettling or unexpected'
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 242 postcondition failed: qf-ei003-w2-wc-meaning-02 does not have the expected modelAnswer/marks after update.';
  end if;
  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-wc-subst-01'
      and prompt->>'modelAnswer' = '''pressed'' suggests firm, deliberate, close contact, more focused and intense than the plain word ''put'''
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 242 postcondition failed: qf-ei003-w2-wc-subst-01 does not have the expected modelAnswer/marks after update.';
  end if;
  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-wc-subst-02'
      and prompt->>'modelAnswer' = '''waiting'' suggests he was there on purpose, anticipating something, unlike the neutral word ''standing'''
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 242 postcondition failed: qf-ei003-w2-wc-subst-02 does not have the expected modelAnswer/marks after update.';
  end if;
  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-wc-conn-01'
      and prompt->>'modelAnswer' = 'it suggests the work was interrupted suddenly and never finished or resumed'
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 242 postcondition failed: qf-ei003-w2-wc-conn-01 does not have the expected modelAnswer/marks after update.';
  end if;
  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-wc-conn-02'
      and prompt->>'modelAnswer' = 'it suggests the mud seems to be acting on purpose, almost like it has its own intention, emphasising how difficult it is'
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 242 postcondition failed: qf-ei003-w2-wc-conn-02 does not have the expected modelAnswer/marks after update.';
  end if;
  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-wc-toatmosphere-01'
      and prompt->>'modelAnswer' = 'the repeated words of wear and decay build a consistent, cumulative atmosphere of age and neglect across the whole room, not just one object'
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 242 postcondition failed: qf-ei003-w2-wc-toatmosphere-01 does not have the expected modelAnswer/marks after update.';
  end if;
  if not exists (
    select 1 from public.ali_question_bank
    where id = 'qf-ei003-w2-wc-toatmosphere-02'
      and prompt->>'modelAnswer' = 'the repeated stillness/quietness in these word choices builds a reflective, subdued impression of him at the end, contrasting with his earlier brisk manner'
      and (prompt->>'marks')::int = 1
  ) then
    raise exception 'Migration 242 postcondition failed: qf-ei003-w2-wc-toatmosphere-02 does not have the expected modelAnswer/marks after update.';
  end if;
end$$;

commit;
