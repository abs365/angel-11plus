# ANGEL 11+ — CONTINUOUS WRITING: HUMAN-CALIBRATION PACK (2026-10-08)

**Status: kit only. No script has been collected, no reader has marked anything, no calibration has been run, and no result or
calibration claim exists.** This pack operationalises `ANGEL_WRITING_HUMAN_CALIBRATION_PROTOCOL.md` so that, once the Founder
chooses two independent readers and a consent route, the exercise can start the same day. Thresholds remain the Founder's.

## 0. Two things that must stay separate

| | **Formative AI feedback (live today)** | **Validated, human-calibrated assessment (does not exist)** |
|---|---|---|
| What it is | An uncalibrated AI read against the five-dimension rubric, shown in Practice as guidance | A read whose agreement with careful human readers has been measured and found acceptable |
| Evidence tier | Supported; excluded from mastery | Would need a separate, explicit Founder decision |
| What parents are told | "A useful first read", with the existing disclaimers | Nothing until a calibration result justifies it |
| Changes because of this pack? | **No** | **No.** A good result justifies cautious wording; it never changes mastery or marking automatically |

CSSE Continuous Writing is double-marked by humans with moderation. One AI pass cannot replicate that, and the official comprehension/Writing mark
split is unresolved; neither is assumed anywhere here.

## 1. The kit (all in `scripts/output/writing-calibration-pack/`, all blank by design)

| File | Purpose |
|---|---|
| `sample-register.csv` | 40 random script ids with the stratified plan: 20 reflective (QT-WC-01a) and 20 picture-led narrative (QT-WC-01b); per genre 7 weak, 6 middling, 7 strong targets and 4 awkward cases (too short, off task, memorised template, plus heavy-spelling-good-ideas for reflective and picture-described-not-a-story for narrative). **Held by the coordinator only; readers never see quality targets or awkward types.** |
| `reader-sheet-TEMPLATE.csv` | One row per script: a level for each of the five dimensions, an evidence line per dimension, notes. Copy to `reader-a.csv` and `reader-b.csv` |
| `third-reader-sheet-TEMPLATE.csv` | Only for scripts where A and B differ |
| `ai-run-sheet-TEMPLATE.csv` | AI levels, a flag column (low-confidence or review-required), and the rubric/prompt versions used |
| `README.txt` | Allowed cell values and the one command that produces the results |

Analysis: `npx tsx scripts/analyse-writing-calibration.mjs scripts/output/writing-calibration-pack` writes `results.md` (measures only: no mark, no band,
no CSSE-equivalent number). The arithmetic is tested (`tests/lib/learningEngine/writingCalibrationMeasures.test.ts`, on synthetic arithmetic data that is not writing).

## 2. Reader instructions (give to both readers)

You are marking **for agreement with a second reader**, not to teach or to grade a child. Do not discuss scripts with the other reader and do not look
at any AI output. Mark every script, in the order given, using only the five dimensions and three levels below.

**Levels.** `developing`: the quality is not yet reliably there; errors or limits get in the way often. `secure`: generally reliable with some lapses.
`strong`: consistently controlled, with some real skill beyond the basics. `could_not_judge`: there is not enough writing, or it is not on the task, to judge
this dimension fairly (use it honestly; do not guess).

**Reader guidance per dimension (Angel's plain-language wording for readers, not the official descriptors; give readers the official CSSE sample mark scheme alongside, where licensing permits, and prefer it where they differ).**

| Dimension | developing | secure | strong |
|---|---|---|---|
| **Ideas** | few ideas, mostly generic or off the point; little or no development | relevant ideas, some developed; the point is clear most of the time | well-chosen ideas developed with specific detail; a clear angle, and for narrative a genuine turning point |
| **Vocabulary (including spelling)** | very plain or repeated words; frequent misspelling of common words | mostly accurate, some well-chosen words; spelling mostly secure | precise, varied, apt choices; spelling secure including less common words |
| **Grammar** | frequent errors in tense, agreement or sentence completeness; sentences mostly simple | mostly correct with a few lapses; some variety | accurate throughout with varied, controlled sentence structures |
| **Structure** | little organisation; no clear beginning/middle/end or paragraphing | recognisable organisation, mostly clear paragraphs, some linking | purposeful organisation; paragraphs and links shape the reader's experience |
| **Punctuation** | sentence boundaries often wrong; few other marks | sentence punctuation mostly right; some other marks used correctly | accurate and varied (commas, speech marks, apostrophes, and more where useful) |

**Evidence lines.** For any dimension judged `strong` or `developing`, write one short line pointing at the script (for example a quoted phrase or "no paragraphs").
**Do not infer age or ability from handwriting, names or topics; all scripts are typed and anonymised.**

**Procedure.** (1) Calibration session first: both readers mark the same 4 practice scripts that are not in the sample, then discuss every difference, so the
rubric language is shared. (2) Mark all 40 independently. (3) Return sheets to the coordinator, not to each other.
**Third reader.** The protocol requires a third reader where A and B differ by two levels. It is **silent on one-level differences**: this pack flags them as
"recommended" for the third reader and the analysis leaves any cell with no human reference **unresolved and excluded**, never guessed. **Founder to settle:** the
safest rule is that every difference goes to the third reader.

## 3. Collecting the scripts (coordinator)

1. **Sources, in order:** volunteer learners with explicit parental consent for this specific use; adult teachers writing in the style of Year 5-6 at stated levels,
   labelled simulated; held Mock responses only with the family's consent. **Never Family #1's scripts unless Family #1 explicitly agrees.**
2. **Prompts:** at least 8 distinct prompts per genre (live or approved-in-principle ones; the picture-led candidates are storyboards, see the narrative asset contracts, and
   should be used only if shown to writers in that form).
3. **Anonymise before anyone reads:** remove names, school, places and any identifying detail; type the script; store in a Founder-controlled local folder, never in production;
   identify only by the random id. Tick `anonymised_checked` and `ready` in the register.
4. **Consent wording (draft for the Founder and an adviser to review; not legal advice):** "We would like to use a piece of your child's writing, with all names and
   identifying details removed, to check how closely a computer's feedback agrees with experienced teachers. It will be read by two or three teachers, kept on a private
   device, and deleted when the check is finished. It will not be used to train a computer or shared. You can withdraw it at any time."

## 4. AI run (coordinator, after the humans have finished)

Run the live feedback logic once per script with the production prompt and rubric, recording the version identifiers in the sheet; run a second time on a random 10 for
repeatability. No prompt change during the run. Existing helper: `scripts/writing-rubric-calibration.mjs`. Record the flag column from the same run.

## 5. Measures (from the protocol, section 6) and how to read them

Human-human exact and within-one agreement (the ceiling); AI vs the human reference (exact, within-one, quadratic-weighted kappa); direction of disagreement (which way and how
often); AI repeatability; behaviour of the low-confidence and review flags on exactly the awkward scripts. Against the **proposed, provisional** thresholds (within one level at
least 90% per dimension; no more than 70% of disagreements in one direction; repeatability within one at least 90%; flags on at least 80% of awkward cases) the results file says met, not
met, or not computable. If the humans agree with each other less than the AI agrees with them, that is itself a finding about the rubric, not the AI.

## 6. Decision record (Founder, after the results)

What wording about AI Writing feedback is justified; whether any dimension needs different treatment (for example hold vocabulary/spelling comments back if disagreement is high);
what, if anything, would justify a future and separate governed decision about Writing and mastery. Nothing changes automatically.

## 7. Founder actions to start

1. Choose two independent readers (and a third) and brief them with sections 2 and 3. 2. Choose the consent route and the script sources. 3. Set or confirm the thresholds and the
one-level-difference rule. 4. Decide whether the official CSSE sample mark scheme may be handed to readers.
