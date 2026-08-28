// DECISION 240 audit tooling — read-only candidate-name extraction.
// Heuristic pass over the raw JSON corpus (not the deduped digest, so
// per-block file/id attribution is preserved) to surface HIGH-CONFIDENCE
// character-name candidates via two patterns: (1) a UK title (Mr/Mrs/Ms/
// Miss/Dr/Master/Aunt/Uncle/Sir/Professor) immediately followed by a
// capitalized word; (2) a capitalized word immediately followed by a
// common narrative dialogue/action verb or a possessive apostrophe-s,
// which in first-person/third-person narrative text reliably marks a
// named character subject. This is a candidate-surfacing pass only --
// every candidate is manually verified against its source context before
// being entered into the final character-name-inventory.

import fs from "node:fs";

const corpus = JSON.parse(fs.readFileSync("docs/audits/decision240-uk-representation-audit/_raw-json-corpus.json", "utf8"));

const TITLE_RE = /\b(Mr|Mrs|Ms|Miss|Dr|Master|Aunt|Uncle|Sir|Professor|Captain|Mx)\.?\s+([A-Z][a-z']+)/g;
const NARRATIVE_VERB_RE = /\b([A-Z][a-z']{2,})\s+(said|asked|thought|looked|pressed|whispered|muttered|replied|nodded|smiled|laughed|grinned|sighed|shrugged|frowned|stopped|paused|started|began|reached|turned|stood|sat|walked|ran|picked|held|felt|knew|wondered|remembered|noticed|watched|waited|called|shouted|explained|added|continued|finished|had|was|is|has|wants|needs|buys|sells|makes|bakes|counts|measures|shares|saves|earns|spends|collects|packs|plants|builds|scored|jumped|swam|cycled)\b/g;
const POSSESSIVE_RE = /\b([A-Z][a-z']{2,})'s\b/g;

const STOPLIST = new Set([
  "The", "A", "An", "This", "That", "These", "Those", "It", "I", "We", "They", "He", "She",
  "Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday",
  "January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December",
  "English", "Mathematics", "Maths", "Question", "Passage", "Angel", "British", "UK",
  "Yes", "No", "Nobody", "Next", "Today", "Tomorrow", "Yesterday", "Now", "Then", "Here", "There",
  "What", "When", "Where", "Which", "Who", "Why", "How",
]);

const candidates = new Map(); // name -> {count, titleCount, files:Set, ids:Set, sampleSentences:[]}

function record(name, file, id, sample, isTitled) {
  if (STOPLIST.has(name)) return;
  if (!candidates.has(name)) candidates.set(name, { count: 0, titleCount: 0, files: new Set(), ids: new Set(), samples: [] });
  const c = candidates.get(name);
  c.count++;
  if (isTitled) c.titleCount++;
  c.files.add(file);
  c.ids.add(id);
  if (c.samples.length < 3) c.samples.push(sample.slice(0, 160));
}

for (const f of corpus) {
  for (const b of f.blocks) {
    if (!b.ok) continue;
    const p = b.parsed;
    const id = p.id || "(no id)";
    const allText = Object.entries(p)
      .filter(([k]) => typeof p[k] === "string" || Array.isArray(p[k]))
      .map(([k, v]) => (Array.isArray(v) ? v.join(" ") : v))
      .join(" \n ");

    let m;
    TITLE_RE.lastIndex = 0;
    while ((m = TITLE_RE.exec(allText))) {
      record(`${m[1]} ${m[2]}`, f.file, id, allText.slice(Math.max(0, m.index - 40), m.index + 80), true);
    }
    NARRATIVE_VERB_RE.lastIndex = 0;
    while ((m = NARRATIVE_VERB_RE.exec(allText))) {
      record(m[1], f.file, id, allText.slice(Math.max(0, m.index - 40), m.index + 80), false);
    }
    POSSESSIVE_RE.lastIndex = 0;
    while ((m = POSSESSIVE_RE.exec(allText))) {
      record(m[1], f.file, id, allText.slice(Math.max(0, m.index - 40), m.index + 80), false);
    }
  }
}

const rows = [...candidates.entries()]
  .map(([name, c]) => ({ name, count: c.count, titleCount: c.titleCount, fileCount: c.files.size, files: [...c.files], idCount: c.ids.size, samples: c.samples }))
  .sort((a, b) => b.count - a.count);

fs.writeFileSync("docs/audits/decision240-uk-representation-audit/_name-candidates.json", JSON.stringify(rows, null, 2), "utf8");
console.log(`Distinct candidate tokens: ${rows.length}`);
console.log("Top 40 by occurrence count:");
for (const r of rows.slice(0, 40)) {
  console.log(`${r.name.padEnd(20)} count=${r.count} titled=${r.titleCount} files=${r.fileCount} ids=${r.idCount}`);
}
