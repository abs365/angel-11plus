/**
 * English Form B: the ORIGINAL replacement for the rejected Salmon passage (Founder decision, 2026-10-08).
 * Sealed candidate content only: nothing here is applied, promoted or activated. Written to be materially different from the live
 * bee Timed Section in subject (urban public health history, not animal senses), discourse structure (problem, failed
 * explanation, crisis, solution, consequence, in chronological order, not an explanation of several parallel methods), sentence
 * frames (no shared run of six or more words with any held passage, tested) and question formats (no "tick Yes or No", no
 * "(a) done for you" synonym frame, no event-sequence question about the same actor).
 *
 * Provenance: original Angel text, written for this purpose, no external rights holder. Factual claims are general historical
 * knowledge and are listed for the independent validator to verify; none of the questions depends on a number a child must
 * recall from outside the passage. Needs independent human validation before any promotion.
 */
export const REPLACEMENT_PASSAGE_ID = "eng-fb-greatstink";
export const REPLACEMENT_PASSAGE_TITLE = "The Great Stink";

export const REPLACEMENT_PASSAGE_TEXT = [
  "In the middle of the nineteenth century, London was the largest city in the world, and it had a problem that nobody could ignore. Millions of people lived there, but the city had no proper way of carrying away its waste. Much of it drained into cesspits beneath houses, or into ditches and streets, and from there it found its way into the River Thames. The river was also where many Londoners collected their drinking water.",
  "At that time, most doctors did not know that germs cause disease. Many believed that illness spread through foul-smelling air, which they called \"miasma\". Cholera, a terrible disease that brought sudden sickness and sometimes death, returned to London several times. In 1854, a doctor named John Snow studied a violent outbreak in the district of Soho. By marking each death on a map, he noticed that most of the victims had drunk water from a single street pump. Soon afterwards the outbreak faded. Snow's discovery pointed to the water, not the air, but many people were slow to be convinced.",
  "Then came the summer of 1858. It was exceptionally hot and dry, and the Thames sank so low that the waste in it baked in the sun. The smell was so dreadful that the newspapers named the season \"the Great Stink\". The Houses of Parliament stand right beside the river, and politicians there held handkerchiefs over their noses. Curtains at the windows were soaked in chemicals to keep the smell out, and some members even talked of moving to another town. For the first time, the people who made the laws could not escape the problem they had put off for years.",
  "Parliament acted quickly. Within weeks it agreed to pay for a new system, and the job was given to an engineer named Joseph Bazalgette. His plan was bold but simple in principle. Instead of letting waste flow into the river where people lived, he would build great sewers that caught it before it reached the Thames and carried it eastwards, many miles downstream, where it could be released on the outgoing tide. Because London lay in a shallow bowl beside the river, pumping stations were needed to lift the waste so that it could keep flowing.",
  "The work was enormous. Thousands of labourers dug long tunnels beneath the busy streets and lined them with hundreds of millions of bricks. Bazalgette also made the pipes larger than the city seemed to need, because he expected London to keep growing. That decision proved wise. The main tunnels were opened in the 1860s, the whole scheme was complete by the middle of the 1870s, and much of it is still in use today.",
  "The new sewers did more than remove a smell. As waste stopped pouring into the river, deadly outbreaks of cholera became far less common in the capital. On top of some of the tunnels, engineers also built wide embankments beside the water, which gave the people of London new roads and gardens. A crisis that began with a dreadful smell ended by making the city healthier, and it showed that a problem can be solved once it can no longer be ignored.",
].join("\n\n");

export type ReplacementTier =
  | "TIER2_ACCEPTED_SET"
  | "TIER3_QUOTATION_PLUS_EXPLANATION"
  | "TIER4_ORDERED_LIST"
  | "TIER5_NAMED_COMPONENT_PLUS_EXPLANATION";

export interface ReplacementItem {
  id: string;
  skill: "QT-RC-01" | "QT-RC-02" | "QT-RC-03" | "QT-RC-04" | "QT-RC-06" | "QT-RC-10";
  /** Label stored in the prompt JSON, matching the existing convention for the skill. */
  skillLabel: string;
  difficulty: "easy" | "medium" | "hard";
  marks: number;
  tier: ReplacementTier;
  question: string;
  modelAnswer: string;
  acceptedAnswers?: string[];
  quotationRequired?: string[];
  orderedAnswer?: string[];
  markingGuidance?: string;
  /** For retrieval and word items: a phrase the answer rests on, which must occur in the passage. */
  anchors: string[];
  alternativeAnswerNotes: string;
  estimatedTimeSeconds: number;
  misconception: string;
  transferClass: "NEAR_TRANSFER" | "MIXED_TRANSFER" | "FAR_TRANSFER";
  /** Wrong answers a careful child could plausibly give; none may be accepted by the real marker. */
  plausibleWrongAnswers?: string[];
}

const syn = (id: string, para: string, word: string, meaning: string, wrong: string[], note: string): ReplacementItem => ({
  id,
  skill: "QT-RC-04",
  skillLabel: "vocabulary",
  difficulty: "medium",
  marks: 1,
  tier: "TIER2_ACCEPTED_SET",
  question: `Find and copy one word from the ${para} paragraph that means ${meaning}.`,
  modelAnswer: word,
  acceptedAnswers: [word],
  anchors: [word],
  alternativeAnswerNotes: note,
  estimatedTimeSeconds: 50,
  misconception: "Copying a nearby word that does not have the stated meaning, or a whole phrase instead of one word.",
  transferClass: "NEAR_TRANSFER",
  plausibleWrongAnswers: wrong,
});

export const REPLACEMENT_ITEMS: ReplacementItem[] = [
  {
    id: "eng-fb-greatstink-q01", skill: "QT-RC-01", skillLabel: "evidence", difficulty: "easy", marks: 1, tier: "TIER2_ACCEPTED_SET",
    question: "In which year did the summer known as \"the Great Stink\" happen?", modelAnswer: "1858", acceptedAnswers: ["1858"],
    anchors: ["summer of 1858"], alternativeAnswerNotes: "Only the year is correct. 1854 (the cholera outbreak) is the tempting wrong answer.", estimatedTimeSeconds: 45,
    misconception: "Confusing the year of John Snow's study (1854) with the year of the hot summer (1858).", transferClass: "NEAR_TRANSFER", plausibleWrongAnswers: ["1854", "1860", "1875", "the summer"],
  },
  {
    id: "eng-fb-greatstink-q02", skill: "QT-RC-01", skillLabel: "evidence", difficulty: "easy", marks: 1, tier: "TIER2_ACCEPTED_SET",
    question: "What did Dr John Snow mark on his map of Soho?", modelAnswer: "Each death.",
    acceptedAnswers: ["each death", "every death", "the deaths", "deaths", "where people died", "the places where people died", "the deaths from cholera", "the cholera deaths"],
    anchors: ["marking each death on a map"], alternativeAnswerNotes: "Accepted: the deaths, in any of these wordings. Not accepted: the pump on its own (that is what he noticed, not what he marked).", estimatedTimeSeconds: 45,
    misconception: "Giving the street pump, which the map led him to notice, instead of what he marked.", transferClass: "NEAR_TRANSFER", plausibleWrongAnswers: ["the pump", "a street pump", "the river", "the sewers"],
  },
  {
    id: "eng-fb-greatstink-q03", skill: "QT-RC-01", skillLabel: "evidence", difficulty: "medium", marks: 1, tier: "TIER2_ACCEPTED_SET",
    question: "According to the passage, why were pumping stations needed?", modelAnswer: "Because London lay in a shallow bowl, so the waste had to be lifted to keep flowing.",
    acceptedAnswers: ["london lay in a shallow bowl", "london lies in a shallow bowl", "a shallow bowl", "to lift the waste", "lift the waste", "so the waste could keep flowing", "to keep the waste flowing", "the waste had to be lifted", "to lift waste so it could keep flowing"],
    anchors: ["shallow bowl", "lift the waste", "keep flowing"], alternativeAnswerNotes: "Either part of the reason is accepted (the shape of the land, or the need to lift the waste so that it keeps flowing). Answers that only restate that waste was removed are not accepted.", estimatedTimeSeconds: 60,
    misconception: "Saying the stations cleaned or filtered the water, which the passage does not say.", transferClass: "NEAR_TRANSFER", plausibleWrongAnswers: ["to clean the water", "to make the river deeper", "to pump drinking water", "to stop the smell"],
  },
  {
    id: "eng-fb-greatstink-q04", skill: "QT-RC-02", skillLabel: "inference", difficulty: "medium", marks: 3, tier: "TIER3_QUOTATION_PLUS_EXPLANATION",
    question: "Which ONE of these statements is best supported by the passage?\nA. Doctors in 1854 already knew that germs cause cholera.\nB. Parliament acted because the smell affected the people who made the laws.\nC. Bazalgette made the sewers as small as possible to save money.\nGive the letter. Then copy the words from the passage that support your answer, and explain in one sentence how they support it.",
    modelAnswer: "B. For example: \"For the first time, the people who made the laws could not escape the problem they had put off for years.\" This shows that Parliament only acted once the smell reached the politicians themselves.",
    quotationRequired: ["could not escape the problem they had put off for years", "the people who made the laws could not escape the problem", "politicians there held handkerchiefs over their noses", "held handkerchiefs over their noses"],
    markingGuidance: "1 mark: the letter B. 1 mark: a quotation that supports it (either of the two accepted quotations, copied with only spelling or punctuation slips). 1 mark: a sentence explaining how the quotation shows Parliament was affected personally and so acted. No marks for the quotation or explanation if the letter is wrong.",
    anchors: ["For the first time, the people who made the laws could not escape the problem they had put off for years", "politicians there held handkerchiefs over their noses"],
    alternativeAnswerNotes: "Statement A is contradicted (most doctors did not know that germs cause disease). Statement C is contradicted (he made the pipes larger than seemed needed). Accept other relevant quotations that genuinely show the politicians were affected.", estimatedTimeSeconds: 150,
    misconception: "Choosing A because the passage mentions a doctor studying cholera, or giving a quotation about the smell in general rather than its effect on the lawmakers.", transferClass: "MIXED_TRANSFER",
  },
  {
    id: "eng-fb-greatstink-q05", skill: "QT-RC-03", skillLabel: "meaning", difficulty: "hard", marks: 2, tier: "TIER5_NAMED_COMPONENT_PLUS_EXPLANATION",
    question: "In the third paragraph the writer says the politicians \"could not escape the problem they had put off for years\". Explain what \"put off\" means here. Use the passage to support your answer.",
    modelAnswer: "\"Put off\" means delayed or avoided dealing with something. The people in power had known about the waste problem for years but had not done anything about it until the smell reached them.",
    acceptedAnswers: ["delayed", "postponed", "avoided", "not dealt with", "left for later", "did not deal with it", "did nothing about it"],
    markingGuidance: "1 mark: the meaning of \"put off\" (delayed, postponed, avoided or left for later). 1 mark: applies it to the passage (they knew of the problem or the sewage had been building up for years, and had not acted). Do not award the second mark for a general definition with no link to the passage.",
    anchors: ["put off for years"], alternativeAnswerNotes: "A child may reasonably say \"ignored\" or \"not done anything about\"; the marker should credit the idea of delay or avoidance, not a single word.", estimatedTimeSeconds: 120,
    misconception: "Reading \"put off\" as \"disgusted by\" or \"made someone dislike\", its other everyday sense.", transferClass: "MIXED_TRANSFER",
  },
  syn("eng-fb-greatstink-q06", "third", "exceptionally", "\"much more than is normal\"", ["terrible", "dreadful", "hot", "dry"], "Only the word from the passage is accepted. A child who copies a whole sentence containing it is also credited by the marker, which is how this tier works."),
  syn("eng-fb-greatstink-q07", "fourth", "bold", "\"brave and daring\"", ["simple", "plan", "great", "quickly"], "Only the word from the passage is accepted."),
  syn("eng-fb-greatstink-q08", "fifth", "enormous", "\"very, very large\"", ["larger", "busy", "long", "thousands"], "Only the word from the passage is accepted. \"Larger\" is a comparative in the same paragraph and is not the stated meaning."),
  syn("eng-fb-greatstink-q09", "second", "convinced", "\"persuaded that something is true\"", ["believed", "studied", "noticed", "discovered"], "\"Believed\" appears in the same paragraph but means thought to be true, not persuaded; validator to confirm the distinction is fair for 10 to 11 year olds."),
  {
    id: "eng-fb-greatstink-q10", skill: "QT-RC-06", skillLabel: "structure", difficulty: "medium", marks: 4, tier: "TIER4_ORDERED_LIST",
    question: "The four events below are listed in no particular order. Arrange them in the order in which they took place, using what the passage tells you.\nA. Parliament agreed to pay for a new system of sewers.\nB. London had a hot, dry summer in 1858.\nC. Dr John Snow studied an outbreak of cholera in Soho.\nD. Engineers built embankments on top of some of the tunnels.\nWrite the four letters in order, separated by commas.",
    modelAnswer: "C, B, A, D", orderedAnswer: ["c", "b", "a", "d"],
    anchors: ["In 1854", "Then came the summer of 1858", "Within weeks it agreed to pay", "On top of some of the tunnels"],
    alternativeAnswerNotes: "Order is the assessed construct and each position is marked. Letters may be separated by commas, spaces, new lines or arrows. Answers written as the full event text are not matched (the question asks for letters).", estimatedTimeSeconds: 100,
    misconception: "Placing the embankments earlier, or the hot summer before John Snow because it is the famous event.", transferClass: "MIXED_TRANSFER", plausibleWrongAnswers: ["D, A, B, C", "B, C, A, D", "A, B, C, D"],
  },
  {
    id: "eng-fb-greatstink-q11", skill: "QT-RC-10", skillLabel: "inference", difficulty: "hard", marks: 2, tier: "TIER5_NAMED_COMPONENT_PLUS_EXPLANATION",
    question: "The writer says that politicians \"held handkerchiefs over their noses\" and that curtains were \"soaked in chemicals\". Why do you think the writer includes these details?",
    modelAnswer: "They show how unbearable the smell was and that it affected even the powerful people in Parliament, which helps explain why they finally acted.",
    acceptedAnswers: ["to show how bad the smell was", "to show how unbearable the smell was", "to show the politicians were affected", "to show even the politicians could not escape it", "to help explain why parliament acted"],
    markingGuidance: "1 mark: the details show how bad or unbearable the smell was. 1 mark: links this to the politicians being affected personally, which explains why Parliament then acted. Do not award the second mark for 'it was smelly' alone.",
    anchors: ["held handkerchiefs over their noses", "soaked in chemicals"], alternativeAnswerNotes: "Accept other reasoned answers that connect the details to the effect on the readers' picture of the crisis or to why Parliament acted; a purely descriptive answer earns at most the first mark.", estimatedTimeSeconds: 120,
    misconception: "Saying the details are there to make the passage funny, or only that they are \"descriptive\".", transferClass: "FAR_TRANSFER",
  },
];

export const REPLACEMENT_TOTALS = {
  items: REPLACEMENT_ITEMS.length,
  marks: REPLACEMENT_ITEMS.reduce((s, i) => s + i.marks, 0),
};

/** Factual claims the independent validator must verify against a reliable source. */
export const REPLACEMENT_FACTUAL_CLAIMS = [
  "In the mid-nineteenth century London was the largest city in the world, with millions of inhabitants.",
  "Waste drained into cesspits, ditches and streets and from there into the Thames, which was also a source of drinking water.",
  "Most doctors at the time did not know that germs cause disease; many believed in \"miasma\" (disease carried by foul air).",
  "Cholera returned to London several times in the mid-nineteenth century.",
  "In 1854 Dr John Snow studied a severe cholera outbreak in Soho, mapped the deaths, and found most victims had used one street pump; the outbreak faded soon afterwards (the passage does not claim the pump handle caused this).",
  "The summer of 1858 was exceptionally hot and dry, the Thames fell low, and the smell was so bad that newspapers called it \"the Great Stink\".",
  "Politicians at the Houses of Parliament covered their noses; curtains at the windows were soaked in chemicals; some members talked of moving elsewhere.",
  "Parliament agreed within weeks to fund a new sewer system; the engineer was Joseph Bazalgette.",
  "The scheme carried waste east, downstream, to be released on the outgoing tide; pumping stations lifted waste because of London's low, bowl-like position.",
  "Labourers dug long tunnels lined with hundreds of millions of bricks; the pipes were made larger than currently needed because London was expected to grow.",
  "The main tunnels were opened in the 1860s and the whole scheme was complete by the mid-1870s; much of it is still in use.",
  "Deadly cholera outbreaks became far less common afterwards; embankments with new roads and gardens were built on top of some tunnels.",
];
