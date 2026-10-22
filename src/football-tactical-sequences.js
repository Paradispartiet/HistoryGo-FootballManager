import { evaluateLiveTacticalExchange, resolvePressEscapeEvidence } from "./football-live-tactical-exchange.js";

// Four connected tactical actions, an opponent counter and a possible reply.
// Principles are grounded in FIFA and England Football coaching resources;
// numeric thresholds are explicitly game-design hypotheses, not empirical estimates.
export const TACTICAL_PRINCIPLE_SOURCES = Object.freeze({
  "fifaThird": {
    "title": "FIFA – Third-player combinations",
    "url": "https://www.fifatrainingcentre.com/en/game/game-analysis/in-possession/third-player-combinations.php"
  },
  "fifaSwitch": {
    "title": "FIFA – Switch of play",
    "url": "https://www.fifatrainingcentre.com/en/game/game-analysis/in-possession/switch-of-play.php"
  },
  "fifaPress": {
    "title": "FIFA – High press",
    "url": "https://www.fifatrainingcentre.com/en/game/game-analysis/out-of-possession/high-press.php"
  },
  "fifaBlock": {
    "title": "FIFA – Team organisation out of possession",
    "url": "https://www.fifatrainingcentre.com/en/game/game-analysis/out-of-possession/team-organisation--out-of-possession-.php"
  },
  "fifaCounter": {
    "title": "FIFA – The counter-attack",
    "url": "https://www.fifatrainingcentre.com/en/game/game-analysis/transition-to-attacking/the-counter-attack.php"
  },
  "fifaEscape": {
    "title": "FIFA – Passing the press",
    "url": "https://www.fifatrainingcentre.com/en/game/game-analysis/transition-to-attacking/passing-the-press.php"
  },
  "fifaLoss": {
    "title": "FIFA – The reaction to losing the ball",
    "url": "https://www.fifatrainingcentre.com/en/game/game-analysis/transition-to-defending/the-reaction-to-losing-the-ball.php"
  },
  "faPrinciples": {
    "title": "England Football – The principles of football",
    "url": "https://learn.englandfootball.com/articles-and-resources/coaching/resources/2022/What-are-the-principles-of-football"
  },
  "faBehind": {
    "title": "The FA – Defending space in behind",
    "url": "https://www.thefa.com/bootroom/resources/coaching/how-to-defend-like-england-space-in-behind"
  },
  "faWide": {
    "title": "The FA – Defending wide spaces",
    "url": "https://www.thefa.com/bootroom/resources/coaching/how-to-defend-like-england-space-in-wide-areas"
  }
});

export const TACTICAL_SEQUENCES = Object.freeze([
  {
    "tacticId": "central_possession_4231",
    "title": "Sentralt overtall",
    "opponentCondition": {
      "trait": "defensiveCompactness",
      "min": 65
    },
    "requires": {
      "buildUpScore": 63,
      "depthScore": 58
    },
    "moves": [
      "Trekk stopperpresset mot ballen",
      "Bind sekser med støttespiller",
      "Finn tredjemann i mellomrommet",
      "Løp inn bak deres neste ledd"
    ],
    "counter": "Stenger sentral sekser og tier",
    "response": "Vend via motsatt back og angrip halvrom",
    "responsePlanId": "overlap_channels",
    "counterCondition": {
      "trait": "pressIntensity",
      "min": 78
    },
    "phase": "in_possession",
    "principleSourceIds": [
      "fifaThird",
      "faPrinciples"
    ],
    "mechanism": "Første pasning lokker presset. Avlegget og tredjemann skaper ledig mellomrom for neste løp.",
    "counterLogic": "Aggressivt press alene stenger ikke automatisk tier og sekser; det krever samtidige avstander og dekning.",
    "failureMode": "Når tredjemanns pasning brytes og spissen blir isolert, mister kombinasjonen retningen.",
    "observation": "Se om pasningslegger, avlegger og tredje løper faktisk er tilgjengelige samtidig."
  },
  {
    "tacticId": "patient_build_up",
    "title": "Spille fri tredjemann",
    "opponentCondition": {
      "trait": "pressIntensity",
      "min": 70
    },
    "requires": {
      "buildUpScore": 67,
      "balanceScore": 62
    },
    "moves": [
      "Inviter frem første pressledd",
      "Bruk keeper som pasningsstøtte",
      "Spill gjennom ledig sekser",
      "Gå frem med overtall bak presset"
    ],
    "counter": "Låser keeper og sekser samtidig",
    "response": "Spill kontrollert lengre til bred støtte",
    "responsePlanId": "direct_second_balls",
    "counterCondition": {
      "trait": "defensiveCompactness",
      "min": 79
    },
    "phase": "in_possession",
    "principleSourceIds": [
      "fifaEscape",
      "fifaThird"
    ],
    "mechanism": "Keeper og sekser gir ulike vinkler slik at laget kan passere et høyt press og komme ut på rettvendt spiller.",
    "counterLogic": "Motstanderen må presse koordinert og fjerne både første støtte og returen, ikke bare løpe fort.",
    "failureMode": "Uten pressresistent mottaker blir rolige korte pasninger en invitasjon til balltap nær eget mål.",
    "observation": "Tell frie pasningsvinkler foran og bak førsteforsvarer ved pressutløseren; kontroller også hvem som dekker neste pasning."
  },
  {
    "tacticId": "positional_overloads",
    "title": "Overtall og isolasjon",
    "opponentCondition": {
      "trait": "defensiveCompactness",
      "min": 64
    },
    "requires": {
      "buildUpScore": 65,
      "widthScore": 63
    },
    "moves": [
      "Samle spillere til ballside",
      "Bind deres back med indreløper",
      "Vend gjennom tredjemann",
      "Isoler kantspiller på svak side"
    ],
    "counter": "Forskyver kompakt mot begge sider",
    "response": "Angrip halvrommet der midtbanen forlot posisjon",
    "responsePlanId": "wide_fast_433",
    "counterCondition": {
      "trait": "defensiveStructure",
      "min": 80
    },
    "phase": "in_possession",
    "principleSourceIds": [
      "fifaSwitch",
      "fifaThird"
    ],
    "mechanism": "Overtall på én side trekker forsvar, så vendes ballen til en fri kant og en tredje løper.",
    "counterLogic": "Defensiv organisering og kollektiv forskyvning kan fjerne mottakeren, men kan åpne motsatt halvrom.",
    "failureMode": "Vending uten fri pasningslegger eller bred mottaker øker balltaps- og kontringsrisiko.",
    "observation": "Se om ballfører har tid til å vende, og om mottakeren får støtte i fart før forsvarsblokken rekker å skyve tilbake."
  },
  {
    "tacticId": "high_press_343",
    "title": "Koordinert pressfelle",
    "opponentCondition": {
      "trait": "shortBuildUp",
      "min": 65
    },
    "requires": {
      "pressScore": 65,
      "balanceScore": 60,
      "restDefenseScore": 59
    },
    "moves": [
      "Styr første pasning ut mot kant",
      "Steng returen til keeper",
      "Press med back og spiss samtidig",
      "Sikre bakrom og vinn andreball"
    ],
    "counter": "Spiller direkte bak vingback",
    "response": "Senk presshøyde og la sekser sikre",
    "responsePlanId": "midfield_press_trap",
    "counterCondition": {
      "trait": "pressResistance",
      "min": 79
    },
    "phase": "out_of_possession",
    "principleSourceIds": [
      "fifaPress",
      "faBehind"
    ],
    "mechanism": "Spissen styrer første pasning, midtbanen stenger støtte, vingback presser og bakre ledd sikrer rom.",
    "counterLogic": "En pressresistent mottaker kan bryte leddet, særlig når et fremoverspill finner rom bak den høye vingbacken.",
    "failureMode": "Løper bare førsteforsvarer, åpner midten og bakrommet selv om presset virker intenst.",
    "observation": "Se om backlinjen flytter når førstepresset setter inn, og hvem som sikrer bak motsatt vingback."
  },
  {
    "tacticId": "counter_press_recovery",
    "title": "Gjenvinning før overgang",
    "opponentCondition": {
      "trait": "transitionThreat",
      "min": 66
    },
    "requires": {
      "pressScore": 65,
      "restDefenseScore": 62
    },
    "moves": [
      "Sikre bak ball før angrep",
      "Press umiddelbart etter balltap",
      "Steng første fremoverpasning",
      "Vinn andreball og angrip igjen"
    ],
    "counter": "Vender seg forbi pressleddet",
    "response": "Avbryt presset og organiser blokk",
    "responsePlanId": "midfield_press_trap",
    "counterCondition": {
      "trait": "pressResistance",
      "min": 78
    },
    "phase": "transition_defend",
    "principleSourceIds": [
      "fifaLoss",
      "fifaEscape"
    ],
    "mechanism": "Før balltap organiseres sikringen. Ved balltap presser nærmeste, øvrige dekker første utpasning og vinner retur.",
    "counterLogic": "Et rettvendt pasningsledd under press og et samtidig utløp kan passere gjenvinningspresset.",
    "failureMode": "Enspillerpress uten støtte kan bli overspilt og etterlate et større rom enn før balltap.",
    "observation": "Se første tre sekunder etter tap: press, pasningslinjer og bakre sikring. Mål om nærmeste støtte faktisk følger ballfører."
  },
  {
    "tacticId": "midfield_press_trap",
    "title": "Fange pasningen i midten",
    "opponentCondition": {
      "trait": "possessionControl",
      "min": 65
    },
    "requires": {
      "pressScore": 59,
      "balanceScore": 62
    },
    "moves": [
      "La stoppere føre ballen frem",
      "Skjerm den sentrale mottakeren",
      "Press pasningen gjennom midten",
      "Vend direkte etter gjenvinning"
    ],
    "counter": "Vender ut til motsatt back",
    "response": "Skyv midtblokken samlet mot ny ballside",
    "responsePlanId": "low_block_transition_541",
    "counterCondition": {
      "trait": "pressResistance",
      "min": 78
    },
    "phase": "out_of_possession",
    "principleSourceIds": [
      "fifaBlock",
      "fifaPress"
    ],
    "mechanism": "Første ledd inviterer sentral pasning, midtbanen skjermer mottaker og presset starter på et kontrollert signal.",
    "counterLogic": "En motstander som tåler press og kan vende gjennom tredje mann kan spille forbi fellen.",
    "failureMode": "For sen kollektiv forskyvning lar den første mottakeren vende opp uten press.",
    "observation": "Se om pressutløseren blir delt av sentrale spillere, og om motsatt side har sikring."
  },
  {
    "tacticId": "direct_counter_442",
    "title": "Lokk høyt og angrip bak",
    "opponentCondition": {
      "trait": "highLine",
      "min": 64
    },
    "requires": {
      "depthScore": 64,
      "balanceScore": 58
    },
    "moves": [
      "Stå kompakt i to ledd",
      "Vinn ballen sentralt",
      "Slipp pasningen forbi høy back",
      "La to spisser angripe ulike rom"
    ],
    "counter": "Lar bakerste stopper falle av",
    "response": "Bruk avlegg til innløpende midtbane",
    "responsePlanId": "target_man_focus",
    "counterCondition": {
      "trait": "defensiveStructure",
      "min": 81
    },
    "phase": "transition_attack",
    "principleSourceIds": [
      "fifaCounter",
      "faBehind"
    ],
    "mechanism": "Et kompakt lag vinner ballen, første pasning går forbi fremste motspiller og to løpere deler bakrommet.",
    "counterLogic": "En organisert bakerste sikring kan forsinke eller stanse den første vertikale pasningen.",
    "failureMode": "Lav gjenvinningskvalitet eller forsinket løp lar motstanderen omstille før rommet angripes.",
    "observation": "Se avstand mellom ballvinner, første pasning og mottaker bak forsvarslinja."
  },
  {
    "tacticId": "low_block_transition_541",
    "title": "Fra lav blokk til overgang",
    "opponentCondition": {
      "trait": "possessionControl",
      "min": 67
    },
    "requires": {
      "restDefenseScore": 66,
      "depthScore": 59
    },
    "moves": [
      "Beskytt rommet foran egen boks",
      "Tving angrepet ut mot kanten",
      "Vinn ballen med støtte for første pasning",
      "Slipp spiss og vingback raskt frem"
    ],
    "counter": "Sikrer bak ballen med flere spillere",
    "response": "Flytt laget frem som enhet før neste utløsning",
    "responsePlanId": "positional_overloads",
    "counterCondition": {
      "trait": "defensiveStructure",
      "min": 80
    },
    "phase": "transition_attack",
    "principleSourceIds": [
      "fifaBlock",
      "fifaCounter"
    ],
    "mechanism": "Den tette blokken hindrer sentrale gjennombrudd, ballvinner finner støtte og spiss/vingback starter koordinert motrom.",
    "counterLogic": "Motstanderens gode restforsvar kan stoppe første kontring uten å ofre eget posisjonsspill.",
    "failureMode": "En isolert spiss og for lange avstander gjør at ballen kommer rett tilbake.",
    "observation": "Se første pasning ut av blokken og om noen følger mottakeren inn i neste ledd."
  },
  {
    "tacticId": "deep_block_long_release",
    "title": "Forsvar og andreball",
    "opponentCondition": {
      "trait": "highLine",
      "min": 64
    },
    "requires": {
      "restDefenseScore": 63,
      "balanceScore": 61,
      "depthScore": 58
    },
    "moves": [
      "Forsvar boks og første innlegg",
      "Vinn første eller andre ball",
      "Spill tidlig mot spissen",
      "Støtt avlegget med midtbaneløp"
    ],
    "counter": "Dekker nedfallsrommet godt",
    "response": "Spill via vingback før lengre ball",
    "responsePlanId": "target_man_focus",
    "counterCondition": {
      "trait": "defensiveStructure",
      "min": 81
    },
    "phase": "transition_attack",
    "principleSourceIds": [
      "fifaBlock",
      "fifaCounter"
    ],
    "mechanism": "En tett boks gir duellrom, klareringer blir kontrollert andreball og et avlegg gir neste fremoverspill.",
    "counterLogic": "Motstanderen kan kontrollere nedfallsrommet med en organisert sikring og hente opp alle lange baller.",
    "failureMode": "Direkte klarering uten mottak, duellstøtte og vinner av andreball gir vedvarende trykk imot.",
    "observation": "Se hvem som kan vinne nedfallsrommet; rollen alene dokumenterer ikke duellstyrke."
  },
  {
    "tacticId": "direct_second_balls",
    "title": "Forbi press og vinn nedfallsrom",
    "opponentCondition": {
      "trait": "pressIntensity",
      "min": 68
    },
    "requires": {
      "balanceScore": 62,
      "depthScore": 60
    },
    "moves": [
      "Lokke første pressledd",
      "Slå langt bak presslinjen",
      "Samle midtbanen rundt første duell",
      "Vinn andreball og angrip neste rom"
    ],
    "counter": "Pakker rommet rundt andreballen",
    "response": "Spill kort via tredjemann før langpasningen",
    "responsePlanId": "patient_build_up",
    "counterCondition": {
      "trait": "defensiveCompactness",
      "min": 78
    },
    "phase": "transition_attack",
    "principleSourceIds": [
      "fifaEscape",
      "fifaCounter"
    ],
    "mechanism": "Lang ball passerer første pressledd, omkringliggende midtbane sikrer nedfallsrommet og neste pasning finner åpent rom.",
    "counterLogic": "Kompakt bakre lagdel med organisert midtbane kan vinne den første andreballen.",
    "failureMode": "Uten dokumentert duellkvalitet og støtte kan direkte spill bli gjentatte tap av ball.",
    "observation": "Mål hvor nær støtteleddet er ved første duell, ikke bare lengden på første pasning."
  },
  {
    "tacticId": "target_man_focus",
    "title": "Festepunkt og tredje løp",
    "opponentCondition": {
      "trait": "pressIntensity",
      "min": 65
    },
    "requires": {
      "balanceScore": 62,
      "depthScore": 57
    },
    "moves": [
      "Finn spissens føtter eller kropp",
      "Gi nær støtte ved første duell",
      "Legg av til møtende indreløper",
      "Slipp løper rundt stoppere"
    ],
    "counter": "Dobler på mottaksspiss",
    "response": "Flytt første pasning ut i halvrom",
    "responsePlanId": "overlap_channels",
    "counterCondition": {
      "trait": "defensiveStructure",
      "min": 79
    },
    "phase": "in_possession",
    "principleSourceIds": [
      "fifaThird",
      "fifaEscape"
    ],
    "mechanism": "Tidlig pasning finner festepunkt, avlegg til møtende spiller frigjør en tredje løper.",
    "counterLogic": "Dobling på mottaksspissen kan redusere tid til avlegg, men kan samtidig åpne rom for en rettvendt mottaker på den andre siden.",
    "failureMode": "En spiss med riktig rolle, men uten dokumentert mottaks-/duellbelegg, skal ikke automatisk få høy kvalitetsbonus.",
    "observation": "Se om mottaksspilleren har fri avleggsstøtte og en tredje løper som utnytter avlegget innen neste pasning."
  },
  {
    "tacticId": "wide_fast_433",
    "title": "Isoler kant ved sideskifte",
    "opponentCondition": {
      "trait": "defensiveCompactness",
      "min": 64
    },
    "requires": {
      "widthScore": 65,
      "depthScore": 61
    },
    "moves": [
      "Bind sekser med sentral støtte",
      "Dra backen inn mot ballen",
      "Vend tidlig til bred kantspiller",
      "Angrip én mot én med boksløp"
    ],
    "counter": "Dobler opp mot kantspilleren",
    "response": "Bruk underlapp eller bytt side igjen",
    "responsePlanId": "overlap_channels",
    "counterCondition": {
      "trait": "defensiveStructure",
      "min": 80
    },
    "phase": "in_possession",
    "principleSourceIds": [
      "fifaSwitch",
      "faWide"
    ],
    "mechanism": "Ballfører trekker laget til en side, vending frigjør én-mot-én ute og samtidige boksløp gir flere valg.",
    "counterLogic": "Kollektiv sidesikring og riktig støtte fra egen back kan forsvare én-mot-én uten å blottlegge midten.",
    "failureMode": "En isolert kantspiller uten støtte kan bli låst mot linja, og motstanderen kan bryte angrepet før boksen er bemannet.",
    "observation": "Se om pasningslegger har tid til sideskifte, og om mottakeren har både mulighet for én-mot-én og en trygg støttepasning."
  },
  {
    "tacticId": "crossing_box_presence",
    "title": "Åpne bredde, fylle boks",
    "opponentCondition": {
      "trait": "defensiveCompactness",
      "min": 63
    },
    "requires": {
      "widthScore": 65,
      "depthScore": 59,
      "balanceScore": 57
    },
    "moves": [
      "Trekk blokk mot første side",
      "Skap to mot én på kanten",
      "Fyll boks med ulike løpsbaner",
      "Sikre andreball ved boksgrensen"
    ],
    "counter": "Vinner første innlegg og rydder unna",
    "response": "Spill bakover til lavt innlegg",
    "responsePlanId": "positional_overloads",
    "counterCondition": {
      "trait": "defensiveStructure",
      "min": 80
    },
    "phase": "in_possession",
    "principleSourceIds": [
      "fifaSwitch",
      "faWide"
    ],
    "mechanism": "Bredde og overlapp skaper innleggsrom, ulike løp fyller boksen og et ledd sikrer returen.",
    "counterLogic": "Strukturert bokssikring og første-duell kan avskjære innlegget og vinne klareringen.",
    "failureMode": "Mange innlegg er ikke lik mange gode sjanser hvis boksløp og duellevne mangler.",
    "observation": "Se kvaliteten på innleggsrommet, løpsbanene gjennom boksen og hvem som faktisk tar returen ved første klarering."
  },
  {
    "tacticId": "overlap_channels",
    "title": "Overlapp med kontrollert sikring",
    "opponentCondition": {
      "trait": "defensiveCompactness",
      "min": 62
    },
    "requires": {
      "widthScore": 64,
      "restDefenseScore": 61
    },
    "moves": [
      "Trekk back innover via kant",
      "Start overlapp rundt motstanderback",
      "Finn tredjemann i halvrommet",
      "Slå innlegg med sekser som sikring"
    ],
    "counter": "Kontrer bak høy vingback",
    "response": "Senk motsatt back og la sekser sikre",
    "responsePlanId": "central_possession_4231",
    "counterCondition": {
      "trait": "transitionThreat",
      "min": 78
    },
    "phase": "in_possession",
    "principleSourceIds": [
      "fifaSwitch",
      "faWide"
    ],
    "mechanism": "Kant binder back, overlapp skaper overtall, tredjemann finner halvrom og sekser sikrer tap.",
    "counterLogic": "Sterke motstander-overganger kan utnytte området som en høy back forlater, spesielt dersom motsatt back også går i angrep.",
    "failureMode": "To høye backer uten retursikring kan åpne begge sider samtidig, slik at én presis utpasning blir til et numerisk overtak imot.",
    "observation": "Se motsatt backs sikringsposisjon før overlappet starter, og om sekseren fortsatt skjermer første kontringspasning."
  },
  {
    "tacticId": "see_out_the_game",
    "title": "Stenge midten ved ledelse",
    "opponentCondition": {
      "trait": "pressIntensity",
      "min": 70
    },
    "requires": {
      "restDefenseScore": 68,
      "balanceScore": 67
    },
    "moves": [
      "Senk risiko ved egne balltap",
      "Hold midtbane tett på bakre ledd",
      "Styr motstander til siden",
      "Vinn returer og hold ballen"
    ],
    "counter": "Sender en ekstra løper mellom leddene",
    "response": "Flytt sekser mot løper og behold kontringsutgang",
    "responsePlanId": "midfield_press_trap",
    "counterCondition": {
      "trait": "possessionControl",
      "min": 81
    },
    "phase": "out_of_possession",
    "principleSourceIds": [
      "fifaBlock",
      "faPrinciples"
    ],
    "mechanism": "Laget reduserer avstander, styrer spillet bredt og gjenvinner løse baller uten å bryte form.",
    "counterLogic": "En rettvendt fri mann mellom leddene kan trekke ut stopper og åpne neste rom.",
    "failureMode": "Å senke blokken garanterer ikke færre sjanser; press uten utgang gir vedvarende angrepsbølger imot.",
    "observation": "Se avstand mellom midtbane og forsvar samt tilgjengelig pasningsutgang etter klarering."
  },
  {
    "tacticId": "chase_the_equaliser",
    "title": "Koordinert slutttrykk",
    "opponentCondition": {
      "trait": "defensiveCompactness",
      "min": 64
    },
    "requires": {
      "pressScore": 65,
      "widthScore": 63,
      "depthScore": 59
    },
    "moves": [
      "Løft hele pressleddet sammen",
      "Steng første kant med back og ving",
      "Vend raskt til motsatt side",
      "Angrip boks med spiss og indreløper"
    ],
    "counter": "Kontrer mot to høye backer",
    "response": "Hold sekser igjen og send én back frem",
    "responsePlanId": "positional_overloads",
    "counterCondition": {
      "trait": "transitionThreat",
      "min": 79
    },
    "phase": "transition_defend",
    "principleSourceIds": [
      "fifaPress",
      "faBehind"
    ],
    "mechanism": "Høyt lagpress reduserer motstanderens ro, sideskifte frigjør rom og flere spillere angriper neste boks.",
    "counterLogic": "En presis kontring bak begge høye backer kan snu sluttpresset til en stor sjanse imot.",
    "failureMode": "Press som ikke omfatter sikringsleddet kan være mer risikabelt enn å beholde balansen.",
    "observation": "Se når laget forlater sikringsposisjon og hvilke fremoverspill motstanderen får."
  },
  {
    "tacticId": "slow_it_down",
    "title": "Rytmebrudd og trygg vending",
    "opponentCondition": {
      "trait": "pressIntensity",
      "min": 68
    },
    "requires": {
      "buildUpScore": 67,
      "balanceScore": 64
    },
    "moves": [
      "Gi ballfører to støttelinjer",
      "Lokke motstanderpresset frem",
      "Vend via keeper og sekser",
      "Behold ballen bak presset"
    ],
    "counter": "Mannmarker begge pasningsstøtter",
    "response": "Søk tredjemann lengre frem",
    "responsePlanId": "positional_overloads",
    "counterCondition": {
      "trait": "defensiveCompactness",
      "min": 80
    },
    "phase": "in_possession",
    "principleSourceIds": [
      "fifaEscape",
      "faPrinciples"
    ],
    "mechanism": "To støttelinjer og keeper gir en trygg vei forbi et aggressivt press, så laget kan eie neste fase.",
    "counterLogic": "Koordinert press som dekker begge returer kan tvinge feilpasning i eget område.",
    "failureMode": "Lavt tempo uten frie mottakere betyr ikke kontroll; det gir motstanderpresset tid.",
    "observation": "Se om ballfører har mer enn én reell pasningsvei når presset setter inn, også når begge de nærmeste støttene presses."
  },
  {
    "tacticId": "all_out_attack",
    "title": "Risiko med kontrollert retur",
    "opponentCondition": {
      "trait": "defensiveCompactness",
      "min": 64
    },
    "requires": {
      "pressScore": 69,
      "widthScore": 67,
      "depthScore": 63
    },
    "moves": [
      "Press kollektivt svært høyt",
      "Hold én back bred og én som sikring",
      "Spill tidlig til fri kanal",
      "Fyll boks og sikre returen"
    ],
    "counter": "Spiller lang kontring bak fremste ledd",
    "response": "Trekk sekser ned eller senk presset",
    "responsePlanId": "chase_the_equaliser",
    "counterCondition": {
      "trait": "transitionThreat",
      "min": 75
    },
    "phase": "transition_defend",
    "principleSourceIds": [
      "fifaPress",
      "fifaCounter"
    ],
    "mechanism": "Fremre ledd presser samlet, bredde skaper flere pasningsvalg og én sekser forsøker å sikre returen.",
    "counterLogic": "En rettvendt mottaker som finner løpet bak høyt forsvar kan utnytte store overgangsrom.",
    "failureMode": "Alle fremme uten støtte gir høyere risiko og garanterer ikke flere gode avslutninger.",
    "observation": "Se hvem som er bak ballen når kant eller spiss mister den, og hvem som kan forsinke motstanderens første fremoverpasning."
  }
]);



const finite = (x) => typeof x === "number" && Number.isFinite(x);
const matches = (traits, condition) => finite(traits?.[condition.trait]) &&
  traits[condition.trait] >= condition.min;

// Never treat the four moves as four free independent bonuses. A complete
// chain has at most one modest match advantage; a response can neutralize it.
export function evaluateTacticalSequences(tacticId, opponent, tacticalProfile) {
  if (!opponent?.styleTraits || !tacticalProfile) return [];
  // Some defensive qualities (pressResistance/defensiveStructure) are top-level
  // on the historical profile; tactical style traits are nested.
  const strengths = { ...opponent, ...opponent.styleTraits };
  return TACTICAL_SEQUENCES.filter((pattern) => pattern.tacticId === tacticId &&
    matches(strengths, pattern.opponentCondition))
    .map((pattern) => {
      const missing = Object.entries(pattern.requires)
        .filter(([metric, threshold]) => !finite(tacticalProfile[metric]) ||
          tacticalProfile[metric] < threshold)
        .map(([metric, minimum]) => ({ metric, minimum,
          actual: finite(tacticalProfile[metric]) ? tacticalProfile[metric] : null }));
      const ready = missing.length === 0;
      const unknownTeam = missing.some((item) => item.actual === null);
      // A below-threshold confirmed metric is a tactical weakness; a missing
      // metric is unscouted team context, not proof the player's role is weak.
      // An unknown opponent countermeasure is NOT proof that it is absent.
      // Do not award a tactical advantage until both the vulnerability and
      // the relevant opponent response are actually represented in the profile.
      const counterKnown = finite(strengths[pattern.counterCondition.trait]);
      const traitCountered = ready && counterKnown && matches(strengths, pattern.counterCondition);
      // In-match collective lane coverage or rest-defence is more specific
      // evidence than a static opposition trait. No shape => legacy result.
      // A known authored offensive exit and an explicit live observation
      // represent the same press-bypass mechanism. Never infer an exit from
      // defensive wideShift or from missing scouting. The more specific
      // observed "isolated" signal overrides an authored route.
      const pressExit = ["high_press_343", "midfield_press_trap", "counter_press_recovery"]
        .includes(pattern.tacticId)
        ? resolvePressEscapeEvidence(opponent?.tacticalBehaviour) : null;
      const liveOpponent = pressExit ? {
        ...opponent,
        tacticalBehaviour: { ...opponent.tacticalBehaviour, pressEscape: pressExit }
      } : opponent;
      const liveExchange = ready ? evaluateLiveTacticalExchange(pattern, liveOpponent) : null;
      const counterEvidenceKnown = counterKnown || Boolean(liveExchange);
      const countered = liveExchange ? liveExchange.status === "countered" : traitCountered;
      return { id: pattern.tacticId, title: pattern.title, phase: pattern.phase,
        moves: pattern.moves.slice(), counter: pattern.counter,
        response: pattern.response, missing, ready, countered, liveExchange,
        status: unknownTeam ? "unknown_team"
          : !ready ? "unsupported"
          : !counterEvidenceKnown ? "unknown_counter"
          : countered ? "countered" : "advantage",
        edgeDelta: ready && counterEvidenceKnown && !countered ? 1 : 0 };
    });
}
