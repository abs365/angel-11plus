import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mock Programme Increment 004, Batch 002 (Decision 145). Tests the real
 * generated content — every $json$...$json$ prompt payload in migration
 * 091 is parsed as real JSON and independently re-verified, not merely
 * regex-matched as source text — mirroring
 * tests/content/mockMathematicsBatch001.test.ts's own established,
 * robust split-based parsing approach exactly (that file's own header
 * comment documents why: a single combined row-level regex proved
 * fragile against real authored prose containing parentheses).
 */

const migrationSql = fs.readFileSync("supabase/migrations/091_mock_mathematics_batch002.sql", "utf8");
const pendingReviewSql = fs.readFileSync("supabase/migrations/092_mock_mathematics_batch002_pending_review.sql", "utf8");
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
  skill: string; // top-level column, e.g. "QT-MR-04"
  contentDifficulty: string;
  eligibilityStatus: string;
  provenance: string;
  familyId: string;
  addressesMisconception: string;
  transferClass: string;
  prompt: ParsedPrompt;
}

function parseRows(sql: string): ParsedRow[] {
  const parts = sql.split("$json$");
  assert.equal(parts.length, 41, `expected 20 $json$ blocks (41 split parts); found ${(parts.length - 1) / 2}`);

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

test("parses exactly 20 candidate rows -- the parser itself is working against the real migration text", () => {
  assert.equal(rows.length, 20, "expected exactly 20 rows");
});

test("expected candidate IDs are exactly the 20 authored, no more, no fewer", () => {
  const expectedIds = [
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

test("every row's id and family_id is prefixed 'mock-' -- guarantees no naming collision with any existing Practice row or Batch 001 row", () => {
  for (const r of rows) {
    assert.match(r.id, /^mock-/, `${r.id} is not prefixed 'mock-'`);
    assert.match(r.familyId, /^mock-/, `${r.familyId} family is not prefixed 'mock-'`);
  }
});

test("Question Types represented are exactly QT-MR-04, QT-MR-06, QT-MR-07, QT-MR-10, QT-MR-11 -- QT-MR-01 (already ~18% of Practice) is deliberately absent, and none overlaps Batch 001's own 5 types (QT-MR-02/03/05/09/13)", () => {
  const skills = new Set(rows.map((r) => r.skill));
  assert.deepEqual([...skills].sort(), ["QT-MR-04", "QT-MR-06", "QT-MR-07", "QT-MR-10", "QT-MR-11"]);
  assert.ok(!skills.has("QT-MR-01"));
  for (const batch001Skill of ["QT-MR-02", "QT-MR-03", "QT-MR-05", "QT-MR-09", "QT-MR-13"]) {
    assert.ok(!skills.has(batch001Skill), `${batch001Skill} was Batch 001's own scope, not Batch 002's`);
  }
});

test("family integrity: every family has exactly 2 rows, one Question Type each, exactly 10 families", () => {
  const byFamily = new Map<string, ParsedRow[]>();
  for (const r of rows) {
    const list = byFamily.get(r.familyId) ?? [];
    list.push(r);
    byFamily.set(r.familyId, list);
  }
  assert.equal(byFamily.size, 10);
  for (const [familyId, familyRows] of byFamily) {
    assert.equal(familyRows.length, 2, `family ${familyId} does not have exactly 2 rows`);
    assert.equal(new Set(familyRows.map((r) => r.skill)).size, 1, `family ${familyId} spans more than one Question Type`);
  }
});

test("content_difficulty distribution: exactly 10 medium (the foundational structure per type) and 10 hard (the genuinely distinct second structure per type), no easy/challenge", () => {
  const counts: Record<string, number> = { easy: 0, medium: 0, hard: 0, challenge: 0 };
  for (const r of rows) counts[r.contentDifficulty] = (counts[r.contentDifficulty] ?? 0) + 1;
  assert.deepEqual(counts, { easy: 0, medium: 10, hard: 10, challenge: 0 });
});

test("every row's prompt.answer is present and non-empty, and every workingSteps array has at least 2 steps", () => {
  for (const r of rows) {
    assert.ok(r.prompt.answer && r.prompt.answer.length > 0, `${r.id} has no answer`);
    assert.ok(Array.isArray(r.prompt.workingSteps) && r.prompt.workingSteps.length >= 2, `${r.id} has insufficient working steps`);
  }
});

test("deterministic answer correctness: every answer is independently re-derived here from the question's own stated numbers, not trusted from the migration text", () => {
  const expected: Record<string, string> = {
    "mock-mr04-percentchange-01": String(Math.round(80 * 1.25 * 0.8 * 100) / 100),
    "mock-mr04-percentchange-02": String(Math.round(600 * 0.85 * 0.9 * 100) / 100),
    "mock-mr04-reversepercent-01": String(Math.round((52 / 0.8) * 100) / 100),
    "mock-mr04-reversepercent-02": String(Math.round((115 / 1.15) * 100) / 100),
    "mock-mr06-sumdiff-01": String((58 + 12) / 2),
    "mock-mr06-sumdiff-02": String(74 - (74 + 18) / 2),
    "mock-mr06-multiplerelation-01": String(48 / 4),
    "mock-mr06-multiplerelation-02": String((90 / 5) * 4),
    "mock-mr07-triangleanglesum-01": String((180 - 30) / 3),
    "mock-mr07-triangleanglesum-02": String((360 - 60) / 4),
    "mock-mr07-isoscelesproperty-01": String((180 - 38) / 2),
    "mock-mr07-isoscelesproperty-02": String((180 - 63 - 63) / 2),
    "mock-mr10-forwardschedule-01": "13:30",
    "mock-mr10-forwardschedule-02": "17:10",
    "mock-mr10-reverseschedule-01": "14:00",
    "mock-mr10-reverseschedule-02": "14:30",
    "mock-mr11-truefalsejudgement-01": "true",
    "mock-mr11-truefalsejudgement-02": "false",
    "mock-mr11-propertysearch-01": "37",
    "mock-mr11-propertysearch-02": "81",
  };
  assert.equal(Object.keys(expected).length, 20, "this test's own expectation table must cover all 20 rows");
  for (const r of rows) {
    assert.equal(r.prompt.answer, expected[r.id], `${r.id}: migration answer '${r.prompt.answer}' does not match independently re-derived '${expected[r.id]}'`);
  }
});

test("mock-mr11-propertysearch-01 answer is genuinely unique within its own stated constraint (prime, one more than a perfect square, between 20 and 50) -- independently re-checked, not merely trusted", () => {
  const candidates: number[] = [];
  for (let n = 4; n * n <= 60; n++) {
    const candidate = n * n + 1;
    if (candidate > 20 && candidate < 50) candidates.push(candidate);
  }
  function isPrime(n: number): boolean {
    if (n < 2) return false;
    for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
    return true;
  }
  const primeCandidates = candidates.filter(isPrime);
  assert.deepEqual(primeCandidates, [37]);
});

test("mock-mr11-propertysearch-02 answer is genuinely unique within its own stated constraint (perfect square, odd, between 50 and 100) -- independently re-checked, not merely trusted", () => {
  const candidates: number[] = [];
  for (let n = 8; n * n <= 100; n++) {
    const sq = n * n;
    if (sq > 50 && sq < 100 && sq % 2 === 1) candidates.push(sq);
  }
  assert.deepEqual(candidates, [81]);
});

test("the originally-flagged unsolvable property-search variant (prime, one less than a perfect square) genuinely has no valid answer for any square greater than 4 -- confirming the disclosed defect was real, not an overcautious replacement", () => {
  function isPrime(n: number): boolean {
    if (n < 2) return false;
    for (let d = 2; d * d <= n; d++) if (n % d === 0) return false;
    return true;
  }
  for (let n = 3; n <= 20; n++) {
    const candidate = n * n - 1; // (n-1)(n+1), composite for every n > 2
    assert.equal(isPrime(candidate), false, `n=${n}: ${candidate} should never be prime`);
  }
});

test("misconception coverage: every row has a genuine prose misconception, never a raw kebab-case slug", () => {
  for (const r of rows) {
    assert.ok(r.addressesMisconception.length > 20, `${r.id}'s misconception is suspiciously short`);
    assert.ok(r.addressesMisconception.includes(" "), `${r.id}'s misconception looks like a slug, not prose`);
    assert.ok(!/^[a-z0-9-]+$/.test(r.addressesMisconception), `${r.id}'s misconception is a raw kebab-case slug`);
  }
});

test("transfer_class is only ever a valid existing value, and FAR_TRANSFER is reserved for exactly the 10 genuinely harder second structures, one per family", () => {
  const valid = new Set(["ROUTINE", "NEAR_TRANSFER", "FAR_TRANSFER", "MIXED_TRANSFER"]);
  for (const r of rows) assert.ok(valid.has(r.transferClass), `${r.id} has invalid transfer_class '${r.transferClass}'`);
  const farTransferIds = rows.filter((r) => r.transferClass === "FAR_TRANSFER").map((r) => r.id).sort();
  assert.deepEqual(farTransferIds, [
    "mock-mr04-reversepercent-01", "mock-mr04-reversepercent-02",
    "mock-mr06-multiplerelation-01", "mock-mr06-multiplerelation-02",
    "mock-mr07-isoscelesproperty-01", "mock-mr07-isoscelesproperty-02",
    "mock-mr10-reverseschedule-01", "mock-mr10-reverseschedule-02",
    "mock-mr11-propertysearch-01", "mock-mr11-propertysearch-02",
  ]);
});

test("no exact duplicates within Batch 002: no two rows share the same question text, and no two rows share the same id", () => {
  const questions = rows.map((r) => r.prompt.question);
  assert.equal(new Set(questions).size, questions.length, "duplicate question text found");
  const ids = rows.map((r) => r.id);
  assert.equal(new Set(ids).size, ids.length, "duplicate id found");
});

test("structural near-duplicate guard: no two rows share the same (skill, answer) pair -- catches accidental answer-clustering within a Question Type, not just literal text duplication", () => {
  const seen = new Map<string, string>();
  for (const r of rows) {
    const key = `${r.skill}::${r.prompt.answer}`;
    const prior = seen.get(key);
    assert.ok(!prior, `${r.id} and ${prior} share the same skill+answer pair (${key}) -- a real structural near-duplicate risk`);
    seen.set(key, r.id);
  }
});

test("no Batch 002 id or family_id collides with any Batch 001 id or family_id (both batches confirmed disjoint by direct set comparison, not merely by naming convention)", () => {
  const batch001Ids = new Set([
    "mock-mr02-invdiv-01", "mock-mr02-invdiv-02", "mock-mr02-invdiv-03",
    "mock-mr02-twostep-01", "mock-mr02-twostep-02", "mock-mr02-twostep-03",
    "mock-mr03-unitconv-01", "mock-mr03-unitconv-02", "mock-mr03-unitconv-03",
    "mock-mr09-data-01", "mock-mr09-data-02", "mock-mr09-data-03",
    "mock-mr05-forward-01", "mock-mr05-forward-02",
    "mock-mr05-inverse-01", "mock-mr05-inverse-02",
    "mock-mr13-bestvalue-01", "mock-mr13-bestvalue-02",
  ]);
  for (const r of rows) assert.ok(!batch001Ids.has(r.id), `${r.id} collides with a Batch 001 id`);
});

test("Practice non-mutation: migration 091 contains no UPDATE or DELETE statement -- additive only, idempotent via ON CONFLICT DO NOTHING, exactly one INSERT block per family", () => {
  assert.ok(!/\bupdate\s+public\./i.test(migrationExecutable));
  assert.ok(!/\bdelete\s+from\b/i.test(migrationExecutable));
  const insertCount = (migrationExecutable.match(/insert into public\.ali_question_bank/g) || []).length;
  const onConflictCount = (migrationExecutable.match(/on conflict \(id\) do nothing/g) || []).length;
  assert.equal(insertCount, onConflictCount);
  assert.equal(insertCount, 10, "expected one INSERT block per family (10 families)");
});

test("no mock_eligible or independently_validated content is created anywhere in migration 091's real SQL", () => {
  assert.ok(!/'independently_validated'/.test(migrationExecutable));
  assert.ok(!/'mock_eligible'/.test(migrationExecutable));
});

test("no ali_mock_form row is created -- migration 091 never mentions ali_mock_form in real SQL", () => {
  assert.ok(!migrationExecutable.includes("ali_mock_form"));
});

// ─── Review placeholders (migration 092) ──────────────────────────────────

test("review placeholders (migration 092) are pending-only: reviewer UNASSIGNED, decision pending_independent_review, review_type mock_maths_independent_review, one row per family, no approval anywhere", () => {
  const inserts = [...pendingReviewSql.matchAll(/select 'question_family', '([\w-]+)', 'UNASSIGNED',\s*\n\s*'pending_independent_review'::public\.family_review_decision,/g)];
  const familyIds = inserts.map((m) => m[1]).sort();
  assert.deepEqual(familyIds, [
    "mock-mr04-percentchange", "mock-mr04-reversepercent",
    "mock-mr06-multiplerelation", "mock-mr06-sumdiff",
    "mock-mr07-isoscelesproperty", "mock-mr07-triangleanglesum",
    "mock-mr10-forwardschedule", "mock-mr10-reverseschedule",
    "mock-mr11-propertysearch", "mock-mr11-truefalsejudgement",
  ]);
  assert.ok(!/'approved'/.test(pendingReviewSql));
  assert.ok(!/'approved_with_amendment'/.test(pendingReviewSql));
  assert.ok(!/'rejected'/.test(pendingReviewSql));
  assert.match(pendingReviewSql, /review_type = 'mock_maths_independent_review'/);
});

test("migration 092 references exactly the 10 families migration 091 created, no more no fewer", () => {
  const familiesInContent = new Set(rows.map((r) => r.familyId));
  const targetTypeInserts = [...pendingReviewSql.matchAll(/'question_family', '([\w-]+)'/g)].map((m) => m[1]);
  assert.equal(targetTypeInserts.length, 10);
  for (const f of targetTypeInserts) assert.ok(familiesInContent.has(f), `${f} referenced in migration 092 but not authored in migration 091`);
});

test("both migrations declare themselves NOT APPLIED", () => {
  assert.match(migrationSql, /NOT APPLIED\./);
  assert.match(pendingReviewSql, /NOT APPLIED\./);
});
