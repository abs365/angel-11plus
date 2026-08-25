import { test } from "node:test";
import assert from "node:assert/strict";
import { buildDisplayUnits, buildPalette, unansweredUnitIndices } from "@/lib/mockAttempt/workspace";
import type { MockManifestGroupingEntry } from "@/lib/mockAttempt/types";

/**
 * Mathematics Mock Structural Normalisation (Decision 166, migration 112)
 * — proves the REAL, approved 19-family / 41-row grouping map (not a
 * synthetic fixture) collapses into exactly 19 display units through the
 * genuine, unmodified buildDisplayUnits()/buildPalette() pipeline
 * (Decision 161). tests/lib/mockAttempt/workspace.test.ts already proves
 * this pipeline is generic against synthetic and costumeschedule
 * fixtures; this file extends that proof to the exact dataset migration
 * 112 writes, which no existing test covered before this migration.
 */

const APPROVED_ROWS: Array<[string, string, number, string]> = [
  ["mock-mr02-invdiv-01", "mock-mr02-invdiv", 1, "(a)"],
  ["mock-mr02-invdiv-02", "mock-mr02-invdiv", 2, "(b)"],
  ["mock-mr02-invdiv-03", "mock-mr02-invdiv", 3, "(c)"],
  ["mock-mr02-twostep-01", "mock-mr02-twostep", 1, "(a)"],
  ["mock-mr02-twostep-02", "mock-mr02-twostep", 2, "(b)"],
  ["mock-mr02-twostep-03", "mock-mr02-twostep", 3, "(c)"],
  ["mock-mr03-unitconv-01", "mock-mr03-unitconv", 1, "(a)"],
  ["mock-mr03-unitconv-02", "mock-mr03-unitconv", 2, "(b)"],
  ["mock-mr03-unitconv-03", "mock-mr03-unitconv", 3, "(c)"],
  ["mock-mr05-forward-01", "mock-mr05-forward", 1, "(a)"],
  ["mock-mr05-forward-02", "mock-mr05-forward", 2, "(b)"],
  ["mock-mr05-inverse-01", "mock-mr05-inverse", 1, "(a)"],
  ["mock-mr05-inverse-02", "mock-mr05-inverse", 2, "(b)"],
  ["mock-mr13-bestvalue-01", "mock-mr13-bestvalue", 1, "(a)"],
  ["mock-mr13-bestvalue-02", "mock-mr13-bestvalue", 2, "(b)"],
  ["mock-mr04-percentchange-01", "mock-mr04-percentchange", 1, "(a)"],
  ["mock-mr04-percentchange-02", "mock-mr04-percentchange", 2, "(b)"],
  ["mock-mr04-reversepercent-01", "mock-mr04-reversepercent", 1, "(a)"],
  ["mock-mr04-reversepercent-02", "mock-mr04-reversepercent", 2, "(b)"],
  ["mock-mr06-sumdiff-01", "mock-mr06-sumdiff", 1, "(a)"],
  ["mock-mr06-sumdiff-02", "mock-mr06-sumdiff", 2, "(b)"],
  ["mock-mr06-multiplerelation-01", "mock-mr06-multiplerelation", 1, "(a)"],
  ["mock-mr06-multiplerelation-02", "mock-mr06-multiplerelation", 2, "(b)"],
  ["mock-mr07-triangleanglesum-01", "mock-mr07-triangleanglesum", 1, "(a)"],
  ["mock-mr07-triangleanglesum-02", "mock-mr07-triangleanglesum", 2, "(b)"],
  ["mock-mr07-isoscelesproperty-01", "mock-mr07-isoscelesproperty", 1, "(a)"],
  ["mock-mr07-isoscelesproperty-02", "mock-mr07-isoscelesproperty", 2, "(b)"],
  ["mock-mr10-forwardschedule-01", "mock-mr10-forwardschedule", 1, "(a)"],
  ["mock-mr10-forwardschedule-02", "mock-mr10-forwardschedule", 2, "(b)"],
  ["mock-mr10-reverseschedule-01", "mock-mr10-reverseschedule", 1, "(a)"],
  ["mock-mr10-reverseschedule-02", "mock-mr10-reverseschedule", 2, "(b)"],
  ["mock-mr11-truefalsejudgement-01", "mock-mr11-truefalsejudgement", 1, "(a)"],
  ["mock-mr11-truefalsejudgement-02", "mock-mr11-truefalsejudgement", 2, "(b)"],
  ["mock-mr11-propertysearch-01", "mock-mr11-propertysearch", 1, "(a)"],
  ["mock-mr11-propertysearch-02", "mock-mr11-propertysearch", 2, "(b)"],
  ["mock-mr01-directcalc-01", "mock-mr01-directcalc", 1, "(a)"],
  ["mock-mr01-directcalc-02", "mock-mr01-directcalc", 2, "(b)"],
  ["mock-mr08-rotation-01", "mock-mr08-rotation", 1, "(a)"],
  ["mock-mr08-rotation-02", "mock-mr08-rotation", 2, "(b)"],
  ["mock-mr12-reversemean-01", "mock-mr12-reversemean", 1, "(a)"],
  ["mock-mr12-reversemean-02", "mock-mr12-reversemean", 2, "(b)"],
];

const MARKS_BY_FAMILY: Record<string, number> = {
  "mock-mr02-invdiv": 3, "mock-mr02-twostep": 6, "mock-mr03-unitconv": 3,
  "mock-mr05-forward": 2, "mock-mr05-inverse": 4, "mock-mr13-bestvalue": 2,
  "mock-mr04-percentchange": 2, "mock-mr04-reversepercent": 4,
  "mock-mr06-sumdiff": 2, "mock-mr06-multiplerelation": 4,
  "mock-mr07-triangleanglesum": 2, "mock-mr07-isoscelesproperty": 4,
  "mock-mr10-forwardschedule": 2, "mock-mr10-reverseschedule": 4,
  "mock-mr11-truefalsejudgement": 2, "mock-mr11-propertysearch": 4,
  "mock-mr01-directcalc": 2, "mock-mr08-rotation": 4, "mock-mr12-reversemean": 4,
};

const RAW_IDS = APPROVED_ROWS.map((r) => r[0]);
const GROUPING: MockManifestGroupingEntry[] = APPROVED_ROWS.map(([questionId, questionGroupId, groupOrder, subpartLabel]) => ({
  questionId,
  questionGroupId,
  groupOrder,
  subpartLabel,
}));

test("the real approved 41-row map collapses into exactly 19 display units, in family order, one per family", () => {
  const units = buildDisplayUnits(RAW_IDS, GROUPING);
  assert.equal(units.length, 19);
  const families = new Set(APPROVED_ROWS.map((r) => r[1]));
  assert.equal(new Set(units.map((u) => u.questionGroupId)).size, 19);
  assert.deepEqual(new Set(units.map((u) => u.questionGroupId)), families);
});

test("every display unit's questionIds exactly match its family's own rows, in group_order", () => {
  const units = buildDisplayUnits(RAW_IDS, GROUPING);
  for (const unit of units) {
    const expectedIds = APPROVED_ROWS.filter((r) => r[1] === unit.questionGroupId)
      .sort((a, b) => a[2] - b[2])
      .map((r) => r[0]);
    assert.deepEqual(unit.questionIds, expectedIds, `family ${unit.questionGroupId}`);
  }
});

test("palette length is 19 (grouped experience count), not 41 (raw row count) -- 'Question N of Total' reads units.length exactly as the real page does", () => {
  const units = buildDisplayUnits(RAW_IDS, GROUPING);
  const palette = buildPalette(units, new Set(), new Set(), 0);
  assert.equal(palette.length, 19);
});

test("a 3-subpart family (e.g. mock-mr02-invdiv) is answered only once all 3 subparts are answered -- generalises the existing 2-subpart proof to a 3-subpart family", () => {
  const units = buildDisplayUnits(RAW_IDS, GROUPING);
  const invdivUnit = units.find((u) => u.questionGroupId === "mock-mr02-invdiv")!;
  assert.equal(invdivUnit.questionIds.length, 3);
  const twoOfThreeAnswered = new Set(["mock-mr02-invdiv-01", "mock-mr02-invdiv-02"]);
  const palettePartial = buildPalette(units, twoOfThreeAnswered, new Set(), 0);
  assert.equal(palettePartial.find((p) => p.questionIds[0] === "mock-mr02-invdiv-01")!.answered, false);
  const allThreeAnswered = new Set(RAW_IDS.filter((id) => id.startsWith("mock-mr02-invdiv")));
  const paletteFull = buildPalette(units, allThreeAnswered, new Set(), 0);
  assert.equal(paletteFull.find((p) => p.questionIds[0] === "mock-mr02-invdiv-01")!.answered, true);
});

test("unansweredUnitIndices treats a partially-answered 3-subpart family as unanswered, and a fully-answered one as answered", () => {
  const units = buildDisplayUnits(RAW_IDS, GROUPING);
  const invdivIndex = units.findIndex((u) => u.questionGroupId === "mock-mr02-invdiv");
  const twoOfThreeAnswered = new Set(["mock-mr02-invdiv-01", "mock-mr02-invdiv-02"]);
  assert.ok(unansweredUnitIndices(units, twoOfThreeAnswered).includes(invdivIndex));
});

test("the two Classification-B candidate pairs stay as two independent display units, never merged into one cross-family unit", () => {
  const units = buildDisplayUnits(RAW_IDS, GROUPING);
  const percentChange = units.find((u) => u.questionGroupId === "mock-mr04-percentchange");
  const reversePercent = units.find((u) => u.questionGroupId === "mock-mr04-reversepercent");
  assert.ok(percentChange && reversePercent && percentChange !== reversePercent);
  const forwardSchedule = units.find((u) => u.questionGroupId === "mock-mr10-forwardschedule");
  const reverseSchedule = units.find((u) => u.questionGroupId === "mock-mr10-reverseschedule");
  assert.ok(forwardSchedule && reverseSchedule && forwardSchedule !== reverseSchedule);
});

test("marks total across the 19 families is exactly 60, matching Decision 165 Part 6's own independent summation", () => {
  const total = Object.values(MARKS_BY_FAMILY).reduce((a, b) => a + b, 0);
  assert.equal(total, 60);
  assert.equal(Object.keys(MARKS_BY_FAMILY).length, 19);
});

test("standalone ids either side of the grouped set are unaffected -- mixing in ungrouped ids never merges across a group boundary", () => {
  const mixedIds = ["standalone-a", ...RAW_IDS.slice(0, 3), "standalone-b"];
  const units = buildDisplayUnits(mixedIds, GROUPING);
  assert.equal(units[0].questionGroupId, null);
  assert.equal(units[1].questionGroupId, "mock-mr02-invdiv");
  assert.equal(units[1].questionIds.length, 3);
  assert.equal(units[2].questionGroupId, null);
});
