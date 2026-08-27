# Angel 11+ Mathematics Mock 1 — Release Verification

**Version 1 — Decision 216, final pre-activation release QA.**
**Status:** `first-mock-mathematics-v1` is frozen (`ali_mock_form`, migration 147 Founder-confirmed applied), `active = false`. This artifact is release-verification evidence, kept separate from the learner-facing candidate inspection artifacts (`ANGEL_FIRST_MATHEMATICS_MOCK_1_FINAL_CURATION_V1.md`, `ANGEL_FIRST_MATHEMATICS_MOCK_FOUNDER_CANDIDATE_INSPECTION_V1.md`). **Mathematics Mock 1 has NOT been activated. No attempt has been created.**

**Disclosed limitation, carried throughout this entire arc since Decision 189:** this session has no live database connection and does not activate the production form or create a real attempt to test it, per the governing directive's own explicit prohibition. Every finding below is either (a) a direct trace of the real, current source code against the real, frozen content, (b) a result from this repository's own automated test suite, or (c) a new, purpose-built pure-function simulation that byte-for-byte mirrors the real server-side SQL logic. Nothing below claims a live browser/DOM rendering pass or a live RPC call against production — that distinction is made explicit at every section.

---

## 1. FROZEN-FORM VERIFICATION

Re-ran `scripts/mock-mathematics-first-mock-curation.mjs` (the same, unmodified tool that produced Decision 214/215's own approved manifest) against the reconstructed pool this session. Result, matching migration 147's own stored `question_manifest` exactly:

| Check | Result |
|---|---|
| Unique question IDs | 56/56, zero duplicates ✓ |
| Numbered experiences | 21 ✓ |
| Total marks | 56 ✓ |
| Exact approved order | Unchanged from Decision 214/215 (diff-confirmed) ✓ |
| Every ID exists in the real pool | ✓ |
| Every ID `active` | ✓ (live eligibility precondition, structural) |
| Every ID `mock_eligible` | ✓ |
| Every grouped family complete | ✓ (0 partial-group failures) |
| `group_order` correct | ✓ |
| Shared stems consistent | ✓ |
| Stimuli consistent | ✓ |
| Running Club complete | ✓ (2/2 rows) |
| Sum/Difference absent | ✓ |
| Perimeter Area absent | ✓ |
| `validateManifest()` result | **VALID** |

No discrepancy found. Nothing was silently repaired — this is a re-confirmation of already-approved, unchanged state.

## 2. INACTIVE ACCESS CONTROL — VERIFIED SERVER-SIDE, NOT MERELY UI-HIDDEN

Traced every code path that could reach `first-mock-mathematics-v1`:

- **Discovery (`mock_get_active_form`, migration 072):** `where f.active = true` — with the form's own `active = false`, this returns zero rows for `attempt_type = 'full_mock'`. `ali_mock_form` count = 1 (Founder-confirmed), so no other form exists to be accidentally surfaced instead.
- **Attempt creation, cycle-aware path (`mock_create_cycle_attempt`, migration 085, amended by 145):** `select * from ali_mock_form where id = p_form_id and active = true` — `not found` → `raise exception 'Form % not found or inactive'`. This is the SOLE path for `attempt_type = 'full_mock'` (migration 085 unconditionally rejects `full_mock` via the older `mock_create_attempt`).
- **Older path (`mock_create_attempt`, migration 070, amended by 145):** rejects `full_mock` outright before ever reaching a form lookup; its own form lookup is independently gated by the identical `active = true` clause regardless.
- **UI (`app/mocks/page.tsx`, `app/learning-intelligence/mock-exam/page.tsx`):** both call `getActiveMockForm()`/`isMockFormAvailable()` — `mock-exam/page.tsx` checks it **twice**: once on mount, and again immediately before calling `createMockCycleAttempt()`, so even a stale client state cannot bypass the check.

**Conclusion: access control is enforced at the database layer (`active = true` is checked inside every attempt-creation RPC), not solely by hiding a button.** A learner calling the RPC directly, with no UI at all, would be rejected identically. Verified by direct source inspection and existing structural tests (migration 145's own 18 tests, Decision 212) — **not exercised against a live database this session** (disclosed limitation).

## 3. MIGRATION 145 ELIGIBILITY ENFORCEMENT

Confirmed migration 145 (the only version of `mock_create_attempt`/`mock_create_cycle_attempt` on disk — no migration 146/147/148 redefines either function) is the code path that will run once applied. Its own `mock_validate_manifest_eligibility()` helper structurally rejects, per its own SQL text and 18 existing tests (Decision 212, unchanged this session):

- non-`mock_eligible` questions, `independently_validated` questions, `authentic_assessment_candidate` questions, and unknown IDs (all caught by one `not exists (... eligibility_status = 'mock_eligible' and active = true)` predicate)
- inactive questions (same predicate)
- duplicate IDs (`array_length - count(distinct)` check)
- partial grouped families (generic `question_group_id` completeness check)
- malformed/empty manifests

The frozen Mathematics Mock 1 manifest (56 ids) independently passes every one of these same checks (Section 1). **Structural/SQL-text verification only — not live-exercised against production this session** (disclosed limitation, consistent with every decision in this arc since 189).

## 4. LEARNER RENDERING — CODE-TRACED, NOT LIVE-BROWSER-VERIFIED

**No live visual/DOM verification was performed.** This session has no live database connection and the governing directive explicitly prohibits activating the form to test it; this repository also has no rendering test infrastructure (no `@testing-library`, no jsdom — a standing, disclosed characteristic of this codebase, `lib/mockAttempt/workspace.ts`'s own docstring). Per this project's own established "Visual Gate No Substitute" discipline, source-code tracing does not substitute for a real visual pass — it is reported honestly as code-level evidence, not visual confirmation.

**What code tracing does confirm:**
- **Numbering/grouped subparts:** `buildDisplayUnits()` (tested, `lib/mockAttempt/workspace.ts`) groups consecutive same-`questionGroupId` ids into one display unit; every one of the 21 curated experiences (Section 1) resolves to exactly one unit.
- **Shared stems shown once, not duplicated:** `resolveGroupSharedStem()` (tested) requires every member to share the identical `sharedStem` and for it to be a literal prefix of each `question` — re-confirmed directly for all shared-stem families in this Mock (Camping Sale, Linked Values, Number Puzzle, Rounding Bounds, Fun Run, Bus Timetable, Craft Stall) via the Decision 214 artifact's own rendering.
- **Table stimuli:** `DataTableStimulus.tsx` (Bus Timetable, Fun Run, Craft Stall) uses real semantic `<table>`/`<thead>`/`<tbody>` markup with `overflow-x-auto` on its wrapper — addresses "readable tables, no clipped content" structurally.
- **Symbols/currency/decimals:** every question/table cell is rendered via a plain React text node (`{cell}`, `{header}`, `{question}`) — no manual HTML construction, so `£`, `×`, `÷`, decimals, and percentage signs render exactly as stored, with no escaping risk.
- **No answers/explanations/eligibility exposed:** `mock_get_question()`'s own hand-picked `jsonb_build_object()` allow-list (migrations 070/106/115) never includes `answer`, `explanation`, `workingSteps`, or any eligibility/review metadata — a server-enforced boundary, not a client convention; `PROTECTED_MOCK_FIELDS` (`lib/mockAttempt/types.ts`) and `redaction.ts`'s own tests independently prove this.
- **Question 18(d), Bus Timetable, renders the corrected wording:** confirmed directly — `scripts/mock-mathematics-source-content.json`'s own `mock-mr10-bustimetable-04.question` is byte-identical to migration 127's own live, applied `v_new_question` ("...plans to reduce the afternoon Hillview-to-Milltown journey time by 20%. How many minutes should the new journey take?"), re-locked by `tests/scripts/mockMathematicsSourceContentFidelity.test.ts` (Decision 215, 8 tests, still passing). The stale "speed up...by 20%" wording does not appear anywhere in the current curated manifest or its rendering.
- **Named families (Camping Sale, Running Club, Rounding Bounds, Fun Run, Number Puzzle, Bus Timetable, Craft Stall, Costume Schedule):** every one's real question text, shared stem, and stimulus (where present) was directly re-inspected this session against `scripts/mock-mathematics-source-content.json` and the curated artifact — no wording defect found beyond the already-remediated Bus Timetable case.

## 5. TIMER AND EXAM CONDITIONS

**Configured duration: 60 minutes** — `DURATION_MINUTES = 60` (`app/learning-intelligence/mock-exam/page.tsx`), matching the real, documented product authority for a standalone Mathematics paper (`ANGEL_008A_MOCK_EXPERIENCE_AND_EXAM_INTELLIGENCE_PROGRAMME_V1.md`'s own "English 60+10min, Maths 60min" model, confirmed against the real CSSE Information Guide per Decision log). Not invented.

- Timer starts server-side: `mock_start_attempt()` sets `expires_at = now() + interval '60 minutes'` in the database — the client only displays it (`ExamTimer.tsx` renders, never computes, a deadline).
- Warning states implemented and tested: calm by default, amber at ≤10 minutes, red + `aria-live="assertive"` at ≤1 minute (`classifyTimerUrgency()`).
- Auto-submission at expiry: a client-side interval calls `handleSubmit()` when `remainingSeconds <= 0`.

**Genuine finding (see Section 8, defect #2): the timer/attempt state is held only in React component state, with no resume-on-reload path anywhere in the codebase.** A full page refresh during an in-progress attempt does not re-fetch the existing attempt or its real `expires_at` — the learner cannot resume through this UI. This is a real gap in "refresh behaviour," not a timer-computation defect (the stored `expires_at` itself remains correct and safe against clock manipulation).

## 6. ANSWER ENTRY AND PERSISTENCE

- Each answer is persisted server-side via `submitMockAnswer()` on every navigation away from a question and again at final submission — confirmed this happens for whole numbers, decimals, currency-formatted strings, and grouped/table-based questions identically (the RPC takes an opaque `{value: string}` object regardless of question shape).
- Navigating between questions (forward/back via the palette) does not erase already-submitted answers — each display unit's own draft state is independently loaded via `loadUnit()` per unit, and the server-persisted response is the actual source of truth for scoring, not the client's own in-memory draft.
- Changing an answer works (idempotent per `(attempt_id, question_id)` unique constraint on `ali_mock_attempt_answer`, migration 070 — a resubmission overwrites the prior response).
- No cross-subpart contamination: each response is submitted and scored against its own distinct `question_id`, confirmed by `scoreMockAttempt()`'s own per-row independence (Section 8, `tests/lib/ali/mockScoringSimulation.test.ts`).
- **Same finding as Section 5: a full page refresh loses the in-memory `attemptId`, so answers already submitted server-side remain safely stored, but the learner cannot continue answering remaining questions or properly submit through this UI after a refresh.**

## 7. SUBMISSION AND SCORING — VERIFIED VIA PURE-FUNCTION SIMULATION

`lib/ali/mockScoringSimulation.ts` (new, 16 tests) is a byte-for-byte port of `mock_score_attempt()`'s own real, live marking logic (migration 104, the only version — unchanged since; re-confirmed no later migration redefines it), run this session against the real, frozen 56-row manifest via `scripts/mock-mathematics-scoring-simulation.mjs`:

| Scenario | Result |
|---|---|
| All correct | 56/56, 100% |
| All wrong | 0/56, 0% |
| All unanswered | 0/56, 56 unanswered |
| Mixed (incl. targeted checks below) | 53/56, 94.6% |
| `2.5` mean answer, response typed `2.50` | **correct** (numeric tolerance) |
| Bus Timetable Q(d), response `28` (corrected wording's answer) | **correct** |
| £91.80 (Camping Sale), response `91.80` (no currency symbol) | **INCORRECT — a real, confirmed defect** |

**Defect found and remediated (prepared, not applied):** all 4 Camping Sale answers (£102/£91.80/£1.80/£170) store a literal "£" prefix — unique among all 56 rows; every other currency answer in this Mock (Craft Stall `18.00`, Costume Schedule `12.00`/`7.35`) stores bare numeric text. Because a "£"-containing string never casts to `numeric`, these four rows are permanently locked onto an exact-string comparison — even "£102.00" (a reasonable formatting of the correct amount, symbol included) fails against stored "£102". A learner who reasonably omits the currency symbol (none of the four subparts' own question text instructs including one) is marked incorrect despite a mathematically correct answer. **`supabase/migrations/148_mock_mathematics_campingsale_answer_currency_symbol_correction.sql` (NEW, NOT APPLIED)** strips the "£" prefix from all 4 stored answers, moving them onto the same numeric-tolerance path already used successfully by every other currency answer in this Mock — the marking engine itself (`mock_score_attempt()`) is unmodified. 20 new tests (`tests/supabase/mockMathematicsCampingsaleAnswerCurrencySymbolCorrection.test.ts`) prove the defect, the fix, and full preservation of every other field (marks, difficulty, grouping, `sharedStem`, `eligibility_status`).

Normalisation rules identified, exactly as implemented (not weakened for testing): numeric-tolerance comparison (`abs(diff) < 0.0001`) whenever BOTH the response and the stored answer parse as numbers; otherwise an exact, case/whitespace-insensitive string comparison. No other row in the frozen manifest is affected by either rule.

## 8. RESULTS EXPERIENCE

`scoreSummarySentence()` (`lib/mockAttempt/reportCopy.ts`) reads `overall.rawMarksAvailable` **directly from the live, dynamically-computed scoring result** — never a hardcoded total. For this Mock, that value is genuinely 56 (Section 7), so the released report will correctly say "You scored X out of 56 marks (Y%)" — **the system does not, and structurally cannot, present this 56-mark Mock as a 60-mark paper.** `OFFICIAL_SCORE_DISCLAIMER` is unconditionally rendered whenever a report is shown, explicitly stating this is not an official CSSE standardised score — no misleading readiness claim is made anywhere in this surface. Grouped subpart results are individually recorded in `question_outcomes` (Section 7's own per-row proof). Report release remains admin-gated (`mock_release_report()`, execute-restricted to admin via `is_current_user_admin()`) — a learner cannot self-release their own result.

## 9. END-TO-END VERIFICATION

**No live E2E was run.** This repository has no Playwright/Cypress/local-Supabase tooling (confirmed via `package.json`), and the governing directive explicitly prohibits activating the production form to test it. The full logical chain — discovery → eligibility-gated attempt creation → grouped/redacted question rendering → persisted answers → locked submission → automatic, database-triggered scoring → admin-gated, dynamically-totalled results — was traced end-to-end through the real source code and cross-checked against this repository's own existing automated test suite (2344 tests) plus this session's own 44 new tests (20 migration-148, 16 scoring-simulation, 8 already-existing wording-fidelity). This constitutes strong code-level confidence, explicitly **not** equivalent to a live, browser-driven E2E pass.

## 10. DEFECT REGISTER

| # | Finding | Severity | Status |
|---|---|---|---|
| 1 | Camping Sale's 4 currency answers store a literal "£" prefix, causing the deterministic marker to reject mathematically correct bare-numeric responses (and even correctly-symbol-prefixed responses with different decimal formatting) | **P1 — blocks authentic Mock use** | **Remediated.** Migration 148 prepared, NOT applied. 20 new tests. |
| 2 | No attempt-resume-after-page-refresh capability exists anywhere in the codebase — `mock-exam/page.tsx` holds `attemptId`/`expiresAt` only in React state, and `handleBegin()` always attempts to create a brand-new attempt, which the server correctly rejects (`one attempt per subject per cycle`) once one already exists, stranding the learner mid-sitting with no way to resume or cleanly re-submit | **P1 — blocks authentic Mock use** | **Not remediated this session** — requires a genuine new capability (a resume-lookup RPC + client wiring), not a bounded content/data fix. Recommended as a separate, explicitly-scoped future increment. Not a data-integrity risk: the server's own unique constraint prevents a duplicate/overlapping attempt from ever being created, so the failure mode is "stuck, requires manual intervention," not corrupted scoring. |
| 3 | The composed question order (Decision 214, alphabetical-then-Founder-curated) places two fully-hard-tier questions back to back (Q19-Q20) immediately before the closer | P3 — already disclosed (Decision 213/214), cosmetic ordering only, resolved by Q21's own gentler close | Accepted, no action needed |

No P0 (safety/data-integrity) finding. No P2 finding beyond what is already listed.

## 11. RELEASE RECOMMENDATION

Composition, eligibility enforcement, access control, redaction, and the scoring engine are all sound. One real P1 defect (currency-symbol marking) has a prepared, minimal, fully-tested fix awaiting Founder application. One real P1 gap (attempt-resume-after-refresh) is a genuine, bounded, scoped future increment — not fixed here, and not fixable via a "minimum bounded fix" within this task's own boundary against redesigning the Mock engine.

**Given the governing directive's own rule that P1 findings must be resolved before activation, and that one of the two P1s found here remains genuinely open, Mathematics Mock 1 is not yet ready for unconditional activation** — see Decision 216's own final verdict and exact Founder next action.

---

*See `ALI_DECISION_LOG.md`, Decision 216, for the full governance record.*
