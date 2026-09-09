import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * Migration 246 — structural verification of the raw SQL, matching this
 * repository's own established discipline for a NOT-APPLIED migration
 * (e.g. tests/supabase/migration245CsseEnglishFullPaperWritingAssessment.test.ts):
 * assert against the actual migration text, not a live database this
 * test suite has no connection to.
 */

const MIGRATION_PATH = path.join(__dirname, "../../supabase/migrations/246_csse_english_q2_picture_narrative_completion.sql");
const SQL = fs.readFileSync(MIGRATION_PATH, "utf8");

test("migration discloses NOT APPLIED, matching this repository's own convention for a Founder-applied migration", () => {
  assert.match(SQL, /NOT APPLIED\. Generated for Founder review and manual application/);
});

test("makes no schema, function, or RLS change -- pure content", () => {
  assert.doesNotMatch(SQL, /create (or replace )?function/i);
  assert.doesNotMatch(SQL, /alter table/i);
  assert.doesNotMatch(SQL, /create policy|drop policy/i);
  assert.doesNotMatch(SQL, /create table/i);
});

test("disclosed correction: mock-writing-mindchange-01's prompt gains question/marks additively, guarded, never destructive", () => {
  assert.match(SQL, /update public\.ali_question_bank\s*\nset prompt = prompt \|\| jsonb_build_object\('question', prompt->'prompt', 'marks', 1\)/);
  assert.match(SQL, /where id = 'mock-writing-mindchange-01'\s*\n\s*and prompt->'question' is null/);
});

test("Q2 content row is inserted idempotently (on conflict do nothing), id matches the TypeScript design scaffold exactly", () => {
  assert.match(SQL, /insert into public\.ali_question_bank/);
  assert.match(SQL, /'eng-q2-picturenarrative-oldshed', 'writing', 'QT-WC-01b'/);
  assert.match(SQL, /on conflict \(id\) do nothing/);
});

test("Q2 row's prompt jsonb carries question, marks, stimulus (real imageAssetUrl, not null), and marking_mode is criterion_rubric", () => {
  const insertMatch = SQL.match(/insert into public\.ali_question_bank[\s\S]*?on conflict \(id\) do nothing;/);
  assert.ok(insertMatch, "Q2 insert statement not found");
  const body = insertMatch![0];
  assert.match(body, /"question":"Write a story based on the picture below\."/);
  assert.match(body, /"marks":1/);
  assert.match(body, /"stimulus":\{"type":"image","imageAssetUrl":"\/mock-assets\/q2-picture-narrative\/old-shed-v1\.svg"/);
  assert.doesNotMatch(body, /"imageAssetUrl":null/, "must not ship with a null image asset");
  assert.match(body, /'criterion_rubric'\)$/m);
});

test("Q2 eligibility_status is set to mock_eligible in this same migration, with the departure from the usual authentic_assessment_candidate-first convention explicitly disclosed", () => {
  const insertMatch = SQL.match(/insert into public\.ali_question_bank[\s\S]*?on conflict \(id\) do nothing;/);
  const body = insertMatch![0];
  assert.match(body, /'mock_eligible', 1, true,/);
  assert.match(SQL, /Q2 ELIGIBILITY: WHY mock_eligible IN THIS SAME MIGRATION/);
});

test("Q2 is appended to english-full-mock-v1's existing manifest via a guarded, idempotent jsonb append -- never a manifest rebuild", () => {
  assert.match(SQL, /update public\.ali_mock_form\s*\nset question_manifest = question_manifest \|\| jsonb_build_array\(/);
  assert.match(SQL, /jsonb_build_object\('question_id', 'eng-q2-picturenarrative-oldshed', 'section', 'continuous_writing_q2'\)/);
  assert.match(SQL, /where id = 'english-full-mock-v1'\s*\n\s*and not exists \(\s*\n\s*select 1 from jsonb_array_elements\(question_manifest\) as elem\s*\n\s*where elem->>'question_id' = 'eng-q2-picturenarrative-oldshed'/);
});

test("english-full-mock-v1's active flag is never referenced -- this migration cannot change production activation state", () => {
  assert.doesNotMatch(SQL, /set active\s*=\s*true/i);
  assert.doesNotMatch(SQL, /active\s*=\s*'true'/i);
});

test("the mock_get_question() question/marks defect this migration fixes is disclosed with its own root-cause explanation, not silently patched", () => {
  assert.match(SQL, /A GENUINE, DISCLOSED DEFECT FOUND \(AND FIXED\) WHILE PROVING Q2 END-TO-END/);
  assert.match(SQL, /prompt->'question'/);
  assert.match(SQL, /none of them has ever set prompt\.question or prompt\.marks/);
});

test("has exactly one transaction block", () => {
  const beginCount = (SQL.match(/^begin;$/gm) ?? []).length;
  const commitCount = (SQL.match(/^commit;$/gm) ?? []).length;
  assert.equal(beginCount, 1);
  assert.equal(commitCount, 1);
});
