# Angel 11+ Mathematics Mock 1 — Attempt Resume Remediation

**Version 1 — Decision 217, Founder-directed bounded remediation of Decision 216's P1 finding.**
**Status:** `first-mock-mathematics-v1` remains `active = false`. This artifact is the dedicated resume-remediation release-verification record, kept separate from `ANGEL_MATHEMATICS_MOCK_1_RELEASE_VERIFICATION_V1.md` (Decision 216's original findings) and the learner-candidate inspection artifacts. **Mathematics Mock 1 has NOT been activated. No attempt has been created.**

**Disclosed limitation, unchanged from every prior release-verification session:** no live database connection exists in this environment, and the governing directive explicitly prohibits activating the production form to test it. Every claim below is either a direct source trace, a result from this repository's own automated test suite, or a new pure-function simulation of the real, live SQL/decision logic — never a live browser or RPC call against production.

---

## 1. ARCHITECTURE

**The resumable-attempt contract, derived from the real schema (never invented):** `ali_mock_attempt.status` permits five CHECK-constraint literals, but direct inspection of every function that writes it (migrations 070/085/104) finds only three are ever actually produced: `'assigned'` (post-create, pre-start), `'in_progress'` (post-start), `'submitted'` (post-submit). `'ready'`/`'expired'` are schema-permitted but structurally dead. An attempt is **resumable** exactly when its own status is `'assigned'` or `'in_progress'` — never `'submitted'`.

**New capability, matching the codebase's own established "narrowly-scoped RPC" pattern (`mock_get_open_cycle()`, migration 107):**
- `supabase/migrations/149_mock_attempt_resume_lookup.sql` (**NEW, NOT APPLIED**) — `mock_get_resumable_attempt(p_form_id text)`, a pure, read-only SECURITY DEFINER function returning the caller's own resumable attempt for a specific form (or nothing).
- `lib/mockAttempt/client.ts` — `getResumableMockAttempt()` (RPC wrapper) and `getMockAttemptAnswers()` (a direct, RLS-gated `.from("ali_mock_attempt_answer")` read — mirroring `getMockAttemptReport()`'s own established precedent, since a learner's own submitted response text is not sensitive content the way `ali_question_bank`'s answer/explanation fields are).
- `lib/mockAttempt/workspace.ts` — `determineMockResumeAction()` (the pure decision function: no-resumable → create new; expired → finalize; never-started → start now; in-progress → resume) and `computeResumeStartIndex()` (deterministic recovery position).
- `types/supabase.ts` — the missing `ali_mock_attempt_answer` table type and `mock_get_resumable_attempt` function type, added so the above type-checks against the real schema.
- `app/learning-intelligence/mock-exam/page.tsx` — `handleBegin()` now checks for a resumable attempt before ever attempting to create one; a new `enterAttempt()` helper is shared by the fresh-start and resume paths; `loadUnit()` now pre-fills a revisited question's draft from an `answeredValuesRef`, fixing a genuinely pre-existing (not introduced by this remediation) gap where navigating back to an already-answered question — even within a single unrefreshed session — always showed a blank field.

## 2. LOOKUP CONTRACT

`mock_get_resumable_attempt(p_form_id text)` takes **only** a form id. No learner-identity parameter exists in its signature — structurally, there is no argument through which a caller could ever supply another learner's identity as an authority. The caller's own `profile_id` is derived exclusively from `auth.uid()` inside the function body, and the query is unconditionally scoped `where a.profile_id = v_profile_id`. An unknown/malformed `p_form_id` matches zero rows — a safe empty result, never an exception. The function performs no `INSERT`/`UPDATE`/`DELETE` of any kind — a failed or empty lookup can never itself create an attempt.

## 3. SECURITY MODEL

| Requirement | How it is met |
|---|---|
| Learner cannot resume another learner's attempt | `where a.profile_id = v_profile_id`, derived server-side from `auth.uid()` only |
| Learner cannot supply another learner ID | The function signature has no identity parameter at all — structurally impossible |
| Unknown attempt lookup fails safely | Zero rows returned, never an exception |
| Completed/submitted attempt is never resumable | `status in ('assigned', 'in_progress')` — `'submitted'` is excluded by the query itself, and `ResumableMockAttempt`'s own TypeScript type only permits the two live states |
| Different-form attempt is never returned | `and a.form_id = p_form_id` |
| Rapid start/resume cannot create duplicates | Relies on the **existing** `ali_mock_attempt_cycle_subject_unique` partial unique index (migration 085) — no new locking added; a concurrent second `mock_create_cycle_attempt()` fails the constraint atomically regardless of any client-side race |
| Repeated refresh cannot reset time | `mock_start_attempt()`'s own precondition (`status = 'assigned'`, unchanged) already makes re-starting an in-progress attempt structurally impossible; `determineMockResumeAction()` never routes an `'in_progress'` attempt back through `start_fresh` |
| Client clock manipulation cannot extend time | `expires_at` is a real, server-computed absolute timestamp; `mock_get_question()`/`mock_submit_answer()` (unchanged, migrations 070/072) independently re-check `now() > expires_at` against the database's own clock on every read/write, never trusting client-supplied time |

## 4. TIMER INTEGRITY

**Resume does not reset the timer.** `expires_at` is set exactly once, by `mock_start_attempt()`, gated by `status = 'assigned'` — already structurally impossible to call twice on the same attempt (its own precondition fails once status has moved to `'in_progress'`). The new resume path for an already-`in_progress` attempt **never calls `mock_start_attempt()` again** — it reads the real, already-set `expires_at` directly from the lookup result. Verified via a full pure-function simulation (`tests/lib/mockAttempt/workspace.test.ts`): starting at `09:00`, expiring at `10:00`, a simulated refresh at `09:20` correctly reports **40 minutes remaining**, not a fresh 60. An expired attempt is never resumed as though time remains — `determineMockResumeAction()` routes it to `finalize_expired` unconditionally, closing it out via the same `mock_submit_attempt()` the existing live countdown already calls at expiry, rather than leaving the learner stuck on a workspace that can never successfully answer anything (since `mock_submit_answer()` would reject the write regardless).

## 5. REFRESH BEHAVIOUR

On a full browser refresh during an in-progress attempt: `handleBegin()` (called again on the learner re-entering the Mock page) discovers the existing attempt via `mock_get_resumable_attempt()`, reloads persisted answers via `getMockAttemptAnswers()`, rebuilds the display-unit list via the existing, unchanged `getMockAttemptManifest()`/`getMockAttemptGrouping()`/`buildDisplayUnits()`, and lands the learner on the first genuinely unanswered display unit (`computeResumeStartIndex()`) — grouped questions are preserved as one unit exactly as before, and a partially-answered group correctly still counts as "unanswered" for recovery-position purposes (proven by test). Since `ali_mock_attempt.current_section` (migration 070) is declared in the schema but never actually written by any function, no new persisted "last visited question" state was invented — the recovery position is derived entirely from already-existing, already-persisted answer completeness, per the governing directive's own "do not add unnecessary state merely for convenience" instruction.

## 6. PERSISTENCE

- Answers already submitted remain submitted — reloaded via a direct, RLS-scoped read (`ali_mock_attempt_answer_select_own`, migration 070, unchanged), never re-derived from client memory.
- Unanswered questions remain correctly identified as unanswered (their id is simply absent from the reloaded answer map).
- Editing an answer overwrites the existing row (`on conflict (attempt_id, question_id) do update`, migration 070, unchanged) — never a duplicate.
- Grouped subparts remain independently keyed by their own `question_id` — no cross-subpart contamination, unchanged.
- No answers leak between attempts or learners — `getMockAttemptAnswers()` is scoped by exact `attempt_id`, further scoped by RLS to the caller's own profile.
- **A genuinely pre-existing gap, found and fixed as part of this remediation, not introduced by it:** `loadUnit()` previously always reset the draft to blank on every navigation, even within a single unrefreshed session, showing no visual trace of an already-submitted answer when revisiting it. `answeredValuesRef` now pre-fills from the learner's own latest known value on every unit load, fixing this for ordinary back/forward navigation and for resume alike, using the same underlying data.

## 7. SUBMISSION SAFETY

- A resumed attempt submits through the unchanged `mock_submit_attempt()` exactly as a freshly-started one does.
- An already-`'submitted'` attempt can never be resumed for further editing — `mock_get_resumable_attempt()`'s own query structurally never returns one (`status in ('assigned', 'in_progress')` only).
- Repeated submission remains safely handled by the pre-existing `mock_submit_attempt()` precondition (`status = 'in_progress'` only) — unchanged by this remediation.
- Scoring remains automatic, server-side, and triggered exactly once by the existing report-init trigger (migration 074) the moment `mock_submit_attempt()` locks the attempt — this remediation never calls or references `mock_score_attempt()`.
- Results remain tied to the correct learner/attempt via the unchanged, RLS-gated `ali_mock_attempt_report` read.

## 8. INACTIVE-MOCK-DURING-ATTEMPT POLICY (Section 9 of the governing directive) — an existing policy extended, not a new one invented

**Question:** if an administrator deactivates a Mock form while a learner already has an in-progress attempt against it, should that learner still be able to resume?

**Answer: yes — extending an already-established, already-documented precedent, not a new policy decision.** Migration 070's own header states explicitly: "the form's own `question_manifest` becomes `assigned_question_ids` at creation time, frozen for this attempt's lifetime **even if the form is later edited**." Consistent with that, `mock_get_question()` and `mock_submit_answer()` never re-check `ali_mock_form.active` for an attempt already in progress — only attempt *creation* checks it. `mock_get_resumable_attempt()` follows the identical precedent: it does not filter on `ali_mock_form.active` at all. A learner with a genuinely in-progress attempt can therefore still discover, resume, answer (subject to the unchanged expiry check), and submit it, exactly as they already could before this remediation existed — deactivation was already proven not to affect an in-progress attempt's own question/answer RPCs. This was not stopped-and-escalated as a fresh Founder policy decision because a real, unambiguous precedent already resolves it; the alternative (blocking resume on an inactive form) would be a *new*, inconsistent behaviour contradicting the function's own sibling functions' already-established design.

## 9. TESTS

- `tests/supabase/mockAttemptResumeLookup.test.ts` — **20 tests**, structural/security proof of migration 149's own SQL (no identity parameter, profile-scoped, status-filtered, race-safety reliance documented, no INSERT/UPDATE/DELETE, correct grants).
- `tests/lib/mockAttempt/workspace.test.ts` — **12 new tests** (25 total in the file): `determineMockResumeAction()`'s full decision table (create_new/finalize_expired/start_fresh/resume_in_progress), `computeResumeStartIndex()`'s recovery-position logic (including partial-group handling), and two full **end-to-end resume simulations**: (1) start → answer → simulate refresh → restore → verify 40 of 60 minutes remain → continue → edit an answer → finalise, entirely via the real, unmodified pure functions; (2) repeated refresh always resolves to the same single attempt, never a duplicate.

## 10. REMAINING LIMITATIONS

- No live database/browser E2E was run — the pure-function simulation is the strongest available evidence in this environment, consistent with every prior release-verification session in this arc.
- Flag state (`mock_set_flag`) is **not** restored on resume — out of scope for this remediation (not required by the governing directive's own persistence checklist, which names answers and position, not flags); a learner resuming will see their flags cleared but their answers intact. Noted, not fixed, to avoid adding unnecessary state.
- The pre-existing `loadUnit()` blank-draft-on-revisit gap (Section 6) is fixed as a necessary part of this remediation, but was not separately requested — disclosed explicitly rather than silently bundled.

## 11. MIGRATION APPLICATION ORDER

`supabase/migrations/149_mock_attempt_resume_lookup.sql` is independent of migrations 147/148 — it neither reads nor writes anything either touches. It depends only on migration 085 (cycle governance) being applied, which the Founder has already confirmed. **Recommended order:** apply 149 whenever convenient relative to 147/148; no ordering constraint exists between them.

## 12. ACTIVATION RECOMMENDATION

The P1 attempt-resume gap identified in Decision 216 has a complete, tested, minimum-scope remediation, ready for Founder application (migration 149) — no new release blocker was found in this session, and no deeper timer/attempt architecture defect exists. This task's own objective is complete. Separately, Decision 216's currency-symbol fix (migration 148) still awaits Founder confirmation of its own application status, per this task's own explicit instruction not to assume it — that item is parallel-tracked, not something this remediation is responsible for closing. Once both migrations are confirmed applied, a final combined release check is the natural next step before activation. See Decision 217's own final verdict.

---

*See `ALI_DECISION_LOG.md`, Decision 217, for the full governance record.*
