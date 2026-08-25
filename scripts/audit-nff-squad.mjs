// Parseren for NFFs lagside, målt mot en lagret side.
//
// Fjorten klubbpooler er bygget på denne parseren. Endrer den seg — eller
// endrer NFF markupen — blir feilen først synlig som en pool som mangler
// spillere, og da er den allerede skrevet inn i katalogen.
//
// Fixturen er den ekte troppsblokken fra Lyseklosters lagside, med SVG-ikonene
// strippet. Den kan ikke fange en framtidig markupendring hos NFF — ingenting
// offline kan det — men den låser parserens kontrakt, og den fanger de to
// feilene som faktisk oppsto under arbeidet:
//
//   * lagdel-tilskrivningen lekker forbi troppen, slik at spillerlenker lenger
//     nede på siden havner i «Angrep»;
//   * draktnummer og navn hentes fra hver sin spiller når kortet endrer form.
import assert from "node:assert/strict";
import fs from "node:fs";
import { parseSquad, parseTournamentTeams, tilKildefelt } from "./nff-squad.mjs";

const html = fs.readFileSync(new URL("../tests/fixtures/nff-lagside-tropp.html", import.meta.url), "utf8");
const tropp = parseSquad(html);

// Lyseklosters registrerte A-lagstropp, 24.08.2026.
assert.equal(tropp.length, 18, "antall spillere i fixturen");

const perLagdel = {};
for (const s of tropp) perLagdel[s.lagdel] = (perLagdel[s.lagdel] || 0) + 1;
assert.deepEqual(perLagdel, { Keeper: 2, Forsvar: 7, Midtbane: 4, Angrep: 5 }, "fordeling per lagdel");

// Hver rad skal bære alle tre feltene, og lagdelen skal være én av de fire.
const LAGDEL = new Set(["Keeper", "Forsvar", "Midtbane", "Angrep"]);
for (const s of tropp) {
  assert.ok(LAGDEL.has(s.lagdel), `${s.navn}: ukjent lagdel ${JSON.stringify(s.lagdel)}`);
  assert.match(s.fiksId, /^\d+$/, `${s.navn}: person-fiksId`);
  assert.ok(s.navn.length > 2 && !/[<>]/.test(s.navn), `${s.navn}: navnet er ikke renset`);
}

// Navn og draktnummer skal komme fra SAMME spiller. En kryssing her ville gitt
// riktige navn og feil numre, og ingenting ville feilet — numrene importeres
// ikke. Fixturen holder derfor tre kjente par.
const påNavn = new Map(tropp.map((s) => [s.navn, s]));
// Merk at draktnummeret her IKKE stemmer med Wikipedias troppsmal for samme
// klubb — den fører Kristian Kongelf på 4, NFF på 8. Det er uten betydning for
// katalogen, siden nummeret aldri importeres, men det er verdt å vite at de to
// kildene spriker der.
for (const [navn, nr, lagdel] of [
  ["Daniel Gjerde Sætren", "1", "Keeper"],
  ["Kristian Kongelf", "8", "Midtbane"],
  ["Ola Lerheim Olsen", "10", "Angrep"],
  // Uten draktnummer i det hele tatt: feltet skal bli tomt, ikke arve naboens.
  ["Marius Mattingsdal", "", "Forsvar"]
]) {
  const s = påNavn.get(navn);
  assert.ok(s, `${navn} mangler i fixturen`);
  assert.equal(s.nr, nr, `${navn}: draktnummer`);
  assert.equal(s.lagdel, lagdel, `${navn}: lagdel`);
}

// Ingen dubletter: samme mann kan ikke stå i to lagdeler.
const ider = tropp.map((s) => s.fiksId);
assert.equal(new Set(ider).size, ider.length, "samme person står to ganger i troppen");

// Lagdelen oversettes til nøyaktig de feltene importen forstår. Keeper er en
// PRESIS posisjon og skal aldri bli en `positionGroup`.
assert.deepEqual(tilKildefelt("Keeper"), { positions: ["GK"] }, "keeper er en presis posisjon");
assert.deepEqual(tilKildefelt("Forsvar"), { positionGroup: "forsvar" });
assert.deepEqual(tilKildefelt("Midtbane"), { positionGroup: "midtbane" });
assert.deepEqual(tilKildefelt("Angrep"), { positionGroup: "angrep" });

// Turneringstabellen: én rad per lag, lengste navn vinner. Uten det ville
// tomme lenketekster fra samme tabell overskrevet lagnavnet.
const tabell = parseTournamentTeams(`
  <a href="/fotballdata/lag/hjem/?fiksId=24"> </a>
  <a href="/fotballdata/lag/hjem/?fiksId=24">Bjarg</a>
  <a href="/fotballdata/lag/hjem/?fiksId=24">Bjarg Menn Senior A</a>
  <a href="/fotballdata/lag/hjem/?fiksId=508">Sotra Menn Senior 1</a>
`);
assert.deepEqual(tabell, [
  { fiksId: "24", navn: "Bjarg Menn Senior A" },
  { fiksId: "508", navn: "Sotra Menn Senior 1" }
], "turneringstabellen skal gi ett lag per fiksId, med fullt navn");

console.log(JSON.stringify({
  ok: true,
  fixture: "Lysekloster Menn senior A, 24.08.2026",
  spillere: tropp.length,
  perLagdel
}, null, 2));
