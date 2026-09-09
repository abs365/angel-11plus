import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";

/**
 * Migration 248 — structural verification of the raw SQL, matching this
 * repository's own established discipline for a NOT-APPLIED migration.
 * Replaces migration 245's own failed content section (blocked by
 * migration 208's content-reuse trigger); see
 * ANGEL_MIGRATION_245_ENGLISH_MOCK_CONTENT_COLLISION_REPORT.md for the
 * full investigation this migration resolves.
 */

const MIGRATION_PATH = path.join(__dirname, "../../supabase/migrations/248_csse_english_full_paper_corrected_content.sql");
const SQL = fs.readFileSync(MIGRATION_PATH, "utf8");

test("migration discloses NOT APPLIED, matching this repository's own convention for a Founder-applied migration", () => {
  assert.match(SQL, /NOT APPLIED\. Generated for Founder review and manual application/);
});

test("makes no schema, function, or RLS change -- pure content, like 246 before it", () => {
  assert.doesNotMatch(SQL, /create (or replace )?function/i);
  assert.doesNotMatch(SQL, /alter table/i);
  assert.doesNotMatch(SQL, /create policy|drop policy/i);
  assert.doesNotMatch(SQL, /create table/i);
});

test("mentions migration 208's trigger only in prose (never DROP/ALTER/CREATE OR REPLACE it), and never references reading-comprehension-mock-1 or Mathematics Mock 1 as a write target", () => {
  assert.doesNotMatch(SQL, /drop trigger|alter trigger|create (or replace )?trigger/i);
  assert.doesNotMatch(SQL, /'reading-comprehension-mock-1'/);
  assert.doesNotMatch(SQL, /'first-mock-mathematics-v1'/);
});

test("the corrected Reading manifest contains exactly the 22 fresh sailandsteam/roboticsfinal question ids, none of the 28 retired ones", () => {
  const manifestMatch = SQL.match(/'\[\{"question_id":"eng-inc002-sailandsteam[\s\S]*?\]'::jsonb/);
  assert.ok(manifestMatch, "corrected manifest literal not found");
  const manifest = JSON.parse(manifestMatch![0].slice(1, -"'::jsonb".length));
  const readingIds = manifest.filter((m: { section: string }) => m.section === "reading_comprehension").map((m: { question_id: string }) => m.question_id);
  assert.equal(readingIds.length, 22);
  assert.ok(readingIds.every((id: string) => id.startsWith("eng-inc002-sailandsteam-") || id.startsWith("eng-inc002-roboticsfinal-")));
  const retiredPrefixes = ["eng-inc001-bee-", "mock-eng-boathouse-", "eng-inc001-understudy-"];
  assert.ok(!readingIds.some((id: string) => retiredPrefixes.some((p) => id.startsWith(p))), "must not reuse any of the 28 retired questions");
  assert.equal(new Set(readingIds).size, 22, "no duplicate question ids");
});

test("manifest includes exactly one Q1 and one Q2 entry, correctly sectioned", () => {
  const manifestMatch = SQL.match(/'\[\{"question_id":"eng-inc002-sailandsteam[\s\S]*?\]'::jsonb/);
  const manifest = JSON.parse(manifestMatch![0].slice(1, -"'::jsonb".length));
  const q1 = manifest.filter((m: { section: string }) => m.section === "continuous_writing_q1");
  const q2 = manifest.filter((m: { section: string }) => m.section === "continuous_writing_q2");
  assert.equal(q1.length, 1);
  assert.equal(q1[0].question_id, "mock-writing-mindchange-01");
  assert.equal(q2.length, 1);
  assert.equal(q2[0].question_id, "eng-q2-picturenarrative-oldshed");
  assert.equal(manifest.length, 24);
});

test("Q1 promotion additively sets question/marks keys in the same statement, idempotent re-run also covered", () => {
  const block = SQL.match(/-- ── Q1: promote mock-writing-mindchange-01[\s\S]*?end \$\$;/);
  assert.ok(block);
  const body = block![0];
  assert.match(body, /prompt = prompt \|\| jsonb_build_object\('question', prompt->'prompt', 'marks', 1\)/);
  assert.match(body, /elsif v_already_promoted_count = 1 then/);
});

test("Q2 row is inserted idempotently with a real, non-null imageAssetUrl and mock_eligible from the start", () => {
  const insertMatch = SQL.match(/insert into public\.ali_question_bank[\s\S]*?on conflict \(id\) do nothing;/);
  assert.ok(insertMatch);
  const body = insertMatch![0];
  assert.match(body, /"imageAssetUrl":"\/mock-assets\/q2-picture-narrative\/old-shed-v1\.svg"/);
  assert.doesNotMatch(body, /"imageAssetUrl":null/);
  assert.match(body, /'mock_eligible', 1, true,/);
});

test("english-full-mock-v1 insert is guarded (not exists) and inserted with active=false", () => {
  const formInsertMatch = SQL.match(/insert into public\.ali_mock_form[\s\S]*?where not exists \(select 1 from public\.ali_mock_form where id = 'english-full-mock-v1'\);/);
  assert.ok(formInsertMatch, "guarded form insert not found");
  assert.match(formInsertMatch![0], /,\s*10,\s*70,\s*false\s*$/m);
});

test("two named preflight guards exist: 22 questions mock_eligible+active, and the form not already existing", () => {
  assert.match(SQL, /expected all 22 target Reading questions to be mock_eligible and active/);
  assert.match(SQL, /english-full-mock-v1 already exists/);
});

test("discloses that migration 246 is superseded and must not be applied", () => {
  assert.match(SQL, /SUPERSEDED, not deleted, not edited, not to be applied/);
  assert.match(SQL, /Migration 246 must NOT be\s*\n?-- ?applied/);
});

test("has exactly one transaction block", () => {
  const beginCount = (SQL.match(/^begin;$/gm) ?? []).length;
  const commitCount = (SQL.match(/^commit;$/gm) ?? []).length;
  assert.equal(beginCount, 1);
  assert.equal(commitCount, 1);
});
