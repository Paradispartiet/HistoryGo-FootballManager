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
  },
  {
    playerId: "sidad_najah_chooly",
    clubId: "junkeren",
    strengths: ["set_pieces"],
    claim: "«setter innsiden av venstrebeinet til! Ballen skrus eksemplarisk over muren»",
    source: "https://vglive.vg.no/fotball/junkeren-bod%C3%B8-glimt/692798/rapport",
    sourceKind: "press"
  },
  {
    playerId: "dardan_saeter_mehmeti",
    clubId: "kvik_halden",
    strengths: ["leadership"],
    claim: "«kontinuitet, profesjonalitet og lederskap»",
    source: "https://www.kvikhalden.no/news-article/1B94C429DDE44F6CB35A08083B271B8A",
    sourceKind: "club"
  },
  {
    playerId: "oskar_sundland_johnsen",
    clubId: "pors",
    strengths: ["movement"],
    claim: "«flink til å bevege seg mye i de riktige rommene»",
    source: "https://agent1.no/agent1-spar-norges-lag-til-unionsduellen/",
    sourceKind: "football_editorial"
  },
  {
    playerId: "dharmesh_navaratnam",
    clubId: "rana",
    strengths: ["work_rate"],
    claim: "«alltid gir 100%»",
    source: "https://www.strommen-if.no/nyheter/solberg-og-navaratnam-tar-ferden-videre",
    sourceKind: "club"
  },
  {
    playerId: "nicholas_marthinussen",
    clubId: "sandviken",
    strengths: ["duels"],
    claim: "«Duellsterk spiller, flink å kommunisere, god med ball.»",
    source: "https://www.brann.no/nyheter/disse-er-pa-varens-b-liste",
    sourceKind: "club"
  },
  {
    playerId: "steffen_lie_skalevik",
    clubId: "sotra",
    strengths: ["work_rate"],
    claim: "«Den hardtarbeidende midtspissen»",
    source: "https://historie.brann.no/spillere/steffen-lie-skaalevik/",
    sourceKind: "club"
  },
  {
    playerId: "ola_johannes_elvedahl",
    clubId: "trygg_lade",
    strengths: ["stamina"],
    claim: "«Voldsom løpskapasitet, og nesten umulig å gå forbi en mot en.»",
    source: "https://www.dagbladet.no/tema/karing-arets-lag-i-3-divisjon/84048919",
    sourceKind: "press"
  },
  {
    playerId: "nikolai_eide_ohr",
    clubId: "traff",
    strengths: ["stamina", "work_rate"],
    claim: "«Med stor løpskraft» og «en lojal, hardtarbeidende back»",
    source: "https://www.strommen-if.no/nyheter/to-nysigneringer-klare",
    sourceKind: "club"
  },
  {
    playerId: "mathias_tjoland",
    clubId: "vidar",
    strengths: ["work_rate", "finishing"],
    claim: "«en sterk arbeidsinnsats» og «en målscorer med stort reportoar og avslutninger»",
    source: "https://www.fkh.no/nyheter/heder-og-aere-i-akademiet",
    sourceKind: "club"
  },
  {
    playerId: "jacob_jorgensen",
    clubId: "bjarg",
    strengths: ["stamina"],
    claim: "«løpt inn over 11 km i snitt per kamp, ofte med siste energi i sluttminuttene»",
    source: "https://www.451.no/bredderykter-rett-fra-brattvag-til-serie-b/",
    sourceKind: "football_editorial"
  },
  {
    playerId: "jorgen_galta",
    clubId: "brattvag",
    strengths: ["one_vs_one", "pace"],
    claim: "«enorme éin-mot-éin-ferdigheiter, fart og offensive kraft»",
    source: "https://brattvag-il.no/herrelag/herrelaget/fire-nysigneringer",
    sourceKind: "club"
  },
  {
    playerId: "joachim_lundhagebakken",
    clubId: "eik_tonsberg",
    strengths: ["strength", "pace"],
    claim: "«en fysisk sterk spiller med god fart»",
    source: "https://elverumfotball.no/nyheter/joachim-21-klar-for-elverum",
    sourceKind: "club"
  },
  {
    playerId: "adam_tamrat_vik",
    clubId: "follo",
    strengths: ["shot_stopping"],
    claim: "«god til å stoppe skudd»",
    source: "https://www.vartoslo.no/adam-tamrat-vik-bydel-sagene-emil-tjostheim/skeids-nye-keeper-adam-tamrat-vik-19-sikter-mot-manchester-united/270601",
    sourceKind: "press"
  },
  {
    playerId: "mads_fagerli_halsoy",
    clubId: "junkeren",
    strengths: ["finishing"],
    claim: "«Mads Fagerli Halsøy satt ballen strålende opp i hjørnet.»",
    source: "https://www.fotball.no/landslag/norge-gutter-17/2019/g17-avsluttet-med-seier---en-kanonsterk-turnering/",
    sourceKind: "press"
  },
  {
    playerId: "oystein_lundblad_naesheim",
    clubId: "kvik_halden",
    strengths: ["set_pieces"],
    claim: "«på grunn av en vanvittig corner- fot fra Øystein Lundblad Næsheim»",
    source: "https://www.sprintjeloy.no/2019/05/14/poengdeling-mot-kvik-halden-2/",
    sourceKind: "club"
  },
  {
    playerId: "jonah_disch_lindvig",
    clubId: "pors",
    strengths: ["work_rate"],
    claim: "«Treningsiver: Jonah Disch Lindvig.»",
    source: "https://www.odd.no/sok/_/attachment/download/d3056c9d-1b57-4adb-ae0d-a6804bfb331b%3Ad12abc9ce82514a608562e07d3b23bf05bfb9f27/260217%20Odd%20%C3%85rsberetning%202025%20W.pdf",
    sourceKind: "club"
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
