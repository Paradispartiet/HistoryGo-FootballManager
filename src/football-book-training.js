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
    ]
  }
];
