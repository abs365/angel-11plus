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
  /**
   * Educational Increment 003, Wave 1 -- an optional, ORDERED breakdown for
   * families whose teaching gap is specifically about METHOD (how to find
   * and select evidence), not just an overall reasoning summary.
   * `modelReasoning` above remains a valid, complete one-paragraph summary
   * for every existing entry (this field is additive, never a replacement) --
   * a family populates this only when a precise, named step sequence is the
   * actual teaching requirement (e.g. direct-retrieval's Founder-specified
   * 5-step model: identify exactly what's asked -> locate the relevant
   * passage part -> distinguish direct evidence from inference -> select the
   * precise evidence -> give an appropriately precise response). Always
   * demonstrated on the SAFE, separate scenario above, never the live
   * question -- teaches the process, never gives the live answer.
   */
  fiveStepModel?: string[];
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
  // Educational Increment 007C, Part 3/7 — 5th priority family added to
  // MODEL coverage on completion (was 4 of 9; see ENGLISH_WAVE2_MODEL_
  // COVERAGE_AUDIT_V1.md for the full 9-family classification).
  "wave1-fam-vocab-explain": {
    scenario: "Imagine a sentence describing someone's walk as 'a determined trudge up the hill'.",
    modelReasoning: "Cover the tricky word ('trudge') with a finger and read the rest of the sentence. 'Determined' and 'up the hill' both suggest effort, so the word likely means a slow, effortful walk, not a light or easy one.",
    weakAnswerLooksLike: "Guessing a meaning that sounds similar to the word but isn't supported by the sentence around it, such as confusing 'trudge' with 'trek' as a place name rather than a way of walking.",
    whatImprovesIt: "Checking the guessed meaning actually fits back into the sentence sensibly, using only clues that are really there in the surrounding words.",
  },
  // Educational Increment 003, Wave 1 -- wave1-fam-direct-retrieval had ZERO
  // ENGLISH_FAMILY_WORKED_EXAMPLE coverage before this increment (confirmed
  // via a live production query: 34 rows, 5 blueprints, 18 passages, no
  // worked-example entry at all), despite being the family with the most
  // published rows of any English family. Uses the Founder-specified
  // precise 5-step model -- teaches METHOD, never gives the live answer.
  "wave1-fam-direct-retrieval": {
    scenario:
      "Imagine a passage that says: 'The lighthouse keeper checked the log book every evening at six o'clock, noting the wind speed and any passing ships.' The question asks: 'At what time did the lighthouse keeper check the log book?'",
    modelReasoning:
      "Work through the passage methodically: pin down exactly what the question wants, find the specific part of the passage that addresses it, check whether the answer is stated directly or needs inference, pick out only the precise words that answer it, then write a response that is exactly as precise as what's being asked -- no more, no less.",
    fiveStepModel: [
      "Identify exactly what's asked: the question wants a TIME, not a description of what he did or why.",
      "Locate the relevant part of the passage: the sentence naming a specific time is the one to focus on, not the whole paragraph.",
      "Distinguish direct evidence from inference: the passage states the time directly ('every evening at six o'clock') -- nothing needs to be worked out or guessed here.",
      "Select the precise evidence: the exact phrase 'six o'clock' is the answer -- not the surrounding detail about wind speed or passing ships.",
      "Give an appropriately precise response: state the time itself ('six o'clock'), not a full restatement of the sentence.",
    ],
    weakAnswerLooksLike: "Copying a whole sentence or paragraph around the answer, including details the question didn't ask for, or restating the question instead of the actual evidence.",
    whatImprovesIt: "Answering with only the specific fact asked for, taken directly from the passage, in a form that directly answers the question (a time, a name, a number, a single detail) rather than a longer quotation.",
  },
};

export function getWorkedExample(familyId?: string | null): WorkedExample | undefined {
  if (!familyId) return undefined;
  return ENGLISH_FAMILY_WORKED_EXAMPLE[familyId];
}
