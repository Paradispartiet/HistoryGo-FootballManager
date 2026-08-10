import fs from "node:fs";

const scouting = fs.readFileSync(new URL("../src/ui/manager-scouting-workspace-v1.js", import.meta.url), "utf8");
const css = fs.readFileSync(new URL("../src/ui/manager-scouting-workspace-v1.css", import.meta.url), "utf8");
const shellView = fs.readFileSync(new URL("../src/ui/manager-shell-view.js", import.meta.url), "utf8");
const shellBrowser = fs.readFileSync(new URL("../tests/browser/manager-shell-v3.spec.js", import.meta.url), "utf8");
const browser = fs.readFileSync(new URL("../tests/browser/manager-scouting-workspace-v1.spec.js", import.meta.url), "utf8");
const docs = fs.readFileSync(new URL("../docs/MANAGER_SCOUTING_WORKSPACE_V1.md", import.meta.url), "utf8");
const packageJson = fs.readFileSync(new URL("../package.json", import.meta.url), "utf8");
const ci = fs.readFileSync(new URL("../.github/workflows/ci.yml", import.meta.url), "utf8");

const checks = [
  ["Speiding lastes fra managerskallet", shellView.includes('manager-scouting-workspace-v1.js')],
  ["Speiding er hovedfane", scouting.includes('scoutingTab.dataset.tabTarget = "historygo"') && scouting.includes('lagTab.after(scoutingTab)')],
  ["fem hovedområder er låst", shellBrowser.includes('["Kontor", "Lag", "Speiding", "Kamp", "Stats"]')],
  ["Min spillerpool er første speiderflate", scouting.includes("Speiding · Min spillerpool") && scouting.includes("scoutingRecruitableBody")],
  ["Andre klubber er egen speiderflate", scouting.includes("Speiding · Andre klubber") && scouting.includes('const CLUBS_SECTION = "scoutingClubs"')],
  ["rekrutterbare kommer fra eksisterende unlock-data", scouting.includes('"player_candidate"') && scouting.includes("placeUnlocks") && scouting.includes("unlockedPlaceIds")],
  ["andre klubber bruker canonical klubbmotor", scouting.includes("listClubHeritagePlayers") && scouting.includes("clubAffiliationFor") && scouting.includes("clubId: club.id")],
  ["egen klubb filtreres bort", scouting.includes("currentClubId") && scouting.includes("takeoverClubId")],
  ["spillerprofil gjenbrukes", scouting.includes("hgfm:open-player-profile")],
  ["ingen samlet overall introduseres", !/overall\s*[:=]/i.test(scouting)],
  ["troppsvalg skriver kun til eksisterende teamMerits-state", scouting.includes('merits: "hgfm.teamMerits.v1"') && scouting.includes("localStorage.setItem") && scouting.includes("setPlayerSquadMembership")],
  ["ingen separat recruitment-/transfer-lagring", !/hgfm\.(recruitment|transfer|market)/i.test(scouting)],
  ["ingen parallell overgangsøkonomi", !scouting.includes("Math.random") && !scouting.includes("transferFee") && !scouting.includes("wage")],
  ["legacy Speiding beholdes kun som datakilde", css.includes('has-manager-scouting-workspace > :not(#managerScoutingRecruitable)')],
  ["mobilvisning finnes", css.includes("@media (max-width: 680px)")],
  ["browser tester profil, andre klubber og mobil", browser.includes("managerPlayerProfileDialog") && browser.includes("Andre klubber") && browser.includes("390")],
  ["browser tester WCAG", browser.includes("AxeBuilder") && browser.includes("wcag2aa")],
  ["dokumentasjonen avviser live-stall-påstand", /ikke.*live.*stall/i.test(docs)],
  ["dokumentasjonen låser pool til tropp", docs.includes("History Go-samling → Min spillerpool → valgt tropp") && docs.includes("Velg inn") && docs.includes("Ta ut")],
  ["simuleringen er registrert", packageJson.includes('"sim:manager-scouting-workspace-v1"')],
  ["auditen er registrert", packageJson.includes('"audit:manager-scouting-workspace-v1"')],
  ["CI kjører permanente Speiding-porter", ci.includes("audit:manager-scouting-workspace-v1") && ci.includes("sim:manager-scouting-workspace-v1")]
];

for (const [label, ok] of checks) console.log(`${ok ? "✓" : "✗"} ${label}`);
const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error(`\n✗ Speiding v1 audit feilet: ${failed.length}/${checks.length}`);
  process.exit(1);
}
console.log(`\n✓ Speiding v1 audit: ${checks.length}/${checks.length}`);
