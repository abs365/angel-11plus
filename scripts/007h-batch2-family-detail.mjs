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
  const res = await fetch(`${URL}/rest/v1/${path}`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } });
  return res.json();
}

const families = [
  "wave1-fam-direct-retrieval",
  "wave1-fam-synonym-battery",
  "wave1-fam-emotion-cause",
  "mr03-classify",
  "mr04-far-percent",
  "mr04-mixed-divisibility",
];

for (const fam of families) {
  const rows = await rest(
    `ali_question_bank?select=id,content_difficulty,transfer_class,question_type,prompt,explanation,hint,addresses_misconception,learning_unit_id,eligibility_status,active,provenance,content_version&family_id=eq.${fam}&order=content_difficulty`
  );
  console.log(`\n=== FAMILY: ${fam} (n=${rows.length}) ===`);
  for (const r of rows) {
    console.log(`-- ${r.id} | diff=${r.content_difficulty} transfer=${r.transfer_class} elig=${r.eligibility_status} active=${r.active} prov=${r.provenance} v=${r.content_version} lu=${r.learning_unit_id}`);
    console.log(`   prompt: ${JSON.stringify(r.prompt).slice(0, 400)}`);
    console.log(`   explanation: ${String(r.explanation).slice(0, 200)}`);
    console.log(`   misconception: ${String(r.addresses_misconception).slice(0, 200)}`);
  }
}
