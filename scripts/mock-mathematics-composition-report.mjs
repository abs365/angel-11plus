#!/usr/bin/env node
/**
 * Mathematics First Mock — Composition Report (Decision 210 Part 6,
 * Decision 212). Reconstructs the real, current 77-row Mathematics
 * `mock_eligible` estate DIRECTLY FROM MIGRATION SOURCE (no live database
 * access in this environment, the same disclosed limitation as every
 * decision in this arc since 189) and runs it through the real,
 * unmodified `composeCandidateMock()`/`validateManifest()`/
 * `renderFounderReviewReport()` capability (lib/ali/mockComposition.ts,
 * lib/ali/mockCompositionReport.ts) to produce a code-verified, not
 * hand-computed, 20-question and 21-question candidate First Mock.
 *
 * Every row below is transcribed directly from its own source migration,
 * cited in a trailing comment -- never assumed from Decision-log prose.
 * `marks` is `1` on EVERY row: the Mathematics Marking Integrity Gate
 * (migrations 117/118, Decisions 172/174) corrected every row's own
 * `prompt.marks` from its originally-authored value (1 or 2) down to a
 * uniform 1, confirmed directly this session against both migrations'
 * own headers ("mock_eligible = 48 rows / 48 marks" after 118) --
 * reading the ORIGINAL authoring migrations (088/091/095/113/119) alone
 * would give the wrong, stale marks values; this script applies the
 * corrected value, not the as-authored one.
 *
 * Reproducible: `npx tsx scripts/mock-mathematics-composition-report.mjs`.
 * Read-only -- no Supabase call, no database access, no write of any
 * kind. This is the "smallest practical Founder inspection surface"
 * for a candidate composition (Decision 210 Part 10) -- see this
 * script's own printed report.
 */
import { composeCandidateMock, validateManifest } from "../lib/ali/mockComposition.ts";
import { renderFounderReviewReport } from "../lib/ali/mockCompositionReport.ts";

/** @typedef {import("../types/ali/questionBank.ts").BankQuestion} BankQuestion */

const BASE = {
  subject: "maths",
  pathway: ["csse"],
  questionType: "short-answer",
  estimatedTimeSeconds: 60,
  explanation: "",
  confidenceWeight: 1,
  revisionPriority: 3,
  masteryThreshold: 1,
  usageCount: 0,
  avgSuccessRate: null,
  provenance: "angel_original",
  eligibilityStatus: "mock_eligible",
  active: true,
  markingMode: "deterministic",
};

/** One standalone row (no grouping). */
function row(id, skill, difficulty, familyId) {
  return {
    ...BASE,
    id,
    skill,
    contentDifficulty: difficulty,
    prompt: { id, question: id, answer: "n/a", marks: 1, skill },
    learningUnitId: id,
    familyId,
  };
}

/** One row belonging to a grouped family. */
function groupedRow(id, skill, difficulty, familyId, questionGroupId, groupOrder, subpartLabel) {
  return {
    ...row(id, skill, difficulty, familyId),
    questionGroupId,
    groupOrder,
    subpartLabel,
  };
}

// =========================================================================
// ORIGINAL 55-ROW POOL (mock_eligible since Decision 189, unchanged through
// Decision 210/211) -- migrations 088 (Batch 001), 091 (Batch 002), 095
// (Batch 003), 113 (fairprep/runningclub), 119 (linkedvalues), grouping
// applied by 112 (Batch 1-3 pairs/triples) and at authoring time for
// fairprep/runningclub/linkedvalues/costumeschedule. Marks corrected to 1
// on every row by migrations 117/118.
// =========================================================================

const pool = [];

// --- Classification A (3 experiences, migration 124's own 7-row admission) ---
pool.push(
  groupedRow("mock-mr10-fairprep-01", "QT-MR-10", "medium", "mock-mr10-fairprep", "mock-mr10-fairprep", 1, "(a)"),
  groupedRow("mock-mr10-fairprep-02", "QT-MR-10", "hard", "mock-mr10-fairprep", "mock-mr10-fairprep", 2, "(b)"),
  groupedRow("mock-mr09-runningclub-01", "QT-MR-09", "medium", "mock-mr09-runningclub", "mock-mr09-runningclub", 1, "(a)"),
  groupedRow("mock-mr09-runningclub-02", "QT-MR-09", "hard", "mock-mr09-runningclub", "mock-mr09-runningclub", 2, "(b)"),
  groupedRow("mock-mr06-linkedvalues-01", "QT-MR-06", "medium", "mock-mr06-linkedvalues", "mock-mr06-linkedvalues", 1, "(a)"),
  groupedRow("mock-mr06-linkedvalues-02", "QT-MR-06", "medium", "mock-mr06-linkedvalues", "mock-mr06-linkedvalues", 2, "(b)"),
  groupedRow("mock-mr06-linkedvalues-03", "QT-MR-06", "hard", "mock-mr06-linkedvalues", "mock-mr06-linkedvalues", 3, "(c)")
);

// --- Classification B (19 experiences, migration 112's own grouping, Batch 001/002/003) ---
// Batch 001 (migration 088)
for (const [fam, skill, diffs] of [
  ["mock-mr02-invdiv", "QT-MR-02", ["easy", "easy", "easy"]],
  ["mock-mr02-twostep", "QT-MR-02", ["hard", "hard", "hard"]],
  ["mock-mr03-unitconv", "QT-MR-03", ["medium", "medium", "medium"]],
  ["mock-mr05-forward", "QT-MR-05", ["medium", "medium"]],
  ["mock-mr05-inverse", "QT-MR-05", ["hard", "hard"]],
  ["mock-mr13-bestvalue", "QT-MR-13", ["medium", "medium"]],
]) {
  diffs.forEach((d, i) => {
    const n = String(i + 1).padStart(2, "0");
    pool.push(groupedRow(`${fam}-${n}`, skill, d, fam, fam, i + 1, `(${String.fromCharCode(97 + i)})`));
  });
}
// Batch 002 (migration 091)
for (const [fam, skill, diffs] of [
  ["mock-mr04-percentchange", "QT-MR-04", ["medium", "medium"]],
  ["mock-mr04-reversepercent", "QT-MR-04", ["hard", "hard"]],
  ["mock-mr06-sumdiff", "QT-MR-06", ["medium", "medium"]],
  ["mock-mr06-multiplerelation", "QT-MR-06", ["hard", "hard"]],
  ["mock-mr07-triangleanglesum", "QT-MR-07", ["medium", "medium"]],
  ["mock-mr07-isoscelesproperty", "QT-MR-07", ["hard", "hard"]],
  ["mock-mr10-forwardschedule", "QT-MR-10", ["medium", "medium"]],
  ["mock-mr10-reverseschedule", "QT-MR-10", ["hard", "hard"]],
  ["mock-mr11-truefalsejudgement", "QT-MR-11", ["medium", "medium"]],
  ["mock-mr11-propertysearch", "QT-MR-11", ["hard", "hard"]],
]) {
  diffs.forEach((d, i) => {
    const n = String(i + 1).padStart(2, "0");
    pool.push(groupedRow(`${fam}-${n}`, skill, d, fam, fam, i + 1, `(${String.fromCharCode(97 + i)})`));
  });
}
// Batch 003 non-costumeschedule (migration 095)
for (const [fam, skill, diffs] of [
  ["mock-mr01-directcalc", "QT-MR-01", ["easy", "easy"]],
  ["mock-mr08-rotation", "QT-MR-08", ["medium", "medium"]],
  ["mock-mr12-reversemean", "QT-MR-12", ["hard", "hard"]],
]) {
  diffs.forEach((d, i) => {
    const n = String(i + 1).padStart(2, "0");
    pool.push(groupedRow(`${fam}-${n}`, skill, d, fam, fam, i + 1, `(${String.fromCharCode(97 + i)})`));
  });
}

// --- Classification C (2 experiences, migration 095, costumeschedule) ---
pool.push(
  groupedRow("mock-mr01mr10-costumeschedule-01a", "QT-MR-10", "hard", "mock-mr01mr10-costumeschedule", "mock-mr01mr10-costumeschedule-01", 1, "(a)"),
  groupedRow("mock-mr01mr10-costumeschedule-01b", "QT-MR-01", "hard", "mock-mr01mr10-costumeschedule", "mock-mr01mr10-costumeschedule-01", 2, "(b)"),
  groupedRow("mock-mr01mr10-costumeschedule-02a", "QT-MR-10", "hard", "mock-mr01mr10-costumeschedule", "mock-mr01mr10-costumeschedule-02", 1, "(a)"),
  groupedRow("mock-mr01mr10-costumeschedule-02b", "QT-MR-01", "hard", "mock-mr01mr10-costumeschedule", "mock-mr01mr10-costumeschedule-02", 2, "(b)")
);

// --- Classification S (3 standalone experiences, migration 088, Classification D unresolved -- never grouped) ---
pool.push(
  row("mock-mr09-data-01", "QT-MR-09", "medium", "mock-mr09-data"),
  row("mock-mr09-data-02", "QT-MR-09", "medium", "mock-mr09-data"),
  row("mock-mr09-data-03", "QT-MR-09", "hard", "mock-mr09-data")
);

// =========================================================================
// RESERVE, PROMOTED BY MIGRATION 144 (Decision 211) -- 22 rows / 6 families,
// row-level shapes taken verbatim from migrations 129/130/133/136/139/142.
// =========================================================================

for (const [fam, skill, diffs] of [
  ["mock-mr10-bustimetable", "QT-MR-10", ["medium", "medium", "hard", "hard"]],
  ["mock-mr13-craftstall", "QT-MR-13", ["medium", "medium", "hard"]],
  ["mock-mr09-funrun", "QT-MR-09", ["medium", "medium", "hard", "hard"]],
  ["mock-mr04-campingsale", "QT-MR-04", ["easy", "medium", "hard", "hard"]],
  ["mock-mr06-numberpuzzle", "QT-MR-06", ["medium", "medium", "hard"]],
  ["mock-mr11-roundingbounds", "QT-MR-11", ["easy", "easy", "medium", "hard"]],
]) {
  diffs.forEach((d, i) => {
    const n = String(i + 1).padStart(2, "0");
    pool.push(groupedRow(`${fam}-${n}`, skill, d, fam, fam, i + 1, `(${String.fromCharCode(97 + i)})`));
  });
}

// --- Perimeter Area: independently_validated, NOT mock_eligible -- included in the candidate POOL for validator/negative-selection proof, but must never be selected ---
pool.push(
  groupedRow("mock-mr03mr07-perimeterarea-01a", "QT-MR-03", "hard", "mock-mr03mr07-perimeterarea", "mock-mr03mr07-perimeterarea-01", 1, "(a)"),
  groupedRow("mock-mr03mr07-perimeterarea-01b", "QT-MR-07", "hard", "mock-mr03mr07-perimeterarea", "mock-mr03mr07-perimeterarea-01", 2, "(b)"),
  groupedRow("mock-mr03mr07-perimeterarea-02a", "QT-MR-03", "hard", "mock-mr03mr07-perimeterarea", "mock-mr03mr07-perimeterarea-02", 1, "(a)"),
  groupedRow("mock-mr03mr07-perimeterarea-02b", "QT-MR-07", "hard", "mock-mr03mr07-perimeterarea", "mock-mr03mr07-perimeterarea-02", 2, "(b)")
);
for (const p of pool.slice(-4)) p.eligibilityStatus = "independently_validated";

// =========================================================================
// SELF-CHECK: reconstructed mock_eligible baseline must be exactly 77
// rows/marks/33 experiences before this script trusts its own data.
// =========================================================================

const mockEligibleRows = pool.filter((q) => q.eligibilityStatus === "mock_eligible");
if (mockEligibleRows.length !== 77) {
  throw new Error(`Reconstruction self-check FAILED: expected 77 mock_eligible rows, found ${mockEligibleRows.length}.`);
}
const totalMarks = mockEligibleRows.reduce((sum, q) => sum + q.prompt.marks, 0);
if (totalMarks !== 77) {
  throw new Error(`Reconstruction self-check FAILED: expected 77 total marks (1 per row, post migrations 117/118), found ${totalMarks}.`);
}

console.log("=== Reconstruction self-check ===");
console.log(`mock_eligible rows: ${mockEligibleRows.length} (expected 77) -- PASS`);
console.log(`mock_eligible total marks: ${totalMarks} (expected 77) -- PASS`);
console.log(`independently_validated (Perimeter Area) rows: ${pool.filter((q) => q.eligibilityStatus === "independently_validated").length} (expected 4)`);
console.log("");

for (const [count, label] of [[20, "20-QUESTION CANDIDATE"], [21, "21-QUESTION CANDIDATE"]]) {
  const { manifestQuestionIds, report } = composeCandidateMock(pool, count, "maths", "csse");
  console.log(renderFounderReviewReport(manifestQuestionIds, pool, report, { title: `Mathematics First Mock -- ${label}`, targetExperienceCount: count }));
  console.log("");
  console.log(`Perimeter Area included: ${manifestQuestionIds.some((id) => id.includes("perimeterarea"))}`);
  console.log("");
  console.log("=".repeat(70));
  console.log("");
}

// Negative proof: a manifest deliberately including Perimeter Area is rejected.
const withPerimeterArea = validateManifest(
  ["mock-mr03mr07-perimeterarea-01a", "mock-mr03mr07-perimeterarea-01b", "mock-mr03mr07-perimeterarea-02a", "mock-mr03mr07-perimeterarea-02b"],
  pool,
  "maths",
  "csse"
);
console.log("=== Negative proof: Perimeter Area manifest rejected ===");
console.log(`valid=${withPerimeterArea.valid} (expected false)`);
console.log(withPerimeterArea.failures.map((f) => `  - [${f.code}] ${f.detail}`).join("\n"));
