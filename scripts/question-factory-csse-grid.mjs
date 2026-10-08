#!/usr/bin/env node
/**
 * CSSE Completion, Priority 3 -- generation + validation + packaging for the context/structure expansion
 * (lib/ali/questionFactory/csseContextBlueprints.ts). Pure generation: it reads existing bank rows with the
 * public read key (for the duplicate check), writes local files, and NEVER submits, approves or publishes.
 *
 * Output (scripts/output/csse-grid-expansion/):
 *   submission-payload.json   exact submit_question_candidate() arguments, deterministic stable ids
 *   review-sheet.md           every candidate in plain text for educational review
 *   metrics.json              validation + diversity-gate evidence
 *   submit-console-script.js  paste into the ADMIN's own signed-in browser console (submits only; stays pending_review)
 *
 * Run: npx tsx scripts/question-factory-csse-grid-expansion.mjs
 */
import fs from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { runFamilyBatch } from "../lib/ali/questionFactory/candidateGeneration.ts";
import { MR03_GRID_EXPANSION } from "../lib/ali/questionFactory/csseCoordinateGridBlueprints.ts";
const CSSE_CONTEXT_EXPANSION_FAMILIES = [MR03_GRID_EXPANSION];
import { mapMathsCandidateToStoreRow, verifyNoFabricatedOrMissingRequiredFields } from "../lib/ali/questionFactory/mathsCandidateStoreMapping.ts";
import { classifyBlueprintDepth, classifyScaledMemorisationRisk, checkPerBlueprintDifficultyReachability, detectParameterSignatureDuplicates } from "../lib/ali/questionFactory/diversityGates.ts";

const PER_BLUEPRINT = 8; // approved candidates wanted per blueprint (quality over count)
const OUT = "scripts/output/csse-grid-expansion";

function seededRandom(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const env = Object.fromEntries(
  fs.readFileSync(".env.local", "utf8").split(/\r?\n/).filter((l) => l.includes("=")).map((l) => { const i = l.indexOf("="); return [l.slice(0, i), l.slice(i + 1)]; })
);
const anon = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const ref = JSON.parse(Buffer.from(anon.split(".")[1], "base64url").toString("utf8")).ref;
const supabaseUrl = `https://${ref}.supabase.co`;
const supabase = createClient(supabaseUrl, anon);

fs.mkdirSync(OUT, { recursive: true });
const payload = [];
const metrics = [];
const sheet = ["# CSSE coordinate-grid expansion (QT-MR-08) -- candidates for educational review", "", "All candidates are `pending_review` once submitted. Nothing is published by this package.", ""];

for (const family of CSSE_CONTEXT_EXPANSION_FAMILIES) {
  const { data: rows, error } = await supabase.from("ali_question_bank").select("id, family_id, prompt").eq("family_id", family.familyId);
  if (error) throw new Error(error.message);
  const existing = rows.map((r) => ({ id: r.id, familyId: r.family_id, prompt: r.prompt }));
  // Over-generate then keep a balanced PER_BLUEPRINT per blueprint so duplicate rejection cannot skew the mix.
  const { results } = runFamilyBatch(family, existing, PER_BLUEPRINT * family.blueprints.length * 12, seededRandom(family.familyId.length * 7919 + 31));
  const approved = results.filter((r) => r.approved);
  const kept = [];
  for (const bp of family.blueprints) {
    // Balanced across the difficulty tiers the blueprint actually reaches (round-robin), not simply the first N generated.
    const mine = approved.filter((r) => r.candidate.blueprintId === bp.blueprintId);
    const byTier = new Map();
    for (const r of mine) (byTier.get(r.candidate.difficulty) ?? byTier.set(r.candidate.difficulty, []).get(r.candidate.difficulty)).push(r);
    const tiers = [...byTier.values()];
    let taken = 0;
    for (let round = 0; taken < PER_BLUEPRINT && round < 200; round++) {
      for (const t of tiers) {
        if (taken >= PER_BLUEPRINT) break;
        if (t[round]) { kept.push(t[round]); taken++; }
      }
    }
  }
  const cands = kept.map((r) => r.candidate);
  const depth = classifyBlueprintDepth(cands);
  metrics.push({
    familyId: family.familyId,
    blueprints: family.blueprints.length,
    keptCandidates: cands.length,
    rawGenerated: results.length,
    approvedBeforeBalancing: approved.length,
    blueprintDepth: depth.blueprintDepth,
    dominantBlueprintShare: depth.dominantBlueprintShare,
    scaledMemorisationRisk: classifyScaledMemorisationRisk(depth),
    perBlueprintDifficulty: checkPerBlueprintDifficultyReachability(cands, 2),
    parameterSignatureDuplicates: detectParameterSignatureDuplicates(cands.map((c) => ({ candidateId: c.candidateId, question: c.question, blueprintId: c.blueprintId, params: c.params }))).length,
    contexts: [...new Set(cands.map((c) => c.contextTag))],
    reasoningRoutes: [...new Set(cands.map((c) => c.reasoningRoute))],
  });
  sheet.push(`## ${family.familyId}`, "");
  const seq = {};
  for (const r of kept) {
    const c = r.candidate;
    const bp = family.blueprints.find((b) => b.blueprintId === c.blueprintId);
    seq[c.blueprintId] = (seq[c.blueprintId] ?? 0) + 1;
    const stableId = `csse-gr-${c.blueprintId}-${String(seq[c.blueprintId]).padStart(2, "0")}`;
    const args = mapMathsCandidateToStoreRow(stableId, c, bp, r);
    const check = verifyNoFabricatedOrMissingRequiredFields(args);
    if (!check.valid) throw new Error(`${stableId}: missing ${check.missing.join(",")}`);
    payload.push({ args });
    sheet.push(
      `- **${stableId}** [${c.difficulty}; ${c.reasoningRoute}; ${c.contextTag}]`,
      `  - Representation: ${c.representationType}${c.stimulus ? ' -- ' + (c.stimulus.type === 'table' ? 'table ' + JSON.stringify({headers: c.stimulus.headers, rows: c.stimulus.rows}) : c.stimulus.type === 'coordinate-grid' ? 'coordinate grid ' + JSON.stringify({x: [c.stimulus.xMin, c.stimulus.xMax], y: [c.stimulus.yMin, c.stimulus.yMax], points: c.stimulus.points, mirrorLine: c.stimulus.mirrorLine ?? null, segments: c.stimulus.segments ?? null}) : 'bar chart ' + JSON.stringify({categories: c.stimulus.categories, values: c.stimulus.values, scaleStep: c.stimulus.scaleStep, axisMax: c.stimulus.axisMax})) : ''}`,
      `  - Q: ${c.question}`,
      `  - Answer: ${c.claimedAnswer}`,
      `  - Working: ${c.workingSteps.join(" / ")}`,
      `  - Targets: ${bp.misconceptionTargeted ?? "-"}`
    );
  }
  sheet.push("");
}

fs.writeFileSync(`${OUT}/submission-payload.json`, JSON.stringify({ generatedBy: "scripts/question-factory-csse-grid-expansion.mjs", count: payload.length, submissionPayload: payload }, null, 2));
fs.writeFileSync(`${OUT}/metrics.json`, JSON.stringify(metrics, null, 2));
fs.writeFileSync(`${OUT}/review-sheet.md`, sheet.join("\n"));

const script = `// Angel 11+ -- CSSE coordinate-grid expansion: submit ${payload.length} candidates (pending_review only).
// HOW TO RUN (admin only): sign in to the live Angel app as the ADMIN account, open DevTools -> Console on any app page,
// paste this whole script and press Enter. It uses your own signed-in session; no credentials are typed or exposed.
// It ONLY submits (review_status = pending_review, publication_status = unpublished). It never approves or publishes.
(async () => {
  const SUPABASE_URL = "${supabaseUrl}";
  const ANON_KEY = "${anon}";
  const tokenKey = Object.keys(localStorage).find((k) => k.startsWith("sb-") && k.endsWith("-auth-token"));
  if (!tokenKey) { console.error("No Supabase auth token found -- are you signed in on this tab?"); return; }
  const accessToken = JSON.parse(localStorage.getItem(tokenKey))?.access_token;
  if (!accessToken) { console.error("No access_token found."); return; }
  const candidates = ${JSON.stringify(payload.map((p) => p.args))};
  const results = [];
  for (const args of candidates) {
    const res = await fetch(SUPABASE_URL + "/rest/v1/rpc/submit_question_candidate", {
      method: "POST",
      headers: { apikey: ANON_KEY, Authorization: "Bearer " + accessToken, "Content-Type": "application/json" },
      body: JSON.stringify(args),
    });
    const body = await res.json().catch(() => null);
    results.push({ id: args.p_candidate_id, status: res.status, ok: res.ok, body });
    console.log(res.ok ? "OK  " : "FAIL", args.p_candidate_id, res.status);
  }
  console.log("Done: " + results.filter((r) => r.ok).length + "/" + candidates.length + " submitted.");
})();
`;
fs.writeFileSync(`${OUT}/submit-console-script.js`, script);
console.log(JSON.stringify(metrics.map((m) => ({ f: m.familyId, kept: m.keptCandidates, bp: m.blueprintDepth, risk: m.scaledMemorisationRisk, dom: m.dominantBlueprintShare, dupSig: m.parameterSignatureDuplicates, ctx: m.contexts.length })), null, 1), "total", payload.length);
