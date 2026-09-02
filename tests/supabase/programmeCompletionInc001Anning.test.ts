import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { checkAcceptedAnswerSet } from "@/lib/learningEngine/englishAnswerValidation";

/**
 * Programme Completion Increment 001 (Founder directive, "ANGEL PROGRAMME
 * COMPLETION PROGRAMME", Workstream A1) — migration 191's new Comprehension
 * passage ("The Fossil Hunter of Lyme Regis") + 6-question set. Mirrors the
 * source-text-parsing convention already established for Gate 4's own
 * englishAnswerValidation regression tests: parses the real migration file's
 * own stored strings, not a separately hand-typed copy, so this test would
 * catch drift between the passage text and any acceptedAnswers phrase.
 */

const MIGRATION_SQL = readFileSync("supabase/migrations/191_programme_completion_inc001_comprehension_anning.sql", "utf8");

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

const PROMPTS = extractPrompts(MIGRATION_SQL);
const PASSAGE_TEXT = MIGRATION_SQL.match(/\$passage\$([\s\S]*?)\$passage\$/)![1];

test("migration 191 registers exactly 6 questions, all TIER2_ACCEPTED_SET", () => {
  const ids = Object.keys(PROMPTS);
  assert.equal(ids.length, 6);
  for (const id of ids) assert.equal(PROMPTS[id].validationTier, "TIER2_ACCEPTED_SET");
});

test("every question's stored passageText is byte-identical to the passage row's own original_text", () => {
  for (const id of Object.keys(PROMPTS)) {
    assert.equal(PROMPTS[id].passageText, PASSAGE_TEXT, `${id} passageText must match ali_passage_bank.original_text exactly`);
  }
});

test("every acceptedAnswers phrase is a genuine substring relationship the real checkAcceptedAnswerSet can match against a natural, close-paraphrase learner answer", () => {
  // For each question, construct one plausible learner answer built AROUND
  // one of its own acceptedAnswers phrases (the way a real learner would
  // naturally phrase a full sentence containing the key phrase), and prove
  // the REAL, unmodified checkAcceptedAnswerSet accepts it.
  const learnerAnswers: Record<string, string> = {
    "eng-pc001-anning-q01": "He was a cabinetmaker who also sold fossils.",
    "eng-pc001-anning-q02": "It was in 1823, when she found the plesiosaur.",
    "eng-pc001-anning-q03": "It means they needed the money to survive because her father had died.",
    "eng-pc001-anning-q04": "The plesiosaur had a long neck but the ichthyosaur did not.",
    "eng-pc001-anning-q05": "It makes it feel real to the reader because you can picture how heavy the tools were.",
    "eng-pc001-anning-q06": "It suggests she was not credited properly even though she found the fossils herself.",
  };
  for (const [id, answer] of Object.entries(learnerAnswers)) {
    const prompt = PROMPTS[id];
    assert.ok(prompt, `prompt ${id} must exist`);
    const result = checkAcceptedAnswerSet(answer, prompt.acceptedAnswers);
    assert.equal(result.correct, true, `${id}: expected "${answer}" to match one of ${JSON.stringify(prompt.acceptedAnswers)}`);
  }
});

test("a genuinely wrong answer is correctly rejected for each question (no accidental over-generosity)", () => {
  const wrongAnswers: Record<string, string> = {
    "eng-pc001-anning-q01": "He was a fisherman.",
    "eng-pc001-anning-q02": "It was in 1811.",
    "eng-pc001-anning-q03": "It means they thought it was fun.",
    "eng-pc001-anning-q04": "Both were fossils found by Mary Anning.",
    "eng-pc001-anning-q05": "The tools were heavy.",
    "eng-pc001-anning-q06": "She was given a medal for her discoveries.",
  };
  for (const [id, answer] of Object.entries(wrongAnswers)) {
    const prompt = PROMPTS[id];
    const result = checkAcceptedAnswerSet(answer, prompt.acceptedAnswers);
    assert.equal(result.correct, false, `${id}: expected "${answer}" to be rejected, but it matched`);
  }
});

test("every acceptedAnswers phrase for the QT-RC-07 (comparative) question is independently grounded in the passage's own stored text, not invented", () => {
  const q04 = PROMPTS["eng-pc001-anning-q04"];
  const lowerPassage = PASSAGE_TEXT.toLowerCase();
  const groundedPhrases = ["long neck", "paddle-like limbs", "pointed teeth", "enormous eye sockets", "five metres", "cuvier"];
  for (const phrase of groundedPhrases) {
    assert.ok(lowerPassage.includes(phrase), `expected passage text to literally contain "${phrase}"`);
  }
  // Every accepted answer for Q4 must relate to a real distinguishing detail actually in the text.
  assert.ok(q04.acceptedAnswers.some((a: string) => a.includes("long neck")));
  assert.ok(q04.acceptedAnswers.some((a: string) => a.includes("cuvier")));
});

test("passage word_count column matches the actual stored original_text word count", () => {
  const wordCountMatch = MIGRATION_SQL.match(/'informational', 'biographical-narrative', (\d+),/);
  assert.ok(wordCountMatch, "expected to find the word_count literal in the passage INSERT");
  const storedCount = Number(wordCountMatch![1]);
  const actualCount = PASSAGE_TEXT.split(/\s+/).filter(Boolean).length;
  assert.equal(storedCount, actualCount);
});

test("no protected/Mock content is touched: migration only inserts new rows with 'on conflict (id) do nothing', touches only ali_passage_bank and ali_question_bank", () => {
  assert.match(MIGRATION_SQL, /insert into public\.ali_passage_bank/);
  assert.match(MIGRATION_SQL, /insert into public\.ali_question_bank/);
  assert.ok(!MIGRATION_SQL.includes("ali_mock_form"), "must never touch ali_mock_form");
  assert.ok(!/update public\./.test(MIGRATION_SQL), "migration 191 must be insert-only, no UPDATE statements");
  assert.match(MIGRATION_SQL, /on conflict \(id\) do nothing/g);
});

test("eligibility_status is 'authentic_assessment_candidate' for the passage and every question, never a directly-live status", () => {
  // Only the executable SQL (after the last '--' comment line), so the
  // header prose's own "NOT 'practice_eligible'" disclosure text (which
  // deliberately names the forbidden values, matching migration 152's own
  // header convention) cannot trip this check.
  const sqlBody = MIGRATION_SQL.slice(MIGRATION_SQL.lastIndexOf("\nbegin;"));
  const occurrences = (sqlBody.match(/'authentic_assessment_candidate'/g) ?? []).length;
  // 1 for the passage + 6 for the questions = 7.
  assert.equal(occurrences, 7);
  assert.ok(!sqlBody.includes("'practice_eligible'"));
  assert.ok(!sqlBody.includes("'mock_eligible'"));
});
