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
  },
  {
    playerId: "brede_froysa",
    clubId: "rana",
    strengths: ["work_rate"],
    claim: "«hardtarbeidende nøkkelspiller for A-laget»",
    source: "https://www.ranafk.no/barn-og-ungdom/",
    sourceKind: "club"
  },
  {
    playerId: "bendik_august_engen",
    clubId: "sandviken",
    strengths: ["pace", "work_rate"],
    claim: "«Med fart og rykk» og «En ærlig og hardtarbeidende spiller»",
    source: "https://fanafotball.no/fotballutdanning/seniorfotball/representasjonslag/herrelaget/bendik-august-engen-ny-fana-spiller/",
    sourceKind: "club"
  },
  {
    playerId: "morten_grasmo",
    clubId: "sotra",
    strengths: ["shot_stopping"],
    claim: "«en fantastisk redning av Sotras keeper hindret scoring»",
    source: "https://www.brann.no/nyheter/sloste-med-sjansene-mot-sotra",
    sourceKind: "club"
  },
  {
    // Sandefjord 2021: daglig leder omtaler ham eksplisitt som leder.
    playerId: "harmeet_singh",
    clubId: "sandefjord",
    strengths: ["leadership"],
    claim: "«Harmeet er en klassespiller. Samtidig er han en rollemodell for de yngre spillerne våre, en leder på og utenfor banen», sier daglig leder Espen Bugge Pettersen.",
    source: "https://www.sandefjordfotball.no/nyheter/harmeet-i-to-nye-ar--gleder-meg-til-a-fortsette-her",
    sourceKind: "club"
  },
  {
    // Sandefjord-pilot: eksplisitte spilleregenskaper fra hovedtreneren.
    playerId: "lars_grorud",
    clubId: "sandefjord",
    strengths: ["duels", "leadership"],
    claim: "«strong in duels» og «He is a leader in the dressing room»",
    source: "https://www.sandefjordfotball.no/nyheter/grorud-blir-med-videre",
    sourceKind: "club"
  },
  {
    // Sandefjord 09.07.2021: club explicitly describes his pace.
    playerId: "brice_wembangomo",
    clubId: "sandefjord",
    strengths: ["pace"],
    claim: "Sandefjord Fotball omtaler Brice Wembangomo som «den hurtige høyrebacken». Bare hurtighet registreres som individuelt dokumentert styrke.",
    source: "https://www.sandefjordfotball.no/nyheter/brice-veldig-glad-i-sandefjord",
    sourceKind: "club"
  },
  {
    // Sandefjord: Aftenposten described the player as a fast right-back/winger.
    playerId: "vidar_ari_jonsson",
    clubId: "sandefjord",
    strengths: ["pace"],
    claim: "Aftenposten omtaler Vidar Ari Jónsson som «en hurtig høyreback/kantspiller». Kun hurtighet er ført som individuelt dokumentert styrke.",
    source: "https://www.aftenposten.no/sport/fotball/i/GGjLeV/tromsoe-tester-to-islendinger-vi-har-faatt-veldig-bra-rapporter-paa-dem",
    sourceKind: "press"
  },
  {
    // Emil Dahle assessed Kirkevold's speed and strength in April 2015.
    playerId: "pal_alexander_kirkevold",
    clubId: "sandefjord",
    strengths: ["pace", "strength"],
    claim: "Emil Dahle: «han er ganske rask og sterk».",
    source: "https://www.aftenbladet.no/sport/i/kJa0Ov/kompisduell-paa-soer-arena",
    sourceKind: "press"
  },
  {
    // 2018: Sarpsborg 08 quotes Ruud Tveter and its director on individual traits.
    playerId: "alexander_ruud_tveter",
    clubId: "sandefjord",
    strengths: ["strength", "hold_up_play", "pace"],
    claim: "Ruud Tveter: «en stor, sterk spiss som er god til å holde på ballen»; sportssjef Berntsen: «sterk, rask».",
    source: "https://www.sarpsborg08.no/nyheter/siste-spissbrikke-pa-plass",
    sourceKind: "club"
  },
  {
    // 2022: editorial explicitly characterizes Høibråten's defending in duels.
    playerId: "marius_hoibraten",
    clubId: "sandefjord",
    strengths: ["duels"],
    claim: "Eurosport beskriver Marius Høibråten som «Kompromissløs duellstopper».",
    source: "https://www.eurosport.no/fotball/eliteserien/2021/se-hele-listen-dette-var-eliteseriens-50-beste-spillere-i-2022_sto9292645/story.shtml",
    sourceKind: "press"
  },
  {
    // 2008: Bjørn Tore Kvarme describes Demidov's strength in direct contests.
    playerId: "vadim_demidov",
    clubId: "sandefjord",
    strengths: ["duels"],
    claim: "Bjørn Tore Kvarme om Demidov: «Han er sterk i duellspillet».",
    source: "https://www.aftenposten.no/sport/fotball/i/4qbgBe/imponert-over-demidov",
    sourceKind: "press"
  },
  {
    // 2006: long-range volley after which Knarvik described his own repeatable skill.
    playerId: "tommy_knarvik",
    clubId: "sandefjord",
    strengths: ["long_shots"],
    claim: "Etter volley fra rundt 25 meter sa Knarvik: «Jeg står alltid i returrommet på cornere, og bruker å være flink til å komme til slike avlutninger».",
    source: "https://www.nettavisen.no/sport/dromme-scoringen-var-planlagt/s/12-95-715467",
    sourceKind: "press"
  },
  {
    playerId: "iven_austbo",
    clubId: "sandefjord",
    strengths: ["command_of_area"],
    claim: "Keepertrener Kurt Hegre: «Iven tar mye i feltet. Han har vist at han behersker den delen av spillet».",
    source: "https://www.bt.no/sport/i/kJJn4k/austboe-forberedt-paa-keeperkrig-i-1-divisjon",
    sourceKind: "press"
  },
  {
    playerId: "kristoffer_normann_hansen",
    clubId: "sandefjord",
    strengths: ["finishing", "movement"],
    claim: "Eurosport: «Er en fantastisk avslutter og er flink til å komme i avslutningsposisjon».",
    source: "https://www.eurosport.no/fotball/obos-ligaen/2018/arets-lag-i-obos-ligaen-kanskje-ikke-den-kjekkeste-men-en-av-de-viktigstefot_sto7033434/story.shtml",
    sourceKind: "press"
  },
  {
    playerId: "kjell_rune_sellin",
    clubId: "sandefjord",
    strengths: ["pace", "finishing"],
    claim: "Kongsvingers sportslige leder beskriver Sellin som «en gjennombruddshissig, hurtig spiss med gode avslutteregenskaper».",
    source: "https://www.dagsavisen.no/sport/rbk-leier-ut/8323110",
    sourceKind: "press"
  },
  {
    playerId: "jorgen_jalland",
    clubId: "sandefjord",
    strengths: ["movement"],
    claim: "Bergens Tidende om Jalland: «Søker mye inn i mellomrommet, og blir mer oppspillpunkt enn pasningsspiller».",
    source: "https://www.bt.no/sport/i/Op3Oll/usikker-paa-fire-plasser",
    sourceKind: "press"
  },
  {
    playerId: "abdoulaye_seck",
    clubId: "sandefjord",
    strengths: ["strength"],
    claim: "VG Live om Seck: «senegaleseren har en vanvittig fysikk».",
    source: "https://vglive.vg.no/fotball/sandefjord-molde/6437/rapport",
    sourceKind: "press"
  },
  {
    playerId: "espen_bugge_pettersen",
    clubId: "sandefjord",
    strengths: ["reflexes", "shot_stopping", "command_of_area"],
    claim: "Lars Tjærnås: «Har hurtige reflekser, og er mest av alt en meget god skuddstopper. Har blitt flinkere til å time i feltarbeidet».",
    source: "https://www.aftenbladet.no/sport/i/G1vyqx/lars-tjaernaas-kaarer-aarets-lag-i-eliteserien",
    sourceKind: "press"
  },
  {
    playerId: "andreas_augustsson",
    clubId: "sandefjord",
    strengths: ["strength", "duels", "simple_passing"],
    claim: "Sandefjord-trener Tor Thodesen: «Han har alt; sterk fysikk, god i dueller og fine pasninger».",
    source: "https://www.bt.no/sport/i/Addy2E/viking-saa-sandefjord-stopper-augustsson",
    sourceKind: "press"
  },
  {
    playerId: "lars_iver_strand",
    clubId: "sandefjord",
    strengths: ["stamina"],
    claim: "Etter en løpstest: «På en såkalt jojotest (en løpstest lik blip-testen) for to uker siden var han best på laget».",
    source: "https://www.bt.no/sport/i/2G833B/droemmejobb-for-strand",
    sourceKind: "press"
  },
  {
    playerId: "fredrik_thorsen",
    clubId: "sandefjord",
    strengths: ["pressing"],
    claim: "ffksupporter.net beskriver Thorsen som «Norges beste defensive spiss» og fremhever at han fungerer som «førsteforsvarer».",
    source: "https://ffksupporter.net/nyheter/1165-det-lekne-andreaaret/",
    sourceKind: "football_editorial"
  },
  {
    playerId: "havard_storbaek",
    clubId: "sandefjord",
    strengths: ["work_rate", "stamina", "late_runs"],
    claim: "Vålerenga-trener Petter Myhre: «Han er en hardtarbeidende og løpssterk midtbanespiller som er flink til å komme inn i boksen og målfarlig».",
    source: "https://www.nettavisen.no/sentrale-spillere-ute-mot-nybergsund/s/12-95-1245039",
    sourceKind: "press"
  },

  // --- Sandefjord base squad: club-documented direct free kick, 2025 --------
  {
    playerId: "martin_torp",
    clubId: "sandefjord",
    strengths: ["set_pieces"],
    claim: "Sandefjord Fotball skildrer Eik-spillerens direkte frispark i 2025: «Sverre Martin Torp, skrur ballen rundt muren og rett i nettmaskene». Kun den observerte dødballutførelsen føres.",
    source: "https://www.sandefjordfotball.no/nyheter/det-endte-med-uavgjort-mot-fk-eik-tonsberg-871",
    sourceKind: "club"
  },
  // --- Sandefjord 2003: contemporary match report ---------------------------
  {
    playerId: "trym_bergman",
    clubId: "sandefjord",
    strengths: ["heading"],
    claim: "Bergens Tidende beskriver første Sandefjord-målet mot Vålerenga 22.11.2003 som «en heading i krysset fra Trym Bergman» etter corner fra Frode Fredriksen. Kun det dokumenterte hodespillet føres.",
    source: "https://www.bt.no/sport/i/K3pmRy/som-en-orgasme",
    sourceKind: "press"
  },
  // --- Sandefjord 2008: documented headed injury-time winner ---------------
  {
    playerId: "espen_nystuen",
    clubId: "sandefjord",
    strengths: ["heading"],
    claim: "Stavanger Aftenblad 12.04.2008 beskriver Sandefjords seiersmål mot Sandnes Ulf: «Tre minutter på overtid satte Espen Nystuen inn seiersmålet med pannebrasken». Bare det dokumenterte hodespillet føres.",
    source: "https://www.aftenbladet.no/sport/i/G1vk9q/sandnes-tap-paa-overtid",
    sourceKind: "press"
  },
  // --- Sandefjord 2005: coach's individual evaluation -----------------------
  {
    playerId: "geir_ludvig_fevang",
    clubId: "sandefjord",
    strengths: ["heading", "chance_creation"],
    claim: "Sandefjords tidligere trener Tom Nordlie sier til Stavanger Aftenblad 25.10.2005 at Fevang er «god i lufta, kreativ» og teknisk/taktisk dyktig. Luftspill føres som heading, kreativitet som chance_creation i tråd med ferdighetsvokabularet; vision kan ikke utledes av formuleringen, og målstatistikk gir ingen avslutningsstyrke.",
    source: "https://www.aftenbladet.no/sport/i/pLLKnW/nordlie-henter-ny-sandefjord-spiller",
    sourceKind: "press"
  },
  {
    playerId: "olav_zanetti",
    clubId: "sandefjord",
    strengths: ["crossing"],
    claim: "Samtidig kampreferat fra Brann–Sandefjord i mars 2010 sier: «Olav Zanetti fosset frem på høyre og la et hardt og lavt innlegg». Bare det dokumenterte innlegget føres som crossing; fart eller avslutningsevne utledes ikke.",
    source: "https://www.aftenbladet.no/sport/i/xR1y98/innbytter-guastavino-snudde-kampen",
    sourceKind: "press"
  },
  {
    playerId: "magne_sturod",
    clubId: "sandefjord",
    strengths: ["work_rate"],
    claim: "NTBs samtidige kampreferat fra Vard-Haugesund–Sandefjord 02.05.2004, gjengitt i Nettavisen: «Målscorer Magne Sturød jobbet godt gjennom store deler av kampen». Denne konkrete individuelle vurderingen dokumenterer bare arbeidsinnsats (work_rate); mål, spilleminutter og poeng gir ingen andre styrker.",
    source: "https://www.nettavisen.no/artikkel/start-kil-og-moss-vant-igjen/s/12-95-220771",
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
