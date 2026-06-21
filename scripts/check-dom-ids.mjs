#!/usr/bin/env node
// Read-only DOM-id-sjekk: verifiserer at alle `document.querySelector("#id")`-
// oppslag i src/app.js peker på en id som faktisk finnes i index.html.
// Fanger den vanligste bruddrisikoen ved UI-opprydding: at en seksjon
// omdøpes/foldes og mister en id som JS-en leser.
//
// Standardbibliotek, ingen avhengigheter. Exit 1 ved manglende id, 0 ellers.

import { readFileSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join } from "node:path";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const html = readFileSync(join(root, "index.html"), "utf8");
const app = readFileSync(join(root, "src/app.js"), "utf8");

// Alle id-attributter i index.html.
const htmlIds = new Set();
for (const match of html.matchAll(/\sid="([^"]+)"/g)) {
  htmlIds.add(match[1]);
}

// Alle id-selektorer som app.js slår opp via querySelector("#id").
// (elements-kartet og øvrige oppslag bruker dette mønsteret.)
const queried = new Map(); // id -> antall oppslag
for (const match of app.matchAll(/querySelector\(\s*["'`]#([A-Za-z0-9_-]+)["'`]\s*\)/g)) {
  const id = match[1];
  queried.set(id, (queried.get(id) || 0) + 1);
}

const missing = [];
for (const id of queried.keys()) {
  if (!htmlIds.has(id)) missing.push(id);
}

if (missing.length > 0) {
  console.error("✗ DOM-id-sjekk feilet: app.js slår opp id-er som ikke finnes i index.html:");
  for (const id of missing.sort()) {
    console.error(`  - #${id}`);
  }
  console.error(
    "\nLa til/fjernet du en seksjon? Behold id-en, eller oppdater oppslaget i src/app.js."
  );
  process.exit(1);
}

console.log(
  `✓ DOM-id-sjekk OK: ${queried.size} unike id-oppslag i app.js finnes alle i index.html ` +
    `(${htmlIds.size} id-er totalt i index.html).`
);
process.exit(0);
