// Syntakssjekk for alle live JS-moduler.
//
// Bakgrunn: en dobbeltdeklarert variabel i src/app.js gjorde at HELE modulen
// ikke parset. Appen så helt riktig ut — den statiske HTML-en rendret som
// vanlig — men ingen handler var koblet på, så ingenting virket. Ingen av de
// andre vaktene fanget det: de leser filene som TEKST og finner strengene de
// leter etter uansett om koden kan kjøres.
//
// Denne vakta parser hver modul med Node. Exit 1 ved syntaksfeil.

import { readdirSync, statSync } from "node:fs";
import { fileURLToPath } from "node:url";
import { dirname, join, relative } from "node:path";
import { execFileSync } from "node:child_process";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");

function collect(dir, out = []) {
  for (const entry of readdirSync(dir)) {
    const full = join(dir, entry);
    if (statSync(full).isDirectory()) {
      // dist/ er kompilert output, node_modules er ikke vårt.
      if (entry === "node_modules" || entry === "dist") continue;
      collect(full, out);
      continue;
    }
    if (entry.endsWith(".js") || entry.endsWith(".mjs")) out.push(full);
  }
  return out;
}

const files = [...collect(join(root, "src")), ...collect(join(root, "scripts"))];
const failures = [];

for (const file of files) {
  try {
    execFileSync(process.execPath, ["--check", file], { stdio: ["ignore", "ignore", "pipe"] });
  } catch (error) {
    const detail = String(error.stderr || error.message)
      .split("\n")
      .filter((line) => line.trim())
      .slice(0, 3)
      .join(" | ");
    failures.push({ file: relative(root, file), detail });
  }
}

console.log("Syntakssjekk: alle live JS-moduler\n");
for (const failure of failures) {
  console.log(`    ✗ ${failure.file}`);
  console.log(`      ${failure.detail}`);
}
console.log(`${files.length - failures.length}/${files.length} moduler parser.`);

if (failures.length > 0) {
  console.error(`\n✗ Syntakssjekk feilet: ${failures.length} modul(er) kan ikke kjøres.`);
  process.exit(1);
}
console.log("\n✓ Syntakssjekk OK: alle moduler parser.");
process.exit(0);
