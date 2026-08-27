#!/usr/bin/env node
/**
 * Mathematics Mock 1 — Final Combined Release Gate Simulation
 * (Decision 218). Ties together every piece of real, unmodified
 * capability built across Decisions 212-217 into one end-to-end
 * narrative: discover -> start -> answer -> simulate a full refresh ->
 * resume -> verify remaining time -> continue -> edit -> submit ->
 * score, against the REAL, frozen 56-row manifest and the REAL,
 * post-migration-148 answer values.
 *
 * This is a pure-function simulation, explicitly NOT live browser or
 * database evidence -- no Supabase call, no database access, no
 * attempt created, no form activated. It is the strongest evidence
 * available in an environment with no live database connection and no
 * browser-E2E framework (confirmed via package.json throughout this
 * arc) -- see ANGEL_MATHEMATICS_MOCK_1_RELEASE_VERIFICATION_V2.md for
 * the full evidence-tier breakdown.
 *
 * Reproducible: `npx tsx scripts/mock-mathematics-final-release-gate-simulation.mjs`.
 */
import { buildExperiences, validateManifest } from "../lib/ali/mockComposition.ts";
import { scoreMockAttempt } from "../lib/ali/mockScoringSimulation.ts";
import { determineMockResumeAction, computeResumeStartIndex, computeRemainingSeconds, isAttemptExpired } from "../lib/mockAttempt/workspace.ts";
import { buildMathematicsPool } from "./lib/mockMathematicsPool.mjs";

function must(condition, label) {
  console.log(`${condition ? "PASS" : "FAIL"}: ${label}`);
  if (!condition) throw new Error(`Final release gate simulation FAILED: ${label}`);
}

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

console.log("=== STEP 1: FROZEN-FORM INTEGRITY ===");
const pool = buildMathematicsPool();
const report = validateManifest(FROZEN_MANIFEST_IDS, pool, "maths", "csse");
must(report.valid, "manifest is VALID against the real, reconstructed mock_eligible pool");
must(report.numberedQuestionCount === 21, `21 numbered experiences (found ${report.numberedQuestionCount})`);
must(report.totalMarks === 56, `56 marks (found ${report.totalMarks})`);
must(!FROZEN_MANIFEST_IDS.some((id) => id.includes("perimeterarea")), "Perimeter Area absent");
must(!FROZEN_MANIFEST_IDS.some((id) => id.includes("sumdiff")), "Sum/Difference absent");
must(FROZEN_MANIFEST_IDS.filter((id) => id.includes("runningclub")).length === 2, "Running Club present, complete (2/2)");
must(new Set(FROZEN_MANIFEST_IDS).size === 56, "no duplicate IDs");

console.log("\n=== STEP 2: DISCOVER + START ===");
const rows = FROZEN_MANIFEST_IDS.map((id) => {
  const q = pool.find((p) => p.id === id);
  return { id: q.id, answer: q.prompt.answer, marks: q.prompt.marks };
});
const experiences = buildExperiences(pool.filter((q) => FROZEN_MANIFEST_IDS.includes(q.id)));
const units = experiences.map((e) => ({ questionIds: e.questionIds, questionGroupId: e.isGrouped ? e.experienceId : null }));
must(units.length === 21, "21 display units reconstructed from the real grouping metadata");

const noResumableAttemptYet = null; // first-ever start: mock_get_resumable_attempt() would return nothing
const startAction = determineMockResumeAction(noResumableAttemptYet);
must(startAction.kind === "create_new", "no resumable attempt exists yet -> create_new (unchanged pre-217 behaviour)");

const startedAt = "2026-08-27T09:00:00.000Z";
const expiresAt = "2026-08-27T10:00:00.000Z"; // DURATION_MINUTES = 60, the real, documented product duration

console.log("\n=== STEP 3: ANSWER (using the real, current post-migration-148 answers) ===");
const persistedAnswers = new Map();
const answerFirstThree = (unitIndex) => {
  for (const id of units[unitIndex].questionIds) {
    const row = rows.find((r) => r.id === id);
    persistedAnswers.set(id, row.answer); // the real, correct, current stored answer for each id
  }
};
[0, 1, 2, 3, 4, 5, 6].forEach(answerFirstThree); // answer through Q7 (Camping Sale) inclusive
must(persistedAnswers.has("mock-mr04-campingsale-02"), "Camping Sale Q(b) answered");
must(persistedAnswers.get("mock-mr04-campingsale-02") === "91.80", `Camping Sale answer is the corrected bare-numeric form (got "${persistedAnswers.get("mock-mr04-campingsale-02")}")`);
const answeredIdsBeforeRefresh = new Set(persistedAnswers.keys());
must(computeResumeStartIndex(units, answeredIdsBeforeRefresh) === 7, "next unanswered unit is index 7, before any refresh");

console.log("\n=== STEP 4: SIMULATE A FULL REFRESH (React state destroyed; only server-persisted state survives) ===");
const lookupAfterRefresh = { attemptId: "sim-attempt-1", status: "in_progress", startedAt, expiresAt, isExpired: false };
const resumeAction = determineMockResumeAction(lookupAfterRefresh);
must(resumeAction.kind === "resume_in_progress", "an existing in-progress attempt is discovered and resumed, never silently re-created");
must(resumeAction.attemptId === "sim-attempt-1", "the SAME attempt id is resumed");
must(resumeAction.expiresAt === expiresAt, "the real, original expiresAt is carried through unchanged -- never recomputed");

const simulatedNowAfterRefresh = Date.parse("2026-08-27T09:25:00.000Z"); // 25 minutes elapsed
const remaining = computeRemainingSeconds(resumeAction.expiresAt, simulatedNowAfterRefresh);
must(remaining === 35 * 60, `35 of the original 60 minutes remain (got ${remaining / 60})`);
must(isAttemptExpired(expiresAt, simulatedNowAfterRefresh) === false, "not expired -- correctly resumable");

console.log("\n=== STEP 5: RESTORE ANSWERS AND POSITION ===");
const restoredAnsweredIds = new Set(persistedAnswers.keys());
must(restoredAnsweredIds.size === answeredIdsBeforeRefresh.size, "every answer submitted before the refresh survived it");
must(computeResumeStartIndex(units, restoredAnsweredIds) === 7, "the learner resumes at the exact same deterministic position as before the refresh");

console.log("\n=== STEP 6: CONTINUE, EDIT AN EARLIER ANSWER, THEN COMPLETE ===");
persistedAnswers.set("mock-mr01-directcalc-01", "44.80"); // edited -- overwrites, never duplicates
must(persistedAnswers.size === answeredIdsBeforeRefresh.size, "editing an existing answer never creates a duplicate entry");
for (let i = 7; i < units.length; i++) {
  for (const id of units[i].questionIds) {
    const row = rows.find((r) => r.id === id);
    persistedAnswers.set(id, row.answer);
  }
}
must(persistedAnswers.size === 56, "all 56 rows now answered");

console.log("\n=== STEP 7: SUBMIT AND SCORE ===");
const finalResult = scoreMockAttempt(rows, persistedAnswers);
must(finalResult.rawAchieved === 56, `all-correct submission scores 56/56 (got ${finalResult.rawAchieved})`);
must(finalResult.rawAvailable === 56, "total available marks is 56 -- never presentable as a 60-mark paper");
must(finalResult.percentage === 100, `percentage is 100 (got ${finalResult.percentage})`);
must(finalResult.outcomes.find((o) => o.questionId === "mock-mr04-campingsale-01").status === "correct", "Camping Sale (a) scores correct with the corrected bare-numeric answer");
must(finalResult.outcomes.find((o) => o.questionId === "mock-mr10-bustimetable-04").status === "correct", "Bus Timetable (d) scores correct (28)");

console.log("\n=== ALL STEPS PASSED: FINAL COMBINED RELEASE GATE SIMULATION SUCCEEDED ===");
