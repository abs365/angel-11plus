# ANGEL 11+ — EI003 WAVE 2 PASSAGE REGISTRATION APPLICATION PACKAGE

Status: migration prepared, statically validated, committed, and pushed. **NOT applied to Supabase.** Candidate submission NOT retried. Nothing reviewed or published. Wave 3 not begun.

---

## A. Root cause confirmation

`ali_passage_bank` is RLS-enabled (migration 054) with an admin-only **SELECT** policy and **no INSERT/UPDATE/DELETE policy of any kind** — migration 054's own comment states this outcome explicitly: *"Passage authoring and any correction remain Founder-applied migrations, exactly as before."* This was independently re-confirmed live this task: an authenticated admin session's own attempted `INSERT` into `ali_passage_bank` was rejected with Postgres error `42501` ("new row violates row-level security policy"), zero residual rows. There is no governed RPC for passage authoring anywhere in this codebase (searched all 241 migrations for a `submit`/`register`-style passage function — none exists, confirmed again this task). Every one of the 34 existing passages was registered the same way: a direct, hand-written `insert into public.ali_passage_bank` SQL migration, Founder-applied via the Supabase Dashboard (precedent: migrations 044, 045, 049, 051, 063, 097, 152, 161, 166, 191, and others — migration 045 in particular is the closest structural precedent: idempotent, `WHERE NOT EXISTS`, dollar-quoted literals). This is not inferred from TypeScript types — it is read directly from the applied SQL migration history and re-verified against live production behaviour.

## B. Exact production passage-bank contract

From migration 043 (original `CREATE TABLE`, unaltered since except RLS in 054) and live sampling:

| Column | Type | Nullable | Notes |
|---|---|---|---|
| `id` | text | **PK, not null** | Convention: equals the shared `learning_unit_id` of its questions |
| `title` | text | not null | |
| `original_text` | text | not null | |
| `text_type` | text | nullable | Free text, uncatalogued vocabulary; live convention: `'narrative-extract'` for narrative content, `'informational'` for expository/science content |
| `genre` | text | nullable | Free text, no CHECK constraint |
| `word_count` | integer | nullable | No CHECK; not independently verified by the DB |
| `reading_complexity` | text | nullable | |
| `provenance` | text | nullable | **CHECK**: `'angel_original', 'generated_original', 'licensed', 'public_domain', 'authorised_import', 'evidence_only'` |
| `copyright_status` | text | nullable | Free text |
| `pathway` | text[] | not null, default `'{}'` | |
| `content_difficulty` | text | nullable | Reuses `easy/medium/hard/challenge` vocabulary by convention, not DB-enforced |
| `content_version` | integer | not null, default 1 | **CHECK** `>= 1` |
| `eligibility_status` | text | not null, default `'provisional'` | **CHECK**: `'provisional', 'practice_eligible', 'authentic_assessment_candidate', 'independently_validated', 'mock_eligible'` |
| `active` | boolean | not null, default true | |
| `passage_family_id` | text | nullable | Groups structurally-similar-but-textually-distinct passages; indexed |
| `review_state` | text | nullable | Mirrors `ali_family_review`'s vocabulary by convention |
| `created_at` / `updated_at` | timestamptz | not null, default `now()` | |

No hash/integrity/checksum column exists anywhere in the schema (confirmed: no migration anywhere references `content_hash`, `sha256`, `digest(`, or `md5(` against this table). **UNIQUE**: only the primary key (`id`) — no unique constraint on title or text. RLS: enabled, admin-only SELECT, no write policy (§A). **FK to `ali_question_candidate`**: `ali_question_candidate.passage_id` carries a foreign key (`ali_question_candidate_passage_id_fkey`) to `ali_passage_bank.id`, confirmed live via the real `23503` constraint-violation error from the prior submission attempt — this exact constraint is not visible in any locally available migration file (the live schema has evolved beyond what `230_question_factory_candidate_lifecycle.sql` shows), so its existence was confirmed by live behaviour, not source reading alone, per this task's own instruction.

## C. Six-passage manifest

| Passage ID | Title | Genre | Word count |
|---|---|---|---|
| `ei003-w2-eng-the-relay-baton` | The Relay Baton | fiction_narrative | 390 |
| `ei003-w2-eng-the-last-delivery` | The Last Delivery | fiction_narrative | 424 |
| `ei003-w2-eng-the-glass-frog` | The Glass Frog's Hidden Trick | nature_science | 374 |
| `ei003-w2-eng-the-clock-that-stopped` | The Clock That Stopped | human_interest_memoir | 405 |
| `ei003-w2-eng-crossing-the-fen` | Crossing the Fen | travel_exploration | 392 |
| `ei003-w2-eng-the-attic-workshop` | The Attic Workshop | descriptive_prose | 396 |

Genre values reuse Wave 2's own already-approved, already-reported taxonomy (`ei003Wave2Passages.ts`'s own `genre` field), not the older, inconsistent ad-hoc production vocabulary — the column is free text with no CHECK constraint, so this is a deliberate consistency choice, not a fabrication.

## D. Passage hashes/word counts

No canonical hash convention exists anywhere in this codebase or its migration history (searched exhaustively — no hash column, no hashing utility script). SHA-256 hashes below were computed by this task specifically for content-integrity tracking (not stored in the DB, which has no such column):

| Passage ID | SHA-256 (CRLF-normalised text) |
|---|---|
| `ei003-w2-eng-the-relay-baton` | `248511f5517db6dfd97eea298f85efb0c0a4e0999c5bc69edb41081185c0b64b` |
| `ei003-w2-eng-the-last-delivery` | `ab46a1c5a569085c7fa876138bc68bc15ea5a408a9cbb8e43173102d1bb1d005` |
| `ei003-w2-eng-the-glass-frog` | `73087343bd69f4f5b12b640bd11f04489e5d1dc6364945652a33d0885645da94` |
| `ei003-w2-eng-the-clock-that-stopped` | `ece2d75ab5cc73270bf2429b4a252fa4b3ff0b64750f06c0fb5cc2aaeba1fc1f` |
| `ei003-w2-eng-crossing-the-fen` | `928c013520dd67d8cb60f7df4f121979a406909b92f8e4de8ae51b573cb5591f` |
| `ei003-w2-eng-the-attic-workshop` | `03852f828353795dc0ad1ce3329f5ab9c72c061dd768811897b02fa76beb3f43` |

**CRLF/LF disclosure**: I could not find a written record in this repository of a specific prior "CRLF/LF hashing problem" incident (searched for "CRLF" and related terms across the whole repo: no matches). What I *did* independently confirm, live, is a real and concrete risk factor of the same class: this repo's `.gitattributes` (`* text=auto`) combined with `core.autocrlf=true` on this machine means a file's git-stored blob (LF) can differ from its working-directory bytes (CRLF) after a checkout. The six passage source texts were verified byte-for-byte to already contain **0 CRLF sequences** in the working copy (checked before any SQL was generated). The migration's dollar-quoted literals were generated programmatically, directly from that same source, and after commit the git-stored blob was independently re-verified to contain 0 CRLF / 534 bare-LF bytes. As a second, defensive layer (not because the source needed it, but because the risk is about what happens to the file *after* this task, during copy/paste into the Supabase SQL Editor), every text comparison inside the migration itself wraps both sides in `regexp_replace(text, E'\r\n|\r', E'\n', 'g')` before comparing — so the migration's own correctness does not depend on surviving that step untouched.

## E. 40-candidate dependency reconciliation

Verified programmatically (`scripts/build-ei003-wave2-passage-registration-evidence.mjs` and `scripts/validate-migration-241-passage-registration.mjs`, both against the migration file itself, not just the source): **40/40 candidates resolve** to one of the six passage IDs above. 0 unresolved. Per-passage candidate counts (unchanged since the passage-diversity correction): relay-baton 7, last-delivery 9, glass-frog 1, clock-that-stopped 9, crossing-the-fen 9, attic-workshop 5 — sums to 40.

## F. Quote/evidence integrity result

**0 quote-integrity problems.** Every one of the 40 candidates' `evidenceQuotes` was independently re-verified as an exact substring of the *exact CRLF-normalised text embedded in the migration file itself* (not merely the TS source in isolation) — this is the strict standard the Founder's own §4 instruction required ("the database passage text must be the same educational text used during quote/evidence validation"), and it is now proven true by construction: the migration's dollar-quoted literals were generated programmatically from the identical source, and the static validator re-parses the committed migration file and re-runs the full quote check against what it actually contains.

## G. Collision check

- **ID collision**: 0/6 — none of the six target passage IDs exist in `ali_passage_bank` (34 total rows currently, all inspected).
- **Title collision**: 0/6 — none of the six titles ("The Relay Baton", "The Last Delivery", "The Glass Frog's Hidden Trick", "The Clock That Stopped", "Crossing the Fen", "The Attic Workshop") match any of the 34 existing titles (full id/title list inspected directly).
- **Content/hash collision**: not independently checkable against existing rows (no hash column exists in the DB to compare against, and reading and hashing all 34 existing passages' full text was outside this task's bounded scope) — but given 0 ID and 0 title collisions, plus all six being newly authored original content this wave, a genuine content collision is not plausible and none was found via the title/id checks performed.
- **No materially similar existing passage** was found by inspection of the full title list — the closest genre neighbours (e.g., `wave3-eng-lettertograndad`, an epistolary piece, vs. none of the six being epistolary; `eng-inc001-bee-navigation`, science/nature, vs. `ei003-w2-eng-the-glass-frog`, also nature/science but a wholly different subject — bees vs. glass frogs) are topically adjacent but textually and substantively distinct, not duplicates.

**Result: 6 genuinely new passages, as expected. No stop condition triggered.**

## H. Exact migration filename

`supabase/migrations/241_ei003_wave2_passage_bank_registration.sql`

## I. Exact rows the migration will create

Exactly 6 rows in `ali_passage_bank`, one per passage in §C, each with: `text_type` = `'narrative-extract'` (five passages) or `'informational'` (the glass-frog science passage, matching the live convention already used by `eng-inc001-bee-navigation`); `provenance` = `'angel_original'`; `copyright_status` = `'Angel original, unpublished; no external rights holder'` (verbatim match to every existing Wave passage's own value); `pathway` = `{csse}`; `content_version` = `1`; `eligibility_status` = `'provisional'` (the universal default at registration — promotion is always a later, separate step, precedent: migration 221); `active` = `true`; `content_difficulty`, `reading_complexity`, `passage_family_id`, `review_state` = `null` (deliberately, disclosed in §J — no genuine single value exists for any of these four fields for these six passages, and two of the four already have precedent as `null` on existing rows). No other table is touched.

## J. Fail-closed protections

- **No `ON CONFLICT DO UPDATE`** anywhere in the file (statically verified).
- **Precondition block** (`do $$ ... end$$;` before the `insert`): for each of the six target IDs, if a row already exists, the migration verifies its `title` AND its (CRLF-normalised) `original_text` match the expected passage *exactly*; if either differs, the entire migration `raise exception`s and rolls back — it never silently reuses or overwrites a different passage under the same ID.
- **Idempotent insert**: `insert ... select ... where not exists (...)` — a row that already exists and already matches is simply left alone (correctly, since it's already correct); a row that doesn't exist yet is inserted; there is no path that overwrites.
- **No service-role credential, no browser/RPC write** was used or attempted to create this evidence — the RLS-rejection probe in §A used the existing authenticated admin session and was itself proof the write path doesn't exist, not an attempt to use one.

## K. Postcondition assertions

A second `do $$ ... end$$;` block after the `insert` asserts:
1. Exactly 6 rows exist among the six target IDs (`count(*) ... <> 6` → exception).
2. For each of the six IDs individually: the row exists with the exact expected `title`, the exact expected (CRLF-normalised) `original_text`, the exact expected `word_count`, `provenance = 'angel_original'`, `eligibility_status = 'provisional'`, and `active = true` — any mismatch raises an exception naming the specific passage ID.

No non-target `ali_passage_bank` row is touched by any statement in this file (statically verified: exactly one `insert into` statement in the whole file, targeting only `ali_passage_bank`, and no `update`/`delete` statement anywhere).

## L. Tests/validation result

- **Static migration validation** (`scripts/validate-migration-241-passage-registration.mjs`, run against the actual committed file): **PASS** — 6/6 passage identities present with correct occurrence counts, all 6 passage texts appear in the migration and match the source exactly, 40/40 candidates resolve, 0 quote-integrity problems, no `ON CONFLICT DO UPDATE` in executable SQL, exactly one `INSERT` statement targeting only `ali_passage_bank`, header discloses `NOT APPLIED`.
- **Zero drift**: `git diff --stat b3c6bfa -- <the 5 family files + passages file>` is empty — confirmed no candidate or passage content was regenerated or altered since the frozen, approved commit.
- **Existing Wave 2 regression evidence, re-run and unchanged**: `scripts/validate-ei003-wave2-manifest.mjs` → `DETERMINISTIC VALIDATION: PASS` (40 candidates, 20 blueprints, 6 passages, 0 problems); `tests/lib/learningEngine/englishExamStrategiesWave2Inference.test.ts` → 5/5 pass.
- **Typecheck**: the 4 new files (migration-241 generator, static validator, evidence-builder, and the migration's own generated `.sql`) introduce 0 TypeScript errors.
- No pre-existing unrelated failure was reopened or re-investigated — out of scope for this bounded repair.

## M. Source-control status/commit

**Committed and pushed.** Commit **`500714b14df2fd8145a025ee4a44f8d136ccf3d6`** on `main` (`b3c6bfa..500714b`), message: *"fix(supabase): EI003 Wave 2 passage-bank registration migration (NOT applied)"*.

Exact file list (4 files, 920 insertions, 0 deletions, nothing unrelated bundled):
- `supabase/migrations/241_ei003_wave2_passage_bank_registration.sql` (new — the migration itself)
- `scripts/generate-241-ei003-wave2-passage-bank-registration.mjs` (new — generates the migration programmatically from the canonical source, for reproducibility/audit)
- `scripts/validate-migration-241-passage-registration.mjs` (new — the static regression check described in §L)
- `scripts/build-ei003-wave2-passage-registration-evidence.mjs` (new — the hash/word-count/dependency evidence-building script behind §C-F)

The git-stored blob for the migration file was independently re-verified after commit to contain 0 CRLF bytes (534 bare LF), confirming the repository-canonical content is exactly what was generated from source, regardless of this Windows working directory's own `core.autocrlf` behaviour on future checkouts.

Committed per the instruction's own condition: this repository's normal workflow keeps every migration — including every prior "NOT APPLIED" one — in version history before Founder application; this migration follows that same convention.

## N. Confirmation migration NOT applied

**Confirmed.** No SQL from `241_ei003_wave2_passage_bank_registration.sql` was executed against Supabase. No service-role credential was used at any point in this task. `ali_passage_bank` was only ever read (via the existing authenticated admin session's SELECT access) or probed with a deliberate, expected-to-fail INSERT to confirm the RLS block (§A) — that probe itself failed with `42501` and left zero residual rows, independently re-verified by direct query afterward.

## O. Confirmation candidate submission NOT retried

**Confirmed.** `submit_question_candidate()` was not called at any point in this task. The 40 Wave 2 candidates remain at 0/40 stored, 0/40 pending_review, 0/40 published — exactly the state left by the prior task's stopped batch-1 attempt.

## P. Exact manual Founder action required

1. Open Supabase Dashboard → SQL Editor → New query.
2. Paste the full contents of `supabase/migrations/241_ei003_wave2_passage_bank_registration.sql` (from the repository, at commit `500714b` or later — not from a locally re-typed or re-copied version, to avoid the exact copy/paste risk this migration's own defensive normalisation exists to guard against, though it is protected either way).
3. Run it. Expected outcome: 6 new rows in `ali_passage_bank`, all preconditions and postconditions pass silently (no exception raised), `commit` succeeds.
4. If it raises an exception instead: **stop and report back** rather than re-running with modifications — an exception means either an unexpected existing row was found under one of the six IDs (a genuine, disclosed conflict this migration is designed to catch, not silently resolve) or a copy/paste corruption occurred; either way it is a finding, not a bug to work around by retrying.
5. After successful application, the next step (explicitly **not** part of this task) would be resubmitting the same, unchanged 40-candidate manifest via `submit_question_candidate()` — that action still requires separate Founder authorisation per the standing "do not retry candidate submission" instruction.

## Q. GO / REVISE / NO-GO FOR FOUNDER MIGRATION APPLICATION

**GO.**

The migration is minimal, bounded to exactly the six approved passages, fail-closed (no silent overwrite path exists), defensively CRLF-normalised, statically proven to match the exact source the 40 candidates were validated against (0 drift, 0 quote-integrity problems, 40/40 dependency resolution), and follows this codebase's own established passage-registration precedent exactly. It has not been applied, and no write path to `ali_passage_bank` was used or exists outside the Founder's own manual SQL workflow. Once applied, resubmission of the already-approved 40-candidate manifest should be a small, bounded, low-risk next step — not performed here.

**STOP. Do not apply the migration. Do not submit candidates. Do not review candidates. Do not publish candidates. Do not begin Wave 3.**
