import { readFileSync } from "node:fs";

const envRaw = readFileSync(".env.local", "utf8");
const env = {};
for (const line of envRaw.split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
function urlFromJwt(jwt) {
  const payload = jwt.split(".")[1];
  const decoded = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
  return `https://${decoded.ref}.supabase.co`;
}
const URL = urlFromJwt(KEY);

async function rest(path) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, Prefer: "count=exact" },
  });
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { status: res.status, contentRange: res.headers.get("content-range"), body };
}

const qFields = "id,subject,skill,pathway,content_difficulty,question_type,eligibility_status,provenance,active,family_id,learning_unit_id,transfer_class,content_version";

const all = await rest(`ali_question_bank?select=${qFields}&limit=1000`);
const rows = all.body;

console.log("=== ANGEL 007H — BASELINE RECONCILIATION (live production) ===");
console.log("Total rows fetched:", rows.length, "| content-range:", all.contentRange);

function counts(rowset) {
  const byElig = {};
  for (const r of rowset) byElig[r.eligibility_status] = (byElig[r.eligibility_status] || 0) + 1;
  return byElig;
}

const bySubject = {};
for (const r of rows) {
  (bySubject[r.subject] ||= []).push(r);
}

console.log("\n--- TOTAL ---");
console.log("TOTAL:", rows.length);
console.log("By eligibility_status:", JSON.stringify(counts(rows)));

for (const subj of Object.keys(bySubject).sort()) {
  console.log(`\n--- SUBJECT: ${subj} (${bySubject[subj].length}) ---`);
  console.log("By eligibility_status:", JSON.stringify(counts(bySubject[subj])));
  const inactive = bySubject[subj].filter(r => r.active === false).length;
  const evidenceOnly = bySubject[subj].filter(r => r.provenance === "evidence_only").length;
  console.log("Inactive:", inactive, "| evidence_only provenance:", evidenceOnly);
}

// Practice-eligible learner-ready supply definition (per prior wave3-content-count-report.mjs convention)
const PRACTICE_ELIGIBLE = new Set(["practice_eligible", "authentic_assessment_candidate", "independently_validated", "mock_eligible"]);
const practiceEligibleRows = rows.filter(r => PRACTICE_ELIGIBLE.has(r.eligibility_status) && r.active !== false && r.provenance !== "evidence_only");
console.log("\n--- LEARNER-READY (PRACTICE ELIGIBLE, active, not evidence_only) ---");
console.log("TOTAL:", practiceEligibleRows.length);
for (const subj of Object.keys(bySubject).sort()) {
  console.log(subj, ":", practiceEligibleRows.filter(r => r.subject === subj).length);
}

const provisionalRows = rows.filter(r => r.eligibility_status === "provisional");
console.log("\n--- PROVISIONAL ---");
console.log("TOTAL:", provisionalRows.length);
for (const subj of Object.keys(bySubject).sort()) {
  console.log(subj, ":", provisionalRows.filter(r => r.subject === subj).length);
}

console.log("\n--- MOCK ELIGIBLE ---");
console.log("TOTAL:", rows.filter(r => r.eligibility_status === "mock_eligible").length);

// Family-level view of provisional content
console.log("\n--- PROVISIONAL BY FAMILY_ID (subject, count, transfer_class set, question_type set) ---");
const famMap = new Map();
for (const r of provisionalRows) {
  const key = r.family_id || `__NO_FAMILY__:${r.id}`;
  if (!famMap.has(key)) famMap.set(key, { subject: r.subject, count: 0, qtypes: new Set(), transfer: new Set(), difficulty: new Set(), skills: new Set(), ids: [] });
  const f = famMap.get(key);
  f.count++;
  f.qtypes.add(r.question_type);
  f.transfer.add(r.transfer_class || "NULL");
  f.difficulty.add(r.content_difficulty);
  f.skills.add(r.skill);
  f.ids.push(r.id);
}
const famRows = [...famMap.entries()].sort((a, b) => a[1].subject.localeCompare(b[1].subject) || b[1].count - a[1].count);
for (const [fam, f] of famRows) {
  console.log(`${f.subject.padEnd(10)} ${fam.padEnd(30)} n=${f.count} skill=${[...f.skills].join("|")} qtypes=${[...f.qtypes].join("|")} transfer=${[...f.transfer].join("|")} diff=${[...f.difficulty].join("|")}`);
}
console.log("Distinct provisional families/groups:", famMap.size);
console.log("Ungrouped provisional (no family_id):", [...famMap.keys()].filter(k => k.startsWith("__NO_FAMILY__")).length);

// Practice-eligible family/passage breadth (for Part 2)
console.log("\n--- PRACTICE ELIGIBLE BY FAMILY_ID ---");
const peFamMap = new Map();
for (const r of practiceEligibleRows) {
  const key = r.family_id || `__NO_FAMILY__:${r.id}`;
  if (!peFamMap.has(key)) peFamMap.set(key, { subject: r.subject, count: 0, qtypes: new Set(), transfer: new Set(), difficulty: new Set(), skills: new Set(), lu: new Set() });
  const f = peFamMap.get(key);
  f.count++;
  f.qtypes.add(r.question_type);
  f.transfer.add(r.transfer_class || "NULL");
  f.difficulty.add(r.content_difficulty);
  f.skills.add(r.skill);
  if (r.learning_unit_id) f.lu.add(r.learning_unit_id);
}
for (const [fam, f] of [...peFamMap.entries()].sort((a, b) => a[1].subject.localeCompare(b[1].subject) || b[1].count - a[1].count)) {
  console.log(`${f.subject.padEnd(10)} ${fam.padEnd(30)} n=${f.count} skill=${[...f.skills].join("|")} qtypes=${[...f.qtypes].join("|")} transfer=${[...f.transfer].join("|")} diff=${[...f.difficulty].join("|")} passages=${[...f.lu].join(",")}`);
}
console.log("Distinct practice-eligible families:", peFamMap.size);

// Competency (skill) breadth: practice-eligible vs provisional, per subject
console.log("\n--- SKILL/COMPETENCY BREADTH ---");
for (const subj of ["english", "maths"]) {
  const peSkills = new Set(practiceEligibleRows.filter(r => r.subject === subj).map(r => r.skill));
  const provSkills = new Set(provisionalRows.filter(r => r.subject === subj).map(r => r.skill));
  const provOnly = [...provSkills].filter(s => !peSkills.has(s));
  console.log(`${subj}: practice-eligible distinct skills=${peSkills.size} [${[...peSkills].join(", ")}]`);
  console.log(`${subj}: provisional distinct skills=${provSkills.size} [${[...provSkills].join(", ")}]`);
  console.log(`${subj}: skills ONLY in provisional (not yet in any learner-ready supply)=${provOnly.length} [${provOnly.join(", ")}]`);
}

// Singleton (family-of-one) practice-eligible content = zero repeat-practice variation
console.log("\n--- SINGLETON PRACTICE-ELIGIBLE ITEMS (no family grouping = no variation on repeat) ---");
for (const subj of ["english", "maths"]) {
  const singles = [...peFamMap.entries()].filter(([k, f]) => f.subject === subj && k.startsWith("__NO_FAMILY__"));
  console.log(`${subj}: ${singles.length} singleton items of ${practiceEligibleRows.filter(r => r.subject === subj).length} total practice-eligible`);
}

// Distinct learning_unit_id (passages) among practice eligible English
const peEnglish = practiceEligibleRows.filter(r => r.subject === "english");
const peLU = new Set(peEnglish.map(r => r.learning_unit_id).filter(Boolean));
console.log("\nPractice-eligible English distinct learning_unit_id (passages):", peLU.size, [...peLU].join(", "));

const provEnglish = provisionalRows.filter(r => r.subject === "english");
const provLU = new Set(provEnglish.map(r => r.learning_unit_id).filter(Boolean));
console.log("Provisional English distinct learning_unit_id (passages):", provLU.size, [...provLU].join(", "));

// Passage bank — migration 054 enabled RLS, admin-only SELECT policy.
// Decision 48 discipline applies here too: anon 200+[] is NOT proof of
// emptiness. Migrations 044/045/049/051 are known to have inserted real
// passage rows (kitemaker, lastbus, etc. already appear as
// learning_unit_id values in ali_question_bank above) — never report
// this as "0 passages exist."
const passages = await rest("ali_passage_bank?select=id,title,eligibility_status,active,provenance,content_difficulty,passage_family_id,review_state,word_count&limit=1000");
console.log("\n--- ali_passage_bank (Decision 48 discipline: RLS-opaque to anon key since migration 054) ---");
console.log("ANON/API VISIBLE ROWS:", Array.isArray(passages.body) ? passages.body.length : `status ${passages.status}`, "| content-range:", passages.contentRange);
console.log("AUTHORITATIVE DATABASE STATE: NOT AVAILABLE THROUGH THIS PATH — known NOT zero (migrations 044/045/049/051 inserted rows; passage ids already visible as learning_unit_id above) — requires Founder's authenticated Supabase Table Editor session for the real count.");

// ali_family_review — expect RLS-opaque per Decision 48; report both numbers separately, never collapse.
const review = await rest("ali_family_review?select=family_id,decision,reviewer,created_at");
console.log("\n--- ali_family_review (Decision 48 discipline: RLS-opaque via anon key since migration 054) ---");
console.log("ANON/API VISIBLE ROWS:", Array.isArray(review.body) ? review.body.length : `status ${review.status} body=${JSON.stringify(review.body)}`);
console.log("AUTHORITATIVE DATABASE STATE: NOT AVAILABLE THROUGH THIS PATH (no service-role key in repo) — requires Founder's authenticated Supabase Table Editor session, per Decision 48/51.");
