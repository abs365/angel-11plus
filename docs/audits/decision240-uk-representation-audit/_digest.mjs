// DECISION 240 audit tooling — read-only digest builder. Consumes
// _raw-json-corpus.json and produces a deduplicated, human-readable text
// digest per file: unique passages (by passageText, since the same
// passage recurs across every question row that references it) and
// unique non-identifier text fields (question/hint/modelAnswer/answer/
// workingSteps/explanation) for scenario-style content such as
// Mathematics word problems. Written for manual name/context reading,
// not automated NER (no NER library available in this environment).

import fs from "node:fs";

const corpus = JSON.parse(fs.readFileSync("docs/audits/decision240-uk-representation-audit/_raw-json-corpus.json", "utf8"));

const IDENTIFIER_KEYS = new Set(["id", "skill", "marks", "validationTier", "passageTitle", "quotationRequired", "orderedAnswer", "content_difficulty"]);

let out = "# DECISION 240 — Deduplicated learner-facing text digest (auto-generated, read-only)\n\n";
out += "Generated from every $json$ prompt block across all migrations that contain one. Passages are deduplicated by passageText (the same passage text repeats once per question row that references it). This file is for manual name/cultural-context reading, not an automated NER output — no NER library is available in this environment.\n\n";

let totalUniquePassages = 0;
let totalQuestionTextEntries = 0;

for (const f of corpus) {
  out += `\n## FILE: ${f.file}\n`;
  out += `Header: ${f.headerTitle.replace(/\s+/g, " ").slice(0, 300)}\n`;
  out += `Blocks: ${f.blockCount} | eligibility_status values found: ${f.eligibilityStatusValuesFound.join(", ") || "(none found)"} | subject values found: ${f.subjectValuesFound.join(", ") || "(none found)"}\n\n`;

  const seenPassages = new Map(); // passageText -> {title, ids: []}
  const seenQuestionTexts = new Set();
  const otherTextLines = [];

  for (const b of f.blocks) {
    if (!b.ok) continue;
    const p = b.parsed;
    const id = p.id || "(no id)";

    if (p.passageText) {
      if (!seenPassages.has(p.passageText)) {
        seenPassages.set(p.passageText, { title: p.passageTitle || "(untitled)", ids: [] });
      }
      seenPassages.get(p.passageText).ids.push(id);
    }

    for (const [k, v] of Object.entries(p)) {
      if (IDENTIFIER_KEYS.has(k) || k === "passageText") continue;
      if (typeof v === "string" && v.trim()) {
        if (k === "question" || k === "answer") {
          const key = `${k}::${v}`;
          if (!seenQuestionTexts.has(key)) {
            seenQuestionTexts.add(key);
            otherTextLines.push(`[${id}] (${k}) ${v}`);
          }
        } else {
          otherTextLines.push(`[${id}] (${k}) ${v}`);
        }
      } else if (Array.isArray(v) && v.length && typeof v[0] === "string") {
        otherTextLines.push(`[${id}] (${k}) ${v.join(" | ")}`);
      }
    }
  }

  if (seenPassages.size) {
    out += `### Unique passages (${seenPassages.size}):\n`;
    for (const [text, meta] of seenPassages) {
      out += `\n--- PASSAGE: "${meta.title}" (referenced by ${meta.ids.length} question rows: ${meta.ids.join(", ")}) ---\n${text}\n`;
      totalUniquePassages++;
    }
  }

  if (otherTextLines.length) {
    out += `\n### Question/answer/hint/other text (${otherTextLines.length} entries):\n`;
    out += otherTextLines.join("\n") + "\n";
    totalQuestionTextEntries += otherTextLines.length;
  }
}

fs.writeFileSync("docs/audits/decision240-uk-representation-audit/_text-digest.md", out, "utf8");
console.log(`Total unique passages: ${totalUniquePassages}`);
console.log(`Total question/answer/hint/other text entries: ${totalQuestionTextEntries}`);
console.log(`Digest size: ${out.length} chars`);
