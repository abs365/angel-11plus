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
 * Question Factory Scale Architecture (Increment: Effective Educational
 * Depth + Bulk Generation) — a family may now own MULTIPLE genuine
 * structural blueprints. Every Wave 1/2 `FamilyGenerationSpec` (a single
 * blueprint) remains a valid, unmodified `StructuralBlueprint` -- this
 * extends rather than replaces that shape, so the three existing
 * families/specs need no rewrite. A blueprint is the unit that counts
 * toward STRUCTURAL diversity; multiple blueprints sharing one
 * `familyId` is exactly how a family gains genuine depth without
 * fabricating separate families for what is really one competency's
 * different reasoning demands.
 */
/**
 * Educational Supply & Progression Integration Gate, Section 8
 * (Question Factory -> Teaching Engine Contract) -- the ten educational
 * uses the Founder named explicitly, mirroring
 * `lib/learningEngine/teachingState.ts`'s `TeachingState` plus two
 * content-governance uses (`timed_practice`, `mock_reserve`) that are
 * not learner-progression states but ARE real content-suitability
 * questions.
 */
export type TeachingUse =
  | "explicit_teaching"
  | "worked_example"
  | "guided_practice"
  | "scaffolded_practice"
  | "independent_practice"
  | "transfer"
  | "mastery_check"
  | "maintenance_retrieval"
  | "timed_practice"
  | "mock_reserve";

export interface StructuralBlueprint<TParams extends Record<string, number>> extends FamilyGenerationSpec<TParams> {
  /** Stable, unique identifier for this blueprint -- distinct from familyId (several blueprints share one familyId). Never regenerated per batch; a blueprint's own identity must survive across generation runs so its own approval/calibration history is trackable. */
  blueprintId: string;
  /**
   * Task 7 (Controlled Variation Within Blueprints) -- the presentation
   * format for this specific parameter set, e.g. "prose" or "table". A
   * blueprint whose representation never varies returns the same
   * constant regardless of params, honestly disclosing zero
   * representation variation within it -- exactly the same "declared,
   * not inferred, constant means honestly narrow" discipline as
   * reasoningRoute/contextTag/unknownPosition. Kept as a pure function of
   * `params` (not a separate random draw) so representation choice can
   * be encoded as an ordinary sampled parameter and stays fully
   * deterministic/reproducible from params alone, like every other field
   * here.
   */
  representationType(params: TParams): string;
  /** Named misconception this blueprint specifically targets/diagnoses, if any -- distinct from the family-wide `distractorMisconceptionRules` free-text field, since a family's blueprints can target DIFFERENT misconceptions from one another. */
  misconceptionTargeted?: string;
  /**
   * The measurable characteristics this blueprint's own difficultyControls()
   * actually uses to derive difficulty -- disclosed explicitly so a
   * difficulty label is always explainable ("difficulty here comes from
   * X, Y"), never an unstated or arbitrary rule. Per the Founder's own
   * instruction: never divisibility/parity of an unrelated value.
   */
  difficultyDimensions: string[];
  /**
   * Optional: for a blueprint whose correct answer has more than one
   * mathematically valid written form (e.g. an improper fraction and an
   * equivalent mixed number), returns every accepted form -- the FIRST
   * entry is the canonical DISPLAY answer (what worked steps/explanation
   * show), every entry is an ACCEPTED answer for marking. Omitted
   * entirely (not just returning a 1-element array) honestly means "this
   * blueprint's answer has no ambiguity" -- most blueprints, including
   * every current angle-sum one, fall here.
   */
  deriveAcceptedAnswerForms?(params: TParams): string[];
  /** Real content provenance -- never fabricated; every blueprint built this session is `"angel_original"`. */
  provenance: string;
  /** Whether this blueprint's output may ever be considered for the Mock-reserved pool. False for every blueprint in this increment -- publication (migration 230's own `publish_question_candidate()`) always targets `practice_eligible`; a blueprint cannot promote itself to Mock status by declaring this true, it is documentation of intent for a future, separately-gated Mock-supply decision only. */
  mockEligible: boolean;
  /**
   * Section 8's explicit ask: which teaching states this blueprint's
   * content is suitable for. A question may legitimately support
   * several (e.g. a direct, single-step blueprint can serve as both a
   * worked_example AND independent_practice); a blueprint declaring an
   * honest, disclosed judgement here, not every value by default --
   * an empty or narrow list is a true statement about that blueprint's
   * actual pedagogical suitability, not an oversight. Optional: absence
   * means "not yet classified," never "suitable for nothing."
   */
  teachingUses?: TeachingUse[];
}

/**
 * A family's full blueprint library. `TParams` is deliberately widened
 * to `Record<string, number>` at the array level (the same pattern
 * `WAVE_1_FAMILY_SPECS` already established) so blueprints with
 * genuinely different parameter shapes (e.g. one takes {angleA, angleB},
 * another takes {angleA, angleB, angleC}) can coexist in one family's
 * library without a TypeScript union-inference failure at call sites.
 */
export interface EducationalFamily {
  familyId: string;
  subject: "maths" | "english" | "writing";
  blueprints: StructuralBlueprint<Record<string, number>>[];
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
  /** Present only when generated from a `StructuralBlueprint` (Scale Architecture) rather than a plain single-blueprint `FamilyGenerationSpec` (Wave 1/2) -- the id of the specific blueprint within the family that produced this candidate. Undefined, never fabricated, for the three original Wave 1/2 specs. */
  blueprintId?: string;
  /** Raw-variant dimension (Task 7) -- HOW this specific instance presents its content (e.g. "prose", "table"), independent of blueprintId. Two candidates sharing a blueprintId but different representationType are the SAME structure, presented differently -- never counted as two structures. */
  representationType?: string;
  /** Present only for a blueprint that declares `deriveAcceptedAnswerForms()` -- every mathematically-equivalent accepted written form, canonical form first. Undefined (not an empty array) means this candidate's answer has no accepted-equivalence ambiguity. */
  acceptedAnswerForms?: string[];
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
