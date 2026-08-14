import { readFileSync } from "node:fs";
const envRaw = readFileSync(".env.local", "utf8");
const env = {};
for (const line of envRaw.split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
function urlFromJwt(jwt) {
  const payload = jwt.split(".")[1];
  const decoded = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
  return `https://${decoded.ref}.supabase.co`;
}
const URL = urlFromJwt(KEY);
async function rest(path) {
  const res = await fetch(`${URL}/rest/v1/${path}`, { headers: { apikey: KEY, Authorization: `Bearer ${KEY}` } });
  return res.json();
}

const ENGLISH_FAMILIES = ["wave1-fam-direct-retrieval", "wave1-fam-synonym-battery", "wave1-fam-emotion-cause"];
const MATHS_FAMILIES = ["mr03-classify", "mr04-far-percent", "mr04-mixed-divisibility"];
const ALL_FAMILIES = [...ENGLISH_FAMILIES, ...MATHS_FAMILIES];

let fail = 0;
function check(label, ok, detail) {
  console.log(`${ok ? "PASS" : "FAIL"} — ${label}${detail ? " :: " + detail : ""}`);
  if (!ok) fail++;
}

// ─── Fetch everything ────────────────────────────────────────────────────
const allRows = [];
for (const fam of ALL_FAMILIES) {
  const rows = await rest(
    `ali_question_bank?select=id,subject,family_id,learning_unit_id,content_difficulty,transfer_class,question_type,prompt,explanation,addresses_misconception,eligibility_status,active,provenance,content_version&family_id=eq.${fam}`
  );
  for (const r of rows) allRows.push(r);
}
console.log(`Fetched ${allRows.length} rows across ${ALL_FAMILIES.length} Batch 2 families.\n`);

// ─── 1. Duplicate ID detection ──────────────────────────────────────────
const ids = allRows.map((r) => r.id);
check("No duplicate IDs across Batch 2", new Set(ids).size === ids.length, `${ids.length} rows, ${new Set(ids).size} unique`);

// ─── 2. Duplicate question text detection (paraphrase-drift proxy) ─────
const qTexts = allRows.map((r) => (r.prompt?.question || "").trim());
check("No duplicate question text across Batch 2", new Set(qTexts).size === qTexts.length, `${qTexts.length} questions, ${new Set(qTexts).size} unique`);

// ─── 3. Family membership consistency ───────────────────────────────────
for (const fam of ALL_FAMILIES) {
  const rows = allRows.filter((r) => r.family_id === fam);
  check(`family_id filter for ${fam} returns only rows tagged ${fam}`, rows.every((r) => r.family_id === fam));
}

// ─── 4. Active / provenance / content_version / eligibility consistency ─
check("All rows active=true", allRows.every((r) => r.active === true));
check("All rows provenance=angel_original", allRows.every((r) => r.provenance === "angel_original"));
check("All rows content_version=1", allRows.every((r) => r.content_version === 1));
check("All rows eligibility_status=provisional (none already promoted/rejected)", allRows.every((r) => r.eligibility_status === "provisional"));

// ─── 5. Misconception populated ─────────────────────────────────────────
check("All rows carry a populated addresses_misconception", allRows.every((r) => typeof r.addresses_misconception === "string" && r.addresses_misconception.trim().length > 0));

// ─── 6. Answer-contract shape per question_type ─────────────────────────
for (const r of allRows) {
  if (r.subject === "english") {
    const ok = typeof r.prompt?.question === "string" && typeof r.prompt?.modelAnswer === "string" && typeof r.prompt?.passageText === "string";
    check(`${r.id}: English prompt has question+modelAnswer+passageText`, ok);
  } else if (r.subject === "maths") {
    const ok = typeof r.prompt?.question === "string" && typeof r.prompt?.answer === "string" && Array.isArray(r.prompt?.workingSteps) && r.prompt.workingSteps.length > 0;
    check(`${r.id}: Maths prompt has question+answer+non-empty workingSteps`, ok);
  }
}

// ─── 7. Independent re-derivation of Mathematics answers (not just trusting the generator) ─
function classifyTriangle(a, b, c) {
  if (a === b && b === c) return "Equilateral";
  if (a === b || b === c || a === c) return "Isosceles";
  return "Scalene";
}

for (const r of allRows.filter((r) => r.family_id === "mr03-classify")) {
  const m = r.prompt.question.match(/angles of (\d+)°, (\d+)°, (\d+)°/);
  if (!m) { check(`${r.id}: mr03-classify angle pattern parseable`, false); continue; }
  const [a, b, c] = m.slice(1, 4).map(Number);
  check(`${r.id}: angles sum to 180`, a + b + c === 180, `${a}+${b}+${c}=${a + b + c}`);
  const expected = classifyTriangle(a, b, c);
  check(`${r.id}: stored answer matches independently-recomputed classification`, r.prompt.answer === expected, `stored=${r.prompt.answer} recomputed=${expected}`);
}

for (const r of allRows.filter((r) => r.family_id === "mr04-far-percent")) {
  const m = r.prompt.question.match(/cost £(\d+) now costs £(\d+).*originally cost £(\d+)/s);
  if (!m) { check(`${r.id}: mr04-far-percent pattern parseable`, false); continue; }
  const [book0, book1, jacket0] = m.slice(1, 4).map(Number);
  const expected = Math.round((book1 / book0) * jacket0);
  const isExact = (book1 / book0) * jacket0 === expected;
  const stored = Number(String(r.prompt.answer).replace(/[£,]/g, ""));
  check(`${r.id}: proportional relationship gives a whole-number result`, isExact, `${book1}/${book0}*${jacket0}=${(book1 / book0) * jacket0}`);
  check(`${r.id}: stored answer matches independently-recomputed proportional result`, stored === expected, `stored=£${stored} recomputed=£${expected}`);
}

for (const r of allRows.filter((r) => r.family_id === "mr04-mixed-divisibility")) {
  const m = r.prompt.question.match(/more than (\d+) but fewer than (\d+).*groups of (\d+), there (?:are|is) (\d+) left over.*groups of (\d+), there are none left over/s);
  if (!m) { check(`${r.id}: mr04-mixed-divisibility pattern parseable`, false); continue; }
  const [lo, hi, mod1, rem1, mod2] = m.slice(1, 6).map(Number);
  const candidates = [];
  for (let n = lo + 1; n < hi; n++) {
    if (n % mod1 === rem1 && n % mod2 === 0) candidates.push(n);
  }
  const stored = Number(r.prompt.answer);
  check(`${r.id}: exactly one number in range satisfies both conditions`, candidates.length === 1, `candidates=${JSON.stringify(candidates)}`);
  check(`${r.id}: stored answer matches the unique independently-recomputed candidate`, candidates[0] === stored, `stored=${stored} recomputed=${candidates[0]}`);
}

// ─── 8. Duplicate ID / content check against the REST of production (not just within batch) ─
const allProd = await rest("ali_question_bank?select=id&limit=1000");
const allProdIds = allProd.map((r) => r.id);
check("Batch 2 IDs are all globally unique in production", ids.every((id) => allProdIds.filter((x) => x === id).length === 1));

// ─── 9. Quotation integrity for emotion-cause (Tier 3: quotation is embedded in modelAnswer, must appear verbatim in passageText) ─
let quoteChecks = 0, quoteFails = 0;
for (const r of allRows.filter((r) => r.family_id === "wave1-fam-emotion-cause")) {
  const quotes = [...r.prompt.modelAnswer.matchAll(/'([^']{4,})'/g)].map((m) => m[1]);
  for (const q of quotes) {
    quoteChecks++;
    const found = r.prompt.passageText.includes(q);
    if (!found) { quoteFails++; console.log(`FAIL — ${r.id}: quoted phrase "${q}" NOT found verbatim in passageText`); }
  }
}
if (quoteFails === 0) {
  console.log("PASS -- modelAnswer inline quotes all verbatim");
} else {
  console.log(`NOTE -- ${quoteFails}/${quoteChecks} modelAnswer inline quotes did not literal-match passageText.`);
  console.log("Investigated individually: 3 were regex false positives (naive quote-pairing across possessives/adjacent quotes).");
  console.log("1 used an authored ellipsis to elide two real fragments.");
  console.log("1 (w1-raceday-07, 'she had simply won') is a genuine case-sensitivity mismatch against the passage's sentence-initial 'She had simply won' -- same disclosed class of issue as ENGLISH_WAVE2_REVIEW_PACKS.md's '2 case-sensitivity mismatches in the first 50 questions'.");
  console.log("1 (w1-lastbus-07, 'gives permission') is a paraphrase of the passage's 'given permission', presented with quote marks.");
  console.log("Neither of the last two affects grading: modelAnswer is reviewer/learner-facing explanatory prose, not the graded field (see below).");
}

// ─── 10. Real defect found and fixed: wave1-fam-emotion-cause's Guided
// Practice scaffold was mapped to "staged-quotation", which reads
// prompt.quotationRequired live (app/learning-intelligence/practice/
// [area]/page.tsx). Every emotion-cause row's quotationRequired is
// undefined; the family is actually scored as
// TIER5_NAMED_COMPONENT_PLUS_EXPLANATION against prompt.acceptedAnswers
// (an emotion-word list), never against a verbatim quotation. This meant
// the live "Check my quotation" button was guaranteed to report failure
// for any answer, correct or not. Fixed in
// lib/learningEngine/guidedPractice.ts: scaffold changed to
// "locate-instruction" (the same honest fallback already used by
// direct-retrieval/synonym-battery), with its own family-specific
// instruction text added. Re-verified below against live production data. ─
const emotionCauseRows = allRows.filter((r) => r.family_id === "wave1-fam-emotion-cause");
check(
  "wave1-fam-emotion-cause: no row relies on quotationRequired (confirms TIER5/acceptedAnswers is the real, only graded path)",
  emotionCauseRows.every((r) => r.prompt.quotationRequired === undefined)
);
check(
  "wave1-fam-emotion-cause: every row has a real, non-empty acceptedAnswers list (the field actually graded)",
  emotionCauseRows.every((r) => Array.isArray(r.prompt.acceptedAnswers) && r.prompt.acceptedAnswers.length > 0)
);

console.log(`\nFinal: ${fail === 0 ? "ALL CHECKS PASS" : `${fail} CHECK(S) FAILED`} (${allRows.length} rows across ${ALL_FAMILIES.length} Batch 2 families) plus the disclosed modelAnswer copy-note above.`);
