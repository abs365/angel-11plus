import { WAVE2_SEQUENCING_CANDIDATES } from "../lib/ali/questionFactory/ei003Wave2SequencingFamily.ts";
import { WAVE2_COMPARATIVE_CANDIDATES } from "../lib/ali/questionFactory/ei003Wave2ComparativeFamily.ts";
import { WAVE2_EMOTION_CANDIDATES } from "../lib/ali/questionFactory/ei003Wave2EmotionFamily.ts";
import { WAVE2_ATMOSPHERE_CANDIDATES } from "../lib/ali/questionFactory/ei003Wave2AtmosphereFamily.ts";
import { WAVE2_WORD_CHOICE_CANDIDATES } from "../lib/ali/questionFactory/ei003Wave2WordChoiceFamily.ts";
import { EI003_WAVE2_PASSAGES } from "../lib/ali/questionFactory/ei003Wave2Passages.ts";

const all = [
  ...WAVE2_SEQUENCING_CANDIDATES,
  ...WAVE2_COMPARATIVE_CANDIDATES,
  ...WAVE2_EMOTION_CANDIDATES,
  ...WAVE2_ATMOSPHERE_CANDIDATES,
  ...WAVE2_WORD_CHOICE_CANDIDATES,
];

const byPassage = {};
for (const c of all) {
  byPassage[c.passageId] = byPassage[c.passageId] || { count: 0, families: new Set(), blueprints: new Set() };
  byPassage[c.passageId].count += 1;
  byPassage[c.passageId].families.add(c.familyId);
  byPassage[c.passageId].blueprints.add(c.blueprintId);
}

const rows = Object.entries(byPassage)
  .map(([id, v]) => ({
    id,
    title: EI003_WAVE2_PASSAGES.find((p) => p.id === id)?.title ?? "(unknown)",
    genre: EI003_WAVE2_PASSAGES.find((p) => p.id === id)?.genre ?? "(unknown)",
    count: v.count,
    pct: ((v.count / all.length) * 100).toFixed(1) + "%",
    families: v.families.size,
    blueprints: v.blueprints.size,
  }))
  .sort((a, b) => b.count - a.count);

console.log("Total candidates:", all.length);
console.table(rows);

const top2 = rows.slice(0, 2).reduce((s, r) => s + r.count, 0);
console.log(`Top-two combined: ${top2}/${all.length} = ${((top2 / all.length) * 100).toFixed(1)}%`);

// Family counts
const byFamily = {};
for (const c of all) byFamily[c.familyId] = (byFamily[c.familyId] || 0) + 1;
console.log("Per-family candidate counts:", byFamily);

// Blueprint representation
const blueprints = new Set(all.map((c) => c.blueprintId));
console.log("Distinct blueprints represented:", blueprints.size);

// Genre distribution
const byGenre = {};
for (const c of all) {
  const genre = EI003_WAVE2_PASSAGES.find((p) => p.id === c.passageId)?.genre ?? "(unknown)";
  byGenre[genre] = (byGenre[genre] || 0) + 1;
}
console.log("Genre distribution:", byGenre);
