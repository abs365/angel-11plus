import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { promptWritingTask } from "../../lib/adminReview";

/**
 * Decision 233 — Founder-reported live defect: the Bee passage and
 * "Somewhere New" review targets showed a perpetual "Loading content…",
 * and the "A Mistake You Learned From" / "Should Children Have Limits on
 * Screen Time?" targets showed "(no question text found)" / "(no model
 * answer found)". Root-caused: Continuous Writing rows (subject =
 * 'writing') store their authored task under `title`/`prompt`/
 * `checklist`/`timeMinutes` — never `question`/`modelAnswer`, which the
 * review surface's own `mapQuestionRow()` previously always read
 * regardless of content type. These tests prove the fix directly, both
 * as a pure-function unit test and against the REAL stored JSON in
 * migrations 098 (existing certified prompts) and 153 (Increment 001
 * candidates), so this is proven against real content, not merely a
 * synthetic fixture.
 */

// === promptWritingTask(): pure-function contract ============================

test("promptWritingTask() extracts title/prompt/checklist/timeMinutes/responseType from a genuine writing-shaped prompt object", () => {
  const result = promptWritingTask({
    id: "x", title: "My Title", prompt: "Write about something.", type: "descriptive",
    difficulty: "year6-exam", timeMinutes: 25, checklist: ["Do this", "Do that"],
  });
  assert.deepEqual(result, { title: "My Title", prompt: "Write about something.", checklist: ["Do this", "Do that"], timeMinutes: 25, responseType: "descriptive" });
});

test("promptWritingTask() returns null for a deterministic comprehension/Mathematics-shaped prompt (question/modelAnswer, no title/checklist)", () => {
  const result = promptWritingTask({ id: "x", marks: 1, question: "What is 2+2?", modelAnswer: "4", validationTier: "TIER2_ACCEPTED_SET" });
  assert.equal(result, null);
});

test("promptWritingTask() returns null for null/undefined/non-object input, never throws", () => {
  assert.equal(promptWritingTask(null), null);
  assert.equal(promptWritingTask(undefined), null);
  assert.equal(promptWritingTask("a string"), null);
  assert.equal(promptWritingTask(42), null);
});

test("promptWritingTask() returns null if checklist is missing or not a string array -- never fabricates a checklist that isn't genuinely stored", () => {
  assert.equal(promptWritingTask({ title: "T", prompt: "P" }), null);
  assert.equal(promptWritingTask({ title: "T", prompt: "P", checklist: "not an array" }), null);
  assert.equal(promptWritingTask({ title: "T", prompt: "P", checklist: [1, 2, 3] }), null);
});

test("promptWritingTask() tolerates a missing/non-numeric timeMinutes -- returns null for that field alone, not for the whole result", () => {
  const result = promptWritingTask({ title: "T", prompt: "P", checklist: ["a"] });
  assert.deepEqual(result, { title: "T", prompt: "P", checklist: ["a"], timeMinutes: null, responseType: null });
});

test("promptWritingTask() tolerates a missing/non-string type -- responseType is null for that field alone, not for the whole result", () => {
  const result = promptWritingTask({ title: "T", prompt: "P", checklist: ["a"], type: 42 });
  assert.deepEqual(result, { title: "T", prompt: "P", checklist: ["a"], timeMinutes: null, responseType: null });
});

// === Proven against REAL stored content (migrations 098 and 153) ===========

function extractPromptJson(sql: string, id: string): unknown {
  const re = new RegExp(`\\('${id}',[\\s\\S]*?\\$json\\$([\\s\\S]*?)\\$json\\$`);
  const m = sql.match(re);
  assert.ok(m, `expected to find a $json$ block for id ${id}`);
  return JSON.parse(m![1]);
}

const sql098 = fs.readFileSync("supabase/migrations/098_mock_writing_content_foundation.sql", "utf8");
const sql153 = fs.readFileSync("supabase/migrations/153_english_content_foundation_increment001_writing.sql", "utf8");

test("REGRESSION: the existing certified writing prompt (migration 098, 'mock-writing-mindchange-01') resolves through promptWritingTask() -- proves this was ALWAYS the real contract, not something new to Increment 001", () => {
  const prompt = extractPromptJson(sql098, "mock-writing-mindchange-01");
  const result = promptWritingTask(prompt);
  assert.ok(result);
  assert.equal(result!.title, "A Time You Changed Your Mind");
  assert.ok(result!.prompt.startsWith("Write about a time when you changed your mind"));
  assert.ok(result!.checklist.length >= 5);
});

for (const [id, expectedTitle] of [
  ["mock-writing-newplace-01", "Somewhere New"],
  ["mock-writing-mistakelearned-01", "A Mistake You Learned From"],
  ["mock-writing-screentime-01", "Should Children Have Limits on Screen Time?"],
] as const) {
  test(`REGRESSION: ${expectedTitle} (${id}, migration 153) resolves through promptWritingTask() with its own real, stored task text and checklist -- the authored content genuinely exists, this was a renderer defect, not a missing-content defect`, () => {
    const prompt = extractPromptJson(sql153, id);
    const result = promptWritingTask(prompt);
    assert.ok(result, `expected ${id} to resolve as a writing task`);
    assert.equal(result!.title, expectedTitle);
    assert.ok(result!.prompt.length > 30, "expected a real, substantial prompt string");
    assert.ok(result!.checklist.length >= 5, "expected a real checklist, not empty");
    assert.equal(result!.timeMinutes, 25);
  });

  test(`REGRESSION: ${id}'s own real stored prompt object has NO 'question' or 'modelAnswer' key -- confirms the OLD renderer's promptText(prompt, "question"/"modelAnswer") was always guaranteed to hit its own fallback text for this content type`, () => {
    const prompt = extractPromptJson(sql153, id) as Record<string, unknown>;
    assert.ok(!("question" in prompt), `${id} must not carry a 'question' key`);
    assert.ok(!("modelAnswer" in prompt), `${id} must not carry a 'modelAnswer' key`);
  });
}

// === page.tsx rendering: the fix is actually wired in =======================

const pageSource = fs.readFileSync("app/admin-beta/review/page.tsx", "utf8");

test("page.tsx defines a QuestionOrWritingTaskBody component that branches on subject === 'writing' && writingTask", () => {
  assert.match(pageSource, /function QuestionOrWritingTaskBody\(/);
  const block = pageSource.match(/function QuestionOrWritingTaskBody\([\s\S]*?\n}/)![0];
  assert.match(block, /question\.subject === "writing" && question\.writingTask/);
});

test("QuestionOrWritingTaskBody renders the real writingTask.prompt, never question.question, for writing content", () => {
  const block = pageSource.match(/function QuestionOrWritingTaskBody\([\s\S]*?\n}/)![0];
  const writingBranch = block.match(/if \(question\.subject === "writing"[\s\S]*?return \(([\s\S]*?)\);\s*\n\s*\}/)![1];
  assert.match(writingBranch, /\{w\.prompt\}/);
  assert.doesNotMatch(writingBranch, /\{question\.question\}/);
  assert.doesNotMatch(writingBranch, /\{question\.modelAnswer\}/);
});

test("QuestionOrWritingTaskBody explicitly discloses that no deterministic model answer is stored for Writing, rather than showing the misleading '(no model answer found)' fallback", () => {
  const block = pageSource.match(/function QuestionOrWritingTaskBody\([\s\S]*?\n}/)![0];
  assert.match(block, /No deterministic model answer is stored for Continuous Writing/);
});

test("QuestionOrWritingTaskBody renders the real checklist items for writing content", () => {
  const block = pageSource.match(/function QuestionOrWritingTaskBody\([\s\S]*?\n}/)![0];
  assert.match(block, /w\.checklist\.map/);
});

test("all three question-rendering call sites in ReviewForm use QuestionOrWritingTaskBody -- the grouped/passage branch, the family-sample branch, and the collapsed 'more examples' branch", () => {
  const occurrences = (pageSource.match(/<QuestionOrWritingTaskBody question=/g) || []).length;
  assert.equal(occurrences, 3, `expected exactly 3 call sites (grouped, sample, collapsed-more), found ${occurrences}`);
});

test("the grouped/passage-branch call site still passes the real sharedStem-aware display text for non-writing content via displayText, unaffected by the writing fix", () => {
  assert.match(pageSource, /<QuestionOrWritingTaskBody question=\{question\} displayText=\{sharedStem \? sharedStem\.tails\[index\] : undefined\} \/>/);
});

// === Understudy/Bee comprehension rendering is unaffected ====================

test("REGRESSION: deterministic comprehension content (subject !== 'writing') still renders question.question and question.modelAnswer exactly as before -- Understudy and Bee are unaffected by the Writing-specific branch", () => {
  const block = pageSource.match(/function QuestionOrWritingTaskBody\([\s\S]*?\n}/)![0];
  const fallbackBranch = block.match(/return \(\s*\n\s*<>\s*\n([\s\S]*?)\n\s*<\/>\s*\n\s*\);\s*\n}/)![1];
  assert.match(fallbackBranch, /\{displayText \?\? question\.question\}/);
  assert.match(fallbackBranch, /\{question\.modelAnswer\}/);
});

// === Loading / failure safety net (Section 7) ================================

test("ReviewForm's fetch useEffect is wrapped in try/catch/finally -- setLoading(false) can never be skipped by a thrown error, closing the perpetual-loading failure mode", () => {
  const effectBlock = pageSource.match(/useEffect\(\(\) => \{\s*\n\s*\(async \(\) => \{\s*\n\s*setLoading\(true\);[\s\S]*?\}, \[target\.id\]\);/)![0];
  assert.match(effectBlock, /try \{/);
  assert.match(effectBlock, /\} catch \(err\) \{/);
  assert.match(effectBlock, /\} finally \{\s*\n\s*setLoading\(false\);\s*\n\s*\}/);
});

test("a thrown fetch error is captured into fetchError with a real message, not swallowed", () => {
  const effectBlock = pageSource.match(/useEffect\(\(\) => \{\s*\n\s*\(async \(\) => \{\s*\n\s*setLoading\(true\);[\s\S]*?\}, \[target\.id\]\);/)![0];
  assert.match(effectBlock, /setFetchError\(`Content could not be loaded \(\$\{err instanceof Error \? err\.message : "unknown error"\}\)/);
});

test("a passage target whose passage is not found, or whose question set is empty, sets a specific fetchError -- never silently rendered as an empty review", () => {
  const effectBlock = pageSource.match(/useEffect\(\(\) => \{\s*\n\s*\(async \(\) => \{\s*\n\s*setLoading\(true\);[\s\S]*?\}, \[target\.id\]\);/)![0];
  assert.match(effectBlock, /if \(!p\) \{\s*\n\s*setFetchError\("The passage for this review target could not be found/);
  assert.match(effectBlock, /\} else if \(qs\.length === 0\) \{\s*\n\s*setFetchError\(`The passage/);
});

test("a sevenX (Writing) target that resolves to zero questions sets a specific fetchError -- never silently rendered as an empty review", () => {
  const effectBlock = pageSource.match(/useEffect\(\(\) => \{\s*\n\s*\(async \(\) => \{\s*\n\s*setLoading\(true\);[\s\S]*?\}, \[target\.id\]\);/)![0];
  assert.match(effectBlock, /if \(newQs\.length === 0\) \{\s*\n\s*setFetchError\(`No content could be retrieved/);
});

test("the ERROR state is rendered as a distinct, visible card ('Content unavailable'), separate from the LOADING and LOADED states", () => {
  assert.match(pageSource, /\{!loading && fetchError && \(/);
  assert.match(pageSource, /Content unavailable/);
});

test("decision submission is disabled, both in the button's own disabled attribute AND defensively inside handleSubmit itself, whenever fetchError is set", () => {
  assert.match(pageSource, /disabled=\{submitting \|\| !reviewerName\.trim\(\) \|\| !submission\.qualificationBasis\.trim\(\) \|\| !!fetchError\}/);
  assert.match(pageSource, /if \(fetchError\) \{\s*\n\s*setSubmitError\("Cannot submit: the content for this review target could not be loaded\. No decision can be recorded for content you have not been able to inspect\."\);/);
});

test("no fabricated deterministic model answer or score is invented anywhere for Writing content -- the disclosure text explicitly frames this as qualitative review, never a hidden mark", () => {
  const block = pageSource.match(/function QuestionOrWritingTaskBody\([\s\S]*?\n}/)![0];
  assert.match(block, /qualitative writing review/);
  assert.doesNotMatch(block, /\bmark(s)?\s*:\s*\d/i, "must never render a numeric mark for writing content");
});
