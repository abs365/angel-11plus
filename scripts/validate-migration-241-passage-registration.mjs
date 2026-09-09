import { EI003_WAVE2_PASSAGES } from "../lib/ali/questionFactory/ei003Wave2Passages.ts";
import { WAVE2_SEQUENCING_CANDIDATES } from "../lib/ali/questionFactory/ei003Wave2SequencingFamily.ts";
import { WAVE2_COMPARATIVE_CANDIDATES } from "../lib/ali/questionFactory/ei003Wave2ComparativeFamily.ts";
import { WAVE2_EMOTION_CANDIDATES } from "../lib/ali/questionFactory/ei003Wave2EmotionFamily.ts";
import { WAVE2_ATMOSPHERE_CANDIDATES } from "../lib/ali/questionFactory/ei003Wave2AtmosphereFamily.ts";
import { WAVE2_WORD_CHOICE_CANDIDATES } from "../lib/ali/questionFactory/ei003Wave2WordChoiceFamily.ts";
import fs from "node:fs";

let problems = 0;
function check(label, cond) {
  if (cond) {
    console.log(`PASS: ${label}`);
  } else {
    problems++;
    console.log(`FAIL: ${label}`);
  }
}

function normalise(text) {
  return text.replace(/\r\n/g, "\n").replace(/\r/g, "\n");
}

const sql = fs.readFileSync(new URL("../supabase/migrations/241_ei003_wave2_passage_bank_registration.sql", import.meta.url), "utf8");

// 1. Migration contains exactly the six intended passage identities.
const expectedIds = EI003_WAVE2_PASSAGES.map((p) => p.id);
check("exactly 6 passages in source", expectedIds.length === 6);
for (const id of expectedIds) {
  const occurrences = sql.split(`'${id}'`).length - 1;
  check(`migration references id ${id} (found ${occurrences} times, expect >= 3: precondition + values + postcondition)`, occurrences >= 3);
}

// 2. Canonical content matches: extract each $passage$...$passage$ block and compare byte-for-byte
// (after the same CRLF normalisation the migration itself applies) to the source.
const dollarBlocks = [...sql.matchAll(/\$passage\$([\s\S]*?)\$passage\$/g)].map((m) => m[1]);
check(`migration contains dollar-quoted text blocks (found ${dollarBlocks.length}, expect a multiple of 6: precondition + postcondition each embed the literal once)`, dollarBlocks.length % 6 === 0 && dollarBlocks.length > 0);

for (const p of EI003_WAVE2_PASSAGES) {
  const expected = normalise(p.text);
  const matches = dollarBlocks.filter((b) => normalise(b) === expected);
  check(`passage "${p.id}" text appears in the migration and matches the source exactly (${matches.length} occurrence(s))`, matches.length >= 1);
}

// 3 & 4. Candidate source passage IDs match those six identities; all 40 candidates resolve.
const allCandidates = [
  ...WAVE2_SEQUENCING_CANDIDATES,
  ...WAVE2_COMPARATIVE_CANDIDATES,
  ...WAVE2_EMOTION_CANDIDATES,
  ...WAVE2_ATMOSPHERE_CANDIDATES,
  ...WAVE2_WORD_CHOICE_CANDIDATES,
];
check("exactly 40 candidates in source", allCandidates.length === 40);
const idSet = new Set(expectedIds);
const unresolved = allCandidates.filter((c) => !idSet.has(c.passageId));
check(`all 40 candidates resolve to one of the six migration passage ids (${unresolved.length} unresolved)`, unresolved.length === 0);

// 5. Quote/evidence integrity remains clean against the exact passage text the migration will insert.
const textById = Object.fromEntries(EI003_WAVE2_PASSAGES.map((p) => [p.id, normalise(p.text)]));
let quoteProblems = 0;
for (const c of allCandidates) {
  const text = textById[c.passageId];
  for (const q of c.evidenceQuotes) {
    if (!text.includes(q)) quoteProblems++;
  }
}
check(`0 quote-integrity problems against the migration's exact text (found ${quoteProblems})`, quoteProblems === 0);

// 6. No ON CONFLICT DO UPDATE anywhere in executable SQL (fail-closed
// requirement) -- strip "--" comment lines first, since the migration's
// own header prose explains this design choice using that exact phrase.
const sqlWithoutComments = sql
  .split("\n")
  .filter((line) => !line.trim().startsWith("--"))
  .join("\n");
check("migration contains no ON CONFLICT DO UPDATE in executable SQL", !/on conflict[\s\S]*?do update/i.test(sqlWithoutComments));

// 7. Migration is explicitly marked NOT APPLIED and scoped to insert-only against ali_passage_bank.
check("migration header discloses NOT APPLIED", /NOT APPLIED/.test(sql));
check("migration contains exactly one INSERT statement, targeting ali_passage_bank only", (sql.match(/^insert into/gim) || []).length === 1 && /insert into public\.ali_passage_bank/.test(sql));
check("migration touches no other table (no other 'insert into'/'update '/'delete from' statement)", !/\bupdate\s+public\./i.test(sql) && !/delete from/i.test(sql));

console.log(`\n${problems === 0 ? "MIGRATION 241 STATIC VALIDATION: PASS" : `MIGRATION 241 STATIC VALIDATION: FAIL (${problems} problems)`}`);
process.exit(problems === 0 ? 0 : 1);
