-- Angel Digital 11+ — Migration 239
-- Synonym Multi-Select Marking Contract Incident — Publication Contract Correction.
-- Additive-only, no historical migration edited in place.
--
-- ============================================================
-- WHY THIS EXISTS
-- ============================================================
-- The post-activation learner acceptance smoke test found a genuine,
-- real, non-admin-learner marking failure: on published question
-- `qf-eng-syn-19`, a learner who selected the exact, single, genuinely
-- correct answer ("unwind") was marked "Not quite" — and the system's
-- own feedback message ("You selected 1 of the 1 correct boxes") proved
-- the selection was correctly recognised, yet the overall result was
-- still wrong.
--
-- Root cause, established with direct evidence (not inferred from the
-- UI):
--
--   The real Practice correctness check for every English tier
--   (app/learning-intelligence/practice/[area]/page.tsx:561) is
--
--     const isCorrect = result.earnedMarks === q.marks;
--
--   For TIER6_MULTI_SELECT (lib/learningEngine/englishAnswerValidation.ts,
--   scoreEnglishComprehensionAnswer's TIER6_MULTI_SELECT branch),
--   `earnedMarks` is set to `result.marks` — `checkMultiSelect()`'s own
--   raw correct-selection count (e.g. `1`), NOT `prompt.marks` echoed
--   back. `q.marks` is read from the published row's own `prompt.marks`
--   field. A direct, read-only, all-20-rows production query confirms
--   `prompt.marks` is absent from every one of the 20
--   `qf-eng-syn-01`..`qf-eng-syn-20` rows (100%) — so `1 === undefined`
--   is always false, regardless of what the learner selects. This is
--   unconditional and deterministic, not data-dependent or intermittent.
--
--   Contrast confirming this is a genuine gap, not a systemic marking
--   fault: the 6 pre-existing, already-working TIER6_MULTI_SELECT rows
--   (`w2-longwalk-02`, `w2-pianorecital-07`, `w2-twoletters-07`,
--   `w2-surprise-02`, `w2-morningpatrol-08`, `w2-stormwarning-02`) all
--   carry an explicit `prompt.marks`, and in every one of the 6,
--   `marks === requiredSelectionCount === correctOptions.length`
--   (all = 4). `checkMultiSelect()` and the `isCorrect` comparison are
--   both sound and already proven working in production whenever
--   `prompt.marks` is present and correctly derived — this activation's
--   `wave1-fam-synonym-battery` manufacturing/candidate-mapping pipeline
--   simply never populated it. Confirmed from the actual submitted RPC
--   payload (`scripts/output/controlled-scale-submission-args.json`,
--   the literal arguments this session's own earlier activation
--   submitted): `p_question_content` for every `eng-syn-*` candidate
--   never included a `marks` key at any point — this is not something
--   migrations 237/238 were ever scoped to touch (238's own English
--   repair statement corrected only `validationTier` and
--   `correctOptions`).
--
--   All 20 affected rows share one uniform, internally-consistent shape:
--   `requiredSelectionCount = 1`, `correctOptions.length = 1` — i.e. the
--   same `marks = requiredSelectionCount` relationship the 6 working
--   examples already establish, applied to this family's genuine
--   single-select shape.
--
-- Also confirmed, and explicitly OUT OF SCOPE for this migration: the
-- genuine distractor option list for every `eng-syn-*` candidate DOES
-- exist (`p_distractors.options`, present in the same submission
-- payload) but was never carried into any published field, in any form
-- — neither embedded in the question's own prose (this codebase's
-- established convention for the pre-existing working rows, e.g.
-- `w2-longwalk-02`'s question text itself lists "A. ... B. ... H. ...")
-- nor via a structured field. This does NOT block correct marking
-- today — this codebase has no rendering component that reads a
-- structured options field for ANY tier; every TIER6_MULTI_SELECT
-- question, working or broken, is answered via the same generic
-- free-text box every other tier uses, and `checkMultiSelect()` already
-- scores free-text selections correctly once `marks` is present (proven
-- live: submitting the literal correct word "unwind" produced "You
-- selected 1 of the 1 correct boxes" — the selection-matching logic was
-- never broken). It is a genuine content-completeness gap (a learner
-- currently cannot see the distractor options for this family, unlike
-- the pre-existing lettered-MCQ convention) — disclosed here for a
-- separate Founder decision, deliberately not addressed by this
-- migration, which is scoped strictly to the proven marking-contract
-- defect.
--
-- ============================================================
-- FOUNDER DECISION
-- ============================================================
-- Repair the forward publication contract first (this migration), then
-- separately repair the already-published rows (a distinct, later
-- migration, reconciled against an exact expected count before it may
-- touch anything) — never invent a marks value, never derive it from
-- anything but the row's own already-published, already-consistent
-- `requiredSelectionCount`. Scoped strictly to `TIER6_MULTI_SELECT`
-- English candidates, since that is the only tier whose real marking
-- contract (`isCorrect = earnedMarks === q.marks`) can never resolve to
-- `true` without a genuine `marks` value — every other English tier's
-- `earnedMarks` is either already `prompt.marks` itself when correct
-- (TIER1/TIER2/legacy, self-consistent regardless of whether `marks` is
-- defined) or is a self-assessed tier that never sets `automaticallyVerified`
-- (TIER3/TIER5), so this fix cannot affect them.
--
-- ============================================================
-- FIX
-- ============================================================
-- Two changes inside `publish_question_candidate()`, both scoped to
-- `subject = 'english'` and `validationTier = 'TIER6_MULTI_SELECT'` only:
--
-- 1. Fail-closed guards, before the INSERT: a TIER6_MULTI_SELECT
--    candidate whose `question_content` is missing `requiredSelectionCount`,
--    missing/empty `correctOptions`, or whose `correctOptions` length
--    does not equal `requiredSelectionCount`, can no longer be published
--    at all — each raises an exception naming the candidate. (In
--    practice the first two can never fire today for a candidate that
--    reached `submit_question_candidate()` via the real English mappers,
--    which always populate both together; this guard exists so a future
--    manufacturing/mapping change can never silently reintroduce a
--    structurally-broken TIER6 candidate.)
--
-- 2. `v_final_prompt` now merges the canonical `marks` value — always
--    exactly `requiredSelectionCount`, matching the established,
--    already-proven-working convention from the 6 pre-existing
--    TIER6_MULTI_SELECT rows — for every TIER6_MULTI_SELECT English
--    candidate, unconditionally (never trusted from whatever the
--    submitting candidate mapper happened to include, so a future
--    mapping regression cannot reintroduce this exact incident even if
--    it forgets to set `marks` itself):
--
--      if (v_final_prompt->>'validationTier') = 'TIER6_MULTI_SELECT' then
--        v_final_prompt := v_final_prompt || jsonb_build_object(
--          'marks', (v_final_prompt->>'requiredSelectionCount')::int
--        );
--      end if;
--
--    This is a `||` merge, not a replacement — every existing key already
--    present in `question_content` (`question`, `passageText`,
--    `validationTier`, `correctOptions`, `requiredSelectionCount`,
--    `evidenceLocation`, etc.) is preserved unchanged; exactly one new
--    key is added, and only for TIER6_MULTI_SELECT English candidates.
--    Every other tier's `v_final_prompt` is completely unaffected — no
--    branch here runs for TIER1/TIER2/TIER3/TIER4/TIER5/legacy content,
--    and Maths is untouched (its own `answer` merge, migration 237,
--    remains exactly as it was).
--
-- No other line of `publish_question_candidate()` changes. Every other
-- behaviour (the admin gate, approved-only/already-published checks, the
-- candidate lookup, the `qf-` id convention, the Maths `answer` merge
-- from migration 237, the passage lookup and Mock-governance-track
-- refusal, the `passageText`/`passageTitle` merge, `learning_unit_id`
-- behaviour, the mastery-threshold lookup, the `family_id` pass-through,
-- the `subject` cast, the `provenance` remap, the `practice_eligible`/
-- `active = true` publication, the candidate publication-status update,
-- the `security definer`/`search_path`, and the existing grants/revokes)
-- is byte-for-byte identical to migration 237's own version.
--
-- ============================================================
-- MIGRATION SAFETY REVIEW
-- ============================================================
-- - Touches exactly one function, `publish_question_candidate(text)`, via
--   `create or replace function` — signature unchanged, no drop needed,
--   no existing grant/revoke disturbed.
-- - No table is created, altered, or dropped. No existing row is updated
--   by this migration (the already-published rows' own repair is a
--   separate, later migration). No RLS policy is created, dropped, or
--   altered.
-- - The new fail-closed guards can only ever REJECT a publish attempt
--   that would previously have SUCCEEDED while silently omitting
--   marking-critical evidence — they cannot cause a previously-failing
--   publish to newly succeed.
-- - The `marks` merge is additive (`||`), gated to
--   `validationTier = 'TIER6_MULTI_SELECT'`, and derived only from a
--   value the guards immediately above already required to be present
--   and internally consistent — it cannot remove or alter any existing
--   prompt field, and cannot affect Maths, or any non-TIER6 English
--   tier, publication in any way.
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
-- `anon`) are untouched — this migration's signature is identical to
-- every prior version's, so existing grants already apply; nothing is
-- re-granted, re-revoked, or broadened. The merged value is derived
-- entirely from data already present in the same already-RLS-protected,
-- admin-only-writable candidate row this function already trusted for
-- every other field it publishes — no new trust boundary is crossed, no
-- caller-supplied input beyond what this function already accepted
-- (`p_candidate_id`) influences the new code path.
--
-- ============================================================
-- BACKWARD COMPATIBILITY
-- ============================================================
-- `publish_question_candidate(text)`'s signature and every caller's own
-- call shape are completely unchanged. Any TIER6_MULTI_SELECT candidate
-- that would previously have published successfully still does, now
-- with its `marks` correctly persisted where the real marker reads it
-- (a pure improvement, not a behaviour change any existing correct
-- caller depends on). Every non-TIER6 English tier's and Maths's
-- publication behaviour is provably identical (the new branch is gated
-- to `validationTier = 'TIER6_MULTI_SELECT'` and never executes
-- otherwise). The only NEW rejection cases (a TIER6 candidate missing
-- `requiredSelectionCount`/`correctOptions`, or an internally
-- inconsistent one) cannot occur against any candidate the real English
-- mappers produce today.
--
-- ============================================================
-- ROLLBACK
-- ============================================================
-- `create or replace function public.publish_question_candidate(p_candidate_id text) ...`
-- using migration 237's own body (no TIER6 guards, no `marks` merge) —
-- safe at any time; reverting restores the pre-239 behaviour (a TIER6
-- English candidate publishes without `prompt.marks`, reproducing this
-- exact incident for any candidate published after the revert). It does
-- not touch or need to undo any already-published row's own stored
-- `prompt` value — the separate, later data-repair migration is
-- unaffected by this rollback either way.
--
-- NOT APPLIED. Generated for Founder review and manual application via
-- Supabase Dashboard > SQL Editor, after migrations 070-238 (per this
-- arc's own standing record) have already been applied.

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
  v_required_count int;
  v_correct_len int;
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

  -- Published Answer Integrity Incident fix (migration 237) -- fail
  -- closed rather than publish a Maths question the real marker can
  -- never grade correctly.
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

  -- Synonym Marking Contract Repair (migration 239) -- the real
  -- Practice correctness check (app/learning-intelligence/practice/
  -- [area]/page.tsx's `isCorrect = result.earnedMarks === q.marks`)
  -- compares TIER6_MULTI_SELECT's real selection-count-based
  -- `earnedMarks` against this published `marks` field. Fail closed if
  -- the structural evidence a canonical `marks` value would be derived
  -- from is itself absent or inconsistent, then merge the one genuine,
  -- already-proven-correct value (== requiredSelectionCount, confirmed
  -- against every existing working TIER6_MULTI_SELECT row in this
  -- codebase) -- never trusted from whatever the submitting candidate
  -- mapper happened to include, so a future mapping regression cannot
  -- reintroduce this incident.
  if (v_final_prompt->>'validationTier') = 'TIER6_MULTI_SELECT' then
    if v_final_prompt->'requiredSelectionCount' is null then
      raise exception 'Candidate % is TIER6_MULTI_SELECT with no requiredSelectionCount -- refusing to publish a question the real Practice marker could never grade correctly', p_candidate_id;
    end if;
    v_required_count := (v_final_prompt->>'requiredSelectionCount')::int;

    if jsonb_typeof(v_final_prompt->'correctOptions') is distinct from 'array'
       or jsonb_array_length(v_final_prompt->'correctOptions') = 0 then
      raise exception 'Candidate % is TIER6_MULTI_SELECT with no genuine correctOptions -- refusing to publish', p_candidate_id;
    end if;
    v_correct_len := jsonb_array_length(v_final_prompt->'correctOptions');

    if v_correct_len <> v_required_count then
      raise exception 'Candidate % is TIER6_MULTI_SELECT with correctOptions length (%) not matching requiredSelectionCount (%) -- refusing to publish an internally inconsistent marking contract', p_candidate_id, v_correct_len, v_required_count;
    end if;

    v_final_prompt := v_final_prompt || jsonb_build_object('marks', v_required_count);
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

-- Signature unchanged from migrations 230/233/234/235/237 -- the
-- existing grant to authenticated and the existing revokes from
-- public/anon already apply and are not restated here.

commit;
