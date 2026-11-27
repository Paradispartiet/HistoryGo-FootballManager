// International football schools: sourced historical context and didactic illustrations. Not new game mechanics.
export const SCHOOL_CHAPTERS = [
  {
    "id": "total_football",
    "title": "Totalfotball – Nederland og Ajax",
    "era": "Rinus Michels · 1960- og 1970-årene",
    "principles": [
      "total_football_needs_role_flexibility",
      "attacking_patterns_need_timing"
    ],
    "clubs": [
      "rosenborg",
      "tromso"
    ],
    "concept": "Ajax og Nederland gjorde koordinerte rollebytter, bevegelser uten ball og bruk av hele banens rom til sentrale virkemidler. Cruyff kunne forlate spissposisjonen for å skape en fri spiller et annet sted. Poenget var at laget omorganiserte seg rundt bevegelsen, ikke at alle vandret fritt. En back kunne gå frem mens andre overtok ansvaret for rommet han forlot.",
    "dilemma": "Et rollebytte kan gjøre individuell markering vanskelig, men hvis både den som forlater rommet og den som skulle overta det går frem, mister laget sikring. Skill mellom frihet til å velge bevegelse og ansvar for å bevare kollektiv struktur.",
    "manager": "Sammenlign rollepassform og samhandling når du kombinerer møtende spiss, offensive backer og dybdeløpere. De norske eksemplene viser beslektede mekanismer, ikke nødvendigvis direkte historisk påvirkning.",
    "practice": "Spill 7 mot 7 med tre lengdesoner. Når en spiller forlater sin sone, skal en annen tilby en ny støttevinkel eller overta sikringen. Vurder om rollebyttet faktisk skaper progresjon.",
    "sources": [
      {
        "title": "FIFA: Rinus Michels og totalfotball",
        "url": "https://inside.fifa.com/en/news/the-watchmaker-behind-the-clockwork-oranje"
      },
      {
        "title": "FIFA: Johan Cruyff",
        "url": "https://www.fifa.com/en/archive/johan-cruyff"
      }
    ],
    "diagrams": [
      {
        "kind": "pitch",
        "title": "Rollebytte med dekning",
        "note": "Spissen møter, indreløperen går i dybden og en annen midtbanespiller dekker rommet som forlates.",
        "players": [
          [
            58,
            48,
            "Spiss",
            "a"
          ],
          [
            39,
            29,
            "Indreløper",
            "a"
          ],
          [
            25,
            56,
            "Sekser",
            "a"
          ],
          [
            34,
            78,
            "Back",
            "a"
          ],
          [
            72,
            34,
            "Stopper",
            "d"
          ],
          [
            72,
            66,
            "Stopper",
            "d"
          ]
        ],
        "arrows": [
          [
            58,
            48,
            44,
            55
          ],
          [
            39,
            29,
            83,
            32
          ],
          [
            25,
            56,
            39,
            37
          ]
        ]
      },
      {
        "kind": "flow",
        "title": "Frihet krever overtakelse",
        "note": "Et rollebytte er vellykket bare når laget fortsatt kan støtte og sikre.",
        "start": "Spiller forlater rom",
        "decision": "Hvem overtar ansvaret?",
        "branches": [
          "Overtakelse → ny angrepsvinkel",
          "Ingen overtakelse → ubalanse"
        ]
      }
    ]
  },
  {
    "id": "catenaccio",
    "title": "Catenaccio – sikring og direkte angrep",
    "era": "Helenio Herrera · Inter 1960–1968",
    "principles": [
      "catenaccio_is_control_not_only_defence",
      "wm_requires_clear_marking_and_support",
      "defending_uses_first_second_third_defender"
    ],
    "clubs": [
      "hodd",
      "lillestrom"
    ],
    "concept": "Herreras Inter kombinerte personlig markering med en fri sikringsspiller bak markørene, liberoen. En offensiv back kunne utnytte tryggheten i sikringen til å angripe. Herrera videreutviklet systemet, men oppfant det ikke. Catenaccio er derfor noe mer spesifikt enn en moderne lav soneblokk.",
    "dilemma": "En fri sikringsspiller gir dybdebeskyttelse, men binder en spiller bak duellene. Hvis markørene trekkes ut av posisjon ved rollebytter, kan liberoen bli stående med flere trusler samtidig. Kontring krever dessuten en tilgjengelig første mottaker.",
    "manager": "Bruk lav blokk, dybde og raske overganger der de passer troppen. Ikke forveksle dagens soneforsvar med klassisk personlig markering, eller anta at spillet har en egen historisk liberomotor.",
    "practice": "Spill 6 mot 6 med en ekstra sikringsspiller på forsvarslaget. Angrepet roterer posisjoner; forsvarslaget vurderer når markøren følger og når sikringen overtar.",
    "sources": [
      {
        "title": "UEFA: Helenio Herrera",
        "url": "https://www.uefa.com/uefachampionsleague/news/0231-0e94dd0ff999-827e03392bff-1000--in-profile-helenio-herrera/"
      },
      {
        "title": "UEFA: Inter 1962–67",
        "url": "https://www.uefa.com/uefachampionsleague/news/0253-0d7ff54821f7-e2055930d1e0-1000--the-greatest-teams-of-all-time-inter-1962-67/"
      }
    ],
    "diagrams": [
      {
        "kind": "pitch",
        "title": "Markører med fri libero",
        "note": "Markørene møter sine motspillere; liberoen har dybdeansvar fremfor en fast personlig motstander.",
        "players": [
          [
            45,
            23,
            "Kant",
            "a"
          ],
          [
            52,
            48,
            "Spiss",
            "a"
          ],
          [
            45,
            76,
            "Løper",
            "a"
          ],
          [
            57,
            23,
            "Markør",
            "d"
          ],
          [
            64,
            48,
            "Markør",
            "d"
          ],
          [
            57,
            76,
            "Markør",
            "d"
          ],
          [
            84,
            50,
            "Libero",
            "d"
          ]
        ],
        "arrows": [
          [
            57,
            23,
            48,
            23
          ],
          [
            64,
            48,
            55,
            48
          ],
          [
            84,
            50,
            72,
            62
          ]
        ]
      }
    ]
  },
  {
    "id": "gegenpress",
    "title": "Gegenpressing – gjenvinning som angrepsstart",
    "era": "Tysk trenertradisjon · Klopp, Dortmund og Liverpool",
    "principles": [
      "defending_uses_first_second_third_defender",
      "physical_capacity_sets_tactical_ceiling",
      "dribbling_needs_purpose_and_cover"
    ],
    "clubs": [
      "brann",
      "stromsgodset"
    ],
    "concept": "Gegenpressing er umiddelbart press etter eget balltap, til forskjell fra et høyt press mot etablert oppbygging. Flere spillere kan sperre den nye ballførerens nærmeste alternativer mens bakre spillere beskytter neste rom. Et raskt ballbytte kan gjøre motstanderen sårbar fordi forsvarsformen nettopp er oppløst.",
    "dilemma": "Å jage ballen etter hvert tap kan åpne bakrom hvis laget er strukket. Når første pasning allerede har passert pressområdet, kan forsinkelse og reorganisering være bedre enn å fortsette jakten.",
    "manager": "Bruk gjenvinningspress sammen med tilstrekkelig restforsvar og kapasitet. Les om en mislykket gjenvinning skyldes første press eller manglende sikring. Høyt press og gjenvinningspress er separate oppgaver.",
    "practice": "Spill 5 mot 5 med overgang til to små mål. Etter balltap velger laget samlet mellom gjenvinningspress og fall, basert på avstandene rundt ballen.",
    "sources": [
      {
        "title": "Coaches’ Voice: counter-pressing og gegenpressing",
        "url": "https://learning.coachesvoice.com/cv/counter-pressing-gegenpressing-football-tactics-explained-klopp-guardiola-bielsa-hasenhuttl/"
      },
      {
        "title": "Coaches’ Voice: Klopps taktiske utvikling",
        "url": "https://learning.coachesvoice.com/cv/jurgen-klopp-tactics-liverpool/"
      }
    ],
    "diagrams": [
      {
        "kind": "pitch",
        "title": "Steng første utpasning",
        "note": "Tre spillere presser eller stenger nære pasningslinjer; en egen sikringsspiller holder neste rom.",
        "players": [
          [
            48,
            47,
            "Ballvinner",
            "a"
          ],
          [
            68,
            23,
            "Utvei",
            "a"
          ],
          [
            69,
            77,
            "Utvei",
            "a"
          ],
          [
            34,
            47,
            "Press",
            "d"
          ],
          [
            56,
            28,
            "Støtte",
            "d"
          ],
          [
            56,
            67,
            "Støtte",
            "d"
          ],
          [
            82,
            50,
            "Sikring",
            "d"
          ]
        ],
        "arrows": [
          [
            34,
            47,
            43,
            47
          ],
          [
            56,
            28,
            61,
            35
          ],
          [
            56,
            67,
            62,
            61
          ]
        ]
      },
      {
        "kind": "flow",
        "title": "Press eller fall?",
        "note": "En pedagogisk beslutning, ikke en universell tidsregel.",
        "start": "Balltap",
        "decision": "Er laget tett nok rundt ballen?",
        "branches": [
          "Ja → steng utveiene",
          "Nei → forsink og samle laget"
        ]
      }
    ]
  },
  {
    "id": "tiki_taka",
    "title": "Tiki-taka – ballbesittelse med hensikt",
    "era": "Spania fra EM 2008 og Barcelona 2008–2012",
    "principles": [
      "combination_game_beats_isolated_dribbling",
      "technical_skill_must_survive_pressure",
      "attacking_patterns_need_timing"
    ],
    "clubs": [
      "bodo_glimt",
      "molde"
    ],
    "concept": "Begrepet beskriver ofte den korte, raske pasningsfotballen som ble forbundet med Spania og Barcelona. Guardiola tok selv avstand fra pasninger uten formål. Ballbesittelsen kan brukes til å flytte forsvarere, frigjøre en rettvendt mottaker og forberede gjenvinning. Den er et middel til kontroll og gjennombrudd, ikke et mål i seg selv.",
    "dilemma": "Mange sikre pasninger kan redusere tap av ball, men hvis ingen truer bakrommet kan motstanderen bli stående kompakt. En risikofylt vertikal pasning er ofte verdifull først når støtte og sikring er klare.",
    "manager": "Vurder progresjon og sjansekvalitet sammen med ballbesittelse. Bruk korte støttepasninger til å skape et gjennombruddsvindu, ikke for å maksimere pasningstall.",
    "practice": "Spill 5 mot 3 med en målspiller bak presset. Tell vellykkede gjennombrudd etter at motstanderen er flyttet, ikke antall pasninger.",
    "sources": [
      {
        "title": "UEFA: Barcelona 2008–12",
        "url": "https://www.uefa.com/uefachampionsleague/news/0253-0d7ff5460779-90f1672a7e36-1000--the-greatest-teams-of-all-time-barcelona-2008-12/"
      },
      {
        "title": "BBC Sport: Guardiolas kritikk av tiki-taka",
        "url": "https://www.bbc.co.uk/sport/football/29661426"
      }
    ],
    "diagrams": [
      {
        "kind": "pitch",
        "title": "Sirkulasjon før gjennombrudd",
        "note": "Korte støttepasninger flytter presset før ballen spilles inn i et nytt rom.",
        "players": [
          [
            18,
            33,
            "A",
            "a"
          ],
          [
            37,
            20,
            "B",
            "a"
          ],
          [
            28,
            64,
            "C",
            "a"
          ],
          [
            58,
            60,
            "D",
            "a"
          ],
          [
            83,
            52,
            "Løper",
            "a"
          ],
          [
            44,
            34,
            "Press",
            "d"
          ],
          [
            49,
            50,
            "Press",
            "d"
          ],
          [
            71,
            40,
            "Stopper",
            "d"
          ]
        ],
        "arrows": [
          [
            18,
            33,
            37,
            20
          ],
          [
            37,
            20,
            28,
            64
          ],
          [
            28,
            64,
            58,
            60
          ],
          [
            58,
            60,
            83,
            52
          ]
        ]
      }
    ]
  },
  {
    "id": "positional_play",
    "title": "Posisjonsspill – juego de posición",
    "era": "Cruyff, Guardiola og den moderne posisjonelle tradisjonen",
    "principles": [
      "football_history_explains_formations",
      "total_football_needs_role_flexibility",
      "attacking_patterns_need_timing"
    ],
    "clubs": [
      "tromso",
      "bodo_glimt",
      "molde"
    ],
    "concept": "Posisjonsspill organiserer spillere i komplementære rom slik at motstanderen må velge hva den dekker. Numerisk overtall i oppbyggingen kan skape en fri spiller, mens bredde, halvrom og dybde gir neste pasningsvinkel. Fem lengdekorridorer er en vanlig pedagogisk modell, ikke et universelt krav om faste plasser.",
    "dilemma": "Hvis alle står i korrekte soner uten å bevege seg på riktig signal, kan pasningslinjene fortsatt være stengt. Hvis flere går inn i samme sone uten å frigjøre andre rom, mister strukturen sin verdi. Rotasjoner må forbedre vinklene eller lokke en forsvarer bort.",
    "manager": "Bruk posisjonelt overtall, komplementære back- og midtbaneroller og plan for spillvending. Vurder om den frie spilleren faktisk kan motta fremovervendt. En soneskisse er teori, ikke live-sporing.",
    "practice": "Del banen i fem korridorer og spill 7 mot 6. La laget oppsøke fri spiller med minst to støttevinkler, men tillat rollebytter når andre rom fortsatt er besatt.",
    "sources": [
      {
        "title": "Coaches’ Voice: positional play",
        "url": "https://learning.coachesvoice.com/cv/positional-play-football-tactics-explained-guardiola-cruyff-manchester-city/"
      },
      {
        "title": "Coaches’ Voice: half-spaces",
        "url": "https://learning.coachesvoice.com/cv/half-spaces-football-tactics-explained/"
      }
    ],
    "diagrams": [
      {
        "kind": "pitch",
        "title": "Komplementære korridorer",
        "note": "Bredde på begge sider, mottakere i halvrommene og en sentral spiss tvinger forsvarslaget til å velge dekning.",
        "players": [
          [
            28,
            37,
            "Stopper",
            "a"
          ],
          [
            28,
            63,
            "Stopper",
            "a"
          ],
          [
            43,
            50,
            "Sekser",
            "a"
          ],
          [
            66,
            10,
            "Kant",
            "a"
          ],
          [
            56,
            30,
            "Halvrom",
            "a"
          ],
          [
            79,
            50,
            "Spiss",
            "a"
          ],
          [
            56,
            70,
            "Halvrom",
            "a"
          ],
          [
            66,
            90,
            "Kant",
            "a"
          ],
          [
            70,
            28,
            "Back",
            "d"
          ],
          [
            70,
            47,
            "Stopper",
            "d"
          ],
          [
            70,
            72,
            "Back",
            "d"
          ]
        ],
        "arrows": [
          [
            28,
            37,
            43,
            50
          ],
          [
            43,
            50,
            56,
            70
          ],
          [
            56,
            70,
            66,
            90
          ]
        ]
      }
    ]
  },
  {
    "id": "relationism",
    "title": "Relasjonisme – spill rundt ballen",
    "era": "Fernando Diniz · Fluminense 2022–2024",
    "principles": [
      "combination_game_beats_isolated_dribbling",
      "total_football_needs_role_flexibility",
      "football_culture_shapes_playing_style"
    ],
    "clubs": [
      "viking",
      "stabak"
    ],
    "concept": "Relasjonisme er et nyere analysebegrep for en tilnærming der spillere i stor grad organiserer seg etter ballen, medspillernes bevegelser og lokale kombinasjoner. Diniz' Fluminense er et sentralt eksempel: spillere søker nærhet, veggspill, diagonale støttevinkler og nye relasjoner når ballen flyttes. Det er ikke fravær av struktur, men en annen vektlegging av hvordan strukturen oppstår.",
    "dilemma": "Ballnære kombinasjoner kan gjøre presset vanskelig å forutse, men en tett klynge kan også bli fanget hvis motstanderen stenger utveiene. Når mange trekkes mot ballen, må laget fortsatt håndtere motsatt side og overgangen etter tap. Posisjonsspill og relasjonisme er ikke gjensidig utelukkende.",
    "manager": "Se etter teknisk trygghet, støtte, rolleforståelse og muligheter for tredje spiller. Spillets eksisterende relasjons- og kombinasjonsmekanismer illustrerer delprinsipper; det finnes ikke her en ny selvstendig Diniz-motor.",
    "practice": "Spill 6 mot 5 uten fast krav til korridorer. Gi poeng for veggspill og progresjon via en ny støtterelasjon. Etter tap vurderer treneren om laget har en alternativ utvei og tilstrekkelig sikring.",
    "sources": [
      {
        "title": "Sky Sports: Fernando Diniz og Fluminense",
        "url": "https://www.skysports.com/football/news/12997384/fernando-dinizs-innovative-tactics-with-fluminense-can-he-win-the-copa-libertadores-and-change-football-too"
      },
      {
        "title": "Sky Sports: Henrik Rydström om relasjonisme",
        "url": "https://www.skysports.com/football/news/11096/13097969/henrik-rydstrom-interview-how-malmo-boss-rejected-positional-play-to-become-europes-most-innovative-coach"
      }
    ],
    "diagrams": [
      {
        "kind": "pitch",
        "title": "Ballnær støtte og diagonale kombinasjoner",
        "note": "Spillerne skaper nye pasningsvinkler tett rundt ballen. Løperen i dypet er en mulig utvei; sikring er fortsatt nødvendig.",
        "players": [
          [
            25,
            25,
            "Ballfører",
            "a"
          ],
          [
            39,
            15,
            "Støtte",
            "a"
          ],
          [
            37,
            40,
            "Støtte",
            "a"
          ],
          [
            52,
            30,
            "Vegg",
            "a"
          ],
          [
            64,
            50,
            "Løper",
            "a"
          ],
          [
            18,
            65,
            "Sikring",
            "a"
          ],
          [
            45,
            25,
            "Press",
            "d"
          ],
          [
            53,
            46,
            "Press",
            "d"
          ],
          [
            74,
            39,
            "Stopper",
            "d"
          ]
        ],
        "arrows": [
          [
            25,
            25,
            39,
            15
          ],
          [
            39,
            15,
            52,
            30
          ],
          [
            52,
            30,
            37,
            40
          ],
          [
            37,
            40,
            64,
            50
          ]
        ]
      }
    ]
  }
];
