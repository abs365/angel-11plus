// Generates the Continuous Writing human-calibration KIT: sample register (random ids, stratified plan) and blank recording
// sheets. Writes files only. No script, mark or result is invented; every cell is blank until a human fills it.
import fs from "node:fs";

const OUT = "scripts/output/writing-calibration-pack";
fs.mkdirSync(OUT, { recursive: true });

function mulberry32(a) {
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = mulberry32(20261008);
const shuffle = (a) => {
  const b = [...a];
  for (let i = b.length - 1; i > 0; i--) {
    const j = Math.floor(rnd() * (i + 1));
    [b[i], b[j]] = [b[j], b[i]];
  }
  return b;
};

// 20 per genre: 7 weak / 6 middling / 7 strong targets; 4 awkward cases per genre (the protocol's list).
const AWKWARD = {
  reflective: ["too_short", "off_task", "memorised_template", "heavy_spelling_errors_good_ideas"],
  narrative: ["too_short", "off_task", "memorised_template", "picture_described_not_a_story"],
};
const qualities = [...Array(7).fill("weak"), ...Array(6).fill("middling"), ...Array(7).fill("strong")];
const rows = [];
for (const [genre, code] of [["reflective", "QT-WC-01a"], ["narrative", "QT-WC-01b"]]) {
  const q = shuffle(qualities);
  const awk = [...AWKWARD[genre], ...Array(16).fill("")];
  const aw = shuffle(awk);
  for (let i = 0; i < 20; i++) rows.push({ genre, code, quality_target: q[i], awkward_type: aw[i] });
}
const used = new Set();
const id = () => {
  for (;;) {
    const v = "S" + Math.floor(rnd() * 9000 + 1000);
    if (!used.has(v)) { used.add(v); return v; }
  }
};
const register = shuffle(rows).map((r) => ({ script_id: id(), ...r, prompt_id: "", source: "", consent_ref: "", anonymised_checked: "", ready: "" }));
const head = "script_id,genre,task_code,quality_target,awkward_type,prompt_id,source,consent_ref,anonymised_checked,ready";
fs.writeFileSync(`${OUT}/sample-register.csv`, [head, ...register.map((r) => [r.script_id, r.genre, r.code, r.quality_target, r.awkward_type, r.prompt_id, r.source, r.consent_ref, r.anonymised_checked, r.ready].join(","))].join("\n") + "\n");

const dims = "ideas,vocabulary,grammar,structure,punctuation";
const ids = register.map((r) => r.script_id);
fs.writeFileSync(`${OUT}/reader-sheet-TEMPLATE.csv`, [`script_id,${dims},evidence_ideas,evidence_vocabulary,evidence_grammar,evidence_structure,evidence_punctuation,notes`, ...ids.map((s) => `${s},,,,,,,,,,,`)].join("\n") + "\n");
fs.writeFileSync(`${OUT}/ai-run-sheet-TEMPLATE.csv`, [`script_id,${dims},flagged_low_confidence_or_review_required,rubric_version,prompt_version`, ...ids.map((s) => `${s},,,,,,,,`)].join("\n") + "\n");
fs.writeFileSync(`${OUT}/third-reader-sheet-TEMPLATE.csv`, [`script_id,${dims},reason_for_third_reading`, "(only scripts where readers A and B differ)"].join("\n") + "\n");
fs.writeFileSync(`${OUT}/README.txt`, [
  "Writing calibration kit. Everything here is BLANK on purpose. No script, mark or result has been created.",
  "",
  "Cells use exactly: developing | secure | strong | could_not_judge  (flagged column: yes | no).",
  "Name the filled sheets: reader-a.csv, reader-b.csv, third-reader.csv, ai-run-1.csv, ai-run-2.csv (second AI pass on 10 scripts), then run:",
  "  npx tsx scripts/analyse-writing-calibration.mjs scripts/output/writing-calibration-pack",
  "The analysis reports measures only. It produces no mark, no band, and no CSSE-equivalent number.",
].join("\n") + "\n");
console.log("written register of", register.length, "scripts and 3 blank sheets to", OUT);
