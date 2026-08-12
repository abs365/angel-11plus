# Mathematics Lesson 002 — Learning Design: Finding a Percentage of a Quantity

**Programme:** Angel Assessment Transformation Execution Programme — Release 1, Mathematics Learning Sequence Expansion (Educational Increment 002)
**Prepared:** 2026-08-12
**Competency:** MR-04 (Multi-Step Word-Problem Interpretation) · **Question Type:** QT-MR-04 (Percentage / Proportional Change)
**Child-facing title:** "Finding a Percentage of a Number"

This is the exact content implemented in `app/learning-intelligence/learn/mathematics/percentages/page.tsx`. No architecture terms (MR-04, QT-MR-04, EMC-4) appear anywhere in learner-facing text below — they exist only in this document and internal code comments, matching Lesson 001's own discipline.

---

## 1. Learning objective

**Before writing any content, the precise, observable objective (governing instruction §4):**

> Given a percentage that is a multiple of 5 (e.g. 15%, 20%, 35%) and a whole-number quantity, the learner should be able to independently calculate the result by finding 10% of the quantity and building the target percentage from it, without being shown the working.

This is bounded to one method and one problem shape. It does not claim the learner can find percentages of non-round quantities, percentages that are not multiples of 5, or the reverse direction (what percentage one number is of another — `mth-010`'s own real skill, deliberately out of scope here, see `MATHEMATICS_LESSON_002_EVIDENCE_MAP.md` §1).

## 2. Concept

**Learner-facing text:**

> A percentage is a way of describing a part of something out of 100. 15% means 15 out of every 100.
>
> The easiest way to find a percentage of a number is to start with 10%. Finding 10% of a number is simple: just divide by 10. Once you know 10%, you can build up almost any percentage you need. 20% is double 10%. 5% is half of 10%. 15% is 10% plus 5%.
>
> You almost never need to work out a percentage in one big step. Building it from 10% pieces is faster and much less likely to go wrong.

## 3. Method

**Learner-facing text (numbered steps):**

1. Find 10% of the quantity by dividing by 10.
2. Work out what multiple of 10% you actually need (20% is double 10%, 30% is triple 10%, and so on).
3. If the target percentage includes a 5, find 5% by halving your 10% value, then add it on.
4. Add the pieces together to get the final answer.

## 4. Worked examples

**Worked Example 1 — a straightforward case (real evidence: `qa-007`, reused directly, unmodified numbers and answer)**

> **15% of 60**
> - 10% of 60 = 6
> - 5% of 60 = half of 6 = 3
> - 15% = 10% + 5% = 6 + 3 = **9**

**Worked Example 2 — a harder authentic pattern (new numbers, same real skill, larger quantity and a three-piece build)**

> **35% of 140**
> - 10% of 140 = 14
> - 30% = 3 × 14 = 42
> - 5% = half of 14 = 7
> - 35% = 30% + 5% = 42 + 7 = **49**

Hand-verified: 35 ÷ 100 × 140 = 4900 ÷ 100 = 49. ✓

## 5. Guided Attempt

**Item (new, `learn-mth-pct-guided`):** 15% of 80 = ?
**Answer: 12.** Hand-verified: 10% of 80 = 8; 5% of 80 = 4; 15% = 8 + 4 = 12.

Hints, revealed one at a time on request (never forced):
- Hint 1: "Start by finding 10% of 80. What's 80 ÷ 10?"
- Hint 2: "That's 8. Now find 5%, which is half of that 10% value. What's half of 8?"
- Hint 3: "That's 4. Now add the 10% piece and the 5% piece together to make 15%."

## 6. Independent Check

**Item (new, `learn-mth-pct-independent`):** 20% of 90 = ?
**Answer: 18.** Hand-verified: 10% of 90 = 9; 20% = 9 × 2 = 18.

No hints available, matching Lesson 001's Independent Check discipline exactly.

**Fresh transfer opportunity (new, `learn-mth-pct-independent-retry`, reached only after two unsuccessful attempts and a full worked resolution):** 30% of 70 = ?
**Answer: 21.** Hand-verified: 10% of 70 = 7; 30% = 7 × 3 = 21. A genuinely different problem, not a repeat of the numbers just shown, matching the Founder's own explicit instruction for Lesson 001's equivalent item.

## 7. Common mistakes

**Learner-facing text:**

> Two mistakes catch most children out on this topic:
>
> 1. **Stopping after finding 10%.** 10% is a stepping stone, not usually the final answer. Always check: does the percentage I need actually equal 10%, or do I still have more building to do?
> 2. **Building the wrong multiple.** If you need 20%, that's 10% doubled, not 10% plus 10 more. Double-check which multiple of 10% you actually need before you add anything on.

## 8. Exam application

**Learner-facing text:**

> Percentage questions like this appear regularly on 11+ maths papers, sometimes asking for a percentage of a quantity directly, and sometimes the other way round: telling you two numbers and asking what percentage one is of the other. This lesson covers finding a percentage of a quantity. Once that's solid, the reverse version becomes much easier to tackle too.

**Internal evidence basis:** `qa-007` (15% of 60, QT-MR-04) and `mth-010` (85 is 25% of 340, QT-MR-04) — both EMC-4/HIGH, confirmed across the full 3-year evidence base (CSSE-006/011/016). No CSSE wording is reproduced anywhere in the learner-facing text above.

## 9. Next step

Reuses the exact routing rule Lesson 001 established (`MATHEMATICS_PROGRESSION_AND_MASTERY_MODEL.md`), applied to this lesson's own real outcome:
- Independent Check ultimately incorrect → routes to Practice with an evidence-specific framing ("Practise percentages again"), the same honest destination pattern as Lesson 001.
- Independent Check ultimately correct → "You're ready to practise this properly," routing into `/learning-intelligence/practice/mathematics` (the existing, unmodified, subject-wide Mathematics practice pool — the same destination Lesson 001 already uses, since Practice is scoped by subject, not by individual competency).

## Design notes

- No architecture terms are shown to the child.
- All four numeric items were checked by hand before being written into the lesson: 15% of 60 = 9; 35% of 140 = 49; 15% of 80 = 12; 20% of 90 = 18; 30% of 70 = 21.
- The lesson does not claim mastery at any point — see `MATHEMATICS_LEARNING_SEQUENCE_RULES.md` for how this lesson's evidence combines with Lesson 001's, and the unmodified lesson-completed vs. skill-mastered distinction from `MATHEMATICS_PROGRESSION_AND_MASTERY_MODEL.md`.
- Copy Quality Guard-compliant throughout: no em dash or en dash sentence punctuation; every numeric range/percentage/arrow above is genuine mathematical notation, not prose punctuation.
