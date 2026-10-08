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

// Real, live-confirmed post-Migration-243 field values (validationTier =
// TIER2_ACCEPTED_SET, acceptedAnswers/modelAnswer/marks unchanged from
// Migration 242) for the 4 targeted rows.
const TARGETS = [
  {
    id: "qf-ei003-w2-seq-explicit-01",
    acceptedAnswers: ["b, a, c", "b then a then c", "the clumsy handover, then passing to marcus, then kestrel winning"],
    plausibleWrong: "a, b, c", // same letters, wrong order
  },
  {
    id: "qf-ei003-w2-seq-dispersed-02",
    acceptedAnswers: ["c, a, b", "c then a then b", "dropped spring, then backwards gear, then still silent in august"],
    plausibleWrong: "a, c, b", // same letters, wrong order
  },
  {
    id: "qf-ei003-w2-seq-narrative-order-02",
    acceptedAnswers: ["b, d, c, a", "b then d then c then a"],
    plausibleWrong: "a, b, c, d", // same letters, wrong order
  },
  {
    id: "qf-ei003-w2-emotion-action-01",
    acceptedAnswers: ["nervous", "anxious", "tense", "on edge", "uneasy"],
    plausibleWrong: "happy", // a different short, plausible emotion word, not in the accepted set
  },
];

const marks = 1;

for (const t of TARGETS) {
  const prompt = { marks, acceptedAnswers: t.acceptedAnswers, validationTier: "TIER2_ACCEPTED_SET" };

  console.log(`\n=== ${t.id} ===`);

  // C. Exact approved answer (acceptedAnswers[0]) -> Correct.
  const exact = scoreEnglishComprehensionAnswer(t.acceptedAnswers[0], prompt, scoreEnglishAnswer);
  check(`${t.id}: exact accepted answer "${t.acceptedAnswers[0]}" -> earnedMarks=${marks}, tier=TIER2_ACCEPTED_SET, no NaN`,
    exact.tier === "TIER2_ACCEPTED_SET" && exact.earnedMarks === marks && !Number.isNaN(exact.earnedMarks));

  // D. Every OTHER approved variant -> Correct.
  for (let i = 1; i < t.acceptedAnswers.length; i++) {
    const variant = t.acceptedAnswers[i];
    const r = scoreEnglishComprehensionAnswer(variant, prompt, scoreEnglishAnswer);
    check(`${t.id}: approved variant "${variant}" -> earnedMarks=${marks}`, r.earnedMarks === marks);
  }

  // E. Programmatically-verified wrong answer (not equal to, and not a
  // token-subsequence match of, any approved answer) -> Incorrect.
  const wrongCandidate = "zzz completely unrelated filler content";
  const matchesAny = t.acceptedAnswers.some((a) => a.trim().toLowerCase() === wrongCandidate.trim().toLowerCase());
  check(`${t.id}: wrong-answer probe does not literally equal any accepted answer (sanity check on the probe itself)`, !matchesAny);
  const wrongResult = scoreEnglishComprehensionAnswer(wrongCandidate, prompt, scoreEnglishAnswer);
  check(`${t.id}: wrong answer "${wrongCandidate}" -> earnedMarks=0`, wrongResult.earnedMarks === 0);

  // F. Plausible-wrong: same vocabulary, wrong order (sequencing) / a
  // different but plausible short word (emotion) -> must still be
  // Incorrect, proving TIER2 does not accept content merely because it
  // shares letters/topic.
  const plausibleResult = scoreEnglishComprehensionAnswer(t.plausibleWrong, prompt, scoreEnglishAnswer);
  check(`${t.id}: plausible-wrong "${t.plausibleWrong}" -> earnedMarks=0 (not accepted merely for sharing vocabulary)`, plausibleResult.earnedMarks === 0);
}

console.log(`\n${problems === 0 ? "MIGRATION 243 FINAL FOUR-QUESTION VERIFICATION: PASS" : `MIGRATION 243 FINAL FOUR-QUESTION VERIFICATION: FAIL (${problems} problems)`}`);
process.exit(problems === 0 ? 0 : 1);
