import { test } from "node:test";
import assert from "node:assert/strict";
import {
  BP_HCF_EQUAL_GROUPS, BP_LCM_REPEATING_EVENTS, BP_SMALLEST_COMMON_MULTIPLE_ABOVE, BP_IDENTIFY_THE_PRIME,
  BP_PATTERN_IN_CONTEXT, BP_FIRST_TERM_EXCEEDING, BP_WHOLE_PERIODS_TO_TARGET,
  BP_CONTAINERS_NEEDED, BP_CHANGE_FROM_NOTE, BP_SPEND_THEN_SHARE, CSSE_CONTEXT_EXPANSION_FAMILIES,
} from "@/lib/ali/questionFactory/csseContextBlueprints";
import { generateBlueprintCandidate, runFamilyBatch } from "@/lib/ali/questionFactory/candidateGeneration";
import { classifyBlueprintDepth, checkPerBlueprintDifficultyReachability } from "@/lib/ali/questionFactory/diversityGates";
import type { StructuralBlueprint } from "@/lib/ali/questionFactory/types";

function seeded(seed: number) {
  let s = seed;
  return () => { s = (s * 1103515245 + 12345) & 0x7fffffff; return s / 0x7fffffff; };
}
const N = 250;
function candidates<T extends Record<string, number>>(bp: StructuralBlueprint<T>, seed = 7) {
  const rnd = seeded(seed);
  return Array.from({ length: N }, () => generateBlueprintCandidate(bp, rnd));
}

// ---- Independent oracles: deliberately different algorithms from the blueprint implementations -----------
const oracleHcf = (a: number, b: number) => { for (let g = Math.min(a, b); g >= 1; g--) if (a % g === 0 && b % g === 0) return g; return 1; };
const oracleLcm = (a: number, b: number) => { for (let m = Math.max(a, b); ; m += Math.max(a, b)) if (m % a === 0 && m % b === 0) return m; };
const oracleIsPrime = (n: number) => { let d = 0; for (let i = 1; i <= n; i++) if (n % i === 0) d++; return d === 2; };

test("HCF in equal-groups context: answer is the greatest group count that shares everything exactly (brute force)", () => {
  for (const c of candidates(BP_HCF_EQUAL_GROUPS)) {
    const { a, b } = c.params;
    const best = [...Array(Math.min(a, b)).keys()].map((i) => i + 1).filter((g) => a % g === 0 && b % g === 0).pop();
    assert.equal(c.claimedAnswer, String(best), c.question);
    assert.equal(Number(c.claimedAnswer), oracleHcf(a, b));
    assert.ok(c.question.includes(String(a)) && c.question.includes(String(b)));
  }
});

test("LCM in repeating-events context: first time both are multiples (simulated minute by minute)", () => {
  for (const c of candidates(BP_LCM_REPEATING_EVENTS)) {
    const { a, b } = c.params;
    let t = 1; while (!(t % a === 0 && t % b === 0)) t++;
    assert.equal(c.claimedAnswer, String(t), c.question);
    assert.equal(t, oracleLcm(a, b));
  }
});

test("smallest common multiple above a boundary (scan upward)", () => {
  for (const c of candidates(BP_SMALLEST_COMMON_MULTIPLE_ABOVE)) {
    const { a, b, k } = c.params;
    let n = k + 1; while (!(n % a === 0 && n % b === 0)) n++;
    assert.equal(c.claimedAnswer, String(n), c.question);
    assert.ok(n > k);
    assert.notEqual(n, oracleLcm(a, b), "the boundary must actually change the answer");
  }
});

test("identify the prime: exactly one of the four listed numbers is prime and it is the answer, whichever position it sits in", () => {
  const positions = new Set<number>();
  for (const c of candidates(BP_IDENTIFY_THE_PRIME)) {
    const nums = (c.question.match(/: ([\d, ]+)\./)![1]).split(",").map((x) => Number(x.trim()));
    assert.equal(nums.length, 4);
    const primes = nums.filter(oracleIsPrime);
    assert.deepEqual(primes.map(String), [c.claimedAnswer], c.question);
    positions.add(nums.indexOf(Number(c.claimedAnswer)));
    // every composite shown has a worked factorisation that really multiplies back
    for (const step of c.workingSteps.slice(0, 3)) {
      const m = step.match(/^(\d+) = (\d+) × (\d+)/)!;
      assert.equal(Number(m[2]) * Number(m[3]), Number(m[1]));
    }
  }
  assert.equal(positions.size, 4, "the prime appears in every position across the batch");
});

test("pattern in context: simulate the pattern one step at a time", () => {
  for (const c of candidates(BP_PATTERN_IN_CONTEXT)) {
    const { a, d, n } = c.params;
    let v = a; for (let i = 1; i < n; i++) v += d;
    assert.equal(c.claimedAnswer, String(v), c.question);
  }
});

test("first term exceeding a target (simulate)", () => {
  for (const c of candidates(BP_FIRST_TERM_EXCEEDING)) {
    const { a, d, t } = c.params;
    let v = a; while (v <= t) v += d;
    assert.equal(c.claimedAnswer, String(v), c.question);
    assert.ok(v > t && v - d <= t);
  }
});

test("whole periods to target: simulate, and the target is genuinely not reached one period earlier", () => {
  for (const c of candidates(BP_WHOLE_PERIODS_TO_TARGET)) {
    const { s, w, t } = c.params;
    let n = 0, v = s; while (v < t) { v += w; n++; }
    assert.equal(c.claimedAnswer, String(n), c.question);
    assert.ok(s + (n - 1) * w < t);
  }
});

test("containers needed: smallest k with k × per >= total", () => {
  for (const c of candidates(BP_CONTAINERS_NEEDED)) {
    const { total, per } = c.params;
    let k = 0; while (k * per < total) k++;
    assert.equal(c.claimedAnswer, String(k), c.question);
  }
});

test("change from a note: total then subtract", () => {
  for (const c of candidates(BP_CHANGE_FROM_NOTE)) {
    const { q, price, note } = c.params;
    assert.equal(Number(c.claimedAnswer), note - q * price);
    assert.ok(Number(c.claimedAnswer) > 0);
  }
});

test("spend then share: subtract first, then divide (simulate sharing one pound at a time)", () => {
  for (const c of candidates(BP_SPEND_THEN_SHARE)) {
    const { total, spend, k } = c.params;
    let left = total - spend, each = 0;
    while (left >= k) { left -= k; each++; }
    assert.equal(left, 0, "shares exactly");
    assert.equal(c.claimedAnswer, String(each), c.question);
  }
});

test("each blueprint declares real structural variation: context rotates inside context blueprints, and routes are not all 'direct computation'", () => {
  for (const bp of [BP_HCF_EQUAL_GROUPS, BP_LCM_REPEATING_EVENTS, BP_PATTERN_IN_CONTEXT, BP_WHOLE_PERIODS_TO_TARGET, BP_CONTAINERS_NEEDED, BP_CHANGE_FROM_NOTE, BP_SPEND_THEN_SHARE] as StructuralBlueprint<Record<string, number>>[]) {
    const tags = new Set(candidates(bp).map((c) => c.contextTag));
    assert.ok(tags.size >= 3, `${bp.blueprintId} should present all three situations`);
  }
  for (const f of CSSE_CONTEXT_EXPANSION_FAMILIES) for (const bp of f.blueprints) {
    assert.notEqual(bp.reasoningRoute({} as never), "direct_computation", bp.blueprintId);
    assert.ok(bp.misconceptionTargeted && bp.misconceptionTargeted.length > 10, `${bp.blueprintId} names the misconception it targets`);
  }
});

test("every expansion passes the existing family batch validation with a healthy approval rate and uses every blueprint", () => {
  for (const f of CSSE_CONTEXT_EXPANSION_FAMILIES) {
    const { metrics } = runFamilyBatch(f, [], 120, seeded(11));
    assert.ok(metrics.approved / metrics.rawGenerated > 0.8, `${f.familyId}: approved ${metrics.approved}/${metrics.rawGenerated}`);
    assert.equal(metrics.distinctBlueprintsUsed, f.blueprints.length);
  }
});

test("difficulty is reachable inside each blueprint (not a single-tier blueprint) where the dimension allows", () => {
  const multi = [BP_HCF_EQUAL_GROUPS, BP_LCM_REPEATING_EVENTS, BP_PATTERN_IN_CONTEXT, BP_WHOLE_PERIODS_TO_TARGET, BP_CONTAINERS_NEEDED, BP_CHANGE_FROM_NOTE, BP_SPEND_THEN_SHARE, BP_IDENTIFY_THE_PRIME] as StructuralBlueprint<Record<string, number>>[];
  for (const bp of multi) {
    const [r] = checkPerBlueprintDifficultyReachability(candidates(bp), 2);
    assert.ok(r.meetsMinimum, `${bp.blueprintId} tiers: ${JSON.stringify(r.tierCounts)}`);
  }
});

test("blueprint depth: each expansion contributes as many distinct structures as blueprints, none dominating", () => {
  for (const f of CSSE_CONTEXT_EXPANSION_FAMILIES) {
    const { results } = runFamilyBatch(f, [], 120, seeded(5));
    const approved = results.filter((r) => r.approved).map((r) => r.candidate);
    const d = classifyBlueprintDepth(approved);
    assert.equal(d.blueprintDepth, f.blueprints.length, f.familyId);
    assert.ok(d.dominantBlueprintShare <= 0.5,
       `${f.familyId} dominant share ${d.dominantBlueprintShare}`);
  }
});
