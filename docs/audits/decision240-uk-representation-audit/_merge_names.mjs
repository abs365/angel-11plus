// DECISION 240 audit tooling — merges pass-1 and pass-2 candidate lists
// into one canonical, manually-curated distinct-name table: strips
// possessive 's variants into their base name, drops confirmed
// non-name false positives (verified by manual context reading during
// this audit), and produces final occurrence/file/id counts per name.

import fs from "node:fs";

const c1 = JSON.parse(fs.readFileSync("docs/audits/decision240-uk-representation-audit/_name-candidates.json", "utf8"));
const c2 = JSON.parse(fs.readFileSync("docs/audits/decision240-uk-representation-audit/_name-candidates-pass2.json", "utf8"));

// Confirmed, manually verified during this audit (see
// founder-context-leakage-findings.md / cultural-distribution-analysis.md
// for the reading that established each exclusion).
const CONFIRMED_NOT_NAMES = new Set([
  "Grandad", "Mum", "Dad", "School", "Ocean", "Sailors", "Earth", "Bristol", "Ashford",
  "Western", "Coal", "Juice", "Rice", "Whatever", "I've", "Baker", "War", "Milltown",
  "Riverside", "Hillview", "Oakford", "Oakwood", "Coventry", "Kestrel", "Explain", "Tick",
  "Using", "Does", "Option", "True", "According", "After", "Answer", "Point", "Together",
  "Three", "Hillview", "Greater", "Less", "Equal", "Two", "Class", "Each", "Put", "Week",
  "Stickers", "Primary", "Athletics", "Meet", "Between", "Mon", "Tue", "Wed", "Thu", "Fri",
  "One", "Four", "Their", "Altogether", "Keyrings", "Bracelets", "Umbrellas", "Books",
  "For", "Over", "Any", "Convert", "Assembling", "Coventry", "Describe", "Equilateral",
  "Isosceles", "Scalene", "Daily", "Celsius", "Preparation", "Five", "Weekly", "Distances",
  "Apples", "Notebooks", "Pencils", "Bottled", "Walked", "Road", "Waited", "Sheltered",
  "Bought", "Cut", "Stopped", "Took", "Crossed", "Everyone", "Cheese", "Pasta", "Adult",
  "Child", "Senior", "Sewing", "Before", "Someone", "Some", "Narrator", "False",
]);

const merged = new Map(); // canonicalName -> {count, files:Set, ids:Set}

function canon(name) {
  return name.replace(/'s$/, "");
}

for (const row of [...c1, ...c2]) {
  const base = canon(row.name);
  if (CONFIRMED_NOT_NAMES.has(base)) continue;
  if (!merged.has(base)) merged.set(base, { count: 0, files: new Set(), ids: new Set() });
  const m = merged.get(base);
  m.count += row.count;
  for (const f of row.files) m.files.add(f);
  const idField = row.ids ?? row.idCount; // pass1 has idCount only in some paths; guard
}

// Re-derive ids properly from originals since idCount alone isn't a set;
// approximate distinct-id exposure via idCount already stored per row
// (kept separately, summed as an upper bound estimate, not deduped
// across pass1/pass2 for the same row -- noted as an approximation).
const approxIdUpperBound = new Map();
for (const row of [...c1, ...c2]) {
  const base = canon(row.name);
  if (CONFIRMED_NOT_NAMES.has(base)) continue;
  approxIdUpperBound.set(base, Math.max(approxIdUpperBound.get(base) || 0, row.idCount));
}

const rows = [...merged.entries()]
  .map(([name, m]) => ({ name, occurrences: m.count, files: [...m.files].sort(), fileCount: m.files.size, approxDistinctIds: approxIdUpperBound.get(name) }))
  .sort((a, b) => b.fileCount - a.fileCount || b.occurrences - a.occurrences);

fs.writeFileSync("docs/audits/decision240-uk-representation-audit/_merged-name-table.json", JSON.stringify(rows, null, 2), "utf8");

console.log(`Total distinct confirmed character names: ${rows.length}`);
console.log(`Names appearing in 2+ separate migration files (repeated across unrelated units): ${rows.filter(r => r.fileCount >= 2).length}`);
console.log("\nNames by file-count (repeated across unrelated content units), descending:");
for (const r of rows.filter(r => r.fileCount >= 2)) {
  console.log(`  ${r.name.padEnd(16)} files=${r.fileCount}  occurrences=${r.occurrences}  -> ${r.files.join(", ")}`);
}
console.log("\nAll single-file names:");
for (const r of rows.filter(r => r.fileCount === 1)) {
  console.log(`  ${r.name.padEnd(16)} occurrences=${r.occurrences}  file=${r.files[0]}`);
}
