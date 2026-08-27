#!/usr/bin/env node
/**
 * Mathematics First Mock — Final Curation (Decision 214, Founder-directed).
 * Takes Decision 212/213's real 21-question/56-mark candidate, applies
 * exactly the two Founder-approved bounded refinements, and validates the
 * result with the existing, unmodified capability:
 *
 *   1. ARCHETYPE-BALANCE SUBSTITUTION (Decision 213 Part 6's own
 *      counterfactual, now applied): mock-mr06-sumdiff removed,
 *      mock-mr09-runningclub added. Both are 2-mark, 2-row, complete
 *      grouped experiences -- a straight one-for-one swap, not an
 *      algorithm change. `composeCandidateMock()` itself is never
 *      touched; this script performs EXPLICIT manifest curation, exactly
 *      as Decision 213 §11 recommended for a one-form decision.
 *
 *   2. EDUCATIONAL-PROGRESSION REORDERING: the SAME 21 experiences
 *      (post-substitution), reordered by real, inspected difficulty
 *      metadata (never inferred from family id) into a defensible
 *      learner-facing sequence -- gentle opening, gradual escalation,
 *      no two adjacent questions sharing a primary QT archetype, a
 *      genuine breather/ramp pattern through the harder back section,
 *      ending on a strong, well-rounded closer. Every question's own
 *      wording, subparts, marks, and shared stem are byte-unchanged;
 *      only the SEQUENCE of already-selected experiences changes.
 *
 * Reproducible: `npx tsx scripts/mock-mathematics-first-mock-curation.mjs`.
 * Read-only -- no Supabase call, no database access, no write of any
 * kind.
 */
import { buildExperiences, validateManifest } from "../lib/ali/mockComposition.ts";
import { buildMockFormInsertPayload } from "../lib/ali/mockFreezeManifest.ts";
import { buildMathematicsPool } from "./lib/mockMathematicsPool.mjs";

const pool = buildMathematicsPool();

// =========================================================================
// STEP 1 -- ARCHETYPE-BALANCE SUBSTITUTION
// =========================================================================
// Decision 212/213's real 21Q candidate (byte-identical composeCandidateMock
// output, re-derived from experience ids, not retyped): the 20 experiences
// unchanged from the 20Q candidate, plus triangleanglesum. mock-mr06-sumdiff
// is removed and mock-mr09-runningclub is added -- an explicit substitution,
// never a re-run of the composer with different parameters.
const CURATED_EXPERIENCE_IDS = [
  "mock-mr01-directcalc",
  "mock-mr01mr10-costumeschedule-01",
  "mock-mr01mr10-costumeschedule-02",
  "mock-mr02-invdiv",
  "mock-mr02-twostep",
  "mock-mr03-unitconv",
  "mock-mr04-campingsale",
  "mock-mr04-percentchange",
  "mock-mr04-reversepercent",
  "mock-mr05-forward",
  "mock-mr05-inverse",
  "mock-mr06-linkedvalues",
  "mock-mr06-multiplerelation",
  "mock-mr06-numberpuzzle",
  // "mock-mr06-sumdiff" REMOVED per Founder decision (Decision 214, Part 1)
  "mock-mr07-isoscelesproperty",
  "mock-mr07-triangleanglesum",
  "mock-mr09-funrun",
  "mock-mr10-bustimetable",
  "mock-mr11-roundingbounds",
  "mock-mr13-craftstall",
  "mock-mr09-runningclub", // ADDED per Founder decision (Decision 214, Part 1)
];
if (CURATED_EXPERIENCE_IDS.length !== 21) {
  throw new Error(`Curation self-check FAILED: expected 21 experience ids after substitution, found ${CURATED_EXPERIENCE_IDS.length}.`);
}

// Resolve each experience id to its full ordered questionIds via the real,
// unmodified buildExperiences() -- never hand-listed row ids.
const allExperiences = buildExperiences(pool.filter((q) => q.eligibilityStatus === "mock_eligible"));
const experienceById = new Map(allExperiences.map((e) => [e.experienceId, e]));
for (const id of CURATED_EXPERIENCE_IDS) {
  if (!experienceById.has(id)) throw new Error(`Curation self-check FAILED: experience "${id}" not found in the real mock_eligible pool.`);
}

// =========================================================================
// STEP 2 -- EDUCATIONAL-PROGRESSION REORDERING
// =========================================================================
// The Founder-approved final learner-facing order (Decision 214, designed
// from each experience's own REAL content_difficulty array -- see the
// rationale comment beside each entry -- never inferred from family id).
const FINAL_ORDER = [
  "mock-mr01-directcalc", //           1. easy,easy -- opener
  "mock-mr02-invdiv", //                2. easy,easy,easy -- still gentle, different skill
  "mock-mr03-unitconv", //              3. medium,medium,medium -- first step up
  "mock-mr05-forward", //               4. medium,medium
  "mock-mr04-percentchange", //         5. medium,medium
  "mock-mr07-triangleanglesum", //      6. medium,medium -- geometry intro, kept apart from isoscelesproperty
  "mock-mr04-campingsale", //           7. easy,medium,hard,hard -- first bridge into hard content, opens gently
  "mock-mr01mr10-costumeschedule-01", //8. hard,hard -- first fully-hard question
  "mock-mr06-linkedvalues", //          9. medium,medium,hard -- breather, opens medium
  "mock-mr05-inverse", //              10. hard,hard -- natural follow-on to Q4's forward machines, well separated
  "mock-mr09-runningclub", //          11. medium,hard -- breather, data reasoning #1
  "mock-mr04-reversepercent", //       12. hard,hard
  "mock-mr11-roundingbounds", //       13. easy,easy,medium,hard -- breather/reset, opens easy
  "mock-mr07-isoscelesproperty", //    14. hard,hard -- geometry #2, well separated from Q6
  "mock-mr09-funrun", //               15. medium,medium,hard,hard -- breather, data reasoning #2
  "mock-mr02-twostep", //              16. hard,hard,hard -- arithmetic #2, bookends Q2
  "mock-mr06-numberpuzzle", //         17. medium,medium,hard -- breather
  "mock-mr10-bustimetable", //         18. medium,medium,hard,hard -- breather
  "mock-mr06-multiplerelation", //     19. hard,hard -- algebra #3, well separated from Q9/Q17
  "mock-mr01mr10-costumeschedule-02", //20. hard,hard -- second costumeschedule instance, well separated from Q8
  "mock-mr13-craftstall", //           21. medium,medium,hard -- strong, well-rounded closer
];
if (FINAL_ORDER.length !== 21 || new Set(FINAL_ORDER).size !== 21) {
  throw new Error("Curation self-check FAILED: FINAL_ORDER must contain exactly 21 distinct experience ids.");
}
if (JSON.stringify([...FINAL_ORDER].sort()) !== JSON.stringify([...CURATED_EXPERIENCE_IDS].sort())) {
  throw new Error("Curation self-check FAILED: FINAL_ORDER does not contain exactly the same 21 experiences as CURATED_EXPERIENCE_IDS -- reordering must never change WHICH experiences are selected.");
}

// Adjacent-primary-archetype check (the FIRST skill tag on each experience
// is treated as primary -- e.g. a costumeschedule row's own first skill).
const primarySkillOf = (expId) => experienceById.get(expId).skills[0];
const archetypeCollisions = [];
for (let i = 0; i < FINAL_ORDER.length - 1; i++) {
  const a = primarySkillOf(FINAL_ORDER[i]);
  const b = primarySkillOf(FINAL_ORDER[i + 1]);
  if (a === b) archetypeCollisions.push(`Q${i + 1} (${FINAL_ORDER[i]}) and Q${i + 2} (${FINAL_ORDER[i + 1]}) both primary-skill ${a}`);
}

const finalManifestQuestionIds = FINAL_ORDER.flatMap((expId) => experienceById.get(expId).questionIds);

// =========================================================================
// STEP 3 -- REVALIDATE THE FINAL MANIFEST
// =========================================================================
const report = validateManifest(finalManifestQuestionIds, pool, "maths", "csse");

console.log("=== FINAL MANIFEST VALIDATION ===");
console.log(`valid=${report.valid}`);
console.log(`numberedQuestionCount=${report.numberedQuestionCount} (expected 21)`);
console.log(`totalMarks=${report.totalMarks} (expected 56)`);
console.log(`rawRowCount=${report.rawRowCount}`);
console.log(`Perimeter Area present: ${finalManifestQuestionIds.some((id) => id.includes("perimeterarea"))} (expected false)`);
console.log(`Sum/Difference present: ${finalManifestQuestionIds.some((id) => id.includes("sumdiff"))} (expected false)`);
console.log(`Running Club present: ${finalManifestQuestionIds.some((id) => id.includes("runningclub"))} (expected true)`);
console.log(`Running Club row count: ${finalManifestQuestionIds.filter((id) => id.includes("runningclub")).length} (expected 2, complete group)`);
console.log(`Duplicate question ids: ${finalManifestQuestionIds.length - new Set(finalManifestQuestionIds).size} (expected 0)`);
console.log(`Adjacent same-primary-archetype collisions: ${archetypeCollisions.length} (expected 0)`);
if (archetypeCollisions.length > 0) console.log(archetypeCollisions.map((c) => "  - " + c).join("\n"));
if (report.failures.length > 0) console.log(report.failures.map((f) => `  - [${f.code}] ${f.detail}`).join("\n"));
console.log("");

if (!report.valid) {
  throw new Error("FINAL MANIFEST INVALID -- stopping, per the governing directive's own instruction to never push through a discrepancy.");
}
if (archetypeCollisions.length > 0) {
  throw new Error("FINAL ORDER has an adjacent same-primary-archetype collision -- stopping.");
}

// =========================================================================
// DIFFICULTY PROGRESSION REPORT
// =========================================================================
console.log("=== DIFFICULTY PROGRESSION (per numbered question, in final order) ===");
FINAL_ORDER.forEach((expId, i) => {
  const exp = experienceById.get(expId);
  console.log(`Q${i + 1}: [${expId}] marks=${exp.marks} difficulty=${exp.contentDifficulties.join(",")}`);
});
console.log("");
console.log(`Overall difficulty distribution: easy=${report.difficultyDistribution.easy} medium=${report.difficultyDistribution.medium} hard=${report.difficultyDistribution.hard} challenge=${report.difficultyDistribution.challenge}`);
console.log("");

// =========================================================================
// ARCHETYPE DISTRIBUTION REPORT
// =========================================================================
console.log("=== ARCHETYPE (QT) DISTRIBUTION ===");
console.log(Object.entries(report.skillDistribution).sort().map(([k, v]) => `${k}=${v}`).join(", "));
console.log("");

// =========================================================================
// FINAL FOUNDER LEARNER-PAPER + AUDIT VIEW (final order)
// =========================================================================
// NOTE: `renderFounderReviewReport()` internally calls `buildExperiences()`,
// which always re-derives ALPHABETICAL experienceId order regardless of the
// order questions are passed in -- a real, disclosed limitation surfaced
// for the first time by this script (Decision 212/213's own candidates
// happened to already be alphabetically composed, so this was never
// visible before). NOT fixed here -- fixing it would mean modifying
// `lib/ali/mockComposition.ts`'s tested `buildExperiences()` contract,
// which the governing directive's own boundary ("do not modify the general
// composer algorithm merely to achieve this one-form substitution")
// counsels against for a one-form decision. This script instead renders
// its own order-preserving view directly from `FINAL_ORDER`, reusing only
// the pool's own real content (never re-deriving order through
// `buildExperiences()`/`renderFounderReviewReport()` for display).
const byIdRow = new Map(pool.map((q) => [q.id, q]));
function questionTextOf(row) { return row.prompt.question; }
function sharedStemOf(row) { return typeof row.prompt.sharedStem === "string" && row.prompt.sharedStem.length > 0 ? row.prompt.sharedStem : null; }
function stimulusOf(row) { return row.prompt.stimulus ?? null; }
function formatStimulus(s) {
  if (!s || s.type !== "table") return null;
  const header = `    | ${s.headers.join(" | ")} |`;
  const rows = s.rows.map((r) => `    | ${r.join(" | ")} |`);
  const caption = s.caption ? `    (${s.caption})\n` : "";
  return `${caption}${header}\n${rows.join("\n")}`;
}

console.log("=== Mathematics First Mock 1 -- FINAL CURATED ORDER (Founder audit view: IDs, answers, difficulty, skill) ===");
FINAL_ORDER.forEach((expId, i) => {
  const exp = experienceById.get(expId);
  const rows = exp.questionIds.map((id) => byIdRow.get(id));
  console.log(`${i + 1}. [${expId}] marks=${exp.marks} difficulty=${exp.contentDifficulties.join("/")} skill=${exp.skills.join(",")}`);
  const stem = rows.length > 1 ? sharedStemOf(rows[0]) : null;
  if (stem) console.log(`   Shared stem: ${stem}`);
  const stimulusRow = rows.find((r) => formatStimulus(stimulusOf(r)) !== null);
  if (stimulusRow) {
    console.log(`   Stimulus:`);
    console.log(formatStimulus(stimulusOf(stimulusRow)));
  }
  for (const row of rows) {
    const label = row.subpartLabel ? row.subpartLabel : "";
    const text = questionTextOf(row);
    const tail = stem && text.startsWith(stem) ? text.slice(stem.length).trimStart() : text;
    console.log(`   ${label} ${tail}`.trimStart() + `   [answer: ${row.prompt.answer}]`);
  }
});
console.log("");

// =========================================================================
// STEP 5 -- FREEZE PAYLOAD (data shaping only, never inserted by this script)
// =========================================================================
const composedAt = new Date().toISOString();
const payload = buildMockFormInsertPayload("first-mock-mathematics-v1", report, 21, composedAt, { specificationVersion: 1, section: "mathematics" });
console.log("=== FREEZE PAYLOAD (buildMockFormInsertPayload output -- not inserted by this script) ===");
console.log(JSON.stringify({ id: payload.id, subject: payload.subject, specification_version: payload.specification_version, attempt_type: payload.attempt_type, active: payload.active, question_manifest_length: payload.question_manifest.length, composition_provenance: payload.composition_provenance }, null, 2));
