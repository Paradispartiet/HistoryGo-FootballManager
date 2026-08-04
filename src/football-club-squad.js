// ============================================================================
// Klubbtropp v2 — arven ligger på banen, ikke i klubbvalget
//
// Tar du over Rosenborg, får du IKKE Eggens lag utdelt. Du får tilgang til
// klubbens historiske spillere — men bare hvis du faktisk har vært på Lerkendal.
// Har du ikke det, får du en automatisk tropp som holder klubben spillbar, og
// resten må du samle selv.
//
// Det er hele kjernesløyfen brukt på klubbovertakelsen i stedet for å omgå den:
//
//   Har vært på banen   → klubbens historiske spillere er dine å velge blant
//   Har ikke vært der   → automatisk grunntropp + «gå og samle»
//
// Samme form som landslagsmodus, der nasjonens grunntropp er bunnen og
// samlingen er oppsiden. Ingen ny gate er funnet opp: spillerne er allerede
// knyttet til steder gjennom `sourcePlaceIds`, og `computeAvailability()` gater
// dem allerede på besøkte steder. Det som manglet var koblingen KLUBB → BANE,
// og en grunntropp så et klubbvalg aldri blir en blindvei.
//
// Grunntroppen er et GULV, ikke en snarvei: den plukker de jevneste spillerne
// (lavest `classHeight`) og aldri klubbens egne historiske navn — de er nettopp
// det du går til Lerkendal for. Den deler heller aldri ut landslagsarena-spillere.
//
// v3 leser spillerens KLUBBSTATUS (`clubStatus`) fra spillerdataene. Den lå en
// periode som navnelister i to egne motorfiler — én for Rosenborg og én for
// Vålerenga — med normalisert navnematching og aliaser som «Karl-Petter Løken»
// ved siden av «Karl-Petter «Kalle» Løken». Det er husregelen snudd på hodet:
// `data/*.json` er fasit, og en motor som inneholder 900 linjer spillernavn er
// en katalog forkledd som kode. Statusen bor nå på spilleren, og rangeringen
// leses av `CLUB_STATUS_RANK`.
//
// Ren ESM: ingen DOM, fetch, localStorage, Date.now eller Math.random. Motoren
// LESER History Go-progresjon som en liste inn; den skriver aldri til den.
// ============================================================================

export const CLUB_SQUAD_VERSION = "historygo-football-manager.club-squad.v3";

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

// Den automatiske grunntroppen. Et gulv som holder klubben spillbar uten at den
// gir bort det du skal samle deg til.
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

// Hva klubbvalget faktisk gir deg, og hva du må gjøre for å få resten.
export function resolveClubSquadAccess({
  club = null, players = [], unlockedPlaceIds = [], candidateIds = null, squadSize = 15
} = {}) {
  if (!club) return null;
  const homePlaceId = club.homePlaceId || null;
  const heritage = listClubHeritagePlayers({ homePlaceId, players });
  const visited = hasVisitedClubGround({ homePlaceId, unlockedPlaceIds });
  const groundName = club.ground || "klubbens bane";

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
        : "Grunntroppen holder klubben spillbar til flere spillere kommer til.",
      todo: heritage.length
        ? ["Velg blant klubbens historiske spillere når du setter troppen."]
        : ["Samle flere spillere gjennom stedene du besøker."]
    };
  }

  const heritageIds = new Set(heritage.map((player) => player.id));
  return {
    version: CLUB_SQUAD_VERSION,
    clubId: club.id, homePlaceId, groundName, visited: false,
    mode: "base",
    heritage: [],
    heritageCount: heritage.length,
    lockedCount: heritage.length,
    baseSquad: buildClubBaseSquad({ players, candidateIds, excludePlayerIds: heritageIds, size: squadSize }),
    headline: `Du har ikke vært på ${groundName}.`,
    detail: heritage.length
      ? `Du får en automatisk ${club.name}-tropp å starte med. Klubbens ${heritage.length} historiske spillere åpner seg når du besøker ${groundName} i History Go.`
      : `Du får en automatisk ${club.name}-tropp å starte med, og bygger laget videre ved å samle spillere.`,
    todo: [
      `Besøk ${groundName} i History Go for å låse opp klubbens historiske spillere.`,
      "Fram til da bygger du troppen ved å samle spillere andre steder."
    ]
  };
}
