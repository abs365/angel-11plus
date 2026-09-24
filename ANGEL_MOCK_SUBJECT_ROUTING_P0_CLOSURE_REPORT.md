# Mock Subject Routing P0 — Closure Report

**Status: FINAL GO. PRODUCTION LEARNER ACCEPTANCE: PASS. INCIDENT CLOSED (2026-09-24).**

## Defect
Founder production evidence: Mock Centre → Mathematics Mock 1 → "I'm ready to begin" served English
Reading ("Crossing the Atlantic: Sail and Steam", Question 1 of 17) under a page titled
"Mathematics Mock 1".

## Confirmed root cause
The Mock Centre cards were correctly supplying their paper parameters
(`/learning-intelligence/mock-exam?subject=mathematics`, `?type=timed_section`). But
`/learning-intelligence/mock-exam` is statically pre-rendered (live response header
`X-Nextjs-Prerender: 1`; `next build` route table `○`), and the page read the baked
`searchParams: {}` via `use(searchParams)` instead of the live browser query string. The requested
paper identity was therefore lost in production. With no subject, `mock_get_active_form('full_mock', NULL)`
resolved the newest active full_mock, `english-full-mock-v1`, and created incident attempt
`9ae70cee-3cde-47da-96e0-c0eecfcddda3`.

Evidence (read-only Supabase MCP + live bundle/headers):
- Live forms, manifests and question mappings were never corrupt. Mathematics form contained 56
  Mathematics items only; "Sail and Steam" lives only in `english-full-mock-v1`.
- API logs: Mock Centre resolved `first-mock-mathematics-v1` correctly; the pre-start page resolved
  `english-full-mock-v1`.
- After the first correction, the Founder's retest reached the new fail-closed screen from BOTH named
  cards, with zero pre-start RPC traffic, which proved the page received no query at all. The live
  page payload contained `searchParams: {}`.

## Corrections (all deployed and live-verified)
| Commit / migration | Change |
|---|---|
| `63a1c40` | Page-level fail-closed gate (full_mock with missing/invalid subject shows "Choose your Mock from the Mock Centre", no RPC, no attempt). Bare mock-exam links routed to `/mocks`. Structural link-contract test. |
| Migration 265 (applied) | `mock_get_active_form()` returns no row for full_mock without a subject; returns `subject` so the client `subjectMismatch()` guard is real. Live ACL preserved exactly. |
| **`e609d95`** | **Root-cause fix:** query read via `useSearchParams()` inside `<Suspense>` (pre-start page and `mock-exam/sitting/results`). Sitting hub gains governed "Re-enter your PIN" recovery. Regression test: no pre-renderable client page may read the `searchParams` prop. |

An earlier project-state entry claimed the live RPC returned `subject` after commit `a789f7d`. That was
not true: migration 264 was never applied.

## Founder production retest (authenticated, real learner)
- Mathematics Mock 1 → begin → **PASS**: Question 1 genuinely Mathematics (6.4 × 7, 3/5 of 145); 21 questions.
- Reading Comprehension Mock 1 → begin → **PASS**: Question 1 genuinely Reading (honeybee passage); 27 questions.

## Migration governance
- **265: APPLIED. Do not rerun.**
- **264: must NOT be applied.** It drops and recreates `mock_get_active_form()` without 265's
  fail-closed guard.
- 260–265 must not be casually rerun.

## Non-regression
- PIN enforcement (`current_learner_id()`, migration 263) unchanged and enforcing; no weakening of learner isolation.
- Mock timing, scoring and all three form manifests unchanged (manifest hashes verified live before and after).
- No database writes by the correction; protected attempts `9ae70cee` and `57805eee` untouched.

## Open follow-up
`9ae70cee` (English, 0 answers, scored 0/41, report unreleased, not EI-ingested) still occupies learner
`86b9841c`'s English slot in cycle `4e6bfadc`. No void mechanism exists; see the Invalid Mock Attempt
Governance assessment. Do not delete or hand-edit it.
