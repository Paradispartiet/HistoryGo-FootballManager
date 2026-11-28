// Fotballboka training methodology: pedagogical explanations anchored to the existing manager learning and training contracts. No added effects or manual exercise builder.
export const TRAINING_CHAPTERS = [
  {
    "id": "training_problem",
    "title": "Fra kampanalyse til treningsmål",
    "principles": [
      "guided_discovery_makes_training_stick",
      "football_history_explains_formations",
      "confidence_is_built_by_clear_tasks"
    ],
    "clubs": [
      "brann",
      "tromso"
    ],
    "concept": "Start med en gjentakende, konkret kampatferd, ikke et generelt ønske om å bli bedre. Hvis første pressledd brytes, må treneren undersøke om ballfører fikk for mye tid, om andre forsvarer kom for sent, eller om sikringen bak var for svak. Hvert problem krever en annen øvelse. Formuler ett observerbart mål før økta, for eksempel at neste pasningsalternativ blir stengt samtidig med førsteforsvaret. Originalmanusets kampanalyse gir ni observasjonspunkter: ballbesittelse, støtte, kommunikasjon, forsinkelse i forsvar, gjennombrudd, konsentrering i forsvar, bredde i angrep, bevegelse i angrep og balanse i forsvar. Vurder for eksempel om laget tar unødvendig risiko i vanlig pasningsspill, om mottakeren har støtte, og om forsvareren forsinker når sikringen mangler. Motstanderanalysen spør blant annet om backenes offensive løp, spillere foran ballen, spill på fot eller i rom, presshøyde og gjenvinning kontra fall i ramme. Bruk punktene som observasjonsramme, ikke som nye statistikkfelt uten datagrunnlag.",
    "dilemma": "Et enkelt baklengsmål beviser ikke at taktikken var feil. En trener som skifter program etter hvert resultat, kan miste kontinuitet. Et problem bør prioriteres når det har betydning for kampplanen og støttes av tilgjengelig informasjon; ukjente årsaker skal forbli ukjente.",
    "manager": "Velg et eksisterende kontekstrangert treningsprogram og et ukefokus. Spillet foreslår fire økter i programmet. Etter kampen sammenlignes registrert taktisk signal og treningsrapport med den opprinnelige intensjonen. Ikke anta at en øvelse virket bare fordi laget vant.",
    "practice": "Ta et eksempel på brutt press. Beskriv én mulig årsak, velg en 4 mot 4-øvelse og ett observasjonsspørsmål. Evaluer neste repetisjon før du endrer mer enn én ting.",
    "engineRefs": [
      {
        "file": "src/football-training-week.js",
        "symbol": "recommendTrainingFocus"
      },
      {
        "file": "src/football-training-week.js",
        "symbol": "evaluateTrainingDecisionSupport"
      }
    ],
    "diagrams": [
      {
        "kind": "flow",
        "title": "Læringssløyfen",
        "note": "Kampens registrerte signal gir et spørsmål til neste uke; resultatet alene er ikke fasit.",
        "start": "Kampobservasjon",
        "decision": "Finn et testbart treningsmål",
        "branches": [
          "Økt → ny kamp → vurder samme signal",
          "Uklart signal → samle mer informasjon"
        ]
      }
    ],
    "sourceDetails": [
      {
        "id": "analysis_before_after",
        "title": "Før og etter kamp – avtal arbeidsoppgaver og evaluer",
        "text": "Originalmanuset begynner kampanalysen med å gi spillerne arbeidsoppgaver før kamp og evaluere dem etterpå. Under overskriften «Seks prinsipper» følger faktisk ni nummererte observasjonspunkter; alle ni er beholdt her. Bruk dem til å undersøke hvordan laget gjennomfører den avtalte spillmodellen, ikke bare resultatet. Den separate delen 5.1 Kampforberedelse har ingen utfylt tekst, og 5.2 Arbeidsoppgaver viser til et eget dokument. Det betyr at manuset ikke alene gir en full kampforberedelsesprosedyre.",
        "source": "Fotballdokumentet v1.pdf – 6. Kapmpanalyse / 5.1 Kampforberedelse / 5.2 Arbeidsoppgaver, linje 3917–3920 og 3988–3992"
      },
      {
        "id": "analysis_01_possession",
        "title": "1. Possession – ballbesittelse og risiko",
        "text": "Vurder hvor ofte laget mister ballen fordi det tar unødvendig store sjanser i vanlig pasningsspill. Manuset tillater en større feilprosent ved skudd, gjennombruddspasninger og dribleforsøk, der hensikten er å skape en avgjørende fordel. Undersøk også hvor godt laget arbeider for å vinne tilbake ballbesittelsen. Skill derfor mellom risikofylte valg med tydelig formål og balltap som ikke skaper tilsvarende mulighet.",
        "source": "Fotballdokumentet v1.pdf – 6. Kapmpanalyse – 1 Possession"
      },
      {
        "id": "analysis_02_support",
        "title": "2. Støtte – spillbarhet rundt og bak ballfører",
        "text": "Manusets to spørsmål er om spillerne løper for å komme i god pasningsposisjon, og om de kommer i støtte bak ballfører. Se på bevegelsene før mottaket og på alternativene når ballfører kommer under press. En praktisk observasjon er om den neste pasningen faktisk er tilgjengelig, ikke bare om en medspiller står i nærheten.",
        "source": "Fotballdokumentet v1.pdf – 6. Kapmpanalyse – 2 Støtte"
      },
      {
        "id": "analysis_03_communication",
        "title": "3. Kommunikasjon – felles beskjeder",
        "text": "Manuset anbefaler få beskjeder samtidig og at laget øver på de samme korte uttrykkene, eksempelvis «Kommer», «Støtte», «Dribl» og «Skyt». Vurder om spillerne bruker den avtalte ordlisten i situasjoner der en medspiller kan handle på beskjeden. Utfyllende fotballspråk og kommunikativ timing finnes i bokas samhandlings- og coachingkapitler.",
        "source": "Fotballdokumentet v1.pdf – 6. Kapmpanalyse – 3 Kommunikasjon"
      },
      {
        "id": "analysis_04_delay",
        "title": "4. Forsinkelse i forsvar – ikke selg deg",
        "text": "Originalmanusets kontrollpunkt er at forsvarerne ikke selger seg. Sett dette i sammenheng med de tidligere avsnittene om førsteforsvar: uten sikring skal forsvareren kunne oppholde og forsinke angriperen. Observer om laget kjøper tid til å gjenopprette balanse, eller om et overilt støt åpner et rom som neste forsvarer må dekke.",
        "source": "Fotballdokumentet v1.pdf – 6. Kapmpanalyse – 4 Forsinkelse i forsvar / 2. Defensivt – Forsink"
      },
      {
        "id": "analysis_05_penetration",
        "title": "5. Gjennombrudd – gjennombruddshissighet og taktisk justering",
        "text": "Manuset spør «Går det framover?» og bruker gjennombruddshissighet om hvor ofte laget spiller ballen fremover i angrep. Begrepet er beholdt, uten å gjøre det til en ny statistikk. Ved gjentatte mislykkede driblinger på kant foreslår manuset en konkret justering: legg oftere igjen ballen, spill flere pasninger og gå deretter på bakromsløp. Det er et alternativ til å fortsette å utfordre én mot én uavhengig av kampbildet.",
        "source": "Fotballdokumentet v1.pdf – 6. Kapmpanalyse – 5 Gjennombrudd"
      },
      {
        "id": "analysis_06_concentration",
        "title": "6. Konsentrering i forsvar",
        "text": "Manuset navngir konsentrering i forsvar uten utdyping i den nummererte listen. I den tidligere forsvarsdelen beskriver det korte avstander, samlet sideforskyvning og beskyttelse av farlige rom. En redaksjonell observasjon til dette punktet er derfor: følger leddene etter når presset flyttes, og åpnes det rom mellom spillerne når én støter? Vurder situasjonen i forhold til presset på ballfører.",
        "source": "Fotballdokumentet v1.pdf – 6. Kapmpanalyse – 6 Konsentrering i forsvar / 2. Defensivt – Komprimering/Sideforskyvning"
      },
      {
        "id": "analysis_07_width",
        "title": "7. Bredde i angrep",
        "text": "Bredde er et eget analysepunkt uten nærmere spørsmål i den nummererte listen. Manusets angrepsdel utdyper hvordan laget bruker kantene for å åpne sentrale rom, og hvordan bredden må gjenskapes etter at spillerne trekker inn. Som praktisk kontroll kan treneren observere om laget fortsatt har et bredt alternativ når spillet klumper seg, og om det faktisk kan flytte ballen fra trangt til ledig.",
        "source": "Fotballdokumentet v1.pdf – 6. Kapmpanalyse – 7 Bredde i angrep / Etablert angrep"
      },
      {
        "id": "analysis_08_movement",
        "title": "8. Bevegelse i angrep",
        "text": "Manuset beskriver tre typer bevegelse: spissene tar førsteangrepsløp, midtbanen tar dybdeløp inn i feltet, og backene kommer på overlapp. Forsvaret skal pushe etter slik at laget ikke blir strukket. Vurder om løpene er samordnet, om en spiller kan motta ballen i riktig øyeblikk, og om løpene skaper rom for andre. Det avgjørende er relasjonen mellom bevegelsene, ikke bare antallet løp.",
        "source": "Fotballdokumentet v1.pdf – 6. Kapmpanalyse – 8 Bevegelse i angrep"
      },
      {
        "id": "analysis_09_balance",
        "title": "9. Balanse i forsvar",
        "text": "Den nummererte listen angir balanse som niende prinsipp. Den tidligere forsvarsdelen skiller mellom numerisk balanse og posisjonell balanse: nok spillere og riktig dekning av farlige rom, med press og sikring. Som praktisk kontroll kan treneren se om midtbanen dekker gjennomløp når stopperne markerer, og om laget kan gjenvinne eller må falle i ramme etter balltap. Tall alene sier ikke om laget faktisk er i balanse.",
        "source": "Fotballdokumentet v1.pdf – 6. Kapmpanalyse – 9 Balanse i forsvar / 2. Defensivt – Risiko og balanse"
      },
      {
        "id": "opponent_attack",
        "title": "Motstanderanalyse – angrepsrisiko, oppbygging og gjennombruddsvalg",
        "text": "Manuset spør etter «et lags sjel»: hvor ofte går backene frem, hvor mange spillere sendes foran ballen og hvor mange holder igjen? Bruker motstanderen alle kontringsmuligheter eller bare overtall? Spiller laget possession eller mer direkte, kombinerer det seg gjennom eller spiller det langt? Bygger det opp gjennom forsvaret, søker det rundt med innlegg eller gjennom midten, og spiller det på fot eller i rom? Kort oppbygging nevnes som en mulig anledning til å erobre ball på motstanderens halvdel. Spørsmålene beskriver tendenser, ikke sikre fremtidige valg.",
        "source": "Fotballdokumentet v1.pdf – 6. Kapmpanalyse – Hvordan identifisere motsanders karakteristika"
      },
      {
        "id": "opponent_defence",
        "title": "Motstanderanalyse – press, markering og formasjonsendringer",
        "text": "Undersøk om motstanderen prioriterer gjenvinning eller å komme på rett side og falle i ramme. Presser den høyt eller lavt? Forsvarer den sone- eller markeringsorientert? Prioriterer den å nekte rom, snappe ballen eller presse aggressivt og takle? Hvem løper mest, hvem mister ballen mest, og henger laget sammen formasjonsmessig? Manuset fremhever at formasjonen endres med spillfase og ballens plassering. Se derfor på banen og rommet rundt ballen, ikke bare på ballfører. Formasjonsnavnet alene forteller ikke hvordan laget opptrer.",
        "source": "Fotballdokumentet v1.pdf – 6. Kapmpanalyse – Hvordan identifisere motsanders karakteristika / Formasjonen"
      },
      {
        "id": "onenote_data_analysis",
        "title": "Dataanalyse – romkontroll, pasningsnettverk og expected threat",
        "text": "OneNote-utkastet nevner GPS-sporing, videodata og AI-analyse sammen med spatial control, passing networks og expected threat (xT). Det setter slike analyseverktøy opp mot spillerens beslutninger i selve kampen. Dette er et nytt kildepunkt sammenlignet med PDF-ens ni analyseprinsipper. Råteksten gir imidlertid ingen fullstendige definisjoner, beregningsmetoder eller datakrav. Derfor er dette en introduksjon til manusets analysetemaer, ikke en ny xT-implementering eller en påstand om hvilke algoritmer navngitte klubber bruker. Eksisterende kampmotor og datamodell beholdes.",
        "source": "OneNote – Fotballteori (Den 12.06.2026).one, råuttrekk 0x00035824 og 0x00035f9c"
      }
    ]
  },
  {
    "id": "exercise_constraints",
    "title": "Øvelsesdesign – rom, antall, retning og touch",
    "principles": [
      "guided_discovery_makes_training_stick",
      "technical_skill_must_survive_pressure"
    ],
    "clubs": [
      "bodo_glimt",
      "stabak",
      "viking"
    ],
    "concept": "Øvelsens rammer bestemmer hvilke beslutninger som gjentas. Et lite område øker ofte tidspresset; et større område kan gi mer plass til lengre løp. Overtall med ball gir flere støttevinkler, mens undertall kan utfordre orientering og valg. Retning mot mål gjør progresjon relevant. En touchbegrensning kan fremme orientering før mottak, men også fjerne dribling og ballføring som var øktens egentlige mål.",
    "dilemma": "En øvelse som er for lett gir mange vellykkede repetisjoner uten at kampens problem oppstår. En øvelse som er for vanskelig gir få meningsfulle beslutninger. Endre bare én ramme om gangen slik at du kan vurdere hva den faktisk påvirket.",
    "manager": "Spillets øvelsesdesign kan forklare areal, spillerbalanse, retning og touch. I dagens aktive ligaflyt får manageren én situasjonstilpasset øvelse per programøkt, ikke en plikt til å bygge øvelsen manuelt. Forklaringslaget gir ikke ekstra treningsbonus.",
    "practice": "Organiser 4 mot 3 med målsoner. Kjør først frie touch, deretter maks to touch; hold arealet likt. Se om mottakeren orienterer seg tidligere, og om begrensningen hindrer nødvendige driblinger.",
    "engineRefs": [
      {
        "file": "src/football-training-exercise-design.js",
        "symbol": "evaluateTrainingExerciseDesign"
      },
      {
        "file": "src/football-training-exercise-design.js",
        "symbol": "createTrainingExerciseHypothesis"
      }
    ],
    "diagrams": [
      {
        "kind": "pitch",
        "title": "Overtall med tre støttevinkler",
        "note": "Fire blå mot tre lyse. Ballfører har flere mulige pasninger, men må lese pressretningen og finne neste målrom.",
        "players": [
          [
            20,
            50,
            "Ballfører",
            "a"
          ],
          [
            39,
            18,
            "Støtte",
            "a"
          ],
          [
            42,
            82,
            "Støtte",
            "a"
          ],
          [
            76,
            50,
            "Målspiller",
            "a"
          ],
          [
            35,
            50,
            "Press",
            "d"
          ],
          [
            57,
            30,
            "Sikring",
            "d"
          ],
          [
            57,
            70,
            "Sikring",
            "d"
          ]
        ],
        "arrows": [
          [
            20,
            50,
            39,
            18
          ],
          [
            20,
            50,
            42,
            82
          ],
          [
            39,
            18,
            76,
            50
          ]
        ]
      },
      {
        "kind": "flow",
        "title": "Endre én ramme",
        "note": "En øvelse er et læringsforsøk, ikke en garanti for bedre kampresultat.",
        "start": "Velg fotballproblemet",
        "decision": "Hva må bli lettere eller vanskeligere?",
        "branches": [
          "Endre areal eller antall → observer avstandene",
          "Endre retning eller touch → observer valgene"
        ]
      }
    ],
    "sourceDetails": [
      {
        "id": "constraints_led",
        "title": "Constraints-Led Approach – utform problemet",
        "text": "I manusets beskrivelse formes ferdighetene ved å endre betingelsene: banestørrelse, antall spillere og regler. Spilleren må tilpasse seg og oppdage løsninger fremfor å få alle bevegelser instruert direkte. I en liten én-mot-én-bane må angriperen for eksempel velge finte ut fra forsvarerens kroppsstilling. En elastico eller et oversteg får først fotballfaglig verdi når situasjonen gjør finten hensiktsmessig. Variasjon i fart, rom og press er sentralt i manusets fremstilling av motorisk læring.",
        "source": "Fotballdokumentet v1.pdf – 3.0 Trening og øvelser – Finter og 1v1 / 3.4 Pedagogiske modeller / Sportsvitenskapelige perspektiver"
      },
      {
        "id": "rondo_practice",
        "title": "Firkantspill – presisjon, orientering og veggspill",
        "text": "Originaløvelsen har fire eller fem spillere rundt et kvadrat og én eller to presspillere i midten. Ballen holdes i laget med maksimalt to berøringer. Hensikten er pasnings- og mottakspresisjon, orientering før mottak og samarbeid. En mer avansert variant bruker en liten flate med krav om pasning i fart eller veggspill, slik at kroppsstilling og timing får betydning. Manuset angir ikke eksakte banemål, varighet eller belastningsdosering for øvelsen.",
        "source": "Fotballdokumentet v1.pdf – 3.0 Trening og øvelser – Pasningsøvelser"
      },
      {
        "id": "duel_practice",
        "title": "Én mot én – velg finte etter forsvarerens kroppsstilling",
        "text": "Bruk små baner med reell motstander. Målet er ikke bare å lære flere finter, men å lese situasjonen og velge den teknikken som passer. Spilleren vurderer forsvarerens kroppsstilling, ubalanse og åpne rom. Manuset fremhever 1v1 med fokus på kroppsstilling som praktisk trening i finter og driblinger. Det er ikke angitt bestemte banemål, antall repetisjoner eller poengregler.",
        "source": "Fotballdokumentet v1.pdf – 3.0 Trening og øvelser – Finter og 1v1-situasjoner / 3.4 Fotballfaglige og praktiske implikasjoner"
      },
      {
        "id": "scanning_practice",
        "title": "Orienteringsøvelse – registrer før mottak",
        "text": "Manuset beskriver en øvelse der spilleren får ballen i en trang situasjon, men før mottaket må se bak seg og si høyt hvilken farge, figur eller hvilket nummer som vises. Hensikten er å knytte persepsjon til teknikk og raske valg under press. I en annen manusvariant signaliserer treneren, og spilleren beskriver hvor spillerne og rommet innenfor ti meter er. Bruk de registrerte opplysningene til å forstå hva spilleren faktisk så; øvelsen er ikke et nytt målt scanningstall i kampmotoren.",
        "source": "Fotballdokumentet v1.pdf – 3.0 Orientering og scanning / 3.2 Persepsjon – Trenerøvelse"
      },
      {
        "id": "restriction_practice",
        "title": "Småspill med restriksjoner – teknisk fleksibilitet",
        "text": "Manusets konkrete restriksjoner er å spille bare med utsiden av foten, med ett touch eller med krav om vending før pasning. Begrensningene skal skape variasjon og få spillerne til å finne nye løsninger. Smålagsspill trekkes frem som en arena for flere ballberøringer, scanning og teknikk i fart. Vurder restriksjonen mot øvelsens formål: dersom den fjerner handlingsalternativet som skal trenes, må treneren tilpasse den. Det siste er en redaksjonell kobling til bokas eksisterende øvelsesdesign.",
        "source": "Fotballdokumentet v1.pdf – 3.0 Ballkontroll og restriksjoner / 3.4 Fotballfaglige og praktiske implikasjoner"
      },
      {
        "id": "phys_play_snipp",
        "title": "Hurtighetslek – snipp og snapp",
        "text": "To grupper står parvis mot hverandre langs en midtlinje, med hver sin mållinje bak seg. Ved signalet Snipp løper Snipp-gruppen mot sin linje, mens Snapp forsøker å ta igjen partneren. Ved Snapp byttes rollene. Bruk atskilte løpskorridorer og god plass til å stoppe etter mållinjen. Kontakt skal være lett berøring, aldri dytt eller takling; en kontaktfri variant bruker passering av mållinjen. Varier startstilling og signal etter nivå. Hensikten er reaksjon og akselerasjon, med rolig retur og nok pause for god kvalitet. Dette er en sikkerhetstilpasset variant inspirert av Aktivitetsbanken, ikke en gjenfunnet ordrett oppskrift fra originalmanuset.",
        "source": "Faglig tillegg – Aktivitetsbanken – Snipp og Snapp, https://aktivitetsbanken.no/basis/ovelser/snipp-og-snapp-1/"
      },
      {
        "id": "phys_play_soldat",
        "title": "Hurtighetslek – soldat og røver (ny variant)",
        "text": "Redaksjonell kontaktfri variant inspirert av originalens navn: to spillere starter i parallelle korridorer. Røveren velger ved startsignal én av to markerte utganger i sin korridor; soldaten reagerer og forsøker å nå tilsvarende mållinje i sin korridor før røveren. Bytt roller etter hvert løp. Hold løpsretninger atskilt, bruk flatt underlag og gi nok bremselengde. Ingen fysisk fastholding eller takling. Øv på å registrere bevegelsen og akselerere i valgt retning. Tilpass avstanden etter alder, nivå og plass. Dette er en ny øvelsesidé, ikke dokumentasjon av manusets opprinnelige regler.",
        "source": "Faglig tillegg – Redaksjonelt øvelsesforslag; navn fra Fotballdokumentet v1.pdf – 6. Fysiologi"
      },
      {
        "id": "phys_play_number",
        "title": "Hurtighetslek – nummerkappløp (ny variant)",
        "text": "Redaksjonell variant: del spillerne i to lag med egne parallelle løpsbaner og gi hver spiller et nummer. Når treneren roper et nummer, løper spilleren med det nummeret på hvert lag til en mållinje. Gi poeng for å krysse linjen først med kontrollert løp, og la alle få tilsvarende muligheter. Bruk en egen bremsesone og gå rolig tilbake utenfor løpsbanene. Varier signal og startstilling når spillerne behersker grunnformen. Treneren kan legge til en enkel balloppgave før startsignalet, men bør ikke introdusere mange oppgaver på en gang. Ny variant, ikke gjenfunnet originalbeskrivelse.",
        "source": "Faglig tillegg – Redaksjonelt øvelsesforslag; navn fra Fotballdokumentet v1.pdf – 6. Fysiologi"
      },
      {
        "id": "phys_play_pair",
        "title": "Hurtighetslek – hest og kjerre (ny kontaktfri variant)",
        "text": "Redaksjonell variant uten trekkutstyr eller bæring: spillerne er par i parallelle løpskorridorer. Hesten leder et kort løp med kontrollert temposkifte, mens kjerra forsøker å tilpasse farten og holde samme nivå sideveis. Etter mållinjen bremses rolig; bytt leder. Ingen holder fast i partneren, bruker tau eller bærer en annen spiller. Hensikten er å oppfatte medspillerens fart og samordne egen akselerasjon. Kan gjennomføres med moderate hastigheter før intensiteten økes, tilpasset nivå og underlag. Navnet kommer fra manusets disposisjon, men reglene er et nytt redaksjonelt forslag.",
        "source": "Faglig tillegg – Redaksjonelt øvelsesforslag; navn fra Fotballdokumentet v1.pdf – 6. Fysiologi"
      },
      {
        "id": "mental_pressure_practice",
        "title": "Øvelse – beslutning under gradvis økende press",
        "text": "Redaksjonelt eksempel: spill et retningsbestemt 4 mot 4-spill der laget skal spille seg gjennom en målport. Første runde spilles med vanlige regler. Andre runde får spillerne kortere tid til å starte på nytt etter balltap, slik at omstillingen blir mer krevende. Avtal på forhånd ett handlingssignal, for eksempel neste pasning eller sikre. Etter runden spør treneren hva som endret seg i oppmerksomhet og beslutning, og om signalet hjalp. Juster presset gradvis; unngå ydmykelse, straff og kunstig høy risiko. Dette er en ny øvelse inspirert av forskning om prestasjon under press, ikke et validert testopplegg.",
        "source": "Faglig tillegg – Performance Under Pressure in Sport: A Position Statement from Exercise and Sports Science Australia (2026), https://pmc.ncbi.nlm.nih.gov/articles/PMC13457279/ | The effectiveness of pre-performance routines in sports: a meta-analysis (2021), https://doi.org/10.1080/1750984X.2021.1944271"
      },
      {
        "id": "mental_reset_practice",
        "title": "Øvelse – neste handling etter feil",
        "text": "Redaksjonell øvelse i smålagsspill: ved balltap skal spilleren først registrere om gjenvinning er realistisk. Hvis ja, etabler press sammen med nærmeste medspillere; hvis nei, gjenopprett balanse. Medspillere bruker korte informative beskjeder fremfor skyldkommentarer. Treneren observerer responsen etter feil, ikke bare hvor ofte ballen vinnes tilbake. Etter økten velger hver spiller én situasjon der han kom raskt videre og én situasjon han vil løse annerledes. Ingen ekstra fysisk straff for feil. Øvelsen kombinerer manusets rekalibrering med prosessmål og kort indre dialog, og er et nytt pedagogisk opplegg.",
        "source": "Faglig tillegg – The performance and psychological effects of goal setting in sport: a systematic review and meta-analysis (2022), https://doi.org/10.1080/1750984X.2022.2116723 | Hatzigeorgiadis mfl. (2011), Self-Talk and Sports Performance: A Meta-Analysis, https://doi.org/10.1177/1745691611413136"
      },
      {
        "id": "culture_material_conditions",
        "title": "Materielle forhold – bane, ball og treningsmetoder",
        "text": "Manuset fremhever at underlag, balltype og organisert trening påvirker teknikk og kollektiv samhandling. Ujevne baner kan gjøre korte pasninger vanskeligere; jevnere flater kan gi bedre betingelser for presise kombinasjoner. Videoanalyse, oppvarming og systematiske taktiske økter beskrives som verktøy for utvikling av kollektiv organisering. Den detaljerte historiske dateringen og påstanden om lettere baller er ikke selvstendig kontrollert. Hovedpoenget bevares: øvelser og spillestil må forstås i lys av de materielle mulighetene. Dette er ikke nye simulerte bane- eller utstyrsbonuser.",
        "source": "Fotballdokumentet v1.pdf – Del I – Banekvalitet og materielle forhold / Teknologi, banekvalitet og treningsmetoder"
      },
      {
        "id": "onenote_cone_gate",
        "title": "Pasningsøvelse – kjegleport og returbevegelse",
        "text": "Trenernotatet beskriver to kjegler som danner en port for pasningen, en linje som spilleren må bevege seg mellom for å hente ballen, to lag og store kjegler. Notatet angir ikke avstander, poengberegning eller antall spillere. Bruk oppsettet som en uferdig øvelsesidé: treneren velger avstand og organiserer henting slik at pasningsbanen er fri. En tilhørende notis oppfordrer spillerne til å registrere hvor de treffer ballen, og til å trene mellomlange pasninger. Øvelsens fullstendige regler må avklares; den får ikke en ny øvelses-ID i denne integrasjonen.",
        "source": "OneNote – Fotballnotater (Den 16.05.2026).one, råuttrekk 0x0000573c og 0x00005834"
      },
      {
        "id": "onenote_waiting_groups",
        "title": "Organisering av økten – aktiv ventetid",
        "text": "Et praktisk notat foreslår at hjelpetrenere holder telling og organiserer en skuddkonkurranse for spillerne som venter. Det sier også at det kan avtales spesialtrening, mens andre kan arbeide med andre oppgaver. Dette er organisatoriske ideer, ikke en ferdig øktplan. Treneren må sørge for at sideaktiviteten ikke kommer i konflikt med hovedøvelsen, og at ansvaret for organisering er tydelig. Notatets personnavn og praktiske meldingsdetaljer er utelatt.",
        "source": "OneNote – Fotballnotater (Den 16.05.2026).one, råuttrekk 0x00005ae4, 0x00005bac og 0x000daf3c"
      },
      {
        "id": "method_seirullo",
        "title": "Paco Seirul·lo – strukturert trening og preferensielle simuleringssituasjoner",
        "text": "Barcelonas metodiske fremstilling av strukturert trening beskriver hvordan oppgaver kan utformes med utgangspunkt i spillets konkrete situasjoner og samtidig vektlegge en bestemt del av spillerens utvikling. Begrepet preferensielle simuleringssituasjoner viser til at én type utfordring prioriteres uten å isoleres helt fra resten av spillet. For eksempel kan et retningsbestemt spill gjøre mottak under press til hovedtema samtidig som pasningsvalg, kroppsstilling, relasjoner og fysisk aktivitet inngår. Øvelsen må justeres hvis den ikke skaper situasjonene som skal trenes. Dette er bokas pedagogiske eksempel, ikke en rekonstruert Barcelona-økt. Strukturert trening kan også suppleres med særskilt fysisk arbeid; kampnær trening betyr ikke at alle individuelle øvelser er overflødige.",
        "source": "Faglig tillegg – Barça Innovation Hub, https://barcainnovationhub.fcbarcelona.com/blog/paco-seirul%C2%B7los-proposal-for-team-sports-training-structured-training-game-spaces-and-preferential-simulation-situations/ ; https://barcainnovationhub.fcbarcelona.com/blog/the-coadjuvant-training-methodology-used-by-fc-barcelona/ ; navn fra Fotballteori.one 0x001a3590"
      }
    ]
  },
  {
    "id": "coaching_transfer",
    "title": "Coaching, beslutning og overføring til kamp",
    "principles": [
      "guided_discovery_makes_training_stick",
      "short_commands_create_team_speed",
      "confidence_is_built_by_clear_tasks"
    ],
    "clubs": [
      "rosenborg",
      "valerenga",
      "brann"
    ],
    "concept": "Spillere lærer ikke bare en bevegelse, men å gjenkjenne når den skal brukes. Guidet oppdagelse lar treneren stille spørsmål om rom, press og støtte i realistiske situasjoner. Korte avtalte signaler kan hjelpe flere spillere å handle samtidig. Treneren kan demonstrere én løsning, la spillerne utforske alternativer og gi konkret tilbakemelding på beslutningen, ikke bare utfallet.",
    "dilemma": "For mange stopp og lange instrukser reduserer spilletid og muligheten til å oppfatte naturlige signaler. For lite veiledning kan la feil gjentas. Bruk korte stopp når årsaken er synlig, og gi tid til nye forsøk før du bedømmer endring.",
    "manager": "Læringsløkken viser intensjon, registrerte kampbevis og treningsdom hver for seg. Bruk kampens faktiske signaler for å vurdere ukefokus. Det er ikke en ny progresjonsmotor, og spillerne får ikke ekstra effekt bare fordi teoriteksten er lest.",
    "practice": "Spill 5 mot 5 med fokus på førsteforsvar og ettertrykk. Stopp én gang når avstanden åpnes, spør hvem som kunne skjermet neste pasning, og gjenta med ett avtalt signal.",
    "engineRefs": [
      {
        "file": "src/football-training-week.js",
        "symbol": "createTrainingMatchdaySnapshot"
      },
      {
        "file": "src/football-training-week.js",
        "symbol": "evaluateTrainingDecisionSupport"
      }
    ],
    "diagrams": [
      {
        "kind": "flow",
        "title": "Fra instruksjon til selvstendig valg",
        "note": "Treneren vurderer atferd og beslutning før ny instruksjon.",
        "start": "Spilleren møter et kampnært problem",
        "decision": "Kan spilleren forklare valget?",
        "branches": [
          "Ja → la ham prøve på nytt under press",
          "Nei → vis ett signal og gjenta situasjonen"
        ]
      }
    ],
    "sourceDetails": [
      {
        "id": "communication_purpose",
        "title": "Kommunikasjon – informasjon før oppmuntring og korrigering",
        "text": "Manuset setter informasjon først: vi prater for å hjelpe medspilleren til et mer utfyllende bilde av spillet. Ros kan gi en medspiller energi, og oppmuntring kan løfte laget; kjeft hjelper ifølge manusets trenerperspektiv sjelden. Skill mellom informasjon som hjelper neste handling og tilbakemelding som kommer etter handlingen. Kroppsspråk er også informasjon. Når alle snakker på en hensiktsmessig måte, kan laget få et lydbilde som hjelper spillerne å registrere hvor medspillerne befinner seg.",
        "source": "Fotballdokumentet v1.pdf – Kommunikasjon, linje 3654–3696"
      },
      {
        "id": "communication_timing",
        "title": "Kommunikativ timing og kampklima",
        "text": "Spilleren uten ball må signalisere i riktig øyeblikk. Ikke stress en medspiller som har havnet i problemer; skap først pasningsalternativer og gi beskjed når han har tid til å bruke den. Spillere som prater mye må også ta pauser, slik at praten ikke blir et uromoment. Manuset foreslår å trene på ro rett etter baklengsmål. Ved en 2–0-ledelse der laget er i ferd med å bli selvtilfreds, kan mer engasjert kommunikasjon brukes for å få laget på igjen. Dette er situasjonseksempler, ikke faste reaksjoner ved en bestemt stilling.",
        "source": "Fotballdokumentet v1.pdf – Kommunikasjon – kommunikativ timing / kampforløp, linje 3661–3682"
      },
      {
        "id": "feedback_culture",
        "title": "Tilbakemeldingskultur – kompis, ikke kjeft",
        "text": "Manuset anbefaler personlige tilbakemeldinger én til én fremfor kjeft. Bruk et vennlig kroppsspråk, øyekontakt og et uttrykk som viser at du har tro på medspilleren. Ikke skjell ut noen for en feilpasning de allerede vet at de har gjort. Gi positive tilbakemeldinger også under kamp. Ved lav innsats eller en vanskelig holdning: spør hva som er galt, om spilleren er sliten eller ønsker å bli byttet ut. Hvis ikke, kan du tydelig si at du forventer mer løpsarbeid. Gi konkrete tips om bevegelsesmønstre, posisjonering, kommunikasjon og taktikk.",
        "source": "Fotballdokumentet v1.pdf – Kommunikasjon – personlige tilbakemeldinger / kroppsspråk, linje 3670–3696"
      },
      {
        "id": "match_periodization",
        "title": "Kampstrategi – styring av kampdynamikken",
        "text": "Manuset foreslår å dele kampen inn i faser og bruke forskjellige strategiske prioriteringer. Høyt press og tidlig gjenvinning mot gjennombruddshissige lag er én treneridé i notatene. Ballbesittelse for å hvile etter hardt ballvinningspress er formulert som et spørsmål, ikke en ferdig konklusjon. Manuset uttrykker også et ønske om en intens kampstart og å diktere spillet. Den oppgitte prosentpåstanden om første mål er ikke verifisert og brukes ikke som grunnlag for strategien. Les periodiseringen i sammenheng med pressbølgene i forsvarskapitlet.",
        "source": "Fotballdokumentet v1.pdf – 5.3 Strategi, linje 3993–4010"
      },
      {
        "id": "match_balance_choices",
        "title": "Kampstrategi – avtal risiko og rollefordeling",
        "text": "Manuset stiller spørsmål om tre eller fire spillere bak ballen i angrep, og åtte eller ni i forsvar. Dette er alternative trenerbeslutninger, ikke ferdige krav. Ved få venstrebente beskriver det en mulig løsning med to høyrebente backer, der den høyre backen opptrer nesten som ving. Det foreslår også at en offensiv back brukes på siden med en kant som trekker inn. Vurder rollefordelingen og restforsvaret sammen; mer offensiv bredde på én side kan forutsette at andre holder igjen.",
        "source": "Fotballdokumentet v1.pdf – 5.3 Strategi – Bestem / Back og innoverving, linje 3998–4007"
      },
      {
        "id": "match_adjustments",
        "title": "Taktiske justeringer – les og påvirk motstanderens struktur",
        "text": "Manuset skiller mellom å tilpasse eget angrep til motstanderens defensive struktur og å forsøke å manipulere den. Trenerens oppgave på sidelinjen kan være å avkode forsvarsmønsteret og finne veier rundt eller forbi det. Mot etablert forsvar fremheves bredde. Mot en motstander som legger seg bakpå, beskrives en konkret løsning med tre bak og én sidestopper som går offensivt ut for å skape korridorbredde, utfordre eller spille bredt. Justeringen er et alternativ i manusets spillmodell; vurder om den passer kampens faktiske rom og lagets balanse.",
        "source": "Fotballdokumentet v1.pdf – 5.3 Strategi – Spillalternativer i.f.t. motstander, linje 4010–4027"
      },
      {
        "id": "play_practice",
        "title": "Deliberate play og deliberate practice",
        "text": "Manuset setter lekbasert læring, deliberate play, opp mot strukturert og målrettet trening, deliberate practice. Lek skal gi rom for kreativitet og intuisjon, mens målrettet trening arbeider med presisjon og spesifikke ferdigheter. Poenget er balansen: for mye drill kan hemme kreativitet, mens for lite struktur kan hindre progresjon. Jean Côté er nevnt i manusets fremstilling. Den konkrete litteraturhenvisningen er ikke kontrollert her, og det innføres ingen universell prosentfordeling mellom lek og struktur.",
        "source": "Fotballdokumentet v1.pdf – 3.4 Pedagogiske modeller / 2.7 Trenerens dilemma"
      },
      {
        "id": "guided_discovery",
        "title": "Guided discovery – spilleren finner løsningen",
        "text": "Trenerens rolle er i manuset å legge til rette for læring fremfor å gi alle svarene. Guidet oppdagelse skal hjelpe spilleren til selv å gjenkjenne rom, press og muligheter i kamp. Trenere står samtidig i et dilemma mellom kreativitet og kollektiv struktur: et overdrevent fokus på drill og riktige løsninger kan gjøre unge spillere redde for å ta sjanser, mens for mye frihet uten rammer kan svekke utvikling av presisjon. Bevar derfor begge hensynene når treneren velger øvelse og veiledning.",
        "source": "Fotballdokumentet v1.pdf – 3.4 Pedagogiske modeller / 2.7 Trenerens dilemma"
      },
      {
        "id": "contextual_technique",
        "title": "Kontekstualisert teknikk – fra showtriks til kampferdighet",
        "text": "Originalmanuset kritiserer overfokus på spektakulære triks. Å kunne mange finter isolert er ikke det samme som å kunne velge og utføre dem i høy fart, under press eller i samspill. Verdien av en pasning avhenger av timing, rom, motstander og medspiller. Selv en teknisk ren førsteberøring kan være lite hensiktsmessig hvis den leder inn i press. Manuset betrakter pasning, mottak og finte som samordning av beslutning, orientering og kroppslig utførelse i en meningsfull kampsituasjon.",
        "source": "Fotballdokumentet v1.pdf – 2.7 Overfokus på triks / Kontekstualisering av teknikk / 3.0 Spillnærhet og helhet"
      },
      {
        "id": "mental_reset",
        "title": "Mental omstilling – ikke dvele ved feil",
        "text": "Manusets omstillingsdel knytter mental reaksjon til en konkret arbeidsoppgave. Når motstanderen vinner ballen, må laget rekalibrere tankegangen og undersøke om ballen kan gjenvinnes. Spillerne skal ikke dvele ved feil; særlig spilleren som mistet ballen skal arbeide for å vinne den tilbake eller komme på rett side. Dette henger sammen med den kollektive gjenvinningsavtalen. Ved kommunikasjon skal medspilleren ikke skjelles ut for en feilpasning han allerede kjenner til; skap heller alternativer og hjelp når han kan bruke beskjeden.",
        "source": "Fotballdokumentet v1.pdf – 2. Defensivt – Omstilling / Gjenvinning, linje 1620–1657 / Kommunikasjon, linje 3675–3682"
      },
      {
        "id": "mental_match_climate",
        "title": "Stress, ro og kampklima",
        "text": "Kommunikasjonsdelen foreslår å trene på ro rett etter scoring imot, og mer engasjert kommunikasjon dersom laget leder 2–0 og blir selvtilfreds. Ikke stress spilleren som er i trøbbel; skap alternativer. Manusets 4-mot-2-kontring krever fart kombinert med ro til å slå riktig pasning. Dette er konkrete situasjonseksempler på å tilpasse intensitet og kommunikasjon, ikke en fast regel om hvordan alle spillere reagerer på stillingen. En egen stressmestrings- eller nerveøvelse er ennå ikke gjenfunnet.",
        "source": "Fotballdokumentet v1.pdf – Kommunikasjon, linje 3661–3682 / Kontringsmønstre – 4-mot-2 / 7. Det mentale aspektet"
      },
      {
        "id": "style_psychology",
        "title": "Spillets estetikk og psykologiske dimensjon",
        "text": "I manusets filosofidel beskrives estetisk spill som en mulig kilde til selvtillit, momentum og kreativitet når spilleren lykkes med en vakker bevegelse. Publikums begeistring kan også påvirke kampklimaet. På den andre siden beskrives en mer risikoreduserende og resultatorientert spillestil som en mulig kilde til trygghet og kontroll i avgjørende kamper. Dette gjengir manusets refleksjon om sammenhengen mellom spillestil og psykologi. Det er ikke lagt inn kausale effekter, psykologiske spillerverdier eller garantier for hvilken stil som gir best mental tilstand.",
        "source": "Fotballdokumentet v1.pdf – Del IV – Estetikk, kultur og filosofi / Psykologiske aspekter, linje 4421–4433"
      },
      {
        "id": "mental_arousal",
        "title": "Nerver, stress og spenningsregulering",
        "text": "Nervøsitet før kamp kan merkes som kroppslig aktivering, uro eller tanker om konsekvenser. Litt aktivering kan oppleves som energi, mens sterk uro kan trekke oppmerksomheten bort fra oppgaven. Det finnes ikke ett optimalt spenningsnivå for alle. Forbered konkrete første arbeidsoppgaver og la spilleren finne en enkel rutine: registrer spenningen, pust rolig uten å tvinge pusten, rett oppmerksomheten mot neste oppgave. En spiller trenger kanskje ro, en annen trenger mer aktivering. Øv i trening før bruk i kamp. Ved vedvarende psykiske plager, sterk prestasjonsangst eller problemer utenfor idretten bør treneren støtte kontakt med kvalifisert fagperson, ikke forsøke å behandle spilleren selv.",
        "source": "Faglig tillegg – Olympiatoppen – Idrettspsykologi, tjenester og fagområder, https://olympiatoppen.no/fagomrader/idrettspsykologi/tjenester/ | The effectiveness of pre-performance routines in sports: a meta-analysis (2021), https://doi.org/10.1080/1750984X.2021.1944271 | Performance Under Pressure in Sport: A Position Statement from Exercise and Sports Science Australia (2026), https://pmc.ncbi.nlm.nih.gov/articles/PMC13457279/"
      },
      {
        "id": "mental_preparation",
        "title": "Kampforberedelse – rutine før første aksjon",
        "text": "En førprestasjonsrutine er en gjenkjennelig rekkefølge av handlinger og oppmerksomhetssignaler før en oppgave. I fotball kan en rutine før avspark være å sjekke egen rolle, lokalisere støtte og avtale første pressignal. Før en dødball kan spilleren registrere plassering, velge målområde og bruke ett kjent oppgaveord. Rutinen må kunne tilpasses nye signaler og skal ikke bli en rigid overtro. Øv på rutinen under vanlige betingelser og deretter med gradvis økt, realistisk press. En meta-analyse støtter bruk av slike rutiner i idrett; det konkrete fotballeksemplet er en redaksjonell variant, ikke en dokumentert optimal rutine.",
        "source": "Faglig tillegg – The effectiveness of pre-performance routines in sports: a meta-analysis (2021), https://doi.org/10.1080/1750984X.2021.1944271 | Performance Under Pressure in Sport: A Position Statement from Exercise and Sports Science Australia (2026), https://pmc.ncbi.nlm.nih.gov/articles/PMC13457279/"
      },
      {
        "id": "mental_effort",
        "title": "Å prøve hardt og å prøve maksimalt – hensiktsmessig innsats",
        "text": "Manusets skille mellom hard og maksimal innsats kan utdypes ved å skille fysisk intensitet fra kvaliteten på oppgaveløsningen. Å sprinte maksimalt uten sikring kan bryte lagets balanse; å holde posisjon eller vente med press kan være den riktige krevende handlingen. I hurtighetstrening kan maksimal fart være målet, mens teknisk læring og restitusjon krever andre belastninger. Avtal hvilken innsats oppgaven krever, og vurder den etter gjennomføring, ikke bare hvor sliten spilleren blir. Som trener: spør om tretthet, usikkerhet eller uklar oppgave før du konkluderer med lav vilje. Dette er en fotballfaglig konkretisering av disposisjonen, ikke et sitat eller en ny måling av mentalitet.",
        "source": "Faglig tillegg – Mental Well-Being or Ill-Being through Coaching in Adult Grassroots Sport (2021), https://pubmed.ncbi.nlm.nih.gov/34204539/ | Autonomy support in sport and exercise settings: a systematic review and meta-analysis (2022), https://doi.org/10.1080/1750984X.2022.2031252"
      },
      {
        "id": "mental_reflection",
        "title": "Mentalt treningsarbeid – plan, gjennomføring og refleksjon",
        "text": "Bruk en enkel samtale før og etter treningsøkten. Før: spilleren velger én konkret handling å arbeide med og ett signal som minner om den. Under: treneren observerer situasjoner der handlingen var mulig, også når utfallet ble mislykket. Etter: spilleren forklarer hva han registrerte, hva som fungerte og hvilken justering han vil prøve neste gang. Eksempel: en back ønsker å bli tryggere ved presset mottak. Vurder orientering, kroppsstilling og valg av støtte, ikke bare om laget beholdt ballen. Dette redaksjonelle verktøyet bygger på prosessmål og autonomistøtte; det er ikke en standardisert psykologisk test.",
        "source": "Faglig tillegg – The what, why, and how of goal setting: a review of the goal-setting process in applied sport psychology practice (2023), https://doi.org/10.1080/10413200.2023.2185699 | The performance and psychological effects of goal setting in sport: a systematic review and meta-analysis (2022), https://doi.org/10.1080/1750984X.2022.2116723 | Autonomy support in sport and exercise settings: a systematic review and meta-analysis (2022), https://doi.org/10.1080/1750984X.2022.2031252"
      },
      {
        "id": "onenote_ball_path",
        "title": "Ballens bane og oppmerksomhet på treffpunkt",
        "text": "Et kort trenernotat oppfordrer spilleren til å la ballen gjøre arbeidet og ikke alltid dempe den, men følge ballens bane. Et annet ber spilleren registrere treffpunktet på ballen ved mellomlange pasninger. Sammen gir de en konkret oppmerksomhetsoppgave ved trening av mottak og pasning. Her beholdes notatene som trenerens observasjonspunkter, ikke som krav om at ballen alltid skal få løpe videre. Valget mellom demping og å følge ballbanen må avhenge av neste handling.",
        "source": "OneNote – Fotballnotater (Den 16.05.2026).one, råuttrekk 0x00004b2c og 0x0000573c"
      },
      {
        "id": "onenote_free_play",
        "title": "Fritt spill, arbeidsoppgaver og kreativ utfoldelse",
        "text": "Trenernotatene kombinerer tydelige arbeidsoppgaver med fri utfoldelse. De fremhever kreativitet, skudd og kantspillernes én-mot-én-muligheter i siste tredel, og sier at fritt spill kan avgrenses når spillerne ikke lenger mestrer oppgaven. Dette er en treneridé om forholdet mellom frihet og veiledning. I gjennomføringen bør det avklares hva spillerne skal løse selv, og når treneren skal gripe inn for å gjøre oppgaven forståelig. Ingen fast terskel for å avbryte fritt spill er angitt i notatene.",
        "source": "OneNote – Fotballnotater (Den 16.05.2026).one, råuttrekk 0x000f9a40, 0x000fa3a8 og 0x00102580"
      },
      {
        "id": "method_dreier",
        "title": "Sverre Dreier – individuell og relasjonell fotballferdighet",
        "text": "Boka Fotballferdigheten av Sverre Dreier, Andreas Morisbak og Terje Skarsfjord (2009) behandler individuelle og relasjonelle dimensjoner ved fotballferdighet. I PDF-manusets spillmodell står dessuten en henvisning til Dreier 2009:50 ved spill opp på en møtende spiller. Manuset beskriver avlegg, vending, veggspill og stuss som forskjellige muligheter. Sidehenvisningen er ikke kontrollert i selve læreboka, og formuleringene presenteres derfor som manusets egen bruk av referansen. Den praktiske lærdommen er å vurdere mottakerens valg i sammenheng med pasningsleggeren og tredjemann: en teknisk god handling må også passe medspillernes bevegelse. Treneren kan la spillerne velge mellom løsningene fremfor å kreve samme mønster hver gang.",
        "source": "Faglig tillegg – bokopplysninger, https://www.akademika.no/hjem-og-fritid/sport-og-friluft/fotballferdigheten/9788272862199 ; https://fotballtreneren.no/2025/10/17/nff-borster-stovet-av-delferdighetene/ ; Fotballteori.one 0x001a3590; Fotballdokumentet v1.pdf, Klarering / Spill opp – på!"
      },
      {
        "id": "method_comparison",
        "title": "Fem metodiske perspektiver – fra spillidé til samhandling",
        "text": "Frade, Seirul·lo, Verheijen, Eggen og Dreier gir ulike innganger til treningsarbeidet. En pedagogisk sammenligning kan begynne med én situasjon: laget mister ballen når en indreløper har gått frem. Frades perspektiv gir et spørsmål om hvordan øvelsen uttrykker lagets spillidé; Seirul·los om hvordan rammene fremhever problemet i en representativ situasjon; Verheijens om spillerne kan gjenta handlingene med ønsket kvalitet; Eggens om hvem som gjør medspillernes oppgaver lettere; og Dreiers om individuelle valg og relasjonelle ferdigheter. Dette er bokas redaksjonelle sammenstilling, ikke et felles program utviklet av de fem. Modellene brukes som spørsmål for treneren, ikke som gjensidig utelukkende doktriner eller automatiske prestasjonsbonuser.",
        "source": "Faglig tillegg – redaksjonell sammenstilling av de fem kildebelagte metodeavsnittene; OneNote-disposisjonen 0x000089ac og 0x001a3590"
      }
    ]
  },
  {
    "id": "individual_development",
    "title": "Individuell utvikling, rollefortrolighet og relasjoner",
    "principles": [
      "technical_skill_must_survive_pressure",
      "total_football_needs_role_flexibility",
      "confidence_is_built_by_clear_tasks"
    ],
    "clubs": [
      "rosenborg",
      "stabak",
      "tromso"
    ],
    "concept": "Skill mellom ferdighet, rolleforståelse og relasjon. En spiller kan ha god pasningsevne, men lite erfaring med å orientere seg som sekser. To spillere kan kjenne hver sin rolle uten å ha spilt sammen. Individuell trening kan arbeide med en bestemt svakhet eller rolle, mens kampbruk og gjentatt samarbeid bygger fortrolighet og timing.",
    "dilemma": "Å omskolere flere spillere samtidig kan gi langsiktig fleksibilitet, men redusere trygghet i dagens oppgaver. En ensidig jakt på forbedring kan dessuten øke belastningen. Velg individuell oppfølging etter spillerens behov, kampbruk og tilstand.",
    "manager": "Individuell trening kan gi belastnings-, form- og rollefortrolighetsendringer eller registrere et svakhetsmål. Rolletrening fester seg bedre når spilleren brukes i den rollen samme uke; den eksisterende motoren anvender 60 prosent av beregnet vekst før avrunding når rollen ikke brukes. Rollefortrolighet og relasjonskontinuitet er egne eksisterende, avgrensede beregninger, ikke nye ferdighetstall. I kamp gir status perfekt/god/brukbar henholdsvis 9/6/4 fortrolighetspoeng, feilbruk −5. Fortrolighet avgrenses til 0–100 og bonusen til kampdagens lagstyrke til maks 5. Dette er spillverdier, ikke målte læringsrater.",
    "practice": "Arbeid med én spiller som lærer sekserrollen. Øv på orientering før mottak, sikker returpasning og dekning ved balltap. Bruk ham deretter i et kampnært spill med de samme medspillerne.",
    "engineRefs": [
      {
        "file": "src/football-individual-training.js",
        "symbol": "resolveIndividualTrainingWeek"
      },
      {
        "file": "src/football-role-familiarity-engine.js",
        "symbol": "applyTrainingRoleGrowth"
      },
      {
        "file": "src/football-role-familiarity-engine.js",
        "symbol": "recordMatchRoleUsage"
      },
      {
        "file": "src/engine/calculateRoleRelationships.ts",
        "symbol": "summarizePlayerPartnerships"
      }
    ],
    "diagrams": [
      {
        "kind": "pitch",
        "title": "Lær rollen sammen med medspillerne",
        "note": "Sekseren lærer både mottaksvinkler og dekning. Indreløpernes bevegelser bestemmer hvilke pasninger som blir mulige.",
        "players": [
          [
            20,
            32,
            "Stopper",
            "a"
          ],
          [
            36,
            50,
            "Sekser",
            "a"
          ],
          [
            54,
            25,
            "Indreløper",
            "a"
          ],
          [
            54,
            76,
            "Indreløper",
            "a"
          ],
          [
            31,
            34,
            "Press",
            "d"
          ],
          [
            62,
            50,
            "Skjerm",
            "d"
          ]
        ],
        "arrows": [
          [
            20,
            32,
            36,
            50
          ],
          [
            36,
            50,
            54,
            25
          ],
          [
            36,
            50,
            54,
            76
          ]
        ]
      },
      {
        "kind": "flow",
        "title": "Rollelæring over tid",
        "note": "Kampbruk og individuell trening bidrar til den eksisterende rollefortroligheten; grunnkvalitet er noe annet.",
        "start": "Velg konkret rolle",
        "decision": "Spilles rollen også denne uka?",
        "branches": [
          "Ja → trening og kampbruk støtter hverandre",
          "Nei → individuell rollevekst blir lavere i modellen"
        ]
      },
      {
        "kind": "bars",
        "title": "Fortrolighet etter fem kamper",
        "note": "Regneeksempel fra 0 uten individuell trening: perfekt bruk 45, god bruk 30, brukbar 20. Ikke målt menneskelig læring.",
        "legend": [
          "Fortrolighet",
          "Gjenstående til 100"
        ],
        "rows": [
          [
            "Perfekt bruk",
            45,
            55
          ],
          [
            "God bruk",
            30,
            70
          ],
          [
            "Brukbar",
            20,
            80
          ]
        ]
      }
    ],
    "sourceDetails": [
      {
        "id": "early_specialization",
        "title": "Tidlig spesialisering og press på unge spillere",
        "text": "Manusets kritiske perspektiv er at ensidig spesialisering i barneårene kan gi kortsiktig teknisk fremgang, men også risiko for skader, utbrenthet og tapt idrettsglede. Det advarer mot at forventninger fra foreldre, akademier og resultatkrav kan fortrenge allsidighet, lek, taktisk forståelse og psykososial trivsel. Dette gjengis som manusets faglige bekymring, ikke som en individuell diagnose eller et fast program for barneidrett. Kildens henvisninger til Côté og NFF er ikke særskilt verifisert her.",
        "source": "Fotballdokumentet v1.pdf – 2.7 Tidlig spesialisering og press på unge spillere"
      },
      {
        "id": "learning_environment",
        "title": "Habitus og læringsmiljø – teknikkens sosiale rammer",
        "text": "Manuset bruker Bourdieus habitus som begrep for kroppsliggjort erfaring og fremhever hvordan miljø og oppvekst former teknikk. Det stiller uorganisert lek og futsal på små flater opp mot systematisk akademi- og klubbtrening, med ulike muligheter for improvisasjon, presisjon og kollektive mønstre. Samtidig fremheves ulik tilgang til baner, utstyr og trenerkompetanse, også for barn som ikke har råd til ekstra økter. Disse eksemplene beskriver manusets sosiologiske perspektiv; de skal ikke brukes som nasjonale stereotypier eller som automatiske spillerverdier.",
        "source": "Fotballdokumentet v1.pdf – 2.7 Sosiale og økonomiske skjevheter / 3.4 Sosiologi – Kulturelle læringsmiljøer"
      },
      {
        "id": "physical_resources",
        "title": "Fire fysiske ressurser – manusets inndeling",
        "text": "Fysiologidisposisjonen deler spillerens fysiske ressurser inn i utholdenhet, spenst/hurtighet, styrke og bevegelighet. En annen oversikt i manuset navngir hurtighet, styrke og utholdenhet, spenst og heading samt robusthet og levetid. Disse kategoriene bevares som originalens faglige struktur. Den tilgjengelige PDF-en og det delvise OneNote-uttrekket inneholder disposisjonen, men den detaljerte fysiologiblokken den viser til er ikke gjenfunnet. Derfor fastsettes det ikke nye treningsdoser, fysiske krav for hver rolle eller terskler for spillerverdier.",
        "source": "Fotballdokumentet v1.pdf – 6. Fysiologi / 4. Fysiske ferdigheter / Sportsvitenskap og fysiologi"
      },
      {
        "id": "motor_learning",
        "title": "Motorisk læring – variasjon og overføring",
        "text": "Manusets sportsvitenskapelige perspektiv knytter motorisk læring til variasjon og overførbarhet. En pasning trenes under forskjellige betingelser, med ulik fart, ulikt press og ulikt rom. Målet er at ferdigheten kan brukes fleksibelt når kampsituasjonen forandrer seg. Manuset viser til Schmidt og Lee og fremhever smålagsspill som en mulig måte å knytte teknisk utførelse til valg. Dette supplerer øvelseskapitlets beskrivelser av restriksjoner, uten å påstå at enhver isolert teknikkøvelse har mindre verdi eller å innføre en målt læringsrate.",
        "source": "Fotballdokumentet v1.pdf – 3.0 Ballkontroll og restriksjoner / 3.4 Sportsvitenskapelige perspektiver"
      },
      {
        "id": "neuromuscular_control",
        "title": "Nevromuskulær kontroll – muskler, sanser og kognisjon",
        "text": "Manuset beskriver teknikk som mer enn bevegelse: den bygger på samordning av muskler, sanser og kognisjon. Presisjon knyttes til repetisjon i realistisk tempo og under press. Spilleren må både oppfatte situasjonen, tolke den og utføre handlingen. I mottak betyr dette at en teknisk god førsteberøring må knyttes til orientering og den neste mulige handlingen. Manuset gir ikke et separat nevromuskulært treningsprogram, konkrete doser eller fysiologiske målemetoder. De oppgitte forskningshenvisningene er ikke kontrollert uavhengig her.",
        "source": "Fotballdokumentet v1.pdf – 3.4 Sportsvitenskapelige perspektiver / Nevromuskulær forskning"
      },
      {
        "id": "balance_proprioception",
        "title": "Balanse, holdning og propriosepsjon",
        "text": "I fysiologidisposisjonen er balanse knyttet til mage, holdning, proprioception, skadeforebygging og et planlagt George Best-eksempel. Propriosepsjon er også navngitt i sportsvitenskapens disposisjon. I de bevarte teknikkdelene beskrives balanse blant annet ved dribling, pasning og skudd, og lavt tyngdepunkt ved vending under press. Dette viser hvor balanse inngår i manusets praktiske fotballstoff. Den utførlige teorien om propriosepsjon og det nevnte spillereksemplet er ikke gjenfunnet i den tilgjengelige teksten. De er derfor registrert som uavklarte, ikke rekonstruert med antakelser.",
        "source": "Fotballdokumentet v1.pdf – 6. Fysiologi – Balanse / Sportsvitenskap og fysiologi / 3.1 Individuelle angrepsferdigheter"
      },
      {
        "id": "mental_development_outline",
        "title": "Det mentale aspektet – utvikle menneske og spiller",
        "text": "Originalmanusets disposisjon begynner med å utvikle mennesket og spilleren, og navngir selvtillit, motivasjon, fokus, mentale bilder og stressmestring. Den nevner også lytting, begrepsforståelse, det å bidra, å finne sitt nivå, enkle pasninger, lagånd, tilstedeværelse og bruk av treningstiden. Dette er den bevarte strukturen for den mentale hovedblokken. De enkelte temaene er ikke utdypet i denne disposisjonen, og den utførlige teksten er ennå ikke identifisert. Derfor gis det ikke et nytt psykologisk treningsprogram basert på antakelser.",
        "source": "Fotballdokumentet v1.pdf – 7. Det mentale aspektet, linje 789–801"
      },
      {
        "id": "confidence_finishing",
        "title": "Selvtillit og besluttsomhet ved avslutning",
        "text": "Avslutningsdelen gir konkrete mentale råd: ha selvtillit, aksepter bom, stol på egne ferdigheter og ha mot til å prøve igjen. Vær besluttsom i avslutningen, men behold roen: se opp, velg plass og utfør skuddet rolig og riktig. Originalmanuset har to overlappende lister over mentale faktorer; den mest utfyllende er brukt her uten å miste poenget om besluttsomhet og ro. Dette er manusets fotballfaglige instrukser til avslutteren, ikke generelle psykologiske diagnoser eller målbare effekter.",
        "source": "Fotballdokumentet v1.pdf – 3.1.2 Angrepsavslutning – Mentale faktorer, linje 2222–2228 og 2487–2495"
      },
      {
        "id": "mental_images",
        "title": "Mentale bilder, fokus og spilleforståelse",
        "text": "I orienteringsdelen beskriver manuset å danne et bilde av banen ved å veksle mellom blikk på ball og omgivelser. Lag deg bilder i hodet av hva som kommer til å skje, og forsøk å vite hvor ballen skal før mottak. Registrer hvor medspillerne er, hvor de kommer fra og hvor de er på vei. Aktiv registrering betyr å tenke over det man ser, ikke bare å se. Dette er manusets konkrete kobling mellom mentale bilder, fokus og handling i spillet; den separate disposisjonens øvrige mentale treningsmetoder er ikke beskrevet.",
        "source": "Fotballdokumentet v1.pdf – 3.2 Persepsjon / Orientering, linje 2537–2570"
      },
      {
        "id": "goals_effort_outline",
        "title": "Målsetting, relativ suksess og innsats – bevarte temaer",
        "text": "Manuset navngir målsetting med Lampard som kildepeker, relativ suksess, forskjellen på å prøve hardt og å prøve maksimalt, å bruke treningstiden og å være til stede. Nerver knyttes i disposisjonen til forberedelser; enkelhet ved formsvikt knyttes til Okwonga. Uttrykket «finn ditt nivå» og enkle pasninger står også i oversikten. Disse punktene er bevart som temaer for videre kildearbeid, ikke som en rekonstruert metode eller bekreftede sitater fra de nevnte personene.",
        "source": "Fotballdokumentet v1.pdf – 7. Det mentale aspektet, linje 790–799 / 2. Psykologi og mental trening, linje 4269–4276"
      },
      {
        "id": "phys_energy",
        "title": "Fysiologi – energi og fotballens arbeidskrav",
        "text": "Fotball er intervallpreget: gange og roligere løp avløses av akselerasjoner, sprint, dueller og brå bremsing. Kroppen bruker flere energisystemer samtidig. Aerob energiomsetning bidrar vesentlig gjennom kampen og til gjenvinning av kapasitet mellom intense aksjoner. Anaerobe prosesser, blant annet rask bruk av fosfokreatin og glykolyse, bidrar ved høy intensitet. En spiller kan derfor ha god generell utholdenhet, men likevel mangle evne til å gjenta raske aksjoner. Treneren må skille mellom å kunne løpe lenge, å kunne løpe fort og å kunne gjenta fotballrelevante løp. Eksempel: en kant kan ha god kapasitet over hele kampen, men miste kvaliteten i de første meterne av et bakromsløp. Dette krever en annen vurdering enn total distanse.",
        "source": "Faglig tillegg – Performance Adaptations to Intensified Training in Top-Level Football (2022), https://pmc.ncbi.nlm.nih.gov/articles/PMC9667002/ | Assessment of Aerobic Fitness and Repeated Sprint Ability in Elite Male Soccer (2025), https://pubmed.ncbi.nlm.nih.gov/40220211/"
      },
      {
        "id": "phys_endurance",
        "title": "Utholdenhet – aerob kapasitet og gjentatte aksjoner",
        "text": "Aerob utholdenhet gir grunnlag for arbeid over tid og restitusjon mellom arbeidsperioder. Intervalltrening og smålagsspill kan utvikle kapasitet, men belastningen avhenger av organisering. Et tett småspill kan gi mange akselerasjoner uten å gi særlig eksponering for toppfart. Bruk større spillflater når lengre løp er en del av målet. En pedagogisk voksenøvelse kan være fire perioder à tre minutter med spill i høyt, kontrollert tempo, avbrutt av to minutter roligere aktivitet; dette er et eksempel, ikke en forskningsfastsatt optimal dose. Juster areal, varighet og intensitet etter nivå. Observer om spilleren fortsatt kan orientere seg, støtte og forflytte seg effektivt mot slutten.",
        "source": "Faglig tillegg – Strength and Conditioning for Soccer Players (2014), https://doi.org/10.1519/SSC.0000000000000054 | Performance Adaptations to Intensified Training in Top-Level Football (2022), https://pmc.ncbi.nlm.nih.gov/articles/PMC9667002/"
      },
      {
        "id": "phys_strength",
        "title": "Styrke – kraft, bremsing og duellspill",
        "text": "Styrke gir et fysisk grunnlag for å akselerere, stå imot kontakt, bremse og endre retning. Maksimal styrke og evnen til å utvikle kraft raskt er forskjellige egenskaper. I fotball er særlig kontrollert arbeid i ettbeinsstillinger, hofte- og knebevegelse, leggstyrke og stabilisering av overkropp relevant. Eksempler på øvelser er knebøy, utfall, hoftehev, tåhev og tilpassede øvelser for bakside lår, lyske og kjernemuskulatur. Start med teknikk og håndterbar belastning, og øk gradvis med veiledning. Observer kontroll i senkefasen og stabilitet i fot, kne og hofte. God styrke alene garanterer ikke gode dueller: timing, posisjon og teknikk må også fungere.",
        "source": "Faglig tillegg – Strength and Conditioning for Soccer Players (2014), https://doi.org/10.1519/SSC.0000000000000054 | Skadefri – Skadefri fotball, https://skadefri.no/idretter/fotball/skadefri-fotball/"
      },
      {
        "id": "phys_power",
        "title": "Spenst og eksplosivitet – sats, landing og retningsskifte",
        "text": "Spenst handler om å produsere kraft raskt og utnytte elastiske og nevromuskulære egenskaper i satsen. I fotball kan det bidra i luftdueller, akselerasjon og raske retningsskifter. Tren både kraftutvikling og kontroll når spilleren tar imot belastning i landing og bremsing. En enkel progresjon er lave hopp med kontrollert landing, deretter hopp med retning og til sist kamplignende sats eller retningsskifte. Hold kvaliteten høy og avslutt dersom landingene blir ukontrollerte. Heading og luftdueller krever i tillegg lesing av ballbane og timing; spenst alene er ikke nok. Følg gjeldende aldersregler og klubbens retningslinjer for heading.",
        "source": "Faglig tillegg – Strength and Conditioning for Soccer Players (2014), https://doi.org/10.1519/SSC.0000000000000054 | Skadefri – Fotball, https://www.skadefri.no/idretter/fotball"
      },
      {
        "id": "phys_mobility",
        "title": "Bevegelighet – funksjonelt bevegelsesutslag",
        "text": "Bevegelighet handler om tilgjengelig utslag i ledd og muskel-/senesystem. Mobilitet i fotball krever også at spilleren kan kontrollere utslaget aktivt. Hofte, ankel og overkropp er relevante når man vender, tar imot ball, skyter eller bremser. Dynamiske utfall, kontrollerte rotasjoner og gradvis økende løpsbevegelser kan brukes i oppvarming. Velg øvelser ut fra hvilke bevegelseskrav spilleren faktisk trenger, ikke ut fra et mål om størst mulig utslag. Styrke og kontroll gjennom bevegelsen er like viktige som passiv bevegelighet. Unngå å presse gjennom smerte. Tilpass individuell trening til eventuelle begrensninger og faglig vurdering.",
        "source": "Faglig tillegg – Olympiatoppen – Bevegelighet med tanke på utvikling av mobilitet, https://www.olympiatoppen.no/fagomrader/motorikk-og-ferdighetsutvikling/fagstoff/bevegelighet-med-tanke-pa-utvikling-av-mobilitet/ | Olympiatoppen – Oppvarming før trening og konkurranse, https://www.olympiatoppen.no/fagomrader/utholdenhet/fagstoff/oppvarming/"
      },
      {
        "id": "phys_proprio",
        "title": "Propriosepsjon og balanse – kroppens eget informasjonssystem",
        "text": "Propriosepsjon er sansningen av kroppsdelenes stilling, bevegelse og kraft. Informasjon fra blant annet muskler og sener bidrar til at nervesystemet kan regulere bevegelsen uten at spilleren må se på alle kroppsdeler. Balanse krever i tillegg integrasjon med syn og balanseorganer. Fotballanvendelse: stabilt støttebein når man slår en pasning, kontroll i landing etter hopp og å opprettholde kroppsstilling ved retningsendring. Tren eksempelvis ettbeinsstilling med pasning til partner, kontrollert ettbeinsknebøy eller lavt hopp med stabil landing. Øk utfordringen gradvis ved å legge til ball, bevegelse og relevante beslutninger. Kjernemuskulatur bidrar til kontroll, men balanse er ikke bare magestyrke.",
        "source": "Faglig tillegg – Proske og Gandevia (2012), The proprioceptive senses, https://pubmed.ncbi.nlm.nih.gov/23073629/ | Skadefri – Skadefri fotball, https://skadefri.no/idretter/fotball/skadefri-fotball/"
      },
      {
        "id": "mental_motivation",
        "title": "Motivasjon – autonomi, kompetanse og tilhørighet",
        "text": "Skill mellom å spille fordi man selv ønsker å utvikle seg, og å spille hovedsakelig for å unngå kritikk eller oppnå belønning. Selvbestemmelsesteori fremhever autonomi, kompetanse og tilhørighet. En autonomistøttende trener kan forklare hvorfor en oppgave er viktig, gi reelle valg innenfor lagets rammer og invitere spilleren til å vurdere egen utvikling. En ving som strever med dribling kan velge mellom å trene mottak i fart og finte etter forsvarerens kroppsstilling, med et tydelig læringsmål. Det betyr ikke at alle taktiske beslutninger skal overlates til spilleren. Forskningen viser sammenhenger mellom autonomistøtte og motivasjon, ikke garanti for at en bestemt beskjed virker for alle.",
        "source": "Faglig tillegg – Autonomy support in sport and exercise settings: a systematic review and meta-analysis (2022), https://doi.org/10.1080/1750984X.2022.2031252 | Mental Well-Being or Ill-Being through Coaching in Adult Grassroots Sport (2021), https://pubmed.ncbi.nlm.nih.gov/34204539/"
      },
      {
        "id": "mental_relative_success",
        "title": "Målsetting og relativ suksess – resultat, prestasjon og prosess",
        "text": "Skille mellom resultatmål (vinne kampen), prestasjonsmål (forbedre en egen prestasjon) og prosessmål (gjennomføre en bestemt handling). Resultatet avhenger også av motstanderen. Et prosessmål for en sekser kan være å sjekke bakre skulder før mottak og velge en støttepasning når fremoverrommet er stengt. Relativ suksess forstås her redaksjonelt som fremgang vurdert mot eget utgangspunkt og oppgave, ikke bare andres resultater. Avtal ett observerbart mål, se på representative situasjoner, og juster etter samtale med spilleren. Forskning på målsetting gir støtte til prosessmål, men mål må tilpasses person og kontekst. Dette er ikke en rekonstruksjon av Lampards målsettingsmetode.",
        "source": "Faglig tillegg – The performance and psychological effects of goal setting in sport: a systematic review and meta-analysis (2022), https://doi.org/10.1080/1750984X.2022.2116723 | The what, why, and how of goal setting: a review of the goal-setting process in applied sport psychology practice (2023), https://doi.org/10.1080/10413200.2023.2185699"
      },
      {
        "id": "mental_self_efficacy",
        "title": "Selvtillit, mestringstro og formsvikt",
        "text": "Selvtillit kan være generell, mens mestringstro er mer knyttet til forventningen om å kunne løse en bestemt oppgave. En stopper kan være trygg i luftdueller og samtidig usikker på oppspill under høyt press. Ved formsvikt: identifiser hva som faktisk er vanskelig. Gjør oppgaven avgrenset og realistisk, og bygg gradvis opp igjen kravene. For eksempel kan en stopper først trene åpnet kropp og støttepasning med oversikt, deretter med aktivt press og til sist med fremoveralternativ. Gi konkret tilbakemelding på handlingen, ikke en merkelapp på personen. Dette er en faglig utdyping av manusets tema om enkelhet og å finne sitt nivå, ikke en gjengivelse av Okwonga.",
        "source": "Faglig tillegg – The performance and psychological effects of goal setting in sport: a systematic review and meta-analysis (2022), https://doi.org/10.1080/1750984X.2022.2116723 | Mental Well-Being or Ill-Being through Coaching in Adult Grassroots Sport (2021), https://pubmed.ncbi.nlm.nih.gov/34204539/"
      },
      {
        "id": "mental_imagery_practice",
        "title": "Visualisering – øv på situasjonen, ikke bare suksessen",
        "text": "Mental forestilling kan supplere fysisk trening. Ta utgangspunkt i en konkret fotballsituasjon: du står som sekser med en motspiller i ryggen, ser over skulderen, oppfatter en fri back og velger pasning. Forestill deg synsinntrykk, tempo, kroppsstilling og alternative utfall. Gjenta også en situasjon der første alternativ er stengt, slik at øvelsen omfatter tilpasning fremfor bare en perfekt sekvens. Bruk en kort forestillingsøvelse før en fysisk repetisjon og sammenlign hva du forventet med hva du faktisk registrerte. Forskningen på mental forestilling er lovende, men varierende; den erstatter ikke representativ kamptrening og gir ingen garantert prestasjonsøkning.",
        "source": "Faglig tillegg – The Effects of Imagery Practice on Athletes' Performance: A Multilevel Meta-Analysis with Systematic Review (2025), https://pubmed.ncbi.nlm.nih.gov/40426460/ | Effects of Psychological Interventions to Enhance Athletic Performance: A Systematic Review and Meta-Analysis, https://pubmed.ncbi.nlm.nih.gov/37812334/"
      },
      {
        "id": "mental_attention",
        "title": "Konsentrasjon og oppmerksomhet – skifte mellom oversikt og handling",
        "text": "En fotballspiller må veksle mellom bred oppmerksomhet mot rom og medspillere og smalere oppmerksomhet ved utførelse. Under oppbygging trenger stopperen oversikt over press og mulige pasningslinjer; i pasningsøyeblikket må han også kontrollere selve balltreffet. Et kort oppgaveord kan hjelpe når tankene flyttes til resultat eller siste feil, eksempelvis se rom eller neste handling. I en spilløvelse kan treneren stoppe spillet etter et mottak og spørre hvilken informasjon spilleren hadde før ballen kom. Vurder faktisk registrering og valg, ikke bare hvor ofte hodet beveges. Oppgaveord og øvelsen er redaksjonelle anvendelser av oppmerksomhets- og rutineprinsipper.",
        "source": "Faglig tillegg – The effectiveness of pre-performance routines in sports: a meta-analysis (2021), https://doi.org/10.1080/1750984X.2021.1944271 | Performance Under Pressure in Sport: A Position Statement from Exercise and Sports Science Australia (2026), https://pmc.ncbi.nlm.nih.gov/articles/PMC13457279/"
      },
      {
        "id": "mental_self_talk",
        "title": "Indre dialog – korte signaler som støtter neste handling",
        "text": "Indre dialog kan være instruksjonsorientert, som åpen kropp eller se opp, eller motiverende, som neste aksjon. Treneren kan hjelpe spilleren med å finne ett ord som er forståelig og relevant for situasjonen. En spiss som nettopp har bommet kan velge neste løp fremfor å gjenta en vurdering av egen verdi. Et signal skal støtte handling, ikke kreve at spilleren undertrykker alle ubehagelige tanker. Tren det først i en vanlig øvelse, deretter under realistisk tidspress. Forskning på self-talk viser mulige prestasjonsfordeler, men effekten varierer med oppgave og gjennomføring.",
        "source": "Faglig tillegg – Hatzigeorgiadis mfl. (2011), Self-Talk and Sports Performance: A Meta-Analysis, https://doi.org/10.1177/1745691611413136 | Effects of Psychological Interventions to Enhance Athletic Performance: A Systematic Review and Meta-Analysis, https://pubmed.ncbi.nlm.nih.gov/37812334/"
      },
      {
        "id": "culture_habitus_field",
        "title": "Bourdieu – habitus, felt og teknikk",
        "text": "Manuset anvender habitus som kroppsliggjorte erfaringer og disposisjoner som utvikles gjennom sosial praksis. Futsal på små flater, systematisk akademitrening og spill på ujevne baner nevnes som ulike læringsmiljøer. Feltet viser til de institusjonelle rammene der aktører konkurrerer om hva som verdsettes, blant annet klubber, ligaer og turneringer. En spillers ferdigheter må derfor forstås i forhold til miljøet der de utvikles og anvendes. Dette er manusets anvendelse av Bourdieu; eksemplene beskriver mulige læringsbetingelser og ikke egenskaper som følger av nasjonalitet. Ingen nye spillerverdier utledes av dem.",
        "source": "Fotballdokumentet v1.pdf – Del IV – Bourdieu: Habitus og felt / 3.4 Sosiologi"
      },
      {
        "id": "culture_symbolic_capital",
        "title": "Estetikk som symbolsk kapital",
        "text": "Manuset drøfter hvordan anerkjennelse for en spillers uttrykk kan bli en form for symbolsk kapital. Zidane brukes som eksempel på eleganse og rytme, mens Makélélé illustrerer betydningen av mindre spektakulære, strukturelle oppgaver. Publikum, medier og klubber kan verdsette ulike bidrag; sportslig nytte, synlighet og økonomisk verdi er ikke nødvendigvis sammenfallende. Dette er en sosiologisk fortolkning av fotballens verdsetting, ikke dokumenterte forskjeller i sponsorinntekter eller en måling av spillernes popularitet. Manageren kan bruke perspektivet til å reflektere over hvorfor både synlige og mindre synlige roller fortjener oppmerksomhet.",
        "source": "Fotballdokumentet v1.pdf – Del IV – Estetikk som kapital"
      },
      {
        "id": "culture_access_class",
        "title": "Klasse, profesjonalisering og tilgang til fotball",
        "text": "Manuset knytter fotballens utvikling til sosiale og klassemessige forhold, profesjonalisering og tilgang til trening. Muligheten til å bruke tid på systematisk trening påvirkes av materielle og institusjonelle betingelser. Også i ressurssterke land kan kostnader til akademier, utstyr og ekstra økter begrense deltakelsen. Dermed er teknikkutvikling både et individuelt og et sosialt spørsmål. Manusets kontrast mellom tidlige amatør- og arbeiderklubber er en historisk tolkning som trenger nærmere kildearbeid, ikke en regel om sosial klasses spillestil.",
        "source": "Fotballdokumentet v1.pdf – Del I – Klasse, kultur og profesjonalisering / 2.7 Sosiale og økonomiske skjevheter"
      },
      {
        "id": "portrait_zlatan_longevity",
        "title": "Zlatan Ibrahimović – levetid og individuell tilpasning",
        "text": "AC Milan dokumenterer Ibrahimovićs avslutning av spillerkarrieren 4. juni 2023. Originalmanuset nevner ham i forbindelse med robusthet og levetid, men gir ingen fysiologisk forklaring. Bruk derfor karrieren som utgangspunkt for et faglig spørsmål: hvordan kan arbeidsoppgaver, treningsbelastning og restitusjon tilpasses når en spiller ikke har de samme forutsetningene som tidligere? En erfaren spiss kan fortsatt bidra gjennom teknikk, posisjonering og relasjoner, men det må vurderes ut fra observerbar prestasjon. Dette er et redaksjonelt perspektiv, ikke en påstand om Ibrahimovićs konkrete medisinske eller fysiske treningsprogram.",
        "source": "Faglig tillegg – AC Milan, https://www.acmilan.com/en/news/articles/club/2023-12-11/redbird-capital-partners-press-release; personnavn og tematikk fra Fotballdokumentet v1.pdf"
      },
      {
        "id": "portrait_physical_role_comparison",
        "title": "Fysiske spesialister – samme ressurs, forskjellige arbeidsoppgaver",
        "text": "Sammenlign de fysiske ressursene i originalmanuset med rollekravene: en kant trenger ofte akselerasjon når et siderom åpnes; en spiss trenger kraft og kontroll i mottak under press; en indreløper må gjenta forflytninger mellom arbeidsrom; en sekser kan beskytte rom ved tidlig posisjonering. FIFA Training Centres VM-analyse viser at ulike taktiske roller og kampoppgaver påvirker fysisk belastning. Observer derfor ikke bare hvor mye en spiller løper, men når, hvor og hvorfor han løper. Eksemplene i denne bolken er faglige observasjonsmodeller, ikke en sammenlignbar fysisk test av historiske spillere. Ingen spillerverdier, aldersterskler eller simulerte treningsbonuser endres.",
        "source": "Faglig tillegg – FIFA Training Centre, https://www.fifatrainingcentre.com/en/fwc2022/physical-analysis/using-case-studies-to-reveal-the-reasons-why-various-tactical-roles-exert-themselves-physically-during-world-cup-matches.php; personnavn og tematikk fra Fotballdokumentet v1.pdf"
      },
      {
        "id": "onenote_motivation_conversation",
        "title": "Motivasjon – samtale om hensikt og innsats",
        "text": "Trenernotatene innleder med spørsmål om hva motivasjon er, og hvorfor spillerne er til stede. De legger vekt på å arbeide for hverandre, sette langsiktige mål, gjøre sitt beste og kjenne egen arbeidsoppgave. Resultatet blir i en av notisene underordnet felles innsats. Dette bevares som et uttrykk for trenerens verdier, ikke som en empirisk påstand om at tro alene bestemmer ferdighetsnivå. De eksisterende fagavsnittene om mestringstro og prosessmål gir en separat faglig utdyping.",
        "source": "OneNote – Fotballnotater (Den 16.05.2026).one, råuttrekk 0x000f9c80–0x000fa780 og 0x001022f4"
      },
      {
        "id": "onenote_duncan_edwards",
        "title": "Duncan Edwards – en avbrutt karriere",
        "text": "OneNote plasserer Duncan Edwards blant arbeidsmaurene og omtaler ham som et symbol på en tapt fremtid. Manchester United dokumenterer at han døde 21 år gammel etter flyulykken i München i 1958, og at det finnes begrenset historisk filmopptak. Dette er et historisk minne, ikke en anledning til å spekulere i hvilke prestasjoner eller trofeer han kunne ha oppnådd. Det kan brukes til å reflektere over forskjellen mellom observerbar prestasjon, utviklingspotensial og ettertidens fortellinger. Manusets vurdering av hva han representerer beholdes som en fortolkning, ikke som en fysiologisk eller psykologisk måling.",
        "source": "OneNote – Fotballteori (Den 12.06.2026).one, råuttrekk 0x00298374, 0x007e8c6c; Manchester United, https://www.manutd.com/en/news/a-new-way-to-celebrate-duncan-edwards ; https://www.manutd.com/en/club/history/munich-remembered/the-darkest-day"
      },
      {
        "id": "onenote_peak_narratives",
        "title": "Når heltene brått falt – prestasjon, vendepunkt og erindring",
        "text": "OneNote har en egen serie om spillere hvis karriere fikk et vendepunkt ved eller etter en periode med stor suksess. Manuset inkluderer Gascoigne, Van Basten, Ronaldo Nazário, Adriano, Owen, Falcao, Torres, Kaká og Sjevtsjenko, i tillegg til kortere tekster om blant andre Savićević og de to forskjellige spillerne Paolo Rossi og Giuseppe Rossi. Fortellingen om en tapt fremtid er en fortolkning, ikke et målbart utfall. Skill mellom dokumentert prestasjon, faktisk karriereforløp og spekulasjon om hva spilleren kunne oppnådd. Skade, rolleendring, klubbskifte og form kan ikke uten videre tilskrives én årsak. Det tidligere portrettet om Duncan Edwards beholdes som et særskilt historisk minne.",
        "source": "OneNote – Fotballteori (Den 12.06.2026).one, råuttrekk 0x001a425c–0x001acd94"
      }
    ]
  },
  {
    "id": "collective_training",
    "title": "Samhandling – fra rollepar til spillmodell",
    "principles": [
      "total_football_needs_role_flexibility",
      "short_commands_create_team_speed",
      "attacking_patterns_need_timing"
    ],
    "clubs": [
      "rosenborg",
      "viking",
      "tromso"
    ],
    "concept": "Tren konkrete forbindelser: møtende spiss og løper, overlappende back og innoverkant, presspiss og ettertrykk. Utvid deretter slik at motsatt side og restforsvaret får oppgaver.",
    "dilemma": "En fast pasningssekvens kan bli gjenkjennelig, men avhengig av at forsvareren reagerer på en bestemt måte. Tren samme prinsipp mot forskjellige reaksjoner.",
    "manager": "Relasjonsmotoren vurderer komplementære roller og kontinuitet. Positiv relasjon er ikke bevis for korrekt timing i alle situasjoner. Bruk plan og etterkamp til å vurdere registrerte signaler.",
    "practice": "Spill 4 mot 3 med møtende spiss, løper, pasningsspiller og sekser. La forsvareren velge om han følger spissen eller holder linjen. Angriperne må velge utvei ut fra reaksjonen.",
    "engineRefs": [
      {
        "file": "src/engine/calculateRoleRelationships.ts",
        "symbol": "calculateRoleRelationships"
      }
    ],
    "diagrams": [
      {
        "kind": "pitch",
        "title": "Samspill med to mulige utveier",
        "note": "Spiss og løper leser stopperens valg; sekseren sikrer bak ballen.",
        "players": [
          [
            20,
            52,
            "Sekser",
            "a"
          ],
          [
            39,
            30,
            "Pasningsspiller",
            "a"
          ],
          [
            60,
            46,
            "Spiss",
            "a"
          ],
          [
            42,
            74,
            "Løper",
            "a"
          ],
          [
            69,
            40,
            "Stopper",
            "d"
          ],
          [
            70,
            69,
            "Stopper",
            "d"
          ],
          [
            49,
            48,
            "Skjerm",
            "d"
          ]
        ],
        "arrows": [
          [
            60,
            46,
            49,
            36
          ],
          [
            39,
            30,
            49,
            36
          ],
          [
            42,
            74,
            84,
            72
          ]
        ]
      }
    ],
    "sourceDetails": [
      {
        "id": "defensive_language",
        "title": "Defensive beskjeder – lagets felles ordliste",
        "text": "Originalmanusets beskjeder: «Pump ut!», «Gå i sikring!», «Støt opp», «Kom nærmere meg» (stoppere), «Sett inn press», «Mann kommer inn i sone», «Fall av», «Stå høyt», «Jobb tilbake!», «Har han», «Du ligger feil, du er feilposisjonert», «Jobb hjem!». Ved dødball: gi konkret markeringsbeskjed, for eksempel «Du tar den mannen», og spør «Har du han?». «Aktivt press!» ropes tydelig slik at hele laget vet at det avtalte presset starter. Bruk beskjedene om linje, sikring og markering i sammenheng, slik at spillerne ikke får motstridende signaler.",
        "source": "Fotballdokumentet v1.pdf – 4.1 Defensive beskjeder, linje 3697–3715"
      },
      {
        "id": "offensive_language",
        "title": "Offensive beskjeder – lagets felles ordliste",
        "text": "Originalmanusets beskjeder: «Jeg er ledig», «Du har plass», «Har tid», «Mann i rygg», «Vri spillet», «Start løp», «Skyt», «Jeg er i støtte», «Gå i støtteposisjon», «Vend om», «Vend opp». I kampanalysedelen nevnes også «Kommer», «Støtte», «Dribl» og «Skyt» som korte, felles beskjeder. Øv på å bruke de samme ordene og unngå for mange beskjeder samtidig. Ordlisten skal hjelpe spilleren å velge neste handling ut fra faktisk rom og press, ikke erstatte spillerens eget blikk.",
        "source": "Fotballdokumentet v1.pdf – 4.2 Offensive beskjeder / Kampanalyse – Kommunikasjon, linje 3716–3726 og 3928–3936"
      },
      {
        "id": "communication_relations",
        "title": "Relasjoner – hvem har oversikt og hvem gir beskjed?",
        "text": "Når dyp sentral midtbane spiller opp på møtende spiss, skal han ifølge manuset få indreløperne til å gå i støtte. Det er en konkret relasjon mellom pasningslegger, mottaker og spillere som skal gjøre neste handling mulig. I forsvar har motsatt back eller stopper ofte best oversikt når en back utfordres bredt; disse må varsle om markering og dype løp. Keeperen skal gi raske, tydelige beskjeder, særlig i undertall, om balanse, blokkering og når forsvaret kan støte. Manuset vektlegger også øyekontakt. Tren både tidspunktet for signalet og bevegelsen som følger det.",
        "source": "Fotballdokumentet v1.pdf – Kommunikasjon / 1.4 Keeperkommunikasjon / Orientering–registrering / Øyekontakt, linje 1188–1200, 1375–1393, 2650–2668 og 3690–3696"
      },
      {
        "id": "possession_counter_practice",
        "title": "Spillnær samhandling – possession og kontringsøvelse",
        "text": "Manuset anbefaler possession-øvelser på store områder for å trene hele banens bredde og lengde, med touch-restriksjoner når målet er økt balltempo. Kortpasninger kan trekke motstanderen sammen før en lengre pasning flytter spillet ut av press. Et separat kontringseksempel trener hurtige løp og korte kombinasjoner med mål om å nå siste tredel innen 15 sekunder. Tidsmålet er en konkret treningsvariant fra manuset, ikke et universelt prestasjonskrav. Begge øvelsesidéer er tekstlige varianter, uten ny spillmotorbonus eller separat øvelses-ID.",
        "source": "Fotballdokumentet v1.pdf – Ballbesittelse / Konservering / Overgang–Kontring"
      },
      {
        "id": "team_spirit_outline",
        "title": "Vinnermentalitet, lagånd og verdier",
        "text": "Disposisjonen om det mentale aspektet knytter vinnermentalitet til lagånd, tilstedeværelse, lytting og det å bidra. Den viser til et Herrera-sitat om å kjempe og spille, og navngir planlagte kontrastcaser om psyke og kultur samt Sócrates og Weah i forbindelse med verdier og ansvar. De konkrete casene og sitatgrunnlaget er ikke dokumentert i den mentale blokken. I den bevarte kommunikasjonsdelen vektlegges ros, oppmuntring, vennlig kroppsspråk og konkrete tilbakemeldinger én til én. Dette er tilgjengelig praksisstoff, mens en egen teori om vinnermentalitet og lagånd krever mer originalmateriale.",
        "source": "Fotballdokumentet v1.pdf – 7. Det mentale aspektet / 2. Psykologi og mental trening / Kommunikasjon, linje 789–801, 4269–4276 og 3654–3696"
      },
      {
        "id": "mental_team_cohesion",
        "title": "Lagånd – oppgavekohesjon og sosial kohesjon",
        "text": "Lagånd har både en oppgaveside og en sosial side. Oppgavekohesjon handler om at spillerne samler seg om felles mål og arbeidsoppgaver, mens sosial kohesjon gjelder tilhørighet og relasjoner i gruppen. Et lag kan ha godt vennskap uten samordnet press, eller løse taktiske oppgaver uten at alle opplever seg inkludert. Tren derfor konkrete felles handlinger og skap et miljø der spillere blir hørt. Etter et brutt press kan laget sammen forklare hvem som skulle støte, sikre og dekke neste pasning, uten å gjøre én spiller til syndebukk. Forskning på lagbygging støtter arbeid med kohesjon, men det kan ikke reduseres til én bonus eller ett tall.",
        "source": "Faglig tillegg – Analyzing the impact of team-building interventions on team cohesion in sports teams: a meta-analysis study (2024), https://pubmed.ncbi.nlm.nih.gov/38558775/ | Mental Well-Being or Ill-Being through Coaching in Adult Grassroots Sport (2021), https://pubmed.ncbi.nlm.nih.gov/34204539/"
      },
      {
        "id": "mental_winning",
        "title": "Vinnermentalitet – konkurranse, ansvar og lagets verdier",
        "text": "Vinnermentalitet kan i praksis bety å tåle motgang, ta ansvar for neste handling, arbeide for laget og respektere avtalte oppgaver. Det er ikke det samme som å kjefte høyest eller overse smerte, regler og medspillere. Etter baklengsmål kan kapteinen samle laget om én konkret oppgave, for eksempel å gjenopprette avstander og vente på et avtalt pressignal. Når laget leder, kan det fortsatt kreves konsentrasjon og presisjon fremfor risikofylt jakt på et nytt mål. Dette er en normativ fotballfaglig utdyping av manusets vinnermentalitet, lagånd og tilstedeværelse, ikke en rekonstruksjon av Herrera-sitatet eller en psykologisk karakteristikk av navngitte spillere.",
        "source": "Faglig tillegg – Mental Well-Being or Ill-Being through Coaching in Adult Grassroots Sport (2021), https://pubmed.ncbi.nlm.nih.gov/34204539/ | Analyzing the impact of team-building interventions on team cohesion in sports teams: a meta-analysis study (2024), https://pubmed.ncbi.nlm.nih.gov/38558775/"
      },
      {
        "id": "culture_socrates",
        "title": "Sócrates og Corinthians-demokratiet – fotball som samfunnshandling",
        "text": "Manuset løfter frem Sócrates som elegant midtbanespiller, lege, kaptein for Brasil i VM 1982 og politisk engasjert fotballspiller. Forskning på Democracia Corinthiana beskriver en klubbpraksis med økt medbestemmelse og en bevegelse som fikk betydning i kampen for demokratiske rettigheter under Brasils militærdiktatur. Sócrates var en sentral deltaker, sammen med andre spillere og aktører i klubben. Caset viser hvordan fotball kan være en arena for samfunnshandling og kollektivt ansvar, uten at en klubborganisering må kopieres direkte i spillets managerrolle. Den historiske konteksten er særskilt kildebelagt.",
        "source": "Fotballdokumentet v1.pdf – Del IV – Sócrates – doktoren som ledet revolusjonen; FIFA, https://inside.fifa.com/tournaments/mens/worldcup/1982spain/news/tele-and-his-gods-of-82 ; Playing for freedom: Sócrates, futebol-arte and democratic struggle in Brazil, https://doi.org/10.1080/14660970.2014.912014"
      },
      {
        "id": "portrait_keane_deschamps",
        "title": "Roy Keane og Didier Deschamps – ledelse gjennom arbeidsoppgaven",
        "text": "Premier League dokumenterer Keanes kapteinsrolle i Manchester United fra 1997. FIFA beskriver Deschamps som defensiv midtbanespiller og kaptein ved Frankrikes VM-triumf i 1998. De gir to historiske utgangspunkter for å undersøke ledelse fra midtbanen. Observer hvordan en spiller tilbyr støtte, hjelper andre med posisjonering og kommuniserer ved omstilling. Kapteinsrollen gir ansvar, men beviser ikke at en bestemt personlighet eller konfrontasjonsstil gir bedre prestasjoner. Tren felles beskjeder og vurder handlinger fremfor å tildele spillerne psykologiske merkelapper.",
        "source": "Faglig tillegg – Premier League, https://www.premierleague.com/en/events/hall-of-fame/inductees/roy-keane ; FIFA, https://inside.fifa.com/tournaments/mens/worldcup/qatar2022/news/the-secrets-to-deschamps-longevity-with-les-bleus; personnavn fra Fotballdokumentet v1.pdf"
      },
      {
        "id": "portrait_weah_romario_civic",
        "title": "George Weah og Romário – fotballens samfunnsstemmer",
        "text": "Originalmanuset nevner Weah og Romário sammen med Sócrates og Pelé som samfunnsstemmer. FIFA dokumenterer Weahs rolle som æreskaptein i Players' Voice Panel mot rasisme, mens Brasils senat dokumenterer Romários valg til senatet i 2014. Casene viser ulike måter en fotballprofil kan delta i offentligheten på: organisert arbeid mot diskriminering og folkevalgt politikk. De brukes som historiske og institusjonelle eksempler, ikke som partipolitisk støtte eller som bevis for at sportslig dyktighet gir politisk kompetanse. Det tidligere Sócrates-avsnittet beholdes.",
        "source": "Faglig tillegg – FIFA, https://inside.fifa.com/campaigns/no-discrimination/media-releases/players-voice-panel-tackle-racism-in-football ; Brasils senat, https://www12.senado.leg.br/noticias/materias/2014/10/05/romario-e-eleito-senador; personnavn fra Fotballdokumentet v1.pdf"
      },
      {
        "id": "onenote_shared_perception",
        "title": "Delt persepsjon – samhandling uten verbal beskjed",
        "text": "OneNote-utkastet nevner shared affordances og beskriver samhandling som noe som også kan springe ut av delt persepsjon, ikke bare verbale beskjeder. Den faglige ideen er at flere spillere kan registrere det samme åpne rommet eller den samme endringen i motstanderens posisjon og tilpasse handlingene til hverandre. Dette utfyller manusets kommunikasjonsdel om signaler og øyekontakt. Den angitte forskningshenvisningen i råteksten er ikke kontrollert mot originalpublikasjonen; begrepet beholdes som en kildeankret teoriidé, ikke som en forskningskonklusjon.",
        "source": "OneNote – Fotballteori (Den 12.06.2026).one, råuttrekk 0x00037ec4"
      },
      {
        "id": "onenote_pop_icons",
        "title": "Pop- og kultikonene – sportslig og symbolsk verdi",
        "text": "Manuset setter Gamst Pedersen, Waddle, Beckham, Ibrahimović, Best, Okocha, Neymar og Pogba inn i en fortelling om fotballens popkultur. Det fremhever blant annet reklame, frisyrer, musikk og selviscenesettelse. Dette er en egen tematisk gruppe i originalen, ikke en rangering av sportslige prestasjoner. Skillet mellom spillerens funksjon i laget, publikums identifikasjon og kommersiell synlighet knyttes til bokas drøfting av symbolsk kapital. Detaljer om enkeltavtaler og tilskrevne motiver er ikke selvstendig kontrollert. Spørsmålet for manageren er hvordan man verdsetter både synlige og mindre synlige bidrag uten å forveksle popularitet med fotballfaglig effekt.",
        "source": "OneNote – Fotballteori (Den 12.06.2026).one, råuttrekk 0x00280308–0x00284cdc"
      },
      {
        "id": "method_eggen",
        "title": "Nils Arne Eggen – Godfoten og samhandling",
        "text": "Godfoten tar utgangspunkt i at spillernes styrker skal komme fellesskapet til gode. Rosenborgs egen omtale av Eggens filosofi fremhever samhandling, å unne medspillere suksess og å dyrke styrkene hos hver enkelt. Fotballfaglig er en relasjon mer enn summen av to individuelle ferdigheter: en god pasningslegger trenger en medspiller som registrerer og utnytter pasningsmuligheten. Tren derfor en konkret forbindelse mellom spillere, for eksempel kantens bredde, indreløperens løp og backens støtte. Evaluer hvordan spillerne gjorde hverandres oppgaver lettere, også når de ikke fikk ballen. Eksemplet er et nytt pedagogisk opplegg basert på filosofien, ikke en historisk Eggen-øvelse eller en ny motorbonus.",
        "source": "Faglig tillegg – Rosenborg BK, https://www.rbk.no/nyheter/trondheim-bys-hederspris-til-nils-arne-eggen ; Eggen og Nyrønning, Godfoten (1999), https://aschehoug.no/godfoten-1 ; navn fra Fotballteori.one 0x000089ac"
      }
    ]
  },
  {
    "id": "load_recovery",
    "title": "Belastning, restitusjon og kampberedskap",
    "principles": [
      "physical_capacity_sets_tactical_ceiling",
      "confidence_is_built_by_clear_tasks"
    ],
    "clubs": [
      "brann",
      "rosenborg"
    ],
    "concept": "Treningsbelastning må ses sammen med kampminutter, intensitet, restitusjon og individuell tilstand. En fysisk krevende pressøvelse kan være relevant for kampplanen, men spillere med høy belastning trenger tilpassede rammer eller hvile. God treningsplanlegging handler om å skape tilstrekkelig læring uten å svekke tilgjengelighet og kvalitet i neste kamp.",
    "dilemma": "For lite belastning kan gi for få kampnære repetisjoner, mens for mye kan gjøre spillerne mindre friske til kamp. En trøtt spiller bør ikke automatisk få mer trening fordi rollepassformen er svak. Ved skade skal medisinsk oppfølging ha forrang fremfor taktisk utvikling.",
    "manager": "Treningsdagen leser eksisterende troppstilstand og varsler om hvilebehov eller skade. Programrangeringen tar hensyn til belastning, og individuell oppfølging kan påvirke belastning, form og rehabilitering gjennom eksisterende modeller. Spillverdier er abstrakte; de er ikke medisinske anbefalinger.",
    "practice": "Planlegg en uke med taktisk pressøkt og kampforberedelse. Gi en spiller med simulert høy belastning en lettere individuell oppfølging. Sammenlign planens læringsmål med troppens tilstand før kamp.",
    "engineRefs": [
      {
        "file": "src/football-player-condition.js",
        "symbol": "applyWeeklyRecovery"
      },
      {
        "file": "src/football-player-condition.js",
        "symbol": "applyIndividualTrainingEffects"
      },
      {
        "file": "src/football-player-condition.js",
        "symbol": "playersNeedingRest"
      }
    ],
    "diagrams": [
      {
        "kind": "flow",
        "title": "Belastning før neste kamp",
        "note": "Et treningsvalg må vurderes mot den eksisterende troppstilstanden, ikke et oppdiktet optimalt belastningstall.",
        "start": "Planlagt treningsøkt",
        "decision": "Er troppen klar for belastningen?",
        "branches": [
          "Ja → gjennomfør valgt program",
          "Nei → tilpass oppfølging og vurder hvile"
        ]
      }
    ],
    "sourceDetails": [
      {
        "id": "training_periodization",
        "title": "Periodisering og treningsfilosofier – helhet fremfor isolasjon",
        "text": "Manuset fremhever at teknikktrening skal integreres i helhetlige, spillnære sammenhenger med realistisk tempo og motstand. Raymond Verheijen nevnes i forbindelse med periodisering. Disposisjonen navngir dessuten Vítor Frade (Tactical Periodization), Paco Seirul·lo, Nils Arne Eggen (Godfoten), Dreier og Descamps, men gir ikke her en fullstendig redegjørelse for hver metodikk. Disse navnene beholdes som planlagte faglige fordypninger. Det legges ikke til en egen ukemodell, belastningsdosering eller påstått trenerfilosofi som manusavsnittet ikke beskriver.",
        "source": "Fotballdokumentet v1.pdf – 3.3 Pedagogiske modeller – Periodisering & treningsfilosofier / 3.4 Pedagogiske modeller"
      },
      {
        "id": "speed_training_outline",
        "title": "Hurtighet – disposisjon for oppvarming, drag og pauser",
        "text": "Originalmanusets fysiologidisposisjon nevner oppvarming, drag, pauser, serier, restitusjon og løpsteknikk med henvisning til Tønnesen og Olympiatoppen. Notasjonen «restitusjon <70 %» står uten forklaring av hva prosenten måler. Den er dokumentert som et uavklart kildepunkt, ikke som en treningsinstruks. Den detaljerte blokken med eventuelle distanser, intensiteter og pauselengder er ikke funnet. Manusets andre kapitler knytter løpskapasitet til valg av pressbølger og kampintensitet, men beskriver ikke et komplett fysisk treningsprogram.",
        "source": "Fotballdokumentet v1.pdf – 6. Fysiologi – Hurtighet / 2. Defensivt – Pressbølger"
      },
      {
        "id": "speed_play_outline",
        "title": "Hurtighet gjennom lek – fire navngitte øvelsesidéer",
        "text": "Under hurtighet navngir originaldisposisjonen fire lekformer: snipp og snapp, soldat og røver, nummerkappløp og hest og kjerre. De bevares som manusets øvelsesidéer. Reglene, organiseringen, antall spillere, distansene, pausene og tilpasningen til aldersgruppe er ikke beskrevet i den tilgjengelige fysiologiblokken. Dette er derfor et register over kildens navngitte aktiviteter, ikke fire ferdige øvelser eller nye oppføringer i treningsmotoren.",
        "source": "Fotballdokumentet v1.pdf – 6. Fysiologi – Hurtighet / Lek"
      },
      {
        "id": "phys_acceleration",
        "title": "Hurtighet – akselerasjon, toppfart og reaksjon",
        "text": "Akselerasjon er evnen til å øke fart, toppfart er høyeste løpshastighet, og gjentatt sprint er evnen til å gjennomføre flere raske drag. I fotball kommer hurtighet også til uttrykk gjennom reaksjon på pasninger, løp og motstanderens bevegelse. Tren akselerasjon med korte løp fra ulike fotballrelevante utgangsposisjoner, og toppfart med kontrollert oppbygging til høy hastighet på en tilstrekkelig lang bane. Ved ren sprinttrening er god pause nødvendig for å kunne gjenta kvaliteten. Reaksjonsøvelser kan inneholde et uforutsigbart signal, men skal ikke bli en erstatning for løp med god fart. Tren løpsteknikk og beslutning hver for seg når det er hensiktsmessig, og kombiner dem etter hvert. Sprintforskning fra friidrett må tilpasses fotballens krav.",
        "source": "Faglig tillegg – Haugen, Seiler, Sandbakk og Tønnessen (2019), The Training and Development of Elite Sprint Performance, https://doi.org/10.1186/s40798-019-0221-0 | Assessment of Aerobic Fitness and Repeated Sprint Ability in Elite Male Soccer (2025), https://pubmed.ncbi.nlm.nih.gov/40220211/"
      },
      {
        "id": "phys_speed_session",
        "title": "Hurtighetsøkt – oppvarming, drag, pauser og serier",
        "text": "Redaksjonelt økteksempel for friske, løpsvante voksne: start med 10–15 minutter gradvis oppvarming, med rolig aktivitet, dynamiske bevegelser og progressive stigningsløp. Deretter to serier med tre akselerasjoner på 15–20 meter, med omtrent to minutters rolig pause mellom drag og tre–fire minutter mellom serier. Start kontrollert og øk farten når teknikken er god. Den konkrete kombinasjonen er et pedagogisk eksempel, ikke et sitat fra Tønnessen eller en universell dose. Skill denne kvalitetsøkten fra gjentatt sprint med korte pauser, der tretthet er en del av belastningen. Avslutt eller tilpass dersom fart eller bevegelseskvalitet faller tydelig. Gi nok plass til å bremse. Manusets uavklarte restitusjon <70 % brukes ikke som pulsterskel eller belastningsmål.",
        "source": "Faglig tillegg – Olympiatoppen – Oppvarming før trening og konkurranse, https://www.olympiatoppen.no/fagomrader/utholdenhet/fagstoff/oppvarming/ | Haugen, Seiler, Sandbakk og Tønnessen (2019), The Training and Development of Elite Sprint Performance, https://doi.org/10.1186/s40798-019-0221-0"
      },
      {
        "id": "phys_injury_prevention",
        "title": "Skadeforebygging – kontroll, styrke og gradvis belastning",
        "text": "En strukturert, fotballspesifikk oppvarming kan kombinere løp, styrke, balanse, hopp og kontrollert landing. FIFA 11+ er et dokumentert eksempel på et forebyggende program; forskningsoversikter viser redusert samlet skaderisiko i undersøkte spillergrupper, ikke at alle skader kan unngås. Skadefri tilbyr praktiske progresjoner for blant annet bakside lår, lyske, bein og kjerne. Gjennomfør øvelsene med riktig teknikk, tilpass vanskelighetsgrad og øk belastning gradvis. Ved smerter, ny skade eller usikkerhet om retur til trening må fagperson vurdere situasjonen; boka er ikke et rehabiliteringsprogram. Trenerens mål er kontinuitet og god utførelse, ikke å samle flest mulig repetisjoner.",
        "source": "Faglig tillegg – Skadefri – Fotball, https://www.skadefri.no/idretter/fotball | Effect of specific exercise-based football injury prevention programmes (2017), https://pubmed.ncbi.nlm.nih.gov/28087568/"
      },
      {
        "id": "phys_monitoring",
        "title": "Belastningsstyring – forskjellen på hva spilleren gjør og hvordan han reagerer",
        "text": "Registrer treningsvarighet, type aktivitet og opplevd anstrengelse sammen med observasjoner av kvalitet. Løpsdistanse, antall akselerasjoner og høyhastighetsløp kan beskrive ytre belastning dersom det finnes pålitelige data. Opplevd anstrengelse, puls i relevante økter, søvn og generell tilstand sier noe om spillerens respons. To spillere kan gjennomføre samme økt og ha ulik restitusjon. Puls stiger med forsinkelse og er derfor lite egnet som eneste mål for korte sprintdrag. Treningsdagboken kan bidra til å vurdere sammenheng mellom plan, faktisk gjennomføring og utvikling. I spillet brukes bare allerede registrerte belastnings- og formdata; det innføres ikke fiktive GPS-verdier eller medisinske terskler.",
        "source": "Faglig tillegg – Olympiatoppen – Treningsdagbok som verktøy, https://olympiatoppen.no/fagomrader/utholdenhet/fagstoff/treningsdagbok-som-verktoy-for-optimalisering-av-treningsprosessen/ | Assessment of Aerobic Fitness and Repeated Sprint Ability in Elite Male Soccer (2025), https://pubmed.ncbi.nlm.nih.gov/40220211/"
      },
      {
        "id": "phys_recovery",
        "title": "Restitusjon og kampuke – kapasitet må være tilgjengelig",
        "text": "Restitusjon mellom kamper handler blant annet om søvn, tilstrekkelig mat og væske og tilpasning av treningsbelastningen. Behovet varierer mellom spillere og med kampminutter, kampintensitet og hvor tett kampene kommer. Ved én kamp i uka kan treneren prioritere gjenoppbygging etter kampen, en mer krevende treningsperiode når spillerne er klare, og redusert belastning mot ny kamp. Ved to kamper tett på hverandre kan vedlikehold og taktisk forberedelse bli viktigere enn store nye belastninger. Spillere med få kampminutter kan trenge et annet opplegg enn spillere som har gjennomført hele kampen. Eksempelet er en planleggingslogikk, ikke en fast medisinsk restitusjonsfrist.",
        "source": "Faglig tillegg – Evidence-Based Recovery in Soccer (2022), https://pubmed.ncbi.nlm.nih.gov/36196351/ | The Time Course of Postmatch Physical Impairments in Professional Soccer (2025), https://pubmed.ncbi.nlm.nih.gov/40845278/"
      },
      {
        "id": "onenote_injury_interruptions",
        "title": "Gascoigne, Van Basten, Giuseppe Rossi og Falcao – skadeavbrudd",
        "text": "Manuset bruker disse karrierene til å reflektere over avbrudd i sportslig utvikling. Tottenham dokumenterer Gascoignes alvorlige kneskade i FA-cupfinalen 1991. Van Basten har selv beskrevet plagene som gjorde at han avsluttet karrieren tidlig. UEFA dokumenterer Giuseppe Rossis skadefravær i 2011 og 2014, mens FIFA bekrefter at Falcao mistet VM i 2014 etter en kneskade. Historiene viser forskjellige forløp, ikke en felles medisinsk forklaring. I Fotballboka knyttes de til forsvarlig belastningsstyring, individuell oppfølging og usikkerheten rundt tilbakekomst. Ingen diagnose utover dokumenterte opplysninger, rehabiliteringsprotokoll eller prognose utledes.",
        "source": "OneNote – Fotballteori (Den 12.06.2026).one, råuttrekk 0x001a4e04–0x001a510c, 0x001a808c–0x001a8f8c, 0x001aaa3c–0x001aae24; Tottenham, https://www.tottenhamhotspur.com/news/989049/spurs-vs-newcastle-boot-in-both-camps-paul-gascoigne ; BBC, https://www.bbc.co.uk/sport/football/54816131 ; UEFA, https://www.uefa.com/uefaeuropaleague/news/0219-0e8c152c8589-8809a1eacaaf-1000--fiorentina-lose-rossi-to-another-knee-injury/ ; FIFA, https://inside.fifa.com/news/five-captains-in-the-spotlight"
      },
      {
        "id": "method_frade",
        "title": "Vítor Frade – taktisk periodisering",
        "text": "Taktisk periodisering tar utgangspunkt i hvordan laget ønsker å spille. Frade beskriver spillideen som det styrende utgangspunktet for treningsprosessen: øvelsenes detaljer skal bidra til den ønskede helheten. Fysisk, teknisk, taktisk og mental forberedelse ses derfor i sammenheng. En praktisk anvendelse kan være å velge et problem i eget restforsvar og utforme en spilløvelse som gjentar nettopp dette problemet med relevante motstandere og medspillere. Belastningen må samtidig tilpasses kampkalender og spillernes tilstand. En systematisk oversikt fra 2020 fant ikke eksperimentelle studier som dokumenterte metodens effekt; dette er en begrensning i kunnskapsgrunnlaget, ikke bevis for at metoden er ineffektiv. Ingen bestemt ukesyklus eller overlegen effekt tilskrives Frade her.",
        "source": "Faglig tillegg – Frades egen redegjørelse, https://www.tacticalperiodisation.com/2024/04/24/professor-vitor-frade-clarifica-professor-vitor-frade-clarifies-3/ ; systematisk oversikt (2020), https://doi.org/10.5114/hm.2020.95329 ; navn fra Fotballteori.one 0x000089ac og 0x001a3590"
      },
      {
        "id": "method_verheijen",
        "title": "Raymond Verheijen – fotballhandlinger, kvalitet og belastning",
        "text": "Verheijen beskriver fotballform gjennom handlinger i spillet, blant annet eksplosive handlinger og hyppigheten av dem. Han fremhever sammenhengen mellom treningskvalitet, tretthet og muligheten til å gjenta krevende handlinger. I en fotballøvelse bør treneren derfor følge både om spillerne løser den taktiske oppgaven og om utførelsen svekkes når belastningen øker. Kortere serier eller lengre pauser kan være aktuelle justeringer når kvaliteten faller; avgjørelsen må bygge på øvelsens mål og individuell belastning. Dette er en faglig anvendelse av perspektivet, ikke Verheijens komplette periodiseringsprogram. OneNote-manusets kritikk av repetisjoner uten kampoverføring beholdes som en metodisk problemstilling, ikke som en dokumentert avvisning av all isolert ferdighetstrening.",
        "source": "Faglig tillegg – Verheijen-intervju, https://timesofindia.indiatimes.com/sports/football/interviews/everything-has-to-be-football-related-raymond-verheijen/articleshow/18517603.cms ; https://offsiderulepodcast.com/2015/07/16/interview-fitness-coach-raymond-verheijen-on-why-chelsea-are-better-prepared-than-manchester-united-or-arsenal/ ; Fotballteori.one 0x00078f44 og 0x001a3590"
      }
    ]
  }
];
