/**
 * Educational Increment 005 Part G/M — tests structuralSignature() and
 * findCrossFamilyCollisions() (lib/ali/structuralSignature.ts).
 */
import { readFileSync } from "node:fs";
import { structuralSignature, findCrossFamilyCollisions } from "../lib/ali/structuralSignature";
import type { BankQuestion } from "../types/ali/questionBank";

let passed = 0;
let failed = 0;
function assert(condition: boolean, message: string) {
  if (condition) {
    console.log(`pass: ${message}`);
    passed++;
  } else {
    console.error(`FAIL: ${message}`);
    failed++;
  }
}

// Test 1: same inputs -> same signature (deterministic)
{
  const a = structuralSignature({ skill: "QT-MR-05", answer: "17", workingSteps: ["a", "b"] });
  const b = structuralSignature({ skill: "QT-MR-05", answer: "17", workingSteps: ["a", "b"] });
  assert(a === b, "identical inputs produce identical signatures");
}

// Test 2: different answer forms -> different signatures
{
  const numeric = structuralSignature({ skill: "QT-MR-07", answer: "95" });
  const degree = structuralSignature({ skill: "QT-MR-07", answer: "95°" });
  assert(numeric !== degree, "numeric and degree answer forms produce different signatures");
}

// Test 3: boolean answer form detected
{
  const sig = structuralSignature({ skill: "QT-MR-11", answer: "True" });
  assert(sig.includes("boolean"), "True/False answers are classified as boolean form");
}

// Test 4: fraction answer form detected
{
  const sig = structuralSignature({ skill: "QT-MR-14", answer: "2 6/7" });
  assert(sig.includes("fraction"), "mixed-number answers are classified as fraction form");
}

// Test 5: compound answer form detected (the mr02-substitution "A=x, C=y" shape)
{
  const sig = structuralSignature({ skill: "QT-MR-06", answer: "A=4, C=2" });
  assert(sig.includes("compound"), "multi-value answers are classified as compound form");
}

function q(id: string, skill: string, familyId: string, answer: string): BankQuestion {
  return {
    id,
    subject: "maths",
    skill,
    pathway: ["csse"],
    contentDifficulty: "medium",
    questionType: "short-answer",
    estimatedTimeSeconds: 60,
    prompt: { id, question: "?", answer, skill: "arithmetic", marks: 1, difficulty: "year5-core" },
    explanation: "test",
    confidenceWeight: 1,
    revisionPriority: 3,
    masteryThreshold: 2,
    usageCount: 0,
    avgSuccessRate: null,
    learningUnitId: id,
    familyId,
  };
}

// Test 6: same-family group is never flagged as a collision
{
  const questions = [
    q("a", "QT-MR-05", "fam1", "17"),
    q("b", "QT-MR-05", "fam1", "25"),
  ];
  const collisions = findCrossFamilyCollisions(questions);
  assert(collisions.size === 0, "two items in the same family sharing a signature are not flagged");
}

// Test 7: cross-family collision IS flagged
{
  const questions = [
    q("a", "QT-MR-05", "fam1", "17"),
    q("b", "QT-MR-05", "fam2", "25"), // same QT, same answer form, same step count (0), different family
  ];
  const collisions = findCrossFamilyCollisions(questions);
  assert(collisions.size === 1, "two items with the same signature but different families ARE flagged");
}

// Test 8 (best-effort): real Wave 1 data, if the generator's scratchpad
// output is present in this environment. Not required to pass — the
// scratchpad path is outside the repo and won't exist on a fresh clone or
// in CI; regenerate it first with `node scripts/generate-mathematics-wave1.mjs`
// if you want this check to run. Tests 1-7 already cover the core logic
// with self-contained data and always run.
let wave1: Array<{ id: string; family: string; answer: string; workingSteps?: string[] }> = [];
try {
  wave1 = JSON.parse(
    readFileSync(
      "C:/Users/Admin/AppData/Local/Temp/claude/C--Users-Admin/135f4c11-3911-48ce-b2ad-471be84f3f8b/scratchpad/wave1_items.json",
      "utf8"
    )
  );
} catch {
  console.log("skip: Wave 1 scratchpad data not present in this environment — regenerate with generate-mathematics-wave1.mjs to run this check");
}
if (wave1.length > 0) {
  const FAMILY_SKILL: Record<string, string> = {
    "mr02-sequence-rule": "QT-MR-05",
    "mr02-substitution": "QT-MR-06",
    "mr03-angle-sum": "QT-MR-07",
    "mr05-number-property": "QT-MR-11",
    "mr05-number-property-search": "QT-MR-11",
  };
  const bankQuestions = wave1.map((item) => q(item.id, FAMILY_SKILL[item.family], item.family, item.answer));
  const collisions = findCrossFamilyCollisions(bankQuestions);
  // mr05-number-property and mr05-number-property-search share QT-MR-11 and could
  // legitimately collide on signature (both true/false-adjacent or numeric) — report, don't assert zero.
  console.log(`Wave 1 real-data cross-family collisions found: ${collisions.size}`);
  for (const [sig, families] of collisions) {
    console.log(`  ${sig} -> ${[...families].join(", ")}`);
  }
  assert(true, "structural signature runs cleanly against real Wave 1 production data");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
console.log("All assertions passed.");
