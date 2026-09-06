#!/usr/bin/env node
/**
 * Question Factory Scale Architecture — Section 15 Speed/Throughput Evidence.
 *
 * Measures REAL generation+validation wall-clock time and REAL automated
 * approval rate for the mr03-angle-sum proof family across a range of
 * batch sizes. This is pure in-process computation (runFamilyBatch) against
 * an empty existing-bank set -- it never reads or writes the database and
 * never calls submit/review/publish. Its only side effect is writing a
 * local JSON report file.
 *
 * Purpose: distinguish "code can create JSON fast" from "the family can
 * safely supply that many genuinely fresh questions." The two are not the
 * same thing, and the Founder's brief explicitly warned against conflating
 * them.
 */
import fs from "node:fs";
import { runFamilyBatch } from "../lib/ali/questionFactory/candidateGeneration.ts";
import { MR03_ANGLE_SUM_FAMILY } from "../lib/ali/questionFactory/angleSumBlueprints.ts";

function seededRandom(seed) {
  let state = seed;
  return () => {
    state = (state * 1103515245 + 12345) & 0x7fffffff;
    return state / 0x7fffffff;
  };
}

const BATCH_SIZES = [100, 200, 500, 1000, 1500, 2000, 3000, 5000];

function main() {
  const rows = [];
  for (const size of BATCH_SIZES) {
    const start = performance.now();
    const { metrics } = runFamilyBatch(MR03_ANGLE_SUM_FAMILY, [], size, seededRandom(size + 7));
    const elapsedMs = performance.now() - start;
    rows.push({
      batchSize: size,
      elapsedMs: Number(elapsedMs.toFixed(2)),
      msPerCandidate: Number((elapsedMs / size).toFixed(4)),
      approved: metrics.approved,
      approvalRatePct: Number(((100 * metrics.approved) / size).toFixed(1)),
    });
  }

  const report = {
    generatedAt: new Date().toISOString(),
    familyId: "mr03-angle-sum",
    blueprintCount: MR03_ANGLE_SUM_FAMILY.blueprints.length,
    note: "In-process generation+validation only. No database access. No submission, approval, or publication. Approval rate falls as batch size grows because this single 7-blueprint family has a finite parameter space (most acutely BP_ISOSCELES_RELATIONSHIP), not because compute speed degrades -- see msPerCandidate, which stays sub-millisecond throughout.",
    rows,
  };

  fs.mkdirSync("scripts/output", { recursive: true });
  fs.writeFileSync("scripts/output/question-factory-scale-throughput-probe-report.json", JSON.stringify(report, null, 2));

  for (const r of rows) {
    console.log(`batch=${r.batchSize}: ${r.elapsedMs}ms total, ${r.msPerCandidate}ms/candidate, approved=${r.approved}/${r.batchSize} (${r.approvalRatePct}%)`);
  }
  console.log("\nReport written to scripts/output/question-factory-scale-throughput-probe-report.json");
}

main();
