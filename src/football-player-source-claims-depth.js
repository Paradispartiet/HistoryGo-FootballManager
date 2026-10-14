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
  },
  // --- Rosenborg: verified individual playing-style descriptions -----------
  {
    playerId: "harald_brattbakk",
    clubId: "rosenborg",
    strengths: ["pace", "off_ball_runs", "positioning"],
    claim: "Odd Iversen fremhevet Brattbakks fart («Meget hurtig») og «en fin timing på løpene sine», og at han ofte kom «i fin posisjon for å score». Dermed dokumenteres hurtighet, løp uten ball og offensiv plassering, ikke antatt heading eller dødballer.",
    source: "https://www.aftenposten.no/sport/fotball/i/0n9PW2/ivers-synes-brattbakk-exit-er-vemodig",
    sourceKind: "press"
  },

  // --- Rosenborg: repeatable performance and individual playing traits ------
  {
    playerId: "marius_broholm",
    clubId: "rosenborg",
    strengths: ["dribbling", "simple_passing"],
    claim: "TACTIX' sesongbaserte spilleranalyse for 2025 vurderer Broholms «Passing (elite, 97th percentile) and Dribbling (elite, 94th percentile)» sammenlignet med 62 angripere i Eliteserien. Registreringen gjelder dokumentert drible- og pasningskvalitet, ikke langpasningsspesialisering eller antatt avslutningsevne.",
    source: "https://tactix.football/player/m-broholm",
    sourceKind: "football_editorial"
  },
  {
    playerId: "ole_saeter",
    clubId: "rosenborg",
    strengths: ["heading"],
    claim: "Rosenborg beskriver Ole Sæters særpreg ved innhoppet mot Mainz 21.08.2025 som «direkte spill og hodestyrke» og skriver at «Sæters hodestyrke» endret oppgjøret. Den generelle ferdighetsvurderingen støtter heading; ett mål i seg selv gir ikke finishing eller andre attributter.",
    source: "https://www.rbk.no/nyheter/godt-utgangspunkt-etter-sen-saeter-scoring",
    sourceKind: "club"
  },

  // --- Rosenborg: individually described historical playing qualities ------
  {
    playerId: "andre_hansen",
    clubId: "rosenborg",
    strengths: ["distribution"],
    attributeValues: { distribution: 15 },
    attributeSources: { distribution: {
      period: "Rosenborg 2015–2016; sammenligning FIFA 16",
      evidenceUrl: "https://www.bt.no/sport/i/K3yxL7/andre-hansen-det-aa-maake-bort-ballen-har-jeg-ikke-sansen-for",
      comparisonUrl: "https://fifaindex.com/fr/joueurs/190459-andre-hansen/fifa16",
      rationale: "Ingebrigtsen beskrev Hansen som svært god med beina og dyktig til frispilling i januar 2015; Hansen ønsket å bygge opp spillet bakfra. FIFA 16 måler keeper-kicking til 73, som ikke er identisk med kontrollert frispilling. Vår distribution=15 er selvstendig og tar høyde for dette skillet."
    } },
    claim: "RBK-trener Kåre Ingebrigtsen begrunnet keepervalget i januar 2015 med at André Hansen var «svært god med beina» og «dyktig på frispilling». Dette støtter distribusjon og kontrollert frispilling; redninger og feltarbeid utledes ikke av beskrivelsen.",
    source: "https://www.bt.no/sport/i/K3yxL7/andre-hansen-det-aa-maake-bort-ballen-har-jeg-ikke-sansen-for",
    sourceKind: "press"
  },
  {
    playerId: "anthony_annan",
    clubId: "rosenborg",
    strengths: ["simple_passing"],
    claim: "Adresseavisens pasningsanalyse gjengitt i Stavanger Aftenblad i april 2010 viste at Anthony Annan hadde høyest pasningspresisjon på Rosenborg i den undersøkte kampen og foretrakk korte pasninger. Annan sa: «Jeg foretrekker den korte typen og å slå ballen i beina.» Dette underbygger simple_passing, men ikke lange gjennombruddspasninger eller presise taklingsattributter.",
    source: "https://www.aftenbladet.no/sport/i/qnzxaw/annan-kjenner-seg-ikke-igjen-i-kritikken",
    sourceKind: "press"
  },
  {
    playerId: "pal_andre_helland",
    clubId: "rosenborg",
    strengths: ["set_pieces"],
    attributeValues: { set_pieces: 16 },
    attributeSources: { set_pieces: {
      period: "Rosenborg 2014–2015; sammenligning FIFA 15",
      evidenceUrl: "https://www.bt.no/sport/i/706wno/varsler-rush-av-frisparkmaal",
      comparisonUrl: "https://fifaindex.com/players/183336-pal-andre-helland/fifa15",
      rationale: "BT dokumenterte bevisste frisparkvalg og to frisparkmål i januar 2014. FIFA 15 viser frisparkpresisjon 72 (topp 5 %), men måler ikke alle typer dødball. Vår 16-er er selvstendig, begrenset til dokumentert spesialkompetanse."
    } },
    claim: "Bergens Tidende beskrev Pål André Hellands direkte frispark i oppkjøringen 2014 og siterte Hellands formulering: «Frispark i så gode posisjoner skal i mål.» Han fortalte også om en fast frisparkavtale med trener Bård Wiggen og vurderinger av murens plassering. Dokumenterer direkte frisparkteknikk (set_pieces), ikke presisjon på alle former for dødball eller generell avslutningsevne.",
    source: "https://www.bt.no/sport/i/706wno/varsler-rush-av-frisparkmaal",
    sourceKind: "press"
  },
  {
    playerId: "sigurd_rushfeldt",
    clubId: "rosenborg",
    strengths: ["strength"],
    claim: "Dagbladet beskrev i juli 1999 Sigurd Rushfeldts spillestil som en spiss som kunne virke anonym før han scoret, og siterte sin tidligere karakteristikk av ham som «kynisk og råsterk målmaskin». «Råsterk» gir et individuelt belegg for fysisk styrke; målproduksjonen gir ikke automatisk finishing, heading eller positioning.",
    source: "https://www.dagbladet.no/nyheter/rushlefot/65533532",
    sourceKind: "press"
  },
  // --- Rosenborg heritage: individually described wing and fullback skills --
  {
    playerId: "mini_jakobsen",
    clubId: "rosenborg",
    strengths: ["pace", "dribbling", "off_ball_runs"],
    claim: "Store norske leksikons spillestilavsnitt beskriver Jahn Ivar «Mini» Jakobsen som «rask, driblesterk» og fremhever evnen til å «beregne løp og rykk» og variere tempo. Dette underbygger hurtighet, dribling og bevegelsestiming uten ball. Lavt tyngdepunkt og målstatistikk er ikke brukt til ekstra styrker.",
    source: "https://snl.no/Jahn_Ivar_Jakobsen",
    sourceKind: "encyclopedia"
  },
  {
    playerId: "daniel_braaten",
    clubId: "rosenborg",
    strengths: ["pace", "strength", "dribbling"],
    claim: "Store norske leksikon beskriver Daniel Omoya Braatens spillestil ved «hurtighet, kraftige fysikk og driblestyrke». Disse uttrykkelige individuelle egenskapene bærer pace, strength og dribbling. Posisjon, klubbmeritter og antall scoringer brukes ikke som kilde for nye ferdigheter.",
    source: "https://snl.no/Daniel_Omoya_Braaten",
    sourceKind: "encyclopedia"
  },
  {
    playerId: "mikael_lustig",
    clubId: "rosenborg",
    strengths: ["crossing"],
    attributeValues: { crossing: 15 },
    attributeSources: { crossing: {
      period: "Rosenborg 2008–2011; senere sammenligning FIFA 13",
      evidenceUrl: "https://www.rbkweb.no/vis/6250",
      comparisonUrl: "https://fifaindex.com/players/176942-mikael-lustig/fifa13",
      rationale: "Erik Hamrén beskrev allerede i juli 2008 Lustigs presise innlegg. FIFA 13 registrerer crossing 70, men gjelder Celtic-perioden etter Rosenborg. Vår crossing=15 bygger primært på Hamréns samtidige vurdering, ikke en konvertering av FIFA-tallet."
    } },
    claim: "RBK-trener Erik Hamrén fremhevet ved signeringen sommeren 2008 Lustigs offensive backspill og at han «slår presise innlegg». Dette er et direkte belegg for crossing, mens det at han kommer raskt frem i angrep ikke alene dokumenterer sprintfart, overlappinger eller presis defensiv posisjonering.",
    source: "https://www.rbkweb.no/vis/6250",
    sourceKind: "football_editorial"
  },
  // --- Rosenborg: goalkeepers and defensive skill descriptions --------------
  {
    playerId: "espen_johnsen",
    clubId: "rosenborg",
    strengths: ["reflexes", "shot_stopping"],
    claim: "Store norske leksikons avsnitt om Espen Johnsens spillestil beskriver ham som «reaksjonssterk og god på streken». Dette støtter refleksredninger og skuddstopping. Den samme kilden nevner svakheter i feltarbeid og med ballen i beina, så command_of_area og distribution blir ikke tilført.",
    source: "https://snl.no/Espen_Johnsen_-_norsk_fotballspiller",
    sourceKind: "encyclopedia"
  },
  {
    playerId: "arni_gautur_arason",
    clubId: "rosenborg",
    strengths: ["shot_stopping", "reflexes"],
    claim: "Knut Espen Svegaardens spilleromtale i Rabonas tiårslag fra 2000-tallet beskriver Árni Gautur Arason som «Glimrende skuddstopper, og reaksjonssterk som få.» Dette dokumenterer shot_stopping og reflexes; ingen styrke utledes av seriegull, kamptall eller hans øvrige klubber.",
    source: "https://rabonapod.no/2025/07/23/tiarslagene-2000-tallet/",
    sourceKind: "football_editorial"
  },
  {
    playerId: "tore_reginiussen",
    clubId: "rosenborg",
    strengths: ["game_reading", "duels", "pace"],
    claim: "Tromsø ILs historiske spillerbiografi, publisert i statistikkarkivet i 2014, beskriver Tore Reginiussen slik: «unik evne til å lese spillet, han er duellsterk, kjapp». Disse ordene gir game_reading, duels og pace; klubbstatus eller forsvarsposisjon gir ingen andre egenskaper. Beskrivelsen gjelder hans tidligere TIL-periode, ikke spesifikt Rosenborg-sesongene.",
    source: "https://statistikk.til.no/spiller/tore-reginiussen",
    sourceKind: "football_editorial"
  },
  {
    playerId: "birger_meling",
    clubId: "rosenborg",
    strengths: ["pace", "game_reading"],
    attributeValues: { pace: 16 },
    attributeSources: { pace: {
      period: "Rosenborg 2017–2018; sammenligning FIFA 18",
      evidenceUrl: "https://www.eurosport.no/fotball/vm-kvalifisering/2018/birger-melings-strategiske-valg-derfor-satset-jeg-pa-venstrebackenfot_sto6354821/story.shtml",
      comparisonUrl: "https://fifaindex.com/es/jugadores/219466-birger-solberg-meling/fifa18",
      rationale: "Landslagstrener Lagerbäck trakk spesielt fram Melings fart i oktober 2017; FIFA 18 oppgir acceleration 79 og sprint speed 78 i Rosenborg-perioden. Egen hurtighetsvurdering 16."
    } },
    claim: "Landslagstrener Lars Lagerbäck forklarte overfor Eurosport i oktober 2017 at Birger Meling var aktuell som back «på grunn av farta hans, spilleforståelsen og hans gode offensive bidrag». Fart og spilleforståelse dokumenterer pace og game_reading; generelle offensive bidrag gir ikke automatisk crossing eller overlapping_runs.",
    source: "https://www.eurosport.no/fotball/vm-kvalifisering/2018/birger-melings-strategiske-valg-derfor-satset-jeg-pa-venstrebackenfot_sto6354821/story.shtml",
    sourceKind: "press"
  },
  {
    playerId: "mikael_dorsin",
    clubId: "rosenborg",
    strengths: ["strength"],
    claim: "Knut Espen Svegaarden beskriver Rosenborg-backen Mikael Dorsin i Rabonas 2000-tallslag som «vrien å passere, fysisk meget sterk». Dette gir direkte belegg for fysisk styrke. Uttrykket «vrien å passere» gjelder defensivt backspill, mens attributtet one_vs_one i katalogen gjelder offensiv dribling, og er derfor ikke brukt.",
    source: "https://rabonapod.no/2025/07/23/tiarslagene-2000-tallet/",
    sourceKind: "football_editorial"
  },
  // --- Rosenborg: documented keeper, fullback and forward qualities --------
  {
    playerId: "daniel_orlund",
    clubId: "rosenborg",
    strengths: ["command_of_area", "shot_stopping"],
    claim: "Rosenborgs keepertrener Jørn Jamtfall beskrev Daniel Örlunds dokumenterte styrker til Aftenposten i oktober 2010: «Trenger vi at han er god i feltet, er han det. Men han er også god på strek.» Direkte belegg for feltarbeid og skuddredninger på streken, ikke for refleksfart eller distribusjon.",
    source: "https://www.aftenposten.no/sport/fotball/i/6jB0Mz/orlund-sprer-trygghet-i-rbk-rekkene",
    sourceKind: "press"
  },
  {
    playerId: "vegard_heggem",
    clubId: "rosenborg",
    strengths: ["pace"],
    claim: "Vegard Heggem fortalte NTB/Dagbladet i oktober 1998, om rollen på høyrekanten etter Rosenborg: «Jobben min blir å bruke farten og få til innlegg eller gjennombrudd». Utsagnet beskriver hans egen hurtighet og støtter pace; en plan om innlegg er ikke i seg selv dokumentasjon på crossing.",
    source: "https://www.dagbladet.no/sport/heggem-husker-ikke/65483720",
    sourceKind: "press"
  },
  {
    playerId: "jorgen_skjelvik",
    clubId: "rosenborg",
    strengths: ["pace"],
    claim: "Rosenborg-trener Kåre Ingebrigtsen begrunnet cupfinaleuttaket i november 2015 med at «Jørgen har også ekstrem fart», særlig nyttig mot mulige kontringer. Det er direkte belegg for pace, men ingen presis påstand om pasningsteknikk, spenst eller defensive duellferdigheter.",
    source: "https://www.bt.no/sport/i/naQbXn/rosenborg-overrasker-med-laguttaket-i-cupfinalen",
    sourceKind: "press"
  },
  {
    playerId: "ole_christer_basma",
    clubId: "rosenborg",
    strengths: ["pace"],
    claim: "Knut Espen Svegaardens historiske 2000-tallsvurdering beskriver Christer Basmas individuelle backegenskap: «Hurtigheten var Basmas styrke». Dette dokumenterer pace for Ole Christer Basmas eksisterende Lerkendal-profil, ikke Stabæk-katalogens separate christer_basma-identitet.",
    source: "https://rabonapod.no/2025/07/23/tiarslagene-2000-tallet/",
    sourceKind: "football_editorial"
  },
  {
    playerId: "thorstein_helstad",
    clubId: "rosenborg",
    strengths: ["pace"],
    claim: "Knut Espen Svegaarden skrev om Thorstein Helstad i Rabonas historiske tiårslag: «Han måtte utnytte det som var hans store styrke: Farten.» Kilden dokumenterer pace; betegnelsen målscorer og klubbens resultater gir ikke automatisk finishing eller positioning.",
    source: "https://rabonapod.no/2025/07/23/tiarslagene-2000-tallet/",
    sourceKind: "football_editorial"
  },
  // --- Rosenborg: source-described historical goalkeeping and field skills ---
  {
    playerId: "jorn_jamtfall",
    clubId: "rosenborg",
    strengths: ["distribution"],
    claim: "Dagbladets Rosenborg-spilleranalyse foran Juventus-kampen i desember 1998 beskriver Jørn Jamtfalls igangsettinger med «presise og raske utkast». Det dokumenterer keeperens distribution, ikke reflexes eller shot_stopping som artikkelen ikke vurderer.",
    source: "https://www.dagbladet.no/sport/11-grunner-til-seier/65493302",
    sourceKind: "press"
  },
  {
    playerId: "bjorn_otto_bragstad",
    clubId: "rosenborg",
    strengths: ["duels"],
    claim: "Dagbladets individuelle Champions League-vurdering i desember 1998 beskriver Bjørn Otto Bragstad som «Meget god som førsteforsvarer, sterk både langs bakken og i lufta». Dette underbygger defensive duels. Den samme omtalen advarer om hurtige angripere i bakrom, og gir derfor ikke grunnlag for pace.",
    source: "https://www.dagbladet.no/sport/11-grunner-til-seier/65493302",
    sourceKind: "press"
  },
  {
    playerId: "kris_stadsgaard",
    clubId: "rosenborg",
    strengths: ["pace"],
    claim: "Erik Hoftun karakteriserte Rosenborgs nye midtstopper Kris Stadsgaard i 2008 som «en hurtig, klok og ballsikker midtstopper». RBKwebs senere biografi forklarer også at hurtigheten lot RBK stå med større bakrom. pace er direkte dokumentert; klok og ballsikker er for generelle alene til å tilordne særskilte pasnings- eller beslutningsattributter.",
    source: "https://www.rbkweb.no/spiller/stadsgaard",
    sourceKind: "football_editorial"
  },
  {
    playerId: "cristian_gamboa",
    clubId: "rosenborg",
    strengths: ["pace"],
    attributeValues: { pace: 18 },
    attributeSources: { pace: {
      period: "Rosenborg 2012–2014",
      evidenceUrl: "https://www.rbkweb.no/spiller/gamboa",
      comparisonUrl: "https://fifaindex.com/players/198553-cristian-gamboa/fifa14",
      rationale: "Hoftun kalte hurtigheten ekstrem i 2012; FIFA 14 vurderte fart til 88 (topp 5 %). Vår 18-er er selvstendig for RBK-perioden, ikke omregnet fra FIFA."
    } },
    claim: "Rosenborgs Erik Hoftun beskrev Cristian Gamboa ved klubbens leieavtale i 2012 som en back med «ekstrem hurtighet, offensiv innstilling og en god fot», gjengitt i RBKwebs spillerbiografi. Dette belegger pace. Offensiv innstilling og god fot blir ikke tolket som crossing eller dribbling uten mer presis kilde.",
    source: "https://www.rbkweb.no/spiller/gamboa",
    sourceKind: "football_editorial"
  },
  {
    playerId: "stale_stensaas",
    clubId: "rosenborg",
    strengths: ["crossing"],
    claim: "Aftenpostens landslagsvurdering av Ståle Stensaas i april 2004 beskriver Rosenborg-backen som «Tryggere defensivt enn John Arne Riise, og med minst like god innleggsfot». Dette underbygger crossing, men en sammenlignende generell defensiv vurdering gir ikke grunnlag for defensive_reading eller tackling.",
    source: "https://www.aftenposten.no/norge/i/Mn59o/slik-blir-laget",
    sourceKind: "press"
  },
  {
    playerId: "jan_derek_sorensen",
    clubId: "rosenborg",
    strengths: ["pace", "crossing"],
    claim: "Aftenposten beskrev Jan-Derek Sørensen i november 2005 som en særpreget vingtype med «Ekstremt hurtige spillere med god innleggsfot» som sjelden kombinasjon. Det belegger pace og crossing, men vurderingen er fra spillerens Lyn-periode og ikke en påstand om en konkret Rosenborg-kamp.",
    source: "https://www.aftenposten.no/norge/i/JQn74/landslagsaktuell-uten-aa-vite-det-selv",
    sourceKind: "press"
  },
  // --- Rosenborg: individual 2005/06 assessments and historical defenders ---
  {
    playerId: "lars_hirschfeld",
    clubId: "rosenborg",
    strengths: ["reflexes"],
    claim: "Adresseavisens sportsredaksjon oppsummerte Lars Hirschfelds 2006-sesong med at han «Prater mye, sprer trygghet og er reaksjonssterk». Reaksjonsstyrken belegger reflexes. Den samme vurderingen sier at han «Kan bli bedre i feltarbeidet», så command_of_area tilføres ikke på grunnlag av generell trygghet.",
    source: "https://www.bt.no/sport/i/AdP3Vx/rbk-importene-er-boersvinnerne",
    sourceKind: "press"
  },
  {
    playerId: "miika_koppinen",
    clubId: "rosenborg",
    strengths: ["duels"],
    claim: "Adresseavisens 2006-evaluering beskriver Miika Koppinen med «Finnen har vært god i duellspillet, og vært tidvis suveren i luftrommet». Dette dokumenterer duels; den samme kilden omtaler pasningsspillet som ujevnt, så det legges ikke til pasningsstyrker.",
    source: "https://www.bt.no/sport/i/AdP3Vx/rbk-importene-er-boersvinnerne",
    sourceKind: "press"
  },
  {
    playerId: "bjorn_tore_kvarme",
    clubId: "rosenborg",
    strengths: ["duels"],
    claim: "Rosenborg-trener Per Joar Hansen beskrev Bjørn Tore Kvarme ved tilbakekomsten i januar 2005 som «en veldig god duellspiller og spesielt godt en-mot-en». Dette dokumenterer defensive duels. Kildens defensive en-mot-en er ikke offensiv one_vs_one i attributtkatalogen.",
    source: "https://www.bt.no/sport/i/wPO885/hoftun-faar-konkurranse",
    sourceKind: "press"
  },
  {
    playerId: "holmar_orn_eyjolfsson",
    clubId: "rosenborg",
    strengths: ["duels"],
    claim: "Erik Hoftun beskrev Hólmar Örn Eyjólfsson ved Rosenborg-signeringen i 2014: «Han er en veldig duellsterk stopper». RBKweb gjengir også at han ikke var superhurtig og kunne utvikle pasningsspillet. Derfor legges duels til, ikke pace eller simple_passing.",
    source: "https://www.rbkweb.no/spiller/eyjolfsson",
    sourceKind: "football_editorial"
  },
  {
    playerId: "oyvind_storflor",
    clubId: "rosenborg",
    strengths: ["one_vs_one"],
    claim: "Adresseavisens vurdering av Rosenborg-vingen Øyvind Storflor etter 2006-sesongen sier «God én mot én, men bør score langt flere mål». Her gjelder det offensivt én-mot-én-spill og belegger one_vs_one; omtalen gir ikke grunnlag for finishing.",
    source: "https://www.bt.no/sport/i/AdP3Vx/rbk-importene-er-boersvinnerne",
    sourceKind: "press"
  },
  // --- Rosenborg: two documented centre-backs, with source-era limits ---------
  {
    playerId: "alejandro_lago",
    clubId: "rosenborg",
    strengths: ["duels", "positioning"],
    claim: "Rosenborgs daværende sportslige leder Erik Hoftun sa i juni 2008 at Alejandro Lago var «en utrolig duellsterk stopper» og «smart i plasseringene». Dette dokumenterer duels og positioning. Hoftun presiserte samtidig at Lago ikke var særlig rask, så pace tilføres ikke. Uttalelsen om defensivt en-mot-en-spill gir heller ikke det offensive one_vs_one-attributtet.",
    source: "https://www.bt.no/sport/i/MR1gV5/vil-forlenge-med-lago",
    sourceKind: "press"
  },
  {
    playerId: "even_hovland",
    clubId: "rosenborg",
    strengths: ["pace", "strength"],
    claim: "Molde-trener Ole Gunnar Solskjær vurderte Even Hovland etter en kamp mot Rosenborg i oktober 2013: «Han viste fart og styrke, var rolig med ballen og god i lufta.» Dette gir konkret belegg for pace og strength. Vurderingen gjelder Hovlands Molde-periode før Rosenborg-overgangen; øvrige ferdigheter utledes ikke automatisk av ros for én kamp.",
    source: "https://www.aftenbladet.no/sport/i/BJ7e1w/even-var-helt-fantastisk",
    sourceKind: "press"
  },
  // --- Rosenborg: bounded individual qualities from later assessments --------
  {
    playerId: "erlend_dahl_reitan",
    clubId: "rosenborg",
    strengths: ["pace"],
    claim: "Rabona vurderte Erlend Dahl Reitan i Starts klubbguide før 2026-sesongen etter over 200 Rosenborg-kamper: «Reitan bidrar med hurtighet og erfaring, og har sin styrke defensivt.» Hurtighet dokumenterer pace, men den generelle defensive karakteristikken gir ikke et spesifikt taklings- eller posisjoneringsattributt. Vurderingen gjelder Start i 2026, ikke et særskilt Rosenborg-år.",
    source: "https://rabonapod.no/2026/03/13/rabonas-klubbguide-2026-start/",
    sourceKind: "football_editorial"
  },
  {
    playerId: "vegar_eggen_hedenstad",
    clubId: "rosenborg",
    strengths: ["set_pieces"],
    attributeValues: { set_pieces: 15 },
    attributeSources: { set_pieces: {
      period: "Rosenborg 2017–2020; FIFA 18",
      evidenceUrl: "https://www.rbkweb.no/spiller/hedenstad",
      comparisonUrl: "https://fifaindex.com/players/186267-vegar-eggen-hedenstad/fifa18",
      rationale: "RBKweb framhever hans farlige dødballer i Rosenborg-perioden; FIFA 18 viser blant annet 71 i frisparkpresisjon. Vår samlede dødballvurdering er 15."
    } },
    claim: "RBKwebs historiske spillerbiografi sier om Vegar Eggen Hedenstads Rosenborg-periode 2017–2020 at han «bidro også framover med mål og farlige dødballer». Dette er direkte belegg for set_pieces, men generelle utsagn om å være en god kombinasjonsspiller er ikke nok til å anta særskilt pasningspresisjon eller dribling.",
    source: "https://www.rbkweb.no/spiller/hedenstad",
    sourceKind: "football_editorial"
  },
  // --- Rosenborg: individual central-midfield and wide-play qualities --------
  {
    playerId: "borek_dockal",
    clubId: "rosenborg",
    strengths: ["crossing", "decisions"],
    attributeValues: { crossing: 16, decisions: 15 },
    attributeSources: {
      crossing: {
        period: "Rosenborg 2011–2013",
        evidenceUrl: "https://www.rbkweb.no/spiller/dockal",
        comparisonUrl: "https://fifaindex.com/es-mx/jugadores/181271-borek-dockal/fifa13",
        rationale: "Speider Torbjørnsen kalte innleggsfoten hans fremste varemerke; FIFA 13 oppførte crossing 72 i RBK-perioden. Egen vurdering 16."
      },
      decisions: {
        period: "Rosenborg 2011–2013",
        evidenceUrl: "https://www.rbkweb.no/spiller/dockal",
        comparisonUrl: "https://fifaindex.com/es-mx/jugadores/181271-borek-dockal/fifa13",
        rationale: "Torbjørnsen kalte ham klok i valgene på banen. FIFA 13 er tidssammenligning, men har ikke en identisk decisions-egenskap; egen vurdering 15."
      }
    },
    claim: "Rosenborg-speider Stig Torbjørnsen beskrev Bořek Dočkal ved signeringen i 2011: «Han har først og fremst en veldig god innleggsfot» og «er klok i valgene han gjør på banen», gjengitt i RBKwebs spillerbiografi. Det belegger crossing og decisions. Utsagn om generell pasningskvalitet blir ikke utvidet til passing_range uten særskilt belegg for lange pasninger.",
    source: "https://www.rbkweb.no/spiller/dockal",
    sourceKind: "football_editorial"
  },
  {
    playerId: "anders_konradsen",
    clubId: "rosenborg",
    strengths: ["work_rate", "ball_carrying"],
    attributeValues: { work_rate: 16 },
    attributeSources: { work_rate: {
      period: "Rosenborg fra 2015; FIFA 15",
      evidenceUrl: "https://www.rbkweb.no/spiller/konradsen",
      comparisonUrl: "https://fifaindex.com/players/187042-anders-konradsen/fifa15",
      rationale: "Ingebrigtsen beskrev ham som hardtarbeidende; FIFA 15 oppga høy/høy arbeidsinnsats og stamina 92, uten at utholdenhet likestilles med work_rate. Egen vurdering 16."
    } },
    claim: "Rosenborg-trener Kåre Ingebrigtsen beskrev Anders Konradsen ved overgangen i 2015 som «en hardtarbeidende spiller» med «godt driv med ball», gjengitt i RBKwebs biografi. Det støtter work_rate og ball_carrying. «Kvikk i steget» gjelder ikke nødvendigvis toppfarten pace og er derfor ikke brukt som fartsvurdering.",
    source: "https://www.rbkweb.no/spiller/konradsen",
    sourceKind: "football_editorial"
  },
  {
    playerId: "marius_lundemo",
    clubId: "rosenborg",
    strengths: ["vision", "work_rate"],
    claim: "Rosenborg-trener Kåre Ingebrigtsen vurderte Marius Lundemo ved signeringen før 2017 som en spiller med «bra overblikk» og «en arbeidssom herremann», gjengitt i RBKwebs spillerbiografi. Overblikk og arbeidsinnsats gir konkret grunnlag for vision og work_rate; generell «god fot» gir ikke i seg selv passing_range eller set_pieces.",
    source: "https://www.rbkweb.no/spiller/lundemo",
    sourceKind: "football_editorial"
  },
  {
    playerId: "anders_trondsen",
    clubId: "rosenborg",
    strengths: ["pace"],
    claim: "Anders Trondsen uttalte selv under Rosenborg-perioden i 2020 at han hadde «bra potensial der, både med pasningsfot, hurtighet og som førsteforsvarer» om venstrebackrollen, gjengitt av Adresseavisen/Aftenposten. Hurtighet gir konkret grunnlag for pace; den brede betegnelsen pasningsfot spesifiserer ikke crossing, passing_range eller set_pieces.",
    source: "https://www.aftenposten.no/sport/fotball/i/g7o9nJ/aapenhjertig-rbk-profil-jeg-passer-ikke-inn-i-spillestilen",
    sourceKind: "press"
  },
  // --- Rosenborg: named pre-transfer assessments of two creative midfielders --
  {
    playerId: "fredrik_midtsjo",
    clubId: "rosenborg",
    strengths: ["game_reading"],
    claim: "Rosenborgs sportslige leder Erik Hoftun beskrev Fredrik Midtsjø i september 2009: «Han er veldig fotballklok. Han er flink til å orientere seg i forkant», gjengitt av RBKwebs 2mas med henvisning til Bladets intervju «Vi har trua på Fredrik». Beskrivelsen av fotballklokskap og orientering i forkant gir belegg for game_reading. Den dokumenterer ikke særskilt anticipation, som krever posisjonering før ballen kommer. «Bra pasningsfot» er for lite spesifikt til automatisk å gi passing_range eller set_pieces. Kilden beskriver ungdomsperioden, ikke en bestemt senere førstelagskamp.",
    source: "https://www.rbkweb.no/forum/viewtopic.php?t=5540&start=0",
    sourceKind: "football_editorial"
  },
  {
    playerId: "john_chibuike",
    clubId: "rosenborg",
    strengths: ["chance_creation"],
    claim: "Rosenborgs talentspeider Stig Torbjørnsen beskrev John Chibuike før signeringen fra Häcken i 2011 slik: «Han er kreativ og har en god pasningsfot. I tillegg scorer han mål og skaper mange sjanser.» «Skaper mange sjanser» belegger chance_creation. Ett utsagn om «ganske tungt skudd» gir ikke automatisk long_shots, som særskilt krever dokumentert skudd fra distanse. Evalueringen gjelder Häcken før Rosenborg-perioden.",
    source: "https://www.rbkweb.no/vis/8371",
    sourceKind: "football_editorial"
  },
  // --- Rosenborg: named individual assessments before arrival, 2006 ---
  {
    playerId: "didier_konan_ya",
    clubId: "rosenborg",
    strengths: ["finishing"],
    attributeValues: { finishing: 15 },
    attributeSources: { finishing: {
      period: "Rosenborg 2006–2009",
      evidenceUrl: "https://www.rbkweb.no/spiller/konan",
      comparisonUrl: "https://fifaindex.com/players/179589-didier-ya-konan/fifa14",
      rationale: "Egen 1–20-kalibrering fra Tørums beskrivelse. FIFA 14 gjelder Hannover-perioden, ikke 2007."
    } },
    claim: "Ved Rosenborgs kjøp av Didier Ya Konan fra ASEC i desember 2006 beskrev trener Knut Tørum ham som en offensiv midtbanespiller med «god pasningsfot og gode avslutningsferdigheter», gjengitt i RBKwebs spillerbiografi. Den konkrete vurderingen av avslutninger belegger finishing; den generelle omtalen av pasningsfot og bevegelighet gir ikke i seg selv spesifikk passing_range, set_pieces eller off_ball_runs. Vurderingen gjelder ankomsten til RBK, ikke en bestemt senere kamp.",
    source: "https://www.rbkweb.no/spiller/konan",
    sourceKind: "football_editorial"
  },
  {
    playerId: "yssouf_kone",
    clubId: "rosenborg",
    strengths: ["pace"],
    claim: "Ved prøvespillet på Gran Canaria i januar 2006 beskrev Rosenborg-trener Per-Mathias Høgmo Yssouf Koné som «hurtig», gjengitt i RBKwebs spillerbiografi. Dette er direkte belegg for pace. Han ble også omtalt som god i lufta og med gode skuddbein, men de brede formuleringene tilordnes ikke egne heading- eller finishing-tokens uten mer presis dokumentasjon. Vurderingen gjelder prøvespillet før overgangen til RBK.",
    source: "https://www.rbkweb.no/spiller/kone",
    sourceKind: "football_editorial"
  },
  // Historisk spillresearch sammenholdt med samtidige trener- og klubbkilder.
  // Tallene er selvstendige 1–20-vurderinger, ikke kopierte FIFA-/FM-ratings.
  {
    playerId: "peter_ankersen",
    clubId: "rosenborg",
    strengths: ["pace"],
    attributeValues: { pace: 16 },
    attributeSources: { pace: {
      period: "Rosenborg 2012",
      evidenceUrl: "https://www.rbkweb.no/spiller/ankersen",
      comparisonUrl: "https://fifaindex.com/players/208564-peter-ankersen/fifa16",
      rationale: "Erik Hoftun beskrev backen som hurtig og fotrapp i 2012; FIFA 16 er senere kryssjekk."
    } },
    claim: "Erik Hoftun beskrev Peter Ankersen ved overgangen til Rosenborg våren 2012 som «bra fart» og «fotrapp», gjengitt av RBKweb. Dette gir belegg for pace; spillerposisjon alene er ikke brukt som ferdighetsbevis. Historisk FIFA 16 er bare sammenligningsgrunnlag fra hans senere karriere.",
    source: "https://www.rbkweb.no/spiller/ankersen",
    sourceKind: "football_editorial"
  },
  {
    playerId: "nicklas_bendtner",
    clubId: "rosenborg",
    strengths: ["strength", "heading"],
    attributeValues: { strength: 17, heading: 17 },
    attributeSources: {
      strength: {
        period: "Rosenborg 2018",
        evidenceUrl: "https://www.rbk.no/nyheter/rosenborg-knuste-molde",
        comparisonUrl: "https://fifaindex.com/players/167706-nicklas-bendtner/fifa18",
        rationale: "Klubbens kampomtale beskriver Bendtner som knallsterk; FIFA 18 er samtidig kontroll."
      },
      heading: {
        period: "Rosenborg 2018",
        evidenceUrl: "https://www.rbk.no/nyheter/rosenborg-knuste-molde",
        comparisonUrl: "https://fifaindex.com/players/167706-nicklas-bendtner/fifa18",
        rationale: "RBKs samtidige beskrivelse av hodeduell og luftspill, kryssjekket mot FIFA 18."
      }
    },
    claim: "Rosenborg beskrev Nicklas Bendtner som «knallsterk» og fortalte konkret hvordan han overvant oppasseren i hodeduell mot Molde 8. april 2018. Det belegger styrke og hodespill, ikke fart eller arbeidskapasitet. FIFA 18 brukes kun som historisk sammenligning.",
    source: "https://www.rbk.no/nyheter/rosenborg-knuste-molde",
    sourceKind: "club"
  },

  // Rosenborg: grouped source pass for established historical squad profiles.
  {
    playerId: "yann_erik_de_lanlay",
    clubId: "rosenborg",
    strengths: ["one_vs_one","pace"],
    claim: "Kåre Ingebrigtsen beskrev de Lanlay ved signeringen i 2015 som «veldig god én mot én» med «bra fart» og sterk evne til å passere motspillere. Disse to egenskapene registreres; mål og andre egenskaper avledes ikke av overgangsbeløpet.",
    source: "https://rbkweb.no/spiller/lanlay",
    sourceKind: "football_editorial"
  },
  {
    playerId: "tarik_elyounoussi",
    clubId: "rosenborg",
    strengths: ["pace"],
    claim: "Erik Hoftun beskrev Tarik Elyounoussi ved overgangen til RBK i august 2012 som en spiller som tilfører «hurtighet» og er «gjennombruddshissig». Det gir belegg for pace, ikke automatisk finishing.",
    source: "https://www.rbkweb.no/spiller/elyounoussi",
    sourceKind: "football_editorial"
  },
  {
    playerId: "tobias_mikkelsen",
    clubId: "rosenborg",
    strengths: ["one_vs_one","finishing"],
    claim: "Trener Per Joar Hansen sa ved RBK-signeringen i 2013 at Mikkelsen kunne «ta av folk én-mot-én» og var «en bra avslutter». Det belegger one_vs_one og finishing; spilleren beskrives før Rosenborg-kampene.",
    source: "https://www.rbkweb.no/spiller/mikkelsen",
    sourceKind: "football_editorial"
  },
  {
    playerId: "rade_prica",
    clubId: "rosenborg",
    strengths: ["strength","hold_up_play"],
    claim: "Rosenborgs sportslige leder Erik Hoftun beskrev i 2011 Rade Prica som «sterk» og «flink ... i oppspillsfasen». Dette underbygger fysisk styrke og evnen til å fungere som oppspillspunkt, ikke en anslått målscore.",
    source: "https://www.rbkweb.no/vis/7995",
    sourceKind: "football_editorial"
  },
  {
    playerId: "nicki_bille_nielsen",
    clubId: "rosenborg",
    strengths: ["strength","hold_up_play","pace"],
    claim: "Nicki Bille beskrev seg selv ved Rosenborg-overgangen i 2013 som «sterk», god til å «holde ... fast på ballen», og «hurtig». Dette er spillerens egen vurdering før RBK-perioden, som underbygger styrke, oppspill og fart, men ikke automatisk avslutninger.",
    source: "https://www.rbkweb.no/vis/9347",
    sourceKind: "football_editorial"
  },
  {
    playerId: "trond_olsen",
    clubId: "rosenborg",
    strengths: ["pace","off_ball_runs"],
    claim: "Sportslig leder Erik Hoftun fremhevet ved kjøpet i 2009 at Olsen hadde «utrolig bra fart» og var «flink til å starte». Dette er belegg for fart og eksplisitte offensive løpsstarter.",
    source: "https://www.rbkweb.no/spiller/tolsen",
    sourceKind: "football_editorial"
  },
  {
    playerId: "karim_essediri",
    clubId: "rosenborg",
    strengths: ["crossing"],
    claim: "RBKwebs spillerbiografi om Karim Essediri beskriver høyrekantspilleren som innehaver av «den gode innleggsfoten» fra Tromsø-perioden før RBK i 2006. Dette er belegg for crossing, ikke dødballer generelt.",
    source: "https://www.rbkweb.no/spiller/essediri",
    sourceKind: "football_editorial"
  },
  {
    playerId: "alexander_soderlund",
    clubId: "rosenborg",
    strengths: ["strength","hold_up_play","work_rate"],
    claim: "Nettavisens vurdering av 2015-sesongen beskriver Søderlund som «stor og sterk», et viktig «oppspillspunkt», og som en spiller med «enorm innsats uten ball». Dette gjelder hans dokumenterte Rosenborg-spill, ikke bare målstatistikk.",
    source: "https://www.nettavisen.no/artikkel/her-er-arets-lag-i-tippeligaen-2015/s/12-95-3423157027",
    sourceKind: "press"
  },
  {
    playerId: "dagfinn_enerly",
    clubId: "rosenborg",
    strengths: ["set_pieces"],
    claim: "RBKwebs spillerbiografi forteller at Enerly scoret «to vakre frispark» mot Stabæk og Sogndal høsten 2002. Den eksplisitt dokumenterte dødballutførelsen gir et avgrenset set_pieces-signal; ingen generell avslutningsvurdering utledes.",
    source: "https://www.rbkweb.no/spiller/enerly",
    sourceKind: "football_editorial"
  },
  {
    playerId: "morten_moldskred",
    clubId: "rosenborg",
    strengths: ["pace"],
    claim: "Landslagstrener Egil «Drillo» Olsen begrunnet uttaket av Morten Moldskred i 2009 med at han hadde «stor fart». Utsagnet gjelder spillerens Tromsø-periode før Rosenborg, men dokumenterer den individuelle pace-egenskapen.",
    source: "https://www.aftenbladet.no/sport/i/BRJzE0/doffen-paa-landslaget",
    sourceKind: "press"
  },
  {
    playerId: "erik_botheim",
    clubId: "rosenborg",
    strengths: ["strength"],
    claim: "HamKams omtale av Norges G19-landslag i 2018 kalte Botheim en «stor og fysisk Rosenborg-spiss», etter en kamp hvor han spilte i det fysiske boks- og duellspillet. Bare fysisk styrke registreres; scoringen er ikke belegg for en særskilt finishing-vurdering.",
    source: "https://www.hamkam.no/nyheter/snuoperasjon-av-norge-g19",
    sourceKind: "club"
  },
  {
    playerId: "samuel_adegbenro",
    clubId: "rosenborg",
    strengths: ["one_vs_one","pace"],
    claim: "Dagbladets kampreferat fra BATE–Rosenborg sommeren 2019 fremhevet eksplisitt Adegbenros «dribleferdigheter og hurtighet» da han utfordret BATEs høyreback. Dette belegger offensivt én-mot-én-spill og fart.",
    source: "https://www.dagbladet.no/sport/champions-league-hapet-lever-for-rbk/71429565",
    sourceKind: "press"
  },
  {
    playerId: "johan_laedre_bjordal",
    clubId: "rosenborg",
    strengths: ["duels"],
    claim: "Vikings sportsdirektør Egil Østenstad beskrev Johan Lædre Bjørdal i 2011 som «duellsterk og uredd». Dette gjelder hans periode før Rosenborg, og gir kun duels som dokumentert ferdighet.",
    source: "https://www.bt.no/sport/i/AdlLMq/johan-laedre-bjoerdal-klar-for-viking",
    sourceKind: "press"
  },
  {
    playerId: "mikkel_konradsen_ceide",
    clubId: "rosenborg",
    strengths: ["duels","ball_carrying"],
    claim: "Rotsekks kampvurdering mot HamKam i september 2026 omtaler Mikkel Ceïde som «Sterk i duellene» og «flinkere til å ta med seg ballen forbi ledd». Dette underbygger duels og ball_carrying for en navngitt, datert RBK-opptreden, uten å gjøre én kamp til en generell teknisk totaldom.",
    source: "https://rotsekk.com/borsen/a0522391-2f1d-4543-ba8f-bb635e333233",
    sourceKind: "football_editorial"
  },
  {
    playerId: "aslak_fonn_witry",
    clubId: "rosenborg",
    strengths: ["crossing"],
    claim: "Rotsekks kampvurdering mot HamKam i september 2026 fremhever eksplisitt at Witry har «så god innlegsfot». Dette belegger crossing, mens «høyt tempo» i omtalen ikke uten videre tolkes som individuell sprintfart.",
    source: "https://rotsekk.com/borsen/a0522391-2f1d-4543-ba8f-bb635e333233",
    sourceKind: "football_editorial"
  },
  // Rosenborg: historic-and-modern full-club source review, independently cited.
  {
    playerId: "jan_christiansen",
    clubId: "rosenborg",
    strengths: ["simple_passing","tempo_control"],
    claim: "Aftenpostens historiske Rosenborg-kåring (2010) beskriver Jan Christiansen som «dirigenten med stor D» som «regisserte midtbanen, og slo de gode pasningene». Dette dokumenterer pasningsspill og organisering av spillets rytme; det er ikke et belegg for sprintfart eller dødballer.",
    source: "https://www.aftenposten.no/sport/fotball/i/Jo6LWX/tolv-aars-svar-paa-tiltale",
    sourceKind: "press"
  },
  {
    playerId: "trond_sollied",
    clubId: "rosenborg",
    strengths: ["heading"],
    claim: "Rabona beskriver i tilbakeblikket på 1980-tallet Trond Sollied som en «solid midtstopper som var farlig i motstanderens sone» og viser konkret til at han headet inn Rosenborgs avgjørende seriegullmål i 1988. Hendelsen gir et avgrenset, dokumentert signal om heading; den viser ikke automatisk styrke eller fart.",
    source: "https://rabonapod.no/2025/06/26/tiarslagene-80-tallet/",
    sourceKind: "football_editorial"
  },
  {
    playerId: "arne_dokken",
    clubId: "rosenborg",
    strengths: ["duels","heading"],
    claim: "Arne Dokken beskriver selv spillestilen fra den aktive karrieren: «Tøff i duellene, og ga som vanlig alt.» Han forklarer også at Panathinaikos ønsket en spiss som tok for seg «i duellene. Ikke minst i lufta». Det underbygger duellspill og luftstyrke; intervjuet i 2025 er et retrospektivt vitnesbyrd, ikke en samtidsscore.",
    source: "https://bydrammen.no/arne-dokken-indre-drive/",
    sourceKind: "press"
  },
  {
    playerId: "mattias_bjarsmyr",
    clubId: "rosenborg",
    strengths: ["duels"],
    claim: "Adresseavisens samtidige vurdering ved Bjärsmyrs Rosenborg-overgang 30. august 2010, gjengitt i Stavanger Aftenblad, karakteriserer ham som «duellsterk og god med ballen». Det første gir konkret belegg for duels; «god med ballen» er ikke tilstrekkelig spesifikt for noen bestemt pasningsegenskap.",
    source: "https://www.aftenbladet.no/sport/i/wEMono/liker-at-klubben-er-vant-til-aa-vinne",
    sourceKind: "press"
  },
  {
    playerId: "noah_jean_holm",
    clubId: "rosenborg",
    strengths: ["strength","hold_up_play"],
    claim: "Noah Holm sa i juni 2024, etter ros fra trener Johansson for spissinnsatsen: «Jobben til en spiss i Rosenborg-systemet er at du skal være fysisk sterk og holde på ballen ... Det var deilig å kunne hjelpe laget mitt på den måten.» Utsagnet gjelder konkret utført spissarbeid, og belegger styrke og ballholding, ikke generell avslutningskvalitet.",
    source: "https://www.rbkweb.no/vis/17339",
    sourceKind: "football_editorial"
  },
  {
    playerId: "dino_islamovic",
    clubId: "rosenborg",
    strengths: ["pressing","hold_up_play","work_rate"],
    claim: "Rosenborg-trener Alfred Johansson vurderte Islamović etter Tromsø-kampen 27. juli 2025 slik: «bidrar ekstremt mye i presspillet, i returløp, på defensive dødballer og som oppspillspunkt mot mann-mann-press». Treneren fremhevet også at han fortsatte å «jobbe hardt for laget». Dette belegger press, oppspillspunkt og arbeidsinnsats; fire scoringer i én kamp er ikke brukt til å anslå finishing.",
    source: "https://www.rbkweb.no/vis/17925",
    sourceKind: "football_editorial"
  },
  {
    playerId: "janne_saarinen",
    clubId: "rosenborg",
    strengths: ["set_pieces"],
    claim: "RBKweb dokumenterer at Janne Saarinen før Rosenborg-overgangen ble matchvinner i den finske cupfinalen med «et susende frispark». Registreringen gir et begrenset set_pieces-belegg for direkte frispark, ikke bevis for kvalitet på alle dødballer.",
    source: "https://www.rbkweb.no/spiller/saarinen",
    sourceKind: "football_editorial"
  },
  {
    playerId: "christer_george",
    clubId: "rosenborg",
    strengths: ["movement"],
    claim: "Nils Arne Eggen vurderte Christer Georges spissbevegelse i mai 2002: «Christer kommer seg ofte til mange fine sjanser. Det er bare snakk om å være presis nok i avslutningene». Det underbygger offensive bevegelser som fører til avslutningsposisjoner, men ikke finishing; kilden peker tvert imot på upresise avslutninger.",
    source: "https://www.rbkweb.no/vis/994",
    sourceKind: "football_editorial"
  },
  {
    playerId: "edvard_sandvik_tagseth",
    clubId: "rosenborg",
    strengths: ["stamina","positioning"],
    claim: "RBK-trener Alfred Johansson fremhevet Edvard Tagseths «god løpskraft» og høye intensitet etter kamp i mai 2024, og beskrev ham som «veldig dyktig på å posisjonere seg». Utsagnene gjelder løpskapasitet og plassering for å bli spillbar; de gir ikke grunnlag for å tallfeste kreativitet eller skudd.",
    source: "https://www.aftenbladet.no/sport/i/yE30Kr/oensker-at-rbk-profilen-blir-i-trondheim",
    sourceKind: "press"
  },
  {
    playerId: "jesper_reitan_sunde",
    clubId: "rosenborg",
    strengths: ["work_rate"],
    claim: "Rabona sin Rosenborg-gjennomgang før 2026-sesongen trekker fram at Jesper Reitan-Sunde «viser vilje og innsats» selv om det foreløpig ikke løsner i angrepsspillet. Sammen med lagkamerat Noah Holms vurdering i 2024 om at Jesper «la ned en utrolig jobb» gir det belegg for arbeidsinnsats, ikke for pasning eller avslutning.",
    source: "https://rabonapod.no/2026/03/06/klubbguiden-2026-nr-8/",
    sourceKind: "football_editorial"
  },
  // Rosenborg: combined follow-up evidence, independent player descriptions.
  {
    playerId: "nils_arne_eggen",
    clubId: "rosenborg",
    strengths: ["determination","game_reading","vision"],
    claim: "Store norske leksikons avsnitt om Eggens egen spillestil omtaler ham som «en viljesterk fighter, taktisk klok og med godt blikk for spillet». Dette gir individuelt grunnlag for viljestyrke (determination), fotballforståelse og overblikk; trenerkarrieren er ikke brukt som ferdighetsbevis.",
    source: "https://snl.no/Nils_Arne_Eggen",
    sourceKind: "encyclopedia"
  },
  {
    playerId: "matthias_vilhjalmsson",
    clubId: "rosenborg",
    strengths: ["heading"],
    claim: "Rosenborg-trener Kåre Ingebrigtsen sa ved kjøpet i 2015 at Vilhjálmsson «har en spisskompetanse i lufta, der han kanskje er Tippeligaens beste sammen med Frode Johnsen». Dette belegger heading spesifikt; spilleren får ikke automatisk generell styrke eller finishing.",
    source: "https://www.rbkweb.no/spiller/vilhjalmsson",
    sourceKind: "football_editorial"
  },
  {
    playerId: "sebastian_eguren",
    clubId: "rosenborg",
    strengths: ["simple_passing","leadership"],
    claim: "Sportsdirektør Rune Bratseth beskrev Eguren ved signeringen i 2005 med «en meget god høyrefot som gjør ham til en god pasningslegger» og sa at han «er dessuten en ledertype». Dette dokumenterer pasningskvalitet og lederskap, men ikke noen særskilt langpasningsegenskap eller langskudd alene.",
    source: "https://www.rbkweb.no/spiller/eguren",
    sourceKind: "football_editorial"
  },
  {
    playerId: "mix_diskerud",
    clubId: "rosenborg",
    strengths: ["stamina","vision","composure"],
    claim: "Fotballekspert Lars Tjærnås skrev om Mikkel «Mix» Diskerud høsten 2012 at han kom med «en imponerende løpskapasitet kombinert med ro og overblikk med ball». Dette er konkret belegg for løpskapasitet, overblikk og ro med ballen, ikke antatte dødballferdigheter.",
    source: "https://www.aftenposten.no/sport/meninger/i/jdLgaL/slik-vurderer-tjaernaas-sesonginnspurten",
    sourceKind: "press"
  },
  {
    playerId: "besart_berisha",
    clubId: "rosenborg",
    strengths: ["determination"],
    claim: "Rosenborg-trener Erik Hamrén beskrev Besart Berisha etter debuten mot Molde i august 2008: «Han har en riktig god vinnermentalitet, som lyser i øynene på ham». Dette gir et avgrenset belegg for determination; to debutmål alene regnes ikke som dokumentasjon av finishing.",
    source: "https://www.rbkweb.no/vis/6303",
    sourceKind: "football_editorial"
  },
  {
    playerId: "tore_andre_dahlum",
    clubId: "rosenborg",
    strengths: ["dribbling","runs_behind"],
    claim: "I et eget intervju gjengitt i Norges Fotballforbunds UEFA A-lisensmateriale beskrev Tore André Dahlum hvordan han ofte scoret etter «dribling/løp i bakrom» og nevnte egne «teknikk og koordinasjon». Det gir konkret grunnlag for dribling og bakromsløp; måltall er ikke brukt til å beregne attributter.",
    source: "https://www.fotball.no/kretser/agder/spillerutvikling/artikler/Hvordantrenepaascoremasomangrepsspiller/oppgave-uefa-a-lisens-tor-henning-hamre/",
    sourceKind: "club"
  },
  {
    playerId: "mushaga_bakenga",
    clubId: "rosenborg",
    strengths: ["pace","determination"],
    claim: "Lars Tjærnås beskrev Mushaga Bakenga i Rosenborgs 2011-forhåndsvurdering med «Stor fart, stor vilje og stor selvtillit». Dette er konkret grunnlag for pace og determination, ikke en automatisk finishing-verdi ut fra antall mål.",
    source: "https://www.aftenbladet.no/sport/i/8wbJ22/her-er-laget-ditt-jonsson",
    sourceKind: "press"
  },
  {
    playerId: "trond_henriksen",
    clubId: "rosenborg",
    strengths: ["bravery"],
    claim: "Bergens Tidende skildret Trond Henriksen som en «knalltøff back» som fikk tilnavnet Rambo for sin «oppofrende spillestil». Dette underbygger bravery som villighet til å gå helhjertet inn i forsvarsspillet, men ikke en egen taklings- eller sprintfartvurdering.",
    source: "https://www.bt.no/sport/i/xP4d7X/eplet-som-falt-et-stykke-fra-stammen",
    sourceKind: "press"
  },
  // Rosenborg: consolidated historical-player follow-up, documented existing affiliations.
  {
    playerId: "karl_petter_loken",
    clubId: "rosenborg",
    strengths: ["pace"],
    claim: "Adresseavisens Rosenborg-jury beskrev Karl-Petter Løken med «stor fart» som høyreving. Dette underbygger pace, ikke en ubestemt liste av offensive spesialferdigheter.",
    source: "https://www.aftenposten.no/sport/fotball/i/zGMV5w/den-lynhurtige-akademikeren",
    sourceKind: "press"
  },
  {
    playerId: "geir_karlsen",
    clubId: "rosenborg",
    strengths: ["shot_stopping"],
    claim: "RBKweb dokumenterer en rekke redninger fra Geir Karlsen i 1971 og beskriver «en av sine mest klassiske redninger» mot Varegg. Dette belegger skuddredninger, ikke utledet ferdighet fra lagets baklengsstatistikk.",
    source: "https://www.rbkweb.no/vis/11344",
    sourceKind: "football_editorial"
  },
  {
    playerId: "kare_ronnes",
    clubId: "rosenborg",
    strengths: ["game_reading"],
    claim: "Adresseavisens historiske RBK-jury karakteriserte Kåre Rønnes med «Enormt god fotballforståelse». Avisens portrett trekker også fram evnen til å lese spillet som forsvarer. Dette dokumenterer game_reading.",
    source: "https://www.aftenposten.no/sport/fotball/i/GG05lq/den-foerste-kontinuitetsbaereren",
    sourceKind: "press"
  },
  {
    playerId: "tore_pedersen_rbk",
    clubId: "rosenborg",
    strengths: ["pace","crossing"],
    claim: "Adresseavisens kåring av RBKs høyrevinger forteller at Tore Pedersen «var hurtig» og «slo gode innlegg». Det gir konkret belegg for pace og crossing, ikke automatisk langskudd eller generell avslutningspresisjon.",
    source: "https://www.aftenposten.no/sport/fotball/i/zGMV5w/den-lynhurtige-akademikeren",
    sourceKind: "press"
  },
  {
    playerId: "jan_hansen",
    clubId: "rosenborg",
    strengths: ["work_rate"],
    claim: "Adresseavisens historiske RBK-portrett beskriver Jan Hansen (1975–1988) som «hardtarbeidende midtbanesliteren». Det belegger work_rate, ikke automatisk toppfart eller pasningsrepertoar.",
    source: "https://www.aftenposten.no/sport/fotball/i/Jo6LWX/tolv-aars-svar-paa-tiltale",
    sourceKind: "press"
  },
  {
    playerId: "alexander_lund_hansen",
    clubId: "rosenborg",
    strengths: ["reflexes"],
    claim: "Tidligere lagkamerat Atle Roar Håland fortalte i 2010 at Alexander Lund Hansen hadde «gode reflekser». Dette underbygger reflexes. Evnen til å dirigere forsvaret forveksles ikke med spesifikk styring av keeperfeltet.",
    source: "https://www.aftenbladet.no/sport/i/7lXgjw/en-av-norges-beste-duellstoppere",
    sourceKind: "press"
  },
  {
    playerId: "bjorn_wirkola",
    clubId: "rosenborg",
    strengths: ["pace"],
    claim: "Nils Arne Eggen sa om Bjørn Wirkola i et Dagbladet-intervju i 2016: «Bjørn hadde stor fart» da Eggen hadde sett ham spille for Melhus før RBK-overgangen. Dette er dokumentasjon av pace som fotballspiller, ikke en ekstrapolering fra skihoppingen.",
    source: "https://www.dagbladet.no/nyheter/livet-etter-tapet-av-sonnene---minnene-er-en-del-av-det-gode-liv/60331729",
    sourceKind: "press"
  },
  {
    playerId: "hassan_el_fakiri",
    clubId: "rosenborg",
    strengths: ["game_reading"],
    claim: "Bergens Tidende beskriver Hassan El Fakiri som en spiller som «alltid vært teknisk og taktisk sterk» og som foretrakk lavrisiko ballbruk. Taktisk styrke dokumenterer game_reading, men ikke spesifikk langpasnings- eller dribleverdi.",
    source: "https://www.bt.no/sport/i/RRGmxx/vet-hva-hele-bergen-krever",
    sourceKind: "press"
  },
  // Rosenborg: final residual evidence review, four sourced historical players.
  {
    playerId: "arne_hanssen",
    clubId: "rosenborg",
    strengths: ["strength"],
    claim: "Tidligere Tromsø-spiller Tore Nilsen husker Arne Hanssen fra en cupkamp mot Bodø/Glimt som «stor og sterk». Dette beskriver fysisk styrke hos samme spiss som tidligere spilte Rosenborg, men gjelder hans senere Glimt-periode. Det brukes ikke som belegg for hurtighet eller avslutningspresisjon.",
    source: "https://www.til.no/nyheter/det-forste-malet-var-spesielt",
    sourceKind: "club"
  },
  {
    playerId: "knut_torbjorn_eggen",
    clubId: "rosenborg",
    strengths: ["bravery"],
    claim: "Lagkamerat Sverre Brandhaug omtalte i 2012 Knut Torbjørn Eggen som en «kompromissløs midtstopper» fra Rosenborgs 1980-tall. Beskrivelsen gir avgrenset belegg for et uredd, oppofrende forsvarsspill (bravery), ikke en beregnet taklings- eller pasningsverdi.",
    source: "https://www.dagsavisen.no/sport/knut-torbjorn-eggen-er-dod/4991305",
    sourceKind: "press"
  },
  {
    playerId: "tom_kare_staurvik",
    clubId: "rosenborg",
    strengths: ["long_shots"],
    claim: "En samtidig Aftenbladet/Sunnmørsposten-omtale fra august 2003 beskrev Tom Kåre Staurvik som «den hardtskytende Staurvik» og fremhevet hans «voldsomme tilslag». Det er belegg for utpreget skuddkraft, registrert avgrenset under long_shots, men ikke for høy presisjon eller hurtighet.",
    source: "https://www.aftenbladet.no/sport/i/kaqgAj/lokket-med-klippfisk-gryte",
    sourceKind: "press"
  },
  {
    playerId: "sverre_fornes",
    clubId: "rosenborg",
    strengths: ["shot_stopping"],
    claim: "Adresseavisens minneartikkel om keeper Sverre Fornes beskriver hans debut som 16-åring mot Freidig i 1948: «både Gunnar Dahlen og Jan Sørdal ble stoppet av en 16-åring denne dagen – RBK vant 1–0». Det gir et konkret historisk eksempel på skuddredninger, ikke en direkte numerisk ferdighetsvurdering.",
    source: "https://www.aftenbladet.no/sport/i/v53yL5/han-var-mannen-bak-troillongan-naa-har-rbk-kjempen-gaatt-bort",
    sourceKind: "press"
  },
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
  return {
    ...player,
    strengths: [...record.strengths],
    ...(record.attributeValues ? {
      attributeValues: { ...(player.attributeValues || {}), ...record.attributeValues },
      attributeSources: { ...(player.attributeSources || {}), ...record.attributeSources }
    } : {})
  };
}

export function applySourceDepthClaims(players) {
  return (Array.isArray(players) ? players : []).map(applySourceDepthClaimsToPlayer);
}
