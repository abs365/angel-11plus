#!/usr/bin/env node
/**
 * Mathematics Mock 1 — Release-QA Scoring Simulation (Decision 216).
 * Runs the real, unmodified `scoreMockAttempt()` (lib/ali/
 * mockScoringSimulation.ts, itself a byte-for-byte port of the live
 * `mock_score_attempt()` SQL, migration 104) against the real, frozen
 * 56-row Mathematics Mock 1 manifest (migration 147), reconstructed via
 * the same shared pool module used throughout this arc.
 *
 * Read-only -- no Supabase call, no database access, no write of any
 * kind, no attempt created. Reproducible:
 * `npx tsx scripts/mock-mathematics-scoring-simulation.mjs`.
 */
import { scoreMockAttempt, scoreMockResponse } from "../lib/ali/mockScoringSimulation.ts";
import { buildMathematicsPool } from "./lib/mockMathematicsPool.mjs";

const FINAL_ORDER_IDS = [
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

const pool = buildMathematicsPool();
const byId = new Map(pool.map((q) => [q.id, q]));
const rows = FINAL_ORDER_IDS.map((id) => {
  const q = byId.get(id);
  if (!q) throw new Error(`Simulation self-check FAILED: ${id} not found in the reconstructed pool.`);
  return { id: q.id, answer: q.prompt.answer, marks: q.prompt.marks };
});
if (rows.length !== 56) throw new Error(`Simulation self-check FAILED: expected 56 rows, found ${rows.length}.`);

console.log("=== Scenario 1: ALL CORRECT (exact stored answer for every row) ===");
{
  const responses = new Map(rows.map((r) => [r.id, r.answer]));
  const result = scoreMockAttempt(rows, responses);
  console.log(`rawAchieved=${result.rawAchieved} rawAvailable=${result.rawAvailable} percentage=${result.percentage} correct=${result.correctCount} incorrect=${result.incorrectCount} unanswered=${result.unansweredCount}`);
}

console.log("\n=== Scenario 2: ALL WRONG ===");
{
  const responses = new Map(rows.map((r) => [r.id, "definitely-wrong-answer-9999"]));
  const result = scoreMockAttempt(rows, responses);
  console.log(`rawAchieved=${result.rawAchieved} rawAvailable=${result.rawAvailable} percentage=${result.percentage} correct=${result.correctCount} incorrect=${result.incorrectCount} unanswered=${result.unansweredCount}`);
}

console.log("\n=== Scenario 3: ALL UNANSWERED ===");
{
  const responses = new Map(rows.map((r) => [r.id, ""]));
  const result = scoreMockAttempt(rows, responses);
  console.log(`rawAchieved=${result.rawAchieved} rawAvailable=${result.rawAvailable} percentage=${result.percentage} unanswered=${result.unansweredCount}`);
}

console.log("\n=== Scenario 4: representative mixed case + targeted checks ===");
{
  const responses = new Map(rows.map((r) => [r.id, r.answer]));
  responses.set("mock-mr09-funrun-03", "2.50");
  responses.set("mock-mr10-bustimetable-04", "28");
  responses.set("mock-mr04-campingsale-02", "91.80");
  responses.set("mock-mr02-invdiv-01", "0");
  responses.set("mock-mr06-linkedvalues-01", "0");
  const result = scoreMockAttempt(rows, responses);
  console.log(`rawAchieved=${result.rawAchieved} rawAvailable=${result.rawAvailable} percentage=${result.percentage} correct=${result.correctCount} incorrect=${result.incorrectCount}`);
  console.log("funrun-03 (2.50 vs stored 2.5):", result.outcomes.find((o) => o.questionId === "mock-mr09-funrun-03"));
  console.log("bustimetable-04 (28, corrected wording answer):", result.outcomes.find((o) => o.questionId === "mock-mr10-bustimetable-04"));
  console.log("campingsale-02 (91.80, NO currency symbol, CURRENT stored answer is '£91.80'):", result.outcomes.find((o) => o.questionId === "mock-mr04-campingsale-02"));
}

console.log("\n=== FINDING (pre-migration-148): currency-symbol-prefixed stored answers reject bare-numeric responses ===");
{
  const currencyAnswerRows = rows.filter((r) => r.answer.includes("£"));
  console.log(`${currencyAnswerRows.length} of 56 rows currently store a "£"-prefixed answer:`, currencyAnswerRows.map((r) => `${r.id}=${r.answer}`));
  for (const r of currencyAnswerRows) {
    const bareNumeric = r.answer.replace("£", "");
    console.log(`  ${r.id}: stored="${r.answer}", bare-numeric response="${bareNumeric}" -> ${scoreMockResponse(r.answer, bareNumeric).toUpperCase()}`);
  }
  console.log("Migration 148 (prepared, NOT applied) corrects these 4 stored answers to bare-numeric form -- see that migration and its own tests.");
}
