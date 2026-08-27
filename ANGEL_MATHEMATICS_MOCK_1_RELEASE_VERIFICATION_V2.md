# Angel 11+ Mathematics Mock 1 — Release Verification (Final Combined Gate)

**Version 2 — Decision 218, final combined production release gate, superseding V1's own "not yet ready" status now that both P1 findings are closed.**
**Status:** `first-mock-mathematics-v1` is frozen, `active = false`. Migrations 147, 148, and 149 are all **Founder-confirmed applied**. This is the final activation gate. **Mathematics Mock 1 has NOT been activated. No attempt has been created.**

This artifact supersedes `ANGEL_MATHEMATICS_MOCK_1_RELEASE_VERIFICATION_V1.md` (Decision 216) as the current authoritative status document; V1 is preserved unchanged as the historical record of the original findings. `ANGEL_MATHEMATICS_MOCK_1_RESUME_REMEDIATION_V1.md` (Decision 217) remains the detailed architectural record of the resume capability, referenced here rather than repeated.

---

## EVIDENCE-TIER KEY (used throughout this document)

- **[FOUNDER]** — Founder-confirmed production evidence, accepted as Level-1 evidence per the standing disclosed limitation (no live database access in this environment, unchanged since Decision 189).
- **[CODE]** — direct inspection of the real, current repository source (migrations, application code).
- **[TEST]** — a result from this repository's own automated `node:test` suite.
- **[SIM]** — a pure-function simulation of real, live logic (SQL or application), explicitly not live browser/database evidence.
- **[UNVERIFIED]** — named explicitly wherever something has not been directly checked this session.

---

## 1. RECONCILIATION

**[FOUNDER]** Migration 147 applied: `first-mock-mathematics-v1` exists, `active = false`, `attempt_type = full_mock`, `specification_version = 1`, 21 questions, 56 marks. Migration 148 applied and verified: Camping Sale's four answers are now `102`/`91.80`/`1.80`/`170`, all remain `mock_eligible`/`active = true`/`deterministic`. Migration 149 applied and verified: `mock_get_resumable_attempt(p_form_id text)` exists with no learner-identity argument.

**[CODE]** `HEAD == origin/main`, clean tree, confirmed this session. Decisions through 217 present exactly once each. Migrations through 149 confirmed on disk, none touched by any later migration except as already documented (149 does not redefine any attempt-creation function; no migration after 148 touches Camping Sale's content again).

Per this task's own explicit instruction, migrations 147/148/149 were treated as Founder-confirmed applied and were **not** re-requested from the Founder.

## 2. P1-A CLOSED: CAMPING SALE CURRENCY-SYMBOL DEFECT

**[CODE]** `scripts/mock-mathematics-source-content.json` updated this session to reflect the now-applied migration 148 state (`102`/`91.80`/`1.80`/`170`, matching migration 148's own `v_new_answers` literal exactly) — the local extraction cache was stale (still showing the pre-fix `£`-prefixed values) until this correction, mirroring the exact discipline Decision 215 established for the Bus Timetable wording.

**[SIM]** Re-ran `scripts/mock-mathematics-scoring-simulation.mjs` (the real, unmodified `scoreMockAttempt()` pure-function port of `mock_score_attempt()`) against the corrected values:

| Test | Result |
|---|---|
| Stored `102`, response `102` | correct |
| Stored `91.80`, response `91.80` (no currency symbol) | **correct** — was incorrect before migration 148 |
| Stored `1.80`, response `1.80` | correct |
| Stored `170`, response `170` | correct |
| Any `£`-prefixed answer remaining anywhere in the 56-row manifest | **zero found** (self-checking script now throws if this regresses) |

`tests/supabase/mockMathematicsCampingsaleAnswerCurrencySymbolCorrection.test.ts` (20 tests, Decision 216) re-confirmed passing — these test the migration's own SQL structure, unaffected by application status. **P1-A: CLOSED.**

## 3. P1-B CLOSED: ATTEMPT RESUME

**[CODE]** Full Decision-217 architecture re-inspected: `mock_get_resumable_attempt(p_form_id text)` — no identity parameter, `auth.uid()`-derived profile scoping, `status in ('assigned', 'in_progress')` only, no INSERT/UPDATE/DELETE. Client wiring (`getResumableMockAttempt`, `getMockAttemptAnswers`, `determineMockResumeAction`, `computeResumeStartIndex`) and `handleBegin()`'s resume-aware flow re-confirmed unchanged and correct.

**[SIM]** New `scripts/mock-mathematics-final-release-gate-simulation.mjs` runs the complete path in one script, using the REAL frozen manifest and REAL current (post-148) answers: discover → start → answer 7 questions (through Camping Sale) → simulate a full refresh → rediscover via `determineMockResumeAction` → **35 of 60 minutes correctly remain** (not a fresh 60) → restore the exact same deterministic position → continue, editing an earlier answer (no duplicate created) → complete all 56 → submit → score → **56/56, 100%**, with Camping Sale and the corrected Bus Timetable answer both individually confirmed correct. All 27 assertions pass.

**[TEST]** `tests/supabase/mockAttemptResumeLookup.test.ts` (20 tests) and `tests/lib/mockAttempt/workspace.test.ts`'s resume-specific tests (12 tests, including two standalone end-to-end simulations) re-confirmed passing. **P1-B: CLOSED.**

## 4. FROZEN MOCK INTEGRITY

**[SIM]** Re-ran `scripts/mock-mathematics-first-mock-curation.mjs` against the current reconstructed pool:

| Check | Result |
|---|---|
| `active = false`, `attempt_type = full_mock`, `specification_version = 1` | Matches migration 147's own literal, unchanged |
| Numbered experiences | 21 |
| Raw rows | 56 |
| Marks | 56 |
| Exact approved curated order | Unchanged (diff-confirmed against Decision 214/215/216's own captured output — only the Camping Sale answer VALUES and Bus Timetable wording differ, both intentional, both already-applied corrections) |
| Running Club | Present, complete (2/2) |
| Sum/Difference | Absent |
| Perimeter Area | Absent |
| All question IDs valid, active, mock_eligible | Confirmed via `validateManifest()` = VALID |
| Grouped families complete | Confirmed, zero partial-group failures |
| Duplicate IDs | Zero |
| Manifest mutation since freeze | **None** — migration 147's own `question_manifest` stores ids only, never touched by migrations 148 or 149 |

Composition was **not** reopened.

## 5. CONTENT SOURCE FIDELITY

**[SIM]/[TEST]** Bus Timetable Q18(d) confirmed rendering: *"The bus company plans to reduce the afternoon Hillview-to-Milltown journey time by 20%. How many minutes should the new journey take?"* — the superseded "speed up ... by 20%" wording does not appear anywhere in `scripts/mock-mathematics-source-content.json`, the curated candidate output, or the learner-facing artifact. `tests/scripts/mockMathematicsSourceContentFidelity.test.ts` (Decision 215, 8 tests) re-run and confirmed still passing, unaffected by this session's Camping Sale changes. `ANGEL_FIRST_MATHEMATICS_MOCK_1_FINAL_CURATION_V1.md`'s own audit table (§5) updated this session to show the corrected Camping Sale answer values, with an explicit correction disclosure added to its header (the same pattern Decision 215 established) — the learner-facing question text in that artifact was never affected, only the internal answer format.

## 6. INACTIVE ACCESS BOUNDARY

**[CODE]** Re-confirmed unchanged from Decision 216/217: `mock_get_active_form()` (`where active = true`) hides the form from discovery; `mock_create_cycle_attempt()`/`mock_create_attempt()` (migration 145, the only version on disk — migration 149 does not redefine either) independently gate their own form lookup on `active = true`, rejecting with "Form not found or inactive" regardless of caller (UI, direct RPC, or any crafted client request) — this is a database-level boundary, not client-side hiding. Migration 149 adds no new attempt-creation path and does not weaken this in any way; `mock_get_resumable_attempt()` is read-only and never creates an attempt.

## 7. RESUME SECURITY

**[TEST]/[CODE]**, all re-confirmed this session:

| Requirement | Status |
|---|---|
| Identity derives from `auth.uid()` only | Confirmed — structurally, no identity parameter exists |
| No caller-supplied learner ID controls lookup | Confirmed — signature is `(p_form_id text)` only |
| Only caller-owned attempt returned | `where a.profile_id = v_profile_id` |
| Only assigned/in-progress qualify | `status in ('assigned', 'in_progress')` |
| Submitted attempts cannot resume | Structurally excluded by the same predicate; `ResumableMockAttempt`'s own type only permits the two live states |
| Different-form attempts cannot be returned | `and a.form_id = p_form_id` |
| Unknown forms fail safely | Zero rows, never an exception |
| Duplicate attempts prevented | Relies on the existing `ali_mock_attempt_cycle_subject_unique` constraint (migration 085) — unchanged |
| Answer reads RLS-scoped | `ali_mock_attempt_answer_select_own` (migration 070, unchanged) |
| No cross-learner leakage | Confirmed by the same profile_id scoping, both at the RPC and RLS layers |

## 8. TIMER INTEGRITY

**Configured duration: 60 minutes** — `DURATION_MINUTES = 60` (`app/learning-intelligence/mock-exam/page.tsx`), matching the documented product authority for a standalone Mathematics paper (unchanged from Decision 216, not invented).

**[SIM]** Re-confirmed via the combined simulation (§3): starting creates `expires_at` exactly once; resume never restarts it (the resume path only reads it); a simulated refresh 25 minutes in correctly reports 35 minutes remaining, never a fresh 60; repeated resume (tested standalone in `workspace.test.ts`) always resolves to the identical attempt/expiresAt; an expired attempt is routed unconditionally to finalization, never resumed as though time remains; `mock_get_question()`/`mock_submit_answer()` (unchanged, migrations 070/072) independently re-check `now() > expires_at` against the database's own clock on every read/write, so client clock manipulation cannot extend server-authoritative time.

## 9. ANSWER PERSISTENCE AND PREFILL

**[SIM]/[TEST]** Confirmed via `workspace.test.ts`'s own tests and the combined simulation: answering a question then navigating away and back re-displays the existing value (`answeredValuesRef` pre-fill, Decision 217); a simulated refresh reloads all previously-submitted answers via the RLS-scoped `getMockAttemptAnswers()`; unanswered questions remain correctly identified; editing an answer overwrites rather than duplicating (proven explicitly in the combined simulation's Step 6); grouped subparts (Costume Schedule, Camping Sale, Rounding Bounds, etc.) and the table-stimulus families (Bus Timetable, Fun Run, Craft Stall) are all included in the frozen manifest and covered by the same generic, family-agnostic logic — no family-specific code exists to diverge.

## 10. SCORING

**[SIM]**, `scripts/mock-mathematics-scoring-simulation.mjs` and the combined gate simulation, both re-run this session against the real, current 56-row manifest:

- All correct: **56/56, 100%**.
- All wrong: **0/56, 0%**.
- Representative mixed case: scores exactly as expected per row.
- Grouped subparts score independently (`marksAwarded`/`marksAvailable` per outcome, never a shared/blended value).
- `2.5` mean answer accepts `2.50` (numeric tolerance).
- **Camping Sale's corrected numeric answers (`102`/`91.80`/`1.80`/`170`) score correctly with bare-numeric responses — no `£`-prefix dependency remains anywhere.**
- Bus Timetable's corrected wording still expects, and correctly scores, `28`.

Scoring rules (`mock_score_attempt()`) were **not** changed during this gate — no blocker required it.

## 11. RESULTS

**[CODE]**, unchanged from Decision 216, re-confirmed: `scoreSummarySentence()` reads `overall.rawMarksAvailable` directly from the live, dynamically-computed result — **total available marks is genuinely 56**, and the system structurally cannot present this as a 60-mark paper. `OFFICIAL_SCORE_DISCLAIMER` is unconditionally rendered. Question-level and grouped results are recorded per-row in `question_outcomes`. `PROTECTED_MOCK_FIELDS`/`mock_get_question()`'s own hand-picked allow-list (unchanged) ensures no answer/explanation is ever exposed before submission. Report release remains admin-gated (`mock_release_report()`).

## 12. STRONGEST AVAILABLE END-TO-END SIMULATION

**[SIM], explicitly not live browser evidence.** No Playwright/Cypress/local-Supabase tooling exists in this repository (confirmed via `package.json`, unchanged since Decision 216), and the governing directive prohibits activating the form to test it — no new framework was built for this gate, per the directive's own explicit instruction. `scripts/mock-mathematics-final-release-gate-simulation.mjs` is the strongest available seam: one script running the complete logical chain (discover → start → answer → refresh → resume → verify remaining time → restore answers → continue → edit → submit → score) against the real frozen manifest and real current answer data, all 27 of its own assertions passing. This is architecture/logic-level confidence, not a substitute for a live visual/browser pass — explicitly disclosed as such, consistent with this project's own "Visual Gate No Substitute" discipline.

## 13. DEFECT REGISTER (this gate)

No new defect was found. Both of Decision 216's P1 findings are closed. No P0. No P2. No P3 worth naming beyond what Decision 213/214 already disclosed (the Q19-Q20 difficulty-ordering property, already accepted, non-blocking).

## 14. RELEASE READINESS — EXPLICIT ANSWERS

1. **Are both Decision-216 P1 blockers now closed?** Yes — both, independently re-verified this session (§2, §3).
2. **Is the frozen 21Q/56-mark Mock intact?** Yes (§4).
3. **Is inactive access server-enforced?** Yes (§6).
4. **Is resume secure?** Yes (§7).
5. **Is timer integrity preserved?** Yes (§8).
6. **Are answers persisted and restored?** Yes (§9).
7. **Is scoring correct?** Yes (§10).
8. **Are results correct?** Yes (§11).
9. **Are there any unresolved P0/P1 defects?** No.
10. **Would activation now be authorised, if accountable for production release quality?** Yes, subject to the Founder's own final go/no-go — every technical release gate this session and Decisions 216/217 could verify has passed; the remaining decision is the Founder's own commercial/timing judgement, not a further technical blocker.

---

*See `ALI_DECISION_LOG.md`, Decision 218, for the full governance record. See `ANGEL_MATHEMATICS_MOCK_1_RELEASE_VERIFICATION_V1.md` for Decision 216's original findings and `ANGEL_MATHEMATICS_MOCK_1_RESUME_REMEDIATION_V1.md` for Decision 217's full resume architecture.*
