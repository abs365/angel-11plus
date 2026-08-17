# Angel 11+ — 007U: 007T Closure, Learner-State Safety and Learner Preparation Intelligence Architecture V1

**Educational Increment 007U.** Prepared 2026-08-17. Founder-authorised controlled architecture and bounded implementation increment.

---

## 1. Baseline

Re-queried live at the start of this increment: **TOTAL 298, Practice Eligible 247, Maths PE 141, English PE 106, Provisional 51, Mock Eligible 0** — exact match to the expected post-062/063/064 state. No drift.

---

## 2. Problem statement

Three real, distinct problem classes were in scope: (A) 007T's review outcome could not be reconciled from this session's own access; (B) two live learner-facing defects (Writing shown as a confident "0%" with no underlying evidence, and raw database/migration terminology leaking into a learner error state) plus one recommendation-logic defect (Writing recommended with no completable destination); (C) Angel 11+ has no explicit model for *how* preparation should differ across a Year 4–6 learner population with varying time-to-exam and demonstrated evidence — school year alone currently has no safeguard against being used as a implicit proxy for difficulty.

---

## 3. Evidence

### 3.1 — Part 1: 007T review reconciliation

`ali_family_review` is RLS-opaque to the anon key this session holds — re-tested directly, identical `200`/`content-range: */0`/`[]` signature to every prior instance (Decisions 48/53/54/56/63/65/67). **No claim is made about whether the Founder's 007T review decisions have been recorded.** Production baseline (content, not review-decisions) re-confirmed exact match to expected (Part 1 above). **No activation migration was created.** Exact authenticated query requested:

```sql
select review_target_type, family_id, decision, reviewer, notes
from ali_family_review
where family_id in (
  'mr01-whole-number-computation','mr01-decimal-computation','mr01-fraction-computation',
  'mr01-multistep-order-of-operations','wave3-fam-rc10-word-choice','wave3-fam-rc10-atmosphere-mood',
  'wave3-eng-emptyclassroom','wave3-eng-bakersapprentice','wave3-eng-lettertograndad',
  'wave3-eng-stormharbour','wave3-eng-newtrainers'
)
order by review_target_type, family_id, review_date;
```

**Per the directive's own framing** ("preserve all completed work and request it before any activation preparation"), the remainder of this increment — architecture design and the bounded implementation below — is independent of 007T's review outcome and was not blocked by this.

### 3.2 — Part 3, Problem A/C root cause (traced in full, not guessed)

`app/dashboard/page.tsx` calls `computeAnalytics()` (`lib/analytics.ts`) and `computeAdaptiveState()` (`lib/adaptiveEngine.ts`). This is a **pre-existing, previously-flagged, still-unresolved parallel system**: `lib/adaptiveEngine.ts`'s own header comment (Educational Intelligence Foundation, Phase 2A gap review, 2026-07-23) already documents that this module reads/writes `lib/progress.ts`'s localStorage-backed `UserProgress`/`AnalyticsReport` — never `ali_student_question_history`, the real ALI evidence store every 007A-007T increment has built against. A CSSE learner's real Practice activity never reaches this legacy engine at all.

Traced precisely:
- `mean([])` in `lib/analytics.ts` correctly returns `0` for zero attempts, and `status(score, attempted)` correctly returns `"not-started"` when `attempted === 0` — the underlying data model **does** distinguish these cases.
- However, `tierFromSubject()` in `lib/adaptiveEngine.ts` (line 36) collapses them: `if (subject.attempts === 0) return "foundation";` — the same tier as confirmed weak performance.
- More critically, `urgency()`'s legacy branch assigns `not-started` subjects a **high** urgency score (80) — deliberately, to nudge learners toward unstarted subjects — with no awareness of whether the subject's real destination page has any content at all.
- For a CSSE learner, `resolveSubjectHref("writing", "csse")` (`lib/ali/pathwayEligibility.ts`) resolves to `/learning-intelligence/practice/continuous-writing` — the real CSSE route, which has **0 Practice Eligible questions** (confirmed, Part 1). Writing's urgency (80, or higher again once any low/zero legacy score exists) can out-rank every genuinely strong subject, making it the primary/secondary Today's Mission recommendation — **Problem C, confirmed**.
- `reasonText()`'s copy generator does correctly gate on `status === "not-started"` (showing "Creative writing is a scored 11+ component. Start with a structured prompt.") — but that not-started copy is itself only reached when the underlying legacy `p.scores` genuinely has zero writing entries. If even a single legacy-pathway (unrelated `/writing` static-prompt) attempt exists, `status` becomes `"weak"`/`"developing"` and the copy states `subject.avgScore` as a confident percentage — **Problem A's mechanism, confirmed**: the same evidence gap (1-2 attempts is not a stable "average") existed with no gate at all before this increment.

### 3.3 — Part 3, Problem B root cause

`lib/learningEngine/sessionGenerator.ts`'s `generatePersonalisedSession()` — the **real**, current CSSE Practice pathway's own entry point — returns `{ activities: [], summary: "No practice content is available for this area yet. The illustrative content set (migration 013) has not been applied to this database." }` whenever an area has zero QT-tagged content. `app/learning-intelligence/practice/[area]/page.tsx` (line 165, before this increment) did `if (tagged.length === 0) { throw new Error(session.summary); }`, and the generic error UI rendered `{errorMessage}` verbatim — the raw internal string, including "migration 013"/"database," reached the learner directly.

**Migration 013 investigated, not applied:** `supabase/migrations/013_wave2_illustrative_practice_content.sql` — Capability 3 Wave 2, an old (pre-Assessment-Transformation) batch mapping ALI's Question Type taxonomy onto the **legacy** `data/lessons.ts`/`data/maths.ts`/`data/writing.ts` content (the same unrelated legacy pathway as 3.2), explicitly self-labelled "illustrative," not reviewed CSSE-evidenced content. Applying it would not meet this whole programme's content-evidence standard even if it were authorised, which it is not.

---

## 4. Learner-state model

**No "cleverness score." No clever/average/weak labels.** A new shared contract, `EvidenceState` (`lib/learningEngine/evidenceState.ts`, implemented this increment):

| State | Meaning | Threshold |
|---|---|---|
| `no_evidence` | Never attempted | 0 attempts |
| `insufficient_evidence` | Too few attempts to characterise reliably | 1-2 attempts |
| `developing_evidence` | A genuine but still-growing sample | 3-5 attempts |
| `established_evidence` | A reliable sample | 6+ attempts |

`isEvidenceTooThinForAverage()` gates whether a percentage/average may ever be stated in learner-facing copy — `no_evidence` and `insufficient_evidence` never may. Thresholds are a disclosed judgement call (not derived from an external standard), deliberately reusing this codebase's own existing sibling-depth/mastery-threshold scale (2-3) rather than inventing an unrelated number.

**Full learner preparation model (design, not implemented this increment)** — the 15 dimensions the directive requires, mapped to what already exists vs. what is genuinely new:

| Dimension | Existing basis | Gap |
|---|---|---|
| 1. School year / stage | `year_group` (Supabase profile) | Already captured |
| 2. Target pathway | `selectedPathwayId`/`PATHWAYS` | Already captured |
| 3. Target exam/entry year | Not currently modelled | New field needed |
| 4. Authoritative exam date | `targetExamDate` (parent-supplied, optional) | Exists but not linked to an *official* CSSE date (Part 6) |
| 5. Time remaining | Derivable from #4 | New calculation (Part 6) |
| 6. Demonstrated attainment | `ali_student_question_history` (real), legacy `UserProgress.scores` (unreliable, see §3.2) | Must migrate off the legacy source for CSSE learners |
| 7. Competency mastery evidence | `lib/ali/mastery.ts` (real, proven) | Already the correct source |
| 8. Support level required | `supportTier` (Decision 60's mastery quarantine) | Already captured for Writing; general for other subjects |
| 9. Difficulty performance | `content_difficulty`/the 9-dimension framework (007S) | Exists for content; not yet aggregated per-learner |
| 10. Transfer performance | `transfer_class` per question | Exists for content; not yet aggregated per-learner |
| 11. Retrieval/retention evidence | `RETRIEVAL_STAGE_WEIGHT`/`classifyRetrievalStage` (Decision 68's own exposure intelligence) | Already real, proven |
| 12. Writing evidence | Phase D's rubric + quarantine | Real, but currently 0 Practice Eligible questions to generate it from |
| 13. Timed-performance evidence | Not currently captured anywhere | New — no timed-practice mode exists yet |
| 14. Mock evidence | `Mock Eligible = 0` — none exists | Deferred per Part 10 boundary |
| 15. Evidence confidence | New `EvidenceState` (this increment) | Implemented |

**Explicit design principle, per the directive:** dimension 1 (school year) is an input to *appropriateness* (curriculum sequencing, developmental constraints), never a proxy for *difficulty*. A strong Year 4 learner's stage/difficulty position is set by dimensions 6-13, not by dimension 1 alone.

---

## 5. Preparation-stage model (design only)

Investigated whether existing architecture already has equivalent concepts before proposing new names, per the directive's own instruction. Findings:

- **`AdaptiveTier`** (`foundation`/`developing`/`advanced`/`challenge`) already exists but is a **per-subject, score-based** tier, not a preparation-stage — and (per §3.2) is currently computed from the unreliable legacy evidence source for CSSE learners.
- **`RetrievalStage`** (`NEW`/`IMMEDIATE_REMEDIATION`/`SHORT_TERM_RETRIEVAL`/`SPACED_RETRIEVAL`/`MASTERY_MAINTENANCE`, Decision 68) already exists but operates at the **family/passage** level, not the whole-learner level.
- **No existing whole-learner preparation-stage concept exists.** The directive's suggested 6-stage progression is adopted as a genuine design (not implemented in code this increment), reusing `AdaptiveTier`'s and `RetrievalStage`'s own real signals as inputs rather than re-deriving new ones:

| Stage | Entry evidence | Learning priority | Difficulty mix | Support | Retrieval | Timing | Writing | Mock | Exit criteria | Regression |
|---|---|---|---|---|---|---|---|---|---|---|
| FOUNDATION | `no_evidence`/`insufficient_evidence` on most competencies | Coverage — touch every tested competency once | Mostly EASY | MODEL + Guided, high | N/A yet | Untimed | Reflective/discursive intro only | None | `developing_evidence` on ≥50% of tested competencies | N/A (starting point) |
| TEACHING | `developing_evidence`, mastery not yet established | Close specific, named gaps | EASY→EXAM-STANDARD | Guided, reducing | NEW/IMMEDIATE_REMEDIATION-weighted | Untimed | Both genres, Guided | None | `mastery: mastered` on the majority of attempted competencies | A newly-surfaced weak competency reopens Teaching for that competency only, never the whole learner |
| DEVELOPING | Established mastery on a growing subset | Broaden coverage + consolidate | EXAM-STANDARD-dominant | Guided fading to Independent | SHORT_TERM/SPACED-weighted | Light timing awareness | Independent attempts begin | None | Mastery established across the evidenced competency set | Same |
| TRANSFER | Established mastery, thin far-transfer evidence | Near/mixed/far-transfer practice | EXAM-STANDARD + HARD | Independent | SPACED_RETRIEVAL | Timed practice sets | Independent, timed | None | Transfer performance demonstrated across `transfer_class` bands | A collapse in transfer performance drops back to Developing for that competency |
| EXAM PREPARATION | Strong coverage + transfer evidence, meaningful time remaining | Timed, exam-condition practice; close remaining gaps | Full EASY/EXAM-STANDARD/HARD mix, exam-representative | Independent + light review | MASTERY_MAINTENANCE-aware | Full exam-condition timing | Timed, both genres | Sealed Mock becomes eligible (Part 10 boundary) | Sustained performance under exam conditions | A serious, newly-surfaced gap can still trigger a targeted Teaching return |
| FINAL PREPARATION | Strong evidence across the board, exam imminent | Maintenance, confidence, timing precision | Exam-representative, spaced | Independent | Spaced maintenance only | Full exam-condition | Final polish | Full Mock cycle (future) | The exam itself | N/A |

**Dynamic, not school-year-determined by construction**: every entry/exit criterion above is evidence-based (`EvidenceState`, `mastery`, `transfer_class`, timing). A strong Year 4 learner can reach TRANSFER; a Year 5 learner with real gaps stays in TEACHING regardless of how little time remains — the directive's own explicit example.

---

## 6. Preparation Clock (design; official evidence refreshed this increment)

**Official CSSE evidence, freshly consulted this increment (`csse.org.uk`), separated explicitly from Angel 11+ policy per the directive's own instruction:**

**EXAM FACTS (official, L1, re-confirmed live):**
- 2026 Entry key dates (from the currently-linked Information Guide, previously read in Educational Increment 007R and re-confirmed unchanged this session): registration 12 May – 19 June 2026, examination **19 September 2026**, results **12 October 2026**.
- English 60 minutes + 10 minutes reading; Mathematics 60 minutes; two separate papers, one day.
- 50/50 standardised weighting; minimum standardised score 303; no re-mark.
- Applied Reasoning excluded from the English paper since September 2024 (2025 Entry) — direct, current official quote (007R Part 2).
- Continuous Writing present within the English paper (~20 minutes), two genres (reflective/discursive, picture-narrative), CSSE-002 5-dimension rubric (Ideas, Vocabulary+Spelling, Grammar, Structure, Punctuation), confirmed still live-linked.
- No calculators, dictionaries, highlighters, or smartwatches. Based on the KS2 curriculum.
- Age-standardisation: analysed by birth date, but "in recent years, no such adjustment has been applied" — a modified approach adopted from October 2018.

**No 2027 Entry-specific test date beyond the Information Guide's own "correct at time of publication" caveat was found more current than 007R's existing evidence** — nothing conflicts with repository assumptions; no STOP condition triggered here.

**ANGEL 11+ PREPARATION POLICY (ours, explicitly not an official CSSE rule, never presented as one):**

```
Preparation Clock inputs: target exam id, official exam date, current date,
days/weeks remaining, learner's EvidenceState per competency, coverage
state (% of tested competencies with ≥developing_evidence), mastery state,
timed-performance state (once it exists), Mock state (once it exists,
sealed per Part 10).

Preparation Clock output: a recommended preparation-stage BAND (Part 7),
never a stage assignment on its own — the learner's own evidence can
always override a calendar-only suggestion, per the directive's explicit
instruction.
```

**Annual evidence-refresh mechanism (design, mirrors 007S Part 10's own cycle, not re-invented):**
```
NEW OFFICIAL INFORMATION (each year, post-registration-opening and post-sitting)
  → EVIDENCE CAPTURE (Information Guide, familiarisation material, mark scheme)
  → CHANGE DETECTION (diff against the last captured version)
  → BLUEPRINT/POLICY COMPARISON
  → EDUCATIONAL REVIEW (Founder confirmation)
  → PREPARATION CLOCK UPDATE
  → VALIDATION
  → VERSION FREEZE
```
Covers, at minimum: registration open/close, exam date, results timing, English/Maths duration, Continuous Writing status, Applied Reasoning status, access-arrangement deadlines, familiarisation/sample-material changes — matching the directive's own list exactly.

**No date is hardcoded without governance** — `targetExamDate` remains parent-supplied (existing field), and any Angel-suggested default date is explicitly sourced from the annually-refreshed official evidence above, never silently baked into code without this document's own citation trail.

---

## 7. Target-exam data model (design)

```ts
interface TargetExam {
  pathwayId: string;            // existing PATHWAYS id (csse, gl, cem, iseb, independent, ...)
  entryYear: number;             // e.g. 2027 ("2027 Entry")
  officialExamDate: string | null;  // ISO date, sourced from Part 6's evidence-refresh cycle; null until known
  officialExamDateConfidence: "confirmed" | "provisional" | "unknown";
  registrationOpens: string | null;
  registrationCloses: string | null;
  resultsDate: string | null;
}
```
Deliberately separate from `UserProgress.targetExamDate` (a parent's own date override) — the official date is Angel's own evidence-sourced fact; a parent may still see and, if genuinely necessary, override it, but the two must never be silently conflated (matching Part 6's EXAM FACTS/POLICY separation).

---

## 8. Recommendation contract (design; explainability requirement)

Every recommendation must answer, per the directive: why this activity, why today, why this difficulty, why this subject, what evidence triggered it, what changes after completion. Design contract (not implemented beyond the two bounded fixes in §14):

```ts
interface ExplainableRecommendation {
  activityId: string;
  subjectLabel: string;             // learner-facing, never a competency ID
  difficultyLabel: "easy" | "exam-standard" | "hard";
  reasonSummary: string;            // "Your recent work shows..." — age-appropriate, no engine terms
  evidenceState: EvidenceState;     // from §4 — never implies certainty beyond what evidence supports
  triggerReason: "weak-competency" | "coverage-gap" | "spaced-retrieval-due" | "transfer-practice" | "not-yet-attempted";
  contentAvailable: boolean;        // Problem C's own guard, generalised — must be true before this can be primary
}
```

**Safeguards, matching the directive's own list, mapped to existing or proposed mechanisms:**
- Unavailable activities recommended → §14's bounded fix (CSSE writing content-availability guard), generalise later.
- Over-practising one family → `reduceFamilyClustering` (existing, Decision 68).
- Passage memorisation → `passageGroupingKeyOf`/Decision 68 (existing, proven).
- Difficulty stagnation → the 9-dimension EASY/EXAM-STANDARD/HARD composite (007S Part 9), not yet authored against widely — a real, disclosed gap, not new to this increment.
- Premature Mock exposure → Mock Content Firewall (Decision 59, existing, proven), Part 10 boundary below.
- Neglecting strong areas → `RETRIEVAL_STAGE_WEIGHT`'s own `MASTERY_MAINTENANCE: 0.5` (existing — never zero, Decision 68's own design principle).
- Overloading struggling learners → `REVIEW_SLOT_CAP`/session-size caps (existing, `lib/learningEngine/sessionGenerator.ts`).
- Unsupported Writing scores → Decision 60's mastery quarantine (existing, proven, `supportTier: "supported"` unconditional).

No internal competency ID or engine term (`transfer_class`, `QT-RC-10`, `masteryThreshold`) may ever appear in a learner-facing `reasonSummary` — matching every existing learner-facing explanation function already audited in this codebase (`generateExplanation()`).

---

## 9. Parent intelligence (design)

Parent-facing answers to the directive's own question list, mapped to what already exists:

| Question | Existing basis |
|---|---|
| Where is my child now? | `computeParentReport()` (`lib/parentInsights.ts`), Preparation Stage (§5, new) |
| What are they working on? | Today's Mission (existing, corrected §14) |
| What evidence supports that? | `ali_student_question_history`, `EvidenceState` (new) |
| What needs attention? | `getRecommendations()` weak-competency signal (existing) |
| Coverage so far? | New — coverage % (§4 dimension) not currently surfaced to parents |
| Performance trend? | Partially — `lib/ali/durableMastery.ts`; full trend line flagged as a known gap in 007D (Assessment Excellence Phase D, unchanged) |
| Time remaining? | Preparation Clock (§6, new) |
| Preparation stage? | §5, new |
| Next milestone? | Derived from §5's exit criteria, new |
| What should the parent do? | Existing `parentInsights.ts` action items, extended with §5's stage-appropriate guidance |

**Explicitly unavailable, per Decision 66/67's own existing standard, unchanged by this increment:** pass probabilities, predicted CSSE scores. Mastery, Exam Readiness, Mock Performance, Projected Performance, and Admissions Outcome remain five separate, never-collapsed concepts (007S Part 13, restated, not re-litigated). **Projected Performance stays unavailable until real Mock calibration evidence exists — still true, `Mock Eligible = 0`.**

---

## 10. Mock boundary (unchanged, reconfirmed)

**Not implemented this increment**, confirmed by construction: `Mock Eligible = 0` before and after (§15). The Preparation Stage model (§5) is designed to be Mock-compatible: EXAM PREPARATION is the first stage where Mock becomes conceptually eligible, and FINAL PREPARATION is where the "full Mock cycle" (future) belongs — matching the SUBMITTED → ANALYSING → QUALITY CHECKED → REPORT READY → CONTROLLED RELEASE lifecycle 007S already approved, restated not redesigned. No AI-as-mechanism language, no exact-prediction claim, appears anywhere in this document.

---

## 11. Writing boundary

Continuous Writing's own architecture (Phase D, Decisions 66/67) is unchanged. This increment's only Writing-related change is **presentational**: no-evidence is no longer conflated with 0%, and the CSSE Continuous Writing route no longer leaks internal terminology when empty. **`wrt-003` is untouched.** No Writing content was activated, authored, or reclassified.

---

## 12. Content-expansion implications

**The ≈483 objective-question target is not changed by this increment** — the directive's own instruction, honoured. This architecture instead documents *how* future authoring should be sequenced against real learner need, extending (not replacing) 007S/007T's own completion programme (007R Part 17):

- **School-stage needs**: FOUNDATION-stage content (mostly EASY) should be prioritised for competencies with the thinnest current EASY-tier supply (007T Part 8's own finding: only 4 of 27+4 Mathematics families have any EASY-tier content at all).
- **Difficulty progression**: the 9-dimension composite (007S Part 9) becomes the acceptance gate for every new question's claimed tier, not manual labelling — unchanged recommendation, restated.
- **Transfer**: far-transfer content should track the TRANSFER stage's real demand, not be authored speculatively ahead of evidence that learners are reaching that stage.
- **Retrieval**: passage/family exposure protection (Decision 68) must cover any newly-authored content by construction (already true — `passageGroupingKeyOf` is subject-general, not content-specific).
- **Weak/strong competencies**: authoring priority should follow real aggregate weak-competency signal once dimension 9/10 (§4) aggregation exists — not yet built, flagged as a genuine future dependency (§19).
- **Time-to-exam**: a cohort entering EXAM PREPARATION stage with thin HARD-tier coverage in a specific competency is a stronger authoring signal than an arbitrary volume target.
- **Passage exposure / Mock separation**: unchanged — the sealed Mock estate (007S Part 8, Option A) remains structurally separate from Practice content; future content commissioning must respect this boundary explicitly, as 007T's own batch did.

**The remaining estate is commissioned because learners need it, not to hit a number** — this document does not authorise or begin that commissioning.

---

## 13. Product Experience implications (requirements only, for the later audit — not designed/built here)

Reviewed the Founder's own screenshots as evidence (Problems A/B/C, §3). Requirements recorded for the future Product Experience Audit:

- **Learner dashboard**: must answer "where am I now / what should I work on / why / am I progressing" quickly — currently answers none of these from real CSSE evidence for a CSSE learner (legacy engine, §3.2).
- **Today's Mission**: must never recommend unavailable content (§14 fixes the one confirmed case; a general content-availability check is a future dependency, §19).
- **Subject cards**: must show `EvidenceState`-aware language, never a bare percentage under `insufficient_evidence`/`no_evidence` (§14 fixes the underlying `reasonText()`; the dashboard's own visual card rendering was not itself found to render a raw percentage — see §3.2's precise trace — but should be audited directly by the Product Experience Audit against a live account, which this session could not do).
- **Writing no-evidence state**: fixed this increment (§14); the Product Experience Audit should confirm the visual treatment (not just the copy) reads as "being prepared," not "broken."
- **Exam countdown/Preparation Clock**: currently a "decorative countdown" per the directive's own framing — §6/§7 define what it should become; not built.
- **Preparation-stage presentation**: entirely new, §5; no UI exists.
- **Progress language**: Part 2's product-language standard (below) should inform this pass.
- **Parent dashboard**: §9's requirements; largely additive to existing `parentInsights.ts` surfaces.
- **Settings/profile**: target-exam configuration (§7) and year-group capture already exist (`year_group`); entry-year is new (§4).
- **Accessibility / mobile responsiveness**: not assessed this increment — explicitly deferred to the Product Experience Audit, no claim made either way.

**No decorative complexity, diagramming, or icon libraries were added.**

---

## 14. Data and privacy requirements

**Minimum learner information genuinely required for preparation decisions:**

| Field | Required? | Basis |
|---|---|---|
| School year (`year_group`) | Required | Already collected; needed for developmental-appropriateness constraints (§4) |
| Target pathway | Required | Already collected (`selectedPathwayId`) |
| Target entry year | Required (new) | Needed to resolve the correct official exam date (§7) |
| Exact date of birth | **Not required** | CSSE's own age-standardisation statement (§6) confirms "in recent years, no such adjustment has been applied" — school year is the operative unit for developmental sequencing, not birth date. No existing field collects it (`dateOfBirth` does not appear anywhere in the schema, confirmed by direct search), and this document recommends against adding it |
| Target exam date override | Optional | Already exists (`targetExamDate`), parent-editable |
| Attempt/answer history | Required (system-derived) | Already collected, `ali_student_question_history` |
| Competency mastery evidence | Required (system-derived) | Already collected, `lib/ali/mastery.ts` |

**Retention**: unchanged from existing practice — no new retention question is raised by this architecture, since no new personal field is proposed beyond entry year (a single integer, no more sensitive than the pathway/year fields already collected).

**No parallel learner-profile system was created.** Entry year, if implemented later, should be added to the existing profile table/type, not a new store.

---

## 15. Failure modes (identified this increment)

1. **Legacy/ALI evidence-store divergence** (§3.2) — the single largest failure mode found: an entire parallel, previously-flagged, still-live system computes learner state for the dashboard from evidence CSSE Practice never writes to. Not fixed in full this increment (would require rewiring `/english`, `/maths`, `/vocabulary`, `/writing`, `/reasoning` page completion handlers or a navigation change — explicitly a larger, separate decision, matching the header comment's own prior flag).
2. **Content-availability blindness** — the legacy recommendation engine has no live connection to `ali_question_bank`; today's bounded fix is a small, explicit, disclosed exclusion set for one known case (CSSE writing), not a general solution.
3. **Single-attempt evidence overconfidence** (Problem A's precise mechanism) — now closed by `EvidenceState`, but only within `reasonText()`; other legacy call sites reading `avgScore` directly were not exhaustively audited beyond what Part 3 required.
4. **Migration-013-shaped debt** — any future empty-content area will still hit the same generic `noContentAvailable` path; this is correct and intentional (the fix is subject-agnostic), but any NEW subject-specific broken-recommendation risk (like Problem C) would need its own exclusion entry until the general content-availability check (§19) exists.

---

## 16. Bounded implementation completed

| Change | File(s) | Why |
|---|---|---|
| New `EvidenceState` contract | `lib/learningEngine/evidenceState.ts` (new) | Shared, reusable no-evidence/insufficient/developing/established classification (§4) |
| `reasonText()` never states a percentage under thin evidence | `lib/adaptiveEngine.ts` | Problem A |
| CSSE Writing excluded from mission candidacy while unreachable | `lib/adaptiveEngine.ts` (`buildDailyMission`, `nonMock`/`reviewSubject`/replay-queue filters) | Problem C |
| Removed migration/database terminology from the empty-content summary; added `noContentAvailable` flag | `lib/learningEngine/sessionGenerator.ts` | Problem B |
| Distinct "being prepared" UI state, replacing the generic error/retry UI for this case | `app/learning-intelligence/practice/[area]/page.tsx` | Problem B |
| Tests for all of the above | `tests/lib/adaptiveEngine.test.ts` (new), `tests/lib/learningEngine/evidenceState.test.ts` (new) | Part 15 |

**No feature bypasses the existing Educational Intelligence Engine.** The legacy `adaptiveEngine.ts` module was extended in place (its own existing shape, `AdaptiveTier`/`MissionItem`/`DailyMission`), not replaced; `sessionGenerator.ts` (the real ALI-era Practice entry point) was extended additively (`noContentAvailable?: boolean`, optional, non-breaking).

**Not implemented, deliberately** (Parts 4-13 remain design only): Preparation Stage state machine, Preparation Clock calculation, target-exam data model, full recommendation-explainability wiring, parent-intelligence surfaces, any Mock-related code, any content authoring, any Product Experience redesign.

---

## 17. Verification evidence

| Check | Result |
|---|---|
| Full automated test suite | **407/407 PASS** (398 baseline + 9 new) |
| TypeScript (`tsc --noEmit`) | Clean |
| Copy Quality Guard | PASS — 0 violations, 234 files |
| Production build | Succeeds |
| Mathematics answer regression (live) | 188/188 PASS |
| English / passage-exposure regression | PASS (`passageAwareSelection.test.ts`, unaffected) |
| Mock Content Firewall | PASS, unaffected |
| Mastery-protection (Maths) | PASS, unaffected |
| Writing mastery-safety | PASS, unaffected — `supportTier: "supported"` still unconditional |
| Targeted new tests | No-evidence ≠ 0% (2 tests); unavailable activity not recommended (2 tests); `EvidenceState` boundaries (5 tests) |
| Production counts, before/after | Unchanged: TOTAL 298, PE 247, Provisional 51, Mock Eligible 0 |

---

## 18. Unresolved risks

- The legacy/ALI parallel-evidence-store divergence (§15.1) remains the single largest unresolved architectural risk touching learner-state accuracy — this increment closed its two most visible symptoms, not its root cause.
- The CSSE-writing content-availability exclusion (§14) is a disclosed, temporary, hand-maintained set — it must be actively removed once Writing content is activated, or it will silently and incorrectly continue excluding Writing from recommendation forever.
- No general "does this subject have reachable content" check exists — any future subject reaching zero Practice Eligible content (e.g. during a future content migration) would reproduce Problem C unless separately guarded.
- Product-language standard (Part 2, below) findings were classified but not corrected in bulk, per explicit instruction — the anthropomorphic pattern remains present in several live learner-facing surfaces (the real Practice pathway's own answer-feedback copy, most notably) until a future, explicitly-scoped copy pass addresses it.

---

## 19. Future dependencies

- A real content-availability signal (live or cached `ali_question_bank` Practice Eligible counts) reachable from the legacy recommendation engine, replacing the hand-maintained exclusion set.
- Migration of CSSE-learner subject-tier computation onto real ALI evidence (`ali_student_question_history`) instead of `UserProgress.scores`, closing the parallel-system gap for good.
- Dimension 9/10 (difficulty/transfer performance) aggregation per learner — currently exists per-question, not yet summarised per learner.
- Timed-performance capture (dimension 13) — no timed-practice mode exists yet.
- The Preparation Stage/Clock/target-exam models designed in §5-7 need their own implementation increment once Founder-reviewed.
- The Product Experience Audit itself (§13's requirements feed it, not replace it).

---

## 20. Final verdict

**PASS.** All three Part 3 defects traced to real root causes (not assumed) and corrected with the smallest safe changes; migration 013 investigated and left unapplied; 007T's review-decision reconciliation is genuinely blocked on authenticated evidence this session does not have access to, and is reported as such rather than inferred; the Learner Preparation Intelligence architecture is fully designed per the directive's 20-dimension requirement, with only the explicitly-authorised smallest foundations implemented; no eligibility, Mock, or mastery-semantics change occurred; production counts unchanged throughout.

---

## Product-language standard (Part 2, frozen for future work)

**Official product name: Angel 11+.** Standalone "Angel" must never be used in new learner- or parent-facing prose referring to the platform. "Angel-11Plus" is not standard product copy. Prefer evidence-based phrasing ("These are your most important Mathematics areas to strengthen next, based on your recent work" / "Recommended based on your recent learning") over anthropomorphic patterns ("Angel thinks...", "Angel noticed...", "Angel says...").

**Findings, classified, not bulk-rewritten (none found "clearly misleading" enough to warrant an in-increment fix, per the directive's own explicit bar):**

| Location | Pattern | Classification |
|---|---|---|
| `app/learning-intelligence/practice/[area]/page.tsx` (11 occurrences) | "Angel found...", "Angel couldn't find...", "Angel recognised...", "Angel can't automatically mark...", "Angel progress indicator" | Anthropomorphic style, the **highest-traffic** occurrence cluster — the real, live Practice pathway. Recommended first target for a future, explicitly-scoped copy pass |
| `app/learning-intelligence/mock-exam/page.tsx:160` | "Angel would rather tell you that plainly..." | Anthropomorphic style |
| `app/learning-intelligence/timeline/page.tsx:110`, `app/learning-intelligence/parent/journey/page.tsx:142`, `app/learning-intelligence/parent/admissions-readiness/page.tsx:166` | Standalone "Angel" as subject | Parent-facing, naming-standard violation, not misleading |
| `app/learning-intelligence/page.tsx:174`, `app/learning-intelligence/learn/page.tsx:85` | Standalone possessive "Angel's" | Naming-standard violation |
| `app/mocks/page.tsx:184` | "Angel uses your learning and practice evidence..." | Naming-standard violation |
| `app/writing/page.tsx` ("Angel Smart Feedback"), `app/angel-plus/page.tsx` ("Angel Plus") | Named sub-features/tiers | Judgement call — treated as distinct named brands, not "the platform" itself; not required to change under this rule, flagged for a future consistency review |
| `app/admin-beta/*`, `app/learning-intelligence/founder-validation/*` | Various | Internal/Founder-only surfaces, out of scope (matching the existing Copy Quality Guard exemption pattern) |
| `lib/dashboard/page.tsx`, `app/learning-intelligence/learn/mathematics/arithmetic/page.tsx` | "Angel" in code comments | Not learner-facing, not in scope |

---

## Files changed this increment

`lib/learningEngine/evidenceState.ts` (new), `lib/adaptiveEngine.ts`, `lib/learningEngine/sessionGenerator.ts`, `app/learning-intelligence/practice/[area]/page.tsx`, `tests/lib/adaptiveEngine.test.ts` (new), `tests/lib/learningEngine/evidenceState.test.ts` (new), this governance document.
