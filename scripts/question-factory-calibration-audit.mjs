#!/usr/bin/env node
/**
 * Question Factory Wave 2 -- Human Educational Calibration Gate.
 *
 * Runs the real diversity/depth gates (lib/ali/questionFactory/
 * diversityGates.ts) against the exact 30 real production candidates
 * (scripts/output/question-factory-wave2-first-batch.json), enriched
 * with the honest contextTag/reasoningRoute/unknownPosition values the
 * corrected family specs now declare. This is the evidence base for
 * ANGEL_QUESTION_FACTORY_WAVE2_CALIBRATION_REPORT.md's Task 2/3 tables --
 * every number in that report is this script's real output, not an
 * estimate.
 */
import fs from "node:fs";
import { runFamilyDiversityGates } from "../lib/ali/questionFactory/diversityGates.ts";
import { WAVE_1_FAMILY_SPECS } from "../lib/ali/questionFactory/familySpecs.ts";

const data = JSON.parse(fs.readFileSync("scripts/output/question-factory-wave2-first-batch.json", "utf8"));
const specByFamilyId = new Map(WAVE_1_FAMILY_SPECS.map((s) => [s.familyId, s]));

const byFamily = new Map();
for (const p of data.submissionPayload) {
  const args = p.args;
  const spec = specByFamilyId.get(args.p_family_id);
  const params = extractParamsFromQuestion(args.p_family_id, args.p_question_content.question);
  const enriched = {
    question: args.p_question_content.question,
    difficulty: args.p_difficulty,
    contextTag: spec.contextTag(params),
    reasoningRoute: spec.reasoningRoute(params),
    unknownPosition: spec.unknownPosition(params),
  };
  if (!byFamily.has(args.p_family_id)) byFamily.set(args.p_family_id, []);
  byFamily.get(args.p_family_id).push(enriched);
}

// Re-derive the original numeric params from the rendered question text,
// purely so contextTag()/reasoningRoute()/unknownPosition() (which take
// params but every real Wave 1 spec ignores them and returns a constant)
// can be called without re-running the generator. Since all three
// functions are constants today, any params object works -- this is
// intentionally minimal, not a real parse.
function extractParamsFromQuestion() {
  return {};
}

console.log("=".repeat(70));
for (const [familyId, candidates] of byFamily) {
  const report = runFamilyDiversityGates(familyId, candidates);
  console.log(`\nFAMILY: ${familyId} (${candidates.length} candidates)`);
  console.log("  Difficulty distribution:", report.difficultyIntegrity.tierCounts);
  console.log("  Distinct difficulty tiers:", report.difficultyIntegrity.distinctTiersPresent, "| meets minimum (2):", report.difficultyIntegrity.meetsMinimum);
  console.log("  Structural variants (distinct skeletons):", report.depth.structuralVariantCount, "/", report.depth.rawVariantCount);
  console.log("  Structural diversity ratio:", report.depth.structuralDiversityRatio.toFixed(2));
  console.log("  Contextual variants:", report.depth.contextualVariantCount, "| Reasoning variants:", report.depth.reasoningVariantCount);
  console.log("  Effective educational depth:", report.depth.effectiveEducationalDepth);
  console.log("  Template saturation:", (report.templateSaturation.saturationRatio * 100).toFixed(0) + "%", "| exceeds 50% threshold:", report.templateSaturation.exceedsThreshold);
  console.log("  Context repetition:", (report.contextRepetition.dominantValueRatio * 100).toFixed(0) + "%", "| exceeds 70% threshold:", report.contextRepetition.exceedsThreshold);
  console.log("  Reasoning-route repetition:", (report.reasoningRouteRepetition.dominantValueRatio * 100).toFixed(0) + "%", "| exceeds 70% threshold:", report.reasoningRouteRepetition.exceedsThreshold);
  console.log("  MEMORISATION RISK:", report.memorisationRisk);
  console.log("  PASSES ALL GATES:", report.passesAllGates);
}
console.log("\n" + "=".repeat(70));
