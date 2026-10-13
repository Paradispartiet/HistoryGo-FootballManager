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
    claim: "RBKwebs historiske spillerbiografi sier om Vegar Eggen Hedenstads Rosenborg-periode 2017–2020 at han «bidro også framover med mål og farlige dødballer». Dette er direkte belegg for set_pieces, men generelle utsagn om å være en god kombinasjonsspiller er ikke nok til å anta særskilt pasningspresisjon eller dribling.",
    source: "https://www.rbkweb.no/spiller/hedenstad",
    sourceKind: "football_editorial"
  },
  // --- Rosenborg: individual central-midfield and wide-play qualities --------
  {
    playerId: "borek_dockal",
    clubId: "rosenborg",
    strengths: ["crossing", "decisions"],
    claim: "Rosenborg-speider Stig Torbjørnsen beskrev Bořek Dočkal ved signeringen i 2011: «Han har først og fremst en veldig god innleggsfot» og «er klok i valgene han gjør på banen», gjengitt i RBKwebs spillerbiografi. Det belegger crossing og decisions. Utsagn om generell pasningskvalitet blir ikke utvidet til passing_range uten særskilt belegg for lange pasninger.",
    source: "https://www.rbkweb.no/spiller/dockal",
    sourceKind: "football_editorial"
  },
  {
    playerId: "anders_konradsen",
    clubId: "rosenborg",
    strengths: ["work_rate", "ball_carrying"],
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
