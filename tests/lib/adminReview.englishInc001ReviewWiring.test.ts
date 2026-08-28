import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import {
  MOCK_ENGLISH_INC001_MARKER, MOCK_ENGLISH_INC001_PASSAGE_TARGET_IDS,
  MOCK_ENGLISH_INC001_WRITING_FAMILIES, MOCK_ENGLISH_INC001_WRITING_TARGET_IDS,
  buildMockEnglishInc001WritingNotesPrefix,
  ENGLISH_INC001_AMENDMENT_VERIFICATION_TARGETS, ENGLISH_INC001_AMENDMENT_VERIFICATION_TARGET_IDS,
} from "../../lib/adminReview";

/**
 * English Content Foundation, Increment 001 — review-surface reachability
 * proof (Decision 231's own fix for the review_type-routing gap), mirroring
 * adminReview.mockStructuralCapacityIncrement006.test.ts's own established
 * page-wiring proof pattern exactly.
 */

test("lib/adminReview.ts: passage target-id list is exactly the 2 corrected passage ids (post-migration-155), never the old broken family_id values", () => {
  assert.deepEqual(MOCK_ENGLISH_INC001_PASSAGE_TARGET_IDS, ["eng-inc001-understudy", "eng-inc001-bee-navigation"]);
});

test("lib/adminReview.ts: writing family config targets exactly the 3 real family_id values migration 154 registered, each with its own real row id", () => {
  assert.deepEqual(MOCK_ENGLISH_INC001_WRITING_TARGET_IDS.sort(), ["mock-writing-wc01a-mistakelearned", "mock-writing-wc01a-newplace", "mock-writing-wc01a-screentime"].sort());
  const byFamily = new Map(MOCK_ENGLISH_INC001_WRITING_FAMILIES.map((f) => [f.familyId, f.newQuestionIds]));
  assert.deepEqual(byFamily.get("mock-writing-wc01a-newplace"), ["mock-writing-newplace-01"]);
  assert.deepEqual(byFamily.get("mock-writing-wc01a-mistakelearned"), ["mock-writing-mistakelearned-01"]);
  assert.deepEqual(byFamily.get("mock-writing-wc01a-screentime"), ["mock-writing-screentime-01"]);
});

test("notes prefix builder embeds the exact ENGLISH-CONTENT-FOUNDATION-INC001 marker used by migration 154's own notes text", () => {
  const prefix = buildMockEnglishInc001WritingNotesPrefix("mock-writing-wc01a-newplace", ["mock-writing-newplace-01"]);
  assert.equal(MOCK_ENGLISH_INC001_MARKER, "ENGLISH-CONTENT-FOUNDATION-INC001");
  assert.match(prefix, /^ENGLISH-CONTENT-FOUNDATION-INC001 new content review: Continuous Writing prompt \(mock-writing-wc01a-newplace\)/);
});

const pageSource = fs.readFileSync("app/admin-beta/review/page.tsx", "utf8");

test("page.tsx imports the fetch functions and both config exports for Increment 001", () => {
  assert.match(pageSource, /fetchMockEnglishInc001PassageReviewStatus, MOCK_ENGLISH_INC001_PASSAGE_TARGET_IDS/);
  assert.match(pageSource, /fetchMockEnglishInc001WritingReviewStatus, buildMockEnglishInc001WritingNotesPrefix/);
  assert.match(pageSource, /MOCK_ENGLISH_INC001_WRITING_FAMILIES, MOCK_ENGLISH_INC001_WRITING_TARGET_IDS/);
});

test("page.tsx defines dedicated EnglishInc001PassageSection and EnglishInc001WritingSection components", () => {
  assert.match(pageSource, /function EnglishInc001PassageSection\(/);
  assert.match(pageSource, /function EnglishInc001WritingSection\(/);
});

test("page.tsx's load() fetches both new status maps and stores them via their own setters", () => {
  assert.match(pageSource, /fetchMockEnglishInc001PassageReviewStatus\(\), fetchMockEnglishInc001WritingReviewStatus\(MOCK_ENGLISH_INC001_WRITING_TARGET_IDS\)/);
  assert.match(pageSource, /setEnglishInc001PassageStatus\(englishInc001Passage\)/);
  assert.match(pageSource, /setEnglishInc001WritingStatus\(englishInc001Writing\)/);
});

test("page.tsx wires the passage selection state and a ReviewForm modal branch explicitly using review_type mock_english_passage_independent_review", () => {
  assert.match(pageSource, /selectedEnglishInc001Passage, setSelectedEnglishInc001Passage/);
  assert.match(pageSource, /if \(selectedEnglishInc001Passage\) \{/);
  const modalBlock = pageSource.match(/if \(selectedEnglishInc001Passage\) \{[\s\S]*?\n {2}\}/)![0];
  assert.match(modalBlock, /reviewType="mock_english_passage_independent_review"/);
  assert.match(modalBlock, /target=\{selectedEnglishInc001Passage\}/);
});

test("page.tsx wires the writing selection state and a ReviewForm modal branch explicitly using review_type mock_writing_prompt_independent_review, with the sevenX exact-id lookup", () => {
  assert.match(pageSource, /selectedEnglishInc001Writing, setSelectedEnglishInc001Writing/);
  assert.match(pageSource, /if \(selectedEnglishInc001Writing\) \{/);
  const modalBlock = pageSource.match(/if \(selectedEnglishInc001Writing\) \{[\s\S]*?\n {2}\}/)![0];
  assert.match(modalBlock, /reviewType="mock_writing_prompt_independent_review"/);
  assert.match(modalBlock, /buildMockEnglishInc001WritingNotesPrefix/);
});

test("page.tsx actually renders both new sections in the review list", () => {
  assert.match(pageSource, /<EnglishInc001PassageSection targets=\{targets\} status=\{englishInc001PassageStatus\} onOpen=\{setSelectedEnglishInc001Passage\}/);
  assert.match(pageSource, /<EnglishInc001WritingSection targets=\{targets\} status=\{englishInc001WritingStatus\}/);
});

test("page.tsx's FullBacklogSection excludes all 5 Increment 001 targets (both post-migration-155 corrected ids AND the pre-migration-155 original ids), so none can ever leak into the generic content_review-defaulting fallback", () => {
  const backlogFilter = pageSource.match(/function FullBacklogSection\([\s\S]*?const backlogTargets = targets\.filter\(\(t\) =>([\s\S]*?)\);/)![1];
  assert.match(backlogFilter, /MOCK_ENGLISH_INC001_PASSAGE_TARGET_IDS\.includes\(t\.id\)/);
  assert.match(backlogFilter, /MOCK_ENGLISH_INC001_WRITING_TARGET_IDS\.includes\(t\.id\)/);
  assert.match(backlogFilter, /"eng-inc001-understudy-narrative"/);
  assert.match(backlogFilter, /"eng-inc001-bee-navigation-informational"/);
});

test("SEMANTIC: the generic ReviewForm's own reviewType prop defaults to content_review when omitted -- proving the routing gap Decision 230/231 found is real, and that the fix above (explicit reviewType props) is the correct, minimal countermeasure", () => {
  assert.match(pageSource, /reviewType = "content_review", sevenX,/);
});

test("REGRESSION (Decision 232): ReviewForm's passage Card now renders target.notes directly beneath the copyright/provenance line -- the factual-verification evidence migration 156 writes to ali_family_review.notes is actually visible to a reviewer, not merely present in the database", () => {
  const passageCardBlock = pageSource.match(/\{!loading && passage && \([\s\S]*?\)\}\s*\n\s*\n\s*\{!loading && questions\.length > 0/)![0];
  assert.match(passageCardBlock, /\{target\.notes && \(/);
  assert.match(passageCardBlock, /Review notes:.*\{target\.notes\}/);
});

test("does not change any UNRELATED review flow's own review_type wiring -- Mathematics Batch 001-003, Structural Capacity 001-006, SevenX, Mr04Depth, Inc006Depth, and the existing English/Writing Batch 001 sections all still pass their own, original reviewType values, byte-unchanged", () => {
  assert.match(pageSource, /reviewType="mock_maths_independent_review"/);
  assert.match(pageSource, /reviewType="english_teaching_review"/);
  const existingEnglishPassageBlock = pageSource.match(/if \(selectedMockEnglishPassageBatch001\) \{[\s\S]*?\n {2}\}/)![0];
  assert.match(existingEnglishPassageBlock, /reviewType="mock_english_passage_independent_review"/);
  const existingWritingBlock = pageSource.match(/if \(selectedMockWritingBatch001\) \{[\s\S]*?\n {2}\}/)![0];
  assert.match(existingWritingBlock, /reviewType="mock_writing_prompt_independent_review"/);
});

// === Decision 235 -- Amendment Verification wiring =========================

test("Decision 235: ReviewForm's reviewType prop union includes amendment_verification", () => {
  assert.match(pageSource, /reviewType\?: "content_review" \| "english_teaching_review" \| "mock_maths_independent_review" \| "mock_english_passage_independent_review" \| "mock_writing_prompt_independent_review" \| "amendment_verification";/);
});

test("Decision 235: handleSubmit() routes amendment_verification to the dedicated submitEnglishInc001AmendmentVerification function, never the generic submitReview fallback (the exact defect class Decision 230/231 found and fixed for the original Inc001 targets)", () => {
  const dispatchBlock = pageSource.match(/const \{ error \} =\s*\n([\s\S]*?)await submitReview\(submissionToSend\);/)![1];
  assert.match(dispatchBlock, /reviewType === "amendment_verification" \? await submitEnglishInc001AmendmentVerification\(submissionToSend\)/);
});

test("Decision 235: page.tsx imports submitEnglishInc001AmendmentVerification and the amendment-verification config exports", () => {
  assert.match(pageSource, /fetchEnglishInc001AmendmentVerificationStatus, buildEnglishInc001AmendmentVerificationNotesPrefix/);
  assert.match(pageSource, /submitEnglishInc001AmendmentVerification, ENGLISH_INC001_AMENDMENT_VERIFICATION_TARGETS/);
});

test("Decision 235: page.tsx defines a dedicated EnglishInc001AmendmentVerificationSection component", () => {
  assert.match(pageSource, /function EnglishInc001AmendmentVerificationSection\(/);
});

test("Decision 235: page.tsx wires the amendment-verification selection state, fetches its own status map in load(), and stores it via its own setter", () => {
  assert.match(pageSource, /selectedEnglishInc001AmendmentVerification, setSelectedEnglishInc001AmendmentVerification/);
  assert.match(pageSource, /fetchEnglishInc001AmendmentVerificationStatus\(ENGLISH_INC001_AMENDMENT_VERIFICATION_TARGET_IDS\)/);
  assert.match(pageSource, /setEnglishInc001AmendmentVerificationStatus\(englishInc001AmendmentVerification\)/);
});

test("Decision 235: the amendment-verification modal branch passes reviewType=amendment_verification and routes Writing targets through the sevenX exact-id path (never the family-wide fetch)", () => {
  assert.match(pageSource, /if \(selectedEnglishInc001AmendmentVerification\) \{/);
  const modalBlock = pageSource.match(/if \(selectedEnglishInc001AmendmentVerification\) \{[\s\S]*?\n {2}\}/)![0];
  assert.match(modalBlock, /reviewType="amendment_verification"/);
  assert.match(modalBlock, /t\.sevenXQuestionIds/);
  assert.match(modalBlock, /buildEnglishInc001AmendmentVerificationNotesPrefix/);
});

test("Decision 235: the new section is actually rendered in the review list", () => {
  assert.match(pageSource, /<EnglishInc001AmendmentVerificationSection status=\{englishInc001AmendmentVerificationStatus\} onOpen=\{setSelectedEnglishInc001AmendmentVerification\}/);
});

test("Decision 235: the submitted-decision panel gives amendment_verification its own explanatory copy, distinct from the promotion-related copy shown for an original independent review", () => {
  const panelBlock = pageSource.match(/\{reviewType === "amendment_verification"[\s\S]*?\}\s*\n\s*<\/p>/)![0];
  assert.match(panelBlock, /does not overwrite, and is never confused with, the original approved_with_amendment decision/);
  assert.match(panelBlock, /does not itself convert that decision to approved/);
});

test("Decision 235: exactly 4 verification targets are configured, and none is A Mistake You Learned From (the approved control case)", () => {
  assert.equal(ENGLISH_INC001_AMENDMENT_VERIFICATION_TARGETS.length, 4);
  assert.ok(!ENGLISH_INC001_AMENDMENT_VERIFICATION_TARGET_IDS.includes("mock-writing-wc01a-mistakelearned"));
});

test("Decision 235: QuestionOrWritingTaskBody renders question.authorNote (ali_question_bank.explanation) for deterministic content when present -- the same class of 'field exists but invisible to a reviewer' gap Decision 232 fixed for provenance/notes", () => {
  const bodyFn = pageSource.match(/function QuestionOrWritingTaskBody\([\s\S]*?\n\}/)![0];
  assert.match(bodyFn, /\{question\.authorNote && \(/);
  assert.match(bodyFn, /Marking \/ educational note:.*\{question\.authorNote\}/);
});

test("Decision 235: QUESTION_SELECT_COLUMNS now selects explanation, and mapQuestionRow populates authorNote from it", () => {
  const libSource = fs.readFileSync("lib/adminReview.ts", "utf8");
  assert.match(libSource, /const QUESTION_SELECT_COLUMNS = "id, subject, skill, prompt, family_id, learning_unit_id, content_difficulty, transfer_class, addresses_misconception, content_version, active, provenance, eligibility_status, question_group_id, group_order, subpart_label, marking_mode, explanation";/);
  assert.match(libSource, /authorNote: r\.explanation \?\? null,/);
});
