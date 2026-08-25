import { PROTECTED_MOCK_FIELDS, type MockQuestionPayload } from "./types";

/**
 * Programme Increment 008D — the field-level secrecy boundary, proven
 * directly, not merely asserted. The real enforcement happens inside
 * mock_get_question() (migration 070) on the server; this function is
 * the client/test-side proof that a given payload (real or a fixture
 * standing in for one) genuinely contains none of the protected fields
 * — used both by tests and, defensively, by any UI code that renders a
 * payload, so a future server-side regression would still be caught
 * client-side before ever reaching the screen.
 */
export function findLeakedProtectedFields(payload: unknown): string[] {
  if (!payload || typeof payload !== "object") return [];
  const keys = Object.keys(payload as Record<string, unknown>);
  return keys.filter((k) => (PROTECTED_MOCK_FIELDS as readonly string[]).includes(k));
}

export function isPayloadRedactionSafe(payload: unknown): boolean {
  return findLeakedProtectedFields(payload).length === 0;
}

/** Pure structural check that a payload has exactly the shape mock_get_question() promises — no more, no less. */
export function isValidMockQuestionPayload(payload: unknown): payload is MockQuestionPayload {
  if (!payload || typeof payload !== "object") return false;
  const p = payload as Record<string, unknown>;
  return (
    typeof p.questionId === "string" &&
    typeof p.subject === "string" &&
    typeof p.skill === "string" &&
    "question" in p &&
    typeof p.marks === "number" &&
    typeof p.contentDifficulty === "string" &&
    (p.questionGroupId === null || typeof p.questionGroupId === "string") &&
    (p.groupOrder === null || typeof p.groupOrder === "number") &&
    (p.subpartLabel === null || typeof p.subpartLabel === "string") &&
    // Migration 115 — top-level shape only (absent/null, or an object to
    // be deep-validated by isValidTableStimulus() at the render site);
    // `undefined` is accepted too, so a payload fetched before this field
    // existed still passes rather than being rejected outright. This
    // check deliberately stays as loose on stimulus as it already is on
    // `question`.
    (p.stimulus === null || p.stimulus === undefined || typeof p.stimulus === "object")
  );
}
