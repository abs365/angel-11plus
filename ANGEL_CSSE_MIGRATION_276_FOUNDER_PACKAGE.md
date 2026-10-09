# Migration 276: NOT APPLIED. NOT REQUIRED. SUPERSEDED. DO NOT RUN.

Founder decision (2026-10-09): do not apply 276. Every row of `ali_passage_bank` (all 41) uses Windows line endings, so the Great Stink passage row already follows the storage convention; the paper reads each question's own passage text (all 11 copies are the approved text); the only discrepancy was a verification hash that did not normalise line endings. The Migration 273 verification is now line-ending-neutral, and no production passage row is rewritten.

The file `supabase/migrations/276_SUPERSEDED_NOT_APPLIED_DO_NOT_RUN_great_stink_line_endings.sql` is kept only as an inert tombstone (it raises an error if run). The prepared body, its rollback and its verification SQL remain in git history (commits `b5625a8`, `82646fe`, `0b5474a`) and nowhere else.
