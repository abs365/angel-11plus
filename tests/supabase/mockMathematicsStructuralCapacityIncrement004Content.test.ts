import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mathematics Structural Capacity, Authoring Increment 004 — Percentage/
 * Ratio Multi-Stage Narrative Family (Decision 195/196). Parses migration
 * 134's own real JSON blocks and proves the family's shape, marks,
 * grouping, answers, sharedStem, and mathematical correctness.
 */

const sql = fs.readFileSync("supabase/migrations/134_mock_mathematics_structural_capacity_increment004_campingsale.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");
const jsonBlocks = [...sql.matchAll(/\$json\$(\{[\s\S]*?\})\$json\$/g)].map((m) => JSON.parse(m[1]));

function byId(id: string) {
  const row = jsonBlocks.find((r) => r.id === id);
  assert.ok(row, `expected a JSON block for ${id}`);
  return row;
}

const CAMPINGSALE_IDS = [
  "mock-mr04-campingsale-01", "mock-mr04-campingsale-02", "mock-mr04-campingsale-03", "mock-mr04-campingsale-04",
];

test("exactly 4 rows parse as valid JSON from migration 134's own real text", () => {
  assert.equal(jsonBlocks.length, 4);
  assert.deepEqual(jsonBlocks.map((r) => r.id).sort(), [...CAMPINGSALE_IDS].sort());
});

test("every row is exactly 1 mark -- Decision 175 marking integrity is binding", () => {
  for (const id of CAMPINGSALE_IDS) {
    assert.equal(byId(id).marks, 1);
  }
});

test("independently verified answers: £102, £91.80, £1.80, £170", () => {
  assert.equal(byId("mock-mr04-campingsale-01").answer, "£102");
  assert.equal(byId("mock-mr04-campingsale-02").answer, "£91.80");
  assert.equal(byId("mock-mr04-campingsale-03").answer, "£1.80");
  assert.equal(byId("mock-mr04-campingsale-04").answer, "£170");
});

test("subpart (a) semantic re-check: 15% off £120 = £102, computed two independent ways", () => {
  const discountThenSubtract = 120 - 120 * 0.15;
  const directRetainedFraction = 120 * 0.85;
  assert.equal(discountThenSubtract, 102);
  assert.equal(directRetainedFraction, 102);
});

test("subpart (b) semantic re-check: 10% off the already-reduced £102 = £91.80, computed two independent ways", () => {
  const discountThenSubtract = Math.round((102 - 102 * 0.1) * 100) / 100;
  const directRetainedFraction = Math.round(102 * 0.9 * 100) / 100;
  assert.equal(discountThenSubtract, 91.8);
  assert.equal(directRetainedFraction, 91.8);
});

test("subpart (c) semantic re-check: the successive-discount price (£91.80) is genuinely £1.80 MORE than a single 25% discount off £120 (£90) -- never less or equal, so the question's directional 'how much MORE' framing is unambiguous", () => {
  const singleDiscount = 120 * 0.75;
  const sequentialDiscount = 120 * 0.85 * 0.9;
  assert.equal(singleDiscount, 90);
  assert.equal(Math.round(sequentialDiscount * 100) / 100, 91.8);
  assert.ok(sequentialDiscount > singleDiscount, "sequential discounts must be strictly less generous than the equivalent single discount");
  const difference = Math.round((sequentialDiscount - singleDiscount) * 100) / 100;
  assert.equal(difference, 1.8);
  // independent combined-multiplier check
  const combinedMultiplier = 0.85 * 0.9;
  const singleMultiplier = 0.75;
  const multiplierGap = Math.round((combinedMultiplier - singleMultiplier) * 1000) / 1000;
  assert.equal(multiplierGap, 0.015);
  assert.equal(Math.round(120 * multiplierGap * 100) / 100, 1.8);
});

test("subpart (d) semantic re-check: a tent sold at £136 after a single 20% discount had an original price of £170, verified by forward multiplication", () => {
  const originalPrice = 136 / 0.8;
  assert.equal(originalPrice, 170);
  assert.equal(170 * 0.8, 136, "forward check must reproduce the given £136 sale price exactly");
});

test("subpart (d) is independently credit-bearing: a wholly different tent/scenario, no dependency on (a)-(c)'s stored answers", () => {
  const row = byId("mock-mr04-campingsale-04");
  assert.match(row.question, /different tent/i);
  assert.ok(!row.question.includes("91.80") && !row.question.includes("102"), "subpart (d) must not reference any of (a)/(b)/(c)'s own computed values");
});

test("subparts (b) and (c) restate their own necessary intermediate facts directly, never as 'your answer to (a)/(b)'", () => {
  const b = byId("mock-mr04-campingsale-02");
  const c = byId("mock-mr04-campingsale-03");
  assert.match(b.question, /£102/, "subpart (b) must state the already-reduced price directly");
  assert.match(c.question, /£91\.80/, "subpart (c) must state the actual sequential price directly");
  assert.match(c.question, /£120/, "subpart (c) must state the original price directly");
  assert.ok(!/your answer/i.test(b.question) && !/your answer/i.test(c.question), "no subpart may reference the learner's own prior answer");
});

test("all 4 rows carry an identical, non-empty sharedStem, and every row's question genuinely starts with it (the exact resolveGroupSharedStem() safety rule)", () => {
  const stems = CAMPINGSALE_IDS.map((id) => byId(id).sharedStem);
  assert.ok(stems[0] && stems[0].length > 0);
  for (const s of stems) assert.equal(s, stems[0]);
  for (const id of CAMPINGSALE_IDS) {
    const row = byId(id);
    assert.ok(row.question.startsWith(row.sharedStem), `${id}'s question must start with its own sharedStem`);
    assert.ok(row.question.slice(row.sharedStem.length).trim().length > 0, `${id} must have a non-empty tail after the stem`);
  }
});

test("no prompt.stimulus table is present anywhere in this family -- deliberately text-only narrative, per Decision 195 Part 9", () => {
  for (const id of CAMPINGSALE_IDS) {
    assert.equal(byId(id).stimulus, undefined);
  }
});

test("grouping contract: question_group_id=mock-mr04-campingsale, group_order 1-4, subpart_label (a)-(d), marking_mode deterministic", () => {
  assert.match(executable, /'mock-mr04-campingsale-01'[\s\S]*?'mock-mr04-campingsale', 1, '\(a\)', 'deterministic'/);
  assert.match(executable, /'mock-mr04-campingsale-02'[\s\S]*?'mock-mr04-campingsale', 2, '\(b\)', 'deterministic'/);
  assert.match(executable, /'mock-mr04-campingsale-03'[\s\S]*?'mock-mr04-campingsale', 3, '\(c\)', 'deterministic'/);
  assert.match(executable, /'mock-mr04-campingsale-04'[\s\S]*?'mock-mr04-campingsale', 4, '\(d\)', 'deterministic'/);
});

test("difficulty progression: easy, medium, hard, hard", () => {
  assert.match(executable, /'mock-mr04-campingsale-01', 'maths', 'QT-MR-04', array\['csse'\], 'easy'/);
  assert.match(executable, /'mock-mr04-campingsale-02', 'maths', 'QT-MR-04', array\['csse'\], 'medium'/);
  assert.match(executable, /'mock-mr04-campingsale-03', 'maths', 'QT-MR-04', array\['csse'\], 'hard'/);
  assert.match(executable, /'mock-mr04-campingsale-04', 'maths', 'QT-MR-04', array\['csse'\], 'hard'/);
});

test("QT reuse: QT-MR-04 on all 4 rows -- no new Question Type is created", () => {
  const qtMatches = [...executable.matchAll(/'QT-MR-04'/g)];
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

test("header discloses the three independently-verified primary-source instances (2023 Q4, 2022 Q14, 2021 Q19) and the NOT APPLIED status", () => {
  assert.match(sql, /2023 Q4/);
  assert.match(sql, /2022 Q14/);
  assert.match(sql, /2021 Q19/);
  assert.match(sql, /NOT APPLIED\. Generated for/);
});

test("no second family, no English/Writing content, no diagram/chart archetype is referenced", () => {
  assert.ok(!/mock-eng-|mock-writing-/.test(executable));
  assert.ok(!/subject = 'english'|subject = 'writing'/i.test(executable));
  const familyIds = new Set([...executable.matchAll(/'(mock-mr\d+-\w+)', 'angel_original'/g)].map((m) => m[1]));
  assert.deepEqual(familyIds, new Set(["mock-mr04-campingsale"]));
  assert.ok(!/"type":"chart"|"type":"diagram"|"type":"graph"|"type":"table"/.test(executable), "must not use a table/chart/diagram stimulus -- this family is deliberately text-only narrative");
});

test("no reproduction of real CSSE past-paper items: does not use the words 'jacket'/'coat'/'T-shirt'/'book' that the real papers and existing mr04 families already use", () => {
  assert.ok(!/jacket|coat\b|t-shirt|\bbook\b/i.test(executable));
});
