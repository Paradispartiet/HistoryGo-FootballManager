// NFFs lagside som kilde til klubbpoolen.
//
// Fjorten av de seksten P2-arvene ble landet på denne kilden, og ingen av dem
// på klubbenes redaksjonelle historikk. Verktøyet ligger derfor i repoet: uten
// det må neste sesongoppdatering finne fram til den samme siden på nytt, og den
// veien er ikke åpenbar.
//
// Forbundet publiserer troppen for hvert registrerte lag på
//   https://www.fotball.no/fotballdata/lag/hjem/?fiksId=<lag>
// Siden er SERVER-RENDRET, så `curl` holder — ingen nettleser trengs. Spillerne
// står gruppert under fire overskrifter:
//
//     Keeper · Forsvar · Midtbane · Angrep
//
// Det er nøyaktig oppløsningen `positionGroup` i import-club-heritage bruker, og
// nøyaktig oppløsningen motorens SQUAD_GROUPS er bygget på. «Keeper» er en
// presis posisjon (GK); de tre andre er lagdeler.
//
// LAGET MÅ FINNES VIA LIGATABELLEN, IKKE VIA KLUBBEN. Klubbenes lagoversikt
// blander A-lag, rekruttlag, andrelag og 7er-lag — Bjarg har 84 registrerte lag,
// Sotra 79. To av åtte klubber i avdeling 1 fikk først feil tropp da laget ble
// plukket fra klubbsiden: Sandviken traff B-laget (10 spillere mot 32) og Eik
// traff breddeklubbens «Menn 1» i stedet for «871 Menn Senior A».
//
// Kjøring:
//   node scripts/nff-squad.mjs --turnering 206007     # lag i en avdeling
//   node scripts/nff-squad.mjs --lag 24               # troppen for ett lag
//   node scripts/nff-squad.mjs --lag 24 --json        # samme, som JSON
//
// `parseSquad` og `parseTournamentTeams` er rene og tar HTML som argument.
// Det er dem `audit:nff-squad` måler mot en lagret fixture; henting krever nett
// og kjøres aldri i CI.
import process from "node:process";

const LAGDEL = new Set(["Keeper", "Forsvar", "Midtbane", "Angrep"]);

const avkod = (s) => String(s)
  .replace(/&amp;/g, "&").replace(/&lt;/g, "<").replace(/&gt;/g, ">")
  .replace(/&quot;/g, '"').replace(/&#(\d+);/g, (_, n) => String.fromCharCode(Number(n)))
  .replace(/&#x([0-9a-fA-F]+);/g, (_, n) => String.fromCharCode(parseInt(n, 16)))
  .replace(/&nbsp;/g, " ");

/**
 * Leser troppen ut av en NFF-lagside.
 *
 * Overskrifter som IKKE er en lagdel avslutter troppen. Uten det ville
 * spillerlenker lenger nede på siden — kamptropper, statistikk, toppscorere —
 * blitt tilskrevet siste lagdel, og «Angrep» ville svulmet opp med spillere som
 * aldri sto der. Feilen ga 17 og 19 angrepsspillere hos to klubber før den ble
 * rettet.
 */
export function parseSquad(html) {
  const s = avkod(html);
  const hendelser = [];

  const overskrift = /<div class="sectionHeadingContent">([^<]+)<\/div>/g;
  for (let m = overskrift.exec(s); m; m = overskrift.exec(s)) {
    const tekst = m[1].trim();
    hendelser.push({ pos: m.index, type: "lagdel", verdi: LAGDEL.has(tekst) ? tekst : null });
  }

  const kort = /<a href="\/fotballdata\/person\/profil\/\?fiksId=(\d+)">([\s\S]*?)<\/a>/g;
  for (let m = kort.exec(s); m; m = kort.exec(s)) {
    const navn = /<div class="playerName">([^<]+)<\/div>/.exec(m[2]);
    if (!navn) continue;
    const nr = /<div class="jerseyNumber">\s*([^<]*?)\s*<\/div>/.exec(m[2]);
    hendelser.push({
      pos: m.index,
      type: "spiller",
      verdi: {
        fiksId: m[1],
        // NFF skriver bokstavelig «?» i draktnummerfeltet når nummeret mangler.
        // Det er en plassholder, ikke et nummer, og normaliseres til tomt.
        nr: nr && nr[1].trim() !== "?" ? nr[1].trim() : "",
        navn: navn[1].replace(/\s+/g, " ").trim()
      }
    });
  }

  hendelser.sort((a, b) => a.pos - b.pos);
  let lagdel = null;
  const ut = [];
  for (const h of hendelser) {
    if (h.type === "lagdel") lagdel = h.verdi;
    else if (lagdel) ut.push({ ...h.verdi, lagdel });
  }
  return ut;
}

/** Lagene i en avdeling, fra turneringstabellen. Nøkkelen er lagets fiksId. */
export function parseTournamentTeams(html) {
  const s = avkod(html);
  const funn = new Map();
  const re = /\/fotballdata\/lag\/hjem\/\?fiksId=(\d+)"[^>]*>\s*([^<]{2,60}?)\s*</g;
  for (let m = re.exec(s); m; m = re.exec(s)) {
    const navn = m[2].trim();
    if (!navn) continue;
    const forrige = funn.get(m[1]);
    if (!forrige || navn.length > forrige.length) funn.set(m[1], navn);
  }
  return [...funn.entries()]
    .map(([fiksId, navn]) => ({ fiksId, navn }))
    .sort((a, b) => a.navn.localeCompare(b.navn, "no"));
}

/** Lagdel → felt i kildefila for import-club-heritage. */
export function tilKildefelt(lagdel) {
  if (lagdel === "Keeper") return { positions: ["GK"] };
  return { positionGroup: { Forsvar: "forsvar", Midtbane: "midtbane", Angrep: "angrep" }[lagdel] };
}

// ---------------------------------------------------------------------------
// CLI. Krever nett; kjøres aldri i CI.
// ---------------------------------------------------------------------------
async function hent(url) {
  const r = await fetch(url, { signal: AbortSignal.timeout(60000) });
  if (!r.ok) throw new Error(`${r.status} ${r.statusText} for ${url}`);
  return r.text();
}

async function main() {
  const args = process.argv.slice(2);
  const verdi = (flagg) => {
    const i = args.indexOf(flagg);
    return i >= 0 ? args[i + 1] : null;
  };
  const turnering = verdi("--turnering");
  const lag = verdi("--lag");

  if (!turnering && !lag) {
    console.error(`Bruk:
  node scripts/nff-squad.mjs --turnering <fiksId>   lagene i en avdeling
  node scripts/nff-squad.mjs --lag <fiksId>         troppen for ett lag
  node scripts/nff-squad.mjs --lag <fiksId> --json  samme, som JSON

Turneringer: 2. divisjon avdeling 1 = 206007, avdeling 2 = 206008 (2026).
Finn laget via turneringen, ikke via klubben — klubbenes laglister blander
A-lag, rekrutt og 7er.`);
    process.exit(1);
  }

  if (turnering) {
    const html = await hent(`https://www.fotball.no/fotballdata/turnering/tabell/?fiksId=${turnering}`);
    for (const { fiksId, navn } of parseTournamentTeams(html)) {
      console.log(`${fiksId.padStart(8)}  ${navn}`);
    }
    return;
  }

  const html = await hent(`https://www.fotball.no/fotballdata/lag/hjem/?fiksId=${lag}`);
  const tropp = parseSquad(html);
  if (args.includes("--json")) {
    console.log(JSON.stringify(tropp, null, 2));
    return;
  }
  const antall = {};
  for (const s of tropp) antall[s.lagdel] = (antall[s.lagdel] || 0) + 1;
  console.log(`${tropp.length} spillere · ${JSON.stringify(antall)}`);
  for (const s of tropp) {
    console.log(`  ${s.lagdel.padEnd(9)} ${(s.nr || "?").padStart(3)}  ${s.navn}  #${s.fiksId}`);
  }
  if (tropp.length < 15) {
    console.log(`\nUnder femten spillbare — klubben blir stående \`pending\`.`);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error.message);
    process.exit(1);
  });
}
