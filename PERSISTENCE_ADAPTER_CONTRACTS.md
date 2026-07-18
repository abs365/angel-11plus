# Persistence Adapter Contracts

**Status:** Living implementation documentation. Created 2026-07-18 per Programme Decision APD-040 (Persistence Contract Documentation).
**Purpose:** Every persistence adapter in `lib/ali/persistence/` documented against a fixed 5-field contract — inputs, outputs, empty-state behaviour, failure semantics, domain invariants — so the boundary between storage and the educational engine (Programme Decision APD-039, Persistence as an Adapter) stays legible as the engine grows, without requiring a reader to reconstruct each adapter's contract from its implementation.

**The governing rule this register exists to keep visible:** every function below translates persistent data into the domain model the educational engine already defines (`types/ali/*`) — none of them contains educational reasoning of its own. If a future adapter is ever tempted to add a conditional that changes an educational conclusion rather than just fetching or storing one, that is a violation of APD-039, not a persistence detail.

---

## `fetchDurableMasteryRecord` / `saveDurableMasteryRecord` (`lib/ali/persistence/durableMasteryStore.ts`, WP-17)

| Field | Value |
|---|---|
| **Inputs** | `fetch`: Supabase client, `profileId`, `competencyCode`. `save`: Supabase client, `profileId`, a `DurableMasteryRecord` (already evaluated by WP-07's `evaluateDurableMastery()` — this adapter never computes `durable` itself). |
| **Outputs** | `fetch`: `DurableMasteryRecord \| null`. `save`: `boolean` (success/failure), no partial-success state. |
| **Empty-state behaviour** | `fetch` returns `null` when no row exists for the (profile, competency) pair — this is the honest "never evaluated yet" state, never fabricated as an all-false record. |
| **Failure semantics** | Never throws. A Supabase error is logged via `console.warn` and treated as `null`/`false` — matching `lib/ali/questionBank.ts`'s established `fetchQuestionBank()` precedent exactly, so a genuinely unreachable database degrades the same way every other ALI read path already does. |
| **Domain invariants** | The `(profile_id, competency_code)` pair is unique (migration 010's constraint) — `save` is always an upsert, never risks duplicate rows. `jsonb` fields round-trip through `MaintenanceReviewRecord[]`/`TransferCorroboration` exactly as WP-07 defined them; this adapter does not reshape either. |

---

## `insertAuditRecord` / `supersedeStoredAuditRecord` / `fetchCurrentAuditRecord` (`lib/ali/persistence/auditStore.ts`, WP-17)

| Field | Value |
|---|---|
| **Inputs** | `insert`: a complete `EducationalAuditRecord` (already constructed by WP-11's `createAuditRecord()`). `supersede`: the previous record's `id`, the new record's `id`, a `SupersedeReason`. `fetchCurrent`: `learnerId`, `competencyOrDimension`. |
| **Outputs** | `insert`: the inserted row's `id` (`string \| null` on failure). `supersede`: `boolean`. `fetchCurrent`: `EducationalAuditRecord \| null` — the most recent record for that pair with `superseded_by is null`. |
| **Empty-state behaviour** | `fetchCurrent` returns `null` when no conclusion has ever been reached for that learner/competency — never a fabricated "insufficient" record; the absence itself is the signal. |
| **Failure semantics** | Never throws; `console.warn` + a safe fallback, same convention as every other adapter in this module. |
| **Domain invariants** | **Immutable, append-only** (Programme Decision APD-029) — `supersede` is the *only* update this adapter ever issues against this table, and it touches exactly two columns (`superseded_by`, `supersede_reason`), never any other field on the row. A new conclusion is always a new `insert`, never an overwrite of the old one. |

---

## `insertOperationalEvent` / `fetchAllOperationalEvents` / `applyRetentionPartition` (`lib/ali/persistence/operationalEventStore.ts`, WP-17)

| Field | Value |
|---|---|
| **Inputs** | `insert`: an `OperationalEvent`. `fetchAll`: Supabase client only. `applyRetentionPartition`: a `cutoffTimestamp`, and the `AggregatedEventCount[]` WP-11's pure `partitionOperationalEvents()` already computed. |
| **Outputs** | `insert`/`applyRetentionPartition`: `boolean`. `fetchAll`: `OperationalEvent[]` (empty array on failure or genuine absence — indistinguishable by design, since neither case warrants different caller behaviour). |
| **Empty-state behaviour** | An empty array from `fetchAll` is valid and expected for a learner with no recorded Automatic-tier activity yet — not an error state. |
| **Failure semantics** | Never throws; `console.warn` + empty-array/`false` fallback. |
| **Domain invariants** | `applyRetentionPartition` deletes strictly by date boundary (`occurred_at <= cutoffTimestamp`), never by re-matching specific event objects already held in memory — the real bug this adapter's construction caught and fixed (WP-17's own implementation report). The aggregate table never receives a `learner_id`, by construction of the upsert payload — it is not merely convention, the adapter's write path has no field to put one in even if a caller tried. |

---

## `mergeQuestionsWithHistory` / `fetchCompetencyEvidence` (`lib/ali/persistence/competencyEvidence.ts`, WP-17)

| Field | Value |
|---|---|
| **Inputs** | `mergeQuestionsWithHistory` (pure): a `QuestionMeta[]` (from `ali_question_bank`) and `HistoryRow[]` (from `ali_student_question_history`). `fetchCompetencyEvidence` (I/O): Supabase client, `profileId`, `competencyCode`. |
| **Outputs** | `QuestionEvidenceInput[]` — the exact shape `computeCompetencyConfidence()` (WP-05) and `validateCompetencyMastery()` (WP-06) already consume, unchanged. |
| **Empty-state behaviour** | Every question belonging to the competency is represented in the output, even ones the learner has never attempted (`timesSeen: 0`, `distinctCorrectSessions: 0`) — never dropped or filtered out, since `computeCompetencyConfidence()`'s "Insufficient Evidence" check depends on seeing the whole competency, not a pre-filtered subset. |
| **Failure semantics** | Never throws; a failed question lookup or history lookup returns an empty array, which flows correctly into `computeCompetencyConfidence()` as "insufficient" — a safe, honest default, not a crash. |
| **Domain invariants** | This module performs two plain single-table queries merged in application code, deliberately not a PostgREST embedded join (this codebase has no existing precedent for one, and the generated `Database` type does not model `Relationships`) — a documented, load-bearing implementation choice, not an oversight. |

---

*(Future persistence adapters, including WP-18's Educational State/Durable Mastery runtime wiring, should be documented here at the time they are built, in the same 5-field format.)*
