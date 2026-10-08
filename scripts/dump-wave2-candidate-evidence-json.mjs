import { WAVE2_SEQUENCING_CANDIDATES } from "../lib/ali/questionFactory/ei003Wave2SequencingFamily.ts";
import { WAVE2_COMPARATIVE_CANDIDATES } from "../lib/ali/questionFactory/ei003Wave2ComparativeFamily.ts";
import { WAVE2_EMOTION_CANDIDATES } from "../lib/ali/questionFactory/ei003Wave2EmotionFamily.ts";
import { WAVE2_ATMOSPHERE_CANDIDATES } from "../lib/ali/questionFactory/ei003Wave2AtmosphereFamily.ts";
import { WAVE2_WORD_CHOICE_CANDIDATES } from "../lib/ali/questionFactory/ei003Wave2WordChoiceFamily.ts";
import fs from "node:fs";

const all = [
  ...WAVE2_SEQUENCING_CANDIDATES,
  ...WAVE2_COMPARATIVE_CANDIDATES,
  ...WAVE2_EMOTION_CANDIDATES,
  ...WAVE2_ATMOSPHERE_CANDIDATES,
  ...WAVE2_WORD_CHOICE_CANDIDATES,
];
const compact = all.map((c) => ({ id: c.candidateId, passageId: c.passageId, familyId: c.familyId, blueprintId: c.blueprintId, quotes: c.evidenceQuotes }));
fs.writeFileSync(new URL("./output/wave2-candidate-evidence-dump.json", import.meta.url), JSON.stringify(compact));
console.log("wrote", compact.length, "candidates");
