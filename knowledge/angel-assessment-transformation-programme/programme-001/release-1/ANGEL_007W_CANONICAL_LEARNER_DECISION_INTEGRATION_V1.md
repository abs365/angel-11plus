# Angel 11+ — 007W: Canonical Learner Decision Integration V1

**Educational Increment 007W.** Prepared 2026-08-17. Founder-authorised. Continues from Decision 75 (007V evidence integration). Purpose: migrate the operational CSSE learner recommendation surfaces — Today's Mission, Mathematics insight, English insight — away from legacy-only evidence wherever real ALI evidence exists, and trace whether the remaining recommendation/readiness surfaces need the same treatment. There must remain one educational truth: no new recommendation engine, no duplicated mastery logic, no re-derived ALI evidence, no weakened Decision Boundaries.

---

## 1. Production baseline

Re-confirmed at the start of this increment, unchanged from 007V's closing state: **TOTAL 298, Practice Eligible 281, Mathematics PE 161, English PE 120, Provisional 17, Mock Eligible 0, Writing PE 0.** Full suite 439/439 (007V's closing count) before any 007W change. No drift.

---

## 2. Today's Mission — end-to-end trace

`app/dashboard/page.tsx`'s CSSE-only `useEffect` block calls `computeAdaptiveState(progress, report)` (`lib/adaptiveEngine.ts`), which builds `dailyMission` via `buildDailyMission()`:

- **Input data:** `UserProgress` (legacy, localStorage/`user_stats`), `AnalyticsReport` (`computeAnalytics()`, legacy), and — critically — `p.aliCompetencySignal?.[subject]` (`AliCompetencySignal`, a genuinely real-evidence-shaped bridge field already defined in `types/ali/missionSignal.ts`).
- **Call sites:** `urgency(subjectAnalytics, aliSignal)` and `buildItem(...)` both already branch on whether `aliSignal` is present and non-empty. The real-evidence branch (`if (aliSignal && aliSignal.attemptedCompetencies.length > 0)`) was already written and already takes priority over the legacy branch — this is not new code.
- **Sync assumption:** `buildDailyMission()` itself is synchronous by design (dashboard render must not block on a Supabase round-trip) — this is correct and was preserved, not "fixed."
- **Persistence assumption:** the mission reads `p.aliCompetencySignal`, which is written by `recordAliCompetencySignal(subject, signal)` — a synchronous, localStorage-backed write.
- **Root cause found (the actual defect):** `recordAliCompetencySignal()` was, before this increment, called from exactly one place in the whole codebase: `app/mocks/adaptive/{english,gl,maths,vocabulary}/page.tsx` — the separate, legacy GL/CEM-era adaptive-mock pages. `grep` across `app/learning-intelligence/` (the real CSSE Practice pathway) confirmed zero references. **The real-evidence branch of `urgency()`/`buildItem()` was already correct; it simply never received real data for a genuine CSSE learner.**
- **The smallest correct architectural change:** not an async rewrite of `buildDailyMission()`, but a new, small, pure adapter (`toAliCompetencySignal()`) that turns 007V's already-canonical `SubjectPreparationSummary` into the exact `AliCompetencySignal` shape the existing bridge already expects, called from the dashboard's existing async CSSE block (the same block 007V already added for Writing), writing via the existing `recordAliCompetencySignal()`, then recomputing the mission synchronously from the refreshed `UserProgress`. No new async boundary was introduced beyond the one 007V already established.
- **Fallback behaviour:** unchanged — the whole async block is wrapped in `.catch(() => {})`, so an unreachable Supabase leaves the legacy-derived mission exactly as it was (fail-open to the pre-existing, non-broken behaviour, never to a worse state).
- **Learner-facing explanation:** `aliReasonText()` (pre-existing, unmodified) already produces evidence-based, non-technical text — e.g. `"MR-01 needs reinforcement in Mathematics. Focused practice here will lift the whole subject fastest."` — used automatically once `weakCompetencies` is non-empty.

---

## 3. Canonical Mission Contract

Today's Mission selection is contracted as follows, unchanged in structure by this increment but now genuinely evidence-backed for Mathematics and English in addition to Writing:

1. Mock (`mock-test`) is never a candidate (`urgency()` returns `-1` unconditionally; `nonMock` filter also excludes it structurally).
2. A subject with real ALI evidence (`aliSignal.attemptedCompetencies.length > 0`) is prioritised via the real branch: a genuine regression (`rebuilding`, i.e. `weakCompetencies`) scores 140+; otherwise a real mastery ratio drives the score.
3. A subject with no real ALI evidence yet falls back to the legacy branch (status/avgScore-derived), which remains structurally unable to state a percentage for zero-evidence subjects (007U's fix, unchanged).
4. A subject with zero Practice Eligible content (Writing, currently) is excluded from candidacy entirely (007U's `CSSE_SUBJECTS_WITHOUT_REACHABLE_CONTENT`, unchanged).
5. Only Practice Eligible content is ever reachable from a selected mission item — enforced structurally by `generatePersonalisedSession()`/the Practice pathway, not by the mission builder itself.

---

## 4. Explainable mission selection

`aliReasonText()` already satisfies the directive's explainability requirement without modification: it names the real competency and the real evidence pattern ("needs reinforcement," "recent independent answers"), never engine terminology ("confidence tier," "educational state," "aliSignal"). Verified by `tests/lib/learningEngine/stagePrinciple.test.ts`'s banned-terms check (applied to the new stage-principle text) and by direct reading of `aliReasonText()`'s existing implementation (unchanged).

---

## 5. Preparation stage — proven operational value

Added `stagePrinciple(stage: PreparationStage): string` (`lib/learningEngine/preparationStage.ts`) — a pure, tested function giving each of the seven stages a distinct, non-engine-terminology learner-facing principle (foundation → worked examples first; teaching → re-teach the specific slipped skill; transfer → independent practice in less familiar styles; final_preparation → full independent practice, etc.). Wired into `app/dashboard/page.tsx`: when a real stage beyond `insufficient_evidence` is derivable from the three subject summaries already being fetched, it replaces the mission's `tagline`. This is deliberately **messaging-only** this increment — it does not change which activities are selected, keeping the change small and safe as scoped. `tests/lib/learningEngine/stagePrinciple.test.ts` (4 tests) proves every stage is distinct and free of internal terminology.

**Disclosed gap:** school year is not yet plumbed into the dashboard's async block (no existing accessor was found there), so `derivePreparationStage()` is called with `schoolYear: undefined`, which its own documented convention treats as eligible for the two late stages — the safe default, not a silent inaccuracy. Full school-year wiring is flagged as a follow-on, not performed this increment (no risky new profile-fetch was added to avoid expanding scope).

---

## 6. Year-group safeguards — the six named scenarios

All six Founder-named scenarios proven directly in `tests/lib/learningEngine/yearGroupSafeguards.test.ts` (7 tests, including one cross-check): Year 4/little evidence → insufficient_evidence; Year 4/strong evidence → transfer (progresses, but developmentally capped below exam-condition intensity); Year 5/foundational weakness → foundation regardless of exam clock; Year 5/strong independent mastery → transfer, capped identically to Year 4; Year 6/close exam/foundational weakness → foundation (exam proximity never overrides real need); Year 6/close exam/strong evidence → final_preparation. Year group is context, never ability — confirmed structurally: `derivePreparationStage()` always computes the evidence-derived base stage first, and school year only ever caps which of the two late stages are reachable.

---

## 7. Mathematics insight migration

`toAliCompetencySignal(mathsSummary, "maths", previousSignal)` is now computed from `computeSubjectPreparationSummary(supabase, profileId, "Mathematics")` (007V's real, unmodified composition over `getEducationalIntelligence()`) and written via the existing `recordAliCompetencySignal("maths", ...)` bridge every dashboard load. This closes Today's Mission's subject-selection and reason-text gap for Mathematics (§2-4). `tests/lib/adaptiveEngine.test.ts`'s new test ("a real ALI weak-competency signal for Maths outranks legacy-only urgency") proves the real branch is actually reached and actually wins.

**Scoping decision, disclosed:** this increment did *not* build a Mathematics-specific analogue of `applyCanonicalWritingEvidence()` (i.e. a function that overwrites `AnalyticsReport.subjects["maths"].avgScore`/`status` when real and legacy evidence disagree). Reasoning: (a) the mission bridge fix already delivers the operationally significant part of this migration — *which subject/skill gets selected and why*; (b) Writing's specific defect pattern (real evidence = no_evidence while legacy reports a false percentage) arises specifically because Writing has zero Practice Eligible content, so legacy scores measure an unrelated static-prompt pool — Mathematics has 161 Practice Eligible questions and real attempts, so the two evidence sources are much less likely to structurally disagree; (c) no concrete, live, disclosed defect analogous to Writing's was found for the Mathematics insight card this increment. If the Founder or a future increment finds a live instance of the insight card stating something a real learner's evidence contradicts, that is the trigger for building the generalised corrector — not speculative pre-emption now.

---

## 8. English insight migration

Identical treatment and identical scoping decision as §7, using `computeSubjectPreparationSummary(supabase, profileId, "English Comprehension")` and `toAliCompetencySignal(englishSummary, "english", previousSignal)`. English's existing protections — passage-exposure tracking, family exposure, remediation routing, teaching-review decisions, mastery protections — all live inside `getEducationalIntelligence()`/`generatePersonalisedSession()`, none of which this increment touched; only the aggregation/signal layer feeding Today's Mission was extended. No content authoring, no eligibility change.

---

## 9. Recommendation Centre, Revision Planner, and readiness surfaces — traced

Grepped and read the real implementation (not just imports) behind all five remaining surfaces the directive named:

| Surface | File | Real evidence source | Legacy dependency found |
|---|---|---|---|
| Recommendation Centre | `app/learning-intelligence/recommendations/page.tsx` | `fetchLearnerIntelligenceProfile()` (`lib/learningEngine/profile.ts`) | None |
| Revision Planner | `app/learning-intelligence/parent/revision-planner/page.tsx` | `generateRevisionPlan()` (`lib/learningEngine/revisionPlanner.ts`) | None (`getTargetExamDate()` import is a benign date read, not an evidence source) |
| Admissions Readiness | `app/learning-intelligence/parent/admissions-readiness/page.tsx` | `getRecommendations()` (`educationalIntelligenceService.ts`) | None |
| Mock Readiness | `app/learning-intelligence/parent/mock-readiness/page.tsx` | `assessMockReadiness()` (`lib/learningEngine/mockReadiness.ts`), itself built on `fetchLearnerIntelligenceProfile()`/`getRecommendations()` | None |
| Readiness Timeline | `app/learning-intelligence/parent/readiness-timeline/page.tsx` | `fetchEducationalMilestones()` (`lib/ali/persistence/auditStore.ts`, the real `ali_educational_audit` table) | None |

`profile.ts` itself composes exclusively from other real `lib/learningEngine/` modules (`rollup.ts`, `diagnostics.ts`, `readiness.ts`, `recommendations.ts`) and `evidence.ts` (`fetchAllQuestionTypeExposure`, a real Supabase read) — no reference to `lib/adaptiveEngine.ts`, `lib/analytics.ts`, or `lib/parentInsights.ts` anywhere in this chain. `readiness.ts`/`recommendations.ts` were also checked for the specific defects the directive named (placeholder percentages, `Math.random`-derived scores, predicted-score/pass-probability language) — none found in these five files; the one `Math.random` hit in `lib/learningEngine/` belongs to `adaptiveMockPaperBuilder.ts` (unrelated — Mock paper question shuffling, out of scope, not touched).

**Classification: ALREADY AUTHORITATIVE — no migration required, no defect found.** These five surfaces were, unlike Today's Mission and the dashboard insight cards, built natively on the real ALI architecture from the start. This is a genuinely favourable finding, not a gap this increment needed to close. Scope was not expanded merely because these surfaces existed to check — reading their real logic (not just imports) was the minimum needed to convert "presumed partial" (007V's own hedge, §35 of that document) into a confirmed classification.

---

## 10. EvidenceState ownership — final verdict

`lib/learningEngine/evidenceState.ts` (built 007U) remains **a legitimate presentation adapter for its actual, narrow context**: the legacy `adaptiveEngine.ts`/`analytics.ts` chain, which has no live connection to real per-competency evidence and therefore cannot use `EvidenceConfidenceTier` directly. It is not retired, and is not an architectural duplicate requiring cleanup, because retiring it would require rewriting the legacy engine itself — a materially larger, riskier change than this increment's own bounded scope, and not requested. The **canonical** module for anywhere real evidence is reachable is `preparationState.ts`, which uses `EvidenceConfidenceTier` directly and never re-derives it. This is the same verdict 007V reached (§40 of that document); 007W adds no new duplication and confirms no additional one was created by this increment's own new code (`toAliCompetencySignal`, `stagePrinciple` — both pure, both read-only over existing real types).

---

## 11. Legacy retirement matrix — updated

| Item | 007V status | 007W status |
|---|---|---|
| Dashboard Today's Mission — Writing subject exclusion | MIGRATED (007U) | Unchanged |
| Dashboard Today's Mission — Writing insight text | MIGRATED (007V) | Unchanged |
| Dashboard Today's Mission — Mathematics subject/skill selection + reason text | LEGACY ONLY | **MIGRATED (this increment)** |
| Dashboard Today's Mission — English subject/skill selection + reason text | LEGACY ONLY | **MIGRATED (this increment)** |
| Dashboard Today's Mission — tagline | LEGACY ONLY | **MIGRATED where a real stage is derivable (this increment); LEGACY ONLY otherwise (insufficient_evidence case, by design)** |
| Mathematics/English insight card avgScore/status text | LEGACY ONLY | **LEGACY ONLY (disclosed scoping decision, §7-8) — not a defect, no live instance found** |
| Recommendation Centre / Revision Planner / Admissions Readiness / Mock Readiness / Readiness Timeline | Presumed partial (unconfirmed) | **CONFIRMED ALREADY AUTHORITATIVE — no migration needed** |
| `evidenceState.ts` | Legitimate adapter, retained | Unchanged — same verdict, reconfirmed |
| `p.aliCompetencySignal` bridge (Writing key) | Active (007V) | Unchanged |
| `p.aliCompetencySignal` bridge (Maths/English keys) | Not populated by real CSSE evidence (root cause) | **Populated by real CSSE evidence (this increment's fix)** |
| Subject cards (`app/learn/page.tsx`) | Not migrated, no live defect found | Unchanged — out of this increment's priority order |
| Parent dashboard | Inherits corrected `AnalyticsReport` automatically | Unchanged mechanism; now also inherits the Maths/English signal via the same bridge |

---

## 12. Content-availability firewall

Reconfirmed structurally, not just by construction: Writing remains excluded from mission candidacy (`CSSE_SUBJECTS_WITHOUT_REACHABLE_CONTENT`, unchanged); Mock is structurally excluded from candidacy (`urgency()`'s unconditional `-1`, `nonMock` filter) and proven by a new explicit test (§16); no provisional content is ever reachable — the mission only ever links to a practice *area*, and `generatePersonalisedSession()` only ever selects `practice_eligible` content, unchanged by this increment.

---

## 13. Mock boundary

Not touched. Mock Eligible remains 0 in production. `mockReadiness.ts` (traced in §9) does not compute or expose a predicted score or pass probability — it reports evidence-based readiness signals only, consistent with the standing rule (Decision 65/67 lineage). No Mock-related code was modified this increment.

---

## 14. Content programme boundary

No new content authored. No eligibility changed. The ~483-question target (007S/007T lineage) is unaffected — this increment is entirely about how existing, already-eligible evidence is surfaced and explained, not about what content exists.

---

## 15. Product Experience boundary

Recorded, not implemented: the new stage-principle tagline is currently plain text sharing the mission card's existing styling; no new visual treatment, iconography, or layout was introduced. A future Product Experience increment could visually distinguish stage-specific messaging (e.g. a small progress-stage indicator), but that is explicitly out of this increment's scope.

---

## 16. Failure-mode tests (18 items, this increment)

Existing coverage carried forward (007U/007V, all still passing, re-run this increment): (1) no evidence ≠ 0% — `adaptiveEngine.test.ts`; (2) 1-2 attempts ≠ established — same; (3) supported success cannot establish mastery — inherited from `lib/ali/mastery.ts`'s own pre-existing tests, unmodified; (4) school year alone cannot determine ability — `yearGroupSafeguards.test.ts`; (5) exam proximity alone cannot override foundational need — same; (6) strong Year 4 learner can still advance — same; (7) weak Year 6 learner still receives teaching — same; (15) unavailable target exam date remains unavailable — `preparationClock.test.ts` (007V).

New this increment: (8) mission cannot recommend Writing while Writing PE = 0 — re-confirmed still passing (007U's own test, unchanged); (9) mission cannot recommend Mock — **new test**, `adaptiveEngine.test.ts`, proven even with a real weak-competency signal present; (10) mission cannot recommend provisional content — structural, confirmed by code reading (§12), not independently re-tested (no mission-level content-fetch exists to test against); (11) legacy evidence cannot override newer real ALI evidence — **new test**, proves the real branch wins over a legacy-weak English subject; (12) learner and parent interpretation remains consistent — structural, both read the same corrected `AnalyticsReport`/`UserProgress` objects, unchanged mechanism from 007V; (13) Mathematics insight uses authoritative evidence after migration — same new test as (11), Maths-specific; (14) English insight uses authoritative evidence after migration — covered by `toAliCompetencySignal.test.ts`'s English-key test plus the same mechanism as (13); (16) no predicted CSSE score is created — confirmed by code reading, no new score/probability field was added anywhere this increment; (17) preparation stage changes recommendations only where real content exists — the stage-principle wiring only ever replaces `tagline` text, never selects content, and is gated on the same evidence-derived stage used throughout; (18) existing passage-exposure/family-exposure/mastery protections remain intact — none of the modules implementing them (`generatePersonalisedSession()`, `getEducationalIntelligence()`, `lib/ali/*`) were modified this increment.

New test files: `tests/lib/learningEngine/toAliCompetencySignal.test.ts` (6), `tests/lib/learningEngine/yearGroupSafeguards.test.ts` (7), `tests/lib/learningEngine/stagePrinciple.test.ts` (4), plus 2 new tests appended to `tests/lib/adaptiveEngine.test.ts`. Total new: 19.

---

## 17. Verification

- TypeScript: clean (`npx tsc --noEmit`, zero errors).
- Full test suite: **458/458** (439 baseline + 19 new), zero failures.
- Copy Quality Guard: PASS, 0 violations across 237 files.
- Production build (`next build`): succeeds; all expected routes present, including the five §9 surfaces and the dashboard.
- Live verification (pre-deploy baseline): navigated to the live production dashboard (`https://angel-11plus.vercel.app/dashboard`) on an already-authenticated session; confirmed the current (pre-007W-deploy) state — "Building Foundations," no percentage claims, mission recommending English Comprehension and Maths Reasoning, no Writing, no Mock — establishing the exact baseline this increment's change will be verified against post-deploy. Full post-deploy live re-verification to be performed after commit/push, per the directive's "where practical, perform real learner live verification" instruction — recorded in Decision 76 once complete.

---

## 18. Remaining risks / recommended next increment

- School year is not yet plumbed into the dashboard's stage computation (§5's disclosed gap) — a low-risk, additive follow-on.
- Mathematics/English insight *card text* (avgScore/status) remains legacy-only by disclosed decision (§7-8), not a defect — worth revisiting only if a live discrepancy is ever found.
- Preparation stage currently affects messaging only, not content mix or difficulty selection — a legitimate, larger future increment if the Founder wants stage-aware content emphasis, not attempted here to keep this change small and safe.

**STOP. This report concludes 007W. No further increment is begun automatically.**
