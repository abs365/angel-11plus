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

async function restFull(path, extraHeaders = {}) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, ...extraHeaders },
  });
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { status: res.status, headers: Object.fromEntries(res.headers.entries()), body };
}

// count=exact via HEAD-style Prefer header, without pulling row bodies
async function restCount(path) {
  const res = await fetch(`${URL}/rest/v1/${path}`, {
    headers: { apikey: KEY, Authorization: `Bearer ${KEY}`, Prefer: "count=exact", Range: "0-0" },
  });
  const contentRange = res.headers.get("content-range");
  const text = await res.text();
  let body;
  try { body = JSON.parse(text); } catch { body = text; }
  return { status: res.status, contentRange, bodyLen: Array.isArray(body) ? body.length : null };
}

const NEW_PASSAGE_IDS = [
  "eng-inc003-peppersbreakfast",
  "eng-inc003-compassrosechallenge",
  "eng-inc003-salmonnavigation",
];
const EXISTING_PASSAGE_IDS = [
  "mock-eng-boathouse",
  "eng-inc001-understudy",
  "eng-inc001-bee-navigation",
  "eng-inc002-roboticsfinal",
  "eng-inc002-sailandsteam",
];

console.log("=== SECTION 1: PASSAGE EXISTENCE/METADATA (ali_passage_bank) ===");
const passageIdList = NEW_PASSAGE_IDS.join(",");
const passages = await restFull(
  `ali_passage_bank?select=id,title,eligibility_status,active,content_difficulty,reading_complexity,word_count,passage_family_id&id=in.(${passageIdList})`
);
console.log("status:", passages.status);
console.log(JSON.stringify(passages.body, null, 2));

console.log("\n=== SECTION 1b: passage count=exact HEAD probe (RLS visibility check) ===");
const passageCount = await restCount(`ali_passage_bank?id=in.(${passageIdList})`);
console.log(passageCount);

console.log("\n=== SECTION 2/3: QUESTION ROWS for the 3 new passages (ali_question_bank, by learning_unit_id) ===");
for (const pid of NEW_PASSAGE_IDS) {
  const qs = await restFull(
    `ali_question_bank?select=id,skill,learning_unit_id,family_id,eligibility_status,active,content_difficulty&learning_unit_id=eq.${pid}&order=id`
  );
  console.log(`\n-- ${pid} --`);
  console.log("status:", qs.status, "row count:", Array.isArray(qs.body) ? qs.body.length : qs.body);
  if (Array.isArray(qs.body)) console.log(JSON.stringify(qs.body, null, 2));

  const cnt = await restCount(`ali_question_bank?learning_unit_id=eq.${pid}`);
  console.log("count=exact probe:", cnt);
}

console.log("\n=== SECTION 4: PRACTICE ISOLATION — any Increment003 row with eligibility_status=practice_eligible? ===");
for (const pid of NEW_PASSAGE_IDS) {
  const r = await restFull(
    `ali_question_bank?select=id,eligibility_status&learning_unit_id=eq.${pid}&eligibility_status=eq.practice_eligible`
  );
  console.log(pid, "practice_eligible rows found:", r.status, JSON.stringify(r.body));
}
const passagePractice = await restFull(
  `ali_passage_bank?select=id,eligibility_status&id=in.(${passageIdList})&eligibility_status=eq.practice_eligible`
);
console.log("passages with eligibility_status=practice_eligible:", passagePractice.status, JSON.stringify(passagePractice.body));

console.log("\n=== SECTION 5: MOCK ISOLATION — any Increment003 row with eligibility_status=mock_eligible? ===");
for (const pid of NEW_PASSAGE_IDS) {
  const r = await restFull(
    `ali_question_bank?select=id,eligibility_status&learning_unit_id=eq.${pid}&eligibility_status=eq.mock_eligible`
  );
  console.log(pid, "mock_eligible rows found:", r.status, JSON.stringify(r.body));
}
const passageMock = await restFull(
  `ali_passage_bank?select=id,eligibility_status&id=in.(${passageIdList})&eligibility_status=eq.mock_eligible`
);
console.log("passages with eligibility_status=mock_eligible:", passageMock.status, JSON.stringify(passageMock.body));

console.log("\n=== SECTION 6: EXISTING 5 PASSAGES — certification state regression check ===");
const existingIdList = EXISTING_PASSAGE_IDS.join(",");
const existing = await restFull(
  `ali_passage_bank?select=id,title,eligibility_status,active&id=in.(${existingIdList})`
);
console.log("status:", existing.status);
console.log(JSON.stringify(existing.body, null, 2));
const existingCount = await restCount(`ali_passage_bank?id=in.(${existingIdList})`);
console.log("count=exact probe:", existingCount);

console.log("\n=== SECTION 7: SALMON LIVE TEXT SPOT CHECK ===");
const salmon = await restFull(
  `ali_passage_bank?select=id,original_text,word_count&id=eq.eng-inc003-salmonnavigation`
);
console.log("status:", salmon.status);
if (Array.isArray(salmon.body) && salmon.body.length > 0) {
  const text = salmon.body[0].original_text || "";
  console.log("word_count field:", salmon.body[0].word_count);
  console.log("live text length (chars):", text.length);
  const checks = {
    "different senses at different stages":
      text.includes("relies mainly on different senses at different stages"),
    "around the point where they first enter the sea":
      text.includes("around the point where they first enter the sea"),
    "is thought to become important":
      text.includes("is thought to become important"),
    "hedged uncertainty sentence (exactly how...one sense takes over)":
      text.includes("exactly how, and how completely, one sense takes over from the other is still being studied"),
    "STALE PHRASE CHECK - old 'takes over' unqualified phrase absent":
      !text.includes("This is where a second, completely different sense takes over."),
    "STALE PHRASE CHECK - old unqualified 'Neither sense alone...it is only by using' absent":
      !text.includes("it is only by using the magnetic sense first, then handing over to the scent sense once close enough to detect it, that the whole journey becomes possible."),
  };
  console.log(JSON.stringify(checks, null, 2));
  console.log("\nFULL LIVE TEXT:\n", text);
} else {
  console.log("NO ROW VISIBLE / BODY:", JSON.stringify(salmon.body));
}

console.log("\n=== DONE ===");
