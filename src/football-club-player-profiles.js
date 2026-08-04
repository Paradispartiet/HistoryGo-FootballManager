// ============================================================================
// Klubbspillerprofiler v1 — klubbstatus som berikelse, aldri ny spillerfasit
//
// Spilleren og fitmotoren eier fortsatt klasse, posisjoner, styrker, roller og
// taktisk bruk. Dette laget gjør klubbkonteksten eksplisitt:
//   - hvilken status spilleren har i klubbhistorien
//   - hvilke posisjoner profilen faktisk dokumenterer
//   - hvilke styrker og brukskostnader som allerede finnes i spillerdataene
//   - hvor sikkert hvert felt er
//
// Svakheter er IKKE frie historiske påstander. De beskrives gjennom spillerens
// eksisterende poorFits, dislikesTactics og warningWhenMisused, mens den
// eksisterende weakness-motoren fortsatt utleder trenbare svakheter.
// ============================================================================

export const CLUB_PLAYER_PROFILE_VERSION =
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

const ROSENBORG_STATUS_GROUPS = Object.freeze({
  club_icon: setOf([
    "Roar Strand",
    "Odd Iversen",
    "Harald Martin Brattbakk",
    "Jahn Ivar «Mini» Jakobsen",
    "Erik Hoftun",
    "Bent Skammelsrud",
    "Ola By Rise",
    "Sverre Brandhaug",
    "Karl-Petter «Kalle» Løken"
  ]),
  club_legend: setOf([
    "Rune Bratseth",
    "Steffen Iversen",
    "Gøran Sørloth",
    "Ørjan Berg",
    "Kåre Rønnes",
    "Harald Sunde",
    "Mikael Dorsin",
    "Fredrik Winsnes",
    "Ståle Stensaas",
    "Bjørn Otto Bragstad",
    "Ole Christer Basma",
    "Pål André Helland",
    "Mike Jensen",
    "Tore Reginiussen",
    "André Hansen",
    "Frode Johnsen",
    "Rade Prica",
    "Alexander Søderlund",
    "Jan Christiansen",
    "Sverre Fornes",
    "Birger Tingstad",
    "Kjell Hvidsand",
    "Trond Henriksen",
    "Jan Hansen",
    "Knut Torbjørn Eggen"
  ]),
  elite_career: setOf([
    "John Carew",
    "Øyvind Leonhardsen",
    "Stig Inge Bjørnebye",
    "Svein Grøndalen",
    "Vidar Riseth",
    "Mikael Lustig",
    "Rune Almenning Jarstein",
    "Alexander Tettey",
    "Per Ciljan Skjelbred",
    "Sigurd Rushfeldt",
    "Daniel Braaten",
    "Jonas Svensson",
    "Birger Meling",
    "Anthony Annan",
    "Borek Dočkal",
    "Ole Selnæs",
    "Fredrik Midtsjø",
    "Nicklas Bendtner",
    "Tarik Elyounoussi",
    "Thorstein Helstad",
    "Roger Albertsen",
    "Hassan El Fakiri",
    "Sebastián Eguren",
    "Besart Berisha"
  ]),
  golden_era_core: setOf([
    "Bjørn Tore Kvarme",
    "André Bergdølmo",
    "Vegard Heggem",
    "Runar Berg",
    "Kåre Ingebrigtsen",
    "Trond Sollied",
    "Trond Egil Soltvedt",
    "Tore André Dahlum",
    "Jan-Derek Sørensen",
    "Dagfinn Enerly",
    "Øyvind Storflor",
    "Jørn Jamtfall",
    "Árni Gautur Arason",
    "Espen Johnsen"
  ]),
  academy_export: setOf([
    "Sverre Nypan",
    "Marius Broholm",
    "Marius Sivertsen Broholm",
    "Emil Konradsen Ceïde",
    "Erik Botheim",
    "Sander Tangvik",
    "Torbjørn Lysaker Heggem",
    "Aslak Fonn Witry",
    "Erlend Dahl Reitan",
    "Edvard Sandvik Tagseth",
    "Mikkel Konradsen Ceïde",
    "Jesper Reitan-Sunde"
  ]),
  short_stay_star: setOf([
    "John Carew",
    "Rune Almenning Jarstein",
    "Petter Belsvik",
    "Arne Dokken",
    "Janne Saarinen",
    "Karim Essediri",
    "Sebastián Eguren",
    "Besart Berisha"
  ])
});

// Bare dokumenterte korreksjoner av profiler som ellers blir for grove.
// Posisjonskodene er de samme som resten av spillet bruker.
const ROSENBORG_POSITION_OVERRIDES = new Map(Object.entries({
  "Karl-Petter «Kalle» Løken": {
    naturalPositions: ["RW", "RB"],
    usablePositions: ["ST"],
    note: "Høyresideprofil: ving/angriper i toppscorersesongen, senere også back."
  },
  "Bent Skammelsrud": {
    naturalPositions: ["CM", "DM"],
    usablePositions: ["AM"],
    note: "Sentral midtbanedirigent; AM er sekundær bruk, ikke hovedposisjon."
  },
  "Jahn Ivar «Mini» Jakobsen": {
    naturalPositions: ["RW", "LW"],
    usablePositions: ["ST"],
    note: "Kantspiller på begge sider, med spissbruk som sekundær løsning."
  },
  "Sverre Brandhaug": {
    naturalPositions: ["CM", "AM"],
    usablePositions: ["DM"],
    note: "Sentral playmaker/indreløper med offensiv og dyp bruk."
  },
  "Roar Strand": {
    naturalPositions: ["CM"],
    usablePositions: ["AM", "RB", "RW"],
    note: "Primært indreløper; dokumentert allsidighet på høyresiden."
  },
  "Kåre Rønnes": {
    naturalPositions: ["CB", "RB"],
    usablePositions: ["DM"],
    note: "Forsvarer/half i eldre posisjonsspråk."
  },
  "Harald Sunde": {
    naturalPositions: ["RW", "ST"],
    usablePositions: ["AM"],
    note: "Høyreving og angriper."
  },
  "Nils Arne Eggen": {
    naturalPositions: ["CB"],
    usablePositions: ["DM"],
    note: "Forsvarer/half som spiller; trenerstatus holdes utenfor spillerklassen."
  },
  "Svein Grøndalen": {
    naturalPositions: ["LB", "CB"],
    usablePositions: [],
    note: "Venstreback og stopper."
  },
  "Ørjan Berg": {
    naturalPositions: ["CM", "AM"],
    usablePositions: ["DM"],
    note: "Sentral/offensiv midtbanespiller, også brukt dypere."
  },
  "Vidar Riseth": {
    naturalPositions: ["CB", "DM"],
    usablePositions: ["LB"],
    note: "Stopper og defensiv midtbane, med venstresidebruk."
  },
  "Per Ciljan Skjelbred": {
    naturalPositions: ["CM"],
    usablePositions: ["DM", "AM", "RW"],
    note: "Sentral midtbane med bred rollebruk."
  },
  "Alexander Tettey": {
    naturalPositions: ["DM", "CM"],
    usablePositions: ["CB"],
    note: "Defensiv/sentral midtbane, med stopperbruk."
  },
  "Mikael Lustig": {
    naturalPositions: ["RB"],
    usablePositions: ["CB", "WB"],
    note: "Høyreback, også stopper og vingback."
  },
  "Stig Inge Bjørnebye": {
    naturalPositions: ["LB"],
    usablePositions: ["WB"],
    note: "Venstreback med offensiv bredde."
  },
  "Gøran Sørloth": {
    naturalPositions: ["ST"],
    usablePositions: [],
    note: "Midtspiss."
  },
  "Rune Bratseth": {
    naturalPositions: ["CB"],
    usablePositions: [],
    note: "Midtstopper/libero."
  },
  "Ola By Rise": {
    naturalPositions: ["GK"],
    usablePositions: [],
    note: "Keeper."
  },
  "Tor Røste Fossen": {
    naturalPositions: ["GK"],
    usablePositions: [],
    note: "Keeper."
  },
  "Sverre Fornes": {
    naturalPositions: ["GK"],
    usablePositions: [],
    note: "Keeper."
  },
  "Geir Karlsen": {
    naturalPositions: ["GK"],
    usablePositions: [],
    note: "Keeper."
  },
  "Jørn Jamtfall": {
    naturalPositions: ["GK"],
    usablePositions: [],
    note: "Keeper."
  },
  "Árni Gautur Arason": {
    naturalPositions: ["GK"],
    usablePositions: [],
    note: "Keeper."
  },
  "Espen Johnsen": {
    naturalPositions: ["GK"],
    usablePositions: [],
    note: "Keeper."
  },
  "André Hansen": {
    naturalPositions: ["GK"],
    usablePositions: [],
    note: "Keeper."
  },
  "Daniel Örlund": {
    naturalPositions: ["GK"],
    usablePositions: [],
    note: "Keeper."
  },
  "Lars Hirschfeld": {
    naturalPositions: ["GK"],
    usablePositions: [],
    note: "Keeper."
  },
  "Alexander Lund Hansen": {
    naturalPositions: ["GK"],
    usablePositions: [],
    note: "Keeper."
  },
  "Sander Tangvik": {
    naturalPositions: ["GK"],
    usablePositions: [],
    note: "Keeper."
  }
}).map(([name, value]) => [normalizeName(name), Object.freeze(value)]));

const RBK_SOURCES = Object.freeze([
  Object.freeze({
    id: "rbk_official_players",
    label: "RBKs offisielle A-lagsspillerregister",
    url: "https://rbkmedia.no/statistikk/spillere.php",
    covers: ["club_affiliation", "appearances", "goals", "era"]
  }),
  Object.freeze({
    id: "rbk_official_records",
    label: "RBKs offisielle rekord- og merittoversikt",
    url: "https://rbkmedia.no/statistikk/",
    covers: ["club_status", "titles", "records"]
  }),
  Object.freeze({
    id: "snl_rbk",
    label: "Store norske leksikon: Rosenborg Ballklub",
    url: "https://snl.no/Rosenborg_Ballklub",
    covers: ["historical_context", "notable_players", "titles"]
  })
]);

const asArray = (value) => Array.isArray(value) ? value : [];
const uniq = (values) => [...new Set(asArray(values).filter(Boolean))];

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
    if (ROSENBORG_STATUS_GROUPS[id]?.has(key)) return id;
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
  if (ROSENBORG_STATUS_GROUPS.academy_export.has(key)) return "academy_export";
  if (ROSENBORG_STATUS_GROUPS.short_stay_star.has(key)) return "short_stay";
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

export function enrichClubPlayerProfile(player, { homePlaceId = null } = {}) {
  if (!player || typeof player !== "object") return player;
  const linked = Boolean(homePlaceId && asArray(player.sourcePlaceIds).includes(homePlaceId));
  if (!linked) return { ...player };

  const key = normalizeName(player.name);
  const correction = homePlaceId === "lerkendal_stadion"
    ? ROSENBORG_POSITION_OVERRIDES.get(key)
    : null;
  const statusId = homePlaceId === "lerkendal_stadion"
    ? (explicitStatus(player.name) || derivedStatus(player))
    : derivedStatus(player);
  const status = STATUS[statusId] || STATUS.club_profile;
  const naturalPositions = correction?.naturalPositions
    ? uniq(correction.naturalPositions)
    : uniq(player.naturalPositions);
  const usablePositions = correction?.usablePositions
    ? uniq(correction.usablePositions)
    : uniq(player.usablePositions);
  const positionEvidence = correction ? "researched_override" : "canonical_player_record";
  const statusEvidence = explicitStatus(player.name)
    ? "curated_club_history"
    : "derived_from_class_and_club_link";
  const grade = correction && explicitStatus(player.name) && player.classSource === "belagt"
    ? "A"
    : player.classSource === "belagt" && explicitStatus(player.name)
      ? "B"
      : "C";

  return {
    ...player,
    naturalPositions,
    usablePositions,
    clubProfile: Object.freeze({
      version: CLUB_PLAYER_PROFILE_VERSION,
      homePlaceId,
      clubId: homePlaceId === "lerkendal_stadion" ? "rosenborg" : null,
      statusId,
      statusLabel: status.label,
      statusRank: status.rank,
      tenureType: tenureType(player.name, statusId),
      documentedPositions: Object.freeze(naturalPositions),
      secondaryPositions: Object.freeze(usablePositions),
      positionEvidence,
      positionNote: correction?.note || "",
      strengths: Object.freeze(uniq(player.strengths)),
      weaknessInputs: weaknessInputs(player),
      classSource: player.classSource || "utledet",
      statusEvidence,
      evidenceGrade: grade,
      sources: homePlaceId === "lerkendal_stadion" ? RBK_SOURCES : Object.freeze([])
    })
  };
}

export function enrichClubPlayerProfiles(players, { homePlaceId = null } = {}) {
  return asArray(players).map((player) => enrichClubPlayerProfile(player, { homePlaceId }));
}

export function getClubPlayerStatusDefinitions() {
  return STATUS;
}
