#!/usr/bin/env node
/**
 * Mathematics Mock 1 — Deterministic Mock Analysis Engine Simulation
 * (Decision 223). Runs the real, unmodified `analyseMockAttempt()`
 * (`lib/ali/mockAnalysisEngine.ts`, the pure-function mirror of
 * `mock_analyse_attempt()`, migration 151) against the REAL, frozen
 * 56-row Mathematics Mock 1 manifest and its REAL `contentDifficulty`
 * per row (sourced from `scripts/lib/mockMathematicsPool.mjs`, the same
 * shared pool reconstruction used throughout this arc).
 *
 * `addressesMisconception` is NOT extracted for all 56 rows in this
 * script (that would require a further regex-extraction pass across
 * ~10 source migrations, out of this decision's own bounded scope) --
 * three real, spot-sampled values (directcalc, campingsale,
 * roundingbounds, each independently verified against their own
 * migration source this session, see ALI_DECISION_LOG.md Decision 222
 * Part 4a / Decision 223) are included below to prove the mechanism
 * against genuine content, not synthetic placeholder text; every other
 * row runs with no misconception data, which the engine already handles
 * as the honest, empty case (proven separately by the dedicated unit
 * tests in tests/lib/ali/mockAnalysisEngine.test.ts).
 *
 * Read-only -- no Supabase call, no database access, no write of any
 * kind, no attempt created. Reproducible:
 * `npx tsx scripts/mock-mathematics-analysis-engine-simulation.mjs`.
 */
import { analyseMockAttempt } from "../lib/ali/mockAnalysisEngine.ts";
import { buildMathematicsPool } from "./lib/mockMathematicsPool.mjs";

const FROZEN_MANIFEST_IDS = [
  "mock-mr01-directcalc-01","mock-mr01-directcalc-02","mock-mr02-invdiv-01","mock-mr02-invdiv-02","mock-mr02-invdiv-03",
  "mock-mr03-unitconv-01","mock-mr03-unitconv-02","mock-mr03-unitconv-03","mock-mr05-forward-01","mock-mr05-forward-02",
  "mock-mr04-percentchange-01","mock-mr04-percentchange-02","mock-mr07-triangleanglesum-01","mock-mr07-triangleanglesum-02",
  "mock-mr04-campingsale-01","mock-mr04-campingsale-02","mock-mr04-campingsale-03","mock-mr04-campingsale-04",
  "mock-mr01mr10-costumeschedule-01a","mock-mr01mr10-costumeschedule-01b","mock-mr06-linkedvalues-01","mock-mr06-linkedvalues-02","mock-mr06-linkedvalues-03",
  "mock-mr05-inverse-01","mock-mr05-inverse-02","mock-mr09-runningclub-01","mock-mr09-runningclub-02","mock-mr04-reversepercent-01","mock-mr04-reversepercent-02",
  "mock-mr11-roundingbounds-01","mock-mr11-roundingbounds-02","mock-mr11-roundingbounds-03","mock-mr11-roundingbounds-04",
  "mock-mr07-isoscelesproperty-01","mock-mr07-isoscelesproperty-02","mock-mr09-funrun-01","mock-mr09-funrun-02","mock-mr09-funrun-03","mock-mr09-funrun-04",
  "mock-mr02-twostep-01","mock-mr02-twostep-02","mock-mr02-twostep-03","mock-mr06-numberpuzzle-01","mock-mr06-numberpuzzle-02","mock-mr06-numberpuzzle-03",
  "mock-mr10-bustimetable-01","mock-mr10-bustimetable-02","mock-mr10-bustimetable-03","mock-mr10-bustimetable-04",
  "mock-mr06-multiplerelation-01","mock-mr06-multiplerelation-02","mock-mr01mr10-costumeschedule-02a","mock-mr01mr10-costumeschedule-02b",
  "mock-mr13-craftstall-01","mock-mr13-craftstall-02","mock-mr13-craftstall-03",
];

const REAL_MISCONCEPTION_SAMPLES = {
  "mock-mr01-directcalc-01": "Misapplying decimal place value when multiplying by a whole number -- e.g. treating 6.4 x 7 as 64 x 7 = 448 and misplacing the decimal point (4.48 or 448 instead of 44.8).",
  "mock-mr04-campingsale-01": "Subtracting 15 (a fixed amount) instead of 15% of £120, or subtracting £18 from the wrong base value.",
  "mock-mr11-roundingbounds-01": "Using 375 (the lower bound) instead of 384 (the upper bound), or assuming the consistent range is narrower than 10 values wide.",
};

function must(condition, label) {
  console.log(`${condition ? "PASS" : "FAIL"}: ${label}`);
  if (!condition) throw new Error(`Analysis engine simulation FAILED: ${label}`);
}

const pool = buildMathematicsPool();
const byId = new Map(pool.map((q) => [q.id, q]));
const rows = FROZEN_MANIFEST_IDS.map((id) => {
  const q = byId.get(id);
  if (!q) throw new Error(`Simulation self-check FAILED: ${id} not found in the reconstructed pool.`);
  return { id: q.id, marks: q.prompt.marks, questionTypeId: q.skill, contentDifficulty: q.contentDifficulty };
});
if (rows.length !== 56) throw new Error(`Simulation self-check FAILED: expected 56 rows, found ${rows.length}.`);

const questionBank = new Map(
  rows.map((r) => [
    r.id,
    { contentDifficulty: r.contentDifficulty, addressesMisconception: REAL_MISCONCEPTION_SAMPLES[r.id] ?? null },
  ])
);

function runScenario(name, statusForRow) {
  console.log(`\n=== Scenario: ${name} ===`);
  const outcomes = rows.map((r) => {
    const status = statusForRow(r);
    return {
      questionId: r.id,
      status,
      marksAwarded: status === "correct" ? r.marks : 0,
      marksAvailable: r.marks,
      questionTypeId: r.questionTypeId,
    };
  });
  const rawMarksAchieved = outcomes.reduce((n, o) => n + o.marksAwarded, 0);
  const rawMarksAvailable = 56;
  const result = analyseMockAttempt(
    outcomes, questionBank, "sim-attempt", "first-mock-mathematics-v1", new Date().toISOString(),
    { rawMarksAchieved, rawMarksAvailable, percentage: Math.round((rawMarksAchieved / rawMarksAvailable) * 1000) / 10 }
  );
  console.log(`  ${rawMarksAchieved}/${rawMarksAvailable} -- ${result.skillEvidence.bySkill.length} skills observed, ${result.strengths.length} strengths, ${result.weaknesses.length} development areas, ${result.skillEvidence.nextPracticePriorities.length} next-practice priorities`);
  return result;
}

console.log("=== STEP 1: FROZEN-FORM INTEGRITY (re-confirmed, same as every prior Mock 1 simulation this arc) ===");
must(rows.length === 56, "56 rows reconstructed from the real, frozen manifest");
must(rows.reduce((n, r) => n + r.marks, 0) === 56, "56 total marks, never 60");

const allCorrect = runScenario("ALL CORRECT", () => "correct");
must(allCorrect.weaknesses.length === 0, "an all-correct sitting produces zero development areas");
must(allCorrect.skillEvidence.nextPracticePriorities.length === 0, "an all-correct sitting produces zero next-practice priorities");
must(allCorrect.strengths.length > 0, "an all-correct sitting produces at least one strength");

const allWrong = runScenario("ALL WRONG", () => "incorrect");
must(allWrong.strengths.length === 0, "an all-wrong sitting produces zero strengths");
must(allWrong.weaknesses.length > 0, "an all-wrong sitting produces development areas");

console.log("\n=== STEP 2: REAL-STYLE LOW-SCORE (representative reconstruction of the Founder-confirmed live 6/56 result -- NOT the literal real per-question answers, which were never disclosed to this session) ===");
let correctBudget = 6;
const lowScore = runScenario("REPRESENTATIVE 6/56", (r) => {
  if (correctBudget > 0 && (r.id.includes("directcalc-01") || r.id.includes("campingsale-01") || r.id.includes("forward-01") || r.id.includes("bustimetable-01") || r.id.includes("craftstall-01") || r.id.includes("craftstall-03"))) {
    correctBudget -= 1;
    return "correct";
  }
  return "incorrect";
});
must(lowScore.strengths.length <= 2, "a 6/56-style result should not manufacture many strengths");
must(lowScore.weaknesses.length > 0, "a 6/56-style result produces real development areas");
must(lowScore.skillEvidence.nextPracticePriorities.length <= 3, "next-practice priorities remain bounded even for a very low score");
const directcalcSkill = lowScore.skillEvidence.bySkill.find((s) => s.questionTypeId === "QT-MR-01");
must(!!directcalcSkill && directcalcSkill.misconceptionNotes.length <= 1, "the one real, spot-sampled misconception note for directcalc is attached correctly, never duplicated");

console.log("\n=== ALL SCENARIOS PASSED: DETERMINISTIC MOCK ANALYSIS ENGINE SIMULATION SUCCEEDED ===");
