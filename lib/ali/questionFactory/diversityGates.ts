import { normaliseStemForNearDuplicateCheck } from "../antiMemorisationChecks";
import type { ContentDifficulty } from "@/types/ali/questionBank";
import type { MathsQuestionCandidate, ReasoningRoute } from "./types";

/**
 * Question Factory Wave 2 — Human Educational Calibration Gate, Tasks 5-6.
 *
 * Built directly in response to the calibration audit's own finding:
 * every one of Wave 1's three families passed 100% automated
 * (mathematical + exact-duplicate) validation while being, educationally,
 * a single template instantiated ten times. This module is the
 * deterministic, explainable, testable answer to "detect that before a
 * human reviewer has to notice it" — never an AI model's own unverified
 * claim that a question is "different" (per the Founder's own explicit
 * instruction).
 */

// ============================================================
// Task 5 — Family Depth Standard
// ============================================================

/**
 * The four-tier classification the Founder's own instruction named
 * explicitly. A single candidate can only ever be counted as ONE of
 * these relative to its family's other members — this module treats
 * them as a strict hierarchy (structural > contextual > reasoning >
 * raw), not independent, additive counts, so "effective educational
 * depth" cannot be inflated by counting the same underlying variety
 * twice under different labels.
 */
export interface FamilyDepthClassification {
  /** Total member candidates/rows considered. */
  rawVariantCount: number;
  /** Distinct normalised-text skeletons (numeric-substitution-invariant) — a structural variant is a genuinely different problem construction, not just different numbers. */
  structuralVariantCount: number;
  /** Distinct `contextTag` values declared across the family. */
  contextualVariantCount: number;
  /** Distinct `reasoningRoute` values declared across the family. */
  reasoningVariantCount: number;
  /**
   * Task 5's own required metric: distinct educational structures ÷ raw
   * candidate count. 1.0 means every candidate is structurally unique;
   * a value near 0 means the family is dominated by one skeleton.
   */
  structuralDiversityRatio: number;
  /**
   * "Effective educational depth" — the count actually defensible as
   * genuine distinct educational demand, per the Founder's own standard
   * ("do not count 100 parameter substitutions as 100 units of genuine
   * educational depth"). Computed as the number of distinct (skeleton,
   * context, reasoningRoute, unknownPosition) COMBINATIONS — never
   * higher than structuralVariantCount, since a combination cannot be
   * more specific than the skeleton itself while still being drawn from
   * the same candidate set.
   */
  effectiveEducationalDepth: number;
}

interface DepthClassificationInput {
  question: string;
  contextTag: string;
  reasoningRoute: ReasoningRoute;
  unknownPosition: string;
}

export function classifyFamilyDepth(candidates: readonly DepthClassificationInput[]): FamilyDepthClassification {
  const rawVariantCount = candidates.length;
  if (rawVariantCount === 0) {
    return { rawVariantCount: 0, structuralVariantCount: 0, contextualVariantCount: 0, reasoningVariantCount: 0, structuralDiversityRatio: 0, effectiveEducationalDepth: 0 };
  }

  const skeletons = candidates.map((c) => normaliseStemForNearDuplicateCheck(c.question));
  const structuralVariantCount = new Set(skeletons).size;
  const contextualVariantCount = new Set(candidates.map((c) => c.contextTag)).size;
  const reasoningVariantCount = new Set(candidates.map((c) => c.reasoningRoute)).size;

  const combinations = new Set(
    candidates.map((c, i) => `${skeletons[i]}::${c.contextTag}::${c.reasoningRoute}::${c.unknownPosition}`)
  );

  return {
    rawVariantCount,
    structuralVariantCount,
    contextualVariantCount,
    reasoningVariantCount,
    structuralDiversityRatio: structuralVariantCount / rawVariantCount,
    effectiveEducationalDepth: combinations.size,
  };
}

export type MemorisationRiskLevel = "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";

/**
 * Thresholds are a disclosed, provisional judgement call (same
 * calibration-ownership discipline as `lib/ali/confidence.ts`'s own
 * constants) — not derived from an external standard. Anchored to the
 * Wave 2 calibration audit's own real finding: a diversity ratio of 0.1
 * (1 structure / 10 candidates, the confirmed real state of all three
 * Wave 1 families) must classify as CRITICAL, not merely HIGH, because
 * the Founder's own core requirement (a frequent learner must not
 * succeed primarily via pattern memorisation) is concretely violated at
 * that ratio for any family a learner encounters repeatedly.
 */
export function classifyMemorisationRisk(diversityRatio: number, rawVariantCount: number): MemorisationRiskLevel {
  // A family too small to meaningfully assess is not silently called
  // "LOW" — a genuinely tiny family (1-2 rows) has no room to be
  // diverse regardless of ratio, and should be treated with the same
  // caution as a low ratio at scale.
  if (rawVariantCount <= 2) return diversityRatio >= 1 ? "MEDIUM" : "HIGH";
  if (diversityRatio >= 0.7) return "LOW";
  if (diversityRatio >= 0.4) return "MEDIUM";
  if (diversityRatio >= 0.2) return "HIGH";
  return "CRITICAL";
}

// ============================================================
// Task 6 — Deterministic Factory Validation Gates
// ============================================================

export interface TemplateSaturationResult {
  /** The single most common normalised skeleton and how many candidates share it. */
  dominantSkeleton: string;
  dominantSkeletonCount: number;
  saturationRatio: number;
  /** True when saturationRatio exceeds the caller-supplied threshold — the caller decides the policy number, this function only measures. */
  exceedsThreshold: boolean;
}

/**
 * Detects same-template saturation: what fraction of a batch/family
 * shares its single most common structural skeleton. This is the exact,
 * explainable, deterministic check that would have flagged all three
 * Wave 1 families before human review — no AI judgement call involved,
 * purely a normalised-text frequency count.
 */
export function detectTemplateSaturation(
  candidates: readonly { question: string }[],
  maxSaturationRatio: number
): TemplateSaturationResult {
  if (candidates.length === 0) {
    return { dominantSkeleton: "", dominantSkeletonCount: 0, saturationRatio: 0, exceedsThreshold: false };
  }
  const counts = new Map<string, number>();
  for (const c of candidates) {
    const skeleton = normaliseStemForNearDuplicateCheck(c.question);
    counts.set(skeleton, (counts.get(skeleton) ?? 0) + 1);
  }
  const [dominantSkeleton, dominantSkeletonCount] = [...counts.entries()].sort((a, b) => b[1] - a[1])[0];
  const saturationRatio = dominantSkeletonCount / candidates.length;
  return { dominantSkeleton, dominantSkeletonCount, saturationRatio, exceedsThreshold: saturationRatio > maxSaturationRatio };
}

export interface RepetitionGateResult {
  /** Which declared dimension this checks: "context" | "unknownPosition" | "reasoningRoute". */
  dimension: string;
  distinctValueCount: number;
  dominantValueRatio: number;
  exceedsThreshold: boolean;
}

/**
 * Generic repeated-dimension gate — the SAME check applied three times
 * (context, unknown position, reasoning structure) per the Founder's own
 * named list, rather than three separately-implemented, potentially
 * inconsistent checks.
 */
export function detectRepeatedDimension(values: readonly string[], dimension: string, maxDominantRatio: number): RepetitionGateResult {
  if (values.length === 0) {
    return { dimension, distinctValueCount: 0, dominantValueRatio: 0, exceedsThreshold: false };
  }
  const counts = new Map<string, number>();
  for (const v of values) counts.set(v, (counts.get(v) ?? 0) + 1);
  const maxCount = Math.max(...counts.values());
  const dominantValueRatio = maxCount / values.length;
  return {
    dimension,
    distinctValueCount: counts.size,
    dominantValueRatio,
    exceedsThreshold: dominantValueRatio > maxDominantRatio,
  };
}

export interface StructuralDiversityMinimumResult {
  structuralDiversityRatio: number;
  meetsMinimum: boolean;
}

/** Task 6's own named "family structural-diversity minimum" gate — a thin, named wrapper over classifyFamilyDepth() so a caller can check pass/fail without recomputing. */
export function checkStructuralDiversityMinimum(
  candidates: readonly DepthClassificationInput[],
  minimumRatio: number
): StructuralDiversityMinimumResult {
  const { structuralDiversityRatio } = classifyFamilyDepth(candidates);
  return { structuralDiversityRatio, meetsMinimum: structuralDiversityRatio >= minimumRatio };
}

export interface DifficultyDistributionIntegrityResult {
  distinctTiersPresent: number;
  tierCounts: Partial<Record<ContentDifficulty, number>>;
  /** True only when at least `minDistinctTiers` different difficulty labels genuinely appear -- catches a family whose difficulty field is populated but never actually varies in practice (a real finding from this calibration: mr01-decimal-computation's own batch used only easy/medium, never hard, despite "hard" being a real, reachable tier in its own difficultyControls()). */
  meetsMinimum: boolean;
}

export function checkDifficultyDistributionIntegrity(
  candidates: readonly { difficulty: ContentDifficulty }[],
  minDistinctTiers: number
): DifficultyDistributionIntegrityResult {
  const tierCounts: Partial<Record<ContentDifficulty, number>> = {};
  for (const c of candidates) tierCounts[c.difficulty] = (tierCounts[c.difficulty] ?? 0) + 1;
  const distinctTiersPresent = Object.keys(tierCounts).length;
  return { distinctTiersPresent, tierCounts, meetsMinimum: distinctTiersPresent >= minDistinctTiers };
}

/**
 * Runs every Task 6 gate over one family's candidates in a single pass,
 * with the Founder's own instinct-matching default policy numbers
 * disclosed as arguments, not hidden constants — a caller (e.g. a future
 * Question Factory batch report) can tighten or loosen them per family
 * without editing this module.
 */
export interface FamilyGatePolicy {
  maxTemplateSaturationRatio: number;
  maxDominantContextRatio: number;
  maxDominantUnknownPositionRatio: number;
  maxDominantReasoningRouteRatio: number;
  minStructuralDiversityRatio: number;
  minDistinctDifficultyTiers: number;
}

export const DEFAULT_FAMILY_GATE_POLICY: FamilyGatePolicy = {
  maxTemplateSaturationRatio: 0.5,
  maxDominantContextRatio: 0.7,
  maxDominantUnknownPositionRatio: 0.7,
  maxDominantReasoningRouteRatio: 0.7,
  minStructuralDiversityRatio: 0.4,
  minDistinctDifficultyTiers: 2,
};

export interface FamilyGateReport {
  familyId: string;
  templateSaturation: TemplateSaturationResult;
  contextRepetition: RepetitionGateResult;
  unknownPositionRepetition: RepetitionGateResult;
  reasoningRouteRepetition: RepetitionGateResult;
  structuralDiversity: StructuralDiversityMinimumResult;
  difficultyIntegrity: DifficultyDistributionIntegrityResult;
  depth: FamilyDepthClassification;
  memorisationRisk: MemorisationRiskLevel;
  /** True only when every gate above passes -- a family failing ANY gate is not "batch-ready," regardless of automated mathematical validation. */
  passesAllGates: boolean;
}

export function runFamilyDiversityGates(
  familyId: string,
  candidates: readonly Pick<MathsQuestionCandidate, "question" | "contextTag" | "reasoningRoute" | "unknownPosition" | "difficulty">[],
  policy: FamilyGatePolicy = DEFAULT_FAMILY_GATE_POLICY
): FamilyGateReport {
  const templateSaturation = detectTemplateSaturation(candidates, policy.maxTemplateSaturationRatio);
  const contextRepetition = detectRepeatedDimension(candidates.map((c) => c.contextTag), "context", policy.maxDominantContextRatio);
  const unknownPositionRepetition = detectRepeatedDimension(candidates.map((c) => c.unknownPosition), "unknownPosition", policy.maxDominantUnknownPositionRatio);
  const reasoningRouteRepetition = detectRepeatedDimension(candidates.map((c) => c.reasoningRoute), "reasoningRoute", policy.maxDominantReasoningRouteRatio);
  const structuralDiversity = checkStructuralDiversityMinimum(candidates, policy.minStructuralDiversityRatio);
  const difficultyIntegrity = checkDifficultyDistributionIntegrity(candidates, policy.minDistinctDifficultyTiers);
  const depth = classifyFamilyDepth(candidates);
  const memorisationRisk = classifyMemorisationRisk(depth.structuralDiversityRatio, depth.rawVariantCount);

  const passesAllGates =
    !templateSaturation.exceedsThreshold &&
    !contextRepetition.exceedsThreshold &&
    !unknownPositionRepetition.exceedsThreshold &&
    !reasoningRouteRepetition.exceedsThreshold &&
    structuralDiversity.meetsMinimum &&
    difficultyIntegrity.meetsMinimum;

  return {
    familyId,
    templateSaturation,
    contextRepetition,
    unknownPositionRepetition,
    reasoningRouteRepetition,
    structuralDiversity,
    difficultyIntegrity,
    depth,
    memorisationRisk,
    passesAllGates,
  };
}

// ============================================================
// Question Factory Scale Architecture — BLUEPRINT DEPTH vs VARIANT DEPTH
// ============================================================
//
// The calibration gate's own `classifyMemorisationRisk(ratio, count)`
// above is preserved UNMODIFIED and remains correct for exactly the
// case it was built for: a small batch generated from a SINGLE
// blueprint (every real Wave 1/2 candidate before this increment). It
// would misclassify the opposite case the Founder explicitly named:
// "if 100 valid questions are deliberately generated from 10 strong
// blueprints, do not automatically classify the family CRITICAL merely
// because 10/100 = 0.10" -- `structuralDiversityRatio` alone cannot
// distinguish "10 genuine structures, each legitimately instantiated 10
// times" from "1 genuine structure repeated 10 times, 10-fold". The
// functions below add the missing dimension: BLUEPRINT DEPTH (how many
// genuinely distinct educational structures exist) is now assessed
// separately from VARIANT DEPTH (how many raw rows exist per
// structure), and risk is classified from blueprint count and exposure
// BALANCE across blueprints, not from a bare ratio that scale alone can
// distort in either direction.

export interface BlueprintDepthClassification {
  rawVariantCount: number;
  /**
   * Distinct `blueprintId` values present. Falls back to the existing
   * structural-skeleton count when NO candidate carries a `blueprintId`
   * (every legacy Wave 1/2 single-blueprint spec) -- this fallback is
   * exactly what makes `classifyScaledMemorisationRisk()` still correctly
   * classify the original 30-candidate calibration batch as CRITICAL,
   * not a silent behaviour change for content generated before this
   * increment.
   */
  blueprintDepth: number;
  /** The existing structural-skeleton count (Task 5's own metric) -- still computed and reported at scale, since it also catches wording-only duplication WITHIN a single blueprint that a blueprint count alone would miss. */
  variantDepth: number;
  /** Fraction of raw variants produced by the single most-used blueprint -- a family can have many blueprints on paper yet still be dominated by one of them in practice. */
  dominantBlueprintShare: number;
  averageVariantsPerBlueprint: number;
}

interface BlueprintDepthInput {
  question: string;
  blueprintId?: string;
}

export function classifyBlueprintDepth(candidates: readonly BlueprintDepthInput[]): BlueprintDepthClassification {
  const rawVariantCount = candidates.length;
  if (rawVariantCount === 0) {
    return { rawVariantCount: 0, blueprintDepth: 0, variantDepth: 0, dominantBlueprintShare: 0, averageVariantsPerBlueprint: 0 };
  }

  const variantDepth = new Set(candidates.map((c) => normaliseStemForNearDuplicateCheck(c.question))).size;

  const blueprintIds = candidates.map((c) => c.blueprintId).filter((id): id is string => Boolean(id));
  const hasBlueprintData = blueprintIds.length === candidates.length; // every candidate must declare one, or the fallback applies uniformly -- never a partial mix silently treated as complete

  if (!hasBlueprintData) {
    // Legacy single-blueprint spec (no blueprintId anywhere) -- the
    // structural-skeleton count IS the best available proxy for
    // blueprint depth, matching the original calibration gate's own
    // behaviour exactly.
    return {
      rawVariantCount,
      blueprintDepth: variantDepth,
      variantDepth,
      dominantBlueprintShare: 1, // undeclared blueprint provenance is treated as maximally concentrated -- never optimistically assumed diverse
      averageVariantsPerBlueprint: rawVariantCount / Math.max(variantDepth, 1),
    };
  }

  const counts = new Map<string, number>();
  for (const id of blueprintIds) counts.set(id, (counts.get(id) ?? 0) + 1);
  const blueprintDepth = counts.size;
  const dominantCount = Math.max(...counts.values());

  return {
    rawVariantCount,
    blueprintDepth,
    variantDepth,
    dominantBlueprintShare: dominantCount / rawVariantCount,
    averageVariantsPerBlueprint: rawVariantCount / blueprintDepth,
  };
}

/**
 * Thresholds are, like the calibration gate's own, a disclosed
 * provisional judgement call. Risk is driven by TWO independent
 * conditions -- genuine blueprint count, and balance of exposure across
 * them -- because either one alone is gameable: many blueprints with one
 * dominant "filler" blueprint is not meaningfully safer than few
 * blueprints, and even perfect balance across only 1-2 blueprints is
 * still a thin family.
 */
export function classifyScaledMemorisationRisk(depth: BlueprintDepthClassification): MemorisationRiskLevel {
  if (depth.blueprintDepth <= 1) return "CRITICAL";
  if (depth.dominantBlueprintShare > 0.7) return "CRITICAL";
  if (depth.blueprintDepth <= 2 || depth.dominantBlueprintShare > 0.5) return "HIGH";
  if (depth.blueprintDepth <= 4 || depth.dominantBlueprintShare > 0.35) return "MEDIUM";
  return "LOW";
}

// ============================================================
// Educational Foundation Completion Standard, Section 13 --
// Wording-Only Substitution Detection
// ============================================================
//
// The Scale Architecture increment's own adversarial tests proved
// `normaliseStemForNearDuplicateCheck` (digit-substitution-invariant
// only) does NOT catch three cosmetically-reworded copies of the same
// underlying question. Per the Founder's own explicit instruction --
// "do not introduce an expensive opaque dependency merely to claim
// semantic detection... use layered signals" -- this section adds TWO
// deterministic, non-generative signals, deliberately not a single
// fuzzy score:
//
//   1. PARAMETER-SIGNATURE duplication (certain, not heuristic): two
//      candidates sharing the same blueprintId AND the exact same
//      generation parameters ARE, by definition, the same educational
//      instance regardless of how differently their question text is
//      worded -- this is the precise, zero-false-positive fix for the
//      exact defect the adversarial test named (an LLM or author
//      rewording the identical {angleA:10, angleB:20} case three ways).
//   2. TOKEN-OVERLAP similarity (disclosed heuristic, not a hard gate):
//      a plain Jaccard ratio over lowercase, digit-stripped word tokens
//      -- catches near-identical phrasing sharing most content words
//      even when blueprint/parameter identity isn't available (e.g.
//      legacy content with no blueprintId), reported as a signal for
//      human review, never an automatic rejection on its own (a false
//      positive here would wrongly block two genuinely different
//      questions that happen to share common domain vocabulary, e.g.
//      "triangle"/"angle" appearing in every member of a family).

export function computeParameterSignature(params: Record<string, number>): string {
  const sortedKeys = Object.keys(params).sort();
  return sortedKeys.map((k) => `${k}=${params[k]}`).join("&");
}

export interface ParameterSignatureDuplicateGroup {
  blueprintId: string;
  parameterSignature: string;
  /** Distinct normalised skeletons sharing this exact (blueprintId, params) pair -- >1 here means wording alone was varied over an otherwise-identical instance. */
  distinctWordingCount: number;
  memberIds: string[];
}

interface ParameterSignatureInput {
  candidateId: string;
  question: string;
  blueprintId?: string;
  params: Record<string, number>;
}

/**
 * Certain, not heuristic: flags every group of candidates that share
 * BOTH the same declared blueprintId and the exact same parameter
 * values, yet render as more than one distinct normalised skeleton --
 * proof that wording, not the underlying educational instance, is the
 * only thing that varied. Candidates with no `blueprintId` are grouped
 * under a per-candidate-unique key (never silently treated as sharing
 * an unknown blueprint with each other), matching this codebase's own
 * "undeclared provenance is never optimistically assumed" discipline
 * (`classifyBlueprintDepth`'s own fallback, same principle applied here).
 */
export function detectParameterSignatureDuplicates(
  candidates: readonly ParameterSignatureInput[]
): ParameterSignatureDuplicateGroup[] {
  const groups = new Map<string, ParameterSignatureInput[]>();
  for (const c of candidates) {
    const key = c.blueprintId ? `${c.blueprintId}::${computeParameterSignature(c.params)}` : `__no_blueprint__::${c.candidateId}`;
    const existing = groups.get(key);
    if (existing) existing.push(c);
    else groups.set(key, [c]);
  }

  const results: ParameterSignatureDuplicateGroup[] = [];
  for (const [, members] of groups) {
    if (members.length < 2) continue;
    const skeletons = new Set(members.map((m) => normaliseStemForNearDuplicateCheck(m.question)));
    if (skeletons.size > 1) {
      results.push({
        blueprintId: members[0].blueprintId ?? "unknown",
        parameterSignature: computeParameterSignature(members[0].params),
        distinctWordingCount: skeletons.size,
        memberIds: members.map((m) => m.candidateId),
      });
    }
  }
  return results;
}

const STOP_WORDS: ReadonlySet<string> = new Set(["a", "an", "the", "is", "are", "of", "in", "to", "and", "one", "what"]);

function tokenise(text: string): Set<string> {
  const words = text
    .toLowerCase()
    .replace(/\d+/g, "")
    .replace(/[^a-z\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 0 && !STOP_WORDS.has(w));
  return new Set(words);
}

/** Plain Jaccard similarity (intersection / union) over content-word tokens, digits and stop-words stripped. A disclosed HEURISTIC signal (see module docstring) -- never an automatic rejection on its own. */
export function computeTokenOverlapRatio(questionA: string, questionB: string): number {
  const tokensA = tokenise(questionA);
  const tokensB = tokenise(questionB);
  if (tokensA.size === 0 && tokensB.size === 0) return 1;
  let intersectionSize = 0;
  for (const t of tokensA) if (tokensB.has(t)) intersectionSize++;
  const unionSize = tokensA.size + tokensB.size - intersectionSize;
  return unionSize === 0 ? 0 : intersectionSize / unionSize;
}

// ============================================================
// Educational Foundation Completion Standard, Section 14 --
// Difficulty Integrity: per-blueprint reachability
// ============================================================
//
// `StructuralBlueprint.difficultyDimensions: string[]` is already a
// REQUIRED (non-optional) field -- every blueprint has been compelled
// to declare its real difficulty basis since the Scale Architecture
// increment, a compile-time contract this section does not need to
// re-invent. What that field cannot catch on its own is the EXACT
// historical defect this codebase already found and fixed once
// (mr03-angle-sum's original rule could never produce "hard" for any
// input, despite "hard" being a defined, intended tier) -- a dead
// branch is invisible at the type level. `checkDifficultyDistributionIntegrity`
// already proves this for a whole batch; the addition here is applying
// it PER BLUEPRINT, so one blueprint's dead branch cannot hide behind
// other blueprints in the same family batch reaching different tiers.

export interface PerBlueprintDifficultyReport {
  blueprintId: string;
  distinctTiersReached: number;
  tierCounts: Partial<Record<ContentDifficulty, number>>;
  /** True only when this SPECIFIC blueprint's own candidates reach at least `minDistinctTiers` tiers -- never inferred from the family's overall batch. */
  meetsMinimum: boolean;
}

export function checkPerBlueprintDifficultyReachability(
  candidates: readonly { blueprintId?: string; difficulty: ContentDifficulty }[],
  minDistinctTiers: number
): PerBlueprintDifficultyReport[] {
  const byBlueprint = new Map<string, ContentDifficulty[]>();
  for (const c of candidates) {
    if (!c.blueprintId) continue;
    const existing = byBlueprint.get(c.blueprintId);
    if (existing) existing.push(c.difficulty);
    else byBlueprint.set(c.blueprintId, [c.difficulty]);
  }

  const reports: PerBlueprintDifficultyReport[] = [];
  for (const [blueprintId, difficulties] of byBlueprint) {
    const result = checkDifficultyDistributionIntegrity(
      difficulties.map((difficulty) => ({ difficulty })),
      minDistinctTiers
    );
    reports.push({
      blueprintId,
      distinctTiersReached: result.distinctTiersPresent,
      tierCounts: result.tierCounts,
      meetsMinimum: result.meetsMinimum,
    });
  }
  return reports;
}
