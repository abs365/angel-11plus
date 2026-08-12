# CSSE Mock Product Architecture V1

**Programme:** Angel Assessment Transformation Execution Programme — Release 1
**Prepared:** 2026-08-11
**Builds directly on:** `CSSE_FULL_MOCK_STRUCTURE_DECISION_V1.md` (approved structure) and the competitive findings above. Design only.

---

## The Five Products, Educational Purpose Kept Distinct

| Product | Purpose | Structure (from the approved decision) | Distinguishing design rule |
|---|---|---|---|
| **Full CSSE Mock** | Rehearse the whole sitting's workload and pacing as one experience | 12-16 Comp + 5 AR (blocked) + 20-21 Maths + 2 CW prompts, two papers, 130 min total | Never generated more than the question-bank depth model (below) genuinely supports — no padding to "feel complete" |
| **English Subject Mock** | The complete English paper's own 60-mark, three-section structure, alone | Comp+AR+CW exactly as evidenced, no Maths | Retains the real internal section timing (30+10+20), not a rescaled fraction of the Full Mock |
| **Mathematics Subject Mock** | The complete 60-mark, 60-minute Maths paper, alone | 20-21 questions, no calculator, exact-match | Full pacing pressure preserved — not shortened |
| **Continuous Writing** | Authentic task-genre and timing practice | 2 prompts, ~20 min | Explicitly not scored as CSSE-equivalent until the evidence gate lifts (§7 of the structure decision) — labelled as task practice, not assessment |
| **Focused competency practice** | Targeted skill-building on one Question Type/competency | Existing `generatePersonalisedSession()` mechanism | Deliberately un-paced or lightly paced — the opposite design goal to the four mock types above; must never be marketed or presented as a "mini-mock" |

**Why distinct, not layered:** per the competitive matrix, Essex Tutors succeed specifically because their product does one thing (real invigilated CSSE rehearsal) with total clarity. Angel's five products must each answer one clear question for a parent — "what is this actually for" — rather than being five volume tiers of the same thing.

## Relationship Between Products

```
Focused Competency Practice  (skill-level, untimed/light)
        |
        v  (evidence accumulates, competency-level)
Subject Mocks (English / Maths / Continuous Writing)  (subject-level, real pacing)
        |
        v  (readiness across subjects accumulates)
Full CSSE Mock  (whole-sitting, full authentic workload)
```

This is a natural-progression suggestion, not a gate — a family choosing Balanced Preparation (per the Family Choice Model) may move through it in this order; a family with a specific concern may go straight to a Subject Mock or Focused Practice. No product requires another as a prerequisite.

## Explicit Non-Decisions

This document does not decide UI, does not decide whether all five ship simultaneously, and does not decide pricing (§7, deferred). It defines only the purpose boundary each product must respect once built.
