// DECISION 240 audit tooling — read-only extraction script.
// Parses every $json$...$json$ block out of every supabase/migrations/*.sql
// file, plus best-effort file-level metadata (subject, eligibility_status
// values used, header title), and writes a single consolidated JSON corpus
// for downstream name/cultural-context analysis. This script performs no
// database access and mutates nothing; it only reads migration files and
// writes a NEW file under docs/audits/decision240-uk-representation-audit/.

import fs from "node:fs";
import path from "node:path";

const migrationsDir = "supabase/migrations";
const files = fs.readdirSync(migrationsDir).filter((f) => f.endsWith(".sql")).sort();

const corpus = [];

for (const file of files) {
  const full = path.join(migrationsDir, file);
  const text = fs.readFileSync(full, "utf8");

  if (!text.includes("$json$")) continue;

  // Header title: first non-empty comment lines
  const headerLines = text.split("\n").slice(0, 6).filter((l) => l.startsWith("--")).join(" ");

  // File-level eligibility_status literals used
  const eligibilityMatches = [...text.matchAll(/eligibility_status\s*=?\s*'([\w_]+)'/g)].map((m) => m[1]);
  const eligibilitySet = [...new Set(eligibilityMatches)];

  // File-level subject literals (SQL column, not JSON field) — look for
  // patterns like "'english'," or "'maths'," immediately after an id string
  // in a VALUES tuple; best-effort, not guaranteed for every historical
  // migration format.
  const subjectMatches = [...text.matchAll(/'(english|maths|vocabulary|writing|mock-test)'(?:::public\.subject_type)?,/g)].map((m) => m[1]);
  const subjectSet = [...new Set(subjectMatches)];

  // Extract $json$...$json$ blocks
  const parts = text.split("$json$");
  const blocks = [];
  for (let i = 1; i < parts.length; i += 2) {
    const raw = parts[i];
    try {
      const parsed = JSON.parse(raw);
      blocks.push({ ok: true, parsed });
    } catch (e) {
      blocks.push({ ok: false, error: String(e.message), rawSnippet: raw.slice(0, 200) });
    }
  }

  corpus.push({
    file,
    headerTitle: headerLines,
    eligibilityStatusValuesFound: eligibilitySet,
    subjectValuesFound: subjectSet,
    blockCount: blocks.length,
    blocks,
  });
}

const outPath = "docs/audits/decision240-uk-representation-audit/_raw-json-corpus.json";
fs.writeFileSync(outPath, JSON.stringify(corpus, null, 2), "utf8");

let totalBlocks = 0;
let failedBlocks = 0;
for (const f of corpus) {
  totalBlocks += f.blockCount;
  failedBlocks += f.blocks.filter((b) => !b.ok).length;
}

console.log(`Files with $json$ blocks: ${corpus.length}`);
console.log(`Total $json$ blocks parsed: ${totalBlocks}`);
console.log(`Blocks that failed JSON.parse: ${failedBlocks}`);
console.log(`Written: ${outPath}`);
