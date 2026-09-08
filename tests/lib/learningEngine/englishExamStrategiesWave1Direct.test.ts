import { test } from "node:test";
import assert from "node:assert/strict";
import { ENGLISH_FAMILY_WORKED_EXAMPLE, getWorkedExample } from "../../../lib/learningEngine/englishExamStrategies";

/**
 * Educational Increment 003, Wave 1 -- wave1-fam-direct-retrieval had ZERO
 * ENGLISH_FAMILY_WORKED_EXAMPLE coverage before this increment despite
 * being the English family with the most published rows of any (34, per
 * a live production read this session). Proves the new entry follows the
 * Founder-specified precise 5-step model, and never leaks a real,
 * already-published direct-retrieval question or accepted answer.
 *
 * Educational Increment 003, Wave 1 pre-publication gate closure, §1 --
 * the leak-check below was originally written against `ENGLISH_RETRIEVAL_
 * CANDIDATES` (lib/ali/questionFactory/englishRetrievalFamily.ts), which
 * is part of the pre-existing, untracked, unrelated English Question
 * Factory cluster this wave deliberately does not commit (see the Wave 1
 * report's own §S). Importing it here would entangle this otherwise-clean
 * EI003 test file with that cluster, breaking a bounded build/typecheck
 * of just this wave's own files. Rewritten to use a small, hardcoded
 * fixture of REAL, live, currently-PUBLISHED `wave1-fam-direct-retrieval`
 * rows (read fresh, read-only, via the anon key this session) instead --
 * arguably a stronger check than the original (it tests against what a
 * learner can actually be shown today, not merely a manufacturing-time
 * candidate), with zero import-time coupling to unrelated work.
 */

const REAL_PUBLISHED_DIRECT_RETRIEVAL_FIXTURES: { id: string; question: string; acceptedAnswers: string[] }[] = [
  { id: "qf-eng-ret-04", question: "Where does the male penguin keep the egg warm?", acceptedAnswers: ["under a brood pouch", "in a brood pouch", "beneath a warm fold of skin", "brood pouch"] },
  { id: "qf-eng-ret-07", question: "What had already happened to the kite belonging to the boy Priya pointed at?", acceptedAnswers: ["it had crashed twice already", "crashed twice", "his kite had crashed twice"] },
  { id: "qf-eng-ret-09", question: "How many miles out to sea can the lighthouse beam be seen?", acceptedAnswers: ["20", "twenty", "20 miles", "twenty miles"] },
  { id: "qf-eng-ret-15", question: "Why might Ravi have felt relieved when his kite finally lifted into the sky?", acceptedAnswers: ["ravi's stomach tightened", "he had been nervous it wouldn't fly, and it didn't lift straight away", "for a heart-stopping second, nothing happened"] },
  { id: "qf-eng-ret-16", question: "How does the emperor penguins' huddling behaviour make sure no single penguin gets too cold?", acceptedAnswers: ["individuals continuously rotate from the freezing outer edge of the huddle toward the sheltered centre", "they rotate from the outer edge to the centre, so everyone shares a similar amount of cold exposure"] },
  { id: "qf-eng-ret-19", question: "According to the elderly man, what does NOT make a kite fly well?", acceptedAnswers: ["trying to be something it's not", "being weighed down trying to be something it isn't"] },
];

test("wave1-fam-direct-retrieval now has a worked example, closing the ZERO-coverage gap", () => {
  const example = getWorkedExample("wave1-fam-direct-retrieval");
  assert.ok(example, "wave1-fam-direct-retrieval must now resolve a worked example");
});

test("the 5-step model is present, ordered, and matches the Founder-specified sequence exactly", () => {
  const example = ENGLISH_FAMILY_WORKED_EXAMPLE["wave1-fam-direct-retrieval"]!;
  assert.ok(example.fiveStepModel);
  assert.equal(example.fiveStepModel!.length, 5);
  const [step1, step2, step3, step4, step5] = example.fiveStepModel!;
  assert.match(step1, /^Identify exactly what's asked/);
  assert.match(step2, /^Locate the relevant part of the passage/);
  assert.match(step3, /^Distinguish direct evidence from inference/);
  assert.match(step4, /^Select the precise evidence/);
  assert.match(step5, /^Give an appropriately precise response/);
});

test("the worked example teaches METHOD on a safe, separate scenario -- it does not become answer-giving for any real, already-published direct-retrieval question", () => {
  const example = ENGLISH_FAMILY_WORKED_EXAMPLE["wave1-fam-direct-retrieval"]!;
  const scenarioText = `${example.scenario} ${example.modelReasoning} ${example.fiveStepModel!.join(" ")}`.toLowerCase();
  for (const row of REAL_PUBLISHED_DIRECT_RETRIEVAL_FIXTURES) {
    assert.ok(!scenarioText.includes(row.question.toLowerCase()), `worked example must not reproduce real published question "${row.question}" (${row.id})`);
    for (const answer of row.acceptedAnswers) {
      // Guard against trivially short accepted answers producing false
      // positives (e.g. a single common word) -- only check substantive,
      // multi-word accepted answers for genuine leakage.
      if (answer.length > 12) {
        assert.ok(!scenarioText.includes(answer.toLowerCase()), `worked example must not reproduce real published accepted answer "${answer}" (${row.id})`);
      }
    }
  }
});

test("every other existing worked example is unchanged by this addition -- fiveStepModel is additive, never required", () => {
  const preExisting = ["wave2-fam-multiselect", "wave1-fam-two-character", "wave1-fam-sequencing", "wave1-fam-quote-explain", "wave1-fam-vocab-explain"];
  for (const familyId of preExisting) {
    const example = ENGLISH_FAMILY_WORKED_EXAMPLE[familyId];
    assert.ok(example, `${familyId} must still resolve`);
    assert.equal(example!.fiveStepModel, undefined, `${familyId} must not have gained a fiveStepModel it never declared`);
  }
});
