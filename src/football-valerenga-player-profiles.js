// ============================================================================
// Vålerenga-spillerprofiler v1
//
// Klubbkontekst for alle spillere som allerede er koblet til Intility Arena.
// Spilleren og de eksisterende motorene eier fortsatt klasse, styrker, roller,
// fit og svake sider. Denne modulen dokumenterer posisjon og klubbstatus uten
// å opprette en ny spillerkatalog eller en parallell ratingmotor.
// ============================================================================

export const VALERENGA_PLAYER_PROFILE_VERSION =
  "historygo-football-manager.club-player-profiles.v1";

const STATUS = Object.freeze({
  club_icon: Object.freeze({ label: "Klubbikon", rank: 7 }),
  club_legend: Object.freeze({ label: "Klubblegende", rank: 6 }),
  elite_career: Object.freeze({ label: "Elitekarriere", rank: 5 }),
  golden_era_core: Object.freeze({ label: "Gullalderens kjerne", rank: 5 }),
  key_player: Object.freeze({ label: "Nøkkelspiller", rank: 4 }),
  club_profile: Object.freeze({ label: "Klubbprofil", rank: 3 }),
  academy_export: Object.freeze({ label: "Akademi / eksport", rank: 3 }),
  short_stay_star: Object.freeze({ label: "Stjerne med kortere opphold", rank: 3 }),
  squad_profile: Object.freeze({ label: "Troppsprofil", rank: 2 })
});

const normalizeName = (value) => String(value || "")
  .normalize("NFKD")
  .replace(/[\u0300-\u036f]/g, "")
  .replace(/[«»"'’.]/g, "")
  .replace(/[^a-zA-Z0-9]+/g, " ")
  .trim()
  .toLowerCase();

const setOf = (names) => new Set(names.map(normalizeName));
const asArray = (value) => Array.isArray(value) ? value : [];
const uniq = (values) => [...new Set(asArray(values).filter(Boolean))];

const VALERENGA_STATUS_GROUPS = Object.freeze({
  club_icon: setOf([
    "Henry Johansen",
    "Henry «Tippen» Johansen",
    "Einar Larsen",
    "Einar «Bruno» Larsen",
    "Leif Eriksen",
    "Morten Berre",
    "Freddy dos Santos",
    "Kjetil Rekdal",
    "Vidar Davidsen",
    "Pål Jacobsen",
    "Thorleif Olsen",
    "Thorleif «Toffa» Olsen"
  ]),
  club_legend: setOf([
    "Bjarne Hansen",
    "Bjarne «Bamse» Hansen",
    "Per Knudsen",
    "Terje Hellerud",
    "Terje «Henger’n» Hellerud",
    "Erik Foss",
    "Tom R. Jacobsen",
    "Tom Jacobsen",
    "Egil Johansen",
    "Egil «Snapper’n» Johansen",
    "Daniel Fredheim Holm",
    "André Muri",
    "Christian Grindheim",
    "Tom Henning Hovi",
    "Øyvind Bolthof",
    "Dag Riisnæs",
    "Kjell Roar Kaasa",
    "Knut Henry Haraldsen",
    "Morten Haugen",
    "Mohammed Fellah",
    "Jonatan Tollås Nation",
    "Bjørn Arild Levernes",
    "Yngve Andersen",
    "Tor Andreassen",
    "Einar Jørum"
  ]),
  golden_era_core: setOf([
    "Tom R. Jacobsen",
    "Tom Jacobsen",
    "Egil Johansen",
    "Egil «Snapper’n» Johansen",
    "Erik Foss",
    "Morten Haugen",
    "Dag Roar Austmo",
    "Tor Brevik",
    "Stein Gran",
    "Lasse Eriksen",
    "Henning Bjarnøy",
    "Ernst Pedersen",
    "Stein Pedersen",
    "Jo Bergsvand",
    "Paal Fredheim",
    "Pål Fredheim",
    "Stein Madsen",
    "Petter Morstad",
    "Arnfinn Moen",
    "Terje Olsen"
  ]),
  elite_career: setOf([
    "Henning Berg",
    "Ronny Johnsen",
    "John Carew",
    "Tore André Flo",
    "Sander Berge",
    "Steffen Iversen",
    "Lars Bohinen",
    "Jørn Andersen",
    "Odd Iversen",
    "Nils Arne Eggen",
    "Martin Andresen",
    "Mohammed Abdellaoue",
    "Mohammed «Moa» Abdellaoue",
    "Kjetil Wæhler",
    "Geir Karlsen",
    "Erik Hagen",
    "Erik «Panzer» Hagen",
    "Per Edmund Mordt",
    "Jan-Derek Sørensen",
    "Pa-Modou Kah",
    "Jan Gunnar Solli",
    "Fredrik Winsnes",
    "Harmeet Singh",
    "Stefan Strandberg",
    "Kristofer Hæstad",
    "Magne Hoseth",
    "Petter Belsvik",
    "Ragnvald Soma",
    "Ola Kamara",
    "Giancarlo González",
    "Luton Shelton",
    "Fegor Ogude",
    "Viðar Örn Kjartansson",
    "Sam Adekugbe",
    "Chidera Ejuke"
  ]),
  academy_export: setOf([
    "Sander Berge",
    "Harmeet Singh",
    "Ghayas Zahid",
    "Håvard Nielsen",
    "Aron Dønnum",
    "Osame Sahraoui",
    "Felix Horn Myhre",
    "Odin Thiago Holm",
    "Ivan Näsberg",
    "Jones El-Abdellaoui",
    "Sidy Jatta",
    "Joshua King",
    "Amin Nouri",
    "Simen Juklerød"
  ]),
  short_stay_star: setOf([
    "Tore André Flo",
    "Steffen Iversen",
    "Odd Iversen",
    "Nils Arne Eggen",
    "Ronny Johnsen",
    "Sander Berge",
    "Petter Belsvik",
    "Magne Hoseth",
    "Bengt Sæternes",
    "Rune Lange",
    "Aki Riihilahti",
    "Isaac Boakye"
  ])
});

// Bare posisjoner som er godt dokumentert og som retter eller presiserer en
// for grov eksisterende profil. Eldre half-/løperroller mappes til dagens
// nærmeste posisjonskode; notatet bevarer den historiske nyansen.
const VALERENGA_POSITION_OVERRIDES = new Map(Object.entries({
  "Henry Johansen": {
    naturalPositions: ["GK"], usablePositions: [], note: "Keeper."
  },
  "Henry «Tippen» Johansen": {
    naturalPositions: ["GK"], usablePositions: [], note: "Keeper."
  },
  "Geir Karlsen": {
    naturalPositions: ["GK"], usablePositions: [], note: "Keeper."
  },
  "Tom R. Jacobsen": {
    naturalPositions: ["GK"], usablePositions: [], note: "Keeper."
  },
  "Tore Krogstad": {
    naturalPositions: ["GK"], usablePositions: [], note: "Keeper."
  },
  "Øyvind Bolthof": {
    naturalPositions: ["GK"], usablePositions: [], note: "Keeper."
  },
  "Árni Gautur Arason": {
    naturalPositions: ["GK"], usablePositions: [], note: "Keeper."
  },
  "Troy Perkins": {
    naturalPositions: ["GK"], usablePositions: [], note: "Keeper."
  },
  "Lars Hirschfeld": {
    naturalPositions: ["GK"], usablePositions: [], note: "Keeper."
  },
  "Henning Berg": {
    naturalPositions: ["CB", "RB"], usablePositions: [], note: "Midtstopper og høyreback."
  },
  "Ronny Johnsen": {
    naturalPositions: ["CB"], usablePositions: ["DM"], note: "Primært midtstopper, også defensiv midtbane."
  },
  "John Carew": {
    naturalPositions: ["ST"], usablePositions: [], note: "Midtspiss."
  },
  "Kjetil Rekdal": {
    naturalPositions: ["CM", "AM"], usablePositions: ["DM"], note: "Sentral/offensiv midtbane, også brukt dypere."
  },
  "Tore André Flo": {
    naturalPositions: ["ST"], usablePositions: [], note: "Midtspiss."
  },
  "Sander Berge": {
    naturalPositions: ["DM", "CM"], usablePositions: [], note: "Defensiv og sentral midtbane."
  },
  "Steffen Iversen": {
    naturalPositions: ["ST"], usablePositions: [], note: "Midtspiss."
  },
  "Lars Bohinen": {
    naturalPositions: ["CM", "AM"], usablePositions: [], note: "Sentral og offensiv midtbane."
  },
  "Jørn Andersen": {
    naturalPositions: ["ST"], usablePositions: [], note: "Midtspiss."
  },
  "Odd Iversen": {
    naturalPositions: ["ST"], usablePositions: [], note: "Midtspiss."
  },
  "Nils Arne Eggen": {
    naturalPositions: ["CB"], usablePositions: ["DM"], note: "Forsvarer/half som spiller; trenerstatus holdes utenfor spillerprofilen."
  },
  "Christian Grindheim": {
    naturalPositions: ["CM"], usablePositions: ["DM", "AM"], note: "Primært sentral midtbane."
  },
  "Pål Jacobsen": {
    naturalPositions: ["ST", "RW"], usablePositions: [], note: "Angrepsspiller, brukt både sentralt og fra høyresiden."
  },
  "Martin Andresen": {
    naturalPositions: ["CM", "DM"], usablePositions: ["AM"], note: "Sentral og defensiv midtbanedirigent."
  },
  "Mohammed Abdellaoue": {
    naturalPositions: ["ST"], usablePositions: [], note: "Midtspiss."
  },
  "Mohammed «Moa» Abdellaoue": {
    naturalPositions: ["ST"], usablePositions: [], note: "Midtspiss."
  },
  "Vidar Davidsen": {
    naturalPositions: ["CM", "RB"], usablePositions: ["DM"], note: "Sentral midtbane og høyreback."
  },
  "Kjetil Wæhler": {
    naturalPositions: ["CB"], usablePositions: [], note: "Midtstopper."
  },
  "Erik Hagen": {
    naturalPositions: ["CB"], usablePositions: [], note: "Midtstopper."
  },
  "Erik «Panzer» Hagen": {
    naturalPositions: ["CB"], usablePositions: [], note: "Midtstopper."
  },
  "Per Edmund Mordt": {
    naturalPositions: ["RB", "CB"], usablePositions: [], note: "Høyreback og midtstopper."
  },
  "Jan-Derek Sørensen": {
    naturalPositions: ["RW"], usablePositions: ["AM", "LW"], note: "Primært høyreving, også offensiv midtbane."
  },
  "Pa-Modou Kah": {
    naturalPositions: ["CB", "DM"], usablePositions: [], note: "Midtstopper og defensiv midtbane."
  },
  "Jan Gunnar Solli": {
    naturalPositions: ["RB", "RW"], usablePositions: ["CM"], note: "Høyresideprofil, også sentral midtbane."
  },
  "Fredrik Winsnes": {
    naturalPositions: ["CM"], usablePositions: ["DM"], note: "Sentral midtbane."
  },
  "Harmeet Singh": {
    naturalPositions: ["CM", "DM"], usablePositions: [], note: "Sentral og defensiv midtbane."
  },
  "Stefan Strandberg": {
    naturalPositions: ["CB"], usablePositions: [], note: "Midtstopper."
  },
  "Morten Berre": {
    naturalPositions: ["RW", "ST"], usablePositions: ["LW"], note: "Kant og spiss, med langvarig rollebruk i angrepsrekka."
  },
  "Freddy dos Santos": {
    naturalPositions: ["RB", "LB"], usablePositions: ["CM", "RW"], note: "Svært allsidig klubbspiller, primært back."
  },
  "Daniel Fredheim Holm": {
    naturalPositions: ["AM", "LW"], usablePositions: ["ST", "RW"], note: "Offensiv midtbane/kant, også spiss."
  },
  "André Muri": {
    naturalPositions: ["CB"], usablePositions: [], note: "Midtstopper."
  },
  "Tom Henning Hovi": {
    naturalPositions: ["LB", "CB"], usablePositions: [], note: "Venstreback og midtstopper."
  },
  "Egil Johansen": {
    naturalPositions: ["CM", "AM"], usablePositions: ["ST"], note: "Midtbane og angrep."
  },
  "Egil «Snapper’n» Johansen": {
    naturalPositions: ["CM", "AM"], usablePositions: ["ST"], note: "Midtbane og angrep."
  },
  "Erik Foss": {
    naturalPositions: ["RW", "AM"], usablePositions: [], note: "Høyreving og offensiv midtbane."
  },
  "Dag Riisnæs": {
    naturalPositions: ["AM", "CM"], usablePositions: [], note: "Kreativ offensiv/sentral midtbane."
  },
  "Kristofer Hæstad": {
    naturalPositions: ["CM", "DM"], usablePositions: [], note: "Sentral og defensiv midtbane."
  },
  "Magne Hoseth": {
    naturalPositions: ["CM", "AM"], usablePositions: ["LW"], note: "Sentral/offensiv midtbane."
  },
  "Luton Shelton": {
    naturalPositions: ["ST", "RW"], usablePositions: ["LW"], note: "Spiss og hurtig kantspiller."
  },
  "Giancarlo González": {
    naturalPositions: ["CB"], usablePositions: [], note: "Midtstopper."
  },
  "Fegor Ogude": {
    naturalPositions: ["DM", "CM"], usablePositions: [], note: "Defensiv og sentral midtbane."
  },
  "Viðar Örn Kjartansson": {
    naturalPositions: ["ST"], usablePositions: [], note: "Midtspiss."
  },
  "Sam Adekugbe": {
    naturalPositions: ["LB"], usablePositions: ["WB"], note: "Venstreback/vingback."
  },
  "Chidera Ejuke": {
    naturalPositions: ["LW"], usablePositions: ["RW", "AM"], note: "Primært venstreving."
  },
  "Ghayas Zahid": {
    naturalPositions: ["AM", "CM"], usablePositions: ["LW"], note: "Offensiv og sentral midtbane."
  },
  "Håvard Nielsen": {
    naturalPositions: ["ST", "RW"], usablePositions: ["LW"], note: "Spiss og kant."
  },
  "Aron Dønnum": {
    naturalPositions: ["RW"], usablePositions: ["AM", "LW"], note: "Høyreving/offensiv midtbane."
  },
  "Osame Sahraoui": {
    naturalPositions: ["LW"], usablePositions: ["AM", "RW"], note: "Venstreving/offensiv midtbane."
  },
  "Felix Horn Myhre": {
    naturalPositions: ["CM"], usablePositions: ["LB", "DM"], note: "Sentral midtbane, tidligere også venstreback."
  },
  "Odin Thiago Holm": {
    naturalPositions: ["CM", "AM"], usablePositions: [], note: "Sentral og offensiv midtbane."
  },
  "Ivan Näsberg": {
    naturalPositions: ["CB"], usablePositions: ["LB"], note: "Midtstopper, også venstreback."
  },
  "Jones El-Abdellaoui": {
    naturalPositions: ["RW"], usablePositions: ["LW", "ST"], note: "Kant/angrepsspiller."
  },
  "Sidy Jatta": {
    naturalPositions: ["ST"], usablePositions: [], note: "Midtspiss."
  }
}).map(([name, value]) => [normalizeName(name), Object.freeze(value)]));

const VALERENGA_SOURCES = Object.freeze([
  Object.freeze({
    id: "vif_official_history",
    label: "Vålerengas offisielle klubbhistorie",
    url: "https://www.vif-fotball.no/om-klubben/var-stolte-histore-ny",
    covers: ["club_status", "titles", "eras", "notable_players"]
  }),
  Object.freeze({
    id: "vif_official_player_history",
    label: "Vålerengas offisielle spiller- og helteartikler",
    url: "https://www.vif-fotball.no/nyheter",
    covers: ["club_affiliation", "appearances", "roles", "club_significance"]
  }),
  Object.freeze({
    id: "snl_valerenga",
    label: "Store norske leksikon: Vålerenga Fotball",
    url: "https://snl.no/Vålerenga_Fotball",
    covers: ["historical_context", "titles", "notable_players"]
  })
]);

function explicitStatus(name) {
  const key = normalizeName(name);
  for (const id of [
    "club_icon",
    "club_legend",
    "golden_era_core",
    "elite_career",
    "academy_export",
    "short_stay_star"
  ]) {
    if (VALERENGA_STATUS_GROUPS[id]?.has(key)) return id;
  }
  return null;
}

function derivedStatus(player) {
  const height = Number(player?.classHeight) || 0;
  if (height >= 89) return "elite_career";
  if (height >= 85) return "key_player";
  if (height >= 80) return "club_profile";
  return "squad_profile";
}

function tenureType(name, statusId) {
  const key = normalizeName(name);
  if (VALERENGA_STATUS_GROUPS.academy_export.has(key)) return "academy_export";
  if (VALERENGA_STATUS_GROUPS.short_stay_star.has(key)) return "short_stay";
  if (statusId === "club_icon") return "defining_figure";
  if (statusId === "club_legend" || statusId === "golden_era_core") return "long_or_defining_service";
  return "first_team_history";
}

function weaknessInputs(player) {
  return Object.freeze({
    poorFits: Object.freeze(uniq(player?.poorFits)),
    tacticalDislikes: Object.freeze(uniq(player?.dislikesTactics)),
    usageWarning: String(player?.warningWhenMisused || ""),
    derivation: "existing_player_data_and_weakness_engine"
  });
}

export function enrichValerengaPlayerProfile(player, { homePlaceId = null } = {}) {
  if (!player || typeof player !== "object") return player;
  const linked = Boolean(homePlaceId === "intility_arena"
    && asArray(player.sourcePlaceIds).includes(homePlaceId));
  if (!linked) return { ...player };

  const key = normalizeName(player.name);
  const correction = VALERENGA_POSITION_OVERRIDES.get(key) || null;
  const explicit = explicitStatus(player.name);
  const statusId = explicit || derivedStatus(player);
  const status = STATUS[statusId] || STATUS.club_profile;
  const naturalPositions = correction?.naturalPositions
    ? uniq(correction.naturalPositions)
    : uniq(player.naturalPositions);
  const usablePositions = correction?.usablePositions
    ? uniq(correction.usablePositions)
    : uniq(player.usablePositions);
  const grade = correction && explicit && player.classSource === "belagt"
    ? "A"
    : player.classSource === "belagt" && explicit
      ? "B"
      : "C";

  return {
    ...player,
    naturalPositions,
    usablePositions,
    clubProfile: Object.freeze({
      version: VALERENGA_PLAYER_PROFILE_VERSION,
      homePlaceId,
      clubId: "valerenga",
      statusId,
      statusLabel: status.label,
      statusRank: status.rank,
      tenureType: tenureType(player.name, statusId),
      documentedPositions: Object.freeze(naturalPositions),
      secondaryPositions: Object.freeze(usablePositions),
      positionEvidence: correction ? "researched_override" : "canonical_player_record",
      positionNote: correction?.note || "",
      strengths: Object.freeze(uniq(player.strengths)),
      weaknessInputs: weaknessInputs(player),
      classSource: player.classSource || "utledet",
      statusEvidence: explicit ? "curated_club_history" : "derived_from_class_and_club_link",
      evidenceGrade: grade,
      sources: VALERENGA_SOURCES
    })
  };
}

export function enrichValerengaPlayerProfiles(players, { homePlaceId = null } = {}) {
  return asArray(players).map((player) => enrichValerengaPlayerProfile(player, { homePlaceId }));
}
