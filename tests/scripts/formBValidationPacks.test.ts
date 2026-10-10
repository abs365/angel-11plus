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

test("Maths pack states the marking contract: numbers by value; coordinates need brackets and right numbers, spacing irrelevant; other text exact (the same rule in Practice and Mock)", () => {
  assert.match(matText, /read as a number and compared/);
  assert.match(matText, /harmless spacing does not matter/);
  assert.match(matText, /The same rule is used in Practice and in the Mock scorer/);
  assert.doesNotMatch(matText, /migration 274|awaiting the Founder|until then the Mock scorer|once migration/);
  assert.doesNotMatch(engText, /migration 27[0-9]|awaiting the Founder|not applied/i);
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

const textOf = (h: string) => h.replace(/<svg[\s\S]*?<\/svg>/g, " ").replace(/<br>/g, "\n").replace(/<[^>]+>/g, " ").replace(/&quot;/g, '"').replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">").replace(/\s+/g, " ");
const cardBodies = (h: string) => [...h.matchAll(/<div class="card" id="item-([^"]+)">([\s\S]*?)(?=<div class="card" id="item-|<div class="card sect"|<h2>)/g)].map((m) => ({ id: m[1], body: m[2] }));

test("independence: both packs open completely blank and carry no reviewer decision, name or comment from the authors", () => {
  for (const h of [eng, mat]) {
    assert.equal((h.match(/<input[^>]* checked/g) ?? []).length, 0, "no radio or checkbox is pre-selected");
    assert.equal((h.match(/<input type="text"[^>]*value=/g) ?? []).length, 0);
    assert.equal((h.match(/<textarea[^>]*>[^<]+<\/textarea>/g) ?? []).length, 0);
    assert.equal((h.match(/<option[^>]* selected/g) ?? []).length, 0);
    assert.match(h, /You are reviewing as/);
    assert.match(h, /external_educator/);
    assert.match(h, /Nothing is pre-filled/);
    assert.match(h, /Pack fingerprint/);
    assert.match(scriptOf(h), /const FP="[0-9a-f]{64}"/);
  }
  assert.doesNotMatch(eng + mat, /validated by|approved by|reviewer: |Reviewed by/i);
});

test("English: 13 questions / 21 marks + 11 questions / 18 marks = 24 / 39; Q10 correction present; no claim that 39 is the official allocation", () => {
  const tags = [...eng.matchAll(/id="item-(eng-[^"]+)">[\s\S]*?(\d+) marks?<\/span>/g)].map((m) => [m[1], Number(m[2])] as const);
  const sum = (re: RegExp) => tags.filter(([i]) => re.test(i)).reduce((s, [, m]) => s + m, 0);
  const n = (re: RegExp) => tags.filter(([i]) => re.test(i)).length;
  assert.deepEqual([n(/compass/), sum(/compass/), n(/greatstink/), sum(/greatstink/), tags.length, tags.reduce((s, [, m]) => s + m, 0)], [13, 21, 11, 18, 24, 39]);
  assert.match(engText, /24 questions, 39 marks/);
  assert.match(engText, /NOT claimed to represent the complete official CSSE English mark allocation/);
  const q10 = textOf(eng.slice(eng.indexOf('id="item-eng-fb-greatstink-q10"'), eng.indexOf('id="item-eng-fb-greatstink-q11"')));
  assert.match(q10, /B\. London had a hot, dry summer in 1858\./);
  assert.match(q10, /Intended answer: C, B, A, D/);
});

test("English: every assessment dimension has a structured check, and passage-level and form-level reviews exist", () => {
  for (const c of ["answer_correct", "evidence_in_passage", "demand_fair", "marks_fair", "unambiguous", "marking_tier_ok", "p_authentic", "p_age_suitable", "p_demand", "p_vocabulary", "p_facts_verified", "b_skill_coverage", "b_marks_distribution", "b_difficulty_balance", "b_marking_mix"]) assert.ok(eng.includes(c), c);
  for (const sid of ["eng-passage-compass", "eng-passage-greatstink", "eng-form-balance"]) assert.ok(eng.includes(`id="sect-${sid}"`), sid);
  assert.equal(cards(eng).length, 26, "section reviews are not counted as questions");
});

test("Maths: every item has the structured checks (and the visual check where it has a figure or table); one whole-paper review", () => {
  for (const { id, body } of cardBodies(mat)) {
    for (const k of ["m_answer_unique", "m_wording_clear", "m_format_clear", "m_difficulty", "m_csse_style"]) assert.ok(body.includes(`name="c-${id}-${k}"`), `${id} ${k}`);
    if (/<svg|<table/.test(body.replace(/<details>[\s\S]*?<\/details>/, ""))) assert.ok(body.includes(`name="c-${id}-m_visual_ok"`), `${id} visual`);
  }
  assert.ok(mat.includes('id="sect-maths-form-balance"'));
});

test("validators can solve before the reveal: the own-answer box comes before the intended answer in every English and Maths item", () => {
  for (const h of [eng, mat]) for (const { id, body } of cardBodies(h)) {
    if (id.startsWith("writing-")) continue;
    const a = body.indexOf(`id="a-${id}"`), d = body.indexOf("<details>");
    assert.ok(a > 0 && d > 0 && a < d, id);
  }
});

test("no answer leakage before the reveal; no duplicate questions; no question refers to a missing visual", () => {
  for (const h of [eng, mat]) {
    const seen = new Map<string, string>();
    for (const { id, body } of cardBodies(h)) {
      const visible = textOf(body.replace(/<details>[\s\S]*?<\/details>/g, ""));
      assert.doesNotMatch(visible, /Intended answer|Worked method|Accepted answers|Model answer|Correct order|Marker guide/, id);
      const q = textOf((body.match(/<p class="q">([\s\S]*?)<\/p>/) ?? [, ""])[1]!).trim();
      if (q) { assert.ok(!seen.has(q), `duplicate question ${id} = ${seen.get(q)}`); seen.set(q, id); }
      if (h === mat && /\b(diagram|picture|graph|chart|grid|table|number line|figure)\b/i.test(q)) assert.match(body.replace(/<details>[\s\S]*?<\/details>/, ""), /<svg|<table|<img/, `${id} refers to a visual that is not shown`);
    }
  }
  // The Q10 leak found before migration 273 (an in-paper answer printed in another question) must not recur:
  // no English answer of 8+ characters is printed in another item's question.
  const items = cardBodies(eng).map(({ id, body }) => ({ id, q: textOf((body.match(/<p class="q">([\s\S]*?)<\/p>/) ?? [, ""])[1]!), ans: (textOf((body.match(/<details>[\s\S]*?<\/details>/) ?? [""])[0]).match(/Intended answer: (.*?)(?: Correct order| Legitimate| Plausible| Marker| Accepted| Named| Please|$)/) ?? [, ""])[1]!.trim() }));
  for (const a of items) for (const b of items) if (a.id !== b.id && a.ans.length >= 8) assert.ok(!b.q.toLowerCase().includes(a.ans.toLowerCase().slice(0, 40)), `${a.id} answer printed in ${b.id}`);
});

test("Writing: status of approved content, specification, provisional storyboard and not-ready final artwork is explicit; storyboard is never presented as final", () => {
  assert.match(engText, /Existing approved content/);
  assert.match(engText, /Provisional storyboard only/);
  assert.match(engText, /It is NOT approved artwork/);
  assert.match(textOf(eng), /Final Q2 production artwork NOT READY\./);
  assert.match(textOf(eng), /other pending Writing prompts[^]{0,160}NOT part of this pack/);
  assert.doesNotMatch(engText, /final artwork (is|has been) (ready|approved)/i);
});

test("the CSV/JSON export, autosave, section reviews and tablet/desktop layout work in a real browser (skipped where no Chromium browser exists)", (t) => {
  const r = spawnSync(process.execPath, ["scripts/test-form-b-packs-in-browser.mjs"], { encoding: "utf8", timeout: 170000 });
  if (r.status === 2) return t.skip("no Chromium-based browser available");
  assert.equal(r.status, 0, r.stdout + r.stderr);
  assert.match(r.stdout, /ALL BROWSER CHECKS PASSED/);
});
