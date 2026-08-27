# English Content Foundation — Increment 001 — Founder Review (Decision 228, remediated Decision 229)

Companion artifact to `ALI_DECISION_LOG.md` Decisions 228 and 229. Migrations
152/153/154 are **prepared, NOT applied**. Every row below carries
`eligibility_status = 'authentic_assessment_candidate'` — awaiting your own
independent review, not promoted to `practice_eligible` or `mock_eligible` by
this increment. Nothing here requires reading SQL to understand.

**Current CSSE boundary held throughout:** Applied Reasoning does not appear
anywhere below — it is correctly excluded from the current English paper
(Decision 58), and older papers are used only as historical evidence for
comprehension reasoning demands, never as a justification for reintroducing it.

---

## REMEDIATION SUMMARY (Decision 229)

Your review of the original (Decision 228) content identified real defects.
All corrections below are reflected in the passage text and question tables
further down this document — this section is a concise summary so you do not
need to compare versions yourself.

| # | Defect found | Correction made | Dependent questions affected | Factual evidence basis | Passage meaning changed? | Marks/QT/competency changed? |
|---|---|---|---|---|---|---|
| 1 | Understudy Q5's stored answer contract omitted a valid answer for "hoarse" (item (a), the worked example) | `modelAnswer` now explicitly restates item (a); `acceptedAnswers` now includes valid hoarse synonyms | None | N/A (internal consistency, not factual) | No | No — marks stay 4; (a) remains the unscored worked example, matching the already-certified migration 097 Q5 convention |
| 2 | Understudy Q1 conflated the note's own diagnosis (laryngitis) with the narrator's separate description ("a hoarse whisper") | `modelAnswer`/`acceptedAnswers` now answer precisely what the note states: laryngitis alone | None | N/A (internal consistency, not factual) | No | No |
| 3 | Bee passage claimed the waggle dance was "first decoded... in the 1960s" — factually inaccurate | Replaced with an original sentence naming Karl von Frisch and his verified 1946 publication | Q2 (below) | SOURCE-CONTAINS/FACTUAL-CONFIDENCE HIGH — see Factual Verification Control section | Yes, one sentence (final paragraph) | No |
| 4 | Bee Q2 asked for the (now-incorrect) decade | Retained as a corrected retrieval question, now asking for the verified 1946 publication year rather than being replaced with an unrelated fact | — | Same as #3 | N/A | No — same QT/competency/marks |
| 5 | Magnetic-navigation paragraph presented magnetic sensitivity as an established third system, equivalent in certainty to the sun-compass and landmark systems | Rewritten to state the real evidence (iron-rich particles, interference experiments) while accurately conveying that its role in everyday navigation is still being investigated | Q7 (below) | SOURCE-CONTAINS/FACTUAL-CONFIDENCE MEDIUM — see Factual Verification Control section | Yes, one paragraph | No |
| 6 | Bee Q7 ("list the three navigation systems") implied all three were equally established | Retained as a 3-item list question (the corrected passage still supports one), reworded to "things the passage describes bees using or sensing", with the model answer's magnetic item carrying the passage's own hedge | — | Same as #5 | N/A | No — same QT/competency/marks |

**Dependency audit:** every other question in both passages (Understudy Q2/3/4/6/7; Bee Q1/3/4/5/6/8) was re-checked against the corrected passage text and remains fully valid, unchanged. Full detail in `ALI_DECISION_LOG.md` Decision 229.

**Writing prompts:** unchanged — no defect was found in "Somewhere New", "A Mistake You Learned From", or "Should Children Have Limits on Screen Time?"; all three are approved as-is per your own instruction.

---

## PASSAGE 1 — "The Understudy"

**Genre:** Contemporary realistic fiction. **Word count:** 521. **Difficulty:** medium.

**Why this passage adds genuine diversity:** the existing certified passage
("The Boat in the Boathouse") is a sibling pair jointly restoring an
inherited object, resolved through a discovered family note. This passage is
deliberately shaped differently: a single protagonist, an internal/emotional
conflict (self-doubt before an unexpected performance), resolved through a
rival-turned-ally relationship — different character configuration, different
conflict type, different resolution mechanism.

> Maya had known for three weeks that she was the understudy for the
> Narrator in the school production of "The Lantern Keeper," and for three
> weeks she had been quietly certain she would never actually need to
> perform it. Being an understudy, as far as she understood it, mostly
> meant sitting in the wings with a script she barely needed to open,
> listening to somebody else collect the applause.
>
> Then, on the Tuesday before the final performance, Isla Bennett — who had
> the part, and who had wanted it far more visibly than Maya ever had —
> arrived at rehearsal with a voice reduced to a hoarse whisper and a note
> from her mother confirming laryngitis. Mr Ferris, the drama teacher,
> turned to Maya without any of the ceremony she had expected such a moment
> to carry. "You know it," he said simply. "You'll be ready by Thursday."
>
> Maya was not at all sure she agreed. She knew the words — she had
> certainly heard them often enough — but knowing something and standing in
> front of three hundred parents to perform it struck her as two entirely
> different skills.
>
> The person who surprised her most was Ruby Adeyemi, who had auditioned
> for the Narrator herself back in September and had made no secret, at the
> time, of how disappointed she was to lose the part to Isla. Maya had
> quietly assumed, these last three weeks, that Ruby resented her too,
> simply for existing as a second possibility.
>
> On Wednesday afternoon, though, Ruby found Maya alone in the empty hall,
> running the opening lines under her breath for perhaps the twentieth time
> that day. "You're rushing the second line," Ruby said, not unkindly. "The
> audience needs a second to picture the lighthouse before you tell them
> what happens to it."
>
> Maya blinked. "I thought you'd want me to mess it up."
>
> "I did, back in September," Ruby admitted, with a short, honest laugh.
> "But that was months ago, and this isn't about September anymore. It's
> Thursday I'm thinking about now." She sat down cross-legged on the stage
> and patted the floor beside her. "Run it again. Properly, this time. I'll
> tell you where you're rushing."
>
> They stayed for forty minutes. Ruby corrected her pacing, suggested where
> to pause, and twice made Maya repeat a line simply because, in Ruby's
> words, "you said it like you didn't believe it yet." By the time they
> finished, Maya's voice was hoarse in a different way than Isla's — worn
> out from genuine use rather than illness.
>
> On Thursday evening, waiting in the wings with the lantern prop cold and
> heavy in her hands, Maya did not feel fearless. Her hands were still
> shaking slightly when Mr Ferris gave her the nod. But she found, stepping
> into the light, that she did not need to feel fearless after all. She
> only needed to feel ready, and — thanks to a rival who had chosen, for
> one Wednesday afternoon, to stop being a rival — she genuinely was.
>
> Afterwards, Ruby was the first person to find her backstage. "Second line
> was perfect," she said. "Told you."

### Questions

| # | Type | Competency | Marks | Question | Expected answer |
|---|---|---|---|---|---|
| 1 | QT-RC-01 (literal retrieval) | RC-01 | 1 | Why was Isla unable to perform, per her mother's note? | Laryngitis. *(Remediated: the original answer conflated the note's own diagnosis with the narrator's separate "hoarse whisper" description — corrected to answer precisely what the note itself states.)* |
| 2 | QT-RC-01 | RC-01 | 1 | When did Ruby audition for the part? | Back in September. |
| 3 | QT-RC-02 (yes/no + justify) | RC-02 | 4 | Does Maya feel confident when first asked to step in? | No — "not at all sure she agreed"; "two entirely different skills". |
| 4 | QT-RC-03 (vocabulary-in-context) | RC-03 | 1 | What does "made no secret" mean? | She was open about it, didn't hide it. |
| 5 | QT-RC-04 (synonym list) | RC-03 | 4 | Synonyms for hoarse/ceremony/resented/admitted/genuinely | (a) hoarse: rough/croaky *(worked example, unscored)*; ceremony: formality; resented: felt bitter about; admitted: confessed; genuinely: truly. *(Remediated: the stored answer contract now explicitly covers "hoarse" too, not only the 4 scored items.)* |
| 6 | QT-RC-05 (quotation + explanation) | RC-02 | 2 | Quote showing Ruby's feelings changed since September | "that was months ago, and this isn't about September anymore." |
| 7 | QT-RC-10 (word-choice effect) | RC-02 | 2 | Why "still shaking slightly" rather than just "nervous"? | Shows nervousness physically rather than naming it; makes it feel real; sets up the contrast that follows. |

**Teaching evidence:** every question carries a real, specific
`addresses_misconception` note (e.g. Q3's: assuming Mr Ferris's own
confidence means Maya shares it, rather than reading her own stated doubt).

**Anti-memorisation rationale:** wholly original Angel content — no existing
CSSE passage, published work, or prior Angel passage was read, copied, or
lightly rewritten. Character names, plot, and setting are new to this
migration.

---

## PASSAGE 2 — "How Bees Find Their Way Home"

**Genre:** Informational / popular-science explanation. **Word count:** 570. **Difficulty:** medium.

**Why this passage adds genuine diversity:** the first informational,
non-narrative text in the certified estate — present tense, explicit
multi-part structure ("the first... the second... the third..."), genuinely
distinct `text_type` from both existing passages.

> A single honeybee might travel more than a mile from her hive in search
> of flowers, weaving between trees, gardens and open fields as she
> searches for nectar. When she finally finds a good source of food, she
> does not simply eat her fill and wander home by chance. Instead, she
> performs one of the most remarkable feats of natural navigation known to
> scientists: she flies directly back to the hive, often along an almost
> perfectly straight line, and then tells the rest of the colony exactly
> where to go.
>
> Bees rely on several different navigation methods at once, and
> scientists have only fully understood some of them in the last hundred
> years.
>
> The first is the sun. A bee can use the sun's position in the sky as a
> kind of compass, and remarkably, she can adjust for the fact that the
> sun moves throughout the day. Even on a cloudy day, when the sun itself
> is hidden, bees can often still detect its position using patterns of
> polarised light in the sky that are invisible to human eyes.
>
> The second is memory of landmarks. Experienced bees build up a
> detailed mental map of the area around their hive, learning to recognise
> particular trees, rooftops or unusual rock formations. Younger, less
> experienced bees rely more heavily on the sun-compass method, gradually
> building their own landmark memory as they make repeated trips.
>
> Scientists have also found real evidence that bees can sense the
> Earth's magnetic field: tiny iron-rich particles inside a bee's abdomen
> appear to act almost like a compass needle, and interfering with them
> changes how well a bee can find her way. Exactly how much this magnetic
> sense contributes to everyday navigation, though, is still being
> investigated — it is one of the least understood of a bee's senses.
>
> Once a bee returns to the hive with news of a good food source, she
> performs what scientists call the waggle dance. Moving in a distinctive
> figure-of-eight pattern on a vertical honeycomb, she waggles her body
> from side to side along the central line of the figure. The angle of
> this waggling line, compared to straight up, tells the other bees the
> direction to fly relative to the sun. The length of time she spends
> waggling tells them roughly how far away the food is: a longer waggle
> means a longer journey. Other worker bees crowd around her, following
> the pattern closely with their antennae, before setting off themselves
> to find the same flowers, often without ever having visited that exact
> spot before.
>
> What makes this dance especially remarkable is that it is performed
> entirely in darkness, deep inside the hive, where the other bees cannot
> see the pattern at all. They read it instead through touch, sound and
> the faint vibrations the dancing bee produces, reconstructing a mental
> map of a location none of them have ever visited from movement alone.
>
> An Austrian scientist named Karl von Frisch spent decades studying
> honeybees, and in 1946 he published his full account of what the waggle
> dance actually meant — work that later earned him a Nobel Prize.
> Researchers continue to discover new details about the dance even
> today. What is already clear is that a creature with a brain smaller
> than a grain of rice is capable of communicating precise distance and
> direction information almost as effectively as a written map — a
> genuinely astonishing feat of natural engineering.

### Questions

| # | Type | Competency | Marks | Question | Expected answer |
|---|---|---|---|---|---|
| 1 | QT-RC-01 | RC-01 | 1 | How far might a bee travel from her hive? | More than a mile. |
| 2 | QT-RC-01 | RC-01 | 1 | In what year did Karl von Frisch publish his full account of the waggle dance's meaning? | 1946. *(Remediated: the original question/answer, "which decade... the 1960s", was factually inaccurate — corrected to a verified, single-year fact from the corrected passage.)* |
| 3 | QT-RC-02 | RC-02 | 4 | Do young bees rely mainly on landmark memory? | No — young bees rely more on the sun-compass; landmark memory builds gradually with experience. |
| 4 | QT-RC-03 | RC-03 | 1 | What does "remarkable" mean here? | Very impressive/surprising. |
| 5 | QT-RC-04 | RC-03 | 4 | Synonyms for detect/distinctive/crowd/reconstructing/astonishing | notice; recognisable; gather; rebuilding; amazing. |
| 6 | QT-RC-06 (sequencing) | RC-04 | 4 | Order 4 events in the waggle-dance process | Find food → fly back → perform dance → other bees follow with antennae. |
| 7 | QT-RC-08 (list extraction) | RC-01 | 3 | List the 3 things the passage describes bees using or sensing to find their way home | Sun/polarised light; landmark memory; sensing the Earth's magnetic field (passage notes its role is still being investigated). *(Remediated: reworded from "three navigation systems" so the magnetic item is no longer implied to be equally established.)* |
| 8 | QT-RC-09 (multi-select) | RC-01 | 2 | Tick the 2 true statements about the waggle dance (of 4) | Direction to fly; how far away the food is. |

**Teaching evidence:** every question carries a real, specific
`addresses_misconception` note.

**Anti-memorisation rationale:** wholly original explanatory content — not
copied or adapted from any single source text.

**Factual Verification Control (Decision 229) — new standing convention for
Angel-authored non-fiction:** automated tests prove internal consistency
(answers match the stored passage) but cannot by themselves prove a
real-world claim is true. Both real-world factual claims in this passage were
independently verified this session against multiple authoritative sources
before correction:

- **Waggle-dance decoding (Karl von Frisch, 1946):** SOURCE-CONTAINS —
  multiple independent, authoritative sources (Springer/*Insectes Sociaux*
  "The dance legacy of Karl von Frisch"; *Bee Craft* "How Karl von Frisch
  deciphered the waggle dance"; EBSCO Research Starters) describe von
  Frisch's full published account as 1946 ("Die Tänze der Bienen"), with a
  Nobel Prize awarded in 1973 for this body of work. ANGEL-SIMPLIFICATION —
  the passage names von Frisch and 1946 as one clean, memorable retrieval
  fact, mentioning the Nobel Prize only briefly without a specific year.
  FACTUAL-CONFIDENCE — HIGH. UNRESOLVED-CONTESTED-CLAIMS — none identified.
- **Magnetic sensitivity in bees:** SOURCE-CONTAINS — peer-reviewed sources
  (Springer/*Animal Cognition* and PMC, "Magnetoreception in Hymenoptera";
  *Nature Scientific Reports*, "Magnetic Sensing through the Abdomen of the
  Honey Bee") document iron-rich granules in the abdomen, experiments
  showing interference disrupts navigation, and explicitly describe this as
  "one of the least understood senses" in bees. ANGEL-SIMPLIFICATION — the
  passage states the real evidence without naming trophocytes/magnetite, and
  explicitly flags that its navigational role is still being investigated.
  FACTUAL-CONFIDENCE — MEDIUM (sensitivity is well evidenced; its precise
  role and mechanism remain open questions). UNRESOLVED-CONTESTED-CLAIMS —
  whether the abdominal iron granules are the true magnetoreceptor organ, or
  serve a different (e.g. iron-storage) function, is genuinely unresolved in
  the cited literature — the passage deliberately avoids asserting a
  mechanism for this reason.

Full source list is recorded in `ALI_DECISION_LOG.md` Decision 229.

---

## PORTFOLIO-WIDE COVERAGE

Combined with the existing certified passage (which already covers all 10
QT-RC types), this increment brings portfolio-wide coverage to 9 of 10
evidenced Reading Comprehension types, each now represented at least twice.
**QT-RC-07 (Multi-Entity Comparative Attribute Extraction) is honestly not
attempted this increment** — neither new passage's own real content supports
a genuine two-entity comparison without forcing an artificial question; this
is named as a deferred gap, not silently skipped.

---

## CONTINUOUS WRITING — 3 New Prompts (QT-WC-01a, text-based only)

**Picture-stimulus (QT-WC-01b) boundary, explicitly held:** none of the
prompts below substitute text for the real paper's own picture-stimulus
task. No image-asset pipeline exists in Angel today; that remains a named,
separate, future capability increment, not worked around here.

### 1. "Somewhere New"

> Write about a time you visited somewhere completely new to you — it
> could be a place you moved to, a place you visited on holiday, or even a
> new school or club. Describe what you noticed first, how the place felt
> different from what you were used to, and how your feelings about it
> changed the more time you spent there.

**Shape:** place-arrival narrative (unfamiliar → familiar). Genuinely
distinct from all 5 other prompts (3 existing + 2 new below).

### 2. "A Mistake You Learned From"

> Write about a time you made a mistake and what you learned from it.
> Explain what happened, how you felt at the time, and what you would do
> differently if you faced the same situation again.

**Shape:** error-and-growth narrative (mistake → consequence → changed
approach) — centred on a single action, distinct from the existing
"changed your mind" prompt's belief-shift structure.

### 3. "Should Children Have Limits on Screen Time?"

> Do you think there should be limits on how much time children spend
> using phones, tablets, or screens? Write about your own opinion, using
> your own experience or things you have noticed to support what you
> think.

**Shape:** direct opinion-question, the same evidenced format as the
existing "Should everybody learn to cook?" prompt, with a genuinely
unrelated topic.

**AI-scoring boundary:** none of the three prompts touches or is exempted
from the existing AI-feedback pathway or Decision 60's mastery quarantine —
they inherit it automatically, unmodified, like every other Writing row.

---

## RESULTING CAPACITY (after this increment, pre-review)

- Certified-track Comprehension passages: 1 → **3** (2 awaiting review).
- Comprehension question experiences: 12 → **27** (15 awaiting review).
- Continuous Writing prompts: 3 → **6** (3 awaiting review, still QT-WC-01a only).
- Portfolio QT-RC coverage: 9 of 10 types now represented at least twice; QT-RC-07 remains a named gap.
- Remaining gap to Decision 227's own MINIMUM target (4-6 passages): 1-3 more passages needed even after this increment's own content is reviewed and promoted.
- Remaining gap to HEALTHY (10-15 passages, full archetype coverage across multiple passages, mock_eligible content): substantial — this is one bounded step, not the destination.

**Nothing above is certified.** All figures reflect `authentic_assessment_candidate` rows awaiting your own independent review — none is `practice_eligible` or `mock_eligible` until you make that decision.
