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
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  return { status: res.status, body };
}

// See scripts/check-family-review-raw.mjs for why this result must be read
// as "ANON-visible rows", never as "database row count" — RLS-enabled-
// with-no-policy and a genuinely empty table are indistinguishable at the
// HTTP level via an anon key (both return 200 + []).
const all = await rest("ali_family_review?select=family_id,decision,reviewer,created_at");
console.log("Status:", all.status, "(ANON-visible rows only — not proof of database row count)");
console.log(JSON.stringify(all.body, null, 2));
