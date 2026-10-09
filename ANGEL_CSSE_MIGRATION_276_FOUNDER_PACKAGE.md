# Migration 276: Great Stink passage line endings. Founder package (prepared 2026-10-09). NOT APPLIED. Do not apply until approved.

Migration 273 = APPLIED, DO NOT RERUN. This is a separate, new migration. 274, 268 and 270 are not part of it. Form B is not activated.

| | |
|---|---|
| Migration number | **276** (275 is the last applied) |
| Exact filename | `supabase/migrations/276_great_stink_passage_line_endings_TEMPLATE_NOT_APPLIED.sql` |
| Commit SHA | `b5625a808764a3400cd78c1e7d97d2a1177772be` |
| SHA256 (LF, no carriage return in the file) | `6db61961b9846ab6e88c50463a554d4f58b03c33bb437bac64d567358f462029` |
| origin/main | contains that commit; `git show origin/main:<file> | sha256sum` equals the hash above |
| Rollback | `scripts/output/founder-execution/276-ROLLBACK-restore-crlf.sql` (SHA256 `ff802e49f0067c9235829caf2ebe1ab1910b98e94be9ff852ff26090cf774ee0`) |
| Verification | `scripts/output/founder-execution/04-migration-276-verification.sql` (SHA256 `f47dd89aab4c97d4c9fc70b870ea7570028afc1ce11c7b607854a303658c8d88`) |

**What it does:** one `DO` block. It removes only `chr(13)` from `ali_passage_bank.original_text` where `id = 'eng-fb-greatstink'`. Newlines (`chr(10)`) are kept. No wording, punctuation, paragraph or spacing change.

| | BEFORE (read live) | AFTER (computed live, read-only) |
|---|---|---|
| length | 3,010 | 3,000 |
| carriage returns | 10 | 0 |
| newlines | 10 | 10 |
| md5 | `8d9571b5fd8f5c4bb7ca57c5a2801f29` | `ea793ad48685208cc0a1ecd65722283c` |

**Rows affected:** exactly 1 (passage row `eng-fb-greatstink`), 1 column (`original_text`). **No other row can change:** the only `UPDATE` is keyed on that id and on the exact BEFORE text; the guards raise (so nothing changes) unless exactly 1 row exists, its length, carriage-return count, newline count and md5 equal the BEFORE values, the proposed result has 0 carriage returns, length 3,000, 10 newlines and the canonical md5, and exactly 1 row is updated. No insert, delete, DDL, other table or other column (pinned by `tests/scripts/migration276.test.ts`; parsed by the real PostgreSQL grammar as one `DoStmt`; the file has no carriage return and no multi-line string literal, so a paste cannot alter it). Both guards were evaluated read-only against the live row: BEFORE guard true, AFTER guard true, 1 target row.

**Untouched by design:** the 11 question rows (hash `76d94f0897731a00d4d8a9b84c1ee353`, whose JSON copies are already canonical), answers, explanations, marks, difficulty, tiers, pathway, eligibility, active state, review records, Salmon, Practice, Mock, forms, exposure and learner evidence.

**One thing you should know before deciding:** all 41 passage rows in `ali_passage_bank` use Windows line endings (earlier migrations were also pasted through the editor), and 38 of the other passages' question copies carry the same line endings. After 276, Great Stink will be the only plain-newline passage row. Only the admin review screen reads `original_text` (the paper uses each question's own `passageText`), so nothing learner-facing changes either way. The Great Stink row and its question copies are the same words today; 276 makes them byte-identical. You decided YES; this is for your awareness.

**273 verification:** no change to `02-migration-273-verification.sql` is needed. Its block A already expects md5 `ea793ad48685208cc0a1ecd65722283c`; after 276 blocks A to L can be rerun unchanged. 273 verification is NOT declared PASS yet.

**Read-only verification after you apply 276:** run blocks A to E of `04-migration-276-verification.sql` (A the row: 3,000 / 0 / 10 / canonical md5; B equal to all 11 question copies; C other passages unchanged, hash `01db9646d743f6104bb3936c027226d3`, 41 passages; D no question, review or Salmon change, bank 1,528, reviews 317; E sealed, inventory 1,275, 0 forms/exposure/attempts), then rerun `02-migration-273-verification.sql` A to L.
