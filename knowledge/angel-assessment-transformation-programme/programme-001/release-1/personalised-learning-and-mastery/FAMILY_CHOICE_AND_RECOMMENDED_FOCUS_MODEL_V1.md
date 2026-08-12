# Family Choice and Recommended Focus Model V1

**Programme:** Angel Assessment Transformation Execution Programme — Release 1
**Prepared:** 2026-08-11
**Status:** Design only. No database field created, no code changed. Grounded in `EXISTING_PLATFORM_CAPABILITY_REUSE_ASSESSMENT.md`'s real mechanism inventory, not invented from scratch.

---

## 1. The Three Modes (§2 of the governing instruction)

**A. Angel Recommended Focus** — the output of `orchestrateRecommendations()` (already real, already live), presented with a full explanation via `generateExplanation()` (already real). Nothing new needed to compute this; the gap is entirely on the presentation/agency side (§4 below).

**B. Choose Your Focus** — a family deliberately selects a competency or Question-Type-adjacent area, even where it isn't Angel's top-ranked priority. Mechanically, this is "inject a chosen competency into the same `weakSkills` set the evidence engine already populates" — the selection mechanism this needs already exists (`selectQuestions()`'s `weakSkills` parameter); what's missing is a caller that can populate it from a human choice instead of only from evidence.

**C. Balanced Preparation** — the default/fallback: no override, `orchestrateRecommendations()`'s natural output governs session composition across all components, exactly as today.

**None of these require a second recommendation architecture.** Mode A is the existing pipeline unmodified. Mode C is the existing pipeline's default behaviour, unmodified. Mode B is the existing pipeline with one new input.

## 2. The Provenance Model (§3)

**Design:** every "current focus" state carries a `FocusProvenance` value, name illustrative only (final field/enum naming is an implementation decision, not made here):

- `angel-recommended` — Mode A, unmodified evidence output
- `family-selected` — Mode B, a human chose this
- `balanced` — Mode C, no active override
- `family-selected-with-angel-escalation` — see §4, the combination state

**Hard rule, directly from the governing instruction:** a `family-selected` focus must never be silently relabelled `angel-recommended`, and an `angel-recommended` focus must never silently become the presented focus while carrying `family-selected` provenance. Both are honesty requirements about *why* a focus is current, not just *what* it is — this maps directly onto the "record provenance" instruction and is enforced by keeping provenance a first-class field on whatever eventually represents "current focus," not derived after the fact from other data.

**Where this would live (design only):** a new, small state — one row per profile representing "current focus selection" — is the natural shape (mirrors `ali_student_adaptive_state`'s existing one-row-per-profile convention). Not created in this increment.

## 3. Primary + Secondary Focus (§4)

**Recommendation: one primary focus, up to two secondary focus areas, remainder as maintenance.** Reasoning, not asserted as evidence-backed fact:

- A single primary focus matches how `weakSkills` already works best — it's designed around a *reserved slot* mechanism (Decision 17's 20% floor, `learningUnit.ts`'s top-weight-5 approach), which degrades in meaning if applied to many competencies simultaneously (the reserved floor would have to shrink per-competency, diluting the whole point of prioritisation — directly matching the governing instruction's own concern: "too many focus areas would destroy the purpose of prioritisation").
- Two secondary slots (not zero, not unlimited) mirrors the existing `revisionPlanner.ts`'s `PLAN_ITEM_CAP = 5` precedent — a small, bounded list, not an open one.
- Everything else defaults to **maintenance**, which is not "ignored" — it is the durable-mastery maintenance-review mechanism (§7 companion Blueprint), already real, already evidence-gated.

**This 1-primary + up-to-2-secondary structure is a design recommendation for Founder review, not adopted as final** — the governing instruction explicitly warned against adopting example numbers without evidence, and no learner-outcome evidence exists yet to calibrate this. Flagged as the first thing to validate once any real implementation begins.

## 4. Recommendation vs. Choice Conflict (§6)

**Design for the conflict scenario** (family chose Continuous Writing; Angel's evidence now shows Multi-Step Mathematical Reasoning needs urgent attention):

1. The wellbeing-veto/Tier-0 mechanism already in `orchestrateRecommendations()` is the correct place to detect this — it already runs on every recommendation call, already produces a structured signal, and already has an established "this changes what gets shown" precedent (a veto already suppresses candidates today; an escalation is the same shape, surfacing rather than suppressing).
2. **Angel does not silently switch the focus.** The chosen focus (`family-selected` provenance) remains current until the family acts.
3. The experience presents the situation using the same `generateExplanation()` "what/why/what it would mean/what's next" pattern already used for recommendations generally (§13 Parent Experience) — applied here to explain the *emerging* competing priority, not just the chosen one.
4. Meaningful choices offered, per the instruction's own framing (exact wording not authorised here): keep current focus / add the escalated area as a second secondary focus (if a slot is free) / switch focus / return to balanced preparation. **All four routes are already representable by the provenance model in §2** — no new state category is needed, only a decision point in the experience layer that asks the family, rather than deciding for them.
5. **What must NOT happen:** Angel repeatedly re-surfacing the same escalation after an informed family decision has already been made once (§12 Wellbeing and Control) — this needs a "family was already asked and decided" marker, conceptually adjacent to how `wellbeing.ts`'s veto already avoids re-triggering on the same already-acknowledged pattern. Exact mechanism not designed here — flagged as a required component of any real implementation, not solved by this document.

## 5. Depth Within a Chosen Focus (§5, §8)

Choosing "Continuous Writing" must not collapse Angel into a content catalogue. Per `CONTINUOUS_WRITING_EXCELLENCE_MODEL_V1.md`, within that choice Angel still determines, from evidence where it exists:

- Which of the 5 evidence-supported dimensions (Ideas / Vocabulary+Spelling / Grammar / Structure / Punctuation) needs attention first — this is exactly what `computeEducationalState()` already does per-competency; applying it *within* a chosen subject rather than *across* subjects is a scope change, not a new mechanism.
- What to teach first, what to practise next, when to reassess — the Excellence Model's stage sequence.
- Whether another competency has deteriorated meanwhile — the wellbeing/escalation mechanism in §4, running continuously regardless of the active focus.

**This generalises beyond Continuous Writing:** any Mode B choice should decompose into the chosen subject's own evidenced competency set (where Assessment Brain defines one) and run the same diagnose-within-focus logic — Continuous Writing is the first, most evidence-developed example, not a special case architecturally.

## 6. Explicit Non-Decisions

This document does not: pick final field names, pick a final primary/secondary count with confidence, or specify exact UI copy. Those are implementation-phase and UX-phase decisions respectively, deliberately deferred per the governing instruction's own "final UX wording determined later" framing.
