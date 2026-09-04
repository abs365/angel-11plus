/**
 * Programme Increment 019, Part 13 — Content Production Pipeline
 * Foundation.
 *
 * Backend capability, not a screen, per this increment's own explicit
 * "prefer backend capability over premature screens" instruction: domain
 * types plus one pure inference function mapping a content row's real,
 * already-existing governance fields (`eligibility_status`, `active`,
 * `review_state`/`review_type` — migrations 030/043/047/059) onto the
 * eleven pipeline stages this increment approved as the FOUNDATION scope
 * (Specification through Revalidation/Retirement; Increment 017's own
 * 17-stage audit found seven of those seventeen stages entirely MISSING
 * in the codebase today — Variation Rules, Candidate Generation,
 * Predictability Check, Originality/Copyright Check, and Performance
 * Calibration among them — this module does not pretend they exist).
 *
 * `inferPipelineStage()` is read-side only: it classifies where an
 * EXISTING row currently sits, using real data, never advances a row
 * through the pipeline itself (no write, no mutation) — that remains
 * exactly the existing, unmodified Founder-application-of-migrations
 * process this whole programme has used since Increment 016.
 */

export type ContentPipelineStage =
  | "specification"
  | "family"
  | "variation_design"
  | "candidate"
  | "deterministic_validation"
  | "similarity_predictability_check"
  | "educational_review"
  | "inventory_classification"
  | "release"
  | "performance_evidence"
  | "revalidation_retirement";

/**
 * Increment 017's own 17-stage audit (§16), condensed to what applies at
 * the level a single content row's real governance fields can actually
 * distinguish. EXISTS/PARTIAL/MISSING per that same audit — repeated here
 * only for the stages this module's inference function can meaningfully
 * report against; MISSING stages are recorded so a caller never assumes
 * `inferPipelineStage()` can place a row at one of them (it never
 * returns "variation_design" for that exact reason -- see below).
 */
export const PIPELINE_STAGE_CAPABILITY: Record<ContentPipelineStage, "exists" | "partial" | "missing"> = {
  specification: "partial",
  family: "exists",
  variation_design: "missing",
  candidate: "partial",
  deterministic_validation: "partial",
  similarity_predictability_check: "partial",
  educational_review: "exists",
  inventory_classification: "exists",
  release: "exists",
  performance_evidence: "missing",
  revalidation_retirement: "partial",
};

export interface ContentPipelineRowInput {
  eligibilityStatus: string;
  active: boolean;
  /** Real `ali_family_review`/`ali_english_teaching_review`-style review_state, when the caller has it (governance tables only, not every content row carries one directly). */
  reviewState?: string | null;
}

/**
 * Infers the most defensible current stage from real fields only. Never
 * returns `variation_design` or `performance_evidence` — this codebase
 * has no real signal for either (no variation-design metadata exists per
 * Part 7's own registry; `usage_count`/`avg_success_rate` exist as
 * columns but Increment 017 confirmed nothing reads them back into any
 * decision, so a caller cannot yet infer a row has genuinely REACHED
 * performance-evidence stage from their mere presence).
 */
export function inferPipelineStage(input: ContentPipelineRowInput): ContentPipelineStage {
  if (!input.active) return "revalidation_retirement";

  switch (input.eligibilityStatus) {
    case "provisional":
      return input.reviewState ? "candidate" : "specification";
    case "authentic_assessment_candidate":
      return "educational_review";
    case "independently_validated":
      return "similarity_predictability_check";
    case "practice_eligible":
    case "mock_eligible":
      return "release";
    default:
      // An eligibility_status value this module does not recognise --
      // honestly unresolved rather than defaulted into a stage that may
      // not be true. Callers should treat this as "candidate" at most
      // (never later), matching this pipeline's own fail-closed
      // discipline elsewhere (migration 219's own comment on this exact
      // pattern).
      return "candidate";
  }
}

/** Real `inventory_classification` stage rows are further split by lib/ali/inventoryClass.ts's own OPEN/RENEWABLE/MEASUREMENT/SEALED model -- see that module, not duplicated here. */
