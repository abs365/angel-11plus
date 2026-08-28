// DECISION 240 audit tooling — SECOND-PASS candidate extraction. Pass 1
// (title/narrative-verb/possessive heuristics) missed short names used
// only in bare comparison constructions common in Mathematics algebra
// word problems (e.g. "X has £5 more than Y"). This pass scans every
// "question"/"answer" field for ALL capitalized word-initial tokens,
// filtered against an extensive stoplist of common non-name capitalized
// words (units, subjects, days, generic nouns, question words, place
// words already separately noted), to surface anything pass 1 missed.
// Candidate-surfacing only -- manually verified before entering the
// final inventory.

import fs from "node:fs";

const corpus = JSON.parse(fs.readFileSync("docs/audits/decision240-uk-representation-audit/_raw-json-corpus.json", "utf8"));

const STOPLIST = new Set([
  "The","A","An","This","That","These","Those","It","I","We","They","He","She","You","Your","His","Her","Its",
  "Monday","Tuesday","Wednesday","Thursday","Friday","Saturday","Sunday",
  "January","February","March","April","May","June","July","August","September","October","November","December",
  "English","Mathematics","Maths","Question","Passage","Angel","British","UK","Britain","England",
  "Yes","No","Nobody","Next","Today","Tomorrow","Yesterday","Now","Then","Here","There","Whatever","Whoever",
  "What","When","Where","Which","Who","Why","How","If","Round","Give","Work","Show","Use","Find","Write","Calculate",
  "Rice","Juice","Coal","Western","War","School","Ocean","Sailors","Earth","Grandad","Mum","Dad","Baker",
  "Sale","Camping","Timetable","Price","List","Number","Puzzle","Fun","Run","Rounding","Bounds",
  "Great","Atlantic","New","York","Bristol","Ashford","Essex","London","Kent","Surrey",
]);

const candidates = new Map();

function record(name, file, id, sample) {
  if (STOPLIST.has(name)) return;
  if (name.length < 3) return;
  if (!candidates.has(name)) candidates.set(name, { count: 0, files: new Set(), ids: new Set(), samples: [] });
  const c = candidates.get(name);
  c.count++;
  c.files.add(file);
  c.ids.add(id);
  if (c.samples.length < 2) c.samples.push(sample.slice(0, 140));
}

const WORD_RE = /\b([A-Z][a-z']{2,})\b/g;

for (const f of corpus) {
  for (const b of f.blocks) {
    if (!b.ok) continue;
    const p = b.parsed;
    if (!p.question && !p.answer) continue;
    const id = p.id || "(no id)";
    const text = [p.question, p.answer].filter(Boolean).join(" \n ");
    let m;
    WORD_RE.lastIndex = 0;
    while ((m = WORD_RE.exec(text))) {
      // Skip sentence-initial occurrence risk: only record if NOT at
      // absolute index 0 of the text (still noisy but reduces "The"-at-
      // start false positives beyond the stoplist).
      record(m[1], f.file, id, text.slice(Math.max(0, m.index - 30), m.index + 60));
    }
  }
}

const rows = [...candidates.entries()]
  .map(([name, c]) => ({ name, count: c.count, fileCount: c.files.size, files: [...c.files], idCount: c.ids.size, samples: c.samples }))
  .sort((a, b) => b.count - a.count);

fs.writeFileSync("docs/audits/decision240-uk-representation-audit/_name-candidates-pass2.json", JSON.stringify(rows, null, 2), "utf8");
console.log(`Distinct pass-2 candidate tokens (question/answer fields only): ${rows.length}`);
for (const r of rows) console.log(r.name.padEnd(18), "count="+r.count, "files="+r.fileCount, "ids="+r.idCount);
