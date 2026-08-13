/**
 * Educational Increment 007B, Part 6 — surfaces ENGLISH_WAVE1_TEACHING_
 * CARDS_V1.md's "F. Efficient exam method" line for each question family
 * into the live learner journey, in plain, age-appropriate language with
 * no internal terminology (family_id itself is never shown to a learner —
 * only used as the lookup key). Condensed from the teaching cards, not a
 * new invention; keep both in sync if either changes.
 */
export const ENGLISH_FAMILY_EXAM_STRATEGY: Record<string, string> = {
  "wave1-fam-direct-retrieval":
    "Find the key word from the question in the passage, then check the sentence around it actually answers what was asked.",
  "wave1-fam-vocab-explain":
    "Cover the tricky word and read the sentence around it. Is it a feeling, an action, or a description? That's your clue.",
  "wave1-fam-synonym-battery":
    "Go straight to the line number given. Don't rely on memory of the whole passage.",
  "wave1-fam-tick-justify":
    "Decide your answer first from a quick overall impression, then go back and find evidence specifically for that side.",
  "wave1-fam-quote-explain":
    "Find the exact words first. Then ask yourself 'so what does this show?' before you write your explanation.",
  "wave1-fam-sequencing":
    "Re-read the passage once in order, ticking off each thing as you find it, rather than trying to remember the order.",
  "wave1-fam-two-character":
    "Treat it as two mini-answers in one: find evidence for the first person, then separate evidence for the second.",
  "wave1-fam-emotion-cause":
    "Find the exact moment in the question first, then look right around it for what caused the feeling.",
  // Educational Increment 007C — new family, condensed from
  // ENGLISH_WAVE2_TEACHING_CARDS_V1.md.
  "wave2-fam-multiselect":
    "Check off each option against the passage one at a time. Only tick exactly the number you're asked for: ticking extra loses all the marks for that question, even if some of your ticks were right.",
};

export function getExamStrategyHint(familyId?: string | null): string | undefined {
  if (!familyId) return undefined;
  return ENGLISH_FAMILY_EXAM_STRATEGY[familyId];
}

/**
 * MODEL step (Educational Increment 007C, Part 7) — a bounded worked
 * example per priority family, shown before a first attempt rather than
 * only a strategy reminder. Uses SAFE teaching examples, never a live
 * independent-practice question or its exact wording, per explicit
 * instruction. Scoped to the 3 families 007B/007C named as priorities
 * (multi-select, two-character, sequencing) plus quote-explain (the
 * single most frequent CSSE pattern) — not all 9 families, disclosed
 * honestly as a foundation, not complete coverage.
 */
export interface WorkedExample {
  scenario: string;
  modelReasoning: string;
  weakAnswerLooksLike: string;
  whatImprovesIt: string;
}

export const ENGLISH_FAMILY_WORKED_EXAMPLE: Partial<Record<string, WorkedExample>> = {
  "wave2-fam-multiselect": {
    scenario: "Imagine a short passage about a boy called Sam tidying his room, then tick 4 boxes describing what he actually did.",
    modelReasoning: "Go through the 8 options one at a time, checking each against the passage. Tick an option only if the passage directly says or clearly shows that thing happened.",
    weakAnswerLooksLike: "Ticking 5 boxes because several of them 'sound plausible', without checking each one against the text.",
    whatImprovesIt: "Ticking exactly 4, each one checked individually against a specific sentence in the passage, not against a general impression.",
  },
  "wave1-fam-two-character": {
    scenario: "Imagine a passage where one character rushes to finish a race and another strolls, unbothered, to the same finish line.",
    modelReasoning: "Note evidence for the first character's attitude and actions, then separately note evidence for the second. The answer needs both halves, not just the more obvious one.",
    weakAnswerLooksLike: "Writing three sentences about the rushing character and one vague sentence about the other.",
    whatImprovesIt: "Roughly equal, specific evidence for each character, with the contrast between them made explicit.",
  },
  "wave1-fam-sequencing": {
    scenario: "Imagine a passage describing someone's morning: waking up, making breakfast, then leaving for school.",
    modelReasoning: "Re-read the passage once, in order, and tick off each requested event as you reach it in the text, rather than trying to recall the order from memory.",
    weakAnswerLooksLike: "Listing the right three events but in an order based on what feels most natural, not what the passage actually says.",
    whatImprovesIt: "Checking each event's position against the passage text directly before writing the final order.",
  },
  "wave1-fam-quote-explain": {
    scenario: "Imagine a passage where a character's hands are described as shaking as they open a letter.",
    modelReasoning: "First find the exact words ('her hands were shaking'). Then ask: what does this specific detail show, and why does it matter for the question asked?",
    weakAnswerLooksLike: "Quoting the right words but then just restating them in different words, without explaining what they reveal.",
    whatImprovesIt: "Naming the feeling or idea the quotation reveals, and connecting it clearly back to the question.",
  },
};

export function getWorkedExample(familyId?: string | null): WorkedExample | undefined {
  if (!familyId) return undefined;
  return ENGLISH_FAMILY_WORKED_EXAMPLE[familyId];
}
