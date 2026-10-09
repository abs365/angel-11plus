-- ROLLBACK for migration 276 (only if you ask). Restores the post-273 Windows line endings on ONE passage row. Same guards, reversed.
-- Contains no literal carriage return. Run only after 276 was applied; it fails unless the row is in the canonical state.
-- BEFORE this rollback: length 3000, md5 ea793ad48685208cc0a1ecd65722283c. AFTER: length 3010, md5 8d9571b5fd8f5c4bb7ca57c5a2801f29.

do $do$
declare
  v_rows integer;
  v_before text;
  v_after text;
begin
  select count(*) into v_rows from public.ali_passage_bank where id = 'eng-fb-greatstink';
  if v_rows <> 1 then
    raise exception 'Rollback 276 expected exactly 1 passage row, found %: nothing was changed', v_rows;
  end if;
  select original_text into v_before from public.ali_passage_bank where id = 'eng-fb-greatstink';
  if length(v_before) <> 3000 or position(chr(13) in v_before) > 0 or md5(v_before) <> 'ea793ad48685208cc0a1ecd65722283c' then
    raise exception 'Rollback 276: the passage is not in the canonical state: nothing was changed';
  end if;
  v_after := replace(v_before, chr(10), chr(13) || chr(10));
  if length(v_after) <> 3010 or md5(v_after) <> '8d9571b5fd8f5c4bb7ca57c5a2801f29' then
    raise exception 'Rollback 276: the restored text is not the expected CRLF state: nothing was changed';
  end if;
  update public.ali_passage_bank set original_text = v_after where id = 'eng-fb-greatstink' and original_text = v_before;
  get diagnostics v_rows = row_count;
  if v_rows <> 1 then
    raise exception 'Rollback 276 expected to change exactly 1 row, changed %: rolled back', v_rows;
  end if;
end $do$;
