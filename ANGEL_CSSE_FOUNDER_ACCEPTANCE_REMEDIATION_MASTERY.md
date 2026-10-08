# Founder production acceptance — live remediation and mastery semantics

For a **Founder-created test learner only**. Never Family #1, and never anyone's real credentials. Nothing here asks Claude for a password or session.
Deployed in commits `2c5e5d0` (remediation), `5170c29` (mastery breadth), `f728d81` (English reveal) and `f5d1bb1` (Writing craft checks).

## Part 1 — Remediation (about 5 minutes, on www.angel11plus.com)

Use a registered test parent account with one test learner, in Learner mode.

| # | Do this | You should see | If not |
|---|---|---|---|
| 1 | Open **Reading practice**. On any question, type a clearly wrong answer and submit. | "Not quite", then the correct answer ("A correct answer is: …"), and a "Next time:" tip. | Screenshot; this is the English reveal (inc 2). |
| 2 | Keep going. Get **two wrong in a row from the same family** (same kind of question). | After the second, a panel titled "Let's look at how this kind of question works, on a different example." showing a worked example about a *different* topic. It must not contain the live question's answer. | Screenshot the panel and the question. |
| 3 | Look at the **next** question after a wrong answer. | It is a different kind of question where the session still has one (not the same family again). | Note the two question openings. |
| 4 | Open **Maths practice**, choose a family with a worked method (percentages, mean, sequences). Get two wrong in a row in one family. | The same panel, with "the rule", a worked scenario, numbered steps and "Check it". | Screenshot. |
| 5 | Get a **third** wrong in a family that has a full lesson (arithmetic, percentages, compound shapes, retrieval, inference). | The panel plus "Open the lesson for this skill". | Screenshot; note the skill. |
| 6 | Open **Writing practice**, expand the worked model. | A list headed "Check your writing before you finish:" with nine short checks. | Screenshot. |
| 7 | Open **a Mock** (do not complete it). | No remediation panel, hints or answers appear during the sitting. | **Report immediately: this would be a P1.** |

Pass: steps 1–6 behave as written and step 7 shows none of it.

## Part 2 — Mastery (cannot be forced in one sitting)

Mastery needs the same questions answered correctly independently across separate sessions, so no short script can create it. Acceptance is therefore three-part:

1. **Deterministic tests (already passing):** a single remembered question, or two questions from one family, can never validate a competency; two families, or two distinct skeletons within a single family, can; supported-correct answers never count; a pool that cannot offer two structures stays "developing".
2. **Natural use:** over a week of ordinary test-learner practice, open the Learning Report. A skill you have only practised in one kind of question must read "Reinforcing" (provisional), not "Mastered".
3. **Data re-check (read-only, by Claude, on request):** give Claude the test learner's *profile id* (not login details). Claude runs read-only queries comparing each competency's evidence with the rule and reports any competency shown as mastered on a single family.

Expected side effect to be aware of: of the 16 learner-competency masteries recorded in production (including test accounts), 6 would now read "developing". That is the intended correction, not a regression.

## Part 3 — Visual representations (bundled into the same session; only after the first governed publish)

The table, bar-chart, coordinate-grid, angle-figure and number-line renderers are deployed, but **no question that uses them is live until you
submit and publish some of the pending candidates** (nothing has been submitted). To keep this to one short session, publish a **small
sample first**, one approved candidate per representation (use the approval pack `ANGEL_CSSE_MATHS_BLUEPRINT_APPROVAL_PACK.md`, then the
governed submit and publish route), then run this with the same test learner in **Maths practice**:

| # | Find a question showing | You should see | If not |
|---|---|---|---|
| 8 | a **table** (data handling) | a titled table with a caption; the question text does not repeat the table's numbers | Screenshot |
| 9 | a **bar chart** | bars on a labelled scale with gridlines; no value printed on any bar | Screenshot |
| 10 | a **coordinate grid** | square cells, labelled axes, the point(s) named but their coordinates not printed; a dashed mirror line where the question mentions one | Screenshot |
| 11 | an **angle figure** | a triangle, straight line or point with arcs; the unknown shown as an italic letter; the line "Diagram not drawn accurately" | Screenshot |
| 12 | a **number line** | labelled major marks, shorter unlabelled marks, an arrow marked P (or A and B) | Screenshot |
| 13 | any of the above, on a **phone-width** window | the picture fits the width and every label is readable | Screenshot and the device |
| 14 | any of the above, with a **screen reader** or by reading the picture's text | a short description names what is drawn but never the answer | Note what it said |

Also confirm one thing that has **not** changed: **a Mock never shows any of these new pictures** (Mock Form B items use the existing image stimulus).

Pass: steps 8-14 behave as written.

## What to send back
"Part 1 pass" (and "Part 3 pass" once the sample is published) or the step number and a screenshot; and the test learner's profile id when you want Part 2.3 run.
