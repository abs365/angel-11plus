import { readFileSync } from "node:fs";

const sql = readFileSync("supabase/migrations/031_mathematics_wave1_content_scale.sql", "utf8");
const chunks = sql.split(/(?=\('mr0)/).filter((c) => c.startsWith("('mr0"));
console.log("Row count:", chunks.length);

let ok = true;
const ids = new Set();
for (const chunk of chunks) {
  const idMatch = chunk.match(/^\('([a-z0-9-]+)'/);
  const jsonMatch = chunk.match(/\$json\$([^]*?)\$json\$/);
  if (!idMatch || !jsonMatch) {
    console.error("PARSE FAIL:", chunk.slice(0, 50));
    ok = false;
    continue;
  }
  const id = idMatch[1];
  if (ids.has(id)) {
    console.error("DUPLICATE ID:", id);
    ok = false;
  }
  ids.add(id);
  try {
    JSON.parse(jsonMatch[1]);
  } catch (e) {
    console.error("JSON PARSE FAIL for", id, e.message);
    ok = false;
  }
}
console.log(ok ? "ALL ROWS PARSE CLEANLY, NO DUPLICATE IDS" : "FAILURES FOUND");
if (!ok) process.exit(1);
