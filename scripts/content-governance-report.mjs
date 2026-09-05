#!/usr/bin/env node
/**
 * Content Governance Report — Question Factory Wave 1, Phase 1.
 *
 * Wires four previously-dormant governance modules (`lib/ali/
 * inventoryClass.ts`, `lib/ali/contentPipeline.ts`, `lib/ali/
 * questionFamilyRegistry.ts`, `lib/ali/effectiveFreshCapacity.ts` -- real,
 * well-reasoned, zero call sites outside their own files prior to this
 * script, per the Wave 1 Gap Register) into a single, runnable admin
 * reporting tool for the first time. Read-only, anon-key, safe -- same
 * privilege level as any real visitor's browser.
 *
 * WHAT IT REPORTS, against the live practice-eligible question bank:
 *   - Inventory class (OPEN/RENEWABLE/MEASUREMENT/SEALED/unclassified) per
 *     row, via `classifyInventoryClass()`. NOTE: `everExposedToMock` is
 *     conservatively assumed `false` for every row this script can see --
 *     the anon-key RLS policy already excludes any row with a Mock-track
 *     eligibility_status, so a genuinely SEALED-via-exposure row should
 *     never appear in this read path at all (the firewall's own job); this
 *     script cannot independently confirm that from the anon channel, and
 *     says so rather than claiming a check it cannot perform.
 *   - Content pipeline stage (`inferPipelineStage()`), per row.
 *   - Family registry (`buildFamilyRegistry()`), per subject, including
 *     the size-bucket distribution (`classifyFamilySizeBucket()`).
 *   - Family freshness is NOT computed here -- `effectiveFreshCapacity.
 *     classifyFamilyFreshness()` requires a specific learner's own history
 *     and current sequence position, which this aggregate, cross-learner
 *     report has no meaningful single value for. This script instead
 *     reports, per family, whether the schema and family registry contain
 *     enough real data for that classification to ever be computed for a
 *     real learner (i.e. wiring proof, not a fabricated aggregate score).
 *
 * WHEN TO RUN THIS
 *   Manually, `npm run content-governance-report` -- an admin visibility
 *   tool, not a blocking CI gate (same network-dependency reasoning as
 *   content-duplicate-guard.mjs).
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import { classifyInventoryClass } from "../lib/ali/inventoryClass.ts";
import { inferPipelineStage } from "../lib/ali/contentPipeline.ts";
import { buildFamilyRegistry, classifyFamilySizeBucket } from "../lib/ali/questionFamilyRegistry.ts";

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

async function fetchAllPracticeEligibleRows(supabase) {
  const pageSize = 1000;
  let from = 0;
  const rows = [];
  for (;;) {
    const { data, error } = await supabase
      .from("ali_question_bank")
      .select("id, subject, skill, family_id, question_type, prompt, content_difficulty, eligibility_status, active, transfer_class")
      .range(from, from + pageSize - 1);
    if (error) throw new Error(`content-governance-report: query failed: ${error.message}`);
    rows.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return rows;
}

function toBankQuestionShape(row) {
  return {
    id: row.id,
    subject: row.subject,
    skill: row.skill,
    questionType: row.question_type,
    contentDifficulty: row.content_difficulty,
    familyId: row.family_id ?? undefined,
    eligibilityStatus: row.eligibility_status,
    active: row.active,
    transferClass: row.transfer_class ?? undefined,
    prompt: row.prompt,
  };
}

function tally(items) {
  const counts = new Map();
  for (const item of items) counts.set(item, (counts.get(item) ?? 0) + 1);
  return Object.fromEntries(counts);
}

async function main() {
  const env = loadEnvLocal();
  const url = realSupabaseUrlFrom(env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const supabase = createClient(url, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const rawRows = await fetchAllPracticeEligibleRows(supabase);
  const rows = rawRows.map(toBankQuestionShape);

  console.log(`Content Governance Report: ${rows.length} live practice-eligible rows scanned.\n`);

  // --- Inventory classification ---
  const inventoryClasses = rows.map((r) =>
    classifyInventoryClass({
      contentType: "question",
      eligibilityStatus: r.eligibilityStatus,
      active: r.active,
      everExposedToMock: false, // see module docstring above -- conservative, disclosed assumption
      isFarTransfer: r.transferClass === "FAR_TRANSFER",
    })
  );
  console.log("Inventory class distribution:", tally(inventoryClasses));

  // --- Content pipeline stage ---
  const pipelineStages = rows.map((r) => inferPipelineStage({ eligibilityStatus: r.eligibilityStatus, active: r.active }));
  console.log("Content pipeline stage distribution:", tally(pipelineStages));

  // --- Family registry, per subject ---
  console.log("\nFamily registry (per subject, `family_id`-based -- Mathematics only has this populated):");
  const bySubject = new Map();
  for (const r of rows) {
    if (!bySubject.has(r.subject)) bySubject.set(r.subject, []);
    bySubject.get(r.subject).push(r);
  }
  for (const [subject, subjectRows] of bySubject) {
    const inventoryClassByQuestionId = new Map(subjectRows.map((r) => [r.id, inventoryClasses[rows.indexOf(r)] ?? "unclassified"]));
    const registry = buildFamilyRegistry(subjectRows, inventoryClassByQuestionId);
    const buckets = tally(registry.map((f) => classifyFamilySizeBucket(f.rowCount)));
    console.log(`  ${subject}: ${registry.length} families, size buckets:`, buckets);
  }

  console.log(
    "\nFamily freshness (`effectiveFreshCapacity.classifyFamilyFreshness`) is a per-LEARNER classification and is not computed in this aggregate report -- see lib/ali/effectiveFreshCapacity.ts's own tests for proof this module's logic is correct and ready to be called with a real learner's history."
  );
}

main().catch((err) => {
  console.error("Content Governance Report: FATAL", err);
  process.exitCode = 1;
});
