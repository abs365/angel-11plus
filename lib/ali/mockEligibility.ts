import type { AliSubject } from "@/types/ali/questionBank";
import type { MockPathwayId } from "@/types/mock";

/**
 * Mock Programme Increment 003 — the "smallest safe gate" the directive
 * asked for (RELEASE_1_ASSESSMENT_ELIGIBILITY_MODEL.md's own pool-level
 * Mock-Eligible gate remains separately unbuilt — this is the per-item
 * criterion only, not the pool-balance check named "mechanism TBD" in
 * that document, which belongs to the future form-assembly increment,
 * not this one).
 *
 * This is NOT new logic. `lib/ali/questionBank.ts`'s own
 * `fetchMockEligibleQuestionBank()` already enforces exactly these four
 * conditions, at the database-query level, for the real (still zero-row)
 * Mock content path. That function is untouched by this module — it
 * remains the correct, efficient, server-filtered read for a single
 * subject+pathway. This module extracts the same rule into a pure,
 * independently unit-testable function for two reasons neither a
 * Supabase query nor `fetchMockEligibleQuestionBank()` itself can serve:
 * (1) future form-assembly tooling will need to evaluate eligibility over
 * an already-fetched, broader candidate pool (e.g. for cross-subject
 * coverage/balance analysis) without re-querying per row; (2) a pure
 * function can be tested directly, without a live or mocked Supabase
 * client, which the directive's own Part 5 explicitly prefers.
 *
 * `eligibility_status = 'mock_eligible'` is the only value this predicate
 * accepts. Every other status this project's 5-stage Eligibility Model
 * defines — `provisional`, `practice_eligible`,
 * `authentic_assessment_candidate`, `independently_validated` — is
 * correctly excluded, including content that is Practice-eligible or has
 * passed independent validation but has not yet cleared the separate
 * pool-level Mock-Eligible gate. There is no distinct "rejected" status
 * to check for: this codebase's own established discipline (confirmed by
 * direct reading of lib/adminReview.ts's module docstring this session —
 * "never touches ali_question_bank.eligibility_status") means a rejected
 * or not-yet-reviewed item simply never advances past whatever stage it
 * already held; it cannot appear here already carrying `mock_eligible`.
 * `eligibility_status` is only ever written by a human-authorised,
 * separately-applied activation migration (Decisions 80/119/123's own
 * precedent) — never by this function, never by any live application
 * code path.
 */

export const MOCK_ELIGIBLE_STATUS = "mock_eligible";

export interface MockEligibilityCandidate {
  eligibilityStatus: string | null | undefined;
  active: boolean | null | undefined;
  subject: AliSubject;
  pathway: MockPathwayId[];
}

/**
 * Pure per-item Mock-eligibility decision. Mirrors
 * `fetchMockEligibleQuestionBank()`'s own four conditions exactly:
 * subject match, pathway containment, `eligibility_status ===
 * 'mock_eligible'`, `active === true`.
 *
 * Deliberately does NOT resolve the separate, real naming mismatch this
 * increment's own reconciliation found between `ali_question_bank.subject`
 * ('maths' | 'english' | 'writing') and `ali_mock_form.subject`/
 * `ali_mock_attempt.subject` ('mathematics' | 'english', migration 085) —
 * that mapping (which question-bank subjects feed which Mock paper) is a
 * future form-assembly design question, not a per-item eligibility
 * question, and resolving it here would silently make a design decision
 * this increment was not authorised to make.
 */
export function isMockEligibleCandidate(
  candidate: MockEligibilityCandidate,
  targetSubject: AliSubject,
  targetPathway: MockPathwayId
): boolean {
  return (
    candidate.subject === targetSubject &&
    candidate.pathway.includes(targetPathway) &&
    candidate.active === true &&
    candidate.eligibilityStatus === MOCK_ELIGIBLE_STATUS
  );
}
