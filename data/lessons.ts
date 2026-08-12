import type { Lesson } from "@/types";

export const englishLessons: Lesson[] = [
  {
    id: "eng-001",
    title: "The Lighthouse Mystery",
    subject: "english",
    difficulty: "advanced-year4",
    estimatedMinutes: 20,
    passage: `The wind whipped across the harbour as Mira pressed herself against the cold stone wall of the lighthouse. Three weeks had passed since the keeper had vanished, and still no explanation had emerged. The light continued to sweep the dark water in its steady, mechanical arc, indifferent to the mystery it illuminated.

She had found the notebook wedged behind a loose brick on the second landing, its pages dense with cramped handwriting, each entry growing more frantic than the last. The final entry simply read: "It knows I'm here."

Above her, the great lens hummed and revolved. Somewhere below, the sea answered with its patient, ancient rhythm. Mira turned the notebook over in her hands. Whatever had happened here, the lighthouse held its secrets close.`,
    questions: [
      {
        id: "eng-001-q1",
        question: "What atmosphere does the writer create in the opening paragraph? Use evidence from the text to support your answer.",
        skill: "atmosphere",
        marks: 3,
        hint: "Think about the weather, the setting, and the word choices.",
        modelAnswer: "The writer creates an atmosphere of tension and unease. The phrase 'wind whipped' suggests a harsh, threatening environment, while 'the keeper had vanished' introduces mystery and danger. The lighthouse light is described as 'indifferent', suggesting that nature and machinery carry on despite the human drama, which makes the situation feel more isolated and chilling."
      },
      {
        id: "eng-001-q2",
        question: "What does the word 'frantic' tell us about the lighthouse keeper's state of mind as he wrote his journal?",
        skill: "vocabulary",
        marks: 2,
        hint: "What does frantic mean? What does it suggest about feelings?",
        modelAnswer: "'Frantic' suggests the keeper was increasingly panicked, desperate and out of control. The word implies that his fear was growing over time, moving beyond calm worry into something far more urgent and uncontrolled."
      },
      {
        id: "eng-001-q3",
        question: "\"The sea answered with its patient, ancient rhythm.\" What effect does this image create? What technique has the writer used?",
        skill: "inference",
        marks: 3,
        hint: "Look at the personification: the sea 'answering'. What contrast does this create with the human drama?",
        modelAnswer: "The writer uses personification by giving the sea a human quality: the ability to 'answer', as if it is in conversation with the lighthouse. The words 'patient' and 'ancient' suggest that the sea has witnessed events like this before and is unmoved by them. This creates a sense of insignificance: the human mystery is small against the enormous, indifferent power of nature."
      },
      {
        id: "eng-001-q4",
        question: "Why do you think the writer chose to make the final journal entry so short? What effect does this create?",
        skill: "inference",
        marks: 3,
        hint: "Compare the final entry to what came before it. What does brevity suggest?",
        modelAnswer: "The writer uses contrast: the earlier entries are described as 'dense with cramped handwriting', but the final entry is only six words. This abruptness creates shock and dread: the keeper either had no time to write more, or was interrupted. The short sentence 'It knows I'm here' is more frightening because it is so direct and unexplained. The reader's imagination fills in what 'it' might be."
      }
    ]
  },
  {
    id: "eng-002",
    title: "The Boy Who Collected Silence",
    subject: "english",
    difficulty: "year5-core",
    estimatedMinutes: 18,
    passage: `Everyone in Ashford knew that Leo collected things. Bottle caps, pressed leaves, stamps from countries he'd never visited. But what nobody knew, because he had never told anyone, was that his most prized collection could not be kept in boxes or catalogued on shelves.

Leo collected silences.

Not the absence of sound, exactly. There was the silence after a question nobody wanted to answer. The silence in the kitchen after his parents argued. The silence of a library on the first morning of the summer holidays, when it smelled of old paper and possibility. He kept these the way other people kept photographs: carefully, in order, for safekeeping.

"You're strange," his classmate Priya had once told him, though she meant it almost kindly.

"Everything worth understanding is strange," Leo replied, which she thought was probably true.`,
    questions: [
      {
        id: "eng-002-q1",
        question: "What impression do you get of Leo's character from this passage? Use at least two pieces of evidence.",
        skill: "character",
        marks: 4,
        hint: "Look at what he collects, what he says, and how the narrator describes him.",
        modelAnswer: "Leo comes across as thoughtful, observant and unusual. The fact that he collects 'silences' rather than physical objects shows he is sensitive to emotions and atmosphere: he notices things others overlook. His response to Priya, 'Everything worth understanding is strange', shows he is confident and philosophical for his age, suggesting intelligence and self-assurance despite being different."
      },
      {
        id: "eng-002-q2",
        question: "Look at the three types of silence Leo collects. What do these tell us about his home life?",
        skill: "inference",
        marks: 3,
        hint: "Focus especially on 'the silence in the kitchen after his parents argued'.",
        modelAnswer: "The 'silence after his parents argued' suggests Leo's home life is not entirely happy: there is tension between his parents, and Leo has noticed and been affected by it. The fact that he 'collects' this silence and preserves it suggests he is trying to process difficult emotions. The contrast with the joyful library silence makes this feel more significant: not all silences are peaceful for Leo."
      },
      {
        id: "eng-002-q3",
        question: "\"He kept these the way other people kept photographs: carefully, in order, for safekeeping.\" What does this simile tell us about Leo?",
        skill: "evidence",
        marks: 2,
        modelAnswer: "The simile comparing his silences to photographs suggests Leo values his emotional memories as much as others value physical mementos. Photographs are kept to preserve moments, and by comparing his silences to them, the writer shows that Leo's emotional experiences are real and precious to him, even if invisible to others."
      }
    ]
  },
  {
    id: "eng-003",
    title: "Letters from the Trenches",
    subject: "english",
    difficulty: "year5-advanced",
    estimatedMinutes: 25,
    passage: `My dear mother,

I am writing this in what passes for a quiet hour, though I use the word 'quiet' loosely. The guns are never entirely still, and one learns, in time, to hear them as a kind of weather, threatening but distant, like a storm that may or may not arrive.

We have been here three weeks now and I confess I no longer recognise the young man who left Coventry in September. I do not say this to worry you. I have found here a kind of resolve I did not know I possessed. The men beside me are extraordinary: ordinary men made extraordinary by circumstance.

Tell Father I am well. Tell him also that I have been thinking much about the workshop, and that when this business is finished, I intend to return to it with a greater appreciation for the smell of sawdust and the sound of wood being worked than I ever had before.

The stars here are remarkable, mother. I suspect they are the same stars you see above Coventry, but they look different from here, older and further away. I take comfort in knowing we share them.

Your loving son,
Thomas`,
    questions: [
      {
        id: "eng-003-q1",
        question: "What does Thomas mean when he says he 'no longer recognises the young man who left Coventry in September'? What has changed?",
        skill: "inference",
        marks: 4,
        hint: "Look at the whole letter: what does he say about himself, the men, and his plans? What does this reveal?",
        modelAnswer: "Thomas means that the experience of war has transformed him: he has grown up quickly and changed fundamentally. He describes discovering 'a resolve I did not know I possessed', suggesting he has found inner strength he was unaware of before. He looks forward to ordinary things, sawdust and woodwork, with 'greater appreciation', showing he now values what he previously took for granted. War has made him more mature, reflective and grateful."
      },
      {
        id: "eng-003-q2",
        question: "Why does Thomas compare the sound of the guns to 'weather, threatening but distant, like a storm that may or may not arrive'? What does this tell us about life in the trenches?",
        skill: "inference",
        marks: 3,
        modelAnswer: "Thomas uses this simile to show that he has become accustomed to danger: it has become as normal and unavoidable as weather. The comparison to a storm 'that may or may not arrive' suggests constant uncertainty and threat, never entirely safe, never entirely resolved. It tells us that soldiers had to live with fear as an everyday companion, and that they coped by normalising the abnormal."
      },
      {
        id: "eng-003-q3",
        question: "How does Thomas try to reassure his mother throughout the letter? Find three specific examples.",
        skill: "evidence",
        marks: 3,
        modelAnswer: "1. He says 'I do not say this to worry you', directly acknowledging her concern and trying to pre-empt it. 2. He tells her to 'tell Father I am well', giving a clear, simple reassurance. 3. He ends with the image of shared stars, 'I take comfort in knowing we share them', creating a sense of connection across the distance to ease loneliness on both sides."
      }
    ]
  }
];
