#!/usr/bin/env node
/**
 * Question Factory Wave 2, Section 6 — Controlled First Production Batch.
 *
 * Runs a bounded, educationally-sensible batch (10 candidates per family,
 * not an arbitrary large number) through generation + automated
 * validation for the three Wave 1 families, using the SAME real,
 * unmodified lib/ali/questionFactory/ pipeline Wave 1 already proved.
 *
 * WHAT THIS SCRIPT DOES NOT DO, DELIBERATELY
 *   It does not call submit_question_candidate() against production --
 *   this environment holds no production write credentials (the standing
 *   boundary throughout this whole engagement). It does not approve or
 *   publish anything -- that is a human educational-review action this
 *   script has no authority to perform on its own output, per the
 *   Founder's own explicit instruction that generation success is never
 *   sufficient for production trust. Its output is a ready-to-load
 *   payload for the Founder (or an authorised admin session) to submit
 *   via migration 230's submit_question_candidate() RPC once that
 *   migration is applied, after which real human review proceeds through
 *   /admin-beta/question-factory.
 *
 * OUTPUT
 *   scripts/output/question-factory-wave2-first-batch.json -- one entry
 *   per APPROVED candidate (mathematically valid AND cleared duplicate
 *   check), with every field submit_question_candidate() needs, plus a
 *   summary block with the exact Section 6 report fields the Founder
 *   requested (considered/approved/rejected, family/difficulty/
 *   preparation-stage distribution).
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import { runBatch } from "../lib/ali/questionFactory/candidateGeneration.ts";
import { WAVE_1_FAMILY_SPECS } from "../lib/ali/questionFactory/familySpecs.ts";

const BATCH_SIZE_PER_FAMILY = 10; // educationally sensible, bounded -- not maximised for volume

function realSupabaseUrlFrom(anonKey) {
  const payload = JSON.parse(Buffer.from(anonKey.split(".")[1], "base64url").toString("utf8"));
  return `https://${payload.ref}.supabase.co`;
}

function loadEnvLocal() {
  const raw = fs.readFileSync(new URL("../.env.local", import.meta.url), "utf8");
  return Object.fromEntries(
    raw
      .split(/\r?\n/)
      .filter((l) => l.includes("="))
      .map((l) => {
        const i = l.indexOf("=");
        return [l.slice(0, i), l.slice(i + 1)];
      })
  );
}

async function fetchExistingRowsForFamily(supabase, familyId) {
  const { data, error } = await supabase.from("ali_question_bank").select("id, family_id, prompt").eq("family_id", familyId);
  if (error) throw new Error(`fetchExistingRowsForFamily(${familyId}) failed: ${error.message}`);
  return data.map((r) => ({ id: r.id, familyId: r.family_id, prompt: r.prompt }));
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

  const submissionPayload = [];
  const familySummaries = [];
  let totalConsidered = 0;
  let totalApproved = 0;
  const difficultyDistribution = {};
  const preparationStageDistribution = {};

  for (const spec of WAVE_1_FAMILY_SPECS) {
    const existingRows = await fetchExistingRowsForFamily(supabase, spec.familyId);
    const random = seededRandom(spec.familyId.length * 7919 + BATCH_SIZE_PER_FAMILY);
    const { results, metrics } = runBatch(spec, existingRows, BATCH_SIZE_PER_FAMILY, random);

    totalConsidered += metrics.rawGenerated;
    totalApproved += metrics.approved;

    familySummaries.push({
      familyId: spec.familyId,
      considered: metrics.rawGenerated,
      valid: metrics.valid,
      approved: metrics.approved,
      rejectedByReason: metrics.rejectedByReason,
      variedParameterKeys: metrics.variedParameterKeys,
      difficultyDistribution: metrics.difficultyDistribution,
    });

    for (const [k, v] of Object.entries(metrics.difficultyDistribution)) {
      difficultyDistribution[k] = (difficultyDistribution[k] ?? 0) + v;
    }
    for (const stage of spec.stageSuitability) {
      preparationStageDistribution[stage] = (preparationStageDistribution[stage] ?? 0) + metrics.approved;
    }

    for (const result of results) {
      if (!result.approved) continue;
      const c = result.candidate;
      submissionPayload.push({
        rpc: "submit_question_candidate",
        args: {
          p_candidate_id: c.candidateId,
          p_family_id: c.familyId,
          p_generation_spec_id: spec.familyId,
          p_generation_spec_version: "1",
          p_subject: "maths",
          p_competency_id: c.competencyId,
          p_skill: c.questionTypeId,
          p_question_type: "short-answer",
          p_pathway: ["csse"],
          p_preparation_stage: spec.stageSuitability[0] ?? null,
          p_difficulty: c.difficulty,
          p_question_content: { question: c.question, workingSteps: c.workingSteps },
          p_claimed_answer: c.claimedAnswer,
          p_worked_explanation: c.workingSteps.join(" "),
          p_distractors: null,
          p_mathematical_validation: { mathematicallyValid: result.mathematicallyValid, reasons: result.reasons },
          p_similarity_validation: { approved: result.approved, reasons: result.reasons },
        },
      });
    }
  }

  const summary = {
    generatedAt: new Date().toISOString(),
    batchSizePerFamily: BATCH_SIZE_PER_FAMILY,
    candidatesConsidered: totalConsidered,
    candidatesApproved: totalApproved,
    candidatesRejected: totalConsidered - totalApproved,
    familyDistribution: familySummaries.map((f) => ({ familyId: f.familyId, approved: f.approved })),
    difficultyDistribution,
    preparationStageDistribution,
    familySummaries,
  };

  fs.mkdirSync("scripts/output", { recursive: true });
  fs.writeFileSync(
    "scripts/output/question-factory-wave2-first-batch.json",
    JSON.stringify({ summary, submissionPayload }, null, 2)
  );

  console.log("Question Factory Wave 2 -- First Batch (generation + automated validation only)");
  console.log(JSON.stringify(summary, null, 2));
  console.log(`\n${submissionPayload.length} candidates ready for submission -- written to scripts/output/question-factory-wave2-first-batch.json`);
  console.log("NEXT STEP (Founder/admin action, not performed by this script): once migration 230 is applied, load each entry via submit_question_candidate(), then review at /admin-beta/question-factory. Nothing here has been submitted, approved, or published.");
}

main().catch((err) => {
  console.error("Question Factory Wave 2 first-batch script: FATAL", err);
  process.exitCode = 1;
});
