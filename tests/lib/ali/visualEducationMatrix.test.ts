import { test } from "node:test";
import assert from "node:assert/strict";
import { MATHEMATICS_VISUAL_EDUCATION_MATRIX, getVisualEducationAssessment } from "@/lib/ali/visualEducationMatrix";

/** Programme Increment 020, Part 10 -- the deferred Increment 019 Visual Education Matrix, completed for all 6 Mathematics competencies. */

test("all 6 Mathematics competencies (MR-01..MR-06) are classified, none missing", () => {
  const ids = MATHEMATICS_VISUAL_EDUCATION_MATRIX.map((a) => a.competencyId).sort();
  assert.deepEqual(ids, ["MR-01", "MR-02", "MR-03", "MR-04", "MR-05", "MR-06"]);
});

test("every assessment carries a real, non-empty disclosed reason -- never a bare label", () => {
  for (const a of MATHEMATICS_VISUAL_EDUCATION_MATRIX) {
    assert.ok(a.reason.length > 20, `${a.competencyId} must carry a real disclosed reason, not a placeholder`);
  }
});

test("MR-03 (Geometric and Spatial Reasoning) is the one competency classified VISUAL_REQUIRED -- matches this increment's own Wave 1 selection evidence", () => {
  const mr03 = getVisualEducationAssessment("MR-03");
  assert.ok(mr03);
  assert.equal(mr03!.primaryClassification, "visual_required");
});

test("no competency is fabricated into SHORT_VIDEO_MAY_HELP or INTERACTIVE_USEFUL as a primary classification -- Wave 1 built no video/interactive content", () => {
  for (const a of MATHEMATICS_VISUAL_EDUCATION_MATRIX) {
    assert.notEqual(a.primaryClassification, "short_video_may_help");
    assert.notEqual(a.primaryClassification, "interactive_useful");
  }
});
