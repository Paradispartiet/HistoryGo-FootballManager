import fs from "node:fs";
import assert from "node:assert/strict";
const path = "scripts/simulate-player-attributes.mjs";
const text = fs.readFileSync(path, "utf8");
const previous = "  marienlyst_stadion: 0.42,  // Strømsgodset: 34/84 eksklusive uten styrker (40,48 %); tak 42 % etter kildepass 2026-10-18";
const next = "  marienlyst_stadion: 0.37,  // Strømsgodset: 30/84 eksklusive uten styrker (35,71 %); tak 37 % etter fjerde kildepass 2026-10-18";
assert.ok(text.includes(previous), "Marienlyst ratchet has changed unexpectedly");
fs.writeFileSync(path, text.replace(previous, next));
