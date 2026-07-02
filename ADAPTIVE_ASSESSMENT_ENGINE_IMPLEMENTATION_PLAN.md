# Adaptive Assessment Engine — Implementation Plan (v3)

**Status:** PLANNING ONLY. No production code, no migrations, no schema created. This revision: adopts the internal architecture name **Angel Learning Intelligence (ALI)**; resolves all 5 open items from v2; makes mastery thresholds config-driven instead of hard-coded; replaces the weak-skill-override distance heuristic with an absolute exclusion rule; and corrects a real granularity gap in the `skill` field discovered while writing `QUESTION_AUTHORING_STANDARD.md` (§1.1). Existing `app/mocks/[pathway]/page.tsx`, `data/*.ts`, and all existing tables remain untouched until a build is separately approved.

**Companion document:** `QUESTION_AUTHORING_STANDARD.md` — the permanent standard for every question's metadata, writing quality, UK English, originality/copyright, and mastery-threshold judgment calls. This plan references it rather than duplicating its content; §1.5 here has been trimmed to point at it.

**Next step per this revision:** build does not start until the authoring standard is agreed *and* the 52 VR questions are hand-tagged against it (or the synthetic-fixture path is used to unblock code work in parallel, §6.3) — matching the explicit sequencing requested: standard first, then the first implementation slice exactly as planned.

---

## 0. Decisions Locked In This Revision

| # | Decision | Resolution |
|---|---|---|
| 1 | Student adaptive state / question-count cooldown | Approved as designed in v2, unchanged |
| 2 | Mastery remains evidence-based; thresholds must be **configurable, not hard-coded** | New `ali_mastery_defaults` table (§1.4/§2.4) — difficulty→threshold mapping lives in data, changeable without a code deploy |
| 3 | `confidence_weight` — store now, may stay unused | Confirmed, no design change; field remains in `ali_question_bank` (§1) |
| 4 | Weak-skill override — **never** let a question from the immediately preceding mock reappear | Redesigned as an absolute, non-overridable exclusion (§3.2), replacing v2's `distance < count` heuristic |
| 5 | Synthetic fixture approved for parallel development | Confirmed, unchanged (§6.3) |

**New in this revision, not a prior open item:** while writing the authoring standard, a real gap surfaced — the existing `SkillType` field on every VR question is uniformly `"verbal-reasoning"` (no sub-skill granularity); the actual differentiator already in the data is the `category` field (`"Word Analogy"`, `"Letter Code"`, etc.). `ali_question_bank.skill` must be populated from the fine-grained competency taxonomy in `QUESTION_AUTHORING_STANDARD.md` §3, not from `SkillType` — otherwise the weak-skill override (§3.2) and all skill-level replay logic cannot distinguish "weak at codes" from "weak at analogies," which would quietly defeat the point of tracking history at skill granularity at all. This is folded into §1 and §3 below.

---

## 0.5 Angel Learning Intelligence (ALI) — Architecture Direction

Internal engineering name only — does not appear in user-facing product language. ALI is the shared adaptive intelligence layer; the adaptive mock engine is one consumer of it, not the whole system. This section was "Learning Intelligence Layer" in v2 — renamed here, design unchanged except where noted.

### 0.5.1 What makes the schema consumer-agnostic (designed now, not deferred)
- `ali_question_bank` and `ali_student_question_history` (§1, §2) carry no mock-specific columns — no `mock_id`, no pathway-shaped assumptions baked into the history row. Pathway lives on the *question*, not the interaction record.
- Every history write carries a `source` tag (`'adaptive_mock' | 'lesson' | 'quiz' | 'daily_mission' | 'replay'`, an open string, not a closed enum — new consumer types shouldn't need a migration to register). First slice writes `source = 'adaptive_mock'` exclusively.
- Mastery evidence (§1.4) is generic — a "session" is whatever `session_id` the calling consumer generates. A lesson attempt and a mock attempt are both just sessions from the schema's point of view.

### 0.5.2 What is explicitly NOT built in this slice
- `computeSubjectConfidence()`, `buildReplayQueue()`, `computeAdaptiveState()`, `computeParentReport()` (existing) are **not modified or migrated to read from Supabase**. They keep reading `UserProgress`/`AnalyticsReport` from localStorage, exactly as today.
- No lesson, quiz, or daily-mission code writes to ALI tables in this slice — only the new adaptive VR mock does.
- No "quiz" concept is built — it's named in the `source` vocabulary as a placeholder for when one exists.

### 0.5.3 The bridge this creates, and why it's necessary for validation
Parent Insights reads localStorage `UserProgress`, which ALI's Supabase tables don't feed. Rather than migrate four existing, working pure functions as part of this slice, the adaptive mock's completion handler **writes to both places**:
1. `ali_student_question_history` / `ali_question_bank` aggregate stats (Supabase) — ALI's durable, cross-device, cross-consumer layer, and the only source of truth for anti-repetition/mastery (no localStorage equivalent exists for those).
2. `UserProgress.skillScores[skill]` (localStorage, via the existing `lib/progress.ts` update path) — so today's confidence/replay/readiness functions see the result immediately, unchanged.

This dual write is a deliberate, temporary interoperability shim. A future slice's job is to migrate the four consumer functions to read from ALI directly, then delete the localStorage half.

### 0.5.4 Module layout — mock is one consumer of ALI

```
lib/ali/                            -- Angel Learning Intelligence, the shared layer
  questionBank.ts                   -- fetch/filter BankQuestion[] by subject/skill/pathway
  history.ts                        -- read/write ali_student_question_history + ali_student_adaptive_state
  selection.ts                      -- anti-repetition + weighting (§3) -- pure function
  mastery.ts                        -- mastery_state derivation (§1.4), reads ali_mastery_defaults -- pure function
  config.ts                         -- typed accessors for ali_mastery_defaults (§2.4)

lib/adaptiveMockBuilder.ts          -- ONE consumer: assembles a mock section using lib/ali/* (§4)
```

Nothing under `lib/ali/` imports anything mock-specific (`MockConfig`, `MockPathwayId` stay confined to `adaptiveMockBuilder.ts` and the new route). A future `lib/lessonIntelligence.ts` could import the same modules without touching mock code.

### 0.5.5 Table naming convention
New tables adopt an `ali_` prefix to make the architecture boundary visible in the schema itself: `ali_question_bank`, `ali_student_question_history`, `ali_student_adaptive_state`, `ali_mastery_defaults`. Existing tables (`profiles`, `user_stats`, `lesson_progress`) are untouched and keep their existing names.

---

## 1. Question Bank Structure

### 1.1 Naming and granularity corrections
- `content_difficulty` (easy/medium/hard/challenge) — not a reuse of the existing year-group `Difficulty` type (`types/index.ts`), different concept (unchanged from v2).
- **`skill` is populated from the fine-grained competency taxonomy** (`QUESTION_AUTHORING_STANDARD.md` §3 — e.g. `vr.analogies`, `vr.letter-codes`, `vr.hidden-words`), not from the app's existing coarse `SkillType` union. This is a plain `text` column, not FK'd to `SkillType`, so this is a tagging-convention decision, not a schema conflict — but it must be stated explicitly here since a reader of v1/v2 would reasonably have assumed `SkillType` reuse.

### 1.2 Table sketch (illustrative — not a migration file)

```sql
-- Migration 005 (additive only; depends on migration 004's subject_type enum work, Decision 4)
create type public.content_difficulty as enum ('easy', 'medium', 'hard', 'challenge');

create table public.ali_question_bank (
  id                    text primary key,
  subject               public.subject_type not null,
  skill                 text not null,                 -- competency code, e.g. 'vr.analogies' — see §1.1
  pathway               text[] not null,                -- set of MockPathwayId
  content_difficulty    public.content_difficulty not null,
  question_type         text not null default 'multiple-choice',
  estimated_time_seconds integer not null default 45,
  prompt                jsonb not null,
  explanation           text not null,
  hint                  text,
  confidence_weight     numeric(3,2) not null default 1.00,   -- reserved, inert this slice (Decision 3)
  learning_objective    text,
  revision_priority     smallint not null default 3 check (revision_priority between 1 and 5),
  mastery_threshold     smallint not null check (mastery_threshold >= 1),
                          -- populated at import time from ali_mastery_defaults (§2.4) unless the
                          -- author explicitly overrides per QUESTION_AUTHORING_STANDARD.md §8
  usage_count           integer not null default 0,
  avg_success_rate      numeric(5,2),
  created_at            timestamptz not null default now()
);

create index ali_question_bank_lookup_idx
  on public.ali_question_bank (subject, skill, content_difficulty);
```

### 1.3 TypeScript shape (illustrative)

```typescript
// types/ali/questionBank.ts (new file)
export type ContentDifficulty = "easy" | "medium" | "hard" | "challenge";

export interface BankQuestion {
  id: string;
  subject: Subject;
  skill: string;                   // competency code, e.g. "vr.analogies" — see QUESTION_AUTHORING_STANDARD.md §3
  pathway: MockPathwayId[];
  contentDifficulty: ContentDifficulty;
  questionType: "multiple-choice" | "short-answer";
  estimatedTimeSeconds: number;
  prompt: ReasoningQuestion | MathsQuestion;
  explanation: string;
  hint?: string;
  confidenceWeight: number;
  learningObjective?: string;
  revisionPriority: 1 | 2 | 3 | 4 | 5;
  masteryThreshold: number;
  usageCount: number;
  avgSuccessRate: number | null;
}
```

### 1.4 Mastery is evidence-based across sessions (unchanged from v2, threshold source updated)

`mastery_state` derivation, unchanged from v2:
- `mastered`: `distinct_correct_sessions >= question.mastery_threshold` **and** the most recent attempt was correct (one wrong answer demotes mastered → learning).
- `learning`: `times_seen >= 1` and not yet mastered.
- `weak`: last 2 consecutive attempts both incorrect.
- `new`: `times_seen = 0`.

**What changed:** `mastery_threshold` per question is no longer just "a default by difficulty, hard-coded in application logic" — it's populated at import time by reading a dedicated config table (§2.4), so the defaults can be tuned by a data change, not a code deploy. Per-question overrides (per `QUESTION_AUTHORING_STANDARD.md` §8) still take precedence over the config default.

### 1.5 Metadata authoring — see `QUESTION_AUTHORING_STANDARD.md`
The authoring worksheet, competency taxonomy, difficulty rubric, UK English/originality/copyright requirements, and mastery-threshold override guidance are now fully specified in the companion standard document. This plan does not duplicate that content. Required-before-import fields remain: `skill`, `content_difficulty`, `estimated_time_seconds`. Safe-to-default fields: `learning_objective`, `revision_priority`, `mastery_threshold` (defaults from config, §2.4).

---

## 2. Per-Student Question History

### 2.1–2.3: unchanged from v2, renamed with `ali_` prefix
- `ali_student_adaptive_state` (was `student_adaptive_state`): one row per profile, `questions_presented_count` monotonic counter, same upsert pattern as `user_stats`.
- `ali_student_question_history` (was `student_question_history`): same shape as v2 — `times_seen`, `times_correct`, `distinct_correct_sessions`, `last_correct_session_id`, `last_presented_at` (display only), `last_presented_at_sequence` (cooldown math), `mastery_state`, unique `(profile_id, question_id)`.
- All questions presented within one mock share a single sequence stamp (v2 §2.4 rationale unchanged) — this is what makes the exact-set "immediately preceding mock" exclusion (§3.2 below) simple: it's just "the set of history rows sharing the maximum stamp value for this profile," no separate bookkeeping needed.

### 2.4 New: `ali_mastery_defaults` (config-driven thresholds, Decision 2)

```sql
-- Migration 005 (same file as ali_question_bank — both are ALI content-layer schema)
create table public.ali_mastery_defaults (
  content_difficulty public.content_difficulty primary key,
  default_threshold  smallint not null check (default_threshold >= 1)
);

insert into public.ali_mastery_defaults (content_difficulty, default_threshold) values
  ('easy', 2), ('medium', 2), ('hard', 3), ('challenge', 3);
```

Changing a row here changes the default applied to *future* imports/re-syncs, not retroactively to already-imported questions (standard config-table behavior — a bulk re-sync is a separate, explicit action if ever needed, not automatic). This satisfies "configurable rather than hard-coded" without adding runtime complexity: the app never hard-codes `{easy: 2, medium: 2, hard: 3, challenge: 3}` in a `.ts` file, it reads this table once at import/authoring time.

```sql
-- Migration 006 (per-student adaptive infra)
create table public.ali_student_adaptive_state (
  profile_id                uuid primary key references public.profiles(id) on delete cascade,
  questions_presented_count integer not null default 0,
  updated_at                timestamptz not null default now()
);

create table public.ali_student_question_history (
  id                          uuid primary key default gen_random_uuid(),
  profile_id                  uuid not null references public.profiles(id) on delete cascade,
  question_id                 text not null references public.ali_question_bank(id) on delete cascade,
  source                      text not null default 'adaptive_mock',
  times_seen                  integer not null default 0,
  times_correct               integer not null default 0,
  distinct_correct_sessions   integer not null default 0,
  last_correct_session_id     text,
  last_presented_at           timestamptz not null default now(),
  last_presented_at_sequence  integer not null,
  mastery_state               text not null default 'new',
  updated_at                  timestamptz not null default now(),
  constraint ali_student_question_history_unique unique (profile_id, question_id)
);

create index ali_student_question_history_profile_sequence_idx
  on public.ali_student_question_history (profile_id, last_presented_at_sequence desc);
```

---

## 3. Anti-Repetition Logic

### 3.1 Cooldown thresholds (Decision 1/3, unchanged)

```typescript
const COOLDOWN_QUESTIONS: Record<ContentDifficulty, number> = {
  easy: 5,
  medium: 10,
  hard: 15,
  challenge: 20,   // floor, raisable as a constant change
};
```

### 3.2 `lib/ali/selection.ts` — redesigned exclusion order (Decision 4)

```typescript
function selectQuestions(
  candidates: BankQuestion[],
  history: Map<string, StudentQuestionHistoryRow>,
  currentSequence: number,
  weakSkills: Set<string>,        // competency codes (§1.1), not SkillType
  count: number
): BankQuestion[]
```

Logic, in order:

1. **Absolute exclusion — the immediately preceding mock.** Find `previousMockStamp = max(last_presented_at_sequence)` across this profile's history rows (undefined if no history exists yet). `previousMockQuestionIds = { question_id : history[q].last_presented_at_sequence === previousMockStamp }`. Every candidate in this set is removed from consideration **before anything else runs** — this exclusion is absolute and is never overridden by weak-skill status, difficulty, or anything else. This directly implements Decision 4 ("never allow a question from the immediately preceding mock to reappear") as an exact-set rule rather than the v2 heuristic (`distance < count`), which approximated the same intent less precisely.
2. For remaining candidates, compute `distance = currentSequence - (history.get(id)?.last_presented_at_sequence ?? Infinity)`. Unseen questions (`times_seen = 0` or no history row) → `distance = Infinity`, always eligible.
3. `eligible = distance >= COOLDOWN_QUESTIONS[question.contentDifficulty]`.
4. Partition into: **unseen** (weight 3), **eligible-seen** (weight 2), **mastered-due-for-resurface** (`mastery_state === 'mastered'` and `distance >= COOLDOWN_QUESTIONS[...] * 3`, weight 1), **cooling-down** (excluded by default — but note: this pool can no longer contain the immediately-preceding-mock questions, since step 1 already removed them).
5. **Weak-skill override:** if `question.skill ∈ weakSkills`, a cooling-down question (from step 4's excluded pool — i.e. cooling down from a mock *before* the most recent one) becomes eligible (weight 2). Because step 1 already hard-removed the immediately preceding mock's questions, this override can never violate Decision 4 — there's no longer a heuristic guard needed inside this step, the ordering itself makes the absolute rule impossible to bypass.
6. Weighted random sample without replacement until `count` reached. If the eligible pool is smaller than `count`, fall back to cooling-down questions (never to step-1-excluded questions) rather than erroring.

### 3.3 What changed from v2
- Step 1 (absolute exclusion) is new and runs before cooldown/weighting logic, not folded into the override branch — this is a cleaner, exact implementation of Decision 4 than v2's approximation, and needs no "guard" language anymore since the ordering makes the override structurally incapable of violating it.
- `weakSkills` is now typed as competency codes (§1.1), not `SkillType` — reflects the granularity correction.
- Global `avg_success_rate`/`usage_count` remain informational only, unchanged from v1/v2.

---

## 4. Mock Builder

### 4.1 `lib/adaptiveMockBuilder.ts` (unchanged in shape from v2)

```typescript
function buildAdaptiveMock(
  pathwayId: MockPathwayId,
  profileId: string,
  confidenceBySkill: Map<string, AdaptiveTier>,   // keyed by competency code now, not SkillType
  weakSkills: Set<string>,
  bank: BankQuestion[],
  history: Map<string, StudentQuestionHistoryRow>,
  currentSequence: number
): AdaptiveMockSection[]
```

Reuses `MockConfig.sections`' `id`/`name`/`count`/`minutes` (unchanged). Threads `currentSequence` through to `selectQuestions()` (§3.2).

**Note on `confidenceBySkill`:** since `computeSubjectConfidence()` (existing, unmodified per §0.5.2) operates at *subject* level, not competency-code level, the first slice cannot yet compute true per-competency confidence — it only has subject-level ("verbal-reasoning") confidence to work with. For the first slice, every competency code within VR shares the same tier, derived from the existing subject-level confidence. Genuine per-competency confidence requires `computeSubjectConfidence()` itself to be extended to competency granularity, which is out of scope here (§0.5.2) — flagged as a real limitation of the first slice, not silently smoothed over: **"stronger students receive harder questions" will work correctly (subject-level confidence is real and already computed); "weak skills revisited intelligently" will work correctly for the override mechanism (weak skills come from `buildReplayQueue()`, which already has skill-level granularity via `report.skills`) — but tier-based difficulty distribution (§4.2) cannot yet vary by competency within VR, only by subject.**

### 4.2 Tier → difficulty distribution (unchanged from v1/v2)

| Tier | Easy | Medium | Hard | Challenge |
|---|---|---|---|---|
| foundation | 50% | 35% | 15% | 0% |
| developing | 20% | 50% | 25% | 5% |
| advanced | 5% | 30% | 50% | 15% |
| challenge | 0% | 15% | 45% | 40% |

### 4.3 Presentation write-back (unchanged from v2, table names updated)
At mock start: upsert `ali_student_question_history` (increment `times_seen`, set `last_presented_at_sequence` to the post-increment `ali_student_adaptive_state.questions_presented_count`), then upsert the counter (`+= mock.totalQuestionCount`). At completion: update `times_correct`/`distinct_correct_sessions`/`last_correct_session_id`/`mastery_state`, and perform the bridge write into `UserProgress.skillScores` (§0.5.3).

### 4.4 Fate of `lib/mockArchitecture.ts` (unchanged)
Left untouched and unreferenced this slice.

---

## 5. Migration Strategy

- **Migration 004** — additive `ALTER TYPE public.subject_type ADD VALUE` for the 4 reasoning subjects. Existing 5 values untouched (Decision 4 from the architecture review — reasoning-subject enum additions, not to be confused with this plan's own "Decision 4" on weak-skill override; both are additive-only by coincidence of numbering across the two review rounds).
- **Migration 005** — `content_difficulty` enum, `ali_question_bank`, `ali_mastery_defaults` (seeded).
- **Migration 006** — `ali_student_adaptive_state`, `ali_student_question_history`.
- Migrations 001–003 not altered. No column added to `profiles`/`user_stats`/`lesson_progress`.
- New route (`app/mocks/adaptive/[pathway]/page.tsx`, not yet built) beside the existing, untouched `app/mocks/[pathway]/page.tsx`. New result type (`AdaptiveMockResult`).
- Isolation remains structural, not flag-gated.
- Rollback: drop the new route/nav entry and the 4 new tables; migration 004's added enum values can remain inert (Postgres can't drop individual enum values, but unused values are harmless).

---

## 6. First Implementation Slice

Unchanged from v2's recommendation, reconfirmed:
- **Pathway:** `gl`.
- **Bank:** Verbal Reasoning only (~52 questions), hand-tagged per `QUESTION_AUTHORING_STANDARD.md` before import.
- **Mock:** "GL Adaptive Practice" — VR section runs the full ALI pipeline; NVR/NR/Vocabulary sections keep the existing static-slice logic this slice.
- **Analytics write-back:** full, via the bridge (§0.5.3), from the start.
- **Isolation:** complete — existing `/mocks/gl` route, `MockResult` type, and original 3 tables untouched.

### 6.3 Synthetic fixture (Decision 5, confirmed)
10–15 fabricated `BankQuestion` rows spanning all 4 difficulties and at least 2 competency codes, used to develop/unit-test `lib/ali/*` and `adaptiveMockBuilder.ts` in parallel with the real hand-tagging pass. Throwaway, swapped for the real import before validation.

---

## 7. Validation

Unchanged mechanism from v2 (no test framework in repo; `npx tsx` scripts + manual app checks), criteria table reconfirmed as-is:

| Validation criterion | How it's demonstrated |
|---|---|
| No repeated questions in consecutive mocks | Script: seed history simulating 2+ prior mocks, call `selectQuestions()` for a 3rd, assert zero overlap with the immediately preceding mock's question set (step 1, §3.2) and correct cooldown behavior otherwise |
| Weak skills revisited intelligently | Script: force one competency code's questions into cooling-down (but not from the immediately preceding mock), mark it weak, assert the override (§3.2 step 5) surfaces at least one |
| Stronger students receive progressively harder questions | Script: `buildAdaptiveMock()` with `foundation` vs `challenge` confidence, assert `content_difficulty` distributions match §4.2 (subject-level, per the §4.1 limitation note) |
| Parent Insights reflects adaptive results | Manual: complete one GL Adaptive Practice mock as a test profile, confirm `ali_student_question_history` rows exist **and** the bridge write landed in `UserProgress.skillScores`, then confirm `computeParentReport()`'s output changed |
| Existing production mocks remain fully operational | Manual: run `/mocks/gl` end-to-end post-ship, confirm identical behavior to before |

**Commit only after all five checks pass.**

---

## Open Items Requiring Confirmation Before Build

All 5 of v2's open items are resolved by this revision's decisions. Two new, smaller items surfaced while writing this revision:

1. **§4.1 limitation:** first-slice difficulty distribution operates at subject granularity, not competency granularity, because `computeSubjectConfidence()` isn't being extended in this slice. Confirm this is an acceptable first-slice limitation (the validation criteria still pass — subject-level confidence is real) rather than something that needs `computeSubjectConfidence()` extended now.
2. **Migration 005 sequencing:** `ali_mastery_defaults` must be seeded before any `ali_question_bank` import runs (since import reads it for default thresholds) — purely a migration-ordering note, not a design question, flagged so it isn't missed when migration 005 is written.

**Next step:** agree `QUESTION_AUTHORING_STANDARD.md` and complete (or synthetically stand in for, per §6.3) the 52-question hand-tagging pass; then begin the first implementation slice exactly as specified in §6.
