# Mathematics Learning Design — Column Addition and Subtraction

**Programme:** Angel Assessment Transformation Execution Programme — Release 1, Mathematics Learn → Practise Reference Vertical
**Prepared:** 2026-08-11
**Competency:** MR-01 (Arithmetic Calculation) · **Question Type:** QT-MR-01 (Direct Arithmetic Computation)
**Child-facing title:** "Adding and Subtracting Big Numbers"

This is the exact content implemented in `app/learning-intelligence/learn/mathematics/arithmetic/page.tsx`. No architecture terms (MR-01, QT-MR-01, EMC-4) appear anywhere in learner-facing text below — they are used only in this document for internal traceability.

---

## 1. CONCEPT

**Learner-facing text:**

> Every digit in a number has a place value — ones, tens, hundreds, and so on. When you add or subtract big numbers, you work one column at a time, starting from the ones column on the right.
>
> Sometimes a column adds up to 10 or more — when that happens, you **carry** the extra ten into the next column. Sometimes you need to subtract a bigger digit from a smaller one — when that happens, you **borrow** a ten from the next column.
>
> Carrying and borrowing aren't tricks — they're just keeping track of place value properly.

## 2. METHOD

**Addition, step by step:**
1. Line up the numbers so the ones, tens, and hundreds columns match.
2. Add the ones column first. If the total is 10 or more, write down the last digit and carry the rest to the tens column.
3. Add the tens column (including anything carried). Carry again if needed.
4. Keep going, column by column, until every column is added.

**Subtraction, step by step:**
1. Line up the numbers the same way.
2. Subtract the ones column first. If the top digit is smaller than the bottom digit, borrow a ten from the next column — the next column's digit goes down by one, and the current column's top digit goes up by ten.
3. Subtract the tens column, borrowing again if needed.
4. Keep going until every column is subtracted.

## 3. WORKED EXAMPLE

**Example 1 — Addition with carrying: 847 + 356**
> - Ones: 7 + 6 = 13 → write 3, carry 1
> - Tens: 4 + 5 + 1 (carried) = 10 → write 0, carry 1
> - Hundreds: 8 + 3 + 1 (carried) = 12 → write 12
> - **Answer: 1203**

**Example 2 — Subtraction with borrowing across a zero: 1000 − 473**
> This is the trickiest kind of borrowing, because the digits you're borrowing from are zeros.
> - Ones: 0 − 3. Can't do it — need to borrow. But the tens column is also 0, and so is the hundreds column — so the borrow has to travel all the way to the thousands column.
> - Thousands: 1 becomes 0, hundreds becomes 10.
> - Hundreds: 10 becomes 9 (borrowed for the tens column), tens becomes 10.
> - Tens: 10 becomes 9 (borrowed for the ones column), ones becomes 10.
> - Ones: 10 − 3 = 7
> - Tens: 9 − 7 = 2
> - Hundreds: 9 − 4 = 5
> - **Answer: 527**

This second example is deliberately the harder of the two — it mirrors the real difficulty CSSE's own opening arithmetic question has tested in every year Angel has reviewed.

## 4. GUIDED ATTEMPT

**Item (scaffolded):** 652 + 279 = ?

Scaffolding, revealed one step at a time on request (never forced, never blocking a child who wants to try unaided first):
- Hint 1: "Start with the ones column. What's 2 + 9?"
- Hint 2: "That's 11 — write the 1, carry the 1 to the tens column."
- Hint 3: "Now the tens column: 5 + 7, plus the 1 you carried."

This is recorded as a **guided** attempt — real evidence, tagged distinctly from an independent attempt (see `MATHEMATICS_PROGRESSION_AND_MASTERY_MODEL.md`), since scaffolded help changes what the outcome can honestly claim.

## 5. INDEPENDENT CHECK

**Item (unscaffolded):** 903 − 468 = ?

No hints available. This is the first evidence this lesson contributes to the real Educational Intelligence pipeline as a genuine, unaided attempt — recorded via the same `recordPresentation`/`recordOutcome`/`processEvidenceForCompetency` pipeline every other CSSE surface uses.

## 6. COMMON MISTAKES

**Learner-facing text:**

> Two mistakes catch most children out on this topic:
>
> 1. **Forgetting to carry.** If a column adds up to 10 or more, that extra ten has to go somewhere — it doesn't just disappear. Always check: did I carry when I needed to?
> 2. **Borrowing from a zero without continuing the chain.** If the column you want to borrow from is a zero, you can't borrow from it directly — you have to keep going left until you find a column with something to give, and every column along the way changes too (like in the 1000 − 473 example above).

## 7. EXAM APPLICATION

**Learner-facing text:**

> This exact type of question — a straightforward calculation with no story attached — is usually one of the very first questions on a real 11+ maths paper. Getting comfortable with carrying and borrowing means you can answer it quickly and confidently, leaving more time for the harder questions later in the paper.

**Internal evidence basis:** CSSE-006/011/016 Q1–Q3 (2021–2023 Entry) — confirmed EMC-4/HIGH, identical opening-question format in all three held years (`data/founderValidation/csseFounderValidationEvidence.ts`, `fv-mth-001`). No CSSE wording is reproduced anywhere in the learner-facing text.

## 8. NEXT STEP

Per `MATHEMATICS_PROGRESSION_AND_MASTERY_MODEL.md`, routed by the real outcome of the Independent Check, not by lesson completion alone:
- Independent Check incorrect → "Let's go through this again" (re-offers the Worked Example and a fresh Guided Attempt).
- Independent Check correct → "You're ready to practise this properly" (routes into `/learning-intelligence/practice/mathematics`, where the real, evidence-driven session runner — unmodified — takes over, drawing from the full MR-01 practice pool, not just this lesson's two items).

## Design notes

- No architecture terms are shown to the child. "MR-01," "QT-MR-01," and "EMC-4" exist only in this document and internal code comments.
- Both numeric examples were checked by hand (847+356=1203; 1000-473=527; 652+279=931; 903-468=435) before being written into the lesson.
- The lesson does not claim mastery at any point — see `MATHEMATICS_PROGRESSION_AND_MASTERY_MODEL.md` for the explicit lesson-completed vs. skill-mastered distinction.
