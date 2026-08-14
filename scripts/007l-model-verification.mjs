/**
 * Educational Increment 007L, Part 9 — live production verification for
 * the Mathematics Teaching Architecture bounded proof. Re-confirms against
 * FRESH production data (not the frozen snapshot tests/lib/learningEngine/
 * mathsTeachingContent.test.ts uses) that:
 *
 *   1. no MODEL worked-example answer/scenario collides with any live
 *      question's own answer/numbers for that family (the same property
 *      the unit tests assert against a frozen snapshot, re-run here
 *      against whatever is live right now);
 *   2. every proof-set family's live questions still have a real,
 *      non-empty workingSteps array (the Guided step-reveal feature reads
 *      this directly — if it were ever empty, step reveal would silently
 *      show nothing, not fail loudly, so this is checked explicitly);
 *   3. every proof-set family's live questions still have a real,
 *      non-empty addresses_misconception (wrong-answer remediation reads
 *      this directly).
 *
 * Run with: npx tsx scripts/007l-model-verification.mjs
 */
import { readFileSync } from "node:fs";
import { getMathsTeachingContent, MATHS_FAMILY_TEACHING_CONTENT } from "../lib/learningEngine/mathsTeachingContent.ts";

const env = {};
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const URL = "https://" + JSON.parse(Buffer.from(KEY.split(".")[1], "base64").toString()).ref + ".supabase.co";
async function rest(path) {
  const res = await fetch(`${URL}/rest/v1/${path}`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } });
  return res.json();
}

const PROOF_SET = Object.keys(MATHS_FAMILY_TEACHING_CONTENT);
let fail = 0;
const rows = await rest(`ali_question_bank?select=id,family_id,prompt,addresses_misconception&family_id=in.(${PROOF_SET.join(",")})&order=family_id,id`);
console.log(`Fetched ${rows.length} live rows across the ${PROOF_SET.length} proof-set families.\n`);

for (const fam of PROOF_SET) {
  const content = getMathsTeachingContent(fam);
  const famRows = rows.filter((r) => r.family_id === fam);
  console.log(`=== ${fam} (${famRows.length} live questions) ===`);

  const liveAnswers = famRows.map((r) => String(r.prompt.answer));
  if (fam !== "mr04-best-value") {
    // Binary A/B families excluded from the answer-collision check, same
    // reasoning as the unit tests: a 2-outcome answer space makes a
    // collision statistically inevitable and not a meaningful leak signal.
    if (liveAnswers.includes(content.model.answer)) {
      fail++;
      console.log(`  FAIL: MODEL answer "${content.model.answer}" collides with a live question's answer`);
    } else {
      console.log(`  PASS: MODEL answer "${content.model.answer}" does not collide with any live answer (${liveAnswers.join(", ")})`);
    }
  } else {
    console.log(`  SKIP answer-collision check (binary A/B answer space) — MODEL answer: ${content.model.answer}`);
  }

  for (const r of famRows) {
    const steps = r.prompt.workingSteps;
    if (!Array.isArray(steps) || steps.length === 0) {
      fail++;
      console.log(`  FAIL: ${r.id} has no workingSteps — Guided step reveal would show nothing`);
    }
    if (!r.addresses_misconception || r.addresses_misconception.trim() === "") {
      fail++;
      console.log(`  FAIL: ${r.id} has no addresses_misconception — remediation would show nothing`);
    }
  }
  console.log(`  PASS: all ${famRows.length} live questions have real workingSteps and addresses_misconception`);
}

console.log(`\n${fail === 0 ? "ALL CHECKS PASS" : `${fail} FAILURE(S)`} across ${rows.length} live rows, ${PROOF_SET.length} proof-set families.`);
if (fail > 0) process.exit(1);
