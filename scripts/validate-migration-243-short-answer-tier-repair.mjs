import fs from "node:fs";
import { scoreEnglishComprehensionAnswer } from "../lib/learningEngine/englishAnswerValidation.ts";
import { scoreEnglishAnswer } from "../lib/learningEngine/practiceContent.ts";

let problems = 0;
function check(label, cond) {
  if (cond) console.log(`PASS: ${label}`);
  else {
    problems++;
    console.log(`FAIL: ${label}`);
  }
}

const sql = fs.readFileSync(new URL("../supabase/migrations/243_ei003_wave2_short_answer_tier_repair.sql", import.meta.url), "utf8");

const TARGETS = [
  { id: "ei003-w2-seq-explicit-01", acceptedAnswers: ["b, a, c", "b then a then c", "the clumsy handover, then passing to marcus, then kestrel winning"], correct: "b, a, c", wrong: "totally different wrong sequence entirely" },
  { id: "ei003-w2-seq-dispersed-02", acceptedAnswers: ["c, a, b", "c then a then b", "dropped spring, then backwards gear, then still silent in august"], correct: "c, a, b", wrong: "totally different wrong sequence entirely" },
  { id: "ei003-w2-seq-narrative-order-02", acceptedAnswers: ["b, d, c, a", "b then d then c then a"], correct: "b, d, c, a", wrong: "totally different wrong sequence entirely" },
  { id: "ei003-w2-emotion-action-01", acceptedAnswers: ["nervous", "anxious", "tense", "on edge", "uneasy"], correct: "nervous", wrong: "excited and thrilled" },
];

check("exactly 4 target candidates", TARGETS.length === 4);

for (const t of TARGETS) {
  const qid = `qf-${t.id}`;
  check(`migration references ${qid}`, sql.includes(`'${qid}'`));
}

check("migration contains exactly 4 UPDATE statements", (sql.match(/^update public\.ali_question_bank$/gim) || []).length === 4);
check("no destructive prompt rebuild (only || merges)", !/set prompt = jsonb_build_object/i.test(sql));
check("migration touches ali_question_bank only", !/update public\.(?!ali_question_bank)/i.test(sql));
check("migration contains no DELETE statement", !/delete from/i.test(sql));
check("migration header discloses NOT APPLIED", /NOT APPLIED/.test(sql));

// Deterministic proof, against the REAL imported scoring functions,
// that TIER2_ACCEPTED_SET resolves all 4 correct-answer cases and
// still correctly rejects a genuinely unrelated wrong answer for each.
let deterministicProblems = 0;
for (const t of TARGETS) {
  const prompt = { marks: 1, acceptedAnswers: t.acceptedAnswers, validationTier: "TIER2_ACCEPTED_SET" };
  const correctResult = scoreEnglishComprehensionAnswer(t.correct, prompt, scoreEnglishAnswer);
  const wrongResult = scoreEnglishComprehensionAnswer(t.wrong, prompt, scoreEnglishAnswer);
  const ok = correctResult.tier === "TIER2_ACCEPTED_SET" && correctResult.earnedMarks === 1 && wrongResult.earnedMarks === 0;
  if (!ok) {
    deterministicProblems++;
    console.log(`DETERMINISTIC FAIL: ${t.id} -> correct=${correctResult.earnedMarks} wrong=${wrongResult.earnedMarks} tier=${correctResult.tier}`);
  }
}
check(`deterministic scoring proof: 4/4 correct-answer full marks, 4/4 wrong-answer zero marks (found ${4 - deterministicProblems}/4 passing)`, deterministicProblems === 0);

console.log(`\n${problems === 0 ? "MIGRATION 243 VALIDATION: PASS" : `MIGRATION 243 VALIDATION: FAIL (${problems} problems)`}`);
process.exit(problems === 0 ? 0 : 1);
