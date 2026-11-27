// Fotballboka theory: editorial explanations linked to existing canonical knowledge principles and sourced club examples. No new simulation rules.
export const THEORY_CHAPTERS = [
  {
    "id": "press_cover_shift",
    "title": "Press, sikring og sideforskyvning",
    "principles": [
      "defending_uses_first_second_third_defender",
      "defensive_block_must_choose_risk_level",
      "short_commands_create_team_speed"
    ],
    "clubs": [
      "brann",
      "valerenga",
      "hodd"
    ],
    "concept": "Førsteforsvareren styrer ballfører mot en bestemt utvei, andreforsvareren dekker rommet presspilleren forlater, og tredjeforsvareren beskytter neste pasning. Hele blokken må flytte mens ballen er på vei; hvis bare førstepresseren flytter, åpnes et rom bak ham.",
    "dilemma": "Å støte tidlig kan hindre en vending, men skaper også et rom bak presspilleren. Mot en spiller som kan vende under press må andreforsvareren være nær nok til å overta uten at stopperne forlater dybden.",
    "manager": "Velg presshøyde etter lagets samhandling og rollepassform. I kampanalysen: skill mellom et brutt førsteforsvar og manglende sikring.",
    "practice": "Spill 4 mot 4 med to målsoner. Stopp spillet ved ballens sideskift og la forsvarerne identifisere 1F, 2F og 3F.",
    "diagrams": [
      {
        "kind": "pitch",
        "title": "Tre forsvarsoppgaver",
        "note": "1F styrer ballfører, 2F beskytter rommet bak 1F, 3F dekker neste pasningsrom. Pilene viser mulige forflytninger.",
        "players": [
          [
            23,
            28,
            "Ballfører",
            "a"
          ],
          [
            39,
            67,
            "Mottaker",
            "a"
          ],
          [
            37,
            28,
            "1F",
            "d"
          ],
          [
            52,
            46,
            "2F",
            "d"
          ],
          [
            68,
            66,
            "3F",
            "d"
          ],
          [
            82,
            37,
            "Stopper",
            "d"
          ]
        ],
        "arrows": [
          [
            37,
            28,
            29,
            28
          ],
          [
            52,
            46,
            44,
            39
          ],
          [
            68,
            66,
            56,
            61
          ]
        ]
      },
      {
        "kind": "flow",
        "title": "Når presset brytes",
        "note": "Første press er ikke hele forsvarsfasen. En ny sikringsoppgave må overtas.",
        "start": "Motstander passerer 1F",
        "decision": "Er 2F i posisjon?",
        "branches": [
          "Ja → forsink og reorganiser",
          "Nei → 3F beskytter neste rom"
        ]
      }
    ]
  },
  {
    "id": "rest_defence",
    "title": "Restforsvar og gjenvinning",
    "principles": [
      "dribbling_needs_purpose_and_cover",
      "defensive_block_must_choose_risk_level",
      "physical_capacity_sets_tactical_ceiling"
    ],
    "clubs": [
      "brann",
      "stromsgodset",
      "tromso"
    ],
    "concept": "Restforsvar er organiseringen av laget mens det selv angriper. Når ballen mistes, avgjør avstanden til ballfører og dekningen av neste pasning om laget kan gjenvinne umiddelbart eller må falle av. Det er ikke nødvendigvis de samme spillerne som presser og sikrer.",
    "dilemma": "Flere samtidige boksløp kan øke avslutningsmuligheten, men et tomt sentralt returrom gjør første kontringspasning farligere. Et gjenvinningspress uten bakre sikring kan derfor bli mer risikabelt enn et kontrollert fall.",
    "manager": "Bruk en balanserende midtbanerolle og vurder hvor mange forsvarere som går frem. Les kampmotorens restforsvarsvurdering før du øker risikoen.",
    "practice": "Spill 6 mot 6 med omstillingsmål. Etter balltap må laget enten stenge første pasning sammen eller falle samlet tilbake.",
    "diagrams": [
      {
        "kind": "pitch",
        "title": "Angrep med restforsvar",
        "note": "Flere blå spillere angriper boksen. To stoppere og en sekser beskytter det sentrale kontringsrommet.",
        "players": [
          [
            69,
            18,
            "Kant",
            "a"
          ],
          [
            78,
            40,
            "Spiss",
            "a"
          ],
          [
            77,
            62,
            "Indreløper",
            "a"
          ],
          [
            68,
            83,
            "Back",
            "a"
          ],
          [
            46,
            50,
            "Sekser",
            "a"
          ],
          [
            27,
            34,
            "Stopper",
            "a"
          ],
          [
            27,
            68,
            "Stopper",
            "a"
          ],
          [
            58,
            49,
            "Motspiller",
            "d"
          ],
          [
            38,
            25,
            "Kontring",
            "d"
          ]
        ],
        "arrows": [
          [
            69,
            18,
            84,
            43
          ],
          [
            77,
            62,
            90,
            59
          ],
          [
            58,
            49,
            38,
            25
          ],
          [
            46,
            50,
            43,
            38
          ]
        ]
      }
    ]
  },
  {
    "id": "third_man",
    "title": "Tredjemannsspill og støttevinkler",
    "principles": [
      "combination_game_beats_isolated_dribbling",
      "attacking_patterns_need_timing",
      "technical_skill_must_survive_pressure"
    ],
    "clubs": [
      "bodo_glimt",
      "rosenborg",
      "viking",
      "tromso"
    ],
    "concept": "A har ikke en åpen pasningslinje til C, men kan spille til B. B legger av eller spiller videre til C, som allerede beveger seg utenfor presspillernes synsfelt. Tredjemann må være spillbar når avlegget kommer, ikke først begynne å løpe når B har mottatt.",
    "dilemma": "En støttepasning bakover kan virke defensiv, men åpne en bedre fremovervinkel. Hvis B mottar feilvendt uten støtte, eller C starter for tidlig, kan den samme kombinasjonen føre til balltap.",
    "manager": "Se etter komplementære roller: mottaker, støtte og løper. Bruk sentral kombinasjon eller posisjonsspill mot en blokk som stenger den direkte pasningen.",
    "practice": "Tren 3 mot 2 med mål bak presset. Angrepet får poeng når en tredje spiller mottar rettvendt etter et avlegg.",
    "diagrams": [
      {
        "kind": "pitch",
        "title": "A → B → C",
        "note": "Direkte pasning til C er skjermet. B blir mellomledd og åpner en ny vinkel.",
        "players": [
          [
            18,
            50,
            "A: ballfører",
            "a"
          ],
          [
            44,
            24,
            "B: støtte",
            "a"
          ],
          [
            68,
            67,
            "C: tredjemann",
            "a"
          ],
          [
            42,
            50,
            "Press",
            "d"
          ],
          [
            59,
            43,
            "Sikring",
            "d"
          ]
        ],
        "arrows": [
          [
            18,
            50,
            44,
            24
          ],
          [
            44,
            24,
            68,
            67
          ],
          [
            68,
            67,
            87,
            68
          ]
        ]
      }
    ]
  },
  {
    "id": "overlap_underlap",
    "title": "Overlapping og underlapping",
    "principles": [
      "attacking_patterns_need_timing",
      "total_football_needs_role_flexibility",
      "dribbling_needs_purpose_and_cover"
    ],
    "clubs": [
      "viking",
      "stromsgodset",
      "tromso"
    ],
    "concept": "Ved overlapping kommer støttespilleren utenfor ballfører; ved underlapping løper han innenfor. Løpet kan enten motta ballen eller binde en forsvarer slik at ballfører får en annen pasningslinje. Det avgjørende er at to spillere ikke okkuperer samme rom uten hensikt.",
    "dilemma": "Overlap gir bredde når kanten trekker inn. Underlap kan true halvrommet når kanten holder bredde. Hvis backen går tidlig uten sikring, kan en brutt pasning åpne siden for kontring.",
    "manager": "Vurder om kant og back har komplementære oppgaver. Ikke anta at underlapping allerede har en selvstendig kampmotor: bruk prinsippet i rolle- og formasjonsvalgene.",
    "practice": "Tren 3 mot 2 i sidekorridoren. La ballfører lese om forsvareren følger ytre eller indre løp før pasning.",
    "diagrams": [
      {
        "kind": "pitch",
        "title": "Overlapping – utenfor ballfører",
        "note": "Kantspilleren binder forsvarer mens backen kommer rundt på utsiden.",
        "players": [
          [
            39,
            24,
            "Kant",
            "a"
          ],
          [
            18,
            14,
            "Back",
            "a"
          ],
          [
            51,
            28,
            "Forsvarer",
            "d"
          ],
          [
            69,
            45,
            "Stopper",
            "d"
          ],
          [
            64,
            68,
            "Spiss",
            "a"
          ]
        ],
        "arrows": [
          [
            18,
            14,
            72,
            10
          ],
          [
            39,
            24,
            57,
            40
          ],
          [
            72,
            10,
            84,
            49
          ]
        ]
      },
      {
        "kind": "pitch",
        "title": "Underlapping – innenfor ballfører",
        "note": "Kanten holder bredde, mens støttespilleren løper gjennom halvrommet.",
        "players": [
          [
            39,
            15,
            "Kant",
            "a"
          ],
          [
            22,
            40,
            "Back",
            "a"
          ],
          [
            53,
            18,
            "Forsvarer",
            "d"
          ],
          [
            69,
            45,
            "Stopper",
            "d"
          ],
          [
            62,
            74,
            "Spiss",
            "a"
          ]
        ],
        "arrows": [
          [
            22,
            40,
            72,
            32
          ],
          [
            39,
            15,
            72,
            32
          ],
          [
            72,
            32,
            85,
            56
          ]
        ]
      }
    ]
  },
  {
    "id": "overloads_space",
    "title": "Overtall, rom og spillvending",
    "principles": [
      "combination_game_beats_isolated_dribbling",
      "football_history_explains_formations",
      "attacking_patterns_need_timing"
    ],
    "clubs": [
      "molde",
      "bodo_glimt",
      "tromso"
    ],
    "concept": "Numerisk overtall betyr flere spillere i en sone; posisjonelt overtall betyr at en spiller blir spillbar i et rom motstanderen ikke kan dekke uten å oppgi et annet rom. En ekstra spiller bak presset har liten verdi hvis alle pasningslinjene er stengt. Bredde kan trekke blokken slik at sentrale mottakere blir fri.",
    "dilemma": "Overbelastning på ballside kan skape korte pasningsmuligheter, men gjør motsatt side viktig. En sen spillvending lar forsvaret forskyve; en tidlig vending uten mottaker kan gi balltap.",
    "manager": "Velg bredde og støtte etter hvor motstanderen har sin styrke. Vurder keeperoppbygging, sentral skjerming og sidesikring som ulike oppgaver.",
    "practice": "Spill 5 mot 4 med en nøytral spiller på motsatt kant. Laget må enten spille gjennom presset eller vende når ballside blir stengt.",
    "diagrams": [
      {
        "kind": "pitch",
        "title": "Trekk presset til én side",
        "note": "Flere spillere samles rundt ballen; en dyp støtte vender til en bred, fri mottaker.",
        "players": [
          [
            30,
            19,
            "Ballfører",
            "a"
          ],
          [
            19,
            32,
            "Støtte",
            "a"
          ],
          [
            46,
            25,
            "Indreløper",
            "a"
          ],
          [
            45,
            85,
            "Fri back",
            "a"
          ],
          [
            40,
            18,
            "Press",
            "d"
          ],
          [
            51,
            37,
            "Press",
            "d"
          ],
          [
            66,
            52,
            "Sikring",
            "d"
          ]
        ],
        "arrows": [
          [
            30,
            19,
            19,
            32
          ],
          [
            19,
            32,
            45,
            85
          ],
          [
            45,
            85,
            80,
            85
          ]
        ]
      }
    ]
  },
  {
    "id": "formations",
    "title": "Formasjoner som problemløsning",
    "principles": [
      "football_history_explains_formations",
      "wm_requires_clear_marking_and_support",
      "catenaccio_is_control_not_only_defence",
      "total_football_needs_role_flexibility"
    ],
    "clubs": [
      "rosenborg",
      "valerenga",
      "tromso"
    ],
    "concept": "En formasjon er en fordeling av ansvar, ikke en frossen posisjon. 4-4-2 kan gi to tydelige midtbaneledd og to fremre spillere, 4-3-3 kan gi tre sentrale relasjoner, mens 3-5-2 kan gi flere oppspillsspillere og bredde fra vingbacker. Ingen av systemene er alltid best. De historiske prinsippene WM, catenaccio og totalfotball belyser markering, sikring og rollebytter.",
    "dilemma": "Et ekstra sentralt ledd kan styrke pasningsdekning, men koste bredde eller en fremre presser. Tre stoppere gir flere bakre pasningsalternativer, men vingbackenes høyde avgjør hvor mye bredde og retursikring laget faktisk har.",
    "manager": "Sammenlign spillernes rollepassform, lagbalanse og tilgjengelig støtte før du skifter formasjon. Les formasjonen både med og uten ball.",
    "practice": "Bruk samme tropp i 4-4-2 og 4-3-3. Sammenlign hvem som dekker midten, hvem som gir bredde og hvem som sikrer ved balltap.",
    "diagrams": [
      {
        "kind": "pitch",
        "title": "4-4-2: to ledd og to spisser",
        "note": "Nominell oppstilling, ikke faste kampkoordinater.",
        "players": [
          [
            9,
            50,
            "GK",
            "a"
          ],
          [
            26,
            15,
            "LB",
            "a"
          ],
          [
            26,
            38,
            "CB",
            "a"
          ],
          [
            26,
            62,
            "CB",
            "a"
          ],
          [
            26,
            85,
            "RB",
            "a"
          ],
          [
            54,
            15,
            "LM",
            "a"
          ],
          [
            54,
            38,
            "CM",
            "a"
          ],
          [
            54,
            62,
            "CM",
            "a"
          ],
          [
            54,
            85,
            "RM",
            "a"
          ],
          [
            81,
            37,
            "ST",
            "a"
          ],
          [
            81,
            63,
            "ST",
            "a"
          ]
        ],
        "arrows": []
      },
      {
        "kind": "pitch",
        "title": "4-3-3: sekser, indreløpere og bredde",
        "note": "Nominell oppstilling med tre sentrale midtbanespillere.",
        "players": [
          [
            9,
            50,
            "GK",
            "a"
          ],
          [
            26,
            15,
            "LB",
            "a"
          ],
          [
            26,
            38,
            "CB",
            "a"
          ],
          [
            26,
            62,
            "CB",
            "a"
          ],
          [
            26,
            85,
            "RB",
            "a"
          ],
          [
            44,
            50,
            "DM",
            "a"
          ],
          [
            59,
            29,
            "CM",
            "a"
          ],
          [
            59,
            71,
            "CM",
            "a"
          ],
          [
            81,
            15,
            "LW",
            "a"
          ],
          [
            85,
            50,
            "ST",
            "a"
          ],
          [
            81,
            85,
            "RW",
            "a"
          ]
        ],
        "arrows": []
      },
      {
        "kind": "pitch",
        "title": "3-5-2: tre stoppere og vingbacker",
        "note": "Vingbackene har både bredde- og sikringsansvar.",
        "players": [
          [
            9,
            50,
            "GK",
            "a"
          ],
          [
            26,
            23,
            "CB",
            "a"
          ],
          [
            26,
            50,
            "CB",
            "a"
          ],
          [
            26,
            77,
            "CB",
            "a"
          ],
          [
            53,
            12,
            "LWB",
            "a"
          ],
          [
            46,
            50,
            "DM",
            "a"
          ],
          [
            59,
            31,
            "CM",
            "a"
          ],
          [
            59,
            69,
            "CM",
            "a"
          ],
          [
            53,
            88,
            "RWB",
            "a"
          ],
          [
            82,
            37,
            "ST",
            "a"
          ],
          [
            82,
            63,
            "ST",
            "a"
          ]
        ],
        "arrows": []
      }
    ]
  },
  {
    "id": "false_nine_inverted_back",
    "title": "Falsk nier og invertert back",
    "principles": [
      "total_football_needs_role_flexibility",
      "combination_game_beats_isolated_dribbling",
      "attacking_patterns_need_timing"
    ],
    "clubs": [
      "tromso",
      "stabak",
      "bodo_glimt"
    ],
    "concept": "En falsk nier møter lavere enn en tradisjonell spiss og kan trekke en stopper ut eller bli fri mellom leddene. En invertert back beveger seg inn i banen i oppbyggingen og kan gi ekstra sentral støtte. Begge er rollebevegelser som endrer lagets romfordeling; de krever at andre spillere erstatter bredden eller dybden som forlates.",
    "dilemma": "Falsk nier uten bakromsløp kan gjøre laget ufarlig foran blokken. Invertert back uten bred kant eller sikring kan åpne ytterkorridoren ved balltap. En stopper bør ikke automatisk følge en møtende spiss dersom en midtbanespiller kan overta.",
    "manager": "Bruk møtende spiss sammen med dybdeløpere og behold bredde. Invertering er her et teoriprinsipp, ikke en påstand om en ny separat kampmekanikk.",
    "practice": "Spill 6 mot 6 med tre korridorer. Når spissen møter, må en annen true bakrommet. Når backen trekker inn, må en annen bevare bredde.",
    "diagrams": [
      {
        "kind": "pitch",
        "title": "Falsk nier møter, andre løper",
        "note": "Spissen kommer ned mellom leddene, kant eller indreløper angriper rommet bak.",
        "players": [
          [
            60,
            50,
            "Falsk nier",
            "a"
          ],
          [
            45,
            20,
            "Kant",
            "a"
          ],
          [
            44,
            77,
            "Indreløper",
            "a"
          ],
          [
            73,
            34,
            "Stopper",
            "d"
          ],
          [
            73,
            66,
            "Stopper",
            "d"
          ],
          [
            43,
            52,
            "Skjerm",
            "d"
          ]
        ],
        "arrows": [
          [
            60,
            50,
            48,
            44
          ],
          [
            45,
            20,
            87,
            25
          ],
          [
            44,
            77,
            87,
            68
          ]
        ]
      },
      {
        "kind": "pitch",
        "title": "Invertert back som sentral støtte",
        "note": "Backen flytter inn mot sekseren mens kanten holder bredde. Den ytre korridoren må fortsatt sikres.",
        "players": [
          [
            23,
            19,
            "Back",
            "a"
          ],
          [
            36,
            50,
            "Sekser",
            "a"
          ],
          [
            65,
            15,
            "Kant",
            "a"
          ],
          [
            18,
            61,
            "Stopper",
            "a"
          ],
          [
            53,
            45,
            "Press",
            "d"
          ],
          [
            55,
            71,
            "Press",
            "d"
          ]
        ],
        "arrows": [
          [
            23,
            19,
            36,
            35
          ],
          [
            18,
            61,
            36,
            35
          ],
          [
            36,
            35,
            65,
            15
          ]
        ]
      }
    ]
  }
];
