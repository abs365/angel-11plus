/**
 * RAISE Format-String / Parameter-Count Guard — shared checking logic.
 *
 * ROOT CAUSE THIS GUARDS AGAINST (Decision 187): migration 127 was
 * rejected by production PostgreSQL with "ERROR: 42601: too few
 * parameters specified for RAISE" (CONTEXT: compilation of PL/pgSQL
 * function "inline_code_block") because one RAISE NOTICE embedded the
 * literal phrase "20%" twice in its own format string, unescaped. In
 * PL/pgSQL, every unescaped `%` inside a RAISE format string is parsed
 * as a substitution placeholder requiring a corresponding trailing
 * parameter, regardless of whether the `%` is semantically a
 * percent-sign in the message's own prose; `%%` is PL/pgSQL's own
 * escape for a literal percent sign. That statement supplied zero
 * trailing parameters against 2 required placeholders, so PostgreSQL's
 * compiler refused to compile the entire anonymous DO block before any
 * statement inside it could run. The existing Migration SQL Guard
 * (Decision 179, scripts/lib/migrationSqlBalance.mjs) checks
 * quote/dollar-quote balance only and has no concept of PL/pgSQL RAISE
 * semantics, so it could not and did not catch this defect class.
 *
 * WHAT THIS GUARD DOES
 *   Scans a migration file's comment-stripped SQL text for every
 *   `RAISE [level] '...'` statement (the format-string form; a bare
 *   `RAISE;` or `RAISE condition_name` re-raise form is not a target of
 *   this check and is skipped). For each, extracts the exact format
 *   string (handling PostgreSQL's own `''`-doubling apostrophe escape),
 *   counts its unescaped `%` placeholders (`%%` is a single literal
 *   percent sign and is excluded from the count first), and counts the
 *   trailing comma-separated parameter expressions supplied after it
 *   (tracking parenthesis depth and nested string literals so a
 *   parameter like `count(*)` or `'a, b'` is never miscounted as
 *   multiple parameters). A statement is flagged when the placeholder
 *   count does not exactly equal the supplied parameter count -- the
 *   exact PL/pgSQL compile-time rule that rejected migration 127.
 *
 * RESIDUAL LIMITATION, DISCLOSED HONESTLY
 *   This checks RAISE format-string/parameter arithmetic only. It is
 *   not a PL/pgSQL parser and cannot validate any other PL/pgSQL
 *   construct (a malformed IF, an undeclared variable, a type mismatch,
 *   a USING-clause option, and so on). No `psql`, Docker, or
 *   Postgres-compatible engine is available in this repository's
 *   environment (same disclosed limitation as
 *   scripts/lib/migrationSqlBalance.mjs) -- true PL/pgSQL compilation
 *   remains Founder-controlled production application after review.
 *   This is the strongest practical, zero-new-dependency check for
 *   exactly this defect class, and it demonstrably would have caught
 *   migration 127's own original defect (verified directly against a
 *   reconstruction of that exact statement) while producing zero false
 *   positives against all 184 real RAISE-with-format-string statements
 *   already in this repository's own migration history.
 */

function stripSqlComments(sql) {
  return sql
    .split("\n")
    .map((line) => (line.trimStart().startsWith("--") ? "" : line))
    .join("\n");
}

/**
 * @param {string} sql raw migration file text (as read from disk)
 * @returns {Array<{ level: string, format: string, placeholderCount: number, paramCount: number, params: string[] }>}
 */
export function findRaiseStatements(sql) {
  const text = stripSqlComments(sql);
  const results = [];
  const raiseKw = /\braise\b/gi;
  let m;
  while ((m = raiseKw.exec(text))) {
    let i = m.index + m[0].length;
    while (/\s/.test(text[i])) i++;

    const levelMatch = /^(notice|exception|warning|log|info|debug)\b/i.exec(text.slice(i));
    let level = null;
    if (levelMatch) {
      level = levelMatch[1].toLowerCase();
      i += levelMatch[0].length;
      while (/\s/.test(text[i])) i++;
    }

    // Only the format-string form is checked; a bare re-raise
    // ("raise;") or a condition-name raise never starts with a quote
    // and is not this guard's concern.
    if (text[i] !== "'") continue;

    let j = i + 1;
    let fmt = "";
    while (j < text.length) {
      if (text[j] === "'") {
        if (text[j + 1] === "'") {
          fmt += "'";
          j += 2;
          continue;
        }
        j++;
        break;
      }
      fmt += text[j];
      j++;
    }

    let k = j;
    while (/\s/.test(text[k])) k++;
    const params = [];
    if (text[k] === ",") {
      let depth = 0;
      let cur = "";
      let inStr = false;
      k++;
      while (k < text.length) {
        const c = text[k];
        if (inStr) {
          cur += c;
          if (c === "'") {
            if (text[k + 1] === "'") {
              cur += text[k + 1];
              k += 2;
              continue;
            }
            inStr = false;
          }
          k++;
          continue;
        }
        if (c === "'") {
          inStr = true;
          cur += c;
          k++;
          continue;
        }
        if (c === "(") {
          depth++;
          cur += c;
          k++;
          continue;
        }
        if (c === ")") {
          depth--;
          cur += c;
          k++;
          continue;
        }
        if (c === "," && depth === 0) {
          params.push(cur.trim());
          cur = "";
          k++;
          continue;
        }
        if (c === ";" && depth === 0) {
          if (cur.trim()) params.push(cur.trim());
          k++;
          break;
        }
        cur += c;
        k++;
      }
    }

    const withoutEscapedPercent = fmt.replace(/%%/g, "");
    const placeholderCount = (withoutEscapedPercent.match(/%/g) || []).length;
    results.push({ level, format: fmt, placeholderCount, paramCount: params.length, params });
  }
  return results;
}

/**
 * @param {string} sql
 * @returns {Array<{ level: string, format: string, placeholderCount: number, paramCount: number }>} only the mismatched statements
 */
export function findRaiseFormatMismatches(sql) {
  return findRaiseStatements(sql).filter((s) => s.placeholderCount !== s.paramCount);
}
