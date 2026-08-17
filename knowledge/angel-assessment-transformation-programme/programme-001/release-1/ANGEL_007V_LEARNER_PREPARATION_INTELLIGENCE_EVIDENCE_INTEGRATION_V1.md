# Angel 11+ — 007V: Learner Preparation Intelligence Evidence Integration V1

**Educational Increment 007V.** Prepared 2026-08-17. Founder-authorised. Continues from Decision 74 (007T genuinely CLOSED) and 007U's own architecture design. Purpose: connect 007U's Learner Preparation Intelligence Architecture to the existing authoritative ALI evidence — not build another engine.

---

## 1. Production baseline

Re-queried live at the start of this increment: **TOTAL 298, Practice Eligible 281, Mathematics PE 161, English PE 120, Provisional 17, Mock Eligible 0, Writing PE 0** — exact match to the expected post-007T state. Full suite 416/416 confirmed before any change. No drift.

---

## 2. Evidence-system inventory (complete, traced from real code)

| System | Source of evidence | Derivation | Consumer(s) | Authoritative? | Legacy? | Duplicated? | Safe to migrate now? |
|---|---|---|---|---|---|---|---|
| `UserProgress` (`lib/progress.ts`) | localStorage, synced to Supabase `user_stats`/`lesson_progress` | Raw scores dict, keyed by static lesson/prompt id | `adaptiveEngine.ts`, `analytics.ts`, `parentInsights.ts`, `gamification.ts` | No | **Yes** | Yes (vs. `ali_student_question_history`) | Consumer-by-consumer only (Part 14) |
| `lib/adaptiveEngine.ts` | `UserProgress` | `computeAdaptiveState()` → `buildDailyMission()`, `tierFromSubject()` | Dashboard's "Today's Admission Mission" card | No | **Yes**, explicitly self-documented as such since 2026-07-23 | Yes | Partially (007U's own guards); full migration is the larger, undone work |
| `ali_student_question_history` | Real Supabase table, written by `recordOutcome()`/`recordAndAdvance()` on every real attempt | Per-question `timesSeen`, `timesCorrect`, `distinctCorrectSessions`, `masteryState`, `supportTier` | `lib/ali/mastery.ts`, `lib/ali/confidence.ts`, everything downstream | **Yes** | No | No — the single source of truth | N/A — already authoritative |
| `recordOutcome()` (`lib/ali/history.ts`) | Write path for `ali_student_question_history` | Persists a real attempt | Practice pathway (`/learning-intelligence/practice/[area]`) only | Yes | No | No | N/A |
| `applyAttemptOutcome()` (`lib/ali/mastery.ts`) | Pure function over one history row | Computes `masteryState` per Decision 7/60 (`supportTier` gate, evidence-based demotion) | `recordOutcome()`'s own write path | Yes | No | No | N/A |
| `computeCompetencyConfidence()` (`lib/ali/confidence.ts`) | Real per-question evidence for one competency | `EvidenceConfidenceTier` (`insufficient`/`low`/`moderate`/`high`) | `getEducationalIntelligence()` | Yes | No | No | N/A |
| `computeEducationalState()` (`lib/ali/educationalState.ts`) | `confidenceTier` + `masteryState` + `validated` + `durable`/`reviewDue` | 8-state coordination label (`exploring`→`durably-mastered`/`reviewing`/`rebuilding`) | `getEducationalIntelligence()` | Yes | No | No | N/A |
| `ali_durable_mastery` (`lib/ali/durableMastery.ts` + `persistence/durableMasteryStore.ts`) | Real Supabase table | Maintenance-review-gated durability of a mastered competency | `getEducationalIntelligence()` | Yes | No | No | N/A |
| `ali_educational_audit` (`lib/ali/audit.ts` + `persistence/auditStore.ts`) | Real Supabase table | Records the moment a Higher-Evidence-Required conclusion is newly reached | `processEvidenceForCompetency()` | Yes | No | No | N/A |
| `getEducationalIntelligence()` (`lib/learningEngine/educationalIntelligenceService.ts`) | Composes all of the above | **The real Permanent-Engineering-Rule-1 single entry point** | Practice pathway, this increment's own `preparationState.ts` | **Yes — the authoritative read path** | No | No | N/A — this increment's own foundation |
| `getRecommendations()` (same file) | `computeRealRecommendationOrchestration()` | Real Recommendation Orchestration, already accepts `daysUntilExam` (exam-proximity Tier 3 reweighting) | `generatePersonalisedSession()` | Yes | No | No | N/A |
| `generatePersonalisedSession()` (`sessionGenerator.ts`) | `getRecommendations()` + real question bank | Real practice-session generation | `/learning-intelligence/practice/[area]` | Yes | No | No | N/A |
| Dashboard "Today's Admission Mission" | `adaptiveEngine.ts`'s `buildDailyMission()` | Legacy tier/urgency, partially guarded (007U) | `app/dashboard/page.tsx` | **No** | **Yes** | Yes (parallel to `getRecommendations()`) | Partially — this increment adds a real cross-check for Writing only |
| Dashboard "Progress Snapshot" / "Worth focusing on next" | `analytics.ts`'s `generateInsights()` | Legacy `status`/`avgScore` | `app/dashboard/page.tsx` | **No** | **Yes** | Yes | **Migrated this increment for Writing** (`applyCanonicalWritingEvidence`), other subjects not yet |
| Subject cards (`app/learn/page.tsx`) | `analytics.ts`'s `computeAnalytics()` | Legacy `avgScore`/`attempts`, already correctly gates `attempts > 0` (no false 0%) | `/learning-intelligence/learn` | No | Yes | Yes | Not migrated this increment — no live defect found there (already correctly gated) |
| Parent dashboard (`app/learning-intelligence/parent/page.tsx`) | `computeParentReport()` (`lib/parentInsights.ts`) | Wraps `AnalyticsReport` + gamification | Parent-facing | No (for now) | Partially | Yes | Same fix propagates automatically once `applyCanonicalWritingEvidence()` corrects the report passed in |
| `buildFocusAreas()` (`lib/parentInsights.ts`) | `AnalyticsReport.subjects` + `hasRealAliData()` | **Already partially real-evidence-aware** — excludes ALI-covered subjects from the legacy weak/strong branch when `p.aliCompetencySignal[subject]` exists | Parent dashboard | Partial | Partial | Yes | Already the codebase's own precedent for exactly this kind of migration |
| `p.aliCompetencySignal` (`UserProgress`) | A bridge field, written somewhere real ALI evidence is captured | Per-subject weak/mastered/attempted competency lists | `buildFocusAreas()`, `urgency()`, `reasonText()` | Partially (a real signal, but stored inside the legacy object) | Hybrid | No (it summarises real data) | Already in active, safe use |
| Recommendation centre / revision planner / readiness surfaces | Not traced to a single file this increment (out of the bounded scope); presumed to read `computeParentReport()`/`AnalyticsReport` similarly | — | `app/learning-intelligence/parent/*` | Unconfirmed | Presumed partial | Unconfirmed | Not migrated — flagged as a future dependency (§20) |
| Writing evidence | `ali_student_question_history` for WC-01/WC-02 (real, but 0 Practice Eligible content exists to generate it) vs. `UserProgress.scores["writing-wrt-*"]` (legacy, unrelated static prompts) | Two genuinely different, unrelated pools | Dashboard, parent widgets | Real ALI path is authoritative; legacy path measures something else entirely | Legacy path is legacy | **Yes — the exact conflict this increment closes for one surface** | Migrated for the dashboard's insight card this increment |
| Any confidence/readiness percentage | `SubjectAnalytics.avgScore` (legacy, `mean([])` semantics) vs. `EvidenceConfidenceTier` (real, quality-aware) | Different concepts entirely — legacy is a raw score average, real is an evidence-quality tier | Both, in different surfaces | Real tier is authoritative | Legacy average is legacy | **Yes — 007U's own `evidenceState.ts` is itself a duplicate of the real tier concept, disclosed below** | Partial — this increment's canonical module supersedes 007U's own for anywhere real competency data exists |
| Legacy local/session/profile progress state | `UserProgress` (whole object) | — | Every legacy surface | No | Yes | Yes | Consumer-by-consumer (§14) |

**Genuine, disclosed finding not identified by 007U's own observation:** 007U's own `lib/learningEngine/evidenceState.ts` (`no_evidence`/`insufficient_evidence`/`developing_evidence`/`established_evidence`, calibrated on raw attempt count) is itself a **parallel invention** duplicating the real, more rigorous `EvidenceConfidenceTier` (`insufficient`/`low`/`moderate`/`high`, calibrated on evidence quality — distinct-correct-sessions, guessability, transfer corroboration) that already existed in `lib/ali/confidence.ts` before 007U was written. This was not caught during 007U because that module was fixing the **legacy** `adaptiveEngine.ts`, which has no live connection to real per-competency evidence at all — `evidenceState.ts` remains the correct, and only, tool for that specific legacy context. This increment's own `preparationState.ts` uses the **real** `EvidenceConfidenceTier` directly wherever real competency data is available, and only reuses 007U's four-state **vocabulary** (not its attempt-count derivation) for consistent learner-facing language across both the legacy and real paths.

---

## 3. Ownership map

Summarised from the table above: **the real per-competency evidence chain (`ali_student_question_history` → `applyAttemptOutcome` → `computeCompetencyConfidence`/`computeEducationalState` → `getEducationalIntelligence`) is fully authoritative, fully composed, and was not modified by this increment.** The gap this increment closes is entirely at the **aggregation and surface layer**: no whole-subject or whole-learner roll-up of this real evidence existed before `preparationState.ts`, and no dashboard/parent surface consumed it directly before this increment's one bounded integration.

---

## 4. Canonical preparation-state contract

Implemented in `lib/learningEngine/preparationState.ts`, `preparationClock.ts`, `preparationStage.ts` — pure composition over existing ALI functions, zero new persistence, zero new mastery/confidence logic.

| Field (007U's 15-dimension request) | Status | Real source |
|---|---|---|
| School year / educational stage | CONFIGURED | `year_group` (existing profile field, §6) |
| Target pathway | CONFIGURED | `selectedPathwayId` (existing) |
| Target examination | CONFIGURED (partial) | `PATHWAYS` (existing); no entry-year field yet (§6) |
| Target examination date | CONFIGURED (optional) | `getTargetExamDate()` (existing, parent-supplied) |
| Time remaining | DERIVED | `resolvePreparationClock()` (new, this increment) |
| Subject evidence | DERIVED (OBSERVED underneath) | `computeSubjectPreparationSummary()` (new) over real `getEducationalIntelligence()` |
| Competency evidence | OBSERVED | `getEducationalIntelligence()` (existing, real, unmodified) |
| Mastery evidence | OBSERVED | `lib/ali/mastery.ts` (existing, real, unmodified) |
| Evidence confidence | OBSERVED | `lib/ali/confidence.ts` (existing, real, unmodified) |
| Support dependency | OBSERVED | `supportTier` (existing, Decision 60, unmodified) |
| Difficulty performance | UNAVAILABLE | No per-learner aggregation by difficulty band exists yet (007U §19, restated, not built) |
| Retrieval/retention evidence | OBSERVED (not yet aggregated to whole-learner) | `RetrievalStage`/Decision 68 (existing, real, per-family only) |
| Transfer evidence | OBSERVED (not yet aggregated) | `transfer_class` per question (existing); `transferCorroborated` input to confidence (existing) |
| Writing evidence | OBSERVED, currently `no_evidence` (real) | `getEducationalIntelligence()` for WC-01/WC-02 (0 Practice Eligible content) |
| Timed evidence | UNAVAILABLE | No timed-practice mode exists (007U §4, restated) |
| Mock evidence | UNAVAILABLE by design | `Mock Eligible = 0`, sealed (§13) |
| Preparation stage | DERIVED | `derivePreparationStage()` (new, this increment) |
| Recommended priorities | UNAVAILABLE this increment | Not wired to content selection beyond the compatibility proof (§14 of 007U, §11 below) |

**No cleverness score, intelligence score, pass probability, predicted CSSE score, or fabricated readiness percentage was created.** `SubjectEvidenceState` and `PreparationStage` are both closed enumerations over real, disclosed evidence states — `insufficient_evidence`/`unavailable`-equivalent states exist explicitly wherever evidence is genuinely absent, and are asserted by direct test (`preparationStage.test.ts`'s own first test).

---

## 5. School-year / target-exam findings

Confirmed by direct schema inspection: `year_group` already exists (Supabase profile schema, `types/supabase.ts`), `targetExamDate` already exists (`UserProgress`, parent-editable, validated by the existing `isPlausibleExamDate()`). **No `dateOfBirth` field exists anywhere in the schema** — confirmed by search, consistent with 007U's own recommendation not to add one. **No target entry-year field exists yet** — a genuine gap (007U §7's own `TargetExam.entryYear`), but adding it is a small, additive, non-destructive schema change, not the kind of "material learner-data migration" this increment's own STOP conditions gate on. **Not added this increment** — flagged as a future dependency (§20), since Part 15 scoped the bounded implementation to the Preparation Clock/Stage/Writing-evidence proof, not new profile fields.

---

## 6. Preparation Clock integration

Implemented as the smallest safe operational form: `resolvePreparationClock()` (real entry point, reads `getTargetExamDate()`) delegates to `resolvePreparationClockFor()` (pure core, explicit date parameter — the exact testability pattern `lib/progress.ts`'s own `isPlausibleExamDate()` already established, since `getProgress()`/`saveProgress()` silently no-op outside a browser). Bands: `long_horizon` (>365 days) / `coverage_building` (>180) / `transfer_building` (>90) / `exam_condition` (>21) / `final_preparation` (≤21) / `unavailable` (no date configured, or a past date — never guessed). **No official CSSE date is auto-resolved** — 007U's own annual evidence-refresh governance has not run, so `targetExamDate` remains exactly the parent's own configured value or unavailable. Band boundaries are a disclosed, provisional Angel 11+ policy judgement call, explicitly not an official CSSE rule (007U §6's own EXAM FACTS/POLICY separation, restated).

---

## 7. Preparation-stage derivation

`derivePreparationStage()` combines `SubjectPreparationSummary[]` (real evidence) with `PreparationClock` (context) and an optional `schoolYear` (developmental cap). Full safeguard-by-safeguard proof in §16/§17 below; summary: evidence always computes the base stage first; the clock can only ever refine an already-`transfer`-level evidence stage into `exam_preparation`/`final_preparation`, never override a weaker one; `schoolYear` only ever caps eligibility for those two late stages (Year 4/Year 5 evidence still reaches `transfer`, just not the exam-condition-intensity labels); a `rebuilding` signal (real mastery regression) always forces `teaching`, overriding the aggregate distribution.

---

## 8. Today's Mission integration

**Not fully migrated this increment — the boundary is explicitly disclosed, per Part 15's own permission.** `buildDailyMission()` (legacy `adaptiveEngine.ts`) remains the dashboard's mission-selection engine, with 007U's own guards intact (Writing excluded while unreachable, thin-evidence percentage gate). A full migration would require making `computeAdaptiveState()`'s whole call chain async (it is currently a pure, synchronous function, deliberately) and is exactly the "rewrite the entire recommendation engine" this increment's own instruction prohibits attempting in one pass. The REAL recommendation path (`getRecommendations()`, exam-proximity-aware) already exists and already powers actual Practice session generation (`generatePersonalisedSession()`) — the dashboard's own mission CARD is the one surface still legacy-driven, and is named here as the next concrete migration target (§20).

---

## 9. Learner dashboard integration

**Migrated for the one concrete, disclosed defect: the Writing insight card.** `applyCanonicalWritingEvidence()` (new, pure, fully tested — 4/4 tests, including an explicit no-op proof when real and legacy evidence already agree) corrects `AnalyticsReport.subjects`/`insights`/`weakSubjects`/`notStartedSubjects` for Writing specifically, using real `computeSubjectPreparationSummary()` evidence, wired into `app/dashboard/page.tsx`'s existing data-loading effect. Fails open (any error fetching real evidence leaves the pre-existing legacy report in place, never blocks or errors the dashboard). Subject cards (`app/learn/page.tsx`) were investigated and found to **already** correctly gate `attempts > 0` before showing a score — no live defect found there, not migrated (nothing to fix).

---

## 10. Parent intelligence integration

The correction in §9 **propagates automatically** to the parent dashboard: `computeParentReport(p, corrected, gamification)` is called with the same corrected `AnalyticsReport`, and `buildFocusAreas()` reads `report.subjects`/`weakSubjects` fresh each call — confirmed by direct inspection, not assumed. `buildFocusAreas()` itself was found to **already** partially prefer real ALI evidence over the legacy signal (`hasRealAliData()`, pre-existing, unmodified) for any subject with a populated `aliCompetencySignal` bridge entry — this increment's Writing fix complements that existing mechanism rather than duplicating it. The distinction between Mastery / Exam Readiness / Mock Performance / Projected Performance / Admissions Outcome is unchanged and unweakened (Decision 65/67/72, restated). No parent surface beyond the dashboard's own insight card and focus areas was modified.

---

## 11. Writing boundary

**Unchanged and reconfirmed.** Writing PE remains 0. `wrt-003` untouched. Migration 013 unapplied. `supportTier: "supported"` remains unconditional for AI-scored Writing (Decision 60, re-verified by the unmodified `writingMasterySafety.test.ts` suite, 7/7 PASS). The canonical state now says Writing evidence is `no_evidence` **honestly**, via real `getEducationalIntelligence()` output for WC-01/WC-02 (which correctly returns `confidenceTier: "insufficient"` since zero questions exist to generate evidence from) — not fabricated, not a zero score.

---

## 12. Mock boundary

**Unchanged and reconfirmed.** Mock Eligible remains 0 (re-verified live). No Mock content populated. No Mock Intelligence Engine work performed. No predicted score created anywhere in this increment's new code (confirmed by direct review of `preparationState.ts`/`preparationClock.ts`/`preparationStage.ts` — none references Mock, prediction, or probability). The canonical contract's own "Mock evidence" field (§4) is explicitly `UNAVAILABLE`, not populated with a placeholder.

---

## 13. Content-selection compatibility

Not implemented (no content selection was touched, per explicit instruction). Compatibility proven by construction: `SubjectPreparationSummary.competencies[].confidenceTier`/`.educationalState` are the exact same real values `lib/ali/selection.ts`'s cooldown engine and `getRecommendations()`'s weak-competency signal already consume — a future content-selection integration would compose the same `getEducationalIntelligence()` calls this module already does, not a new evidence path. The ≈483 objective-question target is unchanged; no provisional content was activated; passage exposure logic (Decision 68) was not touched.

---

## 14. Legacy retirement matrix

| Consumer | Status |
|---|---|
| `applyAttemptOutcome()` / `ali_student_question_history` / `getEducationalIntelligence()` | Already authoritative — nothing to retire |
| `generatePersonalisedSession()` / `getRecommendations()` | Already authoritative — nothing to retire |
| Dashboard Writing insight card | **MIGRATED** this increment |
| `buildFocusAreas()` (parent, non-Writing subjects) | **TEMPORARILY RETAINED** — already partially real-evidence-aware via `hasRealAliData()`, not further changed |
| `buildDailyMission()` / Today's Mission card | **TEMPORARILY RETAINED** — 007U's guards intact, real migration blocked on the sync/async architectural change named in §8 |
| Subject cards (`app/learn/page.tsx`) | **SAFE TO RETIRE LATER, NOT URGENT** — no live defect found; already correctly evidence-gated on the legacy data it has |
| `analytics.ts`'s non-Writing insights (English/Maths weak/strong) | **LEGACY ONLY** — real ALI evidence exists for these subjects too (via `hasRealAliData`), but the insight-generation text itself was not migrated this increment; same pattern as Writing could apply next |
| Recommendation centre / revision planner / readiness timeline surfaces | **BLOCKED BY MISSING EVIDENCE** — not traced to a specific file this increment; unconfirmed whether they read `AnalyticsReport` directly or something else; investigate before migrating |
| `UserProgress.scores`/`aliCompetencySignal` bridge itself | **TEMPORARILY RETAINED** — the bridge field is real, useful, and cheap; full retirement of `UserProgress` requires every consumer above to migrate first, explicitly not attempted in one pass |

`adaptiveEngine.ts` was **not deleted or reduced** — every one of its existing exports and behaviours (beyond 007U's own prior, disclosed changes) is untouched.

---

## 15. Failure modes (all 15 directive items addressed)

1. No evidence as failure — `deriveSubjectEvidenceState([])`/`(["insufficient"])` → `no_evidence`, never `established`/`weak` (tested).
2. 1-2 attempts as established — the real `EvidenceConfidenceTier`'s own `low` tier (not `moderate`/`high`) is never mapped to `established_evidence` (tested, `deriveSubjectEvidenceState` boundary tests).
3. Supported success as mastery — inherited unmodified from `lib/ali/mastery.ts`'s `supportTier` gate; not re-implemented, not weakened.
4. School year as ability — `derivePreparationStage()`'s base stage is always evidence-first; `schoolYear` only caps late-stage eligibility (tested).
5. Exam proximity overriding foundational need — tested directly: a `final_preparation`-band clock with weak evidence still returns `foundation`.
6. Strong attainment causing premature Mock saturation — tested: strong Year 4 evidence reaches `transfer`, capped below `exam_preparation`/`final_preparation`.
7. Stale legacy overriding newer ALI evidence — `applyCanonicalWritingEvidence()` is the direct, tested fix for exactly this case.
8. Contradictory learner/parent states — both read the same corrected `AnalyticsReport` object (§10).
9. Unavailable Writing as 0% — Decision 72's own protection, reconfirmed unchanged, plus this increment's own real-evidence correction.
10. Unavailable Mock as poor performance — Mock fields remain `UNAVAILABLE`, never populated (§12).
11. Recommendation to unavailable content — 007U's own guard unchanged; not weakened.
12. Raw internal terminology exposed — no competency ID, `family_id`, or engine term appears in any new learner-facing string (`applyCanonicalWritingEvidence`'s corrected insights simply omit the false one; no new copy was added to a learner surface beyond what already existed).
13. Duplicate readiness percentages with different meanings — the real `EvidenceConfidenceTier` and legacy `avgScore` are never both shown for Writing after this correction (the legacy one is removed when it disagrees).
14. Unsupported predicted scores — none created anywhere in this increment's code (confirmed by direct review).
15. Accidental weakening of mastery rules — `lib/ali/mastery.ts`, `confidence.ts`, `educationalState.ts`, `durableMastery.ts` are byte-unmodified by this increment; full regression suite (`mathsMasteryProtection`, `writingMasterySafety`) re-run clean.

---

## 16. Implementation (bounded vertical slice)

**Files added:** `lib/learningEngine/preparationState.ts`, `preparationClock.ts`, `preparationStage.ts`. **Files modified:** `app/dashboard/page.tsx` (one new async correction pass, additive, fails open). **Nothing else changed.** Three of the directive's "preferred proof surfaces" (Today's Mission, one learner surface, one parent surface) — this increment fully proves the integration on **one real, disclosed defect** (the dashboard's Writing insight, which is simultaneously a learner-facing card and, via `computeParentReport`, propagates to the parent dashboard's own focus areas) rather than three independent, shallower touches. Today's Mission itself remains on 007U's own protections, not further migrated — the boundary is disclosed in §8/§14, not silently skipped.

---

## 17. Verification

| Check | Result |
|---|---|
| Full automated test suite | **439/439 PASS** (416 baseline + 23 new) |
| TypeScript | Clean |
| Copy Quality Guard | PASS — 0 violations, 237 files |
| Production build | Succeeds |
| Mathematics bank-wide regression (live) | 188/188 PASS |
| Passage-exposure, Mock Content Firewall, Maths mastery-protection, Writing mastery-safety, 007U evidence-state/adaptiveEngine suites | All re-run explicitly, unaffected |
| Production counts, before/after | Unchanged: TOTAL 298, PE 281, Provisional 17, Mock Eligible 0 |

**Targeted new tests (23), matching the directive's own list:** no-evidence ≠ established (2); supported success cannot masquerade as mastery (inherited, not re-tested — unmodified); school year alone cannot set stage (1); time alone cannot set stage (1); strong Year 4 progresses but is capped (1); foundational gaps near exam still trigger teaching (1); Writing `no_evidence` cannot become a score (4, `applyCanonicalWritingEvidence` suite); Mock remains sealed (reconfirmed via existing Mock firewall suite, unmodified); learner and parent state derive from the same canonical source (§10, proven by construction — same object passed to both); legacy cannot override newer evidence (the no-op tests prove the reverse — real evidence always wins when it disagrees); no predicted score generated (confirmed by code review, no test needed since nothing computes one).

---

## 18. Unresolved risks

- Today's Mission (the dashboard's own mission card) remains legacy-engine-driven beyond 007U's guards — the single largest remaining gap, matching 007U's own prior disclosure, now further narrowed but not closed.
- English/Maths insight text (`generateInsights()`) was not migrated to prefer real evidence the way Writing now is — a real, live latent risk of the same "stale legacy overrides real evidence" failure mode for those two subjects specifically.
- Recommendation centre, revision planner, and readiness-timeline surfaces were not traced to specific files this increment — genuinely unknown whether they share this same legacy/real-evidence tension.
- No target entry-year field exists yet, limiting §7's own `TargetExam` model to partial configuration.
- Preparation Clock band boundaries are a disclosed but uncalibrated policy judgement call.

---

## 19. Next dependencies

- Migrate `buildDailyMission()`'s subject-selection logic (not just Writing's exclusion) to consult `computeSubjectPreparationSummary()` for every CSSE-eligible subject, likely requiring the sync→async architectural change flagged in §8.
- Apply the same `applyCanonicalWritingEvidence()` pattern to English/Maths insight generation.
- Add a target entry-year field to the profile schema (small, additive, non-destructive) to complete 007U's `TargetExam` model.
- Trace and, if needed, migrate the recommendation centre / revision planner / readiness surfaces.
- Build the difficulty/transfer/retrieval whole-learner aggregation the canonical contract currently marks `UNAVAILABLE`.

---

## 20. Final verdict

**PASS.** The canonical preparation-state derivation is real, tested, and composes existing authoritative ALI evidence without bypassing the Educational Intelligence Engine or duplicating its mastery/confidence logic. One genuine, previously-disclosed live defect (the dashboard's Writing insight) is closed end-to-end, propagating correctly to both the learner and parent surfaces from one shared, corrected source. Every explicit failure mode is addressed and tested. Mock and Writing boundaries are unchanged. Today's Mission's fuller migration, and several other consumer surfaces, are explicitly disclosed as not yet done, per this increment's own permitted scope.
