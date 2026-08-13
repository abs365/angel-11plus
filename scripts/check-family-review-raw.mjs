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
  const text = await res.text();
  try { return { status: res.status, body: JSON.parse(text) }; } catch { return { status: res.status, body: text }; }
}
// IMPORTANT — read before trusting this script's output for anything but
// the ANON role's own view: a 200 status with an empty array here proves
// only that the anon key cannot SEE any rows. It is NOT proof the table
// is empty. RLS-enabled-with-no-policy (default deny) and "genuinely zero
// rows" are indistinguishable at the HTTP level from an anon key alone —
// both return 200 + []. Educational Increment 006B's Production Integrity
// Closure got this wrong once already: it reported "ali_family_review
// contains 0 rows" as an authoritative database fact from exactly this
// query, when the table in fact held real rows the whole time (proven
// afterwards via the Founder's own authenticated Supabase Table Editor
// session, which bypasses RLS). ali_family_review is internal educational-
// governance data — anon SELECT visibility being blocked may well be the
// CORRECT security posture, not a bug to fix by granting anon access.
// Report the two numbers separately; never collapse them into one claim.
const all = await rest("ali_family_review?select=*");
console.log("ANON/API VISIBLE ROWS:", Array.isArray(all.body) ? all.body.length : `status ${all.status}`);
console.log("AUTHORITATIVE DATABASE COUNT: NOT AVAILABLE THROUGH THIS VERIFICATION PATH (no service-role key in this repo; check via Supabase Table Editor for ground truth)");
console.log(JSON.stringify(all.body, null, 2));

// Also check the enum's actual allowed values via a deliberately invalid value's error hint
const enumProbe = await rest("ali_family_review?select=decision&decision=eq.pending_independent_review&limit=1");
console.log("Enum probe status:", enumProbe.status);
