import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { isValidTableStimulus } from "../../lib/mockAttempt/workspace";

/**
 * Mathematics Structural Capacity, Authoring Increment 003 — Shared
 * Multi-Row Data Reasoning Family (Decision 191/192). Parses migration
 * 131's own real JSON blocks and proves the family's shape, marks,
 * grouping, answers, stimulus, and sharedStem correctness.
 */

const sql = fs.readFileSync("supabase/migrations/131_mock_mathematics_structural_capacity_increment003_funrun.sql", "utf8");
const executable = sql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");
const jsonBlocks = [...sql.matchAll(/\$json\$(\{[\s\S]*?\})\$json\$/g)].map((m) => JSON.parse(m[1]));

function byId(id: string) {
  const row = jsonBlocks.find((r) => r.id === id);
  assert.ok(row, `expected a JSON block for ${id}`);
  return row;
}

const FUNRUN_IDS = ["mock-mr09-funrun-01", "mock-mr09-funrun-02", "mock-mr09-funrun-03", "mock-mr09-funrun-04"];

test("exactly 4 rows parse as valid JSON from migration 131's own real text", () => {
  assert.equal(jsonBlocks.length, 4);
  assert.deepEqual(jsonBlocks.map((r) => r.id).sort(), [...FUNRUN_IDS].sort());
});

test("every row is exactly 1 mark -- Decision 175 marking integrity is binding", () => {
  for (const id of FUNRUN_IDS) {
    assert.equal(byId(id).marks, 1);
  }
});

test("independently verified answers: 30, 74, 2.5, 14", () => {
  assert.equal(byId("mock-mr09-funrun-01").answer, "30");
  assert.equal(byId("mock-mr09-funrun-02").answer, "74");
  assert.equal(byId("mock-mr09-funrun-03").answer, "2.5");
  assert.equal(byId("mock-mr09-funrun-04").answer, "14");
});

test("answers are re-derivable independently from the stated frequency table (semantic re-check, not merely stored-value trust)", () => {
  const laps = [0, 1, 2, 3, 4, 5];
  const freq = [3, 5, 8, 6, 5, 3];
  const totalRunners = freq.reduce((a, b) => a + b, 0);
  assert.equal(totalRunners, 30);
  const totalLaps = laps.reduce((acc, l, i) => acc + l * freq[i], 0);
  assert.equal(totalLaps, 74);
  const mean = totalLaps / totalRunners;
  assert.equal(Math.round(mean * 10) / 10, 2.5);
  const aboveMean = laps.reduce((acc, l, i) => acc + (l > mean ? freq[i] : 0), 0);
  assert.equal(aboveMean, 14);
  // independent complement check for subpart (d)
  const atOrBelow = laps.reduce((acc, l, i) => acc + (l <= 2 ? freq[i] : 0), 0);
  assert.equal(totalRunners - atOrBelow, 14);
});

test("subpart (c) explicitly states the rounding convention that makes its stored answer valid -- the mean 74/30=2.4666... is only a defensible exact-match answer of 2.5 because the question itself instructs rounding to 1 decimal place (Founder pre-application finding, Decision 193)", () => {
  const question = byId("mock-mr09-funrun-03").question;
  assert.match(question, /1 decimal place/i, "subpart (c) must explicitly instruct rounding -- an unrounded 2.5 would not follow from 74/30");
  const exactMean = 74 / 30;
  assert.notEqual(exactMean, 2.5, "sanity check: 74/30 is not itself 2.5 -- the stored answer is only correct because of the explicit rounding instruction verified above");
  assert.equal(Math.round(exactMean * 10) / 10, 2.5, "2.4666... correctly rounds to 2.5 to 1 decimal place");
});

test("subpart (d)'s threshold never depends on whether the EXACT mean (2.4666...) or the ROUNDED mean (2.5) is used -- both partition the integer-laps table identically, so no ambiguity is smuggled in by rounding", () => {
  const laps = [0, 1, 2, 3, 4, 5];
  const freq = [3, 5, 8, 6, 5, 3];
  const exactMean = 74 / 30;
  const roundedMean = 2.5;
  const aboveExact = laps.reduce((acc, l, i) => acc + (l > exactMean ? freq[i] : 0), 0);
  const aboveRounded = laps.reduce((acc, l, i) => acc + (l > roundedMean ? freq[i] : 0), 0);
  assert.equal(aboveExact, 14);
  assert.equal(aboveRounded, 14);
  assert.equal(aboveExact, aboveRounded, "exact-mean and rounded-mean thresholds must agree for this integer-laps dataset");
});

test("subpart (d) is independently credit-bearing: its own stored workingSteps re-derive the mean from the shared table rather than reusing subpart (c)'s stored answer value", () => {
  const row = byId("mock-mr09-funrun-04");
  assert.ok(row.workingSteps.some((s: string) => /74.*30|30.*74/.test(s)), "subpart (d) must show its own derivation of the mean from the raw totals, not merely cite subpart (c)'s answer");
});

test("subpart (d) cannot be solved by repeating (a)/(b)/(c)'s own operation: it requires a derived threshold (the mean) applied as a filter, not a plain sum or a plain division", () => {
  const laps = [0, 1, 2, 3, 4, 5];
  const freq = [3, 5, 8, 6, 5, 3];
  // (a)'s operation (unconditional sum) does NOT give (d)'s answer
  const plainSum = freq.reduce((a, b) => a + b, 0);
  assert.notEqual(plainSum, 14);
  // (b)'s operation (weighted sum) does NOT give (d)'s answer
  const weightedSum = laps.reduce((acc, l, i) => acc + l * freq[i], 0);
  assert.notEqual(weightedSum, 14);
});

test("all 4 rows carry a valid table stimulus, identical across the family (selectDisplayUnitStimulus() renders it once per experience)", () => {
  const stimuli = FUNRUN_IDS.map((id) => byId(id).stimulus);
  for (const s of stimuli) assert.equal(isValidTableStimulus(s), true);
  assert.deepEqual(stimuli[0], stimuli[1]);
  assert.deepEqual(stimuli[0], stimuli[2]);
  assert.deepEqual(stimuli[0], stimuli[3]);
});

test("stimulus has the exact intended dataset: 6 lap categories, correct headers, correct values, in order", () => {
  const stimulus = byId("mock-mr09-funrun-01").stimulus;
  assert.deepEqual(stimulus.headers, ["Laps completed", "Number of runners"]);
  assert.deepEqual(stimulus.rows, [
    ["0", "3"], ["1", "5"], ["2", "8"], ["3", "6"], ["4", "5"], ["5", "3"],
  ]);
});

test("all 4 rows carry an identical, non-empty sharedStem, and every row's question genuinely starts with it (the exact resolveGroupSharedStem() safety rule)", () => {
  const stems = FUNRUN_IDS.map((id) => byId(id).sharedStem);
  assert.ok(stems[0] && stems[0].length > 0);
  for (const s of stems) assert.equal(s, stems[0]);
  for (const id of FUNRUN_IDS) {
    const row = byId(id);
    assert.ok(row.question.startsWith(row.sharedStem), `${id}'s question must start with its own sharedStem`);
    assert.ok(row.question.slice(row.sharedStem.length).trim().length > 0, `${id} must have a non-empty tail after the stem`);
  }
});

test("grouping contract: question_group_id=mock-mr09-funrun, group_order 1-4, subpart_label (a)-(d), marking_mode deterministic", () => {
  assert.match(executable, /'mock-mr09-funrun-01'[\s\S]*?'mock-mr09-funrun', 1, '\(a\)', 'deterministic'/);
  assert.match(executable, /'mock-mr09-funrun-02'[\s\S]*?'mock-mr09-funrun', 2, '\(b\)', 'deterministic'/);
  assert.match(executable, /'mock-mr09-funrun-03'[\s\S]*?'mock-mr09-funrun', 3, '\(c\)', 'deterministic'/);
  assert.match(executable, /'mock-mr09-funrun-04'[\s\S]*?'mock-mr09-funrun', 4, '\(d\)', 'deterministic'/);
});

test("difficulty progression: medium, medium, hard, hard", () => {
  assert.match(executable, /'mock-mr09-funrun-01', 'maths', 'QT-MR-09', array\['csse'\], 'medium'/);
  assert.match(executable, /'mock-mr09-funrun-02', 'maths', 'QT-MR-09', array\['csse'\], 'medium'/);
  assert.match(executable, /'mock-mr09-funrun-03', 'maths', 'QT-MR-09', array\['csse'\], 'hard'/);
  assert.match(executable, /'mock-mr09-funrun-04', 'maths', 'QT-MR-09', array\['csse'\], 'hard'/);
});

test("QT reuse: QT-MR-09 on all 4 rows -- no new Question Type is created", () => {
  const qtMatches = [...executable.matchAll(/'QT-MR-09'/g)];
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

test("header discloses the two independently-verified primary-source instances (2021 Q10, 2022 Q15) and the NOT APPLIED status", () => {
  assert.match(sql, /2021 Q10/);
  assert.match(sql, /2022 Q15/);
  assert.match(sql, /NOT APPLIED\. Generated for/);
});

test("no second family, no English/Writing content, no diagram/chart archetype is referenced", () => {
  assert.ok(!/mock-eng-|mock-writing-/.test(executable));
  assert.ok(!/subject = 'english'|subject = 'writing'/i.test(executable));
  const familyIds = new Set([...executable.matchAll(/'(mock-mr\d+-\w+)', 'angel_original'/g)].map((m) => m[1]));
  assert.deepEqual(familyIds, new Set(["mock-mr09-funrun"]));
  assert.ok(!/"type":"chart"|"type":"diagram"|"type":"graph"/.test(executable), "must represent the dataset as the existing table stimulus, not a new chart/diagram type");
});
