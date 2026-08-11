# Founder Test Instructions — Mathematics Reference Vertical

**Programme:** Angel Assessment Transformation Execution Programme — Release 1, Mathematics Learn → Practise Reference Vertical
**Prepared:** 2026-08-11

---

## Step 1 — Apply migration 023 (required, one-time)

Supabase Dashboard → SQL Editor → New query → paste the full contents of `supabase/migrations/023_mathematics_learn_arithmetic_content.sql` → run. This inserts 2 new rows into `ali_question_bank` (the lesson's Guided Attempt and Independent Check items). It does not touch any existing row. Same step as migrations 021 and 022 earlier in this programme.

## Step 2 — Try the lesson

1. Navigate to `/learning-intelligence/learn` (or click "Learn" in the top navigation while on the CSSE pathway).
2. Click the "Mathematics: Adding and Subtracting Big Numbers" card.
3. Click "Start the lesson."
4. Read the Concept and Method sections.
5. Read both Worked Examples (847+356, and the harder 1000−473 borrowing-across-zeros case).
6. Try the Guided Attempt (652 + 279). Use "Need a hint?" to see the scaffolding if you want — it reveals up to 3 hints, one at a time.
7. Submit. Confirm it's marked correct/incorrect and the answer is shown.
8. Read the Common Mistakes section (appears after the Guided Attempt).
9. Try the Independent Check (903 − 468) — no hints available this time. Submit.
10. Confirm the Exam Application note and a "What's next?" action appear — either a link into real Mathematics Practice (if you answered correctly) or a "Let's go through this again" reset (if not).

## Step 3 — Confirm real evidence was recorded

Return to `/learning-intelligence/parent` (CSSE pathway) and check the "What needs attention?" card — if Arithmetic Calculation is Angel's current top recommendation, you should see a "Start this lesson →" link directly there too. The Learning Report (`/learning-intelligence`) will also reflect the two new real attempts in its competency/evidence data for Arithmetic Calculation.

## What to specifically judge (this is the Educational Validation Pack's request, not just a functional check)

- Is the Concept/Method explanation clear enough for a child who genuinely doesn't yet understand carrying/borrowing?
- Does the borrowing-across-zeros worked example (1000 − 473) need a gentler example before it, or is it pitched correctly?
- Are the two named Common Mistakes the right ones?
- Does the lesson feel like real teaching, or still like a content card with a button? (If the latter, say so — that is exactly the failure mode this vertical was built to avoid.)

## What this is not

Independent educational review — see `MATHEMATICS_EDUCATIONAL_VALIDATION_PACK.md`. This is real Founder production validation, explicitly not a substitute for a qualified reviewer who did not author the content.
