// Fotballboka: all 27 canonical game roles grouped by responsibility. Descriptions explain existing role and relationship rules, not new engine behaviour.
export const ROLE_CHAPTERS = [
  {
    "id": "keepers",
    "title": "Keeperen: linjekeeper eller sweeperkeeper",
    "principles": [
      "keeper_communication_organizes_the_block",
      "defensive_block_must_choose_risk_level"
    ],
    "clubs": [
      "tromso",
      "hodd"
    ],
    "roles": [
      {
        "id": "line_keeper",
        "description": "Beskytter målet og avslutningsrommet nær egen boks; trenger tydelig forsvar foran seg."
      },
      {
        "id": "sweeperkeeper",
        "description": "Dekker rommet bak en høy linje og kan være ekstra pasningsalternativ i oppbyggingen."
      }
    ],
    "concept": "Keeperrollen bestemmer hvor mye av rommet utenfor målområdet laget kan forsvare, og om keeperen inngår som oppspillsspiller. Linjekeeperen og sweeperkeeperen har ulike krav til plassering og støtte.",
    "dilemma": "En høy linje med keeper som blir stående dypt kan åpne bakrom. En keeper som går høyt uten at stopperne dekker returen risikerer på sin side å bli passert.",
    "manager": "Relasjonsmotoren belønner sweeperkeeper med ballspillende forsvar, og linjekeeper med duellstopper i lav blokk. Linjekeeper bak høy linje gir en negativ relasjon. Dette er modellregler, ikke universelle fasiter.",
    "practice": "Tren oppspill fra keeper med to stoppere og en sekser, deretter gjennomspill bak høy linje. Veksle mellom å bryte pasningen og falle for å beskytte målet.",
    "diagrams": [
      {
        "kind": "pitch",
        "title": "Keeper som sikring og oppspillspunkt",
        "note": "Keeperen er et ekstra pasningsalternativ, men må også vurdere rommet bak stopperne.",
        "players": [
          [
            12,
            50,
            "Keeper",
            "a"
          ],
          [
            33,
            29,
            "Stopper",
            "a"
          ],
          [
            33,
            71,
            "Stopper",
            "a"
          ],
          [
            53,
            50,
            "Sekser",
            "a"
          ],
          [
            48,
            29,
            "Press",
            "d"
          ],
          [
            48,
            71,
            "Press",
            "d"
          ]
        ],
        "arrows": [
          [
            12,
            50,
            33,
            29
          ],
          [
            33,
            29,
            53,
            50
          ],
          [
            12,
            50,
            28,
            50
          ]
        ]
      }
    ]
  },
  {
    "id": "centre_backs",
    "title": "Stopperparet: duell, oppbygging og libero",
    "principles": [
      "wm_requires_clear_marking_and_support",
      "defending_uses_first_second_third_defender",
      "total_football_needs_role_flexibility"
    ],
    "clubs": [
      "viking",
      "lillestrom",
      "tromso"
    ],
    "roles": [
      {
        "id": "duel_centre_back",
        "description": "Prioriterer dueller, innlegg og fysisk beskyttelse av boksen."
      },
      {
        "id": "stopper",
        "description": "Møter fremre trussel, markerer og bryter oppspill; trenger dybdesikring bak seg."
      },
      {
        "id": "ball_playing_centre_back",
        "description": "Søker linjebrytende pasninger og trygg fremdrift fra bakre ledd."
      },
      {
        "id": "libero",
        "description": "Leser spillet og kan tre frem som pasningsspiller. Spillets moderne liberorolle er ikke identisk med den historiske frie sikringsspilleren i catenaccio."
      }
    ],
    "concept": "Stopperne må fordele hvem som utfordrer mottaker, hvem som dekker dybde, og hvem som fører eller spiller ballen frem. En sterk pasningsspiller alene gir ikke god oppbygging dersom det ikke finnes en ledig mottaker.",
    "dilemma": "Når én stopper støter eller fører ballen frem, må en annen beskytte rommet. To spillere som går på samme mottaker åpner bakrommet; to som blir stående kan gi mottakeren tid til å vende.",
    "manager": "Spillet registrerer en positiv relasjon mellom duellstopper og ballspillende stopper/libero, samt mellom ballspillende forsvar og dyp playmaker/regista. Det erstatter ikke vurderingen av posisjon eller individuell rollepassform.",
    "practice": "Tren 3 mot 2 i oppbyggingen. Én stopper kan føre frem når den andre og en midtbanespiller dekker rommet som forlates.",
    "diagrams": [
      {
        "kind": "pitch",
        "title": "Stopper støter, partner sikrer",
        "note": "Duell og dybdeansvar utføres av ulike spillere. Neste pasning må fortsatt skjermes.",
        "players": [
          [
            27,
            42,
            "Ballfører",
            "a"
          ],
          [
            45,
            50,
            "Mottaker",
            "a"
          ],
          [
            54,
            47,
            "Stopper",
            "d"
          ],
          [
            72,
            67,
            "Sikring",
            "d"
          ],
          [
            58,
            24,
            "Sekser",
            "d"
          ],
          [
            35,
            77,
            "Løper",
            "a"
          ]
        ],
        "arrows": [
          [
            54,
            47,
            47,
            50
          ],
          [
            72,
            67,
            82,
            64
          ],
          [
            35,
            77,
            83,
            79
          ]
        ]
      }
    ]
  },
  {
    "id": "fullbacks",
    "title": "Backer og vingbacker: hvem gir bredden?",
    "principles": [
      "total_football_needs_role_flexibility",
      "dribbling_needs_purpose_and_cover",
      "attacking_patterns_need_timing"
    ],
    "clubs": [
      "viking",
      "tromso",
      "bodo_glimt"
    ],
    "roles": [
      {
        "id": "support_fullback",
        "description": "Tilbyr støtte og sikring bak eller ved siden av kantspilleren."
      },
      {
        "id": "overlapping_fullback",
        "description": "Søker ytre løp for å skape bredde og innleggsmuligheter."
      },
      {
        "id": "wingback",
        "description": "Bærer både bredde og defensivt sideansvar, ofte i en struktur med tre stoppere."
      },
      {
        "id": "inverted_fullback",
        "description": "Flytter inn i banen for å gi sentral støtte i oppbygging og restforsvar."
      }
    ],
    "concept": "Backens høyde og korridor avhenger av kantspilleren og sikringen bak. Overlapping kan frigjøre en innoverkant; invertering kan gi en ekstra sentral pasningsvinkel dersom en annen spiller opprettholder bredde.",
    "dilemma": "Begge sider høyt samtidig kan gi angrepsbredde, men etterlate store rom ved balltap. Invertering uten bred kant kan gjøre laget for smalt.",
    "manager": "Relasjonsmotoren belønner kant med overlapp/vingback. To offensive back-/vingbackroller uten holdende eller balanserende midtbane gir negativ relasjon. Invertert back er en definert rolle, men ikke en egen generell relasjonsbonus.",
    "practice": "Spill 4 mot 3 i sidekorridoren. La backen velge støtte, ytre løp eller indre posisjon ut fra kantens bevegelse.",
    "diagrams": [
      {
        "kind": "pitch",
        "title": "Overlapp frigjør innside",
        "note": "Innoverkanten trekker inn mens backen går utenfor. Sekseren beskytter returrommet.",
        "players": [
          [
            39,
            23,
            "Innoverkant",
            "a"
          ],
          [
            19,
            14,
            "Back",
            "a"
          ],
          [
            28,
            53,
            "Sekser",
            "a"
          ],
          [
            49,
            24,
            "Forsvarer",
            "d"
          ],
          [
            68,
            47,
            "Stopper",
            "d"
          ]
        ],
        "arrows": [
          [
            39,
            23,
            62,
            39
          ],
          [
            19,
            14,
            74,
            12
          ]
        ]
      },
      {
        "kind": "pitch",
        "title": "Invertering gir sentral støtte",
        "note": "Backen går inn ved sekseren, mens kanten holder ytterkorridoren.",
        "players": [
          [
            20,
            17,
            "Back",
            "a"
          ],
          [
            35,
            51,
            "Sekser",
            "a"
          ],
          [
            63,
            13,
            "Kant",
            "a"
          ],
          [
            48,
            35,
            "Press",
            "d"
          ],
          [
            55,
            64,
            "Press",
            "d"
          ]
        ],
        "arrows": [
          [
            20,
            17,
            38,
            35
          ],
          [
            38,
            35,
            63,
            13
          ]
        ]
      }
    ]
  },
  {
    "id": "six_regista",
    "title": "Sekser, regista og dyp playmaker",
    "principles": [
      "football_history_explains_formations",
      "defensive_block_must_choose_risk_level",
      "technical_skill_must_survive_pressure"
    ],
    "clubs": [
      "bodo_glimt",
      "tromso",
      "molde"
    ],
    "roles": [
      {
        "id": "balancing_six",
        "description": "Skjermer sentralt og balanserer laget når andre går frem."
      },
      {
        "id": "holding_midfielder",
        "description": "Holder midtbaneområdet, tilbyr enkel pasningsstøtte og dekker neste rom."
      },
      {
        "id": "deep_playmaker",
        "description": "Styrer tempo og pasningsretning fra dype posisjoner."
      },
      {
        "id": "regista",
        "description": "Dyp, sentral playmaker med stort ansvar for oppbygging og spillvending; trenger en beskyttet arbeidsflate."
      }
    ],
    "concept": "Sekser er ofte en posisjon eller et ansvar, mens regista beskriver en bestemt kreativ oppgave fra dypet. To spillere i samme midtbaneledd kan dermed ha ulike funksjoner: én organiserer balansen, den andre finner fremoverpasningen.",
    "dilemma": "En regista med flere frie, løpende spillere rundt seg kan mangle en trygg returpasning og defensiv støtte. To svært holdende midtbanespillere kan på den andre siden redusere trusselen mellom leddene.",
    "manager": "Spillet belønner dyp playmaker/regista med bakromsløper. Playmaker uten holdende rolle og med minst to frie/løpende midtbaneroller gir negativ relasjon. Det er en forenklet kontroll av rollefordeling, ikke måling av faktiske avstander.",
    "practice": "Tren 5 mot 4 i oppbygging. Én midtbanespiller styrer pasningene, den andre sørger for støtte og restforsvar når indreløperne går.",
    "diagrams": [
      {
        "kind": "pitch",
        "title": "Regista med egen balanserende sekser",
        "note": "Spillfordeleren finner dybdeløpet; sekseren sikrer returen. Rollene utfyller hverandre.",
        "players": [
          [
            27,
            44,
            "Regista",
            "a"
          ],
          [
            24,
            68,
            "Sekser",
            "a"
          ],
          [
            49,
            27,
            "Indreløper",
            "a"
          ],
          [
            67,
            50,
            "Bakromsspiss",
            "a"
          ],
          [
            43,
            46,
            "Press",
            "d"
          ],
          [
            72,
            33,
            "Stopper",
            "d"
          ]
        ],
        "arrows": [
          [
            27,
            44,
            49,
            27
          ],
          [
            49,
            27,
            85,
            52
          ],
          [
            24,
            68,
            36,
            58
          ]
        ]
      }
    ]
  },
  {
    "id": "eight_press",
    "title": "Indreløperen: boks-til-boks og press",
    "principles": [
      "physical_capacity_sets_tactical_ceiling",
      "defending_uses_first_second_third_defender",
      "attacking_patterns_need_timing"
    ],
    "clubs": [
      "rosenborg",
      "brann",
      "stromsgodset"
    ],
    "roles": [
      {
        "id": "box_to_box",
        "description": "Forbinder ledd gjennom vertikale løp, ballføring og støtte i begge bokser. Spillets nærmeste rolle til en løpende indreløper, ikke en egen generell indreløper-ID."
      },
      {
        "id": "pressing_midfielder",
        "description": "Følger opp førsteforsvar, angriper overgangsmomenter og stenger neste pasningsalternativ."
      }
    ],
    "concept": "Indreløper er en posisjonell betegnelse som kan fylles med ulike oppgaver. En løpende åtter kan true bakrom eller returrom, mens en pressende midtbanespiller følger opp spissens press og stenger mottakeren.",
    "dilemma": "Tidlige løp kan gi fremdrift, men hvis alle midtbanespillerne løper frem samtidig mangler støttepasningen. Et usynkronisert ettertrykk åpner rom bak presspissen.",
    "manager": "Presspiss sammen med pressende midtbane eller boks-til-boks gir positiv relasjon. Presspiss uten ettertrykk i høyt press gir negativ relasjon. Vurder samtidig fysisk kapasitet og sekserens sikring.",
    "practice": "Spill 5 mot 5 med en balanserende midtbanespiller. La indreløperen velge når han følger presset og når han angriper boksen, mens sekseren holder igjen.",
    "diagrams": [
      {
        "kind": "pitch",
        "title": "Førstepress og ettertrykk",
        "note": "Spissen styrer oppspillet; midtbanespilleren går på neste mottaker, mens sekseren dekker bak.",
        "players": [
          [
            24,
            47,
            "Ballfører",
            "a"
          ],
          [
            43,
            65,
            "Mottaker",
            "a"
          ],
          [
            35,
            45,
            "Presspiss",
            "d"
          ],
          [
            57,
            66,
            "Indreløper",
            "d"
          ],
          [
            72,
            45,
            "Sekser",
            "d"
          ]
        ],
        "arrows": [
          [
            35,
            45,
            29,
            47
          ],
          [
            57,
            66,
            47,
            65
          ]
        ]
      }
    ]
  },
  {
    "id": "ten_creator",
    "title": "Tieren og den frie skaperen",
    "principles": [
      "combination_game_beats_isolated_dribbling",
      "attacking_patterns_need_timing"
    ],
    "clubs": [
      "stabak",
      "lillestrom"
    ],
    "roles": [
      {
        "id": "classic_ten",
        "description": "Mottar mellom leddene, vender og finner siste pasning til spiss eller løper."
      },
      {
        "id": "free_creator",
        "description": "Søker friere mottaksrom og skaper ubalanse gjennom pasning, dribling og bevegelse."
      }
    ],
    "concept": "En skaper trenger tid, vinkel og en mottaker foran seg. Kreativitet blir farlig når en annen spiller kan utnytte rommet som skapes, ikke bare når ballfører slår en vanskelig pasning.",
    "dilemma": "To frie skapere kan søke samme mellomrom og redusere lagets dybdetrussel. En skaper uten støtte bak kan gi balltap i en sentral sone.",
    "manager": "Klassisk tier eller fri skaper sammen med bakromsløper, avansert spiss eller boksspiss gir positiv relasjon. Flere skapere uten klar romfordeling kan gi negativ relasjon. En holdende rolle støtter frihet med sikring.",
    "practice": "Tren 4 mot 3 rundt mellomrommet. En skaper må ha minst én løper foran seg og én trygg støttepasning bak.",
    "diagrams": [
      {
        "kind": "pitch",
        "title": "Skaper med et sluttprodukt",
        "note": "Tieren mottar mellom leddene. Løperen binder stopperen, og en sekser gir støtte bak.",
        "players": [
          [
            42,
            48,
            "Tier",
            "a"
          ],
          [
            61,
            26,
            "Løper",
            "a"
          ],
          [
            61,
            73,
            "Spiss",
            "a"
          ],
          [
            24,
            55,
            "Sekser",
            "a"
          ],
          [
            52,
            40,
            "Skjerm",
            "d"
          ],
          [
            75,
            28,
            "Stopper",
            "d"
          ],
          [
            75,
            69,
            "Stopper",
            "d"
          ]
        ],
        "arrows": [
          [
            42,
            48,
            82,
            27
          ],
          [
            61,
            26,
            82,
            27
          ],
          [
            42,
            48,
            24,
            55
          ]
        ]
      }
    ]
  },
  {
    "id": "wingers",
    "title": "Kantspilleren: bredde eller innside",
    "principles": [
      "dribbling_needs_purpose_and_cover",
      "combination_game_beats_isolated_dribbling"
    ],
    "clubs": [
      "rosenborg",
      "stabak",
      "viking"
    ],
    "roles": [
      {
        "id": "wide_dribbler",
        "description": "Holder eller angriper ytterkorridoren og utfordrer forsvareren én mot én."
      },
      {
        "id": "inverted_winger",
        "description": "Trekker inn mot halvrom og sentrale kombinasjoner, ofte for å avslutte eller spille siste pasning."
      }
    ],
    "concept": "En kant kan enten holde bredden for å strekke blokken eller trekke inn for å skape kombinasjoner. Begge trenger støtte, men støtten bør bruke et annet rom enn ballfører.",
    "dilemma": "Isolasjon kan være ønsket når kantspilleren er sterk én mot én, men uten en støttevinkel kan han bli låst mot sidelinjen. En innoverkant uten bredde fra andre gjør angrepet smalt.",
    "manager": "Bred dribler og innoverkant sammen med overlappende back eller vingback utløser kant + overlapp. Når taktikken krever bredde, kan manglende overlapp gi negativ relasjon; det er ikke en regel om at alle kantangrep må overlappe.",
    "practice": "Tren 2 mot 2 ved sidelinjen med en støttespiller. Kantspilleren velger dribling, avlegg eller innside ut fra forsvarerens plassering.",
    "diagrams": [
      {
        "kind": "pitch",
        "title": "To ulike kantoppgaver",
        "note": "Den brede dribleren utfordrer ute; innoverkanten søker halvrommet. En annen spiller kan overta bredden.",
        "players": [
          [
            34,
            17,
            "Bred kant",
            "a"
          ],
          [
            34,
            83,
            "Innoverkant",
            "a"
          ],
          [
            18,
            87,
            "Back",
            "a"
          ],
          [
            49,
            18,
            "Back",
            "d"
          ],
          [
            49,
            79,
            "Back",
            "d"
          ],
          [
            72,
            52,
            "Stopper",
            "d"
          ]
        ],
        "arrows": [
          [
            34,
            17,
            76,
            14
          ],
          [
            34,
            83,
            65,
            58
          ],
          [
            18,
            87,
            69,
            90
          ]
        ]
      }
    ]
  },
  {
    "id": "link_strikers",
    "title": "Møtende spiss og falsk nier",
    "principles": [
      "combination_game_beats_isolated_dribbling",
      "total_football_needs_role_flexibility",
      "attacking_patterns_need_timing"
    ],
    "clubs": [
      "tromso",
      "stabak",
      "viking"
    ],
    "roles": [
      {
        "id": "linking_striker",
        "description": "Møter oppspillet og holder eller legger av ballen til støttespillere."
      },
      {
        "id": "false_nine",
        "description": "Forlater den fremste posisjonen for å skape et fritt mottak eller trekke forsvarere ut av rommet."
      }
    ],
    "concept": "Den møtende spissen er et forbindelsesledd. En falsk nier bruker også bevegelsen til å endre motstanderens markering og åpne plass for andre. Begge er avhengige av at andre truer rommet som forlates.",
    "dilemma": "Hvis ingen løper forbi spissen, kan stopperne bli stående og laget får mange pasninger foran blokken. Hvis stopper følger for langt, åpner han derimot bakrom.",
    "manager": "Relasjonsmotoren belønner møtende spiss eller falsk nier sammen med channel runner, advanced forward eller box-to-box. Uten slike løpere gir den en negativ relasjon. Kantløp kan ha taktisk verdi selv om denne bestemte regelens rolle-ID-er er mer begrenset.",
    "practice": "Spill 4 mot 4 med en møtende spiss. Ett lag får bare poeng for gjennombrudd hvis en annen angriper rommet spissen forlater.",
    "diagrams": [
      {
        "kind": "pitch",
        "title": "Møtende spiss og motsatt løp",
        "note": "Spissen kommer mot ballen; en annen går i dybden. Stopperen må velge å følge eller holde linjen.",
        "players": [
          [
            56,
            47,
            "Møtende",
            "a"
          ],
          [
            40,
            72,
            "Løper",
            "a"
          ],
          [
            20,
            50,
            "Oppspill",
            "a"
          ],
          [
            69,
            40,
            "Stopper",
            "d"
          ],
          [
            69,
            65,
            "Stopper",
            "d"
          ]
        ],
        "arrows": [
          [
            56,
            47,
            40,
            42
          ],
          [
            20,
            50,
            40,
            42
          ],
          [
            40,
            72,
            86,
            67
          ]
        ]
      }
    ]
  },
  {
    "id": "finishing_press",
    "title": "Spissroller: bakrom, boks, duell og press",
    "principles": [
      "attacking_patterns_need_timing",
      "physical_capacity_sets_tactical_ceiling",
      "defending_uses_first_second_third_defender"
    ],
    "clubs": [
      "lillestrom",
      "rosenborg",
      "brann"
    ],
    "roles": [
      {
        "id": "channel_runner",
        "description": "Truer kanalene bak og ved siden av stopperne med tidlige løp."
      },
      {
        "id": "advanced_forward",
        "description": "Leder angrepet høyt og kombinerer dybdeløp, mottak og avslutning."
      },
      {
        "id": "target_striker",
        "description": "Kontrollerer direkte oppspill og dueller, legger av og trenger andreballstøtte."
      },
      {
        "id": "box_striker",
        "description": "Prioriterer avslutningsposisjoner og bevegelser i boksen."
      },
      {
        "id": "pressing_forward",
        "description": "Starter og styrer presset på motstanderens oppbygging."
      }
    ],
    "concept": "Spissrollen bestemmer hvilken type forsyning laget må gi. Bakromsspissen trenger gjennomspill, targetspissen trenger dueller med støtte, boksspissen trenger leveranser i avslutningssonen, og presspissen trenger ettertrykk.",
    "dilemma": "En targetspiss uten innlegg eller andreballstøtte blir isolert. En bakromsspiss mot en lav blokk får lite rom dersom laget ikke kan trekke forsvarerne ut. En presspiss som løper alene bruker energi uten å stenge utveier.",
    "manager": "Motoren belønner targetspiss med overlapp/vingback, playmaker med dybdeløper, skaper med dybde eller boksspiss, og presspiss med ettertrykk. Target uten overlapp, innleggstaktikk eller andreballtaktikk kan gi negativ relasjon.",
    "practice": "Bruk samme angrepslag mot to ulike blokker. Veksle mellom direkte oppspill med avlegg, gjennomspill og innlegg; vurder hvilken spissrolle som faktisk får service.",
    "diagrams": [
      {
        "kind": "pitch",
        "title": "Direkte oppspill med støtte",
        "note": "Targetspissen utfordrer første duell. En annen spiller angriper nedfallsrommet; uten støtte blir duellen isolert.",
        "players": [
          [
            15,
            44,
            "Oppspill",
            "a"
          ],
          [
            57,
            38,
            "Target",
            "a"
          ],
          [
            43,
            67,
            "Støtte",
            "a"
          ],
          [
            63,
            42,
            "Stopper",
            "d"
          ],
          [
            71,
            66,
            "Sikring",
            "d"
          ]
        ],
        "arrows": [
          [
            15,
            44,
            57,
            38
          ],
          [
            57,
            38,
            48,
            63
          ],
          [
            43,
            67,
            48,
            63
          ]
        ]
      },
      {
        "kind": "pitch",
        "title": "Bakrom og boksløp",
        "note": "En dybdeløper angriper rommet bak stopperen mens boksspissen søker avslutningssonen.",
        "players": [
          [
            27,
            49,
            "Playmaker",
            "a"
          ],
          [
            55,
            23,
            "Bakromsspiss",
            "a"
          ],
          [
            62,
            62,
            "Boksspiss",
            "a"
          ],
          [
            69,
            29,
            "Stopper",
            "d"
          ],
          [
            72,
            61,
            "Stopper",
            "d"
          ]
        ],
        "arrows": [
          [
            27,
            49,
            85,
            23
          ],
          [
            55,
            23,
            85,
            23
          ],
          [
            62,
            62,
            88,
            58
          ]
        ]
      }
    ]
  }
];
