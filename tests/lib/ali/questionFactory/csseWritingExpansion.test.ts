import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { CSSE_WRITING_EXPANSION, toStoredPromptJson } from "@/lib/ali/questionFactory/csseWritingExpansion";

/**
 * CSSE Completion Priority 4 -- structural checks on the prepared Writing candidates. These cannot judge whether a
 * picture is "narratively generative" (that is the Founder's review), but they enforce everything that can be
 * checked mechanically: distinct topics, Mock separation, alt text that matches the actual illustration, the stored
 * JSON shape the live renderer expects, and a migration that registers candidates only and promotes nothing.
 */

// Every Writing title live in ali_question_bank on 2026-10-08 (Practice, Mock, Mock-reserve and candidate rows).
const EXISTING_TITLES = [
  "Advice for Someone Younger", "Something That Didn't Go to Plan", "A Skill You're Proud Of", "Something You Found Difficult",
  "A Place That Means Something to You", "The Riverboat at Dawn", "Should Everybody Learn to Cook?", "An Act of Kindness",
  "Should Children Have Limits on Screen Time?", "The Old Shed", "A Time You Changed Your Mind", "Your Favourite Place to Be",
  "An Invented Place", "Pocket Money or Helping Anyway?", "Someone Who Has Made a Difference to You", "Something You Would Like to Learn",
  "The Treehouse Lantern", "A Mistake You Learned From", "Somewhere New", "Should Schools Ban Smartphones?",
];

test("seven prompts: 4 reflective/discursive and 3 picture-led, unique ids and families", () => {
  assert.equal(CSSE_WRITING_EXPANSION.length, 7);
  assert.equal(CSSE_WRITING_EXPANSION.filter((p) => p.skill === "QT-WC-01a").length, 4);
  assert.equal(CSSE_WRITING_EXPANSION.filter((p) => p.skill === "QT-WC-01b").length, 3);
  assert.equal(new Set(CSSE_WRITING_EXPANSION.map((p) => p.id)).size, 7);
  assert.equal(new Set(CSSE_WRITING_EXPANSION.map((p) => p.familyId)).size, 7);
});

test("no title repeats any existing Practice, Mock or reserve Writing topic, and none is named like a Mock row", () => {
  for (const p of CSSE_WRITING_EXPANSION) {
    assert.ok(!EXISTING_TITLES.includes(p.title), `${p.title} duplicates an existing topic`);
    assert.doesNotMatch(p.id, /^mock-/);
    assert.doesNotMatch(p.familyId, /^mock-/);
  }
});

test("checklists carry the evidenced six-sentence minimum and genre-specific guidance", () => {
  for (const p of CSSE_WRITING_EXPANSION) {
    assert.ok(p.checklist.length >= 6, p.id);
    assert.match(p.checklist[0], /at least six sentences/i);
    assert.ok(p.checklist.some((c) => /paragraph/i.test(c)));
    assert.ok(p.checklist.some((c) => /spelling and punctuation/i.test(c)));
    if (p.skill === "QT-WC-01a") assert.ok(p.checklist.some((c) => /why|reason/i.test(c)), `${p.id} must ask for a reason`);
    if (p.skill === "QT-WC-01b") assert.ok(p.checklist.some((c) => /turning point/i.test(c)), `${p.id} must ask for a turning point`);
  }
});

test("picture prompts: image asset exists, SVG description equals the stored alt text, at least five footholds all visible in the alt text", () => {
  for (const p of CSSE_WRITING_EXPANSION.filter((x) => x.skill === "QT-WC-01b")) {
    assert.ok(p.stimulus, p.id);
    const file = `public${p.stimulus!.imageAssetUrl}`;
    assert.ok(fs.existsSync(file), `${file} missing`);
    const svg = fs.readFileSync(file, "utf8");
    assert.match(svg, /<svg[^>]+role="img"/);
    const desc = svg.match(/<desc[^>]*>([\s\S]*?)<\/desc>/)![1].trim();
    assert.equal(desc, p.stimulus!.altText, `${p.id}: SVG <desc> must equal the stored alt text`);
    assert.ok((p.narrativeFootholds ?? []).length >= 5, `${p.id}: needs at least five story footholds`);
    const alt = p.stimulus!.altText.toLowerCase();
    for (const f of p.narrativeFootholds!) {
      const keyword = f.toLowerCase().split(/[\s-]+/).find((w) => w.length >= 5)!;
      assert.ok(alt.includes(keyword.replace(/s$/, "")), `${p.id}: foothold "${f}" is not visible in the alt text`);
    }
    // the checklist must tell the writer to ground the story in details of THIS picture
    assert.ok(p.checklist.some((c) => /details you can see in the picture/i.test(c)));
  }
});

test("picture-led prompts do not rely on the image alone being describable: the task asks for a story and a turning point", () => {
  for (const p of CSSE_WRITING_EXPANSION.filter((x) => x.skill === "QT-WC-01b")) {
    assert.equal(p.prompt, "Write a story based on the picture below.");
    assert.equal(p.type, "picture-narrative");
  }
});

test("stored prompt JSON has exactly the shape of the live Writing rows (and the stimulus shape of the Treehouse Lantern)", () => {
  for (const p of CSSE_WRITING_EXPANSION) {
    const j = toStoredPromptJson(p);
    const keys = Object.keys(j).sort();
    const expected = ["checklist", "difficulty", "id", "prompt", "timeMinutes", "title", "type", ...(p.stimulus ? ["stimulus"] : [])].sort();
    assert.deepEqual(keys, expected);
    assert.equal(j.difficulty, "year6-exam");
    assert.equal(j.timeMinutes, 25);
    if (p.stimulus) assert.deepEqual(Object.keys(j.stimulus as object).sort(), ["altText", "imageAssetUrl", "type"]);
  }
});

test("migration 268 registers candidates only: no promotion, no Mock status, no fabricated review decision, one pending row per family", () => {
  const sql = fs.readFileSync("supabase/migrations/268_csse_writing_expansion_candidates_pending_review.sql", "utf8").split(String.fromCharCode(10)).filter((l) => !l.trimStart().startsWith("--")).join(String.fromCharCode(10));
  for (const p of CSSE_WRITING_EXPANSION) {
    assert.equal(sql.split(`'${p.id}', 'writing'`).length - 1, 1, `${p.id} inserted exactly once`);
    assert.equal(sql.split(`'pending_independent_review'::public.family_review_decision`).length - 1, 7);
  }
  assert.equal(sql.split("'authentic_assessment_candidate'").length - 1, 7);
  assert.doesNotMatch(sql, /practice_eligible|mock_eligible/);
  assert.doesNotMatch(sql, /'approved'|approved_with_amendment/);
  assert.match(sql, /on conflict \(id\) do nothing/);
  assert.doesNotMatch(sql, /\bupdate\s+public\./i);
});

test("the promotion template sits OUTSIDE supabase/migrations, ships with every id commented out, and refuses unreviewed or Mock-exposed rows", () => {
  assert.ok(!fs.existsSync("supabase/migrations/269_csse_writing_expansion_promotion_TEMPLATE.sql"));
  const t = fs.readFileSync("scripts/output/csse-writing-expansion/269_promotion_TEMPLATE.sql", "utf8");
  for (const p of CSSE_WRITING_EXPANSION) assert.ok(t.includes(`-- '${p.id}',`), `${p.id} commented out`);
  assert.doesNotMatch(t, /^\s+'eng-csse-writing/m, "no id is active by default");
  assert.match(t, /ali_mock_exposed_question_ids/);
  assert.match(t, /reviewer <> 'UNASSIGNED'/);
  assert.doesNotMatch(t, /set decision/i, "the template never writes a review decision");
});
