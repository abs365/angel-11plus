import { readFileSync } from "node:fs";
import { checkMathsAnswer } from "../lib/learningEngine/practiceContent";

const envRaw = readFileSync(".env.local", "utf8");
const env: Record<string, string> = {};
for (const line of envRaw.split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
function urlFromJwt(jwt: string): string {
  const payload = jwt.split(".")[1];
  const decoded = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
  return `https://${decoded.ref}.supabase.co`;
}
const URL = urlFromJwt(KEY);

async function rest(path: string) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  return res.json();
}

// One representative item per Wave 3 family
const reps = ["mr01-mop-01", "mr03-coord-01", "mr05-mult-01", "mr02-far-01", "mr03-mix-01", "mr04-far-04"];
// A plausible WRONG answer per rep, shaped like the documented misconception (not just a random string)
const plausibleWrong: Record<string, string> = {
  "mr01-mop-01": "84", // applying the operation directly to the two visible numbers
  "mr03-coord-01": "(3, 5)", // failing to reflect at all
  "mr05-mult-01": "4", // giving one of the two numbers instead of the bounded LCM
  "mr02-far-01": "18", // splitting the total evenly (36/2) instead of using the ratio
  "mr03-mix-01": "48", // using the area value directly instead of computing perimeter
  "mr04-far-04": "300", // correct value but wrong unit form check (should still be handled by normalizeNumeric on the numeric part, so use a genuinely wrong number instead)
};
plausibleWrong["mr04-far-04"] = "250"; // genuinely wrong scaled amount

async function main() {
  const rows: Array<{ id: string; prompt: { answer: string; question: string }; eligibility_status: string; active: boolean }> =
    await rest(`ali_question_bank?select=id,prompt,eligibility_status,active&id=in.(${reps.join(",")})`);
  console.log(`Fetched ${rows.length}/${reps.length} Wave 3 representative rows from production\n`);
  let ok = true;
  for (const row of rows) {
    const { answer, question } = row.prompt;
    const correctAccepted = checkMathsAnswer(answer, answer);
    const wrong = plausibleWrong[row.id];
    const wrongRejected = wrong ? !checkMathsAnswer(wrong, answer) : null;
    const stillProvisional = row.eligibility_status === "provisional";
    console.log(
      `${row.id} [${row.eligibility_status}, active=${row.active}]: "${question.slice(0, 70)}..."\n` +
      `  answer="${answer}" correct-accepted=${correctAccepted} plausible-wrong="${wrong}" wrong-rejected=${wrongRejected} still-provisional=${stillProvisional}`
    );
    if (!correctAccepted || wrongRejected === false || !stillProvisional) ok = false;
  }
  console.log(ok ? "\nINTERACTIVE SCORING CHECK: PASS" : "\nINTERACTIVE SCORING CHECK: FAIL");
}

main();
