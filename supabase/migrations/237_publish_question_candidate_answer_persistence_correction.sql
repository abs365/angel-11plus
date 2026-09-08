-- Angel Digital 11+ — Migration 237
-- Published Answer Integrity Incident — Publication Contract Correction.
-- Additive-only, no historical migration edited in place.
--
-- ============================================================
-- WHY THIS EXISTS
-- ============================================================
-- The Controlled Scale Activation's own learner smoke test (Section G,
-- ANGEL_CONTROLLED_SCALE_ACTIVATION_REPORT.md) found a genuine, real,
-- non-admin-learner marking failure: on published question
-- `qf-factory-candidate-mr02-substitution-ea154c86af6a9f81`, a
-- mathematically-correct answer ("40") was marked incorrect, with the UI
-- displaying "Correct answer: undefined".
--
-- Root cause, established with direct evidence (not inferred from the
-- UI), documented in full in
-- ANGEL_PUBLISHED_ANSWER_INTEGRITY_INCIDENT_REPORT.md:
--
--   The real Practice marking contract for Maths
--   (app/learning-intelligence/practice/[area]/page.tsx:536) is
--
--     checkMathsAnswer(answer, String(q.answer))
--
--   -- it reads `prompt.answer` as a required top-level property
--   (types/index.ts's own `MathsQuestion.answer: number | string`, a
--   non-optional field). `publish_question_candidate()` (migration 230,
--   carried unchanged through 233/234/235) never persists that field. It
--   builds `v_final_prompt := v_candidate.question_content` (merged with
--   passage fields for English only) and inserts that as `prompt` --
--   `v_candidate.claimed_answer`, the ONE column the marker actually
--   needs, is read nowhere in the function and is never merged in. This
--   is a plain, unconditional omission in the INSERT's value list; it is
--   not data-dependent and does not vary by family, difficulty, or
--   content shape -- confirmed by a read-only, all-405-rows audit: every
--   one of 313 published Maths rows is missing `prompt.answer` (100%),
--   while a 202/202-clean baseline of pre-existing Maths rows confirms
--   `prompt.answer` is this codebase's own long-established, universally-
--   followed convention -- this is a defect newly introduced by the
--   Question Factory's own publication path, not a pre-existing gap.
--
-- English is architecturally unaffected by this specific omission: its
-- marking contract (lib/learningEngine/englishAnswerValidation.ts) never
-- reads a top-level `prompt.answer` key -- it reads tier-specific
-- evidence fields (`acceptedAnswers`/`orderedAnswer`/`correctOptions`/
-- `quotationRequired`) that are already embedded directly inside
-- `question_content` by the English candidate mappers, and therefore
-- already survive publication unchanged today. (A second, entirely
-- independent defect was found and separately corrected in the English
-- Synonym Selection family's own manufacturing code --
-- lib/ali/questionFactory/englishSynonymFamily.ts -- see that file's own
-- change history; it is not a publication-contract issue and is out of
-- scope for this migration.)
--
-- ============================================================
-- FOUNDER DECISION
-- ============================================================
-- Repair the forward publication contract first (this migration), then
-- separately repair the already-published rows (a distinct, later
-- migration, reconciled against exact expected counts before it may
-- touch anything) -- never derive an answer from `worked_explanation`
-- text, never invent a missing answer, never weaken marking. Scoped
-- strictly to Maths, since that is the only subject whose real marking
-- contract reads this field; English's contract is untouched and must
-- not be touched by this fix.
--
-- ============================================================
-- FIX
-- ============================================================
-- Two changes inside `publish_question_candidate()`, both scoped to
-- `subject = 'maths'` only:
--
-- 1. Fail-closed guard, before the INSERT: a Maths candidate whose
--    `claimed_answer` is null or, after trimming, empty can no longer be
--    published at all -- it raises an exception naming the candidate,
--    exactly matching this migration's own "fail closed where genuine
--    answer evidence is absent" mandate. (In practice this can never
--    fire today, since `ali_question_candidate.claimed_answer` is
--    schema-enforced `not null`; this guard exists so a future schema or
--    caller change can never silently reintroduce this exact incident.)
--
-- 2. `v_final_prompt` now merges the candidate's own genuine
--    `claimed_answer` under the exact key the real marker reads,
--    `answer`, for Maths candidates only:
--
--      if v_candidate.subject = 'maths' then
--        v_final_prompt := v_final_prompt || jsonb_build_object('answer', v_candidate.claimed_answer);
--      end if;
--
--    This is a `||` merge, not a replacement -- every existing key
--    already present in `question_content` (`question`, `workingSteps`,
--    `params`, `diagram`, `diagrams`, `contextTag`,
--    `reasoningRoute`, `unknownPosition`, `representationType`, and, for
--    passage-linked English candidates, `passageText`/`passageTitle`) is
--    preserved unchanged; exactly one new key is added, and only for
--    Maths. English's `v_final_prompt` is completely unaffected -- its
--    contract never reads `answer` and no Maths-only branch runs for it.
--
-- No other line of `publish_question_candidate()` changes. Every other
-- behaviour (the admin gate, approved-only/already-published checks, the
-- candidate lookup, the `qf-` id convention, the passage lookup and
-- Mock-governance-track refusal, the `passageText`/`passageTitle` merge,
-- `learning_unit_id` behaviour, the mastery-threshold lookup, the
-- `family_id` pass-through, the migration-234 `subject` cast, the
-- migration-235 `provenance` remap, the `practice_eligible`/`active =
-- true` publication, the candidate publication-status update, the
-- `security definer`/`search_path`, and the existing grants/revokes) is
-- byte-for-byte identical to migration 235's own version.
--
-- ============================================================
-- MIGRATION SAFETY REVIEW
-- ============================================================
-- - Touches exactly one function, `publish_question_candidate(text)`,
--   via `create or replace function` -- signature unchanged, no drop
--   needed, no existing grant/revoke disturbed.
-- - No table is created, altered, or dropped. No existing row is
--   updated by this migration (the already-published rows' own repair is
--   a separate, later migration). No RLS policy is created, dropped, or
--   altered.
-- - The new fail-closed guard can only ever REJECT a publish attempt
--   that would previously have SUCCEEDED while silently omitting the
--   answer -- it cannot cause a previously-failing publish to newly
--   succeed, and (since `claimed_answer` is schema-enforced `not null`)
--   cannot fire for any candidate that could exist in the table today.
-- - The `answer` merge is additive (`||`) and gated to `subject =
--   'maths'` -- it cannot remove or alter any existing prompt field, and
--   cannot affect English or Writing publication in any way.
-- - Idempotent: `create or replace function` with an unchanged signature
--   is itself idempotent; re-running this migration against an
--   already-corrected function is a no-op.
--
-- ============================================================
-- RLS REVIEW
-- ============================================================
-- No RLS policy is created, dropped, or altered on any table. This
-- migration touches only a `security definer` function's body.
--
-- ============================================================
-- SECURITY REVIEW
-- ============================================================
-- `is_current_user_admin()` check, `security definer`, and
-- `set search_path = public, pg_temp` are byte-for-byte preserved. The
-- existing EXECUTE grant (`authenticated`) and revokes (`public`,
-- `anon`) are untouched -- this migration's signature is identical to
-- migrations 233/234/235's, so existing grants already apply; nothing is
-- re-granted, re-revoked, or broadened. The merged value
-- (`v_candidate.claimed_answer`) is read from the same already-
-- RLS-protected, admin-only-writable candidate row this function already
-- trusted for every other field it publishes (`question_content`,
-- `worked_explanation`, `family_id`, etc.) -- no new trust boundary is
-- crossed, no caller-supplied input beyond what this function already
-- accepted (`p_candidate_id`) influences the new code path.
--
-- ============================================================
-- BACKWARD COMPATIBILITY
-- ============================================================
-- `publish_question_candidate(text)`'s signature and every caller's own
-- call shape are completely unchanged. Any candidate that would
-- previously have published successfully still does, now with its
-- Maths answer correctly persisted where the real marker reads it (a
-- pure improvement, not a behaviour change any existing correct caller
-- depends on). English publication behaviour is provably identical
-- (the new branch is gated to `subject = 'maths'` and never executes for
-- English). The only NEW rejection case (an empty/null Maths
-- claimed_answer) cannot occur against any row the current schema can
-- produce.
--
-- ============================================================
-- ROLLBACK
-- ============================================================
-- `create or replace function public.publish_question_candidate(p_candidate_id text) ...`
-- using migration 235's own body (no fail-closed guard, no `answer`
-- merge) -- safe at any time; reverting restores the pre-237 behaviour
-- (Maths candidates publish without `prompt.answer`, reproducing this
-- exact incident for any candidate published after the revert). It does
-- not touch or need to undo any already-published row's own stored
-- `prompt` value (that value was written once, at publish time, by
-- whichever version of this function was live at that moment) -- the
-- separate, later data-repair migration is unaffected by this rollback
-- either way.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor > New query, after migrations 070-236
-- (per this arc's own standing record) have already been applied.

begin;

create or replace function public.publish_question_candidate(p_candidate_id text)
returns text
language plpgsql
security definer
set search_path = public, pg_temp
as $$
declare
  v_candidate public.ali_question_candidate;
  v_new_question_id text;
  v_passage public.ali_passage_bank;
  v_final_prompt jsonb;
  v_learning_unit_id text;
begin
  if not public.is_current_user_admin() then
    raise exception 'Only an admin may publish a Question Factory candidate';
  end if;

  select * into v_candidate from public.ali_question_candidate where candidate_id = p_candidate_id;
  if not found then
    raise exception 'Candidate % not found', p_candidate_id;
  end if;

  if v_candidate.review_status <> 'approved' then
    raise exception 'Candidate % cannot be published -- review_status is % (must be approved)', p_candidate_id, v_candidate.review_status;
  end if;

  if v_candidate.publication_status = 'published' then
    raise exception 'Candidate % has already been published as %', p_candidate_id, v_candidate.published_question_id;
  end if;

  -- Published Answer Integrity Incident fix -- fail closed rather than
  -- publish a Maths question the real marker can never grade correctly.
  -- Cannot fire against any row the current schema can produce
  -- (claimed_answer is `not null`); this guard exists so a future schema
  -- or caller change can never silently reintroduce this exact incident.
  if v_candidate.subject = 'maths'
     and (v_candidate.claimed_answer is null or trim(v_candidate.claimed_answer) = '') then
    raise exception 'Candidate % is a Maths candidate with no genuine claimed_answer -- refusing to publish a question the real Practice marker could never grade correctly', p_candidate_id;
  end if;

  v_new_question_id := 'qf-' || v_candidate.candidate_id;
  v_final_prompt := v_candidate.question_content;
  -- Non-passage-linked content (every Maths candidate) keeps the SAME
  -- convention this codebase already documents: learning_unit_id equals
  -- the question's own id.
  v_learning_unit_id := v_new_question_id;

  if v_candidate.subject = 'maths' then
    -- The real Practice marking contract
    -- (app/learning-intelligence/practice/[area]/page.tsx's
    -- `checkMathsAnswer(answer, String(q.answer))`, types/index.ts's
    -- `MathsQuestion.answer`) reads this exact top-level key. Maths
    -- blueprints never include it inside `question_content` themselves
    -- (the manufacturing convention keeps it as this function's own
    -- separate `claimed_answer` parameter) -- so it must be merged in
    -- here, from the one genuine source, or the published question can
    -- never be marked correctly. English's contract never reads this
    -- key; its tier-specific evidence already lives inside
    -- `question_content` via the English candidate mappers and needs no
    -- equivalent merge.
    v_final_prompt := v_final_prompt || jsonb_build_object('answer', v_candidate.claimed_answer);
  end if;

  if v_candidate.passage_id is not null then
    select * into v_passage from public.ali_passage_bank where id = v_candidate.passage_id;
    if not found then
      raise exception 'Candidate % references passage_id % which no longer exists in ali_passage_bank -- refusing to publish', p_candidate_id, v_candidate.passage_id;
    end if;

    if v_passage.eligibility_status not in ('provisional', 'practice_eligible', 'authentic_assessment_candidate', 'independently_validated') then
      raise exception 'Candidate % references passage % whose eligibility_status (%) is on the Mock-governance track -- refusing to publish Mock-reserved passage content into Practice', p_candidate_id, v_candidate.passage_id, v_passage.eligibility_status;
    end if;

    v_final_prompt := v_final_prompt || jsonb_build_object('passageText', v_passage.original_text, 'passageTitle', v_passage.title);
    v_learning_unit_id := v_candidate.passage_id;
  end if;

  insert into public.ali_question_bank (
    id, subject, skill, pathway, content_difficulty, question_type,
    prompt, explanation, mastery_threshold, family_id, provenance,
    eligibility_status, active, learning_unit_id
  ) values (
    v_new_question_id, v_candidate.subject::public.subject_type, v_candidate.skill, v_candidate.pathway, v_candidate.difficulty,
    coalesce(v_candidate.question_type, 'short-answer'),
    v_final_prompt, coalesce(v_candidate.worked_explanation, ''),
    (select default_threshold from public.ali_mastery_defaults where content_difficulty = v_candidate.difficulty),
    v_candidate.family_id,
    case
      when v_candidate.provenance = 'question_factory_wave1' then 'generated_original'
      else v_candidate.provenance
    end,
    'practice_eligible', true, v_learning_unit_id
  );

  update public.ali_question_candidate
  set publication_status = 'published', published_question_id = v_new_question_id
  where candidate_id = p_candidate_id;

  return v_new_question_id;
end;
$$;

-- Signature unchanged from migrations 230/233/234/235 -- the existing
-- grant to authenticated and the existing revokes from public/anon
-- already apply and are not restated here.

commit;
