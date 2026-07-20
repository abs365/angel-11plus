# Enterprise Data Model

**Work Package:** ANGEL-CSSE-001 — Deliverable 8
**Status:** Documentation only. Design, not migration. Every entity below is marked **EXISTING** (already live in `supabase/migrations/`, cited by file) or **PROPOSED** (new, required by Deliverables 1-7, not yet built). No proposed entity is created by this document — that is implementation, explicitly out of scope.

---

## 1. Method

This model extends the real, already-deployed schema rather than designing a disconnected one — the same discipline applied throughout this work package. Every EXISTING entity is cited to its migration file; every PROPOSED entity states which Deliverable (1-7) requires it and why it can't be satisfied by an existing table.

## 2. Entity map

### 2.1 Exam Knowledge Layer (Deliverables 1-3)

| Entity | Status | Fields (key ones) | Source / rationale |
|---|---|---|---|
| `assessment_observation` | **PROPOSED** | id, summary, confidence, asset_ids[] | Assessment Brain V1's 13 Observations (§2) currently exist only as prose in a frozen markdown file, not as queryable rows. Proposed so future tooling (e.g. an "evidence trail" UI) can trace a competency back to its observation programmatically. |
| `competency` | **PROPOSED** (schema) / **PARTIALLY EXISTING** (referenced) | id (`RC-01` etc.), name, domain, component, confidence, emc_rating | Assessment Brain V1's 13 competencies are already referenced by ID throughout the live code (`lib/learningEngine/assessmentBrainMap.ts`'s `COMPETENCIES` constant) — that TypeScript object is the de facto existing table; this entity formalises it as a real row-per-competency structure if a database-backed (rather than code-constant) version is ever needed. |
| `question_type` | **PARTIALLY EXISTING** (referenced) | id (`QT-MR-04` etc.), name, component, primary_competency_id, confidence, emc_rating | Same status as `competency` — the 27 Question Types exist as a code constant (`assessmentBrainMap.ts`), not a database table. No migration currently persists them independently of `ali_question_bank.skill`, which stores the Question Type ID as a free-text field (migration `005`), not a foreign key to a real `question_type` table. |
| `topic` | **PROPOSED** | id, name, parent_competency_id | New in this work package (`CSSE_COMPETENCY_TOPIC_MAPPING.md` §1) — the curriculum-content layer beneath competencies. Does not exist in any form today. |
| `ali_question_bank` | **EXISTING** | id, subject, skill (Question Type ID), pathway[], content_difficulty, question_type, estimated_time_seconds, prompt (jsonb), explanation, learning_unit_id, addresses_misconception, transfer_links | Migrations `005`, `007`, `009`. This is the real Question Instance table — see Deliverable 3 §2's distinction. `year` (requested by Deliverable 3) is **not** a column and is deliberately not proposed as one for real historical questions (Deliverable 3 §1) — if ever added, it must default to `null` for all original content. |
| `reasoning_type` | **PROPOSED, not yet approved** | enum: retrieval / inference / computation / application / evaluation | `CSSE_QUESTION_TAXONOMY.md` §3 — explicitly flagged as requiring Founder approval before being added to `ali_question_bank`. |
| `common_mistake` | **PROPOSED, not yet buildable** | question_id (fk), pattern_description, frequency_count | `CSSE_QUESTION_TAXONOMY.md` §3/§6 — depends on aggregating real wrong-answer data from `ali_student_question_history` (below) at volume; not buildable until that volume exists. |

### 2.2 Learner Evidence Layer (Deliverable 4)

| Entity | Status | Fields (key ones) | Source / rationale |
|---|---|---|---|
| `ali_student_question_history` | **EXISTING** | profile_id, question_id, source, times_seen, times_correct, distinct_correct_sessions, last_presented_at, last_presented_at_sequence, mastery_state | Migration `006`. This is the real, live raw layer behind Learning Engine V1 §3.1 (Question Type Exposure). |
| `ali_student_adaptive_state` | **EXISTING** | profile_id, questions_presented_count | Migration `006`. |
| `ali_durable_mastery` | **EXISTING** | profile_id, competency_code, validated, maintenance_reviews (jsonb), transfer_corroboration (jsonb), durable | Migration `010`. Real, live persistence for a durable-mastery concept, currently unused by any Wave-1-4 code path (confirmed in this session's own prior work) — a genuine "built but not yet wired up" gap, not a missing table. |
| `ali_educational_audit` | **EXISTING** | id, conclusion_type, learner_id, competency_or_dimension, confidence_tier_at_time, concluded_at, superseded_by, supersede_reason | Migration `010`. Append-only evidence-conclusion log — already structurally capable of recording an Evidence Signal/Tier conclusion at a point in time, which is exactly what Learning Engine V1 §3.6 (Historical Progress) needs and currently lacks a persistence mechanism for (per this codebase's own prior finding). **This existing, unused table is very likely the correct home for Historical Progress persistence** — flagged as a strong candidate for a future implementation work package, not built here. |
| `speed_observation` | **PROPOSED** | profile_id, question_id, elapsed_seconds, expected_seconds (fk to `ali_question_bank.estimated_time_seconds`), band (faster/comparable/slower) | `LEARNING_INTELLIGENCE_FRAMEWORK.md` §2.4 — requires one new column (a submission/elapsed-time capture) on top of the existing `ali_student_question_history` timestamp, not a new subsystem. |
| `cognitive_class` | **PROPOSED** | competency_id (fk), class (Knowledge / Skill / Reasoning) | `LEARNING_INTELLIGENCE_FRAMEWORK.md` §2.3 — a static classification table, 13 rows, one per existing competency. |

**Confidence/Accuracy/Consistency:** no new entity required — these are already fully computable from `ali_student_question_history` via the existing `lib/learningEngine/rollup.ts`/`diagnostics.ts` logic (Evidence Signal, Evidence Tier), per `LEARNING_INTELLIGENCE_FRAMEWORK.md` §2.1-2.2.

### 2.3 Recommendation Layer (Deliverable 5)

| Entity | Status | Fields | Source / rationale |
|---|---|---|---|
| `recommendation` | **NOT PERSISTED (computed live)** | category, competency_id, reason | `lib/learningEngine/recommendations.ts`'s `computeRecommendations()` returns this shape today, computed fresh on every page load, never written to a table. No change proposed — Learning Engine V1 §7 defines categories only, and persisting recommendation history is a new capability with no current requirement driving it. |
| `expected_improvement` | **NOT PROPOSED** | — | `RECOMMENDATION_ENGINE_SPECIFICATION.md` §3 — directly conflicts with Learning Engine V1 §9's no-forecasting boundary; no entity is proposed for a field that should not be built without a formal boundary reversal. |

### 2.4 Admissions Layer (Deliverable 7)

| Entity | Status | Fields | Source / rationale |
|---|---|---|---|
| `school` | **PROPOSED, empty schema only** | name, consortium/board, catchment_description, admissions_policy_url, last_verified_date | `ADMISSIONS_INTELLIGENCE_SPECIFICATION.md` §4 — explicitly recommended to be built empty or not at all until a real data-sourcing decision is made (§6). |
| `school_admission_threshold` | **PROPOSED, empty schema only** | school_id (fk), intake_year, minimum_score, score_scale_max, source_citation, confidence_rating | Same status — the one real data point currently available (the CSSE Consortium-wide 303 floor, Assessment Brain V1 Observation 1) is Consortium-level, not school-level, and does not populate this table without further real research. |
| `consortium_threshold_fact` | **PROPOSED** | consortium_id, description, value, source_asset_id, confidence | The correct home for the one real fact that does exist today (303) — deliberately modelled as a separate, smaller entity from `school_admission_threshold` so a real Consortium-wide historical fact is never conflated with an unverified per-school figure. |

## 3. Referential integrity notes

- `ali_question_bank.skill` (existing, migration `005`) is currently a free-text column storing a Question Type ID — **not** a foreign key to any `question_type` table, because no such table exists yet (Section 2.1). Any future implementation adding a real `question_type` table should migrate this column to a proper foreign key, not duplicate the ID as a second free-text field.
- `topic`, `cognitive_class`, and `reasoning_type` are all **additive classification layers** on top of the existing `competency`/`ali_question_bank` structures — none requires altering any existing table's primary data, only adding new lookup tables and (where noted) new nullable columns.
- `school` / `school_admission_threshold` / `consortium_threshold_fact` are intentionally modelled as **standalone**, with no foreign key into the learner-evidence layer (`ali_student_question_history` etc.) — per `ADMISSIONS_INTELLIGENCE_SPECIFICATION.md` §5, admissions facts and pedagogical evidence must be presentable independently, never joined into a single computed "likelihood" value.

## 4. What this document does not do

No `CREATE TABLE` statement, no migration file, and no application code accompanies this document. Every PROPOSED entity requires its own future, separately-authorised implementation work package — consistent with this whole work package's closing instruction: *"Implementation follows documentation approval."*
