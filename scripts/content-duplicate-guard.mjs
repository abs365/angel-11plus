#!/usr/bin/env node
/**
 * Content Duplicate/Similarity Guard — Question Factory Wave 1, Phase 1.
 *
 * Wires two previously-dormant governance modules (`lib/ali/
 * antiMemorisationChecks.ts` and `lib/ali/structuralSignature.ts` -- real,
 * well-reasoned, zero call sites outside their own files prior to this
 * script, per the Wave 1 Gap Register) into an actual, runnable content
 * lifecycle check for the first time.
 *
 * WHAT IT CHECKS, against the real, live, practice-eligible question bank
 * (read-only, anon-key -- the same privilege level as any real visitor's
 * browser, no service-role key, no learner data):
 *   - Duplicate primary keys (should be structurally impossible, checked
 *     anyway -- antiMemorisationChecks.findDuplicateIds()).
 *   - Exact-duplicate stem text across different question ids
 *     (antiMemorisationChecks.findExactDuplicateStems()).
 *   - Near-identical stems after numeric-substitution normalisation --
 *     the exact "changing names or numbers alone" pattern the Founder's
 *     own instruction names as NOT a genuine new family
 *     (antiMemorisationChecks.findNearIdenticalStems()).
 *   - Cross-family structural collisions -- two DIFFERENT family_id groups
 *     sharing the same skill/answer-form/working-step-count signature,
 *     the "apparent volume from disguised duplication" risk
 *     (structuralSignature.findCrossFamilyCollisions()).
 *
 * WHEN TO RUN THIS
 *   Manually, before authoring or applying any content migration that adds
 *   rows to `ali_question_bank` -- NOT part of the blocking `npm run lint`
 *   chain (unlike copy-quality-guard.mjs/migration-sql-guard.mjs), because
 *   this script requires live network/database access and must never make
 *   an unrelated commit's CI run depend on that being available. Run via
 *   `npm run content-duplicate-guard`.
 *
 * WHAT IT CANNOT CATCH (disclosed, not hidden)
 *   Semantic/paraphrase duplication (two questions with different wording
 *   testing the identical concept) -- both underlying modules are
 *   deliberately non-semantic, per their own docstrings. A clean run of
 *   this guard is evidence against COSMETIC duplication only, never proof
 *   of genuine conceptual diversity.
 */
import { createClient } from "@supabase/supabase-js";
import fs from "node:fs";
import { findDuplicateIds, findExactDuplicateStems, findNearIdenticalStems } from "../lib/ali/antiMemorisationChecks.ts";
import { findCrossFamilyCollisions } from "../lib/ali/structuralSignature.ts";

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
      .select("id, subject, skill, family_id, question_type, prompt")
      .range(from, from + pageSize - 1);
    if (error) throw new Error(`content-duplicate-guard: query failed: ${error.message}`);
    rows.push(...data);
    if (data.length < pageSize) break;
    from += pageSize;
  }
  return rows;
}

function toBankQuestionShape(row) {
  return {
    id: row.id,
    skill: row.skill,
    familyId: row.family_id ?? undefined,
    prompt: row.prompt,
  };
}

async function main() {
  const env = loadEnvLocal();
  const url = realSupabaseUrlFrom(env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  const supabase = createClient(url, env.NEXT_PUBLIC_SUPABASE_ANON_KEY);

  const rawRows = await fetchAllPracticeEligibleRows(supabase);
  const rows = rawRows.map(toBankQuestionShape);

  const duplicateIds = findDuplicateIds(rows);
  const exactDuplicateStems = findExactDuplicateStems(rows);
  const nearIdenticalStems = findNearIdenticalStems(rows);
  const collisions = findCrossFamilyCollisions(rows);

  let violations = 0;

  if (duplicateIds.length > 0) {
    violations += duplicateIds.length;
    console.error(`Content Duplicate Guard: ${duplicateIds.length} duplicate id(s):`, duplicateIds);
  }
  if (exactDuplicateStems.length > 0) {
    violations += exactDuplicateStems.length;
    console.error(`Content Duplicate Guard: ${exactDuplicateStems.length} exact-duplicate stem group(s):`, exactDuplicateStems);
  }
  if (nearIdenticalStems.length > 0) {
    violations += nearIdenticalStems.length;
    console.error(`Content Duplicate Guard: ${nearIdenticalStems.length} near-identical (numeric-substitution) stem group(s):`, nearIdenticalStems);
  }
  if (collisions.size > 0) {
    violations += collisions.size;
    console.error(`Content Duplicate Guard: ${collisions.size} cross-family structural collision(s):`, [...collisions.entries()]);
  }

  console.log(`Content Duplicate Guard: scanned ${rows.length} live practice-eligible rows.`);

  if (violations > 0) {
    console.error(`Content Duplicate Guard: FAIL -- ${violations} finding(s) above. This does not block any migration automatically -- review each finding for genuine cosmetic duplication before authoring further content in the affected family.`);
    process.exitCode = 1;
    return;
  }

  console.log("Content Duplicate Guard: PASS -- 0 mechanical duplication findings across the live practice-eligible pool.");
}

main().catch((err) => {
  console.error("Content Duplicate Guard: FATAL", err);
  process.exitCode = 1;
});
