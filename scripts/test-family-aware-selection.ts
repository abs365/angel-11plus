/**
 * Educational Increment 004 §12/§23 — tests reduceFamilyClustering()
 * (lib/learningEngine/sessionGenerator.ts), the additive family-diversity
 * pass introduced this increment. Does not re-test selectQuestions()
 * itself (untouched, already covered by the existing adaptive-mock-paper-
 * builder suite's real usage).
 */
import { reduceFamilyClustering } from "../lib/learningEngine/sessionGenerator";
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

function q(id: string, familyId?: string): BankQuestion {
  return {
    id,
    subject: "maths",
    skill: "QT-MR-05",
    pathway: ["csse"],
    contentDifficulty: "medium",
    questionType: "short-answer",
    estimatedTimeSeconds: 60,
    prompt: { id, question: "?", answer: "1", skill: "arithmetic", marks: 1, difficulty: "year5-core" },
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

// Test 1: no familyId anywhere -> untouched (covers all 52 pre-Wave-1 rows)
{
  const selected = [q("a"), q("b"), q("c")];
  const result = reduceFamilyClustering(selected, selected);
  assert(result.map((r) => r.id).join(",") === "a,b,c", "no familyId anywhere leaves selection untouched");
}

// Test 2: no family over-represented -> untouched
{
  const selected = [q("a", "fam1"), q("b", "fam2"), q("c", "fam3")];
  const result = reduceFamilyClustering(selected, selected);
  assert(result.map((r) => r.id).join(",") === "a,b,c", "one item per family leaves selection untouched");
}

// Test 3: family over-represented, alternative available -> swapped
{
  const selected = [q("a", "fam1"), q("b", "fam1"), q("c", "fam2")];
  const pool = [...selected, q("d", "fam3")];
  const result = reduceFamilyClustering(selected, pool);
  const fam1Count = result.filter((r) => r.familyId === "fam1").length;
  assert(fam1Count === 1, "over-represented family reduced to exactly one representative");
  assert(result.some((r) => r.id === "d"), "the distinct-family alternative was actually swapped in");
  assert(result.length === 3, "swap preserves the total selected count");
}

// Test 4: family over-represented, NO alternative available -> repeat left in place
{
  const selected = [q("a", "fam1"), q("b", "fam1")];
  const pool = selected; // no alternative exists
  const result = reduceFamilyClustering(selected, pool);
  assert(result.map((r) => r.id).join(",") === "a,b", "no alternative available: repeat is left in place, not dropped");
}

// Test 5: never selects a duplicate id
{
  const selected = [q("a", "fam1"), q("b", "fam1"), q("c", "fam1")];
  const pool = [...selected, q("d", "fam2"), q("e", "fam3")];
  const result = reduceFamilyClustering(selected, pool);
  const ids = result.map((r) => r.id);
  assert(new Set(ids).size === ids.length, "result never contains a duplicate id");
}

// Test 6: never exceeds the original selected count
{
  const selected = [q("a", "fam1"), q("b", "fam1")];
  const pool = [...selected, q("c", "fam2"), q("d", "fam3")];
  const result = reduceFamilyClustering(selected, pool);
  assert(result.length === selected.length, "result length always equals input length");
}

console.log(`\n${passed} passed, ${failed} failed`);
if (failed > 0) process.exit(1);
console.log("All assertions passed.");
