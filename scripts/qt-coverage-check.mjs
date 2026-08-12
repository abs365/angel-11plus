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
const maths = await rest("ali_question_bank?select=id,skill,family_id,eligibility_status&subject=eq.maths&limit=1000");
const byQt = new Map();
for (const r of maths) {
  if (!byQt.has(r.skill)) byQt.set(r.skill, { items: 0, families: new Set() });
  const e = byQt.get(r.skill);
  e.items++;
  if (r.family_id) e.families.add(r.family_id);
}
const allQts = ["QT-MR-01","QT-MR-02","QT-MR-03","QT-MR-04","QT-MR-05","QT-MR-06","QT-MR-07","QT-MR-08","QT-MR-09","QT-MR-10","QT-MR-11","QT-MR-12","QT-MR-13","QT-MR-14"];
for (const qt of allQts) {
  const e = byQt.get(qt);
  console.log(qt, e ? `items=${e.items} families=${e.families.size} (${[...e.families].join(",")})` : "UNUSED");
}
