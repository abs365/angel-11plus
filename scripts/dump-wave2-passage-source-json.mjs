import { EI003_WAVE2_PASSAGES } from "../lib/ali/questionFactory/ei003Wave2Passages.ts";
import fs from "node:fs";
const obj = {};
for (const p of EI003_WAVE2_PASSAGES) obj[p.id] = p.text;
fs.writeFileSync(new URL("./output/wave2-passage-source-dump.json", import.meta.url), JSON.stringify(obj));
console.log("wrote", Object.keys(obj).length, "passages to scripts/output/wave2-passage-source-dump.json");
