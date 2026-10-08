# ANGEL 11+ — MOCK ASSESSMENT-TO-LEARNING INTEGRATION AND PRODUCTION ACCEPTANCE REPORT

Date: 2026-09-09. Commit: `6a75e3d` (pushed to `origin/main`). Migration 244: **prepared, validated, committed, pushed — NOT applied**, per standing instruction.

---

## A. Existing lifecycle traced

Real, current-code trace (not inferred from filenames):

- **Mock attempt becomes score-eligible**: `mock_submit_attempt()` transitions `ali_mock_attempt.status` to `submitted`; a trigger (migration 072) inserts a bare `ali_mock_attempt_report` row.
- **Marking finalises**: `mock_score_attempt()` (migration 104, latest) computes `question_outcomes` (per-subpart `status`/`marksAwarded`/`marksAvailable`/`questionTypeId`), sets `scoring_state='scored'`. For Reading Comprehension free-text items, `mock_apply_manual_mark()` (migration 227) later resolves any `requires_manual_marking` item to `correct`/`incorrect`/**`partially_correct`** (0 < marks < available) — a real, live status this codebase's own `MockQuestionOutcomeStatus` type had never included (fixed, §C).
- **Analysis completes**: `mock_analyse_attempt()` (migrations 151/215/227) runs automatically, synchronously, inside the same transaction as the final mark — no manual trigger needed. It populates `competency_evidence`, `strengths`, `weaknesses`, `skill_evidence` directly on the report row, using its own SQL-native classifier (`mock_question_type_competency()`), entirely separate from `lib/mockAttempt/evidenceAdapter.ts`.
- **Report release**: `mock_release_report()` (admin-only) sets `report_release_state='released'`, the ONLY state at which `ali_mock_attempt_report`'s own RLS policy lets the owning learner (or admin) read the row at all — sealed until then, with no exceptions.

## B. Existing evidenceAdapter contract

`lib/mockAttempt/evidenceAdapter.ts`'s `classifyMockEvidence()` — real, pure, untouched — accepts raw `MockQuestionOutcome[]` and returns `MockCompetencyEvidenceEntry[]` (competency/questionType/correct, no `questionId`), including only outcomes whose `status` is exactly `"correct"` or `"incorrect"` and whose `questionTypeId` maps to a real competency via the same `QUESTION_TYPE_PRIMARY_COMPETENCY` table Practice's own evidence pipeline uses. `unanswered`, `requires_manual_marking`, and (now confirmed live) `partially_correct` are already, correctly excluded.

## C. Root cause of disconnection

Two real findings, verified against live code and live production data, not assumed:

1. **`evidenceAdapter.ts`'s own header comment is stale.** It claims `ali_student_question_history` "has NO evidence-provenance column" and that writing through it "would silently contaminate" Practice evidence. Both are false against the live schema: migration 006 documents `source` as "an open string, not a closed enum... new ALI consumers can write here later without a migration" (default value is even `'adaptive_mock'`), and 5 distinct source values already coexist live (`learning_independent`, `learning_guided`, `practice_experience`, `family_choice_pilot`, `founder_validation_assessment` — confirmed by a live query against this session's own profile). **No schema change was needed for provenance.** `"mock"` is simply one more legitimate value of an already-open column.
2. **A second, SQL-native classifier already exists and runs automatically** (`mock_analyse_attempt()`, §A) but its output was never forwarded past the report row. This classifier has its own real defect relative to this brief's §7: it sets `correct: (status = 'correct')` for every non-`requires_manual_marking` outcome — meaning an `unanswered` outcome is written as `correct: false`, indistinguishable from a genuine wrong answer. **This integration deliberately does not read that column** for this reason; it re-derives evidence from the raw `question_outcomes` via the TS classifier instead (disclosed, not fixed — fixing SQL classification logic is out of this bounded increment's scope).

A genuine type/schema drift was also found and corrected: `MockQuestionOutcomeStatus` was missing `"partially_correct"`, a real status written live since migration 227. The existing classifier already excluded it safely at runtime (its strict `!==` check); the type fix only makes that already-correct behaviour visible to new code.

## D. Bounded implementation

Three files, no new engine:

- `lib/mockAttempt/evidenceIntegration.ts` (new) — `deriveQuestionLevelMockEvidence()` composes the real `classifyMockEvidence()` per-outcome (zero duplicated logic) to recover the `questionId` its aggregate output type doesn't carry; `ingestMockEvidenceIntoEducationalIntelligence()` orchestrates claim → read → derive → `recordPresentation()`/`recordOutcome()` (both unmodified, the exact shared primitives every Practice/lesson caller already uses).
- `supabase/migrations/244_mock_evidence_educational_intelligence_bridge.sql` (new, **not applied**) — one nullable column (`ei_evidence_ingested_at`) and one `SECURITY DEFINER` function (`mock_claim_evidence_ingestion`).
- `app/learning-intelligence/mock-report/[attemptId]/page.tsx` (modified) — one fire-and-forget call, added inside the existing `report_release_state === "released"` branch, after the report is already rendered.

Wiring point chosen: the learner's own released Mock report page — the earliest, natural, already-RLS-permitted moment the data exists at all. Never the live exam (§M).

## E. Evidence provenance

Every written row carries `source="mock"` (confirmed in the regression suite, CASE 6) via the existing, already-open `source` column — no new column, no merge with any Practice source value, no schema change for this purpose.

## F. Idempotency

`mock_claim_evidence_ingestion(p_attempt_id)` performs an atomic `update ... set ei_evidence_ingested_at = now() where ei_evidence_ingested_at is null returning true` after validating ownership and `report_release_state='released'`/`scoring_state='scored'`. A second call for the same attempt (retried analysis, retried report generation, a page refresh, a repeated invocation) returns `false` and the caller writes nothing (proven in CASE 2). **Disclosed, accepted limitation** (documented in the migration's own header): the claim is set at the start, not via a two-phase claim/complete pair, so a process crash between claim and the last `recordOutcome()` call would leave the attempt marked ingested with partially-written evidence. Judged acceptable for this bounded increment — the trigger point has no external I/O dependency that could hang mid-way, and a genuine fix would require either a service-role transaction (no `SUPABASE_SERVICE_ROLE_KEY` exists in this deployment) or reimplementing `recordOutcome()`'s logic in SQL (duplicating a shared primitive, out of scope). Recovery from the rare crash case is a manual admin action, not automated.

## G. Outcome semantics

`correct`/`incorrect` → real evidence, exactly as the existing classifier already treats them. `unanswered` → excluded (never conceptual weakness, per §7 of the brief). `partially_correct` → excluded (the existing classifier has no richer treatment to preserve; inventing one would be new classification logic, forbidden). `requires_manual_marking` → excluded (not yet a definitive outcome). All four preserved exactly as the existing, unmodified adapter already treats them — proven in CASE 3.

## H. Competency mapping

Every emitted entry passes through the same, real `QUESTION_TYPE_PRIMARY_COMPETENCY` total mapping Practice already uses. An unmappable `questionTypeId` (or `null`) is safely excluded, never given an invented competency — proven in CASE 4. Live proof: all 56/56 real outcomes in the one accessible released attempt mapped cleanly (§I) — 0 unmappable items encountered in real production data.

## I. Historical released-Mock acceptance case

**Disclosure required by honesty, not by convenience**: the Founder's cited historical attempt (4/65, 6.2%, 2 correct/2 partially correct/7 incorrect/17 unanswered — the Reading Comprehension manual-marking scenario) belongs to an account this session's own RLS-scoped profile (`fc15e963-5d64-4812-893f-dd7eec5323ca`) cannot legitimately read — `ali_mock_attempt_report`'s RLS policy has no admin bypass (confirmed by direct read of migration 072's policy text), and this deployment has no service-role credential. Only one released Mock attempt exists under this session's own accessible profile: `5a556dfb-e9a0-4976-a5fe-9c5905bcbc5c` (`first-mock-mathematics-v1`, submitted 2026-08-27, scored 6/56 = 10.7%, 0 unanswered, 0 manual-marking — a purely binary Maths attempt, so it does not itself exercise the `partially_correct`/`unanswered` paths).

This attempt was used as the **live acceptance case**: its real 56 `question_outcomes` were fetched and run through the actual, committed `deriveQuestionLevelMockEvidence()` (not a reimplementation, the real function, imported and executed):

```
Real outcomes: 56 (correct: 6, incorrect: 50, unanswered: 0, partially_correct: 0)
Evidence entries the real classifier would forward: 56 / 56 (0 unmappable)
Per-competency: MR-01 4✓/15✗   MR-02 1✓/11✗   MR-03 0✓/4✗   MR-04 1✓/16✗   MR-05 0✓/4✗
```

The `partially_correct`/`unanswered` exclusion paths (§G) are instead proven with realistic fixtures matching that exact composition in the regression suite (CASE 3), since the one live-accessible attempt does not itself contain them. Recommend the Founder point this session (or a future one) at the specific 4/65 account if full acceptance against that exact historical case is required — this is a genuine, disclosed access boundary, not a substitution made without disclosure.

## J. Before/after EI evidence

**Cannot be run against live production**: migration 244 is not applied, so `mock_claim_evidence_ingestion` does not exist in the live database yet — the actual write path cannot be executed this session. What is proven instead, both real:

1. **The derivation half, against real data** (§I): exactly which evidence rows would be written, with real question IDs and real competency codes.
2. **The write half, against a faithful fake client** (regression suite CASE 1/6/7): `recordPresentation`/`recordOutcome` are called with the exact real shapes (`source="mock"`, correct `profile_id`/`question_id`), writing only to `ali_student_question_history` (the exact table `lib/learningEngine/sessionGenerator.ts`'s `fetchStudentHistory()` already reads unconditionally) and its own presentation-counter table — never any Mock table.

Once applied, the expected real change for this specific attempt (MR-03 and MR-05 both 0/4, MR-04 1/17) is a genuine weakness signal on 3 of 5 competencies — evidence-correct given the attempt's own real 10.7% score, not fabricated.

## K. Priority/recommendation effect

Not independently re-verified live this session (would require applying migration 244 first). By construction, this is proven correct without needing a new mechanism: `recordOutcome()`/`applyAttemptOutcome()` write to the exact `mastery_state`/`distinct_correct_sessions` fields that `getRecommendations()` (via `deriveWeakCompetencies`/the Educational Intelligence snapshot, already verified live and operational in the prior Adaptive Learning Loop report) already reads for every other evidence source. Mock evidence written this way is not a new signal type the recommendation engine needs to learn to consume — it is data in a table that engine already, unconditionally reads.

## L. Teaching/targeted-Practice effect

Same reasoning as §K: `sessionGenerator.ts`'s `TEACHING_STATE_TIER_MULTIPLIER` and `selectQuestions()`'s weak-skill override key off the same `ali_student_question_history` state Mock evidence would join. No Mock-specific lesson or Mock-specific selection code was added — reusing the existing Teaching Engine exactly as instructed (§16 of the brief). Structurally proven never to leak a Mock-reserved question into Practice (§M).

## M. Mock isolation/integrity

- **Never touches Mock scoring, marks, outcomes, or the released report itself** — proven structurally (CASE 7: the only RPC call is the new claim function; every other call is either a pre-existing, unmodified telemetry call or a read).
- **`ali_question_bank` is only ever read** (mastery threshold lookup), never written (CASE 5) — no Mock-reserved question is ever inserted into, or its eligibility changed within, the Practice-selectable pool.
- **No hints, teaching, or remediation enter the live Mock experience** — the wiring point is the post-release report page, never the exam itself; `supportTier` is always `"independent"` for Mock evidence (a live sitting is unsupported by design).
- **No RLS relaxation**: `ali_mock_attempt_report` gained no new read/write policy; the new function is the exact kind of future SECURITY DEFINER writer migration 072's own header already anticipated.

## N. Regression evidence

11 tests, all passing, covering all 7 required cases (§18 of the brief) plus 4 supporting tests:

```
CASE 1 (successful claim, valid evidence persisted) — PASS
CASE 2 (processed twice, no duplicate) — PASS
CASE 3 (correct/partial/incorrect/unanswered semantics preserved) — PASS
CASE 4 (unmappable question, safe exclusion) — PASS
CASE 5 (no Mock-reserved leak into Practice) — PASS
CASE 6 (visible to the real EI consumer, source="mock") — PASS
CASE 7 (Mock score/report unchanged) — PASS
+ 4 supporting tests (RPC-error handling, pure-function edge cases, not-released refusal)
11/11 pass
```

## O. Tests/typecheck/build

- Targeted suite: `npx tsx --test tests/lib/mockAttempt/evidenceIntegration.test.ts` — 11/11 pass.
- All 4 directly-touched Mock test files together: 73/73 pass.
- Full project suite (`npm test`, the correct runner): **4272/4275 pass** — the exact 3 pre-existing, permanently-unrelated failures (`candidateStoreMapping.test.ts`, `mr03CoordinateBlueprints.test.ts`, `migration237PublishAnswerPersistenceCorrection.test.ts`), unchanged by this work.
  - Fixed 3 pre-existing tests that broke as a direct, legitimate consequence of this change: `mockReportReleaseAndDiscoverability.test.ts`, `mockReportAnalysisRendering.test.ts`, `mockPriorityTargetedPracticeRouting.test.ts` each asserted an exact literal source-text regex for the report page's release-gate structure; each was updated (not weakened — the same semantic invariant, "only released ever reaches ready," is re-asserted) to admit the new fire-and-forget call inserted inside that same branch, following the identical precedent these same tests already record from a prior legitimate restructuring (Increment 016, Part C).
- `tsc --noEmit`: clean relative to this change (one explicit, well-commented, disclosed type cast for the not-yet-applied RPC, since `types/supabase.ts` is generated from the live, currently-applied schema and cannot yet know a function that doesn't exist there — removed once migration 244 is applied and types are regenerated).
- Isolated `next build` (git worktree, bounded changeset only, symlinked `node_modules`, copied `.env.local`): **exit code 0**, all 64 routes built including `/learning-intelligence/mock-report/[attemptId]`. Worktree removed after.

## P. Commit/deployment status

Committed as `6a75e3d`, pushed to `origin/main`. **Migration 244 is prepared, validated, committed, pushed — NOT applied.** Founder must apply `supabase/migrations/244_mock_evidence_educational_intelligence_bridge.sql` via the Supabase SQL Editor before `mock_claim_evidence_ingestion()` exists live and the bridge can actually run (until then, the fire-and-forget call on the report page will fail silently — by design, `.catch(() => {})` — and the report itself renders exactly as before).

## Q. Material defects

- **P2** — `mock_analyse_attempt()` (live, SQL-side, migrations 151/215/227) flattens `unanswered` outcomes to `correct: false` in `ali_mock_attempt_report.competency_evidence`. Not fixed (out of this bounded increment's scope — would mean rewriting a classifier); this integration structurally avoids consuming that column for exactly this reason, so the defect cannot reach the shared evidence pool through this bridge. Disclosed for the Founder's own future prioritisation.
- **P3** — `MockQuestionOutcomeStatus` was missing the real, live `"partially_correct"` status (fixed this increment, §C).
- **P3** — The idempotency claim is single-phase (§F) — a rare crash-window limitation, disclosed and accepted for this bounded increment.
- **P4** — Full acceptance against the Founder's specifically-cited 4/65 historical attempt could not be performed (§I) — a genuine RLS access boundary from this session's own account, not a defect in the integration itself.

No P0/P1 findings.

## R. Updated adaptive maturity dimensions

Only the one dimension this correction actually affects, per instruction (no unrelated scores inflated):

| # | Dimension | Prior score | Updated score | Why |
|---|---|---|---|---|
| 13 | Assessment-to-learning feedback | **1** (real classifier exists, entirely unwired) | **3** (operational baseline, pending application) | The bridge is built, tested (11/11), proven correct against real production Mock data (§I), and structurally guaranteed not to duplicate evidence, leak Mock content into Practice, or alter the Mock experience — but cannot be scored 4 ("strong adaptive behaviour") until migration 244 is actually applied and a real ingestion + a real subsequent recommendation change is observed live, which this session could not do (no service-role access, migration not yet applied). All 13 other dimensions are unchanged from the prior report — none were touched by this bounded increment. |

## S. ASSESSMENT → LEARNING FEEDBACK LOOP status

**BUILT, VALIDATED, NOT YET LIVE.** The bridge exists, is correct against real production data and a comprehensive regression suite, and is committed — but the loop is not "OPERATIONAL" in the sense §22 requires (Mock evidence actually entering the live database and materially influencing a subsequent real recommendation) until migration 244 is applied. Declaring it fully OPERATIONAL today would overstate what has been proven; declaring NO-GO would understate a genuinely complete, tested, bounded piece of work blocked only on the one step this session is not authorised to take (applying a migration).

## T. GO / REVISE / NO-GO

**REVISE — pending one Founder action.**

The one remaining step to reach GO is not more engineering: apply `supabase/migrations/244_mock_evidence_educational_intelligence_bridge.sql`. Once applied, the next learner (or admin, for verification) viewing any released Mock report will trigger real ingestion, and a direct before/after query against `ali_student_question_history`/`ali_durable_mastery` for that profile would provide the final, live confirmation §14 of the brief asks for. No further implementation is needed to reach that state — this report's own §I dry run already shows exactly what that ingestion will write for the one real attempt this session could reach.

**Exact migration required**: `supabase/migrations/244_mock_evidence_educational_intelligence_bridge.sql` (migration 244). Why: it is the one piece of new database surface a safe, idempotent bridge needs — a completion marker on `ali_mock_attempt_report` and the one `SECURITY DEFINER` function that claims it atomically — and, per this deployment's own standing constraint (no `SUPABASE_SERVICE_ROLE_KEY`), only a Founder-applied migration can create a function with the elevated privilege needed to validate ownership and mutate a sealed, RLS-protected report row.

---

**STOP. No other programme has been started.**
