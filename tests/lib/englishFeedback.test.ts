import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { englishCorrectAnswerReveal } from "@/lib/learningEngine/englishFeedback";

test("an accepted-answer question with no model answer reveals a correct answer", () => {
  assert.equal(englishCorrectAnswerReveal({ acceptedAnswers: ["a rope bridge"] }), "A correct answer is: a rope bridge.");
  assert.equal(englishCorrectAnswerReveal({ acceptedAnswers: ["wood", "timber", "oak"] }), "Correct answers include: wood or timber.");
});

test("ordered and multi-select answers are revealed in their own wording", () => {
  assert.match(englishCorrectAnswerReveal({ orderedAnswer: ["woke", "dressed", "left"] })!, /woke, then dressed, then left/);
  assert.match(englishCorrectAnswerReveal({ correctOptions: ["A", "C"] })!, /choices were: A; C/);
});

test("a written model answer is never duplicated, and nothing is invented when there is no answer data", () => {
  assert.equal(englishCorrectAnswerReveal({ modelAnswer: "It shows fear.", acceptedAnswers: ["x"] }), null);
  assert.equal(englishCorrectAnswerReveal({}), null);
  assert.equal(englishCorrectAnswerReveal({ acceptedAnswers: ["  ", ""] }), null);
});

test("the reveal and next-time strategy render only after submission and a wrong answer, in the Practice page only", () => {
  const src = fs.readFileSync("app/learning-intelligence/practice/[area]/page.tsx", "utf8");
  assert.match(src, /submitted && !lastCorrect && \(\(\) => \{\s*const reveal = englishCorrectAnswerReveal\(prompt\)/);
  assert.match(src, /submitted && !lastCorrect && strategyHint/);
  const mock = fs.readdirSync("app/learning-intelligence/mock-exam").join(" ");
  assert.ok(mock.length > 0);
  assert.doesNotMatch(fs.readFileSync("app/learning-intelligence/mock-exam/page.tsx", "utf8"), /englishCorrectAnswerReveal/);
});
