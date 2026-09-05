import { test } from "node:test";
import assert from "node:assert/strict";
import { computeFlattenedPathways } from "@/lib/ali/pathwayAggregation";

/**
 * Question Factory Wave 2 — correctness oracle for migration 231's
 * intended pathway-aggregation algorithm (flatten, deduplicate, sort),
 * covering every case the Founder's own instruction named explicitly.
 */

test("a single source row with pathway [\"csse\"] produces family pathway [\"csse\"]", () => {
  assert.deepEqual(computeFlattenedPathways([["csse"]]), ["csse"]);
});

test("multiple source rows all [\"csse\"] (the exact mr01-decimal-computation regression case -- 7 real production rows, all [\"csse\"]) produce family pathway [\"csse\"], never the empty array migration 228 produced", () => {
  const mr01DecimalComputationRealRows = [["csse"], ["csse"], ["csse"], ["csse"], ["csse"], ["csse"], ["csse"]]; // mr01-decimal-01..05, mth-008, qa-005
  assert.deepEqual(computeFlattenedPathways(mr01DecimalComputationRealRows), ["csse"]);
});

test("mixed duplicate pathways across rows collapse to a unique flattened array", () => {
  assert.deepEqual(computeFlattenedPathways([["csse"], ["csse"], ["iseb"], ["csse"]]), ["csse", "iseb"]);
});

test("a multi-pathway source row is correctly flattened into the family's own unique array alongside single-pathway siblings", () => {
  assert.deepEqual(computeFlattenedPathways([["csse", "gl"], ["csse"], ["gl"]]), ["csse", "gl"]);
});

test("NULL/undefined source rows and empty-array source rows are safely treated as contributing nothing -- never a crash, never a fabricated pathway", () => {
  assert.deepEqual(computeFlattenedPathways([null, undefined, [], ["csse"]]), ["csse"]);
});

test("a family whose every member row has an empty pathway array produces a genuinely empty array, not a fabricated one", () => {
  assert.deepEqual(computeFlattenedPathways([[], [], []]), []);
});

test("no source rows at all produces an empty array", () => {
  assert.deepEqual(computeFlattenedPathways([]), []);
});

test("output is always sorted and deduplicated regardless of input order", () => {
  assert.deepEqual(computeFlattenedPathways([["gl"], ["csse"], ["gl"], ["iseb"], ["csse"]]), ["csse", "gl", "iseb"]);
});
