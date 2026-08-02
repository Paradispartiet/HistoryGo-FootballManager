// Kjører CI faktisk hele suiten?
//
// CLAUDE.md sier at ci.yml er «sikkerhetsnettet som kjører HELE suiten». Det
// gjorde den ikke: 15 av 48 skript sto aldri i workflowen — blant dem hele
// ligavakten. De kjørte bare fordi noen kjørte dem for hånd.
//
// Det er samme feilklasse som resten av prosjektet: en påstand ingen målte.
// Et nytt sim-skript legges til i package.json, og det er lett å glemme
// workflowen — og da feiler ingenting, det bare testes ikke.
import assert from "node:assert/strict";
import fs from "node:fs";

const pkg = JSON.parse(fs.readFileSync(new URL("../package.json", import.meta.url), "utf8"));
const ci = fs.readFileSync(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8");
const pages = fs.readFileSync(new URL("../.github/workflows/pages.yml", import.meta.url), "utf8");

const scripts = Object.keys(pkg.scripts).filter((name) => /^(audit|check|sim):/.test(name));
assert.ok(scripts.length > 0, "fant ingen audit/check/sim-skript i package.json");

// ci.yml er sikkerhetsnettet: hvert eneste skript skal kjøres der.
const missingFromCi = scripts.filter((name) => !ci.includes(`npm run ${name}`));
assert.deepEqual(
  missingFromCi, [],
  `ci.yml kjører ikke hele suiten — mangler: ${missingFromCi.join(", ")}`
);

// pages.yml er kjerneporten før deploy. Den skal IKKE kjøre alt (det ville
// gjort hver deploy treg), men den må kjøre vaktene som beskytter det som
// faktisk publiseres.
const PAGES_GATE = [
  "typecheck", "audit:knowledge", "audit:clubs", "check:syntax", "check:dom-ids",
  "audit:flow", "audit:dead-ends", "audit:historical-opponents", "audit:tournaments",
  "audit:tactics", "build"
];
const missingFromPages = PAGES_GATE.filter((name) => !pages.includes(`npm run ${name}`));
assert.deepEqual(
  missingFromPages, [],
  `pages.yml mangler kjerneporten: ${missingFromPages.join(", ")}`
);

// Og alle skriptene må peke på filer som finnes.
for (const name of scripts) {
  const match = /node\s+(scripts\/[\w.-]+\.mjs)/.exec(pkg.scripts[name]);
  assert.ok(match, `${name} kjører ikke et scripts/*.mjs`);
  assert.ok(
    fs.existsSync(new URL(`../${match[1]}`, import.meta.url)),
    `${name} peker på ${match[1]}, som ikke finnes`
  );
}

console.log(JSON.stringify({
  ok: true,
  skript: scripts.length,
  iCi: scripts.length - missingFromCi.length,
  pagesPort: PAGES_GATE.length
}, null, 2));
