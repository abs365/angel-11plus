# Increment 022 — English Reading's First Full Teaching Lesson — Founder Educational Review

Behavioural/educational review only. No new question-bank content was authored by this increment (zero new rows, zero new migration), so no `ali_family_review` record is created — nothing here requires that workflow. This document exists so you can judge the lesson itself, in plain English, before it goes live.

## Founder Decision Record (additive — original review below is preserved unchanged)

**Original decision: APPROVED WITH AMENDMENT.** Core RC-01 lesson: **FOUNDER APPROVED** — the introduction, EXPLAIN, five-step method, "The Football Boots" MODEL, "The New Trainers" GUIDED, "The Baker's Apprentice" INDEPENDENT, "The Storm at the Harbour" remediation/fresh retry, every existing accepted-answer set, the existing feedback ladder, the reflection, and the Practice link are all unchanged from the reviewed version below.

**Amendment reason:** a strong learner could complete the approved lesson without being meaningfully stretched, since every real content item used sits at the `easy` difficulty tier.

**Required amendment:** one optional stretch check, offered only after secure (first-attempt) independent success, using one further already-reviewed, `practice_eligible` RC-01 row.

**Stretch item selected on evidence, not the review's own named suggestions:** "The Understudy" (id `w2-understudy-01`, `hard` tier) — chosen over Attic Door, Piano Recital and Kite Maker because it is the only `hard`-tier RC-01 row with a genuine, hand-checked distractor (Oliver's own extensively-narrated six weeks of preparation, which does not answer "why did he suddenly need to perform" the way Daniel losing his voice does) paired with an answer that stays clearly text-supported and never drifts into inference. Attic Door's answer is locatable via an exact phrase ("eleven days") already present in the question, with no competing false lead; Piano Recital's answer is a two-word quotation with no real distractor either.

**Eligibility (the smallest existing state, read conservatively):** `secureIndependentSuccess = independentAttempt1?.correct === true` — correct on the very first independent attempt, with neither a second attempt nor the fresh-retry remediation path ever needed. A learner who only succeeded via attempt 2 or the fresh retry is not offered the stretch and proceeds straight to ordinary Practice, exactly as before this amendment.

**Child-facing wording:** "Fancy a trickier one?" / "You found that one straight away. Want a trickier one? This passage uses longer, more grown-up writing. You don't have to try it to finish the lesson." / button: "Yes, try one."

**Stretch experience:** the real passage and question, one plain answer box, one submit — no hint system, no reveal ladder (this is a single transfer-evidence attempt, not another teaching cycle). Correct: "Correct. You used the method on a trickier passage." (never "mastered"). Incorrect: a hand-checked explanation naming the real distractor, or an honest generic nudge — never the bare answer, never a forced retry, and the learner can still continue into Practice either way.

**Evidence recording:** reuses the lesson's own existing `recordIndependentAttempt()` path unchanged — the same real outcome-recording every other attempt in this lesson already uses. One stretch answer is additional evidence, never given outsized educational meaning (no mastery claim, no separate evidence store).

**Amendment implementation: YES.** **Amendment verification: AWAITING FOUNDER.**

---

## SELECTED SKILL

**RC-01 — Literal Retrieval from Narrative Text** (Assessment Brain V1's own competency catalogue; the same canonical 13-competency model Mathematics' MR-01/03/04 lessons already use). Learner-facing title: **"Finding the Answer in the Text."**

## WHY THIS SKILL WAS FIRST

Checked against the real, live production content (read-only query, respecting the same Practice-eligible gate every learner's session already goes through), not assumption:

- **Largest real footprint of any Reading competency:** 53 practice-eligible rows across 22 distinct passages — more than RC-02 (47/22), RC-03 (26/15), or RC-04 (16/14).
- **Highest exam-relevance rating** Assessment Brain V1 assigns any Reading competency (HIGH; RC-02 is MEDIUM, RC-03/RC-04 are LOW).
- **Every other Reading skill depends on it.** A learner cannot infer from evidence they cannot locate, explain a word using a sentence they cannot find, or sequence events they cannot retrieve. Teaching this first, before inference or vocabulary-in-context, follows the same "foundation before what builds on it" logic already applied when Mathematics' own lessons were chosen.
- **Safest possible first Reading lesson against your own instruction not to teach a memorisable trick.** Retrieval has a genuine, honest method (find the key words, scan for them, check the exact matching sentence) with no shortcut to accidentally teach. Inference (RC-02) carries a real risk of degrading into "if you see this wording, pick this answer" if taught first, before the method-first pattern is established.

I also corrected an inaccurate figure from my own earlier selection report: I had described English Reading teaching coverage as "0 of 9," using an informal list of free-text skill tags. The real, canonical lesson denominator — the same one Mathematics' own "3 of 6" figure uses — is the 4-competency Assessment Brain model (RC-01 through RC-04). Coverage should be reported as **1 of 4** after this lesson, not "1 of 9."

## LEARNING OBJECTIVE

By the end of the lesson, the child can find a directly-stated fact in an unfamiliar passage by identifying the question's key words, scanning for genuine matches (not just the first one), and checking the specific sentence that answers what was actually asked — and can explain, in their own words, why a plausible-looking earlier mention is not always the answer.

## EXPLAIN CONTENT

Plain-English, no jargon: what a retrieval question is asking for (one fact, stated directly, not something to work out); the real trap (the same thing is often mentioned more than once, and only one mention answers the question); the honest test of a correct answer (you can point to the exact sentence). The method itself is a five-step sequence: read the question for key words, scan the passage, read the full sentence around each match, check which match actually answers what was asked, answer using the passage's own information.

## MODEL EXAMPLE

An original, purpose-built short passage — **"The Football Boots"** (never a live Practice question; will never be reused elsewhere) — about a boy who cannot find his boots before training. Angel's own thinking is shown step by step: identifying the key words ("Leo," "find," "football boots"), noticing "boots" is mentioned twice, reading both sentences, and explicitly reasoning that the question asks where he *found* them (the car), not where he *looked* (the cupboard). The common wrong answer ("the cupboard") is named and explained directly underneath.

## GUIDED EXAMPLE

**"The New Trainers"** (real, already-reviewed, Practice-eligible passage, id `w3-rc01-newtrainers-01`) — Jayden saves for new trainers; at lunch, Connor glances at them for a second and keeps eating without comment. Question: *"What does Connor do when he sees Jayden's new trainers at lunch?"* A three-attempt ladder: a hint system pointing toward the right sentence, then (if still wrong) the exact quotation and answer are shown before a final self-typed attempt, matching the same ladder shape the Mathematics lessons already use.

## INDEPENDENT EXAMPLE

**"The Baker's Apprentice"** (id `w3-rc01-bakersapprentice-01`) — a different scenario entirely (a new apprentice's first morning at a bakery). Question: *"What does Mr Fenwick do when Priya arrives... instead of giving her an apron and a list of instructions?"* Two attempts, then, if still wrong, a **third, again genuinely different**, real passage — **"The Storm at the Harbour"** (id `w3-rc01-stormharbour-01`) — as a fresh, unpressured retry, exactly mirroring the Mathematics lessons' own remediation-ladder shape.

## EXPECTED CHILD THINKING

"There are two moments where trainers/boots/a particular object come up. I need to check which one actually matches every part of the question, not just the first one I notice." The child should learn to treat the question's specific wording (a name, a time, an action) as a filter against multiple candidate sentences, rather than answering from memory or first impression.

## COMMON WRONG APPROACH

Answering from the first plausible-looking mention, or from what happened at a *different* time/place than the one actually named in the question (e.g. describing what happened at break time when the question asks about lunch; describing what Mr Fenwick does a few sentences later rather than the very first thing he does). This is a real, well-evidenced retrieval-question trap, not a fabricated one — each of the three real passages used has its own hand-checked version of this exact trap.

## HOW ANGEL CORRECTS IT

For each of the three real passages, a small, hand-verified list of genuinely likely wrong answers (checked by keyword, e.g. an answer mentioning "break" for the trainers passage, or "watch"/"father" for the harbour passage) receives a specific explanation naming exactly what was confused with what. Anything outside that hand-checked list receives an honest, general nudge back to the right sentence — Angel never invents false certainty about a wrong answer it hasn't actually recognised, the same discipline the Mathematics lessons' own `classifyWrongAnswer()` already applies.

## ANTI-MEMORISATION CHECK: PASS

- Three real content slots (guided, independent, independent-fresh-retry) use **three different real passages**, about a school lunchroom, a bakery, and a harbour — genuinely different settings, characters and vocabulary, not the same scenario with names changed.
- The MODEL passage ("The Football Boots") is original and appears nowhere else — it is never one of the three real Practice-eligible ids, so a child cannot pattern-match the worked example onto a real question.
- Confirmed structurally by a dedicated test (`tests/app/increment022EnglishReadingTeachingLesson.test.ts`) that all three real ids are pairwise distinct and that the MODEL section never references any of them.

## PASSAGE/QUESTION PROVENANCE

All three real passages used (New Trainers, Baker's Apprentice, Storm at the Harbour) are pre-existing, already-reviewed, `practice_eligible` rows already live in ordinary Reading Practice today — confirmed by a read-only production query before this increment began writing any code. **Zero new question-bank rows were authored. Zero migrations were created.** The lesson fetches them through `fetchQuestionBank()`, the exact same Practice-eligible gate every other real Reading page already uses — never a Mock-specific table, never bypassing review.

## PRACTICE CONTINUATION

On finishing the lesson, the child sees a real link into ordinary Reading Practice (`/learning-intelligence/practice/reading-comprehension`), carrying the same one-time `skipTeachingRedirect=1` loop-safety flag the Mathematics lessons already established in the Increment 021 Founder Amendment — so returning from the lesson always reaches a genuine Practice session, never an immediate bounce back to the same lesson.

---

## A precondition this increment found and fixed, disclosed directly

Before this increment, `FULL_LESSON_ROUTE` contained only Mathematics competencies, so the practice page's Increment 021 lesson-redirect logic had never been exercised across two different subjects. Adding RC-01 as the first non-Mathematics entry exposed a latent gap in that existing code: the top-priority competency the decision engine names is chosen globally across all 13 competencies, not scoped to whichever subject's Practice page the learner happens to be viewing. Left unguarded, a learner practising Mathematics could in principle have been silently redirected into an English lesson (or vice versa) the moment a second subject had any registered lesson at all.

This was not reachable before this increment (no cross-subject registry entries existed to trigger it), so it is reported as a direct, necessary precondition of adding this lesson, not a reopening of Increment 021's own scope. Fixed in the same file, alongside the registry addition: the redirect now only fires when the recommended competency's own subject matches the Practice area currently open. Covered by two new tests confirming both directions still behave correctly.

## Status

**AMENDMENT / PRIOR DECISIONS:** none carried into this increment — this is a new lesson, not an amendment to prior work.

**VERIFICATION:** local, source-level and test-level only (typecheck, full 3533-test suite, scoped lint against the established pre-existing baseline, Copy Quality Guard, migration SQL guard, production build — all clean). **VISUAL VERIFICATION = DEFERRED**, unrelated to this increment (Chrome browser automation remains unavailable this session, consistent with every prior increment's own honest disclosure).

**FOUNDER EDUCATIONAL REVIEW: AWAITING FOUNDER.** No deployment, push, or database change has occurred. This lesson exists only in the local working tree pending your review.
