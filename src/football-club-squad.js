// ============================================================================
// Klubbtropp v5 — klubbmedlemskap er data, stadion er tilgang
//
// Canonical modell:
//
//   player.clubAffiliations  → hvilke klubbpooler spilleren tilhører
//   player.sourcePlaceIds    → hvor spilleren kan oppdages i History Go
//   club.homePlaceId         → hvilket stadion som åpner hele klubbpoolen
//
// Disse tre relasjonene skal ikke blandes. En spiller kan være dokumentert
// Viking-spiller uten at klubbidentiteten må utledes av Lyse Arena, og et fysisk
// sted kan være relevant for flere historiske sammenhenger uten å bli en
// klubb-ID forkledd som stadion-ID.
//
// Uten stadionbesøk får manageren et spillbart gulv fra klubbens EGEN pool.
// Grunntroppen prioriterer ordinære tropps-/klubbprofiler før ikoner og
// legender, og deretter lavere classHeight. Med stadionbesøk åpnes hele poolen.
// En klubb med færre enn 15 dokumenterte tilknytninger er `unavailable` for
// overtakelse; motoren fyller aldri hull med tilfeldige spillere fra andre
// klubber.
//
// Ren ESM: ingen DOM, fetch, localStorage, Date.now eller Math.random. Motoren
// LESER History Go-progresjon som input og skriver aldri til den.
// ============================================================================

export const CLUB_SQUAD_VERSION = "historygo-football-manager.club-squad.v5";
export const CLUB_PLAYER_POOL_VERSION = "historygo-football-manager.club-player-pool.v1";

export const CLUB_STATUS_RANK = Object.freeze({
  club_icon: 7,
  club_legend: 6,
  elite_career: 5,
  golden_era_core: 5,
  key_player: 4,
  club_profile: 3,
  academy_export: 3,
  short_stay_star: 3,
  squad_profile: 2
});

export const CLUB_STATUS_LABEL = Object.freeze({
  club_icon: "Klubbikon",
  club_legend: "Klubblegende",
  elite_career: "Elitekarriere",
  golden_era_core: "Gullalderens kjerne",
  key_player: "Nøkkelspiller",
  club_profile: "Klubbprofil",
  academy_export: "Akademi / eksport",
  short_stay_star: "Stjerne med kortere opphold",
  squad_profile: "Troppsprofil"
});

const SQUAD_GROUPS = Object.freeze([
  { positions: ["GK"], count: 2 },
  { positions: ["CB", "LB", "RB", "WB"], count: 5 },
  { positions: ["DM", "CM", "AM"], count: 5 },
  { positions: ["ST", "LW", "RW"], count: 3 }
]);

const asArray = (value) => (Array.isArray(value) ? value : []);
const num = (value, fallback = 0) => (Number.isFinite(Number(value)) ? Number(value) : fallback);

function playsIn(player, positions) {
  return [...asArray(player?.naturalPositions), ...asArray(player?.usablePositions)]
    .some((position) => positions.includes(position));
}

export function clubAffiliationsFor(player) {
  return asArray(player?.clubAffiliations)
    .filter((entry) => entry && typeof entry.clubId === "string" && entry.clubId.trim())
    .map((entry) => ({
      clubId: entry.clubId.trim(),
      relation: typeof entry.relation === "string" && entry.relation ? entry.relation : "played_for",
      status: typeof entry.status === "string" && entry.status ? entry.status : null,
      source: entry.source === "belagt" ? "belagt" : "utledet"
    }));
}

export function clubAffiliationFor(player, clubId) {
  if (!clubId) return null;
  return clubAffiliationsFor(player).find((entry) => entry.clubId === clubId) || null;
}

export function playerAffiliatedWithClub(player, clubId) {
  return Boolean(clubAffiliationFor(player, clubId));
}

// Legacy-hjelpere beholdes fordi klubbstatus historisk var nøkkelt på placeId.
// De brukes ikke til å avgjøre hvem som er i klubbpoolen.
export function clubStatusFor(player, homePlaceId) {
  const status = player?.clubStatus;
  if (!status || typeof status !== "object") return null;
  return status[homePlaceId] || null;
}

export function clubStatusSourceFor(player, homePlaceId) {
  const source = player?.clubStatusSource;
  if (!source || typeof source !== "object") return "utledet";
  return source[homePlaceId] || "utledet";
}

export function clubStatusRank(player, clubRef) {
  const affiliation = clubAffiliationFor(player, clubRef);
  const status = affiliation?.status || clubStatusFor(player, clubRef);
  return CLUB_STATUS_RANK[status] ?? 0;
}

function affiliationStatusRank(player, clubId) {
  return CLUB_STATUS_RANK[clubAffiliationFor(player, clubId)?.status] ?? 0;
}

export function listClubPoolPlayers({ clubId = null, players = [] } = {}) {
  if (!clubId) return [];
  return asArray(players)
    .filter((player) => playerAffiliatedWithClub(player, clubId))
    .slice()
    .sort((a, b) =>
      num(b.classHeight) - num(a.classHeight)
      || affiliationStatusRank(b, clubId) - affiliationStatusRank(a, clubId)
      || String(a.id).localeCompare(String(b.id))
    );
}

// Kompatibilitetsnavn for eksisterende UI/tester. Når clubId finnes er den
// eksplisitte klubbtilknytningen canonical. Bare eldre kall uten clubId kan lese
// legacy clubStatus på placeId; sourcePlaceIds brukes aldri som klubbbevis.
export function listClubHeritagePlayers({ clubId = null, homePlaceId = null, players = [] } = {}) {
  if (clubId) return listClubPoolPlayers({ clubId, players });
  if (!homePlaceId) return [];
  return asArray(players)
    .filter((player) => Boolean(clubStatusFor(player, homePlaceId)))
    .slice()
    .sort((a, b) =>
      num(b.classHeight) - num(a.classHeight)
      || (CLUB_STATUS_RANK[clubStatusFor(b, homePlaceId)] ?? 0) - (CLUB_STATUS_RANK[clubStatusFor(a, homePlaceId)] ?? 0)
      || String(a.id).localeCompare(String(b.id))
    );
}

export function hasVisitedClubGround({ homePlaceId = null, unlockedPlaceIds = [] } = {}) {
  if (!homePlaceId) return false;
  const set = unlockedPlaceIds instanceof Set ? unlockedPlaceIds : new Set(asArray(unlockedPlaceIds));
  return set.has(homePlaceId);
}

// Et spillbarhetsgulv, ikke en stjernepakke. Hvis clubId sendes inn, sorteres
// ordinære troppsprofiler foran ikoner/legender før classHeight avgjør innenfor
// samme statusnivå. Dermed er stadionbesøket fortsatt en meningsfull åpning av
// klubbhistorien uten at vi later som de 15 svakeste tallene er en historisk XI.
export function buildClubBaseSquad({
  players = [], candidateIds = null, excludePlayerIds = [], size = 15, clubId = null
} = {}) {
  const excluded = excludePlayerIds instanceof Set ? excludePlayerIds : new Set(asArray(excludePlayerIds));
  const allowed = candidateIds instanceof Set ? candidateIds : (candidateIds ? new Set(candidateIds) : null);

  const ordered = asArray(players)
    .filter((player) => player && !excluded.has(player.id) && (!allowed || allowed.has(player.id)))
    .slice()
    .sort((a, b) => {
      if (clubId) {
        const statusDelta = affiliationStatusRank(a, clubId) - affiliationStatusRank(b, clubId);
        if (statusDelta) return statusDelta;
      }
      return num(a.classHeight) - num(b.classHeight) || String(a.id).localeCompare(String(b.id));
    });

  const picked = [];
  const taken = new Set();
  for (const group of SQUAD_GROUPS) {
    let need = group.count;
    for (const player of ordered) {
      if (need <= 0 || picked.length >= size) break;
      if (taken.has(player.id) || !playsIn(player, group.positions)) continue;
      picked.push(player.id);
      taken.add(player.id);
      need -= 1;
    }
  }
  for (const player of ordered) {
    if (picked.length >= size) break;
    if (taken.has(player.id)) continue;
    picked.push(player.id);
    taken.add(player.id);
  }
  return picked;
}

function poolSummary(player, clubId) {
  const affiliation = clubAffiliationFor(player, clubId);
  const status = affiliation?.status || null;
  return {
    id: player.id,
    name: player.name,
    era: player.era,
    classHeight: num(player.classHeight),
    naturalPositions: asArray(player.naturalPositions),
    usablePositions: asArray(player.usablePositions),
    strengths: asArray(player.strengths),
    poorFits: asArray(player.poorFits),
    tacticalDislikes: asArray(player.dislikesTactics),
    usageWarning: player.warningWhenMisused || "",
    clubRelation: affiliation?.relation || "played_for",
    clubStatus: status,
    clubStatusLabel: CLUB_STATUS_LABEL[status] || "",
    clubStatusSource: affiliation?.source || "utledet"
  };
}

function asIdSet(value) {
  if (value instanceof Set) return value;
  return value ? new Set(asArray(value)) : null;
}

export function resolveClubSquadAccess({
  club = null, players = [], unlockedPlaceIds = [], candidateIds = null, squadSize = 15
} = {}) {
  if (!club?.id) return null;
  const clubId = club.id;
  const homePlaceId = club.homePlaceId || null;
  const pool = listClubPoolPlayers({ clubId, players });
  const poolIds = new Set(pool.map((player) => player.id));
  const poolReady = pool.length >= squadSize;
  const visited = hasVisitedClubGround({ homePlaceId, unlockedPlaceIds });
  const groundName = club.ground || "klubbens bane";

  if (!poolReady) {
    return {
      version: CLUB_SQUAD_VERSION,
      poolVersion: CLUB_PLAYER_POOL_VERSION,
      clubId, homePlaceId, groundName, visited,
      mode: "unavailable",
      poolReady: false,
      poolSize: pool.length,
      clubPoolIds: [...poolIds],
      heritage: [], heritageCount: pool.length,
      lockedCount: pool.length,
      baseSquad: [],
      headline: `${club.name} har ikke en ferdig spillerpool ennå.`,
      detail: `Klubben har ${pool.length} dokumenterte spillerprofiler. Det trengs minst ${squadSize} før klubben kan overtas uten å fylle laget med spillere fra andre klubber.`,
      todo: ["Bygg ut klubbens dokumenterte spillerpool før klubben gjøres spillbar."]
    };
  }

  if (visited) {
    return {
      version: CLUB_SQUAD_VERSION,
      poolVersion: CLUB_PLAYER_POOL_VERSION,
      clubId, homePlaceId, groundName, visited: true,
      mode: "heritage",
      poolReady: true,
      poolSize: pool.length,
      clubPoolIds: [...poolIds],
      heritage: pool.map((player) => poolSummary(player, clubId)),
      heritageCount: pool.length,
      lockedCount: 0,
      baseSquad: [],
      headline: `Du har vært på ${groundName}. Hele ${club.name}-poolen på ${pool.length} spillere er tilgjengelig.`,
      detail: "Du plukker selv hvem du vil bygge laget rundt — klubbtilknytningen kommer fra spillerdataene, mens stadionbesøket åpner tilgangen.",
      todo: ["Velg blant klubbens historiske spillere når du setter troppen."]
    };
  }

  const allowed = asIdSet(candidateIds);
  const eligibleClubIds = allowed
    ? new Set([...poolIds].filter((id) => allowed.has(id)))
    : poolIds;
  const basePoolIds = eligibleClubIds.size >= squadSize ? eligibleClubIds : poolIds;
  const baseSquad = buildClubBaseSquad({
    players,
    candidateIds: basePoolIds,
    size: squadSize,
    clubId
  });
  const baseIds = new Set(baseSquad);
  const lockedCount = pool.filter((player) => !baseIds.has(player.id)).length;

  const noGround = !homePlaceId;
  return {
    version: CLUB_SQUAD_VERSION,
    poolVersion: CLUB_PLAYER_POOL_VERSION,
    clubId, homePlaceId, groundName, visited: false,
    mode: "base",
    poolReady: true,
    poolSize: pool.length,
    clubPoolIds: [...poolIds],
    heritage: [],
    heritageCount: pool.length,
    lockedCount,
    baseSquad,
    headline: noGround
      ? `${club.name} har en spillerpool, men ingen History Go-bane koblet til ennå.`
      : `Du har ikke vært på ${groundName}.`,
    detail: noGround
      ? `Du får en ${club.name}-grunntropp med ${baseSquad.length} spillere fra klubbens egen pool. Resten åpnes når klubben får en History Go-bane og den besøkes.`
      : `Du får en automatisk ${club.name}-grunntropp med ${baseSquad.length} spillere fra klubbens egen pool. De resterende ${lockedCount} historiske spillerne åpnes når du besøker ${groundName} i History Go.`,
    todo: noGround
      ? ["Koble klubben til riktig History Go-bane for å gjøre resten av klubbpoolen samlebar."]
      : [
          `Besøk ${groundName} i History Go for å åpne resten av klubbens historiske spillerpool.`,
          "Grunntroppen består bare av spillere med eksplisitt klubbtilknytning."
        ]
  };
}

// Ren og idempotent save-reparasjon. Den tar bare data inn/ut; app-laget eier
// persistens. Dermed kan gamle `auto_squad`-saves fra før klubbpool v1 repareres
// før availability gjør fremmede spillere tilgjengelige.
export function reconcileClubBaseSquadSave({ localStart = null, access = null } = {}) {
  if (!localStart || typeof localStart !== "object" || localStart.source !== "auto_squad" || !access?.clubId) {
    return { changed: false, localStart, reason: null, message: "" };
  }

  const currentIds = asArray(localStart.playerIds).filter((id) => typeof id === "string");
  const clear = (reason, message) => ({
    changed: Boolean(localStart.enabled || currentIds.length),
    reason,
    message,
    localStart: {
      ...localStart,
      enabled: false,
      clubId: access.clubId,
      poolVersion: access.version,
      generatedFrom: "club_pool",
      playerIds: []
    }
  });

  if (access.mode === "unavailable") {
    return clear("pool_unavailable", `${access.clubId}: gammel automatisk tropp ble fjernet fordi klubbpoolen ikke er ferdig.`);
  }
  if (access.mode === "heritage") {
    return clear("full_pool_unlocked", `${access.clubId}: automatisk grunntropp ble fjernet fordi hele klubbpoolen nå er åpnet.`);
  }
  if (access.mode !== "base") {
    return { changed: false, localStart, reason: null, message: "" };
  }

  const expected = asArray(access.baseSquad);
  const expectedSet = new Set(expected);
  const foreignIds = currentIds.filter((id) => !expectedSet.has(id));
  const stale =
    localStart.clubId !== access.clubId
    || localStart.poolVersion !== access.version
    || localStart.generatedFrom !== "club_pool"
    || currentIds.length !== expected.length
    || currentIds.some((id, index) => id !== expected[index]);

  if (!stale) return { changed: false, localStart, reason: null, message: "" };

  return {
    changed: true,
    reason: foreignIds.length ? "foreign_players" : "pool_version",
    message: foreignIds.length
      ? `${access.clubId}: gammel grunntropp inneholdt spillere utenfor klubbpoolen og er reparert.`
      : `${access.clubId}: grunntroppen er oppdatert til gjeldende klubbpool.`,
    localStart: {
      ...localStart,
      enabled: true,
      clubId: access.clubId,
      poolVersion: access.version,
      generatedFrom: "club_pool",
      playerIds: expected
    }
  };
}
