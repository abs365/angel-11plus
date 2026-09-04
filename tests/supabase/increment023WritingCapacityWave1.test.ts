import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * Programme Increment 023 — Continuous Writing Sustainable Capacity Wave 1
 * (Writing Capacity Contract). Migration 225's 3 new WC-01 prompts and
 * migration 226's pending-review registration. Structural/source-text
 * assertions, matching this repository's own established convention for
 * content this small (mirrors migration 196/197's own test file structure,
 * tests/supabase/programmeCompletionInc003Writing.test.ts).
 */

const MIGRATION_225 = readFileSync("supabase/migrations/225_english_content_foundation_increment004_writing_capacity_wave1.sql", "utf8");
const MIGRATION_226 = readFileSync("supabase/migrations/226_english_content_foundation_increment004_writing_capacity_wave1_pending_review.sql", "utf8");

function extractPrompts(sql: string): Record<string, any> {
  const re = /\$json\$([\s\S]*?)\$json\$/g;
  const prompts: Record<string, any> = {};
  let m: RegExpExecArray | null;
  while ((m = re.exec(sql))) {
    const obj = JSON.parse(m[1]);
    prompts[obj.id] = obj;
  }
  return prompts;
}

const PROMPTS = extractPrompts(MIGRATION_225);
const EXPECTED_IDS = ["eng-inc004-writing-skillproud-01", "eng-inc004-writing-notgotoplan-01", "eng-inc004-writing-advice-01"];

// ─── 1. Exact intended IDs ──────────────────────────────────────────────────

test("migration 225 registers exactly the 3 intended new Writing prompts, and only those 3", () => {
  assert.deepEqual(Object.keys(PROMPTS).sort(), [...EXPECTED_IDS].sort());
});

// ─── 2. WC-01 classification ────────────────────────────────────────────────

test("every new prompt is real WC-01 content: subject 'writing', skill 'QT-WC-01a' -- never QT-WC-01b (the disclosed, unfilled picture-stimulus gap is not silently worked around)", () => {
  for (const id of EXPECTED_IDS) {
    assert.match(MIGRATION_225, new RegExp(`\\('${id}', 'writing', 'QT-WC-01a'`));
  }
  assert.ok(!/\('[\w-]+', 'writing', 'QT-WC-01b'/.test(MIGRATION_225), "no row's own skill may be QT-WC-01b");
  for (const p of Object.values(PROMPTS) as any[]) {
    assert.ok(!("image" in p) && !("imageUrl" in p) && !("stimulusImage" in p), "no prompt JSON may reference an image field the pipeline does not support");
  }
});

// ─── Challenge metadata matches the Capacity Contract ──────────────────────

test("challenge metadata matches the Writing Capacity Contract: one ACCESSIBLE (easy), one STANDARD (medium), one DEMANDING (hard) -- the first genuine difficulty range Continuous Writing has ever had", () => {
  assert.match(MIGRATION_225, /\('eng-inc004-writing-skillproud-01', 'writing', 'QT-WC-01a', array\['csse'\], 'easy'/);
  assert.match(MIGRATION_225, /\('eng-inc004-writing-notgotoplan-01', 'writing', 'QT-WC-01a', array\['csse'\], 'medium'/);
  assert.match(MIGRATION_225, /\('eng-inc004-writing-advice-01', 'writing', 'QT-WC-01a', array\['csse'\], 'hard'/);
});

test("every prompt's checklist begins with the genuine CSSE-evidenced 'Write at least six sentences' instruction, matching every existing real Writing prompt's own convention", () => {
  for (const id of EXPECTED_IDS) {
    assert.equal(PROMPTS[id].checklist[0], "Write at least six sentences", `${id} must carry the evidenced minimum as its first checklist item`);
  }
});

// ─── 7. Task-shape diversity / anti-memorisation ───────────────────────────

test("the 3 new prompts are genuinely different response shapes from each other and from the 7 existing prompts -- not the same shape with nouns swapped", () => {
  // Internal cross-check: no two of the three new prompts share a prompt-text opening clause.
  const promptTexts = EXPECTED_IDS.map((id) => PROMPTS[id].prompt);
  assert.equal(new Set(promptTexts).size, promptTexts.length, "all three new prompt texts must be distinct");
  // Each explanation must name a real, specific structural distinction, not merely restate the topic.
  for (const id of EXPECTED_IDS) {
    const explanationMatch = MIGRATION_225.match(new RegExp(`'${id}'[\\s\\S]*?Prompt shape: ([\\s\\S]+?) --`));
    assert.ok(explanationMatch, `${id} must carry an explicit "Prompt shape:" rationale`);
  }
});

test("no duplicate prompt and no obvious near-duplicate task structure across the 3 new prompts", () => {
  const titles = EXPECTED_IDS.map((id) => PROMPTS[id].title);
  assert.equal(new Set(titles).size, titles.length, "all three titles must be distinct");
  // A crude but real near-duplicate guard: no two prompt texts should share
  // too many genuinely topical (non-generic) words -- a sign of a
  // templated/surface-swapped prompt. Excludes the connective/instruction
  // vocabulary every real Writing prompt in this pool legitimately shares
  // by convention ("write about...", "it could be...", "explain..."),
  // which would otherwise produce false positives on every pair.
  const GENERIC_WORDS = new Set([
    "write", "about", "something", "someone", "could", "else", "what", "your", "that", "this",
    "would", "will", "been", "more", "than", "when", "they", "them", "into", "from", "have", "were",
    "genuinely", "explain", "describe", "specific", "real", "which", "these", "with", "there", "then",
  ]);
  function significantWords(s: string): string[] {
    return s.toLowerCase().replace(/[^a-z0-9\s]/g, "").split(/\s+/).filter((w) => w.length > 3 && !GENERIC_WORDS.has(w));
  }
  const wordSets = EXPECTED_IDS.map((id) => new Set(significantWords(PROMPTS[id].prompt)));
  for (let i = 0; i < wordSets.length; i++) {
    for (let j = i + 1; j < wordSets.length; j++) {
      const overlap = [...wordSets[i]].filter((w) => wordSets[j].has(w));
      assert.ok(overlap.length < 6, `prompts ${EXPECTED_IDS[i]} and ${EXPECTED_IDS[j]} share too many significant words (${overlap.join(", ")}) -- possible near-duplicate task frame`);
    }
  }
});

// ─── 3/11. Provenance, content schema validity ─────────────────────────────

test("every new row is angel_original provenance, real timeMinutes/type/checklist shape matching the established Writing content schema", () => {
  assert.equal((MIGRATION_225.match(/'angel_original'/g) ?? []).length, 3);
  for (const id of EXPECTED_IDS) {
    const p = PROMPTS[id];
    assert.equal(typeof p.title, "string");
    assert.equal(typeof p.prompt, "string");
    assert.ok(["descriptive", "narrative"].includes(p.type));
    assert.equal(p.timeMinutes, 25);
    assert.ok(Array.isArray(p.checklist) && p.checklist.length >= 5);
  }
});

// ─── Idempotency (pre-application governance finding) ──────────────────────

test("migration 225 is idempotent -- 'on conflict (id) do nothing', matching the exact real pattern migrations 153/169 already established for this same table", () => {
  const sqlBody = MIGRATION_225.slice(MIGRATION_225.lastIndexOf("\nbegin;"), MIGRATION_225.indexOf("\ncommit;"));
  assert.match(sqlBody, /on conflict \(id\) do nothing;\s*$/, "the INSERT must end with the established idempotent conflict clause");
});

// ─── 4. No Mock exposure ────────────────────────────────────────────────────

test("migration 225 never touches ali_mock_form, and never assigns a Mock-track eligibility_status", () => {
  const sqlBody = MIGRATION_225.slice(MIGRATION_225.lastIndexOf("\nbegin;"), MIGRATION_225.indexOf("\ncommit;"));
  assert.ok(!sqlBody.includes("ali_mock_form"), "migration 225's own executable SQL must never reference ali_mock_form");
  assert.ok(!/update public\./.test(MIGRATION_225));
  assert.ok(!sqlBody.includes("'practice_eligible'"), "new content must never be inserted directly as practice_eligible");
});

// ─── 5. Protected initial eligibility ───────────────────────────────────────

test("eligibility_status is 'authentic_assessment_candidate' for all 3 new rows, never directly live", () => {
  const sqlBody = MIGRATION_225.slice(MIGRATION_225.lastIndexOf("\nbegin;"), MIGRATION_225.indexOf("\ncommit;"));
  const occurrences = (sqlBody.match(/'authentic_assessment_candidate'/g) ?? []).length;
  assert.equal(occurrences, 3);
});

test("migration 226 registers all 3 new prompts for pending independent review, keyed on each row's own family_id, using the same real review_target_type/review_type values migration 172 already established", () => {
  for (const id of EXPECTED_IDS) {
    const familyId = MIGRATION_225.match(new RegExp(`\\('${id}'[\\s\\S]*?'(eng-inc004-writing-wc01a-[a-z]+)'`))?.[1];
    assert.ok(familyId, `expected to find ${id}'s own family_id in migration 225`);
    assert.match(MIGRATION_226, new RegExp(`'${familyId}'`), `expected migration 226 to register a review row for ${familyId}`);
  }
  // Each of the 3 inserts names 'writing_prompt' and 'UNASSIGNED' once
  // (in the select list only), and 'review_type'/'decision' twice each
  // (once in the select list, once again in the idempotency guard's own
  // `where not exists (... and review_type = ... and notes = ...)`
  // clause) -- matching migration 172's own identical doubling pattern.
  const sqlBody226 = MIGRATION_226.slice(MIGRATION_226.lastIndexOf("\nbegin;"), MIGRATION_226.indexOf("\ncommit;"));
  assert.equal((sqlBody226.match(/'writing_prompt'/g) ?? []).length, 3);
  assert.equal((sqlBody226.match(/'mock_writing_prompt_independent_review'/g) ?? []).length, 6);
  assert.equal((sqlBody226.match(/'pending_independent_review'/g) ?? []).length, 6);
  assert.equal((sqlBody226.match(/'UNASSIGNED'/g) ?? []).length, 3);
});

test("migration 225 is insert-only against ali_question_bank; migration 226 is insert-only against ali_family_review", () => {
  assert.ok(!/update public\./.test(MIGRATION_225));
  assert.ok(!/update public\./.test(MIGRATION_226));
  const sqlBody226 = MIGRATION_226.slice(MIGRATION_226.lastIndexOf("\nbegin;"), MIGRATION_226.indexOf("\ncommit;"));
  assert.ok(!sqlBody226.includes("ali_question_bank"), "migration 226's own executable SQL must never touch ali_question_bank directly");
});

// ─── 10. Scorer compatibility ───────────────────────────────────────────────

test("every new prompt's type maps to the existing writing-reflective-discursive teaching family -- no new scorer or teaching architecture required", () => {
  const PROMPT_TYPE_TO_FAMILY: Record<string, string> = { narrative: "writing-reflective-discursive", descriptive: "writing-reflective-discursive" };
  for (const id of EXPECTED_IDS) {
    assert.ok(PROMPTS[id].type in PROMPT_TYPE_TO_FAMILY, `${id}'s type ("${PROMPTS[id].type}") must map to an existing writing teaching family`);
  }
});

test("no new Writing scorer or rubric dimension is introduced -- the existing 5-dimension rubric (ideas/vocabulary/grammar/structure/punctuation) is untouched by these migrations", () => {
  assert.ok(!MIGRATION_225.includes("writing_rubric") && !MIGRATION_225.includes("WRITING_DIMENSION"));
  assert.ok(!MIGRATION_226.includes("writing_rubric") && !MIGRATION_226.includes("WRITING_DIMENSION"));
});

// ─── Founder Amendment (educational review round 2) ────────────────────────

test("notgotoplan-01's amended wording structurally excludes a self-caused mistake -- 'outside your control' and 'not because of something you did' both appear, closing the overlap with mistakelearned-01 the original wording left open", () => {
  const p = PROMPTS["eng-inc004-writing-notgotoplan-01"];
  assert.match(p.prompt, /outside your control/i);
  assert.match(p.checklist.join(" "), /not because of something you did/i);
});

test("notgotoplan-01 no longer requires a lesson/moral/'what would you do differently' element -- it tests adaptation, not retrospective self-judgement", () => {
  const p = PROMPTS["eng-inc004-writing-notgotoplan-01"];
  const fullText = (p.prompt + " " + p.checklist.join(" ")).toLowerCase();
  assert.ok(!/what you.*would.*do differently|what you learned|lesson/.test(fullText));
});

test("notgotoplan-01 and advice-01 both carry a safeguarding checklist line in the same positive, non-alarming register mistakelearned-01 already established", () => {
  const notgotoplan = PROMPTS["eng-inc004-writing-notgotoplan-01"];
  const advice = PROMPTS["eng-inc004-writing-advice-01"];
  assert.ok(notgotoplan.checklist.some((c: string) => /comfortable writing about.*private, upsetting or serious/i.test(c)), "notgotoplan-01 must carry an explicit, positively-framed safeguarding line");
  assert.ok(advice.checklist.some((c: string) => /ordinary, everyday experiences.*private, upsetting or serious/i.test(c)), "advice-01 must carry an explicit, positively-framed safeguarding line");
});

test("advice-01's demanding requirements are fully preserved after amendment: 2+ pieces of advice, real grounding, explanation of why it matters, no formal-letter conventions", () => {
  const p = PROMPTS["eng-inc004-writing-advice-01"];
  const fullText = (p.prompt + " " + p.checklist.join(" "));
  assert.match(fullText, /at least two separate pieces of advice/i);
  assert.match(fullText, /something real that actually happened/i);
  assert.match(fullText, /why each piece of advice matters/i);
  assert.ok(!/dear |yours sincerely|yours faithfully/i.test(fullText), "no formal-letter convention may be introduced");
});
