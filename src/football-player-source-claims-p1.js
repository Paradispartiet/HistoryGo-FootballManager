// P1 source-claim registry.
//
// The registry never creates membership. P1 membership is derived from the
// canonical player's single sourcePlaceId. The 13 new passes default to
// THIN-SOURCE; only the explicit records below may add strengths.

export const P1_SOURCE_CLAIMS_VERSION = "historygo-football-manager.p1-source-claims.v1";

export const P1_HERITAGES = Object.freeze([
  { key: "valerenga", placeId: "intility_arena", expectedExclusive: 66, generation: "existing", expectedDocumented: 13, expectedPartial: 5, expectedThin: 48, sourcePass: "Valerenga_66_eksklusive_spillerprofiler_dokumenterte_kvaliteter_HGFM_v1.md" },
  { key: "brann", placeId: "brann_stadion", expectedExclusive: 47, generation: "existing", expectedDocumented: 8, expectedPartial: 2, expectedThin: 37, sourcePass: "SK_Brann_47_eksklusive_spillerprofiler_dokumenterte_kvaliteter_HGFM_v1.md" },
  { key: "bodo_glimt", placeId: "aspmyra_stadion", expectedExclusive: 47, generation: "existing", expectedDocumented: 4, expectedPartial: 3, expectedThin: 40, sourcePass: "Bodo_Glimt_47_eksklusive_spillerprofiler_dokumenterte_kvaliteter_HGFM_v1.md" },
  { key: "viking", placeId: "lyse_arena", expectedExclusive: 51, generation: "existing", expectedDocumented: 6, expectedPartial: 2, expectedThin: 43, sourcePass: "Viking_FK_51_eksklusive_spillerprofiler_dokumenterte_kvaliteter_HGFM_v1.md" },
  { key: "lillestrom", placeId: "araasen_stadion", expectedExclusive: 24, generation: "existing", expectedDocumented: 3, expectedPartial: 3, expectedThin: 18, sourcePass: "Lillestrom_SK_24_eksklusive_spillerprofiler_dokumenterte_kvaliteter_HGFM_v1.md" },

  { key: "fredrikstad", placeId: "fredrikstad_stadion", expectedExclusive: 70, generation: "new" },
  { key: "skeid", placeId: "nordre_asen", expectedExclusive: 70, generation: "new" },
  { key: "aalesund", placeId: "color_line_stadion", expectedExclusive: 69, generation: "new" },
  { key: "odd", placeId: "skagerak_arena", expectedExclusive: 68, generation: "new" },
  { key: "start", placeId: "sor_arena", expectedExclusive: 60, generation: "new" },
  { key: "moss", placeId: "mellos_stadion", expectedExclusive: 58, generation: "new" },
  { key: "lyn", placeId: "bislett_stadion", expectedExclusive: 55, generation: "new" },
  { key: "tromso", placeId: "romssa_arena", expectedExclusive: 53, generation: "new" },
  { key: "kfum", placeId: "kfum_arena", expectedExclusive: 46, generation: "new" },
  { key: "bryne", placeId: "bryne_stadion", expectedExclusive: 41, generation: "new" },
  { key: "sandefjord", placeId: "jotun_arena", expectedExclusive: 41, generation: "new" },
  { key: "stabak", placeId: "nadderud_stadion", expectedExclusive: 41, generation: "new" },
  { key: "kristiansund", placeId: "nordmore_stadion", expectedExclusive: 29, generation: "new" }
]);

const documented = [
  {
    playerId: "per_kristoffersen",
    placeId: "fredrikstad_stadion",
    strengths: ["dribbling", "finishing", "positioning"],
    claim: "Store norske leksikon describes Kristoffersen as technically gifted, strong at dribbling, dangerous in front of goal and strong in his positioning.",
    source: "https://snl.no/Per_Kristoffersen"
  },
  {
    playerId: "arne_pedersen",
    placeId: "fredrikstad_stadion",
    strengths: ["final_pass", "finishing", "leadership", "stamina"],
    claim: "Store norske leksikon describes Pedersen as a playmaker who supplied assists, finished well, organised the team, took leadership responsibility and had strong endurance.",
    source: "https://snl.no/Arne_Pedersen_-_fotballspiller"
  },
  {
    playerId: "roar_johansen",
    placeId: "fredrikstad_stadion",
    strengths: ["strength", "stamina"],
    claim: "Store norske leksikon describes Johansen as physically strong and a constructive full-back with great running capacity.",
    source: "https://snl.no/Roar_Johansen"
  },
  {
    playerId: "arne_borresen",
    placeId: "fredrikstad_stadion",
    strengths: ["pace", "stamina"],
    claim: "Store norske leksikon describes Børresen as a strategist with great pace and work capacity.",
    source: "https://snl.no/Arne_B%C3%B8rresen"
  },
  {
    playerId: "harald_hennum",
    placeId: "nordre_asen",
    strengths: ["pace"],
    claim: "Store norske leksikon explicitly describes Hennum as a fast attacker with an energetic and mobile style.",
    source: "https://snl.no/Harald_Hennum"
  },
  {
    playerId: "frank_mathiesen",
    placeId: "color_line_stadion",
    strengths: ["shot_stopping", "jumping"],
    claim: "Aalesund's historical archive remembers Mathiesen for spectacular saves, enormous spring and exceptional reach on seemingly unreachable balls.",
    source: "https://www.aafk.no/historisk-arkiv/nyheter/da-fotballfeberen-brot-ut"
  },
  {
    playerId: "einar_jeja_gundersen",
    placeId: "skagerak_arena",
    strengths: ["heading"],
    claim: "Odd's club history describes Gundersen as an exceptional header of the ball who dominated the air and scored repeatedly with his head.",
    source: "https://www.odd.no/nyheter/hodespilleren"
  },
  {
    playerId: "svein_mathisen",
    placeId: "sor_arena",
    strengths: ["dribbling", "set_pieces", "final_pass"],
    claim: "Start's memorial texts explicitly describe Mathisen's unmatched dribbling, corner delivery and exquisite passing.",
    source: "https://www.ikstart.no/start-historien/sesongoversikter/sesongen-2011/start-legenden"
  },
  {
    playerId: "einar_jan_aas",
    placeId: "mellos_stadion",
    strengths: ["positioning", "pace"],
    claim: "Store norske leksikon describes Aas as a positionally secure and fast centre-back.",
    source: "https://snl.no/Einar_Jan_Aas"
  },
  {
    playerId: "magnar_isaksen",
    placeId: "bislett_stadion",
    strengths: ["stamina", "finishing", "final_pass"],
    claim: "Store norske leksikon describes Isaksen as having great work capacity, being a good finisher and an even better provider of defence-opening through passes.",
    source: "https://snl.no/Magnar_Isaksen"
  },
  {
    playerId: "petter_kykkeliky_jensen",
    placeId: "romssa_arena",
    strengths: ["pace", "dribbling"],
    claim: "Tromsø's historical player text calls Jensen fast and technically strong, and repeatedly identifies him as the club's dribble king.",
    source: "https://statistikk.til.no/spiller/petter-jensen"
  },
  {
    playerId: "ole_andreas_nilsen",
    placeId: "romssa_arena",
    strengths: ["dribbling"],
    claim: "Tromsø's player biography describes Nilsen as technically exceptionally gifted with a broad repertoire of feints.",
    source: "https://statistikk.til.no/spiller/ole-andreas-nilsen"
  },
  {
    playerId: "stian_sortevik",
    placeId: "kfum_arena",
    strengths: ["strength", "vision"],
    claim: "KFUM's all-time player feature describes Sortevik's extreme ball control, understanding, strength and overview; only directly mappable catalogue skills are retained.",
    source: "https://www.kaaffa.no/nyheter/han-er-tidenes-kaffa-spiller"
  },
  {
    playerId: "klaus_odden",
    placeId: "kfum_arena",
    strengths: ["balance", "long_shots", "tackling"],
    claim: "KFUM's all-time player feature explicitly describes Odden's exceptional balance, heavy shot and strong tackles.",
    source: "https://www.kaaffa.no/nyheter/han-er-tidenes-kaffa-spiller"
  },
  {
    playerId: "eivind_arnevag",
    placeId: "kfum_arena",
    strengths: ["finishing"],
    claim: "KFUM's all-time player feature explicitly describes Arnevåg as an extremely skilled finisher.",
    source: "https://www.kaaffa.no/nyheter/han-er-tidenes-kaffa-spiller"
  },
  {
    playerId: "christoffer_dahl",
    placeId: "kfum_arena",
    strengths: ["tackling", "duels", "stamina", "long_shots"],
    claim: "KFUM's all-time player feature describes Dahl as very strong at running, capable of forceful tackles and strong aerial duels, with notable shooting range.",
    source: "https://www.kaaffa.no/nyheter/han-er-tidenes-kaffa-spiller"
  },
  {
    playerId: "william_kurtovic",
    placeId: "jotun_arena",
    strengths: ["game_reading"],
    claim: "Sandefjord head coach Martí Cifuentes explicitly described Kurtovic as having good game understanding; generic 'technically good' wording is not converted into an invented technique token.",
    source: "https://www.sandefjordfotball.no/nyheter/ny-toarskontrakt-for-kurtovic"
  },

  // --- SNL-passet, 26.08.2026 -------------------------------------------------
  // Store norske leksikons taksonomi «Norske fotballspillere» ble lest i sin
  // helhet (305 biografier, 171 navn katalogen alt har). Elleve av dem hører til
  // en NY P1-arv og bærer en ferdighetspåstand. `claim` siterer kilden ordrett
  // her, i motsetning til postene over — en påstand som kan kontrolleres uten å
  // åpne kilden er verdt mer enn et sammendrag.
  {
    playerId: "bjorn_borgen",
    placeId: "fredrikstad_stadion",
    strengths: ["first_touch", "dribbling", "pace", "finishing"],
    claim: "«Bjørn Borgen var en teknisk briljant, fintesterk, rask og målfarlig ving …»",
    source: "https://snl.no/Bj%C3%B8rn_Borgen"
  },
  {
    playerId: "christer_basma",
    placeId: "nadderud_stadion",
    strengths: ["pace", "decisions", "simple_passing", "positioning"],
    claim: "«Basma kunne spille både offensivt og defensivt, og hadde først og fremst fordel av sin hurtighet. Han var også kjent for sine kloke valg, pasningsfot og plasseringsevne.»",
    source: "https://snl.no/Christer_Basma"
  },
  {
    playerId: "erik_johansen",
    placeId: "nordre_asen",
    strengths: ["game_reading", "first_touch", "simple_passing", "long_shots"],
    claim: "«Johansen var en fotballklok, ikke spesielt rask, men teknisk god offensiv spiller, pasningssikker og med en god skuddfot.»",
    source: "https://snl.no/Erik_Johansen"
  },
  {
    playerId: "espen_ruud",
    placeId: "skagerak_arena",
    strengths: ["finishing", "simple_passing", "set_pieces"],
    claim: "«Espen Ruud var en målfarlig og pasningssikker back, som blant annet har scoret en del mål på dødball for klubblagene sine.»",
    source: "https://snl.no/Espen_Ruud"
  },
  {
    playerId: "finn_gundersen",
    placeId: "nordre_asen",
    strengths: ["long_shots", "finishing"],
    claim: "«Som fotballspiller var Finn Gundersen en skuddsterk angrepsspiller …»",
    source: "https://snl.no/Finn_Gundersen"
  },
  {
    playerId: "fredrik_stromstad",
    placeId: "sor_arena",
    strengths: ["work_rate", "stamina", "first_touch", "final_pass", "late_runs"],
    claim: "«Strømstad var en hardtarbeidende og løpssterk midtbanespiller med gode tekniske ferdigheter, blant annet med gode gjennombruddspasninger og evne til å score mål på løp inn i motstanderens straffefelt.»",
    source: "https://snl.no/Fredrik_Str%C3%B8mstad"
  },
  {
    playerId: "gunnar_andersen",
    placeId: "bislett_stadion",
    strengths: ["first_touch", "strength", "simple_passing", "heading", "leadership"],
    claim: "«Gunnar Andersen var en teknisk god og robust spiller med en god pasningsfot og hodestyrke, men ikke så rask. Han var en sympatisk ledertype, kaptein både i klubb- og landslaget, og med evne til å inspirere andre til å yte noe ekstra.»",
    source: "https://snl.no/Gunnar_Andersen_-_idrettsut%C3%B8ver"
  },
  {
    playerId: "oivind_holmsen",
    placeId: "bislett_stadion",
    strengths: ["pace", "strength", "passing_range"],
    claim: "«Som spiller var Holmsen stor og atletisk, men med en hurtighet som overgikk norske og nordiske spillere på denne tiden. … spilte han mer på kraft enn teknikk, men hadde et godt tilslag og var pasningssikker, spesielt når det gjaldt langpasninger.»",
    source: "https://snl.no/%C3%98ivind_Holmsen"
  },
  {
    playerId: "ragnar_larsen",
    placeId: "skagerak_arena",
    strengths: ["stamina", "work_rate", "determination", "flair", "leadership"],
    claim: "«Han var også svært treningsvillig med god kondisjon, innsatsvilje og kreativitet, og ble blant annet kalt «en hardtarbeidende kriger på banen». … den som holdt laget sammen og gikk foran som leder og kaptein.»",
    source: "https://snl.no/Ragnar_Larsen"
  },
  {
    playerId: "tom_hogli",
    placeId: "romssa_arena",
    strengths: ["first_touch", "tackling", "overlapping_runs", "game_reading", "crossing"],
    claim: "«Høgli var en ballsikker og taklingssterk høyreback, som ofte gikk på offensive løp. Han var også flink til å lese spillet og slo gode innlegg.»",
    source: "https://snl.no/Tom_H%C3%B8gli"
  },
  {
    playerId: "trond_pedersen",
    placeId: "sor_arena",
    strengths: ["pace", "overlapping_runs"],
    claim: "«Han var en offensiv og rask back som spilte hele 277 førstedivisjonskamper.»",
    source: "https://snl.no/Trond_Pedersen"
  },
];

export const P1_NEW_DOCUMENTED = Object.freeze(documented.map((entry) => Object.freeze({
  ...entry,
  strengths: Object.freeze([...entry.strengths])
})));

// DELVIS is reserved for a source actually inspected in this pass that documents
// career/role but carries no reusable skill claim. The source-safe v2 pool files
// alone do not upgrade a profile from THIN-SOURCE; the earlier five pass files
// retain their own already-audited DELVIS identities.
export const P1_NEW_PARTIAL = Object.freeze([]);

const existingSupplements = [
  {
    playerId: "kenneth_storvik",
    placeId: "lyse_arena",
    strengths: ["dribbling", "one_vs_one"],
    claim: "Viking describes Storvik as a major technician who repeatedly ran defenders ragged during seven seasons at the club.",
    source: "https://www.vikingfotball.no/former-players/storvik-kenneth"
  },
  {
    playerId: "tom_lund",
    placeId: "araasen_stadion",
    strengths: ["vision"],
    claim: "Lillestrøm's memorial profile describes Lund as a player with rare technique and overview; only the directly mappable overview claim is retained as vision.",
    source: "https://www.lsk.no/nyheter/tusen-takk-for-alt-tommy"
  },
  {
    playerId: "alf_kaka_martinsen",
    placeId: "araasen_stadion",
    strengths: ["acceleration"],
    claim: "Store norske leksikon describes Martinsen as known for a change of pace, a low centre of gravity and quick steps that let him accelerate toward goal.",
    source: "https://snl.no/Alf_Martinsen"
  },

  // --- SNL-passet, 26.08.2026 -------------------------------------------------
  // Seks navn fra samme gjennomlesning hører til en EKSISTERENDE P1-arv.
  // `expectedDocumented` i P1_HERITAGES er flyttet tilsvarende: Brann 5 → 8,
  // Viking 4 → 6, Lillestrøm 2 → 3, og `expectedThin` ned med det samme.
  // Nevneren står urørt — det er dekningen som har flyttet seg, ikke arven.
  {
    playerId: "finn_berstad",
    placeId: "brann_stadion",
    strengths: ["first_touch", "finishing", "passing_range", "game_reading", "leadership"],
    claim: "«Berstad var en allsidig spiller, teknisk god og målfarlig med en utmerket pasningsfot. … endte til slutt opp som en taktisk klok back med gode defensive ferdigheter. … han den ubestridte lederen og kapteinen på klubblaget.»",
    source: "https://snl.no/Finn_Berstad"
  },
  {
    playerId: "gunnar_halle",
    placeId: "araasen_stadion",
    strengths: ["work_rate", "tackling"],
    claim: "«Gunnar Halle var en hardtarbeidende og taklingssterk back med gode defensive og offensive kvaliteter.»",
    source: "https://snl.no/Gunnar_Halle"
  },
  {
    playerId: "olav_nilsen",
    placeId: "lyse_arena",
    strengths: ["strength", "finishing", "first_touch", "game_reading", "tackling", "heading"],
    claim: "«Olav Nilsen var en fysisk sterk, målfarlig og teknisk glimrende midtbanespiller med et stort repertoar. I tillegg var han fotballklok, taklingssterk, god på hodet …»",
    source: "https://snl.no/Olav_Nilsen"
  },
  {
    playerId: "sigbjorn_slinning",
    placeId: "lyse_arena",
    strengths: ["work_rate", "pace", "tackling", "determination", "overlapping_runs"],
    claim: "«Slinning var en energisk, hurtig, kompromissløs og taklingssterk spiller med et ukuelig pågangsmot og vinnerinstinkt. … kjent for sine offensive raids og defensive løp langs sidelinjen …»",
    source: "https://snl.no/Sigbj%C3%B8rn_Slinning"
  },
  {
    playerId: "tore_pedersen",
    placeId: "brann_stadion",
    strengths: ["pace", "tackling", "heading", "game_reading", "positioning", "interceptions"],
    claim: "«Tore Pedersens fremste egenskaper var hurtigheten og taklingsevnen. Han var også god med hodet, hadde god spilleforståelse, plasseringsevne og evne til å bryte motstanderens pasningsspill.»",
    source: "https://snl.no/Tore_Pedersen"
  },
  {
    playerId: "trygve_andersen",
    placeId: "brann_stadion",
    strengths: ["strength", "duels", "tackling", "interceptions", "aggression"],
    claim: "«Andersen var en storvokst og robust spiller, duell- og taklingssterk, flink til å gjenvinne ballen og med en pågående spillestil.»",
    source: "https://snl.no/Trygve_Andersen"
  },
];

export const P1_EXISTING_SUPPLEMENTS = Object.freeze(existingSupplements.map((entry) => Object.freeze({
  ...entry,
  strengths: Object.freeze([...entry.strengths])
})));

const NEW_PLACE_IDS = new Set(P1_HERITAGES.filter((entry) => entry.generation === "new").map((entry) => entry.placeId));
const DOCUMENTED_BY_ID = new Map(P1_NEW_DOCUMENTED.map((entry) => [entry.playerId, entry]));
const PARTIAL_BY_ID = new Map(P1_NEW_PARTIAL.map((entry) => [entry.playerId, entry]));
const EXISTING_SUPPLEMENT_BY_ID = new Map(P1_EXISTING_SUPPLEMENTS.map((entry) => [entry.playerId, entry]));

export function getP1HeritageForPlayer(player) {
  const sourcePlaceIds = Array.isArray(player?.sourcePlaceIds) ? player.sourcePlaceIds : [];
  if (sourcePlaceIds.length !== 1) return null;
  return P1_HERITAGES.find((entry) => entry.placeId === sourcePlaceIds[0]) || null;
}

export function getP1NewSourceRecord(player) {
  const heritage = getP1HeritageForPlayer(player);
  if (!heritage || heritage.generation !== "new") return null;
  const documentedRecord = DOCUMENTED_BY_ID.get(player.id);
  if (documentedRecord) return { status: "DOKUMENTERT", ...documentedRecord };
  const partialRecord = PARTIAL_BY_ID.get(player.id);
  if (partialRecord) return { status: "DELVIS", ...partialRecord, strengths: [] };
  return {
    playerId: player.id,
    placeId: heritage.placeId,
    status: "THIN-SOURCE",
    strengths: [],
    claim: "No accepted descriptive individual source was found in this P1 pass.",
    source: null
  };
}

export function applyP1SourceClaimsToPlayer(player) {
  const heritage = getP1HeritageForPlayer(player);
  if (!heritage) return player;
  if (NEW_PLACE_IDS.has(heritage.placeId)) {
    const record = getP1NewSourceRecord(player);
    return { ...player, strengths: [...record.strengths] };
  }
  const supplement = EXISTING_SUPPLEMENT_BY_ID.get(player.id);
  if (supplement && supplement.placeId === heritage.placeId) {
    return { ...player, strengths: [...supplement.strengths] };
  }
  return player;
}

export function applyP1SourceClaims(players) {
  return (Array.isArray(players) ? players : []).map(applyP1SourceClaimsToPlayer);
}

// Backwards-compatible names used while the P1 branch was built audit-first.
export const applyP1NewSourceClaimsToPlayer = applyP1SourceClaimsToPlayer;
export const applyP1NewSourceClaims = applyP1SourceClaims;
