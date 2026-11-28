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
    "concept": "Keeperrollen bestemmer hvor mye av rommet utenfor målområdet laget kan forsvare, og om keeperen inngår som oppspillsspiller. Linjekeeperen og sweeperkeeperen har ulike krav til plassering og støtte. Originalmanuset beskriver vinkelkontroll, dybdejustering og sideforflytning som egne keeperoppgaver. Keeperen må også avgjøre om et skudd kan holdes, pareres ut i et trygt rom eller blokkeres, og være klar til returen. Ved igangsetting er tempo et valg: tidlig distribusjon kan utnytte motstanderens ubalanse, mens laget etter langvarig press kan trenge tid til å flytte opp. Keeperens kommunikasjon hjelper blokken å avgjøre når laget er i balanse og hvem som kan støte.",
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
    ],
    "sourceDetails": [
      {
        "id": "keeper_positioning",
        "title": "Keeper – posisjonering og romkontroll",
        "text": "Kjenn plasseringen av stolpene, femmeteren og straffemerket. Manuset beskriver en høyere utgangsposisjon når ballen er langt unna, og en dypere posisjon når den nærmer seg mål. Bruk vinkelen fra ballen til begge stolpene som orienteringspunkt. Juster dybden med små steg i takt med ballførerens berøringer, og flytt sidelengs med balanse og føttene klare. Ved langskudd beskrives en mer oppreist beredskap, ved korte avstander et lavere tyngdepunkt. Ved innlegg vurderes ballbanen og spillerne i feltet før keeper velger å bli på linjen eller møte ballen. I én-mot-én beskriver manuset en høy startposisjon fulgt av en bred, lav stjerneposisjon når angriperen nærmer seg. Vurder egen fart, risikoen for lobb og baneforhold.",
        "source": "Fotballdokumentet v1.pdf – 1.1 Posisjonering / Vinkelkontroll / Dybdejustering / Én-mot-én"
      },
      {
        "id": "keeper_saves",
        "title": "Keeper – skuddstopping, returer og straffespark",
        "text": "Vær lett på fotbladet, se på ballen og velg raskt mellom grep, parering og blokkering. Manuset skiller mellom skudd innenfor rekkevidde, harde skudd nær kroppen og skudd i ytterkant: forsøk grep der det er forsvarlig, blokker kroppsnære skudd og styr vanskelige pareringer ut til siden. Kom raskt opp igjen og forbered returen. Ved lave skudd beskrives bruk av kropp og bein; ved høye skudd den øverste armen for rekkevidde. Manuset omtaler split step, kontrollert landing og beredskap for stuss. Ved straffer: studer tidligere straffer, les tilløp og hofter og avvent så lenge situasjonen tillater. Manusets antakelser om skuddfot og hjørne gjengis ikke som sikre sannsynligheter.",
        "source": "Fotballdokumentet v1.pdf – 1.2 Skuddstopping / Returer / Spesielle situasjoner / Straffer"
      },
      {
        "id": "keeper_distribution",
        "title": "Keeper – distribusjon, styring og dødball",
        "text": "Spill kort og presist til stoppere eller backer, eller sett i gang tidlig med kast eller utspark når det finnes kontringsrom. Etter langvarig press kan laget trenge tid til å flytte ut, innenfor spillets regler. Manuset beskriver innsidespark i kort oppbygging, halvhøye kast som kan passere et pressledd, halvvolley mot kant eller spiss og lange utspark der retning og lengde må samordnes. Gi tydelige beskjeder, særlig i undertall: meld når laget er i balanse slik at forsvarer kan støte, diriger blokkering og signaliser langt utspill. Organiser mur og markering tidlig ved dødball, og forbered laget på andreballen. I manusets 4-3-3-profil skal keeper være god med ballen, offensiv i feltet og kunne sette i gang hurtig og kaste langt.",
        "source": "Fotballdokumentet v1.pdf – 1.3 Distribuering / 1.4 Kommunikasjon / 1.5 Dødball / 5.5 4-3-3"
      },
      {
        "id": "portrait_keeper_depth",
        "title": "Neuer, Higuita og Alisson – rommet bak forsvarslinjen",
        "text": "Originalmanuset bruker Manuel Neuer, René Higuita og Alisson som eksempler på keeperens aktive posisjon bak backrekken. Det taktiske dilemmaet er å kunne avskjære gjennomspill uten å åpne for avslutninger over keeperen. Se på avstanden til forsvarslinjen, ballførerens mulighet til å slå i bakrom og keeperens startposisjon. Manuset kontrasterer dette med Buffon og Zoff som linjeorienterte eksempler. Kategoriene beskriver ulike vektlegginger, ikke uttømmende eller uforanderlige karakteristikker av keepernes karrierer.",
        "source": "Fotballdokumentet v1.pdf – 1.1 Posisjonering / Linjekeepere vs sweeper-keepere, linje 838–949"
      },
      {
        "id": "portrait_keeper_angles",
        "title": "Schmeichel, Banks og Zoff – vinkel, dybde og reaksjon",
        "text": "Manuset bruker Peter Schmeichels brede blokkering i én-mot-én, Gordon Banks' redning mot Pelé og Dino Zoffs dybdejustering som læringseksempler. Studer hvordan keeperens utgangsstilling påvirker muligheten til å dekke målrommet, og hvordan siste forflytning må samordnes med skuddet. UEFA dokumenterer Schmeichels betydelige rolle i Danmarks EM-triumf i 1992. Kildene gir ikke grunnlag for påstanden om at han oppfant stjerneblokkeringen, eller at Banks' redning alene kan forklares med vinkelkontroll.",
        "source": "Fotballdokumentet v1.pdf – 1.1 Vinkelkontroll / Dybdejustering / 1.2 Grunnprinsipper; UEFA, https://www.uefa.com/uefaeuro/history/news/025d-0f6f811b9339-3bdefd2fd076-1000--euro-92-spotlight-how-brilliant-was-denmark-s-peter-schme/"
      },
      {
        "id": "portrait_keeper_saves",
        "title": "Yashin, Buffon, Casillas, Kahn og De Gea – forskjellige redningsoppgaver",
        "text": "Manusets keeperteknikk bruker Yashin til å illustrere sideforflytning og vinkel, Buffon grep og parering, Casillas reaksjon og retur, Kahn blokkering og De Gea beinparader. Van der Sar nevnes ved rekkevidde og sideforflytning. Kahn og Alisson brukes også ved innlegg. Disse eksemplene gir en observasjonsramme: kunne keeperen holde ballen, styre den bort fra fare eller komme raskt tilbake i stilling? Manusets absolutte beskrivelser av enkeltkeepere er ikke målt eller uavhengig kontrollert; navnene fungerer her som faglige casepekere.",
        "source": "Fotballdokumentet v1.pdf – 1.1 Sideforflytning / Posisjonering mot innlegg / 1.2 Skuddstopping, linje 880–1087"
      },
      {
        "id": "portrait_keeper_distribution",
        "title": "Ter Stegen, Casillas, Schmeichel, Alisson og Ederson – tempo i igangsettingen",
        "text": "Manuset setter kort oppbygging, rask kontring og roligere distribusjon opp som ulike keeperoppgaver. Ter Stegen brukes ved korte pasninger, Casillas og Schmeichel ved utkast, Alisson ved lange oppspill og Buffon ved å organisere laget før igangsetting. Ederson er et utdypet eksempel på kort og lang distribusjon under Guardiola; Manchester Citys egne intervjuer beskriver hans rolle i oppbyggingen. Observer ikke bare pasningslengde, men motstanderens press, medspillernes posisjon og risiko ved balltap. Manusets historiske enkeltpasninger er ikke alle verifisert; keeperen må følge gjeldende tidsregler ved ballkontroll.",
        "source": "Fotballdokumentet v1.pdf – 1.3 Distribuering, linje 1110–1183 / Del V – Ederson; Manchester City, https://www.mancity.com/news/mens/ederson-fulham-preview-premier-league-63863644"
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
    ],
    "sourceDetails": [
      {
        "id": "centre_back_defence",
        "title": "Stopper – defensive arbeidsoppgaver",
        "text": "Orienter deg kontinuerlig rundt deg, avgjør når en mottaker skal følges og når linjen må holdes. Sikre sidebacken med riktig vinkel, sentrer når backen følger motstanderen mot linjen, og angrip luftballer med timing og retning. Når én stopper støter frem, må backene eller en midtbanespiller ivareta balansen. Diriger leddet med beskjeder om fall, støt, push og linje. Ved innlegg: plasser deg foran mål, sidestilt med oversikt over angriperne; bryt foran mottakeren når timingen og sikringen tillater det. Manusets 4-3-3-ideal er et komplementært par: én rask og ballspillende, én sterk i dueller, begge med kommunikasjon og sikringsferdigheter. Høyrefotet høyrestopper og motsatt på venstre er en preferanse, ikke et krav.",
        "source": "Fotballdokumentet v1.pdf – Posisjonelle oppgaver/valg i forsvar – Stopper / 5.5 4-3-3"
      },
      {
        "id": "centre_back_attack",
        "title": "Stopper – oppbygging og pasningsvalg",
        "text": "I manusets oppbygging står stopperen gjerne ved hjørnet av sekstenmeteren, sidestilt for å kunne se flere alternativer. Han styrer rytmen og kan føre gjennom et ledd for å skape overtall. Vurder ni utveier: spiss i bakrom, møtende spiss, kant i bakrom, møtende kant, indreløper i medløp, direkte gjennombrudd, sentral midtbane, back eller stopper i støtte. Søk øyekontakt, bruk blikket aktivt og vurder hvilket rom pasningen åpner. Når ballen føres frem, må andre ivareta sikringen.",
        "source": "Fotballdokumentet v1.pdf – 3.3 Posisjonelle oppgaver og valg i angrep – Stopper"
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
    ],
    "sourceDetails": [
      {
        "id": "fullback_defence",
        "title": "Back – timing av støt, sikring og sideforskyvning",
        "text": "Følg stopperen innenfor deg og hold riktig side mellom motstander og mål. Led motstanderen utover i manusets backinstruks. Støt slik at du kan presse kantens førsteberøring, men ikke så tidlig at ballen kan spilles i rommet bak. Unngå å stå og markere en ving som befinner seg i midtbanens sone før pasningen er aktuell. Sikre stopperen i duell, orienter deg kontinuerlig og gjenvinn ved balltap dersom laget har dekning. Manuset bruker to holdepunkter for å forlate formasjonen: en realistisk mulighet til å vinne ballen, eller en mottaker uten støttepasning. Ved sideforskyvning trekker backen inn mot nærmeste stolpe etter situasjonen; uten en motspiller mellom deg og sidelinjen kan du være unødvendig bred. Når eget lag angriper på motsatt side, beskrives en posisjon bak ballfører.",
        "source": "Fotballdokumentet v1.pdf – Posisjonelle oppgaver/valg i forsvar – Back"
      },
      {
        "id": "fullback_attack",
        "title": "Back – bredde, overlapp og pasningsvalg",
        "text": "Når keeper har ball, går backen opp og ut med riktig timing. Bruk veggspill og overlapp, men hold igjen når motsatt back går. Er kanten tett markert, vurder bakrom; er kanten fri, spill på fot. Pasningsalternativene omfatter møtende eller stikkende spiss, kant, indreløper i medløp, sentral midtbane og stopper i støtte. Spill fremover hvis mulig, støtte hvis nødvendig. Manuset skiller tidlige innlegg mot første stolpe ved høyt forsvar fra levering mot bakre stolpe eller 45-gradersinnlegg mot etablert forsvar. I 4-3-3 skal backen kunne ta ned lange spillvendinger, slå innlegg, ha hurtighet og mestre én-mot-én uten å selge seg.",
        "source": "Fotballdokumentet v1.pdf – 3.3 Posisjonelle oppgaver og valg i angrep – Back / 5.5 4-3-3"
      },
      {
        "id": "wingback_corridor",
        "title": "Vingback – korridoransvar med tre stoppere",
        "text": "I manusets 3-4-2-1 har vingbackene ansvar for sidekorridoren. Når laget forsvarer i en femmer, kan ballnær vingback støte tidlig ut for å hindre kant eller back i å vende opp. Motsatt vingback kan da ligge noe høyere enn de tre stopperne, slik at bakre ledd ser ut som tre eller fire. Tre stoppere kan dekke innlegg og sentrale rom, men laget kan bli baktungt og få lave ballbrudd. Dersom sidestopperne ikke bidrar i ballfordelingen, blir det færre oppspillspunkter. Fordelingen av bredde og sikring må derfor avtales; tre stoppere alene betyr ikke nødvendigvis en defensiv spillestil.",
        "source": "Fotballdokumentet v1.pdf – 5.7 3-4-2-1 / Spill med tre bak"
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
    ],
    "sourceDetails": [
      {
        "id": "central_midfield_defence",
        "title": "Sentral midtbane – skjerming, andreball og balanse",
        "text": "Behersk førsteforsvareroppgavene, vinn luftdueller, fall ned for å plukke opp andreballer og skjerm pasninger til motstanderens spiss. I manusets 4-3-3 skal én spiller alltid dekke hullet foran stopperne, og de tre sentrale skal ikke trekkes helt ut mot kanten samtidig. Midtbanen må være løpssterk og omstille fordi formen i angrep kan avvike fra forsvarsformen. Tidlig gjenvinning er en prioritert mulighet, men dekningen foran stopperne må ivaretas.",
        "source": "Fotballdokumentet v1.pdf – Posisjonelle oppgaver/valg i forsvar – Midtbane / 5.5 4-3-3"
      },
      {
        "id": "central_midfield_attack",
        "title": "Sentral midtbane – spillbarhet og rytmekontroll",
        "text": "Vær spillbar i igangsettingen og når laget utfordrer på sidene. Motta under press, se etter bakrom, behersk lengre pasninger og posisjoner deg slik at angrepet kan få fart. Støtt møtende spiss; når dyp midtbane spiller opp på ham, må indreløperne gi støttevinkler. Søk returrommet ved innlegg dersom lagets balanse tillater det. Manusets instrukser gjelder sentral midtbane generelt, ikke en egen dokumentert regista-spesifikasjon.",
        "source": "Fotballdokumentet v1.pdf – 3.3 Posisjonelle oppgaver og valg i angrep – Midtbane / Oppspill"
      },
      {
        "id": "portrait_scanning",
        "title": "Xavi, Iniesta og andre orienteringssterke midtbanespillere",
        "text": "I persepsjonsdelen nevner manuset Xavi, Iniesta, Fàbregas, Van der Vaart, Sneijder, Lampard og Özil som eksempler ved orientering før og etter mottak. Oppgaven er å registrere press, støtte og rom, ikke bare å bevege hodet. For en dyp midtbanespiller skal orienteringen også gi informasjon om motstanderens bakre linje og muligheten for bakrom. Disse navnene beholdes som manusets observasjonsforslag; det finnes ikke individuelle scanningmålinger i materialet som gir grunnlag for rangering.",
        "source": "Fotballdokumentet v1.pdf – 3.2 Persepsjon, linje 2537–2570"
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
    ],
    "sourceDetails": [
      {
        "id": "eight_defence",
        "title": "Indreløper – sikring ved sideangrep",
        "text": "Når egen back utfordres bredt, skal en indreløper i manusets modell gå i sikring, mens motsatt indreløper holder igjen. Midtbanens relasjon til stopperne må bevares når spillere støter. Dette beskriver et kollektivt ansvar: ballnær spiller hjelper ved duellen, mens spilleren på motsatt side bidrar til balanse og dekning av neste rom.",
        "source": "Fotballdokumentet v1.pdf – Posisjonelle oppgaver/valg i forsvar – Indreløper / Spillmodell – Back blir utfordret"
      },
      {
        "id": "eight_attack",
        "title": "Indreløper – møte, stikke og fylle feltet",
        "text": "Tilpass bevegelsen til backen på samme side: noen ganger møte, andre ganger stikke. Når stopper har ball, kan indreløper gå bredt for å gi vinkel; når back har ball, kan indreløper trekke smalere for å åpne kantrommet. Ikke bruk opp mellomrommet før pasningen kan slås. I siste tredjedel beskriver manuset at minst én indreløper tar dypt løp inn i feltet, mens den andre må vurdere balansen. Dette gir vertikal trussel uten at begge nødvendigvis forlater samme rom.",
        "source": "Fotballdokumentet v1.pdf – 3.3 Posisjonelle oppgaver og valg i angrep – Indreløper / Bevegelser uten ball"
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
    ],
    "sourceDetails": [
      {
        "id": "supporting_forward",
        "title": "Hengende spiss – mellomrom, støtte og overgangsspill",
        "text": "Manuset beskriver den hengende spissen som en mobil, teknisk og taktisk sterk spiller som lever mellom motstanderens midtbane og forsvar. Når midtspissen møter og trekker en stopper ut, kan den hengende spissen angripe bakrommet; han skal gi støtte på siden, ta bakromsløp og være en ekstra avslutter på innlegg. I en omvendt diamant vektlegges løpskapasitet, oversikt, kommunikasjon og evne til å orkestrere overgangsspillet ut fra medangripernes bevegelser. Denne posisjonsbeskrivelsen utdyper tierkapitlet, men er ikke identisk med enhver klassisk tier eller fri skaper.",
        "source": "Fotballdokumentet v1.pdf – 3.3 Posisjonelle oppgaver og valg i angrep – Hengende spiss / 5.5 4-3-3"
      },
      {
        "id": "portrait_creative",
        "title": "Zidane, Ronaldinho og Maradona – den kreative handlingen",
        "text": "Originalmanuset bruker disse spillerne til å drøfte uttrykksfull teknikk og forholdet mellom struktur og brudd. En vending, finte eller pasning kan skape en fordel når den endrer motstanderens forventninger og gjør en medspiller spillbar. Den kreative spilleren bør derfor studeres sammen med bevegelsene rundt ballen, ikke som et isolert repertoar av triks. Manuset gir et filosofisk perspektiv, ikke detaljerte kampsekvenser eller grunnlag for å sammenligne de tre spillernes psykologiske egenskaper.",
        "source": "Fotballdokumentet v1.pdf – Del IV – Estetikk og resultater / Del V – System vs. individ"
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
    ],
    "sourceDetails": [
      {
        "id": "winger_defence",
        "title": "Ving – pressretning og ansvar for motstanderens back",
        "text": "Følg motstanderbackens løp, legg press på backen og velg pressretning etter lagets plan. Ved ballnært sideangrep kan manusets spillmodell la vingen bli noe høyere mens midtbanespilleren sikrer egen back og stopperne beholder sentral dekning. Motsatt ving faller inn. Dette er en situasjonsavhengig kontringsberedskap, ikke en generell tillatelse til å unnlate defensivt arbeid. Ved gjenvinning beskrives møtende spiss og ving som buer løpet ut.",
        "source": "Fotballdokumentet v1.pdf – Posisjonelle oppgaver/valg i forsvar – Ving / Spillmodell – Back blir utfordret"
      },
      {
        "id": "winger_attack",
        "title": "Ving – bredde, bakrom og avslutning på motsatt side",
        "text": "Hold høy bredde på ballside i manusets etablerte angrep; den konkrete instruksen er å ikke møte når egen back har ball i denne varianten. I 4-3-3 beskrives samtidig en annen avtalt bevegelse der vingen møter og backen går forbi. Begge er mulige mønstre, og må avtales. Rettvendt utfordres én-mot-én med fart når rom og sikring tillater det. På overgang kan vingen skjære inn motsatt; ved innlegg fra andre siden angripes bakre stolpe eller målrommet. Vingen skal true bakrom, kunne bytte side ved behov og være tålmodig når ballen er på motsatt side. Profilen vektlegger fart, dribling, avslutning og kombinasjoner med spiss, back og midtbane.",
        "source": "Fotballdokumentet v1.pdf – 3.3 Posisjonelle oppgaver og valg i angrep – Ving / 5.5 4-3-3"
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
    ],
    "sourceDetails": [
      {
        "id": "meeting_forward",
        "title": "Møtende spiss – oppspill og bevegelse etter avlegg",
        "text": "Når en spiss møter ballfører, kan sidevendt mottak gi mulighet for direkte spill mot ving eller fremover. Ved feilvendt mottak beskriver manuset fire konkrete utveier: legge igjen eller vinkle til siden og starte ny bevegelse, vende opp og utfordre, fungere som vegg eller stusse videre til en gjennomløpende medspiller. Ved klarering beskrives møte mot ballside fra lengste stopper mot nærmeste. Støtte til midtbane kan åpne ny pasning i rom; dersom stopperen følger spissen ut, kan spissen selv angripe rommet etter avlegget. Dette er oppgaven til møtende spiss i manusets spillmodell, ikke en definisjon av alle falske niere.",
        "source": "Fotballdokumentet v1.pdf – Oppspill / Spillmodell – Klarering / Spill opp – på! / Åpen kropp"
      },
      {
        "id": "portrait_hidegkuti",
        "title": "Nándor Hidegkuti – den møtende spissens beslutningsproblem",
        "text": "Originalmanuset presenterer Hidegkuti som en spiss som trekker seg ned og endrer forsvarernes oppgave. FIFA dokumenterer hans rolle i Ungarns 6–3-seier mot England i 1953. Faglig er poenget ikke bare at han møter, men hvordan stopperens reaksjon påvirker rommet rundt og bak ham. I bokas eksisterende modell kan en stopper holde linjen eller følge; den møtende spilleren og en medspiller må lese valget sammen. Betegnelsen falsk nier brukes som moderne analysebegrep, ikke som et bevis på at han oppfant rollen.",
        "source": "Fotballdokumentet v1.pdf – Del I – Ungarn på 50-tallet; FIFA, https://www.fifa.com/en/news/articles/hungary-magical-magyars-puskas-hidegkuti-england-wembley-1953-six-three"
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
    ],
    "sourceDetails": [
      {
        "id": "striker_defence",
        "title": "Midtspiss – lede press og gjøre laget kontringsklart",
        "text": "Midtspissen leder i manusets pressplan mot den svakeste stopperen hos motstanderen. Han må lese når presset kan styre mot en bestemt mottaker, og samarbeide med de øvrige fremre spillerne. Etter gjenvinning skal han være spillbar tidlig og ta ansvar for klareringer som går over midtbanen. Manusets eksempel på kontringsberedskap plasserer spiss og ving rundt ti meter inn på motstanders halvdel. Dette er en avtalt utgangsposisjon, ikke et universelt krav uavhengig av forsvarshøyde og kampbilde.",
        "source": "Fotballdokumentet v1.pdf – 3.3 Posisjonelle oppgaver og valg i angrep – Midtspiss"
      },
      {
        "id": "striker_attack",
        "title": "Midtspiss – sentral strekk, første stolpe og rom for andre",
        "text": "Strekk sentralt når ballen går på kant, angrip første stolpe ved innlegg og skap rom for indreløpernes dype løp. Identifiser om motstanderen har sikring: dersom den mangler, kan spissen vende opp og utfordre direkte. Manusets 4-3-3-profil vektlegger evnen til å spille feilvendt, luftstyrke, fysisk kapasitet og mobilitet. En av de tre fremste kan gjøre møtebevegelse, mens andre opprettholder strekk og bakromstrussel. Oppgavene må samordnes med kant, hengende spiss og indreløper, slik at alle ikke søker samme rom.",
        "source": "Fotballdokumentet v1.pdf – 3.3 Posisjonelle oppgaver og valg i angrep – Midtspiss / 5.5 4-3-3"
      },
      {
        "id": "portrait_puskas",
        "title": "Ferenc Puskás – avslutning i en kollektiv angrepsstruktur",
        "text": "Manuset fremhever Puskás' venstrefot og avslutningsferdighet i det magiske ungarske laget. FIFA bekrefter hans sentrale plass i laget som møtte England i 1953. Bruk caset til å undersøke sammenhengen mellom avslutningsrom, medspillernes løp og teknisk utførelse, heller enn å tilskrive resultatet skuddkraft alene. Manusets formulering om skudd på 25 meter er en karakteristikk, ikke målt treffsikkerhet. Det tillagte Bernabéu-sitatet er ikke kontrollert og gjengis ikke som autentisk.",
        "source": "Fotballdokumentet v1.pdf – Del I – Puskás og Hidegkuti, linje 139–150; FIFA, https://www.fifa.com/en/news/articles/hungary-magical-magyars-puskas-hidegkuti-england-wembley-1953-six-three"
      }
    ]
  }
];
