# WP-21: Wellbeing Design

**Document ID:** WP-21
**Programme:** Angel Excellence Programme — Engine Integration Programme (IWP-002), Wave H
**Status:** DRAFT — design and verification artefact only. **No implementation in this document.** Per explicit instruction, this is design-only unless a future, separate, formal programme decision expressly authorises building any part of it.
**Project:** Angel 11+
**Owner:** ELBOLD
**Last Updated:** 2026-07-18

**Purpose:** Define the educational and safeguarding model behind Recommendation Orchestration's Tier 0 wellbeing veto (`EAW-004` §4–§5, `WP-09`'s `WellbeingVeto` predicate) — the single highest-stakes design decision in this whole programme, per `IWP-002` §5's own flag. WP-19 (Recommendation Orchestration Runtime Integration) may not begin until this design is reviewed and a genuine implementation exists behind Tier 0 — Programme Decision APD-034, Safety Before Recommendation.

**The one sentence that governs everything below:** this is a study-pattern signal that adjusts how hard Angel pushes a specific recommendation right now — it is not, and must never become, a mental-health, clinical, or safeguarding assessment tool.

---

## 1. What this is, and what it is explicitly not

**In scope:** a narrow, behavioural, in-app-usage-pattern heuristic answering one bounded question — *"given this specific competency, this specific recommendation, and this learner's recent in-app pattern, is now a reasonable moment to ask for more effortful practice, or should Angel ease off?"* This is Educational Wellbeing Support: a product-level adjustment to pacing and difficulty, grounded entirely in study behaviour already visible to the app.

**Explicitly out of scope, stated as a hard boundary, not a soft preference:**
- **Not a diagnosis.** This signal must never produce, store, or imply a claim like "this child has anxiety" or "this child is depressed." It has no clinical validity, was not designed by anyone qualified to make such a claim, and using it that way would be a serious misuse regardless of how the underlying data looks.
- **Not a safeguarding tool.** It must never attempt to detect abuse, neglect, self-harm risk, or any welfare concern beyond ordinary academic frustration. If a genuine safeguarding concern ever needs to be raised, that happens through real human channels (a parent's own judgement, a school, or child-safeguarding services) — never through an automated in-app signal claiming to have detected one.
- **Not a crisis-response system.** Angel has no mechanism to intervene in a real emergency and must never imply that it does.

This distinction (§1) governs the interpretation of every other section in this document. Where a candidate design choice risks blurring it, that choice is rejected below, not adopted with a caveat.

---

## 2. No fabricated score

Restated as the absolute constraint it already is (`AEP-005` §13, `WP-09`'s own honest scoping): **there is no numeric wellbeing score anywhere in this design, including internally.** No 0–100 value, no weighted composite, no hidden number a UI merely doesn't show. The signal this document proposes is a small set of named, independently-inspectable boolean/categorical flags (§6), because a single composite number is exactly the kind of "reduced to a score" AEP-005 §13 already prohibits, and because a composite number is much easier to accidentally over-trust than a named, falsifiable condition.

---

## 3. Valid input signals and their provenance

Every candidate input below is checked against what this codebase can *actually* observe today, distinguishing real, already-captured data from genuine capture gaps — the same honesty discipline this whole programme has applied throughout.

| Candidate signal | Provenance | Status |
|---|---|---|
| Learning Gain trend (`aliLearningGain`, `ALI_PARENT_INTELLIGENCE.md` Phase 1.4) | Already computed, already capable of going negative on regression | **Real, available today** |
| Consecutive incorrect attempts within a session | `ali_student_question_history.last_attempt_correct`/`second_last_attempt_correct` | **Real, available today**, though only the last 2 outcomes are retained per question, not a full within-session streak — a genuine limitation, not fabricated around |
| A mastered competency reverting (`"rebuilding"` Educational State, WP-08) | Already computed | **Real, available today** |
| Session abandonment (started a mock/practice session, never completed it) | Not currently tracked as a distinct event anywhere in this codebase | **Real capture gap** — would need a new, small event (e.g. an Operational Event, WP-11, logged on session start vs. completion) |
| Within-session response time / hesitation patterns | No per-attempt timestamp log exists (`LEARNING_PROFILE_MODEL.md` §1's own honest finding, restated here) | **Real capture gap**, and one of the more consequential ones — a child rushing through guesses versus a child stuck and frustrated look identical without this |
| Direct self-report ("how did that feel?") | Does not exist anywhere in the app today | **Real capture gap**, and per §9 (Metacognition, AEP-001 §2.8) an 8–11-year-old's self-report of their own emotional state is not reliably accurate at this age regardless — a signal to treat cautiously even if built |

**Provenance rule:** every input this signal ever uses must trace to one of these named, real (or explicitly-flagged-as-not-yet-built) data points. No input may be "a general sense" derived from multiple sources in a way that can't be individually inspected and attributed.

---

## 4. Consent and access boundaries

- **Never shown to the child.** Consistent with Invisible Intelligence — and for an additional, wellbeing-specific reason worth naming: a child who becomes aware their emotional state is being monitored by the app could itself become a source of anxiety, directly undermining the exact goal this signal exists to serve (AEP-001 §2.9).
- **Parent-visible only as an already-designed, qualitative flag** — `wellbeingSignal: "steady" | "may benefit from a lighter week" | null` (`AIW-001` §9, already committed in WP-12, currently always `null` because no real signal exists yet). This document does not propose changing that field's shape — only, eventually, what computes it.
- **No new data leaves the existing anonymous-device/profile model** by default. This signal is computed from data the app already holds about that profile; it does not require or propose any new account linkage, third-party data share, or cloud-based sentiment analysis service.
- **Unresolved, flagged for Founder decision (§11):** whether a feature this sensitive warrants its own explicit parent-facing disclosure or opt-in, separate from Angel's general terms — this document does not resolve that question, only names it.

---

## 5. Missing-data behaviour

Fails open, toward *not* vetoing — the same "absence is never fabricated as a finding" discipline every other honestly-optional signal in this programme already follows (`transferCorroborated`, `matchesExamFormat`, `wellbeingSignal` itself). If no qualifying pattern is observed, Tier 0 does not veto. This is a deliberate asymmetry (§8 explains why), not an oversight — the system is not required to affirmatively prove a learner is "fine" before proceeding, only to actively hold back when a real, named condition is met.

---

## 6. Proposed Tier 0 veto conditions (candidate rules, none yet validated)

Stated as specific, named, falsifiable conditions — never a blended score — consistent with §2:

- **Condition A — Compounding failure:** 3 or more consecutive incorrect attempts within the same session, on the same competency, where the competency was previously `"learning"` or better (i.e., this isn't the learner's first-ever contact with genuinely new material, which is expected to include failure) → veto further Hard/Challenge-tier recommendations for that competency this session; Automatic-tier (Practising/Reinforcing-appropriate) content remains eligible.
- **Condition B — Mastery reversal amid low engagement:** a competency entering `"rebuilding"` (WP-08) combined with a negative Learning Gain trend for that subject → veto recommending that specific competency again this session; a different, unrelated competency remains eligible.
- **Condition C — Session abandonment pattern:** *(depends on the capture gap named in §3)* two or more recent sessions started and not completed → veto Hard/Challenge-tier content broadly for a short period, favour Easy/Moderate re-engagement content instead.

**None of these three conditions has been validated against real learner data.** They are candidate rules grounded in this programme's existing evidence base (AEP-001 §2.1/§2.2/§2.9), not yet proven to correctly distinguish genuine strain from ordinary productive difficulty (AEP-001 §2.2–2.4's own "desirable difficulty" evidence, which this signal must not accidentally suppress — see §8).

---

## 7. Escalation boundaries

**The hard line, stated once and governing everything downstream:** the *only* action this signal may ever cause the product to take is adjusting recommendation pacing/difficulty and, at most, surfacing a gentle, generic, non-clinical prompt to a parent (e.g. within the existing `wellbeingSignal` field's own "may benefit from a lighter week" phrasing). **It must never:**
- Contact any third party (school, authority, crisis service) automatically.
- Present itself to a parent as having identified a specific concern beyond "a lighter week might help."
- Suggest, imply, or recommend any clinical, therapeutic, or diagnostic action.

If a genuine, serious welfare concern ever needs to be raised, that is a human judgement made by a parent or a professional — Angel's role stops at declining to push harder and, at most, gently naming that something seems harder than usual lately.

---

## 8. False-positive and false-negative risk, and the deliberate asymmetry between them

- **False positive** (vetoing when the learner is actually fine, or is experiencing ordinary productive struggle): cost is a missed practice opportunity and a slightly gentler session than necessary — low-stakes, self-correcting the moment real evidence resumes.
- **False negative** (failing to veto when the learner is genuinely struggling): cost is exactly the harm AEP-001 §2.9/§2.10 exist to prevent — a child pushed past productive difficulty into genuine distress.
- **Design bias, stated explicitly:** given this asymmetry, every condition in §6 is intentionally written to be somewhat trigger-happy rather than conservative — false positives are the acceptable, cheaper failure mode here, consistent with AEP-001 §2.10's framing that a score gained at the cost of increased anxiety is self-defeating on the exam's own terms, let alone on any broader wellbeing basis.
- **A real, named tension this document does not resolve:** AEP-001 §2.2–2.4's own "desirable difficulty" evidence says productive struggle is necessary for learning — a wellbeing signal tuned too aggressively could suppress exactly the difficulty the rest of this architecture is built to provide. This tension is real, not glossed over, and is one reason §6's conditions require *compounding* evidence (repeated failure, not a single wrong answer) rather than firing on the first sign of any difficulty at all.

---

## 9. Audit requirements

Every Tier 0 veto that actually fires is a Higher-Evidence-Required-adjacent decision in spirit (it materially changes what a learner is shown) and should write to the Educational Audit trail (`WP-11`/`WP-16`, already built). **A genuine gap this design surfaces, not resolved here:** the existing `ConclusionType` enum (`"mastery" | "durable-mastery" | "recommendation" | "readiness-dimension"`) has no value fitting a wellbeing veto specifically. Recommend a future schema addition (a new enum value, e.g. `"wellbeing-veto"`) once implementation is authorised — not added speculatively now, per the standing "additive only, when actually needed" discipline this programme has held throughout.

---

## 10. Distinguishing educational wellbeing support from clinical/safeguarding concerns (consolidated)

Restated once more, consolidated, because this is the single most important property of the whole design: this signal observes *study patterns* (repeated failure, disengagement, mastery reversal) and adjusts *study recommendations* (pacing, difficulty). It has no access to, and makes no claim about, anything outside that boundary — not mood, not home life, not mental health, not safety. Every section above was written to keep that boundary explicit rather than letting a well-intentioned feature quietly drift into territory it has no business or competence to occupy.

---

## 11. Unresolved questions (recorded explicitly, not smoothed over)

1. Should this feature require its own explicit parent disclosure/opt-in, separate from Angel's general terms, given its sensitivity (§4)? Not resolved here — a Founder decision, possibly requiring legal input given this touches children's data specifically.
2. Is a formal review of this design against UK safeguarding/GDPR guidance for children's digital products warranted before any implementation, given the subject matter? Named here as a real possibility, not performed — outside this document's own competence to assess.
3. Session-abandonment tracking (Condition C, §6) and within-session response-time capture (§3) are both real, currently-absent data points — should either be built specifically to support this feature, or should Tier 0 launch without them, relying only on Conditions A/B?
4. What is the right cadence/threshold for surfacing "may benefit from a lighter week" to a parent — every time a veto fires, or only after a sustained pattern? Not decided here.
5. Should there be a simple, direct way for a parent to signal "we know why this is happening, please don't ease off" (an override), given §5's fail-open default already means the system rarely blocks progress without real cause — or would an override risk undermining the safety ceiling this whole design exists to protect?

---

## 12. What this document authorises

**Nothing beyond itself.** No code, schema, or migration is created here. Per the explicit instruction, WP-19 (Recommendation Orchestration Runtime Integration) remains blocked until a genuine Tier 0 implementation exists — and per this document's own §11, several open questions likely warrant a further Founder decision before that implementation begins, not just a technical build against §6's candidate rules as written.

---

Awaiting independent assurance review before any further work.
