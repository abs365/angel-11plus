# Learning Engine — Version 1.0

**Angel 11+, Version 3.0 Academic Excellence Programme**
**Capability:** 2 — Learning Engine Version 1.0
**Status:** Complete. Educational intelligence model only — no user interface, no algorithms, no application code, no implementation.

---

## 1. Executive Summary

The Learning Engine defines how Angel would understand a learner — the concepts, vocabulary, and structure of educational evidence Angel would need to hold about a learner, expressed entirely in terms Assessment Brain V1 already defines. It exists to answer one question only: *what would Angel need to know, and how confidently, in order to describe a learner's demonstrated standing against the CSSE assessment* — not how that is computed, stored, displayed, or acted on.

Assessment Brain V1 describes the **exam**: what CSSE measures, through which competencies, via which question formats, with what evidentiary confidence. The Learning Engine describes the **learner**: what a learner has demonstrated against that same competency and question-type structure, with an equivalent evidentiary discipline. Every construct below is a learner-facing mirror of a construct Assessment Brain already established — this document does not introduce any competency, domain, or educational category Assessment Brain does not already define, and does not introduce any concept (motivational, behavioural, predictive) that has no traceable basis in the Brain's own evidence.

This is a design document, not a working system. Nothing in it has been implemented, computed against real learner data, or validated — that limitation is stated plainly in Section 10, not smoothed over.

## 2. Learning Engine Principles

Only principles already demonstrated by this programme's own conduct are included — none is asserted here for the first time without a traceable precedent.

1. **Evidence First.** A claim about a learner is made only from an observed instance of that learner engaging with a specific Question Type — never inferred, assumed, or extrapolated from adjacent competencies. *(Precedent: every Assessment Brain claim traces to a specific Asset ID; the same discipline applies here to learner evidence.)*
2. **Competency Before Score.** A learner's standing is expressed as status against named competencies (Assessment Brain's 13), not as a single aggregate mark or percentage. *(Precedent: Assessment Brain itself is organised around 13 named competencies, not a raw-score model — AEP-003 §1–5.)*
3. **Confidence Is Never Binary.** Every claim about a learner carries an explicit evidence-maturity qualifier; nothing is asserted as flatly true or false. *(Precedent: Assessment Brain's HIGH/MEDIUM/LOW/INSUFFICIENT EVIDENCE and EMC-1→4 scales, reused directly in Section 3 below.)*
4. **Traceability.** Every learner-level claim resolves to specific Competency IDs and Question Type IDs already defined in Assessment Brain — never to an untraceable aggregate. *(Precedent: Assessment Brain §9's Cross Reference Matrix; AEP-002/003/004's own traceability matrices.)*
5. **Explainability.** Any status or category this model assigns must be explicable in terms of which competencies and question types produced it — no construct in this model is a black box. *(Precedent: every Assessment Brain observation states its own evidence references in full, never a bare conclusion.)*
6. **Absence of Evidence Is Not Evidence of Absence.** A competency a learner has not yet engaged with is recorded as unobserved, never defaulted to a weak or negative status. *(Precedent: Assessment Brain itself distinguishes "INSUFFICIENT EVIDENCE" from a negative finding throughout AEP-002 §6 — the same distinction is structurally required here, and is more consequential for a learner than for an exam paper.)*
7. **No Invented Constructs.** This model uses only the competencies, question types, and assessment components Assessment Brain already defines. It does not add a domain, competency, or psychological/behavioural construct to fill a gap. *(Precedent: AEP-003 Principle 3's refusal to invent a "Vocabulary" domain from one instance; AEP-004 Principle 5's refusal to invent Question Types for symmetry; Assessment Brain §8's refusal to invent a competency for measurement/data-reading gaps.)*

## 3. Learner Profile Model

This section defines *what* Angel would conceptually hold about a learner — not how it would be stored, computed, or queried (no database design, no software design).

The profile is built in two layers, mirroring Assessment Brain's own layering (Knowledge Asset → Observation → Competency → Question Type): a **raw layer** (Question Type Exposure) recording what has actually been observed, and a **rolled-up layer** (Competency Status, Evidence Confidence) summarising that raw evidence per competency, exactly as Assessment Brain rolls Question Types up into Competencies (its own §9 Cross Reference Matrix).

### 3.1 Question Type Exposure (raw layer)

For each of Assessment Brain's 27 Question Type IDs, the profile conceptually holds: whether the learner has engaged with that format at all, how many times, and — for each instance — whether the outcome met the format's own Measurement Purpose (as defined in AEP-004 §5) or not. This is the only layer where anything is recorded directly; every other profile element is derived from it.

### 3.2 Competency Status (rolled-up layer — direction)

For each of Assessment Brain's 13 Competency IDs, the profile holds an **Evidence Signal** — a statement of what the rolled-up Question Type Exposure evidence indicates, not how much of it exists (that is Evidence Confidence, Section 3.4):

- **Not Yet Observed** — no exposure recorded to any Question Type mapped to this competency.
- **Developing** — exposure recorded, but outcomes are mixed or inconsistent relative to the mapped Question Types' Measurement Purpose.
- **Not Yet Demonstrated** — exposure recorded, outcomes consistently fall short of the mapped Question Types' Measurement Purpose.
- **Demonstrated** — exposure recorded, outcomes consistently meet the mapped Question Types' Measurement Purpose.

Where a competency maps to more than one Question Type (as most do — e.g. MR-04 maps to QT-MR-04, QT-MR-10, and QT-MR-13), the Signal reflects the pattern across all mapped types the learner has actually engaged with, not just one.

### 3.3 Evidence Confidence (rolled-up layer — maturity)

Alongside Competency Status, the profile holds an **Evidence Tier (ET-0 to ET-4)** for each Competency ID — a direct learner-facing counterpart to Assessment Brain's own EMC-1→4 scale (AEP-003 §3(4)), extended with an explicit zero-tier because, unlike Assessment Brain's competencies (which by construction already have exam evidence), a learner will often have none at all for a given competency:

- **ET-0 (No Evidence):** no exposure to any mapped Question Type.
- **ET-1 (Indicative):** a small number of instances — not yet enough to establish a consistent pattern.
- **ET-2 (Emerging):** a consistent pattern, but confined to a single mapped Question Type/format.
- **ET-3 (Substantiated):** a consistent pattern across more than one mapped Question Type/format.
- **ET-4 (Established):** a consistent pattern across the range of mapped Question Type formats the learner has had the opportunity to engage with, sustained across more than one observed point in time.

Evidence Tier and Evidence Signal are independent axes — a competency can be "Not Yet Demonstrated" at ET-3 (well-evidenced evidence of a gap) just as validly as "Demonstrated" at ET-1 (thin but positive evidence). Collapsing the two into one score would violate Principle 3 (Confidence Is Never Binary) and is deliberately not done.

**A competency's Evidence Tier ceiling is bounded by Assessment Brain's own EMC rating for that competency.** A competency Assessment Brain itself rates EMC-1 (WC-02) or EMC-2 (RC-03, RC-04, MR-05) offers fewer mapped Question Types or years of exam-level evidence to draw a learner-facing pattern from in the first place — this is a structural constraint inherited from Assessment Brain, not a defect of this model (carried forward to Section 10).

### 3.4 Assessment Coverage

A map, at the level of the 4 Assessment Components, the 13 Competencies, and the 27 Question Types, of which have *any* recorded exposure at all versus which remain entirely untouched. This is distinct from Competency Status/Evidence Confidence (which describe the quality of evidence that exists) — Coverage describes where evidence exists to describe at all, directly supporting Principle 6.

### 3.5 Learning Readiness

A component-scoped summary of the Evidence Tier/Signal distribution across a component's competencies. Fully defined in Section 6 (Readiness Model); held here as a profile element because it is a stable, referenceable part of what Angel holds about a learner at a point in time, not a one-off computation.

### 3.6 Historical Progress

A time-ordered record of how a competency's Evidence Signal and Evidence Tier have changed between observed points in time (e.g. "ET-1 → ET-3 between two dates," or "Not Yet Demonstrated → Demonstrated"). This is descriptive only — a record of what changed, not a rate, trend line, or projection of what will happen next (see Section 9 — no prediction).

## 4. Diagnostic Intelligence

Diagnostic categories are the direct product of the Signal × Tier combinations defined in Section 3 — no scoring formula, no numeric threshold. Each category is a description of an observed evidence pattern, not a computed score.

- **Strengths:** competencies with a **Demonstrated** signal at **ET-3 or ET-4** — a consistent, positive pattern evidenced across more than one Question Type format.
- **Mastered Skills:** competencies with a **Demonstrated** signal at **ET-4** specifically — the highest evidence ceiling this model can express. This label describes evidence maturity within this model, not a certified psychometric claim of mastery in any absolute educational sense (see Section 9).
- **Emerging Skills:** competencies with a **Demonstrated** signal at **ET-1 or ET-2** — a positive pattern, not yet broad or sustained enough to call a Strength.
- **Development Areas:** competencies with a **Not Yet Demonstrated** signal at **ET-1 or higher** — there is real evidence, and it indicates the mapped Question Types' Measurement Purpose is not yet being met. This category requires actual evidence (ET-1+); a competency at ET-0 is never a Development Area, only an Assessment Coverage gap (Principle 6) — conflating "untested" with "struggling" is exactly the failure mode this model is built to avoid.
- **Low Confidence Areas:** competencies with a **Developing** signal at any tier, or a Demonstrated/Not Yet Demonstrated signal confined to **ET-1** — evidence exists but is too thin or too inconsistent to characterise confidently in either direction. This is its own category, distinct from Development Areas, precisely because "we don't know yet" and "we know it's a gap" are different findings and must not be reported the same way.

## 5. Learning Progression

Progression is understood strictly as **movement of a competency's Evidence Tier and Evidence Signal over time** (via Historical Progress, Section 3.6), tracked separately for each of the 13 competencies. It is not a fixed sequence, curriculum path, or lesson order, and this model does not define one.

Two boundaries are carried forward directly from Assessment Brain and must not be violated by any future work building on this model:

- **No cross-competency ordering is asserted.** AEP-003 §6 explicitly declined to claim any competency is a prerequisite for, or developmentally enables, another (e.g. it did not assert "retrieval enables inference"). This model inherits that boundary exactly: progression is described competency-by-competency, never as an implied sequence across competencies.
- **Progression can be partial within a single competency.** Where a competency maps to multiple Question Type formats (e.g. MR-03's QT-MR-07 and QT-MR-08), a learner may show a consistent pattern in one format and none in another — this is a real, describable state (ET-2, confined to one format), not an error to be resolved by assumption. This model does not prescribe whether breadth (more formats) or depth (more instances of one format) should come first — that is a curriculum/sequencing decision explicitly out of scope here.

## 6. Readiness Model

Readiness is reported per **Assessment Component** (English Comprehension, Applied Reasoning, Continuous Writing, Mathematics — Assessment Brain's own four components), never as a single exam-wide figure, and never as a percentage. A single number would imply a precision this evidence cannot support and would risk exactly the kind of conflation Assessment Brain's own AEP-001 corrective work found and fixed elsewhere in this programme (mock sections silently mismatched to the wrong subject) — Readiness here stays scoped to the same structural boundaries Assessment Brain itself uses.

For a given Assessment Component, Readiness is described as a **distribution**, in the same qualitative style Assessment Brain itself uses to report its own evidence distribution (Assessment Brain §6, §7) — not collapsed into one score:

- Which of the component's competencies show a **Demonstrated** signal at ET-3/ET-4 (Strengths).
- Which show **Not Yet Demonstrated** at ET-1+ (Development Areas).
- Which remain at **ET-0/ET-1** or **Developing** (Low Confidence / not yet evidenced).

A component could reasonably be described in qualitative bands such as *well-evidenced*, *partially evidenced*, or *not yet evidenced* — based on how much of that distribution falls into the Demonstrated/high-tier band versus the No-Evidence/Developing band — but any such banding is a description of the evidence distribution already computed above, never a synthesised score, and never implies a probability of exam success (see Section 9 — no forecasting).

## 7. Recommendation Model

This section defines recommendation **categories only** — what kind of educational response each Diagnostic Intelligence finding could reasonably invite. No category is prioritised over another, no selection logic decides which fires when, and no algorithm is defined; that is explicitly deferred to a separately-authorised future capability.

- **Practice** — responds to **Emerging Skills**: more engagement with a competency's mapped Question Types, to move a positive-but-thin pattern toward a broader one.
- **Consolidation** — responds to a competency at **ET-2** (Demonstrated, but confined to one Question Type format): broadening exposure to the competency's *other* mapped formats, which Assessment Brain already defines but the learner has not yet encountered.
- **Revision** — responds to **Development Areas**: the evidence indicates the competency's Measurement Purpose is not yet being met, so revisiting the underlying competency is indicated.
- **Extension** — responds to **Mastered Skills**: the evidence ceiling for this competency has been reached within this model; this category signals readiness to move attention elsewhere, without specifying which competency, since this model does not define cross-competency ordering (Section 5).
- **Review** — responds to **Historical Progress** showing evidence has not been refreshed in some time, distinct from Revision: this category exists to keep prior Demonstrated evidence current, not to respond to a demonstrated gap.

## 8. Parent Intelligence Inputs

This section names which categories of educational evidence, already defined above, would be meaningful for a future parent-facing report to draw on — it does not design that report, its layout, or its wording.

**Evidence categories suitable for parent-facing use:**
- Competency Status (Section 3.2) and Evidence Confidence (Section 3.3), described per Assessment Component, in plain-language terms rather than raw Signal/Tier codes.
- Assessment Coverage (Section 3.4) — an honest statement of which competencies there is not yet enough evidence to say anything about, reported as such rather than omitted or implied to be weak.
- Diagnostic Intelligence findings (Section 4) — Strengths, Development Areas, Emerging Skills, Mastered Skills, Low Confidence Areas.
- Historical Progress (Section 3.6) — change in evidence over time, where it exists.
- Readiness distribution (Section 6) — per Assessment Component, in the same qualitative-banding terms defined there.

**Explicitly not suitable for parent-facing use, and not to be surfaced under Version 1 of this model under any future report design:**
- Any predicted exam score, mark, or pass/fail likelihood (no basis exists in this model — Section 9).
- Any percentile, ranking, or comparison against other learners (no other-learner evidence exists in this model's scope).
- Any behavioural, motivational, or psychological characterisation (not a construct this model defines — Section 9).
- Any claim about a competency at ET-0 beyond "not yet evidenced" (Principle 6).

## 9. Learning Engine Boundaries

This model does not:

- **Predict.** No future exam question, future performance, or trajectory is forecast from Historical Progress or any other element — progression records only what has already changed (Section 3.6, Section 5).
- **Forecast exam outcomes.** No pass/fail likelihood, predicted score, or probability of success is computed or implied by any Readiness banding (Section 6).
- **Act as an AI tutor.** This model defines what Angel would know about a learner, not how it would teach, explain, or converse with one.
- **Model behaviour or psychology.** No construct for motivation, engagement, mindset, attention, learning style, or similar is defined — none has a traceable basis in Assessment Brain's evidence, and Principle 7 forbids inventing one.
- **Compare learners to each other.** No peer-ranking, percentile, or cohort-relative construct exists in this model.
- **Define lesson ordering or an adaptive algorithm.** Section 5 and Section 7 explicitly stop at the conceptual/category level; sequencing, prioritisation, and selection logic are out of scope for Version 1.
- **Assert cross-competency prerequisites or developmental relationships.** Carried forward unchanged from AEP-003 §6 and Assessment Brain.
- **Invent competencies, domains, or Question Types beyond Assessment Brain's 13/27.** Two structural gaps Assessment Brain itself already flagged and left open (no dedicated competency for measurement/unit-conversion, evidenced by QT-MR-03; none for data/graph reading, evidenced by QT-MR-09) are inherited unresolved here, mapped to their nearest existing competency exactly as Assessment Brain maps them (both to MR-01) — this model does not create a new competency to fix that gap.
- **Design a database, storage schema, or software architecture.** Every construct above is a conceptual/educational model; none specifies a field, table, type, or API.
- **Design a user interface or a report.** Section 8 names evidence categories only, not layout, wording, or visual design.
- **Make any claim beyond what Assessment Brain's own EMC/Confidence ratings can support.** A competency's learner-facing Evidence Tier ceiling is structurally bounded by that competency's own Assessment Brain EMC rating (Section 3.3) — this model cannot manufacture learner-facing confidence the underlying exam evidence does not itself support.

## 10. Version 1 Readiness

This Learning Engine model is **sufficient to inform Capability 3**, subject to the following conditions:

1. **This model exists on paper only.** It has not been implemented, and no real learner data has ever been evaluated against it. Nothing in this document should be read as validated in practice — only as a self-consistent, evidence-traceable design. Capability 3, if it involves implementation, is the first point at which that validation could begin, and should treat this as a hypothesis to be tested, not a proven mechanism.
2. **The Recommendation Model (Section 7) defines categories only.** Any selection logic, prioritisation, or scheduling algorithm is a new design decision explicitly deferred to a future, separately-authorised work package — Capability 3 should not assume this document silently implies one.
3. **Two Assessment Brain structural gaps propagate into this model unresolved:** the missing measurement/unit-conversion and data/graph-reading competencies (Section 9). Any Competency Status or Evidence Confidence reported for MR-01 as a result of QT-MR-03/QT-MR-09 engagement inherits the same "imperfect fit" caveat Assessment Brain §8 already documented — Capability 3 should not attempt to silently resolve this by inventing a competency; that remains a future AEP-003 revision, not a Learning Engine concern.
4. **WC-02's Evidence Tier ceiling is structurally constrained.** Because Assessment Brain rates WC-02 at EMC-1 (an open rubric-vs-marks gap, only partially narrowed by Observation 13), no amount of learner exposure to Continuous Writing can currently raise WC-02's learner-facing Evidence Tier to a full ET-4 with the same confidence as, say, MR-06 — this is inherited from the exam-evidence layer, not a defect to be fixed at the learner-model layer.
5. **This document does not specify how frequently, or by what mechanism, Question Type Exposure would be recorded** (e.g. from live assessment activity versus practice activity) — that is an implementation-layer decision for Capability 3, deliberately left undefined here per the "no implementation" instruction.

Within those conditions, every concept in this document traces to a specific Assessment Brain construct (Competency ID, Question Type ID, EMC rating, or Assessment Component), no new educational claim was introduced without a stated precedent (Section 2), and no implementation, algorithm, UI, or database design was included, per Capability 2's Success Criteria.
