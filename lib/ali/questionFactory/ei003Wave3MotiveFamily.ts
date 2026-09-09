import type { Wave3Blueprint, Wave3Candidate } from "./ei003Wave3EnglishTypes";

/**
 * Educational Increment 003, Wave 3 -- wave1-fam-motive-inference.
 * Real, existing production content: 4 rows, all "why does character X
 * do/say Y" -- a single reasoning skeleton (motive from one action or
 * remark), `medium`/`hard` difficulty. Four new blueprints add genuine
 * variation, matching the Founder's own explicit progression (action/
 * dialogue -> evidence -> likely motive -> justification): motive from
 * a single direct action (the real production shape, formalised) ->
 * motive inferred specifically from what a character says or notably
 * does NOT say -> weighing two plausible motives against each other and
 * judging which the text actually supports -> tracking a motive that
 * shifts or deepens across the whole passage, not one static moment.
 * Every candidate avoids mind-reading with no textual evidence -- each
 * has an explicit, quotable evidence chain from passage to motive.
 *
 * Marks: 2, matching this family's own existing, live convention.
 */

export const WAVE3_MOTIVE_BLUEPRINTS: Wave3Blueprint[] = [
  {
    blueprintId: "ei003-w3-bp-motive-action",
    familyId: "wave1-fam-motive-inference",
    reasoningRoute: "motive_from_direct_action",
    demand: "Infer a character's motive from a single, clear action -- the real production shape, formalised as one blueprint among several.",
    stage: "FOUNDATION",
  },
  {
    blueprintId: "ei003-w3-bp-motive-dialogue",
    familyId: "wave1-fam-motive-inference",
    reasoningRoute: "motive_from_dialogue",
    demand: "Infer a character's motive from what they choose to say -- or, just as tellingly, what they or others choose NOT to say -- rather than from physical action alone.",
    stage: "DEVELOPMENT",
  },
  {
    blueprintId: "ei003-w3-bp-motive-weigh",
    familyId: "wave1-fam-motive-inference",
    reasoningRoute: "motive_weighing_two_reasons",
    demand: "The passage suggests two plausible motives; the learner must judge, using specific evidence, which one the text actually supports -- not simply name a possible reason.",
    stage: "INDEPENDENT",
  },
  {
    blueprintId: "ei003-w3-bp-motive-shift",
    familyId: "wave1-fam-motive-inference",
    reasoningRoute: "motive_shift_across_passage",
    demand: "Track how a character's motive or feeling about their own action changes or deepens across the whole passage, requiring evidence from more than one point.",
    stage: "TRANSFER",
  },
];

export const WAVE3_MOTIVE_CANDIDATES: Wave3Candidate[] = [
  {
    candidateId: "ei003-w3-motive-action-01",
    blueprintId: "ei003-w3-bp-motive-action",
    familyId: "wave1-fam-motive-inference",
    passageId: "wave3-eng-bakersapprentice",
    difficulty: "medium",
    question: "Why does Mr Fenwick simply point to the flour sacks and say nothing at all, instead of giving Priya instructions?",
    acceptedAnswers: [
      "he believes in showing rather than explaining -- he wants her to learn by watching and doing, not by being told",
      "he expects her to learn through observation and experience rather than verbal instruction",
      "his way of teaching is to demonstrate the work itself, not to give a list of instructions",
    ],
    evidenceQuotes: ["he simply pointed to a mountain of flour sacks stacked against the wall and said nothing at all", "Mr Fenwick picked up a single sack, hoisted it onto his shoulder without any visible effort, and carried it through to the ovens as though it weighed nothing more than a folded newspaper"],
    explanationGuidance: "Mr Fenwick never explains what he wants -- he simply demonstrates it himself, carrying the first sack with visible ease. His action (showing, not telling) is the evidence for his likely motive: he expects Priya to learn the work by watching and doing, the same way he plainly learned it himself.",
  },
  {
    candidateId: "ei003-w3-motive-action-02",
    blueprintId: "ei003-w3-bp-motive-action",
    familyId: "wave1-fam-motive-inference",
    passageId: "wave3-eng-newtrainers",
    difficulty: "medium",
    question: "Why does Jayden take the longest possible route between lessons on the morning he first wears his new trainers?",
    acceptedAnswers: [
      "he wants as many people as possible to notice and see his new trainers",
      "he is deliberately showing them off by walking where more people will see them",
      "he hopes people will notice the trainers, so he chooses the route that puts him in front of the most people",
    ],
    evidenceQuotes: ["he spent the whole morning walking very deliberately past groups of people, taking the longest possible route between lessons"],
    explanationGuidance: "Choosing the longest route, and doing so \"very deliberately\", only makes sense if the goal is to be seen -- Jayden's action of walking past as many groups as possible is the direct evidence for his motive of wanting his new trainers noticed.",
  },
  {
    candidateId: "ei003-w3-motive-dialogue-01",
    blueprintId: "ei003-w3-bp-motive-dialogue",
    familyId: "wave1-fam-motive-inference",
    passageId: "wave1-eng-newgirl",
    difficulty: "hard",
    question: "Priya had rehearsed a sentence about Leicester, but what she actually says is \"Is the pasta usually this cold?\" Why might this unplanned question come out instead of her rehearsed line?",
    acceptedAnswers: [
      "in the nervous, real moment her prepared line doesn't come naturally, so something spontaneous slips out instead",
      "she is too flustered in the actual moment to use the sentence she had planned, and says the first ordinary thing that comes to mind",
      "the pressure of the real situation overrides her rehearsed plan, producing an unplanned, more natural remark",
    ],
    evidenceQuotes: ["Her carefully rehearsed sentence about Leicester and disinfectant surfaced in her mind, fully formed, ready to be used. She opened her mouth. What came out instead was, \"Is the pasta usually this cold?\""],
    explanationGuidance: "The passage explicitly shows the rehearsed sentence surfacing in her mind, \"fully formed, ready to be used\" -- and then something else coming out instead. The evidence is in what she actually SAYS versus what she had planned to say: the gap between the two suggests genuine nervousness overriding her preparation, not a deliberate choice.",
  },
  {
    candidateId: "ei003-w3-motive-dialogue-02",
    blueprintId: "ei003-w3-bp-motive-dialogue",
    familyId: "wave1-fam-motive-inference",
    passageId: "wave3-eng-stormharbour",
    difficulty: "hard",
    question: "Why might nobody at the harbour have said the word \"storm\" out loud yet, even though everyone is clearly hurrying?",
    acceptedAnswers: [
      "saying it out loud would make the danger feel official and real, so people avoid naming it even while acting on their fear",
      "not saying the word lets them keep moving quickly without openly admitting how worried they are",
      "naming it would confirm everyone's fear, so they behave urgently without actually saying what they are afraid of",
    ],
    evidenceQuotes: ["Nobody had said the word \"storm\" out loud yet, but everybody on the harbour wall seemed to be moving a little faster than usual, and nobody was smiling"],
    explanationGuidance: "What is NOT said is the key evidence here: despite everyone visibly hurrying, nobody actually names the storm aloud. This gap between action (hurrying) and speech (staying silent about why) suggests people are avoiding making the danger feel official or real by naming it directly.",
  },
  {
    candidateId: "ei003-w3-motive-weigh-01",
    blueprintId: "ei003-w3-bp-motive-weigh",
    familyId: "wave1-fam-motive-inference",
    passageId: "wave3-eng-newtrainers",
    difficulty: "hard",
    question: "Jayden ends up hiding his new trainers at the back of his locker. Is this mainly because Connor said something unkind about them, or because of how Jayden interpreted Connor's silence? Use evidence to decide.",
    acceptedAnswers: [
      "it is because of how jayden interpreted connor's silence -- connor never actually says anything unkind at all, he just glances and says nothing",
      "connor never criticises the trainers in words; it is jayden's own reading of that silence as disappointing that leads him to hide them",
      "the cause is jayden's interpretation, not any unkind comment, since connor's actual response is just a brief, wordless glance",
    ],
    evidenceQuotes: ["Connor glanced down at Jayden's feet for exactly one second, then carried on eating his sandwich without a word", "Jayden told himself it didn't matter what Connor thought"],
    explanationGuidance: "The passage never gives Connor a single unkind word about the trainers -- his entire reaction is a one-second glance and silence. The stronger-supported motive is therefore Jayden's own interpretation of that silence, not any actual criticism, since there is no criticism in the text to point to at all.",
  },
  {
    candidateId: "ei003-w3-motive-weigh-02",
    blueprintId: "ei003-w3-bp-motive-weigh",
    familyId: "wave1-fam-motive-inference",
    passageId: "wave3-eng-bakersapprentice",
    difficulty: "hard",
    question: "Does Mr Fenwick stay silent because he is deliberately testing Priya, or simply because that is how he naturally works? Use evidence to decide which is better supported.",
    acceptedAnswers: [
      "it is better supported that this is simply how he naturally works -- he carries on with his own task, whistling to himself, rather than watching or judging her",
      "the evidence favours it being his normal manner, since he seems absorbed in his own work rather than observing her as a test would require",
      "he is not shown watching or evaluating her at all, which suggests habit rather than a deliberate test",
    ],
    evidenceQuotes: ["Priya waited, unsure whether this was a test or simply how he worked", "Mr Fenwick was already three sacks ahead of her, whistling quietly to himself"],
    explanationGuidance: "The passage explicitly raises both possibilities through Priya's own uncertainty. The stronger evidence points to habit rather than a deliberate test: Mr Fenwick is shown whistling to himself, absorbed in his own steady work, rather than watching or evaluating Priya's progress -- behaviour that fits simply working his normal way, not setting a test.",
  },
  {
    candidateId: "ei003-w3-motive-shift-01",
    blueprintId: "ei003-w3-bp-motive-shift",
    familyId: "wave1-fam-motive-inference",
    passageId: "wave1-eng-atticdoor",
    difficulty: "challenge",
    question: "At the start, Marcus simply wants to see what is in the trunk. By the very end, does the passage suggest his feeling about opening it has stayed exactly the same, or has something more complicated crept in? Use evidence from more than one point.",
    acceptedAnswers: [
      "something more complicated has crept in -- he still wants to know, but he also starts to savour the anticipation itself, delaying the moment on purpose",
      "his simple curiosity develops into something that also values the suspense of not yet knowing, shown by him pausing deliberately before opening it",
      "it changes from wanting an answer quickly to wanting to prolong the not-knowing a little longer",
    ],
    evidenceQuotes: ["He had wanted to for exactly eleven days", "He knelt in front of it for a long moment before he lifted the lid, savouring, in a way he couldn't quite explain, the last few seconds of not yet knowing"],
    explanationGuidance: "Early in the passage, Marcus's motive is simple: eleven days of wanting to know what's inside. By the final lines, though, his motive has become more complicated -- he deliberately pauses before lifting the lid, savouring the last moments of uncertainty rather than rushing to satisfy his curiosity. Tracing evidence from both the start and the very end is needed to see this shift.",
  },
  {
    candidateId: "ei003-w3-motive-shift-02",
    blueprintId: "ei003-w3-bp-motive-shift",
    familyId: "wave1-fam-motive-inference",
    passageId: "wave1-eng-raceday",
    difficulty: "challenge",
    question: "Ade's laminated card and repeated checking seem, at first, like simple careful preparation. Does the passage later reveal a deeper motive behind this behaviour? Use evidence from more than one point.",
    acceptedAnswers: [
      "yes -- later the passage reveals the checking is really about managing anxiety, not just practical readiness, shown by the tightening in his chest",
      "what looks like ordinary preparation is later shown to be linked to real nervousness, not just thoroughness",
      "the deeper motive, revealed later, is anxiety -- the card is a way of coping with nerves, not simply getting ready",
    ],
    evidenceQuotes: ["He had a laminated card in his kit bag listing his split times for the last six meets, and he had read it twice already that morning, as if the numbers might have changed overnight", "the familiar tightening in his chest, the one that had nothing to do with his lungs and everything to do with the six laminated split times folded in his pocket"],
    explanationGuidance: "Early in the passage, Ade's laminated card and repeated checking could simply look like diligent preparation. Later, though, the passage explicitly links the same card to \"the familiar tightening in his chest\" -- revealing that the checking is really a way of managing anxiety, not just practical readiness. Both the earlier and later evidence are needed to see the fuller motive.",
  },
];
