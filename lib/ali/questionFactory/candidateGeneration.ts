import { findExactDuplicateStems, findNearIdenticalStems } from "../antiMemorisationChecks";
import type {
  BatchMetrics,
  EducationalFamily,
  ExistingBankRowForComparison,
  FamilyGenerationSpec,
  MathsQuestionCandidate,
  StructuralBlueprint,
  ValidationFailureReason,
  ValidationResult,
} from "./types";

/**
 * Question Factory Wave 1, Phase 4/5/9 — generation + validation
 * orchestration. This module is the ONLY place a `MathsQuestionCandidate`
 * is created or judged; nothing here ever writes to `ali_question_bank`
 * or any other table (no `@supabase/supabase-js` import exists in this
 * file), and `ValidationResult.approved` means "cleared automated
 * validation, eligible for human educational review" -- never
 * "eligible for production," per the Founder's explicit instruction that
 * no candidate becomes trusted content merely because generation
 * succeeded.
 */

let candidateSequence = 0;

/**
 * Resamples up to `maxAttempts` times to find a parameter set that
 * satisfies the spec's own constraints -- bounded, never an infinite
 * loop, and throws rather than silently returning an invalid candidate
 * if the spec's parameter space is too narrow to satisfy in that budget
 * (a spec-authoring defect, not something a caller should paper over).
 */
function sampleValidParams<T extends Record<string, number>>(
  spec: FamilyGenerationSpec<T>,
  random: () => number,
  maxAttempts = 200
): T {
  for (let attempt = 0; attempt < maxAttempts; attempt++) {
    const params = spec.sampleParams(random);
    if (spec.constraints(params)) return params;
  }
  throw new Error(`sampleValidParams: could not find a valid parameter set for family "${spec.familyId}" in ${maxAttempts} attempts -- the spec's constraints may be too narrow relative to its parameterRanges.`);
}

/**
 * Generates ONE candidate. The generator itself calls the spec's own
 * `deriveCorrectAnswer` to populate `claimedAnswer` (the realistic
 * behaviour of any real generation step, human or automated) -- but per
 * this module's own governing rule, `claimedAnswer` remains UNTRUSTED by
 * `validateCandidate()` below, which always recomputes independently
 * rather than reading this field as ground truth. A caller building a
 * test for the rejection path should construct a tampered candidate
 * directly (see this module's own test file), not rely on this function
 * ever producing a wrong answer itself.
 */
export function generateCandidate<T extends Record<string, number>>(
  spec: FamilyGenerationSpec<T>,
  random: () => number = Math.random
): MathsQuestionCandidate {
  const params = sampleValidParams(spec, random);
  candidateSequence += 1;
  return {
    candidateId: `factory-candidate-${spec.familyId}-${candidateSequence}-${Date.now()}`,
    familyId: spec.familyId,
    competencyId: spec.competencyId,
    questionTypeId: spec.questionTypeId,
    question: spec.renderQuestionText(params),
    claimedAnswer: spec.deriveCorrectAnswer(params),
    workingSteps: spec.deriveWorkedSteps(params),
    difficulty: spec.difficultyControls(params),
    params,
    generatedAt: new Date().toISOString(),
    reasoningRoute: spec.reasoningRoute(params),
    contextTag: spec.contextTag(params),
    unknownPosition: spec.unknownPosition(params),
  };
}

/**
 * Validates ONE candidate against its spec and a real, pre-fetched pool
 * of existing bank rows for the SAME family (the caller supplies this --
 * this module has no database access of its own, matching the
 * established boundary `lib/ali/inventoryClass.ts` already documents for
 * this exact reason). `siblingCandidatesAlreadyApproved` lets a batch
 * runner also reject duplicates WITHIN one generation run, not only
 * against the live bank.
 */
export function validateCandidate<T extends Record<string, number>>(
  candidate: MathsQuestionCandidate,
  spec: FamilyGenerationSpec<T>,
  existingBankRowsForFamily: readonly ExistingBankRowForComparison[],
  siblingCandidatesAlreadyApproved: readonly MathsQuestionCandidate[] = []
): ValidationResult {
  const reasons: ValidationFailureReason[] = [];

  // 1. Parameter range check (field 2).
  for (const key of Object.keys(spec.parameterRanges) as (keyof T)[]) {
    const range = spec.parameterRanges[key];
    const value = candidate.params[key as string];
    if (value < range.min || value > range.max) {
      reasons.push("parameter_out_of_range");
      break;
    }
  }

  // 2. Constraint / invalid-combination check (field 3).
  if (!spec.constraints(candidate.params as T)) {
    reasons.push("invalid_combination");
  }

  // 3. THE core safety property -- independently recompute the answer
  // from parameters alone and compare against the (untrusted) claimed
  // answer. Never short-circuited, never skipped, regardless of source.
  const independentlyDerivedAnswer = spec.deriveCorrectAnswer(candidate.params as T);
  if (independentlyDerivedAnswer !== candidate.claimedAnswer) {
    reasons.push("answer_mismatch");
  }

  // The three checks above are the "Automated Validation" stage
  // (mathematical legitimacy). Everything below is the separate
  // "Duplicate/Similarity Check" stage -- a candidate can be
  // mathematically perfect and still rejected here.
  const mathematicallyValid = reasons.length === 0;

  // 4. Exact-duplicate check against real existing bank rows for this family.
  const exactAgainstBank = findExactDuplicateStems([
    { id: candidate.candidateId, prompt: { question: candidate.question } },
    ...existingBankRowsForFamily.map((r) => ({ id: r.id, prompt: r.prompt })),
  ]);
  if (exactAgainstBank.some((group) => group.ids.includes(candidate.candidateId))) {
    reasons.push("exact_duplicate_of_existing_bank_row");
  }

  // 5. Exact-duplicate check against sibling candidates already approved in this same batch.
  if (siblingCandidatesAlreadyApproved.length > 0) {
    const exactWithinBatch = findExactDuplicateStems([
      { id: candidate.candidateId, prompt: { question: candidate.question } },
      ...siblingCandidatesAlreadyApproved.map((c) => ({ id: c.candidateId, prompt: { question: c.question } })),
    ]);
    if (exactWithinBatch.some((group) => group.ids.includes(candidate.candidateId))) {
      reasons.push("exact_duplicate_within_batch");
    }
  }

  return { mathematicallyValid, approved: reasons.length === 0, reasons, candidate };
}

/**
 * Runs a full generate+validate batch for one family and returns the
 * Phase 9 metrics. Approved candidates are accumulated as they pass, so
 * later candidates in the same batch are checked against earlier
 * approved ones too (exact_duplicate_within_batch).
 */
export function runBatch<T extends Record<string, number>>(
  spec: FamilyGenerationSpec<T>,
  existingBankRowsForFamily: readonly ExistingBankRowForComparison[],
  batchSize: number,
  random: () => number = Math.random
): { results: ValidationResult[]; metrics: BatchMetrics } {
  const results: ValidationResult[] = [];
  const approved: MathsQuestionCandidate[] = [];
  const rejectedByReason: Partial<Record<ValidationFailureReason, number>> = {};

  for (let i = 0; i < batchSize; i++) {
    const candidate = generateCandidate(spec, random);
    // Structural invariant, asserted unconditionally: generation must
    // never fabricate a new family. This is not a validation "reason" a
    // candidate can fail and be silently dropped -- it is a factory
    // defect that must be visible immediately.
    if (candidate.familyId !== spec.familyId) {
      throw new Error(`runBatch invariant violated: candidate familyId "${candidate.familyId}" does not match spec familyId "${spec.familyId}"`);
    }

    const result = validateCandidate(candidate, spec, existingBankRowsForFamily, approved);
    results.push(result);

    if (result.approved) {
      approved.push(candidate);
    } else {
      for (const reason of result.reasons) {
        rejectedByReason[reason] = (rejectedByReason[reason] ?? 0) + 1;
      }
    }
  }

  const uniqueApprovedInstances = new Set(approved.map((c) => c.question)).size;
  const distinctFamilyIdsInApprovedSet = [...new Set(approved.map((c) => c.familyId))];

  const variedParameterKeys = Object.keys(spec.parameterRanges).filter((key) => {
    const values = new Set(approved.map((c) => c.params[key]));
    return values.size > 1;
  });

  const difficultyDistribution: Partial<Record<string, number>> = {};
  for (const c of approved) {
    difficultyDistribution[c.difficulty] = (difficultyDistribution[c.difficulty] ?? 0) + 1;
  }

  // Informational only, per this module's own design note: near-
  // identical (numeric-normalised) collisions are EXPECTED within one
  // family, since siblings legitimately share a template -- this is
  // reported as a metric, never used to reject a candidate.
  const nearIdenticalStemGroupsWithinApproved = findNearIdenticalStems(
    approved.map((c) => ({ id: c.candidateId, prompt: { question: c.question } }))
  ).length;

  return {
    results,
    metrics: {
      familyId: spec.familyId,
      rawGenerated: batchSize,
      valid: results.filter((r) => r.mathematicallyValid).length,
      rejected: results.filter((r) => !r.mathematicallyValid).length,
      rejectedByReason,
      approved: approved.length,
      uniqueApprovedInstances,
      distinctFamilyIdsInApprovedSet,
      variedParameterKeys,
      difficultyDistribution,
      nearIdenticalStemGroupsWithinApproved,
    },
  };
}

// ============================================================
// Scale Architecture (Effective Educational Depth + Bulk Generation) --
// multi-blueprint family generation. Reuses generateCandidate()/
// validateCandidate() unmodified for the actual generate/validate work
// (a StructuralBlueprint IS a FamilyGenerationSpec, structurally); this
// section only adds blueprint-aware enrichment and cross-blueprint batch
// orchestration.
// ============================================================

/** generateCandidate() plus the fields only a StructuralBlueprint can supply (blueprintId, representationType, acceptedAnswerForms) -- never fabricated for a plain FamilyGenerationSpec. */
export function generateBlueprintCandidate<T extends Record<string, number>>(
  blueprint: StructuralBlueprint<T>,
  random: () => number = Math.random
): MathsQuestionCandidate {
  const base = generateCandidate(blueprint, random);
  const acceptedAnswerForms = blueprint.deriveAcceptedAnswerForms?.(base.params as T);
  return {
    ...base,
    blueprintId: blueprint.blueprintId,
    representationType: blueprint.representationType(base.params as T),
    ...(acceptedAnswerForms ? { acceptedAnswerForms } : {}),
  };
}

/**
 * validateCandidate() plus an answer-equivalence-aware recheck: when a
 * blueprint declares deriveAcceptedAnswerForms(), a candidate's
 * claimedAnswer is accepted if it matches ANY declared form, not only the
 * canonical deriveCorrectAnswer() result -- otherwise identical to
 * validateCandidate(), including the same fail-closed independent
 * recomputation for the canonical form.
 */
const MATHEMATICAL_VALIDITY_REASONS: ReadonlySet<ValidationFailureReason> = new Set([
  "answer_mismatch",
  "parameter_out_of_range",
  "invalid_combination",
]);

export function validateBlueprintCandidate<T extends Record<string, number>>(
  candidate: MathsQuestionCandidate,
  blueprint: StructuralBlueprint<T>,
  existingBankRowsForFamily: readonly ExistingBankRowForComparison[],
  siblingCandidatesAlreadyApproved: readonly MathsQuestionCandidate[] = []
): ValidationResult {
  const baseResult = validateCandidate(candidate, blueprint, existingBankRowsForFamily, siblingCandidatesAlreadyApproved);
  if (!baseResult.reasons.includes("answer_mismatch")) return baseResult;

  const acceptedForms = blueprint.deriveAcceptedAnswerForms?.(candidate.params as T);
  if (!acceptedForms || !acceptedForms.includes(candidate.claimedAnswer)) return baseResult;

  // The claimed answer matches a declared equivalent form -- withdraw
  // ONLY the answer_mismatch reason; every other check's own outcome
  // (range/constraint/duplicate) is untouched. Recomputed from the
  // filtered reason list, not patched ad hoc, so mathematicallyValid/
  // approved stay consistent with validateCandidate()'s own definitions.
  const reasons = baseResult.reasons.filter((r) => r !== "answer_mismatch");
  const mathematicallyValid = !reasons.some((r) => MATHEMATICAL_VALIDITY_REASONS.has(r));
  return { mathematicallyValid, approved: reasons.length === 0, reasons, candidate: baseResult.candidate };
}

export interface BlueprintUsageMetrics {
  blueprintId: string;
  rawGenerated: number;
  approved: number;
  distinctRepresentationTypes: number;
}

export interface FamilyBatchMetrics {
  familyId: string;
  rawGenerated: number;
  approved: number;
  rejected: number;
  rejectedByReason: Partial<Record<ValidationFailureReason, number>>;
  perBlueprint: BlueprintUsageMetrics[];
  distinctBlueprintsUsed: number;
}

/**
 * Distributes `totalBatchSize` as evenly as possible across every
 * blueprint in the family, generating and validating each candidate
 * against its OWN blueprint (never cross-validated against a sibling
 * blueprint's rules), and cross-checks duplicates against the combined
 * approved set so far across the WHOLE family, not just within one
 * blueprint -- two different blueprints producing textually-identical
 * output would still be caught.
 */
export function runFamilyBatch(
  family: EducationalFamily,
  existingBankRowsForFamily: readonly ExistingBankRowForComparison[],
  totalBatchSize: number,
  random: () => number = Math.random
): { results: ValidationResult[]; metrics: FamilyBatchMetrics } {
  const blueprintCount = family.blueprints.length;
  if (blueprintCount === 0) {
    throw new Error(`runFamilyBatch: family "${family.familyId}" has zero blueprints`);
  }

  const results: ValidationResult[] = [];
  const approved: MathsQuestionCandidate[] = [];
  const rejectedByReason: Partial<Record<ValidationFailureReason, number>> = {};
  const perBlueprint = new Map<string, { rawGenerated: number; approved: number; representationTypes: Set<string> }>();
  for (const bp of family.blueprints) perBlueprint.set(bp.blueprintId, { rawGenerated: 0, approved: 0, representationTypes: new Set() });

  for (let i = 0; i < totalBatchSize; i++) {
    const blueprint = family.blueprints[i % blueprintCount];
    const candidate = generateBlueprintCandidate(blueprint, random);

    if (candidate.familyId !== family.familyId) {
      throw new Error(`runFamilyBatch invariant violated: candidate familyId "${candidate.familyId}" does not match family "${family.familyId}"`);
    }

    const usage = perBlueprint.get(blueprint.blueprintId)!;
    usage.rawGenerated += 1;
    if (candidate.representationType) usage.representationTypes.add(candidate.representationType);

    const result = validateBlueprintCandidate(candidate, blueprint, existingBankRowsForFamily, approved);
    results.push(result);

    if (result.approved) {
      approved.push(candidate);
      usage.approved += 1;
    } else {
      for (const reason of result.reasons) rejectedByReason[reason] = (rejectedByReason[reason] ?? 0) + 1;
    }
  }

  const perBlueprintMetrics: BlueprintUsageMetrics[] = family.blueprints.map((bp) => {
    const usage = perBlueprint.get(bp.blueprintId)!;
    return {
      blueprintId: bp.blueprintId,
      rawGenerated: usage.rawGenerated,
      approved: usage.approved,
      distinctRepresentationTypes: usage.representationTypes.size,
    };
  });

  return {
    results,
    metrics: {
      familyId: family.familyId,
      rawGenerated: totalBatchSize,
      approved: approved.length,
      rejected: results.filter((r) => !r.approved).length,
      rejectedByReason,
      perBlueprint: perBlueprintMetrics,
      distinctBlueprintsUsed: perBlueprintMetrics.filter((m) => m.approved > 0).length,
    },
  };
}
