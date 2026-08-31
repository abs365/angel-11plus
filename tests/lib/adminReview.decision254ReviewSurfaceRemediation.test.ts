import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  promptWritingTask, writingResponseShapeLabel, WRITING_RESPONSE_SHAPE_LABEL, QUESTION_TYPE_NAME,
  REVIEW_CRITERIA, WRITING_REVIEW_CRITERIA, hasNegativeFraming,
} from "../../lib/adminReview";

/**
 * Decision 254 — Formal Educational Review Surface Quality Remediation.
 * Founder inspected the live Increment 003 review surface and found:
 * (1) every QT-WC-01a item labelled "(Reflective/Discursive Response
 * Prompt)" regardless of its own actual response shape, misdescribing
 * "An Invented Place" (a narrative/imaginative prompt); (2) a singleton
 * family (one reviewed item) shown as both "REPRESENTATIVE EXAMPLE" and
 * "EASIEST EXAMPLE", falsely implying a range; (3) internal/authoring
 * metadata (taxonomy codes, common traps, transfer classification) at
 * the same visual prominence as learner-facing content; (6) a
 * comprehension-shaped questionnaire forced on a Continuous Writing
 * review target. These tests prove each correction, generically (not
 * hardcoded to Increment 003), against real repository content.
 */

// === Section 1: response-shape labelling, proven against ALL 7 real QT-WC-01a rows ===

function extractPromptJson(sql: string, id: string): unknown {
  const re = new RegExp(`\\('${id}',[\\s\\S]*?\\$json\\$([\\s\\S]*?)\\$json\\$`);
  const m = sql.match(re);
  assert.ok(m, `expected to find a $json$ block for id ${id}`);
  return JSON.parse(m![1]);
}

const sql098 = fs.readFileSync("supabase/migrations/098_mock_writing_content_foundation.sql", "utf8");
const sql153 = fs.readFileSync("supabase/migrations/153_english_content_foundation_increment001_writing.sql", "utf8");
const sql167 = fs.readFileSync("supabase/migrations/167_english_content_foundation_increment003_writing.sql", "utf8");

const SIX_EXISTING_CERTIFIED_PROMPTS: [string, string][] = [
  ["mock-writing-mindchange-01", sql098],
  ["mock-writing-kindness-01", sql098],
  ["mock-writing-cookopinion-01", sql098],
  ["mock-writing-newplace-01", sql153],
  ["mock-writing-mistakelearned-01", sql153],
  ["mock-writing-screentime-01", sql153],
];

for (const [id, sql] of SIX_EXISTING_CERTIFIED_PROMPTS) {
  test(`REGRESSION (Decision 254 audit): ${id}'s real stored response type resolves to "descriptive" and maps to "Personal Experience / Opinion", never the narrative label`, () => {
    const prompt = extractPromptJson(sql, id);
    const task = promptWritingTask(prompt);
    assert.ok(task);
    assert.equal(task!.responseType, "descriptive");
    assert.equal(writingResponseShapeLabel(task!.responseType), "Personal Experience / Opinion");
  });
}

test('Decision 254: "An Invented Place" (eng-inc003-writing-imaginedplace-01) stores responseType "narrative" and maps to "Narrative / Imaginative", not the generic Reflective/Discursive label', () => {
  const prompt = extractPromptJson(sql167, "eng-inc003-writing-imaginedplace-01");
  const task = promptWritingTask(prompt);
  assert.ok(task);
  assert.equal(task!.responseType, "narrative");
  assert.equal(writingResponseShapeLabel(task!.responseType), "Narrative / Imaginative");
  assert.notEqual(writingResponseShapeLabel(task!.responseType), "Reflective/Discursive Response Prompt");
});

test("writingResponseShapeLabel: descriptive and narrative are the only two real response shapes across all 7 QT-WC-01a rows; every one resolves to a real label, never a raw code alone", () => {
  for (const [id, sql] of [...SIX_EXISTING_CERTIFIED_PROMPTS, ["eng-inc003-writing-imaginedplace-01", sql167] as [string, string]]) {
    const prompt = extractPromptJson(sql, id);
    const task = promptWritingTask(prompt);
    assert.ok(task, `expected ${id} to resolve as a writing task`);
    assert.ok(["descriptive", "narrative"].includes(task!.responseType!), `${id} has an unexpected responseType: ${task!.responseType}`);
    assert.notEqual(writingResponseShapeLabel(task!.responseType), "Not recorded");
  }
});

test("writingResponseShapeLabel: null responseType is honestly reported, never silently reused from another item's label", () => {
  assert.equal(writingResponseShapeLabel(null), "Not recorded");
});

test("writingResponseShapeLabel: an unrecognised response type is visibly flagged, never silently mapped to an existing label", () => {
  const label = writingResponseShapeLabel("some-future-type");
  assert.match(label, /some-future-type/);
  assert.notEqual(label, "Personal Experience / Opinion");
  assert.notEqual(label, "Narrative / Imaginative");
});

test("QUESTION_TYPE_NAME still carries QT-WC-01a's own canonical name -- the taxonomy itself was never changed, only where/how it is displayed", () => {
  assert.equal(QUESTION_TYPE_NAME["QT-WC-01a"], "Reflective/Discursive Response Prompt");
});

// === Section 1 (display wiring): the review page no longer hardcodes one label for every writing item ===

const pageSource = fs.readFileSync("app/admin-beta/review/page.tsx", "utf8");

test("page.tsx: QuestionOrWritingTaskBody's writing branch no longer hardcodes the taxonomy's canonical name as if it described every item", () => {
  const block = pageSource.match(/function QuestionOrWritingTaskBody\([\s\S]*?\n}/)![0];
  assert.doesNotMatch(block, /QT-WC-01a \(Reflective\/Discursive Response Prompt\)/);
});

test("page.tsx: QuestionOrWritingTaskBody's writing branch renders each item's own computed response shape via writingResponseShapeLabel()", () => {
  const block = pageSource.match(/function QuestionOrWritingTaskBody\([\s\S]*?\n}/)![0];
  assert.match(block, /Response shape: \{writingResponseShapeLabel\(w\.responseType\)\}/);
});

// === Section 2: singleton-family range presentation, generic on questions.length ===

test("page.tsx: a singleton family renders one 'Reviewed example' label, never duplicate Representative/Easiest labels for the same item", () => {
  assert.match(pageSource, /questions\.length === 1\s*\n\s*\? \[\["Reviewed example \(only item in this family\)", easiest\]\]/);
});

test("page.tsx: a multi-item family still computes genuine Representative/Easiest/Hardest/Unusual range entries, unchanged from before", () => {
  assert.match(pageSource, /\["Representative example", questions\[Math\.floor\(questions\.length \/ 2\)\]\]/);
  assert.match(pageSource, /\["Easiest example", easiest\]/);
  assert.match(pageSource, /\["Hardest example", hardest\]/);
  assert.match(pageSource, /\["Unusual \/ transfer example", unusual\]/);
});

test("page.tsx: the range-example list renders via the single rangeExamples variable, not a second ad-hoc array literal", () => {
  const occurrences = (pageSource.match(/rangeExamples\.filter\(\(\[, q\]\) => q\)\.map/g) || []).length;
  assert.equal(occurrences, 1, "expected exactly one render site consuming rangeExamples");
});

// === Section 3: internal/authoring metadata moved to a secondary disclosure, generic across subjects ===

test("page.tsx: a TechnicalDetail component exists and renders skill/misconception/transfer classification inside a collapsed <details> disclosure", () => {
  assert.match(pageSource, /function TechnicalDetail\(/);
  const block = pageSource.match(/function TechnicalDetail\([\s\S]*?\n}/)![0];
  assert.match(block, /<details/);
  assert.match(block, /Technical \/ authoring detail/);
  assert.match(block, /Common trap:/);
  assert.match(block, /Transfer demand:/);
});

test("page.tsx: QuestionOrWritingTaskBody renders TechnicalDetail for BOTH the writing and non-writing branches, so comprehension/Mathematics content is covered generically, not only Writing", () => {
  const block = pageSource.match(/function QuestionOrWritingTaskBody\([\s\S]*?\n}/)![0];
  const occurrences = (block.match(/<TechnicalDetail /g) || []).length;
  assert.equal(occurrences, 2, "expected exactly one TechnicalDetail call in each branch");
});

test("page.tsx: 'Common trap'/'Transfer demand' are no longer duplicated inline at the two ReviewForm question-list call sites (now owned solely by TechnicalDetail inside QuestionOrWritingTaskBody)", () => {
  const occurrences = (pageSource.match(/<strong>Common trap:<\/strong>/g) || []).length;
  assert.equal(occurrences, 1, "expected 'Common trap' to be rendered from exactly one place (TechnicalDetail)");
});

// === Section 4: learner-facing checklist is explicitly labelled as such (real content, correctly presented -- not a data leak) ===

test("page.tsx: the Writing checklist is explicitly labelled as stored instructional content, so a reviewer cannot mistake it for internal/reviewer-only guidance (reworded by Decision 256 §5 — see adminReview.decision256WritingScaffoldingAmendment.test.ts for the assessment-mode-suppression clarification this label now also carries)", () => {
  const block = pageSource.match(/function QuestionOrWritingTaskBody\([\s\S]*?\n}/)![0];
  assert.match(block, /Stored instructional checklist/);
});

// === Section 6: the review questionnaire adapts by target type ===

test("WRITING_REVIEW_CRITERIA has the exact same criterion keys as REVIEW_CRITERIA, in the same order -- no ali_family_review column added or dropped, no migration required", () => {
  assert.deepEqual(WRITING_REVIEW_CRITERIA.map((c) => c.key), REVIEW_CRITERIA.map((c) => c.key));
});

test("WRITING_REVIEW_CRITERIA rewords exactly the three comprehension-specific questions (questionTypeAlignment, answerCorrectnessVerified, ambiguityFree) and reuses every other question verbatim", () => {
  const REWORDED_KEYS = new Set(["questionTypeAlignment", "answerCorrectnessVerified", "ambiguityFree"]);
  for (const c of REVIEW_CRITERIA) {
    const writingVersion = WRITING_REVIEW_CRITERIA.find((w) => w.key === c.key)!;
    if (REWORDED_KEYS.has(c.key)) {
      assert.notEqual(writingVersion.question, c.question, `${c.key} was expected to be reworded for Writing`);
    } else {
      assert.equal(writingVersion.question, c.question, `${c.key} was expected to be reused verbatim for Writing`);
    }
  }
});

test("WRITING_REVIEW_CRITERIA no longer asks a Writing reviewer to judge 'the real CSSE question pattern', 'the answer key', or 'the passage' -- comprehension-only concepts that do not exist for a Continuous Writing prompt", () => {
  const text = WRITING_REVIEW_CRITERIA.map((c) => c.question).join(" | ");
  assert.doesNotMatch(text, /\banswer key\b/i);
  assert.doesNotMatch(text, /\bthe passage\b/i);
});

test("REVIEW_CRITERIA (the comprehension-facing set) is completely unchanged in wording for the three Writing-reworded criteria -- Decision 253/007F behaviour for comprehension/Mathematics targets is unaffected", () => {
  const ambiguity = REVIEW_CRITERIA.find((c) => c.key === "ambiguityFree")!;
  assert.equal(ambiguity.question, "Does the answer key accept every reasonable answer supported by the passage?");
  const questionTypeAlignment = REVIEW_CRITERIA.find((c) => c.key === "questionTypeAlignment")!;
  assert.equal(questionTypeAlignment.question, "Does it match the real CSSE question pattern it's based on?");
  const answerCorrectnessVerified = REVIEW_CRITERIA.find((c) => c.key === "answerCorrectnessVerified")!;
  assert.equal(answerCorrectnessVerified.question, "Are the answers and marking expectations correct?");
});

test("every WRITING_REVIEW_CRITERIA entry declares the yes-is-good polarity and no negative framing, matching REVIEW_CRITERIA's own convention", () => {
  for (const c of WRITING_REVIEW_CRITERIA) {
    assert.equal(c.polarity, "yes-is-good", `${c.key} does not declare the yes-is-good convention`);
    assert.equal(hasNegativeFraming(c.question), false, `${c.key}: "${c.question}" reads as negatively framed`);
  }
});

test("REVIEW_CRITERIA's variationBoundariesSound question was generalised to explicitly allow N/A for a single-item family, applying to every subject, not only Writing", () => {
  const c = REVIEW_CRITERIA.find((cc) => cc.key === "variationBoundariesSound")!;
  assert.match(c.question, /single-item family/);
  assert.equal(hasNegativeFraming(c.question), false);
});

test("page.tsx: ReviewForm selects WRITING_REVIEW_CRITERIA when the target is a writing_prompt, and REVIEW_CRITERIA otherwise", () => {
  assert.match(pageSource, /const criteria = target\.reviewTargetType === "writing_prompt" \? WRITING_REVIEW_CRITERIA : REVIEW_CRITERIA;/);
  assert.match(pageSource, /\{criteria\.map\(\(\{ key, question \}\) => \(/);
});

test("page.tsx: the Continuous Writing Teaching Review form (always Writing) also renders WRITING_REVIEW_CRITERIA, not the comprehension-shaped set", () => {
  const formBlock = pageSource.match(/function WritingTeachingReviewForm\([\s\S]*?\n}/)![0];
  assert.match(formBlock, /\{WRITING_REVIEW_CRITERIA\.map\(\(\{ key, question \}\) => \(/);
  assert.doesNotMatch(formBlock, /\{REVIEW_CRITERIA\.map/);
});

// === Existing behaviour for other review types is unaffected (Decision 253 propagation, Increment 001/002) ===

test("REGRESSION: MATHS_TEACHING_REVIEW_CRITERIA render site is untouched by this decision", () => {
  assert.match(pageSource, /\{MATHS_TEACHING_REVIEW_CRITERIA\.map\(\(\{ key, question \}\) => \(/);
});

test("REGRESSION: the 3 QuestionOrWritingTaskBody call sites in ReviewForm are unchanged in count (grouped, sample, collapsed-more) -- this decision only changed what renders inside/around them, not how many question-list sites exist", () => {
  const occurrences = (pageSource.match(/<QuestionOrWritingTaskBody question=/g) || []).length;
  assert.equal(occurrences, 3, `expected exactly 3 call sites, found ${occurrences}`);
});
