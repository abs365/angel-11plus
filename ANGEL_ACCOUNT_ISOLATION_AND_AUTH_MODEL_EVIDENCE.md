# ANGEL 11+ — Account Isolation Provenance & Auth-Model Evidence (2026-09-21)

Status: **evidence recorded; Migration 260 still NOT APPLIED; branch `multi-learner-household` NOT merged; nothing deployed.**
Evidence tags: **[V]** verified · **[O]** observation · **[A]** assumption.

## 1. Production provenance result (Founder ran `ANGEL_ACCOUNT_ISOLATION_PROVENANCE_CHECK.sql` on production)

| | Result |
|---|---|
| New account | permanent (`is_anonymous=false`), stored password value present |
| New learner | pathway `null`; lesson_progress 0; question_history 0; durable_mastery 0; adaptive_state 0; mock_attempt 0; XP 0 |
| Previous owner of this browser's device id | **anonymous** (`owner_is_anonymous=true`, no email); lesson_progress 1; question_history 0; XP 69 |
| Production accounts | 146 total: 139 anonymous, 7 permanent; 7/7 permanent have a stored password value; 0 have ever requested a password reset |

## 2. Conclusion

**CROSS-ACCOUNT DEVICE-STATE CONTAMINATION — CONFIRMED.**
**SERVER-SIDE LEARNER EVIDENCE CONTAMINATION — NOT FOUND.**

The new permanent learner has **zero** server-side educational evidence and no server-side pathway. Therefore everything the
Founder saw before setup (*"5 sessions so far"*, *"Solid progress"*, *"Building Confidence"*, CSSE, the daily mission, Mock
availability) was **browser/device state, not inherited server evidence** [V]. The previous owner of that browser was an
**anonymous** learner, which remains separately owned and keeps its own server evidence [V]. Nothing was claimed and nothing
was pushed to the new account's server rows.

| Visible element | Source | Class |
|---|---|---|
| "5 sessions so far" | `progress.completedLessons.length` from the device-wide browser blob | **C-like: device state of a different (anonymous) identity** |
| "Solid progress" | same value ≥ 5 | same |
| "Building Confidence" | readiness computed from that blob | same |
| CSSE pathway, Mock availability | `progress.selectedPathwayId` in that blob | same |
| Daily mission (English Comprehension, Vocabulary Builder, Review Mathematics…) | `computeAdaptiveState(blob)` | same |
| Server evidence behind any of it | none (all counts 0) | **not present** |

(Classes per the investigation brief: none was A — server evidence owned by the new learner; none was B — legitimately
claimed anonymous evidence, because no such claim mechanism exists; all were device state of a *different* identity.)

Root cause [V]: production stores the whole learner blob under **one device-wide key** (`angel11plus_progress`) that no code
associates with an account; `getProgress()` renders it for any signed-in identity.

## 3. Migration 260 vs this exact case (branch tests)

- `tests/lib/crossAccountDeviceState.test.ts` — *exact production case*: anonymous A's state (sessions, XP, pathway, scores,
  unfinished Mock) → new permanent B on the same browser: B shows 0 sessions, no "Solid progress", 0 XP, no pathway, no exam
  date, no skill evidence, the "not ready" confidence state, no Mock in progress, and a daily mission identical to a virgin
  learner's; A's browser state is byte-for-byte untouched. Also: permanent A → sign out → permanent B (both sign-in orders);
  legacy state claimed only by the profile created on that device.
- `tests/supabase/migration260MultiLearner.test.ts` — *exact production case, server side* on real Postgres: anonymous learner
  (1 lesson row, 69 XP, 0 question history) + new permanent account created on the same device: claim refused, same-device
  insert collides → fresh device id, new learner owns/sees nothing, anonymous evidence fingerprint unchanged and still owned by
  the anonymous identity.

## 4. Password interpretation — CORRECTED

The previous statement *"new accounts have no password"* was **wrong**. [V]

- Supabase Auth (`supabase/auth` v2.197.0, `internal/api/otp.go`, "User either doesn't exist or hasn't completed the signup
  process. Sign them up with temporary password."): for an unknown address with sign-ups enabled, `/otp` signs the user up with
  **`password.Generate(64, 10, 1, false, true)`** — a random 64-character password — which is hashed into
  `auth.users.encrypted_password`. Nobody sees or knows it.
- Hence `has_password: true` for **every** email-link-created account, including the Founder's new one, even though the parent
  was never asked to create one. The 7/7 result is exactly what this predicts.
- `ever_requested_password_reset = 0` for all 7 means **no parent has used the reset flow, the only in-app way to choose a
  password**. There is therefore **no evidence that any production parent knows a password**. [A: a password could in principle
  have been set outside the app (e.g. by an administrator); the data cannot exclude this.]

Precise wording to use: *"The parent has not established a password they know or use through the normal Angel 11+ Create
account journey; Supabase stores a random temporary password nobody knows."* Never: *"the account has no password"*.
Signing in with a password the parent never chose fails with Supabase's normal "Invalid login credentials" (already turned into a
friendly message by the login page).

## 5. Authentication UX status — unchanged

**PASSWORDLESS / EMAIL-LINK PRIMARY, password secondary** stands (shipped on `main`, `6d643be`). The reason is the customer-facing
fact — Create account never asks the parent to choose a password — not the internal presence of a hash. Customer copy ("No
password needed", "Never set a password? You don't need one") is accurate under the corrected interpretation.
The 7 permanent accounts show no sign of a known password, so password sign-in is kept only as a harmless secondary path
(and the reset flow lets anyone set one).

## 6. Wording corrections

Done on this branch: `AuthProvider.tsx` comment, `app/login/page.tsx` comment, provenance pack (`has_password` →
`has_stored_password_value`, `permanent_passwordless` → `permanent_without_stored_password_value`, expectation text), test names.

**Queued for `main` (comment/test-name/docs only; NOT pushed because pushing `main` deploys):**
`app/login/page.tsx` comments ("Create account is passwordless" ×2), `components/providers/AuthProvider.tsx` comment ("every
existing account today"), `tests/app/loginPagePasswordSignIn.test.ts` test titles ("…are passwordless"), `ANGEL_PROJECT_STATE.md`
("accounts made via Create account are PASSWORDLESS"), and `ANGEL_ACCOUNT_ISOLATION_PROVENANCE_CHECK.sql` on `main`. Bundle with the
next intentional `main` deploy (or resolve at branch merge).

## 7. Migration 260 preflight

`ANGEL_MULTI_LEARNER_MIGRATION_VERIFICATION_PACK.sql` is now **one read-only statement returning one JSON cell**
(`preflight_result`) with PASS/WARN/FAIL checks, counts, RLS status per learner table, old-resolver function names and count,
column privileges (`is_admin`, `auth_user_id`), prerequisites, and BEFORE/AFTER invariants. Tested on real Postgres before and
after the migration, including a regression (client `is_admin` UPDATE restored → FAIL) and a half-applied state (→ FAIL).
