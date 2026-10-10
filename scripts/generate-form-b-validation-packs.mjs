// Generates the two validator-ready packs (English Form B, Maths Form B) as SELF-CONTAINED HTML files for independent human
// validators. No source-code access needed: open in a browser, record APPROVE / REVISE / REJECT plus reasons per item, then
// export. Decisions autosave in the browser and export as CSV and JSON. These packs contain SEALED content (answers): send them
// securely to the chosen validator only. Claude's own checks are not independent validation and are labelled as such.
import fs from "node:fs";
import path from "node:path";
import crypto from "node:crypto";
import { COMPASS_ROSE_FIXES, TOP_UP_ITEMS, REPAIR_TIER } from "../lib/ali/questionFactory/englishFormBCompletion.ts";
import { REPLACEMENT_FACTUAL_CLAIMS, REPLACEMENT_ITEMS, REPLACEMENT_PASSAGE_TEXT, REPLACEMENT_PASSAGE_TITLE, REPLACEMENT_TOTALS } from "../lib/ali/questionFactory/englishFormBReplacement.ts";
import { FORM_B_MATHS_ITEMS } from "../lib/ali/questionFactory/mockFormBMathsItems.ts";
import { FORM_B_REVALIDATION } from "../lib/ali/questionFactory/mockFormBRevalidation.ts";

const OUT = "scripts/output/form-b-validation-packs";
fs.mkdirSync(OUT, { recursive: true });
const esc = (s) => String(s ?? "").replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;").replace(/"/g, "&quot;");
const nl2br = (s) => esc(s).replace(/\\n/g, "\n").replace(/\n/g, "<br>");

const STYLE = `
:root{--ink:#1d2b44;--muted:#51607a;--blue:#2457c5;--sky:#eaf0fb;--border:#d9d4c7;--paper:#ffffff;--bg:#faf8f2;--warn:#8a4b00;--warnbg:#fff4e0}
*{box-sizing:border-box}body{margin:0;background:var(--bg);color:var(--ink);font:16px/1.5 system-ui,Segoe UI,Arial,sans-serif}
main{max-width:920px;margin:0 auto;padding:16px}h1{font-size:1.5rem;margin:.2em 0}h2{font-size:1.2rem;margin:1.6em 0 .4em;border-bottom:2px solid var(--blue);padding-bottom:.2em}h3{font-size:1.02rem;margin:.2em 0}
.card{background:var(--paper);border:1px solid var(--border);border-radius:10px;padding:14px;margin:12px 0}.note{background:var(--sky);border-radius:8px;padding:10px 12px;margin:10px 0}
.warn{background:var(--warnbg);border:1px solid #e6c48a;color:var(--warn);border-radius:8px;padding:10px 12px;margin:10px 0}
table{border-collapse:collapse;width:100%;margin:8px 0;font-size:.92rem}th,td{border:1px solid var(--border);padding:5px 8px;text-align:left;vertical-align:top}th{background:var(--sky)}
.meta{color:var(--muted);font-size:.88rem}.q{font-weight:600;white-space:pre-line}.pass{white-space:pre-line;background:#fff;border-left:4px solid var(--blue);padding:8px 12px;margin:8px 0}
details{margin:6px 0}summary{cursor:pointer;color:var(--blue);font-weight:600}fieldset{border:0;padding:0;margin:8px 0}legend{font-weight:600}
label.opt{display:inline-block;margin-right:14px}textarea,input[type=text]{width:100%;border:1px solid var(--border);border-radius:6px;padding:6px;font:inherit}
.bar{position:sticky;top:0;background:var(--paper);border-bottom:1px solid var(--border);padding:8px 16px;z-index:5;display:flex;gap:10px;flex-wrap:wrap;align-items:center}
button{background:var(--blue);color:#fff;border:0;border-radius:8px;padding:8px 14px;font:inherit;font-weight:600;cursor:pointer}button.alt{background:#fff;color:var(--blue);border:1px solid var(--blue)}
.tag{display:inline-block;background:var(--sky);border-radius:99px;padding:1px 9px;font-size:.8rem;margin-right:6px}.fig svg,.fig img{max-width:100%;height:auto;background:#fff}
.chks{border:1px solid var(--border);border-radius:8px;padding:6px 10px;margin:8px 0;background:#fcfbf7}.chk{display:flex;justify-content:space-between;gap:12px;padding:4px 0;border-top:1px solid #eee;align-items:center}.chk:first-of-type{border-top:0}.chk .opts{white-space:nowrap}select{width:100%;border:1px solid var(--border);border-radius:6px;padding:6px;font:inherit}.sect{border-left:4px solid var(--blue)}
@media (max-width:760px){.chk{flex-direction:column;align-items:flex-start}.chk .opts{white-space:normal}}
@media print{.bar{display:none}.card{break-inside:avoid}}`;

const SCRIPT = (packId, items, sections, chk, cols, fp) => `
const PACK=${JSON.stringify(packId)};const FP=${JSON.stringify(fp)};const IDS=${JSON.stringify(items)};const SECS=${JSON.stringify(sections)};const CHK=${JSON.stringify(chk)};const COLS=${JSON.stringify(cols)};
const KEY='angel-validation-'+PACK+'-'+FP.slice(0,12);
function load(){try{return JSON.parse(localStorage.getItem(KEY)||'{}')}catch(e){return{}}}
function v(id){const e=document.getElementById(id);return e?e.value:''}
function radio(name){const r=document.querySelector('input[name="'+name+'"]:checked');return r?r.value:''}
function checksOf(prefix,id){const o={};for(const k of (CHK[id]||[])){o[k]=radio(prefix+'-'+id+'-'+k)}return o}
function save(){const d={pack:PACK,pack_fingerprint:FP,validator:{name:v('vname'),role:v('vrole'),type:v('vtype'),organisation:v('vorg'),date:v('vdate'),independence:document.getElementById('vind').checked},overall:v('overall'),items:{},sections:{}};
 for(const id of IDS){d.items[id]={decision:radio('d-'+id),reason:v('r-'+id),ownAnswer:v('a-'+id),ageOk:radio('g-'+id),checks:checksOf('c',id)}}
 for(const s of SECS){d.sections[s]={reason:v('st-'+s),checks:checksOf('s',s)}}
 try{localStorage.setItem(KEY,JSON.stringify(d))}catch(e){}return d}
function setRadio(name,val){if(!val)return;const r=document.querySelector('input[name="'+name+'"][value="'+val+'"]');if(r)r.checked=true}
function restore(){const d=load();if(!d.items)return;const set=(id,x)=>{const e=document.getElementById(id);if(e)e.value=x||''};const vd=d.validator||{};
 set('vname',vd.name);set('vrole',vd.role);set('vtype',vd.type);set('vorg',vd.organisation);set('vdate',vd.date);set('overall',d.overall);
 if(vd.independence)document.getElementById('vind').checked=true;
 for(const id of IDS){const it=d.items[id];if(!it)continue;setRadio('d-'+id,it.decision);setRadio('g-'+id,it.ageOk);set('r-'+id,it.reason);set('a-'+id,it.ownAnswer);for(const k in (it.checks||{}))setRadio('c-'+id+'-'+k,it.checks[k])}
 for(const s of SECS){const it=(d.sections||{})[s];if(!it)continue;set('st-'+s,it.reason);for(const k in (it.checks||{}))setRadio('s-'+s+'-'+k,it.checks[k])}
 count()}
function count(){const d=save();let n=0,a=0,r=0,j=0;for(const id of IDS){const x=d.items[id].decision;if(x)n++;if(x==='APPROVE')a++;if(x==='REVISE')r++;if(x==='REJECT')j++}
 document.getElementById('prog').textContent=n+' of '+IDS.length+' decided ('+a+' approve, '+r+' revise, '+j+' reject)'}
function dl(name,text,type){const b=new Blob([text],{type});const u=URL.createObjectURL(b);const a=document.createElement('a');a.href=u;a.download=name;document.body.appendChild(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(u),1000)}
function problems(d){const miss=IDS.filter(id=>!d.items[id].decision);const bad=IDS.filter(id=>(d.items[id].decision==='REVISE'||d.items[id].decision==='REJECT')&&!d.items[id].reason.trim());return{miss:miss,bad:bad}}
function csvText(d){const q=s=>'"'+String(s==null?'':s).replace(/"/g,'""')+'"';
 const head=['pack','pack_fingerprint','reviewer_name','reviewer_type','kind','item_id','decision','reason','own_answer','age_appropriate'].concat(COLS);const rows=[head.join(',')];
 const base=[d.pack,d.pack_fingerprint,q(d.validator.name),q(d.validator.type)];
 for(const id of IDS){const x=d.items[id];rows.push(base.concat(['item',id,x.decision,q(x.reason),q(x.ownAnswer),x.ageOk]).concat(COLS.map(c=>x.checks[c]||'')).join(','))}
 for(const s of SECS){const x=d.sections[s];rows.push(base.concat(['section',s,'',q(x.reason),'','']).concat(COLS.map(c=>x.checks[c]||'')).join(','))}
 return rows.join('\\n')}
function exportAll(){const d=save();const p=problems(d);
 if(!d.validator.name){alert('Please enter your name before exporting.');return}
 if(!d.validator.type){alert('Please say who you are (external educator, Founder or other) before exporting.');return}
 if(!d.validator.independence){alert('Please tick the independence declaration before exporting.');return}
 if(p.bad.length&&!confirm('These REVISE or REJECT decisions have no reason: '+p.bad.join(', ')+'. Export anyway?'))return;
 if(p.miss.length&&!confirm(p.miss.length+' items have no decision yet. Export anyway?'))return;
 const stamp=(d.validator.date||new Date().toISOString().slice(0,10));
 dl(PACK+'-decisions-'+stamp+'.csv',csvText(d),'text/csv');dl(PACK+'-decisions-'+stamp+'.json',JSON.stringify(d,null,2),'application/json')}
function clearAll(){if(!confirm('Clear every decision and comment you have entered in this browser? This cannot be undone.'))return;try{localStorage.removeItem(KEY)}catch(e){}location.reload()}
document.addEventListener('input',count);document.addEventListener('change',count);window.addEventListener('DOMContentLoaded',restore);`;

const OK_OPTS = [["ok", "OK"], ["concern", "Concern"], ["na", "n/a"]];
const ENG_CHECKS = [
  ["answer_correct", "The intended answer is correct and fully supported by the passage"],
  ["evidence_in_passage", "All the evidence needed is in the passage (no outside knowledge required)"],
  ["demand_fair", "The comprehension, vocabulary or inference demand is fair for the age group and as labelled"],
  ["marks_fair", "The mark allocation is fair for the demand"],
  ["unambiguous", "The question is unambiguous and the accepted alternatives are complete"],
  ["marking_tier_ok", "The marking treatment (automatic or trained marker) suits this question"],
];
const WQ1_CHECKS = [
  ["w_accessible", "Accessible to children with different home experiences of devices"],
  ["w_template_risk", "No serious risk of a rehearsed or template response"],
  ["w_genuine_opinion", "Elicits a genuine opinion with real justification"],
  ["w_age", "Age appropriate for 10 to 11 year olds"],
  ["w_opportunity", "Gives enough opportunity to show organisation, vocabulary and sentence control"],
  ["w_no_assumption", "Does not unfairly assume unrestricted personal device use"],
];
const WQ2_CHECKS = [
  ["w_task_clear", "The task (what the child is asked to do) is clear"],
  ["w_picture_requirements", "What the final picture must show is specified well enough to brief an illustrator"],
  ["w_many_stories", "The scene would support many different stories"],
  ["w_age", "Age appropriate for 10 to 11 year olds"],
];
const MATHS_CHECKS = [
  ["m_answer_unique", "I solved it myself and reached the intended answer, and it is the only correct answer"],
  ["m_wording_clear", "The wording is clear for a 10 to 11 year old"],
  ["m_format_clear", "A child would know what form of answer to type"],
  ["m_difficulty", "The stated difficulty label is right", [["too_easy", "Too easy"], ["about_right", "About right"], ["too_hard", "Too hard"]]],
  ["m_csse_style", "Plausible as a CSSE-style item in content and style (your own professional judgement)"],
];
const MATHS_VISUAL_CHECK = ["m_visual_ok", "The figure or table is clear, complete and consistent with the question"];
const checkKeys = (list) => list.map((c) => c[0]);
function checkCols(...lists) { return [...new Set(lists.flat().map((c) => c[0]))]; }

function checkRows(prefix, id, checks) {
  if (!checks?.length) return "";
  return `<div class="chks"><div class="meta"><strong>Structured checks</strong> (OK, Concern, or n/a; put the detail in the comments box)</div>${checks.map(([k, label, opts]) => `<div class="chk"><span>${esc(label)}</span><span class="opts">${(opts ?? OK_OPTS).map(([val, lab]) => `<label class="opt"><input type="radio" name="${prefix}-${id}-${k}" value="${val}"> ${esc(lab)}</label>`).join("")}</span></div>`).join("")}</div>`;
}
function decisionBlock(id, withOwn, checks) {
  return `${checkRows("c", id, checks)}<fieldset><legend>Your decision</legend>
<label class="opt"><input type="radio" name="d-${id}" value="APPROVE"> APPROVE</label><label class="opt"><input type="radio" name="d-${id}" value="REVISE"> REVISE</label><label class="opt"><input type="radio" name="d-${id}" value="REJECT"> REJECT</label></fieldset>
${withOwn === "before" ? "" : withOwn ? `<label class="meta">Your own answer, worked out before you open the intended answer (recommended)<input type="text" id="a-${id}" autocomplete="off"></label>` : `<input type="hidden" id="a-${id}">`}
<fieldset><legend class="meta">Is it suitable for the age group (Year 5 to 6, about 10 to 11 years)?</legend><label class="opt"><input type="radio" name="g-${id}" value="yes"> Yes</label><label class="opt"><input type="radio" name="g-${id}" value="no"> No</label></fieldset>
<label class="meta">Reason or comments (required for REVISE or REJECT: say exactly what to change)<textarea id="r-${id}" rows="3"></textarea></label>`;
}
function sectionReview(sid, title, checks, prompt) {
  return `<div class="card sect" id="sect-${sid}"><h3>${esc(title)} <span class="tag">section review (not a question)</span></h3>${prompt ? `<p class="meta">${esc(prompt)}</p>` : ""}${checkRows("s", sid, checks)}
<label class="meta">Comments on this section<textarea id="st-${sid}" rows="3"></textarea></label></div>`;
}
function validatorHeader(packLabel) {
  return `<div class="card"><h2 style="margin-top:0">About you</h2>
<p class="meta">These details are exported with your decisions so that every judgement is attributable to a named person. Nothing is pre-filled.</p>
<label>Your name<input type="text" id="vname" autocomplete="off"></label><label>Your role (for example teacher, tutor, examiner)<input type="text" id="vrole" autocomplete="off"></label>
<label>You are reviewing as<select id="vtype"><option value="">Please choose</option><option value="external_educator">External educator (independent of the authors)</option><option value="founder">The Founder</option><option value="other">Other (say who in your role)</option></select></label>
<label>School or organisation (optional)<input type="text" id="vorg" autocomplete="off"></label>
<label>Date<input type="text" id="vdate" placeholder="YYYY-MM-DD" autocomplete="off"></label>
<p><label><input type="checkbox" id="vind"> I confirm that I did not write any of these items, that I have worked through them independently, and that these are my own judgements.</label></p>
<label>Overall comments on the ${esc(packLabel)}<textarea id="overall" rows="4"></textarea></label>
<p class="meta"><button type="button" class="alt" onclick="clearAll()">Clear everything I have entered</button></p></div>`;
}

function shell(title, packId, meta, body) {
  const fp = crypto.createHash("sha256").update(body.replace(/Prepared d{4}-d{2}-d{2}./, "Prepared DATE.")).digest("hex");
  return `<!doctype html><html lang="en-GB"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1"><title>${esc(title)}</title><style>${STYLE}</style></head><body>
<div class="bar"><strong>${esc(title)}</strong><span id="prog" class="meta">0 recorded</span><button onclick="exportAll()">Export my decisions (CSV and JSON)</button><button class="alt" onclick="window.print()">Print</button></div>
<main>${body}<p class="meta">Pack fingerprint (identifies the exact content you reviewed): ${fp.slice(0, 16)}</p></main><script>${SCRIPT(packId, meta.ids, meta.sections, meta.chk, meta.cols, fp)}</script></body></html>`;
}

// ---------------------------------------------------------------- English pack
const sql166 = fs.readFileSync("supabase/migrations/166_english_content_foundation_increment003_comprehension.sql", "utf8");
function parse166(passagePrefix) {
  const out = [];
  const re = new RegExp("\\('(" + passagePrefix + "-q[0-9a-z]+)', 'english', '(QT-RC-\\d+)', array\\['csse'\\], '(\\w+)', '[\\w-]+', (\\d+),\\s*\\$json\\$([\\s\\S]*?)\\$json\\$", "g");
  let m;
  while ((m = re.exec(sql166))) out.push({ id: m[1], qt: m[2], difficulty: m[3], seconds: Number(m[4]), body: JSON.parse(m[5]) });
  return out;
}
const COMPASS = parse166("eng-inc003-compassrosechallenge");
for (const f of COMPASS_ROSE_FIXES) {
  const it = COMPASS.find((x) => x.id === f.id);
  if (f.question) it.body.question = f.question;
  if (f.addAccepted) it.body.acceptedAnswers = [...new Set([...(it.body.acceptedAnswers ?? []), ...f.addAccepted])];
}
const QT_NAME = { "QT-RC-01": "Retrieval of explicit information", "QT-RC-02": "Inference with evidence", "QT-RC-03": "Meaning of a word or phrase in context", "QT-RC-04": "Synonyms (vocabulary)", "QT-RC-05": "Finding a supporting quotation", "QT-RC-06": "Sequencing / structure", "QT-RC-07": "Comparing characters or ideas", "QT-RC-10": "Writer's choices and effect" };
const TIER_TEXT = {
  TIER2_ACCEPTED_SET: "AUTOMATIC. Marked correct if the child's answer matches an accepted answer exactly, OR contains an accepted answer as a run of whole words (so extra words around a correct answer are fine, and so is a hedged answer that happens to contain one), OR is a run of two or more whole words taken from inside an accepted answer (so a shortened answer such as \"the sundial\" is accepted if it sits inside a listed one). A single word on its own matches only by exact equality. Capitals and extra spaces are ignored. Please say (a) if any correct answer would be rejected and (b) if any WRONG answer would be accepted by these rules.",
  TIER3_QUOTATION_PLUS_EXPLANATION: "MANUAL. A trained marker awards marks against the model answer; the child must support the answer with a quotation from the text.",
  TIER4_ORDERED_LIST: "AUTOMATIC. One mark for each item in its correct position; the ORDER is what is marked. The child may separate items with new lines, commas, semicolons, arrows or the words then / and (and with plain spaces where every item is a single word or letter). Any other order scores only for the positions that happen to be right.",
  TIER5_NAMED_COMPONENT_PLUS_EXPLANATION: "MANUAL. A trained marker awards marks against the model answer or marker guide. Listed accepted answers are prompts for the marker only and never award marks.",
};
const validatorNotes = {
  "eng-inc003-compassrosechallenge-q02b": "EDUCATIONAL JUDGEMENT FOR YOU (not changed by Angel): (1) does \"the sundial\" deserve the mark? (2) does \"the weathervane\" alone? (3) does a hedged answer such as \"the weathervane or the sundial\"? (4) is Casey's belief about the \"bell\" inferable from the passage, or should the wording change?",
  "eng-inc003-compassrosechallenge-q05": "This question was re-worded after review: the passage shows all four working at the same time, so it can order how they are DESCRIBED but not who investigated first. Confirm the order Elif, Casey, Wei, Grace is the only defensible order.",
  "eng-inc003-compassrosechallenge-q03": "A Yes/No plus explanation item worth 3 marks. Check that the marks split cleanly into observable parts.",
  "eng-fb-compassrosechallenge-q08": "NEW item (authored for Form B). Check the two mark elements are separately observable.",
  "eng-fb-salmonnavigation-q08": "NEW item (authored for Form B). Check the two mark elements are separately observable.",
};
for (const t of TOP_UP_ITEMS.filter((i) => i.skill === "QT-RC-04")) validatorNotes[t.id] = "NEW synonym item. Check each accepted answer is a true synonym in this context and that no obviously valid synonym is missing.";

function engItem(it, extra = {}) {
  const b = it.body ?? {};
  const q = extra.question ?? b.question;
  const tier = extra.tier ?? b.validationTier;
  const marks = extra.marks ?? b.marks;
  const model = extra.model ?? b.modelAnswer;
  const acc = extra.acceptedAnswers ?? b.acceptedAnswers;
  const qt = extra.qt ?? it.qt;
  const note = validatorNotes[it.id ?? extra.id];
  const id = it.id ?? extra.id;
  return `<div class="card" id="item-${id}"><h3>${esc(id)} <span class="tag">${esc(qt)}</span><span class="tag">${esc(QT_NAME[qt] ?? "")}</span><span class="tag">${marks} mark${marks == 1 ? "" : "s"}</span><span class="tag">${esc(extra.difficulty ?? it.difficulty)}</span>${extra.isNew ? '<span class="tag">NEW</span>' : ""}</h3>
<p class="q">${esc(q)}</p>
<label class="meta">Your own answer, worked out before you open the intended answer (recommended)<input type="text" id="a-${id}" autocomplete="off"></label>
<details><summary>Intended answer, marking treatment and alternative-answer considerations</summary>
<p><strong>Marking treatment:</strong> ${esc(TIER_TEXT[tier] ?? tier)}</p>
${model ? `<p><strong>Intended answer:</strong> ${nl2br(model)}</p>` : ""}
${(extra.orderedAnswer ?? b.orderedAnswer) ? `<p><strong>Correct order:</strong> ${esc((extra.orderedAnswer ?? b.orderedAnswer).join(" , "))}</p>` : ""}
${(extra.quotationRequired ?? b.quotationRequired) ? `<p><strong>Quotation the marker looks for:</strong> ${esc((extra.quotationRequired ?? b.quotationRequired).join(" | "))}</p>` : ""}
${extra.alternativeAnswerNotes ? `<p><strong>Legitimate alternative answers (author notes):</strong> ${esc(extra.alternativeAnswerNotes)}</p>` : ""}
${extra.plausibleWrong ? `<p><strong>Plausible wrong answers the marker should reject:</strong> ${esc(extra.plausibleWrong.join(" | "))}</p>` : ""}
${extra.markingGuidance ?? b.markingGuidance ? `<p><strong>Marker guide:</strong> ${esc(extra.markingGuidance ?? b.markingGuidance)}</p>` : ""}
${acc ? `<p><strong>${tier === "TIER2_ACCEPTED_SET" ? "Accepted answers" : "Named-component prompts (marker support only)"} (${acc.length}):</strong> ${esc(acc.join(" | "))}</p>` : ""}
${note ? `<p class="warn"><strong>Please look at this one carefully:</strong> ${esc(note)}</p>` : ""}</details>
${decisionBlock(id, "before", ENG_CHECKS)}</div>`;
}

function wordsOf(t) { return t.replace(/\\n/g, " ").split(/\s+/).filter(Boolean); }
function passageStats(text) {
  const ws = wordsOf(text);
  const sentences = text.replace(/\\n/g, " ").split(/[.!?]+\s/).filter((s) => s.trim().length);
  const long = [...new Set(ws.map((w) => w.toLowerCase().replace(/[^a-z'-]/g, "")).filter((w) => w.length >= 9))].sort();
  return { words: ws.length, sentences: sentences.length, avgSentence: (ws.length / sentences.length).toFixed(1), long };
}

const PASSAGE_CHECKS = [
  ["p_authentic", "Authentic in style and quality for a selective-school reading paper"],
  ["p_age_suitable", "The subject, tone and content are suitable for 10 to 11 year olds"],
  ["p_demand", "The overall comprehension demand is appropriate"],
  ["p_vocabulary", "The vocabulary load is fair, with harder words supported by context"],
  ["p_evidence_spread", "The questions draw on the whole passage, and every answer needs only the passage"],
];
const SECTION_CHECKS = {
  "eng-passage-compass": PASSAGE_CHECKS,
  "eng-passage-greatstink": [...PASSAGE_CHECKS, ["p_facts_verified", "I have checked the factual claims listed and they are accurate"]],
  "eng-form-balance": [
    ["b_skill_coverage", "The spread of reading skills across the 24 questions is balanced"],
    ["b_marks_distribution", "The distribution of the 39 marks across questions is balanced"],
    ["b_passage_variety", "The two passages differ enough in type and subject"],
    ["b_difficulty_balance", "The overall difficulty and progression look right for the age group"],
    ["b_marking_mix", "The mix of automatic and trained-marker items looks reasonable"],
  ],
  "maths-form-balance": [
    ["b_skill_coverage", "The spread of skills across the 56 items is balanced"],
    ["b_difficulty_balance", "The easy / medium / hard spread looks right for the age group"],
    ["b_no_near_duplicates", "No two items are too similar in structure"],
    ["b_overall_authentic", "Overall, the paper feels like a plausible CSSE-style Mathematics paper (your own professional judgement)"],
    ["b_answer_formats", "Answer formats are consistent and fair across the paper"],
  ],
};

function englishPack() {
  const cText = COMPASS[0].body.passageText.replace(/\\n/g, "\n");
  const cS = passageStats(COMPASS[0].body.passageText);
  const rS = passageStats(REPLACEMENT_PASSAGE_TEXT);
  const cTop = TOP_UP_ITEMS.filter((i) => i.passageId.includes("compass"));
  const topItem = (t) => engItem({ id: t.id, qt: t.skill }, { question: t.question, tier: t.tier, marks: t.marks, model: t.modelAnswer, acceptedAnswers: t.acceptedAnswers, markingGuidance: t.markingGuidance, difficulty: t.difficulty, isNew: true });
  const repItem = (r) => engItem({ id: r.id, qt: r.skill }, { question: r.question, tier: r.tier, marks: r.marks, model: r.modelAnswer, acceptedAnswers: r.acceptedAnswers, orderedAnswer: r.orderedAnswer, quotationRequired: r.quotationRequired, markingGuidance: r.markingGuidance, difficulty: r.difficulty, isNew: true, alternativeAnswerNotes: r.alternativeAnswerNotes, plausibleWrong: r.plausibleWrongAnswers });
  const compassItems = [...COMPASS.map((i) => engItem(i)), ...cTop.map(topItem)];
  const replacementItems = REPLACEMENT_ITEMS.map(repItem);
  const ids = [...COMPASS.map((i) => i.id), ...cTop.map((t) => t.id), ...REPLACEMENT_ITEMS.map((r) => r.id), "writing-q1-screentime", "writing-q2-cornershop-storyboard"];
  const cm = COMPASS.reduce((s, i) => s + i.body.marks, 0) + cTop.reduce((s, t) => s + t.marks, 0);
  const rm = REPLACEMENT_TOTALS.marks;
  const skillRows = {};
  for (const it of COMPASS) skillRows[it.qt] = (skillRows[it.qt] ?? [0, 0]).map((v, k) => v + (k === 0 ? 1 : it.body.marks));
  for (const t of cTop) skillRows[t.skill] = (skillRows[t.skill] ?? [0, 0]).map((v, k) => v + (k === 0 ? 1 : t.marks));
  for (const r of REPLACEMENT_ITEMS) skillRows[r.skill] = (skillRows[r.skill] ?? [0, 0]).map((v, k) => v + (k === 0 ? 1 : r.marks));
  const cornerMd = fs.readFileSync("ANGEL_CSSE_WRITING_NARRATIVE_ASSET_CONTRACTS.md", "utf8");
  const cs = cornerMd.slice(cornerMd.indexOf("## The Corner Shop"));
  const csBlock = cs.slice(0, cs.indexOf("\n## ", 5) > 0 ? cs.indexOf("\n## ", 5) : cs.length).split("\n").filter((l) => l.trim() && !l.startsWith("## ")).map((l) => `<p class="${l.startsWith("  -") ? "meta" : ""}" style="${l.startsWith("  -") ? "margin:2px 0 2px 24px" : ""}">${esc(l.replace(/^\s*-\s*/, "").replace(/\*\*/g, ""))}</p>`).join("");
  const svg = fs.readFileSync("public/mock-assets/q2-picture-narrative/cornershop-v1.svg", "utf8");
  const dataUri = "data:image/svg+xml;base64," + Buffer.from(svg).toString("base64");
  const screen = { prompt: "Do you think there should be limits on how much time children spend using phones, tablets, or screens? Write about your own opinion, using your own experience or things you have noticed to support what you think.", title: "Should Children Have Limits on Screen Time?", checklist: ["Write at least six sentences", "State your own opinion clearly, near the start", "Support your opinion with specific, convincing examples or reasoning, not just a generic list of reasons", "Consider, briefly, why someone might disagree with you", "Keep a genuine personal voice throughout -- this is a personal opinion piece, not a formal debate speech, though a rhetorical question or a moment of deliberate emphasis is fine if it suits your own voice", "Organise your writing into clear paragraphs", "Check spelling and punctuation carefully"] };
  const q1Criteria = [
    "Is it accessible to children with different home experiences (for example little or no personal device use, shared devices, strict family rules, or no rules)?",
    "Does it carry a risk of rehearsed or template responses (a memorised 'screens are bad' essay)?",
    "Does it elicit a genuine opinion with real justification, rather than a list of generic reasons?",
    "Is it age appropriate for 10 to 11 year olds?",
    "Does it give enough opportunity to show organisation, vocabulary and sentence control?",
    "Does it unfairly assume the child has unrestricted personal device use?",
  ];

  const body = `
<h1>English Form B: independent validation pack</h1>
<p class="meta">Sealed content. Do not share beyond the validator. Prepared ${new Date().toISOString().slice(0, 10)}.</p>
<div class="warn"><strong>This is a request for independent human judgement.</strong> The author's own checks (an automatic re-derivation of answers, marking-contract tests, and a read of every passage) are NOT validation and are not shown as such. Nothing in this pack has been marked validated. Please judge each item yourself, as if sitting the paper.</div>
<div class="note"><strong>How to use this pack.</strong> Read each passage, then each question. Open "Intended answer, marking treatment and alternative-answer considerations" only after forming your own view. For every item choose APPROVE (fit to be used as it is), REVISE (fixable: say exactly how), or REJECT (not fit: say why), say whether it suits the age group, and add comments. Your work saves automatically in this browser. When finished, press "Export my decisions" and return the two files. You do not need any software or source code.</div>
${validatorHeader("English Form B pack")}
<h2>1. The form at a glance</h2>
<div class="card"><p>Reading section: <strong>24 questions, 39 marks</strong>, over two passages (one narrative, one informational), followed by two Writing tasks. These 39 marks are the comprehension marks of this Form B only. They are NOT claimed to represent the complete official CSSE English mark allocation: the official CSSE division of marks between comprehension and Writing has not been independently established, and nothing here assumes one.</p>
<table><tr><th>Skill</th><th>Questions</th><th>Marks</th></tr>${Object.keys(skillRows).sort().map((k) => `<tr><td>${esc(k)} ${esc(QT_NAME[k] ?? "")}</td><td>${skillRows[k][0]}</td><td>${skillRows[k][1]}</td></tr>`).join("")}<tr><th>Total</th><th>${Object.values(skillRows).reduce((s, v) => s + v[0], 0)}</th><th>${Object.values(skillRows).reduce((s, v) => s + v[1], 0)}</th></tr></table>
<p class="meta">Marking mix: some items are marked automatically against a fixed answer list; the explanation items (marked MANUAL) need a trained marker. The mix is stated per item.</p>
<p class="meta">History note: an earlier informational passage about salmon was rejected and replaced because it overlapped with an existing passage. It is not part of this pack and must not be reviewed or used.</p></div>

<h2>A. Narrative passage: The Compass Rose Challenge</h2>
<div class="card"><p class="meta">${cS.words} words, ${cS.sentences} sentences, about ${cS.avgSentence} words per sentence. Intended difficulty: challenging. Items: ${COMPASS.length + cTop.length}, ${cm} marks. Estimated time for these items: ${Math.round((COMPASS.reduce((s, i) => s + i.seconds, 0) + cTop.reduce((s, t) => s + t.estimatedTimeSeconds, 0)) / 60)} minutes.</p>
<div class="pass">${esc(cText)}</div>
<details><summary>Load and age-appropriateness aids</summary><p class="meta">Longer words (9 or more letters) a child must handle: ${esc(cS.long.join(", "))}.</p><p><strong>Factual claims to verify:</strong> none. This is fiction. Internal consistency to check: twenty minutes in total, ten spent alone, the marker reached with four minutes to spare; the order in which the four characters are described (Elif, Casey, Wei, Grace).</p><p><strong>Content sensitivity:</strong> none identified.</p></details>
<div class="warn"><strong>Educational judgements left to you (Angel has deliberately not changed these).</strong> For Question 2(b), the accepted answers are the weathervane above the sundial and variants. The automatic marker also accepts a shortened answer taken from inside an accepted one, so "the sundial" and "the stone sundial" currently earn the mark, and an answer that hedges between two things ("the weathervane or the sundial") also earns it. Please say: (1) does "the sundial" deserve the mark; (2) does "the weathervane" alone; (3) does a hedged answer; and (4) is Casey's belief about the "bell" actually inferable from the passage? Use the comment box on Question 2(b) (and 2(a)).</div></div>
${sectionReview("eng-passage-compass", "Review of the passage The Compass Rose Challenge", SECTION_CHECKS["eng-passage-compass"], "Judge the passage as a whole before the individual questions.")}
${compassItems.join("\n")}

<h2>B. Informational passage: ${esc(REPLACEMENT_PASSAGE_TITLE)} (new original replacement)</h2>
<div class="card"><p class="meta">${rS.words} words, ${rS.sentences} sentences, about ${rS.avgSentence} words per sentence. Intended difficulty: moderate. Items: ${REPLACEMENT_ITEMS.length}, ${rm} marks. Estimated time for these items: ${Math.round(REPLACEMENT_ITEMS.reduce((s, i) => s + i.estimatedTimeSeconds, 0) / 60)} minutes. Original Angel text; no external rights holder.</p>
<p class="meta">Designed to differ from the live timed passage on bees in subject, in structure (a chronological problem, crisis and solution rather than an explanation of parallel methods), in wording (no shared run of six or more words with any held passage, tested) and in question formats.</p>
<div class="pass">${esc(REPLACEMENT_PASSAGE_TEXT)}</div>
<details><summary>Load, age-appropriateness and factual-verification aids</summary><p class="meta">Longer words (9 or more letters): ${esc(rS.long.join(", "))}.</p>
<p><strong>Factual claims requiring verification against a reliable source:</strong></p><ul>${REPLACEMENT_FACTUAL_CLAIMS.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>
<p><strong>Please also judge:</strong> is the subject suitable for 10 to 11 year olds (disease and death are mentioned briefly and without detail); is the vocabulary load fair (words such as cesspits, miasma, cholera, embankments are used in context); and does every answer rely only on the passage?</p></details></div>
${sectionReview("eng-passage-greatstink", "Review of the passage The Great Stink", SECTION_CHECKS["eng-passage-greatstink"], "Judge the passage as a whole before the individual questions, including whether its factual claims are accurate.")}
${replacementItems.join("\n")}

<h2>C. Writing</h2>
<div class="card"><h3>What is, and is not, in front of you</h3><table><tr><th>Item</th><th>Status</th></tr>
<tr><td>Writing Q1 "Should Children Have Limits on Screen Time?"</td><td><strong>Existing approved content</strong>: approved for human validation; NOT activated. Reviewed below.</td></tr>
<tr><td>Writing Q2 "The Corner Shop" task and picture requirements</td><td><strong>Assessment specification</strong> for review. The task wording and the picture requirements are the reviewable content.</td></tr>
<tr><td>Writing Q2 drawing</td><td><strong>Provisional storyboard only</strong>, made by the developers to show composition. It is NOT approved artwork and must not be judged as final art.</td></tr>
<tr><td>Final Q2 production artwork</td><td><strong>NOT READY.</strong> A specialist illustrator or image provider has not yet been selected; the final artwork will need its own human visual and educational approval before Q2 can be used.</td></tr>
<tr><td>The other pending Writing prompts (7 prompts awaiting a separate Founder decision)</td><td><strong>NOT part of this pack</strong> and not available for review here.</td></tr></table></div>
<div class="card" id="item-writing-q1-screentime"><h3>Writing Question 1 (reflective / discursive): "${esc(screen.title)}" <span class="tag">approved for human validation, NOT for activation</span><span class="tag">25 minutes</span></h3>
<p><strong>Exact prompt the child sees:</strong></p><p class="q">${esc(screen.prompt)}</p>
<p><strong>Checklist shown with it:</strong></p><ul>${screen.checklist.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>
<div class="note"><strong>Educational rationale.</strong> It is an opinion piece (discursive), so it differs in type from the form A reflective task (changing one's mind about something). It invites a stated position, support from experience, and a counter-view, which are the Ideas and Structure demands of the task. Status: already independently validated as an item in the Mock reserve, but <strong>not</strong> activated for Form B; it will not be activated until Form B human review closes.</div>
<div class="warn"><strong>Please specifically assess:</strong><ul>${q1Criteria.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>Record your answer to each point in the comment box.</div>
${decisionBlock("writing-q1-screentime", false, WQ1_CHECKS)}</div>
<div class="card" id="item-writing-q2-cornershop-storyboard"><h3>Writing Question 2 (picture-led narrative): "The Corner Shop" <span class="tag">educational STORYBOARD, not final art</span></h3>
<div class="warn">The drawing below is a developer-made storyboard. Final production artwork will come from a separately selected specialist illustration or image-generation provider, and Question 2 will not be activated until that artwork has had human visual and educational approval. Please judge the <strong>task</strong>: the prompt, what the picture must show, and whether it supports many different stories. Do not judge the quality of the drawing.</div>
<div class="fig"><img alt="Storyboard of the corner shop scene" src="${dataUri}" style="max-width:560px"></div>
${csBlock}
${decisionBlock("writing-q2-cornershop-storyboard", false, WQ2_CHECKS)}</div>
${sectionReview("eng-form-balance", "Review of the whole English reading section (24 questions, 39 marks)", SECTION_CHECKS["eng-form-balance"], "Judge examination balance across both passages. These 39 marks are the comprehension marks of this Form B only.")}
<h2>Finish</h2><p>Add overall comments at the top, then press "Export my decisions" in the bar above and return both files.</p>`;
  const engSections = ["eng-passage-compass", "eng-passage-greatstink", "eng-form-balance"];
  const engChk = {};
  for (const id of ids) engChk[id] = checkKeys(id === "writing-q1-screentime" ? WQ1_CHECKS : id === "writing-q2-cornershop-storyboard" ? WQ2_CHECKS : ENG_CHECKS);
  for (const sid of engSections) engChk[sid] = checkKeys(SECTION_CHECKS[sid]);
  const engCols = checkCols(ENG_CHECKS, WQ1_CHECKS, WQ2_CHECKS, ...engSections.map((x) => SECTION_CHECKS[x]));
  fs.writeFileSync(path.join(OUT, "english-form-b-validation-pack.html"), shell("English Form B: independent validation pack", "english-form-b", { ids, sections: engSections, chk: engChk, cols: engCols }, body));
  return ids.length;
}

// ---------------------------------------------------------------- Maths pack
const QT_MATHS = { "QT-MR-01": "Arithmetic", "QT-MR-02": "Missing operand and reverse operations", "QT-MR-03": "Measurement and units", "QT-MR-04": "Percentages", "QT-MR-05": "Sequences and rules / algebraic reasoning", "QT-MR-06": "Algebraic reasoning", "QT-MR-07": "Geometry (angles, perimeter, area)", "QT-MR-08": "Coordinates and transformations", "QT-MR-09": "Data handling", "QT-MR-10": "Time", "QT-MR-11": "Number properties", "QT-MR-12": "Averages", "QT-MR-13": "Ratio, value and multi-step problems", "QT-MR-14": "Precision and rounding" };
const EXISTING_DIFF = { "perimeterarea-01a": "hard", "perimeterarea-01b": "hard", "perimeterarea-02a": "hard", "perimeterarea-02b": "hard", "numberpyramid-01": "hard", "numberpyramid-02": "hard", "numberpyramid-03": "medium", "agenarrative-01": "hard", "agenarrative-02": "medium", "agenarrative-03": "hard", "sumdiff-01": "medium", "sumdiff-02": "medium", "rotation-01": "medium", "rotation-02": "medium", "data-01": "medium", "data-02": "medium", "data-03": "hard", "fairprep-01": "medium", "fairprep-02": "hard", "reverseschedule-01": "hard", "reverseschedule-02": "hard", "truefalsejudgement-01": "medium", "truefalsejudgement-02": "medium", "propertysearch-01": "hard", "propertysearch-02": "hard", "reversemean-01": "hard", "reversemean-02": "hard", "weightedmean-01": "medium", "bestvalue-01": "medium", "bestvalue-02": "medium", "toppingcombos-01": "medium", "toppingcombos-02": "hard" };

function loadExisting() {
  const ids = new Set(FORM_B_REVALIDATION.map((e) => e.id));
  const found = {};
  for (const f of fs.readdirSync("supabase/migrations").filter((x) => x.endsWith(".sql"))) {
    const s = fs.readFileSync("supabase/migrations/" + f, "utf8");
    let i = 0;
    while ((i = s.indexOf("$json$", i)) >= 0) {
      const j = s.indexOf("$json$", i + 6);
      if (j < 0) break;
      const txt = s.slice(i + 6, j);
      i = j + 6;
      let o;
      try { o = JSON.parse(txt); } catch { continue; }
      if (ids.has(o.id) && !found[o.id]) found[o.id] = o;
    }
  }
  return found;
}

function markingContract(answer, question) {
  const numeric = Number.isFinite(Number(answer)) && String(answer).trim() !== "";
  const bracket = /^\(.*\)$/.test(answer);
  const time = /^\d{1,2}:\d{2}$/.test(answer);
  const word = /^[A-Za-z]+$/.test(answer);
  let rule;
  if (numeric) rule = `Scored by number: the child's entry is read as a number and compared with ${answer} (tolerance 0.0001). So 2.10 and 2.1 are the same. A pound sign, units or words typed with the number make it a text entry, which would be marked wrong.`;
  else if (bracket) rule = `Coordinate answer. Brackets are required and both numbers must match ${answer}; harmless spacing does not matter, so "${answer.replace(", ", ",")}" and "( ${answer.slice(1, -1).replace(", ", " , ")} )" are treated as the same answer. The same rule is used in Practice and in the Mock scorer. Accepted as the same answer: spacing variants, the Unicode minus sign, and numerically identical decimals such as 9.0 for 9. Marked wrong: a missing bracket, reversed numbers, a different number, an extra value, words, or any other malformed pair.`;
  else if (time) rule = `Scored as exact text: the child must type ${answer} exactly. "3.50pm", "1550" or "15.50" would be marked wrong.`;
  else if (word) rule = `Scored as exact text (capitals ignored): the child must type ${answer}.`;
  else rule = `Scored as exact text (capitals and outer spaces ignored): the child must type ${answer}.`;
  const instructed = /form \(x, y\)/.test(question) ? "The question tells the child the form." : /24-hour time/.test(question) ? "The question says 24-hour time but not the exact layout hh:mm." : numeric ? "A plain number is the natural form." : "The question does not state the exact form: please judge whether a child would know what to type.";
  return { rule, instructed };
}

function mathsPack() {
  const existing = loadExisting();
  const items = [];
  // new items first? Keep a stable skill order, existing and new interleaved by QT then id.
  for (const e of FORM_B_REVALIDATION) {
    const o = existing[e.id];
    const short = e.id.replace(/^mock-mr\d+(mr\d+)?-/, "");
    const answer = e.defect?.repairedAnswer ?? e.storedAnswer;
    items.push({ id: e.id, qt: e.qt, difficulty: EXISTING_DIFF[short], source: "existing (protected bank)", question: o.question, answer, steps: o.workingSteps ?? [], derived: e.derive(), derivedMatchesStored: e.derive() === e.storedAnswer, observation: e.observation, defect: e.defect, kind: "existing" });
  }
  for (const n of FORM_B_MATHS_ITEMS) items.push({ id: n.id, qt: n.skill, difficulty: n.difficulty, source: "new (authored for Form B)", question: n.question, answer: n.answer, steps: n.workingSteps, derived: n.oracle(), derivedMatchesStored: n.oracle() === n.answer, figure: n.figure, table: n.table, kind: "new", misconception: n.misconception });
  items.sort((a, b) => a.qt.localeCompare(b.qt) || a.id.localeCompare(b.id));
  const ids = items.map((i) => i.id);
  const tier = (d) => items.filter((i) => i.difficulty === d).length;
  const byQt = {};
  for (const i of items) byQt[i.qt] = (byQt[i.qt] ?? 0) + 1;
  const card = (it) => {
    const mc = markingContract(it.answer, it.question);
    const figSvg = it.figure ? fs.readFileSync(`public/mock-assets/formb-maths/${it.figure.file}`, "utf8") : "";
    const rep = it.table ? "Table" : it.figure ? "Figure (static diagram)" : "Text only";
    const tableHtml = it.table ? `<table><caption class="meta">${esc(it.table.caption ?? "")}</caption><tr>${it.table.headers.map((h) => `<th>${esc(h)}</th>`).join("")}</tr>${it.table.rows.map((r) => `<tr>${r.map((c) => `<td>${esc(c)}</td>`).join("")}</tr>`).join("")}</table>` : "";
    return `<div class="card" id="item-${it.id}"><h3>${esc(it.id)} <span class="tag">${esc(it.qt)}</span><span class="tag">${esc(QT_MATHS[it.qt] ?? "")}</span><span class="tag">${esc(it.difficulty)}</span><span class="tag">1 mark</span><span class="tag">${esc(rep)}</span><span class="tag">${esc(it.source)}</span></h3>
<p class="q">${esc(it.question)}</p>
${tableHtml}${it.figure ? `<div class="fig">${figSvg}<p class="meta">${esc(it.figure.caption ?? "")}</p><p class="meta">Text description given with the picture: ${esc(it.figure.altText)}</p></div>` : ""}
<p class="meta">Marking treatment: <strong>automatic</strong>, one mark.</p>
${decisionBlock(it.id, true, it.figure || it.table ? [...MATHS_CHECKS, MATHS_VISUAL_CHECK] : MATHS_CHECKS)}
<details><summary>Intended answer, independent derivation and marking contract (open after you have your own answer)</summary>
<p><strong>Intended answer:</strong> ${esc(it.answer)}</p>
<p><strong>Worked method:</strong></p><ol>${it.steps.map((s) => `<li>${esc(s)}</li>`).join("")}</ol>
<p><strong>Independent derivation by script</strong> (written separately from the stored answer; a convenience, not validation): ${esc(it.derived)} ${it.derivedMatchesStored ? "(agrees)" : "(DIFFERS: investigate)"}${it.defect ? " This agrees with the stored value as it was BEFORE the repair; the repair only added the brackets the question itself asks for." : ""}</p>
<p><strong>What the child must type, and how it is marked:</strong> ${esc(mc.rule)} ${esc(mc.instructed)}</p>
${it.misconception ? `<p><strong>Mistake this item is designed to catch:</strong> ${esc(it.misconception)}</p>` : ""}
${it.observation ? `<p class="warn"><strong>Author's observation:</strong> ${esc(it.observation)}</p>` : ""}
${it.defect ? `<p class="warn"><strong>Defect found and repaired in production:</strong> ${esc(it.defect.description)}</p>` : ""}
</details></div>`;
  };
  const body = `
<h1>Mathematics Form B: independent validation pack</h1>
<p class="meta">Sealed content. Do not share beyond the validator. Prepared ${new Date().toISOString().slice(0, 10)}.</p>
<div class="warn"><strong>This is a request for independent human judgement.</strong> The author's re-derivations and tests are NOT validation and are hidden behind each item so that you can first work every item yourself. Nothing in this pack has been marked validated.</div>
<div class="note"><strong>How to use this pack.</strong> For each of the 56 items: work out the answer yourself and type it in the box, then open "Intended answer…". Choose APPROVE (fit as it is), REVISE (fixable: say exactly how), or REJECT (not fit: say why). Also judge: is the answer unambiguous and unique; is the wording clear for a 10 to 11 year old; is the answer format something a child would know to type; is the picture or table necessary and correct; is the difficulty label fair. Your work saves automatically in this browser. When finished press "Export my decisions" and return the two files. You need no software or source code.</div>
${validatorHeader("Mathematics Form B pack")}
<h2>1. The form at a glance</h2>
<div class="card"><p><strong>56 items, one mark each</strong> (32 already held in the protected bank and re-checked, 24 newly authored). Difficulty: ${tier("easy")} easy, ${tier("medium")} medium, ${tier("hard")} hard (the live Form A is 8 / 22 / 26). The official CSSE mark structure is not assumed.</p>
<table><tr><th>Skill</th><th>Items</th></tr>${Object.keys(byQt).sort().map((k) => `<tr><td>${esc(k)} ${esc(QT_MATHS[k] ?? "")}</td><td>${byQt[k]}</td></tr>`).join("")}<tr><th>Total</th><th>${items.length}</th></tr></table>
<p>Form B includes three skills Form A lacks: coordinates (QT-MR-08), averages (QT-MR-12) and precision (QT-MR-14).</p></div>
<div class="card"><h3>How answers are marked in the real paper (important for your judgement)</h3>
<p>The paper's scorer is simple. If the correct answer is a <strong>number</strong>, the child's entry is read as a number and compared (so 2.10 equals 2.1), but any pound sign, unit or word makes it a text entry and it is marked wrong. A <strong>coordinate</strong> answer such as (9, 5) must have its brackets and both numbers right, and harmless spacing does not matter. Spacing variants, the Unicode minus sign and numerically identical decimals (9.0 for 9) are accepted; reversed, different, malformed or extra values and words are marked wrong. The same rule applies in Practice and in the Mock scorer. Anything else (times, words, letters) is compared as <strong>exact text</strong> (capitals and outer spaces ignored, no other flexibility): times exactly as hh:mm, and true/false or a letter exactly as given. <strong>Please say, per item, if a child could reasonably write a correct answer in a form this would reject</strong> and the question does not warn them.</p></div>
<h2>2. The 56 items</h2>
${items.map(card).join("\n")}
${sectionReview("maths-form-balance", "Review of the whole Mathematics paper (56 items)", SECTION_CHECKS["maths-form-balance"], "Judge the paper as a whole after you have worked the items. Author note for your judgement: three pairs deliberately share a setting and differ only in the quantity asked for (mock-mr06-agenarrative-01 and -02, mock-mr06-sumdiff-01 and -02, mock-mr13-toppingcombos-01 and -02). Please say whether each pair tests sufficiently different thinking or should be varied.")}
<h2>Finish</h2><p>Add overall comments at the top, then press "Export my decisions" in the bar above and return both files.</p>`;
  const mSections = ["maths-form-balance"];
  const mChk = {};
  for (const it of items) mChk[it.id] = checkKeys(it.figure || it.table ? [...MATHS_CHECKS, MATHS_VISUAL_CHECK] : MATHS_CHECKS);
  mChk["maths-form-balance"] = checkKeys(SECTION_CHECKS["maths-form-balance"]);
  const mCols = checkCols(MATHS_CHECKS, [MATHS_VISUAL_CHECK], SECTION_CHECKS["maths-form-balance"]);
  fs.writeFileSync(path.join(OUT, "maths-form-b-validation-pack.html"), shell("Mathematics Form B: independent validation pack", "maths-form-b", { ids, sections: mSections, chk: mChk, cols: mCols }, body));
  return { n: ids.length, tiers: [tier("easy"), tier("medium"), tier("hard")] };
}

const eN = englishPack();
const mN = mathsPack();
fs.writeFileSync(path.join(OUT, "README.txt"), [
  "Form B independent validation packs (SEALED: contain intended answers; send to the validator only, by a secure route).",
  "",
  "1. english-form-b-validation-pack.html   (" + eN + " decision points: 24 reading questions across two passages (13 questions / 21 marks and 11 questions / 18 marks, 39 comprehension marks in all), plus Writing Q1 and Q2; 3 section reviews)",
  "2. maths-form-b-validation-pack.html     (" + mN.n + " items; difficulty easy/medium/hard = " + mN.tiers.join("/") + "; 1 whole-paper review)",
  "",
  "Open either file in any web browser (desktop or tablet). No software or source code is needed.",
  "Every pack starts completely blank: no decision, reviewer name or comment is pre-filled, and none has been made by the authors.",
  "Decisions save in the browser as the reviewer works; press 'Export my decisions' to download a CSV and a JSON file and return BOTH.",
  "The exports carry the reviewer's name and capacity, the pack name and a pack fingerprint (which identifies the exact content reviewed), and one row per item identifier.",
  "The validator must be independent of the authors. Claude's own checks are not independent validation, and nothing in either pack has been validated.",
  "See ANGEL_CSSE_FORM_B_VALIDATION_DISTRIBUTION.md for distribution instructions and the evidence needed to approve Form B.",
].join(String.fromCharCode(10)) + String.fromCharCode(10));
console.log("english decision points:", eN, "| maths items:", mN.n, mN.tiers.join("/"));
