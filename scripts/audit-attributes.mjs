#!/usr/bin/env node
// ============================================================================
// audit:attributes — ferdighetskatalogen henger sammen med dataene som bruker
// den.
//
// Katalogen lå tidligere inne i football_player_weaknesses.json og eide da to
// ting samtidig. Nå bor den for seg selv, og da må koblingene måles: et alias
// som peker på en ferdighet som ikke finnes, eller et styrke-token uten
// ferdighet, er nettopp den stille drivingen huset blir bitt av.
// ============================================================================

import fs from "node:fs";
import assert from "node:assert";

const read = (path) => JSON.parse(fs.readFileSync(new URL(`../${path}`, import.meta.url), "utf8"));
let checks = 0;
const check = (label, ok, detail = "") => {
  assert.ok(ok, `${label}${detail ? ` — ${detail}` : ""}`);
  checks += 1;
};

const catalogue = read("data/football_attributes.json");
const players = read("data/football_players.json").players;
const roles = read("data/football_roles.json").roles;
const weaknesses = read("data/football_player_weaknesses.json");

// ---------------------------------------------------------------------------
// 1. Skjemaet
// ---------------------------------------------------------------------------
check("skjemanavn", catalogue.schema === "historygo-football-manager.attributes.v1", catalogue.schema);
check("skalaen er 1–20", catalogue.scale?.min === 1 && catalogue.scale?.max === 20);
check("katalogen har ferdigheter", catalogue.attributes.length >= 40, String(catalogue.attributes.length));

const ids = new Set();
for (const attribute of catalogue.attributes) {
  check(`«${attribute.id}» har id`, Boolean(attribute.id));
  check(`«${attribute.id}» har norsk navn`, Boolean(attribute.name));
  check(`«${attribute.id}» har svakhetstekst`, Boolean(attribute.weaknessLabel));
  check(`«${attribute.id}» har kategori`, ["fysisk", "teknisk", "taktisk", "mental"].includes(attribute.category), attribute.category);
  check(`«${attribute.id}» har vanskelighetsgrad`, ["lett", "moderat", "hard"].includes(attribute.difficulty), attribute.difficulty);
  check(`«${attribute.id}» står bare én gang`, !ids.has(attribute.id), attribute.id);
  ids.add(attribute.id);
}

// Alle fire kategoriene skal være i bruk — en tom kategori er en kategori som
// ikke betyr noe.
for (const category of ["fysisk", "teknisk", "taktisk", "mental"]) {
  check(`kategorien «${category}» er i bruk`, catalogue.attributes.some((entry) => entry.category === category));
}

// ---------------------------------------------------------------------------
// 2. Aliasene peker på noe som finnes
// ---------------------------------------------------------------------------
for (const [token, target] of Object.entries(catalogue.strengthAliases)) {
  check(`alias «${token}» peker på en ferdighet`, ids.has(target), target);
  check(`alias «${token}» er ikke selv en ferdighet`, !ids.has(token), token);
}

// coveredBy må også peke på noe ekte, ellers dekker den ingenting.
for (const attribute of catalogue.attributes) {
  for (const token of attribute.coveredBy || []) {
    const resolved = ids.has(token) ? token : catalogue.strengthAliases[token];
    check(`«${attribute.id}».coveredBy → «${token}» finnes`, Boolean(resolved) && ids.has(resolved), token);
  }
}

// ---------------------------------------------------------------------------
// 3. Posisjonskravene
// ---------------------------------------------------------------------------
const POSITIONS = ["GK", "CB", "LB", "RB", "WB", "DM", "CM", "AM", "LW", "RW", "ST"];
for (const position of POSITIONS) {
  const demands = catalogue.positionDemands[position];
  check(`${position} har kravliste`, Array.isArray(demands) && demands.length >= 5, String(demands?.length));
  for (const token of demands || []) {
    const resolved = ids.has(token) ? token : catalogue.strengthAliases[token];
    check(`${position}-kravet «${token}» er en ferdighet`, Boolean(resolved) && ids.has(resolved), token);
  }
  check(`${position} har ingen duplikatkrav`, new Set(demands).size === demands.length);
}

// ---------------------------------------------------------------------------
// 4. Dataene som bruker katalogen
// ---------------------------------------------------------------------------
const resolve = (token) => (ids.has(token) ? token : catalogue.strengthAliases[token] || null);

// Hver eneste styrke en spiller har, må kunne bli et tall. Ellers finnes det
// belagte påstander om ekte spillere som spillet stilltiende ignorerer.
const unresolved = new Set();
for (const player of players) {
  for (const token of player.strengths || []) {
    if (!resolve(token)) unresolved.add(token);
  }
}
check("alle styrke-tokens løser til en ferdighet", unresolved.size === 0, [...unresolved].join(", "));

// Hver rolle må ha minst ett ferdighetskrav, ellers kan rollens klassebonus
// ikke regnes ut og faller stilltiende tilbake til klassehøyden.
for (const role of roles) {
  const skills = (role.requires || []).map(resolve).filter(Boolean);
  check(`rollen «${role.id}» har minst ett ferdighetskrav`, skills.length > 0, (role.requires || []).join(", "));
}

// ---------------------------------------------------------------------------
// 5. Vokabularet bor ETT sted
// ---------------------------------------------------------------------------
check("svakhetsfila eier ikke lenger ferdighetene", weaknesses.attributes === undefined);
check("svakhetsfila eier ikke lenger posisjonskravene", weaknesses.positionDemands === undefined);
check("svakhetsfila peker på ferdighetskatalogen", weaknesses.attributesSource === "data/football_attributes.json");
check("svakhetsfila eier fortsatt treningen", Boolean(weaknesses.training) && Boolean(weaknesses.difficulty));

// ---------------------------------------------------------------------------
// 6. Spillerskjemaet: overall er borte, classHeight er inne
// ---------------------------------------------------------------------------
const playersFile = read("data/football_players.json");
check("spillerskjemaet er v3", playersFile.schema === "historygo-football-manager.players.v3", playersFile.schema);
check("ingen spiller har «overall»", players.every((player) => player.overall === undefined),
  players.find((player) => player.overall !== undefined)?.id || "");
check("alle spillere har classHeight", players.every((player) => Number.isFinite(player.classHeight)));
check("classHeight ligger i klassebåndet", players.every((player) => player.classHeight >= 85 && player.classHeight <= 100));

console.log(JSON.stringify({
  ok: true,
  sjekker: checks,
  ferdigheter: catalogue.attributes.length,
  aliaser: Object.keys(catalogue.strengthAliases).length,
  kategorier: Object.fromEntries(["fysisk", "teknisk", "taktisk", "mental"].map((category) =>
    [category, catalogue.attributes.filter((entry) => entry.category === category).length])),
  posisjoner: Object.keys(catalogue.positionDemands).length
}, null, 2));
