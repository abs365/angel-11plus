import { WAVE2_SEQUENCING_CANDIDATES, WAVE2_SEQUENCING_BLUEPRINTS } from "../lib/ali/questionFactory/ei003Wave2SequencingFamily.ts";
import { WAVE2_COMPARATIVE_CANDIDATES, WAVE2_COMPARATIVE_BLUEPRINTS } from "../lib/ali/questionFactory/ei003Wave2ComparativeFamily.ts";
import { WAVE2_EMOTION_CANDIDATES, WAVE2_EMOTION_BLUEPRINTS } from "../lib/ali/questionFactory/ei003Wave2EmotionFamily.ts";
import { WAVE2_ATMOSPHERE_CANDIDATES, WAVE2_ATMOSPHERE_BLUEPRINTS } from "../lib/ali/questionFactory/ei003Wave2AtmosphereFamily.ts";
import { WAVE2_WORD_CHOICE_CANDIDATES, WAVE2_WORD_CHOICE_BLUEPRINTS } from "../lib/ali/questionFactory/ei003Wave2WordChoiceFamily.ts";
import { EI003_WAVE2_PASSAGES } from "../lib/ali/questionFactory/ei003Wave2Passages.ts";

const allCandidates = [
  ...WAVE2_SEQUENCING_CANDIDATES,
  ...WAVE2_COMPARATIVE_CANDIDATES,
  ...WAVE2_EMOTION_CANDIDATES,
  ...WAVE2_ATMOSPHERE_CANDIDATES,
  ...WAVE2_WORD_CHOICE_CANDIDATES,
];
const allBlueprints = [
  ...WAVE2_SEQUENCING_BLUEPRINTS,
  ...WAVE2_COMPARATIVE_BLUEPRINTS,
  ...WAVE2_EMOTION_BLUEPRINTS,
  ...WAVE2_ATMOSPHERE_BLUEPRINTS,
  ...WAVE2_WORD_CHOICE_BLUEPRINTS,
];

console.log("=== 1. Candidate total ===");
console.log("Total candidates:", allCandidates.length);

console.log("\n=== 2. Per-family candidate counts ===");
const byFamily = {};
for (const c of allCandidates) byFamily[c.familyId] = (byFamily[c.familyId] || 0) + 1;
console.log(byFamily);

console.log("\n=== 3. Blueprint total + per-family blueprint counts ===");
console.log("Total blueprints:", allBlueprints.length);
const bpByFamily = {};
for (const b of allBlueprints) bpByFamily[b.familyId] = (bpByFamily[b.familyId] || 0) + 1;
console.log(bpByFamily);

console.log("\n=== 4. Candidates per blueprint ===");
const byBlueprint = {};
for (const c of allCandidates) byBlueprint[c.blueprintId] = (byBlueprint[c.blueprintId] || 0) + 1;
const counts = Object.values(byBlueprint);
console.log("Distinct blueprints with >=1 candidate:", Object.keys(byBlueprint).length);
console.log("All exactly 2 candidates/blueprint?", counts.every((n) => n === 2));
console.log(byBlueprint);

console.log("\n=== 5. Every blueprint referenced by a candidate exists in the blueprint list ===");
const blueprintIds = new Set(allBlueprints.map((b) => b.blueprintId));
const orphanRefs = allCandidates.filter((c) => !blueprintIds.has(c.blueprintId));
console.log("Orphan blueprint references:", orphanRefs.length);

console.log("\n=== 6. Candidate ID uniqueness + full list ===");
const idSet = new Set(allCandidates.map((c) => c.candidateId));
console.log("Unique IDs:", idSet.size, "of", allCandidates.length);

console.log("\n=== 7. Candidate-to-passage mapping (full list) ===");
for (const c of allCandidates) {
  console.log(`${c.candidateId} -> ${c.passageId} (blueprint: ${c.blueprintId}, family: ${c.familyId})`);
}

console.log("\n=== 8. Passage list (6 expected) ===");
console.log(EI003_WAVE2_PASSAGES.map((p) => p.id));
console.log("Passage count:", EI003_WAVE2_PASSAGES.length);
