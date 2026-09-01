import { writeFileSync } from "node:fs";

// ============================================================
// Educational Increment 007C — CSSE English Wave 2.
// 8 original Angel passages, addressing 007B's evidenced gaps: genuine
// two-character contrast (3 passages, up from Wave 1's 1), a new
// multi-select recognition family (evidenced by CSSE-013/2021 Q11, not
// present in 2022/2023), and deeper RC-04 sequencing. All narrative
// fiction (the only genre 3 years of CSSE evidence supports); no
// character, plot, or wording overlap with any CSSE extract read.
// ============================================================

const passages = [];
const items = [];

function assertNoDash(text, ctx) {
  if (/[—–]/.test(text)) throw new Error(`${ctx}: em/en dash found — "${text}"`);
}
function wordCount(text) {
  return text.trim().split(/\s+/).length;
}
function q(opts) {
  const { id, passageId, family, competency, qType, legacySkill, marks, question, modelAnswer,
    acceptedAnswers, quotationRequired, orderedAnswer, correctOptions, requiredSelectionCount,
    misconception, transferClass, validation } = opts;
  assertNoDash(question, id);
  assertNoDash(modelAnswer, id);
  return {
    id, passageId, family, competency, qType, legacySkill, marks, question, modelAnswer,
    acceptedAnswers: acceptedAnswers ?? null,
    quotationRequired: quotationRequired ?? null,
    orderedAnswer: orderedAnswer ?? null,
    correctOptions: correctOptions ?? null,
    requiredSelectionCount: requiredSelectionCount ?? null,
    misconception, transferClass, validation,
  };
}

// ---------- Passage 1: "The Last Slice" — two-character (siblings) ----------
const p1Text = `Marcus had counted the pizza slices twice before his sister Yasmin even sat down, which told her everything she needed to know about how the next ten minutes were going to go.

"There are seven slices," he announced, as if this were a fact that required careful management. "That's three and a half each."

"I don't want half a slice," Yasmin said, reaching for the box.

"You have to want half a slice. That's how division works." Marcus positioned himself slightly between Yasmin and the box, not quite blocking it, but close enough that the message was clear.

Yasmin had learned, over many similar standoffs, that arguing with Marcus about fairness never actually got her more pizza, it just got her a longer lecture about fairness. Instead, she waited until he was mid-explanation of exactly how he intended to cut the seventh slice into two precise halves, and simply took two whole slices while he was still talking.

"That's not what we agreed," Marcus said, staring at the gap in the box.

"We didn't agree anything. You were narrating." Yasmin was already halfway through her first slice.

Marcus opened his mouth, closed it again, and did a rapid recalculation. Five slices remained for the two of them to somehow still divide fairly, which was, if anything, a harder problem than the one he'd started with. He picked up a slice, looked at it for a long moment, and then, instead of measuring anything, simply ate it.

Yasmin watched this with open surprise. "No cutting?"

"There's no elegant way to divide five slices between two people. I've decided to stop trying." He took a second slice. "This is now a speed problem, not a fairness problem."

Yasmin laughed properly for the first time all evening, grabbed a third slice for herself, and privately thought that Marcus solved problems the way most people solved problems, just backwards, and about four minutes too late to actually help him get more pizza.`;
assertNoDash(p1Text, "p1Text");
passages.push({
  id: "wave2-eng-lastslice", title: "The Last Slice", originalText: p1Text,
  textType: "narrative-extract", genre: "contemporary-realistic-fiction",
  wordCount: wordCount(p1Text), readingComplexity: "moderate",
  passageFamily: "wave2-family-sibling-contrast", provenance: "angel_original",
  copyrightStatus: "Angel original, unpublished; no external rights holder", contentDifficulty: "medium",
});

// ---------- Passage 2: "Morning Patrol" — sequencing focus ----------
const p2Text = `Priya's patrol of the botanical gardens always followed the same order: greenhouse first, while the glass was still cool from the night; then the rose beds, checking for the aphids that seemed to appear overnight; then the pond, where she counted the ducks out of habit rather than necessity; and finally the old oak at the eastern gate, which needed nothing checking at all but which she liked to visit anyway.

This particular Tuesday broke the order before she had even reached the greenhouse.

The gate was already open when she arrived, which was wrong, because she was always first. She stood at the entrance for a moment, keys still in her hand, working out whether this was worth investigating or whether some other keyholder had simply arrived early. Deciding it was worth investigating, she abandoned the greenhouse entirely and went straight to the rose beds instead, on the theory that anything worth stealing from a botanical garden was probably a rose bush rather than a fern.

The rose beds were untouched. She moved on to the pond next, skipping her usual duck count in her hurry, and found nothing wrong there either, just the usual ducks doing usual duck things.

It was only at the old oak, the stop she visited purely out of fondness rather than duty, that she found the answer: a tent, badly pitched, with a bicycle leaning against the trunk and a boy of about twelve fast asleep inside it.

Priya considered waking him immediately, then reconsidered, and instead went back to the greenhouse to do her actual job first, on the theory that a sleeping trespasser was considerably less urgent than a greenhouse full of plants that had gone unchecked for an extra twenty minutes. She would deal with the boy properly, in the correct order, once everything else was done.

When she finally returned to the oak tree, coffee in hand and prepared to be stern, the boy was already awake, folding up his tent with the brisk efficiency of someone who had clearly done this before, in gardens that were not his own, more than once.`;
assertNoDash(p2Text, "p2Text");
passages.push({
  id: "wave2-eng-morningpatrol", title: "Morning Patrol", originalText: p2Text,
  textType: "narrative-extract", genre: "contemporary-realistic-fiction",
  wordCount: wordCount(p2Text), readingComplexity: "moderate-high",
  passageFamily: "wave2-family-routine-disrupted", provenance: "angel_original",
  copyrightStatus: "Angel original, unpublished; no external rights holder", contentDifficulty: "medium",
});

// ---------- Passage 3: "The Understudy" — emotion-cause + vocab ----------
const p3Text = `Oliver had been the understudy for the lead role in the school production for six weeks, which meant six weeks of learning every line perfectly while fully expecting never to say a single one of them on stage.

Then, forty minutes before curtain, Daniel Okafor lost his voice entirely, reduced to a hoarse whisper that could not have carried past the third row, and Mrs Fennimore appeared in the dressing room with an expression Oliver could not immediately decipher.

"You know the part," she said. It was not quite a question.

Oliver's stomach performed a complicated manoeuvre that he would later struggle to describe accurately to anyone. He did know the part. He had known it for six weeks, muttering it under his breath on the bus, reciting it in the shower until his family had started giving him strange looks. Knowing the words, he realised now, with the costume half-buttoned and his hands trembling slightly, was an entirely different matter from being ready to say them in front of four hundred people.

"I know it," he managed.

The next twenty minutes passed in a blur of costume adjustments and Mrs Fennimore's rapid-fire reassurances, none of which Oliver retained a single word of. What he did remember, vividly, was the moment the curtain rose and the stage lights hit his face, and the sudden, absolute silence of four hundred people waiting for him to speak.

He opened his mouth, and the first line arrived, unbidden and perfectly formed, exactly where six weeks of muttering on buses had left it. The second line followed the first. By the third, something in his chest had loosened slightly, and he found, to his considerable surprise, that he was no longer reciting memorised words but actually, genuinely, becoming the character he had spent six weeks quietly preparing to never actually play.

He did not think about Daniel's lost voice again until the interval, and even then, only briefly, and with something that was not quite guilt.`;
assertNoDash(p3Text, "p3Text");
passages.push({
  id: "wave2-eng-understudy", title: "The Understudy", originalText: p3Text,
  textType: "narrative-extract", genre: "contemporary-realistic-fiction",
  wordCount: wordCount(p3Text), readingComplexity: "moderate-high",
  passageFamily: "wave2-family-performance-anxiety", provenance: "angel_original",
  copyrightStatus: "Angel original, unpublished; no external rights holder", contentDifficulty: "hard",
});

// ---------- Passage 4: "Two Letters" — two-character via dual voices ----------
const p4Text = `The first letter, from Robyn to her cousin Iris, was written the same night the garden fence finally came down.

Dear Iris,

You will not believe what Grandad did today. The fence between our garden and the Hendersons' has been leaning for about a year, and everyone kept saying someone should fix it eventually, and today Grandad decided that eventually meant today, at half past seven in the morning, without asking anyone, including Mr Henderson.

He had it flat on the ground by eight. Mr Henderson came out in his dressing gown looking extremely confused, and Grandad just said "morning, Terry, thought I'd sort this out" as if this were a perfectly normal Tuesday activity. Mum says he's been threatening to do it for months and finally just snapped. I think it's the most exciting thing that's happened on this street in years, and I am including the time the ice cream van caught fire.

Write back soon.

Love, Robyn

The second letter, from Iris to Robyn, arrived four days later, considerably less impressed.

Dear Robyn,

I'm glad the fence situation has been resolved, but I have to say, from where I'm sitting, "Grandad flattened a fence at dawn without telling the neighbour" sounds less like an exciting story and more like something that could have gone badly wrong. What if Mr Henderson had been annoyed? What if the fence had fallen on something?

I know you think it's funny, and it probably was, a bit, but I'd have been mortified if it were my grandad. Mum always says our side of the family worries too much and your side doesn't worry enough, and I think this fence is basically proof of that theory.

Tell Grandad I said well done anyway, even though I still think he should have asked first.

Love, Iris`;
assertNoDash(p4Text, "p4Text");
passages.push({
  id: "wave2-eng-twoletters", title: "Two Letters", originalText: p4Text,
  textType: "narrative-extract", genre: "epistolary-fiction",
  wordCount: wordCount(p4Text), readingComplexity: "moderate",
  passageFamily: "wave2-family-dual-epistolary-contrast", provenance: "angel_original",
  copyrightStatus: "Angel original, unpublished; no external rights holder", contentDifficulty: "medium",
});

// ---------- Passage 5: "The Long Walk Home" — multi-select focus ----------
const p5Text = `The bus had not come, and after twenty minutes of waiting at a stop with no shelter and a sky that was turning the specific shade of grey that meant business, I decided walking home was the less miserable option.

I set off down Kestrel Road first, since it was the most direct route, past the boarded-up shop that had been boarded up for as long as I could remember and the small park with the broken swing nobody had fixed. The rain started properly just as I reached the park, so I ducked under the bus shelter there instead, the working one, and waited for it to ease off, which it eventually did, though not by much.

I cut through the alley behind the launderette next, because it was faster than going round, even though it smelled faintly of damp and something I didn't want to identify. A cat watched me the entire way through with what I chose to interpret as mild interest rather than judgement.

At the end of the alley I stopped at the corner shop to buy a bag of crisps I definitely didn't need, mostly as an excuse to stand under their awning for a few minutes while the worst of the rain passed. The woman behind the counter recognised me and asked, not for the first time, whether I'd ever consider getting a bike, which felt like a fair question given the state of my shoes.

I crossed the main road at the pelican crossing, waited for the green man properly instead of chancing it, and finally turned onto my own street, soaked through but no longer actively being rained on, which felt like a genuine achievement. My front door was, infuriatingly, exactly forty minutes further from the bus stop than it would have been if the bus had simply arrived on time.`;
assertNoDash(p5Text, "p5Text");
passages.push({
  id: "wave2-eng-longwalk", title: "The Long Walk Home", originalText: p5Text,
  textType: "narrative-extract", genre: "contemporary-realistic-fiction",
  wordCount: wordCount(p5Text), readingComplexity: "moderate",
  passageFamily: "wave2-family-journey-sequence", provenance: "angel_original",
  copyrightStatus: "Angel original, unpublished; no external rights holder", contentDifficulty: "medium",
});

// ---------- Passage 6: "The Science Fair" — two-character rivals ----------
const p6Text = `Ben had been planning his volcano for the science fair since September. He had researched three different eruption methods, tested each one twice in the garden, and settled on the one that produced the most convincing lava flow without also producing a mess his mother would object to. His display board had section headings. His section headings had subheadings.

Zara had decided on her project the night before it was due, largely because she'd forgotten it was due until her older brother mentioned it at dinner. Her project, a demonstration of static electricity using balloons and her own hair, took approximately eleven minutes to prepare and consisted mostly of her rubbing balloons on things and seeing what happened.

"You didn't even test it," Ben said, watching her tape a single sheet of paper, her only signage, to the front of her table.

"I tested it on myself about four times this morning," Zara said. "It worked every time. What more testing does static electricity need?"

Ben, who had a testing log with dated entries, did not have a good answer to this.

When the judges came round, Ben delivered his explanation exactly as rehearsed, complete with the correct chemical terminology and a clear account of the reaction occurring inside his volcano. The judges nodded, made notes, and moved on with polite, unremarkable interest.

At Zara's table, she rubbed a balloon on her jumper, held it near her own head, and let her hair rise dramatically toward it while explaining, in far less technical language than Ben had used, that opposite charges attract and her hair was proving it live, right now, in front of them. One of the younger judges laughed out loud and asked her to do it again.

Ben won a certificate for Scientific Rigour. Zara won a certificate for Most Engaging Demonstration, and spent the rest of the afternoon being asked by at least a dozen other children to do the hair trick again, which she was, by that point, extremely happy to keep doing.`;
assertNoDash(p6Text, "p6Text");
passages.push({
  id: "wave2-eng-sciencefair", title: "The Science Fair", originalText: p6Text,
  textType: "narrative-extract", genre: "contemporary-realistic-fiction",
  wordCount: wordCount(p6Text), readingComplexity: "moderate",
  passageFamily: "wave2-family-rival-approaches", provenance: "angel_original",
  copyrightStatus: "Angel original, unpublished; no external rights holder", contentDifficulty: "medium",
});

// ---------- Passage 7: "Storm Warning" — multi-select + sequencing ----------
const p7Text = `The warning came through on Dad's phone at exactly four o'clock: severe weather, expect flooding, secure loose items, bring in anything that could blow away.

Dad went straight for the garden, hauling the trampoline flat and weighing the corners down with paving slabs before the wind had even properly picked up. Mum moved through the house methodically, closing every window and checking each latch twice, muttering under her breath about the greenhouse glass the entire time. My little brother Theo, who was six and treated every piece of extreme weather as personal entertainment, pressed his face to the living room window and gave a running commentary on the darkening sky as though he were presenting the news.

I was given the bins. Not the exciting job, but an important one, since an unsecured bin in this kind of wind became, according to Dad, "basically a missile." I dragged both wheelie bins into the side passage and wedged them behind the gate, which felt like a reasonable solution right up until the gate itself started rattling alarmingly.

By five o'clock the rain had turned properly sideways, hammering against the windows in a way that made Theo shriek with delight and the rest of us wince. Dad came in soaked through, having made one final trip to check the trampoline was still flat, and Mum handed him a towel without looking up from the window she was still watching, as if she didn't quite trust it to stay shut on its own.

We lost power just after six, which Theo declared, with total sincerity, to be the best part so far. We ate dinner by torchlight, listening to the wind trying its best to get into the house, and by the time we went to bed the worst of it had passed, leaving nothing behind but a garden full of leaves, one very flat trampoline, and a six year old already disappointed that tomorrow would probably just be an ordinary day again.`;
assertNoDash(p7Text, "p7Text");
passages.push({
  id: "wave2-eng-stormwarning", title: "Storm Warning", originalText: p7Text,
  textType: "narrative-extract", genre: "contemporary-realistic-fiction",
  wordCount: wordCount(p7Text), readingComplexity: "moderate",
  passageFamily: "wave2-family-family-crisis-response", provenance: "angel_original",
  copyrightStatus: "Angel original, unpublished; no external rights holder", contentDifficulty: "medium",
});

// ---------- Passage 8: "The Piano Recital" — vocab/synonym depth ----------
const p8Text = `The recital hall smelled of polished wood and, faintly, of nervous anticipation, an odour Freya had come to associate specifically with the fifteen minutes before her name was called.

She had practised the piece so many times that her fingers seemed to know it independently of her conscious mind, a fact that was reassuring in the practice room and considerably less reassuring here, in a hall full of expectant faces, where her conscious mind was currently occupied entirely with the question of whether her fingers would remember anything at all once she actually sat down.

The girl before her finished to polite, dutiful applause, gathered her music with the brisk efficiency of someone glad to be finished, and returned to her seat. Freya's name was called. She walked to the piano with what she hoped looked like composure and felt, internally, like a barely controlled scramble.

The first few bars emerged tentative and slightly too quiet, her fingers testing the keys as though they belonged to someone else entirely. But somewhere around the eighth bar, something shifted. The tentative quality fell away, replaced by the fluent, almost automatic motion she recognised from a hundred hours of solitary practice, and she stopped thinking about the audience entirely, absorbed instead in the particular architecture of the piece itself, the way one phrase built toward the next.

She emerged from the final chord almost surprised to find herself back in the recital hall, the audience's applause arriving a half-second after she expected it, as though she had briefly forgotten they were there to hear anything at all.

Her teacher, waiting in the wings, said only "the middle section," with an expression Freya couldn't immediately place, and it took her a moment to realise it was pride, worn slightly awkwardly, like a coat that didn't quite fit but was worn anyway because the weather demanded it.`;
assertNoDash(p8Text, "p8Text");
passages.push({
  id: "wave2-eng-pianorecital", title: "The Piano Recital", originalText: p8Text,
  textType: "narrative-extract", genre: "contemporary-realistic-fiction",
  wordCount: wordCount(p8Text), readingComplexity: "high",
  passageFamily: "wave2-family-performance-focus", provenance: "angel_original",
  copyrightStatus: "Angel original, unpublished; no external rights holder", contentDifficulty: "hard",
});

// ============================================================
// Questions. 9 families (the 8 evidence-grounded Wave 1 families plus
// wave2-fam-multiselect, evidenced by CSSE-013/2021 Q11).
// ============================================================

// ---------- Passage 1: The Last Slice (two-character priority) ----------
items.push(
  q({
    id: "w2-lastslice-01", passageId: "wave2-eng-lastslice", family: "wave1-fam-direct-retrieval",
    competency: "RC-01", qType: "QT-RC-01", legacySkill: "evidence", marks: 1,
    question: "How many pizza slices were there at the start?",
    modelAnswer: "Seven slices.",
    acceptedAnswers: ["seven", "7"],
    transferClass: "ROUTINE", validation: "TIER2_ACCEPTED_SET",
    misconception: "Confusing the starting count with the five slices remaining after Yasmin takes two.",
  }),
  q({
    id: "w2-lastslice-02", passageId: "wave2-eng-lastslice", family: "wave1-fam-two-character",
    competency: "RC-02", qType: "QT-RC-07", legacySkill: "character", marks: 4,
    question: "Using evidence from the passage, explain how Marcus's and Yasmin's approaches to sharing the pizza differ.",
    modelAnswer: "Marcus wants to divide the pizza with precise, announced fairness, counting slices and explaining his reasoning aloud before acting. Yasmin is practical rather than theoretical: rather than debating fairness, she simply takes what she wants while he is still talking, and later accepts that a fair split isn't always possible.",
    quotationRequired: ["That's three and a half each", "simply took two whole slices while he was still talking"],
    transferClass: "MIXED_TRANSFER", validation: "TIER3_QUOTATION_PLUS_EXPLANATION",
    misconception: "Describing only one character's approach instead of contrasting both.",
  }),
  q({
    id: "w2-lastslice-03", passageId: "wave2-eng-lastslice", family: "wave1-fam-vocab-explain",
    competency: "RC-03", qType: "QT-RC-03", legacySkill: "vocabulary", marks: 1,
    question: "Explain what the word 'elegant' means as Marcus uses it when thinking about dividing five slices.",
    modelAnswer: "Neat, simple, and satisfying, a clean or graceful solution to the problem.",
    acceptedAnswers: ["neat", "graceful", "clean solution", "simple and satisfying"],
    transferClass: "NEAR_TRANSFER", validation: "TIER2_ACCEPTED_SET",
    misconception: "Confusing 'elegant' with 'delicious', applying it to the food itself rather than to the method of dividing it.",
  }),
  q({
    id: "w2-lastslice-04", passageId: "wave2-eng-lastslice", family: "wave1-fam-synonym-battery",
    competency: "RC-03", qType: "QT-RC-04", legacySkill: "vocabulary", marks: 3,
    question: "Write a synonym for each of the following words as used in the passage: (a) 'standoffs' (b) 'precise' (c) 'privately' (privately thought).",
    modelAnswer: "(a) standoffs: confrontations/disputes (b) precise: exact/accurate (c) privately: secretly/silently, to herself.",
    acceptedAnswers: ["confrontations", "disputes", "arguments", "exact", "accurate", "secretly", "silently", "to herself", "quietly"],
    transferClass: "NEAR_TRANSFER", validation: "TIER2_ACCEPTED_SET",
    misconception: "Giving a synonym for 'private' in the sense of secretive/hidden information, rather than an unspoken thought.",
  }),
  q({
    id: "w2-lastslice-05", passageId: "wave2-eng-lastslice", family: "wave1-fam-tick-justify",
    competency: "RC-02", qType: "QT-RC-02", legacySkill: "inference", marks: 4,
    question: "Does Yasmin seem frustrated with Marcus by the end of the passage? Tick Yes or No, then give two reasons for your answer, using evidence from the passage.",
    modelAnswer: "No. She laughs properly for the first time all evening, and her final thought about Marcus is fondly amused ('backwards, and about four minutes too late') rather than annoyed, showing affectionate exasperation rather than real frustration.",
    quotationRequired: ["laughed properly for the first time all evening"],
    transferClass: "MIXED_TRANSFER", validation: "TIER3_QUOTATION_PLUS_EXPLANATION",
    misconception: "Assuming her earlier impatience with his lecturing means she is frustrated overall, missing the warmer tone of the ending.",
  }),
  q({
    id: "w2-lastslice-06", passageId: "wave2-eng-lastslice", family: "wave1-fam-sequencing",
    competency: "RC-04", qType: "QT-RC-06", legacySkill: "structure", marks: 3,
    question: "Write down three things that happened with the pizza, in the order they happened.",
    modelAnswer: "1. Marcus announced there were seven slices and explained how to divide them. 2. Yasmin took two whole slices while he was still talking. 3. Marcus ate a slice without cutting it, deciding it was a speed problem instead.",
    orderedAnswer: ["Marcus announced seven slices / explained dividing them", "Yasmin took two whole slices while he talked", "Marcus ate a slice without cutting it"],
    transferClass: "NEAR_TRANSFER", validation: "TIER4_ORDERED_LIST",
    misconception: "Placing Yasmin laughing at the end before the earlier pizza-taking events.",
  }),
  q({
    id: "w2-lastslice-07", passageId: "wave2-eng-lastslice", family: "wave1-fam-emotion-cause",
    competency: "RC-02", qType: "QT-RC-08", legacySkill: "atmosphere", marks: 2,
    question: "How does Marcus feel when he sees the gap in the box after Yasmin takes two slices, and why?",
    modelAnswer: "Marcus feels surprised or thrown off, because Yasmin acted while he was still explaining his plan, disrupting the careful, fair division he had been in the middle of announcing.",
    acceptedAnswers: ["surprised", "thrown off", "confused", "caught off guard"],
    transferClass: "FAR_TRANSFER", validation: "TIER5_NAMED_COMPONENT_PLUS_EXPLANATION",
    misconception: "Assuming Marcus is angry, when the passage shows a more surprised, recalculating reaction ('stared at the gap... did a rapid recalculation').",
  })
);

// ---------- Passage 2: Morning Patrol (sequencing priority) ----------
items.push(
  q({
    id: "w2-morningpatrol-01", passageId: "wave2-eng-morningpatrol", family: "wave1-fam-direct-retrieval",
    competency: "RC-01", qType: "QT-RC-01", legacySkill: "evidence", marks: 1,
    question: "Why did Priya usually visit the old oak tree at the eastern gate?",
    modelAnswer: "Not because it needed checking, but because she liked to visit it anyway.",
    acceptedAnswers: ["because she liked it", "out of fondness", "not out of necessity, just liked visiting"],
    transferClass: "ROUTINE", validation: "TIER2_ACCEPTED_SET",
    misconception: "Assuming the oak needed inspecting like the other stops, missing the passage's explicit statement that it needed nothing checking.",
  }),
  q({
    id: "w2-morningpatrol-02", passageId: "wave2-eng-morningpatrol", family: "wave1-fam-sequencing",
    competency: "RC-04", qType: "QT-RC-06", legacySkill: "structure", marks: 4,
    question: "What is Priya's usual patrol order? Write the four stops in order.",
    modelAnswer: "1. Greenhouse 2. Rose beds 3. Pond 4. Old oak at the eastern gate.",
    orderedAnswer: ["greenhouse", "rose beds", "pond", "old oak"],
    transferClass: "ROUTINE", validation: "TIER4_ORDERED_LIST",
    misconception: "Listing the stops she actually visited on this disrupted Tuesday instead of her stated usual order.",
  }),
  q({
    id: "w2-morningpatrol-03", passageId: "wave2-eng-morningpatrol", family: "wave1-fam-sequencing",
    competency: "RC-04", qType: "QT-RC-06", legacySkill: "structure", marks: 3,
    question: "Write down what Priya actually did this Tuesday, in the order she did it, starting from when she found the gate open.",
    modelAnswer: "1. She went straight to the rose beds instead of the greenhouse. 2. She moved on to the pond, skipping her duck count. 3. She found the tent and sleeping boy at the old oak.",
    orderedAnswer: ["went to the rose beds", "moved on to the pond", "found the tent/boy at the old oak"],
    transferClass: "NEAR_TRANSFER", validation: "TIER4_ORDERED_LIST",
    misconception: "Confusing this actual, disrupted order with her normal patrol order from the earlier question.",
  }),
  q({
    id: "w2-morningpatrol-04", passageId: "wave2-eng-morningpatrol", family: "wave1-fam-vocab-explain",
    competency: "RC-03", qType: "QT-RC-03", legacySkill: "vocabulary", marks: 1,
    question: "Explain what the word 'brisk' means as used to describe the boy folding his tent.",
    modelAnswer: "Quick and efficient, done without wasted time or hesitation.",
    acceptedAnswers: ["quick and efficient", "fast", "no-nonsense", "energetic and prompt"],
    transferClass: "NEAR_TRANSFER", validation: "TIER2_ACCEPTED_SET",
    misconception: "Confusing 'brisk' with 'rude' or 'unfriendly', importing a negative tone the word doesn't carry here.",
  }),
  q({
    id: "w2-morningpatrol-05", passageId: "wave2-eng-morningpatrol", family: "wave1-fam-synonym-battery",
    competency: "RC-03", qType: "QT-RC-04", legacySkill: "vocabulary", marks: 3,
    question: "Write a synonym for each of the following words as used in the passage: (a) 'abandoned' (abandoned the greenhouse) (b) 'stern' (c) 'efficiency'.",
    modelAnswer: "(a) abandoned: gave up on/left (b) stern: strict/serious (c) efficiency: effectiveness/competence.",
    acceptedAnswers: ["gave up on", "left", "deserted", "strict", "serious", "firm", "effectiveness", "competence", "skill"],
    transferClass: "NEAR_TRANSFER", validation: "TIER2_ACCEPTED_SET",
    misconception: "Confusing 'abandoned' in this sense (temporarily leaving a task) with permanently deserting someone.",
  }),
  q({
    id: "w2-morningpatrol-06", passageId: "wave2-eng-morningpatrol", family: "wave1-fam-quote-explain",
    competency: "RC-02", qType: "QT-RC-02", legacySkill: "evidence", marks: 4,
    question: "Find two quotations that show Priya is a careful, methodical person, and explain what each one shows.",
    modelAnswer: "'Her patrol of the botanical gardens always followed the same order' shows she values consistency and routine. She decides to 'go back to the greenhouse to do her actual job first... in the correct order', showing she prioritises doing things properly even when there's an exciting distraction.",
    quotationRequired: ["always followed the same order", "do her actual job first"],
    transferClass: "MIXED_TRANSFER", validation: "TIER3_QUOTATION_PLUS_EXPLANATION",
    misconception: "Choosing a quotation that shows curiosity about the boy rather than her methodical, orderly character.",
  }),
  q({
    id: "w2-morningpatrol-07", passageId: "wave2-eng-morningpatrol", family: "wave1-fam-tick-justify",
    competency: "RC-02", qType: "QT-RC-02", legacySkill: "inference", marks: 4,
    question: "Is Priya alarmed when she first finds the tent and sleeping boy? Tick Yes or No, then give two reasons for your answer, using evidence from the passage.",
    modelAnswer: "No. She considers waking him immediately but calmly reconsiders, and treats the situation with practical amusement rather than alarm, deciding a 'sleeping trespasser was considerably less urgent' than her actual job.",
    quotationRequired: ["considerably less urgent"],
    transferClass: "MIXED_TRANSFER", validation: "TIER3_QUOTATION_PLUS_EXPLANATION",
    misconception: "Assuming finding a stranger asleep in the garden must automatically mean alarm, without checking the passage's calmer actual tone.",
  }),
  q({
    id: "w2-morningpatrol-08", passageId: "wave2-eng-morningpatrol", family: "wave2-fam-multiselect",
    competency: "RC-01", qType: "QT-RC-09", legacySkill: "evidence", marks: 4,
    // Gate 4/5 live production walkthrough (Assessment Integrity
    // Correction, this session) found the original option G, "She skipped
    // her usual duck count," is ALSO directly true per the passage ("skipping
    // her usual duck count in her hurry") -- making 5 of the 8 options true
    // against a "Tick 4"/correctOptions-of-4 contract, an unanswerable
    // exact-match question. Corrected to a genuinely false, same-style
    // direct-contradiction distractor (mirrors option E's own failure
    // mode), matching supabase/migrations/185_morning_patrol_tick_selection_answer_key_correction.sql.
    // Passage, modelAnswer, correctOptions and every other option unchanged.
    question: "Tick 4 boxes that accurately describe things Priya did in the passage. A. She checked the greenhouse first, as usual. B. She found the gate already open. C. She counted the ducks as usual. D. She went straight to the rose beds. E. She woke the boy immediately. F. She found a tent at the old oak. G. She found the rose beds disturbed. H. She returned to the greenhouse before dealing with the boy.",
    modelAnswer: "B, D, F, H: the gate was open; she went to the rose beds first; she found the tent at the oak; she returned to the greenhouse before dealing with the boy.",
    correctOptions: ["B", "D", "F", "H"], requiredSelectionCount: 4,
    transferClass: "MIXED_TRANSFER", validation: "TIER6_MULTI_SELECT",
    misconception: "Selecting A or C, which describe her USUAL routine rather than what actually happened this disrupted Tuesday; selecting E, which the passage explicitly says she did not do; or selecting G, since the passage states the rose beds were untouched.",
  })
);

// ---------- Passage 3: The Understudy (emotion-cause + vocab priority) ----------
items.push(
  q({
    id: "w2-understudy-01", passageId: "wave2-eng-understudy", family: "wave1-fam-direct-retrieval",
    competency: "RC-01", qType: "QT-RC-01", legacySkill: "evidence", marks: 1,
    question: "Why did Oliver suddenly need to perform the lead role?",
    modelAnswer: "Daniel Okafor, who had the lead role, lost his voice forty minutes before curtain.",
    acceptedAnswers: ["daniel lost his voice", "the lead actor lost his voice"],
    transferClass: "ROUTINE", validation: "TIER2_ACCEPTED_SET",
    misconception: "Confusing why Oliver had to perform with how he felt about it.",
  }),
  q({
    id: "w2-understudy-02", passageId: "wave2-eng-understudy", family: "wave1-fam-vocab-explain",
    competency: "RC-03", qType: "QT-RC-03", legacySkill: "vocabulary", marks: 1,
    question: "Explain what the phrase 'performed a complicated manoeuvre' suggests about Oliver's stomach.",
    modelAnswer: "It is a way of describing a strong, uncomfortable feeling of nervousness or nausea, without stating plainly that he felt sick with nerves.",
    acceptedAnswers: ["he felt sick/nervous", "a wave of nausea/nerves", "an uncomfortable, nervous feeling"],
    transferClass: "FAR_TRANSFER", validation: "TIER2_ACCEPTED_SET",
    misconception: "Reading the phrase literally as a physical movement rather than recognising it as a figurative description of a nervous feeling.",
  }),
  q({
    id: "w2-understudy-03", passageId: "wave2-eng-understudy", family: "wave1-fam-synonym-battery",
    competency: "RC-03", qType: "QT-RC-04", legacySkill: "vocabulary", marks: 3,
    question: "Write a synonym for each of the following words as used in the passage: (a) 'decipher' (b) 'unbidden' (c) 'retained' (retained a single word).",
    modelAnswer: "(a) decipher: work out/interpret (b) unbidden: unprompted/without being asked for (c) retained: kept/remembered.",
    acceptedAnswers: ["work out", "interpret", "understand", "unprompted", "spontaneous", "without being asked", "kept", "remembered", "held onto"],
    transferClass: "NEAR_TRANSFER", validation: "TIER2_ACCEPTED_SET",
    misconception: "Confusing 'retained' (in memory) with a legal or financial sense of the word.",
  }),
  q({
    id: "w2-understudy-04", passageId: "wave2-eng-understudy", family: "wave1-fam-quote-explain",
    competency: "RC-02", qType: "QT-RC-02", legacySkill: "evidence", marks: 4,
    question: "Find two quotations that show Oliver had genuinely prepared for this role, even though he never expected to use it, and explain what each one shows.",
    modelAnswer: "'Muttering it under his breath on the bus' shows he rehearsed constantly, even in ordinary daily moments. 'Reciting it in the shower until his family had started giving him strange looks' shows his preparation was thorough enough to become a noticeable habit others commented on.",
    quotationRequired: ["muttering it under his breath on the bus", "reciting it in the shower until his family had started giving him strange looks"],
    transferClass: "MIXED_TRANSFER", validation: "TIER3_QUOTATION_PLUS_EXPLANATION",
    misconception: "Choosing evidence from the performance itself rather than the weeks of prior preparation the question asks about.",
  }),
  q({
    id: "w2-understudy-05", passageId: "wave2-eng-understudy", family: "wave1-fam-tick-justify",
    competency: "RC-02", qType: "QT-RC-02", legacySkill: "inference", marks: 4,
    question: "Does Oliver feel guilty about Daniel losing his voice? Tick Yes or No, then give two reasons for your answer, using evidence from the passage.",
    modelAnswer: "No, not really. The passage states he 'did not think about Daniel's lost voice again until the interval, and even then, only briefly, and with something that was not quite guilt', showing his mind was mostly occupied with his own performance rather than guilt.",
    quotationRequired: ["not quite guilt"],
    transferClass: "MIXED_TRANSFER", validation: "TIER3_QUOTATION_PLUS_EXPLANATION",
    misconception: "Assuming any understudy stepping in must feel guilty by default, rather than checking what the passage actually states.",
  }),
  q({
    id: "w2-understudy-06", passageId: "wave2-eng-understudy", family: "wave1-fam-emotion-cause",
    competency: "RC-02", qType: "QT-RC-08", legacySkill: "atmosphere", marks: 2,
    question: "How does Oliver feel by the third line of the play, and why?",
    modelAnswer: "He feels more settled or relaxed. Something in his chest 'had loosened slightly', and he found he was no longer just reciting memorised words but genuinely becoming the character, showing his nerves easing as he gets into the performance.",
    acceptedAnswers: ["more relaxed", "settled", "less nervous", "more confident"],
    transferClass: "FAR_TRANSFER", validation: "TIER5_NAMED_COMPONENT_PLUS_EXPLANATION",
    misconception: "Assuming he remains just as nervous throughout, missing the passage's clear description of his nerves easing after the first two lines.",
  })
);

// ---------- Passage 4: Two Letters (two-character via dual voice) ----------
items.push(
  q({
    id: "w2-twoletters-01", passageId: "wave2-eng-twoletters", family: "wave1-fam-direct-retrieval",
    competency: "RC-01", qType: "QT-RC-01", legacySkill: "evidence", marks: 1,
    question: "What did Grandad do to the fence, and when?",
    modelAnswer: "He flattened it to the ground by eight o'clock in the morning, without asking anyone first.",
    acceptedAnswers: ["flattened it by 8am", "knocked it down early in the morning"],
    transferClass: "ROUTINE", validation: "TIER2_ACCEPTED_SET",
    misconception: "Confusing when Grandad acted with when Mr Henderson came outside.",
  }),
  q({
    id: "w2-twoletters-02", passageId: "wave2-eng-twoletters", family: "wave1-fam-two-character",
    competency: "RC-02", qType: "QT-RC-07", legacySkill: "character", marks: 4,
    question: "Using evidence from both letters, explain how Robyn's and Iris's reactions to the fence story differ.",
    modelAnswer: "Robyn finds the story exciting and funny, calling it 'the most exciting thing that's happened on this street in years'. Iris is more cautious and worried, focusing on what could have gone wrong and saying she'd have been 'mortified' if it were her own grandad.",
    quotationRequired: ["the most exciting thing that's happened on this street in years", "mortified"],
    transferClass: "MIXED_TRANSFER", validation: "TIER3_QUOTATION_PLUS_EXPLANATION",
    misconception: "Describing only one cousin's reaction, or treating both letters as expressing the same opinion.",
  }),
  q({
    id: "w2-twoletters-03", passageId: "wave2-eng-twoletters", family: "wave1-fam-vocab-explain",
    competency: "RC-03", qType: "QT-RC-03", legacySkill: "vocabulary", marks: 1,
    question: "Explain what Iris means when she says their two sides of the family have different attitudes to worrying.",
    modelAnswer: "She means her side of the family tends to worry more about safety and consequences, while Robyn's side worries less and is more relaxed about risk.",
    acceptedAnswers: ["her family worries more, robyn's worries less", "different levels of caution between the families"],
    transferClass: "FAR_TRANSFER", validation: "TIER2_ACCEPTED_SET",
    misconception: "Missing that this is Iris's own generalisation about both families, not a fact stated elsewhere in the letters.",
  }),
  q({
    id: "w2-twoletters-04", passageId: "wave2-eng-twoletters", family: "wave1-fam-tick-justify",
    competency: "RC-02", qType: "QT-RC-02", legacySkill: "inference", marks: 4,
    question: "Does Iris fully disapprove of what Grandad did? Tick Yes or No, then give two reasons for your answer, using evidence from the passage.",
    modelAnswer: "No, not fully. Although she raises concerns, she ends by saying 'tell Grandad I said well done anyway', showing a mix of concern and genuine approval rather than outright disapproval.",
    quotationRequired: ["well done anyway"],
    transferClass: "MIXED_TRANSFER", validation: "TIER3_QUOTATION_PLUS_EXPLANATION",
    misconception: "Focusing only on Iris's worried opening paragraph and missing her more approving closing line.",
  }),
  q({
    id: "w2-twoletters-05", passageId: "wave2-eng-twoletters", family: "wave1-fam-quote-explain",
    competency: "RC-02", qType: "QT-RC-02", legacySkill: "evidence", marks: 4,
    question: "Find two quotations from Robyn's letter that show she finds the whole event funny rather than concerning, and explain what each one shows.",
    modelAnswer: "Grandad saying 'morning, Terry, thought I'd sort this out' 'as if this were a perfectly normal Tuesday activity' shows Robyn finds the casualness of it amusing. Comparing it to 'the time the ice cream van caught fire' shows she is treating it as an entertaining local event, not a serious problem.",
    quotationRequired: ["as if this were a perfectly normal Tuesday activity", "the time the ice cream van caught fire"],
    transferClass: "MIXED_TRANSFER", validation: "TIER3_QUOTATION_PLUS_EXPLANATION",
    misconception: "Selecting a quotation from Iris's letter instead of Robyn's, answering about the wrong character.",
  }),
  q({
    id: "w2-twoletters-06", passageId: "wave2-eng-twoletters", family: "wave1-fam-sequencing",
    competency: "RC-04", qType: "QT-RC-06", legacySkill: "structure", marks: 3,
    question: "Write down three things that happened, in the order they happened.",
    modelAnswer: "1. Grandad flattened the fence at half past seven in the morning. 2. Mr Henderson came outside in his dressing gown, confused. 3. Robyn wrote to Iris describing what happened.",
    orderedAnswer: ["Grandad flattened the fence", "Mr Henderson came outside confused", "Robyn wrote her letter"],
    transferClass: "NEAR_TRANSFER", validation: "TIER4_ORDERED_LIST",
    misconception: "Placing Iris's reply letter before Robyn's original letter, reversing the order established by the passage's own introduction.",
  })
);

// ---------- Passage 5: The Long Walk Home (multi-select priority) ----------
items.push(
  q({
    id: "w2-longwalk-01", passageId: "wave2-eng-longwalk", family: "wave1-fam-direct-retrieval",
    competency: "RC-01", qType: "QT-RC-01", legacySkill: "evidence", marks: 1,
    question: "Why did the narrator decide to walk home?",
    modelAnswer: "The bus had not come after twenty minutes of waiting, at a stop with no shelter, and it was starting to rain.",
    acceptedAnswers: ["the bus didn't come", "bus was late/never arrived"],
    transferClass: "ROUTINE", validation: "TIER2_ACCEPTED_SET",
    misconception: "Confusing this reason with a later decision made during the walk itself, such as cutting through the alley.",
  }),
  q({
    // Gate 4/5 live production walkthrough (Assessment Integrity
    // Correction, this session) found option C, "Sheltered at the park
    // bus shelter," is ALSO directly true per the passage ("ducked under
    // the bus shelter there instead, the working one") -- making 5 of
    // the 8 options true against a "Tick 4"/correctOptions-of-4
    // contract, the same defect class as w2-morningpatrol-08 (Decision
    // 263). Corrected to a genuinely false, same-style distractor
    // (mirrors option B/D/G's own direct-contradiction shape), matching
    // supabase/migrations/187_multiselect_family_integrity_correction.sql.
    // Passage, correctOptions and every other option unchanged.
    id: "w2-longwalk-02", passageId: "wave2-eng-longwalk", family: "wave2-fam-multiselect",
    competency: "RC-01", qType: "QT-RC-09", legacySkill: "evidence", marks: 4,
    question: "Tick 4 boxes that accurately describe things the narrator did on the way home. A. Walked down Kestrel Road first. B. Waited at the bus stop the whole time. C. Went straight past the park without stopping. D. Bought a bike from the corner shop. E. Cut through the alley behind the launderette. F. Stopped at the corner shop for crisps. G. Took a taxi for part of the way. H. Crossed the main road at the pelican crossing.",
    modelAnswer: "A, E, F, H: she walked down Kestrel Road first, cut through the alley behind the launderette, stopped at the corner shop for crisps, and crossed the main road at the pelican crossing.",
    correctOptions: ["A", "E", "F", "H"], requiredSelectionCount: 4,
    transferClass: "MIXED_TRANSFER", validation: "TIER6_MULTI_SELECT",
    misconception: "Selecting B, D or G, which the passage explicitly contradicts (the bus never came, no bike was bought, no taxi is mentioned), or C, since she did stop at the park to shelter from the rain.",
  }),
  q({
    id: "w2-longwalk-03", passageId: "wave2-eng-longwalk", family: "wave1-fam-sequencing",
    competency: "RC-04", qType: "QT-RC-06", legacySkill: "structure", marks: 3,
    question: "Write down three places the narrator passed through on the way home, in the order they passed through them.",
    modelAnswer: "1. Kestrel Road, past the boarded-up shop and the park. 2. The alley behind the launderette. 3. The corner shop.",
    orderedAnswer: ["Kestrel Road / the park", "the alley behind the launderette", "the corner shop"],
    transferClass: "NEAR_TRANSFER", validation: "TIER4_ORDERED_LIST",
    misconception: "Placing the pelican crossing before the corner shop, reversing the order given in the passage.",
  }),
  q({
    id: "w2-longwalk-04", passageId: "wave2-eng-longwalk", family: "wave1-fam-vocab-explain",
    competency: "RC-03", qType: "QT-RC-03", legacySkill: "vocabulary", marks: 1,
    question: "Explain what the phrase 'a sky that was turning the specific shade of grey that meant business' suggests about the weather.",
    modelAnswer: "It suggests the sky looked seriously threatening, as though heavy rain or a storm was clearly about to start, not just a light shower.",
    acceptedAnswers: ["it looked like serious/heavy rain was coming", "threatening weather", "a storm was clearly about to happen"],
    transferClass: "FAR_TRANSFER", validation: "TIER2_ACCEPTED_SET",
    misconception: "Reading 'meant business' too literally rather than recognising it as an informal expression for something serious being about to happen.",
  }),
  q({
    id: "w2-longwalk-05", passageId: "wave2-eng-longwalk", family: "wave1-fam-synonym-battery",
    competency: "RC-03", qType: "QT-RC-04", legacySkill: "vocabulary", marks: 3,
    question: "Write a synonym for each of the following words as used in the passage: (a) 'miserable' (b) 'infuriatingly' (c) 'genuine' (genuine achievement).",
    modelAnswer: "(a) miserable: unpleasant/wretched (b) infuriatingly: annoyingly/frustratingly (c) genuine: real/true.",
    acceptedAnswers: ["unpleasant", "wretched", "awful", "annoyingly", "frustratingly", "irritatingly", "real", "true", "authentic"],
    transferClass: "NEAR_TRANSFER", validation: "TIER2_ACCEPTED_SET",
    misconception: "Confusing 'genuine' (real/true) with 'generous', a similar-looking but unrelated word.",
  }),
  q({
    id: "w2-longwalk-06", passageId: "wave2-eng-longwalk", family: "wave1-fam-quote-explain",
    competency: "RC-02", qType: "QT-RC-02", legacySkill: "evidence", marks: 4,
    question: "Find two quotations that show the narrator is trying to make the best of an unpleasant situation, and explain what each one shows.",
    modelAnswer: "Buying crisps 'mostly as an excuse to stand under their awning' shows practical, resourceful thinking to shelter from the rain. Feeling that arriving home 'no longer actively being rained on... felt like a genuine achievement' shows they are finding a small positive in a frustrating walk.",
    quotationRequired: ["mostly as an excuse to stand under their awning", "felt like a genuine achievement"],
    transferClass: "MIXED_TRANSFER", validation: "TIER3_QUOTATION_PLUS_EXPLANATION",
    misconception: "Choosing a quotation that simply describes the rain rather than the narrator's resourceful, positive response to it.",
  })
);

// ---------- Passage 6: The Science Fair (two-character rivals) ----------
items.push(
  q({
    id: "w2-sciencefair-01", passageId: "wave2-eng-sciencefair", family: "wave1-fam-direct-retrieval",
    competency: "RC-01", qType: "QT-RC-01", legacySkill: "evidence", marks: 1,
    question: "How long had Ben been planning his volcano project?",
    modelAnswer: "Since September.",
    acceptedAnswers: ["since september", "months"],
    transferClass: "ROUTINE", validation: "TIER2_ACCEPTED_SET",
    misconception: "Confusing Ben's long preparation time with Zara's, who decided the night before.",
  }),
  q({
    id: "w2-sciencefair-02", passageId: "wave2-eng-sciencefair", family: "wave1-fam-two-character",
    competency: "RC-02", qType: "QT-RC-07", legacySkill: "character", marks: 4,
    question: "Using evidence from the passage, explain how Ben's and Zara's approaches to the science fair differ.",
    modelAnswer: "Ben prepares extensively and formally, with a testing log, research, and rehearsed technical language. Zara prepares minimally and informally, deciding her project the night before and relying on a simple live demonstration rather than technical explanation.",
    quotationRequired: ["a testing log with dated entries", "tested it on myself about four times this morning"],
    transferClass: "MIXED_TRANSFER", validation: "TIER3_QUOTATION_PLUS_EXPLANATION",
    misconception: "Assuming Zara's lack of preparation means her project was worse, when the passage shows the judges responded very positively to it.",
  }),
  q({
    id: "w2-sciencefair-03", passageId: "wave2-eng-sciencefair", family: "wave1-fam-vocab-explain",
    competency: "RC-03", qType: "QT-RC-03", legacySkill: "vocabulary", marks: 1,
    question: "Explain what the phrase 'polite, unremarkable interest' suggests about the judges' reaction to Ben's demonstration.",
    modelAnswer: "It suggests the judges were courteous but not especially excited or impressed, finding it competent but not memorable.",
    acceptedAnswers: ["not very impressed/excited", "competent but not memorable", "mild, courteous interest"],
    transferClass: "FAR_TRANSFER", validation: "TIER2_ACCEPTED_SET",
    misconception: "Assuming 'polite' interest means the judges were very impressed, missing that 'unremarkable' signals the opposite.",
  }),
  q({
    id: "w2-sciencefair-04", passageId: "wave2-eng-sciencefair", family: "wave1-fam-tick-justify",
    competency: "RC-02", qType: "QT-RC-02", legacySkill: "inference", marks: 4,
    question: "Does Ben seem confident about Zara's chances at the fair before the judging happens? Tick Yes or No, then give two reasons for your answer, using evidence from the passage.",
    modelAnswer: "No. He points out she 'didn't even test it' and has 'a good answer' to nothing she says, suggesting he doubts her minimal preparation compared to his own thorough approach.",
    quotationRequired: ["You didn't even test it"],
    transferClass: "MIXED_TRANSFER", validation: "TIER3_QUOTATION_PLUS_EXPLANATION",
    misconception: "Assuming Ben is simply being unkind rather than genuinely doubting her chances based on her lack of preparation.",
  }),
  q({
    id: "w2-sciencefair-05", passageId: "wave2-eng-sciencefair", family: "wave1-fam-emotion-cause",
    competency: "RC-02", qType: "QT-RC-08", legacySkill: "atmosphere", marks: 2,
    question: "How does Zara feel by the end of the passage, and why?",
    modelAnswer: "She feels happy and pleased. She is 'extremely happy' to keep repeating her hair trick for other children after winning her certificate, showing she enjoyed both the recognition and the fun of the demonstration itself.",
    acceptedAnswers: ["happy", "pleased", "delighted", "proud"],
    transferClass: "FAR_TRANSFER", validation: "TIER5_NAMED_COMPONENT_PLUS_EXPLANATION",
    misconception: "Assuming she feels disappointed for not winning the same certificate as Ben, missing that her own certificate and the attention she received made her genuinely happy.",
  })
);

// ---------- Passage 7: Storm Warning (multi-select + sequencing priority) ----------
items.push(
  q({
    id: "w2-stormwarning-01", passageId: "wave2-eng-stormwarning", family: "wave1-fam-direct-retrieval",
    competency: "RC-01", qType: "QT-RC-01", legacySkill: "evidence", marks: 1,
    question: "What job was the narrator given to help prepare for the storm?",
    modelAnswer: "Securing the wheelie bins.",
    acceptedAnswers: ["the bins", "securing the bins", "wheelie bins"],
    transferClass: "ROUTINE", validation: "TIER2_ACCEPTED_SET",
    misconception: "Confusing the narrator's job with Dad's (the trampoline) or Mum's (the windows).",
  }),
  q({
    // Gate 4/5 live production walkthrough (Assessment Integrity
    // Correction, this session) found option E, "The family lost power
    // before dinner," is ALSO directly true per the passage ("We lost
    // power just after six... We ate dinner by torchlight" only makes
    // sense if power was already out) -- the same defect class as
    // w2-morningpatrol-08 and w2-longwalk-02 (Decision 263). The row's
    // own modelAnswer had hedged this as "true depending on the
    // definition of 'before dinner'" -- the hedge was itself evidence
    // the row needed correcting, not evidence the ambiguity was
    // acceptable. Corrected to a genuinely false, same-style distractor
    // ("Mum trusted the window to stay shut on its own" -- directly
    // contradicted: she is shown "watching the window... as if she
    // didn't quite trust it to stay shut on its own"), matching
    // supabase/migrations/187_multiselect_family_integrity_correction.sql.
    // Passage, correctOptions and every other option unchanged.
    id: "w2-stormwarning-02", passageId: "wave2-eng-stormwarning", family: "wave2-fam-multiselect",
    competency: "RC-01", qType: "QT-RC-09", legacySkill: "evidence", marks: 4,
    question: "Tick 4 boxes that accurately describe things that happened in the passage. A. Dad flattened the trampoline. B. Theo helped carry the bins. C. Mum closed and checked the windows. D. The narrator secured the wheelie bins. E. Mum trusted the window to stay shut on its own. F. Theo was frightened by the storm. G. Dad made a final trip to check the trampoline. H. They ate dinner in a restaurant.",
    modelAnswer: "A, C, D, G: Dad flattened the trampoline, Mum closed and checked the windows, the narrator secured the wheelie bins, and Dad made a final trip to check the trampoline.",
    correctOptions: ["A", "C", "D", "G"], requiredSelectionCount: 4,
    transferClass: "MIXED_TRANSFER", validation: "TIER6_MULTI_SELECT",
    misconception: "Selecting B or H, which the passage does not support (Theo gave commentary, not help with bins; dinner was eaten at home by torchlight), F, since Theo is shown to be excited rather than frightened, or E, since Mum is shown watching the window as though she did not trust it to stay shut.",
  }),
  q({
    id: "w2-stormwarning-03", passageId: "wave2-eng-stormwarning", family: "wave1-fam-sequencing",
    competency: "RC-04", qType: "QT-RC-06", legacySkill: "structure", marks: 3,
    question: "Write down three things that happened during the storm preparations, in the order they happened.",
    modelAnswer: "1. Dad flattened the trampoline and weighed the corners down. 2. Mum closed and checked every window. 3. The narrator dragged the bins into the side passage.",
    orderedAnswer: ["Dad flattened the trampoline", "Mum closed and checked the windows", "narrator secured the bins"],
    transferClass: "NEAR_TRANSFER", validation: "TIER4_ORDERED_LIST",
    misconception: "Placing the power cut, which happens much later, among the early preparation steps.",
  }),
  q({
    id: "w2-stormwarning-04", passageId: "wave2-eng-stormwarning", family: "wave1-fam-vocab-explain",
    competency: "RC-03", qType: "QT-RC-03", legacySkill: "vocabulary", marks: 1,
    question: "Explain what the phrase 'hammering against the windows' suggests about the rain.",
    modelAnswer: "It suggests the rain was extremely heavy and forceful, hitting the windows loudly and repeatedly, almost like something physically striking them.",
    acceptedAnswers: ["very heavy, forceful rain", "loud, repeated hitting rain", "intense rain"],
    transferClass: "NEAR_TRANSFER", validation: "TIER2_ACCEPTED_SET",
    misconception: "Reading the phrase too literally as an actual hammer, rather than recognising it as a comparison for the intensity and sound of the rain.",
  }),
  q({
    id: "w2-stormwarning-05", passageId: "wave2-eng-stormwarning", family: "wave1-fam-quote-explain",
    competency: "RC-02", qType: "QT-RC-02", legacySkill: "evidence", marks: 4,
    question: "Find two quotations that show Mum is anxious during the storm, and explain what each one shows.",
    modelAnswer: "She moves through the house 'methodically, closing every window and checking each latch twice', showing careful, repeated checking driven by worry. She watches the window Dad has just secured 'as if she didn't quite trust it to stay shut on its own', showing lingering anxiety even after taking precautions.",
    quotationRequired: ["checking each latch twice", "as if she didn't quite trust it to stay shut on its own"],
    transferClass: "MIXED_TRANSFER", validation: "TIER3_QUOTATION_PLUS_EXPLANATION",
    misconception: "Choosing a quotation about Theo's excitement instead of Mum's anxiety, answering about the wrong character.",
  }),
  q({
    id: "w2-stormwarning-06", passageId: "wave2-eng-stormwarning", family: "wave1-fam-emotion-cause",
    competency: "RC-02", qType: "QT-RC-08", legacySkill: "atmosphere", marks: 2,
    question: "How does Theo feel about the power cut, and why is this surprising given the situation?",
    modelAnswer: "He feels delighted, declaring it 'the best part so far'. This is surprising because a power cut during a storm is usually a stressful inconvenience for a family, but Theo, who treats extreme weather as entertainment, finds it exciting rather than worrying.",
    acceptedAnswers: ["delighted", "excited", "thrilled", "happy"],
    transferClass: "FAR_TRANSFER", validation: "TIER5_NAMED_COMPONENT_PLUS_EXPLANATION",
    misconception: "Assuming Theo must be scared like a typical reaction to a power cut, missing his established character trait of finding extreme weather entertaining.",
  })
);

// ---------- Passage 8: The Piano Recital (vocab/synonym depth) ----------
items.push(
  q({
    id: "w2-pianorecital-01", passageId: "wave2-eng-pianorecital", family: "wave1-fam-direct-retrieval",
    competency: "RC-01", qType: "QT-RC-01", legacySkill: "evidence", marks: 1,
    question: "What did Freya's teacher say to her after the performance?",
    modelAnswer: "'The middle section.'",
    acceptedAnswers: ["the middle section", "she said the middle section"],
    transferClass: "ROUTINE", validation: "TIER2_ACCEPTED_SET",
    misconception: "Inventing a longer piece of praise rather than the brief phrase the passage actually gives.",
  }),
  q({
    id: "w2-pianorecital-02", passageId: "wave2-eng-pianorecital", family: "wave1-fam-vocab-explain",
    competency: "RC-03", qType: "QT-RC-03", legacySkill: "vocabulary", marks: 1,
    question: "Explain what the word 'tentative' means as used to describe the first few bars Freya played.",
    modelAnswer: "Hesitant and uncertain, played cautiously rather than confidently.",
    acceptedAnswers: ["hesitant", "uncertain", "cautious", "unsure"],
    transferClass: "NEAR_TRANSFER", validation: "TIER2_ACCEPTED_SET",
    misconception: "Confusing 'tentative' with 'quiet', missing the sense of uncertainty specifically, not just low volume.",
  }),
  q({
    id: "w2-pianorecital-03", passageId: "wave2-eng-pianorecital", family: "wave1-fam-synonym-battery",
    competency: "RC-03", qType: "QT-RC-04", legacySkill: "vocabulary", marks: 3,
    question: "Write a synonym for each of the following words as used in the passage: (a) 'composure' (b) 'fluent' (c) 'absorbed' (absorbed in the piece).",
    modelAnswer: "(a) composure: calmness/self-control (b) fluent: smooth/flowing (c) absorbed: engrossed/focused.",
    acceptedAnswers: ["calmness", "self-control", "poise", "smooth", "flowing", "confident", "engrossed", "focused", "immersed"],
    transferClass: "NEAR_TRANSFER", validation: "TIER2_ACCEPTED_SET",
    misconception: "Confusing 'absorbed' in this sense (mentally engrossed) with a liquid being physically absorbed.",
  }),
  q({
    id: "w2-pianorecital-04", passageId: "wave2-eng-pianorecital", family: "wave1-fam-tick-justify",
    competency: "RC-02", qType: "QT-RC-02", legacySkill: "inference", marks: 4,
    question: "Does Freya's performance improve as the piece goes on? Tick Yes or No, then give two reasons for your answer, using evidence from the passage.",
    modelAnswer: "Yes. The passage explicitly says 'the tentative quality fell away, replaced by the fluent, almost automatic motion', and by the final chord she is fully absorbed in the music rather than nervous, both showing clear improvement over the course of the performance.",
    quotationRequired: ["The tentative quality fell away"],
    transferClass: "MIXED_TRANSFER", validation: "TIER3_QUOTATION_PLUS_EXPLANATION",
    misconception: "Focusing only on her nervous opening and missing the passage's clear description of improvement partway through.",
  }),
  q({
    id: "w2-pianorecital-05", passageId: "wave2-eng-pianorecital", family: "wave1-fam-quote-explain",
    competency: "RC-02", qType: "QT-RC-02", legacySkill: "evidence", marks: 4,
    question: "Find two quotations that show Freya's teacher is proud of her, even though few words are used, and explain what each one shows.",
    modelAnswer: "The teacher's brief comment '\"the middle section\"' shows specific, genuine praise rather than generic congratulation, suggesting real pride in a particular detail. The description of her expression as pride 'worn slightly awkwardly, like a coat that didn't quite fit' shows the teacher feels proud but is not naturally expressive about it.",
    quotationRequired: ["worn slightly awkwardly, like a coat that didn't quite fit"],
    transferClass: "MIXED_TRANSFER", validation: "TIER3_QUOTATION_PLUS_EXPLANATION",
    misconception: "Assuming the teacher's brief comment means she was unimpressed, missing that the passage explicitly identifies her expression as pride.",
  }),
  q({
    id: "w2-pianorecital-06", passageId: "wave2-eng-pianorecital", family: "wave1-fam-emotion-cause",
    competency: "RC-02", qType: "QT-RC-08", legacySkill: "atmosphere", marks: 2,
    question: "How does Freya feel in the recital hall in the minutes before she is called, and why?",
    modelAnswer: "She feels nervous or anxious. The hall's smell is associated with 'nervous anticipation', and she is preoccupied with worry about whether her fingers will remember the piece once she actually sits down.",
    acceptedAnswers: ["nervous", "anxious", "worried", "apprehensive"],
    transferClass: "FAR_TRANSFER", validation: "TIER5_NAMED_COMPONENT_PLUS_EXPLANATION",
    misconception: "Assuming she feels confident throughout, missing the passage's clear early description of her nervous anticipation before playing.",
  })
);

// ============================================================
// Educational Increment 007C completion (Founder directive:
// "COMPLETION, PRODUCTION ACTIVATION AND LEARNING-LOOP CLOSURE").
// 12 additional questions, +1 new passage, completing the 60-90
// authorised range (50 -> 62) and reaching the required depth floors:
// multiselect 3 -> 6, cumulative two-character 4 -> 6, plus 3
// structurally distinct new sequencing sub-types (action-reconstruction,
// cause/effect, dispersed-evidence) rather than repeating the existing
// reorder-events pattern. Existing passages assessed first for genuine
// capacity (Part 4) before this new passage was written — twoletters
// (a short 303-word epistolary passage) had already had its strongest
// quotable evidence used by the first 50 questions, so a second
// two-character question there would have forced reused or weak
// evidence; a new passage was the honest choice instead.
// ============================================================

// ---------- Passage 9: "The Surprise" — two-character (organiser vs. relaxed helper), multiselect, action-reconstruction sequencing ----------
const p9Text = `The clock in the hallway read four fifteen, which meant Kofi had exactly forty-five minutes before Mum's train got in, and precisely none of it to waste.

He had planned this for three weeks: a spreadsheet of tasks, a group chat with strict instructions, and a hiding spot for the banner that even his own memory hadn't fully committed to trusting. His cousin Leo had been assigned the streamers and, in Kofi's opinion, was treating the entire operation with a worrying lack of urgency.

"Relax," Leo said, taping a streamer to the doorframe at an angle Kofi found personally offensive. "She's not going to notice a slightly wonky streamer."

"She's going to notice everything. That's the whole problem." Kofi checked the group chat again, a nervous habit he'd developed roughly every ninety seconds since lunchtime.

At four thirty, Leo wandered into the kitchen, phone in hand, and very nearly answered a video call from Mum's sister without checking who else might be listening on the other end of the room. Kofi lunged for the phone with a speed he hadn't previously known he possessed.

"You almost said the word surprise out loud. On a call. That she could have walked in on."

"I didn't, though," Leo said, entirely unbothered, retrieving his phone. "Crisis averted."

Kofi did not find this reassuring.

By five o'clock the banner was up, slightly crooked in a way only Kofi appeared to notice, the lights were dimmed exactly as the spreadsheet specified, and everyone was crouched behind the sofa in a silence that felt, to Kofi, dangerously fragile.

The front door opened at five past five. There was a beat of pure, held-breath quiet, and then the whole room erupted at once, Leo loudest of anyone, as if he personally hadn't spent the previous forty minutes threatening to ruin the entire thing.`;
assertNoDash(p9Text, "p9Text");
passages.push({
  id: "wave2-eng-surprise", title: "The Surprise", originalText: p9Text,
  textType: "narrative-extract", genre: "contemporary-realistic-fiction",
  wordCount: wordCount(p9Text), readingComplexity: "moderate",
  passageFamily: "wave2-family-cousin-contrast", provenance: "angel_original",
  copyrightStatus: "Angel original, unpublished; no external rights holder", contentDifficulty: "medium",
});

items.push(
  q({
    id: "w2-surprise-01", passageId: "wave2-eng-surprise", family: "wave1-fam-two-character",
    competency: "RC-02", qType: "QT-RC-07", legacySkill: "character", marks: 4,
    question: "Using evidence from the passage, explain how Kofi's and Leo's attitudes to keeping the party secret differ.",
    modelAnswer: "Kofi is anxious and highly vigilant, checking the group chat constantly and treating every small risk as a serious threat to the surprise. Leo is relaxed almost to the point of carelessness, staying calm even after nearly answering a call that could have given the surprise away.",
    quotationRequired: ["a nervous habit he'd developed roughly every ninety seconds", "entirely unbothered"],
    transferClass: "MIXED_TRANSFER", validation: "TIER3_QUOTATION_PLUS_EXPLANATION",
    misconception: "Describing only Kofi's nervousness without contrasting it against Leo's calm reaction to the near miss with the phone call.",
  }),
  q({
    id: "w2-surprise-02", passageId: "wave2-eng-surprise", family: "wave2-fam-multiselect",
    competency: "RC-01", qType: "QT-RC-09", legacySkill: "evidence", marks: 4,
    question: "Tick 4 boxes that accurately describe things that happened while getting ready for the surprise. A. Leo taped a streamer to the doorframe. B. Kofi hid the banner somewhere even he might forget. C. Leo answered Mum's sister's video call. D. The lights were dimmed at five o'clock. E. Kofi checked the group chat only once. F. Everyone hid behind the sofa. G. Mum arrived exactly at four fifteen. H. The banner ended up perfectly straight.",
    modelAnswer: "A, B, D, F.",
    correctOptions: ["A", "B", "D", "F"], requiredSelectionCount: 4,
    transferClass: "NEAR_TRANSFER", validation: "TIER6_MULTI_SELECT",
    misconception: "Ticking C because Leo nearly answered the call, without noticing the passage says he did not actually answer it; or ticking G, confusing four fifteen (when the countdown started) with when Mum actually arrived.",
  }),
  q({
    id: "w2-surprise-03", passageId: "wave2-eng-surprise", family: "wave1-fam-vocab-explain",
    competency: "RC-03", qType: "QT-RC-05", legacySkill: "vocabulary", marks: 2,
    question: "Explain what the phrase 'entirely unbothered' suggests about how Leo reacted to nearly answering the phone call.",
    modelAnswer: "It suggests Leo felt completely calm and unworried about the near miss, not at all shaken by how close it came to ruining the surprise.",
    acceptedAnswers: ["calm", "relaxed", "not worried", "not concerned", "unconcerned", "casual", "unfazed"],
    transferClass: "NEAR_TRANSFER", validation: "TIER2_ACCEPTED_SET",
    misconception: "Assuming 'unbothered' means Leo didn't understand the risk, rather than that he understood it but simply wasn't anxious about it.",
  }),
  q({
    id: "w2-surprise-04", passageId: "wave2-eng-surprise", family: "wave1-fam-sequencing",
    competency: "RC-04", qType: "QT-RC-06", legacySkill: "structure", marks: 3,
    question: "Write down these three things in the order they happened: the lights being dimmed, Leo nearly answering the video call, Leo taping the streamer to the doorframe.",
    modelAnswer: "1. Leo taping the streamer to the doorframe. 2. Leo nearly answering the video call. 3. The lights being dimmed.",
    orderedAnswer: ["taping the streamer to the doorframe", "nearly answering the video call", "the lights being dimmed"],
    transferClass: "NEAR_TRANSFER", validation: "TIER4_ORDERED_LIST",
    misconception: "Placing the video call incident first because it feels like the most dramatic moment, rather than checking each event's actual position in the passage.",
  })
);

// ---------- Additional depth on existing Wave 2 passages (two-character, sequencing, multiselect, vocab, quote-explain) ----------
items.push(
  q({
    id: "w2-sciencefair-06", passageId: "wave2-eng-sciencefair", family: "wave1-fam-two-character",
    competency: "RC-02", qType: "QT-RC-07", legacySkill: "character", marks: 4,
    question: "Using evidence from the passage, explain how Ben's and Zara's explanations to the judges differ in style.",
    modelAnswer: "Ben delivers a rehearsed, technical explanation using correct chemical terminology, exactly as he had practised. Zara explains her project live and informally, in far simpler language, relying on demonstrating the effect on herself rather than technical vocabulary.",
    quotationRequired: ["exactly as rehearsed, complete with the correct chemical terminology", "far less technical language than Ben had used"],
    transferClass: "MIXED_TRANSFER", validation: "TIER3_QUOTATION_PLUS_EXPLANATION",
    misconception: "Describing what each project was about rather than how their explanations to the judges specifically differed in style.",
  }),
  q({
    id: "w2-sciencefair-07", passageId: "wave2-eng-sciencefair", family: "wave1-fam-sequencing",
    competency: "RC-04", qType: "QT-RC-06", legacySkill: "structure", marks: 4,
    question: "Write down these four things in the order they happened: Zara receiving her certificate, Zara forgetting the project was due, the judges coming round, Zara preparing her project.",
    modelAnswer: "1. Zara forgetting the project was due. 2. Zara preparing her project. 3. The judges coming round. 4. Zara receiving her certificate.",
    orderedAnswer: ["forgetting the project was due", "preparing her project", "the judges coming round", "receiving her certificate"],
    transferClass: "NEAR_TRANSFER", validation: "TIER4_ORDERED_LIST",
    misconception: "Ordering events by how they are grouped in the passage's paragraphs rather than by when they actually happened in the story.",
  }),
  q({
    id: "w2-stormwarning-07", passageId: "wave2-eng-stormwarning", family: "wave1-fam-sequencing",
    competency: "RC-04", qType: "QT-RC-06", legacySkill: "structure", marks: 4,
    question: "Write down these four things in the order they happened: the family losing power, the narrator being given the job of the bins, the rain turning sideways, Dad's final trip to check the trampoline.",
    modelAnswer: "1. The narrator being given the job of the bins. 2. The rain turning sideways. 3. Dad's final trip to check the trampoline. 4. The family losing power.",
    orderedAnswer: ["being given the job of the bins", "the rain turning sideways", "Dad's final trip to check the trampoline", "the family losing power"],
    transferClass: "FAR_TRANSFER", validation: "TIER4_ORDERED_LIST",
    misconception: "Only using the early paragraph about jobs being assigned and missing that the rain, the final trampoline check and the power cut are described later, spread across separate paragraphs.",
  }),
  q({
    id: "w2-twoletters-07", passageId: "wave2-eng-twoletters", family: "wave2-fam-multiselect",
    competency: "RC-01", qType: "QT-RC-09", legacySkill: "evidence", marks: 4,
    question: "Tick 4 boxes that accurately describe things mentioned in the two letters. A. Grandad flattened the fence at half past seven in the morning. B. Mr Henderson thanked Grandad for fixing the fence. C. The ice cream van caught fire on the street before. D. Iris was completely unbothered by what Grandad did. E. Mum says Robyn's side of the family worries too much. F. Robyn wrote her letter the same night the fence came down. G. Grandad asked Mr Henderson's permission first. H. Iris told Robyn to say well done to Grandad anyway.",
    modelAnswer: "A, C, F, H.",
    correctOptions: ["A", "C", "F", "H"], requiredSelectionCount: 4,
    transferClass: "NEAR_TRANSFER", validation: "TIER6_MULTI_SELECT",
    misconception: "Ticking E by remembering that Mum commented on the two sides of the family worrying differently, but reversing which side she said worries too much.",
  }),
  q({
    id: "w2-twoletters-08", passageId: "wave2-eng-twoletters", family: "wave1-fam-vocab-explain",
    competency: "RC-03", qType: "QT-RC-05", legacySkill: "vocabulary", marks: 2,
    question: "Explain what Iris means by saying the fence incident is 'basically proof of that theory'.",
    modelAnswer: "She means the fence incident supports or confirms what Mum always says about the two sides of the family having different attitudes to worrying.",
    acceptedAnswers: ["evidence", "confirmation", "support for the idea", "proves the idea", "backs up the idea", "confirms it"],
    transferClass: "MIXED_TRANSFER", validation: "TIER2_ACCEPTED_SET",
    misconception: "Explaining what the 'theory' itself is about, rather than what 'proof of that theory' means as a phrase.",
  }),
  q({
    id: "w2-pianorecital-07", passageId: "wave2-eng-pianorecital", family: "wave2-fam-multiselect",
    competency: "RC-01", qType: "QT-RC-09", legacySkill: "evidence", marks: 4,
    question: "Tick 4 boxes that accurately describe things that happen in the passage. A. The recital hall smells of polished wood. B. Freya forgets her piece completely. C. The first few bars are tentative and quiet. D. Freya's performance gets worse after the eighth bar. E. The audience's applause arrives before Freya expects it. F. Freya's teacher says only two words to her afterwards. G. Freya practises the piece for the first time that morning. H. The girl before Freya receives polite, dutiful applause.",
    modelAnswer: "A, C, F, H.",
    correctOptions: ["A", "C", "F", "H"], requiredSelectionCount: 4,
    transferClass: "NEAR_TRANSFER", validation: "TIER6_MULTI_SELECT",
    misconception: "Ticking D or E by assuming the passage describes things going wrong, when it actually describes Freya's playing improving and the applause arriving later than she expected, not earlier.",
  }),
  q({
    id: "w2-understudy-07", passageId: "wave2-eng-understudy", family: "wave1-fam-vocab-explain",
    competency: "RC-03", qType: "QT-RC-05", legacySkill: "vocabulary", marks: 2,
    question: "Explain what the phrase 'something in his chest had loosened slightly' suggests about how Oliver feels by the third line.",
    modelAnswer: "It suggests he feels a sense of relief and is becoming less anxious, as his nervous tension starts to ease.",
    acceptedAnswers: ["relief", "relieved", "less nervous", "calmer", "more relaxed", "less anxious", "more at ease"],
    transferClass: "NEAR_TRANSFER", validation: "TIER2_ACCEPTED_SET",
    misconception: "Confusing this moment of easing tension with the earlier, opposite description of his stomach performing 'a complicated manoeuvre'.",
  }),
  q({
    id: "w2-longwalk-07", passageId: "wave2-eng-longwalk", family: "wave1-fam-quote-explain",
    competency: "RC-02", qType: "QT-RC-02", legacySkill: "evidence", marks: 4,
    question: "Find two quotations that show the narrator notices small, specific details along the way, and explain what each one shows.",
    modelAnswer: "The detail of 'the boarded-up shop that had been boarded up for as long as I could remember' shows the narrator pays attention to small, unchanging features of their route. The description of the cat watching 'with what I chose to interpret as mild interest rather than judgement' shows the narrator notices tiny details and even imagines meaning behind them.",
    quotationRequired: ["boarded-up shop that had been boarded up for as long as I could remember", "mild interest rather than judgement"],
    transferClass: "FAR_TRANSFER", validation: "TIER3_QUOTATION_PLUS_EXPLANATION",
    misconception: "Choosing quotations about the narrator's feelings in general rather than ones that specifically show close observation of small details.",
  })
);

console.log(`\nQuestions authored: ${items.length}`);
const byFamily = {};
for (const it of items) byFamily[it.family] = (byFamily[it.family] || 0) + 1;
console.log("By family:", byFamily);
const byCompetency = {};
for (const it of items) byCompetency[it.competency] = (byCompetency[it.competency] || 0) + 1;
console.log("By competency:", byCompetency);
const byTransfer = {};
for (const it of items) byTransfer[it.transferClass] = (byTransfer[it.transferClass] || 0) + 1;
console.log("By transfer class:", byTransfer);
const byValidation = {};
for (const it of items) byValidation[it.validation] = (byValidation[it.validation] || 0) + 1;
console.log("By validation tier:", byValidation);
const totalMarks = items.reduce((s, it) => s + it.marks, 0);
console.log("Total marks:", totalMarks);

// Validation: duplicate id/question, quotation-verifiability, tier conformance.
const passageById = new Map(passages.map((p) => [p.id, p]));
let failCount = 0;
const seenIds = new Set();
const seenQuestions = new Set();
for (const it of items) {
  if (seenIds.has(it.id)) { console.error(`DUPLICATE ID: ${it.id}`); failCount++; }
  seenIds.add(it.id);
  if (seenQuestions.has(it.question)) { console.error(`DUPLICATE QUESTION: ${it.id}`); failCount++; }
  seenQuestions.add(it.question);
  const passage = passageById.get(it.passageId);
  if (!passage) { console.error(`UNKNOWN PASSAGE: ${it.id} -> ${it.passageId}`); failCount++; continue; }
  if (it.quotationRequired) {
    for (const quote of it.quotationRequired) {
      if (!passage.originalText.includes(quote)) {
        console.error(`QUOTATION NOT FOUND VERBATIM IN PASSAGE: ${it.id} -> "${quote}"`);
        failCount++;
      }
    }
  }
  if (it.validation === "TIER6_MULTI_SELECT") {
    if (!it.correctOptions || it.correctOptions.length !== it.requiredSelectionCount) {
      console.error(`TIER6 correctOptions/requiredSelectionCount mismatch: ${it.id}`);
      failCount++;
    }
  }
}
if (failCount > 0) {
  console.error(`\nWave 2 English generation: FAIL (${failCount} problems)`);
  process.exit(1);
}
console.log(`\nWave 2 English generation: PASS, ${items.length} items across ${passages.length} passages, 0 quotation-verification failures`);

writeFileSync(
  "C:/Users/Admin/AppData/Local/Temp/claude/C--Users-Admin/741c0ede-7d52-4a4c-9a84-915666c1c1bc/scratchpad/wave2_passages.json",
  JSON.stringify(passages, null, 2)
);
writeFileSync(
  "C:/Users/Admin/AppData/Local/Temp/claude/C--Users-Admin/741c0ede-7d52-4a4c-9a84-915666c1c1bc/scratchpad/wave2_items.json",
  JSON.stringify(items, null, 2)
);


export { passages, items, assertNoDash, wordCount, q };
