import { readFileSync } from "node:fs";

// lib/ali/structuralSignature.ts is TS; re-implement the tiny pure logic
// inline here for a standalone .mjs report script rather than requiring a
// build step just to run a report. Kept in sync by hand; the canonical
// implementation and its tests live in lib/ali/structuralSignature.ts /
// scripts/test-structural-signature.ts.
function answerForm(answer) {
  const trimmed = answer.trim();
  if (/^(true|false)$/i.test(trimmed)) return "boolean";
  if (/^-?\d+(\.\d+)?°$/.test(trimmed)) return "degree";
  if (/^-?\d+\s+\d+\/\d+$/.test(trimmed) || /^-?\d+\/\d+$/.test(trimmed)) return "fraction";
  if (/^-?\d+(\.\d+)?$/.test(trimmed)) return "numeric";
  if (trimmed.includes(",") || trimmed.includes(";") || /[A-Za-z]=.+,\s*[A-Za-z]=/.test(trimmed)) return "compound";
  if (/^£-?\d+(\.\d+)?$/.test(trimmed)) return "currency";
  if (/^(greater|less|equal)$/i.test(trimmed)) return "comparative";
  if (/^(equilateral|isosceles|scalene)$/i.test(trimmed)) return "classification";
  return "text";
}
function sig(skill, answer, steps) {
  return `${skill}|${answerForm(answer)}|steps=${steps ?? 0}`;
}

const FAMILY_SKILL = {
  "mr02-sequence-rule": "QT-MR-05",
  "mr02-substitution": "QT-MR-06",
  "mr03-angle-sum": "QT-MR-07",
  "mr05-number-property": "QT-MR-11",
  "mr05-number-property-search": "QT-MR-11",
  "mr02-compare": "QT-MR-06",
  "mr03-classify": "QT-MR-07",
  "mr04-far-percent": "QT-MR-04",
  "mr04-mixed-divisibility": "QT-MR-13",
};

const wave1 = JSON.parse(
  readFileSync(
    "C:/Users/Admin/AppData/Local/Temp/claude/C--Users-Admin/135f4c11-3911-48ce-b2ad-471be84f3f8b/scratchpad/wave1_items.json",
    "utf8"
  )
);
const wave2 = JSON.parse(
  readFileSync(
    "C:/Users/Admin/AppData/Local/Temp/claude/C--Users-Admin/135f4c11-3911-48ce-b2ad-471be84f3f8b/scratchpad/wave2_items.json",
    "utf8"
  )
);

const all = [
  ...wave1.map((i) => ({ id: i.id, family: i.family, skill: FAMILY_SKILL[i.family], answer: i.answer, steps: i.workingSteps?.length })),
  ...wave2.map((i) => ({ id: i.id, family: i.family, skill: FAMILY_SKILL[i.family], answer: i.answer, steps: i.workingSteps?.length })),
];

const bySig = new Map();
for (const item of all) {
  const s = sig(item.skill, item.answer, item.steps);
  if (!bySig.has(s)) bySig.set(s, []);
  bySig.get(s).push(item);
}

console.log(`Total items: ${all.length}`);
console.log(`Distinct structural signatures: ${bySig.size}`);
let largest = 0;
let largestSig = "";
for (const [s, items] of bySig) {
  if (items.length > largest) {
    largest = items.length;
    largestSig = s;
  }
}
console.log(`Largest concentration: ${largest} items sharing "${largestSig}"`);
console.log("\nPer-signature breakdown:");
for (const [s, items] of bySig) {
  const families = new Set(items.map((i) => i.family));
  const flag = families.size > 1 ? "  <-- CROSS-FAMILY, review" : "";
  console.log(`  ${s}: ${items.length} items, families=[${[...families].join(", ")}]${flag}`);
}
