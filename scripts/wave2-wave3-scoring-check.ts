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

// One representative item from each of the 4 Wave 2 families (migration 036, live in production)
const wave2Ids = ["mr02-cmp-01", "mr03-cls-01", "mr04-far-01", "mr04-mix-01"];

async function main() {
  const rows: Array<{ id: string; prompt: { answer: string; question: string } }> = await rest(
    `ali_question_bank?select=id,prompt&id=in.(${wave2Ids.join(",")})`
  );
  console.log(`Fetched ${rows.length}/${wave2Ids.length} Wave 2 representative rows from production`);
  let ok = true;
  for (const row of rows) {
    const { answer, question } = row.prompt;
    const correctPass = checkMathsAnswer(answer, answer);
    const wrongFail = !checkMathsAnswer("clearly-not-the-answer-999", answer);
    console.log(`${row.id}: "${question.slice(0, 60)}..." answer="${answer}" correct-accepted=${correctPass} wrong-rejected=${wrongFail}`);
    if (!correctPass || !wrongFail) ok = false;
  }
  console.log(ok ? "SCORING CHECK: PASS" : "SCORING CHECK: FAIL");
}

main();
