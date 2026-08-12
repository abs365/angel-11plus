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
const all = await rest("ali_family_review?select=*");
console.log("Status:", all.status);
console.log(JSON.stringify(all.body, null, 2));

// Also check the enum's actual allowed values via a deliberately invalid value's error hint
const enumProbe = await rest("ali_family_review?select=decision&decision=eq.pending_independent_review&limit=1");
console.log("Enum probe status:", enumProbe.status);
