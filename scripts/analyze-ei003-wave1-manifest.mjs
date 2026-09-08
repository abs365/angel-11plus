import { readFileSync, writeFileSync } from "node:fs";
import {
  classifyBlueprintDepth,
  classifyScaledMemorisationRisk,
  runFamilyDiversityGates,
  detectParameterSignatureDuplicates,
  checkPerBlueprintDifficultyReachability,
} from "../lib/ali/questionFactory/diversityGates.ts";

const manifest = JSON.parse(readFileSync("scripts/output/ei003-wave1-manufactured-manifest.json", "utf8"));
const report = { families: {} };

for (const [familyId, data] of Object.entries(manifest.families)) {
  const candidates = data.candidates.map((c) => ({
    question: c.question,
    contextTag: c.rpcArgs.p_question_content.contextTag,
    reasoningRoute: c.reasoningRoute,
    unknownPosition: c.unknownPosition,
    difficulty: c.difficulty,
    blueprintId: c.blueprintId,
    candidateId: c.candidateId,
    params: c.rpcArgs.p_question_content.params,
  }));

  const gateReport = runFamilyDiversityGates(familyId, candidates);
  const blueprintDepth = classifyBlueprintDepth(candidates);
  const scaledRisk = classifyScaledMemorisationRisk(blueprintDepth);
  const paramDupes = detectParameterSignatureDuplicates(candidates);
  const perBpDifficulty = checkPerBlueprintDifficultyReachability(candidates, 2);

  const difficultyDist = {};
  for (const c of candidates) difficultyDist[c.difficulty] = (difficultyDist[c.difficulty] ?? 0) + 1;
  const representationDist = {};
  for (const c of data.candidates) representationDist[c.representationType] = (representationDist[c.representationType] ?? 0) + 1;
  const reasoningDist = {};
  for (const c of candidates) reasoningDist[c.reasoningRoute] = (reasoningDist[c.reasoningRoute] ?? 0) + 1;

  console.log(`\n########## ${familyId} (${candidates.length} manufactured candidates) ##########`);
  console.log("difficultyDistribution:", JSON.stringify(difficultyDist));
  console.log("representationDistribution:", JSON.stringify(representationDist));
  console.log("reasoningRouteDistribution:", JSON.stringify(reasoningDist));
  console.log("blueprintDepth:", blueprintDepth.blueprintDepth, "dominantBlueprintShare:", blueprintDepth.dominantBlueprintShare.toFixed(3));
  console.log("classifyScaledMemorisationRisk:", scaledRisk);
  console.log("legacy structuralDiversityRatio:", gateReport.structuralDiversity.structuralDiversityRatio.toFixed(3), "-> legacy memorisationRisk:", gateReport.memorisationRisk);
  console.log("templateSaturation:", JSON.stringify(gateReport.templateSaturation));
  console.log("parameterSignatureDuplicates:", paramDupes.length);
  console.log("perBlueprintDifficultyReachability (>=2 tiers):", perBpDifficulty.filter(r => r.meetsMinimum).length, "/", perBpDifficulty.length);

  report.families[familyId] = {
    totalManufactured: candidates.length,
    difficultyDist, representationDist, reasoningDist,
    blueprintDepth: blueprintDepth.blueprintDepth,
    dominantBlueprintShare: blueprintDepth.dominantBlueprintShare,
    classifyScaledMemorisationRisk: scaledRisk,
    legacyStructuralDiversityRatio: gateReport.structuralDiversity.structuralDiversityRatio,
    legacyMemorisationRisk: gateReport.memorisationRisk,
    templateSaturation: gateReport.templateSaturation,
    parameterSignatureDuplicateGroups: paramDupes.length,
    perBlueprintDifficultyReachability: perBpDifficulty,
  };
}

writeFileSync("scripts/output/ei003-wave1-manifest-analysis.json", JSON.stringify(report, null, 2));
console.log("\nAnalysis written to scripts/output/ei003-wave1-manifest-analysis.json");
