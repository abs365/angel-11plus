import { readFileSync } from "node:fs";

const envRaw = readFileSync(".env.local", "utf8");
const env = {};
for (const line of envRaw.split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
function urlFromJwt(jwt) {
  const payload = jwt.split(".")[1];
  const decoded = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
  return `https://${decoded.ref}.supabase.co`;
}
const URL = urlFromJwt(KEY);

async function rest(path) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  return res.json();
}

const generated = JSON.parse(
  readFileSync(
    "C:/Users/Admin/AppData/Local/Temp/claude/C--Users-Admin/135f4c11-3911-48ce-b2ad-471be84f3f8b/scratchpad/wave3_items.json",
    "utf8"
  )
);

const ids = generated.map((g) => g.id);
const live = await rest(`ali_question_bank?select=*&id=in.(${ids.join(",")})`);
const liveById = new Map(live.map((r) => [r.id, r]));

let ok = true;
const familyCounts = new Map();

for (const item of generated) {
  const row = liveById.get(item.id);
  if (!row) {
    console.error(`MISSING FROM PRODUCTION: ${item.id}`);
    ok = false;
    continue;
  }
  const checks = [
    ["question", row.prompt.answer !== undefined ? row.prompt.question : undefined, item.question],
    ["answer", row.prompt.answer, item.answer],
    ["family_id", row.family_id, item.family],
    ["provenance", row.provenance, "angel_original"],
    ["eligibility_status", row.eligibility_status, "provisional"],
    ["active", row.active, true],
    ["content_version", row.content_version, 1],
    ["transfer_class", row.transfer_class, item.transferClass],
    [
      "supporting_competencies",
      JSON.stringify(row.supporting_competencies),
      JSON.stringify(item.supportingCompetencies.length ? item.supportingCompetencies : null),
    ],
  ];
  for (const [field, actual, expected] of checks) {
    if (actual !== expected) {
      console.error(`MISMATCH ${item.id}.${field}: production="${actual}" expected="${expected}"`);
      ok = false;
    }
  }
  familyCounts.set(item.family, (familyCounts.get(item.family) || 0) + 1);
}

if (live.length !== generated.length) {
  console.error(`COUNT MISMATCH: production=${live.length} generated=${generated.length}`);
  ok = false;
}

console.log(ok ? "WAVE 3 PRODUCTION VERIFICATION: PASS" : "WAVE 3 PRODUCTION VERIFICATION: FAIL");
console.log("Families:", Object.fromEntries(familyCounts));
if (!ok) process.exit(1);
