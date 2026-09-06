#!/usr/bin/env node
/**
 * Controlled Content Manufacturing Wave 1 — Multi-Family Maths Scale.
 *
 * Generates a bounded, unpublished batch across 6 Maths families (5 newly
 * factory-enabled families + mr03-angle-sum as a small, non-dominant
 * control), runs every existing validation/diversity gate, and writes a
 * full evidence report plus a stratified human-review sample. This
 * script NEVER calls submit_question_candidate() or any other RPC -- it
 * is pure generation + validation, exactly like the Scale Architecture
 * proof-batch script before it. Its only side effect is writing local
 * JSON report files. Nothing here reaches production.
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import { runFamilyBatch } from "../lib/ali/questionFactory/candidateGeneration.ts";
import { MR03_ANGLE_SUM_FAMILY } from "../lib/ali/questionFactory/angleSumBlueprints.ts";
import { MR01_WHOLE_NUMBER_FAMILY } from "../lib/ali/questionFactory/mr01WholeNumberBlueprints.ts";
import { MR02_NTH_TERM_FAMILY } from "../lib/ali/questionFactory/mr02NthTermBlueprints.ts";
import { MR03_COMPOUND_AREA_PERIMETER_FAMILY } from "../lib/ali/questionFactory/mr03CompoundAreaPerimeterBlueprints.ts";
import { MR05_FACTORS_PRIMES_FAMILY } from "../lib/ali/questionFactory/mr05FactorsPrimesBlueprints.ts";
import { MR04_COMPOUND_PERCENTAGE_FAMILY } from "../lib/ali/questionFactory/mr04CompoundPercentageBlueprints.ts";
import {
  classifyBlueprintDepth,
  classifyScaledMemorisationRisk,
  checkDifficultyDistributionIntegrity,
  checkPerBlueprintDifficultyReachability,
  detectParameterSignatureDuplicates,
  detectRepeatedDimension,
} from "../lib/ali/questionFactory/diversityGates.ts";

function seededRandom(seed) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

function realSupabaseUrlFrom(anonKey) {
  const payload = JSON.parse(Buffer.from(anonKey.split(".")[1], "base64url").toString("utf8"));
  return `https://${payload.ref}.supabase.co`;
}
function loadEnvLocal() {
  const raw = fs.readFileSync(".env.local", "utf8");
  return Object.fromEntries(
    raw.split(/\r?\n/).filter((l) => l.includes("=")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1)]; })
  );
}

const WAVE_PLAN = [
  { family: MR01_WHOLE_NUMBER_FAMILY, target: 40, control: false },
  { family: MR02_NTH_TERM_FAMILY, target: 40, control: false },
  { family: MR03_COMPOUND_AREA_PERIMETER_FAMILY, target: 40, control: false },
  { family: MR05_FACTORS_PRIMES_FAMILY, target: 40, control: false },
  { family: MR04_COMPOUND_PERCENTAGE_FAMILY, target: 40, control: false },
  { family: MR03_ANGLE_SUM_FAMILY, target: 20, control: true }, // calibrated control -- deliberately NOT dominant
];

async function main() {
  const env = loadEnvLocal();
  const url = realSupabaseUrlFrom(env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const supabase = createClient(url, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const familyReports = [];
  const reviewSample = [];
  let totalGenerated = 0;
  let totalApproved = 0;
  const throughput = [];

  for (const { family, target, control } of WAVE_PLAN) {
    const { data: existingRows, error } = await supabase
      .from("ali_question_bank")
      .select("id, family_id, prompt")
      .eq("family_id", family.familyId);
    if (error) throw new Error(`Failed to fetch existing ${family.familyId} rows: ${error.message}`);

    const startTime = performance.now();
    const { results, metrics } = runFamilyBatch(family, existingRows, target, seededRandom(family.familyId.length * 104729 + target));
    const elapsedMs = performance.now() - startTime;

    const approvedCandidates = results.filter((r) => r.approved).map((r) => r.candidate);
    totalGenerated += metrics.rawGenerated;
    totalApproved += metrics.approved;

    const blueprintDepth = classifyBlueprintDepth(approvedCandidates);
    const scaledRisk = classifyScaledMemorisationRisk(blueprintDepth);
    const difficultyIntegrity = checkDifficultyDistributionIntegrity(approvedCandidates, 2);
    const perBlueprintDifficulty = checkPerBlueprintDifficultyReachability(approvedCandidates, 2);
    const paramSigDuplicates = detectParameterSignatureDuplicates(
      approvedCandidates.map((c) => ({ candidateId: c.candidateId, question: c.question, blueprintId: c.blueprintId, params: c.params }))
    );
    const contextRepetition = detectRepeatedDimension(approvedCandidates.map((c) => c.contextTag), "context", 0.9);
    const reasoningRepetition = detectRepeatedDimension(approvedCandidates.map((c) => c.reasoningRoute), "reasoningRoute", 0.9);
    const unknownPositionRepetition = detectRepeatedDimension(approvedCandidates.map((c) => c.unknownPosition), "unknownPosition", 0.9);

    const reasoningRouteCounts = {};
    const representationCounts = {};
    const unknownPositionCounts = {};
    const contextCounts = {};
    const teachingUseCounts = {};
    const misconceptionCoverage = new Set();
    for (const c of approvedCandidates) {
      reasoningRouteCounts[c.reasoningRoute] = (reasoningRouteCounts[c.reasoningRoute] ?? 0) + 1;
      representationCounts[c.representationType ?? "unknown"] = (representationCounts[c.representationType ?? "unknown"] ?? 0) + 1;
      unknownPositionCounts[c.unknownPosition] = (unknownPositionCounts[c.unknownPosition] ?? 0) + 1;
      contextCounts[c.contextTag] = (contextCounts[c.contextTag] ?? 0) + 1;
    }
    for (const bp of family.blueprints) {
      if (bp.misconceptionTargeted) misconceptionCoverage.add(bp.misconceptionTargeted);
      for (const use of bp.teachingUses ?? []) teachingUseCounts[use] = (teachingUseCounts[use] ?? 0) + 1;
    }

    const rejectionReasons = {};
    for (const r of results) {
      if (r.approved) continue;
      for (const reason of r.reasons) rejectionReasons[reason] = (rejectionReasons[reason] ?? 0) + 1;
    }

    // Stratified human-review sample: one representative per (blueprint, difficulty) combination actually produced.
    const seenKey = new Set();
    const familySample = [];
    for (const c of approvedCandidates) {
      const key = `${c.blueprintId}::${c.difficulty}`;
      if (seenKey.has(key)) continue;
      seenKey.add(key);
      const blueprint = family.blueprints.find((bp) => bp.blueprintId === c.blueprintId);
      familySample.push({
        candidateId: c.candidateId,
        blueprintId: c.blueprintId,
        difficulty: c.difficulty,
        reasoningRoute: c.reasoningRoute,
        unknownPosition: c.unknownPosition,
        representationType: c.representationType,
        misconceptionTargeted: blueprint?.misconceptionTargeted ?? null,
        question: c.question,
        claimedAnswer: c.claimedAnswer,
        acceptedAnswerForms: c.acceptedAnswerForms ?? null,
      });
    }
    reviewSample.push({ familyId: family.familyId, isControl: control, sampleSize: familySample.length, sample: familySample });

    throughput.push({ familyId: family.familyId, generated: metrics.rawGenerated, elapsedMs: Number(elapsedMs.toFixed(2)), msPerCandidate: Number((elapsedMs / metrics.rawGenerated).toFixed(4)) });

    familyReports.push({
      familyId: family.familyId,
      isControl: control,
      blueprintCount: family.blueprints.length,
      existingRealBankRowsChecked: existingRows.length,
      generated: metrics.rawGenerated,
      approved: metrics.approved,
      rejected: metrics.rejected,
      rejectionReasons,
      perBlueprint: metrics.perBlueprint,
      distinctBlueprintsUsed: metrics.distinctBlueprintsUsed,
      blueprintDepth,
      scaledMemorisationRisk: scaledRisk,
      difficultyDistribution: difficultyIntegrity.tierCounts,
      difficultyDistinctTiers: difficultyIntegrity.distinctTiersPresent,
      perBlueprintDifficultyReachability: perBlueprintDifficulty,
      reasoningRouteDistribution: reasoningRouteCounts,
      representationDistribution: representationCounts,
      unknownPositionDistribution: unknownPositionCounts,
      contextDistribution: contextCounts,
      teachingUseCoverage: teachingUseCounts,
      misconceptionCoverage: [...misconceptionCoverage],
      parameterSignatureDuplicates: paramSigDuplicates,
      contextSaturation: contextRepetition,
      reasoningRouteSaturation: reasoningRepetition,
      unknownPositionSaturation: unknownPositionRepetition,
    });
  }

  const report = {
    generatedAt: new Date().toISOString(),
    wavePlan: WAVE_PLAN.map((w) => ({ familyId: w.family.familyId, target: w.target, control: w.control })),
    totalGenerated,
    totalApproved,
    totalRejected: totalGenerated - totalApproved,
    families: familyReports,
    throughput,
  };

  fs.mkdirSync("scripts/output", { recursive: true });
  fs.writeFileSync("scripts/output/question-factory-wave1-multifamily-report.json", JSON.stringify(report, null, 2));
  fs.writeFileSync("scripts/output/question-factory-wave1-review-sample.json", JSON.stringify(reviewSample, null, 2));

  console.log(`Total generated: ${totalGenerated}, approved: ${totalApproved}, rejected: ${totalGenerated - totalApproved}`);
  for (const f of familyReports) {
    console.log(`${f.familyId}${f.isControl ? " (control)" : ""}: generated=${f.generated}, approved=${f.approved}, blueprintDepth=${f.blueprintDepth.blueprintDepth}, risk=${f.scaledMemorisationRisk}`);
  }
  console.log("\nNOT submitted, approved, or published -- generation + automated validation only.");
  console.log("Reports written to scripts/output/question-factory-wave1-multifamily-report.json and question-factory-wave1-review-sample.json");
}

main().catch((err) => {
  console.error("Wave 1 multi-family manufacturing: FATAL", err);
  process.exitCode = 1;
});
