# AEP-003: Question Intelligence Framework

**Document ID:** AEP-003
**Programme:** Angel Excellence Programme — Discovery Wave (Document 3 of 5)
**Status:** DRAFT — awaiting Founder review and approval
**Project:** Angel 11+
**Owner:** ELBOLD
**Last Updated:** 2026-07-18
**Frozen (APD-007, 2026-07-18):** Version 1.0 Educational Architecture. Future changes require a defect correction, new educational evidence, or a formal programme decision — not a routine edit.
**Governing documents:** `AEP-001_LEARNING_SCIENCE_CONSTITUTION.md` (APPROVED, amended APD-002), `AEP-002_KNOWLEDGE_FRAMEWORK.md` (APPROVED, amended APD-003). This document does not replace `QUESTION_AUTHORING_STANDARD.md` — it is the evidence and intelligence layer sitting above it. Where the Authoring Standard already specifies a field (`id`, `subject`, `skill`, `pathway`, `content_difficulty`, `estimated_time_seconds`, `confidence_weight`, `explanation`, `hint`, `mastery_threshold`), this document cites it and explains the *educational reasoning* behind it, extends it to pathways and domains it doesn't yet cover, and adds the dimensions no existing document defines at all (misconception mapping, cognitive demand, lifecycle, adaptive recommendation rules).

**Purpose:** Define the complete intelligence model for every question in Angel — not a new metadata schema, but the single framework explaining what every question *is*, what it *knows about itself*, and how that self-knowledge should drive selection, feedback, and recommendation, across every domain (AEP-002 §1–§2) and every pathway (AEP-002 §13).

---

## Educational Outcome

*(Required section per AEP-001 §8.)*

**Understanding:** a question is not just a content item to be answered — it is a carrier of competency evidence, misconception diagnosis, difficulty calibration, and pathway relevance simultaneously. This framework makes each of those roles explicit and connects them to a real governing document (AEP-001/AEP-002), so a future question-authoring or engineering decision can check itself against a coherent model rather than an ad hoc field list.

**Confidence:** by formalising Misconception Mapping (§4) and Feedback Intelligence (§11), this framework moves Angel's feedback from "correct/incorrect + a rule explained" toward "correct/incorrect + the *specific misunderstanding* named and corrected" — the single highest-leverage lever AEP-001 §2.5 identifies for building a family's confidence that Angel understands exactly what their child needs.

**Examination performance:** Examination Pathway Mapping (§8) and Timing Expectations (§9) ensure every question's practice value is graded against the *specific* board format a learner will actually sit, not a generic "11+ difficulty," directly serving AEP-002 §11's Examination Fluency readiness dimension.

**Long-term learning:** Learning Transfer Links (§7) and Cognitive Demand Levels (§6) ensure questions are understood not just as isolated practice items but as nodes in a transfer network and a thinking-skill spectrum — both required for retention and application beyond the single exam sitting (AEP-001 §2.2, §2.3, §2.12).

---

## 1. Question Identity

Every question has a permanent, stable identity — this is not new; it is `QUESTION_AUTHORING_STANDARD.md` §1's `id` field (never reassigned, never reused after retirement) and `subject` field, cited here as the foundation this framework builds on. This document adds one clarification required by AEP-002's expanded domain map (§2.3–2.5): the `subject` value set must now include `non-verbal-reasoning`, `spatial-reasoning`, and `numerical-reasoning` (Angel's internal `numreason` subject, publicly labelled "Mathematical Reasoning" per AEP-002 §14's Terminology Governance) as first-class values with the same identity guarantees VR and Maths already have, even though those three domains have no per-question tagging pass yet (AEP-002 §2.3's honest gap).

**Educational evidence vs. implementation decision:** the *existence* of a stable, permanent, non-reused identifier is an implementation decision (a database/engineering convention) with no direct pedagogical evidence claim attached to it — it is good practice, not a cited finding. It is included here because every other layer of this framework (misconception history, calibration drift, lifecycle tracking) depends on identity being stable over time.

---

## 2. Knowledge Mapping

Every question maps to exactly one Knowledge Domain from AEP-002 §1's eight-domain map (Verbal Reasoning, Mathematics, English, Vocabulary, Non-Verbal Reasoning, Spatial Reasoning, Mathematical Reasoning/`numreason`, Writing). This mapping is mechanical, not a judgement call — it is simply which real data file/bank a question belongs to (`QUESTION_AUTHORING_STANDARD.md` §1's `subject` field, cited above). Where a domain has zero content today (Writing has no gradable mechanic at all, AEP-002 §1) or is not yet mapped to any pathway (Independent School, Custom Programme, AEP-002 §13), this framework's Knowledge Mapping simply has nothing to map yet — named as an open item, not force-filled.

---

## 3. Competency Mapping

Every question maps to exactly one primary competency code, drawn from AEP-002 §2's closed vocabulary of 63 named competency codes across all eight domains — this is `QUESTION_AUTHORING_STANDARD.md` §1's `skill` field, and the "one primary competency per question" rule already established for Verbal Reasoning, Mathematics, English, and Vocabulary (`QUESTION_AUTHORING_STANDARD.md` §11.3, `ENGLISH_COMPETENCY_FRAMEWORK.md` §4, `VOCABULARY_COMPETENCY_FRAMEWORK.md` §5) now extends, by the same rule, to Non-Verbal Reasoning (`nvr.*`, AEP-002 §2.3), Spatial Reasoning (`sr.*`, §2.4), and Mathematical Reasoning (`numreason.*`, §2.5) — none of which have had a real tagging pass yet.

**Educational evidence vs. implementation decision:** *which* competency a question tests is a curriculum/content judgement (educational), grounded in AEP-002's domain analysis; *that* the field is a single closed-vocabulary string rather than a free-text tag or multiple values is an implementation/schema decision, chosen to keep weak-skill detection and mastery tracking unambiguous (`QUESTION_AUTHORING_STANDARD.md` §3's own stated reason for rejecting the generic `SkillType` field).

---

## 4. Misconception Mapping

**New in this framework — no prior document defines this field.** AEP-002 §4 catalogues real, evidence-grounded misconceptions per domain (fraction-as-two-numbers, place-value regrouping errors, retrieval/inference conflation, phonetic-similarity-as-synonym, the "NVR is fixed ability" mindset, and per-competency VR errors already in `QUESTION_AUTHORING_STANDARD.md` §3). This framework recommends a new optional metadata field, `addresses_misconception`, linking a question to the specific misconception (from AEP-002 §4's inventory) it is deliberately designed to surface or correct — distinct from the existing `explanation` field, which explains the *rule*; this field would record *which specific wrong belief* the question is diagnostic of.

**Why this is worth adding, not just documenting the existing error-column informally:** a question tagged this way lets Feedback Intelligence (§11) respond to a wrong answer with the *named misconception* corrected explicitly, rather than only the correct rule restated — the difference between "the answer was 49, here's why" and "the answer was 49 — if you got 47, you may have added 7 twice instead of squaring it, here's the difference." This is a direct application of AEP-001 §2.5's feedback-specificity evidence at the most granular level this framework reaches.

**Explicitly not mandatory retroactively:** retagging Angel's existing ~172 questions against this new field is a real authoring task, not something this Discovery Wave document performs — consistent with the standing "do not automate metadata generation" principle (`QUESTION_AUTHORING_STANDARD.md`'s own precedent, Decision 3). This section defines the field and its justification; a future authoring pass populates it.

**Educational evidence vs. implementation decision:** which misconceptions exist and are worth targeting is educational (AEP-002 §4, itself rated Strong/Moderate per domain); that this is implemented as a single optional link field rather than, say, a full diagnostic branching tree is an implementation-scope decision, chosen to keep the addition additive to the existing schema rather than requiring a redesign.

---

## 5. Difficulty Classification

Reuses `QUESTION_AUTHORING_STANDARD.md` §4's existing rubric (`easy`/`medium`/`hard`/`challenge`, defined by reasoning steps and guessability, not question length or vocabulary rarity) without modification for Verbal Reasoning and Mathematics, where full calibration tables already exist (§4.2, §11.4). For Non-Verbal Reasoning, Spatial Reasoning, and Mathematical Reasoning (`numreason`), this framework confirms the same general rubric (§4.1) applies in principle but confirms — rather than silently assumes — that the subject-specific calibration tables (the equivalent of §4.2/§11.4's worked guidance) do not exist yet for these three domains, matching AEP-002 §2.3's honest gap. This is named as an open item for a future extension of `QUESTION_AUTHORING_STANDARD.md`, not resolved here.

**A constitutional constraint this section must restate, not merely reference:** per AEP-001 §2.9 (exam anxiety) and §2.10 (Educational Safety Principle, APD-002), difficulty classification measures reasoning load, never anxiety-inducing presentation. A `challenge`-tier question that is difficult because it is confusingly worded rather than genuinely more demanding is a writing defect (`QUESTION_AUTHORING_STANDARD.md` §4.3), and — per §2.10 specifically — a difficulty escalation that measurably increases dread rather than productive challenge fails this framework's difficulty standard regardless of its reasoning-load classification.

**Educational evidence vs. implementation decision:** the rubric's grounding in "desirable difficulty" (AEP-001 §2.2–§2.4) is educational evidence; the specific four-level labelling scheme (`easy`/`medium`/`hard`/`challenge` as opposed to, say, a numeric 1–10 scale) is an implementation/product decision with no independent evidence claim of its own.

---

## 6. Cognitive Demand Levels

**New in this framework.** Difficulty (§5) measures *how hard* a question is within its own type; Cognitive Demand measures a genuinely different thing — *what kind* of thinking the question requires. This framework adopts the revised Bloom's Taxonomy (Anderson & Krathwohl) as the grounding classification, a long-established and widely-used framework in educational science: **Remember** (recall a fact or rule), **Understand** (explain the rule in one's own terms), **Apply** (use the rule in a new but structurally similar situation), **Analyse** (break a multi-part problem into its components), **Evaluate** (judge between competing approaches or answers), **Create** (generate an original solution or artefact).

**Honest mapping of Angel's real content against these six levels:** the large majority of Angel's current questions across every domain sit at Remember/Understand/Apply — a stated rule applied to a new instance (matches `QUESTION_AUTHORING_STANDARD.md` §4.1's "Easy"/"Medium" rows almost exactly). Genuine **Analyse**-level content exists but is rarer — `maths.problem-solving`'s multi-step word problems (AEP-002 §2, `QUESTION_AUTHORING_STANDARD.md` §11.4) are the clearest real example, requiring a student to decompose a problem before any single rule applies. **Evaluate** and **Create**-level content is essentially absent from Angel's exam-aligned question banks — and this is not a defect to fix by writing harder exam-format questions. Per AEP-001 §2.11 (Intellectual Curiosity Principle, APD-002), Evaluate/Create-level thinking is exactly what the curiosity-extension activities (logical investigations, "what happens if" explorations) are meant to develop, deliberately *outside* the examination specification — this framework treats the near-total absence of Evaluate/Create in exam-format questions as expected and correct, not a gap to close by making exam questions themselves more open-ended.

**Educational evidence vs. implementation decision:** Bloom's Taxonomy itself is well-established educational theory (**Strong** as a classification framework); the specific claim that most 11+ exam content clusters at Remember/Understand/Apply is a direct, defensible reading of the question types themselves (**Strong**, since it follows from AEP-002's own competency descriptions) but the claim that Evaluate/Create should be reserved for curiosity activities rather than ever appearing in exam-format practice is a **product/design decision** grounded in but not strictly required by the evidence — a defensible judgement call, not itself a cited finding.

---

## 7. Learning Transfer Links

Every question may optionally carry links to related competency codes, drawn directly from AEP-002 §5 (Learning Transfer Map) and §10 (Cross-Subject Relationships) — a field-level instantiation of the same relationship graph, not a new one. For example, a `maths.fractions` question could carry a transfer link to `maths.percentages`/`numreason.percentages` per the AEP-001 §2.12-mandated chain, or an `nvr.rotation` question could link to `sr.rotation`/`sr.compass-grid-navigation` per AEP-002 §10's strongest-evidenced new relationship (the shared clockwise/anticlockwise error).

**How this must plug into existing, unchanged architecture:** `ALI_CROSS_SUBJECT_INTELLIGENCE.md` §4's safety rule is restated, not modified, here: a transfer link is an *additive* recommendation input that may only fill a gap direct evidence hasn't already claimed — it can never override or deprioritise a proven direct weak-competency remediation for the same competency.

**Educational evidence vs. implementation decision:** which links are real (grounded in shared mechanism or shared error, AEP-002 §3/§10) is educational, rated per AEP-002 §12; storing them as an optional field on the question itself (rather than only at the competency-graph level) is an implementation choice, made so a specific question can be the concrete vehicle a future recommendation surfaces, not just an abstract graph edge.

---

## 8. Examination Pathway Mapping

Extends `QUESTION_AUTHORING_STANDARD.md` §1's existing `pathway` field (already a set, e.g. `["gl","cem","iseb"]`) to the full pathway list AEP-002 §13 (Pathway-First Architecture, APD-003) now recognises: CSSE, GL, CEM, ISEB, Independent School, Custom Programme. This framework adds one explicit **validation rule** not previously stated anywhere: a question's `pathway` value must never include a board that AEP-002 §6's Examination Application Map confirms does not test that question's domain. Concretely — a Verbal Reasoning or Non-Verbal Reasoning question must never be tagged `csse`, since CSSE tests neither domain at all (AEP-002 §6, §11); a Writing-domain item cannot be tagged to any of the four boards, since none currently examine Writing as a scored component (AEP-002 §1).

**Terminology Governance applies at the field level too (AEP-002 §14):** if a future field or UI ever surfaces a pathway's subject label to a family, it must use the governed public term ("Mathematical Reasoning," never "Numerical Reasoning," for Angel's own `numreason` domain) regardless of what the internal `pathway`/`subject` values are named in code.

**Educational evidence vs. implementation decision:** which domains each board tests is educational/structural evidence (AEP-002 §6, rated Strong for structure, Pending for item-level detail); the validation-rule mechanism itself (rejecting an invalid pathway/domain combination) is an implementation decision serving that evidence.

---

## 9. Timing Expectations

Reuses `QUESTION_AUTHORING_STANDARD.md` §1's `estimated_time_seconds` field and §4.5's baseline tables (fully worked for Verbal Reasoning and Mathematics competencies) without modification. Non-Verbal Reasoning, Spatial Reasoning, and Mathematical Reasoning (`numreason`) have no baseline timing tables yet — the same honest gap named in §5 above, carried through consistently rather than silently assumed solved.

**A further refinement this framework proposes, not yet built:** AEP-002 §6 documents that different boards impose genuinely different timing pressure — CEM's 6–12 minute strictly-timed sub-sections with no revisiting versus GL's more generous per-paper timing. A question's single `estimated_time_seconds` value today represents a generic "realistic Year 5/6 candidate" baseline (`QUESTION_AUTHORING_STANDARD.md` §1) — it does not yet capture that the *same* question may feel more time-pressured under CEM's format than GL's. This framework flags per-pathway timing calibration as a future refinement (§15) rather than building it now.

**Educational evidence vs. implementation decision:** the baseline timing values themselves are calibration judgements grounded in realistic candidate experience (Moderate evidence — practitioner-calibrated, not independently research-validated); that timing is stored as a single seconds value rather than a per-pathway range is a current implementation simplification, named honestly as a limitation rather than a permanent design commitment.

---

## 10. Confidence Signals

Reuses `QUESTION_AUTHORING_STANDARD.md` §1's existing `confidence_weight` field (how diagnostic a question's outcome is of true competency — lower for guessable formats, higher for questions that isolate one skill cleanly) and connects it explicitly to AEP-002 §7's per-competency confidence bands and `LEARNING_PROFILE_MODEL.md`'s student-level dimensions. A question is not just right-or-wrong; its outcome carries a *weight* toward how much that answer should move the system's belief about the learner's competency — already built, cited here rather than redesigned.

**Educational evidence vs. implementation decision:** that a guessable question should count for less than a clean, unguessable one is a direct, defensible application of measurement validity (educational reasoning); the specific default weight (`1.00`) and the decision to leave it inert until real usage data justifies tuning it (`QUESTION_AUTHORING_STANDARD.md` §1) is an implementation/rollout decision.

---

## 11. Feedback Intelligence

Reuses `QUESTION_AUTHORING_STANDARD.md` §2.3/§2.4's existing explanation and hint writing standards (name the rule, show the working, point at method never at the answer) — this framework adds one concrete extension, made possible by §4's new Misconception Mapping field: **where a question is tagged as addressing a specific misconception, its explanation should name and directly correct that misconception, not only state the rule generically.** This is the single most direct application of AEP-001 §2.5's feedback-specificity evidence this framework makes — the difference between generically-correct feedback and feedback that meets a learner exactly where their specific wrong belief is.

**A safety constraint restated from AEP-001, not new here:** feedback naming a misconception must never be delivered in a way a child could experience as being told they are wrong in a general, character-level sense (AEP-001 §2.5's "well done"/"wrong" contrast, and §2.10's Educational Safety Principle) — it corrects the specific belief, not the learner.

**Educational evidence vs. implementation decision:** that specific, actionable feedback outperforms generic feedback is Strong evidence (AEP-001 §2.5); the mechanism of tying feedback text to a `addresses_misconception` field specifically is an implementation choice serving that evidence.

---

## 12. Adaptive Recommendation Rules

**No redesign of existing, working architecture.** ALI's existing selection logic — weak-skill override with a guaranteed minimum slot (Decision 17), absolute previous-mock exclusion (implementation plan v3), mastery-based resampling, cooldown windows as a spacing instrument (AEP-001 §2.2) — is confirmed correct and unchanged by this framework (`lib/ali/selection.ts`, `ADAPTIVE_ASSESSMENT_ENGINE_ARCHITECTURE.md`). This framework's new inputs (Misconception Mapping §4, Learning Transfer Links §7, Cognitive Demand §6) are **additive layers** onto that existing mechanism, governed by the same, unmodified safety rule already established in `ALI_CROSS_SUBJECT_INTELLIGENCE.md` §4: any new input may only fill a slot direct evidence hasn't already claimed, and can never bump, deprioritise, or substitute for a proven direct weak-competency remediation.

**One new, concrete recommendation rule this framework adds:** where a wrong answer's underlying misconception (§4) is known, and a *different* competency's questions are tagged as addressing the *same* misconception (e.g. a place-value misconception surfacing in both `maths.addition-subtraction` and `maths.decimals`), the recommendation layer may surface the related question as a supplementary, evidence-ranked suggestion — following the exact "evidence-ranked, not rule-fired" priority order `ALI_CROSS_SUBJECT_INTELLIGENCE.md` §3.2 already established (direct evidence first, shared-mechanism from mastered sources next, sequential-dependency framed as help never diagnosis, weak-strength links excluded from firing at all).

**Educational evidence vs. implementation decision:** that misconceptions frequently recur across superficially different competencies is a defensible educational inference from AEP-002 §4's cross-domain misconception review (Moderate evidence — plausible, not yet validated against Angel's own data); the specific priority-ordering mechanism is an implementation decision reusing an already-approved pattern.

---

## 13. Educational Evidence Ratings

Per the explicit requirement to distinguish educational evidence from implementation decisions throughout, not only in one section:

| Framework section | Nature of the core claim | Rating |
|---|---|---|
| §1 Question Identity | Implementation convention | N/A — no pedagogical claim |
| §2 Knowledge Mapping | Mechanical application of AEP-002 §1 | Inherits AEP-002 §1's rating |
| §3 Competency Mapping | Educational (which competency) + implementation (single closed-vocabulary field) | Inherits AEP-002 §2/§12; field design is implementation |
| §4 Misconception Mapping | Educational (misconceptions are real, AEP-002 §4) + implementation (new optional field) | Strong for VR/Maths misconceptions (NCETM/existing standard), Moderate for English/Vocabulary, Strong for NVR/SR mindset misconception; field mechanism is implementation |
| §5 Difficulty Classification | Educational (desirable difficulty, AEP-001 §2.2–§2.4) + implementation (four-level scale) | Strong for the underlying evidence; scale choice is implementation |
| §6 Cognitive Demand Levels | Educational (Bloom's Taxonomy, well-established) + product decision (Evaluate/Create reserved for curiosity activities) | Strong for the taxonomy itself; Moderate/product-judgement for the curiosity-activity placement decision |
| §7 Learning Transfer Links | Educational, inherits AEP-002 §5/§10/§12 | As rated there (Strong/Moderate per edge) |
| §8 Examination Pathway Mapping | Educational (board structure, AEP-002 §6) + implementation (validation rule) | Strong for structure, Pending for item-level detail; rule mechanism is implementation |
| §9 Timing Expectations | Practitioner-calibrated | Moderate; per-pathway timing refinement explicitly unbuilt |
| §10 Confidence Signals | Educational (measurement validity) + implementation (default weight/rollout) | Strong reasoning; weight value is implementation |
| §11 Feedback Intelligence | Educational (AEP-001 §2.5) + implementation (field-driven mechanism) | Strong for the underlying evidence |
| §12 Adaptive Recommendation Rules | Educational (misconception recurrence, cross-subject safety rule) + implementation (existing, unmodified mechanism) | Moderate for recurrence claim; safety rule inherits its original Strong/constitutional status |
| §14 Question Lifecycle | Implementation convention, informed by §5's calibration-drift evidence use | Mixed — see §14 |
| §15 Future Expansion Strategy | Forward-looking, no independent evidence claim | N/A |

---

## 14. Question Lifecycle

Organising existing conventions into one explicit lifecycle, not inventing new stages beyond one addition (flagged below):

1. **Authored** — written against `QUESTION_AUTHORING_STANDARD.md`'s writing standards (§2), UK English guidance (§5), originality (§6), and copyright (§7) requirements.
2. **Reviewed** — checked against the per-question review checklist (`QUESTION_AUTHORING_STANDARD.md` §10), now also checked against this framework's §3 (competency), §4 (misconception, if tagged), §5 (difficulty), §8 (pathway validity) fields.
3. **Imported** — enters `ali_question_bank` (or the equivalent bank for a not-yet-ALI-covered domain).
4. **Live / In-Rotation** — served to real learners through ALI's existing selection logic (§12).
5. **Calibration-Monitored** — `avg_success_rate` drift is the existing signal (`QUESTION_AUTHORING_STANDARD.md` §4.4) that can catch a mistagged difficulty over time; this framework adds no new signal here, only names the stage explicitly.
6. **Flagged for Review** *(new stage this framework adds)* — a question whose real usage data contradicts its own metadata (e.g. a question tagged as addressing one misconception whose wrong-answer pattern doesn't match that misconception at all, or whose `avg_success_rate` is wildly inconsistent with its `content_difficulty` tag) enters this state rather than silently continuing to serve — a modest, evidence-grounded addition consistent with §4.4's existing "let real data correct a mistagged question" philosophy, extended to the new Misconception Mapping field specifically.
7. **Retired** — `id` never reused (`QUESTION_AUTHORING_STANDARD.md` §1), question removed from active rotation.

**Educational evidence vs. implementation decision:** the lifecycle stages themselves are an organisational/implementation convention; the specific claim that real usage data should be allowed to surface and correct a mistagged question (rather than trusting initial tagging permanently) is grounded in the same "prefer real evidence over assumption" discipline this entire project has held since Decision 3 (Strong as an internal methodological commitment, not an external academic citation).

---

## 15. Future Expansion Strategy

- **Independent School and Custom Programme pathways** (AEP-002 §13) need their own Examination Pathway Mapping treatment before §8's validation rule can be applied to them meaningfully — deferred, not fabricated here.
- **Difficulty calibration and timing-baseline tables for Non-Verbal Reasoning, Spatial Reasoning, and Mathematical Reasoning** (§5, §9) are the most concrete, bounded next authoring task this framework identifies — a natural extension of `QUESTION_AUTHORING_STANDARD.md` in the same shape as its existing §3/§11 sections.
- **Per-pathway timing calibration** (§9) — capturing that the same question feels different under CEM's tight sub-sections versus GL's format — is named as a real refinement opportunity, not built.
- **Misconception Mapping retagging** of Angel's existing ~172 questions (§4) is a human-authored task, following the standing "do not automate metadata generation" principle — explicitly not attempted by mining wrong-answer data automatically, at least initially, for the same reason `ALI_CROSS_SUBJECT_INTELLIGENCE.md` §1.4/§5.4 gives for deferring automatic relationship-discovery: real but small student populations risk encoding statistical noise as pedagogical fact.
- **Probability content** (`CURRICULUM_GAP_REGISTER.md` GAP-001) will need its own Question Identity, Competency Mapping, and Difficulty Classification entries once authored — this framework is ready to receive it without redesign, since Probability would simply become a new competency code within an existing domain (most likely `maths.probability`), not a structural change.

No implementation follows from this document directly. It is delivered for Founder review and approval before AEP-004 proceeds.
