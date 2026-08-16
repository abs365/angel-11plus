/**
 * CSSE Completion Programme, Phase A, Decision 61 — Canonical Coverage
 * Matrix reproducibility script.
 *
 * Regenerates the supply/count/teaching-maturity portions of the CSSE
 * Coverage Matrix (ANGEL_CSSE_COMPLETION_PROGRAMME_V1.md §3) directly from
 * live production and the real code, so the matrix does not silently drift
 * into stale documentation. Anything requiring human judgement (READY/
 * PARTIAL/GAP classification, evidence-source citation, exam-preparation
 * maturity) is deliberately left to the canonical document, not invented
 * here — this script is data, not the classification itself.
 *
 * Run with: npx tsx scripts/coverage-matrix.mjs
 */
import { readFileSync } from "node:fs";
import { MATHS_FAMILY_TEACHING_CONTENT } from "../lib/learningEngine/mathsTeachingContent.ts";
import { getGuidedScaffoldKind } from "../lib/learningEngine/guidedPractice.ts";
import { FAMILY_EDUCATIONAL_CONTEXT } from "../lib/adminReview.ts";

const env = {};
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const BASE = "https://" + JSON.parse(Buffer.from(KEY.split(".")[1], "base64").toString()).ref + ".supabase.co";
async function rest(path) {
  const res = await fetch(BASE + "/rest/v1/" + path, { headers: { apikey: KEY, Authorization: "Bearer " + KEY } });
  return res.json();
}
async function count(qs) {
  const res = await fetch(BASE + "/rest/v1/ali_question_bank?" + qs, {
    headers: { apikey: KEY, Authorization: "Bearer " + KEY, Prefer: "count=exact" },
    method: "HEAD",
  });
  const range = res.headers.get("content-range") ?? "";
  const total = range.split("/")[1];
  return total === "*" ? 0 : Number(total);
}

console.log("=== CSSE Coverage Matrix — reproducible supply data ===");
console.log(`Generated: ${new Date().toISOString()}\n`);

console.log("--- Production baseline counts ---");
console.log("TOTAL:", await count("select=id"));
console.log("Practice Eligible:", await count("select=id&eligibility_status=eq.practice_eligible"));
console.log("Maths Practice Eligible:", await count("select=id&eligibility_status=eq.practice_eligible&subject=eq.maths"));
console.log("English Practice Eligible:", await count("select=id&eligibility_status=eq.practice_eligible&subject=eq.english"));
console.log("Writing Practice Eligible:", await count("select=id&eligibility_status=eq.practice_eligible&subject=eq.writing"));
console.log("Provisional:", await count("select=id&eligibility_status=eq.provisional"));
console.log("Mock Eligible:", await count("select=id&eligibility_status=eq.mock_eligible"));
console.log("Independently Validated:", await count("select=id&eligibility_status=eq.independently_validated"));

for (const subject of ["maths", "english", "writing"]) {
  console.log(`\n--- ${subject} family supply (all statuses, fresh) ---`);
  const rows = await rest(
    `ali_question_bank?select=id,family_id,eligibility_status,content_difficulty,addresses_misconception&subject=eq.${subject}&limit=1000`
  );
  const byFamily = new Map();
  for (const r of rows) {
    const key = r.family_id ?? "(legacy, ungrouped)";
    if (!byFamily.has(key)) byFamily.set(key, []);
    byFamily.get(key).push(r);
  }
  const familyIds = [...byFamily.keys()].sort();
  for (const familyId of familyIds) {
    const familyRows = byFamily.get(familyId);
    const pe = familyRows.filter((r) => r.eligibility_status === "practice_eligible").length;
    const prov = familyRows.filter((r) => r.eligibility_status === "provisional").length;
    const misconceptionPct = Math.round(
      (100 * familyRows.filter((r) => r.addresses_misconception).length) / familyRows.length
    );
    const difficulties = [...new Set(familyRows.map((r) => r.content_difficulty))].join("/");
    const hasMathsTeaching = subject === "maths" && Boolean(MATHS_FAMILY_TEACHING_CONTENT[familyId]);
    const hasGuidedScaffold = subject === "english" && Boolean(getGuidedScaffoldKind(familyId));
    const hasEducationalContext = subject === "english" && Boolean(FAMILY_EDUCATIONAL_CONTEXT[familyId]);
    const teachingFlags = [
      hasMathsTeaching && "007L-MODEL+Guided+Remediation",
      hasGuidedScaffold && "Guided-scaffold",
      hasEducationalContext && "Educational-context/MODEL",
    ]
      .filter(Boolean)
      .join(", ") || "ASSESSMENT-ONLY";
    console.log(
      `  ${familyId.padEnd(32)} n=${String(familyRows.length).padEnd(3)} PE=${String(pe).padEnd(3)} prov=${String(
        prov
      ).padEnd(3)} misconception=${String(misconceptionPct).padEnd(4)}% diff=${difficulties.padEnd(20)} teaching=${teachingFlags}`
    );
  }
}

console.log("\n--- Applied Reasoning (Decision 58: HISTORICAL ONLY, current-excluded) ---");
console.log("Live AR-01/QT-AR-01 content in production:", await count("select=id&skill=eq.QT-AR-01"));

console.log("\nDone. Cross-reference against ANGEL_CSSE_COMPLETION_PROGRAMME_V1.md §3 for the human-judgement columns (READY/PARTIAL/GAP, evidence source, exam-preparation maturity) this script does not compute.");
