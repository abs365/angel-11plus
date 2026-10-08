import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { COMPASS_ROSE_FIXES, MARKING_CONTRACT_REPAIRS, TOP_UP_ITEMS, TOP_UP_TOTAL_MARKS, REPAIR_TIER } from "@/lib/ali/questionFactory/englishFormBCompletion";
import { buildDisjointWrongAnswer, validateEnglishMarkingContract } from "@/lib/ali/questionFactory/englishMarkingContractGate";

function passageText(passageQuestionId: string): string {
  const sql = fs.readFileSync("supabase/migrations/166_english_content_foundation_increment003_comprehension.sql", "utf8");
  const start = sql.indexOf("$json$" + '{"id":"' + passageQuestionId + '"');
  assert.ok(start >= 0, passageQuestionId);
  const end = sql.indexOf("$json$", start + 6);
  const obj = JSON.parse(sql.slice(start + 6, end)) as { passageText: string };
  return obj.passageText;
}
const PASSAGES: Record<string, string> = {
  "eng-inc003-compassrosechallenge": passageText("eng-inc003-compassrosechallenge-q01"),
  "eng-inc003-salmonnavigation": passageText("eng-inc003-salmonnavigation-q01"),
};
const norm = (s: string) => s.toLowerCase().replace(/[‘’]/g, "'");

test("top-up is six items worth eight marks: 2 x RC-03 (2 marks) and 4 x RC-04 (1 mark)", () => {
  assert.equal(TOP_UP_ITEMS.length, 6);
  assert.equal(TOP_UP_TOTAL_MARKS, 8);
  assert.equal(TOP_UP_ITEMS.filter((i) => i.skill === "QT-RC-03" && i.marks === 2).length, 2);
  assert.equal(TOP_UP_ITEMS.filter((i) => i.skill === "QT-RC-04" && i.marks === 1).length, 4);
  assert.equal(new Set(TOP_UP_ITEMS.map((i) => i.id)).size, 6);
  assert.deepEqual(TOP_UP_ITEMS.filter((i) => i.skill === "QT-RC-03").map((i) => i.passageId).sort(), ["eng-inc003-compassrosechallenge", "eng-inc003-salmonnavigation"]);
});

test("every target word or phrase really appears in its passage", () => {
  for (const i of TOP_UP_ITEMS) assert.ok(norm(PASSAGES[i.passageId]).includes(norm(i.targetInPassage)), `${i.id}: ${i.targetInPassage}`);
});

test("quoted phrases in the question text are verbatim from the passage", () => {
  for (const i of TOP_UP_ITEMS.filter((x) => x.skill === "QT-RC-03")) {
    for (const m of i.question.matchAll(/"([^"]+)"/g)) {
      const q = m[1].replace(/\.$/, "");
      assert.ok(norm(PASSAGES[i.passageId]).includes(norm(q)), `${i.id}: "${q}"`);
    }
  }
});

test("synonym items: real marking contract, wrong answers score zero, no accepted answer is a word from the target's own sentence", () => {
  for (const i of TOP_UP_ITEMS.filter((x) => x.tier === "TIER2_ACCEPTED_SET")) {
    const r = validateEnglishMarkingContract({
      candidateId: i.id,
      marks: i.marks,
      acceptedAnswers: i.acceptedAnswers,
      modelAnswer: i.modelAnswer,
      validationTier: i.tier,
      canonicalAnswer: i.modelAnswer,
      approvedVariants: i.acceptedAnswers.filter((a) => a !== i.modelAnswer),
      disjointWrongAnswer: buildDisjointWrongAnswer(i.acceptedAnswers),
      plausibleWrongAnswers: i.plausibleWrongAnswers,
    });
    assert.ok(r.valid, `${i.id}: ${JSON.stringify(r.failures)}`);
    assert.ok(i.acceptedAnswers.includes(i.modelAnswer));
    assert.ok(!i.acceptedAnswers.includes(i.targetInPassage), "the target word itself is not a synonym");
    assert.ok((i.plausibleWrongAnswers ?? []).length >= 3);
  }
});

test("manual-marking items state a marker guide with one mark per observable element and are not auto-marked", () => {
  for (const i of TOP_UP_ITEMS.filter((x) => x.marks === 2)) {
    assert.equal(i.tier, REPAIR_TIER);
    assert.match(i.markingGuidance ?? "", /1 mark: .* 1 mark: /);
    assert.ok(i.modelAnswer.length > 40);
  }
});

test("Compass Rose fixes: Q5 no longer claims a first investigator; accepted sets only grow", () => {
  const q5 = COMPASS_ROSE_FIXES.find((f) => f.id.endsWith("-q05"))!;
  assert.doesNotMatch(q5.question!, /first investigating/);
  assert.match(q5.question!, /order the passage describes/);
  const text = norm(PASSAGES["eng-inc003-compassrosechallenge"]);
  // the passage does present the four in this order, and describes all as simultaneous ("meanwhile")
  const order = ["elif read it", "casey, meanwhile", "wei took", "grace, meanwhile"].map((s) => text.indexOf(s));
  assert.ok(order.every((n) => n >= 0) && order.every((n, k) => k === 0 || n > order[k - 1]), JSON.stringify(order));
  for (const f of COMPASS_ROSE_FIXES.filter((x) => x.addAccepted)) assert.ok(f.addAccepted!.length >= 4 && !f.addAccepted!.some((a) => /^(the )?(sundial|stone wall|duck pond)$/.test(a)), f.id);
});

test("marking repair targets the eight free-text explanation items, all of which exist in the registering migrations", () => {
  assert.equal(MARKING_CONTRACT_REPAIRS.length, 8);
  const anning = fs.readFileSync("supabase/migrations/191_programme_completion_inc001_comprehension_anning.sql", "utf8");
  const group = fs.readFileSync("supabase/migrations/193_programme_completion_inc003_comprehension_groupproject.sql", "utf8");
  for (const id of MARKING_CONTRACT_REPAIRS) assert.ok((id.includes("anning") ? anning : group).includes(`"id":"${id}"`), id);
  // retrieval items Q1-Q2 stay accepted-set: they are NOT repaired
  assert.ok(!MARKING_CONTRACT_REPAIRS.some((id) => id.endsWith("-q01") || id.endsWith("-q02")));
});

test("migration 271 template exists, is marked not applied, and applies nothing but the declared changes", () => {
  const sql = fs.readFileSync("supabase/migrations/271_english_form_b_completion_TEMPLATE_NOT_APPLIED.sql", "utf8");
  assert.match(sql, /NOT APPLIED/);
  assert.equal((sql.match(/insert into public\.ali_question_bank/g) ?? []).length, 1);
  assert.equal((sql.match(/eng-fb-/g) ?? []).length >= 6, true);
  const code = sql.split(/\r?\n/).filter((l) => !l.trim().startsWith("--")).join(" ");
  assert.doesNotMatch(code, /mock_eligible|active_mock|activate|independently_validated/i);
  assert.match(code, /eligibility_status = 'authentic_assessment_candidate'/);
  for (const id of MARKING_CONTRACT_REPAIRS) assert.ok(sql.includes(id), id);
  for (const i of TOP_UP_ITEMS) assert.ok(sql.includes(i.id), i.id);
});
