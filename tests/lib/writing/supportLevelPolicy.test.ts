import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  presentWritingChecklistForContext,
  checklistItemSupportLevel,
  WRITING_CHECKLIST_ITEM_SUPPORT_LEVELS,
  WRITING_SUPPORT_CONTEXTS,
  INDEPENDENT_PRACTICE_REMINDER,
} from "../../../lib/writing/supportLevelPolicy";

/**
 * Decision 256 — Increment 003 Writing Assessment-Scaffolding Amendment.
 * Decision 255 recorded "An Invented Place" as `approved_with_amendment`:
 * the imaginative task itself is sound, but its stored checklist is too
 * prescriptive for authentic independent/formal assessment presentation.
 * These tests prove the presentation-policy separation generically,
 * against the real stored checklist content of all 7 QT-WC-01a rows
 * (migrations 098, 153, 167 — confirmed the complete set by grep), and
 * prove the underlying content is never duplicated or rewritten.
 */

function extractPromptJson(sql: string, id: string): { checklist: string[] } {
  const re = new RegExp(`\\('${id}',[\\s\\S]*?\\$json\\$([\\s\\S]*?)\\$json\\$`);
  const m = sql.match(re);
  assert.ok(m, `expected to find a $json$ block for id ${id}`);
  return JSON.parse(m![1]);
}

const sql098 = fs.readFileSync("supabase/migrations/098_mock_writing_content_foundation.sql", "utf8");
const sql153 = fs.readFileSync("supabase/migrations/153_english_content_foundation_increment001_writing.sql", "utf8");
const sql167 = fs.readFileSync("supabase/migrations/167_english_content_foundation_increment003_writing.sql", "utf8");

const ALL_SEVEN_QTWC01A_PROMPTS: [string, string][] = [
  ["eng-inc003-writing-imaginedplace-01", sql167],
  ["mock-writing-mindchange-01", sql098],
  ["mock-writing-kindness-01", sql098],
  ["mock-writing-cookopinion-01", sql098],
  ["mock-writing-newplace-01", sql153],
  ["mock-writing-mistakelearned-01", sql153],
  ["mock-writing-screentime-01", sql153],
];

// === §1.A Teaching: full stored checklist, byte-identical, never duplicated ===

for (const [id, sql] of ALL_SEVEN_QTWC01A_PROMPTS) {
  test(`teaching context: ${id} receives its own full stored checklist unchanged`, () => {
    const { checklist } = extractPromptJson(sql, id);
    const result = presentWritingChecklistForContext(id, checklist, "teaching");
    assert.deepEqual(result, checklist);
    // Genuinely the same content, not a rewritten copy.
    for (const item of checklist) assert.ok(result.includes(item));
  });
}

// === §1.C Mock: only `core` items, never a prohibited coaching category ===

test("mock context: An Invented Place shows only length + proofreading, no coaching phrasing", () => {
  const { checklist } = extractPromptJson(sql167, "eng-inc003-writing-imaginedplace-01");
  const result = presentWritingChecklistForContext("eng-inc003-writing-imaginedplace-01", checklist, "mock");
  assert.deepEqual(result, ["Write at least six sentences", "Check paragraphing, spelling and punctuation carefully"]);
});

for (const [id, sql] of ALL_SEVEN_QTWC01A_PROMPTS) {
  test(`mock context: ${id} never exposes a coaching-classified item`, () => {
    const { checklist } = extractPromptJson(sql, id);
    const result = presentWritingChecklistForContext(id, checklist, "mock");
    for (const item of checklist) {
      const index = checklist.indexOf(item);
      if (checklistItemSupportLevel(id, index) === "coaching") {
        assert.ok(!result.includes(item), `mock context leaked a coaching item for ${id}: "${item}"`);
      }
    }
    // Every real prompt retains at least the length requirement in Mock —
    // the assessment must still tell the candidate how long to write.
    assert.ok(result.some((i) => /at least six sentences/i.test(i)));
  });
}

test("mock context never exposes prohibited coaching phrasing for An Invented Place specifically (Decision 256's own named example)", () => {
  const { checklist } = extractPromptJson(sql167, "eng-inc003-writing-imaginedplace-01");
  const result = presentWritingChecklistForContext("eng-inc003-writing-imaginedplace-01", checklist, "mock");
  const joined = result.join(" ").toLowerCase();
  assert.ok(!joined.includes("magical forest"));
  assert.ok(!joined.includes("sensory"));
  assert.ok(!joined.includes("consistent"));
});

// === §1.B Independent: core items + one generic, non-prescriptive reminder ===

test("independent context: An Invented Place shows core items plus one generic reminder, no itemised coaching", () => {
  const { checklist } = extractPromptJson(sql167, "eng-inc003-writing-imaginedplace-01");
  const result = presentWritingChecklistForContext("eng-inc003-writing-imaginedplace-01", checklist, "independent");
  assert.deepEqual(result, [
    "Write at least six sentences",
    "Check paragraphing, spelling and punctuation carefully",
    INDEPENDENT_PRACTICE_REMINDER,
  ]);
});

test("the independent-practice reminder names no specific writing technique (anti-memorisation, §3)", () => {
  const lower = INDEPENDENT_PRACTICE_REMINDER.toLowerCase();
  for (const forbidden of ["sensory", "consistent", "vocabulary", "vague", "voice", "paragraph"]) {
    assert.ok(!lower.includes(forbidden));
  }
});

for (const [id, sql] of ALL_SEVEN_QTWC01A_PROMPTS) {
  test(`independent context: ${id} is strictly less prescriptive than teaching (fewer or equal items, no full coaching text)`, () => {
    const { checklist } = extractPromptJson(sql, id);
    const independentResult = presentWritingChecklistForContext(id, checklist, "independent");
    const teachingResult = presentWritingChecklistForContext(id, checklist, "teaching");
    assert.ok(independentResult.length <= teachingResult.length);
    const coachingItems = checklist.filter((_, i) => checklistItemSupportLevel(id, i) === "coaching");
    for (const coachingItem of coachingItems) {
      assert.ok(!independentResult.includes(coachingItem));
    }
  });
}

// === Canonical content is never duplicated ===

test("presentWritingChecklistForContext never introduces a second copy of any stored item across contexts", () => {
  const { checklist } = extractPromptJson(sql167, "eng-inc003-writing-imaginedplace-01");
  for (const context of WRITING_SUPPORT_CONTEXTS) {
    const result = presentWritingChecklistForContext("eng-inc003-writing-imaginedplace-01", checklist, context);
    const seen = new Set<string>();
    for (const item of result) {
      assert.ok(!seen.has(item), `duplicate item rendered in ${context}: "${item}"`);
      seen.add(item);
    }
  }
});

// === Safe defaults for unclassified content ===

test("an unrecognised prompt id defaults every item to coaching (never assumed safe for Mock)", () => {
  const checklist = ["Write at least six sentences", "Some brand-new unaudited coaching item"];
  assert.equal(presentWritingChecklistForContext("brand-new-unaudited-prompt", checklist, "mock").length, 0);
  assert.equal(checklistItemSupportLevel("brand-new-unaudited-prompt", 0), "coaching");
  assert.equal(checklistItemSupportLevel(null, 0), "coaching");
});

test("every classified support level is a valid ChecklistItemSupportLevel value", () => {
  for (const levels of Object.values(WRITING_CHECKLIST_ITEM_SUPPORT_LEVELS)) {
    for (const level of levels) assert.ok(level === "core" || level === "coaching");
  }
});

// === §4 six-existing-prompt audit: every real row has a full, non-empty classification ===

for (const [id, sql] of ALL_SEVEN_QTWC01A_PROMPTS) {
  test(`§4 audit: ${id}'s classification array covers every real stored checklist item, content untouched`, () => {
    const { checklist } = extractPromptJson(sql, id);
    const levels = WRITING_CHECKLIST_ITEM_SUPPORT_LEVELS[id];
    assert.ok(levels, `expected an explicit classification for ${id}`);
    assert.equal(levels.length, checklist.length, `classification length mismatch for ${id}`);
    // At least the length requirement and a proofreading check are core.
    assert.ok(levels.includes("core"));
  });
}
