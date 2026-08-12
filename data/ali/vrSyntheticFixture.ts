import type { BankQuestion } from "@/types/ali/questionBank";

/**
 * SYNTHETIC / DEV-ONLY FIXTURE — NOT REAL PRODUCTION CONTENT.
 *
 * Fabricated question metadata used to develop and test lib/ali/* and
 * lib/adaptiveMockBuilder.ts in parallel with the real 52-question hand-
 * tagging pass (ALI_DECISION_LOG.md Decision 5 / QUESTION_AUTHORING_
 * STANDARD.md §1.5's "safe to unblock code work" path). This fixture is
 * NOT the result of the human authoring process the standard requires for
 * real content — it exists only to give lib/ali/selection.ts,
 * lib/ali/mastery.ts, and lib/adaptiveMockBuilder.ts real data shapes to
 * run against before ali_question_bank has real hand-tagged rows.
 *
 * Swap this out for the real hand-tagged import before Slice 1 is
 * considered validated (ADAPTIVE_ASSESSMENT_ENGINE_IMPLEMENTATION_PLAN.md
 * §6.3). IDs are prefixed "synthetic-" so they can never collide with real
 * `vr-0xx` question IDs.
 *
 * 16 questions: 4 per difficulty tier, spanning 4 competency codes so
 * selection/weak-skill/mastery logic has enough variety to exercise all
 * code paths (QUESTION_AUTHORING_STANDARD.md §3 competency taxonomy).
 */

function fixture(
  id: string,
  skill: string,
  contentDifficulty: BankQuestion["contentDifficulty"],
  question: string,
  answer: string,
  explanation: string,
  masteryThreshold: number
): BankQuestion {
  return {
    id,
    subject: "verbal-reasoning",
    skill,
    pathway: ["gl"],
    contentDifficulty,
    learningUnitId: id, // Learning Unit = Question for VR (ALI_DECISION_LOG.md Decision 36)
    questionType: "short-answer",
    estimatedTimeSeconds: 30,
    prompt: {
      id,
      question,
      answer,
      explanation,
      category: skill,
      skill: "verbal-reasoning",
      marks: 1,
    },
    explanation,
    confidenceWeight: 1.0,
    revisionPriority: 3,
    masteryThreshold,
    usageCount: 0,
    avgSuccessRate: null,
  };
}

export const vrSyntheticFixture: BankQuestion[] = [
  // vr.analogies
  fixture("synthetic-vr-001", "vr.analogies", "easy", "Bird is to nest as bee is to ___", "hive", "A bird lives in a nest; a bee lives in a hive. Relationship: animal → its home.", 2),
  fixture("synthetic-vr-002", "vr.analogies", "medium", "Sculptor is to statue as baker is to ___", "bread", "A sculptor creates a statue; a baker creates bread. Relationship: creator → creation.", 2),
  fixture("synthetic-vr-003", "vr.analogies", "hard", "Thermometer is to temperature as scale is to ___", "weight", "A thermometer measures temperature; a scale measures weight. Relationship: instrument → what it measures.", 3),
  fixture("synthetic-vr-004", "vr.analogies", "challenge", "Cartographer is to map as lexicographer is to ___", "dictionary", "A cartographer creates maps; a lexicographer creates dictionaries. Relationship: specialist → their specialist output.", 3),

  // vr.letter-codes
  fixture("synthetic-vr-005", "vr.letter-codes", "easy", "If each letter shifts forward 1 place (A→B), what does CAT become?", "DBU", "C→D, A→B, T→U.", 2),
  fixture("synthetic-vr-006", "vr.letter-codes", "medium", "If each letter shifts back 3 places (D→A), what does FISH become?", "CFPE", "F→C, I→F, S→P, H→E.", 2),
  fixture("synthetic-vr-007", "vr.letter-codes", "hard", "In a code, PLUM = QNXQ. Using the same rule, what does BIRD become?", "CKUH", "Shift amounts increase by position (+1,+2,+3,+4): B→C, I→K, R→U, D→H.", 3),
  fixture("synthetic-vr-008", "vr.letter-codes", "challenge", "In a code, each letter is replaced by the letter that many places later, where the number of places equals that letter's position in the alphabet mod 5. Given this, what does JAM become?", "KCS", "J is 10th letter, 10 mod 5 = 5 → J+5=O... (illustrative synthetic example, not a real authored question).", 3),

  // vr.hidden-words
  fixture("synthetic-vr-009", "vr.hidden-words", "easy", "Find the 3-letter word hidden inside GARDEN.", "gar", "GAR appears consecutively at the start of GARden: illustrative synthetic example.", 2),
  fixture("synthetic-vr-010", "vr.hidden-words", "medium", "Find the 4-letter word hidden inside SCARLET.", "carl", "CARL appears consecutively inside sCARLet: illustrative synthetic example.", 2),
  fixture("synthetic-vr-011", "vr.hidden-words", "hard", "Find the 5-letter word hidden inside THRASHING.", "rashi", "Illustrative synthetic example, not a real dictionary word, used for fixture variety only.", 3),
  fixture("synthetic-vr-012", "vr.hidden-words", "challenge", "Find two different hidden words inside CARTHORSE, one at the start and one at the end.", "cart / horse", "CART at the start, HORSE at the end: illustrative synthetic example.", 3),

  // vr.sequences
  fixture("synthetic-vr-013", "vr.sequences", "easy", "What comes next: B, D, F, H, ?", "J", "Every other letter of the alphabet, skipping one each time.", 2),
  fixture("synthetic-vr-014", "vr.sequences", "medium", "What comes next: TWO, FOUR, SIX, ?", "EIGHT", "Even numbers written as words, increasing by 2 each time.", 2),
  fixture("synthetic-vr-015", "vr.sequences", "hard", "What comes next: AZ, CY, EX, ?", "GW", "First letter moves forward 2 places (A,C,E,G); second letter moves backward 1 place (Z,Y,X,W).", 3),
  fixture("synthetic-vr-016", "vr.sequences", "challenge", "What comes next: 2, 6, 12, 20, ?", "30", "Differences increase by 2 each time (4,6,8,10): n(n+1) pattern.", 3),
];
