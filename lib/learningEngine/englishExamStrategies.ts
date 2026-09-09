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
  // Educational Increment 003, Wave 2 -- these 5 families had ZERO
  // exam-strategy or worked-example coverage before this wave (confirmed
  // live this session).
  "wave3-fam-rc06-sequencing":
    "Look for time-order clues (numbers, 'first'/'then'/'by the end') scattered through the passage, not just one tidy list -- the order you need might be spread across several paragraphs.",
  "wave3-fam-rc07-comparative":
    "Find the evidence for each side separately first, then put them side by side. Don't guess a difference before you've actually located both pieces of evidence.",
  "wave3-fam-rc08-emotion":
    "The feeling is never named outright in these questions -- look at what the character DOES or SAYS, not for an emotion word already sitting in the text.",
  "wave3-fam-rc10-atmosphere-mood":
    "Notice which senses the description uses (sight, sound, touch) and whether several small details all point the same way -- one detail alone is rarely the whole answer.",
  "wave3-fam-rc10-word-choice":
    "Ask why THIS word and not an ordinary one that means almost the same thing. The gap between the two tells you what the writer wanted you to notice.",
  // Educational Increment 003, Wave 3 -- these 4 families had ZERO
  // exam-strategy or worked-example coverage before this wave (confirmed
  // live this session).
  "wave3-fam-rc01-retrieval":
    "Decide exactly what fact the question wants BEFORE you search. Find that specific detail in the passage and check it actually answers the question, rather than the first plausible-sounding line you spot.",
  "wave1-fam-comparative-extraction":
    "Work out exactly WHAT is being compared (two people? two moments? two places?) before you search. Find evidence for each side separately, then put them side by side.",
  "wave1-fam-motive-inference":
    "Never guess a motive out of thin air. Find the specific action or line that prompted the question, then ask what real evidence in the text points to WHY.",
  "wave1-fam-effect-of-language":
    "Ask what the word or phrase actually pictures or suggests, then ask why the writer picked that word rather than a plainer one. The effect is the gap between the two.",
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
  // Educational Increment 003, Wave 2 -- these 5 families had ZERO
  // ENGLISH_FAMILY_WORKED_EXAMPLE coverage before this wave (confirmed
  // live: 1/2/2/6/12 rows respectively, none with any worked example).
  // All five use the SAME Founder-specified inference model -- What does
  // the text SAY? -> What evidence matters? -> What does that evidence
  // SUGGEST? -> Which interpretation fits BEST? -> How can I justify it?
  // -- tailored per family's own real reasoning demand. Every scenario
  // below is safe and separate from all 40 real Wave 2 candidates.
  "wave3-fam-rc06-sequencing": {
    scenario:
      "Imagine a passage: 'Maya had wanted a vegetable patch for years. In March, she finally dug over a corner of the garden. The seedlings she'd started on the windowsill back in January went in during April, once the frost risk had passed.'",
    modelReasoning:
      "Time-order words and dates are often scattered through a passage, not given as a tidy list -- collect every time marker first, then work out the real order, rather than trusting the order things are mentioned in.",
    fiveStepModel: [
      "What does the text SAY? Three months are named: January (seedlings started), March (patch dug), April (seedlings planted out).",
      "What evidence matters? The dates themselves, not the order the sentences appear in -- January is mentioned in the middle of the passage, not first.",
      "What does that evidence SUGGEST? The real order is January, then March, then April -- different from the order the sentences are written in.",
      "Which interpretation fits BEST? Starting seedlings (January) must come before digging the patch (March) and before planting out (April), since a seedling needs to exist before it can be planted.",
      "How can I justify it? Point to the actual month named for each event, not to where each sentence sits in the paragraph.",
    ],
    weakAnswerLooksLike: "Assuming events happened in the order the sentences are written, without checking the actual time markers given for each one.",
    whatImprovesIt: "Collecting every date/time clue first, then building the real order from those clues alone, independent of sentence order.",
  },
  "wave3-fam-rc07-comparative": {
    scenario:
      "Imagine a passage: 'When the fire alarm rang, Leo grabbed his bag and walked calmly to the door. Amara froze for a second before following, glancing back twice at her desk on the way out.'",
    modelReasoning:
      "Find the evidence for each person separately first -- write down what each one actually does -- before trying to say what the difference between them is.",
    fiveStepModel: [
      "What does the text SAY? Leo grabs his bag and walks calmly. Amara freezes, then follows, glancing back twice.",
      "What evidence matters? Leo's word 'calmly' and single smooth action; Amara's 'froze', plus the repeated glancing back.",
      "What does that evidence SUGGEST? Leo reacts with composure; Amara reacts with hesitation and lingering worry about what she's leaving behind.",
      "Which interpretation fits BEST? Leo is unbothered/practical, Amara is more anxious/reluctant to leave -- both readings are directly supported, not guessed.",
      "How can I justify it? Quote 'calmly' for Leo and 'froze... glancing back twice' for Amara -- two separate pieces of evidence, one for each person.",
    ],
    weakAnswerLooksLike: "Describing only one character in detail and guessing vaguely at the other, instead of finding real evidence for both sides of the comparison.",
    whatImprovesIt: "Locating specific evidence for EACH person or moment being compared, then stating the difference using both pieces of evidence, not just one.",
  },
  "wave3-fam-rc08-emotion": {
    scenario:
      "Imagine a passage: 'Ben's hand hovered over the phone three times before he finally pressed call. When it started ringing, he stood up, sat back down, then stood again.'",
    modelReasoning:
      "No feeling word appears anywhere in this description -- the emotion has to be built entirely from what the character physically does, not read off the page directly.",
    fiveStepModel: [
      "What does the text SAY? Ben hesitates over the phone three times, then after calling, stands up and sits down repeatedly.",
      "What evidence matters? The repeated hesitation before calling, and the restless standing/sitting once it starts ringing.",
      "What does that evidence SUGGEST? Repeated hesitation and restless movement are both physical signs of nervousness, not calm or excitement.",
      "Which interpretation fits BEST? Ben is anxious or nervous about this phone call specifically -- not simply busy or bored, which wouldn't explain the hesitation.",
      "How can I justify it? Point to the specific actions -- hovering three times, standing and sitting repeatedly -- as the evidence, since no emotion word is stated.",
    ],
    weakAnswerLooksLike: "Searching the passage for a feeling word that isn't there, or guessing an emotion with no specific action or dialogue pointed to as evidence.",
    whatImprovesIt: "Naming the emotion AND pointing to the specific behaviour that justifies it, since the text itself never states the feeling directly.",
  },
  "wave3-fam-rc10-atmosphere-mood": {
    scenario:
      "Imagine a passage: 'The corridor smelled of old paint. Somewhere a tap dripped, steady and slow. Every few steps, a floorboard gave a small, tired creak, and the single bulb overhead flickered without ever quite going out.'",
    modelReasoning:
      "No single detail proves the mood on its own -- look for several small details that all point in the same direction before deciding what atmosphere they create together.",
    fiveStepModel: [
      "What does the text SAY? Old paint smell, a dripping tap, creaking floorboards, a flickering bulb.",
      "What evidence matters? All four details together, not just one -- each is small, but they repeat and accumulate across the description.",
      "What does that evidence SUGGEST? Decay, neglect, and slight unease -- nothing here suggests warmth, brightness, or comfort.",
      "Which interpretation fits BEST? An eerie, run-down atmosphere, built from several small sensory details rather than one dramatic image.",
      "How can I justify it? List more than one supporting detail (the smell, the drip, the creak, the flicker) -- a single quote wouldn't be enough evidence on its own for this kind of question.",
    ],
    weakAnswerLooksLike: "Quoting only one detail and treating it as the whole answer, when the real atmosphere is built from several details combined.",
    whatImprovesIt: "Identifying multiple details that build the SAME overall impression, and saying so explicitly, rather than resting the whole answer on one image.",
  },
  "wave3-fam-rc10-word-choice": {
    scenario:
      "Imagine a sentence: 'The old dog shuffled, rather than walked, across the kitchen floor.'",
    modelReasoning:
      "Ask what an ordinary, more neutral word would have suggested instead, and what is different or more specific about the word the writer actually chose.",
    fiveStepModel: [
      "What does the text SAY? The dog 'shuffled' rather than 'walked' across the floor.",
      "What evidence matters? The writer explicitly contrasts 'shuffled' with the plainer word 'walked' in the same sentence.",
      "What does that evidence SUGGEST? 'Shuffled' suggests slow, dragging, effortful movement -- something 'walked' would not capture on its own.",
      "Which interpretation fits BEST? The word choice emphasises the dog's age or tiredness, not simple ordinary movement.",
      "How can I justify it? Compare the chosen word directly against the plainer alternative the sentence itself names, and explain what extra meaning the chosen word adds.",
    ],
    weakAnswerLooksLike: "Saying only that the word 'sounds descriptive' without explaining what it specifically adds compared to a plainer alternative.",
    whatImprovesIt: "Naming the more ordinary alternative word, then explaining precisely what extra meaning or feeling the writer's actual choice adds that the alternative would not.",
  },
  // Educational Increment 003, Wave 3 -- retrieval and comparative-
  // extraction share the SAME five-step model (Founder-specified): both
  // are fundamentally about locating and precisely reading real, stated
  // passage content, not inferring anything beyond it.
  "wave3-fam-rc01-retrieval": {
    scenario: "Imagine a passage where a character checks the time, then later mentions missing the 4 o'clock train because of it.",
    modelReasoning: "Decide precisely what the question is asking for before searching, then locate that exact detail in the passage and check it genuinely answers what was asked -- not just the first sentence that looks related.",
    fiveStepModel: [
      "What information do I need? Exactly what time the character missed the train, not just that they were late.",
      "Where is the evidence? Later in the passage, near where the missed train is mentioned -- not necessarily near the first time-check.",
      "What does it actually say? The passage states the exact time the train left.",
      "Which detail answers the question? Only the specific train time -- not the earlier, unrelated time-check.",
      "Check. Re-read the question once more against the exact detail chosen, to confirm it is the precise fact asked for, not a nearby distractor.",
    ],
    weakAnswerLooksLike: "Answering with the first time-related detail found, without checking it is the one the question actually asks for.",
    whatImprovesIt: "Identifying precisely what the question needs before searching, then confirming the chosen detail matches that need exactly.",
  },
  "wave1-fam-comparative-extraction": {
    scenario: "Imagine a passage where one character calmly waits out a delay and another paces anxiously, checking their phone repeatedly.",
    modelReasoning: "Work out exactly what is being compared -- two characters? one character at two moments? two places? -- then find evidence for each side separately before combining them.",
    fiveStepModel: [
      "What information do I need? Evidence of how each character behaves during the delay, for both sides of the comparison.",
      "Where is the evidence? One description for the calm character, a separate description for the anxious one, often in different parts of the passage.",
      "What does it actually say? The passage states specific actions for each -- waiting calmly versus pacing and checking a phone.",
      "Which detail answers the question? The specific contrasting actions for each side, not a general impression of 'one is calmer'.",
      "Check. Confirm both halves of the comparison have their own real evidence, not just the more obvious or dramatic side.",
    ],
    weakAnswerLooksLike: "Describing one side of the comparison in detail and the other side only vaguely or not at all.",
    whatImprovesIt: "Finding specific, separate evidence for each side of the comparison before writing the final answer.",
  },
  "wave1-fam-motive-inference": {
    scenario: "Imagine a character who offers to carry the heaviest bag without being asked, then quickly changes the subject when thanked.",
    modelReasoning: "Start from the specific action or line the question is about, find the real evidence around it, and reason towards the motive that evidence actually supports -- never guess a motive with no textual evidence behind it.",
    fiveStepModel: [
      "What happened? The character volunteers to carry the heaviest bag, then deflects when thanked.",
      "What evidence matters? Both parts together -- the unprompted offer AND the discomfort with being thanked.",
      "What does it suggest? That the character wanted to help without wanting attention or praise for it.",
      "Which motive fits best? Genuine, quiet helpfulness -- not, for example, showing off, since showing off would welcome the thanks rather than deflect it.",
      "Justify. Point to both the offer and the deflection as the two pieces of evidence supporting that specific motive, not just one of them.",
    ],
    weakAnswerLooksLike: "Naming a plausible-sounding motive ('he wanted to be helpful') without connecting it to a specific piece of evidence in the text.",
    whatImprovesIt: "Naming the exact action or line first, then explaining precisely what about it supports the chosen motive.",
  },
  "wave1-fam-effect-of-language": {
    scenario: "Imagine a sentence: 'The old gate didn't open, it groaned open, as if it hadn't moved in years.'",
    modelReasoning: "Identify the specific word or phrase, work out what it means and suggests in this exact sentence, then explain why the writer chose it over a plainer alternative and what effect that creates.",
    fiveStepModel: [
      "Which word/phrase? 'Groaned', used instead of the plainer word 'opened'.",
      "What does it mean here? A groan is normally a sound a person or animal makes when in discomfort.",
      "What does it suggest? Applying a human-like sound to the gate suggests it is old, stiff, and reluctant to move -- not simply that it opened.",
      "Why did the writer choose it? A gate 'groaning' does more work than a gate that just 'opened' -- it adds sound, age, and a sense of effort in one word.",
      "What effect does it create? It makes the gate feel almost alive and worn out, reinforcing the sense that it hasn't moved in a long time -- exactly what the rest of the sentence confirms.",
    ],
    weakAnswerLooksLike: "Saying the word 'makes it more descriptive' without naming the specific meaning, connotation, or effect it adds.",
    whatImprovesIt: "Naming precisely what the chosen word suggests (sound, age, human-like quality) and connecting that directly to the effect it creates.",
  },
};

export function getWorkedExample(familyId?: string | null): WorkedExample | undefined {
  if (!familyId) return undefined;
  return ENGLISH_FAMILY_WORKED_EXAMPLE[familyId];
}
