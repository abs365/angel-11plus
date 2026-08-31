import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";

/**
 * Decision 256 §5 — Review surface must make clear that the full stored
 * checklist shown to the reviewer is stored instructional content, and
 * that assessment-mode learner presentation may intentionally suppress
 * or reduce it. The reviewer must not be left believing the full
 * checklist is guaranteed to appear in Mock.
 */

const pageSource = fs.readFileSync("app/admin-beta/review/page.tsx", "utf8");

function writingBlock(): string {
  return pageSource.match(/function QuestionOrWritingTaskBody\([\s\S]*?\n}/)![0];
}

test("page.tsx: the review surface explicitly warns that coaching items are reduced/suppressed outside Teaching context, not guaranteed in Mock", () => {
  const block = writingBlock();
  assert.match(block, /Independent Practice/);
  assert.match(block, /Mock\/formal assessment/);
  assert.match(block, /suppressed/);
});

test("page.tsx: imports and uses the Decision 256 support-level classifier, keyed by the question's own id (ali_question_bank.id)", () => {
  assert.match(pageSource, /import \{ checklistItemSupportLevel,? ?[\s\S]{0,60}\} from "@\/lib\/writing\/supportLevelPolicy";/);
  const block = writingBlock();
  assert.match(block, /checklistItemSupportLevel\(question\.id, i\)/);
});

test("page.tsx: each coaching-classified checklist item is visibly tagged so the reviewer can distinguish it from a core task instruction", () => {
  const block = writingBlock();
  assert.match(block, /"coaching"[\s\S]{0,200}<span[\s\S]{0,200}Coaching<\/span>/);
});

test("no automatic amendment verification, certification, or eligibility mutation is introduced by this section (Decision 256 hard constraints)", () => {
  // submitAmendmentVerification is pre-existing Decision 251 infrastructure,
  // gated behind an explicit Founder form submission (reviewType ===
  // "amendment_verification"), not called from any load/effect/auto path.
  assert.doesNotMatch(pageSource, /useEffect\([^)]*submitAmendmentVerification/);
  assert.match(pageSource, /reviewType === "amendment_verification" \? await submitAmendmentVerification/);
  assert.doesNotMatch(pageSource, /eligibility_status\s*[:=]\s*["'`]mock_eligible/);
});
