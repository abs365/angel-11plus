import type { WritingPrompt } from "@/types";

export const writingPrompts: WritingPrompt[] = [
  {
    id: "wrt-001",
    title: "The Empty House",
    prompt: `Write a story that begins with the sentence: "The door to number 14 had been locked for as long as anyone could remember — until the morning it wasn't."

Your story must create a strong sense of atmosphere and include a moment of discovery that changes everything.`,
    type: "narrative",
    difficulty: "year5-advanced",
    timeMinutes: 25,
    checklist: [
      "Start with the given sentence",
      "Create atmosphere through carefully chosen adjectives and verbs",
      "Use at least one piece of dialogue that reveals character",
      "Build tension — don't rush to the resolution",
      "Use varied sentence lengths for effect (short = tension, long = description)",
      "End with a sentence that stays with the reader",
      "Check: commas, speech marks, capital letters, full stops",
      "Read back — does every sentence add something?"
    ]
  },
  {
    id: "wrt-002",
    title: "The Last Explorer",
    prompt: `Describe a landscape that no human has ever seen before. You have just discovered it after a long journey.

Focus entirely on description — use all five senses. Make the reader feel they are standing beside you.`,
    type: "descriptive",
    difficulty: "year5-core",
    timeMinutes: 20,
    checklist: [
      "Use at least three different senses (sight, sound, smell, touch, taste)",
      "Vary your openers — don't start every sentence with 'I'",
      "Use at least one simile and one metaphor",
      "Use precise, specific nouns rather than vague ones (e.g. 'crimson ferns', not 'red plants')",
      "Build your description — move from wide landscape to small detail",
      "Create a mood: mysterious? magnificent? threatening?",
      "Avoid overused adjectives: beautiful, amazing, nice, big",
      "Final sentence: leave the reader wanting more"
    ]
  },
  {
    id: "wrt-003",
    title: "Should Schools Ban Smartphones?",
    prompt: `Write a persuasive speech to be delivered to your school's headteacher, arguing either FOR or AGAINST a total ban on smartphones in school.

Your speech must be confident, well-reasoned, and persuasive. Use at least three strong arguments.`,
    type: "persuasive",
    difficulty: "year5-advanced",
    timeMinutes: 25,
    checklist: [
      "Open with a strong, attention-grabbing statement or rhetorical question",
      "State your position clearly in the first paragraph",
      "Use three separate, distinct arguments (one per paragraph)",
      "Support each argument with evidence, example, or logic",
      "Use rhetorical techniques: rule of three, rhetorical question, repetition, direct address",
      "Acknowledge the opposing view and refute it (this shows confidence)",
      "Conclude with a powerful, memorable final sentence",
      "Formal register throughout — no slang, no contractions",
      "Check paragraphing and punctuation carefully"
    ]
  },
  {
    id: "wrt-004",
    title: "The Storm",
    prompt: `Write the opening of a story set during a violent storm at sea. You are a passenger on a ship.

You have 15 minutes. Focus on atmosphere and tension — not on what happens next, but on the experience of being there.`,
    type: "narrative",
    difficulty: "year5-core",
    timeMinutes: 15,
    checklist: [
      "Open in the middle of the action — don't begin with backstory",
      "Use the senses: sound is particularly important in a storm",
      "Vary sentence length — short sentences for panic, longer ones for the storm's power",
      "Use powerful verbs (the waves 'crashed', 'smashed', 'surged', 'devoured')",
      "Show don't tell — don't say 'I was scared', show the fear",
      "At least one moment of human connection (another character)",
      "End at a moment of tension, not resolution",
      "Proofread carefully"
    ]
  }
];
