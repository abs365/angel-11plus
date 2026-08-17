# Angel 11+ — 008A: CSSE Mock Experience and Exam Intelligence Programme — Evidence, Architecture, Mock Standard and Implementation Blueprint

**Programme Increment 008A.** Prepared 2026-08-17. Founder-authorised. Continues from Decision 82 (007X CLOSED). Purpose: evidence + architecture + product standard only. No Mock content authored. No Mock Eligible content activated. No implementation beyond a small, qualifying bounded correction if one is found (none was required this increment — see §30).

---

## 1. Starting production state (re-verified live, not assumed)

TOTAL 312, Practice Eligible 295, Mathematics PE 175, English PE 120, Provisional 17, **Mock Eligible 0**. Exact match to the directive's stated baseline. `main` = `origin/main` at `a0fabc8`, clean working tree.

---

## 2. Current Mock architecture discovered (traced by direct code reading, not inferred from prior reports)

Two parallel, non-overlapping systems exist today:

**(A) Legacy `MOCK_CONFIGS`** (`app/mocks/[pathway]/page.tsx:78-172`): GL, CEM, ISEB, and a `csse` entry explicitly marked `DEPRECATED LEGACY IMPLEMENTATION` (no longer linked from the Mock Centre or dashboard, still directly reachable at `/mocks/csse`). All four draw from static local files in `data/*.ts`, never from `ali_question_bank`. Visually near-identical to ordinary Practice quizzes, awards `xpReward` per pathway.

**(B) The real, current CSSE Mock** at `app/learning-intelligence/mock-exam/page.tsx`: one combined sitting covering English+Maths+Writing, Standard or Adaptive mode, drawing exclusively from `ali_question_bank` via `fetchMockEligibleQuestionBank()` (`eligibility_status = 'mock_eligible'`). With 0 such rows, it throws an honest "not enough content" error before any exam starts — **confirmed no silent fallback to Practice content and no crash**. A single countdown timer covers the whole sitting (no per-section timing). No feedback until final submit.

**Immediate-report behaviour, confirmed by direct code trace:** `submitExam()` computes everything synchronously — grades every answer, writes real evidence (`recordOutcome`, `processEvidenceForCompetency`), computes score, saves a `MockResult`, and renders the results screen in the same call. **There is no staged reporting lifecycle today.** Part 12's delayed-report requirement is a genuinely new capability, not an extension of existing state.

**Storage:** no dedicated Supabase table exists for Mock attempts. `MockResult`s live entirely in client-side `localStorage`, bridged through the legacy `UserProgress` object (`lib/mockProgress.ts`). Confirmed via `grep` of every migration for `create table.*mock`: zero matches. **Part 7's "immutable attempt capture" is a genuinely new requirement, not an upgrade of an existing table.**

**Two adaptive builders, confirmed intentionally distinct:** `lib/adaptiveMockBuilder.ts` (GL's legacy engine) and `lib/learningEngine/adaptiveMockPaperBuilder.ts` (the real CSSE mock's paper selector, pure, evidence-driven, explicitly documented as deliberately not sharing code with the GL engine).

**`lib/learningEngine/mockReadiness.ts`:** pure categorical dispatch, zero arithmetic, three verdicts (`practice-first` / `first-mock-valuable` / `mock-valuable`) derived entirely from real inputs (`hasAnyEvidence`, `mockAttemptCount`, the real Recommendation Engine's trigger reason). No predicted score, no percentile — confirmed clean.

**Gamification inside Mock:** the real CSSE mock is already fairly restrained (no confetti/streak animation, a standing amber disclaimer that it's still being expanded), but still calls `completeLesson()` (XP bridge) and shows recommendation/readiness summaries immediately — it currently *feels* like Practice-with-a-timer, not a distinctly serious exam experience. The legacy GL/CEM/ISEB flow is visually near-identical to ordinary Practice.

**Exam Intelligence / Preparation Clock wiring into Mock: none found.** `mock-exam/page.tsx` never imports `resolvePreparationClock`, `getTargetExamDate`, or `year_group` — it is entirely evidence/competency-driven with no time-to-exam awareness. This integration exists for the general dashboard (Decisions 75-77) but is wholly unbuilt for Mock specifically.

## 3. Legacy Mock components discovered

`app/mocks/adaptive/{english,gl,maths,vocabulary}/page.tsx` — the GL/CEM-era adaptive-mock pages, already known from prior increments (007W) as the only call sites of `recordAliCompetencySignal`. Unrelated to the real CSSE mock; out of this programme's scope except as a boundary to preserve (do not touch).

## 4. CRITICAL FINDING: no database-level sealed-content enforcement exists

`fetchMockEligibleQuestionBank()` is a plain client-side Supabase call. RLS on `ali_question_bank` (migration `020_evidence_tables_authenticated_ownership.sql`): `create policy ali_question_bank_select_all on public.ali_question_bank for select to anon, authenticated using (true);` — **fully open SELECT, granted to `anon`, with no filtering by role or `eligibility_status`.** The application-level `.eq("eligibility_status", "mock_eligible")` filter only controls what the UI *chooses* to display; it is not an access-control boundary. The moment any row becomes `mock_eligible`, its full question/answer/`workingSteps` become fetchable by anyone holding the public anon key (embedded in every client bundle) via a direct REST call, bypassing the app UI entirely.

**This is not a live defect today** — Mock Eligible is 0, so nothing is currently exposed, and per the directive's own Part 26 bounded-implementation rule this does not qualify for a same-increment fix (nothing is unsafe *right now*; the correction would also not be "small," since a real RLS/gating redesign for an authenticated-only, server-mediated Mock content path is a substantive piece of work in its own right). **It is recorded here as the single most important pre-activation gate**: no row may ever be set `mock_eligible` until this gap is closed, most likely via a server-side route (never client-direct Supabase reads for sealed content) or a genuinely restrictive RLS policy scoped to an active, authenticated exam-session context. This is the headline architectural correction 008C (Mock assessment engine + sealed-content firewall) must resolve before any content work begins.

---

## 5. Official CSSE evidence refresh

Retrieved 2026-08-17 directly from `csse.org.uk` (the official Consortium of Selective Schools in Essex site) and via `WebSearch`, not from tuition-centre marketing pages, per the directive's own instruction. Findings are separated strictly by category:

| Finding | Category | Source | Retrieved |
|---|---|---|---|
| Two papers: English (60 min + 10 min additional reading time) and Mathematics (60 min) | OFFICIAL EXAM FACT | csse.org.uk (homepage) | 2026-08-17 |
| "With effect from September 2024 (2025 Entry) the English paper does not contain Applied Reasoning questions." | OFFICIAL EXAM FACT | csse.org.uk (homepage, verbatim quote) | 2026-08-17 |
| Continuous Writing: two contrasting tasks, official sample mark scheme published (`ECW-Sample-Mark-Scheme.pdf`), 4-band scale (Band 1-4) | OFFICIAL EXAM FACT (structure confirmed; exact mark/weighting figures below are search-synthesised, not independently line-verified against the PDF in this session — see limitation) | csse.org.uk/wp-content/uploads/2020/05/ECW-Sample-Mark-Scheme.pdf | 2026-08-17 |
| Continuous Writing worth 15 marks / 25% of the English paper, ~10 minutes per task | OFFICIAL EXAM FACT, but **confidence: MEDIUM** — this specific figure came from a search-engine synthesis of the official PDF's content, not a page-by-page fetch I personally verified in this session (PDF rendering was unavailable in this environment: `pdftoppm`/poppler-utils not installed). Treat as provisional until independently re-confirmed by a direct read of the PDF. | (as above) | 2026-08-17 |
| 2027 Entry exam date: Saturday 19 September 2026; registration now closed for this cycle | OFFICIAL POLICY / PROCESS | csse.org.uk (homepage) | 2026-08-17 |
| 2026 Entry results were emailed 13 October 2025 | OFFICIAL POLICY / PROCESS | csse.org.uk (homepage) | 2026-08-17 |
| "CSSE GUIDE FOR 2027 ENTRY" (Information Guide), dated 27/03/2026, downloadable | OFFICIAL POLICY / PROCESS (document exists and is dated; content not independently parsed this session, PDF-rendering limitation as above) | csse.org.uk/examination/ | 2026-08-17 |
| No standardisation/scoring methodology is published anywhere found on the official site | UNKNOWN / REQUIRES FURTHER EVIDENCE | csse.org.uk | 2026-08-17 |
| Whether Verbal/Non-Verbal Reasoning is tested at all | UNKNOWN — not mentioned on the official homepage; the removal of "Applied Reasoning" from the English paper (2025 Entry) is the only reasoning-related fact confirmed | csse.org.uk | 2026-08-17 |

**Evidence limitation, disclosed:** this session's PDF-rendering tool (`pdftoppm`/poppler-utils) is not installed in this environment, so the two most detailed official documents (the ECW mark scheme and the 2027 Entry Information Guide) could not be read directly line-by-line — only their existence, official hosting, and dates were confirmed, plus a search-engine's own synthesis of their likely content for the mark-scheme figures. **This is disclosed, not glossed over.** A follow-on increment (or a session with PDF-rendering available) should re-verify the exact marks/weighting/timing breakdown by reading these two PDFs directly before any Mock scoring model is finalised.

### 5.1 Conflict check against frozen assumptions

**No conflict found.** The codebase's existing evidence base (`docs/intelligence/CSSE_QUESTION_INTELLIGENCE_FRAMEWORK.md` and related documents from prior increments) already assumes Applied Reasoning is not part of the current English paper — this refresh **confirms** that assumption is current, not stale, with an official, dated, verbatim citation now attached. The two-paper (English + Mathematics) structure, English's 60+10 minute timing, and Mathematics' 60-minute timing all match the codebase's existing assumptions exactly. **No STOP condition triggered.**

---

## 6. Exam Intelligence model (design)

A canonical `ExamIntelligenceProfile` record, extending — never duplicating — the existing `preparationState.ts`/`preparationClock.ts`/`preparationStage.ts` architecture (Decisions 75-77):

```ts
interface ExamIntelligenceProfile {
  pathway: "csse"; // extensible, but only csse has real evidence today
  examiningAuthority: string; // "Consortium of Selective Schools in Essex (CSSE)"
  targetEntryYear: number | null; // e.g. 2027, CONFIGURED (parent-supplied)
  targetExaminationDate: string | null; // ISO date, CONFIGURED (parent-supplied) or DERIVED once an official date is confirmed for the child's cycle
  registrationPeriod: { opens: string; closes: string } | null; // CONFIGURED/DERIVED, official-evidence-backed only
  components: ExamComponent[]; // see below
  evidenceSource: string; // e.g. "csse.org.uk, retrieved 2026-08-17"
  evidenceRetrievedAt: string; // ISO date
  evidenceConfidence: "current" | "stale" | "superseded" | "unverified";
  lastVerifiedAt: string;
  importantChange: { summary: string; effectiveFrom: string; sourceUrl: string } | null;
  parentAcknowledged: boolean; // where an important change requires acknowledgement
}

interface ExamComponent {
  name: "English" | "Mathematics"; // official components only, no invented ones
  timingMinutes: number;
  additionalTimingMinutes?: number; // e.g. English's 10-minute reading allowance
  weighting: number | null; // null where evidence does not confirm a published weighting
  subComponents?: { name: string; note: string }[]; // e.g. Continuous Writing within English, marked with its own confidence flag
}
```

**Design decisions:** date of birth is deliberately NOT required — school year + target exam date/entry year are sufficient, per the directive's own instruction. `evidenceConfidence` and `lastVerifiedAt` exist specifically so a stale or superseded fact is never silently presented as current. This record is a pure data/evidence layer; it does not compute preparation stage or readiness itself — those remain `preparationStage.ts`'s job, now given a real `targetExaminationDate` input instead of the dashboard's own ad hoc `getTargetExamDate()` call where useful (a future increment's wiring decision, not made here).

---

## 7. Preparation Clock integration (design)

`resolvePreparationClock()`/`resolvePreparationClockFor()` (Decision 75) already compute `daysRemaining`/`horizonBand` correctly and safely (never negative-day-guessed, `unavailable` stays `unavailable`). **No duplication is needed or proposed.** The operational gap is that nothing yet turns a horizon band into differentiated Mock/exam-condition guidance. Design (not built this increment):

- `long_horizon`/`coverage_building` → Mock should not yet be offered as a priority; `mockReadiness.ts`'s existing `practice-first` verdict already covers this correctly.
- `transfer_building` → `first-mock-valuable` territory, IF real evidence (not just time) also supports it — time alone must never promote this (Decision 76's own safeguard, reused unchanged).
- `exam_condition`/`final_preparation` → where FULL MOCK under real timed conditions becomes the priority mode, subject to the same evidence gate.

**Concrete example language** (illustrative, not committed copy — explicitly a design example per the directive): *"Your CSSE examination is approximately 11 months away. At this stage, the priority is building secure foundations rather than full examination simulation."* This is exactly `derivePreparationStage()`'s existing `stagePrinciple()` pattern (Decision 78's own §5 mechanism, 007W), extended with exam-proximity-aware Mock-readiness language — a real, small, well-understood extension point, not a new engine.

---

## 8. Year-group and ability differentiation (Part 22 scenarios, proven against the existing architecture)

Reusing `derivePreparationStage()` (Decision 78) and its own year-group safeguards (proven in `tests/lib/learningEngine/yearGroupSafeguards.test.ts`), each scenario resolves correctly today at the *stage* level, with the Mock-readiness layer (§7) as the only genuinely new decision surface:

| Scenario | Preparation stage (existing, correct) | Mock implication (new design) |
|---|---|---|
| A. Year 4, strong Maths, weak comprehension | `developing`/mixed — never a single "strong" label, since stage is evidence-per-competency, not one blended score | No full Mock; targeted comprehension practice prioritised; Year 4 developmentally capped below exam-condition intensity regardless of Maths strength (existing safeguard) |
| B. Year 4, limited evidence | `insufficient_evidence` | No Mock offered at all — `mockReadiness.ts`'s `hasAnyEvidence` gate already gets this right |
| C. Early Year 5, broadly strong | `transfer`, capped below exam-condition (Year 5 capped identically to Year 4, existing rule) | Familiarisation/diagnostic Mock only, never FULL MOCK — the cap is a *stage* cap already proven, and should extend to Mock-condition selection |
| D. Year 5, significant foundational gaps | `foundation`/`teaching` | No Mock; explicit re-teaching priority |
| E. Late Year 5, strong academically, no timed-test experience | `transfer`, still capped (Year 5) | This is exactly why a DIAGNOSTIC/FAMILIARISATION Mock mode (§11) is needed — real academic strength without timed-condition exposure is a genuinely distinct, real gap current architecture has no way to represent, since `mockReadiness.ts` only asks "is there evidence," not "is there timed-condition evidence" |
| F. Early Year 6, close to exam, mixed readiness | `exam_preparation`/`final_preparation` reachable (Year 6 uncapped) | FULL MOCK appropriate where competency evidence supports it; foundational gaps still route to targeted teaching first, exam proximity never overriding real need (existing safeguard) |
| G. High Practice performance, weak Mock performance | Not representable today — Practice evidence and Mock evidence are currently two disconnected `MockResult`/`ali_student_question_history` pools with no reconciliation surface | **A genuinely new requirement**: a Mock-vs-Practice evidence-comparison view, flagging the divergence itself as diagnostic information (e.g. timing pressure, exam-condition anxiety) rather than silently averaging the two or trusting whichever is higher |
| H. Moderate Practice, improving Mock performance | Same gap as G | Same — a longitudinal Mock-trend view is new, not yet designed beyond this table entry |

**Scenarios G and H are the clearest evidence that Mock Performance must remain its own tracked evidence stream, never merged into or treated as equivalent to Practice mastery** — directly motivating §12's readiness-boundary separation below.

---

## 9. Mock Assessment lifecycle (design)

Per the directive's 15-stage list, collapsed into the states that carry real product/architectural weight (the remainder are UI states within "timed assessment," not separate lifecycle stages):

`ELIGIBLE_TO_ATTEMPT` (readiness check, §7/8 evidence-gated) → `ASSIGNED` (a specific sealed form allocated, §11) → `IN_PROGRESS` (timed, section-aware, autosave — new, since today's single-timer sitting has no section transitions or recovery) → `SUBMITTED` (immutable capture, §7's genuinely new requirement) → `VALIDATING` → `SCORING` → `QUALITY_CHECK` → `DIAGNOSTIC_ANALYSIS` → `REPORT_PREPARATION` → `READY_FOR_RELEASE` → `RELEASED`. **Ordinary Practice session semantics are explicitly NOT reused for `IN_PROGRESS` onward** — Practice has no submission immutability, no staged reporting, and no exam-condition mode; treating a Mock attempt as "just another session" is precisely the anti-pattern the directive's Part 7 preamble warns against, and the current single-function `submitExam()` (§2) is exactly that anti-pattern in its present form.

---

## 10. Sealed Mock content architecture

The 007R strategy's sealed/reserved model is **reaffirmed**, but §4's finding means `eligibility_status = 'mock_eligible'` alone is **not sufficient enforcement** — it is a display filter, not an access boundary. The corrected design: Mock content must be served through a server-side path (an API route or server action reading with the service role, never the client-side anon key) that only returns questions for an `IN_PROGRESS` attempt the requesting user actually owns, and even then only the current section's questions, not the whole form. No schema change is proposed in 008A (per the directive's own instruction not to change schema unless proving a critical correction is necessary); the correction is architectural placement of the *fetch path*, to be implemented in 008C.

**Leak-surface checklist, verified against current code:** Practice (`fetchQuestionBank`, distinct function, distinct eligibility filter) — safe by construction. Today's Mission, Revision Planner, Recommendation Centre — all operate over `getEducationalIntelligence()`/`ali_student_question_history`, never raw question banks — safe by construction. Teaching MODEL/Guided examples (`mathsTeachingContent.ts` etc.) — static, hand-authored, entirely separate from `ali_question_bank` — safe by construction. Admin review surfaces (`fetchRepresentativeQuestions`/`fetchQuestionsByIds`) — gated by `is_current_user_admin()` RLS on `ali_family_review` INSERT, but `ali_question_bank` SELECT itself is the open policy (§4) — **the admin review UI is not the leak risk; the underlying open RLS is**, and it is the same underlying gap regardless of which surface someone uses to exploit it. **The single fix in §4 closes every leak vector at once**, since they all ultimately read the same open table.

---

## 11. Mock Forms A/B/C (design)

Form identity: a `mockFormId` grouping a fixed, versioned set of `mock_eligible` question IDs (by component) plus assigned passages, generated and sealed together, never mixed post-creation. Composition mirrors the real exam structure (§5): one English section (comprehension + Continuous Writing) and one Mathematics section per form, timed to match official timing. Difficulty/competency balancing reuses the existing 9-dimension Mathematics framework and the existing English Question Type taxonomy — no new difficulty model. Exposure protection: a `mock_form_attempt` record (new, §9) per learner per form, with a cooldown before the same form could ever be reoffered (sibling/household exposure is a real, disclosed limitation — Angel 11+ has no reliable way to detect two children in one household without invasive data collection, which the directive explicitly says not to build; documented as an accepted residual risk, not solved). Annual refresh: forms tied to the exam's own annual cycle (§5's evidence-refresh, §20) — a form is retired, not silently reused, once its exposure risk or the underlying exam specification changes. **Comparability language: "designed to comparable specifications," never "statistically equivalent," until real calibration evidence (§25, 008G) exists** — this is a hard product-copy rule, not a suggestion.

---

## 12. Mock visual and exam-condition standard

**Standard, not yet implemented:** a distinct "examination mode" shell — no XP/streak/confetti anywhere in the flow, a candidate-instructions screen before start, a per-section timer with time warnings, calm/serious visual language distinct from Practice's own warmer, encouraging tone (matching §10 of the 007X programme's own established design-quality bar: "premium, calm, credible, child-friendly without appearing childish"). Interruption handling (accidental refresh, reconnection, browser-close) requires the new `IN_PROGRESS` server-side state (§9) to be recoverable at all — today's client-only state would simply lose an in-progress attempt on refresh, a real, disclosed gap.

**Exam-condition modes**, explicitly non-contaminating (§11 of the directive): `FULL_MOCK` (counts as Mock Performance evidence), `TIMED_SECTION` (partial, diagnostic-weighted, not full evidence), `DIAGNOSTIC_MOCK`/`FAMILIARISATION` (explicitly excluded from Mock Performance evidence — first-exposure anxiety and unfamiliarity with the format must not be scored as if it were true readiness evidence). This directly serves Scenario E (§8): a familiarisation mode is precisely the tool a strong-but-untested Year 5 learner needs, without it contaminating the Mock Performance evidence stream a later FULL_MOCK attempt would build.

---

## 13. Delayed reporting lifecycle (Part 12 — the Founder's own explicit product principle)

The states in §9 (`SUBMITTED` → ... → `RELEASED`) exist specifically to prevent what §2 confirmed is happening today: full report on the same synchronous call as submission. On `SUBMITTED`, the child sees only a neutral completion state (exact copy subject to product/copy review, not committed here, per the directive's own instruction). No score, no weaknesses, no readiness classification, no predicted outcome is shown until `RELEASED`. The delay's purpose is educational integrity and genuine processing (quality checks, diagnostic analysis), not artificial suspense — it should be as short as genuine processing requires, not padded.

---

## 14. Child and parent post-Mock experience (design)

**Child** (§13 of the directive): submission confirmation → "being processed" holding state → arrival notification → a report that names strengths and the next concrete learning priority, converts assessment into action, and contains zero internal competency IDs, engine terminology, admissions predictions, or unnecessary peer comparison.

**Parent**: a richer report — subject/component performance, priority weaknesses, timing behaviour, unanswered questions, support-independent evidence only (never a Guided/supported correct answer presented as mastery — Decision 7's own standing rule, reused unchanged), recurring misconceptions, comparison with the learner's own prior Mock attempts (never other children), preparation-stage interpretation, and recommended next actions. **Every reported figure must state what it does and does not mean** — e.g. "this reflects performance under Mock conditions on this form; it is not a predicted CSSE score" as a structural requirement of the report template, not an optional caveat.

---

## 15. Readiness boundaries (Part 15 — strict separation enforced by design)

| Concept | Evidence required | Currently available? |
|---|---|---|
| Mastery | Real, distinct-correct-session Practice evidence (`lib/ali/mastery.ts`, unchanged) | Yes — already real |
| Exam Readiness | Mastery + preparation stage + Mock Performance, combined — **not yet defined as a single computed value**, deliberately, since the directive itself asks for boundaries, not a premature composite score | Partially — components exist, no composite built |
| Mock Performance | One or more valid (`FULL_MOCK` or sufficiently-weighted `TIMED_SECTION`) attempts | Not yet — 0 Mock Eligible content, no attempts possible |
| Projected Performance | Real calibration evidence across many learners and forms | **Not available and must remain unavailable** until 008G-scale calibration evidence exists — explicitly not built this increment or implied as coming soon |
| Admissions Outcome | Never computable by Angel 11+ alone (school-specific, cohort-relative, outside Angel's evidence) | **Must never be represented as guaranteed, certain, or probable from Angel evidence alone** |

These five are never to be used interchangeably in any product copy, report template, or internal variable naming — a naming/copy-review rule for every subsequent increment in this programme.

---

## 16. Mock scoring and standardisation boundaries

Given §5's finding that CSSE's own standardisation methodology is not published, **Angel 11+ cannot and must not claim to produce an "official standardised score."** Legitimate categories: **RAW SCORE** (marks obtained on a Mock form — real, computable); **INTERNAL DIAGNOSTIC SCORE** (Angel's own evidence-weighted interpretation of a Mock attempt, clearly labelled as internal, never presented as resembling CSSE's own method); **OFFICIAL STANDARDISED SCORE** — **not reproducible, must never be simulated or approximated as if it were real**; **PROJECTED SCORE** — not available (§15). The safest useful alternative: report RAW SCORE plus an INTERNAL DIAGNOSTIC interpretation grounded in real competency evidence, explicitly labelled as Angel's own assessment, never CSSE's.

---

## 17. Continuous Writing in Mocks

Decision 66/67's Writing architecture (AI-scored evidence quarantined from mastery — CSSE Completion Programme Phase A, Decision 61) is preserved unchanged. Writing PE remains 0; not activated this increment. Design for a future Mock: task presentation matches §5's confirmed two-task, timed structure once independently re-verified (§5's disclosed PDF-parsing limitation); response capture needs autosave (a genuinely new requirement, since Practice's writing flow — where it exists — was not built for exam-condition interruption recovery); AI-assisted evaluation may inform the INTERNAL DIAGNOSTIC layer (§16) but **must never independently establish mastery**, exactly as already ruled for Practice Writing; human/calibration requirements for any AI Writing score used in a Mock report are a 008E/008F-scale question, not resolved here.

---

## 18. Mock content requirement (calculated, not authored)

Per form: 2 components (English, Mathematics) matching real exam timing (§5). Using this codebase's own existing Mathematics question-per-minute density as a reference point (an estimate, not a psychometric calculation — no official per-question timing is published), a 60-minute Mathematics paper plausibly needs on the order of 20-30 questions; English's 60+10-minute comprehension-plus-writing paper needs a passage set plus a comparable question count plus 2 Continuous Writing tasks. **Exact figures are not fixed in this increment** — they depend on 008F's own detailed specification work, informed by the still-outstanding PDF verification (§5). For N forms, content requirement scales roughly linearly, plus a reserve pool for replacement/retirement (§11/§19). **Sealed Mock content must be counted separately from the ~480-question Practice estate target** — it does not contribute to ordinary Practice depth, and conflating the two would misrepresent both programmes' real progress. This increment does not authorise or begin any such authoring.

---

## 19. Anti-memorisation (Mock-specific)

Sealed questions (§10), form-level exposure protection and reuse cooldown (§11), passage exposure tracking (already real and functioning for Practice English — reused, not rebuilt), question retirement on a defined schedule tied to the annual evidence cycle (§20), structural variation within each form's own item pool (same discipline already proven for the 14 007X Practice questions — Decision 78's own anti-memorisation classification standard, reused). Household/sibling exposure is an accepted, disclosed residual risk (§11), not solved via invasive tracking, per the directive's own explicit instruction against surveillance.

---

## 20. Exam-update and annual evidence-refresh architecture

`ExamIntelligenceProfile.evidenceConfidence` (§6) is the mechanism: `current` (verified within the last refresh cycle), `stale` (past due for re-verification but not contradicted), `superseded` (a newer official fact has replaced it — e.g. exactly what happened with Applied Reasoning's 2024 removal), `unverified` (design-time assumption, no official source yet checked). An annual refresh process (re-running §5's own evidence-gathering method against `csse.org.uk`) should update this record and flag `importantChange` where a genuine specification change is found — such a change should reach governance (a recorded Decision) and Product review before any automatic propagation into preparation plans or Mock specifications; **the directive's own explicit instruction stands: do not automatically rewrite educational strategy merely because a webpage changed.**

---

## 21. Exam Information product experience (design)

A parent-facing capability (working name: "Exam Information," pending product-language review) answering exactly the questions the directive lists, sourced entirely from `ExamIntelligenceProfile` (§6) — never re-deriving facts ad hoc in UI code. Deliberately terse: administrative detail (registration forms, SEND arrangements) is linked out to the official CSSE site, not reproduced and risked going stale inside Angel 11+.

---

## 22. Security, privacy and assessment-integrity findings

**The open RLS SELECT policy on `ali_question_bank` (§4) is the single critical finding.** Beyond it: no server-side gating exists for Mock content specifically today (confirmed — `fetchMockEligibleQuestionBank()` is a plain client call, no API route or edge function mediates it); no rate limiting; no server-side answer redaction; no separate "exam session" server state (client-only today). Predictable IDs are a real but secondary concern once the RLS gap is closed (sequential/guessable question IDs would still let a determined user enumerate a sealed form's content via a legitimately-authenticated, legitimately-scoped session if IDs are guessable — a design note for 008C, not a blocking finding on its own). Timer tampering, replay, and post-submission answer mutation are all currently *possible* only because there is no server-side `IN_PROGRESS`/`SUBMITTED` state machine at all (§9) — closing that gap closes these risks by construction, not via bolted-on countermeasures.

---

## 23. Product differentiation (genuine, design-supported claims only)

Longitudinal evidence (real `ali_student_question_history`, not a one-off score) — already real. Preparation-stage awareness — already real (Decision 78), not yet Mock-connected (§7's gap). Mock-to-learning feedback loop — designed (§9's `REPORT_PREPARATION`/post-Mock plan update), not built. Official exam intelligence with disclosed evidence confidence (§6/§20) — a genuine differentiator versus static question banks or generic apps, which typically present exam facts without sourcing or currency tracking. Controlled, sealed assessment with a real firewall (once §4 is closed) — a genuine differentiator versus most competitors' unsealed, downloadable-PDF-style "mock papers." Parent interpretation that states what evidence does and does not mean (§14/§15) — a genuine, disclosed-boundary differentiator versus products that imply predictive certainty. No claim beyond what this document's own design actually supports is made.

---

## 24. Implementation roadmap

| Increment | Objective | DB impact | UI impact | Founder gate |
|---|---|---|---|---|
| 008A (this) | Evidence + architecture + standard | None | None | This report |
| 008B | Exam Intelligence + Preparation Clock product integration | `ExamIntelligenceProfile` persistence (new, small) | Dashboard/Exam Information surfaces | Design review |
| 008C | Mock assessment engine + sealed-content firewall | **Closes §4's RLS gap**; new attempt-state table | Server-mediated content delivery | Security review, mandatory before any content work |
| 008D | Mock visual experience + attempt lifecycle | Attempt state transitions | Exam-mode shell, timer, recovery | UX review |
| 008E | Mock reporting + delayed-release architecture | Report-state table/fields | Staged report UI, child/parent views | Product/copy review |
| 008F | Mock content specification + first controlled Mock form | None (spec only, then bounded authoring under its own gate) | None | Content review, same discipline as 007X |
| 008G | Calibration + production pilot | Pilot attempt data | Pilot-only surfaces | Founder pilot sign-off |
| 008H | Additional forms + operationalisation | Form-management tables | Ongoing ops tooling | Founder sign-off |

Sequencing reflects the repository's own evidence: 008C is placed before 008D/008E specifically because §4's security gap must close before any real attempt data (008D onward) can safely exist.

---

## 25. Bounded implementation

No live defect qualifying under the directive's own criteria (directly discovered, currently unsafe, small, independently testable) was found. §4's RLS gap is real and serious but is not *currently* unsafe (0 Mock Eligible rows exist) and is not small (a proper fix requires the server-mediation architecture 008C is scoped for) — correctly deferred, not fixed here, per the directive's own explicit instruction not to use this permission to start building the Mock programme early.

---

## 26. Quality gates

Full suite: unaffected by this increment (no application code changed — this is a documentation-only increment). Re-run to confirm no drift: see final report.

---

**STOP. This report concludes 008A. No Mock content authored or activated. No implementation performed beyond this document. Return to Founder/Product leadership for 008B authorisation.**
