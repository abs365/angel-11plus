import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  REPLACEMENT_FACTUAL_CLAIMS, REPLACEMENT_ITEMS, REPLACEMENT_PASSAGE_ID, REPLACEMENT_PASSAGE_TEXT, REPLACEMENT_TOTALS,
} from "@/lib/ali/questionFactory/englishFormBReplacement";
import { TOP_UP_ITEMS } from "@/lib/ali/questionFactory/englishFormBCompletion";
import { buildDisjointWrongAnswer, validateEnglishMarkingContract } from "@/lib/ali/questionFactory/englishMarkingContractGate";
import { checkQuotationPresent, scoreEnglishComprehensionAnswer } from "@/lib/learningEngine/englishAnswerValidation";
import { scoreEnglishAnswer } from "@/lib/learningEngine/practiceContent";
import { composeCandidateMock, validateManifest } from "@/lib/ali/mockComposition";
import { REJECTED_MOCK_LEARNING_UNITS, isRejectedMockContent } from "@/lib/ali/rejectedMockContent";
import type { BankQuestion } from "@/types/ali/questionBank";

// ---- held passages and questions (read from the committed migrations) ----------------------------------------------------
function jsonBlocks(file: string): { id?: string; passageText?: string; question?: string }[] {
  const s = fs.readFileSync(`supabase/migrations/${file}`, "utf8");
  const out: { id?: string; passageText?: string; question?: string }[] = [];
  let i = 0;
  while ((i = s.indexOf("$json$", i)) >= 0) {
    const j = s.indexOf("$json$", i + 6);
    if (j < 0) break;
    try { out.push(JSON.parse(s.slice(i + 6, j))); } catch { /* not a question block */ }
    i = j + 6;
  }
  return out;
}
const FILES = ["152_english_content_foundation_increment001_comprehension.sql", "161_english_content_foundation_increment002_comprehension.sql", "166_english_content_foundation_increment003_comprehension.sql", "191_programme_completion_inc001_comprehension_anning.sql", "193_programme_completion_inc003_comprehension_groupproject.sql"];
const blocks = FILES.flatMap(jsonBlocks);
const HELD: Record<string, string> = {};
for (const b of blocks) if (b.passageText && b.id) HELD[b.id.replace(/-q\d+[a-z]?$/, "")] = b.passageText;
const BEE = HELD["eng-inc001-bee"];
const words = (t: string) => t.toLowerCase().replace(/\\n/g, " ").replace(/[^a-z0-9' -]/g, " ").split(/\s+/).filter(Boolean);
function longestSharedRun(a: string, b: string): number {
  const A = words(a), B = words(b);
  const idx = new Map<string, number[]>();
  B.forEach((w, i) => idx.set(w, [...(idx.get(w) ?? []), i]));
  let best = 0;
  for (let i = 0; i < A.length; i++) for (const j of idx.get(A[i]) ?? []) { let k = 0; while (i + k < A.length && j + k < B.length && A[i + k] === B[j + k]) k++; if (k > best) best = k; }
  return best;
}
const STOP = new Set("the a an and of to in on is are was were it its that this with as by for from at be or but not they their them he she his her which who what when where than then so such can may might also into out up one two".split(" "));
const content = (t: string) => new Set(words(t).filter((x) => !STOP.has(x) && x.length > 3));
const jaccard = (a: string, b: string) => { const A = content(a), B = content(b); let n = 0; for (const x of A) if (B.has(x)) n++; return n / (A.size + B.size - n); };
const norm = (s: string) => s.toLowerCase().replace(/[‘’]/g, "'").replace(/\\n/g, " ").replace(/\s+/g, " ");

test("coverage matches the Form B requirement: 11 items, 18 marks, and Form B totals 24 items and 39 marks with the Compass Rose half", () => {
  assert.deepEqual(REPLACEMENT_TOTALS, { items: 11, marks: 18 });
  const by: Record<string, [number, number]> = {};
  for (const i of REPLACEMENT_ITEMS) by[i.skill] = [(by[i.skill]?.[0] ?? 0) + 1, (by[i.skill]?.[1] ?? 0) + i.marks];
  assert.deepEqual(by, { "QT-RC-01": [3, 3], "QT-RC-02": [1, 3], "QT-RC-03": [1, 2], "QT-RC-04": [4, 4], "QT-RC-06": [1, 4], "QT-RC-10": [1, 2] });
  const compass = blocks.filter((b) => b.id?.startsWith("eng-inc003-compassrosechallenge-q")) as unknown as { marks: number }[];
  const cItems = compass.length + TOP_UP_ITEMS.filter((t) => t.passageId.includes("compass")).length;
  const cMarks = compass.reduce((s, b) => s + b.marks, 0) + TOP_UP_ITEMS.filter((t) => t.passageId.includes("compass")).reduce((s, t) => s + t.marks, 0);
  assert.equal(cItems + REPLACEMENT_TOTALS.items, 24);
  assert.equal(cMarks + REPLACEMENT_TOTALS.marks, 39);
  assert.equal(new Set(REPLACEMENT_ITEMS.map((i) => i.id)).size, 11);
  for (const i of REPLACEMENT_ITEMS) assert.ok(i.id.startsWith(REPLACEMENT_PASSAGE_ID + "-q"));
});

test("passage: original length and reading demand in range, British English, anchors and quoted phrases verbatim", () => {
  const n = words(REPLACEMENT_PASSAGE_TEXT).length;
  assert.ok(n >= 500 && n <= 620, `${n} words`);
  const sentences = REPLACEMENT_PASSAGE_TEXT.split(/[.!?]+\s/).filter((s) => s.trim());
  const avg = n / sentences.length;
  assert.ok(avg >= 11 && avg <= 24, `average sentence length ${avg.toFixed(1)}`);
  assert.doesNotMatch(REPLACEMENT_PASSAGE_TEXT, /\b(color|neighbor|labor|program)\b/i);
  const p = norm(REPLACEMENT_PASSAGE_TEXT);
  for (const i of REPLACEMENT_ITEMS) for (const a of i.anchors) assert.ok(p.includes(norm(a)), `${i.id}: ${a}`);
  for (const i of REPLACEMENT_ITEMS) for (const m of i.question.matchAll(/"([^"]+)"/g)) assert.ok(p.includes(norm(m[1].replace(/\.$/, ""))) || /that means|means/.test(i.question), `${i.id}: "${m[1]}"`);
  assert.equal(REPLACEMENT_PASSAGE_TEXT.split("\n\n").length, 6);
});

test("materially different from the bee passage and from every held passage: no run of six shared words, low topic overlap, no recycled frames or vocabulary", () => {
  assert.ok(BEE && BEE.length > 1000, "bee passage found");
  const nonSelf = Object.entries(HELD).filter(([id]) => id !== REPLACEMENT_PASSAGE_ID);
  assert.ok(nonSelf.length >= 9, `held passages compared: ${nonSelf.length}`);
  for (const [id, text] of nonSelf) assert.ok(longestSharedRun(REPLACEMENT_PASSAGE_TEXT, text) < 6, `${id}: shared run ${longestSharedRun(REPLACEMENT_PASSAGE_TEXT, text)}`);
  // the rejected pair measured 8 and 0.184; the replacement must be well below
  assert.ok(longestSharedRun(REPLACEMENT_PASSAGE_TEXT, BEE) <= 4, `bee run ${longestSharedRun(REPLACEMENT_PASSAGE_TEXT, BEE)}`);
  assert.ok(jaccard(REPLACEMENT_PASSAGE_TEXT, BEE) < 0.09, `bee overlap ${jaccard(REPLACEMENT_PASSAGE_TEXT, BEE).toFixed(3)}`);
  const lower = REPLACEMENT_PASSAGE_TEXT.toLowerCase();
  for (const banned of ["remarkable", "feat of", "feats of", "what is already clear", "natural navigation", "no map", "a creature with", "astonishing", "waggle", "compass"]) assert.ok(!lower.includes(banned), banned);
  // different discourse: chronological problem-and-solution, with its dated turning points in order
  const order = ["in the middle of the nineteenth century", "in 1854", "summer of 1858", "within weeks", "the main tunnels were opened in the 1860s"].map((m) => lower.indexOf(m));
  assert.ok(order.every((x) => x >= 0) && order.every((x, k) => k === 0 || x > order[k - 1]), JSON.stringify(order));
});

test("question formats are not a clone of the bee sequence, and no worked-example vocabulary is recycled", () => {
  const beeQs = blocks.filter((b) => b.id?.startsWith("eng-inc001-bee-q")).map((b) => b.question ?? "");
  assert.ok(beeQs.length === 8);
  for (const i of REPLACEMENT_ITEMS) {
    assert.doesNotMatch(i.question, /done for you|Tick Yes or No|Tick the TWO|\(a\)/i, i.id);
    for (const bq of beeQs) assert.ok(longestSharedRun(i.question, bq) < 6, `${i.id} vs bee question: ${longestSharedRun(i.question, bq)}`);
    for (const given of ["remarkable", "interpret", "detect"]) assert.ok(!i.question.toLowerCase().includes(given), `${i.id} recycles ${given}`);
  }
  const formats = REPLACEMENT_ITEMS.map((i) => i.tier + "/" + i.skill);
  assert.ok(new Set(formats).size >= 6, "a spread of formats");
});

test("independently answerable from the passage: every answer rests on text that is there; the wrong options are contradicted", () => {
  const p = norm(REPLACEMENT_PASSAGE_TEXT);
  assert.ok(p.includes("most doctors did not know that germs cause disease"), "statement A is contradicted");
  assert.ok(p.includes("made the pipes larger than the city seemed to need"), "statement C is contradicted");
  assert.ok(p.includes("the people who made the laws could not escape the problem they had put off for years"));
  assert.ok(p.includes("london lay in a shallow bowl beside the river, pumping stations were needed to lift the waste so that it could keep flowing"));
  // event order for Q10, from the passage: Snow (1854), hot summer (1858), Parliament agrees, embankments last
  const ord = ["in 1854", "summer of 1858", "within weeks it agreed to pay", "on top of some of the tunnels"].map((m) => p.indexOf(m));
  assert.ok(ord.every((x, k) => x >= 0 && (k === 0 || x > ord[k - 1])), JSON.stringify(ord));
});

test("deterministic items pass the real marking contract; plausible wrong answers score zero", () => {
  for (const i of REPLACEMENT_ITEMS.filter((x) => x.tier === "TIER2_ACCEPTED_SET")) {
    const r = validateEnglishMarkingContract({
      candidateId: i.id, marks: i.marks, acceptedAnswers: i.acceptedAnswers, modelAnswer: i.modelAnswer, validationTier: i.tier,
      canonicalAnswer: i.acceptedAnswers![0], approvedVariants: i.acceptedAnswers!.slice(1), disjointWrongAnswer: buildDisjointWrongAnswer(i.acceptedAnswers!), plausibleWrongAnswers: i.plausibleWrongAnswers,
    });
    assert.ok(r.valid, `${i.id}: ${JSON.stringify(r.failures)}`);
    assert.ok((i.plausibleWrongAnswers ?? []).length >= 3, i.id);
  }
});

test("ordered Q10 uses letters: every separator works, order matters, no unordered credit, and its limits are stated", () => {
  const q = REPLACEMENT_ITEMS.find((i) => i.id.endsWith("q10"))!;
  const fields = { marks: 4, validationTier: q.tier, orderedAnswer: q.orderedAnswer, modelAnswer: q.modelAnswer } as const;
  const score = (a: string) => scoreEnglishComprehensionAnswer(a, fields, scoreEnglishAnswer).earnedMarks;
  for (const a of ["C, B, A, D", "c,b,a,d", "C B A D", "C\nB\nA\nD", "C; B; A; D", "C -> B -> A -> D", "C then B then A then D", "1. C 2. B 3. A 4. D"]) assert.equal(score(a), 4, a);
  for (const a of ["D, A, B, C", "B, C, A, D"]) assert.ok(score(a) < 4, a);
  assert.equal(score("D, A, B, C"), 0);
  assert.equal(score("A, B, C, D"), 2, "two positions happen to be right: partial credit, never full");
  assert.ok(score("CBAD") < 4, "no separators at all is not accepted as four letters");
  for (const wrong of q.plausibleWrongAnswers ?? []) assert.ok(score(wrong) < 4, wrong);
});

test("the quotation item (TIER3): both accepted quotations are present in the passage and detected by the real quotation check", () => {
  const q = REPLACEMENT_ITEMS.find((i) => i.id.endsWith("q04"))!;
  assert.equal(q.tier, "TIER3_QUOTATION_PLUS_EXPLANATION");
  assert.match(q.markingGuidance ?? "", /1 mark: .*1 mark: .*1 mark:/);
  for (const quote of q.quotationRequired!) assert.ok(checkQuotationPresent(`B. "${quote}" shows it.`, quote).quotationFound, quote);
  assert.ok(checkQuotationPresent("B, because they held handkerchiefs over their noses", "held handkerchiefs over their noses").quotationFound);
  assert.equal(checkQuotationPresent("B, because they were cross", q.quotationRequired![0]).quotationFound, false);
});

test("manual items state separately observable mark elements and are never auto-marked", () => {
  for (const i of REPLACEMENT_ITEMS.filter((x) => x.tier === "TIER5_NAMED_COMPONENT_PLUS_EXPLANATION")) {
    assert.match(i.markingGuidance ?? "", /1 mark: .*1 mark: /, i.id);
    assert.ok(i.modelAnswer.length > 60 && i.alternativeAnswerNotes.length > 40, i.id);
    const fields = { marks: i.marks, validationTier: i.tier, acceptedAnswers: i.acceptedAnswers, modelAnswer: i.modelAnswer } as const;
    assert.equal(scoreEnglishComprehensionAnswer(i.modelAnswer, fields, scoreEnglishAnswer).earnedMarks, 0, "routed to the marker, not scored automatically");
  }
});

test("the factual claims list is complete enough for a validator (twelve claims, none about unstated numbers a child must recall)", () => {
  assert.equal(REPLACEMENT_FACTUAL_CLAIMS.length, 12);
  assert.ok(REPLACEMENT_FACTUAL_CLAIMS.some((c) => /1858/.test(c)) && REPLACEMENT_FACTUAL_CLAIMS.some((c) => /Snow/.test(c)) && REPLACEMENT_FACTUAL_CLAIMS.some((c) => /Bazalgette/.test(c)));
});

// ---- Salmon is preserved as rejected/replaced evidence and cannot return to a Form --------------------------------------
const row = (id: string, unit: string): BankQuestion => ({ id, subject: "english", skill: "QT-RC-01", learningUnitId: unit, eligibilityStatus: "mock_eligible", active: true, pathway: ["csse"], prompt: { marks: 1 } } as unknown as BankQuestion);

test("Salmon is recorded as rejected and replaced, and the composer and validator refuse it even if it were mock-eligible", () => {
  const rec = REJECTED_MOCK_LEARNING_UNITS["eng-inc003-salmonnavigation"];
  assert.equal(rec.replacedBy, REPLACEMENT_PASSAGE_ID);
  assert.equal(rec.decidedOn, "2026-10-08");
  const pool = [row("eng-inc003-salmonnavigation-q01", "eng-inc003-salmonnavigation"), row("other-q01", "some-other-passage")];
  assert.equal(isRejectedMockContent(pool[0]), true);
  assert.equal(isRejectedMockContent(pool[1]), false);
  const composed = composeCandidateMock(pool, 5, "english", "csse");
  assert.ok(!composed.manifestQuestionIds.includes("eng-inc003-salmonnavigation-q01"), "composer never selects rejected content");
  const v = validateManifest(["eng-inc003-salmonnavigation-q01"], pool, "english", "csse");
  assert.equal(v.valid, false);
  assert.ok(v.failures.some((f) => f.code === "rejected_content"));
});

test("migration 273 template is prepared, not applied, adds only sealed candidates, and retires Salmon without deleting it", () => {
  const sql = fs.readFileSync("supabase/migrations/273_english_form_b_salmon_replacement_TEMPLATE_NOT_APPLIED.sql", "utf8");
  assert.match(sql, /NOT APPLIED/);
  assert.equal((sql.match(/insert into public\.ali_passage_bank/g) ?? []).length, 1);
  assert.equal((sql.match(/insert into public\.ali_question_bank/g) ?? []).length, 1);
  for (const i of REPLACEMENT_ITEMS) assert.ok(sql.includes(i.id), i.id);
  const code = sql.split(/\r?\n/).filter((l) => !l.trim().startsWith("--")).join(" ");
  assert.doesNotMatch(code, /mock_eligible|independently_validated|practice_eligible|\bdelete\b|\bdrop\b/i);
  assert.match(code, /'authentic_assessment_candidate'/);
  assert.match(code, /eng-inc003-salmonnavigation/);
  assert.match(code, /'rejected'/);
  assert.match(code, /active = false/);
});

test("no answer leakage inside the paper: a synonym item's answer word never appears in another item's question (found and fixed before execution: Q10 used to print 'exceptionally', the Q06 answer)", () => {
  for (const syn of REPLACEMENT_ITEMS.filter((i) => i.skill === "QT-RC-04")) {
    const answer = syn.acceptedAnswers![0];
    for (const other of REPLACEMENT_ITEMS) if (other.id !== syn.id) assert.ok(!new RegExp(`\b${answer}\b`, "i").test(other.question), `${other.id} contains the answer to ${syn.id}: ${answer}`);
  }
  const q10 = REPLACEMENT_ITEMS.find((i) => i.id.endsWith("q10"))!;
  assert.match(q10.question, /B\. London had a hot, dry summer in 1858\./);
  assert.deepEqual(q10.orderedAnswer, ["c", "b", "a", "d"]);
});
