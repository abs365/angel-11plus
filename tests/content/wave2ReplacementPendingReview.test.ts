import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Educational Depth Phase 1, Wave 2 — REPLACEMENT after Founder
 * rejection. Migration 255's riverboat picture-narrative candidate was
 * independently reviewed by the Founder and REJECTED (direct target-
 * learner evidence: a real Year 5 child found it gave her "nothing to
 * write with"). Migrations 257/258 author and register ONE replacement
 * candidate ("The Treehouse Lantern"). These tests prove the bounded
 * correction: the rejected row is untouched and unpromotable, the
 * replacement is new/distinct/correctly staged, and the response-shape
 * label defect these rows both surfaced is fixed.
 */

function stripComments(sql: string): string {
  return sql
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("--"))
    .join("\n");
}

const sql257 = fs.readFileSync("supabase/migrations/257_writing_picture_narrative_replacement_practice_content.sql", "utf8");
const sql258 = fs.readFileSync("supabase/migrations/258_writing_picture_narrative_replacement_pending_review.sql", "utf8");
const exec257 = stripComments(sql257);
const exec258 = stripComments(sql258);

// === Migration 257: the replacement candidate content =======================

test("migration 257 inserts exactly one new row, a genuinely new id/family_id distinct from the rejected riverboat", () => {
  assert.match(exec257, /'eng-practice-writing-picturenarrative-treehouselantern-01'/);
  assert.match(exec257, /'eng-practice-writing-wc01b-treehouselantern'/);
  assert.doesNotMatch(exec257, /'eng-practice-writing-picturenarrative-riverboat-01'/);
  assert.doesNotMatch(exec257, /'eng-practice-writing-wc01b-riverboat'/);
});

test("migration 257 stages the replacement at authentic_assessment_candidate, never practice_eligible", () => {
  assert.match(exec257, /'authentic_assessment_candidate'/);
  assert.doesNotMatch(exec257, /'practice_eligible'/);
});

test("migration 257's replacement is classified as picture-narrative, subject writing, skill QT-WC-01b", () => {
  assert.match(exec257, /"type":"picture-narrative"/);
  assert.match(exec257, /'writing', 'QT-WC-01b'/);
});

test("migration 257's replacement carries a distinct, original image stimulus (not the rejected riverboat's asset)", () => {
  assert.match(exec257, /"stimulus":\{"type":"image","imageAssetUrl":"\/practice-assets\/writing-picture-narrative\/treehouselantern-v1\.svg"/);
  assert.doesNotMatch(exec257, /riverboat-v1\.svg/);
});

test("migration 257 checklist contains no title, speech bubble, or fixed plot text that would dictate a single story", () => {
  const jsonMatch = exec257.match(/\$json\$([\s\S]*?)\$json\$/);
  assert.ok(jsonMatch);
  const parsed = JSON.parse(jsonMatch![1]);
  const flat = JSON.stringify(parsed).toLowerCase();
  for (const banned of ["once upon a time", "the story begins", "chapter one"]) {
    assert.ok(!flat.includes(banned), `checklist/prompt must not contain dictated-plot text: "${banned}"`);
  }
  assert.equal(parsed.checklist.length, 7);
});

test("migration 257 is idempotent (on conflict do nothing) and wrapped in begin/commit", () => {
  assert.match(sql257, /on conflict \(id\) do nothing/);
  assert.match(exec257, /^\s*begin;/m);
  assert.match(exec257, /^\s*commit;/m);
});

test("migration 257 mentions NOT APPLIED in its own header (raw file, not the comment-stripped executable)", () => {
  assert.ok(sql257.toUpperCase().includes("NOT APPLIED"));
});

// === Migration 258: pending independent review registration =================

test("migration 258 registers the replacement family as pending_independent_review, reviewer UNASSIGNED", () => {
  assert.match(exec258, /'eng-practice-writing-wc01b-treehouselantern'/);
  assert.match(exec258, /'UNASSIGNED'/);
  assert.match(exec258, /'pending_independent_review'::public\.family_review_decision/);
  assert.match(exec258, /'mock_writing_prompt_independent_review'/);
});

test("migration 258 never touches eligibility_status and never references ali_question_bank", () => {
  assert.ok(!sql258.includes("eligibility_status ="));
  assert.ok(!exec258.includes("ali_question_bank"));
});

test("migration 258 never reads, updates, or deletes the rejected riverboat family's own review record", () => {
  assert.doesNotMatch(exec258, /'eng-practice-writing-wc01b-riverboat'/);
  assert.ok(!exec258.includes("update public.ali_family_review"));
  assert.ok(!exec258.includes("delete from public.ali_family_review"));
});

test("migration 258 never inserts a decision other than pending_independent_review (cannot fabricate an approval)", () => {
  const decisionValues = [...exec258.matchAll(/::public\.family_review_decision/g)];
  assert.ok(decisionValues.length > 0);
  assert.doesNotMatch(exec258, /'approved'::public\.family_review_decision/);
  assert.doesNotMatch(exec258, /'approved_with_amendment'::public\.family_review_decision/);
});

test("migration 258 idempotency guard matches on family_id, decision, review_type, and notes together", () => {
  const guardCount = (exec258.match(/where not exists \(/g) ?? []).length;
  assert.equal(guardCount, 1);
  assert.match(exec258, /family_id = 'eng-practice-writing-wc01b-treehouselantern'/);
});

test("migration 258 mentions NOT APPLIED in its own header", () => {
  assert.ok(sql258.toUpperCase().includes("NOT APPLIED"));
});

// === Governance: the rejected riverboat cannot be promoted accidentally =====

test("no migration file anywhere in the repo sets the rejected riverboat row or family to practice_eligible", () => {
  const migrationFiles = fs.readdirSync("supabase/migrations").filter((f) => f.endsWith(".sql"));
  for (const file of migrationFiles) {
    const content = fs.readFileSync(`supabase/migrations/${file}`, "utf8");
    if (!content.includes("eng-practice-writing-picturenarrative-riverboat-01") && !content.includes("eng-practice-writing-wc01b-riverboat")) continue;
    const executable = stripComments(content);
    assert.doesNotMatch(
      executable,
      /set\s+eligibility_status\s*=\s*'practice_eligible'/i,
      `${file} references the rejected riverboat row/family but must never promote it`,
    );
  }
});

test("this repository's own established promotion-migration pattern (migrations 200/203) requires decision = approved or approved_with_amendment -- a rejected decision satisfies neither, so no code change is needed to block promotion", () => {
  const sql203 = fs.readFileSync("supabase/migrations/203_programme_completion_inc009_writing_practice_eligible_promotion.sql", "utf8");
  assert.match(sql203, /decision = 'approved'/);
  assert.match(sql203, /decision = 'approved_with_amendment'/);
  assert.doesNotMatch(sql203, /decision = 'rejected'/);
});
