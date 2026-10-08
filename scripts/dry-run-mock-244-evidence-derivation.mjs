import fs from "node:fs";
import { deriveQuestionLevelMockEvidence } from "../lib/mockAttempt/evidenceIntegration.ts";

/**
 * Migration 244 dry run against REAL production data: the one released
 * Mock attempt reachable from this session's own account
 * (5a556dfb-e9a0-4976-a5fe-9c5905bcbc5c, first-mock-mathematics-v1,
 * 6/56 = 10.7%). Migration 244 is NOT applied, so the actual DB write
 * (recordPresentation/recordOutcome/mock_claim_evidence_ingestion) cannot
 * be exercised against production yet -- this proves exactly what the
 * REAL, committed, unmodified deriveQuestionLevelMockEvidence() would
 * forward, using the exact question_outcomes this attempt's real,
 * released report actually contains.
 */

const outcomes = JSON.parse(
  fs.readFileSync(new URL("./output/mock-attempt-5a556dfb-question-outcomes.json", import.meta.url), "utf8")
);

const evidence = deriveQuestionLevelMockEvidence(
  outcomes,
  "5a556dfb-e9a0-4976-a5fe-9c5905bcbc5c",
  "first-mock-mathematics-v1",
  "2026-08-27T18:18:41.980237Z"
);

console.log(`Real outcomes in this attempt: ${outcomes.length}`);
console.log(`Statuses:`, outcomes.reduce((acc, o) => { acc[o.status] = (acc[o.status] || 0) + 1; return acc; }, {}));
console.log(`Evidence entries that would be forwarded: ${evidence.length}`);

const byCompetency = {};
for (const e of evidence) {
  byCompetency[e.competencyId] = byCompetency[e.competencyId] || { correct: 0, incorrect: 0 };
  byCompetency[e.competencyId][e.correct ? "correct" : "incorrect"]++;
}
console.log(`Per-competency breakdown:`, byCompetency);
console.log(`\nFull evidence list:`);
for (const e of evidence) console.log(`  ${e.questionId} -> ${e.competencyId}: ${e.correct ? "correct" : "incorrect"}`);
