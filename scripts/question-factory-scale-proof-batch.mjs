#!/usr/bin/env node
/**
 * Question Factory Scale Architecture — Section 19 Proof Batch.
 *
 * Generates a bounded 80-candidate proof batch from the new 7-blueprint
 * mr03-angle-sum family, runs every validation gate (mathematical,
 * duplicate, and the new blueprint-aware diversity gates), and reports
 * the result. This script NEVER calls submit_question_candidate() or
 * any other RPC -- it is pure generation + validation, exactly like
 * Wave 2's own first-batch script, and its only side effect is writing a
 * local JSON report file. Nothing here reaches production.
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import { runFamilyBatch } from "../lib/ali/questionFactory/candidateGeneration.ts";
import { MR03_ANGLE_SUM_FAMILY } from "../lib/ali/questionFactory/angleSumBlueprints.ts";
import { classifyBlueprintDepth, classifyScaledMemorisationRisk, checkDifficultyDistributionIntegrity } from "../lib/ali/questionFactory/diversityGates.ts";

const BATCH_SIZE = 80; // within the Founder's own requested 50-100 range

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

function seededRandom(seed) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

async function main() {
  const env = loadEnvLocal();
  const url = realSupabaseUrlFrom(env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const supabase = createClient(url, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const { data: existingRows, error } = await supabase
    .from("ali_question_bank")
    .select("id, family_id, prompt")
    .eq("family_id", "mr03-angle-sum");
  if (error) throw new Error(`Failed to fetch existing mr03-angle-sum rows: ${error.message}`);

  const { results, metrics } = runFamilyBatch(MR03_ANGLE_SUM_FAMILY, existingRows, BATCH_SIZE, seededRandom(20260906));

  const approvedCandidates = results.filter((r) => r.approved).map((r) => r.candidate);

  const blueprintDepth = classifyBlueprintDepth(approvedCandidates);
  const scaledRisk = classifyScaledMemorisationRisk(blueprintDepth);
  const difficultyIntegrity = checkDifficultyDistributionIntegrity(approvedCandidates, 2);

  const reasoningRouteCounts = {};
  const representationCounts = {};
  const unknownPositionCounts = {};
  const misconceptionCoverage = new Set();
  for (const c of approvedCandidates) {
    reasoningRouteCounts[c.reasoningRoute] = (reasoningRouteCounts[c.reasoningRoute] ?? 0) + 1;
    representationCounts[c.representationType ?? "unknown"] = (representationCounts[c.representationType ?? "unknown"] ?? 0) + 1;
    unknownPositionCounts[c.unknownPosition] = (unknownPositionCounts[c.unknownPosition] ?? 0) + 1;
  }
  for (const bp of MR03_ANGLE_SUM_FAMILY.blueprints) {
    if (bp.misconceptionTargeted) misconceptionCoverage.add(bp.misconceptionTargeted);
  }

  const rejectionReasons = {};
  for (const r of results) {
    if (r.approved) continue;
    for (const reason of r.reasons) rejectionReasons[reason] = (rejectionReasons[reason] ?? 0) + 1;
  }

  const report = {
    generatedAt: new Date().toISOString(),
    familyId: "mr03-angle-sum",
    batchSize: BATCH_SIZE,
    existingRealBankRowsChecked: existingRows.length,
    generated: metrics.rawGenerated,
    approvedByAutomatedGates: metrics.approved,
    rejected: metrics.rejected,
    rejectionReasons,
    perBlueprint: metrics.perBlueprint,
    distinctBlueprintsUsed: metrics.distinctBlueprintsUsed,
    blueprintDepth,
    scaledMemorisationRisk: scaledRisk,
    difficultyDistribution: difficultyIntegrity.tierCounts,
    difficultyDistinctTiers: difficultyIntegrity.distinctTiersPresent,
    reasoningRouteDistribution: reasoningRouteCounts,
    representationDistribution: representationCounts,
    unknownPositionDistribution: unknownPositionCounts,
    misconceptionCoverage: [...misconceptionCoverage],
  };

  fs.mkdirSync("scripts/output", { recursive: true });
  fs.writeFileSync("scripts/output/question-factory-scale-proof-batch-report.json", JSON.stringify(report, null, 2));

  console.log(JSON.stringify(report, null, 2));
  console.log("\nNOT submitted, approved, or published -- generation + automated validation only. Report written to scripts/output/question-factory-scale-proof-batch-report.json");
}

main().catch((err) => {
  console.error("Question Factory scale proof batch: FATAL", err);
  process.exitCode = 1;
});
