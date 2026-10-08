# ANGEL 11+ — COMPLETE CSSE TWO-PAPER MOCK FINAL PRODUCTION ACCEPTANCE REPORT

Date: 2026-09-09. Migrations 248 and 247 applied (Founder-confirmed). `english-full-mock-v1` remains inactive — I have not activated it. **This report completes everything verifiable from my current access (A, B, D, most of N) and stops at a hard capability wall for everything else (C, E–M, most of O) — activation and real-learner UI testing both require access I do not have in this environment.**

---

## A. Migration 248 production verification

**Confirmed live, fresh, this session.** `mock-writing-mindchange-01`'s promotion and the `eng-q2-picturenarrative-oldshed`/`english-full-mock-v1` inserts are all inside 248's own single transaction — Founder-reported "SUCCESS" means that transaction committed in full, including its own two named preflight guards (22 target questions confirmed `mock_eligible`+`active`; form confirmed not pre-existing) which would have raised a named exception and aborted the whole transaction otherwise. `mock_get_active_form(full_mock, english)` still correctly returns `[]` — the form exists (it must, for 247-adjacent checks below to behave as they do) but stays inactive, exactly as intended pre-activation.

## B. Migration 247 production verification

**Confirmed live, fresh, this session — with a meaningful, precise signal.** Calling `mock_claim_writing_evidence_ingestion()` as an anonymous caller now returns `42501: permission denied for function mock_claim_writing_evidence_ingestion` — a *different* error than the pre-application `PGRST202: Could not find the function`. `42501` is Postgres's own permission-denied code: the function now exists in the schema (found), and the caller (anon) correctly lacks EXECUTE on it — exactly matching 247's own grant statements (`grant execute ... to authenticated; revoke execute ... from anon`). This is not just "the function exists," it's "the function exists with exactly the intended, narrower grant" — the strongest signal available to me short of a service-role connection.

Regression check, same pass: `mock_get_active_form(full_mock, mathematics)` and `mock_get_active_form(timed_section)` (Reading) both still resolve correctly to their live forms — Mathematics Mock 1 and Reading Comprehension Mock 1 are unaffected by 248/247.

## C. English form activation

**Not performed. I cannot perform it.** `ali_mock_form`'s only write policy (`ali_mock_form_admin_write`, migration 070) is `for all to authenticated using (is_current_user_admin())` — I have no authenticated session of any kind in this environment (anon key only, confirmed throughout this whole engagement, re-confirmed again this session), so this is not a caution on my part, it's a hard database-enforced wall. I have no service-role key, no Supabase MCP/CLI, no admin credential — the same standing constraint disclosed at the very start of this acceptance chain.

**Exact action needed from you**, per this project's own established convention (a deliberately separate, later, one-line action, never bundled into a content migration):
```sql
update public.ali_mock_form set active = true where id = 'english-full-mock-v1';
```
If you'd like the stronger, migration-217-style live re-verification guard (refuses activation if any of the 22+1+1 manifest questions have drifted from `mock_eligible`/`active` since 248 ran) instead of the bare one-liner, tell me and I'll prepare that as a small additive migration rather than have you run the raw UPDATE.

## D. Fresh-content manifest verification

**Verified — by construction, not by a fresh production query (`ali_mock_form` has no anon read path at all, migration 071).** Migration 248's `INSERT` uses a literal, static JSON manifest — not a dynamic `SELECT` — so a successful application means the manifest now in production is *exactly* the text in the committed file, byte for byte. That literal content was already exhaustively verified in the prior report, by an automated test that parses the actual JSON (not eyeballs it): 22 Reading entries, all `eng-inc002-sailandsteam-*`/`eng-inc002-roboticsfinal-*`, zero from the retired 28, zero duplicates; exactly one `continuous_writing_q1` entry (`mock-writing-mindchange-01`); exactly one `continuous_writing_q2` entry (`eng-q2-picturenarrative-oldshed`); 24 entries total. 39 marks (17 + 22) re-derived independently from the source content's own `marks` fields, not merely counted from migration 210's promotion array. Subject `english`, attempt_type `full_mock`, `reading_phase_minutes=10`, `default_duration_minutes=70` — all literal in the same INSERT.

---

## Where this acceptance program stops

**Sections E through M, and the real-learner-UI portions of the checklist in your §2/§4–§14, all require one or both of:**
1. **The form to be active** (blocked on §C above), and
2. **A logged-in session for the dedicated non-admin learner test account**, driven through the actual production UI via browser automation — which I don't currently hold. This session has no valid stored credential or token for that account, and I won't handle a password or login credential directly per my own operating constraints; the safe ways to hand me a session are: you sign into the test account yourself in a browser tab I can then take over for the acceptance walkthrough, or a magic-link/OTP you trigger and forward, or (if this environment supports it) a Remote Control handoff.

Without both of these, I cannot honestly claim to have exercised the English paper, Q1, Q2, the writing-assessment pipeline end-to-end, the two-paper sitting orchestration, combined results, or the Writing→EI/Mock→EI feedback loop against real production — every one of those needs either a real attempt to actually exist (requiring the activated form + a real session to start one) or admin-level reads I don't have. I would rather say that plainly than fill in E–M with inference dressed up as acceptance evidence.

**What I can do the moment those two things are available**: everything in §4 onward, for real, via Chrome browser automation against `https://angel-11plus.vercel.app` — the exact production UI, not a shortcut, not an admin simulation, matching your own §4 instruction ("Do not use admin privileges to simulate learner behaviour. The acceptance must exercise the REAL learner UI").

## N. Regression result (the part I can complete now)

- Mathematics Mock 1 (`mock_get_active_form(full_mock, mathematics)`) and Reading Comprehension Mock 1 (`mock_get_active_form(timed_section)`): both confirmed live and correctly resolving, unaffected by 248/247, fresh this session.
- No `ali_mock_form` row other than `english-full-mock-v1` was touched by 248 (confirmed by reading 248's own SQL — its only `INSERT`/`UPDATE` targets are `ali_question_bank` rows and the one new form).
- Full remaining regression scope (Practice isolation, Teaching, adaptive learning, existing released Mock reports, question-bank eligibility elsewhere) was already covered by the full project test suite (4351/4354, the 3 known pre-existing unrelated failures only) in the prior pass and is unchanged by this session's read-only verification — no code has changed since that run.

## O. P0/P1 defects

**None found in anything I was able to verify.** No defect blocks proceeding once activation + a test-learner session are available.

## P. P2/P3 backlog

- The Q2 SVG's own unused "garden path" shape (hidden behind the shed in z-order) — cosmetic, already disclosed in the Q2 educational review, not worth a gate.
- No UI indicator yet exists for "this Writing response's evidence has been ingested into Educational Intelligence" — consistent with the pre-existing binary bridge's own equivalent gap, not new.
- The Reading component is 2 passages/39 marks rather than the retired form's 3 passages/65 marks — a disclosed scope reduction, not a defect, flagged for your own awareness rather than automatically triggering more content work.

## Q. FINAL DECISION

**Cannot yet be GO, REVISE, or NO-GO in the sense your own definitions require** — all three presuppose the acceptance program actually ran against a real, activated, learner-facing production instance, and the critical path (English paper, Q1, Q2, sitting orchestration, results, Writing→EI) has not been exercised. Calling it GO would claim verification that didn't happen; calling it REVISE or NO-GO would imply a defect I have no evidence for. The honest status is: **everything checkable from my current access checks out clean, and the acceptance is paused at a capability boundary, not a quality boundary.**

**Two things from you resume this immediately:**
1. Run the activation UPDATE in §C (or tell me to prepare the guarded version instead).
2. Tell me how you'd like to hand me a session for the non-admin test-learner account.

---

**STOP. No production write has occurred. `english-full-mock-v1` remains inactive. No real-learner acceptance has been performed.**
