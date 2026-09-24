import { test } from "node:test";
import assert from "node:assert/strict";
import { readFileSync, readdirSync, statSync } from "node:fs";
import { join } from "node:path";
import { isAmbiguousFullMockRequest, subjectMismatch } from "@/lib/mockAttempt/workspace";
import { assessMockReadiness, MOCK_CENTRE_HREF } from "@/lib/learningEngine/mockReadiness";
import type { ActiveMockForm } from "@/lib/mockAttempt/types";

/**
 * Mock subject-routing P0 correction. Live Supabase evidence (read-only
 * MCP, 2026-09-24): attempt 9ae70cee was created from english-full-mock-v1
 * by a pre-start page titled "Mathematics Mock 1" that ran with no
 * subject -- mock_get_active_form('full_mock', NULL) resolves the NEWEST
 * full_mock (English). Mathematics form data was never corrupt.
 *
 * Contract enforced here:
 *   1. Every navigation target to /learning-intelligence/mock-exam names
 *      its paper (?subject=mathematics|english, or ?type=timed_section).
 *      Zero bare / subject-less full_mock links.
 *   2. The pre-start page fails closed on a missing/invalid subject for
 *      full_mock, before resolving any form or creating any attempt.
 *   3. Every client full_mock resolution names its subject.
 *   4. Migration 265 makes the server fail closed too, and returns the
 *      resolved subject so subjectMismatch() is a real guard.
 */

const SOURCE_ROOTS = ["app", "components", "lib"];

/** Line-ending agnostic (a Windows checkout with core.autocrlf yields CRLF). */
function read(file: string): string {
  return readFileSync(file, "utf8").replace(/\r\n/g, "\n");
}

function sourceFiles(dir: string): string[] {
  const out: string[] = [];
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) out.push(...sourceFiles(full));
    else if (/\.(ts|tsx)$/.test(entry)) out.push(full);
  }
  return out;
}

/** Non-comment source lines only, so docstrings that merely mention the route never count as links. */
function codeLines(file: string): { line: string; lineNo: number }[] {
  return read(file)
    .split("\n")
    .map((line, i) => ({ line, lineNo: i + 1 }))
    .filter(({ line }) => !/^\s*(\*|\/\/|\/\*)/.test(line));
}

const MOCK_EXAM_TARGET = /\/learning-intelligence\/mock-exam(?![\w-])([^"'`\s)]*)/g;

test("contract 1: every navigation target to /learning-intelligence/mock-exam names its paper -- zero bare or subject-less entry points remain anywhere in app/, components/ or lib/", () => {
  const violations: string[] = [];
  let checked = 0;
  for (const root of SOURCE_ROOTS) {
    for (const file of sourceFiles(root)) {
      for (const { line, lineNo } of codeLines(file)) {
        for (const match of line.matchAll(MOCK_EXAM_TARGET)) {
          const rest = match[1];
          if (rest.startsWith("/")) continue; // sub-routes (/sitting, /sitting/results) are not the pre-start page
          checked++;
          const named = /[?&]subject=(mathematics|english|\$\{)/.test(rest) || /[?&]type=timed_section/.test(rest);
          if (!named) violations.push(`${file}:${lineNo} -> /learning-intelligence/mock-exam${rest}`);
        }
      }
    }
  }
  assert.ok(checked >= 3, `expected to find the known named entry points (Mathematics card, Reading card, sitting hub); found ${checked}`);
  assert.deepEqual(violations, [], `ambiguous mock-exam entry points:\n${violations.join("\n")}`);
});

test("contract 1: the three previously-bare entry points now route to the Mock Centre, where the family chooses the paper", () => {
  assert.equal(MOCK_CENTRE_HREF, "/mocks");
  const noEvidence = assessMockReadiness({ hasAnyEvidence: true, mockAttemptCount: 0, topTriggerReason: null });
  const broad = assessMockReadiness({ hasAnyEvidence: true, mockAttemptCount: 3, topTriggerReason: null });
  assert.equal(noEvidence.nextAction.href, MOCK_CENTRE_HREF);
  assert.equal(broad.nextAction.href, MOCK_CENTRE_HREF);
  assert.match(read("app/learning-intelligence/page.tsx"), /<Link href="\/mocks" className="[^"]*">\s*CSSE mock exam/);
  assert.match(read("app/learning-intelligence/parent/journey/page.tsx"), /name: "Mock Examination",[\s\S]*?href: "\/mocks",/);
});

test("contract 1: the Mathematics card still names mathematics and the Reading card still names timed_section", () => {
  const centre = read("app/mocks/page.tsx");
  assert.match(centre, /href: "\/learning-intelligence\/mock-exam\?subject=mathematics",/);
  assert.match(centre, /href: "\/learning-intelligence\/mock-exam\?type=timed_section",/);
});

// --- contract 2: page-boundary fail-closed ---------------------------------

test("contract 2: a full_mock request with no recognised subject is ambiguous; a named subject or a single-form attempt type is not", () => {
  assert.equal(isAmbiguousFullMockRequest("full_mock", undefined), true);
  assert.equal(isAmbiguousFullMockRequest("full_mock", "mathematics"), false);
  assert.equal(isAmbiguousFullMockRequest("full_mock", "english"), false);
  assert.equal(isAmbiguousFullMockRequest("timed_section", undefined), false);
  assert.equal(isAmbiguousFullMockRequest("diagnostic_mock", undefined), false);
});

const MOCK_EXAM = read("app/learning-intelligence/mock-exam/page.tsx");

test("contract 2: an invalid ?subject= value is never passed through -- it collapses to undefined and therefore fails closed for full_mock", () => {
  assert.match(
    MOCK_EXAM,
    /const subject: "mathematics" \| "english" \| undefined = rawSubject === "mathematics" \|\| rawSubject === "english" \? rawSubject : undefined;/
  );
});

test("contract 2: the mount check refuses an ambiguous full_mock BEFORE any Supabase client, form resolution or previous-attempt lookup", () => {
  const mount = MOCK_EXAM.slice(MOCK_EXAM.indexOf("useEffect(() => {\n    (async () => {"));
  const gate = mount.indexOf('if (isAmbiguousFullMockRequest(attemptType, subject)) { setPhase("choose-mock"); return; }');
  assert.ok(gate > 0, "mount effect must gate on isAmbiguousFullMockRequest");
  assert.ok(gate < mount.indexOf("getSupabaseClient()"), "gate must precede the Supabase client");
  assert.ok(gate < mount.indexOf("getActiveMockForm("), "gate must precede form resolution");
});

test("contract 2: handleBegin refuses an ambiguous full_mock BEFORE resolving a form, looking up a resumable attempt, or creating/starting anything", () => {
  const begin = MOCK_EXAM.slice(MOCK_EXAM.indexOf("async function handleBegin() {"));
  const gate = begin.indexOf('if (isAmbiguousFullMockRequest(attemptType, subject)) { setPhase("choose-mock"); return; }');
  assert.ok(gate > 0, "handleBegin must gate on isAmbiguousFullMockRequest");
  for (const call of ["getActiveMockForm(", "getResumableMockAttempt(", "createMockCycleAttempt(", "createMockAttempt(", "startMockAttempt("]) {
    const at = begin.indexOf(call);
    assert.ok(at > gate, `${call} must come after the ambiguity gate`);
  }
});

test("contract 2: the recovery screen is calm, learner-safe copy with a way back to the Mock Centre -- no internal code or RPC text", () => {
  const screen = MOCK_EXAM.slice(MOCK_EXAM.indexOf('{phase === "choose-mock" && ('), MOCK_EXAM.indexOf('{phase === "unavailable" && ('));
  assert.match(screen, /Choose your Mock from the Mock Centre/);
  assert.match(screen, /nothing has been started/);
  assert.match(screen, /<Link href="\/mocks"/);
  assert.doesNotMatch(screen, /errorMessage|angel_|rpc|mock_get/i);
});

// --- contract 3: every client full_mock resolution names its subject -------

test("contract 3: no client code resolves a full_mock without naming its subject", () => {
  const violations: string[] = [];
  for (const root of SOURCE_ROOTS) {
    for (const file of sourceFiles(root)) {
      for (const { line, lineNo } of codeLines(file)) {
        if (/getActiveMockForm\(supabase, "full_mock"\)/.test(line)) violations.push(`${file}:${lineNo}`);
      }
    }
  }
  assert.deepEqual(violations, []);
  assert.match(read("components/parent/CssePathwayParentContent.tsx"), /getActiveMockForm\(supabase, "full_mock", "mathematics"\)/);
});

// --- Phase 5: the subject guard, with the real returned subject -------------

function form(subject: "mathematics" | "english", formId: string): { data: ActiveMockForm } {
  return { data: { formId, attemptType: "full_mock", subject, displayName: null } };
}

test("subject guard: requested mathematics + returned mathematics is allowed; requested mathematics + returned english is blocked", () => {
  assert.equal(subjectMismatch(form("mathematics", "first-mock-mathematics-v1"), "mathematics"), false);
  assert.equal(subjectMismatch(form("english", "english-full-mock-v1"), "mathematics"), true);
});

test("subject guard: requested english + returned english is allowed; missing requested subject for full_mock is blocked before any resolution (contract 2)", () => {
  assert.equal(subjectMismatch(form("english", "english-full-mock-v1"), "english"), false);
  assert.equal(isAmbiguousFullMockRequest("full_mock", undefined), true);
});

// --- contract 4: migration 265 ---------------------------------------------

const M265 = read("supabase/migrations/265_mock_get_active_form_full_mock_subject_required.sql");
const M265_SQL = M265.split("\n").filter((l) => !/^\s*--/.test(l)).join("\n");

test("migration 265: full_mock without a subject returns no row -- the server can never guess a subject", () => {
  assert.match(M265_SQL, /if p_attempt_type = 'full_mock' and p_subject is null then\s+return;\s+end if;/);
  assert.ok(M265_SQL.indexOf("return;") < M265_SQL.indexOf("return query"), "the fail-closed return must precede the resolution query");
});

test("migration 265: returns the resolved subject (superseding unapplied 264) and keeps the existing selection logic for named subjects and timed_section", () => {
  assert.match(M265_SQL, /returns table \(form_id text, attempt_type text, subject text, display_name text\)/);
  assert.match(M265_SQL, /select f\.id, f\.attempt_type, f\.subject, f\.composition_provenance ->> 'displayName'/);
  assert.match(M265_SQL, /and \(p_subject is null or f\.subject = p_subject\)/);
  assert.match(M265_SQL, /order by f\.created_at desc\s+limit 1;/);
});

test("migration 265: preserves the live ACL exactly, is transactional, and touches nothing but this one function", () => {
  assert.match(M265_SQL, /revoke all on function public\.mock_get_active_form\(text, text\) from public;/);
  assert.match(M265_SQL, /grant execute on function public\.mock_get_active_form\(text, text\) to anon, authenticated, service_role;/);
  assert.match(M265_SQL, /^begin;/m);
  assert.match(M265_SQL, /^commit;/m);
  assert.doesNotMatch(M265_SQL, /\b(insert|update|delete)\b\s/i);
  assert.doesNotMatch(M265_SQL, /ali_mock_attempt|ali_mock_cycle|policy|current_learner_id/i);
});

// --- production root cause: pre-rendered routes receive searchParams = {} ---
// Live evidence (Founder retest, 2026-09-24): Vercel serves
// /learning-intelligence/mock-exam pre-rendered (X-Nextjs-Prerender: 1)
// with `searchParams: {}` baked in, so a `use(searchParams)` prop read never
// saw ?subject=/?type= and BOTH named Mock Centre cards reached the
// fail-closed screen. Routes with a dynamic segment (practice/[area]) are
// rendered per request and were unaffected.

/** Source with comment lines removed, so explanatory docstrings never count as code. */
function codeOnly(file: string): string {
  return codeLines(file).map(({ line }) => line).join("\n");
}

function isStaticRoute(file: string): boolean {
  return !/\[[^\]]+\]/.test(file.replace(/\\/g, "/"));
}

test("root cause: no statically pre-renderable client page reads the query via the searchParams prop -- it must use useSearchParams()", () => {
  const violations: string[] = [];
  let checked = 0;
  for (const file of sourceFiles("app")) {
    if (!/[\\/]page\.tsx$/.test(file) || !isStaticRoute(file)) continue;
    checked++;
    const src = codeOnly(file);
    if (!/^"use client";/m.test(src)) continue;
    if (/use\(searchParams\)/.test(src)) violations.push(file);
  }
  assert.ok(checked > 20, `expected to scan the app's static page files; scanned ${checked}`);
  assert.deepEqual(violations, [], `pre-rendered client pages reading the (always empty) searchParams prop:\n${violations.join("\n")}`);
});

test("root cause: the pre-start page reads type/subject from the real browser URL inside a Suspense boundary, keyed on the paper", () => {
  assert.match(MOCK_EXAM, /import \{ useSearchParams \} from "next\/navigation";/);
  assert.match(MOCK_EXAM, /export default function MockExamPage\(\) \{\s*return \(\s*<Suspense fallback=\{/);
  assert.match(MOCK_EXAM, /<MockExamPageInner key=\{`\$\{type \?\? ""\}\|\$\{rawSubject \?\? ""\}`\} type=\{type\} rawSubject=\{rawSubject\} \/>/);
  assert.doesNotMatch(MOCK_EXAM, /searchParams: Promise</);
});

test("root cause: the sitting results page reads ?cycleId= from the real browser URL too", () => {
  const results = read("app/learning-intelligence/mock-exam/sitting/results/page.tsx");
  assert.match(results, /const cycleId = useSearchParams\(\)\.get\("cycleId"\) \?\? undefined;/);
  assert.doesNotMatch(codeOnly("app/learning-intelligence/mock-exam/sitting/results/page.tsx"), /use\(searchParams\)/);
});

// --- sitting hub: angel_learner_pin_required is recoverable, never bypassed ---

test("sitting hub: a PIN-required refusal offers the same governed recovery as the pre-start page (verify PIN via LearnerPinModal, then reload) and never skips verification", () => {
  const hub = read("app/learning-intelligence/mock-exam/sitting/page.tsx");
  assert.match(hub, /isPinRecoverableMockStartError\(errorMessage\) && activeLearner && \(/);
  assert.match(hub, /<LearnerPinModal\s+mode="verify"/);
  const onSuccess = hub.slice(hub.indexOf("onSuccess={(token) => {"));
  assert.ok(onSuccess.indexOf("enterLearnerMode(user.id, token)") < onSuccess.indexOf("setReloadKey"), "only a token minted by a successful verify is stored before reloading");
  assert.match(hub, /\}, \[reloadKey\]\);/);
  assert.doesNotMatch(hub, /x-angel-learner-token|learnerToken\s*=/, "the hub never handles tokens itself");
});
