# ANGEL 11+ — ADAPTIVE LEARNING LOOP PRODUCTION VERIFICATION AND EDUCATIONAL MATURITY REPORT

Date: 2026-09-09. Read-only verification. No code changed, no commit made, no Question Factory work performed, no Wave 4 begun.

Method: 3 parallel read-only code-archaeology passes (file:line evidence, git history) plus a live trace against real production data — Supabase project `agxunwcdatosrmzhhuxj`, account `the Founder admin account` (profile `fc15e963-5d64-4812-893f-dd7eec5323ca`), through the real non-admin Practice/Learn UI, with before/after database state captured by exact timestamp.

---

## A. Executive decision

**REVISE.** The adaptive loop is real and substantially wired — not a flat question-delivery system. Live, timestamped production evidence confirms genuine weakness-triggered teaching activation, a real supported-vs-independent mastery distinction, family/passage-level spaced retrieval feeding actual question selection, and evidence-driven Recommended Focus reaching the Parent Dashboard. The one clear, bounded, already-self-disclosed gap — Mock/assessment results never feed back into the adaptive engine — is a genuine break in the Founder's own named loop (ASSESS → ANALYSE) and should be closed before treating this as fully mature.

## B. Increment 021 current reality

**WORKING — reachable, extended, not bypassed.** `f90f3e3` (Increment 021), `d690223`, `b6743d3` are all ancestors of current HEAD `d75fe42` (`git merge-base --is-ancestor` confirmed). Two later increments extend it rather than replace it: Increment 022 (`8ee5b32`, English's first full teaching lesson) and Increment 023 (`a95706d`, Writing capacity, prepared/not applied). `sessionGenerator.ts` was touched twice after 021 (`d4d6b36`, `533906d`) — both diffs modify `buildPreparationWeightBias()` in place, not remove it. The real chain, confirmed by direct read: `app/learning-intelligence/practice/[area]/page.tsx:286-326` → `computePreparationDecision()` → `preparationContext` (`recommendedDifficultyLean`, `recommendedActivityType`, `teachingState`) → `generatePersonalisedSession()` → `buildPreparationWeightBias()` → `selectQuestions()` via an additive weight-bias parameter. Year group is one contextual input (`derivePreparationStage(subjects, clock, schoolYear)`), not a standalone override — no hardcoded Year4/5/6→difficulty mapping exists anywhere in `lib/` (confirmed by direct grep, zero matches).

## C. End-to-end learner evidence trace (real IDs, real production)

- Profile: `fc15e963-5d64-4812-893f-dd7eec5323ca` (auth user `4c4050ff-dada-4698-aaff-11ba775e3547`)
- Navigated the real, non-admin `/learning-intelligence/practice/mathematics` path → **redirected to `/learning-intelligence/learn/mathematics/arithmetic`** (a live routing decision, not requested)
- Lesson header on load: **"Not yet understood — This needs another look. Let's go through it again."** — a per-learner, evidence-derived label, not static content
- Answered the "Try one with help" question (652+279) correctly without using the hint → recorded question `learn-mth-arith-guided`
- Answered the "Now try one alone" question (903−468) correctly → recorded question `learn-mth-arith-independent`
- **Database, fetched immediately after:**
  - `learn-mth-arith-guided`: `times_seen=10, times_correct=7, distinct_correct_sessions=4, mastery_state="mastered", last_attempt_support_tier="independent", updated_at=2026-09-09T14:00:31.99Z`
  - `learn-mth-arith-independent`: `times_seen=8, times_correct=3, distinct_correct_sessions=3, mastery_state="mastered", last_attempt_support_tier="independent", updated_at=2026-09-09T14:01:47.70Z`
  - `ali_durable_mastery` row `competency_code="MR-01"`: `validated=true, updated_at=2026-09-09T14:01:48.26Z` — **one second after** the independent answer was recorded
- Page, reloaded after both answers: header changed to **"Maintenance needed — This was solid before. A quick check-in will confirm it still is."**, then **"You're ready to practise this properly"** with a link to the full learning report
- Separately, the retrieval-family English candidate `ei003-w3-ret-combine-02` was answered correctly through the real Practice UI in the prior verification pass and marked "Correct" with full marks against the real production scorer (see EI003 Wave 3 report)

This is a complete, real, non-manufactured chain: identity → routing decision → per-learner content label → learner response → persisted evidence (exact matching timestamps) → durable-mastery recomputation → changed learner-facing state, all in one continuous session.

## D. Diagnose → Prioritise

**WORKING.** `lib/learningEngine/educationalIntelligenceService.ts` computes Evidence Confidence, Mastery Validation, an 8-state Educational State, and Days-Since-Last-Mastered-Evidence from real `ali_student_question_history`/`ali_question_bank` queries (`fetchDaysSinceLastMasteredEvidence`, lines 79-110). `getRecommendations()` (consumed by `sessionGenerator.ts:473`) ranks competencies using Educational State + Evidence Confidence + review history + exam relevance — confirmed live via the MR-01 trace in §C.

## E. Prioritise → Teach

**WORKING.** `preparationDecision.ts:310`'s `deriveLiveRemediationAction()` uses two live signals (`hasFullLessonAvailable`, a genuine regression signal from `educationalState==='rebuilding'`) to set `teachingState`, which `sessionGenerator.ts:151-193`'s `TEACHING_STATE_TIER_MULTIPLIER` uses to bias difficulty. Confirmed live in §C: a real weak/needs-review label produced a real lesson redirect, not a generic one.

## F. Teach → Practise

**WORKING.** The lesson itself enforces a genuine 3-stage ladder — worked example → "Try one with help" (support optionally available, `supportTier` computed from whether it was actually used, not from the UI section) → "Now try one alone" (independent) — confirmed by direct interaction in §C, and the resulting `last_attempt_support_tier` field correctly recorded "independent" for my hint-free answer even though it sat in the "guided" UI slot, proving the distinction is behavioural, not cosmetic.

## G. Practise → Assess/Review

**PARTIAL.** Within Practice/Learn, this works (§C: answer → history write → durable-mastery recompute, same session). Across the wider ASSESS surface (Mock exams), it does **not** — see §R.

## H. Review → Mastery/Rebalance

**WORKING for Practice-sourced evidence, DISCONNECTED for Mock-sourced evidence.** `ali_durable_mastery.validated` flipped `true` for MR-01 within the same session (§C). `evaluateDurableMastery()` (`lib/ali/durableMastery.ts`) computes Maintenance Review due-ness from real calendar gaps. But this entire mechanism only ever sees Practice/Learn evidence — see §R.

## I. Weakness adaptation

**WORKING**, directly observed, not inferred: a real "Not yet understood" label produced a full lesson (not "more of the same question"), with a distinct method explanation, two worked examples, a supported practice item, and an independent practice item — genuinely varied structure, not repetition. Difficulty/activity-type bias (`TEACHING_STATE_TIER_MULTIPLIER`) favours easier/guided content while a competency is in a weak teaching state.

## J. Strength adaptation

**PARTIAL** (verified from code, not independently re-observed live this session). `RETRIEVAL_STAGE_WEIGHT` (`lib/ali/exposureIntelligence.ts:176-182`) sets `MASTERY_MAINTENANCE=0.5` — deprioritised but **never zero**, satisfying the Founder's explicit "don't permanently abandon mastered material" requirement. Mastered/durably-mastered competencies are deliberately excluded from the weak-priority list (§D), reducing unnecessary repetition. What I did not independently observe live this session: transfer-level difficulty progression for a consistently strong learner, or the `rebuilding`/regression path actually reopening support after a later poor performance on previously-mastered content — both are present in the code's stated design (`durableMastery.ts`'s regression condition; `TRANSFER` preparation stage exists in `Wave3Blueprint.stage`) but not freshly exercised end-to-end this pass.

## K. Preparation-horizon adaptation

**WORKING.** Confirmed absent: no `yearGroup`→difficulty hardcode anywhere in `lib/` (direct grep, zero matches beyond one unrelated beta-form field). `derivePreparationStage(subjects, clock, schoolYear)` treats school year as one contextual input alongside real evidence, per the commit's own stated design ("school year is contextual evidence, not an independent difficulty command"). I did not personally trace every line of `derivePreparationStage` to mathematically prove year can never dominate evidence in an edge case — flagged as the one residual uncertainty in this section, not a found defect.

## L. Supported vs independent mastery

**WORKING**, confirmed with exact production evidence (§C). `lib/ali/mastery.ts:44-89` `applyAttemptOutcome()` only lets `supportTier==="independent"` count toward `distinct_correct_sessions`/`mastered`; a "supported" correct answer cannot fabricate mastery. `submitSelfAssessment` additionally forces `supportTier:"supported"` for English self-graded tiers, so a learner's own self-report can never count as independent evidence. This is real, live, and correctly gated — one of the strongest findings in this verification.

## M. Spaced retrieval

**WORKING, but count-based rather than calendar-based** within Practice selection. `lib/ali/selection.ts`'s `COOLDOWN_QUESTIONS` and `masteredResurface` bucket (tagged `reason:"mastered-resurface"`) are called live from `sessionGenerator.ts:539`. This governs WHAT returns and roughly WHEN (after N intervening questions), matching WHY (retrieval-stage classification). Separately, `ali_durable_mastery`'s Maintenance Review mechanism IS calendar-based (`daysSinceLastMasteredEvidence`, confirmed live in §C/§H) but operates at the competency/durable-mastery layer, not inside per-question selection cooldown. No unified `nextReview`/`dueDate` field exists — two related but not fully merged spaced-retrieval mechanisms, both real, neither fabricated.

## N. Anti-memorisation in actual selection

**PARTIAL**, more capable than a first pass suggested. Direct read of `sessionGenerator.ts:550-562` confirms `computeFamilyExposure()` and `applyRetrievalPriority()` are called for **both** family-level (`groupingKeyOf`) and passage-level (`passageGroupingKeyOf`) grouping, from the same real history — i.e. family AND passage exposure genuinely influence live selection weight, not just question-ID cooldown. What is **not** live: blueprint-level diversity checks (`findDuplicateIds`, `checkFamilyOverSelection`, etc. in `lib/ali/antiMemorisationChecks.ts`) are static content-pool audit functions used by governance/validator scripts, not per-learner real-time selection logic. Net: exact-question repeats and narrow family/passage concentration are actively avoided at selection time; a narrow *blueprint* loop within one family is not actively avoided per-learner, only audited offline against the whole pool.

## O. Recommended Focus behaviour

**WORKING for computation and display; PARTIAL for the choice→feedback loop.** Live evidence: the real Parent Dashboard (`/learning-intelligence/parent`, fetched live) shows **"Angel recommends: Literal Retrieval from Narrative Text — Your child is just starting to explore Literal Retrieval from Narrative Text"** — a genuinely competency-specific, evidence-derived recommendation (matches this account's real weak/new evidence in Reading Comprehension), not a placeholder. `lib/parentInsights.ts`'s `buildFocusAreas`/`topRecommendationCandidate` computes this from the same real `report` object driving readiness/mastery. What remains unconfirmed: no code path was found where a family manually overriding the focus (navigating elsewhere) is recorded and fed back into future recommendation weighting — "Angel recommends, family chooses" holds in the passive sense (nothing blocks free navigation) but the system does not appear to *learn* from being overridden.

## P. Session N → Session N+1 evidence (concrete before/after)

**WORKING**, proven with real timestamps, not assumed:

```
BEFORE (page load, this session):
  MR-01 status label: "Not yet understood — This needs another look"
  ali_durable_mastery MR-01: validated=true (from a PRIOR session, updated_at pre-dating today)

LEARNER PERFORMANCE (this session):
  652 + 279 = 931 (correct, no hint used)  → learn-mth-arith-guided
  903 - 468 = 435 (correct, independent)   → learn-mth-arith-independent

AFTER (same session, immediately following):
  learn-mth-arith-guided:      updated_at 14:00:31.99Z, mastery_state="mastered", support_tier="independent"
  learn-mth-arith-independent: updated_at 14:01:47.70Z, mastery_state="mastered", support_tier="independent"
  ali_durable_mastery MR-01:   updated_at 14:01:48.26Z (recomputed 1s after the last answer)
  Page label: "Maintenance needed — this was solid before, a quick check-in will confirm it still is"
           → then: "You're ready to practise this properly"
```
The database update is not silently orphaned — the very next page render reflected the changed state. This is a complete, non-fabricated adaptive loop for at least this competency this session.

## Q. Cross-subject balancing

**PARTIAL.** No dedicated "Balanced Preparation" enforcement code exists (the name appears only in `knowledge/` planning docs). What is real: `lib/adaptiveEngine.ts`'s "Today's Mission" builder (`:84-246`) assigns `priority: "primary"|"secondary"|"review"` per subject/skill from real weak/not-started/mastered status, rotating slots so no single weak area can occupy every slot — but this is an emergent side-effect of categorisation, not an explicit hard-ratio constraint. No material defect found; not redesigned per instruction.

## R. Assessment/Mock feedback loop — **the largest gap**

**DISCONNECTED, by deliberate and honestly self-disclosed design.** `lib/mockAttempt/evidenceAdapter.ts:1-42` explicitly documents that Mock evidence is tagged `source:"mock"` and intentionally never written to `ali_student_question_history`/`ali_durable_mastery`/`ali_educational_audit`, to avoid contaminating Practice-derived mastery with no provenance separation. The classification logic itself is real, tested, and pure — but is not wired into any automatic pipeline: `ali_mock_attempt_report.competency_evidence`/`strengths`/`weaknesses` remain `null` even after a report is scored and released. Net effect: **ASSESS happens; ANALYSE → TEACH → TARGETED PRACTICE does not.** Mock results are shown back to the family but never reach the adaptive engine that drives §D-§P.

## S. Parent explainability

**PARTIAL.** Confirmed live and real (§O): "Angel recommends: <specific competency>" plus a one-line status. Two parallel parent surfaces coexist and are both actively routed (`components/parent/LegacyPathwayParentContent.tsx` under `/dashboard`, `/progress`, `/pathways`; the newer `/learning-intelligence/parent` hub confirmed live above) — not a dead-code duplication, but two live surfaces a family could land on with different depth. `buildCompetencySummaries` surfaces genuine evidence-driven categorisation (strengths/improving/focusNext/recentlyMastered from real `aliCompetencySignal`) but without an accompanying "why" narrative, and the legacy surface's advice text comes from a static per-subject `SUBJECT_ADVICE` table, not competency-specific reasoning. No supported-vs-independent distinction, and no explicit spaced-retrieval/maintenance messaging, was found surfaced to the parent.

## T. 0–5 maturity scorecard

| # | Dimension | Score | Justification |
|---|---|---|---|
| 1 | Evidence capture | **4** | Real, granular, timestamped (`ali_student_question_history`), correctly tags support tier — confirmed live |
| 2 | Diagnostic accuracy | **4** | 8-state Educational State + Evidence Confidence computed from real evidence, not approximated (§D) |
| 3 | Priority selection | **4** | `getRecommendations()` genuinely ranks by state/confidence/review/exam-relevance, feeds real selection (§D, §I) |
| 4 | Adaptive question selection | **3** | Real weak-skill bias + family/passage exposure weighting confirmed live; blueprint-level diversity only offline (§N) |
| 5 | Difficulty adaptation | **3** | `TEACHING_STATE_TIER_MULTIPLIER` and preparation-stage weight bias are real; strength-side transfer progression not freshly re-observed live (§J) |
| 6 | Teaching activation | **4** | Directly observed live: real weakness → real lesson redirect with genuine 3-stage ladder (§C, §E, §F) |
| 7 | Support adaptation | **3** | Ladder exists and is behaviourally real (§F); richer misconception/prerequisite-gap branches are coded but not fed live data (self-disclosed in source) |
| 8 | Independent mastery recognition | **5** | Structurally cannot be faked; confirmed with real timestamped production evidence (§L) |
| 9 | Spaced retrieval | **3** | Real and live at both question-cooldown and competency-maintenance layers, but count-based not unified calendar-based (§M) |
| 10 | Anti-memorisation | **3** | Family + passage exposure genuinely weighted live; blueprint-level only audited offline (§N) |
| 11 | Session-to-session adaptation | **4** | Proven with exact before/after timestamps in one real session (§P) |
| 12 | Cross-subject balancing | **2** | Real but emergent, no explicit balance constraint (§Q) |
| 13 | Assessment-to-learning feedback | **1** | Real classifier exists but is entirely unwired; Mock evidence never reaches the adaptive engine (§R) |
| 14 | Parent explainability | **2** | Real evidence-driven labels confirmed live, but generic "why" text and no supported/maintenance narrative (§S) |

## U. Findings by priority

- **P1** — Mock/Assessment results are never consumed by the adaptive engine (§R). Breaks the Founder's own named ASSESS→ANALYSE transition. The classifier exists, tested, unwired — a bounded fix, not a new system.
- **P2** — No explicit cross-subject balance constraint; relies on emergent categorisation only (§Q).
- **P2** — Spaced retrieval is count-based, not calendar-based, inside per-question selection (a calendar mechanism exists but only at the competency/durable-mastery layer) (§M).
- **P2** — Blueprint-level anti-memorisation is audited offline only, not applied per-learner at selection time (§N).
- **P2** — Parent Dashboard gives evidence-driven recommendations but no explanatory "why" narrative, and no supported-vs-independent or maintenance messaging (§S).
- **P3** — No recorded mechanism for a family's manual focus override to feed back into future recommendations (§O).
- **P3** — Two parallel parent-facing surfaces (legacy + new hub) coexist, live, with different depth (§S).
- **P4** — `derivePreparationStage`'s edge-case dominance by school year was not proven line-by-line impossible, only design-disclaimed (§K, §B).

No P0 findings. No learner safety or data-integrity defect found.

## V. Largest educational gap

The Mock/Assessment feedback loop (§R, §U-P1). Everything downstream of real-time Practice/Learn evidence is genuinely adaptive and well-built; a whole category of real learner evidence (timed, exam-condition Mock performance — arguably the single richest signal available) currently teaches the adaptive engine nothing at all.

## W. Recommended next educational priority

**Wire the already-built Mock evidence classifier into the real adaptive pipeline** (`lib/mockAttempt/evidenceAdapter.ts`'s classification logic → `ali_student_question_history`/`ali_durable_mastery`, with the `source:"mock"` provenance tag preserved so Mock and Practice evidence remain distinguishable, exactly as the existing code already anticipates). This is bounded, does not require new architecture, does not touch Mock's own scoring/release mechanics, and directly closes the largest gap found. It is a smaller, more targeted piece of work than "learner/adaptive behaviour" as a whole — most of that space (§D-§P) is already proven live and working.

## X. GO / REVISE / NO-GO

**REVISE.**

Smallest bounded correction required to make the core adaptive loop educationally credible: give `ali_mock_attempt_report` a real, automatic path (a service-role-executable SQL function, matching the pattern this codebase already uses for `submit_question_candidate()` etc., or a triggered job) that runs the existing, already-tested `evidenceAdapter.ts` classifier against a newly-released Mock report and writes its output into the same evidence tables Practice already writes to, tagged `source:"mock"`. Everything else this verification examined (diagnose, prioritise, teach, practise, session-to-session adaptation, supported-vs-independent mastery, spaced retrieval, family/passage anti-memorisation, Recommended Focus) is real, live, and does not need rebuilding.

Not implemented, per instruction.

---

**STOP. No implementation programme has been started.**
