# CSSE Maths Practice: publication runbook (374 recommended candidates). NOT EXECUTED.

**Nothing in this runbook has been run. Do not run any step without the Founder's authorisation.** The package is in `scripts/output/csse-practice-publication-package/`; the decision evidence is in `ANGEL_CSSE_MATHS_PRACTICE_FINAL_DECISION_PACK.md`.

## What is in the package

| File | Purpose |
|---|---|
| `submit-context.js`, `submit-data-handling.js`, `submit-breadth.js`, `submit-grid.js`, `submit-angle.js`, `submit-numberline.js` | One console script per prepared set. Each contains **only the recommended candidates** (374 in total) and **only calls `submit_question_candidate`**: it submits as `pending_review`, unpublished. It never approves or publishes. |
| `review-and-publish-GUARDED.js` | Calls the governed `review_question_candidate(id, 'approved')` and `publish_question_candidate(id)` once per candidate. **Does nothing** unless `FOUNDER_AUTHORISED` is edited to `true`. Edit `AUTHORISED_BLUEPRINTS` first to remove any blueprint the Founder did not approve. |
| `manifest.json` | Every recommended candidate id, per blueprint and per set. |
| `excluded-not-recommended.json` | The 6 candidates held back (preserved, never submitted, not deleted). |
| `decision-summary.json` | The per-blueprint evidence and risk ratings behind the pack. |
| `live-duplicate-check.json` | The read-only exact-duplicate check against the live bank, including the Mock crossover finding and its fix. |

## Authorisation first

1. The Founder reviews `ANGEL_CSSE_MATHS_PRACTICE_FINAL_DECISION_PACK.md` and records APPROVE, TRIM, REVISE or REJECT per blueprint (the pack states the recommendation; the Founder may change it).
2. Only then proceed. A blueprint that is not approved must be removed from `AUTHORISED_BLUEPRINTS` and its candidates must not be run through the guarded script (submitting them is harmless; they stay pending).
3. The number-line rounding blueprint (`mr06-bp-numberline-read-then-round`) is approved only together with the two breadth rounding blueprints (see the pack's condition).

## Steps (admin only, in a signed-in browser on the live app; no credentials are typed or exposed)

1. Run the six `submit-*.js` scripts one at a time (DevTools, Console, paste, Enter). Each ends with "Done: N/N submitted". Expected: 140 context set minus 6 = 134, then 48, 96, 40, 32, 24 (374 in all).
2. Confirm read-only that 374 rows exist at `pending_review` (verification query 1 below).
3. Edit `review-and-publish-GUARDED.js`: set `FOUNDER_AUTHORISED = true` and trim `AUTHORISED_BLUEPRINTS`. Run it. It approves and publishes each candidate through the governed functions, one call each.
4. Run the verification queries below (read-only). Report any difference; do not repair automatically.

## Read-only verification after publication

1. Submitted: `select review_status, publication_status, count(*) from ali_question_candidate where candidate_id like 'csse-%' group by 1,2;`
2. Published rows exist and are practice-eligible: `select subject, eligibility_status, count(*) from ali_question_bank where family_id in (select distinct p_family from ...)` or simply `select count(*) from ali_question_bank where eligibility_status='practice_eligible' and subject='maths';` expecting 587 + the published count (961 if all 374).
3. Every published row carries its answer: `select count(*) from ali_question_bank where id in (...) and (prompt->>'answer') is null;` expecting 0.
4. Representation integrity: for rows with `prompt ? 'stimulus'`, run the fail-closed validators (`isValid*Stimulus`) over the exported prompts; expecting every stimulus valid.
5. Marking contract exercise: run the real `checkMathsAnswer` over each published row's stated answer (it must accept it) and over the coordinate rows with spacing variants (accept) and malformed variants (reject).
6. No Mock exposure: published ids appear in no `ali_mock_form`.
7. Inventory: practice-eligible 901 to 1,275 (Maths 587 to 961).

## Risks carried by the recommended set (unchanged, disclosed)

Coordinate grid LOW; angle figures MEDIUM; number-line scale-reading HIGH; the number-line rounding batch is CRITICAL on its own and MEDIUM with the family's three rounding blueprints; the earlier context, data-handling and breadth batches keep their disclosed ratings. Volume is a result of the evidence, not a target.
