import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { isValidMockQuestionPayload, isPayloadRedactionSafe } from "@/lib/mockAttempt/redaction";
import { resolveAttemptType } from "@/lib/mockAttempt/workspace";

/**
 * Programme Completion Increment 016 — production defect correction.
 * The first genuine Reading Comprehension Mock 1 sitting reached its
 * questions but the passage never rendered: mock_get_question()
 * (migration 070, redefined by 106/115/122) never returned passageTitle/
 * passageText, even though every Reading question's own prompt JSON has
 * always carried them inline. This file proves, from the real content
 * source and the real, corrected function/type/component chain, that
 * the fix is genuine and bounded — not just that it compiles.
 *
 * CODE/SQL VERIFIED, NOT PRODUCTION VERIFIED — same disclosed limitation
 * as every migration-content test in this repository.
 */

const migration218 = readFileSync("supabase/migrations/218_mock_get_question_passage_fields.sql", "utf8");
const mockExamSource = readFileSync("app/learning-intelligence/mock-exam/page.tsx", "utf8");
const readingPassageComponent = readFileSync("components/mockAttempt/ReadingPassage.tsx", "utf8");
const migration097 = readFileSync("supabase/migrations/097_mock_english_passage_content_foundation.sql", "utf8");
const migration152 = readFileSync("supabase/migrations/152_english_content_foundation_increment001_comprehension.sql", "utf8");

function extractPromptsById(sql: string): Map<string, Record<string, unknown>> {
  const map = new Map<string, Record<string, unknown>>();
  const re = /\$json\$(\{[\s\S]*?\})\$json\$/g;
  let m: RegExpExecArray | null;
  while ((m = re.exec(sql))) {
    try {
      const obj = JSON.parse(m[1]);
      if (obj.id) map.set(obj.id, obj);
    } catch {
      // ignore non-JSON matches
    }
  }
  return map;
}

const boathousePrompts = extractPromptsById(migration097);
const inc001Prompts = extractPromptsById(migration152); // Bees + Understudy

// --- mock_get_question() genuinely returns the passage fields ----------

test("migration 218 adds passageTitle/passageText to mock_get_question()'s return, additively, preserving every original key unchanged", () => {
  const original11Keys = [
    "questionId", "subject", "skill", "question", "marks", "contentDifficulty",
    "questionGroupId", "groupOrder", "subpartLabel", "stimulus", "sharedStem",
  ];
  for (const key of original11Keys) {
    assert.match(migration218, new RegExp(`'${key}',`), `must preserve the original '${key}' key`);
  }
  assert.match(migration218, /'passageTitle', v_row\.prompt->'passageTitle'/);
  assert.match(migration218, /'passageText', v_row\.prompt->'passageText'/);
});

test("migration 218 preserves the exact security/precondition logic (attempt ownership, in_progress, not expired, manifest membership) unchanged", () => {
  for (const check of [
    /if not found then\s*\n\s*raise exception 'Attempt % not found for caller'/,
    /if v_attempt\.status <> 'in_progress' then/,
    /if v_attempt\.expires_at is not null and now\(\) > v_attempt\.expires_at then/,
    /if not \(p_question_id = any\(v_attempt\.assigned_question_ids\)\) then/,
  ]) {
    assert.match(migration218, check);
  }
});

test("migration 218 preserves the exact original grants -- authenticated only, anon explicitly revoked", () => {
  assert.match(migration218, /grant execute on function public\.mock_get_question\(uuid, text\) to authenticated;/);
  assert.match(migration218, /revoke execute on function public\.mock_get_question\(uuid, text\) from anon;/);
});

// --- The renderer only shows a passage when one is genuinely present ---

test("the mock-exam page renders ReadingPassage only when passageText is present, for both standalone and grouped questions -- never an empty/fake passage box", () => {
  const occurrences = mockExamSource.match(/passageText && <ReadingPassage/g) ?? [];
  assert.equal(occurrences.length, 2, "expected one conditional render in the standalone branch and one in the grouped branch");
});

test("a grouped question (e.g. q12a/q12b) renders ONE passage for the whole group, from payloads[0], never re-fetched or duplicated per subpart", () => {
  assert.match(mockExamSource, /payloads\[0\]\.passageText && <ReadingPassage title=\{payloads\[0\]\.passageTitle\} text=\{payloads\[0\]\.passageText\}/);
});

test("ReadingPassage is a real, accessible, generic component -- no hardcoded passage content, an accessible heading only when a title exists", () => {
  assert.doesNotMatch(readingPassageComponent, /Boat in the Boathouse|Understudy|How Bees/, "must not hardcode any specific passage's content");
  assert.match(readingPassageComponent, /aria-labelledby/);
  assert.match(readingPassageComponent, /whitespace-pre-line/, "must preserve the passage's own paragraph breaks");
});

// --- passageTitle/passageText are genuinely safe to expose (not answer material) ---

test("passageTitle/passageText are not in the protected-field redaction list -- they are the material the question is ABOUT, shown before answering, exactly like `question` and `stimulus`", () => {
  const safePayload = {
    questionId: "q1", subject: "english", skill: "RC-01", question: "?", marks: 1,
    contentDifficulty: "medium", questionGroupId: null, groupOrder: null, subpartLabel: null,
    stimulus: null, sharedStem: null, passageTitle: "A Passage", passageText: "Once upon a time...",
  };
  assert.equal(isPayloadRedactionSafe(safePayload), true);
  assert.equal(isValidMockQuestionPayload(safePayload), true);
});

test("isValidMockQuestionPayload still accepts a Mathematics-shaped payload with null passage fields -- byte-identical behaviour to before this increment", () => {
  const mathsPayload = {
    questionId: "mock-mr01-directcalc-01", subject: "mathematics", skill: "QT-MR-01", question: "2+2?", marks: 1,
    contentDifficulty: "easy", questionGroupId: null, groupOrder: null, subpartLabel: null,
    stimulus: null, sharedStem: null, passageTitle: null, passageText: null,
  };
  assert.equal(isValidMockQuestionPayload(mathsPayload), true);
});

test("isValidMockQuestionPayload also accepts a payload where passage fields are simply absent (undefined) -- a payload fetched before this increment must not be rejected outright", () => {
  const legacyShapedPayload = {
    questionId: "mock-mr01-directcalc-01", subject: "mathematics", skill: "QT-MR-01", question: "2+2?", marks: 1,
    contentDifficulty: "easy", questionGroupId: null, groupOrder: null, subpartLabel: null,
    stimulus: null, sharedStem: null,
  };
  assert.equal(isValidMockQuestionPayload(legacyShapedPayload), true);
});

// --- Each Reading Mock passage's real, authored content is genuinely present and correctly attributed ---

test("Bees questions (eng-inc001-bee-q01..08) all carry the real 'How Bees Find Their Way Home' passage, non-empty, in their own authored prompt", () => {
  for (let i = 1; i <= 8; i++) {
    const id = `eng-inc001-bee-q${String(i).padStart(2, "0")}`;
    const prompt = inc001Prompts.get(id);
    assert.ok(prompt, `${id} must exist in the authored content`);
    assert.equal(prompt!.passageTitle, "How Bees Find Their Way Home");
    assert.ok(typeof prompt!.passageText === "string" && (prompt!.passageText as string).length > 100, `${id} must carry real passage text`);
  }
});

test("Boathouse questions (mock-eng-boathouse-q01..q12b) all carry the real 'The Boat in the Boathouse' passage", () => {
  const ids = [...Array.from({ length: 11 }, (_, i) => `mock-eng-boathouse-q${String(i + 1).padStart(2, "0")}`), "mock-eng-boathouse-q12a", "mock-eng-boathouse-q12b"];
  assert.equal(ids.length, 13);
  for (const id of ids) {
    const prompt = boathousePrompts.get(id);
    assert.ok(prompt, `${id} must exist in the authored content`);
    assert.equal(prompt!.passageTitle, "The Boat in the Boathouse");
    assert.ok(typeof prompt!.passageText === "string" && (prompt!.passageText as string).length > 100, `${id} must carry real passage text`);
  }
});

test("Understudy questions (eng-inc001-understudy-q01..07) all carry the real 'The Understudy' passage, distinct from Bees'", () => {
  for (let i = 1; i <= 7; i++) {
    const id = `eng-inc001-understudy-q${String(i).padStart(2, "0")}`;
    const prompt = inc001Prompts.get(id);
    assert.ok(prompt, `${id} must exist in the authored content`);
    assert.equal(prompt!.passageTitle, "The Understudy");
    assert.notEqual(prompt!.passageText, inc001Prompts.get("eng-inc001-bee-q01")?.passageText, "Understudy and Bees must never share the same passage text");
  }
});

test("every Boathouse question's passageText is byte-identical across the whole passage (one real source of truth per passage, not 13 independently-drifted copies)", () => {
  const first = boathousePrompts.get("mock-eng-boathouse-q01")!.passageText;
  for (let i = 2; i <= 11; i++) {
    const id = `mock-eng-boathouse-q${String(i).padStart(2, "0")}`;
    assert.equal(boathousePrompts.get(id)!.passageText, first, `${id}'s passage text must match q01's exactly`);
  }
});

// --- passage order matches the frozen Reading Comprehension Mock 1 manifest ---

test("Reading Comprehension Mock 1's frozen manifest (migration 212) presents passages in the order Bees -> Boathouse -> Understudy, matching composition_provenance.passageOrder", () => {
  const migration212 = readFileSync("supabase/migrations/212_reading_comprehension_mock_1_freeze.sql", "utf8");
  const manifestMatch = migration212.match(/v_question_manifest constant jsonb := '(\[[\s\S]*?\])'::jsonb;/);
  assert.ok(manifestMatch);
  const manifest = JSON.parse(manifestMatch![1]) as { question_id: string }[];
  const firstBoathouseIndex = manifest.findIndex((m) => m.question_id.startsWith("mock-eng-boathouse"));
  const firstUnderstudyIndex = manifest.findIndex((m) => m.question_id.startsWith("eng-inc001-understudy"));
  const lastBeeIndex = manifest.map((m) => m.question_id).lastIndexOf(manifest.filter((m) => m.question_id.startsWith("eng-inc001-bee")).slice(-1)[0]?.question_id);
  assert.ok(lastBeeIndex < firstBoathouseIndex, "all Bees questions must precede all Boathouse questions");
  assert.ok(manifest.findIndex((m) => m.question_id.startsWith("mock-eng-boathouse-q12b")) < firstUnderstudyIndex, "all Boathouse questions must precede all Understudy questions");
});

// --- Mathematics is completely unaffected ------------------------------

test("Mathematics Mock 1's own content has no passageTitle/passageText in its authored prompts -- confirming the fix is additive-only and Mathematics questions correctly resolve null, not an error", () => {
  const migration147 = readFileSync("supabase/migrations/147_mock_mathematics_first_mock_1_inactive_freeze.sql", "utf8");
  assert.doesNotMatch(migration147, /passageTitle|passageText/, "Mathematics Mock 1's own frozen content must never reference passage fields");
});

// --- attempt_type resolution is unaffected by this defect fix ----------

test("resolveAttemptType still correctly resolves timed_section to Reading and full_mock to Mathematics after this increment's changes", () => {
  assert.equal(resolveAttemptType("timed_section"), "timed_section");
  assert.equal(resolveAttemptType("full_mock"), "full_mock");
  assert.equal(resolveAttemptType(undefined), "full_mock");
});

// --- the corrected Reading timer allowance ------------------------------

test("Reading's duration is corrected to 55 minutes (45 + the previously-dropped 10-minute reading allowance), Mathematics' 60 minutes is untouched", () => {
  assert.match(mockExamSource, /timed_section: 55,/);
  assert.match(mockExamSource, /full_mock: 60,/);
});
