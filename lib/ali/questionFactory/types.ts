import type { ContentDifficulty } from "@/types/ali/questionBank";
import type { CompetencyId, QuestionTypeId } from "@/lib/learningEngine/types";

/**
 * Question Factory Wave 1, Phase 4/5 — Mathematics Candidate Generation.
 *
 * These types exist to make one thing structurally impossible: a
 * generated candidate can never be confused with, or accidentally
 * written as, a real `ali_question_bank` row. `MathsQuestionCandidate`
 * carries no `id` in the bank's id-space, no `eligibility_status`, no
 * `active` flag, and no `family_id`-creation capability -- `familyId`
 * below is always copied from an existing, real `FamilyGenerationSpec`,
 * which itself is always constructed from a real, live family this
 * session confirmed via a read-only production query (see
 * `familySpecs.ts`'s own module docstring). Generating instances must
 * never fabricate a new family -- enforced by `runBatch()` asserting
 * every candidate's `familyId` equals its spec's `familyId` before any
 * other processing occurs.
 */

export type PreparationStageSuitability = "FOUNDATION" | "DEVELOPMENT" | "EXAM_PREPARATION" | "FINAL_READINESS";

/**
 * Question Factory Wave 2 — Human Educational Calibration Gate.
 *
 * The calibration audit of the first 30 real candidates (`mr01-decimal-
 * computation`, `precision-frac`, `mr03-angle-sum`) found every one of
 * Wave 1's three specs varies parameters only -- identical reasoning
 * route, identical presentation context, identical unknown position, in
 * every single candidate within a family. These three fields exist to
 * make that fact STRUCTURALLY VISIBLE and MECHANICALLY CHECKABLE, not to
 * fix it -- fixing it (genuinely varying context/reasoning/unknown-
 * position) is deferred to a future, separately-approved generation
 * wave. Declaring today's real, undiversified values honestly (rather
 * than leaving these fields unpopulated) is itself the point: a spec
 * that returns the SAME reasoning route for every parameter set is not
 * lying, it is disclosing a true, currently-narrow design, exactly the
 * "unclassified, not fabricated" discipline `questionFamilyRegistry.ts`
 * already established for family metadata.
 */
export type ReasoningRoute =
  | "direct_computation"
  | "reverse_reasoning"
  | "comparison"
  | "error_identification"
  | "multi_step_application"
  | "interpretation";

export interface ParameterRange {
  min: number;
  max: number;
}

/**
 * One family's generation specification -- the Founder's own ten
 * required fields, each represented by a real field or function below
 * rather than a free-text placeholder wherever the field is naturally
 * executable (parameter ranges, constraints, difficulty, answer
 * derivation, worked-explanation derivation are all real functions this
 * module actually calls; the three fields that are inherently
 * descriptive rather than computable -- mathematical objective,
 * distractor/misconception applicability, similarity-control policy --
 * are disclosed strings, not invented code).
 *
 * `TParams` is a plain numeric-parameter record (e.g. `{ a: number; b:
 * number }`) -- deliberately not a discriminated union or class, so a
 * spec's own `constraints`/`sampleParams`/`renderQuestionText`/
 * `deriveCorrectAnswer` functions can be short, direct, and easy for a
 * human reviewer to read end-to-end against the real family it targets.
 */
export interface FamilyGenerationSpec<TParams extends Record<string, number>> {
  /** MUST be a real, live `family_id` (confirmed via production query, see familySpecs.ts). Generation never invents a new family. */
  familyId: string;
  competencyId: CompetencyId;
  questionTypeId: QuestionTypeId;
  /** Field 1: what mathematical understanding this family assesses. */
  mathematicalObjective: string;
  /** Field 2: valid range for every generation parameter. */
  parameterRanges: { [K in keyof TParams]: ParameterRange };
  /**
   * Field 3: constraints beyond simple per-parameter ranges (e.g. "b must
   * not divide a evenly"). Returns true when the combination is valid.
   * Declared as a method (not an arrow-typed property) deliberately --
   * TypeScript's strict-function-types check treats method parameters
   * bivariantly, which is what allows a concrete
   * `FamilyGenerationSpec<DecimalMultiplicationParams>` to be passed
   * wherever a generic `FamilyGenerationSpec<T>` is expected (every
   * function in candidateGeneration.ts, and `WAVE_1_FAMILY_SPECS`'s own
   * mixed-family array). An arrow-typed property here would make every
   * one of those call sites a type error despite being runtime-safe.
   */
  constraints(params: TParams): boolean;
  /** Field 3b, disclosed: a human-readable description of what constraints excludes and why -- the Founder's own "invalid combinations" field. */
  invalidCombinationDescription: string;
  /** Field 4: maps a concrete parameter set to a real ContentDifficulty, from the actual magnitude/shape of those parameters -- never a fixed value per spec. */
  difficultyControls(params: TParams): ContentDifficulty;
  /** Samples one candidate parameter set from parameterRanges, honouring constraints (the caller resamples on failure, bounded -- see generateCandidate). */
  sampleParams(random: () => number): TParams;
  /** Renders the learner-facing question text from parameters. */
  renderQuestionText(params: TParams): string;
  /**
   * Field 5 -- THE independent answer derivation. This is the one
   * function the validator calls to recompute the correct answer from
   * parameters alone; it must never be informed by, or reuse state from,
   * whatever a generation step separately claims the answer is. Per the
   * Founder's own explicit instruction: "For Mathematics, independently
   * recompute the correct answer rather than trusting generated answer
   * text."
   */
  deriveCorrectAnswer(params: TParams): string;
  /** Field 6: worked explanation steps, derived from the same parameters, independent of the claimed answer. */
  deriveWorkedSteps(params: TParams): string[];
  /** Field 7, disclosed: distractor/misconception rules, where applicable to this family -- explicitly optional, since not every family has a defensible distractor model yet (per the existing Question Factory Specification's own Stage 9 finding). */
  distractorMisconceptionRules?: string;
  /** Field 9: which preparation stage(s) this family is suitable for. */
  stageSuitability: PreparationStageSuitability[];
  /** Field 10, disclosed: the policy this spec's author applied when deciding what must vary between generated instances (enforced mechanically in candidateGeneration.ts via structuralSignature/antiMemorisationChecks, not merely asserted here). */
  similarityControls: string;

  /**
   * Human Educational Calibration Gate (Wave 2) -- which cognitive route
   * this family's questions require, honestly declared. A spec that only
   * ever returns one value here (every real Wave 1 spec does today) is
   * disclosing genuine reasoning-route homogeneity, not a placeholder --
   * `computeFamilyDiversity()` (diversityGates.ts) reads this field
   * directly to compute the reasoning-variant count.
   */
  reasoningRoute(params: TParams): ReasoningRoute;
  /**
   * The real-world (or bare-arithmetic) presentation setting this
   * candidate is framed in, e.g. "ribbon_cutting", "bare_arithmetic",
   * "triangle_geometry". A spec returning the SAME literal string for
   * every parameter set is honestly declaring zero context variation --
   * this is the mechanism `computeFamilyDiversity()` uses to count
   * genuinely distinct contexts, replacing the previous approach of
   * inferring context from free-text question wording (unreliable and
   * not mechanically checkable).
   */
  contextTag(params: TParams): string;
  /**
   * Which quantity in the problem is the unknown being solved for, e.g.
   * "product", "piece_length", "third_angle". Declared explicitly (not
   * inferred) so a future spec can genuinely vary which value is unknown
   * (e.g. "given the product and one factor, find the other factor")
   * without breaking this field's own contract -- today, every real Wave
   * 1 spec returns a single constant value regardless of parameters,
   * honestly disclosing zero unknown-position variation.
   */
  unknownPosition(params: TParams): string;
}

/**
 * A generated candidate. Deliberately NOT `BankQuestion` -- no `id` in
 * the bank id-space, no `eligibility_status`, no `active`, no path in
 * this module that ever calls `.from("ali_question_bank")`. Approval by
 * `validateCandidate()` means "cleared automated validation, now
 * eligible for human educational review" -- never "eligible for
 * production," per the Founder's explicit instruction.
 */
export interface MathsQuestionCandidate {
  /** Prefixed distinctly from every real bank id convention (`qa-*`, `mth-*`, `mr0X-*`) so it can never be mistaken for one. */
  candidateId: string;
  familyId: string;
  competencyId: CompetencyId;
  questionTypeId: QuestionTypeId;
  question: string;
  /** UNTRUSTED. Whatever the generation step produced -- validateCandidate() must independently recompute and compare, never read this as ground truth. */
  claimedAnswer: string;
  workingSteps: string[];
  difficulty: ContentDifficulty;
  params: Record<string, number>;
  generatedAt: string;
  /** Copied from the spec's own reasoningRoute(params)/contextTag(params)/unknownPosition(params) at generation time -- see FamilyGenerationSpec's own docstrings for why these are declared, not inferred. */
  reasoningRoute: ReasoningRoute;
  contextTag: string;
  unknownPosition: string;
}

export type ValidationFailureReason =
  | "answer_mismatch"
  | "parameter_out_of_range"
  | "invalid_combination"
  | "exact_duplicate_of_existing_bank_row"
  | "exact_duplicate_within_batch";

export interface ValidationResult {
  /** True when the candidate passes the three MATHEMATICAL checks (answer recomputation, parameter range, constraint/invalid-combination) -- independent of whether it later turns out to be a duplicate. Corresponds to the Question Factory Specification's "Automated Validation" stage. */
  mathematicallyValid: boolean;
  /** True only when mathematicallyValid AND it clears the duplicate/similarity check -- i.e. reasons.length === 0. Corresponds to clearing the "Duplicate/Similarity Check" stage, ready for human Educational Review. Never means "eligible for production." */
  approved: boolean;
  reasons: ValidationFailureReason[];
  candidate: MathsQuestionCandidate;
}

export interface ExistingBankRowForComparison {
  id: string;
  familyId: string | null;
  prompt: unknown;
}

export interface BatchMetrics {
  familyId: string;
  rawGenerated: number;
  /** Passed the mathematical "Automated Validation" stage (answer recomputation, parameter range, constraints) -- regardless of duplicate status. */
  valid: number;
  /** rawGenerated - valid: failed a mathematical check. */
  rejected: number;
  rejectedByReason: Partial<Record<ValidationFailureReason, number>>;
  /** valid AND cleared the duplicate/similarity check -- ready for human Educational Review. Always <= valid. */
  approved: number;
  uniqueApprovedInstances: number;
  /** Every approved candidate's familyId, deduplicated -- must always equal exactly [spec.familyId] (length 1). A length other than 1 is a factory defect, not a content decision. */
  distinctFamilyIdsInApprovedSet: string[];
  /** Which numeric parameters actually took more than one distinct value across the approved set -- proof that "variation" happened, not just repetition of one sampled point. */
  variedParameterKeys: string[];
  difficultyDistribution: Partial<Record<ContentDifficulty, number>>;
  /** Near-identical (numeric-normalised) stem groups found WITHIN the approved set -- expected to be non-zero within one family (siblings legitimately share a template); reported as a metric, not a rejection reason. */
  nearIdenticalStemGroupsWithinApproved: number;
}
