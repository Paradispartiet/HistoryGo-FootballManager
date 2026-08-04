// ============================================================================
// Klubbtropp v2 — arven ligger på banen, ikke i klubbvalget
//
// Tar du over Rosenborg, får du IKKE Eggens lag utdelt. Du får tilgang til
// klubbens historiske spillere — men bare hvis du faktisk har vært på Lerkendal.
// Har du ikke det, får du en automatisk tropp som holder klubben spillbar, og
// resten må du samle selv.
//
// v2 beriker klubbens historiske spillere med den profilen spillet allerede
// eier: dokumenterte posisjoner, styrker, brukskostnader og klubbstatus.
// Berikelsen endrer ikke klasse, fit eller kampmotor og lager ingen parallell
// spillerkatalog.
// ============================================================================

import {
  CLUB_PLAYER_PROFILE_VERSION,
  enrichClubPlayerProfiles
} from "./football-club-player-profiles.js";

export const CLUB_SQUAD_VERSION = "historygo-football-manager.club-squad.v2";

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

// Klubbens historiske spillere: de som er knyttet til klubbens egen bane.
// sourcePlaceIds er fortsatt sannhetskilden. Profilberikelsen endrer ikke hvem
// som tilhører klubbarven; den gjør bare den eksisterende spilleren lesbar.
// Sorteringen beholder classHeight som første nøkkel: eksisterende klubb- og
// testkontrakter skal ikke endres bare fordi statusfeltet blir rikere.
export function listClubHeritagePlayers({ homePlaceId = null, players = [] } = {}) {
  if (!homePlaceId) return [];
  return enrichClubPlayerProfiles(players, { homePlaceId })
    .filter((player) => asArray(player.sourcePlaceIds).includes(homePlaceId))
    .slice()
    .sort((a, b) =>
      num(b.classHeight) - num(a.classHeight)
      || num(b.clubProfile?.statusRank) - num(a.clubProfile?.statusRank)
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

function heritageSummary(player) {
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
    clubProfile: player.clubProfile || null
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
      profileVersion: CLUB_PLAYER_PROFILE_VERSION,
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
      profileVersion: CLUB_PLAYER_PROFILE_VERSION,
      clubId: club.id, homePlaceId, groundName, visited: true,
      mode: "heritage",
      heritage: heritage.map(heritageSummary),
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
        : ["Samle flere spillere gjennom stedene du besøker."
        ]
    };
  }

  const heritageIds = new Set(heritage.map((player) => player.id));
  return {
    version: CLUB_SQUAD_VERSION,
    profileVersion: CLUB_PLAYER_PROFILE_VERSION,
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
