-- Angel Digital 11+ — Migration 276 — TEMPLATE, NOT APPLIED. Founder-applied only, once.
-- Purpose: normalise ONE passage row. Migration 273 was applied through the SQL editor, which stored the Great Stink passage text with
-- Windows line endings (10 carriage returns, length 3,010). The 11 question copies of the passage already hold the canonical text
-- (length 3,000, no carriage returns). This removes ONLY the carriage-return characters (chr(13)) from eng-fb-greatstink.original_text.
-- It changes no wording, punctuation, paragraph or spacing, keeps every newline (chr(10)), and touches no other column or row.
--
-- NOTE FOR THE FOUNDER (found while preparing this): all 41 passage rows in ali_passage_bank use Windows line endings, because earlier
-- migrations were also pasted through the editor. After this migration Great Stink will be the only passage row with plain newlines.
-- Nothing learner-facing reads ali_passage_bank.original_text (the paper uses each question's own passageText); only the admin review
-- screen displays it. Apply it only if you want the canonical hash recorded in the 273 verification; it is safe either way.
--
-- This file contains no literal carriage return and no multi-line string literal, so pasting it cannot change it.
--
-- BEFORE: length 3010, carriage returns 10, newlines 10, md5 8d9571b5fd8f5c4bb7ca57c5a2801f29
-- AFTER : length 3000, carriage returns 0,  newlines 10, md5 ea793ad48685208cc0a1ecd65722283c
-- Rows affected: exactly 1. ROLLBACK: scripts/output/founder-execution/276-ROLLBACK-restore-crlf.sql

do $do$
declare
  v_rows integer;
  v_before text;
  v_after text;
begin
  select count(*) into v_rows from public.ali_passage_bank where id = 'eng-fb-greatstink';
  if v_rows <> 1 then
    raise exception 'Migration 276 expected exactly 1 passage row eng-fb-greatstink, found %: nothing was changed', v_rows;
  end if;

  select original_text into v_before from public.ali_passage_bank where id = 'eng-fb-greatstink';
  if length(v_before) <> 3010
     or length(v_before) - length(replace(v_before, chr(13), '')) <> 10
     or length(v_before) - length(replace(v_before, chr(10), '')) <> 10
     or md5(v_before) <> '8d9571b5fd8f5c4bb7ca57c5a2801f29' then
    raise exception 'Migration 276: the passage is not in the expected post-273 CRLF state (already normalised, or changed): nothing was changed';
  end if;

  v_after := replace(v_before, chr(13), '');
  if position(chr(13) in v_after) > 0
     or length(v_after) <> 3000
     or length(v_after) - length(replace(v_after, chr(10), '')) <> 10
     or md5(v_after) <> 'ea793ad48685208cc0a1ecd65722283c' then
    raise exception 'Migration 276: the proposed result is not the canonical passage text: nothing was changed';
  end if;

  update public.ali_passage_bank
     set original_text = v_after
   where id = 'eng-fb-greatstink'
     and original_text = v_before;
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then
    raise exception 'Migration 276 expected to change exactly 1 row, changed %: rolled back', v_rows;
  end if;
end $do$;
