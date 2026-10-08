#!/usr/bin/env node
/**
 * Generates the Founder review pack for the seven proposed Writing prompts (migration 268 candidates):
 *   scripts/output/csse-writing-expansion/review-pack.html   (self-contained: drawings are embedded, open in any browser)
 *   ANGEL_CSSE_WRITING_PROMPTS_FOUNDER_REVIEW_PACK.md        (text version)
 * Read-only: registers nothing. The prompt text, family ids, checklists and alt text come straight from
 * lib/ali/questionFactory/csseWritingExpansion.ts (the source of migration 268), so the pack cannot drift from it.
 * The educational judgements below are authored and are what the Founder is asked to approve or reject.
 *
 * Run: npx tsx scripts/generate-csse-writing-review-pack.mjs
 */
import fs from "node:fs";
import { CSSE_WRITING_EXPANSION } from "../lib/ali/questionFactory/csseWritingExpansion.ts";

const esc = (s) => String(s).replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");

// Existing Writing topics (live 2026-10-08), used for the "variation from existing" comparison.
const EXISTING = {
  practiceReflective: ["Your Favourite Place to Be", "An Invented Place", "Pocket Money or Helping Anyway?", "A Mistake You Learned From", "Somewhere New", "Someone Who Has Made a Difference to You", "Something You Would Like to Learn"],
  practicePicture: ["The Treehouse Lantern (approved)"],
  negative: "The Riverboat at Dawn (REJECTED: 'there is nothing to write with the picture')",
};


// Distinct story directions each picture supports (the "multiple plausible narratives" check). A picture passes only if
// at least four genuinely different stories (different genre, tone or central character) can be told from it.
const NARRATIVES = {
  "eng-csse-writing-picturenarrative-stationclock-01": [
    "Mystery: the suitcase belongs to someone who is not who they claim to be, and the watcher has been waiting for them.",
    "Family drama: a child missed the train on purpose to stay behind with the grandparent who is still on the platform.",
    "Gentle comedy: a disorganised traveller runs for the train, loses the scarf and the tag, and has to chase it by taxi.",
    "Time story: the stopped clock is why everyone is late, and the station-master has to decide whether to fix it or leave it.",
    "Reflective: the watcher is the person left behind, and the story is about saying goodbye.",
  ],
  "eng-csse-writing-picturenarrative-lastbus-01": [
    "Quiet adventure: a child, lost in the snow, follows the last bus to find the way home.",
    "Kindness story: the parcel is a gift that has to reach someone tonight; a stranger helps.",
    "Mystery: the blank sign means the bus is not the one it seems; the child decides whether to board.",
    "Family story: the figure at the window is a grandparent waiting for someone who has not arrived.",
    "Realistic everyday: a child is delivering the parcel and has lost a mitten on the way.",
  ],
  "eng-csse-writing-picturenarrative-afterclosing-01": [
    "Mystery: someone climbed in for a particular book, and the key opens something hidden in the school.",
    "Fantasy: the book is a doorway, the key is the way in, and the night is when it opens.",
    "Realistic: a pupil locked out of their own project slipped in to retrieve it and must explain in the morning.",
    "Humour: the librarian's cat, the ladder and the torch are the culprit.",
    "Moral dilemma: the finder discovers who it was and must decide whether to tell.",
  ],
  "treehouse-benchmark": [
    "Mystery of who is in the treehouse.", "Two children, two sets of footprints, one secret.", "The magpie as a witness.", "A rescue or a lost-and-found story.", "A family story about whose bag it is.",
  ],
  "cornershop-mock": [
    "Mystery: whose bicycle is it, and who is behind the blind?",
    "Comic: the dog escaped, ran in, knocked over the jar and the owner is chasing it.",
    "Realistic: a child dropped in for sweets, took fright at something and ran.",
    "Kindness: the shopkeeper has stayed late to prepare something for the community.",
    "Moral dilemma: a child sees the trail of sweets and has to choose whether to tell.",
  ],
};

const REVIEW = {
  "eng-csse-writing-proudofother-01": {
    purpose: "Reflective writing that turns outward: the writer must describe someone else's achievement and explain their own feeling. Practises choosing one real moment, giving concrete detail, and explaining WHY (the 'reflective' half of CSSE Question 1).",
    planning: "Which one moment? Who was involved and what exactly happened? What was said or seen? Why did it matter to them and to me? How do I want to end?",
    variation: "Existing reflective prompts are about the writer's own experience (a mistake, a place, a person who influenced them). This one is about a feeling for another person's success, a different emotional stance and a different set of examples (sports day, a sibling's first bike, a friend's recital).",
    stage: "Year 5 onward (Main preparation). Near-entry difficulty: every child has an example.",
  },
  "eng-csse-writing-onefriendmany-01": {
    purpose: "Discursive writing: weigh two views and give a personal position with a reason and an example. Practises stating a view early, supporting it with experience, and acknowledging a counter-point.",
    planning: "Which view do I hold (or both, in some situations)? What is my best real example? What would someone who disagrees say? How do I end so my view is clear?",
    variation: "Existing discursive prompts are pocket money, screen time (Mock-reserve) and cooking (Mock-reserve). This is about relationships rather than rules or chores, so the evidence is personal experience, not family policy.",
    stage: "Year 5-6 (Main to Final). Medium difficulty: needs a balanced argument.",
  },
  "eng-csse-writing-tradition-01": {
    purpose: "Descriptive-reflective writing about a family or community tradition. Practises specific sensory detail and explaining why something matters. Inclusive by design: any celebration, weekly habit or special meal qualifies.",
    planning: "Which one tradition? What happens, step by step? Which one sensory detail will I include? Why does it matter to me?",
    variation: "Existing descriptive prompts centre on a place (favourite place, meaningful place, new place). This one is an event or routine, so it exercises time-ordered description rather than place description.",
    stage: "Year 4-5 (Foundation to Main). Easiest of the four: concrete, familiar, low risk.",
  },
  "eng-csse-writing-wintakepart-01": {
    purpose: "Discursive writing on a well-known saying. Practises agreeing, disagreeing or qualifying, with a real example and one consideration against the writer's own view.",
    planning: "Do I agree, disagree, or 'it depends'? Which real example (a race, a game, something I watched)? What is the strongest point against my view? How do I conclude?",
    variation: "Existing opinion prompts are about specific policies or habits. This one starts from a saying, so the writer must interpret it before arguing, a different first step.",
    stage: "Year 5-6 (Main to Final). Medium to hard: needs a nuanced position.",
  },
  "eng-csse-writing-picturenarrative-stationclock-01": {
    purpose: "Picture-led narrative where the picture implies something has just gone wrong or been left unfinished. Practises choosing one direction, a character, a turning point and an ending that uses the picture's evidence.",
    planning: "Which two or three details will my story use? Who is my main character (the watcher, the owner of the suitcase, the person who ran for the train)? What has just happened? What is the turning point? How does it end?",
    variation: "Treehouse Lantern is a garden at midday with a mystery about who is inside. This is a railway platform at late afternoon about someone who missed, left or was left behind; a different setting, light, and kind of mystery (a departure and what was left).",
    stage: "Year 6 (Final preparation). Hard: open-ended, many directions.",
    events: "A train has just left. The clock stopped at ten past five. The suitcase was left. The scarf was caught as someone hurried. A figure is still at the edge.",
    decisions: "Does the watcher open the suitcase or wait? Does the owner come back or not? Does someone run after the train?",
    relationships: "Watcher and owner of the suitcase (strangers, relatives, friends?). The person who circled a time on the ticket and the person left behind.",
    questions: "Why did the clock stop? Who owns the suitcase and why leave it? Why is the tag half torn off? Who is the figure watching, and why did they stay?",
    consequences: "A missed connection, a lost chance, a secret in the suitcase, a reunion or a goodbye.",
    weakness: "Stopped clock plus lone suitcase is a familiar 'mystery' pattern, so many children may choose the same story (the suitcase has a secret). The scarf and the circled ticket give less common routes.",
  },
  "eng-csse-writing-picturenarrative-lastbus-01": {
    purpose: "Picture-led narrative built on clues that disagree: a parcel with no readable address, a pinned mitten and hurried note, footprints that go in but not out, a bus with a blank sign, someone watching from a window.",
    planning: "Which clue is my starting point? Who left the parcel and who is the child with the mitten? What does the note say? What is the turning point when the bus arrives? Who is watching and why?",
    variation: "Different from the Treehouse (garden, daytime) and the station (departure): winter dusk, a child-sized clue (mitten), a parcel to deliver, and a watcher who is also a possible character. It is the only one with a deadline built in: the bus is arriving.",
    stage: "Year 5-6 (Main to Final). Medium to hard.",
    events: "Someone small went into the shelter and has not come out. A parcel was left. A bus is arriving with no destination shown. Someone is watching from a lit window.",
    decisions: "Does the child take the parcel? Do they get on a bus that shows no destination? Does the watcher come out?",
    relationships: "The child and the person watching; whoever sent the parcel; the bus driver.",
    questions: "Where did the small footprints go? Who is the parcel for? What does the hurried note say? Why is the bus sign blank?",
    consequences: "A delivery completed, someone found, a warning understood or ignored, a journey begun.",
    weakness: "Footprints 'in but not out' is the strongest hook; make sure a child can see it at a small size. The mitten and note carry little visual detail at phone width.",
  },
  "eng-csse-writing-picturenarrative-afterclosing-01": {
    purpose: "Picture-led narrative where an intruder (or a visitor) has left evidence of purpose: muddy trail from an open window to a table, a key in an open book, a book pulled out of line, a torch left shining.",
    planning: "Who came in and why? What does the key open? Which detail is my first sentence? What does my character find, decide or lose? How does it end?",
    variation: "The only indoor, night scene; it implies a deliberate act (a search), and it has a physical object (a key) that naturally creates a goal. Treehouse and station are open-air daytime scenes about arrivals and departures.",
    stage: "Year 6 (Final preparation). Hard: strong hooks but the 'burglar' reading is the obvious one and a good writer should avoid it.",
    events: "Someone climbed in through the window. They went straight to the table. A book was taken down and a key left or found. The torch was dropped or left on purpose.",
    decisions: "Does the character who finds the scene tell someone? Do they follow the footprints out? Do they take the key?",
    relationships: "The visitor and the librarian (or the narrator); whoever the key belongs to.",
    questions: "What does the key open? Why that book? Who left the window open? Why leave the torch shining?",
    consequences: "A hidden thing found, a secret revealed, a friendship tested, a mistake discovered.",
    weakness: "The obvious reading is 'a burglar'. The key in the book and the single misplaced book are what lift it above that, which is why the drawing makes them prominent.",
  },
};

const images = {};
for (const p of CSSE_WRITING_EXPANSION) {
  if (p.stimulus) {
    const f = "public" + p.stimulus.imageAssetUrl;
    images[p.id] = fs.readFileSync(f, "utf8").replace(/<\?xml[^>]*\?>/, "");
  }
}

const treehouse = fs.readFileSync("public/practice-assets/writing-picture-narrative/treehouselantern-v1.svg", "utf8");

const md = [];
md.push("# Writing prompts: FINAL image-and-prompt review pack (7 Practice candidates + 1 sealed Mock candidate; migration 268 NOT applied)", "");
md.push("**Nothing is registered, applied or published.** Open `scripts/output/csse-writing-expansion/review-pack.html` in a browser to **see the three drawings** (the text below is the same content without images).", "");
md.push("**Your decision per prompt:** approve / amend / reject. Picture-led prompts also need your **visual approval of the drawing**. Rejections stay candidates.", "");
md.push("**Standard applied (Treehouse Lantern):** the picture must generate events, decisions, relationships, questions or consequences; it must not merely give the writer objects to describe. The rejected Riverboat remains negative evidence and is not reintroduced.", "");
md.push("**Treehouse benchmark cues (approved):** a lantern lit in daylight; a raised rope ladder; an open bag with spilled compass, torch and paper; two sets of footprints (one in, one away); a magpie watching the window.", "");
md.push("**Formative vs validated:** these are practice prompts with *formative* AI feedback. They create no validated assessment evidence and no mastery (Writing is excluded from automatic mastery).", "");

const html = [];
html.push(`<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>Angel 11+ Writing prompts: Founder review pack</title><style>
:root{--navy:#14284b;--ink:#1d2b44;--blue:#2457c5;--ivory:#faf8f2;--line:#d9d4c7;--sky:#eaf0fb}
body{margin:0;background:var(--ivory);color:var(--ink);font:16px/1.5 system-ui,Segoe UI,Arial,sans-serif}
main{max-width:980px;margin:0 auto;padding:24px 16px 64px}
h1{color:var(--navy);font-size:26px}h2{color:var(--navy);font-size:21px;margin-top:0}
.card{background:#fff;border:1px solid var(--line);border-radius:12px;padding:20px;margin:20px 0}
.tag{display:inline-block;background:var(--sky);color:var(--navy);border-radius:6px;padding:2px 8px;font-size:13px;margin-right:6px}
.tag.pic{background:#e6f1ea}dt{font-weight:600;color:var(--navy);margin-top:10px}dd{margin:2px 0 0}
.prompt{border-left:4px solid var(--blue);background:var(--sky);padding:10px 14px;border-radius:0 8px 8px 0}
.pair{display:grid;grid-template-columns:1fr;gap:12px}@media(min-width:760px){.pair{grid-template-columns:1fr 1fr}}
.img svg{width:100%;height:auto;border:1px solid var(--line);border-radius:8px}.cap{font-size:13px;color:#51607a}
.bad{border-left:4px solid #b3412e;background:#fbeeea;padding:10px 14px;border-radius:0 8px 8px 0}
ul{margin:4px 0 4px 20px;padding:0}
</style></head><body><main>`);
html.push(`<h1>Writing prompts: final image-and-prompt review pack</h1><p>Each picture is shown with its exact learner prompt, as one educational unit, with the stories it supports and a leading-ness check. The Treehouse Lantern (approved, live) is the benchmark.</p>
<p><strong>Seven candidates. Nothing is registered, applied or published.</strong> Decide per prompt: approve, amend or reject. For each picture, judge the drawing itself.</p>
<p><strong>Standard (Treehouse Lantern):</strong> a picture must generate events, decisions, relationships, questions or consequences, not just objects to describe. The rejected Riverboat is negative evidence.</p>
<div class="card"><h2>Benchmark: The Treehouse Lantern (approved)</h2><div class="img">${treehouse}</div>
<p class="cap">Cues: a lantern lit in daylight; a raised rope ladder; an open bag with a compass, torch and paper spilled out; two sets of footprints (one in, one away); a magpie watching the window.</p></div>
<p><strong>Formative, not validated:</strong> these are practice prompts with formative AI feedback. They produce no validated assessment evidence and no mastery.</p>`);

let n = 0;
for (const p of CSSE_WRITING_EXPANSION) {
  n++;
  const r = REVIEW[p.id];
  if (!r) throw new Error("no review data for " + p.id);
  const picture = p.skill === "QT-WC-01b";
  const typeLabel = picture ? "Picture-led narrative (QT-WC-01b)" : "Reflective / discursive (QT-WC-01a)";
  const variationVs = picture ? `${EXISTING.practicePicture.join("; ")}; rejected: ${EXISTING.negative}` : EXISTING.practiceReflective.join("; ");

  md.push(`## ${n}. ${p.title}`, "");
  md.push(`- **Family ID:** \`${p.familyId}\` (prompt id \`${p.id}\`)`);
  md.push(`- **Type:** ${typeLabel}`);
  md.push(`- **Exact learner prompt:** "${p.prompt}"`);
  md.push(`- **Educational purpose:** ${r.purpose}`);
  md.push(`- **Planning opportunities:** ${r.planning}`);
  md.push(`- **Variation from existing Writing prompts:** ${r.variation}`);
  md.push(`- **Intended difficulty / stage:** ${r.stage}`);
  md.push(`- **Checklist shown to the learner:** ${p.checklist.map((c) => `"${c}"`).join("; ")}`);
  if (picture) {
    md.push(`- **Image:** \`${p.stimulus.imageAssetUrl}\` (view it in the HTML pack)`);
    md.push(`- **Alt text:** ${p.stimulus.altText}`);
    md.push(`- **Cues named:** ${p.narrativeFootholds.join("; ")}`);
    md.push(`- **Events it implies:** ${r.events}`);
    md.push(`- **Decisions it offers:** ${r.decisions}`);
    md.push(`- **Relationships it suggests:** ${r.relationships}`);
    md.push(`- **Questions it leaves open:** ${r.questions}`);
    md.push(`- **Consequences that could follow:** ${r.consequences}`);
    md.push(`- **Plausible stories it supports (${NARRATIVES[p.id].length}):** ${NARRATIVES[p.id].join(" / ")}`);
    md.push(`- **Leading-ness check:** prompt is the neutral "Write a story based on the picture below."; the checklist names objects to ground the story in but no outcome; the alt text describes only what is visible. Verdict: the task does not point to one predetermined story.`);
    md.push(`- **Honest weakness:** ${r.weakness}`);
  }
  md.push("");

  html.push(`<section class="card"><h2>${n}. ${esc(p.title)}</h2><p><span class="tag${picture ? " pic" : ""}">${esc(typeLabel)}</span><span class="tag">${esc(p.familyId)}</span></p>`);
  html.push(`<div class="prompt"><strong>Exact learner prompt:</strong> ${esc(p.prompt)}</div>`);
  if (picture) html.push(`<div class="pair"><div class="img">${images[p.id]}<p class="cap">Drawing for approval (original vector art). Alt text: ${esc(p.stimulus.altText)}</p></div><div><dl>`);
  else html.push("<dl>");
  const rows = [["Educational purpose", r.purpose], ["Planning opportunities", r.planning], ["Variation from existing prompts", r.variation + " (Existing: " + variationVs + ")"], ["Intended difficulty / stage", r.stage]];
  if (picture) rows.push(["Cues named", p.narrativeFootholds.join("; ")], ["Events it implies", r.events], ["Decisions it offers", r.decisions], ["Relationships it suggests", r.relationships], ["Questions it leaves open", r.questions], ["Consequences that could follow", r.consequences]);
  for (const [k, v] of rows) html.push(`<dt>${esc(k)}</dt><dd>${esc(v)}</dd>`);
  html.push("</dl>");
  if (picture) html.push(`<p><strong>Plausible stories it supports:</strong></p><ul>${NARRATIVES[p.id].map((n) => `<li>${esc(n)}</li>`).join("")}</ul><p><strong>Leading-ness check:</strong> the prompt is neutral, the checklist names objects but no outcome, the alt text describes only what is visible. The task does not point to one predetermined story.</p><div class="bad"><strong>Honest weakness:</strong> ${esc(r.weakness)}</div></div></div>`);
  html.push(`<p><strong>Learner checklist:</strong></p><ul>${p.checklist.map((c) => `<li>${esc(c)}</li>`).join("")}</ul>`);
  html.push(`<p><strong>Your decision:</strong> approve / amend / reject${picture ? " (and approve / amend / reject the drawing)" : ""}</p></section>`);
}

// ---- Sealed Mock Form B Q2 (not a Practice prompt): Corner Shop, paired image + exact prompt ----
const csSvg = fs.readFileSync("public/mock-assets/q2-picture-narrative/cornershop-v1.svg", "utf8");
const csAlt = csSvg.match(/<desc[^>]*>([\s\S]*?)<\/desc>/)[1].trim();
const csChecklist = [
  "Write at least six sentences",
  "Base your story genuinely on what the picture shows, not an unrelated idea",
  "Include a clear turning point or moment of change, not just a description of the scene",
  "Use precise, well-chosen vocabulary",
  "Organise your writing into clear paragraphs",
  "Check spelling and punctuation carefully",
];
md.push("## Sealed Mock Form B Q2 (not Practice): The Corner Shop", "");
md.push("- **Prompt id (proposed):** `eng-q2-picturenarrative-cornershop`; **type:** picture-led narrative; **Mock only, sealed from Practice**");
md.push('- **Exact learner prompt:** "Write a story based on the picture below."');
md.push(`- **Checklist (same six items as the live Mock Q2):** ${csChecklist.map((c) => `"${c}"`).join("; ")}`);
md.push(`- **Image:** \`public/mock-assets/q2-picture-narrative/cornershop-v1.svg\` (view it in the HTML pack). **Alt text:** ${csAlt}`);
md.push(`- **Plausible stories it supports (${NARRATIVES["cornershop-mock"].length}):** ${NARRATIVES["cornershop-mock"].join(" / ")}`);
md.push("- **Leading-ness check:** neutral prompt; objects named only in the alt text; no outcome implied. Verdict: multiple plausible narratives.");
md.push("- **Status:** draft awaiting your visual and educational approval. Registers nowhere until approved; must never enter Practice.", "");
html.push(`<section class="card"><h2>Sealed Mock Form B Q2 (not Practice): The Corner Shop</h2><p><span class="tag pic">Picture-led narrative, Mock only</span><span class="tag">eng-q2-picturenarrative-cornershop (proposed)</span></p><div class="prompt"><strong>Exact learner prompt:</strong> Write a story based on the picture below.</div><div class="pair"><div class="img">${csSvg}<p class="cap">Drawing for approval. Alt text: ${esc(csAlt)}</p></div><div><p><strong>Plausible stories it supports:</strong></p><ul>${NARRATIVES["cornershop-mock"].map((n) => `<li>${esc(n)}</li>`).join("")}</ul><p><strong>Leading-ness check:</strong> neutral prompt; no outcome implied.</p><p><strong>Checklist:</strong></p><ul>${csChecklist.map((c) => `<li>${esc(c)}</li>`).join("")}</ul></div></div><p><strong>Your decision:</strong> approve / amend / reject the drawing and the prompt. Never to enter Practice.</p></section>`);
html.push("</main></body></html>");

fs.mkdirSync("scripts/output/csse-writing-expansion", { recursive: true });
fs.writeFileSync("scripts/output/csse-writing-expansion/review-pack.html", html.join("\n"));
fs.writeFileSync("ANGEL_CSSE_WRITING_PROMPTS_FOUNDER_REVIEW_PACK.md", md.join("\n"));
console.log("written; prompts:", CSSE_WRITING_EXPANSION.length);
