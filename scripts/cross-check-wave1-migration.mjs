import { readFileSync } from "node:fs";

const sql = readFileSync("supabase/migrations/031_mathematics_wave1_content_scale.sql", "utf8");
const generated = JSON.parse(
  readFileSync(
    "C:/Users/Admin/AppData/Local/Temp/claude/C--Users-Admin/135f4c11-3911-48ce-b2ad-471be84f3f8b/scratchpad/wave1_items.json",
    "utf8"
  )
);

const chunks = sql.split(/(?=\('mr0)/).filter((c) => c.startsWith("('mr0"));
const inMigration = new Map();
for (const chunk of chunks) {
  const idMatch = chunk.match(/^\('([a-z0-9-]+)'/);
  const jsonMatch = chunk.match(/\$json\$([^]*?)\$json\$/);
  const prompt = JSON.parse(jsonMatch[1]);
  inMigration.set(idMatch[1], prompt);
}

let ok = true;
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
console.log(ok ? `CROSS-CHECK PASS: all ${generated.length} generated items match the migration exactly` : "CROSS-CHECK FAILED");
if (!ok) process.exit(1);
