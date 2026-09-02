import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { checkAcceptedAnswerSet } from "@/lib/learningEngine/englishAnswerValidation";

/**
 * Programme Completion Increment 003 (Founder directive) — migration 193's
 * new dialogue-driven Comprehension passage ("Two Different Projects") + its
 * 6-question set. Mirrors the exact conventions established for migration
 * 191's own test file (tests/supabase/programmeCompletionInc001Anning.test.ts).
 */

const MIGRATION_SQL = readFileSync("supabase/migrations/193_programme_completion_inc003_comprehension_groupproject.sql", "utf8");

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

test("migration 193 registers exactly 6 questions, all TIER2_ACCEPTED_SET", () => {
  const ids = Object.keys(PROMPTS);
  assert.equal(ids.length, 6);
  for (const id of ids) assert.equal(PROMPTS[id].validationTier, "TIER2_ACCEPTED_SET");
});

test("no question uses QT-RC-07 -- deliberately avoiding a second instance of the templated comparative shape this increment's own portfolio already closed via migration 191", () => {
  for (const id of Object.keys(PROMPTS)) {
    const questionType = MIGRATION_SQL.match(new RegExp(`\\('${id}'.*?'(QT-RC-\\d+)'`, "s"))?.[1];
    assert.notEqual(questionType, "QT-RC-07", `${id} must not use QT-RC-07`);
  }
});

test("the passage is genuinely dialogue-driven: the large majority of paragraphs are direct speech, not narration containing occasional dialogue", () => {
  const paragraphs = PASSAGE_TEXT.split("\n\n");
  const dialogueParagraphs = paragraphs.filter((p) => p.trim().startsWith('"') || /"\w|"\./.test(p.slice(0, 3)));
  // At least half the paragraphs should open directly on quoted speech.
  assert.ok(dialogueParagraphs.length >= paragraphs.length * 0.5, `expected most paragraphs to open on dialogue, got ${dialogueParagraphs.length}/${paragraphs.length}`);
});

test("every question's stored passageText is byte-identical to the passage row's own original_text", () => {
  for (const id of Object.keys(PROMPTS)) {
    assert.equal(PROMPTS[id].passageText, PASSAGE_TEXT, `${id} passageText must match ali_passage_bank.original_text exactly`);
  }
});

test("every acceptedAnswers phrase is matchable by the real checkAcceptedAnswerSet against a natural, close-paraphrase learner answer", () => {
  const learnerAnswers: Record<string, string> = {
    "eng-pc003-groupproject-q01": "Miss Okafor said a report was fine.",
    "eng-pc003-groupproject-q02": "Rosie is three years old.",
    "eng-pc003-groupproject-q03": "He seems tired and a bit short with her.",
    "eng-pc003-groupproject-q04": "He means he doesn't want to spend the whole weekend on the project.",
    "eng-pc003-groupproject-q05": "It shows he didn't mean to sound unkind, it just slipped out.",
    "eng-pc003-groupproject-q06": "It suggests he felt embarrassed and didn't want to make a big deal of it.",
  };
  for (const [id, answer] of Object.entries(learnerAnswers)) {
    const prompt = PROMPTS[id];
    assert.ok(prompt, `prompt ${id} must exist`);
    const result = checkAcceptedAnswerSet(answer, prompt.acceptedAnswers);
    assert.equal(result.correct, true, `${id}: expected "${answer}" to match one of ${JSON.stringify(prompt.acceptedAnswers)}`);
  }
});

test("a genuinely wrong answer is correctly rejected for each question", () => {
  const wrongAnswers: Record<string, string> = {
    "eng-pc003-groupproject-q01": "She said they had to build a model.",
    "eng-pc003-groupproject-q02": "Rosie is four.",
    "eng-pc003-groupproject-q03": "He seems really excited about the project.",
    "eng-pc003-groupproject-q04": "He means he wants to work every weekend.",
    "eng-pc003-groupproject-q05": "It shows Ben is genuinely angry with Zara.",
    "eng-pc003-groupproject-q06": "He forgot to mention it because he wasn't paying attention.",
  };
  for (const [id, answer] of Object.entries(wrongAnswers)) {
    const prompt = PROMPTS[id];
    const result = checkAcceptedAnswerSet(answer, prompt.acceptedAnswers);
    assert.equal(result.correct, false, `${id}: expected "${answer}" to be rejected, but it matched`);
  }
});

test("total marks is 11 (1+1+2+2+2+3)", () => {
  const total = Object.values(PROMPTS).reduce((sum: number, p: any) => sum + p.marks, 0);
  assert.equal(total, 11);
});

test("eligibility_status is 'authentic_assessment_candidate' for the passage and every question, never a directly-live status", () => {
  const sqlBody = MIGRATION_SQL.slice(MIGRATION_SQL.lastIndexOf("\nbegin;"));
  const occurrences = (sqlBody.match(/'authentic_assessment_candidate'/g) ?? []).length;
  assert.equal(occurrences, 7);
  assert.ok(!sqlBody.includes("'practice_eligible'"));
  assert.ok(!sqlBody.includes("'mock_eligible'"));
});

test("no protected/Mock content is touched", () => {
  assert.match(MIGRATION_SQL, /insert into public\.ali_passage_bank/);
  assert.match(MIGRATION_SQL, /insert into public\.ali_question_bank/);
  assert.ok(!MIGRATION_SQL.includes("ali_mock_form"));
  assert.ok(!/update public\./.test(MIGRATION_SQL));
});
