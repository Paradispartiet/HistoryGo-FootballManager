import assert from "node:assert/strict";
import fs from "node:fs";
import {
  CLUB_SQUAD_VERSION,
  buildClubBaseSquad,
  clubAffiliationFor,
  hasVisitedClubGround,
  listClubHeritagePlayers,
  listClubPoolPlayers,
  playerAffiliatedWithClub,
  reconcileClubBaseSquadSave,
  resolveClubSquadAccess
} from "../src/football-club-squad.js";

const { clubs } = JSON.parse(fs.readFileSync(new URL("../data/football_clubs.json", import.meta.url), "utf8"));
const { players } = JSON.parse(fs.readFileSync(new URL("../data/football_players.json", import.meta.url), "utf8"));
const unlockData = JSON.parse(fs.readFileSync(new URL("../data/football_unlocks.json", import.meta.url), "utf8"));
const placeUnlocks = Array.isArray(unlockData.placeUnlocks) ? unlockData.placeUnlocks : [];
const placeIds = new Set(placeUnlocks.map((place) => place.placeId));
const nationalPlaceIds = new Set(placeUnlocks.filter((place) => String(place.placeRole).includes("national")).map((place) => place.placeId));
const candidateIds = new Set(players
  .filter((player) => !(player.sourcePlaceIds || []).some((placeId) => nationalPlaceIds.has(placeId)))
  .map((player) => player.id));
const byId = new Map(players.map((player) => [player.id, player]));
const clubById = new Map(clubs.map((club) => [club.id, club]));
const REQUIRED = 15;

let checks = 0;
function check(name, condition, detail = "") {
  checks += 1;
  assert.ok(condition, `${name}${detail ? ` — ${detail}` : ""}`);
}

check("klubbtroppmotoren er v5", CLUB_SQUAD_VERSION.endsWith(".v5"), CLUB_SQUAD_VERSION);
check("alle spiller-id-er er unike", new Set(players.map((player) => player.id)).size === players.length);
check("alle klubb-id-er er unike", new Set(clubs.map((club) => club.id)).size === clubs.length);

// ---------------------------------------------------------------------------
// 1. Klubbtilknytning er eksplisitt data, ikke stadioninferens
// ---------------------------------------------------------------------------
const affiliationCount = players.reduce((sum, player) => sum + (player.clubAffiliations || []).length, 0);
check("katalogen har eksplisitte klubbtilknytninger", affiliationCount > 1000, String(affiliationCount));
for (const player of players) {
  const seen = new Set();
  for (const affiliation of player.clubAffiliations || []) {
    check(`${player.id}: klubbtilknytning peker på en kjent klubb`, clubById.has(affiliation.clubId), affiliation.clubId);
    check(`${player.id}: klubbtilknytning er ikke duplisert`, !seen.has(affiliation.clubId), affiliation.clubId);
    seen.add(affiliation.clubId);
    check(`${player.id}: relasjonen har type`, Boolean(affiliation.relation));
    check(`${player.id}: relasjonen har kildegrad`, ["belagt", "utledet"].includes(affiliation.source), affiliation.source);
  }
}

const engineSource = fs.readFileSync(new URL("../src/football-club-squad.js", import.meta.url), "utf8");
const engineWithoutComments = engineSource
  .replace(/\/\*[\s\S]*?\*\//g, "")
  .split("\n").map((line) => line.replace(/\/\/.*$/, "")).join("\n");
check("runtime utleder ikke klubbmedlemskap fra sourcePlaceIds", !/sourcePlaceIds/.test(engineWithoutComments));
check("motoren er ren", !/document|localStorage|fetch\(|Date\.now|Math\.random/.test(engineWithoutComments));

for (const club of clubs) {
  const pool = listClubPoolPlayers({ clubId: club.id, players });
  check(`${club.name}: playerPoolSize stemmer med spillerdata`, Number(club.playerPoolSize || 0) === pool.length,
    `${club.playerPoolSize} mot ${pool.length}`);
  check(`${club.name}: poolstatus stemmer med størrelsen`,
    club.playerPoolStatus === (pool.length >= REQUIRED ? "ready" : "pending"), `${club.playerPoolStatus}/${pool.length}`);
  check(`${club.name}: alle i poolen peker eksplisitt tilbake på klubben`,
    pool.every((player) => playerAffiliatedWithClub(player, club.id)));
}

// Kompatibilitetsfunksjonen må ikke gå tilbake til sourcePlaceIds heller.
for (const club of clubs.filter((entry) => entry.homePlaceId)) {
  const explicit = listClubPoolPlayers({ clubId: club.id, players });
  const legacy = listClubHeritagePlayers({ homePlaceId: club.homePlaceId, players });
  check(`${club.name}: legacy place-status og eksplisitt pool har samme størrelse etter migreringen`,
    explicit.length === legacy.length, `${explicit.length}/${legacy.length}`);
}

// ---------------------------------------------------------------------------
// 2. Ready-klubber får bare egne spillere; pending får ALDRI global fallback
// ---------------------------------------------------------------------------
const ready = clubs.filter((club) => club.playerPoolStatus === "ready");
const pending = clubs.filter((club) => club.playerPoolStatus === "pending");
check("det finnes spillbare klubbpooler", ready.length > 0, String(ready.length));
check("det finnes fortsatt datagjeld som er eksplisitt pending", pending.length > 0, String(pending.length));

for (const club of ready) {
  const access = resolveClubSquadAccess({ club, players, unlockedPlaceIds: [], candidateIds, squadSize: REQUIRED });
  const poolIds = new Set(listClubPoolPlayers({ clubId: club.id, players }).map((player) => player.id));
  check(`${club.name}: kald start bruker basemodus`, access.mode === "base", access.mode);
  check(`${club.name}: grunntroppen har 15`, access.baseSquad.length === REQUIRED, String(access.baseSquad.length));
  check(`${club.name}: grunntroppen inneholder bare egne spillere`, access.baseSquad.every((id) => poolIds.has(id)),
    access.baseSquad.filter((id) => !poolIds.has(id)).join(", "));
  check(`${club.name}: poolen oppgis som klar`, access.poolReady === true);
  check(`${club.name}: låst antall er resten av klubbpoolen`, access.lockedCount === poolIds.size - REQUIRED,
    `${access.lockedCount}/${poolIds.size - REQUIRED}`);
}

for (const club of pending) {
  const access = resolveClubSquadAccess({ club, players, unlockedPlaceIds: [], candidateIds, squadSize: REQUIRED });
  check(`${club.name}: pending klubb er unavailable`, access.mode === "unavailable", access.mode);
  check(`${club.name}: pending klubb får ingen global tropp`, access.baseSquad.length === 0, access.baseSquad.join(", "));
  check(`${club.name}: pending klubb forklarer datagjelden`, /ikke en ferdig spillerpool|dokumenterte spillerprofiler/.test(`${access.headline} ${access.detail}`));
}

// ---------------------------------------------------------------------------
// 3. Stadion åpner dybden, men bestemmer ikke medlemskapet
// ---------------------------------------------------------------------------
for (const club of ready.filter((entry) => entry.homePlaceId)) {
  check(`${club.name}: homePlaceId finnes`, placeIds.has(club.homePlaceId), club.homePlaceId);
  check(`${club.name}: stadion er ikke nasjonalarena`, !nationalPlaceIds.has(club.homePlaceId), club.homePlaceId);
  check(`${club.name}: ubesøkt stadion er ikke full tilgang`,
    hasVisitedClubGround({ homePlaceId: club.homePlaceId, unlockedPlaceIds: [] }) === false);
  check(`${club.name}: eget stadion åpner tilgangen`,
    hasVisitedClubGround({ homePlaceId: club.homePlaceId, unlockedPlaceIds: [club.homePlaceId] }) === true);

  const full = resolveClubSquadAccess({
    club, players, unlockedPlaceIds: [club.homePlaceId], candidateIds, squadSize: REQUIRED
  });
  const pool = listClubPoolPlayers({ clubId: club.id, players });
  check(`${club.name}: besøkt stadion gir heritage-modus`, full.mode === "heritage", full.mode);
  check(`${club.name}: hele eksplisitte klubbpoolen åpnes`, full.heritage.length === pool.length,
    `${full.heritage.length}/${pool.length}`);
  check(`${club.name}: ingen ferdig basetropp ved full tilgang`, full.baseSquad.length === 0);
}

// Syntetisk bevis på selve skillet: klubbpool kan eksistere uten stadion.
const syntheticClub = { id: "synthetic_pool_only", name: "Pool FK", ground: "Ukjent bane" };
const syntheticPlayers = players.slice(0, REQUIRED).map((player) => ({
  ...player,
  clubAffiliations: [{ clubId: syntheticClub.id, relation: "played_for", status: "squad_profile", source: "utledet" }]
}));
const synthetic = resolveClubSquadAccess({ club: syntheticClub, players: syntheticPlayers, unlockedPlaceIds: [], squadSize: REQUIRED });
check("klubbpool kan være spillbar uten History Go-stadion", synthetic.mode === "base" && synthetic.baseSquad.length === REQUIRED);
check("uten stadion kan resten ikke late som den er besøkt", synthetic.visited === false && synthetic.homePlaceId === null);

// ---------------------------------------------------------------------------
// 4. Grunntroppen er balansert og favoriserer ordinære profiler
// ---------------------------------------------------------------------------
for (const club of ready) {
  const access = resolveClubSquadAccess({ club, players, unlockedPlaceIds: [], candidateIds, squadSize: REQUIRED });
  const squad = access.baseSquad.map((id) => byId.get(id));
  check(`${club.name}: minst én keeper`, squad.some((player) => [...(player.naturalPositions || []), ...(player.usablePositions || [])].includes("GK")));
  for (const [label, positions] of [
    ["forsvar", ["CB", "LB", "RB", "WB"]],
    ["midtbane", ["DM", "CM", "AM"]],
    ["angrep", ["ST", "LW", "RW"]]
  ]) {
    check(`${club.name}: dekker ${label}`,
      squad.filter((player) => [...(player.naturalPositions || []), ...(player.usablePositions || [])].some((position) => positions.includes(position))).length >= 3);
  }

  const pool = listClubPoolPlayers({ clubId: club.id, players });
  const rank = (player) => {
    const status = clubAffiliationFor(player, club.id)?.status;
    const map = { squad_profile: 2, club_profile: 3, academy_export: 3, short_stay_star: 3, key_player: 4, elite_career: 5, golden_era_core: 5, club_legend: 6, club_icon: 7 };
    return map[status] || 0;
  };
  const mean = (values) => values.reduce((sum, value) => sum + value, 0) / Math.max(1, values.length);
  check(`${club.name}: starttroppen har ikke høyere gjennomsnittlig klubbstatus enn poolen`,
    mean(squad.map(rank)) <= mean(pool.map(rank)) + 0.0001,
    `${mean(squad.map(rank)).toFixed(2)}/${mean(pool.map(rank)).toFixed(2)}`);
}

// Determinisme.
const viking = clubById.get("viking");
check("Viking finnes og er klar", viking?.playerPoolStatus === "ready", JSON.stringify(viking));
const vikingPool = listClubPoolPlayers({ clubId: viking.id, players });
const vikingIds = new Set(vikingPool.map((player) => player.id));
const vikingAccess = resolveClubSquadAccess({ club: viking, players, unlockedPlaceIds: [], candidateIds, squadSize: REQUIRED });
assert.deepEqual(
  vikingAccess.baseSquad,
  resolveClubSquadAccess({ club: viking, players, unlockedPlaceIds: [], candidateIds, squadSize: REQUIRED }).baseSquad,
  "Viking-grunntroppen er ikke deterministisk"
);
checks += 1;
check("Viking-grunntroppen er bare Viking", vikingAccess.baseSquad.every((id) => vikingIds.has(id)));

// ---------------------------------------------------------------------------
// 5. Gamle saves repareres før fremmede spiller-ID-er får leve videre
// ---------------------------------------------------------------------------
const foreignPlayer = players.find((player) => !vikingIds.has(player.id));
check("finnes en spiller utenfor Viking-poolen for migreringstest", Boolean(foreignPlayer));
const oldVikingSave = {
  enabled: true,
  source: "auto_squad",
  playerIds: [foreignPlayer.id, ...vikingAccess.baseSquad.slice(1)],
  createdAt: "2026-08-01T00:00:00.000Z"
};
const repaired = reconcileClubBaseSquadSave({ localStart: oldVikingSave, access: vikingAccess });
check("gammel Viking-save med fremmed spiller blir reparert", repaired.changed && repaired.reason === "foreign_players", repaired.reason);
check("reparert save inneholder bare canonical Viking-grunntropp",
  repaired.localStart.playerIds.every((id) => vikingIds.has(id)));
check("reparert save stemples med klubb", repaired.localStart.clubId === "viking");
check("reparert save stemples med poolversjon", repaired.localStart.poolVersion === vikingAccess.version);
check("reparert save stemples som club_pool", repaired.localStart.generatedFrom === "club_pool");

const secondPass = reconcileClubBaseSquadSave({ localStart: repaired.localStart, access: vikingAccess });
check("save-reparasjon er idempotent", secondPass.changed === false);

const visitedViking = resolveClubSquadAccess({
  club: viking, players, unlockedPlaceIds: [viking.homePlaceId], candidateIds, squadSize: REQUIRED
});
const unlockedRepair = reconcileClubBaseSquadSave({ localStart: repaired.localStart, access: visitedViking });
check("basetropp ryddes når hele Viking-poolen er åpnet", unlockedRepair.changed && unlockedRepair.localStart.enabled === false);

const pendingClub = pending[0];
const pendingAccess = resolveClubSquadAccess({ club: pendingClub, players, unlockedPlaceIds: [], candidateIds, squadSize: REQUIRED });
const pendingRepair = reconcileClubBaseSquadSave({ localStart: oldVikingSave, access: pendingAccess });
check("gammel global auto-tropp ryddes for pending klubb", pendingRepair.changed && pendingRepair.localStart.playerIds.length === 0);

// ---------------------------------------------------------------------------
// 6. Dokumentasjon/appintegrasjon skal bære samme kontrakt
// ---------------------------------------------------------------------------
const app = fs.readFileSync(new URL("../src/app.js", import.meta.url), "utf8");
check("app importerer save-reparasjonen", /reconcileClubBaseSquadSave/.test(app));
check("localStart lagrer clubId", /clubId: typeof base\.clubId/.test(app));
check("localStart lagrer poolVersion", /poolVersion: typeof base\.poolVersion/.test(app));
check("overtakelse stemples generatedFrom club_pool", /generatedFrom: "club_pool"/.test(app));
check("availability bruker klubbens baseSquad ved overtakelse", /getClubSquadAccess\(takeoverClub\)\?\.baseSquad/.test(app));
check("spillerkilde kan vises som club_pool", /source: localStart\.generatedFrom === "club_pool" \? "club_pool"/.test(app));

const docs = fs.readFileSync(new URL("../docs/klubbvalg.md", import.meta.url), "utf8");
check("docs skiller klubbtilknytning fra oppdagelsessted", docs.includes("`clubAffiliations`") && docs.includes("`sourcePlaceIds`"));
check("docs sier at pending-klubber ikke får tilfeldige spillere", /uten ferdig spillerpool.*ikke lenger fylt med tilfeldige ekte spillere/s.test(docs));

console.log(JSON.stringify({
  ok: true,
  sjekker: checks,
  spillere: players.length,
  klubbtilknytninger: affiliationCount,
  readyKlubber: ready.length,
  pendingKlubber: pending.length,
  vikingPool: vikingPool.length,
  vikingBase: vikingAccess.baseSquad.length
}, null, 2));
