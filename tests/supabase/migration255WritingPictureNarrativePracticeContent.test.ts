import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { WRITING_CHECKLIST_ITEM_SUPPORT_LEVELS } from "../../lib/writing/supportLevelPolicy";

/**
 * Migration 255 — Educational Depth Phase 1, Wave 2. Structural
 * verification of the raw SQL, matching this repository's own
 * established discipline for a NOT-APPLIED migration (e.g.
 * tests/supabase/migration246CsseEnglishQ2PictureNarrativeCompletion.test.ts):
 * assert against the actual migration text, not a live database this
 * test suite has no connection to.
 */

const MIGRATION_PATH = path.join(__dirname, "../../supabase/migrations/255_writing_picture_narrative_practice_content.sql");
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

test("row is inserted idempotently (on conflict do nothing), skill is QT-WC-01b", () => {
  assert.match(SQL, /insert into public\.ali_question_bank/);
  assert.match(SQL, /'eng-practice-writing-picturenarrative-riverboat-01', 'writing', 'QT-WC-01b'/);
  assert.match(SQL, /on conflict \(id\) do nothing/);
});

test("row's prompt jsonb carries type picture-narrative and a real, non-null image stimulus, distinct from Mock's own asset path", () => {
  const insertMatch = SQL.match(/insert into public\.ali_question_bank[\s\S]*?on conflict \(id\) do nothing;/);
  assert.ok(insertMatch, "insert statement not found");
  const body = insertMatch![0];
  assert.match(body, /"type":"picture-narrative"/);
  assert.match(body, /"stimulus":\{"type":"image","imageAssetUrl":"\/practice-assets\/writing-picture-narrative\/riverboat-v1\.svg"/);
  assert.doesNotMatch(body, /"imageAssetUrl":null/, "must not ship with a null image asset");
  assert.doesNotMatch(body, /mock-assets/, "must never point at a Mock-reserved asset path -- Practice and Mock stimuli must stay structurally separate");
});

test("eligibility_status is authentic_assessment_candidate, matching this repository's own first-content convention -- not a leap straight to practice_eligible", () => {
  const insertMatch = SQL.match(/insert into public\.ali_question_bank[\s\S]*?on conflict \(id\) do nothing;/);
  const body = insertMatch![0];
  assert.match(body, /'authentic_assessment_candidate', 1, true,/);
});

test("no existing row is read, referenced, or modified -- pure insert, one new row only", () => {
  assert.doesNotMatch(SQL, /update public\.ali_question_bank/);
  const insertMatch = SQL.match(/insert into public\.ali_question_bank[\s\S]*?on conflict \(id\) do nothing;/);
  const body = insertMatch![0];
  assert.doesNotMatch(body, /eng-q2-picturenarrative-oldshed/, "the executable SQL must not reference Mock's row -- a mention in disclosure comments above is fine and expected, an actual reference inside the INSERT would not be");
});

test("the image asset file referenced by the row actually exists in the repository and is distinct from Mock's own asset", () => {
  const assetPath = path.join(__dirname, "../../public/practice-assets/writing-picture-narrative/riverboat-v1.svg");
  assert.ok(fs.existsSync(assetPath), "riverboat-v1.svg must exist at the path this migration references");
  const svg = fs.readFileSync(assetPath, "utf8");
  assert.match(svg, /<svg/);
  assert.match(svg, /<\/svg>/);
  const mockAssetPath = path.join(__dirname, "../../public/mock-assets/q2-picture-narrative/old-shed-v1.svg");
  const mockSvg = fs.readFileSync(mockAssetPath, "utf8");
  assert.notEqual(svg, mockSvg, "Practice's picture must be a genuinely different asset from Mock's, never the same file");
});

test("the new row's checklist is explicitly classified in supportLevelPolicy.ts, item-for-item, matching this repository's own standing rule that new content is never left to the unaudited-content default", () => {
  const insertMatch = SQL.match(/insert into public\.ali_question_bank[\s\S]*?on conflict \(id\) do nothing;/);
  const body = insertMatch![0];
  const jsonMatch = body.match(/\$json\$([\s\S]*?)\$json\$/);
  assert.ok(jsonMatch, "expected a $json$ prompt block");
  const prompt = JSON.parse(jsonMatch![1]);
  const levels = WRITING_CHECKLIST_ITEM_SUPPORT_LEVELS["eng-practice-writing-picturenarrative-riverboat-01"];
  assert.ok(levels, "expected an explicit classification entry for this new row");
  assert.equal(levels.length, prompt.checklist.length, "classification array must have one entry per checklist item, no more, no fewer");
  assert.equal(levels[0], "core", "the length requirement (item 1) is always core");
  assert.equal(levels[levels.length - 1], "core", "the proofreading check (last item) is always core");
});

test("has exactly one transaction block", () => {
  const beginCount = (SQL.match(/^begin;$/gm) ?? []).length;
  const commitCount = (SQL.match(/^commit;$/gm) ?? []).length;
  assert.equal(beginCount, 1);
  assert.equal(commitCount, 1);
});
