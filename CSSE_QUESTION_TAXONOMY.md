# CSSE Question Taxonomy

**Work Package:** ANGEL-CSSE-001 — Deliverable 3
**Status:** Schema only. Documentation only. **Does not classify any individual historical exam question**, for the reasons stated in Section 1 — this is a deliberate, disclosed scope limit, not an omission.

---

## 1. Why this document does not "classify every historical question"

The work package asks for a taxonomy that classifies every historical CSSE question by Question ID, Year, Paper, Topic, Competencies, Difficulty, Expected time, Marks, Reasoning type, and Common mistakes. Producing that would require one of two things, and this document does neither:

1. **Direct access to the real, individual CSSE exam questions**, year by year — this repository holds no such database. Assessment Brain V1 was built by a prior work package that had temporary access to 17 real exam-paper/marking-scheme assets and distilled them into aggregate Observations, Competencies, and Question *Types* (format-level categories — e.g. "Literal Short-Answer Retrieval" — not individual question instances). That distillation is real and is reused below. The individual source papers themselves are not held in this repository, and this work package was not given access to them.
2. **Fabricating individual question records** — inventing plausible-sounding "historical" questions, years, difficulty ratings, and common-mistake notes and presenting them as if they were real classified exam content. This would be a direct, serious violation of this whole project's evidence-first discipline, and would actively conflict with Angel 11+'s own consistent legal position, stated on every relevant page in the live product (`/mocks`, `/pathways`, `/terms`): *"original exam-style practice... not affiliated with or endorsed by any exam board or school."* A taxonomy of fabricated "real" CSSE questions, presented as historical fact, would misrepresent Angel 11+'s content as officially sourced when the product's own stated identity is the opposite. This is the same refusal pattern already established in this project's own history — noted in this codebase as "the AEP-002 CSSE-papers block."

**What this document does instead:** define the *schema* every requested field implies — the structure a real Question Taxonomy would need, ready to be populated the moment real, licensed source material or Angel's own original content is available — and reconcile it against the 27 Question Types Assessment Brain V1 already, legitimately derived from real exam evidence (aggregate format-level classification, not individual question reproduction).

## 2. Two distinct things this taxonomy must not conflate

- **Question Type** (Assessment Brain V1, existing, frozen) — a recurring *format* through which a competency is assessed (e.g. "QT-MR-04: Percentage / Proportional Change"). 27 of these exist, fully evidence-graded, already documented in `ASSESSMENT_BRAIN_V1.md` §9.
- **Question Instance** (this document's schema, currently **unpopulated**) — one specific, individual question that appeared in one specific paper in one specific year, or one specific piece of Angel's own original practice content. This is the level of granularity the work package's requested fields (Question ID, Year, Common mistakes, etc.) actually describe. Angel 11+ already has real Question Instances of its own original content in production (`supabase/migrations/013_wave2_illustrative_practice_content.sql` — 18 rows, each tagged against a real Question Type ID) — these are real, but they are Angel's own original content, not reproduced historical CSSE questions, and are already schema-compatible with what follows.

## 3. Question Instance schema

| Field (as requested) | Definition | Populated from |
|---|---|---|
| Question ID | Unique identifier, `{subject-prefix}-{sequence}` (existing convention, e.g. `eng-001-q2`, `mth-002`) | Content authoring |
| Year | The exam year a real historical question is drawn from, **or** `null`/`"original"` for Angel's own content | Content authoring; must be `null` for any non-licensed original question, never a fabricated year |
| Paper | Which paper the question belongs to (`English`, `Mathematics`) | Content authoring |
| Question Type ID | Foreign key to Assessment Brain V1's 27 Question Types (e.g. `QT-MR-04`) — **not** a free-text "Topic" field, to avoid re-inventing a second, un-reconciled taxonomy alongside the one that already exists | Assessment Brain V1 §9 |
| Topic | Foreign key to `CSSE_COMPETENCY_TOPIC_MAPPING.md`'s Topic layer (Deliverable 2) — the curriculum content area, distinct from Question Type | This document's Deliverable 2 |
| Competency ID | Foreign key to Assessment Brain V1's 13 Competencies — derived from Question Type ID, not set independently (a Question Type has exactly one Primary Competency, per Assessment Brain V1 §9's Cross Reference Matrix) | Assessment Brain V1 §9 |
| Difficulty | Content-authoring-time judgement (`easy` / `medium` / `hard` / `challenge`) — already a real, live field (`content_difficulty` enum, migration `005_ali_question_bank.sql`) | Content authoring |
| Expected time (seconds) | Already a real, live field (`estimated_time_seconds`, migration `005`) | Content authoring, informed by the paper-level timing in `CSSE_EXAMINATION_BLUEPRINT.md` where a real per-section time budget exists |
| Marks | Points value if this question were sat under real exam conditions; for original practice content, an author-assigned equivalent | Content authoring |
| Reasoning type | **Not currently a live field anywhere in this codebase.** Proposed values: `retrieval`, `inference`, `computation`, `application`, `evaluation` — mirrors common taxonomic language (e.g. Bloom's-adjacent), but is a **new field this document proposes**, not one already evidenced in Assessment Brain V1. Flagged for Founder approval before being added to the live schema (Section 8, Enterprise Data Model, marks this as proposed, not existing) |
| Common mistakes | **Not currently a live field anywhere in this codebase**, and **cannot be populated from real historical exam data without real marking-scheme access showing actual candidate error patterns** — the 17 Knowledge Assets include marking schemes (correct-answer keys) but this repository's own evidence trail does not establish that they include examiner reports or error-frequency data. Populating this field with invented "common mistakes" would be exactly the fabrication this document refuses to do elsewhere. Proposed as a schema field, to be populated only from real diagnostic data gathered from Angel's own learners over time (i.e., which wrong answers real users actually submit most often — a real, buildable capability, addressed in Section 7 below) |

## 4. What can be populated today, honestly

The 27 Question Types (format-level, not individual-question-level) are already fully classified — reproduced by reference, not duplicated, from `ASSESSMENT_BRAIN_V1.md` §9: each has a Question Type ID, Name, Assessment Component, Primary Competency, source Observation(s), source Asset ID(s), a Confidence rating, and an EMC rating. This is the taxonomy's format layer, complete and evidence-graded.

The 18 real Question Instances Angel has already authored (`013_wave2_illustrative_practice_content.sql`) are already tagged against real Question Type IDs, with real `content_difficulty` and `estimated_time_seconds` values — these are genuine, populated rows in the schema above, at the columns that don't require historical-year data (`Year` is correctly absent/null for all of them, since they are original content, not reproduced exam questions).

## 5. What cannot be populated today, and why

- **Individual historical (Year-tagged) question records** — no source access, per Section 1.
- **Common mistakes** — no error-frequency source data exists yet (Section 3); this becomes buildable once real learners generate real wrong-answer data (Section 7).
- **Reasoning type** — proposed but not yet a Founder-approved schema field; not populated pending that decision.

## 6. Recommended path to real population, not performed here

1. **Founder decision:** whether to pursue a real, licensed relationship with the CSSE Consortium for access to genuine historical papers (would resolve Section 5's first gap) — a business/legal decision, not a documentation one.
2. **Absent that, Angel's own original-content authoring continues to be the taxonomy's real population source** — every new practice question Angel writes should be authored directly against this schema from the start (Question Type ID, Competency ID via that Type, Topic, Difficulty, Expected time, Marks), which is already largely happening (Section 4).
3. **Common mistakes becomes buildable once `ali_student_question_history` (migration `006`) has enough real submitted-answer volume** — the live schema already records `times_seen`/`times_correct` per question per learner; a wrong-answer-pattern aggregate is a real, additive capability on top of existing data, not a new data-collection mechanism. Flagged in `ENTERPRISE_DATA_MODEL.md` (Deliverable 8) as a proposed future entity, not built here.
