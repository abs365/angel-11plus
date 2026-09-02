import { test } from "node:test";
import assert from "node:assert/strict";
import { primaryItemsFor, isActive } from "@/components/Navigation";

/**
 * Gate 4 (Learner Journey Completion) — the primary "Progress" nav item was
 * the one destination in this row NOT pathway-branched like Learn/Practise
 * already were, so a CSSE learner reached the legacy localStorage-backed
 * /progress page instead of their real Educational Intelligence evidence.
 * Confirmed live: a just-completed Reading Comprehension session never
 * appeared there. Fixed by branching Progress exactly like Learn/Practise,
 * to the existing CSSE-scoped /learning-intelligence page.
 */

test("primaryItemsFor: a CSSE learner is routed to the real Educational Intelligence destinations for Learn, Practise, and Progress", () => {
  const items = primaryItemsFor(true);
  const byLabel = Object.fromEntries(items.map((i) => [i.label, i]));
  assert.equal(byLabel["Learn"].href, "/learning-intelligence/learn");
  assert.equal(byLabel["Practise"].href, "/learning-intelligence/practice");
  assert.equal(byLabel["Progress"].href, "/learning-intelligence");
  assert.equal(byLabel["Progress"].exact, true, "Progress must only be active on an exact match, not as a prefix");
});

test("primaryItemsFor: a non-CSSE learner still reaches the unchanged legacy hubs", () => {
  const items = primaryItemsFor(false);
  const byLabel = Object.fromEntries(items.map((i) => [i.label, i]));
  assert.equal(byLabel["Learn"].href, "/learn");
  assert.equal(byLabel["Practise"].href, "/reasoning");
  assert.equal(byLabel["Progress"].href, "/progress");
  assert.equal(byLabel["Progress"].exact, false);
});

test("Gate 4 regression: CSSE Progress href (/learning-intelligence) does not appear active on a Learn or Practise subpage", () => {
  // Without the `exact` flag, /learning-intelligence is a path ancestor of
  // both /learning-intelligence/learn/* and /learning-intelligence/practice/*
  // (Progress, Learn, and Practise all live under that same root), so plain
  // prefix matching would highlight "Progress" as active alongside whichever
  // of those is genuinely current -- confirmed to be the failure mode this
  // fix closes, not a hypothetical.
  assert.equal(isActive("/learning-intelligence/learn/mathematics/arithmetic", "/learning-intelligence", true), false);
  assert.equal(isActive("/learning-intelligence/practice/mathematics", "/learning-intelligence", true), false);
  assert.equal(isActive("/learning-intelligence/parent", "/learning-intelligence", true), false);
  assert.equal(isActive("/learning-intelligence", "/learning-intelligence", true), true, "the Learning Report root itself must still be active");
});

test("isActive: prefix matching (exact=false, the default) is unchanged for every other nav item", () => {
  assert.equal(isActive("/dashboard", "/dashboard"), true);
  assert.equal(isActive("/mocks/adaptive/gl", "/mocks"), true);
  assert.equal(isActive("/mocks-history", "/mocks"), false, "a lookalike sibling path must not match as a prefix without its own trailing slash");
});
