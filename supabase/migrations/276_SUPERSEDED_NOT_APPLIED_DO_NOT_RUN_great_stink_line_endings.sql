-- Angel Digital 11+ — Migration 276 — NOT APPLIED. NOT REQUIRED. SUPERSEDED. DO NOT RUN.
-- A one-row line-ending normalisation of the Great Stink passage row was prepared (2026-10-09) and then rejected by the Founder:
-- every ali_passage_bank row (all 41) is stored with Windows line endings, so the Great Stink row already follows the storage convention,
-- nothing learner-facing reads that column (the paper uses each question's own passage text), and the only discrepancy was a verification
-- hash that did not normalise line endings. The Migration 273 verification (02-migration-273-verification.sql block A) is now
-- line-ending-neutral instead. The original prepared body is preserved in git history only (commit b5625a8).
-- This file is deliberately inert: running it raises an error and changes nothing.

do $do$
begin
  raise exception 'Migration 276 is SUPERSEDED and was never applied: do not run it. Nothing was changed.';
end $do$;
