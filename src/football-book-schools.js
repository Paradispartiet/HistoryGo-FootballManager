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
    ],
    "sourceDetails": [
      {
        "id": "history_total",
        "title": "Totalfotball – kollektiv intelligens og rollebytter",
        "text": "Manuset beskriver laget som en levende organisme: når en back går frem, overtar en medspiller rommet; når spissen møter, kan en kant angripe boksen. Cruyff er et eksempel på teknikk, orientering og rolleflyt. UEFA knytter Michels og Cruyff til Ajax og Nederlands totalfotball på 1970-tallet og nevner Ungarns magiske lag og Jack Reynolds' Ajax som forløpere. Rollebytter forutsetter fortsatt balanse, bredde og dybde. Friheten er organisert, ikke tilfeldig.",
        "source": "Fotballdokumentet v1.pdf – Del I – Cruyff og totalfotballen; UEFA, https://www.uefa.com/uefachampionsleague/news/0230-0e94a8068d01-a93b114660e2-1000--in-profile-rinus-michels/"
      },
      {
        "id": "history_collective_cognition",
        "title": "Fra individuell briljans til kollektiv intelligens",
        "text": "Manuset fremhever at spillere må tolke medspillernes intensjoner, overvåke motstanderen og samordne rollebytter, pasninger og press. Teknikk, hukommelse, sansing og reaksjon knyttes til rytme, timing og rom. Taktiske systemer stiller krav til teknikk, men gjør også ferdighetene mer anvendelige når medspillerne skaper alternativer. Dette er manusets samlende tese, ikke en påstand om at tidligere spillere manglet spilleforståelse eller at historien har én entydig utviklingsretning.",
        "source": "Fotballdokumentet v1.pdf – Sportsvitenskap og fysiologi – Kognitive ferdigheter og psykologiske krav"
      },
      {
        "id": "culture_art_results",
        "title": "Estetikk og resultater – kunst og nytte",
        "text": "Originalmanuset åpner filosofidelen med spenningen mellom futebol d’arte og futebol de resultados: å spille vakkert eller å vinne. Zidane, Ronaldinho og Maradona illustrerer i manuset den uttrykksfulle teknikken; Xavi, Kroos og Busquets representerer rytme, funksjon og kollektiv kontroll. Dette er analytiske poler, ikke en rangering av spillerne. En elegant kombinasjon kan samtidig være effektiv, og en presis defensiv bevegelse kan også ha estetisk verdi. Manusets sentrale tese er at fotballens skjønnhet oppstår i spenningen mellom frihet og struktur, ikke utenfor taktikken.",
        "source": "Fotballdokumentet v1.pdf – Del IV – Estetikk og resultater / Avslutning: Estetikk som grunnvilkår"
      },
      {
        "id": "culture_adorno",
        "title": "Adorno – kunstens autonomi og instrumentell rasjonalitet",
        "text": "Manuset anvender Adornos estetiske tenkning på fotballens spenning mellom kunstnerisk frihet og instrumentell nytte. Futebol d’arte får representere rom for uttrykk som ikke kan reduseres til resultat alene, mens futebol de resultados fremhever virkemidler for å oppnå seier. Adornos faktiske teori om kunstens autonomi er mer sammensatt enn dette skillet. Det er derfor uttrykkelig en fotballfilosofisk anvendelse i manuset, ikke et sitat eller en påstand om at Adorno selv analyserte disse spillestilene. Trenerens dilemma blir hvor mye frihet en kollektiv struktur kan romme.",
        "source": "Fotballdokumentet v1.pdf – Del IV – Filosofi og estetikk; Stanford Encyclopedia of Philosophy, https://plato.stanford.edu/entries/adorno/"
      },
      {
        "id": "culture_eco",
        "title": "Eco – det åpne verket og publikums fortolkning",
        "text": "Med utgangspunkt i Ecos idé om det åpne verket drøfter manuset hvordan fotballens mening oppstår også i møtet med publikum. En bevegelse, pasning eller kamp kan forstås forskjellig av ulike tilskuere, og får videre mening gjennom kommentarer og erindring. Estetikk er dermed ikke bare en objektiv egenskap ved en teknisk handling. Dette er manusets analogi mellom kunst og fotball, ikke en gjengivelse av Ecos egne analyser av bestemte kamper. Den åpne fortolkningen opphever heller ikke spillets regler eller det faktiske kampresultatet.",
        "source": "Fotballdokumentet v1.pdf – Del IV – Teoretiske perspektiver / Umberto Eco"
      },
      {
        "id": "culture_gadamer",
        "title": "Gadamer – lekens egenverdi",
        "text": "Manuset bruker Gadamers forståelse av lek for å drøfte fotballens estetiske erfaring. Spillerne deltar i et spill som har egen dynamikk og som ikke fullt ut kan kontrolleres av individet. Tilskuerne deltar på en annen måte gjennom opplevelse og fortolkning. Gadamers estetikk knytter lek til erfaringen av kunst og forståelse; koblingen til fotball er manusets egen anvendelse. Å vinne er fortsatt et reelt mål, men opplevelsen av spillet kan ha verdi utover sluttresultatet. Lek må derfor ikke forveksles med mangel på alvor eller disiplin.",
        "source": "Fotballdokumentet v1.pdf – Del IV – Filosofiske utdypinger / Gadamer; Stanford Encyclopedia of Philosophy, https://plato.stanford.edu/entries/gadamer-aesthetics/"
      },
      {
        "id": "culture_aristotle",
        "title": "Aristoteles – poiesis og praxis",
        "text": "Manuset bruker poiesis og praxis som analogi for skapende uttrykk og målrettet handling i fotball. Filosofisk må skillet presiseres: poiesis viser til frembringelse eller produksjon, mens praxis betegner handling; det er ikke en enkel motsetning mellom egenverdi og seier. Manusets kobling av futebol d’arte til poiesis og futebol de resultados til praxis bevares som en fortolkningsidé, ikke som en bokstavelig definisjon hos Aristoteles. Fotball kan romme både skapende handlinger og målrettede prestasjoner samtidig.",
        "source": "Fotballdokumentet v1.pdf – Del IV – Filosofiske utdypinger / Aristoteles; Stanford Encyclopedia of Philosophy, https://plato.stanford.edu/entries/episteme-techne/"
      },
      {
        "id": "culture_synthesis",
        "title": "Estetikk som grunnvilkår – struktur og brudd",
        "text": "Originalmanusets avslutning samler perspektivene: kunstens egenverdi, publikums fortolkning, sosialt formet teknikk, regulert konkurranse og lek. Tesen er at estetikk ikke bare er et tillegg til taktikk, men en del av fotballens indre spenning mellom frihet og kontroll, individ og kollektiv, kunst og nytte. Dette er bokas normative og filosofiske refleksjon, ikke et empirisk bevist krav for alle kamper. En manager kan derfor både spørre hvordan laget kan vinne, og hvilken måte å spille på laget ønsker å utvikle. De to spørsmålene kan besvares ulikt uten at det ene nødvendigvis opphever det andre.",
        "source": "Fotballdokumentet v1.pdf – Del IV – Avslutning: Estetikk som grunnvilkår / Del V – System vs. individ / Arven"
      },
      {
        "id": "portrait_cruyff_michels",
        "title": "Cruyff og Michels – spiller og trener i samme taktiske tradisjon",
        "text": "Originalmanuset beskriver Cruyff som symbol på rolleflyt, oversikt og rytme. UEFA dokumenterer Michels' trenerarbeid og Cruyffs sentrale rolle i Ajax' totalfotball. Den praktiske lærdommen er å se hvordan laget overtar et rom som en spiller forlater; en spiller kan bryte forventet posisjon uten at hele organiseringen bryter sammen. Det er forskjell på Michels' arbeid som trener og Cruyffs senere trenerarv. Manusets uverifiserte personanekdoter er ikke tatt inn som biografiske fakta.",
        "source": "Fotballdokumentet v1.pdf – Del I – Cruyff og totalfotballen; UEFA, https://www.uefa.com/uefachampionsleague/news/0253-0d7ff54908f6-5927d0a16600-1000--the-greatest-teams-of-all-time-ajax-1971-73/"
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
    ],
    "sourceDetails": [
      {
        "id": "history_catenaccio",
        "title": "Catenaccio – kontroll og kontring",
        "text": "Manuset bruker Herreras Inter som eksempel på stram organisering kombinert med raske kontringer. UEFA beskriver hvordan laget utnyttet tekniske midtbanespillere og hurtige angripere i overgang. Sikring kan forberede en presis offensiv overgang; forsvar er ikke nødvendigvis passivitet. Dette viderefører bokas skille mellom libero- og markeringsstrukturen i catenaccio og en moderne lav soneblokk. Kilden gir ikke grunnlag for bestemte oppspillsruter eller kvantitative kampverdier.",
        "source": "Fotballdokumentet v1.pdf – Del I – Italiensk catenaccio og sweeper-logikken; UEFA, https://www.uefa.com/uefachampionsleague/news/0231-0e94dd0ff999-827e03392bff-1000--in-profile-helenio-herrera/"
      },
      {
        "id": "culture_pragmatism",
        "title": "Resultatfotball og estetikkens historiske dilemma",
        "text": "Manuset stiller den brasilianske angrepstradisjonen og Nederlands totalfotball opp mot mer resultatorienterte systemer, særlig italiensk catenaccio. Det bruker Brasils VM i 1982 og de nederlandske finaletapene i 1974 og 1978 som historiske refleksjonspunkter. Slike kampresultater kan illustrere at estetisk appell ikke garanterer seier, men alene forklarer de ikke hvorfor et lag taper. Å organisere sikring, vente på riktig overgang og forvalte risiko kan være en avansert fotballfaglig praksis. Skillet er manusets drøfting av verdier, ikke en universell klassifisering av nasjoner eller trenere.",
        "source": "Fotballdokumentet v1.pdf – Del IV – Estetikk og resultater"
      },
      {
        "id": "portrait_herrera",
        "title": "Helenio Herrera – organisering og overgang",
        "text": "Originalmanuset fremhever Herreras Inter som eksempel på defensiv struktur og raske kontringer. Den faglige analysen bør undersøke hvordan markering og en fri sikringsspiller henger sammen med muligheten til å starte angrep etter ballvinning. Herrera er allerede plassert i bokas catenaccio-kapittel; dette portrettet presiserer trenerens funksjon som case, ikke en påstand om at han oppfant alle prinsippene. Manusets planlagte sitat om vinnermentalitet er ikke dokumentert i den bevarte teksten.",
        "source": "Fotballdokumentet v1.pdf – Del I – Italiensk catenaccio / 7. Det mentale aspektet"
      },
      {
        "id": "portrait_mourinho",
        "title": "José Mourinho – kampbilde, risiko og overgang",
        "text": "Manuset navngir Mourinho ved kontroll og kontring. UEFA dokumenterer to forskjellige kampbilder fra Inters semifinale mot Barcelona i 2010: hjemmeseier 3–1 og et 0–1-tap på bortebane etter utvisning, som likevel ga avansement. Det første oppgjøret viser at organisering kan kombineres med offensiv overgang; det andre viser hvordan kampstilling, samlet resultat og numerisk undertall kan endre risikovalget. Undersøk hvilke rom laget beskytter, hvilken støtte det har ved ballvinning og når det er mulig å true bakrom. En moderne defensiv blokk er ikke automatisk historisk catenaccio. Caset begrunner ikke en fast defensiv spillestil for alle Mourinhos lag.",
        "source": "Faglig tillegg – UEFA, https://www.uefa.com/uefachampionsleague/news/01e4-0e745dd6d8b8-559388d26824-1000--impressive-inter-leave-barca-on-the-ropes/ ; https://www.uefa.com/uefachampionsleague/news/01e4-0e746dee4629-e22f0b2f81cf-1000--barcelona-dethroned-by-resilient-inter/; navn og tema fra Fotballdokumentet v1.pdf"
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
    ],
    "sourceDetails": [
      {
        "id": "history_intensity",
        "title": "Moderne fotball – teknikk under press",
        "text": "Originalmanuset knytter Klopps lag til umiddelbar gjenvinning og intensitet. Mottak, pasninger, vendinger og orientering må fungere i fart og trange rom. FIFA Training Centre beskriver gjenvinningspress som en mulighet til å starte et nytt angrep før motstanderen organiserer seg. Støtteavstand og restforsvar før balltap påvirker om gjenvinning er realistisk. Dette innebærer ikke at Klopp oppfant gjenvinningspress eller at det alltid er riktig. Stormpress og selektivt press står som fordypningstemaer i manusets disposisjon.",
        "source": "Fotballdokumentet v1.pdf – Del V – Moderne krav / Klopp og gegenpressing; FIFA Training Centre, https://www.fifatrainingcentre.com/en/practice/elite-sessions/transition-to-defending/counter-pressing.php"
      },
      {
        "id": "portrait_klopp",
        "title": "Jürgen Klopp – kollektiv gjenvinning og teknikk under press",
        "text": "Originalmanuset knytter Klopp til Borussia Dortmund og Liverpool og beskriver koordinert press umiddelbart etter balltap. Det understreker at pasning, mottak og orientering må fungere i fart og under motstand. Trenercaset brukes til å undersøke nærmeste spilleres press og resten av lagets dekning, ikke til å gi én trener æren for å oppfinne gjenvinningspress. Ralf Rangnick og Thomas Tuchel er navngitt som planlagte fordypninger, men kilden gir ikke tilsvarende utførlige portretter av dem.",
        "source": "Fotballdokumentet v1.pdf – Del V – Klopp og gegenpressing / Moderne mestre, linje 4557–4623"
      },
      {
        "id": "portrait_rangnick",
        "title": "Ralf Rangnick – kollektiv intensitet og høyt press",
        "text": "Originaldisposisjonen plasserer Rangnick som en moderne trenerarkitekt knyttet til presskolen. UEFA omtaler hans betydning for gegenpressing og fremhever Østerrikes effektive høye press i gruppespillet i EM 2024. Høyt press mot etablert oppbygging må skilles fra umiddelbar gjenvinning etter eget balltap. Begge forutsetter at spillere nær ballen og spillere lenger unna samordner sine arbeidsoppgaver. Observer hvem som setter press, hvilke pasningsalternativer som dekkes og hvordan laget beskytter rom bak presset. Ved manglende sikring kan en lavere utgangsposisjon være mer hensiktsmessig. Det innføres ingen fast tidsgrense eller pressverdi knyttet til Rangnick.",
        "source": "Faglig tillegg – UEFA, https://www.uefa.com/uefaeuro/history/news/028d-1b058a1a388d-5665645fc203-1000--uefa-euro-2024-meet-the-24-teams/ ; https://www.uefa.com/uefaeuro/history/news/028e-1b3f9d965e00-3ec1a6f8adb9-1000--euro-2024-group-stage-uefa-technical-observers-tactical-r/; navn og tema fra Fotballdokumentet v1.pdf"
      },
      {
        "id": "onenote_selective_press",
        "title": "Stormpress og selektivt press – når presset selv åpner rom",
        "text": "I den utvidede teoriteksten argumenteres det mot ukritisk stormpress: flere spillere som går samtidig kan både stenge og åpne rom. Den fremhever feiltouch, bakoverpasning og feilvendt ballfører som signaler for selektivt press. Den beskriver også hvordan en motstander kan utnytte rom som oppstår når flere forlater sine posisjoner. Dette er manusets kritiske perspektiv på systemfotball, ikke dokumentasjon av at alle navngitte historiske lag alltid presset selektivt. Bruk perspektivet sammen med bokas eksisterende regler for press, sikring og gjenvinning.",
        "source": "OneNote – Fotballteori (Den 12.06.2026).one, råuttrekk 0x00067614, 0x00073bd4 og 0x000751cc"
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
    ],
    "sourceDetails": [
      {
        "id": "history_cruyff_barca",
        "title": "Fra Cruyff til Barcelona – kontinuitet og endring",
        "text": "Manuset fører en linje fra nederlandsk totalfotball til Barcelonas posisjonsspill. Cruyffs trenerarbeid er viktig, men påstanden om at han etablerte La Masia er korrigert: Barcelonas egen historie dokumenterer at spillerboligen åpnet i 1979, før han ble trener. Taktisk kontinuitet handler om orientering, rom, pasningsvinkler og kollektiv bevegelse. Totalfotball, tiki-taka og juego de posición er ikke identiske, og klubbens institusjonelle historie må skilles fra trenernes bidrag.",
        "source": "Fotballdokumentet v1.pdf – Del I – Cruyff og totalfotballen / Del II – Totalfotball og moderne kollektivitet; FC Barcelona, https://www.fcbarcelona.com/en/news/1457129/la-masia-is-40-years-old/amp"
      },
      {
        "id": "history_keeper",
        "title": "Positional play 2.0 – keeper som aktivt oppspillsledd",
        "text": "Manuset fremhever keeperens pasningsferdighet, orientering og evne til å åpne rom bak press, med Ederson som eksempel. FIFA Training Centre beskriver moderne keeperstøtte, mottak og pasninger gjennom press. Positional play 2.0 beholdes som manusets analytiske betegnelse. Påstanden om at Guardiola først integrerte keeperen i oppbyggingen tas ikke videre: FIFA beskriver eksempelvis Ungarns Gyula Grosics som en tidligere nyskapende ballspillende keeper.",
        "source": "Fotballdokumentet v1.pdf – Del V – Guardiola og positional play 2.0; FIFA Training Centre, https://www.fifatrainingcentre.com/en/practice/elite-sessions/goalkeeper/goalkeepersbuildup.php ; FIFA, https://www.fifa.com/en/articles/gyula-grosics-hungary-goalkeeping-legacy"
      },
      {
        "id": "portrait_guardiola_ederson",
        "title": "Guardiola og Ederson – romkontroll med elleve spillere",
        "text": "Manuset bruker Guardiolas posisjonsspill og Ederson som eksempel på keeperens rolle i pasningsstrukturen. Manchester City beskriver keeperens evne til å starte angrep både kort og langt. Fotballfaglig kan keeperens involvering gi en ekstra pasningsmulighet og tvinge motstanderen til å velge hvilke rom den skal dekke. Det betyr ikke at oppbygging alltid må være kort. Manuset omtaler dette som positional play 2.0; uttrykket beholdes som manusets egen analytiske betegnelse. Ingen nye spillerverdier eller faste oppspill utledes av trenercaset.",
        "source": "Fotballdokumentet v1.pdf – Del V – Guardiola og positional play 2.0, linje 4591–4617; Manchester City, https://www.mancity.com/news/mens/ederson-fulham-preview-premier-league-63863644"
      },
      {
        "id": "onenote_structure_break",
        "title": "Systemkritikk – når den skapende spilleren bryter mønsteret",
        "text": "Den utvidede OneNote-teksten utdyper spenningen mellom en kollektiv pasningsstruktur og den kreative midtbanespilleren. Den argumenterer for at spilleren må kunne se når et mønster bør brytes, og fremhever stopp i rytmen, vending inn i press og uventede handlinger. Manusets vurderinger av konkrete treneres begrensning av kreativiteten er fortolkninger, ikke selvstendig dokumenterte årsakspåstander. Faglig beholdes dilemmaet: en struktur skaper forutsigbare støttepunkter, samtidig som spilleren kan oppdage en bedre løsning enn den avtalte. Det er ingen ny instruks om å avvike fra lagets plan i alle situasjoner.",
        "source": "OneNote – Fotballteori (Den 12.06.2026).one, råuttrekk 0x00067d24, 0x000683fc, 0x000754d4 og 0x00075c94"
      },
      {
        "id": "onenote_rhythm_space",
        "title": "Rom og rytme – kontroll gjennom skiftende tempo",
        "text": "En kort teoriblokk kontrasterer totalfotballens fleksible rom med moderne fotballs rytmiske rom, der tempo må varieres og ikke bare strukturen kontrolleres. Dette er manusets analytiske bilde, ikke en uttømmende historisk forskjell mellom epokene. Det gir et spørsmål til kampobservasjonen: når bør ballen sirkuleres for å flytte motstanderen, når bør laget akselerere mot en åpning, og når er det riktig å holde igjen? Perspektivet knyttes til bokas eksisterende ballbesittelses- og romkontrollprinsipper, uten å innføre faste tempovekter.",
        "source": "OneNote – Fotballteori (Den 12.06.2026).one, råuttrekk 0x00032d94"
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
    ],
    "sourceDetails": [
      {
        "id": "culture_identity",
        "title": "Futebol d’arte – estetikk, identitet og kulturell selvhevdelse",
        "text": "Manuset drøfter futebol d’arte som mer enn en estetisk stil: det kan fungere som uttrykk for identitet og kulturell selvhevdelse i møte med andre fotballidealer. Brasil og Latin-Amerika brukes i refleksjonen, mens tysk fotball og Sommermärchen i 2006 står som kontrast. Dette er kulturelle fortellinger, ikke uttømmende beskrivelser av hele kontinenter. Manuset antyder at nasjonale selvbilder og verdsetting av spillestil kan endres. Det er ikke dokumentert her at tysk estetisk fotball først oppstod i 2006; den bastante påstanden gjengis derfor ikke. Relasjonisme er et eget nyere taktisk begrep, ikke synonymt med brasiliansk estetikk.",
        "source": "Fotballdokumentet v1.pdf – Del IV – Sosiokulturelle dimensjoner"
      }
    ]
  }
];
