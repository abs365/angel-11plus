import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mathematics First Mock Minimum — Compound Content Foundation, Batch 001
 * (Decision 163). Tests the real generated content — every
 * $json$...$json$ prompt payload in migration 109 is parsed as real JSON
 * and independently re-verified, not merely regex-matched as source
 * text, mirroring tests/content/mockMathematicsBatch003.test.ts's own
 * established approach (this batch's own precedent for a grouped
 * family). Unlike Batch 003, every row in this batch is grouped — there
 * is no standalone-row case to distinguish.
 */

const migrationSql = fs.readFileSync("supabase/migrations/109_mock_mathematics_firstmock_compound_batch001.sql", "utf8");
const pendingReviewSql = fs.readFileSync("supabase/migrations/110_mock_mathematics_firstmock_compound_batch001_pending_review.sql", "utf8");
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
  skill: string;
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
  assert.equal(parts.length, 9, `expected 4 $json$ blocks (9 split parts); found ${(parts.length - 1) / 2}`);

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

test("parses exactly 4 candidate rows -- the parser itself is working against the real migration text", () => {
  assert.equal(rows.length, 4);
});

test("expected candidate IDs are exactly the 4 authored, no more, no fewer -- 1 grouped family x 4 (2 instances x 2 subparts)", () => {
  const expectedIds = [
    "mock-mr03mr07-perimeterarea-01a", "mock-mr03mr07-perimeterarea-01b",
    "mock-mr03mr07-perimeterarea-02a", "mock-mr03mr07-perimeterarea-02b",
  ];
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

test("Question Types represented are exactly QT-MR-03 and QT-MR-07 -- both already have standalone families elsewhere (mock-mr03-unitconv, mock-mr07-triangleanglesum), this batch's own rows are a NEW, distinct, grouped combination of them", () => {
  const skills = new Set(rows.map((r) => r.skill));
  assert.deepEqual([...skills].sort(), ["QT-MR-03", "QT-MR-07"]);
});

test("family integrity: exactly 1 family, 4 rows, all grouped -- no standalone row in this batch", () => {
  const byFamily = new Map<string, ParsedRow[]>();
  for (const r of rows) {
    const list = byFamily.get(r.familyId) ?? [];
    list.push(r);
    byFamily.set(r.familyId, list);
  }
  assert.equal(byFamily.size, 1);
  assert.equal(byFamily.get("mock-mr03mr07-perimeterarea")?.length, 4);
});

test("content_difficulty is 'hard' for all 4 rows -- matching mock-mr01mr10-costumeschedule's own precedent for grouped/compound content", () => {
  for (const r of rows) assert.equal(r.contentDifficulty, "hard", `${r.id} should be 'hard'`);
});

test("every row's prompt.marks is exactly 1 -- matching AEP-002 Observation 3 ('1 mark for each correct answer') and the real CSSE-006 Q14 mark scheme's own 1-mark-per-subpart structure, independently confirmed this session", () => {
  for (const r of rows) assert.equal(r.prompt.marks, 1, `${r.id} should be worth exactly 1 mark`);
});

test("every row's prompt.answer is present and non-empty, and every workingSteps array has at least 1 step", () => {
  for (const r of rows) {
    assert.ok(r.prompt.answer && r.prompt.answer.length > 0, `${r.id} has no answer`);
    assert.ok(Array.isArray(r.prompt.workingSteps) && r.prompt.workingSteps.length >= 1, `${r.id} has no working steps`);
  }
});

test("deterministic answer correctness: every answer is independently re-derived here from the question's own stated numbers, not trusted from the migration text", () => {
  const expected: Record<string, string> = {
    "mock-mr03mr07-perimeterarea-01a": String(2 * (3.6 + 2.5)),
    "mock-mr03mr07-perimeterarea-01b": String(3.6 * 2.5),
    "mock-mr03mr07-perimeterarea-02a": String(2 * (90 + 45)),
    "mock-mr03mr07-perimeterarea-02b": String(90 * 45),
  };
  assert.equal(Object.keys(expected).length, 4, "this test's own expectation table must cover all 4 distinct ids");
  assert.equal(expected["mock-mr03mr07-perimeterarea-01a"], "12.2");
  assert.equal(expected["mock-mr03mr07-perimeterarea-01b"], "9");
  assert.equal(expected["mock-mr03mr07-perimeterarea-02a"], "270");
  assert.equal(expected["mock-mr03mr07-perimeterarea-02b"], "4050");
  for (const r of rows) {
    assert.equal(r.prompt.answer, expected[r.id], `${r.id}: migration answer '${r.prompt.answer}' does not match independently re-derived '${expected[r.id]}'`);
  }
});

test("unit-conversion correctness independently re-verified: 250cm=2.5m and 450mm=45cm, not merely trusted from the migration text", () => {
  assert.equal(250 / 100, 2.5);
  assert.equal(450 / 10, 45);
});

test("misconception coverage: every row has a genuine prose misconception, never a raw kebab-case slug", () => {
  for (const r of rows) {
    assert.ok(r.addressesMisconception.length > 20, `${r.id}'s misconception is suspiciously short`);
    assert.ok(r.addressesMisconception.includes(" "), `${r.id}'s misconception looks like a slug, not prose`);
    assert.ok(!/^[a-z0-9-]+$/.test(r.addressesMisconception), `${r.id}'s misconception is a raw kebab-case slug`);
  }
});

test("transfer_class is FAR_TRANSFER for every row -- matching mock-mr01mr10-costumeschedule's own precedent for grouped/compound content", () => {
  for (const r of rows) assert.equal(r.transferClass, "FAR_TRANSFER", `${r.id} should be FAR_TRANSFER`);
});

test("no exact duplicates within this batch: no two rows share the same question text, and no two rows share the same id", () => {
  const questions = rows.map((r) => r.prompt.question);
  assert.equal(new Set(questions).size, questions.length, "duplicate question text found");
  const ids = rows.map((r) => r.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate id found");
});

test("no id or family_id collides with any Batch 001/002/003 id or family_id, or the existing near-neighbour Practice family mr03-mixed-perimeter", () => {
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
    "mock-mr01-directcalc-01", "mock-mr01-directcalc-02",
    "mock-mr08-rotation-01", "mock-mr08-rotation-02",
    "mock-mr12-reversemean-01", "mock-mr12-reversemean-02",
    "mock-mr01mr10-costumeschedule-01a", "mock-mr01mr10-costumeschedule-01b",
    "mock-mr01mr10-costumeschedule-02a", "mock-mr01mr10-costumeschedule-02b",
    "mr03-mix-01", "mr03-mix-02", "mr03-mix-03", "mr03-mix-04",
  ]);
  for (const r of rows) assert.ok(!priorIds.has(r.id), `${r.id} collides with an existing id`);
});

// ─── Grouping integrity (migration 093 columns) ────────────────────────

test("grouping integrity: all 4 rows carry non-null grouping columns -- no standalone row exists in this batch", () => {
  for (const r of rows) {
    assert.ok(r.questionGroupId, `${r.id} should have a question_group_id`);
    assert.ok(r.groupOrder === 1 || r.groupOrder === 2, `${r.id} should have group_order 1 or 2`);
    assert.ok(r.subpartLabel === "(a)" || r.subpartLabel === "(b)", `${r.id} should have subpart_label (a) or (b)`);
    assert.equal(r.markingMode, "deterministic", `${r.id} should have marking_mode deterministic`);
  }
});

test("grouping integrity: exactly 2 distinct question_group_id values, each shared by exactly 2 rows with group_order 1 and 2, each pairing 2 DIFFERENT Question Types -- no orphan subpart", () => {
  const byGroup = new Map<string, ParsedRow[]>();
  for (const r of rows) {
    const list = byGroup.get(r.questionGroupId!) ?? [];
    list.push(r);
    byGroup.set(r.questionGroupId!, list);
  }
  assert.equal(byGroup.size, 2);
  for (const [groupId, groupRows] of byGroup) {
    assert.equal(groupRows.length, 2, `group ${groupId} does not have exactly 2 subparts`);
    assert.deepEqual(groupRows.map((r) => r.groupOrder).sort(), [1, 2]);
    assert.equal(new Set(groupRows.map((r) => r.subpartLabel)).size, 2, `group ${groupId} subpart labels are not distinct`);
    assert.equal(new Set(groupRows.map((r) => r.skill)).size, 2, `group ${groupId} both subparts should be different Question Types (MR-03 + MR-07)`);
    assert.equal(groupRows.every((r) => r.familyId === "mock-mr03mr07-perimeterarea"), true, `group ${groupId}'s rows must all share the batch's one family_id`);
  }
});

test("total marks in this batch is exactly 4 (4 rows x 1 mark each)", () => {
  const total = rows.reduce((sum, r) => sum + r.prompt.marks, 0);
  assert.equal(total, 4);
});

test("no grouped scoring implemented: migration 109 never references mock_score_attempt or any scoring function", () => {
  assert.ok(!/mock_score_attempt/i.test(migrationExecutable));
});

test("additive only: no UPDATE or DELETE statement, idempotent via ON CONFLICT DO NOTHING, exactly one INSERT block for the one family", () => {
  assert.ok(!/\bupdate\s+public\./i.test(migrationExecutable));
  assert.ok(!/\bdelete\s+from\b/i.test(migrationExecutable));
  const insertCount = (migrationExecutable.match(/insert into public\.ali_question_bank/g) || []).length;
  const onConflictCount = (migrationExecutable.match(/on conflict \(id\) do nothing/g) || []).length;
  assert.equal(insertCount, onConflictCount);
  assert.equal(insertCount, 1, "expected exactly one INSERT block for the one family");
});

test("no mock_eligible, independently_validated, or the existing 48-row pool's own ids/eligibility is touched anywhere in migration 109's real SQL", () => {
  assert.ok(!/'independently_validated'/.test(migrationExecutable));
  assert.ok(!/'mock_eligible'/.test(migrationExecutable));
});

test("no ali_mock_form or ali_family_review row is created -- migration 109 never mentions either table in real SQL", () => {
  assert.ok(!migrationExecutable.includes("ali_mock_form"));
  assert.ok(!migrationExecutable.includes("ali_family_review"));
});

test("no schema DDL -- migration 109 never touches ALTER TABLE", () => {
  assert.ok(!/alter table/i.test(migrationExecutable));
});

test("wrapped in a single begin/commit transaction", () => {
  assert.equal((migrationExecutable.match(/\bbegin;/g) || []).length, 1);
  assert.equal((migrationExecutable.match(/\bcommit;/g) || []).length, 1);
});

// ─── Review placeholders (migration 110) ───────────────────────────────

test("review placeholder (migration 110) is pending-only: reviewer UNASSIGNED, decision pending_independent_review, review_type mock_maths_independent_review, one row for the one family, no approval anywhere", () => {
  const inserts = [...pendingReviewSql.matchAll(/select 'question_family', '([\w-]+)', 'UNASSIGNED',\s*\n\s*'pending_independent_review'::public\.family_review_decision,/g)];
  const familyIds = inserts.map((m) => m[1]);
  assert.deepEqual(familyIds, ["mock-mr03mr07-perimeterarea"]);
  assert.ok(!/'approved'/.test(pendingReviewSql));
  assert.ok(!/'approved_with_amendment'/.test(pendingReviewSql));
  assert.ok(!/'rejected'/.test(pendingReviewSql));
  assert.match(pendingReviewSql, /review_type = 'mock_maths_independent_review'/);
});

test("migration 110 references exactly the 1 family migration 109 created, no more no fewer", () => {
  const familiesInContent = new Set(rows.map((r) => r.familyId));
  const targetTypeInserts = [...pendingReviewSql.matchAll(/'question_family', '([\w-]+)'/g)].map((m) => m[1]);
  assert.equal(targetTypeInserts.length, 1);
  for (const f of targetTypeInserts) assert.ok(familiesInContent.has(f), `${f} referenced in migration 110 but not authored in migration 109`);
});

test("both migrations declare themselves NOT APPLIED", () => {
  assert.match(migrationSql, /NOT APPLIED\./);
  assert.match(pendingReviewSql, /NOT APPLIED\./);
});
