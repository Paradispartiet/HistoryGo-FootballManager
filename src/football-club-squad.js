// ============================================================================
// Klubbtropp v4 — klubbvalget bestemmer poolen, banen bestemmer dybden
//
// Tar du over Rosenborg, får du ikke hele Eggens lag utdelt. Du starter med en
// automatisk, spillbar grunntropp fra ROSENBORGS egen registrerte spillerpool.
// Har du vært på Lerkendal, åpnes hele klubbens historiske spillerpool og du
// velger selv hvem du bygger laget rundt.
//
// Canonical regel:
//
//   Klubbvalg           → bestemmer hvilken spillerpool troppen kan hentes fra
//   Har vært på banen   → hele klubbpoolen er tilgjengelig
//   Har ikke vært der   → lavere/grunnleggende klubbprofiler fyller starttroppen
//
// En Viking-manager skal derfor aldri få en tilfeldig Rosenborg-, Brann- eller
// utenlandsk spiller i automatisk Viking-tropp bare fordi motoren trenger en
// keeper, stopper eller ving.
//
// `sourcePlaceIds` er sannhetskilden for klubbtilknytningen. Grunntroppen er et
// GULV, ikke en stjernepakke: den plukker de jevneste spillerne (lavest
// `classHeight`) fra klubbens egen pool. For klubber som ennå ikke har bane /
// spillerpool i History Go beholdes den generiske fallbacken så klubbvalget ikke
// blir en blindvei.
//
// v3 flyttet spillerens KLUBBSTATUS (`clubStatus`) fra hardkodede navnelister i
// motoren til spillerdataene. Statusen er fortsatt per klubb, og rangeringen
// leses av `CLUB_STATUS_RANK`.
//
// Ren ESM: ingen DOM, fetch, localStorage, Date.now eller Math.random. Motoren
// LESER History Go-progresjon som en liste inn; den skriver aldri til den.
// ============================================================================

export const CLUB_SQUAD_VERSION = "historygo-football-manager.club-squad.v4";

// Hvor tungt en klubbstatus veier når arven sorteres. Vokabularet er det samme
// som `clubStatus` i spillerdataene; rekkefølgen er den eneste tolkningen
// motoren gjør av det.
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

// Samme posisjonsfordeling som autofyll-troppen ellers i spillet: en tropp som
// faktisk kan settes opp på banen.
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

// Statusen er PER KLUBB, ikke per spiller. Den sto først som ett felt, og det
// var feil modellering: Henning Berg er elitekarriere for Vålerenga og en
// kortvarig gjest i KFUM. Ett felt kan ikke bære begge, og kilden krevde begge.
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

export function clubStatusRank(player, homePlaceId) {
  return CLUB_STATUS_RANK[clubStatusFor(player, homePlaceId)] ?? 0;
}

// Klubbens historiske spillere: de som er knyttet til klubbens egen bane.
// `sourcePlaceIds` er sannhetskilden. Sorteringen beholder classHeight som
// første nøkkel — klubbstatus skiller bare mellom like klassehøyder.
export function listClubHeritagePlayers({ homePlaceId = null, players = [] } = {}) {
  if (!homePlaceId) return [];
  return asArray(players)
    .filter((player) => asArray(player.sourcePlaceIds).includes(homePlaceId))
    .slice()
    .sort((a, b) =>
      num(b.classHeight) - num(a.classHeight)
      || clubStatusRank(b, homePlaceId) - clubStatusRank(a, homePlaceId)
      || String(a.id).localeCompare(String(b.id))
    );
}

// Har manageren vært på klubbens bane? Leser en liste — skriver aldri.
export function hasVisitedClubGround({ homePlaceId = null, unlockedPlaceIds = [] } = {}) {
  if (!homePlaceId) return false;
  const set = unlockedPlaceIds instanceof Set ? unlockedPlaceIds : new Set(asArray(unlockedPlaceIds));
  return set.has(homePlaceId);
}

// Den automatiske grunntroppen. Et gulv som holder klubben spillbar. Hvilken
// pool den får velge fra avgjøres av kalleren; for en klubb med bane er dette
// alltid klubbens egen registrerte spillerpool.
export function buildClubBaseSquad({
  players = [], candidateIds = null, excludePlayerIds = [], size = 15
} = {}) {
  const excluded = excludePlayerIds instanceof Set ? excludePlayerIds : new Set(asArray(excludePlayerIds));
  const allowed = candidateIds instanceof Set ? candidateIds : (candidateIds ? new Set(candidateIds) : null);

  const ordered = asArray(players)
    .filter((player) => player && !excluded.has(player.id) && (!allowed || allowed.has(player.id)))
    .slice()
    .sort((a, b) => num(a.classHeight) - num(b.classHeight) || String(a.id).localeCompare(String(b.id)));

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

function heritageSummary(player, homePlaceId) {
  const status = clubStatusFor(player, homePlaceId);
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
    clubStatus: status,
    clubStatusLabel: CLUB_STATUS_LABEL[status] || "",
    clubStatusSource: clubStatusSourceFor(player, homePlaceId)
  };
}

function asIdSet(value) {
  if (value instanceof Set) return value;
  return value ? new Set(asArray(value)) : null;
}

// Hva klubbvalget faktisk gir deg, og hva du må gjøre for å få resten.
export function resolveClubSquadAccess({
  club = null, players = [], unlockedPlaceIds = [], candidateIds = null, squadSize = 15
} = {}) {
  if (!club) return null;
  const homePlaceId = club.homePlaceId || null;
  const heritage = listClubHeritagePlayers({ homePlaceId, players });
  const visited = hasVisitedClubGround({ homePlaceId, unlockedPlaceIds });
  const groundName = club.ground || "klubbens bane";

  // Klubber uten History Go-bane har ennå ingen autoritativ klubbpool å avgrense
  // mot. De beholder den generiske fallbacken til datajobben finnes.
  if (!homePlaceId) {
    return {
      version: CLUB_SQUAD_VERSION,
      clubId: club.id, homePlaceId: null, groundName, visited: false,
      mode: "base",
      heritage: [], heritageCount: 0,
      baseSquad: buildClubBaseSquad({ players, candidateIds, size: squadSize }),
      headline: `${club.name} har ingen bane i History Go ennå.`,
      detail: "Du starter med en automatisk grunntropp, og bygger laget videre ved å samle spillere.",
      todo: ["Samle spillere gjennom stedene du besøker i History Go."]
    };
  }

  if (visited) {
    return {
      version: CLUB_SQUAD_VERSION,
      clubId: club.id, homePlaceId, groundName, visited: true,
      mode: "heritage",
      heritage: heritage.map((player) => heritageSummary(player, homePlaceId)),
      heritageCount: heritage.length,
      baseSquad: [],
      headline: heritage.length
        ? `Du har vært på ${groundName}. ${heritage.length} historiske ${club.name}-spillere er dine å velge blant.`
        : `Du har vært på ${groundName}, men klubben har ingen historiske spillere i katalogen ennå.`,
      detail: heritage.length
        ? "Du plukker selv hvem av dem du vil bygge laget rundt — hver spiller har posisjon, styrker, brukskostnader og klubbstatus."
        : "Klubbens spillerpool må bygges ut før en full historisk tropp kan velges.",
      todo: heritage.length
        ? ["Velg blant klubbens historiske spillere når du setter troppen."]
        : ["Samle flere spillere gjennom stedene du besøker."]
    };
  }

  // Ubesøkt bane: grunntroppen skal fortsatt være KLUBBENS tropp. Først
  // avgrenser vi til spillerne som faktisk peker på klubbens bane. `candidateIds`
  // kan snevre inn ytterligere (for eksempel fjerne landslagsarena-kandidater),
  // men får aldri utvide poolen med spillere fra andre klubber.
  const heritageIds = new Set(heritage.map((player) => player.id));
  const allowed = asIdSet(candidateIds);
  const eligibleClubIds = allowed
    ? new Set([...heritageIds].filter((id) => allowed.has(id)))
    : heritageIds;

  // Dersom et eksternt kandidatfilter gjør klubbpoolen for liten, faller vi
  // tilbake til HELE klubbpoolen — aldri til den globale spillerkatalogen.
  const basePoolIds = eligibleClubIds.size >= squadSize ? eligibleClubIds : heritageIds;
  const baseSquad = buildClubBaseSquad({ players, candidateIds: basePoolIds, size: squadSize });
  const baseIds = new Set(baseSquad);
  const lockedCount = heritage.filter((player) => !baseIds.has(player.id)).length;

  return {
    version: CLUB_SQUAD_VERSION,
    clubId: club.id, homePlaceId, groundName, visited: false,
    mode: "base",
    heritage: [],
    heritageCount: heritage.length,
    lockedCount,
    baseSquad,
    headline: `Du har ikke vært på ${groundName}.`,
    detail: heritage.length
      ? `Du får en automatisk ${club.name}-grunntropp med ${baseSquad.length} spillere fra klubbens egen spillerpool. De resterende ${lockedCount} historiske spillerne åpner seg når du besøker ${groundName} i History Go.`
      : `${club.name} har foreløpig ingen registrert spillerpool på ${groundName}.`,
    todo: heritage.length
      ? [
          `Besøk ${groundName} i History Go for å åpne resten av klubbens historiske spillerpool.`,
          "Grunntroppen består bare av spillere som er registrert på denne klubben."
        ]
      : ["Klubbens spillerpool må bygges ut i dataene før klubben kan få en full grunntropp."]
  };
}
