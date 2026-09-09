import { WAVE3_RETRIEVAL_CANDIDATES } from "../lib/ali/questionFactory/ei003Wave3RetrievalFamily.ts";
import { WAVE3_COMPARATIVE_CANDIDATES } from "../lib/ali/questionFactory/ei003Wave3ComparativeFamily.ts";
import { WAVE3_MOTIVE_CANDIDATES } from "../lib/ali/questionFactory/ei003Wave3MotiveFamily.ts";
import { WAVE3_LANGUAGE_EFFECT_CANDIDATES } from "../lib/ali/questionFactory/ei003Wave3LanguageEffectFamily.ts";

const allCandidates = [
  ...WAVE3_RETRIEVAL_CANDIDATES,
  ...WAVE3_COMPARATIVE_CANDIDATES,
  ...WAVE3_MOTIVE_CANDIDATES,
  ...WAVE3_LANGUAGE_EFFECT_CANDIDATES,
];

const byPassage = {};
for (const c of allCandidates) {
  byPassage[c.passageId] = byPassage[c.passageId] || { newCount: 0, families: new Set(), blueprints: new Set() };
  byPassage[c.passageId].newCount++;
  byPassage[c.passageId].families.add(c.familyId);
  byPassage[c.passageId].blueprints.add(c.blueprintId);
}

// Pre-existing counts per passage across these 4 families, confirmed live before this wave.
const PRE_EXISTING_COUNT_PER_FAMILY_PASSAGE = {
  "wave1-eng-kitemaker": 2,     // w1-kitemaker-09 (motive), w1-kitemaker-08 (language)
  "wave1-eng-lastbus": 3,       // w1-lastbus-09 (comparative), w1-lastbus-08 (language), + retrieval? none
  "wave1-eng-newgirl": 2,       // w1-newgirl-08 (comparative), w1-newgirl-09 (motive)
  "wave1-eng-atticdoor": 2,     // w1-atticdoor-09 (motive), w1-atticdoor-08 (language)
  "wave1-eng-raceday": 2,       // w1-raceday-08 (comparative), w1-raceday-09 (language)
  "wave1-eng-lettertonana": 2,  // w1-letter-08 (comparative), w1-letter-09 (motive)
  "wave3-eng-emptyclassroom": 1,
  "wave3-eng-lettertograndad": 1,
  "wave3-eng-bakersapprentice": 1,
  "wave1-eng-newtrainers": 0,
  "wave3-eng-newtrainers": 1,
  "wave3-eng-stormharbour": 1,
};

console.log("=== Wave 3 new-candidate passage distribution ===");
const rows = Object.entries(byPassage)
  .map(([id, v]) => ({
    id,
    newCount: v.newCount,
    families: v.families.size,
    blueprints: v.blueprints.size,
    preExisting: PRE_EXISTING_COUNT_PER_FAMILY_PASSAGE[id] ?? "unknown",
  }))
  .sort((a, b) => b.newCount - a.newCount);
console.table(rows);

const totalNew = allCandidates.length;
console.log(`Total new candidates: ${totalNew}`);
console.log(`Distinct passages used: ${Object.keys(byPassage).length}`);

const top2New = rows.slice(0, 2).reduce((s, r) => s + r.newCount, 0);
console.log(`Top-two passages' combined new-candidate share: ${top2New}/${totalNew} = ${((top2New / totalNew) * 100).toFixed(1)}%`);

console.log("\nPer-family candidate counts:");
const byFamily = {};
for (const c of allCandidates) byFamily[c.familyId] = (byFamily[c.familyId] || 0) + 1;
console.log(byFamily);

console.log("\nPer-family passage counts:");
const byFamilyPassages = {};
for (const c of allCandidates) {
  byFamilyPassages[c.familyId] = byFamilyPassages[c.familyId] || new Set();
  byFamilyPassages[c.familyId].add(c.passageId);
}
for (const [f, s] of Object.entries(byFamilyPassages)) console.log(`  ${f}: ${s.size} distinct passages`);
