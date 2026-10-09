#!/usr/bin/env node
/**
 * Pre-execution review of migration 273 (The Great Stink). Reads the EXACT migration SQL that the Founder would apply (not the
 * TypeScript source), re-derives every check from it, uses the real production marking functions, and prints one JSON report.
 * Read-only: touches no database. The live overlap check against production is a separate SQL (see the Founder package).
 * Run: npx tsx scripts/review-great-stink-before-273.mts [--grams]   (--grams prints the 6-gram list used for the live overlap SQL)
 */
import fs from "node:fs";
import { checkQuotationPresent, scoreEnglishComprehensionAnswer } from "@/lib/learningEngine/englishAnswerValidation";
import { scoreEnglishAnswer } from "@/lib/learningEngine/practiceContent";
import { buildDisjointWrongAnswer, validateEnglishMarkingContract } from "@/lib/ali/questionFactory/englishMarkingContractGate";
import { REPLACEMENT_ITEMS, REPLACEMENT_PASSAGE_TEXT } from "@/lib/ali/questionFactory/englishFormBReplacement";

const FILE = "supabase/migrations/273_english_form_b_salmon_replacement_APPLIED_DO_NOT_RERUN.sql";
const sql = fs.readFileSync(FILE, "utf8");
const passage = sql.slice(sql.indexOf("$passage$") + 9, sql.indexOf("$passage$", sql.indexOf("$passage$") + 9));
type Q = { id: string; marks: number; skill: string; question: string; modelAnswer: string; passageText: string; validationTier: string; acceptedAnswers?: string[]; orderedAnswer?: string[]; quotationRequired?: string[]; markingGuidance?: string };
const qs: Q[] = [];
for (let i = 0; (i = sql.indexOf("$json$", i)) >= 0; ) {
  const j = sql.indexOf("$json$", i + 6);
  qs.push(JSON.parse(sql.slice(i + 6, j)));
  i = j + 6;
}
const meta = [...sql.matchAll(/\('(eng-fb-greatstink-q\d\d)', 'english', '(QT-RC-\d\d)', array\['csse'\], '(\w+)', '[\w-]+', (\d+),/g)].map((m) => ({ id: m[1], qt: m[2], difficulty: m[3], seconds: Number(m[4]) }));

const norm = (s: string) => s.toLowerCase().replace(/[‘’]/g, "'").replace(/\s+/g, " ").trim();
const words = (t: string) => t.toLowerCase().replace(/[^a-z0-9' ]/g, " ").split(/\s+/).filter(Boolean);
const P = norm(passage.replace(/\n/g, " "));
const paragraphs = passage.split(/\n\n/);
const out: Record<string, unknown> = {};
const tally = (xs: string[]) => xs.reduce<Record<string, number>>((a, x) => ((a[x] = (a[x] ?? 0) + 1), a), {});

// 1. passage quality and reading demand
const sentences = passage.split(/(?<=[.!?])\s+/).filter(Boolean);
const w = words(passage);
const syl = (x: string) => Math.max(1, (x.replace(/e$/, "").match(/[aeiouy]+/g) ?? []).length);
const fk = 0.39 * (w.length / sentences.length) + 11.8 * (w.reduce((a, x) => a + syl(x), 0) / w.length) - 15.59;
const longWords = w.filter((x) => x.length >= 9);
out.passage = {
  words: w.length,
  paragraphs: paragraphs.length,
  sentences: sentences.length,
  avgSentenceWords: +(w.length / sentences.length).toFixed(1),
  longestSentenceWords: Math.max(...sentences.map((s) => words(s).length)),
  fleschKincaidGrade: +fk.toFixed(1),
  wordsOfNineLettersOrMore: longWords.length,
  hardWords: [...new Set(longWords)].slice(0, 30),
  identicalToTypeScriptSource: passage === REPLACEMENT_PASSAGE_TEXT,
  americanSpellingFound: passage.match(/\b(color|honor|neighbor|center|defense|gray|organize|realize)\b/gi) ?? [],
  sensitiveContentNote: "cholera deaths and sewage are stated plainly, once each, without detail; standard KS2 Victorian-history content",
};

// 2. question-to-passage evidence, answers, wording, leakage
const items = qs.map((q) => {
  const m = meta.find((x) => x.id === q.id)!;
  const ts = REPLACEMENT_ITEMS.find((i) => i.id === q.id)!;
  const flags: string[] = [];
  if (!q.skill || !q.passageText) flags.push("missing skill/passageText");
  if (norm(q.passageText.replace(/\\n/g, " ")) !== P) flags.push("passageText differs from the passage row");
  const para = (q.question.match(/\b(first|second|third|fourth|fifth|sixth) paragraph/) ?? [])[1];
  const pIdx = para ? ["first", "second", "third", "fourth", "fifth", "sixth"].indexOf(para) : -1;
  if (q.skill === "vocabulary") {
    const a = q.acceptedAnswers![0];
    if (!new RegExp(`\\b${a}\\b`, "i").test(paragraphs[pIdx] ?? "")) flags.push(`answer word "${a}" is not in the ${para} paragraph`);
    for (const other of qs) if (other.id !== q.id && new RegExp(`\\b${a}\\b`, "i").test(other.question)) flags.push(`answer "${a}" appears in the stem of ${other.id}`);
  }
  if (q.id.endsWith("q01") && !/summer of 1858/.test(P)) flags.push("q01 evidence missing");
  if (q.id.endsWith("q02") && !/marking each death on a map/.test(P)) flags.push("q02 evidence missing");
  if (q.id.endsWith("q03") && !/london lay in a shallow bowl beside the river, pumping stations were needed to lift the waste so that it could keep flowing/.test(P)) flags.push("q03 evidence missing");
  for (const quote of q.quotationRequired ?? []) if (!P.includes(norm(quote).replace(/[.,]$/, ""))) flags.push(`required quotation not verbatim in passage: ${quote}`);
  for (const quote of [...q.question.matchAll(/"([^"]+)"/g)].map((x) => x[1])) if (!/means/.test(q.question) && !P.includes(norm(quote).replace(/\.$/, ""))) flags.push(`quoted phrase not verbatim in passage: ${quote}`);
  const leak = [q.modelAnswer.replace(/\.$/, ""), ...(q.acceptedAnswers ?? []).filter((a) => a.length > 6)].some((a) => a.length > 3 && norm(q.question).includes(norm(a)));
  if (leak && q.skill !== "evidence") flags.push("stem contains the answer");
  if (q.id.endsWith("q10")) {
    const pos: Record<string, number> = { A: P.indexOf("within weeks it agreed to pay"), B: P.indexOf("summer of 1858"), C: P.indexOf("in 1854"), D: P.indexOf("on top of some of the tunnels") };
    const order = Object.keys(pos).sort((a, b) => pos[a] - pos[b]);
    if (order.join(",") !== q.orderedAnswer!.map((x) => x.toUpperCase()).join(",")) flags.push(`ordered answer ${q.orderedAnswer} does not match passage order ${order}`);
    if (Object.values(pos).some((x) => x < 0)) flags.push("an event listed in q10 is not found in the passage");
  }
  const fields = { marks: q.marks, validationTier: q.validationTier, acceptedAnswers: q.acceptedAnswers, modelAnswer: q.modelAnswer, orderedAnswer: q.orderedAnswer, quotationRequired: q.quotationRequired } as never;
  let marking = "";
  if (q.validationTier === "TIER2_ACCEPTED_SET") {
    const r = validateEnglishMarkingContract({ candidateId: q.id, marks: q.marks, acceptedAnswers: q.acceptedAnswers, modelAnswer: q.modelAnswer, validationTier: q.validationTier, canonicalAnswer: q.acceptedAnswers![0], approvedVariants: q.acceptedAnswers!.slice(1), disjointWrongAnswer: buildDisjointWrongAnswer(q.acceptedAnswers!), plausibleWrongAnswers: ts.plausibleWrongAnswers } as never);
    marking = r.valid ? "marking contract valid" : `INVALID ${JSON.stringify(r.failures)}`;
    if (!r.valid) flags.push(marking);
    for (const a of q.acceptedAnswers!.slice(0, 2)) if (scoreEnglishComprehensionAnswer(a, fields, scoreEnglishAnswer).earnedMarks !== q.marks) flags.push(`accepted answer "${a}" not full marks`);
    for (const wrong of ts.plausibleWrongAnswers ?? []) if (scoreEnglishComprehensionAnswer(wrong, fields, scoreEnglishAnswer).earnedMarks !== 0) flags.push(`plausible wrong answer "${wrong}" scored`);
  } else if (q.validationTier === "TIER4_ORDERED_LIST") {
    const sc = (a: string) => scoreEnglishComprehensionAnswer(a, fields, scoreEnglishAnswer).earnedMarks;
    marking = `ordered: correct=${sc(q.orderedAnswer!.join(", "))}/${q.marks}, reversed=${sc([...q.orderedAnswer!].reverse().join(", "))}`;
    if (sc(q.orderedAnswer!.join(", ")) !== q.marks) flags.push("correct order not full marks");
    if (sc([...q.orderedAnswer!].reverse().join(", ")) >= q.marks) flags.push("reversed order gets full marks");
  } else if (q.validationTier === "TIER3_QUOTATION_PLUS_EXPLANATION") {
    marking = "quotation + explanation";
    for (const quote of q.quotationRequired ?? []) if (!checkQuotationPresent(`B. "${quote}" shows it.`, quote).quotationFound) flags.push(`quotation check misses ${quote}`);
    if (!/1 mark: .*1 mark: .*1 mark:/.test(q.markingGuidance ?? "")) flags.push("marking guidance does not split three observable marks");
  } else {
    marking = "manual (named components)";
    if (!/1 mark: .*1 mark: /.test(q.markingGuidance ?? "")) flags.push("manual item lacks separately observable mark elements");
    if (scoreEnglishComprehensionAnswer(q.modelAnswer, fields, scoreEnglishAnswer).earnedMarks !== 0) flags.push("manual item is auto-scored");
  }
  return { id: q.id.slice(-3), qt: m.qt, difficulty: m.difficulty, marks: q.marks, tier: q.validationTier, wordsInStem: words(q.question).length, marking, flags };
});
out.items = items;
out.totals = {
  questions: qs.length,
  marks: qs.reduce((a, q) => a + q.marks, 0),
  byDifficulty: tally(items.map((i) => i.difficulty)),
  byMarks: tally(items.map((i) => String(i.marks))),
  byTier: tally(items.map((i) => i.tier)),
  byQuestionType: tally(items.map((i) => i.qt)),
  allFlags: items.flatMap((i) => i.flags.map((f) => `${i.id}: ${f}`)),
};

// 3. exact statement scope of the migration (what it can touch)
const strip = sql.replace(/\$passage\$[\s\S]*?\$passage\$/g, "").replace(/\$json\$[\s\S]*?\$json\$/g, "");
out.noDeleteNoDdl = !/\b(delete\s+from|truncate|create\s+(table|function|policy|index|trigger|type)|alter\s+table|drop\s+|grant\s|revoke\s)/i.test(strip);
out.rowEffects = {
  passageInserts: (sql.match(/insert into public\.ali_passage_bank/g) ?? []).length,
  questionInsertRowsDeclared: (sql.match(/^\('eng-fb-greatstink-q\d\d'/gm) ?? []).length,
  reviewInsertStatements: (sql.match(/insert into public\.ali_family_review/g) ?? []).length,
  updates: [...sql.matchAll(/(update public\.\w+ set [a-z_]+ = \w+)/g)].map((m) => m[1]),
  eligibilityValuesWritten: tally([...strip.matchAll(/'(authentic_assessment_candidate|practice_eligible|mock_eligible|independently_validated)'/g)].map((m) => m[1])),
};

if (process.argv.includes("--grams")) {
  const ws = words(passage.replace(/\n/g, " "));
  const grams = new Set<string>();
  for (let i = 0; i + 6 <= ws.length; i++) grams.add(ws.slice(i, i + 6).join(" "));
  console.log([...grams].map((g) => g.replace(/'/g, "''")).join("\n"));
} else console.log(JSON.stringify(out, null, 1));
