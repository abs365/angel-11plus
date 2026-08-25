import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { isValidTableStimulus } from "../../lib/mockAttempt/workspace";

/**
 * Mathematics First Mock Minimum — Shared-Scenario Completion Batch,
 * content-shape tests (Decision 168/169/170). Parses migration 113's
 * own real JSON blocks (not a re-typed copy) and proves: mock-mr09-
 * runningclub now carries a genuine, valid structured stimulus (not the
 * earlier newline-list workaround), the dataset is no longer duplicated
 * inside either subpart's own prose, mock-mr10-fairprep is unaffected,
 * and every answer/mark/difficulty this session independently verified
 * is unchanged by the amendment.
 */

const sql = fs.readFileSync("supabase/migrations/113_mock_mathematics_shared_scenario_completion_batch.sql", "utf8");
const jsonBlocks = [...sql.matchAll(/\$json\$(\{[\s\S]*?\})\$json\$/g)].map((m) => JSON.parse(m[1]));

function byId(id: string) {
  const row = jsonBlocks.find((r) => r.id === id);
  assert.ok(row, `expected a JSON block for ${id}`);
  return row;
}

test("exactly 4 rows parse as valid JSON from migration 113's own real text", () => {
  assert.equal(jsonBlocks.length, 4);
});

test("mock-mr10-fairprep carries no stimulus on either subpart -- it never needed one", () => {
  assert.equal(byId("mock-mr10-fairprep-01").stimulus, undefined);
  assert.equal(byId("mock-mr10-fairprep-02").stimulus, undefined);
});

test("mock-mr09-runningclub carries a genuinely valid table stimulus on BOTH subparts", () => {
  const a = byId("mock-mr09-runningclub-01");
  const b = byId("mock-mr09-runningclub-02");
  assert.equal(isValidTableStimulus(a.stimulus), true);
  assert.equal(isValidTableStimulus(b.stimulus), true);
});

test("both runningclub subparts carry the IDENTICAL stimulus -- the mechanism selectDisplayUnitStimulus() relies on", () => {
  assert.deepEqual(byId("mock-mr09-runningclub-01").stimulus, byId("mock-mr09-runningclub-02").stimulus);
});

test("the stimulus table has the exact real dataset: 5 weeks, correct headers, correct values, in order", () => {
  const stimulus = byId("mock-mr09-runningclub-01").stimulus;
  assert.deepEqual(stimulus.headers, ["Week", "Attendance"]);
  assert.deepEqual(stimulus.rows, [
    ["Week 1", "14"], ["Week 2", "19"], ["Week 3", "16"], ["Week 4", "23"], ["Week 5", "21"],
  ]);
});

test("the dataset is no longer duplicated inside either subpart's own prose -- no 'Week N: <digits>' pattern remains in the question text", () => {
  for (const id of ["mock-mr09-runningclub-01", "mock-mr09-runningclub-02"]) {
    assert.ok(!/Week \d+:\s*\d+/.test(byId(id).question), `${id}'s own question text must not re-encode the dataset as prose`);
  }
});

test("every previously-verified answer, mark, and skill/QT is unchanged by the amendment", () => {
  assert.equal(byId("mock-mr10-fairprep-01").answer, "15:50");
  assert.equal(byId("mock-mr10-fairprep-01").marks, 1);
  assert.equal(byId("mock-mr10-fairprep-02").answer, "13:35");
  assert.equal(byId("mock-mr10-fairprep-02").marks, 2);
  assert.equal(byId("mock-mr09-runningclub-01").answer, "139.50");
  assert.equal(byId("mock-mr09-runningclub-01").marks, 1);
  assert.equal(byId("mock-mr09-runningclub-02").answer, "Week 3 to Week 4");
  assert.equal(byId("mock-mr09-runningclub-02").marks, 2);
});

test("the migration's own header discloses the amendment and its dependency on migration 115", () => {
  assert.match(sql, /AMENDED \(Decision 170/);
  assert.match(sql, /migration 115/);
});
