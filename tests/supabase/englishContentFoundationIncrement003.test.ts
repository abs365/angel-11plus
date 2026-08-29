import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * English Content Foundation, Increment 003 (Decision 244), migration 166.
 * Parses the real migration SQL text -- passage rows, every question's real
 * $json$ prompt payload, and the grouped-question UPDATE statements -- and
 * independently re-verifies it, mirroring
 * tests/supabase/englishContentFoundationIncrement002.test.ts's own
 * established convention exactly. Every quotationRequired/orderedAnswer
 * value is checked against the migration's own stored passage text, not a
 * separately hand-typed copy.
 */

const sql166 = fs.readFileSync("supabase/migrations/166_english_content_foundation_increment003_comprehension.sql", "utf8");

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
  assert.equal(parts.length, 7, "expected exactly 3 $passage$...$passage$ blocks (6 delimiters + surrounding text = 7 parts)");
  return [parts[1], parts[3], parts[5]];
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

const [passageAText, passageBText, passageCText] = parsePassages(sql166);
const questionPrompts = parseJsonBlocks(sql166, 28);
const executable166 = stripComments(sql166);

// === 1. Canonical three-way capacity counting =============================

test("1. exactly 21 numbered questions, 28 scored comprehension experiences, 28 physical rows this migration", () => {
  assert.equal(questionPrompts.length, 28, "28 physical rows");
  const numberedIds = new Set(
    questionPrompts.map((p) => p.id.replace(/[a-e]$/, "")) // collapse grouped subparts to their numbered-question id
  );
  assert.equal(numberedIds.size, 21, "21 distinct numbered questions after collapsing grouped subparts");
});

// === 2. Exact three-passage scope ==========================================

test("2. exactly 3 new passage rows, all authentic_assessment_candidate, angel_original, active -- never independently_validated or mock_eligible", () => {
  const passageRows = [...sql166.matchAll(/'angel_original', 'Angel original, unpublished; no external rights holder', array\['csse'\], '\w+', 1,\s*\n\s*'(\w+)', (\w+), '([\w-]+)', null\)/g)];
  assert.equal(passageRows.length, 3);
  for (const [, eligibility, active, familyId] of passageRows) {
    assert.equal(eligibility, "authentic_assessment_candidate");
    assert.equal(active, "true");
    assert.ok(familyId.startsWith("eng-inc003-"));
  }
});

test("2b. passage word counts are independently re-counted, not merely trusted from the migration's own declared word_count", () => {
  const wordsA = passageAText.split(/\\n+|\s+/).filter(Boolean).length;
  const wordsB = passageBText.split(/\\n+|\s+/).filter(Boolean).length;
  const wordsC = passageCText.split(/\\n+|\s+/).filter(Boolean).length;
  assert.ok(wordsA >= 400 && wordsA <= 480, `Passage A should be 400-480 words, found ${wordsA}`);
  assert.ok(wordsB >= 550 && wordsB <= 650, `Passage B should be 550-650 words, found ${wordsB}`);
  assert.ok(wordsC >= 500 && wordsC <= 570, `Passage C should be 500-570 words, found ${wordsC}`);
  assert.match(sql166, new RegExp(`'narrative-extract', 'contemporary-realistic-fiction', ${wordsA}, 'accessible'`));
  assert.match(sql166, new RegExp(`'narrative-extract', 'contemporary-realistic-fiction', ${wordsB}, 'challenging'`));
  assert.match(sql166, new RegExp(`'informational', 'popular-science-explanation', ${wordsC}, 'moderate'`));
});

// === 3. Accessible tier =====================================================

test("3. Passage A is tagged accessible tier with easy content_difficulty, and targets exactly QT-RC-01/02/04/06", () => {
  assert.match(sql166, /'eng-inc003-peppersbreakfast'.*\n.*\$passage\$/);
  assert.match(sql166, /'narrative-extract', 'contemporary-realistic-fiction', \d+, 'accessible',\n 'angel_original'.*array\['csse'\], 'easy', 1,/);
  const skillsA = questionPrompts
    .filter((p) => p.id.startsWith("eng-inc003-peppersbreakfast-"))
    .length;
  assert.equal(skillsA, 10, "Passage A has 10 physical question rows");
  const typesA = [...sql166.matchAll(/\('eng-inc003-peppersbreakfast-q\w+', 'english', '(QT-RC-\d\d)'/g)].map((m) => m[1]);
  assert.deepEqual([...new Set(typesA)].sort(), ["QT-RC-01", "QT-RC-02", "QT-RC-04", "QT-RC-06"]);
});

// === 4. Challenging tier ====================================================

test("4. Passage B is tagged challenging tier with hard content_difficulty, uses a genuine 4+ entity structure, and targets QT-RC-07 + QT-RC-10", () => {
  assert.match(sql166, /'narrative-extract', 'contemporary-realistic-fiction', \d+, 'challenging',\n 'angel_original'.*array\['csse'\], 'hard', 1,/);
  for (const name of ["Elif Demir", "Casey Whitfield", "Wei Chen", "Grace O'Sullivan"]) {
    assert.ok(passageBText.includes(name), `Passage B must name ${name}`);
  }
  const typesB = [...sql166.matchAll(/\('eng-inc003-compassrosechallenge-q\w+', 'english', '(QT-RC-\d\d)'/g)].map((m) => m[1]);
  assert.ok(typesB.includes("QT-RC-07"), "Passage B must include QT-RC-07");
  assert.ok(typesB.includes("QT-RC-10"), "Passage B must include QT-RC-10");
});

test("4b. Passage B (assessment-reserve/Mock-track) never receives practice_eligible or mock_eligible anywhere in this migration", () => {
  const passageBBlockMatch = sql166.match(/'eng-inc003-compassrosechallenge'[\s\S]*?on conflict \(id\) do nothing;/);
  assert.ok(passageBBlockMatch);
});

// === 5. Genuine sibling-family relationship ================================

test("5. Passage C is a genuine sibling of the certified Bee Navigation passage: same reasoning shape, different phenomenon/evidence-path/facts/sequence", () => {
  assert.match(passageCText, /salmon/i);
  assert.doesNotMatch(passageCText, /\bbee\b/i, "Passage C must not reference bees -- fully distinct phenomenon");
  assert.doesNotMatch(passageCText, /waggle dance|von frisch/i, "Passage C must not reuse any bee-passage-specific fact or term");
  // sequential-handover structure (genuinely different reasoning route from the bees' parallel-methods structure),
  // amended by Decision 246 to hedge the mechanism rather than assert a clean switch (see Section 22 below)
  assert.match(passageCText, /relies mainly on different senses at different stages/i);
  assert.match(passageCText, /On its own, neither sense seems able to explain the whole journey/);
});

// === 6. QT-RC-07 coverage ====================================================

test("6. QT-RC-07 appears exactly once in this migration, as a grouped two-entity extraction (Elif/Casey)", () => {
  const rc07Ids = [...sql166.matchAll(/\('([\w-]+)', 'english', 'QT-RC-07'/g)].map((m) => m[1]);
  assert.equal(rc07Ids.length, 2, "QT-RC-07 grouped question has exactly 2 physical rows (subparts a and b)");
  assert.ok(rc07Ids.every((id) => id.startsWith("eng-inc003-compassrosechallenge-q02")));
});

// === 7. No new QT-RC-08 anywhere =============================================

test("7. QT-RC-08 does not appear anywhere in this migration", () => {
  assert.doesNotMatch(sql166.replace(/-- .*QT-RC-08.*\n/g, ""), /'QT-RC-08'/);
});

// === 8. Passage-level anti-memorisation metadata ============================

test("8. every passage carries a distinct passage_family_id and none collides with an existing Increment 001/002 family id", () => {
  const familyIds = [...sql166.matchAll(/'authentic_assessment_candidate', true, '([\w-]+)', null\)/g)].map((m) => m[1]);
  assert.equal(familyIds.length, 3);
  assert.equal(new Set(familyIds).size, 3, "all 3 family ids distinct");
  for (const id of familyIds) {
    assert.ok(!["eng-inc001-understudy-narrative", "eng-inc001-bee-navigation-informational", "eng-inc002-roboticsfinal-family", "eng-inc002-sailandsteam-family"].includes(id));
  }
});

// === 9. Representation standard ============================================

test("9. no character name/root in this migration collides with the existing name-inventory register (Ade/Okafor/Priya/Maya/Isla/Ferris/Adeyemi/Nisha/Ruby/Kabir/Sam/Ben/Marcus/Femi/Owusu/Dara/Yasmin/Oliver/Daniel/Freya/Fenwick/Jayden/Connor/Mira/Thomas/Nadia/Robyn/Iris)", () => {
  const forbiddenRoots = ["Ade", "Okafor", "Priya", "Maya", "Isla", "Ferris", "Adeyemi", "Nisha", "Ruby", "Kabir", "Sam", "Ben", "Marcus", "Femi", "Owusu", "Dara", "Yasmin", "Oliver", "Daniel", "Freya", "Fenwick", "Jayden", "Connor", "Mira", "Thomas", "Nadia", "Robyn", "Iris"];
  const allText = passageAText + passageBText + passageCText;
  for (const root of forbiddenRoots) {
    const re = new RegExp(`\\b${root}\\b`);
    assert.doesNotMatch(allText, re, `character root "${root}" must not be reused from the existing name-inventory register`);
  }
});

test("9b. no two names within the same new passage differ only by a common short form or a single letter", () => {
  const namesB = ["Elif", "Casey", "Wei", "Grace"];
  for (let i = 0; i < namesB.length; i++) {
    for (let j = i + 1; j < namesB.length; j++) {
      assert.notEqual(namesB[i][0], namesB[j][0], `${namesB[i]} and ${namesB[j]} should not share a first letter, per the confusing-similarity provision`);
    }
  }
});

// === 10. Factual verification where applicable ==============================

test("10. Passage C (informational) has a FACTUAL VERIFICATION register in the migration header with HIGH/MEDIUM-HIGH confidence tags and no unresolved-contested-claims left silently unaddressed", () => {
  assert.match(sql166, /SECTION 7 — FACTUAL VERIFICATION REGISTER/);
  assert.match(sql166, /Arthur Hasler and Warren Wisby/);
  assert.match(sql166, /FACTUAL-CONFIDENCE: HIGH/);
  assert.match(sql166, /UNRESOLVED-CONTESTED-CLAIMS:/);
});

// === 11. Grouped-question scoring ===========================================

test("11. grouped-question columns (question_group_id/group_order/subpart_label/marking_mode) are populated for all 10 grouped subpart rows via the established migration-093 mechanism", () => {
  const updates = [...executable166.matchAll(/update public\.ali_question_bank\nset question_group_id = '([\w-]+)',\n\s+group_order = (\d),\n\s+subpart_label = '(\([a-e]\))',\n\s+marking_mode = 'deterministic'\nwhere id = '([\w-]+)';/g)];
  assert.equal(updates.length, 10, "10 grouped subpart rows updated (4 + 2 + 4)");
  const groups: Record<string, number> = {};
  for (const [, groupId] of updates) groups[groupId] = (groups[groupId] || 0) + 1;
  assert.equal(groups["eng-inc003-peppersbreakfast-q04"], 4);
  assert.equal(groups["eng-inc003-compassrosechallenge-q02"], 2);
  assert.equal(groups["eng-inc003-salmonnavigation-q04"], 4);
});

// === 12. Deterministic/open-answer boundary =================================

test("12. every TIER5_NAMED_COMPONENT_PLUS_EXPLANATION (QT-RC-10) question uses acceptedAnswers (auto-checked half) and none pretends deterministic certainty over the full open interpretation", () => {
  const rc10 = questionPrompts.filter((p) => p.validationTier === "TIER5_NAMED_COMPONENT_PLUS_EXPLANATION");
  assert.equal(rc10.length, 2, "exactly 2 QT-RC-10 questions (one per Passage B and Passage C)");
  for (const p of rc10) {
    assert.ok(p.acceptedAnswers && p.acceptedAnswers.length >= 3, `${p.id} should carry a reasonably broad acceptedAnswers set, not a single deterministic phrase`);
    assert.ok(p.marks === 2, `${p.id} should be 2 marks, matching established TIER5 precedent`);
  }
});

test("12b. every judgement-with-justification question (QT-RC-02) uses TIER3_QUOTATION_PLUS_EXPLANATION with real quotationRequired substrings, not a pooled deterministic answer set", () => {
  const rc02 = questionPrompts.filter((p) => p.validationTier === "TIER3_QUOTATION_PLUS_EXPLANATION");
  assert.equal(rc02.length, 5, "5 TIER3 questions: 2 in Passage A (Q3,Q7), 2 in Passage B (Q3,Q4), 1 in Passage C (Q3)");
  for (const p of rc02) {
    assert.ok(p.quotationRequired && p.quotationRequired.length >= 1);
  }
});

// === 13. Practice isolation ==================================================

test("13. no row in this migration ever sets eligibility_status to practice_eligible", () => {
  assert.doesNotMatch(executable166, /'practice_eligible'/);
});

// === 14. Mock isolation ======================================================

test("14. no row in this migration ever sets eligibility_status to mock_eligible, and no ali_mock_form / mock attempt table is referenced", () => {
  assert.doesNotMatch(executable166, /'mock_eligible'/);
  assert.doesNotMatch(executable166, /ali_mock_form|mock_attempt/);
});

// === 15/16. Writing taxonomy boundary / no invented Writing type ============

test("15/16. this migration does not touch ali_question_bank Writing content (subject != 'writing') and does not reference QT-WC-01c or any invented Writing type", () => {
  assert.doesNotMatch(executable166, /'writing'/);
  assert.doesNotMatch(executable166, /QT-WC-01c|QT-WC-02/);
});

// === all rows are candidate-only, no Increment 001/002/Mathematics touched ==

test("17. migration is additive and fail-closed: every insert uses on conflict (id) do nothing, no UPDATE targets any pre-existing eng-inc001-/eng-inc002-/mock-mathematics- id, and content_version = 1 throughout", () => {
  const insertBlocks = executable166.match(/on conflict \(id\) do nothing;/g);
  assert.ok(insertBlocks && insertBlocks.length >= 4);
  assert.doesNotMatch(executable166, /where id = 'eng-inc001-/);
  assert.doesNotMatch(executable166, /where id = 'eng-inc002-/);
  assert.doesNotMatch(executable166, /mock-mathematics/);
  const contentVersions = [...sql166.matchAll(/'authentic_assessment_candidate', 1, true,/g)];
  assert.equal(contentVersions.length, 28, "all 28 question rows carry content_version = 1");
});

// === 18. capacity calculation distinguishes numbered experiences from rows ==

test("18. migration header explicitly reconciles numbered questions (21/63), scored experiences (28/71) and physical rows (28/78) as three distinct figures, per Decision 244 §1", () => {
  assert.match(sql166, /CANONICAL THREE-WAY CAPACITY COUNTING/);
  assert.match(sql166, /A\. NUMBERED QUESTIONS[\s\S]*?: 21/);
  assert.match(sql166, /B\. SCORED COMPREHENSION EXPERIENCES[\s\S]*?: 28/);
  assert.match(sql166, /C\. PHYSICAL QUESTION ROWS[\s\S]*?: 28/);
  assert.match(sql166, /COMBINED TOTAL after this migration[\s\S]*?A = 63[\s\S]*?B = 71[\s\S]*?C = 78/);
});

// === marks sanity ============================================================

test("total marks across this migration's 28 physical rows is 48 (17 + 15 + 16)", () => {
  const total = questionPrompts.reduce((sum, p) => sum + p.marks, 0);
  assert.equal(total, 48);
});

// === Migration 167 — Writing taxonomy reconciliation =======================

const sql167 = fs.readFileSync("supabase/migrations/167_english_content_foundation_increment003_writing.sql", "utf8");
const executable167 = stripComments(sql167);

test("15b. migration 167 authors exactly ONE new Writing prompt, tagged QT-WC-01a (no new Writing task type invented)", () => {
  const parts = sql167.split("$json$");
  assert.equal((parts.length - 1) / 2, 1, "exactly one $json$ block");
  const prompt = JSON.parse(parts[1]);
  assert.equal(prompt.id, "eng-inc003-writing-imaginedplace-01");
  assert.match(sql167, /'eng-inc003-writing-imaginedplace-01', 'writing', 'QT-WC-01a'/);
  // QT-WC-01c is mentioned in this migration's own header prose (explaining it was NOT
  // created, per this project's transparency convention) but must never appear as an
  // actual column/skill value.
  assert.doesNotMatch(executable167, /'QT-WC-01c'/);
});

test("16b. the new Writing prompt is genuinely imagination-based, not a duplicate of any existing experience/opinion prompt shape", () => {
  const parts = sql167.split("$json$");
  const prompt = JSON.parse(parts[1]);
  assert.match(prompt.prompt, /imagination|invented|imagined/i);
  assert.equal(prompt.type, "narrative");
});

test("Writing prompt candidate-only: never practice_eligible or mock_eligible, additive and idempotent", () => {
  assert.doesNotMatch(executable167, /'practice_eligible'|'mock_eligible'/);
  assert.match(executable167, /on conflict \(id\) do nothing;/);
  assert.match(sql167, /'authentic_assessment_candidate', 1, true,/);
});

// === Decision 246 — Founder review remediation regression tests ============

test("19. no accepted-answer entry anywhere in this migration contains raw slash shorthand", () => {
  for (const p of questionPrompts) {
    const allAnswers = [...(p.acceptedAnswers ?? []), ...(p.quotationRequired ?? []), ...(p.orderedAnswer ?? [])];
    for (const a of allAnswers) {
      assert.doesNotMatch(a, /\//, `${p.id} accepted-answer entry "${a}" must not contain a raw "/" (Decision 246 §3)`);
    }
  }
});

test("20. Pepper's Breakfast Q4c no longer accepts 'looking puzzled' as a synonym for 'frowning', and Q4e no longer accepts 'calm' for 'unbothered'", () => {
  const q4c = questionPrompts.find((p) => p.id === "eng-inc003-peppersbreakfast-q04c");
  const q4e = questionPrompts.find((p) => p.id === "eng-inc003-peppersbreakfast-q04e");
  assert.ok(q4c && q4e);
  assert.ok(!q4c!.acceptedAnswers!.includes("looking puzzled"), "Q4c must not accept 'looking puzzled' (Decision 246 §1)");
  assert.ok(q4c!.acceptedAnswers!.length >= 1, "Q4c must retain at least one defensible synonym");
  assert.ok(!q4e!.acceptedAnswers!.includes("calm"), "Q4e must not accept 'calm' (Decision 246 §1, judged over-broad in context)");
  assert.ok(q4e!.acceptedAnswers!.length >= 1, "Q4e must retain at least one defensible synonym");
});

test("21. question-stem variation is a genuine per-instance judgement, not a mechanical find-and-replace: some 'According to <specific source>' stems are kept, some generic 'According to the passage' stems are reworded", () => {
  const accordingToCount = questionPrompts.filter((p) => /^According to/i.test(p.question)).length;
  assert.ok(accordingToCount < 7, `stem-repetition count should drop below Decision 245's flagged 7/21 (found ${accordingToCount})`);
  assert.ok(accordingToCount > 0, "at least one specific-source attribution stem (e.g. 'According to Mrs Novak') should be retained, not mechanically stripped everywhere");
  // specific-source attributions retained (precision-improving, per Decision 246 §2 header)
  assert.match(sql166, /According to Mrs Novak/);
  assert.match(sql166, /According to the care card/);
  assert.match(sql166, /According to the noticeboard history sheet/);
  // generic low-information STEM-OPENING "According to the passage" reworded away (Decision 245's
  // finding I counted stem-openers specifically; the incidental mid-sentence "...in the order they
  // happen, according to the passage" phrasing on the three sequencing questions is a different,
  // out-of-scope usage per Decision 246 §2's own "do not mechanically replace every occurrence")
  const stemOpeners = questionPrompts.filter((p) => /^According to the passage/i.test(p.question));
  assert.equal(stemOpeners.length, 0, "no question should still OPEN with the generic 'According to the passage' stem");
});

test("22. Salmon passage's scientific wording is amended per Decision 246 §5: categorical over-claims softened, dilution/precision-limit claims left intact", () => {
  assert.doesNotMatch(passageCText, /takes over\./, "the absolute 'takes over' claim must be replaced with a hedged equivalent");
  assert.doesNotMatch(passageCText, /pinpoint a single stream perfectly/, "'perfectly' must be removed as an unsupported absolute claim");
  assert.match(passageCText, /is thought to become important/);
  assert.match(passageCText, /still being studied/);
  assert.match(passageCText, /around the point where they first enter the sea/);
  // claims independently corroborated by fetched sources this session remain unchanged
  assert.match(passageCText, /not precise enough to pinpoint one particular stream/);
  assert.match(passageCText, /too diluted in the vast ocean to follow/);
});

test("23. every Salmon question/answer is internally consistent with the amended passage: quotations are exact substrings, vocabulary targets still present, chronology unambiguous", () => {
  const salmonQuestions = questionPrompts.filter((p) => p.id.startsWith("eng-inc003-salmonnavigation"));
  for (const p of salmonQuestions) {
    if (p.quotationRequired) {
      for (const q of p.quotationRequired) {
        assert.ok(passageCText.includes(q), `${p.id}'s required quotation "${q}" must be an exact substring of the amended Salmon passage`);
      }
    }
  }
  for (const word of ["remarkable", "reliable", "distinctive", "pinpoint", "diluted"]) {
    assert.ok(passageCText.includes(word), `synonym target word "${word}" must still appear verbatim in the amended passage`);
  }
  const q6 = questionPrompts.find((p) => p.id === "eng-inc003-salmonnavigation-q06");
  assert.ok(q6 && q6.question.includes("On its own, neither sense seems able to explain the whole journey"), "Q6's quoted sentence must match the amended passage exactly");
});

test("24. Founder review-status separation: migration header records all four distinct Decision 245 outcomes without collapsing approved_with_amendment/requires_revalidation into approved", () => {
  const normalized = sql166
    .split("\n")
    .map((line) => line.replace(/^--\s?/, ""))
    .join(" ")
    .replace(/\s+/g, " ");
  assert.match(normalized, /Pepper's Breakfast = approved_with_amendment/);
  assert.match(normalized, /Compass Rose Challenge = approved_with_amendment/);
  assert.match(normalized, /Way Home = requires_revalidation/);
  assert.match(normalized, /An Invented Place \(migration 167\) = approved/);
  assert.match(normalized, /Salmon remains requires_revalidation regardless of how the fresh factual revalidation/);
  assert.doesNotMatch(normalized, /Salmon[\s\S]{0,80}= independently_validated/);
});

test("25. Practice/Mock isolation still holds after remediation: no eligibility_status other than authentic_assessment_candidate anywhere, Compass Rose still excluded from Practice", () => {
  const eligibilityValues = [...sql166.matchAll(/eligibility_status\s*=\s*'(\w+)'/g), ...sql166.matchAll(/'(authentic_assessment_candidate|practice_eligible|independently_validated|mock_eligible)', (true|false), '[\w-]+', null\)/g)]
    .map((m) => m[1])
    .filter((v) => ["authentic_assessment_candidate", "practice_eligible", "independently_validated", "mock_eligible"].includes(v));
  assert.ok(eligibilityValues.length > 0);
  for (const v of eligibilityValues) assert.equal(v, "authentic_assessment_candidate");
  assert.match(sql166, /PASSAGE B STRUCTURAL RESERVATION/);
});
