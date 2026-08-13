import { writeFileSync } from "node:fs";

// ============================================================
// Educational Increment 007B — CSSE English Wave 1.
// 6 original Angel passages, narrative fiction (the only genre the 007A
// evidence read — 2022/2023 CSSE Main Test papers — actually supports;
// no non-fiction/informational genre is manufactured here since the
// evidence doesn't show one). Each passage is wholly original: no
// character names, plot events, or distinctive wording from the CSSE
// extracts read in 007A ("I Capture the Castle", "The Good Companions").
// Every question belongs to one of 8 evidence-grounded families (007A
// Part 6-7), applied with genuine surface variation per instance, not
// copy-pasted with names changed.
// ============================================================

const passages = [];
const items = [];

function assertNoDash(text, ctx) {
  if (/[—–]/.test(text)) throw new Error(`${ctx}: em/en dash found — "${text}"`);
}

function wordCount(text) {
  return text.trim().split(/\s+/).length;
}

// ---------- Passage 1: "The Kite Maker" ----------
// Third-person, warm/gentle tone, moderate vocabulary, grandparent-child
// relationship, skill-teaching scene. Good ground for RC-01 retrieval,
// RC-02 inference (quiet pride/patience), RC-03 vocabulary-in-context.
const p1Text = `Grandad Owusu never rushed a kite. He said a kite built in a hurry would fly like it was built in a hurry: badly, and not for long. Every Saturday morning, while the rest of the house was still deciding whether to get up, he and Femi sat at the kitchen table with a pile of bamboo strips, a ball of string, and a stack of old newspapers that Grandad kept folded in a box marked, in faded pen, KITES ONLY.

Femi had watched him make a dozen kites before he was allowed to touch the bamboo himself. Grandad said this was not because Femi was too young, but because watching properly was its own kind of work. "Anyone can flap a kite about and call it flying," he told Femi, snipping a length of string with unhurried precision. "Only a few people notice why one kite climbs and another one drops into the hedge."

This Saturday, Grandad finally slid a bundle of bamboo strips across the table. "Your turn," he said. Femi's hands, usually so quick at video games, felt suddenly clumsy around the thin wood. He crossed two strips the way he had seen Grandad do it a hundred times, but the shape came out lopsided, one arm longer than the other.

He waited for Grandad to fix it. Grandad did not move.

"It's wrong," Femi said.

"It's a start," Grandad said. "Different thing entirely." He tapped the longer arm with one finger, not touching it, just pointing. "What do you notice?"

Femi looked. He measured the two arms with his eyes, then with his fingers. "This one's longer."

"So?"

"So it won't balance."

"So?"

Femi sighed, but he was smiling now, because this was the game Grandad always played, the one where he refused to simply say the answer. Femi trimmed the longer arm himself, checked it again, and this time the cross sat even. He looked up, half expecting praise, but Grandad only nodded once, as if Femi had merely confirmed something Grandad already knew.

It took Femi three more attempts before the frame held its shape without sagging. His fingers ached from pulling the string tight, and twice he had to unpick a knot that had gone stubborn and tangled. When the frame was finally finished, Grandad held it up to the window and turned it slowly, checking the balance against the light.

"Well," he said at last. "That'll fly."

Femi realised, watching Grandad's face, that this was the closest thing to a celebration he was going to get, and that somehow it was enough.`;
assertNoDash(p1Text, "p1Text");
passages.push({
  id: "wave1-eng-kitemaker",
  title: "The Kite Maker",
  originalText: p1Text,
  textType: "narrative-extract",
  genre: "contemporary-realistic-fiction",
  wordCount: wordCount(p1Text),
  readingComplexity: "moderate",
  passageFamily: "wave1-family-relationship-skill",
  provenance: "angel_original",
  copyrightStatus: "Angel original, unpublished; no external rights holder",
  contentDifficulty: "medium",
});

// ---------- Passage 2: "The Last Bus" ----------
// First-person, tension/waiting scene, higher emotional stakes, shorter
// sentences under stress. Good ground for RC-02 emotion inference and
// RC-04 sequencing (a clear chain of actions under time pressure).
const p2Text = `I had exactly six minutes to reach the bus stop on Ferry Road, and I was still four streets away when my shoelace came undone for the second time that morning.

I didn't stop. I told myself the lace could wait, the way you tell yourself lots of things can wait when you are already running. My bag thumped against my back with every stride, and somewhere inside it my recorder case was rattling loose against my water bottle, a sound that seemed, absurdly, to be counting down the minutes along with me.

At the corner of Wren Street I nearly collided with a man walking a dog nearly as tall as I was. He said something I didn't catch. I said sorry without really meaning it, because sorry was easier than stopping to explain that if I missed the 8:14 there would not be another bus for forty minutes, and forty minutes was exactly long enough to turn me from a girl who was occasionally a little late into a girl who had missed her audition entirely.

I could see the stop now, a low glass shelter with three people already waiting under it. I couldn't see the bus. That was something, at least. I slowed just slightly, enough to breathe, enough to feel my heart doing something urgent and uneven in my chest.

Then I saw it: a flash of red at the far end of Ferry Road, still small with distance, but unmistakably a bus, unmistakably mine.

I ran the last stretch properly then, lace flapping, bag thumping, arms pumping in a way that would have embarrassed me on any other morning. The three people at the stop turned to watch me coming, which embarrassed me anyway. I reached the shelter exactly as the bus doors hissed open, and for a moment I could not speak at all, could only stand there with my hands on my knees, gulping air like something that had been underwater too long.

The driver waited. He didn't have to, but he did, watching me in his mirror with an expression I couldn't read, somewhere between amusement and patience.

"Cutting it fine," he said, as I finally climbed the steps.

"Every time," I managed, and found, to my surprise, that I was laughing, actual proper laughing, the kind that comes when your body has been too frightened to laugh for the last six minutes and has finally been given permission.`;
assertNoDash(p2Text, "p2Text");
passages.push({
  id: "wave1-eng-lastbus",
  title: "The Last Bus",
  originalText: p2Text,
  textType: "narrative-extract",
  genre: "contemporary-realistic-fiction",
  wordCount: wordCount(p2Text),
  readingComplexity: "moderate-high",
  passageFamily: "wave1-family-tension-firstperson",
  provenance: "angel_original",
  copyrightStatus: "Angel original, unpublished; no external rights holder",
  contentDifficulty: "medium",
});

// ---------- Passage 3: "The New Girl" ----------
// Third-person, internal thought vs external dialogue contrast (strong
// ground for tick-plus-justify inference), classroom social-anxiety
// scene, moderate-high vocabulary.
const p3Text = `Priya had rehearsed exactly what she would say when someone finally spoke to her. She had practised it twice in the mirror that morning, a short, breezy sentence about how she'd just moved from Leicester and wasn't it funny how every school smelled slightly of the same disinfectant. It was, she had decided, a good opening line: friendly, a little funny, not desperate.

By lunchtime she had not used it once.

She sat at the end of a long table in the dining hall, her tray positioned with unnecessary precision in front of her, and watched the room organise itself into groups she did not belong to. Nobody was unkind. That was almost the strangest part. A girl with a long plait had smiled at her in the corridor that morning, a genuine smile, and said "you're the new one, right?" before being swept away by a wave of friends before Priya could answer. It should have felt like an opening. Instead it felt like a door that had opened and closed again before she could step through it.

"You can sit with us, if you want."

Priya looked up. It was a boy from her form group, though she couldn't remember his name, gesturing vaguely at a half-empty table nearby. His tone was so casual that for a moment she wondered if he'd meant to say it to someone else entirely.

"Thanks," she said, and heard, with faint horror, that her voice had come out smaller than she'd intended.

She picked up her tray. Her carefully rehearsed sentence about Leicester and disinfectant surfaced in her mind, fully formed, ready to be used. She opened her mouth. What came out instead was, "Is the pasta usually this cold?"

The boy laughed, an easy, unbothered laugh, and said the pasta was always this cold, it was basically a school tradition by now, and somehow that was enough. Nobody had asked where she was from. Nobody needed to, not yet. She sat down at the edge of the group, said very little for the rest of lunch, and found, to her own surprise, that she didn't mind. It was, she thought, a start.`;
assertNoDash(p3Text, "p3Text");
passages.push({
  id: "wave1-eng-newgirl",
  title: "The New Girl",
  originalText: p3Text,
  textType: "narrative-extract",
  genre: "contemporary-realistic-fiction",
  wordCount: wordCount(p3Text),
  readingComplexity: "moderate-high",
  passageFamily: "wave1-family-internal-external-contrast",
  provenance: "angel_original",
  copyrightStatus: "Angel original, unpublished; no external rights holder",
  contentDifficulty: "medium",
});

// ---------- Passage 4: "The Attic Door" ----------
// Third-person, sensory/descriptive language, mild suspense, denser
// vocabulary. Good ground for RC-03 (rich descriptive vocabulary) and
// RC-02 (atmosphere/inference from description).
const p4Text = `The attic door had been painted shut for as long as Marcus could remember, its hinges buried under so many layers of old white gloss that it had stopped looking like a door at all and started looking like part of the wall. Nobody in the house had opened it in years. Nobody, until this particular wet Tuesday, had especially wanted to.

Marcus wanted to. He had wanted to for exactly eleven days, ever since his grandmother had mentioned, almost carelessly, that his great-grandfather's old travelling trunk was still up there somewhere, gathering dust and, in her words, "several decades' worth of nonsense nobody's had the courage to sort through."

He worked a flat-bladed knife into the seam where the door met the frame, feeling the old paint crack and splinter under the pressure. A fine white dust drifted down and settled on his sleeve. When the door finally gave way, it did so all at once, swinging inward with a groan so long and so mournful that Marcus half expected something to groan back.

Nothing did. The attic beyond was dim, lit only by a single grimy window at the far end, and thick with the particular smell of old houses: dust and damp wood and something sweetish underneath, like forgotten paper slowly turning to nothing. Shapes crouched under grey dust sheets, furniture from decades Marcus couldn't guess at, their outlines softened and strange.

He picked his way across the boards, testing each one before he trusted it with his full weight, until he reached a low shape in the far corner that seemed, unmistakably, trunk-shaped. He pulled the sheet away in one motion, sending a fresh cloud of dust spiralling into the grey light.

The trunk was smaller than he'd imagined, its leather straps cracked and pale, its brass corners dulled almost black with age. A tarnished padlock hung from the clasp, but when Marcus touched it, it simply fell open in his hand, as though it, too, had been waiting eleven days, or perhaps eleven years, for someone to finally come and ask.

He knelt in front of it for a long moment before he lifted the lid, savouring, in a way he couldn't quite explain, the last few seconds of not yet knowing.`;
assertNoDash(p4Text, "p4Text");
passages.push({
  id: "wave1-eng-atticdoor",
  title: "The Attic Door",
  originalText: p4Text,
  textType: "narrative-extract",
  genre: "contemporary-realistic-fiction",
  wordCount: wordCount(p4Text),
  readingComplexity: "high",
  passageFamily: "wave1-family-descriptive-suspense",
  provenance: "angel_original",
  copyrightStatus: "Angel original, unpublished; no external rights holder",
  contentDifficulty: "hard",
});

// ---------- Passage 5: "Race Day" ----------
// Third-person, two contrasting characters (strong ground for the
// comparative-character family), sports/competition setting, moderate
// vocabulary, faster pacing.
const p5Text = `Two hours before the county relay, Ade was already at the track, jogging slow, deliberate laps to loosen muscles that did not need loosening, checking his spikes for the fourth time, running through the handover with an imaginary baton held out at exactly the right angle. He had a laminated card in his kit bag listing his split times for the last six meets, and he had read it twice already that morning, as if the numbers might have changed overnight.

Cass arrived forty minutes before the race, ate half a banana, and lay down on the grass with her cap over her eyes.

"You're not warming up," Ade said, not quite managing to keep the disapproval out of his voice.

"I warmed up on the walk here," Cass said, without moving the cap.

Ade found this deeply unconvincing, though he had learned, over two seasons of running the same relay leg as Cass, that arguing about it achieved nothing. She ran the way some people did crosswords: unbothered, half-distracted, and somehow, infuriatingly, faster than people who took it seriously.

When their event was finally called, Ade felt the familiar tightening in his chest, the one that had nothing to do with his lungs and everything to do with the six laminated split times folded in his pocket. Cass, jogging beside him to the start line, was humming something under her breath that he didn't recognise.

The gun went. Ade ran his leg exactly as planned, matching his practised splits almost to the second, and handed off cleanly to the third runner with the baton secure and his form textbook-perfect. He allowed himself, for the first time all morning, a small breath of relief.

Cass ran the anchor leg the way she seemed to do everything: as though the outcome had already been decided somewhere she wasn't especially interested in checking. She crossed the line first by four strides, not visibly out of breath, and spent the next several minutes being hugged by teammates who were considerably more excited about it than she appeared to be.

Ade watched her from a short distance, his own relief from moments earlier curdling slightly into something less comfortable. He had done everything right. She had simply won.`;
assertNoDash(p5Text, "p5Text");
passages.push({
  id: "wave1-eng-raceday",
  title: "Race Day",
  originalText: p5Text,
  textType: "narrative-extract",
  genre: "contemporary-realistic-fiction",
  wordCount: wordCount(p5Text),
  readingComplexity: "moderate",
  passageFamily: "wave1-family-two-character-contrast",
  provenance: "angel_original",
  copyrightStatus: "Angel original, unpublished; no external rights holder",
  contentDifficulty: "medium",
});

// ---------- Passage 6: "A Letter to Nana" ----------
// Epistolary (first-person letter), a child writing home after moving
// city for a parent's new job. Structurally distinct format from the
// other 5 (tests whether the architecture generalises beyond straight
// third-person narrative), moderate vocabulary, clear chronological
// sequence of events (good for RC-04).
const p6Text = `Dear Nana,

Mum says I have to write to you properly instead of just sending you funny videos, so here is a proper letter, even though I still think the videos were better.

Bristol is loud in a different way from home. Not louder exactly, just loud about different things. There is a market near our new flat that starts setting up at six in the morning, and for the first week I woke up every single day thinking someone was dismantling a small building directly under my window. Mum says I will stop noticing it eventually. I do not fully believe her yet, but she was right about the flat being bigger than it looked in the photos, so maybe she will be right about this too.

The first proper thing that happened was that I got lost on the way to school, on my actual first day, which is possibly the most embarrassing thing that has ever happened to me, and I am including the time I fell off the stage in Year 4. I took a left turn that I was extremely confident about and ended up outside a launderette instead of the school gates. A woman doing her washing pointed me the right way without laughing at me even once, which I appreciated more than she probably realised.

The second proper thing was that I made a friend, which happened much faster than I expected and in a way I did not expect at all. Her name is Yusra and she sits next to me in maths, and we started talking because I couldn't find my ruler and she lent me hers without me even having to ask properly, just sort of noticed and passed it over. That was three weeks ago. Now we walk to the bus stop together most days, and she has already taught me two very useful things: which teachers let you retake a test if you ask nicely, and exactly which bit of the playground wall is warmest to sit against at lunchtime, which matters more than you would think in October.

The third proper thing, and I promise this is the last one because Mum is telling me the postbox closes soon, is that I still miss home, but slightly less loudly than I did in September. I think that is allowed to be true at the same time as everything above.

Lots of love,
Dara`;
assertNoDash(p6Text, "p6Text");
passages.push({
  id: "wave1-eng-lettertonana",
  title: "A Letter to Nana",
  originalText: p6Text,
  textType: "narrative-extract",
  genre: "epistolary-fiction",
  wordCount: wordCount(p6Text),
  readingComplexity: "moderate",
  passageFamily: "wave1-family-epistolary-sequence",
  provenance: "angel_original",
  copyrightStatus: "Angel original, unpublished; no external rights holder",
  contentDifficulty: "medium",
});

// ============================================================
// Questions. 8 evidence-grounded families (007A evidence: 2022/2023 CSSE
// Main Test papers), applied across the 6 passages with genuine surface
// variation, not copy-pasted with names changed. `family` is the reusable
// Angel question-family id (populates family_id); `competency`/`qType`
// map to Assessment Brain's existing RC-01..04 / QT-RC-xx (007A Decision:
// no new competency, no schema change). `legacySkill` uses the existing
// SkillType enum (types/index.ts) unchanged. `validation` names which
// Tier (007A Answer Validation Architecture) applies.
// ============================================================

function q(opts) {
  const { id, passageId, family, competency, qType, legacySkill, marks, question, modelAnswer, acceptedAnswers, quotationRequired, orderedAnswer, misconception, transferClass, validation } = opts;
  assertNoDash(question, id);
  assertNoDash(modelAnswer, id);
  return {
    id, passageId, family, competency, qType, legacySkill, marks, question, modelAnswer,
    acceptedAnswers: acceptedAnswers ?? null,
    quotationRequired: quotationRequired ?? null,
    orderedAnswer: orderedAnswer ?? null,
    misconception, transferClass, validation,
  };
}

// ---------- Passage 1: The Kite Maker ----------
items.push(
  q({
    id: "w1-kitemaker-01", passageId: "wave1-eng-kitemaker", family: "wave1-fam-direct-retrieval",
    competency: "RC-01", qType: "QT-RC-01", legacySkill: "evidence", marks: 1,
    question: "Why was Femi not allowed to touch the bamboo before this Saturday?",
    modelAnswer: "Grandad believed that watching properly was its own kind of work, so Femi first had to watch him make a dozen kites.",
    acceptedAnswers: ["watching was its own kind of work", "he had to watch first", "grandad said watching properly was work too"],
    transferClass: "ROUTINE", validation: "TIER2_ACCEPTED_SET",
    misconception: "Assuming Femi was simply too young, when the passage gives a different, stated reason.",
  }),
  q({
    id: "w1-kitemaker-02", passageId: "wave1-eng-kitemaker", family: "wave1-fam-vocab-explain",
    competency: "RC-03", qType: "QT-RC-03", legacySkill: "vocabulary", marks: 1,
    question: "Explain what you think the word 'unhurried' means as Grandad uses it in the passage.",
    modelAnswer: "Not rushed; calm and taking exactly as much time as is needed, without hurrying.",
    acceptedAnswers: ["calm and slow", "not rushed", "taking his time", "relaxed, not in a hurry"],
    transferClass: "NEAR_TRANSFER", validation: "TIER2_ACCEPTED_SET",
    misconception: "Confusing 'unhurried' with 'lazy' or 'slow in a negative sense', missing the deliberate, careful quality the word carries here.",
  }),
  q({
    id: "w1-kitemaker-03", passageId: "wave1-eng-kitemaker", family: "wave1-fam-synonym-battery",
    competency: "RC-03", qType: "QT-RC-04", legacySkill: "vocabulary", marks: 3,
    question: "Write a synonym (a word or a few words with the same meaning) for each of the following words as used in the passage: (a) 'precision' (b) 'lopsided' (c) 'stubborn' (a knot that had gone stubborn).",
    modelAnswer: "(a) precision: exactness/care (b) lopsided: uneven/crooked (c) stubborn (knot): difficult to undo/stuck fast.",
    acceptedAnswers: ["exactness", "care", "accuracy", "uneven", "crooked", "wonky", "difficult", "stuck", "jammed", "hard to undo"],
    transferClass: "NEAR_TRANSFER", validation: "TIER2_ACCEPTED_SET",
    misconception: "Giving a definition instead of a synonym, or a synonym that does not fit the specific sense used in this passage (e.g. 'stubborn' meaning a person, not a knot).",
  }),
  q({
    id: "w1-kitemaker-04", passageId: "wave1-eng-kitemaker", family: "wave1-fam-tick-justify",
    competency: "RC-02", qType: "QT-RC-02", legacySkill: "inference", marks: 4,
    question: "Does Grandad seem pleased with Femi's first attempt at the kite frame? Tick Yes or No, then give two reasons for your answer, using evidence from the passage.",
    modelAnswer: "No (or: not openly). Grandad does not move to fix the lopsided frame himself, and when Femi expects praise after correcting it, Grandad 'only nodded once, as if Femi had merely confirmed something Grandad already knew' rather than celebrating the result.",
    quotationRequired: ["only nodded once, as if Femi had merely confirmed something Grandad already knew"],
    transferClass: "MIXED_TRANSFER", validation: "TIER3_QUOTATION_PLUS_EXPLANATION",
    misconception: "Assuming any calm response from an adult means approval, missing that the passage deliberately withholds obvious praise.",
  }),
  q({
    id: "w1-kitemaker-05", passageId: "wave1-eng-kitemaker", family: "wave1-fam-quote-explain",
    competency: "RC-02", qType: "QT-RC-02", legacySkill: "evidence", marks: 4,
    question: "Find two quotations that show Grandad believes in letting Femi learn by working things out for himself, rather than being told the answer. For each quotation, explain what it shows.",
    modelAnswer: "'Grandad did not move' when Femi's frame came out lopsided, showing he deliberately withheld help so Femi had to notice the problem himself. Also, Grandad 'refused to simply say the answer', repeatedly asking 'So?' instead of pointing out what was wrong, showing he wanted Femi to reason it out.",
    quotationRequired: ["Grandad did not move", "refused to simply say the answer"],
    transferClass: "MIXED_TRANSFER", validation: "TIER3_QUOTATION_PLUS_EXPLANATION",
    misconception: "Choosing a quotation that merely describes an action without connecting it to Grandad's teaching approach.",
  }),
  q({
    id: "w1-kitemaker-06", passageId: "wave1-eng-kitemaker", family: "wave1-fam-sequencing",
    competency: "RC-04", qType: "QT-RC-06", legacySkill: "structure", marks: 3,
    question: "Write down the three things Femi did to fix his first kite frame, in the order he did them.",
    modelAnswer: "1. He looked at the two arms and measured them with his eyes, then his fingers. 2. He trimmed the longer arm himself. 3. He checked it again.",
    orderedAnswer: ["looked at / measured the arms", "trimmed the longer arm", "checked it again"],
    transferClass: "NEAR_TRANSFER", validation: "TIER4_ORDERED_LIST",
    misconception: "Listing the three actions correctly but out of order, or including a step (such as Grandad holding the kite to the light) that Femi did not do himself.",
  }),
  q({
    id: "w1-kitemaker-07", passageId: "wave1-eng-kitemaker", family: "wave1-fam-emotion-cause",
    competency: "RC-02", qType: "QT-RC-08", legacySkill: "atmosphere", marks: 2,
    question: "How does Femi feel at the very end of the passage, and why?",
    modelAnswer: "Femi feels quietly content or satisfied. He realises Grandad's single nod is 'the closest thing to a celebration he was going to get', and that this is enough for him, even without louder praise.",
    acceptedAnswers: ["content", "satisfied", "happy", "proud", "pleased"],
    transferClass: "FAR_TRANSFER", validation: "TIER3_QUOTATION_PLUS_EXPLANATION",
    misconception: "Assuming Femi is disappointed because he did not receive obvious praise, missing that the passage explicitly says the quiet acknowledgement 'was enough'.",
  })
);

// ---------- Passage 2: The Last Bus ----------
items.push(
  q({
    id: "w1-lastbus-01", passageId: "wave1-eng-lastbus", family: "wave1-fam-direct-retrieval",
    competency: "RC-01", qType: "QT-RC-01", legacySkill: "evidence", marks: 1,
    question: "What went wrong for the narrator right at the start of the passage?",
    modelAnswer: "Her shoelace came undone for the second time that morning, while she still had four streets to go.",
    acceptedAnswers: ["her shoelace came undone", "shoelace untied", "lace came undone again"],
    transferClass: "ROUTINE", validation: "TIER2_ACCEPTED_SET",
    misconception: "Confusing this early detail with the near-collision with the dog walker, which happens later.",
  }),
  q({
    id: "w1-lastbus-02", passageId: "wave1-eng-lastbus", family: "wave1-fam-vocab-explain",
    competency: "RC-03", qType: "QT-RC-03", legacySkill: "vocabulary", marks: 1,
    question: "Explain what the phrase 'gulping air like something that had been underwater too long' suggests about how the narrator was breathing.",
    modelAnswer: "It suggests she was breathing in huge, desperate gasps, as though starved of air, showing just how exhausted and out of breath she was from running.",
    acceptedAnswers: ["breathing heavily", "gasping for air", "out of breath", "desperate for air"],
    transferClass: "NEAR_TRANSFER", validation: "TIER2_ACCEPTED_SET",
    misconception: "Taking the comparison literally (thinking she had actually been swimming) rather than recognising it as a comparison for exhausted breathing.",
  }),
  q({
    id: "w1-lastbus-03", passageId: "wave1-eng-lastbus", family: "wave1-fam-synonym-battery",
    competency: "RC-03", qType: "QT-RC-04", legacySkill: "vocabulary", marks: 3,
    question: "Write a synonym for each of the following words as used in the passage: (a) 'absurdly' (b) 'unmistakably' (c) 'embarrassed'.",
    modelAnswer: "(a) absurdly: ridiculously (b) unmistakably: clearly/definitely (c) embarrassed: ashamed/self-conscious.",
    acceptedAnswers: ["ridiculously", "ridiculous", "clearly", "definitely", "certainly", "ashamed", "self-conscious", "awkward", "humiliated"],
    transferClass: "NEAR_TRANSFER", validation: "TIER2_ACCEPTED_SET",
    misconception: "Giving a synonym for a different, more common meaning of the word rather than the sense used in this specific sentence.",
  }),
  q({
    id: "w1-lastbus-04", passageId: "wave1-eng-lastbus", family: "wave1-fam-tick-justify",
    competency: "RC-02", qType: "QT-RC-02", legacySkill: "inference", marks: 4,
    question: "Does the narrator think missing the bus would be a small problem? Tick Yes or No, then give two reasons for your answer, using evidence from the passage.",
    modelAnswer: "No. She describes the next bus as forty minutes away, which she says is 'exactly long enough to turn me from a girl who was occasionally a little late into a girl who had missed her audition entirely', showing she sees it as a serious, not minor, consequence. She also apologises to the dog walker 'without really meaning it', showing how singularly focused she was on not being late.",
    quotationRequired: ["exactly long enough to turn me from a girl who was occasionally a little late into a girl who had missed her audition entirely"],
    transferClass: "MIXED_TRANSFER", validation: "TIER3_QUOTATION_PLUS_EXPLANATION",
    misconception: "Focusing only on the physical running rather than the stated stakes (the audition) that explain why she is running.",
  }),
  q({
    id: "w1-lastbus-05", passageId: "wave1-eng-lastbus", family: "wave1-fam-quote-explain",
    competency: "RC-02", qType: "QT-RC-02", legacySkill: "evidence", marks: 4,
    question: "Find two quotations that show the narrator's anxiety as she runs, and explain what each one shows.",
    modelAnswer: "'my heart doing something urgent and uneven in my chest' shows her physical panic and racing heartbeat. 'I could not speak at all' when she reaches the bus shows she was so overwhelmed with anxiety and exertion that she was temporarily unable to talk.",
    quotationRequired: ["something urgent and uneven in my chest", "could not speak at all"],
    transferClass: "MIXED_TRANSFER", validation: "TIER3_QUOTATION_PLUS_EXPLANATION",
    misconception: "Selecting a quotation that describes an external event (like the bus arriving) rather than the narrator's internal anxious feelings.",
  }),
  q({
    id: "w1-lastbus-06", passageId: "wave1-eng-lastbus", family: "wave1-fam-sequencing",
    competency: "RC-04", qType: "QT-RC-06", legacySkill: "structure", marks: 3,
    question: "Write down three things that happened to the narrator on her way to the bus stop, in the order they happened.",
    modelAnswer: "1. Her shoelace came undone. 2. She nearly collided with a man walking a large dog. 3. She saw a flash of red in the distance and realised it was her bus.",
    orderedAnswer: ["shoelace came undone", "nearly collided with the dog walker", "saw the red flash / spotted the bus"],
    transferClass: "NEAR_TRANSFER", validation: "TIER4_ORDERED_LIST",
    misconception: "Including the driver waiting for her, which happens after she reaches the stop, not on the way there.",
  }),
  q({
    id: "w1-lastbus-07", passageId: "wave1-eng-lastbus", family: "wave1-fam-emotion-cause",
    competency: "RC-02", qType: "QT-RC-08", legacySkill: "atmosphere", marks: 2,
    question: "How does the narrator's emotion change in the last two paragraphs of the passage, and why?",
    modelAnswer: "She changes from fear and exhaustion to relief and laughter. Once she is safely on the bus and the danger of missing it has passed, her body finally 'gives permission' to laugh, showing the fear draining away now that she is safe.",
    acceptedAnswers: ["from scared to relieved", "fear to relief", "anxious to happy/laughing"],
    transferClass: "FAR_TRANSFER", validation: "TIER3_QUOTATION_PLUS_EXPLANATION",
    misconception: "Describing only the surface action (she laughed) without explaining the emotional shift from fear that causes it.",
  })
);

// ---------- Passage 3: The New Girl ----------
items.push(
  q({
    id: "w1-newgirl-01", passageId: "wave1-eng-newgirl", family: "wave1-fam-direct-retrieval",
    competency: "RC-01", qType: "QT-RC-01", legacySkill: "evidence", marks: 1,
    question: "What had Priya rehearsed before school that day?",
    modelAnswer: "A short, friendly sentence about having just moved from Leicester and how every school smells slightly of the same disinfectant.",
    acceptedAnswers: ["a sentence about moving from leicester", "an opening line about leicester/disinfectant"],
    transferClass: "ROUTINE", validation: "TIER2_ACCEPTED_SET",
    misconception: "Confusing the rehearsed line with what she actually says at the end ('is the pasta usually this cold').",
  }),
  q({
    id: "w1-newgirl-02", passageId: "wave1-eng-newgirl", family: "wave1-fam-vocab-explain",
    competency: "RC-03", qType: "QT-RC-03", legacySkill: "vocabulary", marks: 1,
    question: "Explain what the phrase 'a door that had opened and closed again before she could step through it' suggests about the smiling girl in the corridor.",
    modelAnswer: "It suggests a brief chance for friendship or connection appeared but disappeared again almost immediately, before Priya had a real opportunity to take it.",
    acceptedAnswers: ["a missed chance", "a lost opportunity", "a brief opportunity that disappeared"],
    transferClass: "FAR_TRANSFER", validation: "TIER2_ACCEPTED_SET",
    misconception: "Interpreting the sentence literally as being about an actual door, rather than recognising it as a comparison for a missed social opportunity.",
  }),
  q({
    id: "w1-newgirl-03", passageId: "wave1-eng-newgirl", family: "wave1-fam-synonym-battery",
    competency: "RC-03", qType: "QT-RC-04", legacySkill: "vocabulary", marks: 3,
    question: "Write a synonym for each of the following words as used in the passage: (a) 'breezy' (b) 'desperate' (a good opening line, not desperate) (c) 'unbothered'.",
    modelAnswer: "(a) breezy: light-hearted/casual (b) desperate: needy/over-eager (c) unbothered: relaxed/calm/casual.",
    acceptedAnswers: ["light-hearted", "casual", "carefree", "needy", "over-eager", "clingy", "relaxed", "calm", "easy-going"],
    transferClass: "NEAR_TRANSFER", validation: "TIER2_ACCEPTED_SET",
    misconception: "Giving a synonym for the wrong sense of 'breezy' (e.g. relating to weather rather than tone of voice).",
  }),
  q({
    id: "w1-newgirl-04", passageId: "wave1-eng-newgirl", family: "wave1-fam-tick-justify",
    competency: "RC-02", qType: "QT-RC-02", legacySkill: "inference", marks: 4,
    question: "Does Priya say what she had planned to say when the boy invites her to sit with him? Tick Yes or No, then give two reasons for your answer, using evidence from the passage.",
    modelAnswer: "No. Her rehearsed sentence 'surfaced in her mind, fully formed, ready to be used', but what 'came out instead' was a question about the cold pasta, showing a clear gap between what she planned and what she actually said.",
    quotationRequired: ["What came out instead", "surfaced in her mind, fully formed, ready to be used"],
    transferClass: "MIXED_TRANSFER", validation: "TIER3_QUOTATION_PLUS_EXPLANATION",
    misconception: "Assuming she stayed silent entirely, missing that she did speak, just not the words she had planned.",
  }),
  q({
    id: "w1-newgirl-05", passageId: "wave1-eng-newgirl", family: "wave1-fam-quote-explain",
    competency: "RC-02", qType: "QT-RC-02", legacySkill: "evidence", marks: 4,
    question: "Find two quotations that show Priya feels nervous or self-conscious during the passage, and explain what each one shows.",
    modelAnswer: "'her voice had come out smaller than she'd intended' shows she was nervous enough that her voice betrayed her, shrinking without her meaning it to. Her tray was 'positioned with unnecessary precision', showing she was anxiously overcontrolling small details to manage her nerves.",
    quotationRequired: ["her voice had come out smaller than she'd intended", "positioned with unnecessary precision"],
    transferClass: "MIXED_TRANSFER", validation: "TIER3_QUOTATION_PLUS_EXPLANATION",
    misconception: "Choosing a quotation about the boy's casualness rather than Priya's own nervousness, misreading whose feelings the question asks about.",
  }),
  q({
    id: "w1-newgirl-06", passageId: "wave1-eng-newgirl", family: "wave1-fam-sequencing",
    competency: "RC-04", qType: "QT-RC-06", legacySkill: "structure", marks: 3,
    question: "Write down three things that happened to Priya at school that day, in the order they happened.",
    modelAnswer: "1. A girl with a long plait smiled at her in the corridor but was swept away before Priya could answer. 2. She sat alone at lunch watching the room organise into groups. 3. A boy invited her to sit with his table, and she went and sat with them.",
    orderedAnswer: ["girl with plait smiled in the corridor", "sat alone watching the room", "boy invited her to sit / she sat with them"],
    transferClass: "NEAR_TRANSFER", validation: "TIER4_ORDERED_LIST",
    misconception: "Placing the boy's invitation before the corridor scene, reversing the actual chronology given in the passage.",
  }),
  q({
    id: "w1-newgirl-07", passageId: "wave1-eng-newgirl", family: "wave1-fam-emotion-cause",
    competency: "RC-02", qType: "QT-RC-08", legacySkill: "atmosphere", marks: 2,
    question: "How does Priya feel by the end of the passage, and why?",
    modelAnswer: "She feels cautiously content, even though little was resolved. She recognises that nobody needed to ask about her background yet, and she 'didn't mind' sitting quietly at the edge of the group, seeing it as 'a start'.",
    acceptedAnswers: ["content", "hopeful", "relieved", "okay", "cautiously happy"],
    transferClass: "FAR_TRANSFER", validation: "TIER3_QUOTATION_PLUS_EXPLANATION",
    misconception: "Assuming she must feel disappointed because her rehearsed plan failed, missing that the passage explicitly frames the outcome positively.",
  })
);

// ---------- Passage 4: The Attic Door ----------
items.push(
  q({
    id: "w1-atticdoor-01", passageId: "wave1-eng-atticdoor", family: "wave1-fam-direct-retrieval",
    competency: "RC-01", qType: "QT-RC-01", legacySkill: "evidence", marks: 1,
    question: "Why had Marcus wanted to open the attic door for eleven days?",
    modelAnswer: "His grandmother had mentioned that his great-grandfather's old travelling trunk was still up there.",
    acceptedAnswers: ["because of the old trunk", "grandmother mentioned the trunk", "the travelling trunk was up there"],
    transferClass: "ROUTINE", validation: "TIER2_ACCEPTED_SET",
    misconception: "Confusing the reason for wanting to open the door with the physical difficulty of opening it (the painted-shut hinges).",
  }),
  q({
    id: "w1-atticdoor-02", passageId: "wave1-eng-atticdoor", family: "wave1-fam-vocab-explain",
    competency: "RC-03", qType: "QT-RC-03", legacySkill: "vocabulary", marks: 1,
    question: "Explain what the phrase 'as though it, too, had been waiting eleven days, or perhaps eleven years, for someone to finally come and ask' suggests about the padlock.",
    modelAnswer: "It personifies the padlock, suggesting the attic and its contents have felt abandoned and forgotten for a very long time, almost as though waiting patiently to be rediscovered.",
    acceptedAnswers: ["it had been forgotten for a long time", "personification of the padlock waiting", "suggests it has been neglected/abandoned"],
    transferClass: "FAR_TRANSFER", validation: "TIER2_ACCEPTED_SET",
    misconception: "Reading the sentence as a literal claim that the padlock can think or wait, without recognising the technique of personification.",
  }),
  q({
    id: "w1-atticdoor-03", passageId: "wave1-eng-atticdoor", family: "wave1-fam-synonym-battery",
    competency: "RC-03", qType: "QT-RC-04", legacySkill: "vocabulary", marks: 3,
    question: "Write a synonym for each of the following words as used in the passage: (a) 'mournful' (b) 'grimy' (c) 'savouring'.",
    modelAnswer: "(a) mournful: sad/sorrowful (b) grimy: dirty/grubby (c) savouring: enjoying/relishing.",
    acceptedAnswers: ["sad", "sorrowful", "gloomy", "dirty", "grubby", "filthy", "enjoying", "relishing", "appreciating"],
    transferClass: "NEAR_TRANSFER", validation: "TIER2_ACCEPTED_SET",
    misconception: "Confusing 'mournful' (sad-sounding) with 'morning', a common spelling-based misreading at this age.",
  }),
  q({
    id: "w1-atticdoor-04", passageId: "wave1-eng-atticdoor", family: "wave1-fam-tick-justify",
    competency: "RC-02", qType: "QT-RC-02", legacySkill: "inference", marks: 4,
    question: "Does the writer create a slightly eerie or unsettling atmosphere in the attic? Tick Yes or No, then give two reasons for your answer, using evidence from the passage.",
    modelAnswer: "Yes. The door swings open 'with a groan so long and so mournful that Marcus half expected something to groan back', and the furniture shapes are described as 'softened and strange' under dust sheets, both creating an unsettling, slightly supernatural atmosphere.",
    quotationRequired: ["groan so long and so mournful that Marcus half expected something to groan back", "softened and strange"],
    transferClass: "MIXED_TRANSFER", validation: "TIER3_QUOTATION_PLUS_EXPLANATION",
    misconception: "Only noting that the attic is 'dusty', missing the more deliberately eerie language choices the writer uses.",
  }),
  q({
    id: "w1-atticdoor-05", passageId: "wave1-eng-atticdoor", family: "wave1-fam-quote-explain",
    competency: "RC-02", qType: "QT-RC-02", legacySkill: "evidence", marks: 4,
    question: "Find two quotations that show Marcus is cautious as he explores the attic, and explain what each one shows.",
    modelAnswer: "'testing each one before he trusted it with his full weight' shows he checked each floorboard carefully before stepping fully onto it, being careful not to fall through. He 'knelt in front of it for a long moment before he lifted the lid', showing he deliberately paused rather than rushing to open the trunk.",
    quotationRequired: ["testing each one before he trusted it with his full weight", "knelt in front of it for a long moment before he lifted the lid"],
    transferClass: "MIXED_TRANSFER", validation: "TIER3_QUOTATION_PLUS_EXPLANATION",
    misconception: "Selecting a quotation showing curiosity rather than caution, conflating two related but different feelings.",
  }),
  q({
    id: "w1-atticdoor-06", passageId: "wave1-eng-atticdoor", family: "wave1-fam-sequencing",
    competency: "RC-04", qType: "QT-RC-06", legacySkill: "structure", marks: 3,
    question: "Write down three things Marcus did after the attic door opened, in the order he did them.",
    modelAnswer: "1. He picked his way across the boards, testing each one. 2. He reached the trunk-shaped object and pulled the sheet away. 3. He touched the padlock, which fell open in his hand.",
    orderedAnswer: ["picked his way across the boards", "pulled the dust sheet away", "touched the padlock and it fell open"],
    transferClass: "NEAR_TRANSFER", validation: "TIER4_ORDERED_LIST",
    misconception: "Placing 'kneeling in front of the trunk' before pulling the sheet away, when the passage places it after.",
  }),
  q({
    id: "w1-atticdoor-07", passageId: "wave1-eng-atticdoor", family: "wave1-fam-emotion-cause",
    competency: "RC-02", qType: "QT-RC-08", legacySkill: "atmosphere", marks: 2,
    question: "How does Marcus feel in the very last sentence of the passage, and why?",
    modelAnswer: "He feels a kind of anticipation he wants to hold onto. He deliberately pauses, 'savouring... the last few seconds of not yet knowing', because once he opens the trunk the mystery and excitement of not knowing will be over.",
    acceptedAnswers: ["anticipation", "excitement", "suspense", "wants to delay the moment"],
    transferClass: "FAR_TRANSFER", validation: "TIER3_QUOTATION_PLUS_EXPLANATION",
    misconception: "Assuming he pauses out of fear alone, missing that the passage frames it as savouring anticipation, not dread.",
  })
);

// ---------- Passage 5: Race Day ----------
items.push(
  q({
    id: "w1-raceday-01", passageId: "wave1-eng-raceday", family: "wave1-fam-direct-retrieval",
    competency: "RC-01", qType: "QT-RC-01", legacySkill: "evidence", marks: 1,
    question: "What did Ade do in the two hours before the relay?",
    modelAnswer: "He jogged slow laps to loosen his muscles, checked his spikes four times, and practised the baton handover, referring to a laminated card of his split times.",
    acceptedAnswers: ["jogged/warmed up and checked his spikes", "practised the handover", "warmed up thoroughly"],
    transferClass: "ROUTINE", validation: "TIER2_ACCEPTED_SET",
    misconception: "Describing Cass's much shorter warm-up instead of Ade's, confusing the two characters' routines.",
  }),
  q({
    id: "w1-raceday-02", passageId: "wave1-eng-raceday", family: "wave1-fam-vocab-explain",
    competency: "RC-03", qType: "QT-RC-03", legacySkill: "vocabulary", marks: 1,
    question: "Explain what the phrase 'as though the outcome had already been decided somewhere she wasn't especially interested in checking' suggests about Cass's attitude to racing.",
    modelAnswer: "It suggests Cass is unusually relaxed and unconcerned about the result, almost as if she assumes things will work out and doesn't feel the need to worry about the outcome in advance.",
    acceptedAnswers: ["she is very relaxed/unbothered about winning", "she doesn't worry about the result", "casual, confident attitude"],
    transferClass: "FAR_TRANSFER", validation: "TIER2_ACCEPTED_SET",
    misconception: "Reading this as Cass not caring about the race at all, rather than simply not being anxious about the outcome.",
  }),
  q({
    id: "w1-raceday-03", passageId: "wave1-eng-raceday", family: "wave1-fam-synonym-battery",
    competency: "RC-03", qType: "QT-RC-04", legacySkill: "vocabulary", marks: 3,
    question: "Write a synonym for each of the following words as used in the passage: (a) 'deliberate' (deliberate laps) (b) 'unconvincing' (c) 'curdling' (his relief curdling into something else).",
    modelAnswer: "(a) deliberate: careful/intentional (b) unconvincing: unbelievable/unpersuasive (c) curdling: turning sour/souring.",
    acceptedAnswers: ["careful", "intentional", "purposeful", "unbelievable", "unpersuasive", "not convincing", "turning sour", "souring", "spoiling"],
    transferClass: "NEAR_TRANSFER", validation: "TIER2_ACCEPTED_SET",
    misconception: "Giving a food-related definition of 'curdling' (as in milk) without connecting it to the figurative sense of an emotion turning unpleasant.",
  }),
  q({
    id: "w1-raceday-04", passageId: "wave1-eng-raceday", family: "wave1-fam-two-character",
    competency: "RC-02", qType: "QT-RC-07", legacySkill: "character", marks: 4,
    question: "Using evidence from the passage, explain how Ade's and Cass's approaches to the race differ.",
    modelAnswer: "Ade prepares intensely and anxiously, arriving two hours early, checking his spikes four times, and carrying a laminated card of split times he rereads. Cass arrives only forty minutes before, eats half a banana, and lies down with her cap over her eyes, treating the preparation casually and without visible anxiety.",
    quotationRequired: ["checking his spikes for the fourth time", "lay down on the grass with her cap over her eyes"],
    transferClass: "MIXED_TRANSFER", validation: "TIER3_QUOTATION_PLUS_EXPLANATION",
    misconception: "Describing only one character's approach instead of contrasting both, when the question specifically asks for the difference between them.",
  }),
  q({
    id: "w1-raceday-05", passageId: "wave1-eng-raceday", family: "wave1-fam-quote-explain",
    competency: "RC-02", qType: "QT-RC-02", legacySkill: "evidence", marks: 4,
    question: "Find two quotations that show Ade feels increasingly uncomfortable by the end of the passage, and explain what each one shows.",
    modelAnswer: "'the familiar tightening in his chest' before the race shows his physical anxiety linked to his need to perform well. His 'relief from moments earlier curdling slightly into something less comfortable' after Cass wins shows his satisfaction turning into a more uneasy feeling once he sees she succeeded without his level of effort.",
    quotationRequired: ["the familiar tightening in his chest", "curdling slightly into something less comfortable"],
    transferClass: "MIXED_TRANSFER", validation: "TIER3_QUOTATION_PLUS_EXPLANATION",
    misconception: "Choosing a quotation describing Cass's calmness rather than Ade's own discomfort, answering about the wrong character.",
  }),
  q({
    id: "w1-raceday-06", passageId: "wave1-eng-raceday", family: "wave1-fam-sequencing",
    competency: "RC-04", qType: "QT-RC-06", legacySkill: "structure", marks: 3,
    question: "Write down three things that happened once the relay began, in the order they happened.",
    modelAnswer: "1. Ade ran his leg matching his practised splits and handed off cleanly. 2. He allowed himself a small breath of relief. 3. Cass ran the anchor leg and crossed the line first by four strides.",
    orderedAnswer: ["Ade ran his leg and handed off cleanly", "Ade felt a small breath of relief", "Cass ran the anchor leg and won"],
    transferClass: "NEAR_TRANSFER", validation: "TIER4_ORDERED_LIST",
    misconception: "Placing Ade's relief after Cass's win rather than between his own leg finishing and Cass's leg starting.",
  }),
  q({
    id: "w1-raceday-07", passageId: "wave1-eng-raceday", family: "wave1-fam-emotion-cause",
    competency: "RC-02", qType: "QT-RC-08", legacySkill: "atmosphere", marks: 2,
    question: "How does Ade feel at the very end of the passage, and why?",
    modelAnswer: "He feels uneasy or a little resentful, despite the team winning. Watching Cass being celebrated after doing 'everything right' himself while 'she had simply won' without the same effort, he feels his own achievement overshadowed.",
    acceptedAnswers: ["uneasy", "resentful", "frustrated", "a bit jealous", "uncomfortable"],
    transferClass: "FAR_TRANSFER", validation: "TIER3_QUOTATION_PLUS_EXPLANATION",
    misconception: "Assuming Ade must feel simply happy because his team won, missing the more complicated, less comfortable feeling the passage actually describes.",
  })
);

// ---------- Passage 6: A Letter to Nana ----------
items.push(
  q({
    id: "w1-letter-01", passageId: "wave1-eng-lettertonana", family: "wave1-fam-direct-retrieval",
    competency: "RC-01", qType: "QT-RC-01", legacySkill: "evidence", marks: 1,
    question: "Why does Dara say the market noise confused her in the first week?",
    modelAnswer: "It started setting up at six in the morning, and for the first week she thought someone was dismantling a small building directly under her window.",
    acceptedAnswers: ["she thought a building was being dismantled", "market noise woke her thinking something was being taken apart"],
    transferClass: "ROUTINE", validation: "TIER2_ACCEPTED_SET",
    misconception: "Confusing the market noise with the launderette scene, which is a separate event later in the letter.",
  }),
  q({
    id: "w1-letter-02", passageId: "wave1-eng-lettertonana", family: "wave1-fam-vocab-explain",
    competency: "RC-03", qType: "QT-RC-03", legacySkill: "vocabulary", marks: 1,
    question: "Explain what Dara means when she says she misses home 'slightly less loudly than I did in September'.",
    modelAnswer: "She means her homesickness has not gone away completely, but it has become less intense or overwhelming than it was when she first moved.",
    acceptedAnswers: ["she still misses home but less strongly", "homesickness has faded a little", "less intense missing home"],
    transferClass: "FAR_TRANSFER", validation: "TIER2_ACCEPTED_SET",
    misconception: "Reading 'loudly' literally as being about actual sound, rather than as a figurative description of the intensity of a feeling.",
  }),
  q({
    id: "w1-letter-03", passageId: "wave1-eng-lettertonana", family: "wave1-fam-synonym-battery",
    competency: "RC-03", qType: "QT-RC-04", legacySkill: "vocabulary", marks: 3,
    question: "Write a synonym for each of the following words as used in the letter: (a) 'dismantling' (b) 'appreciated' (c) 'properly' (a proper letter).",
    modelAnswer: "(a) dismantling: taking apart (b) appreciated: valued/was grateful for (c) properly: correctly/formally.",
    acceptedAnswers: ["taking apart", "breaking down", "valued", "was grateful for", "was thankful for", "correctly", "formally", "in the right way"],
    transferClass: "NEAR_TRANSFER", validation: "TIER2_ACCEPTED_SET",
    misconception: "Confusing 'appreciated' (grateful for) with 'appreciated in value', a homophone-adjacent meaning not used here.",
  }),
  q({
    id: "w1-letter-04", passageId: "wave1-eng-lettertonana", family: "wave1-fam-tick-justify",
    competency: "RC-02", qType: "QT-RC-02", legacySkill: "inference", marks: 4,
    question: "Does Dara seem to be settling into Bristol reasonably well by the time she writes this letter? Tick Yes or No, then give two reasons for your answer, using evidence from the letter.",
    modelAnswer: "Yes. She has already made a friend, Yusra, whom she now walks to the bus stop with 'most days', and she describes her homesickness as fading, missing home only 'slightly less loudly than I did in September', showing real progress since arriving.",
    quotationRequired: ["most days", "slightly less loudly than I did in September"],
    transferClass: "MIXED_TRANSFER", validation: "TIER3_QUOTATION_PLUS_EXPLANATION",
    misconception: "Focusing only on the embarrassing launderette incident as evidence she is struggling, without weighing it against the letter's overall more positive ending.",
  }),
  q({
    id: "w1-letter-05", passageId: "wave1-eng-lettertonana", family: "wave1-fam-quote-explain",
    competency: "RC-02", qType: "QT-RC-02", legacySkill: "evidence", marks: 4,
    question: "Find two quotations that show Dara and Yusra's friendship formed easily, and explain what each one shows.",
    modelAnswer: "Yusra 'lent me hers without me even having to ask properly, just sort of noticed and passed it over', showing the friendship began through a small, natural act of kindness rather than an awkward introduction. Dara also says this 'happened much faster than I expected', showing how easily and quickly the friendship developed.",
    quotationRequired: ["without me even having to ask properly", "happened much faster than I expected"],
    transferClass: "MIXED_TRANSFER", validation: "TIER3_QUOTATION_PLUS_EXPLANATION",
    misconception: "Selecting a quotation about the useful things Yusra taught her later, rather than about how the friendship itself began.",
  }),
  q({
    id: "w1-letter-06", passageId: "wave1-eng-lettertonana", family: "wave1-fam-sequencing",
    competency: "RC-04", qType: "QT-RC-06", legacySkill: "structure", marks: 3,
    question: "Dara describes three 'proper things' that happened since she moved. Write them down in the order she gives them.",
    modelAnswer: "1. She got lost on her first day and ended up outside a launderette. 2. She made a friend, Yusra, who lent her a ruler. 3. She still misses home, but slightly less than before.",
    orderedAnswer: ["got lost on the first day", "made a friend (Yusra)", "still misses home, but less"],
    transferClass: "NEAR_TRANSFER", validation: "TIER4_ORDERED_LIST",
    misconception: "Reversing the order of the second and third 'proper things', since both appear near the end of the letter.",
  }),
  q({
    id: "w1-letter-07", passageId: "wave1-eng-lettertonana", family: "wave1-fam-emotion-cause",
    competency: "RC-02", qType: "QT-RC-08", legacySkill: "atmosphere", marks: 2,
    question: "How does Dara feel about being embarrassed on her first day, looking back on it in this letter?",
    modelAnswer: "She seems able to laugh at herself about it now rather than feeling upset. She calls it 'possibly the most embarrassing thing that has ever happened to me' in a light, exaggerated, humorous way, comparing it jokingly to falling off a stage in Year 4.",
    acceptedAnswers: ["she finds it funny now", "able to laugh about it", "not upset anymore, finds it amusing"],
    transferClass: "FAR_TRANSFER", validation: "TIER3_QUOTATION_PLUS_EXPLANATION",
    misconception: "Assuming she is still embarrassed or upset now, missing the humorous, self-aware tone she uses to describe the memory.",
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
const totalMarks = items.reduce((s, it) => s + it.marks, 0);
console.log("Total marks:", totalMarks);

// Validation: duplicate id/question, dash check (already asserted per-item),
// quotation-verifiability (every required quotation must appear verbatim
// in its own passage's text).
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
}
if (failCount > 0) {
  console.error(`\nWave 1 English generation: FAIL (${failCount} problems)`);
  process.exit(1);
}
console.log(`\nWave 1 English generation: PASS, ${items.length} items across ${passages.length} passages, 0 quotation-verification failures`);

writeFileSync(
  "C:/Users/Admin/AppData/Local/Temp/claude/C--Users-Admin/741c0ede-7d52-4a4c-9a84-915666c1c1bc/scratchpad/wave1_items.json",
  JSON.stringify(items, null, 2)
);

console.log(`Passages authored: ${passages.length}`);
for (const p of passages) console.log(`  ${p.id}: "${p.title}" (${p.wordCount} words, ${p.readingComplexity})`);

writeFileSync(
  "C:/Users/Admin/AppData/Local/Temp/claude/C--Users-Admin/741c0ede-7d52-4a4c-9a84-915666c1c1bc/scratchpad/wave1_passages.json",
  JSON.stringify(passages, null, 2)
);

export { passages, items, assertNoDash, wordCount };
