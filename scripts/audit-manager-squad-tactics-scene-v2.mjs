import fs from "node:fs";

const files = {
  lineup: fs.readFileSync("src/ui/manager-lineup-presentation.js", "utf8"),
  scene: fs.readFileSync("src/ui/manager-squad-tactics-scene-v2.js", "utf8"),
  css: fs.readFileSync("src/ui/manager-squad-tactics-scene-v2.css", "utf8"),
  docs: fs.readFileSync("docs/MANAGER_SQUAD_TACTICS_SCENE_V2.md", "utf8"),
  package: fs.readFileSync("package.json", "utf8"),
  ci: fs.readFileSync(".github/workflows/ci.yml", "utf8"),
  browser: fs.readFileSync("tests/browser/manager-squad-tactics-scene-v2.spec.js", "utf8")
};

const checks = [
  ["scene importeres fra eksisterende lineup-modul", files.lineup.includes('import "./manager-squad-tactics-scene-v2.js"')],
  ["kommandopanel opprettes", files.scene.includes('const PANEL_ID = "squadTacticsCommandPanel"')],
  ["scene leser eksisterende kampklar-gate", files.scene.includes('document.getElementById("squadSetupGate")')],
  ["scene leser eksisterende startelleverstatus", files.scene.includes('document.getElementById("squadGateStarters")')],
  ["scene leser eksisterende benkstatus", files.scene.includes('document.getElementById("squadGateBench")')],
  ["scene leser eksisterende rollestatus", files.scene.includes('document.getElementById("squadGateRoles")')],
  ["scene leser eksisterende formasjon", files.scene.includes('selectedLabel("#formationSelect"')],
  ["scene leser eksisterende kampplan", files.scene.includes('selectedLabel("#tacticSelect"')],
  ["scene leser kampdagens videre handling", files.scene.includes('dataset.matchdayTarget')],
  ["scene har fire operative statuser", files.scene.includes('label: "Startellever"') && files.scene.includes('label: "Benk & dekning"')],
  ["scene viser viktigste problemområde", files.scene.includes("Viktigste problemområde")],
  ["scene navigerer til eksisterende flater", files.scene.includes('target === "gate-action"') && files.scene.includes('target === "trening"') && files.scene.includes('target === "kamp"')],
  ["scene har ingen lokal storage", !files.scene.includes("localStorage")],
  ["scene har ingen ratingberegning", !files.scene.includes("teamScore") && !files.scene.includes("calculateTeamFit")],
  ["permanent CSS kobles fra modulen", files.scene.includes("manager-squad-tactics-scene-v2.css")],
  ["mobil layout finnes", files.css.includes("@media (max-width: 520px)")],
  ["fokustilstander finnes", files.css.includes(":focus-visible")],
  ["dokumentasjonen låser autoritative kilder", files.docs.includes("Autoritative kilder")],
  ["dokumentasjonen bevarer taktikkbrettet", files.docs.includes("visuelle sentrum")],
  ["audit-script er registrert", files.package.includes("audit:manager-squad-tactics-scene-v2")],
  ["sim-script er registrert", files.package.includes("sim:manager-squad-tactics-scene-v2")],
  ["audit kjøres i CI", files.ci.includes("npm run audit:manager-squad-tactics-scene-v2")],
  ["sim kjøres i CI", files.ci.includes("npm run sim:manager-squad-tactics-scene-v2")],
  ["browser tester mobil overflow", files.browser.includes("ingen mobil overflow")],
  ["browser tester tilgjengelighet", files.browser.includes("AxeBuilder")]
];

for (const [label, ok] of checks) console.log(`${ok ? "✓" : "✗"} ${label}`);
const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error(`\n✗ Manager Squad & Tactics Scene v2 audit feilet: ${failed.length}/${checks.length}`);
  process.exit(1);
}
console.log(`\n✓ Manager Squad & Tactics Scene v2 audit: ${checks.length}/${checks.length}`);
