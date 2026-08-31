import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  presentWritingChecklistForContext,
  checklistItemSupportLevel,
  INDEPENDENT_PRACTICE_REMINDER,
  WRITING_SUPPORT_CONTEXTS,
} from "../../../lib/writing/supportLevelPolicy";

/**
 * Decision 259 — Continuous Writing Practice Readiness and Capacity.
 * Migration 169 authors 2 new candidate QT-WC-01a prompts, targeting a
 * genuine gap the Decision 259 audit found (see migration 169's own
 * header): the existing 7-prompt pool has a structurally-identical
 * opinion pair (cookopinion-01 / screentime-01) and no prompt using the
 * CSSE-004/014-evidenced "favourite place" descriptive-justificatory
 * shape. These tests prove the two new prompts (a) go through the same
 * generic support-level policy as every other prompt with no prompt-
 * specific rendering logic, (b) are structurally distinct from the
 * existing pool, and (c) remain candidate-only — migration 169 is NOT
 * applied, and neither id carries any promoted eligibility_status.
 */

function extractPromptJson(sql: string, id: string): { checklist: string[]; type: string; prompt: string } {
  const re = new RegExp(`\\('${id}',[\\s\\S]*?\\$json\\$([\\s\\S]*?)\\$json\\$`);
  const m = sql.match(re);
  assert.ok(m, `expected to find a $json$ block for id ${id}`);
  return JSON.parse(m![1]);
}

const MIGRATION_169_PATH = "supabase/migrations/169_english_content_foundation_writing_depth_extension_decision259.sql";
const sql169 = fs.readFileSync(MIGRATION_169_PATH, "utf8");
const sql098 = fs.readFileSync("supabase/migrations/098_mock_writing_content_foundation.sql", "utf8");
const sql153 = fs.readFileSync("supabase/migrations/153_english_content_foundation_increment001_writing.sql", "utf8");
const sql167 = fs.readFileSync("supabase/migrations/167_english_content_foundation_increment003_writing.sql", "utf8");

const NEW_CANDIDATE_PROMPTS: [string, string][] = [
  ["eng-inc003-writing-favouriteplace-01", sql169],
  ["eng-inc003-writing-pocketmoney-01", sql169],
];

// === Migration 169 stays candidate-only and unapplied ===

test("migration 169 declares itself NOT APPLIED", () => {
  assert.ok(sql169.includes("NOT APPLIED"));
});

for (const [id] of NEW_CANDIDATE_PROMPTS) {
  test(`${id} is inserted at authentic_assessment_candidate only, never a promoted status`, () => {
    const re = new RegExp(`\\('${id}',[\\s\\S]*?'([a-z_]+)', 1, true,`);
    const m = sql169.match(re);
    assert.ok(m, `expected to find an eligibility_status for ${id}`);
    assert.equal(m![1], "authentic_assessment_candidate");
    for (const forbidden of ["practice_eligible", "independently_validated", "mock_eligible"]) {
      assert.ok(!m![1].includes(forbidden));
    }
  });
}

test("neither new id already exists in the 7 live migrations (no accidental duplication)", () => {
  for (const [id] of NEW_CANDIDATE_PROMPTS) {
    for (const sql of [sql098, sql153, sql167]) {
      assert.ok(!sql.includes(`'${id}'`), `${id} unexpectedly found in an already-applied migration`);
    }
  }
});

// === Same generic policy, no prompt-specific rendering logic ===

for (const [id, sql] of NEW_CANDIDATE_PROMPTS) {
  test(`teaching context: ${id} receives its own full stored checklist unchanged`, () => {
    const { checklist } = extractPromptJson(sql, id);
    assert.deepEqual(presentWritingChecklistForContext(id, checklist, "teaching"), checklist);
  });

  test(`mock context: ${id} never exposes a coaching-classified item`, () => {
    const { checklist } = extractPromptJson(sql, id);
    const result = presentWritingChecklistForContext(id, checklist, "mock");
    checklist.forEach((item, index) => {
      if (checklistItemSupportLevel(id, index) === "coaching") {
        assert.ok(!result.includes(item), `mock context leaked a coaching item for ${id}: "${item}"`);
      }
    });
    assert.ok(result.some((i) => /at least six sentences/i.test(i)));
  });

  test(`independent context: ${id} shows core items plus the shared generic reminder, no itemised coaching`, () => {
    const { checklist } = extractPromptJson(sql, id);
    const result = presentWritingChecklistForContext(id, checklist, "independent");
    const core = checklist.filter((_, i) => checklistItemSupportLevel(id, i) === "core");
    assert.deepEqual(result, [...core, INDEPENDENT_PRACTICE_REMINDER]);
  });

  test(`${id}: classification array is fully explicit and covers every stored checklist item`, () => {
    const { checklist } = extractPromptJson(sql, id);
    const levels = checklist.map((_, i) => checklistItemSupportLevel(id, i));
    assert.equal(levels.length, checklist.length);
    assert.ok(levels.includes("core"));
  });

  test(`presentWritingChecklistForContext never duplicates a stored item for ${id} across contexts`, () => {
    const { checklist } = extractPromptJson(sql, id);
    for (const context of WRITING_SUPPORT_CONTEXTS) {
      const result = presentWritingChecklistForContext(id, checklist, context);
      const seen = new Set<string>();
      for (const item of result) {
        assert.ok(!seen.has(item), `duplicate item rendered in ${context} for ${id}: "${item}"`);
        seen.add(item);
      }
    }
  });
}

// === Structural distinctness the migration claims ===

test("Pocket Money prompt requires referencing both stated positions, unlike the existing 'Do you think X?' pair", () => {
  const { checklist, prompt } = extractPromptJson(sql169, "eng-inc003-writing-pocketmoney-01");
  assert.ok(/some people think[\s\S]*other people think/i.test(prompt), "prompt should state two named positions");
  assert.ok(checklist.some((item) => /refer to both views/i.test(item)));

  // The existing opinion pair's checklists never require referring to a
  // second position -- only "consider, briefly" it.
  const { checklist: cookChecklist } = extractPromptJson(sql098, "mock-writing-cookopinion-01");
  const { checklist: screenChecklist } = extractPromptJson(sql153, "mock-writing-screentime-01");
  for (const existing of [cookChecklist, screenChecklist]) {
    assert.ok(!existing.some((item) => /refer to both views/i.test(item)));
  }
});

test("cookopinion-01 and screentime-01 really are the structurally-identical pair migration 169 cites (regression baseline)", () => {
  const { checklist: cookChecklist } = extractPromptJson(sql098, "mock-writing-cookopinion-01");
  const { checklist: screenChecklist } = extractPromptJson(sql153, "mock-writing-screentime-01");
  assert.deepEqual(cookChecklist, screenChecklist);
});

test("Favourite Place prompt requires justification (WHY), not a narrated before/after change arc", () => {
  const { checklist } = extractPromptJson(sql169, "eng-inc003-writing-favouriteplace-01");
  assert.ok(checklist.some((item) => /WHY this place makes you feel/i.test(item)));
  assert.ok(!checklist.some((item) => /changed|before|turning-point/i.test(item)));
});

test("both new prompts use the already-catalogued 'descriptive' response type, no new taxonomy invented", () => {
  for (const [id] of NEW_CANDIDATE_PROMPTS) {
    const { type } = extractPromptJson(sql169, id);
    assert.equal(type, "descriptive");
  }
});
