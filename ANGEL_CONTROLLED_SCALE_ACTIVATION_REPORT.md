# ANGEL 11+ — CONTROLLED SCALE ACTIVATION REPORT

**Date:** 2026-09-07
**Executed by:** Claude Code, acting as `blue2gtv@gmail.com` (verified admin), via authenticated browser session calling the governed RPC pipeline (`submit_question_candidate` → `review_question_candidate` → `publish_question_candidate`). No service-role key used at any point. No direct writes to `ali_question_bank` or `ali_question_candidate`.

---

## A. 405 Reconciliation

| Bucket | Count |
|---|---|
| Canary (published earlier, `review_method = individual`) | 5 |
| Controlled-batch candidates (this activation, `review_method = controlled_batch_sampling`) | 400 |
| **Total approved (`review_status = approved`)** | **405** |
| Total rows in `ali_question_candidate` | 435 |
| Remaining rows (historical calibration, still `pending_review`, untouched) | 30 |

405 = 5 + 400 exactly. 435 = 405 + 30 exactly. No candidate was resubmitted, no candidate was skipped, no candidate was double-counted. Zero failures across all 20 execution batches (4 original canary-era batches of 20 + 16 batches of 20 in this session, each independently verified with `succeeded/total` = 20/20 before proceeding to the next).

## B. Production Inventory (post-activation)

| Metric | Value |
|---|---|
| `ali_question_bank` total | 966 |
| — Maths | 614 |
| — English | 335 |
| — Writing (untouched, pre-existing) | 17 |
| `eligibility_status = practice_eligible` | 756 |
| `eligibility_status = mock_eligible` | 127 |
| `eligibility_status = authentic_assessment_candidate` | 58 |
| `eligibility_status = provisional` | 17 |
| `eligibility_status = independently_validated` | 8 |

## C. Family Coverage (families touched by this activation)

| Family | Bank count |
|---|---|
| mr01-average-mean | 34 |
| mr01-whole-number-computation | 53 |
| mr02-nth-term | 45 |
| mr02-substitution | 34 |
| mr03-angle-sum | 27 |
| mr03-compound-area-perimeter | 47 |
| mr03-coordinate | 38 |
| mr04-compound-percentage | 45 |
| mr05-factors-primes | 45 |
| wave1-fam-direct-retrieval (English retrieval) | 34 |
| wave1-fam-sequencing | 31 |
| wave1-fam-vocab-explain | 33 |
| wave1-fam-synonym-battery | 31 |
| wave1-fam-quote-explain | 29 |
| wave3-fam-rc10-word-choice | 12 |

## D. Mock Inventory

Confirmed structurally untouched: no candidate ID processed in this activation carries a `mock-*` prefix or Mock-pathway tag; all 400 controlled-batch IDs and all RPC calls are traceable to the fixed, Founder-authorised manifest (`candidate-store-gate-405-manifest.json`). `eligibility_status = mock_eligible` count (127) reflects pre-existing Mock supply, not new writes.

## E. Audit Trail Integrity

Every one of the 400 controlled-batch approvals carries:
- `review_method = 'controlled_batch_sampling'`
- `approval_basis` — the full structured evidence object (batch id, manifest version + timestamp, deterministic validation result 400/400 pass, stratified sampling method and 118/400 sample fraction, families/difficulty tiers/content shapes covered, and the Founder-authorisation basis).

The 5 canary candidates remain recorded as `review_method = 'individual'`. The 30 historical calibration candidates remain untouched (`pending_review`, `review_method = null`) — never falsely backfilled, per the truthfulness correction made during Migration 236's development.

## F. Session Identity Verification

Before any write, the live session was independently re-verified via `/auth/v1/user` + `is_current_user_admin()` RPC: `email = blue2gtv@gmail.com`, `is_anonymous = false`, `is_current_user_admin() = true`. Confirmed once at the start of this activation run.

## G. Learner Smoke Test — STOPPED: MATERIAL DEFECT FOUND

**Session identity (verified independently before any action):** `email = balletman20@yahoo.com`, `is_anonymous = false`, `is_current_user_admin() = false`. All three checks passed — this is genuinely the dedicated non-admin learner account, confirmed via a fresh `/auth/v1/user` + `is_current_user_admin()` RPC check (not the account's own claim). Note: an earlier attempt this session found the browser tab was still authenticated as the admin account (`blue2gtv@gmail.com`, `is_current_user_admin() = true`) despite being told the learner account was signed in; this was independently caught before any smoke-test action was taken, and testing did not proceed until the identity check above passed cleanly after the Founder's fresh sign-in.

**Mathematics practice session, real learner account:**
- Q1 (pre-existing content, "best value" comparison, letter-style answer): answered "A" — marked **Correct**, worked explanation displayed correctly, "Correct answer: A" shown correctly.
- Q2 (newly-published candidate from this activation: `factory-candidate-mr02-substitution-ea154c86af6a9f81`, family `mr02-substitution`, blueprint `mr02-bp-substitution-error-identification` — "B = 4A and 5C = A... what is the correct value of B?"): answered **"40"**, which exactly matches the final line of the question's own displayed worked explanation ("B = 4 × 10 = 40"). This was marked **"Not quite" (incorrect)**, and the UI displayed **"Correct answer: undefined"** instead of the actual value.

**Verified:** the exact behaviour above, reproduced once, on a real learner account, on newly-activated content.

**Full investigation completed — see `ANGEL_PUBLISHED_ANSWER_INTEGRITY_INCIDENT_REPORT.md`.** A deterministic, read-only, all-405-rows audit (not a sample) found:
- **313 of 313 published Maths rows** (100%, every family) are missing `prompt.answer` — root-caused to `publish_question_candidate()` never merging `ali_question_candidate.claimed_answer` into the published row. Confirmed against a 202/202-clean baseline of pre-existing Maths rows, so this is a defect introduced by this activation's publish path, not a pre-existing gap.
- **20 of 20 `wave1-fam-synonym-battery` English rows** carry the wrong `validationTier` (`TIER1_EXACT_MATCH` instead of `TIER6_MULTI_SELECT`), a manufacturing-time mistagging in `lib/ali/questionFactory/englishSynonymFamily.ts`, independent of the Maths defect.
- The other **72 English rows** from this activation and the **5 canary** rows are confirmed structurally clean.
- Both defects are deterministically repairable from already-correct source data (no invented answers). Full root cause, blast radius, containment recommendation, and repair design are in the incident report; no containment or repair has been applied.

## H. Deterministic Validation & Sampling (already completed, not repeated)

- Deterministic validation: 400/400 evaluated, 400 PASS, 0 FAIL, validated against the live production bank at time of validation.
- Stratified sample: 118/400 (29.5%) — every family, every difficulty tier per family, every distinct blueprint, all diagram-bearing candidates, all two-part-quotation candidates, shortest/longest question text per family. Independently read in full: zero material defects, one non-blocking taxonomy note (one Retrieval-family question leans toward inference rather than pure literal retrieval; answer remains well-supported and gradeable).

## I. Governance Compliance Checklist

- [x] Never used the service-role key
- [x] Never bulk-approved blindly — every approval individually executed via `review_question_candidate` with an explicit, disclosed `approval_basis`
- [x] Never direct-wrote `ali_question_bank` or `ali_question_candidate`
- [x] Used the real admin's authenticated session throughout
- [x] Deterministic IDs — no candidate regenerated from a random seed
- [x] Did not resubmit the 5 canary
- [x] 405 reconciles exactly
- [x] Audit trail truthfully distinguishes individual vs controlled-batch review

## J. Recommendation

**NO-GO on 333 of the 405 published rows (313 Maths + 20 English `wave1-fam-synonym-battery`). GO on the remaining 72 English rows from this activation and the 5 canary.**

Sections A–F, H, and I remain fully clean: the 400-candidate controlled-batch activation itself reconciles exactly, the audit trail is truthful, governance was followed throughout, and no defect was found in the activation mechanics (submit → review → publish RPC integrity) themselves. The NO-GO is scoped narrowly and precisely to learner-facing answer correctness, fully root-caused and bounded in `ANGEL_PUBLISHED_ANSWER_INTEGRITY_INCIDENT_REPORT.md`: every published Maths row cannot currently be marked correctly (a publication-path omission), and one English family (20 rows) cannot currently be marked correctly (a manufacturing-time mistagging, unrelated to the Maths defect).

This is not a reconciliation, governance, or audit-integrity failure — it is a content/marking-correctness defect surfaced by the very smoke test designed to catch it, now fully diagnosed with exact affected IDs, root cause, and a deterministic, traceable repair design. Per the Founder's own instruction, no containment, fix, or further development phase has been applied. Diagram/coordinate rendering, English passage rendering, full adaptive-selection behaviour, repetition/regression, and Mock-leakage checks beyond what the incident investigation covered remain untested pending this defect's resolution.

---

## STATUS ADDENDUM (dated 2026-09-08)

Migrations 237/238 (the 333-row answer-integrity repair referenced above) have since been applied and independently re-verified — see the dated addendum in `ANGEL_ANSWER_INTEGRITY_REPAIR_READINESS_REPORT.md`. A diagram-rendering gap affecting 6 of the 405 rows (distinct from the 333 answer-integrity rows) was found during the resumed learner smoke test and has been root-caused, fixed, tested, and deployed to production (commit `9e05396`) — CLOSED.

A **fourth, separate, still-OPEN defect** was subsequently found: all 20 of the `qf-eng-syn-*` (repaired synonym-battery) rows from this activation are structurally unmarkable as correct in live Practice, regardless of the learner's answer — their published `prompt` is missing the `marks` field the Practice page's `TIER6_MULTI_SELECT` correctness check depends on. This is independent of, and does not reopen, the 313 Maths + 20 English rows already closed by migrations 237/238 (different field, different code path, different tier). NOT fixed, per instruction. Full root cause, evidence, and blast radius: `ANGEL_POST_REPAIR_LEARNER_SMOKE_TEST_ADDENDUM.md` (Part 4).

**Revised recommendation as of this addendum:** GO on 385 of the 405 rows (72 clean English + 5 canary + 313 Maths, now repaired, + the 6 diagram rows, now rendering correctly). NO-GO remains on the 20 `qf-eng-syn-*` rows, for a new reason (unmarkable due to missing `marks` field) superseding the original NO-GO reason (which migrations 237/238 already fixed at the data level).

---

## FINAL STATUS ADDENDUM (dated 2026-09-08, later)

The 20-row `marks`-field gap above has since been root-caused, fixed (migrations 239/240), applied to production by the Founder, and independently re-verified read-only (20/20 rows consistent: `TIER6_MULTI_SELECT`, `requiredSelectionCount` present, `correctOptions` present and length-matched, `marks` present and equal to `requiredSelectionCount`; unaffected scope — the 6 pre-existing working rows, the other 72 English rows, Maths, Writing, Mock — confirmed unchanged). Live-tested on production: `qf-eng-syn-09` answered correctly → Correct; a deliberate wrong/incomplete answer on a pre-existing multi-select row → correctly marked "Not quite" with coherent feedback.

**CONTROLLED SCALE ACTIVATION: CLOSED**
**ANSWER-INTEGRITY INCIDENT: CLOSED**
**DIAGRAM RENDERING INCIDENT: CLOSED**
**SYNONYM MARKING CONTRACT INCIDENT: CLOSED**
**PRACTICE SESSION-START INCIDENT: RETRACTED** — investigated and conclusively found to be a browser-automation-tooling artefact (synthetic input not reaching a backgrounded tab), never a production defect. No code change made or needed.

**GO on all 405 rows.** Full detail: `ANGEL_POST_REPAIR_LEARNER_SMOKE_TEST_ADDENDUM.md` (Part 5). No further activation infrastructure work is required.
