import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * English Content Foundation, Increment 001 — Post-Decision-234 Amendment
 * Remediation (Decision 235), migrations 157/158/159. Structural + semantic
 * tests against the real migration SQL text, mirroring migration
 * 155/156's own established precondition -> pristine/already-corrected/
 * refuse -> post-write-verification test pattern
 * (englishContentFoundationIncrement001ReviewTargetRemediation.test.ts).
 */

const sql152 = fs.readFileSync("supabase/migrations/152_english_content_foundation_increment001_comprehension.sql", "utf8");
const sql153 = fs.readFileSync("supabase/migrations/153_english_content_foundation_increment001_writing.sql", "utf8");
const sql157 = fs.readFileSync("supabase/migrations/157_english_content_foundation_increment001_review_governance_amendment_evidence_requirement.sql", "utf8");
const sql158 = fs.readFileSync("supabase/migrations/158_english_content_foundation_increment001_somewhere_new_founder_amendment_clarification.sql", "utf8");
const sql159 = fs.readFileSync("supabase/migrations/159_english_content_foundation_increment001_amendment_remediation.sql", "utf8");

function stripComments(sqlText: string): string {
  return sqlText.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");
}

const exec157 = stripComments(sql157);
const exec158 = stripComments(sql158);
const exec159 = stripComments(sql159);

// migration 159 has exactly 3 top-level `do $$ ... end $$;` blocks, in
// Understudy/Somewhere-New/Screen-Time order -- split on the `do $$`
// block boundary itself (not on the "(Somewhere New)" marker text,
// which appears INSIDE the begin body, after each block's own `declare`
// section -- slicing from there would cut off the declare section's own
// pristine-text/checklist literals).
const doBlockStarts = [...exec159.matchAll(/^do \$\$/gm)].map((m) => m.index!);
assert.equal(doBlockStarts.length, 3, "migration 159 must have exactly 3 do $$ blocks (Understudy Q1, Somewhere New, Screen Time)");
const [block1Start, block2Start, block3Start] = doBlockStarts;
const understudyBlock = exec159.slice(block1Start, block2Start);
const somewhereNewBlock = exec159.slice(block2Start, block3Start);
const screenTimeBlock = exec159.slice(block3Start);
assert.match(understudyBlock, /\(Understudy Q1\)/);
assert.match(somewhereNewBlock, /\(Somewhere New\)/);
assert.match(screenTimeBlock, /\(Screen Time\)/);

// === Migration 152/153 are genuinely unchanged (already-live content) =====

test("migrations 152 and 153 are not modified by this decision -- 159 corrects live data via new UPDATEs, never edits the already-applied migration files", () => {
  assert.match(sql152, /Migration 152/);
  assert.match(sql153, /Migration 153/);
  assert.ok(!sql152.includes("Decision 235"), "migration 152's own file must not be touched by Decision 235");
  assert.ok(!sql153.includes("Decision 235"), "migration 153's own file must not be touched by Decision 235");
});

// === Migration 157 -- governance ============================================

test("migration 157 extends ali_family_review_review_type_check to include exactly the 2 new review_type values, alongside all 7 pre-existing ones", () => {
  const match = exec157.match(/add constraint ali_family_review_review_type_check\s*check \(review_type in \(([\s\S]*?)\)\);/);
  assert.ok(match, "review_type_check constraint definition not found");
  const values = [...match![1].matchAll(/'([a-z_]+)'/g)].map((m) => m[1]);
  assert.deepEqual(values.sort(), [
    "content_review", "maths_teaching_review", "english_teaching_review", "writing_teaching_review",
    "mock_maths_independent_review", "mock_english_passage_independent_review", "mock_writing_prompt_independent_review",
    "founder_amendment_clarification", "amendment_verification",
  ].sort());
});

test("migration 157 extends ali_family_review_decision_requires_notes to require real notes content (blank-line separator) for approved_with_amendment, and leaves the rejected rule's own text unchanged", () => {
  assert.match(exec157, /decision != 'rejected' or notes is not null/);
  assert.match(exec157, /decision != 'approved_with_amendment'/);
  assert.match(exec157, /position\(E'\\n\\n' in notes\) > 0/);
});

test("migration 157's notes-requirement constraint is added NOT VALID -- existing rows (including the live Somewhere New row) are never retroactively judged or rewritten", () => {
  const constraintBlock = exec157.split("ali_family_review_decision_requires_notes").slice(-1)[0];
  assert.match(constraintBlock, /not valid;/);
});

test("migration 157 never touches decision, eligibility_status, review_target_type, or any data row on any table -- constraint definitions only", () => {
  assert.ok(!/\bupdate\s+public\./i.test(exec157));
  assert.ok(!/\binsert\s+into\s+public\./i.test(exec157));
  assert.ok(!exec157.includes("eligibility_status"));
});

// === Migration 158 -- Somewhere New Founder clarification ==================

test("migration 158 targets exactly mock-writing-wc01a-newplace, reviewer FOUNDER, review_type founder_amendment_clarification -- never touches any other family_id", () => {
  assert.match(exec158, /'mock-writing-wc01a-newplace'/);
  assert.match(exec158, /'FOUNDER'/);
  assert.match(exec158, /'founder_amendment_clarification'/);
  assert.ok(!exec158.includes("mock-writing-wc01a-screentime"));
  assert.ok(!exec158.includes("mock-writing-wc01a-mistakelearned"));
  assert.ok(!exec158.includes("eng-inc001-understudy"));
  assert.ok(!exec158.includes("eng-inc001-bee-navigation"));
});

test("migration 158 contains no UPDATE against ali_family_review -- purely additive INSERT, the original review row is never modified", () => {
  assert.ok(!/update\s+public\.ali_family_review/i.test(exec158));
  assert.match(exec158, /insert into public\.ali_family_review/);
});

test("migration 158's precondition requires the ORIGINAL row's exact reviewer/decision/review_type/notes-substring before inserting the clarification -- refuses rather than guessing which row to link against", () => {
  assert.match(exec158, /review_type = 'mock_writing_prompt_independent_review'/);
  assert.match(exec158, /reviewer = 'Ayobami Lawal'/);
  assert.match(exec158, /decision = 'approved_with_amendment'/);
  assert.match(exec158, /notes like '%Founder review with caution\.%'/);
  assert.match(exec158, /raise exception/);
});

test("migration 158 is idempotent (already-applied branch is a verified no-op) and includes a post-write check that the original row's own notes are unchanged", () => {
  assert.match(exec158, /already exists -- already applied\. No changes made\./);
  assert.match(exec158, /post-write check failed/i);
});

test("migration 158's inserted clarification carries the Founder's own exact clarification text verbatim (place-arrival/imagined-situation/feelings-developed), not a paraphrase invented by this decision", () => {
  assert.match(exec158, /remove the unnecessary requirement that the place must be a real personal experience/);
  assert.match(exec158, /a plausible imagined situation, because the task assesses writing quality rather than autobiographical truth/);
  assert.match(exec158, /soften the requirement that feelings must necessarily ''change'' over time/);
});

// === Migration 159 -- content remediation ===================================

test("migration 159 touches exactly 3 rows: eng-inc001-understudy-q01, mock-writing-newplace-01, mock-writing-screentime-01 -- Bee, the other 6 Understudy questions, and Mistake Learned are never referenced as UPDATE targets", () => {
  const updateWhereIds = [...exec159.matchAll(/where id = '([a-z0-9-]+)'/g)].map((m) => m[1]);
  assert.deepEqual(new Set(updateWhereIds), new Set(["eng-inc001-understudy-q01", "mock-writing-newplace-01", "mock-writing-screentime-01"]));
  for (const id of ["eng-inc001-understudy-q02", "eng-inc001-understudy-q03", "eng-inc001-understudy-q04", "eng-inc001-understudy-q05", "eng-inc001-understudy-q06", "eng-inc001-understudy-q07"]) {
    assert.ok(!exec159.includes(id), `migration 159 must never reference ${id}`);
  }
  assert.ok(!exec159.includes("mock-writing-mistakelearned-01"), "A Mistake You Learned From must never be a migration 159 target -- it is the approved control case");
});

test("migration 159 explicitly discloses the Bee audit finding (no content change) in its own header rather than silently omitting the target", () => {
  assert.match(sql159, /ALREADY SATISFIED/);
  assert.match(sql159, /No UPDATE is issued against/);
  assert.match(sql159, /eng-inc001-bee-navigation or any of its 8 questions/);
  assert.ok(!/update\s+public\.ali_(passage|question)_bank\s+set[\s\S]*?where id = 'eng-inc001-bee/i.test(exec159));
});

test("migration 159 (Understudy Q1): acceptedAnswers extended with a lost-her-voice paraphrase, canonical laryngitis answer preserved, modelAnswer never targeted by any SET clause", () => {
  assert.match(understudyBlock, /"laryngitis","she had laryngitis","the note said she had laryngitis","she had lost her voice","she lost her voice"/);
  const setClause = understudyBlock.match(/update public\.ali_question_bank\s+set([\s\S]*?)where/i)?.[1] ?? "";
  assert.ok(!/\bmodelAnswer\b/.test(setClause), "modelAnswer must never be rewritten -- it is learner-facing and read by the legacy extractKeywords() heuristic");
});

test("migration 159 (Understudy Q1): the marking-policy explanation append explicitly distinguishes the note's own diagnosis from the narrator's later 'hoarse whisper' description, and is appended (||), never a blind overwrite", () => {
  assert.match(exec159, /explanation = explanation \|\| ' AMENDMENT \(Decision 235/);
  assert.match(exec159, /does not receive the mark on its own/);
  assert.match(exec159, /must not be conflated/);
});

test("migration 159 (Understudy Q1) precondition requires the exact known post-Decision-229 modelAnswer/acceptedAnswers pristine state, refuses otherwise, and is idempotent against re-application", () => {
  assert.match(exec159, /'The note confirmed that she had laryngitis\.'/);
  assert.match(exec159, /prompt -> 'acceptedAnswers' \? 'she had lost her voice'/);
  assert.match(exec159, /already corrected -- acceptedAnswers already includes the lost-her-voice paraphrase/);
});

test("migration 159 (Somewhere New): the NEW prompt/checklist (what actually gets written) allows a real OR plausible imagined situation, never tests autobiographical truth, and softens the forced feelings-changed formula into broader development -- the OLD forced-'changed' wording legitimately still appears elsewhere in this block, in the pristine-state precondition it is being corrected away from", () => {
  const newPromptText = somewhereNewBlock.match(/v_new_prompt_text text := '(.*?)';/)?.[1] ?? "";
  const newChecklistLiteral = somewhereNewBlock.match(/v_new_checklist jsonb := '(\[.*?\])'::jsonb;/)?.[1] ?? "";
  assert.ok(newPromptText.length > 0 && newChecklistLiteral.length > 0, "v_new_prompt_text/v_new_checklist declarations not found");
  assert.match(newPromptText, /plausible situation you imagine happening to you/);
  assert.match(newChecklistLiteral, /how your thoughts, impressions or feelings developed/);
  assert.ok(!newChecklistLiteral.includes("Show HOW your feelings changed over time"), "the forced 'changed' formula must be gone from the NEW checklist");
  assert.match(somewhereNewBlock, /a plausible imagined situation is equally valid, since the task assesses writing quality, not autobiographical truth/);
});

test("migration 159 (Somewhere New): only prompt.prompt, prompt.checklist, and addresses_misconception are ever SET -- title/type/difficulty/timeMinutes/id are untouched (jsonb_set targets only the 2 named keys)", () => {
  assert.match(somewhereNewBlock, /jsonb_set\(jsonb_set\(prompt, '\{prompt\}', to_jsonb\(v_new_prompt_text\)\), '\{checklist\}', v_new_checklist\)/);
  assert.match(somewhereNewBlock, /addresses_misconception = v_new_misconception/);
  assert.ok(!somewhereNewBlock.includes("'{title}'") && !somewhereNewBlock.includes("'{type}'") && !somewhereNewBlock.includes("'{timeMinutes}'"), "no other jsonb key may be targeted");
});

test("migration 159 (Somewhere New) precondition requires the exact known migration-153 pristine prompt/checklist text, refuses otherwise, and is idempotent against re-application", () => {
  assert.match(somewhereNewBlock, /Write about a time you visited somewhere completely new to you/);
  assert.match(somewhereNewBlock, /already corrected\. No changes made\./);
});

test("migration 159 (Screen Time): genre guidance permits a rhetorical question or moment of emphasis within a personal-opinion voice, distinct from shifting into a formal speech register", () => {
  assert.match(screenTimeBlock, /a rhetorical question or a moment of deliberate emphasis is fine if it suits your own voice/);
  assert.match(screenTimeBlock, /not itself a problem; only shifting into a different genre is/);
});

test("migration 159 (Screen Time): the NEW checklist (v_new_checklist, what actually gets written) drops the 'genuinely experienced/noticed' authenticity gate and replaces it with a requirement for specific, convincing examples or reasoning -- the OLD phrase legitimately still appears elsewhere in this block, in the pristine-state precondition it is being corrected away from", () => {
  const newChecklistLiteral = screenTimeBlock.match(/v_new_checklist jsonb := '(\[.*?\])'::jsonb;/)?.[1] ?? "";
  assert.ok(newChecklistLiteral.length > 0, "v_new_checklist declaration not found");
  assert.ok(!newChecklistLiteral.includes("genuinely noticed") && !newChecklistLiteral.includes("genuinely experienced"), "the authenticity gate wording must be gone from the NEW checklist");
  assert.match(newChecklistLiteral, /specific, convincing examples or reasoning, not just a generic list of reasons/);
});

test("migration 159 (Screen Time): only prompt.checklist and addresses_misconception are ever SET -- prompt.prompt (the task question itself) is untouched", () => {
  assert.match(screenTimeBlock, /prompt = jsonb_set\(prompt, '\{checklist\}', v_new_checklist\)/);
  assert.ok(!screenTimeBlock.includes("'{prompt}'"), "Screen Time's own task question text must not be touched -- only checklist/misconception were flagged");
});

test("migration 159 (Screen Time) precondition requires the exact known migration-153 pristine checklist, refuses otherwise, and is idempotent against re-application", () => {
  assert.match(screenTimeBlock, /Support your opinion with your own experience or something you have genuinely noticed/);
  assert.match(screenTimeBlock, /already corrected\. No changes made\./);
});

test("migration 159 never SETs eligibility_status, decision, active, or content_version anywhere (only read in preconditions), and creates no Mock content", () => {
  const setClauses = [...exec159.matchAll(/update\s+public\.ali_question_bank\s+set([\s\S]*?)where/gi)].map((m) => m[1]);
  for (const clause of setClauses) {
    assert.ok(!/\b(eligibility_status|decision|active|content_version)\s*=/.test(clause), "migration 159 must never SET eligibility_status/decision/active/content_version");
  }
  assert.ok(!exec159.includes("mock_eligible"));
  assert.ok(!exec159.includes("ali_mock_form"));
  assert.ok(!/insert\s+into\s+public\./i.test(exec159), "migration 159 must be UPDATE-only -- no new row is ever inserted");
});

// === Governance: original review records remain immutable ==================

test("no migration in this decision (157/158/159) ever issues an UPDATE against ali_family_review's decision, reviewer, or review_type columns for an EXISTING row", () => {
  for (const exec of [exec157, exec158, exec159]) {
    const updateBlocks = [...exec.matchAll(/update\s+public\.ali_family_review\s+set([\s\S]*?)where/gi)];
    for (const m of updateBlocks) {
      assert.ok(!/\b(decision|reviewer|review_type)\s*=/.test(m[1]), "an existing ali_family_review row's decision/reviewer/review_type must never be UPDATEd by this decision");
    }
  }
});
