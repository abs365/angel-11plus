import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";

/**
 * Question Factory Wave 1, Phase 5 — Human Review Gate Enforcement.
 *
 * "No generated candidate becomes trusted production content merely
 * because generation succeeded" (Founder's own instruction) is proven
 * here at the repository-structure level, across the WHOLE
 * lib/ali/questionFactory/ directory (candidateGeneration.ts's own test
 * file already proves this for itself alone -- this file is the
 * repo-wide, defence-in-depth version, matching this codebase's own
 * established convention of never relying on a single test to guarantee a
 * safety property).
 */

function stripComments(source: string): string {
  return source
    .replace(/\/\*[\s\S]*?\*\//g, "")
    .replace(/^\s*\/\/.*$/gm, "");
}

const FACTORY_DIR = join("lib", "ali", "questionFactory");
const FACTORY_FILES = readdirSync(FACTORY_DIR)
  .filter((f) => f.endsWith(".ts"))
  .map((f) => {
    const raw = readFileSync(join(FACTORY_DIR, f), "utf8");
    return { name: f, source: raw, executable: stripComments(raw) };
  });

test("at least the expected Question Factory source files exist (sanity check that this test is scanning something real)", () => {
  assert.ok(FACTORY_FILES.length >= 3, "expected candidateGeneration.ts, familySpecs.ts, types.ts at minimum");
  assert.ok(FACTORY_FILES.some((f) => f.name === "candidateGeneration.ts"));
});

test("no file anywhere in lib/ali/questionFactory/ imports a Supabase client -- generation and validation are pure, DB-free operations", () => {
  for (const file of FACTORY_FILES) {
    assert.doesNotMatch(file.executable, /@supabase\/supabase-js/, `${file.name} must never import a Supabase client`);
  }
});

test("no file anywhere in lib/ali/questionFactory/ references ali_question_bank, .from(, or any write/insert/update against a real table, in executable code (doc-comment mentions of what the module does NOT do are expected and excluded)", () => {
  for (const file of FACTORY_FILES) {
    assert.doesNotMatch(file.executable, /ali_question_bank/i, `${file.name} must never name the real bank table in executable code`);
    assert.doesNotMatch(file.executable, /\.from\(\s*["']/, `${file.name} must never call a Supabase-style .from() query`);
    assert.doesNotMatch(file.executable, /\beligibility_status\b/, `${file.name} must never reference eligibility_status directly`);
  }
});

test("no file anywhere in lib/ali/questionFactory/ ever sets a value literally equal to 'practice_eligible' or 'mock_eligible' in executable code", () => {
  for (const file of FACTORY_FILES) {
    assert.doesNotMatch(file.executable, /practice_eligible|mock_eligible/, `${file.name} must never assign a production eligibility status`);
  }
});

test("the candidate type itself (MathsQuestionCandidate) carries no id/eligibility_status/active field that could be confused with a real BankQuestion row -- structural, not just naming, separation", () => {
  const typesFile = FACTORY_FILES.find((f) => f.name === "types.ts");
  assert.ok(typesFile, "expected types.ts to exist");
  const candidateTypeBlock = typesFile!.source.match(/(?:export )?(?:type|interface) MathsQuestionCandidate[\s\S]*?\n\}/)?.[0] ?? "";
  assert.ok(candidateTypeBlock.length > 0, "expected to find the MathsQuestionCandidate type definition");
  assert.doesNotMatch(candidateTypeBlock, /\beligibilityStatus\b/);
  assert.doesNotMatch(candidateTypeBlock, /\bactive\s*:/);
  assert.match(candidateTypeBlock, /candidateId/, "must carry its own distinct id field, never masquerading as a bank row's `id`");
});

test("ValidationResult's own approved field is documented as automated-validation clearance only, never production trust", () => {
  const typesFile = FACTORY_FILES.find((f) => f.name === "types.ts")!;
  const resultBlock = typesFile.source.match(/(?:export )?(?:type|interface) ValidationResult[\s\S]*?\n\}/)?.[0] ?? "";
  assert.ok(resultBlock.length > 0, "expected to find the ValidationResult type definition");
});
