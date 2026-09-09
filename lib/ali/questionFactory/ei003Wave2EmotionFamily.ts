import type { Wave2Blueprint, Wave2Candidate } from "./ei003Wave2EnglishTypes";

/**
 * Educational Increment 003, Wave 2 -- wave3-fam-rc08-emotion.
 *
 * §B taxonomy finding, established this wave by direct comparison of
 * real content (not asserted): `wave1-fam-emotion-cause` (11 rows) is
 * uniformly "How does [character] feel [at a named moment], and why?" --
 * the emotion is directly named or immediately locatable at one clear
 * beat, and the real, live accepted-answer sets are single emotion
 * words (e.g. "content"/"proud"/"nervous"), never requiring inference
 * from indirect evidence. `wave3-fam-rc08-emotion`'s existing 2 rows are
 * BOTH genuinely inferential -- the emotion is never stated anywhere in
 * the passage and must be reasoned from behaviour/context alone
 * ("based on the way she moves and behaves", "How might Sam himself be
 * feeling..." -- hedged, interpretive question language, not "How does
 * X feel"). This is a real, material distinction (direct identification
 * vs. genuine inference from indirect evidence), not a duplicate --
 * confirming the "weakest-confidence merge... flagged for confirmation"
 * note already present in lib/ali/familyTaxonomy.ts's own consolidation
 * table. Every new blueprint below is designed to PRESERVE that
 * distinction: no candidate here ever states the target emotion word
 * anywhere in its own passage.
 */

export const WAVE2_EMOTION_BLUEPRINTS: Wave2Blueprint[] = [
  {
    blueprintId: "ei003-w2-bp-emotion-from-action",
    familyId: "wave3-fam-rc08-emotion",
    reasoningRoute: "inferred_from_action",
    demand: "Infer a character's feeling purely from physical action/behaviour -- no dialogue, no stated emotion word anywhere in the passage.",
    stage: "DEVELOPMENT",
  },
  {
    blueprintId: "ei003-w2-bp-emotion-from-dialogue",
    familyId: "wave3-fam-rc08-emotion",
    reasoningRoute: "inferred_from_dialogue",
    demand: "Infer a character's feeling from WHAT they choose to say and how briefly/fully they say it, not from a stated feeling word in narration.",
    stage: "INDEPENDENT",
  },
  {
    blueprintId: "ei003-w2-bp-emotion-arc",
    familyId: "wave3-fam-rc08-emotion",
    reasoningRoute: "emotion_arc",
    demand: "Trace how a character's feeling genuinely changes across the passage -- requires synthesising evidence from more than one point, not one static moment.",
    stage: "TRANSFER",
  },
  {
    blueprintId: "ei003-w2-bp-emotion-conflicting",
    familyId: "wave3-fam-rc08-emotion",
    reasoningRoute: "conflicting_evidence",
    demand: "A character's outward reaction (e.g. laughing something off) is contradicted by their own subsequent behaviour -- the learner must weigh two pieces of evidence against each other and trust the more reliable one, the hardest inferential demand in this family.",
    stage: "FAR_TRANSFER",
  },
];

export const WAVE2_EMOTION_CANDIDATES: Wave2Candidate[] = [
  {
    candidateId: "ei003-w2-emotion-action-01",
    blueprintId: "ei003-w2-bp-emotion-from-action",
    familyId: "wave3-fam-rc08-emotion",
    passageId: "ei003-w2-eng-the-relay-baton",
    difficulty: "medium",
    question: "How is Nadia feeling as she waits at the changeover line, based on her body and reactions, not on anything she says?",
    acceptedAnswers: ["nervous", "anxious", "tense", "on edge", "uneasy"],
    evidenceQuotes: ["Nadia's own legs felt suddenly unfamiliar, as though she'd forgotten how they worked", "Nadia flinched before catching herself"],
    explanationGuidance: "No word for how Nadia feels appears anywhere in this part of the passage. The evidence is entirely physical: her legs feel unfamiliar, and she flinches at a shout that isn't even meant for her yet -- both signs of nervous tension, inferred from behaviour alone.",
  },
  {
    candidateId: "ei003-w2-emotion-action-02",
    blueprintId: "ei003-w2-bp-emotion-from-action",
    familyId: "wave3-fam-rc08-emotion",
    passageId: "ei003-w2-eng-the-last-delivery",
    difficulty: "hard",
    question: "How does Grandad Kofi seem to feel at the very last house, based on what he does rather than anything he says?",
    acceptedAnswers: ["moved/emotional", "affected, reflective", "sad or sentimental about it ending", "reluctant to leave, moved by the moment"],
    evidenceQuotes: ["he didn't start the engine straight away. He sat with both hands resting on the wheel, looking out at the empty street ahead"],
    explanationGuidance: "No emotion word is used to describe Grandad Kofi here. His pause, his stillness, and the fact that he delays starting the engine after thirty-one years of the same routine are all behavioural evidence that he is more affected by this moment than his usual brisk manner has shown all round.",
  },
  {
    candidateId: "ei003-w2-emotion-dialogue-01",
    blueprintId: "ei003-w2-bp-emotion-from-dialogue",
    familyId: "wave3-fam-rc08-emotion",
    passageId: "ei003-w2-eng-the-last-delivery",
    difficulty: "hard",
    question: "What does Mr Whitfield's comment \"You brought milk to my mother before you brought it to me\" suggest about how he feels about Grandad Kofi's round ending?",
    acceptedAnswers: [
      "he feels the ending marks the loss of something that spanned generations, a sense of sentimental attachment",
      "he is reflecting on how long-standing and meaningful the connection has been, showing he feels its significance",
      "it shows he values the history and continuity of the round, and feels its ending as significant",
    ],
    evidenceQuotes: ["You brought milk to my mother before you brought it to me"],
    explanationGuidance: "Mr Whitfield never says he feels sad or moved. But his choice to mention that the round connects two generations of his own family reveals that he sees this as the end of something that mattered across a long span of time -- the feeling is carried in what he chooses to say, not in a stated emotion.",
  },
  {
    candidateId: "ei003-w2-emotion-dialogue-02",
    blueprintId: "ei003-w2-bp-emotion-from-dialogue",
    familyId: "wave3-fam-rc08-emotion",
    passageId: "ei003-w2-eng-the-relay-baton",
    difficulty: "hard",
    question: "Marcus only says \"Nearly,\" in reply to Nadia. What does the briefness of his answer suggest about how he is feeling?",
    acceptedAnswers: [
      "he doesn't want to talk about it, suggesting he feels disappointed or upset",
      "the short answer suggests he is holding back stronger feelings, likely frustration or disappointment",
      "it suggests he feels bad about the result and doesn't want to say more",
    ],
    evidenceQuotes: ["\"Nearly,\" he said eventually, and kept his eyes on the gravel"],
    explanationGuidance: "Marcus's answer is a single word, offered only \"eventually\" and paired with him looking away rather than at Nadia -- the briefness and reluctance of the reply suggest he is feeling something he doesn't want to discuss, most likely disappointment, rather than genuine indifference.",
  },
  {
    candidateId: "ei003-w2-emotion-arc-01",
    blueprintId: "ei003-w2-bp-emotion-arc",
    familyId: "wave3-fam-rc08-emotion",
    passageId: "ei003-w2-eng-the-clock-that-stopped",
    difficulty: "challenge",
    question: "How does the narrator's feeling about the clock project change over the course of the whole passage, from the very start to the moment it finally started running?",
    acceptedAnswers: [
      "starts confident it will be quick, becomes discouraged and feels it has failed by august, then feels sudden excitement when it finally starts",
      "he moves from expecting an easy afternoon, to a sense of failure months later, to excited surprise when he hears it running",
      "early confidence gives way to discouragement, then to sudden excitement at the end",
    ],
    evidenceQuotes: ["I expected this to take an afternoon. It took most of that summer.", "I remember feeling, by then, that we'd failed", "I heard it from the hallway — a small, dry ticking, unfamiliar because none of us had ever heard it — and ran back in"],
    explanationGuidance: "Tracing evidence across the whole passage: the narrator begins confident the repair will be quick, grows discouraged by August, believing the project has failed, and then reacts with sudden excitement at the very end -- rushing back into the room the moment the clock is finally heard running.",
  },
  {
    candidateId: "ei003-w2-emotion-arc-02",
    blueprintId: "ei003-w2-bp-emotion-arc",
    familyId: "wave3-fam-rc08-emotion",
    passageId: "ei003-w2-eng-crossing-the-fen",
    difficulty: "challenge",
    question: "How does the narrator's feeling during the crossing change from the start of the walk to reaching solid ground at the end?",
    acceptedAnswers: [
      "starts wary because of the guide's warning, becomes more alert and cautious after priti sinks into the mud, and ends relieved to reach solid ground just before the tide returns",
      "he moves from uneasy anticipation, to heightened caution once he sees the danger for himself, to relief at finishing safely",
      "wary at the outset, more careful after the near-accident, and relieved by the end",
    ],
    evidenceQuotes: ["warned us before we set out that the fen changed with every high tide, and that a path safe at dawn could be treacherous by noon", "I understood what he meant within twenty minutes, when Priti, walking just ahead of me, put her weight on a patch of ground that appeared entirely solid and sank almost to her knee before anyone could react", "We reached solid ground on the far side just as the tide, exactly as promised, began sliding back in behind us"],
    explanationGuidance: "The narrator starts the crossing already wary, having been warned the ground can turn treacherous. That wariness sharpens into real alertness once Priti sinks into the mud, proving the warning was genuine. By the end, reaching solid ground just as the tide returns behind them signals relief at a safe, narrowly-timed finish -- a clear emotional arc across the whole passage.",
  },
  {
    candidateId: "ei003-w2-emotion-conflict-01",
    blueprintId: "ei003-w2-bp-emotion-conflicting",
    familyId: "wave3-fam-rc08-emotion",
    passageId: "ei003-w2-eng-crossing-the-fen",
    difficulty: "challenge",
    question: "Priti \"laughed it off\" after sinking into the mud. Does this laughter show her true feeling about what happened? Use evidence to explain your answer.",
    acceptedAnswers: [
      "no -- her later careful, testing steps show she was actually more shaken/cautious than the laugh suggested",
      "not fully -- the laugh suggests she wasn't bothered, but her more careful behaviour afterwards suggests she was genuinely unsettled",
      "the laugh downplays it, but her subsequent caution reveals she took it more seriously than she let on",
    ],
    evidenceQuotes: ["She laughed it off, though I noticed she moved more carefully afterwards, testing each step before committing her full weight"],
    explanationGuidance: "The laugh alone would suggest Priti wasn't bothered by sinking into the mud. But the passage immediately gives conflicting evidence: she moved more carefully afterwards, testing every step -- behaviour that only makes sense if the incident genuinely unsettled her. The later, sustained behaviour is stronger evidence than the single dismissive laugh.",
  },
  {
    candidateId: "ei003-w2-emotion-conflict-02",
    blueprintId: "ei003-w2-bp-emotion-conflicting",
    familyId: "wave3-fam-rc08-emotion",
    passageId: "ei003-w2-eng-the-clock-that-stopped",
    difficulty: "challenge",
    question: "The grandmother says \"There,\" as though she had expected the clock to start working all along. Does the passage show she really felt that certain? Use evidence to explain your answer.",
    acceptedAnswers: [
      "no -- the narrator says he was never sure she really felt that certain, showing her calm outward manner doesn't necessarily match how she truly felt",
      "her reaction sounds confident and unsurprised, but the narrator's own comment reveals real doubt about whether that confidence was genuine",
      "the outward calm suggests certainty, but the narrator directly says he could never be sure it was real",
    ],
    evidenceQuotes: ["\"There,\" she said, as though she'd expected this outcome the entire time, though I've never been sure she really did."],
    explanationGuidance: "The grandmother's single word and calm manner suggest she was confident the clock would work all along. But the narrator immediately undercuts that impression -- \"though I've never been sure she really did\" -- showing that her outward composure cannot be trusted as proof of what she genuinely felt underneath.",
  },
];
