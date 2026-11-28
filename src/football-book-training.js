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
      }
    ]
  }
];
