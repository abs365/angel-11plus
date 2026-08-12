#!/usr/bin/env node
/**
 * Copy Quality Guard — Angel Copy Punctuation Eradication and Prevention
 * Gate. Detects em dash (—) and en dash (–) used as sentence/rhetorical
 * punctuation in active, learner- or parent-facing source copy, and fails
 * the build/lint step when it finds one.
 *
 * WHAT IT CHECKS
 *   Every .ts/.tsx file under app/, components/, lib/ and data/, line by line,
 *   after stripping // line comments, /* block comments and {/* JSX
 *   comments *​/ — a dash inside a comment is developer documentation, not
 *   rendered copy, and is never flagged. Also scans the fixed list in
 *   STATIC_FILES below: standalone learner-facing files that live outside
 *   app/components/lib entirely (currently the PWA offline fallback page,
 *   public/offline.html, and the install-prompt description in
 *   public/manifest.json) and would otherwise be invisible to a .ts/.tsx-
 *   only scan — found the hard way, during the Copy Quality Eradication
 *   Gate, when exactly this file went unaudited through two prior passes.
 *
 * WHAT IT INTENTIONALLY PERMITS
 *   - A dash with no surrounding whitespace between two alphanumeric
 *     characters (e.g. "10–15", "Year 4–6", "2024–2026", "3–5 words") is
 *     treated as a numeric/date/age/score range, not prose punctuation,
 *     and is never flagged. This is the same "no surrounding whitespace"
 *     heuristic used everywhere in this codebase to distinguish a range
 *     from a rhetorical dash (e.g. "strong — but rushed" always has a
 *     space on both sides; "10–15" never does).
 *   - Files listed in INTERNAL_ONLY_FILES below (Founder-only evidence/
 *     traceability panels, explicitly documented in their own file as
 *     "not learner-facing") are skipped entirely, not because their copy
 *     doesn't matter, but because they are not part of the audience this
 *     rule protects. Each entry names the reason; adding to this list
 *     requires the same justification, not a blanket opt-out.
 *
 * WHAT IT CANNOT INSPECT
 *   - Database-fed content (Supabase tables, question banks, evidence
 *     records) — this is a static source-file scanner only. See
 *     PRODUCT_EXPERIENCE_STANDARD_V1.md §9 and the Angel Copy Quality
 *     Eradication Gate report for how database content is covered
 *     (manual audit at gate time; no learner-facing prose currently lives
 *     in the database, confirmed by direct query against every active
 *     content-bearing table).
 *   - AI-generated/adaptive copy (e.g. app/api/writing-feedback/route.ts's
 *     OpenAI-produced writing feedback) — a static grep cannot inspect
 *     text that doesn't exist until a model generates it at request time.
 *     That route is covered instead by (a) an explicit system-prompt
 *     instruction never to use dash punctuation, and (b) a runtime
 *     sanitisation pass (stripDashPunctuation()) applied to every
 *     AI-generated field before the response reaches a learner. This
 *     script cannot verify that runtime behaviour; it is verified by
 *     interactive testing at gate time instead.
 *   - Whether a file is genuinely "active" versus superseded/unreachable —
 *     the script has no router awareness. A file it flags in a truly dead
 *     route is still worth fixing (cheap, and removes ambiguity) but is
 *     not a defect in the live product; that judgement is made by whoever
 *     triages the guard's output, not by the guard itself.
 *
 * SCOPED SUPPRESSION
 *   A narrow span that must legitimately name the prohibited characters
 *   (e.g. the writing-feedback system prompt's own instruction to the
 *   model, or this guard's own regex source) can be wrapped in
 *   `// copy-guard-ignore-start` / `// copy-guard-ignore-end` comments, or
 *   a single line marked `// copy-guard-ignore-line`. Every suppression is
 *   visible in the diff at the point of use and must carry its own
 *   justification in a nearby comment — this is not a file-wide disable.
 *
 * USAGE
 *   node scripts/copy-quality-guard.mjs [--fix-report]
 *   Exits 1 (fails CI) if any violation is found. Run via `npm run
 *   copy-guard`, and as part of `npm run lint` (see package.json).
 */

import { readdirSync, readFileSync, statSync } from "node:fs";
import { join, extname, relative } from "node:path";
import { fileURLToPath } from "node:url";

const ROOT = join(fileURLToPath(import.meta.url), "..", "..");
const SCAN_DIRS = ["app", "components", "lib", "data"];
const EXTENSIONS = new Set([".ts", ".tsx"]);

/**
 * Standalone static learner-facing files outside app/components/lib: the
 * PWA offline fallback page and the manifest's install-prompt description.
 * Found the hard way — a genuine gap the .ts/.tsx-only scan above could
 * never have caught, since neither file is a TypeScript source file.
 * Scanned directly for the dash characters (public/offline.html has no
 * server logic to worry about breaking; a false positive here just means
 * reading one extra short line, not a build risk).
 */
const STATIC_FILES = ["public/offline.html", "public/manifest.json"];

/**
 * Founder-only / explicitly-not-learner-facing routes, each independently
 * documented as such in its own file header. Not a general escape hatch:
 * every entry here must carry that same standing disclosure, verified at
 * the time it's added, not merely asserted.
 */
const INTERNAL_ONLY_FILES = new Set([
  "app/admin-beta/page.tsx", // Founder-only operations console, gated by RLS + admin check
  "app/learning-intelligence/founder-validation/csse/page.tsx", // "Not learner-facing" — own header comment + own on-page copy
  "data/founderValidation/csseFounderValidationEvidence.ts", // Sole consumer is the file above; question-authoring audit trail (Question Type codes, originality/difficulty rationale), never rendered as learner-facing prose
]);

const DASH_CHARS = "—–"; // — and –

/** A dash flanked by alphanumerics with no whitespace on either touching side: a range (10–15, Year 4–6), not prose punctuation. */
const RANGE_DASH = new RegExp(`[0-9A-Za-z][${DASH_CHARS}][0-9A-Za-z]`);

function walk(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    const stat = statSync(full);
    if (stat.isDirectory()) {
      if (entry === "node_modules" || entry === ".next" || entry.startsWith(".")) continue;
      walk(full, out);
    } else if (EXTENSIONS.has(extname(entry))) {
      out.push(full);
    }
  }
  return out;
}

/**
 * Strips comment content from a line of source, tracking multi-line /* *​/
 * and {/* *​/} JSX comment state across the whole file. Line-based, not a
 * real parser: good enough for this codebase's consistent style (comments
 * always start at a clear boundary, never embedded mid-string), not a
 * guarantee against every conceivable construct — see file header.
 */
function stripComments(lines) {
  const stripped = [];
  let inBlock = false;
  for (let raw of lines) {
    let line = raw;
    if (inBlock) {
      const end = line.indexOf("*/");
      if (end === -1) {
        stripped.push("");
        continue;
      }
      line = line.slice(end + 2);
      inBlock = false;
    }
    // Remove any complete /* ... */ or {/* ... */} spans on this line (repeat for multiple).
    line = line.replace(/\{?\/\*[\s\S]*?\*\/\}?/g, "");
    // An unterminated block comment starts here.
    const openIdx = line.indexOf("/*");
    if (openIdx !== -1) {
      line = line.slice(0, openIdx);
      inBlock = true;
    }
    // Trailing // line comment (this codebase always precedes it with whitespace or a code boundary).
    const lineCommentMatch = line.match(/(^|[\s;,)])\/\/.*/);
    if (lineCommentMatch) {
      line = line.slice(0, lineCommentMatch.index + lineCommentMatch[1].length);
    }
    const trimmed = line.trim();
    if (trimmed.startsWith("*")) {
      stripped.push("");
      continue;
    }
    stripped.push(line);
  }
  return stripped;
}

/**
 * Scoped, visible suppression for spans that are genuinely not rendered
 * prose (e.g. an LLM system-prompt template literal that must itself
 * *name* the prohibited characters to instruct a model not to produce
 * them, or this guard's own regex source). Marked with
 * `// copy-guard-ignore-start` / `// copy-guard-ignore-end` comments in
 * the source, so every suppression is visible in a diff and requires its
 * own justification at the point of use, not a file-wide opt-out.
 */
function suppressedLineNumbers(lines) {
  const suppressed = new Set();
  let inSuppressedBlock = false;
  lines.forEach((raw, i) => {
    if (raw.includes("copy-guard-ignore-start")) inSuppressedBlock = true;
    if (inSuppressedBlock) suppressed.add(i);
    if (raw.includes("copy-guard-ignore-end")) inSuppressedBlock = false;
    if (raw.includes("copy-guard-ignore-line")) suppressed.add(i);
  });
  return suppressed;
}

/** Shared per-line dash scan, used for both comment-stripped source lines and raw static-file lines. */
function scanLines(codeLines, rel, suppressed = new Set()) {
  const violations = [];
  for (let i = 0; i < codeLines.length; i++) {
    if (suppressed.has(i)) continue;
    const line = codeLines[i];
    for (let j = 0; j < line.length; j++) {
      const ch = line[j];
      if (!DASH_CHARS.includes(ch)) continue;
      const windowStart = Math.max(0, j - 1);
      const windowEnd = Math.min(line.length, j + 2);
      const window = line.slice(windowStart, windowEnd);
      if (RANGE_DASH.test(window)) continue; // legitimate range/notation
      violations.push({
        file: rel,
        line: i + 1,
        excerpt: line.trim().slice(0, 140),
      });
      break; // one flag per line is enough to surface it for review
    }
  }
  return violations;
}

function findViolations(filePath) {
  const rel = relative(ROOT, filePath).replace(/\\/g, "/");
  if (INTERNAL_ONLY_FILES.has(rel)) return [];
  const text = readFileSync(filePath, "utf8");
  const lines = text.split("\n");
  const suppressed = suppressedLineNumbers(lines);
  const codeLines = stripComments(lines);
  return scanLines(codeLines, rel, suppressed);
}

/**
 * public/offline.html and public/manifest.json: no comment-stripping (an
 * HTML `<!-- -->` comment or a JSON file has no equivalent risk of hiding
 * real prose the way a JS `//` does here — both files are short and
 * entirely hand-authored), so every line is scanned as-is.
 */
function findStaticFileViolations(relPath) {
  const full = join(ROOT, relPath);
  const text = readFileSync(full, "utf8");
  const lines = text.split("\n");
  return scanLines(lines, relPath);
}

function main() {
  const files = SCAN_DIRS.flatMap((d) => walk(join(ROOT, d)));
  const allViolations = [
    ...files.flatMap(findViolations),
    ...STATIC_FILES.flatMap(findStaticFileViolations),
  ];

  const totalFiles = files.length + STATIC_FILES.length;
  if (allViolations.length === 0) {
    console.log(`Copy Quality Guard: PASS — 0 violations across ${totalFiles} files.`);
    process.exit(0);
  }

  console.error(`Copy Quality Guard: FAIL — ${allViolations.length} violation(s) found.\n`);
  for (const v of allViolations) {
    console.error(`  ${v.file}:${v.line}  ${v.excerpt}`);
  }
  console.error(
    "\nEm dash (—) / en dash (–) used as sentence punctuation is prohibited in learner- and " +
      "parent-facing Angel 11+ copy. Rewrite naturally with a full stop, comma, semicolon, colon " +
      "or brackets. Legitimate numeric/date/age/score ranges (e.g. 10–15, Year 4–6) are permitted " +
      "and already excluded by this guard."
  );
  process.exit(1);
}

main();
