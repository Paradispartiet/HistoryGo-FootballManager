// P2 source-claim-registeret — Store norske leksikon.
//
// P1 leste 18 arver og frøs nevneren på 936 eksklusive profiler. Alt utenfor de
// arvene sto igjen uten et sted å legge en kildebelagt styrke: importen nekter
// å ta imot `strengths` i en råfil, og P1-overlayet gjelder bare sine egne 18.
// Dette registeret er det stedet, i nøyaktig samme form.
//
// KILDEN ER DEN SAMME SOM P1 BRUKTE. Store norske leksikons taksonomi «Norske
// fotballspillere» har 305 biografier, og 171 av dem er navn katalogen alt har.
// SNL skriver ofte én setning som beskriver spillemåten — «taklingssterk back
// med gode defensive og offensive kvaliteter» — og det er den setningen, ikke
// kamper, mål eller trofeer, som kan bli en styrke.
//
// TO REGLER, BEGGE ARVET FRA P1:
//
//   * Ingenting utledes. En biografi som bare forteller karriere gir INGEN
//     styrker. Av 109 leste artikler bærer 55 en ferdighetspåstand; de øvrige
//     54 er DELVIS og står her ikke i det hele tatt.
//   * `claim` er kildens EGEN setning, ikke en parafrase. P1 skrev engelske
//     sammendrag av norske kilder; her siteres originalen, slik at påstanden
//     kan kontrolleres uten å åpne kilden på nytt. Sier kilden også hva
//     spilleren IKKE var — Erland Johnsens teknikk og pasningsspill, Vidar
//     Riseths «brukbare» hodespill — er det utelatt, og utelatelsen står i
//     sitatet.
//
// Registeret oppretter aldri en spiller og rører aldri posisjon, epoke eller
// klubbtilknytning. Det legger på `strengths`, og bare det.

export const P2_SOURCE_CLAIMS_VERSION = "historygo-football-manager.p2-source-claims.v1";

const documented = [
  {
    playerId: "andre_bergdolmo",
    strengths: ["game_reading", "tackling", "simple_passing", "overlapping_runs"],
    claim: "«André Bergdølmo var en fotballklok, teknisk dyktig og taklingssterk back som var god med begge bein. Som back gikk han ofte på offensive raid og hadde en god og presis pasningsfot.»",
    source: "https://snl.no/Andr%C3%A9_Bergd%C3%B8lmo"
  },
  {
    playerId: "arne_legernes",
    strengths: ["stamina", "simple_passing", "first_touch"],
    claim: "«Legernes var en kondisjonssterk og konstruktiv midtbanespiller i en tilbaketrukket rolle. Han var også teknisk god og pasningssikker.»",
    source: "https://snl.no/Arne_Legernes"
  },
  {
    playerId: "azar_karadas",
    strengths: ["strength"],
    claim: "«Som spiller var Karadaş først og fremst en stor og sterk spiss …»",
    source: "https://snl.no/Azar_Karada%C5%9F"
  },
  {
    playerId: "bjorn_helge_riise",
    strengths: ["work_rate", "stamina", "crossing"],
    claim: "«Riise var en arbeidsom og løpssterk midtbanespiller med en god innleggsfot.»",
    source: "https://snl.no/Bj%C3%B8rn_Helge_Riise"
  },
  {
    playerId: "erik_hoftun",
    strengths: ["duels", "leadership"],
    claim: "«Hoftun var en duellsterk midtstopper som i en årrekke var kaptein og samlingspunktet i Rosenborgs defensive spill, både i norsk serie og i Mesterligaen.»",
    source: "https://snl.no/Erik_Hoftun"
  },
  {
    playerId: "erik_mykland",
    strengths: ["dribbling", "agility", "final_pass", "stamina", "game_reading", "work_rate"],
    claim: "«Erik Mykland er kanskje Norges beste tekniske spiller gjennom tidene, med fantastiske driblinger, lynraske eller lure vendinger og uventede gjennombruddspasninger. Han var i tillegg løpssterk, fotballintelligent, arbeidet hardt og var god defensivt.»",
    source: "https://snl.no/Erik_Mykland"
  },
  {
    playerId: "erland_johnsen",
    strengths: ["tackling", "duels", "one_vs_one", "set_pieces", "heading", "aggression"],
    claim: "«… en god og taklingssterk duellspiller, spesielt god i situasjoner én mot én. I tillegg var han en god frisparkskytter og hodespiller.» Kilden navngir også svakhetene — teknikk og pasningsspill — som derfor ikke er ført.",
    source: "https://snl.no/Erland_Johnsen"
  },
  {
    playerId: "frode_johnsen",
    strengths: ["heading", "box_presence"],
    claim: "«På Rosenborg var hans viktigste egenskaper hodespillet og han hadde en egen evne til å være på rett sted til rett tid inne i motstanderens straffefelt.»",
    source: "https://snl.no/Frode_Johnsen"
  },
  {
    playerId: "henning_berg",
    strengths: ["strength", "aggression", "tackling", "heading"],
    claim: "«Som spiller var Berg var sterk og aggressiv, både som midtstopper og høyreback. Han var flink til å takle og god i hodespillet.»",
    source: "https://snl.no/Henning_Berg"
  },
  {
    playerId: "henrik_falchener",
    strengths: ["strength", "duels", "set_pieces"],
    claim: "«Falchener er en fysisk sterk midtstopper som er god i dueller og målfarlig på dødball.»",
    source: "https://snl.no/Henrik_Falchener"
  },
  {
    playerId: "jan_age_fjortoft",
    strengths: ["box_presence", "first_touch", "long_shots"],
    claim: "«Fjørtofts viktigste egenskap som spiss var killerinstinktet, posisjonere seg inne i feltet og være på riktig sted til riktig tid. Han var ikke spesielt rask, men teknisk dyktig, god med begge ben og blant annet kjent for sin skuddstyrke.»",
    source: "https://snl.no/Jan_%C3%85ge_Fj%C3%B8rtoft"
  },
  {
    playerId: "jan_birkelund",
    strengths: ["stamina", "heading", "tackling", "anticipation"],
    claim: "«Birkelund var en midtstopper av internasjonal klasse med god kondisjon, og like god på hodet som med beina. … kjent for sin rekkevidde og evne til å sette inn taklinger og rydde opp i rett øyeblikk.»",
    source: "https://snl.no/Jan_Birkelund"
  },
  {
    playerId: "jan_gunnar_solli",
    strengths: ["pace", "agility", "work_rate"],
    claim: "«Solli var en kjapp, lettbent, arbeidsom og anvendelig spiller som ble brukt i forskjellige posisjoner på banen …»",
    source: "https://snl.no/Jan_Gunnar_Solli"
  },
  {
    playerId: "jorn_andersen",
    strengths: ["finishing", "box_presence"],
    claim: "«Jørn Andersen var en målfarlig spiss som hadde en god skuddfot og evnen til å være på rett sted til rett tid.»",
    source: "https://snl.no/J%C3%B8rn_Andersen"
  },
  {
    playerId: "jostein_flo",
    strengths: ["strength", "jumping", "heading"],
    claim: "«Flo var ein høgreist kraftspiss med god spenst som skåra mange mål med hovudet …» Kilden omtaler ham også som «fysisk sterke Flo».",
    source: "https://snl.no/Jostein_Flo"
  },
  {
    playerId: "kjetil_waehler",
    strengths: ["pace", "marking", "tackling", "game_reading"],
    claim: "«Wæhler var en rask, markeringssterk og taklingssterk midtstopper med godt blikk for spillet.»",
    source: "https://snl.no/Kjetil_W%C3%A6hler"
  },
  {
    playerId: "lars_bohinen",
    strengths: ["first_touch", "flair", "dribbling", "finishing", "vision"],
    claim: "«Lars Bohinen var en teknisk, kreativ, driblesterk, målfarlig og anvendelig midtbanespiller med godt blikk for spillet.»",
    source: "https://snl.no/Lars_Bohinen"
  },
  {
    playerId: "martin_andresen",
    strengths: ["work_rate", "leadership", "tempo_control"],
    claim: "«Martin Andresen var en arbeidsom midtbanedirigent som spilte med stor autoritet og var en naturlig kaptein både på klubb- og landslag.»",
    source: "https://snl.no/Martin_Andresen"
  },
  {
    playerId: "mohammed_abdellaoue",
    strengths: ["strength", "finishing", "long_shots", "box_finishing"],
    claim: "«Mohammed Abdellaoue var en spiss som var sterk i kroppen, god med begge bein og en meget god avslutter. Han var kjent for sine knallharde og presist skudd og scoret like gjerne i posisjoner innenfor som utenfor sekstenmeteren.»",
    source: "https://snl.no/Mohammed_Abdellaoue"
  },
  {
    playerId: "morten_gamst_pedersen",
    strengths: ["finishing", "set_pieces", "crossing"],
    claim: "«Gamst Pedersen er en målfarlig venstre kantspiller, kjent for sine farlige frispark og gode innleggsfot.»",
    source: "https://snl.no/Morten_Gamst_Pedersen"
  },
  {
    playerId: "orjan_berg",
    strengths: ["work_rate", "first_touch"],
    claim: "«Berg var en arbeidsom midtbanespiller med et stort teknisk register.»",
    source: "https://snl.no/%C3%98rjan_Berg"
  },
  {
    playerId: "oyvind_leonhardsen",
    strengths: ["work_rate", "stamina", "finishing", "late_runs"],
    claim: "«Øyvind Leonhardsen var en treningsvillig, hardtarbeidende, løpssterk, anvendelig og målfarlig midtbanespiller … Han scoret gjerne mål på sine «Leo-løp», der han satte stor fart inn i motstanderens straffefelt …»",
    source: "https://snl.no/%C3%98yvind_Leonhardsen"
  },
  {
    playerId: "per_ciljan_skjelbred",
    strengths: ["first_touch", "vision"],
    claim: "«Per Ciljan Skjelbred er regnet som teknisk habil spiller med godt overblikk.»",
    source: "https://snl.no/Per_Ciljan_Skjelbred"
  },
  {
    playerId: "per_egil_ahlsen",
    strengths: ["long_shots", "set_pieces", "finishing"],
    claim: "«… gjorde han seg bemerket som en målfarlig og skuddsterk back med hele ni scoringer.» Kilden framhever et frisparkmål fra 30 meter i cupfinalen.",
    source: "https://snl.no/Per_Egil_Ahlsen"
  },
  {
    playerId: "petter_belsvik",
    strengths: ["finishing", "box_presence"],
    claim: "«Belsvik var en målfarlig spiss, som spesielt skåret mål på grunn av sin plasseringsevne, det vil si sin evne til å være på rett sted til rett tid.»",
    source: "https://snl.no/Petter_Belsvik"
  },
  {
    playerId: "petter_rudi",
    strengths: ["flair", "dribbling", "final_pass", "chance_creation", "long_shots"],
    claim: "«Petter Rudi var en offensiv og kreativ midtbanespiller, fintesterk og kjent for sine gjennombruddspasninger, som ofte skapte målsjanser for lagkameratene. Han hadde også en god skuddfot og scoret flere spektakulære mål på langskudd.»",
    source: "https://snl.no/Petter_Rudi"
  },
  {
    playerId: "roger_albertsen",
    strengths: ["work_rate", "aggression", "tackling", "finishing", "flair"],
    claim: "«Albertsen var en svært energisk spiller med høyt temperament på banen som av og til gikk vel hardt inn i taklinger. … han kunne, ved siden av å være grovarbeider på midtbanen, bidra med tekniske finesser og være målfarlig.»",
    source: "https://snl.no/Roger_Albertsen"
  },
  {
    playerId: "ruben_yttergard_jenssen",
    strengths: ["first_touch", "game_reading", "composure"],
    claim: "«Yttergård Jenssen er en stødig midtbanespiller med gode tekniske ferdigheter og stor fotballforståelse.»",
    source: "https://snl.no/Ruben_Ytterg%C3%A5rd_Jenssen"
  },
  {
    playerId: "runar_berg",
    strengths: ["first_touch", "work_rate", "passing_range"],
    claim: "«I likhet med andre i Berg-familien var han teknisk briljant, jobbet hardt på banen og slo pasninger av høy klasse.»",
    source: "https://snl.no/Runar_Berg"
  },
  {
    playerId: "stale_solbakken",
    strengths: ["leadership", "vision", "box_presence"],
    claim: "«Som spiller var han en ledertype både på og utenfor banen. … Som spiller var Ståle Solbakken en offensiv midtbanestrateg med målteft.»",
    source: "https://snl.no/St%C3%A5le_Solbakken"
  },
  {
    playerId: "stefan_johansen",
    strengths: ["flair", "vision", "finishing", "leadership"],
    claim: "«Stefan Johansen er en kreativ midtbanespiller med fint driv, godt blikk for spillet og evne til å skåre mål. … Med sine gode lederegenskaper har Johansen vært kaptein for både klubber og landslag.»",
    source: "https://snl.no/Stefan_Johansen"
  },
  {
    playerId: "steffen_iversen",
    strengths: ["box_presence", "heading", "first_touch", "finishing"],
    claim: "«Steffen Iversen var en spiss med god målteft, stor hodestyrke, teknisk god og flink avslutter som har scoret jevnt og trutt på både klubb- og landslag.»",
    source: "https://snl.no/Steffen_Iversen"
  },
  {
    playerId: "stein_thunberg",
    strengths: ["first_touch", "game_reading", "final_pass"],
    claim: "«Thunberg var en teknisk begavet spiller … Han utmerket seg med god spilleforståelse, lekre gjennombruddspasninger og kunne skyte med begge bein.»",
    source: "https://snl.no/Stein_Thunberg"
  },
  {
    playerId: "svein_grondalen",
    strengths: ["work_rate", "pace", "tackling", "heading", "duels", "aggression"],
    claim: "«Svein Grøndalen var en hardtarbeidende, rask, taklingssterk og kompromissløs back, solid i lufta, tøff i duellene og som ofte spilte på grensen til det lovlige.»",
    source: "https://snl.no/Svein_Gr%C3%B8ndalen"
  },
  {
    playerId: "thor_spydevold",
    strengths: ["vision", "finishing"],
    claim: "«Han var kjent for sitt gode overblikk og spilte også mange gode kamper som playmaker.» Kilden sier også at han som ung var «en målfarlig spiss».",
    source: "https://snl.no/Thor_Spydevold"
  },
  {
    playerId: "tor_egil_johansen",
    strengths: ["strength", "duels", "leadership"],
    claim: "«Han var fysisk tøff, god i dueller og en ledertype som gikk foran og inspirerte lagkameratene på banen.»",
    source: "https://snl.no/Tor_Egil_Johansen"
  },
  {
    playerId: "trond_andersen",
    strengths: ["tackling", "stamina", "positioning"],
    claim: "«Trond Andersen var en taklingssterk spiller med god løpskapasitet og plasseringsevne.»",
    source: "https://snl.no/Trond_Andersen"
  },
  {
    playerId: "vidar_riseth",
    strengths: ["pace", "first_touch"],
    claim: "«Han var forholdsvis hurtig, hadde god teknikk og var en brukbar hodespiller.» «Brukbar» er ikke en styrke, så hodespillet er ikke ført.",
    source: "https://snl.no/Vidar_Riseth"
  },
];

export const P2_DOCUMENTED = Object.freeze(documented.map((entry) => Object.freeze({
  ...entry,
  strengths: Object.freeze([...entry.strengths])
})));

const BY_ID = new Map(P2_DOCUMENTED.map((entry) => [entry.playerId, entry]));

/** Kildeposten for én spiller, eller null. */
export function getP2SourceRecord(player) {
  return BY_ID.get(player?.id) || null;
}

/**
 * Legger de kildebelagte styrkene på én profil.
 *
 * P1 vinner ved overlapp. Registeret her rører bare spillere P1 ikke dekker, og
 * `applyP2SourceClaims` kalles ETTER P1 i attributtlaget — men en profil som
 * alt har styrker blir stående, slik at rekkefølgen ikke kan snu et resultat.
 */
export function applyP2SourceClaimsToPlayer(player) {
  const record = BY_ID.get(player?.id);
  if (!record) return player;
  if (Array.isArray(player.strengths) && player.strengths.length > 0) return player;
  return { ...player, strengths: [...record.strengths] };
}

export function applyP2SourceClaims(players) {
  return (Array.isArray(players) ? players : []).map(applyP2SourceClaimsToPlayer);
}
