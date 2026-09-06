/**
 * Educational Supply & Progression Integration Gate — Content Pool
 * Separation (Section 12).
 *
 * Deliberately lives in `lib/ali/`, NOT `lib/ali/questionFactory/` --
 * that directory has its own strict, tested architectural boundary
 * (`tests/lib/ali/questionFactory/reviewGateEnforcement.test.ts`)
 * forbidding any reference to `eligibility_status`,
 * `practice_eligible`, or `mock_eligible` literally, anywhere, since
 * generation/validation code must stay completely decoupled from the
 * real bank/eligibility model. This module's entire purpose is to
 * reason about eligibility_status, so it belongs alongside
 * `lib/ali/questionBank.ts` and `lib/ali/mastery.ts` instead.
 *
 * The three pools the Founder named (PRACTICE, MOCK-RESERVED,
 * CALIBRATION) already exist as real, separately-enforced mechanisms --
 * this module does not create new schema or a new enforcement
 * mechanism. It names the existing separation explicitly, per the
 * Founder's own "determine how existing fields currently represent
 * these concepts before adding schema" instruction:
 *
 *   - CALIBRATION POOL: `ali_question_candidate` -- a table entirely
 *     separate from `ali_question_bank` (migration 230). A row here
 *     cannot be read by any Practice/Mock fetch path (`lib/ali/
 *     questionBank.ts`'s `fetchQuestionBank`/`fetchMockEligibleQuestionBank`
 *     both query `ali_question_bank` only) because it structurally does
 *     not live in that table until an admin-gated publish step inserts
 *     it -- proven by `tests/supabase/questionFactoryCandidateLifecycle.test.ts`.
 *   - PRACTICE POOL: `ali_question_bank` rows with
 *     `eligibility_status = 'practice_eligible'` -- the only status the
 *     RLS SELECT policy (migration 100) exposes to non-admin
 *     anon/authenticated readers.
 *   - MOCK-RESERVED POOL: `ali_question_bank` rows with
 *     `eligibility_status = 'mock_eligible'` (or the pre-promotion
 *     `authentic_assessment_candidate`/`independently_validated`
 *     states) -- readable by non-admins ONLY through the sealed,
 *     field-allow-listed `mock_get_question()` RPC (migration 070),
 *     never through a direct table read -- proven by
 *     `tests/lib/ali/mockContentFirewall.test.ts`.
 *
 * `derivePoolMembership` is a pure, additive naming/classification
 * helper over these already-real values -- it changes no database
 * behaviour and introduces no new column.
 */

export type ContentPool = "calibration" | "practice" | "mock_reserved" | "not_yet_eligible";

export type BankEligibilityStatus =
  | "provisional"
  | "practice_eligible"
  | "authentic_assessment_candidate"
  | "independently_validated"
  | "mock_eligible";

export type ContentSource = "ali_question_candidate" | "ali_question_bank";

export function derivePoolMembership(source: ContentSource, eligibilityStatus?: BankEligibilityStatus): ContentPool {
  if (source === "ali_question_candidate") return "calibration";

  switch (eligibilityStatus) {
    case "practice_eligible":
      return "practice";
    case "mock_eligible":
      return "mock_reserved";
    case "authentic_assessment_candidate":
    case "independently_validated":
      // Real intermediate mock-governance states (migration 085) -- not
      // yet promoted to mock_eligible, so not yet actually drawable into
      // a live mock attempt, but also never practice-visible (migration
      // 100's RLS policy only allows 'practice_eligible'). Classified as
      // mock_reserved (its destination pool), not practice, since a
      // learner can never encounter it via ordinary practice either way.
      return "mock_reserved";
    case "provisional":
    default:
      return "not_yet_eligible";
  }
}

/**
 * A learner-facing practice session must never be able to draw from
 * anything but the practice pool. This is the single boolean a future
 * selection function should check -- named explicitly so "can this
 * question appear in ordinary practice" is never re-derived ad hoc from
 * raw eligibility_status string comparisons scattered across call sites.
 */
export function isPracticeVisible(pool: ContentPool): boolean {
  return pool === "practice";
}

/** The mirror check for a live, sealed mock attempt (server-mediated only -- see mock_get_question(), migration 070). */
export function isMockAttemptEligible(pool: ContentPool): boolean {
  return pool === "mock_reserved";
}
