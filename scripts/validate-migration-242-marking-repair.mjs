import fs from "node:fs";

let problems = 0;
function check(label, cond) {
  if (cond) console.log(`PASS: ${label}`);
  else {
    problems++;
    console.log(`FAIL: ${label}`);
  }
}

const repairData = JSON.parse(
  fs.readFileSync(new URL("./output/ei003-wave2-modelanswer-marks-repair-source.json", import.meta.url), "utf8")
);
const submissionPayload = JSON.parse(
  fs.readFileSync(new URL("./output/ei003-wave2-submission-payload.json", import.meta.url), "utf8")
);
const sql = fs.readFileSync(new URL("../supabase/migrations/242_ei003_wave2_marking_contract_repair.sql", import.meta.url), "utf8");

check("exactly 40 candidates in repair source", repairData.length === 40);

// Every modelAnswer must equal the real acceptedAnswers[0] used at submission (p_claimed_answer) -- never a fabricated value.
const byId = Object.fromEntries(submissionPayload.map((p) => [p.p_candidate_id, p]));
let mismatches = 0;
for (const r of repairData) {
  const payload = byId[r.id];
  if (!payload) { mismatches++; console.log(`MISSING SUBMISSION PAYLOAD: ${r.id}`); continue; }
  if (payload.p_claimed_answer !== r.modelAnswer) { mismatches++; console.log(`MISMATCH: ${r.id}`); continue; }
  if (payload.p_question_content.acceptedAnswers[0] !== r.modelAnswer) { mismatches++; console.log(`ACCEPTED-ANSWERS[0] MISMATCH: ${r.id}`); }
}
check(`every modelAnswer matches the real, already-approved acceptedAnswers[0]/claimed_answer (0 mismatches expected, found ${mismatches})`, mismatches === 0);

// Migration contains exactly 40 UPDATE statements, each targeting one qf-<id>.
const updateCount = (sql.match(/^update public\.ali_question_bank$/gim) || []).length;
check(`migration contains exactly 40 UPDATE statements (found ${updateCount})`, updateCount === 40);

for (const r of repairData) {
  const qid = `qf-${r.id}`;
  check(`migration references ${qid}`, sql.includes(`'${qid}'`));
}

// No destructive rebuild -- every update uses the non-destructive || merge, never `set prompt = jsonb_build_object(...)` alone.
const bareRebuildPattern = /set prompt = jsonb_build_object/i;
check("no destructive prompt rebuild (every update uses `prompt || jsonb_build_object(...)`)", !bareRebuildPattern.test(sql));

// No other table touched.
check("migration touches ali_question_bank only", !/update public\.(?!ali_question_bank)/i.test(sql));
check("migration contains no DELETE statement", !/delete from/i.test(sql));

// Header discloses NOT APPLIED.
check("migration header discloses NOT APPLIED", /NOT APPLIED/.test(sql));

console.log(`\n${problems === 0 ? "MIGRATION 242 STATIC VALIDATION: PASS" : `MIGRATION 242 STATIC VALIDATION: FAIL (${problems} problems)`}`);
process.exit(problems === 0 ? 0 : 1);
