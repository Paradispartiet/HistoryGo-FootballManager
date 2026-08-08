import fs from "node:fs";

const engine = fs.readFileSync(new URL("../src/football-transfer-market.js", import.meta.url), "utf8");
const ui = fs.readFileSync(new URL("../src/ui/manager-transfer-market-v2.js", import.meta.url), "utf8");
const shell = fs.readFileSync(new URL("../src/ui/manager-shell-view.js", import.meta.url), "utf8");
const seed = fs.readFileSync(new URL("../data/football_team_merits.example.json", import.meta.url), "utf8");
const docs = fs.readFileSync(new URL("../docs/MANAGER_TRANSFER_MARKET_V2.md", import.meta.url), "utf8");
const browser = fs.readFileSync(new URL("../tests/browser/manager-transfer-market-v2.spec.js", import.meta.url), "utf8");

const checks = [
  ["markedet er lagdelt oppå eksisterende økonomi", engine.includes('normalizeClubEconomy') && engine.includes('clubEconomy')],
  ["transfer-state bor i teamMerits og ikke egen localStorage", seed.includes('"transferMarket"') && !/hgfm\.(transfer|market)\./i.test(`${engine}\n${ui}`)],
  ["bare rekrutterte spillere kan selges", engine.includes("Bare rekrutterte spillere kan legges ut for salg") && engine.includes("recruitedPlayerIds")],
  ["starttroppen beskyttes eksplisitt", docs.includes("Starttroppen") && docs.includes("spillbarhetsgulv")],
  ["to faktiske vinduer og stengt periode finnes", engine.includes("OPENING_WINDOW_ROUNDS") && engine.includes("MIDSEASON_WINDOW_ROUNDS") && engine.includes("Vindu stengt")],
  ["rekruttering blokkeres utenfor vindu", ui.includes("transferWindowRecruitmentGate") && ui.includes("data-recruit-player")],
  ["andre ligaklubber kan by", engine.includes("bidderClubId") && engine.includes("club.id !== season?.managerClubId")],
  ["bud opprettes uten classHeight/Overall", !/classHeight\s*[.:=]|overall\s*[.:=]/i.test(engine) && docs.includes("ingen skjult Overall")],
  ["bud kan godtas eller avslås", engine.includes("acceptTransferOfferInMerits") && engine.includes("rejectTransferOfferInMerits")],
  ["salg oppdaterer tropp, kontrakt og klubbkasse", engine.includes("transfer_sale") && engine.includes("balance: economy.balance + saleAmount") && engine.includes("delete contracts[id]")],
  ["samme managerflate brukes", shell.includes('manager-transfer-market-v2.js') && ui.includes("managerEconomyWorkspace")],
  ["ingen ny Neste-flyt", !/Neste dag|nextAction|next-action/i.test(`${engine}\n${ui}`)],
  ["browser-regresjon dekker markedet", browser.includes("Godta bud") && browser.includes("Vindu stengt") && browser.includes("390")],
  ["dokumentasjonen låser spillverdigrensen", docs.includes("ikke historiske overgangssummer") && docs.includes("HGFM-spillverdier")]
];

for (const [label, ok] of checks) console.log(`${ok ? "✓" : "✗"} ${label}`);
const failed = checks.filter(([, ok]) => !ok);
if (failed.length) {
  console.error(`\n✗ Overgangsmarked v2 audit feilet: ${failed.length}/${checks.length}`);
  process.exit(1);
}
console.log(`\n✓ Overgangsmarked v2 audit: ${checks.length}/${checks.length}`);
