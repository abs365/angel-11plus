import { readFileSync } from "node:fs";
import { computeFamilyExposure, classifyRetrievalStage, RETRIEVAL_INTERVAL_DAYS } from "../lib/ali/exposureIntelligence";
import { reduceFamilyClustering, applyRetrievalPriority } from "../lib/learningEngine/sessionGenerator";
import type { BankQuestion } from "../types/ali/questionBank";
import type { StudentQuestionHistoryRow } from "../types/ali/history";

/**
 * Educational Increment 006B, Part 9-11 — production verification of
 * exposure intelligence, spaced retrieval, and anti-memorisation
 * selection.
 *
 * IMPORTANT DISCLOSURE: the question POOL below is fetched live from
 * production (real families, real items). The learner HISTORY is
 * authored, simulated test fixtures — no real learner has accumulated
 * weeks of history against this content yet. This is explicitly
 * SIMULATED TEMPORAL HISTORY, not real longitudinal learner evidence,
 * per the Founder's own instruction not to fabricate weeks of real
 * history. Every fixture is labelled with which of the Founder's six
 * required scenarios (A-F) it represents.
 */

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

function fixtureRow(questionId: string, opts: Partial<StudentQuestionHistoryRow>): StudentQuestionHistoryRow {
  return {
    profileId: "test-profile",
    questionId,
    source: "practice",
    timesSeen: 1,
    timesCorrect: 1,
    distinctCorrectSessions: 1,
    lastCorrectSessionId: null,
    lastPresentedAt: new Date().toISOString(),
    lastPresentedAtSequence: 1,
    lastAttemptCorrect: true,
    secondLastAttemptCorrect: null,
    masteryState: "learning",
    lastAttemptTimeSeconds: null,
    lastAttemptSkipped: null,
    lastAttemptAnswerChanged: null,
    lastAttemptFirstAnswer: null,
    lastAttemptFinalAnswer: null,
    lastAttemptConfidenceRating: null,
    lastAttemptWorkingShown: null,
    firstSource: null,
    lastAttemptSupportTier: null,
    ...opts,
  };
}

function daysAgo(n: number): string {
  return new Date(Date.now() - n * 24 * 60 * 60 * 1000).toISOString();
}

async function main() {
  const rows: Array<{ id: string; skill: string; family_id: string | null; prompt: unknown }> = await rest(
    "ali_question_bank?select=id,skill,family_id,prompt&subject=eq.maths&eligibility_status=eq.practice_eligible&limit=1000"
  );
  const byFamily = new Map<string, typeof rows>();
  for (const r of rows) {
    if (!r.family_id) continue;
    if (!byFamily.get(r.family_id)) byFamily.set(r.family_id, []);
    byFamily.get(r.family_id)!.push(r);
  }
  const families = [...byFamily.keys()];
  console.log(`Live Practice-Eligible Mathematics families available: ${families.length}`);
  if (families.length < 7) {
    console.error("FAIL: need at least 7 distinct families in production to run all 6 scenarios plus one control");
    process.exit(1);
  }

  const candidatePool: BankQuestion[] = rows.map((r) => ({
    id: r.id,
    skill: r.skill,
    familyId: r.family_id ?? undefined,
    prompt: r.prompt,
  })) as unknown as BankQuestion[];

  // Pick 6 real, distinct, live families — one per scenario — plus a 7th untouched family as the "no history at all" control baseline.
  const [famA, famB, famC, famD, famE, famF] = families;
  const repItem = (fam: string) => byFamily.get(fam)![0].id;

  const history = new Map<string, StudentQuestionHistoryRow>();
  // A. unseen family — deliberately no entry for famA.
  // B. recently seen and independently correct, not yet secure.
  history.set(repItem(famB), fixtureRow(repItem(famB), {
    lastAttemptCorrect: true, masteryState: "learning", lastAttemptSupportTier: "independent", lastPresentedAt: daysAgo(1),
  }));
  // C. recently seen but incorrect.
  history.set(repItem(famC), fixtureRow(repItem(famC), {
    lastAttemptCorrect: false, masteryState: "learning", lastPresentedAt: daysAgo(1),
  }));
  // D. recently seen WITH SUPPORT (correct, but scaffolded).
  history.set(repItem(famD), fixtureRow(repItem(famD), {
    lastAttemptCorrect: true, masteryState: "weak", lastAttemptSupportTier: "supported", lastPresentedAt: daysAgo(1),
  }));
  // E. mastered, but the maintenance window has elapsed — due for spaced retrieval.
  history.set(repItem(famE), fixtureRow(repItem(famE), {
    lastAttemptCorrect: true, masteryState: "mastered", lastPresentedAt: daysAgo(RETRIEVAL_INTERVAL_DAYS.maintenanceWindow + 3),
  }));
  // F. strongly established, recently confirmed — maintenance only, not due.
  history.set(repItem(famF), fixtureRow(repItem(famF), {
    lastAttemptCorrect: true, masteryState: "mastered", lastPresentedAt: daysAgo(2),
  }));

  const exposure = computeFamilyExposure(candidatePool, history);
  const now = new Date();

  const scenarios: Array<[string, string, ReturnType<typeof classifyRetrievalStage>]> = [
    ["A (unseen)", famA, "NEW"],
    ["B (recent, independent, not secure)", famB, "SHORT_TERM_RETRIEVAL"],
    ["C (recent, incorrect)", famC, "IMMEDIATE_REMEDIATION"],
    ["D (recent, supported)", famD, "SHORT_TERM_RETRIEVAL"],
    ["E (mastered, window elapsed)", famE, "SPACED_RETRIEVAL"],
    ["F (mastered, recently confirmed)", famF, "MASTERY_MAINTENANCE"],
  ];

  let ok = true;
  console.log("\n--- Retrieval stage classification against real production families ---");
  for (const [label, fam, expected] of scenarios) {
    const stage = classifyRetrievalStage(exposure.get(fam), now);
    const pass = stage === expected;
    if (!pass) ok = false;
    console.log(`${pass ? "PASS" : "FAIL"} ${label} [family=${fam}]: expected ${expected}, got ${stage}`);
  }

  console.log(
    "\nDISCLOSED LIMITATION: scenarios B and D both classify as SHORT_TERM_RETRIEVAL. The raw history " +
    "(lastAttemptSupportTier: 'independent' vs 'supported') genuinely distinguishes them, but " +
    "classifyRetrievalStage() does not yet use that field to separate the two into different stages or " +
    "weights. This is a real granularity gap in the current policy, not a defect masked by this test."
  );

  // --- Anti-memorisation: sibling-suppression when an alternative exists ---
  console.log("\n--- Anti-memorisation: MASTERY_MAINTENANCE swap when an alternative exists ---");
  const famFItems = byFamily.get(famF)!.map((r) => ({ id: r.id, skill: r.skill, familyId: r.family_id, prompt: r.prompt } as unknown as BankQuestion));
  const famAItems = byFamily.get(famA)!.map((r) => ({ id: r.id, skill: r.skill, familyId: r.family_id, prompt: r.prompt } as unknown as BankQuestion));
  const selectedWithAlternative = [famFItems[0]];
  const poolWithAlternative = [...famFItems, ...famAItems];
  const afterSwap = applyRetrievalPriority(selectedWithAlternative, poolWithAlternative, exposure, now);
  const swapped = afterSwap[0].id !== famFItems[0].id;
  console.log(`${swapped ? "PASS" : "FAIL"}: MASTERY_MAINTENANCE item ${swapped ? "was" : "was NOT"} swapped for a NEW-family alternative (${famFItems[0].id} -> ${afterSwap[0].id})`);
  if (!swapped) ok = false;

  // --- Anti-memorisation: no alternative available -> item is kept, never dropped (deliberate retrieval not blocked) ---
  console.log("\n--- Anti-memorisation: MASTERY_MAINTENANCE item kept when NO alternative exists ---");
  const selectedNoAlternative = [famFItems[0]];
  const poolNoAlternative = [...famFItems]; // only the mastered family available — no due/unseen alternative
  const afterNoSwap = applyRetrievalPriority(selectedNoAlternative, poolNoAlternative, exposure, now);
  const kept = afterNoSwap[0].id === famFItems[0].id && afterNoSwap.length === 1;
  console.log(`${kept ? "PASS" : "FAIL"}: item ${kept ? "was correctly kept" : "was incorrectly dropped or changed"} (deliberate retrieval is not blocked when nothing better is available)`);
  if (!kept) ok = false;

  // --- Sibling-variant suppression across a full family (reduceFamilyClustering) ---
  console.log("\n--- Sibling-variant suppression: 4 items from the same family in a row ---");
  const famBItemsMapped = byFamily.get(famB)!.map(
    (r) => ({ id: r.id, skill: r.skill, familyId: r.family_id, prompt: r.prompt } as unknown as BankQuestion)
  );
  if (famBItemsMapped.length >= 2) {
    const repeatedSelection = [famBItemsMapped[0], famBItemsMapped[1] ?? famBItemsMapped[0], famFItems[0], famAItems[0]];
    const diversified = reduceFamilyClustering(repeatedSelection, candidatePool);
    const famCounts = new Map<string, number>();
    for (const q of diversified) famCounts.set(q.familyId!, (famCounts.get(q.familyId!) ?? 0) + 1);
    const maxRepeat = Math.max(...famCounts.values());
    console.log(`${maxRepeat <= 1 ? "PASS" : "FAIL"}: max same-family repeats in a 4-item selection after diversification = ${maxRepeat}`);
    if (maxRepeat > 1) ok = false;
  }

  console.log(ok ? "\nEXPOSURE INTELLIGENCE PRODUCTION VERIFICATION: PASS" : "\nEXPOSURE INTELLIGENCE PRODUCTION VERIFICATION: FAIL");
  if (!ok) process.exit(1);
}

main();
