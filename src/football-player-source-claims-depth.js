// Source-depth claims utenfor P1/P2.
//
// P1 eier de 18 frosne heritage-populasjonene. P2 er SNL-registeret for
// profiler utenfor P1. Dette laget er for senere, eksplisitt kildearbeid på
// eksisterende profiler som verken tilhører P1 eller allerede har en P2-post.
//
// Kontrakten er smal:
//   * registeret kan bare legge på `strengths`;
//   * identitet, klubbtilknytning, posisjon, epoke og classHeight røres aldri;
//   * eksisterende styrker vinner alltid;
//   * hvert token må bæres av en konkret, sitert ferdighetsbeskrivelse.
//
export const SOURCE_DEPTH_CLAIMS_VERSION = "historygo-football-manager.source-depth-claims.v1";

const documented = [
  {
    playerId: "ivar_johannes_jakobsen_unhjem",
    clubId: "junkeren",
    strengths: ["pace", "finishing"],
    claim: "«Hurtig og en meget solid avslutter»",
    source: "https://www.norskfotball.com/blogg/3-divisjonstipset-avdeling-5",
    sourceKind: "football_editorial"
  },
  {
    playerId: "beltran_mvuka",
    clubId: "sandviken",
    strengths: ["pace"],
    claim: "«da mister jeg farten. Og den vil jeg gjerne beholde.»",
    source: "https://www.sandefjordfotball.no/nyheter/belly-bestemte-seg-helt-mot-slutten",
    sourceKind: "club"
  },
  {
    playerId: "simen_haughom",
    clubId: "vidar",
    strengths: ["work_rate", "finishing"],
    claim: "«Er intensiv i spillestilen, jobber hardt og kriger for laget. ... Haughom er smart, flink til å time løpene og en skarpskytter!»",
    source: "https://fkvidar.no/her-er-de-beste-spillerne-i-alle-divisjoner-i-lokalfotballen-aftenbladet/",
    sourceKind: "club"
  },
  {
    playerId: "axel_ahlander",
    clubId: "bjarg",
    strengths: ["vision", "decisions"],
    claim: "«God med ball, god fotballforståelse og gjør mange kloke valg gjennom hele kampen.»",
    source: "https://www.dagbladet.no/tema/karing-arets-lag-i-3-divisjon/84048919",
    sourceKind: "press"
  },
  {
    playerId: "tobias_flem",
    clubId: "brattvag",
    strengths: ["pace"],
    claim: "«I tillegg er han hurtig og går gjerne på løp inn i boksen»",
    source: "https://www.miffotball.no/nyheter/tobias-flem-er-mif-spiller",
    sourceKind: "club"
  },
  {
    playerId: "albert_braut_tjaland",
    clubId: "follo",
    strengths: ["strength"],
    claim: "«målfarlig, stor og sterk»",
    source: "https://www.aftenposten.no/sport/fotball/i/qLaXXO/dette-stortalentet-er-erling-haalands-fetter-naa-kan-han-bli-molde-spiller",
    sourceKind: "press"
  }
];

export const SOURCE_DEPTH_DOCUMENTED = Object.freeze(documented.map((entry) => Object.freeze({
  ...entry,
  strengths: Object.freeze([...entry.strengths])
})));

const BY_ID = new Map(SOURCE_DEPTH_DOCUMENTED.map((entry) => [entry.playerId, entry]));

export function getSourceDepthRecord(player) {
  return BY_ID.get(player?.id) || null;
}

export function applySourceDepthClaimsToPlayer(player) {
  const record = BY_ID.get(player?.id);
  if (!record) return player;
  if (Array.isArray(player.strengths) && player.strengths.length > 0) return player;
  return { ...player, strengths: [...record.strengths] };
}

export function applySourceDepthClaims(players) {
  return (Array.isArray(players) ? players : []).map(applySourceDepthClaimsToPlayer);
}
