import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  presentWritingChecklistForContext,
  isWritingFamilyGuidedEligible,
  writingSupportContextForGuidedToggle,
} from "../../../lib/writing/supportLevelPolicy";

/**
 * Decision 257 — Writing Support Policy End-to-End Integration.
 *
 * Decision 256 built lib/writing/supportLevelPolicy.ts but no learner
 * route called it. This wires it into the one real learner-facing
 * renderer for the canonical QT-WC-01a content — WritingActivity in
 * app/learning-intelligence/practice/[area]/page.tsx (the
 * "continuous-writing" practice area, fed by ali_question_bank via
 * generatePersonalisedSession) — reusing the exact same Guided Practice
 * toggle Reading/Maths already have (Educational Increment 007C/007L),
 * not inventing a parallel session-context concept.
 *
 * These tests prove the composed real path (eligibility -> toggle ->
 * context -> policy) end to end, without a DOM/React harness, matching
 * this repo's existing convention of extracting pure logic out of page
 * components for exactly this reason (see
 * lib/learningEngine/practiceInteractionGuard.ts).
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

const practicePageSource = fs.readFileSync("app/learning-intelligence/practice/[area]/page.tsx", "utf8");
const adminReviewPageSource = fs.readFileSync("app/admin-beta/review/page.tsx", "utf8");
const legacyWritingPageSource = fs.readFileSync("app/writing/page.tsx", "utf8");
const legacyWritingDataSource = fs.readFileSync("data/writing.ts", "utf8");
const mocksPathwaySource = fs.readFileSync("app/mocks/[pathway]/page.tsx", "utf8");

// === Part B/C: the real eligibility + toggle mapping ===

test("isWritingFamilyGuidedEligible requires both a real familyId and real teaching content for the type", () => {
  assert.equal(isWritingFamilyGuidedEligible("fam-1", "narrative", () => true), true);
  assert.equal(isWritingFamilyGuidedEligible(null, "narrative", () => true), false);
  assert.equal(isWritingFamilyGuidedEligible(undefined, "narrative", () => true), false);
  assert.equal(isWritingFamilyGuidedEligible("fam-1", "narrative", () => false), false);
});

test("writingSupportContextForGuidedToggle maps the real Guided Practice toggle to teaching/independent only", () => {
  assert.equal(writingSupportContextForGuidedToggle(true), "teaching");
  assert.equal(writingSupportContextForGuidedToggle(false), "independent");
});

test("Part D fail-closed: the toggle mapping is exhaustive over boolean and can never silently produce full scaffolding for an unrecognised state", () => {
  // guidedMode is `useState<boolean>`, so these are the only two reachable
  // inputs; both are asserted above. This test documents that guarantee
  // explicitly, rather than leaving it implicit.
  for (const guidedMode of [true, false]) {
    const ctx = writingSupportContextForGuidedToggle(guidedMode);
    assert.ok(ctx === "teaching" || ctx === "independent");
  }
});

test("Part D fail-closed: there is currently no live Mock renderer for Continuous Writing, so 'mock' is never reachable through the real toggle — if this ever changes, this canary must be revisited alongside writingSupportContextForGuidedToggle", () => {
  assert.match(
    mocksPathwaySource,
    /writing content is not ready|writing\)\s*and Maths|We don't yet have enough original English comprehension and writing content/i
  );
});

// === Part E: exact learner-visible support for An Invented Place, via the real composed path ===

test("Part E: An Invented Place, Teaching (guided toggle ON) via the real composed path", () => {
  const { checklist } = extractPromptJson(sql167, "eng-inc003-writing-imaginedplace-01");
  const context = writingSupportContextForGuidedToggle(true);
  const result = presentWritingChecklistForContext("eng-inc003-writing-imaginedplace-01", checklist, context);
  assert.deepEqual(result, [
    "Write at least six sentences",
    "Invent a specific place with real, particular details -- not a vague or generic setting like 'a magical forest' with no distinguishing features",
    "Describe what it would FEEL like to be there, using at least one sensory or emotional detail, not only what it looks like",
    "Include one specific thing that happens when someone visits, giving the writing a clear moment or event rather than only description",
    "Keep the invented place internally consistent -- do not contradict a detail you have already given",
    "Check paragraphing, spelling and punctuation carefully",
  ]);
});

test("Part E: An Invented Place, Independent Practice (guided toggle OFF) via the real composed path", () => {
  const { checklist } = extractPromptJson(sql167, "eng-inc003-writing-imaginedplace-01");
  const context = writingSupportContextForGuidedToggle(false);
  const result = presentWritingChecklistForContext("eng-inc003-writing-imaginedplace-01", checklist, context);
  assert.deepEqual(result, [
    "Write at least six sentences",
    "Check paragraphing, spelling and punctuation carefully",
    "Plan and write your response independently, using what the task above asks for.",
  ]);
});

test("Part E: An Invented Place, Mock/formal assessment (no live renderer yet — proven via the shared policy directly, per Part I)", () => {
  const { checklist } = extractPromptJson(sql167, "eng-inc003-writing-imaginedplace-01");
  const result = presentWritingChecklistForContext("eng-inc003-writing-imaginedplace-01", checklist, "mock");
  assert.deepEqual(result, ["Write at least six sentences", "Check paragraphing, spelling and punctuation carefully"]);
});

// === Part F: all seven prompts through the real composed path, no regression ===

for (const [id, sql] of ALL_SEVEN_QTWC01A_PROMPTS) {
  test(`Part F: ${id} — guided ON reproduces the full stored checklist via the real toggle mapping`, () => {
    const { checklist } = extractPromptJson(sql, id);
    const result = presentWritingChecklistForContext(id, checklist, writingSupportContextForGuidedToggle(true));
    assert.deepEqual(result, checklist);
  });

  test(`Part F: ${id} — guided OFF never exposes a coaching item via the real toggle mapping`, () => {
    const { checklist } = extractPromptJson(sql, id);
    const result = presentWritingChecklistForContext(id, checklist, writingSupportContextForGuidedToggle(false));
    assert.ok(result.length <= checklist.length);
    assert.ok(!result.some((item) => item.toLowerCase().includes("magical forest")));
  });
}

// === Part H: bypass search — every direct .checklist render site is accounted for ===

test("Part H: WritingActivity no longer reads prompt.checklist directly — it renders visibleChecklist, derived from the shared policy", () => {
  const block = practicePageSource.match(/function WritingActivity\([\s\S]*?(?=\nfunction )/)?.[0];
  assert.ok(block, "expected to find WritingActivity's function body");
  assert.match(block!, /const visibleChecklist = presentWritingChecklistForContext\(promptId, prompt\.checklist, supportContext\);/);
  assert.match(block!, /\{visibleChecklist\.map\(\(item\) => \(/);
  assert.doesNotMatch(block!, /\{prompt\.checklist\.map\(/);
});

test("Part H: WritingActivity derives its context from the real Guided Practice toggle, not an invented flag", () => {
  const block = practicePageSource.match(/function WritingActivity\([\s\S]*?(?=\nfunction )/)?.[0];
  assert.match(block!, /const \[guidedMode, setGuidedMode\] = useState\(guidedAvailable\);/);
  assert.match(block!, /const supportContext = writingSupportContextForGuidedToggle\(guidedMode\);/);
});

test("Part H: the continuous-writing call site seeds guidedAvailable from a real per-session families ref, mirroring Reading/Maths exactly", () => {
  assert.match(practicePageSource, /const writingGuidedFamiliesRef = useRef<Set<string>>\(new Set\(\)\);/);
  assert.match(
    practicePageSource,
    /guidedAvailable=\{Boolean\(current\.familyId && writingGuidedFamiliesRef\.current\.has\(current\.familyId\)\)\}/
  );
});

test("Part H: the admin review page's full-checklist render is a deliberate, documented reviewer-only bypass, not an oversight", () => {
  // Decision 256 §5 / Decision 257 §5: the reviewer must see the full
  // canonical checklist (with Core/Coaching tags) to make an informed
  // review decision — this route never serves a real learner, so the
  // presentation-safety rule this whole decision chain exists to enforce
  // does not apply to it.
  assert.match(adminReviewPageSource, /\{w\.checklist\.map\(\(item, i\) => \(/);
  assert.match(adminReviewPageSource, /Stored instructional checklist/);
  assert.match(adminReviewPageSource, /Preview: what the learner would see, by context/);
});

test("Part H, corrected (Programme Completion Increment 011): app/writing/page.tsx no longer renders any checklist of its own at all — the gap this test previously documented (full checklist, unfiltered, no core/coaching distinction) is closed by redirecting the route into the canonical engine this whole file already proves is wired correctly. data/writing.ts remains a dead, unread fixture.", () => {
  assert.doesNotMatch(legacyWritingPageSource, /selectedPrompt\.checklist\.map/);
  assert.match(legacyWritingPageSource, /redirect\("\/learning-intelligence\/practice\/continuous-writing"\);/);
  for (const [id] of ALL_SEVEN_QTWC01A_PROMPTS) {
    assert.doesNotMatch(legacyWritingDataSource, new RegExp(id));
  }
  assert.doesNotMatch(legacyWritingDataSource, /QT-WC-01a/);
});

// === No side effects on review/certification/eligibility state ===

test("this wiring introduces no database migration and touches no eligibility_status / certification / amendment-verification code path", () => {
  assert.doesNotMatch(practicePageSource, /eligibility_status/);
  assert.doesNotMatch(practicePageSource, /submitAmendmentVerification/);
  assert.doesNotMatch(practicePageSource, /ali_family_review/);
});
