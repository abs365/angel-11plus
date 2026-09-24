/**
 * Increment 3 Closure Correction, Section 1 -- translates the raw RPC/
 * database error strings the Mock-start flow (app/learning-intelligence/
 * mock-exam/page.tsx and its two-paper sitting counterpart) can surface
 * into learner-facing copy. Mirrors lib/learnerPin.ts's own
 * friendlyLearnerPinError() exactly -- same pattern, a different set of
 * codes, because these come from a different part of the RPC surface
 * (current_learner_id()'s own internal exceptions, migration 260/263,
 * rather than the PIN-entry RPCs themselves).
 *
 * `angel_learner_pin_required` is the one production-reproduced defect this
 * correction addresses: a learner who has already verified their PIN this
 * tab session should never see this internal identifier, and the flow
 * offers a genuine recovery (re-enter the PIN, then retry) rather than a
 * dead end -- isPinRecoverable() is what the caller uses to decide whether
 * to show that recovery action instead of the plain "try again" retry.
 */

const PIN_REQUIRED_CODE = "angel_learner_pin_required";
/**
 * Increment 3 Closure Blocker (Mathematics Mock 1 starting an English
 * assessment) — the client-side half of the invariant now enforced in
 * app/learning-intelligence/mock-exam/page.tsx: never create or resume an
 * attempt against a form whose own returned subject does not match the
 * subject actually requested. See migration 264's own header for the full
 * root-cause investigation.
 */
export const MOCK_SUBJECT_MISMATCH_CODE = "angel_mock_subject_mismatch";

export function isPinRecoverableMockStartError(message: string): boolean {
  return new RegExp(PIN_REQUIRED_CODE).test(message);
}

export function friendlyMockStartError(message: string): string {
  if (new RegExp(PIN_REQUIRED_CODE).test(message)) {
    return "Your learner session needs to be verified again before starting this Mock.";
  }
  if (message === MOCK_SUBJECT_MISMATCH_CODE) {
    return "Angel couldn't confirm this is the right assessment to start. Please go back and try again, or contact us if this keeps happening.";
  }
  if (/angel_learner_not_owned/.test(message)) return "This isn't one of your children's profiles.";
  if (/angel_learner_required/.test(message)) return "Please choose who's practising first.";
  if (/angel_not_authenticated/.test(message)) return "Please sign in again.";
  if (/^(Not connected\.|Could not establish a learner profile\.|Could not (load|create|start) .*|No attempt state returned)$/.test(message)) {
    // Already plain, non-internal copy this same flow sets directly
    // (never routed through an RPC) -- shown as-is.
    return message;
  }
  return "Sorry, something went wrong starting this Mock. Please try again.";
}
