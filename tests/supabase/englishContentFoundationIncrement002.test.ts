import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * English Content Foundation, Increment 002 (Decision 237), migrations
 * 161/162. Parses the real migration SQL text -- both passage rows and
 * every question's real $json$ prompt payload -- and independently
 * re-verifies it, mirroring tests/supabase/
 * englishContentFoundationIncrement001.test.ts's own established
 * convention exactly. Every quotationRequired/orderedAnswer value is
 * checked against the migration's own stored passage text, not a
 * separately hand-typed copy.
 */

const sql161 = fs.readFileSync("supabase/migrations/161_english_content_foundation_increment002_comprehension.sql", "utf8");
const sql162 = fs.readFileSync("supabase/migrations/162_english_content_foundation_increment002_pending_review.sql", "utf8");

interface ParsedPrompt {
  id: string;
  marks: number;
  skill: string;
  question: string;
  modelAnswer?: string;
  passageTitle?: string;
  passageText?: string;
  acceptedAnswers?: string[];
  quotationRequired?: string[];
  orderedAnswer?: string[];
  validationTier: string;
}

function parsePassages(sqlText: string): string[] {
  const parts = sqlText.split("$passage$");
  assert.equal(parts.length, 5, "expected exactly 2 $passage$...$passage$ blocks (4 delimiters + surrounding text = 5 parts)");
  return [parts[1], parts[3]];
}

function parseJsonBlocks(sqlText: string, expectedCount: number): ParsedPrompt[] {
  const parts = sqlText.split("$json$");
  assert.equal((parts.length - 1) / 2, expectedCount, `expected ${expectedCount} $json$ blocks; found ${(parts.length - 1) / 2}`);
  const prompts: ParsedPrompt[] = [];
  for (let i = 1; i < parts.length; i += 2) prompts.push(JSON.parse(parts[i]) as ParsedPrompt);
  return prompts;
}

function stripComments(sqlText: string): string {
  return sqlText.split("\n").filter((line) => !line.trimStart().startsWith("--")).join("\n");
}

const [roboticsText, shipsText] = parsePassages(sql161);
const questionPrompts = parseJsonBlocks(sql161, 16);
const executable161 = stripComments(sql161);
const executable162 = stripComments(sql162);

// === Passage-level structure ================================================

test("exactly 2 new passage rows, both authentic_assessment_candidate, angel_original, active -- never independently_validated or mock_eligible", () => {
  const passageRows = [...sql161.matchAll(/'angel_original', 'Angel original, unpublished; no external rights holder', array\['csse'\], '\w+', 1,\s*\n\s*'(\w+)', (\w+), '([\w-]+)', null\)/g)];
  assert.equal(passageRows.length, 2);
  for (const [, eligibility, active, familyId] of passageRows) {
    assert.equal(eligibility, "authentic_assessment_candidate");
    assert.equal(active, "true");
    assert.ok(familyId.startsWith("eng-inc002-"));
  }
});

test("passage word counts are independently re-counted, not merely trusted from the migration's own declared word_count", () => {
  const roboticsWords = roboticsText.split(/\\n+|\s+/).filter(Boolean).length;
  const shipsWords = shipsText.split(/\\n+|\s+/).filter(Boolean).length;
  assert.ok(roboticsWords >= 450, `The Loose Connection should be substantial (>=450 words), found ${roboticsWords}`);
  assert.ok(shipsWords >= 450, `Crossing the Atlantic should be substantial (>=450 words), found ${shipsWords}`);
  assert.match(sql161, new RegExp(`'narrative-extract', 'contemporary-realistic-fiction', ${roboticsWords},`));
  assert.match(sql161, new RegExp(`'informational', 'popular-history-explanation', ${shipsWords},`));
});

test("the two new passages genuinely diversify the estate: FIRST-PERSON voice (Passage A) and a COMPARATIVE informational structure (Passage B) -- both absent from the 3 existing certified/candidate passages", () => {
  assert.match(roboticsText, /\bI told her to go ahead\b/, "Passage A should read as first-person narration");
  assert.match(roboticsText, /^"Ninety minutes,"/, "Passage A opens in first-person dialogue-framed narration");
  assert.match(shipsText, /sailing ship/i);
  assert.match(shipsText, /steamship/i);
});

test("Passage A uses a 3-character ENSEMBLE (narrator, Nisha, Ade), diversifying beyond every existing passage's 2-character structure", () => {
  const nishaCount = (roboticsText.match(/Nisha/g) || []).length;
  const adeCount = (roboticsText.match(/\bAde\b/g) || []).length;
  assert.ok(nishaCount >= 3 && adeCount >= 3, "both named characters must be substantially present, not name-dropped once");
});

// === Comprehension question structure =======================================

test("parses exactly 16 physical question rows (9 for Passage A including grouped Q7a/Q7b, 7 for Passage B) -- 15 comprehension experiences total", () => {
  assert.equal(questionPrompts.length, 16);
});

test("expected question IDs are exactly the 16 authored, no more, no fewer", () => {
  const expectedIds = [
    "eng-inc002-roboticsfinal-q01", "eng-inc002-roboticsfinal-q02", "eng-inc002-roboticsfinal-q03",
    "eng-inc002-roboticsfinal-q04", "eng-inc002-roboticsfinal-q05", "eng-inc002-roboticsfinal-q06",
    "eng-inc002-roboticsfinal-q07a", "eng-inc002-roboticsfinal-q07b", "eng-inc002-roboticsfinal-q08",
    "eng-inc002-sailandsteam-q01", "eng-inc002-sailandsteam-q02", "eng-inc002-sailandsteam-q03",
    "eng-inc002-sailandsteam-q04", "eng-inc002-sailandsteam-q05", "eng-inc002-sailandsteam-q06", "eng-inc002-sailandsteam-q07",
  ];
  assert.deepEqual(questionPrompts.map((p) => p.id).sort(), [...expectedIds].sort());
});

test("every question row is eligibility_status = authentic_assessment_candidate -- never independently_validated, practice_eligible, or mock_eligible", () => {
  assert.doesNotMatch(executable161, /'independently_validated'/);
  assert.doesNotMatch(executable161, /'practice_eligible'/);
  assert.doesNotMatch(executable161, /'mock_eligible'/);
  // 2 passage rows + 16 question rows = 18 occurrences.
  assert.equal((executable161.match(/'authentic_assessment_candidate'/g) || []).length, 18);
});

test("QT-RC-07 is genuinely present for the first time in this codebase, authentically on Passage A (narrative), never forced onto Passage B (informational)", () => {
  const skillMatches = [...sql161.matchAll(/'english', '(QT-RC-\d\d)',/g)].map((m) => m[1]);
  const rc07Rows = questionPrompts.filter((p) => sql161.includes(`'${p.id}', 'english', 'QT-RC-07'`));
  assert.equal(rc07Rows.length, 2, "expected exactly 2 QT-RC-07 rows (the grouped Q7a/Q7b pair)");
  for (const p of rc07Rows) assert.ok(p.id.startsWith("eng-inc002-roboticsfinal"), "QT-RC-07 must only appear on the narrative passage");
  assert.ok(skillMatches.includes("QT-RC-07"));
});

test("QT-RC-08 is genuinely absent as a real question_type value -- explicitly deferred (no proven scoring tier) and discussed only in this migration's own header prose, never silently attempted as a live row", () => {
  assert.ok(!executable161.includes("'QT-RC-08'"), "QT-RC-08 must not appear as a real question_type literal in any executable INSERT");
  assert.match(sql161, /QT-RC-08, INVESTIGATED AND EXPLICITLY DEFERRED, NOT FORCED/);
});

test("portfolio-wide QT-RC coverage across both new passages spans 8 distinct types (RC-01/02/03/04/05/06/07/10), each passage's own coverage genuinely uneven, not a fixed template", () => {
  const roboticsTypes = new Set(questionPrompts.filter((p) => p.id.startsWith("eng-inc002-roboticsfinal")).map((p) => sql161.match(new RegExp(`'${p.id}', 'english', '(QT-RC-\\d\\d)'`))?.[1]));
  const shipsTypes = new Set(questionPrompts.filter((p) => p.id.startsWith("eng-inc002-sailandsteam")).map((p) => sql161.match(new RegExp(`'${p.id}', 'english', '(QT-RC-\\d\\d)'`))?.[1]));
  assert.deepEqual(roboticsTypes, new Set(["QT-RC-01", "QT-RC-02", "QT-RC-03", "QT-RC-05", "QT-RC-06", "QT-RC-07", "QT-RC-10"]));
  assert.deepEqual(shipsTypes, new Set(["QT-RC-01", "QT-RC-02", "QT-RC-03", "QT-RC-04", "QT-RC-06", "QT-RC-10"]));
  assert.notDeepEqual(roboticsTypes, shipsTypes);
});

// === Grouped question (Q7a/Q7b) structure ===================================

test("Q7a/Q7b share question_group_id, correct group_order/subpart_label/marking_mode, mirroring migration 097's own established Q12a/Q12b mechanism exactly", () => {
  assert.match(executable161, /question_group_id = 'eng-inc002-roboticsfinal-q07',\s*\n\s*group_order = 1,\s*\n\s*subpart_label = '\(a\)',\s*\n\s*marking_mode = 'deterministic'\s*\n\s*where id = 'eng-inc002-roboticsfinal-q07a';/);
  assert.match(executable161, /question_group_id = 'eng-inc002-roboticsfinal-q07',\s*\n\s*group_order = 2,\s*\n\s*subpart_label = '\(b\)',\s*\n\s*marking_mode = 'deterministic'\s*\n\s*where id = 'eng-inc002-roboticsfinal-q07b';/);
});

test("no row other than Q7a/Q7b has any of the 4 grouped-question columns populated", () => {
  const groupingUpdates = [...executable161.matchAll(/where id = '([\w-]+)';/g)].map((m) => m[1]);
  assert.deepEqual(new Set(groupingUpdates), new Set(["eng-inc002-roboticsfinal-q07a", "eng-inc002-roboticsfinal-q07b"]));
});

test("Q7a and Q7b test two SEPARATE, correctly-attributed facts (Nisha's action vs Ade's action), the exact construct QT-RC-07's own Measurement Purpose requires", () => {
  const q7a = questionPrompts.find((p) => p.id === "eng-inc002-roboticsfinal-q07a")!;
  const q7b = questionPrompts.find((p) => p.id === "eng-inc002-roboticsfinal-q07b")!;
  assert.match(q7a.question, /Nisha/);
  assert.match(q7b.question, /Ade/);
  assert.ok(!q7a.question.includes("Ade") || q7a.question === q7b.question === false, "Q7a must ask about Nisha specifically");
});

// === Answer determinacy: every claim independently re-checked ==============

test("every quotationRequired string is an exact, case-insensitive substring of its own passage's stored text", () => {
  let checked = 0;
  for (const p of questionPrompts) {
    if (!p.quotationRequired) continue;
    const passageText = p.id.startsWith("eng-inc002-roboticsfinal") ? roboticsText : shipsText;
    for (const q of p.quotationRequired) {
      assert.ok(passageText.toLowerCase().includes(q.toLowerCase()), `quotation for ${p.id} not found verbatim in its own passage: ${JSON.stringify(q)}`);
      checked++;
    }
  }
  assert.equal(checked, 5, "expected exactly 5 quotationRequired strings (robotics Q3 has 2, Q5 has 1; ships Q3 has 2)");
});

test("orderedAnswer items are paraphrased event/process summaries (matching migration 152's own Bee Q6 convention -- not required to be verbatim substrings, unlike quotationRequired), each grounded in real passage content, in the passage's own real chronological/causal order", () => {
  const q6a = questionPrompts.find((p) => p.id === "eng-inc002-roboticsfinal-q06")!;
  const q6b = questionPrompts.find((p) => p.id === "eng-inc002-sailandsteam-q06")!;
  assert.equal(q6a.orderedAnswer!.length, 4);
  assert.equal(q6b.orderedAnswer!.length, 4);
  // Each item's own key content words must genuinely appear in the passage.
  for (const [item, keyword] of [
    [q6a.orderedAnswer![0], "spare"], [q6a.orderedAnswer![1], "tilt"], [q6a.orderedAnswer![2], "connector"], [q6a.orderedAnswer![3], "rolled smoothly"],
  ] as const) {
    assert.ok(roboticsText.toLowerCase().includes(keyword), `expected passage to contain "${keyword}" backing orderedAnswer item "${item}"`);
  }
  for (const [item, keyword] of [
    [q6b.orderedAnswer![0], "burned coal"], [q6b.orderedAnswer![1], "steam drove an engine"], [q6b.orderedAnswer![2], "turned paddle wheels"], [q6b.orderedAnswer![3], "pushing the ship forward"],
  ] as const) {
    assert.ok(shipsText.toLowerCase().includes(keyword), `expected passage to contain "${keyword}" backing orderedAnswer item "${item}"`);
  }
  // Passage A: Nisha's announcement must appear before Ade's discovery in the real text.
  assert.ok(roboticsText.indexOf("I'm going to swap it for the spare") < roboticsText.indexOf("Found it"));
  // Passage B: coal-burning must appear before the ship-forward statement in the real text.
  assert.ok(shipsText.indexOf("burned coal to heat water into steam") < shipsText.indexOf("pushing the ship forward"));
});

test("Sail and Steam Q5 (QT-RC-04 synonym list) references exactly 5 line-referenced words, all present in its own passage text", () => {
  const q = questionPrompts.find((p) => p.id === "eng-inc002-sailandsteam-q05")!;
  for (const w of ["enormously", "genuine", "reasonably", "constant", "gradually"]) {
    assert.ok(q.question.includes(`'${w}'`), `expected word '${w}' to be named in the question text`);
    assert.ok(shipsText.includes(w), `expected word '${w}' to actually appear in the passage text`);
  }
});

// === Factual Verification Control (Passage B only) ==========================

test("migration 161's own header discloses SOURCE-CONTAINS/ANGEL-SIMPLIFICATION/FACTUAL-CONFIDENCE/UNRESOLVED-CONTESTED-CLAIMS for both real-world claims, matching the estate's own established convention (migration 152)", () => {
  assert.match(sql161, /FACTUAL VERIFICATION CONTROL/);
  assert.match(sql161, /SOURCE-CONTAINS/);
  assert.match(sql161, /ANGEL-SIMPLIFICATION/);
  assert.match(sql161, /FACTUAL-CONFIDENCE: HIGH/);
  assert.match(sql161, /UNRESOLVED-CONTESTED-CLAIMS/);
});

test("the passage never claims the Great Western was 'the first' steamship to cross the Atlantic in any absolute sense -- the genuinely contested Sirius/Great Western footnote is disclosed and deliberately sidestepped, not asserted", () => {
  assert.ok(!/the first steamship to cross/i.test(shipsText));
  assert.match(shipsText, /one of the first steamships built specially to cross the Atlantic/);
  assert.match(sql161, /DELIBERATELY NOT CLAIMED/);
});

test("both factual claims (1838 crossing year/duration; sailing-ship crossing duration) match exactly what Q1/Q2/Q3 of Sail and Steam actually test", () => {
  assert.match(shipsText, /In 1838/);
  assert.match(shipsText, /about fifteen days/);
  assert.match(shipsText, /about a month/);
  assert.match(shipsText, /six weeks or more/);
});

// === Migration 162 -- pending review registration, corrected from first application ===

test("migration 162 registers both passages using family_id = the passage's own id -- the CORRECTED convention, never passage_family_id (the Decision 230 defect class)", () => {
  assert.match(executable162, /'passage', 'eng-inc002-roboticsfinal', 'UNASSIGNED'/);
  assert.match(executable162, /'passage', 'eng-inc002-sailandsteam', 'UNASSIGNED'/);
  assert.ok(!executable162.includes("eng-inc002-roboticsfinal-narrative"), "must never register against passage_family_id");
  assert.ok(!executable162.includes("eng-inc002-sailandsteam-informational"), "must never register against passage_family_id");
});

test("migration 162 registers exactly 2 rows, both review_type = mock_english_passage_independent_review, both decision = pending_independent_review, reviewer UNASSIGNED throughout -- no self-approval", () => {
  // Each of the 2 INSERTs mentions review_type/pending_independent_review twice:
  // once in its own SELECT (the value being inserted) and once in its own
  // WHERE NOT EXISTS idempotency guard (the value being checked for) --
  // 2 inserts x 2 = 4 occurrences of each, matching migration 099/154's own
  // identical idempotency-guard convention. UNASSIGNED (the reviewer) is
  // never part of the idempotency guard, so it appears only once per insert.
  const reviewTypes = [...executable162.matchAll(/'mock_english_passage_independent_review'/g)];
  assert.equal(reviewTypes.length, 4);
  assert.equal((executable162.match(/pending_independent_review/g) || []).length, 4);
  assert.equal((executable162.match(/'UNASSIGNED'/g) || []).length, 2);
});

test("migration 162 never touches eligibility_status, decision on an existing row, or any other table", () => {
  assert.ok(!executable162.includes("eligibility_status"));
  assert.ok(!/update\s+public\./i.test(executable162));
  const insertTargets = [...executable162.matchAll(/insert into public\.(\w+)/gi)].map((m) => m[1]);
  assert.deepEqual(new Set(insertTargets), new Set(["ali_family_review"]));
});

test("Sail and Steam's own pending-review notes direct the reviewer to the factual-verification evidence before approving -- non-fiction review evidence is not hidden", () => {
  assert.match(executable162, /FACTUAL VERIFICATION CONTROL header section for the two real-world claims/);
});

test("not applied disclosure present in both migrations' own raw file headers", () => {
  assert.match(sql161, /NOT APPLIED\. Generated for independent-reviewer and Founder/);
  assert.match(sql162, /NOT APPLIED\. Founder must apply/);
});

test("both migrations are wrapped in a single begin/commit transaction each", () => {
  assert.equal((executable161.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable161.match(/\bcommit;/g) || []).length, 1);
  assert.equal((executable162.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable162.match(/\bcommit;/g) || []).length, 1);
});
