# Mathematics Lesson 002 — Misconception Map

**Programme:** Angel Assessment Transformation Execution Programme — Release 1, Mathematics Learning Sequence Expansion (Educational Increment 002)
**Prepared:** 2026-08-12

Follows Lesson 001's own established discipline exactly (`GUIDED_LEARNING_REMEDIATION_REPORT.md`, `app/learning-intelligence/learn/mathematics/arithmetic/page.tsx`'s `classifyWrongAnswer()`): a fixed, hand-verified, deterministic lookup from one specific wrong numeric answer to one specific plain-language explanation, for these specific fixed problems only. Not a general mistake-classification system — a coded misconception taxonomy remains explicitly not-yet-approved (`EDUCATIONAL_INTELLIGENCE_ENGINE_V1.md` §11) and nothing here is persisted as evidence, only used to decide the ephemeral UI feedback text. Any wrong answer that does not exactly match a listed pattern receives the honest generic nudge instead of a fabricated diagnosis.

---

## 1. Guided Attempt — "15% of 80 = ?" (answer: 12)

### KNOWN MISCONCEPTION PATTERN

**Wrong answer 8:** "It looks like 10% may have been found (8), but the lesson doesn't stop there. 15% needs the extra 5% added on too."

This is diagnostic because 8 is *exactly* what "find 10% and stop" produces for this specific problem, and no other plausible single-step error lands on 8 for 15% of 80.

### NON-DIAGNOSTIC INCORRECT RESPONSE

Any other wrong value (e.g. a simple arithmetic slip, a misread digit, a guess). Multiple, equally plausible causes could produce these, so the feedback stays the honest generic nudge already used in the second-tier worked resolution: "Here's the full method, one column at a time" (adapted for percentages: "Here's the full method, one piece at a time").

## 2. Independent Check — "20% of 90 = ?" (answer: 18)

### KNOWN MISCONCEPTION PATTERN

**Wrong answer 9:** "It looks like 10% may have been found (9), but the answer needs doubling to reach 20%, not left as 10%."

Diagnostic for the same reason as above: 9 is exactly the "found 10%, forgot to scale" value for this specific problem.

### NON-DIAGNOSTIC INCORRECT RESPONSE

Any other wrong value. Generic nudge only: "Think about what multiple of 10% you actually need, and make sure every piece gets added in. Try again."

## 3. Fresh transfer — "30% of 70 = ?" (answer: 21)

No diagnostic classification is attempted at this stage, matching Lesson 001's own fresh-transfer item exactly: this item resolves on a single attempt regardless of outcome (bounded ladder, no further retry), so the UI shows a plain correct/incorrect result with the real answer, not a misconception explanation. Attempting a diagnosis on a single, un-retried attempt would risk the same "pretending to know why" the governing instruction explicitly forbids.

## 4. Summary

| Item | Wrong answer | Status | Explanation |
|---|---|---|---|
| Guided (15% of 80) | 8 | KNOWN MISCONCEPTION PATTERN | Found 10%, didn't add the 5% |
| Guided (15% of 80) | anything else | NON-DIAGNOSTIC | Generic nudge |
| Independent (20% of 90) | 9 | KNOWN MISCONCEPTION PATTERN | Found 10%, didn't double it |
| Independent (20% of 90) | anything else | NON-DIAGNOSTIC | Generic nudge |
| Transfer (30% of 70) | any | Not diagnosed | Single attempt, correct/incorrect only |
