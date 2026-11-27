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
    "concept": "Start med en gjentakende, konkret kampatferd, ikke et generelt ønske om å bli bedre. Hvis første pressledd brytes, må treneren undersøke om ballfører fikk for mye tid, om andre forsvarer kom for sent, eller om sikringen bak var for svak. Hvert problem krever en annen øvelse. Formuler ett observerbart mål før økta, for eksempel at neste pasningsalternativ blir stengt samtidig med førsteforsvaret.",
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
