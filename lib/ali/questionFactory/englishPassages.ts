import type { EnglishPassage } from "./englishTypes";

/**
 * Controlled Scale Increment 002, Section 14 — Original Passage Proof.
 *
 * Exactly 4 original passages, the minimum this increment judged
 * sufficient to prove the architecture across 5 selected families
 * without building a large passage library this pass (Section 14's own
 * explicit instruction). Two narrative, two non-fiction, each rich
 * enough to support retrieval, sequencing, vocabulary, synonym, and
 * quotation+explanation questions without straining plausibility. Every
 * word is original composition for this increment -- no official CSSE
 * past-paper text is reproduced or paraphrased anywhere (Section 7/22).
 * Word counts are the one legitimate, mechanically-true complexity
 * figure claimed (Section 7) -- no readability formula or grade-level
 * banding is asserted.
 */

function wordCount(text: string): number {
  return text.trim().split(/\s+/).length;
}

function toPassage(passageId: string, title: string, genre: "narrative" | "non_fiction", paragraphs: string[], ageAppropriatenessNote: string): EnglishPassage {
  const text = paragraphs.join("\n\n");
  return { passageId, title, genre, text, paragraphs, wordCount: wordCount(text), provenance: "angel_original", ageAppropriatenessNote };
}

const LIGHTHOUSE_PARAGRAPHS = [
  "Maya had visited the old lighthouse a hundred times, but she had never been allowed up the spiral staircase until her grandfather finally handed her the heavy brass key. \"Mind the thirteenth step,\" he warned, tapping his walking stick against the stone floor. \"It has been loose since before your mother was born.\"",
  "The staircase wound upward in tight, dizzying loops, and the air grew colder with every turn. Maya counted the steps under her breath, her fingers trailing along a rope handrail that felt rough and slightly damp. When she reached the thirteenth step, she remembered her grandfather's warning and stretched her leg carefully over it, landing with a soft thud on the step beyond.",
  "At the top, the lamp room was smaller than she had imagined, its curved glass walls streaked with salt from decades of storms. An enormous lens, taller than Maya herself, sat in the centre of the room like a glass beehive. Her grandfather explained that the lens did not create light of its own; instead, it bent and focused a single bulb's glow into a beam that could be seen for twenty miles out to sea.",
  "\"Every lighthouse keeper before me had to climb these stairs at dusk, rain or shine, to light the lamp by hand,\" he said, resting a hand on the cold glass. \"Now a computer does it, but somebody still has to check that computer is telling the truth.\" Maya asked what would happen if nobody checked. Her grandfather's smile faded slightly. \"Ships have been lost for less,\" he said quietly, and for a moment Maya understood, properly for the first time, why he still climbed those stairs every single evening.",
  "Before they left, Maya pressed her palm against the great lens one last time. It was surprisingly warm, as though it remembered every ship it had ever guided safely home.",
];

const RECYCLED_PAPER_PARAGRAPHS = [
  "Every year, households across the country place old newspapers, cardboard boxes, and used notebooks into recycling bins without necessarily knowing what happens next. The journey from a crumpled sheet of paper to a brand-new notebook page involves several distinct stages, each of which removes something the previous stage left behind.",
  "First, collected paper is transported to a recycling plant, where it is sorted by hand and by machine into different grades. Newspaper, cardboard, and office paper are separated because they contain different types of fibre and cannot be processed together without weakening the final product. Once sorted, the paper is shredded into small pieces and mixed with water in a giant container called a pulper, which breaks it down into a thick, soupy mixture known as pulp.",
  "The pulp is then pushed through screens with tiny holes. This step removes staples, plastic film, and other contaminants that would otherwise ruin the texture of the finished paper. Next, the pulp travels through a cleaning process that spins it at high speed, flinging out heavier impurities such as grit and small pieces of glass using centrifugal force.",
  "One of the trickiest stages is de-inking, in which chemicals and air bubbles are used to separate ink particles from the paper fibres. The ink rises to the surface as a foam and is skimmed away, leaving behind fibres that are considerably paler than before. Finally, the cleaned pulp is spread thinly across a moving mesh screen, pressed to remove water, and dried by passing over heated rollers, emerging at the end of the line as fresh, usable paper.",
  "Recycled paper can typically be reprocessed this way four to six times before its fibres become too short and weak to hold together, at which point they are usually blended with a small amount of fresh wood pulp to strengthen the mixture once again.",
];

const KITE_FESTIVAL_PARAGRAPHS = [
  "Every spring, the fields behind Oakbridge School filled with colour as families gathered for the annual kite festival. Ravi had spent three weeks building his kite from bamboo strips and red silk, following instructions his uncle had sent from overseas, and he could hardly sit still in the car on the way there.",
  "When they arrived, the field was already crowded with kites shaped like dragons, birds, and even one enormous octopus with rippling purple tentacles. Ravi's stomach tightened as he compared his simple diamond shape to the elaborate creations soaring above him. His younger sister, Priya, tugged at his sleeve and pointed at a boy nearby whose kite had crashed twice already, tangled string trailing behind him like a confused kitten chasing its own tail.",
  "\"At least yours will actually fly,\" Priya said, trying to be encouraging, though her voice wobbled slightly with doubt. Ravi took a deep breath, unwound his string, and ran against the wind exactly as his uncle had described in his letter. For a heart-stopping second, nothing happened. Then, suddenly, the kite lifted, caught a gust, and climbed steadily into the pale blue sky.",
  "Ravi laughed with relief and let the string spool out further, watching his simple red kite rise above even the octopus and the dragons. An elderly man standing nearby leaned on his cane and remarked, \"Sometimes the plainest kite flies the truest, because it isn't weighed down trying to be something it's not.\" Ravi wasn't entirely sure what the man meant, but he decided to remember the words anyway, storing them away like a small, valuable coin.",
  "By the time the sun began to set, painting the sky the same colour as his kite, Ravi's arms ached pleasantly from holding the string steady for so long. Priya had long since given up watching and was chasing the boy with the tangled kite across the grass, both of them laughing. Ravi didn't mind being left to fly alone; for once, he felt entirely, quietly proud.",
];

const PENGUIN_PARAGRAPHS = [
  "Of the seventeen species of penguin found around the world, none endures conditions as extreme as the emperor penguin, which breeds during the brutal Antarctic winter when temperatures can plunge below minus sixty degrees Celsius and winds regularly exceed one hundred and fifty kilometres per hour.",
  "Unlike most birds, which migrate away from harsh winters, emperor penguins march up to one hundred and twenty kilometres inland across sea ice to reach their traditional breeding grounds. Scientists believe this seemingly illogical journey actually offers a crucial advantage: breeding far from the coast reduces the risk that the sea ice beneath the colony will break apart before the chicks are strong enough to survive on their own.",
  "After the female lays a single egg, she transfers it carefully onto her mate's feet, where it rests beneath a warm fold of skin called a brood pouch. The female then departs on a long journey back to the ocean to feed, leaving the male to incubate the egg completely alone for around two months, surviving entirely on stored body fat and losing nearly half his body weight in the process.",
  "To conserve warmth during this period, male emperor penguins huddle together in enormous, tightly packed groups, sometimes numbering in the thousands. Individuals continuously rotate from the freezing outer edge of the huddle toward the sheltered centre, meaning that over time every penguin shares roughly the same amount of exposure to the biting wind. This rotation is so effective that temperatures at the centre of a huddle have been measured at over thirty-seven degrees Celsius, despite the arctic conditions raging just metres away.",
  "When the chick finally hatches, the returning females can locate their own mate and chick among thousands of near-identical birds by recognising the unique call each pair has developed, a feat of vocal memory that continues to intrigue researchers studying animal communication today.",
];

export const LIGHTHOUSE_PASSAGE: EnglishPassage = toPassage(
  "eng-inc002-lighthouse-keepers-apprentice",
  "The Lighthouse Keeper's Apprentice",
  "narrative",
  LIGHTHOUSE_PARAGRAPHS,
  "Original narrative, no violence/distressing content, vocabulary and sentence complexity judged appropriate for an 11+ selective-school comprehension passage by this increment's own authoring review -- not independently verified by any external readability tool."
);

export const RECYCLED_PAPER_PASSAGE: EnglishPassage = toPassage(
  "eng-inc002-journey-of-recycled-paper",
  "The Journey of Recycled Paper",
  "non_fiction",
  RECYCLED_PAPER_PARAGRAPHS,
  "Original informational/process text, factually plausible (general recycling process, not a claimed authoritative technical source), judged age-appropriate by this increment's own authoring review."
);

export const KITE_FESTIVAL_PASSAGE: EnglishPassage = toPassage(
  "eng-inc002-kite-festival",
  "The Kite Festival",
  "narrative",
  KITE_FESTIVAL_PARAGRAPHS,
  "Original narrative, no violence/distressing content, judged age-appropriate by this increment's own authoring review."
);

export const PENGUIN_PASSAGE: EnglishPassage = toPassage(
  "eng-inc002-emperor-penguins",
  "Emperor Penguins: Built for the Cold",
  "non_fiction",
  PENGUIN_PARAGRAPHS,
  "Original informational text about a real species' general, well-documented behaviour (breeding march, huddling, incubation) written from general knowledge, not copied from any single source; judged age-appropriate by this increment's own authoring review."
);

export const ENGLISH_PASSAGES: readonly EnglishPassage[] = [LIGHTHOUSE_PASSAGE, RECYCLED_PAPER_PASSAGE, KITE_FESTIVAL_PASSAGE, PENGUIN_PASSAGE];

export function getPassageById(passageId: string): EnglishPassage {
  const passage = ENGLISH_PASSAGES.find((p) => p.passageId === passageId);
  if (!passage) throw new Error(`getPassageById: no passage with id "${passageId}"`);
  return passage;
}
