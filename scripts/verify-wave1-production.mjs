import { readFileSync } from "node:fs";

const generated = JSON.parse(
  readFileSync(
    "C:/Users/Admin/AppData/Local/Temp/claude/C--Users-Admin/135f4c11-3911-48ce-b2ad-471be84f3f8b/scratchpad/wave1_items.json",
    "utf8"
  )
);
const live = JSON.parse(
  readFileSync(
    "C:/Users/Admin/AppData/Local/Temp/claude/C--Users-Admin/135f4c11-3911-48ce-b2ad-471be84f3f8b/scratchpad/wave1_live.json",
    "utf8"
  )
);

const liveById = new Map(live.map((r) => [r.id, r]));
let ok = true;
const familyCounts = new Map();

for (const item of generated) {
  const row = liveById.get(item.id);
  if (!row) {
    console.error(`MISSING FROM PRODUCTION: ${item.id}`);
    ok = false;
    continue;
  }
  const checks = [
    ["question", row.prompt.question, item.question],
    ["answer", row.prompt.answer, item.answer],
    ["family_id", row.family_id, item.family],
    ["provenance", row.provenance, "angel_original"],
    ["eligibility_status", row.eligibility_status, "practice_eligible"],
    ["active", row.active, true],
    ["content_version", row.content_version, 1],
  ];
  for (const [field, actual, expected] of checks) {
    if (actual !== expected) {
      console.error(`MISMATCH ${item.id}.${field}: production="${actual}" expected="${expected}"`);
      ok = false;
    }
  }
  familyCounts.set(item.family, (familyCounts.get(item.family) || 0) + 1);
}

if (live.length !== generated.length) {
  console.error(`COUNT MISMATCH: production=${live.length} generated=${generated.length}`);
  ok = false;
}

console.log(ok ? "PRODUCTION VERIFICATION: PASS" : "PRODUCTION VERIFICATION: FAIL");
console.log("Families:", Object.fromEntries(familyCounts));
if (!ok) process.exit(1);
