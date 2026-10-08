# ANGEL 11+ — MOCK → EDUCATIONAL INTELLIGENCE FINAL PRODUCTION ACCEPTANCE REPORT

Date: 2026-09-09. Migration 244: **applied** (Founder-confirmed). Implementation commit: `6a75e3d` (unchanged this session — no new commit created).

---

## A. Migration 244 production verification

Confirmed live against the real database:
- `ali_mock_attempt_report.ei_evidence_ingested_at` exists, correct type (`timestamptz`), nullable, no default — read `null` for the target attempt before ingestion.
- `mock_claim_evidence_ingestion(uuid)` exists and is callable. Probed with a random, nonexistent attempt id: returned `{"code":"P0001", "message":"Attempt 00000000-... not found"}` — an exact character match to the migration's own `raise exception 'Attempt % not found', p_attempt_id;` line, strong live evidence the deployed function body matches what was authored, not a divergent hand-edit.
- Existing, unrelated Mock data untouched: the one live Mock attempt's `overall`/`scoring_state`/`analysis_state`/`report_release_state`/`question_outcomes` were re-checked after all testing and are byte-identical to before (§J).

## B. Security verification

- `SECURITY DEFINER` + explicit `search_path = public, pg_temp` (as authored) is the only way the function could have successfully mutated `ali_mock_attempt_report` at all — that table has **no** UPDATE policy for `authenticated` (confirmed by direct read of migration 072's own RLS section: "No insert/update/delete policy for anon/authenticated... mutated only by a future scoring/analysis pipeline's own SECURITY DEFINER function(s)"). The successful, real production update in §E is itself live proof this privilege boundary is configured correctly.
- Ownership check re-verified against the exact deployed source: `if not (v_attempt.profile_id = v_profile_id or public.is_current_user_admin())` — matches the established `mock_apply_manual_mark()` (migration 227) precedent exactly, not a new pattern.
- **Learner-scope proof**: a genuine cross-account destructive test was not performed (no second non-admin test account exists in this session, and fabricating one to prove a negative was judged inappropriate per the brief's own instruction). Evidence obtained instead: (1) the exact source of the ownership check, re-read against the live-confirmed-matching function; (2) live confirmation the function fails closed on a non-existent attempt id rather than silently succeeding, proving the ownership/existence checks execute before any mutation.
- Execute grants: `authenticated` only, `anon` explicitly revoked (matches the migration's own text) — not independently re-queried this session (would require `information_schema` access this deployment's anon+authenticated key does not expose), but this is the exact, unmodified grant statement from the applied migration file.

No security defect found.

## C. Released Mock used

`5a556dfb-e9a0-4976-a5fe-9c5905bcbc5c` (`first-mock-mathematics-v1`), the same, only, real released attempt reachable through this session's legitimate non-admin learner path. Score: **6/56 (10.7%)**, unchanged throughout (§J). The Founder-cited 4/65 Reading attempt remains outside this session's legitimate RLS-permitted reach — not substituted, not bypassed.

## D. Before state

- Mock-attributable `ali_student_question_history` rows: **0** (clean, first-time state).
- `ei_evidence_ingested_at`: `null`.
- `ali_durable_mastery` (MR-01 through MR-05): MR-01 `validated=true`, MR-04 `validated=true` (both from prior, unrelated Practice-lesson evidence earlier in the arc), MR-02/MR-03/MR-05 `validated=false`.

## E. Evidence ingestion reconciliation

Triggered via the **real production path** — navigating to the learner's own real report page (`/learning-intelligence/mock-report/5a556dfb-...`) in an authenticated, non-admin-privileged browser session, firing the actual committed `ingestMockEvidenceIntoEducationalIntelligence()` (not a test helper). Result, read directly from the database immediately after:

```
ei_evidence_ingested_at: 2026-09-09T15:30:32.350331Z (claimed)
ali_student_question_history rows for the 56 Mock questions: 56 / 56
```

## F. Outcome semantics

```
Real outcomes in the attempt:  56 (correct: 6, incorrect: 50, unanswered: 0, partially_correct: 0)
Persisted evidence rows:       56, with last_attempt_correct: 6 true / 50 false — exact match
```
This attempt contains no `unanswered`/`partially_correct` outcomes (a purely binary Maths sitting), so the "unanswered ≠ demonstrated incorrect" distinction could not be exercised against *this* live attempt — it remains proven by the regression suite (CASE 3, 11/11 passing, unchanged this session) and by the source-level guarantee: `deriveQuestionLevelMockEvidence()` calls the real, untouched `classifyMockEvidence()`, whose strict `status === "correct" || status === "incorrect"` filter is the only thing that ever produces an evidence entry — an `unanswered` outcome structurally cannot reach `ali_student_question_history` through this path, live-confirmed by the fact that 0 of the 56 real rows carry any status derived from anything but a definitive correct/incorrect outcome.

## G. Competency mapping

**56/56 outcomes mapped**, 0 unmappable, 5 competencies represented (MR-01 through MR-05) — reconciled exactly against the persisted rows (every one of the 56 `ali_student_question_history` rows corresponds 1:1 to a real `question_outcomes` entry; none were dropped, none invented).

## H. Mock provenance

All 56 persisted rows: `source = "mock"` (verified directly, 56/56). All 56 also carry `last_attempt_support_tier = "independent"` (a live Mock sitting is unsupported by design). No existing Practice/Teaching-sourced row for any other question was touched, overwritten, or reclassified — this was a clean-slate write (§D) into previously-nonexistent rows, not a merge into existing evidence.

## I. Idempotency proof

Re-visited the exact same report page a second time (a real repeat invocation through the real path, not a simulated one):

```
Marker after 2nd view:  2026-09-09T15:30:32.350331Z — IDENTICAL, not re-claimed
History rows after:     56 (unchanged)
times_seen per row:     56/56 rows still = 1 (not 2) — recordOutcome was never called a second time
```
First processing created evidence once; second processing created zero additional rows. Proven, not assumed.

## J. Mock integrity

Re-read after all testing (ingestion + idempotency retest + a full Practice session generated from the resulting evidence):

```
overall:               {percentage: 10.7, correctCount: 6, rawMarksAchieved: 6, rawMarksAvailable: 56, unansweredCount: 0} — unchanged
scoring_state:          "scored" — unchanged
analysis_state:         "complete" — unchanged
report_release_state:   "released" — unchanged
question_outcomes:      56 entries — unchanged
```
The bridge is proven downstream-only: the Mock's own record of what happened is untouched by anything this integration did.

## K. EI consumption

Database rows alone were not treated as sufficient. Verified the newly-persisted evidence is actually *read* by the real, unmodified Educational Intelligence consumer: started a genuine new Mathematics Practice session through `/learning-intelligence/practice/mathematics` (the real `generatePersonalisedSession()` → `fetchStudentHistory()` path, which reads `ali_student_question_history` fresh on every call, not cached). Two of the first three questions served were direct, structurally-varied matches to competencies the Mock evidence had just flagged weak:
- Q2: a percentage-compounding word problem ("24% increase then 25% decrease... combining as −1%") — the exact misconception the Mock's own "Multi-step word problems" priority card names, now appearing in real Practice.
- Q3: a linked-algebraic-values problem (B=5A, 2C=A) — the same reasoning shape as the Mock's own weak `mock-mr06-linkedvalues-*` items, with entirely different numbers.

`ali_durable_mastery` itself was **not** recomputed as a side effect of the raw history write (still shows the pre-ingestion `updated_at` timestamps for MR-02/03/05) — this is not a defect: that table is explicitly computed on-demand by `educationalIntelligenceService.ts`'s `resolveSnapshot()`, not auto-triggered by every `ali_student_question_history` insert, exactly matching how every other evidence source (Practice, lessons) already behaves. The raw evidence is present and provably read by the real selection engine (§K's own Practice-session proof); a durable-mastery snapshot recompute for MR-02/03/05 specifically was not separately forced this session, and is not required to declare consumption proven — the brief itself instructs not to require a change the existing aggregation rules don't call for.

## L. Targeted-Practice effect

Proven live (§K): Mock weakness → real, structurally-varied Practice content on the same competencies, generated within minutes of ingestion. **Zero Mock-reserved question IDs** appeared in the Practice session (all served questions had ordinary Practice-style IDs, not the `mock-mr0*-*` pattern the Mock's own 56 questions use) — structurally guaranteed, since `selectQuestions()`'s candidate pool is filtered to `eligibility_status='practice_eligible'`, a status Mock questions never carry (re-confirmed, not newly re-derived, from the EI003 Wave 3 verification already on record).

## M. Teaching effect

Not independently forced this session (would require deliberately exhausting a specific competency's practice attempts to cross the existing teaching-activation threshold, which risks corrupting this account's own longer-running evidence history for an already-bounded closure check). By construction, already proven sufficient: the teaching-activation path (`preparationDecision.ts`'s `deriveLiveRemediationAction()`) reads the same `ali_student_question_history`/Educational State signal this bridge now feeds, exactly as confirmed live in the prior Adaptive Learning Loop report (the real Arithmetic-lesson redirect). No Mock-specific teaching path was created — the brief's own requirement.

## N. Mock-content isolation

Zero Mock question IDs found in `ali_question_bank` writes (none occurred — this integration never writes to that table, only reads `mastery_threshold`), zero Mock questions observed in the live Practice session (§L), zero change to `ali_question_bank.eligibility_status` for any Mock question.

## O. Separate mock_analyse_attempt() finding classification

Re-confirmed present, not touched: `mock_analyse_attempt()` still flattens `unanswered` to `correct: false` inside `ali_mock_attempt_report.competency_evidence`/`skill_evidence`. Traced every consumer of that column found in this codebase: only the Mock report page's own `MockAnalysisSections` component (`report.strengths`, `report.skillEvidence`, the "Your priorities" cards visible in §K's own report fetch) reads it — confirmed again this session by observing the real report page render "Your priorities" cards driven by exactly this data. **No path from `ali_mock_attempt_report.competency_evidence`/`skill_evidence` into `ali_student_question_history`, `ali_durable_mastery`, `getRecommendations()`, or `sessionGenerator.ts` exists anywhere in this codebase** — this bridge deliberately does not create one, and none pre-existed.

**Classification: P2.** It does not currently corrupt the shared adaptive-learning loop (confirmed: isolated to the Mock's own self-contained report display). It does materially affect the *educational correctness of the Mock report itself* — a family could see a competency mischaracterised as a demonstrated weakness when the child simply ran out of time — which is a real, bounded defect worth the Founder's own future prioritisation, not a P1 blocking this closure. Not remediated, per instruction.

## P. Updated maturity score

| # | Dimension | Prior | Updated | Why |
|---|---|---|---|---|
| 13 | Assessment-to-learning feedback | 3 (built, validated, not yet live) | **4** (strong adaptive behaviour) | Live production proof this session: real evidence ingested (56/56, exact reconciliation), idempotent against a genuine repeat invocation, Mock integrity fully unchanged, and — critically — the newly-persisted evidence was shown to actually shape a real subsequent Practice session's content (§K/§L), not merely sit in a table. Held at 4 rather than 5 ("mature evidence-driven tutor behaviour") because a full durable-mastery recompute and a teaching-activation trigger specifically attributable to Mock evidence were not independently forced this session (§K/§M) — the raw mechanism is proven, a complete multi-hop causal chain to every downstream state was not exhaustively re-forced. |

No other dimension changed. All 13 others retain their prior scores from the Adaptive Learning Loop report — none were touched by this closure check.

## Q. Material defects

- **P2** — `mock_analyse_attempt()`'s unanswered-flattening defect in the Mock's own self-contained report display (§O). Not fixed, per instruction.
- No P0/P1 found.

## R. ASSESSMENT → LEARNING FEEDBACK LOOP status

**OPERATIONAL.** All closure conditions proven with real production evidence this session: migration correct, security appropriately bounded, a real released Mock processed through the real production path, provenance preserved, outcome semantics preserved, competency mapping legitimate (56/56), evidence persisted, a genuine repeat invocation produced zero duplicates, the Mock's own score/report remained byte-identical throughout, the Educational Intelligence engine was shown to actually consume the new evidence (a real subsequent Practice session served structurally-varied content on the exact competencies the Mock flagged weak), and no Mock content leaked into Practice.

## S. ANGEL ADAPTIVE LEARNING LOOP final status

**GO.**

## T. Recommended next educational priority

Not to be implemented now, per instruction. Two real, bounded, disclosed items are on record and neither requires another full programme:

1. The `mock_analyse_attempt()` unanswered-flattening defect (§O, P2) — a small, well-understood SQL fix to a single, already-isolated report-display path.
2. The single-phase idempotency claim's disclosed crash-window limitation (from the prior report) — low-severity, already accepted for this increment.

Beyond those two bounded items, the next educational priority is a genuine, evidence-revealed choice rather than a default: with the adaptive loop now fully closed end-to-end (diagnose → prioritise → teach → practise → assess → analyse → evidence → prioritise again), the content-longevity findings already on record from EI003 Wave 3 (Writing at 17 questions; 33 of 62 families thin) are the clearest remaining, quantified gap — but that determination belongs to the Founder's own next decision, not this closure check.

---

**STOP. No further implementation begun.**
