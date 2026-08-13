import { readFileSync, writeFileSync } from "node:fs";

const SCRATCH = "C:/Users/Admin/AppData/Local/Temp/claude/C--Users-Admin/741c0ede-7d52-4a4c-9a84-915666c1c1bc/scratchpad";
const passages = JSON.parse(readFileSync(`${SCRATCH}/wave1_passages.json`, "utf8"));
const items = JSON.parse(readFileSync(`${SCRATCH}/wave1_items.json`, "utf8"));

function sqlEscape(s) {
  return s.replace(/'/g, "''");
}
function pgArray(arr) {
  if (!arr || arr.length === 0) return "'{}'";
  return `array[${arr.map((s) => `'${sqlEscape(s)}'`).join(",")}]`;
}

// --- ali_passage_bank rows -------------------------------------------------
let passageSql = "";
for (const p of passages) {
  passageSql += `('${p.id}', '${sqlEscape(p.title)}',\n`;
  passageSql += ` $passage$${p.originalText}$passage$,\n`;
  passageSql += ` '${p.textType}', '${p.genre}', ${p.wordCount}, '${p.readingComplexity}',\n`;
  passageSql += ` '${p.provenance}', '${sqlEscape(p.copyrightStatus)}', array['csse'], '${p.contentDifficulty}', 1, 'provisional', true,\n`;
  passageSql += ` '${p.passageFamily}', null),\n\n`;
}

// --- ali_question_bank rows -------------------------------------------------
let questionSql = "";
for (const it of items) {
  const passage = passages.find((p) => p.id === it.passageId);
  const promptObj = {
    id: it.id,
    marks: it.marks,
    skill: it.legacySkill,
    question: it.question,
    modelAnswer: it.modelAnswer,
    passageTitle: passage.title,
    passageText: passage.originalText,
  };
  if (it.acceptedAnswers) promptObj.acceptedAnswers = it.acceptedAnswers;
  if (it.quotationRequired) promptObj.quotationRequired = it.quotationRequired;
  if (it.orderedAnswer) promptObj.orderedAnswer = it.orderedAnswer;
  promptObj.validationTier = it.validation;

  const explanation = `Educational Increment 007B, Wave 1. Assessment Brain ${it.qType}, primary competency ${it.competency}. Question family: ${it.family}. Transfer class: ${it.transferClass}. Real evidence basis: direct reading of CSSE-003/005/008 (2022/2023 Main Test papers and marking scheme, Level A, Founder-Accepted), reconciled in Educational Increment 007A. Answer validation: ${it.validation}.`;
  const misconception = it.misconception ? sqlEscape(it.misconception) : null;

  questionSql += `('${it.id}', 'english', '${it.qType}', array['csse'], '${passage.contentDifficulty}', 'short-answer', 90,\n`;
  questionSql += ` $json$${JSON.stringify(promptObj)}$json$,\n`;
  // mastery_threshold = distinct correct sessions needed for mastery
  // (lib/ali/mastery.ts) — NOT the question's own mark value. Fixed at 2,
  // matching the established Mathematics convention (migration 040).
  questionSql += ` '${sqlEscape(explanation)}', 2, '${it.passageId}',\n`;
  questionSql += ` '${it.family}', 'angel_original', 'provisional', 1, true, ${misconception ? `'${misconception}'` : "null"},\n`;
  questionSql += ` '${it.transferClass}', null),\n\n`;
}

writeFileSync(`${SCRATCH}/wave1_passage_values.sql`, passageSql);
writeFileSync(`${SCRATCH}/wave1_question_values.sql`, questionSql);
console.log(`Wrote ${passages.length} passage rows and ${items.length} question rows to scratchpad SQL fragments.`);
