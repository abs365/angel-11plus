#!/usr/bin/env node
/**
 * Question Factory Wave 2 -- Production Activation Verification.
 *
 * Read-only, anon-key probe (same privilege level as any real visitor's
 * browser) confirming migrations 228/229/230 exist and behave correctly
 * in production, WITHOUT requiring or using any admin/service credential.
 *
 * WHAT THIS PROVES
 *   - ali_question_family / ali_question_candidate exist and RLS blocks
 *     anon reads (a clean empty result with no error is the CORRECT
 *     signal here -- an error like "relation does not exist" would mean
 *     the migration never actually applied).
 *   - record_question_bank_telemetry() / submit_question_candidate()
 *     exist and reject an unauthenticated/non-admin caller at their own
 *     first authorisation check (fail closed) -- NOT a "function does
 *     not exist" error, which would mean the migration never applied.
 *     Both calls are harmless: each RAISEs before touching any row.
 *   - ali_question_bank's existing 351 practice-eligible rows, and one
 *     specific real family's row count, are unchanged.
 *
 * WHAT THIS CANNOT PROVE (requires a real admin session; run via Supabase
 * SQL Editor, signed in as the Founder, or the browser console scripts
 * this same Wave produced)
 *   - The TRUE row counts inside ali_question_family/ali_question_candidate
 *     (RLS hides them from this anon probe by design).
 *   - That a LEGITIMATE authenticated telemetry/candidate write succeeds
 *     (requires a real learner/admin session this script does not have).
 *
 * Run: node scripts/verify-question-factory-production.mjs
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";

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

const env = loadEnvLocal();
const url = realSupabaseUrlFrom(env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
const supabase = createClient(url, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

async function main() {
  console.log("=== ali_question_family (expect: no error, RLS blocks anon -> 0 rows visible) ===");
  const fam = await supabase.from("ali_question_family").select("*", { count: "exact" });
  console.log("error:", fam.error?.message ?? null, "| data length:", fam.data?.length ?? null, "| count:", fam.count);

  console.log("\n=== ali_question_candidate (expect: no error, RLS blocks anon -> 0 rows visible) ===");
  const cand = await supabase.from("ali_question_candidate").select("*", { count: "exact" });
  console.log("error:", cand.error?.message ?? null, "| data length:", cand.data?.length ?? null, "| count:", cand.count);

  console.log("\n=== record_question_bank_telemetry as anon (expect: 'No profile found for the calling user', NOT a 'function does not exist' error) ===");
  const rpc1 = await supabase.rpc("record_question_bank_telemetry", { p_question_id: "mth-008", p_is_correct: true });
  console.log("error:", rpc1.error?.message ?? null, "| code:", rpc1.error?.code ?? null);

  console.log("\n=== submit_question_candidate as anon (expect: 'Only an admin may submit...', NOT a 'function does not exist' error) ===");
  const rpc2 = await supabase.rpc("submit_question_candidate", {
    p_candidate_id: "verify-probe-do-not-use",
    p_family_id: "mr01-decimal-computation",
    p_generation_spec_id: "mr01-decimal-computation",
    p_generation_spec_version: "1",
    p_subject: "maths",
    p_competency_id: "MR-01",
    p_skill: "QT-MR-01",
    p_question_type: "short-answer",
    p_pathway: ["csse"],
    p_preparation_stage: "DEVELOPMENT",
    p_difficulty: "medium",
    p_question_content: { question: "probe" },
    p_claimed_answer: "0",
    p_worked_explanation: null,
    p_distractors: null,
    p_mathematical_validation: {},
    p_similarity_validation: {},
  });
  console.log("error:", rpc2.error?.message ?? null, "| code:", rpc2.error?.code ?? null);

  console.log("\n=== ali_question_bank sanity check -- confirm existing data is untouched (expect 351) ===");
  const bank = await supabase.from("ali_question_bank").select("*", { count: "exact", head: true });
  console.log("error:", bank.error?.message ?? null, "| count:", bank.count);

  console.log("\n=== Mathematics decimal family real row check (mr01-decimal-computation, expect 7) ===");
  const fam1 = await supabase.from("ali_question_bank").select("*", { count: "exact", head: true }).eq("family_id", "mr01-decimal-computation");
  console.log("error:", fam1.error?.message ?? null, "| count:", fam1.count);
}

main().catch((e) => console.error("FATAL", e));
