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
  // Strømsgodset 2026-10-19: lagkamerat beskriver konkret lederrolle.
  {
    "playerId": "ulf_camitz",
    "clubId": "stromsgodset",
    "strengths": [
      "leadership"
    ],
    "claim": "I Strømsgodsets intervju «Blå Legender: Arne Gustavsen» beskriver lagkamerat Gustavsen samholdet i 1987 og forteller at spillerne «tilbrakte veldig mye tid sammen også utenfor treningene, ofte hjemme hos Ulf Camitz, som nok var et naturlig midtpunkt». Samme klubbhistorie identifiserer Camitz som lagkaptein da han ble med videre i kriseperioden. Samlet dokumenterer dette en konkret ledende og samlende rolle i spillergruppen (leadership), ikke ferdigheter utledet fra kamptall, scoringer eller generell kapteinsstatus alene.",
    "source": "https://www.godset.no/nyheter/bla-legender-arne-gustavsen",
    "sourceKind": "club"
  },

  // Strømsgodset 2026-10-19: individuell handling i dokumentert cupfinale.
  {
    "playerId": "finn_aksel_olsen",
    "clubId": "stromsgodset",
    "strengths": [
      "runs_behind"
    ],
    "claim": "Strømsgodsets detaljert beskrevne cupfinale fra 21. oktober 1973 sier: «Thorodd tverrvendte og sendte Finn Aksel Olsen igjennom, og i en løpeduell inne i RBK feltet falt Finn Aksel»; gjennombruddsløpet skaffet lagets avgjørende straffespark. Dette gir et konkret, navngitt eksempel på løp bak forsvarslinjen (runs_behind), men én episode gir ikke grunnlag for pace, dribbling eller numerisk ferdighetsrating.",
    "source": "https://www.godset.no/nyheter/50-ar-siden-i-dag-den-tredje-kongepokalen",
    "sourceKind": "club"
  },

  // Strømsgodset 2026-10-19: originale spillerbeskrivelser bevart via Web Archive.
  {
    "playerId": "erik_eriksen",
    "clubId": "stromsgodset",
    "strengths": [
      "bravery"
    ],
    "claim": "Strømsgodsets historiske spillerprofil om Erik J. Eriksen beskriver ham som «knallhard» venstreback, og presiserer at om «han fikk skuldra ut av ledd» ble skulderen satt på plass før «han spilte videre». Det er eksplisitt belegg for bravery gjennom oppofrende, uredd spill; senere temperament som trener tolkes ikke som en spillerferdighet. Arkivet bruker mellominitial J. om samme 1960-/70-tallsspiller som katalogen kaller Erik Eriksen.",
    "source": "https://web.archive.org/web/20171004140200/http://www.godsetmedia.no/spillere/erik-j.-eriksen/id/5",
    "sourceKind": "club"
  },
  {
    "playerId": "svein_dahl_andersen",
    "clubId": "stromsgodset",
    "strengths": [
      "pace"
    ],
    "claim": "Strømsgodsets arkiverte individuelle spillerprofil beskriver Svein Dahl Andersen som «en enormt frisk og rask venstre back». Ordet «rask» dokumenterer pace i Godset-perioden. «Frisk» brukes ikke til å utlede stamina eller natural_fitness, og dagens naturlige posisjonsregistrering blir stående uendret.",
    "source": "https://web.archive.org/web/20170218063131/http://www.godsetmedia.no/spillere/svein-dahl-andersen/id/51",
    "sourceKind": "club"
  },

  // Strømsgodset 2026-10-19: individuelt dokumenterte egenskaper fra klubbarkiv og spilleruttalelser.
  {
    "playerId": "bismark_adjei_boateng",
    "clubId": "stromsgodset",
    "strengths": [
      "strength",
      "stamina",
      "vision"
    ],
    "claim": "Colorado Rapids' sportsdirektør Pádraig Smith beskrev Bismark «Nana» Adjei-Boateng etter Godset-perioden som «a powerful player with the drive and energy to be effective box to box» og med «great technique and vision». Dette belegger fysisk styrke, kapasitet til boks-til-boks-løp og spilleforståelse, men ingen rating. Kilden navngir Bismark og Nana som samme person; den separate legacy-ID-en nana_boateng beholdes uendret i påvente av sikker save-migrering.",
    "source": "https://www.coloradorapids.com/news/rapids-acquire-ghanaian-midfielder-bismark-nana-adjei-boateng-manchester-city",
    "sourceKind": "club"
  },
  {
    "playerId": "halvor_storskogen",
    "clubId": "stromsgodset",
    "strengths": [
      "finishing"
    ],
    "claim": "GodsetUnionens historiske portrett av Odd Johnsen omtaler samspillet med «en annen måltyv» og identifiserer denne eksplisitt i påfølgende sitat: «Samspillet med Halvor Storskogen var det beste som har skjedd SIF siden Steinar Pettersen og Thorodd Presberg herjet på 70-tallet». Omtalen av Storskogen som måltyv gir individuelt belegg for avslutninger/målteft, uten å tallfeste nivå fra målstatistikk.",
    "source": "https://www.godsetunionen.com/odd-johnsen/",
    "sourceKind": "football_editorial"
  },
  {
    "playerId": "frode_johannessen",
    "clubId": "stromsgodset",
    "strengths": [
      "strength"
    ],
    "claim": "Strømsgodsets egen historiske gjennomgang «De 10 store kampene» omtaler Frode Johannessen som «stopperkjempen Frode Johannessen» ved omtalen av opprykkslaget i 1987. Dette er en eksplisitt beskrivelse av kraftfull fysisk forsvarstilstedeværelse, ført avgrenset som fysisk styrke; den gir ikke belegg for konkrete taklinger, tempo eller pasningsferdigheter.",
    "source": "https://www.godset.no/nyheter/de-10-store-kampene",
    "sourceKind": "club"
  },

  // Strømsgodset 2026-10-19: klubbens uttrykkelige spillertypebeskrivelse.
  {
    "playerId": "kai_arild_lund",
    "clubId": "stromsgodset",
    "strengths": [
      "finishing"
    ],
    "claim": "Strømsgodsets artikkel «Mål nummer 1600 på Marienlyst!» omtaler Kai Arild Lund som «vår notoriske goalgetter fra tidlig 80-tall». Den individualiserte spillertypebeskrivelsen underbygger målteft/avslutninger (finishing). De 50 registrerte hjemmemålene brukes som historisk kontekst, ikke som numerisk rating eller belegg for andre ferdigheter.",
    "source": "https://www.godset.no/nyheter/mal-nummer-1600-pa-marienlyst",
    "sourceKind": "club"
  },

  // Strømsgodset 2026-10-19: individuelt beskrevet spillerstil fra andre karriereperioder.
  {
    "playerId": "martin_wiig",
    "clubId": "sarpsborg08",
    "strengths": [
      "runs_behind",
      "finishing"
    ],
    "claim": "FFKsupporters 2010-gjennomgang av Sarpsborg 08 beskriver Martin Wiig som «den kloke bakromsspissen og avslutteren». Det dokumenterer eksplisitt bakromsløp og avslutninger fra hans Sarpsborg-periode, ikke automatisk hurtighet eller en tallrating. Påstanden gjelder spillerens kildebelagte Sarpsborg-tilknytning og legges bare på den eksisterende flerklubbprofilen; den utledede Godset-tilknytningen blir stående uavklart.",
    "source": "https://ffksupporter.net/nyheter/1904-4-plass-sarpsborg-08/",
    "sourceKind": "football_editorial"
  },
  {
    "playerId": "vegard_hansen",
    "clubId": "stromsgodset",
    "strengths": [
      "determination"
    ],
    "claim": "I Dagsavisens portrett fra 2015 siterer Vegard Hansen om tiden som Strømsgodset-spiller: «Jeg var kaptein i Strømsgodset og hadde noen ålreite sesonger på begynnelsen av 90-tallet» og «Men jeg ville mer enn de andre». Han sier også «Men mentalt er jeg sterk». Dette underbygger determination som personlig vinnervilje, ikke fysisk styrke, duellspill eller pasningsevne.",
    "source": "https://www.dagsavisen.no/nyheter/fotballhue/8501073",
    "sourceKind": "press"
  },

  // Strømsgodset 2026-10-18: fire individuelle presse- og spilleromtaler, også fra senere/tidligere klubber.
  {
    "playerId": "andre_hanssen",
    "clubId": "stromsgodset",
    "strengths": [
      "stamina",
      "duels"
    ],
    "claim": "Aftenpostens samtidige overgangsoversikt fra 2005 omtaler André Hanssen ved navn som «løpssterk og god i duellspillet». Dette dokumenterer utholdenhet og duellspill fra Heerenveen-perioden, før hans senere Strømsgodset-opphold; ingen styrker utledes fra posisjon eller antall kamper.",
    "source": "https://www.aftenposten.no/sport/fotball/i/MR5nWo/brann-jakter-islandsk-spiss",
    "sourceKind": "press"
  },
  {
    "playerId": "fritjof_wilborn",
    "clubId": "stromsgodset",
    "strengths": [
      "pace"
    ],
    "claim": "Dagbladets portrett av Fritjof (Frithjof) Wilborn forteller at Aftenposten kalte ham «hjemmelagets svar på Carl Lewis: Frithjof Wilborn» i Godset-perioden, og beskriver hans senere Brann-karriere med «Frithjof var så rask at han løp fra ballen». Begge beskriver eksplisitt løpshurtighet; den enkeltstående headingen i Brann-perioden føres ikke som en generell styrke.",
    "source": "https://www.dagbladet.no/magasinet/fritt-wilt/66309468",
    "sourceKind": "press"
  },
  {
    "playerId": "kenneth_widemann_karlsen",
    "clubId": "stromsgodset",
    "strengths": [
      "heading"
    ],
    "claim": "Dagbladets/NTBs kamprapport fra Strømsgodset–Viking i 1999 fremhever luftstyrken til midtstopper Kenneth Karlsen direkte: «Han var omtrent like god i lufta som Flo var på den andre siden av banen». Det gir en individuell hodespillpåstand fra Godset-perioden, ikke en generell defensiv posisjonsmal.",
    "source": "https://www.dagbladet.no/sport/bare-flo-scorer-for-godset/65523432",
    "sourceKind": "press"
  },
  {
    "playerId": "kenneth_nysaether",
    "clubId": "stromsgodset",
    "strengths": [
      "strength"
    ],
    "claim": "Tidligere lagkamerat Stian Davidsens personlige tilbakeblikk på Skjetten-spillere omtaler «Midtstopper: Kenneth Nysæther» og beskriver ham med «Masse rutine, sterk og trygg». Den eksplisitte «sterk»-beskrivelsen underbygger fysisk styrke fra hans senere Skjetten-periode; rollebytte og trygghet oversettes ikke til nye Godset-posisjoner eller udokumenterte ferdigheter.",
    "source": "https://www.lokalfotballen.blog/2017/11/07/mitt-favorittlag-stian-davidsen-alt-handler-om-skjetten/",
    "sourceKind": "football_editorial"
  },

  // Strømsgodset 2026-10-18: individuelt klubbminne med navngitte ferdigheter.
  {
    "playerId": "johnny_vidar_pedersen",
    "clubId": "stromsgodset",
    "strengths": [
      "game_reading",
      "long_shots",
      "work_rate"
    ],
    "claim": "Strømsgodsets minneord om Johnny Vidar Pedersen fra 5. august 2020 beskriver ham som en spiller med «god forståelse, god teknikk og et godt skudd», og at han «jobbet hardt og alltid ga sitt ytterste for klubben». Klubben forteller dessuten konkret om semifinalemålet mot HamKam i 1969: «et stjernetreff fra 20 meter i vinkelen». Spilleforståelse, langskudd og arbeidsinnsats er dermed individuelt kildebelagt; generell teknikk oversettes ikke til et uspesifisert ferdighetstoken.",
    "source": "https://www.godset.no/nyheter/johnny-vidar-pedersen-er-dod",
    "sourceKind": "club"
  },

  // Strømsgodset 2026-10-18: fem nye individuelle kildeprofiler etter PR #422.
  {
    "playerId": "havard_beckstrom",
    "clubId": "stromsgodset",
    "strengths": [
      "stamina",
      "work_rate"
    ],
    "claim": "Strømsgodsets minneartikkel fra 26. april 2019 beskriver Håvard Beckstrøm direkte som «en løpssterk midtbanespiller, en som rev og slet i motstanderen og jobbet hardt for laget». Det gir individuelt belegg for utholdenhet og arbeidsinnsats fra Godset-perioden, ikke styrker utledet fra karrierestatistikk. Den eksisterende posisjonen endres ikke.",
    "source": "https://www.godset.no/nyheter/havard-beckstrom-til-minne",
    "sourceKind": "club"
  },
  {
    "playerId": "geir_andersen",
    "clubId": "stromsgodset",
    "strengths": [
      "set_pieces"
    ],
    "claim": "Blå Armés historiske cupfinalereferat fra Rosenborg–Strømsgodset 1991 beskriver direkte: «Etter 28 minutter la Geir Andersen corner fra høyre». Odd Johnsen styrte denne corneren i mål. Den navngitte, målgivende dødballen underbygger set_pieces, men ikke en generell pasnings- eller tallrating.",
    "source": "https://baof.wordpress.com/2011/07/16/jakten-pa-pokaler/",
    "sourceKind": "football_editorial"
  },
  {
    "playerId": "trond_nordeide",
    "clubId": "stromsgodset",
    "strengths": [
      "long_shots"
    ],
    "claim": "Blå Armés cupfinaleomtale av Rosenborg–Strømsgodset 1991 skriver at «Trond Nordeide traff perfekt fra 18 meter», og at ballen gikk i bue inn til 3–1; en annen gjengivelse siterer spilleren på at han bevisst løftet ballen i motsatt vinkel. Dette er en konkret avslutning fra distanse, ikke en ferdighet utledet fra antall mål.",
    "source": "https://baof.wordpress.com/2005/11/01/cupfinalen-1991/",
    "sourceKind": "football_editorial"
  },
  {
    "playerId": "kim_andre_madsen",
    "clubId": "stromsgodset",
    "strengths": [
      "heading"
    ],
    "claim": "NTBs samtidige referat fra Viking–Strømsgodset i 2016 skriver at «hans heading ble reddet til corner av Austbø» etter 17 minutter. Det dokumenterer én velrettet heading fra SIF-perioden, ikke antall mål eller generell stopperstatus.",
    "source": "https://www.dagsavisen.no/sport/keita-ga-stromsgodset-tre-poeng/5800306",
    "sourceKind": "press"
  },
  {
    "playerId": "paal_christian_alsaker",
    "clubId": "stromsgodset",
    "strengths": [
      "final_pass"
    ],
    "claim": "Aftenbladets/NTBs kampreferat fra Notodden–Hødd i 2012 skriver at «Paal Christian Alsaker fant Andreas Granerud på sekstenmeteren», før Granerud fintet og skjøt i mål. Den konkrete sistepasningen belegger final_pass fra en senere Notodden-periode; dette er ikke en dokumentert Godset-kamp.",
    "source": "https://www.aftenbladet.no/sport/i/4d6EWq/hoedd-reddet-av-selvmaal",
    "sourceKind": "press"
  },

  // Strømsgodset 2026-10-18: konkret kildepass (kamphandlinger, også karriereperioder utenfor Godset).
  {
    "playerId": "mattias_andersson",
    "clubId": "stromsgodset",
    "strengths": [
      "finishing",
      "crossing"
    ],
    "claim": "Aftenbladets samtidige Strømsgodset–Odd-referat fra 9. april 2007 beskriver at Mattias Andersson alene med keeper «gjorde ... ingen feil» og få minutter senere slo «et presist innlegg» som Peter Kovacs headet i mål. To navngitte situasjoner fra Godset-perioden dokumenterer avslutning og innlegg, ikke et tall fra målstatistikken.",
    "source": "https://www.aftenbladet.no/sport/i/8mlJjw/godset-tilbake-med-seier",
    "sourceKind": "press"
  },
  {
    "playerId": "steffen_nystrom",
    "clubId": "stromsgodset",
    "strengths": [
      "dribbling"
    ],
    "claim": "Dagbladets Strømsgodset–Tromsø-referat fra 2008 omtaler venstrekanten Steffen Nystrøm som den som «kjørte gang på gang karusell» med Tromsø-back Roger Risholt, og skildrer flere individuelle forseringer. Kun den konkret beskrevne driblingsevnen er registrert.",
    "source": "https://www.dagbladet.no/sport/vinner-vi-neste-kan-alt-skje/66521805",
    "sourceKind": "press"
  },
  {
    "playerId": "krister_aunan",
    "clubId": "stromsgodset",
    "strengths": [
      "crossing"
    ],
    "claim": "Drammens Tidendes samtidige 2010-kampreferat beskriver at Krister Aunans «lave innlegg fra høyre» skapte Strømsgodsets seiersmål mot Viking. Scoringen ble formelt registrert som selvmål, så bare det navngitte innlegget gir ferdighetstoken.",
    "source": "https://www.dt.no/godset/godset/drommescoring-satte-fyr-pa-godset/s/2-2.1748-1.5073388",
    "sourceKind": "press"
  },
  {
    "playerId": "marius_amundsen",
    "clubId": "stromsgodset",
    "strengths": [
      "heading"
    ],
    "claim": "Lillestrøms offisielle kampreferat fra 3. oktober 2020 beskriver at Marius Amundsen «møtte innlegget på bakre stolpe og headet til Aleksander Melgalvis», som satte ballen i mål. Det belegger hodespill fra en senere LSK-periode, ikke en antatt Godset-kamp.",
    "source": "https://www.lsk.no/nyheter/lekestue-og-4-1-seier-over-stjordals-blink",
    "sourceKind": "club"
  },
  {
    "playerId": "glenn_arne_hansen",
    "clubId": "stromsgodset",
    "strengths": [
      "shot_stopping"
    ],
    "claim": "Et øyenvitnes referat fra cupfinalen Follo–Strømsgodset 2010 sier eksplisitt at «Follokeeper Glenn Arne Hansen» hadde «et par gigantredninger på en-mot-en-situasjoner». Konkrete skuddredninger dokumenteres i en senere Follo-periode; dette er ingen utledet keeperrating.",
    "source": "https://materazzia.blogspot.com/2010/11/",
    "sourceKind": "football_editorial"
  },
  {
    "playerId": "thomas_andre_odegaard",
    "clubId": "stromsgodset",
    "strengths": [
      "shot_stopping"
    ],
    "claim": "Aftenpostens kampreferat fra Bryne–Strømsgodset 12. juli 2006 gjengir Bjørn Ingvar Kydlands beskrivelse av et skudd fra bakre stolpe: «målvakten gjorde en god redning». Navngitt kampoppstilling bekrefter Thomas André Ødegaard i SIF-målet; én konkret skuddredning er kilden, ikke en generell posisjonsmal.",
    "source": "https://www.aftenposten.no/sport/fotball/i/RR6P88/bryne-videre-i-cupen",
    "sourceKind": "press"
  },
  {
    "playerId": "jason_morrison",
    "clubId": "stromsgodset",
    "strengths": [
      "finishing"
    ],
    "claim": "Dagbladets referat fra cupsemifinalen 2010 oppgir at Jason Morrison «pirket ballen forbi Andreas Lie» etter 100 minutter og ga Strømsgodset ledelsen mot Odd. Den konkrete avslutningen dokumenterer finishing i Godset-perioden; det gir ingen numerisk spillerverdi.",
    "source": "https://www.dagbladet.no/sport/deila-sammenligner-semi-seieren-med-vil-du-bli-millionaer/64654478",
    "sourceKind": "press"
  },

  // Strømsgodset: fjerde kildepass 2026-10-18; konkrete individuelle ferdigheter.
  {
    "playerId": "arild_mathisen",
    "clubId": "stromsgodset",
    "strengths": [
      "final_pass"
    ],
    "claim": "Historisk cupfinalereferat fra 1970 gir en konkret målgivende situasjon: «På pasninger fra Arild Mathisen og Bjørn Oddmar Andersen scoret Ingar Pettersen to ganger». Mathisens pasning inngår i en direkte navngitt målsituasjon. Kun sistepasning føres, ikke en generell pasningsrating.",
    "source": "https://baof.wordpress.com/2018/11/25/bla-armes-cupfinalespesial/",
    "sourceKind": "football_editorial"
  },
  {
    "playerId": "juro_kuvicek",
    "clubId": "stromsgodset",
    "strengths": [
      "long_shots"
    ],
    "claim": "Vålerengas 1997-cuphistorie beskriver Juro Kuviceks volleyscoring: «rundt 25 meters hold. Lot ballen sprette en gang og klinte til med venstrebeinet på volley og pang i nettet». Dette dokumenterer distanseskudd i senere Vålerenga-periode, ikke en separat Strømsgodset-kamp.",
    "source": "https://jarlesvifstatistikk.bravesites.com/historikk",
    "sourceKind": "football_editorial"
  },
  {
    "playerId": "prosper_mendy",
    "clubId": "stromsgodset",
    "strengths": [
      "heading"
    ],
    "claim": "Godsets referat fra hjemmekampen mot Odd i 2019 beskriver Prosper Mendy som fikk et hjørnespark ved første stolpe og «stanget inn utligningen». Et direkte og vellykket hodespill fra SIF-perioden; ingen andre ferdigheter utledes.",
    "source": "https://www.godset.no/nyheter/odd-seiret-pa-marienlyst",
    "sourceKind": "club"
  },
  {
    "playerId": "enock_kwakwa",
    "clubId": "stromsgodset",
    "strengths": [
      "long_shots"
    ],
    "claim": "Enock Kwakwas karriereomtale beskriver Strømsgodsets reservelag i 2012: «impressed, in particular with a great goal from 40 meters». Dette er et konkret langskudd fra andrelaget, ikke en ferdighetsvurdering fra hans korte førstelagsdebut.",
    "source": "https://en.wikipedia.org/wiki/Enock_Kwakwa",
    "sourceKind": "encyclopedia"
  },

  // Strømsgodset 2026-10-18: etterpass med bekreftede individuelle kilder.
  {
    "playerId": "egil_olsen",
    "clubId": "stromsgodset",
    "strengths": [
      "work_rate"
    ],
    "claim": "Strømsgodsets jubileumshistorie om 1970-laget sier at «ingen løp flere meter for Strømsgodset enn elegante og tekniske Egil Olsen». Dette belegger dokumentert individuell løps-/arbeidsinnsats, ikke ukildet dribling eller utholdenhetstall.",
    "source": "https://www.godset.no/nyheter/50-ar-siden-seriegullet",
    "sourceKind": "club"
  },
  {
    "playerId": "jan_kristiansen",
    "clubId": "stromsgodset",
    "strengths": [
      "duels"
    ],
    "claim": "Klubbens 1970-tilbakeblikk omtaler Jan Kristiansen som «en klippe i midtforsvaret» og «Tøff i duellene». Duellstyrken er en konkret individuell ferdighetsbeskrivelse, ikke utledet fra stopperposisjon.",
    "source": "https://www.godset.no/nyheter/50-ar-siden-seriegullet",
    "sourceKind": "club"
  },
  {
    "playerId": "alexander_aas",
    "clubId": "stromsgodset",
    "strengths": [
      "duels",
      "simple_passing"
    ],
    "claim": "Lars Tjærnås' spilleranalyse i Bergens Tidende beskriver Alexander Aas slik: «God igangsetter, trygg med ball, stadig bedre i duellspillet». Det bærer duellspill og enkel igangsettende pasningskvalitet; Aas' dødballtrussel alene er ikke bevis for dødballtaking.",
    "source": "https://www.bt.no/sport/i/4qq6Je/her-er-laquoaarets-lagraquo-i-eliteserien-saa-langt",
    "sourceKind": "press"
  },
  {
    "playerId": "francisco_junior",
    "clubId": "stromsgodset",
    "strengths": [
      "vision"
    ],
    "claim": "Bergens Tidendes vurdering av Godsets lag fra 2017 omtaler spesifikt Francisco Junior med «sin selvfølgelige teknikk og lure pasninger». Kreativt pasningsblikk gir belegg for vision; ingen påstått langpasningsrekkevidde eller tallrating.",
    "source": "https://www.bt.no/sport/i/vQOe25/oppturen-som-er-umulig-aa-forklare",
    "sourceKind": "press"
  },

  // Strømsgodset: 2026-10-18 etterpass med 9 kontrollerte ferdighetsbeskrivelser.
  {
    "playerId": "arne_erlandsen",
    "clubId": "stromsgodset",
    "strengths": [
      "set_pieces"
    ],
    "claim": "I historikken fra Strømsgodsets privatkamp mot Manchester United 29. juli 1991 heter det at «Arne ERLANDSEN scoret på et frispark fra kanten av 16-meteren» og at ballen gikk i motsatt hjørne. Konkret dødballtreff, ikke generell teknikkrating.",
    "source": "https://www.united.no/pa-denne-dag/579825",
    "sourceKind": "football_editorial"
  },
  {
    "playerId": "bent_sormo",
    "clubId": "stromsgodset",
    "strengths": [
      "ball_carrying",
      "chance_creation"
    ],
    "claim": "Kristiansund BKs kampreferat mot Viking i 2020 beskriver at «Bent Sørmo på et fabelaktig raid fra midtlinja» kom til 16-meteren og la ut til Pellegrino som scoret. Ballføring og konkret sjanseskaping dokumenteres fra KBK-perioden, ikke særskilt fra Godset.",
    "source": "https://www.kristiansundbk.no/nyheter/tap-mot-viking-i-malbonanza",
    "sourceKind": "club"
  },
  {
    "playerId": "ousman_nyan",
    "clubId": "stromsgodset",
    "strengths": [
      "finishing"
    ],
    "claim": "Dagbladet beskriver Strømsgodsets bortekamp mot Sandefjord 17. juni 2007: Ousman Nyan observerte keeperens plassering og avsluttet med en «følsom «chipp» i lengste kryss». Dette er individuelt kampbelegg for presis avslutning.",
    "source": "https://www.dagbladet.no/sport/nyans-kunstverk-avgjorde-sekspoengs-krigen/66351317",
    "sourceKind": "press"
  },
  {
    "playerId": "razak_nuhu",
    "clubId": "stromsgodset",
    "strengths": [
      "crossing"
    ],
    "claim": "Aftenpostens samtidige Rosenborg–Godset-referat fra 2012 beskriver «herlig innlegg fra Nuhu» som ga Ola Kamara scoring. Dette er ett vellykket individuelt innlegg i Strømsgodset-perioden, ikke en antatt backferdighet.",
    "source": "https://www.aftenposten.no/sport/fotball/i/MR61mo/gulldroemmen-over-for-rosenborg",
    "sourceKind": "press"
  },
  {
    "playerId": "lars_stubhaug",
    "clubId": "stromsgodset",
    "strengths": [
      "shot_stopping"
    ],
    "claim": "Bergens Tidendes kampreferat fra Godset–Lillestrøm 7. november 2010 beskriver «en flott redning av reservekeeper Lars Stubhaug» på Anthony Ujahs store overtidssjanse. Konkret kampredning fra Godset-perioden.",
    "source": "https://www.bt.no/sport/i/705oOw/godset-vant-cupfinale-vorspielet",
    "sourceKind": "press"
  },
  {
    "playerId": "niklas_gunnarsson",
    "clubId": "stromsgodset",
    "strengths": [
      "heading"
    ],
    "claim": "Strømsgodsets offisielle referat mot Brann 29. juli 2020 beskriver Niklas Gunnarsson på streken: «midtstopperen headet ballen unna» og hindret scoring. Et dokumentert defensivt hodestøt, ikke et målbasert token.",
    "source": "https://www.godset.no/nyheter/senket-brann-pa-marienlyst",
    "sourceKind": "club"
  },
  {
    "playerId": "komlan_amewou",
    "clubId": "stromsgodset",
    "strengths": [
      "dribbling"
    ],
    "claim": "Dagbladets samtidige referat fra Godset–Molde i 2008 beskriver at «Komlan Amewou lurte en Moldenser opp på tribunen» før et chipforsøk. Kun driblingsbevegelsen registreres; det mislykkede skuddet gir ikke avslutningsstyrke.",
    "source": "https://www.dagbladet.no/sport/en-dag-da-ingenting-fungerte/66503332",
    "sourceKind": "press"
  },
  {
    "playerId": "david_nielsen",
    "clubId": "stromsgodset",
    "strengths": [
      "heading"
    ],
    "claim": "Aftenpostens treningskampreferat fra Brann–Godset i februar 2009: «etter bare seks minutter headet han inn 1-0», om David Nielsen. Kilden dokumenterer hodespill i Brann-perioden etter spillertiden i Godset.",
    "source": "https://www.aftenposten.no/sport/fotball/i/MR5p9K/nielsen-festen-ble-spolert",
    "sourceKind": "press"
  },
  {
    "playerId": "gardar_johannsson",
    "clubId": "stromsgodset",
    "strengths": [
      "finishing"
    ],
    "claim": "UEFAs rapport om den islandske cupfinalen i 2012 beskriver «Gardar Jóhannsson's powerful finish» som ga Stjarnan ledelsen. En navngitt kraftfull avslutning i Stjarnan-perioden etter Strømsgodset, uten utledet Godset-spesifikk form.",
    "source": "https://www.uefa.com/news-media/news/0200-0f88146a645d-c26e213090c7-1000--kr-secure-13th-icelandic-cup-crown/",
    "sourceKind": "football_editorial"
  },

  // Strømsgodset: samlet kildepass 2026-10-18, individuelle beskrivelser fra klubbhistorie og kampreferater.
  {
    "playerId": "odd_arild_amundsen",
    "clubId": "stromsgodset",
    "strengths": [
      "long_shots",
      "vision",
      "passing_range"
    ],
    "claim": "Klubbens 50-årsartikkel om seriegullet beskriver Odd Arild Amundsen med «tunge skudd, geniale overblikk og sterke pasningsfot». Individuell omtale av skudd fra distanse, overblikk og pasningsfot i Godset-perioden; mål og meritter gir ingen flere token.",
    "source": "https://www.godset.no/nyheter/50-ar-siden-seriegullet",
    "sourceKind": "club"
  },
  {
    "playerId": "ingar_pettersen",
    "clubId": "stromsgodset",
    "strengths": [
      "heading"
    ],
    "claim": "Strømsgodsets tilbakeblikk på 1970-laget beskriver Ingar Pettersens «store styrke i lufta». Dette er en eksplisitt individuell hodespillbeskrivelse og ikke en avledning fra målantall.",
    "source": "https://www.godset.no/nyheter/50-ar-siden-seriegullet",
    "sourceKind": "club"
  },
  {
    "playerId": "per_rune_wolner",
    "clubId": "stromsgodset",
    "strengths": [
      "tackling"
    ],
    "claim": "Strømsgodsets offisielle 50-årsartikkel sier «Per Runes sklitaklinger fortsatt prates om på Gulskogen». Bare taklinger registreres fra den individuelt beskrevne ferdigheten.",
    "source": "https://www.godset.no/nyheter/50-ar-siden-seriegullet",
    "sourceKind": "club"
  },
  {
    "playerId": "mohammed_abu",
    "clubId": "stromsgodset",
    "strengths": [
      "ball_carrying",
      "vision",
      "chance_creation"
    ],
    "claim": "Fotballekspert Lars Tjærnås beskriver Mohammed Abu i 2011 som «en liten artist med ball» med «oversikt og ballfølelse» som «bryter ned et forsvar med kreative løsninger». Dokumenterer ballføring under press, overblikk og sjanseskaping, ikke målantall.",
    "source": "https://www.aftenposten.no/sport/meninger/i/4qbLmg/ingen-fra-molde-eller-rbk-gode-nok-for-tjaernaas",
    "sourceKind": "press"
  },
  {
    "playerId": "henning_hauger",
    "clubId": "stromsgodset",
    "strengths": [
      "simple_passing",
      "work_rate",
      "teamwork",
      "leadership"
    ],
    "claim": "Sportssjef Jostein Flo beskrev Hauger ved 2017-signering som «dyktig ballfordeler», med «stor arbeidskapasitet» som «flink til å spille andre gode» og med «lederegenskaper». Dette bærer pasningsspill, arbeidsinnsats, samspill og ledelse; egenskapene beskriver ham ved overgangstidspunktet.",
    "source": "https://www.godset.no/nyheter/hauger-valgte-godset",
    "sourceKind": "club"
  },
  {
    "playerId": "jonathan_parr",
    "clubId": "stromsgodset",
    "strengths": [
      "pace"
    ],
    "claim": "I Dagbladets 2011-kampomtale forteller Parr selv «jeg er ganske hurtig jeg også» og reporter beskriver at han «spurtet fra Ji-Sung Park». Den individuelle fartsvurderingen gjelder Crystal Palace-perioden før Strømsgodset.",
    "source": "https://www.dagbladet.no/sport/hvorfor-skyter-du-derfra/63437672",
    "sourceKind": "press"
  },
  {
    "playerId": "stian_ringstad",
    "clubId": "stromsgodset",
    "strengths": [
      "dribbling",
      "crossing"
    ],
    "claim": "Godsets 2019-referat mot Tromsø beskriver hvordan Ringstad «forserte rett gjennom Tromsøs forsvar» før han fra dødlinja «la han ballen 45 grader ut mot Martin Rønning Ovenstad» til scoring. Dokumenterer ballføring/dribling og sluttprodukt fra kanten.",
    "source": "https://www.godset.no/nyheter/kjempet-seg-til-seier-pa-marienlyst",
    "sourceKind": "club"
  },
  {
    "playerId": "simen_brenne",
    "clubId": "stromsgodset",
    "strengths": [
      "heading"
    ],
    "claim": "Dagbladets samtidige referat fra Sarpsborg–Strømsgodset 2013 beskriver «Simen Brenne satte hodet på et innlegg fra Martin Rønning Ovenstad» og scoret. Kun heading, ikke avslutningsrating fra antall mål.",
    "source": "https://www.dagbladet.no/sport/godset-vant-endelig-pa-bortebane-i-tippeligaen-igjen/62716306",
    "sourceKind": "press"
  },
  {
    "playerId": "abdisalam_ibrahim",
    "clubId": "stromsgodset",
    "strengths": [
      "dribbling"
    ],
    "claim": "BTs referat fra Strømsgodset–Brann i mai 2013 sier «Abdisalam Ibrahim lekte seg gjennom Brann-forsvaret» før en avslutning utenfor. Hendelsen dokumenterer individuell dribling, men ikke avslutningsstyrke.",
    "source": "https://www.bt.no/sport/i/xP3vbn/klasseforskjell-da-godset-senket-brann",
    "sourceKind": "press"
  },
  {
    "playerId": "martin_hansen",
    "clubId": "stromsgodset",
    "strengths": [
      "shot_stopping"
    ],
    "claim": "Godsets 2019-kampreferat fra Mjøndalen beskriver «Martin Hansen gjorde dog en kjempredning» og viser også til en tidligere «god redning» fra Fredrik Brustad. To navngitte skuddredninger i Godset-perioden.",
    "source": "https://www.godset.no/nyheter/uavgjort-i-aelv-classico",
    "sourceKind": "club"
  },
  {
    "playerId": "duplexe_tchamba",
    "clubId": "stromsgodset",
    "strengths": [
      "tackling"
    ],
    "claim": "Godsets 2019-kampreferat mot Lillestrøm beskriver at Daniel Gustafsson kom forbi keeper, men «ikke Duplexe Tchamba», og at «Duplexe sin takling» hindret angrepet. Bare den konkrete taklingsegenskapen føres, ikke generell duellstyrke.",
    "source": "https://www.godset.no/nyheter/uavgjort-mot-lillestrom",
    "sourceKind": "club"
  },
  {
    "playerId": "joel_riddez",
    "clubId": "stromsgodset",
    "strengths": [
      "crossing"
    ],
    "claim": "Godsets historiske tilbakeblikk på Rosenborg-kamper omtaler «et glimrende innlegg fra Joel Riddez» som Ola Kamara scoret på i 2010. Navngitt, vellykket innlegg gir crossing, ikke ukildet generell teknikk.",
    "source": "https://www.godset.no/nyheter/kampene-vi-husker-sa-godt",
    "sourceKind": "club"
  },
  {
    "playerId": "amahl_pellegrino",
    "clubId": "stromsgodset",
    "strengths": [
      "finishing"
    ],
    "claim": "Godsets referat fra treningskamp mot HamKam i februar 2019 beskriver at Vilsvik slo et utsøkt innlegg og «Pelle var kontant foran kassa». Konkret kontant avslutning i Godset-perioden, ikke målstatistikk.",
    "source": "https://www.godset.no/nyheter/praktscoring-fra-hasan-mot-ham-kam",
    "sourceKind": "club"
  },
  {
    "playerId": "marco_tagbajumi",
    "clubId": "stromsgodset",
    "strengths": [
      "finishing"
    ],
    "claim": "Godsets seriepremiere mot Haugesund i april 2017 beskriver Marco Tagbajumi som «banket ballen flott i det lengste hjørnet på hel volley» etter Høilands framspill. Én teknisk konkret avslutning gir finishing, uten antatt generell fysisk styrke.",
    "source": "https://www.godset.no/nyheter/snudde-til-seier-i-premieren",
    "sourceKind": "club"
  },
  {
    "playerId": "glenn_andersen",
    "clubId": "stromsgodset",
    "strengths": [
      "heading"
    ],
    "claim": "Aftenbladets samtidige kampreferat fra Godset–Viking i september 2011 forteller at «Glenn Andersen headet inn 2-2» etter corner. Ytterligere beskriver Aftenbladet 2011 en heading i tverrliggeren. Konkret individuelt hodespill.",
    "source": "https://www.aftenbladet.no/sport/i/xR19el/dommeren-tok-fra-oss-seieren",
    "sourceKind": "press"
  },
  {
    "playerId": "thomas_sorum",
    "clubId": "stromsgodset",
    "strengths": [
      "heading"
    ],
    "claim": "Dagbladets kampreferat fra Haugesund–Tromsø 2010 beskriver Thomas Sørum som «strekte ... seg høyest på et innlegg og headet ballen i krysset og ut». Kilden gjelder Haugesund-perioden, mellom opphold i Godset; kun konkret hodespill.",
    "source": "https://www.dagbladet.no/sport/haper-jeg-far-sove-i-natt/64611217",
    "sourceKind": "press"
  },

  // Molde: 2026-10-18 – kildepass av de 23 siste; kun dokumenterte individuelle ferdigheter.
  {
    "playerId": "mattias_mostrom",
    "clubId": "molde",
    "strengths": [
      "pace",
      "work_rate",
      "chance_creation"
    ],
    "claim": "Moldes avskjedsartikkel omtaler Mattias Moström som «den svenske lynvingen» og fremhever uttrykkelig «hurtighet, arbeidskapasitet og evne til å skape mål». Tre navngitte, individuelle ferdighetsbeskrivelser; 17 sesonger alene brukes ikke som belegg.",
    "source": "https://www.moldefk.no/nyheter/mattias-mostrom-takkes-av-etter-17-ar-i-mfk",
    "sourceKind": "club"
  },
  {
    "playerId": "ethan_horvath",
    "clubId": "molde",
    "strengths": [
      "shot_stopping"
    ],
    "claim": "RTÉs samtidige kampreferat fra Celtic–Molde i 2015 beskriver Horvaths redning på et hardt skudd som «pulled off a brilliant save», og en annen situasjon der han vippet et skudd over mål. Dokumenterer skuddredninger i Molde-perioden; ingen generell tallrating.",
    "source": "https://www.rte.ie/sport/soccer/2015/1105/739891-celtic-molde/",
    "sourceKind": "press"
  },
  {
    "playerId": "toni_kallio",
    "clubId": "molde",
    "strengths": [
      "heading"
    ],
    "claim": "Aftenbladets kampreferat fra Moldes møte med Skonto i 2006 beskriver Toni Kallio som var nær ved å score med «heading i stolpen». En eksplisitt hodespillhendelse, ikke en posisjonsavledet styrke.",
    "source": "https://www.aftenbladet.no/sport/i/VblMxV/svakt-av-molde",
    "sourceKind": "press"
  },
  {
    "playerId": "matej_mavric",
    "clubId": "molde",
    "strengths": [
      "heading"
    ],
    "claim": "UEFAs kampreferat fra 2006 beskriver at «Matej Mavrič» headet en corner i mål i første omgang mot Skonto Riga. Kun hodespill registreres fra den navngitte avslutningen.",
    "source": "https://www.uefa.com/uefaeuropaleague/news/01b8-0e6da08d0a27-74e958a69305-1000--newcastle-held-but-still-progress/",
    "sourceKind": "football_editorial"
  },
  {
    "playerId": "odd_berg",
    "clubId": "molde",
    "strengths": [
      "crossing",
      "heading"
    ],
    "claim": "Moldes 1971-arkiv beskriver «et innlegg fra Odd Berg» til Jon Risas scoring og senere «en nydelig heading av Odd Berg». Innlegg og hodespill har hvert sitt konkrete, navngitte kampbelegg.",
    "source": "https://www.moldefk.no/om-klubben/var-historie/1970-1979/1971",
    "sourceKind": "club"
  },
  {
    "playerId": "morten_bakke",
    "clubId": "molde",
    "strengths": [
      "shot_stopping"
    ],
    "claim": "Moldes offisielle 1993-historikk skriver at «Morten Bakke hadde som vanlig en rekke glimrende redninger» og omtaler ham som «fantastisk i mål». Dokumenterer skuddredninger, ikke bare at han var målvakt.",
    "source": "https://www.moldefk.no/om-klubben/var-historie/1990-1999/1993",
    "sourceKind": "club"
  },
  {
    "playerId": "jarkko_wiss",
    "clubId": "molde",
    "strengths": [
      "tackling",
      "long_shots"
    ],
    "claim": "Den individuelle spillerbiografien om Jarkko Wiss beskriver ham som «known for his powerful shots with both feet and as a hard tackler». Kilden dokumenterer harde taklinger og kraftfulle skudd; beskrivelsen er karrieregenerell, ikke særskilt fra Molde-perioden.",
    "source": "https://en.wikipedia.org/wiki/Jarkko_Wiss",
    "sourceKind": "encyclopedia"
  },
  {
    "playerId": "inge_bratteteig",
    "clubId": "molde",
    "strengths": [
      "shot_stopping",
      "reflexes"
    ],
    "claim": "Moldes offisielle 1985-arkiv gjengir beskrivelsen av keeper Inge Bratteteig med «lynsnare redninger og freidige utrusninger». Den uttrykkelige reaksjonshurtigheten og redningene begrunner refleks- og skuddredningstoken, ikke en tallverdi.",
    "source": "https://www.moldefk.no/om-klubben/var-historie/1980-1989/1985",
    "sourceKind": "club"
  },
  {
    "playerId": "petter_singsaas",
    "clubId": "molde",
    "strengths": [
      "heading"
    ],
    "claim": "Moldes 1999-arkiv omtaler Petter Singsaas' mål slik: «Petter gjorde 1-0 på en kjempeheading». Bare det individuelt beskrevne hodespillet registreres.",
    "source": "https://www.moldefk.no/om-klubben/var-historie/1990-1999/1999-host",
    "sourceKind": "club"
  },
  {
    "playerId": "arild_stavrum",
    "clubId": "molde",
    "strengths": [
      "crossing"
    ],
    "claim": "Moldes 1995-arkiv forteller at «Ole Bjørn Sundgot headet inn et innlegg fra Arild Stavrum». Det konkrete innlegget dokumenterer crossing; scoringstilfang eller rolle som angriper gir ingen ytterligere token.",
    "source": "https://www.moldefk.no/om-klubben/var-historie/1990-1999/1995-host",
    "sourceKind": "club"
  },
  {
    "playerId": "emmanuel_ekpo",
    "clubId": "molde",
    "strengths": [
      "dribbling"
    ],
    "claim": "Columbus Crews kampreferat beskriver at Emmanuel Ekpo «split two defenders» og deretter passerte enda en forsvarer før han kom til avslutning. En konkret driblingssekvens fra Columbus-perioden, før Molde; ingen ukildet Molde-spesifikk vurdering.",
    "source": "https://www.columbuscrew.com/news/recap-crew-vs-municipal-x3750",
    "sourceKind": "club"
  },
  {
    "playerId": "kare_elvsaas",
    "clubId": "molde",
    "strengths": [
      "heading"
    ],
    "claim": "Moldes 1960-historikk omtaler at «Kåre Elvsaas» scoret «på en heading etter corner fra Finn Haukebø» mot Aalesund. Navngitt hodespill, ikke antatt styrke fra spissrolle.",
    "source": "https://www.moldefk.no/om-klubben/var-historie/1960-1969/1960",
    "sourceKind": "club"
  },
  {
    "playerId": "jon_palmer_austnes",
    "clubId": "molde",
    "strengths": [
      "crossing",
      "dribbling"
    ],
    "claim": "Moldes 1965-arkiv beskriver et «fint innlegg fra Jon Palmer Austnes» og at han «gang på gang trillet han ball i hatt med Clausenengen-forsvarerne». Begge token bæres av individuelle kampbeskrivelser.",
    "source": "https://www.moldefk.no/om-klubben/var-historie/1960-1969/1965",
    "sourceKind": "club"
  },
  {
    "playerId": "ole_erik_stavrum",
    "clubId": "molde",
    "strengths": [
      "heading"
    ],
    "claim": "Moldes 1988-arkiv beskriver hvordan «Ole Erik Stavrum» headet i mål etter frispark og stusset videre med hodet i en annen målsituasjon. De navngitte hendelsene dokumenterer heading, ikke en generell scorer-rating.",
    "source": "https://www.moldefk.no/om-klubben/var-historie/1980-1989/1988",
    "sourceKind": "club"
  },
  {
    "playerId": "sindre_rekdal",
    "clubId": "molde",
    "strengths": [
      "heading"
    ],
    "claim": "Moldes offisielle 1992-arkiv beskriver at «Sindre Rekdal» headet inn 3–0 på et innlegg fra Bjørn Nilsen mot Brann. Det direkte belegget gjelder hodespill, uten videre generelle vurderinger.",
    "source": "https://www.moldefk.no/om-klubben/var-historie/1990-1999/1992",
    "sourceKind": "club"
  },

  // Molde: 27 individuelt kildebelagte spillere i samlet 2026-10-17 produksjonsrunde.
  {
    playerId: "bjorn_bergmann_sigur_arson",
    clubId: "molde",
    strengths: ["work_rate"],
    claim: "Kanari-Fansens historiske spillerbiografi beskriver Björn Bergmann Sigurðarson med «oppofrende spillestil og enorme arbeidsinnsats» i Lillestrøm-perioden, før Molde. Bare dokumentert arbeidsinnsats registreres.",
    source: "https://www.kfl.no/wiki/index.php?title=Bj%C3%B6rn_Bergmann_Sigur%C3%B0arson",
    sourceKind: "football_editorial"
  },
  {
    playerId: "arthur_albiston",
    clubId: "molde",
    strengths: ["tackling","positioning","pace","game_reading"],
    claim: "Historisk United-supporteranalyse av Arthur Albiston: «tackling, positional-sense, turn of pace, tenacity and the ability to read the play». Dokumenterer taklinger, posisjonering, fart og spilleforståelse fra Manchester United-perioden, før Molde.",
    source: "https://mufc1878web.wordpress.com/2022/06/30/top-three-lists-left-backs/",
    sourceKind: "football_editorial"
  },
  {
    playerId: "mame_biram_diouf",
    clubId: "molde",
    strengths: ["pace"],
    claim: "Samtidig Premier League-kampanalyse fra Stoke-perioden om Mame Biram Diouf: «showed early on the pace he had as he raced away from the City's defence». Dokumenterer individuell fart i senere karriere; mål og FIFA-ratings brukes ikke.",
    source: "https://flirtingwithfootball.wordpress.com/2014/09/01/barclays-premier-league-gameweek-3-review-3/",
    sourceKind: "football_editorial"
  },
  {
    playerId: "orjan_nyland",
    clubId: "molde",
    strengths: ["reflexes"],
    claim: "Dagsavisens analyse fra Norge–Serbia i 2022 omtaler spesifikt Ørjan Nyland som «en reaksjonssterk keeper». Kilden gjelder senere landslagsperiode, ikke en udokumentert særskilt Molde-kamp.",
    source: "https://www.dagsavisen.no/kommentar/drommestart-signert-haaland-nytt-niva-norge/5356854",
    sourceKind: "press"
  },
  {
    playerId: "joona_toivio",
    clubId: "molde",
    strengths: ["duels","set_pieces"],
    claim: "Nettavisens cupfinalevurdering 2014 beskriver Toivio som «som vanlig tøff og kontant i duellene». Moldes klubbhistorie om Stabæk-kampen i mai 2017 beskriver «perfekt frisparkscoring» av Toivio. Duellspill og dødballer har hvert sitt eksplisitte belegg.",
    source: "https://www.nettavisen.no/artikkel/slik-spilte-cupfinale-lagene/s/12-95-8512556",
    sourceKind: "press"
  },
  {
    playerId: "stian_gregersen",
    clubId: "molde",
    strengths: ["pace","duels"],
    claim: "TV-kommentator Morten Langli sitert av Sportsbibelen etter Molde-kamp: «Rask og duellsterk». Begge egenskapene tilskrives Gregersen individuelt; ingen tallverdi.",
    source: "https://sportsbibelen.no/imponert-over-eliteserie-spilleren-ikke-mange-norske-fotballspillere-som-er-bedre-defensivt/",
    sourceKind: "press"
  },
  {
    playerId: "etzaz_hussain",
    clubId: "molde",
    strengths: ["final_pass"],
    claim: "Nettavisens samtidige cupfinalevurdering 2014 av Etzaz Hussain: «noen fine pasninger som løste opp spillet». Dokumenterer konkrete spilleåpnende pasninger, ikke en generell teknikk- eller pasningsrating.",
    source: "https://www.nettavisen.no/artikkel/slik-spilte-cupfinale-lagene/s/12-95-8512556",
    sourceKind: "press"
  },
  {
    playerId: "ohi_omoijuanfo",
    clubId: "molde",
    strengths: ["heading","duels"],
    claim: "Moldes kampreferat fra Kristiansund 2021 beskriver Ohi Omoijuanfo: «Spissen raget høyest og vant duellen mot KBK-stopperne», fulgt av et godt hodestøt som krevde en stor redning. Konkret hode- og duellspill.",
    source: "https://www.moldefk.no/nyheter/tungt-tap-i-kristiansund",
    sourceKind: "club"
  },
  {
    playerId: "andreas_lund",
    clubId: "molde",
    strengths: ["heading"],
    claim: "Moldes offisielle 1998-arkiv: «Andreas Lund headet et perfekt innlegg fra Odd Inge Olsen i mål» mot Brann og hadde en heading reddet senere i omgangen. Direkte hodespillbelegg, ikke generelt antall mål.",
    source: "https://www.moldefk.no/om-klubben/var-historie/1990-1999/1998-var",
    sourceKind: "club"
  },
  {
    playerId: "tor_fuglset",
    clubId: "molde",
    strengths: ["heading"],
    claim: "Molde-arkivet etter Skarbøvik-kampen i 1968 sier eksplisitt om Tor Fuglset: «hans hodespill var imponerende». Direkte kvalitativ beskrivelse, ikke avledet fra spissposisjon.",
    source: "https://www.moldefk.no/om-klubben/var-historie/1960-1969/1968",
    sourceKind: "club"
  },
  {
    playerId: "jan_berg",
    clubId: "molde",
    strengths: ["dribbling"],
    claim: "Moldes 1984-arkiv beskriver Jan Berg som «driblet av dene ene etter den andre av mostpilleren»; i 1986 omtales det at han «kjørte ... karusell med Træffspillerne». Dokumenterer konkret dribling fra to historiske kamper.",
    source: "https://www.moldefk.no/om-klubben/var-historie/1980-1989/1984",
    sourceKind: "club"
  },
  {
    playerId: "thomas_mork",
    clubId: "molde",
    strengths: ["set_pieces","crossing"],
    claim: "Moldes 1999-arkiv om Skeid-kampen: Thomas Mork slo flere hjørnespark til scoringer, blant annet «et kvarter senere la Mork inn nok en corner, og Andreas Lund headet inn 2-0». Dokumenterer dødballleveranser og innlegg.",
    source: "https://www.moldefk.no/om-klubben/var-historie/1990-1999/1999-host",
    sourceKind: "club"
  },
  {
    playerId: "odd_inge_olsen",
    clubId: "molde",
    strengths: ["dribbling","set_pieces"],
    claim: "Moldes 1998-kampreferat omtaler «fine dribleraid ... av ... Odd Inge Olsen», og beskriver at han «skrudd ballen knallhardt på bakerste stolpe» på frispark. To individuelt beskrevne tekniske situasjoner.",
    source: "https://www.moldefk.no/om-klubben/var-historie/1990-1999/1998-var",
    sourceKind: "club"
  },
  {
    playerId: "clayton_zane",
    clubId: "molde",
    strengths: ["heading"],
    claim: "Molde-arkivets 2000-kampreferat mot Haugesund: «Clayton Zane stusset et innlegg fra Thomas Mork ned i beina på Anders Hasselgård». En konkret presis hodestuss som førte til mål; ikke målteft utledet fra statistikk.",
    source: "https://www.moldefk.no/om-klubben/var-historie/2000-2010/2000",
    sourceKind: "club"
  },
  {
    playerId: "jo_tessem",
    clubId: "molde",
    strengths: ["heading"],
    claim: "Molde-arkivets 1998-kamp mot Vålerenga beskriver at «Jo Tessem stupheadet inn 1-0» etter forarbeid på dødball. Konkret belegg for hodespill, ikke en rating basert på antall mål.",
    source: "https://www.moldefk.no/om-klubben/var-historie/1990-1999/1998-var",
    sourceKind: "club"
  },
  {
    playerId: "marel_baldvinsson",
    clubId: "molde",
    strengths: ["heading"],
    claim: "Molde-arkivets kamp mot Kongsvinger i september 2007: «Etter 54 minutter headet han inn 2-1 på et innlegg fra Thomas Mork», om Marel Baldvinsson. Hendelsen dokumenterer hodespill.",
    source: "https://www.moldefk.no/om-klubben/var-historie/2000-2010/2007-manedsvis/2007-september",
    sourceKind: "club"
  },
  {
    playerId: "magne_simonsen",
    clubId: "molde",
    strengths: ["crossing"],
    claim: "Molde-arkivets kampomtale fra juli 2012 beskriver at «Magne Simonsens innlegg etter 34 minutter gikk rett i mål». Dokumenterer et konkret farlig innlegg, ikke generell målscoringsevne.",
    source: "https://www.moldefk.no/om-klubben/var-historie/2011-2019/2012-manedsvis/2012-juli",
    sourceKind: "club"
  },
  {
    playerId: "trond_strande",
    clubId: "molde",
    strengths: ["passing_range"],
    claim: "Molde-arkivets cupreferat fra 2001 beskriver «Magne Hoseth på en lang gjennombruddpasning fra Trond Strande». Denne presise, lange pasningen gir konkret belegg for pasningsrekkevidde, ikke en modellert vurdering fra forsvarsposisjon.",
    source: "https://www.moldefk.no/om-klubben/var-historie/2000-2010/2001",
    sourceKind: "club"
  },
  {
    playerId: "per_egil_flo",
    clubId: "molde",
    strengths: ["set_pieces"],
    claim: "Samtidig Aftenbladet-kampreferat mot Mjøndalen i 2014 beskriver Per Egil Flo som «slo et presist innoverskrudd frispark», som Chima Chukwu headet i mål. Dødballteknikk dokumenteres fra konkret kamp.",
    source: "https://www.aftenbladet.no/sport/i/Jo1m0P/molde-enkelt-videre-i-cupen",
    sourceKind: "press"
  },
  {
    playerId: "stein_olav_hestad",
    clubId: "molde",
    strengths: ["set_pieces"],
    claim: "Molde-arkivet fra 1984 beskriver «Stein Olav Hestad [som] skrudde et frispark inn i feltet», der Åge Hareide scoret etterpå. Dokumenterer gjennomført dødballleveranse uten å gi tallrating.",
    source: "https://www.moldefk.no/om-klubben/var-historie/1980-1989/1984",
    sourceKind: "club"
  },
  {
    playerId: "daniel_chima_chukwu",
    clubId: "molde",
    strengths: ["heading"],
    claim: "Aftenbladets samtidige cupreferat fra Mjøndalen i 2014: «Chima Chukwu kontant satte [frisparket] i høyre hjørne med pannebrasken». Dokumenterer avsluttende hodestøt i én konkret kamp.",
    source: "https://www.aftenbladet.no/sport/i/Jo1m0P/molde-enkelt-videre-i-cupen",
    sourceKind: "press"
  },
  {
    playerId: "ulrich_moller",
    clubId: "molde",
    strengths: ["set_pieces"],
    claim: "Molde-arkivet i 1984 beskriver Ulrich Møller som avsender av et frispark inn i feltet: «Ulrich Møller et frispark inn i feltet», videreformidlet av Knut Nesbø til Jan Bergs scoring. Kun konkret dødballleveranse registreres.",
    source: "https://www.moldefk.no/om-klubben/var-historie/1980-1989/1984",
    sourceKind: "club"
  },
  {
    playerId: "ole_bjorn_sundgot",
    clubId: "molde",
    strengths: ["heading"],
    claim: "Molde-arkivet fra 1995 beskriver «Ole Bjørn Sundgot headet inn et innlegg fra Arild Stavrum» mot HamKam; 1996-arkivet beskriver senere heading i krysset. To dokumenterte hodespillhendelser.",
    source: "https://www.moldefk.no/om-klubben/var-historie/1990-1999/1995-host",
    sourceKind: "club"
  },
  {
    playerId: "knut_anders_fostervold",
    clubId: "molde",
    strengths: ["crossing"],
    claim: "Molde-arkivet fra 1995 beskriver «Ole Gunnar headet inn nr.4 på et presist innlegg fra Knut Anders Fostervold» mot Brann. En konkret presis innleggsleveranse fra spilleren.",
    source: "https://www.moldefk.no/om-klubben/var-historie/1990-1999/1995-var",
    sourceKind: "club"
  },
  {
    playerId: "oystein_neerland",
    clubId: "molde",
    strengths: ["heading"],
    claim: "Molde-arkivet fra 1991: «Etter fire minutters spill i andre omgang headet Øystein Neerland inn en corner fra Bjørn Nilsen». Dokumentert hodestøt på corner, ikke antatt styrke fra posisjon.",
    source: "https://www.moldefk.no/om-klubben/var-historie/1990-1999/1991",
    sourceKind: "club"
  },
  {
    playerId: "eddie_gustafsson",
    clubId: "molde",
    strengths: ["shot_stopping"],
    claim: "Molde-arkivet fra mai 2002 gjengir VGs vurdering av keeper Eddie Gustafsson med «to geniale redninger». Direkte kampbelegg for skuddredninger, uten modellert reaksjonsrating.",
    source: "https://www.moldefk.no/om-klubben/var-historie/2000-2010/2002-manedsvis/2002-mai",
    sourceKind: "club"
  },
  {
    playerId: "einar_sekkeseter",
    clubId: "molde",
    strengths: ["marking"],
    claim: "Molde-arkivet om seriepremieren mot Aalesund i 1971 sier «Einar Sekkeseter nøytraliserte farlige Kallen Johannesen». Konkret vellykket personlig oppfølging i kamp; registreres som marking, ikke generell duellfysikk.",
    source: "https://www.moldefk.no/om-klubben/var-historie/1970-1979/1971",
    sourceKind: "club"
  },

  // Molde 2026-10-17: individuelt kildebelagte styrker etter katalogpass for 58 tilknytninger.
  {
    playerId: "mohamed_elyounoussi",
    clubId: "molde",
    strengths: ["dribbling","one_vs_one","composure","finishing"],
    claim: "FourFourTwo beskriver Mohamed Elyounoussi: «Able to skip past opponents with ease, he thrives in one-on-one situations» og «his composure makes him a clinical finisher». Direkte belegg for dribling, utfordringer én mot én, ro og avslutninger; ikke basert på FIFA/FC-rating.",
    source: "https://www.fourfourtwo.com/features/mohamed-elyounoussi-pizza-loving-forward-leicester-are-eyeing-mahrezs-replacement",
    sourceKind: "football_editorial"
  },
  {
    playerId: "ola_brynhildsen",
    clubId: "molde",
    strengths: ["pace","finishing","chance_creation"],
    claim: "Molde-trener Erling Moe ved signering i 2020 beskriver Brynhildsen som «målscorer, sjanseskaper og hurtig». Tre eksplisitte ferdighetsbeskrivelser; kilden gjelder forventet spillestil ved overgang fra Stabæk, ikke en bestemt kamp.",
    source: "https://www.moldefk.no/nyheter/ola-brynhildsen-klar-for-molde-fk-fra-1.juli",
    sourceKind: "club"
  },
  {
    playerId: "david_datro_fofana",
    clubId: "molde",
    strengths: ["pace","strength","hold_up_play"],
    claim: "Chelsea ved overgangen fra Molde i 2023: «combination of pace, skill and strength» og «especially adept at holding up the ball and retaining possession under pressure». Bare fart, fysikk og feilvendt ballholding føres; ingen antatt avslutningsrating fra scoringstall.",
    source: "https://www.chelseafc.com/en/news/article/david-datro-fofana-completes-move-to-chelsea",
    sourceKind: "club"
  },
  {
    playerId: "knut_olav_rindaroy",
    clubId: "molde",
    strengths: ["pace"],
    claim: "Leo Beenhakker sitert i Moldes offisielle historikk i oktober 2009: «Han er hurtig og åpenbart ballsikker». Hurtighet registreres. «Ballsikker» uten teknisk spesifikasjon gir ikke et påfunnet pasningstoken.",
    source: "https://www.moldefk.no/om-klubben/var-historie/2000-2010/2009-manedsvis/2009-oktober",
    sourceKind: "club"
  },
  {
    playerId: "pape_pate_diouf",
    clubId: "molde",
    strengths: ["pace","strength","finishing"],
    claim: "Molde-manager Ole Gunnar Solskjær om Diouf ved returen i 2012: «Med Pape får vi målteft og gjennombruddshissighet. Han er hurtig og sterk». Kildebelegg for avslutningsevne, fart og fysikk; ingen numerisk score utledes.",
    source: "https://www.aftenbladet.no/sport/i/bK3gll/solskjaer-diouf-har-en-raaskap-som-er-sjelden",
    sourceKind: "press"
  },
  {
    playerId: "martin_linnes",
    clubId: "molde",
    strengths: ["crossing"],
    claim: "Samtidig kampreferat fra Molde–Aalesund i 2015: «Linnes satte fart på høyresiden og slo et fantastisk innlegg inn foran mål». Dokumenterer et konkret godt innlegg til Elyounoussis avgjørende heading; hurtighet fra én løpssituasjon føres ikke.",
    source: "https://www.aftenbladet.no/sport/i/e8WQ3K/moi-kronet-droemmeuka-med-aa-bli-matchvinner",
    sourceKind: "press"
  },
  {
    playerId: "rob_friend",
    clubId: "molde",
    strengths: ["heading"],
    claim: "Aftenbladets samtidige kampreferat mot Rosenborg 17. september 2005 beskriver konkret Molde-spiller Rob Friend som «scoret med en fantastisk heading». Kun hodespill, ikke generell målteft fra målstatistikk.",
    source: "https://www.aftenbladet.no/sport/i/EW4nkl/spillerne-maa-gaa-i-seg-selv",
    sourceKind: "press"
  },
  {
    playerId: "baye_djiby_fall",
    clubId: "molde",
    strengths: ["heading"],
    claim: "Dagbladets kampreferat Vålerenga–Molde beskriver at Baye Djiby Fall «headet ballen tilbake mot første stolpe» og scoret. Dette dokumenterer ett presist hodestøt; det legges ikke inn øvrige udokumenterte ferdigheter.",
    source: "https://www.dagbladet.no/sport/malet-mitt-skulle-vaert-annullert/65068186",
    sourceKind: "press"
  },

  // FKH, Haugar og Djerv: historiske individuelt kildebelagte styrker 2026-10-17.
  {
    playerId: "henrik_kildentoft",
    clubId: "haugesund",
    strengths: ["aggression","bravery"],
    claim: "Brøndbys jubileumsbok «Vores klub! Fodbold i 1964–2004» beskriver Henrik Kildentoft som «Kompromisløs i defensiven, aggressiv, elegant og god med bolden». Det direkte belegg gjelder aggressiv og kompromissløs forsvarsspillestil fra Brøndby-perioden, før FKH. Ikke en påstand om spesifikk taklingsstyrke.",
    source: "https://www.yumpu.com/da/document/view/18526684/vores-klub-fodbold-i-1964-2004-brondbycom",
    sourceKind: "football_editorial"
  },
  {
    playerId: "milan_koji",
    clubId: "haugesund",
    strengths: ["heading","simple_passing"],
    claim: "Canadian National Soccer League History beskriver Kojić før overgangen til FKH: «Milan further developed his passing ability and skill in the air to become a dangerous two-way player.» Registrerer generelt pasningsspill og spill i luften, ikke heading utledet fra kroppshøyde eller målstatistikk.",
    source: "https://thecnsl.com/2026/03/17/milan-kojic/",
    sourceKind: "football_editorial"
  },
  {
    playerId: "dean_mooney",
    clubId: "haugesund",
    strengths: ["heading"],
    claim: "Vikings offisielle historie om cupfinalen i 1979 beskriver konkret at «Dean Mooney med discohåret headet ballen i vinkelen» for Haugar. Registrerer bare dokumentert hodespill fra en spesifikk situasjon, ikke generell avslutningsrating.",
    source: "https://www.vikingfotball.no/nyheter/da-viking-tok-gull-gull-og-gull",
    sourceKind: "club"
  },
  {
    playerId: "juska_savolainen",
    clubId: "haugesund",
    strengths: ["crossing"],
    claim: "VG Lives samtidige kampreferat fra Strømsgodset–FKH beskriver Savolainens offensive innlegg: «Savolainen slår godt inn fra venstre, og Sørum header like utenfor!» Dokumenterer en god innleggsleveranse i FKH-perioden, ikke at alle dødballer er gode.",
    source: "https://vglive.vg.no/fotball/str%C3%B8msgodset-haugesund/590600/rapport",
    sourceKind: "press"
  },
  {
    playerId: "du_an_cvetinovi",
    clubId: "haugesund",
    strengths: ["duels"],
    claim: "FootyStats' målte data for Cvetinović i serbisk SuperLiga 2025/26: «Aerial Duels Won 33», med 93. persentil i spillerutvalget. Dette er konkret målt styrke i luftdueller i en langt senere karriereperiode, ikke en konklusjon fra posisjon eller målpoeng; ingen numerisk rating settes.",
    source: "https://footystats.org/players/serbia/dusan-cvetinovic",
    sourceKind: "football_editorial"
  },

  // FK Haugesund: kildebelagte individuelle spillestilprofiler, fortsettelse 2026-10-17.
  {
    playerId: "joakim_vage_nilsen",
    clubId: "haugesund",
    strengths: ["game_reading"],
    claim: "Aftenpostens individuelle talentvurdering i 2010 omtaler Våge Nilsen som «Offensiv og trygg venstreback med en god venstrefot» og med «Godt blikk for spillet». Bare det uttrykkelige spilleblikket gir game_reading; venstrefot alene gir ingen spesifikk pasningsstyrke.",
    source: "https://www.aftenbladet.no/sport/i/kaqnQv/tenaaringsboomen",
    sourceKind: "press"
  },
  {
    playerId: "trygve_nygaard",
    clubId: "haugesund",
    strengths: ["work_rate"],
    claim: "FKH-trener Jostein Grindhaug om Nygaard i 2013: «Også har han en voldsom drive i seg. Det er aldri noe sutring. Han kommer på trening, og gjør jobben sin» og «I gjenvinningsspillet var han viktig». Arbeidsinnsatsen registreres, men ikke et spesifikt taklings- eller pasningstoken.",
    source: "https://www.aftenbladet.no/sport/i/EW4Po3/dette-er-trygve-nygaards-karrierehoeydepunkt",
    sourceKind: "press"
  },
  {
    playerId: "roope_riski",
    clubId: "haugesund",
    strengths: ["finishing","positioning"],
    claim: "Yles intervju med Riski fra Ilves-perioden i 2026 beskriver ham som «yksi parhaista maalintekijöistä» og «suomalaisittain poikkeuksellisen hyvä maalintekijä». Riski sier om egen avslutningsutvikling at treningsrepetisjoner har skapt «luontaista valmiutta sijoittua oikein». Dette dokumenterer avslutning og posisjonering, ikke tallrating eller FKH-spesifikk form.",
    source: "https://yle.fi/a/74-20217176",
    sourceKind: "press"
  },
  {
    playerId: "thore_pedersen",
    clubId: "haugesund",
    strengths: ["work_rate","stamina","combination_play"],
    claim: "Pedersen om egen spillestil ved overgangen fra Haugesund til Brann i 2023: «Jeg er energisk og spiller med mye vilje og løpskraft. Jeg er god til å holde på ballen, og en god kombinasjonsspiller». Arbeidsinnsats, løpskapasitet og kombinasjonsspill registreres direkte, ikke dribling eller numerisk rating.",
    source: "https://www.brann.no/nyheter/pedersen-har-signert-for-brann",
    sourceKind: "club"
  },
  {
    playerId: "liban_abdi",
    clubId: "haugesund",
    strengths: ["pace"],
    claim: "Liban Abdi sier selv i samtidig Karmøynytt-intervju i april 2017 under Haugesund-perioden: «Jeg har trent bra i vinter og føler meg veldig kjapp». Hurtighet føres, mens artikkelens dribleoverskrift ikke alene brukes som et generelt dribletoken.",
    source: "https://www.karmoynytt.no/abdi-driblet-til-den-store-gullmedalje/s/25-161-26399",
    sourceKind: "press"
  },
  {
    playerId: "haris_hajradinovi",
    clubId: "haugesund",
    strengths: ["chance_creation"],
    claim: "Flashscores tilbakeblikk på Süper Lig 2024/25 fremhever Hajradinović med «the most chances created (94), and the most through balls (22)» og beskriver ham som en fremtredende offensiv bidragsyter for Kasımpaşa. Bare eksplisitt dokumentert sjanseskaping registreres; det gjelder senere karriere, ikke en gitt FKH-kamp.",
    source: "https://www.flashscoreusa.com/news/soccer-super-lig-turkish-super-lig-weekly-victor-osimhen-and-galatasaray-dominate-the-team-of-the-season/SMW1e3Sa/",
    sourceKind: "press"
  },
  {
    playerId: "filip_kiss",
    clubId: "haugesund",
    strengths: ["tackling"],
    claim: "VG-lupens 2017-vurdering dokumenterer 97 taklinger for FK Haugesund i 2016-sesongen, 68 vunnet («nest best i klassen»). Dette er et direkte, individuelt mål på utførte vellykkede taklinger, ikke en antakelse fra ankerrolle, kort eller kampmengde; ingen tallrating føres.",
    source: "https://www.vg.no/spesial/2017/vglupen/?plassering=10",
    sourceKind: "press"
  },

  // FK Haugesund: individuelt dokumentert spillerbolk 2026-10-17.
  {
    playerId: "bala_garba",
    clubId: "haugesund",
    strengths: ["pace","flair"],
    claim: "Torgeir Katlas historiske FKH-spillerkåring fra 2015 beskriver Garba som «Rask, uforutsigbar». Dette dokumenterer fart og uforutsigbart spill; målstatistikken brukes ikke som belegg for avslutningsevne.",
    source: "https://www.aftenposten.no/sport/fotball/i/GGPrdx/de-ti-beste-i-haugesunds-historie",
    sourceKind: "press"
  },
  {
    playerId: "nikola_ur_i",
    clubId: "haugesund",
    strengths: ["work_rate","finishing"],
    claim: "Historisk FKH-spillervurdering av Đurđić: «Han jaget og løp på alt» og omtaler uttrykkelig hans «Arbeidsmoralen og målteften». Arbeidsinnsats og avslutningsevne føres, ikke rating fra scoringstall.",
    source: "https://www.aftenposten.no/sport/fotball/i/GGPrdx/de-ti-beste-i-haugesunds-historie",
    sourceKind: "press"
  },
  {
    playerId: "fredrik_pallesen_knudsen",
    clubId: "haugesund",
    strengths: ["duels"],
    claim: "Branns offisielle spillerprofil kaller Fredrik Pallesen Knudsen en «duellsterk ung midtstopper». Beskrivelsen gjelder spillerens tidlige karriere; kilden bekrefter individuell duellstyrke, ikke høydebasert antagelse.",
    source: "https://www.brann.no/lag/fredrik-pallesen-knudsen",
    sourceKind: "club"
  },
  {
    playerId: "morten_konradsen",
    clubId: "haugesund",
    strengths: ["stamina"],
    claim: "Morten Konradsen sier selv ved overgangen til FKH i 2023: «Jeg er en offensiv og løpssterk spiller». Kun dokumentert løpskapasitet registreres som stamina, ikke mål/tempo fra midtbaneposisjonen.",
    source: "https://www.fkh.no/nyheter/morten-konradsen-til-fk-haugesund",
    sourceKind: "club"
  },
  {
    playerId: "maic_sema",
    clubId: "haugesund",
    strengths: ["pace","game_reading"],
    claim: "Sportstatistik.nus individuelle omtale beskriver Maic Sema med «snabbhet och spelförståelse». Dette underbygger fart og spilleforståelse, uten antakelser om avslutningsevne eller dribling.",
    source: "https://sportstatistik.nu/fotboll/spelare/maic-sema",
    sourceKind: "football_editorial"
  },
  {
    playerId: "samuel_kari_fridjonsson",
    clubId: "haugesund",
    strengths: ["vision","simple_passing","passing_range","stamina"],
    claim: "Viking-trener Bjarne Berntsen beskriver Friðjónsson i 2019 med «godt overblikk», god på «både korte og lange pasninger» og «veldig bra løpskraft». Disse fire ferdighetene gjelder spillerens tidligere Viking-periode; ikke utledet fra rollevalg.",
    source: "https://www.vikingfotball.no/nyheter/-han-har-vaert-veldig-bra",
    sourceKind: "club"
  },
  {
    playerId: "sory_ibrahim_diarra",
    clubId: "haugesund",
    strengths: ["strength","pace","finishing"],
    claim: "FKHs sportssjef Eirik Opedal beskrev Diarra ved signeringen i februar 2023 som en spiller med «solid fysikk, fin fart og gode avslutteregenskaper». Tre direkte egenskaper dokumenteres, uten å utlede hodespill fra høyde.",
    source: "https://www.aftenposten.no/sport/fotball/i/BWkg2E/haugesund-henter-spiller-fra-mali",
    sourceKind: "press"
  },
  {
    playerId: "frederik_gytkjaer",
    clubId: "haugesund",
    strengths: ["movement"],
    claim: "VG-lupens individuelle FKH-profil i 2017 beskriver Frederik Gytkjær som «Mer bevegelig enn storebror». Kun dokumentert bevegelighet føres; scoringsstatistikk gir ikke automatisk finishing.",
    source: "https://www.vg.no/spesial/2017/vglupen/?plassering=10",
    sourceKind: "press"
  },
  {
    playerId: "kristoffer_haraldseid",
    clubId: "haugesund",
    strengths: ["set_pieces"],
    claim: "VG-lupen 2017 dokumenterer at Haraldseids begge seriemål i 2016 kom direkte på frispark; Nettavisens kampreferat sier «skrude han ballen inn i krysset» om frisparkmålet mot Brann. Dette underbygger dødballteknikk, ikke generell skuddstyrke.",
    source: "https://www.nettavisen.no/sport/fotball/snudde-kampen-mot-brann/s/12-95-3423256201",
    sourceKind: "press"
  },
  {
    playerId: "sondre_liseth",
    clubId: "haugesund",
    strengths: ["heading"],
    claim: "NTBs samtidige kvalifiseringsreferat fra Haugesund–Moss i 2024 beskriver Liseth som møtte et presist innlegg og «stanget ballen i nettet». Det er konkret belegg for hodespill i situasjonen, ikke en tallvurdering av generell avslutningsevne.",
    source: "https://www.dagsavisen.no/sport/fkh-beholdt-plassen-i-eliteserien-tounekti-knuste-drommene-til-moss/5663055",
    sourceKind: "press"
  },

  // Strømsgodset: ytterligere elleve individuelt kildebelagte profiler, 2026-10-17.
  {
    playerId: "thomas_grogaard",
    clubId: "stromsgodset",
    strengths: ["pace","stamina"],
    claim: "Ved signeringen sier Godsets sportssjef Jostein Flo om Thomas Grøgaard: «Han er rask, løpssterk og er god på ball.» Bare direkte støttet fart og løpskapasitet føres, ikke et spesifikt pasningstoken.",
    source: "https://www.godset.no/nyheter/grogaard-er-klar-for-godset",
    sourceKind: "club"
  },
  {
    playerId: "johan_hove",
    clubId: "stromsgodset",
    strengths: ["stamina","finishing","determination"],
    claim: "Nettavisens jury beskriver Godset-spiller Johan Hove i 2020 med «enorm løpskapasitet, vinnervilje og gode avslutningsegenskaper». De tre uttrykkelige kvalitetsordene gir tre tilsvarende styrketoken.",
    source: "https://www.nettavisen.no/sport/disse-vinner-nettavisen-prisen-2020/s/12-95-3424064452",
    sourceKind: "press"
  },
  {
    playerId: "thomas_lehne_olsen",
    clubId: "stromsgodset",
    strengths: ["pace","strength"],
    claim: "Tidligere U-landslagstrener Bård Flovik karakteriserer Thomas Lehne Olsen i desember 2015, ved utgangen av Godset-perioden, som «en ganske hurtig og kraftfull spiller som har målscoreregenskaper». Bare hurtighet og fysisk kraft registreres.",
    source: "https://www.aftenposten.no/sport/fotball/i/pLMr0W/han-kan-bli-kobras-erstatter",
    sourceKind: "press"
  },
  {
    playerId: "sondre_fosnaess_hanssen",
    clubId: "stromsgodset",
    strengths: ["pace","strength"],
    claim: "Hødd-trener Marius Bøe beskriver Sondre Fosnæss Hanssen ved overgangen etter Strømsgodset med «Hurtig, kraft og ballsikker». Direkte kildebelegg for fart og fysisk kraft, ikke en bestemt pasningstype.",
    source: "https://www.hodd.no/nyheiter/spelar-med-nesten-40-eliteserie-kampar-klar-for-hodd",
    sourceKind: "club"
  },
  {
    playerId: "jorgen_horn",
    clubId: "stromsgodset",
    strengths: ["duels","heading","game_reading"],
    claim: "Nettavisens profil av U21-landslagsspiller Jørgen Horn: «Duellsterk, god på hodet og leser spillet på en god måte». Kilden beskriver Horn i Vålerenga-tiden; egenskapene følger spilleren, ikke en bestemt Godset-kamp.",
    source: "https://www.nettavisen.no/14-mann-for-norge/s/12-95-1292915",
    sourceKind: "press"
  },
  {
    playerId: "martin_ronning_ovenstad",
    clubId: "stromsgodset",
    strengths: ["combination_play"],
    claim: "Kråkevingenes 2023-tabelltips omtaler tidligere Godset-spiller Martin Rønning Ovenstad som «En slepen teknikker som er kombinasjonssterk». Bare direkte kombinasjonsspill tas inn.",
    source: "https://www.kraakevingen.no/tabelltips-2023/",
    sourceKind: "football_editorial"
  },
  {
    playerId: "morten_saetra",
    clubId: "stromsgodset",
    strengths: ["shot_stopping"],
    claim: "Strømsgodsets 2023-rapport fra Team SIF-kampen mot Stjørdals-Blink beskriver «gjentatte redninger fra en meget god Morten Sætra». Dette dokumenterer keeperens redningsarbeid; ingen numerisk kvalitet utledes.",
    source: "https://www.godset.no/utvikling/nyheter/team-sif-med-sterkt-bortepoeng",
    sourceKind: "club"
  },
  {
    playerId: "odd_johnsen",
    clubId: "stromsgodset",
    strengths: ["finishing"],
    claim: "Fotballskribentens historiske spilleromtale av Odd Johnsen, som spilte for blant annet Mjøndalen, Brann og Strømsgodset, lyder «Teknisk og målfarlig». Bare avslutningsevne registreres fra den eksplisitte målfarlig-beskrivelsen.",
    source: "https://www.aftenbladet.no/sport/i/MRR3v0/paa-dette-droemmelaget-faar-landslagssjef-hoegmo-plass-som-spiller",
    sourceKind: "football_editorial"
  },
  {
    playerId: "adam_larsen_kwarasey",
    clubId: "stromsgodset",
    strengths: ["command_of_area","shot_stopping"],
    claim: "Samtidig 2011-vurdering av Godset-keeper Adam Larsen Kwarasey omtaler ham som «God i feltet og voldsomt god på strek». Konkret beskrivelser av feltbeherskelse og skuddredninger, ikke reflekser eller distribusjon.",
    source: "https://norsktoppfotball.blogspot.com/2011/10/keeperne-i-tippeligaen.html",
    sourceKind: "football_editorial"
  },
  {
    playerId: "flamur_kastrati",
    clubId: "stromsgodset",
    strengths: ["pace"],
    claim: "Samtidig Fædrelandsvennen-referat fra Strømsgodset–Sandnes Ulf 2014 omtaler Flamur Kastrati som «Lynvingen». Dette beskriver hurtighet; pasningen som mislyktes i samme situasjon gis ingen kvalitet.",
    source: "https://www.fvn.no/sport/i/WLnmAk/droemmescoring-senket-sandnes-ulf",
    sourceKind: "press"
  },
  {
    playerId: "bassel_jradi",
    clubId: "stromsgodset",
    strengths: ["chance_creation"],
    claim: "Strømsgodsets referat etter 3–1-tapet mot RBK 2017 sier at Bassel Jradi «hadde regien bak det meste offensivt» mot slutten. Den konkrete kampvurderingen dokumenterer sjanseskaping i denne kampen, ikke et generelt ratingtall.",
    source: "https://www.godset.no/nyheter/tap-mot-rosenborg",
    sourceKind: "club"
  },

  // Strømsgodset: samlet kildedokumentert spillerbolk 2026-10-17.
  {
    playerId: "viljar_myhra",
    clubId: "stromsgodset",
    strengths: ["shot_stopping","reflexes","positioning"],
    claim: "Lars Tjærnås i intervju etter overgangen fra Godset: «en god shotstopper», med «god positionering» og «hurtige reflekser». Dette er keeperens individuelle kvaliteter; ingen tallverdi.",
    source: "https://obstemmer.dk/interview-viljar-myhra-er-en-god-og-stabil-maalmand/",
    sourceKind: "football_editorial"
  },
  {
    playerId: "lars_jorgen_salvesen",
    clubId: "stromsgodset",
    strengths: ["heading","duels"],
    claim: "Strømsgodsets referat fra Mjøndalen 2019: «en sterk Salvesen» vant duellen bak i feltet og «headet ballen i en bue» i mål. Konkrete demonstrasjoner av hodespill og duellspill, ikke numerisk score.",
    source: "https://www.godset.no/nyheter/uavgjort-i-aelv-classico",
    sourceKind: "club"
  },
  {
    playerId: "marko_farji",
    clubId: "stromsgodset",
    strengths: ["crossing"],
    claim: "Godsets kampreferater i mai 2025 beskriver flere presise innlegg fra Farji: «igjen etter innlegg fra Marko Farjis høyrefot» og innlegg til mål mot Kristiansund. Den gjentatte presise innleggsleveransen dokumenterer crossing.",
    source: "https://www.godset.no/nyheter/storseier-i-treningskampen",
    sourceKind: "club"
  },
  {
    playerId: "logi_tomasson",
    clubId: "stromsgodset",
    strengths: ["crossing"],
    claim: "Godsets referat mot RB Linense 2024 beskriver flere vellykkede innlegg fra Logi Tómasson: «Logi slo et godt innlegg» og «Logi Tómasson fant denne gangen Herman Stengel». Flere konkrete innlegg underbygger crossing.",
    source: "https://www.godset.no/nyheter/linense-godset",
    sourceKind: "club"
  },
  {
    playerId: "marcus_pedersen",
    clubId: "stromsgodset",
    strengths: ["pace","strength","work_rate","hold_up_play"],
    claim: "Martin Andresens spillerbeskrivelse fra 2012, etter Godset-oppholdet: «rask og sterk, gjennombruddshissig, bevegelig» og «jobber han godt for laget og er sterk feilvendt». Dokumenterer fart, fysikk, arbeidsinnsats og feilvendt spill.",
    source: "https://www.aftenposten.no/sport/fotball/i/kJpJKj/marcus-pedersen-klar-for-vaalerenga",
    sourceKind: "press"
  },
  {
    playerId: "adama_diomande",
    clubId: "stromsgodset",
    strengths: ["work_rate","duels","pace"],
    claim: "Stabæk-kaptein Morten Skjønsberg beskriver tidligere Godset-spiller Diomande i 2015: «Arbeidsinnsatsen hans er enorm», «en god duellspiller» og «han er hurtig». Kilden gjelder senere Stabæk-periode.",
    source: "https://www.aftenposten.no/sport/fotball/i/Opy8el/stabaek-stjernen-kan-vrake-norge-bestemmer-meg-ikke-foer-hoegmo-ringer",
    sourceKind: "press"
  },
  {
    playerId: "kristoffer_tokstad",
    clubId: "stromsgodset",
    strengths: ["pace","stamina"],
    claim: "Aftenpostens 2014-spillervurdering beskriver Tokstad med «best løpskapasitet, en kombinasjon av hurtighet og utholdenhet som er sjelden». Ferdighetsbeskrivelsen er fra før Godset-perioden.",
    source: "https://www.aftenposten.no/sport/fotball/i/EWzy33/sorry-sarpsborg-dere-rykker-ned",
    sourceKind: "press"
  },
  {
    playerId: "tobias_gulliksen",
    clubId: "stromsgodset",
    strengths: ["chance_creation"],
    claim: "Godsets toppspillerutvikler Kjetil Lundebakken beskrev unggutten Gulliksen: «god på små flater» og «kreativ i siste tredjedel». Konkret kildebelegg for kreativ sjanseskaping, ikke automatisk driblerating.",
    source: "https://www.godset.no/nyheter/lofter-opp-lokale-unggutter",
    sourceKind: "club"
  },
  {
    playerId: "muhamed_keita",
    clubId: "stromsgodset",
    strengths: ["dribbling","game_reading"],
    claim: "Godset-trener Bjørn Petter Ingebretsen sier i 2019 om Keita: «en som kan gå av motstandere og skape ubalanse på egenhånd» og «veldig fotballsmart». Dette underbygger dribling og spilleforståelse.",
    source: "https://www.godset.no/nyheter/velkommen-hjem-keita",
    sourceKind: "club"
  },
  {
    playerId: "gustav_wikheim",
    clubId: "stromsgodset",
    strengths: ["pace","one_vs_one"],
    claim: "Djurgårdens offisielle spillerprofil omtaler den tidligere Godset-vingen som «kvickfotade Gustav som gillar att utmana ute på kanten». Hurtige føtter og offensive én-mot-én-utfordringer dokumenteres i senere karriereperiode.",
    source: "https://frontend-stage.dif.se/spelare/herrar/2020-2029/gustav-wikheim",
    sourceKind: "club"
  },
  {
    playerId: "mostafa_mos_abdellaoue",
    clubId: "stromsgodset",
    strengths: ["work_rate","off_ball_runs","finishing"],
    claim: "Dagbladets U21-spilleroversikt om Mostafa Abdellaoue: «Hardtarbeidende spiller», «Spilleklok i forhold til bevegelser» og «Goalgetter med hurtig avslutningsteknikk». Vurderingen gjelder en tidligere Tromsø-periode.",
    source: "https://www.dagbladet.no/sport/disse-skal-ta-norge-til-vm-i-2014/63513121",
    sourceKind: "press"
  },
  {
    playerId: "jon_knudsen",
    clubId: "stromsgodset",
    strengths: ["composure","distribution"],
    claim: "Aftenpostens keepervurdering av Jon Knudsen fra Stabæk-perioden: «Mest av alt trygg og kald, gjør veldig sjelden tabber. Viktig og god som igangsetter.» Bare ro under press og igangsetting registreres.",
    source: "https://www.aftenposten.no/sport/fotball/i/naLjR5/best-paa-papiret",
    sourceKind: "press"
  },
  {
    playerId: "jarl_andre_storbaek",
    clubId: "stromsgodset",
    strengths: ["set_pieces"],
    claim: "Aftenpostens samtidige kampreferat fra 2007 omtaler Storbæks frisparksmål: «Jarl-André Storbæk ... kan sende frispark i vinkelen». Dette dokumenterer et konkret teknisk dødballspark fra Vålerenga-perioden, ikke tallrating.",
    source: "https://www.aftenbladet.no/sport/i/ngkgbd/laquogullet-ska-hemraquo",
    sourceKind: "press"
  },
  {
    playerId: "fredrik_nordkvelle",
    clubId: "stromsgodset",
    strengths: ["stamina","long_shots"],
    claim: "Aftenpostens spilleromtale før Brann-overgangen i 2011: «Nordkvelle er ekstremt løpssterk og er alltid i bevegelse» og «et godt skuddbein». Underbygger utholdenhet og skuddfot, men langskuddskategorien tolkes snevert.",
    source: "https://www.aftenposten.no/sport/meninger/i/dOvLeX/doddo-blogg-paa-tide-at-haugen-faar-starte",
    sourceKind: "press"
  },
  {
    playerId: "lasse_olsen",
    clubId: "stromsgodset",
    strengths: ["pace"],
    claim: "Strømsgodsets offisielle klubbhistorie omtaler signeringen i 1997: «Lasse Olsen – lynrask ving fra Gjelleråsen». Dette beskriver individuell hurtighet.",
    source: "https://www.godset.no/om-klubben/historien-om-stromsgodset",
    sourceKind: "club"
  },
  {
    playerId: "rune_elvis_hagen",
    clubId: "stromsgodset",
    strengths: ["dribbling"],
    claim: "Strømsgodsets offisielle klubbhistorie beskriver 1997-laget og «Rune Hagen - driblesterk ving fra Veme». Dette gir direkte belegg for dribling.",
    source: "https://www.godset.no/om-klubben/historien-om-stromsgodset",
    sourceKind: "club"
  },
  {
    playerId: "lars_saetra",
    clubId: "stromsgodset",
    strengths: ["ball_carrying"],
    claim: "Aftenpostens rangering av tenåringstalenter beskriver Godset-stopper Lars Sætra som en «offensiv, drivende og spillende midtstoppertype, som er god til å føre ballen oppover banen». Underbygger ballføring, ikke kun posisjon.",
    source: "https://www.aftenbladet.no/sport/i/kaqnQv/tenaaringsboomen",
    sourceKind: "press"
  },
  {
    playerId: "mounir_hamoud",
    clubId: "stromsgodset",
    strengths: ["pace"],
    claim: "Aftenpostens 2005-omtale av Lyns vingalternativer beskriver «så raske folk som Mounir Hamoud og Ezekiel Bala». Kun individuell hurtighet for Hamoud registreres, ikke øvrige ferdigheter.",
    source: "https://www.aftenposten.no/sport/fotball/i/mRMWjp/derek-skal-frem-som-spiss",
    sourceKind: "press"
  },

  // Strømsgodset og FK Haugesund: samlet individuelt kildepass 2026-10-17.
  {
    playerId: "thorodd_presberg",
    clubId: "stromsgodset",
    strengths: ["composure"],
    claim: "Strømsgodsets historikk beskriver Presberg som «kald som is» før det avgjørende straffesparket mot Skeid i 1970. I cupfinalen mot Lyn viste han ifølge klubben «ingen nerver». Begge hendelsene dokumenterer ro under press, ikke en tallrating.",
    source: "https://www.godset.no/om-klubben/historien-om-stromsgodset",
    sourceKind: "club"
  },
  {
    playerId: "iver_fossum",
    clubId: "stromsgodset",
    strengths: ["game_reading"],
    claim: "Aftenpostens kampanalyse omtaler Fossum direkte: «Iver Fossum har situasjonsforståelse og ballfølelse over gjennomsnittet». Situasjonsforståelse dokumenterer spillelesning; det registreres ingen skudd- eller pasningsstyrke fra scoringsepisoden.",
    source: "https://www.aftenposten.no/sport/meninger/i/qLJavw/godset-henger-etter",
    sourceKind: "press"
  },
  {
    playerId: "moses_mawa",
    clubId: "stromsgodset",
    strengths: ["work_rate"],
    claim: "KFUMs historiske spilleromtale fra tiden før Strømsgodset sier om Mawa at han «har satt en høy standard for hvordan en Kåffa-spiss skal løpe for laget». Dette beskriver arbeidsinnsats og bevegelse for laget, ikke avslutningsferdighet.",
    source: "https://www.kaaffa.no/nyheter/tidenes-50-beste-kfum-spillere",
    sourceKind: "club"
  },
  {
    playerId: "ola_kamara",
    clubId: "stromsgodset",
    strengths: ["work_rate","heading","off_ball_runs"],
    claim: "Samtidig scoutingvurdering av Kamara i Strømsgodset kaller ham «hardtarbeidende», sier «solid hodespill» og beskriver «Smarte bevegelser» som frigjør ham fra oppasseren i innleggssituasjoner. Bare arbeidsinnsats, hodespill og løp uten ball registreres; ingen numerisk verdi.",
    source: "https://www.scan-scout.com/2013/09/30/scouting-report-ola-kamara-stromsgodset/",
    sourceKind: "football_editorial"
  },
  {
    playerId: "frode_olsen",
    clubId: "stromsgodset",
    strengths: ["reflexes"],
    claim: "Store norske leksikon omtaler Frode Olsen som «en reaksjonssterk målvakt». Dette dokumenterer reflekser. Leksikonet nevner også defensive én-mot-én-situasjoner, men dette oversettes ikke til offensivt one_vs_one-token.",
    source: "https://snl.no/Frode_Olsen_-_fotballspiller",
    sourceKind: "encyclopedia"
  },
  {
    playerId: "ibrahima_wadji",
    clubId: "haugesund",
    strengths: ["pace","work_rate"],
    claim: "FK Haugesund skriver at Wadji bruker «hurtighet» og siterer daværende trener Eirik Horneland: «Han er en steinhard løpsmaskin med en smittende energi». Hurtighet og arbeidskapasitet er direkte beskrevet, ikke utledet fra antall mål.",
    source: "https://www.fkh.no/nyheter/wadji-signerte-for-fkh",
    sourceKind: "club"
  },
  {
    playerId: "alexander_stolas",
    clubId: "haugesund",
    strengths: ["set_pieces"],
    claim: "FK Haugesund omtaler Alexander Stølås som «landets beste frisparkskytter» i klubbens egen nyhetssak om hans venstrefot. Dette dokumenterer dødballferdighet; ingen egen tallrating settes.",
    source: "https://www.fkh.no/nyheter/alex-i-alle-kanaler",
    sourceKind: "club"
  },
  {
    playerId: "mikkel_desler",
    clubId: "haugesund",
    strengths: ["stamina"],
    claim: "Ved signeringen beskrev FK Haugesund-trener Jostein Grindhaug Desler som en spiller med «veldig fin frekvens og motor». Samtidig omtale beskriver ham som «løpssterke backen». Samlet belegg for løpskapasitet/utholdenhet; ingen sprintfart utledes.",
    source: "https://www.fkh.no/nyheter/desler-har-signert",
    sourceKind: "club"
  },
  {
    playerId: "martin_bjornbak",
    clubId: "haugesund",
    strengths: ["duels"],
    claim: "Haugesunds Avis-journalisten Terje Flateby beskriver Bjørnbak i en spilleromtale gjengitt i Bergens Tidende: «Duellsterk stopper.» Dette gir direkte belegg for duellspill, ikke tallfestet forsvarsrating.",
    source: "https://www.bt.no/sport/i/JoQAm7/se-opp-for-disse-talentene",
    sourceKind: "press"
  },
  {
    playerId: "christian_grindheim",
    clubId: "haugesund",
    strengths: ["work_rate","stamina"],
    claim: "Store norske leksikon om Grindheims spillestil: «en hardtarbeidende midtbanespiller med stor løpskapasitet». Dette dokumenterer arbeidsinnsats og utholdenhet, ikke pasnings- eller skuddferdigheter.",
    source: "https://snl.no/Christian_Grindheim",
    sourceKind: "encyclopedia"
  },
  {
    playerId: "sondre_tronstad",
    clubId: "haugesund",
    strengths: ["work_rate","simple_passing","game_reading"],
    claim: "Tveit IL beskriver Tronstads senere Championship-periode slik: «Med sin arbeidskapasitet, pasningssikkerhet og kloke fotballhode». Dette underbygger arbeidsinnsats, presise enkle pasninger og spilleforståelse; kilden gjelder Blackburn-tiden, ikke en bestemt Haugesund-kamp.",
    source: "https://tveitil.no/klubben/sondre-tronstad-tveit-gutten-som-kan-rykke-opp-til-premier-league",
    sourceKind: "club"
  },

  // Rosenborg: Erling Næss forteller selv om dribling og konkrete finter i RBK-tiden.
  {
    playerId: "erling_naess",
    clubId: "rosenborg",
    strengths: ["dribbling"],
    claim: "Næss: «Jeg driblet dermed helt til jeg mistet ballen eller scoret! Derfor ble jeg naturlig nok skikkelig god til å drible.» Han forteller også om da han «fintet» Trygve Bornø i en RBK–Skeid-kamp. Bare dribling registreres.",
    source: "https://www.rbkweb.no/vis/18105",
    sourceKind: "football_editorial"
  },

  // Rosenborg: seks kildebelagte historiske ferdighetsprofiler, samlet dataleveranse.
  {
    playerId: "harald_petersen",
    clubId: "rosenborg",
    strengths: ["work_rate","leadership"],
    claim: "Adresseavisen om Petersen i 1937: «spilte meget energisk» og «dirigerte laget på en utmerket måte». Konkrete arbeids- og lederegenskaper, ikke slutning fra fem scoringer.",
    source: "https://www.rbk.no/nyheter/forste-gang-forbi-2.runde",
    sourceKind: "club"
  },
  {
    playerId: "tore_lindseth",
    clubId: "rosenborg",
    strengths: ["pace","dribbling"],
    claim: "Historisk spillervurdering omtaler Lindseth som «den raske driblevingen fra Kvarvingsdalen». Bare fart og dribling registreres.",
    source: "https://stabbursloftet.substack.com/p/tidenes-beste-i-den-gule-trya",
    sourceKind: "football_editorial"
  },
  {
    playerId: "oystein_wormdal",
    clubId: "rosenborg",
    strengths: ["ball_carrying"],
    claim: "Adresseavisens historiske RBK-jury: «Han var god til å ta med seg ballen fra eget forsvar og til angrep».",
    source: "https://www.aftenposten.no/sport/fotball/i/4qbxjV/juryens-favoritt-oeystein-wormdahl",
    sourceKind: "press"
  },
  {
    playerId: "erling_meirik",
    clubId: "rosenborg",
    strengths: ["pace"],
    claim: "Adresseavisens RBK-omtale: «Han var i tillegg hurtig, noe han brukte aktivt ved å være med i angrepsspillet».",
    source: "https://www.aftenposten.no/sport/fotball/i/4qbxjV/juryens-favoritt-oeystein-wormdahl",
    sourceKind: "press"
  },
  {
    playerId: "terje_morkved",
    clubId: "rosenborg",
    strengths: ["pace"],
    claim: "Historisk RBK-spilleromtale beskriver Terje Mørkved som «lynkjapp». Skuddkraft alene brukes ikke til å utlede presisjon eller langskudd.",
    source: "https://www.aftenposten.no/sport/fotball/i/Qo5aRA/maal-etter-maal",
    sourceKind: "press"
  },
  {
    playerId: "harald_gulbrandsen",
    clubId: "rosenborg",
    strengths: ["game_reading","positioning"],
    claim: "Rosenborgs minneord sier: «klokskap og plasseringsevne som få». Dette dokumenterer spilleforståelse og posisjonering, ikke hurtighet.",
    source: "https://www.rbk.no/nyheter/minneord-om-harald-gulbrandsen",
    sourceKind: "club"
  },
  // Rosenborg 1960: Adresseavisens samtidige individuelle kampvurdering,
  // bevart i klubbens offisielle statistikkarkiv.
  {
    playerId: "olav_wang",
    clubId: "rosenborg",
    strengths: ["stamina"],
    claim: "Adresseavisen: «Med sin rutine, kondisjon og teknikk laget han et sidehalfspill av høy klasse». Bare kondisjon registreres som dokumentert styrke.",
    source: "https://statistikk.rbk.no/kamp/1572/sandefjord-rosenborg",
    sourceKind: "press"
  },

  // Rosenborg: dokumenterte historiske ferdigheter fra klubbens egne arkiver.
  {
    playerId: "birger_tingstad",
    clubId: "rosenborg",
    strengths: ["set_pieces"],
    claim: "«Birger Tingstad sendte et av sine spesial-frispark helt oppe i hjørnet.»",
    source: "https://www.rbk.no/nyheter/62-ar-siden-62",
    sourceKind: "club"
  },
  {
    playerId: "kjell_hvidsand",
    clubId: "rosenborg",
    strengths: ["pace","tackling"],
    claim: "«Som spiller var Kjell det vi må kalle en moderne back, offensiv og hurtig. Ikke minst var han taklingssterk»",
    source: "https://statistikk.rbk.no/spiller/250-kjell-hvidsand",
    sourceKind: "club"
  },
  {
    playerId: "tor_kleveland",
    clubId: "rosenborg",
    strengths: ["pace"],
    claim: "«Da Odd kom på besøk til serieleder RBK i niende runde hadde den kjappe venstrevingen ennå ikke skåret i serien.»",
    source: "https://www.rbk.no/nyheter/bedre-enn-originalen",
    sourceKind: "club"
  },
  {
    playerId: "eldar_hansen",
    clubId: "rosenborg",
    strengths: ["dribbling"],
    claim: "«Ti minutter ut i andre omgang driblet Eldar Hansen halve Sarpsborg-laget»",
    source: "https://www.rbk.no/om-rbk/historie/fra-odd-til-nordens-stolthet/sesongen-1964",
    sourceKind: "club"
  },
  // Rosenborg 2026-10-16: dokumenterte ferdighetsbeskrivelser fra eldre og nyere kilder.
  {
    playerId: "einar_jorum",
    clubId: "rosenborg",
    strengths: ["heading","simple_passing"],
    claim: "Sportsmandens kampvurdering: «Med frapperende sterkt hodespill, gode skudd og godt innsiktede pasninger.»",
    source: "https://jarlesvifstatistikk.bravesites.com/historikk",
    sourceKind: "football_editorial"
  },
  {
    playerId: "abdou_razack_traore",
    clubId: "rosenborg",
    strengths: ["pace","strength"],
    claim: "José Mourinho nevner Traoré blant tre Rosenborg-angripere og beskriver gruppen: «De virker sterke, teknisk dyktige og hurtige.»",
    source: "https://www.aftenposten.no/sport/fotball/i/y3gdRa/mourinhos-verden",
    sourceKind: "press"
  },
  {
    playerId: "trond_egil_soltvedt",
    clubId: "rosenborg",
    strengths: ["work_rate","tackling","first_touch"],
    claim: "11v11: «He is a hard-working midfield player who is strong in the tackle and has good ball-control skills.»",
    source: "https://www.11v11.com/players/trond-egil-soltvedt-450/",
    sourceKind: "football_editorial"
  },
  {
    playerId: "torbjorn_lysaker_heggem",
    clubId: "rosenborg",
    strengths: ["simple_passing"],
    claim: "Carlos Corberán: «He is a player who is capable of taking responsibility for the ball, playing out from the back and managing the ball well with both feet.»",
    source: "https://www.wba.co.uk/news/albion-complete-torbjorn-heggem-transfer",
    sourceKind: "club"
  },
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
