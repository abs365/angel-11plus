# AIW-001: Educational Data Model

**Document ID:** AIW-001
**Programme:** Angel Excellence Programme — Implementation Wave (Document 1)
**Status:** DRAFT — awaiting Founder review and approval
**Project:** Angel 11+
**Owner:** ELBOLD
**Last Updated:** 2026-07-18
**Governing documents (Version 1.0 Educational Architecture, frozen APD-007):** `AEP-001_LEARNING_SCIENCE_CONSTITUTION.md`, `AEP-002_KNOWLEDGE_FRAMEWORK.md`, `AEP-003_QUESTION_INTELLIGENCE_FRAMEWORK.md`, `AEP-004_LEARNING_JOURNEY_FRAMEWORK.md`, `AEP-005_ASSESSMENT_FRAMEWORK.md`, `ARR-001_ARCHITECTURE_READINESS_REVIEW.md`.

**Purpose:** Translate the frozen Discovery Wave architecture into an implementation-ready data model — the entities, fields, and relationships a future engineering effort would build against, and how they relate to Angel's real, existing schema (`ali_question_bank`, `ali_student_question_history`, `ali_student_adaptive_state`, `ali_mastery_defaults`). **This is a data model, not code.** No SQL, no migration files, no TypeScript are written here — illustrative shape sketches below are explicitly labelled as such, following the same convention `ALI_CROSS_SUBJECT_INTELLIGENCE.md` §1.3 already established for describing a data shape without creating it.

**Standing constraint:** every entity and relationship below is additive to Angel's existing schema. Nothing in this document proposes altering the meaning, structure, or behaviour of `mastery_state`, the cooldown mechanism, or any other existing, working ALI mechanism — per ARR-001 §5's finding, the entire Discovery Wave added zero lines to any pre-existing document or mechanism, and this Implementation Wave document preserves that discipline at the data-model level.

---

## 1. Educational Entities

The complete set of "things" the educational data model must represent, distinguishing what already exists from what AEP-001–005 introduced as new concepts:

| Entity | Status | Real/proposed source |
|---|---|---|
| Learner (Profile) | Existing, unchanged | `profiles` |
| Pathway | Existing (partial — 4 of 6 pathways), extended | `pathway` field values; AEP-002 §13 adds Independent School, Custom Programme |
| Knowledge Domain | Existing content, newly named/organised | AEP-002 §1 (8 domains) |
| Competency | Existing (VR, Maths, partial English/Vocabulary), newly created (NVR, Spatial, Mathematical Reasoning) | `QUESTION_AUTHORING_STANDARD.md` §3/§11, `ENGLISH_COMPETENCY_FRAMEWORK.md`, `VOCABULARY_COMPETENCY_FRAMEWORK.md`, AEP-002 §2.3–2.5 |
| Question | Existing, extended | `ali_question_bank`; AEP-003 §4/§7 add two new optional fields |
| Attempt (evidence event) | Existing, unchanged | `ali_student_question_history` |
| Mastery State | Existing, unchanged | `ali_student_question_history.mastery_state`, `ali_mastery_defaults` |
| Durable Mastery Record | **New** | AEP-004 §9.6, AEP-005 §10 |
| Maintenance Review | **New** | AEP-004 §9.2 |
| Competency Relationship (transfer/cross-subject edge) | Designed, not yet built | `ALI_CROSS_SUBJECT_INTELLIGENCE.md` §1.3, extended by AEP-002 §10 |
| Misconception | **New as a named entity** (previously only informal per-competency error text) | AEP-002 §4, AEP-003 §4 |
| Recommendation (with evidence and explanation) | Partially existing (Daily Mission urgency ranking), extended | `lib/adaptiveEngine.ts`; AEP-004 §12, AEP-005 §8 add evidence/explanation structure |
| Parent Report | Existing, extended | `ALI_PARENT_INTELLIGENCE.md`'s `ParentReport`/`competencySummaries` |
| Curriculum Gap | Existing (as a document, not data) | `CURRICULUM_GAP_REGISTER.md` |
| Educational Audit Record | **New** | This document, §10 |

**Architecture vs. implementation:** which entities exist conceptually is architecture (settled by AEP-001–005); how each is physically stored (a new table vs. a new column vs. a computed value) is an implementation decision this document informs but does not finalise.

---

## 2. Knowledge Graph

AEP-002's domain and competency map (§1–§2) and relationship graph (§10) are represented as a graph, not a fixed formula, exactly as `ALI_CROSS_SUBJECT_INTELLIGENCE.md` §1.3 already proposed and this document extends to full coverage (63 competency codes, not just the original 6 illustrative edges):

```
KnowledgeDomain { code, label, ali_covered: boolean, pathways_relevant: Pathway[] }
Competency { code, domain_code, label, populated: boolean }
CompetencyRelationship {
  fromCompetency: string
  toCompetency: string
  relationshipType: "shared-mechanism" | "sequential-dependency"
  strength: "strong" | "moderate" | "weak"
  rationale: string
}
```
*(Illustrative shape only, per `ALI_CROSS_SUBJECT_INTELLIGENCE.md`'s own convention — no table or type is created by this document.)*

This is unchanged in shape from the existing design — this document's contribution is confirming the shape scales to AEP-002's full 63-code, 8-domain graph (including the newly-taxonomised NVR/Spatial/Mathematical Reasoning domains) without redesign, the same "additive by construction" property `ALI_CROSS_SUBJECT_INTELLIGENCE.md` §5.3 already claimed and this document re-verifies at full scale.

---

## 3. Competency Model

Every competency code is a member of one closed vocabulary (AEP-002 §2.6's 63 named codes), belongs to exactly one domain, and every question maps to exactly one competency as its primary tag (`QUESTION_AUTHORING_STANDARD.md` §11.3's rule, extended to every domain by AEP-003 §3). Three domains (NVR, Spatial, Mathematical Reasoning) have real content and a real competency taxonomy (AEP-002 §2.3–2.5) but **no `ali_question_bank`-equivalent row shape or hand-tagging pass yet** — this is the single largest concrete implementation task this data model surfaces, not a design ambiguity: the shape to build is already proven (identical to VR/Maths's existing rows), only the population is missing.

**Architecture vs. implementation:** the competency vocabulary and one-per-question rule are architecture (AEP-002/AEP-003); whether the vocabulary is enforced via a database enum, a foreign key to a lookup table, or an application-layer check is an implementation decision.

---

## 4. Question Metadata

Consolidating `QUESTION_AUTHORING_STANDARD.md` §1's existing fields with AEP-003's two new optional additions, as one data dictionary:

| Field | Status | Definition |
|---|---|---|
| `id`, `subject`, `skill`, `content_difficulty`, `question_type`, `estimated_time_seconds`, `explanation`, `hint`, `confidence_weight`, `learning_objective`, `revision_priority`, `mastery_threshold` | Existing, unchanged | `QUESTION_AUTHORING_STANDARD.md` §1 |
| `pathway` | Existing, value set extended | Must now range over all 6 pathways (AEP-002 §13); validated against AEP-002 §6's Examination Application Map (AEP-003 §8's rule: a domain must never carry a pathway value the board doesn't test) |
| `addresses_misconception` | **New, optional** | AEP-003 §4 — links to a named Misconception entity (§1 above) |
| `transfer_links` | **New, optional** | AEP-003 §7 — links to related competency codes per the Knowledge Graph (§2) |
| Cognitive Demand level | **New, optional metadata concept, not yet a field name** | AEP-003 §6 — Bloom's-Taxonomy-based classification (Remember/Understand/Apply/Analyse/Evaluate/Create); this document flags it as a genuine future field but does not name its exact storage form, since AEP-003 itself introduced the concept without specifying implementation |

**Architecture vs. implementation:** the two new AEP-003 fields' *meaning* and *optionality* are architecture; their exact column type (a nullable foreign key vs. a text tag) is implementation.

---

## 5. Assessment Evidence Model

`ali_student_question_history` already captures the correct unit of evidence — one row per `(profile, question)` with correctness, sequencing, and the timestamp fields Decision 20 added (`last_attempt_correct`, `second_last_attempt_correct`) — and is unchanged by this document. AEP-005's Evidence Confidence Model (§6 of that document) requires no new capture at all — every input it needs (attempt count, session distinctness, time-spread between attempts, the question's own `confidence_weight`) already exists in this table or in `Question Metadata` (§4 above). **The Assessment Confidence tier is a computed, derived value, not a new stored fact** — consistent with the same "derived, not a new source of truth" principle `ALI_CROSS_SUBJECT_INTELLIGENCE.md` §2.3 already established for the Learner Profile.

---

## 6. Mastery Model

`ali_student_question_history.mastery_state` and `ali_mastery_defaults` are cited as correct and unmodified — this document does not propose changing the mastery mechanism itself in any way. It formalises the model's shape as: one state per `(learner, competency)` [technically per `(learner, question)` today, aggregated to competency level for reporting], with a distinct-correct-session counter, a revocable state (one wrong answer post-mastery demotes it, Decision 20/21), and a `mastery_threshold` sourced from `ali_mastery_defaults` by `content_difficulty` unless a per-question override exists (`QUESTION_AUTHORING_STANDARD.md` §8). This is a restatement for completeness, not a new design.

---

## 7. Durable Mastery Model

Operationalising AEP-004 §9.6 / AEP-005 §10 as a concrete, additive record — new, and explicitly sitting *beside* the Mastery Model (§6), never replacing it:

```
DurableMasteryRecord {
  learner_id, competency_code
  mastery_achieved_at: timestamp        // when mastery_state first reached "mastered"
  maintenance_reviews: [
    { attempted_at, gap_days_since_last_evidence, correct: boolean }
  ]
  transfer_corroboration: {
    linked_competency_code: string | null   // per Knowledge Graph, §2
    corroborated: boolean | null             // null if no strong link exists (AEP-005 §10's stated exception)
  }
  durable: boolean   // true once §10's 2-or-3 conditions from AEP-005 are satisfied
}
```
*(Illustrative shape only — no table is created by this document.)*

This record answers exactly the question AEP-005 §10 posed: has this competency survived a genuine gap, and — where a real transfer link exists — been corroborated in a different context. `durable` is a derived boolean computed from the record's own fields, not an independently-set flag, preserving the same non-fabrication discipline as every other derived signal in this architecture (`LEARNING_PROFILE_MODEL.md` §1's honest-`null` precedent).

---

## 8. Recommendation Evidence Model

New — the data structure a Recommendation Explanation (AEP-004 §12) is generated from, and the same structure that lets any recommendation be checked against ALI's Direct Evidence principle before it is ever surfaced:

```
RecommendationEvidence {
  learner_id, recommended_competency_code
  basis: "direct-evidence" | "shared-mechanism" | "sequential-dependency"
  source_competency_code: string | null   // populated only for shared-mechanism/sequential-dependency bases
  relationship_strength: "strong" | "moderate" | "weak" | null   // per Knowledge Graph edge, §2
  confidence_tier: "high" | "moderate" | "low" | "insufficient"   // per AEP-005 §6, of the source evidence
  eligible_to_display: boolean   // false if a direct-evidence slot already claims this recommendation (ALI_CROSS_SUBJECT_INTELLIGENCE.md §4's safety rule, unmodified)
}
```
*(Illustrative shape only.)*

**This is the single mechanism through which every existing safety rule in this whole programme remains structurally enforced, not just documented:** `eligible_to_display` being computed from whether direct evidence already claims the slot is the same "reserved-before-general-sample" pattern (Decision 17) and "additive-only, cannot bump direct evidence" rule (`ALI_CROSS_SUBJECT_INTELLIGENCE.md` §4.2) already proven in ALI's real, shipped code — this document does not invent a new safety mechanism, it extends the existing one's data shape to cover misconception-based and transfer-based recommendations (AEP-003 §12) in addition to the cross-subject recommendations it already covered.

---

## 9. Parent Reporting Model

`ALI_PARENT_INTELLIGENCE.md`'s existing `ParentReport`/`competencySummaries` shape (Strengths, Improving, Focus Next, Recently Mastered) is cited unchanged. This document adds three new, optional fields this shape would need once AEP-004/005's new concepts are built:

- `durablyMastered: string[]` — competency codes with a `durable: true` Durable Mastery Record (§7), for eventual display as a stronger-worded confidence signal than ordinary "mastered," consistent with AEP-005 §12's confidence-calibrated language requirement
- `recommendationExplanation: string` — the plain-language text generated from a `RecommendationEvidence` record (§8), never exposing `basis`, `confidence_tier`, or any other raw field name, per Invisible Intelligence
- `wellbeingSignal: "steady" | "may benefit from a lighter week" | null` — a deliberately coarse, qualitative flag, never a numeric score, per AEP-005 §13's explicit rejection of reducing Confidence & Wellbeing to a metric

**Architecture vs. implementation:** the *existence and plain-language nature* of these three fields is architecture (AEP-004/AEP-005); their exact display location on `/parent` is a UX/implementation decision outside this document's scope.

---

## 10. Educational Audit Model

New — required by this Version 1.0 architecture's own freeze condition (APD-007: future changes require a defect correction, new evidence, or a formal programme decision) and by AEP-003 §14's "Flagged for Review" lifecycle, both of which imply conclusions can be revised and that revision should be traceable:

```
EducationalAuditRecord {
  conclusion_type: "mastery" | "durable-mastery" | "recommendation" | "readiness-dimension"
  learner_id, competency_or_dimension
  confidence_tier_at_time: "high" | "moderate" | "low" | "insufficient"
  concluded_at: timestamp
  superseded_by: EducationalAuditRecord.id | null
  supersede_reason: "new-evidence" | "defect-correction" | "programme-decision" | null
}
```
*(Illustrative shape only.)*

This is the data-level mechanism making Assessment Integrity (AEP-005 §7) auditable rather than only asserted — any future question "why did Angel say this on this date, and did that change" has a real answer. It is also the natural home for AEP-003 §14's "Flagged for Review" event and for tracking when a `docs/research/` evidence migration (AEP-001/AEP-002's standing recommendation) causes an existing rating to be revised.

---

## 11. Migration Impact

**No migration is written by this document.** Stated at the conceptual level, consistent with this project's own established additive-migration convention (nullable → backfilled → `NOT NULL`, per migration 007's `learning_unit_id` precedent):

| Existing table | Impact |
|---|---|
| `ali_question_bank` | Two new nullable columns (`addresses_misconception`, `transfer_links`); `pathway` value set extended (no schema change, since it is already a set/array type per `QUESTION_AUTHORING_STANDARD.md` §1) |
| `ali_student_question_history`, `ali_student_adaptive_state`, `ali_mastery_defaults` | **Unchanged** |
| `profiles`, `user_stats`, `lesson_progress` | **Unchanged** |

| New table (conceptual) | Purpose |
|---|---|
| Durable Mastery table | §7 |
| Maintenance Review log (may be embedded in the Durable Mastery table rather than separate — an implementation choice, not settled here) | AEP-004 §9.2 |
| Recommendation Evidence table or ephemeral computed record (may not need persistence at all if computed at request time — an open implementation question) | §8 |
| Educational Audit table | §10 |
| NVR / Spatial / Mathematical Reasoning question bank rows | Population of the existing `ali_question_bank` shape (§3) — not a new table shape, a new data-population effort |

**A known operational risk to name, grounded in this project's own history:** `ALI_OPERATIONAL_VALIDATION.md` (Phase 5B.8) recorded a real PostgREST schema-cache staleness issue immediately after DDL changes to existing tables. Any future migration implementing this data model should expect and check for the same class of issue, exactly as that document already recommends.

---

## 12. Engineering Considerations

- **Real-time vs. batch:** `mastery_state` sits on the critical path of every adaptive mock (unchanged). Durable Mastery, Recommendation Evidence, and Educational Audit records are all naturally batch/async-computable — none require a synchronous write inside an active exam session, consistent with this project's standing "no live server round-trips inside an exam runner" architectural decision (`ADAPTIVE_ASSESSMENT_ENGINE_ARCHITECTURE.md`).
- **Derived vs. stored:** following `ALI_CROSS_SUBJECT_INTELLIGENCE.md` §2.3's precedent, Evidence Confidence tiers (AEP-005 §6) and the `durable` boolean (§7) should be computed at read-time or cached, never treated as an independent source of truth that could silently drift from the underlying attempt evidence.
- **RLS must be decided deliberately for every new table, not left ambiguous** — this project has a real, documented history (`PROFILES_RLS_INVESTIGATION.md`, Phase 5B.6–5B.8) of RLS state drifting from what every migration file claims. Any implementation of this data model should state each new table's RLS posture explicitly in its own migration, not assume a default.
- **Schema-cache reload** should be an explicit step (or verified) after any DDL implementing this model, per §11's cited operational history.
- **This document does not schedule, estimate, or assign engineering ownership for any of the above** — it is a data model, offered for an implementation team to plan against, not a project plan in itself.

---

## 13. Educational Outcome

*(Required section, continuing the standard established by AEP-001 §8 and carried into this Implementation Wave document by consistency, not a separate mandate.)*

**Understanding:** this document turns five documents' worth of educational reasoning into a single, concrete inventory of what data must exist and mean — an implementation team can now build against a specified model rather than re-interpreting AEP-001–005's prose independently.

**Confidence:** the Recommendation Evidence Model (§8) makes ALI's Direct Evidence principle a structural property of the data itself (`eligible_to_display` computed from whether a direct-evidence slot is already claimed), not a rule an implementer has to remember to apply correctly — reducing the risk that a future feature accidentally violates a safety rule this whole programme depends on.

**Examination performance:** the Durable Mastery Model (§7) and Assessment Evidence Model (§5) together give a future readiness calculation real, auditable data to work from, rather than requiring new capture — most of what AEP-005 needs already exists in `ali_student_question_history`.

**Long-term learning:** the Educational Audit Model (§10) is what makes this whole architecture's own central claim — that conclusions are evidence-based and open to revision when better evidence arrives — something the system can demonstrate over time, not just assert once.

---

No production code, migration, or schema is created by this document. It is delivered for Founder review and approval before further Implementation Wave documents proceed.
