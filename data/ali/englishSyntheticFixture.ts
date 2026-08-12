import type { BankQuestion, EnglishComprehensionPrompt } from "@/types/ali/questionBank";

/**
 * SYNTHETIC / DEV-ONLY FIXTURE — NOT REAL PRODUCTION CONTENT.
 *
 * Fabricated Reading Comprehension question metadata, mirroring
 * data/ali/vrSyntheticFixture.ts and data/ali/mathsSyntheticFixture.ts's
 * shape and purpose exactly (same "safe to unblock code work" path,
 * QUESTION_AUTHORING_STANDARD.md §1.5) — used to develop and test
 * lib/ali/learningUnit.ts and the adaptive English route before
 * ali_question_bank has the real 10 hand-tagged `data/lessons.ts` questions
 * (ENGLISH_COMPETENCY_FRAMEWORK.md — hand-tagging remains a separate human
 * task, "do not automate metadata generation").
 *
 * IDs are prefixed "synthetic-eng-" so they can never collide with real
 * `eng-0xx` question IDs.
 *
 * 5 Learning Units (passages), 2 questions each = 10 questions — deliberately
 * matching the real content's actual scale (3 passages / 10 questions) rather
 * than the larger 16-question VR/Maths fixtures, since a Learning Unit's
 * cooldown/selection behaviour is what this fixture needs to exercise, not
 * per-question variety within a unit.
 *
 * Only the two APPROVED competencies are used (Phase ALI 2.1 approval —
 * `english.retrieval` etc. stay on the roadmap until real content exists,
 * per explicit "do not invent competencies without evidence" instruction):
 * 3 inference-only units (easy/medium/challenge, so weak-inference students
 * have real variety to be steered toward) and 2 vocabulary-in-context-only
 * units (medium/hard, so that competency can be shown adapting
 * independently, per the phase's validation requirement).
 */

function unit(
  unitId: string,
  passageTitle: string,
  passageText: string,
  contentDifficulty: BankQuestion["contentDifficulty"],
  questions: Array<{
    qSuffix: string;
    questionText: string;
    marks: number;
    modelAnswer: string;
    competency: "english.inference" | "english.vocabulary-in-context";
    hint?: string;
  }>
): BankQuestion[] {
  const legacySkill: Record<string, "inference" | "vocabulary"> = {
    "english.inference": "inference",
    "english.vocabulary-in-context": "vocabulary",
  };

  return questions.map(({ qSuffix, questionText, marks, modelAnswer, competency, hint }) => {
    const id = `synthetic-eng-${unitId}-${qSuffix}`;
    const prompt: EnglishComprehensionPrompt = {
      id,
      question: questionText,
      skill: legacySkill[competency],
      marks,
      hint,
      modelAnswer,
      passageTitle,
      passageText,
    };
    return {
      id,
      subject: "english",
      skill: competency,
      pathway: ["gl"],
      contentDifficulty,
      learningUnitId: `synthetic-eng-${unitId}`, // Learning Unit = passage (Decision 36) — shared across every question in this unit
      questionType: "open-response",
      estimatedTimeSeconds: 90,
      prompt,
      explanation: modelAnswer,
      hint,
      confidenceWeight: 1.0,
      revisionPriority: 3,
      masteryThreshold: contentDifficulty === "easy" || contentDifficulty === "medium" ? 2 : 3,
      usageCount: 0,
      avgSuccessRate: null,
    };
  });
}

export const englishSyntheticFixture: BankQuestion[] = [
  // Unit 1 — inference, easy
  ...unit(
    "passage-001",
    "The New Neighbour",
    `Sam watched the removal van through the curtains for the third time that morning. Nobody had said much about the family moving into number 9, only that they'd come a long way, and that the youngest child was Sam's age.

By lunchtime, curiosity won. Sam crossed the road with a plate of biscuits, rehearsing a greeting that sounded friendly rather than nosy.`,
    "easy",
    [
      {
        qSuffix: "q1",
        questionText: "What does Sam's behaviour (watching three times, rehearsing a greeting) suggest about how Sam is feeling?",
        marks: 2,
        modelAnswer: "Sam seems nervous but eager to make a good impression: watching repeatedly shows curiosity and anticipation, while rehearsing the greeting shows Sam is anxious not to seem rude or intrusive.",
        competency: "english.inference",
        hint: "Think about why someone would rehearse what they're going to say.",
      },
      {
        qSuffix: "q2",
        questionText: "Why do you think curiosity 'won' by lunchtime? What does this tell us about Sam's personality?",
        marks: 2,
        modelAnswer: "The word 'won' suggests an internal conflict: part of Sam wanted to wait or hesitate, but curiosity was stronger. This suggests Sam is naturally friendly and sociable, even if a little shy at first.",
        competency: "english.inference",
      },
    ]
  ),

  // Unit 2 — inference, medium
  ...unit(
    "passage-002",
    "The Cracked Vase",
    `Amira held the pieces in her palm, unsure whether to hide them or confess. The vase had belonged to her grandmother, one of the few things that had survived the move from the old house.

She could glue it. Nobody would notice, probably, if she was careful. But the thought of her grandmother running a finger along the seam, feeling the break beneath the paint, made the gluing feel worse than the truth.`,
    "medium",
    [
      {
        qSuffix: "q1",
        questionText: "Why does Amira decide that gluing the vase would feel 'worse than the truth'? What does this reveal about her values?",
        marks: 3,
        modelAnswer: "Amira realises that hiding the damage would be a form of dishonesty that her grandmother might eventually discover, which feels more painful than admitting the mistake now. This reveals that Amira values honesty and her relationship with her grandmother more than avoiding an uncomfortable conversation.",
        competency: "english.inference",
        hint: "Compare what gluing it would achieve versus what it would risk.",
      },
      {
        qSuffix: "q2",
        questionText: "What does the detail that the vase 'survived the move from the old house' add to the passage?",
        marks: 2,
        modelAnswer: "It shows the vase is not just an ordinary object but a rare, sentimental survivor of the family's past. This raises the emotional stakes of the accident and helps the reader understand why Amira is so troubled by the crack.",
        competency: "english.inference",
      },
    ]
  ),

  // Unit 3 — inference, challenge
  ...unit(
    "passage-003",
    "The Silent Debate",
    `The committee had argued for an hour, and still no one would say what everyone privately believed: the festival could not go ahead. It was Priya, finally, who broke the pattern, not with an argument, but with a single, quiet question that made the room go still.

"What are we actually afraid of admitting?"

Nobody answered immediately. But by the time the meeting ended, the decision had somehow made itself.`,
    "challenge",
    [
      {
        qSuffix: "q1",
        questionText: "Why does the writer say the decision 'somehow made itself' rather than describing the committee actually deciding? What effect does this create?",
        marks: 3,
        modelAnswer: "The phrase suggests the real decision was an unspoken, collective realisation rather than a formal vote. Priya's question dissolved the group's denial, and once the truth was acknowledged aloud, the outcome became obvious without needing further debate. This creates a sense of quiet, powerful honesty being more effective than an hour of argument.",
        competency: "english.inference",
        hint: "Think about what changed the moment Priya spoke, compared to the hour before.",
      },
      {
        qSuffix: "q2",
        questionText: "What can we infer about Priya's role within the committee, based on how the room reacts to her question?",
        marks: 3,
        modelAnswer: "The room going 'still' and the meeting resolving shortly afterwards suggest Priya is respected and perhaps unusually perceptive or direct compared to the rest of the group. Her willingness to name the uncomfortable truth carries real weight, even though she didn't argue or insist on anything.",
        competency: "english.inference",
      },
    ]
  ),

  // Unit 4 — vocabulary-in-context, medium
  ...unit(
    "passage-004",
    "The Reluctant Guide",
    `Marcus led the tourists through the ruins with visible reluctance, his commentary clipped and perfunctory compared to the enthusiastic guide he'd been the previous summer. Something had changed, though he offered no explanation for it.`,
    "medium",
    [
      {
        qSuffix: "q1",
        questionText: "What does the word 'perfunctory' suggest about how Marcus is now giving his tours?",
        marks: 2,
        modelAnswer: "'Perfunctory' suggests Marcus is going through the motions with minimal care or effort: his commentary is done out of duty rather than genuine interest, unlike his enthusiasm the previous summer.",
        competency: "english.vocabulary-in-context",
        hint: "Perfunctory describes an action done as a routine duty, without real interest.",
      },
      {
        qSuffix: "q2",
        questionText: "The passage says his commentary was 'clipped'. What does this word tell us about the way Marcus is speaking?",
        marks: 2,
        modelAnswer: "'Clipped' suggests Marcus's speech is short, abrupt and lacking warmth: he is saying the minimum necessary rather than engaging properly with the tourists.",
        competency: "english.vocabulary-in-context",
      },
    ]
  ),

  // Unit 5 — vocabulary-in-context, hard
  ...unit(
    "passage-005",
    "The Unspoken Apology",
    `Her mother's gesture was almost imperceptible (a slight softening around the eyes, nothing more), but it was enough. Years of practice had taught her to read the subtle language beneath her mother's usually implacable expression.`,
    "hard",
    [
      {
        qSuffix: "q1",
        questionText: "What does 'imperceptible' tell us about the mother's gesture, and why might this matter to the daughter?",
        marks: 3,
        modelAnswer: "'Imperceptible' means something almost impossible to notice: the gesture was so slight that most people wouldn't have seen it at all. This matters because it shows the daughter has learned, through long familiarity, to notice tiny signals that anyone else would miss, suggesting a close but perhaps emotionally guarded relationship.",
        competency: "english.vocabulary-in-context",
        hint: "'Imperceptible' is built from 'perceive' plus a negative prefix. Think about what that combination means.",
      },
      {
        qSuffix: "q2",
        questionText: "What does the word 'implacable' suggest about the mother's usual expression, and how does this make the softening more significant?",
        marks: 3,
        modelAnswer: "'Implacable' suggests an expression that is unyielding, unmoved and difficult to change, like a wall that doesn't respond to persuasion. Because this is the mother's usual state, even a slight softening stands out dramatically by contrast, which is why the daughter recognises it as meaningful despite how small it is.",
        competency: "english.vocabulary-in-context",
      },
    ]
  ),
];
