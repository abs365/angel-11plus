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
const rawUrl = env.NEXT_PUBLIC_SUPABASE_URL;
const URL = /^https?:\/\//i.test(rawUrl) ? rawUrl : urlFromJwt(KEY);

async function rest(path) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: res.status, body };
}

// 1. Total rows in ali_question_bank
const total = await rest("ali_question_bank?select=id&limit=1000");
console.log("--- ali_question_bank ---");
console.log("Status:", total.status);
console.log("Total rows:", Array.isArray(total.body) ? total.body.length : total.body);

// 2. Wave 3 ids present?
const wave3Ids = [
  "mr01-mop-01","mr01-mop-02","mr01-mop-03","mr01-mop-04",
  "mr03-coord-01","mr03-coord-02","mr03-coord-03",
  "mr05-mult-01","mr05-mult-02","mr05-mult-03",
  "mr02-far-01","mr02-far-02","mr02-far-03",
  "mr03-mix-01","mr03-mix-02","mr03-mix-03",
  "mr04-far-04","mr04-far-05","mr04-far-06",
];
const wave3Check = await rest(`ali_question_bank?select=id&id=in.(${wave3Ids.join(",")})`);
console.log("Wave 3 rows found in production:", Array.isArray(wave3Check.body) ? wave3Check.body.length : wave3Check.body, "/ 19");

// 3. ali_family_review pending records (037/038)
const familyReview = await rest("ali_family_review?select=family_id,decision,reviewer&decision=eq.pending_independent_review");
console.log("--- ali_family_review pending_independent_review ---");
console.log("Status:", familyReview.status);
console.log(JSON.stringify(familyReview.body, null, 2));

// 4. subject=maths breakdown
const maths = await rest("ali_question_bank?select=id,eligibility_status,provenance,active,family_id&subject=eq.maths&limit=1000");
console.log("--- Mathematics breakdown ---");
if (Array.isArray(maths.body)) {
  console.log("Mathematics total rows:", maths.body.length);
  const byStatus = {};
  const byProvActive = {};
  const families = new Set();
  for (const r of maths.body) {
    byStatus[r.eligibility_status] = (byStatus[r.eligibility_status] || 0) + 1;
    if (r.active === false || r.provenance === "evidence_only") {
      byProvActive.quarantinedOrInactive = (byProvActive.quarantinedOrInactive || 0) + 1;
    }
    if (r.family_id) families.add(r.family_id);
  }
  console.log("By eligibility_status:", byStatus);
  console.log("Quarantined/inactive (active=false or provenance=evidence_only):", byProvActive.quarantinedOrInactive || 0);
  console.log("Distinct families:", families.size);
} else {
  console.log(maths.body);
}
