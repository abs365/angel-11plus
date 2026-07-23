# Mock Attempt Ledger — Implementation Specification V1

**Work Package:** Phase 4, Sprint 1 (2026-07-23). Implements `MOCK_INTELLIGENCE_BLUEPRINT_V1.md` §6/§B2.1 — the one genuinely new component that Blueprint identified.
**Status:** Implementation-ready specification. No code, no migration, no database change is part of this document.

---

## PART A — SPECIFICATION

### 1. Purpose

Give the Mock Attempt Ledger — today a real but fragmented and single-device concept — a single, cross-device, implementation-ready design. The Ledger records **what a learner did** in a mock (which pathway, which sections, what score, how long, whether it finished) as operational metadata. It does not decide **what the learner knows** — that remains the Educational Intelligence Engine's exclusive domain, per the frozen Blueprint's Architecture Rules, restated verbatim as governing this specification:

1. The ledger is orchestration only.
2. No duplicate educational evidence.
3. No duplicate mastery calculations.
4. No duplicate readiness calculations.
5. Every educational insight references the existing Educational Intelligence Foundation.
6. Every attempt is fully traceable.

### 2. Scope

**In scope**: attempt lifecycle (start/complete/abandon), attempt-level and section-level score/timing storage, per-attempt ownership and security, cross-device retrieval, read-compatible API for existing consumers, traceability correlation to Evidence Engine rows.

**Out of scope**: any competency, mastery, confidence-tier, or readiness computation (owned by `lib/learningEngine/*`/`lib/ali/*`, unchanged); question content/selection (Assessment Engine, unchanged); the live, in-progress exam-taking UI state machine itself (timers, current-question index, unsaved answer text) — the Ledger records the **outcome** of starting and finishing/abandoning an attempt, not a live-editable draft of answers in progress (Section 13 addresses exactly how far recovery goes, and no further).

### 3. Responsibilities

- Persist exactly one row per mock attempt, owned by `profile_id`.
- Provide a stable attempt identity usable as the `sessionId` correlation key for whichever mock page calls `recordPresentation()`/`recordOutcome()` during that attempt (Section 10) — this is the entire mechanism by which Rule 6 (traceability) is satisfied, without the Ledger ever touching Evidence Engine tables itself.
- Track a real lifecycle: `in_progress` the moment a mock starts, `completed` when it finishes, `abandoned` when it doesn't — closing today's actual gap (Section 13), where an unfinished mock currently leaves **zero trace**.
- Preserve the exact section-level breakdown shape (`MockSectionResult`) already consumed by `components/parent/MockHistorySection.tsx`, `app/dashboard/page.tsx`, `app/admin-beta/page.tsx`.
- Serve reads cross-device, replacing today's per-browser-only localStorage.

### 4. Explicit Non-Responsibilities

- **Does not grade or re-grade anything.** Section scores are computed by whichever mock page runs the exam (its own `checkAnswer()`/tallying logic, unchanged) and are *submitted* to the Ledger as an already-computed fact — the Ledger never re-derives a score from raw answers.
- **Does not write to `ali_student_question_history`, `ali_durable_mastery`, or `ali_educational_audit`.** Those remain exclusively written by `recordOutcome()`, `applyAttemptOutcome()`, and `processEvidenceForCompetency()`/`recordReadinessSnapshot()` respectively — called directly by the mock page, never by the Ledger on the page's behalf.
- **Does not compute a mastery state, confidence tier, or readiness band.** `assessMockReadiness()` remains the sole readiness dispatch (Blueprint §5); the Ledger only supplies it a real `mockAttemptCount` and recency fact, exactly as `getMockResults().length` does today.
- **Does not pre-aggregate "best score" or "average" as a stored value.** `getBestMockScoreForPathway()`'s `Math.max(...)` today runs at read time, not write time; the new design preserves this — no second source of truth for a derived number.
- **Does not select or fetch question content.** That is `fetchQuestionBank()`'s domain, unchanged.

### 5. Canonical Data Model

Derived directly from the two data shapes already proven in production use — `MockResult`/`MockSectionResult` (`types/mock.ts`), read today by `components/parent/MockHistorySection.tsx`, `app/dashboard/page.tsx`, `app/admin-beta/page.tsx`, `app/learning-intelligence/parent/mock-readiness/page.tsx` — plus the minimum net-new fields the lifecycle and traceability requirements add.

| Field | Type | Notes |
|---|---|---|
| `id` | uuid | Primary key. **Also the session-correlation key** passed as `sessionId` to `recordPresentation()`/`recordOutcome()` for this attempt's questions (Section 10) — not a separate value. |
| `profile_id` | uuid | Real ownership, FK to `profiles.id`. Replaces today's implicit "whichever browser" ownership. |
| `pathway` | text | `MockPathwayId` — `gl` \| `cem` \| `csse` \| `iseb`. Unchanged enum. |
| `pathway_name` | text | Display label, exactly as `MockResult.pathwayName` today. |
| `source` | text | **New.** Which mock surface produced this attempt — `static_timed_exam` \| `csse_mock_exam` \| `adaptive_practice`. Today's `MockResult` has no field distinguishing this; a real, if minor, existing gap this closes for Rule 6. |
| `status` | text | **New.** `in_progress` \| `completed` \| `abandoned`. See Section 6. |
| `started_at` | timestamptz | Set on creation. |
| `completed_at` | timestamptz, nullable | Set only on completion. |
| `duration_seconds` | integer, nullable | Generalises `MockResult.durationMinutes`; null while `in_progress`. |
| `total_score` | numeric, nullable | Null while `in_progress`. |
| `section_results` | jsonb, nullable | Array of `{sectionId, sectionName, bank, correct, total, score}` — kept as one JSONB value, not a normalised child table, since it is always read and written as one atomic unit today; normalising it would be new complexity with no consumer that needs it. |
| `created_at` / `updated_at` | timestamptz | Standard audit columns. |

**No separate traceability column is introduced.** `id` doubling as the `sessionId` correlation key (Section 10) is the entire mechanism — adding a stored list of question/history references would itself be a small duplicate ledger of data that `ali_student_question_history` already owns, which Rule 2 forbids.

### 6. State Transition Diagram

```
                     ┌─────────────┐
    attempt starts → │ in_progress │
                     └──────┬──────┘
                            │
              ┌─────────────┼──────────────┐
              │                            │
   all sections submitted          learner leaves without
      (calls complete)                  submitting
              │                            │
              ▼                            ▼
       ┌────────────┐              ┌─────────────┐
       │ completed  │              │  abandoned  │
       └────────────┘              └─────────────┘
        (terminal)                  (terminal — see §13:
                                     never resumed; a return
                                     visit always starts a
                                     NEW row)
```

`abandoned` is a **read-time interpretation, not a required write**, to avoid new server-side infrastructure (a cron job or scheduled function) in Sprint 1: any `in_progress` row older than a generous threshold (proposed: 4 hours — comfortably beyond the longest timed section plus review time) is treated as abandoned wherever it's displayed. An explicit client-side "Exit mock" action may also write `abandoned` directly when the learner deliberately leaves, but this is not required for correctness.

### 7. Database Entity Proposal

**Table name (proposed): `ali_mock_attempt`.** Illustrative column list only — not a migration, per instruction:

| Column | Type | Constraint |
|---|---|---|
| `id` | uuid | primary key, default `gen_random_uuid()` |
| `profile_id` | uuid | not null, FK → `profiles(id)` |
| `pathway` | text | not null |
| `pathway_name` | text | not null |
| `source` | text | not null |
| `status` | text | not null, default `'in_progress'` |
| `started_at` | timestamptz | not null, default `now()` |
| `completed_at` | timestamptz | nullable |
| `duration_seconds` | integer | nullable |
| `total_score` | numeric | nullable |
| `section_results` | jsonb | nullable |
| `created_at` | timestamptz | not null, default `now()` |
| `updated_at` | timestamptz | not null, default `now()` |

This mirrors the exact FK/ownership shape already live in production (`profile_id → profiles.id`, `auth.uid()`-based RLS) — the same pattern verified this session for `user_stats`, `lesson_progress`, and the five ALI evidence tables. No new ownership model is introduced.

### 8. Repository Impact

**Would change** (behind preserved read-side shapes where possible):
- `lib/mockProgress.ts` — backend swap; `saveMockResult`/`getMockResults`/`getBestMockScoreForPathway`/`getMockCountForPathway`/`getLastMockResult` re-implemented against the new store. **Becomes async** (see Section 9 — this is a genuine, disclosed breaking change to every caller, not hidden).
- `types/mock.ts` — additive only: `source`/`status` become optional fields on the type consumers see; no existing field removed or renamed.
- `app/mocks/adaptive/gl/page.tsx` — stops calling `saveAdaptiveMockResult()`; calls the new `startMockAttempt()`/`completeMockAttempt()` pair instead, same as every other mock surface.
- The ~5 read-side call sites (`app/dashboard/page.tsx`, `app/admin-beta/page.tsx`, `app/learning-intelligence/parent/page.tsx` via `MockHistorySection`, `app/learning-intelligence/parent/mock-readiness/page.tsx`, `lib/learningEngine/mockReadiness.ts`) — each must switch from a synchronous call to an awaited/fetched read (`useEffect`+`useState`, the same pattern `fetchQuestionBank()` callers already use elsewhere in this codebase — no new pattern is introduced).

**Would be created**: one new migration file (not written now); `lib/ali/persistence/mockAttemptStore.ts`, mirroring the existing `durableMasteryStore.ts`/`auditStore.ts` pattern.

**Would be retired outright, not migrated**: `lib/adaptiveMockProgress.ts` and the `AdaptiveMockResult`/`AdaptiveMockSectionResult` types. Confirmed by repository-wide search: `getAdaptiveMockResults()` has **zero callers anywhere except its own module** — it is write-only, dead data with no consumer depending on retrieving it. Retiring it is a deletion, not a migration.

**Would not change**: `lib/adaptiveMockBuilder.ts`, `lib/ali/selection.ts`, `lib/ali/weakness.ts`, `lib/ali/history.ts`, `lib/learningEngine/educationalIntelligenceService.ts`, `lib/learningEngine/learningHistory.ts`, `app/learning-intelligence/mock-exam/page.tsx`'s evidence-recording calls, all three frozen `docs/intelligence/*.md` files.

### 9. API Boundaries

```
startMockAttempt(profileId, pathway, pathwayName, source): Promise<{ attemptId: string }>
  — creates an in_progress row; attemptId is used as sessionId for
    recordPresentation()/recordOutcome() calls made during this attempt.

completeMockAttempt(attemptId, { totalScore, sectionResults, durationSeconds }): Promise<void>
  — marks the row completed; sets completed_at, total_score, section_results, duration_seconds.

abandonMockAttempt(attemptId): Promise<void>
  — optional explicit client-side call; marks status = 'abandoned'.

getMockResults(profileId): Promise<MockResult[]>
  — returns completed attempts only, mapped to the existing MockResult shape
    (id, pathway, pathwayName, date, totalScore, sectionResults, durationMinutes)
    so every existing consumer's rendering code is unchanged.

getBestMockScoreForPathway(profileId, pathway): Promise<number | null>
getMockCountForPathway(profileId, pathway): Promise<number>
getLastMockResult(profileId): Promise<MockResult | null>
  — same contracts as today, now async and cross-device.
```

All six functions live in the new `lib/ali/persistence/mockAttemptStore.ts`; `lib/mockProgress.ts` becomes a thin, signature-compatible (but now async) wrapper, exactly as `lib/supabaseProgress.ts` already wraps direct Supabase calls for other progress data.

### 10. Educational Intelligence Integration

The Ledger has exactly **one** integration point with the Educational Intelligence Engine, and it is a correlation, not a write:

> The calling mock page passes the attempt's `id` (from `startMockAttempt()`) as the `sessionId` argument to every `recordPresentation()`/`recordOutcome()` call it makes while that attempt is active.

This is the entirety of Rule 6 (traceability) — after the fact, `ali_student_question_history` rows this attempt touched can be found by matching `last_correct_session_id` (or the equivalent session-tagged field) against `ali_mock_attempt.id`, a query-time join, never a stored duplicate list, never a foreign key from the evidence table back to the ledger. The Ledger never calls `recordOutcome()`, `processEvidenceForCompetency()`, or `recordReadinessSnapshot()` itself — those calls belong entirely to the mock page, exactly as the Blueprint's One Evidence Flow (§4) requires.

### 11. Parent Intelligence Integration

Unchanged in substance from today's real, working pattern (`MockHistorySection.tsx`, `mock-readiness/page.tsx`) — only the data source becomes cross-device. `assessMockReadiness()` continues to receive a plain `mockAttemptCount`/recency fact; it is simply now a live count against `ali_mock_attempt` instead of a `localStorage` array length. No new parent-facing computation, no new UI contract — the Blueprint's B4 risk 3 (cross-device parent-visibility gap) is what this closes.

### 12. Security Model

Identical ownership pattern to every table verified this session (migrations 019/020): RLS enabled; `profile_id` FK to `profiles.id`; policies scoped `to authenticated` only (no `anon` — an attempt can only be created by an identity that has completed anonymous sign-in, consistent with the rest of the platform); ownership check `EXISTS (SELECT 1 FROM profiles p WHERE p.id = profile_id AND p.auth_user_id = auth.uid())` for SELECT/INSERT/UPDATE. No DELETE policy — nothing in the application ever deletes an attempt record. A second identity must be unable to read, insert against, or update another identity's `profile_id` — to be live-verified with the same method as Gates 5/6 (a genuinely independent signed-in identity attempting all three operations against the first identity's rows).

### 13. Recovery Model

**Today**: nothing is persisted until a mock is fully finished — a crash, tab close, or abandoned attempt leaves **zero trace**, not even a "they tried" signal.

**Proposed**: `startMockAttempt()` writes the `in_progress` row immediately, so even an abandoned attempt becomes a durable, honest fact — a real improvement, not scope creep, since it costs no new computation (it's a status value, read as-is). **Explicit boundary, to keep this orchestration-only**: an abandoned or in-progress attempt is **never resumed with saved answers**. There is no draft-answer persistence, no partial-section recovery, no "continue where you left off." A learner returning to a pathway after an abandoned attempt always starts a genuinely new attempt (a new row); the old `in_progress` row simply ages into the read-time `abandoned` interpretation (Section 6) and stays as historical signal. This keeps the Ledger's scope to "record what happened," never "manage in-progress exam state," which is deliberately left to the client-side page's own existing state machine.

### 14. Cross-Device Behaviour

A direct, low-risk consequence of Supabase-backed, `auth.uid()`-owned storage — the same identity model ARCH-001 established this session. A learner authenticated on any device sees identical attempt history; no new sync logic is needed beyond the existing anonymous-auth session mechanism. This is a genuine, incidental benefit of this session's earlier identity correction, not something this specification has to build itself.

### 15. Acceptance Criteria

1. A fresh authenticated learner starting a mock produces an `in_progress` row immediately, live-verified.
2. Completing a mock updates that same row to `completed` with correct score/section data — no second row created, live-verified.
3. Closing the tab mid-mock leaves the row `in_progress` (or, past the threshold, read-time `abandoned`) — never silently lost.
4. A second, independent identity cannot read, insert against, or update the first identity's attempt — live-verified, same method as Gates 5/6.
5. Every existing read-side consumer (`dashboard`, `admin-beta`, `MockHistorySection`, `mock-readiness`) renders output identical to today's, once migrated — a regression check, not only a new-feature check.
6. No row appears in `ali_student_question_history`, `ali_durable_mastery`, or `ali_educational_audit` as a **direct write from the Ledger's own code** — only via the pre-existing, unchanged Evidence Engine calls the calling page already makes. Verified by absence (no such write path exists in `mockAttemptStore.ts`), not only by design intent.
7. An attempt's `id` can be used to find the exact `ali_student_question_history` rows it touched, demonstrated with one real query against real data (Section 10).
8. Signing in on a second device with the same identity shows identical attempt history (Section 14), live-verified.

### 16. Migration Strategy

- **No automatic migration of existing localStorage `MockResult` history is proposed.** Historical local mock scores are low-stakes, cosmetic history — not competency evidence — and a reliable one-time client-side upload (requiring the exact device/browser to be revisited, with no `auth_user_id` recorded on the original data) is disproportionate effort for what it preserves. **Recommendation**: a clean cutover — existing localStorage data is left untouched (not deleted, no destructive action), simply superseded as the read source from deployment day forward. This is a disclosed, bounded, one-time cost (early learners' historical mock scores won't appear in the new cross-device view) requiring its own explicit Founder sign-off, not an oversight.
- **`AdaptiveMockResult`/`lib/adaptiveMockProgress.ts` is retired outright**, not migrated — zero external readers confirmed (Section 8).
- **Sequencing**: (1) migration applied to production under its own gated approval, with the same pre/post-execution verification discipline as migrations 019/020; (2) `mockAttemptStore.ts` + updated `lib/mockProgress.ts` deployed; (3) the ~5 read-side call sites updated to the async contract; (4) Section 15's acceptance criteria verified live; (5) old `saveMockResult`-to-localStorage path and `lib/adaptiveMockProgress.ts` removed only after (4) passes.

---

## PART B — ASSESSMENT

### B1. Repository impact assessment

See Section 8 in full. Net new: 1 migration file (not written), 1 persistence module. Modified: 2 existing lib files (signature-compatible, now async), 1 mock page (drops its orphaned write path), ~5 read-side call sites (async adoption, no rendering-logic change). Retired: 1 file, 2 types.

### B2. Minimal database changes

Exactly one new table (`ali_mock_attempt`, Section 7), zero changes to any existing table, zero changes to any existing policy. This is additive-only — no existing evidence, mastery, or readiness table is touched.

### B3. Sprint implementation plan

- **Sprint 1** (this specification's scope): design + apply the `ali_mock_attempt` migration (own gated approval); build `mockAttemptStore.ts`; update `lib/mockProgress.ts`; wire `app/mocks/adaptive/gl/page.tsx` to the new API (replacing its `AdaptiveMockResult` write); update the 5 read-side consumers to the async contract; run Section 15's acceptance criteria live, the same rigor as this session's Gate 5-7 methodology.
- **Sprint 1, deferred to a follow-up within the same sprint if time-boxed**: wiring `startMockAttempt`/`completeMockAttempt` into the remaining mock surfaces (`app/mocks/[pathway]/page.tsx`, `app/learning-intelligence/mock-exam/page.tsx`) that currently call `saveMockResult()` directly — mechanically identical change, lower risk, can trail the GL adaptive page's integration.
- **Not this sprint**: any historical-data migration (Section 16); any change to `app/mocks/[pathway]`'s or `app/mock-test`'s underlying content/engine-integration status (both remain governed by the Blueprint's own Sprint 2/3 sequencing, untouched by this specification).

### B4. Risk assessment

1. **Async contract change is a genuine breaking change**, not cosmetic — every one of the ~5 read-side call sites currently assumes synchronous, instant reads. Mitigation: this is disclosed explicitly (Section 8), not hidden; each site follows an already-established async-read pattern in this codebase (`fetchQuestionBank()` callers), not a novel one.
2. **Historical mock-score discontinuity** (Section 16) — early learners' local history won't appear post-cutover. Requires its own explicit sign-off; framed here as a bounded, disclosed cost, not a silent loss.
3. **`abandoned` status is a read-time interpretation**, not guaranteed by a write — a very long-running (>4h) genuinely completed exam session would misclassify as abandoned until corrected by a real completion write. Low real-world likelihood given actual mock durations (documented today at 45 min–2h across formats), but worth stating precisely rather than glossing over.
4. **The one existing `AdaptiveMockResult` writer must be re-pointed correctly** — `app/mocks/adaptive/gl/page.tsx` is the only caller affected by the retirement in Section 8; missing this update would silently stop recording GL adaptive mock attempts entirely (not a data-loss risk to existing data, since nothing ever read that data, but a regression in future recording if overlooked).
5. **RLS correctness is the same class of risk verified repeatedly this session** (migrations 019/020) — mitigated by applying the identical pre-execution/post-execution verification discipline, not a new or untested pattern.

### B5. Production readiness recommendation

This specification is implementation-ready. **Before Sprint 1 code begins**, three explicit confirmations are needed, mirroring the Blueprint's own gating: (a) approval of the exact migration (Section 7) under the same rigor as migrations 019/020; (b) explicit sign-off on the no-historical-migration decision (Section 16), since it is a real, if bounded, user-facing discontinuity; (c) confirmation that the async-read contract change (Section 8/B4-1) across ~5 call sites is acceptable scope for this sprint, since it is real application-code change beyond the persistence layer itself.

---

**Version History**

| Version | Date | Change |
|---|---|---|
| 1.0 | 2026-07-23 | Created. Specifies `ali_mock_attempt` as the single canonical, cross-device Mock Attempt Ledger, replacing fragmented localStorage persistence (one real, three-consumer ledger plus one confirmed-dead, zero-reader orphan). Traceability to the Evidence Engine is achieved via a shared session-correlation id, not a duplicate reference list. No educational computation is introduced, per Architecture Rules 1–6. |
