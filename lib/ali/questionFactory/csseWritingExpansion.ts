/**
 * CSSE Completion, Priority 4 -- the next governed Continuous Writing expansion (CANDIDATES for Founder
 * educational review; nothing here is learner-reachable until a Founder-applied migration promotes it).
 *
 * Live baseline (2026-10-08): 8 practice prompts -- 7 reflective/discursive (QT-WC-01a, one question per family)
 * and 1 picture-led narrative (QT-WC-01b, "The Treehouse Lantern", Founder-approved after the Riverboat was
 * rejected for "nothing to write with the picture"). CSSE's own papers pair one reflective/discursive task with one
 * picture-narrative task, so picture-led depth is the scarcer and harder supply.
 *
 * This set adds 4 reflective/discursive prompts and 3 picture-led narratives. Topics were chosen to be distinct from
 * every existing Practice, Mock and Mock-reserve Writing topic (see the test), so no sealed-content overlap is created.
 *
 * "Narratively generative" standard (the Treehouse Lantern evidence): a picture qualifies only if it offers several
 * concrete story footholds a child can build a SEQUENCE from -- something that has just happened, something
 * unexplained, a person or watcher with a possible motive, and an object that can carry a turning point -- rather
 * than a scene that can only be described. Each picture below lists its footholds in `narrativeFootholds`
 * (reviewed by the test: at least five, each visible in the alt text).
 *
 * Marking note: the five-dimension qualitative model is unchanged. These prompts introduce no mark scheme; the
 * official CSSE comprehension/Writing mark split is unresolved and is not assumed anywhere here. AI feedback on these
 * prompts stays supported-tier and can never establish mastery (existing governance).
 */

export interface WritingExpansionPrompt {
  id: string;
  familyId: string;
  skill: "QT-WC-01a" | "QT-WC-01b";
  type: "descriptive" | "narrative" | "picture-narrative";
  title: string;
  prompt: string;
  checklist: string[];
  stimulus?: { type: "image"; altText: string; imageAssetUrl: string };
  /** Documentation only (not stored in the prompt JSON): the concrete story footholds the picture offers. */
  narrativeFootholds?: string[];
  addressesMisconception: string;
  transferClass: "NEAR_TRANSFER" | "MIXED_TRANSFER" | "FAR_TRANSFER";
  authorNote: string;
}

const REFLECTIVE_MISCONCEPTION =
  "Writing a general or invented account of the topic instead of the writer's own real experience or genuine view -- the marker credits a clear personal answer with a specific example and a reason, not a list of general statements.";
const PICTURE_MISCONCEPTION =
  "Describing the picture itself (a static scene description) rather than writing a story that uses it as a starting point -- the marker cannot credit narrative writing that never actually narrates a sequence of events.";

const REFLECTIVE_CHECKLIST_TAIL = [
  "Organise your writing into clear paragraphs",
  "Check your spelling and punctuation before you finish",
];
const PICTURE_CHECKLIST_COMMON = [
  "Write at least six sentences",
  "Choose ONE clear direction for your story early on, and make it clear whose story this is",
  "Build in a real turning point or discovery, not just a description of what the picture shows",
  "Choose vocabulary carefully and vary your sentence lengths and openings",
  "Organise your writing into clear paragraphs",
  "Check your spelling and punctuation before you finish",
];

export const CSSE_WRITING_EXPANSION: WritingExpansionPrompt[] = [
  // ---- Reflective / discursive (QT-WC-01a) ----
  {
    id: "eng-csse-writing-proudofother-01",
    familyId: "eng-csse-writing-wc01a-proudofother",
    skill: "QT-WC-01a",
    type: "descriptive",
    title: "Proud of Someone Else",
    prompt:
      "Write about a time when you felt really proud of someone else -- a friend, a brother or sister, a classmate, or a family member. Explain what they did, why it mattered, and how you felt as you watched or heard about it.",
    checklist: [
      "Write at least six sentences",
      "Choose one real moment and say clearly who it was about early on",
      "Include at least one specific detail of what happened -- what was said, done or seen",
      "Explain WHY you felt proud, not only that you did",
      ...REFLECTIVE_CHECKLIST_TAIL,
    ],
    addressesMisconception: REFLECTIVE_MISCONCEPTION,
    transferClass: "FAR_TRANSFER",
    authorNote:
      "CSSE Completion Priority 4, reflective/discursive candidate. QT-WC-01a, WC-01. Topic distinct from every live Practice/Mock/reserve Writing topic. Awaiting Founder educational review before any promotion.",
  },
  {
    id: "eng-csse-writing-onefriendmany-01",
    familyId: "eng-csse-writing-wc01a-onefriendmany",
    skill: "QT-WC-01a",
    type: "descriptive",
    title: "One Close Friend or Many Friends?",
    prompt:
      "Some people say it is better to have one really close friend. Others say it is better to have lots of friends. What do you think, and why? Use your own experience or things you have noticed to support your view.",
    checklist: [
      "Write at least six sentences",
      "Say clearly which view you hold, or explain honestly if you think both have a place",
      "Give at least one real example from your own life or from people you know",
      "Give a reason for your view, and think about why someone might disagree",
      ...REFLECTIVE_CHECKLIST_TAIL,
    ],
    addressesMisconception: REFLECTIVE_MISCONCEPTION,
    transferClass: "MIXED_TRANSFER",
    authorNote:
      "CSSE Completion Priority 4, discursive candidate (two views, own opinion plus experience). QT-WC-01a, WC-01. Distinct topic. Awaiting Founder educational review before any promotion.",
  },
  {
    id: "eng-csse-writing-tradition-01",
    familyId: "eng-csse-writing-wc01a-tradition",
    skill: "QT-WC-01a",
    type: "descriptive",
    title: "A Tradition That Matters",
    prompt:
      "Write about a tradition -- something your family, your friends or your community does regularly, such as a celebration, a weekly habit or a special meal. Describe what happens, and explain why it matters to you.",
    checklist: [
      "Write at least six sentences",
      "Describe one specific tradition you actually know, not a general type of celebration",
      "Include at least one concrete detail -- something you see, hear, taste or do",
      "Explain WHY it matters to you, not only what happens",
      ...REFLECTIVE_CHECKLIST_TAIL,
    ],
    addressesMisconception: REFLECTIVE_MISCONCEPTION,
    transferClass: "NEAR_TRANSFER",
    authorNote:
      "CSSE Completion Priority 4, reflective/descriptive candidate. QT-WC-01a, WC-01. Distinct topic; deliberately inclusive of any family or community tradition. Awaiting Founder educational review.",
  },
  {
    id: "eng-csse-writing-wintakepart-01",
    familyId: "eng-csse-writing-wc01a-wintakepart",
    skill: "QT-WC-01a",
    type: "descriptive",
    title: "Is It Better to Win or to Take Part?",
    prompt:
      "People often say, \"It is not the winning that matters, it is the taking part.\" Do you agree? Write about your own opinion, using your own experience or things you have noticed to support what you think.",
    checklist: [
      "Write at least six sentences",
      "Say clearly whether you agree, disagree, or agree in some situations only",
      "Use at least one real example -- a game, a race, a competition or something you have seen",
      "Give a reason for your view and consider one point against it",
      ...REFLECTIVE_CHECKLIST_TAIL,
    ],
    addressesMisconception: REFLECTIVE_MISCONCEPTION,
    transferClass: "MIXED_TRANSFER",
    authorNote:
      "CSSE Completion Priority 4, discursive candidate. QT-WC-01a, WC-01. Distinct topic. Awaiting Founder educational review.",
  },

  // ---- Picture-led narrative (QT-WC-01b) ----
  {
    id: "eng-csse-writing-picturenarrative-stationclock-01",
    familyId: "eng-csse-writing-wc01b-stationclock",
    skill: "QT-WC-01b",
    type: "picture-narrative",
    title: "The Station Clock",
    prompt: "Write a story based on the picture below.",
    stimulus: {
      type: "image",
      altText:
        "A small railway platform in the late afternoon. A large station clock on the wall has stopped at ten past five, although a lamp beside it is already lit. A brown suitcase stands alone in the middle of the platform with a paper luggage tag half torn off and hanging by a thread. A red scarf is snagged on the iron fence beside a bench, and a folded ticket with a time circled in red lies on the bench. Far along the platform a figure in a long grey coat stands at the very edge, back turned, looking down the empty track where the rear lights of a train are shrinking into the distance.",
      imageAssetUrl: "/practice-assets/writing-picture-narrative/stationclock-v1.svg",
    },
    narrativeFootholds: [
      "stopped clock",
      "suitcase left alone with a half-torn tag",
      "snagged red scarf",
      "ticket with a circled time",
      "figure left behind watching the train go",
    ],
    checklist: [
      "Write at least six sentences",
      "Ground your story in real details you can see in the picture -- for example the clock, the suitcase and its tag, the scarf, the ticket, or the figure at the edge of the platform -- rather than an idea that has nothing to do with them",
      ...PICTURE_CHECKLIST_COMMON.slice(1),
    ],
    addressesMisconception: PICTURE_MISCONCEPTION,
    transferClass: "FAR_TRANSFER",
    authorNote:
      "CSSE Completion Priority 4, picture-narrative candidate. QT-WC-01b, WC-01. Original vector illustration (stationclock-v1.svg). Five story footholds; distinct setting from Treehouse Lantern, old shed and the rejected riverboat. Awaiting Founder visual and educational review (the Riverboat precedent applies: reject if there is 'nothing to write with the picture').",
  },
  {
    id: "eng-csse-writing-picturenarrative-lastbus-01",
    familyId: "eng-csse-writing-wc01b-lastbus",
    skill: "QT-WC-01b",
    type: "picture-narrative",
    title: "The Last Bus",
    prompt: "Write a story based on the picture below.",
    stimulus: {
      type: "image",
      altText:
        "A bus shelter beside a quiet road on a snowy evening. Snow is still falling. Inside the shelter a parcel wrapped in brown paper and tied with string sits on the bench, its label smudged so the address cannot be read. A child's red mitten is pinned to the noticeboard with a drawing pin, next to a sheet of paper covered in hurried writing. Two sets of footprints mark the snow: a small set leading into the shelter and not out again, and a larger set leading away down the road. In the distance a bus is approaching with its headlights on, but the sign above its windscreen is blank. In a house across the road, one upstairs window is lit and a small figure stands in it, one hand raised against the glass.",
      imageAssetUrl: "/practice-assets/writing-picture-narrative/snowbusshelter-v1.svg",
    },
    narrativeFootholds: [
      "parcel with a smudged address",
      "pinned mitten and hurried note",
      "footprints that go in but not out",
      "bus with a blank sign",
      "figure watching from a lit window",
    ],
    checklist: [
      "Write at least six sentences",
      "Ground your story in real details you can see in the picture -- for example the parcel, the mitten and note, the footprints, the bus, or the lit window -- rather than an idea that has nothing to do with them",
      ...PICTURE_CHECKLIST_COMMON.slice(1),
    ],
    addressesMisconception: PICTURE_MISCONCEPTION,
    transferClass: "FAR_TRANSFER",
    authorNote:
      "CSSE Completion Priority 4, picture-narrative candidate. QT-WC-01b, WC-01. Original vector illustration (snowbusshelter-v1.svg). Five story footholds; winter-dusk road setting. Awaiting Founder visual and educational review.",
  },
  {
    id: "eng-csse-writing-picturenarrative-afterclosing-01",
    familyId: "eng-csse-writing-wc01b-afterclosing",
    skill: "QT-WC-01b",
    type: "picture-narrative",
    title: "After Closing Time",
    prompt: "Write a story based on the picture below.",
    stimulus: {
      type: "image",
      altText:
        "The inside of a small school library at night, long after closing. One green reading lamp is still switched on over a table. On the table an old book lies open with a small brass key resting in the middle of the page. A tall wooden ladder leans against the shelves, and one book high up sticks out further than all the rest. The window beside the shelves is open a little and the curtain is blowing into the room, with the moon outside. A trail of muddy footprints leads from the window across the floor to the table, and a torch lies on its side under the table, still shining a thin beam along the floor. The wall clock shows nearly midnight.",
      imageAssetUrl: "/practice-assets/writing-picture-narrative/libraryafterclosing-v1.svg",
    },
    narrativeFootholds: [
      "open window and muddy footprints to the table",
      "brass key in an open book",
      "book that sticks out high on the shelf",
      "torch left shining",
      "clock near midnight",
    ],
    checklist: [
      "Write at least six sentences",
      "Ground your story in real details you can see in the picture -- for example the open window, the muddy footprints, the key in the book, the ladder, or the torch -- rather than an idea that has nothing to do with them",
      ...PICTURE_CHECKLIST_COMMON.slice(1),
    ],
    addressesMisconception: PICTURE_MISCONCEPTION,
    transferClass: "FAR_TRANSFER",
    authorNote:
      "CSSE Completion Priority 4, picture-narrative candidate. QT-WC-01b, WC-01. Original vector illustration (libraryafterclosing-v1.svg). Five story footholds; indoor night setting. Awaiting Founder visual and educational review.",
  },
];

/** The exact `prompt` JSON stored in ali_question_bank.prompt (same shape as the live Writing rows). */
export function toStoredPromptJson(p: WritingExpansionPrompt): Record<string, unknown> {
  return {
    id: p.id,
    title: p.title,
    prompt: p.prompt,
    type: p.type,
    difficulty: "year6-exam",
    timeMinutes: 25,
    checklist: p.checklist,
    ...(p.stimulus ? { stimulus: p.stimulus } : {}),
  };
}
