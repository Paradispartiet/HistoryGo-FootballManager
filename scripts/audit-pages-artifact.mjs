#!/usr/bin/env node
// Kontrollerer at produksjonsartefakten i `_site` faktisk inneholder det den
// må for at spillet skal starte i nettleseren.
//
// Skriptet STAGER SELV når `_site` mangler. Grunnen er husregelen resten av
// suiten hviler på: hvert skript kjøres alene og exit-koden er fasiten. Dette
// var det eneste av 95 som brøt den — det leste et katalogtre som bare finnes
// etter `npm run stage:pages`, så en suitekjøring skript for skript ga falskt
// rødt her mens CI var grønn, fordi CI kjørte de to som ett steg.
//
// En vakt som bare virker i én bestemt rekkefølge er ikke en vakt man kan
// stole på. Staging er ren og idempotent (den rydder `_site` og kopierer på
// nytt), så det koster ingenting å gjøre den til en forutsetning skriptet
// selv oppfyller.
import fs from "node:fs";
import path from "node:path";
import { execFileSync } from "node:child_process";

const root = path.resolve(new URL("..", import.meta.url).pathname);
const site = path.join(root, "_site");
const required = ["index.html", "style.css", "src/app.js", "src/app-manager-engine-bridge.js", "dist/index.js", "data/football_team_merits.example.json"];

let staged = false;
if (!fs.existsSync(site)) {
  execFileSync(process.execPath, [path.join(root, "scripts/stage-pages-artifact.mjs")], { stdio: "inherit" });
  staged = true;
}

const missing = required.filter((entry) => !fs.existsSync(path.join(site, entry)));
if (missing.length) {
  console.error(`Pages-artifact mangler: ${missing.join(", ")}`);
  process.exit(1);
}
const html = fs.readFileSync(path.join(site, "index.html"), "utf8");
for (const runtimePath of ["style.css", "src/app.js"]) {
  if (!html.includes(runtimePath)) throw new Error(`index.html laster ikke ${runtimePath}`);
}
console.log(JSON.stringify({ ok: true, staged, required }, null, 2));
