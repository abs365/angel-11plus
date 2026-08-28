import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import { MOCK_ENGLISH_INC002_MARKER, MOCK_ENGLISH_INC002_PASSAGE_TARGET_IDS } from "../../lib/adminReview";

/**
 * English Content Foundation, Increment 002 (Decision 237) — review-
 * surface reachability proof, mirroring
 * adminReview.englishInc001ReviewWiring.test.ts's own established
 * page-wiring proof pattern exactly. Unlike Increment 001, no
 * migration-155-equivalent correction is needed here (migration 162 was
 * authored with the Decision 230/231 lesson already applied), so there
 * is no "old id" exclusion-filter form to test for.
 */

test("lib/adminReview.ts: Increment 002 passage target-id list is exactly the 2 new passage ids, using the CORRECTED id convention from the start", () => {
  assert.deepEqual(MOCK_ENGLISH_INC002_PASSAGE_TARGET_IDS, ["eng-inc002-roboticsfinal", "eng-inc002-sailandsteam"]);
  assert.equal(MOCK_ENGLISH_INC002_MARKER, "ENGLISH-CONTENT-FOUNDATION-INC002");
});

const pageSource = fs.readFileSync("app/admin-beta/review/page.tsx", "utf8");

test("page.tsx imports the Increment 002 fetch function and target-id list", () => {
  assert.match(pageSource, /fetchMockEnglishInc002PassageReviewStatus, MOCK_ENGLISH_INC002_PASSAGE_TARGET_IDS/);
});

test("page.tsx defines a dedicated EnglishInc002PassageSection component", () => {
  assert.match(pageSource, /function EnglishInc002PassageSection\(/);
});

test("page.tsx wires the Increment 002 selection state, fetches its own status map in load(), and stores it via its own setter", () => {
  assert.match(pageSource, /selectedEnglishInc002Passage, setSelectedEnglishInc002Passage/);
  assert.match(pageSource, /fetchMockEnglishInc002PassageReviewStatus\(\)/);
  assert.match(pageSource, /setEnglishInc002PassageStatus\(englishInc002Passage\)/);
});

test("page.tsx's Increment 002 modal branch passes reviewType=mock_english_passage_independent_review explicitly, the same defect-avoidance pattern Decision 230/231 established for Increment 001", () => {
  assert.match(pageSource, /if \(selectedEnglishInc002Passage\) \{/);
  const modalBlock = pageSource.match(/if \(selectedEnglishInc002Passage\) \{[\s\S]*?\n {2}\}/)![0];
  assert.match(modalBlock, /reviewType="mock_english_passage_independent_review"/);
  assert.match(modalBlock, /target=\{selectedEnglishInc002Passage\}/);
});

test("page.tsx actually renders the new section in the review list", () => {
  assert.match(pageSource, /<EnglishInc002PassageSection targets=\{targets\} status=\{englishInc002PassageStatus\} onOpen=\{setSelectedEnglishInc002Passage\}/);
});

test("page.tsx's FullBacklogSection excludes both Increment 002 passage targets by their single, correct id form", () => {
  const backlogFilter = pageSource.match(/function FullBacklogSection\([\s\S]*?const backlogTargets = targets\.filter\(\(t\) =>([\s\S]*?)\);/)![1];
  assert.match(backlogFilter, /MOCK_ENGLISH_INC002_PASSAGE_TARGET_IDS\.includes\(t\.id\)/);
});

test("does not change Increment 001's own review wiring -- both sections coexist, byte-unchanged reviewType values", () => {
  assert.match(pageSource, /<EnglishInc001PassageSection targets=\{targets\} status=\{englishInc001PassageStatus\}/);
  const inc001Block = pageSource.match(/if \(selectedEnglishInc001Passage\) \{[\s\S]*?\n {2}\}/)![0];
  assert.match(inc001Block, /reviewType="mock_english_passage_independent_review"/);
});
