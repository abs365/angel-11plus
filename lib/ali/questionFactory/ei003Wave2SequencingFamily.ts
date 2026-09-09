import type { Wave2Blueprint, Wave2Candidate } from "./ei003Wave2EnglishTypes";

/**
 * Educational Increment 003, Wave 2 -- wave3-fam-rc06-sequencing.
 * Real, existing production content: 1 row (read live before designing
 * these blueprints), asking the learner to order three explicitly-named
 * items in the order the narrator writes about them. Genuinely the
 * thinnest family in the whole bank -- not usable as a real practice
 * pool at n=1. Four new blueprints add real reasoning-dimension
 * variation: explicit vs. dispersed chronology, causal linkage, and
 * distinguishing a reflective narrative's telling-order from its real
 * event-order.
 */

export const WAVE2_SEQUENCING_BLUEPRINTS: Wave2Blueprint[] = [
  {
    blueprintId: "ei003-w2-bp-seq-explicit-chronology",
    familyId: "wave3-fam-rc06-sequencing",
    reasoningRoute: "explicit_chronology",
    demand: "Order events that are narrated in a single, linear pass -- the real production shape, formalised as one blueprint among several rather than the family's only shape.",
    stage: "FOUNDATION",
  },
  {
    blueprintId: "ei003-w2-bp-seq-dispersed-chronology",
    familyId: "wave3-fam-rc06-sequencing",
    reasoningRoute: "dispersed_chronology",
    demand: "Reconstruct order from events mentioned at scattered points in the text (ordinal position markers embedded across several paragraphs), not one tidy sequential list.",
    stage: "DEVELOPMENT",
  },
  {
    blueprintId: "ei003-w2-bp-seq-causal-ordering",
    familyId: "wave3-fam-rc06-sequencing",
    reasoningRoute: "causal_ordering",
    demand: "Identify what happened as a direct consequence of a named triggering event -- ordering by cause and effect, not merely by narrative position.",
    stage: "INDEPENDENT",
  },
  {
    blueprintId: "ei003-w2-bp-seq-narrative-vs-event-order",
    familyId: "wave3-fam-rc06-sequencing",
    reasoningRoute: "explicit_chronology",
    demand: "Reconstruct the real order of events within a reflective, memory-framed narrative (the narrator writing from later, looking back), where surface presentation and strict event order are not automatically identical.",
    stage: "TRANSFER",
  },
];

export const WAVE2_SEQUENCING_CANDIDATES: Wave2Candidate[] = [
  {
    candidateId: "ei003-w2-seq-explicit-01",
    blueprintId: "ei003-w2-bp-seq-explicit-chronology",
    familyId: "wave3-fam-rc06-sequencing",
    passageId: "ei003-w2-eng-the-relay-baton",
    difficulty: "easy",
    question: "Put these three events from \"The Relay Baton\" in the order they happen: (a) Nadia passes the baton to Marcus, (b) the handover between Priya and Nadia is clumsy, (c) Kestrel wins by less than a second.",
    acceptedAnswers: ["b, a, c", "b then a then c", "the clumsy handover, then passing to marcus, then kestrel winning"],
    evidenceQuotes: ["the handover was clumsy", "She passed the baton to Marcus", "Kestrel won by less than a second"],
    explanationGuidance: "All three events are narrated in this order, one after another, with no jump back in time -- the clumsy handover happens first, then Nadia's leg ends with her passing to Marcus, then the race result is announced last.",
  },
  {
    candidateId: "ei003-w2-seq-explicit-02",
    blueprintId: "ei003-w2-bp-seq-explicit-chronology",
    familyId: "wave3-fam-rc06-sequencing",
    passageId: "ei003-w2-eng-the-glass-frog",
    difficulty: "easy",
    question: "According to the passage, which happens first: the frog pulling its red blood cells into its liver, or the frog waking up and needing full-strength muscles?",
    acceptedAnswers: ["pulling its red blood cells into its liver happens first", "the blood is hidden in the liver first, then it wakes up", "hiding the blood cells comes before waking"],
    evidenceQuotes: ["it pulls roughly ninety percent of its red blood cells out of general circulation", "returns its blood to normal circulation the moment it wakes and needs full-strength muscles"],
    explanationGuidance: "The passage states the frog hides its blood cells while resting/sleeping, and only returns them to circulation later, at the moment it wakes -- so the hiding happens first, the waking/returning second.",
  },
  {
    candidateId: "ei003-w2-seq-dispersed-01",
    blueprintId: "ei003-w2-bp-seq-dispersed-chronology",
    familyId: "wave3-fam-rc06-sequencing",
    passageId: "ei003-w2-eng-the-last-delivery",
    difficulty: "medium",
    question: "At which house does Tobias first learn from someone other than his grandad that this is the very last round: the second house, the sixth house, or the ninth house?",
    acceptedAnswers: ["the sixth house", "sixth house", "house six", "6th"],
    evidenceQuotes: ["It was only at the sixth house", "\"Last one today, is it, Kofi?\" the man said."],
    explanationGuidance: "The passage marks each house's position explicitly (\"the first house\", \"the second house\", \"the sixth house\", \"the ninth house\") scattered across several paragraphs -- Mr Whitfield's conversation about it being the last round is specifically placed at the sixth house, not the second or ninth.",
  },
  {
    candidateId: "ei003-w2-seq-dispersed-02",
    blueprintId: "ei003-w2-bp-seq-dispersed-chronology",
    familyId: "wave3-fam-rc06-sequencing",
    passageId: "ei003-w2-eng-the-clock-that-stopped",
    difficulty: "medium",
    question: "Put these three moments from \"The Clock That Stopped\" in the order they happened: (a) a gear is discovered installed backwards, (b) the clock is still silent even in August, (c) a spring is dropped and disappears under the dresser.",
    acceptedAnswers: ["c, a, b", "c then a then b", "dropped spring, then backwards gear, then still silent in august"],
    evidenceQuotes: ["Twice I dropped a spring", "three weeks in, we discovered an entire gear installed backwards", "By August, the clock still didn't run"],
    explanationGuidance: "The passage gives time markers scattered through the account: the dropped spring is mentioned as an early setback, the backwards gear is explicitly \"three weeks in\", and the clock is confirmed still not working \"by August\" -- later than both.",
  },
  {
    candidateId: "ei003-w2-seq-causal-01",
    blueprintId: "ei003-w2-bp-seq-causal-ordering",
    familyId: "wave3-fam-rc06-sequencing",
    passageId: "ei003-w2-eng-the-relay-baton",
    difficulty: "hard",
    question: "What happened as a direct result of the clumsy handover between Priya and Nadia?",
    acceptedAnswers: ["nadia lost time/had to make up the lost half-second", "she lost time fumbling for a proper grip", "the baton clipped her fingers, costing her time before she could run properly", "she had a mark left on her knuckles"],
    evidenceQuotes: ["the baton clipped Nadia's fingers before she managed to close her hand around it", "the half-second she'd lost fumbling for a proper grip"],
    explanationGuidance: "The passage directly links the clumsy handover to a real consequence: Nadia loses a half-second fumbling for a proper grip on the baton, which is presented as a specific, quantified cost of that one earlier event.",
  },
  {
    candidateId: "ei003-w2-seq-causal-02",
    blueprintId: "ei003-w2-bp-seq-causal-ordering",
    familyId: "wave3-fam-rc06-sequencing",
    passageId: "ei003-w2-eng-crossing-the-fen",
    difficulty: "hard",
    question: "What happened as a direct result of Priti stepping onto ground that looked solid?",
    acceptedAnswers: ["she sank almost to her knee", "her leg sank into the mud", "she began moving more carefully afterwards, testing each step"],
    evidenceQuotes: ["Priti, walking just ahead of me, put her weight on a patch of ground that appeared entirely solid and sank almost to her knee", "she moved more carefully afterwards, testing each step before committing her full weight"],
    explanationGuidance: "The passage shows a clear cause-and-effect chain: stepping on ground that only LOOKED solid caused Priti to sink, which in turn caused her later, more cautious behaviour -- two separate, linked consequences of one triggering action.",
  },
  {
    candidateId: "ei003-w2-seq-narrative-order-01",
    blueprintId: "ei003-w2-bp-seq-narrative-vs-event-order",
    familyId: "wave3-fam-rc06-sequencing",
    passageId: "ei003-w2-eng-the-clock-that-stopped",
    difficulty: "challenge",
    question: "The narrator opens the passage saying \"I was eleven... I still remember exactly which one.\" Is the narrator telling this story as it happens, or looking back on it as an adult remembering childhood? Use evidence from the passage to support your answer.",
    acceptedAnswers: [
      "looking back as an adult remembering childhood -- phrases like 'i still remember' and 'i think about that clock now' show this is being told from much later",
      "the narrator is remembering it later, shown by 'i still remember' and 'i think about that clock now whenever'",
      "it is told in reflection from later in life, evidenced by 'i think about that clock now'",
    ],
    evidenceQuotes: ["I still remember exactly which one", "I think about that clock now whenever something in my own life refuses to work"],
    explanationGuidance: "The opening phrase 'I still remember' and the closing 'I think about that clock now' both signal that an older narrator is recalling a childhood summer, not narrating it as it happens -- the whole account is a reflective memory, which is why events can be summarised across a season rather than told minute-by-minute.",
  },
  {
    candidateId: "ei003-w2-seq-narrative-order-02",
    blueprintId: "ei003-w2-bp-seq-narrative-vs-event-order",
    familyId: "wave3-fam-rc06-sequencing",
    passageId: "ei003-w2-eng-the-clock-that-stopped",
    difficulty: "challenge",
    question: "Put these four moments in the order they really happened: (a) the clock starts running on a Tuesday, (b) the grandmother says nobody has ever actually opened the clock up to check, (c) the clock is still silent by August, (d) a gear is found installed backwards.",
    acceptedAnswers: ["b, d, c, a", "b then d then c then a"],
    evidenceQuotes: ["Nobody's ever actually opened it up to check", "three weeks in, we discovered an entire gear installed backwards", "By August, the clock still didn't run", "It started running on a Tuesday"],
    explanationGuidance: "Reading past the reflective framing to the real chronology: the grandmother's opening remark comes first (before any work begins), the backwards gear is found three weeks into the work, the clock is still silent by August (weeks later still), and it finally starts on a Tuesday near the very end of the account.",
  },
];
