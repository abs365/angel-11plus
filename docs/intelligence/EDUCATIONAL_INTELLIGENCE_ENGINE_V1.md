# Educational Intelligence Engine — Version 1.0

**Work Package:** ANGEL-CSSE-002A (Educational Intelligence Consolidation) — replaces ANGEL-CSSE-002 in its original form, per Programme Decision, 2026-07-20.
**Status:** FROZEN on approval. The single canonical specification for how Angel understands a learner, decides what to recommend, and reports to a parent — superseding, by consolidation, `ANGEL-CSSE-001`'s five mechanics-layer documents and the Architecture Closure Report's extracted concepts (Section 9 records exactly what each source contributed and what happens to it now).

---

## 1. What this document is, and is not

This is the third document in the `docs/intelligence/` canonical family, sibling to `ASSESSMENT_BRAIN_V1.md` and `LEARNING_ENGINE_V1.md`, both unchanged and untouched by this consolidation:

- **Assessment Brain V1 describes the exam** — what CSSE measures, through which 13 competencies and 27 Question Types, with what evidentiary confidence, built from 17 real exam-paper assets. Cited throughout, never reproduced.
- **Learning Engine V1 describes the learner** — Evidence Signal × Evidence Tier, Diagnostic Intelligence, Readiness, five Recommendation categories. Cited throughout, never reproduced. Every construct in this document either *is* a Learning Engine V1 construct restated for clarity, or is explicitly marked new.
- **This document is the Educational Intelligence Engine** — the pathway-agnostic decision-making layer that sits on top of both: how evidence becomes a confidence tier, how a competency's status becomes a coordinated learner state, which decisions the system may make automatically versus which need stronger evidence, how a recommendation is explained to three different audiences, and where the boundary between "educational" and "exam-specific" knowledge actually falls.

**This is a specification, not an implementation.** Nothing here is code, migration, or UI. Per this work package's explicit closing instruction, this document is the last one before implementation mode — see Section 10.

## 2. Sources consolidated, and how

Four sources were named for consolidation. Each contributed differently, and none is silently duplicated:

| Source | Contribution | Disposition |
|---|---|---|
| `ASSESSMENT_BRAIN_V1.md` | The exam model (competencies, Question Types, EMC ratings) | Unchanged, cited, foundational |
| `LEARNING_ENGINE_V1.md` | The learner evidence model (Signal × Tier, Diagnostic Intelligence, Readiness, 5 Recommendation categories) | Unchanged, cited, foundational |
| `ANGEL-CSSE-001` (8 documents) | Reconciliation of Learning Engine V1 against 7 requested dimensions; specification of Recommendation/Parent/Admissions boundaries; a proposed data model | 5 "mechanics" documents (`LEARNING_INTELLIGENCE_FRAMEWORK.md`, `RECOMMENDATION_ENGINE_SPECIFICATION.md`, `PARENT_INTELLIGENCE_SPECIFICATION.md`, `ADMISSIONS_INTELLIGENCE_SPECIFICATION.md`, `ENTERPRISE_DATA_MODEL.md`) are **fully absorbed below and archived**. 3 factual/evidentiary documents (`CSSE_EXAMINATION_BLUEPRINT.md`, `CSSE_COMPETENCY_TOPIC_MAPPING.md`, `CSSE_QUESTION_TAXONOMY.md`) **remain as-is** — they are content/reference material parallel in kind to Assessment Brain V1 itself, not engine specifications, and do not duplicate this document. |
| `ARCHITECTURE_CLOSURE_REPORT.md` | Twelve legacy documents' worth of extracted, reusable concepts (pedagogical evidence base, Decision Boundaries, 8-state Educational State model, 4-tier Assessment Confidence Model, 3-audience Explainability, Question Lifecycle, Cognitive Demand, Engineering Contracts) | Fully absorbed below; the Closure Report itself is unchanged, cited as the audit trail for where each concept came from |

Section 9 gives the complete resolution table for every genuine overlap found between these sources.

## 3. Principles

Learning Engine V1's seven principles (Evidence First, Competency Before Score, Confidence Is Never Binary, Traceability, Explainability, Absence of Evidence Is Not Evidence of Absence, No Invented Constructs) govern this document unchanged and are not restated in full. One further principle is adopted, extracted from the Closure Report's AEP-001 material, because nothing in Learning Engine V1 previously stated it and this document now relies on it directly in Section 8's Decision Boundaries:

**8. Educational Safety Principle.** No decision this engine makes — automatic or otherwise — may increase a learner's anxiety in service of a short-term score or coverage gain, and this constraint binds with *greater*, not lesser, force as exam proximity increases. This is the single most load-bearing rule extracted from the archived material (originally AEP-001 §2.10, restated by EAW-004 §4 specifically as a non-negotiable ceiling on recommendation orchestration) — it directly governs Section 8 below and is why Wellbeing sits above every other Decision Boundary, not beside them.

Two further pedagogical findings from the same archived material are adopted as standing constraints on any future feature, without becoming new engine *constructs* (they are guidance for humans building on this engine, not something the engine itself computes):
- No growth-mindset messaging, streak-shaming, or loss-aversion mechanic may be justified as "motivation science" — self-determination theory's evidence points the other way, and this independently corroborates the Product Experience programme's own, separately-motivated removal of XP/Streak UI this session.
- Retrieval practice (answer, then find out) is the only form every learner-facing activity may take — never passive review.

## 4. Scope Boundary — Educational Intelligence vs. Exam Intelligence

**This is the resolution to ANGEL-CSSE-002's original Deliverable 8, now answered directly rather than deferred:**

- **Educational Intelligence** (this document) is **examination-agnostic by construction**. Every mechanic below — Evidence Confidence, Educational State, Decision Boundaries, Explainability, the Recommendation Model — is defined in terms of *competencies* and *evidence*, never in terms of a specific exam board's paper structure. Nothing in Sections 5–8 references CSSE, GL, CEM, or ISEB by name.
- **Exam Intelligence** is pathway-specific content that this engine consumes but does not itself define: which competencies exist, how they're graded, what a "readiness" component even is for a given board. Today, exactly one Exam Intelligence source is real and rigorously evidenced: **Assessment Brain V1**, CSSE-only, built from 17 real exam-paper assets. A second, much weaker Exam Intelligence source exists for GL/CEM/ISEB and the four reasoning domains — the Closure Report's archived AEP-002 competency taxonomy (63 codes) — explicitly weaker evidence (practitioner convention and public-record board-format research, not real exam papers) and **not currently reconciled with Assessment Brain V1's competency IDs**, since the two cover entirely non-overlapping domains (CSSE tests neither Verbal, Non-Verbal, nor Spatial Reasoning — Assessment Brain V1 §2, §11).
- **The extensible pattern**, per the original Deliverable 8 request: a new pathway gains Educational Intelligence coverage the moment it has its own Assessment-Brain-equivalent (a competency/Question-Type model built the same way Assessment Brain V1 was — from real exam assets, evidence-rated, frozen). Until then, this engine has nothing pathway-specific to operate on for that pathway, and correctly produces "Insufficient Evidence" / "not yet evidenced" rather than any stronger claim (Principle 6). **No pathway's Educational Intelligence coverage may ever be inferred from another pathway's** — CSSE's real, rigorous model does not extend to GL/CEM/ISEB by association, and the weaker archived taxonomy does not gain Assessment Brain V1's evidentiary strength by proximity in this document.

## 5. Evidence Confidence — one canonical scale, not two

**This is the resolution to the open "Confidence" question `LEARNING_INTELLIGENCE_FRAMEWORK.md` §2.5 explicitly declined to resolve, and to a genuine duplication the Closure Report's extraction surfaced but did not itself reconcile.**

Two confidence-like constructs existed independently before this document: Learning Engine V1 §3.3's **Evidence Tier** (ET-0 to ET-4, five levels, per-competency) and the archived AEP-005's **Assessment Confidence Model** (Insufficient/Low/Moderate/High, four levels, per-conclusion). Direct comparison shows these describe the same underlying thing — how much real evidence exists — at two different granularities, not two different phenomena. Keeping both would be exactly the kind of silent parallel construct this whole programme's discipline exists to prevent.

**Resolution: Evidence Tier (ET-0 to ET-4) remains the single canonical, fine-grained scale** — it is the one already implemented in real code (`lib/learningEngine/rollup.ts`, `diagnostics.ts`, `readiness.ts`) and directly bounded by Assessment Brain V1's own EMC ratings (Learning Engine V1 §3.3), which the coarser scale was never anchored to. The archived four-band model is retained **only as an optional, coarser grouping of the same scale**, for contexts where ET-0..4's full granularity is unnecessary — most usefully, the Decision Boundaries in Section 8, which only need to distinguish "enough evidence to act automatically" from "enough evidence for a high-stakes claim," not the full five-way distinction:

| Evidence Tier (canonical, per-competency) | Coarse band (for Decision Boundaries only) |
|---|---|
| ET-0 (No Evidence) | Insufficient |
| ET-1 (Indicative) | Low |
| ET-2 (Emerging) | Moderate |
| ET-3 (Substantiated) | Moderate–High |
| ET-4 (Established) | High |

**This resolves `LEARNING_INTELLIGENCE_FRAMEWORK.md`'s "Confidence" ambiguity in full:** if "Confidence" means evidentiary confidence, it is Evidence Tier (optionally banded, per the table above) — nothing new is built. If "Confidence" means the learner's own psychological self-assurance, that remains **directly forbidden**, unchanged from Learning Engine V1 §9 and Principle 7 — this document does not reverse that boundary, and no Founder decision to do so has been made. The distinction stands exactly as `LEARNING_INTELLIGENCE_FRAMEWORK.md` left it; only the evidentiary half needed reconciling, and it is now reconciled.

## 6. Cognitive Classification — two distinct, non-overlapping layers

Two classification concepts exist in the source material and are genuinely different, not duplicative, once their level is made explicit — this document states that explicitly, since neither source did:

- **Cognitive Type** (competency-level, from `LEARNING_INTELLIGENCE_FRAMEWORK.md` §2.3): every competency is tagged Knowledge / Skill / Reasoning, a coarse, static classification of *what kind of competency it is*. Unchanged from its original definition; reproduced in full in Section 9's resolution table for traceability.
- **Cognitive Demand** (question-level, from the archived AEP-003, Bloom's Taxonomy: Remember/Understand/Apply/Analyse/Evaluate/Create): a classification of *what mental operation a specific question requires*, independent of which competency it belongs to. Adopted as a genuinely new, additive Question Metadata concept — not yet a named schema field (the archived source itself never specified one), proposed here as a future addition to `CSSE_QUESTION_TAXONOMY.md`'s schema, not built now.

A competency's Cognitive Type does not determine any one question's Cognitive Demand — a Knowledge-type competency (e.g. RC-01, Literal Retrieval) is still tested through questions that could, in principle, sit anywhere on the Remember→Apply range depending on format. The two layers are kept separate for exactly this reason.

## 7. Educational State — the coordination layer Learning Engine V1 never had

**Adopted from the archived EAW-004, corrected per the archived EAW-ERR-HOTFIX-001, and directly resolves the open "Progression Intelligence" question from ANGEL-CSSE-002's original brief.**

Every competency a learner has any evidence for occupies exactly one of eight states at any time, each derived — never independently asserted — from the Evidence Signal/Tier and Durable Mastery status Sections 5 and 8 already define:

| State | Derived from | Feeds Recommendation category (Section 8.3) |
|---|---|---|
| **Exploring** | ET-0/ET-1, first contact | Practice |
| **Building Knowledge** | Developing signal, below threshold | Practice |
| **Practising** | Approaching threshold | Practice |
| **Reinforcing** | Demonstrated, confined to one format (ET-2) | Consolidation |
| **Mastered** | Demonstrated at ET-3/ET-4 | Extension |
| **Durably Mastered** | Mastered + survived a Maintenance Review (Section 8.2) | Extension (lowest priority — evidence ceiling reached) |
| **Reviewing** | A Maintenance Review has become due | Review |
| **Rebuilding** | A post-mastery attempt failed; demoted | Practice/Consolidation, as if newly Reinforcing |

**A state is never surfaced to a learner or parent by name** — this is an internal coordination label only, exactly as the source material specified, consistent with this session's own calm-tone Product Experience rule (never expose mechanism).

**This directly closes Learning Engine V1's own, previously self-acknowledged gap.** Learning Engine V1 §7 states the **Review** recommendation category is "deliberately not produced by this function... requires comparing against a prior time-stamped snapshot, which no persistence mechanism exists for yet." That mechanism now exists: `ali_durable_mastery` and `ali_educational_audit` (migration `010`) are real, live tables, confirmed by the Closure Report to be already-built, unused persistence for exactly this purpose. **The Review category is no longer structurally unbuildable — only unimplemented.** This is a genuine, concrete unblock, not a restatement.

## 8. Decision Boundaries — what the engine may decide automatically

**Adopted from the archived EAW-002 §2, unchanged in substance, restated here as the canonical governance rule for this entire document.**

| Category | Examples | Minimum evidence | Governing rule |
|---|---|---|---|
| **Automatic** | Practice/Consolidation/Revision recommendations, retrieval scheduling, transfer nudges | Low (ET-1) or above | Low-stakes, reversible, self-correcting with the next attempt |
| **Higher Evidence Required** | Mastery declaration, Durable Mastery, any Readiness claim, any definite-language parent statement | High (ET-4), plus Section 8.2's Durable Mastery conditions where applicable | High trust cost if wrong, even when technically revocable in data terms |

**No amount of cross-subject, transfer, or inferred evidence may, on its own, satisfy a Higher Evidence Required decision** — direct evidence about the specific competency is the only thing that can (Learning Engine V1's own Direct Evidence principle, restated here as a hard boundary because Section 7's Educational State transitions into Mastered/Durably Mastered are exactly the case this protects).

**Wellbeing is not a category in this table — it is a veto that runs before it**, per Principle 8 (Section 3). No Automatic or Higher-Evidence-Required decision may fire if it would be inconsistent with a wellbeing signal, and this applies with greater, not lesser, force as an exam date approaches.

### 8.1 Speed — proposed, not built

Unchanged disposition from `LEARNING_INTELLIGENCE_FRAMEWORK.md` §2.4: genuinely new, groundable in real existing data (`ali_question_bank.estimated_time_seconds`, a possible new elapsed-time capture on `ali_student_question_history`), proposed as a future qualitative band (faster/comparable/slower than expected pace) for a logged Learning Engine V1.1 extension. Not built here.

### 8.2 Durable Mastery

A competency is **Durably Mastered** when: (1) it holds Mastered status (ET-3/ET-4, Demonstrated) under the unmodified mechanism above; (2) it has survived at least one genuine-gap Maintenance Review — real retrieval evidence gathered after time has passed, not the original mastery-earning sessions themselves; and (3) where a real, at-least-Moderate transfer link exists to another competency, the learner has also shown correct performance there. Condition 3 is not required where no meaningful transfer link exists for a given competency. **Data home:** `ali_durable_mastery` (migration `010`), already live, already field-matched to this exact model (Section 7).

### 8.3 Recommendation Model — five categories, now fully mapped

Learning Engine V1 §7's five categories (Practice, Consolidation, Revision, Extension, Review) are unchanged in definition. Section 7's Educational State table above gives each category a concrete, evidence-derived trigger — the "how" this document adds without altering the "what" Learning Engine V1 already specified. **Scope, restated precisely from `RECOMMENDATION_ENGINE_SPECIFICATION.md`:** this Recommendation Model governs the system already implementing Learning Engine V1's competency model (`lib/learningEngine/recommendations.ts`, CSSE-only today). A separate, older, flat-score-based system (`lib/adaptiveEngine.ts`, the Daily Mission engine, covering every subject/pathway) remains outside this document's scope — consolidating the two is a future implementation decision this specification does not make, restated not resolved.

**"Expected improvement" remains explicitly out of scope**, unchanged from `RECOMMENDATION_ENGINE_SPECIFICATION.md` §3 — it is a forecast, directly forbidden by Learning Engine V1 §9, and no Founder decision has reversed that boundary.

## 9. Explainability — three audiences, one engine-level guarantee

**Adopted from the archived EAW-002 §5 and EAW-003 §8, merged into one model.** Every recommendation or conclusion this engine produces must be able to answer three questions — what evidence supports it, why is it shown now, what would change it — and must render that answer differently for three distinct audiences:

| Audience | Register | Example (same underlying conclusion) |
|---|---|---|
| **Learner** | Age-appropriate, encouraging, zero mechanism | "You've been getting these right again and again — nice work!" |
| **Parent** | Plain-language educational reasoning — this is `PARENT_INTELLIGENCE_SPECIFICATION.md`'s `recommendationExplanation` register, unchanged | "Your child has answered Percentages questions correctly across several separate sessions, including one after a two-week break — a strong, well-evidenced sign of real understanding." |
| **Engineering/Audit** | Full raw evidence — competency codes, Evidence Tier, `RecommendationEvidence` fields | `{ basis: "direct-evidence", tier: "ET-4", competency: "MR-04", supporting_attempts: [...] }` |

The engine must always be *able* to produce all three and must log them (Section 10.4's Educational Audit), but this does not mean every answer is shown by default — Learner and Parent surfaces remain governed by this session's own calm-tone Product Experience rule, unchanged.

## 10. Parent Intelligence and Admissions Intelligence — unchanged conclusions, cited not restated

`LEARNING_ENGINE_V1.md` §8's suitable/not-suitable list for parent-facing content is the governing rule and is not restated here; `PARENT_INTELLIGENCE_SPECIFICATION.md`'s audit of the two real parent dashboards against that rule stands unchanged (archived below, its conclusions carried forward by this citation, not reproduced).

`ADMISSIONS_INTELLIGENCE_SPECIFICATION.md`'s conclusions are adopted in full, unchanged: the single real, sourced admissions fact (CSSE's Consortium-wide 303 combined-score floor, Assessment Brain V1 Observation 1) may be shown to a parent only as a separate, historical fact placed *beside* — never blended into — this engine's own Readiness distribution. School Comparison and Target Score Guidance remain **not buildable** without real per-school data acquisition, a Founder/business decision outside this specification's scope, unchanged from that document's own conclusion.

## 11. Data Model

Supersedes `ENTERPRISE_DATA_MODEL.md` in full — every entity restated here with its status updated by this consolidation's findings.

| Entity | Status | Note |
|---|---|---|
| `ali_question_bank`, `ali_student_question_history`, `ali_student_adaptive_state` | **EXISTING** | Unchanged, migrations `005`–`009` |
| `ali_durable_mastery` | **EXISTING, now confirmed as the Durable Mastery Model's real home** (Section 8.2) — previously flagged "unused," now formally the target for a future implementation | Migration `010` |
| `ali_educational_audit` | **EXISTING, now confirmed as the Educational Audit / Historical Progress home** (Sections 7, 10.4) — resolves Learning Engine V1 §3.6's previously-open persistence gap | Migration `010` |
| `topic` | **PROPOSED** | `CSSE_COMPETENCY_TOPIC_MAPPING.md` §1, unchanged |
| `cognitive_class` | **PROPOSED** | Section 6 above (Cognitive Type), 13 rows |
| `cognitive_demand` | **PROPOSED, new in this document** | Section 6 above — a per-question Bloom's-level tag, not yet a named field |
| `reasoning_type`, `common_mistake` | **PROPOSED, not yet buildable/approved** | `CSSE_QUESTION_TAXONOMY.md` §3, unchanged |
| `speed_observation` | **PROPOSED** | Section 8.1, unchanged |
| `school`, `school_admission_threshold`, `consortium_threshold_fact` | **PROPOSED, empty schema only** | Section 10, unchanged — do not populate without real data acquisition |
| `recommendation`, `expected_improvement` | **NOT PERSISTED / NOT PROPOSED** | Section 8.3, unchanged |

## 12. Verification Strategy for future implementation

**Adopted from the archived EAW-005 §3, as the governance template for whichever component of this specification is implemented first** — not tied to the older system it was originally written for. Six dimensions, all required, none sufficient alone: technical correctness; educational correctness (does the system's actual behaviour match Sections 5–8); explainability (Section 9, checked for audience leakage); trust (does confidence-calibrated language ever overclaim its evidence tier); wellbeing protection (Principle 8, adversarially tested under exam-proximity pressure); and existing-behaviour regression (nothing already shipped may silently change).

## 13. What this Engine does not do

Unchanged from Learning Engine V1 §9, restated as binding on this whole document, not only its predecessor: no prediction of future performance or exam outcome; no percentile or peer comparison; no behavioural/psychological modelling; no claim beyond an ET-0 competency's "not yet evidenced" status; no invented competency, domain, or Question Type beyond what Assessment Brain V1 (or a future pathway's own equivalent, Section 4) defines. Two further, newly-explicit exclusions from this consolidation: no School Comparison or Target Score prediction (Section 10) without a separate Founder data-acquisition decision; no "Expected Improvement" field (Section 8.3) without a formal reversal of the no-forecasting boundary.

## 14. Disposition of consolidated sources

| Document | Disposition |
|---|---|
| `LEARNING_INTELLIGENCE_FRAMEWORK.md` | Fully absorbed (Sections 5, 6, 8.1). Archived. |
| `RECOMMENDATION_ENGINE_SPECIFICATION.md` | Fully absorbed (Section 8.3). Archived. |
| `PARENT_INTELLIGENCE_SPECIFICATION.md` | Fully absorbed by citation (Section 10). Archived. |
| `ADMISSIONS_INTELLIGENCE_SPECIFICATION.md` | Fully absorbed (Section 10). Archived. |
| `ENTERPRISE_DATA_MODEL.md` | Superseded in full by Section 11. Archived. |
| `CSSE_EXAMINATION_BLUEPRINT.md`, `CSSE_COMPETENCY_TOPIC_MAPPING.md`, `CSSE_QUESTION_TAXONOMY.md` | **Retained as-is** — factual/content reference material, cited by this document, not duplicative of it. |
| `ARCHITECTURE_CLOSURE_REPORT.md` | **Retained as-is** — the audit trail for every concept extracted into Sections 3, 6, 7, 8, 9, 12. Not superseded; this document could not be re-derived from Assessment Brain V1/Learning Engine V1 alone without it. |
| `ASSESSMENT_BRAIN_V1.md`, `LEARNING_ENGINE_V1.md` | **Unchanged, frozen, foundational.** Not touched by this consolidation. |

## 15. Freeze Declaration

Per this work package's explicit instruction, this document is **frozen on approval**, joining `ASSESSMENT_BRAIN_V1.md` and `LEARNING_ENGINE_V1.md` as the third and final member of the canonical educational architecture. Future changes require a defect correction, new educational evidence, or a formal programme decision — not a routine edit, following the identical discipline both prior documents already established. **No further architecture review of the now-archived legacy documents should be undertaken unless a critical defect is discovered.**

**The programme transitions into implementation mode with immediate effect.** From this point, progress is measured by working software built against Sections 4–11 above, not by further specification documents.

---

**Version History**

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-07-20 | Created — consolidates Assessment Brain V1, Learning Engine V1, ANGEL-CSSE-001 (8 documents), and the Architecture Closure Report into one canonical Educational Intelligence Engine specification, per ANGEL-CSSE-002A. Resolves the Evidence Confidence duplication (Section 5), completes the Educational State ↔ Recommendation Model mapping including the previously-unbuildable Review category (Section 7), and formally separates Educational Intelligence from Exam Intelligence (Section 4). |
