// ============================================================
// Educational Increment 007T, Parts 5-7 — first QT-RC-10 (Effect-of-
// Language) authoring batch. 5 original passages (narrative fiction and
// epistolary/personal-letter register, the two genres 007R Part 2's
// evidence directly supports) and 14 questions across the 2 family
// contracts frozen in Part 5: wave3-fam-rc10-word-choice,
// wave3-fam-rc10-atmosphere-mood. All passage text is original Angel
// composition — no character names, plot events, or wording derived from
// any CSSE or third-party source.
// ============================================================

export const passages = [
  {
    id: "wave3-eng-emptyclassroom",
    title: "The Empty Classroom",
    genre: "contemporary-realistic-fiction",
    text: `Maya was always the first to arrive. She liked the ten minutes before anyone else came, when the classroom belonged only to her. This morning, though, something felt different. The chairs sat exactly as they had been left the day before, stacked with unusual care. The whiteboard, normally smudged with yesterday's lesson, had been wiped completely clean. Even the window, which never quite closed properly, was shut tight, and the room held a stillness that made her steps sound too loud.

She set her bag down slowly, as though placing it too quickly might disturb something she couldn't name. On the teacher's desk, a single envelope lay face-down, her name written across it in handwriting she almost recognised. Maya stood very still for a moment, listening to nothing at all, before she reached out and turned it over.`,
  },
  {
    id: "wave3-eng-bakersapprentice",
    title: "The Baker's Apprentice",
    genre: "contemporary-realistic-fiction",
    text: `Old Mr Fenwick had run the bakery on Corn Street for forty years, and everyone in the village said his bread was the best for miles. When Priya arrived for her first morning as his apprentice, she expected him to hand her an apron and a list of instructions. Instead, he simply pointed to a mountain of flour sacks stacked against the wall and said nothing at all.

Priya waited, unsure whether this was a test or simply how he worked. After a long moment, Mr Fenwick picked up a single sack, hoisted it onto his shoulder without any visible effort, and carried it through to the ovens as though it weighed nothing more than a folded newspaper. Priya hurried to lift a sack of her own. It did not move nearly so easily. By the time she had dragged it halfway across the floor, Mr Fenwick was already three sacks ahead of her, whistling quietly to himself.`,
  },
  {
    id: "wave3-eng-lettertograndad",
    title: "Letter to Grandad",
    genre: "epistolary-fiction",
    text: `Dear Grandad,

I know you always say a letter should start with the weather, so I'll tell you it has rained every single day this week, which feels like exactly the sort of thing you'd find funny rather than annoying.

School has been strange without you picking me up on Thursdays. Mr Ahmed asked where my "chauffeur" had gone, and I didn't really know what to say, so I just told him you were resting. I went past the allotment yesterday and your runner beans have grown right over the top of the fence, tangled and a bit wild, like they don't know you're not coming to tie them back. I didn't touch them. I thought you'd want to do that yourself when you're better.

Mum says I shouldn't worry so much, but I've started checking my phone every time it buzzes, just in case it's news. Write back soon, even if it's short.

Love,
Tom`,
  },
  {
    id: "wave3-eng-stormharbour",
    title: "The Storm at the Harbour",
    genre: "contemporary-realistic-fiction",
    text: `By four o'clock, the fishing boats that were still out had become small dark shapes against a sky the colour of old bruises. Sam stood on the harbour wall with his father, who hadn't said very much in the last twenty minutes. Every few seconds, his father checked his watch, then looked back out at the water, then checked his watch again, as though the numbers might change if he looked hard enough.

The wind had picked up enough to make the loose rigging on the moored boats clang against their masts in a rhythm that didn't quite match anything. Down on the quay, Mrs Okafor was pulling the shutters closed on the harbour café two hours before she normally would. Nobody had said the word "storm" out loud yet, but everybody on the harbour wall seemed to be moving a little faster than usual, and nobody was smiling.`,
  },
  {
    id: "wave3-eng-newtrainers",
    title: "The New Trainers",
    genre: "contemporary-realistic-fiction",
    text: `Jayden had saved for eleven weeks to buy the trainers, counting out coins from his paper-round money every Sunday evening. When he finally wore them to school, he spent the whole morning walking very deliberately past groups of people, taking the longest possible route between lessons.

Nobody said anything about them at break time. At lunch, Connor glanced down at Jayden's feet for exactly one second, then carried on eating his sandwich without a word. Jayden told himself it didn't matter what Connor thought. By the end of the day, though, the trainers were tucked at the very back of his locker, and Jayden walked home in his old, scuffed pair instead, taking the shortest route he knew.`,
  },
];

export const rc10Questions = [
  // --- wave3-fam-rc10-atmosphere-mood (6) ---
  { id: "w3-rc10-am-01", passageId: "wave3-eng-emptyclassroom", family_id: "wave3-fam-rc10-atmosphere-mood",
    difficulty: "medium",
    question: `The writer describes the room as holding "a stillness that made her steps sound too loud." What does this description suggest about how Maya is feeling?`,
    modelAnswer: "It suggests Maya feels a heightened, uneasy awareness of the silence, as though she senses something unusual is about to happen.",
    acceptedAnswers: ["she feels uneasy or on edge", "she is very aware of the silence, sensing something is different", "the unusual quiet makes her nervous or alert"],
    misconception: "reads-the-sentence-as-literally-about-volume-not-Mayas-inner-state" },
  { id: "w3-rc10-am-02", passageId: "wave3-eng-emptyclassroom", family_id: "wave3-fam-rc10-atmosphere-mood",
    difficulty: "hard",
    question: `Why might the writer choose to end the passage with Maya "listening to nothing at all" just before she turns the envelope over?`,
    modelAnswer: "It builds suspense by holding the reader in the moment of anticipation, emphasising Maya's hesitation and the tension of not yet knowing what the envelope contains.",
    acceptedAnswers: ["it creates suspense/tension before the reveal", "it shows her hesitating, delaying the moment of finding out", "it emphasises the anticipation building throughout the passage"],
    misconception: "treats-the-detail-as-incidental-rather-than-a-deliberate-tension-building-technique" },
  { id: "w3-rc10-am-03", passageId: "wave3-eng-lettertograndad", family_id: "wave3-fam-rc10-atmosphere-mood",
    difficulty: "hard",
    question: `Tom describes the runner beans as growing "tangled and a bit wild, like they don't know you're not coming to tie them back." What does this description suggest about how Tom is feeling?`,
    modelAnswer: "It suggests Tom feels the absence of his grandad deeply and is projecting that sense of things being 'out of place' onto the garden, showing how much he misses him.",
    acceptedAnswers: ["he misses his grandad and notices the absence everywhere", "he feels things are unsettled without his grandad there", "the disorder in the garden reflects his own sense that something is wrong"],
    misconception: "reads-the-description-as-simply-about-untidy-plants-not-Toms-feelings" },
  { id: "w3-rc10-am-04", passageId: "wave3-eng-lettertograndad", family_id: "wave3-fam-rc10-atmosphere-mood",
    difficulty: "medium",
    question: `Tom writes, "I didn't touch them. I thought you'd want to do that yourself when you're better." What does this suggest about Tom's feelings towards his grandad's return?`,
    modelAnswer: "It suggests Tom is hopeful and wants to believe his grandad will recover, deliberately leaving the task for him as a way of holding on to that hope.",
    acceptedAnswers: ["he is hopeful his grandad will get better", "he wants to preserve something for his grandad to do himself, showing optimism", "he is trying to stay positive about his grandad's recovery"],
    misconception: "reads-it-only-as-a-practical-decision-about-gardening-missing-the-hope-behind-it" },
  { id: "w3-rc10-am-05", passageId: "wave3-eng-stormharbour", family_id: "wave3-fam-rc10-atmosphere-mood",
    difficulty: "easy",
    question: `The sky is described as "the colour of old bruises." What does this description suggest about the coming weather?`,
    modelAnswer: "It suggests the weather is threatening or ominous, hinting that a storm is approaching.",
    acceptedAnswers: ["bad weather or a storm is coming", "the sky looks threatening or dangerous", "something unpleasant is about to happen with the weather"],
    misconception: "describes-the-colour-literally-without-linking-it-to-the-implied-threat" },
  { id: "w3-rc10-am-06", passageId: "wave3-eng-stormharbour", family_id: "wave3-fam-rc10-atmosphere-mood",
    difficulty: "hard",
    question: `"Nobody had said the word 'storm' out loud yet, but everybody on the harbour wall seemed to be moving a little faster than usual, and nobody was smiling." What does this suggest about the atmosphere on the harbour wall?`,
    modelAnswer: "It suggests an unspoken tension or fear, since everyone senses danger is close even though nobody wants to say so directly, creating a quietly anxious atmosphere.",
    acceptedAnswers: ["there is a hidden or unspoken worry among everyone present", "people are anxious but trying not to show it openly", "the tension is felt but not directly discussed"],
    misconception: "focuses-only-on-the-physical-action-of-moving-faster-missing-the-implied-unspoken-fear" },
  // --- wave3-fam-rc10-word-choice (8) ---
  { id: "w3-rc10-wc-01", passageId: "wave3-eng-emptyclassroom", family_id: "wave3-fam-rc10-word-choice",
    difficulty: "easy",
    question: `The chairs were "stacked with unusual care." What does the phrase "unusual care" suggest?`,
    modelAnswer: "It suggests someone deliberately and carefully rearranged the room, which is out of the ordinary and adds to the sense that something unusual has happened.",
    acceptedAnswers: ["someone arranged the room deliberately/carefully, which is unusual", "it hints that something out of the ordinary has occurred", "it shows the tidiness is not accidental"],
    misconception: "treats-unusual-care-as-simply-meaning-tidy-without-noting-the-implied-deliberateness" },
  { id: "w3-rc10-wc-02", passageId: "wave3-eng-emptyclassroom", family_id: "wave3-fam-rc10-word-choice",
    difficulty: "medium",
    question: `The envelope was addressed "in handwriting she almost recognised." What does the phrase "almost recognised" suggest?`,
    modelAnswer: "It suggests a sense of partial, uncertain familiarity, deepening the mystery around who sent the envelope.",
    acceptedAnswers: ["she is not fully sure whose handwriting it is, only partly familiar", "it creates uncertainty/mystery about the sender", "she has some recognition but cannot place it exactly"],
    misconception: "assumes-almost-recognised-means-she-fully-knows-whose-writing-it-is" },
  { id: "w3-rc10-wc-03", passageId: "wave3-eng-bakersapprentice", family_id: "wave3-fam-rc10-word-choice",
    difficulty: "easy",
    question: `Mr Fenwick carried the sack "as though it weighed nothing more than a folded newspaper." What does this comparison suggest about Mr Fenwick?`,
    modelAnswer: "It suggests Mr Fenwick is very strong and experienced, making a physically demanding task look effortless.",
    acceptedAnswers: ["he is strong and used to the work", "the task is easy for him because of years of experience", "he makes something difficult look effortless"],
    misconception: "reads-the-comparison-literally-as-being-about-the-sacks-actual-weight" },
  { id: "w3-rc10-wc-04", passageId: "wave3-eng-bakersapprentice", family_id: "wave3-fam-rc10-word-choice",
    difficulty: "hard",
    question: `What does the detail that Mr Fenwick was "whistling quietly to himself" while working suggest about how he feels about the task?`,
    modelAnswer: "It suggests the work is so familiar and easy to him that he can do it almost without thinking, contrasting with Priya's visible struggle with the same task.",
    acceptedAnswers: ["the task is second nature to him, requiring little effort or concentration", "he is relaxed and unbothered by work that Priya finds difficult", "it shows his ease and experience compared to Priya's struggle"],
    misconception: "treats-whistling-as-only-showing-happiness-missing-the-contrast-with-Priyas-effort" },
  { id: "w3-rc10-wc-05", passageId: "wave3-eng-lettertograndad", family_id: "wave3-fam-rc10-word-choice",
    difficulty: "medium",
    question: `Why might Tom choose to mention that he has "started checking my phone every time it buzzes, just in case it's news"?`,
    modelAnswer: "It suggests Tom is quietly anxious about his grandad's health, even though he does not say so directly.",
    acceptedAnswers: ["he is worried about his grandad without saying so outright", "it reveals underlying anxiety about receiving bad news", "it shows his concern despite trying to sound calm in the letter"],
    misconception: "reads-it-as-simply-describing-a-habit-with-a-phone-missing-the-implied-worry" },
  { id: "w3-rc10-wc-06", passageId: "wave3-eng-stormharbour", family_id: "wave3-fam-rc10-word-choice",
    difficulty: "medium",
    question: `Sam's father checked his watch "as though the numbers might change if he looked hard enough." What does this suggest about how Sam's father is feeling?`,
    modelAnswer: "It suggests he feels anxious and powerless, repeating a pointless action because he cannot control the situation he is worried about.",
    acceptedAnswers: ["he feels anxious and helpless about the situation", "he is worried but can do nothing except wait", "the repeated checking shows his nervous, powerless feeling"],
    misconception: "reads-it-as-simply-about-checking-the-time-missing-the-implied-anxiety" },
  { id: "w3-rc10-wc-07", passageId: "wave3-eng-newtrainers", family_id: "wave3-fam-rc10-word-choice",
    difficulty: "easy",
    question: `Jayden "spent the whole morning walking very deliberately past groups of people, taking the longest possible route between lessons." What does this suggest about how Jayden felt about his new trainers?`,
    modelAnswer: "It suggests Jayden felt proud of his new trainers and wanted other people to notice them.",
    acceptedAnswers: ["he was proud and wanted to show them off", "he wanted people to notice his new trainers", "he felt excited and eager for attention"],
    misconception: "focuses-only-on-the-literal-route-taken-missing-the-implied-desire-to-be-seen" },
  { id: "w3-rc10-wc-08", passageId: "wave3-eng-newtrainers", family_id: "wave3-fam-rc10-word-choice",
    difficulty: "hard",
    question: `By the end of the day, the trainers were "tucked at the very back of his locker," and Jayden walked home in his old pair, "taking the shortest route he knew." What does this change suggest about how Jayden is feeling, compared to the start of the passage?`,
    modelAnswer: "It suggests Jayden has gone from feeling proud and eager to be seen to feeling disappointed or embarrassed, no longer wanting attention after Connor's reaction.",
    acceptedAnswers: ["he now feels embarrassed or disappointed, unlike his earlier pride", "his confidence has faded after Connor's lack of reaction", "he wants to avoid attention now, the opposite of the passage's start"],
    misconception: "notices-the-actions-changed-but-does-not-connect-it-to-the-shift-in-Jaydens-feelings" },
];

const FAMILY_IDS = new Set(["wave3-fam-rc10-word-choice", "wave3-fam-rc10-atmosphere-mood"]);

// Collapses BOTH quote-mark styles to one canonical marker before
// containment checks. A quotation nested inside a question's own outer
// double-quoted span is legitimately rendered with single quotes (e.g.
// the word "storm" in the passage becomes 'storm' when quoted inside a
// question already wrapped in double quotes) — that is correct English
// punctuation, not a wording change, so the verbatim-content check must
// not be sensitive to which quote-mark style surrounds an inner word.
function normalizeQuotes(s) {
  return s.replace(/[‘’]/g, "'").replace(/[“”]/g, '"').replace(/['"]/g, '"');
}

export function verify() {
  const problems = [];
  const passageIds = new Set(passages.map((p) => p.id));
  const passageById = new Map(passages.map((p) => [p.id, p]));
  const seenIds = new Set();
  const seenQuestionText = new Set();

  for (const q of rc10Questions) {
    if (seenIds.has(q.id)) problems.push(`DUPLICATE ID: ${q.id}`);
    seenIds.add(q.id);
    if (seenQuestionText.has(q.question)) problems.push(`DUPLICATE QUESTION TEXT: ${q.id}`);
    seenQuestionText.add(q.question);
    if (!passageIds.has(q.passageId)) problems.push(`UNKNOWN PASSAGE: ${q.id} -> ${q.passageId}`);
    if (!FAMILY_IDS.has(q.family_id)) problems.push(`UNKNOWN FAMILY: ${q.id} -> ${q.family_id}`);
    if (!["easy", "medium", "hard"].includes(q.difficulty)) problems.push(`INVALID DIFFICULTY: ${q.id}`);

    const passage = passageById.get(q.passageId);
    if (!passage) continue;
    // Extract using the question's own OUTER double-quote markers first
    // (before any normalisation collapses inner/outer quote styles
    // together, which would break the non-greedy pairing) — only the
    // extracted span and the passage text are normalised afterwards, for
    // the containment comparison itself.
    const quotes = [...q.question.matchAll(/"([^"]+)"/g)].map((m) => normalizeQuotes(m[1]));
    const text = normalizeQuotes(passage.text);
    if (quotes.length === 0) problems.push(`NO QUOTED PHRASE FOUND: ${q.id} (Effect-of-Language questions should anchor to a specific quoted phrase)`);
    for (const quote of quotes) {
      if (!text.includes(quote)) problems.push(`QUOTATION NOT FOUND VERBATIM IN PASSAGE: ${q.id} -> "${quote}"`);
    }
  }

  for (const p of passages) {
    const words = p.text.trim().split(/\s+/).length;
    if (words < 80 || words > 300) problems.push(`PASSAGE LENGTH OUT OF EXPECTED SHORT-BAND RANGE: ${p.id} (${words} words)`);
  }

  return problems;
}

const problems = verify();
if (problems.length > 0) {
  console.error(`007T English RC-10 batch: FAIL (${problems.length} problems)`);
  for (const p of problems) console.error(`  ${p}`);
  process.exit(1);
}
console.log(`007T English RC-10 batch: PASS, ${passages.length} passages, ${rc10Questions.length} questions, 0 quotation/structure failures`);
