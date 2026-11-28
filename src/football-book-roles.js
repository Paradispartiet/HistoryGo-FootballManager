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
      },
      {
        "id": "portrait_maldini",
        "title": "Paolo Maldini – levetid, posisjonering og tilpasning",
        "text": "AC Milan dokumenterer Maldinis lange spillerkarriere fra debuten i januar 1985, mens UEFA allerede i 2005 fremhevet hans vedvarende prestasjoner på høyt nivå. Originalmanuset nevner ham ved robusthet og levetid. En lang karriere kan brukes til å studere hvordan spillere løser defensive problemer gjennom plassering, timing og samhandling, og hvordan arbeidsoppgavene kan endres over tid. Den dokumenterer ikke at én bestemt treningsmetode eller posisjoneringsstil hindrer skade. I managerens analyse bør kampbelastning, tilgjengelighet og rollekrav vurderes individuelt fremfor å utlede robusthet fra alder eller karrierelengde alene.",
        "source": "Faglig tillegg – AC Milan, https://www.acmilan.com/en/club/legends/player/paolo-maldini ; UEFA, https://www.uefa.com/uefachampionsleague/news/01a9-0e6cc45febef-9f10f83f46b9-1000--dutch-style-wins-maldini-over/; personnavn og tematikk fra Fotballdokumentet v1.pdf"
      },
      {
        "id": "portrait_beckenbauer",
        "title": "Franz Beckenbauer – liberoens offensive ansvar",
        "text": "FIFA beskriver Beckenbauer som en sentral skikkelse i utviklingen av liberorollen, med teknikk og bevegelse som gjorde det mulig å gå fra forsvar til angrep. Han var kaptein da Vest-Tyskland vant VM i 1974. Caset viser at sikringsspilleren også kan bidra i oppbyggingen. Undersøk når en fremføring skaper overtall på midtbanen, og hvem som beskytter rommet bak. En offensiv libero forutsetter kollektiv omorganisering; rollen er ikke det samme som enhver moderne ballspillende stopper.",
        "source": "Faglig tillegg – FIFA, https://inside.fifa.com/organisation/news/a-tribute-to-franz-beckenbauer-1945-2024 ; https://inside.fifa.com/en/news/der-kaiser-turns-75; personnavn fra Fotballdokumentet v1.pdf"
      },
      {
        "id": "onenote_desailly_rijkaard_mascherano",
        "title": "Desailly, Rijkaard og Mascherano – mellom bakre ledd og midtbane",
        "text": "OneNote grupperer Desailly og Rijkaard med beskytterne, og har en separat overskrift for Javier Mascherano. Desailly beskrives gjennom fysisk styrke og posisjonsspill; Rijkaards overskrift fremhever brobygging. AC Milan dokumenterer at Sacchi hentet Rijkaard for å styrke midtbanen, mens FIFA dokumenterer Mascheranos roller som midtbanespiller og stopper. Dette gir et faglig spørsmål om overføring av romforståelse mellom ledd: når er det riktig å støte frem, når må spilleren holde linjen, og hvem overtar sikringen? Mascherano-avsnittet er fragmentarisk, så det eksterne holdepunktet er eksplisitt merket her. Ingen historiske kampavtaler rekonstrueres.",
        "source": "OneNote – Fotballteori (Den 12.06.2026).one, råuttrekk 0x00297774–0x00297fac, 0x0028a3fc, 0x007e8a7c; AC Milan, https://www.acmilan.com/en/club/legends/players/rijkaard ; FIFA, https://www.fifa.com/en/tournaments/mens/worldcup/articles/argentina-players-record-appearances-games"
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
      },
      {
        "id": "portrait_lahm",
        "title": "Philipp Lahm – rollefortrolighet på back og midtbane",
        "text": "Bayern Münchens historiske portrett dokumenterer Lahms bruk som høyreback, venstreback og tidvis midtbanespiller. Det gir et eksempel på forskjellen mellom posisjonsnavn og arbeidsoppgaver. På back må spilleren ofte forholde seg til sidelinjen, kantspilleren og rom bak seg; sentralt må han registrere press fra flere retninger og tilby støttevinkler. Observer hvilke ferdigheter som kan overføres, som orientering og kroppsstilling, og hvilke relasjoner som må læres på nytt. Allsidighet betyr ikke at enhver spiller automatisk behersker alle roller. Denne fagteksten endrer ikke motorens eksisterende rollefortrolighet.",
        "source": "Faglig tillegg – FC Bayern, https://fcbayern.com/en/club/hall-of-fame/philipp-lahm; personnavn og tematikk fra Fotballdokumentet v1.pdf"
      },
      {
        "id": "onenote_zambrotta_luis_enrique",
        "title": "Zambrotta og Luis Enrique – allsidighet og endrede rollekrav",
        "text": "Manusets allroundergruppe omfatter Zambrotta, Essien og Luis Enrique. En senere råblokk beskriver dem sammen med Hassan Salihamidžić som anvendelige på back, midtbane eller kant. Barcelonas klubbportretter gir eksterne holdepunkter om Zambrottas fysiske kapasitet og Luis Enriques lederskap. Det faglige poenget er at en ny rolle medfører nye relasjoner: en back må samhandle med stopper og kant, mens en spiller sentralt må orientere seg mot press fra flere retninger. Den korte råteksten angir ikke en komplett liste over hver spillers historiske posisjoner. Ingen posisjonsfortrolighet endres i spillet.",
        "source": "OneNote – Fotballteori (Den 12.06.2026).one, råuttrekk 0x0028da6c, 0x0028e144, 0x007f263c; FC Barcelona, https://www.fcbarcelona.com/en/football/barca-legends/players/1082626/zambrotta ; https://www.fcbarcelona.com/en/news/648051/luis-enrique-martinez/amp"
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
      },
      {
        "id": "portrait_makelele",
        "title": "Claude Makélélé – posisjonell sikring og arbeidsøkonomi",
        "text": "Chelsea beskriver Makélélé-rollen som en midtbanespiller som beskytter bakre ledd og ofte lar andre ta mer offensive posisjoner. Faglig er forskjellen mellom å løpe for å reparere et åpent rom og å plassere seg slik at rommet allerede er beskyttet, viktig. En sekser kan flytte seg sideveis, stenge pasningslinjen mot spissen og være tilgjengelig for en enkel pasning etter gjenvinning. Observer når han holder posisjonen i stedet for å følge ballen. Det er ikke grunnlag for å fastsette individuelle utholdenhetsverdier eller anta at Makélélé alltid handlet på samme måte. Caset utfyller originalens refleksjon om mindre synlige bidrag.",
        "source": "Faglig tillegg – Chelsea FC, https://www.chelseafc.com/en/news/article/how-claude-makelele-changed-english-football; personnavn og tematikk fra Fotballdokumentet v1.pdf"
      },
      {
        "id": "onenote_directors",
        "title": "Regissørene – Pirlo, Xavi og Modrić",
        "text": "OneNote-manuset samler Andrea Pirlo, Xavi Hernández og Luka Modrić under Regissørene. Der beskrives fotball som styring av rytme, rom og tid, ikke bare tempo og kraft. Pirlo fremheves for langpasninger og ro, Xavi for rytme, og Modrić for kombinasjonen av rytme, teknikk og arbeidskapasitet. De tre skal ikke reduseres til samme posisjon: å organisere fra dypet og å skape forbindelser høyere i banen kan kreve forskjellige utgangsposisjoner. UEFA behandler Pirlo og Xavi som pasningsspesialister og viser også Modrić som eksempel på spillstyring. Manusets rangering og absolutte karakteristikker er ikke objektive målinger. Se regissøren i sammenheng med lagets støttepunkter og bevegelser uten ball.",
        "source": "OneNote – Fotballteori (Den 12.06.2026).one, råuttrekk 0x00292e2c–0x00294fec, 0x007e71f4–0x007e7d5c; UEFA, https://www.uefa.com/news/025f-0fd804989c24-45d85162032d-1000--great-playmaker-displays/"
      },
      {
        "id": "onenote_pirlo_architect",
        "title": "Pirlo – arkitekten og den lange pasningens funksjon",
        "text": "Manuset omtaler Pirlo som arkitekten og beskriver hvordan langpasninger kan skjære gjennom et forsvar. UEFA dokumenterer hans rolle som dyptliggende playmaker, ro under press og presisjon ved dødballer. Den faglige utfordringen er å registrere neste rom før ballmottak: kan en lang pasning frigjøre en spiller på motsatt side, eller må laget først bruke en støttepasning for å få riktig vinkel? Ved kampanalyse kan man sammenligne pasningen som bryter et pressledd, pasningen som flytter presset, og pasningen som gir laget tid. Dette er en redaksjonell observasjonsoppgave; manusets formulering om at han aldri trengte fysisk kapasitet gjengis ikke bokstavelig.",
        "source": "OneNote – Fotballteori (Den 12.06.2026).one, råuttrekk 0x00292fa4–0x002937b4, 0x007e747c; UEFA, https://www.uefa.com/uefachampionsleague/news/024b-0e9939ae84c1-34d29b70c069-1000--champions-league-100-club-andrea-pirlo/"
      },
      {
        "id": "onenote_workers_protectors",
        "title": "Arbeidsmaurene og beskytterne – skjult kollektiv verdi",
        "text": "OneNote-manuset bruker Arbeidsmaurene og beskytterne som en egen kategori for spillere som rydder, dekker rom og gir de skapende spillerne tid. Makélélé, Deschamps, Gattuso, Keane, Vieira, Desailly, Redondo, Rijkaard og Edwards er navngitt; en utvidet versjon inkluderer Van Bommel og Cambiasso. Kategorien handler om funksjon, ikke om at alle spillerne har samme stil. Den kan forstås gjennom tre observasjonsspørsmål: hvilket rom beskytter spilleren, hvilken pasning blir mulig etter ballvinning, og hvilke medspillere får frihet når han holder posisjonen? Dette er en ny faglig anvendelse av manusets kategori. Ingen rollebonus eller rangering innføres.",
        "source": "OneNote – Fotballteori (Den 12.06.2026).one, råuttrekk 0x0029537a–0x00299df4, 0x007e82cc–0x007e8c6c, 0x002c00da–0x002c0184"
      },
      {
        "id": "onenote_gattuso_pirlo",
        "title": "Gattuso og Pirlo – komplementære midtbaneoppgaver",
        "text": "Manuset omtaler Gattuso som beskytter, mens Pirlo hører til regissørene. UEFA beskriver Gattuso som en defensiv midtbanespiller og setter hans egenskaper i kontrast til Pirlos pasningsvisjon. Milan er derfor et nyttig utgangspunkt for å undersøke komplementære roller: hvem støter mot ballfører, hvem beskytter neste pasning, og hvem er tilgjengelig når laget vinner ballen? De to funksjonene kan støtte hverandre uten at én spiller reduseres til bare løpskraft eller den andre til bare teknikk. Den konkrete rollefordelingen må undersøkes mot kampmateriale. Manusets aggressive karakteristikker brukes ikke som anbefalinger om ulovlig spill.",
        "source": "OneNote – Fotballteori (Den 12.06.2026).one, råuttrekk 0x002969e4, 0x007e86cc, 0x00292fa4–0x002937b4; UEFA, https://www.uefa.com/uefaeuropaleague/news/023f-0e980c697c63-7e3fcc259953-1000--why-milan-chose-gattuso-as-their-new-coach/"
      },
      {
        "id": "onenote_van_bommel_jeremies",
        "title": "Van Bommel og Jeremies – rytmebrudd innenfor reglene",
        "text": "Originalen har egne overskrifter om Mark van Bommel og Jens Jeremies. Van Bommel beskrives som en spiller som bryter motstanderens rytme; Jeremies-teksten er i dette uttrekket bare en overskrift. Den faglige ideen kan beholdes uten å oppfordre til provokasjon eller ulovlige taklinger. Et lag kan bryte rytmen ved å stenge en pasningslinje, forsinke ballføreren, vinne ballen lovlig eller endre tempoet etter gjenvinning. Observer om en defensiv handling gir laget tid til å reorganisere seg, eller om den åpner nye rom. Van Bommels og Jeremies' individuelle kampmønstre er ikke dokumentert i den gjenfunne råteksten.",
        "source": "OneNote – Fotballteori (Den 12.06.2026).one, råuttrekk 0x002892f4–0x00289b9c, 0x00298924–0x00298c7c"
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
      },
      {
        "id": "portrait_leonhardsen",
        "title": "Øyvind Leonhardsen – indreløperens løp og timing",
        "text": "Store norske leksikon beskriver Leonhardsen som en løpssterk, anvendelig og målfarlig midtbanespiller, og dokumenterer rollen som venstre indreløper da Norge slo Brasil i 1998. Caset knytter fysisk kapasitet til taktisk timing: indreløperen må både kunne tilby støtte og true rom foran ballen, uten at midtbanens sikring nødvendigvis forsvinner. Studer når løpet starter i forhold til ballførerens handlingsrom, og hvem som overtar rommet spilleren forlater. Dette er bokas analytiske anvendelse, ikke en påstand om en bestemt historisk løpsrute.",
        "source": "Faglig tillegg – Store norske leksikon, https://snl.no/%C3%98yvind_Leonhardsen; personnavn fra Fotballdokumentet v1.pdf"
      },
      {
        "id": "portrait_kante",
        "title": "N'Golo Kanté – arbeidskapasitet, gjenvinning og ballbruk",
        "text": "UEFAs tekniske analyse av Chelsea mot Lille i 2022 trekker frem Kantés gjenvinninger, teknikk og ballbruk i samme kamp. Caset viser hvorfor høy arbeidskapasitet ikke bør vurderes uavhengig av oppgaven. En midtbanespiller må lese når han kan støte, om han har sikring, og hva første pasning skal gjøre etter ballvinning. Løpsmengde uten kontroll over rom er ikke nødvendigvis produktiv. Observer både gjenvinningen og den påfølgende handlingen: om spilleren kan vende opp, spille en støttepasning eller starte et gjennombrudd. Én kampanalyse gir ikke et fullstendig mål på spillerens utholdenhet.",
        "source": "Faglig tillegg – UEFA, https://www.uefa.com/uefachampionsleague/news/0272-1487ed26f300-a4989534e012-1000--in-the-zone-chelsea-2-0-losc/; personnavn og tematikk fra Fotballdokumentet v1.pdf"
      },
      {
        "id": "portrait_matthaus",
        "title": "Lothar Matthäus – allrounderen fra midtbane til libero",
        "text": "FIFA dokumenterer Matthäus' karriere som sentral midtbanespiller og libero. Hans rolle i Vest-Tysklands VM-seier i 1990 og mål med begge føtter fra utenfor boksen mot Jugoslavia gir konkrete historiske holdepunkter. En allrounder kan løse flere oppgaver, men rollen bestemmer hvilke ferdigheter som prioriteres i situasjonen. Som midtbanespiller kan han støtte og true fremover, mens en libero må ivareta sikring og oppbygging fra en annen startposisjon. Sammenlign informasjonsbehov og bevegelsesrom i de to rollene. Overgangen mellom roller dokumenterer anvendelighet, ikke at alle fysiske egenskaper var uforandret gjennom karrieren.",
        "source": "Faglig tillegg – FIFA, https://www.fifa.com/en/articles/bayern-munich-club-profile-history-players-qualified ; https://www.fifa.com/en/tournaments/mens/worldcup/articles/west-germany-champions-stats; personnavn og tematikk fra Fotballdokumentet v1.pdf"
      },
      {
        "id": "portrait_modric",
        "title": "Luka Modrić – rytmekontroll og langvarig prestasjon",
        "text": "UEFAs analyse av Kroatia–Italia i EM 2024 fremhever Modrićs pasning til mottakerens bakre fot, slik at neste handling kan gå fremover. UEFA omtaler også hans betydning for Kroatia som 37-åring i VM 2022. Caset knytter teknisk presisjon til spilleforståelse: en god pasning er ikke bare en pasning som når frem, men en som gir medspilleren en gunstig kroppsstilling og tid. Vurder hvordan tempo og støtte endres når spilleren møter press. Lang karriere er et historisk holdepunkt, ikke grunnlag for å fastsette biologisk alder, treningsdose eller skadeprognose.",
        "source": "Faglig tillegg – UEFA, https://www.uefa.com/uefaeuro/history/news/028e-1b37474f637b-9784d3f1e6e4-1000--croatia-1-1-italy-analysis-the-magic-of-modric/ ; https://www.uefa.com/news/027b-169a7169dd60-6148d39469f8-1000--croatia-at-the-2022-world-cup/; personnavn og tematikk fra Fotballdokumentet v1.pdf"
      },
      {
        "id": "portrait_yaya_toure",
        "title": "Yaya Touré – midtbanespilleren som også truer mål",
        "text": "Manchester City dokumenterer Tourés 20 ligamål i mesterskapssesongen 2013/14. Det gir et eksempel på at en sentral midtbanespiller også kan ha betydelig offensiv produksjon. Undersøk når spilleren kan føre ballen inn i et nytt rom, støtte angrepet eller bevege seg mot avslutningssonen. Samtidig må andre spillere ivareta balanse dersom han forlater sin utgangsposisjon. Målstatistikken sier ikke alene hvilke løp eller pasningsmønstre som skapte scoringsmulighetene. Caset brukes derfor som observasjonsoppgave, ikke som grunnlag for en fast motorbonus.",
        "source": "Faglig tillegg – Manchester City, https://www.mancity.com/news/first-team/first-team-news/2017/september/man-city-yaya-toure-longform-300-appearances; personnavn fra Fotballdokumentet v1.pdf"
      },
      {
        "id": "portrait_nakata_park",
        "title": "Hidetoshi Nakata og Park Ji-sung – forskjellige midtbaneoppgaver",
        "text": "AS Roma dokumenterer Nakatas scoring fra utenfor boksen i opphentingen mot Juventus i 2001. Manchester United fremhever Parks betydning for laget og hans uselviske bidrag. Eksemplene gir anledning til å skille mellom den synlige offensive handlingen og arbeidet som gjør medspillernes handlinger mulige. Observer skuddrom, støtte, dekning og bevegelse uten ball. Spillernes japanske og sørkoreanske bakgrunn brukes ikke som forklaring på deres taktiske egenskaper. Dette er to individuelle case, ikke en påstand om en felles asiatisk spillestil.",
        "source": "Faglig tillegg – AS Roma, https://www.asroma.com/en/news/44052/on-this-day-in-2001-watch-the-goals-in-the-famous-comeback-against-juve ; Manchester United, https://www.manutd.com/en/news/manchester-united-around-the-world-xi; personnavn fra Fotballdokumentet v1.pdf"
      },
      {
        "id": "onenote_xavi_modric",
        "title": "Xavi og Modrić – rytme, mottak og neste handling",
        "text": "Xavi har egen overskrift i det bevarte råuttrekket, men ikke et sammenhengende portrett. Den utdypende Modrić-teksten sammenligner ham med Xavis rytme og Pirlos pasningsfot. UEFA har publisert Xavis egen gjennomgang av kontroll og pasning, der han skiller mellom medspillere som ønsker ballen til fot og spillere som løper i dybden. Dette gir et konkret faglig holdepunkt for å studere rytmekontroll: pasningens retning og fart må passe mottakerens neste oppgave. De eksisterende portrettene om orientering og Modrićs pasningspresisjon beholdes. Utdypingen av Xavi er et kildebelagt tillegg til den fragmentariske OneNote-teksten.",
        "source": "OneNote – Fotballteori (Den 12.06.2026).one, råuttrekk 0x00293ae4, 0x0029446c–0x00294fec, 0x007e79c4; UEFA, https://www.uefa.com/news-media/news/01d6-0f85ae208ec7-b014ffa38f92-1000--xavi-reveals-passing-perfection/"
      },
      {
        "id": "onenote_cambiasso_vieira_redondo",
        "title": "Cambiasso, Vieira og Redondo – arbeid med og uten ball",
        "text": "Manuset beskriver Cambiasso som en undervurdert arkitekt og stille allrounder, og navngir Vieira og Redondo i gruppen som gir kunstnerne tid og rom. Inters egen omtale av Cambiasso dokumenterer hans bidrag i midtbanen og ved Champions League-triumfen i 2010. Dette kan brukes til å undersøke hvordan en midtbanespiller går fra å beskytte rom til å tilby en spillbar forbindelse i angrep. Vieira og Redondo har bare overskrifter og en kollektiv karakteristikk i den gjenfunne teksten; deres individuelle portretter må eventuelt utdypes med ytterligere kilder. Kategorien skal ikke forstås som en påstand om at alle tre løser identiske oppgaver.",
        "source": "OneNote – Fotballteori (Den 12.06.2026).one, råuttrekk 0x002973cc, 0x00297bcc, 0x002990cc–0x00299614, 0x007e8a7c; Inter, https://www.inter.it/en/news/esteban-cambiasso-birthday-2025"
      },
      {
        "id": "onenote_essien_bridge",
        "title": "Michael Essien – broen mellom arbeidsmaur og allrounder",
        "text": "OneNote beskriver Essien som forbindelsen mellom arbeidsmauren og allrounderen. I et intervju med Chelsea forteller Essien om bakgrunn som forsvarsspiller, midtbaneoppgaver og perioder der han som høyreback beveget seg inn på midtbanen. Det gir konkret grunnlag for å undersøke hvordan allsidighet fungerer i et lag: når en back flytter inn, hvem holder bredden og hvem beskytter bakrommet? En allrounder må ikke bare ha mange ferdigheter; han må kunne anvende dem i forskjellige relasjoner. Det er et skille mellom å kunne bekle flere posisjoner og å forlate en posisjon uten at laget kompenserer.",
        "source": "OneNote – Fotballteori (Den 12.06.2026).one, råuttrekk 0x0028d2cc–0x0028d76c, 0x007f263c; Chelsea, https://www.chelseafc.com/en/news/article/from-the-archive-the-smile-on-michael-essiens-face"
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
      },
      {
        "id": "portrait_tom_lund",
        "title": "Tom Lund – teknikk, oversikt og kreativitet",
        "text": "Lillestrøm beskriver Tom Lund som en spiller med fremragende teknikk, oversikt og spilleglede. Han vant både serie- og cupmesterskap med klubben. Faglig brukes han her til å undersøke hvordan en skapende spiller kan kombinere egen ballbehandling med vurdering av medspillernes muligheter. Ved analyse av historisk kampfilm: registrer hvilke alternativer som er tilgjengelige før mottak, hvordan førsteberøringen endrer situasjonen, og om neste handling gir laget gjennombrudd. Dette er et nytt observasjonsopplegg, ikke dokumenterte kampmønstre for Lund.",
        "source": "Faglig tillegg – Lillestrøm SK, https://www.lsk.no/nyheter/tusen-takk-for-alt-tommy ; Store norske leksikon, https://snl.no/Tom_Lund; personnavn fra Fotballdokumentet v1.pdf"
      },
      {
        "id": "portrait_de_bruyne",
        "title": "Kevin De Bruyne – halvrom, ballbane og gjennombrudd",
        "text": "Originalmanuset beskriver Guardiolas brede sidespisser som et middel til å åpne rom for De Bruyne og Silva som to tiere. Premier Leagues taktiske analyser av Manchester City viser hvordan De Bruyne finner rom utenfor sentrum, og kan levere gjennombruddspasninger og innlegg fra disse posisjonene. Faglig ligger utfordringen i forholdet mellom pasningsvinkel, ballbane og mottakerens fart: en tidlig pasning bak linjen har en annen funksjon enn et hardt innlegg gjennom målområdet. Observasjonsoppgave: når en kant binder backen bredt og De Bruyne får ball i halvrommet, vurder om stopperen må støte, om spissen kan angripe mellomrommet, og om det finnes sikring ved balltap. Dette er en analyseramme, ikke en fast rute for Guardiola-lag.",
        "source": "Faglig tillegg – PDF linje 3899–3903; Premier League, https://www.premierleague.com/en/news/2915555 ; https://www.premierleague.com/en/news/4019681; personnavn og eventuelle mønstre fra Fotballdokumentet v1.pdf"
      },
      {
        "id": "portrait_messi",
        "title": "Lionel Messi – kreativitet, ballnær støtte og brudd med strukturen",
        "text": "Manuset plasserer Messi sammen med Maradona og Zidane i drøftingen av geniet innenfor en struktur. FIFA Training Centres analyser av Argentina i VM 2022 viser hvordan Messi og midtbanespillerne kunne søke mot ballen, samtidig som andre opprettholdt bredde og dybde; hans assist mot Nederland og Kroatia er eksempler på dribling og pasningsvalg. Faglig er det avgjørende å skille mellom lokal overtallsskaping og rommet som frigjøres lenger unna. En kreativ spiller kan møte, binde en forsvarer eller føre ballen fremover, men trenger samtidige tilbud for neste handling. Observer hvem som holder bredden, hvem som truer bakrom, og hvem som sikrer når en dribling mislykkes. Dette er ikke et krav om å kopiere Messis individuelle bevegelsesmønster.",
        "source": "Faglig tillegg – PDF Del V, linje 4624–4645; FIFA Training Centre, https://www.fifatrainingcentre.com/en/game/game-analysis/world-class-tactics/argentina--ball-proximity-in-possession.php ; https://www.fifatrainingcentre.com/en/fwc2022/physical-analysis/using-case-studies-to-reveal-the-reasons-why-various-tactical-roles-exert-themselves-physically-during-world-cup-matches.php; personnavn og eventuelle mønstre fra Fotballdokumentet v1.pdf"
      },
      {
        "id": "portrait_zico_baggio_zola",
        "title": "Zico, Roberto Baggio og Gianfranco Zola – den skapende angriperen",
        "text": "I et FIFA-intervju beskriver Zico hvordan han ba en medspiller være klar til å angripe rom bak Liverpools linje. FIFA dokumenterer Baggios fem mål på vei til VM-finalen i 1994, mens Chelsea dokumenterer Zolas bidrag med både mål og målgivende pasninger. Casene brukes til å undersøke forbindelsen mellom kreativitet og lagets gjennombrudd: kan spilleren registrere et rom før det åpner seg, finne en medspiller eller selv avslutte? Dette er ulike karrierer, ikke tre identiske rolleprofiler. Vurder både handlingen med ball og medspillernes mulighet til å utnytte den.",
        "source": "Faglig tillegg – FIFA, https://www.fifa.com/en/tournaments/mens/club-world-cup/usa-2025/articles/zico-flamengo-determination-love-passion ; https://www.fifa.com/en/archive/roberto-baggio ; Chelsea, https://www.chelseafc.com/en/news/article/chelseas-team-of-120-forward-gianfranco-zola; personnavn fra Fotballdokumentet v1.pdf"
      },
      {
        "id": "onenote_savicevic_kaka",
        "title": "Savićević og Kaká – høydepunkter og kreative arbeidsoppgaver",
        "text": "OneNote beskriver Savićevićs lob mot Barcelona i 1994 og Kakás toppår i 2007. UEFA bekrefter førstnevntes mål i europacupfinalen og Kakás Ballon d’Or, samt hans mål og målgivende pasninger i klubb-VM-finalen. Eksemplene gir ulike kreative problemer: oppdage en uventet avslutningsmulighet eller kombinere egne gjennombrudd med pasninger til en angriper. En høydepunktsekvens er ikke bevis for manglende stabilitet i resten av karrieren. Manusets personlige karakteristikker og bastante forklaringer på senere formsvikt beholdes derfor ikke som dokumenterte fakta.",
        "source": "OneNote – Fotballteori (Den 12.06.2026).one, råuttrekk 0x001a425c–0x001a45cc, 0x001abaec–0x001abefc; UEFA, https://www.uefa.com/uefachampionsleague/news/021f-0e8f9a357f7e-80893333dd43-1000--legendary-moments-savicevic-on-1994-lob/ ; https://www.uefa.com/news/0250-0c50f2621e37-47ba14abda3a-1000--kaka-inspires-milan-to-world-title/"
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
      },
      {
        "id": "portrait_mathews_garrincha",
        "title": "Stanley Matthews og Garrincha – dribling som taktisk virkemiddel",
        "text": "UEFA fremhever Matthews' dribleferdigheter som kantspiller, mens FIFA har kampklipp av Garrincha i VM 1962. Bruk disse historiske casene til å undersøke når dribling skaper overtall eller åpner en pasningsvinkel. Se etter forsvarerens tyngdeoverføring, tempoendring, avstanden til støtte og muligheten for innlegg eller videre gjennombrudd. Dette er en analyseoppgave, ikke et utsagn om at begge spillerne utførte identiske finter. Den videre kollektive handlingen avgjør hvor nyttig en vellykket dribling blir.",
        "source": "Faglig tillegg – UEFA, https://www.uefa.com/news-media/news/021e-0f8a84ac44d9-bf9f306f255c-1000--the-wizard-of-dribble-sir-stanley-matthews/ ; FIFA, https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/garrincha-goal-brazil-chile-1962; personnavn fra Fotballdokumentet v1.pdf"
      },
      {
        "id": "portrait_okocha",
        "title": "Jay-Jay Okocha – finter, dribling og neste pasning",
        "text": "Okocha står som teknisk spesialist i originaldisposisjonen. FIFA dokumenterer hans dribleprestasjon mot Italia i VM 1994 og har publisert kampklipp der dribling følges av en vektet pasning. Bruk caset til å skille mellom finte som endrer forsvarerens forventning, retningsforandring som skaper separasjon, og neste handling som faktisk utnytter fordelen. I en læringsøvelse kan en kant få valg mellom å passere en forsvarer, spille en støttepasning eller lokke press før en gjennombruddspasning. Evaluer situasjonen som oppstår etter finten, ikke antall finter i seg selv. Det finnes ingen måling av Okochas tekniske egenskaper i originalmanuset.",
        "source": "Faglig tillegg – PDF Del II og linje 735–737; FIFA, https://www.fifa.com/en/news/articles/jay-jay-okocha-usa-1994-nigeria-italy ; https://collect.fifa.com/collectible/2843034856; personnavn og eventuelle mønstre fra Fotballdokumentet v1.pdf"
      },
      {
        "id": "portrait_neymar",
        "title": "Neymar – improvisasjon og kombinasjoner i trangt rom",
        "text": "Manuset nevner Neymar ved improvisasjon og kulturelle læringsmiljøer, men dokumenterer ikke hele treningsbakgrunnen hans. FIFA viser målet mot Kroatia i VM 2022 som et eksempel på et kollektivt angrep avsluttet av Neymar etter kombinasjoner og en passering av keeperen. Faglig illustrerer dette at en dyktig dribler også må kunne spille fra seg ballen og fortsette bevegelsen. Observer hvordan korte støttepasninger endrer forsvarernes posisjoner, når en spiller kan akselerere videre, og om ballføreren bør velge pasning, finte eller egen avslutning. Det redaksjonelle eksemplet er ikke bevis for at en bestemt oppvekstform alene skaper kreativitet.",
        "source": "Faglig tillegg – PDF linje 4050–4058 og 4155–4160; FIFA, https://www.fifa.com/en/tournaments/mens/worldcup/canadamexicousa2026/articles/neymar-goal-brazil-2022-croatia?searchOverlay=1 ; https://collect.fifa.com/collectible/1093913151; personnavn og eventuelle mønstre fra Fotballdokumentet v1.pdf"
      },
      {
        "id": "portrait_mbappe",
        "title": "Kylian Mbappé – brems, akselerasjon og bueløp",
        "text": "FIFA Training Centre analyserer hvordan Mbappé reduserer farten for å binde forsvareren før han øker den igjen, og hvordan han bruker buede løp og retningsendringer bak forsvarslinjen. Fotballhurtighet er dermed ikke bare en rettlinjet sprint. Når forsvareren nærmer seg, kan en kontrollert oppbremsing gjøre en ny akselerasjon vanskeligere å følge. Observer ballens avstand fra foten, forsvarerens tyngdeoverføring og rommet som åpnes. En treningsvariant er å møte en aktiv forsvarer og velge mellom å akselerere, endre retning og spille videre. Dette er et pedagogisk forslag, ikke en måling av spillerens kapasitet.",
        "source": "Faglig tillegg – FIFA Training Centre, https://www.fifatrainingcentre.com/en/game/individual-qualities/world-class-skills/mbappe-deceleration-to-acceleration2.php ; https://www.fifatrainingcentre.com/en/fwc2022/physical-analysis/using-case-studies-to-reveal-the-reasons-why-various-tactical-roles-exert-themselves-physically-during-world-cup-matches.php; personnavn og tematikk fra Fotballdokumentet v1.pdf"
      },
      {
        "id": "portrait_son",
        "title": "Son Heung-min – gjennombrudd og avslutning med begge føtter",
        "text": "Premier League dokumenterer Sons solomål mot Burnley i 2019 og beskriver ham i en separat analyse som en avslutter med forholdsvis jevn fordeling mellom føttene. Caset knytter ballføring i fart til evnen til å avslutte fra ulike vinkler. Se etter om forsvarerens plassering gir en fordel ved å gå inn eller ut, og om neste berøring gir et godt skuddrom. En angriper som behersker flere avslutningsvalg kan gjøre forsvarerens styring vanskeligere. Dette er en taktisk tolkning, ikke en ny måling av Sons ferdigheter.",
        "source": "Faglig tillegg – Premier League, https://www.premierleague.com/en/news/1750634 ; https://www.premierleague.com/en/news/4271919/opta-analyst-elanga; personnavn fra Fotballdokumentet v1.pdf"
      },
      {
        "id": "portrait_gamst_gronkjaer",
        "title": "Morten Gamst Pedersen og Jesper Grønkjær – bredde og innlegg",
        "text": "Store norske leksikon beskriver Gamst Pedersen som venstre kantspiller, mens Chelsea beskriver Grønkjær som en hurtig kantspiller og dokumenterer hans innlegg til Desaillys utligning mot Liverpool i 2003. Bruk eksemplene til å vurdere kantens ansvar for bredde og leveringsvinkel: når bør han holde sidelinjen, utfordre inn eller levere før forsvareren rekker å stenge? Medspillernes bevegelse i boksen avgjør hvilke innlegg som er aktuelle. Gamst Pedersens profil krever mer kampmateriale før konkrete historiske innleggssekvenser kan beskrives.",
        "source": "Faglig tillegg – SNL, https://snl.no/Morten_Gamst_Pedersen ; Chelsea, https://www.chelseafc.com/en/news/article/beating-liverpool-in-2003 ; https://www.chelseafc.com/en/news/article/legends-from-overseas-added-to-squad-for-liverpool; personnavn fra Fotballdokumentet v1.pdf"
      },
      {
        "id": "onenote_waddle_pop",
        "title": "Chris Waddle – kantspill og popkultur",
        "text": "I OneNote-delen Pop- og kultikonene brukes Chris Waddle som eksempel på forbindelsen mellom fotball, mote og musikk. Tottenham dokumenterer både hans tekniske kantspill og samarbeidet med Glenn Hoddle, som også resulterte i singelen Diamond Lights. Manusets taktiske fortolkning av Waddles venstrefot fra høyre side peker mot dilemmaet mellom å holde bredden og å trekke inn. Undersøk hvordan en slik bevegelse endrer pasningsvinkelen og backens oppgave. Klubben bekrefter ikke at Waddle oppfant dagens innoverkanter; dette beholdes som en historisk sammenligning, ikke en oppfinnerpåstand.",
        "source": "OneNote – Fotballteori (Den 12.06.2026).one, råuttrekk 0x00280d8c–0x00281454; Tottenham, https://www.tottenhamhotspur.com/news/1010025/five-stars-who-shone-for-tottenham-and-the-toon"
      },
      {
        "id": "onenote_beckham_deep_cross",
        "title": "David Beckham – tidlig innlegg og globalt fotballikon",
        "text": "Originalteksten fremhever Beckhams presise innlegg fra dyp høyreside som alternativ til å nå dødlinjen, og drøfter hvordan fotballspilleren også ble en internasjonal merkevare. Den taktiske ideen er å levere før forsvarslinjen har rukket å organisere seg mot et innlegg. Vurder ballførerens tid, spissens løp, forsvarerens orientering og muligheten for å sikre en klarering. Manusets avstand på 35 meter er et illustrerende eksempel, ikke en fast leveringsavstand. Påstandene om Real Madrids konkrete kjøpsmotiver er ikke dokumentert i råteksten og brukes ikke som fakta.",
        "source": "OneNote – Fotballteori (Den 12.06.2026).one, råuttrekk 0x002818ac–0x00281f44"
      },
      {
        "id": "onenote_best_icon",
        "title": "George Best – driblekunst og fotballens kjendisfortelling",
        "text": "OneNote fremstiller Best som fotballens rockestjerne. Det nordirske fotballforbundet dokumenterer at prestasjonen mot Benfica i 1966 ga ham et Beatles-inspirert tilnavn, og at han vant Ballon d’Or i 1968. Manchester Uniteds historiske kampomtale gir også et holdepunkt for hans bidrag i europacupfinalen samme år. Faglig skal kampanalysen skille driblingens effekt på motstanderens organisering fra den kulturelle fortellingen om spilleren. Manusets beskrivelser av privatliv og livsstil er ikke nødvendige for å forstå teknikken og gjengis ikke som forklaring på prestasjon.",
        "source": "OneNote – Fotballteori (Den 12.06.2026).one, råuttrekk 0x00282f94–0x002836ec; IFA, https://www.irishfa.com/news/2025/november/george-best-s-iconic-moments ; Manchester United, https://www.manutd.com/en/news/seven-and-a-half-notable-games-from-career-of-man-utd-legend-george-best"
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
      },
      {
        "id": "portrait_pele",
        "title": "Pelé – kreativitet og avslutning i et kollektiv",
        "text": "FIFA dokumenterer Pelés gjennombrudd som 17-åring i VM 1958. Originalmanuset navngir ham som epokeikon og eksempel ved blant annet spenst og heading. En analyse av historisk kampfilm kan undersøke hvordan han posisjonerer seg i forhold til medspillerne, hvordan mottak og ballbehandling forbereder neste handling, og når han beveger seg inn i avslutningsrom. Dette er en ny faglig analyseoppgave, ikke en måling av Pelés fysiske kapasitet. Caset knytter individuell kreativitet til bokas historiske drøfting av Brasils kollektive organisering.",
        "source": "Faglig tillegg – FIFA, https://www.fifa.com/pt/tournaments/mens/worldcup/articles/brasil-suecia-final-copa-1958 ; https://www.fifa.com/en/articles/a-tribute-to-pele-brazil-santos-new-york-cosmos-legend-fifa-world-cup; personnavn fra Fotballdokumentet v1.pdf"
      },
      {
        "id": "portrait_bergkamp",
        "title": "Dennis Bergkamp – førsteberøring og opp–tilbake–gjennom",
        "text": "Originalmanuset bruker Bergkamp i Wengers Arsenal som eksempel på opp–tilbake–gjennom: spissen møter, legger igjen til en medspiller og frigjør muligheten for Henrys gjennomløp. Den konkrete historiske sekvensen er ikke uavhengig dokumentert her. Premier Leagues portrett av Bergkamp og hans egen forklaring av målet mot Leicester i 1997 gir et separat kildebelagt eksempel på samordning av løp, kontroll og avslutning. Førsteberøringen kan enten beskytte ballen, legge den til rette for neste pasning eller fjerne en forsvarer. Observasjonsoppgave: vurder forsvarerens avstand og retning før mottak, muligheten for støtte og om neste handling bør være egen vending eller pasning videre. I en opp–tilbake–gjennom-kombinasjon er den møtende spilleren ikke nødvendigvis den som får siste pasning.",
        "source": "Faglig tillegg – PDF linje 3458–3467; Premier League, https://www.premierleague.com/en/news/2147353 ; https://www.premierleague.com/en/news/2737302; personnavn og eventuelle mønstre fra Fotballdokumentet v1.pdf"
      },
      {
        "id": "portrait_drogba_lukaku",
        "title": "Didier Drogba og Romelu Lukaku – fysisk kapasitet i spissens støtteoppgave",
        "text": "Premier League fremhever Drogbas kombinasjon av kraft, fart og ferdigheter, og beskriver Lukakus evne til å holde forsvarere unna ballen i boksen. Casene brukes til å skille mellom å skjerme ballen, vinne en duell og gjøre neste handling tilgjengelig for en medspiller. En spiss kan ta imot under press, vende dersom rommet åpnes eller legge igjen ballen dersom støtte er tilgjengelig. Styrke er et fysisk grunnlag; valg av kroppsstilling, timing og lovlig kontakt avgjør hvordan den anvendes. I kampanalyse bør man skille mellom mottak med forsvarer i ryggen og mottak på løp. Dette er ikke identiske spillerprofiler eller en rangering av duellstyrke.",
        "source": "Faglig tillegg – Premier League, https://www.premierleague.com/en/events/hall-of-fame/inductees/didier-drogba ; https://www.premierleague.com/en/news/2211857; personnavn og tematikk fra Fotballdokumentet v1.pdf"
      },
      {
        "id": "portrait_di_stefano",
        "title": "Alfredo Di Stéfano – leder og forbindelsesspiller",
        "text": "Real Madrids historiske portrett fremhever Di Stéfanos ledende rolle i klubbens fem første europacuptriumfer. Originalmanuset plasserer ham blant ledere og allroundere. Bruk kampfilm til å undersøke hvordan en angriper kan knytte sammen midtbane og angrep: når møter han ballen, når må han selv true mål, og hvem overtar rommet han forlater? Dette er en observasjonsramme, ikke en påstand om at han alltid utførte én bestemt rolle eller spilte med dagens taktiske begreper.",
        "source": "Faglig tillegg – Real Madrid, https://www.realmadrid.com/en-US/the-club/history/football-legends/alfredo-di-stefano-laulhe; personnavn fra Fotballdokumentet v1.pdf"
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
      },
      {
        "id": "portrait_strandli",
        "title": "Frank Strandli – spissens avslutningsoppgave",
        "text": "Branns historiske spillerregister dokumenterer Strandlis målbidrag i klubben: 13 mål på 30 kamper i to sesonger. Bruk caset til å skille mellom spissens registrerte resultat og de handlingene som skaper avslutningsmuligheter. Kampfilm kan undersøkes for startposisjon, bevegelse mot ball eller bakrom, plassering ved innlegg og valg av avslutningsteknikk. Målstatistikken alene dokumenterer ikke hvordan disse situasjonene ble løst, og brukes derfor ikke til å fastsette duellstyrke eller en bestemt spissprofil i motoren.",
        "source": "Faglig tillegg – SK Brann Historie, https://historie.brann.no/spillere/frank-strandli/; personnavn fra Fotballdokumentet v1.pdf"
      },
      {
        "id": "portrait_meazza_eusebio",
        "title": "Giuseppe Meazza og Eusébio – avslutninger i forskjellige epoker",
        "text": "Det italienske fotballforbundet dokumenterer Meazza som verdensmester i 1934 og 1938. FIFA beskriver Eusébios ni mål i VM 1966, inkludert fire i kvartfinalen mot Nord-Korea. Bruk de historiske holdepunktene til å velge kampmateriale for analyse av avslutningsrom, bevegelse og teknikk. Målrekorder kan ikke alene vise om spilleren var best til å løpe i bakrom, kombinere eller avslutte under press. Sammenligning på tvers av epoker må også ta hensyn til lagets organisering og kampens betingelser.",
        "source": "Faglig tillegg – FIGC, https://www.figc.it/it/full-html?path=%2Fmuseo-del-calcio%2Fhall-of-fame%2Friconoscimenti-alla-memoria%2Fgiuseppe-meazza ; FIFA, https://www.fifa.com/en/tournaments/mens/worldcup/articles/portugal-korea-dpr-eusebio-england-1966; personnavn fra Fotballdokumentet v1.pdf"
      },
      {
        "id": "portrait_van_basten",
        "title": "Marco van Basten – avslutning før forsvar og keeper rekker å justere",
        "text": "Originalmanuset nevner Van Basten som avslutter og som mottaker ved tredjemannsbevegelse i Sacchis Milan. Den konkrete historiske pasningssekvensen er ikke verifisert. UEFA dokumenterer derimot volleyavslutningen fra skrå vinkel etter Arnold Mührens innlegg i EM-finalen 1988. Van Basten beskriver selv avveiningen mellom å kontrollere ballen og avslutte direkte. Faglig er caset egnet til å undersøke om ballbanen, kroppsstillingen, keeperens posisjon og forsvarspresset gir grunnlag for direkte skudd eller om mottak først er bedre. En vanskelig vellykket avslutning er ikke ensbetydende med at det samme valget alltid har høyest forventet verdi.",
        "source": "Faglig tillegg – PDF linje 3443–3447; UEFA, https://www.uefa.com/uefaeuro/history/news/0252-0ce2a8e3dd0f-2b753b1365a3-1000--marco-van-basten-on-euro-1988-and-that-volley/ ; https://www.uefa.com/uefaeuro/history/news/025d-0f859f66fcba-c8d3aa08dfa3-1000--classics-soviet-union-vs-netherlands-1988/; personnavn og eventuelle mønstre fra Fotballdokumentet v1.pdf"
      },
      {
        "id": "portrait_shearer",
        "title": "Alan Shearer – gjentatte løp, duell og avslutningsberedskap",
        "text": "Manuset fremhever løp uten ball, blindside og angrep av rom bak linjen ved å vise til Shearer. Det oppgir imidlertid 13 løp per sjanse ett sted og 13 løp per ballkontakt et annet sted. Tallet er derfor utelatt som empirisk påstand. Premier Leagues historiske kampklipp viser blant annet en scoring mot Portsmouth der Shearer vinner en luftduell, mottar retur fra en medspiller og kontrollerer ballen før avslutning. Caset kan brukes til å studere hvordan en spiss forbereder neste handling allerede i duellen. I analysen bør også løp som ikke får pasning registreres, dersom de binder forsvarere eller skaper rom for andre. Ingen fast norm for antall løp eller spissverdi innføres.",
        "source": "Faglig tillegg – PDF linje 2199–2205 og 2446–2451; Premier League, https://www.premierleague.com/en/news/846527 ; https://www.premierleague.com/en/news/845999; personnavn og eventuelle mønstre fra Fotballdokumentet v1.pdf"
      },
      {
        "id": "portrait_haaland",
        "title": "Erling Braut Haaland – bakromstrussel og angrep av avslutningssoner",
        "text": "Haaland er navngitt i originaldisposisjonen uten et utfylt portrett. Premier Leagues analyse fra 2022 beskriver hvordan Manchester City tilpasset oppbygging og leveringer etter at Haaland ble lagets spiss, blant annet gjennom De Bruynes innlegg. FIFA Training Centre beskriver løp bak siste forsvarsledd som et eget mottaksmønster. Faglig er trusselen todelt: spissen kan selv motta bak linjen, eller påvirke forsvarslinjens dybde slik at en medspiller får rom foran den. Ved innlegg må han vurdere leveringsbane, stopperens orientering og tidspunktet for å angripe rommet. Observer løp mot første eller bakre sone og om spilleren justerer seg etter ballførerens muligheter. Dette er en ny analyseoppgave, ikke dokumentasjon av alle Haalands individuelle løpsmønstre.",
        "source": "Faglig tillegg – PDF Del II, linje 273–276; Premier League, https://www.premierleague.com/en/news/2915555 ; FIFA Training Centre, https://www.fifatrainingcentre.com/en/resources-tools/football-language/in-possession/movement-to-receive/index.php; personnavn og eventuelle mønstre fra Fotballdokumentet v1.pdf"
      },
      {
        "id": "portrait_henry",
        "title": "Thierry Henry – fart, venstresidig utgangsposisjon og gjennombrudd",
        "text": "Premier League beskriver hvordan Wenger gjorde Henry til spiss etter at han hadde spilt på kanten, og hvordan han fortsatte å true fra venstre. Originalmanusets Bergkamp–Henry-eksempel viser hvorfor fart må ses sammen med pasning og løp. En spiss som starter utenfor stopperen kan angripe diagonalt når ballføreren får tid, mens en møtende medspiller skaper et alternativ foran linjen. Observer om løpet gir separasjon før pasningen og om førsteberøringen bevarer farten. Ren toppfart forklarer ikke alene gjennombruddet; startposisjon, forsvarerens orientering og timing er også viktige.",
        "source": "Faglig tillegg – PDF 3458–3467; Premier League, https://www.premierleague.com/en/events/hall-of-fame/inductees/thierry-henry; personnavn og tematikk fra Fotballdokumentet v1.pdf"
      },
      {
        "id": "portrait_ronaldo_nazario",
        "title": "Ronaldo Nazário – avslutningsteknikk og tilbakekomst",
        "text": "FIFA beskriver Ronaldo som en teknisk og spilleintelligent spiss og dokumenterer hans to mål i VM-finalen i 2002. Ved det andre målet lot Rivaldo pasningen passere, før Ronaldo kontrollerte og avsluttet. Studer hvordan den første handlingen etter ballmottak skaper en brukbar skuddvinkel og hvordan medspillerens bevegelse påvirker forsvaret. Lagkameraten Kleberson beskriver også arbeidet for å få Ronaldo fysisk klar til turneringen. Det illustrerer at tilgjengelig fysisk kapasitet og fotballteknikk må fungere sammen, men gir ikke grunnlag for å kopiere et individuelt rehabiliteringsopplegg eller forklare tilbakekomsten med mentalitet alene.",
        "source": "Faglig tillegg – FIFA, https://inside.fifa.com/tournaments/mens/worldcup/2018russia/news/march-30-countdown-76-days-2935205 ; https://www.fifa.com/pt/tournaments/mens/worldcup/canadamexicousa2026/articles/seis-herois-das-finais-das-copas-do-mundo ; https://www.fifa.com/en/articles/kleberson-brazil-2002-fifa-world-cup-interview; personnavn og tematikk fra Fotballdokumentet v1.pdf"
      },
      {
        "id": "portrait_cristiano_heading",
        "title": "Cristiano Ronaldo – spenst, tilløp og timing ved heading",
        "text": "Originalmanuset nevner Cristiano Ronaldo særskilt ved spenst. UEFA dokumenterer headingen i EM-semifinalen mot Wales i 2016 og fremhever hoppet ved scoringen. Caset kan brukes til å analysere hvordan en angriper finner plass for sats, følger ballbanen og møter ballen i riktig øyeblikk. Spenst alene avgjør ikke luftduellen: innleggets kvalitet, forsvarerens plassering og spillerens timing må vurderes sammen. Det innføres ingen udokumenterte målinger av hopphøyde eller faste headingverdier. Praktisk trening skal følge gjeldende aldersregler og klubbens sikkerhetsrutiner.",
        "source": "Faglig tillegg – UEFA, https://www.uefa.com/uefaeuro/match/2017905--portugal-vs-wales/events/; personnavn og tematikk fra Fotballdokumentet v1.pdf"
      },
      {
        "id": "portrait_romario",
        "title": "Romário – avslutning med begrenset tid og rom",
        "text": "FIFA beskriver Romários tåavslutning mot Nederland i VM 1994 og Jorginhos innlegg til hans avgjørende scoring mot Sverige. De to eksemplene illustrerer at avslutningsteknikken må tilpasses situasjonen. En rask tåavslutning kan være aktuell når det er liten tid til tilløp, mens en mottaker ved innlegg må lese ballbanen og finne et egnet treffpunkt. Undersøk hvorfor en bestemt teknikk er hensiktsmessig i den aktuelle situasjonen. Ikke behandle Romários valg som en universell regel for avslutninger i boksen.",
        "source": "Faglig tillegg – FIFA, https://www.fifa.com/en/tournaments/mens/worldcup/articles/netherlands-brazil-dallas-usa-1994 ; https://www.fifa.com/en/tournaments/mens/worldcup/articles/jorginho-brazil-usa-1994; personnavn fra Fotballdokumentet v1.pdf"
      },
      {
        "id": "portrait_kanu_ravanelli",
        "title": "Kanu og Fabrizio Ravanelli – avslutning når kampbildet endres",
        "text": "Premier League dokumenterer Kanus hattrick i Arsenals opphenting fra 0–2 mot Chelsea i 1999. UEFA dokumenterer Ravanellis scoring fra svært skrå vinkel i europacupfinalen i 1996 etter at han utnyttet en feil i Ajax-forsvaret. Bruk situasjonene til å undersøke hvordan en spiss registrerer nye muligheter etter en feil, et nedfall eller en endret kampstilling. Når skuddvinkelen er liten, må spilleren vurdere om direkte skudd, kontroll eller pasning er mest hensiktsmessig. Casene illustrerer konkrete kampbegivenheter, ikke generelle sannsynligheter for avslutning.",
        "source": "Faglig tillegg – Premier League, https://www.premierleague.com/en/news/2284536/black-history-month-heroes-nwankwo-kanu ; UEFA, https://www.uefa.com/uefachampionsleague/news/013d-0ea96a4b53b8-032c0735e213-1000--juventus-hold-their-nerve-to-seal-the-real-deal/; personnavn fra Fotballdokumentet v1.pdf"
      },
      {
        "id": "onenote_owen_torres",
        "title": "Michael Owen og Fernando Torres – gjennombrudd og avslutningsvalg",
        "text": "OneNote fremhever Owens gjennombrudd i VM 1998 og Torres’ avgjørende mål i EM-finalen 2008. FIFA dokumenterer Owens sololøp mot Argentina, mens UEFA beskriver hvordan Torres kom foran Philipp Lahm og avsluttet over Jens Lehmann. De to kampøyeblikkene gir et utgangspunkt for å undersøke fart i forhold til ballbane, motstanderens orientering og avslutningsvalg. Manusets senere beskrivelser av karrierefall er fortolkninger. Enkeltmål kan ikke dokumentere en spillers samlede fysiske kapasitet, og formsvikt kan ikke forklares med antatte nerver eller personlige egenskaper uten kildegrunnlag.",
        "source": "OneNote – Fotballteori (Den 12.06.2026).one, råuttrekk 0x001aa274–0x001aa554, 0x001ab2b4–0x001ab644; FIFA, https://inside.fifa.com/tournaments/mens/worldcup/1998france/news/world-cup-at-home-argentina-england-1998-3070883 ; UEFA, https://www.uefa.com/uefaeuro/history/news/0253-0d7c89c87906-4e5d5cebef3e-1000--spain-deliver-on-promise-at-last/"
      },
      {
        "id": "onenote_rossi_shevchenko_adriano",
        "title": "Paolo Rossi, Sjevtsjenko og Adriano – karrierens dokumenterte holdepunkter",
        "text": "Manusets karrierefortellinger inkluderer Paolo Rossi, Andrij Sjevtsjenko og Adriano. FIFA dokumenterer Rossis seks mål i VM 1982, UEFA Sjevtsjenkos Ballon d’Or i 2004, og Inter Adrianos klubbkarriere. Disse holdepunktene viser hvorfor spillerne fikk en sentral plass i fotballhistorien. De dokumenterer derimot ikke at karrierene deres var identiske eller at et senere klubbskifte nødvendigvis skyldtes bestemte psykologiske forhold. Paolo Rossi og Giuseppe Rossi er forskjellige spillere, med ulike karriereforløp. Bruk portrettene som historiske innganger til kampanalyse, ikke som grunnlag for hypotetiske toppverdier eller medisinske prognoser.",
        "source": "OneNote – Fotballteori (Den 12.06.2026).one, råuttrekk 0x001a48f4, 0x001a9b94, 0x001ac3f4–0x001ac51c; FIFA, https://inside.fifa.com/tournaments/mens/worldcup/1982spain/news/world-football-pays-tribute-to-pablito ; UEFA, https://www.uefa.com/news-media/news/01a4-0e108f265ffc-7d37e0988b22-1000--shevchenko-takes-ballon-d-or/ ; Inter, https://www.inter.it/en/archivio_giocatore/G0726"
      }
    ]
  }
];
