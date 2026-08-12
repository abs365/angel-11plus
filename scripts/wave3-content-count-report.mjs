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
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  return res.json();
}

function structuralSignature(qt, prompt) {
  const answer = prompt?.answer ?? "";
  let form = "text";
  if (/^-?\d+(\.\d+)?$/.test(String(answer).trim())) form = "numeric";
  else if (/°$/.test(String(answer))) form = "degree";
  else if (/^\d+\s+\d+\/\d+$/.test(String(answer)) || /^\d+\/\d+$/.test(String(answer))) form = "fraction";
  else if (/^(true|false)$/i.test(String(answer))) form = "boolean";
  else if (/[;,]/.test(String(answer)) && String(answer).split(/[;,]/).length > 1) form = "compound";
  else if (/^[£$]/.test(String(answer))) form = "currency";
  else if (/^(greater|less|equal)/i.test(String(answer))) form = "comparative";
  else if (/^(equilateral|isosceles|scalene)/i.test(String(answer))) form = "classification";
  const steps = Array.isArray(prompt?.workingSteps) ? prompt.workingSteps.length : 0;
  return `${qt}|${form}|steps=${steps}`;
}

const total = await rest("ali_question_bank?select=id&limit=1000");
const maths = await rest(
  "ali_question_bank?select=id,question_type,prompt,eligibility_status,provenance,active,family_id&subject=eq.maths&limit=1000"
);

const PRACTICE_ELIGIBLE = new Set(["practice_eligible", "authentic_assessment_candidate", "independently_validated", "mock_eligible"]);
const HIGHER = new Set(["authentic_assessment_candidate", "independently_validated", "mock_eligible"]);

let mathsPracticeEligible = 0;
let mathsProvisional = 0;
let mathsHigher = 0;
let mathsQuarantined = 0;
const families = new Set();
const signatures = new Map();

for (const r of maths) {
  const quarantined = r.active === false || r.provenance === "evidence_only";
  if (quarantined) mathsQuarantined++;
  if (r.eligibility_status === "provisional") mathsProvisional++;
  if (PRACTICE_ELIGIBLE.has(r.eligibility_status) && !quarantined) mathsPracticeEligible++;
  if (HIGHER.has(r.eligibility_status)) mathsHigher++;
  if (r.family_id) families.add(r.family_id);
  const sig = structuralSignature(r.question_type, r.prompt);
  signatures.set(sig, (signatures.get(sig) || 0) + 1);
}

console.log("=== ANGEL 11+ AUTHORITATIVE CONTENT COUNT (live production, agxunwcdatosrmzhhuxj) ===");
console.log("TOTAL ROWS (all subjects):", total.length);
console.log("MATHEMATICS TOTAL:", maths.length);
console.log("MATHEMATICS PRACTICE ELIGIBLE:", mathsPracticeEligible);
console.log("MATHEMATICS PROVISIONAL:", mathsProvisional);
console.log("MATHEMATICS HIGHER ELIGIBILITY (authentic_assessment_candidate/independently_validated/mock_eligible):", mathsHigher);
console.log("MATHEMATICS QUARANTINED/INACTIVE:", mathsQuarantined);
console.log("MATHEMATICS FAMILIES (distinct family_id):", families.size);
console.log("MATHEMATICS STRUCTURAL SIGNATURES (distinct):", signatures.size);
console.log("Largest signature concentration:", Math.max(...signatures.values()));
console.log("Sanity check practiceEligible+provisional+quarantined vs total:", mathsPracticeEligible + mathsProvisional + mathsQuarantined, "vs", maths.length);
