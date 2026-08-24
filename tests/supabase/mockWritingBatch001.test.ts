import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Mock Programme Increment 006, English Mock Content Foundation, Batch 001
 * (Track B), migrations 098 (Continuous Writing content) and 099 (pending
 * independent review registration). Parses the real migration SQL text,
 * mirroring the established convention (tests/content/
 * mockMathematicsBatch001.test.ts).
 */

const writingSql = fs.readFileSync("supabase/migrations/098_mock_writing_content_foundation.sql", "utf8");
const pendingReviewSql = fs.readFileSync("supabase/migrations/099_mock_english_writing_pending_review.sql", "utf8");

// Strips full-line `--` comments (this project's own migration header/
// disclosure convention) so assertions about the real executable SQL are
// never confused by prose in this migration's own extensive commentary,
// which legitimately discusses QT-WC-01b, wrt-003, and AI-scoring
// identifiers as disclosed gaps/boundaries, never as live SQL targets.
function stripComments(sql: string): string {
  return sql
    .split("\n")
    .filter((line) => !line.trimStart().startsWith("--"))
    .join("\n");
}

const writingExecutable = stripComments(writingSql);

interface ParsedWritingPrompt {
  id: string;
  title: string;
  prompt: string;
  type: "narrative" | "descriptive" | "persuasive";
  difficulty: string;
  timeMinutes: number;
  checklist: string[];
}

function parsePrompts(sql: string): ParsedWritingPrompt[] {
  const parts = sql.split("$json$");
  assert.equal(parts.length, 7, `expected 3 $json$ blocks (7 split parts); found ${(parts.length - 1) / 2}`);
  const prompts: ParsedWritingPrompt[] = [];
  for (let i = 1; i < parts.length; i += 2) {
    prompts.push(JSON.parse(parts[i]) as ParsedWritingPrompt);
  }
  return prompts;
}

const prompts = parsePrompts(writingSql);

test("parses exactly 3 Continuous Writing candidate prompts", () => {
  assert.equal(prompts.length, 3);
  assert.deepEqual(
    prompts.map((p) => p.id).sort(),
    ["mock-writing-cookopinion-01", "mock-writing-kindness-01", "mock-writing-mindchange-01"].sort()
  );
});

test("every prompt is QT-WC-01a (skill column), subject writing, eligibility_status authentic_assessment_candidate", () => {
  for (const p of prompts) {
    const rowHeader = new RegExp(`\\('${p.id}', 'writing', 'QT-WC-01a', array\\['csse'\\], '\\w+', 'open-response', \\d+,`);
    assert.match(writingSql, rowHeader, `expected ${p.id}'s row header to declare subject writing, skill QT-WC-01a`);
  }
  const statusCount = (writingExecutable.match(/'authentic_assessment_candidate'/g) || []).length;
  assert.equal(statusCount, 3);
  assert.doesNotMatch(writingExecutable, /'independently_validated'/);
  assert.doesNotMatch(writingExecutable, /'mock_eligible'/);
});

test("no prompt claims to be QT-WC-01b (picture-stimulus) -- the genuine image-asset gap is disclosed, not filled with a fake claim", () => {
  assert.doesNotMatch(writingExecutable, /QT-WC-01b/);
  for (const p of prompts) {
    assert.doesNotMatch(p.prompt.toLowerCase(), /picture below|photograph|image below/);
  }
});

test("every prompt has at least 6 checklist items and a timeMinutes value, no hidden model answer field", () => {
  for (const p of prompts) {
    assert.ok(p.checklist.length >= 6, `${p.id} should have a substantial checklist`);
    assert.ok(p.timeMinutes > 0);
    assert.ok(!("modelAnswer" in p), `${p.id} must not carry a pre-written sample response`);
    assert.ok(!("sampleAnswer" in p));
  }
});

test("the three prompts use three genuinely different shapes, not the same shape with a topic swapped -- their prompt text differs beyond the topic noun", () => {
  const mindchange = prompts.find((p) => p.id === "mock-writing-mindchange-01")!;
  const kindness = prompts.find((p) => p.id === "mock-writing-kindness-01")!;
  const cookopinion = prompts.find((p) => p.id === "mock-writing-cookopinion-01")!;
  assert.match(mindchange.prompt, /changed your mind/i);
  assert.match(kindness.prompt, /kind/i);
  assert.match(cookopinion.prompt, /do you think/i);
  // cookopinion is a direct yes/no opinion question -- structurally distinct
  // from the other two, which are anecdote-based ("write about a time").
  assert.doesNotMatch(cookopinion.prompt, /write about a time/i);
  assert.match(mindchange.prompt, /write about a time/i);
  assert.match(kindness.prompt, /write about a time/i);
});

test("no AI-writing-scoring identifier is referenced -- the existing quarantine boundary (Decisions 47/60/61/106) is untouched", () => {
  for (const identifier of ["WRITING_CORRECTNESS_THRESHOLD", "writing-feedback", "supportTier", "overallScore"]) {
    const codeOccurrences = writingSql.split("\n").filter((line) => !line.trimStart().startsWith("--") && line.includes(identifier));
    assert.equal(codeOccurrences.length, 0, `${identifier} must not appear outside this migration's own header comment`);
  }
});

test("no mock_eligible or ali_mock_form reference anywhere in this migration", () => {
  assert.doesNotMatch(writingSql.replace(/-- .*$/gm, ""), /'mock_eligible'/);
  assert.doesNotMatch(writingSql, /ali_mock_form/);
});

test("existing wrt-003 row (migration 013) is never a write target of this migration -- it may still be named in prose (e.g. an explanation column contrasting a new prompt's register with it)", () => {
  assert.doesNotMatch(writingExecutable, /\(\s*'wrt-003'/, "wrt-003 must never appear as an INSERT row's own id");
  assert.doesNotMatch(writingExecutable, /where id = 'wrt-003'/, "wrt-003 must never appear as an UPDATE/DELETE target");
  assert.equal(prompts.filter((p) => p.id === "wrt-003").length, 0);
});

// === Migration 099: pending independent review registration ===========

test("migration 099 registers exactly 4 pending-review rows: 1 passage + 3 writing_prompt", () => {
  const targetTypeMatches = [...pendingReviewSql.matchAll(/select '(passage|writing_prompt)', '([\w-]+)', 'UNASSIGNED',/g)];
  assert.equal(targetTypeMatches.length, 4);
  const byType = targetTypeMatches.reduce<Record<string, string[]>>((acc, [, type, id]) => {
    (acc[type] ??= []).push(id);
    return acc;
  }, {});
  assert.deepEqual(byType.passage, ["mock-eng-boathouse"]);
  assert.deepEqual(
    (byType.writing_prompt ?? []).sort(),
    ["mock-writing-cookopinion-01", "mock-writing-kindness-01", "mock-writing-mindchange-01"].sort()
  );
});

test("every pending-review row uses reviewer UNASSIGNED and decision pending_independent_review -- no self-approval", () => {
  const decisionCount = (pendingReviewSql.match(/'pending_independent_review'::public\.family_review_decision/g) || []).length;
  assert.equal(decisionCount, 4);
  const reviewerCount = (pendingReviewSql.match(/'UNASSIGNED',/g) || []).length;
  assert.equal(reviewerCount, 4);
  assert.doesNotMatch(pendingReviewSql, /'approved'/);
});

test("review_type is correctly split: passage row uses mock_english_passage_independent_review, writing rows use mock_writing_prompt_independent_review", () => {
  const passageBlock = pendingReviewSql.split("insert into public.ali_family_review")[1];
  assert.match(passageBlock, /'mock_english_passage_independent_review'/);
  assert.doesNotMatch(passageBlock, /mock_writing_prompt_independent_review/);

  const writingBlocks = pendingReviewSql.split("insert into public.ali_family_review").slice(2);
  for (const block of writingBlocks) {
    assert.match(block, /'mock_writing_prompt_independent_review'/);
  }
});
