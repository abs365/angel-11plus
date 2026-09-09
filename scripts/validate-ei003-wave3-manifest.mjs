import { WAVE3_RETRIEVAL_CANDIDATES, WAVE3_RETRIEVAL_BLUEPRINTS } from "../lib/ali/questionFactory/ei003Wave3RetrievalFamily.ts";
import { WAVE3_COMPARATIVE_CANDIDATES, WAVE3_COMPARATIVE_BLUEPRINTS } from "../lib/ali/questionFactory/ei003Wave3ComparativeFamily.ts";
import { WAVE3_MOTIVE_CANDIDATES, WAVE3_MOTIVE_BLUEPRINTS } from "../lib/ali/questionFactory/ei003Wave3MotiveFamily.ts";
import { WAVE3_LANGUAGE_EFFECT_CANDIDATES, WAVE3_LANGUAGE_EFFECT_BLUEPRINTS } from "../lib/ali/questionFactory/ei003Wave3LanguageEffectFamily.ts";
import fs from "node:fs";

const passageSnapshot = JSON.parse(
  fs.readFileSync(new URL("./output/ei003-wave3-passage-snapshot.json", import.meta.url), "utf8")
);

const allCandidates = [
  ...WAVE3_RETRIEVAL_CANDIDATES,
  ...WAVE3_COMPARATIVE_CANDIDATES,
  ...WAVE3_MOTIVE_CANDIDATES,
  ...WAVE3_LANGUAGE_EFFECT_CANDIDATES,
];
const allBlueprints = [
  ...WAVE3_RETRIEVAL_BLUEPRINTS,
  ...WAVE3_COMPARATIVE_BLUEPRINTS,
  ...WAVE3_MOTIVE_BLUEPRINTS,
  ...WAVE3_LANGUAGE_EFFECT_BLUEPRINTS,
];

let problems = 0;

// 1. Candidate ID / blueprint ID uniqueness.
const candidateIds = new Set();
for (const c of allCandidates) {
  if (candidateIds.has(c.candidateId)) { console.log(`DUPLICATE candidateId: ${c.candidateId}`); problems++; }
  candidateIds.add(c.candidateId);
}
const blueprintIds = new Set();
for (const b of allBlueprints) {
  if (blueprintIds.has(b.blueprintId)) { console.log(`DUPLICATE blueprintId: ${b.blueprintId}`); problems++; }
  blueprintIds.add(b.blueprintId);
}

// 2. Every candidate's blueprintId/familyId resolves to a real blueprint of the same family.
const blueprintById = Object.fromEntries(allBlueprints.map((b) => [b.blueprintId, b]));
for (const c of allCandidates) {
  const bp = blueprintById[c.blueprintId];
  if (!bp) { console.log(`ORPHAN blueprint reference: ${c.candidateId} -> ${c.blueprintId}`); problems++; continue; }
  if (bp.familyId !== c.familyId) { console.log(`FAMILY MISMATCH: ${c.candidateId} familyId=${c.familyId} but blueprint belongs to ${bp.familyId}`); problems++; }
}

// 3. Every candidate's passageId resolves to a real snapshot passage, and every evidence quote is an exact substring of that passage's real text.
for (const c of allCandidates) {
  const passage = passageSnapshot[c.passageId];
  if (!passage) { console.log(`UNKNOWN passageId: ${c.candidateId} -> ${c.passageId}`); problems++; continue; }
  for (const q of c.evidenceQuotes) {
    if (!passage.text.includes(q)) {
      console.log(`QUOTE MISMATCH: ${c.candidateId} -> "${q.slice(0, 60)}..." not found in ${c.passageId}`);
      problems++;
    }
  }
}

// 4. No duplicate question text within a family.
for (const familyId of [...new Set(allCandidates.map((c) => c.familyId))]) {
  const questions = allCandidates.filter((c) => c.familyId === familyId).map((c) => c.question);
  const seen = new Set();
  for (const q of questions) {
    if (seen.has(q)) { console.log(`DUPLICATE question within ${familyId}: "${q}"`); problems++; }
    seen.add(q);
  }
}

// 5. Every family has >= 3 distinct blueprints (matching the Wave 2 precedent minimum), non-empty acceptedAnswers/explanationGuidance.
const familyCoverage = {};
for (const c of allCandidates) {
  familyCoverage[c.familyId] = familyCoverage[c.familyId] || { candidates: 0, blueprints: new Set(), difficulties: new Set(), passages: new Set() };
  familyCoverage[c.familyId].candidates++;
  familyCoverage[c.familyId].blueprints.add(c.blueprintId);
  familyCoverage[c.familyId].difficulties.add(c.difficulty);
  familyCoverage[c.familyId].passages.add(c.passageId);
  if (!c.acceptedAnswers || c.acceptedAnswers.length === 0) { console.log(`MISSING acceptedAnswers: ${c.candidateId}`); problems++; }
  if (!c.explanationGuidance) { console.log(`MISSING explanationGuidance: ${c.candidateId}`); problems++; }
}

console.log("Per-family coverage:");
for (const [familyId, cov] of Object.entries(familyCoverage)) {
  console.log(`  ${familyId}: ${cov.candidates} new candidates, ${cov.blueprints.size} distinct blueprints, ${cov.difficulties.size} distinct difficulty tiers, ${cov.passages.size} distinct passages`);
  if (cov.blueprints.size < 3) { console.log(`  WARNING: ${familyId} has fewer than 3 distinct blueprints`); problems++; }
}

console.log(`\nTotal new candidates: ${allCandidates.length}`);
console.log(`Total new blueprints: ${allBlueprints.length}`);
console.log(`Total distinct passages referenced: ${new Set(allCandidates.map((c) => c.passageId)).size}`);

console.log(`\n${problems === 0 ? "DETERMINISTIC VALIDATION: PASS -- every evidence quote verified verbatim against real passage text, 0 duplicate IDs, 0 duplicate questions, every family meets the 3-blueprint minimum." : `DETERMINISTIC VALIDATION: FAIL (${problems} problems)`}`);
process.exit(problems === 0 ? 0 : 1);
