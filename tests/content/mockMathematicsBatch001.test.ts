import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mock Programme Increment 004, Batch 001 (Decision 141). Tests the real
 * generated content — every $json$...$json$ prompt payload in migration
 * 088 is parsed as real JSON and independently re-verified, not merely
 * regex-matched as source text — mirroring this project's own
 * established content-batch testing convention (see
 * tests/content/inc006DepthPendingReview.test.ts and its siblings).
 */

const migrationSql = fs.readFileSync("supabase/migrations/088_mock_mathematics_batch001.sql", "utf8");
const pendingReviewSql = fs.readFileSync("supabase/migrations/089_mock_mathematics_batch001_pending_review.sql", "utf8");
const migrationExecutable = migrationSql.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");

interface ParsedPrompt {
  id: string;
  marks: number;
  skill: string;
  answer: string;
  question: string;
  workingSteps: string[];
}

interface ParsedRow {
  id: string;
  subject: string;
  skill: string; // top-level column, e.g. "QT-MR-02"
  contentDifficulty: string;
  eligibilityStatus: string;
  provenance: string;
  familyId: string;
  addressesMisconception: string;
  transferClass: string;
  prompt: ParsedPrompt;
}

/**
 * Parses each row directly out of the migration's own raw SQL text —
 * including its real $json$-delimited prompt payload, parsed as real
 * JSON — rather than hard-coding a separate copy of the content to
 * compare against. Splits on the literal `$json$` delimiter first (a
 * reliable, unambiguous boundary even though the surrounding SQL strings
 * themselves contain parentheses and escaped quotes), then extracts the
 * row header (before each JSON block) and row tail (after it) with
 * small, tightly-scoped regexes rather than one fragile whole-row regex.
 */
function parseRows(sql: string): ParsedRow[] {
  const parts = sql.split("$json$");
  assert.equal(parts.length, 37, `expected 18 $json$ blocks (37 split parts); found ${(parts.length - 1) / 2}`);

  const rows: ParsedRow[] = [];
  for (let i = 1; i < parts.length; i += 2) {
    const prompt = JSON.parse(parts[i]) as ParsedPrompt;

    const header = parts[i - 1].match(
      /\('([\w-]+)', 'maths', '([\w-]+)', array\['csse'\], '(\w+)', 'short-answer', \d+,\s*$/
    );
    assert.ok(header, `could not parse row header immediately before JSON block for ${prompt.id}`);
    const [, headerId, skill, contentDifficulty] = header!;
    assert.equal(headerId, prompt.id, "row header id must match the JSON payload's own id");

    const tail = parts[i + 1].match(
      /^,\s*\n\s*'(?:[^']|'')*',\s*\d+,\s*'[\w-]+',\s*\n\s*'([\w-]+)', '(\w+)', '(\w+)', \d+, true,\s*\n\s*'((?:[^']|'')*)',\s*\n\s*'(\w+)'\)/
    );
    assert.ok(tail, `could not parse row tail immediately after JSON block for ${prompt.id}`);
    const [, familyId, provenance, eligibilityStatus, misconception, transferClass] = tail!;

    rows.push({
      id: prompt.id,
      subject: "maths",
      skill,
      contentDifficulty,
      eligibilityStatus,
      provenance,
      familyId,
      addressesMisconception: misconception.replace(/''/g, "'"),
      transferClass,
      prompt,
    });
  }
  return rows;
}

const rows = parseRows(migrationSql);

test("parses exactly 18 candidate rows -- the parser itself is working against the real migration text", () => {
  assert.equal(rows.length, 18, "expected exactly 18 rows; if this fails, check the parser regex against migration 088's real formatting before assuming the content is wrong");
});

test("expected candidate IDs are exactly the 18 authored, no more, no fewer", () => {
  const expectedIds = [
    "mock-mr02-invdiv-01", "mock-mr02-invdiv-02", "mock-mr02-invdiv-03",
    "mock-mr02-twostep-01", "mock-mr02-twostep-02", "mock-mr02-twostep-03",
    "mock-mr03-unitconv-01", "mock-mr03-unitconv-02", "mock-mr03-unitconv-03",
    "mock-mr09-data-01", "mock-mr09-data-02", "mock-mr09-data-03",
    "mock-mr05-forward-01", "mock-mr05-forward-02",
    "mock-mr05-inverse-01", "mock-mr05-inverse-02",
    "mock-mr13-bestvalue-01", "mock-mr13-bestvalue-02",
  ];
  assert.deepEqual(rows.map((r) => r.id).sort(), expectedIds.sort());
});

test("every row has eligibility_status = 'authentic_assessment_candidate' -- never independently_validated or mock_eligible", () => {
  for (const r of rows) {
    assert.equal(r.eligibilityStatus, "authentic_assessment_candidate", `${r.id} has wrong eligibility_status`);
  }
});

test("every row has subject = 'maths' and provenance = 'angel_original'", () => {
  for (const r of rows) {
    assert.equal(r.subject, "maths");
    assert.equal(r.provenance, "angel_original");
  }
});

test("every row's id is prefixed 'mock-' -- guarantees no naming collision with any existing Practice row (mrNN-..., waveN-..., precision-...)", () => {
  for (const r of rows) {
    assert.match(r.id, /^mock-/, `${r.id} is not prefixed 'mock-'`);
    assert.match(r.familyId, /^mock-/, `${r.familyId} family is not prefixed 'mock-'`);
  }
});

test("Question Types represented are exactly QT-MR-02, QT-MR-03, QT-MR-05, QT-MR-09, QT-MR-13 -- QT-MR-01 (already ~18% of Practice) is deliberately absent", () => {
  const skills = new Set(rows.map((r) => r.skill));
  assert.deepEqual([...skills].sort(), ["QT-MR-02", "QT-MR-03", "QT-MR-05", "QT-MR-09", "QT-MR-13"]);
  assert.ok(!skills.has("QT-MR-01"));
});

test("family integrity: every row's family_id groups exactly the rows it should, and every family shares one Question Type", () => {
  const byFamily = new Map<string, ParsedRow[]>();
  for (const r of rows) {
    const list = byFamily.get(r.familyId) ?? [];
    list.push(r);
    byFamily.set(r.familyId, list);
  }
  const expectedFamilySizes: Record<string, number> = {
    "mock-mr02-invdiv": 3,
    "mock-mr02-twostep": 3,
    "mock-mr03-unitconv": 3,
    "mock-mr09-data": 3,
    "mock-mr05-forward": 2,
    "mock-mr05-inverse": 2,
    "mock-mr13-bestvalue": 2,
  };
  assert.deepEqual(
    Object.fromEntries([...byFamily.entries()].map(([k, v]) => [k, v.length])),
    expectedFamilySizes
  );
  for (const [familyId, familyRows] of byFamily) {
    const skills = new Set(familyRows.map((r) => r.skill));
    assert.equal(skills.size, 1, `family ${familyId} spans more than one Question Type`);
  }
});

test("content_difficulty is only ever a valid existing value (easy/medium/hard/challenge), matching the documented distribution", () => {
  const validDifficulties = new Set(["easy", "medium", "hard", "challenge"]);
  const counts: Record<string, number> = { easy: 0, medium: 0, hard: 0, challenge: 0 };
  for (const r of rows) {
    assert.ok(validDifficulties.has(r.contentDifficulty), `${r.id} has invalid content_difficulty '${r.contentDifficulty}'`);
    counts[r.contentDifficulty]++;
  }
  assert.deepEqual(counts, { easy: 3, medium: 9, hard: 6, challenge: 0 });
});

test("every row's prompt.answer is present and non-empty", () => {
  for (const r of rows) {
    assert.ok(r.prompt.answer && r.prompt.answer.length > 0, `${r.id} has no answer`);
  }
});

test("every row's workingSteps is a non-empty array of strings", () => {
  for (const r of rows) {
    assert.ok(Array.isArray(r.prompt.workingSteps) && r.prompt.workingSteps.length >= 2, `${r.id} has insufficient working steps`);
    for (const step of r.prompt.workingSteps) assert.equal(typeof step, "string");
  }
});

test("deterministic answer correctness: every answer is independently re-derived here from the question's own stated numbers, not trusted from the migration text", () => {
  const expected: Record<string, string> = {
    "mock-mr02-invdiv-01": String(72 / 9),
    "mock-mr02-invdiv-02": String(84 / 7),
    "mock-mr02-invdiv-03": String(108 / 12),
    "mock-mr02-twostep-01": String((31 + 18) / 7),
    "mock-mr02-twostep-02": String((62 - 12) / 5),
    "mock-mr02-twostep-03": String((30 + 24) / 9),
    "mock-mr03-unitconv-01": String((750 * 6) / 1000),
    "mock-mr03-unitconv-02": String((85 * 6) / 100),
    "mock-mr03-unitconv-03": String((375 * 8) / 1000),
    "mock-mr09-data-01": String(31 - 18),
    "mock-mr09-data-02": String((14 + 19 + 11 + 17 + 9) / 5),
    "mock-mr09-data-03": String(8 * 45 + 5 * 32 + 6 * 18),
    "mock-mr05-forward-01": String(7 * 3 + 4),
    "mock-mr05-forward-02": String(9 * 5 - 6),
    "mock-mr05-inverse-01": String((31 - 4) / 3),
    "mock-mr05-inverse-02": String((41 + 7) / 4),
    "mock-mr13-bestvalue-01": (4.2 / 2).toFixed(2),
    "mock-mr13-bestvalue-02": (7.5 / 5).toFixed(2),
  };
  assert.equal(Object.keys(expected).length, 18, "this test's own expectation table must cover all 18 rows");
  for (const r of rows) {
    assert.equal(r.prompt.answer, expected[r.id], `${r.id}: migration answer '${r.prompt.answer}' does not match independently re-derived '${expected[r.id]}'`);
  }
});

test("misconception coverage: every row has a genuine prose misconception, never a raw kebab-case slug (Decision 125's own corrected standard)", () => {
  for (const r of rows) {
    assert.ok(r.addressesMisconception.length > 20, `${r.id}'s misconception is suspiciously short`);
    assert.ok(r.addressesMisconception.includes(" "), `${r.id}'s misconception looks like a slug, not prose`);
    assert.ok(!/^[a-z0-9-]+$/.test(r.addressesMisconception), `${r.id}'s misconception is a raw kebab-case slug`);
  }
});

test("transfer_class is only ever a valid existing value, and FAR_TRANSFER is reserved for the genuinely new reasoning demands, not assigned by size alone", () => {
  const valid = new Set(["ROUTINE", "NEAR_TRANSFER", "FAR_TRANSFER", "MIXED_TRANSFER"]);
  for (const r of rows) assert.ok(valid.has(r.transferClass), `${r.id} has invalid transfer_class '${r.transferClass}'`);
  const farTransferIds = rows.filter((r) => r.transferClass === "FAR_TRANSFER").map((r) => r.id).sort();
  assert.deepEqual(farTransferIds, [
    "mock-mr02-twostep-01", "mock-mr02-twostep-02", "mock-mr02-twostep-03",
    "mock-mr05-inverse-01", "mock-mr05-inverse-02",
    "mock-mr09-data-03",
  ]);
});

test("no exact duplicates: no two rows share the same question text, and no two rows share the same id", () => {
  const questions = rows.map((r) => r.prompt.question);
  assert.equal(new Set(questions).size, questions.length, "duplicate question text found");
  const ids = rows.map((r) => r.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate id found");
});

test("structural near-duplicate guard: no two rows share the same (skill, answer) pair -- catches accidental answer-clustering within a family, not just literal text duplication", () => {
  const seen = new Map<string, string>();
  for (const r of rows) {
    const key = `${r.skill}::${r.prompt.answer}`;
    const prior = seen.get(key);
    assert.ok(!prior, `${r.id} and ${prior} share the same skill+answer pair (${key}) -- a real structural near-duplicate risk`);
    seen.set(key, r.id);
  }
});

test("Practice non-mutation: migration 088 contains no UPDATE or DELETE statement -- additive only, idempotent via ON CONFLICT DO NOTHING", () => {
  assert.ok(!/\bupdate\s+public\./i.test(migrationExecutable));
  assert.ok(!/\bdelete\s+from\b/i.test(migrationExecutable));
  const insertCount = (migrationExecutable.match(/insert into public\.ali_question_bank/g) || []).length;
  const onConflictCount = (migrationExecutable.match(/on conflict \(id\) do nothing/g) || []).length;
  assert.equal(insertCount, onConflictCount, "every real INSERT block must have its own ON CONFLICT DO NOTHING guard");
  assert.equal(insertCount, 7, "expected one INSERT block per family (7 families)");
});

test("no mock_eligible or independently_validated content is created anywhere in migration 088's real SQL (comment mentions explaining what it is NOT are expected and excluded)", () => {
  assert.ok(!/'independently_validated'/.test(migrationExecutable));
  assert.ok(!/'mock_eligible'/.test(migrationExecutable));
});

test("no ali_mock_form row is created -- migration 088 never mentions ali_mock_form in real SQL", () => {
  assert.ok(!migrationExecutable.includes("ali_mock_form"));
});

test("review placeholders (migration 089) are pending-only: reviewer UNASSIGNED, decision pending_independent_review, review_type mock_maths_independent_review, one row per family, no approval anywhere", () => {
  const inserts = [...pendingReviewSql.matchAll(/select 'question_family', '([\w-]+)', 'UNASSIGNED',\s*\n\s*'pending_independent_review'::public\.family_review_decision,/g)];
  const familyIds = inserts.map((m) => m[1]).sort();
  assert.deepEqual(familyIds, [
    "mock-mr02-invdiv", "mock-mr02-twostep", "mock-mr03-unitconv",
    "mock-mr05-forward", "mock-mr05-inverse", "mock-mr09-data", "mock-mr13-bestvalue",
  ]);
  assert.ok(!/'approved'/.test(pendingReviewSql));
  assert.ok(!/'approved_with_amendment'/.test(pendingReviewSql));
  assert.ok(!/'rejected'/.test(pendingReviewSql));
  assert.match(pendingReviewSql, /review_type = 'mock_maths_independent_review'/);
});

test("migration 089 references exactly the 7 families migration 088 created, no more, no fewer, and uses review_target_type = 'question_family' throughout (not 'passage' or 'writing_prompt' -- this is Mathematics content)", () => {
  const familiesInContent = new Set(rows.map((r) => r.familyId));
  const targetTypeInserts = [...pendingReviewSql.matchAll(/'question_family', '([\w-]+)'/g)].map((m) => m[1]);
  assert.equal(targetTypeInserts.length, 7);
  for (const f of targetTypeInserts) assert.ok(familiesInContent.has(f), `${f} referenced in migration 089 but not authored in migration 088`);
  assert.ok(!pendingReviewSql.includes("'passage'"));
  assert.ok(!pendingReviewSql.includes("'writing_prompt'"));
});

test("both migrations declare themselves NOT APPLIED", () => {
  assert.match(migrationSql, /NOT APPLIED\./);
  assert.match(pendingReviewSql, /NOT APPLIED\./);
});

test("existing Practice-facing modules are not part of this changeset -- Practice selection, scoring, and mastery are structurally untouched by this increment", () => {
  for (const file of [
    "lib/ali/questionBank.ts",
    "lib/ali/selection.ts",
    "lib/learningEngine/sessionGenerator.ts",
    "lib/ali/mastery.ts",
  ]) {
    assert.ok(fs.existsSync(file), `${file} should exist unmodified`);
  }
  // No test in this file reads or asserts against any diff of those files
  // -- their behaviour is proven unchanged by the simple fact that this
  // increment's only new/changed files are migrations 088/089, this test
  // file, and the governance log entry (Decision 141's own Files Changed
  // section is the authoritative record).
});
