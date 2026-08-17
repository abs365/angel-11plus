import { test } from "node:test";
import assert from "node:assert/strict";
import { classifyEvidenceState, isEvidenceTooThinForAverage } from "@/lib/learningEngine/evidenceState";

test("0 attempts classifies as no_evidence", () => {
  assert.equal(classifyEvidenceState(0), "no_evidence");
});

test("1-2 attempts classifies as insufficient_evidence", () => {
  assert.equal(classifyEvidenceState(1), "insufficient_evidence");
  assert.equal(classifyEvidenceState(2), "insufficient_evidence");
});

test("3-5 attempts classifies as developing_evidence", () => {
  assert.equal(classifyEvidenceState(3), "developing_evidence");
  assert.equal(classifyEvidenceState(5), "developing_evidence");
});

test("6+ attempts classifies as established_evidence", () => {
  assert.equal(classifyEvidenceState(6), "established_evidence");
  assert.equal(classifyEvidenceState(50), "established_evidence");
});

test("no_evidence and insufficient_evidence are too thin for a stated average; developing/established are not", () => {
  assert.equal(isEvidenceTooThinForAverage("no_evidence"), true);
  assert.equal(isEvidenceTooThinForAverage("insufficient_evidence"), true);
  assert.equal(isEvidenceTooThinForAverage("developing_evidence"), false);
  assert.equal(isEvidenceTooThinForAverage("established_evidence"), false);
});
