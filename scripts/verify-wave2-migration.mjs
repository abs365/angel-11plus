import { readFileSync } from "node:fs";

const sql = readFileSync("supabase/migrations/036_mathematics_wave2_content.sql", "utf8");
const generated = JSON.parse(
  readFileSync(
    "C:/Users/Admin/AppData/Local/Temp/claude/C--Users-Admin/135f4c11-3911-48ce-b2ad-471be84f3f8b/scratchpad/wave2_items.json",
    "utf8"
  )
);

const chunks = sql.split(/(?=\('mr0)/).filter((c) => c.startsWith("('mr0"));
console.log("Row count:", chunks.length);

const inMigration = new Map();
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
  let prompt;
  try {
    prompt = JSON.parse(jsonMatch[1]);
  } catch (e) {
    console.error("JSON PARSE FAIL for", id, e.message);
    ok = false;
    continue;
  }
  inMigration.set(id, prompt);
}

for (const item of generated) {
  const mig = inMigration.get(item.id);
  if (!mig) {
    console.error(`MISSING FROM MIGRATION: ${item.id}`);
    ok = false;
    continue;
  }
  if (mig.answer !== item.answer) {
    console.error(`ANSWER MISMATCH for ${item.id}: generated="${item.answer}" migration="${mig.answer}"`);
    ok = false;
  }
  if (mig.question !== item.question) {
    console.error(`QUESTION MISMATCH for ${item.id}`);
    ok = false;
  }
}
if (inMigration.size !== generated.length) {
  console.error(`COUNT MISMATCH: generated=${generated.length} migration=${inMigration.size}`);
  ok = false;
}

// Dash check on every field the migration inserts (SQL text, not just JSON)
if (/[—–]/.test(sql.replace(/-- .*/g, ""))) {
  console.error("FAIL: em/en dash found in migration SQL content");
  ok = false;
}

console.log(ok ? `VERIFY: PASS — all ${generated.length} items parse cleanly and match the generator exactly` : "VERIFY: FAIL");
if (!ok) process.exit(1);
