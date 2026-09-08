import { readFileSync, writeFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { generateBlueprintCandidate, validateBlueprintCandidate } from "../lib/ali/questionFactory/candidateGeneration.ts";
import { mapMathsCandidateToStoreRow } from "../lib/ali/questionFactory/mathsCandidateStoreMapping.ts";
import { MR04_REVERSE_PERCENTAGE_FAMILY } from "../lib/ali/questionFactory/mr04ReversePercentageBlueprints.ts";
import { MR04_TIME_REVERSE_FAMILY } from "../lib/ali/questionFactory/mr04TimeReverseBlueprints.ts";
import { MR01_REVERSE_MEAN_FAMILY } from "../lib/ali/questionFactory/mr01ReverseMeanBlueprints.ts";

function loadAnonKey() {
  const envRaw = readFileSync(".env.local", "utf8");
  for (const line of envRaw.split("\n")) {
    const m = line.match(/^NEXT_PUBLIC_SUPABASE_ANON_KEY=(.*)$/);
    if (m) return m[1].trim();
  }
  throw new Error("NEXT_PUBLIC_SUPABASE_ANON_KEY not found in .env.local");
}

const ANON_KEY = loadAnonKey();
const SUPABASE_URL = "https://" + JSON.parse(Buffer.from(ANON_KEY.split(".")[1], "base64").toString("utf8")).ref + ".supabase.co";
const supabase = createClient(SUPABASE_URL, ANON_KEY);

const FAMILIES = [
  { family: MR04_REVERSE_PERCENTAGE_FAMILY, familyId: "mr04-reverse-percentage" },
  { family: MR04_TIME_REVERSE_FAMILY, familyId: "mr04-time-reverse" },
  { family: MR01_REVERSE_MEAN_FAMILY, familyId: "mr01-reverse-mean" },
];

const VARIANTS_PER_BLUEPRINT = 4; // smallest-sufficient, matches this bank's own established 3-4-siblings-per-structure convention

function seededRandom(seed) {
  let state = seed;
  return () => { state = (state * 1103515245 + 12345) & 0x7fffffff; return state / 0x7fffffff; };
}

// Simple deterministic string hash -> positive int seed, so every blueprint gets its own stable, reproducible seed derived from its own id (never Date.now()).
function seedFromString(s) {
  let h = 0;
  for (let i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) & 0x7fffffff;
  return h || 1;
}

const manifest = { generatedAt: new Date().toISOString(), families: {} };
let totalApproved = 0;
let totalRejected = 0;

for (const { family, familyId } of FAMILIES) {
  const { data: existingRows, error } = await supabase
    .from("ali_question_bank")
    .select("id, family_id, prompt")
    .eq("family_id", familyId);
  if (error) throw new Error(`Failed to read existing rows for ${familyId}: ${error.message}`);

  console.log(`\n${familyId}: ${existingRows.length} real existing production rows read (for exact-duplicate comparison)`);

  const approvedByBlueprint = {};
  const allApprovedThisFamily = [];

  for (const bp of family.blueprints) {
    const approved = [];
    let attempts = 0;
    let seed = seedFromString(bp.blueprintId);
    while (approved.length < VARIANTS_PER_BLUEPRINT && attempts < 500) {
      attempts++;
      const random = seededRandom(seed + attempts * 7919); // distinct stream per attempt, still fully deterministic
      const candidate = generateBlueprintCandidate(bp, random);
      const validation = validateBlueprintCandidate(candidate, bp, existingRows, [...allApprovedThisFamily, ...approved]);
      if (validation.approved) {
        approved.push(candidate);
      }
    }
    if (approved.length < VARIANTS_PER_BLUEPRINT) {
      throw new Error(`FAIL: ${bp.blueprintId} only produced ${approved.length}/${VARIANTS_PER_BLUEPRINT} approved candidates in 500 attempts`);
    }
    approvedByBlueprint[bp.blueprintId] = approved;
    allApprovedThisFamily.push(...approved);
  }

  const candidateManifestEntries = [];
  for (const bp of family.blueprints) {
    const list = approvedByBlueprint[bp.blueprintId];
    list.forEach((candidate, i) => {
      const stableCandidateId = `qf-ei003-${bp.blueprintId}-${String(i + 1).padStart(2, "0")}`;
      const validation = validateBlueprintCandidate(candidate, bp, existingRows, []);
      const rpcArgs = mapMathsCandidateToStoreRow(stableCandidateId, candidate, bp, validation);
      candidateManifestEntries.push({
        candidateId: stableCandidateId,
        blueprintId: bp.blueprintId,
        familyId,
        difficulty: candidate.difficulty,
        reasoningRoute: candidate.reasoningRoute,
        unknownPosition: candidate.unknownPosition,
        representationType: candidate.representationType,
        misconceptionTargeted: bp.misconceptionTargeted ?? null,
        question: candidate.question,
        claimedAnswer: candidate.claimedAnswer,
        workingSteps: candidate.workingSteps,
        rpcArgs,
      });
    });
  }

  manifest.families[familyId] = {
    existingProductionRowCount: existingRows.length,
    blueprintCount: family.blueprints.length,
    variantsPerBlueprint: VARIANTS_PER_BLUEPRINT,
    totalManufactured: candidateManifestEntries.length,
    candidates: candidateManifestEntries,
  };

  totalApproved += candidateManifestEntries.length;
  console.log(`  manufactured ${candidateManifestEntries.length} candidates across ${family.blueprints.length} blueprints (${VARIANTS_PER_BLUEPRINT} each)`);
}

writeFileSync("scripts/output/ei003-wave1-manufactured-manifest.json", JSON.stringify(manifest, null, 2));
console.log(`\nTOTAL manufactured: ${totalApproved}`);
console.log("Manifest written to scripts/output/ei003-wave1-manufactured-manifest.json");
