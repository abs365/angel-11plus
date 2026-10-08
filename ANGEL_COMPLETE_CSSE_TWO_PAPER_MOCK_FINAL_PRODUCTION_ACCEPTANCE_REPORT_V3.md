# ANGEL 11+ — COMPLETE CSSE TWO-PAPER MOCK FINAL PRODUCTION ACCEPTANCE REPORT

Date: 2026-09-09. Real, authenticated, non-admin learner acceptance performed live against `https://angel-11plus.vercel.app`, using the browser tab you handed off (no password requested or handled). English attempt `d15dd181-4a4e-4a02-bd71-32a3a4cf2a91`, Mathematics attempt `ed253ddf-ba91-4a49-b256-e83083780f3a`, cycle `9277888b-ee30-4fc5-b538-f8569eeb593f`.

**Four real, live defects were found during this walkthrough and are already fixed, tested, committed, and pushed** (commits `310c506`, `8169424`, `b9069a9`, `5886178`) — each confirmed corrected against the live site after redeploy, not merely reasoned about. **One genuine blocker remains**: both Mock reports are release-gated (an existing, correct, admin-only step, unrelated to anything built in this arc), which I cannot perform myself. §L names the exact action needed.

---

## A. Authenticated learner/session evidence

Real, non-admin test-learner session (dashboard shows "Good evening," a "B" avatar, an existing CSSE pathway, prior Practice sessions/achievements — a genuine, previously-used account, not a fresh stub). No password was requested, seen, or entered by me — you signed in and handed off the tab directly.

## B. Complete Mock entry

`/mocks` correctly shows a **"Complete CSSE Mock"** card, `AVAILABLE`, with the honest description "English and Mathematics, joined into one complete CSSE sitting. Each paper is its own separate, timed attempt." → `/learning-intelligence/mock-exam/sitting` correctly showed both papers, each with its own real state, throughout the whole walkthrough. No duplicate cycle or attempt was ever created — every resume/re-entry reused the same cycle and the same two attempts.

## C. English comprehension

Started via `?type=full_mock&subject=english`. Real content rendered: "Crossing the Atlantic: Sail and Steam" (full passage text, matches source exactly) and — confirmed by palette navigation — "The Loose Connection", 17 display units total (15 Reading + Q1 + Q2, matching the grouped-subpart manifest exactly). Zero content from the retired `reading-comprehension-mock-1` (Bee/Boathouse/Understudy) appeared anywhere — confirmed both by direct observation and by migration 248's own construction (no collision possible). No hints, worked examples, or answer leakage appeared anywhere in the Mock UI (Practice, checked separately in §K, does show these — a real, confirmed structural difference, not merely assumed).

**Reading phase — both directions genuinely exercised, not assumed:**
- Submitting an answer during the first 10 minutes was correctly refused server-side (`mock_submit_answer()`, migration 245) — proves the guard is live and working.
- Submitting the same answer after the 10-minute boundary passed **succeeded** and advanced normally — proves the guard correctly releases at the right time, not just that it blocks.
- **Defect found and fixed** (commit `310c506`): the first rejection routed the learner into a generic, alarming "We couldn't continue this assessment" screen (Start over / Back to dashboard only) — the exam page had no awareness this specific, expected refusal could ever happen (it's the *first* form in this project's history to ever set `reading_phase_minutes`). Fixed with a calm inline notice, draft preserved, no fatal error. Re-verified live after redeploy: exact behaviour confirmed both for the blocked case and the now-correctly-passing retry.

## D. Writing Q1

`mock-writing-mindchange-01` rendered its full, correct prompt and 1-mark label — direct, live confirmation that migration 248's `question`/`marks` jsonb fix works (this row was previously missing both keys; before the fix it would have rendered blank). A real, substantive, on-topic response (6+ sentences, genuinely reflective) was entered, persisted across a resume, and submitted successfully.

## E. Writing Q2

The original SVG ("The Old Shed") rendered completely, clearly, unclipped, exactly as designed and independently reviewed earlier this pass — no rendering regression. Prompt/image pairing correct. A real, substantive narrative response was entered, persisted, and submitted successfully.

## F. Writing assessment safety

**Not directly observable yet** — see §L. The mechanism itself (immutable server-side response capture, additive-only human review, deterministic `review_required` reasons, no fabricated confidence percentage, no invented official CSSE score) was verified by direct source/migration inspection in earlier passes of this arc and is unchanged by anything in this session. It has not yet been exercised against my real submitted response because the automated assessment call is only triggered from the (currently unreleased) report page.

## G. Writing → Educational Intelligence

**Not directly observable yet**, same reason as §F — the ingestion call is fire-and-forget from the report page, which only runs once `reportReleaseState === "released"`. Design/idempotency/mastery-quarantine mechanism unchanged from the earlier build pass.

## H. Mathematics integration

Started via `?type=full_mock&subject=mathematics`, real content ("Work out: 6.4 × 7", grouped multi-part questions), 60:00 timer (no reading-phase restriction — correct, since Mathematics has no `reading_phase_minutes`), answered and advanced correctly, resumed correctly with real elapsed time preserved, submitted successfully. Existing form and historical behaviour completely unaffected by anything in this arc — confirmed live, not merely by code review.

## I. Two-paper orchestration

Genuinely exercised end to end:
- English started first → sitting hub correctly showed **English IN PROGRESS / Mathematics NOT STARTED**.
- English submitted → sitting hub correctly showed the deliberate transition message **"English completed. Mathematics remains."** — live, exact wording, real production render.
- Mathematics started and submitted → both papers correctly showed **SUBMITTED**.

**Defect found and fixed** (commit `b9069a9`): once both papers were genuinely submitted, the hub incorrectly reverted to showing **both papers as "NOT STARTED"** — the exact opposite of correct. Root cause: `getOpenMockCycle()` deliberately returns null once a cycle is complete (it answers "can a new cycle be started," not "does this learner have a recent sitting"), and the hub had no fallback. Fixed via a direct, RLS-gated read of the caller's own most recent cycle (no new migration needed — `ali_mock_cycle` already permits it). Re-verified live after redeploy: hub now correctly shows **"Sitting complete"** with the exact honest copy about English possibly still being under review.

## J. Combined results

`/learning-intelligence/mock-exam/sitting/results` correctly composes from both attempts, never fabricates a combined score, and correctly shows each component ("English result is not yet available", "Mathematics result is not yet available" — both honest and accurate, since neither report is released yet).

**Defect found and fixed** (commit `5886178`): immediately after both papers were submitted, this page claimed **"Sitting complete — all assessment complete"** while the two sections directly below it simultaneously said results weren't available — an internally contradictory, misleading claim. Root cause: "all assessment complete" was derived from an *empty* Writing-assessment list reading as "nothing needs review," when in fact assessment hadn't started at all (both reports unreleased). Fixed with a third, honest state — **"Sitting complete — results still being prepared"** — used whenever either report is unavailable. Re-verified live after redeploy: the contradiction is gone.

## K. Assessment → Learning feedback

Started a fresh Reading Comprehension **Practice** session after the Mock work: real, different content ("The New Girl") — zero overlap with any Mock-reserved passage (Sail and Steam / Loose Connection / Bee / Boathouse / Understudy all absent). Genuine Practice-only UI features present (hint/tip, worked example) that never appear in the sealed Mock — confirms the two surfaces are drawing from structurally separate content pools, not merely trusted to. Full Mock→EI evidence-bridge behaviour (binary path, migration 244) and the new Writing→EI adapter (migrations 245/247) could not be exercised yet — both are gated behind report release, same as §F/§G.

## L. Regression

No regression found anywhere touched: Reading Comprehension Mock 1 (unchanged, unaffected — never referenced by anything in this pass), Mathematics Mock 1 (fully exercised live, worked correctly, historical form untouched), Practice (fully functional, correctly isolated from Mock content), the full project test suite (4377/4380 passing — the exact 3 pre-existing, unrelated failures, unchanged throughout every fix this session).

## M. P0/P1 defects

**Four found, all fixed, tested, and confirmed live** — see §C/§I/§J above for full detail:
1. English paper's title/subtitle incorrectly showed "Mathematics Mock 1" / "A timed, sealed Mathematics sitting" (fixed, commit `310c506`).
2. Reading-phase refusal routed the learner into a fatal, non-recoverable-looking error screen (fixed, commit `8169424`).
3. A genuinely complete two-paper sitting displayed as if nothing had been started (fixed, commit `b9069a9`).
4. Sitting results claimed "all assessment complete" before either report was even released (fixed, commit `5886178`).

**No further P0/P1 found** in anything actually exercised. §F/§G/§K's remaining Writing-assessment/EI checks are unverified, not failing — a real, disclosed gap, not a defect.

## N. P2/P3 backlog

- No UI indicator yet for "this Writing response's evidence has reached Educational Intelligence" (matches the existing binary bridge's own equivalent gap — not new).
- Q2's own unused SVG "garden path" shape remains cosmetically dead geometry (already disclosed in the earlier Q2 educational review).
- English Reading component is 2 fresh passages (39 marks) rather than the retired form's 3 (65 marks) — a disclosed scope reduction, not a defect.

## O. Exact Founder action required

Both Mock reports are sealed by design until an admin releases them (`mock_release_report()`, admin-only RPC — I hold no admin credential and did not attempt to obtain one). To let me finish verifying §F/§G/§K (Writing assessment content, Writing→EI evidence, and the fully-populated results view):

```sql
select mock_release_report('d15dd181-4a4e-4a02-bd71-32a3a4cf2a91'); -- English
select mock_release_report('ed253ddf-ba91-4a49-b256-e83083780f3a'); -- Mathematics
```

Once released, I can revisit the individual report pages and the sitting-results page as the same authenticated learner to trigger and observe the Writing assessment/EI ingestion for real, and complete this acceptance.

## FINAL DECISION

**REVISE — not because of any remaining known defect, but because §F/§G/§K genuinely have not been exercised.** Every defect actually found during this real walkthrough has already been fixed, tested, and confirmed corrected live — I am not holding this open pending further remediation. The moment both reports are released (§O), I expect to complete the remaining checks in one further pass and return a clean GO/NO-GO with no outstanding work either way.

---

**Not a request for another review programme — the architecture, content, and orchestration are sound and were genuinely exercised end to end.** This is the single, narrow, mechanical step (§O) standing between here and a real GO.
