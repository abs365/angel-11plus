import { test } from "node:test";
import assert from "node:assert/strict";
import { isMockFormAvailable, type MockClientResult } from "../../../lib/mockAttempt/client";
import type { ActiveMockForm } from "../../../lib/mockAttempt/types";

/**
 * Completion Assurance Programme, Completion B — isMockFormAvailable()
 * is the ONE authoritative rule both the Mock Centre (app/mocks/page.tsx)
 * and the canonical mock-exam page (app/learning-intelligence/mock-exam/
 * page.tsx) derive learner-facing availability from, so the two pages
 * can never silently disagree. Pure function, no Supabase/browser
 * dependency — tested directly against representative getActiveMockForm()
 * result shapes, not a brittle UI snapshot.
 */

test("A/B — zero deliverable mock content (getActiveMockForm found no active form): not available", () => {
  const result: MockClientResult<ActiveMockForm | null> = { data: null, error: null };
  assert.equal(isMockFormAvailable(result), false);
});

test("C — real deliverable mock content (an active form exists): available, using the exact same predicate — no separate UI-only flag needed", () => {
  const result: MockClientResult<ActiveMockForm | null> = {
    data: { formId: "form-001", attemptType: "full_mock" },
    error: null,
  };
  assert.equal(isMockFormAvailable(result), true);
});

test("an RPC/network error is treated as NOT available, never mistaken for a real form", () => {
  const result: MockClientResult<ActiveMockForm | null> = { data: null, error: "network error" };
  assert.equal(isMockFormAvailable(result), false);
});

test("an error alongside unexpected non-null data is still treated as NOT available (error takes precedence)", () => {
  const result: MockClientResult<ActiveMockForm | null> = {
    data: { formId: "form-001", attemptType: "full_mock" },
    error: "unexpected",
  };
  assert.equal(isMockFormAvailable(result), false);
});
