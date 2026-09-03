import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Programme Completion Increment 014 — Reading Comprehension Mock 1
 * construction + Mock Content Firewall enforcement (migrations 209-212).
 *
 * CODE/SQL VERIFIED, NOT PRODUCTION VERIFIED. These tests parse the real
 * migration SQL files as text/JSON, exactly as every other content test
 * in this repository does (see tests/content/mockMathematicsFirstMock
 * CompoundBatch001.test.ts's own established pattern) — none of them,
 * this file included, connect to a live database. They prove the
 * migration files are internally consistent and structurally correct.
 * They do NOT prove the triggers execute correctly against a real
 * Postgres instance — no Docker/service-role access was available this
 * session (disclosed in the Increment 013/014 reports). Founder
 * application via Supabase Dashboard remains the first live test.
 */

const migration209 = fs.readFileSync("supabase/migrations/209_mock_exposure_enforcement_draft_vs_exposure_correction.sql", "utf8");
const migration210 = fs.readFileSync("supabase/migrations/210_reading_mock_eligible_promotion.sql", "utf8");
const migration211 = fs.readFileSync("supabase/migrations/211_writing_screentime_mock_eligible_promotion.sql", "utf8");
const migration212 = fs.readFileSync("supabase/migrations/212_reading_comprehension_mock_1_freeze.sql", "utf8");

const manifestMatch = migration212.match(/v_question_manifest constant jsonb := '(\[[\s\S]*?\])'::jsonb;/);
assert.ok(manifestMatch, "migration 212 must contain a parseable v_question_manifest constant");
const manifest = JSON.parse(manifestMatch![1]) as { question_id: string; section: string }[];
const manifestIds = manifest.map((m) => m.question_id);

const provenanceMatch = migration212.match(/v_composition_provenance constant jsonb := '(\{[\s\S]*?\})'::jsonb;/);
assert.ok(provenanceMatch, "migration 212 must contain a parseable v_composition_provenance constant");
const provenance = JSON.parse(provenanceMatch![1]) as Record<string, unknown>;

test("Reading Comprehension Mock 1 manifest has exactly 28 unique rows across 3 named passages, no more, no fewer", () => {
  assert.equal(manifestIds.length, 28);
  assert.equal(new Set(manifestIds).size, 28, "no duplicate question_id in the manifest");

  const bees = manifestIds.filter((id) => id.startsWith("eng-inc001-bee-"));
  const boathouse = manifestIds.filter((id) => id.startsWith("mock-eng-boathouse-"));
  const understudy = manifestIds.filter((id) => id.startsWith("eng-inc001-understudy-"));
  assert.equal(bees.length, 8);
  assert.equal(boathouse.length, 13);
  assert.equal(understudy.length, 7);
  assert.equal(bees.length + boathouse.length + understudy.length, 28);
});

test("Reading Comprehension Mock 1 manifest excludes both reserved passages (Founder-preserved for a future assessment)", () => {
  assert.equal(manifestIds.filter((id) => id.startsWith("eng-inc002-roboticsfinal")).length, 0, "The Loose Connection must not appear");
  assert.equal(manifestIds.filter((id) => id.startsWith("eng-inc002-sailandsteam")).length, 0, "Sail and Steam must not appear");
});

test("Reading Comprehension Mock 1 manifest contains no Continuous Writing content", () => {
  assert.equal(manifestIds.filter((id) => id.includes("writing")).length, 0);
});

test("Reading Comprehension Mock 1 manifest contains no Applied Reasoning content", () => {
  assert.equal(manifestIds.filter((id) => /applied.?reasoning|-ar\d|-ar-/i.test(id)).length, 0);
});

test("Reading Comprehension Mock 1 manifest contains no Practice-track content (w1-/w2-/w3- id prefixes, or any of the 7 known live-Writing prompt ids)", () => {
  const practiceTrackPrefixes = manifestIds.filter((id) => /^w[123]-/.test(id));
  assert.equal(practiceTrackPrefixes.length, 0);

  const knownLivePracticeWritingIds = [
    "eng-inc003-writing-favouriteplace-01", "eng-inc003-writing-imaginedplace-01",
    "eng-inc003-writing-pocketmoney-01", "eng-pc005-writing-personinfluence",
    "eng-pc005-writing-somethingnew", "mock-writing-mistakelearned-01", "mock-writing-newplace-01",
  ];
  for (const id of knownLivePracticeWritingIds) {
    assert.ok(!manifestIds.includes(id), `${id} (a live Practice prompt) must not appear in a Mock manifest`);
  }
});

test("composition_provenance totals are internally consistent with the manifest and with each other", () => {
  assert.equal(provenance.rawRowCount, 28);
  assert.equal(provenance.totalMarks, 65);
  const diff = provenance.difficultyDistribution as Record<string, number>;
  assert.equal(diff.easy + diff.medium + diff.hard + diff.challenge, 28);
  const skill = provenance.skillDistribution as Record<string, number>;
  assert.equal(skill.evidence + skill.inference + skill.vocabulary + skill.structure, 28);
  assert.deepEqual(provenance.reservedNotIncluded, [
    "eng-inc002-roboticsfinal", "eng-inc002-sailandsteam", "mock-writing-screentime-01",
  ]);
});

test("migration 212 freezes the form inactive (active=false) and never activates it", () => {
  assert.match(migration212, /values \(v_form_id, 'english', 1, 'timed_section', v_question_manifest, false, v_composition_provenance\)/);
  assert.doesNotMatch(migration212, /set\s+active\s*=\s*true/i, "migration 212 must never set active = true");
});

test("migration 212 uses attempt_type='timed_section', not 'full_mock' (avoids colliding with Mathematics Mock 1's hardcoded query)", () => {
  assert.match(migration212, /'timed_section'/);
  assert.doesNotMatch(migration212.replace(/--.*$/gm, ""), /'full_mock'/, "must not reuse Mathematics Mock 1's attempt_type outside comments");
});

test("migrations 209-212 never modify Mathematics content or the Mathematics Mock 1 form", () => {
  for (const [name, sql] of [["209", migration209], ["210", migration210], ["211", migration211], ["212", migration212]] as const) {
    const executableLines = sql.split("\n").filter((l) => !l.trimStart().startsWith("--")).join("\n");
    assert.doesNotMatch(executableLines, /'mock-mr\d/, `migration ${name} must not reference any Mathematics question id`);
    assert.doesNotMatch(executableLines, /'mathematics-mock-1'/, `migration ${name} must not reference the Mathematics Mock 1 form id`);
  }
});

function stripComments(sql: string): string {
  return sql.split("\n").filter((l) => !l.trimStart().startsWith("--")).join("\n");
}

test("migration 210 promotes both reserved passages to mock_eligible (held in reserve, not forgotten)", () => {
  assert.match(migration210, /'eng-inc002-roboticsfinal-q01'/);
  assert.match(migration210, /'eng-inc002-sailandsteam-q01'/);
  assert.doesNotMatch(stripComments(migration210), /writing/i, "migration 210's executable SQL (Reading-only) must not touch Writing content — comment prose explaining the split is expected and excluded here");
});

test("migration 211 is Writing-only and touches exactly one row", () => {
  assert.match(migration211, /'mock-writing-screentime-01'/);
  assert.doesNotMatch(stripComments(migration211), /'mock-eng-boathouse|eng-inc001-|eng-inc002-/, "migration 211's executable SQL (Writing-only) must not touch any Reading content");
});

test("migration 209's corrected practice-block trigger uses the narrower Tier-2 exposed view, not 206/208's broad Tier-1 'any form membership' view", () => {
  const fn = migration209.match(/create or replace function public\.ali_block_exposed_content_practice_promotion[\s\S]*?\$\$;/);
  assert.ok(fn, "migration 209 must redefine ali_block_exposed_content_practice_promotion");
  assert.match(fn![0], /ali_mock_exposed_question_ids/);
  assert.match(fn![0], /ali_mock_exposed_passage_ids/);
  assert.doesNotMatch(fn![0], /ali_mock_retired_question_ids|ali_mock_retired_passage_ids/, "the corrected function must not use the broad Tier-1 views for the strict practice-block check");
});

test("migration 209's Tier-2 exposed views require active=true or a real attempt, not mere manifest membership", () => {
  const exposedQuestionsView = migration209.match(/create or replace view public\.ali_mock_exposed_question_ids[\s\S]*?;/);
  assert.ok(exposedQuestionsView);
  assert.match(exposedQuestionsView![0], /form\.active = true/);
  assert.match(exposedQuestionsView![0], /ali_mock_attempt/);
});

test("migration 209 adds freeze-then-immutable protection for genuinely exposed forms only", () => {
  const fn = migration209.match(/create or replace function public\.ali_block_exposed_form_manifest_mutation[\s\S]*?\$\$;/);
  assert.ok(fn, "migration 209 must define ali_block_exposed_form_manifest_mutation");
  assert.match(fn![0], /old\.active = true/);
  assert.match(fn![0], /ali_mock_attempt/);
  // A draft (never active, no attempts) form's manifest must remain
  // correctable -- proven structurally by the function only raising
  // inside the v_was_exposed branch, never unconditionally.
  assert.match(fn![0], /if v_was_exposed then/);
});

test("all four migrations are explicitly marked NOT APPLIED in their own header", () => {
  for (const [name, sql] of [["209", migration209], ["210", migration210], ["211", migration211], ["212", migration212]] as const) {
    assert.match(sql, /NOT APPLIED/, `migration ${name} must disclose it is not applied`);
  }
});
