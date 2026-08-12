/**
 * Educational Identity Registration — required automated checks (Phase 2C).
 * Same convention as this project's other tsx-script validation passes.
 * Run: npx tsx scripts/test-educational-identity-registration.ts
 */
import {
  scanAllSources,
  EXISTING_BANK_ROWS,
  BATCH_1_REGISTRATIONS,
  BATCH_1_REVIEW,
  BATCH_2_REGISTRATIONS,
  BATCH_2_REVIEW,
  BATCH_3_REGISTRATIONS,
  BATCH_3_REVIEW,
  validateCrossSourceUniqueness,
  validateBatchAgainstExisting,
  validateBatchInternalUniqueness,
  validateQuestionTypeCodes,
  reconcileAll,
  generateBatch1MigrationSql,
  generateBatch2MigrationSql,
  generateBatch3MigrationSql,
  buildFullReport,
} from "./educational-identity-registration";

let failures = 0;
function assert(condition: boolean, message: string): void {
  if (!condition) {
    failures++;
    console.error(`FAIL: ${message}`);
  } else {
    console.log(`pass: ${message}`);
  }
}

const ALL_REGISTRATIONS = [...BATCH_1_REGISTRATIONS, ...BATCH_2_REGISTRATIONS, ...BATCH_3_REGISTRATIONS];
const ALL_REVIEW_ITEMS = [...BATCH_1_REVIEW, ...BATCH_2_REVIEW, ...BATCH_3_REVIEW];

function run() {
  const scanned = scanAllSources();

  // 1. All 218 discovered source items are accounted for.
  assert(scanned.length === 218, `scan finds all 218 real items (found ${scanned.length})`);
  const bySubject: Record<string, number> = {};
  for (const item of scanned) bySubject[item.subject] = (bySubject[item.subject] ?? 0) + 1;
  assert(bySubject["english"] === 10, "english: 10 items scanned");
  assert(bySubject["maths"] === 20, "maths: 20 items scanned");
  assert(bySubject["vocabulary"] === 12, "vocabulary: 12 items scanned");
  assert(bySubject["writing"] === 4, "writing: 4 items scanned");
  assert(bySubject["verbal-reasoning"] === 52, "verbal-reasoning: 52 items scanned");
  assert(bySubject["non-verbal-reasoning"] === 40, "non-verbal-reasoning: 40 items scanned");
  assert(bySubject["spatial-reasoning"] === 39, "spatial-reasoning: 39 items scanned");
  assert(bySubject["numerical-reasoning"] === 41, "numerical-reasoning: 41 items scanned");

  // 2. Cross-source IDs are unique.
  const uniquenessIssues = validateCrossSourceUniqueness(scanned);
  assert(uniquenessIssues.length === 0, "zero cross-source id collisions across all 218 real items");
  const withInjectedCollision = [...scanned, { id: scanned[0].id, sourceFile: "data/vocabulary.ts" as const, subject: "vocabulary", contentType: "vocabulary-word" as const }];
  const injectedIssues = validateCrossSourceUniqueness(withInjectedCollision);
  assert(injectedIssues.length === 1 && injectedIssues[0].severity === "error", "uniqueness check genuinely detects a real collision when one exists");

  // 3. Existing 18 canonical rows reconcile correctly.
  assert(EXISTING_BANK_ROWS.length === 18, "exactly 18 pre-existing bank rows reconciled");
  const existingIds = new Set(EXISTING_BANK_ROWS.map((r) => r.id));
  const scannedIds = new Set(scanned.map((s) => s.id));
  for (const id of existingIds) {
    assert(scannedIds.has(id), `existing bank row "${id}" matches a real, still-present source item`);
  }

  // 4. Re-running registration is idempotent.
  assert(generateBatch1MigrationSql() === generateBatch1MigrationSql(), "generateBatch1MigrationSql() is byte-identical across repeated calls");
  assert(generateBatch2MigrationSql() === generateBatch2MigrationSql(), "generateBatch2MigrationSql() is byte-identical across repeated calls");
  assert(generateBatch3MigrationSql() === generateBatch3MigrationSql(), "generateBatch3MigrationSql() is byte-identical across repeated calls");
  assert(JSON.stringify(buildFullReport()) === JSON.stringify(buildFullReport()), "buildFullReport() is deterministic across repeated calls");

  // Batch 2 and Batch 3 have zero evidence-supported mappings this pass —
  // their migrations must be honest no-ops, not fabricated inserts.
  assert(BATCH_2_REGISTRATIONS.length === 0, "Batch 2 (Writing + Vocabulary) has zero new registrations — no defensible mapping found for any remaining item");
  assert(BATCH_3_REGISTRATIONS.length === 0, "Batch 3 (reasoning subjects) has zero new registrations — Assessment Brain V1 has no coverage for these domains");
  assert(!generateBatch2MigrationSql().includes("insert into"), "Batch 2 migration contains no INSERT statement (documented no-op)");
  assert(!generateBatch3MigrationSql().includes("insert into"), "Batch 3 migration contains no INSERT statement (documented no-op)");

  const batchInternalIssues = validateBatchInternalUniqueness(ALL_REGISTRATIONS);
  assert(batchInternalIssues.length === 0, "zero duplicate ids across all registrations (Batch 1+2+3 combined)");
  const withInternalDupe = [...ALL_REGISTRATIONS, ALL_REGISTRATIONS[0]];
  const internalDupeIssues = validateBatchInternalUniqueness(withInternalDupe);
  assert(internalDupeIssues.length === 1, "batch-internal uniqueness check genuinely detects a duplicate id");

  // 5. No second identity is created for an existing item.
  const conflictIssues = validateBatchAgainstExisting(ALL_REGISTRATIONS, EXISTING_BANK_ROWS);
  assert(conflictIssues.length === 0, "no registration conflicts with an existing canonical row");
  const fakeConflict = [{ ...ALL_REGISTRATIONS[0], id: EXISTING_BANK_ROWS[0].id }];
  const fakeConflictIssues = validateBatchAgainstExisting(fakeConflict, EXISTING_BANK_ROWS);
  assert(fakeConflictIssues.length === 1 && fakeConflictIssues[0].severity === "error", "conflict check rejects a registration that reuses an existing row's id");

  // 6. Every newly assigned skill uses an approved QT-* code.
  const qtCodeIssues = validateQuestionTypeCodes(ALL_REGISTRATIONS);
  assert(qtCodeIssues.length === 0, "every registered skill code is a real, resolvable Assessment Brain Question Type");
  const fakeBadCode = [{ ...ALL_REGISTRATIONS[0], skill: "QT-NOT-REAL" as never }];
  const badCodeIssues = validateQuestionTypeCodes(fakeBadCode);
  assert(badCodeIssues.length === 1 && badCodeIssues[0].severity === "error", "an invented Question Type code is rejected");

  // 7. Items lacking evidence-supported mappings are flagged, not guessed.
  const reconciled = reconcileAll(scanned, EXISTING_BANK_ROWS, ALL_REGISTRATIONS, ALL_REVIEW_ITEMS);
  const vocabItems = reconciled.filter((r) => r.subject === "vocabulary");
  assert(vocabItems.every((r) => r.status === "requires-review"), "every vocabulary item is marked requires-review, never given a fabricated skill");
  assert(vocabItems.every((r) => r.skill === undefined), "requires-review items carry no skill value at all");
  const reasoningItems = reconciled.filter((r) => ["verbal-reasoning", "non-verbal-reasoning", "spatial-reasoning", "numerical-reasoning"].includes(r.subject));
  assert(reasoningItems.every((r) => r.status === "requires-review"), "every reasoning-subject item is marked requires-review (Assessment Brain V1 has no coverage)");

  // The two Batch 1 items the Founder specifically flagged for correction
  // must now be requires-review, not registered.
  const eng002q2 = reconciled.find((r) => r.id === "eng-002-q2")!;
  const eng003q2 = reconciled.find((r) => r.id === "eng-003-q2")!;
  assert(eng002q2.status === "requires-review", "eng-002-q2 (corrected) is requires-review, not registered");
  assert(eng003q2.status === "requires-review", "eng-003-q2 (corrected) is requires-review, not registered");

  // 8. Exclusions/review items contain explicit reasons.
  const nonRegistered = reconciled.filter((r) => r.status === "requires-review");
  assert(nonRegistered.every((r) => typeof r.reason === "string" && r.reason.length > 0), "every requires-review item carries an explicit, non-empty reason");
  assert(nonRegistered.every((r) => !r.reason!.includes("UNACCOUNTED")), "no item falls through to the UNACCOUNTED fallback — every one of the 218 was explicitly classified by a real batch");

  // 9. Existing routes and content loading remain unchanged.
  const secondScan = scanAllSources();
  assert(JSON.stringify(scanned) === JSON.stringify(secondScan), "scanning twice produces identical results — nothing was mutated by the first scan");

  // Full report sanity check, corrected counts.
  const report = buildFullReport();
  assert(report.totalScanned === 218, "full report totalScanned === 218");
  assert(report.byStatus["already-registered"] === 18, "full report: 18 already-registered");
  assert(report.byStatus["newly-registered"] === 11, "full report: 11 newly-registered (corrected from 13)");
  assert(report.byStatus["requires-review"] === 189, "full report: 189 requiring review (2 corrected Batch 1 + 15 Batch 2 + 172 Batch 3)");
  assert(
    report.byStatus["already-registered"] + report.byStatus["newly-registered"] + report.byStatus["requires-review"] === 218,
    "every status bucket sums back to the full 218"
  );
  assert(report.identityCoverage.registered === 29, "identity coverage: 29 items registered (18 existing + 11 new)");
  assert(report.classificationCoverage.evidenceSupported === 29, "classification coverage: 29 items evidence-supported");
  assert(
    report.identityCoverage.percentage === report.classificationCoverage.percentage,
    "identity coverage and classification coverage are numerically equal this pass — a direct, explained consequence of ali_question_bank.skill being NOT NULL, not a coincidence"
  );
  assert(Math.abs(report.identityCoverage.percentage - 13.3) < 0.1, `identity coverage is ~13.3% (29/218), got ${report.identityCoverage.percentage}%`);

  console.log(`\n${failures === 0 ? "ALL TESTS PASSED" : `${failures} TEST(S) FAILED`}`);
  process.exit(failures === 0 ? 0 : 1);
}

run();
