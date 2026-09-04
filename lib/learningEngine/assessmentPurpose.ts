import type { MockAttemptType } from "@/lib/mockAttempt/types";

/**
 * Programme Increment 019, Part 2 — Assessment Purpose Model.
 *
 * Three genuinely different reasons Angel might ask a learner to answer a
 * bounded set of questions under assessment conditions, kept explicitly
 * distinct per this increment's own instruction — "Do NOT implement the
 * simplistic rule: 'Foundation learners cannot take Mocks.'":
 *
 *   - PLACEMENT: discovers where a learner should start. May be
 *     appropriate early, especially for late entrants. Must NOT consume
 *     ordinary SEALED Mock reserve unless explicitly designed for that —
 *     see `usesSealedMockReserve` below, which is always `false` for
 *     "placement" in this foundation (the placement diagnostic,
 *     lib/learningEngine/placementDiagnostic.ts, draws exclusively from
 *     the Practice-eligible pool via the existing, unmodified
 *     `fetchQuestionBank()`, never a Mock form).
 *   - PROGRESS_TRANSFER: whether teaching has transferred to fresh
 *     material — the existing FAR_TRANSFER-tagged content
 *     (`transfer_class`, migration 035) is exactly this purpose's real
 *     content source, unmodified by this increment.
 *   - FULL_MOCK: protected examination simulation, subject to freshness/
 *     cadence/exposure/readiness controls — the two real, existing,
 *     unrenamed Mock forms (`first-mock-mathematics-v1`,
 *     `reading-comprehension-mock-1`).
 *
 * This module does NOT rename any existing Mock form and does NOT
 * convert Mock 1 into a placement test — both explicitly forbidden by
 * this increment's own instruction. It only names, and lets other modules
 * (lib/learningEngine/placementDiagnostic.ts, lib/ali/mockAccessPolicy.ts)
 * reason about, which purpose a given activity actually serves.
 */

export type AssessmentPurpose = "placement" | "progress_transfer" | "full_mock";

export interface AssessmentPurposeProfile {
  purpose: AssessmentPurpose;
  /** Whether this purpose is permitted to draw from the SEALED Mock-eligible pool at all. Only "full_mock" ever is. */
  usesSealedMockReserve: boolean;
  /** Whether this purpose consumes ordinary RENEWABLE Practice content instead. */
  usesRenewablePracticePool: boolean;
  /** Whether this purpose specifically requires MEASUREMENT-classified (fresh-transfer) content — see lib/ali/inventoryClass.ts. */
  requiresMeasurementInventory: boolean;
  rationale: string;
}

export const ASSESSMENT_PURPOSE_PROFILES: Record<AssessmentPurpose, AssessmentPurposeProfile> = {
  placement: {
    purpose: "placement",
    usesSealedMockReserve: false,
    usesRenewablePracticePool: true,
    requiresMeasurementInventory: false,
    rationale: "Discovers where a learner should start. Draws only from the Practice-eligible pool -- never the sealed Mock reserve.",
  },
  progress_transfer: {
    purpose: "progress_transfer",
    usesSealedMockReserve: false,
    usesRenewablePracticePool: false,
    requiresMeasurementInventory: true,
    rationale: "Checks whether teaching has genuinely transferred to fresh material. Prior exposure would undermine the check, so ordinary renewable Practice content is not appropriate here -- MEASUREMENT-classified content is.",
  },
  full_mock: {
    purpose: "full_mock",
    usesSealedMockReserve: true,
    usesRenewablePracticePool: false,
    requiresMeasurementInventory: false,
    rationale: "Protected examination simulation. Draws exclusively from the SEALED Mock-eligible reserve, subject to the existing, unmodified freshness/cadence/exposure firewall (migrations 208/209).",
  },
};

export function getAssessmentPurposeProfile(purpose: AssessmentPurpose): AssessmentPurposeProfile {
  return ASSESSMENT_PURPOSE_PROFILES[purpose];
}

/**
 * Maps a REAL, existing `ali_mock_form.attempt_type` onto the purpose it
 * actually serves today, purely as a read-side classification — never a
 * rename, never a new attempt_type value. `full_mock`/`timed_section` are
 * the two live attempt types (Increment 018's own confirmed active forms:
 * `first-mock-mathematics-v1` is `full_mock`, `reading-comprehension-
 * mock-1` is `timed_section`); `diagnostic_mock` is a real, existing,
 * currently-UNUSED schema value (migration 070's own attempt_type check
 * constraint already permits it) that this module treats as the natural
 * home for a future FORMAL diagnostic Mock form, if one is ever built —
 * this increment does not build one; the placement diagnostic
 * (lib/learningEngine/placementDiagnostic.ts) deliberately does not use
 * this attempt_type or any ali_mock_form row at all, per its own
 * docstring.
 */
export function assessmentPurposeForMockAttemptType(attemptType: MockAttemptType): AssessmentPurpose {
  switch (attemptType) {
    case "diagnostic_mock":
      return "placement";
    case "timed_section":
    case "full_mock":
      return "full_mock";
  }
}
