# AEP-005: Assessment Framework

**Document ID:** AEP-005
**Programme:** Angel Excellence Programme — Discovery Wave (Document 5 of 5)
**Status:** DRAFT — awaiting Founder review and approval
**Project:** Angel 11+
**Owner:** ELBOLD
**Last Updated:** 2026-07-18
**Frozen (APD-007, 2026-07-18):** Version 1.0 Educational Architecture. Future changes require a defect correction, new educational evidence, or a formal programme decision — not a routine edit.
**Governing documents:** `AEP-001_LEARNING_SCIENCE_CONSTITUTION.md`, `AEP-002_KNOWLEDGE_FRAMEWORK.md`, `AEP-003_QUESTION_INTELLIGENCE_FRAMEWORK.md`, `AEP-004_LEARNING_JOURNEY_FRAMEWORK.md` — all APPROVED. This document does not redesign any of them; it defines the assessment-integrity layer that governs how evidence produced throughout the Learning Journey (AEP-004) becomes a mastery claim, a readiness claim, or a parent-facing statement — and, just as importantly, when it must not.

**Purpose:** Define the complete educational assessment architecture for Angel — the standards that decide what counts as evidence, how confident Angel is entitled to be in any given conclusion, and what it means for a claim of mastery or readiness to be earned rather than assumed.

**Standing constraint carried into every section below:** per `ALI_CROSS_SUBJECT_INTELLIGENCE.md` §4.1, direct evidence about a learner's own competency always outranks inference — this document does not weaken that rule anywhere; the Assessment Confidence Model (§6) and Assessment Integrity Rules (§7) below are additional discipline applied *on top of* direct evidence, never a way of manufacturing confidence in its absence.

---

## 1. Assessment Principles

**The foundational principle, stated first because everything else in this document is downstream of it: mastery must never be awarded from a single correct answer.** This is not a new rule — Angel's real, existing mastery mechanism already enforces it (`mastery_threshold` requires correct answers across multiple **distinct sessions**, defaulting to 2 for Easy/Medium and 3 for Hard/Challenge content, `QUESTION_AUTHORING_STANDARD.md` §8) — this document's contribution is making the *reasoning* behind that existing rule explicit and extending the same discipline to readiness and parent-facing claims, not only to the single-question mastery mechanism it currently governs.

Assessment exists to produce genuine evidence of durable, transferable understanding — not a correct answer in the moment, which AEP-001 §2.1 (retrieval practice) already distinguishes sharply from real learning. A single correct answer is *data*; it becomes *evidence of mastery* only once it accumulates with other correct answers across the conditions §7 below specifies (multiple observations, time, context, and — for the strongest claims — transfer).

**Evidence basis:** Strong — directly inherited from AEP-001 §2.1 and this project's own existing, tested mastery mechanism (Decision 20/21).

---

## 2. Baseline Assessment

Extending AEP-004 §4's honest finding that Angel does not appear to have a real baseline/diagnostic assessment at onboarding today: from an assessment-science standpoint, a baseline assessment's entire purpose is to establish a *starting point*, not to produce a mastery verdict. Its output should almost always sit at **Insufficient Evidence** or, at best, **Low Confidence** on the scale defined in §6 — and this is correct, not a shortcoming. Assessment Integrity (§7) requires that a single short baseline session never be treated as sufficient evidence of mastery in anything; its entire value is in seeding the Learner Profile and per-competency confidence bands (AEP-002 §7) with a first, honestly-weak signal, which subsequent Formative Assessment (§3) then builds on.

**A baseline assessment, if built, must be low-stakes by design, not just by framing** — per AEP-001 §2.9/§2.10, a new learner's very first encounter with Angel must not read as a real test. This is a direct constraint on how a baseline is *administered*, not only on how its results are treated afterward.

---

## 3. Formative Assessment

The day-to-day Practice and Retrieval loop (AEP-004 §7) is Angel's formative assessment engine: ongoing, low-stakes, retrieval-based (AEP-001 §2.1), and its primary purpose is to *inform what happens next* — adaptive question selection, Daily Mission urgency, competency confidence bands — not to gate a final judgement. Every attempt recorded in `ali_student_question_history` is a piece of formative evidence, cited here as the existing, correct mechanism.

**Formative evidence accumulates toward — but is not automatically equivalent to — summative readiness.** A learner can show strong formative evidence in a competency (consistently correct in low-stakes practice) while still lacking summative evidence that the same competency holds up under real exam-format pressure (§4). Both are genuine but distinct kinds of evidence, and Assessment Integrity requires not conflating them.

---

## 4. Summative Assessment

The Assessment Journey's full timed mock exams (AEP-004 §8) are Angel's summative assessment mechanism — higher-stakes, format-matched (in principle; AEP-002 Real Gap #6's format-fluency gap remains unresolved by this document, restated not re-solved), and the primary evidence source for Examination Fluency specifically (AEP-002 §11's third readiness dimension). Formative and summative assessment are genuinely different tools answering genuinely different questions — "what should this learner practise next" versus "is this learner ready for the real thing" — and this document formalises that distinction explicitly, since neither AEP-002 nor AEP-004 used this exact vocabulary even though the underlying mechanisms (Practice vs. Mock Exam) already existed correctly.

---

## 5. Adaptive Assessment

ALI's existing adaptive engine — between-mock difficulty and content selection driven by accumulated formative evidence (`ADAPTIVE_ASSESSMENT_ENGINE_ARCHITECTURE.md`) — is cited as correct and unmodified. **A terminology note worth stating explicitly, in the same spirit as AEP-002 §14's Terminology Governance:** "adaptive" means two genuinely different things in this programme's own vocabulary — Angel's own between-mock personalisation (adjusting *which* content is served next, based on accumulated evidence) versus ISEB's within-session test adaptivity (adjusting difficulty *during* a single sitting based on the immediately preceding answer, AEP-002 §6). These should not be conflated when discussing "adaptive assessment" — Angel's current adaptivity is real and evidence-based, but it is not the same mechanism ISEB's own exam uses, and AEP-004 §8 already flagged closing that specific gap as a future, board-specific task this document does not resolve.

---

## 6. Assessment Confidence Model

**The core new architecture this document adds, per Programme Decision APD-005 item 1.**

Every educational conclusion Angel reaches about a specific learner — a mastery claim, a readiness signal, a parent-facing statement — must be classified into exactly one of four tiers:

| Tier | What it means | Representative real signal |
|---|---|---|
| **High Confidence** | Evidence meets the full Assessment Integrity standard (§7): multiple distinct-session observations, spread across genuine time gaps, ideally corroborated across a transferred context | Mastery threshold met across sessions with real time-spread, `avg_success_rate` stable, and (where applicable) a transfer-linked competency (AEP-002 §10) also performing consistently |
| **Moderate Confidence** | Mastery threshold technically met, but observations are clustered in time, or from only one context, with no transfer corroboration yet | A competency just reached `mastered` in consecutive practice sessions within a short window — real evidence, but not yet the fuller standard |
| **Low Confidence** | Some real evidence exists but falls short of the mastery threshold, or comes from a low-`confidence_weight` (easily guessable) format | A handful of correct answers on a guessable question type, or a competency only recently attempted for the first time |
| **Insufficient Evidence** | Little or no real attempt data exists for this competency yet | A brand-new learner's untouched competencies; the honest `null` state `LEARNING_PROFILE_MODEL.md` already models correctly for several of its dimensions |

**This is a genuinely different scale from AEP-001's Evidence Strength rating (Strong/Moderate/Contested) — the two must not be confused.** AEP-001's scale rates the *quality of published research* behind a general pedagogical principle (e.g. "is retrieval practice well-evidenced *in general*"). The Assessment Confidence Model here rates *how much real evidence exists about this specific learner's specific competency, right now*. A principle can be Strong (AEP-001) while a particular learner's evidence for it is still Insufficient (AEP-005) — these are orthogonal, and any future document combining both scales must keep them clearly labelled and never merge them into one number.

**The governing behavioural rule, stated as the direct answer to APD-005's instruction:** the platform must never phrase a recommendation, a parent-facing claim, or a Daily Mission's reasoning more confidently than the underlying tier supports. A Low Confidence or Insufficient Evidence conclusion must never be voiced with High Confidence language — this is not a tone preference, it is an integrity requirement, and §11–§12 below make it concrete in feedback and parent-reporting language specifically.

---

## 7. Assessment Integrity Rules

Per Programme Decision APD-005 item 2, each required principle stated and mapped to Angel's real or proposed mechanism:

| Principle | How Angel satisfies or should satisfy it |
|---|---|
| **Sufficient evidence before mastery** | `mastery_threshold`, already built and unmodified (§1) |
| **Multiple observations** | "Distinct sessions" requirement, already built (Decision 20/21) — never one lucky answer |
| **Evidence across time** | ALI's existing cooldown/spacing mechanism (AEP-001 §2.2) ensures observations aren't clustered in one sitting; AEP-004 §9's Knowledge Maintenance Model extends this further, checking evidence still holds after a genuine gap |
| **Evidence across contexts** | New emphasis this document adds: evidence in a transfer-linked competency (AEP-002 §10) is a *different context* for the same underlying mechanism, and corroborating evidence across contexts should raise confidence (§6) beyond what same-context repetition alone provides |
| **Transfer validation** | AEP-004 §10's Learning Transfer Journey, made an explicit assessment-integrity input here: a learner who can apply a competency in a transferred context has stronger validated evidence than one who has only ever seen it in its original form |
| **Confidence thresholds** | The Assessment Confidence Model itself (§6) |
| **Durable mastery validation** | AEP-004 §9.6's Durably Mastered concept, fully operationalised in §10 below |
| **Never from a single correct answer** | Restated as the hard floor underneath every other principle in this table — already true structurally, and this document adds no exception to it anywhere |

**Evidence basis:** the existing mechanisms cited (mastery threshold, distinct sessions, cooldown-as-spacing) are Strong, already-validated architecture. The "evidence across contexts" and "transfer validation" extensions are Moderate — a defensible, evidence-consistent extension of AEP-001 §2.12, not yet independently validated against Angel's own student population.

---

## 8. Evidence Collection

Not all recorded activity is equally valid evidence, and this document makes an explicit distinction Angel's existing architecture already implies but has not stated directly: a **graded, machine-checked answer** (any MCQ/short-answer question across VR/Maths/English/NVR/SR/`numreason`) is real evidence within the meaning of this framework; a **self-report** (Vocabulary's existing flashcard "I knew it" / "Still learning" click, `VOCABULARY_COMPETENCY_FRAMEWORK.md` §1) is not, on its own, evidence of the same weight — it reflects a learner's *belief* about their own knowledge, not a verified outcome, and self-reported confidence is well known to diverge from actual accuracy (this is precisely the "confidence vs. accuracy gap" `LEARNING_PROFILE_MODEL.md` §1 already flags as a dimension it cannot yet compute for exactly this reason). Self-reported activity may inform engagement or motivation signals, but must never independently satisfy §7's evidence-across-observations standard for a mastery claim.

**Evidence basis:** Moderate-to-Strong — the general finding that self-assessed confidence diverges from measured accuracy is well-established in educational and cognitive-science literature broadly (related to, though distinct from, the metacognition literature already cited at AEP-001 §2.8); this document's specific application to Angel's Vocabulary flashcard activity is a direct, defensible inference from that literature rather than an independently cited study of Angel's own data.

---

## 9. Mastery Decisions

A mastery decision — the point at which Angel treats a competency as `mastered` for a specific learner — is only made when both conditions hold: (a) the existing `mastery_threshold` mechanism's distinct-session requirement is satisfied (§1, unmodified), and (b) the resulting Assessment Confidence tier (§6) is at least **Moderate**. A technically-threshold-meeting result that nonetheless reflects only Low Confidence evidence (e.g. threshold met entirely on a highly guessable question format) should not be treated identically to a Moderate-or-above result for downstream purposes such as Parent Assessment Reporting (§12) or Readiness Assessment (§13) — this is an additive refinement to existing behaviour, not a change to the `mastery_state` mechanism itself, which continues to operate exactly as `QUESTION_AUTHORING_STANDARD.md` §8 already specifies.

---

## 10. Durable Mastery Validation

Fully operationalising AEP-004 §9.6's Durably Mastered concept as the capstone of Assessment Integrity — the point where "evidence across time," "evidence across contexts," and "transfer validation" (§7) combine into a single, named standard:

A competency is **Durably Mastered** for a specific learner when:
1. It currently holds `mastered` state under the existing, unmodified mechanism (§1, §9);
2. It has survived at least one genuine-gap Maintenance Review (AEP-004 §9.2) — real retrieval evidence after time has passed, not merely the original mastery-earning sessions themselves; and
3. Where a real, at-least-Moderate-strength transfer link exists (AEP-002 §10), the learner has also shown correct performance in that linked competency — corroborating evidence across a genuinely different context, not just repetition of the same one.

Condition 3 is the highest bar and is **not required** for Durable Mastery where no meaningful transfer link exists for a given competency (some competencies genuinely have no strong linked partner, AEP-002 §10) — Durable Mastery in that case rests on conditions 1–2 alone, and this document does not manufacture a transfer requirement where AEP-002's own evidence-grounded graph doesn't support one.

**Why this matters for the whole-child readiness judgement (§13):** a Grammar School Readiness claim built on ordinary `mastered` competencies alone is weaker evidence than one built on Durably Mastered competencies — the exam is, itself, a delayed, high-stakes, single-sitting retrieval event (AEP-001 §2.1's own framing), and Durable Mastery is the closest evidence standard this framework can construct to that real condition without literally re-running the exam early.

---

## 11. Feedback Architecture

Extending `AEP-003_QUESTION_INTELLIGENCE_FRAMEWORK.md` §11 (Feedback Intelligence) and AEP-001 §2.5 with the Assessment Confidence Model: feedback language must be calibrated to the underlying confidence tier (§6), not just to whether an answer was correct. A single correct answer on a brand-new competency (Insufficient/Low Confidence) should be encouraged in the moment but must never be phrased as if it demonstrates mastery ("you've got this!" is honest; "you've mastered this" is not, yet). This is a direct, concrete extension of `ANGEL_MOMENTUM_FRAMEWORK.md`'s existing "momentum must never override honesty" rule — confidence-tier-calibrated language is how that rule is satisfied specifically in feedback copy, not a new rule competing with it.

**This calibration must remain entirely invisible as a mechanism**, per `ANGEL_EXPERIENCE_MANIFESTO.md`'s Invisible Intelligence doctrine — a child is never shown a confidence tier, a percentage, or the word "evidence." The *effect* (warmer, more definite language once evidence is genuinely strong; warm-but-provisional language while it's still building) is felt; the *mechanism producing that effect* is never surfaced.

---

## 12. Parent Assessment Reporting

Extending `AEP-004_LEARNING_JOURNEY_FRAMEWORK.md` §12 (Parent Intelligence) with the same confidence-calibration discipline as §11, applied to parent-facing claims specifically: a parent must never be told "your child has mastered Percentages" when the underlying evidence sits at Low or Moderate Confidence — the correct, honest phrasing at that tier is closer to "your child is showing early strength in Percentages," reserving the more definite claim for when evidence genuinely reaches High Confidence, ideally Durable Mastery (§10) for the most consequential claims (e.g. anything feeding a readiness statement, §13).

**This is a direct, load-bearing application of `ANGEL_EXPERIENCE_MANIFESTO.md`'s own standing test** — "nothing ships that a parent can't fully trust" — applied specifically to the risk that a confidently-worded but weakly-evidenced claim, once shown to be wrong (a "mastered" competency that turns out not to have survived contact with a real exam), damages exactly the trust the Manifesto identifies as Angel's entire long-term asset. Confidence-calibrated language is not a hedge that makes Angel seem less capable — it is what makes every claim Angel *does* make with full confidence actually trustworthy.

---

## 13. Grammar School Readiness Assessment

Operationalising AEP-002 §11's six-dimension Readiness Definition (as extended by §11.6, Learning Independence) as something formally *assessed*, not just conceptually true:

| Dimension | Evidence standard required |
|---|---|
| Content Coverage | Representative attempt coverage across every domain the learner's selected pathway actually requires (AEP-002 §6, AEP-004 §3) — a coverage fact, not a confidence-tiered claim in itself |
| Competency Mastery | Durable Mastery (§10), not merely `mastered`, across a representative competency sample per required domain |
| Examination Fluency | Summative evidence (§4) from mock exams under conditions resembling the real target board's format — the clearest area where Angel's current evidence is honestly incomplete, pending the format-fluency gap (AEP-002 Real Gaps #6, AEP-004 §8) |
| Transfer & Resilience | Transfer-validated evidence (§7, §10 condition 3) plus observed recovery from setbacks without confidence collapse (AEP-001 §2.9) |
| Confidence & Wellbeing | A qualitative, monitored signal — deliberately **not** reduced to a single score, consistent with its status as a permanent ceiling (AEP-001 §2.9/§2.10) rather than one more metric to optimise |
| Learning Independence | A trajectory judgement (is guidance appropriately reducing as maturity grows, AEP-002 §11.6) rather than a pass/fail threshold |

**The whole-child readiness verdict's own confidence is the minimum, not the average, of its dimensions' evidence confidence.** A learner with High Confidence Competency Mastery but only Low Confidence Examination Fluency evidence (because format-matched mocks don't fully exist yet, per the standing gap) should have their overall readiness statement reflect that specific limitation honestly, not an averaged score that quietly launders a genuinely weak dimension into an overall-acceptable-looking number. This is the direct, whole-child application of Assessment Integrity (§7) and the single most consequential place in this entire framework where overclaiming would be most damaging to get wrong.

---

## 14. Continuous Assessment Cycle

Distinct from the learner's own Knowledge Maintenance (AEP-004 §9): this is the assessment *standards'* own review cycle. Consistent with AEP-004 §14's Continuous Improvement Loop, this document adds no new mechanism — it confirms that mastery thresholds, confidence-weight defaults, and the Assessment Confidence Model's own tier boundaries (§6) are themselves candidates for the "Flagged for Review" treatment (`AEP-003_QUESTION_INTELLIGENCE_FRAMEWORK.md` §14) once real calibration data exists, and should be revisited against the `docs/research/` evidence library (AEP-002's recommendation) once the pending programme materials migrate — assessment standards are themselves assessed against real evidence over time, not fixed permanently by this document.

---

## 15. Educational Outcome

*(Required section per AEP-001 §8.)*

**Understanding:** this document gives Angel a single, explicit standard for what counts as evidence, closing a gap that existed even after AEP-001–AEP-004: those documents established *what* to teach, *how* questions carry intelligence, and *what journey* a learner follows, but not, until now, precisely *how confident Angel is entitled to be* in any conclusion it reaches along the way.

**Confidence:** the Assessment Confidence Model (§6) and its consequences for feedback (§11) and parent reporting (§12) exist specifically so that every claim Angel makes — to a learner or a parent — is exactly as confident as its evidence, never more. This is the direct mechanism by which `ANGEL_EXPERIENCE_MANIFESTO.md`'s trust standard is protected against the single failure mode most likely to erode it: a confidently wrong claim.

**Examination performance:** Durable Mastery (§10) and the Grammar School Readiness Assessment's minimum-not-average rule (§13) together ensure a readiness claim reflects genuine, exam-realistic evidence — including honestly surfacing the format-fluency gap rather than letting a strong Competency Mastery score mask a weak Examination Fluency one.

**Long-term learning:** Assessment Integrity's "evidence across time and contexts" standard (§7) is, itself, the assessment-side mirror of AEP-001's spacing and transfer evidence — an assessment framework that only ever checked immediate, single-context correctness would silently validate exactly the kind of shallow, non-durable learning this entire programme exists to move Angel away from.

---

This document completes the Angel Excellence Programme Discovery Wave (AEP-001 through AEP-005). No implementation follows from any of the five documents directly — each is delivered for review, and together they form the governing educational architecture for all future Angel development. Awaiting programme review.
