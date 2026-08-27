import { test } from "node:test";
import assert from "node:assert/strict";
import { buildCompositionProvenance, buildMockFormInsertPayload, buildQuestionManifestJson } from "@/lib/ali/mockFreezeManifest";
import type { ManifestValidationReport } from "@/lib/ali/mockComposition";

const VALID_REPORT: ManifestValidationReport = {
  valid: true,
  rawRowCount: 4,
  numberedQuestionCount: 2,
  totalMarks: 6,
  difficultyDistribution: { easy: 1, medium: 2, hard: 1, challenge: 0 },
  skillDistribution: { "QT-MR-01": 2 },
  familyIds: ["family-a", "family-b"],
  questionIds: ["group-a-1", "group-a-2", "standalone-1", "standalone-2"],
  failures: [],
};

test("buildQuestionManifestJson: produces the exact {question_id, section} shape mock_create_attempt()/mock_create_cycle_attempt() read", () => {
  const manifest = buildQuestionManifestJson(["q1", "q2"], "mathematics");
  assert.deepEqual(manifest, [
    { question_id: "q1", section: "mathematics" },
    { question_id: "q2", section: "mathematics" },
  ]);
});

test("buildQuestionManifestJson: preserves order exactly, never resorts", () => {
  const manifest = buildQuestionManifestJson(["z", "a", "m"], "mathematics");
  assert.deepEqual(manifest.map((m) => m.question_id), ["z", "a", "m"]);
});

test("buildCompositionProvenance: captures the report's own totals/distributions verbatim, never recomputed", () => {
  const provenance = buildCompositionProvenance(VALID_REPORT, 20, "2026-08-27T00:00:00.000Z");
  assert.equal(provenance.totalMarks, 6);
  assert.equal(provenance.numberedQuestionCount, 2);
  assert.equal(provenance.rawRowCount, 4);
  assert.equal(provenance.targetExperienceCount, 20);
  assert.deepEqual(provenance.difficultyDistribution, VALID_REPORT.difficultyDistribution);
  assert.deepEqual(provenance.skillDistribution, VALID_REPORT.skillDistribution);
  assert.deepEqual(provenance.familyIds, VALID_REPORT.familyIds);
  assert.equal(provenance.composedAt, "2026-08-27T00:00:00.000Z");
});

test("buildMockFormInsertPayload: subject is always 'mathematics' (matching ali_mock_form's own check constraint, migration 085) never 'maths'", () => {
  const payload = buildMockFormInsertPayload("first-mock-maths-v1", VALID_REPORT, 20, "2026-08-27T00:00:00.000Z");
  assert.equal(payload.subject, "mathematics");
});

test("buildMockFormInsertPayload: active is always false -- this module never proposes an immediately-active form", () => {
  const payload = buildMockFormInsertPayload("first-mock-maths-v1", VALID_REPORT, 20, "2026-08-27T00:00:00.000Z");
  assert.equal(payload.active, false);
});

test("buildMockFormInsertPayload: attempt_type is full_mock, question_manifest matches the report's own question ids exactly", () => {
  const payload = buildMockFormInsertPayload("first-mock-maths-v1", VALID_REPORT, 20, "2026-08-27T00:00:00.000Z");
  assert.equal(payload.attempt_type, "full_mock");
  assert.deepEqual(payload.question_manifest.map((m) => m.question_id), VALID_REPORT.questionIds);
});

test("buildMockFormInsertPayload: default specification_version is 1, section defaults to 'mathematics', both overridable", () => {
  const defaultPayload = buildMockFormInsertPayload("form-id", VALID_REPORT, 20, "2026-08-27T00:00:00.000Z");
  assert.equal(defaultPayload.specification_version, 1);
  assert.equal(defaultPayload.question_manifest[0].section, "mathematics");

  const overridden = buildMockFormInsertPayload("form-id", VALID_REPORT, 20, "2026-08-27T00:00:00.000Z", { specificationVersion: 2, section: "maths-section" });
  assert.equal(overridden.specification_version, 2);
  assert.equal(overridden.question_manifest[0].section, "maths-section");
});

test("buildMockFormInsertPayload: composition_provenance is embedded, not merged into question_manifest itself", () => {
  const payload = buildMockFormInsertPayload("form-id", VALID_REPORT, 20, "2026-08-27T00:00:00.000Z");
  assert.equal(payload.composition_provenance.totalMarks, 6);
  for (const entry of payload.question_manifest) {
    assert.deepEqual(Object.keys(entry).sort(), ["question_id", "section"]);
  }
});

test("buildMockFormInsertPayload is a pure function: never imports a Supabase client, never performs an I/O call", async () => {
  const source = await import("node:fs/promises").then((fs) => fs.readFile("lib/ali/mockFreezeManifest.ts", "utf8"));
  const codeOnly = source
    .split("\n")
    .filter((line) => !line.trim().startsWith("*") && !line.trim().startsWith("//"))
    .join("\n")
    .replace(/\/\*[\s\S]*?\*\//g, "");
  assert.ok(!/from\s+["']@supabase|createClient|SupabaseClient/.test(codeOnly), "mockFreezeManifest.ts must never import or reference a Supabase client -- pure data shaping only");
  assert.ok(!/\.insert\(|\.from\(/.test(codeOnly), "mockFreezeManifest.ts must never perform a database write");
});
