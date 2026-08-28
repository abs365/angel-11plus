import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * English Content Foundation, Increment 002 (Decision 237, remediated
 * Decision 238), migrations 161/162. Parses the real migration SQL text
 * -- both passage rows and every question's real $json$ prompt payload
 * -- and independently re-verifies it, mirroring tests/supabase/
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
const questionPrompts = parseJsonBlocks(sql161, 19);
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
// Decision 238 remediation changed the physical row count: Loose
// Connection stays 9 rows (Q2 replaced in place, still 1 row); Sail and
// Steam grows from 7 to 10 rows (Q5 split into 4 independently-scored
// grouped subparts, q05b-e, replacing the single pooled-answer q05
// row). 15 numbered-question experiences remain unchanged throughout
// (8 + 7); physical rows: 9 + 10 = 19.

test("parses exactly 19 physical question rows (9 for Passage A including grouped Q7a/Q7b, 10 for Passage B including grouped Q5b/c/d/e) -- 15 comprehension experiences total", () => {
  assert.equal(questionPrompts.length, 19);
});

test("expected question IDs are exactly the 19 authored, no more, no fewer", () => {
  const expectedIds = [
    "eng-inc002-roboticsfinal-q01", "eng-inc002-roboticsfinal-q02", "eng-inc002-roboticsfinal-q03",
    "eng-inc002-roboticsfinal-q04", "eng-inc002-roboticsfinal-q05", "eng-inc002-roboticsfinal-q06",
    "eng-inc002-roboticsfinal-q07a", "eng-inc002-roboticsfinal-q07b", "eng-inc002-roboticsfinal-q08",
    "eng-inc002-sailandsteam-q01", "eng-inc002-sailandsteam-q02", "eng-inc002-sailandsteam-q03",
    "eng-inc002-sailandsteam-q04", "eng-inc002-sailandsteam-q05b", "eng-inc002-sailandsteam-q05c",
    "eng-inc002-sailandsteam-q05d", "eng-inc002-sailandsteam-q05e", "eng-inc002-sailandsteam-q06",
    "eng-inc002-sailandsteam-q07",
  ];
  assert.deepEqual(questionPrompts.map((p) => p.id).sort(), [...expectedIds].sort());
});

test("every question row is eligibility_status = authentic_assessment_candidate -- never independently_validated, practice_eligible, or mock_eligible", () => {
  assert.doesNotMatch(executable161, /'independently_validated'/);
  assert.doesNotMatch(executable161, /'practice_eligible'/);
  assert.doesNotMatch(executable161, /'mock_eligible'/);
  // 2 passage rows + 19 question rows = 21 occurrences.
  assert.equal((executable161.match(/'authentic_assessment_candidate'/g) || []).length, 21);
});

test("QT-RC-07 is genuinely present, authentically on Passage A (narrative), never forced onto Passage B (informational)", () => {
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

test("portfolio-wide QT-RC coverage: Passage A now spans 8 distinct types (including QT-RC-04 since Decision 238's own Q2 replacement), Passage B spans 6 (Q5's split into 4 rows still counts once, deduplicated)", () => {
  const roboticsTypes = new Set(questionPrompts.filter((p) => p.id.startsWith("eng-inc002-roboticsfinal")).map((p) => sql161.match(new RegExp(`'${p.id}', 'english', '(QT-RC-\\d\\d)'`))?.[1]));
  const shipsTypes = new Set(questionPrompts.filter((p) => p.id.startsWith("eng-inc002-sailandsteam")).map((p) => sql161.match(new RegExp(`'${p.id}', 'english', '(QT-RC-\\d\\d)'`))?.[1]));
  assert.deepEqual(roboticsTypes, new Set(["QT-RC-01", "QT-RC-02", "QT-RC-03", "QT-RC-04", "QT-RC-05", "QT-RC-06", "QT-RC-07", "QT-RC-10"]));
  assert.deepEqual(shipsTypes, new Set(["QT-RC-01", "QT-RC-02", "QT-RC-03", "QT-RC-04", "QT-RC-06", "QT-RC-10"]));
});

test("Loose Connection Q2 is no longer a near-duplicate 'how many minutes' retrieval question -- replaced with a genuinely different QT-RC-04 synonym-list question, only Q1 remains QT-RC-01", () => {
  const q1 = questionPrompts.find((p) => p.id === "eng-inc002-roboticsfinal-q01")!;
  const q2 = questionPrompts.find((p) => p.id === "eng-inc002-roboticsfinal-q02")!;
  assert.match(sql161, /'eng-inc002-roboticsfinal-q01', 'english', 'QT-RC-01'/);
  assert.match(sql161, /'eng-inc002-roboticsfinal-q02', 'english', 'QT-RC-04'/);
  assert.doesNotMatch(q2.question, /how (many|much) minutes/i);
  assert.match(q2.question, /synonym/i);
  assert.equal(q2.marks, 4);
  assert.ok(!q1.question.includes("minutes") || q1.id !== q2.id);
});

// === Grouped question structure (Q7a/Q7b, and Q5b/c/d/e since remediation) ==

test("Q7a/Q7b share question_group_id, correct group_order/subpart_label/marking_mode, mirroring migration 097's own established Q12a/Q12b mechanism exactly", () => {
  assert.match(executable161, /question_group_id = 'eng-inc002-roboticsfinal-q07',\s*\n\s*group_order = 1,\s*\n\s*subpart_label = '\(a\)',\s*\n\s*marking_mode = 'deterministic'\s*\n\s*where id = 'eng-inc002-roboticsfinal-q07a';/);
  assert.match(executable161, /question_group_id = 'eng-inc002-roboticsfinal-q07',\s*\n\s*group_order = 2,\s*\n\s*subpart_label = '\(b\)',\s*\n\s*marking_mode = 'deterministic'\s*\n\s*where id = 'eng-inc002-roboticsfinal-q07b';/);
});

test("Decision 238: Q5b/c/d/e share question_group_id 'eng-inc002-sailandsteam-q05', correct group_order 1-4 and subpart_label (b)-(e), all marking_mode deterministic (TIER2, auto-gradable)", () => {
  const subparts: [string, number, string][] = [["b", 1, "b"], ["c", 2, "c"], ["d", 3, "d"], ["e", 4, "e"]];
  for (const [letter, order] of subparts) {
    const escapedLabel = `\\(${letter}\\)`;
    const re = new RegExp(`question_group_id = 'eng-inc002-sailandsteam-q05',\\s*\\n\\s*group_order = ${order},\\s*\\n\\s*subpart_label = '${escapedLabel}',\\s*\\n\\s*marking_mode = 'deterministic'\\s*\\n\\s*where id = 'eng-inc002-sailandsteam-q05${letter}';`);
    assert.match(executable161, re, `missing or incorrect grouping UPDATE for q05${letter}`);
  }
});

test("exactly 6 rows (Q7a, Q7b, Q5b, Q5c, Q5d, Q5e) have any of the 4 grouped-question columns populated -- no other row", () => {
  const groupingUpdates = [...executable161.matchAll(/where id = '([\w-]+)';/g)].map((m) => m[1]);
  assert.deepEqual(new Set(groupingUpdates), new Set([
    "eng-inc002-roboticsfinal-q07a", "eng-inc002-roboticsfinal-q07b",
    "eng-inc002-sailandsteam-q05b", "eng-inc002-sailandsteam-q05c", "eng-inc002-sailandsteam-q05d", "eng-inc002-sailandsteam-q05e",
  ]));
});

test("Q7a and Q7b test two SEPARATE, correctly-attributed facts (Nisha's action vs Ade's action), the exact construct QT-RC-07's own Measurement Purpose requires", () => {
  const q7a = questionPrompts.find((p) => p.id === "eng-inc002-roboticsfinal-q07a")!;
  const q7b = questionPrompts.find((p) => p.id === "eng-inc002-roboticsfinal-q07b")!;
  assert.match(q7a.question, /Nisha/);
  assert.match(q7b.question, /Ade/);
});

test("Decision 238: each of Q5b/c/d/e scores exactly ONE word, with its OWN non-overlapping acceptedAnswers set -- an answer valid for one word cannot receive the mark for another word", () => {
  const wordFor: Record<string, string> = { "eng-inc002-sailandsteam-q05b": "genuine", "eng-inc002-sailandsteam-q05c": "reasonably", "eng-inc002-sailandsteam-q05d": "constant", "eng-inc002-sailandsteam-q05e": "gradually" };
  const rows = questionPrompts.filter((p) => Object.keys(wordFor).includes(p.id));
  assert.equal(rows.length, 4);
  for (const p of rows) {
    assert.equal(p.marks, 1, `${p.id} should be worth exactly 1 mark (4 subparts x 1 mark = the original 4-mark total)`);
    assert.match(p.question, new RegExp(`'${wordFor[p.id]}'`));
  }
  // Cross-contamination check: no two subparts' own accepted-answer sets share a word.
  const allAccepted = rows.map((p) => new Set((p.acceptedAnswers ?? []).map((a) => a.toLowerCase())));
  for (let i = 0; i < allAccepted.length; i++) {
    for (let j = i + 1; j < allAccepted.length; j++) {
      const overlap = [...allAccepted[i]].filter((a) => allAccepted[j].has(a));
      assert.deepEqual(overlap, [], `subparts ${rows[i].id} and ${rows[j].id} must not share any accepted-answer string`);
    }
  }
  // Total marks across the 4 subparts still equals the original single question's own 4 marks.
  assert.equal(rows.reduce((sum, p) => sum + p.marks, 0), 4);
});

// === Decision 238: tokeniser slash-shorthand defect, fixed estate-wide within this migration ===

test("Decision 238: no acceptedAnswers string anywhere in this migration contains a literal '/' -- the real tokeniser (englishAnswerValidation.ts tokenise()) splits on any non-alphanumeric character, so a 'swapped/changed'-style shorthand becomes an unmatchable two-word literal token sequence, not two alternatives", () => {
  for (const p of questionPrompts) {
    for (const a of p.acceptedAnswers ?? []) {
      assert.ok(!a.includes("/"), `${p.id} still contains a slash-shorthand accepted answer: ${JSON.stringify(a)}`);
    }
  }
});

test("Decision 238: Loose Connection Q7a accepts a pure action-only answer (no diagnosis required) -- the Founder's own explicit alignment requirement", () => {
  const q7a = questionPrompts.find((p) => p.id === "eng-inc002-roboticsfinal-q07a")!;
  assert.ok(q7a.acceptedAnswers!.some((a) => /swap|fit/.test(a) && !/thought|diagnos/.test(a)), "at least one accepted answer must describe the action alone, without requiring the diagnosis");
});

test("Decision 238: Loose Connection Q7b accepts BOTH a discovery-only answer and a method-only answer for the same reason", () => {
  const q7b = questionPrompts.find((p) => p.id === "eng-inc002-roboticsfinal-q07b")!;
  assert.ok(q7b.acceptedAnswers!.some((a) => /found/.test(a)), "expected at least one discovery-only accepted answer");
  assert.ok(q7b.acceptedAnswers!.some((a) => /check|examine/.test(a)), "expected at least one method-only accepted answer");
});

// === Decision 238: Q8 (Loose Connection) and Q7 (Sail and Steam) marking-tier correction ===

test("Decision 238: Loose Connection Q8 and Sail and Steam Q7 (both 'why might the writer' interpretive questions) use TIER5_NAMED_COMPONENT_PLUS_EXPLANATION, not TIER2_ACCEPTED_SET -- an open interpretive question must not depend on matching a small deterministic phrase bank", () => {
  const q8 = questionPrompts.find((p) => p.id === "eng-inc002-roboticsfinal-q08")!;
  const shipsQ7 = questionPrompts.find((p) => p.id === "eng-inc002-sailandsteam-q07")!;
  assert.equal(q8.validationTier, "TIER5_NAMED_COMPONENT_PLUS_EXPLANATION");
  assert.equal(shipsQ7.validationTier, "TIER5_NAMED_COMPONENT_PLUS_EXPLANATION");
});

// === Decision 238: Loose Connection Q3 broadened accepted evidence =========

test("Decision 238: Loose Connection Q3's quotationRequired now has 4 entries (was 2), including the 2 additional legitimate pieces of evidence the Founder identified, and the scoring mechanism credits ANY one of them", () => {
  const q3 = questionPrompts.find((p) => p.id === "eng-inc002-roboticsfinal-q03")!;
  assert.equal(q3.quotationRequired!.length, 4);
  const lower = q3.quotationRequired!.map((q) => q.toLowerCase());
  assert.ok(lower.includes("i thought she was probably right"));
  assert.ok(lower.includes("i told her to go ahead"));
  assert.ok(lower.includes("we don't have time for that"));
  assert.ok(lower.includes("a flash of irritation i wasn't proud of"));
});

// === Decision 238: Sail and Steam Q3 redesigned for genuine synthesis ======

test("Decision 238: Sail and Steam Q3 no longer asks the question whose answer is stated almost verbatim in the passage's own final paragraph -- its required evidence is drawn from paragraphs 1 and 3, never the concluding paragraph", () => {
  const q3 = questionPrompts.find((p) => p.id === "eng-inc002-sailandsteam-q03")!;
  assert.doesNotMatch(q3.question, /ONLY advantage/i);
  const finalParagraph = "What the story of the Great Western shows, above all, is that being faster was not the only advantage steam power offered. Reliability, the simple ability to know roughly when a ship would arrive, turned out to matter just as much as how quickly it could get there.";
  for (const quote of q3.quotationRequired!) {
    assert.ok(!finalParagraph.toLowerCase().includes(quote.toLowerCase()), `Q3's own required quotation must not be drawn from the passage's own concluding paragraph: ${JSON.stringify(quote)}`);
  }
});

test("Decision 238: Sail and Steam Q3's two required quotations are about DIFFERENT forms of travel (one about sailing, one about steam), giving this question family a genuine comparative-reading anchor", () => {
  const q3 = questionPrompts.find((p) => p.id === "eng-inc002-sailandsteam-q03")!;
  const [quoteA, quoteB] = q3.quotationRequired!;
  assert.match(quoteA, /nobody setting out could say/);
  assert.match(quoteB, /fixed timetable/);
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
  assert.equal(checked, 7, "expected exactly 7 quotationRequired strings after Decision 238 (robotics Q3 has 4, Q5 has 1; ships Q3 has 2)");
});

test("orderedAnswer items are paraphrased event/process summaries (matching migration 152's own Bee Q6 convention -- not required to be verbatim substrings, unlike quotationRequired), each grounded in real passage content, in the passage's own real chronological/causal order", () => {
  const q6a = questionPrompts.find((p) => p.id === "eng-inc002-roboticsfinal-q06")!;
  const q6b = questionPrompts.find((p) => p.id === "eng-inc002-sailandsteam-q06")!;
  assert.equal(q6a.orderedAnswer!.length, 4);
  assert.equal(q6b.orderedAnswer!.length, 4);
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
  assert.ok(roboticsText.indexOf("I'm going to swap it for the spare") < roboticsText.indexOf("Found it"));
  assert.ok(shipsText.indexOf("burned coal to heat water into steam") < shipsText.indexOf("pushing the ship forward"));
});

// === Factual Verification Control (Passage B only) -- complete 4-claim register (Decision 238) ===

test("migration 161's own header discloses the COMPLETE factual register (4 claims, not 2) with CLAIM/SOURCE-CONTAINS/ANGEL-SIMPLIFICATION/FACTUAL-CONFIDENCE/CONTESTED-QUALIFICATION-STATUS for each", () => {
  assert.match(sql161, /FACTUAL VERIFICATION CONTROL/);
  assert.match(sql161, /COMPLETE REGISTER, all 4 externally/);
  for (let n = 1; n <= 4; n++) assert.match(sql161, new RegExp(`CLAIM ${n}:`));
  assert.match(sql161, /SOURCE-CONTAINS/);
  assert.match(sql161, /ANGEL-SIMPLIFICATION/);
  assert.match(sql161, /FACTUAL-CONFIDENCE: HIGH/);
  assert.match(sql161, /CONTESTED\/QUALIFICATION STATUS/);
});

test("Decision 238: Claim 4 (coal-supply risk; hot, noisy engine-room conditions) is disclosed as NOT independently source-checked at original authoring, only during the Founder's own inspection and this remediation -- honestly disclosed, not silently backfilled", () => {
  // This lives in the migration's own COMMENT header, so it must be
  // checked against the raw sql161 (unstripped), not executable161
  // (comments removed) -- unwrap the "-- " line-continuation prefix so
  // the assertion is not brittle against exactly where each line wraps.
  const headerUnwrapped = sql161.split("\n").map((l) => l.replace(/^--\s*/, "")).join(" ").replace(/\s+/g, " ");
  assert.match(headerUnwrapped, /this claim was NOT independently source-checked when this migration was first authored/i);
  assert.match(headerUnwrapped, /not silently backfilled as though it had always been checked/i);
});

test("the passage never claims the Great Western was 'the first' steamship to cross the Atlantic in any absolute sense -- the genuinely contested Sirius/Great Western footnote is disclosed and deliberately sidestepped, not asserted", () => {
  assert.ok(!/the first steamship to cross/i.test(shipsText));
  assert.match(shipsText, /one of the first steamships built specially to cross the Atlantic/);
  assert.match(sql161, /GENUINELY CONTESTED AND\s*\n?--\s*DELIBERATELY EXCLUDED/);
});

test("all 4 factual claims match exactly what the passage and its questions actually test", () => {
  assert.match(shipsText, /In 1838/);
  assert.match(shipsText, /about fifteen days/);
  assert.match(shipsText, /about a month/);
  assert.match(shipsText, /six weeks or more/);
  assert.match(shipsText, /a genuine danger early engineers took very seriously/);
  assert.match(shipsText, /hot, noisy conditions below deck/);
});

// === Migration 162 -- pending review registration, corrected from first application ===

test("migration 162 registers both passages using family_id = the passage's own id -- the CORRECTED convention, never passage_family_id (the Decision 230 defect class)", () => {
  assert.match(executable162, /'passage', 'eng-inc002-roboticsfinal', 'UNASSIGNED'/);
  assert.match(executable162, /'passage', 'eng-inc002-sailandsteam', 'UNASSIGNED'/);
  assert.ok(!executable162.includes("eng-inc002-roboticsfinal-narrative"), "must never register against passage_family_id");
  assert.ok(!executable162.includes("eng-inc002-sailandsteam-informational"), "must never register against passage_family_id");
});

test("migration 162 registers exactly 2 rows, both review_type = mock_english_passage_independent_review, both decision = pending_independent_review, reviewer UNASSIGNED throughout -- no self-approval", () => {
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

test("both migrations are wrapped consistently in begin/commit transactions (migration 161 now has 6 balanced insert/on-conflict pairs after the Decision 238 statement split, migration 162 unchanged)", () => {
  assert.equal((executable161.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable161.match(/\bcommit;/g) || []).length, 1);
  const inserts = (executable161.match(/^insert into/gm) || []).length;
  const onConflicts = (executable161.match(/^on conflict \(id\) do nothing;/gm) || []).length;
  assert.equal(inserts, onConflicts, "every insert into must have exactly one matching on conflict clause");
  assert.equal((executable162.match(/\bbegin;/g) || []).length, 1);
  assert.equal((executable162.match(/\bcommit;/g) || []).length, 1);
});
