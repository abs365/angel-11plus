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

**STOP. This report concludes 008D's own generation stage. Migration 070 committed and pushed, NOT applied. Mock Eligible remains 0. Return to Founder/Product leadership for manual migration application (plus the one test fixture form, if live verification is wanted), then post-application verification, then 008E authorisation.**

---

## 29. Post-Migration Production Verification (addendum)

Migration 070 was applied by the Founder. Independent verification follows.

### 29.1 Confirmed clean, without any fixture

All 3 tables exist (anon-key probe: `200`, not a "relation does not exist" error). All 5 functions exist (a bare, unauthenticated anon-key RPC call to each reached real application logic — `P0001` exceptions from this migration's own `raise exception` statements — never a PostgREST "function not found" error). `ali_mock_form`/`ali_mock_attempt`/`ali_mock_attempt_answer` all contain exactly 0 rows — no real form, attempt, or answer was created by the migration itself. Production content counts exact match (TOTAL 312/PE 295/Maths PE 175/English PE 120/Provisional 17/**Mock Eligible 0**). `ali_passage_bank` unaffected (still `200`/`[]`). Practice content (Mathematics and English) confirmed fully readable via direct API check. `eligibility_status = 'mock_eligible'` direct-read remains blocked exactly as migration 069 left it. Full suite 561/561 (558 + 3 new), TypeScript clean, Copy Quality Guard PASS, build succeeds.

### 29.2 A real, disclosed finding: anon can invoke the functions (identity check still blocks it)

A bare anon-key call (no `signInAnonymously()`, no real session) to every one of the 5 functions was **not** rejected at the Postgres permission layer — it executed and reached the function's own business logic (e.g. `mock_create_attempt` → "No profile found for the calling user"). This contradicts migration 070's own stated intent ("execute grants are authenticated-only, never anon"). The likely cause: a Supabase-project-level default privilege grant to `anon` on new `public` schema functions, which `revoke all ... from public` alone does not remove (`REVOKE FROM PUBLIC` only removes the PUBLIC pseudo-grant, not an explicit per-role grant made via `ALTER DEFAULT PRIVILEGES`).

**Practical impact, precisely bounded**: this is not a content-exposure or state-mutation defect. `auth.uid()` is `NULL` for a bare anon-key request, so every function's own identity-derivation (`select id into v_profile_id from public.profiles where auth_user_id = auth.uid()`) matches no row for an anon caller — every function fails at its own "no profile"/"attempt not found" check *before* reaching any content or mutation. No anon caller can retrieve a redacted question, submit an answer, or mutate any attempt. This is a least-privilege / defense-in-depth gap, not a bypass of the core security property.

**Hardening migration generated**: `supabase/migrations/071_mock_attempt_functions_revoke_anon.sql` — explicitly revokes execute from `anon` on all 5 functions. Touches no table, no policy, no content. 3 structural tests added, all passing. **NOT applied.**

**Founder evidence requested** (Part D of the query below) to confirm the root cause precisely before treating 071 as necessary versus confirming the grant was never actually present and the P0001 responses have some other explanation.

### 29.3 Item 7 — the one item requiring a fixture

Everything about `mock_get_question`'s redaction is proven **structurally** (14 existing tests assert the exact `jsonb_build_object` field list and the absence of every protected field name in the function body) and via the parallel TypeScript contract (7 tests). What remains unproven is the **live, end-to-end** fact: actually calling the function for a real in-progress attempt and inspecting the real returned JSON. This requires at least one `ali_mock_form` row to exist, since `mock_create_attempt` fails immediately without one — no attempt can be created, so no question can ever be fetched, without a form.

**Exact fixture SQL:**
```sql
insert into public.ali_mock_form (id, specification_version, attempt_type, question_manifest, active)
values (
  '008d-verification-fixture',
  1,
  'diagnostic_mock',
  '[{"question_id":"mr01-mop-01","section":"maths"}]'::jsonb,
  true
)
on conflict (id) do nothing;
```

**Every object this creates**: one `ali_mock_form` row (metadata only — an id, a version number, an attempt type, and a manifest referencing one existing, already-public `practice_eligible` question ID by reference; no question content is duplicated or newly created). If then exercised (e.g. by re-running `scripts/verify-mock-attempt-engine.mjs`), also one throwaway `auth.users` row + one throwaway `profiles` row (created via genuine `signInAnonymously()`, exactly as any real learner's first visit does) and one `ali_mock_attempt`/`ali_mock_attempt_answer` row pair, all owned by that throwaway identity.

**Can it interact with a real learner?** No. The form row is inert metadata. Any attempt created against it is owned exclusively by a newly-created, disposable anonymous identity — never a real learner's account, never touching any real learner's own evidence, progress, or profile.

**Exact cleanup SQL:**
```sql
delete from public.ali_mock_attempt_answer
  where attempt_id in (select id from public.ali_mock_attempt where form_id = '008d-verification-fixture');
delete from public.ali_mock_attempt where form_id = '008d-verification-fixture';
delete from public.ali_mock_form where id = '008d-verification-fixture';
```

**Proof cleanup returns production to its original state**: after this SQL, all three tables return to exactly 0 rows again (verifiable via the same anon-key count queries used in §29.1). `ali_question_bank`'s own `mr01-mop-01` row is never written to at any point — only referenced by ID — so Practice content remains byte-identical throughout, trivially re-verifiable. The one residual, disclosed byproduct: the throwaway `auth.users`/`profiles` row(s) cannot be cleanly deleted via a plain SQL `DELETE` (Supabase Auth users require the Auth Admin API); this is a low-risk, no-PII, already-precedented byproduct (identical to what this increment's own earlier live smoke test already left behind), not a new category of residue.

**The specific verification that cannot otherwise be performed**: confirming, with a real payload actually returned by the live function (not just the SQL text), that `mock_get_question` genuinely omits every protected field for a real question — closing the gap between "structurally proven correct" and "proven to work."

**Founder approval is required before this fixture is inserted. Not inserted this session.**

### 29.4 Verdict (superseded — see §30)

**PASS WITH FINDINGS.** Every item provable without a fixture is clean: tables, functions, identity-derivation, Practice regression, passage security, production counts, zero real Mock content, full regression suite. One genuine, precisely-bounded finding (§29.2) has a generated, tested, not-yet-applied fix. One item (§29.3) awaits Founder approval for a fully-specified, reversible fixture before it can move from "structurally proven" to "live-proven." **008D is not yet described as genuinely closed** — both items should resolve before that claim is made.

---

## 30. Security Hardening Reconciliation (addendum) — a second, real finding

The Founder's own authenticated catalogue evidence (Level 1) proved **two** findings, not one: Finding A (§29.2) was confirmed exactly — `information_schema.routine_privileges` shows `EXECUTE` granted to `anon, authenticated, postgres, service_role` on all 5 functions. **Finding B, new and correctly identified by the Founder's own review**: `ali_mock_form_select_all` grants `anon, authenticated` unconditional SELECT (`qual = true`) on `ali_mock_form` — and that table's `question_manifest` column is the ordered array of real question IDs and section mapping that constitutes the sealed form structure itself.

### 30.1 ali_mock_form schema, classified per column

| Column | Classification |
|---|---|
| `id` | PUBLIC-SAFE (an identifier string) |
| `specification_version` | PUBLIC-SAFE |
| `attempt_type` | PUBLIC-SAFE |
| `question_manifest` | **SEALED UNTIL ATTEMPT** — the exact set, order, and section mapping of a form's question IDs |
| `active` | PUBLIC-SAFE |
| `created_at` | PUBLIC-SAFE |

Migration 070's own original reasoning ("forms carry no question CONTENT themselves, only IDs, so the manifest alone does not leak sealed content") was too narrow — a genuine design error in 008D's own first pass, disclosed plainly, not minimised. Knowing which question IDs are assigned to a form, in what order and section structure, is itself sealed assessment structure, squarely within the anti-memorisation/exposure-protection concern this whole program exists to protect.

### 30.2 Migration 071 — original scope was INCOMPLETE, now revised in place

The original 071 addressed only Finding A. **Classified INCOMPLETE**, per the directive's own instruction, and revised — not superseded by a new migration number, since 071 was never applied and this repository's own established practice already treats an unapplied migration as safely editable in place (the same discipline applied to 007X's own migration 067 reconciliation). The revised 071 now:

1. Revokes execute from `anon` on all 5 functions (Finding A, unchanged).
2. **Drops `ali_mock_form_select_all` entirely** — no replacement SELECT policy for `anon` or ordinary `authenticated` (Finding B).
3. Leaves `authenticated` execute on the 5 functions untouched — each function's own internal ownership/state checks remain the correct enforcement point.
4. Leaves `ali_mock_form_admin_write` untouched — admin content-management access to forms is fully preserved.
5. Leaves `ali_mock_attempt`/`ali_mock_attempt_answer`'s own ownership policies untouched.
6. Leaves `postgres`/`service_role` untouched — the applying/bypass roles, appropriately unrestricted.

### 30.3 Final form access contract

`ali_mock_form` becomes **ADMIN/SERVER ONLY**, mirroring `ali_passage_bank`'s own established precedent (migration 054) exactly — no learner-safe projection was built, because none is currently needed: `attempt_type` already flows back to the client via `mock_start_attempt`'s own return value, and question content already flows one-at-a-time through `mock_get_question`'s own redacted projection. A future learner-facing form title/duration display, if ever wanted, should extend an attempt function's own return value — never a direct table grant. Named for 008E/008F, not built here.

### 30.4 Tests

8 tests (revised from the original 3), covering all 14 items in the directive's own Part 6 list — either structurally (anon/authenticated execute grants, the dropped policy, admin-write left untouched, attempt/answer policies left untouched, function bodies unmodified) or via live production checks (Practice regression, production counts, Mock Eligible = 0).

### 30.5 Verification

Full suite **566/566** (558 baseline + 8 revised migration-071 tests). TypeScript clean. Copy Quality Guard PASS (0 violations, 242 files). Production build succeeds. Production counts re-queried live: TOTAL 312, Practice Eligible 295, Mathematics PE 175, English PE 120, Provisional 17, **Mock Eligible 0** — exact match, zero discrepancy. Practice content (Mathematics) re-confirmed fully readable.

### 30.6 Fixture decision — still required, plan unchanged in substance

The one item genuinely requiring a fixture (§29.3 — live, end-to-end proof of `mock_get_question`'s redaction) remains necessary and unchanged in its exact plan (insert SQL, every object created, real-learner impact assessment, cleanup SQL, post-cleanup zero-row verification) — reproduced below for completeness, now explicitly sequenced *after* migration 071's own application (so the fixture is inserted under the hardened, admin-only `ali_mock_form` policy, via the Founder's own authenticated/owner SQL Editor session, which is unaffected by RLS regardless):

```sql
-- Insert (Founder-run, after migration 071 is applied):
insert into public.ali_mock_form (id, specification_version, attempt_type, question_manifest, active)
values (
  '008d-verification-fixture',
  1,
  'diagnostic_mock',
  '[{"question_id":"mr01-mop-01","section":"maths"}]'::jsonb,
  true
)
on conflict (id) do nothing;

-- Cleanup (after verification is complete):
delete from public.ali_mock_attempt_answer
  where attempt_id in (select id from public.ali_mock_attempt where form_id = '008d-verification-fixture');
delete from public.ali_mock_attempt where form_id = '008d-verification-fixture';
delete from public.ali_mock_form where id = '008d-verification-fixture';
```

Every object created, real-learner impact, and post-cleanup verification method are unchanged from §29.3's own original assessment. **Not inserted this session. Founder approval required.**

### 30.7 Verdict

**PASS WITH FINDINGS.** Both findings from the Founder's own catalogue evidence are now addressed by one revised, tested, not-yet-applied migration. Every item provable without a fixture remains clean. **008D still cannot be described as genuinely closed** until migration 071 is applied and independently re-verified, and the one remaining fixture-gated item is resolved (with Founder approval) or explicitly waived.

---

**STOP. Migration 071 revised in place, NOT applied. No fixture inserted. Mock Eligible remains 0. Return to Founder/Product leadership.**
