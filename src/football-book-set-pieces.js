// Fotballboka: set-piece theory with verified rule links and explicit existing-engine scope.
export const SET_PIECE_CHAPTERS = [
  {
    "id": "attacking_corners",
    "title": "Corner – levering, løp og angrepssoner",
    "principles": [
      "attacking_patterns_need_timing",
      "combination_game_beats_isolated_dribbling"
    ],
    "clubs": [
      "lillestrom",
      "viking"
    ],
    "concept": "En corner kombinerer leveringsbane, startposisjon, fart inn i duellen og dekning av nedfall. Nærmeste stolpe kan angripes med et tidlig løp; et løp mot bakre sone kan trekke forsvarere bort fra målområdet. En kort corner kan skape en ny innleggsvinkel, særlig hvis to forsvarere må forlate boksen. Innskrudde og utskrudde leveringer har ulike baner og krav til keeper og mottaker.",
    "dilemma": "Å samle alle løp i samme sone kan gjøre første kontakt lettere å avverge. En variant med mange spillere nær mål kan også miste kontrollen over returrommet. Velg målområdet etter motstanderens organisering og egne spilleres leverings- og duellferdigheter, ikke en fast oppskrift.",
    "manager": "Den eksisterende dødballfasen modellerer motstanderens første kontakt i boksen og mulig kontroll av nedfall. Nærstolpe, bakstolpe og kort corner er her teorivarianter, ikke tre separate valg i motoren.",
    "practice": "Tren tre leveringer mot samme forsvar: nærstolpe, bakre sone og kort corner. Registrer første kontakt, kontroll over klarering og om laget har sikring. Ikke tell bare scoringer.",
    "sources": [
      {
        "title": "FIFA Training Centre – angrep mot nærmeste stolpe",
        "url": "https://www.fifatrainingcentre.com/en/game/game-analysis/set-plays/corners/targeting-the-front-post.php"
      },
      {
        "title": "FIFA Training Centre – frigjøre rom ved boksens kant",
        "url": "https://www.fifatrainingcentre.com/en/game/game-analysis/set-plays/corners/attacking-corners.php"
      },
      {
        "title": "IFAB – corner, regel 17",
        "url": "https://www.theifab.com/laws/latest/the-corner-kick/"
      }
    ],
    "engineRefs": [
      {
        "file": "src/football-matchday-sequence-v8.js",
        "symbol": "resolveOpponentSetPiece"
      }
    ],
    "diagrams": [
      {
        "kind": "pitch",
        "title": "Nærstolpe og bakre sone",
        "note": "To ulike løp fordeler duellene. Leveringen er en illustrasjon, ikke en fast historisk variant.",
        "players": [
          [
            97,
            7,
            "Corner",
            "a"
          ],
          [
            72,
            30,
            "Nærløper",
            "a"
          ],
          [
            67,
            72,
            "Bakre løper",
            "a"
          ],
          [
            57,
            48,
            "Retur",
            "a"
          ],
          [
            82,
            31,
            "Forsvar",
            "d"
          ],
          [
            85,
            70,
            "Forsvar",
            "d"
          ],
          [
            95,
            50,
            "Keeper",
            "d"
          ]
        ],
        "arrows": [
          [
            97,
            7,
            88,
            35
          ],
          [
            72,
            30,
            88,
            35
          ],
          [
            67,
            72,
            87,
            70
          ]
        ]
      },
      {
        "kind": "pitch",
        "title": "Kort corner endrer vinkelen",
        "note": "Støttespilleren mottar kort. Dersom en forsvarer går ut, kan neste pasning åpne en annen leveringsvinkel.",
        "players": [
          [
            96,
            8,
            "Corner",
            "a"
          ],
          [
            76,
            12,
            "Støtte",
            "a"
          ],
          [
            66,
            35,
            "Tredjemann",
            "a"
          ],
          [
            80,
            54,
            "Spiss",
            "a"
          ],
          [
            86,
            18,
            "Press",
            "d"
          ],
          [
            85,
            39,
            "Sone",
            "d"
          ],
          [
            85,
            69,
            "Sone",
            "d"
          ]
        ],
        "arrows": [
          [
            96,
            8,
            76,
            12
          ],
          [
            76,
            12,
            66,
            35
          ],
          [
            66,
            35,
            88,
            56
          ]
        ]
      }
    ],
    "sourceDetails": [
      {
        "id": "corner_low_delivery",
        "title": "Offensiv corner – lav bue og målrettet levering",
        "text": "Originalmanuset fremhever en lav innleggskurve som et mulig middel til å gjøre ballbanen vanskeligere for keeperen å bedømme. Dette er en leveringspreferanse, ikke en regel om at alle cornere skal slås lavt. Vurder leveringen sammen med løpene, forsvarernes plassering og hvor mottakeren kan møte ballen. Manuset beskriver dødballangrepet som en egen angrepstype og en mulighet til å skape sjanser mot et etablert, lavt forsvar. Den eksisterende bokas nærstolpe-, bakre sone- og kortcornervarianter beholdes.",
        "source": "Fotballdokumentet v1.pdf – Offensiv dødball – Corner, linje 3316–3333 / Tre angrepstyper"
      },
      {
        "id": "corner_disguise",
        "title": "Corner – oppstilling, bevegelse og kamuflering",
        "text": "Manuset fremhever startposisjoner, avvik fra vanlige mønstre og kamuflering av hensikten. Det nevner også plassering foran keeper og forsvarere på streken. Dette må forstås innenfor lovlig plassering og bevegelse: spillere kan velge utgangsposisjon og endre løp for å skape rom, men skal ikke holde eller ulovlig hindre motstanderens bevegelse. Tren koordinert timing mellom leveringen og løpene, slik at forsvareren må reagere på flere muligheter. Manusets forslag om fysisk sperring gjengis ikke som en tillatt taktisk instruks.",
        "source": "Fotballdokumentet v1.pdf – Offensiv dødball – Corner, linje 3322–3346; IFAB regel 12, https://www.theifab.com/laws/latest/fouls-and-misconduct/"
      }
    ]
  },
  {
    "id": "free_kicks",
    "title": "Frispark – skudd, innlegg eller ny vinkel",
    "principles": [
      "attacking_patterns_need_timing",
      "technical_skill_must_survive_pressure"
    ],
    "clubs": [
      "lillestrom",
      "viking"
    ],
    "concept": "Direkte frispark nær mål kan gi en skuddmulighet. Fra en annen vinkel kan et innlegg eller en kort pasning være bedre. Forsvaret må forholde seg til både mur, keeperens sikt, løp bak linjen og andreball. Ved indirekte frispark kan ballen ikke gå rett i motstanderens mål uten en annen berøring; ordinær offsidevurdering gjelder ved frispark.",
    "dilemma": "En høy forsvarslinje kan holde mottakerne lenger fra mål, men blir sårbar for riktig timede løp. En dyp linje reduserer bakrom, men kan tillate farlige dueller nær keeperen. Skuddvalg avhenger av vinkel, avstand og leveringsferdighet.",
    "manager": "Dødballmotoren har en generell motstanderlevering mot boksen og nedfall, ikke en separat frisparkfysikk, murberegning eller skuddvariant. Bruk rollepassform og defensiv balanse som utgangspunkt.",
    "practice": "Øv på direkte skudd, levering fra side og kort frispark. Bytt forsvarslinjens høyde og vurder timing, offside og keeperens arbeidsrom.",
    "sources": [
      {
        "title": "IFAB – frispark, regel 13",
        "url": "https://www.theifab.com/laws/latest/free-kicks/"
      },
      {
        "title": "IFAB – offside, regel 11",
        "url": "https://www.theifab.com/laws/latest/offside/"
      }
    ],
    "engineRefs": [
      {
        "file": "src/football-matchday-sequence-v8.js",
        "symbol": "resolveOpponentSetPiece"
      }
    ],
    "diagrams": [
      {
        "kind": "pitch",
        "title": "Frispark fra side",
        "note": "Levering bak en forsvarslinje krever timet løp; løperen må forholde seg til offside ved pasningen.",
        "players": [
          [
            48,
            12,
            "Server",
            "a"
          ],
          [
            66,
            32,
            "Løper",
            "a"
          ],
          [
            66,
            68,
            "Løper",
            "a"
          ],
          [
            76,
            28,
            "Forsvar",
            "d"
          ],
          [
            76,
            47,
            "Forsvar",
            "d"
          ],
          [
            76,
            70,
            "Forsvar",
            "d"
          ],
          [
            95,
            49,
            "Keeper",
            "d"
          ]
        ],
        "arrows": [
          [
            48,
            12,
            87,
            54
          ],
          [
            66,
            32,
            87,
            43
          ],
          [
            66,
            68,
            87,
            66
          ]
        ]
      },
      {
        "kind": "flow",
        "title": "Velg frisparkvariant",
        "note": "Les vinkel, avstand, mur, keeper og mottakere før valget.",
        "start": "Frispark",
        "decision": "Direkte avslutning realistisk?",
        "branches": [
          "Ja → vurder skudd og retursikring",
          "Nei → innlegg eller kort kombinasjon"
        ]
      }
    ],
    "sourceDetails": [
      {
        "id": "free_kick_targets",
        "title": "Offensivt frispark – tre leveringsmål og skjulte varianter",
        "text": "Manuset fremhever presisjon og avtaler ved frispark. Innlegget kan siktes mot bakrommet, den primære avslutningssonen eller bakre stolpe, med kraft og tydelig retning. Ved frispark nær mål nevnes direkte skudd og skjulte kombinasjoner. Det taktiske poenget er å samordne levering og løp slik at forsvaret må reagere. Ved frispark gjelder ordinær offsidevurdering; når tre eller flere forsvarere danner mur, må angrepsspillerne holde minst én meters avstand til muren til ballen er i spill. Manusets leveringsmål er alternativer, ikke en fast prioriteringsrekkefølge.",
        "source": "Fotballdokumentet v1.pdf – Offensiv dødball – Frispark, linje 3334–3346; IFAB regel 11 og 13, https://www.theifab.com/laws/latest/offside/ ; https://www.theifab.com/laws/latest/free-kicks/"
      },
      {
        "id": "penalty_kicker",
        "title": "Straffespark – avslutningsvalg og ro",
        "text": "I avslutningsdelen anbefaler originalmanuset å velge lav eller høy plassering fremfor halvhøy. Påstanden om at halvhøye straffer reddes oftest er ikke verifisert i manusets kildegrunnlag og brukes derfor ikke som statistisk fasit. De tilhørende mentale rådene er å stole på ferdighetene, akseptere bom og handle rolig og besluttsomt. Skytteren må forholde seg til regelverket for straffespark, herunder at ballen sparkes fremover. Teksten beskriver et avslutningsprinsipp, ikke en ny beregning av sannsynlighet for scoring.",
        "source": "Fotballdokumentet v1.pdf – Angrepsavslutning – Mentale faktorer / Straffe, linje 2487–2495 og 2521–2525; IFAB regel 14, https://www.theifab.com/laws/latest/the-penalty-kick/"
      },
      {
        "id": "penalty_keeper",
        "title": "Straffespark – keeperens observasjon og timing",
        "text": "Manusets keeperdel anbefaler å studere tidligere straffer og observere tilløp, hofter og fotstilling. Keeperen må avveie hvor lenge han venter mot behovet for å rekke ballen. Manusets generalisering om naturlig hjørne for høyre- og venstrebente er ikke kontrollert og er ingen sikker prediksjon for en enkelt skytter. Historiske keeperanekdoter om forstyrrelser er ikke instruksjoner: keeperen skal ikke distrahere skytteren på en usportslig måte. Ved balltreff må minst en del av én fot berøre mållinjen, være på linje med den eller bak den. Vurder observasjon og lovlig utgangsstilling fremfor å innføre faste redningssannsynligheter.",
        "source": "Fotballdokumentet v1.pdf – Keeper – Straffer, linje 1089–1104; IFAB regel 14, https://www.theifab.com/laws/latest/the-penalty-kick/"
      },
      {
        "id": "portrait_juninho_beckham_pirlo",
        "title": "Juninho, Beckham og Pirlo – frispark som teknisk spesialisering",
        "text": "UEFAs samling av historiske frispark og kampreferatet fra Lyon dokumenterer Juninho Pernambucano som frisparkspesialist. I et intervju beskriver Juninho selv sin tekniske utvikling. Bruk Juninho, Beckham og Pirlo, som alle er nevnt i originaldisposisjonen, til å undersøke ulike leveringsbaner: skrudd ball, varierende rotasjon og målrettet plassering. Observer tilløp, treffpunkt, mur, avstand og keeperposisjon. Teknisk variant må velges ut fra situasjonen, ikke spillerens berømmelse. Ingen fast frisparksannsynlighet eller rangering av spillerne legges inn.",
        "source": "Faglig tillegg – UEFA, https://www.uefa.com/uefachampionsleague/news/0271-142ab5eaac54-565b3cc3cec4-1000--the-best-free-kicks-in-uefa-champions-league-history/ ; https://www.uefa.com/uefachampionsleague/news/01b2-0e6d65fc4647-b5a0bb928927-1000--juninho-strike-leaves-lyon-on-top/ ; FourFourTwo, https://www.fourfourtwo.com/features/best-free-kick-taker-ever-juninho-pernambucano-how-he-got-so-good; personnavn fra Fotballdokumentet v1.pdf"
      },
      {
        "id": "portrait_rivelino",
        "title": "Rivelino – frisparkets leveringsbane",
        "text": "FIFAs historiske videomateriale dokumenterer Rivelinos frisparkmål i VM 1974. Originalmanuset nevner ham sammen med Beckham, Juninho og Pirlo. Bruk klippet som utgangspunkt for å undersøke ballens bane, skuddretning, murens plassering og keeperens reaksjon. Skytteren kan søke en direkte avslutning eller velge en pasning dersom situasjonen tilsier det. Ikke utled nøyaktige fysiske treffverdier fra en enkelt video. Formålet er å forstå hvordan teknikk og situasjonsvalg henger sammen, ikke å kopiere en berømt skuddrutine uten tilpasning.",
        "source": "Faglig tillegg – FIFA, https://collect.fifa.com/collectible/182425449578756; personnavn fra Fotballdokumentet v1.pdf"
      }
    ]
  },
  {
    "id": "throw_ins",
    "title": "Innkast – støttetrekant og andreball",
    "principles": [
      "combination_game_beats_isolated_dribbling",
      "defending_uses_first_second_third_defender"
    ],
    "clubs": [
      "lillestrom",
      "viking"
    ],
    "concept": "Sidelinjen begrenser pasningsvinklene ved innkast. Et lag kan tilby én møtende spiller, én støtte innenfor og én dybdeløper. Lange innkast nær boksen kan skape duell og nedfall, men trenger en annen organisering enn et kort innkast. Offside gjelder ikke ved direkte mottak fra innkast; ved neste pasning gjelder vanlige offsideregler. Kastet kan ikke gå direkte i mål.",
    "dilemma": "Et kast til en feilvendt spiller tett på sidelinjen kan bli en pressfelle. Et langt kast med alle spillere foran ballen kan gi motstanderen en kontring etter klarering. Kastretningen er derfor avhengig av støtte og sikring.",
    "manager": "Noen eksisterende dødballhendelser omtaler innkast, men de behandles gjennom en generell dødballmodell. Dette kapittelet gir ikke spillet en ny innkastmotor.",
    "practice": "Spill 4 mot 4 med gjentatte innkast. Angrepslaget skal tilby støtte foran, innenfor og bak ballen. Forsvarslaget forsøker å låse første mottaker mot sidelinjen.",
    "sources": [
      {
        "title": "IFAB – innkast, regel 15",
        "url": "https://www.theifab.com/laws/latest/the-throw-in/"
      },
      {
        "title": "IFAB – offside, regel 11",
        "url": "https://www.theifab.com/laws/latest/offside/"
      }
    ],
    "diagrams": [
      {
        "kind": "pitch",
        "title": "Tre utveier fra sidelinjen",
        "note": "Møtende mottaker, støtte inne i banen og dybdeløper tilbyr ulike vinkler.",
        "players": [
          [
            38,
            4,
            "Kaster",
            "a"
          ],
          [
            48,
            18,
            "Møter",
            "a"
          ],
          [
            31,
            37,
            "Støtte",
            "a"
          ],
          [
            70,
            21,
            "Løper",
            "a"
          ],
          [
            53,
            23,
            "Press",
            "d"
          ],
          [
            44,
            40,
            "Sikring",
            "d"
          ],
          [
            75,
            39,
            "Back",
            "d"
          ]
        ],
        "arrows": [
          [
            38,
            4,
            48,
            18
          ],
          [
            48,
            18,
            31,
            37
          ],
          [
            31,
            37,
            70,
            21
          ]
        ]
      }
    ],
    "sourceDetails": [
      {
        "id": "restart_lock",
        "title": "Lås av ved motstanderens igangsetting",
        "text": "Manuset beskriver lås av ved målspark, innkast og frispark på motstanderens tredel: dekk tilgjengelige mottakere og styr oppspillet mot en spiller som kan presses, eksempelvis sidebacken. Det er en kollektiv pressidé, ikke at alle spillere alltid skal mannsmarkere. Midtbanens nøyaktige posisjonering står som et spørsmål i manusets tekst. Ved innkast gjelder dessuten reglene for igangsetting, og en mottaker kan ikke være offside direkte fra innkastet. Originalmanuset beskriver ikke en full offensiv innkastvariant; bokas eksisterende støttetrekant beholdes.",
        "source": "Fotballdokumentet v1.pdf – 2. Defensivt – Lås av, linje 1594–1601; IFAB regel 11, https://www.theifab.com/laws/latest/offside/"
      }
    ]
  },
  {
    "id": "marking_blocks",
    "title": "Markering, løpsbaner og lovlig plassering",
    "principles": [
      "defending_uses_first_second_third_defender",
      "wm_requires_clear_marking_and_support",
      "keeper_communication_organizes_the_block"
    ],
    "clubs": [
      "lillestrom",
      "viking",
      "hodd"
    ],
    "concept": "Ved personmarkering følger spilleren en motstander; ved sonemarkering har han ansvar for et rom og må angripe ballen der. En blandet organisering kombinerer begge deler og kan ha egne spillere ved boksens kant. Angripere kan bruke koordinerte løp for å skape separasjon. Å ta en lovlig posisjon er noe annet enn å bevege seg inn i en motstanders løpsbane for å hindre ham ulovlig. Holding og ulovlig hindring skal ikke trenes som taktiske løsninger.",
    "dilemma": "Personmarkering kan følge løpere, men skaper risiko for at markører trekkes ut av farlige soner. Sonemarkering beskytter områder, men krever riktig timing når løpere kommer inn med fart. Blandede systemer trenger tydelig ansvar i grenseområdene.",
    "manager": "Kampmotoren vurderer stopper- og keeperdekning ved første kontakt. Det finnes ikke her et selvstendig valg av person-, sone- eller hybridmarkering for hver corner. Ikke tolk en god stoppervurdering som en garanti for at alle soner er dekket.",
    "practice": "Bruk samme angrepsvariant mot person-, sone- og blandet markering. Evaluer første kontakt, kommunikasjon og kontroll ved klarering. Stopp og korriger ulovlig holding eller hindring.",
    "sources": [
      {
        "title": "FIFA Training Centre – sonemarkering og personmarkering ved corner",
        "url": "https://www.fifatrainingcentre.com/en/game/game-analysis/set-plays/corners/defending-corners-zonal-or-player-to-player.php"
      },
      {
        "title": "FIFA Training Centre – forsvar av corner, klubb-VM 2025",
        "url": "https://www.fifatrainingcentre.com/en/game/tournaments/fcwc/2025/team-analyses/set-plays-defending-corner-strategies.php"
      },
      {
        "title": "IFAB – forseelser og usportslig opptreden, regel 12",
        "url": "https://www.theifab.com/laws/latest/fouls-and-misconduct/"
      }
    ],
    "engineRefs": [
      {
        "file": "src/football-matchday-sequence-v8.js",
        "symbol": "resolveOpponentSetPiece"
      }
    ],
    "diagrams": [
      {
        "kind": "pitch",
        "title": "Personmarkering",
        "note": "Hver lyse markør følger en angriper. En egen spiller beskytter et sentralt område.",
        "players": [
          [
            97,
            6,
            "Server",
            "a"
          ],
          [
            67,
            31,
            "Løper",
            "a"
          ],
          [
            69,
            50,
            "Løper",
            "a"
          ],
          [
            68,
            72,
            "Løper",
            "a"
          ],
          [
            72,
            31,
            "Markør",
            "d"
          ],
          [
            74,
            50,
            "Markør",
            "d"
          ],
          [
            73,
            72,
            "Markør",
            "d"
          ],
          [
            87,
            50,
            "Sikring",
            "d"
          ]
        ],
        "arrows": [
          [
            67,
            31,
            85,
            27
          ],
          [
            69,
            50,
            86,
            58
          ],
          [
            68,
            72,
            87,
            75
          ],
          [
            72,
            31,
            83,
            27
          ]
        ]
      },
      {
        "kind": "pitch",
        "title": "Sone- og kantdekning",
        "note": "Forsvarerne fordeler målrommet og én spiller beskytter boksens kant. De må angripe ballen når den kommer inn i sonen.",
        "players": [
          [
            97,
            6,
            "Server",
            "a"
          ],
          [
            64,
            30,
            "Løper",
            "a"
          ],
          [
            64,
            70,
            "Løper",
            "a"
          ],
          [
            83,
            30,
            "Sone",
            "d"
          ],
          [
            83,
            50,
            "Sone",
            "d"
          ],
          [
            83,
            70,
            "Sone",
            "d"
          ],
          [
            62,
            49,
            "Retur",
            "d"
          ],
          [
            95,
            50,
            "Keeper",
            "d"
          ]
        ],
        "arrows": [
          [
            97,
            6,
            81,
            31
          ],
          [
            64,
            30,
            81,
            31
          ],
          [
            83,
            30,
            80,
            29
          ]
        ]
      }
    ],
    "sourceDetails": [
      {
        "id": "corner_defence_posts",
        "title": "Defensiv corner – mann-mot-mann og stolpeansvar",
        "text": "Originalmanusets defensive cornervariant er mann-mot-mann, med én spiller ved første stolpe og én ved andre stolpe med ansvar for rommet der. Dette er én navngitt organisering, ikke et krav ved alle cornere. Avtal hvem som følger motstanderens løp, hvem som har stolpeansvar og hvem som dekker ledige rom. Manusets korte uttrykk om kroppskontakt må avgrenses til lovlig posisjonering og duellspill. Bokas eksisterende sone- og blandingsalternativer beholdes, slik at manageren kan sammenligne organiseringene.",
        "source": "Fotballdokumentet v1.pdf – Defensiv Dødball – Defensiv corner, linje 1855–1860; IFAB regel 12, https://www.theifab.com/laws/latest/fouls-and-misconduct/"
      },
      {
        "id": "restart_organize",
        "title": "Defensive dødballer – keeperens organisering og konkrete beskjeder",
        "text": "Keeperdelen fremhever tidlig organisering av mur, spillermarkeringer og høyt press på andreballer. Keeperen vurderer om han kan gå ut og angripe ballen eller bør holde posisjonen nærmere linjen. Kommunikasjonsdelen anbefaler konkrete avklaringer av hvem som har hvilken motstander, for eksempel spørsmålet Har du han? En felles beskjed kan utløse press. Den separate overskriften Defensiv frispark har ingen utfylt forklaring i originalmanuset; den eksisterende bokas frisparkkapittel gir derfor supplerende fagstoff, ikke en rekonstruert originalbeskrivelse.",
        "source": "Fotballdokumentet v1.pdf – Keeper 1.5 Dødball, linje 1199–1203 / Situasjonsavhengig posisjonering, 958–963 / Kommunikasjon, 3707–3712 / Defensiv frispark, 1866"
      },
      {
        "id": "portrait_ramos",
        "title": "Sergio Ramos – stopperens offensive dødballoppgave",
        "text": "Real Madrid dokumenterer Ramos' utligning med heading i europacupfinalen i 2014. Den historiske hendelsen kan brukes til å undersøke en stoppers offensive arbeidsoppgave ved dødball: startposisjon, timing, ballbane og lovlig duell. Avklar samtidig hvem som sikrer bak angrepet. En avgjørende scoring er ikke i seg selv en måling av vinnermentalitet eller bevis for at en bestemt risikostrategi er optimal. Caset plasseres derfor i dødballkapitlet fremfor å brukes som psykologisk karakteristikk.",
        "source": "Faglig tillegg – Real Madrid, https://www.realmadrid.com/en-US/news/club/latest-news/la-decima-cumple-diez-anos-24-05-2024; personnavn fra Fotballdokumentet v1.pdf"
      }
    ]
  },
  {
    "id": "second_ball_security",
    "title": "Andreball og kontringssikring ved dødball",
    "principles": [
      "dribbling_needs_purpose_and_cover",
      "defensive_block_must_choose_risk_level",
      "attacking_patterns_need_timing"
    ],
    "clubs": [
      "lillestrom",
      "viking",
      "stromsgodset"
    ],
    "concept": "En dødball avsluttes ikke nødvendigvis ved første klarering. Laget kan vinne nedfallet, slå et nytt innlegg, finne skuddrom ved boksens kant eller trekke seg tilbake og bygge på nytt. Forsvarslaget kan også bruke klareringen som starten på en kontring. Spillere som sikrer returrommet og spillere som sikrer bakrommet har ulike oppgaver.",
    "dilemma": "Å plassere mange spillere i boksen øker antallet mulige mottakere, men kan etterlate for få bak ballen. Å holde for mange igjen kan redusere farligheten. Et godt restforsvar må ha kontroll på både første kontringspasning og løpere som starter fra dypet.",
    "manager": "Dødballfasen har separate modellutfall for første kontakt, nedfall etter klarering og avverget situasjon. I den eksisterende modellen påvirker stopper/keeper første kontakt, og sentral midtbane/restforsvar kontrollen av nedfall. Det er én fase med ett tilfeldig trekk og ett avgrenset xG-bidrag, ikke to automatiske avslutninger. En egen kontringsfase etter enhver corner er ikke innført.",
    "practice": "Tren corner der spillet fortsetter etter klarering mot et omstillingsmål. Gi poeng for sikker gjenvinning av andreball og for kontrollert kontring; vurder hvem som blir igjen bak angrepet.",
    "sources": [
      {
        "title": "FIFA Training Centre – kontring etter defensiv corner",
        "url": "https://www.fifatrainingcentre.com/en/game/game-analysis/set-plays/set-play-routines/defensive-corners-exploiting-attacking-outlets.php"
      },
      {
        "title": "FIFA Training Centre – dødballfaser ved klubb-VM 2025",
        "url": "https://www.fifatrainingcentre.com/en/game/tournaments/fcwc/2025/team-analyses/more-goalscoring-opportunities-generated-from-set-plays.php"
      }
    ],
    "engineRefs": [
      {
        "file": "src/football-matchday-sequence-v8.js",
        "symbol": "resolveOpponentSetPiece"
      }
    ],
    "diagrams": [
      {
        "kind": "pitch",
        "title": "Dekning av returrom og bakrom",
        "note": "En mottaker ved boksens kant søker nedfallet. To dypere spillere kontrollerer utveiene ved kontring.",
        "players": [
          [
            96,
            7,
            "Server",
            "a"
          ],
          [
            80,
            34,
            "Spiss",
            "a"
          ],
          [
            80,
            66,
            "Løper",
            "a"
          ],
          [
            58,
            47,
            "Retur",
            "a"
          ],
          [
            28,
            28,
            "Sikring",
            "a"
          ],
          [
            29,
            70,
            "Sikring",
            "a"
          ],
          [
            86,
            42,
            "Stopper",
            "d"
          ],
          [
            86,
            65,
            "Stopper",
            "d"
          ],
          [
            44,
            62,
            "Kontring",
            "d"
          ]
        ],
        "arrows": [
          [
            86,
            42,
            58,
            47
          ],
          [
            58,
            47,
            80,
            65
          ],
          [
            44,
            62,
            12,
            62
          ]
        ]
      },
      {
        "kind": "flow",
        "title": "Etter første kontakt",
        "note": "Et avgrenset utfallsdiagram for den eksisterende modellen.",
        "start": "Levering mot boksen",
        "decision": "Motstander når først fram?",
        "branches": [
          "Ja → første kontakt kan true målet",
          "Nei → klarering; nedfallet må fortsatt sikres"
        ]
      }
    ],
    "sourceDetails": [
      {
        "id": "offensive_marking_restart",
        "title": "Offensiv markering – sikring mens eget lag har ballen",
        "text": "Manusets begrep offensiv markering beskriver at en sikringsspiller tar hensyn til motstanderens spiss også mens eget lag er i angrep. Eksemplet er igangsetting fra egen keeper, der forsvarere ellers kan bli stående alene. Plasseringen må gi mulighet til å håndtere en overgang hvis ballen tapes, samtidig som laget kan bygge opp angrepet. Dette viderefører bokas restforsvar og kontringssikring, ikke en regel om fast antall spillere bak ballen. Keeperens anbefaling om å presse andreballen må sees sammen med laget i balanse.",
        "source": "Fotballdokumentet v1.pdf – Defensiv Dødball – Offensiv markering, linje 1859–1866 / Keeper 1.5 Dødball"
      },
      {
        "id": "clearance_counter_restart",
        "title": "Klarering etter dødball – fra forsvar til angrep",
        "text": "Manuset beskriver en klareringsvariant som også gjelder dødballer: spissen møter mot ballside, motsatt back går på løp, ballsidens ving holder bredt og motsatt ving skjærer inn. Spissen kan legge igjen til midtbane eller vende opp hvis det er tid. En senere pasning kan frigjøre backen eller en ving, eventuelt et tilbakespill fra skrå vinkel til en spiller på løp. Spørsmålet om spissen alltid bør møte mot venstre står åpent i originalen. Dette er en avtalt omstillingsvariant, ikke en fast angrepsrute eller garanti for gjennombrudd; ved manglende kontroll må laget sikre ball og rom.",
        "source": "Fotballdokumentet v1.pdf – Klarering, linje 3775–3792"
      }
    ]
  }
];
