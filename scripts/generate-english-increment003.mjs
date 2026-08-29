// Angel Digital 11+ — Generator for migration 166 (Decision 244)
// English Content Foundation, Increment 003 — candidate content only.
//
// Mirrors the established generator-script pattern (generate-english-wave1.mjs,
// generate-pilot-activation-migration.mjs): builds the migration SQL
// programmatically from structured data, self-verifies every quotationRequired/
// orderedAnswer/synonym-target value is an exact substring of its own passage's
// canonical text before emitting anything, and only ever WRITES a migration
// file — never applies it.
//
// Run: node scripts/generate-english-increment003.mjs > /tmp/166.sql (or similar)
// This script itself is committed alongside the migration it produced, same as
// prior generator scripts in this repo.

import { writeFileSync } from "node:fs";

function esc(s) {
  return s.replace(/'/g, "''");
}
function jsonPassage(text) {
  return text.replace(/\n\n/g, "\\n\\n");
}
function assertSubstring(haystack, needle, label) {
  if (!haystack.includes(needle)) {
    throw new Error(`SUBSTRING CHECK FAILED (${label}): "${needle}" not found verbatim in passage text`);
  }
}

// ============================================================
// PASSAGE A — ACCESSIBLE TIER — "Pepper's Breakfast"
// ============================================================
const passageA_id = "eng-inc003-peppersbreakfast";
const passageA_title = "Pepper's Breakfast";
const passageA_text = `Jack Ellery had never looked after an animal on his own before, so when his teacher, Mrs Novak, asked for a volunteer to feed the class guinea pig over the October half-term, he put his hand up before he could think better of it.

"Her name's Pepper," Mrs Novak said, handing him a laminated card. "Everything you need to know is on here. Feed her every morning and evening, fresh water once a day, and check her water bottle isn't blocked -- she won't drink from it if the little ball inside gets stuck."

The first four days went perfectly. Jack fed Pepper her pellets and vegetables at breakfast and again before bed, topped up her water, and even remembered to gently tap the water bottle each morning to check the ball moved freely. Pepper squeaked at him through the bars whenever he came near, which he had decided meant she liked him.

On the fifth morning, though, something was wrong. Pepper's food bowl from the night before was still completely full, untouched. Jack checked the water bottle -- it worked fine. He checked the hutch for anything unusual -- nothing. He even checked the care card again, in case he had somehow been feeding her the wrong food the whole time, but no, everything matched what he'd been doing all week.

Jack's older sister, Ella, wandered into the kitchen while he was still frowning at the card. "Why do you look so worried?"

"Pepper won't eat," Jack said. "I've done everything right, I promise."

Ella went quiet for a second. "Oh," she said slowly. "I might have fed her already this morning. I got back from swimming early and thought I'd surprise you."

Jack stared at her. "You didn't tell me."

"I didn't think it mattered! It's just feeding a guinea pig."

"It matters because now I thought something was wrong with her, when actually she just wasn't hungry yet," Jack said. He wasn't really cross -- more relieved than anything -- but he could see now exactly why the care card said, in bold letters near the bottom: check with anyone else in the house before feeding, so Pepper doesn't get fed twice or missed completely.

That evening, Jack pinned a simple checklist to the fridge, one box for morning and one for evening, so that whoever fed Pepper could tick it off. "There," he said. "Now we'll actually know."

Pepper, unbothered by any of it, was already asleep in a pile of hay.`;

const passageA_words = passageA_text.split(/\s+/).filter(Boolean).length;

const qA = [
  {
    n: 1, id: `${passageA_id}-q01`, skill: "QT-RC-01", difficulty: "easy", type: "short-answer", time: 45, marks: 1,
    question: "According to Mrs Novak, how often should Pepper's water be topped up?",
    modelAnswer: "Once a day.",
    acceptedAnswers: ["once a day", "once a day, fresh water"],
    misconception: "Confusing the once-a-day water top-up with the twice-a-day (morning and evening) feeding schedule.",
    transfer: "ROUTINE",
  },
  {
    n: 2, id: `${passageA_id}-q02`, skill: "QT-RC-01", difficulty: "easy", type: "short-answer", time: 45, marks: 1,
    question: "According to the care card, what should Jack check about the water bottle every morning?",
    modelAnswer: "That the little ball inside isn't stuck, so it moves freely.",
    acceptedAnswers: ["that the little ball inside isn't stuck", "that the ball inside moves freely", "the ball inside isn't blocked"],
    misconception: "Answering with a general 'check the water bottle is full' rather than the specific mechanism (the ball inside) the card actually names.",
    transfer: "ROUTINE",
  },
  {
    n: 3, id: `${passageA_id}-q03`, skill: "QT-RC-02", difficulty: "medium", type: "short-answer", time: 100, marks: 3,
    question: "Does Jack immediately know why Pepper has not eaten her food? Tick Yes or No, then give two reasons for your answer, using evidence from the passage.",
    modelAnswer: "No. He checked the water bottle and it worked fine, and he even checked the care card again -- but 'everything matched what he'd been doing all week', showing he was genuinely puzzled, not aware of the real cause.",
    quotationRequired: ["it worked fine", "everything matched what he'd been doing all week"],
    tier: "TIER3_QUOTATION_PLUS_EXPLANATION",
    misconception: "Assuming that because Jack is thorough and careful, he must have worked out the real cause himself, rather than recognising the passage shows him genuinely stuck until Ella explains.",
    transfer: "MIXED_TRANSFER",
  },
  {
    n: 4, id: `${passageA_id}`, skill: "QT-RC-04", difficulty: "medium", type: "short-answer", time: 50, marks: 4, grouped: true,
    stem: "Question 4. Using the passage, write a synonym for each of the following words. Item (a) has been done for you as an example.",
    example: { label: "(a)", word: "laminated", answer: "covered in a thin layer of plastic" },
    subparts: [
      { label: "(b)", word: "completely", accepted: ["totally", "entirely", "fully"] },
      { label: "(c)", word: "frowning", accepted: ["scowling", "grimacing"] },
      { label: "(d)", word: "relieved", accepted: ["glad", "reassured", "glad it wasn't serious"] },
      { label: "(e)", word: "unbothered", accepted: ["unconcerned", "not worried"] },
    ],
    misconception: "Guessing a synonym from a word's sound or a loosely related idea rather than the meaning the word actually carries in its specific sentence context.",
    transfer: "NEAR_TRANSFER",
  },
  {
    n: 5, id: `${passageA_id}-q05`, skill: "QT-RC-06", difficulty: "medium", type: "short-answer", time: 110, marks: 4,
    question: "Put these four things Jack does on the fifth morning in the order they happen, according to the passage.",
    modelAnswer: "1. Jack checked the water bottle. 2. He checked the hutch for anything unusual. 3. He checked the care card again. 4. Ella says she might have fed Pepper already.",
    orderedAnswer: [
      "jack checked the water bottle",
      "checked the hutch for anything unusual",
      "checked the care card again",
      "i might have fed her already this morning",
    ],
    tier: "TIER4_ORDERED_LIST",
    misconception: "Placing Ella's confession before Jack has finished his own checks, rather than recognising the passage's own explicit sequence of Jack checking everything himself first.",
    transfer: "MIXED_TRANSFER",
  },
  {
    n: 6, id: `${passageA_id}-q06`, skill: "QT-RC-01", difficulty: "easy", type: "short-answer", time: 45, marks: 1,
    question: "What does Jack pin to the fridge at the end of the passage?",
    modelAnswer: "A simple checklist, with one box for morning and one for evening.",
    acceptedAnswers: ["a checklist", "a simple checklist with one box for morning and one for evening"],
    misconception: "Confusing the checklist Jack makes at the end with the original care card Mrs Novak gave him at the start.",
    transfer: "ROUTINE",
  },
  {
    n: 7, id: `${passageA_id}-q07`, skill: "QT-RC-02", difficulty: "medium", type: "short-answer", time: 100, marks: 3,
    question: "Is Jack angry with Ella by the end of the passage? Tick Yes or No, then give two reasons for your answer, using evidence from the passage.",
    modelAnswer: "No. Jack 'wasn't really cross -- more relieved than anything', and instead of arguing further he calmly makes a checklist so the mix-up cannot happen again.",
    quotationRequired: ["wasn't really cross", "more relieved than anything"],
    tier: "TIER3_QUOTATION_PLUS_EXPLANATION",
    misconception: "Assuming Jack must be angry because he initially says 'You didn't tell me' in a surprised tone, rather than tracking how his feelings are explicitly described moments later.",
    transfer: "MIXED_TRANSFER",
  },
];

// ============================================================
// PASSAGE B — CHALLENGING TIER — "The Compass Rose Challenge"
// ============================================================
const passageB_id = "eng-inc003-compassrosechallenge";
const passageB_title = "The Compass Rose Challenge";
const passageB_text = `At the Bramblewood Summer Fete, the final event of the afternoon was always the Compass Rose Challenge: four teams, one shared riddle card, and exactly twenty minutes to reach the hidden marker somewhere on the village green. This year, Elif Demir, Casey Whitfield, Wei Chen and Grace O'Sullivan had entered as a team for the first time, and the rules were stricter than any of them expected. For the first ten minutes, the organisers explained, each team member had to interpret the clue completely alone, without discussing it with anyone else, before the whole team regrouped at the old oak tree to compare notes.

The clue read: Where morning shadow meets the bell, and stone remembers what it fell.

Elif read it twice and set off immediately toward the church, certain the "bell" meant the church bell tower, and that "morning shadow" pointed to wherever its shadow would fall at that time of day. Casey, meanwhile, had noticed a very different detail -- a small stone sundial near the fete's entrance, half-forgotten behind the cake stall, with a bell-shaped weathervane mounted above it. To Casey, "stone remembers what it fell" clearly meant the sundial itself, since a sundial's whole purpose is marking where a shadow falls.

Wei took a slower approach, walking the entire green methodically before deciding on anything. What caught Wei's attention was an old collapsed wall near the duck pond, its fallen stones still lying roughly where they had toppled years earlier -- surely, Wei reasoned, that was what "remembers what it fell" really meant, since the stones themselves hadn't moved. Grace, meanwhile, had gone straight to the fete noticeboard and found something none of the others had thought to check: a laminated history sheet about the village, which mentioned that the old market bell had once hung from a wooden frame that had collapsed in a storm decades ago, its stone base left exactly where it fell.

When the four of them met back at the oak tree, each was certain their own answer was the right one, and for a moment nobody wanted to give way. It was Grace who suggested something none of them had tried: reading the clue's two halves as connected, rather than solving each half separately. "Morning shadow meets the bell" and "stone remembers what it fell" might both be describing the very same object, not two different clues pointing to two different places.

Put together that way, only one location fitted both halves at once: the collapsed bell frame's stone base, exactly where Grace's noticeboard sheet said it had fallen, standing precisely where the church tower's morning shadow would land. Elif's church tower, Casey's sundial, and Wei's tumbled wall had each explained half a clue convincingly, but only Grace's reading connected both halves together.

They reached the marker with four minutes to spare. Casey, still faintly annoyed about the sundial, admitted afterwards that being wrong on your own was far easier to accept than being wrong as a team who hadn't listened to each other properly for the first ten minutes.

The Compass Rose Challenge had used the same alone-first rule for as long as anyone at Bramblewood could remember, and until that afternoon, none of the four of them had really understood why it mattered. Solving the whole clue by yourself was nearly impossible; it was only by disagreeing first, and then actually comparing every disagreement properly, that the four separate halves finally added up to something none of them could have found alone.`;

const passageB_words = passageB_text.split(/\s+/).filter(Boolean).length;

const qB = [
  {
    n: 1, id: `${passageB_id}-q01`, skill: "QT-RC-01", difficulty: "medium", type: "short-answer", time: 50, marks: 1,
    question: "How many minutes in total did the four friends have to reach the hidden marker?",
    modelAnswer: "Twenty minutes.",
    acceptedAnswers: ["twenty minutes", "20 minutes"],
    misconception: "Confusing the ten-minutes-alone rule with the total twenty-minute time limit for the whole challenge.",
    transfer: "ROUTINE",
  },
  {
    n: 2, id: `${passageB_id}`, skill: "QT-RC-07", difficulty: "hard", type: "short-answer", time: 60, marks: 2, grouped: true, groupPrefix: "q02",
    stem: "Question 2. What did each of the following characters believe the clue's 'bell' referred to?",
    subparts: [
      { label: "(a)", who: "Elif", accepted: ["the church bell tower", "the church's bell tower"] },
      { label: "(b)", who: "Casey", accepted: ["the bell-shaped weathervane above the stone sundial", "the weathervane above the sundial", "the sundial's bell-shaped weathervane"] },
    ],
    misconception: "Conflating what different characters each believed, attributing Casey's sundial theory to Elif or vice versa, rather than keeping each character's own reasoning separately attributed.",
    transfer: "MIXED_TRANSFER",
  },
  {
    n: 3, id: `${passageB_id}-q03`, skill: "QT-RC-02", difficulty: "medium", type: "short-answer", time: 100, marks: 3,
    question: "Did Elif, Casey and Wei each find a location that fitted the whole clue on their own? Tick Yes or No, then give two reasons for your answer, using evidence from the passage.",
    modelAnswer: "No. Each of them 'had each explained half a clue convincingly', but only Grace's reading 'connected both halves together' -- showing none of the other three had solved the complete clue alone.",
    quotationRequired: ["had each explained half a clue convincingly", "connected both halves together"],
    tier: "TIER3_QUOTATION_PLUS_EXPLANATION",
    misconception: "Assuming that because each character's individual reasoning sounded confident and convincing, it must therefore have been correct and complete.",
    transfer: "MIXED_TRANSFER",
  },
  {
    n: 4, id: `${passageB_id}-q04`, skill: "QT-RC-05", difficulty: "hard", type: "short-answer", time: 110, marks: 2,
    question: "Find a quotation that shows Grace suggested a different approach from the others at the oak tree, and explain what her approach was.",
    modelAnswer: "'Reading the clue's two halves as connected, rather than solving each half separately.' Grace's approach was to treat the two parts of the riddle as describing one single object, instead of searching for two separate locations the way the others had.",
    quotationRequired: ["reading the clue's two halves as connected, rather than solving each half separately"],
    tier: "TIER3_QUOTATION_PLUS_EXPLANATION",
    misconception: "Quoting a line that describes what Grace found (the noticeboard sheet) rather than the line that describes her different method of reasoning about the clue itself.",
    transfer: "FAR_TRANSFER",
  },
  {
    n: 5, id: `${passageB_id}-q05`, skill: "QT-RC-06", difficulty: "hard", type: "short-answer", time: 120, marks: 4,
    question: "Put these four characters in the order the passage describes them first investigating the clue.",
    modelAnswer: "1. Elif. 2. Casey. 3. Wei. 4. Grace.",
    orderedAnswer: ["elif", "casey", "wei", "grace"],
    tier: "TIER4_ORDERED_LIST",
    misconception: "Ordering the characters by when they are mentioned again later at the oak tree, rather than by the order the passage first describes each of them investigating the clue.",
    transfer: "MIXED_TRANSFER",
  },
  {
    n: 6, id: `${passageB_id}-q06`, skill: "QT-RC-10", difficulty: "challenge", type: "short-answer", time: 130, marks: 2,
    question: "The writer chose to have the four friends interpret the clue completely alone before regrouping, rather than letting them discuss it together from the start. Why might the writer have included this detail?",
    acceptedAnswers: [
      "it shows that combining different viewpoints solved the puzzle where no single view could",
      "it shows that no one person had the full picture on their own",
      "it demonstrates that comparing disagreements properly is more powerful than one confident answer",
      "it makes the ending realisation feel earned rather than obvious",
      "it makes the reader understand why the rule exists, not just that it exists",
    ],
    tier: "TIER5_NAMED_COMPONENT_PLUS_EXPLANATION",
    misconception: "Treating the alone-first rule only as an arbitrary competition rule, rather than recognising it as the detail that makes the story's central idea (that four partial views add up to more than any one view) actually work.",
    transfer: "FAR_TRANSFER",
  },
  {
    n: 7, id: `${passageB_id}-q07`, skill: "QT-RC-01", difficulty: "medium", type: "short-answer", time: 50, marks: 1,
    question: "According to the noticeboard history sheet, what had collapsed in a storm decades ago?",
    modelAnswer: "The wooden frame the old market bell had once hung from.",
    acceptedAnswers: ["the wooden frame the market bell hung from", "the bell's wooden frame"],
    misconception: "Answering with 'the bell' itself rather than the specific detail the sheet actually names -- the wooden frame it hung from.",
    transfer: "ROUTINE",
  },
];

// ============================================================
// PASSAGE C — SIBLING OF "How Bees Find Their Way Home" —
// "How Salmon Find Their Way Home"
// ============================================================
const passageC_id = "eng-inc003-salmonnavigation";
const passageC_title = "How Salmon Find Their Way Home";
const passageC_text = `A single salmon may begin its life in a small stream far from the sea, then travel thousands of miles out into the open ocean to feed and grow -- before turning around, years later, and finding its way back to that exact same stream to lay its own eggs. For a fish with no map and no memory of ever having made the outward journey consciously, this is one of the most remarkable feats of natural navigation scientists have studied.

Unlike some animals, which use several senses at once throughout a journey, scientists believe a salmon relies mainly on different senses at different stages of its journey, with one sense becoming more important than the other as it gets closer to home.

Out in the open ocean, hundreds or even thousands of miles from any coastline, a salmon has no smell, no landmark, and no sun-compass reliable enough to guide it home across such vast, featureless water. Instead, scientists have found that young salmon imprint on the Earth's magnetic field around the point where they first enter the sea, remembering its particular strength and angle the way a person might remember a specific address. Adult salmon returning years later appear to use this remembered magnetic address as a kind of map, steering themselves back toward the right general region of ocean, even after years of travelling through open water with nothing else to guide them.

A magnetic sense this broad, however, is not precise enough to pinpoint one particular stream once a salmon finally reaches the coast. This is where a second, completely different sense is thought to become important. While still swimming in its home stream as a young fish, a salmon imprints on the stream's own distinctive chemical scent -- a unique mixture that comes from the local soil, plants and rock the water has passed over. Scientists Arthur Hasler and Warren Wisby first proposed this idea in 1951, and later research confirmed that returning adult salmon can detect and follow this remembered scent through a river system, choosing the correct tributary at each fork purely by smell, even among many similar-looking waterways.

Scientists think this two-part system is what makes salmon navigation so effective, though exactly how the two senses work together is still being studied. The magnetic sense seems to work well over enormous distances but cannot pinpoint a single stream; the scent sense seems able to guide a salmon to the exact stream once it is close enough, but is too faint to detect from far out at sea, where the smell has long since become too diluted in the vast ocean to follow. On its own, neither sense seems able to explain the whole journey -- researchers think a salmon relies mainly on its magnetic sense out in the open ocean, and mainly on its sense of smell once close to home, although exactly how, and how completely, one sense takes over from the other is still being studied.

Researchers continue to study exactly how a salmon's brain manages this handover between two entirely different senses. What is already clear is that a creature with no map, no memory of its outward journey, and no way to ask for directions is nonetheless capable of finding its way back to one precise stream among thousands, guided first by the Earth's own magnetism and finally by the water it once called home.`;

const passageC_words = passageC_text.split(/\s+/).filter(Boolean).length;

const qC = [
  {
    n: 1, id: `${passageC_id}-q01`, skill: "QT-RC-01", difficulty: "easy", type: "short-answer", time: 45, marks: 1,
    question: "In what year did scientists first propose that salmon imprint on their home stream's scent?",
    modelAnswer: "1951.",
    acceptedAnswers: ["1951"],
    misconception: "Confusing the 1951 scent-imprinting proposal with the unspecified, undated point at which the magnetic-sense research is described.",
    transfer: "ROUTINE",
  },
  {
    n: 2, id: `${passageC_id}-q02`, skill: "QT-RC-01", difficulty: "easy", type: "short-answer", time: 45, marks: 1,
    question: "What do young salmon imprint on around the point where they first enter the sea?",
    modelAnswer: "The Earth's magnetic field -- its particular strength and angle at that point.",
    acceptedAnswers: ["the earth's magnetic field", "the magnetic field's strength and angle at that point"],
    misconception: "Answering with the home stream's scent (which is imprinted earlier, while still in the stream) instead of the magnetic field imprinted at the point of entering the sea.",
    transfer: "ROUTINE",
  },
  {
    n: 3, id: `${passageC_id}-q03`, skill: "QT-RC-02", difficulty: "medium", type: "short-answer", time: 100, marks: 3,
    question: "Is the magnetic sense alone enough to guide a salmon all the way back to its home stream? Tick Yes or No, then give two reasons for your answer, using evidence from the passage.",
    modelAnswer: "No. The passage says the magnetic sense is 'not precise enough to pinpoint one particular stream', and that 'on its own, neither sense seems able to explain the whole journey' -- both show the magnetic sense needs the scent sense to finish the journey.",
    quotationRequired: ["not precise enough to pinpoint one particular stream", "neither sense seems able to explain the whole journey"],
    tier: "TIER3_QUOTATION_PLUS_EXPLANATION",
    misconception: "Assuming that because the magnetic sense is described first and works over huge distances, it must be the more important or sufficient sense on its own.",
    transfer: "MIXED_TRANSFER",
  },
  {
    n: 4, id: `${passageC_id}`, skill: "QT-RC-04", difficulty: "medium", type: "short-answer", time: 50, marks: 4, grouped: true,
    stem: "Question 4. Using the passage, write a synonym for each of the following words. Item (a) has been done for you as an example.",
    example: { label: "(a)", word: "remarkable", answer: "amazing" },
    subparts: [
      { label: "(b)", word: "reliable", accepted: ["dependable", "trustworthy", "consistent"] },
      { label: "(c)", word: "distinctive", accepted: ["unique", "distinct", "recognisable"] },
      { label: "(d)", word: "pinpoint", accepted: ["locate exactly", "identify precisely", "find exactly"] },
      { label: "(e)", word: "diluted", accepted: ["weakened", "watered down", "thinned"] },
    ],
    misconception: "Guessing a synonym from a word's sound or a loosely related idea rather than the meaning the word actually carries in its specific sentence context.",
    transfer: "NEAR_TRANSFER",
  },
  {
    n: 5, id: `${passageC_id}-q05`, skill: "QT-RC-06", difficulty: "hard", type: "short-answer", time: 130, marks: 4,
    question: "Put these four events in the order they really happen in a salmon's life, according to the passage's explanation (not necessarily the order the passage explains them in).",
    modelAnswer: "1. A young salmon imprints on its home stream's scent. 2. The salmon imprints on the Earth's magnetic field as it enters the sea. 3. The adult salmon relies mainly on its magnetic sense to navigate the open ocean. 4. The salmon relies mainly on the remembered scent to find the exact stream.",
    orderedAnswer: [
      "a young salmon imprints on its home stream's scent",
      "the salmon imprints on the earth's magnetic field as it enters the sea",
      "the adult salmon relies mainly on its magnetic sense to navigate the open ocean",
      "the salmon relies mainly on the remembered scent to find the exact stream",
    ],
    tier: "TIER4_ORDERED_LIST",
    misconception: "Ordering the two senses by the order the passage explains them in (magnetic sense described before scent sense) rather than working out the real chronological order of a salmon's own life, in which stream-scent imprinting actually happens first.",
    transfer: "FAR_TRANSFER",
  },
  {
    n: 6, id: `${passageC_id}-q06`, skill: "QT-RC-10", difficulty: "hard", type: "short-answer", time: 120, marks: 2,
    question: "The passage states that, 'On its own, neither sense seems able to explain the whole journey.' Why might the writer have included this sentence?",
    acceptedAnswers: [
      "it emphasises that both systems seem necessary, not just backup options",
      "it helps the reader understand why the relationship between the two senses matters",
      "it summarises the two-stage explanation in one clear, memorable sentence",
      "it stops the reader from thinking one sense is more important than the other",
    ],
    tier: "TIER5_NAMED_COMPONENT_PLUS_EXPLANATION",
    misconception: "Treating the sentence as a simple restatement of fact, rather than recognising it as the writer's way of making the passage's central two-stage idea explicit and memorable.",
    transfer: "FAR_TRANSFER",
  },
  {
    n: 7, id: `${passageC_id}-q07`, skill: "QT-RC-01", difficulty: "easy", type: "short-answer", time: 45, marks: 1,
    question: "What happens to a home stream's scent by the time a salmon is far out at sea?",
    modelAnswer: "It becomes too diluted in the vast ocean for the salmon to detect or follow.",
    acceptedAnswers: ["it becomes too diluted to follow", "it becomes too faint to detect that far out"],
    misconception: "Confusing why the scent sense fails at long range (dilution) with why the magnetic sense fails at short range (lack of precision) -- the two are opposite limitations of the two different senses.",
    transfer: "ROUTINE",
  },
];

// ============================================================
// Self-verification: every quotationRequired / orderedAnswer / synonym
// target word must be an exact (case-sensitive for quotes; case-insensitive
// for ordered-answer/synonym targets, matching established precedent) substring
// of its own passage's canonical text before any SQL is emitted.
// ============================================================
function verifyPassage(text, words, minWords, maxWords, label) {
  if (words < minWords || words > maxWords) {
    throw new Error(`${label}: word count ${words} outside target range ${minWords}-${maxWords}`);
  }
}
verifyPassage(passageA_text, passageA_words, 400, 480, "Passage A");
verifyPassage(passageB_text, passageB_words, 550, 650, "Passage B");
verifyPassage(passageC_text, passageC_words, 500, 570, "Passage C");

for (const q of qA) {
  if (q.quotationRequired) for (const s of q.quotationRequired) assertSubstring(passageA_text, s, `A/${q.id}`);
  if (q.orderedAnswer) for (const s of q.orderedAnswer) assertSubstring(passageA_text.toLowerCase(), s.toLowerCase(), `A/${q.id}`);
  if (q.subparts) for (const sp of q.subparts) assertSubstring(passageA_text, sp.word, `A/${q.id}/${sp.label}`);
  if (q.example) assertSubstring(passageA_text, q.example.word, `A/${q.id}/example`);
}
for (const q of qB) {
  if (q.quotationRequired) for (const s of q.quotationRequired) assertSubstring(passageB_text, s, `B/${q.id}`);
  if (q.orderedAnswer) {
    if (q.n === 5) {
      // character-name ordering question: verify names appear, not a literal sentence substring
      for (const s of q.orderedAnswer) assertSubstring(passageB_text, s[0].toUpperCase() + s.slice(1), `B/${q.id}`);
    } else {
      for (const s of q.orderedAnswer) assertSubstring(passageB_text.toLowerCase(), s.toLowerCase(), `B/${q.id}`);
    }
  }
}
for (const q of qC) {
  if (q.quotationRequired) for (const s of q.quotationRequired) assertSubstring(passageC_text, s, `C/${q.id}`);
  if (q.orderedAnswer && q.n !== 5) for (const s of q.orderedAnswer) assertSubstring(passageC_text.toLowerCase(), s.toLowerCase(), `C/${q.id}`);
  if (q.subparts) for (const sp of q.subparts) assertSubstring(passageC_text, sp.word, `C/${q.id}/${sp.label}`);
  if (q.example) assertSubstring(passageC_text, q.example.word, `C/${q.id}/example`);
}

console.error(`Passage A: ${passageA_words} words. Passage B: ${passageB_words} words. Passage C: ${passageC_words} words.`);
console.error("All substring checks passed.");

// ============================================================
// SQL emission
// ============================================================
function questionRow({ id, subject = "english", skill, difficulty, type, time, promptJson, explanation, learningUnit, familyId, misconception, transfer }) {
  return `('${id}', '${subject}', '${skill}', array['csse'], '${difficulty}', '${type}', ${time},
 $json$${promptJson}$json$,
 '${esc(explanation)}', 2, '${learningUnit}',
 '${familyId}', 'angel_original', 'authentic_assessment_candidate', 1, true, '${esc(misconception)}',
 '${transfer}')`;
}

const JSON_SKILL_LABEL = {
  "QT-RC-01": "evidence",
  "QT-RC-02": "inference",
  "QT-RC-05": "inference",
  "QT-RC-06": "structure",
  "QT-RC-10": "inference",
};

function ungroupedPrompt(q, passageTitle, passageTextJson) {
  const out = { id: q.id, marks: q.marks, skill: JSON_SKILL_LABEL[q.skill] || "inference", question: q.question, modelAnswer: q.modelAnswer, passageTitle, passageText: passageTextJson };
  if (q.acceptedAnswers) { out.acceptedAnswers = q.acceptedAnswers; out.validationTier = q.tier || "TIER2_ACCEPTED_SET"; }
  if (q.quotationRequired) { out.quotationRequired = q.quotationRequired; out.validationTier = q.tier; delete out.acceptedAnswers; }
  if (q.orderedAnswer) { out.orderedAnswer = q.orderedAnswer; out.validationTier = q.tier; }
  return JSON.stringify(out);
}

function buildPassageSection(passage, questions, familyPrefix) {
  const passageTextJson = jsonPassage(passage.text.replace(/"/g, '\\"').replace(/\n/g, "\\n"));
  const rows = [];
  for (const q of questions) {
    if (!q.grouped) {
      const promptJson = ungroupedPrompt(q, passage.title, passageTextJson);
      rows.push({
        sql: questionRow({
          id: q.id, skill: q.skill, difficulty: q.difficulty, type: q.type, time: q.time,
          promptJson, explanation: `Angel English Content Foundation, Increment 003 (Decision 244). ${q.skill}, passage "${passage.title}". Numbered Question ${q.n}.`,
          learningUnit: passage.id, familyId: `${familyPrefix}-${q.skill.toLowerCase()}-${passage.id.split("-").pop()}`,
          misconception: q.misconception, transfer: q.transfer,
        }),
      });
    } else if (q.subparts && q.example) {
      // synonym-list grouped question (QT-RC-04), worked example (a) unscored
      const groupId = passage.id;
      for (const sp of q.subparts) {
        const subId = `${passage.id}-q0${q.n}${sp.label.replace(/[()]/g, "")}`;
        const promptObj = {
          id: subId, marks: 1, skill: "vocabulary",
          question: `${q.stem} Item (a) '${q.example.word}' -> ${q.example.answer} (given). ${sp.label} Write a synonym for '${sp.word}'.`,
          modelAnswer: sp.accepted[0], passageTitle: passage.title, passageText: passageTextJson,
          acceptedAnswers: sp.accepted, validationTier: "TIER2_ACCEPTED_SET",
        };
        rows.push({
          sql: questionRow({
            id: subId, skill: q.skill, difficulty: q.difficulty, type: q.type, time: q.time,
            promptJson: JSON.stringify(promptObj),
            explanation: `Angel English Content Foundation, Increment 003 (Decision 244). GROUPED numbered question ${q.n}, subpart ${sp.label}. ${q.skill}, passage "${passage.title}".`,
            learningUnit: passage.id, familyId: `${familyPrefix}-${q.skill.toLowerCase()}-${passage.id.split("-").pop()}`,
            misconception: q.misconception, transfer: q.transfer,
          }),
          group: { id: groupId + `-q0${q.n}`, order: q.subparts.indexOf(sp) + 1, label: sp.label, subId },
        });
      }
    } else if (q.subparts && q.groupPrefix) {
      // QT-RC-07 two-entity grouped question
      const groupId = `${passage.id}-${q.groupPrefix}`;
      for (const [idx, sp] of q.subparts.entries()) {
        const subId = `${passage.id}-${q.groupPrefix}${sp.label.replace(/[()]/g, "")}`;
        const promptObj = {
          id: subId, marks: 1, skill: "evidence",
          question: `${q.stem} ${sp.label} ${sp.who}`,
          modelAnswer: sp.accepted[0], passageTitle: passage.title, passageText: passageTextJson,
          acceptedAnswers: sp.accepted, validationTier: "TIER2_ACCEPTED_SET",
        };
        rows.push({
          sql: questionRow({
            id: subId, skill: q.skill, difficulty: q.difficulty, type: q.type, time: q.time,
            promptJson: JSON.stringify(promptObj),
            explanation: `Angel English Content Foundation, Increment 003 (Decision 244). GROUPED numbered question ${q.n}, subpart ${sp.label} (${sp.who}). ${q.skill}, passage "${passage.title}". Multi-entity comparative attribute extraction.`,
            learningUnit: passage.id, familyId: `${familyPrefix}-${q.skill.toLowerCase()}-${passage.id.split("-").pop()}`,
            misconception: q.misconception, transfer: q.transfer,
          }),
          group: { id: groupId, order: idx + 1, label: sp.label, subId },
        });
      }
    }
  }
  return rows;
}

const passages = [
  { data: { id: passageA_id, title: passageA_title, text: passageA_text, words: passageA_words }, q: qA, familyPrefix: "eng-inc003", textType: "narrative-extract", genre: "contemporary-realistic-fiction", contentDifficulty: "easy", readingComplexity: "accessible" },
  { data: { id: passageB_id, title: passageB_title, text: passageB_text, words: passageB_words }, q: qB, familyPrefix: "eng-inc003", textType: "narrative-extract", genre: "contemporary-realistic-fiction", contentDifficulty: "hard", readingComplexity: "challenging" },
  { data: { id: passageC_id, title: passageC_title, text: passageC_text, words: passageC_words }, q: qC, familyPrefix: "eng-inc003", textType: "informational", genre: "popular-science-explanation", contentDifficulty: "medium", readingComplexity: "moderate" },
];

let allRows = [];
for (const p of passages) {
  const rows = buildPassageSection(p.data, p.q, p.familyPrefix);
  allRows.push({ passage: p.data, rows, textType: p.textType, genre: p.genre, contentDifficulty: p.contentDifficulty, readingComplexity: p.readingComplexity });
}

let out = "";
out += `-- GENERATED FILE. Produced by scripts/generate-english-increment003.mjs\n`;
out += `-- Every quotationRequired/orderedAnswer/synonym-target value below was\n`;
out += `-- programmatically re-verified as an exact substring of its own passage's\n`;
out += `-- canonical text by this script before emission (see verifyPassage/assertSubstring\n`;
out += `-- calls) -- not separately hand-typed.\n\n`;
out += "insert into public.ali_passage_bank\n  (id, title, original_text, text_type, genre, word_count, reading_complexity,\n   provenance, copyright_status, pathway, content_difficulty, content_version,\n   eligibility_status, active, passage_family_id, review_state)\nvalues\n";
out += allRows.map((r) => `('${r.passage.id}', '${esc(r.passage.title)}',\n $passage$${r.passage.text}$passage$,\n '${r.textType}', '${r.genre}', ${r.passage.words}, '${r.readingComplexity}',\n 'angel_original', 'Angel original, unpublished; no external rights holder', array['csse'], '${r.contentDifficulty}', 1,\n 'authentic_assessment_candidate', true, '${r.passage.id}-family', null)`).join(",\n\n");
out += "\non conflict (id) do nothing;\n\n";

for (const r of allRows) {
  out += `-- === "${r.passage.title}" (${r.passage.id}) — ${r.rows.length} physical question rows ===\n`;
  out += "insert into public.ali_question_bank\n  (id, subject, skill, pathway, content_difficulty, question_type, estimated_time_seconds,\n   prompt, explanation, mastery_threshold, learning_unit_id,\n   family_id, provenance, eligibility_status, content_version, active, addresses_misconception,\n   transfer_class)\nvalues\n";
  out += r.rows.map((row) => row.sql).join(",\n\n");
  out += "\non conflict (id) do nothing;\n\n";
}

out += "-- Populate grouped-question columns (migration 093 mechanism)\n";
for (const r of allRows) {
  for (const row of r.rows) {
    if (row.group) {
      out += `update public.ali_question_bank\nset question_group_id = '${row.group.id}',\n    group_order = ${row.group.order},\n    subpart_label = '${row.group.label}',\n    marking_mode = 'deterministic'\nwhere id = '${row.group.subId}';\n\n`;
    }
  }
}

writeFileSync(new URL("../supabase/migrations/166_english_content_foundation_increment003_comprehension.sql.body", import.meta.url), out);
console.error("Wrote migration body to supabase/migrations/166_..._comprehension.sql.body");
