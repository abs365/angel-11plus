# Writing Feedback Evidence Compliance Assessment

**Programme:** Angel Assessment Transformation Execution Programme — Release 1, Family Choice Pilot
**Prepared:** 2026-08-11
**Scope:** Inspection only, per explicit instruction. `app/api/writing-feedback/route.ts` has not been modified, redesigned, disabled, or touched in any way by this assessment or by any other part of this pilot.
**Status of this finding:** Not new — first identified and recorded in `CONTINUOUS_WRITING_EVIDENCE_REVIEW_V1.md` §9a during the Personalised Learning investigation (2026-08-10). This document is the required deeper, standalone compliance assessment that finding called for.

---

## 1. What the endpoint actually does (verified by direct code read)

`app/api/writing-feedback/route.ts` is a live, deployed API route. On every Continuous Writing practice submission it:

1. Sends the student's writing, verbatim, to OpenAI (`gpt-4o-mini`, `temperature: 0.3`) inside a system prompt that opens: *"You are an expert writing tutor for the Essex CSSE 11+ selective school entrance examination."*
2. Instructs the model that *"Essex CSSE examiners reward"* six named qualities (originality, technical accuracy, ambitious vocabulary, varied sentence structures, controlled voice, atmosphere).
3. Instructs the model to score the response 0–100 against five hand-written bands (85–100 "Exceptional — confident candidate for selective school entry" down to below 40 "Significant work needed").
4. Returns that score and commentary directly to the student/parent as `WritingFeedback`, with no disclaimer distinguishing it from a real CSSE assessment.

## 2. Compliance check against this program's own evidence standard

Every other piece of CSSE-facing content this programme has produced — the Founder Validation Assessment items, the CSSE Authentic Question Specification, the Full Mock Structure Decision — was required to trace every claim to a specific, cited primary-source Asset ID (an official CSSE paper, mark scheme, or examiners' report), and to disclose explicitly wherever evidence was insufficient (`CONTINUOUS_WRITING_EVIDENCE_REVIEW_V1.md` itself: the official CSSE Continuous Writing mark scheme's Grammar criterion is blank for Bands 1–3, and double-marking/moderation is a real, evidenced part of CSSE's process that no automated single-pass system can reproduce).

The writing-feedback endpoint meets none of this:

| Requirement (this programme's own standard) | This endpoint |
|---|---|
| Every claim traces to a cited CSSE primary source | **No.** The six "Essex CSSE examiners reward" bullets and the 0–100 scoring bands are original prose written into the prompt, with no citation to any CSSE paper, mark scheme, or examiners' report. |
| CSSE attribution only where evidence supports it | **No.** The prompt explicitly attributes these criteria to "Essex CSSE examiners" — a direct, named authority claim with no supporting Asset ID. |
| Evidence gaps disclosed to the family | **No.** The returned `WritingFeedback` carries no disclaimer that the score is an AI-generated estimate, not a CSSE-calibrated mark. |
| Real marking process reflected (double-marking/moderation) | **No** — cannot be, by construction: a single-pass LLM call cannot reproduce a two-marker moderation process. This is a structural limitation, not a prompt-wording one. |

## 3. Why this matters now, specifically

This is a **live, currently-running defect**, not a hypothetical one — every family using Continuous Writing practice today receives a number attributed (by the system's own prompt) to "Essex CSSE examiners," when no such calibration exists. It sits directly upstream of two things this pilot and the wider Assessment Transformation programme both depend on being trustworthy: family confidence in Angel's evidence discipline, and any future claim that Angel's assessment surfaces are CSSE-authentic.

## 4. Options considered (RETAIN / STRENGTHEN / HIDE / DISABLE / REPLACE / RETIRE)

- **RETAIN** (do nothing): rejected — leaves a live, unevidenced CSSE-authority claim in front of real families.
- **RETIRE** (delete the endpoint and feature entirely): rejected — the underlying idea (feedback on writing) has real value; the defect is the CSSE-attribution and score fabrication, not the existence of feedback.
- **DISABLE** (turn the feature off pending a real fix): a legitimate, safe option, but loses real family value (qualitative feedback) that isn't actually evidence-dependent — see below.
- **HIDE** (keep it running but stop surfacing it in the UI): does not fix the live defect for any student who still reaches it via a direct link or old session; not a real fix.
- **REPLACE** (build a new evidence-grounded scoring model): out of scope for this pilot and for the wider Continuous Writing evidence gate — `CONTINUOUS_WRITING_EVIDENCE_REVIEW_V1.md` already found the official mark scheme insufficient for a defensible numeric score at all today.
- **STRENGTHEN** (keep the qualitative feedback, remove the false CSSE-authority claim and the fabricated numeric/banded score): matches the Excellence Model's own TEACHING/PRACTICE-vs-ASSESSMENT split (`CONTINUOUS_WRITING_EXCELLENCE_MODEL_V1.md`) — qualitative, dimension-level feedback (strengths, areas to improve, a suggested upgrade) does not require CSSE-calibration to be honest and useful; a numeric 0–100 score presented as exam-relevant does.

## 5. Recommendation

**STRENGTHEN**, specifically:

1. Remove "Essex CSSE examiners reward" and every other unsupported CSSE-authority phrase from the system prompt — reframe as general, disclosed writing-craft feedback (an "expert writing tutor" giving feedback, not a stand-in CSSE examiner).
2. Remove the 0–100 `overallScore` and its five named bands, OR keep a score only if it is visibly and explicitly labelled as a general writing-quality estimate, not a CSSE mark or CSSE-mark-equivalent, wherever it is displayed to a family.
3. Add an explicit, persistent disclosure wherever this feedback is shown, mirroring the discipline already used elsewhere in this programme (e.g. the production Mock's own "this mock is still being expanded" banner, AEP4-D18's disclosure banner): this feedback is AI-generated writing guidance, not a CSSE-calibrated assessment.

This is a recommendation for the Founder's decision, not an instruction to implement — no change has been made to `app/api/writing-feedback/route.ts` as part of this pilot.

---

## WRITING FEEDBACK COMPLIANCE STATUS: REQUIRES ACTION

A live, real defect exists: unsupported CSSE-authority attribution and a fabricated 0–100 CSSE-relevant score, both currently shown to real families. Not blocking for the Family Choice Pilot (MR-01, a Mathematics competency, has no dependency on this endpoint) — recorded here, separately and explicitly, per the governing instruction.
