---
name: angel-educational-quality
description: Use when reviewing or planning ANY teaching/learning content change in Angel 11+ — new questions, teaching assets, guided practice, remediation, family depth, or mastery/transfer logic. Checklist for evaluating educational quality against Angel's own standards, not a general pedagogy essay.
---

# Angel — Educational Quality Review

Applies the Family Depth Standard and the educational loop from `AGENTS.md`. Use this before
proposing content work, and to review content work someone else (or a subagent) produced.

## The educational loop a change must fit somewhere on

`Diagnose → Prioritise → Teach → Practise → Assess → Review → Maintain Mastery → Rebalance`

If a proposed change doesn't clearly sit on this loop, ask what educational problem it actually
solves before building it.

## Family Depth Standard — a family is not "deep" just because it has many rows

Check, for the family in question, against **live production data** (never assumed):

- **Structural variation** — genuinely different reasoning routes, not just different numbers.
- **Representation variation** — text / table / diagram / coordinates / chart / multi-step context,
  where appropriate. (Known platform-wide weak axis — see `ANGEL_PROJECT_STATE.md`.)
- **Difficulty range** — Foundation / Development / Exam Readiness, not tied to school year.
- **Support range** — worked example → guided → supported → independent → transfer, where the
  competency requires teaching.
- **Context variation** without becoming irrelevant decoration.
- **Constraint variation** — what's known/unknown/required/compared/inferred/justified.
- **Transfer** — at least some items require applying the skill to an unfamiliar structure.
- **Anti-memorisation** — detect repeated skeletons even when surface wording/numbers differ.

## Before adding teaching content to an existing family

1. Pull the family's real live rows (`ali_question_bank`, practice-eligible) — not a prior report.
2. Check every row's `workingSteps` / equivalent for whether the **last step already contains the
   answer**. If so, any Guided reveal control MUST be capped (`maxGuidedRevealSteps` in
   `mathsTeachingContent.ts`, or the equivalent for the subject) to the measured minimum revealable
   before the answer appears in ANY real row. This is a real, previously-hit answer-leak class of
   defect (Educational Depth Phase 1 Wave 1) — always re-derive the cap from live data, never copy
   a sibling family's cap.
3. Ground misconception/remediation text in the family's own real `addresses_misconception`
   evidence — never invent a plausible-sounding wrong-answer diagnosis.
4. Check the render path actually reaches a learner: a teaching asset existing in code is not the
   same as a learner ever seeing it. Trace the real component/gate (see
   `practiceInteractionGuard.ts`'s pattern) — Wave 1 found 68% of covered Maths questions were
   silently gated out by a stricter-than-necessary render condition.

## Picture-led narrative stimuli must be narratively generative, not merely describable

(Established from a real Founder rejection, Educational Depth Phase 1 Wave 2: a real Year 5 learner
shown a technically well-illustrated but under-generative picture said "there is nothing to write
with the picture.")

A strong picture-led Writing stimulus must give a learner several credible narrative footholds —
for example a character whose situation raises questions, an interrupted activity, evidence
something has just happened or may happen next, an unusual object, a discovery, a problem or
decision, mild tension or mystery, contrasting reactions, or an unexpected circumstance — while
remaining genuinely open-ended. Do not mechanically include every item; choose a coherent scene.

- **Test it**: could different children reasonably produce materially different stories while all
  grounding their narrative in evidence actually visible in the image? If the honest answer is "not
  without inventing almost everything themselves," the stimulus is describable but not generative —
  reject or redesign it before it reaches Practice.
- **Anti-memorisation applies to images too**: never solve weak generativity by adding text to the
  picture (a title, a speech bubble, a written clue, a fixed backstory, an obvious
  beginning-middle-end) — that dictates the plot instead of evidencing it, and collapses the range
  of legitimate stories a learner could write.
- **Automated checks (asset exists, renders, is classified correctly, doesn't collide with Mock)
  prove structural safety only** — they cannot prove narrative quality. That requires a real
  learner or Founder judgement call before any picture-narrative candidate is promoted.

## Non-negotiables

- **Supported success ≠ independent mastery.** Never record or report guided-mode correctness as
  mastery evidence.
- **Practice teaches, Mock measures.** Teaching scaffolds must never appear inside Mock; Mock
  content must never leak into Practice's exposure pool.
- **Do not optimise for raw count.** If the honest answer to "should we generate more questions
  here" is no because the real gap is teaching/rendering/remediation, say so and do that instead
  (Wave 1's own precedent: 0 new questions generated, by design).
- **Never invent CSSE rules, scoring, or marking structures.** Use only the approved 5-dimension
  Writing rubric and existing marking contracts — check `ANGEL_PROJECT_STATE.md` before assuming a
  marking rule exists.
