// Generates ANGEL_CSSE_WRITING_NARRATIVE_ASSET_CONTRACTS.md: the educational storyboard + integration contract for each
// narrative Writing picture. Writes a document only; publishes and promotes nothing.
import fs from "node:fs";
import { CSSE_WRITING_EXPANSION } from "../lib/ali/questionFactory/csseWritingExpansion.ts";

const sql257 = fs.readFileSync("supabase/migrations/257_writing_picture_narrative_replacement_practice_content.sql", "utf8");
const treeStart = sql257.indexOf('$json${"id":"eng-practice-writing-picturenarrative-treehouselantern-01"');
const tree = JSON.parse(sql257.slice(treeStart + 6, sql257.indexOf("$json$", treeStart + 6)));
const csSvg = fs.readFileSync("public/mock-assets/q2-picture-narrative/cornershop-v1.svg", "utf8");
const csAlt = csSvg.match(/<desc id="cornerShopDesc">([^<]+)<\/desc>/)[1].trim();
const exp = (id) => CSSE_WRITING_EXPANSION.find((p) => p.id === id);

const A = [
  {
    key: "treehouse", title: "The Treehouse Lantern", id: "eng-practice-writing-picturenarrative-treehouselantern-01", asset: "/practice-assets/writing-picture-narrative/treehouselantern-v1.svg",
    alt: tree.stimulus.altText, footholds: ["lantern lit in daylight", "raised rope ladder", "open bag with spilled compass, torch and paper", "two sets of footprints (one in, one away)", "magpie watching the window"],
    status: "LIVE in Practice (approved benchmark). Final-art pipeline decision outstanding; no change made.", destination: "Practice (live)",
    purpose: "The approved benchmark: a picture that generates events, decisions, relationships, questions and consequences, not just objects to describe.",
    directions: ["Mystery of who is in the treehouse.", "Two children, two sets of footprints, one secret.", "The magpie as a witness.", "A rescue or a lost-and-found story.", "A family story about whose bag it is."],
  },
  {
    key: "library", title: "After Closing Time", id: "eng-csse-writing-picturenarrative-afterclosing-01", asset: "/practice-assets/writing-picture-narrative/libraryafterclosing-v1.svg",
    footholds: exp("eng-csse-writing-picturenarrative-afterclosing-01").narrativeFootholds, status: "Educationally approved in principle. Candidate only (migration 268 NOT applied). Not published.", destination: "Practice (pending)",
    purpose: "An intruder or visitor has left evidence of purpose (muddy trail, key in an open book, a book pulled out of line, a torch left shining). The key is a physical object that creates a goal. The obvious reading is 'a burglar'; the key and the single misplaced book lift a good writer above it.",
    directions: ["Mystery: someone climbed in for a particular book, and the key opens something hidden in the school.", "Fantasy: the book is a doorway, the key is the way in, and the night is when it opens.", "Realistic: a pupil locked out of their own project slipped in to retrieve it and must explain in the morning.", "Humour: the librarian's cat, the ladder and the torch are the culprit.", "Moral dilemma: the finder discovers who it was and must decide whether to tell."],
  },
  {
    key: "station", title: "The Station Clock", id: "eng-csse-writing-picturenarrative-stationclock-01", asset: "/practice-assets/writing-picture-narrative/stationclock-v1.svg",
    footholds: exp("eng-csse-writing-picturenarrative-stationclock-01").narrativeFootholds, status: "Educationally approved in principle. Candidate only (migration 268 NOT applied). Not published.", destination: "Practice (pending)",
    purpose: "The picture implies something has just gone wrong or been left unfinished (a departure and what was left). Weakness to preserve in any final art: stopped clock plus lone suitcase is a familiar mystery pattern; the scarf and the circled ticket give less common routes and must remain visible.",
    directions: ["Mystery: the suitcase belongs to someone who is not who they claim to be, and the watcher has been waiting for them.", "Family drama: a child missed the train on purpose to stay behind with the grandparent who is still on the platform.", "Gentle comedy: a disorganised traveller runs for the train, loses the scarf and the tag, and has to chase it by taxi.", "Time story: the stopped clock is why everyone is late, and the station-master has to decide whether to fix it or leave it.", "Reflective: the watcher is the person left behind, and the story is about saying goodbye."],
  },
  {
    key: "bus", title: "The Last Bus", id: "eng-csse-writing-picturenarrative-lastbus-01", asset: "/practice-assets/writing-picture-narrative/snowbusshelter-v1.svg",
    footholds: exp("eng-csse-writing-picturenarrative-lastbus-01").narrativeFootholds, status: "Educationally approved in principle. Candidate only (migration 268 NOT applied). Not published.", destination: "Practice (pending)",
    purpose: "Clues that disagree (a parcel with no readable address, a pinned mitten and hurried note, footprints that go in but not out, a bus with a blank sign, a watcher in a lit window), with a deadline built in: the bus is arriving. Weakness to preserve: 'footprints in but not out' is the strongest hook and the mitten and note carry little detail at phone width; both must read clearly at small size.",
    directions: ["Quiet adventure: a child, lost in the snow, follows the last bus to find the way home.", "Kindness story: the parcel is a gift that has to reach someone tonight; a stranger helps.", "Mystery: the blank sign means the bus is not the one it seems; the child decides whether to board.", "Family story: the figure at the window is a grandparent waiting for someone who has not arrived.", "Realistic everyday: a child is delivering the parcel and has lost a mitten on the way."],
  },
  {
    key: "cornershop", title: "The Corner Shop", id: "eng-q2-picturenarrative-cornershop (proposed)", asset: "/mock-assets/q2-picture-narrative/cornershop-v1.svg",
    alt: csAlt, footholds: ["a CLOSED sign over lit rooms", "a person's shadow on the blind", "door open a few centimetres with a bell above it", "a trail of wrapped sweets from the doorway", "a broken jar just inside", "a dropped bicycle with the front wheel still spinning", "a dog waiting by the kerb"],
    status: "Sealed Mock Form B Q2 candidate. NOT registered, NOT published. Must never enter Practice.", destination: "Mock Form B (sealed)",
    purpose: "Sealed Form B picture-led narrative with the same evidence-and-footholds standard as the Treehouse, so Form B Q2 is not weaker than Form A's old-shed picture.",
    directions: ["Mystery: whose bicycle is it, and who is behind the blind?", "Comic: the dog escaped, ran in, knocked over the jar and the owner is chasing it.", "Realistic: a child dropped in for sweets, took fright at something and ran.", "Kindness: the shopkeeper has stayed late to prepare something for the community.", "Moral dilemma: a child sees the trail of sweets and has to choose whether to tell."],
  },
];

const md = [];
md.push("# CSSE Writing: narrative picture assets as EDUCATIONAL STORYBOARDS (2026-10-08)");
md.push("");
md.push("**Decision applied.** The developer-drawn vector illustrations (library, treehouse, station, snowy bus-stop, Corner Shop) are **educational storyboards** unless specifically approved otherwise. They define what a final picture must show and enable; they are not final production artwork. **No further engineering effort is being spent on polishing them, nothing here is published or promoted, and a specialist image-generation or provider pipeline will be evaluated separately.** This does not apply to mathematical visuals, which stay deterministic and exact.");
md.push("");
md.push("Each entry below is the contract a replacement picture must meet. Generated by `scripts/generate-writing-narrative-asset-contracts.mjs` from the stored prompt data.");
md.push("");
md.push("## Common integration contract (all five)");
md.push("");
md.push("- **Stored prompt:** `\"Write a story based on the picture below.\"` (neutral, identical for every picture; objects are named only in the checklist and the alt text, never an outcome).");
md.push("- **Stimulus shape:** `{ type: \"image\", altText, imageAssetUrl }`, rendered by the existing `ImageStimulus` / Writing image renderer. **Swapping artwork changes `imageAssetUrl` only** (and the file); no schema, renderer, or marking change.");
md.push("- **Aspect ratio and size:** **4:3 landscape**, authored at 800 x 600 (SVG viewBox) or a raster of at least **1600 x 1200** (2x), displayed responsively to the container width. Must remain legible at **360 px width** (a phone): every named foothold must be identifiable at that size.");
md.push("- **Formats:** SVG preferred; otherwise PNG or WebP under 400 KB. No gradients-as-decoration requirement, no purple, no generic stock look. **No text inside the image** except where an object is the foothold (for example the CLOSED sign), and that text must also be in the alt text.");
md.push("- **Accessibility:** the alt text below is the contract. It describes only what is visible, states no outcome, and must be valid for the final picture unchanged. If the final picture differs, the alt text is re-written and re-approved.");
md.push("- **Naming:** `<slug>-v<n>.<ext>`; a replacement is `-v2` in the same folder, never an overwrite of `-v1`. Practice assets live under `public/practice-assets/writing-picture-narrative/`; the sealed Mock asset under `public/mock-assets/q2-picture-narrative/` and is never referenced from Practice code.");
md.push("- **Provenance:** original work only; a final artwork needs a written statement of how it was produced and confirmation that no third party holds rights. If a generative provider is used, the provider's terms, the prompt used, and a human check for unintended content (people's faces, text, real places) are recorded.");
md.push("- **Educational acceptance test for any final picture:** it must generate events, decisions, relationships, open questions and consequences (not merely objects to describe), support at least five plausible narratives (listed per picture), and not point to one predetermined story.");
md.push("");
for (const a of A) {
  const p = exp(a.id);
  const alt = a.alt ?? p?.stimulus?.altText;
  md.push(`## ${a.title}`);
  md.push("");
  md.push(`- **Asset identifier:** \`${a.asset}\``);
  md.push(`- **Prompt id:** \`${a.id}\``);
  md.push(`- **Destination:** ${a.destination}`);
  md.push(`- **Status:** ${a.status}`);
  md.push(`- **Exact learner-facing prompt:** "Write a story based on the picture below."`);
  md.push(`- **Educational purpose:** ${a.purpose}`);
  md.push(`- **Narrative cues the picture must show (and keep legible at 360 px):** ${a.footholds.join("; ")}.`);
  md.push(`- **Alternative plausible story directions:**`);
  for (const d of a.directions) md.push(`  - ${d}`);
  md.push(`- **Accessibility description (alt text):** ${alt}`);
  md.push(`- **Required dimensions:** 4:3, 800 x 600 SVG or at least 1600 x 1200 raster.`);
  md.push("");
}
md.push("## What is deliberately not done");
md.push("");
md.push("- No migration applied (268 and the 269 promotion template are untouched); no picture published, promoted or registered; the Corner Shop is not referenced from any code path.");
md.push("- No repeated regeneration or polishing of the current drawings.");
md.push("- Form B's Writing Q2 stays **blocked on final artwork approval**; Form B cannot be completed or activated until it is resolved.");
fs.writeFileSync("ANGEL_CSSE_WRITING_NARRATIVE_ASSET_CONTRACTS.md", md.join("\n") + "\n");
console.log("written", md.length, "lines");
