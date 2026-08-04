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
check("katalogen har ferdigheter", catalogue.attributes.length >= 55, String(catalogue.attributes.length));

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

// Hver ferdighet må høre til en JOBB på banen, ellers får den ingen grunnlinje
// og faller tilbake på et gjennomsnitt — nøyaktig det flate gulvet
// posisjonsprofilen finnes for å fjerne.
const groups = Object.keys(catalogue.groups || {});
check("gruppene er navngitt", groups.length >= 6, groups.join(", "));
for (const attribute of catalogue.attributes) {
  check(`«${attribute.id}» hører til en jobbgruppe`, groups.includes(attribute.group), attribute.group);
}
for (const group of groups) {
  check(`gruppa «${group}» er i bruk`, catalogue.attributes.some((entry) => entry.group === group));
}

// ---------------------------------------------------------------------------
// 1b. Posisjonsprofilene
// ---------------------------------------------------------------------------
for (const position of ["GK", "CB", "LB", "RB", "WB", "DM", "CM", "AM", "LW", "RW", "ST"]) {
  const profile = catalogue.positionProfiles[position];
  check(`${position} har en jobbprofil`, Boolean(profile));
  if (!profile) continue;
  for (const group of groups) {
    check(`${position} vekter «${group}»`, Number.isFinite(profile[group]), String(profile[group]));
    check(`${position}.${group} er 0–100`, profile[group] >= 0 && profile[group] <= 100);
  }
  // En profil der alt veier likt er ingen profil.
  const values = groups.map((group) => profile[group]);
  check(`${position} skiller mellom jobbene`, Math.max(...values) - Math.min(...values) >= 40,
    `spenn ${Math.max(...values) - Math.min(...values)}`);
}

// Og fotballen må stemme: en tier forsvarer mindre enn en midtstopper, en
// midtstopper skaper mindre enn en tier, og bare keeperen er keeper.
check("CB forsvarer mer enn AM",
  catalogue.positionProfiles.CB.forsvar > catalogue.positionProfiles.AM.forsvar + 40);
check("AM skaper mer enn CB",
  catalogue.positionProfiles.AM.kreativitet > catalogue.positionProfiles.CB.kreativitet + 40);
check("ST angriper mer enn CB",
  catalogue.positionProfiles.ST.angrep > catalogue.positionProfiles.CB.angrep + 40);
check("bare GK har keeperspill",
  Object.entries(catalogue.positionProfiles).every(([position, profile]) =>
    position === "GK" ? profile.gk >= 90 : profile.gk <= 20));
check("kantene er bredere enn de sentrale",
  Math.min(catalogue.positionProfiles.LW.bredde, catalogue.positionProfiles.RW.bredde)
    > Math.max(catalogue.positionProfiles.CB.bredde, catalogue.positionProfiles.DM.bredde) + 40);

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
check("spillerskjemaet er v4", playersFile.schema === "historygo-football-manager.players.v4", playersFile.schema);
check("ingen spiller har «overall»", players.every((player) => player.overall === undefined),
  players.find((player) => player.overall !== undefined)?.id || "");
check("alle spillere har classHeight", players.every((player) => Number.isFinite(player.classHeight)));
// Båndet er ikke lenger 85–100. Spillerne er tiered på nivå, ikke på «alle er
// gode», så en solid toppdivisjonsspiller ligger rundt 79 og bare de aller
// største når 99. Grensene leses av nivåtabellen i dataene — en hardkodet
// grense her ville drevet fra den.
const tiers = Object.values(playersFile.classTiers || {});
check("nivåtabellen finnes", tiers.length >= 5, String(tiers.length));
const bandLow = Math.min(...tiers.map((tier) => tier.min));
const bandHigh = Math.max(...tiers.map((tier) => tier.max));
check("classHeight ligger i nivåbåndet",
  players.every((player) => player.classHeight >= bandLow && player.classHeight <= bandHigh),
  `${bandLow}–${bandHigh}`);
check("hver spiller vet om nivået er belagt eller utledet",
  players.every((player) => ["belagt", "utledet"].includes(player.classSource)));
// Nivået må FAKTISK skille. Et bånd der alle ligger likt er ikke et nivå.
const heights = players.map((player) => player.classHeight);
const modal = Math.max(...[...new Set(heights)].map((value) => heights.filter((other) => other === value).length));
check("ingen enkelt nivåverdi tar over halve katalogen", modal / players.length < 0.5,
  `${Math.round((modal / players.length) * 100)} %`);
check("nivåene sprer seg", new Set(heights).size >= 12, `${new Set(heights).size} ulike`);
// Og de belagte må være en reell andel — ellers er «belagt» en tom merkelapp.
const sourced = players.filter((player) => player.classSource === "belagt").length;
check("en vesentlig andel nivåer er belagt", sourced / players.length > 0.3,
  `${sourced} av ${players.length}`);

// ---------------------------------------------------------------------------
// 7. Klubbstatus
// ---------------------------------------------------------------------------
// Statusen lå en periode som normaliserte navnelister i to egne motorfiler, med
// aliaser som «Karl-Petter Løken» ved siden av «Karl-Petter «Kalle» Løken» —
// et sikkert tegn på at oppslaget skjedde på navn i stedet for id. Den bor på
// spilleren nå, og vokabularet valideres her.
const CLUB_STATUSES = new Set(["club_icon", "club_legend", "elite_career", "golden_era_core",
  "key_player", "club_profile", "academy_export", "short_stay_star", "squad_profile"]);
const withStatus = players.filter((player) => player.clubStatus);
check("klubbstatus er satt på klubbspillerne", withStatus.length > 400, String(withStatus.length));
for (const player of withStatus) {
  check(`«${player.name}» har gyldig klubbstatus`, CLUB_STATUSES.has(player.clubStatus), player.clubStatus);
  check(`«${player.name}» vet om statusen er belagt`,
    ["belagt", "utledet"].includes(player.clubStatusSource), String(player.clubStatusSource));
}
// Hver status må være i bruk — en status ingen har er en status som ikke betyr noe.
for (const status of CLUB_STATUSES) {
  check(`statusen «${status}» er i bruk`, withStatus.some((player) => player.clubStatus === status));
}
// Og statusen må SKILLE. Får alle samme, er den ingen status.
const statusCounts = [...CLUB_STATUSES].map((status) =>
  withStatus.filter((player) => player.clubStatus === status).length);
check("klubbstatusen skiller mellom spillere",
  Math.max(...statusCounts) / withStatus.length < 0.6,
  `${Math.round((Math.max(...statusCounts) / withStatus.length) * 100)} % på største`);
// En kuratert status skal være et mindretall — ellers er «belagt» en tom merkelapp.
const curated = withStatus.filter((player) => player.clubStatusSource === "belagt").length;
check("kuratert klubbstatus er en reell, avgrenset andel",
  curated > 50 && curated / withStatus.length < 0.5, `${curated} av ${withStatus.length}`);

// Ingen spillerkatalog forkledd som kode: motorene skal ikke inneholde
// spillernavn. Det var nettopp det de to profilmodulene gjorde.
const engineDir = new URL("../src/", import.meta.url);
for (const file of fs.readdirSync(engineDir).filter((name) => name.endsWith(".js"))) {
  if (file === "app.js") continue;
  const source = fs.readFileSync(new URL(file, engineDir), "utf8");
  const hits = players.filter((player) => source.includes(`"${player.name}"`));
  check(`src/${file} hardkoder ingen spillernavn`, hits.length < 3,
    hits.slice(0, 4).map((player) => player.name).join(", "));
}

console.log(JSON.stringify({
  ok: true,
  sjekker: checks,
  ferdigheter: catalogue.attributes.length,
  grupper: Object.fromEntries(Object.keys(catalogue.groups).map((group) =>
    [group, catalogue.attributes.filter((entry) => entry.group === group).length])),
  aliaser: Object.keys(catalogue.strengthAliases).length,
  kategorier: Object.fromEntries(["fysisk", "teknisk", "taktisk", "mental"].map((category) =>
    [category, catalogue.attributes.filter((entry) => entry.category === category).length])),
  posisjoner: Object.keys(catalogue.positionDemands).length,
  klubbstatus: Object.fromEntries([...CLUB_STATUSES].map((status) =>
    [status, withStatus.filter((player) => player.clubStatus === status).length]))
}, null, 2));
