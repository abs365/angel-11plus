# Capability 3 — Learning Platform, Wave 2: Practice Experience

**Acceptance Pack**

**Angel 11+, Version 3.0 Academic Excellence Programme**
**Capability:** 3 — Learning Platform, Wave 2 (Practice Experience)
**Status:** Implemented and verified as far as this session's environment allows. Real, load-bearing infrastructure blockers found — see Section 4 before treating this as deployable.

---

## 1. Implementation Summary

Wave 2 builds the first end-to-end learner journey feeding Learning Engine V1: **Start session → Complete activity → Record evidence → Update competency evidence → Update readiness → Display updated profile**, for three of the four practice areas named in the mission.

**New routes** (deliberately nested under `/learning-intelligence`, not a top-level `/practice`):
- `app/learning-intelligence/practice/page.tsx` — area selector.
- `app/learning-intelligence/practice/[area]/page.tsx` — one dynamic session runner serving all three areas (the journey shape is identical; only the per-activity renderer and correctness check differ).

**Why nested, not `/practice`:** this app already has an established nav item labelled **"Practice"** pointing to `/reasoning` (Verbal/Non-Verbal/Spatial/Numerical Reasoning), and a separate, deliberate product decision (`docs/operations/PRACTICE_NAVIGATION_RECOMMENDATION.md`, Phase 5B.2) already fixed one instance of "one word doing the work of two different things" in this exact app. Reusing "Practice" as a new, unrelated top-level route would reintroduce precisely the problem that phase corrected. Nesting under `/learning-intelligence/practice` keeps this feature unambiguously scoped to the Assessment Brain V1 model it feeds. **Not fully resolved, honestly**: the word "Practice" still appears twice in the UI (the existing sidebar nav item, and this feature's own breadcrumb) — carried forward as a Known Limitation (Section 4), not silently declared solved.

**Content — migration `013_wave2_illustrative_practice_content.sql`:** 18 rows in `ali_question_bank`, all built from Angel's own real, already-live content (`data/lessons.ts`, `data/maths.ts`, `data/writing.ts` — the exact text shown today on `/english`, `/maths`, `/writing`), tagged against Assessment Brain V1's frozen Question Type IDs. This is a **provisional, illustrative mapping**, not a production hand-tagging pass — every mapping decision and its reasoning is in Section 3, per this project's standing "do not automate metadata generation" rule (the same rule VR/Maths/English's own still-outstanding hand-tagging passes are held to).

**Code, additive-only:**
- `lib/learningEngine/practiceContent.ts` — area config, `checkMathsAnswer()` (ported verbatim from `app/maths/page.tsx`, including the semicolon-compound-answer special case), `scoreEnglishAnswer()` (ported verbatim from `app/english/[id]/page.tsx`'s keyword-heuristic grader), `WRITING_CORRECTNESS_THRESHOLD`.
- `lib/ali/history.ts` — `recordPresentation()` gained an optional `source` parameter, defaulting to `"adaptive_mock"` (zero behaviour change for every existing caller); Wave 2 passes `"practice_experience"`, reusing `ali_student_question_history.source`'s own designed-in openness rather than adding a new write path.
- `types/ali/questionBank.ts` — `WritingPrompt` added to `BankQuestion.prompt`'s union (additive; Continuous Writing had no prompt shape at all before this).
- `app/learning-intelligence/page.tsx` — one new "Practice now" call-to-action, completing the mission's own UX flow diagram (Dashboard → Select practice area).

**Reuse, not rebuild:** the entire "Updated learner profile → Updated readiness → Recommendations" segment of the journey is Wave 1's own `CompetencyProfile`/`EvidenceProfile`/`DiagnosticOverview`/`ReadinessSummary`/`RecommendationSummary` components, unchanged, fed by Wave 1's own `fetchLearnerIntelligenceProfile()`. Zero new UI was built for that half of the journey.

**Vocabulary — formally BLOCKED, not built, not silently dropped:** see Section 4.

## 2. Verification Results

- **TypeScript:** `npx tsc --noEmit` — clean throughout (checked after every file added).
- **Build:** `npm run build` — clean, 40/40 routes generated, both new routes registered (`/learning-intelligence/practice` static, `/learning-intelligence/practice/[area]` dynamic).
- **Lint:** 2 errors, both confirmed to be the **same pre-existing patterns** already present elsewhere in this codebase, not new defect classes:
  - `react-hooks/set-state-in-effect` on `app/learning-intelligence/page.tsx` — identical to the already-flagged Wave 1 finding, itself matching `/dashboard` and `/parent`.
  - `react-hooks/purity` (`Date.now()` called during a `useRef` initializer) on the new `[area]/page.tsx` — confirmed, by linting it directly, to be the exact same pattern already present in `app/mocks/adaptive/maths/page.tsx:91` (`sessionIdRef = useRef(\`adaptive-maths-${Date.now()}\`)`), which this new page's session-ID generation deliberately mirrored.
- **Pure-function tests** (throwaway `npx tsx` script, deleted after use, per this project's established convention): 21/21 checks passed — `checkMathsAnswer()` against every real answer format in the content set (plain integers, mixed fractions, decimals, currency, percentages, the `mth-006` semicolon-compound answer, its wrong-first-part rejection), `scoreEnglishAnswer()`'s full-marks-only correctness rule, and `PRACTICE_AREAS` confirming exactly 3 areas with no Vocabulary entry.
- **Runtime — live browser verification, not just code review:** Claude-in-Chrome was unavailable again this session; used the same Playwright/Chromium fallback as Wave 1. Network responses were mocked at the browser layer with a **stateful** in-memory store (not just fixed responses) so the post-session profile re-fetch genuinely reflects what the session just wrote — this caught and fixed two real mock-harness bugs during verification (documented below as a methodology note, not an app defect): the mock's `ali_question_bank` handler initially only matched `fetchQuestionBank`'s subject-filtered query shape and returned nothing for `fetchAllQuestionTypeExposure`'s cross-subject query; the mock's history GET handler initially returned all rows unfiltered, which would have made `recordOutcome`'s real `.maybeSingle()` call throw silently for a multi-row result on `question_id`-tagged fetches. Both were mock-harness defects, not application defects; both are now fixed, and the surviving result is the console-error/warning-free run described below.

  **All three areas run start-to-finish with zero console errors or warnings**, confirmed for each: intro → Start → answer every activity → per-activity feedback (model answer / working steps / LLM writing feedback, mocked) → results screen showing the freshly-updated Competency Profile, Evidence Profile, Diagnostic Overview, Readiness, and Recommendations. Spot-checked the computed output against the engine's own rules by hand for each run (e.g. Reading Comprehension: 2 correct answers on QT-RC-03/QT-RC-05 correctly produced RC-02 and RC-03 both at **Demonstrated/ET-1 ("Indicative")**, landing in both **Emerging Skills** and **Low Confidence Areas** simultaneously — exactly the dual-bucket behaviour `LEARNING_ENGINE_V1.md` §4 specifies and Wave 1 already verified in isolation; Mathematics correctly evidenced MR-01/MR-02; Continuous Writing correctly evidenced WC-01 only, with WC-02 correctly remaining a permanent coverage gap, consistent with Wave 1 Finding 2). Recommendations correctly fired **Practice** only (never **Consolidation**, since none of the demonstrated competencies reached ET-2 in a single session) — matches `recommendations.ts` exactly.
- **Mobile responsive:** confirmed at 390px viewport on the area-selector page — single column, cards stack cleanly, bottom nav intact, no overflow.
- **Dashboard integration:** the new "Practice now" call-to-action renders correctly on `/learning-intelligence`, prominent and correctly linked.

## 3. Educational Verification

Every Question Type tag below is this work package's own reasoned judgement — disclosed here in full so it can be reviewed, not treated as settled. All 18 rows checked programmatically: every `skill` value is one of Assessment Brain's real 27 Question Type IDs, every implied competency is one of the real 13.

| Content ID (real, existing) | Assessment Brain Question Type | Competency | Basis |
|---|---|---|---|
| eng-001-q2 | QT-RC-03 | RC-03 | Direct word-meaning-in-context question ("What does 'frantic' tell us…") |
| eng-001-q3 | QT-RC-10 | RC-02 | Asks for the effect of a specific literary technique (personification) |
| eng-002-q1 | QT-RC-05 | RC-02 | Requires citing evidence + explaining significance |
| eng-002-q3 | QT-RC-05 | RC-02 | A quotation is given verbatim and explained |
| eng-003-q3 | QT-RC-08 | RC-01 | Explicit "find three specific examples" instruction |
| mth-002, mth-004, mth-008, qa-008 | QT-MR-01 | MR-01 | Direct arithmetic (incl. fractions — Assessment Brain has no separate fractions type) |
| mth-006 | QT-MR-05 | MR-02 | Sequence/nth-term rule application |
| mth-003, mth-009 | QT-MR-07 | MR-03 | Geometric reasoning via formula (perimeter→area; cylinder volume) |
| mth-010, mth-007b | QT-MR-04 | MR-04 | Percentage / ratio-as-proportional-reasoning |
| mth-005 | QT-MR-13 | MR-04 | Per-unit value scaled by quantity — closest fit, not a perfect one |
| mth-001 | QT-MR-10 | MR-04 | Elapsed-time word problem |
| qa-010 | QT-MR-11 | MR-05 | Number-property reasoning (LCM) |
| wrt-003 | QT-WC-01a | WC-01 | Persuasive/discursive argument — closest real fit to "reflective/discursive prompt" |

**Judgement calls flagged explicitly, not smoothed over:**
- **mth-003** mixes an algebraic setup (solve for width) with a geometric answer (area) — tagged by dominant tested construct (the perimeter/area relationship), per this project's existing "one primary competency by dominant skill" convention (ALI Decision 34), not a new rule invented for this pass.
- **mth-005/mth-007b/mth-001** (word problems) have no perfect Assessment Brain match — Assessment Brain's Mathematics Question Types are format-specific (percentage, elapsed-time, best-value) rather than generic "word problem," so each was matched to its closest real format rather than left untagged.
- **wrt-003 → QT-WC-01a** is a reasoned fit (discursive/persuasive argument), not a certainty — Assessment Brain's own description is "a reflective/discursive question," and a persuasive speech is discursive but not identically reflective.

**Honest coverage gaps — deliberately not force-fitted:**
- **RC-04 (Sequential Ordering) has zero content**: no existing Reading Comprehension question asks for chronological/sequential reordering.
- **QT-WC-01b (Picture-Stimulus Narrative) has zero content**: none of Angel's 4 existing writing prompts use an actual picture stimulus — tagging a text-only prompt as picture-based would misrepresent it.
- **MR-06 / QT-MR-14 (Precision Under Exact-Match) has zero dedicated content**: Assessment Brain itself calls this Question Type "cross-cutting" rather than a standalone format, so no single question is a clean, non-arbitrary fit.
- **WC-02 has zero mapped Question Types at all**, per Wave 1 Finding 2 — unchanged, structurally unfillable by any content-authoring pass under the current Assessment Brain catalogue.

**Vocabulary — formally BLOCKED.** Assessment Brain V1 defines no Vocabulary competency: `ASSESSMENT_BRAIN_V1.md` §3 explicitly states "Vocabulary" was evidence-checked and deliberately not created as a standalone domain (AEP-003 Principle 3). Building a Vocabulary practice area that "connects every completed activity to the Learning Engine" (the mission's own requirement) would require inventing a competency the frozen Brain does not define — a direct violation of the mission's own "no invented educational logic" rule. This is the same category of refusal this programme has made repeatedly (AEP-002's CSSE-papers block, AEP-003's declined Vocabulary/MR-06 domains) — flagged, not worked around. Vocabulary practice continues to exist elsewhere in the app (the Learn hub, the ALI adaptive vocabulary mock) — only the new Assessment-Brain-driven connection is blocked.

**Correctness checkers — reused, not invented, per the mission's "no arbitrary scoring" rule:**
- Reading Comprehension and Mathematics reuse the app's own existing graders **verbatim** (keyword-heuristic marks scoring; numeric/string exact-match including the semicolon-compound-answer special case).
- Continuous Writing reuses the existing `/api/writing-feedback` LLM grader unchanged. The boolean correctness threshold (`overallScore >= 70`) is **not an arbitrary number** — it is the grader's own existing system prompt's documented "Strong" band boundary (`route.ts`'s scoring guide: "70-84: Strong" vs "55-69: Developing"), reused rather than invented. It is still a first-pass calibration, flagged for Founder review (Section 5), not a validated cut score.

## 4. Known Limitations

1. **Nothing in this Wave can be verified against real production data — the same category of blocker as Wave 1, now confirmed wider.** Fresh live tests this session against `https://agxunwcdatosrmzhhuxj.supabase.co` show:
   - `ali_question_bank` / `ali_student_question_history` still do not exist as tables (migrations 004-007, and now 013, unapplied).
   - `profiles` INSERT still returns the RLS violation Wave 1 found and PR-001 (migration 012) addressed — **that migration has also not been applied**.
   - **New this session: `user_stats` and `lesson_progress` INSERT are ALSO currently blocked by the identical RLS error**, confirmed by direct testing. This matters for Wave 2 specifically because its legacy XP/streak bridge (`completeLesson()` → `syncLessonComplete()`) writes to exactly these two tables — meaning even the backward-compatible dashboard/XP sync this Wave deliberately preserved will currently fail silently in production, exactly as it already does for every other page's background sync.
2. **A fuller, pre-existing operational history of this exact defect was found this session, not previously known to this account**: `docs/operations/PROFILES_RLS_INVESTIGATION.md` and `RESTORE_PRODUCTION_VALIDATION.md` (both already committed, dated 2026-07-03, Phase 5B.6/5B.7) show the founder **already ran `ALTER TABLE public.profiles DISABLE ROW LEVEL SECURITY` once**, validated it working end-to-end (Vocabulary practice completed, XP/mission engine updated correctly), and separately flagged `user_stats`/`lesson_progress` as needing the identical fix. **RLS has since been silently re-enabled on `profiles` again** — confirmed by this session's own fresh test showing the 401 has returned. This is a real, recurring pattern (something keeps re-enabling RLS on these tables outside of any migration file) worth investigating as its own operational question, independent of which one-off fix is chosen. Worth noting: PR-001's approach (permissive policies, RLS left *on*) may be more resilient against this exact recurrence than Phase 5B.7's "just disable RLS" — which has already been silently undone once — though this is an observation for the Founder to weigh, not a claim this was foreseen.
3. **The "Practice" naming tension is mitigated, not resolved** (Section 1) — the word appears twice in the UI (existing Reasoning nav item, this feature's breadcrumb) in two different senses.
4. **The 18-row illustrative content set is real content, provisionally tagged** — not a subject-matter-reviewed production hand-tagging pass. Every mapping is disclosed in Section 3 for exactly this reason.
5. **Single-session evidence is necessarily thin** — a learner completing one practice session will typically see ET-1 ("Indicative") results, not higher tiers; this is the honest, correct behaviour of the model, not a defect, and Wave 1's own Finding 3 (single-Question-Type competencies can reach ET-4 directly) remains an open, unresolved question this Wave did not need to re-litigate.
6. **Full interactive verification with a real signed-in account and real persisted history was not possible** — same constraint as Wave 1, for the same reasons (no production database access from this account).

## 5. Founder Actions

1. **Apply migrations 004→013 in order**, via the Supabase Dashboard SQL Editor (this account cannot do this — no CLI/service-role access to this project, confirmed again this session).
2. **Resolve the `profiles`/`user_stats`/`lesson_progress` RLS question as one decision, not three** — choose between: (a) disable RLS on all three, matching Phase 5B.7's already-validated approach and this repo's own long-documented intent, or (b) extend PR-001's permissive-policy approach (migration 012) to `user_stats`/`lesson_progress` too. Given RLS has already reverted once under approach (a), consider whether (b) is the more durable choice — but this is a product/security decision for the Founder, not a foregone technical conclusion.
3. **Review the Question Type tagging judgement calls in Section 3** — particularly mth-003, mth-005/007b/001 (word-problem-to-Question-Type fits), and wrt-003 (QT-WC-01a) — before treating this content set as anything beyond illustrative.
4. **Calibrate or confirm `WRITING_CORRECTNESS_THRESHOLD = 70`** — reused from the existing LLM grader's own band language, not independently validated as a pass/fail cut score for Learning Engine purposes.
5. **Decide whether the "Practice" naming tension (Section 1/4) needs a further fix** (e.g. renaming the existing Reasoning nav item) or is acceptable as-is now that this feature is clearly sub-scoped under Learning Intelligence.
6. **Before Wave 3**: decide whether the illustrative content set should be replaced by a real hand-tagging pass (mirroring the still-outstanding VR/Maths/English hand-tagging work from the ALI programme) before more practice areas or more activities are added.

## 6. Acceptance Recommendation

**The code is ready and genuinely verified working end-to-end; the production environment is not.** Every one of the mission's six requirements (Start session, Complete activity, Record learner evidence, Update competency evidence, Update readiness, Display updated learner profile) was demonstrated live, for all three in-scope practice areas, with the computed output checked by hand against `LEARNING_ENGINE_V1.md`'s own rules and found correct. TypeScript, build, and pure-function tests are clean; the two lint findings are confirmed pre-existing patterns, not regressions. Vocabulary was correctly refused rather than faked.

Recommend **NOT** deploying until: (a) migrations 004-013 are applied, and (b) the `profiles`/`user_stats`/`lesson_progress` RLS question (Section 4/5) is resolved as one decision — as built today, this Wave would be exactly as invisible to real anonymous users as Wave 1 was, for the same underlying infrastructure reason, now confirmed to extend to two more tables. Recommend the Section 3 tagging judgement calls and the Section 5 Founder Actions go to the Founder as a short decision list before Wave 3.

Per the mission: committed locally, pushed to GitHub, **not deployed** — awaiting independent review.
