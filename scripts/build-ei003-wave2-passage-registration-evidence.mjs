import { EI003_WAVE2_PASSAGES } from "../lib/ali/questionFactory/ei003Wave2Passages.ts";
import { WAVE2_SEQUENCING_CANDIDATES } from "../lib/ali/questionFactory/ei003Wave2SequencingFamily.ts";
import { WAVE2_COMPARATIVE_CANDIDATES } from "../lib/ali/questionFactory/ei003Wave2ComparativeFamily.ts";
import { WAVE2_EMOTION_CANDIDATES } from "../lib/ali/questionFactory/ei003Wave2EmotionFamily.ts";
import { WAVE2_ATMOSPHERE_CANDIDATES } from "../lib/ali/questionFactory/ei003Wave2AtmosphereFamily.ts";
import { WAVE2_WORD_CHOICE_CANDIDATES } from "../lib/ali/questionFactory/ei003Wave2WordChoiceFamily.ts";
import crypto from "node:crypto";

const allCandidates = [
  ...WAVE2_SEQUENCING_CANDIDATES,
  ...WAVE2_COMPARATIVE_CANDIDATES,
  ...WAVE2_EMOTION_CANDIDATES,
  ...WAVE2_ATMOSPHERE_CANDIDATES,
  ...WAVE2_WORD_CHOICE_CANDIDATES,
];

// Defensive CRLF -> LF normalisation, applied before hashing/comparison,
// per the Founder's explicit instruction. The source .ts file itself
// was independently confirmed to contain 0 CRLF bytes already (checked
// byte-for-byte), but this normalisation is applied regardless so the
// hash is defined against the CANONICAL form, not merely today's file
// state -- and the same normalisation is re-asserted inside the SQL
// migration itself (defence in depth against a copy/paste round-trip
// reintroducing CRLF before the Founder applies it).
function normalise(text) {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

function sha256(text) {
  return crypto.createHash("sha256").update(text, "utf8").digest("hex");
}

function wordCount(text) {
  return text.split(/\s+/).filter(Boolean).length;
}

const genreMap = {
  "ei003-w2-eng-the-relay-baton": "contemporary_realistic_fiction",
  "ei003-w2-eng-the-last-delivery": "fiction_narrative",
  "ei003-w2-eng-the-glass-frog": "nature_science",
  "ei003-w2-eng-the-clock-that-stopped": "human_interest_memoir",
  "ei003-w2-eng-crossing-the-fen": "travel_exploration",
  "ei003-w2-eng-the-attic-workshop": "descriptive_prose",
};

console.log("=== A. Six-passage manifest ===");
const manifest = EI003_WAVE2_PASSAGES.map((p) => {
  const norm = normalise(p.text);
  const rawHadCrlf = p.text !== norm;
  return {
    passageId: p.id,
    title: p.title,
    genre: p.genre ?? genreMap[p.id] ?? "unknown",
    charCount: norm.length,
    wordCount: wordCount(norm),
    sha256: sha256(norm),
    rawSourceHadCrlf: rawHadCrlf,
  };
});
console.table(manifest.map(({ sha256, ...rest }) => ({ ...rest, sha256: sha256.slice(0, 16) + "…" })));
console.log("Full hashes:");
for (const m of manifest) console.log(m.passageId, m.sha256);

console.log("\n=== B. 40-candidate dependency reconciliation ===");
const passageIds = new Set(EI003_WAVE2_PASSAGES.map((p) => p.id));
let resolved = 0;
const unresolved = [];
for (const c of allCandidates) {
  if (passageIds.has(c.passageId)) resolved++;
  else unresolved.push(c.candidateId);
}
console.log(`Resolved: ${resolved}/${allCandidates.length}`);
console.log(`Unresolved: ${unresolved.length}`, unresolved);

console.log("\n=== C. Quote/evidence integrity against normalised text ===");
const passageTextById = Object.fromEntries(EI003_WAVE2_PASSAGES.map((p) => [p.id, normalise(p.text)]));
let quoteProblems = 0;
for (const c of allCandidates) {
  const text = passageTextById[c.passageId];
  for (const q of c.evidenceQuotes) {
    if (!text.includes(q)) {
      quoteProblems++;
      console.log(`QUOTE MISMATCH: ${c.candidateId} -> "${q.slice(0, 60)}..."`);
    }
  }
}
console.log(`Quote problems: ${quoteProblems}`);

console.log("\n=== D. Per-passage candidate count (for cross-check against the exposure report) ===");
const byPassage = {};
for (const c of allCandidates) byPassage[c.passageId] = (byPassage[c.passageId] || 0) + 1;
console.log(byPassage);
