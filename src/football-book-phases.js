// Four phases of football: teaching material grounded in existing engine modules; diagrams are schematic, not a second engine.
export const PHASE_CHAPTERS = [
  {
    "id": "in_possession",
    "title": "Etablert angrep – fra oppbygging til avslutning",
    "principles": [
      "combination_game_beats_isolated_dribbling",
      "attacking_patterns_need_timing",
      "technical_skill_must_survive_pressure"
    ],
    "clubs": [
      "bodo_glimt",
      "tromso",
      "stabak",
      "stromsgodset"
    ],
    "concept": "Når laget har kontroll på ballen, handler oppgaven om å skape og utnytte en fordel før motstanderen rekker å omorganisere seg. Oppbygging, progresjon og avslutning er forskjellige problemer. En fri stopper gir ikke nødvendigvis en fri midtbanespiller; et mottak mellom leddene gir ikke nødvendigvis et gjennombrudd bak linjen. Ballfører, støtte, dybde og restforsvar må derfor fungere samtidig.",
    "dilemma": "Et lag kan trekke flere spillere mot ballen for å skape korte pasninger, men dermed miste dybde og bredde. Mot høyt press kan det være bedre å spille forbi presset; mot lav blokk må laget ofte flytte forsvaret før gjennombruddet. Kontroller om neste mottaker har en spillbar vinkel og en ny utvei, ikke bare om pasningen er mulig.",
    "manager": "Mot høyt press: velg en oppbyggingsstruktur som kan finne en fri mottaker. Mot kompakt blokk: vurder bredde, overtall, tredjemann og rollepassform. Kampmotoren har egne faser for oppbygging mot høyt press og angrep mot kompakt blokk. De modellerer mulige forløp, ikke hvert faktiske ballmottak eller en komplett kontinuerlig ballbesittelse.",
    "practice": "Spill 7 mot 6 med keeper og mål. Start hvert angrep bakfra. Første poeng gis når et pressledd passeres, andre når en spiller mottar rettvendt mellom leddene, tredje ved en god avslutning. Ved balltap får forsvarslaget angripe et omstillingsmål; vurder også sikringen.",
    "engineRefs": [
      {
        "file": "src/football-matchday-high-press-v6.js",
        "symbol": "resolveHighPressBuildUp"
      },
      {
        "file": "src/football-matchday-compact-block-v6.js",
        "symbol": "resolveCompactBlockAttack"
      },
      {
        "file": "src/football-matchday-sequence-v8.js",
        "symbol": "resolveAuthoredSequencePeriod"
      }
    ],
    "diagrams": [
      {
        "kind": "pitch",
        "title": "Tre forskjellige progresjonsproblemer",
        "note": "Oppbygging bak første pressledd, mottak mellom leddene og et løp bak forsvarslinjen. En spiller må kunne støtte hvert steg.",
        "players": [
          [
            12,
            48,
            "Stopper",
            "a"
          ],
          [
            33,
            29,
            "Sekser",
            "a"
          ],
          [
            54,
            63,
            "Mottaker",
            "a"
          ],
          [
            70,
            24,
            "Løper",
            "a"
          ],
          [
            25,
            48,
            "Press",
            "d"
          ],
          [
            46,
            38,
            "Midtbane",
            "d"
          ],
          [
            75,
            36,
            "Stopper",
            "d"
          ],
          [
            75,
            70,
            "Stopper",
            "d"
          ]
        ],
        "arrows": [
          [
            12,
            48,
            33,
            29
          ],
          [
            33,
            29,
            54,
            63
          ],
          [
            54,
            63,
            88,
            25
          ],
          [
            70,
            24,
            88,
            25
          ]
        ]
      },
      {
        "kind": "flow",
        "title": "Neste valg med ball",
        "note": "Etablert angrep er en serie valg, ikke en automatisk pasningssekvens.",
        "start": "Kontrollert ball",
        "decision": "Finnes en trygg fremovervinkel?",
        "branches": [
          "Ja → angrip neste rom med støtte",
          "Nei → behold, flytt presset og vurder på nytt"
        ]
      }
    ]
  },
  {
    "id": "out_of_possession",
    "title": "Etablert forsvar – press, blokk og dybde",
    "principles": [
      "defending_uses_first_second_third_defender",
      "defensive_block_must_choose_risk_level",
      "keeper_communication_organizes_the_block"
    ],
    "clubs": [
      "brann",
      "valerenga",
      "hodd",
      "tromso"
    ],
    "concept": "Etablert forsvar handler om å styre motstanderens muligheter. Høyt press kan begrense oppbygging, en midtblokk kan lokke ballen til et pressignal, og en lav blokk kan beskytte rom nær eget mål. Presshøyde og forsvarslinjens høyde er ikke det samme. Laget må kunne stenge farlige pasninger, beskytte dybden og flytte seg når ballen skifter side.",
    "dilemma": "Hvis spissen presser høyt mens midtbanen og stopperne blir stående, blir avstanden mellom leddene stor. Hvis hele laget skyver opp, kan en direkte pasning true bakrom. En lav blokk kan beskytte dybden, men gir motstanderen tid til å etablere angrep og slå innlegg. Ingen av valgene er risikofrie.",
    "manager": "Velg press og linje som passer samhandling, rollepassform og tilgjengelige sikringsspillere. Kampmotorens eget press mot motstanderens oppbygging og modellen for sonal forskyvning belyser ulike forsvarsoppgaver. En høy gjenvinningsverdi betyr ikke at alle bakrom er beskyttet.",
    "practice": "Spill 8 mot 8 med tre lengdesoner. Forsvarslaget varierer mellom høyt press, midtblokk og lav blokk. Bruk samme angrepslag i alle tre og vurder hvilke pasninger som blir tillatt, hvor første press brytes, og hvem som dekker bak.",
    "engineRefs": [
      {
        "file": "src/football-matchday-own-press-v6.js",
        "symbol": "resolveOwnPressAgainstOpponent"
      },
      {
        "file": "src/football-matchday-sequence-v8.js",
        "symbol": "resolveOpponentZonalShift"
      }
    ],
    "diagrams": [
      {
        "kind": "pitch",
        "title": "Midtblokk med separate sikringsledd",
        "note": "Førstepresser styrer ballen. Midtbanen stenger sentrale mottakere, stopperne beholder dybde. Angriperne er blå.",
        "players": [
          [
            18,
            30,
            "Ballfører",
            "a"
          ],
          [
            45,
            48,
            "Sekser",
            "a"
          ],
          [
            52,
            85,
            "Kant",
            "a"
          ],
          [
            31,
            30,
            "Press",
            "d"
          ],
          [
            52,
            28,
            "Midtbane",
            "d"
          ],
          [
            58,
            52,
            "Skjerm",
            "d"
          ],
          [
            56,
            78,
            "Midtbane",
            "d"
          ],
          [
            79,
            34,
            "Stopper",
            "d"
          ],
          [
            79,
            66,
            "Stopper",
            "d"
          ]
        ],
        "arrows": [
          [
            31,
            30,
            25,
            30
          ],
          [
            52,
            28,
            45,
            36
          ],
          [
            56,
            78,
            50,
            66
          ]
        ]
      },
      {
        "kind": "flow",
        "title": "Når første press brytes",
        "note": "Å avverge en pasning og å beskytte neste rom er separate oppgaver.",
        "start": "Motstanderen passerer pressleddet",
        "decision": "Har vi sikring bak presset?",
        "branches": [
          "Ja → forsink, overta og organiser",
          "Nei → beskytt dybde og målrom først"
        ]
      }
    ]
  },
  {
    "id": "transition_attack",
    "title": "Offensiv overgang – gjennombrudd eller kontroll",
    "principles": [
      "attacking_patterns_need_timing",
      "combination_game_beats_isolated_dribbling",
      "defensive_block_must_choose_risk_level"
    ],
    "clubs": [
      "rosenborg",
      "lillestrom",
      "tromso",
      "brann"
    ],
    "concept": "En offensiv overgang starter når laget vinner ballen. Motstanderens angrepsorganisering kan ha etterlatt rom på siden eller bak siste ledd. Første blikk bør undersøke om et gjennombrudd faktisk er tilgjengelig. Hurtig angrep betyr ikke at enhver pasning må slås fremover; en kort støttepasning kan gjøre neste handling raskere og sikrere.",
    "dilemma": "En tidlig vertikal pasning kan utnytte et kortvarig rom, men hvis mottakeren er isolert kan ballen gå rett tilbake. Ved dårlig gjennombruddsvindu kan kontrollert ballbevaring være mer verdifull enn en tvunget kontring. Løper og pasningsspiller må lese samme øyeblikk.",
    "manager": "Søk dybdeløpere, mottakere som kan holde ballen og støtte som kan sikre andreballen. Tromsø-modellen for selektiv overgang skiller mellom simulert gjenvinning, valg av gjennombrudd eller ballbevaring, og gjennombruddets utfall. LSKs direkte spill illustrerer andreball som separat oppgave. Dette er avgrensede modellfaser, ikke en registrering av alle ballvinninger.",
    "practice": "Spill 6 mot 6 med to overgangsmål. Når laget vinner ballen, får det poeng enten ved kontrollert gjennombrudd eller ved å beholde ballen til en ny støttevinkel åpnes. Treneren spør hvorfor spillerne valgte det ene fremfor det andre.",
    "engineRefs": [
      {
        "file": "src/football-matchday-sequence-v8.js",
        "symbol": "resolveOpponentSelectiveTransition"
      },
      {
        "file": "src/football-matchday-sequence-v8.js",
        "symbol": "resolveOpponentDirectSecondBall"
      }
    ],
    "diagrams": [
      {
        "kind": "pitch",
        "title": "Første støtte og dybdeløp",
        "note": "Ballvinneren får en støttepasning og en fremovermulighet. Løperen truer bakrommet mens sikringen holder igjen.",
        "players": [
          [
            31,
            48,
            "Ballvinner",
            "a"
          ],
          [
            20,
            68,
            "Støtte",
            "a"
          ],
          [
            48,
            23,
            "Løper",
            "a"
          ],
          [
            17,
            28,
            "Sikring",
            "a"
          ],
          [
            43,
            49,
            "Motpress",
            "d"
          ],
          [
            69,
            35,
            "Stopper",
            "d"
          ],
          [
            69,
            70,
            "Stopper",
            "d"
          ]
        ],
        "arrows": [
          [
            31,
            48,
            20,
            68
          ],
          [
            20,
            68,
            82,
            25
          ],
          [
            48,
            23,
            82,
            25
          ]
        ]
      },
      {
        "kind": "flow",
        "title": "Kontring eller kontroll?",
        "note": "Pedagogisk beslutningsmodell, inspirert av den selektive overgangsmekanikken; ikke en målt frekvens.",
        "start": "Ballvinning",
        "decision": "Åpent rom OG spillbar mottaker?",
        "branches": [
          "Ja → gjennombrudd med støtte",
          "Nei → behold og bygg nytt angrep"
        ]
      }
    ]
  },
  {
    "id": "transition_defend",
    "title": "Defensiv overgang – gjenvinn, forsink eller fall",
    "principles": [
      "dribbling_needs_purpose_and_cover",
      "defending_uses_first_second_third_defender",
      "physical_capacity_sets_tactical_ceiling"
    ],
    "clubs": [
      "brann",
      "stromsgodset",
      "tromso"
    ],
    "concept": "Defensiv overgang starter i det laget mister ballen. Oppgaven begynner egentlig før tapet, med restforsvaret som står igjen bak angrepet. Nærmeste spiller kan presse den nye ballføreren, andre må stenge første fremoverpasning, og en separat sikring må beskytte neste rom. Dersom presset ikke kan nå ballen, er forsinkelse eller fall en mulig bedre løsning.",
    "dilemma": "Et aggressivt gjenvinningspress er mest nyttig når spillerne er tett på ballen og har sikring. Hvis ballfører har tid og kan spille forbi, risikerer flere fremadstormende forsvarere å gjøre situasjonen verre. Det er derfor nødvendig å skille mellom evnen til å bryte første pasning og evnen til å stanse kontringen etter at presset er passert.",
    "manager": "Se på lagets press, balanse og restforsvar sammen. Den eksisterende overgangsmotoren modellerer første fremoverpasning etter oppbyggingstap og deretter restforsvarets kontroll. Et avverget gjennombrudd er ikke automatisk en ny sjanse til laget. Ingen ekstra xG eller ny motor innføres i dette kapitlet.",
    "practice": "Spill 6 mot 6 med keeper og to kontringsmål. Ved balltap må nærmeste spiller stenge fremoverretningen; de øvrige velger mellom å ta bort støttepasningen og falle mot eget mål. Gjenta fra både tette og spredte angrepsposisjoner.",
    "engineRefs": [
      {
        "file": "src/football-matchday-turnover-v6.js",
        "symbol": "resolveTurnoverTransition"
      },
      {
        "file": "src/football-matchday-own-press-v6.js",
        "symbol": "resolveOwnPressAgainstOpponent"
      }
    ],
    "diagrams": [
      {
        "kind": "pitch",
        "title": "Restforsvar etter brutt angrep",
        "note": "Angripere i blått er nå ballvinnende lag. Nærmeste lyse forsvarer presser, en annen dekker støttepasningen og stopperne beskytter dybden.",
        "players": [
          [
            37,
            49,
            "Ballvinner",
            "a"
          ],
          [
            54,
            23,
            "Utvei",
            "a"
          ],
          [
            70,
            68,
            "Løper",
            "a"
          ],
          [
            27,
            47,
            "Gjenvinner",
            "d"
          ],
          [
            49,
            35,
            "Dekning",
            "d"
          ],
          [
            72,
            31,
            "Stopper",
            "d"
          ],
          [
            82,
            66,
            "Stopper",
            "d"
          ]
        ],
        "arrows": [
          [
            27,
            47,
            34,
            49
          ],
          [
            49,
            35,
            51,
            27
          ],
          [
            72,
            31,
            80,
            33
          ],
          [
            82,
            66,
            88,
            67
          ]
        ]
      },
      {
        "kind": "flow",
        "title": "To forsvarsgater etter tap",
        "note": "Første pasning og restforsvar må vurderes hver for seg.",
        "start": "Balltap",
        "decision": "Kan første pasning stenges?",
        "branches": [
          "Ja → gjenvinn eller forsink",
          "Nei → restforsvar må kontrollere neste rom"
        ]
      }
    ]
  }
];
