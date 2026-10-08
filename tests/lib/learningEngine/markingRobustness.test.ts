import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { coordinateAnswersMatch, isCoordinateAnswer, parseCoordinateAnswer } from "@/lib/learningEngine/coordinateAnswer";
import { checkMathsAnswer } from "@/lib/learningEngine/practiceContent";
import { parseOrderedAnswer, scoreEnglishComprehensionAnswer, type EnglishPromptValidationFields } from "@/lib/learningEngine/englishAnswerValidation";
import { scoreEnglishAnswer } from "@/lib/learningEngine/practiceContent";
import { computeReadingScoringOutcome } from "@/lib/mockAttempt/readingScoringOrchestration";

// ---- A. coordinate answers --------------------------------------------------------------------------------------------
// The same cases were run read-only against production SQL with the migration-274 expression; expected values are those results.
const COORD_CASES: [string, string, boolean][] = [
  ["(9, 5)", "(9, 5)", true], ["(9, 5)", "(9,5)", true], ["(9, 5)", "( 9 , 5 )", true], ["(9, 5)", "(9.0, 5)", true], ["(9, 5)", " (9,5) ", true],
  ["(7, -4)", "(7,-4)", true], ["(7, -4)", "(7,−4)", true], ["(-3, 6)", "(-3,6)", true],
  ["(9, 5)", "9, 5", false], ["(9, 5)", "(5, 9)", false], ["(9, 5)", "(9, 5, 1)", false], ["(9, 5)", "(9;5)", false], ["(9, 5)", "(nine, 5)", false],
  ["(9, 5)", "(9, 5", false], ["(9, 5)", "(9, 6)", false], ["(-3, 6)", "(3, 6)", false], ["(9, 5)", "(9 5)", false], ["(9, 5)", "(9,,5)", false],
];

test("coordinate normaliser: harmless spacing, minus sign and .0 are equivalent; malformed or different answers are rejected (parity with the SQL cases)", () => {
  for (const [stored, resp, expected] of COORD_CASES) {
    assert.equal(coordinateAnswersMatch(resp, stored), expected, `${stored} vs ${JSON.stringify(resp)}`);
    assert.equal(checkMathsAnswer(resp, stored), expected, `Practice marker ${stored} vs ${JSON.stringify(resp)}`);
  }
});

test("coordinate normaliser applies ONLY to coordinate-type stored answers; nothing else is loosened", () => {
  assert.equal(isCoordinateAnswer("(9, 5)"), true);
  for (const notCoord of ["9", "9, 5", "2.10", "15:50", "true", "B", "(9)", "(9, 5, 1)", "(a, b)", "3/4", "£12"]) assert.equal(isCoordinateAnswer(notCoord), false, notCoord);
  assert.deepEqual(parseCoordinateAnswer("( 3 , -4.5 )"), { x: 3, y: -4.5 });
  assert.equal(parseCoordinateAnswer("(3,)"), null);
  // exact-text answers keep their exact-text behaviour (times, words), numeric answers keep numeric behaviour
  assert.equal(checkMathsAnswer("15:50", "15:50"), true);
  assert.equal(checkMathsAnswer("1550", "15:50"), false);
  assert.equal(checkMathsAnswer("2.1", "2.10"), true);
  assert.equal(checkMathsAnswer("(9,5)", "9, 5"), false, "a bracketed response is not accepted for a non-coordinate stored answer");
});

test("migration 274 template changes only the coordinate branch of the Mock scorer and is not applied", () => {
  const sql = fs.readFileSync("supabase/migrations/274_mock_maths_coordinate_answer_normaliser_TEMPLATE_NOT_APPLIED.sql", "utf8");
  assert.match(sql, /NOT APPLIED/);
  assert.equal((sql.match(/create or replace function/gi) ?? []).length, 1);
  assert.match(sql, /elsif v_coord_stored is not null then/);
  assert.match(sql, /elsif lower\(trim\(coalesce\(v_response_value, ''\)\)\) = lower\(trim\(v_stored_answer\)\) then/, "exact-text path preserved");
  assert.match(sql, /v_stored_answer like '%;%'/, "manual-marking and marking-mode safety preserved");
  assert.match(sql, /abs\(v_numeric_response - v_numeric_answer\) < 0\.0001/, "numeric path preserved");
  assert.doesNotMatch(sql, /\bdrop\b|\bgrant\b|\brevoke\b|alter table/i);
});

// ---- B. ordered-list answers --------------------------------------------------------------------------------------------
const NAMES = ["elif", "casey", "wei", "grace"];
const names: EnglishPromptValidationFields = { marks: 4, validationTier: "TIER4_ORDERED_LIST", orderedAnswer: NAMES };
const score = (p: EnglishPromptValidationFields, a: string) => scoreEnglishComprehensionAnswer(a, p, scoreEnglishAnswer).earnedMarks;

test("ordered answers: every safe separator gives the same marks as one item per line", () => {
  for (const a of [
    "Elif\nCasey\nWei\nGrace", "1. Elif\n2. Casey\n3. Wei\n4. Grace", "1) Elif\r\n2) Casey\r\n3) Wei\r\n4) Grace",
    "Elif, Casey, Wei, Grace", "elif,casey,wei,grace", "Elif, Casey, Wei and Grace", "Elif; Casey; Wei; Grace", "Elif -> Casey -> Wei -> Grace",
    "Elif → Casey → Wei → Grace", "Elif then Casey then Wei then Grace", "1. Elif 2. Casey 3. Wei 4. Grace", "Elif Casey Wei Grace", "Elif, Casey, Wei, Grace.",
  ]) assert.equal(score(names, a), 4, JSON.stringify(a));
});

test("ordered answers stay ORDER-SENSITIVE: wrong, swapped, reversed, repeated and partial answers are never full marks, in every format", () => {
  const forms = (items: string[]) => [items.join("\n"), items.join(", "), items.join("; "), items.join(" -> "), ...(items.length === 4 ? [items.join(" ")] : [])];
  const expectMarks = (items: string[], marks: number) => forms(items).forEach((a) => assert.equal(score(names, a), marks, `${marks}: ${JSON.stringify(a)}`));
  expectMarks(["Grace", "Wei", "Casey", "Elif"], 0);
  expectMarks(["Casey", "Elif", "Wei", "Grace"], 2);
  expectMarks(["Elif", "Elif", "Elif", "Elif"], 1);
  expectMarks(["Elif", "Casey"], 2);
  expectMarks(["apple", "banana", "carrot", "dates"], 0);
  // no permutation other than the identity can reach 4/4 (so the answer is never treated as an unordered set)
  const perms = (a: string[]): string[][] => (a.length <= 1 ? [a] : a.flatMap((x, i) => perms([...a.slice(0, i), ...a.slice(i + 1)]).map((p) => [x, ...p])));
  for (const p of perms(["Elif", "Casey", "Wei", "Grace"])) {
    const full = p.join(",") === "Elif,Casey,Wei,Grace";
    for (const a of forms(p)) assert.equal(score(names, a) === 4, full, JSON.stringify(a));
  }
});

test("a separator is never used when a correct item itself contains it (no unsafe splitting)", () => {
  const commas = ["breaks it down into a thick, soupy mixture", "pushed through screens with tiny holes", "ink rises to the surface as a foam", "dried by passing over heated rollers"];
  // one-line comma answer is NOT split on commas for this question, because an item contains a comma
  assert.equal(parseOrderedAnswer(commas.join(", "), commas).length <= 2, true);
  assert.equal(score({ marks: 4, validationTier: "TIER4_ORDERED_LIST", orderedAnswer: commas }, commas.join("\n")), 4, "newline form still works");
  const withAnd = ["tugged at his sleeve and pointed at a boy", "the field was already crowded with kites", "unwound his string and ran against the wind", "sometimes the plainest kite flies the truest"];
  const parts = parseOrderedAnswer(withAnd.join(", "), withAnd);
  assert.equal(parts.length, 4, "comma is safe here and 'and' is NOT used as a separator");
  assert.equal(score({ marks: 4, validationTier: "TIER4_ORDERED_LIST", orderedAnswer: withAnd }, withAnd.join(", ")), 4);
});

test("a real phrase-item question (bee) accepts the comma form; multi-line answers are never re-split", () => {
  const bee = ["the bee finds a good source of food", "the bee flies back to the hive", "the bee performs the waggle dance", "other bees follow the pattern with their antennae"];
  const p: EnglishPromptValidationFields = { marks: 4, validationTier: "TIER4_ORDERED_LIST", orderedAnswer: bee };
  assert.equal(score(p, bee.join(", ")), 4);
  assert.equal(score(p, bee.join("\n")), 4);
  assert.deepEqual(parseOrderedAnswer("a, b\nc, d", bee), ["a, b", "c, d"], "two lines stay two lines");
});

test("the Mock Reading scoring path uses the same parser (comma answer to Compass Rose Q5 scores 4/4)", () => {
  const item = { questionId: "q5", marks: 4, validationTier: "TIER4_ORDERED_LIST" as const, modelAnswer: "", acceptedAnswers: null, quotationRequired: null, orderedAnswer: NAMES, correctOptions: null, requiredSelectionCount: null };
  assert.equal(computeReadingScoringOutcome({ ...item, userAnswer: "Elif, Casey, Wei, Grace" }).marksAwarded, 4);
  assert.equal(computeReadingScoringOutcome({ ...item, userAnswer: "Grace, Wei, Casey, Elif" }).marksAwarded, 0);
});

test("the earlier defect is closed: the one-line comma answer that scored 1 of 4 now scores 4 of 4", () => {
  assert.deepEqual(parseOrderedAnswer("Elif, Casey, Wei, Grace", NAMES), ["Elif", "Casey", "Wei", "Grace"]);
});
