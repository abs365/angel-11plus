# CSSE: controlled Founder execution packages (A: 374 Practice candidates, B: migration 273, C: migration 274)

**Nothing in this document has been run. Nothing is applied, submitted or published. STOP after reading; act only when you choose.**
All BEFORE values were captured **read-only** from production on 2026-10-09. Candidates were **not regenerated** and the six trimmed candidates are **not included**: the six submit scripts and the manifest are byte-identical to the previous return (their SHA256 are unchanged below).

Authoritative commits: `bfea0e5` (candidates, submit scripts, manifest, migration 273), `7fd556a` (migration 274), `71c599a` (guarded approve-and-publish script, runbook, verification SQL). Rollback files and this document are in the commit that introduces this document (see the reply). Files are plain LF text; the SHA256 is of the file content as committed.

One correction made while preparing this package (disclosed, not hidden): the earlier guarded approve-and-publish script called `review_question_candidate` with the default review method **`individual`**, which would have recorded that each variant was individually reviewed. You approved by blueprint, so the script now records **`controlled_batch_sampling`** with a genuine `approval_basis` (blueprint id, governance chain, decision pack, your decision of 2026-10-08, the verification evidence, the disclosed risks). Only that script changed; no candidate changed.

---

## A. The 374 Practice candidates: execution sequence

### 0. Before you start (read-only checks, no changes)

1. Confirm the live site was built from commit `bfea0e5` or later (Vercel, Deployments, latest production deployment Ready). The marking fixes and all five representation renderers must be live before learners see these questions.
2. Download the files from commit `71c599a`/`bfea0e5` and check SHA256 (`sha256sum`) before pasting:

| File | Commit | SHA256 |
|---|---|---|
| `submit-context.js` (134) | bfea0e5 | `42a51f7031153f60f8324ee7c99d0285f4a370182b4f19b4eee991751e974e9d` |
| `submit-data-handling.js` (48) | bfea0e5 | `b87f9058c715c124843106e0a31fd3e7dd78ff2618117fac9a7e144f127a10a2` |
| `submit-breadth.js` (96) | bfea0e5 | `a0b27cfc4b8ac66b2a9666df01600e91078c7d19de960977625075853f6aea31` |
| `submit-grid.js` (40) | bfea0e5 | `26b12c76bf2cbf3deef8c967b0ecd084db82c149e6d51ed6b5beb09ed88da9e0` |
| `submit-angle.js` (32) | bfea0e5 | `46246b88fcd3ba7537d7ef3c12678dd10b473d5a156c2dce8c5abe032d257dea` |
| `submit-numberline.js` (24) | bfea0e5 | `0a7a43dda474c52934cc586b376abb0f76ab2cec8cd5fcec4f19860dc0ce6581` |
| `review-and-publish-GUARDED.js` (374) | 71c599a | `d908beaea90f0a92e7f2501f5c3d33431b7b0c6b3861acedac0c6cb1eeb16e91` |
| `manifest.json` | bfea0e5 | `8bf7384a7b1e483e2d04b7180d28328b5ffb80012685b01561fa3753b96d792a` |
| `01-practice-374-verification.sql` | 71c599a | `9306b086f266e1709decdab207b4ab2c7187a7e670f9d9737c7f5e8ecb5d60b6` |

All files are under `scripts/output/csse-practice-publication-package/` except the SQL, which is under `scripts/output/founder-execution/`.

3. **BEFORE state (read-only, captured):** candidates table 579 rows (30 pending, 549 published), none with a `csse-` id; bank 1,143 rows; Practice: Maths 587, English 306, Writing 8, **total 901**; every row of the bank other than the Salmon and Great Stink rows has hash `1ec47ab8efc9ffee02822989e523c84f` (1,132 rows).

### 1. Candidate submission (admin session, six scripts, in this order)

For each script: signed in as the ADMIN account on the live app, DevTools > Console, paste the whole script, Enter. Each calls only `submit_question_candidate` (pending, unpublished). Expected last line of each: `Done: N/N submitted.` with N = 134, 48, 96, 40, 32, 24 (context, data-handling, breadth, grid, angle, number-line). **Stop at the first `FAIL`; do not re-run a script that partly succeeded** (a re-run would fail on the duplicate ids; report instead).

### 2. Verification of pending state (read-only: `01-practice-374-verification.sql`, blocks 2a to 2d)

Expected: `csse_total` 374, `csse_pending_unpublished` 374, `all_candidates` 953, `all_pending` 404, `all_published` 549; by set `af 32, br 96, ctx 134, dh 48, gr 40, nl 24`; the six trimmed ids absent (0); Practice still 587 / 306 / 8 = 901 and bank 1,143. **If any value differs, stop and report.**

### 3. Governed approval and publication (only after step 2 passes and you confirm)

Open `review-and-publish-GUARDED.js`, change exactly `FOUNDER_AUTHORISED = false` to `true`, run it in the same admin console. For each of the 374 candidates it calls `review_question_candidate(id, 'approved', method 'controlled_batch_sampling', approval_basis {blueprint, governance, decision pack, your decision, evidence, risks})` and then `publish_question_candidate(id)`. Each publication creates one bank row `qf-<candidate id>`, `practice_eligible`, active, with the answer merged in. Expected last line: `Done: approved 374/374, published 374/374, already published 0.` A candidate already published is skipped, so a re-run is safe. **If any `APPROVE FAIL` or `PUBLISH FAIL` appears, stop and report; nothing is repaired automatically.** Note: there is no automatic un-publish; withdrawing a published question would be a separate governed deactivation, which is why step 2 comes first.

### 4. AFTER verification (read-only: blocks 4a to 4g of the same SQL file; 4h with the repository)

Expected: 4a one row `approved / published / controlled_batch_sampling / 374`; 4b `published_rows` 374, `missing_answer` 0, `wrong_status` 0; 4c `unmapped` 0; 4d difficulty easy 46, medium 152, hard 176 and stimulus types none 182, table 72, bar-chart 24, coordinate-grid 40, angle-figure 32, number-line 24; 4e inventory below; 4f the other bank rows still 1,132 with hash `1ec47ab8efc9ffee02822989e523c84f` (nothing else changed); 4g all zeros (no Mock form, exposure or attempt, no Mock status). 4h: run the real marker and the representation validators over the exported prompts, then a real-browser pass with a Founder-created TEST learner (one question per representation, phone width), which is also Part 3 of `ANGEL_CSSE_FOUNDER_ACCEPTANCE_REMEDIATION_MASTERY.md`.

### 5. Expected final Practice inventory

| | Before | After |
|---|---|---|
| Maths practice-eligible | 587 | **961** |
| English practice-eligible | 306 | 306 |
| Writing practice-eligible | 8 | 8 |
| **Total practice-eligible** | **901** | **1,275** |
| Bank rows | 1,143 | 1,517 |
| Candidate rows | 579 | 953 (pending 30, published 923) |

The six trimmed candidates remain in the repository only: never submitted, never published, not deleted. The zero exact-text crossover between generated Practice material and sealed Form B content remains a regression guard (`tests/lib/ali/questionFactory/mockFormBMaths.test.ts`, about 9,500 draws), alongside the live exact-duplicate check (0 matches against 710 live rows).

---

## B. Migration 273: Great Stink sealed, Salmon rejected and replaced

| | |
|---|---|
| Exact filename | `supabase/migrations/273_english_form_b_salmon_replacement_TEMPLATE_NOT_APPLIED.sql` (to be renamed `…_APPLIED_DO_NOT_RERUN.sql` by me only after you confirm it ran) |
| Exact commit | `bfea0e5` |
| SHA256 | `9068271d4819fe1817445a1b49aea070b3a832a313e1fd5184e181d5d841b818` |
| Applied by | the Founder only, in the Supabase SQL editor, once. **Not applied by me.** |
| Transaction | one explicit `begin; … commit;`: if any statement fails, nothing is changed |
| Checked without running | parsed by the real PostgreSQL grammar (libpg-query): 5 top-level statements, no errors; the passage insert has 16 columns and 16 values, the question insert 18 columns and 18 values in all 11 rows; all 11 JSON bodies are valid. The one `DO` block was read against the table constraints below. |

**Exact rows affected (26 changes, 0 deletes, no DDL):**

| Table | INSERT | UPDATE |
|---|---|---|
| `ali_passage_bank` | 1 (`eng-fb-greatstink`) | 1 (Salmon passage: `active` true to false) |
| `ali_question_bank` | 11 (`eng-fb-greatstink-q01` to `q11`) | 11 (the Salmon rows: 10 original questions plus `eng-fb-salmonnavigation-q08`; `active` true to false) |
| `ali_family_review` | 2 (Great Stink `pending_independent_review`; Salmon `rejected`) | 0 |

**BEFORE (captured):** Great Stink passage rows 0, question rows 0, review rows 0. Salmon passage `authentic_assessment_candidate`, active; Salmon questions 11, all `authentic_assessment_candidate`, all active; Salmon review rows 2 (`approved`, `pending_independent_review`). Salmon is referenced by 0 Mock forms, 0 exposure rows, 0 attempts, 0 candidates. Counts: bank 1,143; passages 40; review rows 315; functions 56. Baseline hashes: other bank rows `1ec47ab8efc9ffee02822989e523c84f` (1,132 rows); other passages `01db9646d743f6104bb3936c027226d3`; other review rows `fda9bb9f76641d4e2c78a59e9a60318d`; all functions `d757a642c8bcb273e78924a6ddd7357c`; Salmon question content `086890d4f297f55b18bd7b83d55d985b`; Salmon passage text md5 `d9664bcb23421f804554931dc5a723a4`.

**Expected AFTER:** Great Stink passage 1 row (`authentic_assessment_candidate`, active, `{csse}`, 530 words, text md5 `ea793ad48685208cc0a1ecd65722283c`); 11 questions (all candidates, `{csse}`, learning unit `eng-fb-greatstink`, 18 marks in total; tiers: TIER2 7, TIER3 1, TIER4 1, TIER5 2); Great Stink review: 1 row `pending_independent_review` and nothing else; Salmon: passage and 11 questions still present, `authentic_assessment_candidate`, **active false**, content hashes unchanged, review rows 3 (`approved`, `pending_independent_review`, `rejected`). Counts: bank 1,154; passages 41; review rows 317. All other-row hashes and the function hash identical to BEFORE.

**Permissions and governance impact:** none. No function, grant, policy, RLS setting, view or table definition is touched (the function hash is unchanged); RLS stays on all four tables with 1, 1, 1 and 2 policies. The single trigger that fires, `ali_question_bank_block_exposed_practice_promotion` (BEFORE UPDATE on the bank), acts only when a row is promoted **to** `practice_eligible`; the Salmon update changes only `active`, so it cannot fire its block. The `rejected` review row satisfies the table's constraints (notes present; allowed `review_type` and target type). The Salmon `rejected` row is dated after its earlier `approved` row; the earlier approval is preserved, not altered.

**Great Stink remains sealed and pending human validation: confirmed.** Every Great Stink row is `authentic_assessment_candidate`; none is `practice_eligible`, `mock_eligible` or `independently_validated`; nothing registers it in any Mock form; it has only a pending-review row and no decision; the Mock composer needs `mock_eligible` and Practice publication needs the governed submit, approve and publish path, none of which this migration invokes. Running the migration does not make it validated, exposed, Practice-eligible or Form B.

**Salmon is preserved as rejection evidence, not deleted: confirmed.** The migration deletes nothing; it deactivates the Salmon rows and adds the rejection record. The code guard (`lib/ali/rejectedMockContent.ts`, in the deployed build) independently refuses Salmon in the Mock composer and manifest validator.

**Run-once status:** run once. It is written to be repeat-safe (inserts use `on conflict do nothing` or `where not exists`; the updates are idempotent) but treat it as run-once. After AFTER verification passes I will mark it `MIGRATION 273 APPLIED: DO NOT RERUN`.

**AFTER verification procedure:** run `scripts/output/founder-execution/02-migration-273-verification.sql` blocks A to I (read-only) and compare with the expected values written beside each block (A passage, B questions, C tiers, D sealed, E reviews, F Salmon preserved, G Salmon content identical, H nothing else changed, I inventory, permissions and functions unchanged). Any difference: report, do not repair. SHA256 of that file: `64dbee565d7bb260d597828cac83370c6de8ddc9d0401041fbd3c38d09d729e2` (commit `71c599a`).

**Rollback (only if you ask, and only before validators begin work):** `scripts/output/founder-execution/273-ROLLBACK-remove-additions-reactivate-salmon.sql` (SHA256 `98737e02213c6d4967f13cf5aed843f66bc50bb76f7106ea4f7a6cae4d4641f1`), scoped to explicit ids. Not part of the sequence.

---

## C. Migration 274: Mock Maths coordinate-answer robustness

| | |
|---|---|
| Exact filename | `supabase/migrations/274_mock_maths_coordinate_answer_normaliser_TEMPLATE_NOT_APPLIED.sql` (to be renamed `…_APPLIED_DO_NOT_RERUN.sql` by me only after you confirm) |
| Exact commit | `7fd556a` |
| SHA256 | `65205e921742cdeb3a4fa62b33e9793cf883ce79a5855a7084713c7f7e8fb8a1` |
| Applied by | the Founder only, once. **Not applied by me.** |
| Checked without running | parsed by the real PostgreSQL grammar: one `CREATE FUNCTION`, no errors. The function body is compiled by PostgreSQL when the statement runs; a body error would make the statement fail and leave the current function untouched. |

**Exact function and contract changed:** `public.mock_score_attempt(uuid)`, the Mock scorer's comparison step. It gains **one** branch, reached only when the **stored answer** is a coordinate pair `(x, y)` (two plain decimal numbers in brackets). Nothing else in the function changes: **proved, not asserted.** The live function's code (comments and whitespace removed) has hash `28840b5d4a9b9e0300b040f458123676`; the migration's function with exactly its three declared additions removed (3 declarations, 2 assignments, 1 branch) has the same hash; the migration's function as written has hash `2315004514e2d5a20897d826b8c96519`.

**BEFORE behaviour:** a non-numeric answer is compared as exact text (capitals and outer spaces ignored). So a correct coordinate typed `(9,5)` against a stored `(9, 5)` is marked **wrong**.

**Expected AFTER behaviour:** for a coordinate-type stored answer, the response is accepted if it is also a bracketed pair and **both numbers equal** the stored ones (tolerance 0.0001), ignoring spaces and the Unicode minus. Otherwise unchanged.

**All accepted cases (run read-only on production literals; before, after):**

| Stored | Response | Before | After |
|---|---|---|---|
| (9, 5) | (9, 5) | accepted | accepted |
| (9, 5) | (9,5) | **rejected** | **accepted** |
| (9, 5) | ( 9 , 5 ) | rejected | accepted |
| (9, 5) | (9 ,5) | rejected | accepted |
| (9, 5) | ` (9,5) ` (outer spaces) | rejected | accepted |
| (9, 5) | (9.0, 5) | rejected | accepted |
| (7, -4) | (7,-4) | rejected | accepted |
| (7, -4) | (7,−4) (Unicode minus) | rejected | accepted |
| (-3, 6) | (-3,6) | rejected | accepted |
| (0, 0) | (0,0) | rejected | accepted |
| (2.5, 4) | (2.50,4) | rejected | accepted |

**All rejected cases (rejected before and after):** `9, 5` and `9,5` (no brackets); `(5, 9)` (reversed); `(9, 6)` (different number); `(3, 6)` against `(-3, 6)` (sign dropped); `(9, 5, 1)` (three values); `(9;5)` (wrong separator); `(9 5)` (no separator); `(9,,5)` (malformed); `(nine, 5)` (not numbers); `(9, 5` and `9 5)` (unbalanced).

**Not weakened (unchanged before and after):** `15:50` accepts only `15:50` (`1550` and `3:50pm` rejected); `true` accepts `TRUE` but not `yes`; `B` accepts `b` but not `(B)`; `2.10` accepts `2.1` (numeric path) but not `£2.10`; a non-coordinate `(9)` accepts only `(9)`. The numeric path, exact-text path, manual-marking and marking-mode safety, grouping metadata, idempotency and the `like '%;%'` guard are all preserved.

**Scope: restricted to the coordinate marking contract.** Stored answers of coordinate form among Mock rows: exactly four: `mock-mr08-rotation-01` and `mock-mr08-rotation-02` (live, mock_eligible) and `mock-fb-mr08-reflect-01` and `mock-mr05-numberpyramid-02` (sealed candidates). (42 Practice rows also have coordinate answers; the Mock scorer never scores them, and Practice already uses the governed normaliser in the deployed build.) `mock-mr11-impossibletotal-03` stores `8, 5` (no brackets) and is **not** affected.

**Permissions and governance impact:** none. `CREATE OR REPLACE` keeps the owner (`postgres`), `SECURITY DEFINER`, `search_path = public` and the ACL `{postgres=X/postgres, service_role=X/postgres}` (the scorer is callable by the service role only, and stays so). No other function changes (hash of all other functions `fc1a600394751a47e5f95cfe788a284b`, 56 functions in all, unchanged).

**Run-once status:** `CREATE OR REPLACE` is idempotent; run once. After AFTER verification passes I will mark it `MIGRATION 274 APPLIED: DO NOT RERUN`.

**AFTER verification procedure:** `scripts/output/founder-execution/03-migration-274-verification.sql` blocks A to F (read-only): A normalised code hash `2315004514e2d5a20897d826b8c96519`; B attributes unchanged; C no other function changed; D the new branch present and the old branches preserved; E the four affected rows; F the case table (first eleven accepted, the rest rejected). Then block G: an acceptance sitting on a Founder-created TEST learner (a test attempt answering a coordinate item as `(9,5)`-style is scored correct; `(5, 9)` incorrect; `1550` for a stored `15:50` still incorrect). SHA256 of the SQL file: `8568eb5f9b13e2e223496164d0e28bd52befd0cee8fa4e8f8766f14c827f1f7b` (commit `71c599a`).

**Rollback (only if you ask):** `scripts/output/founder-execution/274-ROLLBACK-restore-previous-function.sql` (SHA256 `a7fb3beb5044dbaa17b04017c9d24714c4403a016f2bbde45bb20a0c917235fb`): the function with the three additions removed, whose code hash was verified equal to the live pre-274 function. After running it, block A must read `28840b5d4a9b9e0300b040f458123676`.

---

Not touched by this package: migrations 268 and 270 (not authorised), Form B activation, Writing Q1 and Q2, calibration. **Waiting for Founder action.**
