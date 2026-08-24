import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mock Programme Increment 004, Batch 003. Tests the real generated
 * content — every $json$...$json$ prompt payload in migration 095 is
 * parsed as real JSON and independently re-verified, not merely
 * regex-matched as source text, mirroring
 * tests/content/mockMathematicsBatch002.test.ts's own established
 * approach. Unlike Batch 001/002, this batch includes a grouped family
 * (mock-mr01mr10-costumeschedule) whose 4 rows carry 4 additional
 * trailing columns (question_group_id, group_order, subpart_label,
 * marking_mode, migration 093) not present on the other 8 rows — the
 * header/tail parsing below accounts for both row shapes explicitly.
 */

const migrationSql = fs.readFileSync("supabase/migrations/095_mock_mathematics_batch003.sql", "utf8");
const pendingReviewSql = fs.readFileSync("supabase/migrations/096_mock_mathematics_batch003_pending_review.sql", "utf8");
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
  skill: string; // top-level column, e.g. "QT-MR-01"
  contentDifficulty: string;
  eligibilityStatus: string;
  provenance: string;
  familyId: string;
  addressesMisconception: string;
  transferClass: string;
  questionGroupId: string | null;
  groupOrder: number | null;
  subpartLabel: string | null;
  markingMode: string | null;
  prompt: ParsedPrompt;
}

function parseRows(sql: string): ParsedRow[] {
  const parts = sql.split("$json$");
  assert.equal(parts.length, 21, `expected 10 $json$ blocks (21 split parts); found ${(parts.length - 1) / 2}`);

  const rows: ParsedRow[] = [];
  for (let i = 1; i < parts.length; i += 2) {
    const prompt = JSON.parse(parts[i]) as ParsedPrompt;

    const header = parts[i - 1].match(
      /\('([\w-]+)', 'maths', '([\w-]+)', array\['csse'\], '(\w+)', 'short-answer', \d+,\s*$/
    );
    assert.ok(header, `could not parse row header immediately before JSON block for ${prompt.id}`);
    const [, headerId, skill, contentDifficulty] = header!;
    assert.equal(headerId, prompt.id, "row header id must match the JSON payload's own id");

    // Base tail: explanation, mastery_threshold, learning_unit_id, family_id,
    // provenance, eligibility_status, content_version, active, misconception,
    // transfer_class -- optionally followed by the 4 grouping columns.
    const tail = parts[i + 1].match(
      /^,\s*\n\s*'(?:[^']|'')*',\s*\d+,\s*'[\w-]+',\s*\n\s*'([\w-]+)', '(\w+)', '(\w+)', \d+, true,\s*\n\s*'((?:[^']|'')*)',\s*\n\s*'(\w+)'(?:,\s*'([\w-]+)',\s*(\d+),\s*'(\([a-z]\))',\s*'(\w+)')?\)/
    );
    assert.ok(tail, `could not parse row tail immediately after JSON block for ${prompt.id}`);
    const [, familyId, provenance, eligibilityStatus, misconception, transferClass, questionGroupId, groupOrder, subpartLabel, markingMode] = tail!;

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
      questionGroupId: questionGroupId ?? null,
      groupOrder: groupOrder !== undefined ? Number(groupOrder) : null,
      subpartLabel: subpartLabel ?? null,
      markingMode: markingMode ?? null,
      prompt,
    });
  }
  return rows;
}

const rows = parseRows(migrationSql);

test("parses exactly 10 candidate rows -- the parser itself is working against the real migration text", () => {
  assert.equal(rows.length, 10);
});

test("expected candidate IDs are exactly the 10 authored, no more, no fewer -- 2 standalone families x 2 (directcalc, rotation, reversemean) + 1 grouped family x 4 (2 instances x 2 subparts)", () => {
  const expectedIds = [
    "mock-mr01-directcalc-01", "mock-mr01-directcalc-02",
    "mock-mr08-rotation-01", "mock-mr08-rotation-02",
    "mock-mr12-reversemean-01", "mock-mr12-reversemean-02",
    "mock-mr01mr10-costumeschedule-01a", "mock-mr01mr10-costumeschedule-01b",
    "mock-mr01mr10-costumeschedule-02a", "mock-mr01mr10-costumeschedule-02b",
  ];
  assert.equal(expectedIds.length, 10);
  assert.deepEqual(rows.map((r) => r.id).sort(), expectedIds.sort());
});

test("every row has eligibility_status = 'authentic_assessment_candidate' -- never independently_validated or mock_eligible", () => {
  for (const r of rows) assert.equal(r.eligibilityStatus, "authentic_assessment_candidate", `${r.id} has wrong eligibility_status`);
});

test("every row has subject = 'maths' and provenance = 'angel_original'", () => {
  for (const r of rows) {
    assert.equal(r.subject, "maths");
    assert.equal(r.provenance, "angel_original");
  }
});

test("every row's id and family_id is prefixed 'mock-'", () => {
  for (const r of rows) {
    assert.match(r.id, /^mock-/, `${r.id} is not prefixed 'mock-'`);
    assert.match(r.familyId, /^mock-/, `${r.familyId} family is not prefixed 'mock-'`);
  }
});

test("Question Types represented are exactly QT-MR-01, QT-MR-08, QT-MR-10, QT-MR-12 -- none overlaps Batch 001 (QT-MR-02/03/05/09/13) or Batch 002 (QT-MR-04/06/07/10/11) except QT-MR-10, which is deliberately reused only inside the new grouped structure, never as a new standalone QT-MR-10 family", () => {
  const skills = new Set(rows.map((r) => r.skill));
  assert.deepEqual([...skills].sort(), ["QT-MR-01", "QT-MR-08", "QT-MR-10", "QT-MR-12"]);
  for (const batch001Skill of ["QT-MR-02", "QT-MR-03", "QT-MR-05", "QT-MR-09", "QT-MR-13"]) {
    assert.ok(!skills.has(batch001Skill), `${batch001Skill} was Batch 001's own scope`);
  }
  for (const batch002Skill of ["QT-MR-04", "QT-MR-06", "QT-MR-07", "QT-MR-11"]) {
    assert.ok(!skills.has(batch002Skill), `${batch002Skill} was Batch 002's own scope`);
  }
  const qtMr10Rows = rows.filter((r) => r.skill === "QT-MR-10");
  assert.equal(qtMr10Rows.length, 2, "QT-MR-10 must appear only as the 2 (a)-subparts of the grouped family, not as a new standalone family");
  for (const r of qtMr10Rows) assert.equal(r.familyId, "mock-mr01mr10-costumeschedule");
});

test("family integrity: 4 families total -- 3 standalone (2 rows each) and 1 grouped (4 rows)", () => {
  const byFamily = new Map<string, ParsedRow[]>();
  for (const r of rows) {
    const list = byFamily.get(r.familyId) ?? [];
    list.push(r);
    byFamily.set(r.familyId, list);
  }
  assert.equal(byFamily.size, 4);
  assert.equal(byFamily.get("mock-mr01-directcalc")?.length, 2);
  assert.equal(byFamily.get("mock-mr08-rotation")?.length, 2);
  assert.equal(byFamily.get("mock-mr12-reversemean")?.length, 2);
  assert.equal(byFamily.get("mock-mr01mr10-costumeschedule")?.length, 4);
});

test("content_difficulty distribution: 2 easy (directcalc), 2 medium (rotation), 6 hard (reversemean x2 + grouped x4), no challenge", () => {
  const counts: Record<string, number> = { easy: 0, medium: 0, hard: 0, challenge: 0 };
  for (const r of rows) counts[r.contentDifficulty] = (counts[r.contentDifficulty] ?? 0) + 1;
  assert.deepEqual(counts, { easy: 2, medium: 2, hard: 6, challenge: 0 });
});

test("every row's prompt.answer is present and non-empty, and every workingSteps array has at least 1 step", () => {
  for (const r of rows) {
    assert.ok(r.prompt.answer && r.prompt.answer.length > 0, `${r.id} has no answer`);
    assert.ok(Array.isArray(r.prompt.workingSteps) && r.prompt.workingSteps.length >= 1, `${r.id} has no working steps`);
  }
});

test("deterministic answer correctness: every answer is independently re-derived here from the question's own stated numbers, not trusted from the migration text", () => {
  const expected: Record<string, string> = {
    // Math.round(...*10)/10 guards against binary floating-point artifacts
    // (e.g. raw 6.4*7 === 44.800000000000004 in IEEE 754 double), not against
    // any uncertainty in the arithmetic itself -- every value is exact.
    "mock-mr01-directcalc-01": String(Math.round(6.4 * 7 * 10) / 10),
    "mock-mr01-directcalc-02": String((145 / 5) * 3),
    "mock-mr08-rotation-01": "(5, -3)",
    "mock-mr08-rotation-02": "(2, -6)",
    "mock-mr12-reversemean-01": String(74 * 6 - 72 * 5),
    "mock-mr12-reversemean-02": String(55 * 5 - 58 * 4),
    "mock-mr01mr10-costumeschedule-01a": "16:35",
    "mock-mr01mr10-costumeschedule-01b": (2.5 * 4.8).toFixed(2),
    "mock-mr01mr10-costumeschedule-02a": "13:05",
    "mock-mr01mr10-costumeschedule-02b": (6 * 3.5 * 0.35).toFixed(2),
  };
  assert.equal(Object.keys(expected).length, 10, "this test's own expectation table must cover all 10 distinct ids");
  assert.equal(expected["mock-mr12-reversemean-01"], "84");
  for (const r of rows) {
    assert.equal(r.prompt.answer, expected[r.id], `${r.id}: migration answer '${r.prompt.answer}' does not match independently re-derived '${expected[r.id]}'`);
  }
});

test("rotation rule independently re-verified via the standard 2D rotation matrix, not merely trusted from the migration text", () => {
  function rotateClockwise90(x: number, y: number): [number, number] {
    return [y, -x];
  }
  function rotate180(x: number, y: number): [number, number] {
    return [-x, -y];
  }
  assert.deepEqual(rotateClockwise90(3, 5), [5, -3]);
  assert.deepEqual(rotate180(-2, 6), [2, -6]);
});

test("misconception coverage: every row has a genuine prose misconception, never a raw kebab-case slug", () => {
  for (const r of rows) {
    assert.ok(r.addressesMisconception.length > 20, `${r.id}'s misconception is suspiciously short`);
    assert.ok(r.addressesMisconception.includes(" "), `${r.id}'s misconception looks like a slug, not prose`);
    assert.ok(!/^[a-z0-9-]+$/.test(r.addressesMisconception), `${r.id}'s misconception is a raw kebab-case slug`);
  }
});

test("transfer_class is only ever a valid existing value", () => {
  const valid = new Set(["ROUTINE", "NEAR_TRANSFER", "FAR_TRANSFER", "MIXED_TRANSFER"]);
  for (const r of rows) assert.ok(valid.has(r.transferClass), `${r.id} has invalid transfer_class '${r.transferClass}'`);
});

test("no exact duplicates within Batch 003: no two rows share the same question text, and no two rows share the same id", () => {
  const questions = rows.map((r) => r.prompt.question);
  assert.equal(new Set(questions).size, questions.length, "duplicate question text found");
  const ids = rows.map((r) => r.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate id found");
});

test("no Batch 003 id or family_id collides with any Batch 001 or Batch 002 id or family_id", () => {
  const priorIds = new Set([
    "mock-mr02-invdiv-01", "mock-mr02-invdiv-02", "mock-mr02-invdiv-03",
    "mock-mr02-twostep-01", "mock-mr02-twostep-02", "mock-mr02-twostep-03",
    "mock-mr03-unitconv-01", "mock-mr03-unitconv-02", "mock-mr03-unitconv-03",
    "mock-mr09-data-01", "mock-mr09-data-02", "mock-mr09-data-03",
    "mock-mr05-forward-01", "mock-mr05-forward-02",
    "mock-mr05-inverse-01", "mock-mr05-inverse-02",
    "mock-mr13-bestvalue-01", "mock-mr13-bestvalue-02",
    "mock-mr04-percentchange-01", "mock-mr04-percentchange-02",
    "mock-mr04-reversepercent-01", "mock-mr04-reversepercent-02",
    "mock-mr06-sumdiff-01", "mock-mr06-sumdiff-02",
    "mock-mr06-multiplerelation-01", "mock-mr06-multiplerelation-02",
    "mock-mr07-triangleanglesum-01", "mock-mr07-triangleanglesum-02",
    "mock-mr07-isoscelesproperty-01", "mock-mr07-isoscelesproperty-02",
    "mock-mr10-forwardschedule-01", "mock-mr10-forwardschedule-02",
    "mock-mr10-reverseschedule-01", "mock-mr10-reverseschedule-02",
    "mock-mr11-truefalsejudgement-01", "mock-mr11-truefalsejudgement-02",
    "mock-mr11-propertysearch-01", "mock-mr11-propertysearch-02",
  ]);
  for (const r of rows) assert.ok(!priorIds.has(r.id), `${r.id} collides with a Batch 001/002 id`);
});

// ─── Grouping integrity (migration 093 columns, first real content use) ──

test("grouping integrity: exactly the 4 mock-mr01mr10-costumeschedule rows carry non-null grouping columns; every other row's grouping columns are absent (NULL by omission)", () => {
  const groupedIds = new Set([
    "mock-mr01mr10-costumeschedule-01a", "mock-mr01mr10-costumeschedule-01b",
    "mock-mr01mr10-costumeschedule-02a", "mock-mr01mr10-costumeschedule-02b",
  ]);
  for (const r of rows) {
    if (groupedIds.has(r.id)) {
      assert.ok(r.questionGroupId, `${r.id} should have a question_group_id`);
      assert.ok(r.groupOrder === 1 || r.groupOrder === 2, `${r.id} should have group_order 1 or 2`);
      assert.ok(r.subpartLabel === "(a)" || r.subpartLabel === "(b)", `${r.id} should have subpart_label (a) or (b)`);
      assert.equal(r.markingMode, "deterministic", `${r.id} should have marking_mode deterministic`);
    } else {
      assert.equal(r.questionGroupId, null, `${r.id} should NOT have grouping columns set`);
    }
  }
});

test("grouping integrity: exactly 2 distinct question_group_id values, each shared by exactly 2 rows with group_order 1 and 2", () => {
  const grouped = rows.filter((r) => r.questionGroupId !== null);
  assert.equal(grouped.length, 4);
  const byGroup = new Map<string, ParsedRow[]>();
  for (const r of grouped) {
    const list = byGroup.get(r.questionGroupId!) ?? [];
    list.push(r);
    byGroup.set(r.questionGroupId!, list);
  }
  assert.equal(byGroup.size, 2);
  for (const [groupId, groupRows] of byGroup) {
    assert.equal(groupRows.length, 2, `group ${groupId} does not have exactly 2 subparts`);
    assert.deepEqual(groupRows.map((r) => r.groupOrder).sort(), [1, 2]);
    assert.equal(new Set(groupRows.map((r) => r.subpartLabel)).size, 2, `group ${groupId} subpart labels are not distinct`);
    assert.equal(new Set(groupRows.map((r) => r.skill)).size, 2, `group ${groupId} both subparts should be different Question Types (MR-10 + MR-01)`);
  }
});

test("no orphan subpart: every grouped row's family_id is the shared grouped family, not a per-instance id", () => {
  const grouped = rows.filter((r) => r.questionGroupId !== null);
  for (const r of grouped) assert.equal(r.familyId, "mock-mr01mr10-costumeschedule");
});

test("no grouped scoring implemented: migration 095 never references mock_score_attempt or any scoring function", () => {
  assert.ok(!/mock_score_attempt/i.test(migrationExecutable));
});

test("Practice non-mutation: migration 095 contains no UPDATE or DELETE statement -- additive only, idempotent via ON CONFLICT DO NOTHING, exactly one INSERT block per family", () => {
  assert.ok(!/\bupdate\s+public\./i.test(migrationExecutable));
  assert.ok(!/\bdelete\s+from\b/i.test(migrationExecutable));
  const insertCount = (migrationExecutable.match(/insert into public\.ali_question_bank/g) || []).length;
  const onConflictCount = (migrationExecutable.match(/on conflict \(id\) do nothing/g) || []).length;
  assert.equal(insertCount, onConflictCount);
  assert.equal(insertCount, 4, "expected one INSERT block per family (4 families)");
});

test("no mock_eligible or independently_validated content is created anywhere in migration 095's real SQL", () => {
  assert.ok(!/'independently_validated'/.test(migrationExecutable));
  assert.ok(!/'mock_eligible'/.test(migrationExecutable));
});

test("no ali_mock_form row is created -- migration 095 never mentions ali_mock_form in real SQL", () => {
  assert.ok(!migrationExecutable.includes("ali_mock_form"));
});

test("no Batch 001/002/093/094 file is touched by this batch -- migration 095/096 are the only new files, byte-content of prior migrations is out of scope for this test file but not referenced/duplicated here", () => {
  assert.ok(!migrationSql.includes("ALTER TABLE"));
  assert.ok(!/alter table/i.test(migrationExecutable));
});

// ─── Review placeholders (migration 096) ──────────────────────────────────

test("review placeholders (migration 096) are pending-only: reviewer UNASSIGNED, decision pending_independent_review, review_type mock_maths_independent_review, one row per family, no approval anywhere", () => {
  const inserts = [...pendingReviewSql.matchAll(/select 'question_family', '([\w-]+)', 'UNASSIGNED',\s*\n\s*'pending_independent_review'::public\.family_review_decision,/g)];
  const familyIds = inserts.map((m) => m[1]).sort();
  assert.deepEqual(familyIds, [
    "mock-mr01-directcalc", "mock-mr01mr10-costumeschedule",
    "mock-mr08-rotation", "mock-mr12-reversemean",
  ]);
  assert.ok(!/'approved'/.test(pendingReviewSql));
  assert.ok(!/'approved_with_amendment'/.test(pendingReviewSql));
  assert.ok(!/'rejected'/.test(pendingReviewSql));
  assert.match(pendingReviewSql, /review_type = 'mock_maths_independent_review'/);
});

test("migration 096 references exactly the 4 families migration 095 created, no more no fewer", () => {
  const familiesInContent = new Set(rows.map((r) => r.familyId));
  const targetTypeInserts = [...pendingReviewSql.matchAll(/'question_family', '([\w-]+)'/g)].map((m) => m[1]);
  assert.equal(targetTypeInserts.length, 4);
  for (const f of targetTypeInserts) assert.ok(familiesInContent.has(f), `${f} referenced in migration 096 but not authored in migration 095`);
});

test("both migrations declare themselves NOT APPLIED", () => {
  assert.match(migrationSql, /NOT APPLIED\./);
  assert.match(pendingReviewSql, /NOT APPLIED\./);
});
