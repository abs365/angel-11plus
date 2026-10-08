/**
 * Educational Depth Phase 1, Wave 2 — Treehouse Lantern learner-routing
 * verification against LIVE production data, using the real, imported
 * production selection function (fetchEligibleWritingPrompts,
 * isWritingPracticeReady from lib/learningEngine/writingPracticeContent.ts)
 * and a real supabase-js client authenticated with the anon key -- never
 * a reimplementation, which would prove nothing.
 *
 * Run with: npx tsx scripts/verify-wave2-treehouselantern-learner-routing.mjs
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { fetchEligibleWritingPrompts, isWritingPracticeReady } from "../lib/learningEngine/writingPracticeContent.ts";

const env = {};
for (const line of readFileSync(".env.local", "utf8").split("\n")) {
  const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
  if (m) env[m[1]] = m[2].trim();
}
const KEY = env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const URL = "https://" + JSON.parse(Buffer.from(KEY.split(".")[1], "base64").toString()).ref + ".supabase.co";

const supabase = createClient(URL, KEY);

const prompts = await fetchEligibleWritingPrompts(supabase);
console.log(`fetchEligibleWritingPrompts() returned ${prompts.length} real prompt(s) via the actual production function + a real anon-authenticated client.`);

const treehouse = prompts.find((p) => p.id === "eng-practice-writing-picturenarrative-treehouselantern-01");
console.log("\n=== Treehouse Lantern, as the real production function would hand it to a learner ===");
if (!treehouse) {
  console.log("NOT FOUND -- the real selection function does not currently surface this prompt to a learner.");
} else {
  console.log("id:", treehouse.id);
  console.log("title:", treehouse.title);
  console.log("type:", treehouse.type);
  console.log("stimulus.type:", treehouse.stimulus?.type);
  console.log("stimulus.imageAssetUrl:", treehouse.stimulus?.imageAssetUrl);
  console.log("stimulus.altText present:", !!treehouse.stimulus?.altText);
  console.log("checklist length:", treehouse.checklist?.length);
  console.log("=> Survived isValidWritingPrompt()'s own real shape/stimulus validation (the same gate every learner session uses) -- not silently dropped.");
}

const riverboatLeak = prompts.find((p) => p.id === "eng-practice-writing-picturenarrative-riverboat-01");
console.log("\n=== Riverboat (rejected) exposure check ===");
console.log(riverboatLeak ? "LEAK: the rejected Riverboat row IS surfaced to learners -- this would be a real defect." : "Confirmed absent -- the rejected Riverboat row is not surfaced to learners.");

const mockLeak = prompts.find((p) => p.id === "eng-q2-picturenarrative-oldshed");
console.log("\n=== Mock Q2 leakage check ===");
console.log(mockLeak ? "LEAK: Mock's own picture-narrative row IS surfaced to Practice learners -- this would be a real defect." : "Confirmed absent -- Mock's own row is not surfaced to Practice.");

console.log("\n=== Distinct response shapes now live ===");
const shapes = [...new Set(prompts.map((p) => p.type))];
console.log(`${prompts.length} prompts across ${shapes.length} distinct shapes:`, shapes);
console.log("isWritingPracticeReady():", isWritingPracticeReady(prompts));
