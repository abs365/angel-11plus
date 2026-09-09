// Educational Increment 003, Wave 2 -- deterministic validation of the
// hand-authored English manifest: every evidence quote must be a genuine,
// exact substring of its own passage's real text (never asserted without
// a quotable anchor), every candidate must reference a real passage and a
// real blueprint in its own family, all IDs must be unique, and per-family
// coverage must meet the plan's own §Q-style minimums.
import { EI003_WAVE2_PASSAGES } from "../lib/ali/questionFactory/ei003Wave2Passages.ts";
import { WAVE2_SEQUENCING_BLUEPRINTS, WAVE2_SEQUENCING_CANDIDATES } from "../lib/ali/questionFactory/ei003Wave2SequencingFamily.ts";
import { WAVE2_COMPARATIVE_BLUEPRINTS, WAVE2_COMPARATIVE_CANDIDATES } from "../lib/ali/questionFactory/ei003Wave2ComparativeFamily.ts";
import { WAVE2_EMOTION_BLUEPRINTS, WAVE2_EMOTION_CANDIDATES } from "../lib/ali/questionFactory/ei003Wave2EmotionFamily.ts";
import { WAVE2_ATMOSPHERE_BLUEPRINTS, WAVE2_ATMOSPHERE_CANDIDATES } from "../lib/ali/questionFactory/ei003Wave2AtmosphereFamily.ts";
import { WAVE2_WORD_CHOICE_BLUEPRINTS, WAVE2_WORD_CHOICE_CANDIDATES } from "../lib/ali/questionFactory/ei003Wave2WordChoiceFamily.ts";

const ALL_BLUEPRINTS = [
  ...WAVE2_SEQUENCING_BLUEPRINTS, ...WAVE2_COMPARATIVE_BLUEPRINTS, ...WAVE2_EMOTION_BLUEPRINTS,
  ...WAVE2_ATMOSPHERE_BLUEPRINTS, ...WAVE2_WORD_CHOICE_BLUEPRINTS,
];
const ALL_CANDIDATES = [
  ...WAVE2_SEQUENCING_CANDIDATES, ...WAVE2_COMPARATIVE_CANDIDATES, ...WAVE2_EMOTION_CANDIDATES,
  ...WAVE2_ATMOSPHERE_CANDIDATES, ...WAVE2_WORD_CHOICE_CANDIDATES,
];

const passageById = new Map(EI003_WAVE2_PASSAGES.map((p) => [p.id, p]));
const blueprintById = new Map(ALL_BLUEPRINTS.map((b) => [b.blueprintId, b]));

const problems = [];

// 1. Blueprint ID uniqueness.
const bpIds = ALL_BLUEPRINTS.map((b) => b.blueprintId);
if (new Set(bpIds).size !== bpIds.length) problems.push("duplicate blueprintId found");

// 2. Candidate ID uniqueness.
const candIds = ALL_CANDIDATES.map((c) => c.candidateId);
if (new Set(candIds).size !== candIds.length) problems.push("duplicate candidateId found");

// 3. Every candidate references a real passage and a real blueprint in its own family.
for (const c of ALL_CANDIDATES) {
  const passage = passageById.get(c.passageId);
  if (!passage) { problems.push(`${c.candidateId}: unknown passageId ${c.passageId}`); continue; }
  const bp = blueprintById.get(c.blueprintId);
  if (!bp) { problems.push(`${c.candidateId}: unknown blueprintId ${c.blueprintId}`); continue; }
  if (bp.familyId !== c.familyId) problems.push(`${c.candidateId}: familyId mismatch (candidate=${c.familyId}, blueprint=${bp.familyId})`);

  // 4. THE core integrity check: every evidence quote must be an EXACT substring of the real passage text.
  for (const quote of c.evidenceQuotes) {
    if (!passage.text.includes(quote)) {
      problems.push(`${c.candidateId}: evidence quote NOT FOUND verbatim in passage "${c.passageId}": "${quote}"`);
    }
  }
  if (c.evidenceQuotes.length === 0) problems.push(`${c.candidateId}: zero evidence quotes -- every candidate must cite real, checkable evidence`);
  if (!c.acceptedAnswers || c.acceptedAnswers.length === 0) problems.push(`${c.candidateId}: zero accepted answers`);
  if (!c.explanationGuidance || c.explanationGuidance.trim().length === 0) problems.push(`${c.candidateId}: missing explanationGuidance`);
}

// 5. Per-family coverage summary + minimums.
const byFamily = {};
for (const c of ALL_CANDIDATES) (byFamily[c.familyId] ??= []).push(c);
console.log("Per-family coverage:");
for (const [fam, cands] of Object.entries(byFamily)) {
  const distinctBp = new Set(cands.map((c) => c.blueprintId)).size;
  const distinctDiff = new Set(cands.map((c) => c.difficulty)).size;
  const distinctPassages = new Set(cands.map((c) => c.passageId)).size;
  console.log(`  ${fam}: ${cands.length} new candidates, ${distinctBp} distinct blueprints, ${distinctDiff} distinct difficulty tiers, ${distinctPassages} distinct passages`);
  if (distinctBp < 3) problems.push(`${fam}: only ${distinctBp} distinct blueprints (minimum 3 per the plan's own §P/§Q standard)`);
}

// 6. Near-duplicate check: no two candidates in the same family share an identical question string.
for (const [fam, cands] of Object.entries(byFamily)) {
  const seen = new Map();
  for (const c of cands) {
    const norm = c.question.toLowerCase().replace(/\s+/g, " ").trim();
    if (seen.has(norm)) problems.push(`${fam}: duplicate question text between ${seen.get(norm)} and ${c.candidateId}`);
    seen.set(norm, c.candidateId);
  }
}

console.log(`\nTotal new candidates: ${ALL_CANDIDATES.length}`);
console.log(`Total new blueprints: ${ALL_BLUEPRINTS.length}`);
console.log(`Total new passages: ${EI003_WAVE2_PASSAGES.length}`);

if (problems.length > 0) {
  console.error(`\nVALIDATION FAILED: ${problems.length} problems`);
  for (const p of problems) console.error(`  - ${p}`);
  process.exit(1);
}
console.log("\nDETERMINISTIC VALIDATION: PASS -- every evidence quote verified verbatim against real passage text, 0 duplicate IDs, 0 duplicate questions, every family meets the 3-blueprint minimum.");
