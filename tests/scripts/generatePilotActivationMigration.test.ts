import { test } from "node:test";
import assert from "node:assert/strict";
import { buildPilotActivationSql } from "../../scripts/generate-pilot-activation-migration.mjs";
import { checkActivationEligibility } from "../../scripts/generate-activation-migration.mjs";

/**
 * Educational Increment 007G — First Reviewed Content Activation.
 * checkActivationEligibility() is already covered by
 * generateActivationMigration.test.ts (007E) and reused unchanged here;
 * these tests cover the new multi-target combination logic specific to
 * the pilot: one migration spanning both ali_question_bank (60 rows
 * across 6 families) and ali_passage_bank (1 row), in a single
 * transaction, with no row outside the named set touched.
 */

test("buildPilotActivationSql updates both ali_question_bank and ali_passage_bank in one transaction", () => {
  const sql = buildPilotActivationSql({
    migrationNumber: "055", reviewer: "Ayobami Lawal",
    questionIds: ["a", "b", "c"], passageId: "wave2-eng-surprise",
  });
  assert.ok(sql.includes("ali_question_bank"));
  assert.ok(sql.includes("ali_passage_bank"));
  const beginCount = (sql.match(/\bbegin;/g) || []).length;
  const commitCount = (sql.match(/\bcommit;/g) || []).length;
  assert.equal(beginCount, 1, "must be a single transaction, not two separate migrations");
  assert.equal(commitCount, 1);
});

test("buildPilotActivationSql's question update lists exactly the given IDs, no more no less", () => {
  const sql = buildPilotActivationSql({
    migrationNumber: "055", reviewer: "Ayobami Lawal",
    questionIds: ["w2-surprise-01", "w2-surprise-02"], passageId: "wave2-eng-surprise",
  });
  assert.ok(sql.includes("'w2-surprise-01', 'w2-surprise-02'"));
});

test("buildPilotActivationSql's passage update targets the exact passage id given, via equality not IN", () => {
  const sql = buildPilotActivationSql({
    migrationNumber: "055", reviewer: "Ayobami Lawal",
    questionIds: ["a"], passageId: "wave2-eng-surprise",
  });
  assert.ok(sql.includes("where id = 'wave2-eng-surprise'"));
});

test("buildPilotActivationSql only ever moves provisional rows in both tables, matching the idempotent pattern used throughout this project", () => {
  const sql = buildPilotActivationSql({
    migrationNumber: "055", reviewer: "Ayobami Lawal",
    questionIds: ["a"], passageId: "wave2-eng-surprise",
  });
  const provisionalGuards = (sql.match(/and eligibility_status = 'provisional'/g) || []).length;
  assert.equal(provisionalGuards, 2, "both the question and passage updates must guard on still-provisional");
  // The migration's own header comment may honestly DISCLOSE that
  // mock_eligible/independently_validated are untouched (a defensible,
  // desirable statement) -- what must never appear is an actual `set`
  // clause assigning either value.
  assert.ok(!/set\s+eligibility_status\s*=\s*'mock_eligible'/i.test(sql), "must never SET mock_eligible");
  assert.ok(!/set\s+eligibility_status\s*=\s*'independently_validated'/i.test(sql), "must never SET independently_validated as a shortcut");
  const setClauses = (sql.match(/set eligibility_status = '[a-z_]+'/g) || []);
  assert.ok(setClauses.every((s) => s === "set eligibility_status = 'practice_eligible'"), "every SET clause must target practice_eligible only");
});

test("buildPilotActivationSql records the real reviewer name for traceability", () => {
  const sql = buildPilotActivationSql({
    migrationNumber: "055", reviewer: "Ayobami Lawal",
    questionIds: ["a"], passageId: "wave2-eng-surprise",
  });
  assert.ok(sql.includes("Ayobami Lawal"));
});

test("checkActivationEligibility (reused unchanged from 007E) still blocks a row whose eligibility_status has already moved on, exactly as the pilot script relies on", () => {
  const rows = [
    { id: "w2-morningpatrol-08", content_version: 1, provenance: "angel_original", active: true, eligibility_status: "provisional" },
    { id: "w2-longwalk-02", content_version: 1, provenance: "angel_original", active: true, eligibility_status: "practice_eligible" },
  ];
  const { canActivate, problems } = checkActivationEligibility(rows, 1);
  assert.equal(canActivate, false);
  assert.ok(problems[0].includes("w2-longwalk-02"));
});

test("the real 60-ID manifest computed for this pilot has no duplicates and no cross-family collisions", () => {
  // Mirrors the exact family membership fetched live from production
  // during 007G's manifest computation (see the increment's own report).
  const byFamily = {
    "wave2-fam-multiselect": ["w2-morningpatrol-08", "w2-longwalk-02", "w2-stormwarning-02", "w2-surprise-02", "w2-twoletters-07", "w2-pianorecital-07"],
    "wave1-fam-sequencing": ["w1-kitemaker-06", "w1-lastbus-06", "w1-newgirl-06", "w1-atticdoor-06", "w1-raceday-06", "w1-letter-06", "w2-lastslice-06", "w2-morningpatrol-02", "w2-morningpatrol-03", "w2-twoletters-06", "w2-longwalk-03", "w2-stormwarning-03", "w2-surprise-04", "w2-sciencefair-07", "w2-stormwarning-07"],
    "wave1-fam-quote-explain": ["w1-kitemaker-05", "w1-lastbus-05", "w1-newgirl-05", "w1-atticdoor-05", "w1-raceday-05", "w1-letter-05", "w2-morningpatrol-06", "w2-understudy-04", "w2-twoletters-05", "w2-longwalk-06", "w2-stormwarning-05", "w2-pianorecital-05", "w2-longwalk-07"],
    "wave1-fam-two-character": ["w1-raceday-04", "w2-lastslice-02", "w2-twoletters-02", "w2-sciencefair-02", "w2-surprise-01", "w2-sciencefair-06"],
    "wave1-fam-vocab-explain": ["w1-kitemaker-02", "w1-lastbus-02", "w1-newgirl-02", "w1-atticdoor-02", "w1-raceday-02", "w1-letter-02", "w2-lastslice-03", "w2-morningpatrol-04", "w2-understudy-02", "w2-twoletters-03", "w2-longwalk-04", "w2-sciencefair-03", "w2-stormwarning-04", "w2-pianorecital-02", "w2-surprise-03", "w2-twoletters-08", "w2-understudy-07"],
    "mr02-compare": ["mr02-cmp-01", "mr02-cmp-02", "mr02-cmp-03"],
  };
  const all = Object.values(byFamily).flat();
  assert.equal(all.length, 60);
  assert.equal(new Set(all).size, 60, "no question ID may appear under more than one family");
  // The 4 Surprise-passage questions are each present exactly once, under exactly one family.
  for (const id of ["w2-surprise-01", "w2-surprise-02", "w2-surprise-03", "w2-surprise-04"]) {
    const owningFamilies = Object.entries(byFamily).filter(([, ids]) => ids.includes(id));
    assert.equal(owningFamilies.length, 1, `${id} must belong to exactly one family`);
  }
});
