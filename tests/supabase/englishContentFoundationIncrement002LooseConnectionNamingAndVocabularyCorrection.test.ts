import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * English Content Foundation, Increment 002 (Decision 241), migration
 * 164 — The Loose Connection Naming Remediation + Q2(d) Vocabulary
 * Precision Correction. A LIVE database correction (migrations
 * 161/162/163 are Founder-confirmed already applied and immutable) that
 * UPDATEs live rows only, via runtime SQL text substitution
 * (replace/regexp_replace), not literal rewritten content -- so these
 * tests verify the SQL's own structure, preconditions, and post-write
 * proofs directly, cross-referenced against migration 161/163's own
 * known real content where a concrete before/after value can be derived
 * (e.g. Q2(d)'s remaining accepted-answer set after "gloating" is
 * removed).
 */

const sql161 = fs.readFileSync("supabase/migrations/161_english_content_foundation_increment002_comprehension.sql", "utf8");
const sql163 = fs.readFileSync("supabase/migrations/163_english_content_foundation_increment002_loose_connection_q2_grouped_scoring_correction.sql", "utf8");
const sql164 = fs.readFileSync("supabase/migrations/164_english_content_foundation_increment002_loose_connection_naming_and_vocabulary_correction.sql", "utf8");
const decisionLog = fs.readFileSync("ALI_DECISION_LOG.md", "utf8");
const authoringStandard = fs.readFileSync("QUESTION_AUTHORING_STANDARD.md", "utf8");

interface ParsedPrompt {
  id: string;
  marks: number;
  acceptedAnswers?: string[];
}

function stripComments(sqlText: string): string {
  return sqlText.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");
}

function parseJsonBlocks(sqlText: string): ParsedPrompt[] {
  const parts = sqlText.split("$json$");
  const prompts: ParsedPrompt[] = [];
  for (let i = 1; i < parts.length; i += 2) prompts.push(JSON.parse(parts[i]) as ParsedPrompt);
  return prompts;
}

const executable164 = stripComments(sql164);

// === 1. Mr Carter replaces Mr Adeyemi ========================================

test("1. all 4 affected columns (passage original_text, question prompt/explanation/addresses_misconception) replace the literal 'Mr Adeyemi' with 'Mr Carter'", () => {
  const matches = [...executable164.matchAll(/replace\((\w+(?:::text)?), 'Mr Adeyemi', 'Mr Carter'\)/g)].map((m) => m[1]);
  assert.deepEqual(matches.sort(), ["addresses_misconception", "explanation", "original_text", "prompt::text"].sort());
});

// === 2. Daniel replaces child character Ade ==================================

test("2. all 4 affected columns replace whole-word ADE/Ade/ade (all-caps, title-case, and lowercase forms) with DANIEL/Daniel/daniel", () => {
  for (const [pattern, replacement] of [["\\yADE\\y", "DANIEL"], ["\\yAde\\y", "Daniel"], ["\\yade\\y", "daniel"]]) {
    const escapedPattern = pattern.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
    const count = (executable164.match(new RegExp(`'${escapedPattern}', '${replacement}', 'g'`, "g")) || []).length;
    assert.equal(count, 4, `expected all 4 affected columns to apply '${pattern}' -> '${replacement}', found ${count}`);
  }
});

test("2b. the rename chain applies 'Mr Adeyemi'->'Mr Carter' before the word-boundary ADE passes, on the same nested expression, for every affected column", () => {
  const nestedExpressionCount = (executable164.match(/regexp_replace\(\s*\n?\s*regexp_replace\(\s*\n?\s*regexp_replace\(\s*\n?\s*replace\(\w+(?:::text)?, 'Mr Adeyemi', 'Mr Carter'\),\s*\n?\s*'\\yADE\\y', 'DANIEL', 'g'\),\s*\n?\s*'\\yAde\\y', 'Daniel', 'g'\),\s*\n?\s*'\\yade\\y', 'daniel', 'g'\)/g) || []).length;
  assert.equal(nestedExpressionCount, 4, "expected the full 4-pass nested rename chain to appear once per affected column (4 total)");
});

// === 3. Nisha remains unchanged ===============================================

test("3. the two rename UPDATE statements' own SET clauses never mention 'Nisha' -- it is only read (never mutated), referenced solely inside the read-only count-preservation verification", () => {
  const passageUpdateMatch = executable164.match(/update public\.ali_passage_bank\s*\nset original_text = [\s\S]*?\nwhere id = 'eng-inc002-roboticsfinal';/);
  const questionUpdateMatch = executable164.match(/update public\.ali_question_bank\s*\nset prompt = \([\s\S]*?\nwhere learning_unit_id = 'eng-inc002-roboticsfinal';/);
  assert.ok(passageUpdateMatch, "the passage rename UPDATE statement must be present");
  assert.ok(questionUpdateMatch, "the question rename UPDATE statement must be present");
  assert.ok(!passageUpdateMatch![0].includes("Nisha"), "the passage rename UPDATE's own SET clause must never mention 'Nisha'");
  assert.ok(!questionUpdateMatch![0].includes("Nisha"), "the question rename UPDATE's own SET clause must never mention 'Nisha'");
});

test("3b. the migration computes and compares a pre/post 'Nisha' occurrence count and refuses if it changed", () => {
  assert.match(executable164, /v_nisha_before/);
  assert.match(executable164, /v_nisha_after/);
  assert.match(sql164, /"Nisha" occurrence count changed/);
  assert.match(executable164, /if v_nisha_after != v_nisha_before then/);
});

// === 4. No stale deployable old-name dependency remains ======================

test("4. the post-write verification computes a stale-name count across passage + all question rows (original_text, prompt, explanation, addresses_misconception) and refuses if non-zero", () => {
  assert.match(executable164, /v_stale_count/);
  assert.match(executable164, /t like '%Mr Adeyemi%' or t ~ '\\yAde\\y' or t ~ '\\yADE\\y' or t ~ '\\yade\\y'/);
  assert.match(executable164, /if v_stale_count != 0 then/);
  assert.match(sql164, /stale reference\(s\) to the old character names/);
});

// === 5. Historical audit/Decision evidence is not rewritten ==================

test("5. ALI_DECISION_LOG.md's own prior Decision 240 entry (the one that literally quotes the original names as its own trigger evidence) still contains them, unrewritten (historical record preserved)", () => {
  const decision240Index = decisionLog.indexOf("### Decision 240");
  const decision241Index = decisionLog.indexOf("### Decision 241");
  assert.ok(decision240Index !== -1, "Decision 240 entry must exist");
  const decision240Text = decision241Index !== -1 ? decisionLog.slice(decision240Index, decision241Index) : decisionLog.slice(decision240Index);
  assert.match(decision240Text, /"Mr Adeyemi", "Ade", "Nisha"/, "Decision 240's own historical entry must still quote the original trigger evidence verbatim, not be rewritten to the new names");
});

test("5b. migrations 161 and 163 remain byte-unchanged (still contain the original 'Mr Adeyemi'/'Ade' text) -- migration 164 corrects LIVE ROWS only, never edits an already-applied migration file", () => {
  assert.match(sql161, /Mr Adeyemi/);
  assert.match(sql163, /Mr Adeyemi/);
  assert.ok(!sql161.includes("Mr Carter"), "migration 161 must not have been edited to contain the new name");
  assert.ok(!sql163.includes("Mr Carter"), "migration 163 must not have been edited to contain the new name");
});

// === 6/7. Q2(d) vocabulary precision ==========================================

test("6. migration 164 removes 'gloating' from eng-inc002-roboticsfinal-q02d's own acceptedAnswers via jsonb_set + the '-' array-element-removal operator", () => {
  assert.match(executable164, /jsonb_set\(\s*\n?\s*prompt,\s*\n?\s*'\{acceptedAnswers\}',\s*\n?\s*\(prompt -> 'acceptedAnswers'\) - 'gloating'\s*\n?\s*\)/);
  assert.match(executable164, /where id = 'eng-inc002-roboticsfinal-q02d';/);
});

test("7. the remaining Q2(d) accepted-answer set, after removing 'gloating' from migration 163's own known live content, is exactly {victorious, celebratory, proud of winning}", () => {
  const q02dPrompts = parseJsonBlocks(sql163).filter((p) => p.id === "eng-inc002-roboticsfinal-q02d");
  assert.equal(q02dPrompts.length, 1);
  const currentAccepted = q02dPrompts[0].acceptedAnswers!;
  assert.ok(currentAccepted.includes("gloating"), "precondition: migration 163's own live content must currently include 'gloating' for this test to be meaningful");
  const remaining = currentAccepted.filter((a) => a !== "gloating");
  assert.deepEqual(remaining.sort(), ["celebratory", "proud of winning", "victorious"].sort());
});

// === 8. q02b-e remain four independent one-mark rows =========================

test("8. post-write verification re-confirms q02b-e's own question_group_id/group_order/subpart_label/marking_mode exactly, and Q2's own total marks remain 4", () => {
  assert.match(executable164, /group_order = 1 and subpart_label = '\(b\)'/);
  assert.match(executable164, /group_order = 2 and subpart_label = '\(c\)'/);
  assert.match(executable164, /group_order = 3 and subpart_label = '\(d\)'/);
  assert.match(executable164, /group_order = 4 and subpart_label = '\(e\)'/);
  assert.match(executable164, /if v_q02_marks != 4 then/);
});

// === 9. passage remains 22 marks ==============================================

test("9. post-write verification re-confirms the passage's own total marks remain 22", () => {
  assert.match(executable164, /if v_passage_marks != 22 then/);
  assert.match(executable164, /where learning_unit_id = 'eng-inc002-roboticsfinal';/);
});

// === 10. eligibility remains authentic_assessment_candidate ==================

test("10. migration 164 never SETs eligibility_status anywhere, and both preconditions and post-write verification require authentic_assessment_candidate throughout", () => {
  assert.ok(!/set[\s\S]{0,300}eligibility_status\s*=/i.test(executable164), "no SET clause may mutate eligibility_status");
  const requireCount = (executable164.match(/authentic_assessment_candidate/g) || []).length;
  assert.ok(requireCount >= 3, `expected 'authentic_assessment_candidate' to be referenced at least 3 times (precondition check, post-write count query, post-write error message), found ${requireCount}`);
  assert.match(executable164, /eligibility_status = 'authentic_assessment_candidate'/);
  assert.match(executable164, /eligibility_status != 'authentic_assessment_candidate'/);
});

// === 11. Practice/Mock isolation remains intact ===============================

test("11. migration 164 never references practice_eligible or mock_eligible anywhere", () => {
  assert.ok(!executable164.includes("practice_eligible"));
  assert.ok(!executable164.includes("mock_eligible"));
});

// === 12. review registration remains intact ===================================

test("12. migration 164 never INSERTs/UPDATEs/DELETEs ali_family_review -- only a read-only EXISTS check in post-write verification", () => {
  const mutatingRefs = [...executable164.matchAll(/(insert into|update|delete from)\s+public\.ali_family_review/gi)];
  assert.deepEqual(mutatingRefs, []);
  assert.match(executable164, /select exists\(\s*\n?\s*select 1 from public\.ali_family_review/);
  assert.match(executable164, /review_type = 'mock_english_passage_independent_review'/);
  assert.match(executable164, /decision = 'pending_independent_review'/);
});

// === 13. Standard v1.0 is canonical and discoverable ==========================

test("13. QUESTION_AUTHORING_STANDARD.md contains the adopted §16 Standard v1.0, and the §10 Review Checklist references it", () => {
  assert.match(authoringStandard, /## 16\. Angel UK Representation, Naming and Cultural Context Standard \(v1\.0\)/);
  assert.match(authoringStandard, /Adopted Decision 241|adopted Decision 241/);
  const checklistIndex = authoringStandard.indexOf("## 10. Review Checklist");
  const nextSectionIndex = authoringStandard.indexOf("## 11.");
  const checklistText = authoringStandard.slice(checklistIndex, nextSectionIndex);
  assert.match(checklistText, /§16/);
});

test("13b. the standard's own 14 provisions and explicit non-goals are both present", () => {
  assert.match(authoringStandard, /### 16\.1 The 14 provisions/);
  assert.match(authoringStandard, /### 16\.2 Explicit non-goals/);
  assert.match(authoringStandard, /does \*\*NOT\*\*: ban Yoruba\/Nigerian\/African names/);
});

// === 14. Decision 240 P2 register remains preserved ===========================

test("14. Decision 240's own P2 findings (Okafor repetition, migration 044 clustering, Maths name-pool asymmetry) remain recorded as NOT remediated by Decision 241, in both the Decision Log and the authoring standard", () => {
  const decision240Index = decisionLog.indexOf("### Decision 240");
  const decision241Index = decisionLog.indexOf("### Decision 241");
  assert.ok(decision240Index !== -1, "Decision 240 entry must still exist in the log");
  const decision240Text = decision241Index !== -1 ? decisionLog.slice(decision240Index, decision241Index) : decisionLog.slice(decision240Index);
  assert.match(decision240Text, /Okafor/);
  assert.match(decision240Text, /044/);

  assert.match(authoringStandard, /### 16\.5 Known open items \(Decision 240 P2 register, not remediated by Decision 241\)/);
  assert.match(authoringStandard, /Okafor/);
  assert.match(authoringStandard, /039\/040/);
});

// === Structural / safety proofs matching this session's established discipline ===

test("the migration is idempotent: if the passage's own text already contains 'Mr Carter', it is a verified no-op", () => {
  assert.match(executable164, /original_text like '%Mr Carter%'/);
  assert.match(sql164, /already renamed \(Mr Carter present\) -- already applied\. No changes made\./);
});

test("the pristine precondition requires exactly 12 live question rows and refuses otherwise", () => {
  assert.match(executable164, /if v_question_count != 12 then/);
  assert.match(sql164, /expected exactly 12 live question rows/);
});

test("no DELETE and no INSERT of a new row exists anywhere in migration 164 -- UPDATE only", () => {
  assert.ok(!/delete from public\.ali_(question_bank|passage_bank)/i.test(executable164));
  assert.ok(!/insert into public\.ali_(question_bank|passage_bank)/i.test(executable164));
});

test("migration is wrapped in a single begin/commit transaction", () => {
  assert.equal((executable164.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable164.match(/\bcommit;/g) || []).length, 1);
});

test("not applied disclosure present in the raw file header", () => {
  assert.match(sql164, /NOT APPLIED\. Generated for Founder application/);
});

test("no other Increment 002 passage (Sail and Steam) is referenced anywhere in migration 164's real SQL", () => {
  assert.ok(!executable164.includes("eng-inc002-sailandsteam"));
});
