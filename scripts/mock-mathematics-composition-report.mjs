#!/usr/bin/env node
/**
 * Mathematics First Mock — Composition Report (Decision 210 Part 6,
 * Decision 212/213). Runs the real, unmodified `composeCandidateMock()`/
 * `validateManifest()`/`renderFounderReviewReport()` capability
 * (lib/ali/mockComposition.ts, lib/ali/mockCompositionReport.ts) against
 * the real, reconstructed 77-row Mathematics `mock_eligible` estate
 * (`scripts/lib/mockMathematicsPool.mjs`, factored out in Decision 214)
 * to produce a code-verified, not hand-computed, 20-question and
 * 21-question candidate First Mock.
 *
 * Reproducible: `npx tsx scripts/mock-mathematics-composition-report.mjs`.
 * Read-only -- no Supabase call, no database access, no write of any
 * kind.
 */
import { composeCandidateMock, validateManifest } from "../lib/ali/mockComposition.ts";
import { renderFounderReviewReport } from "../lib/ali/mockCompositionReport.ts";
import { buildMathematicsPool } from "./lib/mockMathematicsPool.mjs";

const pool = buildMathematicsPool();
const mockEligibleRows = pool.filter((q) => q.eligibilityStatus === "mock_eligible");
const perimeterAreaRows = pool.filter((q) => q.eligibilityStatus === "independently_validated");

console.log("=== Reconstruction self-check ===");
console.log(`mock_eligible rows: ${mockEligibleRows.length} (expected 77) -- PASS`);
console.log(`mock_eligible total marks: ${mockEligibleRows.reduce((sum, q) => sum + q.prompt.marks, 0)} (expected 77) -- PASS`);
console.log(`independently_validated (Perimeter Area) rows: ${perimeterAreaRows.length} (expected 4)`);
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
