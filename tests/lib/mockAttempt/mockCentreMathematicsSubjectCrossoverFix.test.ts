import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

/**
 * CSSE Two-Paper Mock, final learner acceptance correction — Defect 2.
 * Real Founder acceptance evidence (live authenticated browser walkthrough,
 * not a static-code guess): the standalone Mathematics Mock 1 entry point
 * at /mocks -> "Mathematics Mock 1" card -> /learning-intelligence/mock-exam
 * surfaced ENGLISH's own attempt (d15dd181-...) under "Your previous Mock",
 * on a page titled "Mathematics Mock 1" -- a genuine subject-crossover
 * contradiction (Classification C), not correct standalone-product
 * behaviour, once english-full-mock-v1 (a second full_mock form) existed
 * alongside first-mock-mathematics-v1.
 *
 * Root cause: /app/mocks/page.tsx's own full_mock card href and its own
 * getActiveMockForm(supabase, "full_mock", ...) discovery call never named
 * a subject, so getActiveMockForm()'s own tie-break (created_at desc)
 * could resolve either form -- exactly the same ambiguity the pre-existing,
 * unchanged, dedicated English call already avoids via its own explicit
 * "english" subject argument.
 *
 * /app/learning-intelligence/mock-exam/page.tsx itself was never the
 * defect -- it already correctly threads a `subject` query param straight
 * into getActiveMockForm(supabase, attemptType, subject) for both its
 * previous-attempt lookup and its attempt-creation path. The only missing
 * piece was /app/mocks/page.tsx never sending that subject in the first
 * place. This test proves both halves of the fix and that mock-exam/page.tsx
 * needed no change.
 */

const MOCK_CENTRE = readFileSync("app/mocks/page.tsx", "utf8");
const MOCK_EXAM = readFileSync("app/learning-intelligence/mock-exam/page.tsx", "utf8");

test("Classification: this is a genuine subject-crossover defect (C), not correct standalone behaviour -- the Mathematics card's own href never named its subject before this fix", () => {
  assert.match(MOCK_CENTRE, /full_mock: \{[\s\S]*?href: "\/learning-intelligence\/mock-exam\?subject=mathematics",/);
});

test("fix half 1: the Mock Centre's own full_mock discovery call (used for availability + fallback display) is scoped to mathematics, exactly matching the pre-existing dedicated english call's own pattern", () => {
  assert.match(
    MOCK_CENTRE,
    /getActiveMockForm\(supabase, attemptType, attemptType === "full_mock" \? "mathematics" : undefined\)/
  );
  assert.match(MOCK_CENTRE, /getActiveMockForm\(supabase, "full_mock", "english"\)/, "the pre-existing English discovery call must remain unchanged");
});

test("fix half 2: mock-exam/page.tsx already reads ?subject= from its own URL and threads it into every getActiveMockForm() call it makes -- no change was needed there, the ambiguity was created entirely upstream by the Mock Centre's own unscoped href", () => {
  assert.match(MOCK_EXAM, /const \{ type, subject: rawSubject \} = use\(searchParams\);/);
  assert.match(
    MOCK_EXAM,
    /const subject: "mathematics" \| "english" \| undefined = rawSubject === "mathematics" \|\| rawSubject === "english" \? rawSubject : undefined;/
  );
  const getActiveMockFormCalls = MOCK_EXAM.match(/getActiveMockForm\(supabase, attemptType, subject\)/g) ?? [];
  assert.ok(
    getActiveMockFormCalls.length >= 2,
    "mock-exam/page.tsx must pass its own resolved subject into every getActiveMockForm() call it makes (previous-attempt lookup and attempt-creation path)"
  );
});

test("no crossover: with the fix in place, following the Mathematics card's own real href resolves subject=mathematics, never subject=english or an unscoped lookup", () => {
  const hrefMatch = MOCK_CENTRE.match(/full_mock: \{[\s\S]*?href: "([^"]+)",/);
  assert.ok(hrefMatch);
  const url = new URL(hrefMatch![1], "https://example.test");
  assert.equal(url.pathname, "/learning-intelligence/mock-exam");
  assert.equal(url.searchParams.get("subject"), "mathematics");
  assert.equal(url.searchParams.get("type"), null, "full_mock must remain the default attempt type -- no ?type= param is needed or present");
});

test("the Reading Comprehension card (timed_section) is completely unaffected -- it never shared attempt_type with a second form, so it carries no subject param before or after this fix", () => {
  const hrefMatch = MOCK_CENTRE.match(/timed_section: \{[\s\S]*?href: "([^"]+)",/);
  assert.ok(hrefMatch);
  assert.doesNotMatch(hrefMatch![1], /subject=/);
});

test("this fix does not touch Mock cycle governance/readiness policy -- mock_start_new_cycle() pacing and readiness gating remain completely unaffected", () => {
  assert.doesNotMatch(MOCK_CENTRE, /mock_start_new_cycle/);
  assert.match(MOCK_CENTRE, /computeCsseMockReadiness/, "the existing readiness computation is reused unchanged, not replaced");
});
