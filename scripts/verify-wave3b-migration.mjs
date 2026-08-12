import { readFileSync } from "node:fs";

const sql = readFileSync("supabase/migrations/040_mathematics_wave3b_content.sql", "utf8");
const generated = JSON.parse(
  readFileSync(
    "C:/Users/Admin/AppData/Local/Temp/claude/C--Users-Admin/135f4c11-3911-48ce-b2ad-471be84f3f8b/scratchpad/wave3b_items.json",
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
    console.error(`QUESTION MISMATCH for ${item.id}: generated="${item.question}" migration="${mig.question}"`);
    ok = false;
  }
}
if (inMigration.size !== generated.length) {
  console.error(`COUNT MISMATCH: generated=${generated.length} migration=${inMigration.size}`);
  ok = false;
}

// Check family_id / provenance / eligibility_status / transfer_class / supportingCompetencies per row
for (const chunk of chunks) {
  const idMatch = chunk.match(/^\('([a-z0-9-]+)'/);
  if (!idMatch) continue;
  const id = idMatch[1];
  const item = generated.find((g) => g.id === id);
  if (!item) continue;
  const fieldsMatch = chunk.match(
    /'(mr0[a-z0-9-]+)', 'angel_original', 'provisional', 1, true, (?:'[^']*'|null),\n '([A-Z_]+)', (array\[[^\]]*\]|null)\)/
  );
  if (!fieldsMatch) {
    console.error(`LIFECYCLE FIELD PARSE FAIL for ${id}`);
    ok = false;
    continue;
  }
  const [, familyId, transferClass, supportingRaw] = fieldsMatch;
  if (familyId !== item.family) {
    console.error(`FAMILY MISMATCH for ${id}: generated="${item.family}" migration="${familyId}"`);
    ok = false;
  }
  if (transferClass !== item.transferClass) {
    console.error(`TRANSFER CLASS MISMATCH for ${id}: generated="${item.transferClass}" migration="${transferClass}"`);
    ok = false;
  }
  const expectedSupporting = item.supportingCompetencies.length
    ? `array[${item.supportingCompetencies.map((s) => `'${s}'`).join(",")}]`
    : "null";
  if (supportingRaw !== expectedSupporting) {
    console.error(`SUPPORTING COMPETENCIES MISMATCH for ${id}: generated="${expectedSupporting}" migration="${supportingRaw}"`);
    ok = false;
  }
}

// Dash check on every field the migration inserts (SQL text, not just JSON)
if (/[—–]/.test(sql.replace(/-- .*/g, ""))) {
  console.error("FAIL: em/en dash found in migration SQL content");
  ok = false;
}

const distinctFamilies = new Set(generated.map((g) => g.family));
console.log(`Families: ${distinctFamilies.size} (${[...distinctFamilies].join(", ")})`);

const byTransfer = {};
for (const item of generated) byTransfer[item.transferClass] = (byTransfer[item.transferClass] || 0) + 1;
console.log("Transfer distribution:", byTransfer);

console.log(ok ? `VERIFY: PASS — all ${generated.length} items parse cleanly and match the generator exactly` : "VERIFY: FAIL");
if (!ok) process.exit(1);
