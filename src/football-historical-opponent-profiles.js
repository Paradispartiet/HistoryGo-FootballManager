// HG Football Manager — Historical Opponent Archetypes v1
//
// Motstanderne i Kampdag er ikke generiske roboter (high_press_4222,
// low_block_532 …), men HISTORISKE STIL-LAG: kjente taktiske arketyper fra
// fotballhistorien, brukt som LÆRINGSMOTSTANDERE. Hver profil forteller hvilket
// historisk stilideal den representerer, hvilken taktisk skole og formasjon den
// bygger på, hvilke rom den angriper og beskytter, og hva manageren må forstå
// for å spille mot den.
//
// VIKTIG (juridisk/produktmessig): dette er historiske/taktiske LÆRINGSPROFILER,
// ikke lisensierte klubbrepresentasjoner. Ingen logoer, drakter, klubbemblemer
// eller offisiell grafikk brukes noe sted. Referansen er rent tekstlig og
// faglig — vi bruker både historisk referanse og et arketypenavn i visningen,
// f.eks. «Ajax 1971–73 — Totalfotball».
//
// Modulen er additiv og ren ESM: ingen DOM, ingen fetch, ingen localStorage,
// ingen app-state, ingen sideeffekter, ingen tilfeldighet. Den DUPLISERER ikke
// formasjonsbiblioteket — hver profil PEKER på en eksisterende formationId i
// data/hgFootball/formations.json og beskriver den historiske bruken.
//
// Profilene er RUNTIME-KOMPATIBLE med de generiske motstanderprofilene i
// football-matchday-engine.js: de bærer de samme numeriske feltene (strength,
// pressResistance, defensiveStructure, transitionThreat, chanceConversion) og de
// samme array-feltene (style, strengths, weaknesses, pressurePoints,
// matchupStyles) slik at xG-modellen, formasjons-matchupen, suggested setups og
// treningsprogram-scoringen kan lese dem UTEN endring. `baseStyleId` peker på en
// av de generiske profilenes id-er slik at kampmotorens hendelsesbibliotek
// (OPPONENT_EVENTS) gir en passende motstanderhendelse.
//
// I tillegg bærer hver profil et `styleTraits`-objekt (0–100) som
// evaluateHistoricalOpponentMatchup() bruker til en deterministisk, forklarende
// matchup-vurdering: hvilke av lagets rom/ledd den historiske stilen eksponerer.

function num(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function asArray(value) {
  return Array.isArray(value) ? value : [];
}

function clamp(value, min = 0, max = 100) {
  return Math.max(min, Math.min(max, num(value)));
}

function round2(value) {
  return Math.round(num(value) * 100) / 100;
}

// ----------------------------------------------------------------------------
// Profilene. 12 historiske stil-arketyper. styleTraits (0–100):
//   pressIntensity       – hvor høyt/aggressivt de presser
//   transitionThreat     – kontring-/overgangsfare
//   defensiveCompactness – kompakthet i lav/etablert blokk
//   highLine             – hvor høy forsvarslinjen ligger (bakrom å angripe)
//   shortBuildUp         – hvor mye de bygger kort bakfra (pressbart)
//   possessionControl    – hvor mye de dominerer ball/posisjon
//   tacticalComplexity   – systemets kompleksitet (straffer lav taktisk klarhet)
//   relationDemand       – hvor mye det krever presise egne relasjoner å bryte dem
//   intensity            – fysisk intensitet (gjør egen slitasje dyrere)
// ----------------------------------------------------------------------------
const RAW_HISTORICAL_OPPONENT_PROFILES = [
  {
    id: "hungary_1953_mighty_magyars",
    displayName: "Ungarn 1953 — Mighty Magyars",
    archetypeName: "Den dype nieren",
    era: "1953",
    referenceTeam: "Ungarns landslag (Aranycsapat)",
    referenceCoach: "Gusztáv Sebes",
    keyPlayers: ["dyptliggende nier", "indreløpere i rotasjon"],
    tacticalSchool: "Tidlig moderne kombinasjonsspill",
    formationId: "hungarian_mm_3232",
    formationFallback: false,
    inPossessionShape: "3-2-3-2 med tilbaketrukket nier",
    outOfPossessionShape: "3-2-3-2 i moderat blokk",
    pressShape: "Soneorientert press i midtbanen",
    defensiveBlock: "Middels blokk",
    buildUpStyle: "Kombinasjonsspill gjennom rotasjon",
    attackingStyle: "Posisjonsbytter og overbelastning sentralt",
    tempo: "Variabelt",
    riskLevel: "medium",
    style: "Tidlig moderne kombinasjonsspill med dyp nier",
    strength: 76,
    pressResistance: 74,
    defensiveStructure: 64,
    transitionThreat: 62,
    chanceConversion: 74,
    baseStyleId: "possession_opponent",
    matchupStyles: ["possession_positional", "switching_play", "build_from_back"],
    styleTraits: {
      pressIntensity: 55,
      transitionThreat: 62,
      defensiveCompactness: 50,
      highLine: 58,
      shortBuildUp: 65,
      possessionControl: 75,
      tacticalComplexity: 80,
      relationDemand: 75,
      intensity: 58
    },
    strengths: ["trekker stoppere ut av posisjon med dyp nier", "rotasjoner skaper overtall sentralt"],
    weaknesses: ["rom bak de offensive bevegelsene", "sårbar for fysisk press hvis rytmen brytes"],
    vulnerableZones: ["bakrommet bak rotasjonene", "andreballer når kombinasjonen brytes"],
    dangerZones: ["mellomrommet mellom forsvar og midtbane", "den dype nierens sone"],
    keyBattles: ["dine stoppere mot den dype nieren", "midtbanekontroll mot rotasjonsspillet"],
    pressurePoints: ["disiplin på hvem som følger nieren", "tålmodighet uten å bli dratt ut av form"],
    managerHints: [
      "Bli enige om hvem som følger den dype nieren — ellers åpnes mellomrommet.",
      "Bryt rytmen deres med fysisk press, men ikke stykkevis og ukoordinert."
    ],
    historicalNote: "Ungarn 1953 viste den dype nieren og rotasjoner som forløper til moderne bevegelsesspill.",
    learningFocus: "Forstå hvordan en tilbaketrukket spiss og rotasjon skaper mellomromsproblemer."
  },
  {
    id: "brazil_1970_creative_424",
    displayName: "Brasil 1970 — Kreativ 4-2-4",
    archetypeName: "Den tekniske friheten",
    era: "1970",
    referenceTeam: "Brasils landslag",
    referenceCoach: "Mário Zagallo",
    keyPlayers: ["flere tiere på laget", "kreative kantspillere"],
    tacticalSchool: "Brasiliansk 4-2-4 / fleksibel offensiv",
    formationId: "brazil_424",
    formationFallback: false,
    inPossessionShape: "4-2-4 som flyter mot 4-3-3",
    outOfPossessionShape: "4-4-2 i moderat blokk",
    pressShape: "Lett press, prioriterer ballbesittelse",
    defensiveBlock: "Middels blokk",
    buildUpStyle: "Teknisk oppspill med mange skapere",
    attackingStyle: "Kreativ offensiv struktur med frihet",
    tempo: "Høyt når rommet finnes",
    riskLevel: "medium",
    style: "Teknisk frihet i fleksibel 4-2-4/4-3-3",
    strength: 78,
    pressResistance: 72,
    defensiveStructure: 60,
    transitionThreat: 70,
    chanceConversion: 78,
    baseStyleId: "possession_opponent",
    matchupStyles: ["possession_positional", "switching_play", "wide_overload"],
    styleTraits: {
      pressIntensity: 42,
      transitionThreat: 70,
      defensiveCompactness: 45,
      highLine: 55,
      shortBuildUp: 55,
      possessionControl: 72,
      tacticalComplexity: 62,
      relationDemand: 70,
      intensity: 55
    },
    strengths: ["mange kreative skapere i samme lag", "individuell teknikk som bryter blokker"],
    weaknesses: ["kan gi overgangsrom hvis laget mister balanse", "ikke alltid kompakt uten ball"],
    vulnerableZones: ["rom bak offensive backer", "balansen ved eget balltap"],
    dangerZones: ["siste tredjedel sentralt", "halvrommene der tierne får ballen"],
    keyBattles: ["din midtbanebalanse mot deres skapere", "ditt restforsvar mot deres overganger"],
    pressurePoints: ["sikring bak ballen ved angrep", "kompakthet sentralt"],
    managerHints: [
      "Hold balansen i midtbanen — ikke alle skal fram samtidig mot dette laget.",
      "Sikre restforsvaret; deres styrke blir farlig nettopp når du selv mister ballen."
    ],
    historicalNote: "Brasil 1970 forente teknisk frihet med en fleksibel offensiv struktur.",
    learningFocus: "Hvordan møte teknisk overtak uten å miste egen balanse."
  },
  {
    id: "ajax_1971_73_total_football",
    displayName: "Ajax 1971–73 — Totalfotball",
    archetypeName: "Totalfotballmaskinen",
    era: "1971–1973",
    referenceTeam: "Ajax-inspirert totalfotball",
    referenceCoach: "Rinus Michels / Ștefan Kovács-skole",
    keyPlayers: ["dirigerende nier", "rotasjonsbacker"],
    tacticalSchool: "Total Football",
    formationId: "total_433",
    formationFallback: false,
    inPossessionShape: "4-3-3 med konstant posisjonsrotasjon",
    outOfPossessionShape: "Høy 4-3-3-blokk",
    pressShape: "Høyt, kollektivt press",
    defensiveBlock: "Høy linje",
    buildUpStyle: "Kort oppbygging med rotasjon",
    attackingStyle: "Posisjonsbytter og romkontroll",
    tempo: "Høyt",
    riskLevel: "high",
    style: "Totalfotball: press, posisjonsbytter og høy linje",
    strength: 80,
    pressResistance: 78,
    defensiveStructure: 66,
    transitionThreat: 66,
    chanceConversion: 74,
    baseStyleId: "high_press_opponent",
    matchupStyles: ["high_press", "possession_positional", "build_from_back"],
    styleTraits: {
      pressIntensity: 82,
      transitionThreat: 65,
      defensiveCompactness: 52,
      highLine: 85,
      shortBuildUp: 75,
      possessionControl: 78,
      tacticalComplexity: 90,
      relationDemand: 80,
      intensity: 78
    },
    strengths: ["kollektivt press som kveler oppbygging", "alle kan spille alle posisjoner"],
    weaknesses: ["rom bak en svært høy linje", "krever ekstrem taktisk klarhet — straffer rot"],
    vulnerableZones: ["bakrommet bak den høye linja", "sekundene rett etter at presset brytes"],
    dangerZones: ["din egen oppbyggingssone", "halvrommene de roterer inn i"],
    keyBattles: ["din oppbygging mot deres press", "din dybdetrussel mot deres høye linje"],
    pressurePoints: ["pressresistent oppbygging", "en direkte utvei når presset blir for hardt"],
    managerHints: [
      "Spill deg forbi det høye presset — eller gå direkte i bakrommet bak linja.",
      "Krev taktisk klarhet; mot totalfotball straffer rot deg umiddelbart."
    ],
    historicalNote: "Ajax 1971–73 gjorde totalfotballen til et system av press og posisjonsrotasjon.",
    learningFocus: "Hvordan bryte et høyt, koordinert press og utnytte en høy linje."
  },
  {
    id: "netherlands_1974_total_football",
    displayName: "Nederland 1974 — Ekstrem totalfotball",
    archetypeName: "Romkontrollørene",
    era: "1974",
    referenceTeam: "Nederlands landslag",
    referenceCoach: "Rinus Michels",
    keyPlayers: ["fri dirigent", "kollektivt roterende lag"],
    tacticalSchool: "Total Football (ekstrem variant)",
    formationId: "total_433",
    formationFallback: false,
    inPossessionShape: "4-3-3 med kollektiv rotasjon",
    outOfPossessionShape: "Svært høy blokk med offside-felle",
    pressShape: "Ekstremt høyt press",
    defensiveBlock: "Svært høy linje",
    buildUpStyle: "Kort oppbygging, alltid bevegelse",
    attackingStyle: "Romkontroll og kollektiv rotasjon",
    tempo: "Svært høyt",
    riskLevel: "high",
    style: "Ekstrem totalfotball: romkontroll og svært høy linje",
    strength: 80,
    pressResistance: 80,
    defensiveStructure: 64,
    transitionThreat: 64,
    chanceConversion: 74,
    baseStyleId: "high_press_opponent",
    matchupStyles: ["high_press", "aggressive_man_press", "possession_positional"],
    styleTraits: {
      pressIntensity: 88,
      transitionThreat: 64,
      defensiveCompactness: 50,
      highLine: 90,
      shortBuildUp: 72,
      possessionControl: 80,
      tacticalComplexity: 92,
      relationDemand: 82,
      intensity: 82
    },
    strengths: ["total romkontroll når de har ballen", "kollektiv rotasjon overalt"],
    weaknesses: ["svært sårbar hvis presset spilles forbi", "enorme bakrom bak linja"],
    vulnerableZones: ["det store bakrommet", "siden der presset overspilles"],
    dangerZones: ["hele banen når de presser", "midtsonen de overbelaster"],
    keyBattles: ["din pressresistens mot deres press", "dine dybdeløp mot offside-fella"],
    pressurePoints: ["rolig oppbygging mot press", "presis timing i dybdeløp"],
    managerHints: [
      "Spiller du presset forbi én gang, åpner det seg enormt bak dem.",
      "Tør å bygge rolig under presset; panikk gir dem akkurat det de vil."
    ],
    historicalNote: "Nederland 1974 drev totalfotballen til sitt ytterste med romkontroll og en svært høy linje.",
    learningFocus: "Hvordan tåle ekstremt press og straffe en svært høy linje."
  },
  {
    id: "inter_1960s_catenaccio",
    displayName: "Inter 1960-tallet — Catenaccio",
    archetypeName: "Den lave libero-blokken",
    era: "1960-tallet",
    referenceTeam: "Italiensk catenaccio-tradisjon",
    referenceCoach: "Helenio Herrera-skolen",
    keyPlayers: ["libero bak linja", "kontringsfarlig kant"],
    tacticalSchool: "Catenaccio",
    formationId: "catenaccio_532",
    formationFallback: false,
    inPossessionShape: "5-3-2 som spisses til kontring",
    outOfPossessionShape: "Lav 5-3-2 med libero",
    pressShape: "Ingen høyt press — venter lavt",
    defensiveBlock: "Svært lav blokk",
    buildUpStyle: "Direkte utvei og kontring",
    attackingStyle: "Lynraske kontringer fra lav blokk",
    tempo: "Lavt til ballen vinnes",
    riskLevel: "low",
    style: "Catenaccio: libero, lav blokk og kontring",
    strength: 74,
    pressResistance: 70,
    defensiveStructure: 88,
    transitionThreat: 80,
    chanceConversion: 72,
    baseStyleId: "low_block_opponent",
    matchupStyles: ["deep_low_block", "compact_532", "direct_counter"],
    styleTraits: {
      pressIntensity: 30,
      transitionThreat: 80,
      defensiveCompactness: 90,
      highLine: 25,
      shortBuildUp: 35,
      possessionControl: 38,
      tacticalComplexity: 55,
      relationDemand: 55,
      intensity: 60
    },
    strengths: ["liberoen rydder opp bak linja", "dødelig på kontring i bakrom"],
    weaknesses: ["kan presses lavt og bli passiv", "sliter mot bredde og tålmodig posisjonsspill"],
    vulnerableZones: ["rommene ute i bredden", "halvrommene hvis du er tålmodig"],
    dangerZones: ["ditt restforsvar ved balltap", "bakrommet på kontring"],
    keyBattles: ["din bredde mot deres kompakthet", "ditt restforsvar mot deres kontring"],
    pressurePoints: ["tålmodighet i angrep", "sikring bak ballen mot kontring"],
    managerHints: [
      "Vær tålmodig: bruk bredde, sideskift og overtall for å åpne den lave blokken.",
      "Hold restforsvaret edru — én uforsiktig pasning blir en kontring."
    ],
    historicalNote: "Catenaccio bygde på en libero bak linja, lav blokk og dødelige kontringer.",
    learningFocus: "Hvordan bryte ned en disiplinert lav blokk uten å åpne for kontring."
  },
  {
    id: "milan_1988_90_sacchi",
    displayName: "Milan 1988–90 — Kompakt sonepress",
    archetypeName: "Den kompakte sonepressblokken",
    era: "1988–1990",
    referenceTeam: "Sacchi-inspirert pressfotball",
    referenceCoach: "Arrigo Sacchi-skolen",
    keyPlayers: ["organiserende stopper", "pressledende spisser"],
    tacticalSchool: "Italiensk sonepress",
    formationId: "pressing_442",
    formationFallback: false,
    inPossessionShape: "Kompakt 4-4-2",
    outOfPossessionShape: "Smal, kompakt 4-4-2 med høy linje",
    pressShape: "Kollektivt sonepress med trykk på avstander",
    defensiveBlock: "Kompakt, høy linje",
    buildUpStyle: "Kontrollert, men direkte ved press",
    attackingStyle: "Rask vertikalitet etter gjenvinning",
    tempo: "Høyt i press",
    riskLevel: "high",
    style: "Sacchi-press: kompakt 4-4-2, sonepress og høy linje",
    strength: 79,
    pressResistance: 72,
    defensiveStructure: 80,
    transitionThreat: 64,
    chanceConversion: 72,
    baseStyleId: "high_press_opponent",
    matchupStyles: ["high_press", "aggressive_man_press", "narrow_442"],
    styleTraits: {
      pressIntensity: 84,
      transitionThreat: 60,
      defensiveCompactness: 82,
      highLine: 80,
      shortBuildUp: 50,
      possessionControl: 60,
      tacticalComplexity: 80,
      relationDemand: 68,
      intensity: 80
    },
    strengths: ["ekstrem kompakthet mellom ledd", "synkronisert sonepress med høy linje"],
    weaknesses: ["bakrom hvis timing eller press brytes", "smal blokk kan strekkes i bredden"],
    vulnerableZones: ["bakrommet bak den høye linja", "kanalene ute hvis blokken trekkes ut"],
    dangerZones: ["mellom linjene de holder tette", "din oppbygging under deres press"],
    keyBattles: ["dine relasjoner mot deres kompakthet", "din bakromstrussel mot deres høye linje"],
    pressurePoints: ["spill mellom linjene", "presis timing på bakromsløp"],
    managerHints: [
      "Bryt linjene med presise relasjoner — alenespill drukner i kompaktheten.",
      "Truer du bakrommet med god timing, må de slippe den høye linja ned."
    ],
    historicalNote: "Milan 1988–90 gjorde det kollektive sonepresset med høy linje til en kunstform.",
    learningFocus: "Hvordan bryte en kompakt presblokk med relasjoner og bakromstrusler."
  },
  {
    id: "barcelona_2008_12_positional_play",
    displayName: "Barcelona 2008–12 — Posisjonell kontroll",
    archetypeName: "Posisjonsspillet",
    era: "2008–2012",
    referenceTeam: "Posisjonsspill-tradisjonen",
    referenceCoach: "Guardiola-skolen",
    keyPlayers: ["dyptliggende dirigent", "falsk nier"],
    tacticalSchool: "Juego de posición",
    formationId: "possession_433",
    formationFallback: false,
    inPossessionShape: "4-3-3 med posisjonelle soner",
    outOfPossessionShape: "Høyt motpress umiddelbart ved tap",
    pressShape: "Gjenvinning innen 6 sekunder",
    defensiveBlock: "Høy linje",
    buildUpStyle: "Kort oppbygging gjennom soner",
    attackingStyle: "Posisjonsspill, tredje mann og kontroll",
    tempo: "Kontrollert, mange touch",
    riskLevel: "high",
    style: "Posisjonsspill: kontroll, gjenvinning og tredje mann",
    strength: 82,
    pressResistance: 82,
    defensiveStructure: 70,
    transitionThreat: 60,
    chanceConversion: 74,
    baseStyleId: "possession_opponent",
    matchupStyles: ["possession_positional", "build_from_back", "switching_play"],
    styleTraits: {
      pressIntensity: 78,
      transitionThreat: 50,
      defensiveCompactness: 56,
      highLine: 78,
      shortBuildUp: 85,
      possessionControl: 92,
      tacticalComplexity: 85,
      relationDemand: 80,
      intensity: 65
    },
    strengths: ["total ballkontroll gjennom posisjonsspill", "umiddelbar gjenvinning ved tap"],
    weaknesses: ["overgangsrom bak backene", "direkte, fysisk spill hvis presset deres brytes"],
    vulnerableZones: ["rommet bak de høye backene", "bakrommet på rask overgang"],
    dangerZones: ["din egen halvdel hvis du mister ballen dårlig", "mellomrommene de overbelaster"],
    keyBattles: ["din taktiske klarhet mot deres kontroll", "ditt motpress mot deres gjenvinning"],
    pressurePoints: ["trykk på ballfører rett etter balltap", "disiplinert, kompakt blokk"],
    managerHints: [
      "Tap av ball må møtes med umiddelbart trykk — ellers ruller de deg rundt.",
      "Står du kompakt og disiplinert, må de finne åpningen selv; ikke jag ukoordinert."
    ],
    historicalNote: "Barcelona 2008–12 satte posisjonsspillet og 6-sekunders-gjenvinningen som ideal.",
    learningFocus: "Hvordan holde taktisk klarhet og kompakthet mot et kontrollerende possession-lag."
  },
  {
    id: "arsenal_2003_04_invincibles",
    displayName: "Arsenal 2003–04 — Overgangsflyt",
    archetypeName: "Den relasjonelle overgangen",
    era: "2003–2004",
    referenceTeam: "Overgangssterk teknisk 4-4-2",
    referenceCoach: "Wenger-skolen",
    keyPlayers: ["hurtig spiss", "kreativ venstreside"],
    tacticalSchool: "Teknisk overgangsspill",
    formationId: "classic_442",
    formationFallback: false,
    inPossessionShape: "4-4-2 som flyter offensivt",
    outOfPossessionShape: "Middels 4-4-2-blokk",
    pressShape: "Selektivt press, slår til i overgang",
    defensiveBlock: "Middels blokk",
    buildUpStyle: "Rask, teknisk igangsetting",
    attackingStyle: "Hurtige overganger med relasjonell flyt",
    tempo: "Eksplosivt i overgang",
    riskLevel: "medium",
    style: "Overgangsspill: teknikk, fart og relasjonell flyt",
    strength: 79,
    pressResistance: 72,
    defensiveStructure: 66,
    transitionThreat: 82,
    chanceConversion: 78,
    baseStyleId: "direct_counter_opponent",
    matchupStyles: ["fast_transition", "wide_overload", "possession_positional"],
    styleTraits: {
      pressIntensity: 55,
      transitionThreat: 82,
      defensiveCompactness: 52,
      highLine: 60,
      shortBuildUp: 60,
      possessionControl: 70,
      tacticalComplexity: 62,
      relationDemand: 78,
      intensity: 66
    },
    strengths: ["eksplosive overganger med fart", "tette relasjoner særlig på venstresiden"],
    weaknesses: ["kan stoppes av kompakt midtbane", "overgangsrommet kan stenges"],
    vulnerableZones: ["sentralt hvis midtbanen din står kompakt", "overgangssonene hvis du sikrer bak"],
    dangerZones: ["bakrommet på rask overgang", "venstresiden deres med kombinasjoner"],
    keyBattles: ["din midtbanekompakthet mot deres flyt", "ditt restforsvar mot deres fart"],
    pressurePoints: ["stenge overgangsrommet", "kompakthet sentralt"],
    managerHints: [
      "Stå kompakt sentralt og ta bort overgangsrommet — det er der de lever.",
      "Sikre bak ballen mot farten; en åpen overgang straffes hardt."
    ],
    historicalNote: "Arsenal 2003–04 kombinerte teknisk klasse med eksplosivt overgangsspill.",
    learningFocus: "Hvordan kvele et overgangssterkt lag med kompakthet og sikring."
  },
  {
    id: "leicester_2015_16_direct_transition",
    displayName: "Leicester 2015–16 — Direkte overgang",
    archetypeName: "Den direkte bakromstrusselen",
    era: "2015–2016",
    referenceTeam: "Lavblokk-overgangslag",
    referenceCoach: "Ranieri-skolen",
    keyPlayers: ["hurtig bakromsspiss", "boksende sentral midtbane"],
    tacticalSchool: "Direkte overgangsspill",
    formationId: "english_direct_442",
    formationFallback: false,
    inPossessionShape: "4-4-2 som slår raskt i bakrom",
    outOfPossessionShape: "Disiplinert lavere 4-4-2-blokk",
    pressShape: "Lavt utgangspunkt, jager ikke ballen",
    defensiveBlock: "Lavere blokk",
    buildUpStyle: "Direkte, søker bakrommet",
    attackingStyle: "Raske overganger og andreballer",
    tempo: "Eksplosivt i overgang, ellers lavt",
    riskLevel: "medium",
    style: "Direkte overgang: lav blokk, bakrom og andreballer",
    strength: 75,
    pressResistance: 64,
    defensiveStructure: 76,
    transitionThreat: 88,
    chanceConversion: 76,
    baseStyleId: "direct_counter_opponent",
    matchupStyles: ["deep_low_block", "direct_counter", "fast_runners_in_behind"],
    styleTraits: {
      pressIntensity: 45,
      transitionThreat: 88,
      defensiveCompactness: 76,
      highLine: 35,
      shortBuildUp: 30,
      possessionControl: 35,
      tacticalComplexity: 45,
      relationDemand: 45,
      intensity: 78
    },
    strengths: ["dødelig direkte i bakrom", "vinner andreballer og slår raskt"],
    weaknesses: ["lav etablert kontroll med ball", "kan presses tilbake av tålmodig posisjonsspill"],
    vulnerableZones: ["deres egen halvdel hvis du holder ballen", "rommet foran deres lave blokk"],
    dangerZones: ["ditt restforsvar med mange spillere fremme", "bakrommet bak en høy linje"],
    keyBattles: ["ditt restforsvar mot deres overgang", "din kontroll mot deres direkte spill"],
    pressurePoints: ["restforsvar og kontrollert risiko", "ikke gi bort ballen høyt og åpent"],
    managerHints: [
      "Eksponer ikke restforsvaret — de venter på at du har for mange spillere foran ballen.",
      "Tålmodig posisjonsspill presser dem tilbake; stress gir dem bakrommet de vil ha."
    ],
    historicalNote: "Leicester 2015–16 viste hvor langt en disiplinert lavblokk med direkte overgang kan nå.",
    learningFocus: "Hvordan kontrollere risiko og restforsvar mot et direkte overgangslag."
  },
  {
    id: "liverpool_2018_20_gegenpress",
    displayName: "Liverpool 2018–20 — Gegenpress",
    archetypeName: "Den intense gjenvinningen",
    era: "2018–2020",
    referenceTeam: "Gegenpressing-tradisjonen",
    referenceCoach: "Klopp-skolen",
    keyPlayers: ["backer som playmakere", "pressledende front tre"],
    tacticalSchool: "Gegenpressing",
    formationId: "modern_433",
    formationFallback: false,
    inPossessionShape: "4-3-3 med høye, brede backer",
    outOfPossessionShape: "Høy 4-3-3 med umiddelbart motpress",
    pressShape: "Intens gegenpress ved hvert tap",
    defensiveBlock: "Høy linje",
    buildUpStyle: "Backer som playmakere, rask dybde",
    attackingStyle: "Rask vertikalitet og gjenvinning høyt",
    tempo: "Svært høyt",
    riskLevel: "high",
    style: "Gegenpress: intensitet, gjenvinning og backer som playmakere",
    strength: 81,
    pressResistance: 76,
    defensiveStructure: 70,
    transitionThreat: 80,
    chanceConversion: 76,
    baseStyleId: "high_press_opponent",
    matchupStyles: ["high_press", "aggressive_man_press", "fast_transition"],
    styleTraits: {
      pressIntensity: 90,
      transitionThreat: 80,
      defensiveCompactness: 56,
      highLine: 78,
      shortBuildUp: 60,
      possessionControl: 70,
      tacticalComplexity: 75,
      relationDemand: 70,
      intensity: 92
    },
    strengths: ["umiddelbar gjenvinning med intensitet", "backer skaper trykk som playmakere"],
    weaknesses: ["sårbar hvis presset spilles gjennom", "rom bak de høye backene", "egen slitasje når presset må gjentas"],
    vulnerableZones: ["rommet bak backene", "bakrommet når presset overspilles"],
    dangerZones: ["din oppbygging under intenst press", "egen halvdel ved dårlig balltap"],
    keyBattles: ["din pressresistens mot deres gegenpress", "din friskhet mot deres intensitet"],
    pressurePoints: ["pressresistent oppbygging", "restitusjon hvis laget er tungt"],
    managerHints: [
      "Spiller du gjennom gegenpresset, ligger det rom bak de høye backene.",
      "Er kroppene tunge, blir gjentatt press dyrt — vurder friskhet og restitusjon."
    ],
    historicalNote: "Liverpool 2018–20 gjorde gegenpressing og back-playmakere til en intens helhet.",
    learningFocus: "Hvordan tåle intenst gegenpress og utnytte rom bak høye backer."
  },
  {
    id: "man_city_2022_23_325_control",
    displayName: "Man City 2022–23 — Posisjonell låsing",
    archetypeName: "3-2-5-kontrollen",
    era: "2022–2023",
    referenceTeam: "Moderne 3-2-5 / 3-2-4-1",
    referenceCoach: "Guardiola-skolen (senere)",
    keyPlayers: ["inverterte backer", "boks-nier"],
    tacticalSchool: "Posisjonsspill med 3-2 restforsvar",
    formationId: "positional_325",
    formationFallback: false,
    inPossessionShape: "3-2-5 / 3-2-4-1 i angrep",
    outOfPossessionShape: "Posisjonell motpress fra 3-2-struktur",
    pressShape: "Kontrollert press fra restforsvar",
    defensiveBlock: "Høy linje med 3-2 sikring",
    buildUpStyle: "Kort oppbygging med inverterte backer",
    attackingStyle: "Posisjonell låsing og restforsvarskontroll",
    tempo: "Kontrollert",
    riskLevel: "high",
    style: "3-2-5-kontroll: posisjonell låsing og restforsvar",
    strength: 82,
    pressResistance: 82,
    defensiveStructure: 74,
    transitionThreat: 60,
    chanceConversion: 74,
    baseStyleId: "possession_opponent",
    matchupStyles: ["possession_positional", "build_from_back", "switching_play"],
    styleTraits: {
      pressIntensity: 75,
      transitionThreat: 55,
      defensiveCompactness: 60,
      highLine: 75,
      shortBuildUp: 85,
      possessionControl: 90,
      tacticalComplexity: 88,
      relationDemand: 78,
      intensity: 68
    },
    strengths: ["posisjonell låsing av hele banen", "3-2-restforsvaret kveler kontringer"],
    weaknesses: ["krever presis timing — rom kan oppstå ved tap sentralt", "høy linje gir bakrom"],
    vulnerableZones: ["bakrommet bak den høye linja", "sentralt rett etter at de mister ballen"],
    dangerZones: ["din halvdel når de låser deg fast", "mellomrommene de overbelaster"],
    keyBattles: ["din taktiske klarhet mot deres kontroll", "din timing i overgang mot deres restforsvar"],
    pressurePoints: ["presse oppspillet bevisst", "rask, presis overgang ved gjenvinning"],
    managerHints: [
      "Vinner du ballen sentralt før restforsvaret deres setter seg, finnes det rom.",
      "Press oppspillet med pressfeller, men koordinert — ukoordinert jag låses fast."
    ],
    historicalNote: "Man City 2022–23 perfeksjonerte 3-2-5-strukturen med restforsvarskontroll.",
    learningFocus: "Hvordan finne overgangsøyeblikket mot et posisjonelt låsende kontrollag."
  },
  {
    id: "conte_chelsea_2016_17_343",
    displayName: "Chelsea 2016–17 — 3-4-3-blokk",
    archetypeName: "Vingback-systemet",
    era: "2016–2017",
    referenceTeam: "Conte-inspirert 3-4-3",
    referenceCoach: "Conte-skolen",
    keyPlayers: ["offensive vingbacker", "tre faste stoppere"],
    tacticalSchool: "Automatisert back-tre",
    formationId: "conte_343",
    formationFallback: false,
    inPossessionShape: "3-4-3 med høye vingbacker",
    outOfPossessionShape: "5-4-1 / 5-2-3 solid blokk",
    pressShape: "Middels press, overgang fra solid blokk",
    defensiveBlock: "Middels til lav blokk",
    buildUpStyle: "Kontrollert oppbygging i kanaler",
    attackingStyle: "Klare løpsmønstre og overgang",
    tempo: "Kontrollert med vertikale spurter",
    riskLevel: "medium",
    style: "3-4-3: vingbacker, klare kanaler og solid blokk",
    strength: 78,
    pressResistance: 70,
    defensiveStructure: 78,
    transitionThreat: 75,
    chanceConversion: 74,
    baseStyleId: "direct_counter_opponent",
    matchupStyles: ["wide_overload", "three_at_back", "direct_counter"],
    styleTraits: {
      pressIntensity: 60,
      transitionThreat: 75,
      defensiveCompactness: 78,
      highLine: 50,
      shortBuildUp: 45,
      possessionControl: 55,
      tacticalComplexity: 65,
      relationDemand: 60,
      intensity: 72
    },
    strengths: ["solid back-tre med klare mønstre", "vingbacker gir bredde og overgang"],
    weaknesses: ["kan overbelastes mellom vingback og stopper", "sårbar sentralt hvis vingbackene bindes"],
    vulnerableZones: ["kanalen mellom vingback og ytre stopper", "sentralt hvis vingbackene må forsvare"],
    dangerZones: ["bredden der vingbackene angriper", "overgangssoner fra deres solide blokk"],
    keyBattles: ["din overbelastning mot deres vingbacker", "din bredde mot deres back-tre"],
    pressurePoints: ["bind vingbackene lavt", "overbelast kanalen ved siste stopper"],
    managerHints: [
      "Bind vingbackene deres med egen bredde — da blir back-tre til en sårbar femmer.",
      "Overbelast kanalen mellom vingback og ytre stopper for å skape åpninger."
    ],
    historicalNote: "Chelsea 2016–17 gjenreiste 3-4-3 med automatiserte løpsmønstre og offensive vingbacker.",
    learningFocus: "Hvordan overbelaste et back-tre og binde offensive vingbacker."
  }
];

// Runtime-navnet (`name`) speiler `displayName` slik at kampmotoren, mini-
// sesongen og UI kan lese motstanderen som de generiske profilene — uten å
// gjenta navnet i hver profil. Frosset for å understreke at profilene er rene
// data.
export const HISTORICAL_OPPONENT_PROFILES = RAW_HISTORICAL_OPPONENT_PROFILES.map((profile) =>
  Object.freeze({ name: profile.displayName, ...profile })
);

const PROFILE_BY_ID = Object.freeze(
  Object.fromEntries(HISTORICAL_OPPONENT_PROFILES.map((profile) => [profile.id, profile]))
);

// Hent én profil på id (dyp-kopiert så kallere trygt kan utvide den). Null hvis
// id-en ikke finnes.
export function getHistoricalOpponentProfile(id) {
  const profile = PROFILE_BY_ID[id];
  return profile ? structuredClone(profile) : null;
}

// Alle id-ene (praktisk for UI/validering).
export function getHistoricalOpponentProfileIds() {
  return HISTORICAL_OPPONENT_PROFILES.map((profile) => profile.id);
}

// Velg en historisk motstander. Deterministisk på index når den oppgis (test/
// mini-sesong), ellers tilfeldig (testkamp). Egen funksjon slik at app/test kan
// styre valget. Returnerer en dyp kopi.
export function pickHistoricalOpponentProfile(index = null) {
  const pool = HISTORICAL_OPPONENT_PROFILES;
  const i =
    Number.isInteger(index) && index >= 0 && index < pool.length
      ? index
      : Math.floor(Math.random() * pool.length);
  return structuredClone(pool[i]);
}

// ----------------------------------------------------------------------------
// Matchup-vurdering: hvordan den historiske stilen eksponerer (eller møter)
// lagets ledd. Deterministisk og forklarende — lik input gir byte-identisk
// output. Returnerer aldri en fasit: matchupScore er en TENDENS (0–100 rundt en
// nøytral 50), og hver fordel/sårbarhet peker på en konkret årsakskjede.
//
// Inndata (alle valgfrie, trygg degradering):
//   teamFit            – { metrics, relationships }
//   formation, tactic  – valgt system/kampplan (kun til kontekst/etiketter)
//   trainingFocus      – ukens treningsfokus-snapshot (matchday)
//   weeklyTrainingProgram – valgt treningsprogram-komposisjon (id/category)
//   opponentProfile    – en historisk profil (må ha styleTraits)
//   relationships      – relasjonsmotorens output (relationshipScore)
//   offPitchContext    – { fatigue/wear/tacticalClarity ... } (slitasje/klarhet)
// ----------------------------------------------------------------------------

function metric(teamFit, key) {
  const v = Number(teamFit?.metrics?.[key]);
  return Number.isFinite(v) ? v : null;
}

function resolveRelationshipScore(teamFit, relationships) {
  const fromRel = Number(relationships?.relationshipScore);
  if (Number.isFinite(fromRel)) return fromRel;
  const fromFit = Number(teamFit?.relationships?.relationshipScore);
  if (Number.isFinite(fromFit)) return fromFit;
  const fromMetric = Number(teamFit?.metrics?.relationshipScore);
  return Number.isFinite(fromMetric) ? fromMetric : null;
}

// Les slitasje/klarhet fra en off-pitch-kontekst som enten er flat
// (fatigue/wear/tacticalClarity) eller nøstet (team/squad). Normaliser til 0–100
// (fatigue/wear) og 0–100 (tacticalClarity). Null = ukjent.
function readOffPitch(offPitchContext) {
  if (!offPitchContext || typeof offPitchContext !== "object") return null;
  const team = offPitchContext.team && typeof offPitchContext.team === "object" ? offPitchContext.team : offPitchContext;
  const squad = offPitchContext.squad && typeof offPitchContext.squad === "object" ? offPitchContext.squad : offPitchContext;
  const to100 = (v) => {
    const n = Number(v);
    if (!Number.isFinite(n)) return null;
    return clamp(n > 1 ? n : n * 100);
  };
  const fatigue = to100(team.fatigue);
  const wear = to100(team.wear);
  const load = [fatigue, wear].filter((v) => v !== null);
  return {
    load: load.length ? Math.max(...load) : null,
    tacticalClarity: to100(squad.tacticalClarity)
  };
}

// En enkelt matchup-akse. value/reference er 0–100; trait er motstanderens
// styleTrait (0–100, brukt som vekt/gating). Returnerer en signert kontribusjon
// (≈ ±cap) pluss en advantage/vulnerability-tekst.
function axis({ value, reference, traitWeight, cap = 9, label, advantage, vulnerability, tag, gate = 50 }) {
  if (value === null || !Number.isFinite(value)) return null;
  // Gating: aksen teller bare når motstanderen faktisk har stilen (traitWeight
  // over en terskel). Vekten skaleres lineært fra terskelen.
  const intensity = clamp((num(traitWeight) - gate) / (100 - gate), 0, 1);
  if (intensity <= 0) return null;
  const raw = (value - reference) * 0.18 * intensity;
  const delta = Math.max(-cap, Math.min(cap, round2(raw)));
  if (delta === 0) return null;
  return {
    tag,
    label,
    delta,
    text: delta > 0 ? advantage : vulnerability
  };
}

export function evaluateHistoricalOpponentMatchup({
  teamFit,
  formation,
  tactic,
  trainingFocus,
  weeklyTrainingProgram,
  opponentProfile,
  relationships,
  offPitchContext
} = {}) {
  if (!opponentProfile || typeof opponentProfile !== "object" || !opponentProfile.styleTraits) {
    return null;
  }

  const traits = opponentProfile.styleTraits;
  const oppName = opponentProfile.displayName || opponentProfile.name || "den historiske motstanderen";
  const relationshipScore = resolveRelationshipScore(teamFit, relationships);
  const offPitch = readOffPitch(offPitchContext);

  // De rå aksene. Hver sammenligner ETT av lagets ledd mot ETT trekk i stilen.
  const rawAxes = [
    // Oppbygging mot press: bygger de høyt, blir svak oppbygging dyr.
    axis({
      value: metric(teamFit, "buildUpScore"),
      reference: 58,
      traitWeight: traits.pressIntensity,
      label: "oppbygging mot press",
      tag: "build_vs_press",
      advantage: `Trygg oppbygging tålte ${oppName}s høye press.`,
      vulnerability: `${oppName} presset høyt — svak oppbygging gjorde første fase dyr.`
    }),
    // Restforsvar mot overgang: lever de på kontring, straffer et skjørt restforsvar.
    axis({
      value: metric(teamFit, "restDefenseScore"),
      reference: 56,
      traitWeight: traits.transitionThreat,
      label: "restforsvar mot overgang",
      tag: "rest_vs_transition",
      advantage: `Et solid restforsvar tok bort ${oppName}s overgangsrom.`,
      vulnerability: `${oppName} truet i overgang — et skjørt restforsvar ble eksponert.`
    }),
    // Bredde mot kompakt/lav blokk: trekker de seg lavt og smalt, må bredden løse det.
    axis({
      value: metric(teamFit, "widthScore"),
      reference: 56,
      traitWeight: traits.defensiveCompactness,
      label: "bredde mot kompakt blokk",
      tag: "width_vs_block",
      advantage: `God bredde strakk ${oppName}s kompakte blokk.`,
      vulnerability: `${oppName} sto kompakt — for lite bredde ga ingen åpninger.`
    }),
    // Dybde mot høy linje: ligger linja høyt, gir dybdeløp verdi (og motsatt).
    axis({
      value: metric(teamFit, "depthScore"),
      reference: 56,
      traitWeight: traits.highLine,
      label: "dybdetrussel mot høy linje",
      tag: "depth_vs_highline",
      advantage: `Dybdeløp truet bakrommet bak ${oppName}s høye linje.`,
      vulnerability: `Lite dybdetrussel lot ${oppName} holde den høye linja trygt.`
    }),
    // Press mot kort oppbygging: bygger de kort bakfra, gir press verdi.
    axis({
      value: metric(teamFit, "pressScore"),
      reference: 56,
      traitWeight: traits.shortBuildUp,
      label: "press mot kort oppbygging",
      tag: "press_vs_buildup",
      advantage: `Et godt press forstyrret ${oppName}s korte oppbygging.`,
      vulnerability: `${oppName} fikk bygge kort i ro — presset ditt nådde dem ikke.`
    }),
    // Balanse mot kontroll/dominans: dominerer de ballen, må balansen holde.
    axis({
      value: metric(teamFit, "balanceScore"),
      reference: 56,
      traitWeight: traits.possessionControl,
      label: "balanse mot kontroll",
      tag: "balance_vs_control",
      advantage: `God balanse holdt strukturen mot ${oppName}s kontroll.`,
      vulnerability: `${oppName} dominerte ballen — ubalanse åpnet rom mot deg.`
    }),
    // Relasjoner mot komplekse systemer: krever stilen presise relasjoner å bryte.
    axis({
      value: relationshipScore,
      reference: 58,
      traitWeight: traits.relationDemand,
      label: "relasjoner mot komplekst system",
      tag: "relations_vs_system",
      advantage: `Gode rollerelasjoner brøt ${oppName}s organiserte system.`,
      vulnerability: `${oppName} krevde presise relasjoner — svake koblinger sto isolert.`
    }),
    // Taktisk klarhet mot kompleksitet (kun når off-pitch gir klarhet).
    axis({
      value: offPitch?.tacticalClarity ?? null,
      reference: 55,
      traitWeight: traits.tacticalComplexity,
      label: "taktisk klarhet mot kompleksitet",
      tag: "clarity_vs_complexity",
      advantage: `Høy taktisk klarhet matchet ${oppName}s komplekse system.`,
      vulnerability: `${oppName}s komplekse system straffet lav taktisk klarhet.`
    })
  ].filter(Boolean);

  // Slitasje mot intensitet: høyintensitetslag gjør egen slitasje dyrere. Egen
  // akse (lav last = bra, høy last = sårbarhet) styrt av off-pitch-konteksten.
  if (offPitch?.load !== null && offPitch?.load !== undefined && num(traits.intensity) >= 70) {
    const intensity = clamp((num(traits.intensity) - 70) / 30, 0, 1);
    const loadDelta = round2((50 - offPitch.load) * 0.16 * intensity);
    const capped = Math.max(-9, Math.min(9, loadDelta));
    if (capped !== 0) {
      rawAxes.push({
        tag: "fatigue_vs_intensity",
        label: "slitasje mot intensitet",
        delta: capped,
        text:
          capped > 0
            ? `Friske bein tålte ${oppName}s høye intensitet.`
            : `${oppName}s intensitet gjorde slitasjen dyr — laget ble tungt.`
      });
    }
  }

  // Trening mot stilen: ukens fokus / valgt program kan gi en liten, forklart
  // forberedelses-bonus mot akkurat denne stilen.
  const prep = evaluatePreparation({ trainingFocus, weeklyTrainingProgram, traits, oppName });
  if (prep) rawAxes.push(prep);

  const advantages = rawAxes.filter((a) => a.delta > 0).sort((a, b) => b.delta - a.delta);
  const vulnerabilities = rawAxes.filter((a) => a.delta < 0).sort((a, b) => a.delta - b.delta);

  const sum = rawAxes.reduce((acc, a) => acc + a.delta, 0);
  const matchupScore = clamp(50 + sum, 0, 100);
  const riskLevel = matchupScore >= 60 ? "favourable" : matchupScore <= 40 ? "risky" : "balanced";

  const explanationTags = rawAxes.map((a) => a.tag);

  // Forberedelsesråd: motstanderens egne managerhint pluss en sårbarhetsdrevet
  // påminnelse. Åpne forslag, ikke krav.
  const recommendedPreparation = [
    ...asArray(opponentProfile.managerHints),
    ...vulnerabilities.slice(0, 1).map((v) => prepHintForTag(v.tag, oppName))
  ].filter(Boolean);

  // Læringspunkt: den viktigste årsakskjeden formulert pedagogisk og åpent.
  const historicalLearningPoint = buildHistoricalLearningPoint({
    opponentProfile,
    riskLevel,
    topVulnerability: vulnerabilities[0] || null,
    topAdvantage: advantages[0] || null
  });

  return {
    opponentId: opponentProfile.id,
    opponentName: oppName,
    archetypeName: opponentProfile.archetypeName || "",
    tacticalSchool: opponentProfile.tacticalSchool || "",
    formationId: opponentProfile.formationId || null,
    matchupScore,
    riskLevel,
    advantages: advantages.map((a) => ({ tag: a.tag, text: a.text })),
    vulnerabilities: vulnerabilities.map((v) => ({ tag: v.tag, text: v.text })),
    keyBattles: asArray(opponentProfile.keyBattles).slice(),
    recommendedPreparation: [...new Set(recommendedPreparation)].slice(0, 4),
    explanationTags,
    historicalLearningPoint,
    summary: buildMatchupSummary({ oppName, riskLevel, opponentProfile })
  };
}

// Forberedelse: ukens treningsfokus / valgt program mot stilen. Liten, moderat
// bonus (v1). Returnerer en akse eller null.
const PREP_FOCUS_AGAINST = {
  // fokus-/program-token → hvilke styleTraits det forbereder mot (gate-trait)
  build_up: "pressIntensity",
  buildup_vs_press: "pressIntensity",
  pressing: "shortBuildUp",
  press_week: "shortBuildUp",
  rest_defence: "transitionThreat",
  defensive_structure: "transitionThreat",
  width: "defensiveCompactness",
  depth_runs: "highLine",
  finishing_week: "defensiveCompactness",
  formation_familiarity: "tacticalComplexity",
  formation_familiarisation: "tacticalComplexity",
  recovery_prevention: "intensity"
};

function evaluatePreparation({ trainingFocus, weeklyTrainingProgram, traits, oppName }) {
  const tokens = new Set();
  if (trainingFocus?.focusId) tokens.add(String(trainingFocus.focusId));
  if (Array.isArray(trainingFocus?.relatedTrainingFocusIds)) {
    trainingFocus.relatedTrainingFocusIds.forEach((id) => tokens.add(String(id)));
  }
  if (weeklyTrainingProgram?.id) tokens.add(String(weeklyTrainingProgram.id));
  if (Array.isArray(weeklyTrainingProgram?.relatedTrainingFocusIds)) {
    weeklyTrainingProgram.relatedTrainingFocusIds.forEach((id) => tokens.add(String(id)));
  }

  let best = null;
  for (const token of tokens) {
    const traitKey = PREP_FOCUS_AGAINST[token];
    if (!traitKey) continue;
    const traitValue = num(traits[traitKey]);
    if (traitValue < 60) continue; // bare relevant når stilen faktisk har trekket
    const bonus = round2(clamp((traitValue - 60) / 40, 0, 1) * 6);
    if (bonus > 0 && (!best || bonus > best.delta)) {
      best = { token, delta: bonus };
    }
  }
  if (!best) return null;
  return {
    tag: "training_prep",
    label: "treningsforberedelse",
    delta: best.delta,
    text: `Ukens trening (${best.token}) forberedte laget konkret mot ${oppName}s stil.`
  };
}

function prepHintForTag(tag, oppName) {
  const hints = {
    build_vs_press: `Forbered en pressresistent oppbygging og en direkte utvei mot ${oppName}.`,
    rest_vs_transition: `Styrk restforsvaret og kontroller risikoen mot ${oppName}s overganger.`,
    width_vs_block: `Tren bredde, sideskift og tålmodig angrep mot ${oppName}s kompakte blokk.`,
    depth_vs_highline: `Tren timing på dybdeløp for å straffe ${oppName}s høye linje.`,
    press_vs_buildup: `Tren koordinerte pressutløsere mot ${oppName}s korte oppbygging.`,
    balance_vs_control: `Tren kompakthet og balanse mot ${oppName}s ballkontroll.`,
    relations_vs_system: `Styrk rollerelasjonene for å bryte ${oppName}s organiserte system.`,
    clarity_vs_complexity: `Tren systemforståelse mot ${oppName}s komplekse spill.`,
    fatigue_vs_intensity: `Vurder restitusjon før ${oppName}s høye intensitet.`
  };
  return hints[tag] || null;
}

function buildMatchupSummary({ oppName, riskLevel, opponentProfile }) {
  const school = opponentProfile.tacticalSchool || opponentProfile.archetypeName || "stilen";
  if (riskLevel === "favourable") {
    return `Gunstig matchup mot ${oppName}: laget ditt møter ${school} med riktige forutsetninger.`;
  }
  if (riskLevel === "risky") {
    return `Risikabel matchup mot ${oppName}: ${school} treffer flere av lagets svake ledd. Forbered konkrete grep.`;
  }
  return `Balansert matchup mot ${oppName}: ${school} gir ingen tydelig overvekt — detaljene avgjør.`;
}

function buildHistoricalLearningPoint({ opponentProfile, riskLevel, topVulnerability, topAdvantage }) {
  const learningFocus = opponentProfile.learningFocus || "";
  if (riskLevel === "risky" && topVulnerability) {
    return `${topVulnerability.text} ${learningFocus} Spilleren er god nok — spørsmålet er om oppsettet møter denne stilen.`;
  }
  if (riskLevel === "favourable" && topAdvantage) {
    return `${topAdvantage.text} Bygg kampplanen rundt det som allerede passer mot denne stilen. ${learningFocus}`.trim();
  }
  if (topVulnerability) {
    return `Mot ${opponentProfile.displayName || opponentProfile.name} ble det jevnt, men ${topVulnerability.text.toLowerCase()} ${learningFocus}`.trim();
  }
  return `Mot ${opponentProfile.displayName || opponentProfile.name}: ${learningFocus || "les stilen og velg ett bevisst grep til neste gang."}`.trim();
}
