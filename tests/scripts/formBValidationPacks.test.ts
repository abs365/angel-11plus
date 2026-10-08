import { test } from "node:test";
import assert from "node:assert/strict";
import fs from "node:fs";
import vm from "node:vm";
import { spawnSync } from "node:child_process";

const dir = "scripts/output/form-b-validation-packs";
const eng = fs.readFileSync(`${dir}/english-form-b-validation-pack.html`, "utf8");
const mat = fs.readFileSync(`${dir}/maths-form-b-validation-pack.html`, "utf8");
const matText = mat.replace(/&quot;/g, '"');
const engText = eng.replace(/&quot;/g, '"');
const scriptOf = (h: string) => h.match(/<script>([\s\S]*)<\/script>/)![1];
const cards = (h: string) => [...h.matchAll(/<div class="card" id="item-([^"]+)"/g)].map((m) => m[1]);

test("English pack: 24 reading questions plus two Writing tasks, each with the three decisions, no source code needed", () => {
  const ids = cards(eng);
  assert.equal(ids.length, 26);
  assert.equal(new Set(ids).size, 26);
  assert.equal(ids.filter((i) => i.startsWith("eng-")).length, 24);
  assert.equal(ids.filter((i) => i.startsWith("eng-fb-greatstink-")).length, 11);
  assert.equal(ids.filter((i) => i.startsWith("eng-inc003-compassrosechallenge-")).length + ids.filter((i) => i.startsWith("eng-fb-compassrosechallenge-")).length, 13);
  for (const id of ids) for (const d of ["APPROVE", "REVISE", "REJECT"]) assert.ok(eng.includes(`name="d-${id}" value="${d}"`), `${id} ${d}`);
  assert.doesNotMatch(eng, /undefined|\[object Object\]|NaN/);
  assert.doesNotMatch(eng, /gradient/i);
});

test("English pack carries the replacement passage, not Salmon: no Salmon item or passage text can be reviewed or reused", () => {
  assert.match(eng, /The Great Stink/);
  assert.match(eng, /new original replacement/);
  assert.doesNotMatch(eng, /eng-inc003-salmonnavigation|eng-fb-salmonnavigation/);
  assert.doesNotMatch(eng, /Hasler|Wisby|imprint/);
  assert.match(eng, /earlier informational passage about salmon was rejected and replaced/);
  assert.doesNotMatch(eng, /recommended for REPLACEMENT/);
  for (const claim of ["Joseph Bazalgette", "John Snow", "1858"]) assert.ok(eng.includes(claim), claim);
  assert.match(eng, /Factual claims requiring verification/);
  assert.match(eng, /Legitimate alternative answers \(author notes\)/);
});

test("English pack: Compass Rose accepted-answer semantics are left to the validator, unchanged; Writing Q1 criteria are the Founder's six", () => {
  assert.match(eng, /Educational judgements left to you \(Angel has deliberately not changed these\)/);
  assert.match(engText, /does "the sundial" deserve the mark/);
  assert.match(engText, /hedged answer/);
  assert.match(eng, /order the passage describes what each of them did on their own/);
  assert.match(eng, /Do you think there should be limits on how much time children spend using phones, tablets, or screens\? Write about your own opinion, using your own experience or things you have noticed to support what you think\./);
  assert.match(eng, /approved for human validation, NOT for activation/);
  for (const c of ["different home experiences", "rehearsed or template responses", "genuine opinion with real justification", "age appropriate", "organisation, vocabulary and sentence control", "unrestricted personal device use"]) assert.ok(eng.includes(c), c);
  assert.match(eng, /STORYBOARD, not final art/);
  assert.match(eng, /human visual and educational approval/);
  assert.match(eng, /NOT validation/);
  assert.match(eng, /ORDER is what is marked/);
});

test("Maths pack: all 56 items, 6/23/27, intended answers hidden behind a reveal, own-answer box, marking contract per item", () => {
  const ids = cards(mat);
  assert.equal(ids.length, 56);
  assert.equal(new Set(ids).size, 56);
  assert.equal(ids.filter((i) => i.startsWith("mock-fb-")).length, 24);
  for (const id of ids) {
    for (const d of ["APPROVE", "REVISE", "REJECT"]) assert.ok(mat.includes(`name="d-${id}" value="${d}"`), `${id} ${d}`);
    assert.ok(mat.includes(`id="a-${id}"`));
  }
  assert.match(mat, /6 easy, 23 medium, 27 hard/);
  assert.equal((mat.match(/Intended answer, independent derivation and marking contract/g) ?? []).length, 56);
  assert.equal((mat.match(/\(agrees\)/g) ?? []).length, 56, "every script derivation agrees with the intended answer");
  assert.doesNotMatch(mat, /DIFFERS|undefined|\[object Object\]|NaN/);
  assert.match(mat, /Defect found and repaired in production/);
});

test("Maths pack states the marking contract: numbers by value; coordinates need brackets and right numbers, spacing irrelevant (migration 274 pending for Mock); other text exact", () => {
  assert.match(matText, /read as a number and compared/);
  assert.match(matText, /harmless spacing does not matter/);
  assert.match(matText, /migration 274 \(prepared, awaiting the Founder\)/);
  assert.match(matText, /"\(7,-4\)" and "\( 7 , -4 \)" are treated as the same answer/);
  assert.match(matText, /"\(9,5\)" and "\( 9 , 5 \)" are treated as the same answer/);
  assert.doesNotMatch(matText, /without the space would be marked wrong/);
  assert.match(matText, /times exactly as hh:mm/);
  assert.match(matText, /does not state the exact form/);
});

test("export and autosave scripts are valid JavaScript and exports include name, independence declaration, reasons and own answers", () => {
  for (const h of [eng, mat]) {
    const s = scriptOf(h);
    assert.doesNotThrow(() => new vm.Script(s));
    assert.match(s, /independence/);
    assert.match(s, /own_answer/);
    assert.match(s, /text\/csv/);
    assert.match(s, /localStorage/);
  }
});

test("both packs show tables and figures where items need them, inline, with no external resources", () => {
  assert.match(mat, /<svg[\s\S]*?<\/svg>/);
  assert.match(mat, /Items sold by the stall/);
  for (const h of [eng, mat]) assert.doesNotMatch(h, /src="http|href="http|<link /);
});

test("the generator is deterministic apart from its date line (re-running changes nothing else)", () => {
  const r = spawnSync(process.execPath, ["--import", "tsx", "scripts/generate-form-b-validation-packs.mjs"], { encoding: "utf8" });
  assert.equal(r.status, 0, r.stderr);
  const strip = (h: string) => h.replace(/Prepared \d{4}-\d{2}-\d{2}\./, "Prepared DATE.");
  assert.equal(strip(fs.readFileSync(`${dir}/maths-form-b-validation-pack.html`, "utf8")), strip(mat));
  assert.equal(strip(fs.readFileSync(`${dir}/english-form-b-validation-pack.html`, "utf8")), strip(eng));
});
