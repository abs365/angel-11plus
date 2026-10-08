# ANGEL 11+ — EI003 WAVE 2 POST-MIGRATION CANDIDATE SUBMISSION REPORT

Status: migration verified live, all 40 frozen Wave 2 candidates submitted and stored successfully. **Not reviewed, not published. Wave 3 not begun.**

---

## A. Migration 241 production verification

Not assumed from the "Success. No rows returned" dialog. Queried `ali_passage_bank` directly via the existing authenticated admin session: **6/6 target passage IDs found.** For each: `passage_id`, `title`, `provenance` (`angel_original`), `eligibility_status` (`provisional`), `active` (`true`), `content_version` (`1`), `pathway` (`{csse}`), `copyright_status` (verbatim expected string), `text_type` (`narrative-extract` ×5, `informational` ×1), `genre` (matching Wave 2's own taxonomy) — all matched the migration's intended values exactly. No hash/integrity column exists in this table (confirmed absent, same as before registration) — not a gap introduced by this step.

## B. 6/6 passage reconciliation

| Passage ID | Title | Word count (stored) | Matches expected |
|---|---|---|---|
| `ei003-w2-eng-the-relay-baton` | The Relay Baton | 390 | ✓ |
| `ei003-w2-eng-the-last-delivery` | The Last Delivery | 424 | ✓ |
| `ei003-w2-eng-the-glass-frog` | The Glass Frog's Hidden Trick | 374 | ✓ |
| `ei003-w2-eng-the-clock-that-stopped` | The Clock That Stopped | 405 | ✓ |
| `ei003-w2-eng-crossing-the-fen` | Crossing the Fen | 392 | ✓ |
| `ei003-w2-eng-the-attic-workshop` | The Attic Workshop | 396 | ✓ |

All 6 word counts match exactly the values computed and asserted by migration 241's own postcondition block.

## C. Production-source text/hash integrity

**Material finding, disclosed in full**: the stored `original_text` for all 6 passages contains CRLF line endings, even though the source (`ei003Wave2Passages.ts`) and the migration file's own git-stored blob were both independently verified to contain 0 CRLF bytes. This confirms the exact risk class the migration's defensive design anticipated — a copy/paste round-trip through the Supabase SQL Editor reintroduced CRLF. This is why migration 241 wrapped every comparison in `regexp_replace(text, E'\r\n|\r', E'\n', 'g')` rather than a raw equality check: that defense worked as intended, since the migration's own postcondition assertions (which use the identical normalisation) evidently passed — the migration would have raised an exception and rolled back otherwise, and the 6 rows would not exist.

Re-verified independently this task, against the real stored text: **6/6 exact canonical matches, 0 content drift** (comparing `regexp`-normalised production text to the exact frozen `ei003Wave2Passages.ts` source, done in-browser against the live rows). Byte-level, the stored text is longer than the source by exactly the passage's own newline count (e.g. relay-baton: 2257 stored vs. 2237 source = 20 extra bytes, matching its newline count) — consistent with a pure CRLF insertion at every line break, nothing else. No stored hash field exists to separately verify (§A).

## D. 40/40 passage dependency reconciliation

Verified against **real production passage rows** (not source): all 40 frozen candidates' `passageId` values resolve to one of the 6 now-registered passages. 40/40 resolved, 0 unresolved.

## E. Quote/evidence integrity

Re-ran the full evidence-quote check for all 40 candidates directly against the **raw, CRLF-containing, real stored** `ali_passage_bank.original_text` (deliberately not pre-normalised, to prove real-world `.includes()` matching succeeds against what production actually holds): **0 quote-integrity failures.** Every evidence quote is a single-sentence substring that never itself spans a line break, so the CRLF insertion at paragraph boundaries has no effect on quote matching. 0 stale evidence references, 0 passage mismatches.

## F. Admin identity verification

Re-confirmed live, immediately before any write: `email = the Founder admin account`, `is_anonymous = false`, `is_current_user_admin() = true` (RPC call, HTTP 200, returned `true`). No service-role bypass. No role change. No direct table write — every write went through `submit_question_candidate()` exclusively.

## G. Pre-submit collision check

- **0 unexplained collisions** against `ali_question_candidate`: none of the 40 frozen candidate IDs existed before this submission.
- **0 unexplained collisions** against the published question bank: none of the 40 `qf-`-prefixed published IDs existed.
- **0 residual Wave 2 candidate rows** from the prior failed batch-1 attempt — re-verified directly by query immediately before submission (not assumed from the earlier report), confirming the earlier `23503` failures truly left no trace.

## H. Candidate submission result

Submitted in 5 bounded batches of 8 (matching the 5 families), via `submit_question_candidate()` exclusively — no direct writes, no candidate content regenerated, no candidate IDs altered.

| Batch | Family | Attempted | Successful | Failed |
|---|---|---|---|---|
| 1 | sequencing | 8 | 8 | 0 |
| 2 | comparative | 8 | 8 | 0 |
| 3 | emotion | 8 | 8 | 0 |
| 4 | atmosphere-mood | 8 | 8 | 0 |
| 5 | word-choice | 8 | 8 | 0 |
| **Total** | | **40** | **40** | **0** |

Every one of the 40 RPC calls returned HTTP 200 with the expected candidate ID echoed back. No batch partially failed; no reconciliation-after-partial-failure was needed.

## I. Candidate-store read-back

Queried `ali_question_candidate` directly for all 40 candidate IDs: **40 stored = 40 submitted.** Confirmed programmatically, not assumed.

## J. 8/8/8/8/8 family reconciliation

| Family | Stored count |
|---|---|
| `wave3-fam-rc06-sequencing` | 8 |
| `wave3-fam-rc07-comparative` | 8 |
| `wave3-fam-rc08-emotion` | 8 |
| `wave3-fam-rc10-atmosphere-mood` | 8 |
| `wave3-fam-rc10-word-choice` | 8 |

Exact match to the frozen manifest.

## K. 20/20 blueprint reconciliation

20 distinct `generation_spec_id` (blueprint) values found among the 40 stored rows, **every one with exactly 2 candidates** — verified programmatically against the actual stored rows, not assumed from arithmetic.

## L. Stored educational-field preservation

For all 40 stored rows, confirmed present and correct: deterministic `candidate_id`; `subject = 'english'` (40/40); `family_id`; `generation_spec_id` (blueprint reference); `passage_id` (40/40 non-null); `difficulty` (full spread: easy/medium/hard/challenge represented); `question_content.question` (40/40 non-empty); `claimed_answer` (40/40 non-empty); `question_content.evidenceQuotes`; `worked_explanation` (40/40 non-empty); `provenance` (`question_factory_wave1`, the table's own default — no provenance parameter exists on `submit_question_candidate()`, matching the exact Wave 1 precedent); eligibility intent is implicit (all `pending_review`/`unpublished`, i.e. not yet eligible for anything).

## M. 40/40 pending_review confirmation

**Confirmed: 40/40 `review_status = 'pending_review'`.**

## N. 0/40 published confirmation

**Confirmed: 40/40 `publication_status = 'unpublished'`.** `review_question_candidate()` and `publish_question_candidate()` were not called at any point in this task.

## O. Material defects/findings

1. **No submission defects.** All 40 candidates submitted cleanly on the first attempt, in the first pass through each batch — the migration fix (`241`) fully resolved the prior blocker.
2. **Confirmed, disclosed CRLF drift** (byte-level only): the Supabase SQL Editor round-trip reintroduced CRLF into all 6 stored passage texts. This has **zero practical effect** on this wave's 40 candidates (no evidence quote spans a line break) and **zero effect on canonical correctness** (the migration's own normalised postcondition check passed, and this task's independent re-verification confirms 6/6 canonical matches). It is reported because the Founder's instruction explicitly asked for byte/text integrity verification, and because it is genuinely useful, disclosed evidence for any *future* Wave that might author a quote spanning a paragraph break — such a quote could fail a naive raw-text `.includes()` check against this specific stored data, though nothing here does.
3. No pre-existing unrelated content or test was touched or reopened.

## P. GO / REVISE / NO-GO FOR CONTROLLED REVIEW AND PUBLICATION

**GO.**

The full chain is now verified end-to-end against live production data on both sides (real stored passages, real stored candidates): 6/6 passages registered and canonically intact, 40/40 candidates submitted and stored, 8/8/8/8/8 family depth preserved, 20/20 blueprints preserved at 2 candidates each, 0 quote-integrity failures, 0 collisions, all 40 sitting at `pending_review`/`unpublished` exactly as intended. The educational content itself (frozen at `b3c6bfa`) was not reopened, redesigned, or regenerated anywhere in this step.

**STOP. Do not review. Do not publish. Do not begin Wave 3.**
