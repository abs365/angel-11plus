# Angel 11+ — 008C: Mock Security Foundation + Sealed Content Firewall V1

**Programme Increment 008C.** Prepared 2026-08-17. Founder-authorised. Continues from Decision 84 (008B CLOSED). Purpose: close 008A's own named RLS gap before any Mock content can safely be activated. Migration 069 generated, tested, committed — **NOT applied**.

---

## 1. Baseline

Re-verified live: TOTAL 312, Practice Eligible 295, Mathematics PE 175, English PE 120, Provisional 17, Mock Eligible 0. `main` = `origin/main` at `0d353cd`, clean tree. Full suite 530/530 before any change.

---

## 2. Starting exposure — proven, not restated

Bounded, non-destructive live queries against production (anon key only, SELECT only):

- An unfiltered anon SELECT against a real Mathematics `practice_eligible` row returns its full `prompt` JSONB — `question`, `answer`, `workingSteps` all present, zero redaction.
- Anon can query `eligibility_status = 'provisional'` rows successfully (unreviewed content, though the specific row sampled happened to lack an `answer` field — an English-style prompt shape, not evidence the general exposure doesn't apply to Maths-shaped rows, which the direct test above confirms it does).
- Anon querying `eligibility_status = 'mock_eligible'` is **not rejected** (status 200) — confirming no row-level block exists for that value specifically; it returns 0 rows today only because 0 such rows exist, not because access is denied.
- `ali_passage_bank` **already has no anon/authenticated SELECT policy at all** (migration 054 grants admin SELECT only) — confirmed live (anon query returns `200`/`[]`, the RLS-opaque signature). **No change needed or made to `ali_passage_bank`.**
- 0 rows have a NULL or unexpected `eligibility_status` value — the NULL-safety design decision (§6) is defensive, not compensating for a live problem.

---

## 3. Access-class model

| Class | Should access | Mechanism |
|---|---|---|
| Anonymous public | `practice_eligible`, `provisional` question content (unchanged, pre-existing, out of this increment's scope to alter) | RLS, unchanged |
| Authenticated learner | Same as anonymous today, plus their own real evidence via `ali_student_question_history` (separate table, separate policies, unaffected) | RLS, unchanged |
| Authenticated parent | No direct question-bank access beyond what the learner's own client already has; reports are computed server/client-side from real evidence, never raw sealed content | Unchanged |
| Authenticated admin | Every row, including a future `mock_eligible` one, for content review | `is_current_user_admin()`, reused unchanged (migration 054's own precedent) |
| Server / trusted backend | Everything (service role bypasses RLS entirely) | Unchanged, audited §8 |
| Active Mock attempt | Only the current section's authorised question IDs, never the full sealed form, never the answer/workingSteps before submission | **Not yet built** — the contract this increment defines (§6/§7) for 008D |

---

## 4. Practice access model — unchanged

Practice, provisional, and admin-review read paths are **completely unaffected** by migration 069 — the policy predicate only removes access to `eligibility_status = 'mock_eligible'` rows; every other value is untouched. No move to a server-side Practice boundary was made or is proposed — Practice's existing model (client reads `practice_eligible` content directly, self-marks) is intentional, working, and out of this increment's scope to change.

---

## 5. Sealed Mock access model (contract for 008D)

Row-level: closed to anon/authenticated by migration 069, admin-exempted. Attempt-time: **VALID ACTIVE ATTEMPT + ASSIGNED MOCK FORM + AUTHORISED QUESTION MANIFEST = ONLY THOSE QUESTIONS AVAILABLE** — 008D must implement this via a server-mediated route (API route or server action using the service role), never a client-side Supabase call against `ali_question_bank` for `mock_eligible` rows, since RLS alone cannot express "only the questions belonging to this specific attempt's assigned form and current section." The attempt-time contract (§16 of the directive, minimum shape) is recorded but **not implemented** this increment — no attempts table exists, none is created here (Part 6's own "do not implement the entire attempt engine in 008C unless required for security proof" — it is not required; the RLS row-level gate is independently sufficient proof of this increment's own security improvement).

---

## 6. Answer secrecy — design, not built

Confirmed live (§2): the full `prompt` JSONB (including `answer`/`workingSteps`) is always returned together, for every row, to every currently-permitted reader. This is correct and necessary for Practice (self-marking requires the client to have the answer). It is **not acceptable for a governed Mock attempt before submission**. Since Postgres RLS operates at row, not column, granularity, field-level projection cannot be achieved by an RLS policy alone. **Design decision for 008D**: sealed Mock question delivery must go through a server-mediated route that queries with the service role and returns a redacted projection (`id`, `subject`, `skill`, `question` — never `answer`/`workingSteps`/`addressesMisconception`) while an attempt is `IN_PROGRESS`, and only reveals the full row after the attempt's report reaches `RELEASED` (008A's own delayed-reporting lifecycle). This is the same non-negotiable rule the directive states directly: "Do not send correct answers to the browser and merely hide them in the UI."

---

## 7. Passage security

`ali_passage_bank` is already maximally restrictive (§2) — no fix needed. English Practice's real passage delivery does not depend on this table at all: every RC-10 question's own `prompt.passageText`/`prompt.passageTitle` is a self-contained copy (confirmed in prior increments, re-confirmed unchanged here), so `ali_passage_bank`'s own `eligibility_status` is irrelevant to current Practice delivery. For a future Mock, the same self-contained-copy pattern should be reused for sealed passages (embedded in the redacted question projection, §6), rather than requiring a second sealed-content fetch path.

---

## 8. Architecture decision: **C — RLS + server retrieval**

Evaluated against the directive's own five options: (A) stricter RLS only — insufficient alone, since it cannot achieve field-level (answer) redaction; (D) secure RPC/projection alone — unnecessary complexity for the row-level gate itself, since a plain policy predicate is simpler, more auditable, and matches every existing RLS convention in this codebase. **Chosen: RLS for the row-level gate (this increment, migration 069) + server-mediated retrieval with field projection for actual sealed Mock delivery (008D)** — the two layers are complementary, not redundant: RLS is the hard backstop that makes the server route's own correctness non-critical-path (even if a future server route had a bug, RLS still blocks direct client access to `mock_eligible` rows), and the server route is what achieves projection RLS cannot express alone.

---

## 9. Migration

`supabase/migrations/069_mock_sealed_content_rls.sql` — drops and recreates `ali_question_bank_select_all` with the predicate `eligibility_status is distinct from 'mock_eligible' or public.is_current_user_admin()`. NULL-safe (`is distinct from`, not `!=`, matching `lib/ali/questionBank.ts`'s own documented caution about NULL semantics). Idempotent. Touches only `ali_question_bank`. Changes no data. **NOT applied.**

---

## 10. Legacy Mock route classification

| Route | Data source | Classification |
|---|---|---|
| `/learning-intelligence/mock-exam` (real CSSE Mock) | `ali_question_bank` via `fetchMockEligibleQuestionBank()` | **RESTRICT** — directly benefits from migration 069; must move to the server-mediated pattern (§6) before real content is added |
| `/mocks/[pathway]` (GL/CEM/ISEB) | Static `data/*.ts` | **LEGACY ONLY** — no sealed content, no security exposure, unrelated to this firewall |
| `/mocks/csse` (deprecated legacy entry) | Static `data/*.ts` | **RETIRE** — unlinked, static content, no data exposure risk; retirement is a cleanup task, not a security fix, out of this increment's scope |
| `/mock-test` | Static `data/lessons`/`data/maths` | **NOT A REAL MOCK ROUTE / LEGACY ONLY** — confirmed via import trace, no connection to `ali_question_bank` at all |
| `/learning-intelligence/founder-validation/csse` | `fetchQuestionBank()` (Practice-eligible, not Mock-eligible) | **NOT A REAL MOCK ROUTE** — a Founder QA/validation tool exercising the Practice pathway, not sealed content |
| `/learning-intelligence/parent/mock-readiness` | Pure categorical dispatch over real evidence, no raw content fetch (008A's own trace, re-confirmed unchanged) | **RETAIN** — no exposure risk |

No legacy route was found to bypass or undermine migration 069's protection — none of them query `ali_question_bank` filtered to `mock_eligible` except the real Mock route itself, which is the one route this migration is specifically protecting.

---

## 11. Direct REST/API attack test result

Performed live, bounded, non-destructive (§2): anon unfiltered SELECT succeeds (200); anon filtered-to-`mock_eligible` SELECT succeeds but returns 0 rows (ambiguous today — see §14's disclosed limitation); anon can read full `prompt` including `answer`/`workingSteps` for any row. **Pre-migration, this confirms the exposure is real.** Post-migration verification (blocked `mock_eligible` access specifically) cannot be meaningfully proven until the Founder applies migration 069 — recorded as a required follow-up (§14).

---

## 12. Browser bundle leakage

No sealed Mock content exists to leak today. The legacy static fixtures (`data/lessons`, `data/maths`, and the `MOCK_CONFIGS` static content) are compiled into the client bundle by design — classified **SAFE FIXTURE / LEGACY**, not governed Mock content, and were never intended to be secret. No current static file was found containing anything resembling a sealed Mock question bank.

---

## 13. Service-role audit

Grepped for service-role usage relevant to questions: none found in any client-reachable code path. `getSupabaseClient()` (used throughout the app, including the real Mock route) uses the anon key exclusively. No service-role key appears in any `NEXT_PUBLIC_*` environment variable or client bundle. This confirms the service role is currently unused for question delivery — consistent with §5/§6's finding that the server-mediated delivery path 008D needs does not exist yet.

---

## 14. Attempt-time access contract (for 008D)

Minimum shape, not implemented: `{ mockAttemptId, learnerId, formId, status, authorisedQuestionIds, section, startedAt, expiresAt? }`. Question access must be tied to a valid, server-verified attempt context — never a bare `mock_eligible` filter reachable by the client.

---

## 15. Post-submission security

Per 008A's own delayed-reporting lifecycle: submission does not grant answer/workingSteps/other-form access. That access follows the `RELEASED` state, which the security design must gate the same way as pre-attempt access — a `SUBMITTED`-but-not-`RELEASED` attempt is functionally identical, from a security standpoint, to an attempt that has not yet started.

---

## 16. Admin/review access

Unaffected and re-confirmed working (§3's access-class table, §8 rationale): `is_current_user_admin()` is reused unchanged, matching `ali_passage_bank_select_admin`'s own precedent (migration 054). No new admin bypass was created.

---

## 17. Failure modes

Guessing question/form IDs, replaying URLs, using another learner's attempt ID, accessing before start/after expiry/after submission, direct REST querying, requesting answer fields, using legacy routes — **all of these are properly addressed only once 008D's server-mediated, attempt-scoped delivery exists**; migration 069 alone closes the row-level "any client can read any `mock_eligible` row directly" failure mode, which is the specific, concrete gap this increment was scoped to close. The remaining failure modes are correctly out of 008C's own bounded scope (no attempt engine exists yet) and are named here so 008D does not have to rediscover them.

---

## 18. Audit/logging design

Recorded, not implemented (no attempt engine exists to emit these yet): `MOCK_ASSIGNED`, `MOCK_STARTED`, `QUESTION_PAYLOAD_ISSUED`, `MOCK_SUBMITTED`, `REPORT_RELEASED`. Purpose: assessment integrity and supportability, not surveillance — no browser fingerprinting or invasive tracking is proposed.

---

## 19. Privacy

No new personal information is required. Existing profile/learner IDs are sufficient for the future attempt contract (§14). No DOB requirement introduced.

---

## 20. Verification

Full suite **537/537** (530 baseline + 7 new structural migration tests). TypeScript clean. Copy Quality Guard PASS (0 violations, 238 files). Production build succeeds. Production counts unchanged (TOTAL 312, PE 295, Mock Eligible 0) — this migration was not applied, so no live security behaviour has changed yet.

**Disclosed limitation**: `scripts/verify-mock-firewall.mjs` (a new, standalone post-application verification script) currently reports "PASS" for the mock_eligible-blocking check, but this is **ambiguous today** — 0 rows exist regardless of whether the policy is applied, so this specific check cannot distinguish "blocked by RLS" from "nothing to find" until either the migration is applied (proving the query behaviour under a real block) or real Mock content exists. This is disclosed, not glossed over. The Practice/provisional checks in the same script are meaningful today and both pass.

---

## 21. Unresolved risks

The full attempt-scoped, field-projected delivery path (§5/§6/§14) remains unbuilt — 008D's own primary objective. Legacy route retirement (`/mocks/csse`, §10) is a low-priority cleanup, not a security risk, left for a future increment. Post-migration live verification (§20) is required before this fix can be considered genuinely in effect.

---

**STOP. This report concludes 008C's own generation stage. Migration 069 committed and pushed, NOT applied. Mock Eligible remains 0. Return to Founder/Product leadership for manual migration application, then post-application verification, then 008D authorisation.**

---

## 22. Post-Migration Security Reconciliation (addendum)

The Founder manually applied migration 069 ("Success. No rows returned" — explicitly not treated as sufficient evidence on its own). Independent post-application verification follows.

### 22.1 Installed-policy verification — the one item requiring Founder-supplied evidence

`pg_policies`/`pg_class` are Postgres system catalogs, not exposed via PostgREST — this session's anon key has no path to query them directly (the same category of limitation this project has repeatedly hit with `ali_family_review`'s RLS-opaque anon behaviour, now applying to catalog introspection itself). The exact query needed:

```sql
select schemaname, tablename, policyname, permissive, roles, cmd, qual, with_check
from pg_policies
where tablename = 'ali_question_bank'
order by policyname;

select relname, relrowsecurity, relforcerowsecurity
from pg_class
where relname = 'ali_question_bank';
```

**Not yet supplied — this is the one remaining Level 1 evidence gap**, distinct from and additional to every behavioural test below, all of which passed.

### 22.2 Anonymous access test (A/B/C)

Live, bounded, non-destructive: (A) `practice_eligible` Mathematics row returns its full `prompt` including `answer`/`workingSteps` — Practice unaffected. (B) `provisional` rows remain queryable, unchanged pre-existing behaviour. (C) A query filtered to `eligibility_status = 'mock_eligible'` returns `200`/`[]` — **behaviourally identical to pre-migration**, and, as disclosed in §20 before this addendum, cannot be distinguished from "0 rows exist" without either real `mock_eligible` content (not created, per explicit instruction) or the §22.1 catalog evidence. This is not new information — the same disclosed limitation stands, now doubly motivating the §22.1 request.

### 22.3 Authenticated learner boundary

**No separate learner credential was used or was needed.** The installed policy (per migration 069's own text, pending §22.1's direct confirmation) grants `anon` and `authenticated` the *identical* `using` predicate — it does not branch on `auth.uid()`, session state, or any authentication-specific condition. Since Postgres RLS evaluates the same boolean expression for both roles here, an anon-key test is structurally equivalent proof for the authenticated-learner case, not merely a proxy for it — there is no behavioural difference the policy itself could produce between the two roles. This is a structural argument, not a workaround, and is disclosed as such rather than claimed as a live authenticated-session test.

### 22.4 Admin access

`is_current_user_admin()` was not modified by migration 069 (confirmed by direct reading of the migration's own SQL — no `DROP FUNCTION`/`CREATE FUNCTION` statement anywhere in it) and remains the same function migration 054's own `ali_passage_bank_select_admin` policy already relies on. No defect found; nothing altered.

### 22.5 Practice regression — live, on the real production account

Mathematics Practice: loaded a real question ("What is the smallest multiple of both 4 and 9 that is greater than 30?"), submitted the correct answer (36), received "Correct" plus real `workingSteps` explanation text ("The lowest common multiple of 4 and 9 is 36", "The smallest multiple of 36 above 30 is 36") — the full pipeline (question delivery → answer submission → post-answer explanation) confirmed working end-to-end. English (Reading Comprehension, passage-backed): loaded a full real passage ("The Kite Maker") and its question correctly. Both confirm **zero Practice regression** from migration 069.

### 22.6 Answer-secrecy boundary — reconfirmed, not solved here

Migration 069 remains a row-level gate only. §6/§14 of this document's own original design stands unchanged: the pre-submission Mock payload's field-level secrecy (answer, accepted answers, workingSteps, misconception metadata) is **008D's own obligation, not yet built**. This report does not claim otherwise.

### 22.7 Passage security

Re-confirmed live: `ali_passage_bank` still returns `200`/`[]` to the anon key — identical to its pre-migration state (§2). No regression, since migration 069 never touched this table (confirmed by the migration's own SQL and by the structural test asserting exactly one table is referenced).

### 22.8 Direct API attack matrix (re-run)

| Test | Result |
|---|---|
| Anon unfiltered SELECT | ALLOWED BY DESIGN (Practice/provisional content, unchanged, intentional) |
| Anon `eligibility_status=eq.mock_eligible` | NO MATCHING ROW EXISTS (cannot distinguish from BLOCKED BY RLS without §22.1) |
| Anon answer-field request (`prompt->answer`) on a `practice_eligible` row | ALLOWED BY DESIGN (Practice requires this for self-marking) |
| Anon `workingSteps` request | ALLOWED BY DESIGN (same reason) |
| `ali_passage_bank` enumeration | BLOCKED BY RLS (unchanged, pre-existing) |
| ID-based lookup | NOT TESTABLE BEYOND THE ABOVE without fabricating a `mock_eligible` row (not done, per explicit instruction) |

### 22.9 Production counts

Re-queried live: **TOTAL 312, Practice Eligible 295, Mathematics PE 175, English PE 120, Provisional 17, Mock Eligible 0 — exact match, zero discrepancy.**

### 22.10 Regression

Full suite **537/537** (unchanged — no code changed this verification pass). TypeScript clean. Copy Quality Guard PASS (0 violations, 238 files). Production build succeeds.

### 22.11 Closure standard applied

Of the directive's own 10-point closure standard: items 1 (migration applied — Founder-confirmed), 4-9 (admin access, Practice, passage security, production counts, Mock Eligible=0, regressions) are all independently confirmed. **Item 2-3 (installed policy matches the intended rule; ordinary clients cannot retrieve `mock_eligible` rows) rest on behavioural evidence that is consistent with the fix but cannot be distinguished from "nothing to find" without §22.1's catalog query** — disclosed honestly, not asserted as fully proven. Item 10 (the field-level obligation explicitly carried into 008D) is satisfied by this document's own unchanged §6/§14/§21.

**Verdict: PASS WITH FINDINGS.** The one finding is evidentiary, not a defect: §22.1's catalog query remains outstanding. Every test this session could independently perform, passed cleanly, with no regression anywhere.

---

### 22.12 §22.1 catalog evidence — supplied, closing the one outstanding gap

The Founder supplied authenticated Supabase catalog evidence directly:

```
table: public.ali_question_bank
policy: ali_question_bank_select_all
roles: anon, authenticated
command: SELECT
qual: ((eligibility_status IS DISTINCT FROM 'mock_eligible'::text) OR is_current_user_admin())

relrowsecurity = true
relforcerowsecurity = false
```

This is an **exact, verbatim match** to migration 069's own intended predicate (§9) — confirming the installed policy is precisely what was designed and reviewed, not merely "close enough." RLS is enabled (`relrowsecurity = true`). `relforcerowsecurity = false` is the correct, accepted setting for this architecture: it means the table owner and other privileged/bypass roles are not subject to RLS, which is intentional — the service role (008D's own future delivery path) and any migration-applying superuser role must remain able to operate without RLS interference; ordinary `anon`/`authenticated` traffic, the only roles this firewall is protecting against, remain fully subject to the policy regardless of this setting.

**§22.1's evidence gap is closed. Combined with every behavioural test in §22.2-§22.10 (all clean), 008C's own closure standard (§21) is now fully satisfied on all 10 points.**

**Verdict: PASS. Educational Increment 008C is genuinely CLOSED.**

---

**STOP. 008C is CLOSED. Mock Eligible remains 0. 008D (Mock Attempt Engine + Secure Payload Delivery + Exam Experience Foundation) is separately authorised — see Decision 87.**
