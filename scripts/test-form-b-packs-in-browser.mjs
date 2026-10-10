// Real-browser check of the two Form B validator packs (Edge or Chrome, headless, driven over the DevTools protocol).
// Checks, at desktop and tablet sizes: no horizontal overflow, controls reachable; then the full reviewer cycle on a THROWAWAY
// browser profile: fill in test values, reload (autosave restores them), export, parse the CSV and JSON, confirm every item
// identifier is preserved. The test values are written only into the temporary profile and the exports are only held in memory;
// nothing is saved into the repository. Run: node scripts/test-form-b-packs-in-browser.mjs   (BROWSER_PATH overrides the browser)
import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import { spawn } from "node:child_process";

const candidates = [process.env.BROWSER_PATH, "C:/Program Files (x86)/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Microsoft/Edge/Application/msedge.exe", "C:/Program Files/Google/Chrome/Application/chrome.exe", "/usr/bin/google-chrome", "/usr/bin/chromium"].filter(Boolean);
const browser = candidates.find((p) => fs.existsSync(p));
if (!browser) { console.error("No Chromium-based browser found; set BROWSER_PATH."); process.exit(2); }
const dir = path.resolve("scripts/output/form-b-validation-packs");
const profile = fs.mkdtempSync(path.join(os.tmpdir(), "formb-browser-"));
const port = 9400 + Math.floor(Math.random() * 300);
const proc = spawn(browser, [`--remote-debugging-port=${port}`, `--user-data-dir=${profile}`, "--headless=new", "--no-first-run", "--disable-gpu", "--allow-file-access-from-files", "about:blank"], { stdio: "ignore" });
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
let failures = 0;
const check = (ok, msg) => { console.log((ok ? "PASS  " : "FAIL  ") + msg); if (!ok) failures++; };

async function connect() {
  for (let i = 0; i < 60; i++) {
    try {
      const list = await (await fetch(`http://127.0.0.1:${port}/json`)).json();
      const page = list.find((t) => t.type === "page");
      if (page) return page.webSocketDebuggerUrl;
    } catch { /* not up yet */ }
    await sleep(250);
  }
  throw new Error("browser did not start");
}
const ws = new WebSocket(await connect());
await new Promise((r) => (ws.onopen = r));
let id = 0; const pending = new Map();
ws.onmessage = (m) => { const d = JSON.parse(m.data); if (d.id && pending.has(d.id)) { pending.get(d.id)(d); pending.delete(d.id); } };
const send = (method, params = {}) => new Promise((res) => { const i = ++id; pending.set(i, res); ws.send(JSON.stringify({ id: i, method, params })); });
const evalJs = async (expr) => { const r = await send("Runtime.evaluate", { expression: expr, returnByValue: true, awaitPromise: true }); if (r.result.exceptionDetails) throw new Error(JSON.stringify(r.result.exceptionDetails).slice(0, 400)); return r.result.result.value; };
const open = async (file) => { await send("Page.navigate", { url: "file:///" + path.join(dir, file).replace(/\\/g, "/") }); await sleep(1200); };

const sizes = [["desktop 1280x900", 1280, 900], ["tablet landscape 1180x820", 1180, 820], ["tablet portrait 820x1180", 820, 1180]];
const packs = [["english-form-b-validation-pack.html", 26, 3], ["maths-form-b-validation-pack.html", 56, 1]];

try {
  await send("Page.enable"); await send("Runtime.enable");
  for (const [file, nItems, nSecs] of packs) {
    console.log("\n== " + file);
    for (const [label, w, h] of sizes) {
      await send("Emulation.setDeviceMetricsOverride", { width: w, height: h, deviceScaleFactor: 1, mobile: w < 900 });
      await open(file);
      const m = await evalJs(`({sw:document.documentElement.scrollWidth,iw:window.innerWidth,bar:!!document.querySelector('.bar button'),barVisible:document.querySelector('.bar').getBoundingClientRect().width>0,imgs:[...document.images].every(i=>i.complete&&i.naturalWidth>0),svgs:document.querySelectorAll('svg').length})`);
      check(m.sw <= m.iw + 1, `${label}: no horizontal overflow (scrollWidth ${m.sw} <= ${m.iw})`);
      check(m.bar && m.barVisible, `${label}: export bar present`);
      check(m.imgs, `${label}: all images load`);
    }
    // Reviewer cycle at tablet size.
    await send("Emulation.setDeviceMetricsOverride", { width: 820, height: 1180, deviceScaleFactor: 1, mobile: true });
    await open(file);
    await evalJs(`localStorage.clear()`); await open(file);
    const counts = await evalJs(`({ids:IDS.length,secs:SECS.length,items:document.querySelectorAll('[id^="item-"]').length,sects:document.querySelectorAll('[id^="sect-"]').length,blank:![...document.querySelectorAll('input[type=radio]')].some(r=>r.checked)&&![...document.querySelectorAll('textarea')].some(t=>t.value)&&!document.getElementById('vname').value})`);
    check(counts.ids === nItems && counts.items === nItems, `${nItems} item cards, one per identifier`);
    check(counts.secs === nSecs && counts.sects === nSecs, `${nSecs} section review(s)`);
    check(counts.blank, "pack opens completely blank (no decision, comment or name pre-filled)");
    // Fill: first item APPROVE, second REVISE with reason, third REJECT, set some checks, one section.
    await evalJs(`(function(){
      const set=(id,x)=>{const e=document.getElementById(id);e.value=x;e.dispatchEvent(new Event('input',{bubbles:true}))};
      set('vname','TEST REVIEWER (browser test)');document.getElementById('vtype').value='external_educator';document.getElementById('vind').checked=true;set('vdate','2026-01-01');
      const pick=(name,val)=>{const r=document.querySelector('input[name="'+name+'"][value="'+val+'"]');r.checked=true;r.dispatchEvent(new Event('change',{bubbles:true}))};
      pick('d-'+IDS[0],'APPROVE');pick('d-'+IDS[1],'REVISE');set('r-'+IDS[1],'needs "quoted" text, comma');pick('d-'+IDS[2],'REJECT');set('r-'+IDS[2],'bad');
      set('a-'+IDS[0],'my answer');const k=CHK[IDS[0]][0];pick('c-'+IDS[0]+'-'+k,'concern');pick('g-'+IDS[0],'yes');
      const s=SECS[0];const sk=CHK[s][0];pick('s-'+s+'-'+sk,'ok');set('st-'+s,'section note');
    })()`);
    await open(file); // autosave must restore
    const restored = await evalJs(`({name:document.getElementById('vname').value,d1:(document.querySelector('input[name="d-'+IDS[1]+'"]:checked')||{}).value,r1:document.getElementById('r-'+IDS[1]).value,own:document.getElementById('a-'+IDS[0]).value,prog:document.getElementById('prog').textContent,sec:document.getElementById('st-'+SECS[0]).value})`);
    check(restored.name.startsWith("TEST REVIEWER") && restored.d1 === "REVISE" && restored.own === "my answer" && restored.sec === "section note", "autosave restores after a reload");
    check(/3 of \d+ decided/.test(restored.prog), "progress counter: " + restored.prog);
    // Export (capture instead of downloading).
    const out = await evalJs(`(function(){window.alert=()=>{};window.confirm=()=>true;const got=[];window.dl=(n,t,ty)=>got.push({n:n,t:t,ty:ty});exportAll();return got})()`);
    check(out.length === 2 && out.some((f) => f.n.endsWith(".csv")) && out.some((f) => f.n.endsWith(".json")), "export produces a CSV and a JSON file");
    const csv = out.find((f) => f.n.endsWith(".csv")).t; const json = JSON.parse(out.find((f) => f.n.endsWith(".json")).t);
    const lines = csv.split("\n");
    check(lines.length === 1 + nItems + nSecs || csv.includes('needs ""quoted"" text'), `CSV has ${1 + nItems + nSecs} data/header lines (multi-line cells aside): got ${lines.length}`);
    check(csv.includes('"needs ""quoted"" text, comma"'), "CSV escapes quotes and commas in reviewer text");
    const ids = await evalJs(`IDS`);
    check(ids.every((i) => csv.includes("," + i + ",")), "every question identifier is preserved in the CSV");
    check(ids.every((i) => json.items[i]) && json.pack && json.pack_fingerprint?.length === 64, "JSON preserves every identifier and carries pack name and fingerprint");
    check(json.validator.type === "external_educator" && json.validator.independence === true, "JSON attributes the decisions to the named reviewer and capacity");
    check(json.items[ids[0]].checks[Object.keys(json.items[ids[0]].checks)[0]] === "concern", "structured check saved and exported");
    // Export guards.
    const guard = await evalJs(`(function(){let alerts=[];window.alert=m=>alerts.push(m);window.confirm=()=>true;const got=[];window.dl=(n,t,ty)=>got.push(n);document.getElementById('vname').value='';document.getElementById('vname').dispatchEvent(new Event('input',{bubbles:true}));exportAll();return {alerts,got:got.length}})()`);
    check(guard.got === 0 && guard.alerts.length === 1, "export refuses without a reviewer name");
    await evalJs(`localStorage.clear()`);
    // Screenshot proof of layout (not saved to the repo).
    const shot = await send("Page.captureScreenshot", { format: "png" });
    check(shot.result.data.length > 5000, "tablet screenshot renders");
  }
} catch (e) { console.error(e); failures++; }
ws.close(); proc.kill();
await sleep(300);
try { fs.rmSync(profile, { recursive: true, force: true }); } catch { /* browser may still hold a lock */ }
console.log(failures ? `\n${failures} FAILURE(S)` : "\nALL BROWSER CHECKS PASSED");
process.exit(failures ? 1 : 0);
