import { readFileSync } from "node:fs";
import { structuralSignature, findCrossFamilyCollisions } from "../lib/ali/structuralSignature";
import type { BankQuestion } from "../types/ali/questionBank";

const envRaw = readFileSync(".env.local", "utf8");
const env: Record<string, string> = {};
for (const line of envRaw.split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
function urlFromJwt(jwt: string): string {
  const payload = jwt.split(".")[1];
  const decoded = JSON.parse(Buffer.from(payload, "base64").toString("utf8"));
  return `https://${decoded.ref}.supabase.co`;
}
const URL = urlFromJwt(KEY);

async function rest(path: string) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}` },
  });
  return res.json();
}

interface Row {
  id: string;
  skill: string;
  prompt: unknown;
  eligibility_status: string;
  provenance: string;
  active: boolean | null;
  family_id: string | null;
}

async function main() {
const total = await rest("ali_question_bank?select=id&limit=1000");
const maths: Row[] = await rest(
  "ali_question_bank?select=id,skill,prompt,eligibility_status,provenance,active,family_id&subject=eq.maths&limit=1000"
);

const PRACTICE_ELIGIBLE = new Set(["practice_eligible", "authentic_assessment_candidate", "independently_validated", "mock_eligible"]);
const HIGHER = new Set(["authentic_assessment_candidate", "independently_validated", "mock_eligible"]);

let mathsPracticeEligible = 0;
let mathsProvisional = 0;
let mathsHigher = 0;
let mathsQuarantined = 0;
const families = new Set<string>();
const signatures = new Map<string, number>();

const bankQuestions: BankQuestion[] = [];

for (const r of maths) {
  const quarantined = r.active === false || r.provenance === "evidence_only";
  if (quarantined) mathsQuarantined++;
  if (r.eligibility_status === "provisional") mathsProvisional++;
  if (PRACTICE_ELIGIBLE.has(r.eligibility_status) && !quarantined) mathsPracticeEligible++;
  if (HIGHER.has(r.eligibility_status)) mathsHigher++;
  if (r.family_id) families.add(r.family_id);

  const prompt = r.prompt as { answer?: unknown; workingSteps?: string[] };
  const answer = prompt?.answer !== undefined ? String(prompt.answer) : "";
  const sig = structuralSignature({ skill: r.skill, familyId: r.family_id ?? undefined, answer, workingSteps: prompt?.workingSteps });
  signatures.set(sig, (signatures.get(sig) ?? 0) + 1);

  bankQuestions.push({
    id: r.id,
    skill: r.skill,
    familyId: r.family_id ?? undefined,
    prompt: r.prompt,
  } as unknown as BankQuestion);
}

const collisions = findCrossFamilyCollisions(bankQuestions);

console.log("=== ANGEL 11+ AUTHORITATIVE CONTENT COUNT (live production, agxunwcdatosrmzhhuxj) ===");
console.log("Using real lib/ali/structuralSignature.ts module (not a reimplementation)");
console.log("TOTAL ROWS (all subjects):", total.length);
console.log("MATHEMATICS TOTAL:", maths.length);
console.log("MATHEMATICS PRACTICE ELIGIBLE:", mathsPracticeEligible);
console.log("MATHEMATICS PROVISIONAL:", mathsProvisional);
console.log("MATHEMATICS HIGHER ELIGIBILITY (authentic_assessment_candidate/independently_validated/mock_eligible):", mathsHigher);
console.log("MATHEMATICS QUARANTINED/INACTIVE:", mathsQuarantined);
console.log("MATHEMATICS FAMILIES (distinct family_id):", families.size);
console.log("MATHEMATICS STRUCTURAL SIGNATURES (distinct):", signatures.size);
console.log("Largest signature concentration:", Math.max(...signatures.values()));
console.log("Cross-family structural collisions:", collisions.size);
if (collisions.size > 0) {
  for (const [sig, fams] of collisions) {
    console.log("  COLLISION:", sig, "->", [...fams].join(", "));
  }
}
console.log("Sanity check practiceEligible+provisional+quarantined vs total:", mathsPracticeEligible + mathsProvisional + mathsQuarantined, "vs", maths.length);
}

main();
