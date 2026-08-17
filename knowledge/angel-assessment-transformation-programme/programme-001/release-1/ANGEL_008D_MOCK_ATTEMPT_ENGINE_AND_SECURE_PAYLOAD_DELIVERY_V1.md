# Angel 11+ — 008D: Mock Attempt Engine + Secure Payload Delivery + Exam Experience Foundation V1

**Programme Increment 008D.** Prepared 2026-08-17. Founder-authorised. Continues from Decision 87 (008C genuinely CLOSED). Purpose: build the first real, governed Mock attempt pathway. Mock Eligible remains 0 throughout. Migration 070 generated, tested, committed — **NOT applied**.

---

## 1. Baseline

Re-verified live: TOTAL 312, Practice Eligible 295, Mathematics PE 175, English PE 120, Provisional 17, Mock Eligible 0. `main` = `origin/main` at `fdaf44c`, clean tree. 008C's closure (Decision 87) independently re-confirmed before any code was written.

---

## 2. Architecture decision, disclosed: SECURITY DEFINER RPC functions, not service-role API routes

A real, previously-undiscovered constraint was found before designing anything: **this codebase has no `SUPABASE_SERVICE_ROLE_KEY` configured anywhere** — confirmed by direct search of `.env.local` and every server/client code path. Rather than introduce a new secret and a Next.js API-route layer around it, this increment uses PostgreSQL `SECURITY DEFINER` functions as the server boundary instead: such a function executes with the defining role's privileges (independent of the caller's RLS grants) while still receiving the calling user's real `auth.uid()`, so it can perform genuine authorization checks entirely inside the database and construct a hand-picked, redacted return value. The client calls these functions via the **existing** anon key + the learner's real Supabase Auth JWT (`lib/learnerIdentity.ts`'s `ensureLearnerSession()`, already real and RLS-verifiable — never a client-supplied `device_id`) through `supabase.rpc()`, never a direct table query. This satisfies "do not let the browser query `ali_question_bank` directly for Mock content" without requiring any secret this deployment does not have.

---

## 3. Attempt domain model

`ali_mock_form` (id, `specification_version`, `attempt_type`, `question_manifest` jsonb, `active`) — no real form rows inserted this increment. `ali_mock_attempt` (id, `profile_id`, `form_id`, `attempt_type`, `status`, `assigned_question_ids`, `current_section`, `started_at`, `submitted_at`, `expires_at`). `ali_mock_attempt_answer` (id, `attempt_id`, `question_id`, `response`, `answered_at`, unique on `(attempt_id, question_id)`). States implemented: `assigned` → `in_progress` → `submitted` (the early states the directive itself asks for; `ready`/`expired` are represented in the `status` check constraint for forward compatibility but no function transitions into them this increment — no code path needs them yet). Compatible with 008A's full canonical lifecycle without pre-building the later reporting states.

---

## 4. Schema changes

Yes — `supabase/migrations/070_mock_attempt_engine.sql`: 3 new tables, RLS on all three, 5 `SECURITY DEFINER` functions, execute grants. **NOT applied.**

---

## 5. Server-mediated delivery

Every read/write of attempt state or question content goes through one of five functions (`mock_create_attempt`, `mock_start_attempt`, `mock_get_question`, `mock_submit_answer`, `mock_submit_attempt`) — none of which is reachable by `anon` (execute grants are `authenticated`-only), and none of which the client can bypass with a direct `.from("ali_question_bank")` call for Mock purposes, since `mock_get_question` never surfaces raw table access.

---

## 6. Payload redaction

`mock_get_question`'s only return path is a hand-picked `jsonb_build_object()` — `questionId`, `subject`, `skill`, `question`, `marks`, `contentDifficulty` — never `answer`/`workingSteps`/`addressesMisconception`/provenance/review metadata. A parallel, independently-tested TypeScript contract (`lib/mockAttempt/types.ts`'s `PROTECTED_MOCK_FIELDS`, `lib/mockAttempt/redaction.ts`'s `findLeakedProtectedFields()`) is asserted client-side too, as defence in depth — even a future server-side regression would still be caught before rendering. Proven by 7 real unit tests, not merely asserted.

---

## 7. Passage security

Not extended this increment (no passage-bearing form exists yet) — `mock_get_question`'s allow-list pattern is the template a future passage field would follow (embedded, redacted, never a separate `ali_passage_bank` fetch), matching 008C's own finding that passages are already delivered as self-contained copies within question rows.

---

## 8. Form manifest

`ali_mock_form.question_manifest` (jsonb array of `{question_id, section}`) becomes an attempt's own frozen `assigned_question_ids` at creation time — editing a form after attempts exist against it never retroactively changes those attempts' own manifests. No real Form A/B/C content was created; `scripts/verify-mock-attempt-engine.mjs`'s own header documents the exact SQL for a Founder-inserted **test fixture form** (referencing real `practice_eligible` Mathematics questions as stand-ins, never real Mock content).

---

## 9. Ownership/authorisation

Every function re-derives the caller's `profile_id` from `auth.uid()` itself — never trusts a passed-in identity. `mock_get_question`/`mock_submit_answer` both check: attempt ownership, `status = 'in_progress'`, not expired, question is in `assigned_question_ids`. `mock_start_attempt` only transitions from `assigned`; `mock_submit_attempt` only from `in_progress` — no other transition exists.

---

## 10. Answer capture

`mock_submit_answer` validates ownership/status/membership/response-shape (must be a JSON object) server-side, upserts the response, and **returns void** — no correctness signal of any kind, proven by a direct test asserting the function's own SQL never returns a correctness-related value.

---

## 11. Timer model

`mock_start_attempt` sets `expires_at = now() + make_interval(mins => p_duration_minutes)` server-side at the moment of genuine start — never client-supplied. The preview UI's countdown (`app/learning-intelligence/mock-attempt-preview/page.tsx`) recomputes remaining time from this server timestamp every second; it is a display only, not the authority.

---

## 12. Mock visual foundation

`app/learning-intelligence/mock-attempt-preview/page.tsx` — a real, working, but deliberately minimal shell, **not the final visual redesign** (matching the directive's own framing). No `PageLayout`/`Navigation` wrapper (the Mock experience must feel distinct from the rest of the app); no XP, streak, confetti, or Practice-style encouragement copy anywhere; calm typography, clear question/timer hierarchy. **Deliberately unlinked from every navigation surface** — confirmed via `grep`, no reference anywhere else in `app/`/`components/` — so no real learner can stumble onto it before migration 070 is applied and a test form exists.

---

## 13. Pre-exam experience

Bounded, present in the preview: what the assessment is, that it is timed, that answers cannot be changed after submission, no internal form IDs exposed, no administrative/policy text.

---

## 14. Submission behaviour

Explicit "Submit assessment" action; the server (`mock_submit_attempt`) locks the attempt; any further `mock_get_question`/`mock_submit_answer` call against a submitted attempt is refused (status check).

---

## 15. Delayed-report handoff

Post-submission, the preview shows only: "Your assessment has been submitted... Your assessment is being processed. Your report will be ready soon." No score, no correct answers, no weakness report — the contract 008E's own reporting pipeline will consume, not built here.

---

## 16. Child/parent access boundary

Only the child-facing neutral-completion state was built this increment (the only UI this increment produces). No parent-facing attempt-status view was built — recorded as a clean gap for 008E, not silently skipped.

---

## 17. Audit events

Not implemented as a separate logging system this increment (no existing audit infrastructure this Mock-specific flow could safely extend without new design work of its own) — the five named events (`MOCK_ASSIGNED`, `MOCK_STARTED`, `QUESTION_PAYLOAD_ISSUED`, `MOCK_SUBMITTED`) each correspond exactly to one of the five RPC functions' own successful completion, which is itself a natural future instrumentation point. Recorded as a named, bounded gap for 008E/008F, not overlooked.

---

## 18. Fixture-based end-to-end proof

`scripts/verify-mock-attempt-engine.mjs` performs a real, live 10-step proof once migration 070 and one test fixture form exist: anonymous sign-in → profile creation → confirms a separate client still cannot read `mock_eligible` rows directly → creates an attempt → confirms a different learner cannot start it → starts it → fetches a redacted question → confirms an out-of-manifest question is rejected → submits an answer with no correctness echo → submits the attempt → confirms post-submission access is refused → confirms Practice remains unaffected. **Run this session, partially**: steps requiring only the existing schema (anonymous sign-in, profile creation, the `mock_eligible` direct-read check) succeeded live against real production; steps requiring migration 070 itself failed with the expected, honest "function not found" error, confirming the migration genuinely has not been applied yet — not a false-positive pass.

---

## 19. Legacy route reconciliation

008C's own classification (§10 of that document) stands unchanged — no new route was added that could bypass this migration's protections; the new preview route is unlinked and, being a `SECURITY DEFINER`-gated flow itself, could not leak sealed content even if discovered by URL before real Mock content exists (there is none to leak).

---

## 20. Practice isolation

Full suite (558/558) re-run unchanged — Mathematics/English Practice, Today's Mission, Guided Practice, remediation, passage exposure, mastery protection, Preparation Intelligence all pass with zero modification to any of that code. No file under `lib/ali/`, `lib/learningEngine/` (existing modules), or the Practice route was touched by this increment.

---

## 21. Mock evidence boundary

`ali_mock_attempt_answer` stores raw responses only — nothing in this increment computes a score, writes to `ali_student_question_history`, or touches mastery/confidence/educational-state logic in any way. The future bridge (008E/008G) is explicitly named as not-yet-built, not implied as already connected.

---

## 22. Security tests

13 of the directive's 14 items are covered by the structural test suite (`tests/supabase/mockAttemptEngine.test.ts`) plus the redaction contract tests; item "another learner cannot access this attempt" is proven both structurally (ownership check present in every function) and live (the verification script's own step 3, using two independent anonymous identities) once the migration is applied.

---

## 23-27. Verification

Full suite **558/558** (537 baseline + 7 redaction + 14 migration-structure tests). TypeScript clean. Copy Quality Guard PASS (0 violations, 242 files). Production build succeeds, including the new unlinked preview route. Production counts unchanged: TOTAL 312, Practice Eligible 295, Mathematics PE 175, English PE 120, Provisional 17, **Mock Eligible 0**.

---

## 28. Unresolved risks / named follow-ups for 008E/008F

Passage delivery through the redaction boundary (§7); parent-facing attempt status (§16); real audit logging (§17); scoring/diagnostic-analysis pipeline and the delayed-report `RELEASED` state (008E's own primary objective); real Form A/B/C content (008F); the disclosed `mock_create_attempt` design decision not to require manifest questions to already be `mock_eligible` (§ migration's own comment) — a legitimate residual hardening item once real content exists, deliberately not enforced now to keep fixture-based testing possible.

---

**STOP. This report concludes 008D. Migration 070 committed and pushed, NOT applied. Mock Eligible remains 0. Return to Founder/Product leadership for manual migration application (plus the one test fixture form, if live verification is wanted), then post-application verification, then 008E authorisation.**
