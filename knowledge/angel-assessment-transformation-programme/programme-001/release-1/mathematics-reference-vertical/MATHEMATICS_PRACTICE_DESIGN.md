# Mathematics Practice Design

**Programme:** Angel Assessment Transformation Execution Programme — Release 1, Mathematics Learn → Practise Reference Vertical
**Prepared:** 2026-08-11

---

## 1. Practice must not just repeat the worked example with different numbers

The Learn stage's Guided Attempt (652 + 279) and Independent Check (903 − 468) are deliberately narrow — proving the specific method just taught. Practise, once the learner moves on, must test whether the underlying understanding transfers to genuinely different situations, per governing instruction §6.

## 2. What "legitimate variation" means here

The existing MR-01 practice pool (see `EXISTING_MATHEMATICS_CONTENT_AUTHENTICITY_REVIEW.md`) already provides this naturally — it spans multiplication (`qa-003`), division (`qa-004`), decimals (`qa-005`, `mth-008`), square roots (`qa-008`), order of operations (`qa-009`, `mth-002`), and fraction operations (`qa-006`, `mth-004`), all under the same MR-01 competency. A learner who has just learned column addition/subtraction and moves into Practise is not shown four more addition-and-subtraction clones — they meet the real breadth of what "Arithmetic Calculation" actually covers on a CSSE paper, exactly as the real exam does not isolate one operation type per question.

## 3. No new content authored for Practise in this increment

Practise reuses `app/learning-intelligence/practice/[area]/page.tsx` and `generatePersonalisedSession()` **completely unmodified** — the same real, evidence-driven session runner every other CSSE surface already uses. This vertical's only change is what happens *before* Practise: a learner who completes the Learn sequence is offered a direct route into the existing Mathematics practice area, nothing more.

## 4. Item eligibility used

Per the Evidence Traceability Register, only items already classified Practice Eligible or above are drawn on — no Provisional-status content is surfaced. This was already true of the existing Mathematics practice area before this vertical (all 15 live MR-01 items are Practice Eligible or Authentic Assessment Candidate, per this review) — stated explicitly here rather than assumed.

## 5. What is deliberately not built this increment

A dedicated "practice just this lesson's exact sub-skill" mode. The governing instruction's own emphasis on legitimate variation argues against narrowing Practise to only column addition/subtraction — the existing, broader MR-01 pool already serves the pedagogically correct purpose better than a narrower, newly-built alternative would.
