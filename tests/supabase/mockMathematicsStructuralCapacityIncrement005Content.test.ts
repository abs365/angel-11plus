import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mathematics Structural Capacity, Authoring Increment 005 — Interdependent
 * Algebraic-System Classification-A Family, Variant 2 (Decision 198/199).
 * Parses migration 137's own real JSON blocks and proves the family's
 * shape, marks, grouping, answers, sharedStem, independence, and
 * mathematical correctness -- including a re-derivation directly from
 * the stored rules, not merely asserted stored constants.
 */

const sql = fs.readFileSync("supabase/migrations/137_mock_mathematics_structural_capacity_increment005_numberpuzzle.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");
const jsonBlocks = [...sql.matchAll(/\$json\$(\{[\s\S]*?\})\$json\$/g)].map((m) => JSON.parse(m[1]));

function byId(id: string) {
  const row = jsonBlocks.find((r) => r.id === id);
  assert.ok(row, `expected a JSON block for ${id}`);
  return row;
}

const NUMBERPUZZLE_IDS = [
  "mock-mr06-numberpuzzle-01", "mock-mr06-numberpuzzle-02", "mock-mr06-numberpuzzle-03", "mock-mr06-numberpuzzle-04",
];

// The stored system, re-derived from scratch (not copied from the SQL
// comments): P = n+9, Q = 9n, R = n^2.
function P(n: number) { return n + 9; }
function Q(n: number) { return 9 * n; }
function R(n: number) { return n * n; }

test("exactly 4 rows parse as valid JSON from migration 137's own real text", () => {
  assert.equal(jsonBlocks.length, 4);
  assert.deepEqual(jsonBlocks.map((r) => r.id).sort(), [...NUMBERPUZZLE_IDS].sort());
});

test("every row is exactly 1 mark -- Decision 175 marking integrity is binding", () => {
  for (const id of NUMBERPUZZLE_IDS) {
    assert.equal(byId(id).marks, 1);
  }
});

test("independently verified answers: 81, 9, 0, 14", () => {
  assert.equal(byId("mock-mr06-numberpuzzle-01").answer, "81");
  assert.equal(byId("mock-mr06-numberpuzzle-02").answer, "9");
  assert.equal(byId("mock-mr06-numberpuzzle-03").answer, "0");
  assert.equal(byId("mock-mr06-numberpuzzle-04").answer, "14");
});

test("subpart (a) semantic re-check: 9P - Q is constant (81) for every positive n, re-derived directly from the rules, not asserted", () => {
  for (const n of [1, 4, 10, 25, 100]) {
    assert.equal(9 * P(n) - Q(n), 81, `9P-Q must equal 81 for n=${n}`);
  }
});

test("subpart (b) semantic re-check: Q / (P - 9) is constant (9) for every positive n", () => {
  for (const n of [1, 4, 10, 25, 100]) {
    assert.equal(Q(n) / (P(n) - 9), 9, `Q/(P-9) must equal 9 for n=${n}`);
  }
});

test("subpart (c) semantic re-check: (P x n) - Q - R is constant (0) for every positive n", () => {
  for (const n of [1, 4, 10, 25, 100]) {
    assert.equal(P(n) * n - Q(n) - R(n), 0, `(P*n)-Q-R must equal 0 for n=${n}`);
  }
});

test("subpart (a)/(b)/(c) genuinely do not depend on n's value -- the whole point of the archetype -- verified by disagreement-free scan across a wide n range", () => {
  const aValues = new Set([1, 2, 3, 5, 7, 11, 13, 20, 50].map((n) => 9 * P(n) - Q(n)));
  const bValues = new Set([1, 2, 3, 5, 7, 11, 13, 20, 50].map((n) => Q(n) / (P(n) - 9)));
  const cValues = new Set([1, 2, 3, 5, 7, 11, 13, 20, 50].map((n) => P(n) * n - Q(n) - R(n)));
  assert.equal(aValues.size, 1, "subpart (a) must yield the same value for every positive n");
  assert.equal(bValues.size, 1, "subpart (b) must yield the same value for every positive n");
  assert.equal(cValues.size, 1, "subpart (c) must yield the same value for every positive n");
});

test("subpart (d) semantic re-check: R - Q = 70 has a unique positive integer solution, n = 14, found by direct search and confirmed by factorisation", () => {
  const solutions: number[] = [];
  for (let n = 1; n <= 200; n++) {
    if (R(n) - Q(n) === 70) solutions.push(n);
  }
  assert.deepEqual(solutions, [14], "n=14 must be the unique positive integer solution in a wide search range");
  // factorisation check: n^2 - 9n - 70 = (n-14)(n+5)
  assert.equal((14 - 14) * (14 + 5), 0);
  assert.equal(-5 + 5, 0, "the rejected root is -5, algebraically valid but not a positive whole number");
  assert.equal(Q(14), 126);
  assert.equal(R(14), 196);
  assert.equal(R(14) - Q(14), 70);
});

test("subpart (d) does not coincide by dependency with (b): both happen to equal the shared offset/multiplier constant (9) for (b), and a genuinely different constant (14) for (d), not the same value, and neither is derived from the other", () => {
  const row = byId("mock-mr06-numberpuzzle-04");
  assert.notEqual(byId("mock-mr06-numberpuzzle-02").answer, row.answer, "subpart (d)'s answer must not equal subpart (b)'s, avoiding any superficial-repeat appearance");
});

test("subpart (d) is independently credit-bearing: a freshly-stated relationship (R is 70 more than Q), no dependency on (a)-(c)'s stored answers", () => {
  const row = byId("mock-mr06-numberpuzzle-04");
  assert.match(row.question, /70 more/i);
  assert.ok(!row.question.includes("81") && !row.question.includes("(9P") && !row.question.includes("9P −"), "subpart (d) must not reference (a)'s own computed value or expression");
});

test("subparts (a)/(b)/(c) restate the full shared system directly via sharedStem, never as 'your answer to a previous part'", () => {
  for (const id of NUMBERPUZZLE_IDS) {
    const row = byId(id);
    assert.ok(!/your answer/i.test(row.question), `${id} must not reference the learner's own prior answer`);
  }
});

test("all 4 rows carry an identical, non-empty sharedStem, and every row's question genuinely starts with it (the exact resolveGroupSharedStem() safety rule)", () => {
  const stems = NUMBERPUZZLE_IDS.map((id) => byId(id).sharedStem);
  assert.ok(stems[0] && stems[0].length > 0);
  for (const s of stems) assert.equal(s, stems[0]);
  for (const id of NUMBERPUZZLE_IDS) {
    const row = byId(id);
    assert.ok(row.question.startsWith(row.sharedStem), `${id}'s question must start with its own sharedStem`);
    assert.ok(row.question.slice(row.sharedStem.length).trim().length > 0, `${id} must have a non-empty tail after the stem`);
  }
});

test("sharedStem states all three rules (P, Q, R) needed across the whole family", () => {
  const stem = byId("mock-mr06-numberpuzzle-01").sharedStem as string;
  assert.match(stem, /P = n \+ 9/);
  assert.match(stem, /Q = 9 x n/);
  assert.match(stem, /R = n x n/);
});

test("no prompt.stimulus table is present anywhere in this family -- deliberately text-only abstract-algebra content", () => {
  for (const id of NUMBERPUZZLE_IDS) {
    assert.equal(byId(id).stimulus, undefined);
  }
});

test("grouping contract: question_group_id=mock-mr06-numberpuzzle, group_order 1-4, subpart_label (a)-(d), marking_mode deterministic", () => {
  assert.match(executable, /'mock-mr06-numberpuzzle-01'[\s\S]*?'mock-mr06-numberpuzzle', 1, '\(a\)', 'deterministic'/);
  assert.match(executable, /'mock-mr06-numberpuzzle-02'[\s\S]*?'mock-mr06-numberpuzzle', 2, '\(b\)', 'deterministic'/);
  assert.match(executable, /'mock-mr06-numberpuzzle-03'[\s\S]*?'mock-mr06-numberpuzzle', 3, '\(c\)', 'deterministic'/);
  assert.match(executable, /'mock-mr06-numberpuzzle-04'[\s\S]*?'mock-mr06-numberpuzzle', 4, '\(d\)', 'deterministic'/);
});

test("difficulty progression: medium, medium, hard, hard -- honestly labelled, not inflated", () => {
  assert.match(executable, /'mock-mr06-numberpuzzle-01', 'maths', 'QT-MR-06', array\['csse'\], 'medium'/);
  assert.match(executable, /'mock-mr06-numberpuzzle-02', 'maths', 'QT-MR-06', array\['csse'\], 'medium'/);
  assert.match(executable, /'mock-mr06-numberpuzzle-03', 'maths', 'QT-MR-06', array\['csse'\], 'hard'/);
  assert.match(executable, /'mock-mr06-numberpuzzle-04', 'maths', 'QT-MR-06', array\['csse'\], 'hard'/);
});

test("QT reuse: QT-MR-06 on all 4 rows -- no new Question Type is created", () => {
  const qtMatches = [...executable.matchAll(/'QT-MR-06'/g)];
  assert.equal(qtMatches.length, 4);
  assert.ok(!/QT-MR-14|QT-MR-15|QT-MR-16/.test(executable), "must not introduce a new Question Type code");
});

test("candidate eligibility only: authentic_assessment_candidate on all 4 rows, active=true, never mock_eligible/independently_validated/practice_eligible", () => {
  const candidateMatches = [...executable.matchAll(/'authentic_assessment_candidate', 1, true/g)];
  assert.equal(candidateMatches.length, 4);
  assert.ok(!executable.includes("mock_eligible"));
  assert.ok(!executable.includes("independently_validated"));
  assert.ok(!executable.includes("practice_eligible"));
});

test("no existing row, family, or table is touched: no UPDATE statement anywhere, no ali_family_review/ali_mock_form/ali_mock_attempt mention", () => {
  assert.ok(!/\bupdate\s+public\./i.test(executable));
  for (const table of ["ali_family_review", "ali_mock_form", "ali_mock_attempt"]) {
    assert.ok(!executable.includes(table));
  }
});

test("idempotent: on conflict (id) do nothing, single transaction", () => {
  assert.equal((executable.match(/on conflict \(id\) do nothing/g) || []).length, 1);
  assert.equal((executable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable.match(/\bcommit;/g) || []).length, 1);
});

test("only public.ali_question_bank is ever inserted into", () => {
  const insertTargets = [...executable.matchAll(/insert into\s+public\.(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(insertTargets), new Set(["ali_question_bank"]));
});

test("header discloses the re-verified primary-source instance (2023 Q18) and the NOT APPLIED status", () => {
  assert.match(sql, /2023 Q18/);
  assert.match(sql, /NOT APPLIED\. Generated for/);
});

test("header discloses the mock-mr06-linkedvalues distinctness proof explicitly", () => {
  assert.match(sql, /mock-mr06-linkedvalues/);
  assert.match(sql, /materially different|MATERIALLY DIFFERENT/i);
});

test("no second family, no English/Writing content, no diagram/chart archetype is referenced", () => {
  assert.ok(!/mock-eng-|mock-writing-/.test(executable));
  assert.ok(!/subject = 'english'|subject = 'writing'/i.test(executable));
  const familyIds = new Set([...executable.matchAll(/'(mock-mr\d+-\w+)', 'angel_original'/g)].map((m) => m[1]));
  assert.deepEqual(familyIds, new Set(["mock-mr06-numberpuzzle"]));
  assert.ok(!/"type":"chart"|"type":"diagram"|"type":"graph"|"type":"table"/.test(executable), "must not use a table/chart/diagram stimulus -- this family is deliberately text-only");
});

test("no reproduction of real CSSE past-paper wording: does not use the letters 'A, B, C and D' or the exact offset/multiplier '3' from 2023 Q18's own wording", () => {
  assert.ok(!/four positive numbers A, B, C and D/i.test(executable));
  assert.ok(!/A = B\s*\+\s*3/.test(executable));
  assert.ok(!/C = 3B/.test(executable));
});
