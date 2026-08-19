-- Angel Digital 11+ — Migration 077
-- Stage 2 Educational Integrity Correction — Historical Verification
-- Provenance Reconciliation. Depends on migration 076
-- (last_attempt_verified). Additive-in-effect only: no column, table,
-- policy, or trigger is created or dropped; the only mutation is
-- last_attempt_verified on a narrowly-scoped, deterministically-predicated
-- subset of pre-existing rows. Run this in: Supabase Dashboard > SQL
-- Editor > New query, AFTER migration 076.
--
-- ============================================================
-- Background and evidence basis
-- ============================================================
-- Migration 076 added last_attempt_verified as a new, nullable fact,
-- correctly leaving every pre-existing row null (provenance cannot be
-- reconstructed for most historical evidence, and the application layer's
-- own conservative default already treats null as verified=true). This
-- migration corrects exactly one identified, deterministically-classifiable
-- subset of that null population, proven by a Founder-run production
-- forensic query (not assumed): the 27 English `practice_experience` rows
-- with `last_attempt_support_tier = 'supported'`. These 27 splits cleanly
-- into two groups by the underlying question's own validationTier (stored
-- in ali_question_bank.prompt, a jsonb column — see
-- lib/learningEngine/englishAnswerValidation.ts for the six real tier
-- values and lib/ali/questionBank.ts for how prompt is read at runtime):
--
--   19 rows -- TIER2_ACCEPTED_SET / TIER4_ORDERED_LIST / TIER6_MULTI_SELECT
--   -- these tiers are ALWAYS automatically verified by
--   -- scoreEnglishComprehensionAnswer() (automaticallyVerified: true,
--   -- confirmed in tests/lib/learningEngine/englishAnswerValidation.test.ts).
--   -- `supported` on these rows means the learner had Guided Practice
--   -- toggled on for a question Angel still automatically marked --
--   -- genuine guided-but-verified evidence, never self-assessed. Correct
--   -- provenance: last_attempt_verified = true.
--
--    8 rows -- TIER3_QUOTATION_PLUS_EXPLANATION / TIER5_NAMED_COMPONENT_PLUS_EXPLANATION
--   -- these tiers are NEVER automatically verified (automaticallyVerified:
--   -- false, unconditionally) -- the ONLY way a `supported` outcome exists
--   -- for one of these rows is the learner's own self-assessment click
--   -- (app/learning-intelligence/practice/[area]/page.tsx's
--   -- submitSelfAssessment(), which always writes supportTier: "supported").
--   -- Correct provenance: last_attempt_verified = false.
--
-- No other historical row (431 of the 458 total null rows, spanning
-- Mathematics, Mock, founder_validation_assessment, legacy_english_practice,
-- and English `independent`-tier attempts) is touched by this migration --
-- none of those sources/tiers carry the self-assessment ambiguity this
-- migration exists to resolve (traced in full in the Stage 2 governance
-- log, Decision 107): Mathematics has no self-assessment pathway at all
-- (checkMathsAnswer is always exact-match automatic); Mock routes anything
-- it cannot auto-mark to admin-gated manual marking, never learner
-- self-report; founder_validation_assessment and legacy_english_practice
-- both score via the legacy heuristic (scoreEnglishAnswer), which has no
-- self-assessment step either; `independent`-tier English rows can never
-- have been written by submitSelfAssessment(), which always writes
-- `supported`.
--
-- ============================================================
-- Downstream consequence of this migration (Decision 107 finding)
-- ============================================================
-- computeEducationalState() and the confidence/rollup layers it feeds are
-- computed fresh from real evidence on every read, never cached or
-- persisted independently (lib/learningEngine/educationalIntelligenceService.ts's
-- own docstring: "computed fresh from real evidence every time... never
-- cached as an independent fact"). Correcting last_attempt_verified alone
-- is therefore sufficient -- the next Learning Report read for an
-- affected competency will recompute correctly with no separate
-- recomputation job, cache invalidation, or reconciliation step required.
-- ali_durable_mastery/ali_educational_audit could never have been
-- incorrectly populated by these 8 self-assessed rows in the first place:
-- both require distinctCorrectSessions >= masteryThreshold
-- (validateCompetencyMastery(), lib/ali/masteryValidation.ts), and
-- distinctCorrectSessions only ever increments for supportTier ===
-- "independent" (applyAttemptOutcome(), lib/ali/mastery.ts) -- a gate this
-- migration does not touch and that was never vulnerable to the
-- confidence-tier defect Decision 106 corrected. No repair to those two
-- tables is proposed or needed.
--
-- ============================================================
-- Safety guards
-- ============================================================
-- This migration refuses to run unless production still matches the exact
-- Founder-verified classification (19 auto-verified / 8 self-assessed), OR
-- is already in the post-application state (0 / 0 remaining null rows in
-- this predicate) -- in which case it is a safe no-op, not an error. Any
-- other observed count means production has drifted from the proven
-- classification since the forensic query was run, and this migration
-- stops rather than guess.

begin;

do $$
declare
  v_auto_verified_pending int;
  v_self_assessed_pending int;
begin
  select count(*) into v_auto_verified_pending
  from public.ali_student_question_history h
  join public.ali_question_bank q on q.id = h.question_id
  where q.subject = 'english'
    and h.source = 'practice_experience'
    and h.last_attempt_support_tier = 'supported'
    and h.last_attempt_verified is null
    and q.prompt->>'validationTier' in ('TIER2_ACCEPTED_SET', 'TIER4_ORDERED_LIST', 'TIER6_MULTI_SELECT');

  select count(*) into v_self_assessed_pending
  from public.ali_student_question_history h
  join public.ali_question_bank q on q.id = h.question_id
  where q.subject = 'english'
    and h.source = 'practice_experience'
    and h.last_attempt_support_tier = 'supported'
    and h.last_attempt_verified is null
    and q.prompt->>'validationTier' in ('TIER3_QUOTATION_PLUS_EXPLANATION', 'TIER5_NAMED_COMPONENT_PLUS_EXPLANATION');

  if v_auto_verified_pending = 19 and v_self_assessed_pending = 8 then
    -- Exactly the Founder-verified pre-application state. Apply.

    update public.ali_student_question_history h
    set last_attempt_verified = true
    from public.ali_question_bank q
    where q.id = h.question_id
      and q.subject = 'english'
      and h.source = 'practice_experience'
      and h.last_attempt_support_tier = 'supported'
      and h.last_attempt_verified is null
      and q.prompt->>'validationTier' in ('TIER2_ACCEPTED_SET', 'TIER4_ORDERED_LIST', 'TIER6_MULTI_SELECT');

    update public.ali_student_question_history h
    set last_attempt_verified = false
    from public.ali_question_bank q
    where q.id = h.question_id
      and q.subject = 'english'
      and h.source = 'practice_experience'
      and h.last_attempt_support_tier = 'supported'
      and h.last_attempt_verified is null
      and q.prompt->>'validationTier' in ('TIER3_QUOTATION_PLUS_EXPLANATION', 'TIER5_NAMED_COMPONENT_PLUS_EXPLANATION');

    raise notice 'Migration 077: reconciled 19 auto-verified rows to verified=true and 8 self-assessed rows to verified=false.';

  elsif v_auto_verified_pending = 0 and v_self_assessed_pending = 0 then
    -- Already applied (or nothing ever matched) -- safe no-op, not an error.
    raise notice 'Migration 077: no matching null rows remain in the classified predicate -- already applied or nothing to do. No changes made.';

  else
    -- Production no longer matches the Founder-verified classification
    -- (19 / 8) and is not in the clean post-application state (0 / 0).
    -- Refuse to guess -- something changed between the forensic query and
    -- this migration running (a new attempt was recorded, a different
    -- correction ran, etc.). No rows are touched.
    raise exception
      'Migration 077 refused: expected 19 auto-verified / 8 self-assessed pending rows (or 0/0 if already applied), found % / %. Re-run the forensic classification query before proceeding.',
      v_auto_verified_pending, v_self_assessed_pending;
  end if;
end $$;

commit;

-- No RLS change: ali_student_question_history already has RLS explicitly
-- disabled (migration 006); no column, table, policy, or trigger is
-- created, dropped, or altered by this migration.
