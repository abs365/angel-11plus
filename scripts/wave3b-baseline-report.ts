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

  const counts: Record<string, number> = {
    practice_eligible: 0,
    provisional: 0,
    authentic_assessment_candidate: 0,
    independently_validated: 0,
    mock_eligible: 0,
  };
  let mathsInactive = 0;
  const families = new Set<string>();
  const signatures = new Map<string, number>();
  const bankQuestions: BankQuestion[] = [];

  for (const r of maths) {
    if (r.active === false) mathsInactive++;
    if (r.eligibility_status in counts) counts[r.eligibility_status]++;
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

  console.log("=== ANGEL 11+ EDUCATIONAL INCREMENT 006B — POST-MIGRATION AUTHORITATIVE BASELINE ===");
  console.log("Live production, project agxunwcdatosrmzhhuxj, queried directly via REST, real structuralSignature module.\n");
  console.log("TOTAL QUESTION BANK ROWS:", total.length);
  console.log("MATHEMATICS TOTAL ROWS:", maths.length);
  console.log("MATHEMATICS PRACTICE ELIGIBLE:", counts.practice_eligible);
  console.log("MATHEMATICS PROVISIONAL:", counts.provisional);
  console.log("MATHEMATICS AUTHENTIC ASSESSMENT CANDIDATE:", counts.authentic_assessment_candidate);
  console.log("MATHEMATICS INDEPENDENTLY VALIDATED:", counts.independently_validated);
  console.log("MATHEMATICS MOCK ELIGIBLE:", counts.mock_eligible);
  console.log("MATHEMATICS INACTIVE:", mathsInactive);
  console.log("MATHEMATICS DISTINCT FAMILIES:", families.size);
  console.log("MATHEMATICS DISTINCT STRUCTURAL SIGNATURES:", signatures.size);
  console.log("Largest signature concentration:", Math.max(...signatures.values()));
  console.log("Cross-family structural collisions:", collisions.size);
  const sumAll = Object.values(counts).reduce((a, b) => a + b, 0) + mathsInactive;
  console.log("Sanity check (sum of all statuses + inactive vs total):", sumAll, "vs", maths.length);
}

main();
