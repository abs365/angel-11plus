/**
 * Migration SQL Literal-Balance Guard — shared checking logic.
 *
 * ROOT CAUSE THIS GUARDS AGAINST (Decision 179): migration 119 was
 * rejected by production PostgreSQL with "ERROR: 42601: syntax error at
 * or near "s"" because one embedded explanation string contained a
 * single, unescaped apostrophe ("the real archetype's own pattern")
 * while every other apostrophe in the same file was correctly doubled
 * ('') per standard SQL string-literal escaping. The unescaped quote
 * silently closed the string literal mid-sentence; everything after it
 * was then parsed as bare SQL tokens, and the tokenizer's own internal
 * state stayed unbalanced for the rest of the file. The existing test
 * suite never caught this because every migration test in this
 * repository asserts against SUBSTRINGS of the raw file text (regex
 * `.match()`/`.includes()`), which still matches correctly inside a
 * string whose OWN quoting is broken -- substring assertions are blind
 * to whether the surrounding SQL is syntactically well-formed.
 *
 * WHAT THIS GUARD DOES
 *   Tokenizes a migration file's real, comment-stripped SQL text using a
 *   plain state machine: `--` line comments are stripped first (this
 *   repository's own existing convention, matching the comment-strip
 *   already used by every migration test's own `executable` derivation);
 *   `$tag$ ... $tag$` dollar-quoted blocks (this repository's own
 *   `$json$...$json$` convention, and PostgreSQL's own generic
 *   dollar-quoting syntax) are treated as opaque and never scanned for
 *   quotes inside them; every `'...'` single-quoted string literal is
 *   tracked with PostgreSQL's own standard escaping rule -- a doubled
 *   `''` is one literal apostrophe, a single `'` closes the string.
 *   A file is BALANCED if, at end of file, the tokenizer is not left
 *   mid-string and not left mid-dollar-quote. An unbalanced file is
 *   exactly the defect class that broke migration 119: it is real proof
 *   the file's own quoting is self-inconsistent, which is what caused
 *   PostgreSQL's parser to fail.
 *
 * RESIDUAL LIMITATION, DISCLOSED HONESTLY
 *   This is a quote-balance check, not a real PostgreSQL parser. It
 *   proves the file's string/dollar-quoting is internally consistent; it
 *   CANNOT prove the SQL is otherwise valid (a missing comma, a
 *   misspelled keyword, a wrong column count, a type mismatch would all
 *   pass this guard and only be caught by Supabase itself). No `psql`,
 *   Docker, or Postgres-compatible engine, and no SQL-parsing npm
 *   package, is available in this repository's environment -- true
 *   parse-time validation was assessed and is not currently possible
 *   without a new infrastructure dependency, which was explicitly out of
 *   scope for this bounded correction (Decision 179). This guard is the
 *   strongest practical, zero-new-dependency check available, and it
 *   would have caught the exact migration 119 defect.
 */

/**
 * @param {string} sql raw migration file text (as read from disk)
 * @returns {{ balanced: boolean, stillInString: boolean, stillInDollar: boolean, literalCount: number, dollarBlockCount: number }}
 */
export function checkMigrationSqlBalance(sql) {
  const stripped = sql
    .split("\n")
    .map((line) => (line.trimStart().startsWith("--") ? "" : line))
    .join("\n");

  let i = 0;
  let inStr = false;
  let inDollar = false;
  let dollarTag = null;
  let literalCount = 0;
  let dollarBlockCount = 0;

  while (i < stripped.length) {
    if (!inStr && !inDollar && stripped[i] === "$") {
      const tagMatch = stripped.slice(i).match(/^\$([a-zA-Z_][a-zA-Z0-9_]*)?\$/);
      if (tagMatch) {
        inDollar = true;
        dollarTag = tagMatch[0];
        dollarBlockCount++;
        i += tagMatch[0].length;
        continue;
      }
    }
    if (inDollar) {
      if (stripped.startsWith(dollarTag, i)) {
        i += dollarTag.length;
        inDollar = false;
        dollarTag = null;
        continue;
      }
      i++;
      continue;
    }
    if (!inStr && stripped[i] === "'") {
      inStr = true;
      literalCount++;
      i++;
      continue;
    }
    if (inStr) {
      if (stripped[i] === "'") {
        if (stripped[i + 1] === "'") {
          i += 2;
          continue;
        }
        inStr = false;
        i++;
        continue;
      }
      i++;
      continue;
    }
    i++;
  }

  return {
    balanced: !inStr && !inDollar,
    stillInString: inStr,
    stillInDollar: inDollar,
    literalCount,
    dollarBlockCount,
  };
}
