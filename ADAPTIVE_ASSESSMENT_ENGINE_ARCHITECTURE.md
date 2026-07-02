# Adaptive Assessment Engine — Architecture Proposal

**Status:** DRAFT — architecture only. No code written, no schema created, no existing mock system touched. Awaiting review and explicit implementation approval.

**Trigger:** Beta feedback from Angel highlighted that fixed, static mock papers are a structural ceiling — every student on a given pathway currently sees the exact same slice of the same static arrays (`app/mocks/[pathway]/page.tsx`, `MOCK_CONFIGS`). This proposes replacing that with a Master Question Bank + Mock Assembly Engine that dynamically composes a mock per student, per attempt.

---

## 0. Current-State Summary (baseline this design replaces)

Confirmed from the live codebase before drafting this proposal:

- **No question bank table.** Questions are hand-authored TypeScript literals in `data/*.ts` (~172 reasoning questions, 20 maths, 13 English lessons, 12 vocab, 4 writing prompts). No `id`-stable, DB-backed question store exists.
- **No real assembly logic.** `MOCK_CONFIGS` in `app/mocks/[pathway]/page.tsx` statically maps each pathway to a fixed `bank.slice(offset, offset+count)`. Same offset → same questions, every time, for every student. `lib/mockArchitecture.ts` defines a parallel, unused `MOCK_CONFIG` explicitly stubbed "Phase 2C — not wired to any route."
- **No server-side attempt history.** `lesson_progress` (Supabase) records one coarse row per completed lesson/mock (score 0–100), not per-question. Mock section results (`MockResult`/`MockSectionResult`) are computed and stored only in browser localStorage via `lib/mockProgress.ts` — never synced server-side.
- **Adaptive signals exist but are shallow and disconnected from question selection.** `lib/adaptiveDifficulty.ts` (confidence), `lib/replayEngine.ts` (replay queue), `lib/adaptiveEngine.ts` (daily missions), `lib/parentInsights.ts` (readiness) all compute plausible-looking outputs from localStorage `UserProgress`, but none of them feed back into *which questions a student actually sees*. They describe the student; they don't drive assembly.
- **Pathways are metadata-only.** `lib/pathways.ts` lists 7 pathways with descriptive text; `selectedPathwayId` is stored but only used to pick which static config to slice, not to filter question-level content.

Net effect: the app already computes confidence, weak skills, replay priority, and readiness — but a mock today is just an array slice. This proposal's job is narrow: give those existing signals a question bank and an assembly engine to act on, without redesigning the signals themselves where they're already sound.

---

## 1. Master Question Bank

### 1.1 Design principle
Every question becomes an addressable, stateful entity — not a literal in an array. The bank is the single source of truth; static `data/*.ts` files become a one-time import source, not the runtime store.

### 1.2 Per-question metadata

| Field | Purpose |
|---|---|
| `id` | Stable unique identifier. Must survive re-import/re-authoring — never regenerate on content edit. |
| `subject` | english / maths / verbal-reasoning / non-verbal-reasoning / spatial-reasoning / numerical-reasoning / vocabulary / writing |
| `pathway[]` | Which exam boards this question is valid for (gl/cem/csse/iseb/independent/core-foundation) — a question can serve multiple pathways, so this is a set, not a single value (current `MOCK_CONFIGS` implicitly assumes 1:1 bank→pathway, which this corrects) |
| `skill` | Existing `SkillType` taxonomy (analogies, codes, hidden-words, sequences, etc.) — reuse as-is, it's already granular and already wired into `replayEngine`/`adaptiveEngine` |
| `difficulty` | Easy / Medium / Hard / Challenge (see §3) — currently only `MathsQuestion` has this field; every question type needs it |
| `question_type` | multiple-choice / short-answer / etc. — needed because English/writing questions aren't multiple-choice like reasoning questions are |
| `estimated_time_seconds` | Used for mock time-budgeting and pacing feedback, not currently tracked anywhere |
| `explanation` | Already present on reasoning questions; extend to all subjects |
| `hint` | Already present (optional) on reasoning questions; extend to all subjects |
| `usage_count` | Times presented across all students — global exposure counter |
| `last_presented_at` | Per-student, not global — lives in a join table (§1.4), not on the question row itself |
| `avg_success_rate` | Global rolling accuracy across all students who've attempted it — used for difficulty calibration drift detection (§3.4) |

### 1.3 Why global stats need to be separate from per-student stats
`usage_count` and `avg_success_rate` at the question level are aggregate/global. `last_presented_at` and "has this student mastered this specific question" are per-student. Conflating these (e.g. storing `last_presented_at` directly on the question row) would make the bank stateful per-user, which breaks at the "thousands of questions × thousands of students" scale this needs to hit (§7). So:

- **Question Bank table**: content + global aggregate stats (`usage_count`, `avg_success_rate`) — one row per question, small, cacheable, rarely written.
- **Student Question History table**: `(student_id, question_id, last_presented_at, times_seen, times_correct, mastery_state)` — one row per (student, question) pair they've actually encountered, write-heavy, this is where anti-repetition (§4) reads from.

This separation is the same pattern already established elsewhere in this account's projects (global `vendors` table vs. per-relationship `manual_contact_activity` table) — aggregate content stays cheap to read, per-relationship state scales independently.

### 1.4 Content migration path (not part of this proposal's approval scope, flagged for the eventual Implementation phase)
`data/*.ts` becomes a one-time seed source, imported into the bank with deterministic IDs derived from current array position + subject prefix, so existing localStorage references (if any survive) don't silently orphan. This is an implementation detail, not an architecture decision — noted here only so the eventual migration isn't a surprise.

---

## 2. Mock Assembly Engine

### 2.1 Inputs
A mock is assembled from exactly these five inputs, each already partially available in the codebase today:

1. **Selected pathway** — already stored (`selectedPathwayId`), currently unused for filtering; becomes a real filter against `question.pathway[]`.
2. **Child profile** — currently just `{device_id, name}` server-side. Needs to gain: year group / target exam date (optional), selected pathway (currently client-only), and a link to accumulated skill-level stats. This does *not* require solving multi-child accounts as a prerequisite — a profile is already the row-level unit in Supabase; the assembly engine just needs more columns/joins on it, not a new account model.
3. **Adaptive confidence** — reuse `computeSubjectConfidence()` from `lib/adaptiveDifficulty.ts` as-is (accuracy*0.65 + consistency*0.35 formula already sound); the change is *where its output goes* — today it only renders a badge, tomorrow it also parameterizes assembly (§3).
4. **Replay queue** — reuse `buildReplayQueue()` from `lib/replayEngine.ts`; its top-ranked weak items become guaranteed inclusions in the next assembled mock rather than a separate "review" surface only.
5. **Previous mock history** — this is the one genuinely new input. Requires the Student Question History table (§1.3) to exist server-side, since today mock results never leave localStorage. Without this, "avoid recently seen questions" (§4) has no data to work from.

### 2.2 Assembly algorithm (shape, not code)
For each section of a mock (subject × skill area, matching the current `MOCK_CONFIGS` section structure):

1. Filter the bank to `pathway ∈ question.pathway[]` and `subject/skill` matching the section.
2. Determine the target difficulty distribution for this student in this skill (§3).
3. Exclude questions the anti-repetition rules rule out (§4) unless the weak-skill override applies.
4. Weight remaining candidates: unseen > long-unseen > recently-mastered-but-due-for-spaced-review, biased toward the student's weak skills per the replay queue ranking.
5. Sample `count` questions per section (same `count`/section shape as today's `MOCK_CONFIGS` — the section structure itself doesn't need to change, only what fills it).
6. Record every selected question's `(student_id, question_id, presented_at)` into Student Question History at mock-start, not mock-completion, so an abandoned mock still counts as "recently seen" and isn't immediately re-served.

### 2.3 What does NOT change
Section structure (English/Maths/VR/NVR/SR/NR split, per-pathway section presence) stays exactly as `MOCK_CONFIGS` defines it today. This proposal changes *which questions* fill each section, not the shape of a mock paper. That keeps the UI/timing/marking layer (`app/mocks/[pathway]/page.tsx` rendering logic) largely untouched — the blast radius is the question-selection step, not the exam-taking experience.

---

## 3. Difficulty Progression

### 3.1 Tiers
Reuse the existing four-tier taxonomy already defined in `types/adaptive.ts` (foundation/developing/advanced/challenge) — rename mapping to the brief's Easy → Medium → Hard → Challenge is a labeling choice, not a new model:

| Brief term | Existing tier | Confidence band (existing formula) |
|---|---|---|
| Easy | foundation | 0–39 |
| Medium | developing | 40–64 |
| Hard | advanced | 65–84 |
| Challenge | challenge | 85–100 |

### 3.2 Progression rule
Difficulty is set **per skill, per section**, not globally per student — a student can be "Hard" in verbal analogies and "Easy" in spatial reasoning simultaneously. This matches how `computeSubjectConfidence()` already scopes confidence by subject, so no new scoping model is needed — just apply the existing per-subject confidence output to per-skill difficulty selection instead of stopping at a display badge.

### 3.3 Within-mock movement (not just between-mock)
Two options, flagged as an open decision for the review conversation rather than pre-decided here:

- **Between-mock only (simpler):** difficulty tier is fixed for the whole mock, set from confidence going in, re-evaluated after the mock completes. Lower engineering risk, matches how confidence is already computed (post-hoc, not live).
- **Within-mock adaptive (higher fidelity):** difficulty shifts mid-mock based on running performance in that skill during the current attempt (classic CAT-style). Requires live scoring during the mock, which the current client-only, no-round-trip mock runner doesn't do today (§0). Bigger architectural lift — would need a scoring checkpoint after each question or each section, not just at mock end.

**Recommendation for review:** start between-mock only. It reuses the existing confidence pipeline unchanged and avoids introducing live server round-trips into a currently fully client-side exam-taking flow. Within-mock adaptivity can be a later increment once the between-mock version is proven with real beta usage.

### 3.4 Calibration drift check
`avg_success_rate` (global, per question, §1.2) exists specifically so a question tagged "Hard" that 90% of students answer correctly can be flagged for re-tagging. This is a data-quality safety net for hand-authored difficulty labels, not a live re-ranking mechanism — it surfaces as a periodic review signal (e.g. an admin-facing outlier list), not an automatic difficulty rewrite.

---

## 4. Anti-Repetition Strategy

Reads entirely from Student Question History (§1.3):

1. **Recently seen exclusion:** questions with `last_presented_at` within a configurable cooldown window (e.g. last N days or last M mocks, whichever is more relevant per subject — reasoning skills churn faster than writing prompts, which are scarce) are excluded from normal sampling.
2. **Mastered questions deprioritized, not eliminated:** a question a student has answered correctly multiple times consecutively drops in sampling weight (spaced-repetition style decay) rather than being hard-excluded forever — occasional resurfacing keeps mastery honest and prevents the bank from silently shrinking as a student progresses.
3. **Unseen questions prioritized:** `times_seen = 0` gets a sampling weight boost, so new content and new students both converge on full bank coverage rather than the same "greatest hits" subset repeating.
4. **Weak-skill override:** the recently-seen cooldown is *not* absolute — if a skill is flagged weak by the replay queue and the unseen/eligible pool for that skill is small, recently-seen questions in that skill can still recur sooner than the general cooldown allows. Weak-skill remediation takes priority over strict novelty. This is the one rule where §4.1 and §4.4 can conflict by design — remediation wins.

This directly fixes the beta-flagged problem: today, repetition isn't even a possibility to avoid, because the same offset-based slice is served every time. Anti-repetition only becomes meaningful once assembly is randomized/weighted in the first place — this section and §2 are two halves of the same fix.

---

## 5. Personalised Mock Composition

Same assembly engine (§2), different weighting inputs per student profile:

- **Struggling students** (confidence consistently low across most skills): mock leans toward Easy/Medium, replay-queue weak items are heavily represented, section count/length may need to stay unchanged (so the mock still "counts" as a real practice paper) but *within* each section the difficulty floor is lower. Avoid the failure mode of a struggling student never seeing a single question they can complete confidently — include some sure-success items to protect motivation, not just remediation items.
- **Average students**: standard weighted distribution — mostly Medium, some Hard, replay-queue items included but not dominant, roughly matching the section's natural difficulty spread.
- **High-performing students**: mock leans Hard/Challenge, unseen-question weighting increases (they've likely exhausted the easy pool faster), replay queue still included for genuine gaps (a high performer can still have one weak skill) but doesn't dominate composition the way it does for a struggling student.

The mechanism doesn't change per tier — only the weighting parameters (§2.2 step 4) do. This avoids building three separate assembly code paths; it's one engine, parameterized by the same confidence/replay/history inputs already flowing in.

---

## 6. Analytics Integration

Every completed mock writes back into the same signals it read from, closing the loop that's currently open (today: signals are computed for display, never for input):

| Downstream consumer | What updates | Existing mechanism reused |
|---|---|---|
| **Confidence** | Per-skill accuracy/consistency recalculated from the new attempt | `computeSubjectConfidence()` (`lib/adaptiveDifficulty.ts`) — unchanged formula, now fed by server-persisted per-question results instead of localStorage-only |
| **Readiness** | `ExamReadiness` tier recalculated | `computeParentReport()` (`lib/parentInsights.ts`) — unchanged rule logic |
| **Replay queue** | Newly-wrong questions/skills enter the queue; newly-mastered ones age out | `buildReplayQueue()` (`lib/replayEngine.ts`) — unchanged ranking logic |
| **Parent Insights** | New `ParentInsight[]`/`FocusArea[]` generated from updated readiness + skill data | `computeParentReport()` — same |
| **Daily missions** | `computeAdaptiveState()` re-ranks subject urgency including the just-completed mock's results | `lib/adaptiveEngine.ts` — unchanged |
| **Question bank stats** | `usage_count`, `avg_success_rate` incremented globally; `last_presented_at`/`times_seen`/`times_correct` updated per-student | New — this is the write path that makes §4 possible |

The load-bearing architectural change here is **persistence, not new logic**: every one of these five consumer functions already exists and already produces sensible output — they're just currently fed by ephemeral localStorage and never see server-synced per-question results. Moving mock results server-side (Student Question History, §1.3) is what lets all five compute from real, durable, cross-device data instead of a single browser's local state.

---

## 7. Scalability

Design constraints to support thousands of questions across all pathways with zero architectural rework as the bank grows:

- **Question Bank is read-heavy, small-row, cacheable.** Even at 10,000+ questions, the table is small enough to filter/sample entirely in a single indexed query (`WHERE subject = ? AND ? = ANY(pathway) AND difficulty = ?`) — no need for search infra, denormalization, or a separate read store at this scale.
- **Student Question History is the write-heavy, large table** — grows as `students × questions_attempted`, not `students × total_bank_size`. Indexed on `(student_id, question_id)` and `(student_id, last_presented_at)` for the two access patterns assembly needs (§2.2, §4). This table's growth is naturally bounded by actual usage, not bank size — adding 5,000 more questions to the bank doesn't add 5,000 more history rows per student, only the ones actually served do.
- **Pathway as a set, not a foreign key to a single row** (§1.2) means adding an 8th pathway later doesn't require re-tagging or restructuring existing questions — it's an additive tag, not a schema migration per pathway.
- **Skill taxonomy is already open-ended** (`SkillType` enum, extendable) — new skills per subject don't require new tables, just new enum values plus new questions tagged with them.
- **No per-subject special-casing in the assembly engine.** Because English/Writing currently lack a `difficulty` field that reasoning/maths already have, the immediate practical requirement for scaling *this specific bank* is closing that metadata gap (§1.2) — not a structural redesign. Once every subject has the same metadata shape, one assembly algorithm (§2.2) serves all subjects/pathways uniformly, so "thousands of questions across all pathways" is a data-volume question, not an architecture question.

---

## Open Decisions for Review

1. **Within-mock vs. between-mock difficulty movement** (§3.3) — recommend starting between-mock only.
2. **Cooldown window length** for anti-repetition (§4.1) — needs a number (days or mock-count based), not specified here; likely subject-dependent given writing prompts are scarce relative to reasoning questions.
3. **Child profile model** — this proposal assumes the existing single-profile-per-device model can gain columns/joins without a redesign; if multi-child-per-account support is wanted independently of this engine, that's a separate, prerequisite decision, not part of this proposal.
4. **Migration of existing `data/*.ts` content into the bank** — sequencing/ID-stability approach flagged in §1.4 but deliberately left as an implementation-phase detail, not an architecture decision.

---

## Explicitly Out of Scope for This Proposal

- No code, migrations, or schema will be created until this document is reviewed and implementation is separately approved.
- The existing mock system (`app/mocks/[pathway]/page.tsx`, `app/mock-test/page.tsx`, `data/*.ts`) is not modified by this document.
- No decision is made here about whether the unused `lib/mockArchitecture.ts` stub ("Phase 2C") is reused, superseded, or deleted — flagged for the implementation-planning conversation, not resolved now.
