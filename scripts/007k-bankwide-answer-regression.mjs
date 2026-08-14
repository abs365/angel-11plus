/**
 * Educational Increment 007K — bank-wide regression check for the
 * unit-answer validation fix (lib/learningEngine/practiceContent.ts,
 * checkMathsAnswer/parseNumberWithUnit). Fetches every live Mathematics
 * row directly (not a cached snapshot) and checks, for every one:
 *
 *   1. self-consistency: the stored answer always validates against
 *      itself (proves the fix didn't regress any existing answer shape
 *      -- currency, degrees, categorical text, semicolon alternatives,
 *      fractions, everything);
 *   2. for rows whose answer is genuinely NUMBER + RECOGNISED UNIT: the
 *      bare number is now accepted, and a clearly wrong number is still
 *      rejected.
 *
 * Run with: npx tsx scripts/007k-bankwide-answer-regression.mjs
 */
import { readFileSync } from "node:fs";
import { checkMathsAnswer, parseNumberWithUnit } from "../lib/learningEngine/practiceContent.ts";

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

const rows = await rest("ali_question_bank?select=id,family_id,prompt&subject=eq.maths&limit=1000");
console.log(`Fetched ${rows.length} live Mathematics rows.\n`);

let pass = 0, fail = 0;
for (const r of rows) {
  const ans = String(r.prompt?.answer ?? "");
  if (!ans) continue;

  const selfOk = checkMathsAnswer(ans, ans);
  if (!selfOk) { fail++; console.log(`FAIL self-match ${r.id}: "${ans}" does not validate against itself`); }
  else pass++;

  const parsed = parseNumberWithUnit(ans.split(";")[0].trim());
  if (parsed && parsed.unit) {
    const bareOk = checkMathsAnswer(String(parsed.value), ans);
    const wrongOk = checkMathsAnswer(String(parsed.value + 999), ans);
    if (!bareOk) { fail++; console.log(`FAIL bare-number ${r.id}: "${parsed.value}" not accepted for "${ans}"`); }
    else pass++;
    if (wrongOk) { fail++; console.log(`FAIL wrong-number-not-rejected ${r.id}: "${parsed.value + 999}" wrongly accepted for "${ans}"`); }
    else pass++;
  }
}

console.log(`\n${fail === 0 ? "ALL CHECKS PASS" : `${fail} FAILURE(S)`} -- ${pass + fail} checks across ${rows.length} Mathematics rows.`);
