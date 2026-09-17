---
name: angel-assessment-governance
description: Use when touching anything related to Mock exams, Practice/Mock boundaries, assessment integrity, Writing assessment, or the Mock-to-Educational-Intelligence (EI) bridge in Angel 11+. Governs what must stay sealed and what closed milestones must not be reopened without new material evidence.
---

# Angel — Assessment Governance

## Practice vs Mock — the boundary is structural, not just a convention

- **Mock content is sealed.** Mock-track questions/passages must never leak into the Practice
  exposure pool, and vice versa. `publish_question_candidate()` structurally refuses to publish
  Practice candidates against a Mock-reserved passage — treat any code path that could bypass this
  as a serious defect, not a minor cleanup.
- **Practice teaches** (worked examples, guided reveal, remediation). **Mock measures** (no
  teaching scaffolds visible during a sealed sitting).
- Check `eligibility_status` (`practice_eligible` vs the Mock-governance track) before assuming a
  row is reachable from either surface.

## Closed milestone — do not re-open without genuinely new material evidence

**Complete CSSE Two-Paper Mock — production learner acceptance: GO.** This covers Mock
infrastructure, scoring, release, Mock authentication, and Writing assessment recovery. A session
finding a *cosmetic* imperfection here is not grounds to reopen it — only a genuinely new material
production defect discovered during normal use is. Say explicitly if you're unsure which this is,
don't assume.

## Writing assessment boundaries

- The **five-dimension internal rubric** (Ideas / Vocabulary+Spelling / Grammar / Structure /
  Punctuation) is the only sanctioned marking framework. Never invent an official CSSE numeric
  marking split — CSSE does not publish one Angel has rights to assume.
- Writing AI-score is **quarantined from mastery** (CSSE Completion Programme Decision 60) — an
  AI-generated Writing score must not silently feed into a learner's mastery/competency evidence
  the way a deterministic Maths/English score does, unless a specific decision has changed this.
- Two CSSE writing modes exist in the Full Paper: reflective/discursive and picture-led narrative.
  They need genuinely different planning scaffolds, not one generic template forced onto both.

## Mock → Educational Intelligence (EI) bridge

- A poor Mock result must not end at a report. Real evidence should flow: Diagnose → Prioritise →
  Teach → Practise → Assess → Review → Maintain Mastery → Rebalance.
- Before building new intelligence logic, check whether the existing Educational Intelligence
  Engine already does the job — this bridge was a closed, production-accepted milestone; reuse it.

## Assessment integrity

- Answer-integrity and diagram-rendering incidents are closed, remediated milestones — check
  `ANGEL_PROJECT_STATE.md` before assuming either area is still broken.
- Any change touching scoring/marking functions must be verified against the **real, imported**
  scoring function (e.g. `validateEnglishMarkingContract`, `checkMathsAnswer`) — never a
  reimplementation used only for the verification itself, which would prove nothing.
